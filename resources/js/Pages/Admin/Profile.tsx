import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Avatar, AvatarFallback } from "@/Components/ui/avatar";

interface User {
    full_name?: string;
    username: string;
    email: string;
}

interface Props {
    user: User;
}

export default function Profile({ user }: Props) {

    const displayName = user.full_name || user.username;
    const initials = displayName.substring(0, 2).toUpperCase();

    return (
        <div className="p-6">
            <h1 className="text-3xl font-sato font-bold">Account Profile</h1>
            
            <div>
                {/* Header Card */}
                <Card className="shadow-none border-none">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-2xl">{displayName}</CardTitle>
                            <CardDescription>Administrator</CardDescription>
                        </div>
                    </CardHeader>
                </Card>

                {/* Info Card */}
                <Card className="shadow-none border-none">
                    <CardHeader>
                        <CardTitle>Personal Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Full Name</Label>
                                <Input defaultValue={displayName} readOnly className="bg-muted/50 focus-visible:ring-0 focus-visible:ring-offset-0" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Email</Label>
                                <Input defaultValue={user.email} readOnly className="bg-muted/50 focus-visible:ring-0 focus-visible:ring-offset-0" />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Role</Label>
                            <Input defaultValue="ILD Admin" readOnly className="bg-muted/50 focus-visible:ring-0 focus-visible:ring-offset-0" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

Profile.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;