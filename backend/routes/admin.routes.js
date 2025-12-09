import express from "express"
import { adminLogin, getDashboardStats, getPendingOwners, getPendingRiders, approveUser, rejectUser } from "../controllers/admin.controllers.js"
import { isAuth } from "../middlewares/isAuth.js"

const router = express.Router()

// Admin login (no auth required)
router.post("/login", adminLogin)

// Protected admin routes
router.get("/stats", isAuth, getDashboardStats)
router.get("/pending-owners", isAuth, getPendingOwners)
router.get("/pending-riders", isAuth, getPendingRiders)
router.put("/approve/:userId", isAuth, approveUser)
router.put("/reject/:userId", isAuth, rejectUser)

export default router
