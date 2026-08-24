import { getSettingsMap } from "@/lib/queries";
import { GeneralSettingsForm } from "@/components/settings/general-form";
import { PageHeader } from "@/components/page-header";
import { SettingsIcon } from "lucide-react";

export const metadata = { title: "常规设置" };

export default function GeneralSettingsPage() {
  const settings = getSettingsMap();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={<SettingsIcon />}
        title="常规设置"
        description="站点基本信息与 SEO 相关配置"
      />
      <div className="max-w-xl">
        <GeneralSettingsForm initial={settings} />
      </div>
    </div>
  );
}
