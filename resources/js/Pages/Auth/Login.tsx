import { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import InputError from '@/Components/InputError';
import { LoaderCircleIcon } from 'lucide-react';

export default function Login({ status, canResetPassword }: { status?: string; canResetPassword: boolean }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <main className="flex min-h-svh items-center justify-center bg-background px-6 py-10 font-sans">
            <Head title="Log in" />

            <div className="w-full max-w-xs">
                <Link href="/" className="mx-auto mb-8 flex w-fit flex-col items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-4">
                    <img
                        src="/politeknik/pb-logo-black.png"
                        alt="Politeknik Brunei"
                        className="h-20 w-40 object-contain"
                    />
                    <span className="text-lg font-semibold text-primary">PBeyond</span>
                </Link>
                <form onSubmit={submit} className="flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <h1 className="text-2xl font-semibold font-sans">Log in to PBeyond</h1>
                        <p className="text-balance text-sm text-muted-foreground">
                            Enter your credentials below to log in
                        </p>
                    </div>

                    {status && <div className="text-sm font-medium text-green-600">{status}</div>}

                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                className=""
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                {canResetPassword && (
                                    <Link href={route('password.request')} className="text-sm hover:underline hover:underline-offset-4 hover:text-primary">
                                        Forgot your password?
                                    </Link>
                                )}
                            </div>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                required
                                className=""
                            />
                            <InputError message={errors.password} />
                        </div>

                        <Button type="submit" className="w-full " disabled={processing}>
                            {processing ? (
                                <LoaderCircleIcon className="size-4 animate-spin" />
                            ) : (
                                'Log in'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </main>
    );
}
