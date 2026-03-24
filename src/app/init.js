import { SELECTORS } from '../config/selectors.js';
import { STORAGE_KEYS, FALLBACK_DEFAULT_PAGE_SIZE } from '../config/storage.js';
import { loadSettings, saveSettings } from '../core/settings.js';
import { parseHashParams, buildHash, updateHashAndReload } from '../core/hash.js';
import {
    getCachedCnyEurRate,
    getCachedCnyEurRateDate,
    getTodayIsoDate,
    setCachedCnyEurRate,
    ensureCnyEurRate,
    buildFxStatusText,
} from '../core/fx.js';
import { setupInventoryObserver as setupInventoryObserverModule } from '../core/inventoryObserver.js';
import { computePlVisibilityAndTotals, buildPlSummaryHtml } from '../core/pl.js';
import {
    getAssetIdFromItem as getAssetIdFromItemModule,
    isAssetExcluded as isAssetExcludedModule,
    setAssetExcluded as setAssetExcludedModule,
    getAssetTargetSellEur as getAssetTargetSellEurModule,
    setAssetTargetSellEur as setAssetTargetSellEurModule,
    getAssetCustomPaidEur as getAssetCustomPaidEurModule,
    getAssetLegacyCustomPaidCny as getAssetLegacyCustomPaidCnyModule,
    setAssetCustomPaidEur as setAssetCustomPaidEurModule,
} from '../core/itemSettingsState.js';
import {
    createStandardModalBackdrop as createStandardModalBackdropModule,
    closeItemSettingsModal as closeItemSettingsModalModule,
    getOrCreateItemSettingsModal as getOrCreateItemSettingsModalModule,
    openItemSettingsModal as openItemSettingsModalModule,
} from '../core/itemSettingsModal.js';
import {
    closeGlobalSettingsModal as closeGlobalSettingsModalModule,
    getOrCreateGlobalSettingsModal as getOrCreateGlobalSettingsModalModule,
    openGlobalSettingsModal as openGlobalSettingsModalModule,
    getOrCreateFloatbarEntry as getOrCreateFloatbarEntryModule,
} from '../core/globalUi.js';
import { STYLE_TAG_ID, getInventoryCardExtraHeight, buildInjectedStyles } from '../styles/index.js';

export async function initApp() {
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
        setupInventoryObserver: setupInventoryObserverModule,
        computePlVisibilityAndTotals,
        buildPlSummaryHtml,
        getAssetIdFromItem: getAssetIdFromItemModule,
        isAssetExcluded: isAssetExcludedModule,
        setAssetExcluded: setAssetExcludedModule,
        getAssetTargetSellEur: getAssetTargetSellEurModule,
        setAssetTargetSellEur: setAssetTargetSellEurModule,
        getAssetCustomPaidEur: getAssetCustomPaidEurModule,
        getAssetLegacyCustomPaidCny: getAssetLegacyCustomPaidCnyModule,
        setAssetCustomPaidEur: setAssetCustomPaidEurModule,
        createStandardModalBackdrop: createStandardModalBackdropModule,
        closeItemSettingsModal: closeItemSettingsModalModule,
        getOrCreateItemSettingsModal: getOrCreateItemSettingsModalModule,
        openItemSettingsModal: openItemSettingsModalModule,
        closeGlobalSettingsModal: closeGlobalSettingsModalModule,
        getOrCreateGlobalSettingsModal: getOrCreateGlobalSettingsModalModule,
        openGlobalSettingsModal: openGlobalSettingsModalModule,
        getOrCreateFloatbarEntry: getOrCreateFloatbarEntryModule,
        STYLE_TAG_ID,
        getInventoryCardExtraHeight,
        buildInjectedStyles,
    };

    // Important: load legacy runtime only after bridge is initialized.
    await import('./runtime.js');
}

// Keep imports as part of bundle during migration.
void SELECTORS;
void STORAGE_KEYS;
void FALLBACK_DEFAULT_PAGE_SIZE;
void loadSettings;
void saveSettings;
void parseHashParams;
void buildHash;
void updateHashAndReload;
void getCachedCnyEurRate;
void getCachedCnyEurRateDate;
void getTodayIsoDate;
void setCachedCnyEurRate;
void ensureCnyEurRate;
void buildFxStatusText;
void setupInventoryObserverModule;
void computePlVisibilityAndTotals;
void buildPlSummaryHtml;
void getAssetIdFromItemModule;
void isAssetExcludedModule;
void setAssetExcludedModule;
void getAssetTargetSellEurModule;
void setAssetTargetSellEurModule;
void getAssetCustomPaidEurModule;
void getAssetLegacyCustomPaidCnyModule;
void setAssetCustomPaidEurModule;
void createStandardModalBackdropModule;
void closeItemSettingsModalModule;
void getOrCreateItemSettingsModalModule;
void openItemSettingsModalModule;
void closeGlobalSettingsModalModule;
void getOrCreateGlobalSettingsModalModule;
void openGlobalSettingsModalModule;
void getOrCreateFloatbarEntryModule;
void STYLE_TAG_ID;
void getInventoryCardExtraHeight;
void buildInjectedStyles;
