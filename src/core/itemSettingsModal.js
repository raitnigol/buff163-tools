export function createStandardModalBackdrop({
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

export function closeItemSettingsModal() {
    const backdrop = document.getElementById('tm-buff-item-modal-backdrop');
    if (!backdrop) return;
    backdrop.style.display = 'none';
    backdrop.dataset.assetId = '';
}

export function getOrCreateItemSettingsModal(options) {
    const {
        onClose,
        onSave,
        createBackdrop = createStandardModalBackdrop,
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
        backdropId: 'tm-buff-item-modal-backdrop',
        modalId: 'tm-buff-item-modal',
        title: 'Item settings',
        closeId: 'tm-buff-modal-close',
        bodyHtml,
    });
    if (backdrop.dataset.tmBuffBound === '1') return backdrop;
    backdrop.dataset.tmBuffBound = '1';

    const closeHandler = () => {
        if (typeof onClose === 'function') {
            onClose();
            return;
        }
        closeItemSettingsModal();
    };

    backdrop.addEventListener('click', (event) => {
        if (event.target === backdrop) {
            closeHandler();
        }
    });
    backdrop.querySelector('#tm-buff-modal-close')?.addEventListener('click', closeHandler);
    backdrop.querySelector('#tm-buff-modal-cancel')?.addEventListener('click', closeHandler);

    backdrop.querySelector('#tm-buff-modal-save')?.addEventListener('click', () => {
        if (typeof onSave !== 'function') {
            return;
        }
        onSave(backdrop);
    });

    return backdrop;
}

export function openItemSettingsModal(options) {
    const {
        item,
        marketPriceEur,
        getOrCreateModal,
        getAssetIdFromItem,
        getAssetTargetSellEur,
        getAssetCustomPaidEur,
        getAssetLegacyCustomPaidCny,
        isAssetExcluded,
        formatEur,
    } = options || {};
    if (!item || typeof getOrCreateModal !== 'function' || typeof getAssetIdFromItem !== 'function') return;

    const assetId = getAssetIdFromItem(item);
    if (!assetId) return;

    const modal = getOrCreateModal();
    modal.dataset.assetId = assetId;

    const name = item.querySelector('h3 a')?.textContent?.trim() || 'Item settings';
    const target = typeof getAssetTargetSellEur === 'function' ? getAssetTargetSellEur(assetId) : null;
    const customPaidEur = typeof getAssetCustomPaidEur === 'function' ? getAssetCustomPaidEur(assetId) : null;
    const customPaidCnyLegacy = typeof getAssetLegacyCustomPaidCny === 'function' ? getAssetLegacyCustomPaidCny(assetId) : null;
    const excluded = typeof isAssetExcluded === 'function' ? isAssetExcluded(assetId) : false;
    const ready = Number.isFinite(marketPriceEur) && Number.isFinite(target) && marketPriceEur >= target;

    const titleEl = modal.querySelector('.tm-buff-modal-title');
    const paidEl = modal.querySelector('#tm-buff-modal-paid-eur');
    const targetEl = modal.querySelector('#tm-buff-modal-target');
    const excludedEl = modal.querySelector('#tm-buff-modal-excluded');
    const hintEl = modal.querySelector('#tm-buff-modal-hint');
    const formatter = typeof formatEur === 'function' ? formatEur : ((value) => `€ ${Number(value || 0).toFixed(2)}`);

    if (titleEl) titleEl.textContent = name;
    if (paidEl) paidEl.value = customPaidEur ? customPaidEur.toFixed(2) : '';
    if (targetEl) targetEl.value = target ? target.toFixed(2) : '';
    if (excludedEl) excludedEl.checked = excluded;
    if (hintEl) {
        const currentText = Number.isFinite(marketPriceEur) ? `Current: ${formatter(marketPriceEur)}` : 'Current: N/A';
        const statusText = target ? (ready ? 'Status: Ready' : 'Status: Waiting') : 'Status: No target set';
        const paidSource = customPaidEur
            ? `Paid source: Custom EUR (${formatter(customPaidEur)})`
            : customPaidCnyLegacy
                ? `Paid source: Legacy custom CNY (¥ ${customPaidCnyLegacy.toFixed(2)})`
                : 'Paid source: BUFF';
        hintEl.textContent = `${currentText} · ${statusText} · ${paidSource}`;
    }

    modal.style.display = 'flex';
}
