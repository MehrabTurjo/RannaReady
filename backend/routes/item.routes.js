import express from "express"

import isAuth from "../middlewares/isAuth.js"
import { addItem, deleteItem, editItem, getItemByCity, getItemById, getItemsByShop, rating, searchItems } from "../controllers/item.controllers.js"
import { upload } from "../middlewares/multer.js"



const itemRouter=express.Router()

itemRouter.post("/add-item",isAuth,upload.single("image"),addItem)
itemRouter.post("/edit-item/:itemId",isAuth,upload.single("image"),editItem)
itemRouter.get("/get-by-id/:itemId",isAuth,getItemById)
itemRouter.get("/delete/:itemId",isAuth,deleteItem)
itemRouter.get("/get-by-city/:city",isAuth,getItemByCity)
itemRouter.get("/get-by-shop/:shopId",isAuth,getItemsByShop)
itemRouter.get("/search-items",isAuth,searchItems)
itemRouter.post("/rating",isAuth,rating)
export default itemRouter


// //object of array {
// saturday : [ dal, sabji, roti],
// sunday : [ dal, sabji, roti],
// monday : [ dal, sabji, roti],
// tuesday : [ dal, sabji, roti],
// wednesday : [ dal, sabji, roti],
// thursday : [ dal, sabji, roti],
// friday : [ dal, sabji, roti],
// }//

// subscription 