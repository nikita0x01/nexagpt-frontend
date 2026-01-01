import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { apiFetch } from "./api";
import { useContext, useState , useEffect} from "react";
import { ScaleLoader } from "react-spinners";

function ChatWindow() {
  const { prompt, setPrompt, reply, setReply, currThreadId , prevChats , setPrevChats, isAuthenticated, setIsAuthenticated, token, setToken, user, setUser } = useContext(MyContext);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState(() => (document.documentElement.classList.contains('light') ? 'light' : 'dark'));
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ name: user?.name || "", password: "", avatar: user?.avatar || "" });
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [authError, setAuthError] = useState("");

  const getReply = async () => {
    setLoading(true);
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: prompt,
        threadId: currThreadId,
      }),
    };

    try {
      const response = await apiFetch("/api/chat", options);
      const res = await response.json();
      console.log(res);
      setReply(res.reply); // optional: update reply context
    } catch (err) {
      console.log("Fetch error:", err);
    } finally {
      setLoading(false);
    }

  }

  const openLoginSignup = () => {
    setAuthOpen(true);
    setIsOpen(false);
  }

  const openUpgrade = () => {
    setUpgradeOpen(true);
    setIsOpen(false);
  }

  const openSettings = () => {
    if (!isAuthenticated) {
      setAuthOpen(true);
      setAuthTab('login');
      setIsOpen(false);
      return;
    }
    setSettingsForm({ name: user?.name || "", password: "", avatar: user?.avatar || "" });
    setSettingsOpen(true);
    setIsOpen(false);
  }

  const logout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (e) {}
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setIsOpen(false);
  }

  const submitAuth = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      const path = authTab === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const res = await apiFetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data?.error || 'Something went wrong');
        return;
      }
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      try {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      } catch (e) {}
      setAuthOpen(false);
      const name = data?.user?.name || data?.user?.email || 'there';
      setToast(`Welcome ${name}!`);
      setTimeout(() => setToast(""), 3000);
    } catch (e) {}
  }

  const submitSettings = async (e) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await apiFetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(settingsForm)
      });
      const data = await res.json();
      if (!res.ok) return;
      setUser(data.user);
      try { localStorage.setItem('user', JSON.stringify(data.user)); } catch (e) {}
      setSettingsOpen(false);
    } catch (e) {}
  }

  // append new chat to old
  useEffect(() => {
    if(prompt && reply) {
      setPrevChats(prevChats => (
        [...prevChats , {
          role: "user",
          content: prompt
        }, {
          role:"assistant",
          content:reply
        }]
      ));
    }

    setPrompt("");
  } , [reply]);


  const handleProfileClick= () => {
    setIsOpen(!isOpen);
  }

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    if (next === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    try {
      localStorage.setItem('theme', next);
    } catch (e) {
      // ignore storage errors
    }
  }


  return (
    <div className="chatWindow">
      <div className="navbar">
        <span>
          NexaGPT &nbsp; <i className="fa-solid fa-chevron-down"></i>
        </span>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="themeToggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? (
              <i className="fa-solid fa-moon"></i>
            ) : (
              <i className="fa-solid fa-sun"></i>
            )}
          </button>
          <div className="userIconDiv" onClick={handleProfileClick}>
            <span>
              <i className="fa-solid fa-user"></i>
            </span>
          </div>
        </div>

      </div>

      {isOpen && (
        <div className="dropDown">
          {!isAuthenticated ? (
            <div className="dropDownItems" onClick={openLoginSignup}><i className="fa-solid fa-user"></i>Login/Signup</div>
          ) : (
            <div className="dropDownItems"><i className="fa-solid fa-user"></i>{user?.name || 'Profile'}</div>
          )}
          <div className="dropDownItems" onClick={openUpgrade}><i className="fa-solid fa-cloud-arrow-up"></i>Upgrad Plan</div>
          <div className="dropDownItems" onClick={openSettings}><i className="fa-solid fa-sun"></i>Theme</div>
          {isAuthenticated && (
            <div className="dropDownItems" onClick={logout}><i className="fa-solid fa-lock-open"></i>Logout</div>
          )}
        </div>
      )}

      <Chat />

      {/* Loader */}
      {loading && <ScaleLoader color="#fff" />}

      <div className="chatInput">
        <div className="userInput">
          <input
            type="text"
            placeholder="Ask Anything.."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && getReply()}
          />
          <div id="submit" onClick={getReply}>
            <i className="fa-solid fa-paper-plane"></i>
          </div>
        </div>
        <p className="info">NexaGPT can make mistakes. Check important info. See Cookie preferences!</p>
      </div>

      {authOpen && (
        <div className="modalOverlay">
          <div className="modal">
            <div className="tabs">
              <button className={authTab === 'login' ? 'active' : ''} onClick={() => setAuthTab('login')}>Login</button>
              <button className={authTab === 'signup' ? 'active' : ''} onClick={() => setAuthTab('signup')}>Signup</button>
            </div>
            <form onSubmit={submitAuth} className="form">
              {authTab === 'signup' && (
                <input type="text" placeholder="Name" value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} required />
              )}
              <input type="email" placeholder="Email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} required />
              <input type="password" placeholder="Password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} required />
              {authError && <p className="info" style={{ color: '#e66' }}>{authError}</p>}
              <div className="modalActions">
                <button type="button" onClick={() => setAuthOpen(false)}>Cancel</button>
                <button type="submit">{authTab === 'login' ? 'Login' : 'Signup'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {upgradeOpen && (
        <div className="modalOverlay">
          <div className="modal">
            <h3>Upgrade feature coming soon!</h3>
            <div className="modalActions">
              <button type="button" onClick={() => setUpgradeOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {settingsOpen && (
        <div className="modalOverlay">
          <div className="modal">
            <h3>Settings</h3>
            <form onSubmit={submitSettings} className="form">
              <input type="text" placeholder="Name" value={settingsForm.name} onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })} />
              <input type="password" placeholder="New Password" value={settingsForm.password} onChange={(e) => setSettingsForm({ ...settingsForm, password: e.target.value })} />
              <input type="text" placeholder="Profile picture URL" value={settingsForm.avatar} onChange={(e) => setSettingsForm({ ...settingsForm, avatar: e.target.value })} />
              <div className="modalActions">
                <button type="button" onClick={() => setSettingsOpen(false)}>Cancel</button>
                <button type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatWindow;
