const User = require("../models/User");
const Task = require("../models/Task");
const { publicKey, webpush } = require("../config/vapid");

// @desc Get public VAPID key
// @route GET /api/notifications/vapid-key
// @access Private
const getVapidKey = async (req, res) => {
    res.json({ publicKey });
};

// @desc Save user push subscription
// @route POST /api/notifications/subscribe
// @access Private
const subscribePush = async (req, res) => {
    try {
        const subscription = req.body;
        if (!subscription || !subscription.endpoint) {
            return res.status(400).json({ message: "Subscription payload is invalid" });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Add subscription if it doesn't already exist
        const exists = user.pushSubscriptions.some(sub => sub.endpoint === subscription.endpoint);
        if (!exists) {
            user.pushSubscriptions.push(subscription);
            await user.save();
        }

        res.json({ message: "Subscribed to push notifications successfully" });
    } catch (error) {
        console.error("🔥 subscribePush error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Internal utility to send push reminders
const sendDailyReminders = async () => {
    try {
        const now = new Date();
        const currentHour = String(now.getHours()).padStart(2, '0');
        const currentMinute = String(now.getMinutes()).padStart(2, '0');
        const currentTimeString = `${currentHour}:${currentMinute}`;
        
        console.log(`⏰ Checking task notifications for time: ${currentTimeString}`);

        const today = new Date();
        today.setHours(0,0,0,0);

        // Find active (not Completed) tasks due today or in the future matching the time
        const tasks = await Task.find({
            status: { $ne: "Completed" },
            dueDate: { $gte: today },
            notificationTime: currentTimeString
        });

        if (tasks.length === 0) {
            return { sent: 0, message: "No tasks scheduled at this minute." };
        }

        let notificationsSent = 0;

        for (const task of tasks) {
            const assignees = await User.find({ _id: { $in: task.assignedTo } });
            
            for (const user of assignees) {
                if (!user.pushSubscriptions || user.pushSubscriptions.length === 0) {
                    continue;
                }

                const payload = JSON.stringify({
                    title: "Task Daily Reminder 📋",
                    body: `Reminder to work on: "${task.title}". Priority: ${task.priority}`,
                    url: `/user/task/${task._id}`
                });

                // Send push notification to all stored user device subscriptions
                const subscriptionPromises = user.pushSubscriptions.map(sub => {
                    return webpush.sendNotification({
                        endpoint: sub.endpoint,
                        keys: {
                            p256dh: sub.keys.p256dh,
                            auth: sub.keys.auth
                        }
                    }, payload).catch(err => {
                        console.error(`Push failed for user ${user._id} endpoint:`, err.message);
                        // If subscription is expired (404/410), mark for removal
                        if (err.statusCode === 404 || err.statusCode === 410) {
                            return sub.endpoint;
                        }
                        return null;
                    });
                });

                const results = await Promise.all(subscriptionPromises);
                const expiredEndpoints = results.filter(endpoint => endpoint !== null);
                
                if (expiredEndpoints.length > 0) {
                    user.pushSubscriptions = user.pushSubscriptions.filter(s => !expiredEndpoints.includes(s.endpoint));
                    await user.save();
                }
                notificationsSent++;
            }
        }

        return { sent: notificationsSent, message: `Sent ${notificationsSent} notifications.` };
    } catch (error) {
        console.error("🔥 Error sending daily reminders:", error);
        throw error;
    }
};

// @desc Trigger daily reminder checks manually (for Serverless Cron Jobs)
// @route GET /api/notifications/send-reminders
// @access Public (or protected by API token)
const triggerRemindersRoute = async (req, res) => {
    try {
        const result = await sendDailyReminders();
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Error triggering reminders", error: error.message });
    }
};

module.exports = {
    getVapidKey,
    subscribePush,
    sendDailyReminders,
    triggerRemindersRoute
};
