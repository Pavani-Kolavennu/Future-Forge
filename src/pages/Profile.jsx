import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Profile.css";
import { API_ENDPOINTS, apiGet, apiPost } from "../api/client";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [assessmentHistory, setAssessmentHistory] = useState([]);
  const [assignedTests, setAssignedTests] = useState([]);
  const [studentSuggestion, setStudentSuggestion] = useState(null);
  const [testSubmissions, setTestSubmissions] = useState({});
  const [questionsBank, setQuestionsBank] = useState([]);

  const normalizeQuestions = (questions) =>
    (questions || []).map((question) => ({
      ...question,
      options: (question.options || []).map((option) =>
        typeof option === "string" ? option : option.text
      ),
    }));

  const loadStudentData = async () => {
    const currentUser = localStorage.getItem("currentUser");

    if (!currentUser) {
      navigate("/login");
      return;
    }

    const userData = JSON.parse(currentUser);

    if (userData.role !== "student") {
      navigate("/login");
      return;
    }

    setUser(userData);

    try {
      const [backendHistory, backendAssignments, backendSubmissionMap, backendSuggestion] = await Promise.all([
        apiGet(API_ENDPOINTS.integration.assessmentHistoryByStudent(userData.email)),
        apiGet(API_ENDPOINTS.integration.studentAssignmentsByStudent(userData.email)),
        apiGet(API_ENDPOINTS.integration.submissionsByStudent(userData.email)),
        apiGet(API_ENDPOINTS.integration.studentSuggestionByStudent(userData.email)),
      ]);

      setAssessmentHistory(Array.isArray(backendHistory) ? backendHistory : []);

      const sortedAssignments = [...(Array.isArray(backendAssignments) ? backendAssignments : [])].sort(
        (a, b) => new Date(b.assignedDate) - new Date(a.assignedDate)
      );
      setAssignedTests(sortedAssignments);

      setTestSubmissions(backendSubmissionMap?.[userData.email.trim().toLowerCase()] || {});

      setStudentSuggestion(
        backendSuggestion && Object.keys(backendSuggestion).length > 0 ? backendSuggestion : null
      );

      const uniqueAssessmentIds = [...new Set(
        sortedAssignments.map((assignment) => assignment.assessmentId).filter(Boolean)
      )];
      const questionMap = new Map();

      await Promise.all(
        uniqueAssessmentIds.map(async (assessmentId) => {
          try {
            const assessmentQuestions = await apiGet(API_ENDPOINTS.integration.assessmentQuestions(assessmentId));
            normalizeQuestions(assessmentQuestions).forEach((question) => {
              questionMap.set(question.id, question);
            });
          } catch {
            // Keep the rest of the profile usable if a question lookup fails.
          }
        })
      );

      setQuestionsBank(Array.from(questionMap.values()));
    } catch (err) {
      alert(err.message || "Unable to load your data from backend");
    }
  };

  useEffect(() => {
    loadStudentData();

    const handleStorageChange = (event) => {
      if (
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

  const latestAssessment = [...assessmentHistory].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  )[0] || null;

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  const getTestStatus = (assignment) => {
    const submission = testSubmissions[assignment.id];
    if (submission) {
      const assignmentQuestions = getQuestionsFromDb(assignment.questions || []);
      const evaluatedQuestions = assignmentQuestions.filter(
        (question) => question.correctOptionIndex != null
      );

      if (evaluatedQuestions.length > 0) {
        const correctCount = evaluatedQuestions.reduce((count, question) => {
          const studentAnswer = Number(submission.answers?.[String(question.id)]);
          const correctAnswer = Number(question.correctOptionIndex);
          return count + (studentAnswer === correctAnswer ? 1 : 0);
        }, 0);

        const wrongCount = evaluatedQuestions.length - correctCount;

        if (wrongCount > 0) {
          return {
            status: "completed",
            label: `✗ ${correctCount}/${evaluatedQuestions.length} Correct`,
            color: "#f56565",
          };
        }

        return {
          status: "completed",
          label: `✓ ${correctCount}/${evaluatedQuestions.length} Correct`,
          color: "#48bb78",
        };
      }

      return { status: "completed", label: "✓ Submitted", color: "#48bb78" };
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
    return questionsBank.filter((q) => questionIds.includes(q.id));
  };

  const handleStartTest = (assignment) => {
    const questions = getQuestionsFromDb(assignment.questions);
    setTestBeingTaken({ ...assignment, questions });
    setTestAnswers({});
  };

  const handleSubmitTest = async () => {
    const requiredAnswers = testBeingTaken.questions.length;
    const answeredCount = Object.keys(testAnswers).length;

    if (answeredCount < requiredAnswers) {
      alert(`Please answer all ${requiredAnswers} questions. You've answered ${answeredCount}.`);
      return;
    }

    try {
      const savedSubmission = await apiPost(API_ENDPOINTS.integration.submissions, {
        studentEmail: user.email,
        assignmentId: testBeingTaken.id,
        answers: Object.fromEntries(
          Object.entries(testAnswers).map(([questionId, selectedOption]) => [
            String(questionId),
            selectedOption,
          ])
        ),
      });

      setTestSubmissions({
        ...testSubmissions,
        [testBeingTaken.id]: savedSubmission,
      });

      alert("Test submitted successfully!");
      setTestBeingTaken(null);
      setTestAnswers({});
    } catch (err) {
      alert(err.message || "Unable to submit test right now");
    }
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
            {latestAssessment
              ? latestAssessment.score + "%"
              : "N/A"}
          </div>
          <div className="stat-label">Latest Score</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💼</div>
          <div className="stat-value">
            {latestAssessment
              ? latestAssessment.career
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