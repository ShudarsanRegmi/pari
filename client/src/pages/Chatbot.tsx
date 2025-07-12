import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/lib/useAuth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  ShoppingBag, 
  BookOpen, 
  Leaf,
  Loader2,
  Search,
  Package,
  Coins,
  ArrowLeft
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const Chatbot = () => {
  const { currentUser } = useAuth();
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm **PariMitra**, your AI assistant for the sustainable marketplace. I can help you with:\n\n• 🛍️ **Product Search** - Find items by name or category\n• 📚 **Book Listings** - Browse available books\n• 💻 **Electronics** - Find tech items\n• 👕 **Clothing** - Discover fashion items\n• 📝 **Stationery** - Office and study supplies\n• 🪙 **Token System** - Learn about green tokens\n• 💡 **Sustainability Tips** - Eco-friendly advice\n\nWhat would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_input: input.trim(),
          user_id: currentUser?.mongoUser?._id || currentUser?.uid || null
        })
      });

      const data = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { icon: Search, label: 'Search Products', prompt: 'Show me available products' },
    { icon: BookOpen, label: 'Browse Books', prompt: 'List all available books' },
    { icon: Package, label: 'Electronics', prompt: 'Show me electronics items' },
    { icon: ShoppingBag, label: 'Clothing', prompt: 'Browse clothing items' },
    { icon: Coins, label: 'Token System', prompt: 'Explain the green token system' },
    { icon: Leaf, label: 'Sustainability', prompt: 'Give me sustainability tips' }
  ];

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <>
      <Helmet>
        <title>PariMitra AI Assistant - Parivartana</title>
        <meta name="description" content="Chat with PariMitra, your AI assistant for sustainable marketplace queries and product discovery." />
      </Helmet>

      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8 border-2 border-green-200">
                  <AvatarImage src="/api/placeholder/32/32" />
                  <AvatarFallback className="bg-green-100 text-green-600">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="font-semibold text-gray-900">PariMitra AI Assistant</h1>
                  <p className="text-xs text-gray-500">Sustainable marketplace assistant</p>
                </div>
              </div>
            </div>
            {isLoading && (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Typing...
              </Badge>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <Avatar className={`h-8 w-8 flex-shrink-0 ${message.type === 'user' ? 'bg-blue-100' : 'bg-green-100'}`}>
                    <AvatarFallback className={message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}>
                      {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                  }`}>
                    {message.type === 'user' ? (
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </div>
                    ) : (
                      <div className="chatbot-markdown">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            // Custom styling for different markdown elements
                            h1: ({children}) => <h1>{children}</h1>,
                            h2: ({children}) => <h2>{children}</h2>,
                            h3: ({children}) => <h3>{children}</h3>,
                            p: ({children}) => <p>{children}</p>,
                            ul: ({children, ...props}) => <ul {...props}>{children}</ul>,
                            ol: ({children, ...props}) => <ol {...props}>{children}</ol>,
                            li: ({children, ...props}) => <li {...props}>{children}</li>,
                            strong: ({children}) => <strong>{children}</strong>,
                            em: ({children}) => <em>{children}</em>,
                            code: ({children}) => <code>{children}</code>,
                            pre: ({children}) => <pre>{children}</pre>,
                            blockquote: ({children}) => <blockquote>{children}</blockquote>,
                            a: ({children, href}) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
                            table: ({children}) => <table>{children}</table>,
                            th: ({children}) => <th>{children}</th>,
                            td: ({children}) => <td>{children}</td>,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                    <div className={`text-xs mt-2 ${
                      message.type === 'user' ? 'text-blue-200' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={sendMessage} className="flex space-x-3">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask PariMitra anything..."
                  className="pr-12 h-12 text-base border-gray-300 focus:border-green-500 focus:ring-green-500"
                  disabled={isLoading}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-1">
                  {quickActions.slice(0, 3).map((action, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuickAction(action.prompt)}
                      className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
                    >
                      <action.icon className="h-3 w-3 mr-1" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="bg-green-600 hover:bg-green-700 h-12 px-6"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chatbot; 