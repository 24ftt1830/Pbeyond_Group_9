import { useState } from 'react'
import { Switch } from "@/Components/ui/switch";
import { useForm, usePage } from '@inertiajs/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs'
import UserTable from '@/Components/data-table'
import { Button } from '@/Components/ui/button'
import {
  Plus,
  Building2,
  Loader2,
  UserCog,
  GraduationCap,
  ChevronDown,
  Link
} from 'lucide-react'
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
  { header: 'Academic Programme', key: 'programme_name' },
  { header: '', key: 'actions' },
];

const repColumns = [
  { header: 'Focal Person', key: 'display_name' },
  { header: 'Email Address', key: 'email' },
  { header: 'Assigned Company', key: 'company_name' },
  { header: '', key: 'actions' },
];

const UserTabs = () => {
  const { students, companyUsers, companies, programmes } = usePage<any>().props;

  const [focalOpen, setFocalOpen] = useState(false);
  const [studentOpen, setStudentOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

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

  const updateForm = useForm({
    id: '',
    username: '',
    email: '',
    role: '',
    programme_id: '',
    interview_required: false,
  });

  const assignForm = useForm({
    id: '',
    company_id: '',
  });

  const openEditModal = (user: any, role: 'Student' | 'Company') => {
    if (!user) return;

    const userId = user.user_id || user.id;

    updateForm.clearErrors();
    updateForm.setData({
      id: userId,
      username: user.username || '',
      email: user.email || '',
      role: role,
      programme_id: role === 'Student' ? user.student?.programme_id?.toString() : '',
      interview_required: role === 'Student' ? !!user.student?.interview_required : false,
    });
    setEditModalOpen(true);
  };

  const openAssignModal = (user: any) => {
    assignForm.setData({
      id: user.user_id,
      company_id: '',
    });
    setAssignModalOpen(true);
  };

  const submitUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateForm.put(route('admin.manage-users.update', updateForm.data.id), {
      onSuccess: () => {
        setEditModalOpen(false);
        updateForm.reset();
      }
    });
  };

  const submitAssign = (e: React.FormEvent) => {
    e.preventDefault();
    assignForm.put(route('admin.manage-users.update', assignForm.data.id), {
      onSuccess: () => {
        setAssignModalOpen(false);
        assignForm.reset();
      }
    });
  };

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
                    <Input
                      value={focalForm.data.username}
                      onChange={e => focalForm.setData('username', e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={focalForm.data.email}
                      onChange={e => focalForm.setData('email', e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={focalForm.data.password}
                      onChange={e => focalForm.setData('password', e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2 text-blue-600">
                      <Building2 className="size-3.5" /> Assign Company (Optional)
                    </Label>
                    <Select
                      disabled={!companies || companies.length === 0}
                      onValueChange={(val) => focalForm.setData('company_id', val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={(!companies || companies.length === 0) ? "No Companies Registered" : "Select Company"} />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {companies && companies.length > 0 ? (
                          companies.map((c: any) => (
                            <SelectItem key={c.company_id} value={c.company_id.toString()}>
                              {c.company_name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-6 px-2 text-center text-slate-500">
                            <p className="text-xs font-bold italic">No available companies</p>
                            <p className="text-[10px] opacity-70 mt-1">You can skip this and assign a company later.</p>
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={
                      focalForm.processing ||
                      !focalForm.data.username ||
                      !focalForm.data.email ||
                      !focalForm.data.password
                    }
                    className="w-full"
                  >
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
          <UserTable
            data={students?.map((s: any) => ({
              ...s,
              id: s.user_id,
              role: 'Student',
              programme_name: s.student?.programme?.programme_name || 'Not Assigned',
              onEdit: () => openEditModal(s, 'Student')
            })) || []}
            columns={studentColumns} />
        </TabsContent>

        <TabsContent value="reps">
          <UserTable
            data={companyUsers?.map((u: any) => ({
              ...u,
              id: u.user_id,
              role: 'Company',
              display_name: u.username,
              email: u.email,
              assigned_company_id: u.company?.company_id || null,
              company_name: u.company?.company_name || 'Unassigned',
              onEdit: () => openEditModal(u, 'Company'),
              onAssign: () => openAssignModal(u),

              customActions: u.company?.company_name ? null : (
                <DropdownMenuItem onClick={() => openAssignModal(u)} className="text-blue-600 focus:text-blue-700">
                  <Link className="mr-2 size-4" /> Assign Company
                </DropdownMenuItem>
              )
            })) || []}
            columns={repColumns}
          />
        </TabsContent>
      </Tabs>

      {/* EDIT USER DIALOG (Shared) */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
          <form onSubmit={submitUpdate} className="flex flex-col max-h-[90vh]">

            <div className="bg-slate-900 p-8 text-white shrink-0">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">
                Account Management
              </h2>
              <DialogTitle className="text-2xl font-black text-white">
                Edit {updateForm.data.role === 'Student' ? 'Student' : 'Representative'}
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs text-slate-400">
                Update credentials and permissions.
              </DialogDescription>
            </div>

            <div className="px-8 py-6 space-y-5 overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500">
                  {updateForm.data.role === 'Student' ? 'Full Name' : 'Focal Person Name'}
                </Label>
                <Input
                  value={updateForm.data.username}
                  onChange={e => updateForm.setData('username', e.target.value)}
                  className="h-11"
                />
                {updateForm.errors.username && <p className="text-xs text-red-500">{updateForm.errors.username}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500">Email Address</Label>
                <Input
                  type="email"
                  value={updateForm.data.email}
                  onChange={e => updateForm.setData('email', e.target.value)}
                  className="h-11"
                />
                {updateForm.errors.email && <p className="text-xs text-red-500">{updateForm.errors.email}</p>}
              </div>

              {updateForm.data.role === 'Student' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Academic Programme</Label>
                    <Select
                      value={updateForm.data.programme_id}
                      onValueChange={(val) => updateForm.setData('programme_id', val)}
                    >
                      <SelectTrigger className="h-11"><SelectValue placeholder="Select Programme" /></SelectTrigger>
                      <SelectContent>
                        {programmes?.map((p: any) => (
                          <SelectItem key={p.programme_id} value={p.programme_id.toString()}>
                            {p.programme_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-xl bg-slate-50">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-bold text-slate-700">Interview Required</Label>
                      <p className="text-[11px] text-slate-500">Mark if student needs screening.</p>
                    </div>
                    <Switch
                      checked={updateForm.data.interview_required}
                      onCheckedChange={(val) => updateForm.setData('interview_required', val)}
                    />
                  </div>
                </>
              )}
            </div>

            <DialogFooter className="p-6 border-t bg-slate-50 shrink-0">
              <Button type="submit" disabled={updateForm.processing} className="w-full bg-slate-900 font-bold uppercase text-xs tracking-widest h-11">
                {updateForm.processing ? 'Updating...' : 'Update User Account'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Company Dialog */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <form onSubmit={submitAssign}>
            <DialogHeader>
              <DialogTitle>Assign Company</DialogTitle>
              <DialogDescription>
                Link this focal person to a registered company profile.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500">Target Company</Label>
                <Select
                  onValueChange={(val) => assignForm.setData('company_id', val)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select a company..." />
                  </SelectTrigger>
                  <SelectContent>
                    {companies?.map((c: any) => (
                      <SelectItem key={c.company_id} value={c.company_id.toString()}>
                        {c.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {assignForm.errors.company_id && (
                  <p className="text-xs text-red-500">{assignForm.errors.company_id}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={assignForm.processing || !assignForm.data.company_id}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {assignForm.processing ? <Loader2 className="animate-spin size-4" /> : 'Confirm Assignment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UserTabs;