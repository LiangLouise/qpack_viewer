import { res_status } from "./status";

export type decode_res = {
    val: number,
    len: number,
    status: res_status,
};

// HPACK, QPACK Variable Prefixed Integer Decoding, defined in RFC 7541
export function varint_decode(buffer: Uint8Array, offset: number, prefix_len: number): decode_res {
    const init_mask = 0xff >> (8 - prefix_len);
    const init_max = 2 ** prefix_len - 1;
    const res: decode_res = {val: 0, len: 0, status: res_status.ERROR};

    // initial bytes
    if ((buffer[offset] & init_mask) < init_max) {
        return {val: (buffer[offset] & init_mask), len: 1, status: res_status.OK};
    }

    res.val += init_max;
    res.len += 1;

    // following bytes
    let bits = 0;
    for (let index = offset + 1; index < buffer.length; index++) {
        const element = buffer[index];
        res.val += (element & 127) * (2 ** bits);
        res.len += 1;
        bits += 7;
        if ((element & 128) !== 128) {
            res.status = res_status.OK;
            return res;
        }
    }

    res.status = res_status.NEED_MORE_DATA;
    return res;
}

// QUIC Variable Prefixed Integer Decoding, defined in RFC 9000 Appendix A.1
export function quic_varint_decode(buffer: Uint8Array, offset: number): decode_res {
    const prefix = buffer[offset] >> 6;
    const varint_length = 1 << prefix;
    const res: decode_res = {val: buffer[offset], len: 1, status: res_status.ERROR};

    if (buffer.length - offset < varint_length) {
        res.status = res_status.NEED_MORE_DATA;
        return res;
    }

    res.val &= 0x3f;
    res.len = varint_length;
    for (let index = offset; index < varint_length; index++) {
        const element = buffer[index];
        res.val = (res.val << 8) + element;
    }

    res.status = res_status.OK;
    return res;
}
