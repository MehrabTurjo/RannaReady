import WeeklyMenu from "../models/weeklyMenu.model.js";
import WeeklySubscription from "../models/weeklySubscription.model.js";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Item from "../models/item.model.js";
import DeliveryAssignment from "../models/deliveryAssignment.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

// --- MENU MANAGEMENT ---

export const createWeeklyMenu = async (req, res) => {
    try {
        const { name, description, pricePerWeek, weeklySchedule, category } = req.body;
        const { shopId } = req.params;
        
        let image;
        if (req.file) {
            console.log(req.file);
            image = await uploadOnCloudinary(req.file.path);
        }

        const newMenu = new WeeklyMenu({
            shop: shopId,
            name,
            image,
            description,
            pricePerWeek,
            weeklySchedule: JSON.parse(weeklySchedule), // Parse stringified array from FormData
            category
        });

        await newMenu.save();
        res.status(201).json(newMenu);
    } catch (error) {
        res.status(500).json({ message: "Error creating menu", error: error.message });
    }
};

export const editWeeklyMenu = async (req, res) => {
    try {
        const { menuId } = req.params;
        const { name, description, pricePerWeek, weeklySchedule, category } = req.body;
        
        let image;
        if (req.file) {
            console.log(req.file);
            image = await uploadOnCloudinary(req.file.path);
        }

        const updateData = {
            name,
            description,
            pricePerWeek,
            weeklySchedule: JSON.parse(weeklySchedule),
            category
        };
        
        if (image) {
            updateData.image = image;
        }

        const updatedMenu = await WeeklyMenu.findByIdAndUpdate(menuId, updateData, { new: true });
        
        if (!updatedMenu) {
            return res.status(404).json({ message: "Menu not found" });
        }
        
        res.status(200).json(updatedMenu);
    } catch (error) {
        res.status(500).json({ message: "Error updating menu", error: error.message });
    }
};

export const getWeeklyMenuById = async (req, res) => {
    try {
        const { menuId } = req.params;
        const menu = await WeeklyMenu.findById(menuId);
        
        if (!menu) {
            return res.status(404).json({ message: "Menu not found" });
        }
        
        res.status(200).json(menu);
    } catch (error) {
        res.status(500).json({ message: "Error fetching menu", error: error.message });
    }
};

export const getShopWeeklyMenus = async (req, res) => {
    try {
        const menus = await WeeklyMenu.find({ shop: req.params.shopId, isActive: true });
        res.status(200).json(menus);
    } catch (error) {
        res.status(500).json({ message: "Error fetching menus", error: error.message });
    }
};

// --- SUBSCRIPTION FLOW ---

// 1. User places a subscription request
export const createSubscription = async (req, res) => {
    try {
        const { menuId, shopId, allergies, deliveryAddress, startDate, paymentMethod, deliveryTime, deliveryDays } = req.body;
        
        const menu = await WeeklyMenu.findById(menuId);
        if (!menu) return res.status(404).json({ message: "Menu not found" });

        // Validate deliveryDays
        if (!deliveryDays || deliveryDays.length === 0) {
            return res.status(400).json({ message: "Please select at least one delivery day" });
        }

        // Calculate End Date (assuming 7 days or 5 days based on logic, setting 7 for now)
        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(start.getDate() + 7);

        const newSubscription = new WeeklySubscription({
            user: req.userId, // From isAuth middleware
            shop: shopId,
            menu: menuId,
            allergies,
            deliveryAddress,
            deliveryTime: deliveryTime || "12:00",
            deliveryDays: deliveryDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            totalAmount: menu.pricePerWeek,
            paymentMethod,
            startDate: start,
            endDate: end,
            status: 'pending_approval' // Waiting for Shop to accept
        });

        await newSubscription.save();
        res.status(201).json({ message: "Subscription requested", subscription: newSubscription });
    } catch (error) {
        res.status(500).json({ message: "Error creating subscription", error: error.message });
    }
};

// 2. Shop Accepts Subscription -> Triggers Rider Selection Availability
export const approveSubscription = async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        
        const subscription = await WeeklySubscription.findById(subscriptionId);
        if (!subscription) return res.status(404).json({ message: "Subscription not found" });

        subscription.status = 'approved';
        await subscription.save();

        // Notify User (Socket.io logic would go here)
        
        res.status(200).json({ message: "Subscription approved. Please assign a rider now.", subscription });
    } catch (error) {
        res.status(500).json({ message: "Error approving subscription", error: error.message });
    }
};

// 3. Find Available Riders (Conflict-Free Logic)
export const getAvailableRidersForWeekly = async (req, res) => {
    try {
        // 1. Find ANY user with a role resembling 'delivery' or 'rider'
        // This Regex matches: "Delivery Boy", "delivery_partner", "Rider", "delivery", etc.
        const allRiders = await User.find({ 
            role: { $regex: /delivery|rider/i } 
        }); 

        console.log(`[Weekly] Found ${allRiders.length} potential riders.`);

        // 2. Find Riders who are BUSY with another active/approved subscription
        const busySubscriptions = await WeeklySubscription.find({
            assignedRider: { $ne: null },
            status: { $in: ['approved', 'active'] }
        }).select('assignedRider');

        const busyRiderIds = busySubscriptions.map(sub => sub.assignedRider.toString());

        // 3. Filter out busy riders
        const availableRiders = allRiders.filter(rider => {
            if (busyRiderIds.includes(rider._id.toString())) return false;
            return true;
        });

        console.log(`[Weekly] Returning ${availableRiders.length} available riders.`);
        res.status(200).json(availableRiders);
    } catch (error) {
        console.error("Error fetching riders:", error);
        res.status(500).json({ message: "Error fetching riders", error: error.message });
    }
};

// 4. Assign Rider to Subscription
export const assignRiderToSubscription = async (req, res) => {
    try {
        const { subscriptionId, riderId } = req.body;

        const subscription = await WeeklySubscription.findById(subscriptionId);
        if (!subscription) return res.status(404).json({ message: "Subscription not found" });

        // Double check rider availability to prevent race conditions
        const isBusy = await WeeklySubscription.findOne({
            assignedRider: riderId,
            status: { $in: ['approved', 'active'] }
        });

        if (isBusy) {
            return res.status(400).json({ message: "Rider was just booked by another shop!" });
        }

        subscription.assignedRider = riderId;
        subscription.status = 'active'; // Subscription becomes active once rider is locked
        await subscription.save();

        res.status(200).json({ message: "Rider assigned successfully", subscription });
    } catch (error) {
        res.status(500).json({ message: "Error assigning rider", error: error.message });
    }
};

// 5. Daily Dispatch (Cook marks today's meal as "Out for Delivery")
// This integrates with your EXISTING Order model so tracking works properly
// export const dispatchDailyMeal = async (req, res) => {
//     try {
//         const { subscriptionId } = req.body;
//         const subscription = await WeeklySubscription.findById(subscriptionId).populate('menu');

//         // Create a Standard Order for today
//         const todayOrder = new Order({
//             user: subscription.user,
//             shopOrders: [{
//                 shop: subscription.shop,
//                 owner: subscription.user, // or shop owner
//                 subtotal: 0, // Already paid via subscription
//                 status: 'out of delivery',
//                 // Map weekly menu items for today to generic items or description
//                 shopOrderItems: [], // You would verify today's day and populate this from subscription.menu.weeklySchedule
//                 assignedDeliveryBoy: subscription.assignedRider
//             }],
//             paymentMethod: subscription.paymentMethod, // Inherit
//             deliveryAddress: subscription.deliveryAddress,
//             totalAmount: 0, // Part of subscription
//             payment: false // Handle payment status logic
//         });

//         await todayOrder.save();

//         // Link this daily order back to the subscription
//         subscription.dailyOrders.push({
//             date: new Date(),
//             orderId: todayOrder._id,
//             status: 'out of delivery'
//         });
//         await subscription.save();

//         res.status(200).json({ message: "Daily meal dispatched", order: todayOrder });
//     } catch (error) {
//         res.status(500).json({ message: "Error dispatching meal", error: error.message });
//     }
// };

export const dispatchDailyMeal = async (req, res) => {
    try {
        const { subscriptionId } = req.body;
        
        // 1. Fetch Subscription with Menu and Shop details
        const subscription = await WeeklySubscription.findById(subscriptionId)
            .populate('menu')
            .populate('shop'); // Need shop to get the owner ID

        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }

        // 2. Determine "Today's" Meal Description
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayName = days[new Date().getDay()];
        const todaySchedule = subscription.menu.weeklySchedule.find(d => d.day === todayName);
        const mealDescription = todaySchedule ? todaySchedule.description : `${subscription.menu.name} (Standard)`;

        // 3. Find a placeholder Item ID (Required by your Order Schema)
        // We try to use an item from the weekly schedule, otherwise grab any item from the shop
        let itemId = todaySchedule?.items?.[0];
        
        if (!itemId) {
            const anyShopItem = await Item.findOne({ shop: subscription.shop._id });
            itemId = anyShopItem ? anyShopItem._id : null;
        }

        // If shop has absolutely no items, we might have a schema error, but we try anyway
        if (!itemId) {
             console.log("Warning: No item ID found for order creation. Schema validation might fail.");
        }

        // 4. Create the Daily Order
        // Note: We create a "fake" item reference but override name/image in the order
        // Frontend will detect [Weekly] prefix and use fallback image
        const todayOrder = new Order({
            user: subscription.user,
            deliveryAddress: subscription.deliveryAddress,
            totalAmount: 0, // Weekly meals are pre-paid or paid weekly
            paymentMethod: subscription.paymentMethod,
            payment: false, 
            shopOrders: [{
                shop: subscription.shop._id,
                owner: subscription.shop.owner, // CRITICAL: Must be Shop Owner, not User
                subtotal: 0,
                status: 'out of delivery', // CRITICAL: This triggers "Current Order" in Rider UI
                assignedDeliveryBoy: subscription.assignedRider,
                shopOrderItems: [{
                    item: itemId, // Required by Schema (but may not have image)
                    name: `[Weekly] ${mealDescription}`, // Custom name - [Weekly] prefix identifies subscription orders
                    price: 0,
                    quantity: 1,
                    image: subscription.menu.image // Store weekly menu image directly
                }]
            }]
        });

        await todayOrder.save();

        // 5. Update Subscription History
        subscription.dailyOrders.push({
            date: new Date(),
            orderId: todayOrder._id,
            status: 'out of delivery'
        });
        await subscription.save();

        // 6. CRITICAL: Trigger Delivery Boy Assignment (Same as regular orders)
        const { longitude, latitude } = subscription.deliveryAddress;
        const nearByDeliveryBoys = await User.find({
            role: "deliveryBoy",
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [Number(longitude), Number(latitude)] },
                    $maxDistance: 5000
                }
            }
        });

        const nearByIds = nearByDeliveryBoys.map(b => b._id);
        const busyIds = await DeliveryAssignment.find({
            assignedTo: { $in: nearByIds },
            status: { $nin: ["brodcasted", "completed"] }
        }).distinct("assignedTo");

        const busyIdSet = new Set(busyIds.map(id => String(id)));
        const availableBoys = nearByDeliveryBoys.filter(b => !busyIdSet.has(String(b._id)));
        const candidates = availableBoys.map(b => b._id);

        if (candidates.length === 0) {
            console.log(`[Weekly] No available riders for order ${todayOrder._id}`);
            return res.status(200).json({ 
                message: "Daily meal dispatched but no available delivery boys", 
                order: todayOrder 
            });
        }

        // Create Delivery Assignment
        const deliveryAssignment = await DeliveryAssignment.create({
            order: todayOrder._id,
            shop: subscription.shop._id,
            shopOrderId: todayOrder.shopOrders[0]._id,
            brodcastedTo: candidates,
            status: "brodcasted"
        });

        // Link assignment to shopOrder
        todayOrder.shopOrders[0].assignment = deliveryAssignment._id;
        await todayOrder.save();

        // Populate for socket emission
        await deliveryAssignment.populate('order');
        await deliveryAssignment.populate('shop');

        // Emit to all available riders
        const io = req.app.get('io');
        if (io) {
            availableBoys.forEach(boy => {
                const boySocketId = boy.socketId;
                if (boySocketId) {
                    io.to(boySocketId).emit('newAssignment', {
                        sentTo: boy._id,
                        assignmentId: deliveryAssignment._id,
                        orderId: deliveryAssignment.order._id,
                        shopName: deliveryAssignment.shop.name,
                        deliveryAddress: deliveryAssignment.order.deliveryAddress,
                        items: todayOrder.shopOrders[0].shopOrderItems,
                        subtotal: todayOrder.shopOrders[0].subtotal
                    });
                    console.log(`[Weekly] Assignment broadcasted to rider: ${boy.fullName}`);
                }
            });
        }

        console.log(`[Weekly] Daily meal dispatched: ${todayOrder._id} with ${availableBoys.length} riders notified`);
        res.status(200).json({ 
            message: "Daily meal dispatched and riders notified", 
            order: todayOrder,
            ridersNotified: availableBoys.length 
        });

    } catch (error) {
        console.error("Dispatch Error:", error);
        res.status(500).json({ message: "Error dispatching meal", error: error.message });
    }
};


// --- NEW FUNCTIONS ---

// 1. Get ALL weekly menus (for User Dashboard)
export const getAllWeeklyMenus = async (req, res) => {
    try {
        const { city } = req.query;
        const menus = await WeeklyMenu.find({ isActive: true }).populate('shop');

        const filteredMenus = city 
            ? menus.filter(menu => menu.shop?.city?.toLowerCase() === city.toLowerCase())
            : menus;

        res.status(200).json(filteredMenus);
    } catch (error) {
        res.status(500).json({ message: "Error fetching menus", error: error.message });
    }
};

// 2. Get Shop Subscriptions (For Owner Dashboard) - THIS WAS MISSING
export const getShopSubscriptions = async (req, res) => {
    try {
        const { shopId } = req.params;
        
        const subscriptions = await WeeklySubscription.find({ shop: shopId })
            .populate('user', 'fullName email mobile') // Ensure these fields exist in your User model
            .populate('menu', 'name image')
            .populate('assignedRider', 'fullName mobile')
            .sort({ createdAt: -1 });

        res.status(200).json(subscriptions);
    } catch (error) {
        console.error("Error in getShopSubscriptions:", error);
        res.status(500).json({ message: "Error fetching subscriptions", error: error.message });
    }
};
// Get Weekly Subscriptions assigned to the logged-in Rider
export const getRiderWeeklySubscriptions = async (req, res) => {
    try {
        console.log(`[Weekly] Fetching subs for Rider ID: ${req.userId}`);

        // 1. Find subscriptions
        const subscriptions = await WeeklySubscription.find({
            assignedRider: req.userId,
            status: { $in: ['active', 'approved'] }
        })
        .populate('user', 'fullName mobile email')
        .populate('shop', 'name address mobile')
        .populate('menu', 'name pricePerWeek');

        console.log(`[Weekly] Found ${subscriptions.length} subscriptions.`);

        res.status(200).json(subscriptions);
    } catch (error) {
        console.error("Error fetching rider subs:", error);
        res.status(500).json({ message: "Error fetching subscriptions", error: error.message });
    }
};

// Get User's Own Subscriptions
export const getUserSubscriptions = async (req, res) => {
    try {
        const subscriptions = await WeeklySubscription.find({
            user: req.userId,
            status: { $in: ['pending_approval', 'approved', 'active'] }
        })
        .populate('shop', 'name address')
        .populate('menu', 'name image pricePerWeek')
        .populate('assignedRider', 'fullName mobile')
        .sort({ createdAt: -1 });

        res.status(200).json(subscriptions);
    } catch (error) {
        console.error("Error fetching user subscriptions:", error);
        res.status(500).json({ message: "Error fetching subscriptions", error: error.message });
    }
};
