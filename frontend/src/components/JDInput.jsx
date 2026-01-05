import React, { useState } from "react";
import { ArrowRight, Sparkles, Loader2 } from "lucide-react";
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto w-full"
    >
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3 text-foreground tracking-tight">
          Placement Cell Agent
        </h1>
        <p className="text-muted-foreground text-lg font-light">
          Generate structured interview plans from any job description.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative group">
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste Job Description here..."
            className="w-full h-48 bg-card border border-input rounded-xl p-6 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none font-sans text-base leading-relaxed"
            disabled={loading}
          />
          <div className="absolute bottom-4 right-4 text-xs text-muted-foreground font-mono">
            {jd.length} chars
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={!jd.trim() || loading}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 min-w-[200px]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Generate Plan
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default JDInput;
