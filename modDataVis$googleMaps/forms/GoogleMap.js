/**
 * @private
 * @properties={typeid:24,uuid:"74BE588A-8009-4633-A7D9-1D0AA80174B0"}
 */
function getBrowserId() {
	return 'gmaps'
}

/**
 * Internal API: DO NOT CALL
 * @param o
 * 
 * @properties={typeid:24,uuid:"3B85D8EA-C07D-44BB-B59B-7D12275AA988"}
 */
function serializeObject(o) {
	return _super.serializeObject(o, [
		scopes.modDataVis$googleMaps.LatLng, 
		scopes.modDataVis$googleMaps.MapTypeId, 
		scopes.modDataVis$googleMaps.Marker, 
		scopes.modDataVis$googleMaps.InfoWindow, 
		scopes.modDataVis$googleMaps.Map
		])
}