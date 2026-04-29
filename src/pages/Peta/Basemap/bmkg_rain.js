import XYZ from "ol/source/XYZ";

function bmkg_rain() {
    return new XYZ({
        url: "https://signature.bmkg.go.id/api21/mpl_req/ecmwf/rr/1000/2026041012/2026041100/{z}/{x}/{-y}.png?ci=1&overlays=contourf",
        attributions: 'BMKG ECMWF Rain © <a target="_blank" href="https://signature.bmkg.go.id/">BMKG</a>',
        crossOrigin: "Anonymous"
    })
}

export default bmkg_rain;
