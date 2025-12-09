import mongoose from "mongoose";

const shopSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    city:{
         type:String,
        required:true
    },
    state:{
         type:String,
        required:true
    },
    address:{
        text: {
            type: String,
            required: true
        },
        latitude: {
            type: Number,
            default: 0
        },
        longitude: {
            type: Number,
            default: 0
        }
    },
    items:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Item"
    }]

},{timestamps:true})

// Middleware to handle backward compatibility for existing shops with string addresses
shopSchema.pre('save', function(next) {
    // If address is a string (old format), convert it to object format
    if (typeof this.address === 'string') {
        this.address = {
            text: this.address,
            latitude: 0,
            longitude: 0
        };
    }
    next();
});

// Transform to handle queries for existing data
shopSchema.post('findOne', function(doc) {
    if (doc && typeof doc.address === 'string') {
        doc.address = {
            text: doc.address,
            latitude: 0,
            longitude: 0
        };
    }
});

shopSchema.post('find', function(docs) {
    docs.forEach(doc => {
        if (doc && typeof doc.address === 'string') {
            doc.address = {
                text: doc.address,
                latitude: 0,
                longitude: 0
            };
        }
    });
});

const Shop=mongoose.model("Shop",shopSchema)
export default Shop