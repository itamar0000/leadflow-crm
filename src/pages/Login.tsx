import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../lib/auth";

export default function Login() {
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    const { error: err } = await signInWithEmail(email.trim());
    setLoading(false);

    if (err) {
      setError(err);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-warm-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-500/20">
            <span className="text-4xl">💇‍♀️</span>
          </div>
          <h1 className="text-3xl font-bold text-warm-800">LeadFlow</h1>
          <p className="text-warm-500 text-sm mt-2">
            ניהול לידים חכם למעצבות שיער ומאפרות
          </p>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-3xl p-6 card-shadow-lg border border-warm-100">
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✉️</span>
              </div>
              <h2 className="text-lg font-bold text-warm-800 mb-2">
                בדקי את המייל שלך
              </h2>
              <p className="text-warm-500 text-sm leading-relaxed mb-4">
                שלחנו לינק התחברות ל-
                <br />
                <span className="font-medium text-warm-700" dir="ltr">
                  {email}
                </span>
              </p>
              <button
                onClick={() => {
                  setSent(false);
                  setEmail("");
                }}
                className="text-rose-500 text-sm font-medium hover:underline"
              >
                שליחה שוב
              </button>
            </motion.div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-warm-800 mb-1 text-center">
                התחברות
              </h2>
              <p className="text-warm-500 text-xs text-center mb-5">
                נשלח לך לינק קסם למייל — בלי סיסמאות
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-warm-600 mb-1.5 block">
                    כתובת אימייל
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    dir="ltr"
                    className="w-full px-4 py-3.5 bg-warm-50 border border-warm-200 rounded-xl text-warm-800 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all text-center"
                    required
                    autoFocus
                    autoComplete="email"
                  />
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-xs text-center bg-red-50 rounded-lg p-2"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold text-base shadow-lg shadow-rose-500/20 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:active:scale-100"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      שולח...
                    </span>
                  ) : (
                    "שלחי לינק להתחברות ✨"
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-warm-400 text-[10px] mt-6">
          LeadFlow v2.0 — נתונים מאובטחים בענן
        </p>
      </motion.div>
    </div>
  );
}
