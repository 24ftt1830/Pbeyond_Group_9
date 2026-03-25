// import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
// import { useRef, useState } from 'react';
// import type { ReactNode } from 'react';

// export default function Documentations() {
//     const [cvFile, setCvFile] = useState<File | null>(null);
//     const [identityCardFile, setIdentityCardFile] = useState<File | null>(null);
//     const [driversLicenseFile, setDriversLicenseFile] = useState<File | null>(null);
//     const [resultsFile, setResultsFile] = useState<File | null>(null);
//     const cvUploadInputRef = useRef<HTMLInputElement>(null);
//     const cvUpdateInputRef = useRef<HTMLInputElement>(null);
//     const icUploadInputRef = useRef<HTMLInputElement>(null);
//     const icUpdateInputRef = useRef<HTMLInputElement>(null);
//     const dlUploadInputRef = useRef<HTMLInputElement>(null);
//     const dlUpdateInputRef = useRef<HTMLInputElement>(null);
//     const resultsUploadInputRef = useRef<HTMLInputElement>(null);
//     const resultsUpdateInputRef = useRef<HTMLInputElement>(null);

//     const handleCvUploadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const selectedFile = event.target.files?.[0] ?? null;
//         if (selectedFile) {
//             setCvFile(selectedFile);
//         }
//     };

//     const handleCvUpdateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const selectedFile = event.target.files?.[0] ?? null;
//         if (selectedFile) {
//             setCvFile(selectedFile);
//         }
//     };

//     const handleIdentityCardUploadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const selectedFile = event.target.files?.[0] ?? null;
//         if (selectedFile) {
//             setIdentityCardFile(selectedFile);
//         }
//     };

//     const handleIdentityCardUpdateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const selectedFile = event.target.files?.[0] ?? null;
//         if (selectedFile) {
//             setIdentityCardFile(selectedFile);
//         }
//     };

//     const handleDriversLicenseUploadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const selectedFile = event.target.files?.[0] ?? null;
//         if (selectedFile) {
//             setDriversLicenseFile(selectedFile);
//         }
//     };

//     const handleDriversLicenseUpdateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const selectedFile = event.target.files?.[0] ?? null;
//         if (selectedFile) {
//             setDriversLicenseFile(selectedFile);
//         }
//     };

//     const handleResultsUploadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const selectedFile = event.target.files?.[0] ?? null;
//         if (selectedFile) {
//             setResultsFile(selectedFile);
//         }
//     };

//     const handleResultsUpdateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const selectedFile = event.target.files?.[0] ?? null;
//         if (selectedFile) {
//             setResultsFile(selectedFile);
//         }
//     };

//     const openPreview = (file: File | null) => {
//         if (!file) {
//             return;
//         }

//         const previewUrl = URL.createObjectURL(file);
//         window.open(previewUrl, '_blank', 'noopener,noreferrer');
//         setTimeout(() => URL.revokeObjectURL(previewUrl), 60000);
//     };

//     return (
//         <div className="mx-auto max-w-7xl p-6">
//             <h1 className="mb-6 text-2xl font-bold text-black">Documentations</h1>

//             <div className="rounded-xl border border-black/10 bg-white p-6 shadow">
//                 <h2 className="mb-4 text-lg font-semibold text-black">Curriculum Vitae</h2>

//                 <div className="overflow-x-auto">
//                     <table className="w-full min-w-[820px] text-left text-sm">
//                         <thead>
//                             <tr className="border-b border-black/10 bg-black/5">
//                                 <th className="px-4 py-3 font-semibold text-black">Document Name</th>
//                                 <th className="px-4 py-3 font-semibold text-black">Status</th>
//                                 <th className="px-4 py-3 font-semibold text-black">Upload</th>
//                                 <th className="px-4 py-3 font-semibold text-black">Update</th>
//                                 <th className="px-4 py-3 font-semibold text-black">View</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             <tr className="border-b border-black/10">
//                                 <td className="px-4 py-3 text-black/80">{cvFile ? cvFile.name : '-'}</td>
//                                 <td className="px-4 py-3">
//                                     <div className="flex items-center gap-2">
//                                         <span
//                                             className={`inline-block h-2.5 w-2.5 rounded-full ${
//                                                 cvFile ? 'bg-green-500' : 'bg-red-500'
//                                             }`}
//                                         />
//                                         <span className={`font-medium ${cvFile ? 'text-green-700' : 'text-red-700'}`}>
//                                             {cvFile ? 'Uploaded' : 'Not Uploaded'}
//                                         </span>
//                                     </div>
//                                 </td>
//                                 <td className="px-4 py-3">
//                                     <input
//                                         ref={cvUploadInputRef}
//                                         type="file"
//                                         className="hidden"
//                                         onChange={handleCvUploadChange}
//                                     />
//                                     <button
//                                         type="button"
//                                         onClick={() => cvUploadInputRef.current?.click()}
//                                         className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-black/90"
//                                     >
//                                         Upload
//                                     </button>
//                                 </td>
//                                 <td className="px-4 py-3">
//                                     <input
//                                         ref={cvUpdateInputRef}
//                                         type="file"
//                                         className="hidden"
//                                         onChange={handleCvUpdateChange}
//                                     />
//                                     <button
//                                         type="button"
//                                         onClick={() => cvUpdateInputRef.current?.click()}
//                                         className="rounded-md bg-black/10 px-3 py-1.5 text-sm font-medium text-black hover:bg-black/20"
//                                     >
//                                         Update
//                                     </button>
//                                 </td>
//                                 <td className="px-4 py-3">
//                                     <button
//                                         type="button"
//                                         onClick={() => openPreview(cvFile)}
//                                         disabled={!cvFile}
//                                         className="rounded-md bg-black/10 px-3 py-1.5 text-sm font-medium text-black hover:bg-black/20 disabled:cursor-not-allowed disabled:opacity-50"
//                                     >
//                                         View
//                                     </button>
//                                 </td>
//                             </tr>
//                         </tbody>
//                     </table>
//                 </div>
//             </div>

//             <div className="mt-6 rounded-xl border border-black/10 bg-white p-6 shadow">
//                 <h2 className="mb-4 text-lg font-semibold text-black">Identity Card</h2>

//                 <div className="overflow-x-auto">
//                     <table className="w-full min-w-[820px] text-left text-sm">
//                         <thead>
//                             <tr className="border-b border-black/10 bg-black/5">
//                                 <th className="px-4 py-3 font-semibold text-black">Document Name</th>
//                                 <th className="px-4 py-3 font-semibold text-black">Status</th>
//                                 <th className="px-4 py-3 font-semibold text-black">Upload</th>
//                                 <th className="px-4 py-3 font-semibold text-black">Update</th>
//                                 <th className="px-4 py-3 font-semibold text-black">View</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             <tr className="border-b border-black/10">
//                                 <td className="px-4 py-3 text-black/80">{identityCardFile ? identityCardFile.name : '-'}</td>
//                                 <td className="px-4 py-3">
//                                     <div className="flex items-center gap-2">
//                                         <span
//                                             className={`inline-block h-2.5 w-2.5 rounded-full ${
//                                                 identityCardFile ? 'bg-green-500' : 'bg-red-500'
//                                             }`}
//                                         />
//                                         <span className={`font-medium ${identityCardFile ? 'text-green-700' : 'text-red-700'}`}>
//                                             {identityCardFile ? 'Uploaded' : 'Not Uploaded'}
//                                         </span>
//                                     </div>
//                                 </td>
//                                 <td className="px-4 py-3">
//                                     <input
//                                         ref={icUploadInputRef}
//                                         type="file"
//                                         className="hidden"
//                                         onChange={handleIdentityCardUploadChange}
//                                     />
//                                     <button
//                                         type="button"
//                                         onClick={() => icUploadInputRef.current?.click()}
//                                         className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-black/90"
//                                     >
//                                         Upload
//                                     </button>
//                                 </td>
//                                 <td className="px-4 py-3">
//                                     <input
//                                         ref={icUpdateInputRef}
//                                         type="file"
//                                         className="hidden"
//                                         onChange={handleIdentityCardUpdateChange}
//                                     />
//                                     <button
//                                         type="button"
//                                         onClick={() => icUpdateInputRef.current?.click()}
//                                         className="rounded-md bg-black/10 px-3 py-1.5 text-sm font-medium text-black hover:bg-black/20"
//                                     >
//                                         Update
//                                     </button>
//                                 </td>
//                                 <td className="px-4 py-3">
//                                     <button
//                                         type="button"
//                                         onClick={() => openPreview(identityCardFile)}
//                                         disabled={!identityCardFile}
//                                         className="rounded-md bg-black/10 px-3 py-1.5 text-sm font-medium text-black hover:bg-black/20 disabled:cursor-not-allowed disabled:opacity-50"
//                                     >
//                                         View
//                                     </button>
//                                 </td>
//                             </tr>
//                         </tbody>
//                     </table>
//                 </div>
//             </div>

//             <div className="mt-6 rounded-xl border border-black/10 bg-white p-6 shadow">
//                 <h2 className="mb-4 text-lg font-semibold text-black">Drivers' License</h2>

//                 <div className="overflow-x-auto">
//                     <table className="w-full min-w-[820px] text-left text-sm">
//                         <thead>
//                             <tr className="border-b border-black/10 bg-black/5">
//                                 <th className="px-4 py-3 font-semibold text-black">Document Name</th>
//                                 <th className="px-4 py-3 font-semibold text-black">Status</th>
//                                 <th className="px-4 py-3 font-semibold text-black">Upload</th>
//                                 <th className="px-4 py-3 font-semibold text-black">Update</th>
//                                 <th className="px-4 py-3 font-semibold text-black">View</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             <tr className="border-b border-black/10">
//                                 <td className="px-4 py-3 text-black/80">{driversLicenseFile ? driversLicenseFile.name : '-'}</td>
//                                 <td className="px-4 py-3">
//                                     <div className="flex items-center gap-2">
//                                         <span
//                                             className={`inline-block h-2.5 w-2.5 rounded-full ${
//                                                 driversLicenseFile ? 'bg-green-500' : 'bg-red-500'
//                                             }`}
//                                         />
//                                         <span className={`font-medium ${driversLicenseFile ? 'text-green-700' : 'text-red-700'}`}>
//                                             {driversLicenseFile ? 'Uploaded' : 'Not Uploaded'}
//                                         </span>
//                                     </div>
//                                 </td>
//                                 <td className="px-4 py-3">
//                                     <input
//                                         ref={dlUploadInputRef}
//                                         type="file"
//                                         className="hidden"
//                                         onChange={handleDriversLicenseUploadChange}
//                                     />
//                                     <button
//                                         type="button"
//                                         onClick={() => dlUploadInputRef.current?.click()}
//                                         className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-black/90"
//                                     >
//                                         Upload
//                                     </button>
//                                 </td>
//                                 <td className="px-4 py-3">
//                                     <input
//                                         ref={dlUpdateInputRef}
//                                         type="file"
//                                         className="hidden"
//                                         onChange={handleDriversLicenseUpdateChange}
//                                     />
//                                     <button
//                                         type="button"
//                                         onClick={() => dlUpdateInputRef.current?.click()}
//                                         className="rounded-md bg-black/10 px-3 py-1.5 text-sm font-medium text-black hover:bg-black/20"
//                                     >
//                                         Update
//                                     </button>
//                                 </td>
//                                 <td className="px-4 py-3">
//                                     <button
//                                         type="button"
//                                         onClick={() => openPreview(driversLicenseFile)}
//                                         disabled={!driversLicenseFile}
//                                         className="rounded-md bg-black/10 px-3 py-1.5 text-sm font-medium text-black hover:bg-black/20 disabled:cursor-not-allowed disabled:opacity-50"
//                                     >
//                                         View
//                                     </button>
//                                 </td>
//                             </tr>
//                         </tbody>
//                     </table>
//                 </div>
//             </div>

//             <div className="my-8 h-px w-full bg-black/15" />

//             <div className="rounded-xl border border-black/10 bg-white p-6 shadow">
//                 <h2 className="mb-4 text-lg font-semibold text-black">Results</h2>

//                 <div className="overflow-x-auto">
//                     <table className="w-full min-w-[900px] text-left text-sm">
//                         <thead>
//                             <tr className="border-b border-black/10 bg-black/5">
//                                 <th className="px-4 py-3 font-semibold text-black">No.</th>
//                                 <th className="px-4 py-3 font-semibold text-black">Document Name</th>
//                                 <th className="px-4 py-3 font-semibold text-black">Status</th>
//                                 <th className="px-4 py-3 font-semibold text-black">Upload</th>
//                                 <th className="px-4 py-3 font-semibold text-black">Update</th>
//                                 <th className="px-4 py-3 font-semibold text-black">View</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             <tr className="border-b border-black/10">
//                                 <td className="px-4 py-3 text-black/80">1</td>
//                                 <td className="px-4 py-3 text-black/80">{resultsFile ? resultsFile.name : '-'}</td>
//                                 <td className="px-4 py-3">
//                                     <div className="flex items-center gap-2">
//                                         <span
//                                             className={`inline-block h-2.5 w-2.5 rounded-full ${
//                                                 resultsFile ? 'bg-green-500' : 'bg-red-500'
//                                             }`}
//                                         />
//                                         <span className={`font-medium ${resultsFile ? 'text-green-700' : 'text-red-700'}`}>
//                                             {resultsFile ? 'Uploaded' : 'Not Uploaded'}
//                                         </span>
//                                     </div>
//                                 </td>
//                                 <td className="px-4 py-3">
//                                     <input
//                                         ref={resultsUploadInputRef}
//                                         type="file"
//                                         className="hidden"
//                                         onChange={handleResultsUploadChange}
//                                     />
//                                     <button
//                                         type="button"
//                                         onClick={() => resultsUploadInputRef.current?.click()}
//                                         className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-black/90"
//                                     >
//                                         Upload
//                                     </button>
//                                 </td>
//                                 <td className="px-4 py-3">
//                                     <input
//                                         ref={resultsUpdateInputRef}
//                                         type="file"
//                                         className="hidden"
//                                         onChange={handleResultsUpdateChange}
//                                     />
//                                     <button
//                                         type="button"
//                                         onClick={() => resultsUpdateInputRef.current?.click()}
//                                         className="rounded-md bg-black/10 px-3 py-1.5 text-sm font-medium text-black hover:bg-black/20"
//                                     >
//                                         Update
//                                     </button>
//                                 </td>
//                                 <td className="px-4 py-3">
//                                     <button
//                                         type="button"
//                                         onClick={() => openPreview(resultsFile)}
//                                         disabled={!resultsFile}
//                                         className="rounded-md bg-black/10 px-3 py-1.5 text-sm font-medium text-black hover:bg-black/20 disabled:cursor-not-allowed disabled:opacity-50"
//                                     >
//                                         View
//                                     </button>
//                                 </td>
//                             </tr>
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </div>
//     );
// }

// Documentations.layout = (page: ReactNode) => <AuthenticatedLayout children={page} />;


import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { router, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';

type DocumentType = 'cv' | 'identity_card' | 'drivers_license' | 'results';

type Document = {
    id: number;
    type: DocumentType;
    file_path: string;
    original_name: string;
    created_at: string;
};

export default function Documentations({ documents: initialDocuments = [] }: { documents?: Document[] }) {
    // Ensure documents is always an array
    const documents = Array.isArray(initialDocuments) ? initialDocuments : [];
    const [uploading, setUploading] = useState<DocumentType | null>(null);
    const { auth } = usePage().props;

    // Refs for hidden file inputs
    const cvInputRef = useRef<HTMLInputElement>(null);
    const icInputRef = useRef<HTMLInputElement>(null);
    const dlInputRef = useRef<HTMLInputElement>(null);
    const resultsInputRef = useRef<HTMLInputElement>(null);

    const getDocument = (type: DocumentType) => documents.find((doc) => doc.type === type);

    const handleFileSelect = (type: DocumentType, file: File | null) => {
        if (!file) return;

        setUploading(type);
        const formData = new FormData();
        formData.append('type', type);
        formData.append('file', file);

        router.post(route('student.documentations.upload'), formData, {
            preserveScroll: true,
            onFinish: () => setUploading(null),
            onSuccess: () => {
                // Reload the page to refresh the document list
                window.location.reload();
            },
            onError: (errors) => {
                console.error('Upload failed', errors);
                alert('Upload failed. Please try again.');
            },
        });
    };

    const handlePreview = (type: DocumentType) => {
        const doc = getDocument(type);
        if (doc) {
            window.open(`/storage/${doc.file_path}`, '_blank');
        }
    };

    return (
        <div className="mx-auto max-w-7xl p-6">
            <h1 className="mb-6 text-2xl font-bold text-black">Documentations</h1>

            {/* Curriculum Vitae */}
            <DocumentSection
                title="Curriculum Vitae"
                type="cv"
                document={getDocument('cv')}
                onUpload={() => cvInputRef.current?.click()}
                onUpdate={() => cvInputRef.current?.click()}
                onView={() => handlePreview('cv')}
                isUploading={uploading === 'cv'}
                fileInputRef={cvInputRef}
                onFileChange={(file) => handleFileSelect('cv', file)}
            />

            {/* Identity Card */}
            <DocumentSection
                title="Identity Card"
                type="identity_card"
                document={getDocument('identity_card')}
                onUpload={() => icInputRef.current?.click()}
                onUpdate={() => icInputRef.current?.click()}
                onView={() => handlePreview('identity_card')}
                isUploading={uploading === 'identity_card'}
                fileInputRef={icInputRef}
                onFileChange={(file) => handleFileSelect('identity_card', file)}
            />

            {/* Drivers' License */}
            <DocumentSection
                title="Drivers' License"
                type="drivers_license"
                document={getDocument('drivers_license')}
                onUpload={() => dlInputRef.current?.click()}
                onUpdate={() => dlInputRef.current?.click()}
                onView={() => handlePreview('drivers_license')}
                isUploading={uploading === 'drivers_license'}
                fileInputRef={dlInputRef}
                onFileChange={(file) => handleFileSelect('drivers_license', file)}
            />

            <div className="my-8 h-px w-full bg-black/15" />

            {/* Results */}
            <DocumentSection
                title="Results"
                type="results"
                document={getDocument('results')}
                onUpload={() => resultsInputRef.current?.click()}
                onUpdate={() => resultsInputRef.current?.click()}
                onView={() => handlePreview('results')}
                isUploading={uploading === 'results'}
                fileInputRef={resultsInputRef}
                onFileChange={(file) => handleFileSelect('results', file)}
            />
        </div>
    );
}

// Reusable component for each document type
function DocumentSection({
    title,
    type,
    document,
    onUpload,
    onUpdate,
    onView,
    isUploading,
    fileInputRef,
    onFileChange,
}: {
    title: string;
    type: string;
    document?: Document;
    onUpload: () => void;
    onUpdate: () => void;
    onView: () => void;
    isUploading: boolean;
    fileInputRef: React.RefObject<HTMLInputElement>;
    onFileChange: (file: File | null) => void;
}) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (file) onFileChange(file);
        // Reset the input value so the same file can be selected again
        e.target.value = '';
    };

    return (
        <div className="mt-6 rounded-xl border border-black/10 bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-black">{title}</h2>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left text-sm">
                    <thead>
                        <tr className="border-b border-black/10 bg-black/5">
                            <th className="px-4 py-3 font-semibold text-black">Document Name</th>
                            <th className="px-4 py-3 font-semibold text-black">Status</th>
                            <th className="px-4 py-3 font-semibold text-black">Upload</th>
                            <th className="px-4 py-3 font-semibold text-black">Update</th>
                            <th className="px-4 py-3 font-semibold text-black">View</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-black/10">
                            <td className="px-4 py-3 text-black/80">{document?.original_name ?? '-'}</td>
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`inline-block h-2.5 w-2.5 rounded-full ${
                                            document ? 'bg-green-500' : 'bg-red-500'
                                        }`}
                                    />
                                    <span className={`font-medium ${document ? 'text-green-700' : 'text-red-700'}`}>
                                        {document ? 'Uploaded' : 'Not Uploaded'}
                                    </span>
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={handleChange}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                />
                                <button
                                    type="button"
                                    onClick={onUpload}
                                    disabled={isUploading}
                                    className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-50"
                                >
                                    {isUploading ? 'Uploading...' : 'Upload'}
                                </button>
                            </td>
                            <td className="px-4 py-3">
                                <button
                                    type="button"
                                    onClick={onUpdate}
                                    disabled={!document || isUploading}
                                    className="rounded-md bg-black/10 px-3 py-1.5 text-sm font-medium text-black hover:bg-black/20 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Update
                                </button>
                            </td>
                            <td className="px-4 py-3">
                                <button
                                    type="button"
                                    onClick={onView}
                                    disabled={!document}
                                    className="rounded-md bg-black/10 px-3 py-1.5 text-sm font-medium text-black hover:bg-black/20 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    View
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

Documentations.layout = (page: ReactNode) => <AuthenticatedLayout children={page} />;
