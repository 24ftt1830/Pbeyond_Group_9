import { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import InputError from '@/Components/InputError';
import DitherShaderDemoDuotone from "@/Components/dither-shader-demo-duotone";
import { LoaderCircleIcon, Building2 } from 'lucide-react';

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
        <div className="grid min-h-svh lg:grid-cols-2">
            <Head title="Log in" />

            {/* Left Column: Form */}
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <Link href="/" className="flex items-center gap-2 font-medium">
                        <img
                            src="/images/pb-secondary-logo.png"
                            alt="PBeyond Logo"
                            className="size-7 object-contain"
                        />
                        <span className="font-sato">PBeyond</span>
                    </Link>
                </div>

                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <form onSubmit={submit} className="flex flex-col gap-6">
                            <div className="flex flex-col items-center gap-2 text-center">
                                <h1 className="text-2xl font-bold font-sato">Student & Supervisor Portal</h1>
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
                                        className="shadow-none"
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
                                        className="shadow-none"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <Button type="submit" className="w-full shadow-none" disabled={processing}>
                                    {processing ? (
                                        <LoaderCircleIcon className="size-4 animate-spin" />
                                    ) : (
                                        'Log in'
                                    )}
                                </Button>

                                <div className="relative text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                                    <span className="relative z-10 bg-background px-2 text-muted-foreground">
                                        Company Partner?
                                    </span>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    asChild
                                    className="w-full shadow-none gap-2"
                                >
                                    <Link href={route('company.key-access')}>
                                        <Building2 className="size-4" />
                                        Log in as Company
                                    </Link>
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Image */}
            <div className="relative hidden bg-muted lg:block">
                <DitherShaderDemoDuotone />
            </div>
        </div>
    );
}
