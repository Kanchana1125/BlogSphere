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

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );

      localStorage.setItem(
        "token",
        res.data.token
      );

      localStorage.setItem(
       "username",
       res.data.user.name
      );
      localStorage.setItem(
       "email",
       res.data.user.email
      );

      navigate("/dashboard");

    } catch (error) {

      alert("Login Failed");
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
            Explore futuristic blogs,
            creative ideas,
            and inspiring stories with BlogSphere.
          </p>

          <img
            src="https://images.unsplash.com/photo-1499750310107-5fef28a66643"
            alt="login"
          />

        </div>

        <div className="auth-right">

          <h2>Login</h2>

          <form onSubmit={handleSubmit}>

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />

            <button type="submit">
              Login
            </button>

          </form>

          <p className="switch-auth">
            Don't have an account?
            <Link to="/register">
              {" "}Register
            </Link>
          </p>

        </div>

      </motion.div>

    </div>
  );
}

export default Login;