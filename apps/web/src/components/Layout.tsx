import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { cn } from '../lib/utils';
import {
    LayoutDashboard,
    Users,
    GitFork,
    Database,
    Settings,
    LogOut,
    Menu,
} from 'lucide-react';
import { useState } from 'react';
import LanguageSwitcher from './LanguageSwitcher';

export default function AppLayout() {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const location = useLocation();
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const navItems = [
        { label: t('sidebar.dashboard'), icon: LayoutDashboard, path: '/app/dashboard' },
        { label: t('sidebar.members'), icon: Users, path: '/app/members' },
        { label: t('sidebar.relationships'), icon: GitFork, path: '/app/relationships' },
        { label: t('sidebar.masters'), icon: Database, path: '/app/masters' },
        { label: t('sidebar.tree'), icon: GitFork, path: '/app/tree' },
        { label: t('sidebar.settings'), icon: Settings, path: '/app/settings' },
    ];

    return (
        <div className="flex h-screen w-full bg-gradient-to-br from-zinc-50 via-violet-50/30 to-indigo-50/30 dark:from-zinc-950 dark:via-violet-950/20 dark:to-indigo-950/20 font-sans text-zinc-900 dark:text-zinc-100 overflow-hidden relative selection:bg-violet-500/30">
            {/* Enhanced Background Ambient Glow */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-500/10 dark:bg-violet-500/5 blur-[120px] rounded-full pointer-events-none animate-blob" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none animate-blob animation-delay-2000" />
            <div className="absolute top-[40%] left-[40%] w-[40%] h-[40%] bg-pink-500/5 dark:bg-pink-500/3 blur-[100px] rounded-full pointer-events-none animate-blob animation-delay-4000" />

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Premium Floating Sidebar with Enhanced Glass */}
            <aside
                className={cn(
                    "fixed md:relative z-50 flex flex-col h-[calc(100vh-1.5rem)] my-3 ml-3 md:ml-3 rounded-2xl glass-card shadow-2xl transition-all duration-500 ease-out hover-glow-violet",
                    isSidebarOpen ? "translate-x-0 w-72" : "-translate-x-[120%] md:translate-x-0 md:w-20"
                )}
            >
                {/* Logo Area with Gradient Overlay */}
                <div className="h-24 flex items-center justify-center border-b border-white/10 dark:border-white/5 shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-transparent opacity-70" />
                    {isSidebarOpen ? (
                        <div className="flex flex-col items-center gap-1 z-10 animate-in fade-in zoom-in duration-300">
                            <div className="relative">
                                <div className="absolute -inset-2 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full blur-lg opacity-30 animate-pulse-glow" />
                                <img src="/logo.png" alt="Logo" className="relative h-12 w-auto drop-shadow-xl" />
                            </div>
                            <span className="text-xl font-display font-bold bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent tracking-tight">
                                {t('sidebar.familyTree')}
                            </span>
                        </div>
                    ) : (
                        <div className="z-10">
                            <img src="/logo.png" alt="Logo" className="h-10 w-auto drop-shadow-xl hover:scale-110 transition-transform duration-300" />
                        </div>
                    )}
                </div>

                {/* Navigation with Enhanced Hover Effects */}
                <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                                className={cn(
                                    "flex items-center px-3.5 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                                    isActive
                                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30 glow-violet"
                                        : "text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-zinc-100 backdrop-blur-sm"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-100" />
                                )}

                                <item.icon
                                    className={cn(
                                        "h-5 w-5 flex-shrink-0 transition-transform duration-300 relative z-10",
                                        isActive ? "text-white" : "group-hover:scale-110",
                                        !isSidebarOpen && "mx-auto"
                                    )}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />

                                <span className={cn(
                                    "ml-3 font-medium text-sm tracking-wide transition-all duration-300 relative z-10",
                                    !isSidebarOpen && "hidden opacity-0 w-0",
                                    isSidebarOpen && "block opacity-100 w-auto"
                                )}>
                                    {item.label}
                                </span>

                                {!isSidebarOpen && !isActive && (
                                    <div className="absolute left-14 glass-strong text-zinc-900 dark:text-zinc-50 text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl">
                                        {item.label}
                                    </div>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer User/Logout with Glass Effect */}
                <div className="p-4 border-t border-white/10 dark:border-white/5 shrink-0 bg-gradient-to-t from-white/30 to-transparent dark:from-black/20">
                    <button
                        onClick={logout}
                        className={cn(
                            "flex items-center w-full px-3 py-2.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-red-50/80 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 group backdrop-blur-sm",
                            !isSidebarOpen && "justify-center px-0"
                        )}
                    >
                        <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        {isSidebarOpen && <span className="ml-3 font-medium text-sm">{t('sidebar.signOut')}</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

                {/* Enhanced Float Header with Strong Glass */}
                <header className="h-16 mt-3 mx-4 md:mx-6 glass-card rounded-2xl shadow-lg flex items-center justify-between px-4 md:px-6 shrink-0 z-30 transition-all duration-300 hover:shadow-xl">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(!isSidebarOpen)}
                            className="p-2 -ml-1 rounded-lg hover:bg-white/50 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400 transition-all duration-300 md:hidden flex-shrink-0 backdrop-blur-sm"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                        <LanguageSwitcher />

                        <div className="flex items-center gap-2 pl-2 border-l border-zinc-200/50 dark:border-zinc-700/50">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 border-2 border-white/50 dark:border-white/20 flex items-center justify-center text-white font-bold text-xs shadow-lg glow-violet flex-shrink-0 hover:scale-110 transition-transform duration-300">
                                {user?.email?.[0].toUpperCase() || 'U'}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-4 md:p-6 pb-20 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                    <div className="mx-auto min-h-[calc(100vh-12rem)] animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Outlet />
                    </div>

                    {/* Footer */}
                    <footer className="mt-8 py-6 text-center">
                        <p className="text-xs text-zinc-400 font-medium tracking-wide">
                            &copy; {new Date().getFullYear()} {t('sidebar.familyTree').toUpperCase()} <span className="mx-2 opacity-30">|</span> BUILT WITH PASSION
                        </p>
                    </footer>
                </main>
            </div>
        </div>
    );
}
