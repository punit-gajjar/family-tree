import React from 'react';
import { User, Calendar, MapPin, Phone, Pencil, Trash2, Mars, Venus } from 'lucide-react';

interface Member {
    id: number;
    firstName: string;
    lastName: string;
    imageUrl?: string;
    dob?: string;
    gender?: string;
    contactNumber?: string;
    nativePlace?: string;
    address?: string;
    notes?: string;
    spouses?: Member[];
    children?: Member[];
    parents?: Member[];
}

interface MemberDetailCardProps {
    member: Member;
    onEdit: (member: Member) => void;
    onDelete: (id: number) => void;
}

export default function MemberDetailCard({ member, onEdit, onDelete }: MemberDetailCardProps) {
    const age = member.dob ? new Date().getFullYear() - new Date(member.dob).getFullYear() : 'N/A';

    const getGenderIcon = (gender?: string) => {
        if (gender === 'Male') return <Mars className="h-3 w-3 text-blue-500" />;
        if (gender === 'Female') return <Venus className="h-3 w-3 text-pink-500" />;
        return <User className="h-3 w-3 text-slate-400" />;
    };

    const RelationChip = ({ person }: { person: Member }) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 glass-subtle rounded-lg text-xs text-slate-700 dark:text-slate-300 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
            {getGenderIcon(person.gender)}
            <span className="truncate max-w-[100px] font-medium">{person.firstName} {person.lastName}</span>
        </span>
    );

    return (
        <div className="group relative flex flex-col glass-card rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:scale-[1.02] hover-glow-violet">
            {/* Header / Avatar with Gradient */}
            <div className={`h-20 w-full ${member.gender === 'Female' ? 'bg-gradient-to-br from-pink-400/20 to-rose-400/10 dark:from-pink-500/10 dark:to-rose-500/5' : 'bg-gradient-to-br from-blue-400/20 to-indigo-400/10 dark:from-blue-500/10 dark:to-indigo-500/5'} absolute top-0 left-0`}></div>

            <div className="pt-8 px-6 pb-4 flex flex-col items-center relative z-10 w-full">
                <div className="h-24 w-24 rounded-full bg-white dark:bg-slate-800 p-1 shadow-xl mb-3 ring-2 ring-white/50 dark:ring-white/10">
                    <div className="h-full w-full rounded-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                        {member.imageUrl ? (
                            <img src={`http://localhost:4000${member.imageUrl}`} alt={member.firstName} className="h-full w-full object-cover" />
                        ) : (
                            <User className="h-10 w-10 text-slate-400" />
                        )}
                    </div>
                </div>

                <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100 text-center">{member.firstName} {member.lastName}</h3>
                <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${member.gender === 'Female' ? 'bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 dark:from-pink-900/30 dark:to-rose-900/30 dark:text-pink-300' : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-300'} shadow-sm`}>
                        {getGenderIcon(member.gender)}
                        {member.gender || 'Unknown'}
                    </span>
                    {member.dob && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                            <Calendar className="h-3 w-3" /> {new Date(member.dob).getFullYear()} ({age}y)
                        </span>
                    )}
                </div>
            </div>

            {/* Info Grid */}
            <div className="px-6 py-4 space-y-3 border-t border-white/20 dark:border-white/10 flex-1 bg-gradient-to-b from-transparent to-white/30 dark:to-black/20">
                {/* Contact & Native */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                    {member.contactNumber && (
                        <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400 overflow-hidden">
                            <Phone className="h-4 w-4 shrink-0 mt-0.5 text-indigo-500" />
                            <span className="truncate font-medium">{member.contactNumber}</span>
                        </div>
                    )}
                    {member.nativePlace && (
                        <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400 overflow-hidden">
                            <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-orange-500" />
                            <span className="truncate font-medium">{member.nativePlace}</span>
                        </div>
                    )}
                </div>

                {/* Address */}
                {member.address && (
                    <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <MapPin className="h-4 w-4 shrink-0 mt-0.5 opacity-0" /> {/* Spacer */}
                        <p className="text-xs line-clamp-2">{member.address}</p>
                    </div>
                )}
            </div>

            {/* Relations Section with Glass Effect */}
            <div className="glass-subtle px-6 py-4 text-sm border-t border-white/20 dark:border-white/10">
                {/* Parents */}
                <div className="mb-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Parents</span>
                    <div className="flex flex-wrap gap-1.5">
                        {member.parents && member.parents.length > 0 ? member.parents.map(p => (
                            <RelationChip key={p.id} person={p} />
                        )) : <span className="text-xs text-slate-400 italic">None listed</span>}
                    </div>
                </div>

                {/* Spouse */}
                <div className="mb-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Spouse</span>
                    <div className="flex flex-wrap gap-1.5">
                        {member.spouses && member.spouses.length > 0 ? member.spouses.map(s => (
                            <RelationChip key={s.id} person={s} />
                        )) : <span className="text-xs text-slate-400 italic">None listed</span>}
                    </div>
                </div>

                {/* Children */}
                <div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Children</span>
                    <div className="flex flex-wrap gap-1.5">
                        {member.children && member.children.length > 0 ? member.children.map(c => (
                            <RelationChip key={c.id} person={c} />
                        )) : <span className="text-xs text-slate-400 italic">None listed</span>}
                    </div>
                </div>
            </div>

            {/* Actions with Glass Effect */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-2 z-20">
                <button onClick={() => onEdit(member)} className="p-2 glass-strong rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400">
                    <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => onDelete(member.id)} className="p-2 glass-strong rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
