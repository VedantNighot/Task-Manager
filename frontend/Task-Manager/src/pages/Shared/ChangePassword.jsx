import React, { useState, useContext } from "react";
import { UserContext } from "../../context/userContext";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosinstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import { LuEye, LuEyeOff, LuLock, LuKey, LuUserPlus, LuCopy } from "react-icons/lu";

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        accessToken: "",
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const { user } = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const [inviteCode, setInviteCode] = useState("");
    const [generatingInvite, setGeneratingInvite] = useState(false);

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

        if (!formData.accessToken) {
            toast.error("Access Token is required");
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
                accessToken: formData.accessToken,
            });

            if (response.data) {
                toast.success("Password changed successfully!");
                setFormData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                    accessToken: "",
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
    const handleGenerateInvite = async () => {
        setGeneratingInvite(true);
        try {
            const response = await axiosInstance.post(API_PATHS.AUTH.GENERATE_INVITE);
            if (response.data && response.data.code) {
                setInviteCode(response.data.code);
                toast.success("Invite code generated!");
            }
        } catch (error) {
            console.error("Error generating invite:", error);
            toast.error("Failed to generate invite code");
        } finally {
            setGeneratingInvite(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(inviteCode);
        toast.success("Copied to clipboard");
    };

    return (
        <DashboardLayout activeMenu="Change Password">
            <div className="my-5 space-y-6">
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

                        {/* Access Token */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2 text-gray-700">
                                Access Token
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <LuLock />
                                </div>
                                <input
                                    type="text"
                                    name="accessToken"
                                    value={formData.accessToken}
                                    onChange={handleInputChange}
                                    className="input-field pl-10 pr-3"
                                    placeholder="Enter access token"
                                    autoComplete="off"
                                />
                            </div>
                            <p className="text-[11px] text-gray-400 mt-1">
                                Required for authorization
                            </p>
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

            {user?.isMasterAdmin && (
                <div className="card max-w-lg mx-auto mt-6 border-t-4 border-primary">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary text-xl">
                            <LuUserPlus />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Admin Settings</h2>
                            <p className="text-xs text-gray-500">Manage administrator access</p>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                            Generate Admin Invite Code
                        </label>
                        <p className="text-xs text-gray-500 mb-3">
                            Generate a unique code to invite a new administrator. The code expires in 24 hours.
                        </p>

                        {inviteCode ? (
                            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <code className="text-lg font-bold text-green-700 tracking-wider flex-1 text-center">
                                    {inviteCode}
                                </code>
                                <button
                                    onClick={copyToClipboard}
                                    className="p-2 hover:bg-green-100 rounded text-green-700"
                                    title="Copy Code"
                                >
                                    <LuCopy />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={handleGenerateInvite}
                                disabled={generatingInvite}
                                className="btn-primary w-full py-2.5 bg-gray-800 hover:bg-gray-700"
                            >
                                {generatingInvite ? "Generating..." : "Generate Invite Code"}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default ChangePassword;
