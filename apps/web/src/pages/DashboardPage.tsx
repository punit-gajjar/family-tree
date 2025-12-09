import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Users, Share2, Heart, Activity } from 'lucide-react';

interface DashboardStats {
    totalMembers: number;
    totalRelationships: number;
    totalFamilies: number;
    recentMembers: {
        id: number;
        firstName: string;
        lastName: string;
        updatedAt: string;
        imageUrl: string | null;
    }[];
}

export default function DashboardPage() {
    const { data: stats, isLoading } = useQuery<DashboardStats>({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const res = await axios.get('http://localhost:4000/api/v1/dashboard/stats', { withCredentials: true });
            return res.data;
        }
    });

    if (isLoading) return <div className="flex items-center justify-center h-64 text-slate-500">Loading dashboard...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">Dashboard</h1>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Total Members */}
                <div className="p-6 rounded-2xl glass-card shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-4 group hover:scale-[1.02] hover-glow-violet">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg glow-violet group-hover:scale-110 transition-transform duration-300">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Members</p>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{stats?.totalMembers || 0}</h3>
                    </div>
                </div>

                {/* Total Relationships */}
                <div className="p-6 rounded-2xl glass-card shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-4 group hover:scale-[1.02] hover-glow-violet">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg glow-violet group-hover:scale-110 transition-transform duration-300">
                        <Share2 className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Connections</p>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">{stats?.totalRelationships || 0}</h3>
                    </div>
                </div>

                {/* Total Families */}
                <div className="p-6 rounded-2xl glass-card shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-4 group hover:scale-[1.02] hover-glow-violet">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg glow-pink group-hover:scale-110 transition-transform duration-300">
                        <Heart className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Families</p>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">{stats?.totalFamilies || 0}</h3>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl glass-card p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-slate-100">
                    <Activity className="h-5 w-5 text-violet-500" />
                    Recent Activity
                </h3>
                <div className="space-y-4">
                    {stats?.recentMembers.map(member => (
                        <div key={member.id} className="flex items-center gap-4 py-3 border-b border-white/20 dark:border-white/10 last:border-0 hover:bg-white/30 dark:hover:bg-white/5 rounded-lg px-2 -mx-2 transition-all duration-300">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 overflow-hidden flex items-center justify-center text-violet-700 dark:text-violet-300 font-bold shadow-md ring-2 ring-white/50 dark:ring-white/10">
                                {member.imageUrl ? <img src={`http://localhost:4000${member.imageUrl}`} className="h-full w-full object-cover" alt={member.firstName} /> : member.firstName[0]}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{member.firstName} {member.lastName}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Updated {new Date(member.updatedAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                    {stats?.recentMembers.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No recent activity.</p>}
                </div>
            </div>
        </div>
    )
}
