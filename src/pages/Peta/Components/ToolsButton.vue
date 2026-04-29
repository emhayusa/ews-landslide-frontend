<template>
    <q-card flat class="absolute-bottom-right q-ma-md" style="margin-bottom: 310px;">
        <div class="flex flex-center bg-darker-slate text-white" style="width: 40px; height: 40px; border-radius: 8px;">
            <q-btn round flat icon="settings" color="primary" @click="$emit('click')" />
        </div>
    </q-card>
</template>

<script setup>
defineEmits(['click'])
</script>
