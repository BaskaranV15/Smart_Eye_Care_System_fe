import React, { useState } from 'react';
import AuthService from '../services/auth.service';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const user = await AuthService.login(username, password);
            if (user.role) {
                navigate('/dashboard');
            } else {
                setError('Login failed');
            }
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <div className="col-md-6 col-lg-4">
                    <div className="card shadow-lg border-0">
                        <div className="card-body p-5">
                            <h2 className="card-title text-center mb-4 fw-bold text-primary">Welcome Back</h2>
                            <p className="text-center text-muted mb-4">Login to Smart Eye Care</p>
                            {error && <div className="alert alert-danger rounded-3">{error}</div>}
                            <form onSubmit={handleLogin}>
                                <div className="mb-3">
                                    <label className="form-label">Username</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary w-100 py-2 fw-bold">Login</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
