import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { HiOutlineExclamationCircle, HiOutlineCube, HiOutlineCurrencyDollar, HiOutlineRefresh } from 'react-icons/hi';

function Inventory() {
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(10);

  useEffect(() => { loadInventory(); }, [threshold]);

  const loadInventory = async () => {
    try {
      const [alertsRes, summaryRes] = await Promise.all([
        api.get(`/inventory/alerts?threshold=${threshold}`),
        api.get('/inventory/summary')
      ]);
      setAlerts(alertsRes.data.data);
      setSummary(summaryRes.data.data);
    } catch (err) {
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="page-header"><div><h1>Inventory</h1><p>Stock levels and alerts</p></div></div>
        <div className="loading-screen"><div className="spinner spinner-lg" /><p>Loading inventory...</p></div>
      </div>
    );
  }

  const summaryCards = summary ? [
    { label: 'Total Products', value: summary.totalProducts, icon: HiOutlineCube, color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
    { label: 'Total Stock Units', value: summary.totalStock.toLocaleString(), icon: HiOutlineCube, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
    { label: 'Inventory Value', value: `$${summary.totalValue.toLocaleString()}`, icon: HiOutlineCurrencyDollar, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    { label: 'Low Stock Alerts', value: summary.lowStock + summary.outOfStock, icon: HiOutlineExclamationCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  ] : [];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>📦 Inventory</h1>
          <p>Monitor stock levels and manage inventory alerts</p>
        </div>
        <button className="btn btn-secondary" onClick={loadInventory}>
          <HiOutlineRefresh /> Refresh
        </button>
      </div>

      <div className="page-body">
        {/* Summary KPIs */}
        <div className="grid-kpi">
          {summaryCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="glass-card kpi-card animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="kpi-icon" style={{ background: card.bg, color: card.color }}><Icon /></div>
                <div className="kpi-value">{card.value}</div>
                <div className="kpi-label">{card.label}</div>
              </div>
            );
          })}
        </div>

        {/* Stock Health */}
        {summary && (
          <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px' }}>Stock Health Overview</h3>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Healthy: <strong style={{ color: 'var(--text-primary)' }}>{summary.healthyStock}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Low Stock: <strong style={{ color: 'var(--text-primary)' }}>{summary.lowStock}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Out of Stock: <strong style={{ color: 'var(--text-primary)' }}>{summary.outOfStock}</strong></span>
              </div>
            </div>
            {/* Health bar */}
            <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', marginTop: '16px', background: 'var(--bg-input)' }}>
              <div style={{ width: `${(summary.healthyStock / summary.totalProducts) * 100}%`, background: '#10b981' }} />
              <div style={{ width: `${(summary.lowStock / summary.totalProducts) * 100}%`, background: '#f59e0b' }} />
              <div style={{ width: `${(summary.outOfStock / summary.totalProducts) * 100}%`, background: '#ef4444' }} />
            </div>
          </div>
        )}

        {/* Category Breakdown */}
        {summary?.categoryBreakdown && (
          <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px' }}>Category Breakdown</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              {Object.entries(summary.categoryBreakdown).map(([cat, data]) => (
                <div key={cat} style={{
                  padding: '14px', background: 'rgba(99,102,241,0.05)',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'
                }}>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '6px' }}>{cat}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {data.count} products · {data.totalStock} units · ${data.totalValue.toFixed(0)} value
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Low Stock Alerts Table */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>
            <HiOutlineExclamationCircle style={{ verticalAlign: 'middle', marginRight: '6px', color: 'var(--accent-amber)' }} />
            Low Stock Alerts
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Threshold:</label>
            <select id="stock-threshold" className="form-select" style={{ width: '80px', padding: '6px 10px', fontSize: '0.85rem' }} value={threshold} onChange={(e) => setThreshold(parseInt(e.target.value))}>
              <option value="5">≤ 5</option>
              <option value="10">≤ 10</option>
              <option value="20">≤ 20</option>
              <option value="50">≤ 50</option>
            </select>
          </div>
        </div>

        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {alerts.length === 0 ? (
            <div className="empty-state">
              <div className="icon">✅</div>
              <h3>All Clear!</h3>
              <p>No products below the stock threshold of {threshold} units.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock Level</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt="" className="product-thumb" />
                        ) : (
                          <div className="product-thumb" style={{ background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📦</div>
                        )}
                        <span style={{ fontWeight: '600' }}>{product.name}</span>
                      </div>
                    </td>
                    <td><span className="badge badge-primary">{product.category}</span></td>
                    <td style={{ fontWeight: '600' }}>${product.price.toFixed(2)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '60px', height: '6px', borderRadius: '3px', background: 'var(--bg-input)', overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${Math.min((product.stock / threshold) * 100, 100)}%`,
                            background: product.stock === 0 ? '#ef4444' : product.stock <= 5 ? '#f59e0b' : '#10b981',
                            borderRadius: '3px',
                            transition: 'width 0.3s'
                          }} />
                        </div>
                        <span style={{
                          fontWeight: '700', fontSize: '0.9rem',
                          color: product.stock === 0 ? 'var(--accent-red)' : 'var(--accent-amber)'
                        }}>
                          {product.stock}
                        </span>
                      </div>
                    </td>
                    <td>
                      {product.stock === 0 ? (
                        <span className="badge badge-danger">Out of Stock</span>
                      ) : (
                        <span className="badge badge-draft">Low Stock</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Inventory;
