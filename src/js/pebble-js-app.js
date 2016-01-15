function iconFromWeatherId(weatherId) {
  if (weatherId < 600) {
    return 2;
  } else if (weatherId < 700) {
    return 3;
  } else if (weatherId > 800) {
    return 1;
  } else {
    return 0;
  }
}

function fetchWeather(latitude, longitude) {
  var req = new XMLHttpRequest();
  req.open('GET', 'http://api.openweathermap.org/data/2.5/weather?' +
    'lat=' + latitude + '&lon=' + longitude + '&cnt=1&appid=' + localStorage['openweathermap-api-key'], true);
  req.onload = function () {
    if (req.readyState === 4) {
      if (req.status === 200) {
        console.log(req.responseText);
        var response = JSON.parse(req.responseText);
        var temperature = Math.round(response.main.temp - 273.15);
        var icon = iconFromWeatherId(response.weather[0].id);
        var city = response.name;
        console.log(temperature);
        console.log(icon);
        console.log(city);
        Pebble.sendAppMessage({
          'WEATHER_ICON_KEY': icon,
          'WEATHER_TEMPERATURE_KEY': temperature + '\xB0C',
          'WEATHER_CITY_KEY': city
        });
      } else {
        console.log('Error');
      }
    }
  };
  req.send(null);
}

function locationSuccess(pos) {
  var coordinates = pos.coords;
  fetchWeather(coordinates.latitude, coordinates.longitude);
}

function locationError(err) {
  console.warn('location error (' + err.code + '): ' + err.message);
  Pebble.sendAppMessage({
    'WEATHER_CITY_KEY': 'Loc Unavailable',
    'WEATHER_TEMPERATURE_KEY': 'N/A'
  });
}

var locationOptions = {
  'timeout': 15000,
  'maximumAge': 60000
};

Pebble.addEventListener('ready', function (e) {
  console.log('connect!' + e.ready);
  if(localStorage['openweathermap-api-key']) {
    window.navigator.geolocation.getCurrentPosition(locationSuccess, locationError,
      locationOptions);
    console.log(e.type);
  } else {
    console.log('OpenWeatherMap API key required!');
  }   
});

Pebble.addEventListener('appmessage', function (e) {
  if(localStorage['openweathermap-api-key']) {
    window.navigator.geolocation.getCurrentPosition(locationSuccess, locationError,
    locationOptions);
    console.log(e.type);
    console.log(e.payload.temperature);
    console.log('message!');
  } else {
    console.log('OpenWeatherMap API key required!');
  }
});

Pebble.addEventListener('showConfiguration', function(e) {
  // Show config page
  Pebble.openURL('https://rawgit.com/idiotandrobot/pebble-weather/master/config/index.html');
});

Pebble.addEventListener('webviewclosed', function (e) {
  // Decode and parse config data as JSON
  var config_data = JSON.parse(decodeURIComponent(e.response));
  console.log('Config window returned: ', JSON.stringify(config_data));
  
  localStorage['openweathermap-api-key'] = config_data['openweathermap-api-key'];
  
  if(localStorage['openweathermap-api-key']) {
    window.navigator.geolocation.getCurrentPosition(locationSuccess, locationError,
    locationOptions);
  } else {
    console.log('OpenWeatherMap API key still required!');
  }  
});
