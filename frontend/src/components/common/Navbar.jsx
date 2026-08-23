import React from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Sun, Moon, Bell, Menu } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import './Navbar.css';

export const Navbar = ({ onToggleSidebar }) => {
  const { theme, toggleTheme } = useAppContext();
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/expenses':
        return 'Expenses';
      case '/categories':
        return 'Categories';
      default:
        return 'CashTrack';
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        {/* Hamburger — visible on mobile only */}
        <button
          type="button"
          className="navbar-hamburger"
          onClick={onToggleSidebar}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="navbar-breadcrumb">
          <span>App</span>
          <span>/</span>
          <span className="current">{getPageTitle()}</span>
        </div>
      </div>

      <div className="navbar-right">
        <button className="navbar-search-btn" type="button" aria-label="Global search">
          <Search size={14} />
          <span className="navbar-search-text">Quick search...</span>
          <kbd className="kbd-shortcut">⌘K</kbd>
        </button>

        <button 
          className="icon-action-btn" 
          onClick={toggleTheme} 
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <button className="icon-action-btn" aria-label="Notifications">
          <Bell size={18} />
        </button>

        <div className="user-avatar-badge" title="User Account">
          CT
        </div>
      </div>
    </header>
  );
};
