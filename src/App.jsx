import './App.css';
import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import { MyContext } from './MyContext.jsx';
import { useEffect, useState } from 'react';
import {v1 as uuidv1} from "uuid";

function App() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThread] = useState(uuidv1());

  const[prevChats , setPrevChats]=useState([]);
  const[newChat , setNewChat]= useState(true);
  const [allThreads , setAllThreads]=useState([]);

  // auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      if (savedToken) {
        setToken(savedToken);
        setIsAuthenticated(true);
      }
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {}
  }, []);

  const providerValues = {
  prompt,
  setPrompt,
  reply,
  setReply,
  currThreadId,
  setCurrThread,   // ✅ now correct
  newChat,
  setNewChat,
  prevChats,
  setPrevChats,
  allThreads,
  setAllThreads,
  // auth
  isAuthenticated,
  setIsAuthenticated,
  token,
  setToken,
  user,
  setUser,
};

  return (
    <div className='app'>
      <MyContext.Provider value={providerValues}>
        <Sidebar />
        <ChatWindow />
      </MyContext.Provider>
    </div>
  );
}

export default App;
