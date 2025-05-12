import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { BrowserMultiFormatReader } from "@zxing/library";
import "../App.css";
import CurrentTime from "./CurrentTime";

const ProductScanner = () => {
  const scannerRef = useRef(null);
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [isCameraAvailable, setIsCameraAvailable] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [scannedBarcode, setScannedBarcode] = useState("");
  const [lastScannedBarcode, setLastScannedBarcode] = useState("");
  const [lastScanTime, setLastScanTime] = useState(0);
  const [productData, setProductData] = useState({
    barcode: "",
    name: "",
    price: "",
    quantity: 1
  });
  const [cartItems, setCartItems] = useState([]);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [processingBarcode, setProcessingBarcode] = useState(false);
  
  const SCAN_COOLDOWN = 3000; // Increase cooldown to 3 seconds

  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let selectedDeviceId;

    codeReader
      .listVideoInputDevices()
      .then(videoInputDevices => {
        if (videoInputDevices.length === 0) {
          setIsCameraAvailable(false);
          setIsLoading(false);
          throw new Error("No camera devices found");
        }

        selectedDeviceId = videoInputDevices[0].deviceId;
        return codeReader.decodeFromVideoDevice(selectedDeviceId, videoRef.current, (result, error) => {
          if (result && isCameraActive && !processingBarcode) {
            const barcode = result.getText();
            const currentTime = Date.now();
            
            if (barcode !== lastScannedBarcode || (currentTime - lastScanTime) > SCAN_COOLDOWN) {
              setProcessingBarcode(true); //
              setScannedBarcode(barcode);
              setLastScannedBarcode(barcode);
              setLastScanTime(currentTime);
              setIsCameraActive(false);
              lookupProductByBarcode(barcode);
            }
          }
        });
      })
      .catch(err => {
        console.error(err);
        setError("Kamera tapılmadı və ya icazə verilmədi.");
        setIsLoading(false);
      });

    return () => {
      codeReader.reset();
    };
  }, [isCameraActive, lastScannedBarcode, lastScanTime, processingBarcode]);

  const lookupProductByBarcode = async (barcode) => {
    try {
      setIsLookingUp(true);
      setError(null);

      const response = await axios.get("https://cart-backend-one.vercel.app/products");
      if (response.data && Array.isArray(response.data)) {
        const foundProduct = response.data.find(product => product.barcode === barcode);

                  if (foundProduct) {
          const productInfo = {
            barcode: foundProduct.barcode,
            name: foundProduct.name,
            price: foundProduct.price.toString(),
            quantity: 1
          };
          
          setProductData(productInfo);
          setScanResult(`Tapıldı: ${foundProduct.name}`);
          
          const existingItem = cartItems.find(item => item.barcode === foundProduct.barcode);
          if (existingItem) {
            setScanResult(`${foundProduct.name} artıq səbətdədir. Sayı: ${existingItem.quantity}`);
          } else {
            addProductToCart(productInfo);
          }
        } else {
          setProductData({ barcode, name: "", price: "", quantity: 1 });
          setScanResult(`Barkod ${barcode} üçün məhsul tapılmadı. Əl ilə əlavə et.`);
        }
      } else {
        setProductData({ barcode, name: "", price: "", quantity: 1 });
        setScanResult(`Skand edilmiş barkod: ${barcode}`);
      }
    } catch (err) {
      console.error("Məhsul axtarışında xəta:", err);
      setProductData({ barcode, name: "", price: "", quantity: 1 });
      setError(`Xəta baş verdi: ${err.message}`);
    } finally {
      setIsLookingUp(false);
      
  
      setTimeout(() => {
        setIsCameraActive(true);
        setProcessingBarcode(false); 
      }, SCAN_COOLDOWN); 
    }
  };

  const addProductToCart = (product) => {
    if (!product.barcode || !product.name || !product.price) {
      setError("Məhsul məlumatları tam deyil");
      return;
    }

    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.barcode === product.barcode);
      
      if (existingItemIndex !== -1) {
   
        const quantity = product.quantity || 1;
        
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: quantity 
        };
        setScanResult(`${product.name} səbətə yeniləndi`);
        return updatedItems;
      } else {
        const newItem = {
          id: Date.now(),
          barcode: product.barcode,
          name: product.name,
          price: parseFloat(product.price),
          quantity: product.quantity || 1
        };
        setScanResult(`${product.name} səbətə əlavə edildi`);
        return [...prevItems, newItem];
      }
    });
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    
    const existingItemIndex = cartItems.findIndex(item => item.barcode === productData.barcode);
    
    if (existingItemIndex !== -1) {
      const updatedItems = [...cartItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: parseInt(productData.quantity, 10) || 1
      };
      setCartItems(updatedItems);
      setScanResult(`${productData.name} sayı yeniləndi: ${productData.quantity}`);
    } else {
      addProductToCart(productData);
    }
    
    setProductData({
      barcode: "",
      name: "",
      price: "",
      quantity: 1
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleManualBarcodeSubmit = (e) => {
    e.preventDefault();
    const manualBarcode = e.target.elements.manualBarcode.value;
    if (manualBarcode) {
      setProcessingBarcode(true); 
      lookupProductByBarcode(manualBarcode);
      e.target.elements.manualBarcode.value = '';
    }
  };

  const removeFromCart = (itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0).toFixed(2);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="scanner-container">
      <div className="sc">
        <h2>Məhsul Skaneri</h2>
        <h2><CurrentTime /></h2>
      </div>

      <div className="main-content">
        {/* Camera Section */}
        <div className="camera-section">
          {isCameraAvailable && !error ? (
            <div ref={scannerRef} className="camera-container">
              <video ref={videoRef} className="camera-video" />

              {isLoading && (
                <div className="loading-indicator">
                  {/* Kamera başlatılıyor... */}
                </div>
              )}
            </div>
          ) : (
            <div className="camera-unavailable">
              <h3>Kamera Kullanılamıyor</h3>
              <p>Lütfen manuel barkod girişini kullanın veya kamera erişimini kontrol edin.</p>
            </div>
          )}

          <div className="status-message">
            {error ? (
              <p className="error-message">{error}</p>
            ) : isLoading && isCameraAvailable ? (
              <p>Kamera yükleniyor...</p>
            ) : isLookingUp ? (
              <p>Məhsul axtarılır...</p>
            ) : processingBarcode ? (
              <p>Barkod işlənir... Xahiş edirik gözləyin</p>
            ) : (
              <p>{scanResult || "Ürün taramak için kamerayı kullanın veya manuel barkod girişi yapın..."}</p>
            )}
          </div>

          <div>
            <h3>Manual Barkod Girişi</h3>
            <form onSubmit={handleManualBarcodeSubmit} className="manual-barcode-form">
              <input
                type="text"
                name="manualBarcode"
                placeholder="Barkod nömrəsini daxil edin"
                className="form-input manual-barcode-input"
              />
              <button type="submit" className="btn btn-primary">
                Axtar
              </button>
            </form>
          </div>
        </div>

        {/* Input Section */}
        <div className="input-section">
          <h3>Məhsul Məlumatları</h3>
          <form onSubmit={handleAddToCart} className="form-container">
            <div className="form-group">
              <label htmlFor="barcode" className="form-label">Barkod:</label>
              <input
                type="text"
                id="barcode"
                name="barcode"
                value={productData.barcode}
                placeholder="Barkod nömrəsi"
                className="form-input"
                readOnly
              />
            </div>

            <div className="form-group">
              <label htmlFor="name" className="form-label">Məhsulun Adı:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={productData.name}
                onChange={handleChange}
                placeholder="Məhsulun adı"
                className="form-input"
                readOnly
              />
            </div>

            <div className="form-group">
              <label htmlFor="price" className="form-label">Qiymət:</label>
              <input
                type="number"
                id="price"
                name="price"
                value={productData.price}
                onChange={handleChange}
                placeholder="Məhsulun qiyməti"
                className="form-input"
                readOnly
              />
            </div>

            <div className="form-group">
              <label htmlFor="quantity" className="form-label">Sayı:</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={productData.quantity}
                onChange={handleChange}
                placeholder="Məhsul sayı"
                className="form-input"
                min="1"
              />
            </div>

            <button type="submit" className="btn btn-success">
              Səbətə əlavə et
            </button>
          </form>
        </div>
      </div>

      {/* Shopping Cart */}
      <div className="cart-container">
        <h2>Səbət</h2>
        {cartItems.length === 0 ? (
          <p>Səbətiniz boşdur</p>
        ) : (
          <div>
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Barkod</th>
                  <th>Məhsulun Adı</th>
                  <th className="price-column">Qiymət</th>
                  <th className="quantity-column">Sayı</th>
                  <th className="total-column">Cəmi</th>
                  <th className="action-column">Əməliyyat</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id}>
                    <td data-label="Barkod">{item.barcode}</td>
                    <td data-label="Məhsulun Adı">{item.name}</td>
                    <td data-label="Qiymət" className="price-column">{parseFloat(item.price).toFixed(2)} Azn</td>
                    <td data-label="Sayı" className="quantity-column">
                      <div className="quantity-controls">
                        <button 
                          type="button" 
                          className="quantity-btn" 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="quantity-value">{item.quantity}</span>
                        <button 
                          type="button" 
                          className="quantity-btn" 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td data-label="Cəmi" className="total-column">
                      {(parseFloat(item.price) * item.quantity).toFixed(2)} Azn
                    </td>
                    <td data-label="Əməliyyat" className="action-column">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="btn btn-danger"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="cart-footer">
              <div className="cart-summary">
                <div className="cart-count">
                  Ümumi məhsul: {totalItems}
                </div>
                <div className="cart-total">
                  Ümumi məbləğ: {totalPrice} Azn
                </div>
              </div>
              <button
                onClick={() => {
                  alert(`Sifariş tamamlandı: ${totalItems} məhsul, ${totalPrice} Azn`);
                  clearCart();
                }}
                className="btn btn-success"
              >
                Sifarişi Tamamla
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductScanner;