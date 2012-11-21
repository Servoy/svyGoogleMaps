/*
 * Google Maps APIv3.9 implementation: https://developers.google.com/maps/documentation/javascript/reference
 * 
 * TODO: Implement mechanism to sync scripting updates to browser
 * TODO: Implement API of Marker & Maps
 * TODO: Marker instance lookups
 * TODO: Event firing
 * TODO: implement InfoWindow
 * TODO: implement PolyLine
 * TODO: remove console.log statements, as not supported in every browser
 * TODO: add JSON polyfill for older browsers
 */

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"A0F61436-6581-4BD0-9E0F-A842B5EBCA9D"}
 */
var callbackName

/**
 * Variable with self executing function as value to run some initialization code when the scope gets instantiated on solution start.
 * - Dynamically created an .js entry in the Media Lib and includes it in the Web CLient 
 * - Sets up several .toObjectPresentation prototypes on constructors, needed for serialization of objects to browser side
 * @private
 * @SuppressWarnings(unused)
 * @properties={typeid:35,uuid:"C88DB00A-27F8-4CAB-A8FB-C1D2D50FC5C4",variableType:-4}
 */
var init = function() {
	
	var callback = plugins.WebClientUtils.generateCallbackScript(browserCallback,['objectType', 'id', 'eventType', 'data'], false);
	var script = 'svyDataVis.gmaps.mapsEventHandler = function(objectType, id, eventType, data){' + callback + '}';
	var bytes = new Packages.java.lang.String(script).getBytes('UTF-8')
	callbackName = 'googleMapsHandlerCallback_' + application.getUUID() + '.js'
	solutionModel.newMedia(callbackName, bytes)
}()

/**
 * Generic callbackHandler for events send from the browser to the server
 * @private 
 * @properties={typeid:24,uuid:"2B8B17B3-42F6-46AA-86B1-9A8D49ABA53E"}
 */
function browserCallback(objectType, id, eventType, data) {
	var options;
	if (allObjects[id]) {
		options = allObjects[id][0];
	}
	/** @type {{
	 * 		bounds: {sw: {lat:Number, lng:Number}, ne:  {lat:Number, lng:Number}}, 
	 * 		center: {lat:Number, lng:Number},
	 * 		tilt: Object,
	 * 		zoom: Object,
	 * 		heading: String,
	 * 		mapTypeId: Object,
	 * 		position: {lat:Number, lng:Number}
	 * }}
	 */
	var o;
	switch (objectType) {
		case 'map':
			switch (eventType) {
//				case 'bounds_changed':
//					break;
//				case 'center_changed':
//					var o = JSON.parse(data)
//					options.center = new scopes.modDataVis$googleMaps.LatLng(o.lat,o.lng)
//					break;
//				case 'click':
//					break; 
//				case 'dblclick':
//					break; 
//				case 'heading_changed':
//					options.heading = parseInt(data)
//					break;
//				case 'maptypeid_changed':
//					options.mapTypeId = data
//					break;
//				case 'projection_changed':
//					break;
//				case 'tilt_changed':
//					options.tilt = parseInt(data)
//					break;
//				case 'zoom_changed':
//					options.zoom = parseInt(data)
//					break;
			case 'idle':
				o = JSON.parse(data)
				var sw = new scopes.modDataVis$googleMaps.LatLng(o.bounds.sw.lat, o.bounds.sw.lng)
				var ne = new scopes.modDataVis$googleMaps.LatLng(o.bounds.ne.lat, o.bounds.ne.lng)
				options.bounds = new scopes.modDataVis$googleMaps.LatLngBounds(sw,ne)
				options.center = new scopes.modDataVis$googleMaps.LatLng(o.center.lat,o.center.lng)
				if (o.heading) options.heading = parseInt(o.heading)
				options.mapTypeId = o.mapTypeId
				options.tilt = o.tilt 
				options.zoom = o.zoom
				break;
			default:
				application.output('Unknown Map eventType: ' + eventType)
				return;
			}
			break;
		case 'marker':
			switch (eventType) {
				case 'dragend': //make sure the position is saved in the object on the servoy side
					o = JSON.parse(data);
					options.position = new scopes.modDataVis$googleMaps.LatLng(o.position.lat, o.position.lng);
					break;
				case 'click':
				case 'dblclick':
				case 'rightclick':
					break;
				default:
					application.output('Unknown Marker eventType: ' + eventType)
					return;
			}
			break;
		case 'infoWindow':
			switch (eventType) {
				case 'closeclick':
					break;
				default:
					application.output('Unknown InfoWindow eventType: ' + eventType)
					return;
			}
			
		default:
			application.output('Unknown GoogleMaps objectType: ' + objectType)
			return;
	}
	
	if (allObjects[id]) {
		allObjects[id][1](); //run the updateState method
	}
	
	//Fire event that the user potentially has attached
	scopes.svyEventManager.fireEvent(null, id, eventType, [objectType, id, eventType, data]);
}

/**
 * Array holding all Types that should be handled specially in the serializer
 * @private 
 * @type {Array}
 * @properties={typeid:35,uuid:"F61367F4-BDE9-42B1-994E-22EA719A34D9",variableType:-4}
 */
var specialTypes = [LatLng, MapTypeId, Marker, InfoWindow, Map]

/**
 * Map holding references to the inner setup of all Objects (Maps, Markers, ...) and their storeState method.
 * Used by the googleMapCallback function to persists browserside updates to the map, without causing another render cycle towards the browser
 * @private
 * @type {Object<Array>}
 * @properties={typeid:35,uuid:"1E3B2526-74A5-4BF3-80F7-E3D540136405",variableType:-4}
 */
var allObjects = {}

/**
 * Implements https://developers.google.com/maps/documentation/javascript/reference#LatLng
 * @constructor
 * @param {Number} lat
 * @param {Number} lng
 *
 * @properties={typeid:24,uuid:"E92C5DA2-94C4-4A0C-8F62-FD28DC3424D5"}
 */
function LatLng(lat, lng) {
	this.toObjectPresentation = function() {
		return { svySpecial: true, type: 'constructor', parts: ['google', 'maps', 'LatLng'], args: [this.lat(), this.lng()] }
	}
	
	/**
	 * @param {LatLng} other
	 * @return {Boolean}
	 */
	this.equals = function (other){
		return (other.lat() == lat && other.lng() == lng);
	}
	
	/**
	 * @return {Number}
	 */
	this.lat = function(){
		return lat
	}
	
	/**
	 * @return {Number}
	 */
	this.lng = function(){
		return lng
	}
	
	/**
	 * @return {String}
	 */
	this.toString = function (){
		return "(" + lat + ", " + lng + ")";
	}
	
//	/**
//	 * @return {String}
//	 */
//	this.toUrlValue = function (){
//		//TODO: implement
//	}
}

/**
 * Implements https://developers.google.com/maps/documentation/javascript/reference#LatLngBounds
 * @constructor 
 * @param {scopes.modDataVis$googleMaps.LatLng} sw
 * @param {scopes.modDataVis$googleMaps.LatLng} ne
 *
 * @properties={typeid:24,uuid:"D48855F6-0418-4E46-A5E4-1A716C3D17B3"}
 */
function LatLngBounds(sw, ne){
	//Change the points so that
	var minLat = Math.min(sw.lat(), ne.lat());
	var maxLat = Math.max(sw.lat(), ne.lat());
	var minLng = Math.min(sw.lng(), ne.lng());
	var maxLng = Math.max(sw.lng(), ne.lng());
	
	sw = new scopes.modDataVis$googleMaps.LatLng(minLat, minLng);
	ne = new scopes.modDataVis$googleMaps.LatLng(maxLat, maxLng);
	
	this.toObjectPresentation = function(){
		return {
			svySpecial: true,
			type: 'constructor',
			parts: ['google','maps','LatLngBounds'],
			args: [sw, ne]
		}
	}
	
	/**
	 * @param {LatLng} latLng
	 * @return {Boolean}
	 */
	this.contains = function(latLng) {
		var containsLat = latLng.lat() < ne.lat() && latLng.lat() > sw.lat();
		var containsLng = latLng.lng() < ne.lng() && latLng.lng() > sw.lng();
		
		return containsLat && containsLng;
	}
	/**
	 * @param {LatLngBounds} other
	 * @return {Boolean}
	 */
	this.equals = function(other){
		return sw.equals(other.getSouthWest()) && ne.equals(other.getNorthEast());
	}
	
	/**
	 * @param {scopes.modDataVis$googleMaps.LatLng} point
	 * @return {LatLngBounds}
	 */
	this.extend = function(point){
		if (point.lat() > ne.lat()) {
			//point is north of the bounds
			ne = new scopes.modDataVis$googleMaps.LatLng(point.lat(), ne.lng());
		}
		if (point.lng() > ne.lng()) {
			//point is east of the bounds
			ne = new scopes.modDataVis$googleMaps.LatLng(ne.lat(), point.lng());
		}
		if (point.lat() < sw.lat()) {
			//point is south of the bounds
			sw = new scopes.modDataVis$googleMaps.LatLng(point.lat(), sw.lng());
		}
		if (point.lng() < sw.lng()) {
			//point is west of the bounds
			sw = new scopes.modDataVis$googleMaps.LatLng(sw.lat(), point.lng());
		}
		return this;
	}
	/**
	 * @return {scopes.modDataVis$googleMaps.LatLng}
	 */
	this.getCenter = function(){
		var centerLat = (ne.lat() + sw.lat()) / 2;
		var centerLng = (ne.lng() + sw.lng()) / 2;
		
		return new scopes.modDataVis$googleMaps.LatLng(centerLat, centerLng);
	}
	/**
	 * @return {scopes.modDataVis$googleMaps.LatLng}
	 */
	this.getNorthEast = function(){
		return ne
	}
	/**
	 * @return {scopes.modDataVis$googleMaps.LatLng}
	 */
	this.getSouthWest = function(){
		return sw
	}
	/**
	 * @param {LatLngBounds} other
	 * @return {Boolean}
	 */
	this.intersects = function(other){
		return (! 
				(other.getSouthWest().lng() > ne.lng()) || //other.left   > this.right
				(other.getNorthEast().lng() < sw.lng()) || //other.right  < this.left
				(other.getSouthWest().lat() > ne.lat()) || //other.bottom > this.top
				(other.getNorthEast().lat() < sw.lat())    //other.top    < this.bottom
			);
	}
	/**
	 * @return {Boolean}
	 */
	this.isEmpty = function(){
		var latEmpty = (ne.lat() <= sw.lat());
		var lngEmpty = (ne.lng() <= sw.lng());
		
		return latEmpty || lngEmpty;
	}
	/**
	 * @return {scopes.modDataVis$googleMaps.LatLng}
	 */
	this.toSpan = function(){
		return new scopes.modDataVis$googleMaps.LatLng(sw.lat(),ne.lat());
	}
	/**
	 * @return {String}
	 */
	this.toString = function(){
		return "(" + sw.toString() + ", " + ne.toString() + ")";
	}
//	/**
//	 * @param {Number} precision
//	 * @return {String}
//	 */
//	this.toUrlValue = function(precision){
//		//TODO: implement
//	}
//	
	/**
	 * @param {LatLngBounds} other
	 * @return {LatLngBounds}
	 */
	this.union = function(other){
		this.extend(other.getNorthEast());
		this.extend(other.getSouthWest());
		
		return this;
	}
}

/**
 * @constructor
 * @param {Object} type
 *
 * @properties={typeid:24,uuid:"CC65FD0C-26F6-4932-A711-9BF5FDD62B2D"}
 */
function MapTypeId(type) {
	this.toObjectPresentation = function() {
		return { svySpecial: true, type: 'reference', parts: ['google', 'maps', 'MapTypeId', this.type] }
	}
	this.type = type
	
}

/**
 * @type {Object<MapTypeId>}
 * @properties={typeid:35,uuid:"4508E924-9D97-41EB-9404-728C9ADF5AB6",variableType:-4}
 */
var MapTypeIds = {
	HYBRID: new MapTypeId('HYBRID'),
	ROADMAP: new MapTypeId('ROADMAP'),
	SATELLITE: new MapTypeId('SATELLITE'),
	TERRAIN: new MapTypeId('TERRAIN')
}

///**
// * @constructor
// *
// * @properties={typeid:24,uuid:"9EF66E47-FA7E-4D26-9DCA-5A3DCA610C21"}
// */
//function Animation() {
//	//TODO: implement
//}

/**
 * @constructor
 * @param {{animation: Animation=,
 * 			clickable: Boolean=,
 * 			cursor: String=,
 * 			draggable: Boolean=,
 * 			flat: Boolean=,
 *			icon: String|MarkerImage|Symbol=,
 * 			map: scopes.modDataVis$googleMaps.Map,
 * 			optimized: Boolean=,
 * 			position: scopes.modDataVis$googleMaps.LatLng,
 * 			raiseOnDrag: Boolean=,
 * 			shadow: String|MarkerImage|Symbol=,
 * 			shape: MarkerShape=,
 * 			title: String=,
 * 			visible: Boolean=,
 * 			zIndex: Number=
 * }} options
 * 
 * TODO: As Marker props can be updated in the client (position change through drag for example), the fired event in the browser needs to be send to the server and there update the correct marker
 * AFAICS markers can only be updated when on a map and we should already know the map the marker is on, so the lookup could go through the markers array on the map
 * @properties={typeid:24,uuid:"15AF5C80-3814-47FF-B34B-7D9D40E82FBF"}
 */
function Marker(options) {
	var id = application.getUUID().toString()
//	var _animation
//	var _clickable
//	var _cursor
//	var _draggable
//	var _flat
//	var _icon
//	/**@type {scopes.modDataVis$googleMaps.GoogleMap}*/
//	var _map
//	var _optimized
//	var _position
//	var _raiseOnDrag
//	var _shadow
//	var _shape
//	var _title
//	var _visible
//	var _zIndex

	//escape 
	options.title = options.title.replace(/['"]/g,"\\$1");
	
	var markerSetup = {
		id: id,
		type: "marker",
		options: options
	}
	
	var listeners = {};
	
	/**
	 * @param {String} [incrementalUpdateCode]
	 */
	function updateState(incrementalUpdateCode) {
		if (markerSetup.options.map) {
			/** @type {scopes.modDataVis$googleMaps.Map} */
			var gmap = markerSetup.options.map;
			var _mapFormName = gmap.getId();
			if (_mapFormName in forms) {
				forms[_mapFormName].storeState(scopes.modDataVisualization.serializeObject(markerSetup, specialTypes))
				
				if (incrementalUpdateCode && forms[_mapFormName].isRendered()) {
					plugins.WebClientUtils.executeClientSideJS(incrementalUpdateCode)
				}
			} else {
				application.output('Invalid DataVisualizer reference') //TODO: better error messages
			}
		}
	}
//	updateState()
	
	/**
	 * Internal API: DO NOT CALL
	 * @return {Object}
	 */
	this.toObjectPresentation = function(createNew) {
		
		if (!createNew) {
			return {
				svySpecial: true, 
				type: 'reference', 
				parts: ['svyDataVis','gmaps', 'objects', id],
				marker: true
			}
		} else {
			return {
	//				svySpecial: true, 
					type: 'marker', 
					id: id,
	//				parts: ['svyDataVis','gmaps', 'Marker'],
					options: {
	//					svySpecial: true,
						parts: ['svyDataVis','gmaps', 'Marker'],
	//					animation: _animation,
	//					clickable: _clickable,
	//					cursor: _cursor,
						draggable: markerSetup.options.draggable,
	//					flat: _flat,
	//					icon: _icon,
						map: markerSetup.options.map,
	//					optimized: _optimized,
						position: markerSetup.options.position,
	//					raiseOnDrag: _raiseOnDrag,
	//					shadow: _shadow,
	//					shape: _shape,
						title: markerSetup.options.title
	//					visible: _visible,
	//					zIndex: _zIndex
					}
				}
		}
	}
	
	if (options.map) {
		/** @type {scopes.modDataVis$googleMaps.Map} */
		var gmap = options.map
		gmap.addMarker(markerSetup.id, this)
	}
	updateState()

	/**
	 * Internal API, DO NOT CALL
	 * @return {String}
	 */
	this.getId = function() {
		return markerSetup.id;
	}
	
//	//Constants
//	this.MAX_ZINDEX

	//Getters
//	this.getAnimation = function() {
//		return _animation
//	}
//	this.getClickable = function() {
//		return _clickable
//	}
//	this.getCursor = function() {
//		return _cursor
//	}
	this.getDraggable = function() {
		return options.draggable;
	}
//	this.getFlat = function() {
//		return _flat
//	}
//	this.getIcon = function() {
//		return _icon
//	}
	this.getMap = function() {
		return options.map;
	}
	
	/**
	 * @return {scopes.modDataVis$googleMaps.LatLng}
	 */
	this.getPosition = function() {
		return options.position
	}
//	this.getShadow = function() {
//		return _shadow
//	}
//	this.getShape = function() {
//		return _shape
//	}
	this.getTitle = function() {
		return options.title;
	}
//	this.getVisible = function() {
//		return _visible
//	}
//	this.getZIndex = function() {
//		return _zIndex
//	}

	//Setters
//	this.setAnimation = function(animation) {
//		_animation = animation
//	}
//	this.setClickable = function(flag) {
//		_clickable = flag
//	}
//	this.setCursor = function(cursor) {
//		_cursor = cursor
//	}
	this.setDraggable = function(flag) {
		options.draggable = flag
	}
//	this.setFlat = function(flag) {
//		_flat = flag
//	}
//	this.setIcon = function(icon) {
//		_icon = icon
//	}
	/**
	 * @param {scopes.modDataVis$googleMaps.Map} map
	 */
	this.setMap = function(map) {
		if (options.map == map) {
			return
		}
		if (options.map == null) { 
			options.map = map
		}
		map.addMarker(id, this)
		application.output(id);
		
		var str = scopes.modDataVisualization.serializeObject(this.toObjectPresentation(true), specialTypes);

		updateState('svyDataVis.gmaps.createMarker(JSON.parse(\'' + str + '\', svyDataVis.reviver));');
	}

	//	this.setOptions = function(options) {
//		for each (var prop in options) {
//			switch (prop) {
//				case 'animation':
//					this.setAnimation(options[prop])
//					break;
//				case 'clickable':
//					this.setClickable(options[prop])
//					break;
//				case 'cursor':
//					this.setCursor(options[prop])
//					break;
//				case 'draggable':
//					this.setDraggable(options[prop])
//					break;
//				case 'flat':
//					this.setFlat(options[prop])
//					break;
//				case 'icon':
//					this.setIcon(options[prop])
//					break;
//				case 'map':
//					this.setMap(options[prop])
//					break;
//				case 'optimized':
//					_optimized = options[prop]
//					break;
//				case 'position':
//					this.setPosition(options[prop])
//					break;
//				case 'raiseOnDrag':
//					_raiseOnDrag = options[prop]
//					break;
//				case 'shadow':
//					this.setShadow(options[prop])
//					break;
//				case 'shape':
//					this.setShape(options[prop])
//					break;
//				case 'title':
//					this.setTitle(options[prop])
//					break;
//				case 'visible':
//					this.setvisible(options[prop])
//					break;
//				case 'zIndex':
//					this.setZIndex(options[prop])
//					break;
//				default:
//					application.output('Unsupported property "' + prop + '" supplied to Marker.setOptions')	
//					break;
//				}
//		}
//	}
	this.setPosition = function(latLng) {
		options.position = latLng;
		updateState('var latLng = JSON.parse(\'' + scopes.modDataVisualization.serializeObject(latLng.toObjectPresentation(), specialTypes) + '\', svyDataVis.reviver);svyDataVis.gmaps.objects[\'' + markerSetup.id + '\'].setPosition(latLng);')		
	}
	
//	this.setShadow = function(shadow) {
//		_shadow = shadow
//	}
//	this.setShape = function(shape) {
//		_shape = shape
//	}
	this.setTitle = function(title) {
		markerSetup.options.title = title;
		updateState('svyDataVis.gmaps.objects[\'' + markerSetup.id + '\'].setTitle(latLng);')		
	}
//	this.setVisible = function(visible) {
//		_visible = visible
//	}
//	this.setZIndex = function(zIndex) {
//		_zIndex = zIndex
//	}

	this.EVENT_TYPES = { 
		CLICK            : 'click',
		DBLCLICK         : 'dblclick',
	//	DRAG             : 'drag',
		DRAGEND          : 'dragend',
	//	DRAGSTART        : 'dragstart',
	//	MOUSEDOWN        : 'mousedown',
	//	MOUSEOUT         : 'mouseout',
	//	MOUSEOVER        : 'mouseover',
	//	MOUSEUP          : 'mouseup',
		POSITION_CHANGED : 'position_changed',
		RIGHTCLICK       : 'rightclick'
	}
	
	this.addEventListener = function(eventHandler, eventType) {
		scopes.svyEventManager.addListener(markerSetup.id, eventType, eventHandler);
	}
	
	this.getEventHandler = function(eventType) {
		return listeners[eventType];
	}
	
	allObjects[markerSetup.id] = [options, updateState]
}

///**
// * @constructor
// *
// * @properties={typeid:24,uuid:"4A0B07DF-42B0-4C50-A1E8-CCD43AF62A9E"}
// */
//function MarkerImage() {
//	//TODO: implement
//}

///**
// * @constructor
// *
// * @properties={typeid:24,uuid:"16134509-41A8-45D9-8D63-BE232A780502"}
// */
//function MarkerShape() {
//	//TODO: implement
//}

/**
 * @constructor
 * @param {Object} options
 * @param {String} options.content
 * @param {Boolean} options.disableAutoPan
 * @param {Number} options.maxWidth
 * @param {LatLng} options.position
 * @param {Number} options.zIndex
 * @param {Marker} options.anchor
 * @param {Map} options.map
 * @properties={typeid:24,uuid:"1E81E90E-BBDA-4D0C-8AB9-467196F292BC"}
 */
function InfoWindow(options) {
	var id = application.getUUID().toString()
	
	options.content = escape(options.content);
	
	var infoWindowSetup = {
		id: id,
		type: "infoWindow",
		options: options
	}
	
	this.EVENT_TYPES = {
		CLOSECLICK: 'closeclick',
		CONTENT_CHANGED: 'content_changed',
		DOMREADY: 'domready',
		POSITION_CHANGED: 'position_changed',
		ZINDEX_CHANGED: 'zindex_changed'
	}
	
	this.addEventListener = function(eventHandler, eventType) {
		scopes.svyEventManager.addListener(infoWindowSetup.id, eventType, eventHandler);
	}
	
	/**
	 * Internal API: DO NOT CALL
	 * @return {Object}
	 */
	this.toObjectPresentation = function() {
		return {
			svySpecial: true, 
			type: 'constructor', 
			parts: ['google', 'maps', 'InfoWindow'], 
			id: id,
			infoWindow: true,
			args: [{
				map: infoWindowSetup.options.map,
				position: infoWindowSetup.options.position,
				content: infoWindowSetup.options.content,
				anchor: infoWindowSetup.options.anchor
			}] 
		}
	}
	
	updateState()
	
	/**
	 * @param {String} [incrementalUpdateCode]
	 */
	function updateState(incrementalUpdateCode) {
		if (infoWindowSetup.options.map) {
			/** @type {scopes.modDataVis$googleMaps.Map} */
			var gmap = infoWindowSetup.options.map;
			var _mapFormName = gmap.getId();
			if (_mapFormName in forms) {
				forms[_mapFormName].storeState(scopes.modDataVisualization.serializeObject(infoWindowSetup, specialTypes))
				
				if (incrementalUpdateCode && forms[_mapFormName].isRendered()) {
					plugins.WebClientUtils.executeClientSideJS(incrementalUpdateCode)
				}
			} else {
				application.output('Invalid DataVisualizer reference') //TODO: better error messages
			}
		}
	}
	
	this.close = function() {
		//TODO: implement
	}
	
	/**
	 * @return {String}
	 */
	this.getContent = function() {
		return options.content;
	}
	
	/**
	 * @return {LatLng}
	 */
	this.getPosition = function() {
		return options.position;
	}
	
	/**
	 * @return {Number}
	 */
	this.getZIndex = function() {
		return options.zIndex;
	}
	
	/**
	 * @param {scopes.modDataVis$googleMaps.Map} map
	 * @param {scopes.modDataVis$googleMaps.Marker} [anchor]
	 */
	this.open = function(map, anchor) { //TODO: handle the scenario where a InfoWindow is re-opened on another Map
		if (map) { 
			options.map = map
		}
		if (anchor) {
			options.anchor = anchor
			if (!options.map) {
				options.map = anchor.getMap();
			}
		}
		/** @type {scopes.modDataVis$googleMaps.Map} */
		var gmap = options.map
		gmap.addInfoWindow(id, this)
	}
	
	/**
	 * @param {String} string
	 */
	this.setContent = function(string) {
		options.content = string;
	}

	/**
	 * @param {Object} opts
	 */
	this.setOptions = function(opts) {
		options = opts;
	}
	
	/**
	 * @param {LatLng} position
	 */
	this.setPosition = function(position) {
		options.position = position;
		updateState('var latLng = JSON.parse(\'' + scopes.modDataVisualization.serializeObject(position["toObjectPresentation"](), specialTypes) + '\', svyDataVis.reviver);svyDataVis.gmaps.objects[\'' + infoWindowSetup.id + '\'].setPosition(latLng);')		
	}
	
	/**
	 * @param {Number} number
	 */
	this.setZIndex = function(number) {
		options.zIndex = number;
	}
	
	allObjects[infoWindowSetup.id] = [options, updateState]
}

/**
 * Google Map impl.
 * 
 * TODO: persist switching to streetview: http://stackoverflow.com/questions/7251738/detecting-google-maps-streetview-mode
 * TODO: Impl. missing Types used in options
 * @constructor 
 * 
 * @param {RuntimeTabPanel} container the panel in which the visualization is displayed. Note: all existing tabs in the panel will be removed
 * @param {String} [options.backgroundColor]
 * @param {LatLng} options.center
 * @param {Boolean} [options.disableDefaultUI]
 * @param {Boolean} [options.disableDoubleClickZoom]
 * @param {Boolean} [options.draggable]
 * @param {String} [options.draggableCursor]
 * @param {String} [options.draggingCursor]
 * @param {Number} [options.heading]
 * @param {Boolean} [options.keyboardShortcuts]
 * @param {Boolean} [options.mapMaker]
 * @param {Boolean} [options.mapTypeControl]
 * @param {MapTypeId} options.mapTypeId
 * @param {Number} [options.maxZoom]
 * @param {Number} [options.minZoom]
 * @param {Boolean} [options.noClear]
 * @param {Boolean} [options.overviewMapControl]
 * @param {Boolean} [options.panControl]
 * @param {Boolean} [options.rotateControl]
 * @param {Boolean} [options.scaleControl]
 * @param {Boolean} [options.scrollwheel]
 * TODO @param {StreetViewPanorama} [options.streetView]
 * @param {Boolean} [options.streetViewControl]
 * @param {Number} [options.tilt]
 * @param {Number} options.zoom
 * @param {Boolean} [options.zoomControl]
 * @properties={typeid:24,uuid:"1E5BE0D4-5E7A-489D-AACA-7BECA54B2CD1"}
 */
function Map(container, options) {
	/**@type {RuntimeForm<GoogleMap>}*/
	var dv = scopes.modDataVisualization.createVisualizationContainer(container, forms.GoogleMap)

	scopes.modUtils$WebClient.addJavaScriptDependancy("media:///googleMapsHandler.js", dv)
	scopes.modUtils$WebClient.addJavaScriptDependancy('media:///' + callbackName, dv)
	
	var mapSetup = {
		id: dv.getId(),
		type: "map",
		options: options
//		markers: dv.markers
	}
	
	/**
	 * Internal API, DO NOT CALL
	 * @param {String} id
	 * @param {Marker} marker
	 */
	this.addMarker = function(id, marker) {
		dv.markers[id] = marker	
		updateState(); //TODO: incremental code
	}
	
	/**
	 * Internal API, DO NOT CALL
	 * @param {String} id
	 * @param {InfoWindow} infoWindow
	 */
	this.addInfoWindow = function(id, infoWindow) {
		dv.infoWindows[id] = infoWindow	

		var str = scopes.modDataVisualization.serializeObject(infoWindow.toObjectPresentation(), specialTypes);
		updateState('var infoWindow = svyDataVis.gmaps.createInfoWindow(JSON.parse(\'' + str + '\', svyDataVis.reviver));'); 
	}
	
	/**
	 * Internal API, DO NOT CALL
	 * @param {String} id
	 */
	this.removeMarker = function (id) {
		delete dv.markers[id]
		updateState("svyDataVis.gmaps.removeMarker('"+id+"')");
	}
	
	/**
	 * Internal API, DO NOT CALL
	 * @return {Object}
	 */
	this.toObjectPresentation = function() {
		return {
			svySpecial: true, 
			type: 'reference', 
			parts: ['svyDataVis','gmaps', 'objects', mapSetup.id]
		}
	}
	
	/**
	 * Internal API, DO NOT CALL
	 * @return {String}
	 */
	this.getId = function() {
		return mapSetup.id;
	}
	
	
	/**
	 * @param {String} [incrementalUpdateCode]
	 */
	function updateState(incrementalUpdateCode) {
		if (mapSetup.id in forms) {
			forms[mapSetup.id].storeState(scopes.modDataVisualization.serializeObject(mapSetup, specialTypes))
			
			if (incrementalUpdateCode && forms[mapSetup.id].isRendered()) {
				plugins.WebClientUtils.executeClientSideJS(incrementalUpdateCode)
			}
		} else {
			application.output('Invalid DataVisualizer reference') //TODO: better error messages
		}
	}
	updateState()
	
	/* Scripting API
	 */
	/**
	 * @param {scopes.modDataVis$googleMaps.LatLngBounds} bounds
	 */
	this.fitBounds = function(bounds) {
		updateState('var bounds = JSON.parse(\'' + scopes.modDataVisualization.serializeObject(bounds.toObjectPresentation(), specialTypes) + '\', svyDataVis.reviver);svyDataVis.gmaps.objects[\'' + mapSetup.id + '\'].fitBounds(bounds);')
	}

//	/**
//	 * @return {scopes.modDataVis$googleMaps.LatLngBounds}
//	 */
//	this.getBounds = function() {}

	/**
	 * @return {scopes.modDataVis$googleMaps.LatLngBounds}
	 */
	this.getMarkerBounds = function() {
		/** @type {scopes.modDataVis$googleMaps.LatLngBounds} */
		var bounds;
		var index = 1;
		
		/** @type {RuntimeForm<GoogleMap>} */
		var form = forms[this.getId()]
		if (form.markers) {
			for (var i in form.markers) {
				if (index == 1) {
					bounds = new scopes.modDataVis$googleMaps.LatLngBounds(form.markers[i].getPosition(), form.markers[i].getPosition());
				} else {
					bounds.extend(form.markers[i].getPosition());
				}
				index++;
			}
		}
		return bounds;
	}
	
	/**
	 * @return {LatLng}
	 */
	this.getCenter = function() {
		return options.center
	}

//  This bit of APi makes no sense in Servoy
//	/**
//	 * @return {RuntimeTabPanel}
//	 */
//	this.getDiv = function() {}

	/**
	 * @return {Number}
	 */
	this.getHeading = function() {
		return options.heading
	}

	/**
	 * @return {MapTypeId|String}
	 */
	this.getMapTypeId = function() {
		return options.mapTypeId
	}

//	/**
//	 * @return {Projection}
//	 */
//	this.getProjection = function() {
//		return options.projection
//	}
//
//	/**
//	 * @return {StreetViewPanorama}
//	 */
//	this.getStreetView = function() {
//	}

	/**
	 * @return {Number}
	 */
	this.getTilt = function() {
		return options.tilt
	}

	/**
	 * @return {Number}
	 */
	this.getZoom = function() {
		return options.zoom
	}

	/**
	 * @param {Number} x
	 * @param {Number} y
	 */
	this.panBy = function(x, y) {
		//No state update, because no way to determine the new center. State will be updated async
		plugins.WebClientUtils.executeClientSideJS('svyDataVis.gmaps.objects[\'' + mapSetup.id + '\'].panBy(' + x + ','+ y + ');')		
	}

	/**
	 * @param {scopes.modDataVis$googleMaps.LatLng} latLng
	 */
	this.panTo = function(latLng) {
		options.center = latLng;
		updateState('var latLng = JSON.parse(\'' + scopes.modDataVisualization.serializeObject(latLng["toObjectPresentation"](), specialTypes) + '\', svyDataVis.reviver);svyDataVis.gmaps.objects[\'' + mapSetup.id + '\'].panTo(latLng);')		
	}

	/**
	 * @param {scopes.modDataVis$googleMaps.LatLngBounds} bounds
	 */
	this.panToBounds = function(bounds){
		plugins.WebClientUtils.executeClientSideJS('var bounds = JSON.parse(\'' + scopes.modDataVisualization.serializeObject(bounds.toObjectPresentation(), specialTypes) + '\', svyDataVis.reviver);svyDataVis.gmaps.objects[\'' + mapSetup.id + '\'].panToBounds(bounds);')
	}

	/**
	 * @param {scopes.modDataVis$googleMaps.LatLng} latLng
	 */
	this.setCenter = function(latLng) {
		options.center = latLng
		updateState('var latLng = JSON.parse(\'' + scopes.modDataVisualization.serializeObject(latLng["toObjectPresentation"](), specialTypes) + '\', svyDataVis.reviver);svyDataVis.gmaps.objects[\'' + mapSetup.id + '\'].setCenter(latLng);')
	}

	/**
	 * @param {Number} heading
	 */
	this.setHeading = function(heading) {
		options.heading = heading
		updateState('svyDataVis.gmaps.objects[\'' + mapSetup.id + '\'].setHeading(' + heading + ');')
	}

	/**
	 * @param {String} mapTypeId
	 */
	this.setMapTypeId = function(mapTypeId) {
		options.mapTypeId = mapTypeId
		updateState('svyDataVis.gmaps.objects[\'' + mapSetup.id + '\'].setMapTypId(' + mapTypeId + ');')
	}

//	/**
//	 * @param {MapOptions} options
//	 */
//	this.setOptions = function(options) {
//	}

	/**
	 * @param {StreetViewPanorama} panorama
	 */
	this.setStreetView = function(panorama) {}
	
	/**
	 * @param {Number} tilt
	 */
	this.setTilt = function(tilt) {
		options.tilt = tilt
		updateState('svyDataVis.gmaps.objects[\'' + mapSetup.id + '\'].setTilt(' + tilt + ');')
	}
	
	/**
	 * @param {Number} zoom
	 */
	this.setZoom = function(zoom) {
		options.zoom = zoom
		updateState('svyDataVis.gmaps.objects[\'' + mapSetup.id + '\'].setZoom(' + zoom + ');')
	}
	
	this.controls = [] //TODO: implement what needs implementing for this property
	this.mapTypes = null //TODO: implement what needs implementing for this property
	this.overlayMapTypes = [] //TODO: implement what needs implementing for this property
	
	this.EVENT_TYPES = {
		BOUNDS_CHANGED: 'bounds_changed',
		CENTER_CHANGED: 'center_changed',
		CLICK: 'click',
		DBLCLICK: 'dblclick',
		//DRAG: 'drag',
		//DRAGEND: 'dragend',
		//DRAGSTART: 'dragstart',
		HEADING_CHANGED: 'heading_changed',
		//IDLE: 'idle',
		MAPTYPEID_CHANGED: 'maptypeid_changed',
		//MOUSEMOVE: 'mousemove',
		//MOUSEOUT: 'mouseout',
		//MOUSEOVER: 'mouseover',
		PROJECTION_CHANGED: 'projection_changed',
		//RESIZE: 'resize',
		//RIGHTCLICK: 'rightclick',
		//TILESLOADED: 'tilesloaded',
		TILT_CHANGED: 'tilt_changed',
		ZOOM_CHANGED: 'zoom_changed'
	}
	
	/**
	 * @param {Function} eventHandler
	 * @param {String} eventType
	 */
	function addEventListener(eventHandler, eventType) {
		scopes.svyEventManager.addListener(this, eventType, eventHandler)
	}
	
	allObjects[mapSetup.id] = [options, updateState]
}


///**
// * @constructor
// *
// * @properties={typeid:24,uuid:"30E3B07A-0A00-47D1-B65D-79F4581BD859"}
// */
//function Symbol() {
//	//TODO: implement
//}

///**
// * @constructor
// * 
// * @properties={typeid:24,uuid:"00998305-37A3-4165-8018-C86CF72476D3"}
// */
//function StreetViewPanorama() {
//	//TODO: implement
//}