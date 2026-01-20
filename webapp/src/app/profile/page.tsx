import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ProfileContent } from "@/components/profile/profile-content";

export const metadata: Metadata = {
  title: "프로필 - Book Writing AI",
  description: "사용자 프로필 관리",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">프로필</h1>
            <ProfileContent user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}
