import { useOutletContext } from "react-router-dom";

function AdminOverview() {
  const { users, questions, testAssignments, suggestions, getStudentName } = useOutletContext();

  return (
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
  );
}

export default AdminOverview;