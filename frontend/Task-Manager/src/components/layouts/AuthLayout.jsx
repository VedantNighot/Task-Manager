import React from "react";
import UI_IMG from "../../assets/images/auth-img.png";

const AuthLayout = ({ children }) => {
  return (
    <div className="flex">
      <div className="w-screen h-screen md:w-[60vw] px-12 pt-8 pb-12">
        <h2 className="text-lg font-medium text-black">Task Manager</h2>
        {children}
      </div>
      <div className="hidden md:flex w-[40vw] h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 bg-[url('/bg-img.jpg')] bg-cover bg-no-repeat bg-center overflow-hidden p-8">
        <div className="relative flex items-center justify-center">
          <img
            src={UI_IMG}
            className="w-[70%] max-w-[400px] drop-shadow-2xl transition-transform duration-300"
            alt="Task Manager Dashboard"
          />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
