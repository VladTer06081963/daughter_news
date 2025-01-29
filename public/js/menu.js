/** @format */

// menu.js
const sidemenu = document.getElementById("sidemenu");

function openmenu() {
  sidemenu.style.right = "0";
}

function closemenu() {
  sidemenu.style.right = "-200px";
}

document.querySelector(".bi-list").addEventListener("click", openmenu);
document.querySelector(".bi-x").addEventListener("click", closemenu);
