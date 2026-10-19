import { useState } from 'react'
import { DataTable } from '@/Components/ui/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import { useForm, usePage } from '@inertiajs/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs'
import { Button } from '@/Components/ui/button'
import { AnimatedTabsList } from '@/Components/ui/animated-tabs'
import {
  Plus,
  Loader2,
  ListFilter,
  Search,
  Pencil
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { ImportStudentsDialog } from '@/Components/import-csv'
import SupervisorAccounts, { SupervisorForm, type Supervisor } from '@/Components/Admin/SupervisorAccounts'
import { Errors, Field } from '@/Components/Admin/RecordControls'

type EditableUserRow = {
  full_name?: string;
  display_name?: string;
  email: string;
  programme_name?: string;
  intake_semester_name?: string;
  company_name?: string;
  onEdit: () => void;
};

const editColumn: ColumnDef<EditableUserRow> = {
  id: 'actions',
  header: () => <span className="sr-only">Actions</span>,
  cell: ({ row }) => (
    <div className="flex justify-end">
      <Button type="button" size="sm" variant="outline" className="gap-1.5 shadow-sm"
        aria-label={`Edit ${row.original.full_name ?? row.original.display_name ?? 'user'}`}
        onClick={row.original.onEdit}>
        <Pencil className="size-3.5" />
        Edit
      </Button>
    </div>
  ),
};

const studentColumns: ColumnDef<EditableUserRow>[] = [
  { id: 'full_name', header: 'Full Name', accessorKey: 'full_name' },
  { id: 'email', header: 'Email Address', accessorKey: 'email' },
  { id: 'programme_name', header: 'Academic Programme', accessorKey: 'programme_name' },
  { id: 'intake_semester_name', header: 'Intake Semester', accessorKey: 'intake_semester_name' },
  editColumn,
];

const repColumns: ColumnDef<EditableUserRow>[] = [
  { id: 'display_name', header: 'Focal Person', accessorKey: 'display_name' },
  { id: 'email', header: 'Email Address', accessorKey: 'email' },
  { id: 'company_name', header: 'Assigned Company', accessorKey: 'company_name' },
  editColumn,
];

const UserTabs = () => {
  const { students, companyUsers, companies, programmes, supervisors, quotas, academicSemesters } = usePage<any>().props;

  const [activeTab, setActiveTab] = useState('students');
  const [supervisorOpen, setSupervisorOpen] = useState(false);
  const [supervisorType, setSupervisorType] = useState<Supervisor['type']>('industry');
  const [studentOpen, setStudentOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter logic
  const filteredStudents = students?.filter((s: any) =>
    s.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredCompanyUsers = companyUsers?.filter((u: any) =>
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const companiesWithoutHrAccount = (companies || []).filter((company: any) =>
    !companyUsers?.some((user: any) =>
      String(user.company_id ?? user.company?.company_id) === String(company.company_id)
    )
  );

  const studentForm = useForm({
    username: '',
    full_name: '',
    email: '',
    password: '',
    programme_id: '',
    pb_student_code: '',
    intake_semester_id: '',
    role: 'Student'
  });

  const companyAccountForm = useForm({
    username: '',
    email: '',
    password: '',
    role: 'Company',
    company_id: '',
  });

  const updateForm = useForm({
    id: '',
    full_name: '',
    username: '',
    email: '',
    password: '',
    role: '',
    programme_id: '',
    pb_student_code: '',
    intake_semester_id: '',
    company_id: '',
  });

  const openEditModal = (user: any, role: 'Student' | 'Company') => {
    if (!user) return;
    const userId = user.user_id || user.id;
    const companyId = role === 'Company' ? String(user.company_id ?? user.company?.company_id ?? '') : '';
    updateForm.clearErrors();
    updateForm.setData({
      id: userId,
      full_name: role === 'Student' ? user.student?.full_name ?? '' : '',
      username: user.username || '',
      email: user.email || '',
      password: '',
      role: role,
      programme_id: role === 'Student' ? String(user.student?.programme_id ?? '') : '',
      pb_student_code: role === 'Student' ? user.student?.pb_student_code ?? '' : '',
      intake_semester_id: role === 'Student' ? String(user.student?.intake_semester_id ?? '') : '',
      company_id: companyId,
    });
    setEditModalOpen(true);
  };

  const submitUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateForm.put(route('admin.manage-users.update', updateForm.data.id), {
      preserveScroll: true,
      onSuccess: () => {
        setEditModalOpen(false);
        updateForm.reset();
      }
    });
  };

  const submitStudent = (e: React.FormEvent) => {
    e.preventDefault();
    studentForm.post(route('admin.manage-users.store'), {
      onSuccess: () => {
        setStudentOpen(false);
        studentForm.reset();
      },
      onError: (errors) => {
        console.error("Validation Errors:", errors);
      }
    });
  };

  const submitCompanyAccount = (e: React.FormEvent) => {
    e.preventDefault();
    companyAccountForm.post(route('admin.manage-users.store'), {
      preserveScroll: true,
      onSuccess: () => {
        setCompanyOpen(false);
        companyAccountForm.reset();
        companyAccountForm.clearErrors();
      },
    });
  };

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="font-sato text-3xl font-bold">Manage Users</h1>

        <div className="flex items-center gap-2">
          {activeTab === 'supervisors' && <Button size="sm" className="flex items-center gap-1.5 shadow-sm" onClick={() => setSupervisorOpen(true)}>
            <Plus className="size-3.5" />
            Add supervisor
          </Button>}
          {activeTab === 'students' && <>
            <ImportStudentsDialog programmes={programmes} academicSemesters={academicSemesters} />
            <Button size="sm" className="flex items-center gap-1.5 shadow-sm" onClick={() => setStudentOpen(true)}>
              <Plus className="size-3.5" />
              Add Student
            </Button>
          </>}
          {activeTab === 'reps' && <Button size="sm" className="flex items-center gap-1.5 shadow-sm" onClick={() => setCompanyOpen(true)} disabled={!companiesWithoutHrAccount.length} title={!companiesWithoutHrAccount.length ? 'All companies already have an HR account.' : undefined}>
            <Plus className="size-3.5" />
            Add HR account
          </Button>}
        </div>
      </div>

      <div className='w-full mt-4'>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <AnimatedTabsList
            groupId="users"
              className="max-w-full overflow-x-auto"
              activeValue={activeTab}
              setActiveValue={setActiveTab}
              tabs={[
                { value: "students", label: "Students" },
                { value: "reps", label: "Representatives" },
                { value: "supervisors", label: "Supervisors" }
              ]}
            />

            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-[250px] pl-8 text-sm rounded-full bg-muted shadow-none border-none"
              />
              <ListFilter className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>

            {/* STUDENT DIALOG */}
            <Dialog open={studentOpen} onOpenChange={setStudentOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={submitStudent}>
                  <DialogHeader>
                    <DialogTitle>Register Student</DialogTitle>
                    <DialogDescription>Create a student account and assign their academic programme and intake.</DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Student ID</Label>
                      <Input
                        placeholder="e.g., 24FTB1001"
                        className="shadow-none"
                        value={studentForm.data.pb_student_code}
                        onChange={e => studentForm.setData('pb_student_code', e.target.value)}
                        required
                      />
                      {studentForm.errors.pb_student_code && <p className="text-xs text-red-500">{studentForm.errors.pb_student_code}</p>}
                    </div>

                    {/* cek sni krg */}
                    {/* <div className="grid gap-2">
                      <Label>Full Name</Label>
                      <Input
                        className="shadow-none"
                        value={studentForm.data.full_name}
                        onChange={e => studentForm.setData('full_name', e.target.value)}
                        required
                      />
                    </div> */}
                    <div className="grid gap-2">
                      <Label>Full Name</Label>
                      <Input
                        className="shadow-none"
                        value={studentForm.data.full_name}
                        onChange={(e) => {
                          studentForm.setData('full_name', e.target.value);
                          studentForm.setData('username', e.target.value);
                        }}
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label>Institutional Email</Label>
                      <Input
                        type="email"
                        className="shadow-none"
                        value={studentForm.data.email}
                        onChange={e => studentForm.setData('email', e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label>Password</Label>
                      <Input
                        type="password"
                        className="shadow-none"
                        value={studentForm.data.password}
                        onChange={e => studentForm.setData('password', e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label>Academic Programme</Label>
                      <Select
                        value={studentForm.data.programme_id?.toString()}
                        onValueChange={(val) => studentForm.setData('programme_id', val)}
                      >
                        <SelectTrigger className="shadow-none">
                          <SelectValue placeholder="Select Programme" />
                        </SelectTrigger>
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

                    <div className="grid gap-2">
                      <Label>Intake Semester</Label>
                      <Select value={studentForm.data.intake_semester_id} onValueChange={(value) => studentForm.setData('intake_semester_id', value)}>
                        <SelectTrigger className="shadow-none"><SelectValue placeholder="Select intake semester" /></SelectTrigger>
                        <SelectContent className="max-h-[250px] overflow-y-auto">
                          {academicSemesters?.map((semester: any) => <SelectItem key={semester.id} value={String(semester.id)}>{semester.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {studentForm.errors.intake_semester_id && <p className="text-xs text-red-500">{studentForm.errors.intake_semester_id}</p>}
                    </div>
                  </div>

                  <Errors errors={studentForm.errors} />
                  <DialogFooter>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={
                        studentForm.processing ||
                        !studentForm.data.pb_student_code ||
                        !studentForm.data.username ||
                        !studentForm.data.email ||
                        !studentForm.data.password ||
                        !studentForm.data.programme_id ||
                        !studentForm.data.intake_semester_id
                      }
                    >
                      {studentForm.processing ? <Loader2 className="animate-spin size-4" /> : 'Create Student'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={companyOpen} onOpenChange={setCompanyOpen}>
              <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[480px]">
                <form onSubmit={submitCompanyAccount}>
                  <DialogHeader>
                    <DialogTitle>Register Focal Person</DialogTitle>
                    <DialogDescription>Create one HR login for an existing company.</DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="hr-username">Username</Label>
                      <Input id="hr-username" value={companyAccountForm.data.username} onChange={(event) => companyAccountForm.setData('username', event.target.value)} required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="hr-email">Email</Label>
                      <Input id="hr-email" type="email" value={companyAccountForm.data.email} onChange={(event) => companyAccountForm.setData('email', event.target.value)} required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="hr-password">Initial Password</Label>
                      <Input id="hr-password" type="password" minLength={8} autoComplete="new-password" value={companyAccountForm.data.password} onChange={(event) => companyAccountForm.setData('password', event.target.value)} required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="hr-company">Company</Label>
                      <Select value={companyAccountForm.data.company_id} onValueChange={(value) => companyAccountForm.setData('company_id', value)}>
                        <SelectTrigger id="hr-company" className="shadow-none">
                          <SelectValue placeholder="Select a company" />
                        </SelectTrigger>
                        <SelectContent>
                          {companiesWithoutHrAccount.map((company: any) => (
                            <SelectItem key={company.company_id} value={String(company.company_id)}>{company.company_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!companiesWithoutHrAccount.length && <p className="text-xs text-muted-foreground">All existing companies already have an HR account.</p>}
                    </div>
                  </div>

                  <Errors errors={companyAccountForm.errors} />
                  <DialogFooter>
                    <Button type="button" variant="outline" disabled={companyAccountForm.processing} onClick={() => setCompanyOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={companyAccountForm.processing || !companyAccountForm.data.username || !companyAccountForm.data.email || !companyAccountForm.data.password || !companyAccountForm.data.company_id}>
                      {companyAccountForm.processing ? 'Creating...' : 'Create HR Account'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

                      
<TabsContent value="students" className="mt-4">
    <div className="rounded-xl bg-white">
        {filteredStudents.length > 0 ? (
            <DataTable 
                columns={studentColumns} 
                data={filteredStudents.map((s: any) => ({
                    ...s,
                    id: s.user_id,
                    role: 'Student',
                    full_name: s.student?.full_name || 'N/A',
                    programme_name: s.student?.programme?.programme_name || 'Not Assigned',
                    intake_semester_name: s.student?.intake_semester?.name || s.student?.intake_session || 'Not Assigned',
                    onEdit: () => openEditModal(s, 'Student')
                }))} 
            />
        ) : (
            <p className="text-center py-10 text-slate-500">No students found.</p>
        )}
    </div>
</TabsContent>

<TabsContent value="reps" className="mt-4">
    <div className="rounded-xl bg-white">
        {filteredCompanyUsers.length > 0 ? (
            <DataTable 
                columns={repColumns} 
                data={filteredCompanyUsers.map((u: any) => ({
                    ...u,
                    id: u.user_id,
                    role: 'Company',
                    display_name: u.username,
                    email: u.email,
                    assigned_company_id: u.company?.company_id || null,
                    company_name: u.company?.company_name || 'Unassigned',
                    onEdit: () => openEditModal(u, 'Company'),

                }))} 
            />
        ) : (
            <p className="text-center py-10 text-slate-500">No representatives found.</p>
        )}
    </div>
</TabsContent>
<TabsContent value="supervisors" className="mt-4">
    <SupervisorAccounts
        supervisors={supervisors}
        companies={companies}
        quotas={quotas}
        searchQuery={searchQuery}
        supervisorType={supervisorType}
        onSupervisorTypeChange={setSupervisorType}
        embedded
    />
</TabsContent>
        </Tabs>

        <Dialog open={supervisorOpen} onOpenChange={setSupervisorOpen}>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle>Add Supervisor</DialogTitle>
              <DialogDescription>Create a new Academic or Industry Supervisor account.</DialogDescription>
            </DialogHeader>
            {supervisorOpen && <SupervisorForm
              initialType={supervisorType}
              companies={companies}
              quotas={quotas}
              close={() => setSupervisorOpen(false)}
            />}
          </DialogContent>
        </Dialog>

        {/* ... DIALOGS REMAIN THE SAME ... */}
        {/* EDIT USER DIALOG */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle>Edit {updateForm.data.role === 'Student' ? 'Student' : 'Representative'}</DialogTitle>
              <DialogDescription>
                {updateForm.data.role === 'Student'
                  ? 'Update this student’s account and academic programme.'
                  : 'Update this company’s existing HR login details.'}
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={submitUpdate}>
              <Field label="Account role">
                <select disabled className="h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm" value={updateForm.data.role}>
                  <option value="Student">Student</option>
                  <option value="Company">Representative</option>
                </select>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                {updateForm.data.role === 'Student' && <Field label="Full Name">
                  <Input required value={updateForm.data.full_name} onChange={(event) => updateForm.setData('full_name', event.target.value)} />
                </Field>}
                <Field label={updateForm.data.role === 'Student' ? 'Username' : 'Focal Person Name / Username'}>
                  <Input required value={updateForm.data.username} onChange={(event) => updateForm.setData('username', event.target.value)} />
                </Field>
                <Field label="Email">
                  <Input required type="email" value={updateForm.data.email} onChange={(event) => updateForm.setData('email', event.target.value)} />
                </Field>
                {updateForm.data.role === 'Student' && <Field label="Student ID">
                  <Input required value={updateForm.data.pb_student_code} onChange={(event) => updateForm.setData('pb_student_code', event.target.value)} />
                </Field>}
              </div>
              <Field label="New Password (optional)">
                <Input type="password" autoComplete="new-password" minLength={8} value={updateForm.data.password} onChange={(event) => updateForm.setData('password', event.target.value)} />
              </Field>
              {updateForm.data.role === 'Student' ? <Field label="Academic Programme">
                <select required className="h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm" value={updateForm.data.programme_id} onChange={(event) => updateForm.setData('programme_id', event.target.value)}>
                  <option value="" disabled>Select Programme</option>
                  {programmes?.map((programme: any) => <option key={programme.programme_id} value={programme.programme_id}>{programme.programme_name}</option>)}
                </select>
              </Field> : <Field label="Company">
                <select required className="h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm" value={updateForm.data.company_id} onChange={(event) => updateForm.setData('company_id', event.target.value)}>
                  <option value="" disabled>Select Company</option>
                  {companies?.filter((company: any) => !companyUsers?.some((other: any) => String(other.user_id) !== String(updateForm.data.id) && String(other.company_id ?? other.company?.company_id) === String(company.company_id))).map((company: any) => <option key={company.company_id} value={String(company.company_id)}>{company.company_name}</option>)}
                </select>
              </Field>}
              {updateForm.data.role === 'Student' && <Field label="Intake Semester">
                <select required className="h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm" value={updateForm.data.intake_semester_id} onChange={(event) => updateForm.setData('intake_semester_id', event.target.value)}>
                  <option value="" disabled>Select intake semester</option>
                  {academicSemesters?.map((semester: any) => <option key={semester.id} value={String(semester.id)}>{semester.name}</option>)}
                </select>
              </Field>}
              <Errors errors={updateForm.errors} />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={updateForm.processing}>{updateForm.processing ? 'Saving…' : 'Save changes'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>


      </div>
    </div>
  )
}

export default UserTabs;
