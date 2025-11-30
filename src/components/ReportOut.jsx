import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import AuthService from '../services/auth.service';

const ReportOut = () => {
    const { id } = useParams();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        prediction: '',
        severity: '',
        doctorPrescription: ''
    });
    const user = AuthService.getCurrentUser();
    const navigate = useNavigate();

    useEffect(() => {
        loadReport();
    }, [id]);

    const loadReport = async () => {
        try {
            const res = await api.get(`/report/${id}`);
            setReport(res.data);
            setEditForm({
                prediction: res.data.prediction,
                severity: res.data.severity,
                doctorPrescription: res.data.doctorPrescription
            });
        } catch (err) {
            console.error('Failed to load report:', err);
            alert('Failed to load report');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/report/${id}`, editForm);
            alert('Report updated successfully!');
            setEditing(false);
            loadReport();
        } catch (err) {
            alert('Failed to update report: ' + (err.response?.data?.message || err.message));
        }
    };

    const canEdit = user?.role === 'DOCTOR' || user?.role === 'ADMIN';

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger">Report not found</div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Medical Report #{report.reportId}</h2>
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                    Back
                </button>
            </div>

            <div className="row">
                {/* Patient Information */}
                <div className="col-md-6 mb-4">
                    <div className="card h-100">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">Patient Information</h5>
                        </div>
                        <div className="card-body">
                            <p><strong>Name:</strong> {report.patient?.firstName} {report.patient?.lastName}</p>
                            <p><strong>Patient ID:</strong> {report.patient?.patientId}</p>
                            <p><strong>Date of Birth:</strong> {report.patient?.dateOfBirth}</p>
                            <p><strong>Contact:</strong> {report.patient?.contactNumber}</p>
                            <p className="mb-0"><strong>Address:</strong> {report.patient?.address}</p>
                        </div>
                    </div>
                </div>

                {/* Doctor Information */}
                <div className="col-md-6 mb-4">
                    <div className="card h-100">
                        <div className="card-header bg-success text-white">
                            <h5 className="mb-0">Doctor Information</h5>
                        </div>
                        <div className="card-body">
                            <p><strong>Name:</strong> Dr. {report.doctor?.firstName} {report.doctor?.lastName}</p>
                            <p><strong>Doctor ID:</strong> {report.doctor?.doctorId}</p>
                            <p><strong>Specialization:</strong> {report.doctor?.specialization}</p>
                            <p className="mb-0"><strong>Contact:</strong> {report.doctor?.contactNumber}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Details */}
            <div className="card mb-4">
                <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Report Details</h5>
                    {canEdit && !editing && (
                        <button className="btn btn-light btn-sm" onClick={() => setEditing(true)}>
                            Edit Report
                        </button>
                    )}
                </div>
                <div className="card-body">
                    {editing ? (
                        <form onSubmit={handleUpdate}>
                            <div className="mb-3">
                                <label className="form-label">Diagnosis/Prediction</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={editForm.prediction}
                                    onChange={(e) => setEditForm({ ...editForm, prediction: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Severity</label>
                                <select
                                    className="form-select"
                                    value={editForm.severity}
                                    onChange={(e) => setEditForm({ ...editForm, severity: e.target.value })}
                                >
                                    <option value="Mild">Mild</option>
                                    <option value="Moderate">Moderate</option>
                                    <option value="Severe">Severe</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Doctor's Prescription</label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    value={editForm.doctorPrescription}
                                    onChange={(e) => setEditForm({ ...editForm, doctorPrescription: e.target.value })}
                                    required
                                ></textarea>
                            </div>
                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-success">Save Changes</button>
                                <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <p><strong>Diagnosis:</strong> {report.prediction}</p>
                                    <p><strong>Severity:</strong>
                                        <span className={`badge ms-2 ${report.severity === 'Severe' ? 'bg-danger' : report.severity === 'Moderate' ? 'bg-warning' : 'bg-success'}`}>
                                            {report.severity}
                                        </span>
                                    </p>
                                </div>
                                <div className="col-md-6">
                                    <p><strong>Created:</strong> {new Date(report.createdAt).toLocaleString()}</p>
                                    <p><strong>Last Updated:</strong> {new Date(report.updatedAt).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="mb-3">
                                <strong>Doctor's Prescription:</strong>
                                <p className="mt-2 p-3 bg-light rounded">{report.doctorPrescription}</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Report Images */}
            {report.images && report.images.length > 0 && (
                <div className="card">
                    <div className="card-header bg-warning">
                        <h5 className="mb-0">Medical Images ({report.images.length})</h5>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            {report.images.map((image, index) => (
                                <div key={image.id} className="col-md-4 col-lg-3 mb-3">
                                    <div className="card">
                                        <img
                                            src={image.imgUrl}
                                            className="card-img-top"
                                            alt={`Medical Image ${index + 1}`}
                                            style={{ height: '200px', objectFit: 'cover' }}
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
                                            }}
                                        />
                                        <div className="card-body p-2">
                                            <small className="text-muted">Image {index + 1}</small>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportOut;
