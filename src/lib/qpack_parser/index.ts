import { varint_decode, quic_varint_decode } from "./prefix_int_decoder";
import { res_status } from "./status";
import { qpackFieldLineType, fieldLine, parsingHeadersFrameState, parsingFieldLineState, HTTP3FrameType, frameSegment, frameSegmentMap } from "./qpack_consts";
import { indexedLine, literalLine, nameIndexedLine } from "./encoced_line";

export class frameHeader implements frameSegment {
    frame_type: HTTP3FrameType;
    frame_header_len: number;
    frame_payload_len: number;

    constructor() {
      this.frame_type = HTTP3FrameType.UNKNOWN_FRAME;
      this.frame_header_len = 0;
      this.frame_payload_len = 0;
    }

    display(): frameSegmentMap {
        return new Map<string, string | number | boolean>([
            ["Frame Type",        HTTP3FrameType[this.frame_type]],
            ["Frame Payload Len", this.frame_payload_len],
        ]);
    }
  }

export class encodedFieldPrefix implements frameSegment {
    encoded_req_ins_count: number;
    req_ins_count: number;
    sign_set: boolean;
    delta_base: number;

    constructor() {
        this.encoded_req_ins_count = 0;
        this.req_ins_count = 0;
        this.sign_set = false;
        this.delta_base = 0;
    }

    display(): frameSegmentMap {
        return new Map<string, string | number | boolean>([
            ["Required Insert Count", this.encoded_req_ins_count],
            ["Sign bit Set",          this.sign_set],
            ["Delta Base",            this.delta_base],
        ]);
    }
}

export class parserContext {
    header_frame_info: frameHeader;
    prefix: encodedFieldPrefix;
    headers: fieldLine[];

    buffer: Uint8Array;
    index: number;
    parse_frame_state: parsingHeadersFrameState;
    parse_field_state: parsingFieldLineState;

    constructor(init_input: Uint8Array | null) {
        if (init_input != null) {
            this.buffer = new Uint8Array(init_input);
        } else {
            this.buffer = new Uint8Array();
        }
        this.headers = [];
        this.header_frame_info = new frameHeader();
        this.prefix = new encodedFieldPrefix();
        this.index = 0;
        this.parse_frame_state = parsingHeadersFrameState.parse_frame_header;
        this.parse_field_state = parsingFieldLineState.parse_no_state;
    }
}

function is_indexed_line(val: number): boolean {
    const mask = 1 << 7;
    return (val & mask) > 0;
}

function is_post_base_indexed(val: number): boolean {
    const mask = 1 << 4;
    return (val & mask) > 0;
}

function is_literal_field_with_name_ref(val: number): boolean {
    const mask = 1 << 6;
    return (val & mask) > 0;
}

function is_literal_field_with_post_base_name_ref(val: number): boolean {
    const mask = 0xff >> 4;
    return (val & mask) === 0;
}

function is_literal_field_with_literal_name(val: number): boolean {
    const mask = 1 << 5;
    return (val & mask) > 0;
}

function parse_line_type(val: number): qpackFieldLineType | null {
    if (is_indexed_line(val)) {
        return qpackFieldLineType.Indexed_Field_Line;
    } else if (is_post_base_indexed(val)) {
        return qpackFieldLineType.Post_Base_Indexed_Field_Line;
    } else if (is_literal_field_with_name_ref(val)) {
        return qpackFieldLineType.Literal_Field_Line_With_Name_Reference;
    } else if (is_literal_field_with_post_base_name_ref(val)) {
        return qpackFieldLineType.Literal_Field_Line_With_Post_Base_Name_Reference;
    } else if (is_literal_field_with_literal_name(val)) {
        return qpackFieldLineType.Literal_Field_Line_With_Literal_Name;
    }

    return null;
}

function parse_name_indexed_line(is_post_base: boolean, ctx: parserContext): res_status {
    let curr_index = ctx.index;
    let name_index_len: number;
    let is_static= false;
    let never_encode = false;
    if (is_post_base) {
        name_index_len = 3;
        never_encode = (ctx.buffer[curr_index] & (1 << name_index_len)) > 0;
    } else {
        name_index_len = 4;
        is_static = (ctx.buffer[curr_index] & (1 << name_index_len)) > 0;
        never_encode = (ctx.buffer[curr_index] & (1 << (name_index_len + 1))) > 0;
    }

    const name_index = varint_decode(ctx.buffer, curr_index, name_index_len);
    if (name_index.status != res_status.OK) {
        console.log("Need More bytes for parse_literal_field_line_with_name_ref name_index");
        return res_status.NEED_MORE_DATA;
    }
    curr_index += name_index.len;

    const is_huffman = (ctx.buffer[curr_index] & (1 << 7)) > 0;
    const val_len = varint_decode(ctx.buffer, curr_index, 7);
    if (val_len.status != res_status.OK) {
        console.log("Need More bytes for parse_literal_field_line_with_name_ref val_len");
        return res_status.NEED_MORE_DATA;
    }
    curr_index += val_len.len;
    if (curr_index >= ctx.buffer.length) {
        console.log("Need More bytes for parse_literal_field_line_with_name_ref val_str");
        return res_status.NEED_MORE_DATA;
    }
    const val_str = new TextDecoder("utf-8")
                        .decode(ctx.buffer.subarray(curr_index, curr_index + val_len.val));
    curr_index += val_len.val;
    if (is_post_base) {
        ctx.headers.push(nameIndexedLine.makePostBaseIndexed(name_index.val,
                                                             val_str, is_huffman,
                                                             never_encode));
    } else {
        ctx.headers.push(nameIndexedLine.makeIndexed(name_index.val,
                                                     val_str, is_static,
                                                     is_huffman, never_encode));
    }

    // advance index in ctx
    ctx.index = curr_index;
    return res_status.OK;
}

function parse_literal_line(ctx: parserContext): res_status {
    let curr_index = ctx.index;
    const never_encode = (ctx.buffer[curr_index] & (1 << 4)) > 0;
    const is_name_huffman = (ctx.buffer[curr_index] & (1 << 3)) > 0;

    const name_len = varint_decode(ctx.buffer, curr_index, 4);
    if (name_len.status != res_status.OK) {
        console.log("Need More bytes for parse_literal_line name_len");
        return res_status.NEED_MORE_DATA;
    }
    curr_index += name_len.len;
    if (curr_index >= ctx.buffer.length) {
        console.log("Need More bytes for parse_literal_line name_str");
        return res_status.NEED_MORE_DATA;
    }
    const name_str = new TextDecoder("utf-8")
                         .decode(ctx.buffer.subarray(curr_index, curr_index + name_len.val));
    curr_index += name_len.val;

    const is_val_huffman = (ctx.buffer[curr_index] & (1 << 7)) > 0;
    const val_len = varint_decode(ctx.buffer, curr_index, 7);
    if (val_len.status != res_status.OK) {
        console.log("Need More bytes for parse_literal_line val_len");
        return res_status.NEED_MORE_DATA;
    }
    curr_index += val_len.len;
    if (curr_index >= ctx.buffer.length) {
        console.log("Need More bytes for parse_literal_line val_str");
        return res_status.NEED_MORE_DATA;
    }
    const val_str = new TextDecoder("utf-8")
                        .decode(ctx.buffer.subarray(curr_index, curr_index + val_len.val));
    curr_index += val_len.val;

    ctx.headers.push(literalLine.make(name_str, val_str, is_name_huffman, is_val_huffman, never_encode));

    // advance index in ctx
    ctx.index = curr_index;
    return res_status.OK;
}

function parse_field_lines(ctx: parserContext): res_status {
    while (ctx.index < ctx.buffer.length) {
        switch (ctx.parse_field_state) {
            case parsingFieldLineState.parse_no_state:
            case parsingFieldLineState.parse_field_line_type: {
                ctx.parse_field_state = parsingFieldLineState.parse_field_line_type;
                const init_byte = ctx.buffer[ctx.index];
                const line_type = parse_line_type(init_byte);
                if (line_type === null) {
                    return res_status.ERROR;
                }
                switch (line_type) {
                    case qpackFieldLineType.Indexed_Field_Line:
                        ctx.parse_field_state = parsingFieldLineState.parse_indexed_field_line;
                        break;
                    case qpackFieldLineType.Post_Base_Indexed_Field_Line:
                        ctx.parse_field_state = parsingFieldLineState.parse_post_base_indexed_field_line;
                        break;
                    case qpackFieldLineType.Literal_Field_Line_With_Name_Reference:
                        ctx.parse_field_state = parsingFieldLineState.parse_literal_field_line_with_name_ref;
                        break;
                    case qpackFieldLineType.Literal_Field_Line_With_Post_Base_Name_Reference:
                        ctx.parse_field_state = parsingFieldLineState.parse_literal_field_line_with_post_base_name_ref;
                        break;
                    case qpackFieldLineType.Literal_Field_Line_With_Literal_Name:
                        ctx.parse_field_state = parsingFieldLineState.parse_literal_field_line_with_literal_name;
                        break;
                }
                continue;
            }
            case parsingFieldLineState.parse_indexed_field_line: {
                // RFC 9204, Section 4.5.2
                const is_static = (ctx.buffer[ctx.index] & (1 << 6)) > 0;
                const header_index = varint_decode(ctx.buffer, ctx.index, 6);
                if (header_index.status != res_status.OK) {
                    console.log("Need More bytes for parse_indexed_field_line");
                    return res_status.NEED_MORE_DATA;
                }

                ctx.headers.push(indexedLine.makeIndexed(header_index.val, is_static));
                ctx.index += header_index.len;
                ctx.parse_field_state = parsingFieldLineState.parse_no_state;
                continue;
            }
            case parsingFieldLineState.parse_post_base_indexed_field_line: {
                // RFC 9204, Section 4.5.3
                const header_index = varint_decode(ctx.buffer, ctx.index, 4);
                if (header_index.status != res_status.OK) {
                    console.log("Need More bytes for parse_post_base_indexed_field_line");
                    return res_status.NEED_MORE_DATA;
                }

                ctx.headers.push(indexedLine.makePostBaseIndexed(header_index.val));
                ctx.index += header_index.len;
                ctx.parse_field_state = parsingFieldLineState.parse_no_state;
                continue;
            }

            case parsingFieldLineState.parse_literal_field_line_with_name_ref: {
                // RFC 9204, Section 4.5.4
                const status = parse_name_indexed_line(false, ctx);
                if (status != res_status.OK) {
                    return status;
                }
                ctx.parse_field_state = parsingFieldLineState.parse_no_state;
                continue;
            }
            case parsingFieldLineState.parse_literal_field_line_with_post_base_name_ref: {
                // RFC 9204, Section 4.5.5
                const status = parse_name_indexed_line(true, ctx);
                if (status != res_status.OK) {
                    return status;
                }
                ctx.parse_field_state = parsingFieldLineState.parse_no_state;
                continue;
            }
            case parsingFieldLineState.parse_literal_field_line_with_literal_name: {
                // RFC 9204, Section 4.5.6
                const status = parse_literal_line(ctx);
                if (status != res_status.OK) {
                    return status;
                }
                ctx.parse_field_state = parsingFieldLineState.parse_no_state;
                continue;
            }
        }
    }

    return res_status.OK;
}

export function try_parse_headers_frame(ctx: parserContext): boolean {
    while (ctx.index < ctx.buffer.length) {
        switch (ctx.parse_frame_state) {
            case parsingHeadersFrameState.parse_frame_header:
                // Determine the frame type
                switch (ctx.buffer[ctx.index]) {
                    case HTTP3FrameType.HEADERS_FRAME:
                        ctx.index += 1;
                        ctx.header_frame_info.frame_type = HTTP3FrameType.HEADERS_FRAME;
                        break;
                    default:
                        if (ctx.buffer[0] > HTTP3FrameType.UNKNOWN_FRAME) {
                            ctx.buffer[0] = HTTP3FrameType.UNKNOWN_FRAME;
                        }
                        console.log("Not a valid Headers Frame: " + HTTP3FrameType[ctx.buffer[ctx.index]]);
                        return false;
                }
                // fallsthrough
            case parsingHeadersFrameState.parse_frame_length: {
                ctx.parse_frame_state = parsingHeadersFrameState.parse_frame_length;
                const res = quic_varint_decode(ctx.buffer, ctx.index);
                if (res.status != res_status.OK) {
                    console.log("Need More bytes for header");
                    return false;
                }
                ctx.header_frame_info.frame_payload_len = res.val;
                ctx.header_frame_info.frame_header_len = 1 + res.len;
                ctx.index += res.len;
                // fallsthrough
            }
            case parsingHeadersFrameState.parse_encoded_field_section_prefix: {
                ctx.parse_frame_state = parsingHeadersFrameState.parse_encoded_field_section_prefix;
                const req_ins_count = varint_decode(ctx.buffer, ctx.index, 8);
                if (req_ins_count.status != res_status.OK) {
                    console.log("Need More bytes for req_ins_count");
                    return false;
                }
                ctx.prefix.encoded_req_ins_count = req_ins_count.val;

                ctx.prefix.sign_set = (ctx.buffer[ctx.index + req_ins_count.len] & (1 << 7)) > 0;

                const delta_base = varint_decode(ctx.buffer, ctx.index + req_ins_count.len, 7);
                if (delta_base.status != res_status.OK) {
                    console.log("Need More bytes for delta_base");
                    return false;
                }
                ctx.prefix.delta_base = delta_base.val;

                ctx.index += req_ins_count.len + delta_base.len;
                // fallsthrough
            }
            case parsingHeadersFrameState.parse_payload: {
                ctx.parse_frame_state = parsingHeadersFrameState.parse_payload;

                const line_parse_res = parse_field_lines(ctx);
                if (line_parse_res != res_status.OK) {
                    console.log("Need More bytes for parse_payload");
                    return false;
                }
                ctx.parse_frame_state = parsingHeadersFrameState.parse_payload_done;
                // frame parsing complete
                // fallsthrough
            }
            default:
                break;
        }
    }

    return true;
}

export * from "./prefix_int_decoder";
export * from "./status";
export * from "./qpack_consts";
export * from "./encoced_line";
