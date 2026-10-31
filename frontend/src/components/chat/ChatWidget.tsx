"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send, Bot, AlertCircle } from "lucide-react";
import { sendChatMessage } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/errors";
import { Spinner } from "@/components/ui/Spinner";

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  source?: "llm" | "faq" | "refused";
  ai_status?: "ok" | "disabled" | "unavailable";
  timestamp: string;
}

const SOURCE_LABELS: Record<string, string> = {
  llm: "AI answer",
  faq: "Help article",
  refused: "Out of scope",
};

export const ChatWidget: React.FC = () => {
  const pathname = usePathname();
  const titleId = useId();

  // Floating panel state
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Focus management
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Detect verdict_id from URL if on /verdicts/[id]
  const verdictMatch = pathname.match(/^\/verdicts\/([0-9a-fA-F-]+)/);
  const currentVerdictId = verdictMatch ? verdictMatch[1] : null;

  // Detect demo mode from cookies
  const [isDemoMode, setIsDemoMode] = useState(false);
  useEffect(() => {
    if (typeof document !== "undefined") {
      const hasDemoCookie = document.cookie.split(";").some((c) => c.trim().startsWith("ss_demo=1"));
      const isMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true";
      setIsDemoMode(hasDemoCookie && isMocks);
    }
  }, [isOpen]);

  // Auto-scroll messages to bottom
  useEffect(() => {
    if (isOpen && typeof messagesEndRef.current?.scrollIntoView === "function") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Focus management: focus input on open, focus trigger on close
  useEffect(() => {
    if (isOpen) {
      // Focus input when opened
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle escape key and focus trap inside modal panel
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
        triggerButtonRef.current?.focus();
        return;
      }

      if (e.key === "Tab" && panelRef.current) {
        const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    triggerButtonRef.current?.focus();
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    if (trimmed.length > 500) {
      setErrorBanner("Message must be 500 characters or less.");
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setErrorBanner(null);
    setIsLoading(true);

    try {
      const response = await sendChatMessage({
        message: trimmed,
        verdict_id: currentVerdictId,
      });

      const assistantMessage: ChatMessage = {
        id: `assist-${Date.now()}`,
        sender: "assistant",
        text: response.reply,
        source: response.source,
        ai_status: response.ai_status,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.statusCode === 429) {
        const retrySec = err.retryAfter || 600;
        const minutes = Math.ceil(retrySec / 60);
        setErrorBanner(`Rate limit reached. Please wait ${minutes} minute${minutes > 1 ? "s" : ""} before sending more messages.`);
      } else {
        const message = err instanceof Error ? err.message : "Failed to receive response from assistant.";
        setErrorBanner(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (process.env.NEXT_PUBLIC_SHOW_CHAT !== "true") {
    return null;
  }

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        ref={triggerButtonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open help assistant"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-white border border-[#F0DCE2] text-[#B8556B] shadow-[0_4px_16px_rgba(30,26,28,0.08)] hover:bg-[#FAF4F6] hover:border-[#B8556B]/40 hover:shadow-[0_6px_20px_rgba(30,26,28,0.12)] active:scale-95 transition-all flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8556B] focus-visible:ring-offset-2 cursor-pointer"
      >
        <MessageCircle className="w-5 h-5" />
      </button>

      {/* Floating Dialog Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="SupplyShield Help Assistant"
          aria-labelledby={titleId}
          className="fixed z-50 inset-x-0 bottom-0 sm:inset-x-auto sm:bottom-20 sm:right-6 w-full sm:w-[380px] h-[520px] max-h-[85vh] sm:max-h-[580px] bg-white rounded-t-[16px] sm:rounded-[16px] border border-[#F0DCE2] shadow-[0_16px_40px_rgba(30,26,28,0.16)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#F0DCE2] bg-[#FAF4F6]/60 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#B8556B]/10 text-[#B8556B] flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 id={titleId} className="text-sm font-medium text-[#1E1A1C] leading-none">
                  SupplyShield Help Assistant
                </h3>
                <div className="flex items-center gap-1.5 mt-1">
                  {currentVerdictId && (
                    <span className="text-[11px] font-medium text-[#B8556B] bg-[#B8556B]/10 px-1.5 py-0.5 rounded">
                      About this verdict
                    </span>
                  )}
                  {isDemoMode && (
                    <span className="text-[11px] font-medium text-[#6E6268] bg-black/5 px-1.5 py-0.5 rounded">
                      Demo mode
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              aria-label="Close help assistant"
              className="p-1 rounded-lg text-[#6E6268] hover:text-[#1E1A1C] hover:bg-black/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8556B]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages List: aria-live region */}
          <div
            role="log"
            aria-live="polite"
            aria-relevant="additions"
            aria-label="Chat messages"
            className="flex-1 p-4 overflow-y-auto space-y-3"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-2 text-[#6E6268]">
                <MessageCircle className="w-8 h-8 text-[#B8556B]/40 stroke-1" />
                <p className="text-xs font-medium text-[#1E1A1C]">Ask about SupplyShield security</p>
                <p className="text-xs max-w-[240px] leading-relaxed">
                  Ask questions about risk scores, policy floors, findings, or pull request security verdicts.
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-[12px] p-3 text-xs leading-relaxed ${msg.sender === "user"
                        ? "bg-[#FAF4F6] text-[#1E1A1C] border border-[#F0DCE2]/80"
                        : "bg-white text-[#1E1A1C] border border-[#F0DCE2] shadow-[0_1px_2px_rgba(30,26,28,0.03)]"
                      }`}
                  >
                    {/* Render plain text only - strictly no dangerous HTML and no markdown parsing */}
                    <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                  </div>

                  {/* Metadata line for assistant messages */}
                  {msg.sender === "assistant" && (
                    <div className="flex items-center gap-2 mt-1 px-1 text-[11px] text-[#6E6268]">
                      {msg.source && (
                        <span
                          className={`font-medium px-1.5 py-0.5 rounded ${msg.source === "refused"
                              ? "bg-[#A3213F]/10 text-[#A3213F]"
                              : msg.source === "faq"
                                ? "bg-[#FAF4F6] text-[#6E6268] border border-[#F0DCE2]"
                                : "bg-[#B8556B]/10 text-[#B8556B]"
                            }`}
                        >
                          {SOURCE_LABELS[msg.source] || msg.source}
                        </span>
                      )}

                      {/* Display ai_status in plain text when not ok */}
                      {msg.ai_status && msg.ai_status !== "ok" && (
                        <span className="font-mono text-[#A3213F]">
                          AI status: {msg.ai_status}
                        </span>
                      )}

                      <span className="text-[10px] text-[#6E6268]/70">{msg.timestamp}</span>
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#F0DCE2] w-fit text-xs text-[#6E6268]">
                <Spinner size="sm" />
                <span>Thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Error Banner */}
          {errorBanner && (
            <div
              role="alert"
              className="px-3 py-2 bg-[#A3213F]/10 border-t border-[#A3213F]/20 text-[#A3213F] text-xs flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-1.5 overflow-hidden">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{errorBanner}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorBanner(null)}
                className="text-xs underline hover:opacity-80 flex-shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Input Area */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-[#F0DCE2] bg-white flex items-center gap-2 flex-shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a security question..."
              maxLength={500}
              disabled={isLoading}
              aria-label="Ask a security question"
              className="flex-1 px-3 py-2 text-xs rounded-[8px] bg-white border border-[#F0DCE2] text-[#1E1A1C] placeholder:text-[#6E6268]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8556B] disabled:opacity-50 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              aria-label="Send message"
              className="p-2 rounded-[8px] bg-[#B8556B] text-white hover:bg-[#A2485C] disabled:opacity-40 disabled:hover:bg-[#B8556B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8556B] transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
