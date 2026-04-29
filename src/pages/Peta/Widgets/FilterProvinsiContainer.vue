<script setup>
import { ref, computed } from "vue";

const filterAnchor = ref(null);
const search = ref("");

// pilihan yang sedang dicentang
const selected = ref([]);

// pilihan yang sudah DIKONFIRMASI (setelah klik Terapkan)
const appliedSelection = ref([]);

const options = ref([
    { value: "aceh", label: "Aceh" },
    { value: "sumatera-barat", label: "Sumatera Barat" },
    { value: "sumatera-utara", label: "Sumatera Utara" },
]);

const filteredOptions = computed(() => {
    if (!search.value) return options.value;
    const q = search.value.toLowerCase();
    return options.value.filter(o =>
        o.label.toLowerCase().includes(q)
    );
});

// teks yang tampil di input (ringkasan pilihan)
const inputLabel = computed(() => {
    if (appliedSelection.value.length === 0) {
        return "Filter provinsi...";
    }

    const labels = options.value
        .filter(o => appliedSelection.value.includes(o.value))
        .map(o => o.label);

    // kalau lebih dari 2, tampilkan ringkas + jumlah
    if (labels.length > 2) {
        return `${labels[0]}, ${labels[1]} +${labels.length - 2} lainnya`;
    }

    return `${labels.join(", ")} (${labels.length})`;
});

// Toggle satu item
function toggle(val) {
    const idx = selected.value.indexOf(val);
    if (idx === -1) selected.value.push(val);
    else selected.value.splice(idx, 1);
}



// Reset
function resetFilter() {
    selected.value = [];
    appliedSelection.value = [];
}

// Saat klik Terapkan
function applyFilter() {
    appliedSelection.value = [...selected.value];
}

// Apakah semua sudah terpilih?
const isAllSelected = computed(() => {
    return selected.value.length === options.value.length;
});

// Toggle otomatis: Select All ↔ Deselect All
function toggleSelectAll() {
    if (isAllSelected.value) {
        // kalau sudah full → kosongkan semua (Deselect All)
        selected.value = [];
    } else {
        // kalau belum full → pilih semua
        selected.value = options.value.map(o => o.value);
    }
}
</script>

<template>
    <q-card flat class="absolute-top-left q-ma-md" :style="{
        width: '200px',
        height: '55px',
        marginLeft: '395px'
    }">
        <div class="full-height row items-center q-px-sm">
            <!-- INPUT SEBAGAI TRIGGER -->
            <q-input ref="filterAnchor" dense :model-value="inputLabel" class="full-width">
                <template #prepend>
                    <q-icon name="filter_list" />
                </template>

                <q-menu anchor="bottom left" self="top left" :offset="[8, 15]" style="width: 270px">
                    <q-card flat>

                        <q-card-section>
                            <!-- Search -->
                            <q-input v-model="search" dense outlined placeholder="Cari provinsi..." class="q-mb-md"
                                debounce="300">
                                <template #prepend>
                                    <q-icon name="search" />
                                </template>
                            </q-input>

                            <!-- SELECT ALL -->
                            <div class="row justify-between items-center q-mb-sm">
                                <div class="text-caption text-grey">
                                    Dipilih: {{ selected.length }} / {{ options.length }}
                                </div>
                                <q-btn flat dense :label="isAllSelected ? 'Deselect All' : 'Select All'" color="primary"
                                    @click="toggleSelectAll" />
                            </div>

                            <!-- Checklist -->
                            <q-list separator style="max-height: 220px; overflow-y: auto">
                                <q-item v-for="item in filteredOptions" :key="item.value" clickable v-ripple
                                    @click="toggle(item.value)">
                                    <q-item-section avatar>
                                        <q-checkbox v-model="selected" :val="item.value" @click.stop />
                                    </q-item-section>

                                    <q-item-section>
                                        <q-item-label>{{ item.label }}</q-item-label>
                                    </q-item-section>
                                </q-item>
                            </q-list>
                        </q-card-section>

                        <q-separator />

                        <q-card-actions align="right">
                            <q-btn flat label="Reset" color="grey" @click="resetFilter" />
                            <q-btn flat label="Terapkan" color="primary" @click="applyFilter" v-close-popup />
                        </q-card-actions>

                    </q-card>
                </q-menu>
            </q-input>
        </div>
    </q-card>
</template>
