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
          suggestions: data.suggestions, // Supposons que le backend renvoie un tableau de suggestions
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
    <Card className="shadow-sm border border-neutral-200 h-[calc(100vh-16rem)] bg-neutral-50">
      <CardContent className="p-0 h-full flex flex-col">
        {/* Chat header with model info */}
        <div className="p-3 border-b border-neutral-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
              <i className={`fas ${aiModel === "claude" ? "fa-comment-dots" : "fa-robot"} text-sm`}></i>
            </div>
            <div>
              <div className="font-medium text-sm">Assistant Construction & Immobilier</div>
              <div className="text-xs text-neutral-500">
                Utilise {getAiModelName()} avec les données immobilières tunisiennes
              </div>
            </div>
          </div>
          <button 
            onClick={onNewChat} 
            className="text-xs bg-primary-50 text-primary-600 hover:bg-primary-100 py-1 px-2 rounded flex items-center gap-1"
          >
            <i className="fas fa-plus text-xs"></i>
            <span className="hidden md:inline">Nouvelle conversation</span>
          </button>
        </div>
        
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
              <div className="mb-6 w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
                <i className="fas fa-robot text-primary-600 text-3xl"></i>
              </div>
              <h2 className="text-2xl font-semibold mb-3 text-neutral-800">
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
                    <p className="text-xs text-neutral-500">Analyses des prix par région et type de bien</p>
                  </div>
                </div>
                
                <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-sm text-left flex items-start gap-2">
                  <div className="text-amber-500 mt-0.5"><i className="fas fa-hammer"></i></div>
                  <div>
                    <h3 className="font-medium text-sm">Matériaux de construction</h3>
                    <p className="text-xs text-neutral-500">Prix et disponibilité en Tunisie</p>
                  </div>
                </div>
                
                <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-sm text-left flex items-start gap-2">
                  <div className="text-blue-500 mt-0.5"><i className="fas fa-calculator"></i></div>
                  <div>
                    <h3 className="font-medium text-sm">Estimation de projets</h3>
                    <p className="text-xs text-neutral-500">Calcul détaillé des coûts</p>
                  </div>
                </div>
                
                <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-sm text-left flex items-start gap-2">
                  <div className="text-violet-500 mt-0.5"><i className="fas fa-university"></i></div>
                  <div>
                    <h3 className="font-medium text-sm">Réglementations</h3>
                    <p className="text-xs text-neutral-500">Permis et normes de construction</p>
                  </div>
                </div>
              </div>
              
              <p className="text-neutral-600 font-medium">
                {getGreetingMessage()}
              </p>
            </div>
          ) : (
            <div className="space-y-1 pb-2">
              {messages.map((msg, index) => (
                <ChatMessage
                  key={msg.id || index}
                  message={msg}
                  aiModel={aiModel}
                />
              ))}
              {isTyping && (
                <div className="flex mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                    <i className="fas fa-robot text-primary-600 text-sm"></i>
                  </div>
                  <div className="rounded-lg bg-white p-4 text-neutral-800 border border-neutral-200 shadow-sm">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-primary-300 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      <div className="w-2 h-2 rounded-full bg-primary-700 animate-bounce" style={{ animationDelay: "600ms" }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="border-t border-neutral-200 p-5 bg-white rounded-b-xl">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <div className="relative flex-1">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Posez votre question sur la construction ou l'immobilier en Tunisie..."
                disabled={isLoading || isTyping}
                className="pr-10 bg-white border-neutral-200 focus:border-primary-500 focus:ring focus:ring-primary-100 pl-5 py-6 rounded-xl shadow-sm text-neutral-700"
                ref={inputRef}
              />
              {input && (
                <button
                  type="button"
                  onClick={() => setInput("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <i className="fas fa-times-circle"></i>
                </button>
              )}
            </div>
            <Button
              type="submit"
              disabled={!input.trim() || isLoading || isTyping}
              className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-6 rounded-xl shadow-sm transition-colors"
            >
              <i className="fas fa-paper-plane"></i>
            </Button>
          </form>
          <div className="flex justify-between mt-4 text-xs text-neutral-500">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isTyping ? "bg-green-500 animate-pulse" : "bg-neutral-300"}`}></div>
              <span className="font-medium">{isTyping ? "En train de répondre..." : "Prêt à répondre"}</span>
            </div>
            <button 
              className="text-neutral-500 hover:text-neutral-700 flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-neutral-100 transition-colors"
              onClick={() => {
                setMessages([]);
                onNewChat();
              }}
            >
              <i className="fas fa-trash-alt text-xs"></i>
              <span>Effacer la conversation</span>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;
