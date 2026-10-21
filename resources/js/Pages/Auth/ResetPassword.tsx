import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { confirmAction } from '@/lib/confirm-action';

export default function ResetPassword({
    token,
    email,
    setup = false,
}: {
    token: string;
    email: string;
    setup?: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });
    const [confirming, setConfirming] = useState(false);

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        if (processing || confirming) return;
        setConfirming(true);
        const confirmed = await confirmAction(setup ? 'Set your password and activate your student account?' : 'Reset your password? You can log in using the new password after saving.', {
            title: setup ? 'Set up account?' : 'Reset password?', confirmLabel: setup ? 'Set password' : 'Reset password', destructive: false,
        });
        setConfirming(false);
        if (!confirmed) return;
        post(route(setup ? 'student.password.store' : 'password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title={setup ? 'Set up your account' : 'Reset Password'} />

            <h1 className="mb-2 text-xl font-semibold text-slate-900">{setup ? 'Set up your student account' : 'Choose a new password'}</h1>
            <p className="mb-4 text-sm text-slate-600">Use at least 8 characters and enter your new password twice.</p>

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        required
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        required
                        minLength={8}
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        isFocused={true}
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        required
                        minLength={8}
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <PrimaryButton className="ms-4" disabled={processing || confirming}>
                        {processing ? 'Saving…' : setup ? 'Set password' : 'Reset password'}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
