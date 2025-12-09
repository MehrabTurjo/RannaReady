import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import ForgotPassword from "./pages/ForgotPassword";
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import { useDispatch, useSelector } from "react-redux";
import Home from "./pages/Home";
import useGetCity from "./hooks/useGetCity";
import useGetMyshop from "./hooks/useGetMyShop";
import CreateEditShop from "./pages/CreateEditShop";
import AddItem from "./pages/AddItem";
import EditItem from "./pages/EditItem";
import useGetShopByCity from "./hooks/useGetShopByCity";
import useGetItemsByCity from "./hooks/useGetItemsByCity";
import CartPage from "./pages/CartPage";
import CheckOut from "./pages/CheckOut";
import OrderPlaced from "./pages/OrderPlaced";
import MyOrders from "./pages/MyOrders";
import useGetMyOrders from "./hooks/useGetMyOrders";
import useUpdateLocation from "./hooks/useUpdateLocation";
import TrackOrderPage from "./pages/TrackOrderPage";
import Shop from "./pages/Shop";
import CreateWeeklyMenu from "./pages/CreateWeeklyMenu";
import EditWeeklyMenu from "./pages/EditWeeklyMenu";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import PendingOwners from "./pages/PendingOwners";
import PendingRiders from "./pages/PendingRiders";

// FIX 1: Import the OwnerDashboard component
import OwnerDashboard from "./components/OwnerDashboard";

import { useEffect } from "react";
import { io } from "socket.io-client";
import { setSocket } from "./redux/userSlice";

export const serverUrl = "http://localhost:8000";

function App() {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useGetCurrentUser();
  useUpdateLocation();
  useGetCity();
  useGetMyshop();
  useGetShopByCity();
  useGetItemsByCity();
  useGetMyOrders();

  useEffect(() => {
    if (!userData?._id) return;

    const socketInstance = io(serverUrl, { withCredentials: true });
    dispatch(setSocket(socketInstance));

    socketInstance.on("connect", () => {
      console.log("🔌 Socket connected for user:", userData._id);
      socketInstance.emit("identity", { userId: userData._id });
    });

    socketInstance.on("disconnect", () => {
      console.log("🔌 Socket disconnected");
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [userData?._id, dispatch]);

  return (
    <Routes>
      <Route
        path="/signup"
        element={!userData ? <SignUp /> : <Navigate to={"/"} />}
      />
      <Route
        path="/signin"
        element={!userData ? <SignIn /> : <Navigate to={"/"} />}
      />
      <Route
        path="/forgot-password"
        element={!userData ? <ForgotPassword /> : <Navigate to={"/"} />}
      />

      {/* Admin Routes */}
      <Route
        path="/admin/login"
        element={
          !userData || userData.role !== "admin" ? (
            <AdminLogin />
          ) : (
            <Navigate to={"/admin/dashboard"} />
          )
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          userData?.role === "admin" ? (
            <AdminDashboard />
          ) : (
            <Navigate to={"/admin/login"} />
          )
        }
      />
      <Route
        path="/admin/pending-owners"
        element={
          userData?.role === "admin" ? (
            <PendingOwners />
          ) : (
            <Navigate to={"/admin/login"} />
          )
        }
      />
      <Route
        path="/admin/pending-riders"
        element={
          userData?.role === "admin" ? (
            <PendingRiders />
          ) : (
            <Navigate to={"/admin/login"} />
          )
        }
      />

      <Route
        path="/"
        element={userData ? <Home /> : <Navigate to={"/signin"} />}
      />

      {/* FIX 2: Add the explicit route for Owner Dashboard */}
      <Route
        path="/owner-dashboard"
        element={userData ? <OwnerDashboard /> : <Navigate to={"/signin"} />}
      />

      <Route
        path="/create-edit-shop"
        element={userData ? <CreateEditShop /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/add-item"
        element={userData ? <AddItem /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/edit-item/:itemId"
        element={userData ? <EditItem /> : <Navigate to={"signin"} />}
      />

      <Route
        path="/create-weekly-menu"
        element={userData ? <CreateWeeklyMenu /> : <Navigate to={"signin"} />}
      />
      <Route
        path="/edit-weekly-menu/:menuId"
        element={userData ? <EditWeeklyMenu /> : <Navigate to={"signin"} />}
      />

      <Route
        path="/cart"
        element={userData ? <CartPage /> : <Navigate to={"signin"} />}
      />
      <Route
        path="/checkout"
        element={userData ? <CheckOut /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/order-placed"
        element={userData ? <OrderPlaced /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/my-orders"
        element={userData ? <MyOrders /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/track-order/:orderId"
        element={userData ? <TrackOrderPage /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/shop/:shopId"
        element={userData ? <Shop /> : <Navigate to={"/signin"} />}
      />
    </Routes>
  );
}

export default App;
