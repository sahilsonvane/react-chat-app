import React, { useContext, useEffect, useState } from "react";
import "./LeftSidebar.css";
import assets from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import { db, logout } from "../../config/firebase.js";
import {ref, get,push, set, update} from "firebase/database";
import { AppContext } from "../../context/appContext";
import { toast } from "react-toastify";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { userData, chatData,chatUser, chatVisible, setChatVisible, setChatUser, setMessagesId, messagesId } = useContext(AppContext);
  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  const inputHandler = async (e) => {
    try {
      const input = e.target.value;

      if (input) {
        setShowSearch(true)
        const usersRef = ref(db, "users");
        const collection = await get(usersRef);

        if (collection.exists()) {
          const allUsers = collection.val();
          const matchingUsers = Object.values(allUsers).filter(
            (user) => user.username.toLowerCase() === input.toLowerCase()
          );
          if (!matchingUsers.empty && matchingUsers[0]?.id !== userData.id) {
            let userExist = false;
                       
            chatData.map((user)=>{
              if(user.rId === matchingUsers[0]?.id ){
                userExist = true;
              }

            })
            if(!userExist){
              setUser(matchingUsers[0]);
              
            }

          }else{
            setUser(null)
          }
        }
      }else{
        setShowSearch(false)
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addChat = async ()=>{
    try {
      if (!user) {
        console.error("User not selected.");
        return;
      }
  
      // References
      const messagesRef = ref(db, "messages");
      const senderChatRef = ref(db, `chats/${userData.id}/chatData`);
      const receiverChatRef = ref(db, `chats/${user.id}/chatData`);
  
      // Create a new message entry
      const newMsgRef = push(messagesRef);
      await set(newMsgRef, {
        createdAt: Date.now(),
        messages: [],
      });
  
      // Fetch existing chat data for sender
      const senderSnapshot = await get(senderChatRef);
      const senderChatData = senderSnapshot.exists() ? senderSnapshot.val() : {};
  
      // Fetch existing chat data for receiver
      const receiverSnapshot = await get(receiverChatRef);
      const receiverChatData = receiverSnapshot.exists() ? receiverSnapshot.val() : {};
  
      // Convert object to array
      const senderChatArray = Object.values(senderChatData);
      const receiverChatArray = Object.values(receiverChatData);
  
      // New chat entry
      const newChatEntry = {
        lastMessage: "",
        messageId: newMsgRef.key,
        messageSeen: true,
        rId: user.id,
        updatedAt: Date.now(),
      };
  
      // Append new entry to array
      senderChatArray.push(newChatEntry);
      receiverChatArray.push({ ...newChatEntry, rId: userData.id });
  
      // Convert array back to object with numeric keys
      const updatedSenderChatData = Object.assign({}, senderChatArray);
      const updatedReceiverChatData = Object.assign({}, receiverChatArray);
  
      // Update Firebase
      await update(ref(db, `chats/${userData.id}`), { chatData: updatedSenderChatData });
      await update(ref(db, `chats/${user.id}`), { chatData: updatedReceiverChatData });
      
      const uSnap = await get(ref(db, `users/${user.id}`))
      const uData = uSnap.val();
      setChat({
        messageId: newMsgRef.key,
        lastMessage: "",
        rId: user.id,
        updatedAt: Date.now(),
        messageSeen: true,
        userData: uData
      })

      setShowSearch(false)
      setChatVisible(true)
      
    } catch (error) {
      console.error("Error in addChat:", error);
    }
  }

  const setChat = async (item)=>{
    try {
      setMessagesId(item.messageId)
      setChatUser(item)
      const userChatsRef = ref(db, `chats/${userData.id}`)
      const userChatsSnap = await get(userChatsRef)
      const userChatsData = userChatsSnap.val();
      const chatIndex = userChatsData.chatData.findIndex((c)=> c.messageId === item.messageId)
      userChatsData.chatData[chatIndex].messageSeen = true;
  
      await update(userChatsRef,{chatData:userChatsData.chatData})
      setChatVisible(true);
    } catch (error) {
      toast.error(error.message)
      console.error(error);
      
    }
   
  }

  useEffect(()=>{
    const updateChatUserData = async ()=>{
      if(chatUser){
        const userRef = ref(db, `users/${chatUser.userData.id}`);
        const userSnap = await get(userRef)
        const userdata = userSnap.val()

        setChatUser(prev =>({...prev, userData: userdata}))
      }
    }
    updateChatUserData()
  },[chatData])

  return (
    <div className={`ls ${chatVisible? "hidden" : ""}`}>
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo} className="logo" />
          <div className="menu">
            <img src={assets.menu_icon} />
            <div className="sub-menu">
              <p onClick={() => navigate("/profile")}>Edit Profile</p>
              <hr />
              <p onClick={()=> logout()}>Logout</p>
            </div>
          </div>
        </div>
        <div className="ls-search">
          <img src={assets.search_icon} alt="" />
          <input
            onChange={inputHandler}
            type="text"
            placeholder="Search here.."
          />
        </div>
      </div>
      <div className="ls-list">
        {showSearch && user 
        ?<div onClick={addChat} className="friends add-user">
          <img src={user.avatar}  />
          <p>{user.name}</p>
        </div> 
        : chatData.map((item, index) => (
          <div onClick={()=> setChat(item)}  key={index} className={`friends ${item.messageSeen|| item.messageId === messagesId ? "" : "border"}`}>
            <img src={item.userData.avatar} alt="" />
            <div>
              <p>{item.userData.name}</p>
              <span>{item.lastMessage}</span>
            </div>
          </div>
        )) }
        
      </div>
    </div>
  );
};

export default LeftSidebar;
