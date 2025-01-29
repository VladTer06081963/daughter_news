/** @format */

document.addEventListener("DOMContentLoaded", () => {
  const tabLinks = document.querySelectorAll(".tab-links");
  const tabContents = document.querySelectorAll(".tab-contents");

  tabLinks.forEach((link) => {
    link.addEventListener("click", () => {
      // Удаляем активный класс у всех вкладок
      tabLinks.forEach((tab) => tab.classList.remove("active-link"));
      tabContents.forEach((content) => content.classList.remove("active-tab"));

      // Активируем выбранную вкладку
      const targetId = link.getAttribute("data-tab");
      link.classList.add("active-link");
      document.getElementById(targetId).classList.add("active-tab");
    });
  });
});

