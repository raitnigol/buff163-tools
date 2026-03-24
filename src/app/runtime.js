(function () {
    'use strict';

    const MODULES = window.__BUFF163_MODULES__;
    if (!MODULES || typeof MODULES !== 'object') {
        console.error('[buff163-tools] Module bridge missing, aborting runtime init.');
        return;
    }
    const requireFn = (key) => {
        const fn = MODULES[key];
        return typeof fn === 'function' ? fn : null;
    };
    const MODULE_SELECTORS = MODULES.SELECTORS || null;
    const MODULE_STORAGE_KEYS = MODULES.STORAGE_KEYS || null;
    const MODULE_FALLBACK_DEFAULT_PAGE_SIZE = MODULES.FALLBACK_DEFAULT_PAGE_SIZE;
    const MODULE_LOAD_SETTINGS = requireFn('loadSettings');
    const MODULE_SAVE_SETTINGS = requireFn('saveSettings');
    const MODULE_PARSE_HASH_PARAMS = requireFn('parseHashParams');
    const MODULE_BUILD_HASH = requireFn('buildHash');
    const MODULE_UPDATE_HASH_AND_RELOAD = requireFn('updateHashAndReload');
    const MODULE_GET_CACHED_CNY_EUR_RATE = requireFn('getCachedCnyEurRate');
    const MODULE_GET_CACHED_CNY_EUR_RATE_DATE = requireFn('getCachedCnyEurRateDate');
    const MODULE_GET_TODAY_ISO_DATE = requireFn('getTodayIsoDate');
    const MODULE_SET_CACHED_CNY_EUR_RATE = requireFn('setCachedCnyEurRate');
    const MODULE_ENSURE_CNY_EUR_RATE = requireFn('ensureCnyEurRate');
    const MODULE_BUILD_FX_STATUS_TEXT = requireFn('buildFxStatusText');
    const MODULE_SETUP_INVENTORY_OBSERVER = requireFn('setupInventoryObserver');
    const MODULE_COMPUTE_PL_VISIBILITY_AND_TOTALS = requireFn('computePlVisibilityAndTotals');
    const MODULE_BUILD_PL_SUMMARY_HTML = requireFn('buildPlSummaryHtml');
    const MODULE_GET_ASSET_ID_FROM_ITEM = requireFn('getAssetIdFromItem');
    const MODULE_IS_ASSET_EXCLUDED = requireFn('isAssetExcluded');
    const MODULE_SET_ASSET_EXCLUDED = requireFn('setAssetExcluded');
    const MODULE_GET_ASSET_TARGET_SELL_EUR = requireFn('getAssetTargetSellEur');
    const MODULE_SET_ASSET_TARGET_SELL_EUR = requireFn('setAssetTargetSellEur');
    const MODULE_GET_ASSET_CUSTOM_PAID_EUR = requireFn('getAssetCustomPaidEur');
    const MODULE_GET_ASSET_LEGACY_CUSTOM_PAID_CNY = requireFn('getAssetLegacyCustomPaidCny');
    const MODULE_SET_ASSET_CUSTOM_PAID_EUR = requireFn('setAssetCustomPaidEur');
    const MODULE_CREATE_STANDARD_MODAL_BACKDROP = requireFn('createStandardModalBackdrop');
    const MODULE_CLOSE_ITEM_SETTINGS_MODAL = requireFn('closeItemSettingsModal');
    const MODULE_GET_OR_CREATE_ITEM_SETTINGS_MODAL = requireFn('getOrCreateItemSettingsModal');
    const MODULE_OPEN_ITEM_SETTINGS_MODAL = requireFn('openItemSettingsModal');
    const MODULE_CLOSE_GLOBAL_SETTINGS_MODAL = requireFn('closeGlobalSettingsModal');
    const MODULE_GET_OR_CREATE_GLOBAL_SETTINGS_MODAL = requireFn('getOrCreateGlobalSettingsModal');
    const MODULE_OPEN_GLOBAL_SETTINGS_MODAL = requireFn('openGlobalSettingsModal');
    const MODULE_GET_OR_CREATE_FLOATBAR_ENTRY = requireFn('getOrCreateFloatbarEntry');
    const MODULE_STYLE_TAG_ID = typeof MODULES.STYLE_TAG_ID === 'string' ? MODULES.STYLE_TAG_ID : null;
    const MODULE_GET_CARD_EXTRA_HEIGHT = requireFn('getInventoryCardExtraHeight');
    const MODULE_BUILD_INJECTED_STYLES = requireFn('buildInjectedStyles');

    const SELECTORS = MODULE_SELECTORS || {
        contTab: '.market-header.black .cont-tab',
        tabList: '.market-header.black .cont-tab > ul',
        briefInfo: '.market-header.black .brief-info',
        marketHeader: '.market-header.black',
        criteria: '.criteria.steam_inventory_index_filter',
        inventoryList: '#j_list_card',
        inventoryItems: '#j_list_card li.my_inventory',
    };

    const STORAGE_KEY_DEFAULT_PAGE_SIZE = MODULE_STORAGE_KEYS?.defaultPageSize || 'tm_buff_default_page_size';
    const STORAGE_KEY_FULL_MODE = MODULE_STORAGE_KEYS?.fullMode || 'tm_buff_full_mode';
    const STORAGE_KEY_FULL_PAGE_SIZE = MODULE_STORAGE_KEYS?.fullPageSize || 'tm_buff_full_page_size';
    const STORAGE_KEY_ONLY_SALEABLE = MODULE_STORAGE_KEYS?.onlySaleable || 'tm_buff_only_saleable';
    const STORAGE_KEY_PL_FILTER = MODULE_STORAGE_KEYS?.plFilter || 'tm_buff_pl_filter';
    const STORAGE_KEY_SHOW_REFS = MODULE_STORAGE_KEYS?.showRefs || 'tm_buff_show_refs';

    const SETTINGS_KEY = MODULE_STORAGE_KEYS?.settings || 'tm_buff_settings_v1';

    const FALLBACK_DEFAULT_PAGE_SIZE =
        Number.isFinite(MODULE_FALLBACK_DEFAULT_PAGE_SIZE) && MODULE_FALLBACK_DEFAULT_PAGE_SIZE > 0
            ? MODULE_FALLBACK_DEFAULT_PAGE_SIZE
            : 50;

    const STORAGE_KEY_CNY_EUR_RATE = MODULE_STORAGE_KEYS?.cnyEurRate || 'tm_buff_cny_eur_rate';
    const STORAGE_KEY_CNY_EUR_RATE_DATE = MODULE_STORAGE_KEYS?.cnyEurRateDate || 'tm_buff_cny_eur_rate_date';

    let LAST_RATE_KEY = '';
    let FX_STATUS_TEXT = 'FX: not loaded';

    function loadSettingsFallback() {
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

    function loadSettings() {
        const loaded = MODULE_LOAD_SETTINGS ? MODULE_LOAD_SETTINGS() : null;
        return loaded && typeof loaded === 'object' ? loaded : loadSettingsFallback();
    }

    let SETTINGS = loadSettings();

    function saveSettings() {
        if (MODULE_SAVE_SETTINGS) return MODULE_SAVE_SETTINGS(SETTINGS);
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(SETTINGS));
        } catch (err) {
            // ignore
        }
    }

    function injectStyles() {
        const styleTagId = MODULE_STYLE_TAG_ID || 'tm-buff-styles';
        if (document.getElementById(styleTagId)) return;

        const sampleCard = document.querySelector(SELECTORS.inventoryItems);
        const baseHeight = sampleCard ? Math.ceil(sampleCard.getBoundingClientRect().height) : 260;
        const extraHeight =
            MODULE_GET_CARD_EXTRA_HEIGHT && Number.isFinite(MODULE_GET_CARD_EXTRA_HEIGHT())
                ? MODULE_GET_CARD_EXTRA_HEIGHT()
                : 62;
        const finalHeight = baseHeight + extraHeight;

        const moduleStyleText = MODULE_BUILD_INJECTED_STYLES?.(finalHeight) || null;
        if (!(typeof moduleStyleText === 'string' && moduleStyleText.trim())) {
            return;
        }
        const style = document.createElement('style');
        style.id = styleTagId;
        style.textContent = moduleStyleText;
        document.head.appendChild(style);
    }

    function parseHashParams() {
        if (MODULE_PARSE_HASH_PARAMS) return MODULE_PARSE_HASH_PARAMS();
        const rawHash = window.location.hash.startsWith('#')
            ? window.location.hash.slice(1)
            : window.location.hash;
        return new URLSearchParams(rawHash);
    }

    function buildHash(params) {
        if (MODULE_BUILD_HASH) return MODULE_BUILD_HASH(params);
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
        return MODULE_GET_ASSET_ID_FROM_ITEM
            ? MODULE_GET_ASSET_ID_FROM_ITEM(item)
            : (item?.getAttribute('data-assetid') || item?.id || '');
    }

    function isAssetExcluded(assetId) {
        return MODULE_IS_ASSET_EXCLUDED
            ? !!MODULE_IS_ASSET_EXCLUDED(SETTINGS, assetId)
            : (!!assetId && !!(SETTINGS.excludedAssetIds && SETTINGS.excludedAssetIds[assetId]));
    }

    function setAssetExcluded(assetId, excluded) {
        if (MODULE_SET_ASSET_EXCLUDED) return MODULE_SET_ASSET_EXCLUDED(SETTINGS, saveSettings, assetId, excluded);
        if (!assetId) return;
        if (!SETTINGS.excludedAssetIds || typeof SETTINGS.excludedAssetIds !== 'object') SETTINGS.excludedAssetIds = {};
        if (excluded) SETTINGS.excludedAssetIds[assetId] = 1;
        else delete SETTINGS.excludedAssetIds[assetId];
        saveSettings();
    }

    function getAssetTargetSellEur(assetId) {
        return MODULE_GET_ASSET_TARGET_SELL_EUR
            ? MODULE_GET_ASSET_TARGET_SELL_EUR(SETTINGS, assetId)
            : (() => {
                if (!assetId) return null;
                const value = SETTINGS.targetSellEurByAssetId?.[assetId];
                const parsed = parseFloat(value);
                return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
            })();
    }

    function setAssetTargetSellEur(assetId, value) {
        if (MODULE_SET_ASSET_TARGET_SELL_EUR) return MODULE_SET_ASSET_TARGET_SELL_EUR(SETTINGS, saveSettings, assetId, value);
        if (!assetId) return;
        if (!SETTINGS.targetSellEurByAssetId || typeof SETTINGS.targetSellEurByAssetId !== 'object') SETTINGS.targetSellEurByAssetId = {};
        const parsed = parseFloat(value);
        if (!Number.isFinite(parsed) || parsed <= 0) delete SETTINGS.targetSellEurByAssetId[assetId];
        else SETTINGS.targetSellEurByAssetId[assetId] = parsed.toFixed(2);
        saveSettings();
    }

    function getAssetCustomPaidEur(assetId) {
        return MODULE_GET_ASSET_CUSTOM_PAID_EUR
            ? MODULE_GET_ASSET_CUSTOM_PAID_EUR(SETTINGS, assetId)
            : (() => {
                if (!assetId) return null;
                const value = SETTINGS.customPaidEurByAssetId?.[assetId];
                const parsed = parseFloat(value);
                return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
            })();
    }

    function getAssetLegacyCustomPaidCny(assetId) {
        return MODULE_GET_ASSET_LEGACY_CUSTOM_PAID_CNY
            ? MODULE_GET_ASSET_LEGACY_CUSTOM_PAID_CNY(SETTINGS, assetId)
            : (() => {
                if (!assetId) return null;
                const value = SETTINGS.customPaidCnyByAssetId?.[assetId];
                const parsed = parseFloat(value);
                return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
            })();
    }

    function setAssetCustomPaidEur(assetId, value) {
        if (MODULE_SET_ASSET_CUSTOM_PAID_EUR) return MODULE_SET_ASSET_CUSTOM_PAID_EUR(SETTINGS, saveSettings, assetId, value);
        if (!assetId) return;
        if (!SETTINGS.customPaidEurByAssetId || typeof SETTINGS.customPaidEurByAssetId !== 'object') SETTINGS.customPaidEurByAssetId = {};
        const parsed = parseFloat(value);
        if (!Number.isFinite(parsed) || parsed <= 0) delete SETTINGS.customPaidEurByAssetId[assetId];
        else SETTINGS.customPaidEurByAssetId[assetId] = parsed.toFixed(2);
        saveSettings();
    }

    function createStandardModalBackdrop({
        backdropId,
        modalId,
        title,
        closeId,
        bodyHtml,
    }) {
        if (MODULE_CREATE_STANDARD_MODAL_BACKDROP) {
            return MODULE_CREATE_STANDARD_MODAL_BACKDROP({ backdropId, modalId, title, closeId, bodyHtml });
        }
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
        if (MODULE_CLOSE_ITEM_SETTINGS_MODAL) return MODULE_CLOSE_ITEM_SETTINGS_MODAL();
        const backdrop = document.getElementById('tm-buff-item-modal-backdrop');
        if (!backdrop) return;
        backdrop.style.display = 'none';
        backdrop.dataset.assetId = '';
    }

    function getOrCreateItemSettingsModal() {
        return MODULE_GET_OR_CREATE_ITEM_SETTINGS_MODAL
            ? MODULE_GET_OR_CREATE_ITEM_SETTINGS_MODAL({
            onClose: closeItemSettingsModal,
            onSave: (backdrop) => {
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
            },
            createBackdrop: createStandardModalBackdrop,
        })
            : null;
    }

    function openItemSettingsModal(item, marketPriceEur) {
        if (!MODULE_OPEN_ITEM_SETTINGS_MODAL) return;
        MODULE_OPEN_ITEM_SETTINGS_MODAL({
            item,
            marketPriceEur,
            getOrCreateModal: getOrCreateItemSettingsModal,
            getAssetIdFromItem,
            getAssetTargetSellEur,
            getAssetCustomPaidEur,
            getAssetLegacyCustomPaidCny,
            isAssetExcluded,
            formatEur,
        });
    }

    function closeGlobalSettingsModal() {
        if (MODULE_CLOSE_GLOBAL_SETTINGS_MODAL) return MODULE_CLOSE_GLOBAL_SETTINGS_MODAL();
        const backdrop = document.getElementById('tm-buff-global-settings-backdrop');
        if (!backdrop) return;
        backdrop.style.display = 'none';
    }

    function getOrCreateGlobalSettingsModal() {
        return MODULE_GET_OR_CREATE_GLOBAL_SETTINGS_MODAL
            ? MODULE_GET_OR_CREATE_GLOBAL_SETTINGS_MODAL({
            createStandardModalBackdrop,
            closeGlobalSettingsModalHandler: closeGlobalSettingsModal,
            onSave: (backdrop) => {
                const onlySaleableInput = backdrop.querySelector('#tm-buff-global-only-saleable');
                const showRefsInput = backdrop.querySelector('#tm-buff-global-show-refs');
                setOnlySaleableEnabled(!!onlySaleableInput?.checked);
                setShowRefsEnabled(!!showRefsInput?.checked);
                closeGlobalSettingsModal();
                refreshUiAndPl();
            },
        })
            : null;
    }

    function openGlobalSettingsModal() {
        if (!MODULE_OPEN_GLOBAL_SETTINGS_MODAL) return;
        MODULE_OPEN_GLOBAL_SETTINGS_MODAL({
            getOrCreateGlobalSettingsModal,
            isOnlySaleableEnabled,
            isShowRefsEnabled,
            fxStatusText: FX_STATUS_TEXT,
        });
    }

    function getOrCreateFloatbarEntry() {
        if (!MODULE_GET_OR_CREATE_FLOATBAR_ENTRY) return;
        MODULE_GET_OR_CREATE_FLOATBAR_ENTRY({
            onOpenGlobalSettingsModal: openGlobalSettingsModal,
        });
    }

    function isFullInventoryMode() {
        const quantity = getQuantityFromBriefInfo();
        const currentPageSize = getCurrentPageSize();

        if (!quantity) return false;
        return currentPageSize >= quantity;
    }

    function updateHashAndReload(mutator) {
        if (MODULE_UPDATE_HASH_AND_RELOAD) return MODULE_UPDATE_HASH_AND_RELOAD(mutator);
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
        return MODULE_GET_CACHED_CNY_EUR_RATE
            ? MODULE_GET_CACHED_CNY_EUR_RATE()
            : (() => {
                const rawRate = localStorage.getItem(STORAGE_KEY_CNY_EUR_RATE);
                if (!rawRate) return null;
                const rate = parseFloat(rawRate);
                return Number.isFinite(rate) && rate > 0 ? rate : null;
            })();
    }

    function getCachedCnyEurRateDate() {
        return MODULE_GET_CACHED_CNY_EUR_RATE_DATE
            ? MODULE_GET_CACHED_CNY_EUR_RATE_DATE()
            : (localStorage.getItem(STORAGE_KEY_CNY_EUR_RATE_DATE) || '');
    }

    function getTodayIsoDate() {
        return MODULE_GET_TODAY_ISO_DATE
            ? MODULE_GET_TODAY_ISO_DATE()
            : new Date().toISOString().slice(0, 10);
    }

    function setCachedCnyEurRate(rate, date = '') {
        if (MODULE_SET_CACHED_CNY_EUR_RATE) return MODULE_SET_CACHED_CNY_EUR_RATE(rate, date);
        if (!Number.isFinite(rate) || rate <= 0) return;
        localStorage.setItem(STORAGE_KEY_CNY_EUR_RATE, String(rate));
        if (date) localStorage.setItem(STORAGE_KEY_CNY_EUR_RATE_DATE, date);
    }

    async function ensureCnyEurRate() {
        if (MODULE_ENSURE_CNY_EUR_RATE) return MODULE_ENSURE_CNY_EUR_RATE();
        const cachedRate = getCachedCnyEurRate();
        const cachedDate = getCachedCnyEurRateDate();
        const today = getTodayIsoDate();
        if (cachedRate && cachedDate === today) return cachedRate;
        try {
            const response = await fetch('https://api.frankfurter.dev/v1/latest?base=CNY&symbols=EUR');
            if (!response.ok) throw new Error(`Failed to fetch exchange rate: HTTP ${response.status}`);
            const data = await response.json();
            const rate = data?.rates?.EUR;
            if (!Number.isFinite(rate) || rate <= 0) throw new Error('Invalid CNY→EUR exchange rate received');
            setCachedCnyEurRate(rate, data?.date || '');
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
                        : (isMergedItem ? `<span class="tm-buff-merged-note">Merged stack (settings unavailable)</span>` : '&nbsp;'));
                refsLine.removeAttribute('title');
                actionsLine.removeAttribute('title');
            }
            let settingsBtn = item.querySelector('.tm-buff-item-settings-btn');
            if (!isMergedItem && assetId) {
                if (!settingsBtn) {
                    settingsBtn = document.createElement('button');
                    settingsBtn.type = 'button';
                    settingsBtn.className = 'tm-buff-item-settings-btn';
                    settingsBtn.title = 'Open item settings';
                    settingsBtn.innerHTML = `
                        <i class="tm-buff-item-settings-icon" aria-hidden="true">⚙</i>
                    `;
                    item.appendChild(settingsBtn);
                }
                if (settingsBtn.dataset.tmBuffBound !== '1') {
                    settingsBtn.dataset.tmBuffBound = '1';
                    settingsBtn.addEventListener('click', (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        const currentMarketPriceEur = getMarketPriceEurFromItem(item);
                        openItemSettingsModal(item, currentMarketPriceEur);
                    });
                }
            } else if (settingsBtn) {
                settingsBtn.remove();
            }
            let stateChip = item.querySelector('.tm-buff-card-state-chip');
            if (!isMergedItem && assetId) {
                if (!stateChip) {
                    stateChip = document.createElement('span');
                    stateChip.className = 'tm-buff-card-state-chip';
                    item.appendChild(stateChip);
                }
                stateChip.textContent = excluded ? 'Excluded' : 'Included';
                stateChip.classList.toggle('is-excluded', excluded);
                stateChip.title = excluded ? 'Excluded from totals' : 'Included in totals';
            } else if (stateChip) {
                stateChip.remove();
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
        if (!MODULE_COMPUTE_PL_VISIBILITY_AND_TOTALS) return;
        const filter = getPlFilter();
        const onlySaleable = isOnlySaleableEnabled();
        const result = MODULE_COMPUTE_PL_VISIBILITY_AND_TOTALS({
            inventoryItemsSelector: SELECTORS.inventoryItems,
            filter,
        });

        if (!result || typeof result !== 'object') return;

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
            formatEur,
        });
    }

    function updateFxInfo(opts) {
        if (MODULE_BUILD_FX_STATUS_TEXT) {
            FX_STATUS_TEXT = MODULE_BUILD_FX_STATUS_TEXT(opts);
        }
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

        toolbar.appendChild(title);
        toolbar.appendChild(plFilterWrap);
        toolbar.appendChild(summary);

        criteria.insertAdjacentElement('beforebegin', toolbar);
        return toolbar;
    }

    function syncToolbarState() {
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
        if (!MODULE_SETUP_INVENTORY_OBSERVER) return;
        MODULE_SETUP_INVENTORY_OBSERVER({
            inventoryListSelector: SELECTORS.inventoryList,
            onRefresh: refreshUiAndPl,
            debounceMs: 100,
            observerFlag: 'tmBuffObserverAttached',
            errorPrefix: '[buff163-tools] Mutation observer refresh failed:',
        });
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