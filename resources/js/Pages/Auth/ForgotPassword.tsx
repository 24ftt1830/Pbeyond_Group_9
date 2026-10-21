import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <h1 className="mb-2 text-xl font-semibold text-slate-900">Forgot password?</h1>
            <div className="mb-4 text-sm text-slate-600">
                Enter your account email to receive a link to choose a new password.
                The link expires after 60 minutes.
            </div>

            {status && (
                <div role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <InputLabel htmlFor="email" value="Account email" />
                <TextInput
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    name="email"
                    value={data.email}
                    className="mt-1 block w-full"
                    isFocused={true}
                    onChange={(e) => setData('email', e.target.value)}
                />

                <InputError message={errors.email} className="mt-2" />

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <Link href={route('login')} className="text-sm text-primary hover:underline">Back to login</Link>
                    <PrimaryButton disabled={processing}>
                        {processing ? 'Sending…' : 'Send reset link'}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
