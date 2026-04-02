declare module 'mina-scheduler' {
    import { ReactNode, ComponentType } from 'react';

    export interface Event {
        id: string;
        title: string;
        description?: string;
        startDate: Date;
        endDate: Date;
        variant?: 'primary' | 'danger' | 'success' | 'warning' | 'default';
        color?: string;
    }

    export interface SchedulerProviderProps {
        children: ReactNode;
        initialState?: Event[];
        onAddEvent?: (event: Event) => void;
        onUpdateEvent?: (event: Event) => void;
        onDeleteEvent?: (id: string) => void;
        weekStartsOn?: 'sunday' | 'monday';
    }

    export const SchedulerProvider: ComponentType<SchedulerProviderProps>;
    export const SchedularView: ComponentType<any>; // 'any' for now 
    export function useScheduler(): any;
}