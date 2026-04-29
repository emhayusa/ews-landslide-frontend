<template>
    <q-card flat class="absolute-top-right q-ma-md shadow-2" style="margin-right: 190px; z-index: 10;">
        <div class="flex flex-center bg-darker-slate text-white" style="height: 55px; border-radius: 8px; padding: 0 8px;">
            <q-btn flat :color="modelValue ? 'primary' : 'grey-7'" no-caps @click="$emit('update:modelValue', !modelValue)">
                <q-icon left size="1.5em" :name="modelValue ? 'visibility' : 'visibility_off'" />
                <div class="text-weight-bold">{{ modelValue ? 'Sembunyikan Widget Informasi' : 'Tampilkan Widget Informasi' }}</div>
            </q-btn>
        </div>
    </q-card>
</template>

<script setup>
defineProps(['modelValue'])
defineEmits(['update:modelValue'])
</script>
