export function SectionTag({ num, label }: { num: string; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-10">
      <div className="w-6 h-px bg-fd-green" />
      <span className="text-[10px] tracking-widest text-fd-green font-bold uppercase font-mono">
        {num} &mdash; {label}
      </span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}
