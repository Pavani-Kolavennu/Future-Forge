import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/Home.css";

function Home() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    setCurrentUser(user ? JSON.parse(user) : null);
  }, []);

  return (
    <div className="home-container">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Discover Your Perfect Career Path</h1>
          <p className="hero-subtitle">
            Get assigned tests, track progress, and receive personalized career suggestions from your admin.
          </p>
          <div className="hero-buttons">
            <Link
              to={currentUser?.role === "admin" ? "/admin/dashboard" : currentUser ? "/profile" : "/register"}
              className="btn btn-primary"
            >
              {currentUser?.role === "admin" ? "Go to Admin Dashboard" : currentUser ? "Open Your Dashboard" : "Get Started"}
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <img src="/planning-image.jpg" alt="Career Planning" className="diagram-image" />
        </div>
      </section>

      <section className="features">
        <h2 className="section-title">Why Choose CareerPath?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3>Assigned Tests</h3>
            <p>Take admin-assigned tests with due dates and clear question sets.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💼</div>
            <h3>Skills Evaluation</h3>
            <p>Measure your knowledge through structured test submissions.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Career Recommendations</h3>
            <p>Receive personalized suggestions directly from admins based on your performance.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Progress Tracking</h3>
            <p>Track submission status and stay on top of upcoming deadlines.</p>
          </div>
        </div>
      </section>

    
      <section className="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Account</h3>
            <p>Register or login to your CareerPath account to get started.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Take Assigned Test</h3>
            <p>Complete questions assigned by your admin before due dates.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Submit Answers</h3>
            <p>Submit your test and view completion status in your profile.</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Get Guidance</h3>
            <p>Review personalized suggestions shared by the admin.</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>Ready to Find Your Dream Career?</h2>
        <p>Open your dashboard and continue your guided career journey.</p>
        <Link
          to={currentUser?.role === "admin" ? "/admin/dashboard" : currentUser ? "/profile" : "/register"}
          className="btn btn-large"
        >
          {currentUser?.role === "admin" ? "Open Admin Dashboard" : currentUser ? "Go to Profile" : "Create Account"}
        </Link>
      </section>
    </div>
  );
}

export default Home;