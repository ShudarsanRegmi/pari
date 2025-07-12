import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/lib/useAuth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  ShoppingBag, 
  BookOpen, 
  Leaf,
  Loader2,
  MessageCircle,
  Search,
  Package,
  Coins
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
          user_input: input.trim()
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

  const formatMessage = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('•')) {
          return `<div class="flex items-start space-x-2"><span class="text-green-600 mt-1">•</span><span>${line.substring(1)}</span></div>`;
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return `<strong class="text-green-600">${line.slice(2, -2)}</strong>`;
        }
        return line;
      })
      .join('<br>');
  };

  return (
    <>
      <Helmet>
        <title>PariMitra AI Assistant - Parivartana</title>
        <meta name="description" content="Chat with PariMitra, your AI assistant for sustainable marketplace queries and product discovery." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="relative">
                  <Avatar className="h-16 w-16 border-4 border-green-200">
                    <AvatarImage src="/api/placeholder/64/64" />
                    <AvatarFallback className="bg-green-100 text-green-600">
                      <Bot className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-1 -right-1">
                    <div className="bg-green-500 rounded-full p-1">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                PariMitra AI Assistant
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Your intelligent companion for navigating the sustainable marketplace. 
                Ask about products, tokens, sustainability tips, and more!
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MessageCircle className="h-5 w-5" />
                      <span>Quick Actions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {quickActions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full justify-start text-left h-auto p-3"
                        onClick={() => handleQuickAction(action.prompt)}
                      >
                        <action.icon className="h-4 w-4 mr-3 text-green-600" />
                        <span className="text-sm">{action.label}</span>
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Chat Interface */}
              <div className="lg:col-span-2">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader className="border-b">
                    <CardTitle className="flex items-center space-x-2">
                      <Bot className="h-5 w-5 text-green-600" />
                      <span>Chat with PariMitra</span>
                      {isLoading && (
                        <Badge variant="secondary" className="ml-auto">
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Typing...
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="flex-1 p-0">
                    <ScrollArea className="h-full p-4">
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`flex items-start space-x-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                              <Avatar className={`h-8 w-8 ${message.type === 'user' ? 'bg-blue-100' : 'bg-green-100'}`}>
                                <AvatarFallback className={message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}>
                                  {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                </AvatarFallback>
                              </Avatar>
                              <div className={`rounded-lg p-3 ${
                                message.type === 'user' 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-gray-100 text-gray-900'
                              }`}>
                                <div 
                                  className="text-sm"
                                  dangerouslySetInnerHTML={{
                                    __html: formatMessage(message.content)
                                  }}
                                />
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
                    </ScrollArea>
                  </CardContent>
                  
                  <Separator />
                  
                  <div className="p-4">
                    <form onSubmit={sendMessage} className="flex space-x-2">
                      <Input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask PariMitra anything..."
                        className="flex-1"
                        disabled={isLoading}
                      />
                      <Button 
                        type="submit" 
                        disabled={!input.trim() || isLoading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </form>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chatbot; 