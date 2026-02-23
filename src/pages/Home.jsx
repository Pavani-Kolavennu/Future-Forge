import { Link } from "react-router-dom";
import "../styles/Home.css";

function Home() {
  return (
    <div className="home-container">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Discover Your Perfect Career Path</h1>
          <p className="hero-subtitle">
            Take our comprehensive career assessment to understand your strengths, interests, and find the ideal career for you.
          </p>
          <div className="hero-buttons">
            <Link to="/assessment" className="btn btn-primary">
              Start Assessment
            </Link>
            <Link to="/register" className="btn btn-secondary">
              Get Started
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
            <h3>Personality Assessment</h3>
            <p>Discover your personality type and how it aligns with various career paths.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💼</div>
            <h3>Skills Evaluation</h3>
            <p>Evaluate your technical and soft skills to identify areas for development.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Career Recommendations</h3>
            <p>Get personalized career recommendations based on your assessment results.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Progress Tracking</h3>
            <p>Track your assessment history and career development over time.</p>
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
            <h3>Take Assessment</h3>
            <p>Complete our comprehensive career assessment questionnaire.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Get Results</h3>
            <p>Receive detailed results and career recommendations tailored to you.</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Explore Careers</h3>
            <p>Explore career options with insights to guide your decisions.</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>Ready to Find Your Dream Career?</h2>
        <p>Start your career assessment journey today and unlock your potential.</p>
        <Link to="/assessment" className="btn btn-large">
          Take Assessment Now
        </Link>
      </section>
    </div>
  );
}

export default Home;