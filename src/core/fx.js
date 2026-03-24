import { STORAGE_KEYS } from '../config/storage.js';

export function getCachedCnyEurRate() {
    const rawRate = localStorage.getItem(STORAGE_KEYS.cnyEurRate);
    if (!rawRate) return null;

    const rate = parseFloat(rawRate);
    return Number.isFinite(rate) && rate > 0 ? rate : null;
}

export function getCachedCnyEurRateDate() {
    return localStorage.getItem(STORAGE_KEYS.cnyEurRateDate) || '';
}

export function getTodayIsoDate() {
    return new Date().toISOString().slice(0, 10);
}

export function setCachedCnyEurRate(rate, date = '') {
    if (!Number.isFinite(rate) || rate <= 0) return;
    localStorage.setItem(STORAGE_KEYS.cnyEurRate, String(rate));
    if (date) {
        localStorage.setItem(STORAGE_KEYS.cnyEurRateDate, date);
    }
}

export async function ensureCnyEurRate() {
    const cachedRate = getCachedCnyEurRate();
    const cachedDate = getCachedCnyEurRateDate();
    const today = getTodayIsoDate();

    if (cachedRate && cachedDate === today) {
        return cachedRate;
    }

    try {
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
    } catch (err) {
        if (cachedRate) {
            return cachedRate;
        }
        throw err;
    }
}

export function buildFxStatusText(opts) {
    const { rate, date, error } = opts || {};

    if (error) {
        return 'FX: unavailable';
    }

    const effectiveRate = typeof rate === 'number' && Number.isFinite(rate) && rate > 0
        ? rate
        : getCachedCnyEurRate();
    const effectiveDate = date || getCachedCnyEurRateDate();

    if (!effectiveRate) {
        return 'FX: not loaded';
    }

    return effectiveDate
        ? `FX: 1 CNY = € ${effectiveRate.toFixed(4)} (${effectiveDate})`
        : `FX: 1 CNY = € ${effectiveRate.toFixed(4)}`;
}
