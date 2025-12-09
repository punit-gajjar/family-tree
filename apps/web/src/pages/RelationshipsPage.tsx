import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, Users, Heart, Baby } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Combobox } from '../components/ui/combobox';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLanguage } from '../context/LanguageContext';
import MemberDetailCard from '../components/MemberDetailCard';

// Interfaces
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
    aadharNumber?: string;
    notes?: string;
}

interface RelationMaster {
    id: number;
    code: string;
    label: string;
}

interface Edge {
    id: number;
    fromMemberId: number;
    toMemberId: number;
    relation: RelationMaster;
    toMember: Member;
    fromMember: Member;
}

// Dialog Component
const RelationshipDialog = ({
    isOpen,
    onClose,
    members,
    relations,
}: {
    isOpen: boolean;
    onClose: () => void;
    members: Member[];
    relations: RelationMaster[];
}) => {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    const schema = z.object({
        fromMemberId: z.string().min(1, 'From member required'),
        toMemberId: z.string().min(1, 'To member required'),
        relationCode: z.string().min(1, 'Relation type required'),
    });

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
    });

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const payload = {
                fromMemberId: Number(data.fromMemberId),
                toMemberId: Number(data.toMemberId),
                relationCode: data.relationCode
            };
            return axios.post('http://localhost:4000/api/v1/relations', payload, { withCredentials: true });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['relationships'] });
            queryClient.invalidateQueries({ queryKey: ['family-data'] });
            onClose();
            reset();
        }
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-lg p-4">
            <div className="w-full max-w-md rounded-2xl glass-strong p-6 shadow-2xl">
                <h2 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-4">{t('relationships.addRelationship')}</h2>

                <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t('relationships.fromMember')}</label>
                        <select {...register("fromMemberId")} className="w-full px-3 py-2 glass-input rounded-lg text-sm">
                            <option value="">{t('relationships.selectMember')}</option>
                            {members.map(m => (
                                <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                            ))}
                        </select>
                        {errors.fromMemberId && <span className="text-xs text-red-500 font-medium">{errors.fromMemberId.message as string}</span>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t('relationships.relationType')}</label>
                        <select {...register("relationCode")} className="w-full px-3 py-2 glass-input rounded-lg text-sm">
                            <option value="">{t('relationships.selectRelationship')}</option>
                            {relations.map(r => (
                                <option key={r.id} value={r.code}>{r.label}</option>
                            ))}
                        </select>
                        {errors.relationCode && <span className="text-xs text-red-500 font-medium">{errors.relationCode.message as string}</span>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t('relationships.toMember')}</label>
                        <select {...register("toMemberId")} className="w-full px-3 py-2 glass-input rounded-lg text-sm">
                            <option value="">{t('relationships.selectMember')}</option>
                            {members.map(m => (
                                <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                            ))}
                        </select>
                        {errors.toMemberId && <span className="text-xs text-red-500 font-medium">{errors.toMemberId.message as string}</span>}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/20 dark:border-white/10">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 glass-panel hover:glass-card rounded-lg transition-all duration-300 shadow-md hover:shadow-lg">{t('common.cancel')}</button>
                        <button type="submit" disabled={isSubmitting || mutation.isPending} className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl glow-violet transition-all duration-300">
                            {mutation.isPending ? t('common.loading') : t('common.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
};

export default function RelationshipsPage() {
    const { t } = useLanguage();
    const [selectedMemberId, setSelectedMemberId] = useState<string>('');
    const [isDialogOpen, setDialogOpen] = useState(false);

    // Fetch all members for dropdown
    const { data: members = [] } = useQuery<Member[]>({
        queryKey: ['members-list'],
        queryFn: async () => {
            const res = await axios.get('http://localhost:4000/api/v1/members?limit=1000', { withCredentials: true });
            return res.data.data;
        }
    });

    // Fetch masters
    const { data: relations = [] } = useQuery<RelationMaster[]>({
        queryKey: ['relation-masters'],
        queryFn: async () => {
            const res = await axios.get('http://localhost:4000/api/v1/relations/masters', { withCredentials: true });
            return res.data;
        }
    });

    // Fetch all relationships for selected member
    const { data: edges = [] } = useQuery<Edge[]>({
        queryKey: ['family-data', selectedMemberId],
        queryFn: async () => {
            if (!selectedMemberId) return [];
            const res = await axios.get(`http://localhost:4000/api/v1/relations?memberId=${selectedMemberId}`, { withCredentials: true });
            return res.data;
        },
        enabled: !!selectedMemberId
    });

    // Process family data
    const selectedMember = members.find(m => m.id === Number(selectedMemberId));

    const spouse = edges.find(e =>
        (e.fromMemberId === Number(selectedMemberId) && (e.relation.code === 'SPOUSE' || e.relation.code === 'HUSBAND' || e.relation.code === 'WIFE')) ||
        (e.toMemberId === Number(selectedMemberId) && (e.relation.code === 'SPOUSE' || e.relation.code === 'HUSBAND' || e.relation.code === 'WIFE'))
    );
    const spouseMember = spouse ? (spouse.fromMemberId === Number(selectedMemberId) ? spouse.toMember : spouse.fromMember) : null;

    const parents = edges.filter(e =>
        e.toMemberId === Number(selectedMemberId) && (e.relation.code === 'FATHER' || e.relation.code === 'MOTHER')
    ).map(e => e.fromMember);

    const children = edges.filter(e =>
        e.fromMemberId === Number(selectedMemberId) && (e.relation.code === 'SON' || e.relation.code === 'DAUGHTER')
    ).map(e => {
        // Find child's spouse
        const childSpouse = edges.find(edge =>
            (edge.fromMemberId === e.toMemberId || edge.toMemberId === e.toMemberId) &&
            (edge.relation.code === 'SPOUSE' || edge.relation.code === 'HUSBAND' || edge.relation.code === 'WIFE')
        );
        const childSpouseMember = childSpouse ?
            (childSpouse.fromMemberId === e.toMemberId ? childSpouse.toMember : childSpouse.fromMember) : null;

        return {
            member: e.toMember,
            spouse: childSpouseMember
        };
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">{t('relationships.title')}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{t('relationships.subtitle')}</p>
                </div>
                <button onClick={() => setDialogOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:from-violet-700 hover:to-indigo-700 shadow-lg hover:shadow-xl glow-violet transition-all duration-300 text-sm font-semibold">
                    <Plus className="h-4 w-4" />
                    {t('relationships.addRelationship')}
                </button>
            </div>

            <div className="glass-card p-4 rounded-xl shadow-md">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 block">{t('relationships.filterByMember')}</label>
                <div className="w-full max-w-md">
                    <Combobox
                        options={members.map(m => ({ value: String(m.id), label: `${m.firstName} ${m.lastName}` }))}
                        value={selectedMemberId}
                        onChange={(value) => setSelectedMemberId(value || '')}
                        placeholder={t('relationships.selectMemberPlaceholder')}
                    />
                </div>
            </div>

            {!selectedMemberId ? (
                <div className="text-center py-16 glass-card rounded-2xl">
                    <Users className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                    <p className="text-slate-500 dark:text-slate-400 text-lg">{t('relationships.selectMemberPlaceholder')}</p>
                </div>
            ) : selectedMember ? (
                <div className="space-y-8">
                    {/* Selected Member & Spouse */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Heart className="h-5 w-5 text-pink-500" />
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Selected Member {spouseMember && '& Spouse'}</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <MemberDetailCard
                                member={selectedMember}
                                onEdit={() => { }}
                                onDelete={() => { }}
                            />
                            {spouseMember && (
                                <MemberDetailCard
                                    member={spouseMember}
                                    onEdit={() => { }}
                                    onDelete={() => { }}
                                />
                            )}
                        </div>
                    </div>

                    {/* Parents */}
                    {parents.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Users className="h-5 w-5 text-blue-500" />
                                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Parents</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {parents.map(parent => (
                                    <MemberDetailCard
                                        key={parent.id}
                                        member={parent}
                                        onEdit={() => { }}
                                        onDelete={() => { }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Children */}
                    {children.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Baby className="h-5 w-5 text-green-500" />
                                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Children</h2>
                            </div>
                            <div className="space-y-6">
                                {children.map((child, idx) => (
                                    <div key={child.member.id} className="glass-subtle p-4 rounded-xl">
                                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">Child {idx + 1} {child.spouse && '& Spouse'}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <MemberDetailCard
                                                member={child.member}
                                                onEdit={() => { }}
                                                onDelete={() => { }}
                                            />
                                            {child.spouse && (
                                                <MemberDetailCard
                                                    member={child.spouse}
                                                    onEdit={() => { }}
                                                    onDelete={() => { }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {parents.length === 0 && children.length === 0 && !spouseMember && (
                        <div className="text-center py-12 glass-card rounded-2xl">
                            <p className="text-slate-500 dark:text-slate-400">No family relationships found for this member.</p>
                        </div>
                    )}
                </div>
            ) : null}

            {isDialogOpen && (
                <RelationshipDialog
                    isOpen={isDialogOpen}
                    onClose={() => setDialogOpen(false)}
                    members={members}
                    relations={relations}
                />
            )}
        </div>
    )
}
