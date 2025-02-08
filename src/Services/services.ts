import { db } from "../firebase/firebaseConfig";
import { collection,addDoc,updateDoc,doc,serverTimestamp,arrayUnion,query,where,getDocs, getDoc,deleteDoc,arrayRemove } from "firebase/firestore";


const TASKS_COLLECTION = 'tasks'
const USERS_COLLECTION = 'users'
const ACTIVITY_COLLECTION = 'activity_logs'

// log activity of tasks.
export const logActivity = async(
  taskId:string,
  userId:string,
  action:string,
  changes:Record<string,any>={}
)=>{
  try {
    await addDoc(collection(db,ACTIVITY_COLLECTION),{
      taskId,
      userId,
      action,
      changes,
      timestamp:serverTimestamp()
    })
    
  } catch (error) {
    console.error("Error logging activity:", error);
  }
}

//for adding a new task
export const addTask = async(
  userId:string,
  taskName:string,
  category:string,
  description:string,
  fileUrl:string|null
)=>{
  try{
    const newTask ={
      userId,
      taskName:taskName,
      status:'pending',
      category,
      description,
      file: fileUrl || '',
      createdAt:serverTimestamp()
    }

    const taskRef = await addDoc(collection(db,TASKS_COLLECTION),newTask);
    const taskId=taskRef.id

    const userRef=doc(db,USERS_COLLECTION,userId)
    await updateDoc(userRef,{todo:arrayUnion(taskId)})

    await logActivity(taskId,userId,'Created');

    return {id:taskId,...newTask}
  }catch(error){
    console.error('Error adding task:', error);
    throw error;
  }
}

//For editing the task
export const editTask = async(
  taskId:string,
  userId:string,
  updates:{
    taskName?:string;
    category?:string;
    description?:string;
    status?:string
    fileUrl?:string|null
  }
)=>{
  try {
    const taskRef = doc(db,'tasks',taskId);

    await logActivity(taskId,userId,'Edited',updates)

    await updateDoc(taskRef,{
      ...updates,
      updatedAt:new Date()
    })
    console.log('Task updated successfully')
    return {id:taskId,...updates}
  } catch (error) {
    console.error("Error updating task:", error);
  }
}

export const deleteTask = async (taskId: string, userId: string) => {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    const userRef = doc(db, USERS_COLLECTION, userId);

    // Deleting task from the tasks collection
    await deleteDoc(taskRef);

    // Remove task from the user's task list
    await updateDoc(userRef, {
      todo: arrayRemove(taskId)  // Assuming tasks are stored in an array field named 'todo'
    });

    // Log the deletion action
    await logActivity(taskId, userId, 'Deleted');

    console.log("Task deleted successfully");
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error; // Optionally throw error to handle it elsewhere
  }
};


//For getting the deleted tasks.

export const getDeletedTasks = async (userId: string) => {
  try {
    const q = query(
      collection(db, TASKS_COLLECTION),
      where("userId", "==", userId),
      where("status", "==", "deleted")
    );

    const querySnapshot = await getDocs(q);
    const deletedTasks = querySnapshot.docs.map(doc => doc.data());
    return deletedTasks;
  } catch (error) {
    console.error("Error fetching deleted tasks:", error);
  }
};

//Activity Logs.

export const getHistory=async(taskId:string)=>{
  try {
    const q=query(collection(db,ACTIVITY_COLLECTION),where("taskId","==",taskId));
    const querySnapshot =await getDocs(q)

    const logs = querySnapshot.docs.map(doc=>doc.data())
    return logs;
  } catch (error) {
    console.error("Error fetching task history:", error);
  }
}

//for getting tasks according to userId

export const getUsersTasks = async(userId:string)=>{
  try {
    const q =query(
      collection(db,"tasks"),
      where("userId","==",userId)
      
    )
    const querySnapshot = await getDocs(q)
    const tasks = querySnapshot.docs.map(doc=>({
      id:doc.id,
      ...doc.data()
    }))

    console.log('tasks are in home', tasks)
    return tasks;
    
  } catch (error) {
    console.error("Error fetching user tasks:", error);
  }
}

export const getTaskById=async(taskId:string)=>{
  try {
    const taskRef = doc(db,'tasks',taskId);
    const taskSnapshot = await getDoc(taskRef)

    if(taskSnapshot.exists()){
      return{id:taskSnapshot.id,...taskSnapshot.data()}
    }else{
      throw new Error('Task not found')
    }
  } catch (error) {
    console.error('Error fetching task by ID:', error);
  }
}