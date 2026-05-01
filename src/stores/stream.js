import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useStreamStore = defineStore('streamStore', () => {
  const socket = ref(null);
  const sensorSocket = ref(null);
  const latestData = ref(null);
  const latestSensorData = ref(null);
  const isConnected = ref(false);
  const isSensorConnected = ref(false);

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
        latestData.value = data;
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

  function connectSensor() {
    if (sensorSocket.value) return;

    const wsUrl = 'ws://36.92.41.75:8000/ws/data?ref=CSEM&obs=UNGR';
    console.log('[Sensor WS] Connecting to:', wsUrl);
    
    sensorSocket.value = new WebSocket(wsUrl);

    sensorSocket.value.onopen = () => {
      console.log('[Sensor WS] Connected');
      isSensorConnected.value = true;
    };

    sensorSocket.value.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        latestSensorData.value = data;
      } catch (err) {
        console.error('[Sensor WS] Parse error:', err);
      }
    };

    sensorSocket.value.onclose = () => {
      console.log('[Sensor WS] Disconnected, retrying in 5s...');
      isSensorConnected.value = false;
      sensorSocket.value = null;
      setTimeout(connectSensor, 5000);
    };

    sensorSocket.value.onerror = (err) => {
      console.error('[Sensor WS] Error:', err);
      sensorSocket.value.close();
    };
  }

  function disconnect() {
    if (socket.value) {
      socket.value.close();
      socket.value = null;
    }
    if (sensorSocket.value) {
      sensorSocket.value.close();
      sensorSocket.value = null;
    }
  }

  return {
    latestData,
    latestSensorData,
    isConnected,
    isSensorConnected,
    connect,
    connectSensor,
    disconnect
  };
});
