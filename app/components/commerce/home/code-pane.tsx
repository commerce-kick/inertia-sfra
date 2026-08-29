import type React from "react";

/* Monochrome code inks (the band is always black, both themes). */
const INK = "text-[oklch(0.75_0_0)]";
const HI = "text-white";
const DIM = "text-[oklch(0.5_0_0)]";

function CodePane({
  file,
  runtime,
  children,
}: {
  file: string;
  runtime: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden border border-white/20">
      <div className="flex items-center justify-between gap-4 border-b border-white/20 px-4 py-2.5">
        <span className="meta-caps text-white">{file}</span>
        <span className="meta-caps text-[oklch(0.55_0_0)]">{runtime}</span>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed">
        {children}
      </pre>
    </div>
  );
}

export { CodePane, INK, HI, DIM };
