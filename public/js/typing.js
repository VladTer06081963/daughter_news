/** @format */

document.addEventListener("DOMContentLoaded", () => {
  const textElement = document.getElementById("typing-text");

  if (!textElement) {
    console.error("Element with id 'typing-text' not found!");
    return;
  }

  const text = "Erfolgreiche Marken entstehen durch engagierte Menschen";
  let index = 0;

  function typeEffect() {
    if (index < text.length) {
      textElement.textContent = text.slice(0, index + 1) + "|"; // Добавляем курсор
      index++;
      setTimeout(typeEffect, 150);
    } else {
      setTimeout(() => {
        textElement.textContent = ""; // Очистка текста
        index = 0;
        typeEffect();
      }, 5000);
    }
  }

  typeEffect();
});

// /** @format */

// // typing.js
// document.addEventListener("DOMContentLoaded", () => {
//   const textElement = document.getElementById("typing-text");
//   const text = "Erfolgreiche Marken entstehen durch engagierte Menschen";
//   // let text =  text_ser ;
//   let index = 0;

//   function typeEffect() {
//     if (index < text.length) {
//       textElement.textContent += text[index];
//       index++;
//       setTimeout(typeEffect, 150);
//     } else {
//       setTimeout(() => {
//         textElement.textContent = "";
//         index = 0;
//         typeEffect();
//       }, 5000);
//     }
//   }

//   typeEffect();
// });
