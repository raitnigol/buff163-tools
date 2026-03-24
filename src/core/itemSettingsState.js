export function getAssetIdFromItem(item) {
    return item?.getAttribute('data-assetid') || item?.id || '';
}

export function isAssetExcluded(settings, assetId) {
    if (!assetId) return false;
    return !!(settings?.excludedAssetIds && settings.excludedAssetIds[assetId]);
}

export function setAssetExcluded(settings, saveSettings, assetId, excluded) {
    if (!assetId || !settings) return;
    if (!settings.excludedAssetIds || typeof settings.excludedAssetIds !== 'object') {
        settings.excludedAssetIds = {};
    }
    if (excluded) {
        settings.excludedAssetIds[assetId] = 1;
    } else {
        delete settings.excludedAssetIds[assetId];
    }
    if (typeof saveSettings === 'function') {
        saveSettings();
    }
}

export function getAssetTargetSellEur(settings, assetId) {
    if (!assetId) return null;
    const value = settings?.targetSellEurByAssetId?.[assetId];
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function setAssetTargetSellEur(settings, saveSettings, assetId, value) {
    if (!assetId || !settings) return;
    if (!settings.targetSellEurByAssetId || typeof settings.targetSellEurByAssetId !== 'object') {
        settings.targetSellEurByAssetId = {};
    }

    const parsed = parseFloat(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        delete settings.targetSellEurByAssetId[assetId];
    } else {
        settings.targetSellEurByAssetId[assetId] = parsed.toFixed(2);
    }
    if (typeof saveSettings === 'function') {
        saveSettings();
    }
}

export function getAssetCustomPaidEur(settings, assetId) {
    if (!assetId) return null;
    const value = settings?.customPaidEurByAssetId?.[assetId];
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function getAssetLegacyCustomPaidCny(settings, assetId) {
    if (!assetId) return null;
    const value = settings?.customPaidCnyByAssetId?.[assetId];
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function setAssetCustomPaidEur(settings, saveSettings, assetId, value) {
    if (!assetId || !settings) return;
    if (!settings.customPaidEurByAssetId || typeof settings.customPaidEurByAssetId !== 'object') {
        settings.customPaidEurByAssetId = {};
    }

    const parsed = parseFloat(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        delete settings.customPaidEurByAssetId[assetId];
    } else {
        settings.customPaidEurByAssetId[assetId] = parsed.toFixed(2);
    }
    if (typeof saveSettings === 'function') {
        saveSettings();
    }
}
