import React, { useState } from "react";
import { ArrowRight, Sparkles, Loader2, Zap } from "lucide-react";
import { motion } from "framer-motion";

const JDInput = ({ onSubmit, loading }) => {
  const [jd, setJd] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (jd.trim()) {
      onSubmit(jd);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto w-full"
    >
      <div className="text-center mb-12 relative">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="inline-block p-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl mb-6"
        >
          <Sparkles className="w-12 h-12 text-indigo-400" />
        </motion.div>
        
        <h1 className="text-5xl font-display font-bold mb-4 text-white tracking-tight">
          Placement Cell Agent
        </h1>
        <p className="text-white/60 text-xl font-light max-w-2xl mx-auto leading-relaxed">
          Transform any job description into a structured interview preparation plan with AI-powered insights.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste your job description here...\n\nInclude company name, role, requirements, and any interview process details you have."
            className="relative w-full h-64 glass-card rounded-2xl p-6 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none font-sans text-base leading-relaxed"
            disabled={loading}
          />
          <div className="absolute bottom-4 right-4 flex items-center gap-3">
            <span className="text-xs text-white/40 font-mono bg-black/30 px-2 py-1 rounded">
              {jd.length} characters
            </span>
          </div>
        </div>

        <div className="flex justify-center">
          <motion.button
            type="submit"
            disabled={!jd.trim() || loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center rounded-xl text-base font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white h-14 px-10 min-w-[240px] shadow-lg shadow-indigo-500/30"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-5 w-5" />
                Generate Plan
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default JDInput;
