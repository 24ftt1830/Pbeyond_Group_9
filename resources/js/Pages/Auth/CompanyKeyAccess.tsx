import { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import InputError from '@/Components/InputError';
import DitherShaderDemoDuotone from '@/Components/dither-shader-demo-duotone';
import { KeyRound, LoaderCircleIcon } from 'lucide-react';
import BackButton from '@/Components/BackButton';

export default function CompanyKeyAccess() {
    const { data, setData, post, processing, errors } = useForm({
        access_key: '',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(route('company.key-access'));
    };

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <Head title="Company Access Verification" />

            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-medium">
                        <img src="/images/pb-secondary-logo.png" alt="PBeyond Logo" className="size-7 object-contain" />
                        <span className="font-sato">PBeyond</span>
                    </Link>
                    <BackButton href={route('login')} className="h-8 rounded-md px-3 text-xs">Back to Login</BackButton>
                </div>

                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <form onSubmit={submit} className="flex flex-col gap-6">
                            <div className="flex flex-col items-center gap-2 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                    <KeyRound className="size-6" />
                                </div>
                                <h1 className="text-2xl font-bold font-sato">Company Access Key</h1>
                                <p className="text-balance text-sm text-muted-foreground">
                                    Enter the 6-digit key provided by your Admin to continue to company login.
                                </p>
                            </div>

                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="access_key">6-digit access key</Label>
                                    <Input
                                        id="access_key"
                                        type="password"
                                        inputMode="numeric"
                                        pattern="[0-9]{6}"
                                        maxLength={6}
                                        placeholder="••••••"
                                        value={data.access_key}
                                        onChange={(event) => setData('access_key', event.target.value.replace(/\D/g, '').slice(0, 6))}
                                        required
                                        autoComplete="off"
                                        className="text-center text-lg tracking-widest font-mono shadow-none"
                                    />
                                    <InputError message={errors.access_key} />
                                </div>

                                <Button type="submit" className="w-full shadow-none" disabled={processing || data.access_key.length !== 6}>
                                    {processing ? <LoaderCircleIcon className="size-4 animate-spin" /> : 'Continue to Company Login'}
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
