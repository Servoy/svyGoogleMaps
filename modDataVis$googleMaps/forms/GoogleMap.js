/**
 * @param {XML} DOM
 * @properties={typeid:24,uuid:"AE3E0E59-9B99-4DFA-98D3-4C1B3FADD672"}
 */
function render(DOM) {
	return; //It currently works without the stuff below...
//	var mrkrs = ''
//	for each(var marker in markers) {
//		marker.id = application.getUUID();
//		mrkrs += 'svyDataVis.' + getBrowserId() + '[\'' + marker.id + '\']=\'' + scopes.modDataVisualization.serializeObject(marker, scopes.modDataVis$googleMaps.specialTypes) + '\';'
//	}
//	if (mrkrs.length > 0) {
//		DOM.head.appendChild(<script>{mrkrs}</script>)
//	}
//	
//	var infWnds = ''
//	for each(var infoWindow in infoWindows) {
//		infoWindow.id = application.getUUID();
//		infWnds += 'svyDataVis.' + getBrowserId() + '[\'' + infoWindow.id + '\']=\'' + scopes.modDataVisualization.serializeObject(infoWindow, scopes.modDataVis$googleMaps.specialTypes) + '\';'
//	}
//	if (infWnds.length > 0) {
//		DOM.head.appendChild(<script>{infWnds}</script>)
//	}
//	application.output('-------------\n' + DOM.toXMLString() + '\n\n')
}

/**
 * Convenient Marker Store of all Markers on the map
 * When calling .setMap() on a marker, the Marker will be added to this Marker store on the relevant GoogleMap instance
 * 
 * @type {Array<scopes.modDataVis$googleMaps.Marker>}
 *
 * @properties={typeid:35,uuid:"48936C8B-13A3-4161-8317-6E3C06771FBB",variableType:-4}
 */
var markers = {};

/**
 * Convenient InfoWindow Store of all InfoWindows on the map
 * When calling .setMap() on a InfoWindow, the InfoWindow will be added to this InfoWindow store on the relevant GoogleMap instance
 * 
 * @type {Array<scopes.modDataVis$googleMaps.InfoWindow>}
 * 
 * @properties={typeid:35,uuid:"338AA542-9930-4C7E-AB35-8FBE03365573",variableType:-4}
 */
var infoWindows = {};

/**
 * @private
 * @properties={typeid:24,uuid:"74BE588A-8009-4633-A7D9-1D0AA80174B0"}
 */
function getBrowserId() {
	return 'gmaps'
}

/**
 *
 * @param o
 * @param {Array} specialTypes
 *
 * @properties={typeid:24,uuid:"3B85D8EA-C07D-44BB-B59B-7D12275AA988"}
 */
function serializeObject(o, specialTypes) {
	specialTypes = [
		scopes.modDataVis$googleMaps.LatLng, 
		scopes.modDataVis$googleMaps.MapTypeId, 
		scopes.modDataVis$googleMaps.Marker, 
		scopes.modDataVis$googleMaps.InfoWindow, 
		scopes.modDataVis$googleMaps.Map]
	return _super.serializeObject(o, specialTypes)
}
