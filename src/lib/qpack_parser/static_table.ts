import { qpackFieldLineType } from "./qpack_consts";

export class TableEntry {
    name:  string
	value: string

    public constructor(name: string, value= "") {
        this.name = name;
        this.value = value;
    }

    /**
     * isPseudo
     *
     * check if a header field is a pseudo header
     */
    public isPseudo(): boolean {
        return this.name.length > 0 && this.name[0] == ':';
    }

    /**
     * display: Display the content of the entry
     */
    public display(fieldType: qpackFieldLineType): string {
        return JSON.stringify({
            encoded_type: fieldType,
            name: this.name,
            value: this.value,
        }, null, 4);
    }
}

export const static_table: TableEntry[] = [
    new TableEntry(":authority"),
    new TableEntry(":path", "/"),
    new TableEntry("age", "0"),
    new TableEntry("content-disposition"),
    new TableEntry("content-length", "0"),
    new TableEntry("cookie"),
    new TableEntry("date"),
    new TableEntry("etag"),
    new TableEntry("if-modified-since"),
    new TableEntry("if-none-match"),
    new TableEntry("last-modified"),
    new TableEntry("link"),
    new TableEntry("location"),
    new TableEntry("referer"),
    new TableEntry("set-cookie"),
    new TableEntry(":method", "CONNECT"),
    new TableEntry(":method", "DELETE"),
    new TableEntry(":method", "GET"),
    new TableEntry(":method", "HEAD"),
    new TableEntry(":method", "OPTIONS"),
    new TableEntry(":method", "POST"),
    new TableEntry(":method", "PUT"),
    new TableEntry(":scheme", "http"),
    new TableEntry(":scheme", "https"),
    new TableEntry(":status", "103"),
    new TableEntry(":status", "200"),
    new TableEntry(":status", "304"),
    new TableEntry(":status", "404"),
    new TableEntry(":status", "503"),
    new TableEntry("accept", "*/*"),
    new TableEntry("accept", "application/dns-message"),
    new TableEntry("accept-encoding", "gzip, deflate, br"),
    new TableEntry("accept-ranges", "bytes"),
    new TableEntry("access-control-allow-headers", "cache-control"),
    new TableEntry("access-control-allow-headers", "content-type"),
    new TableEntry("access-control-allow-origin", "*"),
    new TableEntry("cache-control", "max-age=0"),
    new TableEntry("cache-control", "max-age=2592000"),
    new TableEntry("cache-control", "max-age=604800"),
    new TableEntry("cache-control", "no-cache"),
    new TableEntry("cache-control", "no-store"),
    new TableEntry("cache-control", "public, max-age=31536000"),
    new TableEntry("content-encoding", "br"),
    new TableEntry("content-encoding", "gzip"),
    new TableEntry("content-type", "application/dns-message"),
    new TableEntry("content-type", "application/javascript"),
    new TableEntry("content-type", "application/json"),
    new TableEntry("content-type", "application/x-www-form-urlencoded"),
    new TableEntry("content-type", "image/gif"),
    new TableEntry("content-type", "image/jpeg"),
    new TableEntry("content-type", "image/png"),
    new TableEntry("content-type", "text/css"),
    new TableEntry("content-type", "text/html; charset=utf-8"),
    new TableEntry("content-type", "text/plain"),
    new TableEntry("content-type", "text/plain;charset=utf-8"),
    new TableEntry("range", "bytes=0-"),
    new TableEntry("strict-transport-security", "max-age=31536000"),
    new TableEntry("strict-transport-security", "max-age=31536000; includesubdomains"),
    new TableEntry("strict-transport-security", "max-age=31536000; includesubdomains; preload"),
    new TableEntry("vary", "accept-encoding"),
    new TableEntry("vary", "origin"),
    new TableEntry("x-content-type-options", "nosniff"),
    new TableEntry("x-xss-protection", "1; mode=block"),
    new TableEntry(":status", "100"),
    new TableEntry(":status", "204"),
    new TableEntry(":status", "206"),
    new TableEntry(":status", "302"),
    new TableEntry(":status", "400"),
    new TableEntry(":status", "403"),
    new TableEntry(":status", "421"),
    new TableEntry(":status", "425"),
    new TableEntry(":status", "500"),
    new TableEntry("accept-language"),
    new TableEntry("access-control-allow-credentials", "FALSE"),
    new TableEntry("access-control-allow-credentials", "TRUE"),
    new TableEntry("access-control-allow-headers", "*"),
    new TableEntry("access-control-allow-methods", "get"),
    new TableEntry("access-control-allow-methods", "get, post, options"),
    new TableEntry("access-control-allow-methods", "options"),
    new TableEntry("access-control-expose-headers", "content-length"),
    new TableEntry("access-control-request-headers", "content-type"),
    new TableEntry("access-control-request-method", "get"),
    new TableEntry("access-control-request-method", "post"),
    new TableEntry("alt-svc", "clear"),
    new TableEntry("authorization"),
    new TableEntry("content-security-policy", "script-src 'none'; object-src 'none'; base-uri 'none'"),
    new TableEntry("early-data", "1"),
    new TableEntry("expect-ct"),
    new TableEntry("forwarded"),
    new TableEntry("if-range"),
    new TableEntry("origin"),
    new TableEntry("purpose", "prefetch"),
    new TableEntry("server"),
    new TableEntry("timing-allow-origin", "*"),
    new TableEntry("upgrade-insecure-requests", "1"),
    new TableEntry("user-agent"),
    new TableEntry("x-forwarded-for"),
    new TableEntry("x-frame-options", "deny"),
    new TableEntry("x-frame-options", "sameorigin"),
];
