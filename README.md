<!--
http://stackshare.io/continuous-integration
-->
[![npm version](https://badge.fury.io/js/cejs.svg)](https://www.npmjs.com/package/cejs)
[![npm downloads](https://img.shields.io/npm/dm/cejs.svg)](https://www.npmjs.com/package/cejs)
[![Known Vulnerabilities](https://snyk.io/test/github/kanasimi/CeJS/badge.svg?targetFile=package.json)](https://snyk.io/test/github/kanasimi/CeJS?targetFile=package.json)
[![GitHub Actions workflow build status](https://github.com/kanasimi/CeJS/actions/workflows/npm-test.yml/badge.svg)](https://github.com/kanasimi/CeJS/actions)
<!--
[![Travis CI Build Status](https://travis-ci.com/kanasimi/CeJS.svg?branch=master)](https://travis-ci.com/kanasimi/CeJS)
[![AppVeyor CI Build status](https://ci.appveyor.com/api/projects/status/ny0vr4x2uesiumm0?svg=true)](https://ci.appveyor.com/project/kanasimi/cejs)
[![CircleCI Build status](https://circleci.com/gh/kanasimi/CeJS.svg?style=svg)](https://circleci.com/gh/kanasimi/CeJS)
[![scrutinizer Build status](https://scrutinizer-ci.com/g/kanasimi/CeJS/badges/build.png?b=master)](https://scrutinizer-ci.com/g/kanasimi/CeJS/)

[![Known Vulnerabilities](https://snyk.io/test/npm/cejs/badge.svg)](https://snyk.io/test/npm/cejs)
[![Dependency Status](https://david-dm.org/kanasimi/CeJS.svg)](https://david-dm.org/kanasimi/CeJS)
-->

# [Colorless echo](https://colorlessecho.github.io/reviews/) JavaScript kit
The project aims to develop a JavaScript module framework that is simple to use with some interesting features.
本計畫目標是建立一個簡單上手的 JavaScript 程式庫架構。<!-- toolkit -->

## Web page usage / browser 運行方式
<!--
https://github.com/highlightjs/highlight.js/blob/master/SUPPORTED_LANGUAGES.md
-->
```html
<script type="text/JavaScript" src="path/to/ce.js">
	// { "run" : "module name or callback" }
</script>
```

```javascript
// Insert from browser console
var cejs_node = document.createElement("script");
cejs_node.setAttribute('src', 'https://kanasimi.github.io/CeJS/ce.js');
cejs_node.setAttribute('type', 'text/javascript');
document.head.appendChild(cejs_node);
if (!window.CeL) window.CeL = { initializer : function() { CeL.run('interact.DOM', initialization); } };
function initialization() {}
```

```javascript
// CeL.run( 'module.name', function callback() { /* ... */ } );
CeL.run([ 'data.math', 'application.debug.log' ], function() {
	CeL.assert([ CeL.GCD(4, 6), 2 ]);
});
```

## Node.js usage / node.js 運行方式

### Node.js lazy installation. Node.js 環境最新版本懶人配置法
<code>[npm](https://www.npmjs.com/package/cejs)</code> 安裝的可能不是最新版本，這裡示範的是最新版本的安裝方法。

不囉嗦，已經做過的步驟可以跳過：
1. 請先安裝 [node.js](https://nodejs.org/) 與 [7-Zip](https://en.wikipedia.org/wiki/7-Zip)
2. 下載 GitHub repository 安裝檔 [GitHub.updater.node.js](https://raw.githubusercontent.com/kanasimi/gh-updater/master/GitHub.updater.node.js)
3. 在[命令行界面](https://zh.wikipedia.org/wiki/%E5%91%BD%E4%BB%A4%E8%A1%8C%E7%95%8C%E9%9D%A2)下，進到 GitHub repository 安裝檔(`GitHub.updater.node.js`)所在的目錄，執行命令以下載 CeJS 程式庫：

   ```bash
   node GitHub.updater.node.js
   ```

4. CeJS 程式庫應該已經解壓縮，並且放在安裝檔所在目錄的 CeJS-master 目錄下，可以開始試用：

   ```bash
   node
   ```
   ```javascript
   // or: require('./CeJS-master/_for include/node.loader.js');
   require('./_CeL.loader.nodejs.js');
   var cejs = require("cejs");
   CeL.run([ 'data.math', 'application.debug.log' ]);
   CeL.assert([ CeL.GCD(4, 6), 2 ]);
   ```

5. 每次要更新到最新 CeJS 程式庫時，只要重新執行一次 GitHub repository 安裝檔即可。

### Installation via npm 安裝
<!-- NodeICO badges -->
[![NPM](https://nodei.co/npm/cejs.png)](https://nodei.co/npm/cejs/)
<!-- [![NPM](https://nodei.co/npm-dl/cejs.png)](https://nodei.co/npm/cejs/) -->

1. First, go to [nodejs.org](https://nodejs.org/), download the runtime environment and [install the node.js package](https://nodejs.org/en/download/package-manager/). 請先安裝 [node.js](https://nodejs.org/)。
2. Then, install the CeJS library: 接著安裝 CeJS library:
   ```bash
   $ npm install cejs
   ```
* 請注意：採用 `npm` 安裝的可能不是最新版，尚未加入最新功能。建議下載最新版本壓縮檔，解開後配置；而不是直接執行 `npm install` 安裝舊版的程式庫。

### Installation via GitHub latest version 一般正常安裝方法
鑒於更新頻繁，有些功能可能最新版本才具備；若是執行的程式採用了新功能，將會發生嚴重錯誤。此時您可直接到 GitHub 下載最新版本壓縮檔，解開後配置。

Since the frequent updates of the code, some features may work at the latest version only; it's recommended download the latest version at GitHub, and then configure the library.

#### Using a setup script:
For using the alpha version of CeJS, you can set `{ "dependencies": {"cejs": "github:kanasimi/cejs"}}` in the package.json, or use a setup script:
1. Install node.js, wget/curl and [7-Zip](https://en.wikipedia.org/wiki/7-Zip). e.g.,

   ```bash
   yum -y install nodejs wget p7zip
   ```

2. fetch CeJS updater script. e.g.,

   ```bash
   cd /tmp
   mkdir CeJS && cd CeJS
   wget "https://raw.githubusercontent.com/kanasimi/gh-updater/master/GitHub.updater.node.js" || curl -O https://raw.githubusercontent.com/kanasimi/gh-updater/master/GitHub.updater.node.js
   # This script will download + extract CeJS library at ./CeJS-master.
   node GitHub.updater.node.js
   ```

3. See [GitHub.updater.node.js](https://raw.githubusercontent.com/kanasimi/gh-updater/master/GitHub.updater.node.js) for automatic updating configuration.

<!--
Using git:
git clone --single-branch --depth 1 https://github.com/kanasimi/CeJS.git
# for update:
# https://stackoverflow.com/questions/2866358/git-checkout-only-files-without-repository
# https://stackoverflow.com/questions/6941889/is-it-safe-to-shallow-clone-with-depth-1-create-commits-and-pull-updates-aga
# https://stackoverflow.com/questions/41075972/how-to-update-a-git-shallow-clone
git fetch --depth 1; git reset --hard origin/master
git clean -dfx
-->

#### To setup the loader as a split file:
1. Copy the loader file, <code>[_CeL.loader.nodejs.js](https://github.com/kanasimi/CeJS/tree/master/_for%20include/_CeL.loader.nodejs.js)</code> to the target directory (e.g., the same as the script file).
2. Create the repository_path_list_file, <code>[_repository_path_list.txt](https://github.com/kanasimi/CeJS/blob/master/_for%20include/_repository_path_list.sample.txt)</code> in the same directory.
3. Set the path list to search the library base: Write to the repository_path_list_file (`_repository_path_list.txt`), one path per line.
4. to use in a script file:

   ```javascript
   //global.use_cejs_mudule = true;
   require('./_CeL.loader.nodejs.js');
   ```

#### To setup the loader inside a single script file:
1. Copy all codes of [_CeL.loader.nodejs.js](https://github.com/kanasimi/CeJS/tree/master/_for%20include/_CeL.loader.nodejs.js) to the front of the script.
2. Set the CeL_path_list to the paths to search the library base, split by '|'. See also [node.demo.js](https://github.com/kanasimi/CeJS/blob/master/_test%20suite/misc/node.demo.js).


### Execution
Let's try it:
```bash
$ node
```
```javascript
// Load CeJS library.
require('cejs');

// Load modules.
// CeL.run( 'module.name', function callback() { /* ... */ } );
CeL.run([ 'data.math', 'application.debug.log' ]);

// Running codes.
CeL.assert(CeL.GCD(48, 64) === 16);
CeL.assert([ "2³⋅13⋅80611⋅82217",
		CeL.factorize(689269837048).toString() ], 'factorize');
```

## Features and examples 特點
For further introduction, please see the [wiki](https://github.com/kanasimi/CeJS/wiki).
進一步介紹請參閱本計畫之 [wiki](https://github.com/kanasimi/CeJS/wiki)。
<!-- TODO: screenshot data:image/png;base64, -->

### 中西曆轉換
Live demo: [紀年轉換工具](https://kanasimi.github.io/CeJS/_test%20suite/era.htm).

[![紀年轉換工具](https://lh3.googleusercontent.com/N9NilsxV-YIiGqYgzKkQWsKxeGoplKLeJXWo4f-hqgwIT4PHzp1UxI4b-hnFV_Fotr7ENNGcB03uGLZHLvyI6CmmN0DXn2yGzq48gPq9BxPOqtKiqEgcqlK2UNzqCcAoe8dK2V-9lZRJ_HuSGYjbw-lnkdRVTZ1UwhSNHAKO8sg67ICwpkKdZlugrzMxO3x2WQ--oqzAVCQJ_NFsB2oJh8ZZv4U5r85M6eQirL5dNoCo-SoXXRVuAAOJqEG7-ymiOR2_rPTIs1JzAVGiugkoRb2avi8Oi7NjIBwZHXt-Id5C9v5B6T1kejG3GGLt_wWfUcANONgYSsoLKp37AkKZHrvV6M6bDMSqvOwm81hHRUoQS9pDoAw_cLI6oZmmYIFADwgcqFf3Xusf8ZkhVDI0PejCls-laEEeCHBKLI0_s-e__OG-n72oLXHm_cYgLTcmXWaA7U_sG9OxfApHcLRkb1foyY9bcGJV-xpRwA4-gHwMpLlyhbsEYq-92AwYckFT5rzD0kCNfV7tEoG1gqQIM-6gvi4gyD3Y3FDKEKIr9sZA-i7CYvnrKNmVbsrNFj2oJiiE=w1229-h669-no)](https://kanasimi.github.io/CeJS/_test%20suite/era.htm)

### 直式四則運算
直式四則運算 (elementary arithmetic)，即直式加減乘除、長除法。

![直式四則運算-加](https://lh3.googleusercontent.com/qM-718nNrqhSOdUJv2EN6D1_Ah_jJQHSD2RXRPje0DLNVP9W8oZ2RtjBwMS3Q4zZcs-ZdLdkk69ZFaufHH2es9ES4QFtE6PDf8fvLkfNTrq5th9zxaJyNQnMqxIkAf0MB_g1CsYlZIf2PRvNkBpgguquyDIbbAw59wLQHEkRaB10brMw48PwN3pq3sEmxuD-LtuEnO1SasX0yNUcpaX2o5fe6BKFfe1OsSLyo9CNGYKeUc6JVZkzcvOMpXcls7aXnN6UAhbgNr8BaBoNgwwj7_EW6f-OEer3e1WUq7W-v3eAksLhgCUbZnUI65qCYlneg6FuTf7-8-UZdi_ByKist-F5yjAD5jPwOxrVYTUhc6TYid5O_2SeADSMUPLcWJ1YcT2XkivyxdAN--3nhvEAaH_nFI9ZF_t68VAncZBtEoBtzEQ18k_MSuAQSTWDVbPEkwOKp1_-3Ut1xDlUUOX9CnY3xK4F-9c9xziI9gOvMFRE5o6KV9po_3njY9J9u1ztMNAvURMH72__vB07N3oiPQRvCRyL4zEyLV0S2u0cLSChYIUVVEEUjDnAsV9-IOJwdxad=w109-h54-no)
![直式四則運算-減](https://lh3.googleusercontent.com/mWTjsAfG6nlGk_3sH-OMcfvmTC3zTqeTTD63Mz0H5Qg6ldbd2wD1jiVbe5uckRieSQq4xHDb9PCmCDDqfbRr1PrRShm6rzZ5JC-uVbixf4INktgmVHYuKv91xwnzzKamtj78EiShvVeP3Kk9mKAW8Pcsj4qr9Q-3dWbPfQR4XdELltKk6nNOwvpRtBU-MTiW8G1NFbYPnHa54w-IsUsz-JVkfnSRE52ounNnsDjpmRZ4aH8x84jaaQm2sfpFY_c87ChKMjOhzwHidiHLv6vUP9H8M8syNW9FmK2_vBW_5z4xgG6AG1kA2CJgUehrqB_Pn4r2nzwpIZlvbju1n13mSm8yygM39dZMRx_Ci3OdEe7o_nJUNi0bX4Pr3xLRhmHLw1ApQ3ClzfKciwaeKV3oXnCcd4wQXFdvfxQ-nYD7FiZBlvR5Nuh0YGmGgNjszQDync3rS0xbVeN4HjwatEdgvroDhbjyPU-y7AV_YRyf1Dp2S3zJRvx9p0Gd5f3nF3-cIZswpjkM9JG17fefZEY1HluFeKnYS2lr9f9kZRfE0uibyOBcx3R1vjM0JqnqxhzO9XGC=w115-h56-no)
![直式四則運算-乘](https://lh3.googleusercontent.com/DFa-judnb6zgyexIckEuNJ5vMdN0XDpW9D_kPyywkwScabTBsApuWl8K3ipgstRDNSV0nf_-rWA13J-KHma3AVqiie9i6voKdLCxnEUMtJM3gbkTUcYN1QBXO-THLpsSPgtatIiylWp0HYSPK_NGmt15Ur4SBTG4x9J-UUvPwDdi4QhkqifDn13-FzFC1QmqsOJK3JRoP_oAdTf4rNfWaY33WMkATiW6zLKQjJP_LbCIIUyg_ED_byfE2K0bdmnnQVl7Av1iBhaGNCHgsyp_rqmyvIrd2sWf_yP06KnQmim-wIBa5XWVkccH29kzlv6LCBzjg50yrhCcvL43Pcwm87xDDJhJBvjOQOeCNjTltvvI3m0a0Q00WKvVToANkc-1O8ZFIffANiTI4nFLeS7YiSfSSj1EHH4tUiavlMtMWqLhSYGcol7Jbj9lwZMxHIkmkUb6bFLnB_Pnk1dYrAcPSu1W3k2JPuX4IpIxDEsoGt0A3rRDBq7baFzDjZoQsR0f2cEej-AEF0Pgviu0vkqgttTDJ9U6DWJ3RldNhd509t2aUwbbKQnabUfulIEviiSBhBlI=w119-h124-no)
![直式四則運算-除](https://lh3.googleusercontent.com/GAxL2YTiJruCCb1Hx0FxsjykGjy9qjatlHnKngfAijamXrIRXG0w7xFUDqEKVpz8KLNLAs0T2iGR4zkWKT5lzUNdpbVLAsgGuv9qAaKbQesNjdX67lfgYoqxwXNhAgT9g2oJ-swoUx6wnPLMO1x-IROrR5GTIv5V0DNIfsZGnit183uHN23MKoF0Er0XpWU9gjSzC53TTqEKxStnhCD-7cahI7WKxOws54vek9bAAIkq7OeUx94u-R9AtSMBmuJG0iFzxvqSlejvTdYjyWguQbv4RN_hdYB7Fp9KEZnyX1gl_Epr1vWBeXKDMHtFK2VArf458esi7wvM5DanY2cILAxDu9wO3e9Ms_jrPOGk33AjtlNRUzNm7GxQev_nDH6zFzed5wX6BlYAI7y-WrCuvKXlu33Xgk5o2LSGcUK_nb8Qak80xJ8pnevnaxMNxwzBohPqlHXOpzG6Wii07fXyUL5Ft7jTKdyJJKecLdw0KZ87jvEmmZLP4EtRJ2lLdavjVnvpA4KB7W_ks0x-JYjL9mwmtgaoObfLtTQb8vJoSDFf9829Q00rjHliyLoFAowjuPeu=w196-h220-no)

### ES6 shim
See [compatibility.js](https://github.com/kanasimi/CeJS/blob/master/data/code/compatibility.js) and [native.js](https://github.com/kanasimi/CeJS/blob/master/data/native.js).

## Demo 線上示範
* The [live demo page](https://kanasimi.github.io/CeJS/_test%20suite/demo.htm) usually takes 10 to 20 seconds to load.
* 由於頻寬不足，加上載入時須做初始化，本功能示範頁面在載入時得稍微等一下。
[![live demo page](https://lh3.googleusercontent.com/mnxTEY5szTdGeYdUWjC4Pw18CwzJ4EkflaIA42lsBMQRXGthF8rBHbFSKIZ5LjokCQthIQOnxxmH8_eke4oD3Yr-kU1YzUPzOEINiBwdiCHhazHQVYdYRii4oc966DUmE-MV_B_o8j2Ko1XJ-X7Ro4K-xHA6rGY11Q7WIv3Qne-4Q9tfmgYkgysaYOBxUtsZIOrpKghFCfTXsnjVGVhsiCjc9pyT-x3udMZ-RBs6hF8AxFAprU5WX5utht69g9w6d2inJlLHuImvIHuL1dLNCU9PBHWbleOyRkEs_fUrou5-aqpaxYo07W_cfwmYsGQUVU1_g4eQNydlKMNOUAcuQm21sop7qT-j9LKrTPkGh4fbCi8Fw99PA9GsCMX_KK6PX1HKgnoBzCJDjPFjjQthhx3FCXLGuSZmhYp5Y2FN-Atm1MBQMgtigpLixZ52pQD6UIObrC0Mw33fGmhfe9nfnjDtVvjoXbvNaoZ2ZyKrQ-7peMaExoVRLKtUY_ZN2EwHPfVjBAFFZVKPwCg3hKK5ERM69cSrWUSkfdWlHp7_yIQ74wReMgDtu_bpvqF0D8SffAQu=w506-h297-no)](https://kanasimi.github.io/CeJS/_test%20suite/demo.htm)
* [GitHub Pages](https://kanasimi.github.io/CeJS/) 在線演示。

## Requirements and dependencies
* 本 library 須使用新一點的瀏覽器/執行環境。
* 本 library 將使用到 global 變數 ```CeL```。

## Concepts 模組概念
詳細請參閱[概念介紹頁](https://colorlessecho.github.io/reviews/articles/CeJS.html)。

## Contact 聯絡我們
Contact us at [GitHub](https://github.com/kanasimi/CeJS/issues).

(This document is written by [GitHub Flavored Markdown](https://help.github.com/categories/writing-on-github/).)

[![logo](https://raw.githubusercontent.com/kanasimi/CeJS/master/_test%20suite/misc/logo.jpg)](https://colorlessecho.github.io/reviews/)

<!--
Markdown comment: need check under github and npmjs
http://stackoverflow.com/questions/4823468/comments-in-markdown
https://github.com/tiimgreen/github-cheat-sheet/blob/master/README.zh-tw.md

try: README.wiki
-->
