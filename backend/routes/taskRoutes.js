const express = require("express");
const {protect,adminOnly} = require("../middlewares/authMiddleware");
const {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskChecklist,
    getDashboardData,
    getUserDashboardData,} = require("../controllers/taskController");

const router = express.Router();


// TaskManagement Routes
router.get("/dashboard-data", protect,getDashboardData);
router.get("/user-dashboard-data",protect,getUserDashboardData);

router.get("/",protect,getTasks); // Get All Tasks
router.get("/:id",protect,getTaskById); // Get Tasks By Id
router.post("/",protect,adminOnly,createTask); // create a task (Admin Only)
router.put("/:id",protect,updateTask);//Update tasks details
router.delete("/:id", protect, adminOnly, deleteTask);//Delete a task (Admin Only)
router.put("/:id/status",protect,updateTaskStatus); //Update the Task Status
router.put("/:id/todo",protect,updateTaskChecklist); //update Check List

module.exports = router;