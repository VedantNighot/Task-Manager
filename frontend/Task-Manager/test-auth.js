import axios from 'axios';

const API_URL = 'https://task-manager-luy3.onrender.com/api/auth';

const testAuth = async () => {
    const testUser = {
        name: "Test User",
        email: `test_${Date.now()}@example.com`,
        password: "password123"
    };

    try {
        console.log("1. Testing Registration...");
        const registerRes = await axios.post(`${API_URL}/register`, testUser);
        console.log("✅ Registration Successful!");
        console.log("User ID:", registerRes.data._id);

        console.log("\n2. Testing Login...");
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: testUser.email,
            password: testUser.password
        });
        console.log("✅ Login Successful!");
        console.log("Token received:", !!loginRes.data.token);

    } catch (error) {
        if (error.response) {
            console.error("❌ API Error:", error.response.status, error.response.data);
        } else {
            console.error("❌ Network/Client Error:", error.message);
        }
    }
};

testAuth();
