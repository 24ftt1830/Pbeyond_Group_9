import { useImageDataUrl } from '@/hooks/use-image-data-url';
import { DitherShader } from '@/Components/ui/dither-shader';

interface DitherImageProps {
    src: string;
    className?: string;
}

export default function DitherImage({ src, className }: DitherImageProps) {
    const dataUrl = useImageDataUrl(src);

    if (!dataUrl) {
        return <div className={`bg-zinc-50 animate-pulse ${className}`} />;
    }

    return (
        <DitherShader
            key={dataUrl}
            src={dataUrl}
            gridSize={3}
            ditherMode="bayer"
            colorMode="duotone"
            primaryColor="#214cf1"
            secondaryColor="#ffffff"
            threshold={0.4}
            objectFit="contain"
            className={className}
        />
    );
}