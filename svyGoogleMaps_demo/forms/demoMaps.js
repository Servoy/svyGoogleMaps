/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"362D8669-19ED-4B17-9565-17841C9668C6"}
 */
var searchResults = '<html><i>- empty -</i></html>';

/**
 * @properties={typeid:35,uuid:"A3DA240A-29B5-4522-AA80-BE8B53BA089B",variableType:-4}
 */
var log = scopes.svyLogManager.getLogger('maps.demo')

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"43F1480D-770D-4956-ADFD-F47FB95C65D2"}
 */
var searchAddress = null;

/**
 * Holds all the created Maps with all their markers and the related infoWindows
 *
 * @type {Array<{map: scopes.svyGoogleMaps.Map, markers: Array<{marker: scopes.svyGoogleMaps.Marker, info: scopes.svyGoogleMaps.InfoWindow}>}>}
 *
 * @properties={typeid:35,uuid:"2B79B626-CC8A-48C1-97CE-23EE1A112504",variableType:-4}
 */
var maps = [];

/**
 * @type {Boolean}
 *
 * @properties={typeid:35,uuid:"557BEFC0-9A14-4CC0-B5C2-EF26EF50BDE6",variableType:-4}
 */
var autoUpdate = false;

/**
 * Callback method when form is (re)loaded.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @properties={typeid:24,uuid:"0E7955A7-9E2A-4921-90F6-5F4CA99426A8"}
 */
function onLoad(event) {

	//Instantiate GoogleMaps
	var gmaps = scopes.svyGoogleMaps;
	var map = new gmaps.Map(elements.maps, {
				zoom: 8,
				center: new gmaps.LatLng(-34.397, 150.644),
				mapTypeId: gmaps.MapTypeIds.HYBRID
			})
	maps.push({ map: map, markers: [] })

	var map2 = new gmaps.Map(elements.map2, {
				zoom: 2,
				center: new gmaps.LatLng(30, 20),
				mapTypeId: gmaps.MapTypeIds.TERRAIN,
				overviewMapControl: true,
				panControl: true,
				rotateControl: true,
				scaleControl: true,
				zoomControl: true,
				mapMaker: false
			})

	//Adding markers
	var m = new gmaps.Marker({
			position: new gmaps.LatLng(0, 0),
			draggable: true,
			title: 'Hello marker'
		});
	m.setMap(map2)

	// Retrieve address coordinates and add a marker
	var pos = getLatLng(geocode('De Brand 65 3823 LJ Amersfoort')[0])
	if (!pos) {
		maps.push({ map: map2, markers: [] })
	} else {
		var m2 = new gmaps.Marker({
				position: new gmaps.LatLng(pos.lat, pos.lng),
				draggable: false,
				title: 'Servoy HQ',
				map: map2
			});
		m2.addClickListener(openInfoWindow)
		m2.addDoubleClickListener(setBoundsToMarker)
		m2.addRightClickListener(callbackLogger)

		// add a custom infoWindow to the marker
		var i2 = new gmaps.InfoWindow({
				content: scopes.svyWebClientUtils.XHTML2Text(<div>
				<b>Servoy BV</b>   <a href="http://www.servoy.com" target="new">more information</a>
				<p>De Brand 65<br/>
				3823 LJ Amersfoort<br/>
				The Netherlands<br/>
				Voice: +31 33 455 9877<br/>
				Fax: +31 84 883 2297<br/>
				<br/>
				<span style="display: block;width: 100%; height: 1px; border: 0px solid lightgray; border-bottom-width: 1px"/>
				<br/>
				<a href="javascript:void()">20 likes</a>
				</p>
			</div>)

			});

		// persist the object in a form variable
		var markers2 = []
		markers2.push({ marker: m, info: null })
		markers2.push({ marker: m2, info: i2 })
		maps.push({ map: map2, markers: markers2 })

		// open the marker window
		i2.open(map2, m2);
	}
}

/**
 * @properties={typeid:24,uuid:"A8586DD2-8F13-44A3-9D40-6D228AA1E3FE"}
 * @param {scopes.svyGoogleMaps.Event} event
 */
function callbackLogger(event) {
	application.output("CALLBACK: " + event)
}

/**
 * @type {scopes.svyGoogleMaps.InfoWindow}
 *
 * @properties={typeid:35,uuid:"FF48F284-1E92-47BB-A896-65C5E41DFB1B",variableType:-4}
 */
var infoWindow;

/**
 * @param {scopes.svyGoogleMaps.Event} event
 *
 * @properties={typeid:24,uuid:"40D7F74B-B418-49AB-B777-7400C3063D0F"}
 */
function openInfoWindow(event) {
	/** @type {scopes.svyGoogleMaps.Marker} */
	var marker = event.getSource()

	// search for the stored marker object to retrieve the mapped info window
	var markers = maps[1].markers
	for (var i = 0; i < markers.length; i++) {
		if (markers[i].marker === marker) { // is the same marker object
			infoWindow = markers[i].info
			break;
		}
	}

	// open the marker info window
	infoWindow.open(marker.getMap(), marker);
	if (scopes.svySystem.isWebClient()) {
		scopes.svyWebClientUtils.updateUI()
	}
}

/**
 * get Latitude and Longitude of a GeoCode Result
 *
 * @param {Object} geocodeResult
 * @return {{lat: Number, lng: Number}}
 *
 * @properties={typeid:24,uuid:"4E8ABE77-24E7-4EB2-9150-61B573CE0A87"}
 */
function getLatLng(geocodeResult) {
	if (geocodeResult) {
		return { lat: geocodeResult['geometry'].location.lat, lng: geocodeResult['geometry'].location.lng }
	}
	return null
}

/**
 * Warning: this function utilizes Google Maps API. See https://developers.google.com/maps/terms#section_10_12 for the Terms of Service
 *
 * @see https://developers.google.com/maps/documentation/geocoding/
 *
 * @param {String} address
 * @return {Array<Object>}
 *
 * @properties={typeid:24,uuid:"11D10E64-7F7C-467C-B830-EDD71363FA84"}
 */
function geocode(address) {
	var baseUrl = 'http://maps.googleapis.com/maps/api/geocode/json?'
	var url = baseUrl + 'address=' + encodeURIComponent(address) + '&sensor=false'
	var client = plugins.http.createNewHttpClient()
	var request = client.createGetRequest(url)
	var response = request.executeRequest()
	if (response && response.getStatusCode() == plugins.http.HTTP_STATUS.SC_OK) {
		/** @type {{results: Array<{}>, status: String}}*/
		var result = JSON.parse(response.getResponseBody())
		if (result.status == 'OK') {
			return result.results

		}
	}
	return null
}

/**
 * fit the map bounds in order to show all the markers
 * 
 * @properties={typeid:24,uuid:"69E58355-C88D-410F-917A-57E4DF117C8C"}
 */
function fitBounds() {
	var markers = maps[1].markers
	if (markers.length > 1) { // center the map on the second marker
		var bounds = new scopes.svyGoogleMaps.LatLngBounds(markers[0].marker.getPosition(), markers[0].marker.getPosition())
		for (var z = 1; z < markers.length; z++) {
			bounds.extend(markers[z].marker.getPosition())
		}
		maps[1].map.fitBounds(bounds);
	}
}

/**
 * @param {scopes.svyEventManager.Event} event
 * 
 * @properties={typeid:24,uuid:"8AB963F7-4D37-4CF9-A67B-A203D26FF343"}
 */
function setBoundsToMarker(event) {
	/** @type {scopes.svyGoogleMaps.Marker} */
	var marker = event.getSource()
	var bounds = new scopes.svyGoogleMaps.LatLngBounds(marker.getPosition(), marker.getPosition())
	var map = marker.getMap()
	map.fitBounds(bounds);
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"4F26DCC2-3983-4D57-A04D-16838B608665"}
 */
function searchFoAddress(event) {
	var gmaps = scopes.svyGoogleMaps;
	var map2 = maps[1].map
	var markers = maps[1].markers
	
	// remove all markers except the first 2
	for (var j = markers.length; j > 2; j--) {
		var marker = markers.pop().marker
		marker.setMap(null)
	}
	
	// search fo the specific address or place
	if (searchAddress) {
		var results = geocode(searchAddress)
		searchResults = '<html>'

		// add all results as markers on map
		for (var i = 0; i < results.length; i++) {
			var result = results[i]
			
			searchResults +=' ' + (i+1) + '.  ' + result['formatted_address'] + '<br/><hr/>'
			
			var pos = getLatLng(result)
			log.warn(result)

			var m = new gmaps.Marker({
					position: new gmaps.LatLng(pos.lat, pos.lng),
					draggable: false,
					title: result['formatted_address'],
					map: map2
				});
			m.addClickListener(openInfoWindow)
			m.addDoubleClickListener(setBoundsToMarker)
			m.addRightClickListener(callbackLogger)

			// add a custom infoWindow to the marker
			var info = new gmaps.InfoWindow({
					content: '<div>\
						\<b>' + (i+1) + '. ' + result['formatted_address'] + '</b>\
						<p>Double click to zoom.\
						</p>\
					</div>'
				});

			maps[1].markers.push({ marker: m, info: info })
		}
		searchResults += '</html>'
		fitBounds()
	} else {
		searchResults = '<html><i>- empty -</i></html>'
	}
}
