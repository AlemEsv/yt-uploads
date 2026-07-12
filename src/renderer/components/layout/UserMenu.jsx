import React from "react";
import { User } from "lucide-react";
import { useAppearance } from "../../context/AppearanceContext.jsx";

export default function UserMenu({ onSelectView }) {
  const { nombreUsuario } = useAppearance();

  return (
    <button
      type="button"
      onClick={() => onSelectView("settings")}
      title="Settings"
      className="flex items-center gap-2 glass rounded-[6px] px-3 h-[34px] border-none cursor-pointer"
    >
      <span className="w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 bg-[var(--color-accent)]">
        <User size={12} className="text-white" />
      </span>
      <span className="text-[14px] font-semibold text-[var(--color-text-primary)]">
        {nombreUsuario}
      </span>
    </button>
  );
}
