import AdminNavBar from "@/components/AdminNavBar";
import { getAuthSession } from "@/utils/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: {
    default: "Administración",
    template: "%s · Los Toneles",
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();

  if (!session?.user.isAdmin) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-sand/40">
      <div className="sticky top-0 z-40">
        <AdminNavBar />
      </div>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
