import React from "react";
import { Clock, History, Calendar, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const HistorySidebar = ({ history, onSelect, isOpen, toggleOpen }) => {
  return (
    <>
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => toggleOpen(true)}
          className="fixed left-4 top-24 z-50 p-2 bg-card border border-border rounded-full shadow-lg text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
          title="View History"
        >
          <History className="w-5 h-5" />
        </button>
      )}

      {/* Sidebar Drawer */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-full w-80 bg-background border-r border-border z-50 shadow-2xl flex flex-col"
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <History className="w-5 h-5" />
            History
          </div>
          <button
            onClick={() => toggleOpen(false)}
            className="p-1 hover:bg-muted rounded-md text-muted-foreground transition-colors"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {!Array.isArray(history) || history.length === 0 ? (
            <div className="text-center text-muted-foreground py-10 text-sm">
              No history found. <br /> Generate a plan first!
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelect(item);
                  if (window.innerWidth < 768) toggleOpen(false);
                }}
                className="group cursor-pointer p-3 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-muted/50 transition-all relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium text-sm text-foreground pr-2 line-clamp-1">
                    {item.role_name || "Unknown Role"}
                  </h4>
                  {item.research_confidence > 0 && (
                    <div
                      className={`w-2 h-2 rounded-full ${item.research_confidence > 0.7
                          ? "bg-green-500"
                          : "bg-yellow-500"
                        }`}
                    ></div>
                  )}
                </div>

                <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.company_name || "Unknown Corp"}
                </div>

                {item.created_at && (
                  <div className="text-[10px] text-muted-foreground/60 flex items-center gap-1 border-t border-border mt-2 pt-2">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                )}

                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-4 h-4 text-primary" />
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => toggleOpen(false)}
        />
      )}
    </>
  );
};

export default HistorySidebar;
