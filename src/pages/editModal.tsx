import * as React from 'react';
import { useState, useEffect } from 'react';
import { getHistory, editTask, getTaskById } from '../Services/services';
import { toast } from 'react-toastify';

interface IEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string | null;
}

const EditModal: React.FunctionComponent<IEditModalProps> = ({
  isOpen,
  onClose,
  taskId,
}) => {
  if (!isOpen) return null;

  const [task, setTask] = useState<{
    taskName: string;
    description: string;
    category: string;
    dueDate: string;
    status: string;
    fileUrl: string | null;
  } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [activityLog, setActivityLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditVisible, setIsEditVisible] = useState(true);
  const [isLogVisible, setIsLogVisible] = useState(false);

  // Fetching task details
  useEffect(() => {
    const fetchTaskDetailsData = async () => {
      if (taskId) {
        setLoading(true);
        try {
          const fetchedTask = await getTaskById(taskId);
          if (fetchedTask) {
            setTask({
              taskName: fetchedTask.taskName || '',
              description: fetchedTask.description || '',
              category: fetchedTask.category || '',
              dueDate: fetchedTask.dueDate || '',
              status: fetchedTask.status || 'pending',
              fileUrl: fetchedTask.fileUrl!,
            });
          } else {
            console.error("Task not found");
            setTask(null);
          }
        } catch (error) {
          console.error('Error fetching task details:', error);
          setTask(null);
        } finally {
          setLoading(false);
        }
      } else {
        setTask(null);
        setLoading(false);
      }
    };

    fetchTaskDetailsData();
  }, [taskId]);

  // Fetching activity logs
  useEffect(() => {
    const fetchLogs = async () => {
      if (taskId) {
        try {
          const logs = await getHistory(taskId);
          if (Array.isArray(logs)) {
            const formattedLogs = logs.map((log: any) => {
              const timestamp = new Date(log.timestamp.seconds * 1000); // Convert seconds to milliseconds
              const formattedDate = timestamp.toLocaleString(); // Format to locale-specific date/time
              return `Action: ${log.action}, Time: ${formattedDate}`;
            });
            setActivityLog(formattedLogs);
          } else {
            console.error('Invalid logs format:', logs);
            setActivityLog([]);
          }
        } catch (error) {
          console.error('Error fetching activity logs:', error);
          setActivityLog([]);
        }
      }
    };
    fetchLogs();
  }, [taskId]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleTaskUpdate = async () => {
    if (taskId && task) {
      const userId = 'someUserId';

      try {
        await editTask(taskId, userId, {
          taskName: task.taskName,
          description: task.description,
          category: task.category,
          dueDate: task.dueDate,
          status: task.status,
          fileUrl: file ? URL.createObjectURL(file) : task.fileUrl,
        });

        addActivity('Task updated');
        toast.success("Task updated successfully! 🎉");
        onClose();
        window.location.reload();

      } catch (error) {
        console.error('Error updating task:', error);
      }
    }
  };

  const addActivity = (action: string) => {
    setActivityLog((prevLogs) => [action, ...prevLogs]);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!task) {
    return <div>Task not found.</div>;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full sm:w-96 md:w-2/3 lg:w-1/2 xl:w-2/3 animate-fadeIn relative flex flex-col lg:flex-row">
        {/* Toggle Edit/Log for larger screens */}
        <div className="w-full lg:w-2/3 mb-4 lg:mb-0">
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => {
                setIsEditVisible(true);
                setIsLogVisible(false);
              }}
              className={`w-full p-2 border rounded-3xl ${isEditVisible ? 'bg-purple-800 text-white' : 'bg-gray-200'}`}
            >
              Edit Task
            </button>
            <button
              onClick={() => {
                setIsEditVisible(false);
                setIsLogVisible(true);
              }}
              className={`w-full p-2 border rounded-3xl ${isLogVisible ? 'bg-purple-800 text-white' : 'bg-gray-200'}`}
            >
              Activity Log
            </button>
          </div>

          {isEditVisible && (
            <div>
              <input
                type="text"
                placeholder="Task Title"
                value={task.taskName}
                onChange={(e) => setTask({ ...task, taskName: e.target.value })}
                className="w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-800"
              />
              <textarea
                placeholder="Task Description"
                value={task.description}
                onChange={(e) => setTask({ ...task, description: e.target.value })}
                className="w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-800"
              ></textarea>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block mb-1 text-sm font-light">Task Category*</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTask({ ...task, category: 'work' })}
                      className={`w-full p-2 border rounded-3xl ${task.category === 'work' ? 'bg-purple-800 text-white' : 'bg-gray-200'}`}
                    >
                      Work
                    </button>
                    <button
                      onClick={() => setTask({ ...task, category: 'personal' })}
                      className={`w-full p-2 border rounded-3xl ${task.category === 'personal' ? 'bg-purple-800 text-white' : 'bg-gray-200'}`}
                    >
                      Personal
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-light">Due Date*</label>
                  <input
                    type="date"
                    value={task.dueDate}
                    onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-800"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-light">Task Status*</label>
                  <select
                    value={task.status}
                    onChange={(e) => setTask({ ...task, status: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-800"
                  >
                    <option value="pending">Pending</option>
                    <option value="inProgress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* File Attachment Section */}
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium">Attachment</label>
                <div className="border-dashed border-2 border-gray-300 p-4 text-center rounded-md">
                  <p className="text-sm mb-2">
                    {file ? `File: ${file.name}` : 'Drop your files here or click to browse'}
                  </p>

                  {file && file.type.startsWith('image/') && (
                    <div className="mb-2">
                      <img
                        src={URL.createObjectURL(file)}
                        alt="Selected"
                        className="w-32 h-32 object-cover mx-auto rounded-md"
                      />
                    </div>
                  )}

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
                    {file ? 'Update File' : 'Choose File'}
                  </label>
                </div>
              </div>
            </div>
          )}

          {isLogVisible && (
            <div className="sm:w-full">
              <h3 className="text-lg font-semibold mb-4">Activity Log</h3>
              <div className="h-64 sm:h-auto overflow-y-auto">
                {activityLog.length === 0 ? (
                  <p>No activities yet...</p>
                ) : (
                  activityLog.map((log, index) => (
                    <div key={index} className="mb-2">
                      <p className="text-sm text-gray-700">{log}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Hide buttons on smaller screens when log is visible */}
        <div className="absolute bottom-4 right-4 flex gap-4 sm:hidden lg:flex">
          {!isLogVisible && (
            <>
              <button
                onClick={onClose}
                className="px-3 py-1 h-10 bg-gray-300 text-gray-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleTaskUpdate}
                className="px-3 py-1 h-10 bg-purple-800 text-white rounded-xl"
              >
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditModal;
