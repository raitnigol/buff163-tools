import { STORAGE_KEYS } from '../config/storage.js';

export function loadSettings() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.settings);
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
                customPaidCnyByAssetId: parsed.customPaidCnyByAssetId && typeof parsed.customPaidCnyByAssetId === 'object'
                    ? parsed.customPaidCnyByAssetId
                    : {},
            };
        }
    } catch (err) {
        // Ignore and fallback to legacy keys.
    }

    const onlySaleableLegacy = localStorage.getItem(STORAGE_KEYS.onlySaleable);
    const fullModeLegacy = localStorage.getItem(STORAGE_KEYS.fullMode);
    const showRefsLegacy = localStorage.getItem(STORAGE_KEYS.showRefs);

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

export function saveSettings(settings) {
    try {
        localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
    } catch (err) {
        // Ignore quota/serialization errors for now.
    }
}
