import { useState } from 'react'
import { Switch } from "@/Components/ui/switch";
import { useForm, usePage } from '@inertiajs/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs'
import UserTable from '@/Components/data-table'
import { Button } from '@/Components/ui/button'
import { AnimatedTabsList } from '@/Components/ui/animated-tabs'
import {
  Plus,
  Building2,
  Loader2,
  UserCog,
  GraduationCap,
  ListFilter,
  Link,
  Import,
  Search
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
import { ImportStudentsDialog } from '@/Components/import-csv'

const studentColumns = [
  { header: 'Full Name', key: 'full_name' },
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

  const [activeTab, setActiveTab] = useState('students');
  const [focalOpen, setFocalOpen] = useState(false);
  const [studentOpen, setStudentOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
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

  const focalForm = useForm({
    username: '',
    email: '',
    password: '',
    company_id: '',
    role: 'Company'
  });

  const studentForm = useForm({
    username: '',
    full_name: '',
    email: '',
    password: '',
    programme_id: '',
    pb_student_code: '',
    role: 'Student'
  });

  const updateForm = useForm({
    id: '',
    username: '',
    email: '',
    role: '',
    programme_id: '',
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
      },
      onError: (errors) => {
        console.error(errors);
        alert("Save Failed: " + Object.values(errors).join(", "));
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
      },
      onError: (errors) => {
        console.error("Validation Errors:", errors);
      }
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-sato text-3xl font-bold">Manage Users</h1>

        <div className="flex items-center gap-2">
          <ImportStudentsDialog programmes={programmes} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="flex items-center gap-1.5 shadow-sm">
                <Plus className="size-3.5" />
                Add User
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-fit min-w-[140px]">
              <DropdownMenuItem onClick={() => setStudentOpen(true)} className="cursor-pointer">
                <GraduationCap className="size-4 text-muted-foreground" /> Student
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFocalOpen(true)} className="cursor-pointer">
                <UserCog className="size-4 text-muted-foreground" /> Focal Person
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className='w-full mt-4'>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <AnimatedTabsList
            groupId="users"
              activeValue={activeTab}
              setActiveValue={setActiveTab}
              tabs={[
                { value: "students", label: "Students" },
                { value: "reps", label: "Representatives" }
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
                        className="shadow-none"
                        onChange={e => focalForm.setData('username', e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        className="shadow-none"
                        value={focalForm.data.email}
                        onChange={e => focalForm.setData('email', e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Password</Label>
                      <Input
                        type="password"
                        className="shadow-none"
                        value={focalForm.data.password}
                        onChange={e => focalForm.setData('password', e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="flex items-center gap-2">
                        Assign Company
                        <span className="font-normal text-muted-foreground">(optional)</span>
                      </Label>
                      <Select
                        disabled={!companies || companies.length === 0}
                        onValueChange={(val) => focalForm.setData('company_id', val)}
                      >
                        <SelectTrigger className="shadow-none">
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

                    <div className="grid gap-2">
                      <Label>Full Name</Label>
                      <Input
                        className="shadow-none"
                        value={studentForm.data.full_name}
                        onChange={e => studentForm.setData('full_name', e.target.value)}
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
                  </div>

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
                        !studentForm.data.programme_id
                      }
                    >
                      {studentForm.processing ? <Loader2 className="animate-spin size-4" /> : 'Create Student'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <TabsContent value="students">
            <UserTable
              data={filteredStudents.map((s: any) => ({
                ...s,
                id: s.user_id,
                role: 'Student',
                full_name: s.student?.full_name || 'N/A',
                programme_name: s.student?.programme?.programme_name || 'Not Assigned',
                onEdit: () => openEditModal(s, 'Student')
              }))}
              columns={studentColumns}
            />
          </TabsContent>

          <TabsContent value="reps">
            <UserTable
              data={filteredCompanyUsers.map((u: any) => ({
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
                  <DropdownMenuItem onClick={() => openAssignModal(u)}>
                    <Link className="mr-2 size-4" /> Assign Company
                  </DropdownMenuItem>
                )
              }))}
              columns={repColumns}
            />
          </TabsContent>
        </Tabs>

        {/* ... DIALOGS REMAIN THE SAME ... */}
        {/* EDIT USER DIALOG */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={submitUpdate}>
              <DialogHeader>
                <DialogTitle>
                  Edit {updateForm.data.role === 'Student' ? 'Student' : 'Representative'}
                </DialogTitle>
                <DialogDescription>
                  Update user credentials.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>
                    {updateForm.data.role === 'Student' ? 'Full Name' : 'Focal Person Name'}
                  </Label>
                  <Input
                    value={updateForm.data.username}
                    onChange={(e) => updateForm.setData('username', e.target.value)}
                    className="shadow-none"
                  />
                  {updateForm.errors.username && (
                    <p className="text-xs text-red-500">{updateForm.errors.username}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    value={updateForm.data.email}
                    onChange={(e) => updateForm.setData('email', e.target.value)}
                    className="shadow-none"
                  />
                  {updateForm.errors.email && (
                    <p className="text-xs text-red-500">{updateForm.errors.email}</p>
                  )}
                </div>

                {updateForm.data.role === 'Student' && (
                  <div className="grid gap-2">
                    <Label>Academic Programme</Label>
                    <Select
                      value={updateForm.data.programme_id}
                      onValueChange={(val) => updateForm.setData('programme_id', val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Programme" />
                      </SelectTrigger>
                      <SelectContent>
                        {programmes?.map((p: any) => (
                          <SelectItem key={p.programme_id} value={p.programme_id.toString()}>
                            {p.programme_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={updateForm.processing}
                  className="w-full"
                >
                  {updateForm.processing ? 'Updating...' : 'Update Account'}
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
    </div>
  )
}

export default UserTabs;