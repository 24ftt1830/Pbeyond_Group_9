import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import type { PageProps } from '@/types';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';

export default function Edit() {
    const { auth } = usePage<PageProps>().props;
    const profile = useForm({ username: auth.user.username ?? '', email: auth.user.email ?? '' });
    const password = useForm({ current_password: '', password: '', password_confirmation: '' });
    const saveProfile = (event: FormEvent) => {
        event.preventDefault();
        profile.patch(route('profile.update'), { preserveScroll: true });
    };
    const savePassword = (event: FormEvent) => {
        event.preventDefault();
        password.put(route('password.update'), { preserveScroll: true, onSuccess: () => password.reset() });
    };
    return <AuthenticatedLayout>
        <Head title="Profile" />
        <main className="min-h-full bg-slate-50 px-4 py-7 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <header><h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Profile</h1><p className="mt-2 text-sm text-slate-500">Manage your account details and password.</p></header>
                <div className="grid items-start gap-6 lg:grid-cols-2">
                    <form onSubmit={saveProfile} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div><h2 className="font-semibold text-slate-900">Account details</h2><p className="mt-1 text-sm text-slate-500">Keep your login and email address up to date.</p></div>
                        <div className="space-y-2"><Label htmlFor="account-username">Username</Label><Input id="account-username" value={profile.data.username} onChange={event => profile.setData('username', event.target.value)} required />{profile.errors.username && <p className="text-sm text-red-600">{profile.errors.username}</p>}</div>
                        <div className="space-y-2"><Label htmlFor="account-email">Email</Label><Input id="account-email" type="email" value={profile.data.email} onChange={event => profile.setData('email', event.target.value)} required />{profile.errors.email && <p className="text-sm text-red-600">{profile.errors.email}</p>}</div>
                        <div className="flex items-center gap-3"><Button disabled={profile.processing}>Save details</Button>{profile.recentlySuccessful && <p className="text-sm text-emerald-700">Account updated.</p>}</div>
                    </form>
                    <form onSubmit={savePassword} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="font-semibold text-slate-900">Change password</h2>
                        {(['current_password', 'password', 'password_confirmation'] as const).map((field, index) => <div key={field} className="space-y-2"><Label htmlFor={field}>{['Current password', 'New password', 'Confirm new password'][index]}</Label><Input id={field} type="password" autoComplete={index === 0 ? 'current-password' : 'new-password'} value={password.data[field]} onChange={event => password.setData(field, event.target.value)} required />{password.errors[field] && <p className="text-sm text-red-600">{password.errors[field]}</p>}</div>)}
                        <div className="flex items-center gap-3"><Button disabled={password.processing}>Update password</Button>{password.recentlySuccessful && <p className="text-sm text-emerald-700">Password updated.</p>}</div>
                    </form>
                </div>
            </div>
        </main>
    </AuthenticatedLayout>;
}
