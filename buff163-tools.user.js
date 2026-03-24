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
        marketHeader: '.market-header.black',
        criteria: '.criteria.steam_inventory_index_filter',
        inventoryList: '#j_list_card',
        inventoryItems: '#j_list_card li.my_inventory',
    };

    const STORAGE_KEY_DEFAULT_PAGE_SIZE = 'tm_buff_default_page_size';
    const STORAGE_KEY_FULL_MODE = 'tm_buff_full_mode';
    const STORAGE_KEY_FULL_PAGE_SIZE = 'tm_buff_full_page_size';
    const STORAGE_KEY_ONLY_SALEABLE = 'tm_buff_only_saleable';
    const STORAGE_KEY_PL_FILTER = 'tm_buff_pl_filter';
    const STORAGE_KEY_SHOW_REFS = 'tm_buff_show_refs';

    const SETTINGS_KEY = 'tm_buff_settings_v1';

    const FALLBACK_DEFAULT_PAGE_SIZE = 50;

    const STORAGE_KEY_CNY_EUR_RATE = 'tm_buff_cny_eur_rate';
    const STORAGE_KEY_CNY_EUR_RATE_DATE = 'tm_buff_cny_eur_rate_date';

    let LAST_RATE_KEY = '';

    function loadSettings() {
        try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                return {
                    onlySaleable: parsed.onlySaleable !== undefined ? !!parsed.onlySaleable : true,
                    showRefs: parsed.showRefs !== undefined ? !!parsed.showRefs : true,
                    fullMode: parsed.fullMode !== undefined ? !!parsed.fullMode : false,
                    excludedAssetIds: parsed.excludedAssetIds && typeof parsed.excludedAssetIds === 'object'
                        ? parsed.excludedAssetIds
                        : {},
                    targetSellEurByAssetId: parsed.targetSellEurByAssetId && typeof parsed.targetSellEurByAssetId === 'object'
                        ? parsed.targetSellEurByAssetId
                        : {},
                    customPaidEurByAssetId: parsed.customPaidEurByAssetId && typeof parsed.customPaidEurByAssetId === 'object'
                        ? parsed.customPaidEurByAssetId
                        : {},
                    // Legacy fallback for migration
                    customPaidCnyByAssetId: parsed.customPaidCnyByAssetId && typeof parsed.customPaidCnyByAssetId === 'object'
                        ? parsed.customPaidCnyByAssetId
                        : {},
                };
            }
        } catch (err) {
            // ignore and fall back to legacy keys
        }

        const onlySaleableLegacy = localStorage.getItem(STORAGE_KEY_ONLY_SALEABLE);
        const fullModeLegacy = localStorage.getItem(STORAGE_KEY_FULL_MODE);
        const showRefsLegacy = localStorage.getItem(STORAGE_KEY_SHOW_REFS);

        return {
            onlySaleable: onlySaleableLegacy !== null ? onlySaleableLegacy === '1' : true,
            showRefs: showRefsLegacy !== null ? showRefsLegacy === '1' : true,
            fullMode: fullModeLegacy !== null ? fullModeLegacy === '1' : false,
            excludedAssetIds: {},
            targetSellEurByAssetId: {},
            customPaidEurByAssetId: {},
            customPaidCnyByAssetId: {},
        };
    }

    let SETTINGS = loadSettings();

    function saveSettings() {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(SETTINGS));
        } catch (err) {
            // ignore
        }
    }

    function injectStyles() {
        if (document.getElementById('tm-buff-styles')) return;

        const sampleCard = document.querySelector(SELECTORS.inventoryItems);
        const baseHeight = sampleCard ? Math.ceil(sampleCard.getBoundingClientRect().height) : 260;
        // Paid + P/L + refs + actions
        const finalHeight = baseHeight + 62;

        const style = document.createElement('style');
        style.id = 'tm-buff-styles';
        style.textContent = `
            #j_list_card li.my_inventory {
                min-height: ${finalHeight}px !important;
                height: ${finalHeight}px !important;
                box-sizing: border-box;
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
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 18px;
                height: 18px;
                margin-left: 8px;
                border: 1px solid #d1d5db;
                border-radius: 4px;
                color: #4b5563;
                background: #f8fafc;
                cursor: pointer;
                font-size: 12px;
                line-height: 1;
            }

            #j_list_card li.my_inventory .tm-buff-item-settings-btn:hover {
                border-color: #9ca3af;
                background: #f1f5f9;
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
                height: 30px;
                padding: 0 12px;
                border-radius: 6px;
                border: 1px solid #d1d5db;
                background: #ffffff;
                cursor: pointer;
            }

            #tm-buff-item-modal .tm-buff-modal-btn.primary,
            #tm-buff-global-settings-modal .tm-buff-modal-btn.primary {
                border-color: #3b82f6;
                background: #3b82f6;
                color: #ffffff;
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

            #tm-buff-toolbar .tm-buff-fx {
                color: #9aa0a6;
                font-size: 11px;
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
        document.head.appendChild(style);
    }

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

    function getCurrentStateFilter() {
        const params = parseHashParams();
        return params.get('state') || 'all';
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

    function isFullModeEnabled() {
        return !!SETTINGS.fullMode;
    }

    function setFullModeEnabled(enabled) {
        SETTINGS.fullMode = !!enabled;
        saveSettings();
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
        saveSettings();
    }

    function getPlFilter() {
        const value = localStorage.getItem(STORAGE_KEY_PL_FILTER);
        return ['all', 'winners', 'losers'].includes(value) ? value : 'all';
    }

    function setPlFilter(value) {
        if (!['all', 'winners', 'losers'].includes(value)) return;
        localStorage.setItem(STORAGE_KEY_PL_FILTER, value);
    }

    function isShowRefsEnabled() {
        return !!SETTINGS.showRefs;
    }

    function setShowRefsEnabled(enabled) {
        SETTINGS.showRefs = !!enabled;
        saveSettings();
    }

    function getAssetIdFromItem(item) {
        return item?.getAttribute('data-assetid') || item?.id || '';
    }

    function isAssetExcluded(assetId) {
        if (!assetId) return false;
        return !!(SETTINGS.excludedAssetIds && SETTINGS.excludedAssetIds[assetId]);
    }

    function setAssetExcluded(assetId, excluded) {
        if (!assetId) return;
        if (!SETTINGS.excludedAssetIds || typeof SETTINGS.excludedAssetIds !== 'object') {
            SETTINGS.excludedAssetIds = {};
        }
        if (excluded) {
            SETTINGS.excludedAssetIds[assetId] = 1;
        } else {
            delete SETTINGS.excludedAssetIds[assetId];
        }
        saveSettings();
    }

    function getAssetTargetSellEur(assetId) {
        if (!assetId) return null;
        const value = SETTINGS.targetSellEurByAssetId?.[assetId];
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    }

    function setAssetTargetSellEur(assetId, value) {
        if (!assetId) return;
        if (!SETTINGS.targetSellEurByAssetId || typeof SETTINGS.targetSellEurByAssetId !== 'object') {
            SETTINGS.targetSellEurByAssetId = {};
        }

        const parsed = parseFloat(value);
        if (!Number.isFinite(parsed) || parsed <= 0) {
            delete SETTINGS.targetSellEurByAssetId[assetId];
        } else {
            SETTINGS.targetSellEurByAssetId[assetId] = parsed.toFixed(2);
        }
        saveSettings();
    }

    function getAssetCustomPaidEur(assetId) {
        if (!assetId) return null;
        const value = SETTINGS.customPaidEurByAssetId?.[assetId];
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    }

    function getAssetLegacyCustomPaidCny(assetId) {
        if (!assetId) return null;
        const value = SETTINGS.customPaidCnyByAssetId?.[assetId];
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    }

    function setAssetCustomPaidEur(assetId, value) {
        if (!assetId) return;
        if (!SETTINGS.customPaidEurByAssetId || typeof SETTINGS.customPaidEurByAssetId !== 'object') {
            SETTINGS.customPaidEurByAssetId = {};
        }

        const parsed = parseFloat(value);
        if (!Number.isFinite(parsed) || parsed <= 0) {
            delete SETTINGS.customPaidEurByAssetId[assetId];
        } else {
            SETTINGS.customPaidEurByAssetId[assetId] = parsed.toFixed(2);
        }
        saveSettings();
    }

    function createStandardModalBackdrop({
        backdropId,
        modalId,
        title,
        closeId,
        bodyHtml,
    }) {
        let backdrop = document.getElementById(backdropId);
        if (backdrop) return backdrop;

        backdrop = document.createElement('div');
        backdrop.id = backdropId;
        backdrop.innerHTML = `
            <div id="${modalId}">
                <div class="tm-buff-modal-header">
                    <div class="tm-buff-modal-title">${title}</div>
                    <button type="button" class="tm-buff-modal-close" id="${closeId}" aria-label="Close">×</button>
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
        const backdrop = document.getElementById('tm-buff-item-modal-backdrop');
        if (!backdrop) return;
        backdrop.style.display = 'none';
        backdrop.dataset.assetId = '';
    }

    function getOrCreateItemSettingsModal() {
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
        const backdrop = createStandardModalBackdrop({
            backdropId: 'tm-buff-item-modal-backdrop',
            modalId: 'tm-buff-item-modal',
            title: 'Item settings',
            closeId: 'tm-buff-modal-close',
            bodyHtml,
        });
        if (backdrop.dataset.tmBuffBound === '1') return backdrop;
        backdrop.dataset.tmBuffBound = '1';

        backdrop.addEventListener('click', (event) => {
            if (event.target === backdrop) {
                closeItemSettingsModal();
            }
        });
        backdrop.querySelector('#tm-buff-modal-close')?.addEventListener('click', closeItemSettingsModal);
        backdrop.querySelector('#tm-buff-modal-cancel')?.addEventListener('click', closeItemSettingsModal);

        backdrop.querySelector('#tm-buff-modal-save')?.addEventListener('click', () => {
            const assetId = backdrop.dataset.assetId || '';
            if (!assetId) return;

            const targetInput = backdrop.querySelector('#tm-buff-modal-target');
            const paidInput = backdrop.querySelector('#tm-buff-modal-paid-eur');
            const excludedInput = backdrop.querySelector('#tm-buff-modal-excluded');
            const targetValue = targetInput ? targetInput.value : '';
            const paidValue = paidInput ? paidInput.value : '';
            const excluded = !!(excludedInput && excludedInput.checked);

            setAssetTargetSellEur(assetId, targetValue);
            setAssetCustomPaidEur(assetId, paidValue);
            setAssetExcluded(assetId, excluded);

            closeItemSettingsModal();

            const currentRate = getCachedCnyEurRate();
            if (currentRate) {
                renderPaidEurValues(currentRate, true);
                applyPlFilterAndSummary();
            } else {
                initPaidEurFeature();
            }
        });

        return backdrop;
    }

    function openItemSettingsModal(item, marketPriceEur) {
        const assetId = getAssetIdFromItem(item);
        if (!assetId) return;

        const modal = getOrCreateItemSettingsModal();
        modal.dataset.assetId = assetId;

        const name = item.querySelector('h3 a')?.textContent?.trim() || 'Item settings';
        const target = getAssetTargetSellEur(assetId);
        const customPaidEur = getAssetCustomPaidEur(assetId);
        const customPaidCnyLegacy = getAssetLegacyCustomPaidCny(assetId);
        const excluded = isAssetExcluded(assetId);
        const ready = Number.isFinite(marketPriceEur) && Number.isFinite(target) && marketPriceEur >= target;

        const titleEl = modal.querySelector('.tm-buff-modal-title');
        const paidEl = modal.querySelector('#tm-buff-modal-paid-eur');
        const targetEl = modal.querySelector('#tm-buff-modal-target');
        const excludedEl = modal.querySelector('#tm-buff-modal-excluded');
        const hintEl = modal.querySelector('#tm-buff-modal-hint');

        if (titleEl) titleEl.textContent = name;
        if (paidEl) paidEl.value = customPaidEur ? customPaidEur.toFixed(2) : '';
        if (targetEl) targetEl.value = target ? target.toFixed(2) : '';
        if (excludedEl) excludedEl.checked = excluded;
        if (hintEl) {
            const currentText = Number.isFinite(marketPriceEur) ? `Current: ${formatEur(marketPriceEur)}` : 'Current: N/A';
            const statusText = target ? (ready ? 'Status: Ready' : 'Status: Waiting') : 'Status: No target set';
            const paidSource = customPaidEur
                ? `Paid source: Custom EUR (${formatEur(customPaidEur)})`
                : customPaidCnyLegacy
                    ? `Paid source: Legacy custom CNY (¥ ${customPaidCnyLegacy.toFixed(2)})`
                    : 'Paid source: BUFF';
            hintEl.textContent = `${currentText} · ${statusText} · ${paidSource}`;
        }

        modal.style.display = 'flex';
    }

    function closeGlobalSettingsModal() {
        const backdrop = document.getElementById('tm-buff-global-settings-backdrop');
        if (!backdrop) return;
        backdrop.style.display = 'none';
    }

    function getOrCreateGlobalSettingsModal() {
        const bodyHtml = `
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
            <div class="tm-buff-modal-hint">More options can be moved here later.</div>
            <div class="tm-buff-modal-actions">
                <button type="button" class="tm-buff-modal-btn primary" id="tm-buff-global-settings-save">Save</button>
            </div>
        `;
        const backdrop = createStandardModalBackdrop({
            backdropId: 'tm-buff-global-settings-backdrop',
            modalId: 'tm-buff-global-settings-modal',
            title: 'buff163-tools settings',
            closeId: 'tm-buff-global-settings-close',
            bodyHtml,
        });
        if (backdrop.dataset.tmBuffBound === '1') return backdrop;
        backdrop.dataset.tmBuffBound = '1';

        backdrop.addEventListener('click', (event) => {
            if (event.target === backdrop) closeGlobalSettingsModal();
        });
        backdrop.querySelector('#tm-buff-global-settings-close')?.addEventListener('click', closeGlobalSettingsModal);

        backdrop.querySelector('#tm-buff-global-settings-save')?.addEventListener('click', () => {
            const onlySaleableInput = backdrop.querySelector('#tm-buff-global-only-saleable');
            const showRefsInput = backdrop.querySelector('#tm-buff-global-show-refs');
            setOnlySaleableEnabled(!!onlySaleableInput?.checked);
            setShowRefsEnabled(!!showRefsInput?.checked);
            closeGlobalSettingsModal();
            refreshUiAndPl();
        });

        return backdrop;
    }

    function openGlobalSettingsModal() {
        const modal = getOrCreateGlobalSettingsModal();
        const onlySaleableInput = modal.querySelector('#tm-buff-global-only-saleable');
        const showRefsInput = modal.querySelector('#tm-buff-global-show-refs');
        if (onlySaleableInput) onlySaleableInput.checked = isOnlySaleableEnabled();
        if (showRefsInput) showRefsInput.checked = isShowRefsEnabled();
        modal.style.display = 'flex';
    }

    function getOrCreateFloatbarEntry() {
        const floatbarList = document.querySelector('.floatbar > ul');
        if (!floatbarList) return;

        let existing = document.getElementById('tm-buff-float-settings');
        if (existing) return;

        const li = document.createElement('li');
        li.id = 'tm-buff-float-settings';
        li.innerHTML = `
            <a href="javascript:void(0)">
                <i class="icon icon_menu icon_menu_setting" aria-hidden="true"></i>
                <p>Tools</p>
            </a>
        `;
        li.querySelector('a')?.addEventListener('click', (event) => {
            event.preventDefault();
            openGlobalSettingsModal();
        });

        floatbarList.insertBefore(li, floatbarList.firstChild);
    }

    function isFullInventoryMode() {
        const quantity = getQuantityFromBriefInfo();
        const currentPageSize = getCurrentPageSize();

        if (!quantity) return false;
        return currentPageSize >= quantity;
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

    function forcePageSizeAndReload(newSize) {
        updateHashAndReload((params) => {
            params.set('page_num', '1');
            params.set('page_size', String(newSize));
        });
    }

    function setTabText(text, title = '') {
        const link = document.getElementById('tm-buff-fullinv-link');
        if (!link) return;

        let textNode = link.childNodes[0];

        if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
            textNode = document.createTextNode('');
            link.insertBefore(textNode, link.firstChild);
        }

        textNode.nodeValue = `${text} `;
        link.title = title;
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

        const targetState = checked ? 'cansell' : 'all';
        if (getCurrentStateFilter() === targetState) {
            return;
        }

        updateHashAndReload((params) => {
            params.set('page_num', '1');
            params.set('state', targetState);
        });
    }

    function handlePlFilterChange(value) {
        setPlFilter(value);
        applyPlFilterAndSummary();
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

        let textNode = link.childNodes[0];
        if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
            textNode = document.createTextNode('');
            link.insertBefore(textNode, link.firstChild);
        }

        li.classList.remove('on');

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

        updateHashAndReload((params) => {
            params.set('page_num', '1');
            params.set('page_size', String(desiredPageSize));
        });
    }

    function enforceOnlySaleableIfNeeded() {
        const desiredState = isOnlySaleableEnabled() ? 'cansell' : 'all';
        const currentState = getCurrentStateFilter();

        if (currentState === desiredState) {
            return;
        }

        updateHashAndReload((params) => {
            params.set('page_num', '1');
            params.set('state', desiredState);
        });
    }

    function getCachedCnyEurRate() {
        const rawRate = localStorage.getItem(STORAGE_KEY_CNY_EUR_RATE);
        if (!rawRate) return null;

        const rate = parseFloat(rawRate);
        return Number.isFinite(rate) && rate > 0 ? rate : null;
    }

    function getCachedCnyEurRateDate() {
        return localStorage.getItem(STORAGE_KEY_CNY_EUR_RATE_DATE) || '';
    }

    function setCachedCnyEurRate(rate, date = '') {
        if (!Number.isFinite(rate) || rate <= 0) return;
        localStorage.setItem(STORAGE_KEY_CNY_EUR_RATE, String(rate));
        if (date) {
            localStorage.setItem(STORAGE_KEY_CNY_EUR_RATE_DATE, date);
        }
    }

    async function ensureCnyEurRate() {
        const cachedRate = getCachedCnyEurRate();
        if (cachedRate) {
            return cachedRate;
        }

        const response = await fetch('https://api.frankfurter.dev/v1/latest?base=CNY&symbols=EUR');
        if (!response.ok) {
            throw new Error(`Failed to fetch exchange rate: HTTP ${response.status}`);
        }

        const data = await response.json();
        const rate = data?.rates?.EUR;

        if (!Number.isFinite(rate) || rate <= 0) {
            throw new Error('Invalid CNY→EUR exchange rate received');
        }

        setCachedCnyEurRate(rate, data?.date || '');
        return rate;
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
        const orderExtra = parseJsonAttribute(item, 'data-order-extra');
        if (orderExtra && orderExtra.buy_price) {
            const buyPrice = parseFloat(orderExtra.buy_price);
            if (Number.isFinite(buyPrice) && buyPrice > 0) {
                return buyPrice;
            }
        }

        const remarkLink = item.querySelector('.asset-remark-edit[data-buy_price]');
        if (remarkLink) {
            const buyPrice = parseFloat(remarkLink.getAttribute('data-buy_price'));
            if (Number.isFinite(buyPrice) && buyPrice > 0) {
                return buyPrice;
            }
        }

        return null;
    }

    function getMarketPriceEurFromItem(item) {
        const strong = item.querySelector('p strong.f_Strong');
        if (!strong) return null;

        const text = strong.textContent || '';
        const cleaned = text.replace(/[^\d,.\-]/g, '').replace(',', '.');

        const value = parseFloat(cleaned);
        return Number.isFinite(value) ? value : null;
    }

    function formatEur(value) {
        return `€ ${value.toFixed(2)}`;
    }

    function getPriceContainer(item) {
        return item.querySelector('p');
    }

    function getOrCreateMetaBlock(item) {
        let block = item.querySelector('.tm-buff-meta');
        if (block) return block;

        const priceContainer = getPriceContainer(item);
        if (!priceContainer) return null;

        block = document.createElement('div');
        block.className = 'tm-buff-meta';

        const paidLine = document.createElement('span');
        paidLine.className = 'tm-buff-meta-line tm-buff-meta-paid';
        paidLine.innerHTML = '&nbsp;';

        const plLine = document.createElement('span');
        plLine.className = 'tm-buff-meta-line tm-buff-meta-pl';
        plLine.innerHTML = '&nbsp;';

        const refsLine = document.createElement('span');
        refsLine.className = 'tm-buff-meta-line tm-buff-meta-refs';
        refsLine.innerHTML = '&nbsp;';

        const actionsLine = document.createElement('span');
        actionsLine.className = 'tm-buff-meta-line tm-buff-meta-actions';
        actionsLine.innerHTML = '&nbsp;';

        block.appendChild(paidLine);
        block.appendChild(plLine);
        block.appendChild(refsLine);
        block.appendChild(actionsLine);

        priceContainer.insertAdjacentElement('afterend', block);
        return block;
    }

    function renderPaidEurValues(rate, forceRefresh = false) {
        const items = document.querySelectorAll(SELECTORS.inventoryItems);
        if (!items.length) return;

        const rateDate = getCachedCnyEurRateDate();
        const rateKey = Number.isFinite(rate) && rate > 0 ? rate.toFixed(6) : '';
        LAST_RATE_KEY = rateKey || LAST_RATE_KEY;

        items.forEach((item) => {
            if (!forceRefresh && rateKey && item.dataset.tmBuffProcessed === rateKey) {
                return;
            }

            const block = getOrCreateMetaBlock(item);
            if (!block) return;

            const paidLine = block.querySelector('.tm-buff-meta-paid');
            const plLine = block.querySelector('.tm-buff-meta-pl');
            const refsLine = block.querySelector('.tm-buff-meta-refs');
            const actionsLine = block.querySelector('.tm-buff-meta-actions');

            if (!paidLine || !plLine || !refsLine || !actionsLine) return;

            const assetId = getAssetIdFromItem(item);
            const customPaidEur = getAssetCustomPaidEur(assetId);
            const legacyCustomPaidCny = getAssetLegacyCustomPaidCny(assetId);
            const buffPaidCny = getBuyPriceCnyFromItem(item);
            const isCustomPaidEur = Number.isFinite(customPaidEur) && customPaidEur > 0;
            const isCustomPaidCnyLegacy = !isCustomPaidEur && Number.isFinite(legacyCustomPaidCny) && legacyCustomPaidCny > 0;
            const isCustomPaid = isCustomPaidEur || isCustomPaidCnyLegacy;
            const marketPriceEur = getMarketPriceEurFromItem(item);

            plLine.classList.remove('pl-positive', 'pl-negative');
            delete item.dataset.tmBuffPl;

            // References: BUFF listing / floor and Steam prices
            const goodsInfo = parseJsonAttribute(item, 'data-goods-info') || {};
            const itemInfo = parseJsonAttribute(item, 'data-item-info') || {};
            const excluded = isAssetExcluded(assetId);
            const isMergedItem =
                item.classList.contains('card_folder') ||
                !!item.querySelector('.fold_asset_count[data-fold_asset_count]');
            item.dataset.tmBuffExcluded = excluded ? '1' : '0';
            item.classList.toggle('tm-buff-item-excluded', excluded);

            const listingCny = Number.isFinite(parseFloat(itemInfo.price)) ? parseFloat(itemInfo.price) : null;
            const floorCny = Number.isFinite(parseFloat(goodsInfo.sell_min_price)) ? parseFloat(goodsInfo.sell_min_price) : null;
            const steamCny = Number.isFinite(parseFloat(goodsInfo.steam_price_cny)) ? parseFloat(goodsInfo.steam_price_cny) : null;
            const steamUsd = Number.isFinite(parseFloat(goodsInfo.steam_price)) ? parseFloat(goodsInfo.steam_price) : null;
            const steamEurFromCny = steamCny && Number.isFinite(rate) && rate > 0 ? steamCny * rate : null;
            const targetSellEur = getAssetTargetSellEur(assetId);
            const isReadyToSell = Number.isFinite(marketPriceEur) && Number.isFinite(targetSellEur) && marketPriceEur >= targetSellEur;
            item.classList.toggle('tm-buff-item-ready', !excluded && isReadyToSell);

            const showRefs = isShowRefsEnabled();

            if (showRefs && (listingCny || floorCny || steamCny || steamUsd)) {
                const summaryBits = [];
                if (listingCny) {
                    summaryBits.push(`BUFF ¥${listingCny.toFixed(0)}`);
                }
                if (steamEurFromCny) {
                    summaryBits.push(`Steam €${steamEurFromCny.toFixed(0)}`);
                } else if (steamCny) {
                    summaryBits.push(`Steam ¥${steamCny.toFixed(0)}`);
                }

                const summaryText = summaryBits.join(' · ');
                const targetStatusClass = isReadyToSell ? 'tm-buff-target-status ready' : 'tm-buff-target-status';
                const targetStatusText = targetSellEur ? (isReadyToSell ? 'Ready' : 'Waiting') : '';
                refsLine.innerHTML =
                    `<span class="tm-buff-meta-label">Refs:</span>` +
                    `<span class="tm-buff-meta-value">${summaryText}</span>`;

                actionsLine.innerHTML =
                    (!isMergedItem && assetId && targetStatusText
                        ? `<span class="tm-buff-target-status ${targetStatusClass.includes('ready') ? 'ready' : ''}">${targetStatusText}</span>`
                        : '') +
                    (!isMergedItem && assetId
                        ? `<span class="tm-buff-exclude-toggle readonly${excluded ? ' is-excluded' : ''}" title="${excluded ? 'Excluded from totals' : 'Included in totals'}">${excluded ? 'Excluded' : 'Included'}</span>`
                        : '') +
                    (!isMergedItem && assetId
                        ? `<button type="button" class="tm-buff-item-settings-btn" title="Open item settings">⚙</button>`
                        : (isMergedItem ? `<span class="tm-buff-merged-note">Merged stack (settings unavailable)</span>` : ''));

                const fullParts = [];
                if (listingCny) fullParts.push(`BUFF listing: ¥ ${listingCny.toFixed(2)}`);
                if (floorCny) fullParts.push(`BUFF floor: ¥ ${floorCny.toFixed(2)}`);
                if (steamCny) fullParts.push(`Steam (CNY): ¥ ${steamCny.toFixed(2)}`);
                if (steamEurFromCny) fullParts.push(`Steam (EUR, via rate): € ${steamEurFromCny.toFixed(2)}`);
                if (steamUsd) fullParts.push(`Steam (USD): $ ${steamUsd.toFixed(2)}`);
                if (targetSellEur) {
                    fullParts.push(`Target sell (EUR): € ${targetSellEur.toFixed(2)}`);
                    fullParts.push(`Status: ${isReadyToSell ? 'Ready' : 'Waiting'}`);
                }

                refsLine.title = fullParts.join(' · ');
                actionsLine.removeAttribute('title');
            } else {
                const targetStatusClass = isReadyToSell ? 'tm-buff-target-status ready' : 'tm-buff-target-status';
                const targetStatusText = targetSellEur ? (isReadyToSell ? 'Ready' : 'Waiting') : '';
                refsLine.innerHTML = '&nbsp;';
                actionsLine.innerHTML =
                    (!isMergedItem && assetId && targetStatusText
                        ? `<span class="tm-buff-target-status ${targetStatusClass.includes('ready') ? 'ready' : ''}">${targetStatusText}</span>`
                        : '') +
                    (!isMergedItem && assetId
                        ? `<span class="tm-buff-exclude-toggle readonly${excluded ? ' is-excluded' : ''}" title="${excluded ? 'Excluded from totals' : 'Included in totals'}">${excluded ? 'Excluded' : 'Included'}</span>`
                        : '') +
                    (!isMergedItem && assetId
                        ? `<button type="button" class="tm-buff-item-settings-btn" title="Open item settings">⚙</button>`
                        : (isMergedItem ? `<span class="tm-buff-merged-note">Merged stack (settings unavailable)</span>` : '&nbsp;'));
                refsLine.removeAttribute('title');
                actionsLine.removeAttribute('title');
            }

            const settingsBtn = actionsLine.querySelector('.tm-buff-item-settings-btn');
            if (settingsBtn && !isMergedItem) {
                settingsBtn.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    openItemSettingsModal(item, marketPriceEur);
                });
            }

            if (!buffPaidCny && !isCustomPaid) {
                paidLine.innerHTML = '&nbsp;';
                plLine.innerHTML = '&nbsp;';
                paidLine.removeAttribute('title');
                plLine.removeAttribute('title');
                paidLine.classList.remove('tm-buff-meta-paid-custom');
                return;
            }

            const paidEur = isCustomPaidEur
                ? customPaidEur
                : (isCustomPaidCnyLegacy ? legacyCustomPaidCny * rate : buffPaidCny * rate);
            const paidCnyForTooltip = isCustomPaidEur
                ? (Number.isFinite(rate) && rate > 0 ? (customPaidEur / rate) : null)
                : (isCustomPaidCnyLegacy ? legacyCustomPaidCny : buffPaidCny);
            paidLine.classList.toggle('tm-buff-meta-paid-custom', isCustomPaid);
            paidLine.innerHTML =
                `<span class="tm-buff-meta-label">${isCustomPaid ? 'Paid*:' : 'Paid:'}</span>` +
                `<span class="tm-buff-meta-value">${formatEur(paidEur)}</span>`;
            paidLine.title = rateDate
                ? `${isCustomPaid ? 'Custom paid' : 'Buy price'}: ${paidCnyForTooltip !== null ? `¥ ${paidCnyForTooltip.toFixed(2)} · ` : ''}${paidEur.toFixed(2)} EUR · Rate date: ${rateDate}`
                : `${isCustomPaid ? 'Custom paid' : 'Buy price'}: ${paidCnyForTooltip !== null ? `¥ ${paidCnyForTooltip.toFixed(2)} · ` : ''}${paidEur.toFixed(2)} EUR`;

            if (!Number.isFinite(marketPriceEur)) {
                plLine.innerHTML = '&nbsp;';
                plLine.removeAttribute('title');
                return;
            }

            const pl = marketPriceEur - paidEur;
            item.dataset.tmBuffPl = String(pl);

            const plPercent = paidEur > 0 ? (pl / paidEur) * 100 : null;
            const sign = pl > 0 ? '+' : '';

            const plText =
                `${sign}${formatEur(pl)}${plPercent !== null ? ` (${sign}${plPercent.toFixed(1)}%)` : ''}`;

            plLine.innerHTML =
                `<span class="tm-buff-meta-label">P/L:</span>` +
                `<span class="tm-buff-meta-value">${plText}</span>`;
            plLine.title = `Market: ${formatEur(marketPriceEur)} · Paid: ${formatEur(paidEur)}`;

            if (pl > 0) {
                plLine.classList.add('pl-positive');
            } else if (pl < 0) {
                plLine.classList.add('pl-negative');
            }

            if (rateKey) {
                item.dataset.tmBuffProcessed = rateKey;
            }
        });
    }

    function applyPlFilterAndSummary() {
        const items = document.querySelectorAll(SELECTORS.inventoryItems);
        const filter = getPlFilter();

        const onlySaleable = isOnlySaleableEnabled();

        let total = 0;
        let count = 0;

        let winnersTotal = 0;
        let losersTotal = 0;
        let winnersCount = 0;
        let losersCount = 0;
        let excludedCount = 0;

        items.forEach((item) => {
            const plRaw = item.dataset.tmBuffPl;
            const hasPl = typeof plRaw !== 'undefined';
            const pl = hasPl ? parseFloat(plRaw) : null;
            const excluded = item.dataset.tmBuffExcluded === '1';

            let show = true;

            if (filter === 'winners') {
                show = hasPl && Number.isFinite(pl) && pl > 0;
            } else if (filter === 'losers') {
                show = hasPl && Number.isFinite(pl) && pl < 0;
            }

            item.style.display = show ? '' : 'none';

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

        updateSummary(
            total,
            count,
            filter,
            winnersTotal,
            losersTotal,
            winnersCount,
            losersCount,
            onlySaleable,
            excludedCount
        );
    }

    function updateSummary(
        total,
        count,
        filter,
        winnersTotal,
        losersTotal,
        winnersCount,
        losersCount,
        onlySaleable,
        excludedCount
    ) {
        const summary = document.getElementById('tm-buff-pl-summary');
        if (!summary) return;

        const filterLabel =
            filter === 'winners' ? 'Winners' :
            filter === 'losers' ? 'Losers' :
            'All';

        const scopeLabel = onlySaleable ? 'Saleable' : 'All items';

        const netSign = total > 0 ? '+' : '';
        const winnersSign = winnersTotal > 0 ? '+' : '';
        const losersSign = losersTotal > 0 ? '+' : '';

        const netClass =
            total > 0 ? 'tm-buff-pl-net-positive' :
            total < 0 ? 'tm-buff-pl-net-negative' :
            '';

        summary.innerHTML =
            `Visible (${scopeLabel}, ${filterLabel}, ${count} items): ` +
            `Winners ${winnersCount}: <strong class="tm-buff-pl-winners">${winnersSign}${formatEur(winnersTotal)}</strong> · ` +
            `Losers ${losersCount}: <strong class="tm-buff-pl-losers">${losersSign}${formatEur(losersTotal)}</strong> · ` +
            `Net: <strong class="${netClass}">${netSign}${formatEur(total)}</strong>` +
            (excludedCount > 0 ? ` · Excluded: ${excludedCount}` : '');
    }

    function updateFxInfo(opts) {
        const fxEl = document.getElementById('tm-buff-fx');
        if (!fxEl) return;

        const { rate, date, error } = opts || {};

        if (error) {
            fxEl.textContent = 'FX: unavailable';
            fxEl.title = 'CNY→EUR rate could not be fetched. P/L may be unavailable.';
            return;
        }

        const effectiveRate = typeof rate === 'number' && Number.isFinite(rate) && rate > 0
            ? rate
            : getCachedCnyEurRate();
        const effectiveDate = date || getCachedCnyEurRateDate();

        if (!effectiveRate) {
            fxEl.textContent = 'FX: not loaded';
            fxEl.title = 'CNY→EUR rate not loaded yet.';
            return;
        }

        fxEl.textContent = effectiveDate
            ? `FX: 1 CNY = € ${effectiveRate.toFixed(4)} (${effectiveDate})`
            : `FX: 1 CNY = € ${effectiveRate.toFixed(4)}`;
        fxEl.title = 'CNY→EUR conversion rate used for P/L calculations.';
    }

    function getOrCreateToolbar() {
        const marketHeader = document.querySelector(SELECTORS.marketHeader);
        const criteria = document.querySelector(SELECTORS.criteria);

        if (!marketHeader || !criteria) return null;

        let toolbar = document.getElementById('tm-buff-toolbar');
        if (toolbar) return toolbar;

        toolbar = document.createElement('div');
        toolbar.id = 'tm-buff-toolbar';

        const title = document.createElement('span');
        title.className = 'tm-buff-toolbar-title';
        title.textContent = 'buff163-tools';

        const saleableLabel = document.createElement('label');
        saleableLabel.className = 'tm-buff-toolbar-option';

        const saleableCheckbox = document.createElement('input');
        saleableCheckbox.type = 'checkbox';
        saleableCheckbox.id = 'tm-buff-only-saleable';
        saleableCheckbox.checked = isOnlySaleableEnabled();
        saleableCheckbox.addEventListener('change', () => {
            handleOnlySaleableChange(saleableCheckbox.checked);
        });

        const saleableText = document.createElement('span');
        saleableText.textContent = 'Only saleable';

        saleableLabel.appendChild(saleableCheckbox);
        saleableLabel.appendChild(saleableText);

        const refsLabel = document.createElement('label');
        refsLabel.className = 'tm-buff-toolbar-option';

        const refsCheckbox = document.createElement('input');
        refsCheckbox.type = 'checkbox';
        refsCheckbox.id = 'tm-buff-show-refs';
        refsCheckbox.checked = isShowRefsEnabled();
        refsCheckbox.addEventListener('change', () => {
            setShowRefsEnabled(refsCheckbox.checked);
            // Force re-render of meta refs line on current page
            const rate = getCachedCnyEurRate();
            if (rate) {
                renderPaidEurValues(rate);
                applyPlFilterAndSummary();
            } else {
                initPaidEurFeature();
            }
        });

        const refsText = document.createElement('span');
        refsText.textContent = 'Show refs';

        refsLabel.appendChild(refsCheckbox);
        refsLabel.appendChild(refsText);

        const plFilterWrap = document.createElement('label');
        plFilterWrap.className = 'tm-buff-toolbar-option';

        const plFilterText = document.createElement('span');
        plFilterText.textContent = 'P/L filter';

        const plFilterSelect = document.createElement('select');
        plFilterSelect.id = 'tm-buff-pl-filter';
        [
            ['all', 'All'],
            ['winners', 'Winners'],
            ['losers', 'Losers'],
        ].forEach(([value, label]) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = label;
            plFilterSelect.appendChild(option);
        });

        plFilterSelect.value = getPlFilter();
        plFilterSelect.addEventListener('change', () => {
            handlePlFilterChange(plFilterSelect.value);
        });

        plFilterWrap.appendChild(plFilterText);
        plFilterWrap.appendChild(plFilterSelect);

        const summary = document.createElement('span');
        summary.id = 'tm-buff-pl-summary';
        summary.className = 'tm-buff-summary';
        summary.innerHTML = 'Visible P/L (All, 0 items): <strong>€ 0.00</strong>';

        const fxInfo = document.createElement('span');
        fxInfo.id = 'tm-buff-fx';
        fxInfo.className = 'tm-buff-fx';
        fxInfo.textContent = 'FX: not loaded';

        toolbar.appendChild(title);
        toolbar.appendChild(saleableLabel);
        toolbar.appendChild(refsLabel);
        toolbar.appendChild(plFilterWrap);
        toolbar.appendChild(summary);
        toolbar.appendChild(fxInfo);

        criteria.insertAdjacentElement('beforebegin', toolbar);
        return toolbar;
    }

    function syncToolbarState() {
        const saleableCheckbox = document.getElementById('tm-buff-only-saleable');
        if (saleableCheckbox) {
            saleableCheckbox.checked = isOnlySaleableEnabled();
        }

        const refsCheckbox = document.getElementById('tm-buff-show-refs');
        if (refsCheckbox) {
            refsCheckbox.checked = isShowRefsEnabled();
        }

        const plFilterSelect = document.getElementById('tm-buff-pl-filter');
        if (plFilterSelect) {
            plFilterSelect.value = getPlFilter();
        }
    }

    async function initPaidEurFeature() {
        const inventoryList = document.querySelector(SELECTORS.inventoryList);
        if (!inventoryList) {
            return;
        }

        try {
            const rate = await ensureCnyEurRate();
            const date = getCachedCnyEurRateDate();
            renderPaidEurValues(rate);
            applyPlFilterAndSummary();
            updateFxInfo({ rate, date });
        } catch (err) {
            console.error('[buff163-tools] Failed to initialize CNY→EUR conversion:', err);
            updateFxInfo({ error: true });
            const summary = document.getElementById('tm-buff-pl-summary');
            if (summary) {
                summary.innerHTML = 'Visible P/L: <strong>unavailable (FX error)</strong>';
                summary.classList.remove('positive', 'negative');
            }
        }
    }

    function summarizeTierLadder() {
        const container = document.querySelector('#relative-goods .scope-btns');
        if (!container) return;

        let target = document.getElementById('tm-buff-goods-analysis');
        if (!target) {
            target = document.createElement('div');
            target.id = 'tm-buff-goods-analysis';
            container.insertAdjacentElement('afterend', target);
        }

        const buttons = Array.from(container.querySelectorAll('a.i_Btn'));
        if (!buttons.length) {
            target.textContent = 'No wear / StatTrak price ladder available.';
            return;
        }

        const tiers = [];

        buttons.forEach((btn) => {
            const text = btn.textContent.replace(/\s+/g, ' ').trim();
            if (!text) return;

            const priceMatch = text.match(/€\s*([\d.,]+)/);
            if (!priceMatch) return;
            const price = parseFloat(priceMatch[1].replace(',', '.'));
            if (!Number.isFinite(price) || price <= 0) return;

            let kind = 'normal';
            if (/StatTrak/i.test(text)) {
                kind = 'stattrak';
            } else if (/Souvenir/i.test(text)) {
                kind = 'souvenir';
            }

            let wear = 'Other';
            if (/Factory New/i.test(text)) wear = 'Factory New';
            else if (/Minimal Wear/i.test(text)) wear = 'Minimal Wear';
            else if (/Field-Tested/i.test(text)) wear = 'Field-Tested';
            else if (/Well-Worn/i.test(text)) wear = 'Well-Worn';
            else if (/Battle-Scarred/i.test(text)) wear = 'Battle-Scarred';

            tiers.push({ label: text, price, kind, wear });
        });

        if (!tiers.length) {
            target.textContent = 'No wear / StatTrak price ladder available.';
            return;
        }

        const normals = tiers.filter((t) => t.kind === 'normal');
        const stattraks = tiers.filter((t) => t.kind === 'stattrak');

        let baselineNormal = null;
        if (normals.length) {
            baselineNormal = normals.reduce((min, t) => (t.price < min.price ? t : min), normals[0]);
        }

        const anomalyNotes = [];

        if (baselineNormal && stattraks.length) {
            const cheapestSt = stattraks.reduce((min, t) => (t.price < min.price ? t : min), stattraks[0]);
            if (cheapestSt.price < baselineNormal.price) {
                anomalyNotes.push(
                    `Cheapest StatTrak (€${cheapestSt.price.toFixed(2)}) is cheaper than cheapest normal (€${baselineNormal.price.toFixed(2)}).`
                );
            }
        }

        const fn = normals.find((t) => t.wear === 'Factory New');
        const mw = normals.find((t) => t.wear === 'Minimal Wear');
        const ft = normals.find((t) => t.wear === 'Field-Tested');

        if (fn && mw) {
            const ratio = fn.price / mw.price;
            if (ratio >= 3) {
                anomalyNotes.push(
                    `Factory New (€${fn.price.toFixed(2)}) is ${ratio.toFixed(1)}× Minimal Wear (€${mw.price.toFixed(2)}).`
                );
            }
        }

        if (fn && ft) {
            const ratio = fn.price / ft.price;
            if (ratio >= 5) {
                anomalyNotes.push(
                    `Factory New (€${fn.price.toFixed(2)}) is ${ratio.toFixed(1)}× Field-Tested (€${ft.price.toFixed(2)}).`
                );
            }
        }

        tiers.sort((a, b) => a.price - b.price);

        const lines = [];
        lines.push('<div class="tm-buff-analysis-title">buff163-tools · Price ladder</div>');
        lines.push(
            '<div class="tm-buff-analysis-row">' +
                tiers
                    .map((t) => `${t.kind === 'stattrak' ? 'StatTrak ' : t.kind === 'souvenir' ? 'Souvenir ' : ''}${t.wear}: €${t.price.toFixed(2)}`)
                    .join(' · ') +
                '</div>'
        );

        if (anomalyNotes.length) {
            lines.push(
                `<div class="tm-buff-analysis-row tm-buff-analysis-flag">Possible anomalies:</div>` +
                `<div class="tm-buff-analysis-row">${anomalyNotes.join(' ')}</div>`
            );
        } else {
            lines.push('<div class="tm-buff-analysis-note">No obvious ladder anomalies detected.</div>');
        }

        target.innerHTML = lines.join('');
    }

    function refreshUiAndPl() {
        getOrCreateFloatbarEntry();
        getOrCreateToolbar();
        syncToolbarState();
        enforceOnlySaleableIfNeeded();
        enforceFullModeIfNeeded();
        renderOrUpdateButton();
        initPaidEurFeature();
    }

    function setupInventoryObserver() {
        const inventoryList = document.querySelector(SELECTORS.inventoryList);
        if (!inventoryList) {
            return;
        }

        if (inventoryList.dataset.tmBuffObserverAttached === '1') {
            return;
        }

        let refreshScheduled = false;

        const observer = new MutationObserver((mutations) => {
            let shouldRefresh = false;

            for (const mutation of mutations) {
                if (mutation.type === 'childList' &&
                    (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)) {
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
                    refreshUiAndPl();
                } catch (err) {
                    console.error('[buff163-tools] Mutation observer refresh failed:', err);
                }
            }, 100);
        });

        observer.observe(inventoryList, {
            childList: true,
        });

        inventoryList.dataset.tmBuffObserverAttached = '1';
    }

    function init() {
        injectStyles();
        if (/^\/goods\/\d+/.test(window.location.pathname)) {
            summarizeTierLadder();
            return;
        }

        refreshUiAndPl();
        setupInventoryObserver();

        let tries = 0;
        const maxTries = 20;

        const intervalId = setInterval(() => {
            refreshUiAndPl();
            setupInventoryObserver();
            tries += 1;

            if (tries >= maxTries) {
                clearInterval(intervalId);
            }
        }, 1000);

        window.addEventListener('hashchange', () => {
            setTimeout(() => {
                refreshUiAndPl();
                setupInventoryObserver();
            }, 100);
        });
    }

    init();
})();