import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const PatientDashboard = () => {

    const [activeTab, setActiveTab] = useState('profile');
    const [profile, setProfile] = useState(null);
    const [myReports, setMyReports] = useState([]);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            // ✅ GET MY PROFILE (SECURE ENDPOINT)
            const profileRes = await api.get('/patient/me');
            setProfile(profileRes.data);

            // ✅ LOAD REPORTS ONLY WHEN NEEDED
            if (activeTab === 'reports') {
                const reportsRes = await api.get(
                    `/report/byPatient/${profileRes.data.patientId}`
                );
                setMyReports(reportsRes.data);
            }

        } catch (err) {
            console.error('Failed to load data:', err);
            alert('Failed to load patient data');
        } finally {
            setLoading(false);
        }
    };

    const viewReport = (reportId) => {
        navigate(`/report/${reportId}`);
    };

    return (
        <div className="container-fluid py-4">
            <h2 className="mb-4">Patient Dashboard</h2>

            {/* Tabs */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        My Profile
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'reports' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reports')}
                    >
                        My Reports
                    </button>
                </li>
            </ul>

            {/* ================= PROFILE TAB ================= */}
            {activeTab === 'profile' && (
                <div className="card">
                    <div className="card-header">
                        <h5>My Profile</h5>
                    </div>
                    <div className="card-body">
                        {loading ? (
                            <p>Loading...</p>
                        ) : profile ? (
                            <div className="row">
                                <div className="col-md-6">
                                    <p><strong>Patient ID:</strong> {profile.patientId}</p>
                                    <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
                                    <p><strong>Date of Birth:</strong> {profile.dateOfBirth}</p>
                                    <p><strong>Contact Number:</strong> {profile.contactNumber}</p>
                                </div>
                                <div className="col-md-6">
                                    <p><strong>Address:</strong> {profile.address}</p>
                                </div>
                            </div>
                        ) : (
                            <p>No profile found.</p>
                        )}
                    </div>
                </div>
            )}

            {/* ================= REPORTS TAB ================= */}
            {activeTab === 'reports' && (
                <div className="card">
                    <div className="card-header">
                        <h5>My Medical Reports</h5>
                    </div>
                    <div className="card-body">
                        {loading ? (
                            <p>Loading...</p>
                        ) : myReports.length > 0 ? (
                            <div className="row">
                                {myReports.map(report => (
                                    <div key={report.reportId} className="col-md-6 col-lg-4 mb-3">
                                        <div className="card h-100">
                                            <div className="card-body">
                                                <h6 className="card-title">
                                                    Report #{report.reportId}
                                                </h6>
                                                <p className="card-text">
                                                    <strong>Diagnosis:</strong> {report.prediction}<br />
                                                    <strong>Severity:</strong>{' '}
                                                    <span className={`badge ${
                                                        report.severity === 'Severe'
                                                            ? 'bg-danger'
                                                            : report.severity === 'Moderate'
                                                            ? 'bg-warning'
                                                            : 'bg-success'
                                                    }`}>
                                                        {report.severity}
                                                    </span><br />
                                                    <strong>Doctor:</strong> Dr. {report.doctor?.firstName} {report.doctor?.lastName}
                                                </p>
                                                <button
                                                    className="btn btn-primary btn-sm w-100"
                                                    onClick={() => viewReport(report.reportId)}
                                                >
                                                    View Full Report
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted">
                                No reports found. Reports will appear once created by a doctor.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientDashboard;
