import React from "react";
import { useUser } from "@clerk/clerk-react";
import { User, Mail, Calendar, Shield } from "lucide-react";

const ProfilePage: React.FC = () => {
    const { user, isLoaded } = useUser();

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    Access Denied
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400">
                    You must be signed in to view this page.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                {/* Header */}
                <div className="px-6 py-8 bg-gradient-to-r from-primary-600 to-primary-700">
                    <div className="flex items-center space-x-4">
                        <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center">
                            {user.imageUrl ? (
                                <img
                                    src={user.imageUrl}
                                    alt="Profile"
                                    className="h-20 w-20 rounded-full object-cover"
                                />
                            ) : (
                                <User className="h-10 w-10 text-white" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">
                                {user.fullName || "User Profile"}
                            </h1>
                            <p className="text-primary-200 mt-1">
                                Welcome to your profile
                            </p>
                        </div>
                    </div>
                </div>

                {/* Profile Information */}
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                        Profile Information
                    </h2>
                    
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Basic Info Card */}
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                                <User className="h-5 w-5 mr-2" />
                                Basic Information
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                        Full Name:
                                    </label>
                                    <p className="text-gray-900 dark:text-white">
                                        {user.fullName || "Not provided"}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                        First Name:
                                    </label>
                                    <p className="text-gray-900 dark:text-white">
                                        {user.firstName || "Not provided"}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                        Last Name:
                                    </label>
                                    <p className="text-gray-900 dark:text-white">
                                        {user.lastName || "Not provided"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info Card */}
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                                <Mail className="h-5 w-5 mr-2" />
                                Contact Information
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                        Primary Email:
                                    </label>
                                    <p className="text-gray-900 dark:text-white">
                                        {user.primaryEmailAddress?.emailAddress || "Not provided"}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                        Email Verified:
                                    </label>
                                    <p className="text-gray-900 dark:text-white">
                                        {user.primaryEmailAddress?.verification?.status === "verified" ? (
                                            <span className="text-green-600 dark:text-green-400">✓ Verified</span>
                                        ) : (
                                            <span className="text-red-600 dark:text-red-400">✗ Not verified</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Account Info Card */}
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                                <Calendar className="h-5 w-5 mr-2" />
                                Account Details
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                        Account Created:
                                    </label>
                                    <p className="text-gray-900 dark:text-white">
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Not available"}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                        Last Updated:
                                    </label>
                                    <p className="text-gray-900 dark:text-white">
                                        {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "Not available"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Security Info Card */}
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                                <Shield className="h-5 w-5 mr-2" />
                                Security
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                        Two-Factor Authentication:
                                    </label>
                                    <p className="text-gray-900 dark:text-white">
                                        {user.twoFactorEnabled ? (
                                            <span className="text-green-600 dark:text-green-400">✓ Enabled</span>
                                        ) : (
                                            <span className="text-yellow-600 dark:text-yellow-400">○ Not enabled</span>
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                        External Accounts:
                                    </label>
                                    <p className="text-gray-900 dark:text-white">
                                        {user.externalAccounts && user.externalAccounts.length > 0 ? (
                                            <span className="text-sm">
                                                {user.externalAccounts.map((account, index) => (
                                                    <span key={account.id} className="inline-flex items-center px-2 py-1 mr-2 text-xs bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded">
                                                        {account.provider}
                                                    </span>
                                                ))}
                                            </span>
                                        ) : (
                                            "No external accounts"
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;