import {ref,get, update,onValue} from 'firebase/database'
import { createContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppContextProvider = (props)=>{
    const navigate = useNavigate()
    const [userData, setUserData] = useState(null)
    const [chatData, setChatData] = useState(null)
    const [messagesId, setMessagesId] = useState(null)
    const [messages, setMessages] = useState([])
    const [chatUser, setChatUser] = useState(null)
    const [chatVisible, setChatVisible] = useState(false)
    
    
    const loadUserData = async (userId)=>{
        try {
            const userRef = ref(db, `users/${userId}`)
            const userSnap = await get(userRef);
            const userData = userSnap.val();
            setUserData(userData)
            
            if(userData.avatar && userData.name){
                navigate('/chat')
            }else{
                navigate('/profile')
            }
            await update(userRef,{lastSeen:Date.now()})
            
            setInterval(async ()=> {
                if(auth.chatUser){
                await update(userRef,{lastSeen:Date.now()})
                }
            },60000)
        } catch (error) {
            console.error(error);
            
        }
    }

    useEffect(()=>{
        if (userData) {
            const chatRef = ref(db, `chats/${userData.id}`);
            const unSub = onValue(chatRef, async (snapshot) => {
              if (!snapshot.exists()) {
                setChatData([]); // No chat data
                return;
              }
        
              const chatItems = snapshot.val().chatData || {}; // Ensure it's an object
              const chatArray = Object.values(chatItems); // Convert object to array
        
              // Fetch user data concurrently
              const tempData = await Promise.all(
                chatArray.map(async (item) => {
                  if (!item.rId) return null; // Prevent errors if `rId` is missing
        
                  const userRef = ref(db, `users/${item.rId}`); // Corrected `users/${item.rId}`
                  const userSnap = await get(userRef);
        
                  return userSnap.exists()
                    ? { ...item, userData: userSnap.val() }
                    : { ...item, userData: null }; // Handle missing user
                })
              );
        
              setChatData(tempData.filter(Boolean).sort((a, b) => b.updatedAt - a.updatedAt));
            });
        
            return () => unSub(); // Unsubscribe when component unmounts
          }
    },[userData])

    const value = {
        userData,setUserData,
        chatData,setChatData,
        loadUserData,
        messages,setMessages,
        messagesId,setMessagesId,
        chatUser,setChatUser,
        chatVisible,setChatVisible,
    }
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider