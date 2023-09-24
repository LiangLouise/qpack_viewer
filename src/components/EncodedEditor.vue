<template>
    <div class="card">
        <Editor v-model="encoded_input" :placeholder="placeholder"
            editorStyle="height: 320px" @text-change="on_text_change">
            <template v-slot:toolbar>
                <span class="ql-formats" />
            </template>
        </Editor>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Editor from 'primevue/editor';
import { EditorTextChangeEvent } from 'primevue/editor';
import { fromHex } from "@smithy/util-hex-encoding";

export default defineComponent({
    name: 'EncodedEditor',
    emits: {
        input_update(hex_array: Uint8Array) {
            return hex_array.length > 0;
        },
        input_error(err: Error) {
            return err.message.length > 0;
        }
    },
    components: {
        Editor,
    },
    data() {
        return {
            encoded_input: "",
            input_hex: new Uint8Array(),
        };
    },
    methods: {
        on_text_change(e: EditorTextChangeEvent) {
            this.encoded_input = e.textValue;
            if (this.encoded_input.length % 2 == 0) {
                let res: Uint8Array;
                try {
                    res = fromHex(this.encoded_input);
                } catch (error) {
                    this.$emit("input_error", error as Error);
                    return;
                }
                this.$emit("input_update", res);
            }
        }
    },
    props: {
        placeholder: String,
    },
});
</script>
