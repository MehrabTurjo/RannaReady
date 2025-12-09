import mongoose from "mongoose";

const dailyMenuItemSchema = new mongoose.Schema({
    day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true
    },
    // We can link specific items from your existing Item model, or just use a description
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item"
    }],
    description: {
        type: String, // e.g., "Chicken Curry with Rice and Salad"
        required: true
    }
});

const weeklyMenuSchema = new mongoose.Schema({
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true
    },
    name: {
        type: String, // e.g., "Corporate Lunch - Veg Standard"
        required: true
    },
    image: {
        type: String,
        required: true
    },
    description: String,
    pricePerWeek: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        enum: ["Veg", "Non-Veg", "Diet", "Premium"],
        default: "Veg"
    },
    // Define what is served on each day
    weeklySchedule: [dailyMenuItemSchema], 
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const WeeklyMenu = mongoose.model("WeeklyMenu", weeklyMenuSchema);
export default WeeklyMenu;