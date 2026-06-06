const Task = require("../models/Task");
const User = require("../models/User");
const { sendTaskAssignmentEmail } = require("../utils/emailService");
const axios = require("axios");

//@desc Get all task (Admin: all User:only assigned tasks)
// @route GET /api/tasks/
// @access Private
const getTasks = async (req, res) => {
    try {
        const { status } = req.query;
        let filter = {};

        if (status) {
            filter.status = status;
        }
        let tasks;
        if (req.user.role === "admin") {
            tasks = await Task.find(filter).populate(
                "assignedTo",
                "name email profileImageUrl"
            );
        } else {
            tasks = await Task.find({ ...filter, assignedTo: req.user._id }).populate(
                "assignedTo",
                "name email profileImageUrl"
            );
        }

        // Add completed todoCheckList count
        tasks = await Promise.all(
            tasks.map(async (task) => {
                const completedCount = task.todoChecklist.filter(
                    (item) => item.completed).length;
                return { ...task._doc, completedTodoCount: completedCount };
            })
        );

        // Status Sumary Counts
        const allTasks = await Task.countDocuments(
            req.user.role === "admin" ? {} : { assignedTo: req.user._id }
        );

        const pendingTasks = await Task.countDocuments({
            ...filter,
            status: "Pending",
            ...(req.user.role !== "admin" && { assignedTo: req.user._id })
        })
        const inProgressTasks = await Task.countDocuments({
            ...filter,
            status: "In Progress",
            ...(req.user.role !== "admin" && { assignedTo: req.user._id })
        })
        const completedTasks = await Task.countDocuments({
            ...filter,
            status: "Completed",
            ...(req.user.role !== "admin" && { assignedTo: req.user._id })
        })

        res.json({
            tasks,
            statusSummary: {
                all: allTasks,
                pendingTasks,
                inProgressTasks,
                completedTasks
            },
        })

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// @desc Get Task by ID
// @route GET /api/tasks/:id
// @access Private
const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate(
            "assignedTo",
            "name email profileImageUrl"
        );
        if (!task) return res.status(404).json({ message: "Task not Found" });
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc Create a new task (Admin Only)
// @route POST /api/tasks
// @access Private
const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            attachments,
            todoChecklist,
        } = req.body;

        if (!Array.isArray(assignedTo)) {
            return res.status(400).json({ message: "assignedTo must be an array of user IDs" });
        }

        const task = await Task.create({
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            createdBy: req.user._id,
            todoChecklist,
            attachments,
        });

        // Send Email Notifications
        try {
            console.log("Creating task for users:", assignedTo);
            const users = await User.find({ _id: { $in: assignedTo } });
            console.log(`Found ${users.length} users in database for assignment`);

            // Use Client URL from env or fallback to deployed URL
            const dashboardLink = `${process.env.CLIENT_URL || "https://task-manager-luy3.onrender.com"}/user/dashboard`;

            const emailPromises = users.map(user => {
                if (user.email) {
                    console.log(`Triggering assignment email to: ${user.email}`);
                    return sendTaskAssignmentEmail(
                        user.email,
                        user.name,
                        task._id,
                        title,
                        task.createdAt,
                        dueDate,
                        priority,
                        dashboardLink
                    ).catch(err => {
                        console.error(`Individual email failed for ${user.email}:`, err);
                    });
                } else {
                    console.warn(`User ${user._id} has no email address`);
                    return Promise.resolve();
                }
            });

            await Promise.all(emailPromises);
            console.log("All email processes completed (success or logged failure)");
        } catch (emailError) {
            console.error("Failed to send assignment emails:", emailError);
            // Don't fail the task creation just because email failed
        }

        res.status(201).json({ message: "Task created Successfully", task });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc Update tasks Details
// @route PUT /api/tasks/:id
// @access Private
const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        task.title = req.body.title || task.title;
        task.description = req.body.description || task.description;
        task.priority = req.body.priority || task.priority;
        task.dueDate = req.body.dueDate || task.dueDate;
        task.todoChecklist = req.body.todoChecklist || task.todoChecklist;
        task.attachments = req.body.attachments || task.attachments;

        if (req.body.assignedTo) {
            if (!Array.isArray(req.body.assignedTo)) {
                return res.status(400).json({ message: "assignedTo must be an array of user IDs" });
            }
            task.assignedTo = req.body.assignedTo;
        }
        const updateTask = await task.save();
        res.json({ message: "Task update Succesfully", updateTask });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc Delete a tasks (Admin Only)
// @route DELETE /api/tasks/:id
// @access Private

const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(400).json({ message: "Task not found" });
        await task.deleteOne();
        res.json({ message: "Task Deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc Update tasks status
// @route PUT /api/tasks/:id
// @access Private
const updateTaskStatus = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(400).json({ message: "Task not found" });

        const isAssigned = task.assignedTo.some(
            (userId) => userId.toString() === req.user._id.toString()
        );

        if (!isAssigned && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized" });
        }

        task.status = req.body.status || task.status;

        if (task.status === "Completed") {
            task.todoChecklist.forEach((item) => (item.completed = true));
            task.progress = 100;
        }

        await task.save();

        const updatedTask = await Task.findById(req.params.id).populate(
            "assignedTo",
            "name email profileImageUrl"
        );

        res.json({ message: " Task Status Updated", task: updatedTask });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// @desc Update tasks checklist
// @route PUT /api/tasks/:id/todo
// @access Private
const updateTaskChecklist = async (req, res) => {
    try {
        const { todoChecklist } = req.body;

        if (!Array.isArray(todoChecklist)) {
            return res.status(400).json({ message: "todoChecklist must be an array" });
        }

        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task Not Found" });

        const isAssigned = task.assignedTo.some(
            (userId) => userId.toString() === req.user._id.toString()
        );

        if (!isAssigned && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized to update checklist" });
        }

        task.todoChecklist = todoChecklist;

        const completedCount = task.todoChecklist.filter(
            (item) => item.completed
        ).length;

        const totalItems = task.todoChecklist.length;

        task.progress =
            totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

        if (task.progress === 100) task.status = "Completed";
        else if (task.progress > 0) task.status = "In Progress";
        else task.status = "Pending";

        await task.save();

        const updatedTask = await Task.findById(req.params.id).populate(
            "assignedTo",
            "name email profileImageUrl"
        );

        res.json({ message: "Task checklist updated", task: updatedTask });
    } catch (error) {
        console.error("🔥 updateTaskChecklist ERROR:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message,
            stack: error.stack,
        });
    }
};


// @desc DashBoard Data (Admin Only)
//@route GET /api/tasks/dashboard-data
//@access Private
const getDashboardData = async (req, res) => {
    try {
        // Fetch Statistics
        const totalTasks = await Task.countDocuments();
        const pendingTasks = await Task.countDocuments({ status: "Pending" });
        const completedTasks = await Task.countDocuments({ status: "Completed" });
        const overdueTasks = await Task.countDocuments({
            status: { $ne: "Completed" },
            dueDate: { $lt: new Date() },
        });

        //Ensure all posible Statuses are included
        const taskStatuses = ["Pending", "In Progress", "Completed"];
        const taskDistributionRaw = await Task.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);

        const taskDistribution = taskStatuses.reduce((acc, status) => {
            const formattedKey = status.replace(/\s+/g, ""); // removes spaces for response keys
            acc[formattedKey] =
                taskDistributionRaw.find((item) => item._id === status)?.count || 0;
            return acc;
        }, {});
        taskDistribution["All"] = totalTasks; //Add total count to taskDistribution

        //Ensure all Priority levels are included
        const taskPriorities = ["Low", "Medium", "High"];
        const taskPriorityLevelsRaw = await Task.aggregate([
            {
                $group: {
                    _id: "$priority",
                    count: { $sum: 1 },
                },
            },
        ]);
        const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
            acc[priority] =
                taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;
            return acc;
        }, {});

        // Fetch Recent 10 tasks
        const recentTasks = await Task.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select("title status priority dueDate createdAt");

        res.status(200).json({
            statistics: {
                totalTasks,
                pendingTasks,
                completedTasks,
                overdueTasks,
            },
            charts: {
                taskDistribution,
                taskPriorityLevels,
            },
            recentTasks,
        })
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message })
    }
}

// @desc DashBoard data (User-specific)
// @route GET /api/tasks/user-dashboard-data
// @access Private
const getUserDashboardData = async (req, res) => {
    try {
        const userId = req.user._id;//Only fetch data for the logged-in user
        // Fetch Statistics for user-specific tasks
        const totalTasks = await Task.countDocuments({ assignedTo: userId });
        const pendingTasks = await Task.countDocuments({ assignedTo: userId, status: "Pending" });
        const completedTasks = await Task.countDocuments({ assignedTo: userId, status: "Completed" });
        const overdueTasks = await Task.countDocuments({
            assignedTo: userId,
            status: { $ne: "Completed" },
            dueDate: { $lte: new Date() },
        });
        // Task Distribution by status
        const taskStatuses = ["Pending", "In Progress", "Completed"];
        const taskDistributionRaw = await Task.aggregate([
            { $match: { assignedTo: userId } },
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);
        const taskDistribution = taskStatuses.reduce((acc, status) => {
            const formattedKey = status.replace(/\s+/g, "");
            acc[formattedKey] =
                taskDistributionRaw.find((item) => item._id === status)?.count || 0;
            return acc;
        }, {});
        taskDistribution["All"] = totalTasks;

        // Task Distribution by priority
        const taskPriorities = ["Low", "Medium", "High"];
        const taskPriorityLevelsRaw = await Task.aggregate([
            { $match: { assignedTo: userId } },
            { $group: { _id: "$priority", count: { $sum: 1 } } },
        ]);

        const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
            acc[priority] =
                taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;
            return acc;
        }, {});

        // Fetch Revemt 10 tasks for the logged-user 

        const recentTasks = await Task.find({ assignedTo: userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .select("title status priority dueDate createdAt");

        res.status(200).json({
            statistics: {
                totalTasks,
                pendingTasks,
                completedTasks,
                overdueTasks,
            },
            charts: {
                taskDistribution,
                taskPriorityLevels,
            },
            recentTasks,
        })

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc Handle Chatbot Conversation using backend Gemini Key
// @route POST /api/tasks/chat
// @access Private
const handleChat = async (req, res) => {
    try {
        const { message, history } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                message: "Gemini API Key is not configured on the backend server."
            });
        }

        // Fetch user's tasks to feed as context
        const userId = req.user._id;
        let tasks;
        if (req.user.role === "admin") {
            tasks = await Task.find({}).populate("assignedTo", "name email");
        } else {
            tasks = await Task.find({ assignedTo: userId }).populate("assignedTo", "name email");
        }

        const simplifiedTasks = tasks.map((t) => ({
            title: t.title,
            description: t.description || "",
            status: t.status,
            priority: t.priority,
            progress: t.progress || 0,
            dueDate: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "No due date",
            todos: t.todoChecklist?.map((todo) => ({
                text: todo.text,
                completed: todo.completed,
            })) || [],
        }));

        const systemInstruction = `You are "Tasky", a friendly, proactive, and highly intelligent AI Task Assistant built into this Task Manager application.
Your goal is to help the user manage their tasks, stay organized, and answer questions.

User Profile:
- Name: ${req.user.name || "User"}
- Email: ${req.user.email || ""}
- Role: ${req.user.role || "Member"}

Current Tasks in System:
${JSON.stringify(simplifiedTasks, null, 2)}

Instructions:
1. Speak in a helpful, encouraging, and professional tone.
2. Answer questions based on the tasks provided. If there are no tasks, encourage them to create one.
3. Be concise and use clean Markdown formatting (bullet points, bold text).
4. If they ask to create a task, offer suggestions for a title, description, priority, and due date.
5. If they ask you to write a plan or steps for a task, break it down clearly.
6. The current date and time is ${new Date().toLocaleString()}.`;

        const recentHistory = history
            ?.slice(-8)
            .filter((m) => m.id !== "welcome")
            .map((m) => ({
                role: m.sender === "user" ? "user" : "model",
                parts: [{ text: m.text }],
            })) || [];

        const contents = [
            ...recentHistory,
            {
                role: "user",
                parts: [{ text: message }],
            },
        ];

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                contents: contents,
                systemInstruction: {
                    parts: [{ text: systemInstruction }],
                },
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 800,
                },
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        const answer = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!answer) {
            return res.status(500).json({ message: "Failed to generate AI response." });
        }

        res.json({ reply: answer });
    } catch (error) {
        console.error("Gemini API backend error:", error.response?.data || error.message);
        res.status(500).json({
            message: "Error communicating with Gemini API",
            error: error.response?.data?.error?.message || error.message,
        });
    }
};

const getChatStatus = async (req, res) => {
    res.json({ enabled: !!process.env.GEMINI_API_KEY });
};

module.exports = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskChecklist,
    getDashboardData,
    getUserDashboardData,
    handleChat,
    getChatStatus,
};