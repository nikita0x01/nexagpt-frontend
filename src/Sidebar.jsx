import "./Sidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "./MyContext";
import { v1 as uuidv1 } from "uuid";
import { apiFetch } from "./api";

function Sidebar() {
  const {
    allThreads,
    setAllThreads,
    currThreadId,
    setNewChat,
    setPrompt,
    setReply,
    setCurrThread,
    setPrevChats,
  } = useContext(MyContext);

  // ✅ Fetch all threads
  const getAllThreads = async () => {
    try {
      const response = await apiFetch("/api/thread");
      if (!response.ok) throw new Error("Failed to fetch threads");

      const res = await response.json();
      const filteredData = res.map((thread) => ({
        threadId: thread.threadId,
        title: thread.title,
      }));
      setAllThreads(filteredData);
    } catch (err) {
      console.error("Error while fetching threads in sidebar:", err);
    }
  };

  useEffect(() => {
    getAllThreads();
  }, [currThreadId]);

  // ✅ Create new chat
  const createNewChat = () => {
    setNewChat(true);
    setPrompt("");
    setReply(null);
    setCurrThread(uuidv1());
    setPrevChats([]);
  };

  // ✅ Change thread and fetch previous chats
  const changeThread = async (newThreadId) => {
    setCurrThread(newThreadId);

    try {
      const response = await apiFetch(`/api/thread/${newThreadId}`);
      if (!response.ok) throw new Error("Failed to fetch chat history");

      const res = await response.json();
      setPrevChats(res);
      setNewChat(false);
      setReply(null);
    } catch (err) {
      console.error("Error while fetching thread chats:", err);
    }
  };

  // ✅ Delete thread
  const deleteThread = async (threadId) => {
    if (!window.confirm("Are you sure you want to delete this chat?")) return;

    try {
      const response = await apiFetch(`/api/thread/${threadId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete thread");

      // remove from state instantly
      setAllThreads((prev) => prev.filter((t) => t.threadId !== threadId));

      // if current thread deleted, reset
      if (threadId === currThreadId) {
        setCurrThread(uuidv1());
        setPrevChats([]);
        setNewChat(true);
        setReply(null);
        setPrompt("");
      }
    } catch (err) {
      console.error("Error deleting thread:", err);
    }
  };

  return (
    <section className="sidebar">
      {/* ✅ New Chat Button */}
      <button type="button" onClick={createNewChat}>
        <img
          src="src/assets/blacklogo.png"
          alt="NexaGPT_Logo"
          className="logo"
        />
        <span>
          <i className="fa-solid fa-pen-to-square"></i>
        </span>
      </button>

      {/* ✅ Threads List */}
      <ul className="history">
        {allThreads?.map((thread, idx) => (
          <li
            key={thread.threadId || idx}
            onClick={() => changeThread(thread.threadId)}
            className={thread.threadId === currThreadId ? "active-thread" : ""}
          >
            {thread.title || "Untitled Chat"}
            <i
              className="fa-solid fa-trash"
              onClick={(e) => {
                e.stopPropagation(); // prevent chat open on delete
                deleteThread(thread.threadId);
              }}
            ></i>
          </li>
        ))}
      </ul>

      {/* ✅ Footer */}
      <div className="sign">
        <p>By Nikita Satpute &hearts;</p>
      </div>
    </section>
  );
}

export default Sidebar;
