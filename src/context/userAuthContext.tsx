import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User 
} from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';

interface IUserAuthProviderProps {
  children: React.ReactNode;
}

type AuthContextData = {
  user: User | null;
  logout: typeof logout;
  googleSignIn: typeof googleSignIn;
};

const logout = async () => {
  signOut(auth)
};

const googleSignIn = async () => {
  
    const googleAuthProvider = new GoogleAuthProvider();
    return signInWithPopup(auth, googleAuthProvider); 
};

export const userAuthContext = createContext<AuthContextData>({
  user: null,
  logout,
  googleSignIn,
});

export const UserAuthProvider: React.FunctionComponent<IUserAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('Logged in user:', user);
        setUser(user);
        
      }
      return () =>{
        unsubscribe()
      }
    });
  });

  const value: AuthContextData = {
    user,
    logout,
    googleSignIn,
  };

  return(<userAuthContext.Provider value={value}>{children}</userAuthContext.Provider>) ;
}

export const useUserAuth =()=>{
  return useContext(userAuthContext)
}