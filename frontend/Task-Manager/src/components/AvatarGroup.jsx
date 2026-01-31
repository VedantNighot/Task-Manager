import React from "react";

const AvatarGroup = ({ users = [], maxVisible = 3 }) => {
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  return (
    <div className="flex items-center">
      {users.slice(0, maxVisible).map((user, index) => (
        <div key={user?._id || index} className="-ml-3 first:ml-0 relative group">
          {user?.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt={user.name}
              className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-sm"
              onError={(e) => {
                e.target.onerror = null;
                e.target.parentElement.innerHTML = `<div class="w-9 h-9 rounded-full border-2 border-white bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold shadow-sm">${getInitials(user.name)}</div>`;
              }}
            />
          ) : (
            <div className="w-9 h-9 rounded-full border-2 border-white bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold shadow-sm">
              {getInitials(user.name)}
            </div>
          )}
          {/* Tooltip on hover */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30 pointer-events-none">
            {user.name}
          </div>
        </div>
      ))}

      {users.length > maxVisible && (
        <div className="w-9 h-9 flex items-center justify-center bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full border-2 border-white -ml-3 shadow-sm z-10">
          +{users.length - maxVisible}
        </div>
      )}
    </div>
  );
};

export default AvatarGroup;
