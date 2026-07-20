import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosinstance";
import { API_PATHS } from "../../utils/apiPaths";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import moment from "moment";
import AvatarGroup from "../../components/AvatarGroup";
import { LuSquareArrowOutUpRight, LuPaperclip } from "react-icons/lu";
import toast from "react-hot-toast";

const ViewTaskDetails = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [newAttachments, setNewAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const getStatusTagColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";
      case "In Progress":
        return "bg-cyan-100 text-cyan-700";
      default:
        return "bg-purple-100 text-purple-700";
    }
  };

  // get task info by id
  const getTaskDetailsById = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.TASKS.GET_TASKS_BY_ID(id)
      );
      if (response.data) {
        setTask(response.data);
      }
    } catch (error) {
      console.error("Error fetching task:", error);
    }
  };

  // Handle todo Check (local state update only, saved on submit)
  const updateTodoChecklist = (index) => {
    if (task.status === "Completed") return; // Locked if completed
    
    const updatedChecklist = task.todoChecklist.map((item, i) =>
      i === index ? { ...item, completed: !item.completed } : item
    );
    setTask({ ...task, todoChecklist: updatedChecklist });
  };

  // Convert uploaded files to base64
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewAttachments(prev => [...prev, { name: file.name, data: reader.result }]);
      };
      reader.readAsDataURL(file);
    });
    // Reset file input value
    e.target.value = "";
  };

  const removeStagedAttachment = (index) => {
    setNewAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Handle final task submission
  const handleSubmitTask = async () => {
    if (isOverdue) {
      toast.error("Cannot submit. Due date has passed.");
      return;
    }

    setSubmitting(true);
    try {
      // Format staged attachments as "filename|dataUrl"
      const formattedAttachments = newAttachments.map(file => `${file.name}|${file.data}`);

      const response = await axiosInstance.put(
        `/api/tasks/${id}/submit`,
        {
          todoChecklist: task.todoChecklist,
          newAttachments: formattedAttachments
        }
      );

      if (response.data?.task) {
        setTask(response.data.task);
        setNewAttachments([]);
        toast.success("Task submitted and marked as Completed!");
      }
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error(error.response?.data?.message || "Failed to submit task.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLinkClick = (link) => {
    if (link.includes('|')) {
      const [name, dataUrl] = link.split('|');
      const downloadLink = document.createElement("a");
      downloadLink.href = dataUrl;
      downloadLink.download = name;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else {
      if (!/^https?:\/\//i.test(link)) {
        link = "https://" + link;
      }
      window.open(link, "_blank");
    }
  };

  useEffect(() => {
    if (id) {
      getTaskDetailsById();
    }
  }, [id]);

  const isOverdue = task?.dueDate ? moment().isAfter(moment(task.dueDate), 'day') : false;

  return (
    <DashboardLayout activeMenu={"My Tasks"}>
      <div className="mt-5">
        {task && (
          <div className="grid grid-cols-1 md:grid-cols-4 mt-4">
            <div className="form-card col-span-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm md:text-xl font-medium text-black">
                  {task?.title}
                </h2>

                <div className="flex items-center gap-2">
                  <div
                    className={`text-[11px] md:text-[13px] font-medium ${getStatusTagColor(
                      task?.status
                    )} px-4 py-0.5 rounded`}
                  >
                    {task?.status}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <InfoBox label="Description" value={task?.description} />
              </div>

              <div className="grid grid-cols-12 gap-4 mt-4">
                <div className="col-span-6 md:col-span-4">
                  <InfoBox label="Priority" value={task?.priority} />
                </div>
                <div className="col-span-6 md:col-span-4">
                  <InfoBox
                    label="Due Date"
                    value={
                      task?.dueDate
                        ? moment(task?.dueDate).format("Do MMMM YYYY")
                        : "N/A"
                    }
                  />
                </div>

                <div className="col-span-6 md:col-span-4">
                  <label className="text-xs font-medium text-slate-500">
                    Assigned To
                  </label>

                  <AvatarGroup
                    avatars={
                      task?.assignedTo?.map((item) => item?.profileImageUrl) ||
                      []
                    }
                    maxVisible={5}
                  />
                </div>
              </div>

              <div className="mt-2">
                <label className="text-xs font-medium text-slate-500">
                  Todo CheckList
                </label>

                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  {task?.todoChecklist?.map((item, index) => (
                    <TodoCheckList
                      key={`todo_${index}`}
                      text={item.text}
                      isChecked={item?.completed}
                      onChange={() => updateTodoChecklist(index)}
                      disabled={task?.status === "Completed"}
                    />
                  ))}
                </div>
              </div>

              {task?.attachments?.length > 0 && (
                <div className="mt-4">
                  <label className="text-xs font-medium text-slate-500">
                    Attachments
                  </label>

                  {task?.attachments?.map((link, index) => (
                    <Attachments
                      key={`link_${index}`}
                      link={link}
                      index={index}
                      onClick={() => handleLinkClick(link)}
                    />
                  ))}
                </div>
              )}

              {task?.status !== "Completed" && (
                <div className="mt-5 border-t border-slate-100 pt-4">
                  {/* File Upload Selector */}
                  <div>
                    <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <LuPaperclip className="text-sm" /> Add File/Image Attachments
                    </label>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      disabled={isOverdue}
                      className="block w-full text-xs text-slate-500 mt-2
                        file:mr-4 file:py-1.5 file:px-3
                        file:rounded-md file:border-0
                        file:text-xs file:font-semibold
                        file:bg-primary/10 file:text-primary
                        hover:file:bg-primary/20 cursor-pointer disabled:opacity-50"
                    />
                  </div>

                  {/* Staged Uploads */}
                  {newAttachments.length > 0 && (
                    <div className="mt-3">
                      <label className="text-xs font-medium text-slate-500">
                        New Attachments (Staged for Submission)
                      </label>
                      {newAttachments.map((file, idx) => (
                        <div key={`new_att_${idx}`} className="flex justify-between items-center bg-green-50 border border-green-100 px-3 py-1.5 rounded-md mt-2">
                          <p className="text-xs text-green-800 line-clamp-1">{file.name}</p>
                          <button 
                            className="text-xs text-rose-500 hover:text-rose-600 font-semibold cursor-pointer"
                            onClick={() => removeStagedAttachment(idx)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Big Submit Button */}
                  <div className="mt-6 flex justify-end">
                    <button
                      className={`px-6 py-2 rounded-md font-medium text-sm text-white transition-all
                        ${isOverdue 
                          ? "bg-slate-300 text-slate-500 cursor-not-allowed border border-slate-200" 
                          : "bg-primary hover:bg-primary/95 cursor-pointer shadow-md hover:shadow-lg"
                        }`}
                      onClick={handleSubmitTask}
                      disabled={isOverdue || submitting}
                    >
                      {submitting ? "Submitting..." : isOverdue ? "Due Date Finished (Submission Closed)" : "Submit Task"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ViewTaskDetails;

const InfoBox = ({ label, value }) => {
  return (
    <>
      <label className="text-xs font-medium text-slate-500">{label}</label>
      <p className="text-[12px] md:text-[13px] font-medium text-gray-700 mt-0.5">
        {value}
      </p>
    </>
  );
};

const TodoCheckList = ({ text, isChecked, onChange, disabled }) => {
  return (
    <div className="flex items-center gap-3 p-3">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={onChange}
        disabled={disabled}
        className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded-sm outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <p
        className={`text-[13px] ${isChecked ? "line-through text-gray-400" : "text-gray-800"}`}
      >
        {text}
      </p>
    </div>
  );
};

const Attachments = ({ link, index, onClick }) => {
  const displayName = link.includes('|') ? link.split('|')[0] : link;
  return (
    <div 
      className="flex justify-between bg-gray-50 border border-gray-100 px-3 py-2 rounded-md mb-3 mt-2 cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={onClick}
    >
      <div className="flex-1 flex items-center gap-3 overflow-hidden">
        <span className="text-xs text-gray-400 font-semibold">
          {index < 9 ? `0${index + 1}` : index + 1}
        </span>
        <p className="text-xs text-black line-clamp-1 break-all hover:underline">{displayName}</p>
      </div>
      <LuSquareArrowOutUpRight className="text-gray-300" />
    </div>
  );
};
