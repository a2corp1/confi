const LoadingState = ({ height = 'h-32', message = 'Loading...' }) => {
    return (
      <div className={`${height} flex flex-col items-center justify-center`}>
        <div className="space-y-4">
          <div className="flex space-x-2 justify-center">
            <div className="h-3 w-3 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="h-3 w-3 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="h-3 w-3 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <p className="text-dark-400 text-sm">{message}</p>
        </div>
      </div>
    );
  };
  
  export default LoadingState;