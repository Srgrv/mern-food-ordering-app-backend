// импортируем body, то есть будет проверяться в req.body, также может быть проверка в req.query, req.cookies, req.headers, req.params
// validateionResult возвращает массив ошибок
import { body, validationResult } from "express-validator";
// типы данных
import { NextFunction, Request, Response } from "express";

const handleValidationErrors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // присваиваем перменной error возвращаемый массив ошибок
  const errors = validationResult(req);
  // проверка пустой ли массив
  if (!errors.isEmpty()) {
    // возвращаем статус 400, а также объект в json формате
    return res.status(400).json({ errors: errors.array() });
  }
  // передаем управление следующему middleware
  next();
};

// здесь находятся 5 функций, которые при вставке в виде middleware поочередно выполняются
export const validateMyUserRequest = [
  body("name").isString().notEmpty().withMessage("Name must be a string"),
  body("addressLine1")
    .isString()
    .notEmpty()
    .withMessage("AddressLine1 must be a string"),
  body("city").isString().notEmpty().withMessage("City must be a string"),
  body("country").isString().notEmpty().withMessage("Country must be a string"),
  handleValidationErrors,
];
