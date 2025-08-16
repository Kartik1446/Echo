import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // This connects your CSS styles
import App from './App'; // This imports your main App component

// This finds the spot in your HTML file to place the app
const root = ReactDOM.createRoot(document.getElementById('root'));

// This is the command that tells React to start and show your App
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
