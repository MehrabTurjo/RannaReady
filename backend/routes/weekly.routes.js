// 

import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";
import { 
    createWeeklyMenu,
    editWeeklyMenu,
    getWeeklyMenuById,
    getShopWeeklyMenus, 
    createSubscription, 
    approveSubscription, 
    getAvailableRidersForWeekly, 
    assignRiderToSubscription,
    dispatchDailyMeal,
    getAllWeeklyMenus,
    getShopSubscriptions,
    getRiderWeeklySubscriptions,
    getUserSubscriptions
} from "../controllers/weekly.controllers.js";

const router = express.Router();

// --- TEST ROUTE (To verify connection) ---
router.get("/test", (req, res) => res.send("Weekly API is working!"));

// Menu Routes
router.post("/menu/:shopId", isAuth, upload.single("image"), createWeeklyMenu);
router.post("/menu/edit/:menuId", isAuth, upload.single("image"), editWeeklyMenu);
router.get("/menu/by-id/:menuId", isAuth, getWeeklyMenuById);
router.get("/menu/:shopId", getShopWeeklyMenus); 
router.get("/all", getAllWeeklyMenus); 

// Subscription Flow
router.post("/subscribe", isAuth, createSubscription);
router.put("/subscription/:subscriptionId/approve", isAuth, approveSubscription);
router.get("/subscriptions/:shopId", isAuth, getShopSubscriptions);
router.get("/user/my-subscriptions", isAuth, getUserSubscriptions);

// Rider Assignment
router.get("/riders/available", isAuth, getAvailableRidersForWeekly);
router.put("/subscription/assign-rider", isAuth, assignRiderToSubscription);

// Rider Views (CRITICAL SECTION)
// This is the route giving you the 404. It MUST be here.
router.get("/rider/my-subscriptions", isAuth, getRiderWeeklySubscriptions);

// Daily Operations
router.post("/dispatch-daily", isAuth, dispatchDailyMeal);

export default router;