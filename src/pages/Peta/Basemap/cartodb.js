import XYZ from "ol/source/XYZ";

function cartodb() {
    return new XYZ({
        url: "https://cartodb-basemaps-c.global.ssl.fastly.net/rastertiles/voyager_only_labels/{z}/{x}/{y}.png",
        attributions: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        crossOrigin: "Anonymous"
    })
}

export default cartodb;
