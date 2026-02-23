import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  const [assessmentHistory, setAssessmentHistory] = useState([]);

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");

    if (!currentUser) {
      navigate("/login");
      return;
    }

    const userData = JSON.parse(currentUser);

    if (userData.role !== "admin") {
      navigate("/login");
      return;
    }

    setAdmin(userData);

    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const studentsOnly = storedUsers.filter(u => u.role === "student");
    setUsers(studentsOnly);

    const history = JSON.parse(localStorage.getItem("assessmentHistory") || "[]");
    setAssessmentHistory(history);

  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  if (!admin) return null;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {admin.name.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <h2>Admin Dashboard</h2>
          <p>Welcome, {admin.name}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="profile-stats">
        <div className="stat-card">
          <div className="stat-icon">👩‍🎓</div>
          <div className="stat-value">{users.length}</div>
          <div className="stat-label">Total Students</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{assessmentHistory.length}</div>
          <div className="stat-label">Total Assessments</div>
        </div>
      </div>

      {/* Assessment Table */}
      <div className="profile-section">
        <h3>All Assessment Records</h3>

        {assessmentHistory.length > 0 ? (
          <div className="history-list">
            {assessmentHistory.map((assessment, index) => (
              <div key={index} className="history-item">
                <div className="history-date">
                  {new Date(assessment.date).toLocaleDateString()}
                </div>
                <div className="history-details">
                  <strong>{assessment.userId}</strong>
                  <span className="history-score">
                    {assessment.career} — {assessment.score}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No assessments taken yet.</p>
        )}
      </div>

      {/* Logout */}
      <div style={{ marginTop: "40px", textAlign: "center" }}>
        <button onClick={handleLogout} className="btn btn-logout">
          Logout
        </button>
      </div>
    </div>
  );
}

export default AdminDashboard;