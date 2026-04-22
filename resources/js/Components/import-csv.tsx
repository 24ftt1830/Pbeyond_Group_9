import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogTrigger } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { FileUp } from 'lucide-react';
import { toast } from "sonner";
import { ImportModal } from '@/Components/import-modal-initial'; 

interface Programme {
    programme_id: number | string;
    programme_name: string;
}

export function ImportStudentsDialog({ programmes }: { programmes: Programme[] }) {
    const [open, setOpen] = useState(false);
    const form = useForm({ file: null as File | null });

    const handleImport = () => {
        form.post(route('admin.students.import'), {
            onSuccess: () => {
                setOpen(false);
                form.reset();
                toast.success("Students imported successfully!");
            },
            onError: () => toast.error("Import failed."),
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 shadow-sm">
                    <FileUp className="size-4" />
                    Import CSV
                </Button>
            </DialogTrigger>
            <ImportModal 
                form={form} 
                onComplete={handleImport} 
                programmes={programmes}
            />
        </Dialog>
    );
}