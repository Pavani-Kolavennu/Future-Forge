import { useState, useEffect } from "react";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Assessment from "./pages/Assessment";
import Result from "./pages/Result";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import "./App.css";

function App() {
  const location = useLocation();
  const [user, setUser] = useState(null);

  // Re-check user whenever route changes
  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    setUser(currentUser ? JSON.parse(currentUser) : null);
  }, [location]);

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-content">
          <div className="logo-section">
            <Link to="/" className="logo-link">
              <span className="logo-icon">🎯</span>
              <span className="logo-text">Future Forge</span>
            </Link>
          </div>

          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>

            {(!user || user.role === "student") && (
              <li>
                {user ? (
                  <Link to="/assessment">Assessment</Link>
                ) : (
                  <Link to="/login">Assessment</Link>
                )}
              </li>
            )}

            {user ? (
              <>
                {user.role === "student" && (
                  <li><Link to="/profile">Profile</Link></li>
                )}

                {user.role === "admin" && (
                  <li><Link to="/admin">Admin</Link></li>
                )}
              </>
            ) : (
              <>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
              </>
            )}
          </ul>
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/" />}
          />

          <Route
            path="/register"
            element={!user ? <Register /> : <Navigate to="/" />}
          />

          <Route
            path="/assessment"
            element={
              user && user.role === "student"
                ? <Assessment />
                : <Navigate to={user && user.role === "admin" ? "/admin" : "/login"} />
            }
          />

          <Route path="/result" element={<Result />} />

          <Route
            path="/profile"
            element={
              user && user.role === "student"
                ? <Profile />
                : <Navigate to="/login" />
            }
          />

          <Route
            path="/admin"
            element={
              user && user.role === "admin"
                ? <AdminDashboard />
                : <Navigate to="/login" />
            }
          />
        </Routes>
      </main>

      <footer className="footer">
        <p>&copy; 2026 Future Forge Assessment Tool. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;