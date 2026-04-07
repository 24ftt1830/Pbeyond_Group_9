import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, FileText, User, BookOpen, MapPin, Briefcase, Camera } from 'lucide-react';

export default function StudentShow() {
    const { student } = usePage().props;

    const getDocLabel = (type: string) => {
        const labels: Record<string, string> = {
            cv: 'Curriculum Vitae',
            identity_card: 'Identity Card',
            drivers_license: "Driver's License",
            results: 'Academic Results',
        };
        return labels[type] || type;
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-6">
                <Link
                    href={route('admin.students')}
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Students
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                {/* Header with Passport Photo at top right */}
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Student Profile</h1>
                        <p className="text-sm text-gray-500">Vetting & Document Preview</p>
                    </div>
                    {student.passport_photo_path ? (
                        <img
                            src={`/storage/${student.passport_photo_path}`}
                            alt="Passport"
                            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                        />
                    ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                            <Camera className="w-6 h-6 text-gray-500" />
                        </div>
                    )}
                </div>

                <div className="p-6 space-y-6">
                    {/* Personal Information (without photo, since it's in header) */}
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <User className="w-5 h-5" /> Personal Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div><span className="font-medium text-gray-700">Full Name:</span> {student.full_name}</div>
                            <div><span className="font-medium text-gray-700">Student Code:</span> {student.pb_student_code}</div>
                            <div><span className="font-medium text-gray-700">IC Number:</span> {student.ic_number}</div>
                            <div><span className="font-medium text-gray-700">IC Colour:</span> {student.ic_colour}</div>
                            <div><span className="font-medium text-gray-700">Date of Birth:</span> {new Date(student.date_of_birth).toLocaleDateString()}</div>
                            <div><span className="font-medium text-gray-700">Place of Birth:</span> {student.place_of_birth}</div>
                            <div><span className="font-medium text-gray-700">Gender:</span> {student.gender}</div>
                            <div><span className="font-medium text-gray-700">Nationality:</span> {student.nationality}</div>
                            <div><span className="font-medium text-gray-700">Race:</span> {student.race}</div>
                            <div><span className="font-medium text-gray-700">Religion:</span> {student.religion}</div>
                        </div>
                    </div>

                    {/* Academic Information */}
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <BookOpen className="w-5 h-5" /> Academic Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div><span className="font-medium text-gray-700">Programme:</span> {student.programme?.programme_name}</div>
                            <div><span className="font-medium text-gray-700">School:</span> {student.programme?.school?.school_name}</div>
                            <div><span className="font-medium text-gray-700">Intake Session:</span> {student.intake_session}</div>
                            <div><span className="font-medium text-gray-700">CGPA:</span> {student.cgpa}</div>
                            <div><span className="font-medium text-gray-700">Vetting Status:</span>
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                    student.vetting_status === 'Approved' ? 'bg-green-100 text-green-800' :
                                    student.vetting_status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {student.vetting_status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <MapPin className="w-5 h-5" /> Contact Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div><span className="font-medium text-gray-700">Postal Address:</span> {student.postal_address}</div>
                            <div><span className="font-medium text-gray-700">Mobile Phone:</span> {student.mobile_phone}</div>
                            <div><span className="font-medium text-gray-700">Emergency No:</span> {student.emergency_no}</div>
                            <div><span className="font-medium text-gray-700">Email:</span> {student.user?.email}</div>
                        </div>
                    </div>

                    {/* Work Experience (optional) */}
                    {student.work_experience && (
                        <div>
                            <h2 className="text-lg font-medium text-gray-900 mb-2">Work Experience</h2>
                            <p className="text-sm text-gray-700">{student.work_experience}</p>
                        </div>
                    )}

                    {/* Uploaded Documents – more compact, appropriate size */}
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <FileText className="w-5 h-5" /> Uploaded Documents
                        </h2>
                        {student.user?.documents && student.user.documents.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {student.user.documents.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                            <div className="truncate">
                                                <div className="text-sm font-medium text-gray-800">{getDocLabel(doc.type)}</div>
                                                <div className="text-xs text-gray-500 truncate">{doc.original_name}</div>
                                            </div>
                                        </div>
                                        <a
                                            href={`/storage/${doc.file_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 text-sm whitespace-nowrap ml-2"
                                        >
                                            View
                                        </a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No documents uploaded yet.</p>
                        )}
                    </div>

                    {/* Internship Applications (responsive table) */}
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <Briefcase className="w-5 h-5" /> Internship Applications
                        </h2>
                        {student.applications && student.applications.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full border text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="border px-3 py-2 text-left">Company</th>
                                            <th className="border px-3 py-2 text-left">Job Title</th>
                                            <th className="border px-3 py-2 text-left">Applied On</th>
                                            <th className="border px-3 py-2 text-left">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {student.applications.map((app) => (
                                            <tr key={app.application_id}>
                                                <td className="border px-3 py-2">{app.quota?.company?.company_name}</td>
                                                <td className="border px-3 py-2">{app.quota?.job_title}</td>
                                                <td className="border px-3 py-2">{new Date(app.apply_date).toLocaleDateString()}</td>
                                                <td className="border px-3 py-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                                                        app.app_status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                        app.app_status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                        app.app_status === 'Interview_Scheduled' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {app.app_status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No applications submitted yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

StudentShow.layout = (page) => <AuthenticatedLayout children={page} />;
