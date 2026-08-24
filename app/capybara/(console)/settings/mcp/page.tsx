import { getMcpToolsList } from "@/lib/queries";
import { McpManager } from "@/components/settings/mcp-manager";
import { PageHeader } from "@/components/page-header";
import { BotIcon } from "lucide-react";

export const metadata = { title: "MCP 工具" };

export default function McpSettingsPage() {
  const items = getMcpToolsList();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={<BotIcon />}
        title="MCP 工具"
        description="控制暴露给 MCP 客户端的内容工具开关"
      />
      <McpManager items={items} />
    </div>
  );
}
