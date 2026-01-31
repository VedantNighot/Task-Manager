import React, { useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosinstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import { LuEye, LuEyeOff, LuLock, LuKey } from "react-icons/lu";

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const validateForm = () => {
        if (!formData.currentPassword) {
            toast.error("Current password is required");
            return false;
        }

        if (!formData.newPassword) {
            toast.error("New password is required");
            return false;
        }

        if (formData.newPassword.length < 8) {
            toast.error("New password must be at least 8 characters");
            return false;
        }

        if (formData.newPassword === formData.currentPassword) {
            toast.error("New password must be different from current password");
            return false;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            const response = await axiosInstance.post(API_PATHS.AUTH.CHANGE_PASSWORD, {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            });

            if (response.data) {
                toast.success("Password changed successfully!");
                setFormData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
            }
        } catch (error) {
            console.error("Error changing password:", error);
            const errorMessage = error.response?.data?.message || "Failed to change password";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout activeMenu="Change Password">
            <div className="my-5">
                <div className="card max-w-lg mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary text-xl">
                            <LuLock />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Change Password</h2>
                            <p className="text-xs text-gray-500">Update your account password</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Current Password */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2 text-gray-700">
                                Current Password
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <LuKey />
                                </div>
                                <input
                                    type={showPasswords.current ? "text" : "password"}
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleInputChange}
                                    className="input-field pl-10 pr-10"
                                    placeholder="Enter current password"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility("current")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswords.current ? <LuEyeOff /> : <LuEye />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2 text-gray-700">
                                New Password
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <LuLock />
                                </div>
                                <input
                                    type={showPasswords.new ? "text" : "password"}
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleInputChange}
                                    className="input-field pl-10 pr-10"
                                    placeholder="Enter new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility("new")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswords.new ? <LuEyeOff /> : <LuEye />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2 text-gray-700">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <LuLock />
                                </div>
                                <input
                                    type={showPasswords.confirm ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="input-field pl-10 pr-10"
                                    placeholder="Confirm new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility("confirm")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswords.confirm ? <LuEyeOff /> : <LuEye />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary w-full py-2.5"
                            disabled={loading}
                        >
                            {loading ? "Updating..." : "Update Password"}
                        </button>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ChangePassword;
