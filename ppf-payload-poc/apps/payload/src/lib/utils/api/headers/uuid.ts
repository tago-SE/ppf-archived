/**
 * Used so that the client can inform the server of the correlationId. If not set one will be provided.
 */
export const correlationIdHeader = "x-correlation-id" as const;
/**
 * Used to identify requests as they hit the middleware.
 */
export const requestIdHeader = "x-request-id" as const;

/**
 * Extracts the current `x-correlation-id` from the headers if it exists. If it does not exist one will be generated and added to the header. 
 * 
 * This is useful if the calling client wish to pass a uuid that can be uniquely identified to a sent request.
*/
export function addCorrelationIdHeader(headers: Headers, uuid?: string) {
    let value = headers.get(correlationIdHeader);
    if (!value) {
        value = uuid || crypto.randomUUID();
    }
    headers.set(correlationIdHeader, value);
    return { name: correlationIdHeader, value, field: { [correlationIdHeader]: value } }
}

export function getCorrelationIdHeader(headers: Headers) {
    const value = headers.get(correlationIdHeader);
    return { name: correlationIdHeader, value, field: { [correlationIdHeader]: value } }
}

export function addRequestIdHeader(headers: Headers, uuid?: string) {
    const value = uuid || crypto.randomUUID();
    headers.set(requestIdHeader, value);
    return { name: requestIdHeader, value, field: { [requestIdHeader]: value } }
}

export function getRequestIdHeader(headers: Headers) {
    const value = headers.get(requestIdHeader);
    return { name: requestIdHeader, value, field: { [requestIdHeader]: value } }
}