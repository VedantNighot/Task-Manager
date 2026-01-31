const axios = require("axios");
require("dotenv").config();

/**
 * Sends a task assignment email using the Brevo (Sendinblue) REST API.
 * This method is used as an alternative to SMTP to avoid connection timeouts on cloud hosts like Render.
 */
const sendTaskAssignmentEmail = async (email, name, taskTitle, dueDate, priority, dashboardLink) => {
    console.log(`Attempting to send email via Brevo API to ${email} for task "${taskTitle}"`);

    const API_KEY = process.env.BREVO_API_KEY;
    const SENDER_EMAIL = process.env.EMAIL_USER; // Verified sender in Brevo
    const SENDER_NAME = "Task Manager";

    if (!API_KEY) {
        console.error("BREVO_API_KEY is missing! Emails will not be sent.");
        return false;
    }

    if (!SENDER_EMAIL) {
        console.error("EMAIL_USER (Sender Email) is missing!");
        return false;
    }

    try {
        const priorityColors = {
            High: "#ef4444", // Red
            Medium: "#f59e0b", // Amber
            Low: "#10b981", // Emerald
        };
        const priorityColor = priorityColors[priority] || "#3b82f6";

        const data = {
            sender: { name: SENDER_NAME, email: SENDER_EMAIL },
            to: [{ email: email, name: name }],
            subject: `New Task Assigned: ${taskTitle}`,
            htmlContent: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #333;">Hello ${name},</h2>
                    <p style="color: #555; font-size: 16px;">You have a new task assignment.</p>
                    
                    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
                        <h3 style="margin: 0 0 10px 0; color: #111;">${taskTitle}</h3>
                        <p style="margin: 5px 0; color: #555;"><strong>📅 Deadline:</strong> ${new Date(dueDate).toLocaleString()}</p>
                        <p style="margin: 5px 0; color: #555;">
                            <strong>⚡ Priority:</strong> 
                            <span style="color: ${priorityColor}; font-weight: bold;">${priority}</span>
                        </p>
                    </div>
                    
                    <p style="color: #555;">Please prioritize this task and update your progress on the dashboard.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${dashboardLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                            Go to Dashboard
                        </a>
                    </div>
                    
                    <p style="font-size: 14px; color: #666; text-align: center;">
                        <small>If you are not logged in, you will be redirected to the login page first.</small>
                    </p>
                </div>
            `,
        };

        const response = await axios.post("https://api.brevo.com/v3/smtp/email", data, {
            headers: {
                "accept": "application/json",
                "api-key": API_KEY,
                "content-type": "application/json",
            },
        });

        console.log("Email sent successfully via Brevo API:", response.data.messageId);
        return true;
    } catch (error) {
        console.error("Brevo API Error:", error.response ? error.response.data : error.message);
        return false;
    }
};

module.exports = { sendTaskAssignmentEmail };
