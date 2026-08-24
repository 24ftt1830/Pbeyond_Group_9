import { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import InputError from '@/Components/InputError';
import DitherShaderDemoDuotone from "@/Components/dither-shader-demo-duotone";
import { LoaderCircleIcon, Lock, ChevronLeft } from 'lucide-react';

export default function CompanyLogin({ companyName }: { companyName: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('company.login'));
    };

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <Head title="Company Login" />

            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-medium">
                        <img
                            src="/images/pb-secondary-logo.png"
                            alt="PBeyond Logo"
                            className="size-7 object-contain"
                        />
                        <span className="font-sato">PBeyond</span>
                    </Link>

                    <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
                        <Link href={route('company.key-access')}>
                            <ChevronLeft className="size-4" />
                            Change Access Key
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <form onSubmit={submit} className="flex flex-col gap-6">
                            <div className="flex flex-col items-center gap-2 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                    <Lock className="size-6" />
                                </div>
                                <h1 className="text-2xl font-bold font-sato">Company Login</h1>
                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                    {companyName}
                                </span>
                                <p className="text-balance text-sm text-muted-foreground">
                                    Enter your work email and password to access your dashboard.
                                </p>
                            </div>

                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Work Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="representative@company.com"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                        className="shadow-none"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
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
                                        'Login to Dashboard'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div className="relative hidden bg-muted lg:block">
                <DitherShaderDemoDuotone />
            </div>
        </div>
    );
}