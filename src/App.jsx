import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './layouts/MainLayout';
import LoadingScreen from './components/common/LoadingScreen';
import ErrorBoundary from './components/common/ErrorBoundary'; // Add this import

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage').catch(err => {
  console.error("Error loading HomePage:", err);
  return { default: () => <div>Failed to load home page</div> };
}));

const SearchPage = lazy(() => import('./pages/SearchPage').catch(err => {
  console.error("Error loading SearchPage:", err);
  return { default: () => <div>Failed to load search page</div> };
}));

const TokenDashboardPage = lazy(() => import('./pages/TokenDashboardPage').catch(err => {
  console.error("Error loading TokenDashboardPage:", err);
  return { default: () => <div>Failed to load token dashboard</div> };
}));

const HolderAnalysisPage = lazy(() => import('./pages/HolderAnalysisPage').catch(err => {
  console.error("Error loading HolderAnalysisPage:", err);
  return { default: () => <div>Failed to load holder analysis</div> };
}));

const TransactionFlowPage = lazy(() => import('./pages/TransactionFlowPage').catch(err => {
  console.error("Error loading TransactionFlowPage:", err);
  return { default: () => <div>Failed to load transaction flow</div> };
}));

const NotFoundPage = lazy(() => import('./pages/NotFoundPage').catch(err => {
  console.error("Error loading NotFoundPage:", err);
  return { default: () => <div>Failed to load page</div> };
}));

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <ErrorBoundary>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
              <Route path="search" element={<ErrorBoundary><SearchPage /></ErrorBoundary>} />
              <Route path="token/:tokenAddress" element={<ErrorBoundary><TokenDashboardPage /></ErrorBoundary>} />
              <Route path="token/:tokenAddress/holders" element={<ErrorBoundary><HolderAnalysisPage /></ErrorBoundary>} />
              <Route path="token/:tokenAddress/p2p" element={<ErrorBoundary><TransactionFlowPage /></ErrorBoundary>} />
              <Route path="token/:tokenAddress/transactions" element={<ErrorBoundary><TransactionFlowPage /></ErrorBoundary>} />
              <Route path="404" element={<ErrorBoundary><NotFoundPage /></ErrorBoundary>} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </>
  );
}

export default App;