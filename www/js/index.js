//get your api keys from HERE map dashboard

var platform = new H.service.Platform({
	app_id: "xxx",
	app_code: "xxx"
});
const map = new H.Map(
	document.getElementById("map"),
	platform.createDefaultLayers().normal.map, {
		zoom: 10,
		center: { lat: 44.842937, lng: -93.140247 }
	}
);
const mapEvent = new H.mapevents.MapEvents(map);
const mapBehaviour = new H.mapevents.Behavior(mapEvent);
// const lineString = new H.geo.LineString();
// lineString.pushPoint({ lat: 37, lng: -121 });
// lineString.pushPoint({ lat: 37.2, lng: -121.002 });
// lineString.pushPoint({ lat: 37.2, lng: -121.2 });
// lineString.pushPoint({ lat: 37, lng: -121 });
const circle = new H.map.Circle(
	// The central point of the circle
	{ lat: 44.842937, lng: -93.140247 },
	// The radius of the circle in meters
	500
);
//const polygon = new H.map.Circle(lineString);
map.addObject(circle);
const geometry = circle.getGeometry();
const wkt = geometry.toString();
const zip = new JSZip();
zip.file("data.wkt", "NAME\tWKT\n" + "HMTTFence" + "\t" + wkt);
zip.generateAsync({ type: "blob" }).then(
	content => {
		var formData = new FormData();
		formData.append("zipfile", content);
		axios
			.post("https://gfe.api.here.com/2/layers/upload.json", formData, {
				headers: {
					"content-type": "multipart/form-data"
				},
				params: {
					app_id: "xxx",
					app_code: "xxx",
					layer_id: "5678"
				}
			})
			.then(
				result => {
					console.log(result);
				},
				error => {
					console.log(error);
				}
			);
	},
	error => {
		console.log(error);
	}
);

function setMarker(lat, lng) {
	var marker = new H.map.Marker({ lat, lng });
	var geofencing = platform.getGeofencingService();
	map.addObject(marker);
	//map.addEventListener("tap", ev => {
	map.removeObject(marker);
	// marker = new H.map.Marker(
	//   map.screenToGeo(ev.currentPointer.viewportX, ev.currentPointer.viewportY)
	// );
	map.addObject(marker);
	geofencing.request(
		H.service.extension.geofencing.Service.EntryPoint.SEARCH_PROXIMITY, {
			layer_ids: ["5678"],
			proximity: marker.getPosition().lat + "," + marker.getPosition().lng,
			key_attributes: ["NAME"]
		},
		result => {
			if (result.geometries.length > 0) {
				console.log("within geofence");
			} else {
				console.log("outSide");
			}
		},
		error => {
			console.log("error");
		}
	);
	//});
}
setInterval(() => {
	navigator.geolocation.getCurrentPosition(function(position) {
		var lat = position.coords.latitude;
		var lng = position.coords.longitude;
		setMarker(lat, lng);
	});
}, 10000);