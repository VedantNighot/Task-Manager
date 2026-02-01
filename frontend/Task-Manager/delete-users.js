import axios from 'axios';

const API_URL = 'https://task-manager-luy3.onrender.com/api/auth';
const USERS_URL = 'https://task-manager-luy3.onrender.com/api/users';
const MASTER_TOKEN = "16032004";

const deleteTestUser = async () => {
    const adminUser = {
        name: "Cleanup Admin",
        email: `cleanup_${Date.now()}@example.com`,
        password: "password123",
        adminInviteToken: MASTER_TOKEN
    };

    try {
        console.log("1. Registering Temp Admin...");
        const registerRes = await axios.post(`${API_URL}/register`, adminUser);
        const token = registerRes.data.token;
        console.log("✅ Admin Registered! Token obtained.");

        console.log("\n2. Fetching All Users...");
        const usersRes = await axios.get(USERS_URL, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // Find 'Test User' or users with test emails
        const usersToDelete = usersRes.data.filter(u =>
            u.name === "Test User" ||
            u.email.startsWith("test_") ||
            u.email.startsWith("debug_")
        );

        if (usersToDelete.length === 0) {
            console.log("⚠️ No Test Users found.");
        } else {
            console.log(`Found ${usersToDelete.length} test users.`);

            for (const user of usersToDelete) {
                console.log(`Deleting user: ${user.name} (${user.email})...`);
                await axios.delete(`${USERS_URL}/${user._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log("✅ Deleted.");
            }
        }

        // Optional: Delete self (Cleanup Admin)
        console.log("\n3. Deleting Cleanup Admin...");
        await axios.delete(`${USERS_URL}/${registerRes.data._id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("✅ Cleanup complete.");

    } catch (error) {
        console.error("❌ Error:", error.response ? error.response.data : error.message);
    }
};

deleteTestUser();
