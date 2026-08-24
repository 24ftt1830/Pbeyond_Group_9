import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Plus,
    Search,
    AlertCircle,
    Check,
    X,
} from 'lucide-react';

import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import { Badge } from '@/Components/ui/badge';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/Components/ui/dialog";

import QuotaCard from '@/Components/QuotaCard';
import QuotaNumberInput from '@/Components/QuotaNumberInput';

export default function Quotas({ quotas = [], programmes = [] }: any) {
    const { auth } = usePage().props as any;
    const company = auth.user.company;

    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingQuota, setEditingQuota] = useState<any | null>(null);
    const [programmeDropdownOpen, setProgrammeDropdownOpen] = useState(false);
    
    // Skill Input State
    const [skillInput, setSkillInput] = useState('');

    const {
        data,
        setData,
        post,
        put,
        processing,
        reset,
        errors,
    } = useForm({
        programme_ids: [] as number[],
        total_slots: 1,
        job_title: '',
        skills: [] as string[],
        interview_required: false,
    });

    const handleAddSkill = () => {
        const trimmed = skillInput.trim();
        if (trimmed && !data.skills.includes(trimmed)) {
            setData('skills', [...data.skills, trimmed]);
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setData('skills', data.skills.filter((skill) => skill !== skillToRemove));
    };

    const handleKeyDownSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddSkill();
        }
    };

    const handleEdit = (quota: any) => {
        setEditingQuota(quota);

        const existingProgrammeIds =
            quota.programmes?.map((p: any) => Number(p.programme_id)) ??
            (quota.programme_id
                ? [Number(quota.programme_id)]
                : []);

        setData({
            programme_ids: existingProgrammeIds,
            total_slots: quota.total_slots,
            job_title: quota.job_title,
            skills: Array.isArray(quota.skills) ? quota.skills : [],
            interview_required: quota.interview_required,
        });

        setProgrammeDropdownOpen(false);
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        reset();
        setSkillInput('');
        setEditingQuota(null);
        setProgrammeDropdownOpen(false);
    };

    const handleProgrammeToggle = (programmeId: number) => {
        const currentIds = data.programme_ids ?? [];

        if (currentIds.includes(programmeId)) {
            setData(
                'programme_ids',
                currentIds.filter((id) => id !== programmeId)
            );
            return;
        }

        if (currentIds.length >= 5) {
            return;
        }

        setData(
            'programme_ids',
            [...currentIds, programmeId]
        );
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (data.programme_ids.length < 3) {
            return;
        }

        if (data.programme_ids.length > 5) {
            return;
        }

        if (editingQuota) {
            put(
                route(
                    'company.quotas.update',
                    editingQuota.quota_id
                ),
                {
                    onSuccess: () => {
                        resetForm();
                        setIsDialogOpen(false);
                    },
                }
            );
        } else {
            post(
                route('company.quotas.store'),
                {
                    onSuccess: () => {
                        resetForm();
                        setIsDialogOpen(false);
                    },
                }
            );
        }
    };

    const handleDelete = (id: number) => {
        if (
            confirm(
                'Are you sure you want to delete this quota request?'
            )
        ) {
            router.delete(
                route('company.quotas.destroy', id),
                {
                    preserveScroll: true,
                }
            );
        }
    };

    const getSchoolName = (programme: any) => {
        return (
            programme.school?.school_name ??
            programme.school_name ??
            'School not specified'
        );
    };

    const programmeSelectionValid =
        data.programme_ids.length >= 3 &&
        data.programme_ids.length <= 5;

    return (
        <div className="p-6">
            <Head title="Placement Quotas" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="font-sato text-3xl font-bold">
                        Placement Quotas
                    </h1>

                    <p className="text-muted-foreground mt-1">
                        Create and manage student placement opportunities.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Dialog
                        open={isDialogOpen}
                        onOpenChange={(open) => {
                            setIsDialogOpen(open);

                            if (!open) {
                                resetForm();
                            }
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button
                                size="sm"
                                disabled={!company}
                                className="flex items-center gap-1.5 shadow-sm"
                                onClick={() => {
                                    setEditingQuota(null);
                                    resetForm();
                                }}
                            >
                                <Plus className="size-3.5" />
                                New Request
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-[560px]">
                            <form onSubmit={submit}>
                                <DialogHeader className="mb-4">
                                    <DialogTitle>
                                        {editingQuota
                                            ? 'Edit Placement Request'
                                            : 'New Placement Request'}
                                    </DialogTitle>

                                    <DialogDescription>
                                        {editingQuota
                                            ? 'Update your placement quota request.'
                                            : 'Submit a quota request for admin review.'}
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4">

                                    {/* Job Title */}
                                    <div className="space-y-2">
                                        <Label>
                                            Job Title
                                        </Label>

                                        <Input
                                            value={data.job_title}
                                            onChange={(e) =>
                                                setData(
                                                    'job_title',
                                                    e.target.value
                                                )
                                            }
                                            className="shadow-none"
                                            placeholder="e.g. Software Developer Intern"
                                        />

                                        {errors.job_title && (
                                            <p className="text-sm text-red-500">
                                                {errors.job_title}
                                            </p>
                                        )}
                                    </div>

                                    {/* Required Skills Input */}
                                    <div className="space-y-2">
                                        <Label>
                                            Required Skills
                                        </Label>

                                        <div className="flex gap-2">
                                            <Input
                                                value={skillInput}
                                                onChange={(e) =>
                                                    setSkillInput(e.target.value)
                                                }
                                                onKeyDown={handleKeyDownSkill}
                                                className="shadow-none"
                                                placeholder="e.g. React, PHP, Figma"
                                            />
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={handleAddSkill}
                                                className="shrink-0 px-3"
                                            >
                                                <Plus className="size-4" />
                                            </Button>
                                        </div>

                                        {/* Rendered Skill Tags */}
                                        {data.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {data.skills.map((skill, index) => (
                                                    <Badge
                                                        key={index}
                                                        variant="outline"
                                                        className="flex items-center gap-1 py-1 px-2.5 text-xs font-medium"
                                                    >
                                                        {skill}
                                                        <X
                                                            className="size-3 cursor-pointer text-muted-foreground hover:text-foreground"
                                                            onClick={() => handleRemoveSkill(skill)}
                                                        />
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Eligible Programmes */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label>
                                                Eligible Programmes
                                            </Label>

                                            <span className="text-xs text-muted-foreground">
                                                Select 3–5 programmes
                                            </span>
                                        </div>

                                        <div className="relative">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full justify-between shadow-none"
                                                onClick={() =>
                                                    setProgrammeDropdownOpen(
                                                        !programmeDropdownOpen
                                                    )
                                                }
                                            >
                                                <span>
                                                    {data.programme_ids.length === 0
                                                        ? 'Select programmes'
                                                        : `${data.programme_ids.length} programmes selected`}
                                                </span>

                                                <span className="text-muted-foreground">
                                                    {programmeDropdownOpen
                                                        ? '▲'
                                                        : '▼'}
                                                </span>
                                            </Button>

                                            {programmeDropdownOpen && (
                                                <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-md border bg-background shadow-lg">

                                                    <div className="max-h-64 overflow-y-auto p-2">
                                                        {programmes.length === 0 ? (
                                                            <p className="p-3 text-sm text-muted-foreground">
                                                                No programmes available.
                                                            </p>
                                                        ) : (
                                                            programmes.map(
                                                                (programme: any) => {
                                                                    const programmeId =
                                                                        Number(
                                                                            programme.programme_id
                                                                        );

                                                                    const isSelected =
                                                                        data.programme_ids.includes(
                                                                            programmeId
                                                                        );

                                                                    const maxReached =
                                                                        data.programme_ids.length >= 5 &&
                                                                        !isSelected;

                                                                    return (
                                                                        <button
                                                                            key={
                                                                                programmeId
                                                                            }
                                                                            type="button"
                                                                            disabled={
                                                                                maxReached
                                                                            }
                                                                            onClick={() =>
                                                                                handleProgrammeToggle(
                                                                                    programmeId
                                                                                )
                                                                            }
                                                                            className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left transition ${
                                                                                isSelected
                                                                                    ? 'bg-muted'
                                                                                    : 'hover:bg-muted'
                                                                            } ${
                                                                                maxReached
                                                                                    ? 'cursor-not-allowed opacity-40'
                                                                                    : ''
                                                                            }`}
                                                                        >
                                                                            <div className="min-w-0 pr-3">
                                                                                <div className="truncate text-sm font-medium">
                                                                                    {
                                                                                        programme.programme_name
                                                                                    }
                                                                                </div>

                                                                                <div className="truncate text-xs text-muted-foreground">
                                                                                    {getSchoolName(
                                                                                        programme
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            {isSelected && (
                                                                                <Check className="size-4 shrink-0" />
                                                                            )}
                                                                        </button>
                                                                    );
                                                                }
                                                            )
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
                                                        <span>
                                                            {data.programme_ids.length}{' '}
                                                            of 5 selected
                                                        </span>

                                                        <span>
                                                            Minimum 3
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <p
                                                className={`text-xs ${
                                                    data.programme_ids.length < 3
                                                        ? 'text-amber-600'
                                                        : 'text-emerald-600'
                                                }`}
                                            >
                                                {data.programme_ids.length < 3
                                                    ? `Select ${
                                                          3 -
                                                          data.programme_ids.length
                                                      } more programme${
                                                          3 -
                                                              data.programme_ids.length ===
                                                          1
                                                              ? ''
                                                              : 's'
                                                      }.`
                                                    : 'Programme selection is valid.'}
                                            </p>

                                            <p className="text-xs font-medium">
                                                {data.programme_ids.length}/5
                                            </p>
                                        </div>

                                        {errors.programme_ids && (
                                            <p className="text-sm text-red-500">
                                                {errors.programme_ids}
                                            </p>
                                        )}
                                    </div>

                                    {/* Total Slots */}
                                    <div className="space-y-2">
                                        <Label>
                                            Total Slots
                                        </Label>

                                        <QuotaNumberInput
                                            defaultValue={
                                                data.total_slots
                                            }
                                            onChange={(v) =>
                                                setData(
                                                    'total_slots',
                                                    v
                                                )
                                            }
                                        />

                                        {errors.total_slots && (
                                            <p className="text-sm text-red-500">
                                                {errors.total_slots}
                                            </p>
                                        )}
                                    </div>

                                    {/* Interview */}
                                    <div className="flex items-center justify-between rounded-md border p-4">
                                        <div className="space-y-0.5">
                                            <Label>
                                                Requires Interview
                                            </Label>

                                            <p className="text-xs text-muted-foreground">
                                                Students must undergo screening.
                                            </p>
                                        </div>

                                        <Switch
                                            checked={
                                                data.interview_required
                                            }
                                            onCheckedChange={(v) =>
                                                setData(
                                                    'interview_required',
                                                    v
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <DialogFooter className="mt-6 sm:justify-between">
                                    {/* Remove Quota */}
                                    {editingQuota &&
                                        editingQuota.quota_status === 'Pending' && (
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                className="mr-auto"
                                                disabled={processing}
                                                onClick={() => {
                                                    if (
                                                        confirm(
                                                            'Are you sure you want to remove this quota request? This action cannot be undone.'
                                                        )
                                                    ) {
                                                        router.delete(
                                                            route(
                                                                'company.quotas.destroy',
                                                                editingQuota.quota_id
                                                            ),
                                                            {
                                                                preserveScroll: true,
                                                                onSuccess: () => {
                                                                    resetForm();
                                                                    setIsDialogOpen(false);
                                                                },
                                                            }
                                                        );
                                                    }
                                                }}
                                            >
                                                Remove Quota
                                            </Button>
                                        )}

                                    <div className="flex items-center gap-2">
                                        <DialogClose asChild>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                            >
                                                Cancel
                                            </Button>
                                        </DialogClose>

                                        <Button
                                            type="submit"
                                            disabled={
                                                processing ||
                                                !data.job_title ||
                                                !programmeSelectionValid ||
                                                !data.total_slots
                                            }
                                        >
                                            {processing
                                                ? 'Submitting...'
                                                : editingQuota
                                                ? 'Update Request'
                                                : 'Submit Request'}
                                        </Button>
                                    </div>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Warning Banner */}
            {!company && (
                <div className="flex items-center gap-3 p-4 text-sm bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
                    <AlertCircle className="size-4" />

                    <span>
                        Account is not linked to a company profile.
                    </span>
                </div>
            )}

            {/* Search */}
            <div className="relative max-w-sm mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />

                <Input
                    placeholder="Search by job title..."
                    className="h-9 w-[250px] pl-8 shadow-none text-sm rounded-full bg-muted border-none focus-visible:ring-transparent"
                    value={searchTerm}
                    onChange={(e) =>
                        setSearchTerm(e.target.value)
                    }
                />
            </div>

            {/* Quota Listing */}
            {quotas.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {quotas
                        .filter((q: any) =>
                            q.job_title
                                ?.toLowerCase()
                                .includes(
                                    searchTerm.toLowerCase()
                                )
                        )
                        .map((quota: any) => (
                            <div
                                key={quota.quota_id}
                                className="relative group py-4"
                            >
                                <QuotaCard
                                    quota={quota}
                                    isEditMode={false}
                                    onDelete={handleDelete}
                                    onEdit={handleEdit}
                                />
                            </div>
                        ))}
                </div>
            ) : (
                <div className="border-2 border-dashed rounded-xl p-12 flex flex-col items-center text-center text-muted-foreground">
                    <div className="p-3 bg-muted rounded-full mb-4">
                        <Plus className="size-6" />
                    </div>

                    <p className="font-semibold text-foreground">
                        No quotas found
                    </p>

                    <p className="text-sm max-w-xs mt-1">
                        Submit your first placement request to get started.
                    </p>
                </div>
            )}
        </div>
    );
}

Quotas.layout = (page: React.ReactNode) => (
    <AuthenticatedLayout children={page} />
);