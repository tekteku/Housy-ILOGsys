import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { EnhancedTooltip } from '@/components/ui/enhanced-tooltip';
import { FeedbackButton } from '@/components/ui/feedback-button';

interface ChatbotPreviewCardProps {
  className?: string;
  greeting?: string;
  recentQuestions?: string[];
}

const ChatbotPreviewCard = ({
  className,
  greeting = "Comment puis-je vous aider aujourd'hui ?",
  recentQuestions = [
    "Quel est l'avancement du projet Villa Sidi Bou Said ?",
    "Quels sont les matériaux les plus utilisés ce mois-ci ?",
    "Comment calculer le coût total d'un projet ?",
  ]
}: ChatbotPreviewCardProps) => {
  const [currentGreeting, setCurrentGreeting] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [suggestionVisible, setSuggestionVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  
  // Simuler l'effet de "typing" du chatbot pour afficher les lettres progressivement
  useEffect(() => {
    if (currentIndex < greeting.length) {
      const typingTimeout = setTimeout(() => {
        setCurrentGreeting(prev => prev + greeting[currentIndex]);
        setCurrentIndex(prev => prev + 1);
        setIsTyping(true);
      }, 50);
      
      return () => clearTimeout(typingTimeout);
    } else {
      setIsTyping(false);
      const suggestionTimeout = setTimeout(() => {
        setSuggestionVisible(true);
      }, 500);
      
      return () => clearTimeout(suggestionTimeout);
    }
  }, [currentIndex, greeting]);
  
  // Naviguer vers le chatbot avec une question suggérée
  const handleSuggestion = (question: string) => {
    // Préparer la question pour qu'elle soit disponible dans le chatbot
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatbot_suggested_question', question);
    }
  };
  
  const handleLike = () => {
    setLiked(true);
  };
  
  return (
    <div className={`bg-white p-4 rounded-lg shadow border border-neutral-200 flex flex-col items-center text-center transition-all duration-300 hover:shadow-md ${className}`}>
      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-3 relative">
        <i className="fas fa-robot text-xl"></i>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse"></span>
      </div>
      
      <div className="flex items-center gap-2">
        <h3 className="text-md font-semibold text-neutral-700 mb-1">AI Chatbot</h3>        <EnhancedTooltip 
          content={
            <div className="w-64 p-2">
              <h4 className="font-semibold mb-1">Votre assistant intelligent</h4>
              <p className="text-xs">Posez des questions sur vos projets, matériaux, et obtenez des estimations précises en temps réel.</p>
            </div>
          }
        >
          <i className="fas fa-info-circle text-neutral-400 text-sm cursor-help"></i>
        </EnhancedTooltip>
      </div>
      
      <div className="h-16 relative w-full mb-4 flex items-center justify-center">
        <div className="bg-primary-50 text-primary-800 p-2 rounded-lg text-sm w-full">
          {currentGreeting}
          {isTyping && (
            <span className="animate-blink">|</span>
          )}
        </div>
      </div>
      
      <div className={`space-y-2 w-full transition-all duration-500 ${suggestionVisible ? 'opacity-100 max-h-60' : 'opacity-0 max-h-0 overflow-hidden'}`}>
        <p className="text-xs text-neutral-600 mb-1">Questions fréquentes :</p>
        {recentQuestions.map((question, index) => (
          <Link key={index} href="/chatbot" onClick={() => handleSuggestion(question)}>
            <div className="text-sm text-left p-2 border border-neutral-200 rounded-md hover:bg-neutral-50 cursor-pointer transition-colors flex items-center">
              <i className="fas fa-search text-neutral-400 mr-2 text-xs"></i>
              {question}
            </div>
          </Link>
        ))}
      </div>
      
      <div className="mt-4 flex items-center gap-2 w-full">
        <Link href="/chatbot" className="flex-1">
          <Button variant="default" size="sm" className="w-full">
            <i className="fas fa-comments mr-2"></i>
            Ouvrir le chatbot
          </Button>
        </Link>        <FeedbackButton 
          onClick={handleLike}
          isLoading={false}
          isSuccess={liked}
          size="sm"
          variant="outline"
          aria-label="Aimer le chatbot"
        >
          {liked ? <i className="fas fa-heart"></i> : <i className="fas fa-thumbs-up"></i>}
        </FeedbackButton>
      </div>
      
      <div className="mt-2 text-xs text-neutral-500">
        <EnhancedTooltip content="Vos conversations sont privées et sécurisées">
          <span className="flex items-center justify-center gap-1 cursor-help">
            <i className="fas fa-lock text-[10px]"></i>
            Conversations sécurisées
          </span>
        </EnhancedTooltip>
      </div>
    </div>
  );
};

export default ChatbotPreviewCard;
