"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ProfileUpdateFormData,
  ChangePasswordFormData,
  FormValidationError,
} from "@/types/auth";

interface ProfileContentProps {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    emailVerified: Date | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

export function ProfileContent({ user }: ProfileContentProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"info" | "password">("info");

  // 프로필 정보 상태
  const [profileData, setProfileData] = useState<ProfileUpdateFormData>({
    name: user.name,
    image: user.image || undefined,
  });
  const [profileErrors, setProfileErrors] = useState<FormValidationError>({});
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  // 비밀번호 변경 상태
  const [passwordData, setPasswordData] = useState<ChangePasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<FormValidationError>({});
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  // 프로필 정보 업데이트
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage("");

    const newErrors: FormValidationError = {};

    if (!profileData.name || profileData.name.length < 2) {
      newErrors.name = "이름은 최소 2자 이상이어야 합니다.";
    }

    setProfileErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsProfileLoading(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        setProfileMessage(data.error || "프로필 업데이트에 실패했습니다.");
        return;
      }

      setProfileMessage("프로필이 성공적으로 업데이트되었습니다.");
      router.refresh();
    } catch (error) {
      console.error("Profile update error:", error);
      setProfileMessage("프로필 업데이트 중 오류가 발생했습니다.");
    } finally {
      setIsProfileLoading(false);
    }
  };

  // 비밀번호 변경
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage("");

    const newErrors: FormValidationError = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "현재 비밀번호를 입력해주세요.";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "새 비밀번호를 입력해주세요.";
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "비밀번호는 최소 8자 이상이어야 합니다.";
    }

    if (!passwordData.confirmNewPassword) {
      newErrors.confirmNewPassword = "비밀번호 확인을 입력해주세요.";
    } else if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      newErrors.confirmNewPassword = "비밀번호가 일치하지 않습니다.";
    }

    setPasswordErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsPasswordLoading(true);

    try {
      const response = await fetch("/api/user/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPasswordMessage(data.error || "비밀번호 변경에 실패했습니다.");
        return;
      }

      setPasswordMessage("비밀번호가 성공적으로 변경되었습니다.");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (error) {
      console.error("Password change error:", error);
      setPasswordMessage("비밀번호 변경 중 오류가 발생했습니다.");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div>
      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("info")}
            className={`${
              activeTab === "info"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            기본 정보
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`${
              activeTab === "password"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            비밀번호 변경
          </button>
        </nav>
      </div>

      {/* 기본 정보 탭 */}
      {activeTab === "info" && (
        <div className="space-y-6">
          {profileMessage && (
            <div
              className={`rounded-md p-4 ${
                profileMessage.includes("성공")
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              <p className="text-sm">{profileMessage}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">
                이메일은 변경할 수 없습니다.
              </p>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    profileErrors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={isProfileLoading}
                />
                {profileErrors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {profileErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  가입일
                </label>
                <input
                  type="text"
                  value={formatDate(user.createdAt)}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일 인증 상태
                </label>
                <div className="flex items-center">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.emailVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {user.emailVerified ? "인증됨" : "미인증"}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProfileLoading}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProfileLoading ? "업데이트 중..." : "프로필 업데이트"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 비밀번호 변경 탭 */}
      {activeTab === "password" && (
        <div className="space-y-6">
          {passwordMessage && (
            <div
              className={`rounded-md p-4 ${
                passwordMessage.includes("성공")
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              <p className="text-sm">{passwordMessage}</p>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                현재 비밀번호
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  passwordErrors.currentPassword
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="••••••••"
                disabled={isPasswordLoading}
              />
              {passwordErrors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {passwordErrors.currentPassword}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                새 비밀번호
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  passwordErrors.newPassword
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="••••••••"
                disabled={isPasswordLoading}
              />
              {passwordErrors.newPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {passwordErrors.newPassword}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                최소 8자 이상, 영문 대소문자, 숫자, 특수문자 포함
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                새 비밀번호 확인
              </label>
              <input
                type="password"
                value={passwordData.confirmNewPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmNewPassword: e.target.value,
                  })
                }
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  passwordErrors.confirmNewPassword
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="••••••••"
                disabled={isPasswordLoading}
              />
              {passwordErrors.confirmNewPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {passwordErrors.confirmNewPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPasswordLoading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPasswordLoading ? "변경 중..." : "비밀번호 변경"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
