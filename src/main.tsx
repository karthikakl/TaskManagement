
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Context from './store/Context.tsx'
import { FirebaseContext } from './store/Context.tsx'
import { app,db } from './firebase/firebaseConfig.ts'


createRoot(document.getElementById('root')!).render(
  <FirebaseContext.Provider value={{db,app}}>
   <Context>  
     <App />
     </Context>
  </FirebaseContext.Provider>
    
  
   
  
)
