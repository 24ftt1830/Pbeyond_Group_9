import { useState, useEffect } from 'react';

export function useImageDataUrl(src: string) {
    const [dataUrl, setDataUrl] = useState<string | null>(null);

    useEffect(() => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0);
            setDataUrl(canvas.toDataURL('image/png'));
        };
        img.src = src;
    }, [src]);

    return dataUrl;
}