const express = require("express");
const { exportTasksReport, exportUsersReport } = require("../controllers/reportController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/export/tasks",protect,adminOnly,exportTasksReport);//Export all tasks as excell/pdf
router.get("/export/users",protect,adminOnly,exportUsersReport)//export user-task report

module.exports = router;