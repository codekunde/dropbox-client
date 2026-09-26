import URL from "url-parse";
import { Layerr } from "layerr";
import { Headers } from "./types.js";

export interface RequestConfig {
    body?: string | Buffer;
    headers?: Headers;
    method: "DELETE" | "GET" | "HEAD" | "PATCH" | "POST";
    query?: Record<string, string>;
    url: string;
}

export function handleBadResponse(response: Response): void {
    if (!response.ok) {
        throw new Layerr({
            info: {
                status: response.status,
                statusText: response.statusText,
                url: response.url
            }
        }, `Request failed: ${response.status} ${response.statusText}`);
    }
}

export async function request(config: RequestConfig): Promise<Response> {
    const url = new URL(config.url);
    if (config.query) {
        const newQuery = Object.assign(
            url.query || {},
            config.query
        );
        url.set("query", newQuery);
    }
    const response = await fetch(url.toString(), {
        method: config.method,
        headers: config.headers,
        // Buffers work as fetch bodies, but the types only accept ArrayBuffer-backed views
        body: config.body as BodyInit
    });
    return response;
}
