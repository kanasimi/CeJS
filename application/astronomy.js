/**
 * @name CeL function for astronomical calculations.
 * @fileoverview 本檔案包含了天文演算用的日期轉換功能。
 * 
 * @since 2015/3/20 23:5:43
 * 
 * TODO:
 * 
 * 1. 座標全改 radians
 * 
 * 2. 黃→視黃→赤→(視)赤→地平座標
 * 
 * http://eclipse.gsfc.nasa.gov/JSEX/JSEX-index.html
 * https://web.archive.org/web/http://www.chris.obyrne.com/Eclipses/calculator.html
 * https://en.wikipedia.org/wiki/Astronomical_symbols
 * 
 * calculate Halley's Comet 哈雷彗星
 * 
 * Software & coded<br />
 * http://www.kentauren.info/menu/index1.htm?page=/cgi-bin/planeph_VSOP87d.pl
 * https://pypi.python.org/pypi/astronomia
 * https://github.com/Hedwig1958/libastro/blob/master/astro.c
 * https://github.com/soniakeys/meeus/blob/master/solar/solar.go
 * https://github.com/hkuno9000/sunmoon/blob/master/acoord.cpp
 * http://www.timeanddate.com/calendar/moonphases.html
 * http://eco.mtk.nao.ac.jp/koyomi/
 * 
 * 大地測量:給定地球表面兩個點的經緯度,計算兩點間之距離<br />
 * 天球上天體/星體距離<br />
 * http://geographiclib.sourceforge.net/scripts/geod-calc.html
 * http://wywu.pixnet.net/blog/post/27459116
 * http://iotresearch.wikispaces.com/GPS<br />
 * Andoyer 方法最大的誤差約為50公尺，Lambert 方法最大的誤差約30m。
 * http://usenrong.iteye.com/blog/2147341
 * http://en.wikipedia.org/wiki/Haversine_formula
 * http://en.wikipedia.org/wiki/Spherical_law_of_cosines
 * http://en.wikipedia.org/wiki/Vincenty's_formulae
 * 
 * LUNAR SOLUTION ELP version ELP/MPP02
 * 
 * 未來發展：<br />
 * 
 * @see <a href="http://www.nongli.com/item2/index.html" accessdate="2013/5/2
 *      20:23">农历知识:传统节日,24节气，农历历法，三九，三伏，天文历法,天干地支阴阳五行</a>
 * @see <a href="http://www.chinesefortunecalendar.com/CLC/clcBig5.htm"
 *      accessdate="2013/5/2 20:23">如何轉換陰陽曆</a>
 * 
 * 簡易朔望/天象計算功能/千年 節氣 計算。<br />
 * http://bieyu.com/<br />
 * http://www.fjptsz.com/xxjs/xjw/rj/117/index.htm
 * 
 * 通用万年历 寿星万年历 择吉老黄历 http://www.todayonhistory.com/wnl/lhl.htm
 * 
 */

'use strict';
// 'use asm';

// More examples: see /_test suite/test.js

// ------------------------------------------------------------------------------------------------------------------//

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.astronomy',

	require : 'data.code.compatibility.'
	// data.math.find_root()
	// data.date.Date_to_JD()
	+ '|data.math.polynomial_value|data.date.',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring
	var polynomial_value = this.r('polynomial_value');

	/**
	 * full module name.
	 * 
	 * @type {String}
	 */
	var module_name = this.id;

	/**
	 * null module constructor
	 * 
	 * @class astronomical calculations 的 functions
	 */
	var _// JSDT:_module_
	= function() {
		// null module constructor
	};

	/**
	 * for JSDT: 有 prototype 才會將之當作 Class
	 */
	_// JSDT:_module_
	.prototype = {};

	// ------------------------------------------------------------------------------------------------------//
	// basic constants. 定義基本常數。

	var

	/** {Number}未發現之index。 const: 基本上與程式碼設計合一，僅表示名義，不可更改。(=== -1) */
	NOT_FOUND = ''.indexOf('_'),

	/**
	 * 周角 = 360°, 1 turn, 1 revolution, 1 perigon, full circle, complete
	 * rotation, a full rotation in degrees.
	 * 
	 * @type {Number}
	 */
	TURN_TO_DEGREES = 360 | 0,
	/**
	 * 周角.
	 * 
	 * TURN_TO_RADIANS = 2πr/r = 2π =
	 * 6.283185307179586476925286766559005768394338798750211641949889...
	 * 
	 * @type {Number}
	 * 
	 * @see https://en.wikipedia.org/wiki/Radian
	 */
	TURN_TO_RADIANS = 2 * Math.PI,
	/**
	 * degrees * DEGREES_TO_RADIANS = radians.
	 * 
	 * DEGREES_TO_RADIANS = 2π/360 =
	 * 0.017453292519943295769236907684886127134428718885417254560971... ≈
	 * 1.745329251994329576923691e-2
	 * 
	 * @type {Number}
	 */
	DEGREES_TO_RADIANS = TURN_TO_RADIANS / TURN_TO_DEGREES,
	/**
	 * degrees * DEGREES_TO_ARCSECONDS = arcseconds.
	 * 
	 * DEGREES_TO_ARCSECONDS = 3600
	 * 
	 * @type {Number}
	 */
	DEGREES_TO_ARCSECONDS = 60 * 60 | 0,
	/**
	 * Arcseconds in a full circle. 角秒
	 * 
	 * TURN_TO_ARCSECONDS = 1296000
	 * 
	 * @type {Number}
	 */
	TURN_TO_ARCSECONDS = TURN_TO_DEGREES * DEGREES_TO_ARCSECONDS,
	/**
	 * arcseconds * ARCSECONDS_TO_RADIANS = radians.
	 * 
	 * ARCSECONDS_TO_RADIANS = 2π/360/3600 =
	 * 0.0000048481368110953599358991410235794797595635330237270151558... ≈
	 * 4.848136811095359935899141e-6
	 * 
	 * @type {Number}
	 */
	ARCSECONDS_TO_RADIANS = DEGREES_TO_RADIANS / DEGREES_TO_ARCSECONDS,
	/**
	 * 24: 24 hours @ 1 day
	 */
	ONE_DAY_HOURS = 24,
	/**
	 * Seconds per day. 每一天 86400 秒鐘。
	 * 
	 * @type {Number}
	 */
	ONE_DAY_SECONDS = ONE_DAY_HOURS * 60 * 60 | 0;

	// ---------------------------------------------------------------------//
	// 天文相關定常數。

	var
	/**
	 * 每年 2 分點 + 2 至點。
	 * 
	 * EQUINOX_SOLSTICE_COUNT = 4
	 * 
	 * @type {Number}
	 */
	EQUINOX_SOLSTICE_COUNT = 2 + 2,
	/**
	 * 每分至點 90°。
	 * 
	 * EQUINOX_SOLSTICE_DEGREES = 90
	 * 
	 * @type {Number}
	 */
	EQUINOX_SOLSTICE_DEGREES
	//
	= TURN_TO_DEGREES / EQUINOX_SOLSTICE_COUNT,
	/** {Array}二十四節氣名。每月有一個節氣，一個中氣，分別發生在每月的7日和22日前後。 */
	SOLAR_TERMS_NAME =
	// Chinese name: 中氣,節氣,中氣,節氣,...
	'春分,清明,穀雨,立夏,小滿,芒種,夏至,小暑,大暑,立秋,處暑,白露,秋分,寒露,霜降,立冬,小雪,大雪,冬至,小寒,大寒,立春,雨水,驚蟄'
			.split(','),
	/**
	 * 每年 24節氣。
	 * 
	 * SOLAR_TERMS_COUNT = 24
	 * 
	 * @type {Number}
	 */
	SOLAR_TERMS_COUNT = SOLAR_TERMS_NAME.length,
	/**
	 * 每節氣 15°。
	 * 
	 * DEGREES_BETWEEN_SOLAR_TERMS = 15
	 * 
	 * @type {Number}
	 */
	DEGREES_BETWEEN_SOLAR_TERMS = TURN_TO_DEGREES / SOLAR_TERMS_COUNT,
	// 🌑NEW MOON SYMBOL
	// 🌒WAXING CRESCENT MOON SYMBOL
	// ☽FIRST QUARTER MOON
	// 🌓FIRST QUARTER MOON SYMBOL
	// 🌔WAXING GIBBOUS MOON SYMBOL
	// 🌕FULL MOON SYMBOL
	// 🌖WANING GIBBOUS MOON SYMBOL
	// 🌙CRESCENT MOON
	// ☾LAST QUARTER MOON
	// 🌗LAST QUARTER MOON SYMBOL
	// 🌘WANING CRESCENT MOON SYMBOL
	// 🌚NEW MOON WITH FACE
	/**
	 * 各種月相: 新月、上弦月、滿月、下弦月。
	 */
	LUNAR_PHASE_NAME = [
	// gettext_config:{"id":"new-moon"}
	"朔",
	// gettext_config:{"id":"first-quarter"}
	"上弦",
	// gettext_config:{"id":"full-moon"}
	"望",
	// gettext_config:{"id":"last-quarter"}
	"下弦" ],
	/**
	 * 本地之 time zone / time offset (UTC offset by minutes)。<br />
	 * e.g., UTC+8: 8 * 60 = +480<br />
	 * e.g., UTC-5: -5 * 60
	 * 
	 * @type {Number}
	 */
	default_offset = library_namespace.String_to_Date
	//
	&& library_namespace.String_to_Date.default_offset
			|| -(new Date).getTimezoneOffset() || 0;

	_.SOLAR_TERMS = SOLAR_TERMS_NAME;

	// ---------------------------------------------------------------------//
	// Astronomical constant 天文常數。
	// @see https://en.wikipedia.org/wiki/Astronomical_constant
	// @see https://github.com/kanasimi/IAU-SOFA/blob/master/src/sofam.h
	// @see
	// http://asa.usno.navy.mil/static/files/2015/Astronomical_Constants_2015.txt

	var
	/**
	 * Reference epoch (J2000.0), Julian Date. J2000.0 曆元。
	 * 
	 * DAYS_OF_JULIAN_CENTURY = (365 + 1/4) * 100
	 * 
	 * @type {Number}
	 * 
	 * @see https://en.wikipedia.org/wiki/Epoch_%28astronomy%29#Julian_years_and_J2000
	 */
	J2000_epoch = 2451545.0,
	/**
	 * Days per Julian century. 儒略世紀.
	 * 
	 * DAYS_OF_JULIAN_CENTURY = (365 + 1/4) * 100
	 * 
	 * @type {Number}
	 */
	DAYS_OF_JULIAN_CENTURY = 36525,
	/**
	 * speed of light in vacuum (m/s), c 光速.
	 * 
	 * @type {Number}
	 */
	CELERITAS = 299792458,
	/**
	 * Astronomical unit (meters).<br />
	 * 1 astronomical unit = 149597870700 meters (exactly)
	 * 
	 * Astronomical Almanac 2011:<br />
	 * au = A = 149597870700 ± 3 m
	 * 
	 * @type {Number}
	 */
	AU_TO_METERS = 149597870700,
	/**
	 * Light-time for unit (AU) distance (in days).<br />
	 * AU_LIGHT_TIME = 149597870700/299792458/86400 ≈ 0.005775518331436995
	 * 
	 * @type {Number}
	 */
	AU_LIGHT_TIME = AU_TO_METERS / CELERITAS / ONE_DAY_SECONDS,
	/**
	 * Earth mean radius (meter). 地球平均半徑(公尺)。地球半徑6,357km到6,378km。
	 * 
	 * @type {Number}
	 * 
	 * @see https://en.wikipedia.org/wiki/Earth_radius#Mean_radius
	 */
	TERRA_RADIUS_M = 6371009,
	/**
	 * Equatorial radius of Earth (meter). 地球赤道半徑(公尺)。
	 * 
	 * IERS (2003),<br />
	 * Astronomical Almanac 2011:<br />
	 * a_E = a_e = 6378136.6 ± 0.10 m
	 * 
	 * @type {Number}
	 * 
	 * @see https://en.wikipedia.org/wiki/Earth_ellipsoid#Historical_Earth_ellipsoids
	 */
	TERRA_EQUATORIAL_RADIUS_M = 6378136.6,
	/**
	 * Polar radius of Earth (meter). 地球極半徑(公尺)。
	 * 
	 * IERS (2003):<br />
	 * 
	 * @type {Number}
	 * 
	 * @see https://en.wikipedia.org/wiki/Earth_ellipsoid#Historical_Earth_ellipsoids
	 */
	TERRA_POLAR_RADIUS_M = 6356751.9,
	/**
	 * Earth's flattening = 1 / (Reciprocal of flattening).<br />
	 * 地球偏率 = 1 - 極半徑/赤道半徑
	 * 
	 * IERS (2003): 1 / 298.25642
	 * 
	 * @type {Number}
	 * 
	 * @see https://en.wikipedia.org/wiki/Earth_ellipsoid#Historical_Earth_ellipsoids
	 */
	TERRA_FLATTENING = 1 / 298.25642,
	/**
	 * 月球平均半徑 in meter (公尺)。
	 * 
	 * @type {Number}
	 * 
	 * @see http://en.wikipedia.org/wiki/Moon
	 */
	LUNAR_RADIUS_M = 1737100,
	/**
	 * 地月平均距離 in meter (公尺)。
	 * 
	 * 平均距離 mean distance: 384400 km (公里)<br />
	 * 半長軸 Semi-major axis: 384748 km (公里)<br />
	 * 
	 * @type {Number}
	 * 
	 * @see https://en.wikipedia.org/wiki/Lunar_distance_%28astronomy%29
	 * @see http://en.wikipedia.org/wiki/Orbit_of_the_Moon
	 * @see http://solarsystem.nasa.gov/planets/profile.cfm?Display=Facts&Object=Moon
	 */
	LUNAR_DISTANCE_M = 384400000,
	/**
	 * Geocentric semi-diameter of the Sun (in radians) 日面的平均地心視半徑。
	 * 960″.12±0″.09 (696, 342±65km).
	 * 
	 * old: 959.63 arcseconds.<br />
	 * 0°16′ should be added for the semidiameter.<br />
	 * average apparent radius of the Sun (16 arcminutes)
	 * 
	 * @type {Number}
	 * 
	 * @see http://arxiv.org/pdf/1203.4898v1.pdf
	 * @see http://arxiv.org/pdf/1106.2537.pdf
	 * @see http://aa.usno.navy.mil/faq/docs/RST_defs.php
	 * @see https://en.wikipedia.org/wiki/Solar_radius
	 */
	SOLAR_RADIUS_ARCSECONDS = 960.12,
	//
	SOLAR_RADIUS_RADIANS = SOLAR_RADIUS_ARCSECONDS * ARCSECONDS_TO_RADIANS,
	/**
	 * Geocentric semi-diameter of the Sun (in m) 日面的平均地心視半徑。
	 * 
	 * Math.atan(696342000 / 149597870700) / (2 * Math.PI) * 360 * 60 ≈ 16′
	 * 
	 * @type {Number}
	 */
	SOLAR_RADIUS_M = 696342000,
	/**
	 * Constant of aberration (arcseconds). κ 光行差常數
	 * 
	 * 天文學中定義周年光行差常數（簡稱光行差常數）為κ=v/c，其中c是光速，v是地球繞太陽公轉的平均速度
	 * 
	 * Astronomical Almanac 2011:<br />
	 * Constant of aberration at epoch J2000.0:<br />
	 * kappa = 20.49551″
	 * 
	 * @type {Number}
	 * 
	 * @see https://zh.wikipedia.org/wiki/%E5%85%89%E8%A1%8C%E5%B7%AE
	 */
	ABERRATION_κ = 20.49551;

	// ---------------------------------------------------------------------//
	// 初始調整並規範基本常數。

	// ---------------------------------------------------------------------//
	// private tool functions. 工具函數

	/**
	 * 經緯度 pattern [ , °, ′, ″, ″., NEWS ]
	 * 
	 * @type {RegExp}
	 */
	var LATITUDE_PATTERN, LONGITUDE_PATTERN;
	(function() {
		/**
		 * 經緯度 pattern [ , °, ′, ″, ″., NEWS ]
		 * <q>/([+\-]?\d+(?:\.\d+)?)°\s*(?:(\d+)[′']\s*(?:(\d+(?:\.\d+)?)(?:″|"|'')(\.\d+)?\s*)?)?([NEWS])/i</q>
		 */
		var d = /([+\-]?\d+(?:\.\d+)?)°\s*/, ms =
		//
		/(?:(\d+)[′']\s*(?:(\d+(?:\.\d+)?)(?:″|"|'')(\.\d+)?\s*)?)?/;

		LATITUDE_PATTERN = new RegExp(d.source + ms.source + '([NS])', 'i');
		LONGITUDE_PATTERN = new RegExp(d.source + ms.source + '([EW])', 'i');
	})();

	// 經緯度
	// [ {Number}latitude 緯度, {Number}longitude 經度 ]
	function parse_coordinates(coordinates) {
		var latitude, longitude,
		// e.g., '25.032969, 121.565418'
		matched = coordinates.match(
		//		
		/([+\-]?\d+(?:\.\d+)?)(?:\s+|\s*,\s*)([+\-]?\d+(?:\.\d+)?)/);
		if (matched)
			return [ +matched[1], +matched[2] ];

		// e.g., 25° 1′ 58.6884″ N 121° 33′ 55.5048″ E
		// e.g., 25° 1' 58.6884'' N 121° 33' 55.5048'' E
		matched = coordinates.match(LATITUDE_PATTERN);
		if (matched) {
			latitude = +matched[1] + (matched[2] ? matched[2] / 60 : 0)
					+ (matched[3] ? matched[3] / 60 / 60 : 0)
					+ (matched[4] ? matched[4] / 60 / 60 : 0);
			if (matched[5].toUpperCase() === 'S')
				latitude = -latitude;
		}
		matched = coordinates.match(LONGITUDE_PATTERN);
		if (matched) {
			longitude = +matched[1] + (matched[2] ? matched[2] / 60 : 0)
					+ (matched[3] ? matched[3] / 60 / 60 : 0)
					+ (matched[4] ? matched[4] / 60 / 60 : 0);
			if (matched[5].toUpperCase() === 'W')
				longitude = -longitude;
		}
		if (latitude || longitude)
			return [ latitude, longitude ];
	}

	_.parse_coordinates = parse_coordinates;

	/**
	 * get Julian centuries since J2000.0.<br />
	 * J2000.0 起算的儒略世紀數.<br />
	 * Interval between fundamental date J2000.0 and given date.
	 * 
	 * @param {Number}TT_JD
	 *            Julian date (JD of 天文計算用時間 TT)
	 * 
	 * @returns {Number} Julian centuries of JD from J2000.0
	 */
	function Julian_century(TT_JD) {
		return (TT_JD - J2000_epoch) / DAYS_OF_JULIAN_CENTURY;
	}

	_.Julian_century = Julian_century;

	// normalize degrees
	// to proper degrees 0–less than 360
	// near_0: −180–less than 180
	function normalize_degrees(degrees, near_0) {
		if (!degrees)
			return degrees;
		if ((degrees %= TURN_TO_DEGREES) < 0)
			degrees += TURN_TO_DEGREES;
		if (near_0 && degrees >= TURN_TO_DEGREES / 2)
			degrees -= TURN_TO_DEGREES;
		return degrees;
	}

	_.normalize_degrees = normalize_degrees;

	function normalize_radians(radians, near_0) {
		if (!radians)
			return radians;
		radians = radians.mod(TURN_TO_RADIANS);
		if (near_0 && radians >= TURN_TO_RADIANS / 2)
			radians -= TURN_TO_RADIANS;
		return radians;
	}

	_.normalize_radians = normalize_radians;

	/**
	 * 將時分秒轉成 radians。
	 * 
	 * @param {Number}hours
	 * @param {Number}minutes
	 * @param {Number}seconds
	 * @param {Boolean}to_days
	 *            轉成 days (turns)。
	 * @param {Boolean}is_degrees
	 *            輸入的是 degrees
	 * 
	 * @returns {Number}radians
	 */
	function time_to_radians(hours, minutes, seconds, to_days, is_degrees) {
		if (seconds)
			minutes = (minutes || 0) + seconds / 60;
		hours = ((hours || 0) + (minutes ? minutes / 60 : 0))
		// to days
		/ (is_degrees ? TURN_TO_DEGREES : ONE_DAY_HOURS);
		if (!to_days)
			hours *= TURN_TO_RADIANS;
		return hours;
	}

	_.time_to_radians = time_to_radians;

	/**
	 * 將 degrees 轉成 radians。
	 * 
	 * @param {Number}degrees
	 *            degrees
	 * @param {Number}arcminutes
	 *            arcminutes
	 * @param {Number}arcseconds
	 *            arcseconds
	 * @param {Boolean}to_days
	 *            轉成 days (turns)。
	 * 
	 * @returns {Number}radians
	 */
	function degrees_to_radians(degrees, arcminutes, arcseconds, to_days) {
		if (degrees < 0) {
			if (arcminutes)
				arcminutes = -arcminutes, arcseconds = -arcseconds;
			if (arcseconds)
				arcseconds = -arcseconds;
		}
		return time_to_radians(degrees, arcminutes, arcseconds, to_days, true);
	}

	_.degrees_to_radians = degrees_to_radians;

	/**
	 * 計算角度差距(減法)。 return (base - target), target 會先趨近於 base。或是說結果會向 0 趨近。
	 * 
	 * subtract_degrees(base,target)>0: base>target, base-target>0
	 * 
	 * @param {Object}base
	 *            base coordinates
	 * @param {Object}target
	 *            target coordinates
	 * 
	 * @returns {Number}
	 */
	function subtract_degrees(base, target) {
		if (Math.abs(base = (base - target) % TURN_TO_DEGREES)
		//
		>= TURN_TO_DEGREES / 2)
			if (base > 0)
				base -= TURN_TO_DEGREES;
			else
				base += TURN_TO_DEGREES;
		return base;
	}

	/**
	 * show degrees / sexagesimal system. 顯示易懂角度。
	 * 
	 * @param {Number}degrees
	 *            degrees
	 * @param {Integer}padding
	 *            小數要取的位數。
	 * 
	 * @returns {String}易懂角度。
	 * 
	 * @see https://en.wikipedia.org/wiki/Minute_and_second_of_arc
	 */
	function format_degrees(degree, padding) {
		if (!degree)
			return '0°';

		// is negative.
		var minus = degree < 0;
		// 處理負數。
		if (minus)
			degree = -degree;

		var value = Math.floor(degree),
		//
		show = '';
		if (value > 0) {
			degree -= value;
			// 限制範圍在0至360度內。
			value %= TURN_TO_DEGREES;
			if (padding >= 0 && value < 100)
				show = value > 9 ? ' ' : '  ';
			show += value + '° ';
		}

		if (degree > 0) {
			value = (degree *= 60) | 0;
			if (value || show)
				show += (padding && value < 10 ? ' ' : '')
				//
				+ value + '′ ';
			if (degree -= value) {
				degree *= 60;
				degree = padding >= 0 ? (degree < 10 ? ' ' : '')
						+ degree.toFixed(padding) : String(degree);
				show += degree.includes('.') ? degree.replace('.', '″.')
				// arcseconds
				: degree + '″';
			}
		}

		// 處理負數。
		if (minus)
			show = '-' + show;

		return show.replace(/ $/, '');
	}

	_.format_degrees = format_degrees;

	/**
	 * show time angle. 顯示易懂時角。
	 * 
	 * @param {Number}days
	 *            days / turns
	 * 
	 * @returns {String}易懂時角。
	 * 
	 * @see https://en.wikipedia.org/wiki/Unicode_subscripts_and_superscripts
	 */
	function days_to_time(days) {
		var show = '', minus = days < 0;
		// 處理負數。
		if (minus)
			days = -days;

		// time: hours
		var time = (days % 1) * ONE_DAY_HOURS;
		if (days |= 0)
			show += days + 'ᵈ';

		days = time | 0;
		if (days || show)
			show += days + 'ʰ';

		// time: minutes
		time = (time % 1) * 60;
		days = time | 0;
		if (days || show)
			show += days + 'ᵐ';

		// time: seconds
		time = (time % 1) * 60;
		if (days || show)
			show += days + 'ˢ';
		// time <= 1e-10: 當作 error。
		// 1e-11: -Math.log10((1/2-1/3-1/6)*86400)|0
		if ((time %= 1) > 1e-11) {
			// 去首尾之 0。
			time = time.toPrecision(11).replace(/0+$/, '').replace(/^0+/, '');
			if (show)
				show += time;
			else
				show = '0ˢ' + time;
		} else if (!show) {
			show = '0';
		}

		// 收尾。

		// 處理負數。
		if (minus)
			show = '-' + show;

		return show;
	}

	_.days_to_time = days_to_time;

	/**
	 * format radians
	 * 
	 * @param {Number}radians
	 *            radians to format
	 * @param {String}[to_type]
	 *            to what type: decimal degrees, degrees, time, radians, turns
	 * @param {Object}[options]
	 *            附加參數/設定特殊功能與選項:<br />
	 * 
	 * @returns {String}formatted radians
	 */
	function format_radians(radians, to_type, options) {
		if (!to_type)
			// default: degrees of sexagesimal measure
			to_type = 'degrees';

		switch (to_type) {
		case 'decimal':
		case 'decimal degrees':
			return radians / DEGREES_TO_RADIANS;
		case 'degrees':
			return format_degrees(radians / DEGREES_TO_RADIANS, options
					&& options.padding);
		case 'turns':
			return radians / TURN_TO_RADIANS;
		case 'time':
			return days_to_time(radians / TURN_TO_RADIANS);
		}
		// default
		return radians;
	}

	_.format_radians = format_radians;

	// ------------------------------------------------------------------------------------------------------//
	// semi-diameter of objects

	/**
	 * 天體的中心視半徑 (in arcseconds)。
	 * 
	 * e.g., Geocentric semi-diameter of the Sun, apparent radius, 日面的地心視半徑。
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版<br />
	 * p. 390. Chapter 55 Semidiameters of the Sun, Moon, and Planets
	 * 
	 * @param {Object|Number}coordinates
	 *            coordinates or distance (in AU) of object
	 * @param {Number|String}[radius]
	 *            object radius (in arcseconds) or object name. default: sun
	 * @param {Number}[latitude]
	 *            object-centric latitude of the Earth.<br />
	 *            e.g., Saturnicentric latitude of the Earth (see Chapter 45).<br />
	 *            “以土星為中心”的緯度(詳見《天文算法》第45章)。
	 * 
	 * @returns {Number}semi-diameter (in arcseconds)
	 * 
	 * @see https://github.com/soniakeys/meeus/blob/master/semidiameter/semidiameter.go
	 */
	function semidiameter(coordinates, radius, latitude) {
		var object = coordinates && coordinates.object
				|| (isNaN(radius) ? radius : SUN_NAME);
		if (!radius)
			radius = object;
		if (radius in semidiameter.apparent)
			radius = semidiameter.apparent[object = radius];
		else if (radius === SUN_NAME)
			object = radius, radius = SOLAR_RADIUS_ARCSECONDS;
		// assert: radius is in arcseconds now.

		var distance = typeof coordinates === 'number' && coordinates > 0 ? coordinates
				: coordinates.Δ
						|| (object === MOON_NAME ? LUNAR_DISTANCE_M
								/ AU_TO_METERS
						// 1: default: 1 AU
						: 1);
		// assert: distance is in AU now.

		if (object === MOON_NAME) {
			if (false && coordinates.Δ > 0) {
				radius = Math.atan(LUNAR_RADIUS_M / AU_TO_METERS
						/ coordinates.Δ)
						/ ARCSECONDS_TO_RADIANS;
				if (latitude)
					// → 以觀測者為中心的座標中看到的月亮視半徑
					radius += radius * Math.sin(latitude * DEGREES_TO_RADIANS)
							* TERRA_RADIUS_M / LUNAR_DISTANCE_M;
				return radius;
			}

			// 設Δ是地球中心到月球中心到的距離(單位是千米)，
			distance *= AU_TO_METERS / 1000;
			/**
			 * π是月球的赤道地平視差，s是月亮的地心視半徑，k是月亮平均半徑與地球赤道半徑的比值。在1963到1968年的天文曆書中，日月食計算中取k=0.272481
			 * 
			 * Explanatory Supplement to the Astronomical Ephemeris. Third
			 * impression 1974.<br />
			 * p. 213.<br />
			 * As from 1963, the value of k is taken as 0.2724807, which leads
			 * to the same value of the semi-diameter as in the lunar ephemeris.
			 * The value 0.272274 for k is retained, however, in the calculation
			 * of duration on the central line of total solar eclipses, by way
			 * of applying an approximate correction for the irregularities of
			 * the lunar limb.
			 * 
			 * Explanatory Supplement to the Astronomical Almanac.<br />
			 * p. 425.<br />
			 * The lAU adopted a new value of k (k = 0.2725076) in August 1982.
			 */
			var k = 0.272481, sin_π = 6378.14 / distance;
			if (coordinates && coordinates.LHA) {
				// p. 280. formula 40.7
				var A = Math.cos(coordinates.δ) * Math.sin(coordinates.LHA),
				//
				B = Math.cos(coordinates.δ) * Math.cos(coordinates.LHA)
						- coordinates.ρcos_φp * sin_π,
				//
				C = Math.sin(coordinates.δ) - coordinates.ρsin_φp * sin_π;
				/**
				 * the topocentric distance of the Moon (that is, the distance
				 * from the observer to the center of the Moon) is Δ′=q*Δ, q
				 * being given by formula (40.7).
				 */
				distance *= Math.sqrt(A * A + B * B + C + C);
				sin_π = 6378.14 / distance;
			}
			radius = Math.asin(k * sin_π) / ARCSECONDS_TO_RADIANS;
		} else {
			radius /= distance;

			if (latitude && object
					&& ((object + '_polar') in semidiameter.apparent)) {
				// 極半徑/赤道半徑
				var k = semidiameter.apparent[object + '_polar']
						/ semidiameter.apparent[object];
				k = 1 - k * k;
				latitude = Math.cos(latitude * DEGREES_TO_RADIANS);
				radius *= Math.sqrt(1 - k * latitude * latitude);
			}
		}

		return radius;
	}

	_.semidiameter = semidiameter;

	/**
	 * apparent radius (arcseconds). 距離 1 AU 時的太陽和行星的視半徑。
	 * 
	 * @type {Object}
	 */
	semidiameter.apparent = {
		mercury : 3.36,
		venus_surface : 8.34,
		// +cloud
		// 對於金星，值8″.34，指從地球上看它的地殼半徑，而不是指它的雲層。由於這個原因，當計算諸如中天、淩日、星食等天文現象時，我們採用舊值8″.41。
		venus : 8.41,
		mars : 4.68,
		// equatorial
		jupiter : 98.44,
		jupiter_polar : 92.06,
		// equatorial
		saturn : 82.73,
		saturn_polar : 73.82,
		uranus : 35.02,
		neptune : 33.50,
		pluto : 2.07
	};

	// ------------------------------------------------------------------------------------------------------//
	// coordinate transformations 座標變換
	// @see
	// https://en.wikipedia.org/wiki/List_of_common_coordinate_transformations

	/**
	 * auto detect time zone. 自動判別時區。
	 * 
	 * @param {Array}local
	 *            the observer's geographic location [ latitude (°), longitude
	 *            (°), time zone (e.g., UTC+8: 8), elevation or geometric height
	 *            (m) ]<br />
	 *            觀測者 [ 緯度（北半球為正,南半球為負）, 經度（從Greenwich向東為正，西為負）, 時區,
	 *            海拔標高(觀測者距海平面的高度) ]
	 * 
	 * @returns {Number}time zone. UTC+8: 8
	 */
	function get_time_zone(local) {
		return isNaN(local[2]) ? Math.round(local[1]
				/ (TURN_TO_DEGREES / ONE_DAY_HOURS)) : local[2];
	}

	/**
	 * 此函數為為了舊曆元所做的修正。
	 * 
	 * longitude λ must be converted to the ephemeris longitude λ* by increasing
	 * it by 1.002738 ΔT, the sidereal equivalent of ΔT.
	 * 
	 * 星曆用的經度從Greenwich向西為正，東為負，與向東為正的一般地理經度用法相反。
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * Explanatory Supplement to the Astronomical Ephemeris. Third impression
	 * 1974.<br />
	 * p. 241.
	 * 
	 * The ephemeris meridian is 1.002 738 ΔT east of the Greenwich meridian,
	 * where ΔT=TT−UT1.
	 * 
	 * @param {Number}longitude
	 *            longitude of geographic coordinate in degrees, 一般地理經度
	 * @param {Number}TT_JD
	 *            Julian date (JD of 天文計算用時間 TT)
	 * 
	 * @returns {Number}ephemeris longitude in radians, 星曆用的經度
	 * 
	 * @see http://asa.usno.navy.mil/SecM/Glossary.html
	 */
	function to_ephemeris_longitude(longitude, TT_JD) {
		return -longitude * DEGREES_TO_RADIANS;

		return ((TT_JD ? 1.002738 * ΔT_of_JD(TT_JD) : 0) - longitude)
				* DEGREES_TO_RADIANS;
	}

	/**
	 * ephemeris longitude → geographic longitude
	 * 
	 * @param {Number}longitude
	 *            ephemeris longitude in radians, 星曆用的經度
	 * @param {Number}TT_JD
	 *            Julian date (JD of 天文計算用時間 TT)
	 * 
	 * @returns {Number}geographic longitude in degrees
	 */
	function from_ephemeris_longitude(longitude, TT_JD) {
		return normalize_radians(-longitude, true) /
		//
		DEGREES_TO_RADIANS;

		return (TT_JD ? -1.002738 * ΔT_of_JD(TT_JD) : 0) - longitude
				/ DEGREES_TO_RADIANS;
	}

	/**
	 * 計算角距離 angular distance (in radians)
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版<br />
	 * p. 109. formula 17.1
	 * 
	 * @param {Object}coordinates_1
	 *            apparent geocentric ecliptical coordinates<br /> { longitude
	 *            α , latitude δ } in radians
	 * @param {Object}coordinates_2
	 *            apparent geocentric ecliptical coordinates<br /> { longitude
	 *            α , latitude δ } in radians
	 * 
	 * @returns {Number}angular distance in radians
	 */
	function angular_distance(coordinates_1, coordinates_2, no_minor_squre) {
		var Δα = Math.abs(coordinates_1.α - coordinates_2.α), Δδ,
		//
		δ1 = coordinates_1.δ, δ2 = coordinates_2.δ;
		// 10 / 60 / 360 * (2 * Math.PI) = 0.0029088820866572155
		if (!no_minor_squre && Δα < .001 && (Δδ = Math.abs(δ1 - δ2)) < .001) {
			// 角度差接近於0或180度時，求取近似值。
			Δα *= Math.cos((δ1 + δ2) / 2);
			return Math.sqrt(Δα * Δα + Δδ * Δδ);
		}
		if (false)
			console.log(Math.sin(δ1) * Math.sin(δ2) + Math.cos(δ1)
					* Math.cos(δ2) * Math.cos(Δα));
		return Math.acos(Math.sin(δ1) * Math.sin(δ2) + Math.cos(δ1)
				* Math.cos(δ2) * Math.cos(Δα));
	}

	_.angular_distance = angular_distance;

	/**
	 * 向量長度，與原點距離。
	 * 
	 * @param {Array}rectangular
	 *            直角座標 [ x, y, z ]
	 * 
	 * @returns {Number}distance
	 */
	function distance_of_rectangular(rectangular) {
		var x = rectangular[0], y = rectangular[1], z = rectangular[2];
		return Math.sqrt(x * x + y * y + z * z);
	}

	/**
	 * spherical coordinates → rectangular coordinates. 球座標系(日心座標)轉為直角座標系。
	 * 
	 * @param {Number}longitude
	 *            longitude (L) of spherical 球座標
	 * @param {Number}latitude
	 *            latitude (B) of spherical 球座標
	 * @param {Number}radius
	 *            radius (R) of spherical 球座標
	 * @param {Object}[options]
	 *            附加參數/設定特殊功能與選項:<br />
	 *            {Boolean}options.unit_radius: 若為 true，則將 .R 當作 1。<br />
	 *            {Object}options.base: base spherical coordinates. {L,B,R}
	 *            基準球座標.
	 * 
	 * @returns {Object}rectangular coordinates [ x, y, z ]
	 * 
	 * @see https://en.wikipedia.org/wiki/Ecliptic_coordinate_system#Rectangular_coordinates
	 *      https://en.wikipedia.org/wiki/Equatorial_coordinate_system#Geocentric_equatorial_coordinates
	 */
	function spherical_to_rectangular(longitude, latitude, radius, options) {
		if (library_namespace.is_Object(longitude)) {
			options = latitude;
			radius = longitude.R;
			latitude = longitude.B;
			longitude = longitude.L;
		}

		// 前置處理。
		if (!library_namespace.is_Object(options))
			options = Object.create(null);

		var tmp, cos_B = Math.cos(latitude),
		//
		x = cos_B * Math.cos(longitude), y = cos_B * Math.sin(longitude), z = Math
				.sin(latitude);

		if (!options.unit_radius && radius) {
			x *= radius;
			y *= radius;
			z *= radius;
		}

		if (tmp = options.base) {
			tmp = spherical_to_rectangular(tmp, options.unit_radius ? {
				unit_radius : true
			} : null);
			x -= tmp[0];
			y -= tmp[1];
			z -= tmp[2];
		}

		tmp = [ x, y, z ];
		if (options.distance)
			tmp.distance = Math.sqrt(x * x + y * y + z * z);

		// return rectangular
		return tmp;
	}

	/**
	 * rectangular coordinates → spherical coordinates. 直角座標系轉為球座標系(黃道座標)。
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版<br />
	 * p. 223. formula 33.2 座標變換
	 * 
	 * @param {Array}rectangular
	 *            直角座標 [ x, y, z ]
	 * @param {Boolean}get_radius
	 *            亦生成 radius
	 * 
	 * @returns {Object}spherical coordinates { λ , β }
	 */
	function rectangular_to_spherical(rectangular, get_radius) {
		var x = rectangular[0], y = rectangular[1], z = rectangular[2],
		// ecliptical (or celestial) [ longitude 黃經, latitude 黃緯 ]。
		spherical = [ Math.atan2(y, x), Math.atan2(z, Math.sqrt(x * x, y * y)) ];
		if (get_radius)
			spherical.push(Math.sqrt(x * x + y * y + z * z));
		return spherical;
	}

	/**
	 * Transformation from ecliptical into equatorial coordinates. G地心視黃道座標轉到
	 * E地心赤道座標(視赤經及視赤緯)
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版<br />
	 * p. 93. formula 13.3, 13.4
	 * 
	 * @param {Object}coordinates
	 *            apparent geocentric ecliptical coordinates<br /> { longitude
	 *            λ , latitude β }
	 * @param {Number}TT_JD
	 *            Julian date (JD of 天文計算用時間 TT)
	 * @param {Object}[options]
	 *            附加參數/設定特殊功能與選項
	 * 
	 * @returns {Object}equatorial coordinates { right ascension α , declination
	 *          δ }
	 */
	function ecliptical_to_equatorial(coordinates, TT_JD, options) {
		var ε = obliquity(TT_JD),
		// G地心視黃道 apparent geocentric ecliptic coordinates:
		// longitude λ and latitude β in radians
		λ = coordinates.λ, β = coordinates.β,
		// cache
		sin_λ = Math.sin(λ), cos_ε = Math.cos(ε), sin_ε = Math.sin(ε);

		// geocentric right ascension 地心赤經。
		coordinates.α = Math.atan2(sin_λ * cos_ε - Math.tan(β) * sin_ε, Math
				.cos(λ));
		// geocentric declination 地心赤緯。
		coordinates.δ = Math.asin(Math.sin(β) * cos_ε + Math.cos(β) * sin_ε
				* sin_λ);

		// 因為 equatorial_to_horizontal() 可能會再利用，這裡不處理 options.degrees。
		return coordinates;
	}

	/**
	 * equatorial coordinates → local horizontal coordinates.
	 * 依據觀測者的位置和時間，轉換地心視赤道座標到本地站心地平座標系。
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版<br />
	 * p. 93. formula 13.5, 13.6 座標變換<br />
	 * Chapter 40: Correction for Parallax
	 * 
	 * @param {Object}coordinates
	 *            equatorial coordinates { right ascension α , declination δ }
	 * @param {Number}TT_JD
	 *            Julian date (JD of 天文計算用時間 TT)
	 * @param {Array}local
	 *            the observer's geographic location [ latitude (°), longitude
	 *            (°), time zone (e.g., UTC+8: 8), elevation or geometric height
	 *            (m) ]<br />
	 *            觀測者 [ 緯度（北半球為正,南半球為負）, 經度（從Greenwich向東為正，西為負）, 時區,
	 *            海拔標高(觀測者距海平面的高度) ]
	 * 
	 * @returns {Object}horizontal { Alt:altitude (radians) , Az:azimuth
	 *          (radians) }
	 * 
	 * @see https://en.wikipedia.org/wiki/Horizontal_coordinate_system
	 */
	function equatorial_to_horizontal(coordinates, TT_JD, local) {
		/**
		 * 地心赤緯δ。
		 * 
		 * @type {Number}
		 */
		var δ = coordinates.δ;
		if (isNaN(δ))
			// 先算出地心視赤道座標。
			// 一般已在 function get_horizontal() 中處理。
			δ = ecliptical_to_equatorial(coordinates, TT_JD).δ;

		/**
		 * 地心赤經α。
		 * 
		 * @type {Number}
		 */
		var α = coordinates.α,
		/**
		 * Phi: lower-case letter φ (or often its variant, ϕ) 觀測者緯度（北半球為正,南半球為負）
		 * 
		 * @type {Number}
		 */
		φ = local[0] * DEGREES_TO_RADIANS,
		// p. 92.
		/**
		 * Greenwich視恆星時θ0
		 * 
		 * @type {Number} in radians
		 */
		θ0 = GAST(TT_of(TT_JD, true), TT_JD),
		/**
		 * 本地恆星時θ = Greenwich視恆星時θ0 - L觀測者星曆經度
		 * 
		 * @type {Number} in radians
		 */
		θ = θ0 - to_ephemeris_longitude(local[1], TT_JD),
		/**
		 * local hour angle (in radians)
		 * 本地地心時角。一個天體的時角是2.5HA，就表示他已經在2.5個小時之前通過當地的子午圈，並且在當地子午圈的西方37.5度的距離上。負數則表示在多少小時之後將通過當地的子午圈。
		 * 
		 * LHA = 本地恆星時θ − 地心赤經α = Greenwich視恆星時θ0 - L觀測者星曆經度 − 地心赤經α
		 * 
		 * @type {Number} in radians
		 */
		LHA = θ - α,
		// cache
		sin_φ = Math.sin(φ), cos_φ = Math.cos(φ),
		// cache
		cos_H = Math.cos(LHA),
		// p. 82.
		// tmp
		u = Math.atan(TERRA_POLAR_RADIUS_M / TERRA_EQUATORIAL_RADIUS_M
				* Math.tan(φ));

		// tmp
		LHA /= TERRA_EQUATORIAL_RADIUS_M;
		/**
		 * 計算周日視差、日月食、星蝕所需要的量ρsin(φ′)
		 * 
		 * @type {Number}
		 */
		var ρsin_φp = TERRA_POLAR_RADIUS_M / TERRA_EQUATORIAL_RADIUS_M
				* Math.sin(u) + LHA * sin_φ,
		/**
		 * 計算周日視差、日月食、星蝕所需要的量ρcos(φ′)
		 * 
		 * @type {Number}
		 */
		ρcos_φp = Math.cos(u) + LHA * cos_φ;

		coordinates.ρsin_φp = ρsin_φp;
		coordinates.ρcos_φp = ρcos_φp;

		// p. 279.
		// 地心視赤道座標轉到本地站心赤道座標:
		// 修正 planet's parallax (行星視差)
		var
		/**
		 * the equatorial horizontal parallax of the body in radians. 天體的赤道地平視差.
		 * 
		 * Math.sin(8.794 * ARCSECONDS_TO_RADIANS) ≈ 0.0000426345
		 * 
		 * @type {Number} in radians
		 */
		π = Math.asin(Math.sin(8.794 * ARCSECONDS_TO_RADIANS)
		// coordinates.Δ: apparent distance at TT_JD in AU in radians
		// 對於太陽、行星和慧星，經常適合使用它們到地球的距離Δ替代視差
		/ coordinates.Δ),
		// cache
		sin_π = Math.sin(π), cos_δ = Math.cos(δ);
		coordinates.π = π;
		// tmp
		u = ρcos_φp * sin_π;
		π = cos_δ - u * cos_H;
		var Δα = Math.atan2(-u * Math.sin(LHA), π);
		// 對於赤緯，不必計算Δδ，用下式可直接算出δ′：
		// apply new value to (δ, α, LHA).
		δ = Math.atan2((Math.sin(δ) - ρsin_φp * sin_π) * Math.cos(Δα), π);
		α += Δα;
		// T站心赤道 topocentric equatorial coordinate system
		// @see function Coordinates()
		coordinates.T = [ α, δ ];

		// coordinates.θ0 = θ0;
		// coordinates.θ = θ;
		// LHA: local hour angle (in radians) 本地地心時角。
		coordinates.LHA = LHA = θ - α;
		// re-cache
		cos_H = Math.cos(LHA);

		// p. 93.
		// 站心赤道座標轉到站心地平座標 (radians)
		// Altitude (Alt) 高度角或仰角又稱地平緯度。
		// 修正大氣折射的影響
		// TODO: 考慮 dip of the horizon (地平俯角, 海岸視高差)
		// @see
		// https://en.wikipedia.org/wiki/Horizon#Effect_of_atmospheric_refraction
		// http://www-rohan.sdsu.edu/~aty/explain/atmos_refr/altitudes.html
		coordinates.Alt = refraction(Math.asin(sin_φ * Math.sin(δ) + cos_φ
				* Math.cos(δ) * cos_H)
				/ DEGREES_TO_RADIANS)
				* DEGREES_TO_RADIANS;
		// Azimuth (Az) 方位角又稱地平經度。
		coordinates.Az = Math.atan2(Math.sin(LHA), cos_H * sin_φ - Math.tan(δ)
				* cos_φ);

		// parallactic angle
		// https://en.wikipedia.org/wiki/Parallactic_angle
		// Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版
		// p. 98. formula 14.1
		if (false
		// 當天體正好在天頂，則沒有定義。
		&& (π = Math.tan(φ) * Math.cos(δ) - Math.sin(δ) * cos_H))
			coordinates.parallactic = Math.atan2(Math.sin(LHA), π);

		// 因為可能會再利用，這裡不處理 options.degrees。
		return coordinates;
	}

	/**
	 * ecliptical → equatorial coordinates → local horizontal coordinates.
	 * 
	 * @param {Object}coordinates
	 *            apparent geocentric ecliptical coordinates<br /> { longitude
	 *            λ , latitude β }
	 * @param {Number}TT_JD
	 *            Julian date (JD of 天文計算用時間 TT)
	 * @param {Object}[options]
	 *            附加參數/設定特殊功能與選項
	 */
	function get_horizontal(coordinates, TT_JD, options) {
		var local = Array.isArray(options.local) && options.local;
		if (local || options.equatorial) {
			// 地心視黃道座標轉到視赤道座標(視赤經及視赤緯)。
			ecliptical_to_equatorial(coordinates, TT_JD, options);
			// 需要保證有 coordinates.Δ
			if (local && coordinates.Δ)
				equatorial_to_horizontal(coordinates, TT_JD, local);
			// 單位轉換。
			if (options.degrees) {
				if (local) {
					coordinates.Alt /= DEGREES_TO_RADIANS;
					coordinates.Az /= DEGREES_TO_RADIANS;
				}
				coordinates.α /= DEGREES_TO_RADIANS;
				coordinates.δ /= DEGREES_TO_RADIANS;
			}
		}

		// elongation Ψ of the planet, its angular distance to the Sun
		// https://en.wikipedia.org/wiki/Elongation_%28astronomy%29
		// 行星的距角，即地心看行星與太陽的角距離 (angular distance)。
		// Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版
		// Chapter 48 Illuminated Fraction of the Moon's Disk
		if (options.elongation) {
			// the Sun's apparent longitude in degrees → radians.
			var solar = solar_coordinates(TT_JD, {
				equatorial : true
			}),
			//
			λ0 = solar.apparent * DEGREES_TO_RADIANS,
			//
			cos_Ψ = Math.cos(coordinates.β) * Math.cos(coordinates.λ - λ0);
			// The Sun's latitude, which is always smaller than 1.2
			// arcsecond, may be neglected here.
			// 地心座標下的月球距角ψ
			coordinates.Ψ = Math.acos(cos_Ψ);
			// 月心座標下的地球距角i
			coordinates.i = Math.atan2(solar.Δ * Math.sin(coordinates.Ψ),
					coordinates.Δ - solar.Δ * cos_Ψ);
			// ψ和i在均在0到180度之間。

			// 月亮明亮邊緣的位置角
			coordinates.χ = Math.atan2(Math.cos(solar.δ)
					* Math.sin(solar.α - coordinates.α), Math.sin(solar.δ)
					* Math.cos(coordinates.δ) - Math.cos(solar.δ)
					* Math.sin(coordinates.δ)
					* Math.cos(solar.α - coordinates.α));

			// 單位轉換。
			if (options.degrees) {
				coordinates.Ψ /= DEGREES_TO_RADIANS;
				coordinates.i /= DEGREES_TO_RADIANS;
				coordinates.χ /= DEGREES_TO_RADIANS;
			}
		}
	}

	// ------------------------------------------------------------------------------------------------------//
	// ΔT

	/**
	 * get ΔT of year.<br />
	 * ΔT = TT - UT<br />
	 * <br />
	 * 天文計算/星曆表使用 Terrestrial Time (TT, 地球時標)，<br />
	 * 日常生活中使用 UTC, 接近 Universal Time (UT, 世界時標), 主要為 UT1。<br />
	 * <br />
	 * 簡略的說，天文計算用時間 TT = 日常生活時間 UT + ΔT
	 * 
	 * ΔT is NOT △T
	 * 
	 * @param {Number}year
	 *            the year value of time = year + (month - 0.5) / 12
	 * @param {Number}[month]
	 *            the month of time.
	 * 
	 * @returns {Number} ΔT of year in seconds.
	 * 
	 * @see https://en.wikipedia.org/wiki/%CE%94T
	 * @see <a href="http://www.cv.nrao.edu/~rfisher/Ephemerides/times.html"
	 *      accessdate="2015/3/25 20:35">Astronomical Times</a>
	 * @see http://njsas.org/projects/speed_of_light/roemer/tt-utc.html
	 * 
	 * @since 2015/3/21 9:23:32
	 */
	function ΔT(year, month) {
		if (month > 0)
			year += (month - 0.5) / 12;

		var index = 0;
		while (true) {
			if (year >= ΔT_year_start[index])
				break;
			if (++index === ΔT_year_start.length) {
				// before −500: the same as after 2150.
				index = 0;
				break;
			}
		}

		var deltaT = polynomial_value(ΔT_coefficients[index],
				(year - ΔT_year_base[index]) / 100);
		library_namespace.debug('ΔT of year ' + year + ': ' + deltaT
				+ ' seconds', 3);

		return deltaT;
	}

	_.deltaT = _.ΔT = ΔT;

	/**
	 * get ΔT of JD.<br />
	 * ΔT = TT - UT<br />
	 * <br />
	 * 天文計算/星曆表使用 Terrestrial Time (TT, 地球時標)，<br />
	 * 日常生活中使用 UTC, 接近 Universal Time (UT, 世界時標), 主要為 UT1。<br />
	 * <br />
	 * 簡略的說，天文計算用時間 TT = 日常生活時間 UT + ΔT
	 * 
	 * @param {Number}JD
	 *            Julian date
	 * 
	 * @returns {Number} ΔT of year in seconds.
	 */
	function ΔT_of_JD(JD) {
		// + 2000: Julian_century(JD) starts from year 2000.
		return ΔT(Julian_century(JD) * 100 + 2000);
	}

	_.deltaT.JD = ΔT_of_JD;

	/**
	 * get Terrestrial Time of Universal Time JD, apply ΔT to UT.
	 * 
	 * @param {Number}UT_JD
	 *            Julian date (JD of 日常生活時間 UT)
	 * @param {Boolean}[TT_to_UT]
	 *            reverse, TT → UT. treat JD as 天文計算用時間 TT.
	 * 
	 * @returns {Number}JD of TT
	 */
	function TT_of(UT_JD, TT_to_UT) {
		if (library_namespace.is_Date(UT_JD))
			UT_JD = library_namespace.Date_to_JD(UT_JD);
		var deltaT = ΔT_of_JD(UT_JD) / ONE_DAY_SECONDS;
		// normal: UT → TT.
		// TT_to_UT: TT → UT.
		// 簡略的說，日常生活時間 UT = 天文計算用時間 TT - ΔT
		return TT_to_UT ? UT_JD - deltaT : UT_JD + deltaT;
	}

	/**
	 * Translate Terrestrial Time JD → Universal Time JD.
	 * 
	 * @param {Number}TT_JD
	 *            Julian date (JD of 天文計算用時間 TT)
	 * 
	 * @returns {Number}JD of UT
	 */
	function UT_of(TT_JD) {
		return TT_of(TT_JD, true);
	}

	_.TT = TT_of;
	_.UT = UT_of;

	// ------------------------------------------------------------------------------------------------------//
	// Atmospheric refraction 大氣折射又稱蒙氣差、折光差（蒙氣即行星的大氣）

	/**
	 * true apparent in degrees ← apparent altitude.<br />
	 * 大氣折射公式: 真地平緯度 ← 視地平緯度<br />
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版<br />
	 * chapter 大氣折射.<br />
	 * based on: G. G. Bennett. (1982). "The Calculation of Astronomical
	 * Refraction in Marine Navigation".
	 * 
	 * @param {Number}apparent
	 *            apparent altitude in degrees. 視地平緯度/高度角或仰角，單位是度。
	 * @param {Number}[Celsius]
	 *            temperature in degree Celsius. 攝氏度氣溫
	 * @param {Number}[pressure]
	 *            pressure in kPa. 地表氣壓
	 * 
	 * @returns {Number} degrees of true apparent. 單位是度
	 * 
	 * @since 2015/3/21 21:31:17
	 * 
	 * @see https://en.wikipedia.org/wiki/Atmospheric_refraction#Calculating_refraction
	 * @see http://www.astro.com/ftp/swisseph/src/swecl.c
	 */
	function refraction_to_real(apparent, Celsius, pressure) {
		// (86.63175) get 4.186767499821572e-10
		// 經測試，再多就變負數。
		if (apparent > 86.63175)
			// Jean Meeus: 在90°時，不作第二項修正反而更好。
			return apparent;

		// refraction in arcminutes. 折射角單位是分。
		var refraction = 1 / Math.tan((apparent + 7.31 / (apparent + 4.4))
				* DEGREES_TO_RADIANS);
		// 第二項公式修正
		refraction -= 0.06 * Math.sin(14.7 * refraction + 13);
		// assert: refraction > 0

		// Jean Meeus: 大約修正。折射率還與光的波長有關。這些運算式適用于黃光，它對人眼的靈敏度最高。
		// @see
		// http://www.iausofa.org/2015_0209_C/sofa/sofa_ast_c.pdf#75
		// 常規條件: Both formulas assume an atmospheric pressure
		// of 101.0 kPa and a temperature of 10 °C
		if (!isNaN(Celsius))
			// [K] = [°C] + 273.15
			refraction *= (273 + 10) / (273 + refraction);
		if (pressure >= 0)
			refraction *= pressure / 101;

		// 1度 = 60分
		return apparent - refraction / 60;
	}

	/**
	 * apparent altitude in degrees ← true altitude.<br />
	 * 大氣折射公式: 視地平緯度 ← 真地平緯度
	 * 
	 * @param {Number}real
	 *            real altitude in degrees. 真地平緯度/高度角或仰角，單位是度。
	 * @param {Number}[Celsius]
	 *            temperature in degree Celsius. 攝氏度氣溫
	 * @param {Number}[pressure]
	 *            pressure in kPa. 地表氣壓
	 * 
	 * @returns {Number} degrees of apparent altitude. 單位是度
	 * 
	 * @since 2015/3/21 21:31:17
	 * 
	 * @see https://en.wikipedia.org/wiki/Atmospheric_refraction#Calculating_refraction
	 * @see http://www.astro.com/ftp/swisseph/src/swecl.c
	 */
	function refraction(real, Celsius, pressure) {
		// (89.891580) get 2.226931796052203e-10
		// 經測試，再多就變負數。
		if (real > 89.89158)
			// Jean Meeus: h=90°時，該式算得R不等於零。
			return real;

		// refraction in arcminutes. 折射角單位是分.
		var refraction = 1.02 / Math.tan((real + 10.3 / (real + 5.11))
				* DEGREES_TO_RADIANS);
		// assert: refraction > 0

		// Jean Meeus: 大約修正。折射率還與光的波長有關。這些運算式適用于黃光，它對人眼的靈敏度最高。
		// 常規條件: Both formulas assume an atmospheric pressure
		// of 101.0 kPa and a temperature of 10 °C
		if (!isNaN(Celsius))
			// [K] = [°C] + 273.15
			refraction *= (273 + 10) / (273 + refraction);
		if (pressure >= 0)
			refraction *= pressure / 101;

		// 1度 = 60分
		return real + refraction / 60;
	}

	refraction.to_real = refraction_to_real;
	_.refraction = refraction;

	// ------------------------------------------------------------------------------------------------------//
	// obliquity 轉軸傾角。

	/**
	 * 地球的平均轉軸傾角，平黃赤交角。 get mean obliquity of the ecliptic (Earth's axial tilt),
	 * IAU 2006 precession model.
	 * 
	 * Reference 資料來源/資料依據:
	 * https://github.com/kanasimi/IAU-SOFA/blob/master/src/obl06.c
	 * 
	 * @param {Number}TT_JD
	 *            Julian date (JD of 天文計算用時間 TT)
	 * 
	 * @returns {Number} obliquity in radians
	 */
	function mean_obliquity_IAU2006(TT_JD) {
		return polynomial_value(IAU2006_obliquity_coefficients,
		// Interval between fundamental date J2000.0
		// and given date (JC).
		Julian_century(TT_JD)) * ARCSECONDS_TO_RADIANS;
	}

	/**
	 * 地球的平均轉軸傾角，平黃赤交角。 get mean obliquity of the ecliptic (Earth's axial tilt).
	 * 
	 * Reference 資料來源/資料依據: Laskar, J. (1986). "Secular Terms of Classical
	 * Planetary Theories Using the Results of General Relativity".
	 * 
	 * J. Laskar computed an expression to order T10 good to 0″.02 over 1000
	 * years and several arcseconds over 10,000 years.
	 * 
	 * @param {Number}TT_JD
	 *            Julian date (JD of 天文計算用時間 TT), 適用於J2000.0起算前後各10000年的範圍內。
	 * 
	 * @returns {Number} obliquity in radians
	 */
	function mean_obliquity_Laskar(TT_JD) {
		return polynomial_value(Laskar_obliquity_coefficients,
		// J2000.0 起算的儒略萬年數
		Julian_century(TT_JD) / 100) * DEGREES_TO_RADIANS;
	}

	/**
	 * 地球的平均轉軸傾角，平黃赤交角。
	 * 
	 * @type {Function}
	 */
	var mean_obliquity = mean_obliquity_Laskar;

	/**
	 * 地球的轉軸傾角，真黃赤交角ε。<br />
	 * get obliquity of the ecliptic (Earth's axial tilt).
	 * 
	 * @param {Number}TT_JD
	 *            Julian date (JD of 天文計算用時間 TT)
	 * 
	 * @returns {Number}obliquity in radians
	 * 
	 * @see https://en.wikipedia.org/wiki/Axial_tilt
	 */
	function obliquity(TT_JD) {
		// 真黃赤交角是ε=ε0+Δε，Δε是交角章動。（詳見第21章 章動及黃赤交角）。
		return mean_obliquity(TT_JD) + nutation(TT_JD)[1];
	}

	_.obliquity = obliquity;

	// ------------------------------------------------------------------------------------------------------//
	// sidereal time. 恆星時

	/**
	 * Earth rotation angle (IAU 2000 model). 地球自轉角
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * IAU-SOFA: /src/era00.c
	 * 
	 * @param {Number}UT_JD
	 *            Julian date (JD of 日常生活時間 UT)
	 * 
	 * @returns {Number}Earth rotation angle (radians)
	 * 
	 * @see https://github.com/kanasimi/IAU-SOFA/blob/master/src/era00.c
	 */
	function IAU2000_ERA(UT_JD) {
		return TURN_TO_RADIANS * (
		// Fractional part of T (days).
		(UT_JD % 1)
		// Astronomical Almanac 2011:
		// Earth rotation angle (ERA) at J2000.0 UT1:
		// theta_0 = 0.7790572732640 revolutions
		+ 0.7790572732640
		// Astronomical Almanac 2011:
		// Rate of advance of ERA:
		// d(theta)/dUT1 = 1.00273781191135448 revs/UT1-day
		+ 0.00273781191135448
		// Days since fundamental epoch.
		* (UT_JD - J2000_epoch));
	}

	/**
	 * Earth rotation angle. 地球自轉角
	 * 
	 * @type {Function}
	 */
	_.ERA = IAU2000_ERA;

	/**
	 * terms for function IAU2006_GMST()
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * IAU-SOFA: /src/gmst06.c
	 * 
	 * @type {Array}
	 * @inner
	 * 
	 * @see https://github.com/kanasimi/IAU-SOFA/blob/master/src/gmst06.c
	 */
	var IAU2006_GMST_parameters = [ 0.014506, 4612.156534, 1.3915817,
			-0.00000044, -0.000029956, -0.0000000368 ].map(function(p) {
		return p * ARCSECONDS_TO_RADIANS;
	});

	/**
	 * Greenwich mean sidereal time (consistent with IAU 2006 precession).
	 * 
	 * Both UT1 and TT are required, UT1 to predict the Earth rotation and TT to
	 * predict the effects of precession.
	 * 
	 * his GMST is compatible with the IAU 2006 precession and must not be used
	 * with other precession models.
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * IAU-SOFA: /src/gmst06.c
	 * 
	 * @param {Number}UT_JD
	 *            Julian date (JD of 日常生活時間 UT)
	 * @param {Number}TT_JD
	 *            Julian date (JD of 天文計算用時間 TT)
	 * 
	 * @returns {Number}Greenwich mean sidereal time (radians)
	 * 
	 * @see https://github.com/kanasimi/IAU-SOFA/blob/master/src/gmst06.c
	 */
	function IAU2006_GMST(UT_JD, TT_JD) {
		if (isNaN(TT_JD))
			TT_JD = TT_of(UT_JD);
		/**
		 * Julian centuries since J2000.0.<br />
		 * J2000.0 起算的儒略世紀數.
		 * 
		 * @type {Number}
		 */
		var T = Julian_century(TT_JD);

		// Greenwich mean sidereal time, IAU 2006.
		return IAU2000_ERA(UT_JD)
				+ polynomial_value(IAU2006_GMST_parameters, T);
	}

	/**
	 * terms for function Meeus_GMST()
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版<br />
	 * p. 88. formula 12.4
	 * 
	 * @type {Array}
	 * @inner
	 */
	var Meeus_GMST_parameters = [ 280.46061837,
			360.98564736629 * DAYS_OF_JULIAN_CENTURY, 0.000387933,
			-1 / 38710000 ].map(function(p) {
		return p * DEGREES_TO_RADIANS;
	});

	/**
	 * The mean sidereal time at Greenwich at Oh UT
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版<br />
	 * p. 88. formula 12.4
	 * 
	 * @param {Number}UT_JD
	 *            Julian date (JD of 日常生活時間 UT)
	 * 
	 * @returns {Number}Greenwich mean sidereal time (radians)
	 */
	function Meeus_GMST(UT_JD) {
		/**
		 * Julian centuries since J2000.0.<br />
		 * J2000.0 起算的儒略世紀數.
		 * 
		 * @type {Number}
		 */
		var T = Julian_century(UT_JD);
		return polynomial_value(Meeus_GMST_parameters, T).mod(TURN_TO_RADIANS);
	}

	/**
	 * Greenwich mean sidereal time. 平恆星時
	 * 
	 * @type {Function}
	 */
	var GMST = IAU2006_GMST;
	_.GMST = GMST;

	/**
	 * Greenwich apparent sidereal time, IAU 2006. Greenwich視恆星時
	 * 
	 * TODO: not yet done
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * IAU-SOFA: /src/gst06.c
	 * 
	 * @param {Number}UT_JD
	 *            Julian date (JD of 日常生活時間 UT)
	 * @param {Number}TT_JD
	 *            Julian date (JD of 天文計算用時間 TT)
	 * 
	 * @returns {Number}Greenwich apparent sidereal time (radians)
	 * 
	 * @see https://github.com/kanasimi/IAU-SOFA/blob/master/src/gst06a.c
	 * @see https://github.com/kanasimi/IAU-SOFA/blob/master/src/gst06.c
	 */
	function IAU2006_GAST(UT_JD, TT_JD) {
		if (isNaN(TT_JD))
			TT_JD = TT_of(UT_JD);

		// Extract from the bias-precession-nutation matrix the X,Y
		// coordinates of the Celestial Intermediate Pole.
		var xy = iauBpn2xy(rnpb);
		// the CIO locator s, given X,Y, IAU 2006
		s = iauS06(TT_JD, xy);

		return IAU2000_ERA(UT_JD)
		// equation of the origins, given NPB matrix and s
		- iauEors(rnpb, s);
	}

	/**
	 * Greenwich apparent sidereal time. Greenwich視恆星時
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版<br />
	 * p. 88.
	 * 
	 * @param {Number}UT_JD
	 *            Julian date (JD of 日常生活時間 UT)
	 * @param {Number}TT_JD
	 *            Julian date (JD of 天文計算用時間 TT)
	 * 
	 * @returns {Number}Greenwich apparent sidereal time (radians)
	 */
	function Meeus_GAST(UT_JD, TT_JD) {
		if (isNaN(TT_JD))
			TT_JD = TT_of(UT_JD);

		return GMST(UT_JD, TT_JD)
		// 赤經章動修正值 Δψ*cos(ε) 也稱作分點方程。
		+ nutation(TT_JD, true) * Math.cos(obliquity(TT_JD));
	}

	/**
	 * Greenwich apparent sidereal time. Greenwich視恆星時
	 * 
	 * @type {Function}
	 */
	var GAST = Meeus_GAST;
	_.GAST = GAST;

	// ------------------------------------------------------------------------------------------------------//
	// Sun's aberration. 太陽地心黃經光行差修正量。

	/**
	 * Sun's aberration. 太陽地心黃經光行差修正量。
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版<br />
	 * chapter 太陽位置計算 "太陽地心黃經光行差修正項" 式.<br />
	 * 
	 * @param {Number}R
	 *            日地距離(天文單位 AU), radius vector in AU。
	 * 
	 * @returns {Number} degree
	 * 
	 * @see https://en.wikipedia.org/wiki/Aberration_of_light
	 */
	function sun_aberration_low(R) {
		// 式中分子是光行差常數κ乘以a*(1-e²)，與24.5式的分子相同。
		// 因此24.10中的分子中其實是一個緩慢變化的數，在0年是20″.4893，在+4000年是20″.4904。
		return -20.4898 / DEGREES_TO_ARCSECONDS / R;
		// 24.10式本身不是一個嚴格的準確的運算式，因為它是假設地球軌道是不受攝動的標準橢圓。當受到攝動時，月球的攝動可引起0″.01的誤差。
	}

	/**
	 * Sun's aberration. 太陽地心黃經光行差修正量。
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版<br />
	 * p. 167, 168. chapter 太陽位置計算.<br />
	 * 
	 * @param {Number}R
	 *            日地距離(天文單位 AU), radius vector in AU。
	 * @param {Number}TT_JD
	 *            Julian date (JD of 天文計算用時間 TT)
	 * 
	 * @returns {Number} degree
	 * 
	 * @see https://en.wikipedia.org/wiki/Aberration_of_light
	 */
	function sun_aberration_high(R, TT_JD) {
		/**
		 * Julian millennia since J2000.0.<br />
		 * J2000.0 起算的儒略千年數.
		 * 
		 * @type {Number}
		 */
		var τ = Julian_century(TT_JD) / 10,
		// coefficients of Δλ
		coefficients = [];

		sun_aberration_variation.forEach(function(term) {
			var coefficient = 0;
			term.forEach(function(sub_term) {
				coefficient += sub_term[0]
						* Math.sin(sub_term[1] + sub_term[2] * τ);
			});
			coefficients.push(coefficient);
		});

		/**
		 * constant term of Sun's aberration
		 * 
		 * If needed with respect to the mean equinox of the date instead of to
		 * a fixed reference frame, the constant term 3548.193 should be
		 * replaced by 3548.330.
		 * 如果Δλ須是在Date黃道(瞬時黃道/當日黃道?)中的，則應把常數項3548.193換為3548.330
		 */
		coefficients[0] += sun_aberration_variation_constant;

		// Daily variation, in arcseconds, of the geocentric longitude
		// of the Sun in a fixed reference frame
		var Δλ = polynomial_value(coefficients, τ),
		//
		aberration = -AU_LIGHT_TIME / DEGREES_TO_ARCSECONDS * R * Δλ;

		if (library_namespace.is_debug(3))
			library_namespace.debug('aberration of radius vector ' + R
					+ ', JD: ' + TT_JD + ': ' + format_degrees(aberration)
					+ '. low-precision method: '
					+ format_degrees(sun_aberration_low(R)), 0);

		return aberration;
	}

	var sun_aberration = sun_aberration_high;

	// ------------------------------------------------------------------------------------------------------//
	// precession 歲差

	/**
	 * calculate general precession / precession of the ecliptic
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * Kai Tang (2015). A long time span relativistic precession model of the
	 * Earth.
	 * 
	 * IAU 2006年將主要的部分重新命名為赤道歲差，而較微弱的成份命名為黃道歲差 (precession of the
	 * ecliptic)，但是兩者的合稱仍是綜合歲差 (general precession)，取代了分點歲差。
	 * 
	 * <q>在J2000.0的时候与P03岁差差大概几个角秒，主要由于周期拟合的时候，很难保证长期与短期同时精度很高。</q>
	 * 
	 * @param {Number}TT_JD
	 *            Julian date (JD of 天文計算用時間 TT)
	 * @param {Boolean}ecliptic
	 *            true: get precession of the ecliptic (黃道歲差). else: general
	 *            precession
	 * 
	 * @returns {Array} [ P, Q ] in degrees
	 */
	function precession(TT_JD, ecliptic) {
		/**
		 * Julian centuries since J2000.0.<br />
		 * J2000.0 起算的儒略世紀數.
		 * 
		 * @type {Number}
		 */
		var T = Julian_century(TT_JD),
		//
		terms = ecliptic ? 唐凯_ecliptic_precession_terms : 唐凯_precession_terms,
		//
		p_A = polynomial_value(terms.init[0], T),
		//
		ε_A = polynomial_value(terms.init[1], T);

		terms.forEach(function(term) {
			var p = term[4] * T;
			p_A += term[0] * Math.cos(p) + term[1] * Math.sin(p);
			if (term[2])
				ε_A += term[2] * Math.cos(p) + term[3] * Math.sin(p);
		});

		return [ p_A / DEGREES_TO_ARCSECONDS, ε_A / DEGREES_TO_ARCSECONDS ];
	}

	_.precession = precession;

	// ------------------------------------------------------------------------------------------------------//
	// nutation 章動

	/**
	 * IAU 2000B model nutation (地球章動) 修正值。
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * Nutation, IAU 2000B model.
	 * https://github.com/kanasimi/IAU-SOFA/blob/master/src/nut00b.c
	 * 
	 * @param {Number}TT_JD
	 *            Julian date (JD of 天文計算用時間 TT)
	 * @param {Boolean}Δψ_only
	 *            only get 黃經章動Δψ
	 * 
	 * @returns {Array} [ 黃經章動Δψ, 黃赤交角章動Δε ] (in radians)
	 * 
	 * @see http://www.neoprogrammics.com/nutations/nutations_1980_2000b/index.php
	 */
	function IAU2000B_nutation(TT_JD, Δψ_only) {
		/**
		 * Julian centuries since J2000.0.<br />
		 * J2000.0 起算的儒略世紀數.
		 * 
		 * @type {Number}
		 */
		var T = Julian_century(TT_JD),
		//
		parameters = [], Δψ = 0, Δε = 0;
		IAU2000B_nutation_parameters.forEach(function(parameter) {
			parameters.push((polynomial_value(parameter, T)
			//
			% TURN_TO_ARCSECONDS) * ARCSECONDS_TO_RADIANS);
		});

		library_namespace.debug('Julian centuries since J2000.0: ' + T, 4);

		for (var term,
		// Summation of luni-solar nutation series
		// (smallest terms first).
		index = IAU2000B_nutation_terms.length; index > 0;) {
			term = IAU2000B_nutation_terms[--index];
			var argument = 0;
			// 5: length of parameters
			for (var i = 0; i < 5; i++)
				// term[i] 常為0
				argument += term[i] * parameters[i];

			var _sin = Math.sin(argument), _cos = Math.cos(argument);
			Δψ += (term[5] + term[6] * T) * _sin + term[7] * _cos;
			if (!Δψ_only)
				Δε += (term[8] + term[9] * T) * _cos + term[10] * _sin;
		}

		// Convert from 0.1 microarcsec units to radians.
		i = ARCSECONDS_TO_RADIANS / 1e7;
		// Fixed offsets in lieu of planetary terms
		Δψ = Δψ * i + IAU2000B_nutation_offset_Δψ;
		if (!Δψ_only)
			Δε = Δε * i + IAU2000B_nutation_offset_Δε;

		library_namespace
				.debug(
				//
				'IAU2000B nutation 章動修正值 of JD' + TT_JD + ' ('
						+ library_namespace.JD_to_Date(TT_JD).format('CE')
						+ '): ' + Δψ / DEGREES_TO_RADIANS + '°, ' + Δε
						/ DEGREES_TO_RADIANS + '°', 3);
		return Δψ_only ? Δψ : [ Δψ, Δε ];
	}

	/**
	 * IAU 1980 model nutation (地球章動) 修正值。
	 * 
	 * @param {Number}TT_JD
	 *            Julian date (JD of 天文計算用時間 TT)
	 * @param {Boolean}Δψ_only
	 *            only get 黃經章動Δψ
	 * 
	 * @returns {Array} [ 黃經章動Δψ, 黃赤交角章動Δε ] (radians)
	 */
	function IAU1980_nutation(TT_JD, Δψ_only) {
		/**
		 * Julian centuries since J2000.0.<br />
		 * J2000.0 起算的儒略世紀數.
		 * 
		 * @type {Number}
		 */
		var T = Julian_century(TT_JD),
		//
		parameters = [], Δψ = 0, Δε = 0;
		IAU1980_nutation_parameters.forEach(function(parameter) {
			parameters.push((polynomial_value(parameter, T)
			//
			% TURN_TO_DEGREES) * DEGREES_TO_RADIANS);
		});

		// IAU1980_nutation_terms[6,8] 有乘以十倍了。
		T /= 10;

		IAU1980_nutation_terms.forEach(function(term) {
			var c, argument = 0, i = 0;
			// 5: parameters.length
			for (; i < 5; i++)
				// 正弦(計算Δψ用sine)的角度參數及餘弦(計算Δε用cosine)的角度參數是D、M、M'、F、Ω這5個基本參數的線性組合。
				// c常為0
				if (c = term[i])
					argument += c * parameters[i];

			Δψ += (term[5] + term[6] * T) * Math.sin(argument);
			if (!Δψ_only && (c = term[7] + term[8] * T))
				Δε += c * Math.cos(argument);
		});

		// 表中的係數的單位是0″.0001。
		T = ARCSECONDS_TO_RADIANS / 1e4;
		return Δψ_only ? Δψ * T : [ Δψ * T, Δε * T ];
	}

	var nutation = IAU2000B_nutation;
	_.nutation = nutation;

	// ------------------------------------------------------------------------------------------------------//
	// VSOP87 planets model

	/**
	 * 座標變換: 轉換動力學Date平黃道座標(Bretagnon的VSOP定義的)到 FK5 (第5基本星表, The Fifth
	 * Fundamental Catalogue) 坐標系統。<br />
	 * VSOP87 → FK5: translate VSOP87 coordinates to the FK5 frame.<br />
	 * 注意:會改變 coordinates!
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版<br />
	 * p. 219. formula 32.3
	 * 
	 * 太陽黃經☉及黃緯β是P.Bretagnon的VSOP行星理論定義的動力學黃道坐標。這個參考系與標準的FK5坐標系統(詳見20章)僅存在很小的差別。
	 * 可按以下方法把☉、β轉換到FK5坐標系統中,其中T是J2000起算的儒略世紀數,或T=10τ。
	 * J2000.0的VSOP黃道與J2000.0的FK5黃道存在一個很小的夾角 E = 0″.0554 左右，所以作以上修正。
	 * 
	 * @param {Object}coordinates {
	 *            L: mean dynamical ecliptical longitude in radians (弧度),<br />
	 *            B: mean dynamical the ecliptical latitude in radians (弧度) }
	 * @param {Number}τ
	 *            儒略千年數 Julian millennia since J2000.0.
	 * 
	 * @returns {Object}FK5 coordinates
	 * 
	 * @see http://www.astrosurf.com/jephem/astro/ephemeris/et520transfo_en.htm
	 */
	function dynamical_to_FK5(coordinates, τ) {
		// 先計算 L′ = L - 1°.397*T - 0°.00031*T²
		var _L = polynomial_value([ coordinates.L, -1.397 * DEGREES_TO_RADIANS,
				-0.00031 * DEGREES_TO_RADIANS ], 10 * τ),
		// cache
		cos_L = Math.cos(_L), sin_L = Math.sin(_L),
		// 然後計算L和B的修正值：
		ΔL = 0.03916 * ARCSECONDS_TO_RADIANS * (cos_L + sin_L)
				* Math.tan(coordinates.B) - 0.09033 * ARCSECONDS_TO_RADIANS;
		if (library_namespace.is_debug(3))
			library_namespace.debug('FK5 correction of object.L @ ' + τ + ' ≈ '
					+ coordinates.L + ' + '
					+ format_degrees(ΔL / DEGREES_TO_RADIANS));
		coordinates.L += ΔL;

		var ΔB = 0.03916 * ARCSECONDS_TO_RADIANS * (cos_L - sin_L);
		if (library_namespace.is_debug(3))
			library_namespace.debug('FK5 correction of object.B @ ' + τ + ' ≈ '
					+ coordinates.B + ' + '
					+ format_degrees(ΔB / DEGREES_TO_RADIANS));
		coordinates.B += ΔB;

		return coordinates;
	}

	/**
	 * 無用:因為 items[1,2] 已經是弧度。
	 * 
	 * @deprecated
	 */
	function initialize_VSOP87(subterms) {
		if (subterms.init)
			// 另一 thread 正初始化中。
			return;
		subterms.init = true;

		subterms.forEach(function(series) {
			series.forEach(function(items) {
				items[1] *= DEGREES_TO_RADIANS;
				items[2] *= DEGREES_TO_RADIANS;
			});
		});

		subterms.initialized = true;
		delete subterms.init;
	}

	/**
	 * terms for VSOP87 planets model used in function VSOP87()
	 * 
	 * full data:<br />
	 * ftp://ftp.imcce.fr/pub/ephem/planets/vsop87/README
	 * ftp://ftp.imcce.fr/pub/ephem/planets/vsop87/VSOP87D.ear
	 * 
	 * 金文敬. 2015. 太阳系行星和月球历表的发展.<br />
	 * 球坐標相對於瞬時平黃道和春分點為 VSOP87D 解。
	 * 
	 * TODO: VSOP2013, DE-431
	 * 
	 * see also:<br />
	 * JPL DE422:<br />
	 * http://ssd.jpl.nasa.gov/?ephemerides
	 * ftp://ssd.jpl.nasa.gov/pub/eph/planets/ascii/de422/
	 * 
	 * @inner
	 */
	var VSOP87_terms = Object.create(null);

	/**
	 * VSOP87 天體/行星的日心座標位置 (Heliocentric ecliptic spherical coordinates) 計算。<br />
	 * 得到行星在FK5坐標系統中的日心黃經L、黃緯B。<br />
	 * <br />
	 * does not include nutation or aberration.
	 * 
	 * 依 vsop87.doc 的說法，VSOP87D 已 apply precision:<br />
	 * ftp://ftp.imcce.fr/pub/ephem/planets/vsop87/vsop87.doc<br />
	 * The coordinates of the versions C and D are given in the frame defined by
	 * the mean equinox and ecliptic of the date. This frame is deduced from the
	 * previous one by precessional moving between J2000 and the epoch of the
	 * date.
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版<br />
	 * chapter 太陽位置計算.
	 * 
	 * @param {Number}TT_JD
	 *            Julian date (JD of 天文計算用時間 TT)
	 * @param {String}object
	 *            天體 (planets 行星).
	 * @param {Object}[options]
	 *            附加參數/設定特殊功能與選項:<br />
	 *            {String|Array}options.terms: request terms.<br />
	 *            L: 日心黃經 the ecliptical longitude in radians (弧度) 真黃經，不是軌道經度,
	 *            NOT the orbital longitude<br />
	 *            B: 日心黃緯 the ecliptical latitude in radians (弧度)<br />
	 *            R: 行星到太陽的距離 the radius vector (distance to the Sun) in AU
	 *            (Astronomical Units)<br />
	 *            <br />
	 *            {Boolean}options.FK5: translate VSOP87 coordinates to the FK5
	 *            frame. default: true<br />
	 *            <br />
	 *            {Boolean}options.degrees: translate radians to degrees.
	 * 
	 * @returns {Object}FK5 coordinates { L:longitude in radians, B:latitude in
	 *          radians, R:distance in AU }
	 */
	function VSOP87(TT_JD, object, options) {
		/**
		 * Julian millennia since J2000.0.<br />
		 * J2000.0 起算的儒略千年數.
		 * 
		 * @type {Number}
		 */
		var τ = Julian_century(TT_JD) / 10,
		//
		coordinates = Object.create(null),
		//
		object_terms = VSOP87_terms[VSOP87.object_name(object)];
		if (!object_terms)
			throw new Error('VSOP87: Invalid object [' + object + ']');

		// 前置處理。
		if (!library_namespace.is_Object(options))
			options = Object.create(null);

		var terms = options.terms;
		if (!terms)
			terms = 'LBR'.split('');
		else {
			if (!Array.isArray(terms))
				terms = [ terms ];
			if (options.FK5 !== false
					&& (terms.includes('L') || terms.includes('R'))) {
				if (!terms.includes('L'))
					terms.push('L');
				if (!terms.includes('B'))
					terms.push('B');
			}
		}

		terms.forEach(function(term_name) {
			var coefficients = [], subterms = object_terms[term_name];
			if (!subterms) {
				library_namespace.error('VSOP87: Invalid term name: ['
						+ term_name + ']');
				return;
			}

			// 無用:因為 items[1,2] 已經是弧度。
			if (false && !subterms.initialized) {
				initialize_VSOP87(subterms);
			}

			// series: 序列 L0,L1,..,B0,B1,..,R0,R1,..
			subterms.forEach(function(series) {
				coefficients.push(series.reduce(function(value, items) {
					if (false && items.length === 1)
						return value + items[0];
					// assert:
					// items.length
					// ===
					// 3
					return value + items[0] * Math.cos(
					// items:
					// 三個數字項
					// [A,B,C]
					// 每項(表中各行)的值計算表達式是：
					// A*cos(B+C*τ);
					items[1] + items[2] * τ);
				}, 0));
			});

			coordinates[term_name] =
			// L=(L0+L1*τ+L2*τ²+L3*τ³+L4*τ⁴+L5*τ⁵)/10⁸
			// (倍數: 10⁻⁸)
			polynomial_value(coefficients, τ);
			// 倍數
			if (object_terms.multiplier > 0)
				coordinates[term_name] *= object_terms.multiplier;
			library_namespace.debug(
			//
			object + '.' + term_name + ' @ ' + TT_JD + ' ≈ '
			//
			+ (term_name === 'R' ? coordinates[term_name] + '  AU'
			//
			: format_degrees(normalize_degrees(
			//
			coordinates[term_name] / DEGREES_TO_RADIANS,
			//
			term_name === 'B'))) + ' (coefficients: ' + coefficients.join(', ')
					+ ')', 3);
		});

		if (options.FK5 !== false)
			dynamical_to_FK5(coordinates, τ);

		// 單位轉換。
		if (options.degrees) {
			if (coordinates.L)
				coordinates.L /= DEGREES_TO_RADIANS;
			if (coordinates.B)
				coordinates.B /= DEGREES_TO_RADIANS;
		}

		return terms.length > 1 ? coordinates : coordinates[terms[0]];
	}

	_.VSOP87 = VSOP87;

	/**
	 * 正規化天體/行星名稱。
	 * 
	 * @param {String}object
	 *            天體 (planets 行星).
	 * 
	 * @returns {String|Undefined} 行星名稱
	 */
	VSOP87.object_name = function(object) {
		if (typeof object === 'string')
			return object.trim().toLowerCase();
	};

	/**
	 * 增加指定天體/行星的計算數據，提供給模組內部函數使用。
	 * 
	 * @param {String}object
	 *            天體 (planets 行星).
	 * @param {Array}terms
	 *            計算數據.
	 */
	function VSOP87_add_terms(object, terms) {
		object = VSOP87.object_name(object);
		if (object === solar_terms_object)
			// reset solar_terms_cache
			solar_terms_cache = [];
		VSOP87_terms[object] = terms;
	}

	VSOP87.add_terms = VSOP87_add_terms;

	/**
	 * 載入指定天體/行星的計算數據後，執行 callback。提供給模組外部函數使用。
	 * 
	 * @param {String|Array}object
	 *            天體 (planets 行星).
	 * @param {Function}callback
	 *            callback function.
	 */
	function VSOP87_load_terms(object, callback) {
		if (!object)
			return callback(succeed);

		var paths = [], objects = [];
		if (!Array.isArray(object))
			object = [ object ];
		object.forEach(function(o, index) {
			o = VSOP87.object_name(o);
			if (!(o in VSOP87_terms)) {
				objects.push(o);
				paths.push(library_namespace.get_module_path(
				//
				module_name + library_namespace.env.path_separator + 'VSOP87_'
						+ o));
			}
		});
		library_namespace.run(paths, function() {
			var failed = [];
			objects.forEach(function(o, index) {
				if (!VSOP87_terms[o])
					failed.push(o);
			});
			if (failed.length === 0)
				failed = undefined;
			library_namespace.info(
			//
			'VSOP87_load_terms: ' + (failed
			//
			? 'Failed to load [' + failed + ']'
			// resources
			: 'resource files of [' + objects + '] loaded.'));
			if (typeof callback === 'function')
				callback(failed);
		});
	}

	VSOP87.load_terms = VSOP87_load_terms;

	/**
	 * 轉換 VSOP87 file @ node.js。
	 * 
	 * TODO: parse VSOP87 file
	 * 
	 * @param {String}file_name
	 *            source file name
	 * @param {Object}[options]
	 *            附加參數/設定特殊功能與選項
	 * 
	 * @since 2015/4/15 ‏‎17:46:12, 2015/4/18 21:36:12
	 */
	function convert_VSOP87_file(file_name, options) {
		// 前置處理。
		if (!library_namespace.is_Object(options))
			options = Object.create(null);

		var encoding = options.encoding || 'ascii',
		// 需要先設定 fs = require('fs');
		// https://nodejs.org/api/fs.html
		fs = require('fs');

		fs.readFile(file_name, {
			encoding : encoding
		}, function(error, data) {
			if (error)
				throw error;

			// parse VSOP87 file.
			data = data.split(/\n/);

			var object, type, group,
			//
			terms = Object.create(null);

			data.forEach(function(line) {
				if (!line)
					return;
				var fields = line.trim().split(/\s+/);
				if (isNaN(fields[0])) {
					if (!object)
						// e.g., 'earth'
						object = fields[3].toLowerCase();
					// e.g., 'L', 'B',
					// 'R'.
					var t = fields[6][fields[5]];
					group = [];
					if (t === type)
						terms[type].push(group);
					else
						terms[type = t] = [ group ];

					console.log(object + ' ' + type + ' ' + fields[7] + ' '
							+ fields[8] + ' terms');
					return;
				}

				if (false && terms[type].length === 1 && group.length === 0)
					console.log(fields);
				fields = fields.slice(-3);
				fields.forEach(function(f, index) {
					fields[index] = +f;
				});

				// check
				if (false && fields.length !== 3)
					throw fields;
				if (!options.limit || group < options.limit)
					group.push(fields);
			});

			var new_line = '\n', prefix = '// auto-generated from '
			//
			+ (options.name || 'VSOP87')
			// e.g., 'D' for VSOP87D.
			+ (options.type || '') + new_line + library_namespace.Class + '.'
					+ (options.name || 'VSOP87') + '.add_terms(',
			//
			postfix = options.postfix || new_line + ');';
			fs.writeFile(options.name + '_' + object + '.js', prefix
					+ JSON.stringify(object)
					+ ','
					+ new_line
					+ JSON.stringify(terms)
							.replace(/(\]\],)/g, '$1' + new_line) + postfix, {
				encoding : encoding
			});

		});
	}

	VSOP87.convert = convert_VSOP87_file;

	// ------------------------------------------------------------------------------------------------------//
	// 天體/行星位置計算

	/**
	 * planet / Astronomical objects or celestial objects<br />
	 * Warning: terms of object and Earth should loaded first.
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版<br />
	 * p. 225. Example 33.a with full VSOP87
	 * 
	 * @param {Number}TT_JD
	 *            Julian date (JD of 天文計算用時間 TT)
	 * @param {String}object
	 *            天體 (planets 行星).
	 * @param {Object}[options]
	 *            附加參數/設定特殊功能與選項
	 * 
	 * @returns {Object}coordinates
	 */
	function object_coordinates(TT_JD, object, options) {
		// 前置處理。
		if (!options && library_namespace.is_Object(object) && object.object)
			object = (options = object).object;
		else if (!library_namespace.is_Object(options))
			options = Object.create(null);

		var τ0, τ = 0, rectangular, object_heliocentric,
		//
		coordinates = Object.create(null),
		// light-time error in days
		error = options.error || 1e-6;

		// corrected for the light-time and the aberration together at
		// once
		// 一次性修正光行時及光行差。
		do {
			// assert: terms of object and Earth are loaded.
			// JD時的天體/行星日心瞬時黃道座標。
			object_heliocentric = VSOP87(TT_JD - τ, object, {
				FK5 : false
			});
			// JD時的地球日心黃道座標。
			var earth_heliocentric = VSOP87(TT_JD - τ, solar_terms_object, {
				FK5 : false
			}),
			// planet's distance to the Earth, 行星到地球的距離.
			Δ = (rectangular = spherical_to_rectangular(object_heliocentric, {
				base : earth_heliocentric,
				distance : true
			})).distance;
			if (τ === 0) {
				// real distance at TT_JD in AU
				coordinates.Δ0 = Δ;
				// D日心瞬時黃道
				// heliocentric dynamical ecliptic coordinate system
				// @see function Coordinates()
				coordinates.D = object_heliocentric;
			}
			τ0 = τ;
			// effect of light-time, 光線從行星到達地球所需的時間.
			τ = AU_LIGHT_TIME * Δ;

			library_namespace.debug('τ-τ0 = ' + Math.abs(τ - τ0));
		} while (Math.abs(τ - τ0) > error);

		// apparent distance at TT_JD in AU
		coordinates.Δ = Δ;

		// S日心視黃道 heliocentric ecliptic coordinate system
		// @see function Coordinates()
		coordinates.S = object_heliocentric;

		// rectangular: 該天體的地心直角黃道座標
		// → geocentric: 該天體的地心黃道座標(球座標)
		var geocentric = rectangular_to_spherical(rectangular);

		// corrections for reduction to the FKS system
		/**
		 * Julian millennia since J2000.0.<br />
		 * J2000.0 起算的儒略千年數.
		 * 
		 * @type {Number}
		 */
		τ = Julian_century(TT_JD) / 10;
		// replacing L by λ, and B by β.
		geocentric = dynamical_to_FK5({
			L : geocentric[0],
			B : geocentric[1]
		}, τ);

		// 修正地球章動 nutation。
		τ = nutation(TT_JD);
		// G地心視黃道 apparent geocentric ecliptic coordinates:
		// longitude λ and latitude β in radians
		coordinates.λ = geocentric.L + τ[0];
		coordinates.β = geocentric.B + τ[1];

		get_horizontal(coordinates, TT_JD, options);

		// 單位轉換。
		if (options.degrees) {
			coordinates.λ /= DEGREES_TO_RADIANS;
			coordinates.β /= DEGREES_TO_RADIANS;
		}

		return coordinates;
	}

	_.object_coordinates = object_coordinates;

	// ------------------------------------------------------------------------------------------------------//
	// solar coordinates 太陽位置(坐標) & 二十四節氣 (solar terms)

	/**
	 * 低精度分點和至點的時刻, 太陽視黃經λ為0°或90°或180°或270°. 在 1951–2050 CE 的誤差 < 1分.
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版<br />
	 * chapter 分點和至點.<br />
	 * 
	 * @param {Integer}year
	 *            年
	 * @param {Integer}index
	 *            0–3: [ 3月春分 0°, 6月夏至 90°, 9月秋分 180°, 12月冬至 270° ]<br />
	 *            aka. [ March equinox, June solstice, September equinox,
	 *            December solstice ]
	 * 
	 * @returns {Number} Julian date (JD of 天文計算用時間 TT)
	 */
	function equinox(year, index, no_fix) {
		// year is an integer; other values for year, would give
		// meaningless results!
		var TT_JD = (year |= 0) < 1000 ? equinox_terms_before_1000
				: equinox_terms_after_1000;
		// 計算相應的"平"分點或"平"至點的時刻。
		TT_JD = polynomial_value(TT_JD[index |= 0], (year < 1000 ? year
				: year - 2000) / 1000);

		if (no_fix)
			// get 太陽分點和至點"平"黃經。
			return TT_JD;

		/**
		 * Julian centuries since J2000.0.<br />
		 * J2000.0 起算的儒略世紀數.
		 * 
		 * @type {Number}
		 */
		var T = Julian_century(TT_JD),
		//
		W = (35999.373 * T - 2.47) * DEGREES_TO_RADIANS,

		// 太陽平黃經→太陽視黃經
		// 要計算的分點或至點時刻(儒略曆書時,即力學時）表達為：
		λ = TT_JD + 0.00001 *
		// JDE0 + 0.00001 S / Δλ 日
		equinox_periodic_terms.reduce(function(S, terms) {
			return S + terms[0] * Math.cos(terms[1] + terms[2] * T);
		}, 0) /
		// Δλ
		(1 + 0.0334 * Math.cos(W) + 0.0007 * Math.cos(2 * W));

		// λ: 太陽黃經☉是Date黃道分點座標(瞬時黃道/當日黃道?)的真幾何黃經。
		// 要取得視黃經λ，還應加上精準的黃經章動及光行差。
		// TODO: 黃經周年光行差修正量：-20″.161 (公式(24.10)), 黃經章動效果：Δψ =
		// -12″.965
		// (詳見第22章), 轉到 FK5 系統的修正值(-0″.09033) (公式(24.9))
		// 光行差 aberration
		// 章動 nutation

		// ΔT(year, month)
		λ -= ΔT(year, index * 3 + 3.5) / ONE_DAY_SECONDS;

		return λ;
	}

	_.equinox = equinox;

	/**
	 * solar coordinates 太陽位置(坐標)計算。<br />
	 * ObsEcLon (Observer ecliptic lon. & lat.) or PAB-LON (PHASE angle &
	 * bisector) @ HORIZONS?
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版<br />
	 * p. 166–169. Example 25.b
	 * 
	 * @param {Number}TT_JD
	 *            Julian date (JD of 天文計算用時間 TT)
	 * @param {Object}[options]
	 *            附加參數/設定特殊功能與選項:<br />
	 *            {Boolean}options.degrees: translate radians to degrees.<br />
	 *            {Boolean}options.km: translate AU to km.<br />
	 * 
	 * @returns {Object}coordinates { apparent:太陽視黃經(度), λ:地心黃經(radians),
	 *          β:地心黃緯β(radians), Δ:日地距離(AU), L:黃經 longitude(radians), B:黃緯
	 *          latitude(radians), R:距離 radius vector(AU) }
	 */
	function solar_coordinates(TT_JD, options) {
		// 前置處理。
		if (!library_namespace.is_Object(options))
			options = Object.create(null);

		// heliocentric coordinates. 計算日心黃道坐標中地球的位置。
		var coordinates = VSOP87(TT_JD, solar_terms_object);

		// 日心黃道坐標中地球的位置 → 地心黃道坐標中太陽的位置
		// 弧度單位日心黃經L → 地心黃經(geocentric longitude)λ(度)
		// Jean Meeus 文中以 "☉" 表示此處之 λ。
		var λ = coordinates.L + TURN_TO_RADIANS / 2,
		// 弧度單位日心黃緯B → 地心黃緯β(度)
		β = -coordinates.B;

		// 太陽的視黃經 (apparent longitude)λ(度)（受光行差及章動影響）
		// Jean Meeus 文中以 "λ" 表示此處之視黃經 apparent。
		//
		// https://en.wikipedia.org/wiki/Apparent_longitude
		// Apparent longitude is used in the definition of
		// equinox and solstice.
		// 節氣以太陽視黃經為準。
		// ** 問題:但中國古代至點以日長為準。兩者或可能產生出入？
		var apparent = λ / DEGREES_TO_RADIANS
		// 修正太陽光行差 aberration。
		+ sun_aberration(coordinates.R, TT_JD)
		// 修正地球章動 nutation。
		+ nutation(TT_JD, true) / DEGREES_TO_RADIANS;

		// https://en.wikipedia.org/wiki/Ecliptic_coordinate_system#Spherical_coordinates
		Object.assign(coordinates, {
			// geocentric
			λ : normalize_radians(λ),
			β : normalize_radians(β, true),
			Δ : coordinates.R,

			// apparent longitude
			apparent : normalize_degrees(apparent)
		// TODO: apparent latitude
		});

		get_horizontal(coordinates, TT_JD, options);

		// 單位轉換。
		if (options.degrees) {
			coordinates.λ /= DEGREES_TO_RADIANS;
			coordinates.β /= DEGREES_TO_RADIANS;
			coordinates.L /= DEGREES_TO_RADIANS;
			coordinates.B /= DEGREES_TO_RADIANS;
		}
		if (options.km) {
			// 1000: 1 km = 1000 m
			coordinates.Δ *= AU_TO_METERS / 1000;
			coordinates.R *= AU_TO_METERS / 1000;
		}

		return coordinates;
	}

	_.solar_coordinates = solar_coordinates;

	/**
	 * 取得指定年分 year 年，指定太陽視黃經角度之 Julian date。
	 * 
	 * @param {Integer}year
	 *            year 年(CE)
	 * @param {Number}degrees
	 *            0–less than 360.<br />
	 *            angle in degrees from March equinox of the year.<br />
	 *            指定太陽視黃經角度，自當年黃經0度(春分)開始。
	 * 
	 * @returns {Number} Julian date (JD of 日常生活時間 UT)
	 */
	function JD_of_solar_angle(year, degrees) {
		var offset, apparent,
		// index: 下界 index of 分點和至點, 0–3
		index = degrees / EQUINOX_SOLSTICE_DEGREES | 0,
		// JD 近似值(下界)。
		TT_JD = equinox(year, index, true);
		// 經測試，有時每天太陽的視黃經 (apparent longitude) 可能會增加近 .95°
		// NOT 360/365.25

		// 太陽的視黃經最大變化量。
		// http://jpkc.haie.edu.cn/jpkc/dqgl/content.asp?classid=17&id=528
		// 在遠日點，地球公轉慢，太陽每日黃經差Δλ也慢，為57′
		// 在近日點，地球公轉快，太陽每日黃經差Δλ也快，為61′

		if (degrees % EQUINOX_SOLSTICE_DEGREES > 0)
			TT_JD += ((index === 3 ? equinox(year + 1, 0) : equinox(year,
					index + 1)) - TT_JD)
					// 以內插法(線性插值)取得近似值。
					* (degrees - index * EQUINOX_SOLSTICE_DEGREES)
					/ EQUINOX_SOLSTICE_DEGREES;

		// 最多趨近 JD_of_solar_angle.max_calculations 次。
		for (index = JD_of_solar_angle.max_calculations; index-- > 0;) {
			// apparent in degrees.
			apparent = solar_coordinates(TT_JD).apparent;
			// 由公式(26.1)得到對“大約時間”的修正量。
			// +58 sin (k·90° - λ) (26.1)
			offset = 58 * Math.sin((degrees - apparent) * DEGREES_TO_RADIANS);
			// ↑ 58: maybe 59 = 360/365.25*60 ??
			// https://www.ptt.cc/bbs/sky/M.1175584311.A.8B8.html

			if (false)
				library_namespace.debug('index ' + index + ': apparent: '
						+ format_degrees(apparent) + ', offset in days: '
						+ offset);

			if (Math.abs(offset) < JD_of_solar_angle.error)
				// 當 error 設定得很小時，似乎會達到固定循環。
				break;
			// adapt 修正量。
			TT_JD += offset;
		}

		// apply ΔT: TT → UT.
		return UT_of(TT_JD);
	}

	/**
	 * 最多計算(趨近) (JD_of_solar_angle.max_calculations) 次。
	 * 
	 * @type Integer > 0
	 */
	JD_of_solar_angle.max_calculations = 20 | 0;

	/**
	 * 可接受之最大誤差。<br />
	 * 即使設為 0，最多也只會計算 (JD_of_solar_angle.max_calculations) 次。<br />
	 * 當 error 設定得很小時，似乎會達到固定循環。因此此值不應該設為 0，否則以所採用方法將不會收斂。
	 * 
	 * @type Number > 0
	 */
	JD_of_solar_angle.error = 2e-10;

	_.JD_of_solar_angle = JD_of_solar_angle;

	/**
	 * 定氣：取得指定年分 year 年，指定節氣/分點和至點之 Julian date。
	 * 
	 * from http://ssd.jpl.nasa.gov/horizons.cgi#results<br />
	 * DE-0431LE-0431 GEOCENTRIC<br />
	 * Date__(UT)__HR:MN:SC.fff CT-UT ObsEcLon ObsEcLat<br />
	 * 0001-Mar-22 21:45:35.500 10518.071036 359.9999962 -0.0001845<br />
	 * 0001-Mar-22 21:45:36.000 10518.071036 0.0000018 -0.0001845<br />
	 * <br />
	 * 2015-Mar-20 22:45:10.000 67.185603 359.9999944 0.0000095<br />
	 * 2015-Mar-20 22:45:10.500 67.185603 0.0000001 0.0000095
	 * 
	 * 注意: 1979/1/20 (中曆1978年12月22日) is 大寒 (300°), not 實曆 1979/1/21 (according
	 * to 中央氣象局 http://www.cwb.gov.tw/V7/astronomy/cdata/calpdf/calpdf.htm,
	 * 中国科学院紫金山天文台 公农历查询 http://almanac.pmo.ac.cn/cx/gzn/index.htm and 香港天文台
	 * http://www.weather.gov.hk/gts/time/conversionc.htm ). According to
	 * HORIZONS (DE-431), it seems at about 1979/1/20 23:59:55.55.
	 * 
	 * @param {Integer}year
	 *            year 年(CE)
	 * @param {Number|String}index
	 *            index. 0: 春分
	 * @param {Number}[type]
	 *            1: 分點和至點, others (default): 二十四節氣，<br />
	 *            皆自當年黃經0度(春分)開始。
	 * 
	 * @returns {Number} Julian date (JD of 日常生活時間 UT)
	 * 
	 * @see http://blog.csdn.net/orbit/article/details/7910220
	 */
	function solar_term_JD(year, index, type) {
		var angle;

		if (typeof index === 'string' && NOT_FOUND !==
		//
		(angle = SOLAR_TERMS_NAME.indexOf(index)))
			index = angle, type = 0;

		if (type === 1) {
			angle = (index | 0) * TURN_TO_DEGREES / EQUINOX_SOLSTICE_COUNT;
		} else {
			if (!index) {
				angle = 0;
			} else if (isNaN(angle = index) && (NOT_FOUND ===
			//
			(angle = SOLAR_TERMS_NAME.indexOf(index)))) {
				library_namespace.error(
				//
				'solar_term_JD: Invalid solar term [' + index + ']!');
				return;
			}
			index = angle;
			angle *= DEGREES_BETWEEN_SOLAR_TERMS;
		}

		// assert:
		// angle is now angle (0–less than 360),
		// from March equinox of year.
		return JD_of_solar_angle(year, angle);
	}

	_.solar_term_JD = solar_term_JD;

	/**
	 * solar_terms 使用之 object name.
	 * 
	 * @type {String}
	 * @inner
	 */
	var solar_terms_object = 'earth',
	/**
	 * cache.
	 * 
	 * solar_terms_cache[ year ] = [ 春分JD, 清明JD, 穀雨JD, ... 24個節氣 ]
	 * 
	 * @type {Array}
	 * @inner
	 */
	solar_terms_cache = [];

	/**
	 * 取得指定 Julian date 之二十四節氣名，或已經過日數、物候(七十二候, 初候/二候/三候, 初候/次候/末候)。
	 * 
	 * TODO: 候應, 二十四番花信風 http://baike.baidu.com/view/54438.htm
	 * 
	 * @param {Number}UT_JD
	 *            Julian date (JD of 日常生活時間 UT)
	 * @param {Object}[options]
	 *            附加參數/設定特殊功能與選項:<br />
	 *            options.days: 回傳 [ 節氣年 year (以"春分"分年, 非立春後才過年!), 節氣序 index,
	 *            已經過日數/剩下幾日 ]。<br />
	 *            options.pentads: 亦標示七十二候 (物候, 72 pentads)<br />
	 *            options.time: 取得節氣名時，亦取得交節時刻。
	 * 
	 * @returns {String|Undefined|Array}
	 * 
	 * @see http://koyomi8.com/24sekki.htm
	 */
	function solar_term_of_JD(UT_JD, options) {

		// return the nearest (test_next: thie next one) solar
		// term JD.
		function get_cache(test_next) {
			if (!date)
				date = library_namespace.JD_to_Date(UT_JD);
			year = date.getFullYear();

			index = apparent / DEGREES_BETWEEN_SOLAR_TERMS | 0;
			if (test_next && ++index === SOLAR_TERMS_COUNT)
				// 本年春分
				index = 0;

			// 17: SOLAR_TERMS_NAME.indexOf('大雪')
			// assert: 大雪以及之前的節氣，都會落在本年度內。
			// 2000 CE 前後千年間，小寒或大寒之前分年。
			else if (index > 17
			// 3: assert: 要算作前一年的節氣，都會在3月前。
			&& date.getMonth() <= 3 - 1)
				// 每一年春分前末幾個節氣，算前一年的。
				year--;

			var cache = solar_terms_cache[year], term_JD;
			if (!cache)
				// 初始化本年度資料。
				solar_terms_cache[year] = cache = [];

			if (!(term_JD = cache[index]))
				// 填入節氣JD
				cache[index] = term_JD = solar_term_JD(year, index);

			return term_JD;
		}

		// 前置處理。
		if (!library_namespace.is_Object(options))
			options = Object.create(null);

		var index, days, date, year,
		// apparent in degrees
		apparent = solar_coordinates(TT_of(UT_JD)).apparent;

		// get days, 回傳已經過幾日。
		if (options.days) {
			// 先取得 距離上一節氣之日數。
			days = get_cache(true) - UT_JD | 0;
			// days === 0: 當天交節。
			if (days !== 0 && options.days !== 'next')
				// 'next': 距離下一節氣之日數。天文節氣 剩餘日數。
				index--, days = Math.ceil(UT_JD - get_cache());
			// others (passed days): 距離上一節氣之日數。天文節氣 經過日數。
			return [ year, index, days ];
		}

		if (DEGREES_BETWEEN_SOLAR_TERMS
		// assert: 超過2度，就不會是在同一天。
		- (apparent % DEGREES_BETWEEN_SOLAR_TERMS) < 2) {
			// UT_JD 再過一下下便是節氣。
			// 測試本日0時是否距離下一節氣發生時間1天內。
			// assert: 此範圍內不可能為物候。
			days = get_cache(true) - UT_JD;

			// UT_JD 將被視為當地時間當日0時!
			if (0 <= days && days < 1) {
				// 初候
				index = SOLAR_TERMS_NAME[index];
				if (options.time) {
					index += ' ' + ((days *= ONE_DAY_HOURS) | 0) + ':';
					// options.time > 1 : add seconds.
					if (options.time > 1)
						index += ((days = (days % 1) * 60) | 0) + ':';
					// index += ((days % 1) * 60).to_fixed(1);
					index += Math.round((days % 1) * 60);
				}
				return index;
			}
			return;
		}

		if (options.pentads
		// UT_JD 將被視為當地時間當日0時，因此只要節氣在 UT_JD 之前，皆表示本日非節氣，僅能測試物候。
		// || (apparent % DEGREES_BETWEEN_SOLAR_TERMS < 2)
		) {
			// days = 與前一個節氣之間距。
			days = UT_JD - get_cache();
			// 七十二候 (物候, 72 pentads)
			// 初候 二候 三候
			// 初候 中候 末候
			// http://koyomi8.com/sub/72kou.htm
			// 5: 又五日
			// 節氣之後每五日一候，非採用 360/72 = 5° 一候。
			if (days <= 5 && 4 < days)
				return SOLAR_TERMS_NAME[index] + ' 二候';
			if (4 + 5 < days && days <= 5 + 5)
				return SOLAR_TERMS_NAME[index] + ' 三候';

			// return;
		}
	}

	_.solar_term_of_JD = solar_term_of_JD;

	// ----------------------------------------------------------------------------------------------------------------------------------------------//
	// 應用功能:輔助以節氣為年首之曆法

	var
	// copy from CeL.data.date.
	/** {Number}一整天的 time 值。should be 24 * 60 * 60 * 1000 = 86400000. */
	ONE_DAY_LENGTH_VALUE = new Date(0, 0, 2) - new Date(0, 0, 1);
	var
	// 小寒(19) 1月5-7日交節，以春分分年的情況，已在下一年。
	solar_term_starts_year = SOLAR_TERMS_NAME.indexOf('小寒'),
	// solar_term_calendar_cache[term index / minute_offset]
	// = { CE year : Date value }
	solar_term_calendar_cache = [];

	/**
	 * 取得 calendar 年首。
	 * 
	 * @param {Integer}CE_year
	 *            CE year
	 * 
	 * @returns {Integer} Date value
	 */
	function solar_term_calendar_year_start(CE_year) {
		var year_start = this.cache[CE_year |= 0];
		if (year_start)
			return year_start;

		year_start = midnight_of(solar_term_JD(
		// 保證 year_start 與 CE_year 在同一年:
		// 小寒(19) 1月5-7日交節，之後應該計算前一年的節氣。
		// 警告:此演算法於小寒不在隔年的情況，將失效。
		this.term_index < solar_term_starts_year ? CE_year : CE_year - 1,
				this.term_index), this.minute_offset, true);

		library_namespace.debug('CE ' + CE_year + ' '
				+ SOLAR_TERMS_NAME[this.term_index] + ' begins on '
				+ year_start.format(), 2);
		return this.cache[CE_year]
		// cache[CE year] = term Date value of year
		= year_start = year_start.getTime();
	}

	/**
	 * Date → [ year, days of year ]
	 * 
	 * @param {Date}date
	 *            指定日期。
	 * 
	 * @returns {Array} [ (CE year), (days counts from the first day) ]
	 */
	function solar_term_calendar_year_of(date) {
		var CE_year = date.getFullYear(),
		//
		month = date.getMonth(), days;

		// (this.month_start) 月之前，位在前一年。
		if (month < this.month_start
		//
		|| (days = date - this.year_starts(CE_year)) < 0)
			days = date - this.year_starts(--CE_year);
		// assert: days >= 0

		// [ CE_year, (days counts from the first day) ]
		return [ CE_year, days / ONE_DAY_LENGTH_VALUE ];
	}

	/**
	 * 輔助以節氣為年首曆法之 handler。
	 * 
	 * handler(year) → start of year
	 * 
	 * handler.year_of(date) → [ year, days]
	 * 
	 * @param {String|Integer}term
	 *            solar term name / index
	 * @param {Integer}[minute_offset]
	 *            indicate the time zone
	 * @param {Object}[options]
	 *            附加參數/設定特殊功能與選項
	 * 
	 * @returns {Function} handler
	 * 
	 * @see solar_term_calendar_year_start(CE_year),
	 *      solar_term_calendar_year_of(date)
	 */
	function solar_term_calendar(term, minute_offset, options) {
		var term_index = typeof term === 'string' ? SOLAR_TERMS_NAME
				.indexOf(term) : term;
		if (!SOLAR_TERMS_NAME[term_index]) {
			library_namespace.error(
			//
			'solar_term_calendar: Invalid term: [' + term + ']');
			return;
		}

		var cache = term_index + '/' + (minute_offset |= 0);
		cache = solar_term_calendar_cache[cache]
		//
		|| (solar_term_calendar_cache[cache]
		//
		= Object.create(null));

		// 不動到原 options。
		options = Object.assign(Object.create(null), options);

		var handler = solar_term_calendar_year_start.bind(options);
		handler.year_of = solar_term_calendar_year_of.bind(options);

		Object.assign(options, {
			term_index : term_index,
			minute_offset : minute_offset,
			cache : cache,
			year_starts : handler,
			month_start : (term_index - solar_term_starts_year)
					.mod(SOLAR_TERMS_NAME.length) / 2 | 0
		});

		return handler;
	}

	_.solar_term_calendar = solar_term_calendar;

	// ----------------------------------------------------------------------------------------------------------------------------------------------//
	// 應用功能:需配合 'data.date'。

	var
	// 起始年月日。年月日 starts form 1.
	// 基本上與程式碼設計合一，僅表示名義，不可更改。
	START_YEAR = 1, START_MONTH = 1, START_DATE = 1,
	// set normal month count of a year.
	// 月數12: 每年有12個月。
	MONTH_COUNT = 12,
	// = 2. assert: 為整數
	SOLAR_TERMS_MONTH_RATE = SOLAR_TERMS_NAME.length / MONTH_COUNT | 0,
	// 21
	立春NO = SOLAR_TERMS_NAME.indexOf('立春') | 0,
	// 立春年_OFFSET = 5
	立春年_OFFSET = (MONTH_COUNT + START_MONTH) * SOLAR_TERMS_MONTH_RATE - 立春NO
			| 0;

	/**
	 * 取得立春年歲首。
	 * 
	 * TODO: 以立春與節氣排曆。計算以節氣(實為十二節)分年月。每年以立春交節時刻為界。<br />
	 * 十二節年月, 節氣年月, 立春年月
	 * 
	 * 立春，指太陽到達黃經315°時，屬相（生肖）以立春作為起始點。 中國古時春節曾專指立春，也被視為一年的開始。
	 * 
	 * @param {Date|Integer}date
	 *            指定年份或日期
	 * @param {Object}[options]
	 *            附加參數/設定特殊功能與選項
	 * 
	 * @returns {Date} 指定年份或日期所在立春年之歲首(立春時刻)
	 */
	function 立春年(date, options) {
		if (!isNaN(date) && -1000 < date && date < 3000) {
			// get JD of CE year (date)
			date = [ date, 1 ];
		}

		if (Array.isArray(date)) {
			// [ CE 立春節氣年, 立春節氣月 ]
			// get JD of CE year (date)
			if ((date[1] = date[1] * SOLAR_TERMS_MONTH_RATE - 立春年_OFFSET) < 0)
				date[1] += SOLAR_TERMS_NAME.length, date[0]--;
			date = solar_term_JD(date[0], date[1]);
			// options: return JD
			return options ? date : library_namespace.JD_to_Date(date);
		}

		if (!library_namespace.is_Date(date))
			return;

		if (options) {
			// options: return [ CE 立春節氣年, 立春節氣月 ]
			date = solar_term_of_JD(
			// 回傳 [ 節氣年 year (以"春分"分年, 非立春後才過年!),
			// 節氣序 index, 已經過日數/剩下幾日 ]。
			library_namespace.Date_to_JD(date), {
				days : true
			});
			date.pop();
			date[1] = (date[1] + 立春年_OFFSET) / SOLAR_TERMS_MONTH_RATE | 0;
			// 月數12: 每年有12個月
			if (date[1] > MONTH_COUNT)
				date[1] -= MONTH_COUNT, date[0]++;
			return date;
		}

		// options: return (CE 立春節氣年)
		var year = date.getFullYear(), month = date.getMonth();
		// 快速判別:立春為公曆每年2月3至5日之間
		if (month !== 1)
			return month < 1 ? year - 1 : year;
		// +1: 當天24時之前交節，依舊得算在當日。
		return library_namespace.Date_to_JD(date) + 1
		// 就算正好等於，本日JD也應該算前一年的。
		<= solar_term_JD(year - 1, 立春NO) ? year - 1 : year;
	}

	// CeL.立春年(2001).format('CE');
	_.立春年 = 立春年;

	// ------------------------------------------------------------------------------------------------------//

	var TYPE_SOLAR = 1, TYPE_LUNAR = 2,
	// 89: Lunar Eclipses Saros Series 7
	MAX_SAROS_SERIES = 89;

	/**
	 * Get the saros series index of JD.
	 * 
	 * @param {Number}TT_JD
	 *            Julian date (JD of 天文計算用時間 TT)
	 * @param {Number}[type]
	 *            type = 1(TYPE_SOLAR): solar, 2(TYPE_LUNAR): lunar
	 * 
	 * @returns {Array} [ type, saros series index, #NO of series ]
	 */
	function saros(TT_JD, type) {
		if (!type)
			return saros(TT_JD, TYPE_SOLAR)
			//
			|| saros(TT_JD, TYPE_LUNAR);

		var data = type === TYPE_SOLAR ? solar_saros_remainder
				: lunar_saros_remainder, series, remainder = TT_JD
				.mod(saros_days),
		// get TT
		index = data[0].search_sorted(remainder, data[1]), NOm1;
		if (!index && remainder < data[0][0])
			// 若是比最小的還小，則當作最後一個。
			index = data[1].at(-1);
		if (index && 0 <=
		// NOm1: #NO - 1
		(NOm1 = Math.round((TT_JD - index[1]) / saros_days))
				&& MAX_SAROS_SERIES > NOm1) {
			var series = [ type, index[0], NOm1 + 1 ],
			// mean TT
			TT = index[1] + NOm1 * saros_days;
			// 2: 別差太多，最起碼應在2天內。
			if (Math.abs(TT_JD - TT) < 2) {
				series.TT = TT;
				return series;
			}
		}
	}

	/**
	 * Get the JD of specified saros series and NO.
	 * 
	 * @param {Natural}type
	 *            type = 1: solar, 2: lunar
	 * @param {Natural}series
	 *            saros series
	 * @param {Natural}[NO]
	 *            NO of saros series
	 * 
	 * @returns {Number}JD (UT) of specified saros series and NO
	 */
	function saros_JD(type, series, NO) {
		series = (type === TYPE_SOLAR
		//
		? solar_saros : lunar_saros)[series];
		if (isNaN(series))
			return;

		// JD: TT
		var JD = series
				+ (0 < NO && NO <= MAX_SAROS_SERIES ? (NO - 1) * saros_days : 0);
		// JD: UT
		JD = library_namespace.Julian_day.to_YMD(UT_of(JD));

		// JD: UT
		JD = lunar_phase([ JD[0], JD[1] ],
		//
		type === TYPE_SOLAR ? 0 : 2);

		// TODO: 此處得到的是朔望時間，而非食甚時間。應進一步處理之。

		return JD;
	}

	saros.JD = saros_JD;
	_.saros = saros;

	// TODO: metonic series
	// https://en.wikipedia.org/wiki/Solar_eclipse_of_March_20,_2015#Metonic_series

	// ------------------------------------------------------------------------------------------------------//
	// LEA-406a, LEA-406b lunar model & periodic terms

	/**
	 * 預設使用 type，'a' or 'b'。
	 * 
	 * a 相當耗資源。當前 HORIZONS 已使用 DE-431 LE-431，與 LEA-406 及 ELP/MPP02 相差不小。何況 a, b
	 * 常僅差不到 10秒，因此似無必要使用 LEA-406a。
	 */
	LEA406.default_type = 'b';

	var LEA406_name = 'LEA-406',
	/**
	 * the mean longitude of the Moon referred to the moving ecliptic and mean
	 * equinox of date (Simon et al. 1994). (formula 9)
	 * 
	 * Simon (1994): "Numerical expressions for precession formulae and mean
	 * elements for the Moon and the planets"
	 * 
	 * (b.3) Mean elements referred to the mean ecliptic and equinox of date
	 * (P_1 = 5028″.8200/cy)
	 * 
	 * But modified: t as 儒略千年數 Julian millennia since J2000.0.
	 * 
	 * LEA406_V_coefficients in arcseconds.
	 * 
	 * @inner
	 */
	LEA406_V_coefficients = [ 218.31664563 * DEGREES_TO_ARCSECONDS,
			17325643723.0470, -527.90, 6.665, -0.5522 ];

	/**
	 * Gets coordinates of lunar (geocentric dynamical ecliptic coordinates).
	 * Using full LEA-406a or LEA-406b model.<br />
	 * 計算月亮位置(地心瞬時黃道坐標)，採用完整的 LEA-406a, LEA-406b。
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * S. M. Kudryavtsev, Long-term harmonic development of lunar ephemeris,
	 * Astronomy & Astrophysics 471 (2007), pp. 1069-1075.
	 * http://www.eas.slu.edu/GGP/kudryavtsev/LEA-406.zip
	 * <q>This is 9–70 times better than the accuracy of the latest analytical theory of lunar motion ELP/MPP02, and the number of terms in the new development is less than that in ELP/MPP02.</q>
	 * 
	 * @param {Number}TT_JD
	 *            Julian date (JD of 天文計算用時間 TT)
	 * @param {Object}[options]
	 *            附加參數/設定特殊功能與選項:<br />
	 *            {Boolean}options.degrees: translate radians to degrees.<br />
	 *            {Boolean}options.km: translate AU to km.<br />
	 *            {String|Array}options.terms: request terms.<br />
	 *            V: 地心黃經 in radians. ecliptic longitude reckoned along the
	 *            moving ecliptic from the mean equinox of date<br />
	 *            U: 地心黃緯 in radians. ecliptic latitude reckoned from the moving
	 *            ecliptic<br />
	 *            R: 地心距離 in AU. geocentric distance<br />
	 * 
	 * @returns {Object} { V:longitude in radians, U:latitude in radians,
	 *          R:distance in AU }
	 * 
	 * @see http://www.gautschy.ch/~rita/archast/ephemeriden.html
	 * @see https://github.com/infinet/lunar-calendar/
	 */
	function LEA406(TT_JD, options) {
		// 前置處理。
		if (!library_namespace.is_Object(options))
			options = typeof options === 'string' ? {
				terms : options
			} : Object.create(null);

		/**
		 * Julian millennia since J2000.0.<br />
		 * J2000.0 起算的儒略千年數.
		 * 
		 * @type {Number}
		 */
		var τ = Julian_century(TT_JD) / 10,
		// τ²
		τ2 = τ * τ, terms = options.terms,
		//
		warn_term = !options.ignore_term,
		/**
		 * spherical coordinates of its centre:
		 * 
		 * r: 地心距離 in AU. (geocentric distance)
		 * 
		 * V: 從曆元平春分點沿移動黃道(瞬時黃道?)的地心黃經 in radians. (ecliptic longitude reckoned
		 * along the moving ecliptic from the mean equinox of date)
		 * 
		 * U: 移動黃道(瞬時黃道?)計算的地心黃緯 in radians. (ecliptic latitude reckoned from
		 * the moving ecliptic)
		 */
		coordinates = Object.create(null);

		library_namespace.debug(
		//
		TT_JD + ': τ: ' + τ + ', τ²: ' + τ2, 3);

		if (!Array.isArray(terms)) {
			if (!terms || typeof terms !== 'string') {
				terms = 'VUR';
				// 有什麼就用什麼。
				warn_term = false;
			}
			terms = terms.split('');
		}

		// Geocentric spherical coordinates of the Moon r, V, U are
		// expanded to Poisson series of the form
		terms.forEach(function(term) {
			var type = options.type || LEA406.default_type,
			//
			subterms = LEA406_terms[term + type];
			if (!subterms) {
				// try another one.
				type = type === 'a' ? 'b' : 'a';
				subterms = LEA406_terms[term + type];
			}
			if (!subterms) {
				if (warn_term)
					library_namespace.error(
					//
					'LEA406: Invalid term name: [' + term
							+ ']. You may need to load it first.');
				return;
			}

			var sum = 0,
			// R (formula 6),
			// V (formula 7), U (formula 8)
			operator = term === 'R' ? Math.cos : Math.sin;

			subterms.forEach(function(T, index) {
				// T = [ coefficients[4 in arcseconds],
				// Amp0,Amp1,Phase1,Amp2,Phase2 ]
				var ω = polynomial_value(T[0], τ);
				// Amp 常為 0
				if (T[1])
					sum += T[1] * operator(ω);
				if (T[2])
					sum += T[2] * operator(ω + T[3]) * τ;
				if (T[4])
					sum += T[4] * operator(ω + T[5]) * τ2;

				if (false && isNaN(sum)) {
					console.error(T);
					throw '內部錯誤 @ index ' + index + ': ' + T;
				}
			});
			library_namespace.debug(
			//
			TT_JD + '.' + term + ': ' + sum, 3);

			// Amp_to_integer: see convert_LEA406()
			sum /= Amp_to_integer;

			if (term === 'V')
				sum += polynomial_value(LEA406_V_coefficients, τ);
			// R is now km. e.g., 384399.
			// V, U is now arcseconds.
			if (term !== 'R')
				// default: V, U in arcseconds → radians
				sum *= ARCSECONDS_TO_RADIANS;
			coordinates[term] = sum;
		});

		/**
		 * 2451545.5-64.183889/86400 ≈ 2451545.499257131
		 * <q>
		{source: DE-0431LE-0431}

		Date__(UT)__HR:MN:SC.fff Date_________JDUT            CT-UT    ObsEcLon    ObsEcLat
		2013-Jun-02 06:33:23.000 2456445.773182870        67.184868 359.9999798   3.8258600
		2013-Jun-02 06:33:23.500 2456445.773188658        67.184868   0.0000545   3.8258553
		</q>
		 * 360-359.9999798=0.0000202
		 * <code>2456445.773182870+(2456445.773188658-2456445.773182870)*202/(202+545)+67.184868/86400</code> ≈
		 * 2456445.7739620376 TT
		 * 
		 * CeL.LEA406.default_type = 'a'; CeL.LEA406.load_terms('Va');
		 * CeL.LEA406.load_terms('Ua'); CeL.LEA406.load_terms('Ra');
		 * <code>CeL.find_root(function(TT){return CeL.normalize_radians(CeL.LEA406(TT).V,true);},2456445,2456446)</code> ≈
		 * 2456445.774202571 TT
		 * 
		 * (.774202571-.7739620376)*86400≈20.78208575999696
		 * 
		 * <code>CeL.find_root(function(TT){return CeL.normalize_radians(CeL.LEA406(TT,{FK5:false}).V,true);},2456445,2456446)</code> ≈
		 * 2456445.7742006825 TT
		 * 
		 * (.7742006825-.7739620376)*86400≈20.618919359992915
		 * 
		 * no FK5 較接近。但仍有誤差 20.6 s
		 */
		if (false && options.FK5 !== false) {
			// τ: tmp
			τ = dynamical_to_FK5({
				L : coordinates.V,
				B : coordinates.U
			}, τ);
			coordinates.V = τ.L;
			coordinates.U = τ.B;
		}

		// 單位轉換。
		if (options.degrees) {
			// V, U in radians → degrees
			if (coordinates.V)
				coordinates.V /= DEGREES_TO_RADIANS;
			if (coordinates.U)
				coordinates.U /= DEGREES_TO_RADIANS;
		}
		// R is now km. e.g., 384399.
		if (!options.km && coordinates.R)
			// default: R in km → AU.
			// 1000: 1 km = 1000 m
			coordinates.R /= AU_TO_METERS / 1000;

		return terms.length === 1
		//
		? coordinates[terms[0]] : coordinates;
	}

	_.LEA406 = LEA406;

	/**
	 * LEA406_terms[Va,Ua,Ra;Vb,Ub,Rb] = {terms}
	 * 
	 * @type {Object}
	 * @inner
	 */
	var LEA406_terms = Object.create(null);

	/**
	 * 增加指定項目的計算數據，提供給模組內部函數使用。
	 * 
	 * @param {String}term_name
	 *            項目名稱 (Va,Ua,Ra;Vb,Ub,Rb).
	 * @param {Array}terms
	 *            計算數據.
	 */
	function LEA406_add_terms(term_name, terms) {
		// 初始化: 將 sin() 之引數全部轉成 radians。
		terms.forEach(function(T) {
			// T = [ coefficients[4 in arcseconds],
			// Amp0,Amp1,Phase1,Amp2,Phase2 ]
			T[0].forEach(function(coefficient, index) {
				T[0][index] *= ARCSECONDS_TO_RADIANS;
			});
			// T[2–5] 可能為了節省大小，而為 undefined!
			var i = 3;
			T[i] = T[i] ? T[i] * ARCSECONDS_TO_RADIANS : 0;
			i = 5;
			T[i] = T[i] ? T[i] * ARCSECONDS_TO_RADIANS : 0;
		});
		// .reverse(): smallest terms first
		LEA406_terms[term_name] = terms.reverse();
	}

	LEA406.add_terms = LEA406_add_terms;

	/**
	 * 載入指定項目的計算數據後，執行 callback。提供給模組外部函數使用。
	 * 
	 * @param {String}term_name
	 *            項目名稱 (V,U,R).
	 * @param {Function}callback
	 *            callback.
	 */
	function LEA406_load_terms(term_name, callback) {
		var type;
		if (term_name.length === 2) {
			type = term_name.charAt(1);
			term_name = term_name.charAt(0);
		} else
			type = LEA406.default_type;
		if ((term_name + type) in LEA406_terms) {
			if (typeof callback === 'function')
				callback();
			return;
		}

		var name = LEA406_name + type + '-' + term_name;
		library_namespace.run(library_namespace.get_module_path(module_name
		//
		+ library_namespace.env.path_separator + name), [ function() {
			library_namespace.info(
			// resources
			'LEA406_load_terms: resource files of [' + name
			//
			+ '] loaded, ' + LEA406_terms[term_name + type].length
			// Poisson series
			+ ' terms.');
		}, callback ]);
	}

	LEA406.load_terms = LEA406_load_terms;

	/**
	 * 確定已經載入那些 terms。
	 * 
	 * @param {String}[term_name]
	 *            項目名稱 (V,U,R).
	 * 
	 * @returns {Array|String} 已載入 terms。
	 */
	function LEA406_loaded(term_name) {
		if (!term_name)
			return Object.keys(LEA406_terms);
		// ab: LEA-406a, LEA-406b
		var terms = [], types = 'ab'.split('');
		types.forEach(function(type) {
			if ((term_name + type) in LEA406_terms)
				terms.push(type);
		});
		return terms.join('');
	}

	LEA406.loaded = LEA406_loaded;

	/**
	 * 轉換 LEA-406 (LEA-406a, LEA-406b) file。
	 * 
	 * need data.native, run @ node.js
	 * 
	 * TODO: parse LEA-406 file
	 * 
	 * @param {String}file_name
	 *            source file name
	 * @param {Object}[options]
	 *            附加參數/設定特殊功能與選項
	 * 
	 * @since 2015/4/20
	 */
	function convert_LEA406(file_name, options) {
		// 前置處理。
		if (!library_namespace.is_Object(options))
			options = Object.create(null);

		var encoding = options.encoding || 'ascii',
		//
		floating = 9,
		// 需要先設定 fs = require('fs');
		// https://nodejs.org/api/fs.html
		fs = require('fs');

		fs.readFile(file_name, {
			encoding : encoding
		}, function(error, data) {
			if (error)
				throw error;

			// parse LEA-406 file.
			data = data.split(/\n/);
			// Lines 1-8 give a short description of the data included
			// to the file.
			data.splice(0, 8);

			var terms = [];

			data
					.forEach(function(line) {
						if (!line)
							return;

						var fields = line.trim().replace(/(\d)-/g, '$1 -')
								.split(/\s+/);
						if (fields.length !== 21 || isNaN(fields[0]))
							throw line;
						var i = 15;
						// 將 Amp 轉整數: Amp *= 1e7
						// (表格中小數7位數)。
						fields[i] = Math.round(fields[i] * Amp_to_integer);
						i++;
						fields[i] = Math.round(fields[i] * Amp_to_integer);
						i++;
						fields[i] = Math.round(fields[i] * Amp_to_integer);
						i++;

						// 轉整數以作無誤差加減。
						fields[i] = Math.round(fields[i] * 1e12);
						i++;
						fields[i] = Math.round(fields[i] * 1e12);
						i++;
						fields[i] = Math.round(fields[i] * 1e12);

						fields[19] -= fields[18];
						fields[20] -= fields[18];

						i = 18;
						// φ: Phase1, Phase2 → in arcseconds
						// φ: Phase 有12位數，*DEGREES_TO_ARCSECONDS 之後最多10位數
						fields[i] = (fields[i]
						// / 1e2 / 1e10 = / 1e12
						* (DEGREES_TO_ARCSECONDS / 1e2) / 1e10).to_fixed(10);
						i++;
						fields[i] = (fields[i]
						//
						* (DEGREES_TO_ARCSECONDS / 1e2) / 1e10).to_fixed(10);
						i++;
						fields[i] = (fields[i]
						//
						* (DEGREES_TO_ARCSECONDS / 1e2) / 1e10).to_fixed(10);

						var coefficients = [ fields[18], 0, 0, 0, 0 ];

						if (false) {
							coefficients.forEach(function(i, index) {
								coefficients[index]
								//
								= new library_namespace.data.math.integer(0);
							});
							coefficients[0]
							//
							= new library_namespace.data.math.integer(
									fields[18]);
							coefficients[0].divide(1e12, 12);
						}

						terms.push([ coefficients,
						// Amp0,Amp1,Phase1,Amp2,Phase2
						fields[15], fields[16], fields[16] ? fields[19] : 0,
								fields[17], fields[17] ? fields[20] : 0 ]);
						i = 1;

						for (var multiplier; i <= 14; i++)
							if (multiplier = +fields[i])
								convert_LEA406_arguments[i]
								//
								.forEach(function(a, index) {
									// a 為整數，coefficients 小數位數最多即為[0]，6位數。
									// coefficients[index]=(coefficients[index]+(a*multiplier).to_fixed(6)).to_fixed(6);
									coefficients[index] += a * multiplier;
									if (false) {
										coefficients[index].add(
										//
										(new library_namespace.data.math
										//
										.integer(a)).multiply(multiplier));
									}
									if (false &&
									//
									!Number.isSafeInteger(coefficients[index]))
										throw 'Out of range from: ' + fields
												+ '\ncoefficients: '
												+ coefficients;
								});
						coefficients.forEach(function(c, index) {
							// coefficients[index]=c*DEGREES_TO_RADIANS;
							// coefficients[index]=c.to_fixed(6);
							coefficients[index] = c.to_fixed();
							// coefficients[index]=coefficients[index].valueOf();
						});
					});

			var name = options.name || LEA406_name,
			//
			new_line = '\n', prefix = '// auto-generated from '
			//
			+ name
			// e.g., 'a' for LEA-406a.
			+ (options.type || '') + new_line + library_namespace.Class + '.'
					+ name.replace(/-/g, '') + '.add_terms(',
			//
			postfix = options.postfix || new_line + ');';
			fs.writeFile(name + (options.type || '') + '-' + options.term
					+ '.js', prefix
					+ JSON.stringify(options.term + (options.type || ''))
					+ ','
					+ new_line
					+ JSON.stringify(terms).replace(/,0/g, ',').replace(
							/,+\]/g, ']').replace(/(\]\],)/g, '$1' + new_line)
					// .replace(/(\],)/g,
					// '$1' +
					// new_line)
					+ postfix, {
				encoding : encoding
			});
		});
	}

	LEA406.convert = convert_LEA406;

	// ------------------------------------------------------------------------------------------------------//
	// lunar coordinates 月亮位置(坐標)

	/**
	 * lunar coordinates, moon's coordinates 月亮位置(地心黃道坐標)計算。<br />
	 * get lunar angle, moon's angle. 僅將 LEA-406 修正地球章動 nutation。
	 * 
	 * @param {Number}TT_JD
	 *            Julian date (JD of 天文計算用時間 TT)
	 * @param {Object}[options]
	 *            附加參數/設定特殊功能與選項:<br />
	 *            {Boolean}options.degrees: translate radians to degrees.<br />
	 *            {Boolean}options.km: translate AU to km.<br />
	 * 
	 * @returns {Object} { V:longitude in radians, U:latitude in radians,
	 *          R:distance in AU }
	 */
	function lunar_coordinates(TT_JD, options) {
		// 前置處理。
		if (!library_namespace.is_Object(options))
			options = Object.create(null);

		var coordinates = LEA406(TT_JD, 'FK5' in options ? {
			FK5 : options.FK5
		} : null);

		if (('V' in coordinates) || ('U' in coordinates)) {
			// var n = nutation(TT_JD);
			if ('V' in coordinates) {
				coordinates.λ = coordinates.V;
				// V, U in radians

				/**
				 * 修正經度 of 月亮光行時間 light-time correction (Moon's
				 * light-time)。忽略對緯度之影響。
				 * 
				 * Reference 資料來源/資料依據:<br />
				 * Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版<br />
				 * p. 337. formula 49.1.<br />
				 * <q>the constant term of the effect of the light-time (-0″.70)</q>
				 * 
				 * -0″.704:
				 * <q>formula in: G.M.Clemence, J.G.Porter, D.H.Sadler (1952): "Aberration in the lunar ephemeris", Astronomical Journal 57(5) (#1198) pp.46..47; but computed with the conventional value of 384400 km for the mean distance which gives a different rounding in the last digit.</q>
				 * http://en.wikipedia.org/wiki/New_moon
				 * 
				 * @see http://blog.csdn.net/orbit/article/details/8223751
				 * @see http://en.wikipedia.org/wiki/Light-time_correction
				 * @see http://lifesci.net/pod/bbs/board.php?bo_table=B07&wr_id=52
				 */
				var light_time = -0.70 * ARCSECONDS_TO_RADIANS;
				if (false)
					(function() {
						/**
						 * 錯誤的方法:
						 * 
						 * @deprecated
						 */
						// coordinates.R in AU.
						var r = coordinates.R * AU_TO_METERS
								|| LUNAR_DISTANCE_M;
						// 地球半徑。
						r -= TERRA_RADIUS_M;
						// 1000: 1 km = 1000 m (CELERITAS in m/s)
						light_time = -r / CELERITAS * TURN_TO_DEGREES
								/ ONE_DAY_SECONDS;
						library_namespace.debug(
						//
						'月亮經度光行差 of JD' + TT_JD + ' ('
						//
						+ library_namespace.JD_to_Date(
						//
						UT_of(TT_JD)).format('CE') + '): '
								+ format_degrees(light_time), 3);
					});
				// 經測試， LEA-406 似已修正月亮光行時、地球章動
				// coordinates.λ += light_time;

				/**
				 * 修正地球章動 nutation: LEA-406 基於 LE406，未包含 nutations, librations。
				 * 
				 * @see http://www.projectpluto.com/jpl_eph.htm
				 * 
				 * DE405 : Created May 1997; includes both nutations and
				 * librations. Referred to the International Celestial Reference
				 * Frame. Covers JED 2305424.50 (1599 DEC 09) to JED 2525008.50
				 * (2201 FEB 20)
				 * 
				 * DE406 : Created May 1997; includes neither nutations nor
				 * librations. Referred to the International Celestial Reference
				 * Frame. Spans JED 0625360.5 (-3000 FEB 23) to 2816912.50
				 * (+3000 MAY 06)
				 */
				// 經測試， LEA-406 似已修正月亮光行時、地球章動
				// coordinates.λ += n[0];
				coordinates.λ = normalize_radians(coordinates.λ);
			}
			if ('U' in coordinates) {
				coordinates.β = coordinates.U;
				// V, U in radians.
				// 修正地球章動 nutation。
				// 經測試， LEA-406 似已修正月亮光行時、地球章動
				// coordinates.β += n[1];
				coordinates.β = normalize_radians(coordinates.β, true);
			}
		}

		if ('R' in coordinates) {
			coordinates.Δ = coordinates.R;

			if (coordinates.β && coordinates.λ) {
				get_horizontal(coordinates, TT_JD, options);
			}

			// 單位轉換。
			if (options.km) {
				// R in AU → km.
				// 1000: 1 km = 1000 m
				coordinates.R *= AU_TO_METERS / 1000;
				coordinates.Δ *= AU_TO_METERS / 1000;
			}
		}

		// 單位轉換。
		if (options.degrees) {
			// V, U in radians → degrees
			if ('V' in coordinates) {
				coordinates.V /= DEGREES_TO_RADIANS;
				coordinates.λ /= DEGREES_TO_RADIANS;
			}
			if ('U' in coordinates) {
				coordinates.U /= DEGREES_TO_RADIANS;
				coordinates.β /= DEGREES_TO_RADIANS;
			}
		}

		return coordinates;
	}

	_.lunar_coordinates = lunar_coordinates;

	// lunar_phase_of_JD_cache[TT_JD] = degrees;
	var lunar_phase_of_JD_cache = [];

	/**
	 * get the longitudinal angle between the Moon and the Sun.<br />
	 * 計算 JD 時的月日視黃經差（月-日）。<br />
	 * 趨近 the elongation of Moon，但忽略緯度影響。
	 * 
	 * @param {Number}TT_JD
	 *            Julian date (JD of 天文計算用時間 TT)
	 * @param {Boolean}normalize_360
	 *            正規化成 0°–360°，而非 -180°–180°。
	 * 
	 * @returns {Number}angle in degrees
	 */
	function lunar_phase_angle_of_JD(TT_JD, normalize_360) {
		var degrees;

		if (String(TT_JD) in lunar_phase_of_JD_cache)
			degrees = lunar_phase_of_JD_cache[TT_JD];
		else if (!isNaN(degrees =
		// 可以忽略章動的影響。
		lunar_coordinates(TT_JD).λ / DEGREES_TO_RADIANS
				- solar_coordinates(TT_JD).apparent))
			lunar_phase_of_JD_cache[TT_JD] = degrees;

		if (!isNaN(degrees))
			degrees = normalize_degrees(degrees, !normalize_360);
		return degrees;
	}

	_.lunar_phase_angle_of_JD = lunar_phase_angle_of_JD;

	/**
	 * 平朔望月長度 in days. 日月合朔週期。
	 * 
	 * @type {Number}
	 * 
	 * @see mean_lunar_phase_coefficients
	 */
	var mean_lunar_phase_days = 29.530588861,
	/**
	 * 平月相的不變時間參數。
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版<br />
	 * p. 349. Chapter 49 Phases of the Moon. formula 49.1.<br />
	 * 
	 * @type {Array}
	 * 
	 * @inner
	 */
	mean_lunar_phase_coefficients = [ 2451550.09766,
	// 29.530588861 * k, but k = 1236.85 * T.
	29.530588861 * 1236.85, 0.00015437, -0.000000150, 0.00000000073 ],
	// Sun's mean anomaly at time JDE: 太陽平近點角： in radians
	eclipse_coefficients_M = [ 2.5534, 29.10535670 * 1236.85, -0.0000014,
			-0.00000011 ].map(degrees_to_radians),
	// Moon's mean anomaly: (Mʹ, M′) 月亮的平近點角： in radians
	eclipse_coefficients_Mm = [ 201.5643, 385.81693528 * 1236.85, 0.0107582,
			0.00001238, -0.000000058 ].map(degrees_to_radians),
	// Moon's argument of latitude: 月亮的緯度參數： in radians
	eclipse_coefficients_F = [ 160.7108, 390.67050284 * 1236.85, -0.0016118,
			-0.00000227, 0.000000011 ].map(degrees_to_radians),
	// Longitude of the ascending node of the lunar orbit:
	// 月亮軌道升交點經度： in radians
	eclipse_coefficients_Ω = [ 124.7746, -1.56375588 * 1236.85, 0.0020672,
			0.00000215 ].map(degrees_to_radians),
	// p. 338. (47.6)
	eclipse_coefficients_E = [ 1, -0.002516, -0.0000074 ],
	// p. 380.
	eclipse_coefficients_A1 =
	//
	[ 299.77, 0.107408 * 1236.85, -0.009173 ];

	/**
	 * 平月相的時間，已修正了太陽光行差及月球光行時間。<br />
	 * The times of the mean phases of the Moon, already affected by the Sun's
	 * aberration and by the Moon's light-time
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版<br />
	 * p. 349. formula 49.1.<br />
	 * 
	 * @param {Number}year_month
	 *            帶小數點的年數，例如1987.25表示1987年3月末。
	 * @param {Integer}phase
	 *            0:朔0°, 1:上弦90°, 2:望180°, 3:下弦270°
	 * @param {Object}[options]
	 *            附加參數/設定特殊功能與選項:<br />
	 *            {Boolean}options.nearest: 取得最接近之月相時間。
	 * 
	 * @returns {Number} Julian date (JD of 天文計算用時間 TT)
	 * 
	 * @see https://github.com/soniakeys/meeus/blob/master/eclipse/eclipse.go
	 */
	function mean_lunar_phase(year_month, phase, options) {
		phase /= 4;
		if (Array.isArray(year_month))
			year_month = year_month[0] + (year_month[1] - 1) / 12;
		/**
		 * 12.36853:
		 * <q>DAYS_OF_JULIAN_CENTURY / 100 / 29.530588861 = 12.368530872148396</q>
		 */
		var k = (year_month - 2000) * 12.36853,
		// 取 year_month 之後，第一個 phase。
		// Any other value for k will give meaningless results
		T = Math.floor(k) + phase;
		if (options && options.nearest && T - k > .5)
			// 取前一個。
			k = T - 1;
		else
			// 取之後最接近的。
			k = T;

		// T是J2000.0起算的儒略世紀數，用下式可得到足夠的精度：
		T = k / 1236.85;

		var TT_JD = polynomial_value(mean_lunar_phase_coefficients, T);
		if (!options || !options.eclipse
		//
		|| phase !== 0 && phase !== .5)
			return TT_JD;

		var
		// Moon's argument of latitude: 月亮的緯度參數： in radians
		F = normalize_radians(polynomial_value(eclipse_coefficients_F, T), true),
		//
		F_ = F / DEGREES_TO_RADIANS;

		/**
		 * p. 380.
		 * 
		 * If F differs from the nearest multiple of 180° by less than 13.9
		 * degrees, then there is certainly an eclipse; if the difference is
		 * larger than 21°.0, there is no eclipse; between these two values, the
		 * eclipse is uncertain at this stage and the case must be examined
		 * further.
		 */
		if (90 - Math.abs(90 - Math.abs(F_)) > 21.0)
			return TT_JD;

		var
		// Sun's mean anomaly at time JDE: 太陽平近點角： in radians
		M = polynomial_value(eclipse_coefficients_M, T),
		// Moon's mean anomaly: (Mʹ, M′) 月亮的平近點角： in radians
		Mm = polynomial_value(eclipse_coefficients_Mm, T),
		// Longitude of the ascending node of the lunar orbit:
		// 月亮軌道升交點經度： in radians
		Ω = polynomial_value(eclipse_coefficients_Ω, T),
		// p. 338. (47.6)
		// 表中的這些項包含了了M(太陽平近點角)，它與地球公轉軌道的離心率有關，就目前而言離心率隨時間不斷減小。由於這個原因，振幅A實際上是個變數(並不是表中的常數)，角度中含M或-M時，還須乘上E，含2M或-2M時須乘以E的平方進行修正。E的運算式如下：
		// The coefficient, not the argument of the sine or cosine,
		// should be multiplied by E.
		E = polynomial_value(eclipse_coefficients_E, T),
		// p. 380.
		F1 = F - 0.02665 * DEGREES_TO_RADIANS * Math.sin(Ω),
		// p. 380.
		A1 = polynomial_value(eclipse_coefficients_A1, T)
		//
		* DEGREES_TO_RADIANS;

		// 取得最大食的時間(對於地球一般是日食)，使用(47.1)平會合時間加上以下修正(單位是天)。
		var ΔJD = (phase === 0
		// 日食
		? -0.4075 * Math.sin(Mm) + 0.1721 * E * Math.sin(M)
		// 月食
		: -0.4065 * Math.sin(Mm) + 0.1727 * E * Math.sin(M))
		// p. 380.
		+ 0.0161 * Math.sin(2 * Mm) - 0.0097 * Math.sin(2 * F1) + 0.0073 * E
				* Math.sin(Mm - M) - 0.0050 * E * Math.sin(Mm + M) - 0.0023
				* Math.sin(Mm - 2 * F1) + 0.0021 * E * Math.sin(2 * M) + 0.0012
				* Math.sin(Mm + 2 * F1) + 0.0006 * E * Math.sin(2 * Mm + M)
				- 0.0004 * Math.sin(3 * Mm) - 0.0003 * E * Math.sin(M + 2 * F1)
				+ 0.0003 * Math.sin(A1) - 0.0002 * E * Math.sin(M - 2 * F1)
				- 0.0002 * E * Math.sin(2 * Mm - M) - 0.0002 * Math.sin(Ω);

		// p. 381. 高精度的日月位置計算需要幾百個項才能得到。
		var P = 0.2070 * E * Math.sin(M) + 0.0024 * E * Math.sin(2 * M)
				- 0.0392 * Math.sin(Mm) + 0.0116 * Math.sin(2 * Mm) - 0.0073
				* E * Math.sin(Mm + M) + 0.0067 * E * Math.sin(Mm - M) + 0.0118
				* Math.sin(2 * F1),
		// p. 381. 高精度的日月位置計算需要幾百個項才能得到。
		Q = 5.2207 - 0.0048 * E * Math.cos(M) + 0.0020 * E * Math.cos(2 * M)
				- 0.3299 * Math.cos(Mm) - 0.0060 * E * Math.cos(Mm + M)
				+ 0.0041 * E * Math.cos(Mm - M),
		// p. 381.
		W = Math.abs(Math.cos(F1)),
		// p. 381. Gamma
		// 在日食情況下，γ表示月影軸到地心的最小距離，單位是地球赤道半徑。
		// 在月食的情況下，γ表示月亮中心到地影軸的最小距離，單位是地球赤道半徑。γ是正還是負，取決於月亮中心經過地影軸的北邊或是南邊。
		γ = (P * Math.cos(F1) + Q * Math.sin(F1)) * (1 - 0.0048 * W),
		// p. 381.
		u = 0.0059 + 0.0046 * E * Math.cos(M) - 0.0182 * Math.cos(Mm) + 0.0004
				* Math.cos(2 * Mm) + -0.0005 * Math.cos(M + Mm),
		//
		abs_γ = Math.abs(γ),
		// 計算日月食的特性值。
		feature = {
			/**
			 * 日月食食點出現在月亮軌道的升交點 ascending node / 降交點 descending node。
			 * 
			 * If F is near 0° or 360°, the eclipse occurs near the Moon's
			 * ascending node. If F is near 180°, the eclipse takes place near
			 * the descending node of the Moon's orbit.
			 */
			node : Math.abs(F_) < 22 ? 'ascending' : 'descending',
			γ : γ,
		};

		if (phase === 0) {
			// 日食。地球的扁率是0.9972。
			// the oblateness of the Earth it is 0.9972.
			// 0.9972 may vary between 0.9970 and 0.9974 from one
			// eclipse to another.
			if (abs_γ < 0.9972) {
				// 日食中心是：在地球表面上存在一條日食中央線，影軸在地表經過的那條線。
				/**
				 * u表示月亮影錐在基平面上的半徑，單位也是地球半徑。基平面指：經過地心並且垂直月亮影軸的平面。半影錐在基平面上的半徑是u+0.5461
				 * 
				 * The quantity u denotes the radius of the Moon's umbral cone
				 * in the fundamental plane, again in units of the Earth's
				 * equatorial radius. The radius of the penumbral cone in the
				 * fundamental plane is u + 0.5461.
				 */
				// 影錐半徑
				feature.umbral_radius = u;
				// 半影錐半徑
				feature.penumbral_radius = u + 0.5461;
				// 對於有中心的日食，食的類型由以下規則決定：
				if (u < 0)
					// 日全食
					// magnitude > 1;
					feature.type = 'total';
				else if (u > 0.0047)
					// 日環食
					// magnitude < 1;
					feature.type = 'annular';
				else {
					var ω = 0.00464 * Math.sqrt(1 - γ * γ);
					if (u < ω)
						// 日全環食 Hybrid, annular-total
						feature.type = 'hybrid';
					else
						// 日環食
						// magnitude < 1;
						feature.type = 'annular';
				}

			} else if (abs_γ < 1.5433 + u) {
				// 則沒有日食中心，是一個部分食。日偏食
				feature.type = 'partial';
				if (abs_γ < 1.0260) {
					// 影錐的一部分可能觸及地表(在地球兩極地區)，而錐軸則沒有碰到地球。
				} else {
					// 沒有日食中心的全食或環食(因錐軸不經過地表，所以沒有中心)，是一個部分食。
				}
				// 在部分食的情況下，最大食發生在地表上距離影軸最近的那個點。在該點，食的程度(譯者注：大概指食分吧)是：
				// p. 382. (54.2)
				feature.magnitude = (1.5433 + u - abs_γ) / (0.5461 + 2 * u);
			} else {
				// 在地表上看不到日食。
				// no eclipse is visible from the Earth's surface.
			}

		} else {
			// 月食, parse === 2
			var semiduration_c,
			// penumbra 半影在月亮上的半徑，單位是地球直徑
			ρ = 1.2848 + u,
			// umbra 本影在月亮上的半徑，單位是地球直徑
			σ = 0.7403 - u,
			// p. 382. (54.4) 本影 umbral eclipses
			magnitude = (1.0128 - u - abs_γ) / 0.5450;
			if (magnitude >= 1) {
				feature.type = 'total';
				semiduration_c = 0.4678 - u;
			} else if (magnitude > 0) {
				feature.type = 'partial';
				semiduration_c = 1.0128 - u;
			} else {
				// p. 382. (54.3) 半影 penumbral eclipses
				magnitude = (1.5573 + u - abs_γ) / 0.545;
				if (magnitude > 0) {
					// 應注意，大部分半影月食(月亮僅進入地球半影)不能人眼分辨出來。
					feature.type = 'penumbral';
					semiduration_c = 1.5573 + u;
				} else {
					// 如食分為負值，說明沒有月食。
				}
			}
			if (semiduration_c > 0) {
				feature.magnitude = magnitude;
				// 計算半持續時間，單位是分鐘：
				feature.semiduration = 60 * Math.sqrt(
				// semidurations of the partial and total phases
				semiduration_c * semiduration_c - γ * γ)
						/ (0.5458 + 0.0400 * Math.cos(Mm));
			}
		}

		if (feature.type) {
			feature.object = phase === 0 ? 'solar' : 'lunar';
			// the time of maximum eclipse, 食甚時間.
			feature.TT = TT_JD + ΔJD;
		}

		// assert: typeof new Number(TT_JD) === "object";
		// Object.prototype.toString.call(new Number(TT_JD)) ===
		// "[object Number]"
		TT_JD = Object.assign(new Number(TT_JD), {
			M : normalize_radians(M),
			// M′
			Mm : normalize_radians(Mm),
			F : F,
			Ω : normalize_radians(Ω),
			E : E,
			P : P
		}, feature);
		return TT_JD;
	}

	_.mean_lunar_phase = mean_lunar_phase;

	/**
	 * 超過此角度則不會發生日蝕。
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * Explanatory Supplement to the Astronomical Ephemeris. Third impression
	 * 1974.<br />
	 * p. 215.<br />
	 * 
	 * @type {Number} in radians
	 * @inner
	 */
	var solar_eclipse_limit = degrees_to_radians(1, 34, 46),
	/**
	 * 超過此角度則不會發生月蝕。
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * Explanatory Supplement to the Astronomical Ephemeris. Third impression
	 * 1974.<br />
	 * p. 258.<br />
	 * 
	 * @type {Number} in radians
	 * @inner
	 */
	lunar_eclipse_limit = degrees_to_radians(1, 26, 19);

	/**
	 * the ellipticity of the Earth's spheroid. e^2 = 0.00669454 for 1968
	 * onwards<br />
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * Explanatory Supplement to the Astronomical Ephemeris. Third impression
	 * 1974.<br />
	 * p. 223.
	 * 
	 * For Hayford's spheroid (flattening 1/297) the coefficient (1 -
	 * e^2)^(-1/2) is equal to 1.003378.
	 * 
	 * @see https://en.wikipedia.org/wiki/Flattening
	 */
	var eccentricity_square
	//
	= (2 - TERRA_FLATTENING) * TERRA_FLATTENING,
	// For 1968 onwards:
	// Lunar Radius Constants (Penumbra)
	Lunar_Radius_k1 = 0.272488,
	// Lunar Radius Constants (Umbra)
	Lunar_Radius_k2 = 0.272281;

	/**
	 * 取得 TT_JD 時的 Besselian Elements 日月食資訊。<br />
	 * not yet done
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * Explanatory Supplement to the Astronomical Ephemeris. Third impression
	 * 1974.<br />
	 * p. 219.<br />
	 * 
	 * @param {Number}TT_JD
	 *            Julian date (JD of 天文計算用時間 TT)
	 * @param {Array}local [
	 *            latitude (°), longitude (°), time zone (e.g., UTC+8: 8),
	 *            elevation or geometric height (m) ]
	 * @param {Object}[options]
	 *            附加參數/設定特殊功能與選項:<br />
	 * 
	 * @returns {Object}Besselian Elements
	 */
	function Besselian_elements(TT_JD, local, options) {
		// 前置處理。
		if (!library_namespace.is_Object(options)) {
			if (!options && library_namespace.is_Object(local)) {
				options = local;
				// 這邊預設採用 0,0 是為了計算 .π，但此法不見得理想!
				local = options.local || [ 0, 0 ];
			} else
				options = Object.create(null);
		}

		var sun_coordinates = solar_coordinates(TT_JD, {
			equatorial : true,
			local : local
		}), moon_coordinates = lunar_coordinates(TT_JD, {
			equatorial : true,
			local : local
		});

		// adapt p. 219.
		if (false) {
			if (options.get_diff)
				return {};
			moon_coordinates.α
			//
			= degrees_to_radians(328, 13, 44.29);
			moon_coordinates.δ
			//
			= degrees_to_radians(-11, 53, 31.83);
			sun_coordinates.α
			//
			= degrees_to_radians(328, 38, 50.42);
			sun_coordinates.δ
			//
			= degrees_to_radians(-12, 42, 49.04);
			moon_coordinates.π
			//
			= degrees_to_radians(0, 61, 5.814);
			sun_coordinates.Δ = 0.9878805;
			Lunar_Radius_k1 = Lunar_Radius_k2 = 0.272274;
			sun_coordinates.LHA
			//
			= degrees_to_radians(296, 26, 22.3);
		}

		// p. 215.
		/**
		 * β☾: the latitude of the Moon at the time of conjunction in longitude
		 */
		var βm = moon_coordinates.π - sun_coordinates.π
				+ (semidiameter(moon_coordinates, MOON_NAME)
				//
				- semidiameter(sun_coordinates, SUN_NAME))
				* ARCSECONDS_TO_RADIANS;

		// TODO: test solar_eclipse_limit, lunar_eclipse_limit.

		// p. 216.
		var b = Math.sin(sun_coordinates.π) / Math.sin(moon_coordinates.π),
		// cos(α☉)
		cos_αs = Math.cos(sun_coordinates.α),
		// cos(δ☉)
		cos_δs = Math.cos(sun_coordinates.δ),
		// cos(α☾)
		cos_αm = Math.cos(moon_coordinates.α),
		// cos(δ☾)
		cos_δm = Math.cos(moon_coordinates.δ),
		// sin(δ☾)
		sin_δm = Math.sin(moon_coordinates.δ),

		/**
		 * a and d designate the right ascension and declination of the point Z
		 * on the celestial sphere towards which the axis of the shadow is
		 * directed
		 */
		/** g*cos(d)*cos(a) */
		g_cos_d_cos_a = cos_δs * cos_αs - b * cos_δm * cos_αm,
		/** g*cos(d)*sin(a) */
		g_cos_d_sin_a = cos_δs * Math.sin(sun_coordinates.α) - b * cos_δm
				* Math.sin(moon_coordinates.α),
		/** g*cos(d) */
		g_cos_d = Math.sqrt(g_cos_d_cos_a * g_cos_d_cos_a + g_cos_d_sin_a
				* g_cos_d_sin_a),
		/** g*sin(d) */
		g_sin_d = Math.sin(sun_coordinates.δ) - b * sin_δm,
		/** g=G/R */
		g = Math.sqrt(g_cos_d * g_cos_d + g_sin_d * g_sin_d),

		sin_d = g_sin_d / g, cos_d = Math.sqrt(1 - sin_d * sin_d),
		//
		tan_a = g_cos_d_sin_a / g_cos_d_cos_a,
		// a 與 α☉=sun_coordinates.α 有差距 (p. 219.)
		a = Math.atan(tan_a),

		// p. 217.
		/** sin(π☾) */
		sin_πm = Math.sin(moon_coordinates.π),
		/** cos(α☾-a) */
		cos_αmma = Math.cos(moon_coordinates.α - a),
		// 月球於地球上之 rectangular coordinates (直角座標)投影。
		// fundamental plane (基準平面)之 z 軸對準太陽。x 軸對準地球赤道。y 軸向北。
		// [x,y,z] unit: Earth equatorial radius
		x = cos_δm * Math.sin(moon_coordinates.α - a) / sin_πm,
		//
		y = (sin_δm * cos_d - cos_δm * sin_d * cos_αmma) / sin_πm;

		var z = (sin_δm * sin_d + cos_δm * cos_d * cos_αmma) / sin_πm;

		// var R = sun_coordinates.Δ;
		var tmp = g * sun_coordinates.Δ;
		// NG
		if (false) {
			sin_f1 = (Math.sin(sun_coordinates.semidiameter
					* ARCSECONDS_TO_RADIANS) + Lunar_Radius_k1
					* Math.sin(sun_coordinates.π))
					/ tmp;
			sin_f2 = (Math.sin(sun_coordinates.semidiameter
					* ARCSECONDS_TO_RADIANS) - Lunar_Radius_k2
					* Math.sin(sun_coordinates.π))
					/ tmp;
		}
		/**
		 * The angles f1, f2 which the generators of the penumbral (subscript 1)
		 * and umbral (subscript 2)<br />
		 * For 1968 onwards:
		 */
		var sin_f1 = 0.004664018 / tmp,
		//
		sin_f2 = 0.004640792 / tmp,

		/**
		 * p. 218.<br />
		 * distances of the vertices of the penumbral and umbral cones above the
		 * fundamental plane are thus, in units of the equatorial radius of the
		 * Earth:
		 */
		c1 = z + Lunar_Radius_k1 / sin_f1,
		//
		c2 = z - Lunar_Radius_k2 / sin_f2,

		tan_f1 = sin_f1 / Math.sqrt(1 - sin_f1 * sin_f1),
		//
		tan_f2 = sin_f2 / Math.sqrt(1 - sin_f2 * sin_f2),
		/**
		 * l1,l2: the radii of the penumbra and umbra on the fundamental plane
		 */
		l1 = c1 * tan_f1,
		// p. 239.
		// 0.5464: mean value of l1 - l2 adopted from 1963 onwards.
		// l2 = c2 * tan_f2 || (l1 - 0.5464),
		l2 = c2 * tan_f2;

		if (false) {
			console.log(format_radians(
			//
			normalize_radians(sun_coordinates.LHA)));
			console.log(normalize_radians(sun_coordinates.LHA)
					/ DEGREES_TO_RADIANS);
		}
		// p. 217.
		// ephemeris hour angle = ephemeris sidereal time - a
		// μ = Greenwich視恆星時"Apparent sidereal time" − 地心赤經a
		var μ = GAST(TT_of(TT_JD, true), TT_JD) - a;
		// console.log('μ=' + format_radians(normalize_radians(μ)));

		if (options.get_diff)
			return {
				x : x,
				y : y,
				z : z,
				c1 : c1,
				c2 : c2,
				l1 : l1,
				l2 : l2,
				μ : μ,
				sin_d : sin_d
			};

		var elements_1_hour = Besselian_elements(TT_JD + 1 / ONE_DAY_HOURS,
				local, {
					get_diff : true
				});
		// console.log(elements_1_hour);

		// p. 219.
		var
		// μ′, hourly variations
		// μp/DEGREES_TO_RADIANS
		μp = elements_1_hour.μ - μ,
		// d′
		dp = Math.asin(elements_1_hour.sin_d) - Math.asin(sin_d);
		// console.log("μ′=" + μp + ", d′=" + dp);

		var
		// p. 220.
		/**
		 * It is always sufficient to calculate them for the integral hour
		 * nearest conjunction
		 */
		ρ1 = Math.sqrt(1 - eccentricity_square * cos_d * cos_d),
		//
		ρ2 = Math.sqrt(1 - eccentricity_square * sin_d * sin_d);

		var
		// p. 220.
		sin_d1 = sin_d / ρ1,
		//
		cos_d1 = Math.sqrt(1 - eccentricity_square) * cos_d / ρ1,

		/** sin(d1-d2) */
		sin_d1md2 = eccentricity_square * sin_d * cos_d / ρ1 / ρ2,
		/** cos(d1-d2) */
		cos_d1md2 = Math.sqrt(1 - eccentricity_square) / ρ1 / ρ2;

		var
		// x′
		xp = elements_1_hour.x - x,
		// y′
		yp = elements_1_hour.y - y,
		// z′
		zp = elements_1_hour.z - z,
		// c2′
		c2p = elements_1_hour.c2 - c2;

		// p. 223.
		/**
		 * Central line of total or annular phase
		 */
		var central = {
			ξ : x,
			η : y,
			η1 : y / ρ1
		};
		tmp = 1 - x * x - central.η1 * central.η1;
		if (tmp >= 0) {
			central.ζ1 = Math.sqrt(tmp);
			// central.s = central.L2 / n;
			central.ζ = ρ2 * (
			//
			central.ζ1 * cos_d1md2 - central.η1 * sin_d1md2);
			// ξ′
			central.ξp = μp * (-y * sin_d + central.ζ * cos_d);
			// η′
			central.ηp = μp * x * sin_d - dp * central.ζ;
			tmp = xp - central.ξp;
			central.n = Math.sqrt(tmp * tmp + (yp - central.ηp)
					* (yp - central.ηp));
			central.L1 = l1 - central.ζ * tan_f1;
			central.L2 = l2 - central.ζ * tan_f2;
			central.magnitude = (central.L1 - central.L2)
					/ (central.L1 + central.L2);
			central.s = Math.abs(central.L2) / central.n;
			central.duration = central.s * 60 * 60 * 2;
			// p. 223.
			central.θ = Math
					.atan(x, -central.η1 * sin_d1 + central.ζ1 * cos_d1);
			central.λ = μ - central.θ;
			central.longitude = from_ephemeris_longitude(central.λ, TT_JD);
			// sin(φ1)
			tmp = central.η1 * cos_d1 + central.ζ1 * sin_d1;
			central.φ = format_radians(normalize_radians(tmp
			//
			/ Math.sqrt(1 - tmp * tmp) / Math.sqrt(1 - eccentricity_square),
					true), 'decimal');
		} else {
			// 超過了地球的半徑，無日月蝕。
			central.ζ2 = tmp;
		}
		if (options.get_central)
			return central;

		// p. 219.
		// p. 223.
		var
		// θ is the local hour angle of the axis of shadow.
		// θ = LHA = μ - ephemeris longitude λ*
		// a 與 sun_coordinates.α 有差距，因此重算，不用 sun_coordinates.LHA。
		θ = μ - to_ephemeris_longitude(local[1], TT_JD),
		//
		sin_θ = Math.sin(θ), cos_θ = Math.sqrt(1 - sin_θ * sin_θ);
		// console.log('θ=' + format_radians(normalize_radians(θ)));

		// p. 220.
		/** the geodetic latitude of a point on the Earth's surface */
		var φ = local[0] * DEGREES_TO_RADIANS, sin_φ = Math.sin(φ),
		//
		C = 1 / Math.sqrt(1 - eccentricity_square * sin_φ * sin_φ),
		//
		S = (1 - eccentricity_square) * C,
		// p. 241.
		H = (local[3] || 0) * 0.1567850e-6,
		// φ′: geocentric latitude of φ
		ρsin_φp = (S + H) * sin_φ, ρcos_φp = (C + H) * Math.cos(φ),
		//
		sin_φ1 = ρsin_φp / Math.sqrt(1 - eccentricity_square),
		//
		cos_φ1 = ρcos_φp;
		// ((sin_φ1*sin_φ1+cos_φ1*cos_φ1)) should be 1

		// p. 219.
		// ephemeris longitude λ*, geocentric latitude φ′, at a distance
		// ρ from the centre of the terrestrial spheroid
		// [ξ,η,ζ] unit: Earth equatorial radius
		var ξ = ρcos_φp * sin_θ,
		//
		η = ρsin_φp * cos_d - ρcos_φp * sin_d * cos_θ,
		//
		ζ = ρsin_φp * sin_d + ρcos_φp * cos_d * cos_θ;

		var η1 = sin_φ1 * cos_d1 - cos_φ1 * sin_d1 * cos_θ,
		//
		ζ1 = sin_φ1 * sin_d1 + cos_φ1 * cos_d1 * cos_θ;

		// p. 221.
		// Auxiliary elements of an eclipse
		/**
		 * Q: the position angle (measured eastwards from the north, i.e. from
		 * the y-axis towards the x-axis) of the axis from the observer
		 */

		var
		/**
		 * At a height ζ above the fundamental plane the radius L of the shadow
		 * is given by: L = l - ζ * tan(f)
		 */
		// penumbra
		L1 = l1 - ζ * tan_f1,
		// umbra
		L2 = l2 - ζ * tan_f2;

		var
		// p. 222.
		l1p = elements_1_hour.l1 - l1,
		//
		l2p = elements_1_hour.l2 - l2,
		// a1′
		a1p = -l1p - μp * x * tan_f1 * cos_d,
		// a2′
		a2p = -l2p - μp * x * tan_f2 * cos_d,
		// b′
		bp = -yp + μp * x * sin_d,
		// c1′
		c1p = xp + μp * y * sin_d + μp * l1 * tan_f1 * cos_d,
		// c2′
		c2p = xp + μp * y * sin_d + μp * l2 * tan_f2 * cos_d,

		// p. 224.
		// ξ′= μp * (y*sin_d + ζ*cos_d)
		ξp = μp * cos_φ1 * cos_θ,
		// η′
		ηp = μp * x * sin_d - dp * ζ,
		// p. 223.
		/** speed of the shadow relative to the observer */
		n = Math.sqrt((xp - ξp) * (xp - ξp) + (yp - ηp) * (yp - ηp)),
		/**
		 * semi-duration s of the total, or annular, phase on the central line
		 */
		s = Math.abs(L2) / n,
		// duration: hour (semi-duration) to seconds
		duration = s * 60 * 60 * 2,

		// p. 224.
		// tan Qo is required in example 9.7
		tan_Q0 = (ηp - yp) / (xp - ξp);

		// p. 224.
		// Northern and southern limits of umbra and penumbra
		function get_limit(southern, penumbra) {
			var ap, cp, l, tan_f;
			if (penumbra)
				ap = a1p, cp = c1p, l = l1, tan_f = tan_f2;
			else
				// umbra
				ap = a2p, cp = c2p, l = l2, tan_f = tan_f2;
			/**
			 * p. 225.<br />
			 * If the latter is not available, as for example in the case of
			 * non-central eclipses, it is sufficient to set: _ζ = 0
			 */
			var _ζ = ζ || 0, cos_Q = 1;
			var _ξ, last_ζ;
			do {
				// 高
				var adjacent = bp - _ζ * dp - ap / cos_Q;
				// 底邊
				var opposite = cp - _ζ * μp * cos_d;
				// 斜邊
				var hypotenuse = Math.sqrt(adjacent * adjacent + opposite
						* opposite);
				// var Q = Math.atan2(bp, (cp - _ζ * μp * cos_d));

				cos_Q = opposite / hypotenuse;
				/**
				 * The sign of cos Q is positive for the northern limit of a
				 * total eclipse and the southern limit of an annular eclipse;
				 * it is negative for the southern limit of a total eclipse and
				 * the northern limit of an annular eclipse.
				 */
				if (southern ^ penumbra ^ (cos_Q < 0))
					hypotenuse = -hypotenuse, cos_Q = -cos_Q;

				var _L = l - _ζ * tan_f;
				// var _ξ = x - _L * Math.sin(Q);
				_ξ = x - _L * bp / hypotenuse;
				var _η1 = (y - _L * cos_Q) / ρ1;

				// warning: 對於northern penumbra，可能有 |_ξ|>=1 &&
				// |_η1|>=1，表示不在範圍內?
				var _ζ1 = Math.sqrt(1 - _ξ * _ξ - _η1 * _η1);
				last_ζ = _ζ;
				_ζ = ρ2 * (_ζ1 * cos_d1md2 - _η1 * sin_d1md2);
				// console.log([ _ζ, _ζ - last_ζ ]);
			} while (Math.abs(_ζ - last_ζ) > Number.EPSILON);

			// p. 223.
			var Q = Math.acos(cos_Q);
			var sin_θ = _ξ / cos_φ1, θ = Math.asin(sin_θ);
			// λ*: ephemeris longitude 星曆經度
			var λ = μ - θ;

			var _sin_φ1 = _η1 * cos_d1 + _ζ1 * sin_d1,
			//
			_cos_φ1 = (-_η1 * sin_d1 + _ζ1 * cos_d1) / Math.cos(θ),
			//
			φ = Math.atan(_sin_φ1 / _cos_φ1
					/ Math.sqrt(1 - eccentricity_square));
			return isNaN(φ) ? null : [
					format_radians(normalize_radians(λ), 'decimal'),
					format_radians(normalize_radians(φ, true), 'decimal') ];
		}

		var northern_limit = get_limit(),
		//
		southern_limit = get_limit(true);
		var northern_penumbra_limit = get_limit(false, true);
		var southern_penumbra_limit = get_limit(true, true);

		// p. 228.
		// Outline curves
		var m = Math.sqrt(x * x + y * y),
		// in radians
		M = Math.atan(x / y),
		//
		QmM = Math.acos((m * m + l1 * l1 - 1) / 2 / l1 / m);

		// p. 228.
		// using the mean the same as get_limit()
		// test for Q = 0°
		var c_Q = 0,
		//
		c_ξ = x - L1 * Math.sin(c_Q),
		//
		c_η1 = (y - L1 * Math.cos(c_Q)) / ρ1,
		// ξ^2
		c_ξ2 = 1 - c_ξ * c_ξ - c_η1 * c_η1;

		/**
		 * If the angle (Q - M) is imaginary, there are no end points to the
		 * curve, and the angle Q takes all values from 0° to 360°.
		 */
		var outline = [ format_radians(normalize_radians(M - QmM), 'decimal'),
				format_radians(normalize_radians(M + QmM), 'decimal')
		//
		];
		// console.log(c_ξ2 + ', [' + outline + ']');
		if ((c_ξ2 > 0) ^ (outline[0] > outline[1]))
			// swap.
			outline = [ outline[1], outline[0] ];

		// outline = [30,200]: 200°~360°, 0°~30°

		// TODO: p. 229.

		return {
			βm : βm,
			d : Math.asin(sin_d),
			μ : μ,
			θ : θ,
			φ : φ,
			l1 : l1,
			l1p : l1p,
			l2 : l2,
			l2p : l2p,
			central : central,
			ζ : ζ,
			c1 : c1,
			c2 : c2,
			L1 : L1,
			L2 : L2,
			// p. 246.
			magnitude : (L1 - L2) / (L1 + L2),
			// Central Duration
			duration : duration,
			x : x,
			xp : xp,
			y : y,
			yp : yp,
			z : z,
			zp : zp,
			tan_Q0 : tan_Q0,
			// 4 items in degrees
			northern_limit : northern_limit,
			southern_limit : southern_limit,
			northern_penumbra_limit : northern_penumbra_limit,
			southern_penumbra_limit : southern_penumbra_limit,
			// in degrees
			outline : outline
		};
	}

	_.Besselian_elements = Besselian_elements;

	Besselian_elements.lunar = function(TT_JD, options) {
		// 前置處理。
		if (!library_namespace.is_Object(options))
			options = Object.create(null);

		var local = options.local || [ 0, 0 ];

		var sun_coordinates = solar_coordinates(TT_JD, {
			equatorial : true,
			local : local
		}), moon_coordinates = lunar_coordinates(TT_JD, {
			equatorial : true,
			local : local
		});

		// p. 258.
		var a = sun_coordinates.α + TURN_TO_RADIANS / 2,
		//
		d = -sun_coordinates.δ,
		// p. 260.
		// Corrections to position of the Moon
		// α☾
		αm = moon_coordinates.α - 0.20 * ARCSECONDS_TO_RADIANS,
		// δ☾
		δm = moon_coordinates.δ - 0.46 * ARCSECONDS_TO_RADIANS;

		var b = Math.sin(sun_coordinates.π) / Math.sin(moon_coordinates.π),
		// cos(α☉)
		cos_αs = Math.cos(a),
		// cos(δ☉)
		cos_δs = Math.cos(d),
		// cos(α☾)
		cos_αm = Math.cos(moon_coordinates.α),
		// cos(δ☾)
		cos_δm = Math.cos(moon_coordinates.δ),
		// sin(δ☾)
		sin_δm = Math.sin(moon_coordinates.δ),

		/**
		 * a and d designate the right ascension and declination of the point Z
		 * on the celestial sphere towards which the axis of the shadow is
		 * directed
		 */
		/** g*cos(d)*cos(a) */
		g_cos_d_cos_a = cos_δs * cos_αs - b * cos_δm * cos_αm,
		/** g*cos(d)*sin(a) */
		g_cos_d_sin_a = cos_δs * Math.sin(a) - b * cos_δm
				* Math.sin(moon_coordinates.α),
		/** g*cos(d) */
		g_cos_d = Math.sqrt(g_cos_d_cos_a * g_cos_d_cos_a + g_cos_d_sin_a
				* g_cos_d_sin_a),
		/** g*sin(d) */
		g_sin_d = Math.sin(d) - b * sin_δm,
		/** g=G/R */
		g = Math.sqrt(g_cos_d * g_cos_d + g_sin_d * g_sin_d),

		sin_d = g_sin_d / g, cos_d = Math.sqrt(1 - sin_d * sin_d),
		//
		tan_a = g_cos_d_sin_a / g_cos_d_cos_a,

		/** cos(α☾-a) */
		cos_αmma = Math.cos(moon_coordinates.α - a),
		//
		x = cos_δm * Math.sin(moon_coordinates.α - a),
		//
		y = (sin_δm * cos_d - cos_δm * sin_d * cos_αmma);

		if (options.get_diff)
			return {
				x : x,
				y : y
			};

		var elements_1_hour = Besselian_elements.lunar(TT_JD + 1
				/ ONE_DAY_HOURS, {
			get_diff : true
		});

		var
		// x′
		xp = elements_1_hour.x - x,
		// y′
		yp = elements_1_hour.y - y;

		/** n^2 */
		var n2 = xp * xp + yp * yp,
		//
		n = Math.sqrt(n2),
		//
		t = -(x * xp + y * yp) / n2;

		// the correction t to a starting time To to obtain the time of
		// greatest obscuration is determined by solving:
		var tmp = TT_JD + t / ONE_DAY_HOURS;
		if (options.no_iterate && TT_JD !== tmp)
			return Besselian_elements.lunar(tmp, options);
		TT_JD = tmp;

		var Δ = Math.abs(x * yp - y * xp) / n;

		// p. 257.
		/**
		 * 
		 * Reference 資料來源/資料依據:<br />
		 * NASA - Enlargement of Earth's Shadows
		 * 
		 * @see http://eclipse.gsfc.nasa.gov/LEcat5/shadow.html
		 */
		// 1.01 ≅ 1 + 1/85 - 1/594.
		tmp = 1.01 * moon_coordinates.π + sun_coordinates.π;
		/** s☉: semi-diameter of the Sun */
		var ss = semidiameter(sun_coordinates, SUN_NAME)
				* ARCSECONDS_TO_RADIANS,
		/** s☾: semi-diameter of the Moon */
		sm = semidiameter(moon_coordinates, MOON_NAME) * ARCSECONDS_TO_RADIANS,
		// penumbral radius
		f1 = tmp + ss,
		// umbral radius
		f2 = tmp - ss,
		// angular distance (L) between the centres of the Moon and the
		// shadow
		// at beginning and end of the penumbral eclipse
		L1 = f1 + sm,
		// at beginning and end of the partial eclipse
		L2 = f2 + sm,
		// at beginning and end of the total eclipse
		L3 = f2 - sm;

		// p. 259.
		/** Δ^2 */
		var Δ2 = Δ * Δ, type,
		// semi-duration in hours
		semi_duration = [];
		tmp = L1 * L1 - Δ2;
		if (tmp < 0) {
			// no eclipse
			// return;
			// ** DO NOT set type here!
		} else {
			semi_duration.push(Math.sqrt(tmp) / n);
			tmp = L2 * L2 - Δ2;
			if (tmp < 0)
				// penumbral eclipse
				type = 'penumbral';
			else {
				semi_duration.push(Math.sqrt(tmp) / n);
				tmp = L3 * L3 - Δ2;
				if (tmp < 0)
					type = 'partial';
				else {
					semi_duration.push(Math.sqrt(tmp) / n);
					type = 'total';
				}
			}
		}

		/** L^2 */
		tmp = (x + xp * t) * (x + xp * t)
		//
		+ (y + yp * t) * (y + yp * t);
		var L = Math.sqrt(tmp),
		/** L^2 - Δ^2 */
		L1mΔ2 = tmp - Δ2;

		/**
		 * angular distance between the centres of the Moon and the shadow
		 */
		var m = Math.sqrt(x * x + y * y);

		return {
			TT : TT_JD,
			semi_duration : semi_duration,
			// f1 : normalize_radians(f1) / ARCSECONDS_TO_RADIANS,
			// f2 : normalize_radians(f2) / ARCSECONDS_TO_RADIANS,
			// L1 : normalize_radians(L1) / ARCSECONDS_TO_RADIANS,
			// L2 : normalize_radians(L2) / ARCSECONDS_TO_RADIANS,
			// L3 : normalize_radians(L3) / ARCSECONDS_TO_RADIANS,
			// Δ : normalize_radians(Δ) / ARCSECONDS_TO_RADIANS,
			type : type,
			// The values of L, m, and s☉ should be those corresponding
			// to the time of greatest obscuration.
			magnitude : (L2 - m) / 2 / sm,
			penumbral_magnitude : (L1 - m) / 2 / sm,
			/**
			 * The latitudes (φ) and ephemeris longitudes (λ*) of the places
			 * that have the Moon in the zenith at given times
			 */
			latitude : format_radians(normalize_radians(moon_coordinates.δ,
					true), 'decimal'),
			// ephemeris sidereal time - α☾
			longitude : from_ephemeris_longitude(
					GAST(TT_of(TT_JD, true), TT_JD) - moon_coordinates.α, TT_JD)
		};
	};

	/**
	 * 取得 TT_JD 時的日月食資訊。
	 * 
	 * 中國古代天象記錄總表 http://chungfamily.woweb.net/zbxe/board_013/6819
	 * http://mdonchan.web.fc2.com/siryou/toita/jissoku-1.htm
	 * 
	 * @param {Number}TT_JD
	 *            Julian date (JD of 天文計算用時間 TT)
	 * @param {Integer}phase
	 *            0:朔0°, 1:上弦90°, 2:望180°, 3:下弦270°
	 * @param {Object}[options]
	 *            附加參數/設定特殊功能與選項:<br />
	 * 
	 * @returns {Object}日月食資訊。
	 */
	function eclipse_JD(TT_JD, phase, options) {
		// 前置處理。
		if (!library_namespace.is_Object(options))
			options = Object.create(null);
		if (!options.eclipse)
			options = Object.assign({
				eclipse : true
			}, options);

		var year_month = options.year ? TT_JD
				: Julian_century(TT_JD) * 100 + 2000;

		/**
		 * 日月食資訊。
		 * 
		 * @type {Object}
		 */
		var eclipse_data
		//
		= mean_lunar_phase(year_month, phase, options);

		if (eclipse_data.type) {
			eclipse_data.name
			// gettext_config:{"id":"total-solar-eclipse","mark_type":"combination_message_id"}
			// gettext_config:{"id":"annular-solar-eclipse","mark_type":"combination_message_id"}
			// gettext_config:{"id":"hybrid-solar-eclipse","mark_type":"combination_message_id"}
			// gettext_config:{"id":"partial-solar-eclipse","mark_type":"combination_message_id"}
			// gettext_config:{"id":"total-lunar-eclipse","mark_type":"combination_message_id"}
			// gettext_config:{"id":"partial-lunar-eclipse","mark_type":"combination_message_id"}
			// gettext_config:{"id":"penumbral-lunar-eclipse","mark_type":"combination_message_id"}
			= eclipse_data.type + ' ' + eclipse_data.object + ' eclipse';
			eclipse_data.Δlongitude
			// eclipse conjunction 黃經衝 or 合(有相同的黃經)時之月黃緯
			= lunar_coordinates(eclipse_data.TT).β
			//
			/ DEGREES_TO_RADIANS;
			eclipse_data.saros = saros(eclipse_data.TT,
			// push saros series
			phase === 0 ? TYPE_SOLAR : TYPE_LUNAR);

		} else
			eclipse_data = undefined;

		if (eclipse_data && eclipse_data.saros)
			return eclipse_data;

		// ------------------------------------------------------------

		if (!options.elements) {
			var saros_data = saros(TT_JD,
			// push saros series
			phase === 0 ? TYPE_SOLAR : TYPE_LUNAR);

			// 若是有 saros 就當作可能有日月食。
			return saros_data && {
				TT : TT_JD,
				object : phase === 0 ? 'solar' : 'lunar',
				// gettext_config:{"id":"solar-eclipse","mark_type":"combination_message_id"}
				// gettext_config:{"id":"lunar-eclipse","mark_type":"combination_message_id"}
				name : (phase === 0 ? 'solar' : 'lunar') + ' eclipse',
				Δlongitude :
				// eclipse conjunction 黃經衝 or 合(有相同的黃經)時之月黃緯
				lunar_coordinates(TT_JD).β
				//
				/ DEGREES_TO_RADIANS,
				saros : saros_data
			};
		}

		// ------------------------------------------------------------

		// 下面運算頗耗時間。

		if (phase !== 0) {
			eclipse_data = Besselian_elements.lunar(TT_JD)
			if (!eclipse_data.type)
				return;
			var TT = eclipse_data.TT,
			//
			saros_data = saros(TT,
			// push saros series
			phase === 0 ? TYPE_SOLAR : TYPE_LUNAR);

			return Object.assign(eclipse_data, {
				TT : TT,
				object : phase === 0 ? 'solar' : 'lunar',
				// gettext_config:{"id":"total-solar-eclipse","mark_type":"combination_message_id"}
				// gettext_config:{"id":"annular-solar-eclipse","mark_type":"combination_message_id"}
				// gettext_config:{"id":"hybrid-solar-eclipse","mark_type":"combination_message_id"}
				// gettext_config:{"id":"partial-solar-eclipse","mark_type":"combination_message_id"}
				// gettext_config:{"id":"total-lunar-eclipse","mark_type":"combination_message_id"}
				// gettext_config:{"id":"partial-lunar-eclipse","mark_type":"combination_message_id"}
				// gettext_config:{"id":"penumbral-lunar-eclipse","mark_type":"combination_message_id"}
				name : eclipse_data.type + ' '
						+ (phase === 0 ? 'solar' : 'lunar') + ' eclipse',
				Δlongitude :
				// eclipse conjunction 黃經衝 or 合(有相同的黃經)時之月黃緯
				lunar_coordinates(TT).β
				//
				/ DEGREES_TO_RADIANS,
				saros : saros_data
			});
		}

		var get_magnitude = function(TT_JD) {
			var data = Besselian_elements(TT_JD, {
				get_central : true
			}), magnitude = data.magnitude;
			if (isNaN(magnitude))
				// 9: 隨便給，夠大就好。
				// assert: -magnitude < 5 < 9 - data.ζ2
				return 9 - data.ζ2;
			return [ -magnitude, {
				data : data
			} ];
		};

		if (get_magnitude(TT)[0] > 5)
			// 連正中都無值。
			return;

		// using Besselian Elements
		// Explanatory Supplement to the Astronomical Ephemeris. Third
		// impression 1974.
		// p. 211. ECLIPSES AND TRANSITS

		// 朔的時間點日月黃經差為0，距離最大食分應在五分左右，十分內？
		var range = Math.abs(options.range) || .2,
		//
		min_TT = TT_JD - range, max_TT = TT_JD + range;

		if (false) {
			while (isNaN(get_magnitude(min_TT)[0]))
				min_TT += 0.001;
			while (isNaN(get_magnitude(max_TT)[0]))
				max_TT -= 0.001;
		}

		// 發生此日月食，時甚時之實際 TT in JD.
		var TT = library_namespace.find_minima(
		//
		get_magnitude, min_TT, max_TT);

		if (TT.y > 5)
			return;

		var saros_data = saros(TT,
		// push saros series
		phase === 0 ? TYPE_SOLAR : TYPE_LUNAR);

		return Object.assign(TT.data, {
			TT : TT,
			object : phase === 0 ? 'solar' : 'lunar',
			// gettext_config:{"id":"solar-eclipse","mark_type":"combination_message_id"}
			// gettext_config:{"id":"lunar-eclipse","mark_type":"combination_message_id"}
			name : (phase === 0 ? 'solar' : 'lunar') + ' eclipse',
			Δlongitude :
			// eclipse conjunction 黃經衝 or 合(有相同的黃經)時之月黃緯
			lunar_coordinates(TT).β
			//
			/ DEGREES_TO_RADIANS,
			saros : saros_data
		});

		// ------------------------------------------------------------

		// 以下方法無依據。這樣的條件也有可能過疏過密？

		var
		/**
		 * eclipse conjunction 黃經衝 or 合(有相同的黃經)時之日月角距離 (in arcseconds)。
		 * 
		 * TT.y≈Math.sqrt((TT.s.λ-TT.l.λ)*(TT.s.λ-TT.l.λ)+(TT.s.β-TT.l.β)*(TT.s.β-TT.l.β))
		 * 
		 * @type {Number} in arcseconds
		 */
		distance = TT.y / ARCSECONDS_TO_RADIANS,
		/**
		 * 日面的地心視半徑 (in arcseconds)。Geocentric semi-diameter of the Sun.
		 * 
		 * @type {Number} in arcseconds
		 */
		sun_radius = semidiameter(TT.s, SUN_NAME),
		/**
		 * 月面的地心視半徑 (in arcseconds)。
		 * 
		 * @type {Number} in arcseconds
		 */
		moon_radius = semidiameter(TT.l, MOON_NAME),
		/**
		 * 食甚食分 magnitude 角距離 (in arcseconds)。
		 * 
		 * @type {Number} in arcseconds
		 */
		magnitude = sun_radius + moon_radius - distance;

		// ((magnitude < 0))在魯隱公1年4月1日(-722/4/14)會漏掉!!
		if (false && magnitude < 0 && !saros_data)
			// 無遮掩??
			return;

		// β☾
		var βm = TT.l.π - TT.s.π + (moon_radius - sun_radius)
				* ARCSECONDS_TO_RADIANS;
		if (βm > phase === 0 ? solar_eclipse_limit : lunar_eclipse_limit)
			return;

		magnitude /= phase === 0 ? sun_radius : moon_radius;

		eclipse_data = {
			TT : TT,
			object : phase === 0 ? 'solar' : 'lunar',
			// gettext_config:{"id":"solar-eclipse","mark_type":"combination_message_id"}
			// gettext_config:{"id":"lunar-eclipse","mark_type":"combination_message_id"}
			name : (phase === 0 ? 'solar' : 'lunar') + ' eclipse',
			Δlongitude :
			// eclipse conjunction 黃經衝 or 合(有相同的黃經)時之月黃緯
			lunar_coordinates(TT).β
			//
			/ DEGREES_TO_RADIANS,
			saros : saros_data
		};

		if (magnitude > 0)
			eclipse_data.magnitude = magnitude;

		return eclipse_data;

		// ------------------------------------------------------------
		// old

		/**
		 * local (地面某點) 觀測者緯度 latitude (度)。
		 * 
		 * @type {Number}
		 */
		var latitude =
		//
		Array.isArray(options.local) ? options.local[0]
		//
		: options.latitude || 45,
		// 朔的時間點日月黃經差為0，距離最大食分應在五分左右，十分內？
		/**
		 * 計算月亮(月心)的緯度→與黃道距離(度)。
		 * 
		 * @type {Number}
		 */
		d = lunar_coordinates(TT).β / DEGREES_TO_RADIANS,
		// 計算月面視半徑 (度)。
		/**
		 * 月面的地心視半徑 (度)。
		 * 
		 * TODO: use (coordinates.Δ * AU_TO_METERS) instead of LUNAR_DISTANCE_M
		 * 
		 * @type {Number}
		 */
		r = Math.asin(LUNAR_RADIUS_M / LUNAR_DISTANCE_M)
		// → 以觀測者為中心的座標中看到的月亮視半徑
		* (1 + Math.sin(latitude * DEGREES_TO_RADIANS)
		//
		* TERRA_RADIUS_M / LUNAR_DISTANCE_M)
		// → 度
		/ DEGREES_TO_RADIANS,
		/**
		 * calculate range (度)
		 * 
		 * 初始值: 日面的地心視半徑 (度)。 Geocentric semi-diameter of the Sun
		 * 
		 * @type {Number}
		 */
		range = SOLAR_RADIUS_RADIANS / DEGREES_TO_RADIANS;
		if (phase === 2) {
			// 日食: 計算日面視半徑 (度)。
			// TODO: Besselian elements
		} else {
			// assert: phase === 2
			// 月食: 計算地球本影之半徑, Earth's umbra radius.
			/**
			 * 
			 * Reference 資料來源/資料依據:<br />
			 * NASA - Enlargement of Earth's Shadows
			 * 
			 * @see http://eclipse.gsfc.nasa.gov/LEcat5/shadow.html
			 */

			/**
			 * Equatorial horizontal parallax of the Sun, and 1.01 ≅ 1 + 1/85 -
			 * 1/594. 太陽赤道地平視差 (度)
			 * 
			 * Astronomical Almanac 2011:<br />
			 * Solar parallax, pi_odot:<br />
			 * sin^-1(a_e/A) = 8.794143″
			 * 
			 * @type {Number}
			 * 
			 * @see https://en.wikipedia.org/wiki/Parallax#Solar_parallax
			 */
			var Solar_parallax
			// 1: distance in AU
			= 8.794143 / DEGREES_TO_ARCSECONDS / 1,
			/**
			 * Equatorial horizontal parallax of the Moon 月球赤道地平視差 (度)
			 * 
			 * @type {Number}
			 * 
			 * @see http://farside.ph.utexas.edu/Books/Syntaxis/Almagest/node42.html
			 */
			Lunar_parallax = 41 / DEGREES_TO_ARCSECONDS;
			// http://eclipse.gsfc.nasa.gov/LEcat5/shadow.html
			range = 1.01 * Lunar_parallax + Solar_parallax
			// Geocentric semi-diameter of the Sun
			// 日面的地心視半徑 (度)。
			- range;
			// range: umbral radius 地球本影半徑
		}

		if (eclipse_data = Math.abs(d) < range + r) {
			eclipse_data = {
				TT : TT,
				object : phase === 0 ? 'solar' : 'lunar',
				// gettext_config:{"id":"solar-eclipse","mark_type":"combination_message_id"}
				// gettext_config:{"id":"lunar-eclipse","mark_type":"combination_message_id"}
				name : (phase === 0 ? 'solar' : 'lunar') + ' eclipse',
				Δlongitude :
				// eclipse conjunction 黃經衝 or 合(有相同的黃經)時之月黃緯
				lunar_coordinates(TT_JD).β
				//
				/ DEGREES_TO_RADIANS,
				saros : saros(TT_JD,
				// push saros series
				phase === 0 ? TYPE_SOLAR : TYPE_LUNAR)
			};
		}
		// return maybe has eclipse.
		return eclipse_data;
	}

	_.eclipse_JD = eclipse_JD;

	/**
	 * get JD of lunar phase. Using full LEA-406a or LEA-406b model.
	 * 計算特定月相之時間精準值。可用來計算月相、日月合朔(黑月/新月)、弦、望(滿月，衝)、月食、月齡。
	 * 
	 * @deprecated using accurate_lunar_phase()
	 * 
	 * @param {Number}year_month
	 *            帶小數點的年數，例如1987.25表示1987年3月末。
	 * @param {Integer}phase
	 *            0:朔0°, 1:上弦90°, 2:望180°, 3:下弦270°
	 * @param {Object}[options]
	 *            附加參數/設定特殊功能與選項
	 * 
	 * @returns {Number} Julian date (JD of 天文計算用時間 TT)
	 * 
	 * @see http://koyomi8.com/sub/sunmoon_long.htm
	 * @see http://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/phenom_phase.cgi
	 * @see http://homepage3.nifty.com/ayumi_ho/moon1.htm
	 * @see http://www2s.biglobe.ne.jp/~yoss/moon/moon.html
	 * 
	 * @deprecated
	 */
	function deprecated_accurate_lunar_phase
	//
	(year_month, phase, options) {
		var up_degrees, low_degrees,
		// 內插法(線性插值)上下限。
		up_JD, low_JD,
		// 目標角度。
		degrees = phase * 90,
		// 利用平月相的時間，以取得內插法初始近似值。
		TT_JD = mean_lunar_phase(year_month, phase, options),
		// 計算月日視黃經差。
		angle = // options
		//
		// && typeof options.angle === 'function' ? options.angle :
		//
		degrees < 90 ? function(_JD) {
			// window.lunar_count = (window.lunar_count || 0) + 1;
			var d = lunar_phase_angle_of_JD(_JD || TT_JD, true);
			if (d > TURN_TO_DEGREES - 90)
				d -= TURN_TO_DEGREES;
			return d;
		} : function(_JD) {
			return lunar_phase_angle_of_JD(_JD || TT_JD, true);
		},
		// 誤差常於2°之內。
		result_degrees = angle();

		// / 12: 月日視黃經差每日必於 12°–13°之內。
		// 因此每度耗時必小於 1/12 日。此處取最大值。
		if (degrees < result_degrees) {
			// 將 TT_JD 作為上限。
			up_JD = TT_JD, up_degrees = result_degrees;
			// 以 result 反推出一個<b>一定</b>小於目標 TT_JD 之下限。
			low_JD = TT_JD - (result_degrees - degrees) / 12;
			low_degrees = angle(low_JD);
		} else {
			// 將 TT_JD 作為下限。
			low_JD = TT_JD, low_degrees = result_degrees;
			// 以 result 反推出一個<b>一定</b>大於目標 TT_JD 之上限。
			up_JD = TT_JD - (result_degrees - degrees) / 12;
			up_degrees = angle(up_JD);
		}

		library_namespace.debug(
		//
		'初始值: year ' + year_month + ', phase ' + phase
		//
		+ ' (' + degrees + '°): JD' + TT_JD + ' ('
		//
		+ library_namespace.JD_to_Date(UT_of(TT_JD)).format('CE') + '), '
				+ format_degrees(result_degrees) + '; JD: ' + low_JD + '–'
				+ up_JD, 2);

		// 內插法 main loop
		while (low_JD < up_JD) {
			// 估值
			TT_JD = low_JD + (up_JD - low_JD)
			//
			* (degrees - low_degrees) / (up_degrees - low_degrees);
			result_degrees = angle();

			if (result_degrees < degrees) {
				if (low_JD === TT_JD) {
					// 已經得到相當好的效果。
					break;
					// 也可以改變另一項。但效果通常不大，反而浪費時間。
					up_JD = (low_JD + up_JD) / 2;
					up_degrees = angle(up_JD);
				} else {
					low_JD = TT_JD;
					low_degrees = result_degrees;
				}
			} else if (result_degrees > degrees) {
				if (up_JD === TT_JD) {
					// 已經得到相當好的效果。
					break;
					// 也可以改變另一項。但效果通常不大，反而浪費時間。
					low_JD = (low_JD + up_JD) / 2;
					low_degrees = angle(low_JD);
				} else {
					up_JD = TT_JD;
					up_degrees = result_degrees;
				}
			} else
				break;
		}

		library_namespace.debug('JD' + TT_JD + ' ('
		//
		+ library_namespace.JD_to_Date(UT_of(TT_JD)).format('CE')
		//
		+ '): ' + format_degrees(angle(TT_JD)), 2);

		// apply ΔT: TT → UT.
		return options && options.UT ? UT_of(TT_JD) : TT_JD;
	}

	/**
	 * get JD of lunar phase. Using full LEA-406a or LEA-406b model.
	 * 計算特定月相之時間精準值。可用來計算月相、日月合朔(黑月/新月)、弦、望(滿月，衝)、月食、月齡。
	 * 
	 * @param {Number}year_month
	 *            帶小數點的年數，例如1987.25表示1987年3月末。
	 * @param {Integer}phase
	 *            0:朔0°, 1:上弦90°, 2:望180°, 3:下弦270°
	 * @param {Object}[options]
	 *            附加參數/設定特殊功能與選項
	 * 
	 * @returns {Number} Julian date (JD of 天文計算用時間 TT)
	 * 
	 * @see http://koyomi8.com/sub/sunmoon_long.htm
	 * @see http://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/phenom_phase.cgi
	 * @see http://homepage3.nifty.com/ayumi_ho/moon1.htm
	 * @see http://www2s.biglobe.ne.jp/~yoss/moon/moon.html
	 */
	function accurate_lunar_phase
	//
	(year_month, phase, options) {
		var
		// 目標角度。
		degrees = phase * 90,
		// 利用平月相的時間，以取得內插法初始近似值。
		TT_JD = mean_lunar_phase(year_month, phase, options),
		// 計算月日視黃經差。
		angle = // options
		//
		// && typeof options.angle === 'function' ? options.angle :
		//
		degrees < 90 ? function(TT_JD) {
			// window.lunar_count = (window.lunar_count || 0) + 1;
			var d = lunar_phase_angle_of_JD(TT_JD, true);
			if (d > TURN_TO_DEGREES - 90)
				d -= TURN_TO_DEGREES;
			return d;
		} : function(TT_JD) {
			return lunar_phase_angle_of_JD(TT_JD, true);
		},
		// 誤差常於2°之內。
		result_degrees = angle(TT_JD);

		TT_JD = library_namespace.find_root(
				'count' in options ? function(TT_JD) {
					options.count++;
					return angle(TT_JD);
				} : angle,
				// / 12: 月日視黃經差每日必於 12°–13°之內。
				// 因此每度耗時必小於 1/12 日。此處取最大值。
				TT_JD - (result_degrees - degrees) / 12, TT_JD, degrees, {
					y1 : result_degrees
				});

		library_namespace.debug(
		//
		'JD' + TT_JD + ' ('
		//
		+ library_namespace.JD_to_Date(UT_of(TT_JD)).format('CE')
		//
		+ '): ' + format_degrees(angle(TT_JD)), 2);

		// apply ΔT: TT → UT.
		return options && options.UT ? UT_of(TT_JD) : TT_JD;
	}

	// phase: 0:朔0°, 1:上弦90°, 2:望180°, 3:下弦270°
	// lunar_phase_cache[year][phase:0–3] = [JD of 日常生活時間 UT, JD, ...]
	var lunar_phase_cache = [];

	/**
	 * get JD of lunar phases. 取得整年之月相。
	 * 
	 * 注意: 中曆2057年9月朔日 為 2057/9/28 UTC+8，與 香港天文台 (
	 * http://www.weather.gov.hk/gts/time/conversionc.htm )、兩千年中西曆轉換 (
	 * http://sinocal.sinica.edu.tw/ ) 不相同。<br />
	 * According to HORIZONS (DE-431), it's about 9/28 19:54 (月亮追過太陽) or 9/29
	 * 00:08 (視角度差最小).
	 * 
	 * 中曆2089年8月朔日 為 2089/9/4 UTC+8，與 兩千年中西曆轉換 不相同。<br />
	 * 中曆2097年7月朔日 為 2097/8/7 UTC+8，與 兩千年中西曆轉換 不相同。<br />
	 * 2000–2100 不合者如上。
	 * 
	 * @param {Number}year
	 *            年數
	 * @param {Integer}phase
	 *            0:朔0°, 1:上弦90°, 2:望180°, 3:下弦270°
	 * @param {Object}[options]
	 *            附加參數/設定特殊功能與選項:<br />
	 *            {Boolean}options.mean: 是否採用平月相。 false: 採用精準值。<br />
	 *            {Integer}options.duration: 取得年數<br />
	 *            {Boolean}options.to_Date: return Date<br />
	 *            {String|Object}options.format: 將 Date 轉成特定 format
	 * 
	 * @returns {Array} [ Julian date (JD of 日常生活時間 UT), JD, ... ]
	 */
	function lunar_phase(year, phase, options) {
		if (year === (year | 0)) {
			if (options === true)
				options = 1;
			if (options > 0 && (options === options | 0))
				// 取得整年之月相。
				options = {
					duration : options
				};
		}
		// 前置處理。
		if (!library_namespace.is_Object(options))
			options = Object.create(null);

		var operator, UT_JD;
		if (typeof options.mean === 'boolean')
			operator = options.mean ? mean_lunar_phase : accurate_lunar_phase;
		// whole year
		// options.duration = 1
		// 2 years:
		// options.duration = 2
		if (!options.duration) {
			UT_JD = UT_of((operator || accurate_lunar_phase)(year, phase,
					options));
			return UT_JD;
		}

		var phase_JD = [];

		year |= 0;
		phase |= 0;
		for (var phase_data,
		//
		end = year + options.duration; year < end; year++) {
			// using cache.
			phase_data = lunar_phase_cache[year];
			if (!phase_data)
				// 初始化。
				lunar_phase_cache[year] = phase_data = [];

			if (phase_data = phase_data[phase])
				// has cache. using clone.
				phase_data = phase_data.slice();
			else {
				phase_data = [];
				for (var year_month = year, date, hours;;
				// 0.08: 1 / 12 = .08333333333333
				year_month = Julian_century(TT_of(UT_JD)) * 100 + 2000
				// year_month 加此值以跳到下一個月。
				+ mean_lunar_phase_days / (DAYS_OF_JULIAN_CENTURY / 100)) {
					UT_JD = UT_of((operator || mean_lunar_phase)(year_month,
							phase, options));
					date = library_namespace.JD_to_Date(UT_JD);
					if (!operator
					// auto: 在特別可能有問題的時候採用精準值。
					&& ((hours = date.getHours()) < 2 || hours > 21)) {
						UT_JD = UT_of(accurate_lunar_phase(year_month, phase,
								options));
						date = library_namespace.JD_to_Date(UT_JD);
					}
					date = date.getFullYear();
					if (date === year)
						phase_data.push(UT_JD);
					else if (date - year === 1) {
						phase_data.end = UT_JD;
						// 已經算到次年了。
						break;
					}
				}
				if (options.mean === false)
					lunar_phase_cache[year][phase]
					// using clone.
					= phase_data.slice();
			}

			if (options.to_Date)
				phase_data.forEach(function(UT_JD, index) {
					UT_JD = library_namespace.JD_to_Date(UT_JD);
					if (options.format)
						UT_JD = UT_JD.format(options.format);
					phase_data[index] = UT_JD;
				});
			phase_JD.push(phase_data);
		}

		return options.duration === 1 ? phase_JD[0] : phase_JD;
	}

	_.lunar_phase = lunar_phase;

	/**
	 * get lunar phase of JD. 取得 JD 之月相。
	 * 
	 * @param {Number}UT_JD
	 *            Julian date of local midnight (00:00) (JD of 日常生活時間 UT)
	 * @param {Object}[options]
	 *            附加參數/設定特殊功能與選項:<br />
	 *            {Boolean}options.time: 取得月相時，亦取得時刻。<br />
	 *            {Boolean|String}options.晦: 顯示晦。<br />
	 *            {Boolean}options.index: 顯示 index 而非名稱。<br />
	 *            {Boolean}options.TT: date is TT instead of UT.
	 * 
	 * @returns {Number} phase: 0:朔0°, 1:上弦90°, 2:望180°, 3:下弦270°
	 */
	function lunar_phase_of_JD(UT_JD, options) {
		// 前置處理。
		if (!library_namespace.is_Object(options))
			options = Object.create(null);

		var TT_JD;
		if (options.TT)
			UT_JD = UT_of(TT_JD = UT_JD);
		else
			TT_JD = TT_of(UT_JD);

		// 隔日子夜0時剛開始之月相。
		// 90: TURN_TO_DEGREES / 4相 = 360 / 4
		var _phase = lunar_phase_angle_of_JD(TT_JD + 1) / 90;
		if (isNaN(_phase)) {
			library_namespace.debug('資料還沒載入。', 2);
			return;
		}

		var phase = Math.floor(_phase);

		// 假如變換剛好落在隔日子夜0時剛開始(這機率應該極低)，則今日還是應該算前一個。
		// 因為月相長度大於日長度，此即表示今天還沒變換月相。
		if (phase !== _phase
		// 檢查今天子夜0時與明日子夜0時是否有改變月相。
		&& phase !== (_phase = Math.floor(lunar_phase_angle_of_JD(TT_JD) / 90))) {
			// UT_JD, UT_JD+1 有不同月相，表示這天中改變了月相。
			// phase: −2–1
			if (phase < 0)
				phase += 4;
			// phase: 0–3
			var phase_shown = options.index ? phase : LUNAR_PHASE_NAME[phase];
			if (options.time || options.eclipse) {
				// 發生此月相之實際 TT in JD.
				var TT = accurate_lunar_phase(
						Julian_century(TT_JD) * 100 + 2000, phase, {
							JD : TT_JD,
							// eclipse : true,
							nearest : true
						});
				phase_shown = [ phase_shown, UT_of(TT) ];
				/**
				 * @see
				 * 
				 * Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版<br />
				 * p. 380. chapter 54
				 * 
				 * If F differs from the nearest multiple of 180° by less than
				 * 13.9 degrees, then there is certainly an eclipse; ifthe
				 * difference is larger than 21°, there is no eclipse;
				 * 
				 * Use can be made of the following rule: there is no eclipse if
				 * |sin F| > 0.36.
				 */
				if (options.eclipse
				// 0:朔才可能日食, 2:望才可能月食
				&& (phase === 0 || phase === 2)) {
					/**
					 * 日月食資訊。
					 * 
					 * @type {Object}
					 */
					var eclipse_data
					//
					= eclipse_JD(TT, phase, options);

					if (eclipse_data) {
						// 遮到了。
						phase_shown.push(eclipse_data);
					}
				}
			}
			// [ phase type index, UT (JD), eclipse_data ]
			return phase_shown;
		}

		if (options.晦 && phase === -1 && 0 ===
		// +2: 晦日午夜之2天之後(之午夜)恰好過朔。phase: -1 → -1 → 0
		Math.floor(lunar_phase_angle_of_JD(TT_JD + 2) / 90))
			return options.晦 === true ? '晦' : options.晦;
	}

	_.lunar_phase_of_JD = lunar_phase_of_JD;

	// ------------------------------------------------------------------------------------------------------//
	// 制曆/排曆/排陰陽曆譜
	// 中國傳統曆法是一種陰陽合曆，以月相定月份，以太陽定年周期。
	// TODO: 孫郁興 中國各朝曆法及其基數變遷: 沈括提出以「十二氣」為一年的曆法，十二氣曆

	/**
	 * normalize minute offset.
	 * 
	 * @param {Number}minute_offset
	 *            time-zone offset from UTC in minutes.<br />
	 *            e.g., UTC+8: 8 * 60 = 480
	 * 
	 * @returns {Number} normalized minute offset
	 */
	function normalize_minute_offset(minute_offset) {
		return isNaN(minute_offset) ? default_offset : minute_offset;
	}

	/**
	 * JD (UT) to local midnight (00:00).
	 * 
	 * @param {Number}UT_JD
	 *            Julian date (JD of 日常生活時間 UT)
	 * @param {Number}[minute_offset]
	 *            time-zone offset from UTC in minutes.<br />
	 *            e.g., UTC+8: 8 * 60 = +480. default: UTC+0.
	 * @param {Boolean}[get_local_Date]
	 *            轉成當地之 Date
	 * 
	 * @returns {Number|Date}
	 */
	function midnight_of(UT_JD, minute_offset, get_local_Date) {
		// -day_offset: to local (UT_JD+.5). 此時把 local 當作 UTC+0.
		// Math.floor(): reset to local midnight, 00:00
		// +day_offset: recover to UTC
		var day_offset = (minute_offset | 0) / (ONE_DAY_HOURS * 60) - .5;
		UT_JD = Math.floor(UT_JD + day_offset) - day_offset;

		if (get_local_Date) {
			UT_JD = library_namespace.JD_to_Date(
			//
			UT_JD + (minute_offset - default_offset) / (60 * ONE_DAY_HOURS));
			// 歸零用。
			var ms = UT_JD.getMilliseconds();
			// 歸零。
			if (ms)
				UT_JD.setMilliseconds(Math.round(ms / 500) * 500);
		}

		return UT_JD;
	}

	_.midnight_of = midnight_of;

	/**
	 * 冬至序 = 18
	 * 
	 * @type {Integer}
	 */
	var 冬至序 = SOLAR_TERMS_NAME.indexOf('冬至');

	/**
	 * 取得整年之月首朔日/月齡。
	 * 
	 * 注意：若中氣發生於朔時刻之前、朔日當日子夜後，如清世祖順治2年閏6月1日，此中氣會被算做發生於當日，而非前一個月之晦日；因此閏月基本上會被排在上一個月而非本月。
	 * 
	 * @param {Integer}CE_year
	 *            公元年數
	 * @param {Number}minute_offset
	 *            time-zone offset from UTC in minutes.<br />
	 *            e.g., UTC+8: 8 * 60 = 480
	 * 
	 * @returns {Array} 年朔日 = [ [ Julian date (JD of 日常生活時間 UT), JD, ...], 冬至所在月 ]
	 */
	function 子月序(CE_year, minute_offset) {
		minute_offset = normalize_minute_offset(minute_offset);

		// 冬至所在月為十一月，之後為十二月、正月、二月……復至十一月。
		var 冬至 = solar_term_JD(CE_year, 冬至序),
		// 取得整年之朔日。依現行農曆曆法，每年以朔分月（朔日為每月初一）。
		年朔日 = lunar_phase(CE_year, 0, {
			duration : 1,
			mean : false
		})
		// 魯僖公五年正月壬子朔旦冬至
		.map(function(UT_JD) {
			// 日月合朔時間 → 朔日0時
			return midnight_of(UT_JD, minute_offset);
		});
		年朔日.冬至 = 冬至;

		var index = 年朔日.search_sorted(冬至, true);
		// assert: 冬至 >= 年朔日[index];

		return [ 年朔日, index ];
	}

	/**
	 * 取得歲首(建正/年始)為建子之整年月首朔日/月齡。
	 * 
	 * @param {Integer}年
	 *            基本上與公元年數同步。 e.g., 2000: 1999/12/8–2000/11/25
	 * @param {Number}minute_offset
	 *            time-zone offset from UTC in minutes.<br />
	 *            e.g., UTC+8: 8 * 60 = 480
	 * 
	 * @returns {Array} 年朔日 = [ {Number}朔日JD, 朔日JD, ... ]
	 */
	function 建子朔日(年, minute_offset) {
		minute_offset = normalize_minute_offset(minute_offset);

		var 朔日 = 子月序(年 - 1, minute_offset),
		//
		次年朔日 = 子月序(年, minute_offset);

		朔日[0].splice(0, 朔日[1]);
		朔日 = 朔日[0].concat(次年朔日[0].slice(0, 次年朔日[1]));
		朔日.end = 次年朔日[0][次年朔日[1]];

		if (朔日.length === 13) {
			// 確定/找閏月。
			// 若兩冬至間有13個月（否則應有12個月），則置閏於冬至後第一個沒中氣的月，月序與前一個月相同（閏月在幾月後面，就稱閏幾月）。
			var 中氣, 中氣序 = 冬至序 + 2, 閏 = 1, year = 年 - 1;
			for (; 中氣序 !== 冬至序; 中氣序 += 2) {
				if (中氣序 === SOLAR_TERMS_NAME.length)
					year++, 中氣序 -= SOLAR_TERMS_NAME.length;
				中氣 = solar_term_JD(year, 中氣序);
				朔日[SOLAR_TERMS_NAME[中氣序]] = 中氣;
				if (中氣 >= 朔日[閏]
				// 測中氣序: 朔日[閏]: 沒中氣的月
				&& 中氣 >= 朔日[++閏]) {
					閏--;
					// CeL.JD_to_Date(1727046.1666666667).format('CE')
					// CeL.JD_to_Date(1727076.9971438504).format('CE')
					library_namespace.debug('沒中氣的月: 朔日[' + 閏 + '] = ' + 朔日[閏]
							+ ', 中氣 ' + 中氣, 3);
					break;
				}
			}
			朔日.閏 = 閏;
		} else if (朔日.length !== 12)
			library_namespace.error(年 + '年有' + 朔日.length + '個月!');

		// [ {Number}朔日JD, 朔日JD, ... ].閏 = {Boolean};
		return 朔日;
	}

	/**
	 * 年朔日 = 朔日_cache[ 年 + '/' + minute_offset ]<br /> = [ {Number}朔日JD, 朔日JD,
	 * ... ]<br />
	 * e.g., [ 1727075.1666666667, 1727104.1666666667, ... ]
	 * 
	 * 年朔日.閏 = {Boolean};
	 * 
	 * @inner
	 */
	var 朔日_cache = [];

	/**
	 * clone 曆數
	 * 
	 * @param {String}index
	 *            cache index
	 * @param {Object}options
	 *            options
	 * @param {Array}[朔日]
	 *            本初年朔日曆數
	 * 
	 * @returns {Array} 年朔日曆數
	 * 
	 * @inner
	 */
	function clone_朔日(index, options, 朔日) {
		library_namespace.debug('Get cache index [' + index
				+ '] (年 /歲首/minute_offset)');
		if (朔日)
			朔日_cache[index] = 朔日;
		else if (!(朔日 = 朔日_cache[index]))
			return;

		if (options.月名 && !朔日.月名)
			朔日.月名 = 定朔.月名(朔日);

		var clone = 朔日.slice();
		clone.end = 朔日.end;
		if (options.月名)
			// 添加月名
			clone.月名 = 朔日.月名.slice();
		if (朔日.閏)
			clone.閏 = 朔日.閏;

		return clone;
	}

	/**
	 * 以定氣定朔法排曆，編排中國傳統曆法（陰陽曆），取得整年月首朔日/月齡。
	 * 
	 * @param {Integer}年
	 *            基本上與公元年數同步。 e.g., 2000: 1999/12/8–2000/11/25
	 * @param {Object}[options]
	 *            附加參數/設定特殊功能與選項:<br />
	 *            {Number}options.minute_offset: time-zone offset from UTC in
	 *            minutes.<br />
	 *            e.g., UTC+8: 8 * 60 = 480<br />
	 *            {String|Integer}options.歲首: 年始之地支/地支序(0:子)<br />
	 *            {Integer}options.year_offset: 年數將自動加上此 offset。<br />
	 *            {Boolean}options.月名: 順便加上 .月名 = [ 月名 ]
	 * 
	 * @returns {Array} 年朔日 = [ {Number}朔日JD, 朔日JD, ... ]
	 */
	function 定朔(年, options) {
		if (!LEA406_loaded('V'))
			// 尚未載入指定天體/行星的計算數據。而採用低精度之誤差過大，不能用。
			return;

		// 前置處理。
		if (!library_namespace.is_Object(options))
			options = Object.create(null);

		var 歲首 = options.歲首,
		//
		minute_offset = options.minute_offset;

		if (library_namespace.is_Date(年)) {
			if (isNaN(minute_offset))
				minute_offset = 年[
				// see data.date.era
				library_namespace.era.MINUTE_OFFSET_KEY];
			年 = Math.round(年.getFullYear() + 年.getMonth() / 12);
		}

		minute_offset = normalize_minute_offset(minute_offset);

		if (!isNaN(options.year_offset))
			年 += options.year_offset;

		if (isNaN(歲首) && NOT_FOUND ===
		//
		(歲首 = library_namespace.BRANCH_LIST.indexOf(歲首))) {
			if (定朔.歲首 && isNaN(定朔.歲首)) {
				定朔.歲首 = library_namespace.BRANCH_LIST.indexOf(定朔.歲首);
				if (定朔.歲首 === NOT_FOUND) {
					library_namespace.warn('定朔: Invalid 歲首');
					定朔.歲首 = undefined;
				}
			}
			歲首 = 定朔.歲首;
		}

		// 至此已確定: 年, 歲首, minute_offset.

		var cache_index = 年 + '/' + 歲首 + '/' + minute_offset,
		//
		朔日 = clone_朔日(cache_index, options);
		if (朔日)
			return 朔日;

		朔日 = 建子朔日(年, minute_offset);

		if (歲首 === 0)
			return clone_朔日(cache_index, options, 朔日);

		var 閏 = 朔日.閏 - 歲首;
		library_namespace.debug('歲首 ' + 歲首 + ', ' + 朔日.閏 + ', 閏=' + 閏, 3);
		// 此處已清掉(朔日.閏)
		朔日 = 朔日.slice(閏 <= 0 ? 歲首 + 1 : 歲首);
		if (閏 > 0)
			朔日.閏 = 閏;

		var 次年朔日 = 建子朔日(年 + 1, minute_offset);
		library_namespace.debug('次年 ' + 歲首 + ', ' + 次年朔日.閏, 3);
		閏 = 次年朔日.閏;
		var index = 閏 <= 歲首 ? 歲首 + 1 : 歲首,
		//
		end = 次年朔日[index];
		library_namespace.debug(
		//
		'end[' + index + ']=' + 次年朔日[index], 3);
		次年朔日 = 次年朔日.slice(0, index);
		if (閏 <= 歲首)
			if (朔日.閏)
				// 這將造成無法阻絕一年內可能有兩閏月，以及一年僅有11個月的可能。
				library_namespace.error(年 + '年有兩個閏月!!');
			else
				朔日.閏 = 閏 + 朔日.length;

		閏 = 朔日.閏;
		library_namespace.debug('閏=' + 閏, 3);
		// 此處會清掉(朔日.閏)
		朔日 = 朔日.concat(次年朔日);
		朔日.end = end;
		if (閏)
			朔日.閏 = 閏;

		return clone_朔日(cache_index, options, 朔日);
	}

	// default 預設歲首為建寅
	// 正謂年始，朔謂月初，言王者得政，示從我始，改故用新，隨寅、丑、子所建也。周子，殷丑，夏寅，是改正也；周夜半，殷雞鳴夏平旦，是易朔也。
	定朔.歲首 = '寅';

	定朔.月名 = function(年朔日) {
		var 閏 = 年朔日.閏, 月序 = 0;
		library_namespace.debug('閏=' + 閏, 3);
		return 年朔日.map(function(朔, index) {
			return index === 閏 ? '閏' + 月序 : ++月序;
		});
	};

	_.定朔 = 定朔;

	/**
	 * 取得指定日期之夏曆。
	 * 
	 * @param {Date}date
	 *            指定日期。
	 * @param {Object}[options]
	 *            附加參數/設定特殊功能與選項:<br />
	 * 
	 * @returns {Array} [ 年, 月, 日 ]
	 */
	function 夏曆(date, options) {
		if (!LEA406_loaded('V'))
			// 採用低精度之誤差過大，不能用。
			return;

		var JDN = library_namespace.Julian_day(date),
		//
		年朔日 = {
			月名 : true
		};
		options = options ? Object.assign(年朔日, options) : 年朔日;
		options.year_offset |= 0;
		年朔日 = 定朔(date, options);

		if (JDN < 年朔日[0]) {
			// date 實際上在上一年。
			options.year_offset--;
			年朔日 = 定朔(date, options);
		} else if (JDN >= 年朔日.end) {
			// date 實際上在下一年。
			options.year_offset++;
			年朔日 = 定朔(date, options);
		}

		var index = 年朔日.search_sorted(JDN, true);

		// [ 年, 月, 日 ]
		return [ date.getFullYear() + options.year_offset, 年朔日.月名[index],
				1 + JDN - 年朔日[index] | 0 ];
	}

	_.夏曆 = 夏曆;

	// ------------------------------------------------------------------------------------------------------//
	// 天體的升、中天、降

	/**
	 * 計算天體的升（出:星面頂之緯度負→正）、上中天（該天體正經過當地子午圈，但與緯度最高點的位置當有些微差別）、降（沒:星面底之緯度正→負）時刻。
	 * 天体の出没 e.g., 日出正午日落,太陽升降。 約有兩三分的精準度?
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版<br />
	 * Chapter 15 Rising, Transit, and Setting
	 * 
	 * @param {Array}local
	 *            the observer's geographic location [ latitude (°), longitude
	 *            (°), time zone (e.g., UTC+8: 8), elevation or geometric height
	 *            (m) ]<br />
	 *            觀測者 [ 緯度（北半球為正,南半球為負）, 經度（從Greenwich向東為正，西為負）, 時區,
	 *            海拔標高(觀測者距海平面的高度) ]
	 * @param {Number}JDN
	 *            UT JDN
	 * @param {Number}type
	 *            0:lower culmination, 1:rise, 2:upper culmination, 3:set
	 * @param {String}object
	 *            天體 (e.g., planets 行星).
	 * @param {Boolean}force
	 *            即使預期應出現升降的時段，天體卻一直處於地平之同一側（同在地平線上或下），依然嘗試估算；取得即使不是當天，但符合的時點。
	 * 
	 * @returns {Number}UT JD
	 * 
	 * @see https://en.wikipedia.org/wiki/Sunrise_equation
	 *      https://en.wikipedia.org/wiki/Culmination
	 *      http://www.zhihu.com/question/23423763
	 *      http://www.astronomy.com.cn/bbs/thread-157520-1-1.html<br />
	 *      于Paul Schlyter的1992年的sunriset函数
	 *      http://www.spectralcalc.com/solar_calculator/solar_position.php
	 */
	function rise_set(local, JDN, type, object, force) {
		if (!object)
			object = SUN_NAME;
		if (type) {
			if (typeof type !== 'number' && !isNaN(type))
				type = +type;
		} else if (!type && type !== 0)
			// get [ 0下中天, 1升, 2上中天, 3降 ]
			type = [ 0, 1, 2, 3 ];
		if (Array.isArray(type)) {
			return type.map(function(type) {
				return rise_set(local, JDN, type, object, force);
			});
		}

		function angle(TT_JD) {
			coordinates = get_coordinates(TT_JD, {
				local : local,
				object : object
			});
			var angle = type % 2 === 1 || type > 3 ? coordinates.Alt + Δ
			// 上中天: LHA: 2π → 應為0
			// 下中天: LHA: 應為π
			: normalize_radians(coordinates.LHA + Δ, true);

			// 常需演算十數次。
			if (false)
				console.log(TT_JD + ' ('
				//
				+ library_namespace.JD_to_Date(TT_JD).format('CE') + ' TT): '
						+ angle);
			return angle;
		}

		var Δ, get_coordinates, coordinates,
		// 自動判別時區。
		zone = get_time_zone(local);

		// UT_JD: local 當地之 0:0
		var UT_JD = JDN - .5 - zone / ONE_DAY_HOURS,
		// hour 上下限
		hour0, hour1;

		// TODO: 考慮 dip of the horizon (地平俯角, 海岸視高差)
		// @see
		// https://en.wikipedia.org/wiki/Horizon#Effect_of_atmospheric_refraction
		// http://www-rohan.sdsu.edu/~aty/explain/atmos_refr/altitudes.html

		if (object === SUN_NAME) {
			Δ = SOLAR_RADIUS_RADIANS;
			get_coordinates = solar_coordinates;

		} else {
			get_coordinates = object === MOON_NAME ? lunar_coordinates
					: object_coordinates;
			coordinates = get_coordinates(TT_of(UT_JD), {
				local : local,
				object : object
			});

			// UT_JD 與上一個上中天之距離 (in days, 0~1)。
			Δ = normalize_radians(coordinates.LHA) / TURN_TO_RADIANS;

			// 決定要使用的下中天。

			// 確認最靠近 UT_JD 的下中天。
			if (Δ < .5) {
				// 正常情況:下中天 在本日上半天。
			} else {
				// 下中天 在前一日下半天。

				// TODO: 本日 0:0 後首個下中天。
				// UT_JD += 1;

				// 取前一個下中天。
			}

			UT_JD += .5 - Δ;

			Δ = object === MOON_NAME
			// http://aa.usno.navy.mil/faq/docs/RST_defs.php
			// Moon's apparent radius varies from 15 to 17 arcminutes
			// and its horizontal parallax varies from 54 to 61
			// arcminutes.
			? Math.atan(LUNAR_RADIUS_M / AU_TO_METERS / coordinates.Δ)
			// 其他天體之 apparent radius 當作0。
			: 0;
		}

		// Δ: 天體之 apparent radius (in radians)

		switch (type) {
		case 0:
			// 下中天
			hour0 = -2;
			hour1 = 2;
			Δ = -TURN_TO_RADIANS / 2;
			break;
		case 2:
			// 上中天, 過中天
			hour0 = ONE_DAY_HOURS / 2 - 2;
			hour1 = ONE_DAY_HOURS / 2 + 2;
			Δ = 0;
			break;

		case 1:
			// 升
			// http://tamweb.tam.gov.tw/v3/tw/content.asp?mtype=c2&idx=1255
			// 夏至並非一年中日出最早、日落最晚之時
			hour0 = 0;
			hour1 = ONE_DAY_HOURS / 2;
			break;
		case 3:
			// 降
			hour0 = ONE_DAY_HOURS / 2;
			hour1 = ONE_DAY_HOURS;
			break;

		// civil twilight, nautical twilight, astronomical twilight
		case 4:
		case 5:
		case 6:
			hour0 = 0;
			hour1 = ONE_DAY_HOURS / 2;
			Δ = (7 - type) * 6 * DEGREES_TO_RADIANS;
			break;

		case 7:
		case 8:
		case 9:
			hour0 = ONE_DAY_HOURS / 2;
			hour1 = ONE_DAY_HOURS;
			Δ = (type - 6) * 6 * DEGREES_TO_RADIANS;
			break;

		default:
			throw new Error('rise_set: Invalid type: [' + type + ']');
		}

		/**
		 * 天文/航海/民用曙暮光(晨起天亮/晚上天黑)時刻。
		 * http://aa.usno.navy.mil/faq/docs/RST_defs.php
		 * <q>Civil twilight is defined to begin in the morning, and to end in the evening when the center of the Sun is geometrically 6 degrees below the horizon.</q>
		 * <br />
		 * <q>Nautical twilight is defined to begin in the morning, and to end in the evening, when the center of the sun is geometrically 12 degrees below the horizon.</q>
		 * <br />
		 * <q>Astronomical twilight is defined to begin in the morning, and to end in the evening when the center of the Sun is geometrically 18 degrees below the horizon.</q>
		 * <br />
		 */

		// 檢測分布
		if (false)
			for (var m = 0; m < 4 * 60; m++)
				angle(TT_of(UT_JD + hour0 / ONE_DAY_HOURS + m / ONE_DAY_HOURS
						/ 60));

		UT_JD = UT_of(library_namespace.find_root(angle, TT_of(UT_JD + hour0
				/ ONE_DAY_HOURS), TT_of(UT_JD + hour1 / ONE_DAY_HOURS), 0,
		// 即使預期應出現升降的時段，天體卻一直處於地平之同一側(同在地平線上或下)，依然嘗試估算。
		force ? null : {
			start_OK : function(y0, y1) {
				// console.log([ y0, y1 ]);
				return Math.sign(y0) !== Math.sign(y1);
			}
		}));

		// 出沒方位角。
		coordinates.Az;
		// 過中天仰角。
		coordinates.Alt;

		return UT_JD;
	}

	_.rise_set = rise_set;

	/**
	 * name of type rise_set() gets.<br />
	 * <q>下中天,升,上中天,降</q>
	 * 
	 * @type {Array}
	 */
	rise_set.type_name = [
	// gettext_config:{"id":"lower-culmination"}
	"lower culmination",
	// gettext_config:{"id":"sunrise","mark_type":"combination_message_id"}
	// gettext_config:{"id":"moonrise","mark_type":"combination_message_id"}
	"rise",
	// gettext_config:{"id":"upper-culmination"}
	"upper culmination",
	// gettext_config:{"id":"sunset","mark_type":"combination_message_id"}
	// gettext_config:{"id":"moonset","mark_type":"combination_message_id"}
	"set" ];

	'astronomical,nautical,civil'.split(',')
	//
	.forEach(function(twilight, index) {
		// gettext_config:{"id":"astronomical-twilight-begin","mark_type":"combination_message_id"}
		// gettext_config:{"id":"nautical-twilight-begin","mark_type":"combination_message_id"}
		// gettext_config:{"id":"civil-twilight-begin","mark_type":"combination_message_id"}
		rise_set.type_name[4 + index] = twilight + ' twilight begin';
		// gettext_config:{"id":"astronomical-twilight-end","mark_type":"combination_message_id"}
		// gettext_config:{"id":"nautical-twilight-end","mark_type":"combination_message_id"}
		// gettext_config:{"id":"civil-twilight-end","mark_type":"combination_message_id"}
		rise_set.type_name[9 - index] = twilight + ' twilight end';
	});

	// ------------------------------------------------------------------------------------------------------//
	// coordinates 統合 API

	/**
	 * 太陽名稱。
	 * 
	 * @type {String}
	 */
	var SUN_NAME = 'sun'.toLowerCase(),
	/**
	 * 月亮名稱。
	 * 
	 * @type {String}
	 */
	MOON_NAME = 'moon'.toLowerCase();

	/**
	 * 天體位置統合 API。
	 * 
	 * @param {String}object
	 *            天體名稱 (planets 行星).
	 * @param {Nunber|String|Date}date
	 *            UT (or TT).
	 * @param {Array}local
	 *            the observer's geographic location [ latitude (°), longitude
	 *            (°), time zone (e.g., UTC+8: 8), elevation or geometric height
	 *            (m) ]<br />
	 *            觀測者 [ 緯度（北半球為正,南半球為負）, 經度（從Greenwich向東為正，西為負）, 時區,
	 *            海拔標高(觀測者距海平面的高度) ]
	 * @param {Object}[options]
	 *            附加參數/設定特殊功能與選項:<br />
	 *            {Boolean}options.TT: date is TT instead of UT.
	 * 
	 * @constructor
	 */
	function Coordinates(object, date, local, options) {
		// object name
		this.object = object = Coordinates.normalize_object(object);
		// 先行載入必須的 terms。
		// 對 sun, moon 特別處理。
		if (object === MOON_NAME) {
			if (!LEA406_loaded('V'))
				LEA406_load_terms('V');
			if (!LEA406_loaded('U'))
				LEA406_load_terms('U');
			if (local && !LEA406_loaded('R'))
				LEA406_load_terms('R');
		} else if (object !== SUN_NAME) {
			object = VSOP87.object_name(object);
			if (!(object in VSOP87_terms))
				VSOP87_load_terms(object);
		}
		object = VSOP87.object_name(solar_terms_object);
		if (!(object in VSOP87_terms))
			VSOP87_load_terms(object);

		// use google map longitude latitude picker
		if (local)
			this.local = local;

		// 紀錄時間。
		this.JD = Number.isFinite(date) ? date : library_namespace.Julian_day
				.JD(date);
		if (options && options.TT)
			this.UT = UT_of(this.TT = this.JD);
		else
			this.TT = TT_of(this.UT = this.JD);
	}

	_.celestial_coordinates = Coordinates;

	Coordinates.object_alias = {
		solar : SUN_NAME,
		lunar : MOON_NAME
	};
	// normalize object name
	Coordinates.normalize_object = function(name) {
		name = name.toLowerCase();
		if (name in Coordinates.object_alias)
			name = Coordinates.object_alias[name];
		return name;
	};

	/**
	 * 設定 coordinates。
	 * 
	 * @param {String}type
	 *            one of DSGETH
	 * @param {Object}coordinates
	 *            coordinates get through get_horizontal()
	 * 
	 * @returns {Object}coordinates
	 * 
	 * @inner
	 */
	function set_coordinates(type, coordinates) {
		// reset property to cache.
		Object.defineProperty(this, type, {
			value : coordinates
		});
		return coordinates;
	}

	/**
	 * 一次把 E地心赤道, T站心赤道, H站心地平 全部設定完。
	 * 
	 * @param {Object}coordinates
	 *            coordinates get through get_horizontal()
	 * 
	 * @inner
	 */
	function set_horizontal_coordinates(coordinates) {
		this.s('E', [ normalize_radians(coordinates.α),
		//
		normalize_radians(coordinates.δ, true), coordinates.Δ ]);
		this.s('H', coordinates.Az ? [ normalize_radians(coordinates.Az),
				normalize_radians(coordinates.Alt, true) ]
		// 站心地平座標 .Az, .Alt 比較可能未設定。
		: undefined);
		// the equatorial horizontal parallax of the body in radians.
		// 天體的赤道地平視差.
		// CeL.format_radians(coordinates.π)
		if (coordinates.π)
			this.π = coordinates.π;
		// LHA: local hour angle (in radians) 本地地心時角。
		if (coordinates.LHA)
			this.LHA = coordinates.LHA;
		// elongation Ψ of the planet, its angular distance to the Sun
		// https://en.wikipedia.org/wiki/Elongation_%28astronomy%29
		// 行星的距角，即地心看行星與太陽的角距離。
		if (coordinates.Ψ)
			this.elongation = coordinates.Ψ;
		// semi-diameter (in arcseconds). 天體的中心視半徑。
		this.semidiameter = semidiameter(coordinates, this.object);
		this.s('T', (coordinates = coordinates.T) ? [
				normalize_radians(coordinates[0]),
				normalize_radians(coordinates[1], true) ]
		// coordinates.T 可能未設定。
		: undefined);
	}

	/**
	 * @inner
	 */
	function get_dimension(coordinates, type) {
		if (type.includes('longitude'))
			return coordinates[0];
		if (type.includes('latitude'))
			return coordinates[1];
		return coordinates;
	}

	/**
	 * 取得指定類型之座標。
	 * 
	 * @param {String}type
	 *            指定類型/symbols
	 * 
	 * @returns {Object|Number}座標
	 * 
	 * @see https://en.wikipedia.org/wiki/Celestial_coordinate_system#Coordinate_systems
	 */
	function get_coordinates(type) {
		if (typeof type === 'string' && type.includes(','))
			type = type.split(/,+/);
		if (Array.isArray(type))
			return type.map(get_coordinates.bind(this));

		type = String(type).toLowerCase().split(/[\s\-]+/).join(' ');
		if (type.includes('λ'))
			return this.G[0];
		if (type.includes('β'))
			return this.G[1];
		if (type.includes('distance'))
			return this.G[2];
		if (type.includes('α'))
			return this.E[0];
		// 注意: 'Δ'.toLowerCase() === 'δ'
		if (type.includes('δ'))
			return this.E[1];
		// Azimuth, Altitude
		if (type.includes('az'))
			return this.H && this.H[0];
		if (type.includes('alt'))
			return this.H && this.H[1];

		if (type.includes('dynamic'))
			return get_dimension(this.D, type);
		// after detect dynamical
		if (type.includes('heliocentric'))
			return get_dimension(this.S, type);

		if (type.includes('horizontal'))
			return get_dimension(this.H, type);
		// after detect horizontal
		if (type.includes('topocentric'))
			return get_dimension(this.T, type);

		// after detect heliocentric, topocentric
		if (type.includes('equatorial'))
			return get_dimension(this.E, type);
		// after detect equatorial
		if (type.includes('geocentric') || type.includes('ecliptic'))
			return get_dimension(this.G, type);

		// TODO: rectangular

		if ((type[0] in this)
		//
		&& typeof this[type[0]] !== 'function')
			return this[type[0]];

		// 只輸入經緯度時，預設當作 G地心視黃道: 地心視黃經/地心視黃緯
		type = get_dimension(this.G, type);
		if (typeof type === 'number')
			return type;
	}

	Object.defineProperties(Coordinates.prototype, {
		s : {
			enumerable : false,
			value : set_coordinates
		},
		sh : {
			enumerable : false,
			value : set_horizontal_coordinates
		},
		c : {
			value : get_coordinates
		}
	});

	// ----------------------------------------------------------------------------

	// 計算順序:
	// @see
	// https://github.com/kanasimi/IAU-SOFA/blob/master/doc/sofa_ast_c.pdf

	// :: VSOP87 進入點→
	// 日心黃道: D日心瞬時黃道 by VSOP87
	// (太陽: 日心黃道: FK5) (FK5 2選1)
	// (天體/行星: S日心視黃道:修正光行時及光行差) (修正光行時及光行差 2選1)
	// 地心直角黃道座標 = 天體S日心視黃道 - 地球S日心視黃道
	// G地心視黃道: 球座標
	// :: LEA406 進入點: 計算月亮位置(地心瞬時黃道坐標)
	// (天體/行星: G地心視黃道: FK5? why here?) (FK5 2選1)
	// (G地心視黃道: 修正月亮光行時及太陽光行差) (修正光行時及光行差 2選1)
	// G地心視黃道: 修正地球章動 nutation。
	//
	// E地心赤道座標:
	// topocentric(本地站心)(T站心赤道): 修正恆星時/經緯度/時角, 行星視差
	// H站心地平座標: 修正大氣折射

	// D日心瞬時黃道 heliocentric dynamical ecliptic coordinate system
	// [ longitude 黃經(radians), latitude 黃緯(radians), distance 距離(AU) ]
	Coordinates.D = function() {
		var coordinates;
		if (this.object === MOON_NAME) {
			// LEA406 計算月亮位置(地心瞬時黃道坐標)
			coordinates = LEA406(this.TT, {
				FK5 : false
			});
			coordinates = [
					normalize_radians(coordinates.V + TURN_TO_RADIANS / 2),
					normalize_radians(-coordinates.B, true), coordinates.R ];
		} else if (this.object === SUN_NAME)
			// 日心瞬時黃道以太陽為中心。
			coordinates = [ 0, 0, 0 ];
		else {
			var tmp_c = object_coordinates(this.TT, this.object, {
				equatorial : true,
				local : this.local,
				elongation : true
			});
			// S日心視黃道 heliocentric ecliptic coordinate system
			coordinates = tmp_c.S;
			this.s('S', [ normalize_radians(coordinates.L),
					normalize_radians(coordinates.B, true), coordinates.R ]);
			coordinates = tmp_c;
			this.s('G', [ normalize_radians(coordinates.λ),
					normalize_radians(coordinates.β, true), coordinates.Δ ]);

			this.sh(coordinates);

			// D日心瞬時黃道 heliocentric dynamical ecliptic coordinate system
			coordinates = tmp_c.D;
			coordinates
			// 
			= [ normalize_radians(coordinates.L),
					normalize_radians(coordinates.B, true), coordinates.R ];
		}

		return this.s('D', coordinates);
	};

	// S日心視黃道 heliocentric ecliptic coordinate system
	// [ longitude 黃經(radians), latitude 黃緯(radians), distance 距離(AU) ]
	Coordinates.S = function() {
		var coordinates;
		if (this.object === MOON_NAME) {
			coordinates = this.G;
			coordinates = dynamical_to_FK5({
				L : coordinates[0],
				B : coordinates[1]
			}, Julian_century(this.TT) / 10);
			coordinates = [ coordinates.L, coordinates.B, this.G[2] ];
		} else if (this.object === SUN_NAME)
			// 日心黃道以太陽為中心。
			coordinates = [ 0, 0, 0 ];
		else {
			return this.D && this.S;
		}

		return this.s('S', coordinates);
	};

	// G地心視黃道 geocentric solar ecliptic coordinate system
	// [ longitude λ黃經(radians), latitude β黃緯(radians), distance 距離(AU)
	// ]
	Coordinates.G = function() {
		var coordinates;
		if (this.object === MOON_NAME) {
			coordinates = lunar_coordinates(this.TT, {
				equatorial : true,
				local : this.local,
				elongation : true
			});

			this.sh(coordinates);

			coordinates
			//
			= [ coordinates.λ, coordinates.β, coordinates.Δ ];
		} else if (this.object === SUN_NAME) {
			coordinates = solar_coordinates(this.TT, {
				equatorial : true,
				local : this.local,
				elongation : true
			});

			this.sh(coordinates);

			// coordinates.apparent or use coordinates.L
			coordinates = [ coordinates.apparent * DEGREES_TO_RADIANS,
					coordinates.β, coordinates.Δ ];
		} else {
			return this.D && this.G;
		}

		return this.s('G', coordinates);
	};

	// E地心赤道 geocentric equatorial coordinate system
	// [ right ascension α赤經(radians), declination δ赤緯(radians),
	// distance 距離(AU) ]
	Coordinates.E = function() {
		// eval
		return this.G && this.E;
	};

	// T站心赤道 topocentric equatorial coordinate system
	// [ right ascension α赤經(radians), declination δ赤緯(radians) ]
	Coordinates.T = function() {
		// eval
		return this.G && this.T;
	};

	// H站心地平 topocentric horizontal coordinate system
	// [ Azimuth (Az) 方位角又稱地平經度, Altitude (Alt) 高度角或仰角又稱地平緯度 ]
	Coordinates.H = function() {
		// eval
		return this.G && this.H;
	};

	// D日心瞬時黃道 heliocentric dynamical ecliptic coordinate system
	// S日心視黃道 heliocentric ecliptic coordinate system
	// G地心視黃道 geocentric solar ecliptic coordinate system
	// E地心赤道 geocentric equatorial coordinate system
	// T站心赤道 topocentric equatorial coordinate system
	// H站心地平 topocentric horizontal coordinate system
	'DSGETH'.split('').forEach(function(type) {
		if (Object.defineProperty[library_namespace.env.not_native_keyword])
			// e.g., IE8
			return;

		// type: to [ radians, radians, AU ]
		Object.defineProperty(Coordinates.prototype, type, {
			enumerable : true,
			get : Coordinates[type]
		});
		// type + 'd': to [ degrees, degrees, meters ]
		Object.defineProperty(Coordinates.prototype, type + 'd', {
			enumerable : true,
			get : function() {
				var c = [ this[type][0] / DEGREES_TO_RADIANS,
				//
				this[type][1] / DEGREES_TO_RADIANS ];
				if (this[type].length > 2)
					c.push(this[type][2] * AU_TO_METERS);
				this.s(type + 'd', c);
				return c;
			}
		});
	});

	// 天球坐標系統
	// Celestial coordinate system
	// https://en.wikipedia.org/wiki/Celestial_coordinate_system
	// International Celestial Reference System
	// 國際天體參考系統（ICRS）原點在太陽系重心

	// 中心/質量中心 center point (origin)
	// https://en.wikipedia.org/wiki/Centre_%28geometry%29
	// H 日心 heliocentric
	// G 地心 geocentric, Earth-centered
	// T 本地站心,觀測中心座標系,視心 topocentric, local, observer's

	// 基礎平面/基面 fundamental plane of reference
	// https://en.wikipedia.org/wiki/Fundamental_plane_%28spherical_coordinates%29
	// https://en.wikipedia.org/wiki/Plane_of_reference
	// https://en.wikipedia.org/wiki/Celestial_coordinate_system#Coordinate_systems
	// D 瞬時黃道 dynamical ecliptic
	// S 黃道 ecliptic, solar
	// E 赤道 equatorial, celestial equator
	// H 地平 horizontal, observer's horizon
	//
	// G 銀道坐標系，又作銀道座標系 galactic
	// SG 超星系坐標系統 Supergalactic

	// position, seen position
	// https://en.wikipedia.org/wiki/Apparent_place
	// A 視 apparent
	// T 真 true

	// coordinates
	// S 球 spherical
	// e.g., 日心黃道直角座標系
	// R 直角正交 rectangular, cartesian (three-dimensional), orthogonality

	// 維度 dimension
	// https://en.wikipedia.org/wiki/Dimension
	// https://en.wikipedia.org/wiki/Geographic_coordinate_system
	// L 經度 longitude
	// B 緯度 latitude
	// R 距離 radius or elevation
	//
	// X →x
	// Y ↑y
	// Z ↗z

	// ----------------------------------------------------------------------------------------------------------------------------------------------//

	/**
	 * 計算月亮近地點 perigee 和遠地點 apogee 的修正量。
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版<br />
	 * p. 355. Chapter 50 Perigee and apogee of the Moon<br />
	 * 
	 * @param {Array}coefficients
	 *            修正量係數。
	 * @param {Array}c2
	 *            修正量係數2: [ D, M, F, T ]
	 * @param {Number}starts
	 *            初始值
	 * @param {Boolean}parallax
	 *            is parallax
	 * 
	 * @returns {Number}月亮近地點 perigee 和遠地點 apogee 的值。
	 * 
	 * @inner
	 */
	function lunar_perigee_apogee_Δ
	//
	(coefficients, c2, starts, parallax) {
		return coefficients.reduce(function(Δ, c) {
			// 三角函數係數, T之係數.
			var tc = 0, Tc = c[3];
			if (c[0])
				// D
				tc += c[0] * c2[0];
			if (c[1])
				// M
				tc += c[1] * c2[1];
			if (c[2])
				// F
				tc += c[2] * c2[2];
			if (c[4])
				Tc += c[4] * c2[3];
			return Δ + Tc * (parallax ? Math.cos(tc) : Math.sin(tc));
		}, starts);
	}

	/**
	 * 月亮的近地點 perigee 和遠地點 apogee。
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版<br />
	 * p. 355. Chapter 50 Perigee and apogee of the Moon<br />
	 * 
	 * @param {Number}year_month
	 *            帶小數點的年數，例如1987.25表示1987年3月末。
	 * @param {Boolean}apogee
	 *            get apogee 遠地點
	 * 
	 * @returns {Array}[ TT in JD, 距離 in km, Moon's Equatorial Horizontal
	 *          Parallax in radians ]
	 * 
	 * @see https://github.com/helixcn/skycalc/blob/master/src/AAMoonPerigeeApogee.cpp
	 */
	function lunar_perigee_apogee(year_month, apogee) {
		// Mean time of perigee or apogee.
		// k是整數對應近點，增加0.5則是遠點。其它k值無意義。
		// 當k=0時，對應1999年12月22日的近點。
		/**
		 * 1999.971:
		 * <q>1999 + (2451534.6698 - CeL.Julian_day.from_YMD(1999, 1, 1, 'CE')) / (DAYS_OF_JULIAN_CENTURY / 100) = 1999.9710329911014363</q>
		 * 26.511:
		 * <q>DAYS_OF_JULIAN_CENTURY / 100 / 27.55454989 * 2 = 13.25552409522593 * 2 = 26.51104819045186</q>
		 */
		var k = (year_month - 1999.971) * 26.511;
		k = apogee ? Math.round((k - 1) / 2) + .5 : Math.round(k / 2);
		// T is the time in Julian centuries since the epoch 2000.0.
		var T = k / 1325.55,
		// 修正量係數2
		c2 = [ polynomial_value(lunar_perigee_apogee_D, T),
				polynomial_value(lunar_perigee_apogee_M, T),
				polynomial_value(lunar_perigee_apogee_F, T), T ],
		// the time of the mean perigee or apogee
		// 計算近點或遠點時刻
		// 與ELP-2000/82理論的精準結果比較，最大誤差如下：
		// 時間的誤差：近地點31分，遠地點3分
		// 視差的誤差：近地點0″.124，遠地點0″.051
		// 相應的距離誤差分別是：12km和6km
		TT_JD = lunar_perigee_apogee_Δ(apogee ? apogee_coefficients_JD
				: perigee_coefficients_JD, c2, polynomial_value(
				lunar_perigee_apogee_T, T)),
		// The corresponding value of the Moon's equatorial horizontal
		// Moon's Equatorial Horizontal Parallax 月亮赤道地平視差修正量 in radians
		parallax = lunar_perigee_apogee_Δ(apogee ? apogee_coefficients_parallax
				: perigee_coefficients_parallax, c2, 0, true)
				* ARCSECONDS_TO_RADIANS;

		if (false)
			console.log('→ starts ' + TT_JD + ' ('
					+ library_namespace.JD_to_Date(TT_JD).format('CE') + '): '
					+ LEA406(TT_JD, {
						km : true
					}).R);

		// CeL.LEA406.load_terms('R');
		// find_minima() 會因輸入而有秒單位的誤差偏移。
		TT_JD = library_namespace.find_minima(function(TT_JD) {
			var distance = LEA406(TT_JD, {
				km : true
			}).R;
			if (false)
				console.log(TT_JD + ' ('
				//
				+ library_namespace.JD_to_Date(TT_JD).format('CE') + '): '
						+ distance);
			// find_minima: 求取局部極小值
			return apogee ? -distance : distance;
		},
		// (31+1)/60/24≈1/45
		TT_JD - 1 / 45, TT_JD + 1 / 45);

		if (apogee)
			TT_JD[1] = -TT_JD[1];
		TT_JD.push(parallax);
		// [ TT in JD, 距離 in km, 月亮赤道地平視差修正量 in radians ]
		return TT_JD;
	}

	_.lunar_perigee_apogee = lunar_perigee_apogee;

	// ----------------------------------------------------------------------------------------------------------------------------------------------//

	/**
	 * data section: 以下為計算用天文數據。
	 */

	// ------------------------------------------------------------------------------------------------------//
	// terms for ΔT
	/**
	 * terms for function ΔT()
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * <a href="http://eclipse.gsfc.nasa.gov/SEcat5/deltatpoly.html"
	 * accessdate="2015/3/26 20:8">NASA - Polynomial Expressions for Delta T</a><br />
	 * <a href="http://www.staff.science.uu.nl/~gent0113/deltat/deltat_old.htm"
	 * accessdate="2015/3/26 20:7">Delta T: Pre-Telescopic Era</a>
	 * 
	 * @inner
	 */
	var ΔT_year_start = [ 2150, 2050, 2005, 1986, 1961, 1941, 1920, 1900, 1860,
			1800, 1700, 1600, 500, -500 ],
	// http://eclipse.gsfc.nasa.gov/SEcat5/deltatpoly.html
	// All values of ΔT based on Morrison and Stephenson [2004]
	// assume a value for the Moon's secular acceleration of -26
	// arcsec/cy².
	ΔT_year_base = [ 1820, 1820, 2000, 2000, 1975, 1950, 1920, 1900, 1860,
			1800, 1700, 1600, 1000, 0 ],
	// 為統合、方便計算，在演算方法上作了小幅變動。
	ΔT_coefficients = [
			[ -20, 0, 32 ],
			[ -205.724, 56.28, 32 ],
			[ 62.92, 32.217, 55.89 ],
			[ 63.86, 33.45, -603.74, 1727.5, 65181.4, 237359.9 ],
			[ 45.45, 106.7, -10000 / 260, -1000000 / 718 ],
			[ 29.07, 40.7, -10000 / 233, 1000000 / 2547 ],
			[ 21.20, 84.493, -761.00, 2093.6 ],
			[ -2.79, 149.4119, -598.939, 6196.6, -19700 ],
			[ 7.62, 57.37, -2517.54, 16806.68, -44736.24, 10000000000 / 233174 ],
			[ 13.72, -33.2447, 68.612, 4111.6, -37436, 121272, -169900, 87500 ],
			[ 8.83, 16.03, -59.285, 133.36, -100000000 / 1174000 ],
			[ 120, -98.08, -153.2, 1000000 / 7129 ],
			[ 1574.2, -556.01, 71.23472, 0.319781, -0.8503463, -0.005050998,
					0.0083572073 ],
			[ 10583.6, -1014.41, 33.78311, -5.952053, -0.1798452, 0.022174192,
					0.0090316521 ] ];

	// ------------------------------------------------------------------------------------------------------//
	// terms for obliquity 轉軸傾角

	/**
	 * IAU2006 obliquity coefficients.<br />
	 * terms for function mean_obliquity_IAU2006()
	 * 
	 * Reference 資料來源/資料依據:
	 * https://github.com/kanasimi/IAU-SOFA/blob/master/src/obl06.c
	 * 
	 * @inner
	 */
	var IAU2006_obliquity_coefficients = [
	// Astronomical Almanac 2011:
	// Mean obliquity of the ecliptic, epsilon_0:
	// epsilon_J2000.0 = 84381.406″ ± 0.001″
	84381.406, -46.836769, -0.0001831, 0.00200340, -0.000000576, -0.0000000434 ];

	/**
	 * terms for function equinox()
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版<br />
	 * chapter 章動及黃赤交角.
	 * 
	 * @inner
	 */
	var Laskar_obliquity_coefficients = [
	// ε = 23° 26′ 21.448″ - 4680.93″ T - 1.55″ T²
	// + 1999.25″ T³ - 51.38″ T⁴ - 249.67″ T⁵
	// - 39.05″ T⁶ + 7.12″ T⁷ + 27.87″ T⁸ + 5.79″ T⁹ + 2.45″ T¹⁰
	23 * 60 * 60 + 26 * 60 + 21.448, -4680.93, -1.55, 1999.25, -51.38, -249.67,
			-39.05, 7.12, 27.87, 5.79, 2.45 ];
	Laskar_obliquity_coefficients.forEach(function(v, index) {
		Laskar_obliquity_coefficients[index] = v / DEGREES_TO_ARCSECONDS;
	});

	// ------------------------------------------------------------------------------------------------------//
	// terms for precession

	var
	/**
	 * terms for function ecliptic_precession()
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * Kai Tang (2015). A long time span relativistic precession model of the
	 * Earth.<br />
	 * Table B.1 The Periodic Terms in PA, QA.
	 * 
	 * @inner
	 */
	唐凯_ecliptic_precession_terms = [ [ -3720, 1260, -1290, -3698, 68975 ],
			[ 657, -2585, 2508, 736, 235535 ],
			[ -2068, -302, 288, -2056, 72488 ],
			[ -855, -570, 548, -838, 192342 ], [ 438, 338, -334, 435, 49178 ],
			[ 309, 255, -225, 289, 67341 ], [ 217, 322, -191, 5, 424863 ],
			[ 168, -313, 288, 183, 65723 ], [ -278, 130, -112, -294, 173673 ],
			[ -278, -79, 89, -285, 75817 ], [ -77, 258, -157, -194, 255871 ],
			[ -24, 124, -106, -33, 64138 ], [ 29, 3, -91, 187, 496536 ],
			[ -135, -153, 176, -151, 70820 ], [ -85, 124, -257, 187, 1080090 ],
			[ 153, -276, 395, -117, 1309223 ], [ 14, -12, 77, -94, 663722 ],
			[ 55, -11, 46, 20, 214239 ], [ 81, 39, -41, 92, 77777 ],
			[ -55, -16, 19, -61, 80440 ], [ 6, -88, -50, 206, 367386 ],
			[ -22, 107, 16, -189, 321366 ], [ 5, -130, 24, 141, 284995 ],
			[ 11, -28, 8, 27, 164405 ], [ 15, 19, -19, 19, 83199 ] ],

	/**
	 * terms for function precession()
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * Kai Tang (2015). A long time span relativistic precession model of the
	 * Earth.<br />
	 * Table B.2 The Periodic Terms in pA, εA.
	 * 
	 * @inner
	 */
	唐凯_precession_terms = [ [ -6653, -2199, 739, -2217, 40938 ],
			[ -3349, 541, -175, -1126, 39803 ],
			[ 1526, -1218, 376, 469, 53789 ], [ 227, 874, -313, 84, 28832 ],
			[ -370, 256, -91, -129, 29639 ], [ 518, -353, 110, 174, 41557 ],
			[ 324, 542, -174, 107, 42171 ], [ -482, 200, -72, -158, 38875 ],
			[ -46, -201, 63, -17, 42847 ], [ -140, -45, 16, -50, 30127 ],
			[ -224, 404, -143, -69, 40316 ], [ 181, -98, 38, 55, 38379 ],
			[ -121, 59, -24, -35, 37783 ], [ -9, -73, 27, -6, 28550 ],
			[ 35, -42, 15, 13, 27300 ], [ 63, -35, 15, 16, 37225 ],
			[ 56, -64, 15, 12, 20459 ], [ 18, -77, 18, 3, 20151 ],
			[ -8, 41, -9, -13, 170984 ], [ 51, 9, -2, 16, 29197 ],
			[ 3425, -2525, , , 1309223 ], [ -2951, 1938, , , 991814 ],
			[ 2117, -704, , , 716770 ], [ 877, -993, , , 416787 ],
			[ -805, 226, , , 554293 ], [ -710, -52, , , 371201 ],
			[ 448, -33, , , 324763 ], [ -217, 111, , , 122237 ],
			[ 224, -55, , , 94370 ], [ -228, 37, , , 287695 ] ];

	唐凯_ecliptic_precession_terms
	// 原數值: [ [ 5540″, -1.98e-4″ ], [ -1608″, -2.06e-4 ] ]
	// 已轉成適用於 Julian century 使用。
	.init = [ [ 5540, -0.0198 ], [ -1608, -0.0206 ] ];
	唐凯_ecliptic_precession_terms.forEach(function(term) {
		// 100: 轉成適用於 Julian century 使用。
		// Julian year (the time reckoned from J2000.0 in years)
		// → Julian century
		term[4] = 100 * TURN_TO_RADIANS / term[4];
	});

	唐凯_precession_terms
	// 原數值: [ [ 6221″, 50″.44766 ], [ 83953″, -8.9e-5″ ] ]
	// 已轉成適用於 Julian century 使用。
	.init = [ [ 6221, 5044.766 ], [ 83953, -0.0089 ] ];
	唐凯_precession_terms.forEach(function(term) {
		// 100: 轉成適用於 Julian century 使用。
		// Julian year (the time reckoned from J2000.0 in years)
		// → Julian century
		term[4] = 100 * TURN_TO_RADIANS / term[4];
	});

	// ------------------------------------------------------------------------------------------------------//
	// 章動 nutation

	var IAU2000B_nutation_offset_Δψ = -0.135,
	//
	IAU2000B_nutation_offset_Δε = 0.388;
	(function() {
		var d = TURN_TO_RADIANS / ONE_DAY_SECONDS / 1e3;
		IAU2000B_nutation_offset_Δψ *= d;
		IAU2000B_nutation_offset_Δε *= d;
	})();

	/**
	 * terms for function nutation()
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * Nutation, IAU 2000B model.
	 * https://github.com/kanasimi/IAU-SOFA/blob/master/src/nut00b.c
	 * 
	 * @see http://www.neoprogrammics.com/nutations/nutations_1980_2000b/index.php
	 * 
	 * @inner
	 */
	var IAU2000B_nutation_parameters = [
	// el: Mean anomaly of the Moon. 月亮平近點角
	[ 485868.249036, 1717915923.2178
	// , 31.8792, 0.051635, -0.00024470
	],
	// elp(el'): Mean anomaly of the Sun. 太陽平近點角
	[ 1287104.79305, 129596581.0481
	// , -0.5532, 0.000136, -0.00001149
	],
	// f: Mean argument of the latitude of the Moon. 月亮平升交角距
	[ 335779.526232, 1739527262.8478
	// , -12.7512, -0.001037, 0.00000417
	],
	// d: Mean elongation of the Moon from the Sun. 日月平角距
	[ 1072260.70369, 1602961601.2090
	// , -6.3706, 0.006593, -0.00003169
	],
	// om(Ω): Mean longitude of the ascending node of the Moon.
	// 月亮升交點平黃經
	[ 450160.398036, -6962890.5431
	// , 7.4722, 0.007702, -0.00005939
	] ],

	// 0–4: coefficients of l,l',F,D,Om
	// int nl,nlp,nf,nd,nom;
	// 5–7: longitude sin, t*sin, cos coefficients
	// double ps,pst,pc;
	// 8–10: obliquity cos, t*cos, sin coefficients
	// double ps,pst,pc;
	IAU2000B_nutation_terms = [
			/* 1-10 */
			[ 0, 0, 0, 0, 1, -172064161, -174666, 33386,
			// Astronomical Almanac 2011:
			// Constant of nutation at epoch J2000.0:
			// N = 9.2052331″
			92052331, 9086, 15377 ],
			[ 0, 0, 2, -2, 2, -13170906, -1675, -13696, 5730336, -3015, -4587 ],
			[ 0, 0, 2, 0, 2,
			//
			-2276413, -234, 2796, 978459, -485, 1374 ],
			[ 0, 0, 0, 0, 2, 2074554, 207, -698, -897492, 470, -291 ],
			[ 0, 1, 0, 0, 0,
			//
			1475877, -3633, 11817, 73871, -184, -1924 ], [ 0, 1, 2, -2, 2,
			//
			-516821, 1226, -524, 224386, -677, -174 ],
			[ 1, 0, 0, 0, 0, 711159, 73, -872, -6750, 0, 358 ],
			[ 0, 0, 2, 0, 1, -387298, -367, 380, 200728, 18, 318 ],
			[ 1, 0, 2, 0, 2, -301461, -36, 816, 129025, -63, 367 ],
			[ 0, -1, 2, -2, 2, 215829, -494, 111, -95929, 299, 132 ],

			/* 11-20 */
			[ 0, 0, 2, -2, 1, 128227, 137, 181, -68982, -9, 39 ],
			[ -1, 0, 2, 0, 2, 123457, 11, 19, -53311, 32, -4 ],
			[ -1, 0, 0, 2, 0, 156994, 10, -168, -1235, 0, 82 ],
			[ 1, 0, 0, 0, 1, 63110, 63, 27, -33228, 0, -9 ],
			[ -1, 0, 0, 0, 1, -57976, -63, -189, 31429, 0, -75 ],
			[ -1, 0, 2, 2, 2, -59641, -11, 149, 25543, -11, 66 ],
			[ 1, 0, 2, 0, 1, -51613, -42, 129, 26366, 0, 78 ],
			[ -2, 0, 2, 0, 1, 45893, 50, 31, -24236, -10, 20 ],
			[ 0, 0, 0, 2, 0, 63384, 11, -150, -1220, 0, 29 ],
			[ 0, 0, 2, 2, 2, -38571, -1, 158, 16452, -11, 68 ],

			/* 21-30 */
			[ 0, -2, 2, -2, 2, 32481, 0, 0, -13870, 0, 0 ],
			[ -2, 0, 0, 2, 0, -47722, 0, -18, 477, 0, -25 ],
			[ 2, 0, 2, 0, 2, -31046, -1, 131, 13238, -11, 59 ],
			[ 1, 0, 2, -2, 2, 28593, 0, -1, -12338, 10, -3 ],
			[ -1, 0, 2, 0, 1, 20441, 21, 10, -10758, 0, -3 ],
			[ 2, 0, 0, 0, 0, 29243, 0, -74, -609, 0, 13 ],
			[ 0, 0, 2, 0, 0, 25887, 0, -66, -550, 0, 11 ],
			[ 0, 1, 0, 0, 1, -14053, -25, 79, 8551, -2, -45 ],
			[ -1, 0, 0, 2, 1, 15164, 10, 11, -8001, 0, -1 ],
			[ 0, 2, 2, -2, 2, -15794, 72, -16, 6850, -42, -5 ],

			/* 31-40 */
			[ 0, 0, -2, 2, 0, 21783, 0, 13, -167, 0, 13 ],
			[ 1, 0, 0, -2, 1, -12873, -10, -37, 6953, 0, -14 ],
			[ 0, -1, 0, 0, 1, -12654, 11, 63, 6415, 0, 26 ],
			[ -1, 0, 2, 2, 1, -10204, 0, 25, 5222, 0, 15 ],
			[ 0, 2, 0, 0, 0, 16707, -85, -10, 168, -1, 10 ],
			[ 1, 0, 2, 2, 2, -7691, 0, 44, 3268, 0, 19 ],
			[ -2, 0, 2, 0, 0, -11024, 0, -14, 104, 0, 2 ],
			[ 0, 1, 2, 0, 2, 7566, -21, -11, -3250, 0, -5 ],
			[ 0, 0, 2, 2, 1, -6637, -11, 25, 3353, 0, 14 ],
			[ 0, -1, 2, 0, 2, -7141, 21, 8, 3070, 0, 4 ],

			/* 41-50 */
			[ 0, 0, 0, 2, 1, -6302, -11, 2, 3272, 0, 4 ],
			[ 1, 0, 2, -2, 1, 5800, 10, 2, -3045, 0, -1 ],
			[ 2, 0, 2, -2, 2, 6443, 0, -7, -2768, 0, -4 ],
			[ -2, 0, 0, 2, 1, -5774, -11, -15, 3041, 0, -5 ],
			[ 2, 0, 2, 0, 1, -5350, 0, 21, 2695, 0, 12 ],
			[ 0, -1, 2, -2, 1, -4752, -11, -3, 2719, 0, -3 ],
			[ 0, 0, 0, -2, 1, -4940, -11, -21, 2720, 0, -9 ],
			[ -1, -1, 0, 2, 0, 7350, 0, -8, -51, 0, 4 ],
			[ 2, 0, 0, -2, 1, 4065, 0, 6, -2206, 0, 1 ],
			[ 1, 0, 0, 2, 0, 6579, 0, -24, -199, 0, 2 ],

			/* 51-60 */
			[ 0, 1, 2, -2, 1, 3579, 0, 5, -1900, 0, 1 ],
			[ 1, -1, 0, 0, 0, 4725, 0, -6, -41, 0, 3 ],
			[ -2, 0, 2, 0, 2, -3075, 0, -2, 1313, 0, -1 ],
			[ 3, 0, 2, 0, 2, -2904, 0, 15, 1233, 0, 7 ],
			[ 0, -1, 0, 2, 0, 4348, 0, -10, -81, 0, 2 ],
			[ 1, -1, 2, 0, 2, -2878, 0, 8, 1232, 0, 4 ],
			[ 0, 0, 0, 1, 0, -4230, 0, 5, -20, 0, -2 ],
			[ -1, -1, 2, 2, 2, -2819, 0, 7, 1207, 0, 3 ],
			[ -1, 0, 2, 0, 0, -4056, 0, 5, 40, 0, -2 ],
			[ 0, -1, 2, 2, 2, -2647, 0, 11, 1129, 0, 5 ],

			/* 61-70 */
			[ -2, 0, 0, 0, 1, -2294, 0, -10, 1266, 0, -4 ],
			[ 1, 1, 2, 0, 2, 2481, 0, -7, -1062, 0, -3 ],
			[ 2, 0, 0, 0, 1, 2179, 0, -2, -1129, 0, -2 ],
			[ -1, 1, 0, 1, 0, 3276, 0, 1, -9, 0, 0 ],
			[ 1, 1, 0, 0, 0, -3389, 0, 5, 35, 0, -2 ],
			[ 1, 0, 2, 0, 0, 3339, 0, -13, -107, 0, 1 ],
			[ -1, 0, 2, -2, 1, -1987, 0, -6, 1073, 0, -2 ],
			[ 1, 0, 0, 0, 2, -1981, 0, 0, 854, 0, 0 ],
			[ -1, 0, 0, 1, 0, 4026, 0, -353, -553, 0, -139 ],
			[ 0, 0, 2, 1, 2, 1660, 0, -5, -710, 0, -2 ],

			/* 71-77 */
			[ -1, 0, 2, 4, 2, -1521, 0, 9, 647, 0, 4 ],
			[ -1, 1, 0, 1, 1, 1314, 0, 0, -700, 0, 0 ],
			[ 0, -2, 2, -2, 1, -1283, 0, 0, 672, 0, 0 ],
			[ 1, 0, 2, 2, 1, -1331, 0, 8, 663, 0, 4 ],
			[ -2, 0, 2, 2, 2, 1383, 0, -2, -594, 0, -2 ],
			[ -1, 0, 0, 0, 2, 1405, 0, 4, -610, 0, 2 ],
			[ 1, 1, 2, -2, 2, 1290, 0, 0, -556, 0, 0 ] ];

	/**
	 * terms for function nutation()
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版<br />
	 * table 22.A.<br />
	 * 
	 * @see https://github.com/kanasimi/IAU-SOFA/blob/master/src/nut80.c
	 * 
	 * @inner
	 */
	// IAU1980_nutation_parameters 單位是度。
	var IAU1980_nutation_parameters = [
	// 平距角(日月對地心的角距離)：
	// D = 297.85036 + 445267.111480*T - 0.0019142*T² +
	// T³/189474
	[ 297.85036, 445267.111480, -0.0019142, 1 / 189474 ],
	// 太陽（地球）平近點角：
	// M = 357.52772 + 35999.050340*T - 0.0001603*T² -
	// T³/300000
	[ 357.52772, 35999.050340, -0.0001603, -1 / 300000 ],
	// 月球平近點角：
	// M′= 134.96298 + 477198.867398*T + 0.0086972*T² +
	// T³/56250
	[ 134.96298, 477198.867398, 0.0086972, 1 / 56250 ],
	// 月球緯度參數：
	// F = 93.27191 + 483202.017538*T - 0.0036825*T² +
	// T³/327270
	[ 93.27191, 483202.017538, -0.0036825, 1 / 327270 ],
	// 黃道與月球平軌道升交點黃經，從Date黃道平分點開始測量：
	// Ω= 125.04452 - 1934.136261*T + 0.0020708*T² +
	// T³/450000
	[ 125.04452, -1934.136261, 0.0020708, 1 / 450000 ] ],

	// 這些項來自 IAU 1980 章動理論，忽略了係數小於0″.0003的項。
	// https://github.com/kanasimi/IAU-SOFA/blob/master/src/nut80.c
	IAU1980_nutation_terms = [ [ 0, 0, 0, 0, 1, -171996, -1742, 92025, 89 ],
			[ -2, 0, 0, 2, 2, -13187, -16, 5736, -31 ],
			[ 0, 0, 0, 2, 2, -2274, -2, 977, -5 ],
			[ 0, 0, 0, 0, 2, 2062, 2, -895, 5 ],
			[ 0, 1, 0, 0, 0, 1426, -34, 54, -1 ],
			[ 0, 0, 1, 0, 0, 712, 1, -7, 0 ],
			[ -2, 1, 0, 2, 2, -517, 12, 224, -6 ],
			[ 0, 0, 0, 2, 1, -386, -4, 200, 0 ],
			[ 0, 0, 1, 2, 2, -301, 0, 129, -1 ],
			[ -2, -1, 0, 2, 2, 217, -5, -95, 3 ],
			[ -2, 0, 1, 0, 0, -158, 0, 0, 0 ],
			[ -2, 0, 0, 2, 1, 129, 1, -70, 0 ],
			[ 0, 0, -1, 2, 2, 123, 0, -53, 0 ], [ 2, 0, 0, 0, 0, 63, 0, 0, 0 ],
			[ 0, 0, 1, 0, 1, 63, 1, -33, 0 ],
			[ 2, 0, -1, 2, 2, -59, 0, 26, 0 ],
			[ 0, 0, -1, 0, 1, -58, -1, 32, 0 ],
			[ 0, 0, 1, 2, 1, -51, 0, 27, 0 ], [ -2, 0, 2, 0, 0, 48, 0, 0, 0 ],
			[ 0, 0, -2, 2, 1, 46, 0, -24, 0 ],
			[ 2, 0, 0, 2, 2, -38, 0, 16, 0 ], [ 0, 0, 2, 2, 2, -31, 0, 13, 0 ],
			[ 0, 0, 2, 0, 0, 29, 0, 0, 0 ], [ -2, 0, 1, 2, 2, 29, 0, -12, 0 ],
			[ 0, 0, 0, 2, 0, 26, 0, 0, 0 ], [ -2, 0, 0, 2, 0, -22, 0, 0, 0 ],
			[ 0, 0, -1, 2, 1, 21, 0, -10, 0 ], [ 0, 2, 0, 0, 0, 17, -1, 0, 0 ],
			[ 2, 0, -1, 0, 1, 16, 0, -8, 0 ], [ -2, 2, 0, 2, 2, -16, 1, 7, 0 ],
			[ 0, 1, 0, 0, 1, -15, 0, 9, 0 ], [ -2, 0, 1, 0, 1, -13, 0, 7, 0 ],
			[ 0, -1, 0, 0, 1, -12, 0, 6, 0 ], [ 0, 0, 2, -2, 0, 11, 0, 0, 0 ],
			[ 2, 0, -1, 2, 1, -10, 0, 5, 0 ], [ 2, 0, 1, 2, 2, -8, 0, 3, 0 ],
			[ 0, 1, 0, 2, 2, 7, 0, -3, 0 ], [ -2, 1, 1, 0, 0, -7, 0, 0, 0 ],
			[ 0, -1, 0, 2, 2, -7, 0, 3, 0 ], [ 2, 0, 0, 2, 1, -7, 0, 3, 0 ],
			[ 2, 0, 1, 0, 0, 6, 0, 0, 0 ], [ -2, 0, 2, 2, 2, 6, 0, -3, 0 ],
			[ -2, 0, 1, 2, 1, 6, 0, -3, 0 ], [ 2, 0, -2, 0, 1, -6, 0, 3, 0 ],
			[ 2, 0, 0, 0, 1, -6, 0, 3, 0 ], [ 0, -1, 1, 0, 0, 5, 0, 0, 0 ],
			[ -2, -1, 0, 2, 1, -5, 0, 3, 0 ], [ -2, 0, 0, 0, 1, -5, 0, 3, 0 ],
			[ 0, 0, 2, 2, 1, -5, 0, 3, 0 ], [ -2, 0, 2, 0, 1, 4, 0, 0, 0 ],
			[ -2, 1, 0, 2, 1, 4, 0, 0, 0 ], [ 0, 0, 1, -2, 0, 4, 0, 0, 0 ],
			[ -1, 0, 1, 0, 0, -4, 0, 0, 0 ], [ -2, 1, 0, 0, 0, -4, 0, 0, 0 ],
			[ 1, 0, 0, 0, 0, -4, 0, 0, 0 ], [ 0, 0, 1, 2, 0, 3, 0, 0, 0 ],
			[ 0, 0, -2, 2, 2, -3, 0, 0, 0 ], [ -1, -1, 1, 0, 0, -3, 0, 0, 0 ],
			[ 0, 1, 1, 0, 0, -3, 0, 0, 0 ], [ 0, -1, 1, 2, 2, -3, 0, 0, 0 ],
			[ 2, -1, -1, 2, 2, -3, 0, 0, 0 ], [ 0, 0, 3, 2, 2, -3, 0, 0, 0 ],
			[ 2, -1, 0, 2, 2, -3, 0, 0, 0 ] ];

	// ------------------------------------------------------------------------------------------------------//
	// Sun's aberration. 太陽地心黃經光行差修正量。

	/**
	 * constant term of Sun's aberration
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版<br />
	 * p. 167–168. chapter 太陽位置計算.
	 * 
	 * If needed with respect to the mean equinox of the date instead of to a
	 * fixed reference frame, the constant term 3548.193 should be replaced by
	 * 3548.330. 如果Δλ須是在Date黃道中的，則應把常數項3548.193換為3548.330
	 * 
	 * The ICRF is a fixed reference frame. The FK5 based on fixed reference
	 * frame of J2000.0?
	 * 
	 * @see http://blog.csdn.net/songgz/article/details/2680144<br />
	 *      通過數以千計的恆星位置，反推出春風點在天球上的位置，我們常說的FK5天球坐標系統就與它有關。
	 * @see https://en.wikipedia.org/wiki/Barycentric_celestial_reference_system<br />
	 *      The orientation of the BCRS/ICRS axes also align within 0.02
	 *      arcsecond of the Earth's mean equator and equinox for the Fifth
	 *      Fundamental Catalog (FK5) J2000.0 epoch.
	 * @see http://aa.usno.navy.mil/faq/docs/ICRS_doc.php<br />
	 *      The orientation of the ICRS axes is consistent with the equator and
	 *      equinox of J2000.0 represented by the FK5, within the errors of the
	 *      latter.
	 * 
	 * @inner
	 */
	var sun_aberration_variation_constant = 3548.193,
	/**
	 * coefficients of Sun's aberration
	 * 
	 * Σ : Σ ([0] * sin ( [1] + [2] τ) )
	 * 
	 * daily variation = sun_aberration_variation_constant + Σ(variation[0]) +
	 * Σ(variation[1])*τ + Σ(variation[2])*τ² + Σ(variation[3])*τ³
	 * 
	 * τ的係數為359993.7、719987或1079981的週期項，與地球離心率相關。<br />
	 * τ的係數為4452671、9224660或4092677的週期項，與月球運動相關。<br />
	 * τ的係數為450369、225184、315560或675553的週期項，與金星攝動相關。<br />
	 * τ的係數為329645、659289、或299296的週期項，與火星攝動相關。
	 * 
	 * @inner
	 */
	sun_aberration_variation = [
			// τ⁰
			[ [ 118.568, 87.5287, 359993.7286 ],
					[ 2.476, 85.0561, 719987.4571 ],
					[ 1.376, 27.8502, 4452671.1152 ],
					[ 0.119, 73.1375, 450368.8564 ],
					[ 0.114, 337.2264, 329644.6718 ],
					[ 0.086, 222.5400, 659289.3436 ],
					[ 0.078, 162.8136, 9224659.7915 ],
					[ 0.054, 82.5823, 1079981.1857 ],
					[ 0.052, 171.5189, 225184.4282 ],
					[ 0.034, 30.3214, 4092677.3866 ],
					[ 0.033, 119.8105, 337181.4711 ],
					[ 0.023, 247.5418, 299295.6151 ],
					[ 0.023, 325.1526, 315559.5560 ],
					[ 0.021, 155.1241, 675553.2846 ] ],
			// τ¹
			[ [ 7.311, 333.4515, 359993.7286 ],
					[ 0.305, 330.9814, 719987.4571 ],
					[ 0.010, 328.5170, 1079981.1857 ] ],
			// τ²
			[ [ 0.309, 241.4518, 359993.7286 ],
					[ 0.021, 205.0482, 719987.4571 ],
					[ 0.004, 297.8610, 4452671.1152 ] ],
			// τ³
			[ [ 0.010, 154.7066, 359993.7286 ] ] ];

	sun_aberration_variation.forEach(function(term) {
		term.forEach(function(sub_term) {
			sub_term[1] *= DEGREES_TO_RADIANS;
			sub_term[2] *= DEGREES_TO_RADIANS;
		});
	});

	// ------------------------------------------------------------------------------------------------------//

	/**
	 * terms for function equinox()
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版<br />
	 * chapter 分點和至點.<br />
	 * 
	 * @inner
	 */
	// for years -1000 to 1000
	var equinox_terms_before_1000 = [
	// March equinox, 春分點時刻
	[ 1721139.29189, 365242.13740, 0.06134, 0.00111, -0.00071 ],
	// June Solstice, 夏至點時刻
	[ 1721233.25401, 365241.72562, -0.05323, 0.00907, 0.00025 ],
	// September equinox, 秋分點時刻
	[ 1721325.70455, 365242.49558, -0.11677, -0.00297, 0.00074 ],
	// December Solstice, 冬至點時刻
	[ 1721414.39987, 365242.88257, -0.00769, -0.00933, -0.00006 ] ],
	// for years 1000 to 3000
	equinox_terms_after_1000 = [
	// March equinox, 春分點時刻
	[ 2451623.80984, 365242.37404, 0.05169, -0.00411, -0.00057 ],
	// June Solstice, 夏至點時刻
	[ 2451716.56767, 365241.62603, 0.00325, 0.00888, -0.00030 ],
	// September equinox, 秋分點時刻
	[ 2451810.21715, 365242.01767, -0.11575, 0.00337, 0.00078 ],
	// December Solstice, 冬至點時刻
	[ 2451900.05952, 365242.74049, -0.06223, -0.00823, 0.00032 ] ],
	// 週期項
	equinox_periodic_terms = [
	//
	[ 485, 324.96, 1934.136 ], [ 203, 337.23, 32964.467 ],
			[ 199, 342.08, 20.186 ], [ 182, 27.85, 445267.112 ],
			[ 156, 73.14, 45036.886 ], [ 136, 171.52, 22518.443 ],
			[ 77, 222.54, 65928.934 ], [ 74, 296.72, 3034.906 ],
			[ 70, 243.58, 9037.513 ], [ 58, 119.81, 33718.147 ],
			[ 52, 297.17, 150.678 ], [ 50, 21.02, 2281.226 ],
			[ 45, 247.54, 29929.562 ], [ 44, 325.15, 31555.956 ],
			[ 29, 60.93, 4443.417 ], [ 18, 155.12, 67555.328 ],
			[ 17, 288.79, 4562.452 ], [ 16, 198.04, 62894.029 ],
			[ 14, 199.76, 31436.921 ], [ 12, 95.39, 14577.848 ],
			[ 12, 287.11, 31931.756 ], [ 12, 320.81, 34777.259 ],
			[ 9, 227.73, 1222.114 ], [ 8, 15.45, 16859.074 ] ];

	// 把能先做的做一做，加快運算速度。
	equinox_periodic_terms.forEach(function(terms) {
		terms[1] *= DEGREES_TO_RADIANS;
		terms[2] *= DEGREES_TO_RADIANS;
	});

	// ------------------------------------------------------------------------------------------------------//
	// VSOP87 半解析（semi-analytic）理論 periodic terms

	/**
	 * 這邊僅擷取行星 Earth 地球數值，以計算二十四節氣 (solar terms)。
	 * 
	 * VSOP87_terms.earth[L黃經/B黃緯/R距離] = [L0:[[A,B,C],[A,B,C]]];
	 * 
	 * simplified VSOP87 by Jean Meeus.
	 * 從VSOP87中取出一些主要項(詳見附錄II)，利用它計算得到的太陽位置在-2000到6000年範圍內精度是1"。<br />
	 * 誤差 365.25*24*60*60/360/60/60 = 24.35秒鐘。相當於半分鐘。
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版<br />
	 * Appendix III 附表3.<br />
	 * http://forums.parallax.com/showthread.php/154838-Azimuth-angle-conversion-from-east-to-west
	 * 
	 * @see http://www.neoprogrammics.com/vsop87/source_code_generator_tool/
	 *      VSOP87B日心黃道球面坐標 Heliocentric LBR - J2000
	 * @see ftp://ftp.imcce.fr/pub/ephem/planets/vsop87/VSOP87B.ear
	 */
	VSOP87_terms.earth = {
		multiplier : 1e-8,
		// 行星 Earth 地球: 日心黃經
		L : [
				[ [ 175347046.0, 0, 0 ], [ 3341656.0, 4.6692568, 6283.07585 ],
						[ 34894.0, 4.6261, 12566.1517 ],
						[ 3497.0, 2.7441, 5753.3849 ],
						[ 3418.0, 2.8289, 3.5231 ],
						[ 3136.0, 3.6277, 77713.7715 ],
						[ 2676.0, 4.4181, 7860.4194 ],
						[ 2343.0, 6.1352, 3930.2097 ],
						[ 1324.0, 0.7425, 11506.7698 ],
						[ 1273.0, 2.0371, 529.691 ],
						[ 1199.0, 1.1096, 1577.3435 ],
						[ 990, 5.233, 5884.927 ], [ 902, 2.045, 26.298 ],
						[ 857, 3.508, 398.149 ], [ 780, 1.179, 5223.694 ],
						[ 753, 2.533, 5507.553 ], [ 505, 4.583, 18849.228 ],
						[ 492, 4.205, 775.523 ], [ 357, 2.92, 0.067 ],
						[ 317, 5.849, 11790.629 ], [ 284, 1.899, 796.298 ],
						[ 271, 0.315, 10977.079 ], [ 243, 0.345, 5486.778 ],
						[ 206, 4.806, 2544.314 ], [ 205, 1.869, 5573.143 ],
						[ 202, 2.458, 6069.777 ], [ 156, 0.833, 213.299 ],
						[ 132, 3.411, 2942.463 ], [ 126, 1.083, 20.775 ],
						[ 115, 0.645, 0.98 ], [ 103, 0.636, 4694.003 ],
						[ 102, 0.976, 15720.839 ], [ 102, 4.267, 7.114 ],
						[ 99, 6.21, 2146.17 ], [ 98, 0.68, 155.42 ],
						[ 86, 5.98, 161000.69 ], [ 85, 1.3, 6275.96 ],
						[ 85, 3.67, 71430.7 ], [ 80, 1.81, 17260.15 ],
						[ 79, 3.04, 12036.46 ], [ 75, 1.76, 5088.63 ],
						[ 74, 3.5, 3154.69 ], [ 74, 4.68, 801.82 ],
						[ 70, 0.83, 9437.76 ], [ 62, 3.98, 8827.39 ],
						[ 61, 1.82, 7084.9 ], [ 57, 2.78, 6286.6 ],
						[ 56, 4.39, 14143.5 ], [ 56, 3.47, 6279.55 ],
						[ 52, 0.19, 12139.55 ], [ 52, 1.33, 1748.02 ],
						[ 51, 0.28, 5856.48 ], [ 49, 0.49, 1194.45 ],
						[ 41, 5.37, 8429.24 ], [ 41, 2.4, 19651.05 ],
						[ 39, 6.17, 10447.39 ], [ 37, 6.04, 10213.29 ],
						[ 37, 2.57, 1059.38 ], [ 36, 1.71, 2352.87 ],
						[ 36, 1.78, 6812.77 ], [ 33, 0.59, 17789.85 ],
						[ 30, 0.44, 83996.85 ], [ 30, 2.74, 1349.87 ],
						[ 25, 3.16, 4690.48 ] ],
				[ [ 628331966747.0, 0, 0 ], [ 206059.0, 2.678235, 6283.07585 ],
						[ 4303.0, 2.6351, 12566.1517 ], [ 425.0, 1.59, 3.523 ],
						[ 119.0, 5.796, 26.298 ], [ 109.0, 2.966, 1577.344 ],
						[ 93, 2.59, 18849.23 ], [ 72, 1.14, 529.69 ],
						[ 68, 1.87, 398.15 ], [ 67, 4.41, 5507.55 ],
						[ 59, 2.89, 5223.69 ], [ 56, 2.17, 155.42 ],
						[ 45, 0.4, 796.3 ], [ 36, 0.47, 775.52 ],
						[ 29, 2.65, 7.11 ], [ 21, 5.34, 0.98 ],
						[ 19, 1.85, 5486.78 ], [ 19, 4.97, 213.3 ],
						[ 17, 2.99, 6275.96 ], [ 16, 0.03, 2544.31 ],
						[ 16, 1.43, 2146.17 ], [ 15, 1.21, 10977.08 ],
						[ 12, 2.83, 1748.02 ], [ 12, 3.26, 5088.63 ],
						[ 12, 5.27, 1194.45 ], [ 12, 2.08, 4694 ],
						[ 11, 0.77, 553.57 ], [ 10, 1.3, 6286.6 ],
						[ 10, 4.24, 1349.87 ], [ 9, 2.7, 242.73 ],
						[ 9, 5.64, 951.72 ], [ 8, 5.3, 2352.87 ],
						[ 6, 2.65, 9437.76 ], [ 6, 4.67, 4690.48 ] ],
				[ [ 52919.0, 0, 0 ], [ 8720.0, 1.0721, 6283.0758 ],
						[ 309.0, 0.867, 12566.152 ], [ 27, 0.05, 3.52 ],
						[ 16, 5.19, 26.3 ], [ 16, 3.68, 155.42 ],
						[ 10, 0.76, 18849.23 ], [ 9, 2.06, 77713.77 ],
						[ 7, 0.83, 775.52 ], [ 5, 4.66, 1577.34 ],
						[ 4, 1.03, 7.11 ], [ 4, 3.44, 5573.14 ],
						[ 3, 5.14, 796.3 ], [ 3, 6.05, 5507.55 ],
						[ 3, 1.19, 242.73 ], [ 3, 6.12, 529.69 ],
						[ 3, 0.31, 398.15 ], [ 3, 2.28, 553.57 ],
						[ 2, 4.38, 5223.69 ], [ 2, 3.75, 0.98 ] ],
				[ [ 289.0, 5.844, 6283.076 ], [ 35, 0, 0 ],
						[ 17, 5.49, 12566.15 ], [ 3, 5.2, 155.42 ],
						[ 1, 4.72, 3.52 ], [ 1, 5.3, 18849.23 ],
						[ 1, 5.97, 242.73 ] ],
				[ [ 114.0, 3.142, 0 ], [ 8, 4.13, 6283.08 ],
						[ 1, 3.84, 12566.15 ] ], [ [ 1, 3.14, 0 ] ] ],
		// 行星 Earth 地球: 日心黃緯
		B : [
				[ [ 280, 3.199, 84334.662 ], [ 102, 5.422, 5507.553 ],
						[ 80, 3.88, 5223.69 ], [ 44, 3.7, 2352.87 ],
						[ 32, 4, 1577.34 ] ],
				[ [ 9, 3.9, 5507.55 ], [ 6, 1.73, 5223.69 ] ] ],
		// 行星 Earth 地球: 行星到太陽的距離, 日地距離, 位置向量（又稱向徑或徑矢 radius vector）
		// https://zh.wikipedia.org/wiki/%E4%BD%8D%E7%BD%AE%E5%90%91%E9%87%8F
		R : [
				[ [ 100013989.0, 0, 0 ], [ 1670700.0, 3.0984635, 6283.07585 ],
						[ 13956.0, 3.05525, 12566.1517 ],
						[ 3084.0, 5.1985, 77713.7715 ],
						[ 1628.0, 1.1739, 5753.3849 ],
						[ 1576.0, 2.8469, 7860.4194 ],
						[ 925.0, 5.453, 11506.77 ], [ 542.0, 4.564, 3930.21 ],
						[ 472.0, 3.661, 5884.927 ], [ 346.0, 0.964, 5507.553 ],
						[ 329.0, 5.9, 5223.694 ], [ 307.0, 0.299, 5573.143 ],
						[ 243.0, 4.273, 11790.629 ],
						[ 212.0, 5.847, 1577.344 ],
						[ 186.0, 5.022, 10977.079 ],
						[ 175.0, 3.012, 18849.228 ],
						[ 110.0, 5.055, 5486.778 ], [ 98, 0.89, 6069.78 ],
						[ 86, 5.69, 15720.84 ], [ 86, 1.27, 161000.69 ],
						[ 65, 0.27, 17260.15 ], [ 63, 0.92, 529.69 ],
						[ 57, 2.01, 83996.85 ], [ 56, 5.24, 71430.7 ],
						[ 49, 3.25, 2544.31 ], [ 47, 2.58, 775.52 ],
						[ 45, 5.54, 9437.76 ], [ 43, 6.01, 6275.96 ],
						[ 39, 5.36, 4694 ], [ 38, 2.39, 8827.39 ],
						[ 37, 0.83, 19651.05 ], [ 37, 4.9, 12139.55 ],
						[ 36, 1.67, 12036.46 ], [ 35, 1.84, 2942.46 ],
						[ 33, 0.24, 7084.9 ], [ 32, 0.18, 5088.63 ],
						[ 32, 1.78, 398.15 ], [ 28, 1.21, 6286.6 ],
						[ 28, 1.9, 6279.55 ], [ 26, 4.59, 10447.39 ] ],
				[ [ 103019.0, 1.10749, 6283.07585 ],
						[ 1721.0, 1.0644, 12566.1517 ], [ 702.0, 3.142, 0 ],
						[ 32, 1.02, 18849.23 ], [ 31, 2.84, 5507.55 ],
						[ 25, 1.32, 5223.69 ], [ 18, 1.42, 1577.34 ],
						[ 10, 5.91, 10977.08 ], [ 9, 1.42, 6275.96 ],
						[ 9, 0.27, 5486.78 ] ],
				[ [ 4359.0, 5.7846, 6283.0758 ], [ 124.0, 5.579, 12566.152 ],
						[ 12, 3.14, 0 ], [ 9, 3.63, 77713.77 ],
						[ 6, 1.87, 5573.14 ], [ 3, 5.47, 18849.23 ] ],
				[ [ 145.0, 4.273, 6283.076 ], [ 7, 3.92, 12566.15 ] ],
				[ [ 4, 2.56, 6283.08 ] ] ]
	};

	// ------------------------------------------------------------------------------------------------------//

	/**
	 * convert_LEA406 使用之行星數據。
	 * 
	 * mean longitudes of major planets.
	 */
	var convert_LEA406_arguments
	// @see ReadMe_Eng.pdf, from build_LEA406.txt
	// all in arcseconds.
	= [
	// [0]: 為配合 fields.
	null, [ 485868.249036, 17179159232.178, 3187.92, 51.635, -2.447 ],
	//
	[ 1287104.793048, 1295965810.481, -55.32, 0.136, -0.1149 ],
	//
	[ 335779.526232, 17395272628.478, -1275.12, -1.037, 0.0417 ],
	//
	[ 1072260.703692, 16029616012.09, -637.06, 6.593, -0.3169 ],
	//
	[ 450160.398036, -69679193.631, 636.02, 7.625, -0.3586 ],
	//
	[ 908103.259872, 5381016286.88982, -1.92789, 0.00639, 0 ],
	//
	[ 655127.28306, 2106641364.33548, 0.59381, -0.00627, 0 ],
	//
	[ 361679.244588, 1295977422.83429, -2.04411, -0.00523, 0 ],
	//
	[ 1279558.798488, 689050774.93988, 0.94264, -0.01043, 0 ],
	//
	[ 123665.467464, 109256603.77991, -30.60378, 0.05706, 0.04667 ],
	//
	[ 180278.79948, 43996098.55732, 75.61614, -0.16618, -0.11484 ],
	//
	[ 1130598.018396, 15424811.93933, -1.75083, 0.02156, 0 ],
	//
	[ 1095655.195728, 7865503.20744, 0.21103, -0.00895, 0 ],
	//
	[ 0, 50288.2, 111.2022, 0.0773, -0.2353 ] ],
	// 將 Amp 轉整數: Amp *= 1e7 (表格中小數7位數)。
	Amp_to_integer = 1e7;

	// ------------------------------------------------------------------------------------------------------//

	/**
	 * 初始化 Saros Series data.
	 * 
	 * @param {Array}saros_starts
	 *            Solar/Lunar Eclipses Saros Series start TT, MUST > 1.5
	 * @param {Integer}offset
	 *            offset of saros index
	 * @param {Array}saros_starts_TT
	 *            Array to put Solar/Lunar Eclipses Saros Series start TT.
	 *            saros_starts_TT[1] = start TT of series 1
	 * 
	 * @returns {Array} [ remainder, saros_index ];
	 * 
	 * @inner
	 */
	function create_saros_index(saros_starts, offset, saros_starts_TT) {
		var saros_data = [];
		saros_starts.forEach(function(TT, index) {
			saros_starts_TT[index += offset] = TT;
			// -1.5: 確保查詢時一定大於底限。因此需要壓低底限。
			saros_data.push([ (TT - 1.5) % saros_days, [ index, TT ] ]);
		});
		saros_data.sort(function(a, b) {
			return a[0] - b[0];
		});
		// console.log(saros_data);

		var remainder = [], saros_index = [];
		saros_data.forEach(function(data) {
			remainder.push(data[0]);
			saros_index.push(data[1]);
		});

		if (false) {
			var min_gap = Infinity;
			remainder.forEach(function(r, index) {
				if (index > 0 && min_gap > r - remainder[index - 1])
					min_gap = r - remainder[index - 1];
			});
			console.log('min gap: ' + min_gap);
			// min gap ≈ 27.7707
		}

		return [ remainder, saros_index ];
	}

	/**
	 * 沙羅週期 The saros is a period of approximately 223 synodic months
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * wikipedia: 6585.3211 , SEsaros.html: 6585.3223
	 * 
	 * 奇數的數字表示發生在接近昇交點的日食，偶數的數字表示發生在接近降交點的日食；但在月食這種數字的搭配是相反的。沙羅序列的編號是以最大食出現，也就是最接近交點的時間來排列的。
	 * 
	 * 任何時間都有大約40個不同的沙羅序列在進行中。 以2008年為例，共有39個日食的沙羅序列在進行中，而月食則有41個序列在進行中。
	 * 
	 * @see https://en.wikipedia.org/wiki/Saros_%28astronomy%29
	 * @see http://eclipse.gsfc.nasa.gov/SEsaros/SEsaros.html
	 */
	var saros_days = 6585.3211,
	// Solar/Lunar Eclipses Saros Series start TT
	// solar_saros[1]: The start TT of Solar Eclipses Saros Series 1
	solar_saros = [], lunar_saros = [],
	// remainder[0] 為依 saros_days, sort 過的 remainder.
	// remainder[1] 為 [ 所指向的 saros series index, start JDN (TT) ]
	//
	// http://eclipse.gsfc.nasa.gov/SEsaros/SEperiodtab4.html
	// http://eclipse.gsfc.nasa.gov/SEsaros/SEsaros0-180.html
	// http://eclipse.gsfc.nasa.gov/SEsaros/SEsaros000.html
	solar_saros_remainder = create_saros_index([ 524207, 541365, 571692,
			562508, 579666, 609994, 534956, 538943, 575856, 573257, 590415,
			620743, 624729, 641887, 672215, 676201, 693358, 723686, 727672,
			744830, 775158, 779144, 783132, 820045, 810860, 748994, 792493,
			789893, 787295, 824208, 834780, 838767, 869095, 886252, 890239,
			927152, 937723, 941710, 978624, 989195, 993182, 1023511, 1034082,
			972215, 1061812, 1006530, 997346, 1021089, 1038246, 1042232,
			1065975, 1089717, 1093704, 1117447, 1141189, 1145176, 1168919,
			1192661, 1196648, 1220391, 1244133, 1234949, 1265278, 1282434,
			1207396, 1217969, 1254882, 1252283, 1262856, 1293183, 1297170,
			1314327, 1344655, 1348641, 1365799, 1396127, 1400113, 1417271,
			1447599, 1445000, 1462158, 1492486, 1456960, 1421435, 1471519,
			1455749, 1466321, 1496649, 1500635, 1511208, 1548121, 1552107,
			1562680, 1599593, 1603579, 1614151, 1644480, 1655051, 1659038,
			1695951, 1693352, 1631485, 1727667, 1672385, 1663201, 1693530,
			1710686, 1714673, 1738416, 1755573, 1766145, 1789888, 1807045,
			1817617, 1841360, 1858517, 1862503, 1892832, 1903403, 1887634,
			1924548, 1921949, 1873252, 1890410, 1914152, 1918139, 1935297,
			1959039, 1963025, 1986768, 2010511, 2014497, 2031655, 2061983,
			2065969, 2083127, 2113455, 2104270, 2108257, 2151756, 2083303,
			2080705, 2124204, 2121604, 2132177, 2162505, 2166491, 2177063,
			2207391, 2217963, 2228535, 2258863, 2269435, 2273422, 2310335,
			2314321, 2311723, 2355222, 2319696, 2284170, 2314499, 2325070,
			2329057, 2352800, 2369957, 2380529, 2404272, 2421429, 2425415,
			2455744, 2472901, 2476887, 2500630, 2517787, 2515188, 2545517,
			2556088, 2487636, 2504794, 2535122, 2525937, 2543095, 2573423,
			2577409, 2594567, 2624895, 2628881, 2646039, 2669781, 2673767,
			2690925, 2721253, 2718654, 2729227, 2759554, 2704272, 2695089,
			2738588, 2729403, 2739975, 2770303, 2774289, 2784862, 2815190 ],
			-13, solar_saros),

	// http://eclipse.gsfc.nasa.gov/LEsaros/LEperiodtab3.html
	// http://eclipse.gsfc.nasa.gov/LEsaros/LEsaroscat.html
	// https://en.wikipedia.org/wiki/List_of_Saros_series_for_lunar_eclipses
	// http://eclipse.gsfc.nasa.gov/LEcat5/LE-1999--1900.html
	lunar_saros_remainder = create_saros_index([ 534086, 544657, 542059,
			585557, 582958, 507921, 538249, 555406, 552807, 576550, 600292,
			604279, 628022, 645179, 655751, 679494, 703236, 707223, 730966,
			754708, 752109, 782438, 799594, 783825, 754885, 824725, 762858,
			773431, 810344, 807744, 824902, 855230, 859216, 876374, 906702,
			910688, 927846, 958174, 962160, 979318, 1009646, 1007047, 1017619,
			1054532, 979494, 976896, 1020395, 1017795, 1028368, 1058696,
			1062682, 1073254, 1110168, 1114154, 1131312, 1161640, 1165626,
			1176198, 1213112, 1217098, 1221085, 1257998, 1255399, 1186947,
			1283129, 1227846, 1225248, 1255576, 1272733, 1276720, 1307048,
			1317620, 1328192, 1358520, 1375677, 1379664, 1409992, 1420563,
			1424550, 1461464, 1465450, 1436510, 1493180, 1457654, 1435299,
			1452457, 1476199, 1480185, 1503929, 1527671, 1531657, 1548815,
			1579143, 1583129, 1600287, 1624029, 1628016, 1651759, 1675501,
			1672902, 1683475, 1713802, 1645350, 1649337, 1686250, 1683651,
			1694223, 1731137, 1735123, 1745695, 1776023, 1786595, 1797167,
			1827495, 1838067, 1848639, 1878967, 1882953, 1880355, 1923854,
			1881742, 1852802, 1889716, 1893702, 1897689, 1928017, 1938589,
			1942576, 1972904, 1990060, 1994047, 2024376, 2034947, 2045519,
			2075848, 2086419, 2083821, 2120734, 2124720, 2062853, 2086597,
			2103753, 2094569, 2118312, 2142055, 2146041, 2169784, 2186941,
			2197513, 2214671, 2238413, 2242399, 2266143, 2289885, 2287286,
			2311029, 2334771, 2292660, 2276891, 2326975, 2304620, 2308607,
			2345521, 2349507, 2360079, 2390407, 2394393, 2411551, 2441879,
			2445865, 2456438, 2486766, 2490752, 2501324, 2538237, 2529053,
			2473772, 2563368, 2508086, 2505487, 2542401, 2546387, 2556959,
			2587288, 2597859, 2601846, 2632174, 2649331, 2653318, 2683646,
			2694218, 2698204, 2728533, 2739104, 2683823, 2740493, 2724723,
			2708953, 2732696, 2749853, 2753840, 2777583, 2801325, 2805311 ],
			-20, lunar_saros);

	// ------------------------------------------------------------------------------------------------------//

	// all 1325.55: T = k / 1325.55
	// the time of the mean perigee or apogee
	// 計算平近點或遠點時刻
	var lunar_perigee_apogee_T = [ 2451534.6698, 27.55454989 * 1325.55,
			-0.0006691, -0.000001098, 0.0000000052 ],
	// Moon's mean elongation at time JDE:
	// T 時刻的月亮平距角：
	lunar_perigee_apogee_D = [ 171.9179, 335.9106046 * 1325.55, 0.0100383,
			-0.00001156, 0.000000055 ].map(degrees_to_radians),
	// Sun's mean anomaly:
	// 太陽平近點角：
	lunar_perigee_apogee_M = [ 347.3477, 27.1577721 * 1325.55, -0.0008130,
			-0.0008130 ].map(degrees_to_radians),
	// Moon's argument of latitude:
	// 月亮緯度參數：
	lunar_perigee_apogee_F = [ 316.6109, +364.5287911 * 1325.55, -0.0125053,
			-0.0000148 ].map(degrees_to_radians),
	/**
	 * 月亮的近地點 perigee 和遠地點 apogee 之 coefficients 數據 for function
	 * lunar_perigee_apogee()。
	 * 
	 * Reference 資料來源/資料依據:<br />
	 * Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版<br />
	 * p. 355. Chapter 50 Perigee and apogee of the Moon<br />
	 * 
	 * @see https://github.com/helixcn/skycalc/blob/master/src/AAMoonPerigeeApogee.cpp
	 */
	perigee_coefficients_JD = [
	// 近地點 JD 修正量係數。
	[ 2, , , -1.6769 ], [ 4, , , .4589 ], [ 6, , , -.1856 ], [ 8, , , .0883 ],
			[ 2, -1, , -.0773, .00019 ], [ , 1, , .0502, -.00013 ],
			[ 10, , , -.0460 ], [ 4, -1, , .0422, -.00011 ],
			[ 6, -1, , -.0256 ], [ 12, , , .0253 ], [ 1, , , .0237 ],
			[ 8, -1, , .0162 ], [ 14, , , -.0145 ], [ , , 2, .0129 ],
			[ 3, , , -.0112 ], [ 10, -1, , -.0104 ], [ 16, , , .0086 ],
			[ 12, -1, , .0069 ], [ 5, , , .0066 ], [ 2, , 2, -.0053 ],
			[ 18, , , -.0052 ], [ 14, -1, , -.0046 ], [ 7, , , -.0041 ],
			[ 2, 1, , .0040 ], [ 20, , , .0032 ], [ 1, 1, , -.0032 ],
			[ 16, -1, , .0031 ], [ 4, 1, , -.0029 ], [ 9, , , .0027 ],
			[ 4, , 2, .0027 ], [ 2, -2, , -.0027 ], [ 4, -2, , .0024 ],
			[ 6, -2, , -.0021 ], [ 22, , , -.0021 ], [ 18, -1, , -.0021 ],
			[ 6, 1, , .0019 ], [ 11, , , -.0018 ], [ 8, 1, , -.0014 ],
			[ 4, , -2, -.0014 ], [ 6, , 2, -.0014 ], [ 3, 1, , .0014 ],
			[ 5, 1, , -.0014 ], [ 13, , , .0013 ], [ 20, -1, , .0013 ],
			[ 3, 2, , .0011 ], [ 4, -2, 2, -.0011 ], [ 1, 2, , -.0010 ],
			[ 22, -1, , -.0009 ], [ , , 4, -.0008 ], [ 6, , -2, .0008 ],
			[ 2, 1, -2, .0008 ], [ , 2, , .0007 ], [ , -1, 2, .0007 ],
			[ 2, , 4, .0007 ], [ , -2, 2, -.0006 ], [ 2, 2, -2, -.0006 ],
			[ 24, , , .0006 ], [ 4, , -4, .0005 ], [ 2, 2, , .0005 ],
			[ 1, -1, , -.0004 ] ],
	//
	perigee_coefficients_parallax = [
	// 近地點赤道地平視差修正量係數。
	[ , , , 3629.215 ], [ 2, , , 63.224 ], [ 4, , , -6.990 ],
			[ 2, -1, , 2.834, -.0071 ], [ 6, , , 1.927 ], [ 1, , , -1.263 ],
			[ 8, , , -.702 ], [ , 1, , .696, -.0017 ], [ , , 2, -.690 ],
			[ 4, -1, , -.629, .0016 ], [ 2, , -2, -.392 ], [ 10, , , .297 ],
			[ 6, -1, , .260 ], [ 3, , , .201 ], [ 2, 1, , -.161 ],
			[ 1, 1, , .157 ], [ 12, , , -.138 ], [ 8, -1, , -.127 ],
			[ 2, , 2, .104 ], [ 2, -2, , .104 ], [ 5, , , -.079 ],
			[ 14, , , .068 ], [ 10, -1, , .067 ], [ 4, 1, , .054 ],
			[ 12, -1, , -.038 ], [ 4, -2, , -.038 ], [ 7, , , .037 ],
			[ 4, , 2, -.037 ], [ 16, , , -.035 ], [ 3, 1, , -.030 ],
			[ 1, -1, , .029 ], [ 6, 1, , -.025 ], [ , 2, , .023 ],
			[ 14, -1, , .023 ], [ 2, 2, , -.023 ], [ 6, -2, , .022 ],
			[ 2, -1, -2, -.021 ], [ 9, , , -.020 ], [ 18, , , .019 ],
			[ 6, , 2, .017 ], [ , -1, 2, .014 ], [ 16, -1, , -.014 ],
			[ 4, , -2, .013 ], [ 8, 1, , .012 ], [ 11, , , .011 ],
			[ 5, 1, , .010 ], [ 20, , , -.010 ] ],
	//
	apogee_coefficients_JD = [
	// 遠地點 JD 修正量係數。
	[ 2, , , .4392 ], [ 4, , , .0684 ], [ , 1, , .0456, -.00011 ],
			[ 2, -1, , .0426, -.00011 ], [ , , 2, .0212 ], [ 1, , , -.0189 ],
			[ 6, , , .0144 ], [ 4, -1, , .0113 ], [ 2, , 2, .0047 ],
			[ 1, 1, , .0036 ], [ 8, , , .0035 ], [ 6, -1, , .0034 ],
			[ 2, , -2, -.0034 ], [ 2, -2, , .0022 ], [ 3, , , -.0017 ],
			[ 4, , 2, .0013 ], [ 8, -1, , .0011 ], [ 4, -2, , .0010 ],
			[ 10, , , .0009 ], [ 3, 1, , .0007 ], [ , 2, , .0006 ],
			[ 2, 1, , .0005 ], [ 2, 2, , .0005 ], [ 6, , 2, .0004 ],
			[ 6, -2, , .0004 ], [ 10, -1, , .0004 ], [ 5, , , -.0004 ],
			[ 4, , -2, -.0004 ], [ , 1, 2, .0003 ], [ 12, , , .0003 ],
			[ 2, -1, 2, .0003 ], [ 1, -1, , -.0003 ] ],
	//
	apogee_coefficients_parallax = [
	// 遠地點赤道地平視差修正量係數。
	[ , , , 3245.251 ], [ 2, , , -9.147 ], [ 1, , , -.841 ], [ , , 2, .697 ],
			[ , 1, , -.656, .0016 ], [ 4, , , .355 ], [ 2, -1, , .159 ],
			[ 1, 1, , .127 ], [ 4, -1, , .065 ], [ 6, , , .052 ],
			[ 2, 1, , .043 ], [ 2, , 2, .031 ], [ 2, , -2, -.023 ],
			[ 2, -2, , .022 ], [ 2, 2, , .019 ], [ , 2, , -.016 ],
			[ 6, -1, , .014 ], [ 8, , , .010 ] ];

	// ---------------------------------------------------------------------------------------------------------------------------------------//
	// export.

	// ---------------------------------------

	return (_// JSDT:_module_
	);
}
