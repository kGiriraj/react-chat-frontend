// src/Chat.js
import React, { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import "bootstrap/dist/css/bootstrap.min.css";

const Chat = () => {
  const [connected, setConnected] = useState(false);
  const [sender, setSender] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [stompClient, setStompClient] = useState(null);

  useEffect(() => {
    const socket = new SockJS("chat-application-production-a168.up.railway.app/chat"); 
    // const socket = new SockJS("http://localhost:8080/chat");

    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        setConnected(true);
        client.subscribe("/topic/messages", (payload) => {
          const msg = JSON.parse(payload.body);
          setMessages((prev) => [...prev, msg]);
        });
      },
    });

    client.activate();
    setStompClient(client);

    return () => {
      if (client.connected) {
        client.deactivate();
      }
    };
  }, []);

  const sendMessage = () => {
    if (stompClient && stompClient.connected && sender && message) {
      const chatMessage = { sender, content: message };
      stompClient.publish({
        destination: "/app/sendMessage",
        body: JSON.stringify(chatMessage),
      });
      setMessage("");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center">React Chat App</h2>

      <div className="mb-3">
        <input
          type="text"
          placeholder="Your name"
          className="form-control"
          value={sender}
          onChange={(e) => setSender(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <input
          type="text"
          placeholder="Type a message..."
          className="form-control"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <button
        className="btn btn-primary mb-3"
        onClick={sendMessage}
        disabled={!connected}
      >
        Send
      </button>

      <div
        className="border p-3"
        style={{ height: "300px", overflowY: "auto" }}
      >
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.sender}</strong>: {msg.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chat;
