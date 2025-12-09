import mongoose from "mongoose";

const weeklySubscriptionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true
    },
    menu: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WeeklyMenu",
        required: true
    },
    status: {
        type: String,
        enum: ['pending_approval', 'approved', 'active', 'completed', 'cancelled'],
        default: 'pending_approval'
    },
    allergies: {
        type: String,
        default: "None"
    },
    deliveryAddress: {
        text: String,
        latitude: Number,
        longitude: Number
    },
    deliveryTime: {
        type: String,
        required: true,
        default: "12:00" // Default noon delivery
    },
    deliveryDays: {
        type: [String],
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true,
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] // Default weekdays
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'online'], // Currently using COD as per request
        default: 'cod'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    // CRITICAL: The rider assigned for this entire week
    assignedRider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    // Track individual daily deliveries generated from this subscription
    dailyOrders: [{
        date: Date,
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" }, // Links to your existing Order model
        status: { type: String, default: 'pending' }
    }]
}, { timestamps: true });

const WeeklySubscription = mongoose.model("WeeklySubscription", weeklySubscriptionSchema);
export default WeeklySubscription;