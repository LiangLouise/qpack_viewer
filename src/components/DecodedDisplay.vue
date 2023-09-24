<template>
    <Button label="Decode" @click="try_parse" />
    <div class="decoded-display">
        <div v-if="is_frame_info_ready">
            <div class="card">
                <Fieldset :legend="frame_type_name" :toggleable="true">
                    <div class="card">
                        <Fieldset legend="Frame Header" :toggleable="true">
                            <DataEntry :data="parse_ctx.header_frame_info" />
                        </Fieldset>
                    </div>
                    <div v-if="is_encoded_prefix_ready" class="card">
                        <Fieldset legend="Encoded Prefix" :toggleable="true">
                            <DataEntry :data="parse_ctx.prefix" />
                        </Fieldset>
                    </div>
                    <div v-for="(header, index) in get_headers" :key="index">
                        <div class="card">
                            <Fieldset :legend="`Field Line: ${index}`" :toggleable="true">
                                <DataEntry :data="header" />
                            </Fieldset>
                        </div>
                    </div>
                </Fieldset>
            </div>
        </div>
        <div v-if="!get_done" class="card">
            <Message severity="warn" :closable="false">Not fully parsed. Need more data</Message>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Button from "primevue/button";
import Message from "primevue/message";
import Fieldset from "primevue/fieldset";
import DataEntry from "./DataEntry.vue";
import * as qpack_parser from "../lib/qpack_parser";

export default defineComponent({
    name: 'DecodedDisplay',
    components: {
        Button,
        Message,
        Fieldset,
        DataEntry,
    },
    data() {
        return {
            parsing_done: true,
            parse_ctx: new qpack_parser.parserContext(null),
        };
    },
    methods: {
        try_parse() {
            console.log("try parse");
            this.parsing_done = false;
            this.parse_ctx = new qpack_parser.parserContext(this.encoded_input);
            this.parsing_done = qpack_parser.try_parse_headers_frame(this.parse_ctx);
        },
        clear() {
            this.parse_ctx = new qpack_parser.parserContext(null);
            this.parsing_done = false;
        },
    },
    computed: {
        is_frame_info_ready() {
            return this.parse_ctx.parse_frame_state > qpack_parser.parsingHeadersFrameState.parse_frame_length;
        },
        is_encoded_prefix_ready() {
            return this.parse_ctx.parse_frame_state > qpack_parser.parsingHeadersFrameState.parse_encoded_field_section_prefix;
        },
        get_headers() {
            return this.parse_ctx.headers;
        },
        get_done() {
            console.log(this.parsing_done);
            return this.parsing_done;
        },
        frame_type_name() {
            return qpack_parser.HTTP3FrameType[this.parse_ctx.header_frame_info.frame_type];
        }
    },
    props: {
        encoded_input: { type: Uint8Array, required: true },
        start_parsing: { type: Boolean },
    },
});
</script>

<style>
.card {
    background: var(--surface-card);
    padding: 0.5rem;
    border-radius: 5px;
    margin-bottom: 0.5rem;
}

.decoded-display {
    /* float: left; */
    width: 50%;
}
</style>
