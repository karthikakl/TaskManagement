
import { ToastContainer } from 'react-toastify'
import { RouterProvider } from 'react-router-dom'
import {router} from './routes'


function App() {
  

  return (
    <>
     <ToastContainer position='top-right' autoClose={3000}/>
     <RouterProvider router={router}/>
    </>
   
  )
}

export default App
