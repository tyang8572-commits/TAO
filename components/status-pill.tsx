import { cx } from "@/lib/format";

const styleMap: Record<string, string> = {
  报名中: "bg-brand-100 text-brand-700",
  已满: "bg-amber-100 text-amber-700",
  已开始: "bg-sky-100 text-sky-700",
  已结束: "bg-slate-200 text-slate-700",
  已取消: "bg-rose-100 text-rose-700",
  正式: "bg-brand-100 text-brand-700",
  候补: "bg-amber-100 text-amber-700",
  已取消报名: "bg-slate-200 text-slate-700"
};

export function StatusPill({ label }: { label: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        styleMap[label] || "bg-slate-100 text-slate-700"
      )}
    >
      {label}
    </span>
  );
}
