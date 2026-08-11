// import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card";
// import { Label } from "@/Components/ui/label";
// import { Input } from "@/Components/ui/input";
// import { Avatar, AvatarFallback } from "@/Components/ui/avatar";

// interface Company {
//     company_name: string;
// }

// interface User {
//     full_name?: string;
//     username: string;
//     email: string;
//     company?: Company; 
// }

// interface Props {
//     user: User;
// }

// export default function Profile({ user }: Props) {
//     const displayName = user.full_name || user.username;
//     const initials = (user.full_name || user.username).substring(0, 2).toUpperCase();
//     const companyName = user.company?.company_name || 'No Company Associated';

//     return (
//         <div className="p-6">
//             <h1 className="text-3xl font-sato font-bold">Account Profile</h1>
            
//             <div>
//                 {/* Header Card */}
//                 <Card className="shadow-none border-none bg-transparent">
//                     <CardHeader className="flex flex-row items-center gap-4 px-0">
//                         <Avatar className="h-20 w-20 border-2 border-background shadow-sm">
//                             <AvatarFallback className="text-xl bg-primary text-primary-foreground">
//                                 {initials}
//                             </AvatarFallback>
//                         </Avatar>
//                         <div>
//                             <CardTitle className="text-2xl">{displayName}</CardTitle>
//                             <CardDescription className="text-base">Company Representative</CardDescription>
//                         </div>
//                     </CardHeader>
//                 </Card>

//                 {/* Info Card */}
//                 <Card className="shadow-none border">
//                     <CardHeader>
//                         <CardTitle>Personal & Professional Details</CardTitle>
//                         <CardDescription>Your account information and company association.</CardDescription>
//                     </CardHeader>
//                     <CardContent className="grid gap-6">
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div className="grid gap-2">
//                                 <Label htmlFor="name">Full Name</Label>
//                                 <Input 
//                                     id="name"
//                                     defaultValue={displayName} 
//                                     readOnly 
//                                     className="shadow-none focus-visible:ring-0 focus-visible:ring-offset-0" 
//                                 />
//                             </div>
//                             <div className="grid gap-2">
//                                 <Label htmlFor="email">Email Address</Label>
//                                 <Input 
//                                     id="email"
//                                     defaultValue={user.email} 
//                                     readOnly 
//                                     className="shadow-none focus-visible:ring-0 focus-visible:ring-offset-0" 
//                                 />
//                             </div>
//                         </div>

//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div className="grid gap-2">
//                                 <Label htmlFor="company">Representing Company</Label>
//                                 <Input 
//                                     id="company"
//                                     defaultValue={companyName} 
//                                     readOnly 
//                                     className="shadow-none font-medium text-primary focus-visible:ring-0 focus-visible:ring-offset-0" 
//                                 />
//                             </div>
//                             <div className="grid gap-2">
//                                 <Label htmlFor="role">Account Role</Label>
//                                 <Input 
//                                     id="role"
//                                     defaultValue="Company Representative" 
//                                     readOnly 
//                                     className="shadow-none focus-visible:ring-0 focus-visible:ring-offset-0" 
//                                 />
//                             </div>
//                         </div>
//                     </CardContent>
//                 </Card>
//             </div>
//         </div>
//     );
// }

// Profile.layout = (page: React.ReactNode) => <AuthenticatedLayout children={page} />;

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Avatar, AvatarFallback } from "@/Components/ui/avatar";
import { Button } from "@/Components/ui/button";
import { useForm } from "@inertiajs/react";

interface Company {
    company_name: string;
    office_address?: string;
    industry_sector?: string;
    description?: string;
    additional_information?: string;
}

interface User {
    full_name?: string;
    username: string;
    email: string;
    role: string;
    company?: Company;
}

interface Props {
    user: User;
}

export default function Profile({ user }: Props) {
    const displayName = user.full_name || user.username;
    const initials = displayName.substring(0, 2).toUpperCase();

    const canEdit = user.role === "Company" || user.role === "Admin";

    const { data, setData, put, processing } = useForm({
        username: user.username || "",
        email: user.email || "",
        company_name: user.company?.company_name || "",
        office_address: user.company?.office_address || "",
        industry_sector: user.company?.industry_sector || "",
        description: user.company?.description || "",
        additional_information: user.company?.additional_information || "",
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route("company.profile.update"));
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-sato font-bold">Account Profile</h1>

            <Card className="shadow-none border-none bg-transparent">
                <CardHeader className="flex flex-row items-center gap-4 px-0">
                    <Avatar className="h-20 w-20 border-2 border-background shadow-sm">
                        <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-2xl">{displayName}</CardTitle>
                        <CardDescription className="text-base">
                            {user.role === "Admin" ? "Administrator" : "Company Representative"}
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>

            <Card className="shadow-none border">
                <CardHeader>
                    <CardTitle>Personal & Professional Details</CardTitle>
                    <CardDescription>
                        {canEdit
                            ? "Update your account information and company profile."
                            : "Your account information and company association."}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={submit} className="grid gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Full Name</Label>
                                <Input
                                    value={data.username}
                                    onChange={(e) => setData("username", e.target.value)}
                                    readOnly={!canEdit}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Email Address</Label>
                                <Input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData("email", e.target.value)}
                                    readOnly={!canEdit}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Company Name</Label>
                                <Input
                                    value={data.company_name}
                                    onChange={(e) => setData("company_name", e.target.value)}
                                    readOnly={!canEdit}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Industry Sector</Label>
                                <Input
                                    value={data.industry_sector}
                                    onChange={(e) => setData("industry_sector", e.target.value)}
                                    readOnly={!canEdit}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Office Address</Label>
                            <Input
                                value={data.office_address}
                                onChange={(e) => setData("office_address", e.target.value)}
                                readOnly={!canEdit}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Description</Label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData("description", e.target.value)}
                                readOnly={!canEdit}
                                className="min-h-[100px] rounded-md border px-3 py-2 text-sm"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Additional Information</Label>
                            <textarea
                                value={data.additional_information}
                                onChange={(e) => setData("additional_information", e.target.value)}
                                readOnly={!canEdit}
                                className="min-h-[100px] rounded-md border px-3 py-2 text-sm"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Account Role</Label>
                            <Input value={user.role} readOnly />
                        </div>

                        {canEdit && (
                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    {processing ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

Profile.layout = (page: React.ReactNode) => (
    <AuthenticatedLayout children={page} />
);