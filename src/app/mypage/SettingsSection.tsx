"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface SettingsSectionProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

export function SettingsSection({ user }: SettingsSectionProps) {
  const [name, setName] = useState(user.name || "");
  const [image, setImage] = useState(user.image);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Handle name update
  const handleNameUpdate = async () => {
    if (!name.trim()) {
      showFeedback("error", "닉네임을 입력해주세요");
      return;
    }

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (res.ok) {
        setIsEditing(false);
        showFeedback("success", "닉네임이 변경되었습니다");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        showFeedback("error", "닉네임 변경에 실패했습니다");
      }
    } catch (error) {
      showFeedback("error", "네트워크 오류가 발생했습니다");
    }
  };

  // Handle avatar upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showFeedback("error", "이미지 파일만 업로드 가능합니다");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showFeedback("error", "파일 크기는 5MB 이하여야 합니다");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setImage(data.image);
        showFeedback("success", "프로필 사진이 변경되었습니다");
      } else {
        showFeedback("error", "사진 업로드에 실패했습니다");
      }
    } catch (error) {
      showFeedback("error", "네트워크 오류가 발생했습니다");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      const res = await fetch("/api/user/delete", { method: "DELETE" });
      if (res.ok) {
        window.location.href = "/";
      } else {
        showFeedback("error", "계정 삭제에 실패했습니다");
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      showFeedback("error", "네트워크 오류가 발생했습니다");
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="w-full">
      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`fixed top-4 right-4 p-4 border-2 border-black rounded-xl shadow-(--shadow-neobrutalism) z-50 font-bold ${
            feedback.type === "success"
              ? "bg-primary text-black"
              : "bg-red-500 text-white"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Settings Card */}
      <div className="p-6 bg-white dark:bg-background-dark border-3 border-black dark:border-white rounded-2xl shadow-(--shadow-neobrutalism)">
        <h2 className="text-2xl font-black uppercase mb-6">계정 설정</h2>

        {/* Profile Picture Section */}
        <div className="flex items-start gap-6 mb-6 pb-6 border-b-2 border-gray-200 dark:border-gray-700">
          <div className="relative">
            <div className="size-24 rounded-full bg-gray-200 dark:bg-gray-700 border-3 border-black dark:border-white flex items-center justify-center overflow-hidden shrink-0">
              {image ? (
                <Image
                  src={image}
                  alt="프로필 사진"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-black text-gray-600 dark:text-gray-300">
                  {(name || "러너").charAt(0)}
                </span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          <div className="flex-1">
            <p className="text-sm font-bold text-gray-500 uppercase mb-2">프로필 사진</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2 bg-primary text-black font-black text-sm uppercase border-2 border-black rounded-lg shadow-(--shadow-neobrutalism-sm) transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? "업로드 중..." : "사진 변경"}
            </button>
            <p className="text-xs text-gray-500 mt-2">
              JPG, PNG 파일 (최대 5MB)
            </p>
          </div>
        </div>

        {/* Name/Nickname Section */}
        <div className="mb-6 pb-6 border-b-2 border-gray-200 dark:border-gray-700">
          <p className="text-sm font-bold text-gray-500 uppercase mb-2">닉네임</p>
          {isEditing ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 px-4 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-background-dark font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="닉네임을 입력하세요"
              />
              <button
                onClick={handleNameUpdate}
                className="px-4 py-2 bg-primary text-black font-black text-sm uppercase border-2 border-black rounded-lg shadow-(--shadow-neobrutalism-sm) transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
              >
                저장
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setName(user.name || "");
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-black dark:text-white font-black text-sm uppercase border-2 border-black dark:border-white rounded-lg shadow-(--shadow-neobrutalism-sm) transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
              >
                취소
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <p className="text-xl font-black">{name || "러너"}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-black dark:text-white font-bold text-sm border-2 border-black dark:border-white rounded-lg shadow-(--shadow-neobrutalism-sm) transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
              >
                편집
              </button>
            </div>
          )}
        </div>

        {/* Email Section (Read-only) */}
        <div className="mb-6 pb-6 border-b-2 border-gray-200 dark:border-gray-700">
          <p className="text-sm font-bold text-gray-500 uppercase mb-2">이메일</p>
          <p className="text-lg font-bold text-gray-700 dark:text-gray-300">{user.email}</p>
        </div>

        {/* Danger Zone - Account Deletion */}
        <div>
          <p className="text-sm font-bold text-red-600 uppercase mb-2">위험 구역</p>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-500 text-white font-black text-sm uppercase border-2 border-black rounded-lg shadow-(--shadow-neobrutalism-sm) transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
            >
              계정 삭제
            </button>
          ) : (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg">
              <p className="font-bold text-red-700 dark:text-red-300 mb-3">
                정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-600 text-white font-black text-sm uppercase border-2 border-black rounded-lg shadow-(--shadow-neobrutalism-sm) transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                >
                  삭제 확인
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-black dark:text-white font-black text-sm uppercase border-2 border-black dark:border-white rounded-lg shadow-(--shadow-neobrutalism-sm) transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
