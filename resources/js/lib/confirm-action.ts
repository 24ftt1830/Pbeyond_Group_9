type ConfirmationOptions = { title?: string; confirmLabel?: string; destructive?: boolean };
type ConfirmationRequest = ConfirmationOptions & {
    id: number;
    message: string;
    trigger: HTMLElement | null;
    resolve: (confirmed: boolean) => void;
};

let nextId = 0;
const requests: ConfirmationRequest[] = [];
const subscribers = new Set<() => void>();
const notify = () => subscribers.forEach((subscriber) => subscriber());

/** The shared visual equivalent of a browser confirmation. No action runs until accepted. */
export function confirmAction(message: string, options: ConfirmationOptions = {}): Promise<boolean> {
    return new Promise((resolve) => {
        requests.push({
            ...options,
            destructive: options.destructive ?? /\b(delete|remove|reject|decline|cancel|close)\b/i.test(message),
            id: ++nextId,
            message,
            trigger: document.activeElement instanceof HTMLElement ? document.activeElement : null,
            resolve,
        });
        notify();
    });
}

export function subscribeToConfirmations(subscriber: () => void) {
    subscribers.add(subscriber);
    return () => { subscribers.delete(subscriber); };
}

export const currentConfirmation = () => requests[0] ?? null;

export function answerConfirmation(id: number, confirmed: boolean) {
    if (requests[0]?.id !== id) return;
    requests.shift()!.resolve(confirmed);
    notify();
}

export function cancelConfirmations() {
    requests.splice(0).forEach((request) => request.resolve(false));
    notify();
}
