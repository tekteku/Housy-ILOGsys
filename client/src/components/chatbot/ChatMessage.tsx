import { useState } from "react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
  const [isExpanded, setIsExpanded] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  
  // Copy message to clipboard
  const copyMessage = () => {
    navigator.clipboard.writeText(message.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

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
    <div className={cn("flex mb-4 group", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-2 mt-1 flex-shrink-0 border border-primary-200">
          {getAIModelIcon()}
        </div>
      )}
      
      <div
        className={cn(
          "max-w-3xl rounded-lg p-4 shadow-sm transition-all",
          isExpanded ? "w-full" : "w-64 cursor-pointer",
          isUser
            ? "bg-primary-600 text-white border border-primary-700"
            : "bg-white text-neutral-800 border border-neutral-200"
        )}
        onClick={() => !isExpanded && setIsExpanded(true)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
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
                  Assistant Housy
                </span>
                <span className="text-xs opacity-70">
                  {message.timestamp && formatDate(message.timestamp)}
                </span>
              </>
            )}
          </div>
          
          {/* Message actions */}
          <div className={cn("flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity", 
                           isUser ? "text-white" : "text-neutral-500")}>
            {!isUser && (
              <button 
                className="p-1 rounded hover:bg-neutral-100 text-xs" 
                onClick={copyMessage}
                title={isCopied ? "Copié!" : "Copier le message"}
              >
                <i className={cn("fas", isCopied ? "fa-check" : "fa-copy")}></i>
              </button>
            )}
            <button 
              className="p-1 rounded hover:bg-neutral-100 text-xs" 
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Réduire" : "Agrandir"}
            >
              <i className={cn("fas", isExpanded ? "fa-chevron-up" : "fa-chevron-down")}></i>
            </button>
          </div>
        </div>
        
        {isExpanded && (
          <div className={cn("space-y-2 prose prose-sm", 
                           isUser ? "prose-invert" : "")}>{formatContent(message.content)}</div>
        )}
        
        {!isExpanded && (
          <div className="text-sm opacity-75 truncate">
            {message.content.substring(0, 100)}
            {message.content.length > 100 && "..."}
          </div>
        )}
      </div>
      
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white ml-2 mt-1 flex-shrink-0">
          <i className="fas fa-user text-sm"></i>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
