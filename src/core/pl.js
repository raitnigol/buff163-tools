export function computePlVisibilityAndTotals(options) {
    const {
        inventoryItemsSelector,
        filter,
    } = options || {};

    if (!inventoryItemsSelector) {
        return {
            total: 0,
            count: 0,
            winnersTotal: 0,
            losersTotal: 0,
            winnersCount: 0,
            losersCount: 0,
            excludedCount: 0,
        };
    }

    const items = document.querySelectorAll(inventoryItemsSelector);

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

    return {
        total,
        count,
        winnersTotal,
        losersTotal,
        winnersCount,
        losersCount,
        excludedCount,
    };
}

export function buildPlSummaryHtml(options) {
    const {
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
    } = options || {};

    const formatter = typeof formatEur === 'function'
        ? formatEur
        : ((value) => `€ ${Number(value || 0).toFixed(2)}`);

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

    return (
        `Visible (${scopeLabel}, ${filterLabel}, ${count} items): ` +
        `Winners ${winnersCount}: <strong class="tm-buff-pl-winners">${winnersSign}${formatter(winnersTotal)}</strong> · ` +
        `Losers ${losersCount}: <strong class="tm-buff-pl-losers">${losersSign}${formatter(losersTotal)}</strong> · ` +
        `Net: <strong class="${netClass}">${netSign}${formatter(total)}</strong>` +
        (excludedCount > 0 ? ` · Excluded: ${excludedCount}` : '')
    );
}
