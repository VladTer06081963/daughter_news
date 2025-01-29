/** @format */

const fs = require("fs").promises;
const fetch = require("node-fetch");

const API_KEY = process.env.API_NEWS;
const BASE_URL = "https://newsapi.org/v2/everything";
const FILE_PATH = "./data/articles.json";

async function fetchNews(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Ошибка API: ${response.statusText}`);
  }
  return response.json();
}

function filterArticles(articles) {
  return articles.filter((article) => article.url.startsWith("https://"));
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
    return JSON.parse(fileContent);
  } catch (error) {
    return null;
  }
}

async function getTopHeadlines() {
  try {
    const cachedNews = await getCachedNews(FILE_PATH);
    if (cachedNews) {
      console.log("Используются кэшированные данные.");
      return cachedNews;
    }

    const queryParams = {
      q: "it-technologies OR programming",
      language: "en",
      sortBy: "relevancy",
      apiKey: API_KEY,
      pageSize: 200,
      page: 1,
    };

    const url = `${BASE_URL}?${new URLSearchParams(queryParams).toString()}`;
    const data = await fetchNews(url);
    const filteredArticles = filterArticles(data.articles);

    if (filteredArticles.length === 0) {
      console.log("Нет статей, соответствующих критериям.");
      return [];
    }

    await saveToFile(filteredArticles, FILE_PATH);
    return filteredArticles;
  } catch (error) {
    console.error("Ошибка при получении новостей:", error.message);
    return [];
  }
}

module.exports = { getTopHeadlines };
