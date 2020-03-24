// ---------------------------------------------------------------
// Colors
// ---------------------------------------------------------------
var projectColors, saturation, brightness, hue, borderSaturationDarkerBy, ratio;

function getColorLevels() {
  projectColors = {};
  saturation = 0.6;
  brightness =  0.55;
  hue =  0.8; // or mix it up with Math.random()
  borderSaturationDarkerBy = 0.35;
  ratio = 0.1;
}

function setColors() {
  getColorLevels();
  elements = document.querySelectorAll('#businesses li a');
  for (var i=0; i<elements.length; i++) {
    var div = elements[i];
    var colors = generateCssSeriesColor(i);
    div.style.background = colors.background;
    div.style.borderColor = colors['border-color'];
  }
}

// HSV values in [0..1[
// returns [r, g, b] values from 0 to 255
// See http://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/
function hsvToRgb(h, s, v) {
  var h_i, f, p, q, t, r, g, b;
  h_i = parseInt(h*6);
  f = h*6 - h_i;
  p = v * (1 - s);
  q = v * (1 - f*s);
  t = v * (1 - (1 - f) * s);
  if (h_i==0) { r = v; g = t; b = p; }
  if (h_i==1) { r = q; g = v; b = p; }
  if (h_i==2) { r = p; g = v; b = t; }
  if (h_i==3) { r = p; g = q; b = v; }
  if (h_i==4) { r = t; g = p; b = v; }
  if (h_i==5) { r = v; g = p; b = q; }
  return [parseInt(r*256), parseInt(g*256), parseInt(b*256)];
}

function generateCssSeriesColor(project) {
  if (!projectColors[project]) {
    hue += ratio;
    hue %= 1;
    projectColors[project] = {
      background: "rgb(" + hsvToRgb(hue, saturation, brightness) + ")",
      'border-color': "rgb(" + hsvToRgb(hue, saturation + borderSaturationDarkerBy, brightness) + ")"
    };
  }
  return projectColors[project];
}

setColors();

// ---------------------------------------------------------------
// Dynatable
// ---------------------------------------------------------------

var $filters = $('.filter');
var optionValues = {};
var htmlOptions;

$filters.each(function(i, el) {
  optionValues[$(el).prop('name')] = new Set();
})

// Function that renders the list items from our records
function ulWriter(rowIndex, record, columns, cellWriter) {
  return '<li><a href="' + record.url + '" target="_blank" style="background: ' + record.background + '; border-color: ' + record.borderColor + '"><address><span class="town">' + record.town + '</span><span class="category">' + record.category + '</span></address><h3>' + record.name + '</h3></a></li>';
}

// Function that creates our records from the DOM when the page is loaded
function ulReader(index, li, record) {
  var $li = $(li);
  var a = $(li).find('a').get(0);
  record.url = a.href;
  record.town = $li.find('.town').text();
  record.category = $li.find('.category').text();
  record.name = $li.find('h3').text();
  record.background = a.style.background;
  record.borderColor = a.style.borderColor;

  Object.keys(optionValues).forEach(function(key) {
    optionValues[key].add(record[key]);
  });
}

function setupOptions(dynatable) {
  Object.keys(optionValues).forEach(function(key) {
    dynatable.queries.functions[key] = function(record, value) {
      return record[key] == value;
    };
  });
}

function updateOptions() {
  if (!htmlOptions) {
    htmlOptions = {};

    Object.keys(optionValues).forEach(function(key) {
      htmlOptions[key] = [];
      optionValues[key].forEach(function(value) {
        htmlOptions[key].push('<option>' + value + '</option>');
      });
      $('.filter[name=' + key + ']').append(htmlOptions[key].join(''));
    });
  }
}

var dynatable = $('#businesses')
  .bind('dynatable:init', function(e, dynatable) {
    setupOptions(dynatable);
    $('#filters').show();
  })
  .bind('dynatable:afterRead', updateOptions)
  .dynatable({
    features: {
      paginate: false
    },
    table: {
      bodyRowSelector: 'li'
    },
    writers: {
      _rowWriter: ulWriter
    },
    readers: {
      _rowReader: ulReader
    },
    params: {
      records: 'Faves'
    },
    inputs: {
      queryEvent: 'blur change keyup',
      queries: $filters,
      searchTarget: '#filters',
      searchPlacement: 'append'
    }
  }).data('dynatable');
