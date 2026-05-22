import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler, ArcElement, BarElement
} from 'chart.js';
import { HiOutlineCurrencyDollar, HiOutlineShoppingCart, HiOutlineCube, HiOutlineTrendingUp } from 'react-icons/hi';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement, BarElement);

function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [overviewRes, revenueRes, topRes, catRes, recentRes] = await Promise.all([
        api.get('/sales/overview'),
        api.get('/sales/revenue-chart?period=30'),
        api.get('/sales/top-products?limit=5'),
        api.get('/sales/by-category'),
        api.get('/sales/recent?limit=5')
      ]);
      setOverview(overviewRes.data.data);
      setRevenueData(revenueRes.data.data);
      setTopProducts(topRes.data.data);
      setCategoryData(catRes.data.data);
      setRecentSales(recentRes.data.data);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="page-header"><div><h1>Dashboard</h1><p>Overview of your store performance</p></div></div>
        <div className="loading-screen"><div className="spinner spinner-lg" /><p>Loading dashboard...</p></div>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Revenue', value: `$${(overview?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: HiOutlineCurrencyDollar, color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
    { label: 'Total Orders', value: overview?.totalOrders || 0, icon: HiOutlineShoppingCart, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
    { label: 'Products', value: overview?.productCount || 0, icon: HiOutlineCube, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    { label: 'Avg Order Value', value: `$${(overview?.avgOrderValue || 0).toFixed(2)}`, icon: HiOutlineTrendingUp, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  ];

  // Revenue chart config
  const revenueChartData = {
    labels: revenueData.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [{
      label: 'Revenue',
      data: revenueData.map(d => d.revenue),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.08)',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: '#6366f1',
      pointHoverBorderColor: '#fff',
      pointHoverBorderWidth: 2,
      borderWidth: 2.5,
    }]
  };

  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(99, 102, 241, 0.3)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => `Revenue: $${ctx.parsed.y.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(99, 102, 241, 0.06)' },
        ticks: { color: '#64748b', font: { size: 11 }, maxTicksLimit: 8 }
      },
      y: {
        grid: { color: 'rgba(99, 102, 241, 0.06)' },
        ticks: {
          color: '#64748b', font: { size: 11 },
          callback: (v) => `$${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`
        }
      }
    }
  };

  // Category doughnut
  const categoryColors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const categoryChartData = {
    labels: categoryData.map(c => c._id),
    datasets: [{
      data: categoryData.map(c => c.totalRevenue),
      backgroundColor: categoryColors.slice(0, categoryData.length),
      borderColor: 'rgba(10, 14, 26, 0.8)',
      borderWidth: 3,
      hoverOffset: 8
    }]
  };

  const categoryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#94a3b8', padding: 16, font: { size: 12 }, usePointStyle: true, pointStyleWidth: 8 }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#f1f5f9', bodyColor: '#94a3b8',
        borderColor: 'rgba(99, 102, 241, 0.3)', borderWidth: 1,
        padding: 12, cornerRadius: 8,
        callbacks: { label: (ctx) => `$${ctx.parsed.toLocaleString('en-US', { minimumFractionDigits: 2 })}` }
      }
    }
  };

  // Top products bar
  const topProductsChartData = {
    labels: topProducts.map(p => p.product?.name?.substring(0, 20) + (p.product?.name?.length > 20 ? '...' : '')),
    datasets: [{
      label: 'Revenue',
      data: topProducts.map(p => p.totalRevenue),
      backgroundColor: topProducts.map((_, i) => categoryColors[i % categoryColors.length] + '40'),
      borderColor: topProducts.map((_, i) => categoryColors[i % categoryColors.length]),
      borderWidth: 1.5,
      borderRadius: 6,
      barThickness: 28
    }]
  };

  const topProductsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)', titleColor: '#f1f5f9', bodyColor: '#94a3b8',
        borderColor: 'rgba(99, 102, 241, 0.3)', borderWidth: 1, padding: 12, cornerRadius: 8,
        callbacks: { label: (ctx) => `Revenue: $${ctx.parsed.x.toLocaleString('en-US', { minimumFractionDigits: 2 })}` }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(99, 102, 241, 0.06)' },
        ticks: { color: '#64748b', font: { size: 11 }, callback: (v) => `$${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}` }
      },
      y: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 12 } }
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your store performance</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="badge badge-info">
            This Month: ${(overview?.monthRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="page-body">
        {/* KPI Cards */}
        <div className="grid-kpi">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <div key={i} className="glass-card kpi-card animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="kpi-icon" style={{ background: kpi.bg, color: kpi.color }}>
                  <Icon />
                </div>
                <div className="kpi-value">{kpi.value}</div>
                <div className="kpi-label">{kpi.label}</div>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid-charts">
          <div className="glass-card chart-container">
            <h3>Revenue Trend (30 Days)</h3>
            <div className="chart-wrapper">
              <Line data={revenueChartData} options={revenueChartOptions} />
            </div>
          </div>
          <div className="glass-card chart-container">
            <h3>Sales by Category</h3>
            <div className="chart-wrapper">
              <Doughnut data={categoryChartData} options={categoryChartOptions} />
            </div>
          </div>
        </div>

        {/* Top Products & Recent Sales */}
        <div className="grid-2col">
          <div className="glass-card chart-container">
            <h3>Top Products by Revenue</h3>
            <div className="chart-wrapper" style={{ height: '250px' }}>
              <Bar data={topProductsChartData} options={topProductsOptions} />
            </div>
          </div>
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px' }}>Recent Sales</h3>
            {recentSales.length === 0 ? (
              <div className="empty-state"><p>No sales yet</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentSales.map((sale, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 0', borderBottom: i < recentSales.length - 1 ? '1px solid var(--border-color)' : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {sale.product?.imageUrl ? (
                        <img src={sale.product.imageUrl} alt="" className="product-thumb" />
                      ) : (
                        <div className="product-thumb" style={{ background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>📦</div>
                      )}
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{sale.product?.name || 'Product'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {sale.quantity}x · {new Date(sale.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontWeight: '700', color: 'var(--accent-green)', fontSize: '0.9rem' }}>
                      +${sale.totalAmount?.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
