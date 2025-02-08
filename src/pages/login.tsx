import * as React from 'react';
import { useUserAuth } from '../context/userAuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
// import { db } from "../firebase/firebaseConfig";
// import { doc, setDoc, getDoc } from "firebase/firestore";

interface ILoginProps {
  // You can define props here if needed, for example:
  // onLogin: () => void;
}

const Login: React.FunctionComponent<ILoginProps> = () => {
  const {googleSignIn} =useUserAuth();
  const navigate = useNavigate()

  // useEffect(()=>{
  //   if(user){
  //     console.log('User logged in,navigating to home....')
  //     console.log('Logged-in user details:', user);
  //     navigate('/home')
  //   }

  // },[user,navigate])
  
    const handleGoogleLogin = async (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
      
        try {
         const userCredential = await googleSignIn();
         const user = userCredential.user

         console.log('logged in is',user)

         const userRef = doc(db,'users',user.uid)
         const userSnap = await getDoc(userRef)

         if(!userSnap.exists()){
          await setDoc(userRef,{
            userId:user.uid,
            email:user.email,
            displayName:user.displayName,
            photo:user.photoURL,
            todo:[],
            inProgress:[],
            completed:[]
          })
         }
          
           navigate("/home");
      
        } catch (error) {
          console.error("Error during Google login:", error);
        }
      };
      

  return (
    <div className="flex items-center justify-center sm:justify-start min-h-screen">
          
          
         
          

      <div
        className="w-full max-w-md sm:w-[365.9px] h-auto p-6 rounded-lg flex flex-col justify-between"
      >
        <h1 className="text-2xl sm:text-4xl font-bold text-[#7B1984] mb-4 text-center sm:text-left">TaskBuddy</h1>
        <p className="text-sm sm:text-xl text-black mb-6 text-center sm:text-left">
          Streamline your workflow and track progress effortlessly with our all-in-one task management app
        </p>
        <button
          onClick={handleGoogleLogin}
          className="w-full sm:w-64 bg-[#292929] text-white px-8 py-3 rounded-full hover:bg-[#7B1984] transition duration-300"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
