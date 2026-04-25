import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLeadsStore } from "../store/useLeadsStore";
import { useAuth } from "../lib/auth";

const slides = [
  {
    key: "welcome",
    emoji: "💇‍♀️",
    gradient: "from-rose-400 to-pink-500",
  },
  {
    key: "pipeline",
    emoji: "📋",
    gradient: "from-pink-400 to-rose-500",
  },
  {
    key: "getStarted",
    emoji: "✨",
    gradient: "from-rose-500 to-red-400",
  },
];

export default function Onboarding() {
  const [current, setCurrent] = useState(0);
  const { t } = useTranslation();
  const { seedData, setOnboarded } = useLeadsStore();
  const { user } = useAuth();

  const handleFinish = () => {
    if (user) {
      seedData(user.id);
    }
    setOnboarded();
  };

  const handleNext = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    } else {
      handleFinish();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col">
      {/* Skip button */}
      <div className="flex justify-start p-4 pt-safe">
        <button
          onClick={handleFinish}
          className="text-warm-500 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-warm-100 transition-colors"
        >
          {t("onboarding.skip")}
        </button>
      </div>

      {/* Slides */}
      <div className="flex-1 flex items-center justify-center px-8 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -80 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="text-center max-w-sm"
          >
            {/* Emoji icon */}
            <div
              className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${slides[current].gradient} flex items-center justify-center mx-auto mb-8 shadow-lg`}
            >
              <span className="text-5xl">{slides[current].emoji}</span>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-warm-800 mb-3 leading-tight">
              {t(`onboarding.${slides[current].key}`)}
            </h2>

            {/* Description */}
            <p className="text-warm-500 text-base leading-relaxed">
              {t(`onboarding.${slides[current].key}Desc`)}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom section */}
      <div className="px-8 pb-12 space-y-6">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? "w-8 bg-rose-500"
                  : "w-2 bg-warm-300"
              }`}
            />
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={handleNext}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold text-lg shadow-lg shadow-rose-500/25 active:scale-[0.98] transition-transform"
        >
          {current === slides.length - 1
            ? t("onboarding.start")
            : t("onboarding.next")}
        </button>
      </div>
    </div>
  );
}
