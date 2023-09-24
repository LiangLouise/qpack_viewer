<template>
    <DataTable :value="get_values" size="small">
        <Column v-for="col of fields" :key="col.field" :field="col.field" :header="col.header"></Column>
    </DataTable>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import DataTable from "primevue/datatable";
import Column from "primevue/column";

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
                for (const key in this.data) {
                    if (Object.prototype.hasOwnProperty.call(this.data, key)) {
                        const element = this.data[key];
                        table_data.push({ key: key, value: element });
                    }
                }
                return table_data;
        }
    },
    props: {
        data: { type: Object, required: true }
    },
});
</script>
