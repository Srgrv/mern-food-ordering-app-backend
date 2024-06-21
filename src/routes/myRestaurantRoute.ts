import express from "express";
import multer from "multer";

//controllers
import MyRestaurantController from "../controllers/MyRestaurantController";
import { jwtCheck, jwtParse } from "../middleware/auth";

//validations
import { validateMyRestaurantRequest } from "../middleware/validation";

const router = express.Router();

// Эта строка создает хранилище в памяти для загружаемых файлов. Файлы будут временно храниться в памяти сервера вместо сохранения на диск. Это может быть полезно для операций, которые требуют обработки файлов до их окончательного сохранения или для файловых операций с меньшим объемом данных.
const storage = multer.memoryStorage();

// Здесь настраивается объект Multer с указанием параметров. В этом примере установлены следующие параметры:
const upload = multer({
  // Этот параметр указывает Multer использовать наше ранее созданное хранилище в памяти для сохранения файлов.
  storage: storage,
  // Здесь определяются ограничения на загружаемый файл. В данном случае установлено ограничение на размер файла до 5 мегабайт (5 * 1024 * 1024 байт).
  limits: {
    fileSize: 5 * 1024 * 1024, // 5mb
  },
});

// /api/my/restaurant

router.post(
  "/",
  // это вызов метода single() объекта upload, который создан с помощью Multer. Этот метод указывает Multer на то, что вы ожидаете только один файл с именем поля imageFile в запросе.
  upload.single("imageFile"),
  validateMyRestaurantRequest,
  jwtCheck,
  jwtParse,
  MyRestaurantController.createMyRestaurant
);

router.get("/", jwtCheck, jwtParse, MyRestaurantController.getMyRestaurant);

export default router;
