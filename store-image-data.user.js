// ==UserScript==
// @name         Store Image Data
// @namespace    http://mangadex.org/
// @version      1
// @description  Store image stats
// @author       You
// @match        https://mangadex.org/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mangadex.org
// @grant        GM.getValue
// @grant        GM.setValue
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    let _pushState = History.prototype.pushState;
    History.prototype.pushState = function (state, title, url) {
        _pushState.call(this, state, title, url);
        if (url.includes("/chapter/")){
            const chapterId = url.split("/")[2];
            const data = (await fetch("https://api.mangadex.org/chapter/" + chapterId)).json();
            const pages = data.data.attributes.pages;
            navigator.locks.request("image-data--addData", async () => {
                
            });
        };
    }
}
)();