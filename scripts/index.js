// /* **********************************************
// **
// ** UI Elements Module
// **
// ** - this module will be responsible for controling UI Elements like 'menu'
// ** ******************************************** */

const UI = (function () {
    let menu = document.querySelector("#menu-container");

    // show the app and hide the loading screen
    const showApp = () => {
        document.querySelector("#app-loader").classList.add('display-none');
        document.querySelector("main").removeAttribute('hidden');
    };

    // hide the app and show the loading screen
    const loadApp = () => {
        document.querySelector("#app-loader").classList.remove('display-none');
        document.querySelector("main").setAttribute('hidden','true');
    };

    // show menu
    const _showMenu = () => menu.style.right = 0;

    // hide menu
    const _hideMenu = () => menu.style.right = '-65%';

    const _toggleHourlyWeather = () => {
        let hourlyWeather = document.querySelector("#hourly-weather-wrapper"),
            arrow = document.querySelector("#toggle-hourly-weather").children[0],
            visible = hourlyWeather.getAttribute('visible'),
            dailyWeather = document.querySelector("#daily-weather-wrapper");

        if( visible == 'false') {
            hourlyWeather.setAttribute('visible','true');
            hourlyWeather.style.bottom = 0;
            arrow.style.transform = "rotate(180deg)";
            dailyWeather.style.opacity = 0;
        } else if( visible == 'true') {
            hourlyWeather.setAttribute('visible', 'false');
            hourlyWeather.style.bottom = '-100%';
            arrow.style.transform = "rotate(0deg)";
            dailyWeather.style.opacity = 1;
        } else console.error("Unknown state of the hourly weather panel and visible attribute");
    };

    const drawWeatherData = (data, location) => {

        let currentlyData = data.currently,
            dailyData = data.daily.data,
            hourlyData = data.hourly.data,
            weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            dailyWeatherWrapper = document.querySelector("#daily-weather-wrapper"),
            dailyWeatherModel,
            day,
            maxMinTemp,
            dailyIcon,
            hourlyWeatherWrapper = document.querySelector("#hourly-weather-wrapper"),
            hourlyWeatherModel,
            hourlyIcon;

        // set current weather
        // ===================
        // set current location
        document.querySelectorAll(".location-label").forEach((e) => {
            e.innerHTML = location;
        });
        // set the background
        document.querySelector('main').style.backgroundImage = `url("./assets/images/bg-images/${currentlyData.icon}.jpg")`;
        // set the icon
        document.querySelector("#currentlyIcon").setAttribute('src', `./assets/images/summary-icons/${currentlyData.icon}-white.png`);
        // set summary
        document.querySelector("#summary-label").innerHTML = currentlyData.summary;
        // set temperature from Fahrenheit -> Celcius
        document.querySelector("#degrees-label").innerHTML = Math.round((
            currentlyData.temperature - 32) * 5 / 9) + '&#176;'

        // set humidty
        document.querySelector("#humidity-label").innerHTML = Math.round(currentlyData.humidity * 100) + '%';
        // set wind speed
        document.querySelector("#wind-speed-label").innerHTML = (currentlyData.windSpeed * 1.6093).toFixed(1) + ' kph';

        // set daily weather
        // ===================
        while (dailyWeatherWrapper.children[1]) {
            dailyWeatherWrapper.removeChild(dailyWeatherWrapper.children[1])
        }

        for (let i = 0; i <= 6; i++) {
            // clone the node and remove display none close
            dailyWeatherModel = dailyWeatherWrapper.children[0].cloneNode(true);
            dailyWeatherModel.classList.remove('display-none');
            // set the day
            day = weekDays[new Date(dailyData[i].time * 1000).getDay()]
            dailyWeatherModel.children[0].children[0].innerHTML = day;
            // set min/max temperature for the next days in Celcius
            maxMinTemp = Math.round((dailyData[i].temperatureMax - 32) * 5 / 9) + '&#176;' + '/' + Math.round((dailyData[i].temperatureMin - 32) * 5 / 9) + '&#176;';
            dailyWeatherModel.children[1].children[0].innerHTML = maxMinTemp;
            // set daily icon
            dailyIcon = dailyData[i].icon;
            dailyWeatherModel.children[1].children[1].children[0].setAttribute('src', `./assets/images/summary-icons/${dailyIcon}-white.png`);
            // append the model
            dailyWeatherWrapper.appendChild(dailyWeatherModel);
        }
        dailyWeatherWrapper.children[1].classList.add('current-day-of-the-week');

        for (let i = 0; i <= 24; i++) {
            // clone the node and remove display none close
            hourlyWeatherModel = hourlyWeatherWrapper.children[0].cloneNode(true);
            hourlyWeatherModel.classList.remove('display-none');
            // set hour
            hourlyWeatherModel.children[0].children[0].innerHTML = new Date(hourlyData[i].time * 1000).getHours() + ":00";

            // set temperature
            hourlyWeatherModel.children[1].children[0].innerHTML = Math.round((hourlyData[i].temperature - 32) * 5 / 9) + '&#176;';
            // set the icon
            hourlyIcon = hourlyData[i].icon;
            hourlyWeatherModel.children[1].children[1].children[0].setAttribute('src', `./assets/images/summary-icons/${hourlyIcon}-grey.png`);

            // append model
            hourlyWeatherWrapper.appendChild(hourlyWeatherModel);
        }

        UI.showApp();
    };

    // menu events
    document.querySelector("#open-menu-btn").addEventListener('click',_showMenu);
    document.querySelector("#close-menu-btn").addEventListener('click', _hideMenu);

    // hourly-weather wrapper event
    document.querySelector("#toggle-hourly-weather").addEventListener('click', _toggleHourlyWeather);
    
    // export
    return{
        showApp,
        loadApp,
        drawWeatherData
    }

})();

// /* **********************************************
// **
// ** GET LOCATION
// **
// ** - this module will be responsible for getting the data about
// ** - the location to search for the weather
// ** ******************************************** */

const GETLOCATION = (function(){

    let location;
    const locationInput = document.querySelector('#location-input'),
        addCityBtn = document.querySelector('#add-city-btn');

    const _addCity = () => {
        location = locationInput.value;
        locationInput.value = '';
        addCityBtn.setAttribute('disabled', 'true');
        addCityBtn.classList.add('disabled');

        //get wheater data
        WEATHER.getWeather(location);
    }

    locationInput.addEventListener('input', function() {
        let inputText = this.value.trim();
        
        if(inputText !== '') {
            addCityBtn.removeAttribute('disabled');
            addCityBtn.classList.remove('disabled');
        } else {
            addCityBtn.setAttribute('disabled', 'true');
            addCityBtn.classList.add('disabled');
        }
    })

    addCityBtn.addEventListener('click', _addCity);
})();

// /* **********************************************
// **
// ** Get wheater data
// ** this module will aquire weather data and then it will pass
// ** to another module will put the data un UI
// ** ******************************************** */

const WEATHER = (function() {

    const darkSkyKey = 'e73cc582cf60bbe19591f34234e3cdfe',
          geocodeKey = '5bd102cba22549f1967f789a34b95a02 ';

    const _getGeoCodeURL = (location) => `https://api.opencagedata.com/geocode/v1/json?q=${location}&key=${geocodeKey}`;
    const _getDarkSkyURL = (lat,lgn) => `https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/${darkSkyKey}/${lat},${lgn}`;

    //get weather data from dark sky
    const _getDarkSkyData = (url, location) => {
        axios.get(url)
            .then((res) => {
                console.log(res);
                UI.drawWeatherData(res.data, location)
            })

            .catch( (err) => {
                console.error(err);
        })
    }
    
    const getWeather = (location) => {        
        UI.loadApp();

        let geoCodeURL = _getGeoCodeURL(location);

        axios.get(geoCodeURL)
            .then( (res) => {
                
                let lat = res.data.results[0].geometry.lat,
                    lng = res.data.results[0].geometry.lng;
                
                let darkSkyURL = _getDarkSkyURL(lat,lng);

                _getDarkSkyData(darkSkyURL, location);
            })

            .catch( (err) => {
                console.log(err);
            })
    };

    return {
        getWeather
    }

})();

// /* **********************************************
// **
// ** Init
// **
// ** 
// ** ******************************************** */

window.onload = function () {
    UI.showApp();
}