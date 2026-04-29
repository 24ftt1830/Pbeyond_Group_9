import { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import pbLogo from '../../../images/PB-Secondary-Logo.png';
import InputError from '@/Components/InputError';
import DitherShaderDemoDuotone from "@/Components/dither-shader-demo-duotone";
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
        <div className="grid min-h-svh lg:grid-cols-2">
            <Head title="Log in" />

            {/* Left Column: Form */}
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <Link href="/" className="flex items-center gap-2 font-medium">
                        <img
                            src={pbLogo}
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
                                <h1 className="text-2xl font-bold font-sato">Login to your account</h1>
                                <p className="text-balance text-sm text-muted-foreground">
                                    Enter your email below to login to your account
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
                                        <>
                                            <LoaderCircleIcon className="size-4 animate-spin" />
                                        </>
                                    ) : (
                                        'Log in'
                                    )}
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