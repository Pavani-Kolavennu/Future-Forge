import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "../styles/Assessment.css";

function Assessment() {
  const navigate = useNavigate();

  // 🔒 Protect Assessment Page
  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      alert("Please login or register to take the assessment.");
      navigate("/login");
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const q1 = document.querySelector('input[name="q1"]:checked')?.id;
    const q2 = document.querySelector('input[name="q2"]:checked')?.id;
    const q3 = document.querySelector('input[name="q3"]:checked')?.id;
    const q4 = document.querySelector('input[name="q4"]:checked')?.id;

    if (!q1 || !q2 || !q3 || !q4) {
      alert("Please answer all questions");
      return;
    }

    let dev = 0;
    let hr = 0;
    let design = 0;

    // Question 1
    if (q1.includes("a")) hr++;
    if (q1.includes("b")) dev++;
    if (q1.includes("c")) design++;

    // Question 2
    if (q2.includes("a")) hr++;
    if (q2.includes("b")) dev++;
    if (q2.includes("c")) design++;

    // Question 3
    if (q3.includes("a")) dev++;
    if (q3.includes("b")) hr++;
    if (q3.includes("c")) design++;

    // Question 4
    if (q4.includes("a")) hr++;
    if (q4.includes("b")) dev++;
    if (q4.includes("c")) dev++;

    let career = "Software Developer";
    let score = 75;

    if (hr >= dev && hr >= design) {
      career = "Human Resources Manager";
      score = 80;
    } else if (design >= dev && design >= hr) {
      career = "UX/UI Designer";
      score = 85;
    } else {
      career = "Software Developer";
      score = 90;
    }

    const resultData = {
      career,
      score,
      date: new Date().toISOString()
    };

    localStorage.setItem("latestAssessment", JSON.stringify(resultData));

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser) {
      const history = JSON.parse(localStorage.getItem("assessmentHistory") || "[]");

      history.push({
        ...resultData,
        userId: currentUser.email
      });

      localStorage.setItem("assessmentHistory", JSON.stringify(history));
    }

    navigate("/result");
  };

  return (
    <div className="assessment-container">
      <h2>🎯 Career Assessment</h2>

      <form onSubmit={handleSubmit}>
        <div className="question-section">
          <div className="question-text">1. Which activity interests you the most?</div>
          <div className="option">
            <input type="radio" id="q1-a" name="q1" required />
            <label htmlFor="q1-a">Working with people / Communication</label>
          </div>
          <div className="option">
            <input type="radio" id="q1-b" name="q1" />
            <label htmlFor="q1-b">Problem solving / Analysis</label>
          </div>
          <div className="option">
            <input type="radio" id="q1-c" name="q1" />
            <label htmlFor="q1-c">Creative work / Design</label>
          </div>
        </div>

        <div className="question-section">
          <div className="question-text">2. What is your preferred work environment?</div>
          <div className="option">
            <input type="radio" id="q2-a" name="q2" required />
            <label htmlFor="q2-a">Office / Structured</label>
          </div>
          <div className="option">
            <input type="radio" id="q2-b" name="q2" />
            <label htmlFor="q2-b">Remote / Flexible</label>
          </div>
          <div className="option">
            <input type="radio" id="q2-c" name="q2" />
            <label htmlFor="q2-c">Field / Outdoor</label>
          </div>
        </div>

        <div className="question-section">
          <div className="question-text">3. What is your strongest skill?</div>
          <div className="option">
            <input type="radio" id="q3-a" name="q3" required />
            <label htmlFor="q3-a">Technical / Programming</label>
          </div>
          <div className="option">
            <input type="radio" id="q3-b" name="q3" />
            <label htmlFor="q3-b">Leadership / Management</label>
          </div>
          <div className="option">
            <input type="radio" id="q3-c" name="q3" />
            <label htmlFor="q3-c">Communication / Sales</label>
          </div>
        </div>

        <div className="question-section">
          <div className="question-text">4. What salary range are you aiming for?</div>
          <div className="option">
            <input type="radio" id="q4-a" name="q4" required />
            <label htmlFor="q4-a">$40,000 - $60,000</label>
          </div>
          <div className="option">
            <input type="radio" id="q4-b" name="q4" />
            <label htmlFor="q4-b">$60,000 - $100,000</label>
          </div>
          <div className="option">
            <input type="radio" id="q4-c" name="q4" />
            <label htmlFor="q4-c">$100,000+</label>
          </div>
        </div>

        <button type="submit" className="assessment-submit">
          Submit Assessment
        </button>
      </form>
    </div>
  );
}

export default Assessment;