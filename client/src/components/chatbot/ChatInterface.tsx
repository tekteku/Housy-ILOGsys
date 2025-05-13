import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatMessage from "./ChatMessage";
import { sendChatMessage } from "@/lib/ai-service";
import { useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatMessage {
  id?: number;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  sessionId: string;
}

interface ChatInterfaceProps {
  sessionId: string;
  initialMessages: ChatMessage[];
  isLoading: boolean;
  aiModel: string;
  onNewChat: () => void;
}

const ChatInterface = ({
  sessionId,
  initialMessages,
  isLoading,
  aiModel,
  onNewChat,
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages || []);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // When initialMessages updates (e.g. after loading), update our state
  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // Auto scroll to the bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Listen for suggested questions from other components
  useEffect(() => {
    const handleSuggestedQuestion = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setInput(customEvent.detail);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    };

    document.addEventListener('suggest-question', handleSuggestedQuestion);
    
    return () => {
      document.removeEventListener('suggest-question', handleSuggestedQuestion);
    };
  }, []);

  // Chat message mutation
  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      return sendChatMessage(content, sessionId);
    },
    onSuccess: (data) => {
      // Message was sent and response received
      setIsTyping(false);
      
      // Add the assistant's response to our messages
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          sessionId,
        },
      ]);
    },
    onError: (error) => {
      setIsTyping(false);
      
      // Add an error message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer plus tard.",
          sessionId,
        },
      ]);
      
      console.error("Error sending message:", error);
    }
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message to the list
    const userMessage = {
      role: "user" as const,
      content: input,
      sessionId,
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    
    // Send message to the server
    sendMessage.mutate(input);
  };

  // Determine greeting message based on time of day
  const getGreetingMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour ! Comment puis-je vous aider avec votre projet aujourd'hui ?";
    if (hour < 18) return "Bon après-midi ! Comment puis-je vous aider avec votre projet aujourd'hui ?";
    return "Bonsoir ! Comment puis-je vous aider avec votre projet aujourd'hui ?";
  };

  // Display empty state if no messages
  const isEmpty = messages.length === 0 && !isLoading;

  return (
    <Card className="shadow-sm border border-neutral-200 h-[calc(100vh-16rem)]">
      <CardContent className="p-0 h-full flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full max-w-md" />
              <div className="flex justify-end">
                <Skeleton className="h-16 w-full max-w-md" />
              </div>
              <Skeleton className="h-16 w-full max-w-md" />
            </div>
          ) : isEmpty ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="mb-4 w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                <i className="fas fa-robot text-primary-600 text-2xl"></i>
              </div>
              <h2 className="text-xl font-semibold mb-2">
                Assistant IA Housy
              </h2>
              <p className="text-neutral-500 mb-6 max-w-md">
                Je peux vous aider avec l'estimation des coûts, les matériaux de construction, les tendances du marché immobilier, et bien plus encore.
              </p>
              <p className="text-neutral-500">
                {getGreetingMessage()}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <ChatMessage
                  key={msg.id || index}
                  message={msg}
                  aiModel={aiModel}
                />
              ))}
              {isTyping && (
                <div className="flex">
                  <div className="rounded-lg bg-neutral-100 p-3 text-neutral-800 max-w-md">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      <div className="w-2 h-2 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: "600ms" }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="border-t border-neutral-200 p-4 bg-white">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <div className="relative flex-1">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Posez votre question..."
                disabled={isLoading || isTyping}
                className="pr-10"
                ref={inputRef}
              />
              {input && (
                <button
                  type="button"
                  onClick={() => setInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <i className="fas fa-times-circle"></i>
                </button>
              )}
            </div>
            <Button
              type="submit"
              disabled={!input.trim() || isLoading || isTyping}
            >
              <i className="fas fa-paper-plane"></i>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onNewChat}
              title="Nouvelle conversation"
              className="md:hidden"
            >
              <i className="fas fa-plus"></i>
            </Button>
          </form>
          <div className="flex justify-between mt-2 text-xs text-neutral-500">
            <div>
              <span>Utilisation du modèle: </span>
              <span className="font-medium">
                {aiModel === "openai" 
                  ? "GPT-4o (OpenAI)" 
                  : aiModel === "claude" 
                    ? "Claude 3 (Anthropic)" 
                    : aiModel === "ollama" 
                      ? "Llama 2 (Ollama)" 
                      : "DeepSeek"}
              </span>
            </div>
            <button 
              className="text-primary-600 hover:text-primary-700"
              onClick={() => {
                setMessages([]);
                onNewChat();
              }}
            >
              Effacer la conversation
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;
