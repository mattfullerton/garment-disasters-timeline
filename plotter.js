/* Step interval for changes */
var stepInterval = 750;

var map;
var layers = [];
var responses = [];
var timeouts = [];
var propertyNames = [];

var playState = "Pause";

/* Years for which we want to plot data */
var years = [];
/* Simple array of deaths per year */
var killed_values_all = [];
/* Values, rearranged for stacked bar chart */
var killed_values;

/* DB connection - not geo */
var sql_simple = new cartodb.SQL({user: 'crowdsalad', format: 'json'});

/* DB connection - geo */
var sql = new cartodb.SQL({user: 'crowdsalad', format: 'geojson'});

/* Grab the initial data from cartodb */
//TODO: Get the data from datahub.io instead?
var query =
        "select EXTRACT(YEAR FROM date) as year, sum(no_killed_numeric) as deaths from bangladesh_clothing_diasters_for_cartadb GROUP BY year ORDER BY year";

sql_simple.execute(query).done(function(response) {
  for (var i = response.rows[0].year; i < (response.rows[(response.rows.length - 1)].year) + 1; i++) {
    years[i - response.rows[0].year] = i; //Initialize all years, even if we don't have any data for them
    killed_values_all[i - response.rows[0].year] = 0; //Start with zeroes
  }

  for (var i = 0; i < response.rows.length; i++) {
    killed_values_all[response.rows[i].year - response.rows[0].year] = response.rows[i].deaths;
  }

  /* Rearrange the data for bar stacking */
  killed_values = create2dArray(killed_values_all);

  $(document).ready(init);
});

function pause() {
  for (var i = 0; i < timeouts.length; i++) {
    window.clearTimeout(timeouts[i]);
  }
  timeouts = [];
}

function play() {
  var currentValue = $("div#slider").slider("value");

  if (currentValue > (years.length - 2))
    $("div#slider").slider("value", 0);
  currentValue = 0;

  for (var i = 0; i < (years.length - 1) - currentValue; i++) {

    var theTimeout = window.setTimeout(setMe, 10 + (stepInterval * i));
    timeouts.push(theTimeout);
  }

  /* Just after last step, "stop" the playback */
  var myTimeout = window.setTimeout(stop, 10 + (stepInterval * ((years.length - 1) -
          currentValue)) + 10);
  timeouts.push(myTimeout);

}

function setMe() {
  if ($("div#slider").slider("value") < (years.length - 1)) {
    $("div#slider").slider("value", $("div#slider").slider("value") + 1);
    updateLayers(0);
  }

}

function updateLayers(event) {
  var layerno = $("div#slider").slider("value");
  updateNumbers(layerno);

  for (var i = 0; i <= layerno; i++) {
    $.each(responses[i].features, function(index, obj) {
      map.addLayer(obj.properties.theLayer);
    });

  }

  if (layerno < (years.length - 1))
    for (var i = layerno + 1; i < years.length; i++) {
      $.each(responses[i].features, function(index, obj) {
        map.removeLayer(obj.properties.theLayer);
      });
    }
}

function create2dArray(myArray) {
  var final_values = [];
  for (var i = 0; i < (myArray.length); i++) {
    final_values[i] = [];
    var j = 0;
    while (j <= i) {
      final_values[i][j] = myArray[j]
      j++;
    }
    while ((j > i) && (j <= myArray.length - 1)) {
      final_values[i][j] = 0;
      j++;
    }
  }
  return final_values;
}

function updateNumbers(layerno) {
  var data = {};
  for (var i = 0; i < years.length; i++) {
    data["y" + years[i]] = killed_values[layerno][i];
  }
  data.id = "v1";
  addData("graph_killed", data, "red");
}

function init() {
  /* calculate ceiling value and generate property names needed for the stacked bar chart */
  ceiling = 0;
  for (var i = 0; i < years.length; i++) {
    ceiling += killed_values_all[i];
    propertyNames[i] = "y" + years[i].toString();
  }
  ceiling += 250;

  /* D3/SVG Stuff */
  /* Create the scale for the slider */
  var svg =
          d3.select("#years")
          .append("svg")
          .attr("width", 760)
          .attr("height", 25);

  var scale =
          d3.scale
          .linear()
          .domain([years[0], years[years.length - 1]])
          .range([0, 608]);

  var xAxis =
          d3.svg.axis()
          .scale(scale)
          .orient("bottom")
          .ticks(24)
          .tickFormat(d3.format("4.0d"));

  svg.append("g")
          .attr("class", "axis")
          .attr("transform", "translate(76,10)")
          .call(xAxis);

  /* Set year labels */
  $("#startYearLabel").html(years[0]);
  $("#endYearLabel").html(years[years.length - 1]);

  /* Initiate leaflet map */
  map = new L.Map('cartodb-map', {
    center: [23.8, 90.5],
    zoom: 11
  });

  L.tileLayer(
          'https://dnv9my2eseobd.cloudfront.net/v3/cartodb.map-4xtxp73f/{z}/{x}/{y}.png', {
    attribution: 'Mapbox (<a href="http://mapbox.com/about/maps" target="_blank">Terms & Feedback</a>), <a  target="_blank" href="http://www.cartodb.com">CartoDB</a> & <a target="_blank" href="http://www.d3js.org/">d3.js</a>'
  }).addTo(map);

  var layerUrl =
          'http://crowdsalad.cartodb.com/api/v1/viz/bangladesh_clothing_diasters_for_cartadb/viz.json';

  for (var i = years[0]; i <= years[years.length - 1]; i++) {
    var query =
            "select the_geom, no_killed_numeric, location, date, date_only_year, factory_incident_company_name, source_not_exhaustive_need_to_list_all_pdfs, supplying, text_description, type_of_incident from bangladesh_clothing_diasters_for_cartadb WHERE date > '" +
            (i - 1) + "-12-31T23:59:59+00:00' AND date <='" + i +
            "-12-31T23:59:59+00:00' ORDER BY no_killed_numeric DESC";

    sql.execute(query).done(function(response) {
      responses.push(response);

      $.each(response.features, function(index, obj) {

        var myLayer = L.circle([obj.geometry.coordinates[1],
          obj.geometry.coordinates[0]
        ], 200 * Math.round(Math.sqrt(((+obj.properties.no_killed_numeric)) /
                3.14)), {
          fill: true,
          color: 'red',
          weight: 2,
          fillOpacity: 0.5
        });

        //TODO: Generate HTML for the popups
        var printdate = "";
        if (obj.properties.date_only_year)
          printdate = obj.properties
                  .date.substr(0, 4);
        else
          printdate = obj.properties.date.substr(0, 10);

        var suppl = obj.properties.supplying;
        var txt = obj.properties.text_description;
        if ((suppl === "") || (suppl === null)) {
          var suppl = "Unknown";
        }
        if ((txt === "") || (txt === null)) {
          var txt = "No details available";
        }

        var theHTML = "<span class='boxtitle'>" + obj.properties
                .factory_incident_company_name + "</span><b><br/>" +
                printdate + "</b><br/><br/> <b>Number killed:</b> " +
                obj.properties.no_killed_numeric +
                "<br/><b>Supplying:</b> " + suppl +
                "<br/><b>Description:</b> " + txt +
                "<br/><br/><span style='color: initial;'><b>Source(s): </b>" +
                obj.properties.source_not_exhaustive_need_to_list_all_pdfs +
                "</span>";
        ;

        myLayer.bindPopup(theHTML, {
          maxWidth: 500
        });
        obj.properties.theLayer = myLayer;

      });

    });

  }

  $("div#slider").slider({
    animate: false,
    step: 1,
    min: 0,
    max: years.length - 1,
    slide: stop,
    stop: stop
  });

  // capture the height/width defined in the div so we only have it defined in one place
  chartHeight = parseInt(document.getElementById('graph_killed').clientHeight);
  chartWidth = parseInt(document.getElementById('graph_killed').clientWidth);

  // Y scale will fit values from 0-10 within pixels 0 - height
  y = d3.scale.linear().domain([0, ceiling]).range([0, chartHeight]);
  yneg = d3.scale.linear().domain([ceiling, 0]).range([0, chartHeight]);

  /* initialize the chart without any data */
  displayStackedChart("graph_killed");
  //displayStackedChart("graph_injured");

  $("div#slider").slider("value", 0);
  updateNumbers(0);

  //Kick off playback from 0, delay of 5s to ensure tiles are loaded (not good)
  var myTimeout = window.setTimeout(play, 1000);
  timeouts.push(myTimeout);
}

function togglePlayPause() {

  if (playState == "Pause") {
    pause();
    $("#playpause").html("Play");
    playState = "Play";
  } else if (playState == "Play") {
    play();
    $("#playpause").html("Pause");
    playState = "Pause";
  }
}

function stop() {
  if (responses.length > 0) {
    //if (playState == "Pause") {
    pause();
    $("#playpause").html("Play");
    playState = "Play";
    //}
    updateLayers(0);
  }
}