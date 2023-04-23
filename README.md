# About the Project
* E-campus를 활용하여 해당 날짜에 완료되지 않은 과제나 일정이 있는 지 알려줍니다.
* 해야할 일이 없다면 챗봇과의 대화를 통해 사용자 맞춤 일정을 추천해줍니다.
* 조건에 맞는 목적지를 지도와 함께 전송합니다.

---
- [About the Project](#about-the-project)
- [Requirements](#requirements)
- [Installation](#installation)
  - [Firefox Installation on AWS EC2](#firefox-installation-on-aws-ec2)
- [Usage](#usage)
      - [일정이 있는 경우](#일정이-있는-경우)
      - [일정이 없는 경우](#일정이-없는-경우)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

# Requirements

| Name |Version |
| ------ | ------ |
| firefox | 100.0.2 |
| nodejs | 16.15.0 |
| npm | 8.10.0 |
| geckodriver | 0.31.0-linux64 |

# Installation

```sh
$ wget -c https://github.com/mozilla/geckodriver/releases/download/v0.31.0/geckodriver-v0.31.0-linux64.tar.gz -O - | tar -xz
$ npm install
```

and add setting.json at root directory for channel access

```json
{
    "channel_access": "<Channel Access Token>",
    "domain": "<Domain>",
    "id": "<ECampus ID>",
    "pw": "<ECampus PW>"
}
```

## Firefox Installation on AWS EC2

```sh
$ cd /usr/local
$ wget http://ftp.mozilla.org/pub/firefox/releases/101.0/linux-x86_64/en-US/firefox-101.0.tar.bz2
$ tar xvjf firefox-101.0.tar.bz2
sudo ln -s /usr/local/firefox/firefox /usr/bin/firefox 
```

Please Note that some amazon image requires to install dependency manually.

```sh
$ sudo yum install libXinerama.x86_64 cups-libs dbus-glib
$ sudo yum install gtk3-devel
```

You can verify that installation is complete via

```sh
$ firefox -v
```


# Roadmap
- [x] 날씨 정보 받아오기
- [x] E-campus 일정 받아오기
- [x] 챗봇과의 대화를 통해 목적지 추려내기
- [x] 목적지 정보 지도로 반환하기

# Contributing
1. Fork this project

2. Clone the project

3. Create your own branch

4. Commit your changes

5. Push it to the Branch

6. Open a pull request

# License
Distributed under the MIT License. 
See LICENSE for more information.

# Contact
- **신원형**
- **최유정**
- **김연우**

