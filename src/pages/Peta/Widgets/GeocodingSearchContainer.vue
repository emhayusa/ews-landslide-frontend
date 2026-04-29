<script setup>
import { ref, watch, onMounted } from 'vue'
import { useMapStore } from 'src/stores/map'
import { useQuasar } from 'quasar'
import { fromLonLat } from 'ol/proj'

import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import Style from 'ol/style/Style'
import Icon from 'ol/style/Icon'

const mapStore = useMapStore()
const $q = useQuasar()

const inputValue = ref('')
const showSuggestions = ref(false)
const message = ref('')
const suggestions = ref([])

let debounceTimer = null

/* =========================
 * SEARCH MARKER LAYER
 * ========================= */
const markerSource = new VectorSource()

const markerLayer = new VectorLayer({
    source: markerSource,
    style: new Style({
        image: new Icon({
            src: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
            scale: 0.05,
            anchor: [0.5, 1],
        }),
    }),
})

onMounted(() => {
    if (mapStore.map) {
        mapStore.map.addLayer(markerLayer)
    }
})

/* =========================
 * GEOCODING (NOMINATIM)
 * ========================= */
async function searchLocation(query) {
    if (!query || query.length < 3) {
        suggestions.value = []
        showSuggestions.value = false
        return
    }

    message.value = 'Searching...'
    showSuggestions.value = true

    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                query
            )}&countrycodes=id&limit=5`
        )

        const data = await res.json()

        if (!data.length) {
            message.value = 'Lokasi tidak ditemukan'
            suggestions.value = []
        } else {
            message.value = ''
            suggestions.value = data
        }
    } catch (err) {
        console.log(err)
        message.value = 'Gagal mengambil data'
        suggestions.value = []
    }
}

/* =========================
 * INPUT HANDLER (DEBOUNCE)
 * ========================= */
watch(inputValue, (val) => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
        searchLocation(val)
    }, 400)
})

/* =========================
 * HANDLE RESULT CLICK
 * ========================= */
function handleSuggestionClick(item) {
    inputValue.value = item.display_name
    showSuggestions.value = false

    if (!mapStore.map) return

    const lon = parseFloat(item.lon)
    const lat = parseFloat(item.lat)
    const coord = fromLonLat([lon, lat])

    // clear old marker
    markerSource.clear()

    // add marker
    const feature = new Feature({
        geometry: new Point(coord),
    })
    markerSource.addFeature(feature)

    // animate map
    mapStore.map.getView().animate({
        center: coord,
        zoom: 16,
        duration: 600,
    })
}

function onClear() {
    suggestions.value = []
    showSuggestions.value = false
    markerSource.clear()
}
</script>

<template>
    <div class="relative-position" style="z-index: 99; width: 100%;">
        <!-- Search box -->
        <q-card 
            flat 
            class="q-px-md shadow-2" 
            :class="$q.dark.isActive ? 'search-box-dark text-white' : 'card-bg-light text-dark'" 
            style="width: 100%; height: 44px; border-radius: 22px; display: flex; align-items: center;"
        >
             <q-input 
                v-model="inputValue" 
                :dark="$q.dark.isActive" 
                borderless 
                dense 
                placeholder="Cari lokasi..." 
                autocomplete="off" 
                class="full-width"
                clearable
                @clear="onClear"
            >
                <template #prepend>
                    <q-icon name="search" size="sm" :class="$q.dark.isActive ? 'text-white' : 'text-dark'" class="q-mr-xs" />
                </template>
            </q-input>
        </q-card>

        <!-- Suggestions -->
        <q-card 
            v-if="showSuggestions" 
            flat 
            bordered 
            class="q-mt-xs shadow-5 overflow-hidden" 
            :class="$q.dark.isActive ? 'card-bg-dark text-white' : 'card-bg-light text-dark'" 
            style="width: 100%; max-height: 250px; border-radius: 16px; position: absolute; left: 0; right: 0;"
        >
            <div v-if="message" class="q-pa-md text-caption text-center" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">
                {{ message }}
            </div>

            <q-list v-else separator>
                <q-item v-for="(item, idx) in suggestions" :key="idx" clickable @click="handleSuggestionClick(item)" class="q-py-sm">
                    <q-item-section avatar side class="q-pr-sm">
                        <q-icon name="place" size="xs" color="primary" />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label class="text-caption weight-500" style="word-break: break-word; line-height: 1.2;">
                            {{ item.display_name }}
                        </q-item-label>
                    </q-item-section>
                </q-item>
            </q-list>
        </q-card>
    </div>
</template>
