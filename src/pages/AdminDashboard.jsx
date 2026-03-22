import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Questions Management State
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    options: ["", "", ""]
  });

  // Test Assignment State
  const [testAssignments, setTestAssignments] = useState([]);
  const [assignmentForm, setAssignmentForm] = useState({
    studentId: "",
    questions: [],
    dueDate: ""
  });

  // Personalized Suggestions State
  const [suggestions, setSuggestions] = useState({});
  const [suggestionForm, setSuggestionForm] = useState({
    studentId: "",
    suggestion: "",
    career: ""
  });

  // Test Submissions State
  const [testSubmissions, setTestSubmissions] = useState({});
  const [selectedSubmission, setSelectedSubmission] = useState(null);

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

    const storedQuestions = JSON.parse(localStorage.getItem("adminQuestions") || "[]");
    setQuestions(storedQuestions);

    const storedAssignments = JSON.parse(localStorage.getItem("testAssignments") || "[]");
    setTestAssignments(storedAssignments);

    const storedSuggestions = JSON.parse(localStorage.getItem("personalizedSuggestions") || "{}");
    setSuggestions(storedSuggestions);

    const storedSubmissions = JSON.parse(localStorage.getItem("testSubmissions") || "{}");
    setTestSubmissions(storedSubmissions);

  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  // Question Management
  const handleAddQuestion = () => {
    if (!newQuestion.text || newQuestion.options.some(o => !o)) {
      alert("Please fill in all fields");
      return;
    }

    const question = {
      id: Date.now(),
      text: newQuestion.text,
      options: newQuestion.options
    };

    const updatedQuestions = [...questions, question];
    setQuestions(updatedQuestions);
    localStorage.setItem("adminQuestions", JSON.stringify(updatedQuestions));
    setNewQuestion({ text: "", options: ["", "", ""] });
    alert("Question added successfully!");
  };

  const handleDeleteQuestion = (id) => {
    const updatedQuestions = questions.filter(q => q.id !== id);
    setQuestions(updatedQuestions);
    localStorage.setItem("adminQuestions", JSON.stringify(updatedQuestions));
  };

  // Test Assignment
  const handleAssignTest = () => {
    if (!assignmentForm.studentId || assignmentForm.questions.length === 0 || !assignmentForm.dueDate) {
      alert("Please fill in all fields and select at least one question");
      return;
    }

    const assignment = {
      id: Date.now(),
      studentId: assignmentForm.studentId,
      questions: assignmentForm.questions,
      dueDate: assignmentForm.dueDate,
      assignedDate: new Date().toISOString(),
      status: "assigned"
    };

    const updatedAssignments = [...testAssignments, assignment];
    setTestAssignments(updatedAssignments);
    localStorage.setItem("testAssignments", JSON.stringify(updatedAssignments));
    setAssignmentForm({ studentId: "", questions: [], dueDate: "" });
    alert("Test assigned successfully!");
  };

  const handleDeleteAssignment = (id) => {
    const updatedAssignments = testAssignments.filter(a => a.id !== id);
    setTestAssignments(updatedAssignments);
    localStorage.setItem("testAssignments", JSON.stringify(updatedAssignments));

    // Remove submissions tied to a deleted assignment so stale attempts do not appear in results.
    const updatedSubmissions = Object.fromEntries(
      Object.entries(testSubmissions)
        .map(([studentEmail, submissions]) => {
          const filteredSubmissions = Object.fromEntries(
            Object.entries(submissions).filter(([, submission]) => Number(submission.assignmentId) !== id)
          );
          return [studentEmail, filteredSubmissions];
        })
        .filter(([, submissions]) => Object.keys(submissions).length > 0)
    );

    setTestSubmissions(updatedSubmissions);
    localStorage.setItem("testSubmissions", JSON.stringify(updatedSubmissions));

    if (selectedSubmission && Number(selectedSubmission.submission.assignmentId) === id) {
      setSelectedSubmission(null);
    }
  };

  // Personalized Suggestions
  const handleAddSuggestion = () => {
    if (!suggestionForm.studentId || !suggestionForm.suggestion || !suggestionForm.career) {
      alert("Please fill in all fields");
      return;
    }

    const updatedSuggestions = {
      ...suggestions,
      [suggestionForm.studentId]: {
        ...suggestions[suggestionForm.studentId],
        suggestion: suggestionForm.suggestion,
        career: suggestionForm.career,
        date: new Date().toISOString()
      }
    };

    setSuggestions(updatedSuggestions);
    localStorage.setItem("personalizedSuggestions", JSON.stringify(updatedSuggestions));
    setSuggestionForm({ studentId: "", suggestion: "", career: "" });
    alert("Personalized suggestion added successfully!");
  };

  const handleDeleteSuggestion = (studentId) => {
    const updatedSuggestions = { ...suggestions };
    delete updatedSuggestions[studentId];
    setSuggestions(updatedSuggestions);
    localStorage.setItem("personalizedSuggestions", JSON.stringify(updatedSuggestions));
  };



  const getStudentName = (email) => {
    const student = users.find(u => u.email === email);
    return student ? student.name : email;
  };

  const hasVisibleSubmissions = Object.entries(testSubmissions).some(([, submissions]) =>
    Object.values(submissions).some((submission) =>
      testAssignments.some((assignment) => assignment.id === Number(submission.assignmentId))
    )
  );

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

      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "2px solid #e2e8f0", overflowX: "auto" }}>
        <button
          onClick={() => setActiveTab("dashboard")}
          style={{
            padding: "10px 20px",
            background: activeTab === "dashboard" ? "#3182ce" : "transparent",
            color: activeTab === "dashboard" ? "white" : "#2d3748",
            border: "none",
            borderBottom: activeTab === "dashboard" ? "3px solid #3182ce" : "none",
            cursor: "pointer",
            fontWeight: "bold",
            whiteSpace: "nowrap"
          }}
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => setActiveTab("questions")}
          style={{
            padding: "10px 20px",
            background: activeTab === "questions" ? "#3182ce" : "transparent",
            color: activeTab === "questions" ? "white" : "#2d3748",
            border: "none",
            borderBottom: activeTab === "questions" ? "3px solid #3182ce" : "none",
            cursor: "pointer",
            fontWeight: "bold",
            whiteSpace: "nowrap"
          }}
        >
          ❓ Manage Questions
        </button>
        <button
          onClick={() => setActiveTab("assign")}
          style={{
            padding: "10px 20px",
            background: activeTab === "assign" ? "#3182ce" : "transparent",
            color: activeTab === "assign" ? "white" : "#2d3748",
            border: "none",
            borderBottom: activeTab === "assign" ? "3px solid #3182ce" : "none",
            cursor: "pointer",
            fontWeight: "bold",
            whiteSpace: "nowrap"
          }}
        >
          📝 Assign Tests
        </button>
        <button
          onClick={() => setActiveTab("suggestions")}
          style={{
            padding: "10px 20px",
            background: activeTab === "suggestions" ? "#3182ce" : "transparent",
            color: activeTab === "suggestions" ? "white" : "#2d3748",
            border: "none",
            borderBottom: activeTab === "suggestions" ? "3px solid #3182ce" : "none",
            cursor: "pointer",
            fontWeight: "bold",
            whiteSpace: "nowrap"
          }}
        >
          💡 Personalized Suggestions
        </button>
        <button
          onClick={() => setActiveTab("results")}
          style={{
            padding: "10px 20px",
            background: activeTab === "results" ? "#3182ce" : "transparent",
            color: activeTab === "results" ? "white" : "#2d3748",
            border: "none",
            borderBottom: activeTab === "results" ? "3px solid #3182ce" : "none",
            cursor: "pointer",
            fontWeight: "bold",
            whiteSpace: "nowrap"
          }}
        >
          📊 Test Results
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <>
          <div className="profile-stats">
            <div className="stat-card">
              <div className="stat-icon">👩‍🎓</div>
              <div className="stat-value">{users.length}</div>
              <div className="stat-label">Total Students</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">❓</div>
              <div className="stat-value">{questions.length}</div>
              <div className="stat-label">Total Questions</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-value">{testAssignments.length}</div>
              <div className="stat-label">Tests Assigned</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💡</div>
              <div className="stat-value">{Object.keys(suggestions).length}</div>
              <div className="stat-label">Suggestions Given</div>
            </div>
          </div>

          <div className="profile-section">
            <h3>Recent Test Assignments</h3>
            {testAssignments.length > 0 ? (
              <div className="history-list">
                {testAssignments.slice(-5).map((assignment) => (
                  <div key={assignment.id} className="history-item">
                    <div className="history-date">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </div>
                    <div className="history-details">
                      <strong>{getStudentName(assignment.studentId)}</strong>
                      <span className="history-score">
                        {assignment.questions.length} questions assigned
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No tests assigned yet.</p>
            )}
          </div>
        </>
      )}

      {/* Manage Questions Tab */}
      {activeTab === "questions" && (
        <div className="profile-section">
          <h3>Manage Assessment Questions</h3>
          
          <div style={{ background: "#f7fafc", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
            <h4>Add New Question</h4>
            
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Question Text</label>
              <textarea
                placeholder="Enter your question"
                value={newQuestion.text}
                onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #cbd5e0",
                  minHeight: "80px"
                }}
              />
            </div>

            {[0, 1, 2].map((index) => (
              <div key={index} style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
                  Option {index + 1}
                </label>
                <input
                  type="text"
                  placeholder={`Option ${index + 1} text`}
                  value={newQuestion.options[index]}
                  onChange={(e) => {
                    const updated = [...newQuestion.options];
                    updated[index] = e.target.value;
                    setNewQuestion({ ...newQuestion, options: updated });
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #cbd5e0"
                  }}
                />
              </div>
            ))}

            <button
              onClick={handleAddQuestion}
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
              Add Question
            </button>
          </div>

          <div style={{ background: "#f7fafc", padding: "20px", borderRadius: "8px" }}>
            <h4>Questions Library ({questions.length})</h4>
            {questions.length > 0 ? (
              <div>
                {questions.map((q, index) => (
                  <div key={q.id} style={{ padding: "15px", background: "white", marginBottom: "10px", borderRadius: "4px", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <div style={{ flex: 1 }}>
                        <strong>{index + 1}. {q.text}</strong>
                        <div style={{ marginTop: "8px", fontSize: "14px", color: "#718096" }}>
                          {q.options.map((opt, i) => (
                            <div key={i}>• {opt}</div>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        style={{
                          padding: "5px 10px",
                          background: "#f56565",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No questions added yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Assign Tests Tab */}
      {activeTab === "assign" && (
        <div className="profile-section">
          <h3>Assign Tests to Students</h3>
          
          <div style={{ background: "#f7fafc", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
            <h4>Create New Test Assignment</h4>
            
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Select Student</label>
              <select
                value={assignmentForm.studentId}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, studentId: e.target.value })}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #cbd5e0"
                }}
              >
                <option value="">Select a student</option>
                {users.map((user) => (
                  <option key={user.email} value={user.email}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Select Questions</label>
              <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #cbd5e0", borderRadius: "4px", padding: "10px" }}>
                {questions.length > 0 ? (
                  questions.map((q) => (
                    <label key={q.id} style={{ display: "block", marginBottom: "8px" }}>
                      <input
                        type="checkbox"
                        checked={assignmentForm.questions.includes(q.id)}
                        onChange={(e) => {
                          const updatedQuestions = e.target.checked
                            ? [...assignmentForm.questions, q.id]
                            : assignmentForm.questions.filter(qid => qid !== q.id);
                          setAssignmentForm({ ...assignmentForm, questions: updatedQuestions });
                        }}
                      />
                      {" "} {q.text}
                    </label>
                  ))
                ) : (
                  <p>No questions available. Please create questions first.</p>
                )}
              </div>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Due Date</label>
              <input
                type="date"
                value={assignmentForm.dueDate}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #cbd5e0"
                }}
              />
            </div>

            <button
              onClick={handleAssignTest}
              style={{
                padding: "10px 20px",
                background: "#3182ce",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              Assign Test
            </button>
          </div>

          <div style={{ background: "#f7fafc", padding: "20px", borderRadius: "8px" }}>
            <h4>Assigned Tests</h4>
            {testAssignments.length > 0 ? (
              <div>
                {testAssignments.map((assignment) => (
                  <div key={assignment.id} style={{ padding: "15px", background: "white", marginBottom: "10px", borderRadius: "4px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong>{getStudentName(assignment.studentId)}</strong>
                      <div style={{ fontSize: "14px", color: "#718096" }}>
                        {assignment.questions.length} questions • Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteAssignment(assignment.id)}
                      style={{
                        padding: "5px 10px",
                        background: "#f56565",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p>No tests assigned yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Personalized Suggestions Tab */}
      {activeTab === "suggestions" && (
        <div className="profile-section">
          <h3>Provide Personalized Career Suggestions</h3>
          
          <div style={{ background: "#f7fafc", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
            <h4>Add Personalized Suggestion</h4>
            
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Select Student</label>
              <select
                value={suggestionForm.studentId}
                onChange={(e) => setSuggestionForm({ ...suggestionForm, studentId: e.target.value })}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #cbd5e0"
                }}
              >
                <option value="">Select a student</option>
                {users.map((user) => (
                  <option key={user.email} value={user.email}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Career Path</label>
              <select
                value={suggestionForm.career}
                onChange={(e) => setSuggestionForm({ ...suggestionForm, career: e.target.value })}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #cbd5e0"
                }}
              >
                <option value="">Select a career</option>
                <option value="Software Developer">Software Developer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
                <option value="UX/UI Designer">UX/UI Designer</option>
                <option value="Product Manager">Product Manager</option>
                <option value="Project Manager">Project Manager</option>
                <option value="Human Resources Manager">Human Resources Manager</option>
                <option value="Business Analyst">Business Analyst</option>
                <option value="Marketing Manager">Marketing Manager</option>
                <option value="Solutions Architect">Solutions Architect</option>
              </select>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Personalized Suggestion</label>
              <textarea
                placeholder="Enter your personalized suggestion for this student..."
                value={suggestionForm.suggestion}
                onChange={(e) => setSuggestionForm({ ...suggestionForm, suggestion: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #cbd5e0",
                  minHeight: "100px"
                }}
              />
            </div>

            <button
              onClick={handleAddSuggestion}
              style={{
                padding: "10px 20px",
                background: "#9f7aea",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              Add Suggestion
            </button>
          </div>

          <div style={{ background: "#f7fafc", padding: "20px", borderRadius: "8px" }}>
            <h4>Suggestions Given</h4>
            {Object.keys(suggestions).length > 0 ? (
              <div>
                {Object.entries(suggestions).map(([studentId, data]) => (
                  <div key={studentId} style={{ padding: "15px", background: "white", marginBottom: "10px", borderRadius: "4px", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <div style={{ flex: 1 }}>
                        <strong>{getStudentName(studentId)}</strong>
                        <div style={{ fontSize: "14px", color: "#718096", marginTop: "5px" }}>
                          Career: <strong>{data.career}</strong>
                        </div>
                        <div style={{ fontSize: "14px", marginTop: "8px", background: "#edf2f7", padding: "10px", borderRadius: "4px" }}>
                          {data.suggestion}
                        </div>
                        <div style={{ fontSize: "12px", color: "#a0aec0", marginTop: "5px" }}>
                          Posted: {new Date(data.date).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteSuggestion(studentId)}
                        style={{
                          padding: "5px 10px",
                          background: "#f56565",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          marginLeft: "10px"
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No suggestions added yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Test Results Tab */}
      {activeTab === "results" && (
        <div className="profile-section">
          <h3>Student Test Submissions</h3>

          {!selectedSubmission ? (
            <>
              {hasVisibleSubmissions ? (
                <div>
                  {Object.entries(testSubmissions).map(([studentEmail, submissions]) => {
                    const student = users.find(u => u.email === studentEmail);
                    const validSubmissions = Object.entries(submissions).filter(([, submission]) =>
                      testAssignments.some((assignment) => assignment.id === Number(submission.assignmentId))
                    );

                    if (validSubmissions.length === 0) {
                      return null;
                    }

                    return (
                      <div key={studentEmail}>
                        <div style={{ padding: "15px", background: "#f7fafc", marginBottom: "10px", borderRadius: "4px", border: "1px solid #e2e8f0" }}>
                          <strong style={{ color: "#2d3748", display: "block", marginBottom: "10px" }}>
                            {student?.name || studentEmail}
                          </strong>
                          {validSubmissions.map(([submissionId, submission]) => {
                            const assignment = testAssignments.find(a => a.id === parseInt(submission.assignmentId));
                            return (
                              <button
                                key={submissionId}
                                onClick={() => setSelectedSubmission({ studentEmail, submission, assignment })}
                                style={{
                                  display: "block",
                                  width: "100%",
                                  padding: "10px",
                                  background: "white",
                                  border: "1px solid #cbd5e0",
                                  borderRadius: "4px",
                                  marginBottom: "8px",
                                  textAlign: "left",
                                  cursor: "pointer"
                                }}
                              >
                                <div style={{ fontSize: "14px", color: "#718096" }}>
                                  {assignment?.questions.length || 0} questions • Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-history">
                  <p>No test submissions yet.</p>
                </div>
              )}
            </>
          ) : (
            <div>
              <button
                onClick={() => setSelectedSubmission(null)}
                style={{
                  padding: "10px 20px",
                  background: "#cbd5e0",
                  color: "#2d3748",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  marginBottom: "20px"
                }}
              >
                ← Back to Submissions
              </button>

              <div style={{ background: "#f7fafc", padding: "20px", borderRadius: "8px" }}>
                <h4>{getStudentName(selectedSubmission.studentEmail)} - Test Submission Details</h4>
                <p style={{ color: "#718096", marginBottom: "20px" }}>
                  Submitted: {new Date(selectedSubmission.submission.submittedAt).toLocaleString()}
                </p>

                {selectedSubmission.assignment && selectedSubmission.assignment.questions.map((questionId, idx) => {
                  const question = questions.find(q => q.id === questionId);
                  const studentAnswer = selectedSubmission.submission.answers[questionId];

                  if (!question) return null;

                  return (
                    <div key={questionId} style={{ background: "white", padding: "15px", marginBottom: "15px", borderRadius: "4px", border: "1px solid #e2e8f0" }}>
                      <strong style={{ display: "block", marginBottom: "10px", color: "#2d3748" }}>
                        Q{idx + 1}. {question.text}
                      </strong>
                      <div style={{ marginLeft: "10px" }}>
                        {question.options.map((option, optIdx) => (
                          <div
                            key={optIdx}
                            style={{
                              padding: "8px",
                              marginBottom: "6px",
                              background: studentAnswer === optIdx ? "#c6f6d5" : "#edf2f7",
                              borderRadius: "4px",
                              border: studentAnswer === optIdx ? "2px solid #38a169" : "1px solid #cbd5e0"
                            }}
                          >
                            {studentAnswer === optIdx && "✓ "}
                            {option}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
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