import { useState } from 'react';
import { CheckIcon, ClipboardIcon } from '@heroicons/react/24/outline';

const CopyToClipboard = ({ text, className = '', displayText }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayValue = displayText || text;
  
  // Truncate display text if it's too long and no custom display text was provided
  const truncatedText = !displayText && displayValue.length > 16
    ? `${displayValue.slice(0, 8)}...${displayValue.slice(-6)}`
    : displayValue;

  return (
    <button
      onClick={copyToClipboard}
      className={`inline-flex items-center gap-1 text-dark-400 hover:text-dark-200 transition-colors duration-200 ${className}`}
      title="Copy to clipboard"
    >
      <span>{truncatedText}</span>
      {copied ? (
        <CheckIcon className="h-4 w-4 text-success-500" />
      ) : (
        <ClipboardIcon className="h-4 w-4" />
      )}
    </button>
  );
};

export default CopyToClipboard;