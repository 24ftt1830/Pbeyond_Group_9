import { useState } from 'react'
import { useForm, usePage } from '@inertiajs/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs'
import UserTable from '@/Components/data-table'
import { Button } from '@/Components/ui/button'
import { Plus, Building2, Loader2 } from 'lucide-react'
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

// 1. Define Table Columns
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
  const { students, companyUsers, companies } = usePage<any>().props;
  const [open, setOpen] = useState(false);

  const { data, setData, post, processing, reset, errors } = useForm({
    username: '',
    email: '',
    password: '',
    company_id: '',
    role: 'Company'
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    post(route('admin.manage-users.store'), {
      onSuccess: () => {
        setOpen(false);
        reset();
      },
      onError: (errors) => {
        console.error("Registration failed:", errors);
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

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="size-4" /> Add User
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={submit}>
                <DialogHeader>
                  <DialogTitle>Register Focal Person</DialogTitle>
                  <DialogDescription>
                    Create a company account and link it to an existing company.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={data.username}
                      onChange={e => setData('username', e.target.value)}
                      placeholder="jdoe_admin"
                      required
                    />
                    {errors.username && <p className="text-red-500 text-[10px]">{errors.username}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={data.email}
                      onChange={e => setData('email', e.target.value)}
                      placeholder="rep@company.com"
                      required
                    />
                    {errors.email && <p className="text-red-500 text-[10px]">{errors.email}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password">Temporary Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={data.password}
                      onChange={e => setData('password', e.target.value)}
                      required
                    />
                    {errors.password && <p className="text-red-500 text-[10px]">{errors.password}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2 text-blue-600 font-medium">
                      <Building2 className="size-3.5" /> Assign Company
                    </Label>
                    <Select onValueChange={(val) => setData('company_id', val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Company" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies?.map((c: any) => (
                          <SelectItem key={c.company_id} value={c.company_id.toString()}>
                            {c.company_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.company_id && <p className="text-red-500 text-[10px]">{errors.company_id}</p>}
                  </div>
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={processing} className="w-full">
                    {processing ? <Loader2 className="animate-spin mr-2 size-4" /> : 'Create Account'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* --- Tab Content: Students --- */}
        <TabsContent value="students">
          <UserTable
            data={students || []}
            columns={studentColumns}
          />
        </TabsContent>

        {/* --- Tab Content: Representatives --- */}
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