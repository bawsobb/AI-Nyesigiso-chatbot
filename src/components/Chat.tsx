import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { chatWithGemini } from '@/src/services/gemini';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial greeting
    const initialGreeting = "I ni sogoma ! Bienvenue chez Nyèsigiso. Je suis votre assistant virtuel. Comment puis-je vous aider aujourd'hui ?";
    setMessages([{ role: 'model', text: initialGreeting }]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    const chatHistory = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));
    
    chatHistory.push({ role: 'user', parts: [{ text: userMessage }] });

    const response = await chatWithGemini(chatHistory);
    
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4 font-sans">
      <Card className="w-full max-w-md h-[600px] flex flex-col shadow-xl border-t-4 border-t-green-600">
        <CardHeader className="bg-white border-b py-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-green-100">
              <AvatarImage src="https://picsum.photos/seed/nyesigiso/200" alt="Nyèsigiso" />
              <AvatarFallback className="bg-green-600 text-white font-bold">NY</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg font-bold text-slate-800">Nyèsigiso Assistant</CardTitle>
              <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                En ligne
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden p-0 bg-[#e5ddd5] bg-opacity-30 relative">
          {/* WhatsApp-like background pattern could go here */}
          <ScrollArea className="h-full p-4">
            <div className="flex flex-col gap-3">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-green-600 text-white rounded-tr-none'
                          : 'bg-white text-slate-800 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white px-4 py-2 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                    <span className="text-xs text-slate-500 italic">Nyèsigiso écrit...</span>
                  </div>
                </motion.div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="p-3 bg-white border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex w-full items-center gap-2"
          >
            <Input
              placeholder="Écrivez votre message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-50 border-none focus-visible:ring-green-600 rounded-full px-4"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="rounded-full bg-green-600 hover:bg-green-700 h-10 w-10 shrink-0 shadow-md"
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
