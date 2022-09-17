// ==UserScript==
// @name         Store Image Data
// @namespace    https://mangadex.org/
// @version      1.0.1
// @description  Store image Stats
// @author       PythonCoderAS
// @match        https://mangadex.org/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mangadex.org
// @grant        GM.getValue
// @grant        GM.setValue
// @run-at       document-start
// ==/UserScript==

(function () {
  "use strict";

  let _pushState = History.prototype.pushState;
  History.prototype.pushState = function (state, title, url) {
    _pushState.call(this, state, title, url);
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
          const images = [
            ...document.querySelectorAll('img.img[src^="blob:"]'),
          ];
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
            const data = await JSON.parse(GM.getValue("image-data", "[]"));
            data.push({
              chapterId,
              pages,
              bytes,
            });
            await GM.setValue("image-data", JSON.stringify(data));
          });
        });
    }
  };
})();
