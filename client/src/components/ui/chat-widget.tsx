import { useState } from 'react';
import { 
  PawPrint, 
  X, 
  Send, 
  Loader2, 
  Phone, 
  AlarmClock,
  AlertCircle,
  Stethoscope
} from 'lucide-react';
import { Button } from './button';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{type: 'user' | 'system', text: string}[]>([
    {type: 'system', text: 'Hello! How can we help you today? Our team is here to assist with pet adoptions, care questions, or emergencies.'},
  ]);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const toggleChat = () => {
    setIsOpen(!isOpen);

    // If we're opening the chat and it's just the initial message, add the menu options
    if (!isOpen && messages.length === 1) {
      setMessages([
        ...messages,
        {
          type: 'system', 
          text: 'Select an option or type your question:',
        },
        {
          type: 'system', 
          text: '• Emergency pet care assistance\n• Adoption process questions\n• Schedule a visit\n• General pet care advice'
        }
      ]);
    }
  };

  const sendMessage = () => {
    if (!messageText.trim()) return;
    
    // Add user message
    setMessages([...messages, {type: 'user', text: messageText}]);
    setIsLoading(true);
    
    // Simulate response based on message content
    setTimeout(() => {
      let response = '';
      const lowerCaseMsg = messageText.toLowerCase();
      
      if (lowerCaseMsg.includes('emergency') || lowerCaseMsg.includes('hurt') || lowerCaseMsg.includes('injured')) {
        response = "I'm connecting you with our emergency assistance team. In the meantime, please keep your pet calm and comfortable. For immediate life-threatening emergencies, please call our emergency hotline at (555) 123-4567. What's happening with your pet right now?";
      } else if (lowerCaseMsg.includes('adopt') || lowerCaseMsg.includes('adoption')) {
        response = "Thank you for your interest in adoption! Our adoption process is designed to ensure good matches between pets and families. The process typically includes an application, meet-and-greet, home check, and finally adoption. Would you like more details about a specific part of this process?";
      } else if (lowerCaseMsg.includes('visit') || lowerCaseMsg.includes('appointment') || lowerCaseMsg.includes('schedule')) {
        response = "We'd be happy to help you schedule a visit! Our facility is open for visits Monday-Friday 10am-7pm and Saturday-Sunday 10am-5pm. Would you prefer to meet a specific pet or would you like a general tour?";
      } else {
        response = "Thank you for your message! One of our pet care specialists will respond shortly. Is there anything specific about your pet that we should know to better assist you?";
      }
      
      setMessages(prev => [...prev, {type: 'system', text: response}]);
      setIsLoading(false);
      setMessageText('');
    }, 1000);
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

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 bg-gray-50 flex flex-col space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`rounded-2xl px-4 py-2 max-w-[80%] ${
                    message.type === 'user'
                      ? 'bg-primary text-white rounded-tr-none'
                      : 'bg-white border border-gray-200 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line text-sm">{message.text}</p>
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