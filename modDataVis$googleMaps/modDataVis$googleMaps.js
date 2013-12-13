/*
 * Google Maps APIv3.9 implementation: https://developers.google.com/maps/documentation/javascript/reference
 * FIXME: replace references to scopes.svyWebClientUtils.executeClientsideScript with references to executeClientsideScript on the DV instance for Sc compatibility
 * TODO: implement PolyLine
 */

/**
 * @private
 * @type {String}
 *
 * @properties={typeid:35,uuid:"EF23AE1F-2784-4223-B817-4227C99BEE19"}
 */
var apiKey

/**
 * Note: an API key is not required, but is advised to use: https://developers.google.com/maps/documentation/javascript/tutorial#api_key
 * 
 * @param {String} key
 * @properties={typeid:24,uuid:"8A906003-AC47-4C71-AF5A-48CE8F368201"}
 */
function setAPIKey(key) {
	apiKey = key
}

/**
 * @private 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"1DA9F8F0-7731-437B-BE7C-CB29FC59C0DC"}
 */
var apiClientId

/**
 * When using Google Maps in a non-free and non-publicly accessible environment, the Google Maps for Business version ought to be used.<br>
 * The Google Maps for Business comes with a clientId to be included when communicating with the Maps API.<br>
 *
 * @see https://developers.google.com/maps/licensing
 * @see https://developers.google.com/maps/documentation/business/clientside#MapsJS
 *
 * @param {String} clientId
 * 
 * @properties={typeid:24,uuid:"CCBB5A12-45D9-47C3-A581-4627EEFEC899"}
 */
function setAPIClientId(clientId) {
	apiClientId = clientId
}

/**
 * @private
 * @constructor 
 * @extends {scopes.svyEventManager.Event}
 * 
 * @param {String} type
 * @param {*} source
 * @param {Object} [data]
 * @param {LatLng} [position]
 * @properties={typeid:24,uuid:"56660B15-0127-4966-96D2-F30BB9343ED7"}
 */
function Event(type, source, position, data) {
	scopes.svyEventManager.Event.call(this, type, source, data);
	
	this.getPosition = function() {
		return position||null;
	}
}

/**
 * //TODO: test if this freezes all instances as well
 * @properties={typeid:35,uuid:"B6F2BB47-C7C4-46DA-833F-95F4AF3069DE",variableType:-4}
 */
var eventSetup = function() {
	Event.prototype = Object.create(scopes.svyEventManager.Event.prototype);
	Object.freeze(Event); 
} ()

/**
 * Implements https://developers.google.com/maps/documentation/javascript/reference#LatLng
 * @constructor
 * @param {Number} lat
 * @param {Number} lng
 *
 * @properties={typeid:24,uuid:"E92C5DA2-94C4-4A0C-8F62-FD28DC3424D5"}
 */
function LatLng(lat, lng) {
	this.toJSON = function() {
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
 * @param {LatLng} sw
 * @param {LatLng} ne
 *
 * @properties={typeid:24,uuid:"D48855F6-0418-4E46-A5E4-1A716C3D17B3"}
 */
function LatLngBounds(sw, ne){
	//Change the points so that
	var minLat = Math.min(sw.lat(), ne.lat());
	var maxLat = Math.max(sw.lat(), ne.lat());
	var minLng = Math.min(sw.lng(), ne.lng());
	var maxLng = Math.max(sw.lng(), ne.lng());
	
	sw = new LatLng(minLat, minLng);
	ne = new LatLng(maxLat, maxLng);
	
	this.toJSON = function(){
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
	 * @param {LatLng} point
	 * @return {LatLngBounds}
	 * @this {LatLngBounds}
	 */
	this.extend = function(point){
		if (point.lat() > ne.lat()) {
			//point is north of the bounds
			ne = new LatLng(point.lat(), ne.lng());
		}
		if (point.lng() > ne.lng()) {
			//point is east of the bounds
			ne = new LatLng(ne.lat(), point.lng());
		}
		if (point.lat() < sw.lat()) {
			//point is south of the bounds
			sw = new LatLng(point.lat(), sw.lng());
		}
		if (point.lng() < sw.lng()) {
			//point is west of the bounds
			sw = new LatLng(sw.lat(), point.lng());
		}
		return this;
	}
	/**
	 * @return {LatLng}
	 */
	this.getCenter = function(){
		var centerLat = (ne.lat() + sw.lat()) / 2;
		var centerLng = (ne.lng() + sw.lng()) / 2;
		
		return new LatLng(centerLat, centerLng);
	}
	/**
	 * @return {LatLng}
	 */
	this.getNorthEast = function(){
		return ne
	}
	/**
	 * @return {LatLng}
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
	 * @return {LatLng}
	 */
	this.toSpan = function(){
		return new LatLng(sw.lat(),ne.lat());
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
	 * @this {LatLngBounds}
	 */
	this.union = function(other){
		this.extend(other.getNorthEast());
		this.extend(other.getSouthWest());
		
		return this;
	}
}

/**
 * @constructor
 * @param {String} type
 *
 * @properties={typeid:24,uuid:"CC65FD0C-26F6-4932-A711-9BF5FDD62B2D"}
 */
function MapTypeId(type) {
	this.toJSON = function() {
		return { svySpecial: true, type: 'reference', parts: ['google', 'maps', 'MapTypeId', this.type] }
	}
	
	this.type = type
}

/**
 * TODO: simplify this: just make it strings
 * @type {Object<MapTypeId>}
 * @properties={typeid:35,uuid:"4508E924-9D97-41EB-9404-728C9ADF5AB6",variableType:-4}
 */
var MapTypeIds = {
	HYBRID: new MapTypeId('HYBRID'),
	ROADMAP: new MapTypeId('ROADMAP'),
	SATELLITE: new MapTypeId('SATELLITE'),
	TERRAIN: new MapTypeId('TERRAIN')
}

/**
 * Creates a marker with the options specified. If a map is specified, the marker is added to the map upon construction. Note that the position must be set for the marker to display.

 * @constructor
 * 
 * @param {Boolean} [options.clickable] If true, the marker receives mouse and touch events. Default value is true.
 * @param {String} [options.cursor] Mouse cursor to show on hover
 * @param {Boolean} [options.draggable] If true, the marker can be dragged. Default value is false.
 * @param {Boolean} [options.flat] If true, the marker shadow will not be displayed.
 * @param {String} [options.icon] Icon for the foreground
 * @param {Map} [options.map] Map on which to display Marker.
 * @param {Boolean} [options.optimized] Optimization renders many markers as a single static element. Optimized rendering is enabled by default. Disable optimized rendering for animated GIFs or PNGs, or when each marker must be rendered as a separate DOM element (advanced usage only).
 * @param {LatLng} options.position Marker position. Required.
 * @param {Boolean} [options.raiseOnDrag] If false, disables raising and lowering the marker on drag. This option is true by default.
 * @param {String} [options.shadow] Shadow image
 * @param {String} [options.title] Rollover text
 * @param {Boolean} [options.visible] If true, the marker is visible
 * @param {Number} [options.zIndex] All markers are displayed on the map in order of their zIndex, with higher values displaying in front of markers with lower values. By default, markers are displayed according to their vertical position on screen, with lower markers appearing in front of markers further up the screen.
 * 
 * TODO	param anchorPoint
 * TODO	param icon: |MarkerImage|Symbol=,
 * TODO	param shadow: |MarkerImage|Symbol=,
 * TODO	param shape: MarkerShape=,
 * TODO	param map:Map|StreetViewPanorama,
 * TODO	param animation: Animation=,
 * 
 * @properties={typeid:24,uuid:"15AF5C80-3814-47FF-B34B-7D9D40E82FBF"}
 */
function Marker(options) {
	var markerSetup = {
		id: scopes.modComponent.getUID(),
		type: "marker",
		options: options
	}
	
	var thisInstance = this //Storing reference to the Marker instance for usage within private functions (for example onBrowserCallback)
	
	/**
	 * @param {String} eventType
	 * @param {Object} data
	 */
	function onBrowserCallback(eventType, data) {
		var dataVal;
		var position = new LatLng(data['position'].lat, data['position'].lng)
		switch (eventType) {
			case Marker.EVENT_TYPES.POSITION_CHANGED: 
				dataVal = {oldValue: options.position, newValue: position}
				options.position = position
				break;
			case Marker.EVENT_TYPES.CLICK:
			case Marker.EVENT_TYPES.DBLCLICK:
			case Marker.EVENT_TYPES.RIGHTCLICK:
				break;
			default:
				application.output('Unknown Marker eventType: ' + eventType)
				return;
		}
		
		
		scopes.svyEventManager.fireEvent(markerSetup.id, eventType, new Event(eventType, thisInstance, position, dataVal));
		updateState()
	}
		
	/**
	 * @param {String} [methodName]
	 * @param {Array} [args]
	 */
	function updateState(methodName, args) {
		if (markerSetup.options.map) {
			/**@type {RuntimeForm<GoogleMap>}*/
			var map = forms[markerSetup.options.map.getId()]
			if (map) {
				var code
				if (methodName && map.isRendered()) {
					code = 'svyComp.objects[\'' + markerSetup.id + '\'].' + methodName + '('
					
					args.forEach(function(value,index,array){
						code += 'svyComp.JSON2Object(\'' + map.serializeObject(args[index]) + '\')'
						if (index != array.length - 1) {
							code += ','
						}
					})
					
					code += ');'
				}
				map.persistObject(markerSetup, code)
			} else {
				application.output('Trying to update a non-existing Component instance with ID "' + markerSetup.options.map.getId() + '"', LOGGINGLEVEL.ERROR)
			}
		}
	}

	/**
	 * Internal API: DO NOT CALL
	 * @return {Object}
	 */
	this.toJSON = function() {
		return {
			svySpecial: true, 
			type: 'reference', 
			parts: ['svyComp', 'objects', markerSetup.id]
		}
	}
	
	updateState();
	if (options.map) {
		forms[options.map.getId()].allObjectCallbackHandlers[markerSetup.id] = onBrowserCallback
	}
	
//	//Constants
//	this.MAX_ZINDEX

	//Public API
//	this.getAnimation = function() {
//		return _animation
//	}

//	this.setAnimation = function(animation) {
//	options.animation = animation
//	updateState('setAnimation', [animation])
//}

	this.getClickable = function() {
		return options.clickable
	}
	
	this.setClickable = function(flag) {
		options.clickable = flag
		updateState('setClickable', [flag])
	}
	
	this.getCursor = function() {
		return options.cursor
	}

	this.setCursor = function(cursor) {
		options.cursor = cursor
		updateState('setCursor', [cursor])
	}
	
	this.getDraggable = function() {
		return options.draggable;
	}
	
	this.setDraggable = function(draggable) {
		options.draggable = draggable
		updateState('setDraggable', [draggable])
	}
	
	this.getFlat = function() {
		return options.flat
	}
	
	this.setFlat = function(flat) {
		options.flat = flat
		updateState('setFlat', [flat])
	}
	
	this.getIcon = function() {
		return options.icon
	}
	
	this.setIcon = function(icon) {
		options.icon = icon
		updateState('setIcon', [icon])
	}
	
	this.getMap = function() {
		return options.map;
	}
	
	/**
	 * @param {Map} map
	 * @this {Marker}
	 */
	this.setMap = function(map) {
		if (options.map == map) {
			return
		}
		if (options.map != null) { 
			//TODO: make APi to add/remove subtypes
			forms[options.map.getId()].desistObject(markerSetup.id)
			forms[options.map.getId()].executeClientsideScript("svyComp.gmaps.removeMarker('" + markerSetup.id + "')")
			options.map = null
		}
		if (map) {
			options.map = map
			forms[map.getId()].allObjectCallbackHandlers[markerSetup.id] = onBrowserCallback
			updateState('setMap' ,[markerSetup.options.map])	
		}
	}
	
	/**
	 * @return {LatLng}
	 */
	this.getPosition = function() {
		return options.position
	}
	
	this.setPosition = function(latLng) {
		options.position = latLng;
		updateState('setPosition', [latLng])		
	}

	this.getShadow = function() {
		return options.shadow
	}

	this.setShadow = function(shadow) {
		options.shadow = shadow
		updateState('setShadow', [shadow])
	}
	
//	this.getShape = function() {
//		return options.shape
//	}

//	this.setShape = function(shape) {
//	options.shape = shape
//	updateState('setShape', [shape])
//}

	this.getTitle = function() {
		return options.title;
	}
	
	this.setTitle = function(title) {
		markerSetup.options.title = title
		updateState('setTitle', [markerSetup.options.title])
	}
	
	this.getVisible = function() {
		return options.visible
	}
	
	this.setVisible = function(visible) {
		options.visible = visible
		updateState('setVisible', [visible])
	}

	this.getZIndex = function() {
		return options.zIndex
	}
	
	this.setZIndex = function(zIndex) {
		options.zIndex = zIndex
		updateState('setZIndex', [zIndex])
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
	
	this.addClickListener = function(eventHandler) {
		scopes.svyEventManager.addListener(markerSetup.id, Marker.EVENT_TYPES.CLICK, eventHandler);
	}

	this.addDoubleClickListener = function(eventHandler) {
		scopes.svyEventManager.addListener(markerSetup.id, Marker.EVENT_TYPES.DBLCLICK, eventHandler);
	}

	this.addPositionChangedListener = function(eventHandler) {
		scopes.svyEventManager.addListener(markerSetup.id, Marker.EVENT_TYPES.POSITION_CHANGED, eventHandler);
	}

	this.addRightClickListener = function(eventHandler) {
		scopes.svyEventManager.addListener(markerSetup.id, Marker.EVENT_TYPES.RIGHTCLICK, eventHandler);
	}

	/**
	 * @param {String} type See scopes.modDataVis$googleMaps.Marker.EVENT_TYPES
	 * @param eventHandler
	 */
	this.removeListener = function(type, eventHandler) {
		scopes.svyEventManager.removeListener(markerSetup.id, type, eventHandler);
	}
	
	/**
	 * @this {Marker}
	 */
	this.toString = function() {
		var props = {
			title: this.getTitle(),
			position: this.getPosition()
		}
		return 'Marker<' + JSON.stringify(props)+ '>'
	}
}

/**
 * @protected 
 * @properties={typeid:35,uuid:"272963C4-B1BA-4B6E-B6A3-C347EC6D1460",variableType:-4}
 */
var setupMarker = function(){
	Marker.EVENT_TYPES = { 
		CLICK            : 'click',
		DBLCLICK         : 'dblclick',
	//	DRAG             : 'drag',
	//	DRAGEND          : 'dragend',
	//	DRAGSTART        : 'dragstart',
	//	MOUSEDOWN        : 'mousedown',
	//	MOUSEOUT         : 'mouseout',
	//	MOUSEOVER        : 'mouseover',
	//	MOUSEUP          : 'mouseup',
		POSITION_CHANGED : 'position_changed',
		RIGHTCLICK       : 'rightclick'
	}
}()

/**
 * An overlay that looks like a bubble and is often connected to a marker.<br>
 * <br>
 * Creates an info window with the given options. An InfoWindow can be placed on a map at a particular position or above a marker, depending on what is specified in the options. Unless auto-pan is disabled, an InfoWindow will pan the map to make itself visible when it is opened. After constructing an InfoWindow, you must call open to display it on the map. The user can click the close button on the InfoWindow to remove it from the map, or the developer can call close() for the same effect.<br>
 * @constructor
 * 
 * @param {String} options.content Content to display in the InfoWindow. This can be an HTML element, a plain-text string, or a string containing HTML. The InfoWindow will be sized according to the content. To set an explicit size for the content, set content to be a HTML element with that size.
 * @param {Boolean} [options.disableAutoPan] Disable auto-pan on open. By default, the info window will pan the map so that it is fully visible when it opens.
 * @param {Number} [options.maxWidth] Maximum width of the infowindow, regardless of content's width. This value is only considered if it is set before a call to open. To change the maximum width when changing content, call close, setOptions, and then open.
 * TODO @param {Size} [pixelOffset] The offset, in pixels, of the tip of the info window from the point on the map at whose geographical coordinates the info window is anchored. If an InfoWindow is opened with an anchor, the pixelOffset will be calculated from the anchor's anchorPoint property.
 * @param {LatLng} [options.position] The LatLng at which to display this InfoWindow. If the InfoWindow is opened with an anchor, the anchor's position will be used instead.
 * @param {Number} [options.zIndex] All InfoWindows are displayed on the map in order of their zIndex, with higher values displaying in front of InfoWindows with lower values. By default, InfoWinodws are displayed according to their latitude, with InfoWindows of lower latitudes appearing in front of InfoWindows at higher latitudes. InfoWindows are always displayed in front of markers.

 * 
 * TODO: improve: InfoWindows do not belong to a map by default, but within Servoy it makes sense to offer this option, for performance reasons. Maybe link to an Anchor only (anchor is on Map )
 * @properties={typeid:24,uuid:"1E81E90E-BBDA-4D0C-8AB9-467196F292BC"}
 */
function InfoWindow(options) {
	var isShowing = false
	var infoWindowSetup = {
		id: scopes.modComponent.getUID(),
		mapId: null,
		type: "infoWindow",
		options: options
	}
	
	var thisInstance = this //Storing reference to the Marker instance for usage within private functions (for example onBrowserCallback)
	
	/**
	 * Internal API: DO NOT CALL
	 * @return {Object}
	 */
	this.toJSON = function() {
		return {
			svySpecial: true, 
			type: 'reference', 
			parts: ['svyComp', 'objects', infoWindowSetup.id]
		}
	}
	
	/**
	 * @param {String} eventType
	 * @param {Object} data
	 */
	function onBrowserCallback(eventType, data) {
		switch (eventType) {
			case 'closeclick':
				isShowing = false
				break;
			default:
				application.output('Unknown InfoWindow eventType: ' + eventType)
				return;
		}
		
		scopes.svyEventManager.fireEvent(infoWindowSetup.id, eventType, new Event(eventType, thisInstance));
	}
	
	/**
	 * @return {String}
	 */
	this.getContent = function() {
		return options.content;
	}

	/**
	 * @param {String} content
	 */
	this.setContent = function(content) {
		options.content = content;
		if (isShowing) {
			scopes.svyWebClientUtils.executeClientsideScript('svyComp.objects[\'' + infoWindowSetup.id + '\'].setContent(svyComp.JSON2Object(\'' + forms.GoogleMap.serializeObject(content) + '\'));')
		}
	}
	
	/**
	 * @return {LatLng}
	 */
	this.getPosition = function() {
		return options.position;
	}

	/**
	 * @param {LatLng} position
	 */
	this.setPosition = function(position) {
		options.position = position;
		//No need to update if showing: gmaps won't the position of a visible InfoWindow anyway
	}
	
	/**
	 * @return {Number}
	 */
	this.getZIndex = function() {
		return options.zIndex;
	}
	
	/**
	 * @param {Number} number
	 */
	this.setZIndex = function(number) {
		options.zIndex = number;
	}
	
	/**
	 * Opens this InfoWindow on the given map. Optionally, an InfoWindow can be associated with an anchor. In the core API, the only anchor is the Marker class. However, an anchor can be any MVCObject that exposes a LatLng position property and optionally a Point anchorPoint property for calculating the pixelOffset (see InfoWindowOptions). The anchorPoint is the offset from the anchor's position to the tip of the InfoWindow.
	 * @param {Map} mp Map to show the Infowindow on
	 * @param {Marker} [mkr] anchor to which the InforWidnow should be linked
	 * @this {InfoWindow}
	 */
	this.open = function(mp, mkr) { 
		//FIXME: this method doesn't take into account if the MAP is already rendered or not. works fine in WC, but not in SC where code gets executed immediatly
		//TODO: handle the scenario where a InfoWindow is re-opened on another Map
		//TODO: should we handle opening the InfoWindow if already open?
		if (!mp) {
			throw scopes.svyExceptions.IllegalArgumentException('Map (mp) argument cannot be null')
		} else if (!(mp instanceof Map)) {
			throw scopes.svyExceptions.IllegalArgumentException('Map (mp) argument must be of type Map')			
		}
		if (mkr) {
			if (mp != mkr.getMap()) {
				application.output('Trying to show Infowindow om map X positioned by a Marker located om Map Y. Ignorimg supplied Map X' , LOGGINGLEVEL.WARNING)
			}
		} else if (!this.getPosition()) {
			application.output('Either a Position must be set or an anchor supplied in order to open a Infowindow' , LOGGINGLEVEL.WARNING)
		}
		
		infoWindowSetup.mapId = mp.getId()
		forms[mp.getId()].allObjectCallbackHandlers[infoWindowSetup.id] = onBrowserCallback
		
		isShowing = true
		forms[mp.getId()].executeClientsideScript('svyComp.gmaps[\'' + infoWindowSetup.id + '\']=\'' +  forms.GoogleMap.serializeObject(infoWindowSetup) + '\';svyComp.gmaps.initialize(\'' + infoWindowSetup.id +'\');')
		var s = { svySpecial: true, type: 'call', parts: ['svyComp', 'objects',infoWindowSetup.id,'open'], args: [mp, mkr] }
		var tmp = scopes.modComponent.getUID()
		forms[mp.getId()].executeClientsideScript('svyComp.gmaps[\'' + tmp + '\']=\'' +  forms.GoogleMap.serializeObject(s) + '\';svyComp.gmaps.initialize(\'' + tmp +'\');')
	}
	
	/**
	 * Closes this InfoWindow
	 */
	this.close = function() {
		delete forms[infoWindowSetup.mapId].allObjectCallbackHandlers[infoWindowSetup.id]
		infoWindowSetup.mapId = null
		isShowing = false
		//TODO: test
		scopes.svyWebClientUtils.executeClientsideScript('svyComp.objects[' + infoWindowSetup.id + '].close(); delete svyComp.objects[' + infoWindowSetup.id  + '];') //TODO: this seems to be done in the event handler on the client already
	}
	
	this.addOnCLoseListener = function(eventHandler) {
		scopes.svyEventManager.addListener(infoWindowSetup.id, InfoWindow.EVENT_TYPES.CLOSECLICK, eventHandler);
	}
	
	/**
	 * @param {String} type See scopes.modDataVis$googleMaps.InfoWindow.EVENT_TYPES
	 * @param eventHandler
	 */
	this.removeListener = function(type, eventHandler) {
		scopes.svyEventManager.removeListener(infoWindowSetup.id, type, eventHandler);
	}

//	/**
//	 * @param {Object} opts
//	 */
//	this.setOptions = function(opts) {
//		options = opts;
//	}
}

/**
 * @protected 
 * @properties={typeid:35,uuid:"88E6E0EC-7D75-4496-9861-3817E1DE316B",variableType:-4}
 */
var setupinfoWindow = function(){
	InfoWindow.EVENT_TYPES = {
		CLOSECLICK: 'closeclick'
		//CONTENT_CHANGED: 'content_changed',
		//DOMREADY: 'domready',
		//POSITION_CHANGED: 'position_changed',
		//ZINDEX_CHANGED: 'zindex_changed'
	}
}()

/* TODO: persist switching to streetview: http://stackoverflow.com/questions/7251738/detecting-google-maps-streetview-mode && http://stackoverflow.com/questions/6529459/implement-google-maps-v3-street-view
 * TODO: Impl. missing Types used in options
 * TODO: setting Projection and related events: make sense to have?
 * 
 * TODO param {MapTypeControlOptions} [options.mapTypeControlOptions]
 * TODO param {OverviewMapControlOptions} [options.overviewMapControlOptions]
 * TODO param {PanControlOptions} [options.panControlOptions]
 * TODO param {RotateControlOptions} [options.rotateControlOptions]
 * TODO param {ScaleControlOptions} [options.scaleControlOptions]
 * TODO param {StreetViewPanorama} [options.streetView]
 * TODO param {StreetViewControlOptions} [options.streetViewControlOptions]
 * TODO param {Array<MapTypeStyle>} [options.styles]
 * TODO param {ZoomControlOptions} [options.zoomControlOptions] 
 */
/**
 * Google Map impl.
 * 
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
 * @param {Boolean} [options.streetViewControl]
 * @param {Number} [options.tilt]
 * @param {Number} options.zoom
 * @param {Boolean} [options.zoomControl]
 * 
 * @properties={typeid:24,uuid:"1E5BE0D4-5E7A-489D-AACA-7BECA54B2CD1"}
 */
function Map(container, options) {
	/**@type {RuntimeForm<GoogleMap>}*/
	var dv = scopes.modComponent.createVisualizationContainer(container, 'GoogleMap')
	
	dv.addJavaScriptDependancy("media:///googleMapsHandler.js")
//	//TODO: DomReady script is not the correct way, as it gets fired multiple times. Worked around it now in the svyComp.gmaps.loadApi function
//	scopes.svyWebClientUtils.addOnDOMReadyScript('svyComp.gmaps.loadApi(' + (apiClientId ? 'null' : '\'' + apiKey + '\'') + ',\'' + apiClientId + '\',false)', dv)
	dv.setAPICredentials(apiKey, apiClientId)

	var mapSetup = {
		id: dv.getId(),
		type: "map",
		options: options
	}
	
	/**
	 * Internal API, DO NOT CALL
	 * @return {Object}
	 */
	this.toJSON = function() {
		return {
			svySpecial: true, 
			type: 'reference', 
			parts: ['svyComp', 'objects', mapSetup.id]
		}
	}
	
	/**
	 * Internal API, DO NOT CALL
	 * @return {String}
	 */
	this.getId = function() {
		return mapSetup.id;
	}
	
	var thisInstance = this
	
	function onBrowserCallback(eventType, data) {
		if (eventType == 'idle') { //Handling majority of the events through the idle event, to prevent event firing galore
			//bounds_changed
			var sw = new LatLng(data.bounds.sw.lat, data.bounds.sw.lng)
			var ne = new LatLng(data.bounds.ne.lat, data.bounds.ne.lng)
			var newBounds = new LatLngBounds(sw,ne);
			if (!mapSetup.options['bounds'] || !mapSetup.options['bounds'].equals(newBounds)) {
				dataVal = {oldValue: mapSetup.options['bounds'], newValue: newBounds}
				mapSetup.options['bounds'] = newBounds;
				scopes.svyEventManager.fireEvent(mapSetup.id, eventType, new Event(eventType, thisInstance, null, data));
			}

			//center_changed
			var newCenter = new LatLng(data.center.lat, data.center.lng);
			if (!mapSetup.options.center || !mapSetup.options.center.equals(newCenter)) {
				dataVal = {oldValue: mapSetup.options.center, newValue: newCenter}
				mapSetup.options.center = newCenter;
				scopes.svyEventManager.fireEvent(mapSetup.id, eventType, new Event(eventType, thisInstance, null, dataVal));
			}
			
			//projection_changed
//			if (o.projection != options.projection) {
//				
//				scopes.svyEventManager.fireEvent(mapSetup.id, Map.EVENT_TYPES.ZOOM_CHANGED, [Map.EVENT_TYPES.ZOOM_CHANGED, data]);
//			}
			
			//zoom_changed
			if (data.zoom != mapSetup.options.zoom) {
				dataVal = {oldValue: mapSetup.options.zoom, newValue: data.zoom}
				mapSetup.options.zoom = data.zoom;
				scopes.svyEventManager.fireEvent(mapSetup.id, eventType, new Event(eventType, thisInstance, null, dataVal));
			}
		} else {
			var dataVal
			var position
			switch (eventType) {
				case Map.EVENT_TYPES.CLICK: //Intentional fallthrough
				case Map.EVENT_TYPES.DBLCLICK:
				case Map.EVENT_TYPES.RIGHTCLICK:
					position = new LatLng(data.position.lat, data.position.lng)
					break; 
				case Map.EVENT_TYPES.HEADING_CHANGED:
					dataVal = {oldValue: mapSetup.options.heading, newValue: data}
					mapSetup.options.heading = parseInt(data)
					break;
				case Map.EVENT_TYPES.MAPTYPEID_CHANGED:
					dataVal = {oldValue: mapSetup.options.mapTypeId, newValue: data}
					mapSetup.options.mapTypeId = data
					break;
				case Map.EVENT_TYPES.TILT_CHANGED:
					dataVal = {oldValue: mapSetup.options.tilt, newValue: data}
					mapSetup.options.tilt = data
					break;
				default:
					application.output('Unknown Map eventType: ' + eventType)
					return;
			}
			scopes.svyEventManager.fireEvent(mapSetup.id, eventType, new Event(eventType, thisInstance, position, dataVal));
		}
		
		updateState()
	}
	
	dv.allObjectCallbackHandlers[mapSetup.id] = onBrowserCallback
	dv = null
		
	/**
	 * @param {String} [methodName]
	 * @param {Array} [args]
	 */
	function updateState(methodName, args) {
		/**@type {RuntimeForm<GoogleMap>}*/
		var map = forms[mapSetup.id]
		if (map) {
			var code
			if (methodName && map.isRendered()) {
				code = 'svyComp.objects[\'' + mapSetup.id + '\'].' + methodName + '('
				
				for (var j = 0; j < args.length; j++) {
					var value = args[j]
					switch (typeof value) {
						case 'string':
							code += "'" + value + "',"
							break
						case 'number':
						case 'boolean':
						case 'undefined':
							code += value + ','
							break;
						default:
							code += "svyComp.JSON2Object('" + map.serializeObject(value) + "'),"	
							break;
					}
				}
				code = code.slice(0,-1) + ');'
			}
			map.persistObject(mapSetup, code)
		} else {
			application.output('Trying to update a non-existing Component instance with ID "' + mapSetup.id + '"', LOGGINGLEVEL.ERROR)
		}
	}
	
	updateState()
	
	/* Scripting API
	 */
	/**
	 * Sets the viewport to contain the given bounds.
	 * @param {LatLngBounds} bounds
	 */
	this.fitBounds = function(bounds) {
		updateState('fitBounds', [bounds])
	}

	/**
	 * Returns the lat/lng bounds of the current viewport.<br>
	 * If more than one copy of the world is visible, the bounds range in longitude from -180 to 180 degrees inclusive.<br>
	 * If the map is not yet initialized (i.e. the mapType is still null), or center and zoom have not been set then the result is null or undefined.
	 * 
	 * @return {LatLngBounds}
	 */
	this.getBounds = function() {
		/** @type {LatLngBounds} */
		var bounds = mapSetup.options['bounds']
		return bounds
	}

	
	/**
	 * Returns the position displayed at the center of the map. Note that this LatLng object is not wrapped. See {@link #LatLng} for more information.
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
	 * Returns the compass heading of aerial imagery. The heading value is measured in degrees (clockwise) from cardinal direction North.
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
//   * Returns the current Projection. If the map is not yet initialized (i.e. the mapType is still null) then the result is null.<br>
//   * Listen to projection_changed and check its value to ensure it is not null.
//	 * @return {Projection}
//	 */
//	this.getProjection = function() {
//		return options.projection
//	}
//
//	/**
//   * Returns the default StreetViewPanorama bound to the map, which may be a default panorama embedded within the map, or the panorama set using setStreetView().<br>
//   * Changes to the map's streetViewControl will be reflected in the display of such a bound panorama.
//	 * @return {StreetViewPanorama}
//	 */
//	this.getStreetView = function() {
//	}

	/**
	 * Returns the angle of incidence for aerial imagery (available for SATELLITE and HYBRID map types) measured in degrees from the viewport plane to the map plane.<br>
	 * A value of 0 indicates no angle of incidence (no tilt) while 45° imagery will return a value of 45.
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
	 * Changes the center of the map by the given distance in pixels.<br>
	 * If the distance is less than both the width and height of the map, the transition will be smoothly animated.<br>
	 * Note that the map coordinate system increases from west to east (for x values) and north to south (for y values).
	 * @param {Number} x
	 * @param {Number} y
	 */
	this.panBy = function(x, y) {
		//No state update, because no way to determine the new center. State will be updated async
		scopes.svyWebClientUtils.executeClientsideScript('svyComp.objects[\'' + mapSetup.id + '\'].panBy(' + x + ','+ y + ');')		
	}

	/**
	 * Changes the center of the map to the given LatLng. If the change is less than both the width and height of the map, the transition will be smoothly animated.
	 * @param {LatLng} latLng
	 */
	this.panTo = function(latLng) {
		options.center = latLng;
		updateState('var latLng = svyComp.JSON2Object(\'' + forms.GoogleMap.serializeObject(latLng) + '\');svyComp.objects[\'' + mapSetup.id + '\'].panTo(latLng);')		
	}

	/**
	 * Pans the map by the minimum amount necessary to contain the given LatLngBounds.<br>
	 * It makes no guarantee where on the map the bounds will be, except that as much of the bounds as possible will be visible.<br>
	 * The bounds will be positioned inside the area bounded by the map type and navigation (pan, zoom, and Street View) controls, if they are present on the map.<br>
	 * If the bounds is larger than the map, the map will be shifted to include the northwest corner of the bounds.<br>
	 * If the change in the map's position is less than both the width and height of the map, the transition will be smoothly animated.
	 * @param {LatLngBounds} bounds
	 */
	this.panToBounds = function(bounds){
		//CHEKCME: why using WCUtils plugin here and not update state?
		scopes.svyWebClientUtils.executeClientsideScript('var bounds = svyComp.JSON2Object(\'' + forms.GoogleMap.serializeObject(bounds) + '\'svyComp.JSON2Object();svyComp.objects[\'' + mapSetup.id + '\'].panToBounds(bounds);')
	}

	/**
	 * @param {LatLng} latLng
	 */
	this.setCenter = function(latLng) {
		options.center = latLng
		updateState('setCenter',[latLng])
	}

	/**
	 * Sets the compass heading for aerial imagery measured in degrees from cardinal direction North.
	 * @param {Number} heading
	 */
	this.setHeading = function(heading) {
		options.heading = heading
		updateState('setHeading', [heading])
	}

	/**
	 * @param {String} mapTypeId
	 */
	this.setMapTypeId = function(mapTypeId) {
		options.mapTypeId = mapTypeId
		updateState('setMapTypId', [mapTypeId])
	}

//	/**
//	 * @param {MapOptions} options
//	 */
//	this.setOptions = function(options) {
//	}

//	/**
//   * Binds a StreetViewPanorama to the map. This panorama overrides the default StreetViewPanorama, allowing the map to bind to an external panorama outside of the map.<br>
//   * Setting the panorama to null binds the default embedded panorama back to the map.
//	 * @param {StreetViewPanorama} panorama
//	 */
//	this.setStreetView = function(panorama) {}
	
	/**
	 * Sets the angle of incidence for aerial imagery (available for SATELLITE and HYBRID map types) measured in degrees from the viewport plane to the map plane.<br>
	 * The only supported values are 0, indicating no angle of incidence (no tilt), and 45 indicating a tilt of 45deg;.
	 * @param {Number} tilt
	 */
	this.setTilt = function(tilt) {
		options.tilt = tilt
		updateState('setTilt', [tilt])
	}
	
	/**
	 * @param {Number} zoom
	 */
	this.setZoom = function(zoom) {
		options.zoom = zoom
		updateState('setZoom', [zoom])
	}
	
//	this.controls = [] //TODO: implement what needs implementing for this property
//	
//	this.mapTypes = null //TODO: implement what needs implementing for this property
//	
//	this.overlayMapTypes = [] //TODO: implement what needs implementing for this property
	
	/**
	 * @param {Function} eventHandler
	 */
	this.addBoundChangedListener = function(eventHandler) {
		scopes.svyEventManager.addListener(mapSetup.id, Map.EVENT_TYPES.BOUNDS_CHANGED, eventHandler);
	}
	
	/**
	 * @param {Function} eventHandler
	 */
	this.addCenterChangedListener = function(eventHandler) {
		scopes.svyEventManager.addListener(mapSetup.id, Map.EVENT_TYPES.CENTER_CHANGED, eventHandler);
	}
	
	/**
	 * @param {Function} eventHandler
	 */
	this.addClickListener = function(eventHandler) {
		scopes.svyEventManager.addListener(mapSetup.id, Map.EVENT_TYPES.CLICK, eventHandler);
	}
	
	/**
	 * @param {Function} eventHandler
	 */
	this.addDoubleClickListener = function(eventHandler) {
		scopes.svyEventManager.addListener(mapSetup.id, Map.EVENT_TYPES.DBLCLICK, eventHandler);
	}	
	
	/**
	 * @param {Function} eventHandler
	 */
	this.addHeadingChangedListener = function(eventHandler) {
		scopes.svyEventManager.addListener(mapSetup.id, Map.EVENT_TYPES.HEADING_CHANGED, eventHandler);
	}	
	
	/**
	 * @param {Function} eventHandler
	 */
	this.addMapTypeIdListener = function(eventHandler) {
		scopes.svyEventManager.addListener(mapSetup.id, Map.EVENT_TYPES.MAPTYPEID_CHANGED, eventHandler);
	}	
	
	/**
	 * @param {Function} eventHandler
	 */
	this.addProjectionChangedListener = function(eventHandler) {
		scopes.svyEventManager.addListener(mapSetup.id, Map.EVENT_TYPES.PROJECTION_CHANGED, eventHandler);
	}	

	/**
	 * @param {Function} eventHandler
	 */
	this.addRightClickListener = function(eventHandler) {
		scopes.svyEventManager.addListener(mapSetup.id, Map.EVENT_TYPES.RIGHTCLICK, eventHandler);
	}	
	
	/**
	 * @param {Function} eventHandler
	 */
	this.addTiltChangedListener = function(eventHandler) {
		scopes.svyEventManager.addListener(mapSetup.id, Map.EVENT_TYPES.TILT_CHANGED, eventHandler);
	}		
	
	/**
	 * @param {Function} eventHandler
	 */
	this.addZoomChangedListener = function(eventHandler) {
		scopes.svyEventManager.addListener(mapSetup.id, Map.EVENT_TYPES.ZOOM_CHANGED, eventHandler);
	}
	
	/**
	 * @param {String} type See scopes.modDataVis$googleMaps.Map.EVENT_TYPES
	 * @param eventHandler
	 */
	this.removeListener = function(type, eventHandler) {
		scopes.svyEventManager.removeListener(mapSetup.id, type, eventHandler);
	}
}

/**
 * @protected //Can't use inheritance, but using @protected instead of @private doesn't result in a builder marker that initMap is never used
 * @properties={typeid:35,uuid:"EFFB21C7-0C82-493F-8848-35FBA73DB840",variableType:-4}
 */
var setupMap = function () {
	Map.EVENT_TYPES = {
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
		RIGHTCLICK: 'rightclick',
		//TILESLOADED: 'tilesloaded',
		TILT_CHANGED: 'tilt_changed',
		ZOOM_CHANGED: 'zoom_changed'
	}
}()

///**
//* @constructor
//*
//* @properties={typeid:24,uuid:"9EF66E47-FA7E-4D26-9DCA-5A3DCA610C21"}
//*/
//function Animation() {
//	//TODO: implement
//}

///**
//* @constructor
//*
//* @properties={typeid:24,uuid:"4A0B07DF-42B0-4C50-A1E8-CCD43AF62A9E"}
//*/
//function MarkerImage() {
//	//TODO: implement
//}

///**
//* @constructor
//*
//* @properties={typeid:24,uuid:"16134509-41A8-45D9-8D63-BE232A780502"}
//*/
//function MarkerShape() {
//	//TODO: implement
//}

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
