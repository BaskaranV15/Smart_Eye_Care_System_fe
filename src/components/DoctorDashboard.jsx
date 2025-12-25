import React, { useEffect, useState } from "react";
import api from "../services/api";
import AuthService from "../services/auth.service";
import { useNavigate } from "react-router-dom";

const DoctorDashboard = () => {
  const user = AuthService.getCurrentUser();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("patients");
  const [patients, setPatients] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);

  const [form, setForm] = useState({
    patientId: "",
    prediction: "",
    severity: "Mild",
    doctorPrescription: "",
    imageUrls: []
  });

  // ================= LOAD DATA =================
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "patients") {
        const res = await api.get("/patient");
        setPatients(res.data);
      } else {
        const res = await api.get("/report/byDoctor/me");
        setReports(res.data);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // ================= ML UPLOAD =================
  const uploadAndPredict = async () => {
    if (!imageFile) {
      alert("Select image first");
      return;
    }

    const fd = new FormData();
    fd.append("file", imageFile);

    try {
      setUploading(true);
      const res = await api.post("/images/upload-and-predict", fd);

      setForm(prev => ({
        ...prev,
        prediction: res.data.prediction.result,
        imageUrls: [...prev.imageUrls, res.data.imageUrl]
      }));

      setPredictionResult(res.data.prediction);
    } catch (err) {
      alert("Prediction failed");
    } finally {
      setUploading(false);
    }
  };

  // ================= CREATE REPORT =================
  const createReport = async (e) => {
    e.preventDefault();

    try {
      await api.post("/report/create", form);
      alert("Report created");

      setForm({
        patientId: "",
        prediction: "",
        severity: "Mild",
        doctorPrescription: "",
        imageUrls: []
      });

      setImageFile(null);
      setPredictionResult(null);
      setShowForm(false);
      setActiveTab("reports");
      loadData();
    } catch (err) {
      alert("Create report failed");
    }
  };

  // ================= UI =================
  return (
    <div className="container mt-4">
      <h2>Doctor Dashboard</h2>

      {/* TABS */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "patients" ? "active" : ""}`}
            onClick={() => setActiveTab("patients")}
          >
            Patients
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            My Reports
          </button>
        </li>
      </ul>

      {/* ================= PATIENTS ================= */}
      {activeTab === "patients" && (
        <div className="card">
          <div className="card-header d-flex justify-content-between">
            <h5>Patients</h5>
            <button
              className="btn btn-primary"
              onClick={() => {
                setShowForm(true);
                setActiveTab("reports");
              }}
            >
              Create Report
            </button>
          </div>

          <div className="card-body">
            {loading ? "Loading..." : (
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th><th>Name</th><th>Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(p => (
                    <tr key={p.patientId}>
                      <td>{p.patientId}</td>
                      <td>{p.firstName} {p.lastName}</td>
                      <td>{p.contactNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ================= CREATE REPORT ================= */}
      {activeTab === "reports" && showForm && (
        <div className="card mb-4">
          <div className="card-header">Create Report</div>
          <div className="card-body">
            <form onSubmit={createReport}>
              <input
                className="form-control mb-2"
                placeholder="Patient ID"
                required
                value={form.patientId}
                onChange={e => setForm({ ...form, patientId: e.target.value })}
              />

              <select
                className="form-select mb-2"
                value={form.severity}
                onChange={e => setForm({ ...form, severity: e.target.value })}
              >
                <option>Mild</option>
                <option>Moderate</option>
                <option>Severe</option>
              </select>

              <input
                className="form-control mb-2"
                placeholder="Prediction"
                readOnly
                value={form.prediction}
              />

              <textarea
                className="form-control mb-2"
                placeholder="Prescription"
                required
                value={form.doctorPrescription}
                onChange={e => setForm({ ...form, doctorPrescription: e.target.value })}
              />

              <input
                type="file"
                className="form-control mb-2"
                accept="image/*"
                onChange={e => setImageFile(e.target.files[0])}
              />

              <button
                type="button"
                className="btn btn-secondary mb-2"
                onClick={uploadAndPredict}
                disabled={uploading}
              >
                {uploading ? "Predicting..." : "Upload & Predict"}
              </button>

              {predictionResult && (
                <pre className="alert alert-info">
                  {JSON.stringify(predictionResult, null, 2)}
                </pre>
              )}

              <button className="btn btn-success">Create Report</button>
            </form>
          </div>
        </div>
      )}

      {/* ================= REPORTS ================= */}
      {activeTab === "reports" && (
        <div className="card">
          <div className="card-header">My Reports</div>
          <div className="card-body">
            {loading ? "Loading..." : (
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th><th>Prediction</th><th>Severity</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map(r => (
                    <tr key={r.reportId}>
                      <td>{r.reportId}</td>
                      <td>{r.prediction}</td>
                      <td>{r.severity}</td>
                      <td>
                        <button
                          className="btn btn-info btn-sm"
                          onClick={() => navigate(`/report/${r.reportId}`)}
                        >
                          View
                        </button>
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

export default DoctorDashboard;
