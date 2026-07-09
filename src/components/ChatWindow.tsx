/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';

export default function ChatWindow() {
  const { messages, status, error, sendMessage } = useChat({
    onError: (err: any) => {
      console.error('Chat error:', err);
    },
  }) as any;
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input || !input.trim()) return;
    
    // sendMessage in ai-sdk v4+ expects { text: string } format
    sendMessage({ text: input });
    setInput('');
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleListen = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.continuous = false;
      
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev: string) => (prev ? prev + " " + transcript : transcript));
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      
      recognition.start();
    } else {
      alert("Speech Recognition is not supported in this browser.");
    }
  };

  // Helper to extract text from a message (handles both old content and new parts format)
  const getMessageText = (m: any): string => {
    if (typeof m.content === 'string' && m.content.length > 0) return m.content;
    if (Array.isArray(m.parts)) {
      return m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('');
    }
    return '';
  };

  return (
    <div className="flex flex-col h-full bg-[#efeae2]">
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10 text-sm">
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
              Send a message to your Agentic Assistant
            </span>
          </div>
        )}
        
        {messages.map((m: any) => {
          const text = getMessageText(m);
          return (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[80%] rounded-lg px-4 py-2 shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-green-100 text-green-900 rounded-tr-none' 
                    : 'bg-white text-gray-800 rounded-tl-none'
                }`}
              >
                {text && (
                  <p className="text-[15px] whitespace-pre-wrap">{text}</p>
                )}
                
                {/* Tool invocations from parts */}
                {m.parts && m.parts.filter((p: any) => p.type === 'tool-invocation').map((toolPart: any) => (
                  <div key={toolPart.toolInvocation.toolCallId} className="text-xs mt-2 p-2 bg-gray-100 rounded text-gray-600 border border-gray-200 italic">
                    {toolPart.toolInvocation.state === 'result' ? (
                      <span>✅ Completed action: {toolPart.toolInvocation.toolName}</span>
                    ) : (
                      <span className="animate-pulse">⚙️ Agent is working on: {toolPart.toolInvocation.toolName}...</span>
                    )}
                  </div>
                ))}

                {/* Fallback for AI SDK old version tool mapping */}
                {m.toolInvocations && m.toolInvocations.map((tool: any) => (
                  <div key={tool.toolCallId} className="text-xs mt-2 p-2 bg-gray-100 rounded text-gray-600 border border-gray-200 italic">
                    {tool.state === 'result' ? (
                      <span>✅ Completed action: {tool.toolName}</span>
                    ) : (
                      <span className="animate-pulse">⚙️ Agent is working on: {tool.toolName}...</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Loading indicator when AI is streaming */}
        {status === 'streaming' && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-500 rounded-lg rounded-tl-none px-4 py-2 shadow-sm">
              <span className="animate-pulse text-sm">AI is typing...</span>
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 text-red-600 rounded-lg px-4 py-2 text-sm border border-red-200">
              ⚠️ Error: {error.message || 'Something went wrong. Please try again.'}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-gray-100 p-3 flex items-center gap-2">
        <button 
          type="button"
          onClick={toggleListen}
          className={`p-3 rounded-full flex-shrink-0 transition-colors ${
            isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-gray-600 hover:bg-gray-200'
          }`}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
        
        <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Type a message or use voice..."
            className="flex-1 rounded-full border-none px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
          />
          <button 
            type="submit" 
            disabled={!input || !input.trim() || status === 'streaming'}
            className="bg-green-600 text-white p-3 rounded-full flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
