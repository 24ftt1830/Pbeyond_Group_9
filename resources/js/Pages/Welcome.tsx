import { PageProps } from '@/types';
import IndexLayout from '@/Layouts/IndexLayout';

export default function Welcome({
    auth,
    laravelVersion,
    phpVersion,
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    return (
        <IndexLayout auth={auth}>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <h1 className="text-4xl font-bold">Welcome to my Application</h1>
                <p className="mt-4">content for the welcome page.</p>
            </div>
        </IndexLayout>
    );
}