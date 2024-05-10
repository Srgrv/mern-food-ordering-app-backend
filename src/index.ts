import express, { Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

//routes
import myUserRoute from "./routes/myUserRoutes";
import myRestaurantRoute from "./routes/myRestaurantRoute";

mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string).then(() => {
  console.log("Connected to database");
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
app.use(express.json());
app.use(cors());

// app.get("/test", async (req: Request, res: Response) => {
//   res.json({ message: "hello" });
// });

app.get("/health", async (req: Request, res: Response) => {
  res.send({ message: "health OK!" });
});

app.use("/api/my/user", myUserRoute);
app.use("/api/my/restaurant", myRestaurantRoute);

app.listen(8000, () => {
  console.log("Server starts on localhost:8000");
});

//password: vNouBkPBtI6zD5CD
