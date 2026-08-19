import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import api, { BACKEND_URL, setUnauthorizedHandler } from "../utils/api";
import { getEffectivePrice } from "../utils/price";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const url = BACKEND_URL;
  const [token, setToken] = useState("");
  const [food_list, setFoodList] = useState([]);
  const [loadingFoodList, setLoadingFoodList] = useState(true);
  const [search, setSearch] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);

  const addToCart = async (itemId) => {
    const item = food_list.find((food) => food._id === itemId);
    if (item && !item.inStock) {
      toast.error("This item is currently out of stock");
      return;
    }
    setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
    if (token) {
      try {
        const response = await api.post("/api/cart/add", { itemId });
        if (!response.data.success) {
          toast.error("Something went wrong");
        }
      } catch (error) {
        // errors are surfaced globally by the api interceptor
      }
    }
  };

  const removeFromCart = async (itemId, removeAll = false) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: removeAll ? 0 : Math.max((prev[itemId] || 0) - 1, 0),
    }));
    if (token) {
      try {
        const response = await api.post("/api/cart/remove", { itemId, removeAll });
        if (!response.data.success) {
          toast.error("Something went wrong");
        }
      } catch (error) {
        // errors are surfaced globally by the api interceptor
      }
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        const itemInfo = food_list.find((product) => product._id === item);
        if (itemInfo) {
          totalAmount += getEffectivePrice(itemInfo) * cartItems[item];
        }
      }
    }
    return totalAmount;
  };

  const getDiscountAmount = () => {
    if (!appliedPromo) return 0;
    return Math.round(getTotalCartAmount() * (appliedPromo.discountPercent / 100) * 100) / 100;
  };

  const applyPromoCode = async (code) => {
    try {
      const response = await api.post("/api/promo/validate", {
        code,
        subtotal: getTotalCartAmount(),
      });
      if (response.data.success) {
        setAppliedPromo({ code: response.data.code, discountPercent: response.data.discountPercent });
        toast.success("Promo code applied");
      } else {
        setAppliedPromo(null);
        toast.error(response.data.message);
      }
    } catch (error) {
      // errors are surfaced globally by the api interceptor
    }
  };

  const removePromoCode = () => setAppliedPromo(null);

  const fetchFoodList = async () => {
    setLoadingFoodList(true);
    try {
      const response = await api.get("/api/food/list?limit=200");
      if (response.data.success) {
        setFoodList(response.data.data);
      } else {
        toast.error("Unable to load menu items");
      }
    } catch (error) {
      // errors are surfaced globally by the api interceptor
    } finally {
      setLoadingFoodList(false);
    }
  };

  const loadCardData = async (userToken) => {
    try {
      const response = await api.post(
        "/api/cart/get",
        {},
        { headers: { token: userToken } }
      );
      if (response.data.success) {
        setCartItems(response.data.cartData);
      }
    } catch (error) {
      // errors are surfaced globally by the api interceptor
    }
  };

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setToken("");
      setCartItems({});
    });
    async function loadData() {
      await fetchFoodList();
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        await loadCardData(storedToken);
      }
    }
    loadData();
  }, []);

  const contextValue = {
    food_list,
    loadingFoodList,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    getDiscountAmount,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    search,
    setSearch,
    url,
    token,
    setToken,
  };
  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};
export default StoreContextProvider;
