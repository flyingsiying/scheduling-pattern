mapboxgl.accessToken = 'pk.eyJ1IjoiZmx5aW5nc2l5aW5nIiwiYSI6ImNqM25oMmV4YTAwMWIzMnF0Z2owdjd4b3QifQ.Ms5WS32cgwUCYDrHLw0k8g';

var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/light-v9', // stylesheet location
    center: [-122.2, 37.6], // starting position [lng, lat]
    zoom: 9 // starting zoom
});


map.on('load', function(){

	map.addSource('zipcodeSource', {
      'type': 'geojson',
      'data': 'data/zipcode_areas.json'
  });

  var colors = ['#ffffe5', '#f7fcb9', '#d9f0a3', '#addd8e', '#78c679', '#41ab5d', '#238443', '#005a32'];
  var BREAKS = [0, 2, 5, 10, 20, 30, 40, 50];
  var gaps = ['0-2', '2-5', '5-10', '10-20', '20-30', '30-40', '40-50', '50+']

  var legend = document.getElementById('originsLegend');

  for (i = 0; i < gaps.length; i++) {
    var gap = gaps[i];
    var color = colors[i];
    var item = document.createElement('div');
    var key = document.createElement('span');
    key.className = 'legend-key';
    key.style.backgroundColor = color;

    var value = document.createElement('span');
    value.innerHTML = gap;
    item.appendChild(key);
    item.appendChild(value);
    legend.appendChild(item);
  }

	map.addLayer({
		'id': 'zipcode',
		'type': 'fill',
		'source': 'zipcodeSource',
		'paint': {
        "fill-color": {
            property: 'orig_ct',
            stops: [
        [BREAKS[0], colors[0]],
        [BREAKS[1], colors[1]],
        [BREAKS[2], colors[2]],
        [BREAKS[3], colors[3]],
        [BREAKS[4], colors[4]],
        [BREAKS[5], colors[5]],
        [BREAKS[6], colors[6]],
        [BREAKS[7], colors[7]]]
        },
        "fill-opacity": 0.7,
        "fill-outline-color": "#000"
    }
	});

  $("#select1").change(function(){
    var selected = $("#select1").val();
    var fillcolor = {
        property: selected,
        stops: [
    [BREAKS[0], colors[0]],
    [BREAKS[1], colors[1]],
    [BREAKS[2], colors[2]],
    [BREAKS[3], colors[3]],
    [BREAKS[4], colors[4]],
    [BREAKS[5], colors[5]],
    [BREAKS[6], colors[6]],
    [BREAKS[7], colors[7]]]
    };
    map.setPaintProperty('zipcode', 'fill-color', fillcolor);
  });

	map.addSource('tripSource', {
		'type': 'geojson',
		'data': 'data/trips.json'
	});

	map.addLayer({
		'id': 'trips',
		'type': 'line',
		'source': 'tripSource',
		"layout": {
      "line-join": "round",
      "line-cap": "round",
      "visibility": "none"
    },
    "paint": {
      "line-color": "#0570b0",
      "line-width": 2,
      "line-opacity": 0.3
    }
	});

  map.addSource('originSource', {
    'type': 'geojson',
    'data': 'data/origins.json'
  });

  map.addLayer({
    'id': 'origins',
    'type': 'circle',
    'source': 'originSource',
    'paint': {
        'circle-radius': 5,
        'circle-color': [
          'match',
          ['get', 'mode'],
          'passenger', '#2b8cbe',
          'driver', '#a6bddb',
          '#ccc'
        ],
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff',
        'circle-opacity': 0.8
    },
    "layout": {
      "visibility": "none"
    }
  });

  map.addSource('destSource', {
    'type': 'geojson',
    'data': 'data/destinations.json'
  });

  map.addLayer({
    'id': 'destinations',
    'type': 'circle',
    'source': 'destSource',
    'paint': {
        'circle-radius': 5,
        'circle-color': [
          'match',
          ['get', 'mode'],
          'passenger', '#d95f0e',
          'driver', '#fec44f',
          '#ccc'
        ],
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff',
        'circle-opacity': 0.8
    },
    "layout": {
      "visibility": "none"
    }
  });


  var popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  });
  var zipcodeDetail = document.getElementById('zipcodeDetail');

  map.on('click', 'zipcode', function(e){
    zipcodeDetail.innerHTML = 'ZIP code: ' + e.features[0].properties['zipcode'] + '</br>';
    zipcodeDetail.innerHTML += 'total # of pickups: ' + e.features[0].properties['orig_ct'] + '</br>';
    zipcodeDetail.innerHTML += 'total # of dropoffs: ' + e.features[0].properties['dest_ct'] + '</br>';
    zipcodeDetail.innerHTML += '# of passenger-mode origins: ' + e.features[0].properties['passenger_orig_ct'] + '</br>';
    zipcodeDetail.innerHTML += '# of driver-mode origins: ' + e.features[0].properties['driver_orig_ct'] + '</br>';
    zipcodeDetail.innerHTML += '# of passenger-mode destinations: ' + e.features[0].properties['passenger_dest_ct'] + '</br>';
    zipcodeDetail.innerHTML += '# of driver-mode destinations: ' + e.features[0].properties['driver_dest_ct'] + '</br>';
  })

  map.on('mouseover', 'zipcode', function(e){
    map.getCanvas().style.cursor = 'pointer';
  })

  map.on('mouseleave', 'zipcode', function(){
    map.getCanvas().style.cursor = '';
    zipcodeDetail.innerHTML = '';
  });

  $(".nav-item").on("click", function(){
    tab = $(this).attr("tab");
    if(tab == "home"){
    } else if(tab == "origins"){
      map.setLayoutProperty('origins', 'visibility', 'none');
      map.setLayoutProperty('destinations', 'visibility', 'none');
      map.setLayoutProperty('zipcode', 'visibility', 'visible');
      map.setLayoutProperty('trips', 'visibility', 'none');
    } else if(tab == "routes"){
      map.setLayoutProperty('origins', 'visibility', 'none');
      map.setLayoutProperty('destinations', 'visibility', 'none');
      map.setLayoutProperty('trips', 'visibility', 'visible');
      map.setLayoutProperty('zipcode', 'visibility', 'none');
    } else if(tab == "temporal"){
      if(document.getElementById('origCheck').checked){
        map.setLayoutProperty('origins', 'visibility', 'visible');
      }
      if(document.getElementById('destCheck').checked){
        map.setLayoutProperty('destinations', 'visibility', 'visible');
      }
      map.setLayoutProperty('trips', 'visibility', 'none');
      map.setLayoutProperty('zipcode', 'visibility', 'none');
    }
  });

  $('#select2').change(function(){
    var selected = $("#select2").val();
    if(selected == '0'){
      map.setFilter('origins', null);
      map.setFilter('destinations', null);
    } else if(selected == '1'){
      map.setFilter('origins', ['==', 'interval1', 1]);
      map.setFilter('destinations', ['==', 'interval1', 1]);
    } else if(selected == '2'){
      map.setFilter('origins', ['==', 'interval2', 1]);
      map.setFilter('destinations', ['==', 'interval2', 1]);
    } else if(selected == '3'){
      map.setFilter('origins', ['==', 'interval3', 1]);
      map.setFilter('destinations', ['==', 'interval3', 1]);
    }
  });

  $('#origCheck').change(function(){
    if(this.checked){
      map.setLayoutProperty('origins', 'visibility', 'visible');
    } else {
      map.setLayoutProperty('origins', 'visibility', 'none');
    }
  });

  $('#destCheck').change(function(){
    if(this.checked){
      map.setLayoutProperty('destinations', 'visibility', 'visible');
    } else {
      map.setLayoutProperty('destinations', 'visibility', 'none');
    }
  });
})


