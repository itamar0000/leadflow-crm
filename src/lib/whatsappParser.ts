import type { ServiceType, LeadSource } from "../types";

export interface ParsedField<T> {
  value: T;
  confidence: "high" | "medium" | "low";
}

export interface ParsedLead {
  name: ParsedField<string> | null;
  phone: ParsedField<string> | null;
  eventDate: ParsedField<string> | null; // YYYY-MM-DD
  service: ParsedField<ServiceType> | null;
  notes: string;
}

// Hebrew month names → month number (0-indexed)
const HEBREW_MONTHS: Record<string, number> = {
  ינואר: 0, פברואר: 1, מרץ: 2, אפריל: 3, מאי: 4, יוני: 5,
  יולי: 6, אוגוסט: 7, ספטמבר: 8, אוקטובר: 9, נובמבר: 10, דצמבר: 11,
  // Short forms
  "ינו׳": 0, "פבר׳": 1, "מרס": 2, "אפר׳": 3, "יונ׳": 5,
  "יול׳": 6, "אוג׳": 7, "ספט׳": 8, "אוק׳": 9, "נוב׳": 10, "דצמ׳": 11,
};

// Service keywords → ServiceType
const SERVICE_KEYWORDS: [RegExp, ServiceType][] = [
  [/איפור\s*כלה/, "איפור כלה"],
  [/איפור/, "איפור"],
  [/תסרוקת|עיצוב\s*שיער/, "תסרוקת"],
  [/צביע[הת]|גוונ/, "צביעה"],
  [/טיפול\s*שיער|קראטין|בוטוקס/, "טיפול שיער"],
  [/הארכ[הות]|תוספות/, "הארכות"],
];

// Event type keywords (for notes enrichment)
const EVENT_KEYWORDS: [RegExp, string][] = [
  [/חתונ[הת]/, "חתונה"],
  [/בת\s*מצווה/, "בת מצווה"],
  [/בר\s*מצווה/, "בר מצווה"],
  [/אירוס[יןה]/, "אירוסין"],
  [/סיום/, "סיום"],
  [/מסיב[הת]/, "מסיבה"],
  [/יומולדת|יום\s*הולדת/, "יום הולדת"],
  [/אירוע/, "אירוע"],
];

/**
 * Extract client name from WhatsApp chat text.
 * Patterns:
 *  1. "שלום, אני [NAME]" / "היי אני [NAME]"
 *  2. WhatsApp chat format: "[DD/MM/YYYY, HH:MM] NAME: ..."
 *  3. First non-system name from chat header
 */
function extractName(text: string): ParsedField<string> | null {
  // Pattern 1: Explicit introduction
  const introPattern = /(?:שלום|היי|הי|אהלן)[,،]?\s*(?:אני|שמי|זה|זאת)\s+([^\n,.!?]{2,20})/i;
  const introMatch = text.match(introPattern);
  if (introMatch) {
    return { value: introMatch[1].trim(), confidence: "high" };
  }

  // Pattern 2: WhatsApp chat format — first non-self message sender
  const chatLinePattern = /\[\d{1,2}[/.]\d{1,2}[/.]\d{2,4},?\s*\d{1,2}:\d{2}(?::\d{2})?\]\s*([^:]+?):/;
  const chatMatch = text.match(chatLinePattern);
  if (chatMatch) {
    const name = chatMatch[1].trim();
    // Skip system-like names
    if (name.length >= 2 && name.length <= 30 && !name.includes("+")) {
      return { value: name, confidence: "medium" };
    }
  }

  // Pattern 3: "- NAME:" format (alternate WhatsApp export)
  const altPattern = /\d{1,2}[/.]\d{1,2}[/.]\d{2,4}.*?-\s*([^:]+?):/;
  const altMatch = text.match(altPattern);
  if (altMatch) {
    const name = altMatch[1].trim();
    if (name.length >= 2 && name.length <= 30) {
      return { value: name, confidence: "medium" };
    }
  }

  return null;
}

/**
 * Extract Israeli phone number.
 * Formats: 05X-XXXXXXX, +972-5X-XXXXXXX, 9725XXXXXXXXX
 */
function extractPhone(text: string): ParsedField<string> | null {
  // Israeli mobile: 05X with various separators
  const patterns = [
    /(?:\+972|972)[\s-]?([5]\d)[\s-]?(\d{3})[\s-]?(\d{4})/,
    /(05\d)[\s-]?(\d{3})[\s-]?(\d{4})/,
    /(05\d)(\d{7})/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let phone: string;
      if (match[0].startsWith("+972") || match[0].startsWith("972")) {
        phone = `0${match[1]}-${match[2]}${match[3]}`;
      } else {
        phone = match[1].length === 3
          ? `${match[1]}-${match[2]}${match[3]}`
          : `${match[1]}-${match[2]}`;
      }
      return { value: phone, confidence: "high" };
    }
  }

  return null;
}

/**
 * Extract event/appointment date.
 * Formats: DD/MM/YYYY, DD.MM.YYYY, "ב-DD ל[month]", Hebrew date references
 */
function extractDate(text: string): ParsedField<string> | null {
  const currentYear = new Date().getFullYear();

  // Pattern 1: DD/MM/YYYY or DD.MM.YYYY
  const numericPattern = /(\d{1,2})[/.](\d{1,2})[/.](\d{2,4})/g;
  let numericMatch: RegExpExecArray | null;
  const candidates: { date: Date; confidence: "high" | "medium" }[] = [];

  while ((numericMatch = numericPattern.exec(text)) !== null) {
    const day = parseInt(numericMatch[1]);
    const month = parseInt(numericMatch[2]) - 1;
    let year = parseInt(numericMatch[3]);
    if (year < 100) year += 2000;

    const date = new Date(year, month, day);
    // Only future dates or dates within the next 2 years
    if (date > new Date() && date.getFullYear() <= currentYear + 2) {
      candidates.push({ date, confidence: "high" });
    }
  }

  // Pattern 2: "ב-DD ב[month]" or "DD ל[month]"
  const hebrewDatePattern = /(?:ב[- ]?)?(\d{1,2})\s*(?:ב|ל)([א-ת]+)/g;
  let hebrewMatch: RegExpExecArray | null;
  while ((hebrewMatch = hebrewDatePattern.exec(text)) !== null) {
    const day = parseInt(hebrewMatch[1]);
    const monthName = hebrewMatch[2].trim();
    const month = HEBREW_MONTHS[monthName];
    if (month !== undefined && day >= 1 && day <= 31) {
      let year = currentYear;
      const date = new Date(year, month, day);
      if (date < new Date()) {
        year++;
      }
      candidates.push({
        date: new Date(year, month, day),
        confidence: "medium",
      });
    }
  }

  // Return the earliest future date
  if (candidates.length > 0) {
    candidates.sort((a, b) => a.date.getTime() - b.date.getTime());
    const best = candidates[0];
    const yyyy = best.date.getFullYear();
    const mm = String(best.date.getMonth() + 1).padStart(2, "0");
    const dd = String(best.date.getDate()).padStart(2, "0");
    return { value: `${yyyy}-${mm}-${dd}`, confidence: best.confidence };
  }

  return null;
}

/**
 * Extract service type from keywords.
 */
function extractService(text: string): ParsedField<ServiceType> | null {
  for (const [pattern, service] of SERVICE_KEYWORDS) {
    if (pattern.test(text)) {
      return { value: service, confidence: "high" };
    }
  }
  return null;
}

/**
 * Extract event type keywords for notes enrichment.
 */
function extractEventType(text: string): string | null {
  for (const [pattern, eventType] of EVENT_KEYWORDS) {
    if (pattern.test(text)) {
      return eventType;
    }
  }
  return null;
}

/**
 * Main parser: takes raw WhatsApp chat text and returns parsed fields.
 */
export function parseWhatsAppChat(text: string): ParsedLead {
  const name = extractName(text);
  const phone = extractPhone(text);
  const eventDate = extractDate(text);
  const service = extractService(text);
  const eventType = extractEventType(text);

  // Build notes from event type and truncated original text
  let notes = "";
  if (eventType) {
    notes = `סוג אירוע: ${eventType}`;
  }

  // Add first meaningful line from the chat as context
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(
      (l) =>
        l.length > 10 &&
        !l.startsWith("[") &&
        !l.startsWith("‎") &&
        !/^\d{1,2}[/.]\d{1,2}/.test(l)
    );
  if (lines.length > 0) {
    const snippet = lines[0].slice(0, 120);
    notes = notes ? `${notes}\n${snippet}` : snippet;
  }

  return { name, phone, eventDate, service, notes };
}

/**
 * Determine the lead source — if it came from WhatsApp parser, it's WhatsApp.
 */
export function getParserSource(): LeadSource {
  return "whatsapp";
}
