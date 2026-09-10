import React, { useState } from 'react';
import { Sprout, LogIn, Globe, AlertCircle, CheckCircle2, UserPlus } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { loginUser, registerUser } from '../services/api';

const DEFAULT_USERS = [
  {
    name: 'Ramesh Patel',
    email: 'farmer@agricrop.ai',
    password: 'farmer123',
    location: 'D. Yerravaram, East Godavari',
    role: 'Registered Farmer'
  },
  {
    name: 'AgriCrop Admin',
    email: 'admin@agricrop.ai',
    password: 'admin123',
    location: 'East Godavari District',
    role: 'Platform Administrator'
  }
];

export default function LoginPage({ onLogin }) {
  const { currentLang, changeLanguage, t, languages } = useLanguage();
  const [isSignUp, setIsSignUp] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const getRegisteredUsers = () => {
    try {
      const stored = localStorage.getItem('agricrop_registered_users');
      if (stored) return JSON.parse(stored);
    } catch {
      // Fallback
    }
    localStorage.setItem('agricrop_registered_users', JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  };

  const saveRegisteredUsers = (users) => {
    localStorage.setItem('agricrop_registered_users', JSON.stringify(users));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    const email = formData.email.trim().toLowerCase();
    const password = formData.password.trim();

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      setLoading(false);
      return;
    }

    if (isSignUp) {
      // --- REGISTRATION FLOW ---
      if (!formData.name.trim()) {
        setErrorMessage('Full Name is required for registration.');
        setLoading(false);
        return;
      }

      if (!email.includes('@') || !email.includes('.')) {
        setErrorMessage('Please enter a valid email address.');
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        setLoading(false);
        return;
      }

      try {
        const apiRes = await registerUser({
          name: formData.name.trim(),
          email,
          password,
          location: 'D. Yerravaram, East Godavari'
        });
        setSuccessMessage('Registration successful! Signing you in...');
        setTimeout(() => onLogin(apiRes.user), 1000);
      } catch (err) {
        const currentUsers = getRegisteredUsers();
        const existing = currentUsers.find(u => u.email.toLowerCase() === email);
        if (existing) {
          setErrorMessage('This email is already registered. Please sign in instead.');
          setLoading(false);
          return;
        }

        const newUser = {
          name: formData.name.trim(),
          email,
          password,
          location: 'D. Yerravaram, East Godavari',
          role: 'Registered Farmer'
        };

        currentUsers.push(newUser);
        saveRegisteredUsers(currentUsers);
        setSuccessMessage('Account registered successfully! Signing you in...');
        setTimeout(() => {
          onLogin({ name: newUser.name, email: newUser.email, location: newUser.location, role: newUser.role });
        }, 1000);
      }
    } else {
      // --- SIGN IN FLOW ---
      try {
        const apiRes = await loginUser({ email, password });
        onLogin(apiRes.user);
      } catch (err) {
        const currentUsers = getRegisteredUsers();
        const matchedUser = currentUsers.find(u => u.email.toLowerCase() === email && u.password === password);

        if (matchedUser) {
          onLogin({ name: matchedUser.name, email: matchedUser.email, location: matchedUser.location || 'D. Yerravaram, East Godavari', role: matchedUser.role });
        } else {
          setErrorMessage('Invalid email or password. Access denied. Please check your credentials or create a new account.');
          setLoading(false);
        }
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#0b0f19',
      backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 60%), radial-gradient(circle at 15% 85%, rgba(6, 182, 212, 0.1) 0%, transparent 50%), linear-gradient(135deg, #0b0f19 0%, #111827 50%, #0f172a 100%)',
      backgroundAttachment: 'fixed',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      justify: 'space-between',
      padding: '1.25rem'
    }}>
      {/* Top Header */}
      <header style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #06b6d4, #10b981)',
            padding: '0.55rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            boxShadow: '0 4px 15px rgba(6, 182, 212, 0.35)'
          }}>
            <Sprout size={24} color="#ffffff" strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff', lineHeight: 1 }}>
              AgriCrop AI Engine
            </h1>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>Precision Water Intelligence</p>
          </div>
        </div>

        {/* Multi Language Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(30, 41, 59, 0.8)', padding: '4px 10px', borderRadius: '10px', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
          <Globe size={15} color="#38bdf8" />
          <select
            value={currentLang}
            onChange={(e) => changeLanguage(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {languages.map(l => (
              <option key={l.code} value={l.code} style={{ background: '#0f172a', color: '#ffffff' }}>
                {l.flag} {l.nativeName} ({l.name})
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Center Modal Container */}
      <div className="glass-panel" style={{ maxWidth: '440px', width: '100%', margin: 'auto', padding: '2rem', boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 35px rgba(6, 182, 212, 0.25)', border: '1.5px solid rgba(6, 182, 212, 0.35)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '0.6rem', borderRadius: '12px', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
            {isSignUp ? <UserPlus size={22} /> : <LogIn size={22} />}
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', textAlign: 'center' }}>
            {isSignUp ? 'Farmer Registration' : 'Farmer Sign In'}
          </h2>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#f87171',
            borderRadius: '10px',
            padding: '0.75rem 0.9rem',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert Box */}
        {successMessage && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#34d399',
            borderRadius: '10px',
            padding: '0.75rem 0.9rem',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle2 size={16} color="#34d399" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isSignUp && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Ramesh Patel" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                required 
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="e.g. farmer@agricrop.ai" 
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="••••••••" 
              value={formData.password} 
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.92rem', marginTop: '0.25rem' }}
          >
            {loading ? 'Validating...' : (isSignUp ? 'Create Farmer Account' : 'Sign In to Dashboard')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(99, 102, 241, 0.2)', fontSize: '0.82rem' }}>
          <button 
            type="button" 
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMessage('');
              setSuccessMessage('');
            }} 
            style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isSignUp ? 'Already registered? Sign In' : 'New Farmer? Create Account'}
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', padding: '0.75rem 0' }}>
        AgriCrop AI Engine • Precision Water Intelligence Platform
      </footer>
    </div>
  );
}