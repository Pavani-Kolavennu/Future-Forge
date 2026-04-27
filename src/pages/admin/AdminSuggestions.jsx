import { useOutletContext } from "react-router-dom";

function AdminSuggestions() {
  const {
    users,
    suggestions,
    suggestionForm,
    setSuggestionForm,
    handleAddSuggestion,
    handleDeleteSuggestion,
    getStudentName,
  } = useOutletContext();

  return (
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
  );
}

export default AdminSuggestions;