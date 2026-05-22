import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  HiOutlineSearch, 
  HiOutlineShoppingBag, 
  HiOutlineTrash, 
  HiOutlinePlus, 
  HiOutlineMinus, 
  HiOutlineCheck, 
  HiOutlineSparkles,
  HiOutlineTag,
  HiOutlineSpeakerphone,
  HiOutlineX
} from 'react-icons/hi';

function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  
  // Shopping Cart State
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutChannel, setCheckoutChannel] = useState('online');
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const categories = ['Electronics', 'Clothing', 'Home & Kitchen', 'Sports', 'Beauty', 'Books', 'Toys', 'Food & Beverage', 'Other'];

  useEffect(() => {
    loadProducts();
  }, [search, category]);

  const loadProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      // Fetch only active/draft products that have stock (or all for demonstration)
      const res = await api.get(`/products?${params.toString()}`);
      setProducts(res.data.data);
    } catch (err) {
      toast.error('Failed to load shop products');
    } finally {
      setLoading(false);
    }
  };

  // Cart operations
  const addToCart = (product) => {
    if (product.stock <= 0) {
      toast.error('This item is currently out of stock!');
      return;
    }

    const existingItem = cart.find(item => item.product._id === product._id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error(`Cannot add more. Only ${product.stock} units available in inventory!`);
        return;
      }
      setCart(cart.map(item => 
        item.product._id === product._id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    
    toast.success(`${product.name} added to shopping cart!`);
  };

  const updateQuantity = (productId, change) => {
    const item = cart.find(item => item.product._id === productId);
    if (!item) return;

    const newQty = item.quantity + change;
    
    if (newQty <= 0) {
      setCart(cart.filter(item => item.product._id !== productId));
      toast.success('Product removed from cart');
      return;
    }

    if (newQty > item.product.stock) {
      toast.error(`Only ${item.product.stock} units available in inventory!`);
      return;
    }

    setCart(cart.map(item => 
      item.product._id === productId 
        ? { ...item, quantity: newQty }
        : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product._id !== productId));
    toast.success('Product removed from cart');
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;
    setOrderSubmitting(true);
    
    try {
      const payload = {
        items: cart.map(item => ({
          productId: item.product._id,
          quantity: item.quantity
        })),
        channel: checkoutChannel
      };

      await api.post('/sales/order', payload);
      
      setOrderSuccess(true);
      setCart([]);
      setIsCartOpen(false);
      loadProducts(); // Refresh products stock
      toast.success('Checkout completed! Inventory updated and sales dashboard updated.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Order placement failed. Check inventory levels.');
    } finally {
      setOrderSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ position: 'relative', minHeight: '80vh' }}>
      
      {/* ─── PAGE HEADER ─── */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>🛍️ Customer Storefront</h1>
          <p>Browse products, view rich AI copy highlights, and test the checkout inventory integration</p>
        </div>
        
        {/* Floating Cart Button */}
        <button 
          id="cart-toggle-btn"
          className="btn btn-primary"
          onClick={() => setIsCartOpen(true)}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'var(--gradient-primary)',
            padding: '12px 20px',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          <HiOutlineShoppingBag style={{ fontSize: '1.3rem' }} />
          <span>View Cart</span>
          {getCartItemsCount() > 0 && (
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: 'var(--accent-red)',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: '800',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)',
              border: '2px solid var(--bg-secondary)'
            }}>
              {getCartItemsCount()}
            </span>
          )}
        </button>
      </div>

      <div className="page-body">
        
        {/* ─── FILTERS ─── */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ flex: '1', minWidth: '240px' }}>
            <HiOutlineSearch className="icon" />
            <input
              id="shop-search"
              className="form-input"
              style={{ paddingLeft: '40px' }}
              placeholder="Search products in store..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', maxWidth: '100%' }}>
            <button 
              className={`btn btn-sm ${category === '' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCategory('')}
            >
              All
            </button>
            {categories.map(c => (
              <button 
                key={c}
                className={`btn btn-sm ${category === c ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* ─── PRODUCTS GRID ─── */}
        {loading ? (
          <div className="loading-screen">
            <div className="spinner spinner-lg" />
            <p>Loading storefront products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="glass-card empty-state" style={{ padding: '60px' }}>
            <div className="icon">🛍️</div>
            <h3>No products available</h3>
            <p>Go to the Products management tab to create your store catalog first!</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {products.map(product => {
              const hasAI = !!product.aiDescription;
              const isOutOfStock = product.stock <= 0;
              
              return (
                <div 
                  key={product._id} 
                  className="glass-card card-hover" 
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    position: 'relative',
                    borderColor: hasAI ? 'rgba(99, 102, 241, 0.15)' : 'var(--border-color)',
                    background: isOutOfStock ? 'rgba(30, 41, 59, 0.3)' : 'var(--bg-secondary)'
                  }}
                >
                  
                  {/* Category overlay */}
                  <span className="badge badge-primary" style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 10 }}>
                    {product.category}
                  </span>

                  {/* Stock Status Badge */}
                  <span style={{ 
                    position: 'absolute', 
                    top: '12px', 
                    right: '12px', 
                    zIndex: 10,
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: isOutOfStock 
                      ? 'rgba(239, 68, 68, 0.15)' 
                      : (product.stock <= 10 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)'),
                    color: isOutOfStock 
                      ? 'var(--accent-red)' 
                      : (product.stock <= 10 ? 'var(--accent-amber)' : 'var(--accent-green)'),
                    border: '1px solid currentColor'
                  }}>
                    {isOutOfStock ? 'Out of Stock' : (product.stock <= 10 ? `Low Stock (${product.stock})` : `In Stock (${product.stock})`)}
                  </span>

                  {/* Product Image */}
                  <div style={{ height: '180px', width: '100%', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ fontSize: '3rem' }}>📦</div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, gap: '14px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {product.name}
                      </h3>
                      <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'baseline' }}>
                        ${product.price.toFixed(2)}
                      </div>
                    </div>

                    {/* Standard original description */}
                    {product.description && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>
                        {product.description}
                      </p>
                    )}

                    {/* ✨ Highlighted AI description */}
                    <div style={{
                      padding: '12px',
                      background: hasAI ? 'rgba(99, 102, 241, 0.04)' : 'rgba(255,255,255,0.01)',
                      border: hasAI ? '1px dashed rgba(99, 102, 241, 0.3)' : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8rem',
                      lineHeight: '1.6'
                    }}>
                      <div style={{ fontWeight: '700', fontSize: '0.75rem', color: hasAI ? 'var(--accent-primary)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        <HiOutlineSparkles /> {hasAI ? 'AI Generated Description' : 'AI Description Pending'}
                      </div>
                      <div style={{ color: hasAI ? 'var(--text-secondary)' : 'var(--text-muted)', fontStyle: hasAI ? 'normal' : 'italic' }}>
                        {hasAI ? product.aiDescription : 'Standard description only. AI features not yet run.'}
                      </div>
                    </div>

                    {/* Marketing caption quote bubble */}
                    {product.marketingCaption && (
                      <div style={{
                        position: 'relative',
                        padding: '10px 12px',
                        background: 'rgba(16, 185, 129, 0.04)',
                        border: '1px solid rgba(16, 185, 129, 0.15)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)',
                        fontStyle: 'italic',
                        lineHeight: '1.4'
                      }}>
                        <div style={{ fontWeight: '700', fontStyle: 'normal', fontSize: '0.7rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                          <HiOutlineSpeakerphone /> Social Ad Pitch:
                        </div>
                        "{product.marketingCaption}"
                      </div>
                    )}

                    {/* SEO Tag badges */}
                    {product.seoTags && product.seoTags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {product.seoTags.slice(0, 4).map((tag, i) => (
                          <span key={i} className="ai-tag" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Add to Cart button */}
                    <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                      <button
                        className="btn btn-primary"
                        onClick={() => addToCart(product)}
                        disabled={isOutOfStock}
                        style={{
                          width: '100%',
                          background: isOutOfStock 
                            ? 'var(--bg-input)' 
                            : 'var(--gradient-primary)',
                          borderColor: 'transparent'
                        }}
                      >
                        {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── SLIDE-OUT CART DRAWER ─── */}
      {isCartOpen && (
        <div 
          className="modal-overlay animate-fade-in" 
          onClick={() => setIsCartOpen(false)}
          style={{ zIndex: 90 }}
        >
          <div 
            className="modal-content animate-slide-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              height: '100vh',
              width: '100%',
              maxWidth: '440px',
              borderRadius: 0,
              borderLeft: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              padding: 0
            }}
          >
            
            {/* Drawer Header */}
            <div className="modal-header" style={{ padding: '20px 24px' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HiOutlineShoppingBag /> Shopping Cart
              </h2>
              <button 
                className="btn btn-ghost btn-icon"
                onClick={() => setIsCartOpen(false)}
              >
                <HiOutlineX />
              </button>
            </div>

            {/* Drawer Body (Cart Items List) */}
            <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cart.length === 0 ? (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  height: '60%', color: 'var(--text-muted)', textAlign: 'center', gap: '12px'
                }}>
                  <div style={{ fontSize: '3rem' }}>🛒</div>
                  <div style={{ fontWeight: '700' }}>Your cart is empty</div>
                  <p style={{ fontSize: '0.8rem', maxWidth: '240px' }}>Browse the catalog and add products to start shopping.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div 
                    key={item.product._id}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      padding: '12px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      alignItems: 'center'
                    }}
                  >
                    {/* Item Thumbnail */}
                    <div style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {item.product.imageUrl ? (
                        <img src={item.product.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span>📦</span>
                      )}
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: '1', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.product.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        ${item.product.price.toFixed(2)} each
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-input)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <button 
                        className="btn btn-ghost btn-icon"
                        style={{ width: '22px', height: '22px', minWidth: '22px', padding: 0 }}
                        onClick={() => updateQuantity(item.product._id, -1)}
                      >
                        <HiOutlineMinus style={{ fontSize: '0.75rem' }} />
                      </button>
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', minWidth: '16px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button 
                        className="btn btn-ghost btn-icon"
                        style={{ width: '22px', height: '22px', minWidth: '22px', padding: 0 }}
                        onClick={() => updateQuantity(item.product._id, 1)}
                      >
                        <HiOutlinePlus style={{ fontSize: '0.75rem' }} />
                      </button>
                    </div>

                    {/* Delete Item */}
                    <button 
                      className="btn btn-ghost btn-icon"
                      style={{ color: 'var(--accent-red)', padding: '6px' }}
                      onClick={() => removeFromCart(item.product._id)}
                    >
                      <HiOutlineTrash />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer (Subtotal & Checkout Actions) */}
            {cart.length > 0 && (
              <div 
                className="modal-footer"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  padding: '24px',
                  background: 'rgba(10,14,26,0.6)',
                  borderTop: '1px solid var(--border-color)'
                }}
              >
                {/* Checkout Channel */}
                <div className="form-group" style={{ width: '100%' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '6px' }}>Checkout Channel</label>
                  <select 
                    className="form-select"
                    style={{ fontSize: '0.85rem' }}
                    value={checkoutChannel}
                    onChange={(e) => setCheckoutChannel(e.target.value)}
                  >
                    <option value="online">💻 Online Storefront</option>
                    <option value="in-store">🏪 Physical In-Store</option>
                    <option value="marketplace">🌍 Social Marketplace</option>
                  </select>
                </div>

                {/* Subtotals */}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Items Total ({getCartItemsCount()})</span>
                    <span>${getCartTotal().toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Estimated Sales Tax (8%)</span>
                    <span>${(getCartTotal() * 0.08).toFixed(2)}</span>
                  </div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', 
                    fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)',
                    borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '4px'
                  }}>
                    <span>Order Total</span>
                    <span>${(getCartTotal() * 1.08).toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  id="checkout-btn"
                  className="btn btn-primary btn-lg"
                  onClick={placeOrder}
                  disabled={orderSubmitting}
                  style={{
                    width: '100%',
                    background: 'var(--gradient-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {orderSubmitting ? (
                    <span className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                  ) : (
                    <>🚀 Place Order & Deduct Inventory</>
                  )}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ─── ORDER SUCCESS OVERLAY ─── */}
      {orderSuccess && (
        <div 
          className="modal-overlay animate-fade-in"
          style={{
            zIndex: 100,
            background: 'rgba(10, 14, 26, 0.9)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <div 
            className="modal-content animate-slide-up"
            style={{
              maxWidth: '460px',
              padding: '40px',
              textAlign: 'center',
              background: 'var(--bg-secondary)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              boxShadow: '0 0 40px rgba(16, 185, 129, 0.1)'
            }}
          >
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--accent-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              margin: '0 auto 24px'
            }}>
              <HiOutlineCheck />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-primary)' }}>
              Order Placed Successfully!
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
              Your order transaction has been recorded. The product inventory stock levels were updated in the database, and sales metrics were synchronized to the admin dashboard in real-time.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => setOrderSuccess(false)}
              >
                Continue Shopping
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setOrderSuccess(false);
                  // We can't use useNavigate directly since we are not passing it down but we can just use normal navigation link or go to dashboard
                  window.location.href = '/';
                }}
                style={{ background: 'var(--gradient-primary)' }}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Shop;
