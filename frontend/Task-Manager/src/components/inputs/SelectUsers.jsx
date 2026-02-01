import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosinstance";
import { API_PATHS } from "../../utils/apiPaths";
import Modal from "../Modal";
import { LuUsers } from "react-icons/lu";
import AvatarGroup from "../AvatarGroup";

const SelectUsers = ({ selectedUsers, setSelectedUsers }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempSelectedUsers, setTempSelectedUsers] = useState([]);

  const getAllUsers = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
      if (response.data?.length > 0) {
        setAllUsers(response.data);
      }
    } catch (error) {
      console.error("Enter fetching users:", error);
    }
  };

  const toggleUserSelection = (userId) => {
    setTempSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAssign = () => {
    setSelectedUsers(tempSelectedUsers);
    setIsModalOpen(false);
  };

  const selectedUserDetails = allUsers
    .filter((user) => selectedUsers.includes(user._id));

  useEffect(() => {
    getAllUsers();
  }, []);

  useEffect(() => {
    if (selectedUsers.length === 0) {
      setTempSelectedUsers([]);
    } else {
      setTempSelectedUsers(selectedUsers);
    }
    return () => { };
  }, [selectedUsers]);

  const [searchQuery, setSearchQuery] = useState("");

  const handleUserClick = (userId) => {
    toggleUserSelection(userId);
  };

  const filteredUsers = allUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 mt-2">
      {selectedUserDetails.length === 0 && (
        <button
          type="button" // Prevent form submission
          className="flex items-center gap-2 text-sm font-medium text-primary bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors border border-blue-200 border-dashed"
          onClick={() => setIsModalOpen(true)}
        >
          <LuUsers className="text-lg" /> Add Members
        </button>
      )}

      {selectedUserDetails.length > 0 && (
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setIsModalOpen(true)}>
          <AvatarGroup users={selectedUserDetails} maxVisible={4} />
          <span className="text-xs font-medium text-gray-500 group-hover:text-primary transition-colors">
            + Edit Selection
          </span>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Select Team Members"
      >
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
            autoFocus
          />
        </div>

        <div className="space-y-2 h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const isSelected = tempSelectedUsers.includes(user._id);
              return (
                <div
                  key={user._id}
                  onClick={() => handleUserClick(user._id)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${isSelected
                    ? "bg-blue-50 border-blue-200 ring-1 ring-blue-200"
                    : "bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200"
                    }`}
                >
                  {user.profileImageUrl ? (
                    <div className="w-10 h-10 shrink-0">
                      <img
                        src={user.profileImageUrl}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover border border-gray-200"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.parentElement.innerHTML = `<div class="w-full h-full rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold border border-indigo-200">${user.name?.charAt(0).toUpperCase()}</div>`;
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold border border-indigo-200">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1">
                    <p className={`font-medium text-sm ${isSelected ? 'text-primary' : 'text-gray-800'}`}>
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>

                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? "bg-primary border-primary" : "border-gray-300 bg-white"
                    }`}>
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 text-gray-500 text-sm">
              No users found matching "{searchQuery}"
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-2">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>

          <button
            className="px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-all"
            onClick={handleAssign}
          >
            Confirm Selection ({tempSelectedUsers.length})
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default SelectUsers;
