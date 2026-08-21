import React from 'react';
import { Card } from '../components/common/Card';
import { useExpenses } from '../hooks/useExpenses';
import { IndianRupee, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import './Dashboard.css';

export const Dashboard = () => {
  const { summary, loading } = useExpenses();

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Dashboard</h1>
        <p className="subtitle">Overview of your finances</p>
      </header>

      <div className="metric-row">
        <Card className="metric-card">
          <div className="metric-header">
            <h3 className="label-caption">Total Expenses</h3>
            <div className="icon-wrapper error">
              <ArrowDownRight size={20} />
            </div>
          </div>
          <div className="metric-content">
            <span className="metric-value numeric">
              ₹{summary.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
            </span>
            <span className="metric-meta">{summary.totalCount} transactions</span>
          </div>
        </Card>
      </div>
    </div>
  );
};
