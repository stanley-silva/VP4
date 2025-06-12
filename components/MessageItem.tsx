import React from 'react';
import { Message } from '../types';

interface MessageItemProps {
  message: Message;
  onTranslate?: (messageId: string, textToTranslate: string) => void;
  isTranslating?: boolean;
}

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
  </svg>
);

const AiIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
  <path d="M7.5 8.25h9v9h-9v-9Z" />
  <path fillRule="evenodd" d="M.75 8.25A2.25 2.25 0 0 1 3 6h18a2.25 2.25 0 0 1 2.25 2.25v9A2.25 2.25 0 0 1 21 21H3a2.25 2.25 0 0 1-2.25-2.25v-9ZM3 7.5v9A.75.75 0 0 0 3.75 18h16.5A.75.75 0 0 0 21 17.25v-9A.75.75 0 0 0 20.25 7.5H3.75A.75.75 0 0 0 3 7.5Z" clipRule="evenodd" />
</svg>
);

const LanguageIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21L5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
  </svg>
);

const SmallSpinnerIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);


const MessageItem: React.FC<MessageItemProps> = ({ message, onTranslate, isTranslating }) => {
  const isUser = message.sender === 'user';

  const handleTranslateClick = () => {
    if (onTranslate && message.sender === 'ai' && !message.translatedText) {
      onTranslate(message.id, message.text);
    }
  };

  return (
    <div className={`flex my-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start gap-2.5 max-w-[75%]`}>
        {!isUser && (
          <div className="flex-shrink-0 bg-red-500 rounded-full p-2 shadow"> {/* AI Icon BG Red */}
            <AiIcon />
          </div>
        )}
        <div
          className={`p-4 rounded-lg shadow-md ${
            isUser
              ? 'bg-red-600 text-white rounded-br-none' // User bubble Red
              : 'bg-slate-200 text-slate-800 rounded-bl-none' // AI bubble neutral for readability
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
          {message.sender === 'ai' && message.translatedText && (
            <div className="mt-2 pt-2 border-t border-slate-300">
              <p className="text-xs text-slate-600 font-semibold mb-0.5">PT-BR:</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700">{message.translatedText}</p>
            </div>
          )}
          <div className="flex justify-between items-center mt-2">
            <p className={`text-xs ${isUser ? 'text-red-200' : 'text-slate-500'}`}> {/* User timestamp light red */}
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            {message.sender === 'ai' && onTranslate && !message.translatedText && (
              <button
                onClick={handleTranslateClick}
                disabled={isTranslating}
                className="text-xs text-red-600 hover:text-red-800 disabled:text-slate-400 disabled:cursor-wait flex items-center gap-1 p-1 -m-1 rounded hover:bg-red-100 transition-colors" // Translate button red
                aria-label={isTranslating ? "Traduzindo..." : "Traduzir para Português do Brasil"}
              >
                {isTranslating ? (
                  <>
                    <SmallSpinnerIcon className="w-3 h-3 text-red-600"/> {/* Spinner red */}
                    <span>Traduzindo...</span>
                  </>
                ) : (
                  <>
                    <LanguageIcon className="w-3.5 h-3.5"/>
                    <span>Traduzir PT-BR</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
         {isUser && (
          <div className="flex-shrink-0 bg-rose-600 rounded-full p-2 shadow"> {/* User Icon BG Rose/Red */}
            <UserIcon />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;