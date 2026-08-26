import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { OrdersProvider } from './context/OrdersContext';
import { ProductsProvider } from './context/ProductsContext';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ScrollToSection } from './components/ScrollToSection';
import { ChatWidget } from './components/ChatWidget';
import { UserRoute } from './components/UserRoute';
import { RequireAuth } from './components/UserRoute';
import { Home } from './pages/Home';
import { layout } from './config/site';
import './App.css';
import { ProductListing } from './pages/ProductListing';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { OrderHistory } from './pages/OrderHistory';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { OtpLogin } from './pages/OtpLogin';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <OrdersProvider>
          <ProductsProvider>
            <Router>
              <div className="app">
                <Header />
                {layout.showBottomNav && <BottomNav />}
                <main>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route
                      path="/products"
                      element={
                        <RequireAuth>
                          <ProductListing />
                        </RequireAuth>
                      }
                    />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route
                      path="/cart"
                      element={
                        <RequireAuth>
                          <Cart />
                        </RequireAuth>
                      }
                    />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/otp" element={<OtpLogin />} />
                    <Route
                      path="/checkout"
                      element={
                        <UserRoute>
                          <Checkout />
                        </UserRoute>
                      }
                    />
                    <Route
                      path="/order/:id"
                      element={
                        <UserRoute>
                          <OrderConfirmation />
                        </UserRoute>
                      }
                    />
                    <Route
                      path="/account/orders"
                      element={
                        <UserRoute>
                          <OrderHistory />
                        </UserRoute>
                      }
                    />
                    <Route
                      path="/account/profile"
                      element={
                        <UserRoute>
                          <Profile />
                        </UserRoute>
                      }
                    />
                  </Routes>
                </main>
                <footer className="footer">
                  <div className="footer-content">
                    <p>&copy; 2026 ShopEasy. All rights reserved.</p>
                    <nav>
                      <a href="/#privacy">Privacy</a>
                      <a href="/#terms">Terms</a>
                      <a href="/#contact">Contact</a>
                    </nav>
                  </div>
                </footer>
                <ChatWidget />
                <ScrollToSection />
              </div>
            </Router>
          </ProductsProvider>
        </OrdersProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;