"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  unitPrice: number;
  size: string | null;
  color: string | null;
  quantity: number;
  stock: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity: number) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  totalQuantity: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "caramelada-kids-cart";

export function cartItemKey(productId: string, size: string | null, color: string | null) {
  return [productId, size ?? "", color ?? ""].join("::");
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Lido após o mount (não no initializer) para evitar mismatch de hidratação SSR.
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // localStorage indisponível ou dado corrompido
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity: number) => {
      setItems((current) => {
        const key = cartItemKey(item.productId, item.size, item.color);
        const existing = current.find(
          (i) => cartItemKey(i.productId, i.size, i.color) === key
        );
        if (existing) {
          return current.map((i) =>
            cartItemKey(i.productId, i.size, i.color) === key
              ? { ...i, quantity: Math.min(i.quantity + quantity, i.stock) }
              : i
          );
        }
        return [...current, { ...item, quantity: Math.min(quantity, item.stock) }];
      });
    },
    []
  );

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setItems((current) =>
      current
        .map((i) =>
          cartItemKey(i.productId, i.size, i.color) === key
            ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) }
            : i
        )
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((current) =>
      current.filter((i) => cartItemKey(i.productId, i.size, i.color) !== key)
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const totalQuantity = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clear,
        totalQuantity,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de CartProvider");
  return ctx;
}
