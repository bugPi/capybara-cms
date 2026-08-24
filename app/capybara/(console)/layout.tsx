import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { ConsoleShell } from "@/components/console-shell";

export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/capybara/login");
  }

  return (
    <ConsoleShell
      user={{
        name: user.name,
        email: user.email,
        avatar: user.avatar ?? "",
      }}
    >
      {children}
    </ConsoleShell>
  );
}
