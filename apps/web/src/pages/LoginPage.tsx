import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            setEmailError('Email is required');
            return false;
        }
        if (!emailRegex.test(email)) {
            setEmailError('Please enter a valid email address');
            return false;
        }
        setEmailError('');
        return true;
    };

    const validatePassword = (password: string) => {
        if (!password) {
            setPasswordError('Password is required');
            return false;
        }
        if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            return false;
        }
        setPasswordError('');
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const isEmailValid = validateEmail(email);
        const isPasswordValid = validatePassword(password);

        if (!isEmailValid || !isPasswordValid) {
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post('http://localhost:4000/api/v1/auth/login', {
                email,
                password
            }, { withCredentials: true });

            login(res.data.accessToken, res.data.user);
            navigate('/app/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-violet-50 via-indigo-50 to-pink-50 dark:from-zinc-950 dark:via-violet-950/20 dark:to-indigo-950/20 relative overflow-hidden">
            {/* Enhanced Background Decorations with Animation */}
            <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-violet-400/30 dark:bg-violet-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-normal pointer-events-none opacity-70 animate-blob" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-indigo-400/30 dark:bg-indigo-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-normal pointer-events-none opacity-70 animate-blob animation-delay-2000" />
            <div className="absolute top-[40%] left-[50%] w-[600px] h-[600px] bg-pink-400/20 dark:bg-pink-500/5 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-normal pointer-events-none opacity-60 animate-blob animation-delay-4000" />

            <div className="w-full max-w-md p-8 glass-strong rounded-3xl shadow-2xl relative z-10 transition-all duration-300 hover:shadow-[0_20px_80px_-12px_rgba(139,92,246,0.3)] hover-glow-violet">
                <div className="flex flex-col items-center mb-10">
                    <div className="relative mb-8 group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-violet-500 to-indigo-600 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-300 animate-pulse-glow" />
                        <img
                            src="/logo.png"
                            alt="Family Tree"
                            className="h-40 w-40 relative z-10 drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent text-center tracking-tight">
                        Welcome Back
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 text-center max-w-[80%] leading-relaxed">
                        Sign in to continue managing your heritage and family connections.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="p-3 glass-subtle border border-red-300 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm text-center font-medium animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className={cn(
                                "w-full px-4 py-3 glass-input rounded-xl outline-none text-slate-900 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-slate-600",
                                emailError && "border-red-500 dark:border-red-500"
                            )}
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (emailError) validateEmail(e.target.value);
                            }}
                            onBlur={() => validateEmail(email)}
                        />
                        {emailError && <p className="text-xs text-red-500 ml-1 mt-1">{emailError}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Password</label>
                            <a href="#" className="text-xs font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 transition-colors">Forgot password?</a>
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className={cn(
                                    "w-full px-4 py-3 pr-12 glass-input rounded-xl outline-none text-slate-900 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-slate-600",
                                    passwordError && "border-red-500 dark:border-red-500"
                                )}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (passwordError) validatePassword(e.target.value);
                                }}
                                onBlur={() => validatePassword(password)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-white/30 dark:hover:bg-white/10"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {passwordError && <p className="text-xs text-red-500 ml-1 mt-1">{passwordError}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl glow-violet flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <span>Sign In</span>
                                <ArrowRight className="h-4 w-4 opacity-80" />
                            </>
                        )}
                    </button>

                    <div className="text-center pt-2">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Don't have an account? </span>
                        <a href="#" className="text-sm font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 hover:underline transition-colors">Contact Admin</a>
                    </div>
                </form>
            </div>

            <div className="absolute bottom-6 text-center w-full z-10">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                    FAMILY TREE APP v1.0
                </p>
            </div>
        </div>
    );
}
