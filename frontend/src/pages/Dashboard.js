import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import "../styles/dashboard.css";
import { motion } from "framer-motion";

function Dashboard() {

  const [blogs, setBlogs] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: "",
  });

  const [commentText, setCommentText] = useState("");

  const token = localStorage.getItem("token");

  const username = localStorage.getItem("username");

  /* ================= FETCH BLOGS ================= */

  const fetchBlogs = async () => {

    try {

      const res = await axios.get(
        "http://localhost:5000/api/blogs"
      );

      setBlogs(res.data);

    } catch (error) {

      console.log(error);
    }
  };

  useEffect(() => {

    fetchBlogs();

  }, []);

  /* ================= HANDLE FORM ================= */

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /* ================= CREATE BLOG ================= */

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await axios.post(
        "http://localhost:5000/api/blogs",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFormData({
        title: "",
        content: "",
        image: "",
      });

      fetchBlogs();

    } catch (error) {

      console.log(error);
    }
  };

  /* ================= DELETE BLOG ================= */

  const deleteBlog = async (id) => {

    try {

      await axios.delete(
        `http://localhost:5000/api/blogs/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchBlogs();

    } catch (error) {

      console.log(error);
    }
  };

  /* ================= LIKE BLOG ================= */

  const likeBlog = async (id) => {

    try {

      await axios.put(
        `http://localhost:5000/api/blogs/like/${id}`
      );

      fetchBlogs();

    } catch (error) {

      console.log(error);
    }
  };

  /* ================= COMMENT ================= */

  const addComment = async (id) => {

    if (!commentText) return;

    try {

      await axios.post(
        `http://localhost:5000/api/blogs/comment/${id}`,
        {
          text: commentText,
          user: username,
        }
      );

      setCommentText("");

      fetchBlogs();

    } catch (error) {

      console.log(error);
    }
  };

  return (
    <>
      <Navbar />

      <Hero />

      <div className="dashboard">

        {/* FEATURED SECTION */}

        <div className="featured-section">

          <div className="featured-card">

            <h1>
              Future of Digital Storytelling
            </h1>

            <p>
              Explore futuristic blogs,
              technology, creativity and
              innovation with BlogSphere.
            </p>

          </div>

        </div>

        {/* CREATE BLOG */}

        <div className="create-blog">

          <h2>Create Blog</h2>

          <form onSubmit={handleSubmit}>

            <input
              type="text"
              name="title"
              placeholder="Blog Title"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="image"
              placeholder="Paste Image URL"
              value={formData.image}
              onChange={handleChange}
            />

            <textarea
              name="content"
              placeholder="Write your content..."
              value={formData.content}
              onChange={handleChange}
              required
            />

            <button type="submit">
              Publish Blog
            </button>

          </form>

        </div>

        {/* BLOGS */}

        <div className="blogs-wrapper">

          <h2 className="latest-title">
            Latest Blogs
          </h2>

          <div className="blogs-section">

            {blogs.map((blog) => (

              <motion.div
                className="blog-card"
                key={blog._id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{
                  scale: 1.03,
                }}
              >

                <img
                  src={
                    blog.image
                      ? blog.image
                      : "https://images.unsplash.com/photo-1499750310107-5fef28a66643"
                  }
                  alt="blog"
                  className="blog-image"
                />

                <div className="blog-content">

                  <h3>{blog.title}</h3>

                  <p>{blog.content}</p>

                  <small>
                    By {blog.user?.name || username}
                  </small>

                  {/* ACTION BUTTONS */}

                  <div className="blog-actions">

                    <button
                      className="like-btn"
                      onClick={() =>
                        likeBlog(blog._id)
                      }
                    >
                      ❤️ {blog.likes}
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        deleteBlog(blog._id)
                      }
                    >
                      Delete
                    </button>

                  </div>

                  {/* COMMENTS */}

                  <div className="comments-section">

                    <h4>Comments</h4>

                    {
                      blog.comments?.map(
                        (comment, index) => (

                          <div
                            className="comment"
                            key={index}
                          >

                            <strong>
                              {comment.user}
                            </strong>

                            <p>
                              {comment.text}
                            </p>

                          </div>
                        )
                      )
                    }

                    <div className="comment-input">

                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={(e) =>
                          setCommentText(
                            e.target.value
                          )
                        }
                      />

                      <button
                        onClick={() =>
                          addComment(blog._id)
                        }
                      >
                        Comment
                      </button>

                    </div>

                  </div>

                </div>

              </motion.div>
            ))}

          </div>

        </div>

      </div>
    </>
  );
}

export default Dashboard;