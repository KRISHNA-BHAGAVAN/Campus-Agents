import React, { useState, useEffect } from "react";
import axios from "axios";
import JDInput from "./components/JDInput";
import ResultsView from "./components/ResultsView";
import HistorySidebar from "./components/HistorySidebar";

// API Base URL - update if deployed
const API_URL = "http://localhost:8000";

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // History State
  const [history, setHistory] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch History on Mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/history`);
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  };

  const handleJDSubmit = async (jdText) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/generate`, {
        job_description: jdText,
      });
      setResult(response.data);
      // Refresh history after new generation
      fetchHistory();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Failed to generate interview plan. Please check the backend connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = (item) => {
    setResult(item);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <HistorySidebar
        history={history}
        onSelect={handleSelectHistory}
        isOpen={isSidebarOpen}
        toggleOpen={setIsSidebarOpen}
      />

      <div
        className={`container mx-auto px-4 py-8 flex-grow max-w-5xl transition-all duration-300 ${
          isSidebarOpen ? "md:pl-80" : ""
        }`}
      >
        <header className="flex items-center gap-3 mb-12">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            A
          </div>
          <span className="font-semibold text-lg tracking-tight text-muted-foreground">
            Campus Agent
          </span>
        </header>

        <main className="w-full">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          {!result ? (
            <JDInput onSubmit={handleJDSubmit} loading={loading} />
          ) : (
            <ResultsView result={result} onBack={() => setResult(null)} />
          )}
        </main>
      </div>

      <footer
        className={`py-6 text-center text-xs text-muted-foreground border-t border-border mt-12 transition-all duration-300 ${
          isSidebarOpen ? "md:pl-80" : ""
        }`}
      >
        Powered by LangGraph & Gemini
      </footer>
    </div>
  );
}

export default App;
