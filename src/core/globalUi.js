export function closeGlobalSettingsModal() {
    const backdrop = document.getElementById('tm-buff-global-settings-backdrop');
    if (!backdrop) return;
    backdrop.style.display = 'none';
}

export function getOrCreateGlobalSettingsModal(options) {
    const {
        createStandardModalBackdrop,
        closeGlobalSettingsModalHandler = closeGlobalSettingsModal,
        onSave,
    } = options || {};
    if (typeof createStandardModalBackdrop !== 'function') return null;

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
                        buff163-tools by Rait Nigol ·
                        <a href="https://github.com/raitnigol/buff163-tools/blob/main/buff163-tools.user.js" target="_blank" rel="noopener noreferrer">GitHub</a>
                    </div>
                    <div class="tm-buff-modal-actions">
                        <button type="button" class="tm-buff-modal-btn primary" id="tm-buff-global-settings-save">Save</button>
                    </div>
                </div>
            </div>
        `;
    const backdrop = createStandardModalBackdrop({
        backdropId: 'tm-buff-global-settings-backdrop',
        modalId: 'tm-buff-global-settings-modal',
        title: 'buff163-tools settings',
        closeId: 'tm-buff-global-settings-close',
        bodyHtml,
    });
    if (!backdrop) return null;
    if (backdrop.dataset.tmBuffBound === '1') return backdrop;
    backdrop.dataset.tmBuffBound = '1';

    backdrop.addEventListener('click', (event) => {
        if (event.target === backdrop) closeGlobalSettingsModalHandler();
    });
    backdrop.querySelector('#tm-buff-global-settings-close')?.addEventListener('click', closeGlobalSettingsModalHandler);

    backdrop.querySelector('#tm-buff-global-settings-save')?.addEventListener('click', () => {
        if (typeof onSave === 'function') {
            onSave(backdrop);
        }
    });

    return backdrop;
}

export function openGlobalSettingsModal(options) {
    const {
        getOrCreateGlobalSettingsModal,
        isOnlySaleableEnabled,
        isShowRefsEnabled,
        fxStatusText,
    } = options || {};
    if (typeof getOrCreateGlobalSettingsModal !== 'function') return;

    const modal = getOrCreateGlobalSettingsModal();
    if (!modal) return;
    const onlySaleableInput = modal.querySelector('#tm-buff-global-only-saleable');
    const showRefsInput = modal.querySelector('#tm-buff-global-show-refs');
    const fxStatusEl = modal.querySelector('#tm-buff-global-fx-status');
    if (onlySaleableInput) onlySaleableInput.checked = !!(typeof isOnlySaleableEnabled === 'function' && isOnlySaleableEnabled());
    if (showRefsInput) showRefsInput.checked = !!(typeof isShowRefsEnabled === 'function' && isShowRefsEnabled());
    if (fxStatusEl) fxStatusEl.textContent = fxStatusText || '';
    modal.style.display = 'flex';
}

export function getOrCreateFloatbarEntry(options) {
    const { onOpenGlobalSettingsModal } = options || {};
    const floatbarList = document.querySelector('.floatbar > ul');
    if (!floatbarList) return;

    const existing = document.getElementById('tm-buff-float-settings');
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
        if (typeof onOpenGlobalSettingsModal === 'function') {
            onOpenGlobalSettingsModal();
        }
    });

    floatbarList.insertBefore(li, floatbarList.firstChild);
}
