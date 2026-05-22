import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineSearch, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSparkles, HiOutlineEye, HiOutlineSave } from 'react-icons/hi';

function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '', category: 'Electronics', price: '', costPrice: '', stock: '',
    description: '', imageUrl: '', status: 'active'
  });
   const [formLoading, setFormLoading] = useState(false);
  const navigate = useNavigate();

  // AI Content Preview Modal States
  const [selectedAIProduct, setSelectedAIProduct] = useState(null);
  const [aiPreviewDesc, setAiPreviewDesc] = useState('');
  const [aiPreviewTags, setAiPreviewTags] = useState('');
  const [aiPreviewCaption, setAiPreviewCaption] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSaving, setAiSaving] = useState(false);
  const [aiModalSavedValues, setAiModalSavedValues] = useState({ description: '', tags: '', caption: '' });

  const openAIPreview = (product) => {
    setSelectedAIProduct(product);
    setAiPreviewDesc(product.aiDescription || '');
    setAiPreviewTags((product.seoTags || []).join(', '));
    setAiPreviewCaption(product.marketingCaption || '');
    setAiModalSavedValues({
      description: product.aiDescription || '',
      tags: (product.seoTags || []).join(', '),
      caption: product.marketingCaption || ''
    });
  };

  const generateAIContentForModal = async () => {
    if (!selectedAIProduct) return;
    setAiGenerating(true);
    try {
      const res = await api.post('/ai/generate-all', { productId: selectedAIProduct._id });
      const data = res.data.data;
      
      setAiPreviewDesc(data.description || '');
      setAiPreviewTags((data.tags || []).join(', '));
      setAiPreviewCaption(data.caption || '');
      
      setAiModalSavedValues({
        description: data.description || '',
        tags: (data.tags || []).join(', '),
        caption: data.caption || ''
      });
      
      toast.success('AI assets composed and updated successfully!');
      loadProducts();
    } catch (err) {
      const errorMsg = err.response?.data?.error || '';
      if (errorMsg.includes('API key expired') || errorMsg.includes('INVALID_ARGUMENT') || errorMsg.includes('expired')) {
        toast.error('Gemini API key is expired! Renew it in backend/.env or comment it out to run in Mock Mode.', { id: 'gemini-err', duration: 8000 });
      } else if (errorMsg.includes('quota') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('429')) {
        toast.error('Gemini free tier quota exceeded! Wait 60s or comment key out to run in Mock Mode.', { id: 'gemini-err', duration: 8000 });
      } else {
        toast.error(errorMsg || 'AI generation failed');
      }
    } finally {
      setAiGenerating(false);
    }
  };

  const saveAIContentFromModal = async () => {
    if (!selectedAIProduct) return;
    setAiSaving(true);
    try {
      const payload = {
        aiDescription: aiPreviewDesc,
        seoTags: aiPreviewTags.split(',').map(t => t.trim()).filter(t => t.length > 0),
        marketingCaption: aiPreviewCaption
      };
      
      const res = await api.put(`/products/${selectedAIProduct._id}`, payload);
      const updated = res.data.data;
      
      setAiModalSavedValues({
        description: updated.aiDescription || '',
        tags: (updated.seoTags || []).join(', '),
        caption: updated.marketingCaption || ''
      });
      
      toast.success('Manual changes saved to catalog successfully!');
      loadProducts();
    } catch (err) {
      toast.error('Failed to save manual alterations');
    } finally {
      setAiSaving(false);
    }
  };

  const hasModalChanges = () => {
    return aiPreviewDesc !== aiModalSavedValues.description ||
           aiPreviewTags !== aiModalSavedValues.tags ||
           aiPreviewCaption !== aiModalSavedValues.caption;
  };


  const categories = ['Electronics', 'Clothing', 'Home & Kitchen', 'Sports', 'Beauty', 'Books', 'Toys', 'Food & Beverage', 'Other'];

  useEffect(() => { loadProducts(); }, [search, category, status]);

  const loadProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (status) params.append('status', status);
      const res = await api.get(`/products?${params.toString()}`);
      setProducts(res.data.data);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const openCreateForm = () => {
    setEditProduct(null);
    setFormData({ name: '', category: 'Electronics', price: '', costPrice: '', stock: '', description: '', imageUrl: '', status: 'active' });
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditProduct(product);
    setFormData({
      name: product.name, category: product.category, price: product.price,
      costPrice: product.costPrice || '', stock: product.stock,
      description: product.description || '', imageUrl: product.imageUrl || '', status: product.status
    });
    setShowForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) { toast.error('Name and price are required'); return; }
    setFormLoading(true);
    try {
      if (editProduct) {
        await api.put(`/products/${editProduct._id}`, formData);
        toast.success('Product updated!');
      } else {
        await api.post('/products', formData);
        toast.success('Product created!');
      }
      setShowForm(false);
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save product');
    } finally {
      setFormLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      loadProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const statusBadge = (s) => {
    const map = { active: 'badge-active', draft: 'badge-draft', archived: 'badge-archived' };
    return <span className={`badge ${map[s] || ''}`}>{s}</span>;
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p>Manage your product catalog</p>
        </div>
        <button id="add-product-btn" className="btn btn-primary" onClick={openCreateForm}>
          <HiOutlinePlus /> Add Product
        </button>
      </div>

      <div className="page-body">
        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ flex: '1', minWidth: '200px' }}>
            <HiOutlineSearch className="icon" />
            <input
              id="product-search"
              className="form-input"
              style={{ paddingLeft: '40px' }}
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select id="filter-category" className="form-select" style={{ width: '180px' }} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select id="filter-status" className="form-select" style={{ width: '140px' }} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Product Table */}
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div className="loading-screen"><div className="spinner spinner-lg" /><p>Loading products...</p></div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📦</div>
              <h3>No products found</h3>
              <p>Add your first product to get started with AI-powered content generation.</p>
              <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={openCreateForm}>
                <HiOutlinePlus /> Add Product
              </button>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>AI Content</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="product-thumb" />
                        ) : (
                          <div className="product-thumb" style={{ background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📦</div>
                        )}
                        <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{product.name}</span>
                      </div>
                    </td>
                    <td><span className="badge badge-primary">{product.category}</span></td>
                    <td style={{ fontWeight: '600' }}>${product.price.toFixed(2)}</td>
                    <td>
                      <span style={{ color: product.stock <= 10 ? (product.stock === 0 ? 'var(--accent-red)' : 'var(--accent-amber)') : 'var(--accent-green)', fontWeight: '600' }}>
                        {product.stock}
                      </span>
                    </td>
                    <td>{statusBadge(product.status)}</td>
                     <td style={{ cursor: 'pointer' }} onClick={() => openAIPreview(product)} title="Click to view AI copy">
                      {product.aiDescription ? (
                        <span className="badge badge-active" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <HiOutlineEye style={{ fontSize: '0.9rem' }} /> ✓ Generated
                        </span>
                      ) : (
                        <span className="badge badge-draft" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <HiOutlineSparkles style={{ fontSize: '0.9rem' }} /> Pending
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-icon" title="Generate AI Content" onClick={() => navigate('/ai-content', { state: { productId: product._id } })}>
                          <HiOutlineSparkles />
                        </button>
                        <button className="btn btn-ghost btn-icon" title="Edit" onClick={() => openEditForm(product)}>
                          <HiOutlinePencil />
                        </button>
                        {user?.role === 'admin' && (
                          <button className="btn btn-ghost btn-icon" title="Delete" style={{ color: 'var(--accent-red)' }} onClick={() => deleteProduct(product._id)}>
                            <HiOutlineTrash />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal-content animate-slide-up">
            <div className="modal-header">
              <h2>{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input id="form-product-name" className="form-input" placeholder="Enter product name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select id="form-category" className="form-select" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select id="form-status" className="form-select" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Price ($) *</label>
                    <input id="form-price" type="number" step="0.01" className="form-input" placeholder="0.00" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cost Price ($)</label>
                    <input id="form-cost-price" type="number" step="0.01" className="form-input" placeholder="0.00" value={formData.costPrice} onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock</label>
                    <input id="form-stock" type="number" className="form-input" placeholder="0" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea id="form-description" className="form-textarea" placeholder="Product description..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input id="form-image-url" className="form-input" placeholder="https://..." value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button id="form-submit" type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> : (editProduct ? 'Update Product' : 'Create Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* AI Content Preview Modal */}
      {selectedAIProduct && (
        <div className="modal-overlay animate-fade-in" onClick={(e) => e.target === e.currentTarget && setSelectedAIProduct(null)}>
          <div className="modal-content animate-slide-up" style={{ maxWidth: '720px' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HiOutlineSparkles style={{ color: 'var(--accent-primary)' }} /> AI Content Studio — {selectedAIProduct.name}
              </h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelectedAIProduct(null)}>✕</button>
            </div>
            
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                
                {/* Left Side: Original Information */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px', background: 'rgba(99,102,241,0.06)', borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(99,102,241,0.1)'
                  }}>
                    {selectedAIProduct.imageUrl ? (
                      <img src={selectedAIProduct.imageUrl} alt="" className="product-thumb-lg" style={{ objectFit: 'cover' }} />
                    ) : (
                      <div className="product-thumb-lg" style={{ background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📦</div>
                    )}
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{selectedAIProduct.name}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>
                        {selectedAIProduct.category} · <strong style={{ color: 'var(--text-primary)' }}>${selectedAIProduct.price}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '16px' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Original Catalog Description
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                      {selectedAIProduct.description || 'No catalog description provided.'}
                    </p>
                  </div>

                  {/* Actions inside modal */}
                  <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(99,102,241,0.04)', borderColor: 'rgba(99,102,241,0.1)' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <HiOutlineSparkles /> Quick Action Deck
                    </h4>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={generateAIContentForModal}
                      disabled={aiGenerating}
                      style={{ width: '100%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      {aiGenerating ? (
                        <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                      ) : (
                        <><HiOutlineSparkles /> ⚡ Regenerate All AI Content</>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setSelectedAIProduct(null);
                        navigate('/ai-content', { state: { productId: selectedAIProduct._id } });
                      }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      ✏️ Open in Advanced AI Studio
                    </button>
                  </div>
                </div>

                {/* Right Side: AI Generated Assets */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* AI Description Field */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: '700', display: 'flex', justifyContent: 'space-between' }}>
                      <span>📝 AI-Generated Description</span>
                      {aiModalSavedValues.description && aiPreviewDesc === aiModalSavedValues.description && (
                        <span style={{ color: 'var(--accent-green)', fontSize: '0.7rem' }}>✓ Saved</span>
                      )}
                    </label>
                    <textarea
                      className="form-textarea"
                      style={{ minHeight: '80px', fontSize: '0.8rem', lineHeight: '1.5' }}
                      value={aiPreviewDesc}
                      onChange={(e) => setAiPreviewDesc(e.target.value)}
                      placeholder="AI generated product description..."
                    />
                  </div>

                  {/* SEO Tags Field */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: '700' }}>
                      🏷️ SEO Tags (Comma Separated)
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ fontSize: '0.8rem' }}
                      value={aiPreviewTags}
                      onChange={(e) => setAiPreviewTags(e.target.value)}
                      placeholder="gadgets, premium, new..."
                    />
                    {aiPreviewTags && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                        {aiPreviewTags.split(',').map((t, i) => t.trim()).filter(t => t.length > 0).map((tag, idx) => (
                          <span key={idx} className="ai-tag" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Marketing Caption Field */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: '700' }}>
                      📢 Social Ad Pitch
                    </label>
                    <textarea
                      className="form-textarea"
                      style={{ minHeight: '60px', fontSize: '0.8rem', lineHeight: '1.4' }}
                      value={aiPreviewCaption}
                      onChange={(e) => setAiPreviewCaption(e.target.value)}
                      placeholder="Catchy social pitch with hashtags..."
                    />
                  </div>

                  {/* Post Preview Widget */}
                  {aiPreviewCaption && (
                    <div style={{
                      padding: '10px',
                      background: 'rgba(0,0,0,0.15)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.75rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <div style={{
                          width: '20px', height: '20px', borderRadius: '50%',
                          background: 'var(--gradient-primary)', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', fontWeight: '800',
                          color: 'white', fontSize: '0.6rem'
                        }}>{selectedAIProduct.category?.charAt(0) || 'S'}</div>
                        <span style={{ fontWeight: '700', fontSize: '0.75rem' }}>E-Storefront Ad Preview</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: '1.4' }}>
                        "{aiPreviewCaption}"
                      </div>
                    </div>
                  )}

                </div>

              </div>
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedAIProduct(null)}>
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={saveAIContentFromModal}
                disabled={aiSaving || !hasModalChanges()}
                style={{ background: hasModalChanges() ? 'var(--gradient-success)' : 'var(--bg-input)', borderColor: 'transparent', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {aiSaving ? (
                  <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                ) : (
                  <><HiOutlineSave /> Save Manual Adjustments</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default Products;
