var url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson  '

d3.json(url).then(function (data) {
  createFeatures(data.features);
});

function circleRadius(feature) {
  return feature.properties.mag * 4;
}

function circleColor(depth) {
  return depth <= 10 ? "#00000F":
          depth <= 30 ? "#0033FF":
          depth <= 50 ? "#0066FF":
          depth <= 70 ? "#0099FF":
          depth <= 90 ? "#00CCFF":
                          "#00FFFF";
}


// function circleColor(depth) {
//   if (depth <= 10) {"#0000FF";
//     } else if (depth <= 30) {"#0033FF";
//     } else if (depth <= 50) {"#0066FF";
//     } else if (depth <= 70) {"#0099FF";
//     } else if (depth <= 90) {"#00CCFF";
//     } else {"#00FFFF"};
// }
function createFeatures(earthquakeData) {

  function circles(feature, latlng) {
        
    var markers = {
        radius: circleRadius(feature),
        fillColor: circleColor(feature.geometry.coordinates[2]),
        weight: 1,
        opacity: 0.5,
        fillOpacity: 0.8
    };

    return L.circleMarker(latlng, markers);
}

  function onEachFeature(feature, layer) {
    layer.bindPopup(
        "<h3>Location: " + feature.properties.place + "<br> Magnitude: " + 
        feature.properties.mag +"<br>Depth: " + feature.geometry.coordinates[2] + 
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>")
}

  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: circles,
    onEachFeature: onEachFeature
  });

  createMap(earthquakes);
}

function createMap(earthquakes) {

  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  var baseMaps = {
    "Topographic Map": topo
  };

  var overlayMaps = {
    Earthquakes: earthquakes
  };
  
  var myMap = L.map("map-id", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [topo, earthquakes]
  });

  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  var legend = L.control({
    position: 'topright'
  });
  legend.onAdd = function() {
    var div = L.DomUtil.create('div', 'info legend'),
      categories = [-10, 10, 30, 50, 70, 90],
      labels = [],
      from, to;
    for (var i = 0; i < categories.length; i++) {
      from = categories[i];
      to = categories[i + 1];
      labels.push(
        '<i style="background:' + circleColor(from + 1) + '">Depth (m)</i> ' +
        from + (to ? '&ndash;' + to : '+'));
    }
    div.innerHTML = labels.join('<br>');
    return div;
  };
  legend.addTo(myMap);


}