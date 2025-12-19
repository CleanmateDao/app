import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, User, Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ClearChatAlertDialog } from "@/components/ClearChatAlertDialog";
import {
  useCleanups,
  useTransactions,
  useUser,
} from "@/services/subgraph/queries";
import {
  transformCleanup,
  transformTransaction,
  transformUserToProfile,
  calculateInsights,
} from "@/services/subgraph/transformers";
import { useWalletAddress } from "@/hooks/use-wallet-address";
import { useTemiChat } from "@/services/api/temi";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const quickPrompts = [
  "What's my total rewards?",
  "Show me active cleanups",
  "How many cleanups completed?",
  "Summarize my cleanup categories",
];

export default function AIChat() {
  const location = useLocation();
  const walletAddress = useWalletAddress();
  const initialQuery = (location.state as { initialQuery?: string })
    ?.initialQuery;
  const hasProcessedInitialQuery = useRef(false);

  // Temi chat mutation
  const temiChatMutation = useTemiChat();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm Temi, your CleanMate AI assistant. I can help you understand your cleanup insights, check rewards, and analyze your participation. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const messagesRef = useRef<Message[]>(messages);
  const [input, setInput] = useState("");
  const isLoading = temiChatMutation.isPending;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    messagesRef.current = messages;
    scrollToBottom();
  }, [messages]);

  const handleSend = useCallback(
    async (text?: string) => {
      const messageText = text || input.trim();
      if (!messageText || isLoading) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: messageText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      const chatHistory = messagesRef.current
        .filter((msg) => msg.id !== "1")
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      try {
        const response = await temiChatMutation.mutateAsync({
          message: JSON.stringify({
            message: messageText,
            walletAddress: walletAddress,
          }),
          history: chatHistory.length > 0 ? chatHistory : undefined,
        });

        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.message,
          timestamp: new Date(response.timestamp),
        };

        setMessages((prev) => [...prev, aiResponse]);
      } catch (error) {
        // Error is already handled by the mutation's onError callback
        // Add error message to chat for user visibility
        const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "Sorry, I encountered an error processing your request. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorResponse]);
      }
    },
    [input, isLoading, temiChatMutation]
  );

  // Handle initial query from Insights page
  useEffect(() => {
    if (initialQuery && !hasProcessedInitialQuery.current) {
      hasProcessedInitialQuery.current = true;
      handleSend(initialQuery);
    }
  }, [initialQuery, handleSend]);

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        content:
          "Chat cleared! I'm Temi, your CleanMate assistant. How can I help you today?",
        timestamp: new Date(),
      },
    ]);
    toast.success("Chat history cleared");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-3xl mx-auto pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-3 lg:py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Sparkles className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg lg:text-xl font-semibold">Temi</h1>
            <p className="text-xs lg:text-sm text-muted-foreground">
              Your CleanMate AI Assistant
            </p>
          </div>
        </div>
        <ClearChatAlertDialog onClear={handleClearChat} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <div className="text-sm whitespace-pre-wrap leading-relaxed">
                  {message.content
                    .split("**")
                    .map((part, i) =>
                      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                    )}
                </div>
                <p
                  className={`text-xs mt-1 ${
                    message.role === "user"
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-muted rounded-2xl px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 2 && (
        <div className="px-6 pb-4">
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="px-3 py-1.5 text-xs rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-6 py-4 border-t border-border">
        <div className="flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your cleanup insights..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
