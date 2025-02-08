import * as React from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/ReactToastify.css'
import { useState,useContext } from 'react';
import { useUserAuth } from "../context/userAuthContext";
import { AuthContext, FirebaseContext } from "../store/Context";
import { getAuth } from "firebase/auth";
import { addTask } from '../Services/services';

interface ITaskModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TaskModal: React.FunctionComponent<ITaskModalProps> = ({ isOpen, onClose }) => {

    const authContext = useContext(AuthContext);
    const firebaseContext = useContext(FirebaseContext);

    if (!authContext || !firebaseContext) {
        return <p>Loading...</p>;
      }
    
      const { user } = authContext;
      const { app } = firebaseContext;
    
      const auth = getAuth(app);
      const currentUser = auth.currentUser

      console.log('Current user:',currentUser)

    const [taskName, setTaskName] = useState<string>('');
    const [description,setDescription] = useState<string>('');
    const [category, setCategory] = useState<string>('');
    const [dueDate,setDueDate] = useState<string>('');
    const [status,setStatus]=useState<string>('pending')
    const [file, setFile] = useState<File | null>(null);

    if (!isOpen) return null;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFile(event.target.files[0]);
        }
    };

    const handleCreateTask = async()=>{
        if(!taskName||!description||!category||!dueDate){
            toast.error("Please fill all the required fields!");
            return
        }

        if(!currentUser){
            toast.error("User is not logged in!");
            return
        }
        try {
            await addTask( currentUser?.uid??'',
                taskName,
                category,
                description,
                file?file.name:null
            );
            toast.success("Task added successfully! 🎉");
            onClose()
            window.location.reload()
        } catch (error) {
            console.error("Error adding task:", error);
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full sm:w-96 md:w-2/3 lg:w-1/2 xl:w-1/3 animate-fadeIn relative">
                <h2 className="text-xl font-bold mb-4">Add Task</h2>

                <input 
                    type="text"
                    value={taskName} 
                    onChange={(e)=>setTaskName(e.target.value)}
                    placeholder="Task Title" 
                    className="w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-800"
                />

                <textarea
                    value={description}
                    onChange={(e)=>setDescription(e.target.value)}
                    placeholder="Task Description"
                    className="w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-800"
                ></textarea>

                {/* Task Category, Due Date, Task Status - Same Line */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {/* Task Category */}
                    <div>
                        <label className="block mb-1 text-sm font-light"> Task Category*</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCategory('work')}
                                className={`w-full p-2 border rounded-3xl ${category === 'work' ? 'bg-purple-800 text-white' : 'bg-gray-200'}`}
                            >
                                Work
                            </button>
                            <button
                                onClick={() => setCategory('personal')}
                                className={`w-full p-2 border rounded-3xl ${category === 'personal' ? 'bg-purple-800 text-white' : 'bg-gray-200'}`}
                            >
                                Personal
                            </button>
                        </div>
                    </div>

                    {/* Due Date */}
                    <div>
                        <label className="block mb-1 text-sm font-light">Due Date*</label>
                        <input 
                            type="date" 
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-800"
                        />
                    </div>

                    {/* Task Status */}
                    <div>
                        <label className="block mb-1 text-sm font-light">Task Status*</label>
                        <select 
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-800"
                        >
                            <option value="pending">Pending</option>
                            <option value="pending">InProgress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>````

                {/* File Upload Section */}
                <div className="mb-4">
                    <label className="block mb-1 text-sm font-medium">Attachment</label>
                    <div className="border-dashed border-2 border-gray-300 p-4 text-center rounded-md">
                        <p className="text-sm mb-2">{file ? `File: ${file.name}` : "Drop your files here or click to browse"}</p>
                        <input 
                            type="file" 
                            onChange={handleFileChange}
                            className="hidden"
                            id="fileInput"
                        />
                        <label 
                            htmlFor="fileInput" 
                            className="px-4 py-2 bg-purple-800 text-white rounded-md cursor-pointer hover:bg-gray-600"
                        >
                            {file ? "Update File" : "Choose File"}
                        </label>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="px-5 py-2 bg-gray-300 rounded-3xl hover:bg-gray-600">Cancel</button>
                    <button onClick={handleCreateTask} className="px-5 py-2 bg-purple-800 text-white rounded-3xl hover:bg-gray-600">Create</button>
                </div>
            </div>
        </div>
    );
};

export default TaskModal;
