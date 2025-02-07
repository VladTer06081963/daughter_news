/** @format */
require("dotenv").config();
const express = require("express");
const path = require("path");
const fetch = require("node-fetch");
const { getTopHeadlines } = require("./apiService");
const app = express();

// Настройка Pug
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Статические файлы
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
  // Если текущий URL - News или Finans, устанавливаем isExternal = true
  res.locals.isExternal = req.path === "/news" || req.path === "/finans";
  next();
});

// Роут для главной страницы
app.get("/", (req, res) => {
  res.render("index", { title: "Oxana_Te", text: "Oksana" });
});

app.get("/news", async (req, res) => {
  try {
    const articles = await getTopHeadlines(); // Получаем все статьи
    const page = parseInt(req.query.page) || 1; // Текущая страница (по умолчанию 1)
    const limit = 10; // Количество статей на страницу
    const startIndex = (page - 1) * limit; // Начальный индекс для пагинации
    const endIndex = page * limit; // Конечный индекс для пагинации

    // Получаем статьи для текущей страницы
    const paginatedArticles = articles.slice(startIndex, endIndex);

    // Общее количество страниц
    const totalPages = Math.ceil(articles.length / limit);
    res.render("news", {
      title: "Актуальные новости",
      articles: paginatedArticles,
      currentPage: page,
      totalPages: totalPages,
      prevPage: page > 1 ? page - 1 : null, // Предыдущая страница
      nextPage: page < totalPages ? page + 1 : null, // Следующая страница
    }); // isExternal передается через res.locals
  } catch (error) {
    console.error("Ошибка при получении новостей:", error);
    res.render("index", { title: "Ошибка", articles: [] });

  }
});

app.get("/finanse", (req, res) => {
  // res.render("index", { title: "Finanse", text: "" });
  res.render("finanse", { title: "Oxana_Te", text: "Hello Finanse" });
});
app.get("/admin", (req, res) => {
  // res.render("index", { title: "Finanse", text: "" });
  res.render("admin", { title: "Oxana_Te_Admin", text: "Oksana" });
  
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
