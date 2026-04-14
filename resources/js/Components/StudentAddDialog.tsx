// This file is to be deleted

import { useState } from 'react'
import { useForm, usePage } from '@inertiajs/react'
import { Button } from '@/Components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/Components/ui/dialog"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/Components/ui/select"

export function StudentAddDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        matrix_id: '',
        programme_id: '',
        cgpa: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.users.students.store'), {
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none rounded-2xl shadow-2xl">
                <form onSubmit={submit}>
                    <div className="bg-emerald-600 p-8 text-white">
                        <DialogTitle className="text-2xl font-black">Register Student</DialogTitle>
                        <DialogDescription className="text-emerald-100">
                            Create a new student account for placement eligibility.
                        </DialogDescription>
                    </div>

                    <div className="p-8 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-[10px] font-bold uppercase text-slate-500">Full Name</Label>
                                <Input value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Ahmad..." />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] font-bold uppercase text-slate-500">Matrix ID</Label>
                                <Input value={data.matrix_id} onChange={e => setData('matrix_id', e.target.value)} placeholder="22BT..." />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase text-slate-500">Institutional Email</Label>
                            <Input type="email" value={data.email} onChange={e => setData('email', e.target.value)} placeholder="student@utb.edu.bn" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-[10px] font-bold uppercase text-slate-500">Programme</Label>
                                <Select onValueChange={val => setData('programme_id', val)}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                        {/* Map your programmes prop here */}
                                        <SelectItem value="1">Web Tech</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] font-bold uppercase text-slate-500">Current CGPA</Label>
                                <Input type="number" step="0.01" value={data.cgpa} onChange={e => setData('cgpa', e.target.value)} placeholder="3.50" />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-6 bg-slate-50 border-t">
                        <Button type="submit" disabled={processing} className="w-full bg-slate-900">
                            {processing ? "Registering..." : "Create Student Account"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}