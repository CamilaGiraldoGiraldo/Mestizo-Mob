import React from "react";
import { useCart } from "../../context/CartContext";
import "./CartDrawer.css";

function CartDrawer({ isOpen, close }) {
  const {
    cart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    totalPrice,
  } = useCart();

  return (
    <>
      {/* Overlay */}
      <div
        className={`cart-overlay ${isOpen ? "open" : ""}`}
        onClick={close}
      />

      {/* Drawer */}
      <div className={`cart-drawer ${isOpen ? "open" : ""}`}>
        <button className="close-btn" onClick={close}>
          ×
        </button>

        <div className="cart-items">
          {cart.length === 0 ? (
            <p className="empty">El carrito está vacío</p>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="cart-item">
                <img
                  src={item.imagen || "https://via.placeholder.com/80"}
                  alt={item.nombre}
                  className="cart-item-img"
                />

                <div className="item-info">
                  <span className="item-name">{item.nombre}</span>

                  <div className="quantity-control">
                    <button onClick={() => decreaseQuantity(item.id)}>
                      −
                    </button>

                    <span>{item.cantidad}</span>

                    <button onClick={() => increaseQuantity(item.id)}>
                      +
                    </button>
                  </div>

                  <span className="item-price">
                    ${(item.precio * item.cantidad).toLocaleString()}
                  </span>
                </div>

                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id)}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <h3>Total: ${totalPrice.toLocaleString()}</h3>
            <button className="checkout-btn">Comprar</button>
          </div>
        )}
      </div>
    </>
  );
}

export default CartDrawer;