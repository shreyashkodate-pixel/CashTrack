import React from 'react';
import { Card, CardHeader, CardBody } from '../components/common/Card';
import { useExpenses } from '../hooks/useExpenses';
import { useCategories } from '../hooks/useCategories';
import { MetricCardSkeleton, Skeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ArrowDownRight, Layers, CreditCard, PieChart, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import './Dashboard.css';

export const Dashboard = () => {
  const { summary, expenses, loading: expensesLoading } = useExpenses();
  const { categories, loading: categoriesLoading } = useCategories();

  const loading = expensesLoading || categoriesLoading;

  // Calculate top category and category breakdown
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.categoryName] = (acc[exp.categoryName] || 0) + exp.amount;
    return acc;
  }, {});

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const topCategoryName = sortedCategories.length > 0 ? sortedCategories[0][0] : 'None';

  const totalAmount = summary.totalAmount || 0;
  const totalCount = summary.totalCount || 0;

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="page-header-text">
          <h1>Financial Dashboard</h1>
          <p className="page-subtitle">Real-time overview of your cash flow and expense categories</p>
        </div>
      </header>

      {/* 4 Metric Cards */}
      <section className="metric-grid" aria-label="Financial Metrics">
        {loading ? (
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : (
          <>
            <Card variant="metric">
              <div className="card-metric-header">
                <span className="overline">Total Expenses</span>
                <div className="card-metric-icon">
                  <ArrowDownRight size={18} />
                </div>
              </div>
              <div className="card-metric-body">
                <span className="metric-value">
                  ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <div className="card-metric-footer">
                  <span className="delta-chip neutral">{totalCount} total entries</span>
                </div>
              </div>
            </Card>

            <Card variant="metric">
              <div className="card-metric-header">
                <span className="overline">Total Transactions</span>
                <div className="card-metric-icon">
                  <CreditCard size={18} />
                </div>
              </div>
              <div className="card-metric-body">
                <span className="metric-value">{totalCount}</span>
                <div className="card-metric-footer">
                  <span className="label-caption">Recorded to date</span>
                </div>
              </div>
            </Card>

            <Card variant="metric">
              <div className="card-metric-header">
                <span className="overline">Top Category</span>
                <div className="card-metric-icon">
                  <PieChart size={18} />
                </div>
              </div>
              <div className="card-metric-body">
                <span className="metric-value metric-value-sm">
                  {topCategoryName}
                </span>
                <div className="card-metric-footer">
                  <span className="label-caption">Highest cumulative spend</span>
                </div>
              </div>
            </Card>

            <Card variant="metric">
              <div className="card-metric-header">
                <span className="overline">Active Categories</span>
                <div className="card-metric-icon">
                  <Layers size={18} />
                </div>
              </div>
              <div className="card-metric-body">
                <span className="metric-value">{categories.length}</span>
                <div className="card-metric-footer">
                  <span className="label-caption">Customizable tags</span>
                </div>
              </div>
            </Card>
          </>
        )}
      </section>

      {/* Grid Sections: Category Breakdown & Recent Expenses */}
      <div className="dashboard-sections-grid">
        {/* Category Breakdown */}
        <Card>
          <CardHeader 
            title="Category Breakdown" 
            description="Expense distribution across categories"
          />
          <CardBody>
            {loading ? (
              <div className="stack-gap-4">
                <Skeleton height="24px" />
                <Skeleton height="24px" />
                <Skeleton height="24px" />
              </div>
            ) : sortedCategories.length === 0 ? (
              <EmptyState 
                icon={PieChart}
                title="No expenses logged yet"
                description="Add your first expense to see your category spending breakdown."
              />
            ) : (
              <div className="breakdown-list">
                {sortedCategories.map(([catName, amount]) => {
                  const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
                  return (
                    <div key={catName} className="breakdown-item">
                      <div className="breakdown-item-header">
                        <span className="breakdown-category-name">{catName}</span>
                        <span className="breakdown-category-amount">
                          ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="breakdown-bar-bg">
                        <div 
                          className="breakdown-bar-fill" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Recent Expenses List */}
        <Card>
          <CardHeader 
            title="Recent Expenses" 
            description="Latest transactions recorded"
            action={<Link to="/expenses" className="link-action">View all →</Link>}
          />
          <CardBody>
            {loading ? (
              <div className="stack-gap-4">
                <Skeleton height="20px" />
                <Skeleton height="20px" />
                <Skeleton height="20px" />
              </div>
            ) : expenses.length === 0 ? (
              <EmptyState 
                icon={Receipt}
                title="No recent expenses"
                description="Your recent activity will appear here once you log an expense."
              />
            ) : (
              <div>
                {expenses.slice(0, 5).map((exp) => (
                  <div key={exp.id} className="recent-expense-item">
                    <div className="recent-expense-info">
                      <span className="recent-expense-title">{exp.title}</span>
                      <span className="recent-expense-date">
                        {exp.categoryName} • {format(new Date(exp.expenseDate), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <span className="recent-expense-amount">
                      ₹{exp.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
