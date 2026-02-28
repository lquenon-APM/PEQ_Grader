"use client";

import { type ReactNode } from "react";

interface FloatingActionButtonProps {
  onClick: () => void;
  icon: ReactNode;
  label: string;
}

export default function FloatingActionButton({
  onClick,
  icon,
  label,
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 flex items-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl active:scale-95 transition-all z-40"
      title={label}
    >
      {icon}
      <span className="font-semibold">{label}</span>
    </button>
  );
}
