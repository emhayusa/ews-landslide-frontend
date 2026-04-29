<script setup>
import { useMapStore } from "src/stores/map";
import { useQuasar } from "quasar";

const mapStore = useMapStore();
const $q = useQuasar();
</script>

<template>
    <q-card :flat="$q.dark.isActive" :class="$q.dark.isActive ? 'card-bg-dark text-white' : 'card-bg-light text-dark'" class="rounded-borders q-mb-none">
        <q-expansion-item
            :dark="$q.dark.isActive"
            expand-separator
            icon="public"
            :label="$t('map.layers')"
            default-opened
        >
            <q-card-section class="q-pt-none column q-gutter-y-xs scroll" style="max-height: 200px; overflow-y: auto; padding-right: 8px;">
                <template v-for="op in mapStore.operational" :key="op.id">
                    <div class="row justify-between items-center text-caption">
                        <span class="text-weight-medium">{{ op.title }}</span>
                        <q-btn flat round dense size="sm" 
                            :icon="op.visible ? 'visibility' : 'visibility_off'" 
                            @click="mapStore.toggleLayerVisibility(op.id)" 
                        />
                    </div>
                </template>
            </q-card-section>
        </q-expansion-item>
    </q-card>
</template>

<style scoped>
</style>
