import { useState } from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import type { ReactNode } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";

type ApplicationItem = {
    id: number;
    status_label: string;
    step: number;
    applied_at: string | null;
    company: {
        id: number;
        name: string;
    } | null;
};

export default function ApplicationTracking({ applications = [] }: { applications?: ApplicationItem[] }) {
    const processSteps = [
        { key: 'submitted', label: 'Application Submitted' },
        { key: 'review', label: 'Company Review' },
        { key: 'finalized', label: 'Finalized' },
    ];

    const formatDate = (value: string | null) => {
        if (!value) return '-';
        return new Date(value).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(applications[0]?.id ?? null);
    
    const selectedApp = applications.find((app) => app.id === selectedApplicationId) ?? applications[0] ?? null;
    const currentStep = selectedApp?.step ?? -1;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Application Tracking</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card className="shadow-none">
                        <CardContent className="pt-6">
                            {selectedApp ? (
                                <>
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h2 className="text-xl font-semibold">
                                                {selectedApp.company?.name ?? 'No Company Selected'}
                                            </h2>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Applied on {formatDate(selectedApp.applied_at)}
                                            </p>
                                        </div>
                                        <Badge variant="secondary" className="px-3 py-1">
                                            {selectedApp.status_label}
                                        </Badge>
                                    </div>

                                    <div className="space-y-6">
                                        {processSteps.map((step, idx) => {
                                            const isCompleted = idx < currentStep;
                                            const isCurrent = idx === currentStep;
                                            
                                            return (
                                                <div key={step.key} className="relative flex gap-4">
                                                    <div className="flex flex-col items-center">
                                                        <div className="z-10 bg-background rounded-full p-0.5">
                                                            {isCompleted ? (
                                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                                            ) : isCurrent ? (
                                                                <Clock className="w-5 h-5 text-blue-500 animate-pulse" />
                                                            ) : (
                                                                <Circle className="w-5 h-5 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                        {idx < processSteps.length - 1 && (
                                                            <div className={`w-px h-10 my-1 ${isCompleted ? 'bg-green-500' : 'bg-border'}`}></div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 pb-2">
                                                        <div className={`text-sm ${isCurrent ? 'text-blue-600 font-medium' : isCompleted ? 'font-medium' : 'text-muted-foreground'}`}>
                                                            {step.label}
                                                            
                                                            {isCurrent && step.key === 'review' && (
                                                                <div className="mt-1">
                                                                    <Badge variant="default" className="text-xs">
                                                                        Current: {selectedApp.status_label}
                                                                    </Badge>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    You have no active applications.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <Card className="shadow-none">
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            Your Applications
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {applications.length > 0 ? (
                            <ul className="space-y-2">
                                {applications.map((app) => (
                                    <li key={app.id}>
                                        <Button
                                            variant={selectedApp?.id === app.id ? "secondary" : "ghost"}
                                            className="w-full justify-start"
                                            onClick={() => setSelectedApplicationId(app.id)}
                                        >
                                            {app.company?.name ?? 'Unknown Company'}
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">No applications found.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

ApplicationTracking.layout = (page: ReactNode) => <AuthenticatedLayout children={page} />;