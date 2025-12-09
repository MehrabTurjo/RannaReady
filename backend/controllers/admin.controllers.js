import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import genToken from "../utils/token.js"

// Hardcoded admin credentials
const ADMIN_EMAIL = "admin@fooddelivery.com"
const ADMIN_PASSWORD = "admin123"

export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" })
        }

        // Check hardcoded admin credentials
        if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
            return res.status(401).json({ message: "Invalid admin credentials" })
        }

        // Find or create admin user
        let admin = await User.findOne({ email: ADMIN_EMAIL, role: "admin" })
        
        if (!admin) {
            // Create admin user if doesn't exist
            const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10)
            admin = await User.create({
                fullName: "Admin",
                email: ADMIN_EMAIL,
                password: hashedPassword,
                mobile: "0000000000",
                role: "admin",
                isApproved: true,
                approvalStatus: "approved"
            })
        }

        const token = await genToken(admin._id)
        res.cookie("token", token, {
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        })

        return res.status(200).json({ message: "Admin login successful", user: admin })

    } catch (error) {
        return res.status(500).json({ message: `Admin login error: ${error}` })
    }
}

export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: "user" })
        const totalOwners = await User.countDocuments({ role: "owner" })
        const totalRiders = await User.countDocuments({ role: "deliveryBoy" })
        const pendingOwners = await User.countDocuments({ role: "owner", approvalStatus: "pending" })
        const pendingRiders = await User.countDocuments({ role: "deliveryBoy", approvalStatus: "pending" })

        return res.status(200).json({
            totalUsers,
            totalOwners,
            totalRiders,
            pendingOwners,
            pendingRiders
        })

    } catch (error) {
        return res.status(500).json({ message: `Get stats error: ${error}` })
    }
}

export const getPendingOwners = async (req, res) => {
    try {
        const pendingOwners = await User.find({ 
            role: "owner", 
            approvalStatus: "pending" 
        }).select("-password -socketId -resetOtp -otpExpires")

        return res.status(200).json(pendingOwners)

    } catch (error) {
        return res.status(500).json({ message: `Get pending owners error: ${error}` })
    }
}

export const getPendingRiders = async (req, res) => {
    try {
        const pendingRiders = await User.find({ 
            role: "deliveryBoy", 
            approvalStatus: "pending" 
        }).select("-password -socketId -resetOtp -otpExpires")

        return res.status(200).json(pendingRiders)

    } catch (error) {
        return res.status(500).json({ message: `Get pending riders error: ${error}` })
    }
}

export const approveUser = async (req, res) => {
    try {
        const { userId } = req.params

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        if (user.role !== "owner" && user.role !== "deliveryBoy") {
            return res.status(400).json({ message: "Only owners and riders need approval" })
        }

        user.isApproved = true
        user.approvalStatus = "approved"
        await user.save()

        return res.status(200).json({ message: `${user.role} approved successfully`, user })

    } catch (error) {
        return res.status(500).json({ message: `Approve user error: ${error}` })
    }
}

export const rejectUser = async (req, res) => {
    try {
        const { userId } = req.params

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        if (user.role !== "owner" && user.role !== "deliveryBoy") {
            return res.status(400).json({ message: "Only owners and riders can be rejected" })
        }

        user.isApproved = false
        user.approvalStatus = "rejected"
        await user.save()

        return res.status(200).json({ message: `${user.role} rejected`, user })

    } catch (error) {
        return res.status(500).json({ message: `Reject user error: ${error}` })
    }
}
