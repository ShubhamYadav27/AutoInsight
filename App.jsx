// ============================================================
// src/App.jsx
// Main React application with routing between pages
// ============================================================

import { useState } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AnalyzePage from './pages/AnalyzePage';
import ResultsPage from './pages/ResultsPage';

export default function App() {
  // Simple client-side routing (no react-router needed for this app)
  const [page, setPage] = useState('home');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [carInfo, setCarInfo] = useState(null);

  const navigate = (to) => {
    setPage(to);
    window.scrollTo(0, 0);
  };

  // Called when analysis completes successfully
  const handleAnalysisComplete = (result, info) => {
    setAnalysisResult(result);
    setCarInfo(info);
    navigate('results');
  };

  return (
    <div className="app">
      <Navbar
        currentPage={page}
        navigate={navigate}
        hasResults={!!analysisResult}
      />

      {page === 'home' && (
        <HomePage navigate={navigate} />
      )}

      {page === 'analyze' && (
        <AnalyzePage
          navigate={navigate}
          onComplete={handleAnalysisComplete}
        />
      )}

      {page === 'results' && analysisResult && (
        <ResultsPage
          result={analysisResult}
          carInfo={carInfo}
          navigate={navigate}
        />
      )}
    </div>
  );
}
