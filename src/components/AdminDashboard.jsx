import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AuthService from '../services/auth.service';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // User form state
    const [userForm, setUserForm] = useState({
        userName: '',
        password: '',
        email: '',
        role: 'PATIENT'
    });

    // Doctor form state
    const [doctorForm, setDoctorForm] = useState({
        userId: '',
        firstName: '',
        lastName: '',
        specialization: '',
        contactNumber: ''
    });

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            switch (activeTab) {
                case 'users':
                    const usersRes = await api.get('/users/');
                    setUsers(usersRes.data);
                    break;
                case 'doctors':
                    const doctorsRes = await api.get('/doctors/');
                    setDoctors(doctorsRes.data);
                    break;
                case 'patients':
                    const patientsRes = await api.get('/patient/');
                    setPatients(patientsRes.data);
                    break;
                case 'reports':
                    const reportsRes = await api.get('/report/');
                    setReports(reportsRes.data);
                    break;
            }
        } catch (err) {
            setError('Failed to load data: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users/create', userForm);
            alert('User created successfully!');
            setUserForm({ userName: '', password: '', email: '', role: 'PATIENT' });
            loadData();
        } catch (err) {
            alert('Failed to create user: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/users/${id}`);
            alert('User deleted successfully!');
            loadData();
        } catch (err) {
            alert('Failed to delete user: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleCreateDoctor = async (e) => {
        e.preventDefault();
        try {
            await api.post('/doctors/create', doctorForm);
            alert('Doctor created successfully!');
            setDoctorForm({ userId: '', firstName: '', lastName: '', specialization: '', contactNumber: '' });
            loadData();
        } catch (err) {
            alert('Failed to create doctor: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteDoctor = async (id) => {
        if (!window.confirm('Are you sure you want to delete this doctor?')) return;
        try {
            await api.delete(`/doctors/${id}`);
            alert('Doctor deleted successfully!');
            loadData();
        } catch (err) {
            alert('Failed to delete doctor: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeletePatient = async (id) => {
        if (!window.confirm('Are you sure you want to delete this patient?')) return;
        try {
            await api.delete(`/patient/${id}`);
            alert('Patient deleted successfully!');
            loadData();
        } catch (err) {
            alert('Failed to delete patient: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteReport = async (id) => {
        if (!window.confirm('Are you sure you want to delete this report?')) return;
        try {
            await api.delete(`/report/${id}`);
            alert('Report deleted successfully!');
            loadData();
        } catch (err) {
            alert('Failed to delete report: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="container-fluid py-4">
            <h2 className="mb-4">Admin Dashboard</h2>

            {/* Tabs */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                        Users
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'doctors' ? 'active' : ''}`} onClick={() => setActiveTab('doctors')}>
                        Doctors
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'patients' ? 'active' : ''}`} onClick={() => setActiveTab('patients')}>
                        Patients
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
                        Reports
                    </button>
                </li>
            </ul>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div>
                    <div className="card mb-4">
                        <div className="card-header">
                            <h5>Create New User</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleCreateUser} className="row g-3">
                                <div className="col-md-3">
                                    <input type="text" className="form-control" placeholder="Username" value={userForm.userName} onChange={(e) => setUserForm({ ...userForm, userName: e.target.value })} required />
                                </div>
                                <div className="col-md-3">
                                    <input type="password" className="form-control" placeholder="Password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} required />
                                </div>
                                <div className="col-md-3">
                                    <input type="email" className="form-control" placeholder="Email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required />
                                </div>
                                <div className="col-md-2">
                                    <select className="form-select" value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                                        <option value="PATIENT">PATIENT</option>
                                        <option value="DOCTOR">DOCTOR</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </div>
                                <div className="col-md-1">
                                    <button type="submit" className="btn btn-primary w-100">Create</button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h5>All Users</h5>
                        </div>
                        <div className="card-body">
                            {loading ? <p>Loading...</p> : (
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Username</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Created At</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user.userId}>
                                                <td>{user.userId}</td>
                                                <td>{user.userName}</td>
                                                <td>{user.email}</td>
                                                <td><span className="badge bg-info">{user.role}</span></td>
                                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteUser(user.userId)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Doctors Tab */}
            {activeTab === 'doctors' && (
                <div>
                    <div className="card mb-4">
                        <div className="card-header">
                            <h5>Create New Doctor</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleCreateDoctor} className="row g-3">
                                <div className="col-md-2">
                                    <input type="number" className="form-control" placeholder="User ID" value={doctorForm.userId} onChange={(e) => setDoctorForm({ ...doctorForm, userId: e.target.value })} required />
                                </div>
                                <div className="col-md-2">
                                    <input type="text" className="form-control" placeholder="First Name" value={doctorForm.firstName} onChange={(e) => setDoctorForm({ ...doctorForm, firstName: e.target.value })} required />
                                </div>
                                <div className="col-md-2">
                                    <input type="text" className="form-control" placeholder="Last Name" value={doctorForm.lastName} onChange={(e) => setDoctorForm({ ...doctorForm, lastName: e.target.value })} required />
                                </div>
                                <div className="col-md-2">
                                    <input type="text" className="form-control" placeholder="Specialization" value={doctorForm.specialization} onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })} required />
                                </div>
                                <div className="col-md-2">
                                    <input type="tel" className="form-control" placeholder="Contact" value={doctorForm.contactNumber} onChange={(e) => setDoctorForm({ ...doctorForm, contactNumber: e.target.value })} required />
                                </div>
                                <div className="col-md-2">
                                    <button type="submit" className="btn btn-primary w-100">Create</button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h5>All Doctors</h5>
                        </div>
                        <div className="card-body">
                            {loading ? <p>Loading...</p> : (
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Specialization</th>
                                            <th>Contact</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {doctors.map(doctor => (
                                            <tr key={doctor.doctorId}>
                                                <td>{doctor.doctorId}</td>
                                                <td>{doctor.firstName} {doctor.lastName}</td>
                                                <td>{doctor.specialization}</td>
                                                <td>{doctor.contactNumber}</td>
                                                <td>
                                                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteDoctor(doctor.doctorId)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Patients Tab */}
            {activeTab === 'patients' && (
                <div className="card">
                    <div className="card-header">
                        <h5>All Patients</h5>
                    </div>
                    <div className="card-body">
                        {loading ? <p>Loading...</p> : (
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>DOB</th>
                                        <th>Contact</th>
                                        <th>Address</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {patients.map(patient => (
                                        <tr key={patient.patientId}>
                                            <td>{patient.patientId}</td>
                                            <td>{patient.firstName} {patient.lastName}</td>
                                            <td>{patient.dateOfBirth}</td>
                                            <td>{patient.contactNumber}</td>
                                            <td>{patient.address}</td>
                                            <td>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleDeletePatient(patient.patientId)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
                <div className="card">
                    <div className="card-header">
                        <h5>All Reports</h5>
                    </div>
                    <div className="card-body">
                        {loading ? <p>Loading...</p> : (
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Patient ID</th>
                                        <th>Doctor ID</th>
                                        <th>Prediction</th>
                                        <th>Severity</th>
                                        <th>Created At</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map(report => (
                                        <tr key={report.reportId}>
                                            <td>{report.reportId}</td>
                                            <td>{report.patient?.patientId}</td>
                                            <td>{report.doctor?.doctorId}</td>
                                            <td>{report.prediction}</td>
                                            <td><span className={`badge ${report.severity === 'Severe' ? 'bg-danger' : report.severity === 'Moderate' ? 'bg-warning' : 'bg-success'}`}>{report.severity}</span></td>
                                            <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleDeleteReport(report.reportId)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
