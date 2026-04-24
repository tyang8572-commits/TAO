import { PhoneQueryForm } from "@/components/phone-query-form";

export default function MyRegistrationsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-ink">我的报名</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">不用登录，输入姓名即可查询自己所有活动的报名记录。</p>
      </div>
      <PhoneQueryForm />
    </div>
  );
}
