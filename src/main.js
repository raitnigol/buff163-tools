import { SELECTORS } from './config/selectors.js';
import { STORAGE_KEYS, FALLBACK_DEFAULT_PAGE_SIZE } from './config/storage.js';
import { loadSettings, saveSettings } from './core/settings.js';
import { parseHashParams, buildHash, updateHashAndReload } from './core/hash.js';
import { STYLE_MIGRATION_READY } from './styles/index.js';

globalThis.__BUFF163_MODULES__ = {
    SELECTORS,
    STORAGE_KEYS,
    FALLBACK_DEFAULT_PAGE_SIZE,
    loadSettings,
    saveSettings,
    parseHashParams,
    buildHash,
    updateHashAndReload,
};

import '../buff163-tools.user.js';

// Phase 2 bridge: keep runtime behavior in legacy script while modules are introduced.
void SELECTORS;
void STORAGE_KEYS;
void FALLBACK_DEFAULT_PAGE_SIZE;
void loadSettings;
void saveSettings;
void parseHashParams;
void buildHash;
void updateHashAndReload;
void STYLE_MIGRATION_READY;
