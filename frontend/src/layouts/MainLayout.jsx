import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Receipt, Tags, Sun, Moon } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { ToastContainer } from '../components/common/Toast';
import './MainLayout.css';

export const MainLayout = () => {
  const { theme, toggleTheme } = useAppContext();

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>CashTrack</h2>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/expenses" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Receipt size={20} />
            <span>Expenses</span>
          </NavLink>
          <NavLink to="/categories" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Tags size={20} />
            <span>Categories</span>
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
        </div>
      </aside>
      
      <main className="main-content">
        <Outlet />
      </main>

      <ToastContainer />
    </div>
  );
};
