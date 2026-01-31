export const BASE_URL = "https://task-manager-luy3.onrender.com"

// utils/apiPaths.js
export const API_PATHS = {
    AUTH: {
        REGISTER: "/api/auth/register",//Register a new user (ADmin or member)
        LOGIN: "/api/auth/login", //Authenticate user & return JWT token
        GET_PROFILE: "/api/auth/profile", //Get logged-in users details
        CHANGE_PASSWORD: "/api/auth/change-password", //Change user password
    },
    USERS: {
        GET_ALL_USERS: "/api/users", //Get all users (Admin only)
        GET_USER_BY_ID: (userId) => `/api/users/${userId}`, //Get user by ID
        CREATE_USER: "/api/users",
        UPDATE_USER: (userId) => `/api/users/${userId}`,//Update user details
        DELETE_USER: (userId) => `/api/users/${userId}`,//Delet a user
    },
    TASKS: {
        GET_DASHBOARD_DATA: "/api/tasks/dashboard-data", //Get Dashboard Data
        GET_USER_DASHBOARD_DATA: "/api/tasks/user-dashboard-data",//Get User Dashboard data
        GET_ALL_TASKS: "/api/tasks",
        GET_TASKS_BY_ID: (taskId) => `/api/tasks/${taskId}`,
        CREATE_TASKS: "/api/tasks",
        UPDATE_TASK: (taskId) => `/api/tasks/${taskId}`,
        DELETE_TASK: (taskId) => `/api/tasks/${taskId}`,

        UPDATE_TASK_STATUS: (taskId) => `/api/tasks/${taskId}/status`,
        UPDATE_TODO_CHECKLIST: (taskId) => `/api/tasks/${taskId}/todo`,
    },
    REPORTS: {
        EXPORT_TASKS: "/api/reports/export/tasks",//Download all tasks as an excel sheet 
        EXPORT_USERS: "/api/reports/export/users",//Download user-tasks report

    },
    IMAGE: {
        UPLOAD_IMAGE: "/api/auth/upload-image",
    },
};