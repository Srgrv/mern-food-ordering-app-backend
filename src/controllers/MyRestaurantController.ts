import { Request, Response, response } from "express";
import cloudinary from "cloudinary";

//models
import Restaurant from "../models/restaurant";
import mongoose from "mongoose";

const getMyRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.userId });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.json(restaurant);
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({
      message: "Error fetching restaurant",
    });
  }
};

const updateMyRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.userId });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    restaurant.restaurantName = req.body.restaurantName;
    restaurant.city = req.body.city;
    restaurant.country = req.body.country;
    restaurant.deliveryPrice = req.body.deliveryPrice;
    restaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime;
    restaurant.cuisins = req.body.cuisins;
    restaurant.menuItems = req.body.menuItems;
    restaurant.lastUpdated = new Date();

    if (req.file) {
      const imageUrl = await uploadImage(req.file as Express.Multer.File);
      restaurant.imageUrl = imageUrl;
    }

    await restaurant.save();
    res.status(200).send(restaurant);
  } catch (error) {
    console.log("Error", error);
    res.json(500).json({ message: "Something went wrong" });
  }
};

const createMyRestaurant = async (req: Request, res: Response) => {
  try {
    const existingRestaurant = await Restaurant.findOne({ user: req.userId });

    if (existingRestaurant) {
      return res
        .status(409)
        .json({ message: "User restaurant already exists" });
    }

    const imageUrl = await uploadImage(req.file as Express.Multer.File);

    // Этот код создает новый объект ресторана (restaurant) на основе данных, полученных из запроса (req.body).
    const restaurant = new Restaurant(req.body);
    // Затем, после загрузки изображения на Cloudinary и получения ответа (uploadResponse), URL загруженного изображения присваивается свойству imageUrl объекта restaurant.
    restaurant.imageUrl = imageUrl;

    restaurant.user = new mongoose.Types.ObjectId(req.userId);
    restaurant.lastUpdated = new Date();

    await restaurant.save();

    res.status(201).send(restaurant);
  } catch (error) {
    // console.log(error);
    res.status(500).json({ message: "Something went wrong", error: error });
  }
};

const uploadImage = async (file: Express.Multer.File) => {
  const image = file;

  // Buffer.from(image.buffer): Создает новый объект буфера из бинарных данных изображения. image.buffer предположительно содержит бинарные данные изображения, доступные после загрузки.
  // .toString("base64"): Преобразует содержимое буфера в строку, используя кодировку base64. Формат base64 представляет бинарные данные в виде ASCII-строки, что удобно для передачи через сеть или включения в код HTML или CSS.
  const base64Image = Buffer.from(image.buffer).toString("base64");

  // data:[<mediatype>][;base64],<data>
  // `<mediatype>` – это тип данных, который вы внедряете, например, «image/jpeg» для изображений JPEG.
  // «;base64» – указывает на кодировку в формате base64.
  // `<data>` – собственно записи в кодировке base64.
  // <img src=»data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QBtRXhpZgAATU0AKgAAAAgAA8EPAAIAAAAGAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAEKAD/2wBDAAoHBwkHBgoJCAkLCwoMDxkQDw4ODx4WFxIZJCAmJSMgIyIoLTkwKCo2KyIjMkQyNjs9QEBAJjBGS0U+Sjk/QD3/2wBDAQsLCw8NDx0QEB09KSMpPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT3/wAARCAABAAEDAREAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAAA//EABUBAQEAAAAAAAAAAAAAAAAAAAEA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A93oyTkHXf/9k=» alt=»Пример изображения»>
  const dataURI = `data:${image.mimetype};base64,${base64Image}`;

  // cloudinary.v2.uploader.upload(dataURI): Метод upload принимает Data URI изображения в качестве параметра и загружает его на платформу Cloudinary.
  // После успешной загрузки, Cloudinary возвращает ответ, который содержит информацию о загруженном изображении, такую как его публичный URL, размеры и другие метаданные.
  const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
  return uploadResponse.url;
};

export default { getMyRestaurant, createMyRestaurant, updateMyRestaurant };
