import { PhoneQueryForm } from "@/components/phone-query-form";

export default function MyRegistrationsPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-[28px] border border-white/80 bg-white p-5 shadow-card">
        <h1 className="text-2xl font-bold text-ink">我的报名</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">不用登录，输入姓名即可查询自己所有活动的报名记录，适合直接在手机里快速确认自己有没有报上。</p>
      </div>
      <PhoneQueryForm />
    </div>
  );
}
