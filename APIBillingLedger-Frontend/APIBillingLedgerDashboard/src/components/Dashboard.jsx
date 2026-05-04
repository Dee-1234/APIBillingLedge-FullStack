import { useState, useEffect } from 'react';
import { 
  User, Clock, CreditCard, FileText, Trash2, Sun, Moon, 
  Home, Copy, Check, Lock, Receipt, LogOut, CheckCircle2, Download 
} from 'lucide-react';

const Dashboard = () => {
  const [currentUser] = useState(() => localStorage.getItem('username') || "");

  const [apiKey, setApiKey] = useState(() => {
    const user = localStorage.getItem('username');
    return user ? (localStorage.getItem(`${user}_saved_api_key`) || "") : "";
  });

  const [copyCount, setCopyCount] = useState(() => {
    const user = localStorage.getItem('username');
    return user ? (parseInt(localStorage.getItem(`${user}_api_usage`)) || 0) : 0;
  });

  const [usageHistory, setUsageHistory] = useState(() => {
    const user = localStorage.getItem('username');
    const saved = user ? localStorage.getItem(`${user}_usage_log`) : null;
    return saved ? JSON.parse(saved) : [];
  });

  const [paymentHistory, setPaymentHistory] = useState(() => {
    const user = localStorage.getItem('username');
    const saved = user ? localStorage.getItem(`${user}_payment_log`) : null;
    return saved ? JSON.parse(saved) : [];
  });

  const [successToast, setSuccessToast] = useState(() => {
    const msg = localStorage.getItem('auth_success_msg');
    return msg ? { show: true, message: msg } : { show: false, message: "" };
  });

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [copied, setCopied] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);

  const LIMIT = 10;
  const RATE_PER_COPY = 0.50;

  
  useEffect(() => {
    if (!currentUser) {
      window.location.href = "/";
      return;
    }

    // Only handle side effects (removing from storage and timers) here
    if (successToast.show) {
      localStorage.removeItem('auth_success_msg');
      const timer = setTimeout(() => {
        setSuccessToast({ show: false, message: "" });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [currentUser, successToast.show]);

  
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${currentUser}_api_usage`, copyCount);
      localStorage.setItem(`${currentUser}_usage_log`, JSON.stringify(usageHistory));
      localStorage.setItem(`${currentUser}_payment_log`, JSON.stringify(paymentHistory));
      localStorage.setItem(`${currentUser}_saved_api_key`, apiKey);
    }
  }, [copyCount, usageHistory, paymentHistory, apiKey, currentUser]);


  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = "/"; 
  };

  const generateKey = () => {
    const newKey = `sk_live_${Math.random().toString(36).substr(2, 16)}`;
    setApiKey(newKey);
  };

  const handleCopy = () => {
    if (copyCount >= LIMIT) {
      setShowPayModal(true);
      return;
    }
    if (!apiKey) return;

    navigator.clipboard.writeText(apiKey);
    const timestamp = new Date().toLocaleString();
    
    setCopyCount(prev => prev + 1);
    setUsageHistory(prev => [
      { id: Date.now(), time: timestamp, key: apiKey.substring(0, 12) + "..." }, 
      ...prev
    ]);
    
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePayment = () => {
    const amount = (copyCount * RATE_PER_COPY).toFixed(2);
    const newPayment = {
      id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString(),
      amount: amount,
      status: 'Paid',
      usageCount: copyCount
    };
    
    setPaymentHistory(prev => [newPayment, ...prev]);
    setCopyCount(0);
    setShowPayModal(false);
    setSuccessToast({ show: true, message: "Payment Successful! Limit Reset." });
  };

  const handleDownload = (invoice) => {
    const element = document.createElement("a");
    const file = new Blob([
      `Invoice ID: ${invoice.id}\nDate: ${invoice.date}\nAmount: $${invoice.amount}\nUser: ${currentUser}\nStatus: Paid`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${invoice.id}.txt`;
    document.body.appendChild(element);
    element.click();
    setSuccessToast({ show: true, message: "Download Started!" });
  };

  return (
    <div className={`app-container ${isDarkMode ? 'dark' : 'light'}`}>
      <style>{`
        .app-container { display: flex; width: 100vw; min-height: 100vh; font-family: 'Inter', sans-serif; transition: background 0.3s; }
        .sidebar { width: 280px; border-right: 1px solid #ddd; display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; z-index: 10; }
        .nav-section { flex: 1; padding: 20px; display: flex; flex-direction: column; gap: 8px; }
        .menu-btn { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 10px; border: none; background: none; cursor: pointer; color: #64748b; font-weight: 600; text-align: left; transition: 0.2s; }
        .menu-btn.active { background: #2563eb; color: white; }
        .menu-btn.logout-btn { color: #ef4444; margin-top: auto; }
        .dark { background: #020617; color: white; }
        .dark .sidebar { background: #0f172a; border-color: #1e293b; }
        .content { flex: 1; padding: 40px; overflow-y: auto; height: 100vh; position: relative; }
        .table-card { background: white; border-radius: 15px; border: 1px solid #e2e8f0; overflow: hidden; margin-top: 20px; }
        .dark .table-card { background: #1e293b; border-color: #334155; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 15px; background: #f8fafc; font-size: 12px; color: #64748b; }
        .dark th { background: #0f172a; color: #94a3b8; }
        td { padding: 15px; border-top: 1px solid #eee; font-size: 14px; }
        .dark td { border-color: #334155; }
        .status-pill { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; background: #dcfce7; color: #166534; }
        .success-toast { position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 16px 24px; border-radius: 12px; display: flex; align-items: center; gap: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2); z-index: 1000; animation: slideIn 0.3s ease-out; }
        .pay-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>

      {successToast.show && (
        <div className="success-toast">
          <CheckCircle2 size={24} />
          <div style={{ fontWeight: 'bold' }}>{successToast.message}</div>
        </div>
      )}

      {showPayModal && (
        <div className="pay-overlay">
          <div style={{ background: isDarkMode ? '#1e293b' : 'white', padding: '40px', borderRadius: '24px', textAlign: 'center', width: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <div style={{ width: '64px', height: '64px', background: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Lock size={32} color="#ef4444" />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '800' }}>Usage Limit Reached</h2>
            <p style={{ color: '#64748b', marginTop: '8px' }}>You've reached your {LIMIT} copy limit. Please pay to continue.</p>
            <div style={{ background: isDarkMode ? '#0f172a' : '#f8fafc', padding: '20px', borderRadius: '16px', margin: '24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '600' }}>Total Due</span>
              <span style={{ fontSize: '24px', fontWeight: '800', color: '#10b981' }}>${(copyCount * RATE_PER_COPY).toFixed(2)}</span>
            </div>
            <button onClick={handlePayment} style={{ width: '100%', padding: '16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>Pay and Unlock</button>
            <button onClick={() => setShowPayModal(false)} style={{ marginTop: '15px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>Maybe Later</button>
          </div>
        </div>
      )}

      <aside className="sidebar">
        <div style={{ padding: '30px', textAlign: 'center', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          <div style={{ width: '50px', height: '50px', background: '#2563eb', borderRadius: '12px', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User color="white" />
          </div>
          <h4 style={{ margin: 0 }}>{currentUser}</h4>
        </div>
        
        <nav className="nav-section">
          <button className={`menu-btn ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}><Home size={18}/> Home</button>
          <button className={`menu-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}><Clock size={18}/> API History</button>
          <button className={`menu-btn ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}><CreditCard size={18}/> Payments</button>
          <button className={`menu-btn ${activeTab === 'invoices' ? 'active' : ''}`} onClick={() => setActiveTab('invoices')}><FileText size={18}/> Invoices</button>
          
          <div style={{ marginTop: '20px', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '20px' }}>
            <button className="menu-btn" onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? <Sun size={18}/> : <Moon size={18}/>} {isDarkMode ? 'Light' : 'Dark'} Mode
            </button>
            <button className="menu-btn logout-btn" onClick={handleLogout}>
            <LogOut size={18}/> Logout
            </button>
          </div>
        </nav>
      </aside>

      <main className="content">
        <h1 style={{ fontSize: '28px', fontWeight: '800' }}>{activeTab.toUpperCase()}</h1>

        {activeTab === 'home' && (
          <div>
            <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
              <div style={{ flex: 1, padding: '24px', background: copyCount >= LIMIT ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', borderRadius: '18px' }}>
                <p style={{ fontSize: '11px', fontWeight: '800', opacity: 0.8 }}>{copyCount >= LIMIT ? 'LIMIT REACHED' : 'UNPAID USAGE'}</p>
                <h2 style={{ fontSize: '32px', margin: '10px 0 0' }}>{copyCount} / {LIMIT}</h2>
              </div>
              <div style={{ flex: 1, padding: '24px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', borderRadius: '18px' }}>
                <p style={{ fontSize: '11px', fontWeight: '800', opacity: 0.8 }}>CURRENT BALANCE</p>
                <h2 style={{ fontSize: '32px', margin: '10px 0 0' }}>${(copyCount * RATE_PER_COPY).toFixed(2)}</h2>
              </div>
            </div>

            <div className="table-card" style={{ padding: '30px', marginTop: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Production API Key</h3>
                {copyCount >= LIMIT && <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}><Lock size={14}/> Key Locked</span>}
              </div>
              {apiKey ? (
                <div style={{ display: 'flex', gap: '12px', marginTop: '15px' }}>
                  <div style={{ 
                    flex: 1, background: isDarkMode ? '#0f172a' : '#f8fafc', padding: '16px', borderRadius: '12px', 
                    fontFamily: 'monospace', color: isDarkMode ? '#94a3b8' : '#475569', border: '1px solid rgba(0,0,0,0.05)',
                    filter: copyCount >= LIMIT ? 'blur(2px)' : 'none'
                  }}>
                    {copyCount >= LIMIT ? "••••••••••••••••••••••••" : apiKey}
                  </div>
                  <button onClick={handleCopy} style={{ padding: '0 24px', borderRadius: '12px', background: copyCount >= LIMIT ? '#475569' : '#2563eb', color: 'white', border: 'none', cursor: 'pointer' }}>
                    {copied ? <Check size={18}/> : <Copy size={18}/>}
                  </button>
                  <button onClick={() => setApiKey("")} style={{ padding: '12px', color: '#ef4444', background: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>
                    <Trash2 size={20}/>
                  </button>
                </div>
              ) : (
                <button onClick={generateKey} style={{ padding: '16px 32px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: '700', marginTop: '15px' }}>
                Generate New Key
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="table-card">
            <table>
              <thead><tr><th>TIMESTAMP</th><th>KEY USED</th><th>EVENT</th></tr></thead>
              <tbody>
                {usageHistory.length > 0 ? usageHistory.map(log => (
                <tr key={log.id}><td>{log.time}</td><td><code>{log.key}</code></td><td><span className="status-pill" style={{ background: '#e0f2fe', color: '#0369a1' }}>Copy Event</span></td></tr>
                )) : <tr><td colSpan="3" style={{ textAlign: 'center', padding: '50px', opacity: 0.5 }}>No usage recorded</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="table-card">
            <table>
              <thead><tr><th>DATE</th><th>INVOICE ID</th><th>AMOUNT</th><th>STATUS</th></tr></thead>
              <tbody>
                {paymentHistory.length > 0 ? paymentHistory.map(pay => (
                <tr key={pay.id}><td>{pay.date}</td><td style={{ fontWeight: '600' }}>{pay.id}</td><td>${pay.amount}</td><td><span className="status-pill">Success</span></td></tr>
                )) : <tr><td colSpan="4" style={{ textAlign: 'center', padding: '50px', opacity: 0.5 }}>No payments found</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {paymentHistory.length > 0 ? paymentHistory.map(pay => (
              <div key={pay.id} className="table-card" style={{ padding: '24px', textAlign: 'center' }}>
                <Receipt size={48} style={{ margin: '0 auto 15px', color: '#3b82f6', opacity: 0.8 }}/>
                <h4 style={{ margin: '0', fontSize: '18px' }}>{pay.id}</h4>
                <div style={{ fontSize: '24px', fontWeight: '800', margin: '15px 0' }}>${pay.amount}</div>
                <button 
                onClick={() => handleDownload(pay)}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #3b82f6', color: '#3b82f6', background: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Download size={16}/> Download PDF
                </button>
              </div>
            )) : <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px', opacity: 0.5 }}>No invoices generated yet</div>}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;