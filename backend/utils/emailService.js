const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendTaskAssignmentEmail = async (email, name, taskTitle, dueDate, dashboardLink) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `New Task Assigned: ${taskTitle}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #333;">Hello ${name},</h2>
                    <p style="color: #555; font-size: 16px;">You have a new task assignment.</p>
                    
                    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
                        <h3 style="margin: 0 0 10px 0; color: #111;">${taskTitle}</h3>
                        <p style="margin: 0; color: #555;"><strong>📅 Deadline:</strong> ${new Date(dueDate).toLocaleString()}</p>
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

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${email}`);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};

module.exports = { sendTaskAssignmentEmail };
