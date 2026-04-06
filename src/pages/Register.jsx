import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Forms.css";
import { API_ENDPOINTS, apiRequest, mapBackendRoleToUiRole } from "../api/client";

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    if (!role) {
      setError("Please select your role");
      return;
    }

    try {
      const backendRole = role === "admin" ? "ADMIN" : "CANDIDATE";
      const auth = await apiRequest(API_ENDPOINTS.auth.register, {
        method: "POST",
        body: JSON.stringify({
          fullName: name,
          email,
          password,
          role: backendRole,
        }),
      });

      localStorage.setItem("authToken", auth.token || "");
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          id: auth.userId,
          name: auth.fullName,
          email: auth.email,
          role: mapBackendRoleToUiRole(auth.role),
        })
      );

      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/profile");
      }
    } catch (err) {
      setError(err.message || "Unable to register right now");
    }
  };

  return (
    <div className="form-container">
      <h2>✨ Create Account</h2>
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            placeholder="Enter your full name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter a strong password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirm">Confirm Password</label>
          <input
            type="password"
            id="confirm"
            placeholder="Confirm your password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        {/* Role Selection */}
        <div className="form-group">
          <label htmlFor="role">Register As</label>
          <select
            id="role"
            required
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">-- Select Role --</option>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button type="submit" className="form-submit">
          Register
        </button>
      </form>

      <div className="form-link">
        Already have an account? <Link to="/login">Login here</Link>
      </div>
    </div>
  );
}

export default Register;