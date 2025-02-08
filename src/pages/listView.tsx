import * as React from 'react';
import { toast } from "react-toastify"; 
import { useState, useEffect } from 'react';
import EditModal from './editModal';
import ConfirmModal from './confirmModal'; // Import your ConfirmModal component
import { getUsersTasks ,deleteTask } from '../Services/services';
import { auth } from '../firebase/firebaseConfig';

interface IListViewProps {
  searchQuery:string;
  categoryFilter:string;
  dueDate:string;
}

interface ITask {
  id: string;
  taskName: string;
  description?: string;
  category: string;
  status?: string;
  dueDate?: string;
}

const ListView: React.FunctionComponent<IListViewProps> = (props) => {
  const [tasks, setTasks] = React.useState<ITask[]>([]);

  const user = auth.currentUser;

  const [isTaskListOpen, setIsTaskListOpen] = React.useState(false);
  const [isInProgressOpen, setIsInProgressOpen] = React.useState(false);
  const [isCompletedOpen, setIsCompletedOpen] = React.useState(false);
  const [isModalOpen, setModalOpen] = useState(false); // Edit Modal
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false); // Confirm Modal
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null); // Store selected taskId for editing
  const [isMenuOpen, setIsMenuOpen] = React.useState<number | null>(null); // State to track which task's menu is open
  const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set()); // Store IDs of checked tasks

  // Toggle functions for dropdowns
  const toggleTaskList = () => setIsTaskListOpen((prev) => !prev);
  const toggleInProgress = () => setIsInProgressOpen((prev) => !prev);
  const toggleCompleted = () => setIsCompletedOpen((prev) => !prev);

  // Toggle for task options menu
  const toggleMenu = (index: number) => {
    setIsMenuOpen(isMenuOpen === index ? null : index);
  };

  // Handle delete confirmation
  const handleDeleteClick = (task: string) => {
    setSelectedTaskId(task);
    setConfirmModalOpen(true); // Open the confirmation modal
  };

  // Handle confirmation of deletion
  const handleConfirmDelete = () => {
    if (selectedTaskId && user) {
      deleteTask(selectedTaskId, user.uid)  // Call the deleteTask function from the service
        .then(() => {
          setConfirmModalOpen(false); // Close the modal
          setSelectedTaskId(null); // Reset the selected taskId
          toast.success("Task deleted successfully!"); // Show success toast
          setTasks((prevTasks) => prevTasks.filter(task => task.id !== selectedTaskId));
        })
        .catch((error) => {
          console.error("Error while deleting task:", error);
        });
    }
  };

  // Handle cancellation of deletion
  const handleCancelDelete = () => {
    setConfirmModalOpen(false);
    setSelectedTaskId(null);
  };

   // Handle checkbox change
   const handleCheckboxChange = (taskId: string) => {
    const newCheckedTasks = new Set(checkedTasks);
    if (newCheckedTasks.has(taskId)) {
        newCheckedTasks.delete(taskId);
    } else {
        newCheckedTasks.add(taskId);
    }
    setCheckedTasks(newCheckedTasks);
};

// Handle delete multiple tasks
const handleDeleteMultiple = () => {
    if (checkedTasks.size === 0) {
        toast.warn("No tasks selected for deletion.");
        return;
    }

    setConfirmModalOpen(true); // Open confirmation modal
};

const handleConfirmMultipleDelete = () => {
  if (user) {
    Promise.all(
      Array.from(checkedTasks).map((taskId) => deleteTask(taskId, user.uid))
    )
      .then(() => {
        setConfirmModalOpen(false);
        setCheckedTasks(new Set()); // Clear checked tasks
        toast.success("Selected tasks deleted successfully!");
        setTasks((prevTasks) =>
          prevTasks.filter((task) => !checkedTasks.has(task.id))
        );
      })
      .catch((error) => {
        console.error("Error deleting tasks:", error);
        toast.error("Error deleting tasks. Please try again.");
      });
  }
};

const handleCancelMultipleDelete = () => {
  setConfirmModalOpen(false);
}

  useEffect(() => {
    if (user) {
      getUsersTasks(user.uid).then((fetchedTasks) => {
        // Ensure each task has the 'id' and 'name' and other necessary fields like category, status, etc.
        const tasksWithDetails = fetchedTasks?.map((task) => ({
          id: task.id,
          taskName: task.taskName, 
          description: task.description, 
          category: task.category, 
          status: task.status, 
          dueDate:task.dueDate
        }));
        setTasks(tasksWithDetails || []);
      });
    }
  }, [user]);
  
  const {searchQuery,categoryFilter,dueDate} = props

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.taskName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter ? task.category === categoryFilter : true;

    const matchesDueDate = dueDate === 'today'
        ? task.dueDate ? new Date(task.dueDate).toLocaleDateString() === new Date().toLocaleDateString() : false // Handle undefined dueDate
        : dueDate === 'this-week'
            ? task.dueDate
                ? new Date(task.dueDate).getTime() >= new Date().getTime() &&
                  new Date(task.dueDate).getTime() <= new Date(new Date().setDate(new Date().getDate() + 7)).getTime()
                : false // Handle undefined dueDate
            : true;

    return matchesSearch && matchesCategory && matchesDueDate;
});

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4 text-sm font-semibold bg-gray-100 p-2 rounded-t-lg">
        <div>Task Name</div>
        <div>Date On</div>
        <div>Status</div>
        <div>Category</div>
      </div>

      {/* Task List Dropdown */}
      <div className="border rounded-lg shadow-md">
  {/* Todo Header */}
  <div className="flex rounded-lg justify-between items-center bg-[#FAC3FF] p-3">
    <button className="font-medium w-full text-left" onClick={toggleTaskList}>
      Todo
    </button>
    <span className={`transition-transform ${isTaskListOpen ? 'rotate-180' : ''}`}>
      {isTaskListOpen ? '▼' : '>'}
    </span>
  </div>

  {/* Task List */}
  {isTaskListOpen && (
   <div className="mt-2 p-4 bg-gray-100 rounded-b-lg">
   {filteredTasks.length === 0 ? (
     <p className="text-center text-gray-500">No tasks at the moment.</p>
   ) : (
     <ul>
       {filteredTasks.map((task, index) => (
         <li
           key={index}
           className="flex items-center justify-between p-4 border-b border-gray-300"
         >
           {/* Checkbox with Name */}
           <div className="flex items-center space-x-2 w-full sm:w-1/4">
             <input
               type="checkbox"
               checked={checkedTasks.has(task.id)}
               onChange={() => handleCheckboxChange(task.id)}
               className="mr-2"
             />
             <p className="text-black font-semibold text-sm sm:text-base">{task.taskName}</p>
           </div>
 
           {/* Due Date */}
           <p className="text-gray-500 text-sm w-full sm:w-1/4 text-center">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</p>
 
           {/* Status */}
           <p className={`text-sm w-full sm:w-1/4 text-center ${task.status === 'completed' ? 'text-green-500' : 'text-orange-500'}`}>
             {task.status}
           </p>
 
           {/* Category */}
           <p className="text-black text-sm w-full sm:w-1/4 text-center">{task.category}</p>
 
           {/* Task Options (Edit/Delete) */}
           <div className="relative">
             <button onClick={() => toggleMenu(index)} className="text-gray-500 hover:text-black">
               ...
             </button>
             {isMenuOpen === index && (
               <div className="absolute right-2 top-8 bg-white border border-gray-300 shadow-lg rounded-md p-2 w-32">
                 <button
                   onClick={() => {
                     setSelectedTaskId(task.id);
                     setModalOpen(true);
                   }}
                   className="block text-blue-500 py-1 w-full text-left hover:bg-gray-100"
                 >
                   Edit
                 </button>
                 <button
                   onClick={() => handleDeleteClick(task.id)}
                   className="block text-red-500 py-1 w-full text-left hover:bg-gray-100"
                 >
                   Delete
                 </button>
               </div>
             )}
           </div>
         </li>
       ))}
     </ul>
   )}
 </div>
 
 
  
  )}
 {checkedTasks.size>1 &&(
  <button
                onClick={handleDeleteMultiple}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
                Delete Selected
            </button>
 )}
            
</div>





      {/* In Progress Dropdown */}
      <div className="border rounded-lg shadow-md">
  {/* In Progress Header */}
  <div className="flex rounded-lg justify-between items-center bg-[#85D9F1] p-2">
    <button className="font-medium w-full text-left" onClick={toggleInProgress}>
      In Progress
    </button>
    <span className={`transition-transform ${isInProgressOpen ? 'rotate-180' : ''}`}>
      {isInProgressOpen ? '▼' : '>'}
    </span>
  </div>

  {/* Task List */}
  {isInProgressOpen && (
    <div className="mt-2 p-2 bg-gray-100 rounded">
      {/* If no tasks in progress */}
      {tasks.filter((task) => task.status === "inProgress").length === 0 ? (
        <div className="flex justify-center items-center p-4 text-gray-500">
          <p>No tasks in progress at the moment.</p>
        </div>
      ) : (
        <ul>
          {tasks
            .filter((task) => task.status === "inProgress") // Filtering tasks
            .map((task, index) => (
              <li
                key={index}
                className="grid grid-cols-[1fr_auto] gap-4 items-center p-2 border-b border-gray-300"
              >
                {/* Task Details */}
                <div className="grid grid-cols-4 gap-4 items-center w-full">
                  <p className="text-black font-semibold">{task.taskName}</p>
                  <p className="text-gray-500 text-sm">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                  </p>
                  <p className="text-orange-500 text-sm">{task.status}</p>
                  <p className="text-black text-sm">{task.category}</p>
                </div>

                {/* Task Options (Edit/Delete) */}
                <div className="relative">
                  <button onClick={() => toggleMenu(index)} className="text-gray-500">...</button>
                  {isMenuOpen === index && (
                    <div className="absolute right-2 top-8 bg-white border border-gray-300 shadow-lg rounded-md p-2">
                      <button
                        onClick={() => {
                          setSelectedTaskId(task.id);
                          setModalOpen(true);
                        }}
                        className="block text-blue-500 py-1 w-full text-left"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(task.id)}
                        className="block text-red-500 py-1 w-full text-left"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
        </ul>
      )}
    </div>
  )}
  
</div>



      {/* Completed Dropdown */}
      <div className="border rounded-lg shadow-md">
  {/* Completed Header */}
  <div className={"flex rounded-lg justify-between items-center bg-[#CEFFCC] p-2 sm:p-2 md:p-2 lg:p-2"}>
    <button className={"font-medium w-full text-left"} onClick={toggleCompleted}>
      Completed
    </button>
    <span className={`transition-transform ${isCompletedOpen ? 'rotate-180' : ''}`}>
      {isCompletedOpen ? '▼' : '>'}
    </span>
  </div>

  {/* Task List */}
  {isCompletedOpen && (
    <div className="mt-2 p-2 bg-gray-100 rounded">
      {/* If no tasks completed */}
      {tasks.filter((task) => task.status === "completed").length === 0 ? (
        <div className="flex justify-center items-center p-4 text-gray-500">
          <p>No completed tasks at the moment.</p>
        </div>
      ) : (
        <ul>
          {tasks
            .filter((task) => task.status === "completed") // Filtering completed tasks
            .map((task, index) => (
              <li
                key={index}
                className="grid grid-cols-[1fr_auto] gap-4 items-center p-2 border-b border-gray-300"
              >
                {/* Task Details */}
                <div className="grid grid-cols-4 gap-4 items-center w-full">
                  <p className="text-black font-semibold">{task.taskName}</p>
                  <p className="text-gray-500 text-sm">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                  </p>
                  <p className="text-green-500 text-sm">{task.status}</p>
                  <p className="text-black text-sm">{task.category}</p>
                </div>

                {/* Task Options (Edit/Delete) */}
                <div className="relative">
                  <button onClick={() => toggleMenu(index)} className="text-gray-500">...</button>
                  {isMenuOpen === index && (
                    <div className="absolute right-2 top-8 bg-white border border-gray-300 shadow-lg rounded-md p-2">
                      <button
                        onClick={() => {
                          setSelectedTaskId(task.id);
                          setModalOpen(true);
                        }}
                        className="block text-blue-500 py-1 w-full text-left"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(task.id)}
                        className="block text-red-500 py-1 w-full text-left"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
        </ul>
      )}
    </div>
  )}
</div>


      {/* Edit Modal */}
      <EditModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        taskId={selectedTaskId} // Pass the selected taskId for editing
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />

<ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={handleCancelMultipleDelete} // Updated close handler
                onConfirm={handleConfirmMultipleDelete} // Updated confirm handler
               
            />
    </div>
    
  );
  
};

export default ListView;
