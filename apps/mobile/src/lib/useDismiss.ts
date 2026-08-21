import { useCallback } from "react";
import { router } from "expo-router";

/**
 * Cierra la pantalla actual de forma segura. En modales `dismiss()` es lo
 * correcto; si no hay modal que descartar (o la ruta no forma parte de un
 * stack modal) cae a `back()`. Evita el caso en que `back()` no hace nada
 * porque el modal no tiene pantalla previa en su propio stack.
 */
export function useDismiss() {
  return useCallback(() => {
    if (router.canDismiss()) {
      router.dismiss();
    } else if (router.canGoBack()) {
      router.back();
    }
  }, []);
}
