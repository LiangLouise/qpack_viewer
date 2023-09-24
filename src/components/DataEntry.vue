<template>
    <DataTable :value="get_values" size="small">
        <Column v-for="col of fields" :key="col.field" :field="col.field" :header="col.header"></Column>
    </DataTable>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

import DataTable from "primevue/datatable";
import Column from "primevue/column";

import { frameSegment } from '../lib/qpack_parser';

export default defineComponent({
    name: 'DataEntry',
    components: {
        DataTable,
        Column,
    },
    data() {
        return {
            fields: [
                { field: 'key', header: 'Key' },
                { field: 'value', header: 'Value' },
            ],
        }
    },
    computed: {
        get_values() {
            let table_data = [];
            console.log(this.data.display());
            for (const [key, val] of this.data.display()) {
                table_data.push({ key: key, value: val });
            }
            return table_data;
        }
    },
    props: {
        data: { type: Object as PropType<frameSegment>, required: true }
    },
});
</script>
