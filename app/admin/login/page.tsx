import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin-login-form";
import { isAdminAuthenticated } from "@/lib/auth";

export default function AdminLoginPage() {
  if (isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 items-center">
      <AdminLoginForm />
    </div>
  );
}
