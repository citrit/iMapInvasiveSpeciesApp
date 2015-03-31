var iMapMap = {
	olMap: null,
	locLayer: null,
	dragCtl: null,
	mapLayer: null,
	timerVar: null,
	init: function() {
	    // create map
		mapLayer = new OpenLayers.Layer.OSM("OpenStreetMap", null, {
            transitionEffect: 'resize'
        });
		olMap = new OpenLayers.Map({
	        div: "iMapMapdiv",
	        theme: null,
	        controls: [
	            new OpenLayers.Control.Attribution(),
	            new OpenLayers.Control.TouchNavigation({
	                dragPanOptions: {
	                    enableKinetic: true
	                }
	            })//,
	            //new OpenLayers.Control.Zoom()
	        ],
	        layers: [ mapLayer ],
	        zoom: 12
	    });
		olMap.setCenter( new OpenLayers.LonLat( -73.75, 42.68 )
		  		.transform(
		          new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
		          olMap.getProjectionObject() // to Spherical Mercator Projection
		        ), 11);
		//var markers = new OpenLayers.Layer.Markers( "Markers" );
	    //map.addLayer(markers);
		locLayer = new OpenLayers.Layer.Vector("locLayer", {
	        styleMap: new OpenLayers.StyleMap({
	            externalGraphic: "img/mobile-loc.png",
	            graphicOpacity: 1.0,
	            graphicWidth: 16,
	            graphicHeight: 26,
	            graphicYOffset: -26
	        })
	    });
		olMap.addLayer(locLayer);
		dragCtl = new OpenLayers.Control.ModifyFeature(locLayer); //dragComplete: function(	vertex	)
		olMap.addControl(dragCtl);
		dragCtl.activate();
	},
	// resize div
	fixSize: function(wid, hei) {
		console.log("MapResize W:"+wid+" H:"+hei);
		$("#iMapMapdiv").width(wid).height(hei - 10);
		olMap.updateSize();
	},
	// Set the position pin in the map
	setPosition: function(pos) {
		var lonLat = new OpenLayers.LonLat( pos[0], pos[1] )
	        .transform(
	          new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
	          olMap.getProjectionObject() // to Spherical Mercator Projection
	        );
		 var features = {
            "type": "FeatureCollection",
            "features": [
                { "type": "Feature", "geometry": {"type": "Point", "coordinates": [lonLat.lon, lonLat.lat]},
                    "properties": {"Name": "Current Location"}}
            ]
		 };
		 locLayer.removeAllFeatures();
		 var reader = new OpenLayers.Format.GeoJSON();
		 locLayer.addFeatures(reader.read(features));
		 olMap.setCenter (lonLat, 12);
	},
	clearMap: function() {
		console.log("====== ClearMap");
		locLayer.removeAllFeatures();
		dragCtl.resetVertices();
	},
	getObsLocation: function () {
		var pt = new OpenLayers.LonLat(locLayer.features[0].geometry.x, locLayer.features[0].geometry.y)
				.transform(
						olMap.getProjectionObject(), // to Spherical Mercator Projection,
						new OpenLayers.Projection("EPSG:4326") // transform from WGS 1984
		        );
		return [ pt.lon, pt.lat ];
	},
	setMapType: function(typ) {
		if (mapLayer) {
			console.log("Removing layer");
		   olMap.removeLayer(mapLayer);
		}
		console.log("Setting mapType: " + typ);
		if (typ == "road") {
			mapLayer = new OpenLayers.Layer.OSM("OpenStreetMap", null, {
	                transitionEffect: 'resize'
	            });
		}
		else {
			mapLayer = new OpenLayers.Layer.OSM("OpenCycleMap",
					  ["http://otile1.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.png",
					   "http://otile1.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.png",
					   "http://otile1.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.png"],
		            {
		                transitionEffect: "resize"
		            }
		        );
		}
		olMap.addLayer(mapLayer);
	},
	startGPSTimer: function() {
		console.log("Start timer");
		timerVar = setInterval(function(){iMapMap.getCurrentLocation()},10000);
	},
	stopGPSTimer: function() {
		console.log("Stop timer");
		clearTimeout(timerVar);
	},
	getCurrentLocation: function() {
		navigator.geolocation.getCurrentPosition(function (position) {
			//curobs.Where = [ position.coords.longitude, position.coords.latitude];
			iMapApp.debugMsg("Position: " + $.toJSON([ position.coords.longitude, position.coords.latitude]));
			//alert('found location: ' + $.toJSON(curobs.Where));
			iMapMap.setPosition([ position.coords.longitude, position.coords.latitude]);
		},
		function(err) {
			//curobs.Where = [ -73.8648, 42.7186 ];
			iMapApp.debugMsg("Position: " + $.toJSON([ -73.8648, 42.7186 ]));
			//alert('error location: ' + $.toJSON(curobs.Where));
			iMapMap.setPosition([ -73.8648, 42.7186 ]);
		},
		{maximumAge: 300000, timeout:2000, enableHighAccuracy : true}
	);
	}
}

//setTimeout(iMapMap.fixSize, 700);
//setTimeout(iMapMap.fixSize, 1500);