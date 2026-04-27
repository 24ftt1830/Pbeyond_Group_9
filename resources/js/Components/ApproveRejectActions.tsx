import { Button } from "@/Components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/Components/ui/alert-dialog";
import { Check, X } from "lucide-react";

export function QuotaActions({ quota, onApprove, onReject }: { quota: any, onApprove: (id: number) => void, onReject: (id: number) => void }) {
  return (
    <div className="flex gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 h-8">
            <Check className="size-4 mr-1" /> Approve
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Quota Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this quota for {quota.job_title}? This will release the slots to students.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onApprove(quota.quota_id)} className="bg-primary hover:bg-primary/90">Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 h-8">
            <X className="size-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Quota Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this quota request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onReject(quota.quota_id)} className="bg-red-600 hover:bg-red-700">Reject</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}