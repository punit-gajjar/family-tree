import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { User, Lock, Mail, Eye, EyeOff, Save, Shield } from 'lucide-react';
import { cn } from '../lib/utils';

interface PasswordFormValues {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface ProfileFormValues {
    email: string;
    firstName: string;
    lastName: string;
}

export default function SettingsPage() {
    const { user } = useAuth();
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');
    const [profileError, setProfileError] = useState('');

    const passwordSchema = z.object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string()
            .min(6, "Password must be at least 6 characters")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/[0-9]/, "Password must contain at least one number"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    }).refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

    const profileSchema = z.object({
        email: z.string().email("Invalid email address"),
        firstName: z.string().min(2, "First name must be at least 2 characters"),
        lastName: z.string().min(2, "Last name must be at least 2 characters"),
    });

    const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting }, reset: resetPassword } = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
    });

    const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors, isSubmitting: isProfileSubmitting } } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            email: user?.email || '',
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
        }
    });

    const onPasswordSubmit = async (data: PasswordFormValues) => {
        setPasswordError('');
        setPasswordSuccess('');

        try {
            await axios.post('http://localhost:4000/api/v1/auth/change-password', {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            }, { withCredentials: true });

            setPasswordSuccess('Password changed successfully!');
            resetPassword();
            setTimeout(() => setPasswordSuccess(''), 5000);
        } catch (err: any) {
            setPasswordError(err.response?.data?.message || 'Failed to change password');
        }
    };

    const onProfileSubmit = async (data: ProfileFormValues) => {
        setProfileError('');
        setProfileSuccess('');

        try {
            await axios.patch('http://localhost:4000/api/v1/auth/profile', data, { withCredentials: true });
            setProfileSuccess('Profile updated successfully!');
            setTimeout(() => setProfileSuccess(''), 5000);
        } catch (err: any) {
            setProfileError(err.response?.data?.message || 'Failed to update profile');
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">Settings</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account settings and preferences</p>
            </div>

            {/* Profile Settings */}
            <div className="glass-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                        <User className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Profile Information</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Update your personal information</p>
                    </div>
                </div>

                {profileSuccess && (
                    <div className="mb-4 p-3 glass-subtle border border-green-300 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm font-medium">
                        {profileSuccess}
                    </div>
                )}

                {profileError && (
                    <div className="mb-4 p-3 glass-subtle border border-red-300 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm font-medium">
                        {profileError}
                    </div>
                )}

                <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">First Name</label>
                            <input
                                {...registerProfile("firstName")}
                                className="w-full px-4 py-2.5 glass-input rounded-lg text-sm"
                                placeholder="Enter first name"
                            />
                            {profileErrors.firstName && <span className="text-xs text-red-500 font-medium">{profileErrors.firstName.message}</span>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Last Name</label>
                            <input
                                {...registerProfile("lastName")}
                                className="w-full px-4 py-2.5 glass-input rounded-lg text-sm"
                                placeholder="Enter last name"
                            />
                            {profileErrors.lastName && <span className="text-xs text-red-500 font-medium">{profileErrors.lastName.message}</span>}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                {...registerProfile("email")}
                                type="email"
                                className="w-full pl-10 pr-4 py-2.5 glass-input rounded-lg text-sm"
                                placeholder="your@email.com"
                            />
                        </div>
                        {profileErrors.email && <span className="text-xs text-red-500 font-medium">{profileErrors.email.message}</span>}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-white/20 dark:border-white/10">
                        <button
                            type="submit"
                            disabled={isProfileSubmitting}
                            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <Save className="h-4 w-4" />
                            {isProfileSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Password Change */}
            <div className="glass-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
                        <Shield className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Change Password</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Update your password to keep your account secure</p>
                    </div>
                </div>

                {passwordSuccess && (
                    <div className="mb-4 p-3 glass-subtle border border-green-300 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm font-medium">
                        {passwordSuccess}
                    </div>
                )}

                {passwordError && (
                    <div className="mb-4 p-3 glass-subtle border border-red-300 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm font-medium">
                        {passwordError}
                    </div>
                )}

                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Current Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                {...registerPassword("currentPassword")}
                                type={showCurrentPassword ? "text" : "password"}
                                className={cn(
                                    "w-full pl-10 pr-12 py-2.5 glass-input rounded-lg text-sm",
                                    passwordErrors.currentPassword && "border-red-500"
                                )}
                                placeholder="Enter current password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-white/30 dark:hover:bg-white/10"
                            >
                                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {passwordErrors.currentPassword && <span className="text-xs text-red-500 font-medium">{passwordErrors.currentPassword.message}</span>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                {...registerPassword("newPassword")}
                                type={showNewPassword ? "text" : "password"}
                                className={cn(
                                    "w-full pl-10 pr-12 py-2.5 glass-input rounded-lg text-sm",
                                    passwordErrors.newPassword && "border-red-500"
                                )}
                                placeholder="Enter new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-white/30 dark:hover:bg-white/10"
                            >
                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {passwordErrors.newPassword && <span className="text-xs text-red-500 font-medium">{passwordErrors.newPassword.message}</span>}
                        <p className="text-xs text-slate-500 dark:text-slate-400">Must be at least 6 characters with uppercase, lowercase, and numbers</p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Confirm New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                {...registerPassword("confirmPassword")}
                                type={showConfirmPassword ? "text" : "password"}
                                className={cn(
                                    "w-full pl-10 pr-12 py-2.5 glass-input rounded-lg text-sm",
                                    passwordErrors.confirmPassword && "border-red-500"
                                )}
                                placeholder="Confirm new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-white/30 dark:hover:bg-white/10"
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {passwordErrors.confirmPassword && <span className="text-xs text-red-500 font-medium">{passwordErrors.confirmPassword.message}</span>}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-white/20 dark:border-white/10">
                        <button
                            type="submit"
                            disabled={isPasswordSubmitting}
                            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl glow-violet transition-all duration-300"
                        >
                            <Lock className="h-4 w-4" />
                            {isPasswordSubmitting ? 'Changing...' : 'Change Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
