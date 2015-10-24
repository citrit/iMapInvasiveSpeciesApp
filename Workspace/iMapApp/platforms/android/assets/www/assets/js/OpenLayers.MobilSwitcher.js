/* Copyright (c) 2006-2011 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the Clear BSD license.
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Lang.js
 * @requires Rico/Corner.js
 */

/**
 * Class: OpenLayers.Control.LayerSwitcher
 * The LayerSwitcher control displays a table of contents for the map. This
 * allows the user interface to switch between BaseLasyers and to show or hide
 * Overlays. By default the switcher is shown minimized on the right edge of
 * the map, the user may expand it by clicking on the handle.
 *
 * To create the LayerSwitcher outside of the map, pass the Id of a html div
 * as the first argument to the constructor.
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
OpenLayers.Control.MobileLayerSwitcher =
OpenLayers.Class(OpenLayers.Control, {
                 
                 /**
                  * Property: layerStates
                  * {Array(Object)} Basically a copy of the "state" of the map's layers
                  *     the last time the control was drawn. We have this in order to avoid
                  *     unnecessarily redrawing the control.
                  */
                 layerStates: null,
                 
                 /**
                  * Property: triggerBtn
                  * {DOMElement}
                  */
                 triggerBtn: null,
                 
                 /**
                  * Property: dataLbl
                  * {DOMElement}
                  */
                 dataLbl: null,
                 
                 /**
                  * Property: dataLayersUl
                  * {DOMElement}
                  */
                 dataLayersUl: null,
                 
                 /**
                  * Property: baseLbl
                  * {DOMElement}
                  */
                 baseLbl: null,
                 
                 /**
                  * Property: baseLayersUl
                  * {DOMElement}
                  */
                 baseLayersUl: null,
                 
                 /**
                  * Property: closeNtn
                  * {DOMElement}
                  */
                 closeBtn: null,
                 
                 /**
                  * Property: baseLayers
                  * {Array(<OpenLayers.Layer>)}
                  */
                 baseLayers: null,
                 
                 /**
                  * Property: dataLayers
                  * {Array(<OpenLayers.Layer>)}
                  */
                 dataLayers: null,
                 
                 /**
                  * APIProperty: ascending
                  * {Boolean}
                  */
                 ascending: true,
                 
                 /**
                  * Constructor: OpenLayers.Control.LayerSwitcher
                  *
                  * Parameters:
                  * options - {Object}
                  */
                 initialize: function(options) {
                 OpenLayers.Control.prototype.initialize.apply(this, arguments);
                 this.layerStates = [];
                 },
                 
                 /**
                  * APIMethod: destroy
                  */
                 destroy: function() {
                 
                 OpenLayers.Event.stopObservingElement(this.div);
                 
                 //OpenLayers.Event.stopObservingElement(this.minimizeDiv);
                 //OpenLayers.Event.stopObservingElement(this.maximizeDiv);
                 
                 //clear out layers info and unregister their events
                 this.clearLayersArray("base");
                 this.clearLayersArray("data");
                 
                 this.map.events.un({
                                    "addlayer": this.redraw,
                                    "changelayer": this.redraw,
                                    "removelayer": this.redraw,
                                    "changebaselayer": this.redraw,
                                    scope: this
                                    });
                 
                 OpenLayers.Control.prototype.destroy.apply(this, arguments);
                 },
                 
                 /**
                  * Method: setMap
                  *
                  * Properties:
                  * map - {<OpenLayers.Map>}
                  */
                 setMap: function(map) {
                 OpenLayers.Control.prototype.setMap.apply(this, arguments);
                 
                 this.map.events.on({
                                    "addlayer": this.redraw,
                                    "changelayer": this.redraw,
                                    "removelayer": this.redraw,
                                    "changebaselayer": this.redraw,
                                    scope: this
                                    });
                 },
                 
                 /**
                  * Method: draw
                  *
                  * Returns:
                  * {DOMElement} A reference to the DIV DOMElement containing the
                  *     switcher tabs.
                  */
                 draw: function() {
                 OpenLayers.Control.prototype.draw.apply(this);
                 
                 // create layout divs
                 this.loadContents();
                 
                 // set mode to minimize
                 if(!this.outsideViewport) {
                 this.minimizeControl();
                 }
                 
                 // populate div with current info
                 this.redraw();
                 this.events = new OpenLayers.Events(this, this.div);
                 
                 //prevent all kinds of map events when layerswitcher is opened
                 for(var i = 0; i < this.events.BROWSER_EVENTS.length; i++){
                 this.events.registerPriority(this.events.BROWSER_EVENTS[i], this, function(){ return false;});
                 }
                 
                 return this.div;
                 },
                 
                 /**
                  * Method: clearLayersArray
                  * User specifies either "base" or "data". we then clear all the
                  *     corresponding listeners, the div, and reinitialize a new array.
                  *
                  * Parameters:
                  * layersType - {String}
                  */
                 clearLayersArray: function(layersType) {
                 var layers = this[layersType + "Layers"];
                 if (layers) {
                 for(var i=0, len=layers.length; i<len ; i++) {
                 var layer = layers[i];
                 OpenLayers.Event.stopObservingElement(layer.inputElem);
                 OpenLayers.Event.stopObservingElement(layer.labelSpan);
                 }
                 }
                 this[layersType + "LayersUl"].innerHTML = "";
                 this[layersType + "Layers"] = [];
                 },
                 
                 
                 /**
                  * Method: checkRedraw
                  * Checks if the layer state has changed since the last redraw() call.
                  *
                  * Returns:
                  * {Boolean} The layer state changed since the last redraw() call.
                  */
                 checkRedraw: function() {
                 var redraw = false;
                 if ( !this.layerStates.length ||
                     (this.map.layers.length != this.layerStates.length) ) {
                 redraw = true;
                 } else {
                 for (var i=0, len=this.layerStates.length; i<len; i++) {
                 var layerState = this.layerStates[i];
                 var layer = this.map.layers[i];
                 if ( (layerState.name != layer.name) ||
                     (layerState.inRange != layer.inRange) ||
                     (layerState.id != layer.id) ||
                     (layerState.visibility != layer.visibility) ) {
                 redraw = true;
                 break;
                 }
                 }
                 }
                 return redraw;
                 },
                 
                 /**
                  * Method: redraw
                  * Goes through and takes the current state of the Map and rebuilds the
                  *     control to display that state. Groups base layers into a
                  *     radio-button group and lists each data layer with a checkbox.
                  *
                  * Returns:
                  * {DOMElement} A reference to the DIV DOMElement containing the control
                  */
                 redraw: function() {
                 
                 //if the state hasn't changed since last redraw, no need
                 // to do anything. Just return the existing div.
                 if (!this.checkRedraw()) {
                 return this.div;
                 }
                 
                 if(this.div.style.zIndex)
                 this.triggerBtn.style.zIndex = this.div.style.zIndex-1;
                 
                 //clear out previous layers
                 this.clearLayersArray("base");
                 this.clearLayersArray("data");
                 
                 var containsOverlays = false;
                 var containsBaseLayers = false;
                 
                 // Save state -- for checking layer if the map state changed.
                 // We save this before redrawing, because in the process of redrawing
                 // we will trigger more visibility changes, and we want to not redraw
                 // and enter an infinite loop.
                 var len = this.map.layers.length;
                 this.layerStates = new Array(len);
                 for (var i=0; i <len; i++) {
                 var layer = this.map.layers[i];
                 this.layerStates[i] = {
                 'name': layer.name,
                 'visibility': layer.visibility,
                 'inRange': layer.inRange,
                 'id': layer.id
                 };
                 }
                 
                 var layers = this.map.layers.slice();
                 
                 if (!this.ascending)
                 layers.reverse();
                 
                 for(var i=0, len=layers.length; i<len; i++) {
                 var layer = layers[i];
                 var baseLayer = layer.isBaseLayer;
                 
                 if (layer.displayInLayerSwitcher) {
                 
                 if (baseLayer) {
                 containsBaseLayers = true;
                 } else {
                 containsOverlays = true;
                 }
                 
                 // only check a baselayer if it is *the* baselayer, check data
                 //  layers if they are visible
                 var checked = (baseLayer) ? (layer == this.map.baseLayer)
                 : layer.getVisibility();
                 
                 // create input element
                 var inputElem = document.createElement("input");
                 inputElem.id = this.id + "_input_" + layer.name;
                 inputElem.name = (baseLayer) ? this.id + "_baseLayers" : layer.name;
                 inputElem.type = (baseLayer) ? "radio" : "checkbox";
                 inputElem.value = layer.name;
                 inputElem.checked = checked;
                 inputElem.defaultChecked = checked;
                 
                 if (!baseLayer && !layer.inRange) {
                 inputElem.disabled = true;
                 }
                 var context = {
                 'inputElem': inputElem,
                 'layer': layer,
                 'layerSwitcher': this
                 };
                 
                 // create span
                 var label = document.createElement("label");
                 
                 if (!baseLayer && !layer.inRange) {
                 label.style.color = "gray";
                 }
                 
                 var textNode = document.createTextNode(layer.name);
                 
                 label.appendChild(inputElem);
                 label.appendChild(textNode);
                 
                 var groupArray = (baseLayer) ? this.baseLayers
                 : this.dataLayers;
                 groupArray.push({
                                 'layer': layer,
                                 'inputElem': inputElem,
                                 'labelSpan': label
                                 });
                 
                 var li = document.createElement("li");
                 li.appendChild(label);
                 
                 OpenLayers.Event.observe(li, "click",
                                          OpenLayers.Function.bindAsEventListener(this.onInputClick,
                                                                                  context)
                                          );
                 
                 if(baseLayer)
                 this.baseLayersUl.appendChild(li);
                 else
                 this.dataLayersUl.appendChild(li);
                 
                 }
                 }
                 
                 if(!containsBaseLayers)
                 this.baseLbl.style.display = "none";
                 else
                 this.baseLbl.style.display = "";
                 
                 if(!containsOverlays)
                 this.dataLbl.style.display = "none";
                 else
                 this.dataLbl.style.display = "";
                 
                 return this.div;
                 },
                 
                 /**
                  * Method:
                  * A label has been clicked, check or uncheck its corresponding input
                  *
                  * Parameters:
                  * e - {Event}
                  *
                  * Context:
                  *  - {DOMElement} inputElem
                  *  - {<OpenLayers.Control.LayerSwitcher>} layerSwitcher
                  *  - {<OpenLayers.Layer>} layer
                  */
                 onInputClick: function(e) {
                 
                 if (!this.inputElem.disabled) {
                 if (this.inputElem.type == "radio") {
                 this.inputElem.checked = true;
                 this.layer.map.setBaseLayer(this.layer);
                 } else {
                 this.inputElem.checked = !this.inputElem.checked;
                 this.layerSwitcher.updateMap();
                 }
                 }
                 OpenLayers.Event.stop(e);
                 },
                 
                 /** 
                  * Method: updateMap
                  * Cycles through the loaded data and base layer input arrays and makes
                  *     the necessary calls to the Map object such that that the map's 
                  *     visual state corresponds to what the user has selected in 
                  *     the control.
                  */
                 updateMap: function() {
                 
                 // set the newly selected base layer        
                 for(var i=0, len=this.baseLayers.length; i<len; i++) {
                 var layerEntry = this.baseLayers[i];
                 if (layerEntry.inputElem.checked) {
                 this.map.setBaseLayer(layerEntry.layer, false);
                 }
                 }
                 
                 // set the correct visibilities for the overlays
                 for(var i=0, len=this.dataLayers.length; i<len; i++) {
                 var layerEntry = this.dataLayers[i];   
                 layerEntry.layer.setVisibility(layerEntry.inputElem.checked);
                 }
                 
                 },
                 
                 /** 
                  * Method: maximizeControl
                  * Set up the labels and divs for the control
                  * 
                  * Parameters:
                  * e - {Event} 
                  */
                 maximizeControl: function(e) {
                 this.div.style.display = "block";
                 
                 if (e != null) {
                 OpenLayers.Event.stop(e);                                            
                 }
                 },
                 
                 /** 
                  * Method: minimizeControl
                  * Hide all the contents of the control, shrink the size, 
                  *     add the maximize icon
                  *
                  * Parameters:
                  * e - {Event} 
                  */
                 minimizeControl: function(e) {
                 this.div.style.display = "none";
                 
                 if (e != null) {
                 OpenLayers.Event.stop(e);                                            
                 }
                 },
                 
                 /** 
                  * Method: loadContents
                  * Set up the labels and divs for the control
                  */
                 loadContents: function() {
                 this.triggerBtn = document.createElement("div");
                 this.triggerBtn.innerHTML = "Layers";
                 OpenLayers.Element.addClass(this.triggerBtn, "olControlMobileLayerSwitcherTrigger");
                 
                 OpenLayers.Event.observe(this.triggerBtn, "click", 
                                          OpenLayers.Function.bindAsEventListener(this.maximizeControl, this)
                                          );
                 
                 this.closeBtn = document.createElement("a");
                 this.closeBtn.href = "#";
                 this.closeBtn.innerHTML = "Close";
                 OpenLayers.Element.addClass(this.closeBtn, "btnClose");
                 
                 OpenLayers.Event.observe(this.closeBtn, "click", 
                                          OpenLayers.Function.bindAsEventListener(this.minimizeControl, this)
                                          );
                 
                 this.baseLbl = document.createElement("span");
                 this.baseLbl.innerHTML = OpenLayers.i18n("baseLayer");
                 this.baseLayersUl = document.createElement("ul");
                 
                 this.dataLbl = document.createElement("span");
                 this.dataLbl.innerHTML = OpenLayers.i18n("overlays");
                 this.dataLayersUl = document.createElement("ul");
                 
                 this.div.appendChild(this.closeBtn);
                 this.div.appendChild(this.baseLbl);
                 this.div.appendChild(this.baseLayersUl);
                 this.div.appendChild(this.dataLbl);
                 this.div.appendChild(this.dataLayersUl);
                 
                 this.map.div.appendChild(this.triggerBtn);			
                 },
                 
                 CLASS_NAME: "OpenLayers.Control.MobileLayerSwitcher"
                 });