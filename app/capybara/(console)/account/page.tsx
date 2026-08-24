import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { ChangePasswordForm } from "@/components/change-password-form";
import { PageHeader } from "@/components/page-header";
import { KeyRoundIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "账号设置" };

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/capybara/login");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={<KeyRoundIcon />}
        title="账号设置"
        description="修改登录密码。密码使用 scrypt 加盐哈希存储。"
      />
      <div className="max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">修改密码</CardTitle>
            <CardDescription>
              {user.name}（{user.email}）
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
