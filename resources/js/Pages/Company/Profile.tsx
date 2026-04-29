import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Avatar, AvatarFallback } from "@/Components/ui/avatar";

interface Company {
    company_name: string;
}

interface User {
    full_name?: string;
    username: string;
    email: string;
    company?: Company; 
}

interface Props {
    user: User;
}

export default function Profile({ user }: Props) {
    const displayName = user.full_name || user.username;
    const initials = (user.full_name || user.username).substring(0, 2).toUpperCase();
    const companyName = user.company?.company_name || 'No Company Associated';

    return (
        <div className="p-6">
            <h1 className="text-3xl font-sato font-bold">Account Profile</h1>
            
            <div>
                {/* Header Card */}
                <Card className="shadow-none border-none bg-transparent">
                    <CardHeader className="flex flex-row items-center gap-4 px-0">
                        <Avatar className="h-20 w-20 border-2 border-background shadow-sm">
                            <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-2xl">{displayName}</CardTitle>
                            <CardDescription className="text-base">Company Representative</CardDescription>
                        </div>
                    </CardHeader>
                </Card>

                {/* Info Card */}
                <Card className="shadow-none border">
                    <CardHeader>
                        <CardTitle>Personal & Professional Details</CardTitle>
                        <CardDescription>Your account information and company association.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input 
                                    id="name"
                                    defaultValue={displayName} 
                                    readOnly 
                                    className="shadow-none focus-visible:ring-0 focus-visible:ring-offset-0" 
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input 
                                    id="email"
                                    defaultValue={user.email} 
                                    readOnly 
                                    className="shadow-none focus-visible:ring-0 focus-visible:ring-offset-0" 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="company">Representing Company</Label>
                                <Input 
                                    id="company"
                                    defaultValue={companyName} 
                                    readOnly 
                                    className="shadow-none font-medium text-primary focus-visible:ring-0 focus-visible:ring-offset-0" 
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="role">Account Role</Label>
                                <Input 
                                    id="role"
                                    defaultValue="Company Representative" 
                                    readOnly 
                                    className="shadow-none focus-visible:ring-0 focus-visible:ring-offset-0" 
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

Profile.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;