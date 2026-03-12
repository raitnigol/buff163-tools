// ==UserScript==
// @name         buff163-tools – Full Inventory Toggle
// @namespace    https://github.com/raitnigol/buff163-tools
// @version      1.0.0
// @description  Toggle between default (50) and full inventory view on buff.163.com
// @author       Rait Nigol
// @license      MIT
//
// @match        https://buff.163.com/market/steam_inventory*
// @icon         https://buff.163.com/favicon.ico
//
// @homepageURL  https://github.com/raitnigol/buff163-tools
// @supportURL   https://github.com/raitnigol/buff163-tools/issues
//
// @downloadURL  https://raw.githubusercontent.com/raitnigol/buff163-tools/main/buff163-tools.user.js
// @updateURL    https://raw.githubusercontent.com/raitnigol/buff163-tools/main/buff163-tools.user.js
//
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const SELECTORS = {
        contTab: '.market-header.black .cont-tab',
        tabList: '.market-header.black .cont-tab > ul',
        briefInfo: '.market-header.black .brief-info',
    };

    const STORAGE_KEY_DEFAULT_PAGE_SIZE = 'tm_buff_default_page_size';
    const FALLBACK_DEFAULT_PAGE_SIZE = 50;

    function parseHashParams() {
        const rawHash = window.location.hash.startsWith('#')
            ? window.location.hash.slice(1)
            : window.location.hash;

        return new URLSearchParams(rawHash);
    }

    function buildHash(params) {
        const str = params.toString();
        return str ? `#${str}` : '';
    }

    function getCurrentPageSize() {
        const params = parseHashParams();
        const raw = params.get('page_size');
        if (!raw) return FALLBACK_DEFAULT_PAGE_SIZE;

        const parsed = parseInt(raw, 10);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : FALLBACK_DEFAULT_PAGE_SIZE;
    }

    function getQuantityFromBriefInfo() {
        const briefInfo = document.querySelector(SELECTORS.briefInfo);
        if (!briefInfo) return null;

        const text = briefInfo.textContent || '';
        const match = text.match(/Quantity[:：]\s*(\d+)/i);
        if (!match) return null;

        const parsed = parseInt(match[1], 10);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    }

    function getStoredDefaultPageSize() {
        const raw = localStorage.getItem(STORAGE_KEY_DEFAULT_PAGE_SIZE);
        if (!raw) return null;

        const parsed = parseInt(raw, 10);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    }

    function setStoredDefaultPageSize(size) {
        if (!Number.isFinite(size) || size <= 0) return;
        localStorage.setItem(STORAGE_KEY_DEFAULT_PAGE_SIZE, String(size));
    }

    function getDefaultPageSize() {
        return getStoredDefaultPageSize() || FALLBACK_DEFAULT_PAGE_SIZE;
    }

    function ensureDefaultPageSizeStored() {
        const quantity = getQuantityFromBriefInfo();
        const currentPageSize = getCurrentPageSize();
        const stored = getStoredDefaultPageSize();

        if (stored) return stored;

        if (quantity && currentPageSize < quantity) {
            setStoredDefaultPageSize(currentPageSize);
            return currentPageSize;
        }

        setStoredDefaultPageSize(FALLBACK_DEFAULT_PAGE_SIZE);
        return FALLBACK_DEFAULT_PAGE_SIZE;
    }

    function isFullInventoryMode() {
        const quantity = getQuantityFromBriefInfo();
        const currentPageSize = getCurrentPageSize();

        if (!quantity) return false;
        return currentPageSize >= quantity;
    }

    function forcePageSizeAndReload(newSize) {
        const params = parseHashParams();
        params.set('page_num', '1');
        params.set('page_size', String(newSize));

        const newHash = buildHash(params);

        if (window.location.hash !== newHash) {
            window.location.hash = newHash;
        }

        setTimeout(() => {
            window.location.reload();
        }, 80);
    }

    function handleToggle(event) {
        event.preventDefault();

        const quantity = getQuantityFromBriefInfo();
        if (!quantity) {
            alert('Could not detect inventory quantity from BUFF header.');
            return;
        }

        const defaultPageSize = getDefaultPageSize();

        if (isFullInventoryMode()) {
            forcePageSizeAndReload(defaultPageSize);
        } else {
            forcePageSizeAndReload(quantity);
        }
    }

    function getOrCreateTabItem(tabList) {
        let li = document.getElementById('tm-buff-fullinv-li');
        let link = document.getElementById('tm-buff-fullinv-link');

        if (!li) {
            li = document.createElement('li');
            li.id = 'tm-buff-fullinv-li';

            link = document.createElement('a');
            link.id = 'tm-buff-fullinv-link';
            link.href = 'javascript:void(0)';
            link.style.cursor = 'pointer';

            const icon = document.createElement('i');
            icon.className = 'icon icon_top_cur';

            link.appendChild(document.createTextNode('Show full inventory'));
            link.appendChild(icon);

            link.addEventListener('click', handleToggle);

            li.appendChild(link);
            tabList.appendChild(li);
        }

        return {
            li,
            link: document.getElementById('tm-buff-fullinv-link'),
        };
    }

    function renderOrUpdateButton() {
        const contTab = document.querySelector(SELECTORS.contTab);
        const tabList = document.querySelector(SELECTORS.tabList);
        const quantity = getQuantityFromBriefInfo();

        if (!contTab || !tabList || !quantity) {
            return;
        }

        ensureDefaultPageSizeStored();

        const { li, link } = getOrCreateTabItem(tabList);
        if (!li || !link) return;

        const defaultPageSize = getDefaultPageSize();

        // first child is the text node we created earlier
        let textNode = link.childNodes[0];

        if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
            textNode = document.createTextNode('');
            link.insertBefore(textNode, link.firstChild);
        }

        if (isFullInventoryMode()) {
            li.classList.remove('on');
            textNode.nodeValue = `Back to default (${defaultPageSize}) `;
            link.title = `Currently showing full inventory. Click to go back to ${defaultPageSize} items per page.`;
        } else {
            li.classList.remove('on');
            textNode.nodeValue = `Show full inventory (${quantity}) `;
            link.title = `Click to show all ${quantity} items on one page.`;
        }
    }

    function init() {
        renderOrUpdateButton();

        let tries = 0;
        const maxTries = 30;

        const intervalId = setInterval(() => {
            renderOrUpdateButton();
            tries += 1;

            if (tries >= maxTries) {
                clearInterval(intervalId);
            }
        }, 1000);

        window.addEventListener('hashchange', () => {
            setTimeout(renderOrUpdateButton, 100);
        });
    }

    init();
})();
