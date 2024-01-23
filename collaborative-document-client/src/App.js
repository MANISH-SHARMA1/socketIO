import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState([]); //totalUsers
  const [roomId, setRoomId] = useState("");
  const [msg, setMsg] = useState(""); //message to be sent to a particular room

  useEffect(() => {
    const token = "your_authentication_token";

    const newSocket = io("http://localhost:5000", {
      auth: { token },
    });

    setSocket(newSocket);
    newSocket.on("connect", () => {
      newSocket.emit("click");
      newSocket.on("totalUser", (totalClient) => {
        setUser(totalClient);
      });
    });

    return () => newSocket.disconnect();
  }, []);

  function msgSend(e) {
    e.preventDefault();
    if (socket && roomId && msg) {
      socket.emit("send message", { roomId, message: msg });
      setMsg("");
    }
  }

  useEffect(() => {
    // Listen for 'message' event from the server
    if (socket) {
      socket.on("receive message", (message) => {
        setMessages((messages) => [...messages, message]);
      });
    }
  }, [socket]);

  function collaborate(e) {
    e.preventDefault();

    const validUser = user?.some((userr) => userr === roomId);
    if (socket && roomId && validUser) {
      socket.emit("join-room", roomId);
    }
    socket.on("message", (message) => {
      console.log(message);
    });
  }

  return (
    <div className="collaborateApp">
      <h1>Document Collaborating App</h1>

      <h5>Note: Copy and Paste the changed text to commit changes.</h5>
      <h5>Note: Choose the ID to collaborate.</h5>

      <div className="mainBody">
        <form onSubmit={(e) => collaborate(e)} className="form">
          <textarea
            className="textArea"
            name="document"
            onChange={(e) => {
              setMsg(e.target.value);
            }}
          ></textarea>
          <button onClick={msgSend} id="button" style={{ margin: "10px 0px" }}>
            Commit
          </button>

          <div className="inputs">
            <label htmlFor="roomInput">Collaborate With</label>
            <select
              value={roomId}
              id="roomInput"
              onChange={(e) => setRoomId(e.target.value)}
            >
              {user?.map((userId) => (
                <option value={userId} key={userId}>
                  {userId}
                </option>
              ))}
            </select>

            <button type="submit" id="button">
              Collaborate
            </button>
          </div>
        </form>

        <div className="changeDoc">
          {messages.map((message, index) => (
            <p key={index}>{message}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
