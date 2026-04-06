import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "../styles/Assessment.css";
import { API_ENDPOINTS, apiPost } from "../api/client";

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const q1 = document.querySelector('input[name="q1"]:checked')?.id;
    const q2 = document.querySelector('input[name="q2"]:checked')?.id;
    const q3 = document.querySelector('input[name="q3"]:checked')?.id;
    const q4 = document.querySelector('input[name="q4"]:checked')?.id;
    const q5 = document.querySelector('input[name="q5"]:checked')?.id;
    const q6 = document.querySelector('input[name="q6"]:checked')?.id;
    const q7 = document.querySelector('input[name="q7"]:checked')?.id;
    const q8 = document.querySelector('input[name="q8"]:checked')?.id;
    const q9 = document.querySelector('input[name="q9"]:checked')?.id;
    const q10 = document.querySelector('input[name="q10"]:checked')?.id;

    if (!q1 || !q2 || !q3 || !q4 || !q5 || !q6 || !q7 || !q8 || !q9 || !q10) {
      alert("Please answer all questions");
      return;
    }

    let scores = {
      "Software Developer": 0,
      "Data Scientist": 0,
      "DevOps Engineer": 0,
      "UX/UI Designer": 0,
      "Product Manager": 0,
      "Project Manager": 0,
      "Human Resources Manager": 0,
      "Business Analyst": 0,
      "Marketing Manager": 0,
      "Solutions Architect": 0
    };

    // Question 1
    if (q1.includes("a")) scores["Human Resources Manager"]++;
    if (q1.includes("b")) scores["Software Developer"]++;
    if (q1.includes("c")) scores["UX/UI Designer"]++;

    // Question 2
    if (q2.includes("a")) {
      scores["Project Manager"]++;
      scores["Business Analyst"]++;
    }
    if (q2.includes("b")) {
      scores["Software Developer"]++;
      scores["Data Scientist"]++;
    }
    if (q2.includes("c")) scores["Marketing Manager"]++;

    // Question 3
    if (q3.includes("a")) {
      scores["Software Developer"]++;
      scores["DevOps Engineer"]++;
    }
    if (q3.includes("b")) {
      scores["Human Resources Manager"]++;
      scores["Project Manager"]++;
    }
    if (q3.includes("c")) scores["UX/UI Designer"]++;

    // Question 4
    if (q4.includes("a")) scores["Business Analyst"]++;
    if (q4.includes("b")) {
      scores["Software Developer"]++;
      scores["Product Manager"]++;
    }
    if (q4.includes("c")) {
      scores["Data Scientist"]++;
      scores["Solutions Architect"]++;
    }

    // Question 5
    if (q5.includes("a")) scores["UX/UI Designer"]++;
    if (q5.includes("b")) {
      scores["Software Developer"]++;
      scores["DevOps Engineer"]++;
    }
    if (q5.includes("c")) {
      scores["Human Resources Manager"]++;
      scores["Project Manager"]++;
    }

    // Question 6
    if (q6.includes("a")) {
      scores["Software Developer"]++;
      scores["DevOps Engineer"]++;
    }
    if (q6.includes("b")) {
      scores["Human Resources Manager"]++;
      scores["Marketing Manager"]++;
    }
    if (q6.includes("c")) {
      scores["UX/UI Designer"]++;
      scores["Product Manager"]++;
    }

    // Question 7
    if (q7.includes("a")) scores["Human Resources Manager"]++;
    if (q7.includes("b")) scores["UX/UI Designer"]++;
    if (q7.includes("c")) {
      scores["Software Developer"]++;
      scores["Product Manager"]++;
    }

    // Question 8
    if (q8.includes("a")) scores["UX/UI Designer"]++;
    if (q8.includes("b")) {
      scores["Software Developer"]++;
      scores["Data Scientist"]++;
    }
    if (q8.includes("c")) {
      scores["Human Resources Manager"]++;
      scores["Project Manager"]++;
    }

    // Question 9
    if (q9.includes("a")) {
      scores["Human Resources Manager"]++;
      scores["Project Manager"]++;
    }
    if (q9.includes("b")) {
      scores["Software Developer"]++;
      scores["Product Manager"]++;
    }
    if (q9.includes("c")) {
      scores["UX/UI Designer"]++;
      scores["Marketing Manager"]++;
    }

    // Question 10
    if (q10.includes("a")) {
      scores["Software Developer"]++;
      scores["Solutions Architect"]++;
    }
    if (q10.includes("b")) {
      scores["Human Resources Manager"]++;
      scores["Project Manager"]++;
    }
    if (q10.includes("c")) {
      scores["UX/UI Designer"]++;
      scores["Product Manager"]++;
    }

    // Find the career with the highest score
    let career = "Software Developer";
    let score = 75;
    let maxScore = 0;

    for (let [careerName, careerScore] of Object.entries(scores)) {
      if (careerScore > maxScore) {
        maxScore = careerScore;
        career = careerName;
        score = 70 + Math.min(maxScore * 2, 30);
      }
    }

    const resultData = {
      career,
      score,
      date: new Date().toISOString()
    };

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser) {
      try {
        await apiPost(API_ENDPOINTS.integration.assessmentHistory, {
          userId: currentUser.email,
          career: resultData.career,
          score: resultData.score,
          date: resultData.date,
        });
      } catch (err) {
        alert(err.message || "Unable to save your assessment result");
        return;
      }
    }

    navigate("/result", { state: resultData });
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

        <div className="question-section">
          <div className="question-text">5. Do you prefer working independently or in teams?</div>
          <div className="option">
            <input type="radio" id="q5-a" name="q5" required />
            <label htmlFor="q5-a">Creative/Visual design</label>
          </div>
          <div className="option">
            <input type="radio" id="q5-b" name="q5" />
            <label htmlFor="q5-b">Building systems/Code</label>
          </div>
          <div className="option">
            <input type="radio" id="q5-c" name="q5" />
            <label htmlFor="q5-c">Team collaboration/Management</label>
          </div>
        </div>

        <div className="question-section">
          <div className="question-text">6. What type of feedback do you respond to best?</div>
          <div className="option">
            <input type="radio" id="q6-a" name="q6" required />
            <label htmlFor="q6-a">Technical performance metrics</label>
          </div>
          <div className="option">
            <input type="radio" id="q6-b" name="q6" />
            <label htmlFor="q6-b">Employee satisfaction surveys</label>
          </div>
          <div className="option">
            <input type="radio" id="q6-c" name="q6" />
            <label htmlFor="q6-c">User experience feedback</label>
          </div>
        </div>

        <div className="question-section">
          <div className="question-text">7. Which project type excites you most?</div>
          <div className="option">
            <input type="radio" id="q7-a" name="q7" required />
            <label htmlFor="q7-a">Organizing company events/retreats</label>
          </div>
          <div className="option">
            <input type="radio" id="q7-b" name="q7" />
            <label htmlFor="q7-b">Redesigning user interfaces</label>
          </div>
          <div className="option">
            <input type="radio" id="q7-c" name="q7" />
            <label htmlFor="q7-c">Creating new applications/features</label>
          </div>
        </div>

        <div className="question-section">
          <div className="question-text">8. How do you like to spend your time at work?</div>
          <div className="option">
            <input type="radio" id="q8-a" name="q8" required />
            <label htmlFor="q8-a">Making things look beautiful</label>
          </div>
          <div className="option">
            <input type="radio" id="q8-b" name="q8" />
            <label htmlFor="q8-b">Solving complex problems</label>
          </div>
          <div className="option">
            <input type="radio" id="q8-c" name="q8" />
            <label htmlFor="q8-c">Mentoring and supporting others</label>
          </div>
        </div>

        <div className="question-section">
          <div className="question-text">9. What motivates you in your career?</div>
          <div className="option">
            <input type="radio" id="q9-a" name="q9" required />
            <label htmlFor="q9-a">Helping people grow and develop</label>
          </div>
          <div className="option">
            <input type="radio" id="q9-b" name="q9" />
            <label htmlFor="q9-b">Building innovative products</label>
          </div>
          <div className="option">
            <input type="radio" id="q9-c" name="q9" />
            <label htmlFor="q9-c">Creating exceptional experiences</label>
          </div>
        </div>

        <div className="question-section">
          <div className="question-text">10. What's your ideal career progression?</div>
          <div className="option">
            <input type="radio" id="q10-a" name="q10" required />
            <label htmlFor="q10-a">Becoming a technical expert/lead</label>
          </div>
          <div className="option">
            <input type="radio" id="q10-b" name="q10" />
            <label htmlFor="q10-b">Moving into people management</label>
          </div>
          <div className="option">
            <input type="radio" id="q10-c" name="q10" />
            <label htmlFor="q10-c">Leading creative projects</label>
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