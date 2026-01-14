import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apiPaths';
import DashboardLayout from '../../components/layouts/DashboardLayout';

const ViewTaskDetails = () => {
  const {id} = useParams();
  const [task,setTask] = useState(null);

  const getStatusTagColor = (status) => {
    switch (status) {
      case "In Progress":
        return "text-cyan-500 bg-cyan-50 border border-cyan-500/10";
      case "Completed":
        return "text-lime-500 bg-lime-50 border border-lime-500/10";
      default:
        return "text-violet-500 bg-violet-50 border border-violet-500/10";
    }
  };

  // get ask info by id
  const getTaskDetailsById = async() => {
    try {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_TASKS_BY_ID(id));
      if(response.data){
        const taskInfo = response.data;
        setTask(taskInfo);
      }
    } catch (error) {
      console.error("Error detching users:",error);
    }
  };

  // Handle  todo Check
  const updateTodoCheckList = async(index) => {};

  const handleLinkClick = (link) => {
    window.open(link,"_blank");
  };

  useEffect(()=>{
    if(id){
      getTaskDetailsById();
    }
    return () => {};
  },[]);
  return (
    <DashboardLayout activeMenu={"My Tasks"}>
      <div className="mt-5">
        {task && ( <div className="grid grid-cols-1 md:grid-cols-4 mt-4">
          <div className="form-card col-span-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-xl font-medium">{task?.title}</h2>

              <div className={`text-[13px] font-medium ${getStatusTagColor(
                task?.status
              )} px-4 py-0.5 rounded`}>
                {task?.status}
              </div>
            </div>
          </div>
        </div>)}
      </div>

    </DashboardLayout>
  )
}

export default ViewTaskDetails;
