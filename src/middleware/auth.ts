import { auth } from "express-oauth2-jwt-bearer";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

//models
import User from "../models/user";

// Это специальная конструкция в TypeScript, которая позволяет расширить глобальное пространство имён.
declare global {
  // Это определение пространства имён для расширения интерфейсов, определённых в Express.js.
  namespace Express {
    // Это расширение интерфейса Request, предоставляемого Express.js, чтобы добавить новые свойства.
    interface Request {
      //Это новые свойства, которые вы добавляете в объект запроса. Оно предполагается для хранения идентификатора пользователя.
      userId: string;
      auth0Id: string;
    }
  }
}

// используется для проверки действительности и подлинности JWT на основе заданных параметров. Он не извлекает информацию о пользователе, а только проверяет, соответствует ли предоставленный JWT заданным параметрам

// когда приходит запрос, содержащий JWT, middleware jwtCheck проверяет, соответствует ли предоставленный JWT этим параметрам.
// если JWT проходит проверку, то управление передается следующему middleware или обработчику маршрута. Если нет, то возвращается код состояния 401 (Unauthorized), и запрос дальше не обрабатывается.
export const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: "RS256",
});

// используется для извлечения и проверки JWT, а также для аутентификации пользователей и добавления информации о пользователе к запросу
export const jwtParse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // достаем токет хранящийся в headers в виде Bearer adjf;adjf;ajdfa;dfj
  const { authorization } = req.headers;

  // проверяется, передается ли в запросе заголовок Authorization, и начинается ли токен с "Bearer ".
  // если заголовок Authorization отсутствует или не начинается с "Bearer ", то возвращается код состояния 401 (Unauthorized).
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.sendStatus(401);
  }

  // Извлекаем из токена все кроме Bearer
  const token = authorization.split(" ")[1];

  try {
    // декодируется с использованием библиотеки jwt.
    const decoded = jwt.decode(token) as jwt.JwtPayload;

    // затем из декодированного токена извлекается идентификатор пользователя (auth0Id)
    const auth0Id = decoded.sub;
    // на основе этого идентификатора auth0 выполняется поиск пользователя в базе данных.
    const user = await User.findOne({ auth0Id });
    console.log(user);
    // если пользователь не найден, возвращается код состояния 401 (Unauthorized)
    if (!user) {
      return res.sendStatus(401);
    }

    // если пользователь найден, то его идентификатор (auth0Id) и идентификатор MongoDB (userId) добавляются к объекту запроса (req) для последующего использования другими middleware и обработчиками маршрутов.
    req.auth0Id = auth0Id as string;
    req.userId = user._id.toString();

    // затем управление передается следующему middleware или обработчику маршрута с помощью функции next()
    next();
  } catch (error) {
    return res.sendStatus(401);
  }
};
