var MapTrack = function(map, stormTracks) {
	this._color = Colors.nextColor();
	this._map = map;
	this._stormTracks = stormTracks;
	this._track = null;
	this._markers = null;
	this._centerX = 0;
	this._centerY = 0;
	this._minX = 0;
	this._maxX = 0;
	this._minY = 0;
	this._maxY = 0;
	this._polyOptions = { 
		strokeColor: this._color, 
		strokeOpacity: 1.0, 
		strokeWeight: 1 
	}; 
	this._polyOptionsHighlighted = { 
		strokeColor: 'Yellow', 
		strokeOpacity: 1.0, 
		strokeWeight: 3
	}; 
	this.destroy = function() {
		if (this._markers) {
			for (var ii = 0; ii < this._markers.length; ii++) {
				this._markers[ii].setMap(null);
			}
			this._markers = null;
		}
		if (this._track) {
			this._track.setMap(null);
			this._track = null;
		}
	}
	this.highlightTrack = function() {
		if (this._track) {
			this._track.setOptions(this._polyOptionsHighlighted);
		}
	}
	this.unhighlightTrack = function() {
		if (this._track) {
			this._track.setOptions(this._polyOptions);
		}
	}
	this.setTrack = function (stormTracks) {
		if (this._track) {
			this._track.setMap(null);
			this._track = null;
		}
		if (stormTracks && (stormTracks.length > 1)) {
			this._track = new google.maps.Polyline(this._polyOptions);
			var path = this._track.getPath();
			var prevTrack = stormTracks[0];
			for (var ii = 1; ii < stormTracks.length; ii++) {
				var currTrack = stormTracks[ii];
				var latlng1 = new google.maps.LatLng(prevTrack.y, prevTrack.x); 
				var latlng2 = new google.maps.LatLng(currTrack.y, currTrack.x);
				path.push(latlng1);
				path.push(latlng2);
				prevTrack = currTrack;
			}
			this._track.setMap(this._map);
		}
	}
	this.setMarkers = function(stormTracks) {
		if (this._markers) {
			for (var ii = 0; ii < this._markers.length; ii++) {
				this._markers[ii].setMap(null);
			}
			this._markers = null;
		}
		if (stormTracks && (stormTracks.length > 0)) {
			this._markers = new Array(stormTracks.length);
			for (var ii = 0; ii < stormTracks.length; ii++) {
				var latlng = new google.maps.LatLng(stormTracks[ii].y, stormTracks[ii].x);
				this._markers[ii] = new google.maps.Marker({ 
					position: latlng, 
					title: stormTracks[ii].status, 
					map: this._map });
				this._markers[ii].setClickable(true);
				this.setStormTrackInfo(this._map, this._markers[ii], stormTracks[ii]); 
			}
		}
	}
	this.setStormTrackInfo = function(map, marker, stormTrack) {
		var year = stormTrack.year.toString();
		var month = stormTrack.month.toString();
		var day = stormTrack.day.toString();
		var hours = stormTrack.hours.toString();
		var minutes = stormTrack.minutes.toString();
		if (month.length < 2) {
			month = "0" + month;
		}
		if (day.length < 2) {
			day = "0" + day;
		}
		if (hours.length < 2) {
			hours = "0" + hours;
		}
		if (minutes.length < 2) {
			minutes = "0" + minutes;
		}
		var message = "";
		message += "Date/Time: " + year + "-" + month + "-" + day + " " + hours + ":" + minutes + "<br />";
		message += "Name: " + stormTrack.stormName + "<br />";
		message += "Status: " + stormTrack.status + "<br />";
		message += "Wind Speed: " + stormTrack.maxWindSpeed.toString() + "<br />";
		if (stormTrack.minPressure != -999) {
			message += "Pressure: " + stormTrack.minPressure.toString();
		}
		var infowindow = new google.maps.InfoWindow({ content: message });
		google.maps.event.addListener(marker, 'click', function() { infowindow.open(map, marker); });
	}
	this.computeBounds = function(stormTracks) {
		if (stormTracks.length > 0) {
			var minX = stormTracks[0].x + 180;
			var maxX = stormTracks[0].x + 180;
			var minY = stormTracks[0].y + 90;
			var maxY = stormTracks[0].y + 90;
			var centerX = stormTracks[0].x + 180;
			var centerY = stormTracks[0].y + 90;
			for (var ii = 1; ii < stormTracks.length; ii++) {
				if ((stormTracks[ii].x + 180) > maxX) {
					maxX = stormTracks[ii].x + 180;
				}
				if ((stormTracks[ii].x + 180) < minX) {
					minX = stormTracks[ii].x + 180;
				}
				if ((stormTracks[ii].y + 90) > maxY) {
					maxY = stormTracks[ii].y + 90;
				}
				if ((stormTracks[ii].y + 90) < minY) {
					minY = stormTracks[ii].y + 90;
				}
				centerX += (stormTracks[ii].x + 180);
				centerY += (stormTracks[ii].y + 90);
			}
			this._centerX = (centerX / stormTracks.length) - 180;
			this._centerY = (centerY / stormTracks.length) - 90;
			this._minX = minX - 180;
			this._maxX = maxX - 180;
			this._minY = minY - 90;
			this._maxY = maxY - 90;
		}
	}
	this.setTrack(stormTracks);
	this.setMarkers(stormTracks);
	this.computeBounds(stormTracks);
};

var MyMap = function(mapId) {
	this._mapId = mapId;
	this._map = null;
	this._tracks = [];
	
	// TODO: Remember previous settings via cookie 
	//var southWest = new google.maps.LatLng(-31.203405,125.244141);
	//var northEast = new google.maps.LatLng(-25.363882,131.044922);
	//var bounds = new google.maps.LatLngBounds(southWest,northEast);
	//map.fitBounds(bounds);
	var center = new google.maps.LatLng(25.439439, -86.617337); 
	var myOptions = { 
		zoom: 4, 
		center: center, 
		mapTypeId: google.maps.MapTypeId.HYBRID 
	};
	
	this._map = new google.maps.Map(document.getElementById(mapId), myOptions);
	
	this.mapClick = function (mouseEvent) {
		;
	}
	google.maps.event.addListener(this._map, 'click', this.mapClick);

	this.setCenter = function(x, y) {
		var center = new google.maps.LatLng(y, x); 
		this._map.setCenter(center);
	}
	this.setZoom = function(zoom) {
		this._map.setZoom(zoom);
	}
	this.addTrack = function (stormTracks) {
		this._tracks[this._tracks.length] = new MapTrack(this._map, stormTracks);
	}
	this.clearTracks = function() {
		for (var ii = 0; ii < this._tracks.length; ii++) {
			this._tracks[ii].destroy();
		}
		this._tracks = [];
	}
	this.moveToCenter = function() {
		if (this._tracks.length > 0) {
			var minX = this._tracks[0]._minX + 180;
			var maxX = this._tracks[0]._maxX + 180;
			var minY = this._tracks[0]._minY + 90;
			var maxY = this._tracks[0]._maxY + 90;
			var centerX = this._tracks[0]._centerX + 180;
			var centerY = this._tracks[0]._centerY + 90;
			for (var ii = 1; ii < this._tracks.length; ii++) {
				if ((this._tracks[ii]._maxX + 180) > maxX) {
					maxX = this._tracks[ii]._maxX + 180;
				}
				if ((this._tracks[ii]._minX + 180) < minX) {
					minX = this._tracks[ii]._minX + 180;
				}
				if ((this._tracks[ii]._maxY + 90) > maxY) {
					maxY = this._tracks[ii]._maxY + 90;
				}
				if ((this._tracks[ii]._minY + 90) < minY) {
					minY = this._tracks[ii]._minY + 90;
				}
				centerX += this._tracks[ii]._centerX + 180;
				centerY += this._tracks[ii]._centerY + 90;
			}
			centerX = (centerX / this._tracks.length) - 180;
			centerY = (centerY / this._tracks.length) - 90;
			minX = minX - 180;
			maxX = maxX - 180;
			minY = minY - 90;
			maxY = maxY - 90;
			
			this.setCenter(centerX, centerY);
			
			var min = new google.maps.LatLng(minY, minX);
			var max = new google.maps.LatLng(maxY, maxX);
			var bounds = this._map.getBounds();
			if (!bounds.contains(min) || !bounds.contains(max)) {
				var newBounds = new google.maps.LatLngBounds(min, max);
				this._map.fitBounds(newBounds);
			}
		}
	}
	this.highlightTrack = function(stormNo) {
		for (var ii = 0; ii < this._tracks.length; ii++) {
			if (this._tracks[ii]._stormTracks[0]['stormNo'].toString().toLowerCase() == stormNo.toString().toLowerCase()) {
				this._tracks[ii].highlightTrack();
			}
		}
	}
	this.unhighlightTrack = function(stormNo) {
		for (var ii = 0; ii < this._tracks.length; ii++) {
			if (this._tracks[ii]._stormTracks[0]['stormNo'].toString().toLowerCase() == stormNo.toString().toLowerCase()) {
				this._tracks[ii].unhighlightTrack();
			}
		}
	}
};
