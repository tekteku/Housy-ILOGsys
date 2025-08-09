import { useState } from "react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface ChatMessageProps {
  message: {
    id?: number;
    role: "user" | "assistant";
    content: string;
    timestamp?: string;
    suggestions?: string[]; // Ajouter les suggestions optionnelles
  };
  aiModel: string;
}

// Define types for chart data
interface ChartData {
  name: string;
  value: number;
  fill?: string;
}

interface ParsedContent {
  type: 'text' | 'chart';
  content: string | ChartData[];
  chartType?: 'bar' | 'line' | 'pie';
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
  
  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    // Envoyer un événement pour remplir l'input ou envoyer directement
    const event = new CustomEvent('suggest-question', { detail: suggestion });
    document.dispatchEvent(event);
  };
  
  // Parse content to detect charts and other rich content
  const parseContent = (content: string): ParsedContent[] => {
    const result: ParsedContent[] = [];
    
    try {
      // Check for specific JSON format starting with chartType:bar
      if (content.startsWith('{"chartType":"bar"')) {
        const chartData = JSON.parse(content);
        return [{ 
          type: 'chart', 
          content: chartData.data || [],
          chartType: 'bar'
        }];
      }
      
      // Check if the content is JSON and contains chart data (legacy format)
      if (content.includes('"chartData"') || content.includes('"type":"chart"')) {
        const parsedJson = JSON.parse(content);
        
        if (parsedJson.type === 'chart' && Array.isArray(parsedJson.chartData)) {
          return [{ 
            type: 'chart', 
            content: parsedJson.chartData,
            chartType: parsedJson.chartType || 'bar'
          }];
        }
        
        // Check if it's mixed content with both text and charts
        if (Array.isArray(parsedJson)) {
          return parsedJson.map((item: any) => {
            if (item.type === 'chart' && Array.isArray(item.chartData)) {
              return {
                type: 'chart',
                content: item.chartData,
                chartType: item.chartType || 'bar'
              };
            }
            return { type: 'text', content: item.content || '' };
          });
        }
      }
    } catch (error) {
      // If parsing fails, it's plain text - no need to log error
    }
    
    // Default case: treat as regular text
    return [{ type: 'text', content }];
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

  // Render chart component
  const renderChart = (chartData: ChartData[], chartType: string = 'bar') => {
    if (!chartData || chartData.length === 0) return null;
    
    // Currently only supporting bar charts
    return (
      <div className="w-full h-72 my-5 bg-white rounded-xl p-5 shadow-sm border border-neutral-100">
        <h4 className="text-sm font-semibold text-neutral-800 mb-3">Comparaison des données</h4>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="name" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
            />
            <Tooltip 
              contentStyle={{ 
                fontSize: '10px', 
                padding: '2px 8px',
                backgroundColor: "white",
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
              }}
              cursor={{fill: 'rgba(59, 130, 246, 0.05)'}}
            />
            <Legend wrapperStyle={{fontSize: "10px", paddingTop: "8px"}} />
            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
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
    <div className={cn("flex mb-6 group", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center mr-3 mt-1 flex-shrink-0 border border-primary-100 shadow-sm">
          {getAIModelIcon()}
        </div>
      )}
      
      <div
        className={cn(
          "max-w-3xl rounded-2xl shadow-sm transition-all",
          isExpanded ? "w-full" : "w-64 cursor-pointer",
          isUser
            ? "bg-primary-600 text-white border border-primary-700 p-4"
            : "bg-white text-neutral-800 border border-neutral-100 p-5"
        )}
        onClick={() => !isExpanded && setIsExpanded(true)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isUser ? (
              <>
                <span className="font-semibold text-sm">Vous</span>
                <span className="text-xs opacity-80">
                  {message.timestamp && formatDate(message.timestamp)}
                </span>
              </>
            ) : (
              <>
                <span className="font-semibold text-sm flex items-center">
                  Assistant Housy
                </span>
                <span className="text-xs opacity-80">
                  {message.timestamp && formatDate(message.timestamp)}
                </span>
              </>
            )}
          </div>
          
          {/* Message actions */}
          <div className={cn("flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity", 
                           isUser ? "text-white/80 hover:text-white" : "text-neutral-400 hover:text-neutral-700")}>
            {!isUser && (
              <button 
                className="p-1.5 rounded-full hover:bg-neutral-100 text-xs transition-colors" 
                onClick={copyMessage}
                title={isCopied ? "Copié!" : "Copier le message"}
              >
                <i className={cn("fas", isCopied ? "fa-check" : "fa-copy")}></i>
              </button>
            )}
            <button 
              className="p-1.5 rounded-full hover:bg-neutral-100 text-xs transition-colors" 
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Réduire" : "Agrandir"}
            >
              <i className={cn("fas", isExpanded ? "fa-chevron-up" : "fa-chevron-down")}></i>
            </button>
          </div>
        </div>
        
        {isExpanded && (
          <div className={cn("space-y-3 prose prose-sm leading-relaxed", 
                           isUser ? "prose-invert" : "")}>
            {parseContent(message.content).map((content, idx) => (
              <div key={idx}>
                {content.type === 'text' ? (
                  formatContent(content.content as string)
                ) : (
                  renderChart(content.content as ChartData[], content.chartType)
                )}
              </div>
            ))}
            
            {/* Affichage des suggestions sous le message de l'assistant */}
            {!isUser && message.suggestions && message.suggestions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-neutral-200/60 flex flex-wrap gap-2">
                {message.suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto py-1.5 px-3 bg-white hover:bg-primary-50 border-primary-200/70 text-primary-700 rounded-full font-medium shadow-sm transition-colors"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}
        
        {!isExpanded && (
          <div className="text-sm opacity-75 truncate">
            {message.content.substring(0, 100)}
            {message.content.length > 100 && "..."}
          </div>
        )}
      </div>
      
      {isUser && (
        <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white ml-3 mt-1 flex-shrink-0 shadow-sm">
          <i className="fas fa-user text-sm"></i>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
