import { Handle, Position } from '@xyflow/react';
import { User as UserIcon, Calendar, Activity } from 'lucide-react';

interface FamilyNodeProps {
    data: {
        label: string;
        firstName: string;
        lastName: string;
        imageUrl?: string;
        dob?: string;
        gender?: string;
        contactNumber?: string;
        nativePlace?: string;
        address?: string;
        notes?: string;
    };
}

export default function FamilyNode({ data }: FamilyNodeProps) {
    const age = data.dob ? new Date().getFullYear() - new Date(data.dob).getFullYear() : null;

    return (
        <div className="relative group w-[220px] h-[100px] rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center overflow-visible hover:z-[9999]">
            {/* Top Gradient Bar */}
            <div className={`absolute top-0 w-full h-1.5 rounded-t-xl ${data.gender === 'Female' ? 'bg-pink-500' : 'bg-blue-500'}`} />

            <div className="flex items-center gap-3 px-4 z-10 w-full justify-center">
                {/* Avatar */}
                <div className="shrink-0 h-14 w-14 rounded-full border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {data.imageUrl ? (
                        <img
                            src={data.imageUrl.startsWith('http') ? data.imageUrl : `http://localhost:4000${data.imageUrl}`}
                            alt={data.label}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <UserIcon className="h-7 w-7 text-slate-300" />
                    )}
                </div>

                {/* Info */}
                <div className="text-center min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight truncate px-1">
                        {data.firstName}
                    </h3>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight truncate px-1">
                        {data.lastName}
                    </h3>
                </div>
            </div>

            {/* Hover Card */}
            <div className="absolute opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-2xl z-[1000] pointer-events-none group-hover:pointer-events-auto">
                <div className="flex items-center gap-3 mb-3 border-b border-slate-200 dark:border-slate-800 pb-2">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        {data.imageUrl ? (
                            <img src={data.imageUrl.startsWith('http') ? data.imageUrl : `http://localhost:4000${data.imageUrl}`} className="h-full w-full rounded-full object-cover" />
                        ) : <UserIcon className="h-5 w-5" />}
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{data.firstName} {data.lastName}</p>
                        <p className="text-xs text-slate-500 capitalize">{data.gender || 'Family Member'}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    {data.dob && (
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <Calendar className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                            <span>Born: {new Date(data.dob).toLocaleDateString()}</span>
                        </div>
                    )}
                    {age !== null && (
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <Activity className="h-3.5 w-3.5 text-green-500 shrink-0" />
                            <span>Age: ~{age} years</span>
                        </div>
                    )}
                    {data.gender && (
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <UserIcon className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                            <span className="capitalize">Gender: {data.gender}</span>
                        </div>
                    )}
                    {data.contactNumber && (
                        <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <span className="font-semibold shrink-0">Ph:</span>
                            <span>{data.contactNumber}</span>
                        </div>
                    )}
                    {data.nativePlace && (
                        <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <span className="font-semibold shrink-0">Native:</span>
                            <span>{data.nativePlace}</span>
                        </div>
                    )}
                    {data.address && (
                        <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <span className="font-semibold shrink-0">Addr:</span>
                            <span className="line-clamp-2">{data.address}</span>
                        </div>
                    )}
                    {data.notes && (
                        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] text-slate-500 italic line-clamp-3">"{data.notes}"</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Handles */}
            <Handle type="target" position={Position.Top} className="!bg-slate-300 !w-3 !h-1 !rounded-sm !-top-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Handle type="source" position={Position.Bottom} className="!bg-slate-300 !w-3 !h-1 !rounded-sm !-bottom-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
}
