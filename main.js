const express = require('express');
const request = require('request');

const fs = require('fs');
const path = require('path');
const HTTPS = require('https');
const bodyParser = require('body-parser');

const TARGET_URL = 'https://api.line.me/v2/bot/message/reply'
const tokens = JSON.parse(fs.readFileSync("setting.json"))
const sslport = 23023;
const domain = tokens.domain
const TOKEN = tokens.channel_access
const id = tokens.id
const pw = tokens.pw

var first = false; //첫 시도인지
var second = false; //첫번째 분류 선택했는지
var destCar = "";
var destination = [];
const canvas = require('./khcanvas')
const selector = require('./schedule_selector')
const weather = require('./weather')


function sendText(replyToken, messages) {
    request.post(
        {
            url: TARGET_URL,
            headers: {
                'Authorization': `Bearer ${TOKEN}`
            },
            json: {
                "replyToken": replyToken,
                "messages": [
                    {
                        "type": "text",
                        "text": messages
                    }
                ]
            }
        }, (error, response, body) => {
            console.log(body)
        });
}

// https://developers.line.biz/en/reference/messaging-api/#image-message
// OR
// https://developers.line.biz/en/reference/messaging-api/#location-message

function sendLocation(replyToken, latitude, longitude, locationAdd, locationName) {
    request.post(
        {
            url: TARGET_URL,
            headers: {
                'Authorization': `Bearer ${TOKEN}`
            },
            json: {
                "replyToken": replyToken,
                "messages": [
                    {
                        "type":"text",
                        "text":"선택하신 내용을 바탕으로 가실 만한 곳을 추천해드릴게요!"
                    },
                   
                    {
                        "type": "location",
                        "title": locationName,
                        "address": locationAdd,
                        "latitude": latitude,
                        "longitude": longitude
                    },
                    {
                        "type":"text",
                        "text":"오늘은 "+locationName+" 어떠신가요?"
                    }
                        
                ]
            }
        }, (error, response, body) => {
            console.log(body)
        });
}

async function filter_date(date, id, pw) {
    const schedule = await canvas.get_schedule(id, pw, date)
    console.log(schedule)
    const first_todo = await selector.is_possible_schedule(date, schedule)
    
    //const first_todo = false
    if (first_todo) {
        return `제출되지 않은 과제가 있습니다. ${first_todo}`
    }

    return null
}

function is_good_weather(weather_data) {
    console.log("current weather is :" + weather_data.weather[0].id)
    if(weather_data.id < 800) {
        return false
    }

    return true
}




const csv = require('csv-parser')
const results = [];

 function chooseFile () {
    if (destCar == "cafe") {
        fs.createReadStream('cafe_list.csv')
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                console.log(results);
            });
    }
    else if (destCar == "meal") {
        fs.createReadStream('meal_list.csv')
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                console.log(results);
            });
    }
    else if (destCar == "play") {
        fs.createReadStream('play_list.csv')
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                console.log(results);
            });
    }
    else if (destCar == "bar") {
        fs.createReadStream('bar_list.csv')
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                console.log(results);
            });
    }
}

function randomNum(min, max) {
    var randNum = Math.floor(Math.random() * (max - min + 1)) + min;
    return randNum;
}

function getX() {
    return destination.x;
}
function getY() {
    return destination.y;
}
function getName() {
    return destination.name;
}
function getAddress() {
    return destination.address;
}


/*

1. 사용자가 아무 메세지나 입력?
2. 이캠퍼스 일정 찾기
3. 날씨 적절한지 판단
4. 카테고리 물어보기
5. 랜덤 위치를 알려주는 메세지 반환

*/
var app = express();
app.use(bodyParser.json());
app.post('/hook', async function (req, res) {

    var eventObj = req.body.events[0];
    var source = eventObj.source;
    var message = eventObj.message;

    // request log
    console.log('======================', new Date(), '======================');
    console.log('[request]', req.body);
    console.log('[request source] ', eventObj.source);
    console.log('[request message]', eventObj.message);

    if (first == false && eventObj.message.text == "처음") {

        const today = new Date()
        const filter_result = await filter_date(today, id, pw)
    
        if (filter_result) {
            sendText(eventObj.replyToken, filter_result)
        }
    
        const good_weather = await weather.get_weather_current().then(it => {
            return is_good_weather(it)
        })
        if (!good_weather) {
            sendText(eventObj.replyToken, "날씨가 나쁨")
        }

        request.post(
            {
                url: TARGET_URL,
                headers: {
                    'Authorization': `Bearer ${TOKEN}`
                },
                json: {
                    "replyToken": eventObj.replyToken,
                    "messages": [
                        {
                            "type": "text",
                            "text": "오늘은 할 일이 없으시네요!"
                        },
                        {
                            "type": "text",
                            "text": "그렇다면 밖에 나가볼까요?"
                        },
                        {
                            "type": "text",
                            "text": "하고 싶은 일을 골라주세요.\n1. 밥 먹기\n2. 카페 가기\n3. 술 마시기\n4. 놀러가기 \n(숫자만 입력해주세요)"
                        }
                    ]
                },
            }, (error, response, body) => {
                console.log(body)
            });
        first = true;
        }
    else if (first == true && second == false) {

        if (eventObj.message.text == 1) { //식사 선택
            request.post(
                {
                    url: TARGET_URL, headers: { 'Authorization': `Bearer ${TOKEN}` }, json: {
                        "replyToken": eventObj.replyToken,
                        "messages": [{ "type": "text", "text": " 지금 가장 먹고 싶은 음식은? \n1. 양식 (피자, 파스타, 브런치) \n2. 한식 (찌개, 고기, 국밥) \n3. 중식 (마라탕, 짬뽕, 양꼬치) \n4. 일식 (돈까스, 스시, 텐동)\n5. 기타\n(숫자만 입력해주세요)" }]
                    }
                }, (error, response, body) => {
                    console.log(body)
                });
            destCar = "meal";
        } else if (eventObj.message.text == 2) { //카페 선택
            request.post(
                {
                    url: TARGET_URL, headers: { 'Authorization': `Bearer ${TOKEN}` }, json: {
                        "replyToken": eventObj.replyToken,
                        "messages": [{ "type": "text", "text": "어떤 카페가 가고 싶은가요? \n1. 사진 찍기 좋은 감성 카페\n2. 카공하기 좋은 카페 \n3. 디저트가 맛있는 카페\n(숫자만 입력해주세요)" }]
                    }
                }, (error, response, body) => {
                    console.log(body)
                });
            destCar = "cafe";
        } else if (eventObj.message.text == 3) { //술 선택
            request.post(
                {
                    url: TARGET_URL, headers: { 'Authorization': `Bearer ${TOKEN}` }, json: {
                        "replyToken": eventObj.replyToken,
                        "messages": [{ "type": "text", "text": "어떤 곳에서 술 한잔 할까요? \n1. 곱창이나 육회와 소주 한잔\n2. 분위기 좋은 이자카야\n3. 바삭바삭한 전과 함께 막걸리\n4. 부담 없이 가볍게 맥주\n(숫자만 입력해주세요)" }]
                    }
                }, (error, response, body) => {
                    console.log(body)
                });
            destCar = "bar"
        } else if (eventObj.message.text == 4) { //놀거리 선택
            request.post(
                {
                    url: TARGET_URL, headers: { 'Authorization': `Bearer ${TOKEN}` }, json: {
                        "replyToken": eventObj.replyToken,
                        "messages": [{ "type": "text", "text": "가고 싶은 곳을 선택해주세요. \n1. 노래방\n2. 피시방\n3. 그 외 다른 곳!\n(숫자만 입력해주세요)" }]
                    }
                }, (error, response, body) => {
                    console.log(body)
                });
            destCar = "play"
        }
        chooseFile();
        second = true;
    }

    else if (first == true && second == true) {
        if (destCar == "meal") {
            if (eventObj.message.text == 1) { var randpick = randomNum(0, 6); destination = results[randpick] }
            else if (eventObj.message.text == 2) { var randpick = randomNum(7, 19); destination = results[randpick] }
            else if (eventObj.message.text == 3) { var randpick = randomNum(20, 25); destination = results[randpick] }
            else if (eventObj.message.text == 4) { var randpick = randomNum(26, 36); destination = results[randpick] }
            else if (eventObj.message.text == 5) { var randpick = randomNum(37, 46); destination = results[randpick] }
        }
        else if (destCar == "cafe") {
            if (eventObj.message.text == 1) { var randpick = randomNum(0, 5); destination = results[randpick] }
            else if (eventObj.message.text == 2) { var randpick = randomNum(6, 12); destination = results[randpick] }
            else if (eventObj.message.text == 3) { var randpick = randomNum(13, 17); destination = results[randpick] }
        }
        else if (destCar == "bar") {
            if (eventObj.message.text == 1) { var randpick = randomNum(0, 5); destination = results[randpick] }
            else if (eventObj.message.text == 2) { var randpick = randomNum(6, 11); destination = results[randpick] }
            else if (eventObj.message.text == 3) { var randpick = randomNum(12, 15); destination = results[randpick] }
            else if (eventObj.message.text == 4) { var randpick = randomNum(16, 20); destination = results[randpick] }
        }
        else if (destCar == "play") {
            if (eventObj.message.text == 1) { var randpick = randomNum(0, 3); destination = results[randpick] }
            else if (eventObj.message.text == 2) { var randpick = randomNum(4, 8); destination = results[randpick] }
            else if (eventObj.message.text == 3) { var randpick = randomNum(9, 13); destination = results[randpick] }
        }

        sendLocation(eventObj.replyToken, getX(), getY(), getAddress(), getName())
    }
    res.sendStatus(200);
});

try {
    const option = {
        ca: fs.readFileSync('/etc/letsencrypt/live/' + domain + '/fullchain.pem'),
        key: fs.readFileSync(path.resolve(process.cwd(), '/etc/letsencrypt/live/' + domain + '/privkey.pem'), 'utf8').toString(),
        cert: fs.readFileSync(path.resolve(process.cwd(), '/etc/letsencrypt/live/' + domain + '/cert.pem'), 'utf8').toString(),
    };

    HTTPS.createServer(option, app).listen(sslport, () => {
        console.log(`[HTTPS] Server is started on port ${sslport}`);
    });
} catch (error) {
    console.log('[HTTPS] HTTPS 오류가 발생하였습니다. HTTPS 서버는 실행되지 않습니다.');
    console.log(error);
}