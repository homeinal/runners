"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { LogIn, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") {
    return (
      <div className="size-10 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-border-dark dark:border-white animate-pulse" />
    );
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-2 bg-primary text-border-dark border-2 border-border-dark px-4 py-2 rounded-full font-bold text-sm shadow-(--shadow-neobrutalism-sm) hover:shadow-(--shadow-neobrutalism-hover) hover:translate-x-px hover:translate-y-px transition-all"
      >
        <LogIn size={16} />
        로그인
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="size-10 rounded-full border-2 border-border-dark dark:border-white overflow-hidden shadow-(--shadow-neobrutalism-sm) hover:shadow-(--shadow-neobrutalism-hover) hover:translate-x-px hover:translate-y-px transition-all"
      >
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || ""}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-primary flex items-center justify-center font-black text-border-dark">
            {(session.user.name || "U").charAt(0)}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-background-dark border-2 border-border-dark dark:border-white rounded-xl shadow-(--shadow-neobrutalism) p-2 z-50">
          <div className="px-3 py-2 border-b-2 border-border-dark/10 dark:border-white/10 mb-2">
            <p className="font-bold text-sm truncate">{session.user.name}</p>
            <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-red-500"
          >
            <LogOut size={16} />
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}

export function MobileUserMenu({ onNavigate }: { onNavigate?: () => void }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />;
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        onClick={onNavigate}
        className="w-full flex items-center justify-center gap-2 bg-primary text-border-dark border-2 border-border-dark px-4 py-3 rounded-xl font-bold text-sm shadow-(--shadow-neobrutalism-sm) transition-all"
      >
        <LogIn size={18} />
        로그인
      </Link>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="size-8 rounded-full border-2 border-border-dark dark:border-white overflow-hidden shrink-0">
          {session.user.image ? (
            <img src={session.user.image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-primary flex items-center justify-center font-black text-border-dark text-xs">
              {(session.user.name || "U").charAt(0)}
            </div>
          )}
        </div>
        <span className="font-bold text-sm truncate">{session.user.name}</span>
      </div>
      <button
        onClick={() => { signOut({ callbackUrl: "/" }); onNavigate?.(); }}
        className="flex items-center gap-1 text-red-500 text-sm font-bold shrink-0"
      >
        <LogOut size={14} />
        로그아웃
      </button>
    </div>
  );
}
