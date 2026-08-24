import { getUsersList } from "@/lib/queries";
import { UserManager } from "@/components/user-manager";

export const metadata = { title: "用户管理" };

export default function UsersPage() {
  const items = getUsersList();
  return <UserManager items={items} />;
}
