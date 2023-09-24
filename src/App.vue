<template>
    <Toast />
    <div class="w-10">
        <p class="font-medium text-4xl">HTTP/3 QPACK Viewer</p>
        <p class="font-italic text-base">
            Disassemble the HEADERS Frame in HTTP/3 Encoded with QPACK Field Compression
        </p>
    </div>
    <EncodedEditor placeholder="paste the QPACK Headers Hex Stream Here"
                   @input_update="recv_hex_input"
                   @input_error="recv_input_error"
    />
    <DecodedDisplay :encoded_input="get_hex_input" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import EncodedEditor from "./components/EncodedEditor.vue";
import DecodedDisplay from "./components/DecodedDisplay.vue";
import Toast from "primevue/toast";
import "primevue/resources/themes/lara-light-indigo/theme.css";
import "primeflex/primeflex.css";

export default defineComponent({
    name: 'App',
    data:() => {
        return {
            hex_input: new Uint8Array([0x10, 0xf]),
        }
    },
    components: {
        EncodedEditor,
        DecodedDisplay,
        Toast,
    },
    methods: {
        recv_hex_input(hex_array: Uint8Array) {
            this.hex_input = hex_array;
        },
        recv_input_error(error: Error) {
            this.$toast.add({ severity: 'warn', summary: error.name, detail: error.message, life: 3000 });
        }
    },
    computed: {
        get_hex_input() {
            return this.hex_input as Uint8Array;
        }
    }
});
</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /* text-align: center; */
    color: #2c3e50;
    margin-top: 60px;
}
</style>
