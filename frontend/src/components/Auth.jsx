import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import logo from '../assets/logo.png';
import './Auth.css';

const API_URL = 'http://192.168.96.1:8081';

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
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const body = isLogin
                ? { username: formData.username, password: formData.password }
                : formData;

            const response = await fetch(`${API_URL}${endpoint}`, {
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
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="auth-card">
            <div className="auth-header">
                <div className="auth-logo">
                    <img src={logo} alt="PolyEdits Logo" className="auth-logo-image" />
                </div>
                <h1 className="auth-title">PolyEdits</h1>
                <p className="auth-subtitle">Next-Gen Image Manipulation</p>
            </div>

            <div className="auth-tabs">
                <button
                    className={`auth-tab ${isLogin ? 'active' : ''}`}
                    onClick={() => {
                        setIsLogin(true);
                        setError('');
                    }}
                >
                    Login
                </button>
                <button
                    className={`auth-tab ${!isLogin ? 'active' : ''}`}
                    onClick={() => {
                        setIsLogin(false);
                        setError('');
                    }}
                >
                    Register
                </button>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input
                        id="username"
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Enter your username"
                        required
                    />
                </div>

                {!isLogin && (
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Enter your password"
                        required
                    />
                </div>

                <button type="submit" className="auth-submit" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="loading-icon" />
                            Processing...
                        </>
                    ) : (
                        isLogin ? 'Sign In' : 'Create Account'
                    )}
                </button>

                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}
            </form>
        </div>
    );
}

export default Auth;
