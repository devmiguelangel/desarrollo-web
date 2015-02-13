(function() {
    var API_WORLDTIME_KEY = 'f4be796eee5d49c02bee0ff6893d2';
    var API_WORLDTIME = 'http://api.worldweatheronline.com/free/v2/tz.ashx?format=json&key=' + API_WORLDTIME_KEY + '&q=';
    var API_WEATHER_KEY = '3911925';
    var API_WEATHER_URL = 'http://api.openweathermap.org/data/2.5/weather?id=' + API_WEATHER_KEY + '&';
    var IMG_WEATHER = 'http://openweathermap.org/img/w/';

    var today = new Date();
    var timeNow = today.toLocaleTimeString();

    var $body = $('body');
    var $loader = $('.loader');
    var nombreCiudad = $('[data-input="cityAdd"]');
    // var buttonAdd = $('[data-button="add"]');
    var formSearch = $('[data-form="searchForm"]');
    var buttonLoad = $('[data-saved-cities]');

    var cities = [];

    var cityWeather = {};
    cityWeather.zone;
    cityWeather.icon;
    cityWeather.temp;
    cityWeather.temp_max;
    cityWeather.temp_min;
    cityWeather.main;

    /*$( buttonAdd ).on('click', addNewCity);
    $( nombreCiudad ).on('keypress', function(event) {
        // console.log(event.which);

        if (event.which === 13) {
            addNewCity();
        }
    });*/
    $( formSearch ).on('submit', addNewCity);

    buttonLoad.on('click', loadSavedCities);

    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getCoords, errorFound);
    } else {
        alert("Por favor, actualiza tu navegador"); 
    }

    function errorFound(error) {
        alert("Un error ocurrió: " + error.code);
        // 0: Error desconocido
        // 1: Permiso denegado
        // 2: Posición no está disponible
        // 3: Timeout
    };

    function getCoords(position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        console.log("Tu posición es: " + lat + "," + lon);

        $.getJSON(API_WEATHER_URL + 'lat=' + lat + '&lon=' + lon, getCurrentWeather);
    }

    function getCurrentWeather (data) {
        // console.log(data);
        cityWeather.zone = data.name;
        cityWeather.icon = IMG_WEATHER + data.weather[0].icon + '.png';
        cityWeather.temp = data.main.temp - 273.15;
        cityWeather.temp_max = data.main.temp_max - 273.15;
        cityWeather.temp_min = data.main.temp_min - 273.15;
        cityWeather.main = data.weather[0];

        renderTemplate(cityWeather);

    }

    function activateTemplate (id) {
        var t = document.querySelector(id);
        return document.importNode(t.content, true);
    }

    function renderTemplate (cityWeather, localtime) {
        var clone = activateTemplate('#template--city');
        var timeToShow;

        if (localtime) {
            timeToShow = localtime.split(' ')[1];
        } else {
            timeToShow = timeNow;
        }

        clone.querySelector('[data-time]').innerHTML = timeToShow;
        clone.querySelector('[data-city]').innerHTML = cityWeather.zone;
        clone.querySelector('[data-icon]').src = cityWeather.icon;
        clone.querySelector('[data-temp="max"]').innerHTML = cityWeather.temp_max.toFixed(1);
        clone.querySelector('[data-temp="min"]').innerHTML = cityWeather.temp_min.toFixed(1);
        clone.querySelector('[data-temp="current"]').innerHTML = cityWeather.temp.toFixed(1);

        $( $loader ).hide();
        $( $body ).append(clone);
    }

    function addNewCity (event) {
        event.preventDefault();

        $.getJSON(API_WEATHER_URL + 'q=' + nombreCiudad.val(), getWeatherCity);
    }

    function getWeatherCity (data) {
        // console.log(data);
        $.getJSON(API_WORLDTIME + nombreCiudad.val(), function(response) {
            // console.log(resp);

            nombreCiudad.prop('value', '');

            cityWeather = {};
            cityWeather.zone = data.name;
            cityWeather.icon = IMG_WEATHER + data.weather[0].icon + '.png';
            cityWeather.temp = data.main.temp - 273.15;
            cityWeather.temp_max = data.main.temp_max - 273.15;
            cityWeather.temp_min = data.main.temp_min - 273.15;
            cityWeather.main = data.weather[0];

            renderTemplate(cityWeather, response.data.time_zone[0].localtime);

            cities.push(cityWeather);
            localStorage['cities'] = JSON.stringify(cities);
        });
    }

    function loadSavedCities (event) {
        event.preventDefault();

        var cities = JSON.parse( localStorage.cities );

        $.each(cities, function(index, city) {
            renderTemplate(city);
        });
    }

})();
