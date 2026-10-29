
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/auth.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: formData.email.trim(),
          password: formData.password,
        }
      );

      // Save authentication details
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.user.name);
      localStorage.setItem("email", res.data.user.email);

      // Navigate after successful login
      navigate("/dashboard");
    } catch (error) {
      console.error(
        "Login error:",
        error.response?.data || error.message
      );

      const message =
        error.response?.data?.message ||
        "Unable to log in. Please check your connection and try again.";

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        className="auth-container"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="auth-left">
          <h1>Welcome Back 🚀</h1>

          <p>
            Explore futuristic blogs, creative ideas,
            and inspiring stories with BlogSphere.
          </p>

          <img
            src="https://images.unsplash.com/photo-1499750310107-5fef28a66643"
            alt="Workspace with books and a notebook"
          />
        </div>

        <div className="auth-right">
          <h2>Login</h2>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="switch-auth">
            Don't have an account?{" "}
            <Link to="/register">Register</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
