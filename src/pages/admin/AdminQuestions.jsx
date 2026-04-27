import { useOutletContext } from "react-router-dom";

function AdminQuestions() {
  const {
    assessments,
    assessmentForm,
    setAssessmentForm,
    newQuestion,
    setNewQuestion,
    questions,
    handleAddAssessment,
    handleAddQuestion,
    handleDeleteQuestion,
  } = useOutletContext();

  return (
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
  );
}

export default AdminQuestions;