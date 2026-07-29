import { create } from "zustand";

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  open: (options: {
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
  }) => void;
  close: () => void;
}

export const useConfirmStore = create<ConfirmDialogState>((set) => ({
  isOpen: false,
  title: "",
  description: "",
  onConfirm: () => {},
  onCancel: () => {},
  confirmText: "Confirm",
  cancelText: "Cancel",
  open: (options) =>
    set({
      isOpen: true,
      title: options.title,
      description: options.description,
      onConfirm: () => {
        options.onConfirm();
        set({ isOpen: false });
      },
      onCancel: () => {
        if (options.onCancel) options.onCancel();
        set({ isOpen: false });
      },
      confirmText: options.confirmText || "Confirm",
      cancelText: options.cancelText || "Cancel",
    }),
  close: () => set({ isOpen: false }),
}));

export function useConfirmDialog() {
  const { isOpen, title, description, onConfirm, onCancel, confirmText, cancelText, open, close } = useConfirmStore();
  return { isOpen, title, description, onConfirm, onCancel, confirmText, cancelText, open, close };
}
