
import React from 'react';

interface ConversationStartersProps {
  starters: string[];
  // onStarterClick prop removed
}

const ChatBubbleIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 0 1 4.5 21.75a6.75 6.75 0 0 1-6.75-6.75c0-3.52 2.664-6.445 6.002-6.699a.75.75 0 0 1 .748.728A5.25 5.25 0 0 0 6 10.5c0 2.9-2.35 5.25-5.25 5.25a.75.75 0 0 1-.75-.75V8.25a.75.75 0 0 1 .75-.75h1.252a1.5 1.5 0 0 0 1.415-1.035A6.728 6.728 0 0 1 4.5 6C2.015 6 0 8.015 0 10.5v5.25a8.25 8.25 0 0 0 8.25 8.25c.897 0 1.76-.14 2.576-.402a.75.75 0 0 1 .52.338l1.458 1.944a.75.75 0 0 0 1.202-.904l-1.078-1.438a7.483 7.483 0 0 0 1.266-.173 8.25 8.25 0 0 0 6.526-7.829 8.217 8.217 0 0 0-1.722-5.013A6.728 6.728 0 0 1 19.5 6c-2.485 0-4.5 2.015-4.5 4.5v5.25a.75.75 0 0 1-.75.75h-2.506a1.5 1.5 0 0 0-1.415 1.035A6.728 6.728 0 0 1 19.5 18a6.75 6.75 0 0 1-6.75 6.75c-.717 0-1.412-.114-2.076-.328a.75.75 0 0 1-.44.028 8.19 8.19 0 0 0-2.32.713.75.75 0 0 0-.404.975l.84 2.24a.75.75 0 0 1-1.015.915L4.804 21.644ZM17.25 10.5a.75.75 0 0 1-.75.75H9a.75.75 0 0 1 0-1.5h7.5a.75.75 0 0 1 .75.75Zm0 3a.75.75 0 0 1-.75.75H9a.75.75 0 0 1 0-1.5h7.5a.75.75 0 0 1 .75.75Z" clipRule="evenodd" />
  </svg>
);


const ConversationStarters: React.FC<ConversationStartersProps> = ({ starters }) => {
  if (starters.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-md p-4 md:p-6 text-center">
      <h2 className="text-lg sm:text-xl font-semibold text-slate-700 mb-4 sm:mb-6">
        Need an idea? Try one of these:
      </h2>
      <div className="space-y-2 sm:space-y-3">
        {starters.map((starter, index) => (
          <div
            key={index}
            // Changed from button to div
            // Removed onClick and aria-label
            // Adjusted styling to remove interactive cues (hover, focus, transition)
            className="w-full flex items-center justify-start text-left p-3 sm:p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg shadow-sm"
          >
            <ChatBubbleIcon className="w-5 h-5 mr-2 sm:mr-3 flex-shrink-0 text-rose-500" />
            <span className="text-sm sm:text-base">{starter}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationStarters;
