import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the directory exists in the public folder to be served as an API
const outputDir = path.join(__dirname, '../../../public/api/wind');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const timestamp = '1712710800'; // Match what's in gfs.json
const spacing = 2;
const forecastOptions = Array.from({ length: 49 }, (_, i) => i * 0.5);

console.log(`Generating JSON payloads for ${forecastOptions.length} forecast hours...`);

for (const hour of forecastOptions) {
    const grid = [];
    // Cyclones move over time based on the 'hour' offset
    const cyclones = [
      { lat: -8 + (hour * 0.2), lon: 105 + (hour * 0.5), strength: -40, radius: 10 },
      { lat: 5 + (hour * 0.3), lon: 125 - (hour * 0.4), strength: 30, radius: 15 }
    ];

    for (let lat = -15; lat <= 15; lat += spacing) {
      for (let lon = 90; lon <= 145; lon += spacing) {
        let u = 15 * Math.sin(lat / 5) - 5; 
        let v = 10 * Math.cos(lon / 10) + 5 * Math.sin(lat / 3);
        
        cyclones.forEach(cyclone => {
          const dx = lon - cyclone.lon;
          const dy = lat - cyclone.lat;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < cyclone.radius && dist > 1) {
            const force = cyclone.strength * (1 - dist / cyclone.radius);
            u += (-dy / dist) * force;
            v += (dx / dist) * force;
          }
        });
        
        // Round to 3 decimals to save file size while preserving animation smoothness
        grid.push({ lat, lon, u: Math.round(u*1000)/1000, v: Math.round(v*1000)/1000 });
      }
    }
    
    const payload = {
      header: { timestamp, hour, parameter: 'wind', level: '10m' },
      data: grid
    };

    const fileName = `${timestamp}_${hour.toString().replace('.', '_')}.json`;
    fs.writeFileSync(path.join(outputDir, fileName), JSON.stringify(payload));
}

console.log(`Successfully wrote ${forecastOptions.length} static JSON files to ${outputDir}`);
