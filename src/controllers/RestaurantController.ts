import { Request, Response, query } from "express";

// models
import Restaurant from "../models/restaurant";

const getRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.params.restaurantId;

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ message: "Ресторан не был найден" });
    }

    res.json(restaurant);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Что-то пошло не так при получении ресторана" });
  }
};

const searchRestaurants = async (req: Request, res: Response) => {
  try {
    // const city = req.params.city; - переменная city получает значение из динамического параметра :city маршрута. Это предполагает, что в маршруте было что-то вроде /search/London, где London будет значением переменной city.
    const city = req.params.city;

    // const searchQuery = (req.query.searchQuery as string) || ""; - searchQuery извлекает значение параметра запроса searchQuery. Это может быть строка поискового запроса, который передается через URL, например, /search/London?searchQuery=restaurant. Здесь || "" означает, что если параметр не задан, будет использована пустая строка.
    const searchQuery = (req.query.searchQuery as string) || "";

    // selectedCuisins получает значение параметра selectedCuisins из запроса. Это может быть строка, представляющая выбранные кухни ресторанов. По аналогии с searchQuery, если параметр не указан, будет использована пустая строка.
    const selectedCuisins = (req.query.selectedCuisins as string) || "";

    // const sortOption = (req.query.sortOption as string) || "lastUpdated"; - sortOption извлекает значение параметра sortOption. Этот параметр может определять опцию сортировки результатов запроса. Если параметр не задан, используется значение "lastUpdated".
    const sortOption = (req.query.sortOption as string) || "lastUpdated";

    // const page = parseInt(req.query.page as string) || 1; - page получает значение параметра page и преобразует его в целое число с помощью parseInt(). Если параметр не задан или не может быть преобразован в число, используется значение 1.
    const page = parseInt(req.query.page as string) || 1;

    // объявление переменной query, которая будет использоваться для построения запроса к базе данных MongoDB.
    let query: any = {};

    // создание фильтра для поля city в запросе к базе данных. new RegExp(city, "i") создает регулярное выражение для поиска значения city в регистронезависимом режиме (i - case insensitive).
    query["city"] = new RegExp(city, "i");

    // выполнение запроса к коллекции Restaurant в базе данных MongoDB с использованием объекта query. countDocuments() возвращает количество документов в коллекции, которые удовлетворяют условиям запроса query.
    const cityCheck = await Restaurant.countDocuments(query);

    // предназначено для обработки ситуации, когда запрос не возвращает ни одного результата.
    if (cityCheck === 0) {
      return res.status(404).json({
        data: [],
        pagination: {
          total: 0,
          page: 1,
          pages: 1,
        },
      });
    }

    // if (selectedCuisins) проверяет, есть ли значение в переменной selectedCuisins.
    // Предполагается, что selectedCuisins содержит строку с названиями кухонь, разделенными запятыми (например, "Italian,Japanese,Indian").

    if (selectedCuisins) {
      const cuisinsArray = selectedCuisins
        .split(",")
        .map((cuisine) => new RegExp(cuisine, "i"));

      // устанавливает фильтр в объекте query для поля cuisins.
      // $all - это оператор MongoDB, который требует, чтобы все элементы массива cuisinsArray были найдены в поле cuisins каждого документа.
      query["cuisins"] = { $all: cuisinsArray };
    }

    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, "i");
      // $or это оператор MongoDB $or, который выполняет логическое ИЛИ между выражениями в массиве.
      // В вашем случае ["$or"] содержит два выражения:
      // { restaurantName: searchRegex }: ищет документы, где поле restaurantName соответствует регулярному выражению searchRegex.
      // { cuisins: { $in: [searchRegex] } }: ищет документы, где в массиве cuisins есть хотя бы одно значение, соответствующее регулярному выражению searchRegex.

      query["$or"] = [
        { restaurantName: searchRegex },
        // Почему $in требует массива
        // Оператор $in в MongoDB ожидает массив значений, с которыми он будет сравнивать поле cuisins.
        // Этот оператор проверяет, содержится ли хотя бы одно значение из массива в поле cuisins.
        // Если бы у вас был список значений для поиска, вы бы передали их в $in как массив: { cuisins: { $in: ['Italian', 'Japanese', 'Indian'] } }
        { cuisins: { $in: [searchRegex] } },
      ];
    }

    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    const restaurants = await Restaurant.find(query)
      .sort({ [sortOption]: 1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const total = await Restaurant.countDocuments(query);

    // Пример:
    // const total = 50; // общее количество ресторанов
    // const page = 2; // вторая страница
    // const pageSize = 10; // количество элементов на странице

    const response = {
      data: restaurants,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / pageSize), // 50/10 =  5 страниц
      },
    };

    res.json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Что-то пошло не так" });
  }
};

export default {
  searchRestaurants,
  getRestaurant,
};
