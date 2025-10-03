import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// Lazy load the page components
const Settings = lazy(() => import('./components/Settings'));
const Queue = lazy(() => import('./components/Queue'));
const Documentation = lazy(() => import('./components/Documentation'));

function App() {
  return (
    <Router>
      <Suspense fallback={<div className="container text-center mt-5">Carregando...</div>}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Settings />} />
            <Route path="queue" element={<Queue />} />
            <Route path="docs" element={<Documentation />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;