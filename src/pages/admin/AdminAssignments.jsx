import { useOutletContext } from "react-router-dom";

function AdminAssignments() {
  const {
    users,
    assessments,
    assignmentForm,
    setAssignmentForm,
    selectedAssessmentQuestions,
    testAssignments,
    handleAssignTest,
    handleDeleteAssignment,
    getStudentName,
  } = useOutletContext();

  return (
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
                          : assignmentForm.questions.filter((qid) => qid !== q.id);
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
  );
}

export default AdminAssignments;