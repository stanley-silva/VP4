import React from 'react';

const DigitalFace: React.FC = () => {
  return (
    <div className="my-4 flex justify-center items-center" aria-hidden="true">
      <div className="w-24 h-24 bg-red-500 rounded-full flex flex-col justify-center items-center shadow-xl border-2 border-red-300">
        {/* Eyes */}
        <div className="flex justify-between w-12 mb-2">
            <div className="w-4 h-4 bg-white rounded-full animate-pulse animation-delay-0"></div>
            <div className="w-4 h-4 bg-white rounded-full animate-pulse" style={{animationDelay: '150ms'}}></div>
        </div>
        {/* Mouth that animates */}
        <div className="w-12 h-2 bg-white rounded-sm animate-mouth-speak"></div>
      </div>
    </div>
  );
};

export default DigitalFace;