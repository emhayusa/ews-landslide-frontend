<script setup>
import { ref } from "vue";

const kategori = ref("dki_jakarta"); // default aktif
</script>

<template>
    <q-card flat class=" q-ma-md">
        <!-- Header -->
        <div class="row items-center bg-darker-slate text-white q-px-md" style=" border-radius: 8px;">

            <div class="row items-center q-mr-md">
                <div class="text-caption text-grey-7">
                    Wilayah UPT:

                </div>
            </div>

            <!-- RIGHT COLUMN : Text -->
            <div class="row">


                <q-chip clickable :color="kategori === 'dki_jakarta' ? 'primary' : 'grey-4'"
                    :text-color="kategori === 'dki_jakarta' ? 'white' : 'black'" @click="kategori = 'dki_jakarta'">
                    DKI Jakarta
                </q-chip>

                <q-chip clickable :color="kategori === 'jawa_barat' ? 'green' : 'grey-4'"
                    :text-color="kategori === 'jawa_barat' ? 'white' : 'black'" @click="kategori = 'hunian'">
                    Jawa Barat
                </q-chip>

                <q-chip clickable :color="kategori === 'jawa_tengah' ? 'amber' : 'grey-4'"
                    :text-color="kategori === 'jawa_tengah' ? 'black' : 'black'" @click="kategori = 'ekonomi'">
                    Jawa Tengah
                </q-chip>
            </div>
        </div>

    </q-card>
</template>
