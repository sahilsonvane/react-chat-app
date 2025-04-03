import React, { useEffect, useState,useContext } from 'react'
import "./ProfileUpdate.css"
import assets from '../../assets/assets'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../../config/firebase'
import { ref, get,update } from "firebase/database"; // Realtime Database functions
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import upload from '../../lib/upload' 
import { AppContext } from '../../context/AppContext.jsx'

const ProfileUpdate = () => {
  const [image, setImage] = useState(false)
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [uid,setUid] = useState("")
  const [prevImage,setPrevImage] = useState("")
  const navigate = useNavigate()
  const {setUserData} = useContext(AppContext)

    const profileUpdate = async (event)=>{
      event.preventDefault();
      try {
        if(!prevImage && !image){
          toast.error("Upload Profile Picture")
        }
        const docRef = ref(db,`users/${uid}`)
        if(image){
          const imgUrl = await upload(image)
          setPrevImage(imgUrl)
          console.log("imgUrl: ", imgUrl);
          console.log("bio: ", bio);
          console.log("name: ", name)
          
          await update(docRef,{
            avatar:imgUrl,
            bio:bio,
            name:name
          })
        }else{
          await update(docRef,{
            bio:bio,
            name:name
          })
        }
        const snap = await get(docRef)
        setUserData(snap.val())
        navigate('/chat')
      } catch (error) {
        console.error(error);
        toast.error(error.message)
      }
    }


  useEffect(()=>{
    onAuthStateChanged(auth, async (user)=>{
      if(user){
        setUid(user.uid)
        const dbRef = ref(db,`users/${user.uid}`)
        const docSnap = await get(dbRef);
        if(docSnap.val().name){
          setName(docSnap.val().name)
        }
        if(docSnap.val().bio){
          setBio(docSnap.val().bio)
        }
        if(docSnap.val().avatar){
          setPrevImage(docSnap.val().avatar)
        }
        
      }else{
        navigate('/')
      }
    })
  },[])

  return (
    <div className='profile'>
      <div className="profile-container">
        <form onSubmit={profileUpdate}>
          <h3>Profile Details</h3>
          <label htmlFor="avatar">
            <input onChange={(e)=> setImage(e.target.files[0])} type="file" id="avatar" accept='.png, .jpg, .jpeg' hidden />
            <img src={image ? URL.createObjectURL(image) : assets.avatar_icon} alt="" />
            Upload profile image
          </label>
          <input onChange={(e)=> setName(e.target.value)} value={name} type="text" placeholder='Your name' required />
          <textarea onChange={(e)=> setBio(e.target.value)} value={bio} placeholder="Write profile bio"></textarea>
          <button type="submit">Save</button>
        </form>
        <img className='profile-pic' src={image ? URL.createObjectURL(image) : prevImage? prevImage : assets.logo_icon} alt="" />
      </div>
    </div>
  )
}

export default ProfileUpdate