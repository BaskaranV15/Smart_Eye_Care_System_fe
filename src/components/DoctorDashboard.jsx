import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AuthService from '../services/auth.service';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
    const [activeTab, setActiveTab] = useState('patients');
    const [patients, setPatients] = useState([]);
    const [myReports, setMyReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showReportForm, setShowReportForm] = useState(false);
    const user = AuthService.getCurrentUser();
    const navigate = useNavigate();

    // Report form state
    const [reportForm, setReportForm] = useState({
        patientId: '',
        doctorId: user?.userId || '',
        prediction: '',
        severity: 'Mild',
        doctorPrescription: '',
        imageUrls: []
    });

    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'patients') {
                const res = await api.get('/patient/');
                setPatients(res.data);
            } else if (activeTab === 'reports') {
                // Get doctor ID from user profile
                const doctorsRes = await api.get('/doctors/');
                const myDoctor = doctorsRes.data.find(d => d.userId === user.userId);
                if (myDoctor) {
                    const reportsRes = await api.get(`/report/byDoctor/${myDoctor.doctorId}`);
                    setMyReports(reportsRes.data);
                }
            }
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddImage = () => {
        if (imageUrl.trim()) {
            setReportForm({
                ...reportForm,
                imageUrls: [...reportForm.imageUrls, imageUrl]
            });
            setImageUrl('');
        }
    };

    const handleRemoveImage = (index) => {
        setReportForm({
            ...reportForm,
            imageUrls: reportForm.imageUrls.filter((_, i) => i !== index)
        });
    };

    const handleCreateReport = async (e) => {
        e.preventDefault();
        try {
            await api.post('/report/create', reportForm);
            alert('Report created successfully!');
            setShowReportForm(false);
            setReportForm({
                patientId: '',
                doctorId: user?.userId || '',
                prediction: '',
                severity: 'Mild',
                doctorPrescription: '',
                imageUrls: []
            });
            setActiveTab('reports');
            loadData();
        } catch (err) {
            alert('Failed to create report: ' + (err.response?.data?.message || err.message));
        }
    };

    const viewReport = (reportId) => {
        navigate(`/report/${reportId}`);
    };

    return (
        <div className="container-fluid py-4">
            <h2 className="mb-4">Doctor Dashboard</h2>

            {/* Tabs */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'patients' ? 'active' : ''}`} onClick={() => setActiveTab('patients')}>
                        Patients
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
                        My Reports
                    </button>
                </li>
            </ul>

            {/* Patients Tab */}
            {activeTab === 'patients' && (
                <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h5>All Patients</h5>
                        <button className="btn btn-primary" onClick={() => { setShowReportForm(true); setActiveTab('reports'); }}>
                            Create New Report
                        </button>
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
                <div>
                    {showReportForm && (
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5>Create New Report</h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleCreateReport}>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Patient ID *</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={reportForm.patientId}
                                                onChange={(e) => setReportForm({ ...reportForm, patientId: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Severity *</label>
                                            <select
                                                className="form-select"
                                                value={reportForm.severity}
                                                onChange={(e) => setReportForm({ ...reportForm, severity: e.target.value })}
                                            >
                                                <option value="Mild">Mild</option>
                                                <option value="Moderate">Moderate</option>
                                                <option value="Severe">Severe</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Prediction/Diagnosis *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={reportForm.prediction}
                                            onChange={(e) => setReportForm({ ...reportForm, prediction: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Prescription *</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={reportForm.doctorPrescription}
                                            onChange={(e) => setReportForm({ ...reportForm, doctorPrescription: e.target.value })}
                                            required
                                        ></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Report Images</label>
                                        <div className="input-group mb-2">
                                            <input
                                                type="url"
                                                className="form-control"
                                                placeholder="Image URL"
                                                value={imageUrl}
                                                onChange={(e) => setImageUrl(e.target.value)}
                                            />
                                            <button type="button" className="btn btn-secondary" onClick={handleAddImage}>Add Image</button>
                                        </div>
                                        {reportForm.imageUrls.length > 0 && (
                                            <ul className="list-group">
                                                {reportForm.imageUrls.map((url, index) => (
                                                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                                        {url}
                                                        <button type="button" className="btn btn-sm btn-danger" onClick={() => handleRemoveImage(index)}>Remove</button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button type="submit" className="btn btn-success">Create Report</button>
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowReportForm(false)}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5>My Reports</h5>
                            {!showReportForm && (
                                <button className="btn btn-primary" onClick={() => setShowReportForm(true)}>
                                    Create New Report
                                </button>
                            )}
                        </div>
                        <div className="card-body">
                            {loading ? <p>Loading...</p> : (
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Patient</th>
                                            <th>Prediction</th>
                                            <th>Severity</th>
                                            <th>Created At</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {myReports.map(report => (
                                            <tr key={report.reportId}>
                                                <td>{report.reportId}</td>
                                                <td>{report.patient?.firstName} {report.patient?.lastName}</td>
                                                <td>{report.prediction}</td>
                                                <td>
                                                    <span className={`badge ${report.severity === 'Severe' ? 'bg-danger' : report.severity === 'Moderate' ? 'bg-warning' : 'bg-success'}`}>
                                                        {report.severity}
                                                    </span>
                                                </td>
                                                <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <button className="btn btn-sm btn-info" onClick={() => viewReport(report.reportId)}>View</button>
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
        </div>
    );
};

export default DoctorDashboard;
