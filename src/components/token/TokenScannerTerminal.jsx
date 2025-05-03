import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DocumentTextIcon, ShieldCheckIcon, ExclamationTriangleIcon, CommandLineIcon } from '@heroicons/react/24/outline';
import Card from '../common/Card';
import { checkHolderProcessingStatus } from '../../services/transactionService';

const TokenScannerTerminal = ({ tokenAddress }) => {
  const [logs, setLogs] = useState([]);
  const [scanProgress, setScanProgress] = useState(0);
  const [walletsScanned, setWalletsScanned] = useState(0);
  const [transactionsAnalyzed, setTransactionsAnalyzed] = useState(0);
  const [suspiciousActivities, setSuspiciousActivities] = useState(0);
  const [isScanning, setIsScanning] = useState(true);
  const [currentProcess, setCurrentProcess] = useState('initialization');
  const terminalRef = useRef(null);

  // Mock data for realistic logs - Solana focused
  const walletPrefixes = ['AzHR5', 'Ej4kB', 'HN7cX', '9iQmF', 'BvP2q', 'G3ZsY', '5tKnM', 'L8gWx', 'CfR6P', 'V2pJd'];
  const programIds = ['TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL', 'ComputeBudget111111111111111111111111111111', 'So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo'];
  const slotsCompleted = [150234782, 150234799, 150234801, 150234850, 150234860, 150234910];
  const transactionTypes = ['SOL_TRANSFER', 'TOKEN_TRANSFER', 'SWAP', 'STAKE', 'NFT_LISTING', 'DEX_TRADE'];
  const exchanges = ['Jupiter', 'Raydium', 'Orca', 'Drift', 'Mango Markets', 'OpenBook'];

  // API status fetch
  const { data: processingStatus } = useQuery(
    ['processingStatus', tokenAddress],
    () => checkHolderProcessingStatus(tokenAddress),
    {
      enabled: !!tokenAddress,
      staleTime: 15 * 1000,
      refetchInterval: 30 * 1000
    }
  );

  // Function to add a new log entry
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
    setLogs(prev => [...prev.slice(-100), { id: Date.now(), timestamp, message, type }]);
    
    // Auto-scroll to bottom
    if (terminalRef.current) {
      setTimeout(() => {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }, 10);
    }
  };

  // Generate random Solana wallet address (base58 style)
  const generateWalletAddress = () => {
    const prefix = walletPrefixes[Math.floor(Math.random() * walletPrefixes.length)];
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    const suffix = [...Array(38)].map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `${prefix}${suffix}`;
  };

  // Generate random transaction signature
  const generateTxSignature = () => {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    return [...Array(87)].map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  // Format large numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Simulate ongoing scanning
  useEffect(() => {
    if (!isScanning) return;

    // Check if we already have logs - if so, skip the initialization phases
    const shouldSkipIntro = logs.length > 0;
    
    const phases = [
      { name: 'initialization', duration: 2000, message: 'Scanner initialized. Starting token analysis on Solana...' },
      { name: 'rpc_connection', duration: 1500, message: 'Establishing secure RPC connection to Solana validators...' },
      { name: 'holder_scan', duration: 8000, message: 'Scanning token holders across Solana accounts...' },
      { name: 'transaction_analysis', duration: 10000, message: 'Analyzing on-chain transaction patterns...' },
      { name: 'whale_tracking', duration: 6000, message: 'Tracking whale movements and accumulation patterns...' },
      { name: 'dex_monitoring', duration: 5000, message: 'Monitoring DEX liquidity and trading volumes...' },
      { name: 'anomaly_detection', duration: 7000, message: 'Running ML-based anomaly detection algorithms...' },
      { name: 'report_generation', duration: 2000, message: 'Generating comprehensive analysis report...' }
    ];

    // If we have existing logs, start from a random mid-phase
    let phaseIndex = shouldSkipIntro ? Math.floor(Math.random() * (phases.length - 3)) + 2 : 0;
    let initialPhase = shouldSkipIntro ? phases[phaseIndex] : phases[0];
    
    const totalDuration = phases.slice(phaseIndex).reduce((acc, phase) => acc + phase.duration, 0);
    const startTime = Date.now();

    // If we have logs already, set an initial progress between 30-70%
    const initialProgress = shouldSkipIntro ? Math.floor(Math.random() * 40) + 30 : 0;
    setScanProgress(initialProgress);

    // Start the first phase
    setCurrentProcess(phases[0].name);
    addLog(phases[0].message, 'system');

    // Initial values - using high numbers
    setWalletsScanned(Math.floor(Math.random() * 10000) + 920);
    setTransactionsAnalyzed(Math.floor(Math.random() * 300000) + 12000);
    setSuspiciousActivities(Math.floor(Math.random() * 40) + 15);
    
    // Main interval for phase progression and progress updates
    const mainInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.floor((elapsed / totalDuration) * 100));
      setScanProgress(progress);
      
      // Increment counters for visual effect
      setWalletsScanned(prev => prev + Math.floor(Math.random() * 40) + 5);
      setTransactionsAnalyzed(prev => prev + Math.floor(Math.random() * 5000) + 1000);
      if (Math.random() < 0.1) {
        setSuspiciousActivities(prev => prev + 1);
      }
      
      // Check if we should move to the next phase
      let currentElapsed = 0;
      for (let i = 0; i <= phaseIndex; i++) {
        currentElapsed += phases[i].duration;
      }
      
      if (elapsed >= currentElapsed && phaseIndex < phases.length - 1) {
        phaseIndex++;
        setCurrentProcess(phases[phaseIndex].name);
        addLog(phases[phaseIndex].message, 'system');
      }
      
      if (progress >= 100) {
        addLog('Scan complete. Token analysis ready.', 'success');
        setIsScanning(false);
        clearInterval(mainInterval);
        clearInterval(walletInterval);
        clearInterval(transactionInterval);
        clearInterval(slotInterval);
      }
    }, 300);
    
    // Setup interval for wallet scanning logs
    const walletInterval = setInterval(() => {
      if (currentProcess === 'holder_scan' || currentProcess === 'whale_tracking') {
        const wallet = generateWalletAddress();
        const tokenAmount = (Math.random() * 10000000).toFixed(2);
        addLog(`[WALLET] ${wallet.substring(0, 6)}...${wallet.substring(wallet.length - 4)} | Balance: ${tokenAmount}`, 'wallet');
      }
    }, 400);
    
    // Setup interval for transaction logs
    const transactionInterval = setInterval(() => {
      if (currentProcess === 'transaction_analysis' || currentProcess === 'anomaly_detection' || currentProcess === 'dex_monitoring') {
        const txType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
        const exchange = exchanges[Math.floor(Math.random() * exchanges.length)];
        const txSignature = generateTxSignature();
        const amount = (Math.random() * 100000).toFixed(2);
        
        if (Math.random() < 0.15) {
          // Highlight suspicious transactions occasionally
          addLog(`[ALERT] High-value ${txType} of ${amount} tokens via ${exchange}`, 'alert');
        } else {
          addLog(`[TX] ${txSignature.substring(0, 10)}...${txSignature.substring(txSignature.length - 6)} | ${txType} | ${amount} tokens`, 'transaction');
        }
      }
    }, 600);
    
    // Setup interval for Solana slot progress
    const slotInterval = setInterval(() => {
      const slot = slotsCompleted[Math.floor(Math.random() * slotsCompleted.length)] + Math.floor(Math.random() * 100);
      const programId = programIds[Math.floor(Math.random() * programIds.length)];
      
      if (Math.random() < 0.7 && (currentProcess === 'rpc_connection' || currentProcess === 'transaction_analysis')) {
        addLog(`[SLOT] #${slot} | Program: ${programId.substring(0, 8)}...${programId.substring(programId.length - 4)}`, 'slot');
      }
    }, 1200);
    
    return () => {
      clearInterval(mainInterval);
      clearInterval(walletInterval);
      clearInterval(transactionInterval);
      clearInterval(slotInterval);
    };
  }, [isScanning]);

  // Define styles for different log types
  const logStyles = {
    info: 'text-dark-300',
    system: 'text-primary-400',
    wallet: 'text-secondary-400',
    transaction: 'text-dark-200',
    alert: 'text-danger-400 font-semibold',
    success: 'text-success-400 font-semibold',
    slot: 'text-accent-400'
  };

  // Create title element
  const titleElement = (
    <div className="flex items-center">
      <CommandLineIcon className="h-5 w-5 mr-2 text-primary-400" />
      <span className="text-lg font-mono">Solana Chain Scanner</span>
    </div>
  );

  // Use localStorage to persist logs between renders
  useEffect(() => {
    // Load saved logs on component mount
    const savedLogs = localStorage.getItem('terminalLogs');
    if (savedLogs) {
      try {
        const parsedLogs = JSON.parse(savedLogs);
        setLogs(parsedLogs);
      } catch (e) {
        console.error('Error parsing saved logs');
      }
    }
  }, []);

  // Save logs to localStorage when they change
  useEffect(() => {
    if (logs.length > 0) {
      localStorage.setItem('terminalLogs', JSON.stringify(logs.slice(-50)));
    }
  }, [logs]);

  return (
    <Card 
      title={titleElement}
      className="col-span-full"
    >
      <div className="flex flex-col space-y-2">
        {/* Compact stats display */}
        <div className="flex justify-between text-xs text-dark-400 px-1">
          <span>Wallets: <span className="text-primary-400 font-mono">{formatNumber(walletsScanned)}</span></span>
          <span>Txns: <span className="text-secondary-400 font-mono">{formatNumber(transactionsAnalyzed)}</span></span>
          <span>Anomalies: <span className="text-danger-400 font-mono">{suspiciousActivities}</span></span>
        </div>
        
        {/* Progress bar - more subtle */}
        <div className="w-full bg-dark-800 rounded-full h-1.5">
          <div 
            className="bg-primary-700 h-1.5 rounded-full" 
            style={{ width: `${scanProgress}%`, transition: 'width 0.3s ease-in-out' }}
          ></div>
        </div>
        
        {/* Terminal output - smaller height */}
        <div 
          ref={terminalRef}
          className="bg-dark-900 border border-dark-800 rounded-lg p-2 h-32 overflow-y-auto font-mono text-xs"
        >
          {logs.map((log) => (
            <div key={log.id} className="terminal-line">
              <span className="text-dark-500">[{log.timestamp}]</span>{' '}
              <span className={logStyles[log.type]}>{log.message}</span>
            </div>
          ))}
          {isScanning && (
            <div className="terminal-cursor">
              <span className="text-dark-500 opacity-60">[{new Date().toISOString().split('T')[1].slice(0, 8)}]</span>{' '}
              <span className="text-primary-500 opacity-80">$_</span>
            </div>
          )}
        </div>
        
        {/* Minimalistic process indicator */}
        <div className="text-xs text-dark-500 flex justify-between items-center">
          <span className="opacity-60">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary-500 opacity-75 mr-1"></span>
            {isScanning ? currentProcess.replace(/_/g, ' ') : 'scan complete'}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default TokenScannerTerminal;