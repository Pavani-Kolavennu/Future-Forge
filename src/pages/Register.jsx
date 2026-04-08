import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Forms.css";
import { API_ENDPOINTS, apiPost, apiRequest, mapBackendRoleToUiRole } from "../api/client";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState("");
  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const [error, setError] = useState("");

  // ✅ Send OTP
  const sendOtp = async () => {
    if (!email) {
      alert("Enter email first ❌");
      return;
    }

    try {
      await apiPost(API_ENDPOINTS.auth.sendOtp, { email });
      alert("OTP sent to email ✅");
      setOtpSent(true);
      setOtpVerified(false); // reset verification if re-sent
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to send OTP ❌");
    }
  };

  // ✅ Verify OTP
  const verifyOtp = async () => {
    try {
      const data = await apiPost(API_ENDPOINTS.auth.verifyOtp, {
        email,
        otp: otp.trim(),
      });

      if (data === true) {
        alert("OTP Verified ✅");
        setOtpVerified(true);
      } else {
        alert("Invalid OTP ❌");
        setOtpVerified(false);
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to verify OTP ❌");
      setOtpVerified(false);
    }
  };
  // ✅ Register
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!otpVerified) {
      setError("Please verify OTP first");
      return;
    }

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

        {/* Name */}
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            placeholder="Enter your full name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Email + OTP */}
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={otpSent}
          />
          <button type="button" onClick={sendOtp}>
            Send OTP
          </button>
        </div>

        {/* OTP Section */}
        {otpSent && (
          <div className="form-group">
            <label>Enter OTP</label>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            {/* ✅ IMPORTANT: button with disable */}
            <button
              type="button"
              onClick={verifyOtp}
              disabled={otpVerified}
            >
              {otpVerified ? "Verified ✅" : "Verify OTP"}
            </button>
          </div>
        )}

        {/* Password */}
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Confirm Password */}
        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        {/* Role */}
        <div className="form-group">
          <label>Register As</label>
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

        {/* Register */}
        <button
          type="submit"
          className="form-submit"
          disabled={!otpVerified}
        >
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