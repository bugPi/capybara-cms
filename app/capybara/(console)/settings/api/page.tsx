import { getApiKeysList, getWebhooksList } from "@/lib/queries";
import { ApiManager } from "@/components/settings/api-manager";
import { PageHeader } from "@/components/page-header";
import { KeyRoundIcon } from "lucide-react";

export const metadata = { title: "API 配置" };

export default function ApiSettingsPage() {
  const apiKeys = getApiKeysList();
  const webhooks = getWebhooksList();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={<KeyRoundIcon />}
        title="API 配置"
        description="管理 REST API 密钥与 Webhook 通知"
      />
      <ApiManager apiKeys={apiKeys} webhooks={webhooks} />
    </div>
  );
}
