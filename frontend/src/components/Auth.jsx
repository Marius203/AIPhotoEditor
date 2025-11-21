import React, { useState } from 'react';
import { Aperture, Loader2 } from 'lucide-react';

function Auth({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Use the actual backend endpoint
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const body = isLogin
                ? { username: formData.username, password: formData.password }
                : formData;

            const response = await fetch(`http://localhost:8081${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Authentication failed');
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            localStorage.setItem('email', data.email);
            onLogin(data);
        } catch (err) {
            setError(err.message);
            // For demo purposes in preview if backend is unreachable:
            // onLogin({ username: formData.username || 'DemoUser', email: 'demo@example.com', token: 'demo-token' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-white p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-cyan-500/10 blur-[100px]" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[100px]" />
            </div>

            <div className="relative w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-600" />

                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 mb-4 shadow-lg shadow-cyan-500/20">
                            <Aperture className="w-8 h-8 text-cyan-400" />
                        </div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            PolyEdits AI
                        </h1>
                        <p className="text-slate-400 text-sm mt-2 tracking-wide uppercase">Next-Gen Image Manipulation</p>
                    </div>

                    <div className="flex bg-slate-950/50 p-1 rounded-lg mb-8 border border-white/5">
                        <button
                            className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-300 ${isLogin
                                ? 'bg-slate-800 text-white shadow-lg shadow-black/20'
                                : 'text-slate-400 hover:text-white'
                                }`}
                            onClick={() => { setIsLogin(true); setError(''); }}
                        >
                            Login
                        </button>
                        <button
                            className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-300 ${!isLogin
                                ? 'bg-slate-800 text-white shadow-lg shadow-black/20'
                                : 'text-slate-400 hover:text-white'
                                }`}
                            onClick={() => { setIsLogin(false); setError(''); }}
                        >
                            Register
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-cyan-400/80 uppercase tracking-wider ml-1">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 text-slate-200 placeholder-slate-600 transition-all"
                                placeholder="Enter your username"
                            />
                        </div>

                        {!isLogin && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-cyan-400/80 uppercase tracking-wider ml-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 text-slate-200 placeholder-slate-600 transition-all"
                                    placeholder="Enter your email"
                                />
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-cyan-400/80 uppercase tracking-wider ml-1">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 text-slate-200 placeholder-slate-600 transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)] transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                                </span>
                            ) : (
                                isLogin ? 'Initialize Session' : 'Create Account'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Auth;
