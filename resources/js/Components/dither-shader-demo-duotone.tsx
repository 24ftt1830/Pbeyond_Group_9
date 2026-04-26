import { DitherShader } from "@/Components/ui/dither-shader";
import bridge from '../../images/bridge-cropped-top.png';

export default function DitherShaderDemoDuotone() {
  return (
    <div className="h-full w-full relative">
      <DitherShader
        src={bridge}
        gridSize={1}
        ditherMode="bayer"
        colorMode="duotone"
        primaryColor="#f5f5f5"
        secondaryColor="#214cf1"
        threshold={0.45}
        className="h-full w-full object-cover object-bottom"
      />

      {/* Text Box Overlay */}
      <div
        className="absolute top-10 left-10 max-w-sm"
      >
        <p className="text-xl font-libre text-background leading-snug">
          Bridging the gap between<br />
          emerging talent and<br />
          industry demand
        </p>
      </div>
    </div>
  );
}