/**
 * Lê o cookie XSRF-TOKEN definido pelo Laravel e retorna seu valor decodificado.
 * Necessário para enviar como header `X-XSRF-TOKEN` em requisições POST/DELETE/PATCH
 * que passam pelo middleware web (CSRF protection).
 */
export function getCsrfToken(): string {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}
