import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        firstName: '',
        lastName: '',
        dob: '',
        contactNumber: '',
        address: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Step 1: Create User
            const userPayload = {
                userName: formData.username,
                password: formData.password,
                email: formData.email,
                role: 'PATIENT'
            };

            const userResponse = await api.post('/users/create', userPayload);
            const userId = userResponse.data.userId;

            // Step 2: Create Patient with the returned userId
            const patientPayload = {
                userId: userId,
                firstName: formData.firstName,
                lastName: formData.lastName,
                dob: formData.dob,
                contactNumber: formData.contactNumber,
                address: formData.address
            };

            await api.post('/patient/create', patientPayload);

            // Success - redirect to login
            alert('Registration successful! Please login.');
            navigate('/login');
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow-lg border-0">
                        <div className="card-body p-5">
                            <h2 className="card-title text-center mb-4 fw-bold text-primary">Patient Registration</h2>
                            {error && <div className="alert alert-danger rounded-3">{error}</div>}
                            <form onSubmit={handleRegister}>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Username *</label>
                                        <input
                                            type="text"
                                            name="username"
                                            className="form-control"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Password *</label>
                                        <input
                                            type="password"
                                            name="password"
                                            className="form-control"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">First Name *</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            className="form-control"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Last Name *</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            className="form-control"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Date of Birth *</label>
                                    <input
                                        type="date"
                                        name="dob"
                                        className="form-control"
                                        value={formData.dob}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Contact Number *</label>
                                    <input
                                        type="tel"
                                        name="contactNumber"
                                        className="form-control"
                                        value={formData.contactNumber}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Address *</label>
                                    <textarea
                                        name="address"
                                        className="form-control"
                                        rows="3"
                                        value={formData.address}
                                        onChange={handleChange}
                                        required
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-success w-100 py-2 fw-bold"
                                    disabled={loading}
                                >
                                    {loading ? 'Registering...' : 'Register'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
