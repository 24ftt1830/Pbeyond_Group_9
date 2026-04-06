import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { router, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Upload, RefreshCw, Eye, FileText } from 'lucide-react';

type DocumentType = 'cv' | 'identity_card' | 'drivers_license' | 'results';

type Document = {
    id: number;
    type: DocumentType;
    file_path: string;
    original_name: string;
    created_at: string;
};

export default function Documentations({ documents: initialDocuments = [] }: { documents?: Document[] }) {
    const documents = Array.isArray(initialDocuments) ? initialDocuments : [];
    const [uploading, setUploading] = useState<DocumentType | null>(null);
    const { auth } = usePage().props;

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
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Documentations</h1>

            <div className="space-y-6">
                {/* CV */}
                <DocumentCard
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
                <DocumentCard
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

                {/* Driver's License */}
                <DocumentCard
                    title="Driver's License"
                    type="drivers_license"
                    document={getDocument('drivers_license')}
                    onUpload={() => dlInputRef.current?.click()}
                    onUpdate={() => dlInputRef.current?.click()}
                    onView={() => handlePreview('drivers_license')}
                    isUploading={uploading === 'drivers_license'}
                    fileInputRef={dlInputRef}
                    onFileChange={(file) => handleFileSelect('drivers_license', file)}
                />

                {/* Results */}
                <DocumentCard
                    title="Academic Results"
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
        </div>
    );
}

function DocumentCard({
    title,
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
        e.target.value = '';
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h2 className="text-lg font-medium text-gray-900">{title}</h2>
            </div>
            <div className="p-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Update</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">View</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            <tr>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                    {document?.original_name ? (
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-gray-400" />
                                            {document.original_name}
                                        </div>
                                    ) : (
                                        '-'
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        document ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {document ? 'Uploaded' : 'Not Uploaded'}
                                    </span>
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
                                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                    >
                                        <Upload className="w-4 h-4" />
                                        {isUploading ? 'Uploading...' : 'Upload'}
                                    </button>
                                </td>
                                <td className="px-4 py-3">
                                    <button
                                        type="button"
                                        onClick={onUpdate}
                                        disabled={!document || isUploading}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Update
                                    </button>
                                </td>
                                <td className="px-4 py-3">
                                    <button
                                        type="button"
                                        onClick={onView}
                                        disabled={!document}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

Documentations.layout = (page: ReactNode) => <AuthenticatedLayout children={page} />;
