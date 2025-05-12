import React from 'react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import Cart from './components/Cart';
import ProductScanner from './components/ProductScanner';
import Checkout from './components/Checkout';

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <ProductScanner />
        {/* <Cart /> */}
        {/* <Checkout /> */}
      </div>
    </Provider>
  );
}

export default App;
