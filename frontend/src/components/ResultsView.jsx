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
  Sparkles,
  Target,
  Zap,
  Award,
} from "lucide-react";
import clsx from "clsx";

const QuestionResult = ({ questions, roundType }) => {
  return (
    <div className="space-y-6">
      {questions.map((q, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="glass-card border border-white/10 rounded-xl p-6 hover:border-indigo-500/30 transition-all"
        >
          <div className="flex items-start gap-3 mb-4">
            <span className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold font-mono">
              Q{idx + 1}
            </span>
            <span
              className={clsx(
                "text-xs font-bold px-3 py-1.5 rounded-lg border-2",
                q.difficulty === "easy"
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : q.difficulty === "medium"
                    ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    : "bg-red-500/20 text-red-400 border-red-500/30"
              )}
            >
              {q.difficulty?.toUpperCase()}
            </span>
            <span className="text-xs text-white/50 px-3 py-1.5 glass-card rounded-lg font-mono">
              {q.topic}
            </span>
          </div>

          {q.question_type === "mcq" ? (
            <div>
              <p className="text-lg font-medium mb-5 text-white leading-relaxed">{q.question_text}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {q.options?.map((opt, optIdx) => (
                  <div
                    key={optIdx}
                    className={clsx(
                      "p-4 rounded-xl border-2 text-sm transition-all",
                      optIdx === q.correct_option_index
                        ? "bg-green-500/10 border-green-500/50 text-green-300 font-medium"
                        : "bg-black/30 border-white/10 text-white/70 hover:bg-black/50"
                    )}
                  >
                    <span className="font-mono opacity-60 mr-2 font-bold">
                      {String.fromCharCode(65 + optIdx)}.
                    </span>
                    {opt}
                  </div>
                ))}
              </div>
              {q.explanation && (
                <div className="mt-5 p-4 glass-card border border-blue-500/30 rounded-xl text-sm text-blue-200">
                  <span className="font-bold block mb-2 text-blue-300">💡 Explanation:</span>
                  {q.explanation}
                </div>
              )}
            </div>
          ) : (
            <div className="font-mono text-sm">
              <h3 className="text-xl font-display font-bold mb-4 text-white">
                {q.problem_statement}
              </h3>

              {q.input_format && (
                <div className="mb-4">
                  <div className="text-xs uppercase text-white/40 mb-2 font-bold tracking-wider">
                    Input Format
                  </div>
                  <div className="bg-black/50 border border-white/10 p-3 rounded-lg text-gray-300">
                    {q.input_format}
                  </div>
                </div>
              )}

              {q.output_format && (
                <div className="mb-4">
                  <div className="text-xs uppercase text-white/40 mb-2 font-bold tracking-wider">
                    Output Format
                  </div>
                  <div className="bg-black/50 border border-white/10 p-3 rounded-lg text-gray-300">
                    {q.output_format}
                  </div>
                </div>
              )}

              {q.sample_tests && (
                <div className="mt-5 space-y-3">
                  <div className="text-xs uppercase text-white/40 font-bold tracking-wider">Sample Test Cases</div>
                  {q.sample_tests.map((test, ti) => (
                    <div
                      key={ti}
                      className="glass-card border border-white/10 rounded-xl p-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs text-gray-400 block mb-1 font-bold">
                            Input
                          </span>
                          <code className="text-green-400 block bg-black/30 p-2 rounded">{test.input}</code>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400 block mb-1 font-bold">
                            Output
                          </span>
                          <code className="text-indigo-400 block bg-black/30 p-2 rounded">{test.output}</code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
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
      className="glass-card rounded-2xl overflow-hidden mb-3 hover:border-indigo-500/30 transition-all"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left group"
      >
        <div className="flex items-center gap-5">
          <div
            className={clsx(
              "p-3 rounded-xl border-2",
              test.round_type === "coding"
                ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
                : test.round_type === "aptitude_mcq"
                  ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                  : "bg-blue-500/10 border-blue-500/30 text-blue-400"
            )}
          >
            {test.round_type === "coding" ? (
              <Code2 className="w-6 h-6" />
            ) : test.round_type === "aptitude_mcq" ? (
              <Brain className="w-6 h-6" />
            ) : (
              <ListTodo className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-display font-bold text-white group-hover:text-indigo-300 transition-colors">
              {test.title}
            </h3>
            <div className="flex items-center gap-4 text-xs text-white/50 mt-2">
              <span className="flex items-center gap-1.5 font-mono">
                <Clock className="w-3.5 h-3.5" /> {test.duration_min}m
              </span>
              <span className="flex items-center gap-1.5 font-mono">
                <FileText className="w-3.5 h-3.5" /> {test.num_questions} Questions
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Difficulty Badges */}
          <div className="hidden sm:flex gap-2">
            {test.difficulty_profile?.easy > 0 && (
              <span className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30">
                Easy: {test.difficulty_profile.easy}
              </span>
            )}
            {test.difficulty_profile?.medium > 0 && (
              <span className="px-3 py-1 rounded-lg bg-yellow-500/20 text-yellow-400 text-xs font-bold border border-yellow-500/30">
                Med: {test.difficulty_profile.medium}
              </span>
            )}
            {test.difficulty_profile?.hard > 0 && (
              <span className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30">
                Hard: {test.difficulty_profile.hard}
              </span>
            )}
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-5 h-5 text-white/50" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10 bg-black/20"
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
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <button
        onClick={onBack}
        className="text-white/60 hover:text-white flex items-center gap-2 mb-4 text-sm font-medium transition-colors group"
      >
        <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Analyze another JD
      </button>

      {/* Hero Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 rounded-3xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-500/20 rounded-xl">
              <Building className="w-6 h-6 text-indigo-400" />
            </div>
            <span className="text-indigo-400 font-display font-bold text-lg uppercase tracking-wider">
              {result.company_name || "Unknown Company"}
            </span>
          </div>
          
          <h1 className="text-5xl font-display font-bold text-white mb-6 leading-tight">
            {result.role_name || "Software Engineer"}
          </h1>

          <div className="flex flex-wrap gap-3">
            <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-2 border border-green-500/30">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-sm text-white/70">Confidence</span>
              <span
                className={clsx(
                  "font-bold font-mono",
                  result.research_confidence > 0.7
                    ? "text-green-400"
                    : result.research_confidence > 0.4
                      ? "text-yellow-400"
                      : "text-red-400"
                )}
              >
                {Math.round(result.research_confidence * 100)}%
              </span>
            </div>
            
            <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-2 border border-purple-500/30">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-white/70">Rounds</span>
              <span className="font-bold font-mono text-purple-400">{result.inferred_rounds.length}</span>
            </div>
            
            <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-2 border border-pink-500/30">
              <Award className="w-4 h-4 text-pink-400" />
              <span className="text-sm text-white/70">Tests</span>
              <span className="font-bold font-mono text-pink-400">{result.generated_tests.length}</span>
            </div>
          </div>

          {result.web_research_results &&
            !result.web_research_results.includes("No relevant") && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 glass-card p-5 rounded-2xl border border-indigo-500/30"
              >
                <h4 className="font-display font-bold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  AI Research Insights
                </h4>
                <p className="text-white/70 leading-relaxed text-sm">
                  {result.web_research_results}
                </p>
              </motion.div>
            )}
        </div>
      </motion.div>

      {/* Interview Process Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-2xl font-display font-bold mb-6 text-white flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
          Interview Process
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {result.inferred_rounds.map((round, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              className="glass-card p-5 rounded-2xl hover:border-indigo-500/50 transition-all relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
              
              <div className="absolute top-3 right-3 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                <span className="text-2xl font-display font-bold text-white/30 group-hover:text-white/50 transition-colors">
                  {idx + 1}
                </span>
              </div>
              
              <div className="relative z-10">
                <div className="font-display font-bold text-white mb-2 pr-12 text-lg">
                  {round.round_name}
                </div>
                <div className="text-xs text-white/50 uppercase tracking-wider font-mono">
                  {round.round_type.replace("_", " ")}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Generated Tests Section */}
      <div className="space-y-4 pt-4">
        <h3 className="text-2xl font-display font-bold mb-6 text-white flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
          Mock Tests & Questions
        </h3>
        {result.generated_tests.map((test, idx) => (
          <TestCard key={test.test_id} test={test} index={idx} />
        ))}
      </div>
    </div>
  );
};

export default ResultsView;
