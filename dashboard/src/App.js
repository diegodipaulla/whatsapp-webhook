import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Settings from './components/Settings';
import Queue from './components/Queue';
import Documentation from './components/Documentation';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Settings />} />
          <Route path="queue" element={<Queue />} />
          <Route path="docs" element={<Documentation />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
