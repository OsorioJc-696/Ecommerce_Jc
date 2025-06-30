'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Card, CardContent, CardFooter, CardHeader, CardTitle
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  MessageSquare, Send, X, Bot, User as UserIcon, Loader2, Mic, MicOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { chatWithBot } from '@/ai/flows/chat-flow';
import type { ChatInput, ChatOutput } from '@/ai/schemas/chat-schemas';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }

  interface SpeechRecognitionEvent extends Event {
    readonly results: SpeechRecognitionResultList;
  }
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: number;
}

const SpeechRecognition =
  typeof window !== 'undefined' &&
  (window.SpeechRecognition || (window as any).webkitSpeechRecognition);

export function ChatWidget({ userId }: { userId?: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const STORAGE_KEY = `chat-messages-${userId ?? 'guest'}`;

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, []);

  // Cargar historial
  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setMessages(parsed);
            return;
          }
        } catch {}
      }

      // Si no hay historial previo
      setMessages([
        {
          id: 'greeting-' + Date.now(),
          sender: 'bot',
          text: "Hello! I'm the DigitalZone AI Assistant. How can I help you with our tech products today?",
          timestamp: Date.now(),
        },
      ]);
    }
  }, [isOpen, STORAGE_KEY]);

  // Guardar historial en localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages, STORAGE_KEY]);

  // Auto scroll al fondo
  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen, scrollToBottom]);

  const handleSendMessage = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: Message = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: trimmedInput,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const chatInput: ChatInput = { message: trimmedInput };
      const response: ChatOutput = await chatWithBot(chatInput);

      const botMessage: Message = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: response.reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Bot error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: 'error-' + Date.now(),
          sender: 'bot',
          text: 'Lo siento, ocurrió un error. Inténtalo de nuevo.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const toggleListening = () => {
    if (!SpeechRecognition) return alert('Tu navegador no soporta reconocimiento de voz.');

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      const recognition = new (SpeechRecognition as any)();
      recognition.lang = 'es-PE';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(prev => (prev ? prev + ' ' : '') + transcript);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    }
  };

const isMobile = window.innerWidth < 640;
const cardHeight = isMobile ? 'h-[95vh]' : 'h-[65vh]';


  return (
    <>
      {/* Floating Button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full z-50 bg-primary text-white shadow-xl",
          "hover:scale-105 hover:shadow-2xl transition-all duration-300",
          isOpen ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'
        )}
        onClick={() => setIsOpen(true)}
        aria-label="Open Chat"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>

      {/* Chat Window */}
      <Card
  className={cn(
    "fixed bottom-0 right-0 z-50 flex flex-col shadow-2xl border border-border bg-background backdrop-blur",
    "w-full sm:w-[380px] max-h-[95vh] sm:max-h-[500px]",
    "h-[95vh] sm:h-[65vh] rounded-none sm:rounded-2xl",
    "transition-all duration-300 ease-in-out",
    isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'
  )}
>


        <CardHeader className="flex flex-row items-center justify-between px-4 py-3 bg-muted/60 border-b">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 border-2 border-primary">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-base font-semibold">DigitalZone Assistant</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close chat</span>
          </Button>
        </CardHeader>

        
        <CardContent className="flex-grow p-0 overflow-hidden">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-end gap-2",
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.sender === 'bot' && (
                    <Avatar className="h-6 w-6 border flex-shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        <Bot className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-[75%] rounded-xl px-4 py-2 text-sm leading-snug shadow-sm",
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none ml-auto'
                        : 'bg-muted text-foreground rounded-bl-none mr-auto'
                    )}
                  >
                    {message.text}
                  </div>
                  {message.sender === 'user' && (
                    <Avatar className="h-6 w-6 border flex-shrink-0">
                      <AvatarFallback className="text-xs">
                        <UserIcon className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="pl-2 text-muted-foreground text-sm italic">
                  DigitalZone is typing...
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="p-3 border-t bg-muted/40">
          <div className="flex w-full items-center space-x-2">
            <Input
              id="chat-message"
              placeholder="Type or speak your message..."
              className="flex-1 px-4 py-2 rounded-full border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
              autoComplete="off"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <Button
              type="button"
              size="icon"
              onClick={toggleListening}
              className={cn(
                "w-9 h-9 rounded-full",
                isListening ? 'bg-red-500 text-white' : 'bg-muted hover:bg-muted/70 text-muted-foreground'
              )}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              <span className="sr-only">Mic</span>
            </Button>
            <Button
              type="button"
              size="icon"
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 w-9 h-9 rounded-full"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </CardFooter>
        {isOpen && (
  <Button
    variant="ghost"
    size="icon"
    onClick={() => setIsOpen(false)}
    className="fixed bottom-[72px] right-6 z-50 sm:hidden bg-background text-muted-foreground hover:text-foreground border border-border rounded-full shadow-md"
  >
    <X className="h-5 w-5" />
    <span className="sr-only">Cerrar chat</span>
  </Button>
)}

      </Card>
      {isOpen && (
  <Button
    variant="ghost"
    size="icon"
    onClick={() => setIsOpen(false)}
    className="fixed bottom-[72px] right-6 z-50 sm:hidden bg-background text-muted-foreground hover:text-foreground border border-border rounded-full shadow-md"
  >
    <X className="h-5 w-5" />
    <span className="sr-only">Cerrar chat</span>
  </Button>
)}
    </>
  );
}
