/** @format */

const fs = require("fs").promises;
const path = require("path");
const fetch = require("node-fetch");

const API_KEY = process.env.API_NEWS;
const BASE_URL = "https://newsapi.org/v2/everything";
const FILE_PATH = "./data/articles.json";
const ARCHIVE_DIR = "./dataNews";
const MAX_ARTICLES = 200;
const RECENT_ARTICLES_LIMIT = 100;

// Исправляем комментарий: 3 минуты в миллисекундах (180000)
const CACHE_DURATION = 60 * 60 * 1000; // 3 минуты

if (!API_KEY) {
  throw new Error(
    "API ключ отсутствует. Убедитесь, что переменная окружения API_NEWS установлена."
  );
}

async function fetchNews(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Ошибка API: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error("Ошибка сети:", error.message);
    throw error;
  }
}

function filterArticles(articles) {
  const filtered = articles.filter(
    (article) =>
      article.url &&
      article.url.startsWith("https://") &&
      article.title &&
      article.description
  );
  console.log(`Отфильтровано статей: ${filtered.length}`);
  return filtered;
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

async function saveToFile(newData, filePath) {
  try {
    await fs.mkdir(ARCHIVE_DIR, { recursive: true });
    const existingData = (await getCachedNews(filePath)) || [];
    const combinedData = [...existingData, ...newData];
    const uniqueData = Array.from(
      new Map(combinedData.map((item) => [item.url, item])).values()
    );

    if (uniqueData.length > MAX_ARTICLES) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const archivePath = path.join(ARCHIVE_DIR, `articles-${timestamp}.json`);

      try {
        await fs.access(filePath);
        await fs.rename(filePath, archivePath);
        console.log(`Файл перемещён в архив: ${archivePath}`);
      } catch (error) {
        console.error("Ошибка при перемещении файла в архив:", error.message);
      }

      const recentData = uniqueData.slice(-RECENT_ARTICLES_LIMIT);
      await fs.writeFile(filePath, JSON.stringify(recentData, null, 2));
      console.log(
        `Новый файл создан с последними ${RECENT_ARTICLES_LIMIT} статьями.`
      );
    } else {
      await fs.writeFile(filePath, JSON.stringify(uniqueData, null, 2));
      console.log(`Данные успешно сохранены в файл ${filePath}`);
    }
  } catch (error) {
    console.error("Ошибка при записи в файл:", error.message);
    throw error;
  }
}

async function getTopHeadlines(queryParams = {}) {
  try {
    // Сначала узнаём, есть ли кэш.
    let cachedNews = await getCachedNews(FILE_PATH);

    if (cachedNews) {
      // Если кэш есть, проверим, не истёк ли его «срок годности».
      const stats = await fs.stat(FILE_PATH);
      const fileLastModified = new Date(stats.mtime).getTime();
      const now = Date.now();

      // Если файл был модифицирован меньше, чем CACHE_DURATION миллисекунд назад,
      // считаем, что кэш ещё актуален.
      if (now - fileLastModified < CACHE_DURATION) {
        console.log("Используются кэшированные данные (актуальны).");
        return cachedNews;
      } else {
        console.log("Срок действия кэша истек. Загружаем новые данные...");
      }
    }

    // Если кэша нет или он устарел, делаем запрос к NewsAPI
    const defaultParams = {
      q: "USA OR Evropa OR bitcoin OR finance OR China",
      language: "en",
      sortBy: "relevancy",
      apiKey: API_KEY,
      pageSize: 100,
      page: 1,
    };

    const finalParams = { ...defaultParams, ...queryParams };
    const url = `${BASE_URL}?${new URLSearchParams(finalParams).toString()}`;
    console.log("Запрос к API:", url);

    const data = await fetchNews(url);
    if (!data || !Array.isArray(data.articles)) {
      throw new Error("Некорректный ответ от API: отсутствует поле articles.");
    }

    console.log(`Получено статей от API: ${data.articles.length}`);
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

// /** @format */

// const fs = require("fs").promises;
// const path = require("path");
// const fetch = require("node-fetch");

// const API_KEY = process.env.API_NEWS;
// const BASE_URL = "https://newsapi.org/v2/everything";
// const FILE_PATH = "./data/articles.json";
// const ARCHIVE_DIR = "./dataNews";
// const MAX_ARTICLES = 200;
// const RECENT_ARTICLES_LIMIT = 100;
// const CACHE_DURATION = 60 * 3 * 1000; // 1 час в миллисекундах

// if (!API_KEY) {
//   throw new Error(
//     "API ключ отсутствует. Убедитесь, что переменная окружения API_NEWS установлена."
//   );
// }

// async function fetchNews(url) {
//   try {
//     const response = await fetch(url);
//     if (!response.ok) {
//       throw new Error(`Ошибка API: ${response.statusText}`);
//     }
//     return response.json();
//   } catch (error) {
//     console.error("Ошибка сети:", error.message);
//     throw error;
//   }
// }

// function filterArticles(articles) {
//   const filtered = articles.filter(
//     (article) =>
//       article.url &&
//       article.url.startsWith("https://") &&
//       article.title &&
//       article.description
//   );
//   console.log(`Отфильтровано статей: ${filtered.length}`);
//   return filtered;
// }

// async function getCachedNews(filePath) {
//   try {
//     const fileContent = await fs.readFile(filePath, "utf-8");
//     if (!fileContent) {
//       return null;
//     }
//     return JSON.parse(fileContent);
//   } catch (error) {
//     return null;
//   }
// }

// async function saveToFile(newData, filePath) {
//   try {
//     await fs.mkdir(ARCHIVE_DIR, { recursive: true });
//     const existingData = (await getCachedNews(filePath)) || [];
//     const combinedData = [...existingData, ...newData];
//     const uniqueData = Array.from(
//       new Map(combinedData.map((item) => [item.url, item])).values()
//     );

//     if (uniqueData.length > MAX_ARTICLES) {
//       const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
//       const archivePath = path.join(ARCHIVE_DIR, `articles-${timestamp}.json`);

//       try {
//         await fs.access(filePath);
//         await fs.rename(filePath, archivePath);
//         console.log(`Файл перемещён в архив: ${archivePath}`);
//       } catch (error) {
//         console.error("Ошибка при перемещении файла в архив:", error.message);
//       }

//       const recentData = uniqueData.slice(-RECENT_ARTICLES_LIMIT);
//       await fs.writeFile(filePath, JSON.stringify(recentData, null, 2));
//       console.log(
//         `Новый файл создан с последними ${RECENT_ARTICLES_LIMIT} статьями.`
//       );
//     } else {
//       await fs.writeFile(filePath, JSON.stringify(uniqueData, null, 2));
//       console.log(`Данные успешно сохранены в файл ${filePath}`);
//     }
//   } catch (error) {
//     console.error("Ошибка при записи в файл:", error.message);
//     throw error;
//   }
// }

// async function getTopHeadlines(queryParams = {}) {
//   try {
//     const cachedNews = await getCachedNews(FILE_PATH);
//     if (cachedNews) {
//       console.log("Используются кэшированные данные.");
//       return cachedNews;
//     }

//     const defaultParams = {
//       q: "USA OR Evropa OR bitcoin OR finance OR China",
//       language: "en",
//       sortBy: "relevancy",
//       apiKey: API_KEY,
//       pageSize: 100,
//       page: 1,
//     };

//     const finalParams = { ...defaultParams, ...queryParams };
//     const url = `${BASE_URL}?${new URLSearchParams(finalParams).toString()}`;
//     console.log("Запрос к API:", url);

//     const data = await fetchNews(url);
//     if (!data || !Array.isArray(data.articles)) {
//       throw new Error("Некорректный ответ от API: отсутствует поле articles.");
//     }

//     console.log(`Получено статей от API: ${data.articles.length}`);
//     const filteredArticles = filterArticles(data.articles);

//     if (filteredArticles.length === 0) {
//       console.log("Нет статей, соответствующих критериям.");
//       return [];
//     }

//     console.log("Сохранение данных в файл...");
//     await saveToFile(filteredArticles, FILE_PATH);
//     return filteredArticles;
//   } catch (error) {
//     console.error("Ошибка при получении новостей:", error.message);
//     return [];
//   }
// }

// module.exports = { getTopHeadlines };
