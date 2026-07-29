import { toast } from "@/components/ui/toast";

export function useToast() {
  const showToast = (
    title: string,
    description?: string,
    type: "success" | "info" | "warning" | "error" | "loading" = "info"
  ) => {
    return toast.add({
      title,
      description,
      type,
    });
  };

  return {
    toast: showToast,
    dismiss: (id: string) => {
      toast.close(id);
    },
  };
}
