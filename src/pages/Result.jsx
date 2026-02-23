import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Result.css";

function Result() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  useEffect(() => {
    // Get latest assessment result
    const latestAssessment = localStorage.getItem("latestAssessment");
    
    if (!latestAssessment) {
      alert("No assessment found. Please take an assessment first.");
      navigate("/assessment");
      return;
    }

    const assessment = JSON.parse(latestAssessment);
    setResult(assessment);
  }, [navigate]);

  if (!result) {
    return null;
  }

  // Career recommendations based on primary career
  const careerRecommendations = {
    "Software Developer": [
      { title: "Full Stack Developer", description: "Build complete web applications. Matches your problem-solving skills and interest in technology." },
      { title: "Data Scientist", description: "Analyze complex data and create insights. Ideal for your analytical mindset and technical background." },
      { title: "DevOps Engineer", description: "Manage infrastructure and deployments. Great for those who enjoy problem-solving at scale." },
      { title: "Solutions Architect", description: "Design technical solutions for clients. Combines technical expertise with client interaction." },
      { title: "Machine Learning Engineer", description: "Work on cutting-edge AI/ML solutions. Perfect for those passionate about innovation and technology." }
    ],
    "Human Resources Manager": [
      { title: "Talent Acquisition Specialist", description: "Find and recruit top talent. Perfect for your people skills and communication abilities." },
      { title: "HR Business Partner", description: "Strategic HR leadership role. Combines people management with business acumen." },
      { title: "Training & Development Manager", description: "Develop employee skills and growth programs. Great for those who enjoy coaching and mentoring." },
      { title: "Organizational Development Consultant", description: "Help organizations improve performance. Ideal for strategic thinkers with people skills." },
      { title: "Employee Relations Manager", description: "Handle workplace relationships and conflicts. Perfect for strong communicators." }
    ],
    "UX/UI Designer": [
      { title: "Product Designer", description: "Design end-to-end product experiences. Combines creativity with user research." },
      { title: "Interaction Designer", description: "Create engaging user interactions. Perfect for detail-oriented creative thinkers." },
      { title: "Visual Designer", description: "Focus on aesthetics and brand identity. Great for those with a strong visual sense." },
      { title: "Design System Architect", description: "Build scalable design frameworks. Combines design with systematic thinking." },
      { title: "UX Researcher", description: "Understand user needs through research. Ideal for analytical creatives." }
    ]
  };

  const recommendations = careerRecommendations[result.career] || careerRecommendations["Software Developer"];

  return (
    <div className="result-container">
      <h2>📊 Your Assessment Results</h2>

      <div className="result-intro">
        <p>Based on your responses, here are your personalized career recommendations.</p>
      </div>

      <div className="result-card">
        <h3>Your Primary Career Path</h3>
        <p className="result-value">{result.career}</p>
        <p className="result-description">
          Your responses indicate this career path aligns well with your skills, interests, and goals.
        </p>
      </div>

      <div className="result-card">
        <h3>Compatibility Score</h3>
        <p className="result-value">{result.score}%</p>
        <p className="result-description">
          This career aligns excellently with your skills, interests, and preferences.
        </p>
      </div>

      <div className="recommendations">
        <h3>🎯 Top 5 Career Recommendations</h3>

        {recommendations.map((rec, index) => (
          <div key={index} className="recommendation-item">
            <h4>{index + 1}. {rec.title}</h4>
            <p>{rec.description}</p>
          </div>
        ))}
      </div>

      <div style={{ background: "#f7fafc", padding: "2rem", borderRadius: "12px", marginBottom: "2rem" }}>
        <h3 style={{ color: "#2d3748", marginBottom: "1rem" }}>💡 Next Steps</h3>
        <ul style={{ color: "#718096", paddingLeft: "1.5rem", lineHeight: "1.8", margin: 0 }}>
          <li>Explore job descriptions for recommended careers</li>
          <li>Identify required skills and certifications</li>
          <li>Start learning through online courses or bootcamps</li>
          <li>Network with professionals in your target field</li>
          <li>Build a portfolio of projects to showcase your skills</li>
        </ul>
      </div>

      <div className="result-actions">
        <Link to="/assessment" className="result-btn result-btn-primary">
          Retake Assessment
        </Link>
        <Link to="/" className="result-btn result-btn-secondary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default Result;