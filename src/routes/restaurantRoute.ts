import express from "express";
import { param } from "express-validator";

//controllers
import RestaurantController from "../controllers/RestaurantController";

const router = express.Router();

router.get(
  "/:restaurantId",
  param("restaurantId")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Название ресторнана должно быть строкой"),
  RestaurantController.getRestaurant
);

router.get(
  "/search/:city",
  param("city")
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Параметр "Город" должен быть строкой'),
  RestaurantController.searchRestaurants
);

export default router;
