import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Profile.css";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [assessmentHistory, setAssessmentHistory] = useState([]);

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");

    if (!currentUser) {
      navigate("/login");
      return;
    }

    const userData = JSON.parse(currentUser);

    // Allow only students
    if (userData.role !== "student") {
      navigate("/login");
      return;
    }

    setUser(userData);

    const history = JSON.parse(
      localStorage.getItem("assessmentHistory") || "[]"
    );

    const userHistory = history.filter(
      (h) => h.userId === userData.email
    );

    setAssessmentHistory(userHistory);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="profile-stats">
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-value">{assessmentHistory.length}</div>
          <div className="stat-label">Assessments Taken</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">
            {assessmentHistory.length > 0
              ? assessmentHistory[assessmentHistory.length - 1].score + "%"
              : "N/A"}
          </div>
          <div className="stat-label">Latest Score</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💼</div>
          <div className="stat-value">
            {assessmentHistory.length > 0
              ? assessmentHistory[assessmentHistory.length - 1].career
              : "N/A"}
          </div>
          <div className="stat-label">Recommended Career</div>
        </div>
      </div>

      {/* History */}
      <div className="profile-section">
        <h3>Assessment History</h3>

        {assessmentHistory.length > 0 ? (
          <div className="history-list">
            {[...assessmentHistory]
              .reverse()
              .map((assessment, index) => (
                <div key={index} className="history-item">
                  <div className="history-date">
                    {new Date(assessment.date).toLocaleDateString()}
                  </div>
                  <div className="history-details">
                    <strong>{assessment.career}</strong>
                    <span className="history-score">
                      Score: {assessment.score}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="no-history">
            <p>You haven't taken any assessments yet.</p>
            <Link to="/assessment" className="btn btn-primary">
              Take Your First Assessment
            </Link>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="profile-actions">
        <Link to="/assessment" className="btn btn-primary">
          Take New Assessment
        </Link>
      </div>

      {/* Logout at bottom (Instagram style) */}
      <div style={{ marginTop: "40px", textAlign: "center" }}>
        <button onClick={handleLogout} className="btn btn-logout">
          Logout
        </button>
      </div>
    </div>
  );
}

export default Profile;