import { useState, useEffect, useRef } from 'react';
import { 
  PawPrint, 
  X, 
  Send, 
  Loader2, 
  Phone, 
  AlarmClock,
  AlertCircle,
  Stethoscope,
  WifiOff
} from 'lucide-react';
import { Button } from './button';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export function ChatWidget() {
  // Basic state
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{
    id?: string | number;
    type: 'user' | 'system';
    text: string;
    timestamp?: string;
    sender?: { 
      userId: string | number;
      username: string;
      isAdmin: boolean;
    };
  }[]>([
    {
      type: 'system', 
      text: 'Hello! How can we help you today? Our team is here to assist with pet adoptions, care questions, or emergencies.',
      timestamp: new Date().toISOString()
    },
  ]);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  
  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Hooks
  const { user } = useAuth();
  const { toast } = useToast();

  // Initialize WebSocket connection
  useEffect(() => {
    if (!isOpen) return;
    
    const connectWebSocket = () => {
      setConnectionStatus('connecting');
      
      // Determine WebSocket URL
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log('WebSocket connection established');
        setConnectionStatus('connected');
        
        // Send authentication info if the user is logged in
        if (user) {
          ws.send(JSON.stringify({
            type: 'auth',
            userId: user.id,
            username: user.name || user.username,
            isAdmin: user.role === 'admin'
          }));
        }
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received message:', data);
          
          if (data.type === 'chat_message') {
            handleIncomingChatMessage(data.data);
          } else if (data.type === 'system_message') {
            setMessages(prev => [...prev, {
              type: 'system',
              text: data.data.message,
              timestamp: data.data.timestamp
            }]);
          } else if (data.type === 'error') {
            toast({
              title: 'Chat Error',
              description: data.data.message,
              variant: 'destructive'
            });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('disconnected');
        toast({
          title: 'Connection Error',
          description: 'Could not connect to chat. Please try again later.',
          variant: 'destructive'
        });
      };
      
      ws.onclose = () => {
        console.log('WebSocket connection closed');
        setConnectionStatus('disconnected');
      };
    };
    
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [isOpen, user, toast]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleIncomingChatMessage = (data: any) => {
    const messageType: "user" | "system" =
      data?.sender?.userId === (user?.id || "guest") ? "user" : "system";

    // Format incoming message
    const newMessage = {
      id: data.id,
      type: messageType,
      text: data.message,
      timestamp: data.timestamp,
      sender: data.sender
    };
    
    setMessages(prev => [...prev, newMessage]);
    setIsLoading(false);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);

    // If we're opening the chat for the first time, add the menu options
    if (!isOpen && messages.length === 1) {
      setMessages([
        ...messages,
        {
          type: 'system', 
          text: 'Select an option or type your question:',
          timestamp: new Date().toISOString()
        },
        {
          type: 'system', 
          text: '• Emergency pet care assistance\n• Adoption process questions\n• Schedule a visit\n• General pet care advice',
          timestamp: new Date().toISOString()
        }
      ]);
    }
  };

  const sendMessage = () => {
    if (!messageText.trim()) return;
    
    // Add user message to UI immediately for better responsiveness
    const userMessage = {
      type: 'user' as const,
      text: messageText,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    // Check if WebSocket is open before sending
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // Send message through WebSocket
      wsRef.current.send(JSON.stringify({
        type: 'chat_message',
        message: messageText
      }));
      
      setMessageText('');
    } else {
      // Fallback for when WebSocket is not available
      toast({
        title: 'Connection Issue',
        description: 'Could not send message. Reconnecting...',
        variant: 'destructive'
      });
      
      // Simulate response for better UX even when WebSocket fails
      setTimeout(() => {
        const fallbackResponse = {
          type: 'system' as const,
          text: "I'm having trouble connecting to the server right now. Please try again in a moment.",
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, fallbackResponse]);
        setIsLoading(false);
        setMessageText('');
      }, 1000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderIcon = () => (
    <div className="relative">
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
      <PawPrint className="h-6 w-6" />
    </div>
  );

  return (
    <div className="fixed right-6 bottom-6 z-50">
      {/* Chat Toggle Button */}
      <Button
        onClick={toggleChat}
        className={`rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 ${
          isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'
        }`}
      >
        {isOpen ? <X className="h-6 w-6" /> : renderIcon()}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-primary/20 overflow-hidden transition-all-ease">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary p-4 text-white">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-full mr-3">
                <PawPrint className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold">PawPal Support</h3>
                <p className="text-xs opacity-80">We usually respond in a few minutes</p>
              </div>
            </div>
          </div>

          {/* Emergency Contact Bar */}
          <div className="bg-red-50 p-2 border-b border-red-100 flex items-center justify-between">
            <div className="flex items-center text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>Pet emergency?</span>
            </div>
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                variant="ghost"
                className="bg-red-100 hover:bg-red-200 text-red-600 h-8 px-2 rounded-full flex items-center"
              >
                <Phone className="h-3 w-3 mr-1" />
                <span className="text-xs">Call</span>
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                className="bg-amber-100 hover:bg-amber-200 text-amber-600 h-8 px-2 rounded-full flex items-center"
              >
                <Stethoscope className="h-3 w-3 mr-1" />
                <span className="text-xs">Find Vet</span>
              </Button>
            </div>
          </div>

          {/* Connection Status */}
          {connectionStatus !== 'connected' && (
            <div className="bg-amber-50 px-3 py-1 border-b border-amber-100 flex items-center justify-center text-amber-600 text-xs">
              <WifiOff className="h-3 w-3 mr-1" /> 
              {connectionStatus === 'connecting' ? 'Connecting to chat...' : 'Disconnected - messages may not be delivered'}
            </div>
          )}

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 bg-gray-50 flex flex-col space-y-3">
            {messages.map((message, index) => (
              <div
                key={message.id || index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`rounded-2xl px-4 py-2 max-w-[80%] ${
                    message.type === 'user'
                      ? 'bg-primary text-white rounded-tr-none'
                      : 'bg-white border border-gray-200 rounded-tl-none'
                  }`}
                >
                  {message.sender?.isAdmin && (
                    <div className="text-xs font-semibold mb-1 text-pink-600">
                      {message.sender.username} · Staff
                    </div>
                  )}
                  <p className="whitespace-pre-line text-sm">{message.text}</p>
                  {message.timestamp && (
                    <div className="text-[10px] mt-1 opacity-50 text-right">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-2 bg-white border border-gray-200 rounded-tl-none">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              </div>
            )}
            {/* This div is for auto-scrolling to bottom of messages */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200 bg-white">
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 bg-transparent outline-none resize-none text-sm max-h-20"
                rows={1}
              />
              <Button
                onClick={sendMessage}
                disabled={!messageText.trim() || isLoading}
                size="sm"
                className="rounded-full h-8 w-8 p-0 ml-2 bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-center mt-2">
              <p className="text-xs text-gray-400 flex justify-center items-center">
                <AlarmClock className="h-3 w-3 mr-1" /> 
                24/7 support for emergencies
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}