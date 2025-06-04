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
  suggestions?: string[];
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
      // Pass the selected AI model to the API
      return sendChatMessage(content, sessionId, aiModel);
    },
    onSuccess: (data) => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response, // Réponse textuelle
          suggestions: (data as any).suggestions, // Supposons que le backend renvoie un tableau de suggestions
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

  const getAiModelName = () => {
    switch (aiModel) {
      case "openai": return "GPT-4o (OpenAI)";
      case "claude": return "Claude 3 (Anthropic)";
      case "ollama": return "Llama 2 (Ollama)";
      case "deepseek": return "DeepSeek";
      default: return "GPT-4o (OpenAI)";
    }
  };

  return (
    <Card className="shadow-lg border-0 rounded-3xl h-[calc(100vh-16rem)] bg-white">
      <CardContent className="p-0 h-full flex flex-col">
        {/* Chat header with model info */}
        <div className="p-5 border-b border-neutral-200 bg-white flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <i className={`fas ${aiModel === "claude" ? "fa-comment-dots" : "fa-robot"} text-lg`}></i>
            </div>
            <div>
              <div className="font-bold text-base">Assistant Construction & Immobilier</div>
              <div className="text-xs text-neutral-400">
                Utilise {getAiModelName()} avec les données immobilières tunisiennes
              </div>
            </div>
          </div>
          <button 
            onClick={onNewChat} 
            className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 py-1 px-3 rounded-xl flex items-center gap-1"
          >
            <i className="fas fa-plus text-xs"></i>
            <span className="hidden md:inline">Nouvelle conversation</span>
          </button>
        </div>
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#f4f6fa] rounded-b-3xl">
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
              <div className="mb-6 w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                <i className="fas fa-robot text-blue-600 text-3xl"></i>
              </div>
              <h2 className="text-2xl font-bold mb-3 text-[#162032]">
                Assistant Construction & Immobilier
              </h2>
              <p className="text-neutral-600 mb-8 max-w-md leading-relaxed">
                Je suis spécialisé dans le secteur immobilier et de la construction en Tunisie avec accès aux données réelles du marché.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full mb-8">
                <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-sm text-left flex items-start gap-2">
                  <div className="text-emerald-500 mt-0.5"><i className="fas fa-chart-line"></i></div>
                  <div>
                    <h3 className="font-medium text-sm">Tendances du marché</h3>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                  <div className={msg.role === 'user' ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm px-4 py-2 max-w-xs shadow-md' : 'bg-gray-100 text-gray-900 rounded-2xl rounded-bl-sm px-4 py-2 max-w-xs shadow'}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        {/* Input area */}
        <form onSubmit={handleSubmit} className="p-4 bg-white rounded-b-3xl flex gap-2 border-t border-neutral-100">
          <Input
            ref={inputRef}
            className="flex-1 rounded-xl border border-neutral-200 shadow-sm px-4 py-2 focus:ring-2 focus:ring-blue-200"
            placeholder="Tapez un message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isTyping}
          />
          <Button type="submit" className="rounded-xl px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 shadow">
            <i className="fas fa-paper-plane"></i>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;
