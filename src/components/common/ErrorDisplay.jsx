import { XCircleIcon } from '@heroicons/react/24/solid';

const ErrorDisplay = ({ title = 'Error', message, onRetry }) => {
  return (
    <div className="rounded-md bg-danger-900/30 p-4 border border-danger-800">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-danger-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-danger-300">{title}</h3>
          <div className="mt-2 text-sm text-danger-200">
            <p>{message || 'An unexpected error occurred. Please try again later.'}</p>
          </div>
          {onRetry && (
            <div className="mt-4">
              <button
                type="button"
                onClick={onRetry}
                className="btn-danger text-xs px-3 py-1.5"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;

// client/src/compo