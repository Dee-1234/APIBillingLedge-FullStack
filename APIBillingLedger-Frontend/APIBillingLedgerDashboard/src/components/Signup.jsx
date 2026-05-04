import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Zap, Shield, Crown, ArrowRight } from 'lucide-react';

const Signup = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ 
        username: '', 
        email: '', 
        password: '', 
        planType: 'FREE' 
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Using your current logic
        try {
            const response = await fetch('http://localhost:8080/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                navigate('/login');
            } else {
                const errorData = await response.json();
                alert(`Signup failed: ${errorData.message || 'Check your details'}`);
            }
        } catch (error) {
            console.error("Network error:", error);
        } finally {
            setLoading(false);
        }
    };

    const plans = [
        { id: 'FREE', name: 'Free', price: '$0.00', icon: <Zap size={18}/>, color: '#94a3b8' },
        { id: 'PRO', name: 'Pro', price: '$0.01', icon: <Shield size={18}/>, color: '#10b981' },
        { id: 'ENTERPRISE', name: 'Enterprise', price: '$0.005', icon: <Crown size={18}/>, color: '#2563eb' }
    ];

    return (
        <div className="auth-wrapper">
            <style>{`
                .auth-wrapper { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #020617; font-family: 'Inter', sans-serif; color: white; padding: 20px; }
                .auth-card { background: #0f172a; border: 1px solid #1e293b; width: 100%; max-width: 500px; padding: 40px; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
                .input-group { margin-bottom: 20px; position: relative; }
                .input-group label { display: block; font-size: 12px; font-weight: bold; color: #94a3b8; margin-bottom: 8px; text-transform: uppercase; }
                .input-wrapper { position: relative; display: flex; align-items: center; }
                .input-wrapper i { position: absolute; left: 15px; color: #475569; }
                .input-field { width: 100%; background: #020617; border: 1px solid #1e293b; padding: 12px 15px 12px 45px; border-radius: 12px; color: white; transition: 0.3s; }
                .input-field:focus { border-color: #2563eb; outline: none; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }
                
                .plan-selector { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 25px; }
                .plan-card { padding: 15px 10px; border: 1px solid #1e293b; border-radius: 12px; text-align: center; cursor: pointer; transition: 0.2s; background: #020617; }
                .plan-card.active { border-color: #2563eb; background: rgba(37, 99, 235, 0.1); }
                .plan-card h4 { margin: 5px 0; font-size: 14px; }
                .plan-card p { font-size: 10px; color: #94a3b8; margin: 0; }
                
                .submit-btn { width: 100%; background: #2563eb; color: white; padding: 15px; border-radius: 12px; border: none; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.3s; }
                .submit-btn:hover { background: #1d4ed8; transform: translateY(-2px); }
                .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
            `}</style>

            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="auth-card"
            >
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ width: '60px', height: '60px', background: '#2563eb', borderRadius: '15px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)' }}>
                        <Zap color="white" size={30} fill="white" />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '800' }}>Get Started</h2>
                    <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '5px' }}>Setup your API Billing Ledger account</p>
                </div>

                <form onSubmit={handleSignup}>
                    <div className="input-group">
                        <label>Username</label>
                        <div className="input-wrapper">
                            <i><User size={18}/></i>
                            <input name="username" type="text" required value={formData.username} onChange={handleChange} className="input-field" placeholder="username" />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Email Address</label>
                        <div className="input-wrapper">
                            <i><Mail size={18}/></i>
                            <input name="email" type="email" required value={formData.email} onChange={handleChange} className="input-field" placeholder="developer@example.com" />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <div className="input-wrapper">
                            <i><Lock size={18}/></i>
                            <input name="password" type="password" required value={formData.password} onChange={handleChange} className="input-field" placeholder="••••••••" />
                        </div>
                    </div>

                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Select your tier</label>
                    <div className="plan-selector">
                        {plans.map(plan => (
                            <div 
                                key={plan.id} 
                                className={`plan-card ${formData.planType === plan.id ? 'active' : ''}`}
                                onClick={() => setFormData({...formData, planType: plan.id})}
                            >
                                <div style={{ color: formData.planType === plan.id ? '#2563eb' : plan.color }}>{plan.icon}</div>
                                <h4>{plan.name}</h4>
                                <p>{plan.price}/req</p>
                            </div>
                        ))}
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? "Creating Account..." : (
                            <>Create Account <ArrowRight size={18}/></>
                        )}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '25px', color: '#94a3b8', fontSize: '14px' }}>
                    Already tracking usage? <Link to="/login" style={{ color: '#2563eb', fontWeight: 'bold', textDecoration: 'none' }}>Log in</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Signup;