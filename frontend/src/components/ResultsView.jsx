import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building,
  User,
  Brain,
  Search,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Code2,
  FileText,
  Clock,
  ListTodo,
} from "lucide-react";
import clsx from "clsx";

const QuestionResult = ({ questions, roundType }) => {
  return (
    <div className="space-y-6">
      {questions.map((q, idx) => (
        <div
          key={idx}
          className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-colors"
        >
          <div className="flex items-start gap-3 mb-3">
            <span className="bg-accent-color/20 text-accent-color px-2 py-1 rounded text-xs font-mono">
              Q{idx + 1}
            </span>
            <span
              className={clsx(
                "text-xs font-semibold px-2 py-1 rounded",
                q.difficulty === "easy"
                  ? "bg-green-500/20 text-green-400"
                  : q.difficulty === "medium"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-red-500/20 text-red-400"
              )}
            >
              {q.difficulty?.toUpperCase()}
            </span>
            <span className="text-xs text-text-secondary px-2 py-1 bg-white/5 rounded">
              {q.topic}
            </span>
          </div>

          {q.question_type === "mcq" ? (
            <div>
              <p className="text-lg font-medium mb-4">{q.question_text}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {q.options?.map((opt, optIdx) => (
                  <div
                    key={optIdx}
                    className={clsx(
                      "p-3 rounded-lg border text-sm transition-all",
                      optIdx === q.correct_option_index
                        ? "bg-green-500/10 border-green-500/50 text-green-300"
                        : "bg-black/20 border-white/10 text-text-secondary"
                    )}
                  >
                    <span className="font-mono opacity-50 mr-2">
                      {String.fromCharCode(65 + optIdx)}.
                    </span>
                    {opt}
                  </div>
                ))}
              </div>
              {q.explanation && (
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-200">
                  <span className="font-semibold block mb-1">Explanation:</span>
                  {q.explanation}
                </div>
              )}
            </div>
          ) : (
            <div className="font-mono text-sm">
              <h3 className="text-lg font-sans font-semibold mb-2">
                {q.problem_statement}
              </h3>

              {q.input_format && (
                <div className="mb-3">
                  <div className="text-xs uppercase text-text-secondary mb-1">
                    Input Format
                  </div>
                  <div className="bg-black/30 p-2 rounded text-gray-300">
                    {q.input_format}
                  </div>
                </div>
              )}

              {q.output_format && (
                <div className="mb-3">
                  <div className="text-xs uppercase text-text-secondary mb-1">
                    Output Format
                  </div>
                  <div className="bg-black/30 p-2 rounded text-gray-300">
                    {q.output_format}
                  </div>
                </div>
              )}

              {q.sample_tests && (
                <div className="mt-4 space-y-2">
                  {q.sample_tests.map((test, ti) => (
                    <div
                      key={ti}
                      className="bg-black/40 border border-white/10 rounded p-3"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs text-gray-500 block">
                            Input
                          </span>
                          <code className="text-green-400">{test.input}</code>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 block">
                            Output
                          </span>
                          <code className="text-indigo-400">{test.output}</code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const TestCard = ({ test, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-[#18181b] border border-[#27272a] rounded-lg overflow-hidden mb-3 hover:border-[#3f3f46] transition-colors"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left group"
      >
        <div className="flex items-center gap-4">
          <div
            className={clsx(
              "p-2.5 rounded-lg border",
              test.round_type === "coding"
                ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                : test.round_type === "aptitude_mcq"
                ? "bg-orange-500/10 border-orange-500/20 text-orange-400"
                : "bg-blue-500/10 border-blue-500/20 text-blue-400"
            )}
          >
            {test.round_type === "coding" ? (
              <Code2 className="w-5 h-5" />
            ) : test.round_type === "aptitude_mcq" ? (
              <Brain className="w-5 h-5" />
            ) : (
              <ListTodo className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="text-base font-semibold text-white group-hover:text-white transition-colors">
              {test.title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-text-secondary mt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {test.duration_min}m
              </span>
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" /> {test.num_questions} Qs
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Difficulty Badges */}
          <div className="hidden sm:flex gap-2">
            {test.difficulty_profile?.easy > 0 && (
              <span className="badge badge-green">
                Easy: {test.difficulty_profile.easy}
              </span>
            )}
            {test.difficulty_profile?.medium > 0 && (
              <span className="badge badge-orange">
                Med: {test.difficulty_profile.medium}
              </span>
            )}
            {test.difficulty_profile?.hard > 0 && (
              <span className="badge badge-purple">
                Hard: {test.difficulty_profile.hard}
              </span>
            )}
          </div>
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-text-secondary" />
          ) : (
            <ChevronRight className="w-4 h-4 text-text-secondary" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[#27272a] bg-[#121215]"
          >
            <div className="p-6">
              <QuestionResult
                questions={test.questions}
                roundType={test.round_type}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ResultsView = ({ result, onBack }) => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      <button
        onClick={onBack}
        className="text-muted-foreground hover:text-foreground flex items-center gap-2 mb-4 text-sm font-medium transition-colors"
      >
        &larr; Analyze another JD
      </button>

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="border-b border-border pb-8"
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium uppercase tracking-wide">
              <Building className="w-4 h-4" />
              {result.company_name || "Unknown Company"}
            </div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">
              {result.role_name || "Software Engineer"}
            </h1>

            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md">
                <Search className="w-3.5 h-3.5" />
                <span>Research Confidence</span>
                <span
                  className={clsx(
                    "font-semibold",
                    result.research_confidence > 0.7
                      ? "text-green-500"
                      : result.research_confidence > 0.4
                      ? "text-yellow-500"
                      : "text-red-500"
                  )}
                >
                  {Math.round(result.research_confidence * 100)}%
                </span>
              </div>
            </div>
          </div>

          {result.web_research_results &&
            !result.web_research_results.includes("No relevant") && (
              <div className="bg-card border border-border p-4 rounded-lg max-w-sm text-xs text-muted-foreground leading-relaxed shadow-sm">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Insights
                </h4>
                <p className="line-clamp-3 opacity-90">
                  {result.web_research_results}
                </p>
              </div>
            )}
        </div>
      </motion.div>

      {/* Timeline of Rounds */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Interview Process
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {result.inferred_rounds.map((round, idx) => (
            <div
              key={idx}
              className="bg-card border border-border p-4 rounded-lg hover:border-muted-foreground/20 transition-colors relative group"
            >
              <div className="absolute top-4 right-4 text-foreground/5 font-bold text-4xl select-none group-hover:text-foreground/10 transition-colors">
                {idx + 1}
              </div>
              <div className="font-medium text-foreground mb-1 relative z-10 pr-6">
                {round.round_name}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider relative z-10">
                {round.round_type.replace("_", " ")}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Generated Tests Section */}
      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Mock Tests
        </h3>
        {result.generated_tests.map((test, idx) => (
          <TestCard key={test.test_id} test={test} index={idx} />
        ))}
      </div>
    </div>
  );
};

export default ResultsView;
