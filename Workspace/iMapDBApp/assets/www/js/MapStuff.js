var iMapMap = {
	olMap: null,
	locLayer: null,
	init: function() {
	    // create map
		olMap = new OpenLayers.Map({
	        div: "iMapMapdiv",
	        theme: null,
	        controls: [
	            new OpenLayers.Control.Attribution(),
	            new OpenLayers.Control.TouchNavigation({
	                dragPanOptions: {
	                    enableKinetic: true
	                }
	            }),
	            new OpenLayers.Control.Zoom()
	        ],
	        layers: [
	            new OpenLayers.Layer.OSM("OpenStreetMap", null, {
	                transitionEffect: 'resize'
	            })
	        ],
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
		var dragCtl = new OpenLayers.Control.ModifyFeature(locLayer);
		olMap.addControl(dragCtl);
		dragCtl.activate();
	},
	// Get rid of address bar on iphone/ipod
	fixSize: function() {
	    window.scrollTo(0,0);
	    document.body.style.height = '100%';
	    if (!(/(iphone|ipod)/.test(navigator.userAgent.toLowerCase()))) {
	        if (document.body.parentNode) {
	            document.body.parentNode.style.height = '100%';
	        }
	    }
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
	}
}

//setTimeout(iMapMap.fixSize, 700);
//setTimeout(iMapMap.fixSize, 1500);