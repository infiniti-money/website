"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
export default function Dialog({
  title,
  close,
  children,
  drawer = false,
  wide = false,
}: {
  title: string;
  close: () => void;
  children: React.ReactNode;
  drawer?: boolean;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current,
      previous = document.activeElement as HTMLElement;
    el?.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
      previous?.focus?.();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`dialog ${drawer ? "drawer" : ""} ${wide ? "wide" : ""}`}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === ref.current) close();
      }}
      aria-label={title}
    >
      <motion.div
        initial={{ opacity: 0, y: drawer ? 0 : 15, x: drawer ? 30 : 0 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 0.22 }}
      >
        <div className="dialog-head">
          <h2>{title}</h2>
          <button className="icon-button" onClick={close} aria-label="Đóng">
            <X size={21} />
          </button>
        </div>
        {children}
      </motion.div>
    </dialog>
  );
}
