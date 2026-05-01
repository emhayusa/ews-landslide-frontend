import { defineStore } from 'pinia'
import { shallowRef } from 'vue'
import 'ol/ol.css'
import '@supermapgis/iclient-ol/dist/iclient-openlayers.min.css'
import Map from 'ol/Map'
import View from 'ol/View'

import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'

import { TileSuperMapRest, QueryByDistanceParameters, QueryService } from '@supermapgis/iclient-ol'
import { Point as OLPoint } from 'ol/geom'
import Feature from 'ol/Feature'
import VectorSource from 'ol/source/Vector'
import Text from 'ol/style/Text'

import Graticule from 'ol/layer/Graticule'
import Stroke from 'ol/style/Stroke'

import Overlay from 'ol/Overlay'

import DragRotate from 'ol/interaction/DragRotate'
import DragRotateAndZoom from 'ol/interaction/DragRotateAndZoom'
import Draw from 'ol/interaction/Draw'

import { fromLonLat, toLonLat, transformExtent } from 'ol/proj'
import { getLength, getArea } from 'ol/sphere'
import { LineString, Polygon } from 'ol/geom'

import Style from 'ol/style/Style'
import Fill from 'ol/style/Fill'
import CircleStyle from 'ol/style/Circle'


import { rbi, osm, topo, gray, imagery, bmkg_wind, cartodb } from '../pages/Peta/Basemap'

/* ======================================================
 * MAP STORE
 * ====================================================== */
export const useMapStore = defineStore('mapStore', {
  state: () => ({
    /* ================= MAP ================= */
    map: shallowRef(null),

    viewOptions: {
      center: fromLonLat([110.40, -7.15]), // Area Ungaran, Jawa Tengah
      zoom: 9,
      minZoom: 4.5, // Kunci level zoom-out mentok di skala ini
      extent: transformExtent([90, -15, 145, 10], 'EPSG:4326', 'EPSG:3857'), // Tembok extent batas pan / geser wilayah
      rotation: 0,
    },

    /* ================= LOADER ================= */
    loadingCount: 0,
    isLoading: false,

    /* ================= BASEMAP ================= */
    basemap: 'gray',
    opacity: 100,

    /* ================= POPUP / IDENTIFY ================= */
    popup: null,
    popupFeature: null,
    identifyResults: [], // Structured identify results
    identifyLoading: false,
    selectedStation: null,

    /* ================= GRATICULE ================= */
    graticule: null,
    graticuleVisible: true,

    /* ================= ROTATION ================= */
    rotationEnabled: false,
    dragRotate: null,
    dragRotateZoom: null,

    /* ================= OVERLAY LAYERS ================= */
    overlays: {
      gps: null,
      search: null,
    },

    /* ================= VIEW MODE ================= */
    is3D: false, // globe.gl (Lightweight 3D)
    is3DSuperMap: false, // iClient3D (Professional 3D)
    globeAltitude: 2.0, // Default altitude for globe.gl

    /* ================= MEASUREMENT & WEATHER ================= */
    weatherType: '', // 'angin', 'hujan', dll
    windAnimationEnabled: true, // Independent toggle for particle animation
    mapLabelsEnabled: true, // Toggle for CartoDB labels overlay
    measureLayer: shallowRef(null),
    measureDraw: shallowRef(null),
    measureSource: shallowRef(null),
    measureType: null,
    measureTooltip: null,
    measureTooltipElement: null,
    measureSketch: null,
    measureOverlays: [], // Store all tooltip overlays
    measureFeatures: [], // Store all measured features with their values

    /* ================= ALERTS ================= */
    selectedAlert: null,
    showAlertDetail: false,
    leftDrawerOpen: false,
    searchVisible: false,
    userLocation: null, // Store {lon, lat} for 3D synchronization
    stationSource: shallowRef(null),
    stationLayer: shallowRef(null),

    /* ================= OPERATIONAL LAYERS ================= */
    operational: [],
    layers: shallowRef([]),
  }),

  getters: {
    operationalLayers(state) {
      return state.layers.map((l) => ({
        id: l.get('id'),
        title: l.get('title'),
        visible: l.getVisible(),
        opacity: l.getOpacity(),
        type: l.get('type'),
      }))
    },

    identifyLayers(state) {
      return state.layers.filter((l) => l.get('identify') === true && l.getVisible())
    },
  },

  actions: {
    /* ======================================================
     * INIT MAP
     * ====================================================== */
    async initMap(targetEl) {
      this.map = new Map({
        target: targetEl,
        controls: [],
        view: new View(this.viewOptions),
      })

      /* ===== BASEMAP INITIALIZATION ===== */
      await this.applyBasemap(this.basemap)

      /* ===== OPERATIONAL DEFAULT ===== */
      this.addPrioritasLayer()

      /* ===== GRATICULE ===== */
      this.initGraticule()

      /* ===== ROTATION ===== */
      this.dragRotate = new DragRotate()
      this.dragRotateZoom = new DragRotateAndZoom()
    },

    /* ======================================================
     * LOADER
     * ====================================================== */
    setLoading(delta) {
      this.loadingCount += delta
      this.isLoading = this.loadingCount > 0
    },

    attachLoadingListener(layer) {
      const src = layer.getSource?.()
      if (!src) return

      const start = () => this.setLoading(1)
      const end = () => this.setLoading(-1)

      src.on('tileloadstart', start)
      src.on('tileloadend', end)
      src.on('tileloaderror', end)

      src.on('imageloadstart', start)
      src.on('imageloadend', end)
      src.on('imageloaderror', end)
    },

    /* ======================================================
     * GRATICULE
     * ====================================================== */
    initGraticule() {
      this.graticule = new Graticule({
        strokeStyle: new Stroke({
          color: 'rgba(39, 44, 57, 0.4)',
          width: 0.6,
          lineDash: [4, 4],
        }),
        showLabels: true,
      })

      this.graticule.setMap(this.map)
    },

    toggleGraticule() {
      this.graticuleVisible = !this.graticuleVisible
      this.graticule.setMap(this.graticuleVisible ? this.map : null)
    },

    /* ======================================================
     * ROTATION
     * ====================================================== */
    enableRotation() {
      if (this.rotationEnabled) return
      this.map.addInteraction(this.dragRotate)
      this.map.addInteraction(this.dragRotateZoom)
      this.rotationEnabled = true
    },

    disableRotation() {
      if (!this.rotationEnabled) return
      this.map.removeInteraction(this.dragRotate)
      this.map.removeInteraction(this.dragRotateZoom)
      this.map.getView().animate({ rotation: 0, duration: 300 })
      this.rotationEnabled = false
    },

    toggleRotation() {
      this.rotationEnabled ? this.disableRotation() : this.enableRotation()
    },

    toggle3D() {
      this.is3D = !this.is3D
      if (this.is3D) this.is3DSuperMap = false
      this.updateMapSize()
    },

    toggle3DSuperMap() {
      this.is3DSuperMap = !this.is3DSuperMap
      if (this.is3DSuperMap) this.is3D = false
      this.updateMapSize()
    },

    /* ======================================================
     * VIEW CONTROL
     * ====================================================== */
    homeExtent() {
      if (this.is3D || this.is3DSuperMap) {
        // Reset 3D view (shared coordinate trigger)
        this.userLocation = { lon: 118, lat: -2.5 }
      } else if (this.map) {
        this.map.getView().animate({
          center: this.viewOptions.center,
          zoom: this.viewOptions.zoom,
          duration: 300,
        })
      }
    },

    zoomIn() {
      if (this.is3D) {
        this.globeAltitude = Math.max(0.1, this.globeAltitude - 0.2)
        return
      }
      const v = this.map.getView()
      v.animate({ zoom: v.getZoom() + 1, duration: 200 })
    },

    zoomOut() {
      if (this.is3D) {
        this.globeAltitude = Math.min(5.0, this.globeAltitude + 0.2)
        return
      }
      const v = this.map.getView()
      v.animate({ zoom: v.getZoom() - 1, duration: 200 })
    },

    centerMap(lon, lat, zoom = 17) {
      this.userLocation = { lon, lat }

      if (!this.is3D && !this.is3DSuperMap && this.map) {
        this.map.getView().animate({
          center: fromLonLat([lon, lat]),
          zoom: zoom,
          duration: 1000,
        })
      }
      // 3D View will watch userLocation and react
    },

    /* ======================================================
     * OPERATIONAL LAYERS
     * ====================================================== */
    addKecamatanLayer() {
      // Not loaded by default
    },

    addPrioritasLayer() {
      const addedLayers = []
      this.operational.forEach((op) => {
        if (this.layers.find((l) => l.get('id') === op.id)) return

        const layer = new TileLayer({
          source: new TileSuperMapRest({
            url: op.url,
            wrapX: true,
            projection: 'EPSG:4326',
            transparent: true,
            format: 'png',
            cacheEnabled: false
          }),
          visible: op.visible,
          opacity: op.opacity,
        })

        layer.set('id', op.id)
        layer.set('title', op.title)
        layer.set('identify', true)
        layer.set('type', op.type)

        this.map.addLayer(layer)
        addedLayers.push(layer)
        this.attachLoadingListener(layer)
      })

      if (addedLayers.length > 0) {
        this.layers = [...this.layers, ...addedLayers]
        this.fetchLayerMetadata()
      }
    },

    toggleSubLayerVisibility(parentId, subId) {
      const opLayer = this.operational.find((l) => l.id === parentId)
      if (!opLayer || !opLayer.sublayers) return

      const sub = opLayer.sublayers.find((s) => s.id === subId)
      if (sub) sub.visible = !sub.visible

      // Reconstruct LAYERS param for SuperMap
      const visibleIds = opLayer.sublayers
        .filter((s) => s.visible)
        .map((s) => s.id)

      // Update OpenLayers layer (SuperMap uses layersID attribute e.g. "[0:1,2,3]")
      const olLayer = this.layers.find((l) => l.get('id') === parentId)
      if (olLayer) {
        const source = olLayer.getSource()
        if (visibleIds.length > 0) {
          source.updateParams({ layersID: `[0:${visibleIds.join(',')}]` })
        } else {
          source.updateParams({ layersID: `[0:none]` })
        }
      }
    },

    toggleSubLayerIdentify(parentId, subId) {
      const opLayer = this.operational.find((l) => l.id === parentId)
      if (!opLayer || !opLayer.sublayers) return

      const sub = opLayer.sublayers.find((s) => s.id === subId)
      if (sub) sub.identifiable = !sub.identifiable
    },

    async fetchLayerMetadata() {
      for (const op of this.operational) {
        const layer = this.layers.find((l) => l.get('id') === op.id)
        if (!layer) continue

        try {
          const res = await fetch(`${op.url}/layers.json`)
          const data = await res.json()

          console.log(`[Metadata] ${op.id} metadata:`, data)

          if (data && data.length > 0) {
            // In SuperMap iServer, data[0] is the root layer
            const rootLayer = data[0]
            const subData = rootLayer.subLayers ? rootLayer.subLayers.layers : data

            op.sublayers = subData.map((l, index) => ({
              // IMPORTANT: iServer needs numeric IDs (0, 1, 2...). 
              // String names (like map name) will cause a 400 error.
              id: l.id !== undefined && !isNaN(parseInt(l.id)) ? parseInt(l.id) : index,
              title: l.caption || l.name,
              visible: true,
              identifiable: true,
              name: l.name,
            }))

            const visibleIds = op.sublayers
              .filter((l) => l.visible)
              .map((l) => l.id)
              .join(',')

            console.log(`[Metadata] ${op.id} visible IDs: [0:${visibleIds}]`)

            const source = layer.getSource()
            if (source && typeof source.updateParams === 'function') {
              source.updateParams({ layersID: `[0:${visibleIds}]` })
            } else {
              console.warn(`[Metadata] Layer source for ${op.id} does not support updateParams`)
            }
          }
        } catch (err) {
          console.error(`[Metadata] Failed to fetch layer info for ${op.id}:`, err)
        }
      }
    },

    toggleLayerVisibility(id) {
      const layer = this.layers.find((l) => l.get('id') === id)
      if (layer) layer.setVisible(!layer.getVisible())

      const op = this.operational.find((o) => o.id === id)
      if (op) op.visible = !op.visible
    },

    async applyBasemap(id) {
      if (!this.map) return

      console.log('[Map] Applying basemap:', id)
      this.basemap = id

      const layers = this.map.getLayers().getArray()

      // 1. Find and remove existing basemap layers
      const basemapLayers = layers.filter(l => l.get('isBasemap') === true)
      if (basemapLayers.length > 0) {
        basemapLayers.forEach(l => this.map.removeLayer(l))
      }

      const source = this.getBasemapSource(id)
      if (source) {
        const baseLayer = new TileLayer({
          source: source,
          title: 'Basemap',
          opacity: this.opacity / 100,
          zIndex: 0
        })
        baseLayer.set('isBasemap', true)
        // Always insert at the bottom
        this.map.getLayers().insertAt(0, baseLayer)
      }
    },

    getBasemapSource(name) {
      switch (name) {
        case 'rbi': return rbi()
        case 'osm': return osm()
        case 'topo': return topo()
        case 'gray': return gray()
        case 'imagery': return imagery()
        case 'bmkg_wind': return bmkg_wind()
        case 'cartodb': return cartodb()
        default: return null
      }
    },

    openAlertDetail(alert) {
      console.log('[Map] Opening alert detail:', alert)
      this.selectedAlert = alert
      this.showAlertDetail = true
    },

    updateMapSize() {
      if (!this.map) return
      this.map.updateSize()
      this.map.renderSync()
    },

    setBasemap(id) {
      this.applyBasemap(id)
    },

    setOpacity(value) {
      this.opacity = value
    },

    setLayerOpacity(id, value) {
      const layer = this.layers.find((l) => l.get('id') === id)
      if (layer) layer.setOpacity(value)
    },

    zoomToLayer(id) {
      const layer = this.layers.find((l) => l.get('id') === id)
      const src = layer?.getSource?.()
      if (!src?.getExtent) return

      this.map.getView().fit(src.getExtent(), {
        padding: [50, 50, 50, 50],
        duration: 300,
      })
    },


    /* ======================================================
     * IDENTIFY (SUPERMAP REST)
     * ====================================================== */
    async identifySuperMap(layer, coordinate) {
      const id = layer.get('id')
      const opLayer = this.operational.find(o => o.id === id)
      if (!opLayer) return []

      // Transform coordinate from 3857 (map) to 4326 (service)
      const coord4326 = toLonLat(coordinate)

      // Get sub-layer names for targeted query
      let subLayerNames = opLayer.sublayers && opLayer.sublayers.length > 0
        ? opLayer.sublayers.map(s => s.name)
        : []

      // If no sublayers yet, try to extract from URL
      if (subLayerNames.length === 0) {
        const parts = opLayer.url.split('/')
        const lastPart = parts[parts.length - 1] // e.g. "jkt1_cctv@jkt1_cctv"
        if (lastPart) {
          subLayerNames = [lastPart]
          // If it contains @, also add the base name as a fallback
          if (lastPart.includes('@')) {
            subLayerNames.push(lastPart.split('@')[0])
          }
        }
      }

      console.log(`[Identify] Querying ${opLayer.id} using names:`, subLayerNames)

      return new Promise((resolve) => {
        try {
          const queryParams = new QueryByDistanceParameters({
            queryParams: subLayerNames.map(name => ({ name })),
            geometry: new OLPoint(coord4326),
            distance: 0.002, // Slightly larger tolerance for mobile/small points (~220m)
            returnContent: true
          })

          new QueryService(opLayer.url).queryByDistance(queryParams, (serviceResult) => {
            if (serviceResult.type === "processCompleted" && serviceResult.result.recordsets) {
              const allFeatures = []
              serviceResult.result.recordsets.forEach(rs => {
                if (rs.features && rs.features.features) {
                  rs.features.features.forEach(f => {
                    allFeatures.push({
                      layerName: rs.datasetName || opLayer.title,
                      attributes: f.properties || {}
                    })
                  })
                }
              })
              resolve(allFeatures)
            } else {
              resolve([])
            }
          })
        } catch (err) {
          console.error('[Identify] SuperMap identify error:', err)
          resolve([])
        }
      })
    },

    identifyWMS(layer, coordinate, resolution, popupEl) {
      const source = layer.getSource()
      const url = source.getFeatureInfoUrl(coordinate, resolution, 'EPSG:3857', {
        INFO_FORMAT: 'application/json',
      })

      if (!url) return

      fetch(url)
        .then((r) => r.json())
        .then((json) => {
          popupEl.innerHTML = JSON.stringify(json.features[0].properties, null, 2)
        })
    },

    async identifyWMSAsync(layer, coordinate, resolution) {
      const source = layer.getSource()
      const url = source.getFeatureInfoUrl(coordinate, resolution, 'EPSG:3857', {
        INFO_FORMAT: 'application/json',
      })

      if (!url) return []

      try {
        const res = await fetch(url)
        const json = await res.json()
        if (!json.features?.length) return []

        return json.features.map((f) => ({
          layerName: layer.get('title') || 'WMS Layer',
          attributes: f.properties,
        }))
      } catch (err) {
        console.error('[Identify] WMS error:', err)
        return []
      }
    },

    identifyVector(evt, popupEl) {
      this.map.forEachFeatureAtPixel(evt.pixel, (feature) => {
        popupEl.innerHTML = JSON.stringify(feature.getProperties(), null, 2)
      })
    },

    closePopup() {
      this.identifyResults = []
      this.selectedStation = null
      this.popup?.setPosition(undefined)
    },

    enableIdentify(popupEl) {
      this.popup = new Overlay({
        element: popupEl,
        positioning: 'bottom-center',
        offset: [0, -10],
        autoPan: false, // Disable autoPan to use our explicit centering
      })

      this.map.addOverlay(this.popup)
      this.map.on('singleclick', async (evt) => {
        console.log('[Identify] Map clicked at:', evt.coordinate)

        /* ===== Skip identify when measurement is active ===== */
        if (this.measureType) {
          console.log('[Identify] Skipped: measurement active')
          return
        }

        const coordinate = evt.coordinate
        const view = this.map.getView()

        // Force update map size to ensure centering uses current dimensions
        this.map.updateSize()

        // Explicitly center the map on the clicked coordinate
        view.animate({
          center: coordinate,
          duration: 400,
          easing: (t) => t * (2 - t), // easeOut
        })

        /* ===== Clear previous results ===== */
        this.identifyResults = []
        this.selectedStation = null
        this.popup.setPosition(undefined)

        /* ===== Find identifiable layers ===== */
        const identifyLayers = this.layers.filter(
          (l) => l.get('identify') === true && l.getVisible(),
        )

        console.log('[Identify] Identifiable active layers found:', identifyLayers.length)

        /* ===== Execute identify for each layer ===== */
        this.identifyLoading = (identifyLayers.length > 0)
        const allResults = []

        // Check for vector features (Stations)
        this.map.forEachFeatureAtPixel(evt.pixel, (feature) => {
          const station = feature.get('station')
          if (station) {
            this.selectedStation = station
            allResults.push({
              layerName: 'Station Information',
              attributes: {
                'Station ID': station.station_id,
                'Nama': station.name,
                'Jenis': station.hardware_type,
                'Status': station.status,
                'Lokasi': station.location
              }
            })
          }
        })

        for (const layer of identifyLayers) {
          const source = layer.getSource()
          const resolution = view.getResolution() // Re-fetch to ensure scope visibility
          console.log('[Identify] Querying layer:', layer.get('title'))

          if (source instanceof TileSuperMapRest) {
            const results = await this.identifySuperMap(layer, coordinate)
            console.log(`[Identify] Layer ${layer.get('title')} returned ${results.length} results`)
            allResults.push(...results)
          } else if (source?.getFeatureInfoUrl) {
            const results = await this.identifyWMSAsync(layer, coordinate, resolution)
            allResults.push(...results)
          }
        }

        this.identifyLoading = false
        console.log('[Identify] Total results:', allResults.length)

        /* ===== Only show popup if we have results ===== */
        if (allResults.length > 0) {
          // If we have a station result, we might want to prioritize it or handle separately
          const stationResult = allResults.find(r => r.layerName === 'Station Information')
          if (stationResult) {
            // We can use the station object stored in feature earlier if we pass it correctly
            // For now, let's just use the first station found
          }

          this.identifyResults = allResults
          this.popup.setPositioning('bottom-center')
          this.popup.setOffset([0, -10])
          this.popup.setPosition(coordinate)
        }
      })
    },

    /* ======================================================
     * MEASUREMENT
     * ====================================================== */
    enableMeasurement(type) {
      console.log('[Measurement] Enabling:', type)

      /* ===== Remove existing draw interaction only ===== */
      if (this.measureDraw) {
        this.map.removeInteraction(this.measureDraw)
        this.measureDraw = null
      }

      /* ===== Remove active tooltip ===== */
      if (this.measureTooltip) {
        this.map.removeOverlay(this.measureTooltip)
        this.measureTooltip = null
      }

      if (this.measureTooltipElement) {
        this.measureTooltipElement.parentNode?.removeChild(this.measureTooltipElement)
        this.measureTooltipElement = null
      }

      this.measureSketch = null

      /* ===== Create vector source and layer ONLY if not exists ===== */
      if (!this.measureSource) {
        this.measureSource = new VectorSource()
      }

      if (!this.measureLayer) {
        this.measureLayer = new VectorLayer({
          source: this.measureSource,
          style: this.getMeasurementStyle(),
          zIndex: 1000,
        })
        this.map.addLayer(this.measureLayer)
      }

      this.measureType = type

      /* ===== Create draw interaction ===== */
      const drawType = type === 'distance' ? 'LineString' : 'Polygon'
      this.measureDraw = new Draw({
        source: this.measureSource,
        type: drawType,
        freehand: false,
        style: this.getDrawingStyle(),
      })

      /* ===== Event: drawstart ===== */
      this.measureDraw.on('drawstart', (evt) => {
        this.measureSketch = evt.feature
        const geom = this.measureSketch.getGeometry()

        /* ===== Create live tooltip ===== */
        this.createMeasureTooltip()

        /* ===== Listen to geometry changes ===== */
        geom.on('change', (evt) => {
          const geom = evt.target
          const output = this.formatMeasurement(geom, type)

          if (this.measureTooltipElement) {
            this.measureTooltipElement.innerHTML = output
            this.measureTooltip.setPosition(geom.getLastCoordinate())
          }
        })
      })

      /* ===== Event: drawend ===== */
      this.measureDraw.on('drawend', (evt) => {
        const geom = evt.feature.getGeometry()
        const output = this.formatMeasurement(geom, type)
        const label = type === 'distance' ? 'Jarak' : 'Luas'

        /* ===== Make tooltip static ===== */
        if (this.measureTooltipElement) {
          this.measureTooltipElement.className = 'ol-tooltip ol-tooltip-static'
          this.measureTooltipElement.innerHTML = output
        }

        this.measureTooltip.setOffset([0, -7])

        /* ===== Store overlay for later removal ===== */
        this.measureOverlays.push(this.measureTooltip)

        /* ===== Store feature with metadata ===== */
        evt.feature.set('measurement', output)
        evt.feature.set('type', type)
        this.measureFeatures.push({
          feature: evt.feature,
          value: output,
          type: type,
        })

        /* ===== Reset for next measurement ===== */
        this.measureSketch = null
        this.measureTooltipElement = null
        this.measureTooltip = null

        /* ===== Create new tooltip for next drawing ===== */
        this.createMeasureTooltip()

        console.log(`[Measurement] ${label}: ${output}`)
      })

      /* ===== Add draw interaction to map ===== */
      this.map.addInteraction(this.measureDraw)

      console.log('[Measurement] Enabled - Click to start measuring')
    },

    disableMeasurement() {
      console.log('[Measurement] Disabling...')

      /* ===== Remove draw interaction ===== */
      if (this.measureDraw) {
        this.map.removeInteraction(this.measureDraw)
        this.measureDraw = null
      }

      /* ===== Remove active tooltip ===== */
      if (this.measureTooltip) {
        this.map.removeOverlay(this.measureTooltip)
        this.measureTooltip = null
      }

      if (this.measureTooltipElement) {
        this.measureTooltipElement.parentNode?.removeChild(this.measureTooltipElement)
        this.measureTooltipElement = null
      }

      this.measureSketch = null
      this.measureType = null

      console.log('[Measurement] Disabled')
    },

    clearMeasurements() {
      console.log('[Measurement] Clearing all measurements...')
      console.log('[Measurement] Features to clear:', this.measureFeatures.length)
      console.log('[Measurement] Overlays to clear:', this.measureOverlays.length)

      /* ===== Remove all static tooltips/overlays ===== */
      if (this.measureOverlays && this.measureOverlays.length > 0) {
        this.measureOverlays.forEach((overlay) => {
          if (overlay) {
            this.map.removeOverlay(overlay)
          }
        })
        this.measureOverlays = []
      }

      /* ===== Clear all features from source ===== */
      if (this.measureSource) {
        // Get all features first
        const allFeatures = this.measureSource.getFeatures()
        console.log('[Measurement] Source has', allFeatures.length, 'features')

        // Clear source completely
        this.measureSource.clear()
      }

      /* ===== Clear features array ===== */
      this.measureFeatures = []

      console.log('[Measurement] All measurements cleared successfully')
    },

    removeMeasurement(index) {
      if (index < 0 || index >= this.measureFeatures.length) return

      const item = this.measureFeatures[index]

      /* ===== Remove feature from source ===== */
      if (this.measureSource && item.feature) {
        this.measureSource.removeFeature(item.feature)
      }

      /* ===== Remove overlay ===== */
      if (this.measureOverlays[index]) {
        this.map.removeOverlay(this.measureOverlays[index])
      }

      /* ===== Remove from arrays ===== */
      this.measureFeatures.splice(index, 1)
      this.measureOverlays.splice(index, 1)

      console.log('[Measurement] Removed measurement at index:', index)
    },

    /* ======================================================
     * MEASUREMENT HELPERS
     * ====================================================== */
    createMeasureTooltip() {
      /* ===== Remove existing tooltip element ===== */
      if (this.measureTooltipElement) {
        this.measureTooltipElement.parentNode?.removeChild(this.measureTooltipElement)
      }

      /* ===== Create new tooltip element ===== */
      this.measureTooltipElement = document.createElement('div')
      this.measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure'

      /* ===== Create overlay ===== */
      this.measureTooltip = new Overlay({
        element: this.measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center',
        stopEvent: false,
        insertFirst: false,
      })

      this.map.addOverlay(this.measureTooltip)
    },

    formatMeasurement(geom, type) {
      let output = ''

      if (type === 'distance' || geom instanceof LineString) {
        const length = getLength(geom, { projection: 'EPSG:3857' })
        if (length > 1000) {
          output = `${(length / 1000).toFixed(2)} km`
        } else {
          output = `${length.toFixed(2)} m`
        }
      } else if (type === 'area' || geom instanceof Polygon) {
        const area = getArea(geom, { projection: 'EPSG:3857' })
        if (area > 1000000) {
          output = `${(area / 1000000).toFixed(2)} km²`
        } else if (area > 10000) {
          output = `${(area / 10000).toFixed(2)} ha`
        } else {
          output = `${area.toFixed(2)} m²`
        }
      }

      return output
    },

    getMeasurementStyle() {
      return new Style({
        fill: new Fill({
          color: 'rgba(255, 204, 51, 0.2)',
        }),
        stroke: new Stroke({
          color: '#ffcc33',
          width: 3,
        }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: '#ffcc33',
          }),
          stroke: new Stroke({
            color: '#fff',
            width: 2,
          }),
        }),
      })
    },

    /* ======================================================
     * STATION MARKERS
     * ====================================================== */
    setStations(stations) {
      if (!this.map) return

      console.log(`[Map] Refreshing ${stations.length} stations...`);

      if (!this.stationSource) {
        this.stationSource = new VectorSource()
      }

      if (!this.stationLayer) {
        this.stationLayer = new VectorLayer({
          source: this.stationSource,
          zIndex: 2000,
        })
        this.map.addLayer(this.stationLayer)
      }

      // Force a full clear and notify listeners
      this.stationSource.clear(true)

      const roverCount = { count: 0 }
      let addedCount = 0;

      stations.forEach((st) => {
        try {
          if (!st.longitude || !st.latitude) return;

          const coords = fromLonLat([Number(st.longitude), Number(st.latitude)]);
          const feature = new Feature({
            geometry: new OLPoint(coords),
            station: st
          })

          let label = ""
          if (st.hardware_type === 'BASE') {
            label = "B"
          } else {
            roverCount.count++
            label = `R${roverCount.count}`
          }

          feature.setStyle(this.getStationStyle(st, label))
          this.stationSource.addFeature(feature)
          addedCount++;
        } catch (err) {
          console.error(`[Map] Error adding station ${st.name}:`, err);
        }
      })

      console.log(`[Map] Rendered ${addedCount} stations.`);
      this.map.render();
      this.map.renderSync();
    },

    getStationStyle(st, label) {
      let color = '#64748b' // Offline
      if (st.hardware_type === 'BASE') {
        color = '#1d4ed8' // Base Blue
      } else {
        if (st.status === 'ACTIVE') color = '#16a34a' // Normal Green
        else if (st.status === 'MAINTENANCE') color = '#ef4444' // Bahaya Red
      }

      return new Style({
        image: new CircleStyle({
          radius: 14,
          fill: new Fill({ color: color }),
          stroke: new Stroke({ color: '#ffffff', width: 2 })
        }),
        text: new Text({
          text: label,
          fill: new Fill({ color: '#ffffff' }),
          font: 'bold 12px Inter, sans-serif',
          textAlign: 'center',
          textBaseline: 'middle'
        })
      })
    },

    getDrawingStyle() {
      return new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)',
        }),
        stroke: new Stroke({
          color: 'rgba(0, 0, 0, 0.5)',
          lineDash: [10, 10],
          width: 2,
        }),
        image: new CircleStyle({
          radius: 5,
          stroke: new Stroke({
            color: 'rgba(0, 0, 0, 0.7)',
          }),
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)',
          }),
        }),
      })
    },
  },
})
