import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineUser, HiOutlineMail, HiOutlineLockClosed, HiOutlineOfficeBuilding } from 'react-icons/hi';

function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', storeName: '' });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password, form.storeName);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'name', label: 'Full Name', type: 'text', icon: HiOutlineUser, placeholder: 'John Doe', required: true },
    { name: 'email', label: 'Email Address', type: 'email', icon: HiOutlineMail, placeholder: 'you@example.com', required: true },
    { name: 'password', label: 'Password', type: 'password', icon: HiOutlineLockClosed, placeholder: '••••••••', required: true },
    { name: 'storeName', label: 'Store Name', type: 'text', icon: HiOutlineOfficeBuilding, placeholder: 'My Awesome Store', required: false },
  ];

  return (
    <div className="auth-page">
      <div className="auth-card glass-card animate-slide-up">
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <div style={{
            width: '56px', height: '56px', background: 'var(--gradient-primary)',
            borderRadius: 'var(--radius-lg)', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
            marginBottom: '16px', boxShadow: '0 8px 25px rgba(99,102,241,0.3)'
          }}>🚀</div>
        </div>
        <h1 style={{ textAlign: 'center' }}>Create Account</h1>
        <p className="subtitle" style={{ textAlign: 'center' }}>Start managing your store with AI</p>

        <form onSubmit={handleSubmit}>
          {fields.map(({ name, label, type, icon: Icon, placeholder, required }) => (
            <div className="form-group" key={name}>
              <label className="form-label">{label} {required && <span style={{ color: 'var(--accent-red)' }}>*</span>}</label>
              <div style={{ position: 'relative' }}>
                <Icon style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id={`signup-${name}`}
                  type={type}
                  name={name}
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder={placeholder}
                  value={form[name]}
                  onChange={handleChange}
                />
              </div>
            </div>
          ))}
          <button id="signup-submit" type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
            {loading ? <span className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} /> : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
