import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/theme.css';

// Handle GitHub Pages SPA redirection query parameter: ?p=/route-name
(function handleSpaRedirect() {
  const params = new URLSearchParams(window.location.search);
  const redirectPath = params.get('p');
  if (redirectPath) {
    const cleanPath = decodeURIComponent(redirectPath);
    // Replace URL without reloading before React mounts
    const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
    const targetUrl = baseUrl + cleanPath + window.location.hash;
    window.history.replaceState(null, '', targetUrl);
  }
})();

// Mount Root
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}
