<script setup>
//import { onMounted, ref } from "vue"
import { useMapStore } from "src/stores/map"

const mapStore = useMapStore()
//const popupRef = ref(null)

/* local UI state */
//const openedOpacity = ref(null) // layer title that shows opacity slider

//onMounted(() => {
//mapStore.enableIdentify(popupRef.value)
//})

//function toggleOpacityMenu(title) {
//openedOpacity.value = openedOpacity.value === title ? null : title
//}
</script>

<template>
    <q-card flat bordered class="absolute-top-left q-ma-md bg-darker-slate text-white"
        style="z-index:99; margin-top:85px; width:340px; min-height:400px">
        <!-- Header -->
        <q-card-section class="row cd  justify-between">
            <div class="text-h6">Daftar Lapisan Peta</div>
            <q-btn dense flat icon="close" @click="$emit('close')" />
        </q-card-section>

        <q-separator />

        <!-- LAYER LIST -->
        <q-card-section>
            <q-list dense separator>
                <q-item v-for="layer in mapStore.operational" :key="layer.id" style="padding-left:0px;">
                    <q-item-section>
                        <q-toggle dark color="primary" :label="layer.title" :model-value="layer.visible" @update:model-value="
                            mapStore.toggleLayerVisibility(layer.id)
                            " />

                    </q-item-section>
                    <!--
                    <q-item-section side>
                        <q-btn dense flat round icon="more_vert">
                            <q-menu anchor="bottom right" self="top right">
                                <q-list dense style="min-width:150px">

                                    <q-item clickable v-close-popup @click="toggleOpacityMenu(layer.title)">
                                        <q-item-section>Set Opacity</q-item-section>
                                    </q-item>

                                    <q-item clickable v-close-popup @click="mapStore.zoomToLayer(layer.title)">
                                        <q-item-section>Zoom To</q-item-section>
                                    </q-item>

                                </q-list>
                            </q-menu>
                        </q-btn>
                    </q-item-section> -->
                </q-item>
                <!-- <q-item v-if="openedOpacity === layer.title" class="q-pl-lg q-pr-lg">
                    <q-slider :min="0" :max="1" :step="0.1" :model-value="layer.opacity" label label-always
                        @update:model-value="
                            val => mapStore.setLayerOpacity(layer.title, val)
                        " />
                </q-item> -->

            </q-list>
        </q-card-section>
    </q-card>

</template>