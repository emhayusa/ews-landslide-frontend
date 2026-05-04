import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useStreamStore = defineStore('streamStore', () => {
  const socket = ref(null);
  const latestData = ref(null);
  const latestSensorData = ref(null);
  const isConnected = ref(false);

  function connect() {
    if (socket.value) return;

    // Use environment variable if available, otherwise fallback
    let wsUrl = '';
    if (import.meta.env.VITE_API_URL) {
      wsUrl = import.meta.env.VITE_API_URL.replace('http', 'ws') + 'ws';
    } else {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.hostname;
      const port = 8080;
      wsUrl = `${protocol}//${host}:${port}/api/v1/ws`;
    }

    console.log('[WS] Connecting to:', wsUrl);
    socket.value = new WebSocket(wsUrl);

    socket.value.onopen = () => {
      console.log('[WS] Connected');
      isConnected.value = true;
    };

    socket.value.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle different message types from the single backend WS
        if (data.type === 'deformation') {
          latestSensorData.value = data.data; // The payload from sensor WS
        } else if (data.type === 'weather') {
          latestData.value = data; // The payload from MQTT
        } else {
          // Fallback for older messages or unknown types
          latestData.value = data;
        }
      } catch (err) {
        console.error('[WS] Parse error:', err);
      }
    };

    socket.value.onclose = () => {
      console.log('[WS] Disconnected, retrying in 5s...');
      isConnected.value = false;
      socket.value = null;
      setTimeout(connect, 5000);
    };

    socket.value.onerror = (err) => {
      console.error('[WS] Error:', err);
      socket.value.close();
    };
  }

  function disconnect() {
    if (socket.value) {
      socket.value.close();
      socket.value = null;
    }
  }

  return {
    latestData,
    latestSensorData,
    isConnected,
    isSensorConnected: isConnected, // Map to same status
    connect,
    disconnect
  };
});
