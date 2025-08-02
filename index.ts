import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors"; 
import { connectDB } from "./db/connectDB";
import userRoutes from "./routes/user.route"
import restaurantRoutes from "./routes/restaurant.route"
import menuRoutes from "./routes/menu.route"
import orderRoutes from "./routes/order.route"

const app = express();

// middlewares here
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));


// api here
app.get("/", (req, res) => {
    res.status(200).json({ message: "server is running", success: true });
});
app.use("api/users" , userRoutes)
app.use("api/restaurants" , restaurantRoutes) 
app.use("api/menus" , menuRoutes)
app.use("api/orders" , orderRoutes)



const PORT = process.env.PORT || 7001;
const runServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => console.log(`server running at http://localhost:${PORT}`));
    } catch (error) {
        console.log(error);
    }
};

runServer();
