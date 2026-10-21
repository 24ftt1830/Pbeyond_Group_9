import { HTMLAttributes } from 'react';

export default function InputError({
    message,
    className = '',
    ...props
}: HTMLAttributes<HTMLParagraphElement> & { message?: string }) {
    return message ? (
        <p
            {...props}
            className={'text-sm leading-5 text-rose-600 ' + className}
        >
            {message}
        </p>
    ) : null;
}
