import "./CartToast.css";

export default function CartToast({ visible, productName }) {
  return (
    <div className={`cart-toast ${visible ? "show" : ""}`}>
      <div className="toast-content">
        <span className="toast-check">✓</span>
        <div>
          <p className="toast-title">Añadido al carrito</p>
          <p className="toast-product">{productName}</p>
        </div>
      </div>
    </div>
  );
}