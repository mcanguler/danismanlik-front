import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { ROLES } from "@/lib/auth";
import { useAuth } from "@/lib/auth-hooks";
import { toast } from "@/components/ui/toast";
import { useAddCartItem } from "@/lib/products";

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

/**
 * Anasayfa kartlarındaki hızlı sepete ekleme akışı: giriş/rol kontrolü,
 * cart API çağrısı ve toast yönetimi tek yerde toplanır.
 */
export function useAddToCart() {
  const router = useRouter();
  const { status, user } = useAuth();
  const addCartItem = useAddCartItem();

  const addToCart = async (payload, { title, successDescription } = {}) => {
    if (status === "loading") return false;

    if (status === "unauthenticated") {
      toast.add({
        title: "Giriş gerekli",
        description: "Sepete eklemek için lütfen giriş yapın.",
        type: "info",
      });
      router.push("/login");
      return false;
    }

    if (user?.role !== ROLES.CUSTOMER) {
      toast.add({
        title: "Sepete eklenemedi",
        description: "Sepete eklemek için müşteri hesabıyla giriş yapmalısınız.",
        type: "error",
      });
      return false;
    }

    try {
      await addCartItem.mutateAsync(payload);
      toast.add({
        title: "Sepete eklendi",
        description:
          successDescription ?? (title ? `${title} sepetinize eklendi.` : undefined),
        type: "success",
      });
      return true;
    } catch (error) {
      toast.add({
        title: "Sepete eklenemedi",
        description: getErrorMessage(error),
        type: "error",
      });
      return false;
    }
  };

  return { addToCart, isPending: addCartItem.isPending };
}
