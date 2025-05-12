import React from 'react';
import ReactDOM from 'react-dom/client';  // React 18'de yeni kullanım
import './index.css';
import App from './App';

// React 18 ile root oluşturma
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render işlemi
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);