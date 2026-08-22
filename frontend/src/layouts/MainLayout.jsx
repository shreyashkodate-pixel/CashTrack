import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Receipt, Tags, ChevronLeft, ChevronRight, Wallet } from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { ToastContainer } from '../components/common/Toast';
import './MainLayout.css';

export const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="layout-container">
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`} aria-label="Sidebar Navigation">
        <div>
          <div className="sidebar-header">
            <div className="sidebar-brand-icon" aria-hidden="true">
              <Wallet size={18} />
            </div>
            <span className="sidebar-brand-name">CashTrack</span>
          </div>

          <nav className="sidebar-nav">
            <span className="sidebar-group-label">Overview</span>
            
            <NavLink 
              to="/" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} 
              end
              title="Dashboard"
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>

            <span className="sidebar-group-label">Management</span>

            <NavLink 
              to="/expenses" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              title="Expenses"
            >
              <Receipt size={18} />
              <span>Expenses</span>
            </NavLink>

            <NavLink 
              to="/categories" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              title="Categories"
            >
              <Tags size={18} />
              <span>Categories</span>
            </NavLink>
          </nav>
        </div>

        <div className="sidebar-footer">
          <button 
            type="button" 
            className="collapse-btn" 
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            <span>Collapse Sidebar</span>
          </button>
        </div>
      </aside>

      <div className="main-wrapper">
        <Navbar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
