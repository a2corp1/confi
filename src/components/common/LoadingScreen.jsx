const LoadingScreen = () => {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-dark-950 z-50">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center shadow-glow">
              <span className="text-3xl font-bold text-white">S</span>
            </div>
            <div className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-accent-500 border border-dark-950 animate-pulse"></div>
          </div>
          
          <div className="mt-8 flex space-x-2">
            <div className="h-3 w-3 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="h-3 w-3 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="h-3 w-3 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          
          <p className="mt-4 text-dark-400 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  };
  
  export default LoadingScreen;