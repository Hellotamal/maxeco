import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BackToTop from '../components/BackToTop';

export default function MainLayout({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('maxeco_theme') || 'dark';
  });
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Apply theme to document element and persist
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('maxeco_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <main style={{ flexGrow: 1 }} id="main-content">
        {children}
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
