import React from "react";

const Cart = ({ cartItems, setCartItems, removeFromCart }) => {
  // Calculate total price
  const totalPrice = cartItems.reduce((sum, item) => sum + parseFloat(item.price), 0).toFixed(2);

  return (
    <div style={{ marginTop: "30px" }}>
      <h2>Sepetiniz</h2>
      {cartItems.length === 0 ? (
        <p>Sepetiniz boş.</p>
      ) : (
        <div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Barkod</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Ürün Adı</th>
                <th style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #ddd" }}>Fiyat</th>
                <th style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #ddd" }}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "10px" }}>{item.barcode}</td>
                  <td style={{ padding: "10px" }}>{item.name}</td>
                  <td style={{ padding: "10px", textAlign: "right" }}>{parseFloat(item.price).toFixed(2)} TL</td>
                  <td style={{ padding: "10px", textAlign: "center" }}>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{
                        backgroundColor: "#f44336",
                        color: "white",
                        border: "none",
                        padding: "5px 10px",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      Kaldır
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="2" style={{ padding: "12px", fontWeight: "bold", textAlign: "right" }}>Toplam:</td>
                <td style={{ padding: "12px", fontWeight: "bold", textAlign: "right" }}>{totalPrice} TL</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
          
          <div style={{ marginTop: "20px", textAlign: "right" }}>
            <button
              onClick={() => {
                // Here you could send the cart to the server if needed
                alert(`Sipariş tamamlandı: ${cartItems.length} ürün, ${totalPrice} TL`);
                setCartItems([]);
              }}
              style={{
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              Siparişi Tamamla
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;