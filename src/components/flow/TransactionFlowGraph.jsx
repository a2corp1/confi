import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import ForceGraph2D from 'react-force-graph-2d';
import * as d3 from 'd3';
import Card from '../common/Card';
import LoadingState from '../common/LoadingState';
import ErrorDisplay from '../common/ErrorDisplay';
import { fetchTransactionFlow, fetchP2PTransfers } from '../../services/transactionService';

const TransactionFlowGraph = ({ tokenAddress }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const graphRef = useRef(null);
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [isSimulating, setIsSimulating] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [nodeSize, setNodeSize] = useState(1.0); // Default node size - reduced
  const [linkOpacity, setLinkOpacity] = useState(0.6); // Lower default opacity
  const [linkThickness, setLinkThickness] = useState(0.5); // New state for link thickness
  const [enablePhysics, setEnablePhysics] = useState(true);
  const [simulatedData, setSimulatedData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedNodes, setHighlightedNodes] = useState(new Set());
  const [highlightedLinks, setHighlightedLinks] = useState(new Set());
  const [activeInsights, setActiveInsights] = useState(true);
  const [showLabels, setShowLabels] = useState(false); // Toggle for showing node labels
  const getNodeColor = (node, selectedWallet = null, isHighlighted = false) => {
    const incoming = node.incoming || 0;
    const outgoing = node.outgoing || 0;
    const holdings = node.tokenHoldings || 0;
  
    if (selectedWallet === node.id) return 'rgba(245, 158, 11, 0.9)'; // Orange
  
    if (isHighlighted && selectedWallet) return 'rgba(59, 130, 246, 0.85)'; // Blue
  
    if (holdings >= 1_000_000) return 'rgba(236, 72, 153, 0.9)'; // Whale - pink
  
    if (incoming === 0 && outgoing === 0) return 'rgba(107, 114, 128, 0.8)'; // Gray
  
    const total = incoming + outgoing;
    const ratio = outgoing / total;
  
    if (ratio > 0.7) return 'rgba(37, 99, 235, 0.85)';
    if (ratio < 0.3) return 'rgba(219, 39, 119, 0.85)';
  
    return 'rgba(139, 92, 246, 0.85)';
  };
  const logScale = (value) => {
    return Math.log10(value + 1); // Avoid log10(0) issue
  };
  
  const getLinkColor = (link, opacity = 0.5, isHighlighted = false) => {
    if (isHighlighted) return `rgba(245, 158, 11, ${Math.min(0.7, opacity + 0.2)})`;
    const value = link.value || 0;
    if (value > 1000) return `rgba(37, 99, 235, ${Math.min(0.6, opacity)})`;
    if (value > 100) return `rgba(139, 92, 246, ${Math.min(0.5, opacity)})`;
    return `rgba(107, 114, 128, ${opacity * 0.6})`;
  };
  
  const formatNumber = (num) => {
    if (isNaN(num)) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };
  // Fetch transaction flow data with caching
  const { 
    data: flowData, 
    isLoading: isFlowLoading, 
    isError: isFlowError, 
    error: flowError, 
    refetch: refetchFlow 
  } = useQuery(
    ['transactionFlow', tokenAddress],
    () => fetchTransactionFlow(tokenAddress),
    {
      enabled: !!tokenAddress,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2, // Retry failed requests
      onSuccess: () => {
        setIsSimulating(false);
      }
    }
  );

  // Update dimensions when container size changes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width,
          height: Math.max(500, height)
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Initialize with simulated data while loading
  useEffect(() => {
    if (isSimulating && !isInitialized) {
      generateSimulatedData();
      setIsInitialized(true);
    }
  }, [isSimulating, isInitialized]);

  // Generate simulated data for the visualization
  const generateSimulatedData = () => {
    // Create a network of simulated wallets and transactions
    const numNodes = 20 + Math.floor(Math.random() * 15);
    const nodes = [];
    const links = [];
    
    // Wallet clusters with different behaviors
    const clusters = [
      { name: 'whales', size: 3, volumeMultiplier: 5, outgoingBias: 0.7 },
      { name: 'traders', size: 8, volumeMultiplier: 2, outgoingBias: 0.5 },
      { name: 'holders', size: 5, volumeMultiplier: 1, outgoingBias: 0.2 },
      { name: 'misc', size: numNodes - 16, volumeMultiplier: 0.5, outgoingBias: 0.4 }
    ];
    
    let nodeId = 1;
    
    // Create nodes for each cluster
    clusters.forEach(cluster => {
      for (let i = 0; i < cluster.size; i++) {
        const incoming = Math.floor(Math.random() * 5000 * cluster.volumeMultiplier) * (1 - cluster.outgoingBias);
        const outgoing = Math.floor(Math.random() * 5000 * cluster.volumeMultiplier) * cluster.outgoingBias;
        
        nodes.push({
          id: `wallet${nodeId}`,
          transactions: incoming + outgoing,
          incoming,
          outgoing,
          group: cluster.name,
          walletAge: Math.floor(Math.random() * 365), // days
          recentActivity: Math.random() > 0.3, // 70% of wallets have recent activity
          tokenHoldings: Math.floor(Math.random() * 1000000) * (cluster.name === 'whales' ? 10 : cluster.name === 'traders' ? 2 : 1)
        });
        nodeId++;
      }
    });
    
    // Create links (transactions) between nodes
    // More connections between whales and traders, fewer to holders
    const linkProbabilities = {
      whales_whales: 0.7,
      whales_traders: 0.8,
      whales_holders: 0.4,
      whales_misc: 0.3,
      traders_traders: 0.6,
      traders_holders: 0.5,
      traders_misc: 0.4,
      holders_holders: 0.2,
      holders_misc: 0.3,
      misc_misc: 0.2
    };
    
    // Generate links based on probabilities - but limit number to improve readability
    const maxLinks = nodes.length * 2; // Limit total links for better readability
    let linkCount = 0;
    
    for (let i = 0; i < nodes.length && linkCount < maxLinks; i++) {
      // Prioritize connecting whales to others first for more realistic network
      const potentialTargets = [...Array(nodes.length).keys()]
        .filter(j => j !== i)
        .sort(() => Math.random() - 0.5); // Shuffle
        
      for (let j of potentialTargets) {
        if (linkCount >= maxLinks) break;
        
        const sourceGroup = nodes[i].group;
        const targetGroup = nodes[j].group;
        const linkKey = `${sourceGroup}_${targetGroup}`;
        const reverseLinkKey = `${targetGroup}_${sourceGroup}`;
        const probability = linkProbabilities[linkKey] || linkProbabilities[reverseLinkKey] || 0.2;
        
        if (Math.random() < probability) {
          const value = Math.floor(Math.random() * 1000) * 
            ((sourceGroup === 'whales' || targetGroup === 'whales') ? 5 : 1);
          
          links.push({
            source: nodes[i].id,
            target: nodes[j].id,
            value: value,
            timestamp: Date.now() - Math.floor(Math.random() * 60 * 60 * 24 * 30 * 1000) // Random time in last 30 days
          });
          
          linkCount++;
        }
      }
    }
    
    // Add some activity burst - transactions happening in bursts
    const burstSource = nodes.find(n => n.group === 'whales')?.id;
    if (burstSource) {
      // Add a burst of transactions from the whale to multiple targets
      nodes.filter(n => n.group !== 'whales').slice(0, 3).forEach(target => { // Reduced from 5 to 3
        links.push({
          source: burstSource,
          target: target.id,
          value: 2000 + Math.floor(Math.random() * 3000),
          timestamp: Date.now() - Math.floor(Math.random() * 3 * 24 * 60 * 60 * 1000), // Last 3 days
          isBurst: true
        });
      });
    }
    
    setSimulatedData({ nodes, links });
  };

  // Node hover tooltip
  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleNodeHover = useCallback((node, event) => {
    if (node) {
      setHoveredNode(node);
      // Get position relative to the container
      const containerRect = containerRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: event.clientX - containerRect.left,
        y: event.clientY - containerRect.top
      });
      
      // Highlight connected nodes
      if (graphRef.current) {
        const nodeIdsToHighlight = new Set();
        const linksToHighlight = new Set();
        
        // Add the hovered node
        nodeIdsToHighlight.add(node.id);
        
        // Get connected nodes from the graph data
        const graphData = graphRef.current.graphData();
        graphData.links.forEach(link => {
          const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
          const targetId = typeof link.target === 'object' ? link.target.id : link.target;
          
          if (sourceId === node.id) {
            nodeIdsToHighlight.add(targetId);
            linksToHighlight.add(link);
          } else if (targetId === node.id) {
            nodeIdsToHighlight.add(sourceId);
            linksToHighlight.add(link);
          }
        });
        
        setHighlightedNodes(nodeIdsToHighlight);
        setHighlightedLinks(linksToHighlight);
      }
    } else {
      setHoveredNode(null);
      if (!selectedWallet) {
        setHighlightedNodes(new Set());
        setHighlightedLinks(new Set());
      }
    }
  }, [selectedWallet]);

  // Handle node click - focus on a wallet
  const handleNodeClick = useCallback((node) => {
    if (selectedWallet === node.id) {
      setSelectedWallet(null);
      setHighlightedNodes(new Set());
      setHighlightedLinks(new Set());
    } else {
      setSelectedWallet(node.id);
      
      // Highlight connected nodes and links
      const nodeIdsToHighlight = new Set([node.id]);
      const linksToHighlight = new Set();
      
      // Get graph data
      const graphData = graphRef.current.graphData();
      
      // Find connected nodes
      graphData.links.forEach(link => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        
        if (sourceId === node.id) {
          nodeIdsToHighlight.add(targetId);
          linksToHighlight.add(link);
        } else if (targetId === node.id) {
          nodeIdsToHighlight.add(sourceId);
          linksToHighlight.add(link);
        }
      });
      
      setHighlightedNodes(nodeIdsToHighlight);
      setHighlightedLinks(linksToHighlight);
      
      // Center the view on the selected node
      graphRef.current.centerAt(node.x, node.y, 1000);
      graphRef.current.zoom(2.5, 1000);
    }
  }, [selectedWallet]);

  // Format graph data with improved visuals
  const graphData = useMemo(() => {
    const sourceData = flowData || simulatedData;
    
    if (!sourceData || !sourceData.nodes || sourceData.nodes.length === 0) {
      return { nodes: [], links: [] };
    }
    
    const isNodeHighlighted = id => {
      return highlightedNodes.size === 0 || highlightedNodes.has(id);
    };
    
    const isLinkHighlighted = link => {
      return highlightedLinks.size === 0 || highlightedLinks.has(link);
    };
    
    // Filter nodes by search term if provided
    let filteredNodes = sourceData.nodes;
    if (searchTerm) {
      filteredNodes = sourceData.nodes.filter(node => 
        node.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Find links connected to filtered nodes
    const nodeIds = new Set(filteredNodes.map(node => node.id));
    const filteredLinks = sourceData.links.filter(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      return nodeIds.has(sourceId) && nodeIds.has(targetId);
    });

    // Calculate proportional node sizes based on token holdings or transaction volume
    const maxHoldings = Math.max(
      ...filteredNodes.map(node => node.tokenHoldings || node.transactions || 1)
    );
    
    return {
      nodes: filteredNodes.map(node => ({
        ...node,
        id: node.id,
        name: `${String(node.id).slice(0, 4)}...${String(node.id).slice(-4)}`,
        val: logScale(node.tokenHoldings || node.transactions || 1) * 10 * nodeSize,
        // Scale node size based on token holdings or transaction volume relative to maximum
        color: getNodeColor(node, selectedWallet, isNodeHighlighted(node.id)),
        highlighted: isNodeHighlighted(node.id)
      })),
      links: filteredLinks.map(link => ({
        ...link,
        source: link.source,
        target: link.target,
        value: link.value || 1,
        // Adjusted link width calculation for better visibility
        width: Math.max(0.5, Math.min(3, Math.log10(link.value || 10) * linkThickness)),
        color: getLinkColor(link, linkOpacity, isLinkHighlighted(link)),
        highlighted: isLinkHighlighted(link)
      }))
    };
  }, [flowData, simulatedData, nodeSize, linkOpacity, linkThickness, selectedWallet, highlightedNodes, highlightedLinks, searchTerm]);

  // AI insights for the network
  const networkInsights = useMemo(() => {
    if (!graphData || !graphData.nodes || !graphData.links || graphData.nodes.length === 0) {
      return [];
    }
    
    const nodes = graphData.nodes;
    const links = graphData.links;
    
    // Insight 1: Concentration - what percentage of volume goes through top wallets
    const sortedNodes = [...nodes].sort((a, b) => 
      (b.tokenHoldings || b.transactions || 0) - (a.tokenHoldings || a.transactions || 0)
    );
    const top5Wallets = sortedNodes.slice(0, Math.min(5, sortedNodes.length));
    const totalHoldings = nodes.reduce((sum, node) => 
      sum + (node.tokenHoldings || node.transactions || 0), 0
    );
    const top5Percentage = totalHoldings > 0 
      ? (top5Wallets.reduce((sum, node) => 
          sum + (node.tokenHoldings || node.transactions || 0), 0
        ) / totalHoldings) * 100
      : 0;
    
    // Insight 2: Flow balance - net flow direction (overall buying or selling trend)
    const totalIncoming = nodes.reduce((sum, node) => sum + (node.incoming || 0), 0);
    const totalOutgoing = nodes.reduce((sum, node) => sum + (node.outgoing || 0), 0);
    const netFlowRatio = totalIncoming > 0 ? totalOutgoing / totalIncoming : 1;
    
    // Insight 3: Network structure - how interconnected are the wallets
    const connectionDensity = links.length / (nodes.length * (nodes.length - 1));
    
    // Insight 4: Recent activity - percentage of wallets with recent activity
    const activeWallets = nodes.filter(node => node.recentActivity).length;
    const activePercentage = nodes.length > 0 ? (activeWallets / nodes.length) * 100 : 0;
    
    // Insight 5: Whale alert - large transactions from key wallets
    const whaleThreshold = 5000; // Simulated threshold
    const whaleTransactions = links.filter(link => link.value > whaleThreshold).length;
    
    return [
      {
        title: "Wallet Concentration",
        value: `${Math.round(top5Percentage)}%`,
        description: `Top 5 wallets hold ${Math.round(top5Percentage)}% of total tokens`,
        status: top5Percentage > 70 ? "high" : top5Percentage > 40 ? "medium" : "low",
        icon: "concentration"
      },
      {
        title: "Network Activity",
        value: `${Math.round(activePercentage)}%`,
        description: `${Math.round(activePercentage)}% of wallets active in the last 7 days`,
        status: activePercentage > 60 ? "high" : activePercentage > 30 ? "medium" : "low",
        icon: "activity"
      },
      {
        title: "Flow Balance",
        value: netFlowRatio < 0.9 ? "Accumulation" : netFlowRatio > 1.1 ? "Distribution" : "Balanced",
        description: netFlowRatio < 0.9 ? "More tokens flowing in than out" : 
                   netFlowRatio > 1.1 ? "More tokens flowing out than in" : "Balanced token flow",
        status: netFlowRatio < 0.9 ? "high" : netFlowRatio > 1.1 ? "low" : "medium",
        icon: "flow"
      },
      {
        title: "Whale Activity",
        value: whaleTransactions > 0 ? `${whaleTransactions} moves` : "None",
        description: whaleTransactions > 0 
          ? `${whaleTransactions} large transactions detected` 
          : "No significant whale movements",
        status: whaleTransactions > 10 ? "high" : whaleTransactions > 0 ? "medium" : "low",
        icon: "whale"
      }
    ];
  }, [graphData]);

  // Helper function for wallet search
  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Handle graph initialization
  const handleGraphInit = useCallback(() => {
    if (graphRef.current) {
      // Set initial zoom level
      setTimeout(() => {
        graphRef.current.zoom(1.5, 1000);
      }, 500);
    }
  }, []);

  // Handle graph click to clear selection when clicking on background
  const handleGraphClick = useCallback(() => {
    if (!hoveredNode) {
      setSelectedWallet(null);
      setHighlightedNodes(new Set());
      setHighlightedLinks(new Set());
    }
  }, [hoveredNode]);
  
  // Get wallet health score (simulated AI insight)
  const getWalletHealthScore = (node) => {
    if (!node) return 0;
    
    // Calculate health based on:
    // 1. Transaction balance (not too one-sided)
    // 2. Transaction volume (active wallets are healthier)
    // 3. Recent activity
    
    const inOutRatio = node.incoming > 0 && node.outgoing > 0
      ? Math.min(node.incoming, node.outgoing) / Math.max(node.incoming, node.outgoing)
      : 0;
      
    const volumeFactor = Math.min(1, (node.transactions || 0) / 10000);
    const recentActivityBonus = node.recentActivity ? 0.2 : 0;
    
    const healthScore = (inOutRatio * 0.5) + (volumeFactor * 0.3) + recentActivityBonus;
    return Math.min(1, healthScore) * 100;
  };

  // Icons for insights
  const renderInsightIcon = (type) => {
    switch (type) {
      case 'concentration':
        return (
          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="18" r="3"></circle>
            <circle cx="6" cy="6" r="3"></circle>
            <path d="M13 6h3a2 2 0 0 1 2 2v7"></path>
            <path d="M11 18H8a2 2 0 0 1-2-2V9"></path>
          </svg>
        );
      case 'activity':
        return (
          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
        );
      case 'flow':
        return (
          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"></path>
            <path d="M12 5v14"></path>
          </svg>
        );
      case 'whale':
        return (
          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5l6.74-6.76z"></path>
            <line x1="16" y1="8" x2="2" y2="22"></line>
            <line x1="17.5" y1="15" x2="9" y2="15"></line>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <Card title="Transaction Flow Map"
      subtitle="Visual map of token transfers between wallets">
      <div className="space-y-4">
        {/* AI Insights Panel */}
        {activeInsights && networkInsights.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {networkInsights.map((insight, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-lg border ${
                  insight.status === 'high' 
                    ? 'border-primary-600/30 bg-primary-900/20 text-primary-400' 
                    : insight.status === 'medium'
                    ? 'border-yellow-600/30 bg-yellow-900/20 text-yellow-400'
                    : 'border-dark-700 bg-dark-800/50 text-dark-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 rounded-md ${
                    insight.status === 'high'
                      ? 'bg-primary-900/60'
                      : insight.status === 'medium'
                      ? 'bg-yellow-900/60'
                      : 'bg-dark-700'
                  }`}>
                    {renderInsightIcon(insight.icon)}
                  </div>
                  <span className="text-sm font-medium">{insight.title}</span>
                </div>
                <div className="mt-2">
                  <div className="text-xl font-semibold">{insight.value}</div>
                  <p className="text-xs mt-1 opacity-80">{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Controls Panel - Simplified and improved */}
        <div className="flex flex-wrap items-center gap-3 justify-between p-3 bg-dark-900/80 rounded-lg border border-dark-800">
          {/* Search Bar */}
          <div className="relative min-w-[180px]">
            <input
              type="text"
              placeholder="Search wallets..."
              className="w-full pl-8 pr-3 py-1.5 rounded-md bg-dark-800 border border-dark-700 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
              value={searchTerm}
              onChange={handleSearch}
            />
            <svg 
              className="absolute left-2.5 top-2 w-4 h-4 text-dark-400" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          
          {/* Chart Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Node Size */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-dark-400">Node Size</span>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={nodeSize}
                onChange={(e) => setNodeSize(parseFloat(e.target.value))}
                className="w-16 accent-primary-500"
              />
            </div>
            
            {/* Link Thickness - new control */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-dark-400">Line Width</span>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.1"
                value={linkThickness}
                onChange={(e) => setLinkThickness(parseFloat(e.target.value))}
                className="w-16 accent-primary-500"
              />
            </div>
            
            {/* Show Labels Toggle */}
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`px-2 py-1 text-xs rounded ${
                showLabels 
                  ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30' 
                  : 'bg-dark-800 text-dark-400 border border-dark-700'
              }`}
            >
              {showLabels ? 'Hide Labels' : 'Show Labels'}
            </button>
            
            {/* Physics Toggle */}
            <button
              onClick={() => setEnablePhysics(!enablePhysics)}
              className={`px-2 py-1 text-xs rounded ${
                enablePhysics 
                  ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30' 
                  : 'bg-dark-800 text-dark-400 border border-dark-700'
              }`}
            >
              {enablePhysics ? 'Physics On' : 'Physics Off'}
            </button>
            
            {/* AI Insights Toggle */}
            <button
              onClick={() => setActiveInsights(!activeInsights)}
              className={`px-2 py-1 text-xs rounded ${
                activeInsights 
                  ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30' 
                  : 'bg-dark-800 text-dark-400 border border-dark-700'
              }`}
            >
              {activeInsights ? 'Hide Insights' : 'Show Insights'}
            </button>
          </div>
        </div>

        {/* Graph Legend - Simplified */}
        <div className="flex flex-wrap justify-between gap-2 p-2 bg-dark-900/40 rounded-lg border border-dark-800">
          <div className="flex flex-wrap gap-5">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500 shadow-glow-sm"></div>
              <span className="text-xs text-dark-300">Sending (Outflow)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-purple-500 shadow-glow-sm"></div>
              <span className="text-xs text-dark-300">Balanced</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-pink-500 shadow-glow-sm"></div>
              <span className="text-xs text-dark-300">Receiving (Inflow)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-orange-500 shadow-glow-sm"></div>
              <span className="text-xs text-dark-300">Selected wallet</span>
            </div>
          </div>
          
          <div className="text-xs text-dark-400">
            {isSimulating ? 'Showing simulated data...' : `Showing ${graphData.nodes.length} wallets and ${graphData.links.length} transactions`}
          </div>
        </div>

        {/* Main Visualization */}
        <div 
          ref={containerRef} 
          className="relative h-[550px] border border-dark-800 rounded-lg bg-gradient-to-b from-dark-900/80 to-dark-950/90 overflow-hidden shadow-inner"
        >
          {isFlowLoading && !simulatedData ? (
            <LoadingState height="h-full" message="Loading transaction data..." />
          ) : isFlowError && !simulatedData ? (
            <ErrorDisplay
              title="Failed to load transaction data"
              message={flowError?.message || "An error occurred while fetching data"}
              onRetry={refetchFlow}
            />
          ) : (
            <>
              {/* Loading overlay */}
              {isFlowLoading && (
                <div className="absolute inset-0 bg-dark-950/70 z-10 flex flex-col items-center justify-center">
                  <div className="flex items-center mb-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mr-3"></div>
                    <p className="text-primary-400 font-medium">Loading transaction data</p>
                  </div>
                  <p className="text-sm text-dark-400">Showing simulated preview while loading...</p>
                </div>
              )}
              
              {/* Background elements for a more engaging visualization */}
              <div className="absolute inset-0 overflow-hidden">
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-5" 
                  style={{
                    backgroundImage: `radial-gradient(circle at 25px 25px, rgba(59, 130, 246, 0.3) 2px, transparent 0)`,
                    backgroundSize: '50px 50px'
                  }}>
                </div>
              </div>
              
              {/* Force Graph */}
              {dimensions.width > 0 && (
                <ForceGraph2D
                  ref={graphRef}
                  graphData={graphData}
                  width={dimensions.width}
                  height={dimensions.height}
                  nodeRelSize={3}
                  nodeVal={node => node.val}
                  nodeLabel={null}
                  nodeColor={node => node.color}
                  linkWidth={link => link.highlighted ? link.width * 1.5 : link.width}
                  linkColor={link => link.color}
                  linkDirectionalParticles={3}
                  linkDirectionalParticleWidth={link => link.highlighted ? 2 : 1.2}
                  linkDirectionalParticleSpeed={0.003}
                  linkCurvature={0}  // Set to 0 for straight lines connecting nodes
                  cooldownTicks={enablePhysics ? 100 : 0}
                  onNodeHover={handleNodeHover}
                  onNodeClick={handleNodeClick}
                  onEngineInitialized={handleGraphInit}
                  nodeCanvasObject={(node, ctx, globalScale) => {
                    if (!node.x || !node.y) return; // Skip rendering if node position is undefined
                    
                    // Enhanced node rendering with cleaner aesthetics
                    const size = Math.max(4, Math.sqrt(node.val || 3) * 3);
                    const isSelected = selectedWallet === node.id;
                    const isHighlighted = node.highlighted;
                    const fontSize = 12/globalScale;
                    
                    // Calculate health score for node - simulated AI insight
                    const healthScore = getWalletHealthScore(node);
                    const healthColor = healthScore > 70 ? '#10b981' : // green
                                      healthScore > 40 ? '#f59e0b' : // amber
                                      '#ef4444'; // red
                    
                    // Draw outer glow for highlighted nodes (subtle)
                    if (isHighlighted || isSelected) {
                      ctx.beginPath();
                      ctx.arc(node.x, node.y, size * 1.5, 0, 2 * Math.PI);
                      ctx.fillStyle = isSelected 
                        ? 'rgba(245, 158, 11, 0.15)' 
                        : 'rgba(59, 130, 246, 0.1)';
                      ctx.fill();
                    }
                    
                    // Health indicator ring (thin)
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, size * 1.05, 0, 2 * Math.PI * (healthScore / 100));
                    ctx.strokeStyle = healthColor;
                    ctx.lineWidth = 1.5 / globalScale;
                    ctx.stroke();
                    
                    // Main node
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
                    ctx.fillStyle = node.color;
                    ctx.strokeStyle = isSelected 
                      ? '#f59e0b' 
                      : isHighlighted 
                        ? 'rgba(255, 255, 255, 0.8)'
                        : 'rgba(255, 255, 255, 0.3)';
                    ctx.lineWidth = (isSelected || isHighlighted ? 1.5 : 0.8) / globalScale;
                    ctx.fill();
                    ctx.stroke();
                    
                    // Draw label if selected, highlighted, or labels are enabled
                    const isLargeNode = node.val > (graphData.nodes.length > 20 ? 15 : 10);
                    if (isSelected || isHighlighted || (showLabels && isLargeNode)) {
                      ctx.font = `${isSelected ? 'bold ' : ''}${fontSize}px Sans-Serif`;
                      ctx.fillStyle = isSelected 
                        ? 'rgba(245, 158, 11, 0.9)' 
                        : 'rgba(255, 255, 255, 0.8)';
                      ctx.textAlign = 'center';
                      ctx.textBaseline = 'bottom';
                      ctx.fillText(node.name, node.x, node.y - size - 2);
                      
                      // Only show transaction count for important nodes when hovering
                      if (isSelected || (isHighlighted && isLargeNode)) {
                        const valueText = node.tokenHoldings ? 
                          `${formatNumber(node.tokenHoldings)} tokens` : 
                          `${formatNumber(node.transactions || 0)} tx`;
                        ctx.font = `${fontSize * 0.8}px Sans-Serif`;
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                        ctx.fillText(valueText, node.x, node.y - size - 2 - fontSize);
                      }
                    }
                  }}
                  linkCanvasObjectMode={() => 'replace'}
                  linkCanvasObject={(link, ctx, globalScale) => {
                    const source = typeof link.source === 'object' ? link.source : graphData.nodes.find(n => n.id === link.source);
                    const target = typeof link.target === 'object' ? link.target : graphData.nodes.find(n => n.id === link.target);
                  
                    if (!source || !target || source.x == null || source.y == null || target.x == null || target.y == null) return;
                  
                    const dx = target.x - source.x;
                    const dy = target.y - source.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist === 0) return;
                  
                    // Line
                    ctx.beginPath();
                    ctx.moveTo(source.x, source.y);
                    ctx.lineTo(target.x, target.y);
                    ctx.strokeStyle = link.highlighted
                      ? link.color.replace(/[\d.]+\)$/, '0.9)')
                      : link.color || 'rgba(255,255,255,0.5)';
                    ctx.lineWidth = (link.highlighted ? link.width * 1.8 : link.width) / globalScale;
                    ctx.stroke();
                  
                    // Optional: arrow
                    const arrowLength = 6 / globalScale;
                    const arrowWidth = 3 / globalScale;
                    const unitX = dx / dist;
                    const unitY = dy / dist;
                    const arrowX = target.x - unitX * arrowLength * 1.5;
                    const arrowY = target.y - unitY * arrowLength * 1.5;
                    const angle = Math.atan2(unitY, unitX);
                  
                    ctx.save();
                    ctx.translate(arrowX, arrowY);
                    ctx.rotate(angle);
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(-arrowLength, -arrowWidth);
                    ctx.lineTo(-arrowLength, arrowWidth);
                    ctx.closePath();
                    ctx.fillStyle = link.highlighted
                      ? 'rgba(255,255,255,0.9)'
                      : 'rgba(255,255,255,0.6)';
                    ctx.fill();
                    ctx.restore();
                  }}
                  
                  linkDirectionalArrowLength={0} // Disable default arrows, we'll draw our own
                  linkDirectionalArrowRelPos={1}
                  backgroundColor="rgba(0,0,0,0)"
                  minZoom={0.5}
                  maxZoom={8}
                  onNodeDragEnd={node => {
                    // Pin/unpin node on drag
                    node.fx = node.x;
                    node.fy = node.y;
                  }}
                  onBackgroundClick={handleGraphClick}
                  cooldownTime={enablePhysics ? 3000 : 0}
                  d3AlphaMin={0.001}
                  d3AlphaDecay={enablePhysics ? 0.0228 : 1.0}
                  d3VelocityDecay={0.4}
                  warmupTicks={enablePhysics ? 100 : 0}
                  onRenderFramePost={ctx => {
                    // Add subtle vignette effect
                    const gradient = ctx.createRadialGradient(
                      dimensions.width / 2, dimensions.height / 2, 
                      Math.min(dimensions.width, dimensions.height) * 0.5,
                      dimensions.width / 2, dimensions.height / 2,
                      Math.max(dimensions.width, dimensions.height)
                    );
                    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
                    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
                    
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, dimensions.width, dimensions.height);
                    
                    // Display watermark when showing simulated data
                    if (isSimulating) {
                      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                      ctx.font = '20px Sans-Serif';
                      ctx.textAlign = 'center';
                      ctx.textBaseline = 'middle';
                      ctx.fillText('Preview Data', dimensions.width / 2, dimensions.height - 30);
                    }
                  }}
                />
              )}
              
              {/* Node tooltip - Simplified for better readability */}
              {hoveredNode && (
                <div
                  className="absolute bg-dark-900/95 text-white p-3 rounded-lg text-sm backdrop-blur-md border border-dark-800 z-10"
                  style={{
                    left: tooltipPosition.x + 10,
                    top: tooltipPosition.y + 10,
                    maxWidth: '250px',
                    transform: 'translateZ(0)',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.25), 0 0 8px rgba(59, 130, 246, 0.15)'
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-primary-400">{hoveredNode.name}</div>
                    <div className="px-1.5 py-0.5 text-xs rounded bg-dark-800 text-dark-300">
                      {hoveredNode.group || 'Wallet'}
                    </div>
                  </div>
                  
                  {/* Key wallet metrics - simplified */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-2">
                    {hoveredNode.tokenHoldings && (
                      <>
                        <div className="text-dark-300 text-xs">Token Holdings:</div>
                        <div className="text-white text-xs font-medium">{formatNumber(hoveredNode.tokenHoldings)}</div>
                      </>
                    )}
                    <div className="text-dark-300 text-xs">Transactions:</div>
                    <div className="text-white text-xs font-medium">{formatNumber(hoveredNode.transactions || 0)}</div>
                    <div className="text-dark-300 text-xs">Received:</div>
                    <div className="text-green-500 text-xs font-medium">{formatNumber(hoveredNode.incoming || 0)}</div>
                    <div className="text-dark-300 text-xs">Sent:</div>
                    <div className="text-blue-500 text-xs font-medium">{formatNumber(hoveredNode.outgoing || 0)}</div>
                    <div className="text-dark-300 text-xs">Net Flow:</div>
                    <div className={(hoveredNode.incoming > hoveredNode.outgoing) ? "text-green-500 text-xs font-medium" : "text-blue-500 text-xs font-medium"}>
                      {formatNumber((hoveredNode.incoming || 0) - (hoveredNode.outgoing || 0))}
                    </div>
                  </div>
                  
                  {/* Compact health indicator */}
                  <div className="bg-dark-800/80 rounded p-1.5 mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-dark-400">Wallet Health</span>
                      <span 
                        className={`text-xs font-medium ${
                          getWalletHealthScore(hoveredNode) > 70 ? 'text-green-500' :
                          getWalletHealthScore(hoveredNode) > 40 ? 'text-yellow-500' :
                          'text-red-500'
                        }`}
                      >
                        {Math.round(getWalletHealthScore(hoveredNode))}%
                      </span>
                    </div>
                    <div className="h-1 w-full bg-dark-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          getWalletHealthScore(hoveredNode) > 70 ? 'bg-green-500' :
                          getWalletHealthScore(hoveredNode) > 40 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${getWalletHealthScore(hoveredNode)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-2 pt-1 border-t border-dark-700 text-center">
                    <span className="text-xs text-primary-400">Click to focus on this wallet</span>
                  </div>
                </div>
              )}
              
              {/* Selected Wallet Info Panel - Streamlined */}
              {selectedWallet && (
                <div className="absolute top-4 right-4 bg-dark-900/90 backdrop-blur-md p-3 rounded-lg border border-primary-900/50 text-sm max-w-xs"
                  style={{ 
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.25), 0 0 8px rgba(59, 130, 246, 0.15)',
                  }}>
                  <div className="flex justify-between items-start">
                    <div className="font-medium text-white text-sm">Selected Wallet</div>
                    <button 
                      className="text-dark-400 hover:text-dark-200 transition-colors"
                      onClick={() => {
                        setSelectedWallet(null);
                        setHighlightedNodes(new Set());
                        setHighlightedLinks(new Set());
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="mt-2 px-2 py-1 bg-primary-900/20 border border-primary-800/30 rounded text-primary-400 font-mono text-xs truncate">
                    {selectedWallet}
                  </div>
                  
                  {/* Transaction stats */}
                  {graphData.nodes && (
                    <div className="mt-2">
                      {/* Stats cards - simplified */}
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="flex flex-col items-center justify-center p-1.5 bg-dark-800/50 rounded">
                          <span className="text-xs text-dark-400">Connections</span>
                          <span className="text-sm text-white font-medium">
                            {highlightedNodes.size - 1}
                          </span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-1.5 bg-dark-800/50 rounded">
                          <span className="text-xs text-dark-400">Transactions</span>
                          <span className="text-sm text-white font-medium">
                            {highlightedLinks.size}
                          </span>
                        </div>
                      </div>
                      
                      {/* Selected node details - more compact */}
                      {graphData.nodes.filter(n => n.id === selectedWallet).map(node => (
                        <div key={node.id} className="bg-dark-800/30 rounded p-2">
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                            {node.tokenHoldings && (
                              <>
                                <span className="text-xs text-dark-400">Token Holdings:</span>
                                <span className="text-xs text-white text-right font-medium">{formatNumber(node.tokenHoldings)}</span>
                              </>
                            )}
                            <span className="text-xs text-dark-400">Received:</span>
                            <span className="text-xs text-green-500 text-right">{formatNumber(node.incoming || 0)}</span>
                            <span className="text-xs text-dark-400">Sent:</span>
                            <span className="text-xs text-blue-500 text-right">{formatNumber(node.outgoing || 0)}</span>
                            <span className="text-xs text-dark-400">Net Flow:</span>
                            <span className={`text-xs text-right ${(node.incoming || 0) > (node.outgoing || 0) ? 'text-green-500' : 'text-blue-500'}`}>
                              {formatNumber((node.incoming || 0) - (node.outgoing || 0))}
                            </span>
                          </div>
                          
                          {/* Health score - compact visualization */}
                          <div className="mt-2">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-dark-400">Wallet Health</span>
                              <span 
                                className={`text-xs font-medium ${
                                  getWalletHealthScore(node) > 70 ? 'text-green-500' :
                                  getWalletHealthScore(node) > 40 ? 'text-yellow-500' :
                                  'text-red-500'
                                }`}
                              >
                                {Math.round(getWalletHealthScore(node))}%
                              </span>
                            </div>
                            <div className="h-1 w-full bg-dark-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  getWalletHealthScore(node) > 70 ? 'bg-green-500' :
                                  getWalletHealthScore(node) > 40 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${getWalletHealthScore(node)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <button 
                    className="mt-2 w-full px-3 py-1 bg-primary-600/20 text-primary-400 rounded border border-primary-700/30 hover:bg-primary-600/30 transition-colors text-xs font-medium"
                    onClick={() => {
                      setSelectedWallet(null);
                      setHighlightedNodes(new Set());
                      setHighlightedLinks(new Set());
                    }}
                  >
                    Clear Selection
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        </div>
    </Card>
  );

return (
  <Card title="Transaction Flow Map"
    subtitle="Visual map of token transfers between wallets">
    {/* ... component JSX ... */}
  </Card>
);
};

export default TransactionFlowGraph;