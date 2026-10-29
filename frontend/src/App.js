import React, { createContext, useContext, useEffect, useState } from "react";
import { Link, NavLink, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import api from "./api";

const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);
const dateText = (date) => new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
const initials = (name = "Reader") => name.split(" ").map(s => s[0]).join("").slice(0, 2).toUpperCase();

function Navbar() {
  const { user, logout } = useAuth();
  return <header className="navbar"><Link to="/" className="brand"><span className="brand-mark">B</span> BlogSphere</Link>
    <nav><NavLink to="/">Explore</NavLink>{user && <NavLink to="/dashboard">My writing</NavLink>}
      {user ? <><NavLink to="/profile">{user.name}</NavLink><button className="button button-small button-outline" onClick={logout}>Log out</button></>
      : <><NavLink to="/login">Log in</NavLink><Link className="button button-small" to="/register">Get started</Link></>}
    </nav></header>;
}
function Notice({ children, type = "error" }) { return children ? <div className={`notice ${type}`}>{children}</div> : null; }
function Avatar({ name }) { return <span className="avatar">{initials(name)}</span>; }

function PostCard({ post }) {
  const author = post.author?.name || "BlogSphere writer";
  return <article className="post-card">
    <div className="post-meta"><Avatar name={author}/><span>{author}</span><span className="dot">·</span><span>{dateText(post.createdAt)}</span></div>
    <Link to={`/posts/${post._id}`} className="post-card-link"><h2>{post.title}</h2><p>{post.excerpt || post.content.slice(0, 180)}</p></Link>
    <div className="post-card-bottom"><div className="tag-list">{(post.tags || []).slice(0, 3).map(tag => <span className="tag" key={tag}>{tag}</span>)}</div><span className="muted">{post.likes?.length || 0} likes</span></div>
  </article>;
}
function Home() {
  const [posts, setPosts] = useState([]), [q, setQ] = useState(""), [loading, setLoading] = useState(true), [error, setError] = useState("");
  async function load(search = "") {
    setLoading(true); setError("");
    try { const { data } = await api.get("/posts", { params: search ? { q: search } : {} }); setPosts(data.posts); }
    catch { setError("Could not connect to BlogSphere. Make sure the backend and MongoDB are running."); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  function submit(e) { e.preventDefault(); load(q); }
  return <><section className="hero"><div className="hero-copy"><span className="eyebrow">A SPACE FOR IDEAS</span><h1>Stories worth<br/><em>sharing.</em></h1><p>Discover fresh perspectives, share what you know, and find your people through the power of writing.</p><div className="hero-actions"><Link className="button" to="/create">Start writing <span>↗</span></Link><a href="#latest" className="text-link">Explore stories ↓</a></div></div><div className="hero-art"><div className="art-circle"></div><div className="art-note note-one">Ideas become stories.</div><div className="art-note note-two">Write your next chapter ✦</div><div className="art-book"><span>YOUR<br/>WORDS.<br/><i>YOUR</i><br/><i>WORLD.</i></span><small>BLOGSPHERE · EST. TODAY</small></div></div></section>
    <main id="latest" className="content-wrap"><div className="section-heading"><div><span className="eyebrow">THE COMMUNITY</span><h2>Latest stories</h2></div><form className="search" onSubmit={submit}><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search stories..." aria-label="Search stories"/><button aria-label="Search">⌕</button></form></div>
    <Notice>{error}</Notice>{loading ? <p className="muted">Loading stories…</p> : posts.length ? <div className="post-grid">{posts.map(p => <PostCard key={p._id} post={p}/>)}</div> : <div className="empty"><div>✎</div><h3>No stories yet</h3><p>Be the first to share an idea with the community.</p><Link className="button" to="/create">Write the first story</Link></div>}</main>
  </>;
}
function AuthPage({ mode }) {
  const { user, login } = useAuth(); const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" }), [error, setError] = useState(""), [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/dashboard" replace/>;
  const register = mode === "register";
  async function submit(e) {
    e.preventDefault(); setError(""); setBusy(true);
    try { const { data } = await api.post(`/auth/${register ? "register" : "login"}`, form); login(data); nav("/dashboard"); }
    catch (err) { setError(err.response?.data?.message || "Unable to connect to the server."); }
    finally { setBusy(false); }
  }
  return <main className="auth-layout"><section className="auth-panel"><span className="eyebrow">{register ? "JOIN THE COMMUNITY" : "WELCOME BACK"}</span><h1>{register ? "Your story starts here." : "Good to have you back."}</h1><p className="muted">{register ? "Create an account and give your ideas a home." : "Sign in and keep your ideas moving."}</p><Notice>{error}</Notice><form className="form" onSubmit={submit}>
    {register && <label>Your name<input required maxLength="60" value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="How should we call you?"/></label>}
    <label>Email address<input required type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} placeholder="you@example.com"/></label>
    <label>Password<input required minLength="8" type="password" value={form.password} onChange={e => setForm({...form, password:e.target.value})} placeholder="At least 8 characters"/></label>
    <button className="button button-full" disabled={busy}>{busy ? "Please wait…" : register ? "Create account →" : "Log in →"}</button></form><p className="switch-auth">{register ? "Already have an account?" : "New to BlogSphere?"} <Link to={register ? "/login" : "/register"}>{register ? "Log in" : "Create an account"}</Link></p></section><aside className="auth-quote"><div className="quote-mark">“</div><blockquote>Every great idea begins with someone brave enough to put it into words.</blockquote><span>THE BLOGSPHERE COMMUNITY</span></aside></main>;
}
function Protected({ children }) { const { user, ready } = useAuth(); if (!ready) return <main className="content-wrap">Loading…</main>; return user ? children : <Navigate to="/login" replace/>; }

function Editor({ edit = false }) {
  const { id } = useParams(), nav = useNavigate();
  const [form, setForm] = useState({ title: "", excerpt: "", content: "", tags: "", coverImage: "" }), [error, setError] = useState(""), [busy, setBusy] = useState(false);
  useEffect(() => { if (edit) api.get(`/posts/${id}`).then(({data}) => setForm({ title:data.post.title, excerpt:data.post.excerpt || "", content:data.post.content, tags:(data.post.tags || []).join(", "), coverImage:data.post.coverImage || "" })).catch(() => setError("Could not load this post.")); }, [edit, id]);
  async function submit(e) { e.preventDefault(); setError(""); setBusy(true); try { const payload = {...form, tags:form.tags.split(",").map(t=>t.trim()).filter(Boolean)}; const {data} = edit ? await api.put(`/posts/${id}`, payload) : await api.post("/posts", payload); nav(`/posts/${data.post._id}`); } catch(err) { setError(err.response?.data?.message || "Could not save post."); } finally { setBusy(false); } }
  return <main className="editor-wrap"><Link to={edit ? `/posts/${id}` : "/"} className="back-link">← Back</Link><span className="eyebrow">YOUR CREATIVE SPACE</span><h1>{edit ? "Edit your story" : "Write a story"}</h1><p className="muted">A good story doesn't need to be perfect. It needs to be yours.</p><Notice>{error}</Notice><form className="form editor-form" onSubmit={submit}>
    <label>Story title<input required maxLength="160" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Give your story a title"/></label>
    <label>Short description<input maxLength="300" value={form.excerpt} onChange={e=>setForm({...form,excerpt:e.target.value})} placeholder="What is this story about?"/></label>
    <label>Tags <span className="muted">(comma-separated)</span><input value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} placeholder="technology, life, learning"/></label>
    <label>Cover image URL <span className="muted">(optional)</span><input type="url" value={form.coverImage} onChange={e=>setForm({...form,coverImage:e.target.value})} placeholder="https://…"/></label>
    <label>Your story<textarea required rows="15" value={form.content} onChange={e=>setForm({...form,content:e.target.value})} placeholder="Start writing here…"/></label>
    <button className="button" disabled={busy}>{busy ? "Saving…" : edit ? "Save changes →" : "Publish story →"}</button></form></main>;
}
function PostDetail() {
  const { id } = useParams(), nav = useNavigate(), { user } = useAuth();
  const [post, setPost] = useState(null), [comments, setComments] = useState([]), [text, setText] = useState(""), [error, setError] = useState("");
  async function load() { try { const {data} = await api.get(`/posts/${id}`); setPost(data.post); setComments(data.comments); } catch { setError("This story could not be found."); } }
  useEffect(() => { load(); }, [id]);
  async function comment(e) { e.preventDefault(); try { const {data} = await api.post(`/comments/${id}`, {text}); setComments([...comments, data.comment]); setText(""); } catch(err) { setError(err.response?.data?.message || "Please log in to comment."); } }
  async function like() { if (!user) return nav("/login"); try { const {data} = await api.post(`/posts/${id}/like`); setPost({...post, likes: Array(data.likes).fill(0)}); } catch { setError("Could not update like."); } }
  async function remove() { if (!window.confirm("Delete this story permanently?")) return; try { await api.delete(`/posts/${id}`); nav("/dashboard"); } catch(err) { setError(err.response?.data?.message || "Could not delete story."); } }
  if (!post) return <main className="content-wrap"><Notice>{error}</Notice>{!error && "Loading story…"}</main>;
  const own = user && String(user._id) === String(post.author?._id);
  return <main className="article-wrap"><Link to="/" className="back-link">← All stories</Link><Notice>{error}</Notice><div className="article-meta"><Avatar name={post.author?.name}/><div><strong>{post.author?.name || "Writer"}</strong><span>{dateText(post.createdAt)}</span></div></div><h1>{post.title}</h1>{post.excerpt && <p className="article-excerpt">{post.excerpt}</p>}{post.coverImage && <img className="cover-image" src={post.coverImage} alt="" onError={e=>e.currentTarget.style.display="none"}/>}<div className="tag-list article-tags">{post.tags?.map(t=><span className="tag" key={t}>{t}</span>)}</div><div className="article-content">{post.content}</div><div className="article-actions"><button className="button button-outline" onClick={like}>♡ Like · {post.likes?.length || 0}</button>{own && <><Link className="button button-outline" to={`/posts/${id}/edit`}>Edit story</Link><button className="button button-danger" onClick={remove}>Delete</button></>}</div><section className="comments"><h2>Conversation <span className="muted">({comments.length})</span></h2><form className="comment-form" onSubmit={comment}><textarea rows="3" value={text} onChange={e=>setText(e.target.value)} placeholder={user ? "Add something thoughtful…" : "Log in to join the conversation"} required/><button className="button" disabled={!user}>Post comment</button></form>{comments.map(c=><div className="comment" key={c._id}><div className="post-meta"><Avatar name={c.author?.name}/><strong>{c.author?.name}</strong><span className="muted">{dateText(c.createdAt)}</span></div><p>{c.text}</p></div>)}</section></main>;
}
function Dashboard() {
  const { user } = useAuth(); const [posts, setPosts] = useState([]), [error, setError] = useState("");
  useEffect(() => { api.get("/posts").then(({data})=>setPosts(data.posts.filter(p=>String(p.author?._id)===String(user._id)))).catch(()=>setError("Could not load your posts.")); }, [user]);
  return <main className="content-wrap dashboard"><div className="dashboard-heading"><div><span className="eyebrow">YOUR WORKSPACE</span><h1>Your stories, {user.name.split(" ")[0]}.</h1><p className="muted">Every post is another idea out in the world.</p></div><Link className="button" to="/create">＋ Write a story</Link></div><Notice>{error}</Notice><div className="section-heading"><h2>Your published stories</h2><span className="muted">{posts.length} total</span></div>{posts.length ? <div className="post-grid">{posts.map(p=><PostCard key={p._id} post={p}/>)}</div> : <div className="empty"><div>✎</div><h3>Your first story is waiting</h3><p>Write about something you care about. Your perspective matters.</p><Link className="button" to="/create">Start writing</Link></div>}</main>;
}
function Profile() {
  const {user, updateUser} = useAuth(); const [name,setName] = useState(user.name), [bio,setBio] = useState(user.bio || ""), [message,setMessage] = useState(""), [error,setError] = useState("");
  async function submit(e) { e.preventDefault(); setError(""); setMessage(""); try { const {data} = await api.put("/auth/profile",{name,bio}); updateUser(data.user); setMessage("Profile updated successfully."); } catch(err) { setError(err.response?.data?.message || "Could not update profile."); } }
  return <main className="auth-layout profile-layout"><section className="auth-panel"><span className="eyebrow">YOUR PROFILE</span><h1>Make it yours.</h1><p className="muted">Tell readers a little about the person behind the words.</p><Notice>{error}</Notice><Notice type="success">{message}</Notice><form className="form" onSubmit={submit}><label>Display name<input required value={name} onChange={e=>setName(e.target.value)}/></label><label>Email address<input value={user.email} disabled/></label><label>Short bio<textarea rows="4" maxLength="300" value={bio} onChange={e=>setBio(e.target.value)} placeholder="A few words about you…"/></label><button className="button">Save profile →</button></form></section><aside className="profile-card"><Avatar name={user.name}/><h2>{user.name}</h2><p>{bio || "A curious mind, collecting stories."}</p><span className="muted">{user.email}</span></aside></main>;
}
function App() {
  const [user, setUser] = useState(null), [ready, setReady] = useState(false);
  useEffect(() => { const token = localStorage.getItem("blogsphere_token"); if (!token) { setReady(true); return; } api.get("/auth/me").then(({data})=>setUser(data.user)).catch(()=>localStorage.removeItem("blogsphere_token")).finally(()=>setReady(true)); }, []);
  function login(data) { localStorage.setItem("blogsphere_token", data.token); setUser(data.user); }
  function logout() { localStorage.removeItem("blogsphere_token"); setUser(null); }
  function updateUser(next) { setUser(next); }
  return <AuthContext.Provider value={{user,ready,login,logout,updateUser}}><div className="app-shell"><Navbar/><Routes><Route path="/" element={<Home/>}/><Route path="/login" element={<AuthPage mode="login"/>}/><Route path="/register" element={<AuthPage mode="register"/>}/><Route path="/posts/:id" element={<PostDetail/>}/><Route path="/create" element={<Protected><Editor/></Protected>}/><Route path="/posts/:id/edit" element={<Protected><Editor edit/></Protected>}/><Route path="/dashboard" element={<Protected><Dashboard/></Protected>}/><Route path="/profile" element={<Protected><Profile/></Protected>}/><Route path="*" element={<main className="empty"><h1>Page not found</h1><Link className="button" to="/">Go home</Link></main>}/></Routes><footer className="footer"><Link to="/" className="brand"><span className="brand-mark">B</span> BlogSphere</Link><span>Ideas grow when they're shared.</span><span>© {new Date().getFullYear()} BlogSphere</span></footer></div></AuthContext.Provider>;
}
export default App;