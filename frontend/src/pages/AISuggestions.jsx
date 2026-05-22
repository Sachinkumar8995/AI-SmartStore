import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  HiOutlineLightBulb, HiOutlineTrendingUp, HiOutlineCurrencyDollar,
  HiOutlineExclamationCircle, HiOutlineSparkles, HiOutlineRefresh
} from 'react-icons/hi';

function AISuggestions() {
  const [insights, setInsights] = useState(null);
  const [pricingData, setPricingData] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pricingLoading, setPricingLoading] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [insightsRes, productsRes] = await Promise.all([
        api.get('/ai/suggestions'),
        api.get('/products?limit=100')
      ]);
      setInsights(insightsRes.data.data);
      setProducts(productsRes.data.data);
    } catch (err) {
      toast.error('Failed to load suggestions');
    } finally {
      setLoading(false);
    }
  };

  const loadPricing = async (productId) => {
    setPricingLoading(true);
    try {
      const res = await api.get(`/ai/pricing/${productId}`);
      setPricingData(prev => {
        const exists = prev.findIndex(p => p.productId === productId);
        const entry = { productId, ...res.data.data };
        if (exists >= 0) {
          const updated = [...prev];
          updated[exists] = entry;
          return updated;
        }
        return [...prev, entry];
      });
      toast.success('Pricing analysis complete');
    } catch (err) {
      toast.error('Failed to get pricing suggestion');
    } finally {
      setPricingLoading(false);
    }
  };

  const getInsightIcon = (type) => {
    const icons = {
      trending: { icon: HiOutlineTrendingUp, bg: 'rgba(99,102,241,0.12)', color: '#818cf8' },
      opportunity: { icon: HiOutlineLightBulb, bg: 'rgba(245,158,11,0.12)', color: '#fbbf24' },
      action: { icon: HiOutlineExclamationCircle, bg: 'rgba(239,68,68,0.12)', color: '#f87171' },
      suggestion: { icon: HiOutlineSparkles, bg: 'rgba(16,185,129,0.12)', color: '#34d399' },
      info: { icon: HiOutlineLightBulb, bg: 'rgba(6,182,212,0.12)', color: '#22d3ee' }
    };
    return icons[type] || icons.info;
  };

  const getPriorityColor = (priority) => {
    const colors = { high: '#f87171', medium: '#fbbf24', low: '#34d399' };
    return colors[priority] || colors.medium;
  };

  if (loading) {
    return (
      <div>
        <div className="page-header"><div><h1>AI Suggestions</h1><p>Smart insights for your store</p></div></div>
        <div className="loading-screen"><div className="spinner spinner-lg" /><p>Analyzing your store data...</p></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>💡 AI Suggestions</h1>
          <p>Smart pricing recommendations and trending product insights</p>
        </div>
        <button className="btn btn-secondary" onClick={loadData}>
          <HiOutlineRefresh /> Refresh
        </button>
      </div>

      <div className="page-body">
        {/* Summary */}
        {insights?.summary && (
          <div className="glass-card" style={{
            padding: '20px 24px', marginBottom: '24px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))',
            borderColor: 'rgba(99,102,241,0.2)'
          }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <strong style={{ color: 'var(--accent-primary)' }}>🧠 AI Analysis:</strong> {insights.summary}
            </div>
          </div>
        )}

        {/* Insights Grid */}
        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' }}>Trending Insights</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '36px' }}>
          {insights?.insights?.map((insight, i) => {
            const { icon: Icon, bg, color } = getInsightIcon(insight.type);
            return (
              <div key={i} className="glass-card insight-card animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="insight-icon" style={{ background: bg, color }}>
                  <Icon />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="insight-title">{insight.title}</span>
                    <span style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: getPriorityColor(insight.priority),
                      flexShrink: 0
                    }} title={`${insight.priority} priority`} />
                  </div>
                  <p className="insight-desc">{insight.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pricing Recommendations */}
        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' }}>
          <HiOutlineCurrencyDollar style={{ verticalAlign: 'middle', marginRight: '6px' }} />
          Pricing Recommendations
        </h2>
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Current Price</th>
                <th>Category</th>
                <th>Stock</th>
                <th>AI Analysis</th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 10).map((product) => {
                const pricing = pricingData.find(p => p.productId === product._id);
                return (
                  <tr key={product._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt="" className="product-thumb" />
                        ) : (
                          <div className="product-thumb" style={{ background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📦</div>
                        )}
                        <span style={{ fontWeight: '500', fontSize: '0.875rem' }}>{product.name}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: '600' }}>${product.price.toFixed(2)}</td>
                    <td><span className="badge badge-primary">{product.category}</span></td>
                    <td>{product.stock}</td>
                    <td>
                      {pricing ? (
                        <div style={{ maxWidth: '300px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: '700', color: 'var(--accent-green)' }}>
                              ${pricing.suggestedPrice?.toFixed(2)}
                            </span>
                            <span className={`badge ${pricing.confidence === 'High' ? 'badge-active' : pricing.confidence === 'Medium' ? 'badge-draft' : 'badge-archived'}`}>
                              {pricing.confidence}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                            {pricing.reasoning?.substring(0, 150)}
                          </div>
                        </div>
                      ) : (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => loadPricing(product._id)}
                          disabled={pricingLoading}
                        >
                          {pricingLoading ? <span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} /> : '🤖 Analyze'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AISuggestions;
