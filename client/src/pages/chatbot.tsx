import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import ChatInterface from "@/components/chatbot/ChatInterface";
import AIModelSelector from "@/components/chatbot/AIModelSelector";

const Chatbot = () => {
  const [sessionId, setSessionId] = useState(() => {
    const savedSessionId = localStorage.getItem("housy_chat_session_id");
    return savedSessionId || `session_${Date.now()}`;
  });
  
  const [selectedModel, setSelectedModel] = useState("openai");

  // Set document title
  useEffect(() => {
    document.title = "Chatbot IA | Housy";
    
    // Save session ID to local storage
    if (!localStorage.getItem("housy_chat_session_id")) {
      localStorage.setItem("housy_chat_session_id", sessionId);
    }
  }, [sessionId]);

  // Fetch chat history for current session
  const { data: chatHistory, isLoading } = useQuery({
    queryKey: [`/api/ai/chat/${sessionId}`],
  });

  // Start a new chat session
  const startNewChat = () => {
    const newSessionId = `session_${Date.now()}`;
    setSessionId(newSessionId);
    localStorage.setItem("housy_chat_session_id", newSessionId);
  };

  // Handle AI model change
  const handleModelChange = (model: string) => {
    setSelectedModel(model);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-neutral-900">
            Chatbot IA
          </h1>
          <p className="text-neutral-500 mt-1">
            Posez vos questions sur la construction et l'immobilier
          </p>
        </div>
        <div className="flex gap-3">
          <AIModelSelector
            selectedModel={selectedModel}
            onModelChange={handleModelChange}
          />
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar with suggestions */}
        <Card className="lg:col-span-3 hidden lg:block">
          <CardContent className="p-4">
            <h3 className="font-medium text-neutral-900 mb-3">Suggestions de questions</h3>
            
            <div className="space-y-2">
              <button
                className="p-3 w-full text-left text-sm rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
                onClick={() => 
                  document.dispatchEvent(new CustomEvent('suggest-question', {
                    detail: "Quels sont les matériaux nécessaires pour construire une maison de 120m² ?"
                  }))
                }
              >
                Quels sont les matériaux nécessaires pour construire une maison de 120m² ?
              </button>
              
              <button
                className="p-3 w-full text-left text-sm rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
                onClick={() => 
                  document.dispatchEvent(new CustomEvent('suggest-question', {
                    detail: "Comment estimer le coût de construction au m² en Tunisie ?"
                  }))
                }
              >
                Comment estimer le coût de construction au m² en Tunisie ?
              </button>
              
              <button
                className="p-3 w-full text-left text-sm rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
                onClick={() => 
                  document.dispatchEvent(new CustomEvent('suggest-question', {
                    detail: "Quelles sont les tendances récentes du marché immobilier à Tunis ?"
                  }))
                }
              >
                Quelles sont les tendances récentes du marché immobilier à Tunis ?
              </button>
              
              <button
                className="p-3 w-full text-left text-sm rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
                onClick={() => 
                  document.dispatchEvent(new CustomEvent('suggest-question', {
                    detail: "Quelles sont les réglementations pour les permis de construire ?"
                  }))
                }
              >
                Quelles sont les réglementations pour les permis de construire ?
              </button>
              
              <button
                className="p-3 w-full text-left text-sm rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
                onClick={() => 
                  document.dispatchEvent(new CustomEvent('suggest-question', {
                    detail: "Quelle est la meilleure région pour investir dans l'immobilier en Tunisie ?"
                  }))
                }
              >
                Quelle est la meilleure région pour investir dans l'immobilier en Tunisie ?
              </button>
            </div>
            
            <div className="mt-6 pt-4 border-t border-neutral-200">
              <button
                className="flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
                onClick={startNewChat}
              >
                <i className="fas fa-plus-circle mr-2"></i>
                Nouvelle conversation
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <div className="lg:col-span-9">
          <ChatInterface 
            sessionId={sessionId}
            initialMessages={chatHistory || []}
            isLoading={isLoading}
            aiModel={selectedModel}
            onNewChat={startNewChat}
          />
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
