import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/Result.css";
import { API_ENDPOINTS, apiGet } from "../api/client";

function Result() {
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const loadResult = async () => {
      if (location.state?.career && location.state?.score != null) {
        setResult(location.state);
        return;
      }

      const currentUserRaw = localStorage.getItem("currentUser");
      if (!currentUserRaw) {
        alert("No assessment found. Please take an assessment first.");
        navigate("/assessment");
        return;
      }

      try {
        const currentUser = JSON.parse(currentUserRaw);
        const history = await apiGet(API_ENDPOINTS.integration.assessmentHistoryByStudent(currentUser.email));
        if (!history.length) {
          alert("No assessment found. Please take an assessment first.");
          navigate("/assessment");
          return;
        }

        const latest = [...history].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        setResult(latest);
      } catch {
        alert("Unable to load assessment result");
        navigate("/assessment");
      }
    };

    loadResult();
  }, [location.state, navigate]);

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
    "Data Scientist": [
      { title: "Machine Learning Engineer", description: "Develop and deploy ML models. Perfect for those passionate about AI and statistics." },
      { title: "Analytics Engineer", description: "Build data pipelines and analytics platforms. Great for those who love data infrastructure." },
      { title: "Business Intelligence Analyst", description: "Transform data into actionable business insights. Ideal for data-driven decision makers." },
      { title: "Data Engineer", description: "Build and maintain data infrastructure. Perfect for those interested in big data technologies." },
      { title: "Research Scientist", description: "Conduct advanced research and develop new algorithms. Ideal for academic-minded professionals." }
    ],
    "DevOps Engineer": [
      { title: "Cloud Architect", description: "Design cloud infrastructure solutions. Perfect for those interested in large-scale systems." },
      { title: "Infrastructure Engineer", description: "Manage and optimize infrastructure. Great for those who love system administration." },
      { title: "Site Reliability Engineer", description: "Ensure system reliability and performance. Ideal for detail-oriented problem solvers." }
    ],
    "UX/UI Designer": [
      { title: "Product Designer", description: "Design end-to-end product experiences. Combines creativity with user research." },
      { title: "Interaction Designer", description: "Create engaging user interactions. Perfect for detail-oriented creative thinkers." },
      { title: "Visual Designer", description: "Focus on aesthetics and brand identity. Great for those with a strong visual sense." },
      { title: "Design System Architect", description: "Build scalable design frameworks. Combines design with systematic thinking." },
      { title: "UX Researcher", description: "Understand user needs through research. Ideal for analytical creatives." }
    ],
    "Product Manager": [
      { title: "Senior Product Manager", description: "Lead product strategy and vision. Perfect for those with strategic mindset." },
      { title: "Technical Product Manager", description: "Bridge product and engineering. Great for those with technical background." },
      { title: "Product Strategist", description: "Shape long-term product direction. Ideal for visionary thinkers." }
    ],
    "Project Manager": [
      { title: "Scrum Master", description: "Facilitate agile processes and team collaboration. Perfect for those who love facilitation." },
      { title: "Program Manager", description: "Oversee multiple related projects. Great for those managing complexity at scale." },
      { title: "Technical Program Manager", description: "Manage technical projects and initiatives. Ideal for those with technical background." }
    ],
    "Human Resources Manager": [
      { title: "Talent Acquisition Specialist", description: "Find and recruit top talent. Perfect for your people skills and communication abilities." },
      { title: "HR Business Partner", description: "Strategic HR leadership role. Combines people management with business acumen." }
    ],
    "Business Analyst": [
      { title: "Senior Business Analyst", description: "Lead requirements and analysis efforts. Perfect for those with strategic mindset." },
      { title: "Systems Analyst", description: "Analyze and improve business systems. Great for technical analysts." }
    ],
    "Marketing Manager": [
      { title: "Product Marketing Manager", description: "Market and position products. Perfect for those who love product focus." },
      { title: "Content Marketing Manager", description: "Create and manage marketing content. Great for those who love storytelling." },
      { title: "Digital Marketing Manager", description: "Manage digital marketing campaigns. Ideal for those interested in digital channels." },
      { title: "Social Media Manager", description: "Build and manage social media presence. Perfect for those who love social platforms." },
      { title: "Growth Marketing Manager", description: "Drive user acquisition and growth. Ideal for those interested in scaling." }
    ],
    "Solutions Architect": [
      { title: "Enterprise Architect", description: "Design enterprise-scale solutions. Perfect for those thinking at scale." },
      { title: "Cloud Architect", description: "Design cloud-based solutions. Great for those interested in cloud platforms." },
      { title: "Security Architect", description: "Design secure systems and infrastructure. Ideal for those focused on security." },
      { title: "System Architect", description: "Design complex technical systems. Perfect for those with broad technical knowledge." },
      { title: "Technology Strategist", description: "Advise on technology strategy. Ideal for visionary technologists." }
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
        <h3>🎯 Top 10 Career Recommendations</h3>

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