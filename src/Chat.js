// src/Chat.js
import React, { useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import "bootstrap/dist/css/bootstrap.min.css";

const Chat = () => {
  const [connected, setConnected] = useState(false);
  const [sender, setSender] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const stompClientRef = useRef(null);
  const subscribedRef = useRef(false); // ✅ Correct way to track subscription

  useEffect(() => {
const socket = new SockJS("https://chatapplication-production-c187.up.railway.app/chat");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);

        if (!subscribedRef.current) {
          client.subscribe("/topic/messages", (payload) => {
            const msg = JSON.parse(payload.body);
            setMessages((prev) => [...prev, msg]);
          });
          subscribedRef.current = true; // ✅ Prevent future subscriptions
        }
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (client.connected) {
        client.deactivate();
      }
      subscribedRef.current = false; // 🔁 Reset on cleanup
    };
  }, []); // ✅ run only once on mount

  const sendMessage = () => {
    const client = stompClientRef.current;
    if (client && client.connected && sender && message) {
      const chatMessage = { sender, content: message };
      client.publish({
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
