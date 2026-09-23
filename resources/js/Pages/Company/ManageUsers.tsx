import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Loader2, Users } from 'lucide-react';

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';

interface IndustrySupervisor {
    supervisor_id: number;
    full_name: string;
    email: string;
    phone?: string;
    position?: string;
    user?: {
        user_id: number;
        username: string;
        email: string;
    };
}

interface Props {
    industrySupervisors: IndustrySupervisor[];
}

export default function ManageUsers({
    industrySupervisors = [],
}: Props) {
    const [open, setOpen] = useState(false);

    const form = useForm({
        username: '',
        email: '',
        password: '',
        full_name: '',
        phone: '',
        position: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        form.post(route('company.manage-users.store'), {
            onSuccess: () => {
                setOpen(false);
                form.reset();
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Manage Users" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="font-sato text-3xl font-bold">
                            Manage Users
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage Industry Supervisors for your company.
                        </p>
                    </div>

                    <Button
                        size="sm"
                        onClick={() => setOpen(true)}
                        className="flex items-center gap-1.5"
                    >
                        <Plus className="size-4" />
                        Add User
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {industrySupervisors.length > 0 ? (
                        industrySupervisors.map((supervisor) => (
                            <Card
                                key={supervisor.supervisor_id}
                                className="shadow-none"
                            >
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Users className="size-5 text-slate-600" />

                                        <CardTitle>
                                            {supervisor.full_name}
                                        </CardTitle>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-2 text-sm text-muted-foreground">
                                    <p>
                                        <span className="font-medium text-foreground">
                                            Username:
                                        </span>{' '}
                                        {supervisor.user?.username ?? 'N/A'}
                                    </p>

                                    <p>
                                        <span className="font-medium text-foreground">
                                            Email:
                                        </span>{' '}
                                        {supervisor.email}
                                    </p>

                                    <p>
                                        <span className="font-medium text-foreground">
                                            Position:
                                        </span>{' '}
                                        {supervisor.position ?? 'Not provided'}
                                    </p>

                                    <p>
                                        <span className="font-medium text-foreground">
                                            Phone:
                                        </span>{' '}
                                        {supervisor.phone ?? 'Not provided'}
                                    </p>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full rounded-xl border-2 border-dashed p-10 text-center text-muted-foreground">
                            <Users className="mx-auto mb-3 size-8 text-slate-400" />

                            <p className="font-medium">
                                No Industry Supervisors found.
                            </p>

                            <p className="mt-1 text-sm">
                                Add an Industry Supervisor to get started.
                            </p>
                        </div>
                    )}
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={submit}>
                            <DialogHeader>
                                <DialogTitle>
                                    Add Industry Supervisor
                                </DialogTitle>

                                <DialogDescription>
                                    Create a new user account for your company.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label>Full Name</Label>

                                    <Input
                                        value={form.data.full_name}
                                        onChange={(e) =>
                                            form.setData(
                                                'full_name',
                                                e.target.value
                                            )
                                        }
                                        required
                                    />

                                    {form.errors.full_name && (
                                        <p className="text-xs text-red-500">
                                            {form.errors.full_name}
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label>Username</Label>

                                    <Input
                                        value={form.data.username}
                                        onChange={(e) =>
                                            form.setData(
                                                'username',
                                                e.target.value
                                            )
                                        }
                                        required
                                    />

                                    {form.errors.username && (
                                        <p className="text-xs text-red-500">
                                            {form.errors.username}
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label>Email</Label>

                                    <Input
                                        type="email"
                                        value={form.data.email}
                                        onChange={(e) =>
                                            form.setData(
                                                'email',
                                                e.target.value
                                            )
                                        }
                                        required
                                    />

                                    {form.errors.email && (
                                        <p className="text-xs text-red-500">
                                            {form.errors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label>Password</Label>

                                    <Input
                                        type="password"
                                        value={form.data.password}
                                        onChange={(e) =>
                                            form.setData(
                                                'password',
                                                e.target.value
                                            )
                                        }
                                        required
                                    />

                                    {form.errors.password && (
                                        <p className="text-xs text-red-500">
                                            {form.errors.password}
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label>Phone</Label>

                                    <Input
                                        value={form.data.phone}
                                        onChange={(e) =>
                                            form.setData(
                                                'phone',
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label>Position</Label>

                                    <Input
                                        value={form.data.position}
                                        onChange={(e) =>
                                            form.setData(
                                                'position',
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={
                                        form.processing ||
                                        !form.data.full_name ||
                                        !form.data.username ||
                                        !form.data.email ||
                                        !form.data.password
                                    }
                                >
                                    {form.processing ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        'Create User'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
}