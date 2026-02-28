import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    productName: "",
  });

  // 🔹 Abrir y cerrar manualmente
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  // 🔹 Agregar producto SIN abrir carrito automáticamente
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, cantidad: item.cantidad + product.cantidad }
            : item
        );
      }

      return [...prev, product];
    });

    // 🔔 Notificación elegante
    setToast({
      visible: true,
      productName: product.nombre,
    });

    setTimeout(() => {
      setToast({ visible: false, productName: "" });
    }, 2500);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const increaseQuantity = (id) => {
    setCart(
      cart.map((item) =>
        item.id === id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCart(
      cart.map((item) =>
        item.id === id && item.cantidad > 1
          ? { ...item, cantidad: item.cantidad - 1 }
          : item
      )
    );
  };

  const totalPrice = cart.reduce(
    (total, item) => total + item.precio * item.cantidad,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        totalPrice,
        isOpen,
        openCart,
        closeCart,
        toast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);