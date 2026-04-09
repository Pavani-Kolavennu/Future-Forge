import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";
import { API_ENDPOINTS, apiDelete, apiGet, apiPost, apiRequest } from "../api/client";

function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Questions Management State
  const [questions, setQuestions] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [assessmentForm, setAssessmentForm] = useState({
    title: "",
    durationMinutes: "",
    passingScore: "",
  });
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    assessmentId: "",
    correctOptionIndex: "0",
    options: ["", "", ""]
  });

  // Test Assignment State
  const [testAssignments, setTestAssignments] = useState([]);
  const [assignmentForm, setAssignmentForm] = useState({
    studentId: "",
    assessmentId: "",
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

  const loadQuestions = async () => {
    const backendQuestions = await apiGet(API_ENDPOINTS.integration.adminQuestions);
    const normalizedQuestions = backendQuestions.map((q) => ({
      ...q,
      options: (q.options || []).map((option) =>
        typeof option === "string" ? option : option.text
      ),
    }));
    setQuestions(normalizedQuestions);
  };

  const loadAssessments = async () => {
    const backendAssessments = await apiGet(API_ENDPOINTS.integration.assessments);
    setAssessments(backendAssessments);
  };

  const loadAssignments = async () => {
    const backendAssignments = await apiGet(API_ENDPOINTS.integration.assignments);
    setTestAssignments(backendAssignments);
  };

  const loadSuggestions = async () => {
    const backendSuggestions = await apiGet(API_ENDPOINTS.integration.suggestions);
    setSuggestions(backendSuggestions);
  };

  const loadSubmissions = async () => {
    const backendSubmissions = await apiGet(API_ENDPOINTS.integration.submissions);
    setTestSubmissions(backendSubmissions);
  };

  const loadStudents = async () => {
    const allUsers = await apiRequest(API_ENDPOINTS.users.list);
    const studentsOnly = allUsers
      .filter((u) => u.role === "CANDIDATE")
      .map((u) => ({
        id: u.id,
        name: u.fullName,
        email: u.email,
        role: "student",
      }));
    setUsers(studentsOnly);
  };

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

    const loadAdminData = async () => {
      try {
        await Promise.all([
          loadStudents(),
          loadAssessments(),
          loadQuestions(),
          loadAssignments(),
          loadSuggestions(),
          loadSubmissions(),
        ]);
      } catch (err) {
        alert(err.message || "Unable to load dashboard data from backend");
      }
    };

    loadAdminData();

  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  // Question Management
  const handleAddQuestion = async () => {
    if (!newQuestion.assessmentId || !newQuestion.text || newQuestion.options.some(o => !o)) {
      alert("Please select an assessment and fill in all question fields");
      return;
    }

    const correctOptionIndex = Number(newQuestion.correctOptionIndex);
    if (Number.isNaN(correctOptionIndex) || correctOptionIndex < 0 || correctOptionIndex >= newQuestion.options.length) {
      alert("Please choose a valid correct answer");
      return;
    }

    try {
      const createdQuestion = await apiPost(API_ENDPOINTS.integration.adminQuestions, {
        assessmentId: Number(newQuestion.assessmentId),
        text: newQuestion.text,
        options: newQuestion.options,
        correctOptionIndex,
        active: true,
      });
      const updatedQuestions = [
        ...questions,
        {
          ...createdQuestion,
          options: (createdQuestion.options || []).map((option) =>
            typeof option === "string" ? option : option.text
          ),
        },
      ];
      setQuestions(updatedQuestions);
      setNewQuestion({ text: "", assessmentId: "", correctOptionIndex: "0", options: ["", "", ""] });
      alert("Question added successfully!");
    } catch (err) {
      alert(err.message || "Unable to add question right now");
    }
  };

  const handleAddAssessment = async () => {
    if (!assessmentForm.title) {
      alert("Please enter an assessment title");
      return;
    }

    try {
      const createdAssessment = await apiPost(API_ENDPOINTS.integration.createAssessment, {
        title: assessmentForm.title,
        durationMinutes: assessmentForm.durationMinutes ? Number(assessmentForm.durationMinutes) : null,
        passingScore: assessmentForm.passingScore ? Number(assessmentForm.passingScore) : null,
        active: true,
      });

      setAssessments([...assessments, createdAssessment]);
      setAssessmentForm({ title: "", durationMinutes: "", passingScore: "" });
      alert(`Assessment created successfully! ID: ${createdAssessment.id}`);
    } catch (err) {
      alert(err.message || "Unable to create assessment right now");
    }
  };

  const handleDeleteQuestion = async (id) => {
    try {
      await apiDelete(API_ENDPOINTS.integration.questionById(id));
      const updatedQuestions = questions.filter(q => q.id !== id);
      setQuestions(updatedQuestions);
    } catch (err) {
      alert(err.message || "Unable to delete question right now");
    }
  };

  // Test Assignment
  const handleAssignTest = async () => {
    if (!assignmentForm.studentId || !assignmentForm.assessmentId || assignmentForm.questions.length === 0 || !assignmentForm.dueDate) {
      alert("Please fill in all fields and select at least one question");
      return;
    }

    try {
      const assignment = await apiPost(API_ENDPOINTS.integration.assignments, {
        studentId: assignmentForm.studentId,
        assessmentId: Number(assignmentForm.assessmentId),
        questions: assignmentForm.questions,
        dueDate: assignmentForm.dueDate,
      });

      const updatedAssignments = [...testAssignments, assignment];
      setTestAssignments(updatedAssignments);
      setAssignmentForm({ studentId: "", assessmentId: "", questions: [], dueDate: "" });
      alert("Test assigned successfully!");
    } catch (err) {
      alert(err.message || "Unable to assign test right now");
    }
  };

  const handleDeleteAssignment = async (id) => {
    try {
      await apiDelete(API_ENDPOINTS.integration.assignmentById(id));

      const updatedAssignments = testAssignments.filter(a => a.id !== id);
      setTestAssignments(updatedAssignments);

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

      if (selectedSubmission && Number(selectedSubmission.submission.assignmentId) === id) {
        setSelectedSubmission(null);
      }
    } catch (err) {
      alert(err.message || "Unable to delete assignment right now");
    }
  };

  // Personalized Suggestions
  const handleAddSuggestion = async () => {
    if (!suggestionForm.studentId || !suggestionForm.suggestion || !suggestionForm.career) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const createdSuggestion = await apiPost(API_ENDPOINTS.integration.suggestions, {
        studentId: suggestionForm.studentId,
        suggestion: suggestionForm.suggestion,
        career: suggestionForm.career,
      });

      const updatedSuggestions = {
        ...suggestions,
        [suggestionForm.studentId]: {
          suggestion: createdSuggestion.suggestion,
          career: createdSuggestion.career,
          date: createdSuggestion.date,
        }
      };

      setSuggestions(updatedSuggestions);
      setSuggestionForm({ studentId: "", suggestion: "", career: "" });
      alert("Personalized suggestion added successfully!");
    } catch (err) {
      alert(err.message || "Unable to add suggestion right now");
    }
  };

  const handleDeleteSuggestion = async (studentId) => {
    try {
      await apiDelete(API_ENDPOINTS.integration.suggestionByStudent(studentId));
      const updatedSuggestions = { ...suggestions };
      delete updatedSuggestions[studentId];
      setSuggestions(updatedSuggestions);
    } catch (err) {
      alert(err.message || "Unable to delete suggestion right now");
    }
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

  const selectedAssessmentQuestions = assignmentForm.assessmentId
    ? questions.filter((question) => Number(question.assessmentId) === Number(assignmentForm.assessmentId))
    : [];

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
            <h4>Create Assessment</h4>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Assessment Title</label>
              <input
                type="text"
                value={assessmentForm.title}
                onChange={(e) => setAssessmentForm({ ...assessmentForm, title: e.target.value })}
                placeholder="Enter assessment title"
                style={{ display: "block", width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e0" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "15px", marginBottom: "15px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Duration Minutes</label>
                <input
                  type="number"
                  min="1"
                  value={assessmentForm.durationMinutes}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, durationMinutes: e.target.value })}
                  placeholder="Optional"
                  style={{ display: "block", width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e0" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Passing Score</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={assessmentForm.passingScore}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, passingScore: e.target.value })}
                  placeholder="Optional"
                  style={{ display: "block", width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e0" }}
                />
              </div>
            </div>

            <button
              onClick={handleAddAssessment}
              style={{ padding: "10px 20px", background: "#805ad5", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
            >
              Create Assessment
            </button>
          </div>

          <div style={{ background: "#f7fafc", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
            <h4>Available Assessments</h4>
            {assessments.length > 0 ? (
              <div>
                {assessments.map((assessment) => (
                  <div key={assessment.id} style={{ padding: "12px", background: "white", marginBottom: "8px", borderRadius: "4px", border: "1px solid #e2e8f0" }}>
                    <strong>{assessment.title}</strong>
                    <div style={{ fontSize: "14px", color: "#718096" }}>
                      ID: {assessment.id}
                      {assessment.durationMinutes ? ` • ${assessment.durationMinutes} min` : ""}
                      {assessment.passingScore != null ? ` • Passing ${assessment.passingScore}%` : ""}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No assessments created yet. Create one first, then add questions to it.</p>
            )}
          </div>
          
          <div style={{ background: "#f7fafc", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
            <h4>Add New Question</h4>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Assessment</label>
              <select
                value={newQuestion.assessmentId}
                onChange={(e) => setNewQuestion({ ...newQuestion, assessmentId: e.target.value })}
                style={{ display: "block", width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e0" }}
              >
                <option value="">Select an assessment</option>
                {assessments.map((assessment) => (
                  <option key={assessment.id} value={assessment.id}>
                    {assessment.title} (ID: {assessment.id})
                  </option>
                ))}
              </select>
            </div>
            
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

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Correct Answer</label>
              <select
                value={newQuestion.correctOptionIndex}
                onChange={(e) => setNewQuestion({ ...newQuestion, correctOptionIndex: e.target.value })}
                style={{ display: "block", width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e0" }}
              >
                {[0, 1, 2].map((index) => (
                  <option key={index} value={index}>
                    Option {index + 1}
                  </option>
                ))}
              </select>
            </div>

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
                          <div style={{ marginTop: "4px", fontSize: "12px", color: "#a0aec0" }}>
                            Assessment ID: {q.assessmentId}
                          </div>
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
                {assignmentForm.assessmentId ? (
                  selectedAssessmentQuestions.length > 0 ? (
                    selectedAssessmentQuestions.map((q) => (
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
                    <p>No questions exist for this assessment yet. Create questions first.</p>
                  )
                ) : (
                  <p>Select an assessment to see its questions.</p>
                )}
              </div>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Assessment</label>
              <select
                value={assignmentForm.assessmentId}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, assessmentId: e.target.value, questions: [] })}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #cbd5e0"
                }}
              >
                <option value="">Select an assessment</option>
                {assessments.map((assessment) => (
                  <option key={assessment.id} value={assessment.id}>
                    {assessment.title} (ID: {assessment.id})
                  </option>
                ))}
              </select>
              {assessments.length === 0 && (
                <p style={{ marginTop: "8px", color: "#b7791f" }}>
                  Create an assessment first before assigning tests.
                </p>
              )}
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