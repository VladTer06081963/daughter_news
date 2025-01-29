/** @format */

// form.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.forms["submit-to-google-sheet"];
  const msg = document.getElementById("msg");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const scriptURL =
      "https://script.google.com/macros/s/AKfycbz7dqS9Llxl4Ber_sXla1pUI139Jj35LuawUWyB2JFbsC3yd_k6sp1r2TLpxzp27emk/exec";

    msg.textContent = "Nachricht wird gesendet...";

    fetch(scriptURL, {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        msg.textContent = "Nachricht wurde erfolgreich gesendet!";
        form.reset();
        setTimeout(() => {
          msg.textContent = "";
        }, 5000);
      })
      .catch((error) => {
        console.error("Fehler!", error.message);
        msg.textContent = "Fehler beim Senden der Nachricht.";
      });
  });
});
