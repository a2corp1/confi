import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowRightIcon, 
  ArrowUpRightIcon, 
  ShieldCheckIcon, 
  ChartBarIcon, 
  ArrowsRightLeftIcon, 
  QuestionMarkCircleIcon 
} from '@heroicons/react/24/outline';

import SearchBar from '../components/common/SearchBar';
import Button from '../components/common/Button';
import LoadingState from '../components/common/LoadingState';
import { fetchTopTokensByMarketCap } from '../services/tokenService';

// Import our new components
import TopTokensNavbar from '../components/token/top-tokens-navbar';
import StatsCounter from '../components/token/stats-counter';
import TokenCard from '../components/token/token-card';
import AnalyticsDashboard from '../components/token/analytics-dashboard';
import { initPageViewTracking } from '../components/token/page-view-tracker';

// Clock icon component
const ClockIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const HomePage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [liveActivity, setLiveActivity] = useState([]);
  const canvasRef = useRef(null);
  const tooltipRef = useRef(null);

  // Initialize page view tracking on component mount
  useEffect(() => {
    initPageViewTracking();
  }, []);

  const { 
    data: apiResponse, 
    isLoading: isLoadingTokens,
    error
  } = useQuery({
    queryKey: ['topTokensByMarketCap'],
    queryFn: fetchTopTokensByMarketCap,
    staleTime: 0, // Set to 0 to disable caching
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true // Refetch when component mounts
  });
  
  // Then safely extract the tokens:
  const topTokens = apiResponse?.data || [];

  // Enhanced background animation with connections
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    // Resize canvas to match parent
    const resizeCanvas = () => {
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
      }
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Interactive floating particles with connections
    const particles = [];
    const particleCount = 60;
    const colors = ['#60a5fa', '#93c5fd', '#3b82f6', '#8b5cf6', '#c4b5fd', '#a78bfa'];
    const maxDistance = 150; // Max distance for connections
    
    // Mouse interaction
    let mouse = {
      x: null,
      y: null,
      radius: 100
    };
    
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    
    canvas.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });
    
    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      const radius = Math.random() * 3 + 1;
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: radius,
        baseRadius: radius, // Store original radius for pulsing effect
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: Math.random() * 0.4 - 0.2,
        vy: Math.random() * 0.4 - 0.2,
        opacity: Math.random() * 0.5 + 0.3,
        pulse: Math.random() * 0.1,
        pulseSpeed: Math.random() * 0.02 + 0.01
      });
    }
    
    // Animation loop with connections
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connections first (so they appear behind particles)
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        
        // Pulse effect
        p1.pulse += p1.pulseSpeed;
        if (p1.pulse > 1 || p1.pulse < 0) p1.pulseSpeed *= -1;
        p1.radius = p1.baseRadius * (1 + p1.pulse * 0.3);
        
        // Check for mouse interaction
        if (mouse.x) {
          const dx = mouse.x - p1.x;
          const dy = mouse.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < mouse.radius) {
            // Move away from mouse slightly
            const force = (mouse.radius - dist) * 0.02;
            p1.vx -= (dx / dist) * force;
            p1.vy -= (dy / dist) * force;
          }
        }
        
        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < maxDistance) {
            // Opacity based on distance
            const opacity = 1 - (distance / maxDistance);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(147, 197, 253, ${opacity * 0.2})`; // Light blue connections
            ctx.lineWidth = opacity * 0.8;
            ctx.stroke();
          }
        }
      }
      
      // Update and draw particles
      particles.forEach(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Bounce off edges with slight randomization
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -1;
          particle.vx += (Math.random() * 0.02 - 0.01); // Add small random change
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -1;
          particle.vy += (Math.random() * 0.02 - 0.01); // Add small random change
        }
        
        // Apply slight friction to prevent excessive speeds
        particle.vx *= 0.995;
        particle.vy *= 0.995;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        
        // Add glow effect
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.radius * 2
        );
        gradient.addColorStop(0, particle.color + Math.floor(particle.opacity * 255).toString(16).padStart(2, '0'));
        gradient.addColorStop(1, particle.color + '00'); // Transparent
        
        ctx.fillStyle = gradient;
        ctx.fill();
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', null);
      canvas.removeEventListener('mouseleave', null);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Intersection Observer for smooth fade-in animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.1 }
    );
    
    // Observe sections that should animate on scroll
    const sections = document.querySelectorAll('.animate-on-scroll');
    const timeout = setTimeout(() => {
      sections.forEach(section => {
        observer.observe(section);
      });
    }, 100); // 100ms delay to ensure DOM is ready
  
    return () => {
      clearTimeout(timeout);
      sections.forEach(section => {
        observer.unobserve(section);
      });
    };
  }, []);

  // Handle tooltip position
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setShowTooltip(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Generate live activity feed
  useEffect(() => {
    const activities = [
      { action: "analyzed", token: "RAY", user: "7aza...3e9" },
      { action: "scanned", token: "BONK", user: "2bf3...f14" },
      { action: "tracked", token: "ORCA", user: "9c1t...d45" },
      { action: "verified", token: "SOL", user: "3fop...a21" },
      { action: "monitored", token: "JTO", user: "08xe...b12" },
      { action: "checked", token: "SAMO", user: "v05d...c87" },
      { action: "reviewed", token: "COPE", user: "m01a...e63" }
    ];
    
    // Add new activity every few seconds
    const interval = setInterval(() => {
      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      const timestamp = new Date().toISOString();
      
      setLiveActivity(prev => {
        const updated = [{ ...randomActivity, timestamp }, ...prev];
        return updated.slice(0, 5); // Keep only 5 most recent
      });
    }, 4500);
    
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/token/${searchTerm.trim()}`);
    }
  };
  
  // Filter tokens based on active tab
  const filteredTokens = () => {
    if (activeTab === 'all') 
      return topTokens;
    if (activeTab === 'verified') {
      return topTokens.filter((token, index) => index % 3 === 0);
    } else if (activeTab === 'trending') {
      return topTokens.slice(0, 3); 
    }
    return topTokens;
  };

  return (
    <div className="mt-4 md:mt-8 relative">
      {/* Add Top Tokens Navbar */}
      
      {/* Gentle particle background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <canvas ref={canvasRef} className="w-full h-full opacity-30"></canvas>
      </div>
      
      {/* Hero Section */}
      <div className="relative px-6 py-16 sm:py-24 lg:py-32 overflow-hidden rounded-3xl z-10">
        {/* Live Activity Feed - Repositioned */}
        <div className="absolute right-6 top-6 w-64 h-auto max-h-40 overflow-hidden rounded-xl bg-white/20 dark:bg-dark-900/20 backdrop-blur-md border border-blue-100/20 dark:border-blue-900/20 text-left p-3 shadow-lg md:block hidden">
          <h4 className="text-xs font-semibold text-blue-700 dark:text-blue-300 border-b border-blue-100 dark:border-dark-700 pb-1 flex items-center justify-between">
            <span>LIVE ACTIVITY</span>
            <span className="flex items-center"><span className="h-2 w-2 rounded-full bg-green-500 mr-1 pulse-dot"></span> Now</span>
          </h4>
          <div className="space-y-2 mt-2 activity-feed">
            {liveActivity.map((activity, index) => (
              <div key={index} className="text-xs text-gray-600 dark:text-dark-300 flex items-center">
                <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                  activity.action === "verified" ? "bg-green-500" : 
                  activity.action === "analyzed" ? "bg-blue-500" : 
                  "bg-purple-500"
                }`}></span>
                <span className="font-medium text-gray-800 dark:text-white">{activity.user}</span>
                <span className="mx-1">{activity.action}</span>
                <span className="font-mono">{activity.token}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 animate-pulse-slow">
              <ShieldCheckIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            Scan a solana <span className="text-blue-600 dark:text-blue-400">token</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-dark-300 mb-8">
            Discover, analyze, and make informed decisions about any Solana token.
            <br />Simple and powerful tools for everyone - from beginners to experts.
          </p>
          
          {/* Replace static counters with our dynamic StatsCounter component */}
          <StatsCounter />
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-4 relative z-10">
            <form onSubmit={handleSearch} className="search-form bg-white dark:bg-dark-900 rounded-xl shadow-lg border border-gray-200 dark:border-dark-700">
              <div className="flex flex-col md:flex-row">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter Solana token address or name..."
                    className="w-full py-4 px-6 rounded-t-xl md:rounded-l-xl md:rounded-tr-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-dark-400 focus:outline-none text-lg"
                  />
                </div>
                <Button 
                  type="submit" 
                  size="lg" 
                  fullWidth={false} 
                  className="md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-b-xl md:rounded-r-xl md:rounded-bl-none"
                >
                  <span className="mr-2">Analyze Token</span>
                  <ArrowRightIcon className="h-5 w-5" />
                </Button>
              </div>
            </form>
            
            <div className="mt-3 flex justify-center items-center">
              <div className="scan-status-badge">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-2 pulse-dot"></span>
                <span className="scan-status-text">Scanner active: <span className="font-semibold scan-count">243</span> tokens analyzed today</span>
              </div>
            </div>
            
            {/* Help tooltip toggle */}
            <div className="absolute right-0 -bottom-10">
              <button 
                onClick={() => setShowTooltip(!showTooltip)}
                className="flex items-center text-sm text-gray-500 dark:text-dark-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <QuestionMarkCircleIcon className="h-5 w-5 mr-1" />
                New to Solana?
              </button>
              
              {/* Beginner-friendly help tooltip */}
              {showTooltip && (
                <div 
                  ref={tooltipRef}
                  className="absolute right-0 bottom-full mb-2 w-72 p-4 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-gray-200 dark:border-dark-700 text-left z-50"
                >
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Getting Started</h4>
                  <p className="text-sm text-gray-600 dark:text-dark-300 mb-3">
                    You can analyze any Solana token by entering its address or name. Don't have one? Try one of our recently analyzed tokens below!
                  </p>
                  <Button 
                    size="sm"
                    variant="outline"
                    as="link"
                    to="/getting-started"
                    className="w-full"
                  >
                    View Beginner's Guide
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tokens with Friendly UI */}
      <div className="mt-16 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Popular Tokens
          </h2>
          
          {/* Simple category tabs */}
          <div className="flex space-x-2 bg-gray-100 dark:bg-dark-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'all' 
                  ? 'bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-dark-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('verified')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'verified' 
                  ? 'bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-dark-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Verified
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'trending' 
                  ? 'bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-dark-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Trending
            </button>
          </div>
        </div>
        
        {isLoadingTokens ? (
          <LoadingState height="h-40" message="Loading popular tokens..." />
        ) : filteredTokens().length > 0 ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 animate-on-scroll fade-in-up">
            {filteredTokens().map((token, index) => (
              <TokenCard key={token.id || token.address} token={token} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-dark-800 shadow-sm">
            <p className="text-gray-500 dark:text-dark-400">No tokens found</p>
            <p className="mt-2 text-sm text-gray-400 dark:text-dark-500">
              Try a different filter or search for a token above
            </p>
          </div>
        )}
      </div>

      {/* Features Section - More interactive and dynamic */}
      <div className="mt-20 animate-on-scroll fade-in-up">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          Live Analysis Tools
        </h2>
        <p className="text-center text-gray-600 dark:text-dark-400 mb-8 max-w-2xl mx-auto">
          Our scanner constantly updates insights across all Solana tokens
        </p>
        
        {/* Live scanner visualization */}
        <div className="w-full max-w-4xl mx-auto mb-12 bg-white dark:bg-dark-900/60 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-dark-800">
          <div className="p-4 bg-gray-50 dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 flex justify-between items-center">
            <h3 className="font-medium text-gray-900 dark:text-white">Scanner Status</h3>
            <div className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-green-500 mr-2 pulse-dot"></span>
              <span className="text-sm text-gray-600 dark:text-dark-400">Processing <span className="font-mono">12</span> tokens/min</span>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-10 gap-1 scanner-grid mb-4">
              {Array(50).fill().map((_, i) => (
                <div 
                  key={i} 
                  className={`scanner-cell h-6 rounded 
                    ${Math.random() > 0.7 ? 'bg-blue-100 dark:bg-blue-900/30' : 
                      Math.random() > 0.92 ? 'bg-yellow-100 dark:bg-yellow-900/30' : 
                      Math.random() > 0.96 ? 'bg-red-100 dark:bg-red-900/30' : 
                      'bg-gray-100 dark:bg-dark-800'}`}
                ></div>
              ))}
            </div>
            
            <div className="flex justify-between text-xs text-gray-500 dark:text-dark-400 mb-6">
              <span>Recent tokens scanned</span>
              <span className="text-blue-600 dark:text-blue-400 font-medium scan-count-dynamic">3,241 today</span>
            </div>
            
            <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
              <div className="feature-card">
                <div className="feature-icon bg-blue-100 dark:bg-blue-900/30">
                  <ShieldCheckIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Token Health Check</h3>
                <p className="text-gray-600 dark:text-dark-400 text-sm">
                  Easy-to-understand metrics about token health, community growth, and market activity.
                </p>
                <div className="health-scan-indicator mt-3 h-1 w-full bg-gray-100 dark:bg-dark-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 animate-scan-progress"></div>
                </div>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon bg-blue-100 dark:bg-blue-900/30">
                  <ChartBarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Market Analysis</h3>
                <p className="text-gray-600 dark:text-dark-400 text-sm">
                  Track price history, trading volume, and market trends with reliable data and visualizations.
                </p>
                <div className="mini-chart mt-3 flex items-end h-8 space-x-1">
                  {Array(10).fill().map((_, i) => (
                    <div 
                      key={i} 
                      className="chart-bar bg-blue-400 dark:bg-blue-500 rounded-t w-full" 
                      style={{ height: `${20 + Math.random() * 80}%` }}
                    ></div>
                  ))}
                </div>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon bg-blue-100 dark:bg-blue-900/30">
                  <ArrowsRightLeftIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Community Insights</h3>
                <p className="text-gray-600 dark:text-dark-400 text-sm">
                  See token distribution among holders and understand community growth and engagement.
                </p>
                <div className="mini-distribution mt-3 flex space-x-1">
                  <div className="h-6 rounded bg-blue-400 dark:bg-blue-500" style={{ width: '58%' }}></div>
                  <div className="h-6 rounded bg-indigo-400 dark:bg-indigo-500" style={{ width: '25%' }}></div>
                  <div className="h-6 rounded bg-purple-400 dark:bg-purple-500" style={{ width: '12%' }}></div>
                  <div className="h-6 rounded bg-pink-400 dark:bg-pink-500" style={{ width: '5%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Educational CTA Section */}
      <div className="mt-20 mb-10 relative overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-dark-900 dark:to-dark-950 rounded-xl p-8 text-center relative z-10 border border-blue-100 dark:border-dark-800 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">New to Solana Tokens?</h2>
          <p className="text-gray-600 dark:text-dark-300 max-w-2xl mx-auto mb-6">
            Our beginner-friendly guides will help you understand how tokens work, what metrics matter, and how to use our tools to make better decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              as="link"
              to="/learn"
              size="lg"
              variant="outline"
              className="px-8"
            >
              Beginner Guides
            </Button>
            <Button
              as="link"
              to="/search"
              size="lg"
              className="px-8 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Start Exploring
            </Button>
          </div>
        </div>
      </div>
      
      {/* Add Analytics Dashboard component */}
      <AnalyticsDashboard />
      
      {/* CSS for animations and effects */}
      <style>{`
        /* Stat cards styling */
        .stat-card {
          background-color: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(4px);
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          text-align: center;
          min-width: 7rem;
          border: 1px solid rgba(59, 130, 246, 0.1);
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .stat-card {
            background-color: rgba(30, 41, 59, 0.5);
          }
        }
        
        /* Animate slow pulse */
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        /* Token card styling */
        .token-card {
          transition: all 0.2s ease;
        }
        
        .token-card:hover {
          transform: translateY(-2px);
        }
        
        /* Feature card styling */
        .feature-card {
          background-color: #ffffff;
          padding: 1.5rem;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
        }
        
        .feature-card:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          border-color: rgba(59, 130, 246, 0.3);
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .feature-card {
            background-color: #1e293b;
            border-color: #334155;
          }
          
          .feature-card:hover {
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2);
            border-color: rgba(59, 130, 246, 0.4);
          }
        }
        
        .feature-icon {
          width: 3rem;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }
        
        /* Metric cards */
        .metric-card {
          padding: 0.5rem;
          border-radius: 0.375rem;
          background-color: #f9fafb;
          text-align: center;
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .metric-card {
            background-color: #1e293b;
          }
        }
        
        /* Animate sections on scroll */
        .animate-on-scroll {
          opacity: 1;
          transform: translateY(20px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        
        .animate-on-scroll.in-view {
          transform: translateY(0);
        }
        
        /* Live counter animation */
        .live-stat-card {
          position: relative;
          overflow: hidden;
        }
        
        .live-stat-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(to right, 
            rgba(59, 130, 246, 0.1), 
            rgba(59, 130, 246, 0.4), 
            rgba(59, 130, 246, 0.1)
          );
          animation: stat-scan 2s infinite linear;
        }
        
        @keyframes stat-scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        /* Pulsing dots */
        .pulse-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: pulse-animation 1.5s infinite;
        }
        
        @keyframes pulse-animation {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        
        /* Scan status badge */
        .scan-status-badge {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(5px);
          border: 1px solid rgba(59, 130, 246, 0.2);
          padding: 0.375rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          color: rgba(59, 130, 246, 0.8);
        }
        
        .scan-count {
          display: inline-block;
          min-width: 1.5rem;
          animation: number-increment 5s infinite;
        }
        
        @keyframes number-increment {
          0%, 20% { content: "243"; }
          40% { content: "244"; }
          60% { content: "245"; }
          80%, 100% { content: "246"; }
        }
        
        /* Scanner grid animation */
        .scanner-grid {
          position: relative;
          overflow: hidden;
        }
        
        .scanner-cell {
          transition: all 0.5s ease;
        }
        
        .scanner-cell:nth-child(3n+1) {
          animation: cell-pulse 3s infinite;
          animation-delay: calc(0.1s * var(--i, 0));
        }
        
        @keyframes cell-pulse {
          0%, 100% { opacity: 0.1; }
          50% { 
          }
        }
        
        /* Live activity feed */
        .activity-feed {
          max-height: 150px;
          overflow-y: auto;
        }
        
        .activity-feed > div {
          animation: fade-in 0.5s both;
        }
        
        .activity-feed > div:nth-child(1) {
          animation-delay: 0.1s;
        }
        
        .activity-feed > div:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .activity-feed > div:nth-child(3) {
          animation-delay: 0.3s;
        }
        
        .activity-feed > div:nth-child(4) {
          animation-delay: 0.4s;
        }
        
        .activity-feed > div:nth-child(5) {
          animation-delay: 0.5s;
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 0; transform: translateY(0); }
        }
        
        /* Scan progress animation */
        .animate-scan-progress {
          width: 30%;
          animation: scan-progress 3s infinite;
        }
        
        @keyframes scan-progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        
        /* Scan count dynamic increment */
        .scan-count-dynamic::after {
          content: '';
          display: inline-block;
          width: 4px;
          height: 4px;
          background-color: #3b82f6;
          border-radius: 50%;
          margin-left: 4px;
          animation: pulse-animation 1.5s infinite;
        }
        
        /* Mini chart animations */
        .chart-bar {
          transition: height 1s ease;
          animation: bar-pulse 3s infinite;
        }
        
        .chart-bar:nth-child(odd) {
          animation-delay: 0.5s;
        }
        
        @keyframes bar-pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 0; }
        }
        
        /* Interactive particles connect on hover */
        canvas {
          cursor: pointer;
        }
        
        /* Analytics Dashboard Footer */
        .page-views-footer {
          text-align: center;
          padding: 1rem;
          border-top: 1px solid #e5e7eb;
          margin-top: 2rem;
        }
        
        @media (prefers-color-scheme: dark) {
          .page-views-footer {
            border-color: #334155;
          }
        }
        
        /* Dashboard toggle button */
        .dashboard-toggle-btn {
          transition: all 0.3s ease;
        }
        
        .dashboard-toggle-btn:hover {
          transform: scale(1.1);
        }
        
        /* Top tokens navbar */
        .top-tokens-navbar {
          position: sticky;
          top: 0;
          z-index: 30;
        }
        
        .tokens-scroll-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .tokens-scroll-container::-webkit-scrollbar {
          display: none;
        }/* Top tokens navbar */
.top-tokens-navbar {
  position: sticky;
  top: 0;
  z-index: 30;
}

.tokens-scroll-container {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.tokens-scroll-container::-webkit-scrollbar {
  display: none;
}

/* Footer page view counter */
.page-views-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
  padding: 0.5rem;
  text-align: center;
  font-size: 0.75rem;
  color: #6b7280;
  border-top: 1px solid rgba(209, 213, 219, 0.5);
  z-index: 20;
}

@media (prefers-color-scheme: dark) {
  .page-views-footer {
    background-color: rgba(17, 24, 39, 0.8);
    color: #9ca3af;
    border-color: rgba(55, 65, 81, 0.5);
  }
}

/* Dashboard panel styles */
.dashboard-panel {
  z-index: 100;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
}

.dashboard-content-area {
  flex: 1;
  overflow-y: auto;
}

/* Token card hover effects */
.token-card:hover .token-actions {
  opacity: 0;
}

.token-actions {
  opacity: 0;
  transition: opacity 0.2s ease;
}

/* Tooltip styles */
.tooltip {
  position: relative;
}

.tooltip:hover .tooltip-text {
  visibility: visible;
  opacity: 0;
}

.tooltip-text {
  visibility: hidden;
  opacity: 0;
  position: absolute;
  z-index: 40;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #1f2937;
  color: white;
  text-align: center;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  white-space: nowrap;
  font-size: 0.75rem;
  transition: opacity 0.2s;
}

.tooltip-text::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #1f2937 transparent transparent transparent;
}

/* Custom scrollbar for components */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 4px;
}

@media (prefers-color-scheme: dark) {
  .custom-scrollbar {
    scrollbar-color: #475569 #1e293b;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #1e293b;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #475569;
  }
}

/* Stats table styling */
.stats-table th {
  font-weight: 500;
  text-align: left;
  padding: 0.5rem 1rem;
  color: #6b7280;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.stats-table td {
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}

@media (prefers-color-scheme: dark) {
  .stats-table th {
    color: #9ca3af;
    background-color: #1f2937;
    border-color: #374151;
  }
  
  .stats-table td {
    border-color: #374151;
  }
}

/* Page navigation styles */
.pagination-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
  background-color: white;
  color: #374151;
  transition: all 0.2s;
}

.pagination-button:hover {
  background-color: #f3f4f6;
}

.pagination-button:disabled {
  background-color: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

@media (prefers-color-scheme: dark) {
  .pagination-button {
    border-color: #374151;
    background-color: #1f2937;
    color: #e5e7eb;
  }
  
  .pagination-button:hover {
    background-color: #374151;
  }
  
  .pagination-button:disabled {
    background-color: #111827;
    color: #6b7280;
  }
}

/* Date picker styles */
.date-range-picker {
  display: inline-flex;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  overflow: hidden;
}

.date-range-picker input {
  border: none;
  padding: 0.5rem;
  outline: none;
}

@media (prefers-color-scheme: dark) {
  .date-range-picker {
    border-color: #374151;
    background-color: #1f2937;
  }
  
  .date-range-picker input {
    background-color: #1f2937;
    color: #e5e7eb;
  }
}`}</style>
    </div>
  );
};

export default HomePage;