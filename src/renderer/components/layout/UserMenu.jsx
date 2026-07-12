import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, User } from "lucide-react";
import { useAppearance } from "../../context/AppearanceContext.jsx";

const MENU_ITEMS = [
  { id: "stats", label: "Statistics" },
  { id: "settings", label: "Settings" },
];

export default function UserMenu({ activeView, onSelectView }) {
  const { nombreUsuario } = useAppearance();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 glass rounded-[6px] px-3 h-[34px] border-none cursor-pointer"
      >
        <span className="w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 bg-[var(--color-accent)]">
          <User size={12} className="text-white" />
        </span>
        <span className="text-[14px] font-semibold text-white">{nombreUsuario}</span>
        <ChevronDown size={14} className="text-white" />
      </button>

      {open && (
        <div className="popover-in absolute top-full right-0 mt-2 glass border border-white/10 rounded-[8px] min-w-[200px] overflow-hidden z-[2000]">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectView(item.id);
                setOpen(false);
              }}
              className={`block w-full text-left px-4 py-2.5 text-[13px] border-none cursor-pointer transition-colors ${
                activeView === item.id
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-transparent text-white hover:bg-white/10"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
