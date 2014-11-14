svyGoogleMaps
=============

GoogleMaps component for Servoy clients


Getting started
-------------
To use the svyGoogleMaps modules download the [svyGoogleMaps.zip](https://github.com/Servoy/svyGoogleMaps/releases) file extract the .servoy files and import them into your workspace. 
To use the GoogleMaps component add the svyGoogleMaps module to the active solution;
the googleMaps will render inside a tabless panel placed on yuor form.
Use the Map constructor from the svyGoogleMaps scope to load the map into the tabless panel:

var map = new gmaps.Map(elements.maps, {zoom: 8, center: new gmaps.LatLng(-34.397, 150.644),})

To use the latest source code clone the git repository and checkout the develop branch. Install the [egit](http://www.eclipse.org/egit/download/) plugin for Eclipse to clone the repository and import the projects into the workspace.


Documentation
-------------
See the [Wiki](https://github.com/Servoy/svyGoogleMaps/wiki) for the available documentation


Feature Requests & Bugs
-----------------------
Found a bug or would like to see a new feature implemented? Raise an issue in the [Issue Tracker](https://github.com/Servoy/svyGoogleMaps/issues)


Contributing
-------------
Eager to fix a bug or introduce a new feature? Clone the repository and issue a pull request


License
-------
svyGoogleMaps is licensed under LGPL
