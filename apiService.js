const fs = require("fs").promises; //подключаем модули
const fetch = require("node-fetch");

const API_KEY = process.env.API_NEWS; //настройка переменных
const BASE_URL = "https://newsapi.org/v2/everything";
const FILE_PATH = "./data/articles.json";
//функция загрузки новостей
async function fetchNews(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Ошибка API: ${response.statusText}`);
  }
  return response.json();
}

// Фильтрация статей по http://
function filterArticles(articles) {
  const filtered = articles.filter(
    (article) => article.url && article.url.startsWith("https://")
  );
  console.log(`Отфильтровано статей: ${filtered.length}`);
  return filtered;
}
async function saveToFile(data, filePath) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    console.log(`Данные успешно сохранены в файл ${filePath}`);
  } catch (error) {
    console.error("Ошибка при записи в файл:", error.message);
    throw error;
  }
}

async function getCachedNews(filePath) {
  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    if (!fileContent) {
      return null;
    }
    return JSON.parse(fileContent);
  } catch (error) {
    return null;
  }
}
//Сохранение данных в файл
async function getTopHeadlines() {
  try {
    const cachedNews = await getCachedNews(FILE_PATH);
    if (cachedNews) {
      console.log("Используются кэшированные данные.");
      return cachedNews;
    }

    const queryParams = {
      // q: "it-technologies OR programming",
      q: "bitcoin OR finanse",
      language: "en",
      sortBy: "relevancy",
      apiKey: API_KEY,
      pageSize: 100,
      page: 1,
    };

    const url = `${BASE_URL}?${new URLSearchParams(queryParams).toString()}`;
    console.log("Запрос к API:", url);
    const data = await fetchNews(url);

    if (!data.articles) {
      console.log("Нет статей в ответе от API.");
      return [];
    }

    const filteredArticles = filterArticles(data.articles);

    if (filteredArticles.length === 0) {
      console.log("Нет статей, соответствующих критериям.");
      return [];
    }

    console.log("Сохранение данных в файл...");
    await saveToFile(filteredArticles, FILE_PATH);
    return filteredArticles;
  } catch (error) {
    console.error("Ошибка при получении новостей:", error.message);
    return [];
  }
}

module.exports = { getTopHeadlines };
