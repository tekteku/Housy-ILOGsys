import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Calculator, Home, ArrowRight, Sparkles, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface EstimationQuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  prompt: string;
  image?: string;
}

const QUICK_ACTIONS: EstimationQuickAction[] = [
  {
    title: "Estimation Maison 120m²",
    description: "Coût construction maison moderne",
    icon: <Home className="w-5 h-5" />,
    prompt: "Combien coûte la construction d'une maison de 120m² à Tunis ?",
    image: "/static/images/modern_house_1.png"
  },
  {
    title: "Prix Matériaux",
    description: "Devis matériaux de construction",
    icon: <Calculator className="w-5 h-5" />,
    prompt: "Quels sont les prix des matériaux de construction principaux en Tunisie ?",
    image: "/static/images/d1.png"
  },
  {
    title: "Villa Moderne",
    description: "Estimation villa avec piscine",
    icon: <Sparkles className="w-5 h-5" />,
    prompt: "Estimation pour une villa moderne de 200m² avec piscine à Sousse",
    image: "/static/images/modern_house_3.png"
  }
];

interface AssistantChatbotProps {
  onRegisterPrompt?: () => void;
}

export const AssistantChatbot: React.FC<AssistantChatbotProps> = ({ onRegisterPrompt }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [conversationId] = useState(`guest_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Message de bienvenue
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: "🏠 Bienvenue sur Housy ! Je suis votre assistant IA spécialisé en construction et immobilier tunisien.\n\nJe peux vous aider avec :\n• Estimations de coûts de construction\n• Prix des matériaux en temps réel\n• Conseils pour vos projets\n• Tendances du marché immobilier\n\nChoisissez une action rapide ci-dessous ou posez-moi directement votre question !",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    setShowQuickActions(false);
    
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Message de frappe temporaire
    const typingMessage: Message = {
      id: 'typing',
      role: 'assistant',
      content: 'En train de calculer...',
      timestamp: new Date(),
      isTyping: true
    };

    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          conversationId
        }),
      });

      const data = await response.json();

      if (data.data?.response) {
        const assistantMessage: Message = {
          id: `msg_${Date.now()}_assistant`,
          role: 'assistant',
          content: data.data.response,
          timestamp: new Date()
        };

        setMessages(prev => prev.filter(m => m.id !== 'typing').concat(assistantMessage));

        // Prompt d'inscription après 3 messages
        if (messages.filter(m => m.role === 'user').length >= 2) {
          setTimeout(() => {
            const registerPrompt: Message = {
              id: 'register_prompt',
              role: 'assistant',
              content: "💡 **Vous aimez nos estimations ?** Inscrivez-vous gratuitement pour :\n• Sauvegarder vos projets\n• Accéder aux devis détaillés\n• Recevoir des alertes prix\n• Contacter des entrepreneurs\n\n[S'inscrire maintenant →]",
              timestamp: new Date()
            };
            setMessages(prev => [...prev, registerPrompt]);
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
      setMessages(prev => prev.filter(m => m.id !== 'typing').concat({
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: "Désolé, une erreur s'est produite. Veuillez réessayer.",
        timestamp: new Date()
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: EstimationQuickAction) => {
    sendMessage(action.prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const formatMessage = (content: string) => {
    // Format les messages avec markdown simple
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[(.*?)\]/g, '<span class="text-blue-600 cursor-pointer hover:underline">$1</span>')
      .replace(/•/g, '•')
      .replace(/\n/g, '<br />');
  };

  return (
    <>
      {/* Bouton flottant */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${isOpen ? 'hidden' : ''}`}
      >
        <MessageCircle className="w-6 h-6" />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
        />
      </motion.button>

      {/* Interface du chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Assistant Housy</h3>
                  <p className="text-xs opacity-90">Estimation & Construction</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[400px]">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.isTyping
                        ? 'bg-gray-100 text-gray-600 animate-pulse'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div 
                        dangerouslySetInnerHTML={{ 
                          __html: formatMessage(message.content) 
                        }}
                        onClick={(e) => {
                          const target = e.target as HTMLElement;
                          if (target.textContent?.includes('S\'inscrire maintenant')) {
                            onRegisterPrompt?.();
                          }
                        }}
                      />
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Actions rapides */}
              {showQuickActions && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3"
                >
                  <p className="text-sm text-gray-600 font-medium">Actions rapides :</p>
                  {QUICK_ACTIONS.map((action, index) => (
                    <motion.button
                      key={action.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleQuickAction(action)}
                      className="w-full p-3 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-xl border border-blue-200 text-left transition-all duration-200 group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                          {action.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{action.title}</h4>
                          <p className="text-xs text-gray-600">{action.description}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-gray-50">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Posez votre question..."
                  className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  onClick={() => sendMessage(inputValue)}
                  disabled={isLoading || !inputValue.trim()}
                  className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Estimations basées sur {' '}
                <span className="font-medium text-blue-600">6036+ propriétés tunisiennes</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
