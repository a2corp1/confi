import { Link } from 'react-router-dom';

const Logo = ({ className = 'h-8 w-auto', linkWrapper = true }) => {
  const logoContent = (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center shadow-glow">
          <span className="text-xl font-bold text-white">AI</span>
        </div>
        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-accent-500 border border-dark-950 animate-pulse-slow"></div>
      </div>
      <span className="text-x1 font-bold bg-gradient-to-r from-primary-400 to-secondary-500 bg-clip-text text-transparent">
        Scamr
      </span>
    </div>
  );

  if (linkWrapper) {
    return <Link to="/" className="flex items-center space-x-2">{logoContent}</Link>;
  }

  return logoContent;
};

export default Logo;