<script setup>
import { ref, watch } from "vue"
import { useMapStore } from "src/stores/map"
import { LayerInfoService, GetLayersLegendInfoParameters } from "@supermapgis/iclient-ol"
import { useQuasar } from 'quasar'

const mapStore = useMapStore()
const $q = useQuasar()

/* UI state */
const legends = ref([])

/* Flatten all legend items from the potentially nested iServer response */
function flattenLegendItems(layerLegends) {
  if (!layerLegends) return []
  
  let items = []
  layerLegends.forEach(ll => {
    // Add items from this level
    if (ll.legends && ll.legends.length > 0) {
      ll.legends.forEach(l => {
        items.push({
          label: l.label,
          image: 'data:image/png;base64,' + l.imageData
        })
      })
    }
    // Add items from sub-layers
    if (ll.subLayerLegends) {
      items = [...items, ...flattenLegendItems(ll.subLayerLegends)]
    }
  })
  return items
}

/* fetch legend using LayerInfoService */
async function fetchSuperMapLegend(opLayer) {
    return new Promise((resolve) => {
        try {
            // Match the example parameters
            const params = new GetLayersLegendInfoParameters({
                width: 18,
                height: 18
            })
            
            new LayerInfoService(opLayer.url).getLayersLegendInfo(params, (serviceResult) => {
                if (serviceResult.type === "processCompleted" && serviceResult.result.layerLegends) {
                    const allItems = flattenLegendItems(serviceResult.result.layerLegends)
                    resolve({
                      id: opLayer.id,
                      title: opLayer.title,
                      items: allItems
                    })
                } else {
                    resolve(null)
                }
            })
        } catch (err) {
            console.error(`[Legend] Error for ${opLayer.id}:`, err)
            resolve(null)
        }
    })
}

/* watch active operational layers */
watch(
    () => mapStore.operational,
    async (layers) => {
        const activeLegends = []

        for (const layer of layers) {
            if (layer.type === "supermap" && layer.visible) {
                const legend = await fetchSuperMapLegend(layer)
                if (legend && legend.items.length > 0) {
                    activeLegends.push(legend)
                }
            }
        }
        legends.value = activeLegends
    },
    { immediate: true, deep: true }
)
</script>

<template>
    <q-card :flat="$q.dark.isActive" :class="$q.dark.isActive ? 'card-bg-dark text-white' : 'card-bg-light text-dark'" class="rounded-borders">
        <q-expansion-item
            :dark="$q.dark.isActive"
            expand-separator
            icon="format_list_bulleted"
            :label="$t('map.legend')"
            default-opened
        >
            <q-card-section class="q-pt-none" style="max-height:150px; overflow-y: auto;margin-right: 2px;">
                <div v-if="!legends.length" class="text-caption text-center q-pa-md" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">
                    Tidak ada layer aktif atau data legenda
                </div>

                <div v-for="legendGroup in legends" :key="legendGroup.id" class="q-mb-sm">
                    <div class="text-caption text-weight-bold q-mb-xs" :class="$q.dark.isActive ? 'text-grey-5' : 'text-dark'">
                        {{ legendGroup.title }}
                    </div>

                    <div v-for="(item, i) in legendGroup.items" :key="i" class="row items-center cursor-pointer q-mb-xs">
                        <div class="bg-white q-pa-xs q-mr-sm" style="border-radius: 2px; line-height: 0; flex-shrink: 0;">
                            <img :src="item.image" width="16" height="16" style="display: block;" />
                        </div>
                        <span class="text-caption" style="word-break: break-all;">{{ item.label }}</span>
                    </div>
                </div>
            </q-card-section>
        </q-expansion-item>
    </q-card>
</template>

<style scoped>
.bg-darker-slate {
    background: rgba(15, 23, 42, 0.9) !important;
    backdrop-filter: blur(8px);
}
</style>
