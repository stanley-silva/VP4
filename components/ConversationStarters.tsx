
import React from 'react';

interface ConversationStartersProps {
  starters: string[];
  // onStarterClick prop removed
}

// ChatBubbleIcon component definition removed

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
            // Removed icon and its margin
            className="w-full flex items-center justify-start text-left p-3 sm:p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg shadow-sm"
          >
            {/* ChatBubbleIcon element removed */}
            <span className="text-sm sm:text-base">{starter}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationStarters;