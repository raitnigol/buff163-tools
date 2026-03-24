export function setupInventoryObserver(options) {
    const {
        inventoryListSelector,
        onRefresh,
        debounceMs = 100,
        observerFlag = 'tmBuffObserverAttached',
        errorPrefix = '[buff163-tools] Mutation observer refresh failed:',
    } = options || {};

    if (!inventoryListSelector || typeof onRefresh !== 'function') {
        return false;
    }

    const inventoryList = document.querySelector(inventoryListSelector);
    if (!inventoryList) {
        return false;
    }

    if (inventoryList.dataset[observerFlag] === '1') {
        return true;
    }

    let refreshScheduled = false;

    const observer = new MutationObserver((mutations) => {
        let shouldRefresh = false;

        for (const mutation of mutations) {
            if (mutation.type === 'childList' &&
                (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)) {
                shouldRefresh = true;
                break;
            }
        }

        if (!shouldRefresh || refreshScheduled) {
            return;
        }

        refreshScheduled = true;

        setTimeout(() => {
            refreshScheduled = false;
            try {
                onRefresh();
            } catch (err) {
                console.error(errorPrefix, err);
            }
        }, debounceMs);
    });

    observer.observe(inventoryList, {
        childList: true,
    });

    inventoryList.dataset[observerFlag] = '1';
    return true;
}
