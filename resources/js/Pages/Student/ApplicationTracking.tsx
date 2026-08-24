import { useState } from 'react';
import { CheckCircle, Circle, Clock, Calendar } from 'lucide-react';
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
    interview_date: string | null;
    requires_interview: boolean;
    reviewed_at: string | null;  
    company: {
        id: number;
        name: string;
    } | null;
    quota: {
        job_title: string;
    } | null; 
};

type ProcessStep = {
    key: string;
    label: string;
    date: string | null;
    extra: ReactNode;
};

export default function ApplicationTracking({ applications = [] }: { applications?: ApplicationItem[] }) {
    
    const formatDate = (value: string | null) => {
        if (!value) return null;
        
        return new Date(value).toLocaleString('en-GB', {
            day: '2-digit', 
            month: 'short', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(applications[0]?.id ?? null);
    
    const selectedApp = applications.find((app) => app.id === selectedApplicationId) ?? applications[0] ?? null;
    const currentStep = selectedApp?.step ?? -1;

    // Build steps dynamically based on whether interview is required or scheduled
    const getProcessSteps = (): ProcessStep[] => {
        if (!selectedApp) return [];

        const baseSteps: ProcessStep[] = [
            { key: 'submitted', label: 'Application Submitted', date: formatDate(selectedApp.applied_at), extra: null }
        ];

        if (selectedApp.requires_interview || selectedApp.interview_date) {
            baseSteps.push({
                key: 'interview',
                label: 'Interview Stage',
                date: null,
                extra: selectedApp.interview_date ? (
                    <div className="mt-1.5 p-2.5 bg-blue-50 border border-blue-200 rounded-lg inline-flex items-center gap-2 text-xs text-blue-900 font-medium">
                        <Calendar className="h-3.5 w-3.5 text-blue-600" />
                        <span>Scheduled: <strong>{formatDate(selectedApp.interview_date)}</strong></span>
                    </div>
                ) : (
                    <span className="block text-xs text-muted-foreground font-normal mt-0.5">
                        Awaiting interview schedule
                    </span>
                )
            });
        } else {
            baseSteps.push({
                key: 'review',
                label: 'Company Review',
                date: formatDate(selectedApp.reviewed_at),
                extra: null
            });
        }

        baseSteps.push({
            key: 'finalized',
            label: 'Finalized',
            date: selectedApp.step === 2 ? formatDate(selectedApp.reviewed_at) : null,
            extra: null
        });

        return baseSteps;
    };

    const processSteps = getProcessSteps();

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold font-sato mb-6">Application Tracking</h1>

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
                                                Position: {selectedApp.quota?.job_title ?? 'N/A'}
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
                                                            {step.date && (
                                                                <span className="block text-xs text-muted-foreground font-normal mt-0.5">
                                                                    {step.date}
                                                                </span>
                                                            )}
                                                            {step.extra}
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
                        <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground">
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
                                            className="w-full justify-start h-auto py-3 px-4"
                                            onClick={() => setSelectedApplicationId(app.id)}
                                        >
                                            <div className="text-left">
                                                <div className="font-medium">{app.company?.name ?? 'Unknown Company'}</div>
                                                <div className="text-xs text-muted-foreground">{app.quota?.job_title ?? 'No Position'}</div>
                                            </div>
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