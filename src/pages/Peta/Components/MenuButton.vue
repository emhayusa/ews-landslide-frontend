<script setup>
const emit = defineEmits(['click'])

const handleToggle = () => {
    //console.log('Menu toggle clicked')
    emit('click') // 🔥 send event to parent
}
</script>

<template>
    <q-card flat class="absolute-top-left q-ma-md">
        <div class="flex flex-center bg-darker-slate text-white" style="height: 55px;  border-radius: 8px;">
            <q-btn flat color="primary" size="lg" no-caps @click="handleToggle">
                <q-icon left size="1.5em" name="dashboard" />
                <div>Menu</div>
            </q-btn>
        </div>
    </q-card>
</template>
