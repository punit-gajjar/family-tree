import { Handle, Position } from '@xyflow/react';
import { User as UserIcon, Calendar, Activity, Mars, Venus } from 'lucide-react';

interface PersonData {
    firstName: string;
    lastName: string;
    imageUrl?: string;
    dob?: string;
    gender?: string;
    contactNumber?: string;
    nativePlace?: string;
    address?: string;
    notes?: string;
}

interface CoupleNodeProps {
    data: {
        spouse1: PersonData;
        spouse2: PersonData;
    };
}

const getGenderIcon = (gender?: string) => {
    if (gender === 'Male') return <Mars className="h-3 w-3 text-blue-500" />;
    if (gender === 'Female') return <Venus className="h-3 w-3 text-pink-500" />;
    return <UserIcon className="h-3 w-3 text-slate-400" />;
};

const getGenderColor = (gender?: string) => {
    if (gender === 'Male') return 'text-blue-600 bg-blue-50 border-blue-100 dark:text-blue-300 dark:bg-blue-900/30 dark:border-blue-800';
    if (gender === 'Female') return 'text-pink-600 bg-pink-50 border-pink-100 dark:text-pink-300 dark:bg-pink-900/30 dark:border-pink-800';
    return 'text-slate-600 bg-slate-50 border-slate-100 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700';
}

const HoverCard = ({ data, side = 'right' }: { data: PersonData, side?: 'left' | 'right' }) => {
    const age = data.dob ? new Date().getFullYear() - new Date(data.dob).getFullYear() : null;

    const positionClasses = side === 'right'
        ? "left-full ml-4"
        : "right-full mr-4";

    const translateClasses = side === 'right'
        ? "translate-x-2 group-hover/person:translate-x-0"
        : "-translate-x-2 group-hover/person:translate-x-0";

    return (
        <div className={`absolute opacity-0 group-hover/person:opacity-100 transition-all duration-300 transform ${translateClasses} ${positionClasses} top-[-20%] w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-2xl z-[1000] pointer-events-none`}>
            <div className="flex items-center gap-3 mb-3 border-b border-slate-200 dark:border-slate-800 pb-2">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${data.gender === 'Female' ? 'border-pink-100 bg-pink-50' : 'border-blue-100 bg-blue-50'} dark:bg-slate-800 dark:border-slate-700`}>
                    {data.imageUrl ? (
                        <img src={`http://localhost:4000${data.imageUrl}`} className="h-full w-full rounded-full object-cover" />
                    ) : (
                        getGenderIcon(data.gender)
                    )}
                </div>
                <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100 leading-tight">{data.firstName} {data.lastName}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1 ${getGenderColor(data.gender)}`}>
                            {getGenderIcon(data.gender)}
                            {data.gender || 'Unknown'}
                        </span>
                    </div>
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
    );
};

export default function CoupleNode({ data }: CoupleNodeProps) {
    const { spouse1, spouse2 } = data;

    return (
        <div className="relative flex gap-0 bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-300 dark:border-slate-700 shadow-lg h-[100px] w-[400px] overflow-visible">
            {/* Spouse 1 */}
            <div className={`flex-1 flex flex-col items-center justify-center px-2 group/person relative transition-colors duration-300 ${spouse1.gender === 'Female' ? 'hover:bg-pink-50/50 dark:hover:bg-pink-900/10' : 'hover:bg-blue-50/50 dark:hover:bg-blue-900/10'} rounded-l-xl`}>
                <div className={`absolute top-0 left-0 w-full h-1.5 rounded-tl-xl ${spouse1.gender === 'Female' ? 'bg-pink-500' : 'bg-blue-500'}`} />
                <div className="flex items-center gap-3 w-full justify-center">
                    <div className={`shrink-0 h-14 w-14 rounded-full border-2 shadow-sm overflow-hidden flex items-center justify-center ${spouse1.gender === 'Female' ? 'border-pink-200 bg-pink-50' : 'border-blue-200 bg-blue-50'}`}>
                        {spouse1.imageUrl ? (
                            <img
                                src={`http://localhost:4000${spouse1.imageUrl}`}
                                alt={spouse1.firstName}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            getGenderIcon(spouse1.gender)
                        )}
                    </div>
                    <div className="text-center min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight truncate px-1">
                            {spouse1.firstName}
                        </p>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight truncate px-1 mb-1">
                            {spouse1.lastName}
                        </p>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${getGenderColor(spouse1.gender)}`}>
                            {getGenderIcon(spouse1.gender)}
                            {spouse1.gender || '?'}
                        </span>
                    </div>
                </div>
                <HoverCard data={spouse1} side="left" /> {/* Left side for left spouse? Or right outside? */}
            </div>

            {/* Divider */}
            <div className="w-[1.5px] bg-slate-200 dark:bg-slate-700 my-2" />

            {/* Spouse 2 */}
            <div className={`flex-1 flex flex-col items-center justify-center px-2 group/person relative transition-colors duration-300 ${spouse2.gender === 'Female' ? 'hover:bg-pink-50/50 dark:hover:bg-pink-900/10' : 'hover:bg-blue-50/50 dark:hover:bg-blue-900/10'} rounded-r-xl`}>
                <div className={`absolute top-0 left-0 w-full h-1.5 rounded-tr-xl ${spouse2.gender === 'Female' ? 'bg-pink-500' : 'bg-blue-500'}`} />
                <div className="flex items-center gap-3 w-full justify-center">
                    <div className={`shrink-0 h-14 w-14 rounded-full border-2 shadow-sm overflow-hidden flex items-center justify-center ${spouse2.gender === 'Female' ? 'border-pink-200 bg-pink-50' : 'border-blue-200 bg-blue-50'}`}>
                        {spouse2.imageUrl ? (
                            <img
                                src={`http://localhost:4000${spouse2.imageUrl}`}
                                alt={spouse2.firstName}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            getGenderIcon(spouse2.gender)
                        )}
                    </div>
                    <div className="text-center min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight truncate px-1">
                            {spouse2.firstName}
                        </p>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight truncate px-1 mb-1">
                            {spouse2.lastName}
                        </p>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${getGenderColor(spouse2.gender)}`}>
                            {getGenderIcon(spouse2.gender)}
                            {spouse2.gender || '?'}
                        </span>
                    </div>
                </div>
                <HoverCard data={spouse2} side="right" />
            </div>

            {/* Handles */}
            <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2 !h-2 !border-none !top-[-4px]" />
            <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2 !h-2 !border-none !bottom-[-4px]" />
        </div>
    );
}
