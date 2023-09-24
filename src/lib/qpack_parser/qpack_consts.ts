export enum qpackFieldLineType {
    Indexed_Field_Line,
    Post_Base_Indexed_Field_Line,
    Literal_Field_Line_With_Name_Reference,
    Literal_Field_Line_With_Post_Base_Name_Reference,
    Literal_Field_Line_With_Literal_Name,
}

export interface fieldLine {
    encoded_type: qpackFieldLineType,

    display(): string
}

export enum parsingHeadersFrameState {
    parse_frame_header,
    parse_frame_length,
    parse_encoded_field_section_prefix,
    parse_payload,
    parse_payload_done,
}

export enum parsingFieldLineState {
    parse_no_state,
    parse_field_line_type,

    parse_indexed_field_line,
    parse_post_base_indexed_field_line,
    parse_literal_field_line_with_name_ref,
    parse_literal_field_line_with_post_base_name_ref,
    parse_literal_field_line_with_literal_name,
}

export enum HTTP3FrameType {
    DATA_FRAME = 0x00,
    HEADERS_FRAME,
    CANCEL_PUSH_FRAME,
    SETTINGS_FRAME,
    PUSH_PROMISE_FRAME,
    GOAWAY_FRAME,
    MAX_PUSH_ID_FRAME,
    UNKNOWN_FRAME,
}
