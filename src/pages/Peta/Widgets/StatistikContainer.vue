<script setup>
import { ref, onMounted } from "vue";

const totalMeninggal = ref(0);
const totalHilang = ref(0);
const totalMengungsi = ref(0);

const allKabkotaData = ref([]);   // 53 kab/kota (untuk angka total)
const top10Meninggal = ref([]);   // chart 1
const top10Mengungsi = ref([]);   // chart 2

const maxMeninggal = ref(1);
const maxMengungsi = ref(1);


// ---- URL DARI ANDA ----
const URL_SUM_MENINGGAL =
    "https://gis.bnpb.go.id/server/rest/services/thematic/MV_Bansor_Sumatera/MapServer/28/query?f=json&cacheHint=true&orderByFields=&outFields=*&outStatistics=%5B%7B%22onStatisticField%22%3A%22meninggal%22%2C%22outStatisticFieldName%22%3A%22value%22%2C%22statisticType%22%3A%22sum%22%7D%5D&returnGeometry=false&spatialRel=esriSpatialRelIntersects&where=1%3D1";

const URL_SUM_HILANG =
    "https://gis.bnpb.go.id/server/rest/services/thematic/MV_Bansor_Sumatera/MapServer/28/query?f=json&cacheHint=true&orderByFields=&outFields=*&outStatistics=%5B%7B%22onStatisticField%22%3A%22hilang%22%2C%22outStatisticFieldName%22%3A%22value%22%2C%22statisticType%22%3A%22sum%22%7D%5D&returnGeometry=false&spatialRel=esriSpatialRelIntersects&where=1%3D1";

const URL_SUM_MENGUNGSI =
    "https://gis.bnpb.go.id/server/rest/services/thematic/MV_Bansor_Sumatera/MapServer/28/query?f=json&cacheHint=true&orderByFields=&outFields=*&outStatistics=%5B%7B%22onStatisticField%22%3A%22mengungsi%22%2C%22outStatisticFieldName%22%3A%22value%22%2C%22statisticType%22%3A%22sum%22%7D%5D&returnGeometry=false&spatialRel=esriSpatialRelIntersects&where=1%3D1";

const URL_TOP10_MENINGGAL =
    "https://gis.bnpb.go.id/server/rest/services/thematic/MV_Bansor_Sumatera/MapServer/28/query?f=json&cacheHint=true&groupByFieldsForStatistics=kabupaten&orderByFields=value%20DESC&outStatistics=%5B%7B%22onStatisticField%22%3A%22meninggal%22%2C%22outStatisticFieldName%22%3A%22value%22%2C%22statisticType%22%3A%22sum%22%7D%5D&returnGeometry=false&where=1%3D1";

const URL_TOP10_MENGUNGSI =
    "https://gis.bnpb.go.id/server/rest/services/thematic/MV_Bansor_Sumatera/MapServer/28/query?f=json&cacheHint=true&groupByFieldsForStatistics=kabupaten&resultRecordCount=10&where=1%3D1&orderByFields=value%20DESC&outStatistics=%5B%7B%22onStatisticField%22%3A%22mengungsi%22%2C%22outStatisticFieldName%22%3A%22value%22%2C%22statisticType%22%3A%22sum%22%7D%5D&returnGeometry=false&spatialRel=esriSpatialRelIntersects";

async function loadData() {
    // ---- TOTAL MENINGGAL ----
    const r1 = await fetch(URL_SUM_MENINGGAL);
    totalMeninggal.value = (await r1.json()).features[0].attributes.value;

    // ---- TOTAL HILANG ----
    const r2 = await fetch(URL_SUM_HILANG);
    totalHilang.value = (await r2.json()).features[0].attributes.value;

    // ---- TOTAL MENGUNGSI ----
    const r3 = await fetch(URL_SUM_MENGUNGSI);
    totalMengungsi.value = (await r3.json()).features[0].attributes.value;

    // ---- TOP 10 MENINGGAL PER KAB/KOTA ----
    const d1 = await fetch(URL_TOP10_MENINGGAL);
    const j1 = await d1.json();

    const dataMeninggal = j1.features.map(f => ({
        kabupaten: f.attributes.kabupaten,
        value: f.attributes.value
    }));

    allKabkotaData.value = dataMeninggal;

    top10Meninggal.value = dataMeninggal
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

    maxMeninggal.value = Math.max(...top10Meninggal.value.map(d => d.value));

    // ---- TOP 10 MENGUNGSI PER KAB/KOTA ----
    const d2 = await fetch(URL_TOP10_MENGUNGSI);
    const j2 = await d2.json();

    top10Mengungsi.value = j2.features.map(f => ({
        kabupaten: f.attributes.kabupaten,
        value: f.attributes.value
    }));

    maxMengungsi.value = Math.max(
        ...top10Mengungsi.value.map(d => d.value)
    );
}

onMounted(loadData);
</script>

<template>
    <q-card flat>
        <div class="q-pa-md">
            <div class="text-subtitle1 text-black">Rekapitulasi Terdampak Bencana</div>


            <!-- ===== BARIS 1: DUA KOTAK STATISTIK ===== -->
            <div class="row q-col-gutter-sm q-mb-md q-mt-sm">
                <div class="col-6">
                    <q-card class="q-pa-sm">
                        <div class="text-caption text-grey">Total Meninggal</div>
                        <div class="text-h6 text-red q-mt-sm">
                            {{ totalMeninggal.toLocaleString() }}
                        </div>
                    </q-card>
                </div>

                <div class="col-6">
                    <q-card class="q-pa-sm">
                        <div class="text-caption text-grey">Jumlah Kab/Kota</div>
                        <div class="text-h6 text-primary q-mt-sm">
                            {{ allKabkotaData.length }}
                        </div>
                    </q-card>
                </div>
            </div>

            <div class="row q-col-gutter-sm q-mb-md">
                <div class="col-6">
                    <q-card class="q-pa-sm">
                        <div class="text-caption text-grey">Total Hilang</div>
                        <div class="text-h6 text-orange">
                            {{ totalHilang.toLocaleString() }}
                        </div>
                    </q-card>
                </div>

                <div class="col-6">
                    <q-card class="q-pa-sm">
                        <div class="text-caption text-grey">Total Mengungsi</div>
                        <div class="text-h6 text-secondary">
                            {{ totalMengungsi.toLocaleString() }}
                        </div>
                    </q-card>
                </div>
            </div>



            <!-- ===== BARIS 2: GRAFIK BATANG ===== -->
            <q-card class="q-pa-md">
                <div class="text-caption q-mb-sm">10 Kab/Kota dengan Jumlah Meninggal Dunia tertinggi</div>

                <div v-for="item in top10Meninggal" :key="item.kabupaten" class="q-mb-sm">
                    <div class="row justify-between text-caption">
                        <div>{{ item.kabupaten }}</div>
                        <div>{{ item.value.toLocaleString() }}</div>
                    </div>

                    <q-linear-progress :value="item.value / maxMeninggal" size="8px" rounded />
                </div>


            </q-card>

        </div>
    </q-card>
</template>
