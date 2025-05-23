import { Link } from 'wouter';
import { Button } from '@/components/ui/button'; // Assumant shadcn/ui

const ChatbotPreviewCard = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow border border-neutral-200 flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-3">
        <i className="fas fa-robot text-xl"></i>
      </div>
      <h3 className="text-md font-semibold text-neutral-700 mb-1">AI Chatbot</h3>
      <p className="text-xs text-neutral-500 mb-4">Comment puis-je vous aider aujourd'hui ?</p>
      <Link to="/chatbot">
        <Button size="sm" className="w-full">Ouvrir le Chatbot</Button>
      </Link>
    </div>
  );
};

export default ChatbotPreviewCard;
