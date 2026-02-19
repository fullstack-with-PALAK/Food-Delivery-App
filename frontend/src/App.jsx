import React, { useState, lazy, Suspense } from "react";
import Navbar from "./components/Navbar/Navbar";
import { Route, Routes } from "react-router-dom";
import Footer from "./components/Footer/Footer";
import LoginPopup from "./components/LoginPopup/LoginPopup";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Lazy load pages for better performance
const Home = lazy(() => import("./pages/Home/Home"));
const Cart = lazy(() => import("./pages/Cart/Cart"));
const PlaceOrder = lazy(() => import("./pages/PlaceOrder/PlaceOrder"));
const Verify = lazy(() => import("./pages/Verify/Verify"));
const MyOrders = lazy(() => import("./pages/MyOrders/MyOrders"));
const NotificationsPage = lazy(() => import("./pages/Notifications/Notifications"));
const Preferences = lazy(() => import("./pages/Preferences/Preferences"));
const FoodDetail = lazy(() => import("./pages/FoodDetail/FoodDetail"));
const Search = lazy(() => import("./pages/Search/Search"));
const Wishlist = lazy(() => import("./pages/Wishlist/Wishlist"));
const UserProfile = lazy(() => import("./pages/Profile/UserProfile"));

// Loading component
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '60vh',
    fontSize: '18px',
    color: '#666'
  }}>
    Loading...
  </div>
);

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  return (
    <>
      {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : <></>}
      <div className="app">
        <ToastContainer />
        <Navbar setShowLogin={setShowLogin} />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order" element={<PlaceOrder />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/myorders" element={<MyOrders />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/preferences" element={<Preferences />} />
            <Route path="/food/:id" element={<FoodDetail />} />
            <Route path="/search" element={<Search />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/profile" element={<UserProfile />} />
          </Routes>
        </Suspense>
      </div>
      <Footer />
    </>
  );
};

export default App;
