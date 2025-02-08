import React, { createContext, useEffect, useState, ReactNode } from "react";
import { app, auth, db } from "../firebase/firebaseConfig";
import { User } from "firebase/auth"; // Import Firebase User type

// Define types for context values
interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  db: typeof db;
}

interface FirebaseContextType {
  db: typeof db;
  app:typeof app
}

// Create Contexts
export const AuthContext = createContext<AuthContextType | null>(null);
export const FirebaseContext = createContext<FirebaseContextType | null>(null);

interface ContextProps {
  children: ReactNode;
}

const Context: React.FC<ContextProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user:User|null) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, db }}>
      <FirebaseContext.Provider value={{ db,app }}>
        {children}
      </FirebaseContext.Provider>
    </AuthContext.Provider>
  );
};

export default Context;
