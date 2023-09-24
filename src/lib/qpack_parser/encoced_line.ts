import { static_table } from "./static_table";
import { qpackFieldLineType, fieldLine, frameSegmentMap } from "./qpack_consts";

export class indexedLine implements fieldLine {
    encoded_type: qpackFieldLineType;
    index: number;
    is_static: boolean;
    is_post_base: boolean;

    private constructor(index: number, is_static: boolean, is_post_base: boolean) {
        this.index = index;
        this.is_static = is_static;
        if (is_post_base) {
            this.encoded_type = qpackFieldLineType.Post_Base_Indexed_Field_Line;
        } else {
            this.encoded_type = qpackFieldLineType.Indexed_Field_Line;
        }
        this.is_post_base = is_post_base;
    }

    static makeIndexed(index: number, is_static: boolean): indexedLine {
        return new indexedLine(index, is_static, false);
    }

    static makePostBaseIndexed(index: number): indexedLine {
        return new indexedLine(index, false, true);
    }

    display(): frameSegmentMap {
        if (!this.is_static) {
            return new Map<string, string | number | boolean>([
                ["Field Line Encode Type", qpackFieldLineType[this.encoded_type]],
                ["Referenced Table",       "Dynamic Table"],
                ["Dynamic Table Index",    this.index],
                ["Is Post Base",           this.is_post_base],
            ]);
        }
        return static_table[this.index].display(this.encoded_type);
    }
}

export class nameIndexedLine implements fieldLine {
    encoded_type: qpackFieldLineType;
    name_index: number;
    line_val: string;
    is_static: boolean;
    is_post_base: boolean;
    is_val_huffman: boolean;
    never_encode: boolean;

    private constructor(name_index: number, line_val: string,
                        is_static: boolean, is_post_base: boolean,
                        is_huffman: boolean, never_encode: boolean) {
        this.name_index = name_index;
        this.line_val = line_val;
        this.is_static = is_static;
        if (is_post_base) {
            this.encoded_type = qpackFieldLineType.Literal_Field_Line_With_Post_Base_Name_Reference;
        } else {
            this.encoded_type = qpackFieldLineType.Literal_Field_Line_With_Name_Reference;
        }
        this.is_post_base = is_post_base;
        this.is_val_huffman = is_huffman;
        this.never_encode = never_encode;
    }

    static makeIndexed(name_index: number, line_val: string, is_static: boolean,
                       is_huffman: boolean, never_encode: boolean): nameIndexedLine {
        return new nameIndexedLine(name_index, line_val, is_static, false, is_huffman, never_encode);
    }

    static makePostBaseIndexed(name_index: number, line_val: string,
                               is_huffman: boolean, never_encode: boolean): nameIndexedLine {
        return new nameIndexedLine(name_index, line_val, false, true, is_huffman, never_encode);
    }

    display(): frameSegmentMap {
        const val_fields = new Map<string, string | number | boolean>([
            ["Line Value",            this.line_val],
            ["Value Huffman Encoded", this.is_val_huffman],
            ["Never Encode",          this.never_encode],
        ]);

        if (!this.is_static) {
            return new Map<string, string | number | boolean>([
                ["Field Line Encode Type",   qpackFieldLineType[this.encoded_type]],
                ["Referenced Table",         "Dynamic Table"],
                ["Line Name Index",          this.name_index],
                ["Is Post Base",             this.is_post_base],
                ...val_fields,
            ]);
        }

        return new Map<string, string | number | boolean>([
            ...static_table[this.name_index].display(this.encoded_type),
            ...val_fields
        ]);
    }
}

export class literalLine implements fieldLine {
    encoded_type: qpackFieldLineType;

    line_name: string;
    is_name_huffman: boolean;

    line_val: string;
    is_val_huffman: boolean;

    never_encode: boolean;

    private constructor(line_name: string, line_val: string,
                        is_name_huffman: boolean, is_val_huffman: boolean,
                        never_encode: boolean) {
        this.line_name = line_name;
        this.line_val = line_val;
        this.is_name_huffman = is_name_huffman;
        this.encoded_type = qpackFieldLineType.Literal_Field_Line_With_Literal_Name;
        this.is_val_huffman = is_val_huffman;
        this.never_encode = never_encode;
    }

    static make(line_name: string, line_val: string,
                is_name_huffman: boolean, is_val_huffman: boolean,
                never_encode: boolean): literalLine {
        return new literalLine(line_name, line_val, is_name_huffman, is_val_huffman, never_encode);
    }

    display(): frameSegmentMap {
        return new Map<string, string | number | boolean>([
            ["Field Line Encode Type",   qpackFieldLineType[this.encoded_type]],

            ["Line Name",                this.line_name],
            ["Name Huffman Encoded",     this.is_name_huffman],

            ["Line Value",               this.line_val],
            ["Value Huffman Encoded",    this.is_val_huffman],

            ["Never Encode",             this.never_encode],
        ]);
    }
}
