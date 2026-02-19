import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const url = "https://food-delivery-backend-5b6g.onrender.com";
  const [token, setToken] = useState("");
  const [food_list, setFoodList] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);

  const addToCart = async (itemId) => {
    if (!cartItems[itemId]) {
      setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
    } else {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    }
    if (token) {
      const response=await axios.post(
        url + "/api/cart/add",
        { itemId },
        { headers: { token } }
      );
      if(response.data.success){
        toast.success("item Added to Cart")
      }else{
        toast.error("Something went wrong")
      }
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    if (token) {
      const response= await axios.post(
        url + "/api/cart/remove",
        { itemId },
        { headers: { token } }
      );
      if(response.data.success){
        toast.success("item Removed from Cart")
      }else{
        toast.error("Something went wrong")
      }
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = food_list.find((product) => product._id === item);
        totalAmount += itemInfo.price * cartItems[item];
      }
    }
    return totalAmount;
  };

  const fetchFoodList = async () => {
    const response = await axios.get(url + "/api/food/list");
    if (response.data.success) {
      setFoodList(response.data.data);
    } else {
      alert("Error! Products are not fetching..");
    }
  };

  const loadCardData = async (token) => {
    const response = await axios.post(
      url + "/api/cart/get",
      {},
      { headers: { token } }
    );
    setCartItems(response.data.cartData);
  };

  const fetchWishlist = async (authToken = token) => {
    if (!authToken) return [];
    try {
      const response = await axios.get(url + "/api/wishlist", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.data.success) {
        setWishlistItems(response.data.wishlist || []);
        return response.data.wishlist || [];
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    }
    return [];
  };

  const addToWishlist = async (foodId) => {
    if (!token) {
      toast.error("Please login to add to wishlist");
      return false;
    }
    try {
      const response = await axios.post(
        url + `/api/wishlist/${foodId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        if (response.data.wishlist) {
          setWishlistItems(response.data.wishlist);
        } else {
          await fetchWishlist();
        }
        toast.success(response.data.message || "Added to wishlist");
        return true;
      }
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
      toast.error("Failed to add to wishlist");
    }
    return false;
  };

  const removeFromWishlist = async (foodId) => {
    if (!token) {
      toast.error("Please login to manage wishlist");
      return false;
    }
    try {
      const response = await axios.delete(url + `/api/wishlist/${foodId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        if (response.data.wishlist) {
          setWishlistItems(response.data.wishlist);
        } else {
          setWishlistItems((prev) => prev.filter((item) => item._id !== foodId));
        }
        toast.success(response.data.message || "Removed from wishlist");
        return true;
      }
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
      toast.error("Failed to remove from wishlist");
    }
    return false;
  };

  useEffect(() => {
    async function loadData() {
      await fetchFoodList();
      if (localStorage.getItem("token")) {
        const storedToken = localStorage.getItem("token");
        setToken(storedToken);
        await loadCardData(storedToken);
        await fetchWishlist(storedToken);
      }
    }
    loadData();
  }, []);

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
    wishlistItems,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
  };
  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};
export default StoreContextProvider;
