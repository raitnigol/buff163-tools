export function parseHashParams() {
    const rawHash = window.location.hash.startsWith('#')
        ? window.location.hash.slice(1)
        : window.location.hash;

    return new URLSearchParams(rawHash);
}

export function buildHash(params) {
    const str = params.toString();
    return str ? `#${str}` : '';
}

export function updateHashAndReload(mutator) {
    const params = parseHashParams();
    mutator(params);

    const newHash = buildHash(params);
    if (window.location.hash !== newHash) {
        window.location.hash = newHash;
    }

    setTimeout(() => {
        window.location.reload();
    }, 80);
}
