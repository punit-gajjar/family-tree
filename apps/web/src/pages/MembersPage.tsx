import { useState, useEffect, useRef } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, Search, Pencil, Trash2, Download } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { Combobox } from '../components/ui/combobox';
import { zodResolver } from '@hookform/resolvers/zod';
import MemberDetailCard from '../components/MemberDetailCard';
import { useLanguage } from '../context/LanguageContext';

// Domain Types
interface Member {
    id: number;
    firstName: string;
    lastName: string;
    imageUrl?: string;
    dob?: string;
    notes?: string;
    aadharNumber?: string;
    nativePlace?: string;
    address?: string;
    contactNumber?: string;
    gender?: string;
    spouses?: Member[];
    children?: Member[];
    parents?: Member[];
}

interface MemberResponse {
    data: Member[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }
}

interface RelationMaster {
    id: number;
    code: string;
    label: string;
}

// Form Types
interface MemberFormValues {
    firstName: string;
    lastName: string;
    dob?: string;
    aadharNumber?: string;
    notes?: string;
    nativePlace?: string;
    address?: string;
    contactNumber?: string;
    gender?: string;
    relativeId?: string;
    relationCode?: string;
}

// Dialog Component
const MemberDialog = ({
    isOpen,
    onClose,
    initialData
}: {
    isOpen: boolean;
    onClose: () => void;
    initialData?: Member | null
}) => {
    const queryClient = useQueryClient();
    const { t } = useLanguage();
    const isEdit = !!initialData;

    // Fetch linking data for dropdowns
    const { data: allMembersRaw } = useQuery<MemberResponse>({
        queryKey: ['members-list-dialog'],
        queryFn: async () => {
            const res = await axios.get('http://localhost:4000/api/v1/members?limit=100', { withCredentials: true });
            return res.data;
        },
        enabled: isOpen && !isEdit
    });

    const allMembers = allMembersRaw?.data || [];

    const { data: relations = [] } = useQuery<RelationMaster[]>({
        queryKey: ['relation-masters-dialog'],
        queryFn: async () => {
            const res = await axios.get('http://localhost:4000/api/v1/relations/masters', { withCredentials: true });
            return res.data;
        },
        enabled: isOpen && !isEdit
    });

    const schema = z.object({
        firstName: z.string().min(1, "First name is required").min(2, "First name must be at least 2 characters"),
        lastName: z.string().min(1, "Last name is required").min(2, "Last name must be at least 2 characters"),
        dob: z.string().optional(),
        aadharNumber: z.string().optional().refine((val) => !val || val.length === 12, "Aadhar number must be 12 digits"),
        notes: z.string().optional(),
        nativePlace: z.string().optional(),
        address: z.string().optional(),
        contactNumber: z.string().optional().refine((val) => !val || /^[+]?[0-9]{10,15}$/.test(val), "Invalid phone number format"),
        gender: z.string().min(1, "Please select a gender"),
        relativeId: z.string().optional(),
        relationCode: z.string().optional(),
    });

    const { register, handleSubmit, reset, watch, control, formState: { errors, isSubmitting } } = useForm<MemberFormValues>({
        resolver: zodResolver(schema),
        defaultValues: initialData ? {
            firstName: initialData.firstName,
            lastName: initialData.lastName,
            dob: initialData.dob ? new Date(initialData.dob).toISOString().split('T')[0] : '',
            aadharNumber: initialData.aadharNumber || '',
            notes: initialData.notes || '',
            nativePlace: initialData.nativePlace || '',
            address: initialData.address || '',
            contactNumber: initialData.contactNumber || '',
            gender: initialData.gender || '',
            relativeId: '',
            relationCode: ''
        } : {
            firstName: '',
            lastName: '',
            dob: '',
            aadharNumber: '',
            notes: '',
            nativePlace: '',
            address: '',
            contactNumber: '',
            gender: '',
            relativeId: '',
            relationCode: ''
        }
    });

    const relativeId = watch('relativeId');
    const relationCode = watch('relationCode');

    const mutation = useMutation({
        mutationFn: async (data: MemberFormValues) => {
            const formData = new FormData();
            formData.append('firstName', data.firstName);
            formData.append('lastName', data.lastName);
            if (data.dob) formData.append('dob', data.dob);
            if (data.aadharNumber) formData.append('aadharNumber', data.aadharNumber);
            if (data.notes) formData.append('notes', data.notes);
            if (data.nativePlace) formData.append('nativePlace', data.nativePlace);
            if (data.address) formData.append('address', data.address);
            if (data.contactNumber) formData.append('contactNumber', data.contactNumber);
            if (data.gender) formData.append('gender', data.gender);

            const fileInput = document.getElementById('image-upload') as HTMLInputElement;
            if (fileInput?.files?.[0]) {
                formData.append('image', fileInput.files[0]);
            }

            let newMember;
            if (isEdit) {
                const res = await axios.patch(`http://localhost:4000/api/v1/members/${initialData.id}`, formData, { withCredentials: true });
                newMember = res.data;
            } else {
                const res = await axios.post('http://localhost:4000/api/v1/members', formData, { withCredentials: true });
                newMember = res.data;

                if (data.relativeId && data.relationCode) {
                    await axios.post('http://localhost:4000/api/v1/relations', {
                        fromMemberId: newMember.id,
                        toMemberId: Number(data.relativeId),
                        relationCode: data.relationCode
                    }, { withCredentials: true });
                }
            }
            return newMember;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
            onClose();
            reset();
        }
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-lg overflow-y-auto p-4">
            <div className="w-full max-w-5xl rounded-2xl glass-strong p-6 shadow-2xl my-auto hover-glow-violet max-h-[95vh] overflow-y-auto scrollbar-thin">
                <div className="mb-4">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">{isEdit ? t('members.editMember') : t('members.addMember')}</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Fill in the member details below</p>
                </div>

                <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t('members.firstName')} *</label>
                            <input {...register("firstName")} className="w-full px-3 py-2 glass-input rounded-lg text-sm" placeholder="First name" />
                            {errors.firstName && <span className="text-xs text-red-500 font-medium">{errors.firstName.message}</span>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t('members.lastName')} *</label>
                            <input {...register("lastName")} className="w-full px-3 py-2 glass-input rounded-lg text-sm" placeholder="Last name" />
                            {errors.lastName && <span className="text-xs text-red-500 font-medium">{errors.lastName.message}</span>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t('members.gender')} *</label>
                            <select {...register("gender")} className="w-full px-3 py-2 glass-input rounded-lg text-sm">
                                <option value="">{t('members.selectGender')}</option>
                                <option value="Male">{t('members.male')}</option>
                                <option value="Female">{t('members.female')}</option>
                                <option value="Other">{t('members.other')}</option>
                            </select>
                            {errors.gender && <span className="text-xs text-red-500 font-medium">{errors.gender.message}</span>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t('members.dob')}</label>
                            <input type="date" {...register("dob")} className="w-full px-3 py-2 glass-input rounded-lg text-sm" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t('members.contact')}</label>
                            <input {...register("contactNumber")} className="w-full px-3 py-2 glass-input rounded-lg text-sm" placeholder="+91 1234567890" />
                            {errors.contactNumber && <span className="text-xs text-red-500 font-medium">{errors.contactNumber.message}</span>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t('members.nativePlace')}</label>
                            <input {...register("nativePlace")} className="w-full px-3 py-2 glass-input rounded-lg text-sm" placeholder="Native place" />
                        </div>
                        <div className="space-y-1 md:col-span-2 lg:col-span-3">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t('members.aadhar')}</label>
                            <input {...register("aadharNumber")} className="w-full px-3 py-2 glass-input rounded-lg text-sm" placeholder="12-digit Aadhar number" maxLength={12} />
                            {errors.aadharNumber && <span className="text-xs text-red-500 font-medium">{errors.aadharNumber.message}</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t('members.address')}</label>
                            <textarea {...register("address")} className="w-full px-3 py-2 glass-input rounded-lg text-sm" rows={2} placeholder="Full address" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t('members.notes')}</label>
                            <textarea {...register("notes")} className="w-full px-3 py-2 glass-input rounded-lg text-sm" rows={2} placeholder="Additional notes" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t('members.photo')}</label>
                        <input type="file" id="image-upload" accept="image/*" className="w-full text-sm text-slate-600 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gradient-to-r file:from-violet-100 file:to-indigo-100 dark:file:from-violet-900/30 dark:file:to-indigo-900/30 file:text-violet-700 dark:file:text-violet-300 hover:file:from-violet-200 hover:file:to-indigo-200 dark:hover:file:from-violet-900/50 dark:hover:file:to-indigo-900/50 file:transition-all file:duration-300 file:shadow-sm" />
                    </div>

                    {!isEdit && (
                        <div className="pt-3 border-t border-white/20 dark:border-white/10">
                            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">{t('relationships.subtitle')}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('relationships.toMember')}</label>
                                    <Controller
                                        control={control}
                                        name="relativeId"
                                        render={({ field }) => (
                                            <Combobox
                                                options={allMembers.map(m => ({ value: String(m.id), label: `${m.firstName} ${m.lastName}` }))}
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder={t('common.select')}
                                            />
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('relationships.relationType')}</label>
                                    <Controller
                                        control={control}
                                        name="relationCode"
                                        render={({ field }) => (
                                            <Combobox
                                                options={relations.map(r => ({ value: r.code, label: r.label }))}
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder={t('common.select')}
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                            {relativeId && relationCode && (
                                <p className="text-xs text-indigo-600 mt-2">
                                    * {t('members.editMember')}: <strong>New Member</strong> {t('relationships.is')} <strong>{relations.find(r => r.code === relationCode)?.label}</strong> {t('relationships.of')} <strong>{allMembers.find(m => String(m.id) === relativeId)?.firstName}</strong>
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/20 dark:border-white/10 mt-4">
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

export default function MembersPage() {
    const { t } = useLanguage();
    const [search, setSearch] = useState('');
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Infinite Query for Members
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading
    } = useInfiniteQuery<MemberResponse>({
        queryKey: ['members', search],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await axios.get(`http://localhost:4000/api/v1/members?page=${pageParam}&limit=12&search=${search}`, { withCredentials: true });
            return res.data;
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.meta.page < lastPage.meta.totalPages) {
                return lastPage.meta.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1
    });

    // Intersection Observer for Infinite Scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => {
            if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
        };
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            if (!confirm(t('common.confirmDelete'))) return;
            await axios.delete(`http://localhost:4000/api/v1/members/${id}`, { withCredentials: true });
        },
        onSuccess: () => {
            // Invalidate to refetch
            queryClient.invalidateQueries({ queryKey: ['members'] });
        }
    });

    // Need queryClient for the mutation onSuccess above, but it's inside the component, so useHook.
    const queryClient = useQueryClient();

    const handleEdit = (member: Member) => {
        setEditingMember(member);
        setDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        deleteMutation.mutate(id);
    };

    const handleAdd = () => {
        setEditingMember(null);
        setDialogOpen(true);
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">{t('members.title')}</h1>
                    <p className="text-slate-500 dark:text-slate-400">{t('members.subtitle')}</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative group">
                        <button className="inline-flex items-center gap-2 px-4 py-2 glass-panel rounded-lg text-slate-700 dark:text-slate-200 hover:glass-card shadow-md hover:shadow-lg transition-all duration-300 text-sm font-medium">
                            <Download className="h-4 w-4" />
                            {t('common.download')}
                        </button>
                        <div className="absolute right-0 top-full mt-2 w-48 glass-card rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 flex flex-col p-1.5">
                            <a href="http://localhost:4000/api/v1/members/export?format=csv" target="_blank" rel="noreferrer" className="px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-white/10 rounded-lg text-left transition-all duration-200">CSV</a>
                            <a href="http://localhost:4000/api/v1/members/export?format=excel" target="_blank" rel="noreferrer" className="px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-white/10 rounded-lg text-left transition-all duration-200">Excel</a>
                            <a href="http://localhost:4000/api/v1/members/export?format=pdf" target="_blank" rel="noreferrer" className="px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-white/10 rounded-lg text-left transition-all duration-200">PDF</a>
                        </div>
                    </div>
                    <button onClick={handleAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:from-violet-700 hover:to-indigo-700 shadow-lg hover:shadow-xl glow-violet transition-all duration-300 text-sm font-semibold">
                        <Plus className="h-4 w-4" />
                        {t('members.addMember')}
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 glass-card p-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 w-full sm:max-w-md">
                <Search className="h-5 w-5 text-slate-400 ml-2" />
                <input
                    className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-sm placeholder:text-slate-400 text-slate-900 dark:text-slate-100"
                    placeholder={t('members.searchPlaceholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {isLoading ? (
                    <div className="col-span-full text-center text-slate-500 py-12">{t('common.loading')}</div>
                ) : (
                    data?.pages.map((page, i) => (
                        page.data.map((member) => (
                            <MemberDetailCard
                                key={member.id}
                                member={member}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))
                    ))
                )}
            </div>

            {/* Infinite Scroll Load More Trigger */}
            <div ref={loadMoreRef} className="h-10 w-full flex items-center justify-center p-4">
                {isFetchingNextPage && <div className="h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>}
                {!hasNextPage && !isLoading && data && <span className="text-xs text-slate-400">{t('members.noMembers')}</span>}
            </div>

            {isDialogOpen && (
                <MemberDialog
                    isOpen={isDialogOpen}
                    onClose={() => setDialogOpen(false)}
                    initialData={editingMember}
                />
            )}
        </div>
    )
}
