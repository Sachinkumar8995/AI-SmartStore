import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  HiOutlineSparkles, 
  HiOutlineTag, 
  HiOutlineSpeakerphone, 
  HiOutlineLightningBolt, 
  HiOutlineSave, 
  HiOutlineEye, 
  HiOutlineCheck,
  HiOutlineCube
} from 'react-icons/hi';

function AIContent() {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState(location.state?.productId || '');
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Generation & saving states
  const [generating, setGenerating] = useState({ description: false, tags: false, caption: false, all: false });
  const [saving, setSaving] = useState({ description: false, tags: false, caption: false, all: false });
  
  // Draft content states (bound to inputs)
  const [editedDesc, setEditedDesc] = useState('');
  const [editedTags, setEditedTags] = useState('');
  const [editedCaption, setEditedCaption] = useState('');
  
  // Track previously saved values for change comparison
  const [savedValues, setSavedValues] = useState({ description: '', tags: '', caption: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProducts(); }, []);

  useEffect(() => {
    if (selectedId && products.length > 0) {
      const product = products.find(p => p._id === selectedId);
      setSelectedProduct(product);
      if (product) {
        setEditedDesc(product.aiDescription || '');
        setEditedTags((product.seoTags || []).join(', '));
        setEditedCaption(product.marketingCaption || '');
        
        // Save current DB values to compare later
        setSavedValues({
          description: product.aiDescription || '',
          tags: (product.seoTags || []).join(', '),
          caption: product.marketingCaption || ''
        });
      }
    } else {
      setSelectedProduct(null);
      setEditedDesc('');
      setEditedTags('');
      setEditedCaption('');
      setSavedValues({ description: '', tags: '', caption: '' });
    }
  }, [selectedId, products]);

  const loadProducts = async () => {
    try {
      const res = await api.get('/products?limit=100');
      setProducts(res.data.data);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const generate = async (type) => {
    if (!selectedId) { toast.error('Please select a product'); return; }
    const key = type === 'generate-all' ? 'all' : type.replace('generate-', '');
    setGenerating({ ...generating, [key]: true });
    try {
      if (type === 'generate-all') {
        const res = await api.post('/ai/generate-all', { productId: selectedId });
        const data = res.data.data;
        
        const desc = data.description || '';
        const tags = (data.tags || []).join(', ');
        const caption = data.caption || '';

        setEditedDesc(desc);
        setEditedTags(tags);
        setEditedCaption(caption);
        
        // Sync saved values baseline since backend automatically saves to DB
        setSavedValues({
          description: desc,
          tags: tags,
          caption: caption
        });
        
        toast.success('All AI assets generated and saved to catalog!');
      } else {
        const endpoint = `/ai/${type}`;
        const res = await api.post(endpoint, { productId: selectedId });
        const data = res.data.data;
        
        if (type === 'generate-description') {
          const val = data.description || '';
          setEditedDesc(val);
          setSavedValues(prev => ({ ...prev, description: val }));
        }
        if (type === 'generate-tags') {
          const val = (data.tags || []).join(', ');
          setEditedTags(val);
          setSavedValues(prev => ({ ...prev, tags: val }));
        }
        if (type === 'generate-caption') {
          const val = data.caption || '';
          setEditedCaption(val);
          setSavedValues(prev => ({ ...prev, caption: val }));
        }
        
        toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} generated and saved successfully!`);
      }
      // Reload products catalog in background
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
      setGenerating({ ...generating, [key]: false });
    }
  };


  const saveContent = async (type) => {
    if (!selectedId) return;
    
    const payload = {};
    if (type === 'description' || type === 'all') {
      payload.aiDescription = editedDesc;
    }
    if (type === 'tags' || type === 'all') {
      payload.seoTags = editedTags.split(',').map(t => t.trim()).filter(t => t.length > 0);
    }
    if (type === 'caption' || type === 'all') {
      payload.marketingCaption = editedCaption;
    }

    setSaving(prev => ({ ...prev, [type]: true }));
    try {
      const res = await api.put(`/products/${selectedId}`, payload);
      const updatedProduct = res.data.data;
      
      toast.success(`${type === 'all' ? 'All catalog fields' : type.charAt(0).toUpperCase() + type.slice(1)} saved successfully!`);
      
      // Update saved values baseline
      if (type === 'description' || type === 'all') {
        setSavedValues(prev => ({ ...prev, description: updatedProduct.aiDescription || '' }));
      }
      if (type === 'tags' || type === 'all') {
        setSavedValues(prev => ({ ...prev, tags: (updatedProduct.seoTags || []).join(', ') }));
      }
      if (type === 'caption' || type === 'all') {
        setSavedValues(prev => ({ ...prev, caption: updatedProduct.marketingCaption || '' }));
      }
      
      // Reload products catalog in background
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update catalog product');
    } finally {
      setSaving(prev => ({ ...prev, [type]: false }));
    }
  };

  const hasChanges = (type) => {
    if (type === 'description') return editedDesc !== savedValues.description;
    if (type === 'tags') return editedTags !== savedValues.tags;
    if (type === 'caption') return editedCaption !== savedValues.caption;
    return editedDesc !== savedValues.description || editedTags !== savedValues.tags || editedCaption !== savedValues.caption;
  };

  const activeTagsList = editedTags.split(',').map(t => t.trim()).filter(t => t.length > 0);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>✨ AI Content Studio</h1>
          <p>Generate, edit, and instantly update AI descriptions, SEO tags, and social captions</p>
        </div>
      </div>

      <div className="page-body">
        {loading ? (
          <div className="loading-screen">
            <div className="spinner spinner-lg" />
            <p>Loading AI studio data...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
            
            {/* ─── LEFT COLUMN: PRODUCT SELECTOR & QUICK ACTIONS ─── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Product Selector Card */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label">Select Target Product</label>
                  <select
                    id="ai-product-select"
                    className="form-select"
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                  >
                    <option value="">Choose a product from catalog...</option>
                    {products.map(p => (
                      <option key={p._id} value={p._id}>{p.name} — ${p.price} ({p.category})</option>
                    ))}
                  </select>
                </div>

                {selectedProduct && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => generate('generate-all')}
                    disabled={generating.all || generating.description || generating.tags || generating.caption}
                    style={{
                      width: '100%', marginBottom: '16px',
                      background: 'var(--gradient-primary)', borderColor: 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                  >
                    {generating.all ? (
                      <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                    ) : (
                      <><HiOutlineSparkles /> ⚡ One-Click AI Catalog Update</>
                    )}
                  </button>
                )}


                {selectedProduct && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '16px', background: 'rgba(99,102,241,0.06)', borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(99,102,241,0.1)'
                  }}>
                    {selectedProduct.imageUrl ? (
                      <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="product-thumb-lg" style={{ objectFit: 'cover' }} />
                    ) : (
                      <div className="product-thumb-lg" style={{ background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>📦</div>
                    )}
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '1.05rem' }}>{selectedProduct.name}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>
                        {selectedProduct.category} · <strong style={{ color: 'var(--text-primary)' }}>${selectedProduct.price}</strong> · Stock: {selectedProduct.stock}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Content Engine Controls */}
              {selectedProduct && (
                <div className="glass-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HiOutlineSparkles style={{ color: 'var(--accent-primary)' }} /> AI Generation Deck
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                      id="generate-all-btn"
                      className="btn btn-primary btn-lg"
                      onClick={() => generate('generate-all')}
                      disabled={generating.all || generating.description || generating.tags || generating.caption}
                      style={{ width: '100%' }}
                    >
                      {generating.all ? (
                        <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                      ) : (
                        <><HiOutlineLightningBolt /> Generate All AI Assets</>
                      )}
                    </button>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginTop: '8px' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => generate('generate-description')}
                        disabled={generating.all || generating.description}
                      >
                        {generating.description ? <span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} /> : <HiOutlineSparkles style={{ color: '#6366f1' }} />}
                        Generate Description Draft
                      </button>

                      <button
                        className="btn btn-secondary"
                        onClick={() => generate('generate-tags')}
                        disabled={generating.all || generating.tags}
                      >
                        {generating.tags ? <span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} /> : <HiOutlineTag style={{ color: '#06b6d4' }} />}
                        Generate SEO Tags Draft
                      </button>

                      <button
                        className="btn btn-secondary"
                        onClick={() => generate('generate-caption')}
                        disabled={generating.all || generating.caption}
                      >
                        {generating.caption ? <span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} /> : <HiOutlineSpeakerphone style={{ color: '#10b981' }} />}
                        Generate Social Caption Draft
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Standard Catalog Info Detail */}
              {selectedProduct && selectedProduct.description && (
                <div className="glass-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                    Original Catalog Description
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                    {selectedProduct.description}
                  </p>
                </div>
              )}
            </div>

            {/* ─── RIGHT COLUMN: INTERACTIVE EDITOR WORKSPACE ─── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {selectedProduct ? (
                <>
                  {/* 1. Description Box */}
                  <div className="glass-card" style={{ padding: '24px', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <label className="form-label" style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        📝 AI-Generated Product Description
                      </label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {savedValues.description && !hasChanges('description') && (
                          <span className="badge badge-active" style={{ gap: '4px' }}><HiOutlineCheck /> Saved</span>
                        )}
                        {hasChanges('description') && (
                          <span className="badge badge-draft">Draft (Unsaved)</span>
                        )}
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => saveContent('description')}
                          disabled={saving.description || !hasChanges('description')}
                          style={{ borderColor: hasChanges('description') ? 'var(--accent-primary)' : 'var(--border-color)' }}
                        >
                          {saving.description ? (
                            <span className="spinner" style={{ width: '12px', height: '12px', borderWidth: '2px' }} />
                          ) : (
                            <><HiOutlineSave /> Save</>
                          )}
                        </button>
                      </div>
                    </div>

                    <textarea
                      className="form-textarea"
                      style={{ minHeight: '120px', fontSize: '0.875rem', lineHeight: '1.6' }}
                      value={editedDesc}
                      onChange={(e) => setEditedDesc(e.target.value)}
                      placeholder="Click generate to create an AI-optimized product description or write your own..."
                    />

                    {savedValues.description && hasChanges('description') && (
                      <details style={{ marginTop: '12px', fontSize: '0.8rem' }}>
                        <summary style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: '600' }}>
                          <HiOutlineEye style={{ verticalAlign: 'middle', marginRight: '4px' }} /> View Saved Value in Catalog
                        </summary>
                        <div style={{
                          marginTop: '8px', padding: '10px', background: 'rgba(10,14,26,0.3)',
                          borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)',
                          color: 'var(--text-muted)', lineHeight: '1.5'
                        }}>
                          {savedValues.description}
                        </div>
                      </details>
                    )}
                  </div>

                  {/* 2. SEO Tags Box */}
                  <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <label className="form-label" style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        🏷️ SEO Tags (Comma Separated)
                      </label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {savedValues.tags && !hasChanges('tags') && (
                          <span className="badge badge-active" style={{ gap: '4px' }}><HiOutlineCheck /> Saved</span>
                        )}
                        {hasChanges('tags') && (
                          <span className="badge badge-draft">Draft (Unsaved)</span>
                        )}
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => saveContent('tags')}
                          disabled={saving.tags || !hasChanges('tags')}
                          style={{ borderColor: hasChanges('tags') ? 'var(--accent-primary)' : 'var(--border-color)' }}
                        >
                          {saving.tags ? (
                            <span className="spinner" style={{ width: '12px', height: '12px', borderWidth: '2px' }} />
                          ) : (
                            <><HiOutlineSave /> Save</>
                          )}
                        </button>
                      </div>
                    </div>

                    <input
                      type="text"
                      className="form-input"
                      value={editedTags}
                      onChange={(e) => setEditedTags(e.target.value)}
                      placeholder="e-commerce, gadgets, premium (separated by commas)..."
                    />

                    {activeTagsList.length > 0 && (
                      <div style={{ marginTop: '12px' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '500' }}>Active Tag Badges Preview:</div>
                        <div className="ai-tags-list">
                          {activeTagsList.map((tag, i) => (
                            <span key={i} className="ai-tag">{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Marketing Caption Box */}
                  <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <label className="form-label" style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        📢 Social Media Marketing Caption
                      </label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {savedValues.caption && !hasChanges('caption') && (
                          <span className="badge badge-active" style={{ gap: '4px' }}><HiOutlineCheck /> Saved</span>
                        )}
                        {hasChanges('caption') && (
                          <span className="badge badge-draft">Draft (Unsaved)</span>
                        )}
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => saveContent('caption')}
                          disabled={saving.caption || !hasChanges('caption')}
                          style={{ borderColor: hasChanges('caption') ? 'var(--accent-primary)' : 'var(--border-color)' }}
                        >
                          {saving.caption ? (
                            <span className="spinner" style={{ width: '12px', height: '12px', borderWidth: '2px' }} />
                          ) : (
                            <><HiOutlineSave /> Save</>
                          )}
                        </button>
                      </div>
                    </div>

                    <textarea
                      className="form-textarea"
                      style={{ minHeight: '100px', fontSize: '0.875rem', lineHeight: '1.6' }}
                      value={editedCaption}
                      onChange={(e) => setEditedCaption(e.target.value)}
                      placeholder="Catchy social media copy with hashtags..."
                    />

                    {/* Social Media Post Mockup Card */}
                    {editedCaption && (
                      <div style={{
                        marginTop: '16px',
                        padding: '16px',
                        background: 'rgba(10,14,26,0.3)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-lg)',
                        fontSize: '0.85rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: 'var(--gradient-primary)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontWeight: '800',
                            color: 'white', fontSize: '0.8rem'
                          }}>
                            {selectedProduct.category?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>Your E-Commerce Storefront</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Sponsored · Social Media Feed Mockup</div>
                          </div>
                        </div>
                        {selectedProduct.imageUrl && (
                          <img 
                            src={selectedProduct.imageUrl} 
                            alt="" 
                            style={{ 
                              width: '100%', maxHeight: '180px', objectFit: 'cover', 
                              borderRadius: 'var(--radius-md)', marginBottom: '10px',
                              border: '1px solid rgba(255,255,255,0.05)'
                            }} 
                          />
                        )}
                        <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)', lineHeight: '1.5', fontSize: '0.8rem' }}>
                          {editedCaption}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bulk Update Global Button */}
                  <button
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', background: 'var(--gradient-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                    onClick={() => saveContent('all')}
                    disabled={saving.all || !hasChanges()}
                  >
                    {saving.all ? (
                      <span className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                    ) : (
                      <>
                        <HiOutlineCheck style={{ fontSize: '1.2rem' }} />
                        Save All Drafts to Product Catalog
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="glass-card empty-state">
                  <div className="icon">🤖</div>
                  <h3>Select a Catalog Product</h3>
                  <p>Choose a product from the list in the left-hand column to access the AI workspace and edit generated descriptions, tags, and captions.</p>
                </div>
              )}

            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default AIContent;
