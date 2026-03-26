import { useState } from 'react'
import { useForm, usePage } from '@inertiajs/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs'
import UserTable from '@/Components/data-table'
import { Button } from '@/Components/ui/button'
import { Plus, Building2, Loader2, UserCog, GraduationCap, ChevronDown } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/Components/ui/select"

const studentColumns = [
  { header: 'Username', key: 'username' },
  { header: 'Email Address', key: 'email' },
  { header: 'Status', key: 'role' },
];

const repColumns = [
  { header: 'Focal Person', key: 'display_name' },
  { header: 'Email Address', key: 'email' },
  { header: 'Assigned Company', key: 'company_name' },
];

const UserTabs = () => {
  const { students, companyUsers, companies, programmes } = usePage<any>().props;
  
  const [focalOpen, setFocalOpen] = useState(false);
  const [studentOpen, setStudentOpen] = useState(false);

  const focalForm = useForm({
    username: '',
    email: '',
    password: '',
    company_id: '',
    role: 'Company'
  });

  const studentForm = useForm({
    username: '',
    email: '',
    password: '',
    programme_id: '',
    role: 'Student'
  });

  const submitFocal = (e: React.FormEvent) => {
    e.preventDefault();
    focalForm.post(route('admin.manage-users.store'), {
      onSuccess: () => {
        setFocalOpen(false);
        focalForm.reset();
      }
    });
  };

  const submitStudent = (e: React.FormEvent) => {
    e.preventDefault();
    studentForm.post(route('admin.manage-users.store'), {
      onSuccess: () => {
        setStudentOpen(false);
        studentForm.reset();
      }
    });
  };

  return (
    <div className='w-full mt-4'>
      <Tabs defaultValue='students'>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="reps">Representatives</TabsTrigger>
          </TabsList>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="flex items-center gap-2 shadow-sm">
                <Plus className="size-4" /> Add User <ChevronDown className="size-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setStudentOpen(true)} className="cursor-pointer">
                <GraduationCap className="mr-2 size-4 text-slate-500" /> Student
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFocalOpen(true)} className="cursor-pointer">
                <UserCog className="mr-2 size-4 text-slate-500" /> Focal Person
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* FOCAL PERSON DIALOG */}
          <Dialog open={focalOpen} onOpenChange={setFocalOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={submitFocal}>
                <DialogHeader>
                  <DialogTitle>Register Focal Person</DialogTitle>
                  <DialogDescription>Create a company account linked to an existing company.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Username</Label>
                    <Input value={focalForm.data.username} onChange={e => focalForm.setData('username', e.target.value)} required />
                  </div>
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input type="email" value={focalForm.data.email} onChange={e => focalForm.setData('email', e.target.value)} required />
                  </div>
                  <div className="grid gap-2">
                    <Label>Password</Label>
                    <Input type="password" value={focalForm.data.password} onChange={e => focalForm.setData('password', e.target.value)} required />
                  </div>
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2 text-blue-600"><Building2 className="size-3.5" /> Assign Company</Label>
                    <Select onValueChange={(val) => focalForm.setData('company_id', val)}>
                      <SelectTrigger><SelectValue placeholder="Select Company" /></SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {companies?.map((c: any) => (
                          <SelectItem key={c.company_id} value={c.company_id.toString()}>{c.company_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={focalForm.processing} className="w-full">
                    {focalForm.processing ? <Loader2 className="animate-spin size-4" /> : 'Create Focal Person'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* STUDENT DIALOG */}
          <Dialog open={studentOpen} onOpenChange={setStudentOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={submitStudent}>
                <DialogHeader>
                  <DialogTitle>Register Student</DialogTitle>
                  <DialogDescription>Create a student account and assign their academic programme.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Full Name / Username</Label>
                    <Input value={studentForm.data.username} onChange={e => studentForm.setData('username', e.target.value)} required />
                  </div>
                  <div className="grid gap-2">
                    <Label>Institutional Email</Label>
                    <Input type="email" value={studentForm.data.email} onChange={e => studentForm.setData('email', e.target.value)} required />
                  </div>
                  <div className="grid gap-2">
                    <Label>Temporary Password</Label>
                    <Input type="password" value={studentForm.data.password} onChange={e => studentForm.setData('password', e.target.value)} required />
                  </div>
                  <div className="grid gap-2">
                    <Label>Academic Programme</Label>
                    <Select onValueChange={(val) => studentForm.setData('programme_id', val)}>
                      <SelectTrigger><SelectValue placeholder="Select Programme" /></SelectTrigger>
                      <SelectContent className="max-h-[250px] overflow-y-auto">
                        {programmes && programmes.length > 0 ? (
                          programmes.map((p: any) => (
                            <SelectItem key={p.programme_id} value={p.programme_id.toString()}>
                              {p.programme_name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-center text-muted-foreground italic">
                            No programmes found
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={studentForm.processing} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                    {studentForm.processing ? <Loader2 className="animate-spin size-4" /> : 'Create Student'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="students">
          <UserTable data={students || []} columns={studentColumns} />
        </TabsContent>

        <TabsContent value="reps">
          <UserTable
            data={companyUsers?.map((u: any) => ({
              id: u.user_id,
              display_name: u.username,
              email: u.email,
              company_name: u.company?.company_name || 'Unassigned'
            })) || []}
            columns={repColumns}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default UserTabs;