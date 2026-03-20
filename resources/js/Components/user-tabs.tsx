import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs'
import UserTable from '@/Components/data-table'
import { Button } from '@/Components/ui/button'
import { Plus, Building2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/Components/ui/dialog"
import { Input } from "@/Components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select"

const tabs = [
  { name: 'Students', value: 'explore', content: <UserTable /> },
  { name: 'Companies', value: 'favorites', content: <UserTable /> },
]

// Dummy list for the browse-able company assignment
const AVAILABLE_COMPANIES = [
  { id: 1, name: "Shell Livewire Brunei" },
  { id: 2, name: "Maybank" },
  { id: 3, name: "Seria Energy Lab" },
  { id: 4, name: "EVYD Tech" },
  { id: 5, name: "Dynamik Technologies" },
]

const UserTabs = () => {
  const [selectedRole, setSelectedRole] = useState<string>("student")

  return (
    <div className='w-full mt-4'>
      <Tabs defaultValue='explore'>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            {tabs.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="size-4" />
                Add Users
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Enter the details below to register a new user to the system.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-6 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="role">User Role</Label>
                  <Select onValueChange={setSelectedRole} defaultValue={selectedRole}>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="company_rep">Company Representative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedRole === "company_rep" && (
                  <div className="grid gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label htmlFor="company-assigned" className="flex items-center gap-2 text-blue-600 font-semibold">
                      <Building2 className="size-3.5" />
                      Company Assigned
                    </Label>
                    <Select>
                      <SelectTrigger id="company-assigned">
                        <SelectValue placeholder="Browse available companies..." />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_COMPANIES.map(company => (
                          <SelectItem key={company.id} value={company.name}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground italic">
                      Assigning this user gives them management rights over the company quota.
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="submit" className="w-full sm:w-auto">
                  Save User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {tabs.map(tab => (
          <TabsContent key={tab.value} value={tab.value}>
            <div className='mt-4'>{tab.content}</div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

export default UserTabs;