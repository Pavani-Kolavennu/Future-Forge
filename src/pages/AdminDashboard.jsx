import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../styles/Profile.css";
import { API_ENDPOINTS, apiDelete, apiGet, apiPost, apiRequest } from "../api/client";

function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  
  // Questions Management State
  const [questions, setQuestions] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [assessmentForm, setAssessmentForm] = useState({
    title: "",
  });
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    assessmentId: "",
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

    try {
      const createdQuestion = await apiPost(API_ENDPOINTS.integration.adminQuestions, {
        assessmentId: Number(newQuestion.assessmentId),
        text: newQuestion.text,
        options: newQuestion.options,
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
      setNewQuestion({ text: "", assessmentId: "", options: ["", "", ""] });
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
        active: true,
      });

      setAssessments([...assessments, createdAssessment]);
      setAssessmentForm({ title: "" });
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

  if (!admin) return null;

  const adminContext = {
    admin,
    users,
    questions,
    assessments,
    assessmentForm,
    setAssessmentForm,
    newQuestion,
    setNewQuestion,
    testAssignments,
    assignmentForm,
    setAssignmentForm,
    suggestions,
    suggestionForm,
    setSuggestionForm,
    testSubmissions,
    selectedSubmission,
    setSelectedSubmission,
    getStudentName,
    selectedAssessmentQuestions: assignmentForm.assessmentId
      ? questions.filter((question) => Number(question.assessmentId) === Number(assignmentForm.assessmentId))
      : [],
    hasVisibleSubmissions,
    handleAddAssessment,
    handleAddQuestion,
    handleDeleteQuestion,
    handleAssignTest,
    handleDeleteAssignment,
    handleAddSuggestion,
    handleDeleteSuggestion,
  };

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

      {/* Page Navigation */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "2px solid #e2e8f0", overflowX: "auto" }}>
        <NavLink to="dashboard" style={({ isActive }) => ({
          padding: "10px 20px",
          background: isActive ? "#3182ce" : "transparent",
          color: isActive ? "white" : "#2d3748",
          border: "none",
          borderBottom: isActive ? "3px solid #3182ce" : "none",
          cursor: "pointer",
          fontWeight: "bold",
          whiteSpace: "nowrap",
          textDecoration: "none"
        })}>
          📊 Dashboard
        </NavLink>
        <NavLink to="questions" style={({ isActive }) => ({
          padding: "10px 20px",
          background: isActive ? "#3182ce" : "transparent",
          color: isActive ? "white" : "#2d3748",
          border: "none",
          borderBottom: isActive ? "3px solid #3182ce" : "none",
          cursor: "pointer",
          fontWeight: "bold",
          whiteSpace: "nowrap",
          textDecoration: "none"
        })}>
          ❓ Manage Questions
        </NavLink>
        <NavLink to="assignments" style={({ isActive }) => ({
          padding: "10px 20px",
          background: isActive ? "#3182ce" : "transparent",
          color: isActive ? "white" : "#2d3748",
          border: "none",
          borderBottom: isActive ? "3px solid #3182ce" : "none",
          cursor: "pointer",
          fontWeight: "bold",
          whiteSpace: "nowrap",
          textDecoration: "none"
        })}>
          📝 Assign Tests
        </NavLink>
        <NavLink to="suggestions" style={({ isActive }) => ({
          padding: "10px 20px",
          background: isActive ? "#3182ce" : "transparent",
          color: isActive ? "white" : "#2d3748",
          border: "none",
          borderBottom: isActive ? "3px solid #3182ce" : "none",
          cursor: "pointer",
          fontWeight: "bold",
          whiteSpace: "nowrap",
          textDecoration: "none"
        })}>
          💡 Personalized Suggestions
        </NavLink>
        <NavLink to="results" style={({ isActive }) => ({
          padding: "10px 20px",
          background: isActive ? "#3182ce" : "transparent",
          color: isActive ? "white" : "#2d3748",
          border: "none",
          borderBottom: isActive ? "3px solid #3182ce" : "none",
          cursor: "pointer",
          fontWeight: "bold",
          whiteSpace: "nowrap",
          textDecoration: "none"
        })}>
          📊 Test Results
        </NavLink>
      </div>

      <Outlet context={adminContext} />

      <div style={{ marginTop: "40px", textAlign: "center" }}>
        <button onClick={handleLogout} className="btn btn-logout">
          Logout
        </button>
      </div>
    </div>
  );
}

export default AdminDashboard;