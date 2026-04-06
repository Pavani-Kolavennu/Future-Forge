import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Forms.css";
import { API_ENDPOINTS, apiRequest, mapBackendRoleToUiRole } from "../api/client";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");

  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");

  // Generate CAPTCHA
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    setCaptchaQuestion(`${num1} + ${num2}`);
    setCorrectAnswer(num1 + num2);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!role) {
      setError("Please select your role");
      return;
    }

    if (parseInt(captchaAnswer) !== correctAnswer) {
      setError("Incorrect CAPTCHA answer");
      generateCaptcha();
      setCaptchaAnswer("");
      return;
    }

    try {
      const auth = await apiRequest(API_ENDPOINTS.auth.login, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const backendRole = mapBackendRoleToUiRole(auth.role);

      if (backendRole !== role) {
        setError("Role mismatch. Please select the correct role.");
        generateCaptcha();
        return;
      }

      localStorage.setItem("authToken", auth.token || "");
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          id: auth.userId,
          name: auth.fullName,
          email: auth.email,
          role: backendRole,
        })
      );

      if (backendRole === "admin") {
        navigate("/admin");
      } else {
        navigate("/profile");
      }
    } catch (err) {
      setError(err.message || "Invalid email or password");
      generateCaptcha();
    }
  };

  return (
    <div className="form-container">
      <h2>🔐 Login</h2>
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Login As</label>
          <select
            required
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">-- Select Role --</option>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* CAPTCHA */}
        <div className="form-group">
          <label>Solve: {captchaQuestion}</label>
          <input
            type="number"
            placeholder="Enter answer"
            required
            value={captchaAnswer}
            onChange={(e) => setCaptchaAnswer(e.target.value)}
          />
        </div>

        <button type="submit" className="form-submit">
          Login
        </button>
      </form>

      <div className="form-link">
        Don't have an account? <Link to="/register">Register here</Link>
      </div>
    </div>
  );
}

export default Login;