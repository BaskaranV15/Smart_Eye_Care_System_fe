import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import AuthService from "../services/auth.service";

const ReportOut = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = AuthService.getCurrentUser();

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);

    const [editForm, setEditForm] = useState({
        prediction: "",
        severity: "Mild",
        doctorPrescription: ""
    });

    useEffect(() => {
        fetchReport();
    }, [id]);

    // ================= FETCH REPORT =================
    const fetchReport = async () => {
        try {
            const res = await api.get(`/report/${id}`);
            setReport(res.data);
            setEditForm({
                prediction: res.data.prediction,
                severity: res.data.severity,
                doctorPrescription: res.data.doctorPrescription
            });
        } catch (err) {
            console.error(err);
            alert("Failed to load report");
        } finally {
            setLoading(false);
        }
    };

    // ================= UPDATE REPORT =================
    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/report/${id}`, editForm);
            alert("Report updated successfully");
            setEditing(false);
            fetchReport();
        } catch (err) {
            alert("Update failed");
        }
    };

    const canEdit = user?.role === "DOCTOR" || user?.role === "ADMIN";

    // ================= LOADING =================
    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border" role="status" />
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

            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Medical Report #{report.reportId}</h2>
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                    Back
                </button>
            </div>

            {/* ================= PATIENT + DOCTOR ================= */}
            <div className="row mb-4">

                {/* Patient */}
                <div className="col-md-6">
                    <div className="card h-100">
                        <div className="card-header bg-primary text-white">
                            Patient Information
                        </div>
                        <div className="card-body">
                            <p><b>Name:</b> {report.patient.firstName} {report.patient.lastName}</p>
                            <p><b>Patient ID:</b> {report.patient.patientId}</p>
                            <p><b>Date of Birth:</b> {report.patient.dateOfBirth}</p>
                            <p><b>Contact:</b> {report.patient.contactNumber}</p>
                            <p><b>Address:</b> {report.patient.address}</p>
                        </div>
                    </div>
                </div>

                {/* Doctor */}
                <div className="col-md-6">
                    <div className="card h-100">
                        <div className="card-header bg-success text-white">
                            Doctor Information
                        </div>
                        <div className="card-body">
                            <p><b>Name:</b> Dr. {report.doctor.firstName} {report.doctor.lastName}</p>
                            <p><b>Doctor ID:</b> {report.doctor.doctorId}</p>
                            <p><b>Specialization:</b> {report.doctor.specialization}</p>
                            <p><b>Contact:</b> {report.doctor.contactNumber}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= REPORT DETAILS ================= */}
            <div className="card mb-4">
                <div className="card-header bg-info text-white d-flex justify-content-between">
                    <span>Report Details</span>
                    {canEdit && !editing && (
                        <button
                            className="btn btn-light btn-sm"
                            onClick={() => setEditing(true)}
                        >
                            Edit Report
                        </button>
                    )}
                </div>

                <div className="card-body">
                    {editing ? (
                        <form onSubmit={handleUpdate}>
                            <div className="mb-3">
                                <label className="form-label">Diagnosis</label>
                                <input
                                    className="form-control"
                                    value={editForm.prediction}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, prediction: e.target.value })
                                    }
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Severity</label>
                                <select
                                    className="form-select"
                                    value={editForm.severity}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, severity: e.target.value })
                                    }
                                >
                                    <option>Mild</option>
                                    <option>Moderate</option>
                                    <option>Severe</option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Doctor Prescription</label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    value={editForm.doctorPrescription}
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            doctorPrescription: e.target.value
                                        })
                                    }
                                />
                            </div>

                            <button className="btn btn-success me-2">Save</button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setEditing(false)}
                            >
                                Cancel
                            </button>
                        </form>
                    ) : (
                        <>
                            <p><b>Diagnosis:</b> {report.prediction}</p>
                            <p>
                                <b>Severity:</b>{" "}
                                <span className={`badge ${
                                    report.severity === "Severe"
                                        ? "bg-danger"
                                        : report.severity === "Moderate"
                                        ? "bg-warning"
                                        : "bg-success"
                                }`}>
                                    {report.severity}
                                </span>
                            </p>

                            <p><b>Doctor Prescription:</b></p>
                            <div className="bg-light p-3 rounded">
                                {report.doctorPrescription}
                            </div>

                            <p className="mt-3">
                                <b>Created:</b> {new Date(report.createdAt).toLocaleString()}
                            </p>
                            <p>
                                <b>Last Updated:</b> {new Date(report.updatedAt).toLocaleString()}
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* ================= REPORT IMAGES ================= */}
            {report.images && report.images.length > 0 && (
                <div className="card">
                    <div className="card-header bg-warning">
                        Medical Images ({report.images.length})
                    </div>
                    <div className="card-body">
                        <div className="row">
                            {report.images.map((img, index) => (
                                <div key={img.id} className="col-md-4 col-lg-3 mb-3">
                                    <div className="card">
                                        <img
                                            src={img.imgUrl}
                                            className="card-img-top"
                                            alt={`Medical ${index + 1}`}
                                            style={{ height: "200px", objectFit: "cover" }}
                                            onError={(e) =>
                                                (e.target.src =
                                                    "https://via.placeholder.com/300x200?text=No+Image")
                                            }
                                        />
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
