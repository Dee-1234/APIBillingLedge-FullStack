import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
                navigate('/dashboard');
            } else {
                setError(data.message || 'Invalid credentials. Please try again.');
            }
        } catch {
            setError("Connection failed. Please ensure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <style>{`
                .auth-wrapper { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #020617; font-family: 'Inter', sans-serif; color: white; padding: 20px; }
                .auth-card { background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(12px); border: 1px solid #1e293b; width: 100%; max-width: 420px; padding: 45px; border-radius: 28px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); }
                .input-group { margin-bottom: 24px; }
                .input-group label { display: block; font-size: 11px; font-weight: 800; color: #64748b; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
                .input-wrapper { position: relative; display: flex; align-items: center; }
                .input-wrapper i { position: absolute; left: 16px; color: #475569; }
                .input-field { width: 100%; background: #020617; border: 1px solid #1e293b; padding: 14px 15px 14px 48px; border-radius: 14px; color: white; transition: all 0.3s ease; font-size: 15px; }
                .input-field:focus { border-color: #3b82f6; outline: none; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15); background: #0f172a; }
                
                .login-btn { width: 100%; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 16px; border-radius: 14px; border: none; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.3s; margin-top: 10px; font-size: 16px; box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.4); }
                .login-btn:hover { transform: translateY(-2px); box-shadow: 0 15px 25px -5px rgba(37, 99, 235, 0.5); }
                .login-btn:active { transform: translateY(0); }
                
                .error-box { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; padding: 12px; border-radius: 12px; font-size: 13px; margin-bottom: 25px; display: flex; align-items: center; gap: 10px; }
            `}</style>

            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="auth-card"
            >
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ width: '56px', height: '56px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '16px', display: 'inline-flex', alignItems: 'center', justifyCenter: 'center', marginBottom: '20px', color: '#3b82f6' }}>
                        <LogIn size={28} style={{marginLeft: '4px'}} />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '30px', fontWeight: '800', letterSpacing: '-0.02em' }}>Welcome Back</h2>
                    <p style={{ color: '#64748b', fontSize: '15px', marginTop: '8px' }}>Log in to manage your API keys</p>
                </div>

                {error && (
                    <div className="error-box">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label>Email Address</label>
                        <div className="input-wrapper">
                            <i><Mail size={19}/></i>
                            <input 
                                type="email" 
                                required 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                className="input-field" 
                                placeholder="name@company.com" 
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label>Password</label>
                            <span style={{ fontSize: '11px', color: '#3b82f6', cursor: 'pointer', fontWeight: '600', marginBottom: '8px' }}>Forgot?</span>
                        </div>
                        <div className="input-wrapper">
                            <i><Lock size={19}/></i>
                            <input 
                                type="password" 
                                required 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                className="input-field" 
                                placeholder="••••••••" 
                            />
                        </div>
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? (
                            <div style={{ width: '20px', height: '20px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        ) : (
                            <>Sign In <ArrowRight size={19}/></>
                        )}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '35px', paddingTop: '25px', borderTop: '1px solid #1e293b' }}>
                    <p style={{ color: '#64748b', fontSize: '14px' }}>
                        Don't have an account? <Link to="/signup" style={{ color: '#3b82f6', fontWeight: '700', textDecoration: 'none', marginLeft: '5px' }}>Register</Link>
                    </p>
                </div>
            </motion.div>
            
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Login;