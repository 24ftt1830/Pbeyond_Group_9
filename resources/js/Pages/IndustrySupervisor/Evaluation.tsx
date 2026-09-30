import { useState, FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeft, ClipboardCheck, UserRound } from 'lucide-react';

interface Student {
    student_id: number;
    pb_student_code?: string;
    full_name: string;
}

interface EvaluationRecord {
    attendance_punctuality: number;
    work_quality: number;
    technical_skills: number;
    communication_skills: number;
    teamwork: number;
    initiative: number;
    professionalism: number;
    strengths?: string;
    areas_for_improvement?: string;
    comments?: string;
    recommendation: string;
}

interface Props {
    student: Student;
    evaluation: EvaluationRecord | null;
}

const CRITERIA: { key: keyof EvaluationRecord; label: string; helper: string }[] = [
    {
        key: 'attendance_punctuality',
        label: 'Attendance & Punctuality',
        helper: 'Consistency in attendance and timeliness',
    },
    {
        key: 'work_quality',
        label: 'Quality of Work',
        helper: 'Accuracy, thoroughness and reliability of output',
    },
    {
        key: 'technical_skills',
        label: 'Technical Skills',
        helper: 'Application of relevant technical knowledge',
    },
    {
        key: 'communication_skills',
        label: 'Communication Skills',
        helper: 'Clarity when speaking, writing and listening',
    },
    {
        key: 'teamwork',
        label: 'Teamwork',
        helper: 'Collaboration and cooperation with colleagues',
    },
    {
        key: 'initiative',
        label: 'Initiative',
        helper: 'Proactiveness and willingness to take on tasks',
    },
    {
        key: 'professionalism',
        label: 'Professionalism',
        helper: 'Conduct, attitude and workplace etiquette',
    },
];

const RECOMMENDATIONS = [
    'Highly Recommended',
    'Recommended',
    'Recommended with Reservations',
    'Not Recommended',
];

export default function Evaluation({ student, evaluation }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        attendance_punctuality: evaluation?.attendance_punctuality ?? 0,
        work_quality: evaluation?.work_quality ?? 0,
        technical_skills: evaluation?.technical_skills ?? 0,
        communication_skills: evaluation?.communication_skills ?? 0,
        teamwork: evaluation?.teamwork ?? 0,
        initiative: evaluation?.initiative ?? 0,
        professionalism: evaluation?.professionalism ?? 0,
        strengths: evaluation?.strengths ?? '',
        areas_for_improvement: evaluation?.areas_for_improvement ?? '',
        comments: evaluation?.comments ?? '',
        recommendation: evaluation?.recommendation ?? '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();

        post(route('industry-supervisor.student.evaluate.store', student.student_id));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Evaluate ${student.full_name}`} />

            <div className="min-h-screen bg-slate-50">
                <header className="border-b border-slate-200 bg-white">
                    <div className="mx-auto max-w-4xl px-6 py-6">
                        <Link
                            href={route('industry-supervisor.student.show', student.student_id)}
                            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
                        >
                            <ArrowLeft size={16} />
                            Back to Student Details
                        </Link>

                        <div className="flex items-center gap-5">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                <ClipboardCheck size={30} />
                            </div>

                            <div>
                                <p className="text-sm font-medium text-blue-600">
                                    Industry Supervisor Portal
                                </p>

                                <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                                    {evaluation ? 'Update Evaluation' : 'Evaluate'}: {student.full_name}
                                </h1>

                                <p className="mt-1 text-sm text-slate-500">
                                    {student.pb_student_code}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-4xl px-6 py-8 pb-16">
                    <form onSubmit={submit} className="space-y-6">
                        {/* Rubric */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-5 flex items-center gap-2">
                                <UserRound size={20} className="text-blue-600" />
                                <h2 className="text-lg font-bold text-slate-900">
                                    Performance Rubric
                                </h2>
                            </div>

                            <p className="mb-6 text-sm text-slate-500">
                                Rate each criterion from 1 (Poor) to 5 (Excellent).
                            </p>

                            <div className="space-y-6">
                                {CRITERIA.map((criterion) => (
                                    <RatingRow
                                        key={criterion.key}
                                        label={criterion.label}
                                        helper={criterion.helper}
                                        value={data[criterion.key] as number}
                                        onChange={(v) => setData(criterion.key, v)}
                                        error={errors[criterion.key]}
                                    />
                                ))}
                            </div>
                        </section>

                        {/* Written feedback */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-5 text-lg font-bold text-slate-900">
                                Written Feedback
                            </h2>

                            <div className="space-y-5">
                                <TextArea
                                    label="Strengths"
                                    value={data.strengths}
                                    onChange={(v) => setData('strengths', v)}
                                    error={errors.strengths}
                                    placeholder="What did the student do well during the placement?"
                                />

                                <TextArea
                                    label="Areas for Improvement"
                                    value={data.areas_for_improvement}
                                    onChange={(v) => setData('areas_for_improvement', v)}
                                    error={errors.areas_for_improvement}
                                    placeholder="What could the student work on going forward?"
                                />

                                <TextArea
                                    label="Additional Comments"
                                    value={data.comments}
                                    onChange={(v) => setData('comments', v)}
                                    error={errors.comments}
                                    placeholder="Any other remarks about the student's placement"
                                />
                            </div>
                        </section>

                        {/* Recommendation */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-bold text-slate-900">
                                Overall Recommendation
                            </h2>

                            <div className="grid gap-3 sm:grid-cols-2">
                                {RECOMMENDATIONS.map((option) => (
                                    <label
                                        key={option}
                                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                                            data.recommendation === option
                                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="recommendation"
                                            value={option}
                                            checked={data.recommendation === option}
                                            onChange={() => setData('recommendation', option)}
                                            className="h-4 w-4 text-blue-600"
                                        />
                                        {option}
                                    </label>
                                ))}
                            </div>

                            {errors.recommendation && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.recommendation}
                                </p>
                            )}
                        </section>

                        <div className="flex justify-end gap-3">
                            <Link
                                href={route('industry-supervisor.student.show', student.student_id)}
                                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                            >
                                {processing
                                    ? 'Submitting...'
                                    : evaluation
                                    ? 'Update Evaluation'
                                    : 'Submit Evaluation'}
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}

function RatingRow({
    label,
    helper,
    value,
    onChange,
    error,
}: {
    label: string;
    helper: string;
    value: number;
    onChange: (v: number) => void;
    error?: string;
}) {
    return (
        <div>
            <div className="mb-2 flex items-baseline justify-between">
                <p className="text-sm font-semibold text-slate-900">{label}</p>
                <p className="text-xs text-slate-400">{helper}</p>
            </div>

            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((score) => (
                    <button
                        key={score}
                        type="button"
                        onClick={() => onChange(score)}
                        className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-semibold transition ${
                            value === score
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-slate-200 text-slate-500 hover:border-blue-300'
                        }`}
                    >
                        {score}
                    </button>
                ))}
            </div>

            {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
        </div>
    );
}

function TextArea({
    label,
    value,
    onChange,
    error,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    error?: string;
    placeholder?: string;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-900">
                {label}
            </label>

            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
        </div>
    );
}
