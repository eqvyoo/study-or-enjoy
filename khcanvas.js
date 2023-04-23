const selenium = require('selenium-webdriver')
const firefox = require('selenium-webdriver/firefox')

/*

import fs from 'fs/promises'
import { login, load, logout } from './khcanvas.js';

fs.readFile("asdffdsa.txt").then(it => {
    const auth = it.toString().split('|')
    login(auth[0], auth[1]).then(async driver => {
        load(driver, new Date())
            .then(it => { 
                console.log(it)
                logout(driver)
             })
    }).catch(err => { console.log(err) })
})

*/

/*
open selenium session -> login -> get schedule -> logout -> close selenium session

id: string
pw: string
target_date: Date

returns unsubmitted assignments

ex)
[
    {
        'course_name': '오픈소스SW개발 00분반'
        'due_date': '2022-05-15T14:59:59Z'
        'assignment_name': '과제이름'
        'points': 10.0
    }
]
*/

async function get_schedule(id, pw, target_date) {
    console.log("entered get_schedule_then")
    const result = await using_selenium(async (driver) => {
        console.log("entered using_selenium_then")
        return await login(driver, id, pw)
            .then(async () => {
                console.log("entered login_then")
                return await load(driver, target_date)
            })
    })

    return await result
}

async function using_selenium(next) {
    const option = new firefox.Options()
    option.addArguments("-headless");

    const driver = new selenium.Builder()
        .forBrowser('firefox')
        .setFirefoxOptions(option)
        .build()


    const result = next(driver)

    return await result
    //await next(driver).finally(() => {
    //    driver.quit()
    //})
}

async function login(driver, id, pw) {

    await driver.get("https://khcanvas.khu.ac.kr/")

    const idInput = await driver.findElement(selenium.By.xpath('//*[@id="login_user_id"]'));
    const pwInput = await driver.findElement(selenium.By.xpath('//*[@id="login_user_password"]'));
    const login_button = await driver.findElement(selenium.By.xpath('//*[@id="form1"]/div/div[3]'));

    await idInput.sendKeys(id);
    await pwInput.sendKeys(pw);
    await login_button.click();

    return driver
}

async function load(driver, until) {
    const start_date = until.toISOString()

    await driver.get(`https://khcanvas.khu.ac.kr/api/v1/planner/items?start_date=${start_date}`);
    await sleep(1000)
    await driver.findElement(selenium.By.xpath('/html/body/div/div/nav/ul/li[2]')).click();

    const data = await driver.findElement(selenium.By.xpath('/html/body/div/div/div/div[2]/div/div/div[2]/pre'));
    const text = JSON.parse((await data.getText()).slice(9))
    logout(driver)
    return text.filter(it =>
        ((!it.submissions.submitted) && (!it.submissions.graded)) && it.plannable_type === "assignment").map(it => {
            return {
                "course_name": it.context_name,
                "due_date": it.plannable.due_at,
                "assignment_name": it.plannable.title,
                "points": it.plannable.points_possible
            }
        })
}

async function logout(driver) {
    // await driver.get("https://khcanvas.khu.ac.kr/")

    // await driver.findElement(selenium.By.xpath('html/body/div[2]/header[2]/div[1]/ul/li[1]/button/div[1]')).click();
    // await sleep(1000)
    // const logout = await driver.findElement(selenium.By.xpath('html/body/div[3]/span/span/div/div/div/div/div/span/form/button'));
    // logout.click()
    // await sleep(1000)
    driver.quit()
    console.log("quit")
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

module.exports.get_schedule = get_schedule
module.exports.using_selenium = using_selenium
module.exports.login = login
module.exports.load = load
module.exports.logout = logout