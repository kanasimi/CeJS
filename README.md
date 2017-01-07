<!--
http://stackshare.io/continuous-integration
-->
[![npm version](https://badge.fury.io/js/cejs.svg)](https://badge.fury.io/js/cejs)
[![Build Status](https://travis-ci.org/kanasimi/CeJS.svg?branch=master)](https://travis-ci.org/kanasimi/CeJS)
[![Build status](https://ci.appveyor.com/api/projects/status/ny0vr4x2uesiumm0?svg=true)](https://ci.appveyor.com/project/kanasimi/cejs)
[![CircleCI](https://circleci.com/gh/kanasimi/CeJS.svg?style=svg)](https://circleci.com/gh/kanasimi/CeJS)
<!--
[![Dependency Status](https://david-dm.org/kanasimi/CeJS.svg)](https://david-dm.org/kanasimi/CeJS)
-->

# [Colorless echo](http://lyrics.meicho.com.tw/) JavaScript kit
The project aims to develop a JavaScript module framework that is simple to use with some interesting features.
本計畫希望能建立一個能簡單上手的 JavaScript 模組架構。<!-- toolkit -->

## Web page usage 
``` HTML
<script type="text/JavaScript" src="path/to/ce.js">
	// { "run" : "module name or callback" }
</script>
```

``` JavaScript
CeL.run( 'module.name', function callback() { /* ... */ } );
```

## Node.js usage

### Installation
First, go to [nodejs.org](https://nodejs.org/), download the runtime environment and install the node.js package.
請先安裝 [node.js](https://nodejs.org/)。

Then, install the CeJS library:
接著安裝 CeJS library:
``` sh
$ npm install cejs
```
（鑒於更新頻繁，有些功能可能最新版本才具備；建議直接到 GitHub 下載最新版本壓縮檔，解開後配置。）

### Execution
Let's try it:
``` sh
$ node
```
``` JavaScript
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

## Features and examples
For further introduction, please see the [wiki](https://github.com/kanasimi/CeJS/wiki).
進一步介紹請參閱本計畫之 [wiki](https://github.com/kanasimi/CeJS/wiki)。

### 中西曆轉換
Live demo: [紀年轉換工具](http://lyrics.meicho.com.tw/lib/JS/_test%20suite/era.htm).

[![紀年轉換工具](https://lh3.googleusercontent.com/N9NilsxV-YIiGqYgzKkQWsKxeGoplKLeJXWo4f-hqgwIT4PHzp1UxI4b-hnFV_Fotr7ENNGcB03uGLZHLvyI6CmmN0DXn2yGzq48gPq9BxPOqtKiqEgcqlK2UNzqCcAoe8dK2V-9lZRJ_HuSGYjbw-lnkdRVTZ1UwhSNHAKO8sg67ICwpkKdZlugrzMxO3x2WQ--oqzAVCQJ_NFsB2oJh8ZZv4U5r85M6eQirL5dNoCo-SoXXRVuAAOJqEG7-ymiOR2_rPTIs1JzAVGiugkoRb2avi8Oi7NjIBwZHXt-Id5C9v5B6T1kejG3GGLt_wWfUcANONgYSsoLKp37AkKZHrvV6M6bDMSqvOwm81hHRUoQS9pDoAw_cLI6oZmmYIFADwgcqFf3Xusf8ZkhVDI0PejCls-laEEeCHBKLI0_s-e__OG-n72oLXHm_cYgLTcmXWaA7U_sG9OxfApHcLRkb1foyY9bcGJV-xpRwA4-gHwMpLlyhbsEYq-92AwYckFT5rzD0kCNfV7tEoG1gqQIM-6gvi4gyD3Y3FDKEKIr9sZA-i7CYvnrKNmVbsrNFj2oJiiE=w1229-h669-no)](http://lyrics.meicho.com.tw/lib/JS/_test%20suite/era.htm)

### 直式四則運算
直式四則運算 (elementary arithmetic)，即直式加減乘除、長除法。

![直式四則運算-加](https://lh3.googleusercontent.com/qM-718nNrqhSOdUJv2EN6D1_Ah_jJQHSD2RXRPje0DLNVP9W8oZ2RtjBwMS3Q4zZcs-ZdLdkk69ZFaufHH2es9ES4QFtE6PDf8fvLkfNTrq5th9zxaJyNQnMqxIkAf0MB_g1CsYlZIf2PRvNkBpgguquyDIbbAw59wLQHEkRaB10brMw48PwN3pq3sEmxuD-LtuEnO1SasX0yNUcpaX2o5fe6BKFfe1OsSLyo9CNGYKeUc6JVZkzcvOMpXcls7aXnN6UAhbgNr8BaBoNgwwj7_EW6f-OEer3e1WUq7W-v3eAksLhgCUbZnUI65qCYlneg6FuTf7-8-UZdi_ByKist-F5yjAD5jPwOxrVYTUhc6TYid5O_2SeADSMUPLcWJ1YcT2XkivyxdAN--3nhvEAaH_nFI9ZF_t68VAncZBtEoBtzEQ18k_MSuAQSTWDVbPEkwOKp1_-3Ut1xDlUUOX9CnY3xK4F-9c9xziI9gOvMFRE5o6KV9po_3njY9J9u1ztMNAvURMH72__vB07N3oiPQRvCRyL4zEyLV0S2u0cLSChYIUVVEEUjDnAsV9-IOJwdxad=w109-h54-no)
![直式四則運算-減](https://lh3.googleusercontent.com/mWTjsAfG6nlGk_3sH-OMcfvmTC3zTqeTTD63Mz0H5Qg6ldbd2wD1jiVbe5uckRieSQq4xHDb9PCmCDDqfbRr1PrRShm6rzZ5JC-uVbixf4INktgmVHYuKv91xwnzzKamtj78EiShvVeP3Kk9mKAW8Pcsj4qr9Q-3dWbPfQR4XdELltKk6nNOwvpRtBU-MTiW8G1NFbYPnHa54w-IsUsz-JVkfnSRE52ounNnsDjpmRZ4aH8x84jaaQm2sfpFY_c87ChKMjOhzwHidiHLv6vUP9H8M8syNW9FmK2_vBW_5z4xgG6AG1kA2CJgUehrqB_Pn4r2nzwpIZlvbju1n13mSm8yygM39dZMRx_Ci3OdEe7o_nJUNi0bX4Pr3xLRhmHLw1ApQ3ClzfKciwaeKV3oXnCcd4wQXFdvfxQ-nYD7FiZBlvR5Nuh0YGmGgNjszQDync3rS0xbVeN4HjwatEdgvroDhbjyPU-y7AV_YRyf1Dp2S3zJRvx9p0Gd5f3nF3-cIZswpjkM9JG17fefZEY1HluFeKnYS2lr9f9kZRfE0uibyOBcx3R1vjM0JqnqxhzO9XGC=w115-h56-no)
![直式四則運算-乘](https://lh3.googleusercontent.com/DFa-judnb6zgyexIckEuNJ5vMdN0XDpW9D_kPyywkwScabTBsApuWl8K3ipgstRDNSV0nf_-rWA13J-KHma3AVqiie9i6voKdLCxnEUMtJM3gbkTUcYN1QBXO-THLpsSPgtatIiylWp0HYSPK_NGmt15Ur4SBTG4x9J-UUvPwDdi4QhkqifDn13-FzFC1QmqsOJK3JRoP_oAdTf4rNfWaY33WMkATiW6zLKQjJP_LbCIIUyg_ED_byfE2K0bdmnnQVl7Av1iBhaGNCHgsyp_rqmyvIrd2sWf_yP06KnQmim-wIBa5XWVkccH29kzlv6LCBzjg50yrhCcvL43Pcwm87xDDJhJBvjOQOeCNjTltvvI3m0a0Q00WKvVToANkc-1O8ZFIffANiTI4nFLeS7YiSfSSj1EHH4tUiavlMtMWqLhSYGcol7Jbj9lwZMxHIkmkUb6bFLnB_Pnk1dYrAcPSu1W3k2JPuX4IpIxDEsoGt0A3rRDBq7baFzDjZoQsR0f2cEej-AEF0Pgviu0vkqgttTDJ9U6DWJ3RldNhd509t2aUwbbKQnabUfulIEviiSBhBlI=w119-h124-no)
![直式四則運算-除](https://lh3.googleusercontent.com/GAxL2YTiJruCCb1Hx0FxsjykGjy9qjatlHnKngfAijamXrIRXG0w7xFUDqEKVpz8KLNLAs0T2iGR4zkWKT5lzUNdpbVLAsgGuv9qAaKbQesNjdX67lfgYoqxwXNhAgT9g2oJ-swoUx6wnPLMO1x-IROrR5GTIv5V0DNIfsZGnit183uHN23MKoF0Er0XpWU9gjSzC53TTqEKxStnhCD-7cahI7WKxOws54vek9bAAIkq7OeUx94u-R9AtSMBmuJG0iFzxvqSlejvTdYjyWguQbv4RN_hdYB7Fp9KEZnyX1gl_Epr1vWBeXKDMHtFK2VArf458esi7wvM5DanY2cILAxDu9wO3e9Ms_jrPOGk33AjtlNRUzNm7GxQev_nDH6zFzed5wX6BlYAI7y-WrCuvKXlu33Xgk5o2LSGcUK_nb8Qak80xJ8pnevnaxMNxwzBohPqlHXOpzG6Wii07fXyUL5Ft7jTKdyJJKecLdw0KZ87jvEmmZLP4EtRJ2lLdavjVnvpA4KB7W_ks0x-JYjL9mwmtgaoObfLtTQb8vJoSDFf9829Q00rjHliyLoFAowjuPeu=w196-h220-no)

### ES6 shim
See [compatibility.js](https://github.com/kanasimi/CeJS/blob/master/data/code/compatibility.js) and [native.js](https://github.com/kanasimi/CeJS/blob/master/data/native.js).

## Demo
* The [live demo page](http://lyrics.meicho.com.tw/lib/JS/_test%20suite/demo.htm) usually takes 10 to 20 seconds to load.
* 由於頻寬不足，加上載入時須做初始化，本功能示範頁面在載入時得稍微等一下。
[![live demo page](https://lh3.googleusercontent.com/mnxTEY5szTdGeYdUWjC4Pw18CwzJ4EkflaIA42lsBMQRXGthF8rBHbFSKIZ5LjokCQthIQOnxxmH8_eke4oD3Yr-kU1YzUPzOEINiBwdiCHhazHQVYdYRii4oc966DUmE-MV_B_o8j2Ko1XJ-X7Ro4K-xHA6rGY11Q7WIv3Qne-4Q9tfmgYkgysaYOBxUtsZIOrpKghFCfTXsnjVGVhsiCjc9pyT-x3udMZ-RBs6hF8AxFAprU5WX5utht69g9w6d2inJlLHuImvIHuL1dLNCU9PBHWbleOyRkEs_fUrou5-aqpaxYo07W_cfwmYsGQUVU1_g4eQNydlKMNOUAcuQm21sop7qT-j9LKrTPkGh4fbCi8Fw99PA9GsCMX_KK6PX1HKgnoBzCJDjPFjjQthhx3FCXLGuSZmhYp5Y2FN-Atm1MBQMgtigpLixZ52pQD6UIObrC0Mw33fGmhfe9nfnjDtVvjoXbvNaoZ2ZyKrQ-7peMaExoVRLKtUY_ZN2EwHPfVjBAFFZVKPwCg3hKK5ERM69cSrWUSkfdWlHp7_yIQ74wReMgDtu_bpvqF0D8SffAQu=w506-h297-no)](http://lyrics.meicho.com.tw/lib/JS/_test%20suite/demo.htm)
* [GitHub Pages](https://kanasimi.github.io/CeJS/)

## Requirements and dependencies
* 本 library 須使用新一點的瀏覽器/執行環境。
* 本 library 將使用到 global 變數 ```CeL```。

## Concepts
詳細請參閱[概念介紹頁](http://lyrics.meicho.com.tw/game/game.pl?seg=CeJS)。

## Contact
Contact us at [Google+](https://plus.google.com/101633590909790225455) or [github](https://github.com/kanasimi/CeJS/issues).

(This document is written by [GitHub Flavored Markdown](https://help.github.com/categories/writing-on-github/).)

[![logo](http://lyrics.meicho.com.tw/logo.png)](http://lyrics.meicho.com.tw/)

<!--
Markdown comment: need check under github and npmjs
http://stackoverflow.com/questions/4823468/comments-in-markdown

try: README.wiki
-->
