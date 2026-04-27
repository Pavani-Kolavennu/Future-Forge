import { useOutletContext } from "react-router-dom";

function AdminResults() {
  const {
    users,
    questions,
    testAssignments,
    testSubmissions,
    selectedSubmission,
    setSelectedSubmission,
    hasVisibleSubmissions,
    getStudentName,
  } = useOutletContext();

  return (
    <div className="profile-section">
      <h3>Student Test Submissions</h3>

      {!selectedSubmission ? (
        <>
          {hasVisibleSubmissions ? (
            <div>
              {Object.entries(testSubmissions).map(([studentEmail, submissions]) => {
                const student = users.find((u) => u.email === studentEmail);
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
                        const assignment = testAssignments.find((assignmentItem) => assignmentItem.id === parseInt(submission.assignmentId));
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
              const question = questions.find((questionItem) => questionItem.id === questionId);
              const studentAnswer = Number(selectedSubmission.submission.answers[questionId]);

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
                          background: studentAnswer === optIdx ? "#bee3f8" : "#edf2f7",
                          borderRadius: "4px",
                          border: studentAnswer === optIdx ? "2px solid #3182ce" : "1px solid #cbd5e0"
                        }}
                      >
                        {studentAnswer === optIdx ? "Selected: " : ""}
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
  );
}

export default AdminResults;