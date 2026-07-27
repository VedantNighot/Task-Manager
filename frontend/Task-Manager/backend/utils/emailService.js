const axios = require("axios");
require("dotenv").config();

/**
 * Sends a task assignment email using the Brevo (Sendinblue) REST API.
 * This method is used as an alternative to SMTP to avoid connection timeouts on cloud hosts like Render.
 */
const sendTaskAssignmentEmail = async (email, name, taskId, title, taskDate, dueDate, priority, dashboardLink) => {
    console.log(`Attempting to send email via Brevo API to ${email} for task "${title}"`);

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
            subject: `New Task Assigned: ${title}`,
            htmlContent: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1a202c;">
                    <h2 style="color: #2d3748; margin-bottom: 8px;">Hello ${name},</h2>
                    <p style="color: #4a5568; font-size: 16px; margin-bottom: 24px;">You have been assigned a new task. Here are the details:</p>
                    
                    <div style="background: #f7fafc; padding: 24px; border-radius: 10px; margin: 20px 0; border: 1px solid #edf2f7; border-left: 5px solid #4299e1;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #718096; font-size: 14px; width: 100px;">Task ID</td>
                                <td style="padding: 8px 0; color: #2d3748; font-weight: bold;">#${taskId.toString().slice(-6).toUpperCase()}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #718096; font-size: 14px;">Title</td>
                                <td style="padding: 8px 0; color: #2d3748; font-weight: bold;">${title}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #718096; font-size: 14px;">Assigned Date</td>
                                <td style="padding: 8px 0; color: #2d3748;">${new Date(taskDate).toLocaleDateString()}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #718096; font-size: 14px;">Deadline</td>
                                <td style="padding: 8px 0; color: #2d3748; font-weight: bold;">${new Date(dueDate).toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #718096; font-size: 14px;">Priority</td>
                                <td style="padding: 8px 0;">
                                    <span style="background-color: ${priorityColor}; color: white; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase;">
                                        ${priority}
                                    </span>
                                </td>
                            </tr>
                        </table>
                    </div>
                    
                    <p style="color: #4a5568; font-size: 15px; margin-top: 24px;">Please review the task and update your progress regularly on the dashboard.</p>
                    
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="${dashboardLink}" style="background-color: #3182ce; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                            View Dashboard
                        </a>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #edf2f7; margin: 32px 0;">
                    
                    <p style="font-size: 12px; color: #a0aec0; text-align: center; line-height: 1.5;">
                        This is an automated notification from Task Manager.<br>
                        If you have issues logging in, please contact your administrator.
                    </p>
                </div>
            `,
        };

        console.log(`Sender Email: ${SENDER_EMAIL}`);
        console.log(`Recipient Email: ${email}`);

        const response = await axios.post("https://api.brevo.com/v3/smtp/email", data, {
            headers: {
                "accept": "application/json",
                "api-key": API_KEY,
                "content-type": "application/json",
            },
        });

        console.log("Brevo API Response Data:", response.data);
        console.log("Email sent successfully via Brevo API:", response.data.messageId);
        return true;
    } catch (error) {
        console.error("Brevo API Full Error Response:");
        if (error.response) {
            console.error(JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
        return false;
    }
};

module.exports = { sendTaskAssignmentEmail };
