const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { getVapidKey, subscribePush, triggerRemindersRoute } = require("../controllers/notificationController");

const router = express.Router();

router.get("/vapid-key", protect, getVapidKey);
router.post("/subscribe", protect, subscribePush);
router.get("/send-reminders", triggerRemindersRoute); // Trigger reminders manually or via cron

module.exports = router;
