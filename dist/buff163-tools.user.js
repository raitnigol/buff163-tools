// ==UserScript==
// @name         buff163-tools – Full Inventory Toggle
// @namespace    https://github.com/raitnigol/buff163-tools
// @version      1.6.0
// @description  Toggle between default (50) and full inventory view on buff.163.com, show EUR equivalent for CNY purchase prices, calculate per-item P/L, filter only saleable items, and filter winners/losers
// @author       Rait Nigol
// @license      MIT
//
// @match        https://buff.163.com/market/steam_inventory*
// @match        https://buff.163.com/goods/*
// @icon         https://buff.163.com/favicon.ico
//
// @homepageURL  https://github.com/raitnigol/buff163-tools
// @supportURL   https://github.com/raitnigol/buff163-tools/issues
//
// @downloadURL  https://raw.githubusercontent.com/raitnigol/buff163-tools/main/dist/buff163-tools.user.js
// @updateURL    https://raw.githubusercontent.com/raitnigol/buff163-tools/main/dist/buff163-tools.user.js
//
// @grant        none
// ==/UserScript==

(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // src/app/runtime.js
  var require_runtime = __commonJS({
    "src/app/runtime.js"() {
      (function() {
        "use strict";
        const MODULES = window.__BUFF163_MODULES__;
        if (!MODULES || typeof MODULES !== "object") {
          console.error("[buff163-tools] Module bridge missing, aborting runtime init.");
          return;
        }
        const requireFn = (key) => {
          const fn = MODULES[key];
          return typeof fn === "function" ? fn : null;
        };
        const MODULE_SELECTORS = MODULES.SELECTORS || null;
        const MODULE_STORAGE_KEYS = MODULES.STORAGE_KEYS || null;
        const MODULE_FALLBACK_DEFAULT_PAGE_SIZE = MODULES.FALLBACK_DEFAULT_PAGE_SIZE;
        const MODULE_LOAD_SETTINGS = requireFn("loadSettings");
        const MODULE_SAVE_SETTINGS = requireFn("saveSettings");
        const MODULE_PARSE_HASH_PARAMS = requireFn("parseHashParams");
        const MODULE_BUILD_HASH = requireFn("buildHash");
        const MODULE_UPDATE_HASH_AND_RELOAD = requireFn("updateHashAndReload");
        const MODULE_GET_CACHED_CNY_EUR_RATE = requireFn("getCachedCnyEurRate");
        const MODULE_GET_CACHED_CNY_EUR_RATE_DATE = requireFn("getCachedCnyEurRateDate");
        const MODULE_GET_TODAY_ISO_DATE = requireFn("getTodayIsoDate");
        const MODULE_SET_CACHED_CNY_EUR_RATE = requireFn("setCachedCnyEurRate");
        const MODULE_ENSURE_CNY_EUR_RATE = requireFn("ensureCnyEurRate");
        const MODULE_BUILD_FX_STATUS_TEXT = requireFn("buildFxStatusText");
        const MODULE_SETUP_INVENTORY_OBSERVER = requireFn("setupInventoryObserver");
        const MODULE_COMPUTE_PL_VISIBILITY_AND_TOTALS = requireFn("computePlVisibilityAndTotals");
        const MODULE_BUILD_PL_SUMMARY_HTML = requireFn("buildPlSummaryHtml");
        const MODULE_GET_ASSET_ID_FROM_ITEM = requireFn("getAssetIdFromItem");
        const MODULE_IS_ASSET_EXCLUDED = requireFn("isAssetExcluded");
        const MODULE_SET_ASSET_EXCLUDED = requireFn("setAssetExcluded");
        const MODULE_GET_ASSET_TARGET_SELL_EUR = requireFn("getAssetTargetSellEur");
        const MODULE_SET_ASSET_TARGET_SELL_EUR = requireFn("setAssetTargetSellEur");
        const MODULE_GET_ASSET_CUSTOM_PAID_EUR = requireFn("getAssetCustomPaidEur");
        const MODULE_GET_ASSET_LEGACY_CUSTOM_PAID_CNY = requireFn("getAssetLegacyCustomPaidCny");
        const MODULE_SET_ASSET_CUSTOM_PAID_EUR = requireFn("setAssetCustomPaidEur");
        const MODULE_CREATE_STANDARD_MODAL_BACKDROP = requireFn("createStandardModalBackdrop");
        const MODULE_CLOSE_ITEM_SETTINGS_MODAL = requireFn("closeItemSettingsModal");
        const MODULE_GET_OR_CREATE_ITEM_SETTINGS_MODAL = requireFn("getOrCreateItemSettingsModal");
        const MODULE_OPEN_ITEM_SETTINGS_MODAL = requireFn("openItemSettingsModal");
        const MODULE_CLOSE_GLOBAL_SETTINGS_MODAL = requireFn("closeGlobalSettingsModal");
        const MODULE_GET_OR_CREATE_GLOBAL_SETTINGS_MODAL = requireFn("getOrCreateGlobalSettingsModal");
        const MODULE_OPEN_GLOBAL_SETTINGS_MODAL = requireFn("openGlobalSettingsModal");
        const MODULE_GET_OR_CREATE_FLOATBAR_ENTRY = requireFn("getOrCreateFloatbarEntry");
        const MODULE_STYLE_TAG_ID = typeof MODULES.STYLE_TAG_ID === "string" ? MODULES.STYLE_TAG_ID : null;
        const MODULE_GET_CARD_EXTRA_HEIGHT = requireFn("getInventoryCardExtraHeight");
        const MODULE_BUILD_INJECTED_STYLES = requireFn("buildInjectedStyles");
        const SELECTORS2 = MODULE_SELECTORS || {
          contTab: ".market-header.black .cont-tab",
          tabList: ".market-header.black .cont-tab > ul",
          briefInfo: ".market-header.black .brief-info",
          marketHeader: ".market-header.black",
          criteria: ".criteria.steam_inventory_index_filter",
          inventoryList: "#j_list_card",
          inventoryItems: "#j_list_card li.my_inventory"
        };
        const STORAGE_KEY_DEFAULT_PAGE_SIZE = MODULE_STORAGE_KEYS?.defaultPageSize || "tm_buff_default_page_size";
        const STORAGE_KEY_FULL_MODE = MODULE_STORAGE_KEYS?.fullMode || "tm_buff_full_mode";
        const STORAGE_KEY_FULL_PAGE_SIZE = MODULE_STORAGE_KEYS?.fullPageSize || "tm_buff_full_page_size";
        const STORAGE_KEY_ONLY_SALEABLE = MODULE_STORAGE_KEYS?.onlySaleable || "tm_buff_only_saleable";
        const STORAGE_KEY_PL_FILTER = MODULE_STORAGE_KEYS?.plFilter || "tm_buff_pl_filter";
        const STORAGE_KEY_SHOW_REFS = MODULE_STORAGE_KEYS?.showRefs || "tm_buff_show_refs";
        const SETTINGS_KEY = MODULE_STORAGE_KEYS?.settings || "tm_buff_settings_v1";
        const FALLBACK_DEFAULT_PAGE_SIZE2 = Number.isFinite(MODULE_FALLBACK_DEFAULT_PAGE_SIZE) && MODULE_FALLBACK_DEFAULT_PAGE_SIZE > 0 ? MODULE_FALLBACK_DEFAULT_PAGE_SIZE : 50;
        const STORAGE_KEY_CNY_EUR_RATE = MODULE_STORAGE_KEYS?.cnyEurRate || "tm_buff_cny_eur_rate";
        const STORAGE_KEY_CNY_EUR_RATE_DATE = MODULE_STORAGE_KEYS?.cnyEurRateDate || "tm_buff_cny_eur_rate_date";
        let LAST_RATE_KEY = "";
        let FX_STATUS_TEXT = "FX: not loaded";
        function loadSettingsFallback() {
          try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            if (raw) {
              const parsed = JSON.parse(raw);
              return {
                onlySaleable: parsed.onlySaleable !== void 0 ? !!parsed.onlySaleable : true,
                showRefs: parsed.showRefs !== void 0 ? !!parsed.showRefs : true,
                fullMode: parsed.fullMode !== void 0 ? !!parsed.fullMode : false,
                excludedAssetIds: parsed.excludedAssetIds && typeof parsed.excludedAssetIds === "object" ? parsed.excludedAssetIds : {},
                targetSellEurByAssetId: parsed.targetSellEurByAssetId && typeof parsed.targetSellEurByAssetId === "object" ? parsed.targetSellEurByAssetId : {},
                customPaidEurByAssetId: parsed.customPaidEurByAssetId && typeof parsed.customPaidEurByAssetId === "object" ? parsed.customPaidEurByAssetId : {},
                // Legacy fallback for migration
                customPaidCnyByAssetId: parsed.customPaidCnyByAssetId && typeof parsed.customPaidCnyByAssetId === "object" ? parsed.customPaidCnyByAssetId : {}
              };
            }
          } catch (err) {
          }
          const onlySaleableLegacy = localStorage.getItem(STORAGE_KEY_ONLY_SALEABLE);
          const fullModeLegacy = localStorage.getItem(STORAGE_KEY_FULL_MODE);
          const showRefsLegacy = localStorage.getItem(STORAGE_KEY_SHOW_REFS);
          return {
            onlySaleable: onlySaleableLegacy !== null ? onlySaleableLegacy === "1" : true,
            showRefs: showRefsLegacy !== null ? showRefsLegacy === "1" : true,
            fullMode: fullModeLegacy !== null ? fullModeLegacy === "1" : false,
            excludedAssetIds: {},
            targetSellEurByAssetId: {},
            customPaidEurByAssetId: {},
            customPaidCnyByAssetId: {}
          };
        }
        function loadSettings2() {
          const loaded = MODULE_LOAD_SETTINGS ? MODULE_LOAD_SETTINGS() : null;
          return loaded && typeof loaded === "object" ? loaded : loadSettingsFallback();
        }
        let SETTINGS = loadSettings2();
        function saveSettings2() {
          if (MODULE_SAVE_SETTINGS) return MODULE_SAVE_SETTINGS(SETTINGS);
          try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(SETTINGS));
          } catch (err) {
          }
        }
        function injectStyles() {
          const styleTagId = MODULE_STYLE_TAG_ID || "tm-buff-styles";
          if (document.getElementById(styleTagId)) return;
          const sampleCard = document.querySelector(SELECTORS2.inventoryItems);
          const baseHeight = sampleCard ? Math.ceil(sampleCard.getBoundingClientRect().height) : 260;
          const extraHeight = MODULE_GET_CARD_EXTRA_HEIGHT && Number.isFinite(MODULE_GET_CARD_EXTRA_HEIGHT()) ? MODULE_GET_CARD_EXTRA_HEIGHT() : 62;
          const finalHeight = baseHeight + extraHeight;
          const moduleStyleText = MODULE_BUILD_INJECTED_STYLES?.(finalHeight) || null;
          if (!(typeof moduleStyleText === "string" && moduleStyleText.trim())) {
            return;
          }
          const style = document.createElement("style");
          style.id = styleTagId;
          style.textContent = moduleStyleText;
          document.head.appendChild(style);
        }
        function parseHashParams2() {
          if (MODULE_PARSE_HASH_PARAMS) return MODULE_PARSE_HASH_PARAMS();
          const rawHash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
          return new URLSearchParams(rawHash);
        }
        function buildHash2(params) {
          if (MODULE_BUILD_HASH) return MODULE_BUILD_HASH(params);
          const str = params.toString();
          return str ? `#${str}` : "";
        }
        function getCurrentPageSize() {
          const params = parseHashParams2();
          const raw = params.get("page_size");
          if (!raw) return FALLBACK_DEFAULT_PAGE_SIZE2;
          const parsed = parseInt(raw, 10);
          return Number.isFinite(parsed) && parsed > 0 ? parsed : FALLBACK_DEFAULT_PAGE_SIZE2;
        }
        function getCurrentStateFilter() {
          const params = parseHashParams2();
          return params.get("state") || "all";
        }
        function getQuantityFromBriefInfo() {
          const briefInfo = document.querySelector(SELECTORS2.briefInfo);
          if (!briefInfo) return null;
          const text = briefInfo.textContent || "";
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
          return getStoredDefaultPageSize() || FALLBACK_DEFAULT_PAGE_SIZE2;
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
          setStoredDefaultPageSize(FALLBACK_DEFAULT_PAGE_SIZE2);
          return FALLBACK_DEFAULT_PAGE_SIZE2;
        }
        function isFullModeEnabled() {
          return !!SETTINGS.fullMode;
        }
        function setFullModeEnabled(enabled) {
          SETTINGS.fullMode = !!enabled;
          saveSettings2();
        }
        function getStoredFullPageSize() {
          const raw = localStorage.getItem(STORAGE_KEY_FULL_PAGE_SIZE);
          if (!raw) return null;
          const parsed = parseInt(raw, 10);
          return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
        }
        function setStoredFullPageSize(size) {
          if (!Number.isFinite(size) || size <= 0) return;
          localStorage.setItem(STORAGE_KEY_FULL_PAGE_SIZE, String(size));
        }
        function isOnlySaleableEnabled() {
          return !!SETTINGS.onlySaleable;
        }
        function setOnlySaleableEnabled(enabled) {
          SETTINGS.onlySaleable = !!enabled;
          saveSettings2();
        }
        function getPlFilter() {
          const value = localStorage.getItem(STORAGE_KEY_PL_FILTER);
          return ["all", "winners", "losers"].includes(value) ? value : "all";
        }
        function setPlFilter(value) {
          if (!["all", "winners", "losers"].includes(value)) return;
          localStorage.setItem(STORAGE_KEY_PL_FILTER, value);
        }
        function isShowRefsEnabled() {
          return !!SETTINGS.showRefs;
        }
        function setShowRefsEnabled(enabled) {
          SETTINGS.showRefs = !!enabled;
          saveSettings2();
        }
        function getAssetIdFromItem2(item) {
          return MODULE_GET_ASSET_ID_FROM_ITEM ? MODULE_GET_ASSET_ID_FROM_ITEM(item) : item?.getAttribute("data-assetid") || item?.id || "";
        }
        function isAssetExcluded2(assetId) {
          return MODULE_IS_ASSET_EXCLUDED ? !!MODULE_IS_ASSET_EXCLUDED(SETTINGS, assetId) : !!assetId && !!(SETTINGS.excludedAssetIds && SETTINGS.excludedAssetIds[assetId]);
        }
        function setAssetExcluded2(assetId, excluded) {
          if (MODULE_SET_ASSET_EXCLUDED) return MODULE_SET_ASSET_EXCLUDED(SETTINGS, saveSettings2, assetId, excluded);
          if (!assetId) return;
          if (!SETTINGS.excludedAssetIds || typeof SETTINGS.excludedAssetIds !== "object") SETTINGS.excludedAssetIds = {};
          if (excluded) SETTINGS.excludedAssetIds[assetId] = 1;
          else delete SETTINGS.excludedAssetIds[assetId];
          saveSettings2();
        }
        function getAssetTargetSellEur2(assetId) {
          return MODULE_GET_ASSET_TARGET_SELL_EUR ? MODULE_GET_ASSET_TARGET_SELL_EUR(SETTINGS, assetId) : (() => {
            if (!assetId) return null;
            const value = SETTINGS.targetSellEurByAssetId?.[assetId];
            const parsed = parseFloat(value);
            return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
          })();
        }
        function setAssetTargetSellEur2(assetId, value) {
          if (MODULE_SET_ASSET_TARGET_SELL_EUR) return MODULE_SET_ASSET_TARGET_SELL_EUR(SETTINGS, saveSettings2, assetId, value);
          if (!assetId) return;
          if (!SETTINGS.targetSellEurByAssetId || typeof SETTINGS.targetSellEurByAssetId !== "object") SETTINGS.targetSellEurByAssetId = {};
          const parsed = parseFloat(value);
          if (!Number.isFinite(parsed) || parsed <= 0) delete SETTINGS.targetSellEurByAssetId[assetId];
          else SETTINGS.targetSellEurByAssetId[assetId] = parsed.toFixed(2);
          saveSettings2();
        }
        function getAssetCustomPaidEur2(assetId) {
          return MODULE_GET_ASSET_CUSTOM_PAID_EUR ? MODULE_GET_ASSET_CUSTOM_PAID_EUR(SETTINGS, assetId) : (() => {
            if (!assetId) return null;
            const value = SETTINGS.customPaidEurByAssetId?.[assetId];
            const parsed = parseFloat(value);
            return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
          })();
        }
        function getAssetLegacyCustomPaidCny2(assetId) {
          return MODULE_GET_ASSET_LEGACY_CUSTOM_PAID_CNY ? MODULE_GET_ASSET_LEGACY_CUSTOM_PAID_CNY(SETTINGS, assetId) : (() => {
            if (!assetId) return null;
            const value = SETTINGS.customPaidCnyByAssetId?.[assetId];
            const parsed = parseFloat(value);
            return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
          })();
        }
        function setAssetCustomPaidEur2(assetId, value) {
          if (MODULE_SET_ASSET_CUSTOM_PAID_EUR) return MODULE_SET_ASSET_CUSTOM_PAID_EUR(SETTINGS, saveSettings2, assetId, value);
          if (!assetId) return;
          if (!SETTINGS.customPaidEurByAssetId || typeof SETTINGS.customPaidEurByAssetId !== "object") SETTINGS.customPaidEurByAssetId = {};
          const parsed = parseFloat(value);
          if (!Number.isFinite(parsed) || parsed <= 0) delete SETTINGS.customPaidEurByAssetId[assetId];
          else SETTINGS.customPaidEurByAssetId[assetId] = parsed.toFixed(2);
          saveSettings2();
        }
        function createStandardModalBackdrop2({
          backdropId,
          modalId,
          title,
          closeId,
          bodyHtml
        }) {
          if (MODULE_CREATE_STANDARD_MODAL_BACKDROP) {
            return MODULE_CREATE_STANDARD_MODAL_BACKDROP({ backdropId, modalId, title, closeId, bodyHtml });
          }
          let backdrop = document.getElementById(backdropId);
          if (backdrop) return backdrop;
          backdrop = document.createElement("div");
          backdrop.id = backdropId;
          backdrop.innerHTML = `
            <div id="${modalId}">
                <div class="tm-buff-modal-header">
                    <div class="tm-buff-modal-title">${title}</div>
                    <button type="button" class="tm-buff-modal-close" id="${closeId}" aria-label="Close">\xD7</button>
                </div>
                <div class="tm-buff-modal-body">
                    ${bodyHtml}
                </div>
            </div>
        `;
          document.body.appendChild(backdrop);
          return backdrop;
        }
        function closeItemSettingsModal2() {
          if (MODULE_CLOSE_ITEM_SETTINGS_MODAL) return MODULE_CLOSE_ITEM_SETTINGS_MODAL();
          const backdrop = document.getElementById("tm-buff-item-modal-backdrop");
          if (!backdrop) return;
          backdrop.style.display = "none";
          backdrop.dataset.assetId = "";
        }
        function getOrCreateItemSettingsModal2() {
          return MODULE_GET_OR_CREATE_ITEM_SETTINGS_MODAL ? MODULE_GET_OR_CREATE_ITEM_SETTINGS_MODAL({
            onClose: closeItemSettingsModal2,
            onSave: (backdrop) => {
              const assetId = backdrop.dataset.assetId || "";
              if (!assetId) return;
              const targetInput = backdrop.querySelector("#tm-buff-modal-target");
              const paidInput = backdrop.querySelector("#tm-buff-modal-paid-eur");
              const excludedInput = backdrop.querySelector("#tm-buff-modal-excluded");
              const targetValue = targetInput ? targetInput.value : "";
              const paidValue = paidInput ? paidInput.value : "";
              const excluded = !!(excludedInput && excludedInput.checked);
              setAssetTargetSellEur2(assetId, targetValue);
              setAssetCustomPaidEur2(assetId, paidValue);
              setAssetExcluded2(assetId, excluded);
              closeItemSettingsModal2();
              const currentRate = getCachedCnyEurRate2();
              if (currentRate) {
                renderPaidEurValues(currentRate, true);
                applyPlFilterAndSummary();
              } else {
                initPaidEurFeature();
              }
            },
            createBackdrop: createStandardModalBackdrop2
          }) : null;
        }
        function openItemSettingsModal2(item, marketPriceEur) {
          if (!MODULE_OPEN_ITEM_SETTINGS_MODAL) return;
          MODULE_OPEN_ITEM_SETTINGS_MODAL({
            item,
            marketPriceEur,
            getOrCreateModal: getOrCreateItemSettingsModal2,
            getAssetIdFromItem: getAssetIdFromItem2,
            getAssetTargetSellEur: getAssetTargetSellEur2,
            getAssetCustomPaidEur: getAssetCustomPaidEur2,
            getAssetLegacyCustomPaidCny: getAssetLegacyCustomPaidCny2,
            isAssetExcluded: isAssetExcluded2,
            formatEur
          });
        }
        function closeGlobalSettingsModal2() {
          if (MODULE_CLOSE_GLOBAL_SETTINGS_MODAL) return MODULE_CLOSE_GLOBAL_SETTINGS_MODAL();
          const backdrop = document.getElementById("tm-buff-global-settings-backdrop");
          if (!backdrop) return;
          backdrop.style.display = "none";
        }
        function getOrCreateGlobalSettingsModal2() {
          return MODULE_GET_OR_CREATE_GLOBAL_SETTINGS_MODAL ? MODULE_GET_OR_CREATE_GLOBAL_SETTINGS_MODAL({
            createStandardModalBackdrop: createStandardModalBackdrop2,
            closeGlobalSettingsModalHandler: closeGlobalSettingsModal2,
            onSave: (backdrop) => {
              const onlySaleableInput = backdrop.querySelector("#tm-buff-global-only-saleable");
              const showRefsInput = backdrop.querySelector("#tm-buff-global-show-refs");
              setOnlySaleableEnabled(!!onlySaleableInput?.checked);
              setShowRefsEnabled(!!showRefsInput?.checked);
              closeGlobalSettingsModal2();
              refreshUiAndPl();
            }
          }) : null;
        }
        function openGlobalSettingsModal2() {
          if (!MODULE_OPEN_GLOBAL_SETTINGS_MODAL) return;
          MODULE_OPEN_GLOBAL_SETTINGS_MODAL({
            getOrCreateGlobalSettingsModal: getOrCreateGlobalSettingsModal2,
            isOnlySaleableEnabled,
            isShowRefsEnabled,
            fxStatusText: FX_STATUS_TEXT
          });
        }
        function getOrCreateFloatbarEntry2() {
          if (!MODULE_GET_OR_CREATE_FLOATBAR_ENTRY) return;
          MODULE_GET_OR_CREATE_FLOATBAR_ENTRY({
            onOpenGlobalSettingsModal: openGlobalSettingsModal2
          });
        }
        function isFullInventoryMode() {
          const quantity = getQuantityFromBriefInfo();
          const currentPageSize = getCurrentPageSize();
          if (!quantity) return false;
          return currentPageSize >= quantity;
        }
        function updateHashAndReload2(mutator) {
          if (MODULE_UPDATE_HASH_AND_RELOAD) return MODULE_UPDATE_HASH_AND_RELOAD(mutator);
          const params = parseHashParams2();
          mutator(params);
          const newHash = buildHash2(params);
          if (window.location.hash !== newHash) {
            window.location.hash = newHash;
          }
          setTimeout(() => {
            window.location.reload();
          }, 80);
        }
        function forcePageSizeAndReload(newSize) {
          updateHashAndReload2((params) => {
            params.set("page_num", "1");
            params.set("page_size", String(newSize));
          });
        }
        function setTabText(text, title = "") {
          const link = document.getElementById("tm-buff-fullinv-link");
          if (!link) return;
          let textNode = link.childNodes[0];
          if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
            textNode = document.createTextNode("");
            link.insertBefore(textNode, link.firstChild);
          }
          textNode.nodeValue = `${text} `;
          link.title = title;
        }
        function handleToggle(event) {
          event.preventDefault();
          const quantity = getQuantityFromBriefInfo();
          if (!quantity) {
            alert("Could not detect inventory quantity from BUFF header.");
            return;
          }
          const defaultPageSize = getDefaultPageSize();
          if (isFullInventoryMode()) {
            setFullModeEnabled(false);
            setTabText(
              `Switching to default (${defaultPageSize})...`,
              `Switching back to default (${defaultPageSize}) items per page.`
            );
            forcePageSizeAndReload(defaultPageSize);
          } else {
            setFullModeEnabled(true);
            setStoredFullPageSize(quantity);
            setTabText(
              `Loading full inventory (${quantity})...`,
              `Loading full inventory (${quantity} items).`
            );
            forcePageSizeAndReload(quantity);
          }
        }
        function handleOnlySaleableChange(checked) {
          setOnlySaleableEnabled(checked);
          const targetState = checked ? "cansell" : "all";
          if (getCurrentStateFilter() === targetState) {
            return;
          }
          updateHashAndReload2((params) => {
            params.set("page_num", "1");
            params.set("state", targetState);
          });
        }
        function handlePlFilterChange(value) {
          setPlFilter(value);
          applyPlFilterAndSummary();
        }
        function getOrCreateTabItem(tabList) {
          let li = document.getElementById("tm-buff-fullinv-li");
          let link = document.getElementById("tm-buff-fullinv-link");
          if (!li) {
            li = document.createElement("li");
            li.id = "tm-buff-fullinv-li";
            link = document.createElement("a");
            link.id = "tm-buff-fullinv-link";
            link.href = "javascript:void(0)";
            link.style.cursor = "pointer";
            const icon = document.createElement("i");
            icon.className = "icon icon_top_cur";
            link.appendChild(document.createTextNode("Show full inventory"));
            link.appendChild(icon);
            link.addEventListener("click", handleToggle);
            li.appendChild(link);
            tabList.appendChild(li);
          }
          return {
            li,
            link: document.getElementById("tm-buff-fullinv-link")
          };
        }
        function renderOrUpdateButton() {
          const contTab = document.querySelector(SELECTORS2.contTab);
          const tabList = document.querySelector(SELECTORS2.tabList);
          const quantity = getQuantityFromBriefInfo();
          if (!contTab || !tabList || !quantity) {
            return;
          }
          ensureDefaultPageSizeStored();
          const { li, link } = getOrCreateTabItem(tabList);
          if (!li || !link) return;
          const defaultPageSize = getDefaultPageSize();
          let textNode = link.childNodes[0];
          if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
            textNode = document.createTextNode("");
            link.insertBefore(textNode, link.firstChild);
          }
          li.classList.remove("on");
          if (isFullInventoryMode()) {
            textNode.nodeValue = `Back to default (${defaultPageSize}) `;
            link.title = `Currently showing full inventory. Click to go back to ${defaultPageSize} items per page.`;
          } else {
            textNode.nodeValue = `Show full inventory (${quantity}) `;
            link.title = `Click to show all ${quantity} items on one page.`;
          }
        }
        function enforceFullModeIfNeeded() {
          if (!isFullModeEnabled()) {
            return;
          }
          const quantity = getQuantityFromBriefInfo();
          const storedFullPageSize = getStoredFullPageSize();
          const desiredPageSize = quantity || storedFullPageSize;
          const currentPageSize = getCurrentPageSize();
          if (!desiredPageSize || currentPageSize >= desiredPageSize) {
            return;
          }
          updateHashAndReload2((params) => {
            params.set("page_num", "1");
            params.set("page_size", String(desiredPageSize));
          });
        }
        function enforceOnlySaleableIfNeeded() {
          const desiredState = isOnlySaleableEnabled() ? "cansell" : "all";
          const currentState = getCurrentStateFilter();
          if (currentState === desiredState) {
            return;
          }
          updateHashAndReload2((params) => {
            params.set("page_num", "1");
            params.set("state", desiredState);
          });
        }
        function getCachedCnyEurRate2() {
          return MODULE_GET_CACHED_CNY_EUR_RATE ? MODULE_GET_CACHED_CNY_EUR_RATE() : (() => {
            const rawRate = localStorage.getItem(STORAGE_KEY_CNY_EUR_RATE);
            if (!rawRate) return null;
            const rate = parseFloat(rawRate);
            return Number.isFinite(rate) && rate > 0 ? rate : null;
          })();
        }
        function getCachedCnyEurRateDate2() {
          return MODULE_GET_CACHED_CNY_EUR_RATE_DATE ? MODULE_GET_CACHED_CNY_EUR_RATE_DATE() : localStorage.getItem(STORAGE_KEY_CNY_EUR_RATE_DATE) || "";
        }
        function getTodayIsoDate2() {
          return MODULE_GET_TODAY_ISO_DATE ? MODULE_GET_TODAY_ISO_DATE() : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
        }
        function setCachedCnyEurRate2(rate, date = "") {
          if (MODULE_SET_CACHED_CNY_EUR_RATE) return MODULE_SET_CACHED_CNY_EUR_RATE(rate, date);
          if (!Number.isFinite(rate) || rate <= 0) return;
          localStorage.setItem(STORAGE_KEY_CNY_EUR_RATE, String(rate));
          if (date) localStorage.setItem(STORAGE_KEY_CNY_EUR_RATE_DATE, date);
        }
        async function ensureCnyEurRate2() {
          if (MODULE_ENSURE_CNY_EUR_RATE) return MODULE_ENSURE_CNY_EUR_RATE();
          const cachedRate = getCachedCnyEurRate2();
          const cachedDate = getCachedCnyEurRateDate2();
          const today = getTodayIsoDate2();
          if (cachedRate && cachedDate === today) return cachedRate;
          try {
            const response = await fetch("https://api.frankfurter.dev/v1/latest?base=CNY&symbols=EUR");
            if (!response.ok) throw new Error(`Failed to fetch exchange rate: HTTP ${response.status}`);
            const data = await response.json();
            const rate = data?.rates?.EUR;
            if (!Number.isFinite(rate) || rate <= 0) throw new Error("Invalid CNY\u2192EUR exchange rate received");
            setCachedCnyEurRate2(rate, data?.date || "");
            return rate;
          } catch (err) {
            if (cachedRate) return cachedRate;
            throw err;
          }
        }
        function parseJsonAttribute(element, attrName) {
          const raw = element.getAttribute(attrName);
          if (!raw) return null;
          try {
            return JSON.parse(raw);
          } catch (err) {
            return null;
          }
        }
        function getBuyPriceCnyFromItem(item) {
          const orderExtra = parseJsonAttribute(item, "data-order-extra");
          if (orderExtra && orderExtra.buy_price) {
            const buyPrice = parseFloat(orderExtra.buy_price);
            if (Number.isFinite(buyPrice) && buyPrice > 0) {
              return buyPrice;
            }
          }
          const remarkLink = item.querySelector(".asset-remark-edit[data-buy_price]");
          if (remarkLink) {
            const buyPrice = parseFloat(remarkLink.getAttribute("data-buy_price"));
            if (Number.isFinite(buyPrice) && buyPrice > 0) {
              return buyPrice;
            }
          }
          return null;
        }
        function getMarketPriceEurFromItem(item) {
          const strong = item.querySelector("p strong.f_Strong");
          if (!strong) return null;
          const text = strong.textContent || "";
          const cleaned = text.replace(/[^\d,.\-]/g, "").replace(",", ".");
          const value = parseFloat(cleaned);
          return Number.isFinite(value) ? value : null;
        }
        function formatEur(value) {
          return `\u20AC ${value.toFixed(2)}`;
        }
        function getPriceContainer(item) {
          return item.querySelector("p");
        }
        function getOrCreateMetaBlock(item) {
          let block = item.querySelector(".tm-buff-meta");
          if (block) return block;
          const priceContainer = getPriceContainer(item);
          if (!priceContainer) return null;
          block = document.createElement("div");
          block.className = "tm-buff-meta";
          const paidLine = document.createElement("span");
          paidLine.className = "tm-buff-meta-line tm-buff-meta-paid";
          paidLine.innerHTML = "&nbsp;";
          const plLine = document.createElement("span");
          plLine.className = "tm-buff-meta-line tm-buff-meta-pl";
          plLine.innerHTML = "&nbsp;";
          const refsLine = document.createElement("span");
          refsLine.className = "tm-buff-meta-line tm-buff-meta-refs";
          refsLine.innerHTML = "&nbsp;";
          const actionsLine = document.createElement("span");
          actionsLine.className = "tm-buff-meta-line tm-buff-meta-actions";
          actionsLine.innerHTML = "&nbsp;";
          block.appendChild(paidLine);
          block.appendChild(plLine);
          block.appendChild(refsLine);
          block.appendChild(actionsLine);
          priceContainer.insertAdjacentElement("afterend", block);
          return block;
        }
        function renderPaidEurValues(rate, forceRefresh = false) {
          const items = document.querySelectorAll(SELECTORS2.inventoryItems);
          if (!items.length) return;
          const rateDate = getCachedCnyEurRateDate2();
          const rateKey = Number.isFinite(rate) && rate > 0 ? rate.toFixed(6) : "";
          LAST_RATE_KEY = rateKey || LAST_RATE_KEY;
          items.forEach((item) => {
            if (!forceRefresh && rateKey && item.dataset.tmBuffProcessed === rateKey) {
              return;
            }
            const block = getOrCreateMetaBlock(item);
            if (!block) return;
            const paidLine = block.querySelector(".tm-buff-meta-paid");
            const plLine = block.querySelector(".tm-buff-meta-pl");
            const refsLine = block.querySelector(".tm-buff-meta-refs");
            const actionsLine = block.querySelector(".tm-buff-meta-actions");
            if (!paidLine || !plLine || !refsLine || !actionsLine) return;
            const assetId = getAssetIdFromItem2(item);
            const customPaidEur = getAssetCustomPaidEur2(assetId);
            const legacyCustomPaidCny = getAssetLegacyCustomPaidCny2(assetId);
            const buffPaidCny = getBuyPriceCnyFromItem(item);
            const isCustomPaidEur = Number.isFinite(customPaidEur) && customPaidEur > 0;
            const isCustomPaidCnyLegacy = !isCustomPaidEur && Number.isFinite(legacyCustomPaidCny) && legacyCustomPaidCny > 0;
            const isCustomPaid = isCustomPaidEur || isCustomPaidCnyLegacy;
            const marketPriceEur = getMarketPriceEurFromItem(item);
            plLine.classList.remove("pl-positive", "pl-negative");
            delete item.dataset.tmBuffPl;
            const goodsInfo = parseJsonAttribute(item, "data-goods-info") || {};
            const itemInfo = parseJsonAttribute(item, "data-item-info") || {};
            const excluded = isAssetExcluded2(assetId);
            const isMergedItem = item.classList.contains("card_folder") || !!item.querySelector(".fold_asset_count[data-fold_asset_count]");
            item.dataset.tmBuffExcluded = excluded ? "1" : "0";
            item.classList.toggle("tm-buff-item-excluded", excluded);
            const listingCny = Number.isFinite(parseFloat(itemInfo.price)) ? parseFloat(itemInfo.price) : null;
            const floorCny = Number.isFinite(parseFloat(goodsInfo.sell_min_price)) ? parseFloat(goodsInfo.sell_min_price) : null;
            const steamCny = Number.isFinite(parseFloat(goodsInfo.steam_price_cny)) ? parseFloat(goodsInfo.steam_price_cny) : null;
            const steamUsd = Number.isFinite(parseFloat(goodsInfo.steam_price)) ? parseFloat(goodsInfo.steam_price) : null;
            const steamEurFromCny = steamCny && Number.isFinite(rate) && rate > 0 ? steamCny * rate : null;
            const targetSellEur = getAssetTargetSellEur2(assetId);
            const isReadyToSell = Number.isFinite(marketPriceEur) && Number.isFinite(targetSellEur) && marketPriceEur >= targetSellEur;
            item.classList.toggle("tm-buff-item-ready", !excluded && isReadyToSell);
            const showRefs = isShowRefsEnabled();
            if (showRefs && (listingCny || floorCny || steamCny || steamUsd)) {
              const summaryBits = [];
              if (listingCny) {
                summaryBits.push(`BUFF \xA5${listingCny.toFixed(0)}`);
              }
              if (steamEurFromCny) {
                summaryBits.push(`Steam \u20AC${steamEurFromCny.toFixed(0)}`);
              } else if (steamCny) {
                summaryBits.push(`Steam \xA5${steamCny.toFixed(0)}`);
              }
              const summaryText = summaryBits.join(" \xB7 ");
              const targetStatusClass = isReadyToSell ? "tm-buff-target-status ready" : "tm-buff-target-status";
              const targetStatusText = targetSellEur ? isReadyToSell ? "Ready" : "Waiting" : "";
              refsLine.innerHTML = `<span class="tm-buff-meta-label">Refs:</span><span class="tm-buff-meta-value">${summaryText}</span>`;
              actionsLine.innerHTML = !isMergedItem && assetId && targetStatusText ? `<span class="tm-buff-target-status ${targetStatusClass.includes("ready") ? "ready" : ""}">${targetStatusText}</span>` : isMergedItem ? `<span class="tm-buff-merged-note">Merged stack (settings unavailable)</span>` : "";
              const fullParts = [];
              if (listingCny) fullParts.push(`BUFF listing: \xA5 ${listingCny.toFixed(2)}`);
              if (floorCny) fullParts.push(`BUFF floor: \xA5 ${floorCny.toFixed(2)}`);
              if (steamCny) fullParts.push(`Steam (CNY): \xA5 ${steamCny.toFixed(2)}`);
              if (steamEurFromCny) fullParts.push(`Steam (EUR, via rate): \u20AC ${steamEurFromCny.toFixed(2)}`);
              if (steamUsd) fullParts.push(`Steam (USD): $ ${steamUsd.toFixed(2)}`);
              if (targetSellEur) {
                fullParts.push(`Target sell (EUR): \u20AC ${targetSellEur.toFixed(2)}`);
                fullParts.push(`Status: ${isReadyToSell ? "Ready" : "Waiting"}`);
              }
              refsLine.title = fullParts.join(" \xB7 ");
              actionsLine.removeAttribute("title");
            } else {
              const targetStatusClass = isReadyToSell ? "tm-buff-target-status ready" : "tm-buff-target-status";
              const targetStatusText = targetSellEur ? isReadyToSell ? "Ready" : "Waiting" : "";
              refsLine.innerHTML = "&nbsp;";
              actionsLine.innerHTML = !isMergedItem && assetId && targetStatusText ? `<span class="tm-buff-target-status ${targetStatusClass.includes("ready") ? "ready" : ""}">${targetStatusText}</span>` : isMergedItem ? `<span class="tm-buff-merged-note">Merged stack (settings unavailable)</span>` : "&nbsp;";
              refsLine.removeAttribute("title");
              actionsLine.removeAttribute("title");
            }
            let settingsBtn = item.querySelector(".tm-buff-item-settings-btn");
            if (!isMergedItem && assetId) {
              if (!settingsBtn) {
                settingsBtn = document.createElement("button");
                settingsBtn.type = "button";
                settingsBtn.className = "tm-buff-item-settings-btn";
                settingsBtn.title = "Open item settings";
                settingsBtn.innerHTML = `
                        <i class="tm-buff-item-settings-icon" aria-hidden="true">\u2699</i>
                    `;
                item.appendChild(settingsBtn);
              }
              if (settingsBtn.dataset.tmBuffBound !== "1") {
                settingsBtn.dataset.tmBuffBound = "1";
                settingsBtn.addEventListener("click", (event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  const currentMarketPriceEur = getMarketPriceEurFromItem(item);
                  openItemSettingsModal2(item, currentMarketPriceEur);
                });
              }
            } else if (settingsBtn) {
              settingsBtn.remove();
            }
            let stateChip = item.querySelector(".tm-buff-card-state-chip");
            if (!isMergedItem && assetId) {
              if (!stateChip) {
                stateChip = document.createElement("span");
                stateChip.className = "tm-buff-card-state-chip";
                item.appendChild(stateChip);
              }
              stateChip.textContent = excluded ? "Excluded" : "Included";
              stateChip.classList.toggle("is-excluded", excluded);
              stateChip.title = excluded ? "Excluded from totals" : "Included in totals";
            } else if (stateChip) {
              stateChip.remove();
            }
            if (!buffPaidCny && !isCustomPaid) {
              paidLine.innerHTML = "&nbsp;";
              plLine.innerHTML = "&nbsp;";
              paidLine.removeAttribute("title");
              plLine.removeAttribute("title");
              paidLine.classList.remove("tm-buff-meta-paid-custom");
              return;
            }
            const paidEur = isCustomPaidEur ? customPaidEur : isCustomPaidCnyLegacy ? legacyCustomPaidCny * rate : buffPaidCny * rate;
            const paidCnyForTooltip = isCustomPaidEur ? Number.isFinite(rate) && rate > 0 ? customPaidEur / rate : null : isCustomPaidCnyLegacy ? legacyCustomPaidCny : buffPaidCny;
            paidLine.classList.toggle("tm-buff-meta-paid-custom", isCustomPaid);
            paidLine.innerHTML = `<span class="tm-buff-meta-label">${isCustomPaid ? "Paid*:" : "Paid:"}</span><span class="tm-buff-meta-value">${formatEur(paidEur)}</span>`;
            paidLine.title = rateDate ? `${isCustomPaid ? "Custom paid" : "Buy price"}: ${paidCnyForTooltip !== null ? `\xA5 ${paidCnyForTooltip.toFixed(2)} \xB7 ` : ""}${paidEur.toFixed(2)} EUR \xB7 Rate date: ${rateDate}` : `${isCustomPaid ? "Custom paid" : "Buy price"}: ${paidCnyForTooltip !== null ? `\xA5 ${paidCnyForTooltip.toFixed(2)} \xB7 ` : ""}${paidEur.toFixed(2)} EUR`;
            if (!Number.isFinite(marketPriceEur)) {
              plLine.innerHTML = "&nbsp;";
              plLine.removeAttribute("title");
              return;
            }
            const pl = marketPriceEur - paidEur;
            item.dataset.tmBuffPl = String(pl);
            const plPercent = paidEur > 0 ? pl / paidEur * 100 : null;
            const sign = pl > 0 ? "+" : "";
            const plText = `${sign}${formatEur(pl)}${plPercent !== null ? ` (${sign}${plPercent.toFixed(1)}%)` : ""}`;
            plLine.innerHTML = `<span class="tm-buff-meta-label">P/L:</span><span class="tm-buff-meta-value">${plText}</span>`;
            plLine.title = `Market: ${formatEur(marketPriceEur)} \xB7 Paid: ${formatEur(paidEur)}`;
            if (pl > 0) {
              plLine.classList.add("pl-positive");
            } else if (pl < 0) {
              plLine.classList.add("pl-negative");
            }
            if (rateKey) {
              item.dataset.tmBuffProcessed = rateKey;
            }
          });
        }
        function applyPlFilterAndSummary() {
          if (!MODULE_COMPUTE_PL_VISIBILITY_AND_TOTALS) return;
          const filter = getPlFilter();
          const onlySaleable = isOnlySaleableEnabled();
          const result = MODULE_COMPUTE_PL_VISIBILITY_AND_TOTALS({
            inventoryItemsSelector: SELECTORS2.inventoryItems,
            filter
          });
          if (!result || typeof result !== "object") return;
          updateSummary(
            result.total,
            result.count,
            filter,
            result.winnersTotal,
            result.losersTotal,
            result.winnersCount,
            result.losersCount,
            onlySaleable,
            result.excludedCount
          );
        }
        function updateSummary(total, count, filter, winnersTotal, losersTotal, winnersCount, losersCount, onlySaleable, excludedCount) {
          const summary = document.getElementById("tm-buff-pl-summary");
          if (!summary) return;
          if (!MODULE_BUILD_PL_SUMMARY_HTML) return;
          summary.innerHTML = MODULE_BUILD_PL_SUMMARY_HTML({
            total,
            count,
            filter,
            winnersTotal,
            losersTotal,
            winnersCount,
            losersCount,
            onlySaleable,
            excludedCount,
            formatEur
          });
        }
        function updateFxInfo(opts) {
          if (MODULE_BUILD_FX_STATUS_TEXT) {
            FX_STATUS_TEXT = MODULE_BUILD_FX_STATUS_TEXT(opts);
          }
        }
        function getOrCreateToolbar() {
          const marketHeader = document.querySelector(SELECTORS2.marketHeader);
          const criteria = document.querySelector(SELECTORS2.criteria);
          if (!marketHeader || !criteria) return null;
          let toolbar = document.getElementById("tm-buff-toolbar");
          if (toolbar) return toolbar;
          toolbar = document.createElement("div");
          toolbar.id = "tm-buff-toolbar";
          const title = document.createElement("span");
          title.className = "tm-buff-toolbar-title";
          title.textContent = "buff163-tools";
          const plFilterWrap = document.createElement("label");
          plFilterWrap.className = "tm-buff-toolbar-option";
          const plFilterText = document.createElement("span");
          plFilterText.textContent = "P/L filter";
          const plFilterSelect = document.createElement("select");
          plFilterSelect.id = "tm-buff-pl-filter";
          [
            ["all", "All"],
            ["winners", "Winners"],
            ["losers", "Losers"]
          ].forEach(([value, label]) => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = label;
            plFilterSelect.appendChild(option);
          });
          plFilterSelect.value = getPlFilter();
          plFilterSelect.addEventListener("change", () => {
            handlePlFilterChange(plFilterSelect.value);
          });
          plFilterWrap.appendChild(plFilterText);
          plFilterWrap.appendChild(plFilterSelect);
          const summary = document.createElement("span");
          summary.id = "tm-buff-pl-summary";
          summary.className = "tm-buff-summary";
          summary.innerHTML = "Visible P/L (All, 0 items): <strong>\u20AC 0.00</strong>";
          toolbar.appendChild(title);
          toolbar.appendChild(plFilterWrap);
          toolbar.appendChild(summary);
          criteria.insertAdjacentElement("beforebegin", toolbar);
          return toolbar;
        }
        function syncToolbarState() {
          const plFilterSelect = document.getElementById("tm-buff-pl-filter");
          if (plFilterSelect) {
            plFilterSelect.value = getPlFilter();
          }
        }
        async function initPaidEurFeature() {
          const inventoryList = document.querySelector(SELECTORS2.inventoryList);
          if (!inventoryList) {
            return;
          }
          try {
            const rate = await ensureCnyEurRate2();
            const date = getCachedCnyEurRateDate2();
            renderPaidEurValues(rate);
            applyPlFilterAndSummary();
            updateFxInfo({ rate, date });
          } catch (err) {
            console.error("[buff163-tools] Failed to initialize CNY\u2192EUR conversion:", err);
            updateFxInfo({ error: true });
            const summary = document.getElementById("tm-buff-pl-summary");
            if (summary) {
              summary.innerHTML = "Visible P/L: <strong>unavailable (FX error)</strong>";
              summary.classList.remove("positive", "negative");
            }
          }
        }
        function summarizeTierLadder() {
          const container = document.querySelector("#relative-goods .scope-btns");
          if (!container) return;
          let target = document.getElementById("tm-buff-goods-analysis");
          if (!target) {
            target = document.createElement("div");
            target.id = "tm-buff-goods-analysis";
            container.insertAdjacentElement("afterend", target);
          }
          const buttons = Array.from(container.querySelectorAll("a.i_Btn"));
          if (!buttons.length) {
            target.textContent = "No wear / StatTrak price ladder available.";
            return;
          }
          const tiers = [];
          buttons.forEach((btn) => {
            const text = btn.textContent.replace(/\s+/g, " ").trim();
            if (!text) return;
            const priceMatch = text.match(/€\s*([\d.,]+)/);
            if (!priceMatch) return;
            const price = parseFloat(priceMatch[1].replace(",", "."));
            if (!Number.isFinite(price) || price <= 0) return;
            let kind = "normal";
            if (/StatTrak/i.test(text)) {
              kind = "stattrak";
            } else if (/Souvenir/i.test(text)) {
              kind = "souvenir";
            }
            let wear = "Other";
            if (/Factory New/i.test(text)) wear = "Factory New";
            else if (/Minimal Wear/i.test(text)) wear = "Minimal Wear";
            else if (/Field-Tested/i.test(text)) wear = "Field-Tested";
            else if (/Well-Worn/i.test(text)) wear = "Well-Worn";
            else if (/Battle-Scarred/i.test(text)) wear = "Battle-Scarred";
            tiers.push({ label: text, price, kind, wear });
          });
          if (!tiers.length) {
            target.textContent = "No wear / StatTrak price ladder available.";
            return;
          }
          const normals = tiers.filter((t) => t.kind === "normal");
          const stattraks = tiers.filter((t) => t.kind === "stattrak");
          let baselineNormal = null;
          if (normals.length) {
            baselineNormal = normals.reduce((min, t) => t.price < min.price ? t : min, normals[0]);
          }
          const anomalyNotes = [];
          if (baselineNormal && stattraks.length) {
            const cheapestSt = stattraks.reduce((min, t) => t.price < min.price ? t : min, stattraks[0]);
            if (cheapestSt.price < baselineNormal.price) {
              anomalyNotes.push(
                `Cheapest StatTrak (\u20AC${cheapestSt.price.toFixed(2)}) is cheaper than cheapest normal (\u20AC${baselineNormal.price.toFixed(2)}).`
              );
            }
          }
          const fn = normals.find((t) => t.wear === "Factory New");
          const mw = normals.find((t) => t.wear === "Minimal Wear");
          const ft = normals.find((t) => t.wear === "Field-Tested");
          if (fn && mw) {
            const ratio = fn.price / mw.price;
            if (ratio >= 3) {
              anomalyNotes.push(
                `Factory New (\u20AC${fn.price.toFixed(2)}) is ${ratio.toFixed(1)}\xD7 Minimal Wear (\u20AC${mw.price.toFixed(2)}).`
              );
            }
          }
          if (fn && ft) {
            const ratio = fn.price / ft.price;
            if (ratio >= 5) {
              anomalyNotes.push(
                `Factory New (\u20AC${fn.price.toFixed(2)}) is ${ratio.toFixed(1)}\xD7 Field-Tested (\u20AC${ft.price.toFixed(2)}).`
              );
            }
          }
          tiers.sort((a, b) => a.price - b.price);
          const lines = [];
          lines.push('<div class="tm-buff-analysis-title">buff163-tools \xB7 Price ladder</div>');
          lines.push(
            '<div class="tm-buff-analysis-row">' + tiers.map((t) => `${t.kind === "stattrak" ? "StatTrak " : t.kind === "souvenir" ? "Souvenir " : ""}${t.wear}: \u20AC${t.price.toFixed(2)}`).join(" \xB7 ") + "</div>"
          );
          if (anomalyNotes.length) {
            lines.push(
              `<div class="tm-buff-analysis-row tm-buff-analysis-flag">Possible anomalies:</div><div class="tm-buff-analysis-row">${anomalyNotes.join(" ")}</div>`
            );
          } else {
            lines.push('<div class="tm-buff-analysis-note">No obvious ladder anomalies detected.</div>');
          }
          target.innerHTML = lines.join("");
        }
        function refreshUiAndPl() {
          getOrCreateFloatbarEntry2();
          getOrCreateToolbar();
          syncToolbarState();
          enforceOnlySaleableIfNeeded();
          enforceFullModeIfNeeded();
          renderOrUpdateButton();
          initPaidEurFeature();
        }
        function setupInventoryObserver2() {
          if (!MODULE_SETUP_INVENTORY_OBSERVER) return;
          MODULE_SETUP_INVENTORY_OBSERVER({
            inventoryListSelector: SELECTORS2.inventoryList,
            onRefresh: refreshUiAndPl,
            debounceMs: 100,
            observerFlag: "tmBuffObserverAttached",
            errorPrefix: "[buff163-tools] Mutation observer refresh failed:"
          });
        }
        function init() {
          injectStyles();
          if (/^\/goods\/\d+/.test(window.location.pathname)) {
            summarizeTierLadder();
            return;
          }
          refreshUiAndPl();
          setupInventoryObserver2();
          let tries = 0;
          const maxTries = 20;
          const intervalId = setInterval(() => {
            refreshUiAndPl();
            setupInventoryObserver2();
            tries += 1;
            if (tries >= maxTries) {
              clearInterval(intervalId);
            }
          }, 1e3);
          window.addEventListener("hashchange", () => {
            setTimeout(() => {
              refreshUiAndPl();
              setupInventoryObserver2();
            }, 100);
          });
        }
        init();
      })();
    }
  });

  // src/config/selectors.js
  var SELECTORS = {
    contTab: ".market-header.black .cont-tab",
    tabList: ".market-header.black .cont-tab > ul",
    briefInfo: ".market-header.black .brief-info",
    marketHeader: ".market-header.black",
    criteria: ".criteria.steam_inventory_index_filter",
    inventoryList: "#j_list_card",
    inventoryItems: "#j_list_card li.my_inventory"
  };

  // src/config/storage.js
  var STORAGE_KEYS = {
    defaultPageSize: "tm_buff_default_page_size",
    fullMode: "tm_buff_full_mode",
    fullPageSize: "tm_buff_full_page_size",
    onlySaleable: "tm_buff_only_saleable",
    plFilter: "tm_buff_pl_filter",
    showRefs: "tm_buff_show_refs",
    settings: "tm_buff_settings_v1",
    cnyEurRate: "tm_buff_cny_eur_rate",
    cnyEurRateDate: "tm_buff_cny_eur_rate_date"
  };
  var FALLBACK_DEFAULT_PAGE_SIZE = 50;

  // src/core/settings.js
  function loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.settings);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          onlySaleable: parsed.onlySaleable !== void 0 ? !!parsed.onlySaleable : true,
          showRefs: parsed.showRefs !== void 0 ? !!parsed.showRefs : true,
          fullMode: parsed.fullMode !== void 0 ? !!parsed.fullMode : false,
          excludedAssetIds: parsed.excludedAssetIds && typeof parsed.excludedAssetIds === "object" ? parsed.excludedAssetIds : {},
          targetSellEurByAssetId: parsed.targetSellEurByAssetId && typeof parsed.targetSellEurByAssetId === "object" ? parsed.targetSellEurByAssetId : {},
          customPaidEurByAssetId: parsed.customPaidEurByAssetId && typeof parsed.customPaidEurByAssetId === "object" ? parsed.customPaidEurByAssetId : {},
          customPaidCnyByAssetId: parsed.customPaidCnyByAssetId && typeof parsed.customPaidCnyByAssetId === "object" ? parsed.customPaidCnyByAssetId : {}
        };
      }
    } catch (err) {
    }
    const onlySaleableLegacy = localStorage.getItem(STORAGE_KEYS.onlySaleable);
    const fullModeLegacy = localStorage.getItem(STORAGE_KEYS.fullMode);
    const showRefsLegacy = localStorage.getItem(STORAGE_KEYS.showRefs);
    return {
      onlySaleable: onlySaleableLegacy !== null ? onlySaleableLegacy === "1" : true,
      showRefs: showRefsLegacy !== null ? showRefsLegacy === "1" : true,
      fullMode: fullModeLegacy !== null ? fullModeLegacy === "1" : false,
      excludedAssetIds: {},
      targetSellEurByAssetId: {},
      customPaidEurByAssetId: {},
      customPaidCnyByAssetId: {}
    };
  }
  function saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
    } catch (err) {
    }
  }

  // src/core/hash.js
  function parseHashParams() {
    const rawHash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
    return new URLSearchParams(rawHash);
  }
  function buildHash(params) {
    const str = params.toString();
    return str ? `#${str}` : "";
  }
  function updateHashAndReload(mutator) {
    const params = parseHashParams();
    mutator(params);
    const newHash = buildHash(params);
    if (window.location.hash !== newHash) {
      window.location.hash = newHash;
    }
    setTimeout(() => {
      window.location.reload();
    }, 80);
  }

  // src/core/fx.js
  function getCachedCnyEurRate() {
    const rawRate = localStorage.getItem(STORAGE_KEYS.cnyEurRate);
    if (!rawRate) return null;
    const rate = parseFloat(rawRate);
    return Number.isFinite(rate) && rate > 0 ? rate : null;
  }
  function getCachedCnyEurRateDate() {
    return localStorage.getItem(STORAGE_KEYS.cnyEurRateDate) || "";
  }
  function getTodayIsoDate() {
    return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  }
  function setCachedCnyEurRate(rate, date = "") {
    if (!Number.isFinite(rate) || rate <= 0) return;
    localStorage.setItem(STORAGE_KEYS.cnyEurRate, String(rate));
    if (date) {
      localStorage.setItem(STORAGE_KEYS.cnyEurRateDate, date);
    }
  }
  async function ensureCnyEurRate() {
    const cachedRate = getCachedCnyEurRate();
    const cachedDate = getCachedCnyEurRateDate();
    const today = getTodayIsoDate();
    if (cachedRate && cachedDate === today) {
      return cachedRate;
    }
    try {
      const response = await fetch("https://api.frankfurter.dev/v1/latest?base=CNY&symbols=EUR");
      if (!response.ok) {
        throw new Error(`Failed to fetch exchange rate: HTTP ${response.status}`);
      }
      const data = await response.json();
      const rate = data?.rates?.EUR;
      if (!Number.isFinite(rate) || rate <= 0) {
        throw new Error("Invalid CNY\u2192EUR exchange rate received");
      }
      setCachedCnyEurRate(rate, data?.date || "");
      return rate;
    } catch (err) {
      if (cachedRate) {
        return cachedRate;
      }
      throw err;
    }
  }
  function buildFxStatusText(opts) {
    const { rate, date, error } = opts || {};
    if (error) {
      return "FX: unavailable";
    }
    const effectiveRate = typeof rate === "number" && Number.isFinite(rate) && rate > 0 ? rate : getCachedCnyEurRate();
    const effectiveDate = date || getCachedCnyEurRateDate();
    if (!effectiveRate) {
      return "FX: not loaded";
    }
    return effectiveDate ? `FX: 1 CNY = \u20AC ${effectiveRate.toFixed(4)} (${effectiveDate})` : `FX: 1 CNY = \u20AC ${effectiveRate.toFixed(4)}`;
  }

  // src/core/inventoryObserver.js
  function setupInventoryObserver(options) {
    const {
      inventoryListSelector,
      onRefresh,
      debounceMs = 100,
      observerFlag = "tmBuffObserverAttached",
      errorPrefix = "[buff163-tools] Mutation observer refresh failed:"
    } = options || {};
    if (!inventoryListSelector || typeof onRefresh !== "function") {
      return false;
    }
    const inventoryList = document.querySelector(inventoryListSelector);
    if (!inventoryList) {
      return false;
    }
    if (inventoryList.dataset[observerFlag] === "1") {
      return true;
    }
    let refreshScheduled = false;
    const observer = new MutationObserver((mutations) => {
      let shouldRefresh = false;
      for (const mutation of mutations) {
        if (mutation.type === "childList" && (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)) {
          shouldRefresh = true;
          break;
        }
      }
      if (!shouldRefresh || refreshScheduled) {
        return;
      }
      refreshScheduled = true;
      setTimeout(() => {
        refreshScheduled = false;
        try {
          onRefresh();
        } catch (err) {
          console.error(errorPrefix, err);
        }
      }, debounceMs);
    });
    observer.observe(inventoryList, {
      childList: true
    });
    inventoryList.dataset[observerFlag] = "1";
    return true;
  }

  // src/core/pl.js
  function computePlVisibilityAndTotals(options) {
    const {
      inventoryItemsSelector,
      filter
    } = options || {};
    if (!inventoryItemsSelector) {
      return {
        total: 0,
        count: 0,
        winnersTotal: 0,
        losersTotal: 0,
        winnersCount: 0,
        losersCount: 0,
        excludedCount: 0
      };
    }
    const items = document.querySelectorAll(inventoryItemsSelector);
    let total = 0;
    let count = 0;
    let winnersTotal = 0;
    let losersTotal = 0;
    let winnersCount = 0;
    let losersCount = 0;
    let excludedCount = 0;
    items.forEach((item) => {
      const plRaw = item.dataset.tmBuffPl;
      const hasPl = typeof plRaw !== "undefined";
      const pl = hasPl ? parseFloat(plRaw) : null;
      const excluded = item.dataset.tmBuffExcluded === "1";
      let show = true;
      if (filter === "winners") {
        show = hasPl && Number.isFinite(pl) && pl > 0;
      } else if (filter === "losers") {
        show = hasPl && Number.isFinite(pl) && pl < 0;
      }
      item.style.display = show ? "" : "none";
      if (show && excluded) {
        excludedCount += 1;
      }
      if (show && !excluded && hasPl && Number.isFinite(pl)) {
        total += pl;
        count += 1;
        if (pl > 0) {
          winnersTotal += pl;
          winnersCount += 1;
        } else if (pl < 0) {
          losersTotal += pl;
          losersCount += 1;
        }
      }
    });
    return {
      total,
      count,
      winnersTotal,
      losersTotal,
      winnersCount,
      losersCount,
      excludedCount
    };
  }
  function buildPlSummaryHtml(options) {
    const {
      total,
      count,
      filter,
      winnersTotal,
      losersTotal,
      winnersCount,
      losersCount,
      onlySaleable,
      excludedCount,
      formatEur
    } = options || {};
    const formatter = typeof formatEur === "function" ? formatEur : ((value) => `\u20AC ${Number(value || 0).toFixed(2)}`);
    const filterLabel = filter === "winners" ? "Winners" : filter === "losers" ? "Losers" : "All";
    const scopeLabel = onlySaleable ? "Saleable" : "All items";
    const netSign = total > 0 ? "+" : "";
    const winnersSign = winnersTotal > 0 ? "+" : "";
    const losersSign = losersTotal > 0 ? "+" : "";
    const netClass = total > 0 ? "tm-buff-pl-net-positive" : total < 0 ? "tm-buff-pl-net-negative" : "";
    return `Visible (${scopeLabel}, ${filterLabel}, ${count} items): Winners ${winnersCount}: <strong class="tm-buff-pl-winners">${winnersSign}${formatter(winnersTotal)}</strong> \xB7 Losers ${losersCount}: <strong class="tm-buff-pl-losers">${losersSign}${formatter(losersTotal)}</strong> \xB7 Net: <strong class="${netClass}">${netSign}${formatter(total)}</strong>` + (excludedCount > 0 ? ` \xB7 Excluded: ${excludedCount}` : "");
  }

  // src/core/itemSettingsState.js
  function getAssetIdFromItem(item) {
    return item?.getAttribute("data-assetid") || item?.id || "";
  }
  function isAssetExcluded(settings, assetId) {
    if (!assetId) return false;
    return !!(settings?.excludedAssetIds && settings.excludedAssetIds[assetId]);
  }
  function setAssetExcluded(settings, saveSettings2, assetId, excluded) {
    if (!assetId || !settings) return;
    if (!settings.excludedAssetIds || typeof settings.excludedAssetIds !== "object") {
      settings.excludedAssetIds = {};
    }
    if (excluded) {
      settings.excludedAssetIds[assetId] = 1;
    } else {
      delete settings.excludedAssetIds[assetId];
    }
    if (typeof saveSettings2 === "function") {
      saveSettings2();
    }
  }
  function getAssetTargetSellEur(settings, assetId) {
    if (!assetId) return null;
    const value = settings?.targetSellEurByAssetId?.[assetId];
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }
  function setAssetTargetSellEur(settings, saveSettings2, assetId, value) {
    if (!assetId || !settings) return;
    if (!settings.targetSellEurByAssetId || typeof settings.targetSellEurByAssetId !== "object") {
      settings.targetSellEurByAssetId = {};
    }
    const parsed = parseFloat(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      delete settings.targetSellEurByAssetId[assetId];
    } else {
      settings.targetSellEurByAssetId[assetId] = parsed.toFixed(2);
    }
    if (typeof saveSettings2 === "function") {
      saveSettings2();
    }
  }
  function getAssetCustomPaidEur(settings, assetId) {
    if (!assetId) return null;
    const value = settings?.customPaidEurByAssetId?.[assetId];
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }
  function getAssetLegacyCustomPaidCny(settings, assetId) {
    if (!assetId) return null;
    const value = settings?.customPaidCnyByAssetId?.[assetId];
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }
  function setAssetCustomPaidEur(settings, saveSettings2, assetId, value) {
    if (!assetId || !settings) return;
    if (!settings.customPaidEurByAssetId || typeof settings.customPaidEurByAssetId !== "object") {
      settings.customPaidEurByAssetId = {};
    }
    const parsed = parseFloat(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      delete settings.customPaidEurByAssetId[assetId];
    } else {
      settings.customPaidEurByAssetId[assetId] = parsed.toFixed(2);
    }
    if (typeof saveSettings2 === "function") {
      saveSettings2();
    }
  }

  // src/core/itemSettingsModal.js
  function createStandardModalBackdrop({
    backdropId,
    modalId,
    title,
    closeId,
    bodyHtml
  }) {
    let backdrop = document.getElementById(backdropId);
    if (backdrop) return backdrop;
    backdrop = document.createElement("div");
    backdrop.id = backdropId;
    backdrop.innerHTML = `
            <div id="${modalId}">
                <div class="tm-buff-modal-header">
                    <div class="tm-buff-modal-title">${title}</div>
                    <button type="button" class="tm-buff-modal-close" id="${closeId}" aria-label="Close">\xD7</button>
                </div>
                <div class="tm-buff-modal-body">
                    ${bodyHtml}
                </div>
            </div>
        `;
    document.body.appendChild(backdrop);
    return backdrop;
  }
  function closeItemSettingsModal() {
    const backdrop = document.getElementById("tm-buff-item-modal-backdrop");
    if (!backdrop) return;
    backdrop.style.display = "none";
    backdrop.dataset.assetId = "";
  }
  function getOrCreateItemSettingsModal(options) {
    const {
      onClose,
      onSave,
      createBackdrop = createStandardModalBackdrop
    } = options || {};
    const bodyHtml = `
            <div class="tm-buff-modal-row">
                <label for="tm-buff-modal-paid-eur">Custom paid price (EUR)</label>
                <input id="tm-buff-modal-paid-eur" class="tm-buff-modal-input" type="number" min="0" step="0.01" placeholder="Leave empty to use BUFF paid">
            </div>
            <div class="tm-buff-modal-row">
                <label for="tm-buff-modal-target">Target sell price (EUR)</label>
                <input id="tm-buff-modal-target" class="tm-buff-modal-input" type="number" min="0" step="0.01" placeholder="Leave empty to disable">
            </div>
            <div class="tm-buff-modal-row">
                <label class="tm-buff-modal-check">
                    <input id="tm-buff-modal-excluded" type="checkbox">
                    Exclude from portfolio totals
                </label>
            </div>
            <div class="tm-buff-modal-hint" id="tm-buff-modal-hint"></div>
            <div class="tm-buff-modal-actions">
                <button type="button" class="tm-buff-modal-btn" id="tm-buff-modal-cancel">Cancel</button>
                <button type="button" class="tm-buff-modal-btn primary" id="tm-buff-modal-save">Save</button>
            </div>
        `;
    const backdrop = createBackdrop({
      backdropId: "tm-buff-item-modal-backdrop",
      modalId: "tm-buff-item-modal",
      title: "Item settings",
      closeId: "tm-buff-modal-close",
      bodyHtml
    });
    if (backdrop.dataset.tmBuffBound === "1") return backdrop;
    backdrop.dataset.tmBuffBound = "1";
    const closeHandler = () => {
      if (typeof onClose === "function") {
        onClose();
        return;
      }
      closeItemSettingsModal();
    };
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) {
        closeHandler();
      }
    });
    backdrop.querySelector("#tm-buff-modal-close")?.addEventListener("click", closeHandler);
    backdrop.querySelector("#tm-buff-modal-cancel")?.addEventListener("click", closeHandler);
    backdrop.querySelector("#tm-buff-modal-save")?.addEventListener("click", () => {
      if (typeof onSave !== "function") {
        return;
      }
      onSave(backdrop);
    });
    return backdrop;
  }
  function openItemSettingsModal(options) {
    const {
      item,
      marketPriceEur,
      getOrCreateModal,
      getAssetIdFromItem: getAssetIdFromItem2,
      getAssetTargetSellEur: getAssetTargetSellEur2,
      getAssetCustomPaidEur: getAssetCustomPaidEur2,
      getAssetLegacyCustomPaidCny: getAssetLegacyCustomPaidCny2,
      isAssetExcluded: isAssetExcluded2,
      formatEur
    } = options || {};
    if (!item || typeof getOrCreateModal !== "function" || typeof getAssetIdFromItem2 !== "function") return;
    const assetId = getAssetIdFromItem2(item);
    if (!assetId) return;
    const modal = getOrCreateModal();
    modal.dataset.assetId = assetId;
    const name = item.querySelector("h3 a")?.textContent?.trim() || "Item settings";
    const target = typeof getAssetTargetSellEur2 === "function" ? getAssetTargetSellEur2(assetId) : null;
    const customPaidEur = typeof getAssetCustomPaidEur2 === "function" ? getAssetCustomPaidEur2(assetId) : null;
    const customPaidCnyLegacy = typeof getAssetLegacyCustomPaidCny2 === "function" ? getAssetLegacyCustomPaidCny2(assetId) : null;
    const excluded = typeof isAssetExcluded2 === "function" ? isAssetExcluded2(assetId) : false;
    const ready = Number.isFinite(marketPriceEur) && Number.isFinite(target) && marketPriceEur >= target;
    const titleEl = modal.querySelector(".tm-buff-modal-title");
    const paidEl = modal.querySelector("#tm-buff-modal-paid-eur");
    const targetEl = modal.querySelector("#tm-buff-modal-target");
    const excludedEl = modal.querySelector("#tm-buff-modal-excluded");
    const hintEl = modal.querySelector("#tm-buff-modal-hint");
    const formatter = typeof formatEur === "function" ? formatEur : ((value) => `\u20AC ${Number(value || 0).toFixed(2)}`);
    if (titleEl) titleEl.textContent = name;
    if (paidEl) paidEl.value = customPaidEur ? customPaidEur.toFixed(2) : "";
    if (targetEl) targetEl.value = target ? target.toFixed(2) : "";
    if (excludedEl) excludedEl.checked = excluded;
    if (hintEl) {
      const currentText = Number.isFinite(marketPriceEur) ? `Current: ${formatter(marketPriceEur)}` : "Current: N/A";
      const statusText = target ? ready ? "Status: Ready" : "Status: Waiting" : "Status: No target set";
      const paidSource = customPaidEur ? `Paid source: Custom EUR (${formatter(customPaidEur)})` : customPaidCnyLegacy ? `Paid source: Legacy custom CNY (\xA5 ${customPaidCnyLegacy.toFixed(2)})` : "Paid source: BUFF";
      hintEl.textContent = `${currentText} \xB7 ${statusText} \xB7 ${paidSource}`;
    }
    modal.style.display = "flex";
  }

  // src/core/globalUi.js
  function closeGlobalSettingsModal() {
    const backdrop = document.getElementById("tm-buff-global-settings-backdrop");
    if (!backdrop) return;
    backdrop.style.display = "none";
  }
  function getOrCreateGlobalSettingsModal(options) {
    const {
      createStandardModalBackdrop: createStandardModalBackdrop2,
      closeGlobalSettingsModalHandler = closeGlobalSettingsModal,
      onSave
    } = options || {};
    if (typeof createStandardModalBackdrop2 !== "function") return null;
    const bodyHtml = `
            <div class="tm-buff-global-wrap">
                <div class="tm-buff-global-header">
                    <p class="tm-buff-global-header-title">Inventory preferences</p>
                    <p class="tm-buff-global-header-sub">Control visibility and filtering behavior.</p>
                </div>
                <div class="tm-buff-modal-section-title">Display & Filters</div>
                <div class="tm-buff-modal-row">
                    <label class="tm-buff-modal-check">
                        <input id="tm-buff-global-only-saleable" type="checkbox">
                        Only saleable
                    </label>
                </div>
                <div class="tm-buff-modal-row">
                    <label class="tm-buff-modal-check">
                        <input id="tm-buff-global-show-refs" type="checkbox">
                        Show refs
                    </label>
                </div>
                <div class="tm-buff-modal-hint" id="tm-buff-global-fx-status"></div>
                <div class="tm-buff-modal-hint">More options can be moved here later.</div>
                <div class="tm-buff-global-footer">
                    <div class="tm-buff-modal-meta">
                        buff163-tools by Rait Nigol \xB7
                        <a href="https://github.com/raitnigol/buff163-tools/blob/main/buff163-tools.user.js" target="_blank" rel="noopener noreferrer">GitHub</a>
                    </div>
                    <div class="tm-buff-modal-actions">
                        <button type="button" class="tm-buff-modal-btn primary" id="tm-buff-global-settings-save">Save</button>
                    </div>
                </div>
            </div>
        `;
    const backdrop = createStandardModalBackdrop2({
      backdropId: "tm-buff-global-settings-backdrop",
      modalId: "tm-buff-global-settings-modal",
      title: "buff163-tools settings",
      closeId: "tm-buff-global-settings-close",
      bodyHtml
    });
    if (!backdrop) return null;
    if (backdrop.dataset.tmBuffBound === "1") return backdrop;
    backdrop.dataset.tmBuffBound = "1";
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) closeGlobalSettingsModalHandler();
    });
    backdrop.querySelector("#tm-buff-global-settings-close")?.addEventListener("click", closeGlobalSettingsModalHandler);
    backdrop.querySelector("#tm-buff-global-settings-save")?.addEventListener("click", () => {
      if (typeof onSave === "function") {
        onSave(backdrop);
      }
    });
    return backdrop;
  }
  function openGlobalSettingsModal(options) {
    const {
      getOrCreateGlobalSettingsModal: getOrCreateGlobalSettingsModal2,
      isOnlySaleableEnabled,
      isShowRefsEnabled,
      fxStatusText
    } = options || {};
    if (typeof getOrCreateGlobalSettingsModal2 !== "function") return;
    const modal = getOrCreateGlobalSettingsModal2();
    if (!modal) return;
    const onlySaleableInput = modal.querySelector("#tm-buff-global-only-saleable");
    const showRefsInput = modal.querySelector("#tm-buff-global-show-refs");
    const fxStatusEl = modal.querySelector("#tm-buff-global-fx-status");
    if (onlySaleableInput) onlySaleableInput.checked = !!(typeof isOnlySaleableEnabled === "function" && isOnlySaleableEnabled());
    if (showRefsInput) showRefsInput.checked = !!(typeof isShowRefsEnabled === "function" && isShowRefsEnabled());
    if (fxStatusEl) fxStatusEl.textContent = fxStatusText || "";
    modal.style.display = "flex";
  }
  function getOrCreateFloatbarEntry(options) {
    const { onOpenGlobalSettingsModal } = options || {};
    const floatbarList = document.querySelector(".floatbar > ul");
    if (!floatbarList) return;
    const existing = document.getElementById("tm-buff-float-settings");
    if (existing) return;
    const li = document.createElement("li");
    li.id = "tm-buff-float-settings";
    li.innerHTML = `
            <a href="javascript:void(0)">
                <i class="icon icon_menu icon_menu_setting" aria-hidden="true"></i>
                <p>Tools</p>
            </a>
        `;
    li.querySelector("a")?.addEventListener("click", (event) => {
      event.preventDefault();
      if (typeof onOpenGlobalSettingsModal === "function") {
        onOpenGlobalSettingsModal();
      }
    });
    floatbarList.insertBefore(li, floatbarList.firstChild);
  }

  // src/styles/index.js
  var STYLE_TAG_ID = "tm-buff-styles";
  function getInventoryCardExtraHeight() {
    return 62;
  }
  function buildInjectedStyles(finalHeight) {
    return `
            #j_list_card li.my_inventory {
                min-height: ${finalHeight}px !important;
                height: ${finalHeight}px !important;
                box-sizing: border-box;
                position: relative;
            }

            #j_list_card li.my_inventory .tm-buff-meta {
                display: block;
                height: 62px;
                margin: 2px 10px 0;
                overflow: hidden;
            }

            #j_list_card li.my_inventory .tm-buff-meta-line {
                display: block;
                height: 14px;
                line-height: 14px;
                font-size: 11px;
                color: #4b5563;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            #j_list_card li.my_inventory .tm-buff-meta-line.tm-buff-meta-refs {
                height: 14px;
                line-height: 14px;
                overflow: visible;
            }

            #j_list_card li.my_inventory .tm-buff-meta-line.tm-buff-meta-actions {
                height: 20px;
                line-height: 20px;
                overflow: visible;
            }

            #j_list_card li.my_inventory .tm-buff-meta-line.pl-positive {
                color: #22c55e;
            }

            #j_list_card li.my_inventory .tm-buff-meta-line.pl-negative {
                color: #ef4444;
            }

            #j_list_card li.my_inventory .tm-buff-meta-label {
                opacity: 0.9;
                margin-right: 3px;
            }

            #j_list_card li.my_inventory .tm-buff-meta-value {
                font-weight: 500;
            }

            #j_list_card li.my_inventory .tm-buff-meta-paid-custom .tm-buff-meta-value {
                color: #0369a1;
            }

            #j_list_card li.my_inventory .tm-buff-meta-line.pl-positive .tm-buff-meta-value {
                color: #22c55e;
            }

            #j_list_card li.my_inventory .tm-buff-meta-line.pl-negative .tm-buff-meta-value {
                color: #ef4444;
            }

            #j_list_card li.my_inventory .tm-buff-excluded-badge {
                color: #6b7280;
                margin-left: 6px;
                font-size: 10px;
            }

            #j_list_card li.my_inventory .tm-buff-exclude-toggle {
                display: inline-block;
                min-width: 58px;
                margin-left: 8px;
                padding: 0 6px;
                border-radius: 9999px;
                border: 1px solid #93c5fd;
                color: #1d4ed8;
                background: #eff6ff;
                cursor: pointer;
                font-size: 10px;
                line-height: 16px;
                text-align: center;
                text-decoration: none;
                box-sizing: border-box;
                vertical-align: middle;
            }

            #j_list_card li.my_inventory .tm-buff-exclude-toggle.readonly {
                cursor: default;
                text-decoration: none;
                pointer-events: none;
            }

            #j_list_card li.my_inventory.tm-buff-item-excluded {
                border: 1px solid #8b5cf6 !important;
                box-shadow: inset 0 0 0 1px rgba(139, 92, 246, 0.22);
            }

            #j_list_card li.my_inventory.tm-buff-item-ready {
                border: 1px solid #22c55e !important;
                box-shadow: inset 0 0 0 1px rgba(34, 197, 94, 0.22);
            }

            #j_list_card li.my_inventory.tm-buff-item-excluded .tm-buff-meta-pl {
                opacity: 0.55;
            }

            #j_list_card li.my_inventory .tm-buff-exclude-toggle.is-excluded {
                color: #5b21b6;
                border-color: #c4b5fd;
                background: #f5f3ff;
                font-weight: 600;
            }

            #j_list_card li.my_inventory .tm-buff-target-wrap {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                margin-right: 8px;
                vertical-align: middle;
            }

            #j_list_card li.my_inventory .tm-buff-target-input {
                width: 58px;
                height: 16px;
                line-height: 16px;
                padding: 0 4px;
                border: 1px solid #d1d5db;
                border-radius: 3px;
                font-size: 10px;
                box-sizing: border-box;
            }

            #j_list_card li.my_inventory .tm-buff-target-status {
                font-size: 10px;
                color: #6b7280;
            }

            #j_list_card li.my_inventory .tm-buff-target-status.ready {
                color: #16a34a;
                font-weight: 600;
            }

            #j_list_card li.my_inventory .tm-buff-item-settings-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 28px;
                height: 28px;
                border: 1px solid #d1d5db;
                border-radius: 4px;
                color: #4b5563;
                background: #f8fafc;
                cursor: pointer;
                font-size: 11px;
                line-height: 1;
                position: absolute;
                left: 8px;
                bottom: 8px;
                z-index: 3;
                opacity: 0.95;
                padding: 0;
                overflow: visible;
            }

            #j_list_card li.my_inventory .tm-buff-item-settings-btn:hover {
                border-color: #9ca3af;
                background: #f1f5f9;
            }

            #j_list_card li.my_inventory .tm-buff-card-state-chip {
                position: absolute;
                left: 42px;
                bottom: 10px;
                z-index: 3;
                min-width: 58px;
                padding: 0 6px;
                border-radius: 9999px;
                border: 1px solid #93c5fd;
                color: #1d4ed8;
                background: #eff6ff;
                font-size: 10px;
                line-height: 16px;
                text-align: center;
                box-sizing: border-box;
                pointer-events: none;
            }

            #j_list_card li.my_inventory .tm-buff-card-state-chip.is-excluded {
                color: #5b21b6;
                border-color: #c4b5fd;
                background: #f5f3ff;
                font-weight: 600;
            }

            #j_list_card li.my_inventory .tm-buff-item-settings-btn .tm-buff-item-settings-icon {
                width: auto;
                height: auto;
                display: inline-block;
                font-style: normal;
                font-size: 14px;
                line-height: 1;
                color: #4b5563;
            }

            #j_list_card li.my_inventory .tm-buff-merged-note {
                font-size: 10px;
                color: #9ca3af;
                font-style: italic;
            }

            /* Merged/folder entries should not expose per-item management UI */
            #j_list_card li.my_inventory.card_folder .tm-buff-exclude-toggle,
            #j_list_card li.my_inventory.card_folder .tm-buff-item-settings-btn,
            #j_list_card li.my_inventory.card_folder .tm-buff-target-status {
                display: none !important;
            }

            #tm-buff-item-modal-backdrop {
                position: fixed;
                inset: 0;
                display: none;
                align-items: center;
                justify-content: center;
                background: rgba(15, 23, 42, 0.45);
                z-index: 99999;
            }

            #tm-buff-item-modal {
                width: 360px;
                max-width: calc(100vw - 24px);
                border-radius: 8px;
                border: 1px solid #d1d5db;
                background: #ffffff;
                box-shadow: 0 10px 32px rgba(0, 0, 0, 0.22);
                color: #111827;
                font-size: 13px;
            }

            #tm-buff-item-modal .tm-buff-modal-header,
            #tm-buff-global-settings-modal .tm-buff-modal-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10px 12px;
                border-bottom: 1px solid #e5e7eb;
            }

            #tm-buff-item-modal .tm-buff-modal-title,
            #tm-buff-global-settings-modal .tm-buff-modal-title {
                font-weight: 600;
                max-width: 300px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                font-size: 14px;
                letter-spacing: 0.01em;
            }

            #tm-buff-item-modal .tm-buff-modal-close,
            #tm-buff-global-settings-modal .tm-buff-modal-close {
                border: none;
                background: transparent;
                color: #6b7280;
                font-size: 18px;
                cursor: pointer;
                line-height: 1;
            }

            #tm-buff-item-modal .tm-buff-modal-body,
            #tm-buff-global-settings-modal .tm-buff-modal-body {
                padding: 12px;
            }

            #tm-buff-item-modal .tm-buff-modal-row,
            #tm-buff-global-settings-modal .tm-buff-modal-row {
                margin-bottom: 10px;
            }

            #tm-buff-item-modal .tm-buff-modal-row label,
            #tm-buff-global-settings-modal .tm-buff-modal-row label {
                display: block;
                margin-bottom: 4px;
                color: #4b5563;
                font-size: 12px;
            }

            #tm-buff-item-modal .tm-buff-modal-input,
            #tm-buff-global-settings-modal .tm-buff-modal-input {
                width: 100%;
                height: 30px;
                padding: 0 8px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                box-sizing: border-box;
            }

            #tm-buff-item-modal .tm-buff-modal-check,
            #tm-buff-global-settings-modal .tm-buff-modal-check {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                cursor: pointer;
            }

            #tm-buff-item-modal .tm-buff-modal-hint,
            #tm-buff-global-settings-modal .tm-buff-modal-hint {
                color: #6b7280;
                font-size: 12px;
            }

            #tm-buff-item-modal .tm-buff-modal-actions,
            #tm-buff-global-settings-modal .tm-buff-modal-actions {
                display: flex;
                justify-content: flex-end;
                gap: 8px;
                margin-top: 12px;
            }

            #tm-buff-item-modal .tm-buff-modal-btn,
            #tm-buff-global-settings-modal .tm-buff-modal-btn {
                height: 32px;
                padding: 0 12px;
                border-radius: 6px;
                border: 1px solid #d1d5db;
                background: #ffffff;
                cursor: pointer;
                font-size: 12px;
                font-weight: 600;
            }

            #tm-buff-item-modal .tm-buff-modal-btn.primary,
            #tm-buff-global-settings-modal .tm-buff-modal-btn.primary {
                border-color: #3b82f6;
                background: #3b82f6;
                color: #ffffff;
            }

            #tm-buff-global-settings-modal .tm-buff-modal-body {
                background: #ffffff;
                padding: 0;
            }

            #tm-buff-global-settings-modal .tm-buff-modal-section-title {
                margin: 0 0 10px 0;
                font-size: 11px;
                letter-spacing: 0.03em;
                text-transform: uppercase;
                color: #6b7280;
                font-weight: 700;
            }

            #tm-buff-global-settings-modal .tm-buff-modal-row {
                padding: 10px 0;
                border: none;
                border-bottom: 1px solid #eef2f7;
                border-radius: 0;
                background: transparent;
                margin-bottom: 0;
            }

            #tm-buff-global-settings-modal .tm-buff-modal-check input[type="checkbox"] {
                transform: translateY(-0.5px);
            }

            #tm-buff-global-settings-modal .tm-buff-modal-check {
                font-weight: 600;
                color: #1f2937;
                font-size: 12px;
                line-height: 1.35;
            }

            #tm-buff-global-settings-modal .tm-buff-modal-hint {
                margin-top: 10px;
                line-height: 1.4;
                font-size: 11px;
            }

            #tm-buff-global-settings-modal .tm-buff-modal-meta {
                margin-top: 0;
                padding-top: 0;
                border-top: none;
                font-size: 11px;
                color: #4b5563;
            }

            #tm-buff-global-settings-modal .tm-buff-modal-meta a {
                color: #2563eb;
                text-decoration: none;
            }

            #tm-buff-global-settings-modal .tm-buff-modal-meta a:hover {
                text-decoration: underline;
            }

            #tm-buff-global-settings-modal .tm-buff-global-wrap {
                padding: 12px;
            }

            #tm-buff-global-settings-modal .tm-buff-global-header {
                margin: 0 0 10px 0;
                padding: 8px 10px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                background: #f8fafc;
            }

            #tm-buff-global-settings-modal .tm-buff-global-header-title {
                margin: 0;
                font-size: 13px;
                font-weight: 700;
                color: #111827;
            }

            #tm-buff-global-settings-modal .tm-buff-global-header-sub {
                margin: 2px 0 0 0;
                font-size: 11px;
                color: #64748b;
            }

            #tm-buff-global-settings-modal .tm-buff-global-footer {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
                margin-top: 12px;
                padding-top: 10px;
                border-top: 1px solid #e5e7eb;
            }

            #tm-buff-global-settings-modal .tm-buff-modal-actions {
                margin-top: 0;
            }

            #tm-buff-float-settings a {
                cursor: pointer;
            }

            #tm-buff-global-settings-backdrop {
                position: fixed;
                inset: 0;
                display: none;
                align-items: center;
                justify-content: center;
                background: rgba(15, 23, 42, 0.45);
                z-index: 99999;
            }

            #tm-buff-global-settings-modal {
                width: 360px;
                max-width: calc(100vw - 24px);
                border-radius: 8px;
                border: 1px solid #d1d5db;
                background: #ffffff;
                box-shadow: 0 10px 32px rgba(0, 0, 0, 0.22);
                color: #111827;
                font-size: 13px;
            }

            #tm-buff-toolbar {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                gap: 14px;
                padding: 8px 12px;
                border-top: 1px solid rgba(255, 255, 255, 0.04);
                font-size: 12px;
            }

            #tm-buff-toolbar .tm-buff-toolbar-title {
                color: #c7c7c7;
                font-weight: 600;
            }

            #tm-buff-toolbar .tm-buff-toolbar-option {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                cursor: pointer;
                color: #c7c7c7;
                user-select: none;
            }

            #tm-buff-toolbar input[type="checkbox"],
            #tm-buff-toolbar select {
                cursor: pointer;
            }

            #tm-buff-toolbar select {
                background: #1f1f1f;
                color: #c7c7c7;
                border: 1px solid #4b5563;
                border-radius: 4px;
                padding: 2px 6px;
                font-size: 12px;
            }

            #tm-buff-toolbar .tm-buff-summary {
                color: #c7c7c7;
            }

            #tm-buff-toolbar .tm-buff-summary strong {
                color: #ffffff;
            }

            #tm-buff-toolbar .tm-buff-summary .tm-buff-pl-winners {
                color: #23a55a;
            }

            #tm-buff-toolbar .tm-buff-summary .tm-buff-pl-losers {
                color: #d9534f;
            }

            #tm-buff-toolbar .tm-buff-summary .tm-buff-pl-net-positive {
                color: #23a55a;
            }

            #tm-buff-toolbar .tm-buff-summary .tm-buff-pl-net-negative {
                color: #d9534f;
            }

            #tm-buff-goods-analysis {
                margin-top: 6px;
                font-size: 11px;
                color: #6b7280;
            }

            #tm-buff-goods-analysis .tm-buff-analysis-title {
                font-weight: 600;
                margin-bottom: 2px;
                color: #4b5563;
            }

            #tm-buff-goods-analysis .tm-buff-analysis-row {
                margin: 1px 0;
            }

            #tm-buff-goods-analysis .tm-buff-analysis-note {
                margin-top: 2px;
                color: #9ca3af;
            }

            #tm-buff-goods-analysis .tm-buff-analysis-flag {
                font-weight: 600;
                color: #b91c1c;
            }
        `;
  }

  // src/app/init.js
  async function initApp() {
    window.__BUFF163_MODULES__ = {
      SELECTORS,
      STORAGE_KEYS,
      FALLBACK_DEFAULT_PAGE_SIZE,
      loadSettings,
      saveSettings,
      parseHashParams,
      buildHash,
      updateHashAndReload,
      getCachedCnyEurRate,
      getCachedCnyEurRateDate,
      getTodayIsoDate,
      setCachedCnyEurRate,
      ensureCnyEurRate,
      buildFxStatusText,
      setupInventoryObserver,
      computePlVisibilityAndTotals,
      buildPlSummaryHtml,
      getAssetIdFromItem,
      isAssetExcluded,
      setAssetExcluded,
      getAssetTargetSellEur,
      setAssetTargetSellEur,
      getAssetCustomPaidEur,
      getAssetLegacyCustomPaidCny,
      setAssetCustomPaidEur,
      createStandardModalBackdrop,
      closeItemSettingsModal,
      getOrCreateItemSettingsModal,
      openItemSettingsModal,
      closeGlobalSettingsModal,
      getOrCreateGlobalSettingsModal,
      openGlobalSettingsModal,
      getOrCreateFloatbarEntry,
      STYLE_TAG_ID,
      getInventoryCardExtraHeight,
      buildInjectedStyles
    };
    await Promise.resolve().then(() => __toESM(require_runtime()));
  }

  // src/main.js
  initApp();
})();

