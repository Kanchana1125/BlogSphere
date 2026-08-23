import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../styles/profile.css";

function Profile() {

  const [userBlogs, setUserBlogs] = useState([]);

  const username = localStorage.getItem("username");

  const email = localStorage.getItem("email");

  useEffect(() => {

    fetchUserBlogs();

  }, []);

  const fetchUserBlogs = async () => {

    try {

      const res = await axios.get(
        "http://localhost:5000/api/blogs"
      );

      const filteredBlogs = res.data.filter(
        (blog) =>
          blog.user?.name === username
      );

      setUserBlogs(filteredBlogs);

    } catch (error) {

      console.log(error);
    }
  };

  return (

    <>
      <Navbar />

      <div className="profile-page">

        <div className="profile-card">

          <div className="profile-avatar">

            {username?.charAt(0)}

          </div>

          <h1>{username}</h1>

          <p>{email}</p>

          <div className="profile-stats">

            <div className="stat-box">

              <h2>{userBlogs.length}</h2>

              <p>Total Blogs</p>

            </div>

          </div>

        </div>

      </div>
    </>
  );
}

export default Profile;