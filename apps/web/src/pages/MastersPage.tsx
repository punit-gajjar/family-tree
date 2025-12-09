import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, Pencil, Trash2, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Types
interface RelationMaster {
    id: number;
    code: string;
    label: string;
    isBidirectional: boolean;
    isSpousal: boolean;
    isParental: boolean;
    inverseCode?: string | null;
}

const MasterDialog = ({
    isOpen,
    onClose,
    initialData
}: {
    isOpen: boolean;
    onClose: () => void;
    initialData?: RelationMaster | null
}) => {
    const queryClient = useQueryClient();
    const isEdit = !!initialData;

    const schema = z.object({
        code: z.string().min(1, "Code is required").transform(v => v.toUpperCase()),
        label: z.string().min(1, "Label is required"),
        isBidirectional: z.boolean().default(false),
        isSpousal: z.boolean().default(false),
        isParental: z.boolean().default(false),
        inverseCode: z.string().optional().nullable().transform(v => v ? v.toUpperCase() : null),
    });

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: initialData ? {
            ...initialData,
            inverseCode: initialData.inverseCode || ''
        } : {
            code: '',
            label: '',
            isBidirectional: false,
            isSpousal: false,
            isParental: false,
            inverseCode: ''
        }
    });

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            if (isEdit) {
                return axios.patch(`http://localhost:4000/api/v1/relations/masters/${initialData.id}`, data, { withCredentials: true });
            }
            return axios.post('http://localhost:4000/api/v1/relations/masters', data, { withCredentials: true });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['relation-masters'] });
            onClose();
            reset();
        }
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold mb-4">{isEdit ? 'Edit Relation Type' : 'Add New Relation Type'}</h2>

                <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Code (e.g. FATHER)</label>
                            <input {...register("code")} className="w-full h-9 rounded-md border border-slate-300 bg-transparent px-3 text-sm focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 uppercase" placeholder="FATHER" />
                            {errors.code && <span className="text-xs text-red-500">{errors.code.message as string}</span>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Label (e.g. Father)</label>
                            <input {...register("label")} className="w-full h-9 rounded-md border border-slate-300 bg-transparent px-3 text-sm focus:ring-1 focus:ring-indigo-500 dark:border-slate-700" placeholder="Father" />
                            {errors.label && <span className="text-xs text-red-500">{errors.label.message as string}</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center gap-2 border p-3 rounded-md cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                            <input type="checkbox" {...register("isBidirectional")} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                            <span className="text-sm">Bidirectional?</span>
                        </label>
                        <label className="flex items-center gap-2 border p-3 rounded-md cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                            <input type="checkbox" {...register("isSpousal")} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                            <span className="text-sm">Is Spousal?</span>
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center gap-2 border p-3 rounded-md cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                            <input type="checkbox" {...register("isParental")} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                            <span className="text-sm">Is Parental?</span>
                        </label>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Inverse Code</label>
                            <input {...register("inverseCode")} className="w-full h-9 rounded-md border border-slate-300 bg-transparent px-3 text-sm focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 uppercase" placeholder="CHILD" />
                            <p className="text-[10px] text-slate-500">Master code for the reverse relationship</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md dark:text-slate-300 dark:hover:bg-slate-800">Cancel</button>
                        <button type="submit" disabled={isSubmitting || mutation.isPending} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50">
                            {mutation.isPending ? 'Saving...' : 'Save Master'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
};

export default function MastersPage() {
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [editingMaster, setEditingMaster] = useState<RelationMaster | null>(null);

    const { data: masters, isLoading, refetch } = useQuery<RelationMaster[]>({
        queryKey: ['relation-masters'],
        queryFn: async () => {
            const res = await axios.get('http://localhost:4000/api/v1/relations/masters', { withCredentials: true });
            return res.data;
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            if (!confirm("Are you sure you want to delete this master? It might break existing relationships.")) return;
            await axios.delete(`http://localhost:4000/api/v1/relations/masters/${id}`, { withCredentials: true });
        },
        onSuccess: () => refetch()
    });

    const handleEdit = (master: RelationMaster) => {
        setEditingMaster(master);
        setDialogOpen(true);
    };

    const handleAdd = () => {
        setEditingMaster(null);
        setDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Relation Masters</h1>
                    <p className="text-slate-500">Configure relationship types and rules</p>
                </div>
                <button onClick={handleAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-colors text-sm font-medium">
                    <Plus className="h-4 w-4" />
                    Add Type
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Code</th>
                            <th className="px-6 py-4">Label</th>
                            <th className="px-6 py-4 text-center">Bidirectional</th>
                            <th className="px-6 py-4 text-center">Spousal</th>
                            <th className="px-6 py-4 text-center">Parental</th>
                            <th className="px-6 py-4">Inverse Code</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {isLoading ? (
                            <tr><td colSpan={7} className="text-center py-8">Loading...</td></tr>
                        ) : masters?.map(master => (
                            <tr key={master.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                                <td className="px-6 py-4 font-medium">{master.code}</td>
                                <td className="px-6 py-4">{master.label}</td>
                                <td className="px-6 py-4 text-center">
                                    {master.isBidirectional ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : <span className="text-slate-300">-</span>}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {master.isSpousal ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : <span className="text-slate-300">-</span>}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {master.isParental ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : <span className="text-slate-300">-</span>}
                                </td>
                                <td className="px-6 py-4 text-slate-500">{master.inverseCode || '-'}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => handleEdit(master)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-500 hover:text-indigo-600">
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => deleteMutation.mutate(master.id)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-500 hover:text-red-600">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isDialogOpen && (
                <MasterDialog
                    isOpen={isDialogOpen}
                    onClose={() => setDialogOpen(false)}
                    initialData={editingMaster}
                />
            )}
        </div>
    );
}
