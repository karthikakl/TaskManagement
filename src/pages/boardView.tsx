import * as React from "react";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import EditModal from "./editModal";
import ConfirmModal from "./confirmModal"; // Import your ConfirmModal component
import { getUsersTasks, deleteTask } from "../Services/services";
import { auth } from "../firebase/firebaseConfig";

interface IBoardViewProps {}

interface ITask {
  id: string;
  taskName: string;
  description?: string;
  category: string;
  status?: string;
  createdAt?: string;
}

const BoardView: React.FunctionComponent<IBoardViewProps> = () => {
  const [tasks, setTasks] = React.useState<ITask[]>([]);
  // const [showOptions, setShowOptions] = React.useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false); // Edit Modal
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false); // Confirm Modal
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null); // Store selected taskId for editing
  const [isMenuOpen, setIsMenuOpen] = React.useState<string | null>(null); // State to track which task's menu is open
  const user = auth.currentUser;

  // Toggle for task options menu
  const toggleMenu = (taskId: string) => {
    setIsMenuOpen(isMenuOpen === taskId ? null : taskId);
  };

  const handleDeleteClick = (task: string) => {
    setSelectedTaskId(task);
    setConfirmModalOpen(true); // Open the confirmation modal
  };

  const handleConfirmDelete = () => {
    if (selectedTaskId && user) {
      deleteTask(selectedTaskId, user.uid) // Call the deleteTask function from the service
        .then(() => {
          setConfirmModalOpen(false); // Close the modal
          setSelectedTaskId(null); // Reset the selected taskId
          toast.success("Task deleted successfully!"); // Show success toast
          setTimeout(() => {
            window.location.reload(); // Reload the page after a short delay
          }, 2000);
        })
        .catch((error) => {
          console.error("Error while deleting task:", error);
        });
    }
  };

  const handleCancelDelete = () => {
    setConfirmModalOpen(false);
    setSelectedTaskId(null);
  };

  // const handleOptionsClick = (taskId: string) => {
  //   setShowOptions(taskId === showOptions ? null : taskId);
  // };

  useEffect(() => {
    if (user) {
      getUsersTasks(user.uid).then((fetchedTasks) => {
        const tasksWithDetails = fetchedTasks?.map((task) => ({
          id: task.id,
          taskName: task.taskName,
          description: task.description,
          category: task.category,
          status: task.status,
        }));
        setTasks(tasksWithDetails || []);
      });
    }
  }, [user]);

  return (
    <div className="p-4">
      {/* Responsive layout for larger screens */}
      <div className="hidden sm:flex gap-4">
        {/* To Do Column */}
        <div className="flex flex-col w-full sm:w-1/3">
  <div className="bg-[#FAC3FF] p-4 rounded shadow-md mb-4">
    <h2 className="font-semibold text-xl mb-2 text-black">To Do</h2>
    {tasks.length === 0 ? (
      <p className="text-gray-500">No tasks at the moment</p>
    ) : (
      tasks.map((task) => (
        <div key={task.id} className="bg-white p-4 rounded shadow-sm mb-2 relative">
          <div className="flex justify-between items-center">
            <p className="text-black font-semibold">{task.taskName}</p>
            <button onClick={() => toggleMenu(task.id)} className="text-gray-500">...</button>
          </div>

          {isMenuOpen === task.id && (
            <div className="absolute right-2 top-8 border bg-white border-gray-300 shadow-lg rounded-md flex space-x-2 p-2">
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
      ))
    )}
  </div>
</div>


        {/* In Progress Column */}
        <div className="flex flex-col w-full sm:w-1/3">
        <div className="bg-[#85D9F1] p-4 rounded shadow-md mb-4">
  <h2 className="font-semibold text-xl mb-2 text-black">In Progress</h2>
  {tasks.filter((task) => task.status === "inProgress").length === 0 ? (
    <p className="text-gray-500">No tasks at the moment</p>
  ) : (
    tasks
      .filter((task) => task.status === "inProgress")
      .map((task) => (
        <div key={task.id} className="bg-white p-4 rounded shadow-sm mb-2 relative">
          <div className="relative">
            <div className="flex justify-between items-center">
              <p className="text-black font-semibold">{task.taskName}</p>
              <button onClick={() => toggleMenu(task.id)} className="text-gray-500">...</button>
            </div>
            {isMenuOpen === task.id && (
              <div className="absolute right-2 top-8 border bg-white border-gray-300 shadow-lg rounded-md flex space-x-2 p-2">
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
        </div>
      ))
  )}
</div>

        </div>

        {/* Complete Column */}
        <div className="flex flex-col w-full sm:w-1/3">
        <div className="bg-[#CEFFCC] p-4 rounded shadow-md mb-4">
  <h2 className="font-semibold text-xl mb-2 text-black">Complete</h2>
  {tasks.filter((task) => task.status === "completed").length === 0 ? (
    <p className="text-gray-500">No tasks at the moment</p>
  ) : (
    tasks
      .filter((task) => task.status === "completed")
      .map((task) => (
        <div key={task.id} className="bg-white p-4 rounded shadow-sm mb-2 relative">
          <div className="relative">
            <div className="flex justify-between items-center">
              <p className="text-black font-semibold">{task.taskName}</p>
              <button onClick={() => toggleMenu(task.id)} className="text-gray-500">...</button>
            </div>
            {isMenuOpen === task.id && (
              <div className="absolute right-2 top-8 border bg-white border-gray-300 shadow-lg rounded-md flex space-x-2 p-2">
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
        </div>
      ))
  )}
</div>

        </div>
      </div>

      {/* Stacked version for smaller screens */}
      <div className="sm:hidden">
        {/* To Do Column */}
        <div className="flex flex-col w-full">
          <h2 className="font-semibold text-xl mb-2 text-black">To Do</h2>
          {tasks
            .filter((task) => task.status === "todo")
            .map((task) => (
              <div key={task.id} className="bg-white p-4 rounded shadow-sm mb-2 relative">
                <p className="text-black font-semibold">{task.taskName}</p>
                <div className="relative">
                  <button onClick={() => toggleMenu(task.id)} className="text-gray-500">...</button>
                  {isMenuOpen === task.id && (
                    <div className="absolute right-2 top-8 border bg-white border-gray-300 shadow-lg rounded-md flex space-x-2 p-2">
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
              </div>
            ))}
        </div>

        {/* Repeat the same structure for In Progress and Complete */}
      </div>

      {/* Modal for Confirming Deletion */}
      {isConfirmModalOpen && (
        <ConfirmModal
          isOpen={isConfirmModalOpen}
          onConfirm={handleConfirmDelete}
          onClose={handleCancelDelete}
        />
      )}

      {/* Modal for Editing Task */}
      {isModalOpen && (
        <EditModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          taskId={selectedTaskId!}
        />
      )}
    </div>
  );
};

export default BoardView;
