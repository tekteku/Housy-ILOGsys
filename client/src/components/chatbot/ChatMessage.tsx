import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: {
    id?: number;
    role: "user" | "assistant";
    content: string;
    timestamp?: string;
  };
  aiModel: string;
}

const ChatMessage = ({ message, aiModel }: ChatMessageProps) => {
  const isUser = message.role === "user";

  // Format code blocks in the message
  const formatContent = (content: string) => {
    // Split the content by code blocks
    const parts = content.split(/(```(?:.*?)\n[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      // Check if this part is a code block
      if (part.startsWith("```") && part.endsWith("```")) {
        // Extract the language and code
        const match = part.match(/```(.*?)\n([\s\S]*?)```/);
        if (match) {
          const [, language, code] = match;
          return (
            <div key={index} className="my-2 bg-neutral-800 text-white rounded-md overflow-hidden">
              <div className="flex items-center justify-between px-4 py-1 bg-neutral-700 text-xs text-neutral-300">
                <span>{language || "Code"}</span>
                <button 
                  className="hover:text-white focus:outline-none"
                  onClick={() => navigator.clipboard.writeText(code)}
                  title="Copier le code"
                >
                  <i className="fas fa-copy"></i>
                </button>
              </div>
              <pre className="p-4 text-sm overflow-x-auto">
                <code>{code}</code>
              </pre>
            </div>
          );
        }
      }
      
      // Convert links to clickable elements
      const linkRegex = /(https?:\/\/[^\s]+)/g;
      const textWithLinks = part.split(linkRegex).map((text, i) => {
        if (text.match(linkRegex)) {
          return (
            <a 
              key={i} 
              href={text} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary-600 hover:underline"
            >
              {text}
            </a>
          );
        }
        return text;
      });
      
      // Handle bullet points
      const withBulletPoints = textWithLinks.map((item) => {
        if (typeof item !== 'string') return item;
        
        return item.split(/\n/g).map((line, i) => {
          // Handle bullet points with - or *
          if (line.trim().match(/^[*-] /)) {
            return (
              <div key={i} className="flex items-start space-x-2 my-1">
                <span className="text-neutral-400 mt-0.5">•</span>
                <span>{line.trim().replace(/^[*-] /, '')}</span>
              </div>
            );
          }
          
          // Handle numbered lists
          if (line.trim().match(/^\d+\. /)) {
            const num = line.match(/^\d+/)?.[0];
            return (
              <div key={i} className="flex items-start space-x-2 my-1">
                <span className="text-neutral-400 mt-0.5">{num}.</span>
                <span>{line.trim().replace(/^\d+\. /, '')}</span>
              </div>
            );
          }
          
          return line ? <p key={i}>{line}</p> : <br key={i} />;
        });
      });
      
      return <div key={index}>{withBulletPoints}</div>;
    });
  };

  // Get appropriate AI model icon
  const getAIModelIcon = () => {
    switch (aiModel) {
      case "openai":
        return <i className="fas fa-robot"></i>;
      case "claude":
        return <i className="fas fa-comment-dots"></i>;
      case "ollama":
        return <i className="fas fa-brain"></i>;
      case "deepseek":
        return <i className="fas fa-search"></i>;
      default:
        return <i className="fas fa-robot"></i>;
    }
  };

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-3xl rounded-lg p-3",
          isUser
            ? "bg-primary-600 text-white"
            : "bg-neutral-100 text-neutral-800"
        )}
      >
        <div className="flex items-center gap-2 mb-1">
          {isUser ? (
            <>
              <span className="font-medium text-sm">Vous</span>
              <span className="text-xs opacity-70">
                {message.timestamp && formatDate(message.timestamp)}
              </span>
            </>
          ) : (
            <>
              <span className="font-medium text-sm flex items-center">
                {getAIModelIcon()}
                <span className="ml-1">Assistant Housy</span>
              </span>
              <span className="text-xs opacity-70">
                {message.timestamp && formatDate(message.timestamp)}
              </span>
            </>
          )}
        </div>
        <div className="space-y-2">{formatContent(message.content)}</div>
      </div>
    </div>
  );
};

export default ChatMessage;
