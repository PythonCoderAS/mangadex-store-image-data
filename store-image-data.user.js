// ==UserScript==
// @name         Store Image Data
// @namespace    https://mangadex.org/
// @version      1.3.0
// @description  Store image Stats
// @author       PythonCoderAS
// @match        https://mangadex.org/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mangadex.org
// @grant        GM.getValue
// @grant        GM.setValue
// @require      https://cdn.jsdelivr.net/npm/luxon@3.0.3/build/global/luxon.min.js
// @run-at       document-start
// ==/UserScript==

/**
 * @type {typeof import("luxon").DateTime}
 */
const DateTime = luxon.DateTime;

function processChapter(url) {
  if (url.includes("/chapter/")) {
    const chapterId = url.split("/")[2];
    fetch("https://api.mangadex.org/chapter/" + chapterId)
      .then((response) => response.json())
      .then(async (data) => {
        const pages = data.data.attributes.pages;
        while (
          document.querySelectorAll('img.img[src^="blob:"]').length != pages
        ) {
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
        /**
         * @type {HTMLImageElement[]}
         */
        const images = [...document.querySelectorAll('img.img[src^="blob:"]')];
        const bytes = images
          .map((image) => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.height = image.naturalHeight;
            canvas.width = image.naturalWidth;
            context.drawImage(
              image,
              0,
              0,
              image.naturalWidth,
              image.naturalHeight
            );
            const base64String = canvas.toDataURL().substring(22);
            return atob(base64String).length;
          })
          .reduce((a, b) => a + b, 0);
        await navigator.locks.request("image-data--addData", async () => {
          /**
           * @type {Object[]}
           */
          const data = await JSON.parse(await GM.getValue("image-data", "[]"));
          data.push({
            chapterId,
            pages,
            bytes,
            createdAt: DateTime.now().setZone("UTC").toISO(),
          });
          await GM.setValue("image-data", JSON.stringify(data));
        });
      });
  }
}

let last_chapter_id = "";

setInterval(() => {
  if (window.location.pathname.includes("/chapter/")) {
    const chapterId = window.location.pathname.split("/")[2];
    if (chapterId != last_chapter_id) {
      last_chapter_id = chapterId;
      processChapter(window.location.pathname);
    }
  } else {
    last_chapter_id = "";
  }
}, 100);