//@ts-check
/* eslint-disable no-unused-vars  */
const axios = require('axios')


// 최대 7 일간 예보를 반환합니다. 경희대 국제캠퍼스 정문 앞 삼거리 기준으로 호출됩니다.
// 5/27일에 호출했을 경우 6/3일까지의 정오 (한국표준시 기준) 결과를 반환할 수 있습니다.
// 정오 기준, 가장 가까운 날짜의 예보를 반환합니다.
// 예) 호출한 날짜로부터 한 달 뒤 호출 => 호출한 날짜로부터 일주일 뒤 날짜 반환 (최대가 일주일이므로)
// 예) 6/2일 오후 4시 호출 => 6/2일 정오 날씨 반환 (정오 기준이므로) 
// 온도의 경우 단위는 섭씨입니다.

/*example - forecast

            "dt": 1653620400,
            "sunrise": 1653596132,
            "sunset": 1653648142,
            "moonrise": 1653589560,
            "moonset": 1653637140,
            "moon_phase": 0.9,
            "temp": {
                "day": 21.75,
                "min": 15.7,
                "max": 22.85,
                "night": 16.88,
                "eve": 21.29,
                "morn": 15.7
            },
            "feels_like": {
                "day": 21.13,
                "night": 16.35,
                "eve": 20.57,
                "morn": 15.41
            },
            "pressure": 1001,
            "humidity": 44,
            "dew_point": 8.88,
            "wind_speed": 5.88,
            "wind_deg": 273,
            "wind_gust": 12.32,
            "weather": [
                {
                    "id": 500,
                    "main": "Rain",
                    "description": "light rain",
                    "icon": "10d"
                }
            ],
            "clouds": 9,
            "pop": 0.2, //Probability of precipitation. The values of the parameter vary between 0 and 1, where 0 is equal to 0%, 1 is equal to 100%
            "rain": 0.13, //Precipitation volume, mm
            "uvi": 7.71 //The maximum value of UV index for the day

*/

/*example - current
{
        "dt": 1653989440,
        "sunrise": 1653941622,
        "sunset": 1653993914,
        "temp": 23.74,
        "feels_like": 22.82,
        "pressure": 1008,
        "humidity": 25,
        "dew_point": 2.56,
        "uvi": 0.17,
        "clouds": 20,
        "visibility": 10000,
        "wind_speed": 5.66,
        "wind_deg": 300,
        "weather": [
            {
                "id": 801,
                "main": "Clouds",
                "description": "few clouds",
                "icon": "02d"
            }
        ]
    }


*/
async function get_weather_forecast(date) {
    const lat = 37.24764302276268 //위도
    const lon = 127.0783992268606 //경도
    const api_key = "336ddd01d3d6f78782eed90d3921bc7e"

    const target = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=${api_key}&units=metric`

    return await axios.default.get(target).then(it => { return extract_from(date, it.data) })
}

async function get_weather_current() {
    const lat = 37.24764302276268 //위도
    const lon = 127.0783992268606 //경도
    const api_key = "336ddd01d3d6f78782eed90d3921bc7e"

    const target = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=${api_key}&units=metric`

    return await axios.default.get(target).then(it => { return extract_current(it.data) })
}

function extract_from(date, json_response) {
    const target_timestamp = Math.floor(date.getTime() / 1000)
    
    const target_index = find_min_index(json_response.daily.map(it => Math.abs(it.dt - target_timestamp)))

    return json_response.daily[target_index]
}

function extract_current(json_response) {
    return json_response.current
}

function find_min_index(array) {
    let lowest_index = 0
    for (var i = 0; i < array.length; i++) {
        if (array[lowest_index] > array[i]) {
            lowest_index = i
        }
    }

    return lowest_index
}

module.exports.get_weather_forecast = get_weather_forecast
module.exports.get_weather_current = get_weather_current