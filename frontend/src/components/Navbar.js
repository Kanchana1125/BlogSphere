import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {

  const navigate = useNavigate();

  const username = localStorage.getItem("username");

  const logout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("username");

    localStorage.removeItem("email");

    navigate("/");
  };

  return (

    <nav className="navbar">

      <h2 className="logo">
        BlogSphere
      </h2>

      <div className="nav-links">

        <Link to="/dashboard">
          Dashboard
        </Link>

        <Link to="/profile">
          Profile
        </Link>

        <span className="welcome-user">
          Hi, {username}
        </span>

        <button onClick={logout}>
          Logout
        </button>

      </div>

    </nav>
  );
}

export default Navbar;