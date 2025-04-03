import React, { useContext, useEffect, useState } from "react";
import "./ChatBox.css";
import assets from "../../assets/assets";
import { AppContext } from "../../context/appContext";
import { ref, get, onValue, update } from "firebase/database";
import { db } from "../../config/firebase";
import { toast } from "react-toastify";
import upload from "../../lib/upload";

const ChatBox = () => {
  const { userData, messagesId, chatUser, messages, setMessages, chatVisible, setChatVisible } =
    useContext(AppContext);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    try {
      if (input && messagesId) {
        const messagesRef = ref(db, `messages/${messagesId}/messages`);

        // Fetch existing messages (convert object to array if necessary)
        const snapshot = await get(messagesRef);
        const existingMessages = snapshot.exists()
          ? Object.values(snapshot.val())
          : [];

        // Append new message
        const newMessage = {
          sId: userData.id,
          text: input,
          createdAt: Date.now(),
        };

        await update(ref(db, `messages/${messagesId}/messages`), {
          [existingMessages.length]: newMessage, // Adds message as next index
        });

        // Update chat data for both users
        const userIds = [chatUser.rId, userData.id];

        for (const id of userIds) {
          const userChatsRef = ref(db, `chats/${id}`);
          const userChatsSnap = await get(userChatsRef);

          if (userChatsSnap.exists()) {
            const userChatData = userChatsSnap.val();

            // Ensure chatData is an array
            const chatDataArray = userChatData.chatData
              ? Object.values(userChatData.chatData)
              : [];

            const chatIndex = chatDataArray.findIndex(
              (c) => c.messageId === messagesId
            );
            if (chatIndex !== -1) {
              chatDataArray[chatIndex].lastMessage = input.slice(0, 30);
              chatDataArray[chatIndex].updatedAt = Date.now();
              if (chatDataArray[chatIndex].rId === userData.id) {
                chatDataArray[chatIndex].messageSeen = false;
              }
            }

            await update(userChatsRef, { chatData: chatDataArray });
          }
        }
      }
    } catch (error) {
      toast.error(error.message);
      console.error("Error in sendMessage:", error);
    }

    setInput("");
  };

  const sendImage = async (e) => {
    try {
      const fileUrl = await upload(e.target.files[0]);
      if (fileUrl && messagesId) {
        const messagesRef = ref(db, `messages/${messagesId}/messages`);

        // Fetch existing messages (convert object to array if necessary)
        const snapshot = await get(messagesRef);
        const existingMessages = snapshot.exists()
          ? Object.values(snapshot.val())
          : [];

        // Append new message
        const newMessage = {
          sId: userData.id,
          image: fileUrl,
          createdAt: Date.now(),
        };

        await update(ref(db, `messages/${messagesId}/messages`), {
          [existingMessages.length]: newMessage, // Adds message as next index
        });

        // Update chat data for both users
        const userIds = [chatUser.rId, userData.id];

        for (const id of userIds) {
          const userChatsRef = ref(db, `chats/${id}`);
          const userChatsSnap = await get(userChatsRef);

          if (userChatsSnap.exists()) {
            const userChatData = userChatsSnap.val();

            // Ensure chatData is an array
            const chatDataArray = userChatData.chatData
              ? Object.values(userChatData.chatData)
              : [];

            const chatIndex = chatDataArray.findIndex(
              (c) => c.messageId === messagesId
            );
            if (chatIndex !== -1) {
              chatDataArray[chatIndex].lastMessage = "Image";
              chatDataArray[chatIndex].updatedAt = Date.now();
              if (chatDataArray[chatIndex].rId === userData.id) {
                chatDataArray[chatIndex].messageSeen = false;
              }
            }

            await update(userChatsRef, { chatData: chatDataArray });
          }
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const convertTimeStamp = (time) => {
    let date = new Date(time);
    let hour = date.getHours();
    let minute = date.getMinutes();
    let period = hour >= 12 ? "PM" : "AM";

    hour = hour % 12 || 12;
    minute = minute < 10 ? "0" + minute : minute;
    hour = hour < 10 ? "0" + hour : hour;

    return hour + ":" + minute + " " + period;
  };

  useEffect(() => {
    if (messagesId) {
      const msgsRef = ref(db, `messages/${messagesId}/messages`);
  
      const unSub = onValue(msgsRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const messagesArray = Object.values(data);
          setMessages([...messagesArray].reverse()); // Avoid direct mutation
        } else {
          console.warn("No messages found for this chat.");
          setMessages([]); // Prevent old messages from persisting
        }
      });
  
      // Keydown event listener for "Enter" key
      const handleKeyDown = (e) => {
        if (e.key === "Enter" && input.trim()) {
          sendMessage();
        }
      };
  
      window.addEventListener("keydown", handleKeyDown);
  
      return () => {
        unSub();
        window.removeEventListener("keydown", handleKeyDown); // Correct cleanup
      };
    }
  }, [messagesId, input]); // Added input dependency to track its value
  
  
  return chatUser ? (
    <div className={`chat-box ${chatVisible? "" :"hidden"}`}>
      
      <div className="chat-user">
        <img onClick={()=> setChatVisible(false)} src={assets.arrow_icon} className="arrow" />
        <img src={chatUser.userData.avatar} />
        <p>
          {chatUser.userData.name}{" "}
          {Date.now() - chatUser.userData.lastSeen <= 70000 ?<img className="dot" src={assets.green_dot} /> : null }
          
        </p>
        <img src={assets.help_icon} className="help" />
      </div>

      <div className="chat-msg">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.sId === userData.id ? "s-msg" : "r-msg"}
          >
            {msg["image"] ? (
              <img className="msg-img" src={msg.image} />
            ) : (
              <p className="msg">{msg.text}</p>
            )}

            <div>
              <img
                src={
                  msg.sId === userData.id
                    ? userData.avatar
                    : chatUser.userData.avatar
                }
              />
              <p>{convertTimeStamp(msg.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          placeholder="Send a message.."
        />
        <input
          onChange={sendImage}
          type="file"
          id="image"
          accept="image/png, image/jpeg"
          hidden
        />
        <label htmlFor="image">
          <img src={assets.gallery_icon} />
        </label>
        <img onClick={sendMessage} src={assets.send_button} alt="" />
      </div>
    </div>
  ) : (
    <div className={`chat-welcome ${chatVisible? "" :"hidden"}`}>
      <img src={assets.logo_icon} alt="" />
      <p>Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatBox;
