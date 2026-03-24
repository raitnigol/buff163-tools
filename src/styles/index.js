export const STYLE_TAG_ID = 'tm-buff-styles';

export function getInventoryCardExtraHeight() {
    // Paid + P/L + refs + actions
    return 62;
}

export function buildInjectedStyles(finalHeight) {
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
