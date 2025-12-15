import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, Bot, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { insightsData, mockCleanups } from '@/data/mockData';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickPrompts = [
  "What's my total rewards?",
  "Show me active cleanups",
  "How many cleanups completed?",
  "Summarize my cleanup categories"
];

// Simple mock AI responses based on data
const generateResponse = (query: string): string => {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('total reward') || lowerQuery.includes('rewards earned')) {
    return `Your total rewards earned is **${insightsData.totalRewards.toLocaleString()} B3TR**. Keep up the great work organizing and participating in cleanups!`;
  }
  
  if (lowerQuery.includes('active') || lowerQuery.includes('open')) {
    const openCleanups = mockCleanups.filter(c => c.status === 'open');
    return `You have **${openCleanups.length} active cleanups** open for registration:\n\n${openCleanups.map(c => `• **${c.title}** - ${c.location.city}`).join('\n')}\n\nWould you like more details on any of these?`;
  }
  
  if (lowerQuery.includes('completed') || lowerQuery.includes('finished')) {
    return `You have completed **${insightsData.cleanupsCompleted} cleanups** so far! That's amazing progress for environmental impact.`;
  }
  
  if (lowerQuery.includes('categor') || lowerQuery.includes('breakdown')) {
    const categories = insightsData.categoryData;
    return `Here's your cleanup breakdown by category:\n\n${categories.map(c => `• **${c.name}**: ${c.value}%`).join('\n')}\n\nBeach cleanups lead with the highest participation.`;
  }
  
  if (lowerQuery.includes('participant') || lowerQuery.includes('helped')) {
    return `You have helped **${insightsData.participantsHelped} participants** join cleanups. Great community building!`;
  }
  
  if (lowerQuery.includes('nearby') || lowerQuery.includes('location')) {
    return `There are **${insightsData.activeCleanupsNearby} active cleanups** near your location. Check the Cleanups page to see them on the map!`;
  }
  
  if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey')) {
    return `Hello! 👋 I'm your Cleanup AI assistant. I can help you with:\n\n• Viewing cleanup insights and rewards\n• Checking cleanup statuses\n• Analyzing your participation\n• Exploring category breakdowns\n\nWhat would you like to know?`;
  }
  
  return `I understand you're asking about "${query}". Based on your account data:\n\n• **Total Rewards**: ${insightsData.totalRewards.toLocaleString()} B3TR\n• **Cleanups Completed**: ${insightsData.cleanupsCompleted}\n• **Participants Helped**: ${insightsData.participantsHelped}\n\nCould you be more specific about what you'd like to know? I can help with cleanups, rewards, or participation analytics.`;
};

export default function AIChat() {
  const location = useLocation();
  const initialQuery = (location.state as { initialQuery?: string })?.initialQuery;
  const hasProcessedInitialQuery = useRef(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm Temi, your CleanMate AI assistant. I can help you understand your cleanup insights, check rewards, and analyze your participation. What would you like to know?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle initial query from Insights page
  useEffect(() => {
    if (initialQuery && !hasProcessedInitialQuery.current) {
      hasProcessedInitialQuery.current = true;
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: generateResponse(messageText),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, aiResponse]);
    setIsLoading(false);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Chat cleared! I'm Temi, your CleanMate assistant. How can I help you today?",
        timestamp: new Date(),
      }
    ]);
    toast.success('Chat history cleared');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
            <p className="text-xs lg:text-sm text-muted-foreground">Your CleanMate AI Assistant</p>
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear chat history?</AlertDialogTitle>
              <AlertDialogDescription>
                This will delete all messages in this conversation. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearChat}>Clear</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap leading-relaxed">
                  {message.content.split('**').map((part, i) => 
                    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                  )}
                </div>
                <p className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {message.role === 'user' && (
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