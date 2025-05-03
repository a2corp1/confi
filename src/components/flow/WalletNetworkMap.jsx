import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as d3 from 'd3';
import Card from '../common/Card';
import LoadingState from '../common/LoadingState';
import ErrorDisplay from '../common/ErrorDisplay';
import { fetchP2PTransfers } from '../../services/transactionService';

const WalletNetworkMap = ({ tokenAddress }) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const [selectedWallet, setSelectedWallet] = useState(null);
  
  // Fetch P2P transfer data
  const { data, isLoading, isError, error, refetch } = useQuery(
    ['p2pTransfers', tokenAddress],
    () => fetchP2PTransfers(tokenAddress, true), // true means exclude dex transactions
    {
      enabled: !!tokenAddress,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
  
  useEffect(() => {
    if (isLoading || isError || !data?.p2pTransfers || data.p2pTransfers.length === 0) return;

    const createNetworkVisualization = () => {
      // Clear any existing visualization
      d3.select(svgRef.current).selectAll("*").remove();
      
      const transfers = data.p2pTransfers;
      const width = svgRef.current.clientWidth;
      const height = 600;
      
      // Create nodes (wallets) and links (transactions) data
      const wallets = new Set();
      transfers.forEach(tx => {
        wallets.add(tx.fromAddress);
        wallets.add(tx.toAddress);
      });
      
      // Create nodes array
      const nodes = Array.from(wallets).map(address => {
        // Count transactions for this wallet
        const outgoing = transfers.filter(tx => tx.fromAddress === address).length;
        const incoming = transfers.filter(tx => tx.toAddress === address).length;
        const total = outgoing + incoming;
        
        return {
          id: address,
          address: address,
          value: total, // Size based on transaction count
          outgoing,
          incoming,
          total
        };
      });
      
      // Create links array
      const links = transfers.map((tx, index) => ({
        id: `link-${index}`,
        source: tx.fromAddress,
        target: tx.toAddress,
        value: tx.amount,
        blockTime: tx.blockTime,
        type: tx.type || 'TRANSFER'
      }));
      
      // Group links between the same source and target
      const linkGroups = {};
      links.forEach(link => {
        const key = `${link.source}-${link.target}`;
        if (!linkGroups[key]) {
          linkGroups[key] = {
            source: link.source,
            target: link.target,
            transactions: [],
            value: 0
          };
        }
        linkGroups[key].transactions.push(link);
        linkGroups[key].value += 1;
      });
      
      const groupedLinks = Object.values(linkGroups);
      
      // Create color scale for links
      const linkColorScale = d3.scaleOrdinal()
        .domain(['TOKEN_TRANSFER', 'SOL_TRANSFER', 'SWAP', 'TRANSFER'])
        .range(['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b']);
      
      // Create simulation
      const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(groupedLinks)
          .id(d => d.id)
          .distance(80)
          .strength(0.1))
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(d => Math.sqrt(d.value) * 4 + 10));
      
      // Create tooltip
      const tooltip = d3.select(tooltipRef.current)
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "rgba(15, 23, 42, 0.9)")
        .style("color", "white")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("font-size", "12px")
        .style("max-width", "300px")
        .style("z-index", "10");
      
      // Create SVG
      const svg = d3.select(svgRef.current)
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height]);
      
      // Arrow marker definition for links
      svg.append("defs").selectAll("marker")
        .data(["end"])
        .enter().append("marker")
        .attr("id", d => `arrow-${d}`)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 30)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("fill", "#6b7280")
        .attr("d", "M0,-5L10,0L0,5");
      
      // Draw links
      const link = svg.append("g")
        .selectAll("path")
        .data(groupedLinks)
        .enter().append("path")
        .attr("stroke", "#6b7280")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", d => Math.max(1, Math.sqrt(d.value)))
        .attr("marker-end", "url(#arrow-end)")
        .on("mouseover", function(event, d) {
          d3.select(this)
            .attr("stroke", "#f59e0b")
            .attr("stroke-opacity", 1);
          
          const transactionCount = d.transactions.length;
          const mostCommonType = getMostCommonType(d.transactions);
          
          tooltip.html(`
            <div>
              <p class="font-bold">Transactions: ${transactionCount}</p>
              <p>From: ${truncateAddress(d.source)}</p>
              <p>To: ${truncateAddress(d.target)}</p>
              <p>Type: ${mostCommonType}</p>
            </div>
          `)
          .style("visibility", "visible")
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
          d3.select(this)
            .attr("stroke", "#6b7280")
            .attr("stroke-opacity", 0.6);
          
          tooltip.style("visibility", "hidden");
        });
      
      // Draw nodes
      const node = svg.append("g")
        .selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("r", d => Math.sqrt(d.value) * 3 + 5)
        .attr("fill", d => {
          // Highlight selected wallet or its connections
          if (selectedWallet) {
            if (d.id === selectedWallet) return "#f59e0b";
            
            // Check if this node is connected to selected wallet
            const isConnected = groupedLinks.some(link => 
              (link.source.id === selectedWallet && link.target.id === d.id) || 
              (link.target.id === selectedWallet && link.source.id === d.id)
            );
            
            return isConnected ? "#3b82f6" : "#1e293b";
          }
          
          return "#1e293b";
        })
        .attr("stroke", "#475569")
        .attr("stroke-width", 1.5)
        .call(drag(simulation))
        .on("mouseover", function(event, d) {
          d3.select(this)
            .attr("stroke", "#f59e0b")
            .attr("stroke-width", 2);
          
          tooltip.html(`
            <div>
              <p class="font-bold">${truncateAddress(d.address)}</p>
              <p>Transactions: ${d.total}</p>
              <p>Incoming: ${d.incoming}</p>
              <p>Outgoing: ${d.outgoing}</p>
              <p class="text-xs text-gray-400 mt-1">Click to focus</p>
            </div>
          `)
          .style("visibility", "visible")
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
          d3.select(this).attr("stroke", "#475569").attr("stroke-width", 1.5);
          tooltip.style("visibility", "hidden");
        })
        .on("click", function(event, d) {
          event.stopPropagation();
          setSelectedWallet(selectedWallet === d.id ? null : d.id);
        });
      
      // Add click handler to clear selection when clicking on the background
      svg.on("click", () => {
        setSelectedWallet(null);
      });
      
      // Update positions on simulation tick
      simulation.on("tick", () => {
        link.attr("d", d => {
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const dr = Math.sqrt(dx * dx + dy * dy);
          
          // Create a slight curve for the links
          return `M${d.source.x},${d.source.y} A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
        });
        
        node.attr("cx", d => d.x)
            .attr("cy", d => d.y);
      });
    };
    
    createNetworkVisualization();
    
    // Re-render on window resize
    const handleResize = () => {
      createNetworkVisualization();
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    
  }, [data, isLoading, isError, selectedWallet]);
  
  // Helper function to implement drag behavior
  const drag = (simulation) => {
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    
    return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  };
  
  // Helper to truncate wallet addresses
  const truncateAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };
  
  // Helper to get most common transaction type
  const getMostCommonType = (transactions) => {
    const typeCounts = {};
    transactions.forEach(tx => {
      const type = tx.type || 'TRANSFER';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    
    let maxCount = 0;
    let maxType = 'TRANSFER';
    
    Object.entries(typeCounts).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxType = type;
      }
    });
    
    return maxType;
  };
  
  if (isLoading) {
    return <LoadingState height="h-96" message="Building wallet network visualization..." />;
  }
  
  if (isError) {
    return (
      <ErrorDisplay
        title="Failed to load transaction data"
        message={error?.message || 'An error occurred while fetching transaction data'}
        onRetry={refetch}
      />
    );
  }
  
  const noData = !data?.p2pTransfers || data.p2pTransfers.length === 0;
  
  return (
    <Card 
      title="Wallet Transaction Network"
      subtitle="Interactive visualization of wallet-to-wallet transfers"
    >
      <div className="relative">
        {noData ? (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <p className="text-dark-400">No wallet-to-wallet transfers found</p>
            <p className="mt-2 text-sm text-dark-500">
              This visualization shows direct transfers between wallets
            </p>
          </div>
        ) : (
          <>
            <svg ref={svgRef} className="w-full" />
            <div ref={tooltipRef}></div>
            
            {selectedWallet && (
              <div className="absolute top-4 right-4 bg-dark-900/90 p-3 rounded-lg border border-dark-700 text-sm">
                <p className="font-medium text-white">Selected Wallet</p>
                <p className="text-dark-300">{truncateAddress(selectedWallet)}</p>
                <button 
                  className="mt-2 text-xs text-primary-400 hover:text-primary-300"
                  onClick={() => setSelectedWallet(null)}
                >
                  Clear Selection
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="p-4 border-t border-dark-800 mt-4">
        <h4 className="text-sm font-medium text-dark-300 mb-2">About This Visualization</h4>
        <ul className="text-xs text-dark-400 space-y-1">
          <li>• Nodes represent wallets (sized by transaction count)</li>
          <li>• Lines represent transfers between wallets</li>
          <li>• Click on a wallet to focus on its connections</li>
          <li>• Drag nodes to rearrange the network</li>
        </ul>
      </div>
    </Card>
  );
};

export default WalletNetworkMap;