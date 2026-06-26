import { useState, useRef, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";

interface ActionMenuProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
  width?: string;
}

export default function ActionMenu({ trigger, children, align = "right", width = "min-w-[160px]" }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuHeight = menuRef.current?.offsetHeight || 200;
      const menuWidth = menuRef.current?.offsetWidth || 160;

      let top = rect.bottom + 4;
      let left = align === "right" ? rect.right - menuWidth : rect.left;

      if (top + menuHeight > window.innerHeight) {
        top = rect.top - menuHeight - 4;
      }
      if (left + menuWidth > window.innerWidth) {
        left = window.innerWidth - menuWidth - 8;
      }
      if (left < 0) left = 8;

      setPos({ top, left });
    }
  }, [open, align]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <>
      <div ref={triggerRef} data-dropdown-trigger onClick={() => setOpen((o) => !o)} className="cursor-pointer inline-flex">
        {trigger}
      </div>
      {open && createPortal(
        <div
          ref={menuRef}
          data-dropdown
          style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 9999 }}
          className={`${width} bg-white border border-gray-200 rounded-xl shadow-2xl py-1 text-left overflow-hidden`}
        >
          {children}
        </div>,
        document.body
      )}
    </>
  );
}
