import { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import InputError from '@/Components/InputError';
import DitherShaderDemoDuotone from "@/Components/dither-shader-demo-duotone";
import { LoaderCircleIcon, KeyRound, ChevronLeft } from 'lucide-react';

export default function CompanyKeyAccess() {
    const { data, setData, post, processing, errors } = useForm({
        access_key: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('company.key-access'));
    };

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <Head title="Company Access Verification" />

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
                        <Link href={route('login')}>
                            <ChevronLeft className="size-4" />
                            Back to Standard Login
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <form onSubmit={submit} className="flex flex-col gap-6">
                            <div className="flex flex-col items-center gap-2 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                    <KeyRound className="size-6" />
                                </div>
                                <h1 className="text-2xl font-bold font-sato">Company Access Code</h1>
                                <p className="text-balance text-sm text-muted-foreground">
                                    Enter the 6-digit access key assigned by the Admin to proceed with company account setup.
                                </p>
                            </div>

                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="access_key" className="text-center font-semibold">
                                        6-Digit Key
                                    </Label>
                                    <Input
                                        id="access_key"
                                        type="password"
                                        maxLength={6}
                                        placeholder="••••••"
                                        value={data.access_key}
                                        onChange={(e) => setData('access_key', e.target.value.trim())}
                                        required
                                        autoComplete="off"
                                        className="shadow-none text-center text-lg tracking-widest font-mono"
                                    />
                                    <InputError message={errors.access_key} />
                                </div>

                                <Button type="submit" className="w-full shadow-none" disabled={processing}>
                                    {processing ? (
                                        <LoaderCircleIcon className="size-4 animate-spin" />
                                    ) : (
                                        'Verify Key & Continue'
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