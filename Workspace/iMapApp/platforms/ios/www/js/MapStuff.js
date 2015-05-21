var iMapMap = {
	olMap: null,
	locLayer: null,
	dragCtl: null,
	mapLayer: null,
	timerVar: null,
	init: function() {
	    // create map
		iMapMap.mapLayer = new OpenLayers.Layer.OSM("OpenStreetMap", null, {
            transitionEffect: 'resize'
        });
		iMapMap.olMap = new OpenLayers.Map({
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
	        layers: [ iMapMap.mapLayer ],
	        zoom: 12
	    });
		iMapMap.olMap.setCenter( new OpenLayers.LonLat( -73.75, 42.68 )
		  		.transform(
		          new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
		          iMapMap.olMap.getProjectionObject() // to Spherical Mercator Projection
		        ), 13);
		//var markers = new OpenLayers.Layer.Markers( "Markers" );
	    //map.addLayer(markers);
		iMapMap.locLayer = new OpenLayers.Layer.Vector("locLayer", {
	        styleMap: new OpenLayers.StyleMap({
	            externalGraphic: "img/mobile-loc.png",
	            graphicOpacity: 1.0,
	            graphicWidth: 16,
	            graphicHeight: 26,
	            graphicYOffset: -26
	        })
	    });
		iMapMap.olMap.addLayer(iMapMap.locLayer);
		iMapMap.dragCtl = new OpenLayers.Control.ModifyFeature(iMapMap.locLayer); //dragComplete: function(	vertex	)
		iMapMap.olMap.addControl(iMapMap.dragCtl);
		iMapMap.dragCtl.activate();
	},
	// resize div
	fixSize: function(wid, hei) {
		console.log("MapResize W:"+wid+" H:"+hei);
		$("#iMapMapdiv").width(wid).height(hei - 10);
		iMapMap.olMap.updateSize();
	},
	// Set the position pin in the map
	setPosition: function(pos) {
		var lonLat = new OpenLayers.LonLat( pos[0], pos[1] )
	        .transform(
	          new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
	          iMapMap.olMap.getProjectionObject() // to Spherical Mercator Projection
	        );
		 var features = {
            "type": "FeatureCollection",
            "features": [
                { "type": "Feature", "geometry": {"type": "Point", "coordinates": [lonLat.lon, lonLat.lat]},
                    "properties": {"Name": "Current Location"}}
            ]
		 };
		 iMapMap.locLayer.removeAllFeatures();
		 var reader = new OpenLayers.Format.GeoJSON();
		 iMapMap.locLayer.addFeatures(reader.read(features));
		 iMapMap.olMap.setCenter (lonLat);
	},
	clearMap: function() {
		console.log("====== ClearMap");
		iMapMap.locLayer.removeAllFeatures();
		iMapMap.dragCtl.resetVertices();
	},
	getObsLocation: function () {
		var pt = new OpenLayers.LonLat(iMapMap.locLayer.features[0].geometry.x, iMapMap.locLayer.features[0].geometry.y)
				.transform(
						iMapMap.olMap.getProjectionObject(), // to Spherical Mercator Projection,
						new OpenLayers.Projection("EPSG:4326") // transform from WGS 1984
		        );
		return [ pt.lon, pt.lat ];
	},
	setMapType: function(typ) {
		if (iMapMap.mapLayer) {
			console.log("Removing layer");
			iMapMap.olMap.removeLayer(iMapMap.mapLayer);
		}
		console.log("Setting mapType: " + typ);
		if (typ == "road") {
			iMapMap.mapLayer = new OpenLayers.Layer.OSM("OpenStreetMap", null, {
	                transitionEffect: 'resize'
	            });
		}
		else {
			iMapMap.mapLayer = new OpenLayers.Layer.OSM("OpenCycleMap",
					  ["http://otile1.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.png",
					   "http://otile1.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.png",
					   "http://otile1.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.png"],
		            {
		                transitionEffect: "resize"
		            }
		        );
		}
		iMapMap.olMap.addLayer(iMapMap.mapLayer);
	},
	startGPSTimer: function() {
		console.log("Start the timer");
		if (iMapMap.timerVar == null)
			iMapMap.timerVar = navigator.geolocation.watchPosition(iMapMap.getCurrentLocation, iMapMap.onError,
                { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
	},
	stopGPSTimer: function() {
		console.log("Stop the timer");
		navigator.geolocation.clearWatch(iMapMap.timerVar);
		iMapMap.timerVar = null;
	},
	getCurrentLocation: function(position) {
		//curobs.Where = [ position.coords.longitude, position.coords.latitude];
		iMapApp.debugMsg("Position: " + $.toJSON([ position.coords.longitude, position.coords.latitude]));
		//alert('found location: ' + $.toJSON(curobs.Where));
		iMapMap.setPosition([ position.coords.longitude, position.coords.latitude]);
	},
    // onSuccess Callback
    //   This method accepts a `Position` object, which contains
    //   the current GPS coordinates
    //
    onSuccess: function (position) {
        $('#geolocation').val('Latitude: '  + position.coords.latitude      + '<br />' +
        'Longitude: ' + position.coords.longitude     + '<br />' +
        '<hr />'      + element.innerHTML);
    },
    
    // onError Callback receives a PositionError object
    //
    onError: function (error) {
        navigator.notification.alert(
                                     'GPS is turned off, please enable.',  // message
                                     null,         // callback
                                     'code: '    + error.code,            // title
                                     'Ok'                  // buttonName
                                     );
        
    }

}

//setTimeout(iMapMap.fixSize, 700);
//setTimeout(iMapMap.fixSize, 1500);