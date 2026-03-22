import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Profile.css";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [assessmentHistory, setAssessmentHistory] = useState([]);
  const [assignedTests, setAssignedTests] = useState([]);
  const [studentSuggestion, setStudentSuggestion] = useState(null);
  const [testSubmissions, setTestSubmissions] = useState({});

  useEffect(() => {
    const loadStudentData = () => {
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

      const allAssignments = JSON.parse(localStorage.getItem("testAssignments") || "[]");
      const studentAssignments = allAssignments
        .filter((assignment) => assignment.studentId === userData.email)
        .sort((a, b) => new Date(b.assignedDate) - new Date(a.assignedDate));
      setAssignedTests(studentAssignments);

      const allSuggestions = JSON.parse(localStorage.getItem("personalizedSuggestions") || "{}");
      setStudentSuggestion(allSuggestions[userData.email] || null);

      const allSubmissions = JSON.parse(localStorage.getItem("testSubmissions") || "{}");
      setTestSubmissions(allSubmissions[userData.email] || {});
    };

    loadStudentData();

    const handleStorageChange = (event) => {
      if (
        event.key === "assessmentHistory" ||
        event.key === "testAssignments" ||
        event.key === "personalizedSuggestions" ||
        event.key === "testSubmissions" ||
        event.key === "currentUser"
      ) {
        loadStudentData();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [navigate]);

  const [testBeingTaken, setTestBeingTaken] = useState(null);
  const [testAnswers, setTestAnswers] = useState({});

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  const getTestStatus = (assignment) => {
    const submission = testSubmissions[assignment.id];
    if (submission) {
      return { status: "completed", label: "✓ Completed", color: "#48bb78" };
    }
    
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    
    if (now > dueDate) {
      return { status: "overdue", label: "⚠ Overdue", color: "#f56565" };
    }
    
    const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 2) {
      return { status: "due-soon", label: `Due in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`, color: "#ecc94b" };
    }
    
    return { status: "pending", label: "Pending", color: "#4299e1" };
  };

  const getQuestionsFromDb = (questionIds) => {
    const allQuestions = JSON.parse(localStorage.getItem("adminQuestions") || "[]");
    return allQuestions.filter((q) => questionIds.includes(q.id));
  };

  const handleStartTest = (assignment) => {
    const questions = getQuestionsFromDb(assignment.questions);
    setTestBeingTaken({ ...assignment, questions });
    setTestAnswers({});
  };

  const handleSubmitTest = () => {
    const requiredAnswers = testBeingTaken.questions.length;
    const answeredCount = Object.keys(testAnswers).length;

    if (answeredCount < requiredAnswers) {
      alert(`Please answer all ${requiredAnswers} questions. You've answered ${answeredCount}.`);
      return;
    }

    const allSubmissions = JSON.parse(localStorage.getItem("testSubmissions") || "{}");
    
    if (!allSubmissions[user.email]) {
      allSubmissions[user.email] = {};
    }

    allSubmissions[user.email][testBeingTaken.id] = {
      answers: testAnswers,
      submittedAt: new Date().toISOString(),
      assignmentId: testBeingTaken.id
    };

    localStorage.setItem("testSubmissions", JSON.stringify(allSubmissions));
    setTestSubmissions(allSubmissions[user.email] || {});
    alert("Test submitted successfully!");
    setTestBeingTaken(null);
    setTestAnswers({});
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

        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-value">{assignedTests.length}</div>
          <div className="stat-label">Tests Assigned By Admin</div>
        </div>
      </div>


      {/* Assigned Tests */}
      {!testBeingTaken ? (
        <div className="profile-section">
          <h3>Assigned Tests</h3>

          {assignedTests.length > 0 ? (
            <div className="history-list">
              {assignedTests.map((assignment) => {
                const testStatus = getTestStatus(assignment);
                return (
                  <div key={assignment.id} style={{ padding: "15px", background: "white", marginBottom: "10px", borderRadius: "4px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                        <strong>{assignment.questions.length} Questions</strong>
                        <span style={{ background: testStatus.color, color: "white", padding: "4px 10px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" }}>
                          {testStatus.label}
                        </span>
                      </div>
                      <div style={{ fontSize: "14px", color: "#718096" }}>
                        Assigned: {new Date(assignment.assignedDate).toLocaleDateString()} • Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleStartTest(assignment)}
                      disabled={testStatus.status === "completed"}
                      style={{
                        padding: "8px 16px",
                        background: testStatus.status === "completed" ? "#cbd5e0" : "#3182ce",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: testStatus.status === "completed" ? "not-allowed" : "pointer",
                        fontWeight: "bold",
                        marginLeft: "10px"
                      }}
                    >
                      {testStatus.status === "completed" ? "Submitted" : "Take Test"}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-history">
              <p>No tests assigned by admin yet.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="profile-section">
          <h3>📝 Test: {testBeingTaken.questions.length} Questions</h3>
          <div style={{ background: "#fff5f5", padding: "12px", borderRadius: "4px", marginBottom: "20px", border: "1px solid #fc8181" }}>
            <p style={{ margin: 0, color: "#c53030", fontWeight: "bold" }}>
              Due: {new Date(testBeingTaken.dueDate).toLocaleDateString()}
            </p>
          </div>

          <div style={{ background: "#f7fafc", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
            {testBeingTaken.questions.map((q, idx) => (
              <div key={q.id} style={{ marginBottom: "20px", paddingBottom: "20px", borderBottom: idx < testBeingTaken.questions.length - 1 ? "1px solid #e2e8f0" : "none" }}>
                <strong style={{ display: "block", marginBottom: "10px", color: "#2d3748" }}>
                  Q{idx + 1}. {q.text}
                </strong>
                <div>
                  {q.options.map((option, oIdx) => (
                    <label key={oIdx} style={{ display: "block", marginBottom: "8px", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        value={oIdx}
                        checked={testAnswers[q.id] === oIdx}
                        onChange={(e) => setTestAnswers({ ...testAnswers, [q.id]: parseInt(e.target.value) })}
                        style={{ marginRight: "8px", cursor: "pointer" }}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button
              onClick={() => setTestBeingTaken(null)}
              style={{
                padding: "10px 20px",
                background: "#cbd5e0",
                color: "#2d3748",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitTest}
              style={{
                padding: "10px 20px",
                background: "#48bb78",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              Submit Test
            </button>
          </div>
        </div>
      )}

      {/* Personalized Suggestion */}
      <div className="profile-section">
        <h3>Personalized Suggestion From Admin</h3>

        {studentSuggestion ? (
          <div className="admin-suggestion-card">
            <div className="admin-suggestion-career">Recommended Path: {studentSuggestion.career}</div>
            <p>{studentSuggestion.suggestion}</p>
            <div className="admin-suggestion-date">
              Updated: {new Date(studentSuggestion.date).toLocaleDateString()}
            </div>
          </div>
        ) : (
          <div className="no-history">
            <p>No personalized suggestion from admin yet.</p>
          </div>
        )}
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