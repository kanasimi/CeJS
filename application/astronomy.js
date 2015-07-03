/**
 * @name CeL function for astronomical calculations.
 * @fileoverview 本檔案包含了天文演算用的日期轉換功能。
 * 
 * @since 2015/3/20 23:5:43
 * 
 * TODO:
 * 
 * http://eclipse.gsfc.nasa.gov/JSEX/JSEX-index.html
 * https://web.archive.org/web/http://www.chris.obyrne.com/Eclipses/calculator.html
 * https://en.wikipedia.org/wiki/Astronomical_symbols
 * 
 * Software & coded<br />
 * http://www.kentauren.info/menu/index1.htm?page=/cgi-bin/planeph_VSOP87d.pl
 * https://pypi.python.org/pypi/astronomia
 * https://github.com/Hedwig1958/libastro/blob/master/astro.c
 * https://github.com/soniakeys/meeus/blob/master/solar/solar.go
 * https://github.com/hkuno9000/sunmoon/blob/master/acoord.cpp
 * http://www.timeanddate.com/calendar/moonphases.html
 * 
 * 大地測量:給定地球表面兩個點的經緯度,計算兩點間之距離<br />
 * 天球上星體距離<br />
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
 * 計算順序: https://github.com/kanasimi/IAU-SOFA/blob/master/doc/sofa_ast_c.pdf
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

if (false) {

	// examples

	CeL.run('application.astronomy');

	CeL.run('application.astronomy', function() {
		CeL.assert([ CeL.polynomial_value([ 3, 4, 5, 6 ], 2),
				3 + 4 * 2 + 5 * 2 * 2 + 6 * 2 * 2 * 2 ], 'polynomial value');

		// http://songgz.iteye.com/blog/1571007
		CeL.assert([ 66, Math.round(CeL.deltaT(2008)) ],
				'get ΔT of year 2008 in seconds');
		CeL.assert([ 29, Math.round(CeL.deltaT(1950)) ],
				'get ΔT of year 1950 in seconds');
		CeL.assert([ 5710, Math.round(CeL.deltaT(500)) ],
				'get ΔT of year 500 in seconds');
		CeL.assert([ 1.11, Math.round(10 * CeL.deltaT(2010) / 6) / 100 ],
				'get ΔT of year 2010 in minutes');
		CeL.assert([ 95.17, Math.round(10 * CeL.deltaT(500) / 6) / 100 ],
				'get ΔT of year 500 in minutes');

		// 例15.a：表面光滑的太陽圓盤下邊沿視緯度是30′。設太陽的真直徑是32′，氣溫及大氣壓為常規條件。求真位置。
		CeL.refraction(CeL.refraction.to_real(30 / 60) + 32 / 60) * 60;
		// get ≈ 57.9′

		CeL.JD_to_Date(CeL.equinox(1962, 1));
		// get ≈ 1962-06-21 21:24

		CeL.nutation(2446895.5);
		// get ≈ [ -3.788/3600, 9.443/3600 ]

		// 取得 Gregorian calendar 1977 年，中曆 1978 年之冬至日時間。
		CeL.solar_term_JD(1977, '冬至');

		// ----------------------------------------------------------------------------

		// 取得 Le calendrier républicain (法國共和曆)行用期間之年首。
		// method 1: 取得法國當地之 0:0
		for (var year = 1792, offset = 1 * 60; year <= 1805; year++)
			console.log(CeL.JD_to_Date(
			// 1: UTC+1 → minute offset
			CeL.midnight_of(CeL.solar_term_JD(year, '秋分'), offset)).format({
				offset : offset
			}));
		// method 2: 將 date 當作 local 之 0:0
		for (var year = 1792, offset = 1 * 60; year <= 1805; year++) {
			// 1: UTC+1 → minute offset
			var date = CeL.JD_to_Date(CeL.midnight_of(CeL.solar_term_JD(year,
					'秋分'), offset)
					+ (offset - CeL.String_to_Date.default_offset) / 60 / 24),
			// 歸零用
			ms = date.getMilliseconds();
			// 歸零
			if (ms)
				date.setMilliseconds(Math.round(ms / 500) * 500);
			console.log(date.format());
		}
		// method 3: using solar_term_calendar()
		for (var c = CeL.solar_term_calendar('秋分', 1 * 60),
		//
		year = 1792; year <= 1805; year++)
			console.log(new Date(c(year)).format());

		// 取得 Iran 當地之春分時刻。
		for (var year = 1975, offset = 3.5 * 60; year <= 2041; year++)
			console.log(CeL.JD_to_Date(
			// 3.5: UTC+3.5 → minute offset
			CeL.solar_term_JD(year, '春分')).format({
				offset : offset
			}));

		// 取得 Solar Hijri calendar (the official calendar in Iran and
		// Afghanistan from 1979) 年首。
		for (var year = 1975, offset = (3.5 + 12) * 60; year <= 2041; year++)
			console.log(CeL.JD_to_Date(
			// 3.5: UTC+3.5 → minute offset
			// 12: 移半天可以取代正午之效果。
			CeL.midnight_of(CeL.solar_term_JD(year, '春分'), offset)).format({
				offset : offset
			}));

		// method: using solar_term_calendar()
		for (var c = CeL.solar_term_calendar('春分', (3.5 + 12) * 60),
		//
		year = 1975; year <= 2041; year++)
			console.log(new Date(c(year)).format());

		// ----------------------------------------------------------------------------

		CeL.assert([ 2015, CeL.立春年(new Date('2015/2/4')) ], '立春年 2015/2/4');
		CeL.assert([ 2014, CeL.立春年(new Date('2015/2/3')) ], '立春年 2015/2/3');

		CeL.LEA406.load_terms('V', function() {
			CeL.show_degrees(CeL.LEA406(2457132, 'V'));
		});

		// 取得 2200年01月02日0:0 TT 月亮視黃經。
		CeL.show_degrees(CeL.lunar_coordinate(CeL.Date_to_JD(new Date(
				'2200-01-02T00:00:00Z'))).V, 3);

		// 取得 Gregorian calendar 1977 年之整年度日月合朔時間。
		CeL.lunar_phase(1977, 0, {
			duration : 1,
			mean : false,
			to_Date : true,
			format : 'CE'
		});

		CeL.lunar_phase_of_JD(2457101, {
			time : true
		});

		// 取得今年之天文曆譜。
		var 年朔日 = CeL.定朔((new Date).getFullYear(), {
			月名 : true
		});
		年朔日.map(function(JD, index) {
			return 年朔日.月名[index] + ': ' + CeL.JD_to_Date(JD).format('CE');
		}).join('\n');

		// 取得新王莽天鳳3年之天文曆譜。
		var 年朔日 = CeL.定朔(CeL.era('新王莽天鳳3年'), {
			歲首 : '丑',
			月名 : true
		});
		年朔日.map(function(d, index) {
			return 年朔日.月名[index] + ': ' + CeL.JD_to_Date(d).format('CE');
		}).join('\n');
		// 取得月日
		var index = 年朔日.search_sorted(1727054, true);
		年朔日.月名[index] + '月' + (1727054 - 年朔日[index] | 0) + '日'

	});
}

// ------------------------------------------------------------------------------------------------------------------//

if (typeof CeL === 'function')
	CeL.run({
		name : 'application.astronomy',
		// data.math.find_root
		require : 'data.code.compatibility.|data.math.',

		code : function(library_namespace) {

			// requiring
			// var String_to_Date;
			// eval(this.use());

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
			// const: 基本上與程式碼設計合一，僅表示名義，不可更改。(=== -1)
			NOT_FOUND = ''.indexOf('_'),

			/**
			 * 周角 = 360°, 1 turn, 1 revolution, 1 perigon, full circle, complete
			 * rotation, a full rotation in degrees.
			 */
			TURN_TO_DEGREES = 360 | 0,
			/**
			 * degrees * DEGREES_TO_RADIANS = radians.
			 * 
			 * DEGREES_TO_RADIANS = 2π/360 =
			 * 0.017453292519943295769236907684886127134428718885417254560971... ≈
			 * 1.745329251994329576923691e-2
			 * 
			 * @see https://github.com/kanasimi/IAU-SOFA/blob/master/src/sofam.h
			 */
			DEGREES_TO_RADIANS = 2 * Math.PI / TURN_TO_DEGREES,
			/**
			 * degrees * DEGREES_TO_ARCSECONDS = arcseconds.
			 * 
			 * DEGREES_TO_ARCSECONDS = 3600
			 */
			DEGREES_TO_ARCSECONDS = 60 * 60 | 0,
			/**
			 * Arcseconds in a full circle. 角秒
			 * 
			 * TURN_TO_ARCSECONDS = 1296000
			 * 
			 * @see https://github.com/kanasimi/IAU-SOFA/blob/master/src/sofam.h
			 */
			TURN_TO_ARCSECONDS = TURN_TO_DEGREES * DEGREES_TO_ARCSECONDS,
			/**
			 * arcseconds * ARCSECONDS_TO_RADIANS = radians.
			 * 
			 * ARCSECONDS_TO_RADIANS = 2π/360/3600 =
			 * 0.0000048481368110953599358991410235794797595635330237270151558... ≈
			 * 4.848136811095359935899141e-6
			 * 
			 * @see https://github.com/kanasimi/IAU-SOFA/blob/master/src/sofam.h
			 */
			ARCSECONDS_TO_RADIANS = DEGREES_TO_RADIANS / DEGREES_TO_ARCSECONDS,
			/**
			 * Seconds per day. 每一天 86400 秒鐘。
			 * 
			 * @see https://github.com/kanasimi/IAU-SOFA/blob/master/src/sofam.h
			 */
			ONE_DAY_SECONDS = 24 * 60 * 60 | 0,
			/**
			 * Reference epoch (J2000.0), Julian Date. J2000.0 曆元。
			 * 
			 * DAYS_OF_JULIAN_CENTURY = (365 + 1/4) * 100
			 * 
			 * @see https://github.com/kanasimi/IAU-SOFA/blob/master/src/sofam.h
			 * @see https://en.wikipedia.org/wiki/Epoch_%28astronomy%29#Julian_years_and_J2000
			 */
			J2000_epoch = 2451545.0,
			/**
			 * Days per Julian century. 儒略世紀.
			 * 
			 * DAYS_OF_JULIAN_CENTURY = (365 + 1/4) * 100
			 * 
			 * @see https://github.com/kanasimi/IAU-SOFA/blob/master/src/sofam.h
			 */
			DAYS_OF_JULIAN_CENTURY = 36525,
			/**
			 * speed of light in vacuum (m/s), c 光速.
			 */
			CELERITAS = 299792458,
			/**
			 * Astronomical unit (m).<br />
			 * 1 astronomical unit = 149597870700 meters (exactly)
			 */
			AU_TO_METERS = 149597870700,
			/**
			 * light-time for AU distance (in days).<br />
			 * AU_LIGHT_TIME = 149597870700/299792458/86400 ≈
			 * 0.005775518331436995
			 */
			AU_LIGHT_TIME = AU_TO_METERS / CELERITAS / ONE_DAY_SECONDS,
			/**
			 * 地月距離 in km (公里)。
			 * 
			 * 平均距離 mean distance: 384400 km<br />
			 * 半長軸 Semi-major axis: 384748 km<br />
			 * 
			 * @see https://en.wikipedia.org/wiki/Lunar_distance_%28astronomy%29
			 * @see http://en.wikipedia.org/wiki/Orbit_of_the_Moon
			 * @see http://solarsystem.nasa.gov/planets/profile.cfm?Display=Facts&Object=Moon
			 */
			LUNAR_DISTANCE_KM = 384400,
			/**
			 * 地球半徑 in km (公里)。地球半徑6,357km到6,378km。平均半徑6371km。
			 * 
			 * 平均半徑 Earth mean radius: 6371.0 km<br />
			 * Equatorial radius: 6378.1 km<br />
			 * 
			 * @see http://en.wikipedia.org/wiki/Earth
			 */
			TERRA_RADIUS_KM = 6371,
			/**
			 * 月球半徑 in km (公里)。
			 * 
			 * @see http://en.wikipedia.org/wiki/Earth
			 */
			LUNAR_RADIUS_KM = 6371,
			/**
			 * 每年 2 分點 + 2 至點。
			 * 
			 * EQUINOX_SOLSTICE_COUNT = 4
			 */
			EQUINOX_SOLSTICE_COUNT = 2 + 2,
			/**
			 * 每分至點 90°。
			 * 
			 * EQUINOX_SOLSTICE_DEGREES = 90
			 */
			EQUINOX_SOLSTICE_DEGREES
			//
			= TURN_TO_DEGREES / EQUINOX_SOLSTICE_COUNT,
			// 二十四節氣名。每月有一個節氣，一個中氣，分別發生在每月的7日和22日前後。
			SOLAR_TERMS_NAME =
			// Chinese name: 中氣,節氣,中氣,節氣,...
			'春分,清明,穀雨,立夏,小滿,芒種,夏至,小暑,大暑,立秋,處暑,白露,秋分,寒露,霜降,立冬,小雪,大雪,冬至,小寒,大寒,立春,雨水,驚蟄'
					.split(','),
			/**
			 * 每年 24節氣。
			 * 
			 * SOLAR_TERMS_COUNT = 24
			 */
			SOLAR_TERMS_COUNT = SOLAR_TERMS_NAME.length,
			/**
			 * 每節氣 15°。
			 * 
			 * DEGREES_BETWEEN_SOLAR_TERMS = 15
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
			//
			// 各種月相: 新月、上弦月、滿月、下弦月。
			LUNAR_PHASE_NAME = '朔,上弦,望,下弦'.split(','),
			// 本地之 time zone / time offset (UTC offset by minutes)。
			// e.g., UTC+8: 8 * 60 = +480
			// e.g., UTC-5: -5 * 60
			default_offset = library_namespace.String_to_Date
			//
			&& library_namespace.String_to_Date.default_offset
					|| -(new Date).getTimezoneOffset() || 0;

			_.SOLAR_TERMS = SOLAR_TERMS_NAME;

			// ---------------------------------------------------------------------//
			// 初始調整並規範基本常數。

			// ---------------------------------------------------------------------//
			// private tool functions. 工具函數

			/**
			 * use Horner's method to calculate the value of polynomial.
			 * 
			 * @param {Array}coefficients
			 *            coefficients of polynomial.<br />
			 *            coefficients: [ degree 0, degree 1, degree 2, .. ]
			 * @param {Number}variable
			 *            value of (x)
			 * 
			 * @returns {Number} the value of polynomial
			 * 
			 * @see https://en.wikipedia.org/wiki/Horner%27s_method
			 */
			function polynomial_value(coefficients, variable) {
				return coefficients.reduceRight(function(value, coefficient) {
					return value * variable + coefficient;
				});
			}

			_.polynomial_value = polynomial_value;

			/**
			 * get Julian centuries from J2000.0.<br />
			 * J2000.0 起算的儒略世紀數.<br />
			 * Interval between fundamental date J2000.0 and given date.
			 * 
			 * @param {Number}JD
			 *            Julian date
			 * 
			 * @returns {Number} Julian centuries of JD from J2000.0
			 */
			function Julian_century(JD) {
				return (JD - J2000_epoch) / DAYS_OF_JULIAN_CENTURY;
			}

			_.Julian_century = Julian_century;

			// to proper degrees 0–less than 360
			// near_0: -180–less than 180
			function normalize_degrees(degree, near_0) {
				if ((degree %= TURN_TO_DEGREES) < 0)
					degree += TURN_TO_DEGREES;
				if (near_0 && degree >= TURN_TO_DEGREES / 2)
					degree -= TURN_TO_DEGREES;
				return degree;
			}

			_.normalize_degrees = normalize_degrees;

			// 顯示易懂角度。
			function show_degrees(degree, padding) {
				if (!degree)
					return '0°';

				var minus = degree < 0;
				if (minus)
					degree = -degree;

				var value = Math.floor(degree),
				//
				show = '';
				if (value) {
					if (padding >= 0 && value < 100)
						show = value > 9 ? ' ' : '  ';
					show += value + '° ';
				}

				if (degree -= value) {
					value = (degree *= 60) | 0;
					if (value || show)
						show += (padding && value < 10 ? ' ' : '')
						//
						+ value + '′ ';
					if (degree -= value) {
						degree *= 60;
						degree = padding >= 0 ? (degree < 10 ? ' ' : '')
								+ degree.toFixed(padding) : String(degree);
						show += degree.includes('.') ? degree
								.replace('.', '″.') : degree + '″';
					}
				}

				if (minus)
					show = '-' + show;
				return show.replace(/ $/, '');
			}

			_.show_degrees = show_degrees;

			// 計算角度差距(減法)
			// return (base - target), target 會先趨近於 base。或是說結果會向 0 趨近。
			// subtract_degrees(base,target)>0:
			// base>target, base-target>0
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

			// ------------------------------------------------------------------------------------------------------//
			// obliquity 轉軸傾角。

			/**
			 * 地球的平均轉軸傾角，平黃赤交角。 get mean obliquity of the ecliptic (Earth's
			 * axial tilt), IAU 2006 precession model.
			 * 
			 * Reference 資料來源/資料依據:
			 * https://github.com/kanasimi/IAU-SOFA/blob/master/src/obl06.c
			 * 
			 * @param {Number}JD
			 *            Julian date (JD of 天文計算用時間 TT)
			 * 
			 * @returns {Number} obliquity in degrees
			 */
			function mean_obliquity_IAU2006(JD) {
				return polynomial_value(IAU2006_obliquity_coefficients,
				// Interval between fundamental date J2000.0
				// and given date (JC).
				Julian_century(JD)) / DEGREES_TO_ARCSECONDS;
			}

			/**
			 * 地球的平均轉軸傾角，平黃赤交角。 get mean obliquity of the ecliptic (Earth's
			 * axial tilt).
			 * 
			 * Reference 資料來源/資料依據: Laskar, J. (1986). "Secular Terms of
			 * Classical Planetary Theories Using the Results of General
			 * Relativity".
			 * 
			 * J. Laskar computed an expression to order T10 good to 0″.02 over
			 * 1000 years and several arcseconds over 10,000 years.
			 * 
			 * @param {Number}JD
			 *            Julian date, 適用於J2000.0起算前後各10000年的範圍內。
			 * 
			 * @returns {Number} obliquity in degrees
			 */
			function mean_obliquity_Laskar(JD) {
				return polynomial_value(Laskar_obliquity_coefficients,
				// J2000.0 起算的儒略萬年數
				Julian_century(JD) / 100);
			}

			var mean_obliquity = mean_obliquity_Laskar;

			/**
			 * 地球的轉軸傾角，平黃赤交角。<br />
			 * get obliquity of the ecliptic (Earth's axial tilt).
			 * 
			 * @param {Number}JD
			 *            Julian date
			 * 
			 * @returns {Number} obliquity in degrees
			 * 
			 * @see https://en.wikipedia.org/wiki/Axial_tilt
			 */
			function obliquity(JD) {
				return mean_obliquity(JD) + nutation(JD)[1];
			}

			_.obliquity = obliquity;

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
			 * @see <a
			 *      href="http://www.cv.nrao.edu/~rfisher/Ephemerides/times.html"
			 *      accessdate="2015/3/25 20:35">Astronomical Times</a>
			 * @see http://njsas.org/projects/speed_of_light/roemer/tt-utc.html
			 * 
			 * @since 2015/3/21 9:23:32
			 */
			function ΔT(year, month) {
				if (month > 0)
					year += (month - 0.5) / 12;

				var index = 0;
				for (;;) {
					if (year >= ΔT_year_start[index])
						break;
					if (++index === ΔT_year_start.length) {
						// before –500: the same as after 2150.
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

			_.deltaT = ΔT;

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
			 * @param {Number}JD
			 *            Julian date (JD of 日常生活時間 UT)
			 * @param {Boolean}to_UT
			 *            reverse, TT → UT. treat JD as 天文計算用時間 TT.
			 * 
			 * @returns JD of TT
			 */
			function TT_of(JD, to_UT) {
				if (library_namespace.is_Date(JD))
					JD = library_namespace.Date_to_JD(JD);
				var deltaT = ΔT_of_JD(JD) / ONE_DAY_SECONDS;
				// normal: UT → TT.
				// to_UT: TT → UT.
				// 簡略的說，日常生活時間 UT = 天文計算用時間 TT - ΔT
				return to_UT ? JD - deltaT : JD + deltaT;
			}

			/**
			 * get Universal Time of Terrestrial Time JD.
			 * 
			 * @param {Number}JD
			 *            Julian date (JD of 天文計算用時間 TT)
			 * 
			 * @returns JD of UT
			 */
			function UT_of(JD, to_UT) {
				return TT_of(JD, true);
			}

			_.TT = TT_of;

			// ------------------------------------------------------------------------------------------------------//
			// Atmospheric refraction

			/**
			 * true apparent in degrees ← apparent altitude.<br />
			 * 大氣折射公式: 真地平緯度 ← 視地平緯度<br />
			 * 大氣折射又稱蒙氣差、折光差（蒙氣即行星的大氣）
			 * 
			 * Reference 資料來源/資料依據:<br />
			 * Jean Meeus, Astronomical Algorithms.<br />
			 * 《天文算法》 chapter 大氣折射.<br />
			 * based on: G. G. Bennett. (1982). "The Calculation of Astronomical
			 * Refraction in Marine Navigation".
			 * 
			 * @param {Number}apparent
			 *            apparent altitude in degrees. 視地平緯度/高度角，單位是度。
			 * @param {Number}[Celsius]
			 *            temperature in degree Celsius. 攝氏度氣溫
			 * @param {Number}[kPa]
			 *            pressure in kPa. 地表氣壓
			 * 
			 * @returns {Number} degrees of true apparent. 單位是度
			 * 
			 * @since 2015/3/21 21:31:17
			 * 
			 * @see https://en.wikipedia.org/wiki/Atmospheric_refraction#Calculating_refraction
			 * @see http://www.astro.com/ftp/swisseph/src/swecl.c
			 */
			function refraction_to_real(apparent, Celsius, kPa) {
				// (86.63175) get 4.186767499821572e-10
				// 經測試，再多就變負數。
				if (apparent > 86.63175)
					// Jean Meeus: 在90°時，不作第二項修正反而更好。
					return apparent;

				// refraction in arcminutes. 折射角單位是分.
				var refraction = 1 / Math
						.tan((apparent + 7.31 / (apparent + 4.4))
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
				if (kPa >= 0)
					refraction *= kPa / 101;

				// 1度 = 60分
				return apparent - refraction / 60;
			}

			/**
			 * apparent altitude in degrees ← true altitude.<br />
			 * 大氣折射公式: 視地平緯度 ← 真地平緯度
			 * 
			 * @param {Number}real
			 *            real altitude in degrees. 真地平緯度/高度角，單位是度。
			 * @param {Number}[Celsius]
			 *            temperature in degree Celsius. 攝氏度氣溫
			 * @param {Number}[kPa]
			 *            pressure in kPa. 地表氣壓
			 * 
			 * @returns {Number} degrees of apparent altitude. 單位是度
			 * 
			 * @since 2015/3/21 21:31:17
			 * 
			 * @see https://en.wikipedia.org/wiki/Atmospheric_refraction#Calculating_refraction
			 * @see http://www.astro.com/ftp/swisseph/src/swecl.c
			 */
			function refraction(real, Celsius, kPa) {
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
				if (kPa >= 0)
					refraction *= kPa / 101;

				// 1度 = 60分
				return real + refraction / 60;
			}

			refraction.to_real = refraction_to_real;
			_.refraction = refraction;

			// ------------------------------------------------------------------------------------------------------//
			// Sun's aberration. 太陽地心黃經光行差修正量。

			/**
			 * Sun's aberration. 太陽地心黃經光行差修正量。
			 * 
			 * Reference 資料來源/資料依據:<br />
			 * Jean Meeus, Astronomical Algorithms, 2nd Edition.<br />
			 * 《天文算法》 p.167,168 chapter 太陽位置計算.<br />
			 * 
			 * @param {Number}R
			 *            日地距離(天文單位 AU), radius vector in AU。
			 * @param {Number}JD
			 *            Julian date (JD of 天文計算用時間 TT)
			 * 
			 * @returns {Number} degree
			 * 
			 * @see https://en.wikipedia.org/wiki/Aberration_of_light
			 */
			function sun_aberration_high(R, JD) {
				// 儒略千年數 Julian millennia since J2000.0.
				var τ = Julian_century(JD) / 10,
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
				 * If needed with respect to the mean equinox of the date
				 * instead of to a fixed reference frame, the constant term
				 * 3548.193 should be replaced by 3548.330.
				 * 如果Δλ須是在Date黃道(瞬時黃道/當日黃道?)中的，則應把常數項3548.193換為3548.330
				 */
				coefficients[0] += sun_aberration_variation_constant;

				// Daily variation, in arcseconds, of the geocentric longitude
				// of the Sun in a fixed reference frame
				var Δλ = polynomial_value(coefficients, τ),
				//
				aberration = -AU_LIGHT_TIME * R * Δλ / DEGREES_TO_ARCSECONDS;

				if (library_namespace.is_debug(3))
					library_namespace.debug('aberration of radius vector ' + R
							+ ', JD: ' + JD + ': ' + show_degrees(aberration)
							+ '. low-precision method: '
							+ show_degrees(sun_aberration_low(R)), 0);

				return aberration;
			}

			/**
			 * Sun's aberration. 太陽地心黃經光行差修正量。
			 * 
			 * Reference 資料來源/資料依據:<br />
			 * Jean Meeus, Astronomical Algorithms.<br />
			 * 《天文算法》 chapter 太陽位置計算 "太陽地心黃經光行差修正項" 式.<br />
			 * 
			 * @param {Number}R
			 *            日地距離(天文單位 AU), radius vector in AU。
			 * 
			 * @returns {Number} degree
			 * 
			 * @see https://en.wikipedia.org/wiki/Aberration_of_light
			 */
			function sun_aberration_low(R) {
				// 式中分子是光行差常數 constant of aberration
				// κ=20″.49552 arcseconds at J2000
				// 乘以a*(1-e²)，與24.5式的分子相同。
				// 因此24.10中的分子中其實是一個緩慢變化的數，在0年是20″.4893，在+4000年是20″.4904。
				return -20.4898 / DEGREES_TO_ARCSECONDS / R;
				// 24.10式本身不是一個嚴格的準確的運算式，因為它是假設地球軌道是不受攝動的標準橢圓。當受到攝動時，月球的攝動可引起0″.01的誤差。
				// 當需要進行高精度計算時(比使用附錄II計算精度要求更高時)，可用以下方法進行光行差修正
				// sun_aberration_high(R, JD)
			}

			var sun_aberration = sun_aberration_high;

			// ------------------------------------------------------------------------------------------------------//
			// precession 歲差

			/**
			 * calculate general precession / precession of the ecliptic
			 * 
			 * Reference 資料來源/資料依據:<br />
			 * Kai Tang (2015). A long time span relativistic precession model
			 * of the Earth.
			 * 
			 * IAU 2006年將主要的部分重新命名為赤道歲差，而較微弱的成份命名為黃道歲差 (precession of the
			 * ecliptic)，但是兩者的合稱仍是綜合歲差 (general precession)，取代了分點歲差。
			 * 
			 * <q>在J2000.0的时候与P03岁差差大概几个角秒，主要由于周期拟合的时候，很难保证长期与短期同时精度很高。</q>
			 * 
			 * @param {Number}JD
			 *            Julian date (JD of 天文計算用時間 TT)
			 * @param {Boolean}ecliptic
			 *            true: get precession of the ecliptic (黃道歲差). else:
			 *            general precession
			 * 
			 * @returns {Array} [ P, Q ] in degrees
			 */
			function precession(JD, ecliptic) {
				// T 是 J2000.0 起算的儒略世紀數：
				var T = Julian_century(JD),
				//
				terms = ecliptic ? 唐凯_ecliptic_precession_terms
						: 唐凯_precession_terms,
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

				return [ p_A / DEGREES_TO_ARCSECONDS,
						ε_A / DEGREES_TO_ARCSECONDS ];
			}

			_.precession = precession;

			// ------------------------------------------------------------------------------------------------------//
			// nutation 章動

			var IAU2000B_nutation_offset_Δψ, IAU2000B_nutation_offset_Δε;
			(function() {
				var d = 2 * Math.PI / ONE_DAY_SECONDS / 1e3;
				IAU2000B_nutation_offset_Δψ = -0.135 * d;
				IAU2000B_nutation_offset_Δε = 0.388 * d;
			})();

			/**
			 * IAU 2000B model nutation (地球章動) 修正值。
			 * 
			 * Reference 資料來源/資料依據:<br />
			 * Nutation, IAU 2000B model.
			 * https://github.com/kanasimi/IAU-SOFA/blob/master/src/nut00b.c
			 * 
			 * @param {Number}JD
			 *            Julian date (JD of 天文計算用時間 TT)
			 * @param {Boolean}Δψ_only
			 *            only get 黃經章動Δψ
			 * 
			 * @returns {Array} [ 黃經章動Δψ, 黃赤交角章動Δε ] (radians)
			 * 
			 * @see http://www.neoprogrammics.com/nutations/nutations_1980_2000b/index.php
			 */
			function IAU2000B_nutation(JD, Δψ_only) {
				// T 是 J2000.0 起算的儒略世紀數：
				var T = Julian_century(JD),
				//
				parameters = [], Δψ = 0, Δε = 0;
				IAU2000B_nutation_parameters.forEach(function(parameter) {
					parameters.push((polynomial_value(parameter, T)
					//
					% TURN_TO_ARCSECONDS) * ARCSECONDS_TO_RADIANS);
				});

				library_namespace.debug('Julian centuries from J2000.0: ' + T,
						4);

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

				library_namespace.debug(
				//
				'IAU2000B nutation 章動修正值 of JD' + JD + ' ('
						+ library_namespace.JD_to_Date(JD).format('CE') + '): '
						+ Δψ / DEGREES_TO_RADIANS + '°, ' + Δε
						/ DEGREES_TO_RADIANS + '°', 3);
				return Δψ_only ? Δψ : [ Δψ, Δε ];
			}

			/**
			 * IAU 1980 model nutation (地球章動) 修正值。
			 * 
			 * @param {Number}JD
			 *            Julian date (JD of 天文計算用時間 TT)
			 * @param {Boolean}Δψ_only
			 *            only get 黃經章動Δψ
			 * 
			 * @returns {Array} [ 黃經章動Δψ, 黃赤交角章動Δε ] (degrees)
			 */
			function IAU1980_nutation(JD, Δψ_only) {
				// T 是 J2000.0 起算的儒略世紀數：
				var T = Julian_century(JD),
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
				T = 1e4 * DEGREES_TO_ARCSECONDS;
				return Δψ_only ? Δψ / T : [ Δψ / T, Δε / T ];
			}

			var nutation = IAU2000B_nutation;
			_.nutation = nutation;

			// ------------------------------------------------------------------------------------------------------//
			// VSOP87 planets model

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
			 * VSOP87 行星的日心座標位置 (Heliocentric ecliptic spherical coordinates)
			 * 計算。<br />
			 * 得到行星在動力學Date平黃道座標(Bretagnon的VSOP定義的)中的日心黃經L、黃緯B。<br />
			 * <br />
			 * does not include nutation or aberration.
			 * 
			 * 依 vsop87.doc 的說法，VSOP87D 已 apply precision:<br />
			 * ftp://ftp.imcce.fr/pub/ephem/planets/vsop87/vsop87.doc<br />
			 * The coordinates of the versions C and D are given in the frame
			 * defined by the mean equinox and ecliptic of the date. This frame
			 * is deduced from the previous one by precessional moving between
			 * J2000 and the epoch of the date.
			 * 
			 * Reference 資料來源/資料依據:<br />
			 * Jean Meeus, Astronomical Algorithms, 2nd Edition.<br />
			 * 《天文算法》 chapter 太陽位置計算.
			 * 
			 * @param {Number}JD
			 *            Julian date (JD of 天文計算用時間 TT)
			 * @param {String}object
			 *            planets 行星.
			 * @param {Object}[options]
			 *            options 設定特殊功能:<br />
			 *            {String|Array}options.terms: request terms.<br />
			 *            L: 日心黃經 the ecliptical longitude in radians (弧度)
			 *            真黃經，不是軌道經度, NOT the orbital longitude<br />
			 *            B: 日心黃緯 the ecliptical latitude in radians (弧度)<br />
			 *            R: 行星到太陽的距離 the radius vector (distance to the Sun) in
			 *            AU (Astronomical Units)<br />
			 *            <br />
			 *            {Boolean}options.FK5: translate VSOP87 coordinate to
			 *            the FK5 frame. default: true<br />
			 *            <br />
			 *            {Boolean}options.degrees: translate radians to
			 *            degrees.
			 * 
			 * @returns {Object} { L:longitude in radians, B:latitude in
			 *          radians, R:distance in AU }
			 */
			function VSOP87(JD, object, options) {
				// 儒略千年數 Julian millennia since J2000.0.
				var τ = Julian_century(JD) / 10,
				//
				coordinate = library_namespace.null_Object(),
				//
				object_terms = VSOP87_terms[VSOP87.object_name(object)];
				if (!object_terms)
					throw new Error('VSOP87: Invalid object [' + object + ']');

				// 前置處理。
				if (!library_namespace.is_Object(options))
					options = library_namespace.null_Object();

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
						library_namespace.err('VSOP87: Invalid term name: ['
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

					coordinate[term_name] =
					// L=(L0+L1*τ+L2*τ²+L3*τ³+L4*τ⁴+L5*τ⁵)/10⁸
					// (倍數: 10⁻⁸)
					polynomial_value(coefficients, τ);
					// 倍數
					if (object_terms.multiplier > 0)
						coordinate[term_name] *= object_terms.multiplier;
					library_namespace.debug(object
							+ '.'
							+ term_name
							+ ' @ '
							+ JD
							+ ' ≈ '
							+ (term_name === 'R' ? coordinate[term_name]
									+ '  AU' : show_degrees(normalize_degrees(
									coordinate[term_name] / DEGREES_TO_RADIANS,
									term_name === 'B'))) + ' (coefficients: '
							+ coefficients.join(', ') + ')', 3);
				});

				/**
				 * 座標變換: 轉換到 FK5 (第5基本星表, The Fifth Fundamental Catalogue) 坐標系統。<br />
				 * VSOP87 → FK5: translate VSOP87 coordinate to the FK5 frame.
				 * 
				 * Reference 資料來源/資料依據:<br />
				 * Jean Meeus, Astronomical Algorithms, 2nd Edition.<br />
				 * p. 219 formula 32.3
				 * 
				 * 太陽黃經☉及黃緯β是P.Bretagnon的VSOP行星理論定義的動力學黃道坐標。這個參考系與標準的FK5坐標系統(詳見20章)僅存在很小的差別。
				 * 可按以下方法把☉、β轉換到FK5坐標系統中,其中T是J2000起算的儒略世紀數,或T=10τ。
				 * J2000.0的VSOP黃道與J2000.0的FK5黃道存在一個很小的夾角 E = 0″.0554 左右，所以作以上修正。
				 * 
				 * @see http://www.astrosurf.com/jephem/astro/ephemeris/et520transfo_en.htm
				 */
				if (options.FK5 !== false) {
					// 先計算 L′ = L - 1°.397*T - 0°.00031*T²
					var _L = polynomial_value([ coordinate.L,
							-1.397 * DEGREES_TO_RADIANS,
							-0.00031 * DEGREES_TO_RADIANS ], 10 * τ),
					//
					cos_L = Math.cos(_L), sin_L = Math.sin(_L);

					// ΔL
					_L = 0.03916 * ARCSECONDS_TO_RADIANS * (cos_L + sin_L)
							* Math.tan(coordinate.B) - 0.09033
							* ARCSECONDS_TO_RADIANS;
					library_namespace.debug('FK5 correction of ' + object + '.'
							+ 'L @ ' + JD + ' ≈ ' + coordinate.L + ' + '
							+ show_degrees(_L / DEGREES_TO_RADIANS), 3);
					coordinate.L += _L;

					// ΔB
					_L = 0.03916 * ARCSECONDS_TO_RADIANS * (cos_L - sin_L);
					library_namespace.debug('FK5 correction of ' + object + '.'
							+ 'B @ ' + JD + ' ≈ ' + coordinate.B + ' + '
							+ show_degrees(_L / DEGREES_TO_RADIANS), 3);
					coordinate.B += _L;
				}

				if (options.degrees) {
					if (coordinate.L)
						coordinate.L /= DEGREES_TO_RADIANS;
					if (coordinate.B)
						coordinate.B /= DEGREES_TO_RADIANS;
				}

				return terms.length > 1 ? coordinate : coordinate[terms[0]];
			}

			_.VSOP87 = VSOP87;

			/**
			 * 正規化行星名稱。
			 * 
			 * @param {String}object
			 *            planets 行星.
			 * 
			 * @returns {String|Undefined} 行星名稱
			 */
			VSOP87.object_name = function(object) {
				if (typeof object === 'string')
					return object.trim().toLowerCase();
			};

			/**
			 * 增加指定行星的計算數據，提供給模組內部函數使用。
			 * 
			 * @param {String}object
			 *            planets 行星.
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
			 * 載入指定行星的計算數據後，執行 callback。提供給模組外部函數使用。
			 * 
			 * @param {String}object
			 *            planets 行星.
			 * @param {Function}callback
			 *            callback.
			 */
			function VSOP87_load_terms(object, callback) {
				library_namespace.run(library_namespace
						.get_module_path(module_name
								+ library_namespace.env.path_separator
								+ 'VSOP87_' + VSOP87.object_name(object)), [
						function() {
							library_namespace.info(
							//
							'VSOP87_load_terms: resource file of [' + object
									+ '] loaded.');
						}, callback ]);
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
			 *            options 設定特殊功能
			 * 
			 * @since 2015/4/15 ‏‎17:46:12, 2015/4/18 21:36:12
			 */
			function convert_VSOP87_file(file_name, options) {
				// 前置處理。
				if (!library_namespace.is_Object(options))
					options = library_namespace.null_Object();

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
					terms = library_namespace.null_Object();

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

							console.log(object + ' ' + type + ' ' + fields[7]
									+ ' ' + fields[8] + ' terms');
							return;
						}

						if (false && terms[type].length === 1
								&& group.length === 0)
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
					+ (options.type || '') + new_line + library_namespace.Class
							+ '.' + (options.name || 'VSOP87') + '.add_terms(',
					//
					postfix = options.postfix || new_line + ');';
					fs.writeFile(options.name + '_' + object + '.js', prefix
							+ JSON.stringify(object)
							+ ','
							+ new_line
							+ JSON.stringify(terms).replace(/(\]\],)/g,
									'$1' + new_line) + postfix, {
						encoding : encoding
					});

				});
			}

			VSOP87.convert = convert_VSOP87_file;

			// ------------------------------------------------------------------------------------------------------//
			// solar coordinates 太陽位置(坐標) & 二十四節氣 (solar terms)

			/**
			 * 低精度分點和至點的時刻, 太陽視黃經λ為0°或90°或180°或270°. 在 1951–2050 CE 的誤差 < 1分.
			 * 
			 * Reference 資料來源/資料依據:<br />
			 * Jean Meeus, Astronomical Algorithms.<br />
			 * 《天文算法》 chapter 分點和至點.<br />
			 * 
			 * @param {Integer}year
			 *            年
			 * @param {Integer}index
			 *            0–3: [ 3月春分 0°, 6月夏至 90°, 9月秋分 180°, 12月冬至 270° ]<br />
			 *            aka. [ March equinox, June solstice, September
			 *            equinox, December solstice ]
			 * 
			 * @returns {Number} Julian date (JD of 天文計算用時間 TT)
			 */
			function equinox(year, index, no_fix) {
				// year is an integer; other values for year, would give
				// meaningless results!
				var JD = (year |= 0) < 1000 ? equinox_terms_before_1000
						: equinox_terms_after_1000;
				// 計算相應的"平"分點或"平"至點的時刻。
				JD = polynomial_value(JD[index |= 0], (year < 1000 ? year
						: year - 2000) / 1000);

				if (no_fix)
					// get 太陽分點和至點"平"黃經。
					return JD;

				var T = Julian_century(JD),
				//
				W = (35999.373 * T - 2.47) * DEGREES_TO_RADIANS,

				// 太陽平黃經→太陽視黃經
				// 要計算的分點或至點時刻(儒略曆書時,即力學時）表達為：
				λ = JD + 0.00001 *
				// JDE0 + 0.00001 S / Δλ 日
				equinox_periodic_terms.reduce(function(S, terms) {
					return S + terms[0] * Math.cos(terms[1] + terms[2] * T);
				}, 0) /
				// Δλ
				(1 + 0.0334 * Math.cos(W) + 0.0007 * Math.cos(2 * W));

				// λ: 太陽黃經☉是Date黃道分點座標(瞬時黃道/當日黃道?)的真幾何黃經。
				// 要取得視黃經λ，還應加上精確的黃經章動及光行差。
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
			 * Jean Meeus, Astronomical Algorithms, 2nd Edition.<br />
			 * 《天文算法》 p.166–p. 169 Example 25.b
			 * 
			 * @param {Number}JD
			 *            Julian date (JD of 天文計算用時間 TT)
			 * 
			 * @returns {Object} { apparent:太陽視黃經, λ:地心黃經(度), β:地心黃緯β(度),
			 *          Δ:日地距離(m), L:黃經 longitude, B:黃緯 latitude, R:距離 radius
			 *          vector }
			 */
			function solar_coordinate(JD) {
				// heliocentric coordinate. 計算日心坐標中地球的位置。
				var heliocentric = VSOP87(JD, solar_terms_object, {
					degrees : true
				});

				// 弧度單位日心黃經L → 地心黃經(geocentric longitude)λ(度)
				// Jean Meeus 文中以 "☉" 表示此處之 λ。
				var λ = heliocentric.L + TURN_TO_DEGREES / 2,
				// 弧度單位日心黃緯B → 地心黃緯β(度)
				β = -heliocentric.B;

				// 太陽的視黃經 (apparent longitude)λ(度)（受光行差及章動影響）
				// Jean Meeus 文中以 "λ" 表示此處之視黃經 apparent。
				//
				// https://en.wikipedia.org/wiki/Apparent_longitude
				// Apparent longitude is used in the definition of
				// equinox and solstice.
				// 節氣以太陽視黃經為準。
				// ** 問題:但中國古代至點以日長為準。兩者或可能產生出入？
				var apparent = λ
				// 修正太陽光行差 aberration。
				+ sun_aberration(heliocentric.R, JD)
				// 修正章動 nutation。
				+ nutation(JD, true) / DEGREES_TO_RADIANS;

				// https://en.wikipedia.org/wiki/Ecliptic_coordinate_system#Spherical_coordinates
				return Object.assign(heliocentric, {
					// geocentric
					λ : normalize_degrees(λ),
					β : normalize_degrees(β),
					Δ : heliocentric.R * AU_TO_METERS,

					// apparent longitude
					apparent : normalize_degrees(apparent)
				// TODO: apparent latitude
				});
			}

			_.solar_coordinate = solar_coordinate;

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
				JD = equinox(year, index, true);
				// 經測試，有時每天太陽的視黃經 (apparent longitude) 可能會增加近 .95°
				// NOT 360/365.25

				// 太陽的視黃經最大變化量。
				// http://jpkc.haie.edu.cn/jpkc/dqgl/content.asp?classid=17&id=528
				// 在遠日點，地球公轉慢，太陽每日黃經差Δλ也慢，為57′
				// 在近日點，地球公轉快，太陽每日黃經差Δλ也快，為61′

				if (degrees % EQUINOX_SOLSTICE_DEGREES > 0)
					JD += ((index === 3 ? equinox(year + 1, 0) : equinox(year,
							index + 1)) - JD)
							// 以內插法(線性插值)取得近似值。
							* (degrees - index * EQUINOX_SOLSTICE_DEGREES)
							/ EQUINOX_SOLSTICE_DEGREES;

				// 最多趨近 JD_of_solar_angle.max_calculations 次。
				for (index = JD_of_solar_angle.max_calculations; index-- > 0;) {
					apparent = solar_coordinate(JD).apparent;
					// 由公式(26.1)得到對“大約時間”的修正量。
					// +58 sin (k·90° - λ) (26.1)
					offset = 58 * Math.sin((degrees - apparent)
							* DEGREES_TO_RADIANS);
					// ↑ 58: maybe 59 = 360/365.25*60 ??
					// https://www.ptt.cc/bbs/sky/M.1175584311.A.8B8.html

					if (false)
						library_namespace.debug('index ' + index
								+ ': apparent: ' + show_degrees(apparent)
								+ ', offset in days: ' + offset);

					if (Math.abs(offset) < JD_of_solar_angle.error)
						// 當 error 設定得很小時，似乎會達到固定循環。
						break;
					// adapt 修正量。
					JD += offset;
				}

				// apply ΔT: TT → UT.
				return UT_of(JD);
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
			 * 注意: 1979/1/20 (中曆1978年12月22日) is 大寒 (300°), not 實曆 1979/1/21
			 * (according to 中央氣象局
			 * http://www.cwb.gov.tw/V7/astronomy/cdata/calpdf/calpdf.htm,
			 * 中国科学院紫金山天文台 公农历查询 http://almanac.pmo.ac.cn/cx/gzn/index.htm and
			 * 香港天文台 http://www.weather.gov.hk/gts/time/conversionc.htm ).
			 * According to HORIZONS (DE-431), it seems at about 1979/1/20
			 * 23:59:55.55.
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

				if (type === 1)
					angle = (index | 0) * TURN_TO_DEGREES
							/ EQUINOX_SOLSTICE_COUNT;
				else {
					if (!index)
						angle = 0;
					else if (isNaN(angle = index) && (NOT_FOUND ===
					//
					(angle = SOLAR_TERMS_NAME.indexOf(index)))) {
						library_namespace.err(
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
			 * @param {Number}JD
			 *            Julian date (JD of 日常生活時間 UT)
			 * @param {Object}[options]
			 *            options 設定特殊功能:<br />
			 *            options.days: 回傳 [ 節氣年 year (以"春分"分年, 非立春後才過年!), 節氣序
			 *            index, 已經過日數/剩下幾日 ]。<br />
			 *            options.pentads: 亦標示七十二候 (物候, 72 pentads)<br />
			 *            options.time: 取得節氣名時，亦取得交節時刻。
			 * 
			 * @returns {String|Undefined|Array}
			 * 
			 * @see http://koyomi8.com/24sekki.htm
			 */
			function solar_term_of_JD(JD, options) {

				// return the nearest (test_next: thie next one) solar
				// term JD.
				function get_cache(test_next) {
					if (!date)
						date = library_namespace.JD_to_Date(JD);
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
					options = library_namespace.null_Object();

				var index, days, date, year,
				//
				apparent = solar_coordinate(JD).apparent;

				// get days, 回傳已經過幾日。
				if (options.days) {
					// 先取得 距離上一節氣之日數。
					days = get_cache(true) - JD | 0;
					// days === 0: 當天交節。
					if (days !== 0 && options.days !== 'next')
						// 'next': 距離下一節氣之日數。天文節氣 剩餘日數。
						index--, days = Math.ceil(JD - get_cache());
					// others (passed days): 距離上一節氣之日數。天文節氣 經過日數。
					return [ year, index, days ];
				}

				if (DEGREES_BETWEEN_SOLAR_TERMS
				// assert: 超過2度，就不會是在同一天。
				- (apparent % DEGREES_BETWEEN_SOLAR_TERMS) < 2) {
					// JD 再過一下下便是節氣。
					// 測試本日0時是否距離下一節氣發生時間1天內。
					// assert: 此範圍內不可能為物候。
					days = get_cache(true) - JD;

					// JD 將被視為當地時間當日0時!
					if (0 <= days && days < 1) {
						// 初候
						index = SOLAR_TERMS_NAME[index];
						if (options.time) {
							index += ' ' + ((days *= 24) | 0) + ':';
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
				// JD 將被視為當地時間當日0時，因此只要節氣在 JD 之前，皆表示本日非節氣，僅能測試物候。
				// || (apparent % DEGREES_BETWEEN_SOLAR_TERMS < 2)
				) {
					// days = 與前一個節氣之間距。
					days = JD - get_cache();
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

			// copy from data.date.
			// 一整天的 time 值。should be 24 * 60 * 60 * 1000 = 86400000.
			var ONE_DAY_LENGTH_VALUE = new Date(0, 0, 2) - new Date(0, 0, 1),
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
				this.term_index < solar_term_starts_year ? CE_year
						: CE_year - 1, this.term_index), this.minute_offset,
						true);

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
			 *            options 設定特殊功能
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
					library_namespace.err(
					//
					'solar_term_calendar: Invalid term: [' + term + ']');
					return;
				}

				var cache = term_index + '/' + (minute_offset |= 0);
				cache = solar_term_calendar_cache[cache]
				//
				|| (solar_term_calendar_cache[cache]
				//
				= library_namespace.null_Object());

				// 不動到原 options。
				options = Object.assign(library_namespace.null_Object(),
						options);

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
			立春年_OFFSET = (MONTH_COUNT + START_MONTH) * SOLAR_TERMS_MONTH_RATE
					- 立春NO | 0;

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
			 *            options 設定特殊功能
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
					if ((date[1] = date[1] * SOLAR_TERMS_MONTH_RATE
							- 立春年_OFFSET) < 0)
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
					date[1] = (date[1] + 立春年_OFFSET) / SOLAR_TERMS_MONTH_RATE
							| 0;
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
			// LEA-406a, LEA-406b lunar model & periodic terms

			/**
			 * 預設使用 type，'a' or 'b'。
			 * 
			 * a 相當耗資源。當前 HORIZONS 已使用 DE-431 LE-431，與 LEA-406 及 ELP/MPP02
			 * 相差不小。何況 a, b 常僅差不到 10秒，因此似無必要使用 LEA-406a。
			 */
			LEA406.default_type = 'b';

			var LEA406_name = 'LEA-406',
			/**
			 * the mean longitude of the Moon referred to the moving ecliptic
			 * and mean equinox of date (Simon et al. 1994). (formula 9)
			 * 
			 * Simon (1994): "Numerical expressions for precession formulae and
			 * mean elements for the Moon and the planets"
			 * 
			 * (b.3) Mean elements referred to the mean ecliptic and equinox of
			 * date (P_1 = 5028″.8200/cy)
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
			 * 計算月亮位置(坐標)，採用完整的 LEA-406a, LEA-406b。 Using full LEA-406a or
			 * LEA-406b model.
			 * 
			 * Reference 資料來源/資料依據:<br />
			 * S. M. Kudryavtsev, Long-term harmonic development of lunar
			 * ephemeris, Astronomy & Astrophysics 471 (2007), pp. 1069-1075.
			 * http://www.eas.slu.edu/GGP/kudryavtsev/LEA-406.zip
			 * <q>This is 9–70 times better than the accuracy of the latest analytical theory of lunar motion ELP/MPP02, and the number of terms in the new development is less than that in ELP/MPP02.</q>
			 * 
			 * @param {Number}JD
			 *            Julian date (JD of 天文計算用時間 TT)
			 * @param {Object}[options]
			 *            options 設定特殊功能:<br />
			 *            {String|Array}options.terms: request terms.<br />
			 *            V: 黃經 in degrees. ecliptic longitude reckoned along
			 *            the moving ecliptic from the mean equinox of date<br />
			 *            U: 黃緯 in degrees. ecliptic latitude reckoned from the
			 *            moving ecliptic<br />
			 *            R: 地心距離 in km. geocentric distance
			 * 
			 * @returns {Object} { V:longitude in degrees, U:latitude in
			 *          degrees, R:distance in km }
			 * 
			 * @see http://www.gautschy.ch/~rita/archast/ephemeriden.html
			 * @see https://github.com/infinet/lunar-calendar/
			 */
			function LEA406(JD, options) {
				// 前置處理。
				if (!library_namespace.is_Object(options))
					options = typeof options === 'string' ? {
						terms : options
					} : library_namespace.null_Object();

				// 儒略千年數 Julian millennia since J2000.0.
				var τ = Julian_century(JD) / 10,
				// τ²
				τ2 = τ * τ, terms = options.terms,
				//
				warn_term = !options.ignore_term,
				/**
				 * spherical coordinates of its centre:
				 * 
				 * r: 地心距離 in km. (geocentric distance)
				 * 
				 * V: 從曆元平春分點沿移動黃道的黃經 in degrees. (ecliptic longitude reckoned
				 * along the moving ecliptic from the mean equinox of date)
				 * 
				 * U: 移動黃道計算的黃緯 in degrees. (ecliptic latitude reckoned from the
				 * moving ecliptic)
				 */
				coordinates = library_namespace.null_Object();

				library_namespace.debug(JD + ': τ: ' + τ + ', τ²: ' + τ2, 3);

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
							library_namespace.err(
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
					library_namespace.debug(JD + '.' + term + ': ' + sum, 3);

					// Amp_to_integer: see convert_LEA406()
					sum /= Amp_to_integer;

					// R in km
					if (term !== 'R') {
						if (term === 'V')
							sum += polynomial_value(LEA406_V_coefficients, τ);
						// V, U in arcseconds → degrees
						sum /= DEGREES_TO_ARCSECONDS;
					}
					coordinates[term] = sum;
				});

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
			var LEA406_terms = library_namespace.null_Object();

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
				var name = LEA406_name + type + '-' + term_name;
				library_namespace.run(library_namespace
						.get_module_path(module_name
						//
						+ library_namespace.env.path_separator + name), [
						function() {
							library_namespace.info(
							//
							'LEA406_load_terms: resource file of [' + name
									+ '] loaded, '
									+ LEA406_terms[term_name + type].length
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
			 * convert_LEA406 使用之行星數據。
			 * 
			 * mean longitudes of major planets.
			 */
			var convert_LEA406_argument,
			// 將 Amp 轉整數: Amp *= 1e7 (表格中小數7位數)。
			Amp_to_integer = 1e7;

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
			 *            options 設定特殊功能
			 * 
			 * @since 2015/4/20
			 */
			function convert_LEA406(file_name, options) {
				// 前置處理。
				if (!library_namespace.is_Object(options))
					options = library_namespace.null_Object();

				var encoding = options.encoding || 'ascii',
				//
				floating = 9,
				// 需要先設定 fs = require('fs');
				// https://nodejs.org/api/fs.html
				fs = require('fs'), argument = convert_LEA406_argument;

				if (!argument)
					// cache
					convert_LEA406_argument = argument
					// @see ReadMe_Eng.pdf, from build_LEA406.txt
					// all in arcseconds.
					= [
							// [0]: 為配合 fields.
							null,
							[ 485868.249036, 17179159232.178, 3187.92, 51.635,
									-2.447 ],
							[ 1287104.793048, 1295965810.481, -55.32, 0.136,
									-0.1149 ],
							[ 335779.526232, 17395272628.478, -1275.12, -1.037,
									0.0417 ],
							[ 1072260.703692, 16029616012.09, -637.06, 6.593,
									-0.3169 ],
							[ 450160.398036, -69679193.631, 636.02, 7.625,
									-0.3586 ],
							[ 908103.259872, 5381016286.88982, -1.92789,
									0.00639, 0 ],
							[ 655127.28306, 2106641364.33548, 0.59381,
									-0.00627, 0 ],
							[ 361679.244588, 1295977422.83429, -2.04411,
									-0.00523, 0 ],
							[ 1279558.798488, 689050774.93988, 0.94264,
									-0.01043, 0 ],
							[ 123665.467464, 109256603.77991, -30.60378,
									0.05706, 0.04667 ],
							[ 180278.79948, 43996098.55732, 75.61614, -0.16618,
									-0.11484 ],
							[ 1130598.018396, 15424811.93933, -1.75083,
									0.02156, 0 ],
							[ 1095655.195728, 7865503.20744, 0.21103, -0.00895,
									0 ],
							[ 0, 50288.2, 111.2022, 0.0773, -0.2353 ] ];

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

					data.forEach(function(line) {
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
						// ϕ: Phase1, Phase2 →
						// in arcseconds
						// ϕ: Phase 有
						// 12位數，*DEGREES_TO_ARCSECONDS
						// 之後最多10位數
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
								argument[i].forEach(function(a, index) {
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
					+ (options.type || '') + new_line + library_namespace.Class
							+ '.' + name.replace(/-/g, '') + '.add_terms(',
					//
					postfix = options.postfix || new_line + ');';
					fs.writeFile(name + (options.type || '') + '-'
							+ options.term + '.js', prefix
							+ JSON.stringify(options.term
									+ (options.type || ''))
							+ ','
							+ new_line
							+ JSON.stringify(terms).replace(/,0/g, ',')
									.replace(/,+\]/g, ']').replace(/(\]\],)/g,
											'$1' + new_line)
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
			 * lunar coordinates, moon's coordinates 月亮位置(坐標)計算。<br />
			 * get lunar angle, moon's angle. 僅將 LEA-406 修正章動 nutation。
			 * 
			 * @param {Number}JD
			 *            Julian date (JD of 天文計算用時間 TT)
			 * 
			 * @returns {Object} { V:longitude in degrees, U:latitude in
			 *          degrees, R:distance in km }
			 */
			function lunar_coordinate(JD) {
				var coordinates = LEA406(JD);

				if (coordinates.V || coordinates.U) {
					var n = nutation(JD);
					if (coordinates.V) {
						// V, U in arcseconds

						/**
						 * 修正經度 of 月亮光行時間 light-time correction (Moon's
						 * light-time)。忽略對緯度之影響。
						 * 
						 * Reference 資料來源/資料依據:<br />
						 * Jean Meeus, Astronomical Algorithms, 2nd Edition.<br />
						 * 《天文算法》 p. 337 formula 49.1.<br />
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
						var light_time = -0.70 / DEGREES_TO_ARCSECONDS;
						if (false)
							(function() {
								/**
								 * 錯誤的方法:
								 * 
								 * @deprecated
								 */
								// coordinates.R in km
								var r = coordinates.R || LUNAR_DISTANCE_KM;
								// 地球半徑。
								r -= TERRA_RADIUS_KM;
								// 1000: 1 km = 1000 m (CELERITAS in m/s)
								light_time = -r * 1000 / CELERITAS
										* TURN_TO_DEGREES / ONE_DAY_SECONDS;
								library_namespace.debug(
								//
								'月亮經度光行差 of JD'
										+ JD
										+ ' ('
										+ library_namespace.JD_to_Date(JD)
												.format('CE') + '): '
										+ show_degrees(light_time), 3);
							});
						coordinates.V += light_time;

						/**
						 * 修正章動 nutation: LEA-406 基於 LE406，未包含 nutations,
						 * librations。
						 * 
						 * @see http://www.projectpluto.com/jpl_eph.htm
						 * 
						 * DE405 : Created May 1997; includes both nutations and
						 * librations. Referred to the International Celestial
						 * Reference Frame. Covers JED 2305424.50 (1599 DEC 09)
						 * to JED 2525008.50 (2201 FEB 20)
						 * 
						 * DE406 : Created May 1997; includes neither nutations
						 * nor librations. Referred to the International
						 * Celestial Reference Frame. Spans JED 0625360.5 (-3000
						 * FEB 23) to 2816912.50 (+3000 MAY 06)
						 */
						coordinates.V += n[0] / DEGREES_TO_RADIANS;
						coordinates.V = normalize_degrees(coordinates.V);
					}
					if (coordinates.U) {
						// V, U in arcseconds
						// 修正章動 nutation。
						coordinates.U += n[1] / DEGREES_TO_RADIANS;
						coordinates.U = normalize_degrees(coordinates.U, true);
					}
				}

				return coordinates;
			}

			_.lunar_coordinate = lunar_coordinate;

			var lunar_phase_of_JD_cache = [];

			/**
			 * get the longitudinal angle between the Moon and the Sun. 計算 JD
			 * 時的月日視黃經差（月-日）。
			 * 
			 * @param {Number}JD
			 *            Julian date (JD of 天文計算用時間 TT)
			 * @param {Boolean}normalize_360
			 *            正規化成 0°–360°，而非 -180°–180°。
			 * 
			 * @returns {Number} degrees
			 */
			function lunar_phase_angel_of_JD(JD, normalize_360) {
				var degrees;

				if (JD in lunar_phase_of_JD_cache)
					degrees = lunar_phase_of_JD_cache[JD];
				else if (!isNaN(degrees
				// 可以忽略章動的影響。
				= lunar_coordinate(JD).V - solar_coordinate(JD).apparent))
					lunar_phase_of_JD_cache[JD] = degrees;

				if (!isNaN(degrees))
					degrees = library_namespace.normalize_degrees(degrees,
							!normalize_360);
				return degrees;
			}

			_.lunar_phase_angel_of_JD = lunar_phase_angel_of_JD;

			/**
			 * 平月相的不變時間參數。
			 * 
			 * Reference 資料來源/資料依據:<br />
			 * Jean Meeus, Astronomical Algorithms, 2nd Edition.<br />
			 * 《天文算法》 p. 349 formula 49.1.<br />
			 * 
			 * @type {Array}
			 * 
			 * @inner
			 */
			var mean_lunar_phase_coefficients = [ 2451550.09766,
			// 29.530588861 * k, but k = 1236.85 * T.
			29.530588861 * 1236.85, 0.00015437, -0.000000150, 0.00000000073 ];

			/**
			 * 平月相的時間，已修正了太陽光行差及月球光行時間。<br />
			 * The times of the mean phases of the Moon, already affected by the
			 * Sun's aberration and by the Moon's light-time
			 * 
			 * Reference 資料來源/資料依據:<br />
			 * Jean Meeus, Astronomical Algorithms, 2nd Edition.<br />
			 * 《天文算法》 p. 349 formula 49.1.<br />
			 * 
			 * @param {Number}year_month
			 *            帶小數點的年數
			 * @param {Integer}phase
			 *            0:朔0°, 1:上弦90°, 2:望180°, 3:下弦270°
			 * @param {Object}[options]
			 *            options 設定特殊功能:<br />
			 *            {Boolean}options.nearest: 取得最接近之月相時間。
			 * 
			 * @returns {Number} Julian date (JD of 天文計算用時間 TT)
			 */
			function mean_lunar_phase(year_month, phase, options) {
				phase /= 4;
				var k = (year_month - 2000) * 12.3685,
				// 取 year_month 之後，第一個 phase。
				T = Math.floor(k) + phase;
				if (options.nearest && T - k > .5)
					// 取前一個。
					k = T - 1;
				else
					// 取之後最接近的。
					k = T;

				// T是J2000.0起算的儒略世紀數，用下式可得到足夠的精度：
				T = k / 1236.85;

				var JD = polynomial_value(mean_lunar_phase_coefficients, T);

				return JD;
			}

			/**
			 * get JD of lunar phase. Using full LEA-406a or LEA-406b model.
			 * 計算特定月相之時間精準值。可用來計算月相、日月合朔(黑月/新月)、弦、望(滿月，衝)、月食、月齡。
			 * 
			 * @deprecated using accurate_lunar_phase()
			 * 
			 * @param {Number}year_month
			 *            帶小數點的年數
			 * @param {Integer}phase
			 *            0:朔0°, 1:上弦90°, 2:望180°, 3:下弦270°
			 * @param {Object}[options]
			 *            options 設定特殊功能
			 * 
			 * @returns {Number} Julian date (JD of 日常生活時間 UT)
			 * 
			 * @see http://koyomi8.com/sub/sunmoon_long.htm
			 * @see http://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/phenom_phase.cgi
			 * @see http://homepage3.nifty.com/ayumi_ho/moon1.htm
			 * @see http://www2s.biglobe.ne.jp/~yoss/moon/moon.html
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
				JD = mean_lunar_phase(year_month, phase, options),
				// 計算月日視黃經差。
				angel = // options
				//
				// && typeof options.angel === 'function' ? options.angel :
				//
				degrees < 90 ? function(_JD) {
					// window.lunar_count = (window.lunar_count || 0) + 1;
					var d = lunar_phase_angel_of_JD(_JD || JD, true);
					if (d > TURN_TO_DEGREES - 90)
						d -= TURN_TO_DEGREES;
					return d;
				} : function(_JD) {
					return lunar_phase_angel_of_JD(_JD || JD, true);
				},
				// 誤差常於2°之內。
				result_degrees = angel();

				// / 12: 月日視黃經差每日必於 12°–13°之內。
				// 因此每度耗時必小於 1/12 日。此處取最大值。
				if (degrees < result_degrees) {
					// 將 JD 作為上限。
					up_JD = JD, up_degrees = result_degrees;
					// 以 result 反推出一個<b>一定</b>小於目標 JD 之下限。
					low_JD = JD - (result_degrees - degrees) / 12;
					low_degrees = angel(low_JD);
				} else {
					// 將 JD 作為下限。
					low_JD = JD, low_degrees = result_degrees;
					// 以 result 反推出一個<b>一定</b>大於目標 JD 之上限。
					up_JD = JD - (result_degrees - degrees) / 12;
					up_degrees = angel(up_JD);
				}

				library_namespace.debug('初始值: year ' + year_month + ', phase '
						+ phase + ' (' + degrees + '°): JD' + JD + ' ('
						+ library_namespace.JD_to_Date(JD).format('CE') + '), '
						+ show_degrees(result_degrees) + '; JD: ' + low_JD
						+ '–' + up_JD, 2);

				// 內插法 main loop
				while (low_JD < up_JD) {
					// 估值
					JD = low_JD + (up_JD - low_JD)
					//
					* (degrees - low_degrees) / (up_degrees - low_degrees);
					result_degrees = angel();

					if (result_degrees < degrees) {
						if (low_JD === JD) {
							// 已經得到相當好的效果。
							break;
							// 也可以改變另一項。但效果通常不大，反而浪費時間。
							up_JD = (low_JD + up_JD) / 2;
							up_degrees = angel(up_JD);
						} else {
							low_JD = JD;
							low_degrees = result_degrees;
						}
					} else if (result_degrees > degrees) {
						if (up_JD === JD) {
							// 已經得到相當好的效果。
							break;
							// 也可以改變另一項。但效果通常不大，反而浪費時間。
							low_JD = (low_JD + up_JD) / 2;
							low_degrees = angel(low_JD);
						} else {
							up_JD = JD;
							up_degrees = result_degrees;
						}
					} else
						break;
				}

				library_namespace.debug('JD' + JD + ' ('
						+ library_namespace.JD_to_Date(JD).format('CE') + '): '
						+ show_degrees(angel()), 2);

				// apply ΔT: TT → UT.
				return options && options.TT ? JD : UT_of(JD);
			}

			/**
			 * get JD of lunar phase. Using full LEA-406a or LEA-406b model.
			 * 計算特定月相之時間精準值。可用來計算月相、日月合朔(黑月/新月)、弦、望(滿月，衝)、月食、月齡。
			 * 
			 * @param {Number}year_month
			 *            帶小數點的年數
			 * @param {Integer}phase
			 *            0:朔0°, 1:上弦90°, 2:望180°, 3:下弦270°
			 * @param {Object}[options]
			 *            options 設定特殊功能
			 * 
			 * @returns {Number} Julian date (JD of 日常生活時間 UT)
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
				JD = mean_lunar_phase(year_month, phase, options),
				// 計算月日視黃經差。
				angel = // options
				//
				// && typeof options.angel === 'function' ? options.angel :
				//
				degrees < 90 ? function(JD) {
					// window.lunar_count = (window.lunar_count || 0) + 1;
					var d = lunar_phase_angel_of_JD(JD, true);
					if (d > TURN_TO_DEGREES - 90)
						d -= TURN_TO_DEGREES;
					return d;
				} : function(JD) {
					return lunar_phase_angel_of_JD(JD, true);
				},
				// 誤差常於2°之內。
				result_degrees = angel(JD);

				JD = library_namespace.find_root('count' in options ? function(
						JD) {
					options.count++;
					return angel(JD);
				} : angel,
				// / 12: 月日視黃經差每日必於 12°–13°之內。
				// 因此每度耗時必小於 1/12 日。此處取最大值。
				JD - (result_degrees - degrees) / 12, JD, degrees, {
					y1 : result_degrees
				});

				library_namespace.debug('JD' + JD + ' ('
						+ library_namespace.JD_to_Date(JD).format('CE') + '): '
						+ show_degrees(angel(JD)), 2);

				// apply ΔT: TT → UT.
				return options && options.TT ? JD : UT_of(JD);
			}

			// phase: 0:朔0°, 1:上弦90°, 2:望180°, 3:下弦270°
			// lunar_phase_cache[year][phase:0–3] = [JD of 日常生活時間 UT, JD, ...]
			var lunar_phase_cache = [];

			/**
			 * get JD of lunar phases. 取得整年之月相。
			 * 
			 * 注意: 中曆2057年9月朔日 為 2057/9/29 (0:0)，與 香港天文台 (
			 * http://www.weather.gov.hk/gts/time/conversionc.htm )、兩千年中西曆轉換 (
			 * http://sinocal.sinica.edu.tw/ ) 相同。 According to HORIZONS
			 * (DE-431), it's about 9/28 19:54 (月亮追過太陽) or 9/29 00:08 (視角度差最小).
			 * 
			 * @param {Number}year
			 *            年數
			 * @param {Integer}phase
			 *            0:朔0°, 1:上弦90°, 2:望180°, 3:下弦270°
			 * @param {Object}[options]
			 *            options 設定特殊功能:<br />
			 *            {Boolean}options.mean: 是否採用平月相。 false: 採用精準值。<br />
			 *            {Integer}options.duration: 取得年數<br />
			 *            {Boolean}options.to_Date: return Date<br />
			 *            {String|Object}options.format: 將 Date 轉成特定 format
			 * 
			 * @returns {Array} [ Julian date (JD of 日常生活時間 UT), JD, ... ]
			 */
			function lunar_phase(year, phase, options) {
				if (year === year | 0) {
					if (options === true)
						options = 1;
					if (options > 0 && (options === options | 0))
						options = {
							duration : options
						};
				}
				// 前置處理。
				if (!library_namespace.is_Object(options))
					options = library_namespace.null_Object();

				var operator;
				if (typeof options.mean === 'boolean')
					operator = options.mean ? mean_lunar_phase
							: accurate_lunar_phase;
				// whole year
				// options.duration = 1
				// 2 years:
				// options.duration = 2
				if (!options.duration)
					return (operator || accurate_lunar_phase)(year, phase,
							options);

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
						for (var year_month = year, JD, date, hours;;
						// 1 / 12 = .08333333333333
						// assert: 朔望月長度 < 0.08 year.
						year_month = Julian_century(JD) * 100 + 2000 + 0.08) {
							JD = (operator || mean_lunar_phase)(year_month,
									phase, options);
							date = library_namespace.JD_to_Date(JD);
							if (!operator
							// auto: 在特別可能有問題的時候採用精準值。
							&& ((hours = date.getHours()) < 2 || hours > 21)) {
								JD = accurate_lunar_phase(year_month, phase,
										options);
								date = library_namespace.JD_to_Date(JD);
							}
							date = date.getFullYear();
							if (date === year)
								phase_data.push(JD);
							else if (date - year === 1) {
								phase_data.end = JD;
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
						phase_data.forEach(function(JD, index) {
							JD = library_namespace.JD_to_Date(JD);
							if (options.format)
								JD = JD.format(options.format);
							phase_data[index] = JD;
						});
					phase_JD.push(phase_data);
				}

				return options.duration === 1 ? phase_JD[0] : phase_JD;
			}

			_.lunar_phase = lunar_phase;

			/**
			 * get lunar phase of JD. 取得 JD 之月相。
			 * 
			 * @param {Number}JD
			 *            Julian date of local midnight (00:00) (JD of 天文計算用時間
			 *            TT)
			 * @param {Object}[options]
			 *            options 設定特殊功能:<br />
			 *            {Boolean}options.time: 取得月相時，亦取得時刻。<br />
			 *            {Boolean|String}options.晦: 顯示晦。<br />
			 *            {Boolean}options.index: 顯示 index 而非名稱。
			 * 
			 * @returns {Number} phase: 0:朔0°, 1:上弦90°, 2:望180°, 3:下弦270°
			 */
			function lunar_phase_of_JD(JD, options) {
				// 90: TURN_TO_DEGREES / 4相 = 360 / 4
				var _phase = lunar_phase_angel_of_JD(JD + 1) / 90;
				if (isNaN(_phase)) {
					library_namespace.debug('資料還沒載入。', 2);
					return;
				}

				// 前置處理。
				if (!library_namespace.is_Object(options))
					options = library_namespace.null_Object();

				var phase = Math.floor(_phase);

				// 假如變換剛好落在隔日子夜0時剛開始(這機率應該極低)，則今日還是應該算前一個。
				// 因為月相長度大於日長度，此即表示今天還沒變換月相。
				if (phase !== _phase
						// 檢查今天子夜0時與明日子夜0時是否有改變月相。
						&& phase !== (_phase = Math
								.floor(lunar_phase_angel_of_JD(JD) / 90))) {
					// JD, JD+1 有不同月相，表示這天中改變了月相。
					// phase: -2–1
					if (phase < 0)
						phase += 4;
					// phase: 0–3
					var phase_shown = options.index ? phase
							: LUNAR_PHASE_NAME[phase];
					if (options.time || options.eclipse) {
						var TT = accurate_lunar_phase(
								Julian_century(JD) * 100 + 2000, phase, {
									JD : JD,
									TT : true,
									nearest : true
								});
						phase_shown = [ phase_shown, UT_of(TT) ];
						/**
						 * @see
						 * 
						 * Jean Meeus, Astronomical Algorithms, 2nd Edition.<br />
						 * 《天文算法》 chapter 54 p.380.
						 * 
						 * If F differs from the nearest multiple of 180° by
						 * less than 13.9 degrees, then there is certainly an
						 * eclipse; ifthe difference is larger than 21°, there
						 * is no eclipse;
						 * 
						 * Use can be made of the following rule: there is no
						 * eclipse if |sin F| > 0.36.
						 */
						if (options.eclipse
						// 0:朔才可能日食, 2:望才可能月食
						&& (phase === 0 || phase === 2)) {
							// TODO: 以下方法無依據。這樣的條件也有可能過疏過密？
							// 地面某點緯度 latitude
							var latitude = 45,
							// 距離最大食分應在五分左右，十分內。
							/**
							 * 計算月亮(月心)的緯度→與黃道距離(度)。
							 */
							d = lunar_coordinate(TT).U,
							/**
							 * 計算月面視半徑 (度)。
							 */
							// 地心視半徑
							r = Math.asin(LUNAR_RADIUS_KM / LUNAR_DISTANCE_KM)
							// → 以地面某點為中心的座標中看到的月亮視半徑
							* (1 + Math.sin(latitude * DEGREES_TO_RADIANS)
							//
							* TERRA_RADIUS_KM / LUNAR_DISTANCE_KM)
							// → 度
							/ DEGREES_TO_RADIANS,
							/**
							 * calculate range (度)<br />
							 */
							// 日食: 計算日面視半徑 (度)。
							range = 959.63 / DEGREES_TO_ARCSECONDS;
							// 月食: 計算地球本影之半徑, Earth's umbra radius.
							if (phase === 2) {
								// 太陽赤道地平視差
								var Solar_parallax
								// https://en.wikipedia.org/wiki/Parallax#Solar_parallax
								// 1: distance in AU
								= 8.794143 / DEGREES_TO_ARCSECONDS / 1,
								// 月球赤道地平視差
								// http://farside.ph.utexas.edu/Books/Syntaxis/Almagest/node42.html
								Lunar_parallax = 41 / DEGREES_TO_ARCSECONDS;
								// http://eclipse.gsfc.nasa.gov/LEcat5/shadow.html
								range = 1.01 * Lunar_parallax + Solar_parallax
										- range;
							}
							if (Math.abs(d) < range + r) {
								// 遮到了。
								// eclipse conjunction
								// push 黃經衝 or 合(有相同的黃經)時之月黃緯
								phase_shown.push(d);
							}
						}
					}
					return phase_shown;
				}

				if (options.晦 && phase === -1 && 0 ===
				//
				Math.floor(lunar_phase_angel_of_JD(JD + 2) / 90))
					// 晦: -1, -1, 0
					return options.晦 === true ? '晦' : options.晦;
			}

			_.lunar_phase_of_JD = lunar_phase_of_JD;

			// ------------------------------------------------------------------------------------------------------//
			// 制曆/排曆/排陰陽曆譜
			// 中國傳統曆法是一種陰陽合曆，以月相定月份，以太陽定年周期。

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
			 * JD to local midnight (00:00).
			 * 
			 * @param {Number}JD
			 *            Julian date
			 * @param {Number}[minute_offset]
			 *            time-zone offset from UTC in minutes.<br />
			 *            e.g., UTC+8: 8 * 60 = +480. default: UTC+0.
			 * @param {Boolean}[get_local_Date]
			 *            轉成當地之 Date
			 * 
			 * @returns {Number|Date}
			 */
			function midnight_of(JD, minute_offset, get_local_Date) {
				// -day_offset: to local (JD+.5). 此時把 local 當作 UTC+0.
				// Math.floor(): reset to local midnight, 00:00
				// +day_offset: recover to UTC
				var day_offset = (minute_offset | 0) / (24 * 60) - .5;
				JD = Math.floor(JD + day_offset) - day_offset;

				if (get_local_Date) {
					JD = library_namespace.JD_to_Date(
					//
					JD + (minute_offset - default_offset) / (60 * 24));
					// 歸零用。
					var ms = JD.getMilliseconds();
					// 歸零。
					if (ms)
						JD.setMilliseconds(Math.round(ms / 500) * 500);
				}

				return JD;
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
			 * @param {Integer}CE_year
			 *            公元年數
			 * @param {Number}minute_offset
			 *            time-zone offset from UTC in minutes.<br />
			 *            e.g., UTC+8: 8 * 60 = 480
			 * 
			 * @returns {Array} 年朔日 = [ [JD, JD, ...], 冬至所在月 ]
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
				.map(function(JD) {
					// 日月合朔時間 → 朔日0時
					return midnight_of(JD, minute_offset);
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
							library_namespace.debug('沒中氣的月: 朔日[' + 閏 + '] = '
									+ 朔日[閏] + ', 中氣 ' + 中氣, 3);
							break;
						}
					}
					朔日.閏 = 閏;
				} else if (朔日.length !== 12)
					library_namespace.err(年 + '年有' + 朔日.length + '個月!');

				// [ {Number}朔日JD, 朔日JD, ... ].閏 = {Boolean};
				return 朔日;
			}

			/**
			 * 年朔日 = 朔日_cache[ 年 + '/' + minute_offset ]<br /> = [
			 * {Number}朔日JD, 朔日JD, ... ]<br />
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
			 * 以定朔法排曆，編排中國傳統曆法（陰陽曆），取得整年月首朔日/月齡。
			 * 
			 * @param {Integer}年
			 *            基本上與公元年數同步。 e.g., 2000: 1999/12/8–2000/11/25
			 * @param {Object}[options]
			 *            options 設定特殊功能:<br />
			 *            {Number}options.minute_offset: time-zone offset from
			 *            UTC in minutes.<br />
			 *            e.g., UTC+8: 8 * 60 = 480<br />
			 *            {String|Integer}options.歲首: 年始之地支/地支序(0:子)<br />
			 *            {Integer}options.year_offset: 年數將自動加上此 offset。<br />
			 *            {Boolean}options.月名: 順便加上 .月名 = [ 月名 ]
			 * 
			 * @returns {Array} 年朔日 = [ {Number}朔日JD, 朔日JD, ... ]
			 */
			function 定朔(年, options) {
				if (!LEA406_loaded('V'))
					// 採用低精度之誤差過大，不能用。
					return;

				// 前置處理。
				if (!library_namespace.is_Object(options))
					options = library_namespace.null_Object();

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
				library_namespace.debug('歲首 ' + 歲首 + ', ' + 朔日.閏 + ', 閏=' + 閏,
						3);
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
						library_namespace.err(年 + '年有兩個閏月!!');
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
			 * @param {Object}options
			 *            options
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
				return [ date.getFullYear() + options.year_offset,
						年朔日.月名[index], 1 + JDN - 年朔日[index] | 0 ];
			}

			_.夏曆 = 夏曆;

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
			 * accessdate="2015/3/26 20:8">NASA - Polynomial Expressions for
			 * Delta T</a><br />
			 * <a
			 * href="http://www.staff.science.uu.nl/~gent0113/deltat/deltat_old.htm"
			 * accessdate="2015/3/26 20:7">Delta T: Pre-Telescopic Era</a>
			 * 
			 * @inner
			 */
			var ΔT_year_start = [ 2150, 2050, 2005, 1986, 1961, 1941, 1920,
					1900, 1860, 1800, 1700, 1600, 500, -500 ],
			// http://eclipse.gsfc.nasa.gov/SEcat5/deltatpoly.html
			// All values of ΔT based on Morrison and Stephenson [2004]
			// assume a value for the Moon's secular acceleration of -26
			// arcsec/cy².
			ΔT_year_base = [ 1820, 1820, 2000, 2000, 1975, 1950, 1920, 1900,
					1860, 1800, 1700, 1600, 1000, 0 ],
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
					[ 7.62, 57.37, -2517.54, 16806.68, -44736.24,
							10000000000 / 233174 ],
					[ 13.72, -33.2447, 68.612, 4111.6, -37436, 121272, -169900,
							87500 ],
					[ 8.83, 16.03, -59.285, 133.36, -100000000 / 1174000 ],
					[ 120, -98.08, -153.2, 1000000 / 7129 ],
					[ 1574.2, -556.01, 71.23472, 0.319781, -0.8503463,
							-0.005050998, 0.0083572073 ],
					[ 10583.6, -1014.41, 33.78311, -5.952053, -0.1798452,
							0.022174192, 0.0090316521 ] ];

			// ------------------------------------------------------------------------------------------------------//
			// terms for obliquity 轉軸傾角

			/**
			 * IAU2006 obliquity coefficients.<br />
			 * terms for function mean_obliquity_IAU2006(JD)
			 * 
			 * Reference 資料來源/資料依據:
			 * https://github.com/kanasimi/IAU-SOFA/blob/master/src/obl06.c
			 * 
			 * @inner
			 */
			var IAU2006_obliquity_coefficients = [ 84381.406, -46.836769,
					-0.0001831, 0.00200340, -0.000000576, -0.0000000434 ];

			/**
			 * terms for function equinox()
			 * 
			 * Reference 資料來源/資料依據:<br />
			 * Jean Meeus, Astronomical Algorithms, 2nd Edition.<br />
			 * 《天文算法》 chapter 章動及黃赤交角.
			 * 
			 * @inner
			 */
			var Laskar_obliquity_coefficients = [
			// ε = 23° 26′ 21.448″ - 4680.93″ T - 1.55″ T²
			// + 1999.25″ T³ - 51.38″ T⁴ - 249.67″ T⁵
			// - 39.05″ T⁶ + 7.12″ T⁷ + 27.87″ T⁸ + 5.79″ T⁹ + 2.45″ T¹⁰
			23 * 60 * 60 + 26 * 60 + 21.448, -4680.93, -1.55, 1999.25, -51.38,
					-249.67, -39.05, 7.12, 27.87, 5.79, 2.45 ];
			Laskar_obliquity_coefficients.forEach(function(v, index) {
				Laskar_obliquity_coefficients[index] = v
						/ DEGREES_TO_ARCSECONDS;
			});

			// ------------------------------------------------------------------------------------------------------//
			// terms for precession

			var
			/**
			 * terms for function ecliptic_precession()
			 * 
			 * Reference 資料來源/資料依據:<br />
			 * Kai Tang (2015). A long time span relativistic precession model
			 * of the Earth.<br />
			 * Table B.1 The Periodic Terms in PA, QA.
			 * 
			 * @inner
			 */
			唐凯_ecliptic_precession_terms = [
					[ -3720, 1260, -1290, -3698, 68975 ],
					[ 657, -2585, 2508, 736, 235535 ],
					[ -2068, -302, 288, -2056, 72488 ],
					[ -855, -570, 548, -838, 192342 ],
					[ 438, 338, -334, 435, 49178 ],
					[ 309, 255, -225, 289, 67341 ],
					[ 217, 322, -191, 5, 424863 ],
					[ 168, -313, 288, 183, 65723 ],
					[ -278, 130, -112, -294, 173673 ],
					[ -278, -79, 89, -285, 75817 ],
					[ -77, 258, -157, -194, 255871 ],
					[ -24, 124, -106, -33, 64138 ],
					[ 29, 3, -91, 187, 496536 ],
					[ -135, -153, 176, -151, 70820 ],
					[ -85, 124, -257, 187, 1080090 ],
					[ 153, -276, 395, -117, 1309223 ],
					[ 14, -12, 77, -94, 663722 ], [ 55, -11, 46, 20, 214239 ],
					[ 81, 39, -41, 92, 77777 ], [ -55, -16, 19, -61, 80440 ],
					[ 6, -88, -50, 206, 367386 ],
					[ -22, 107, 16, -189, 321366 ],
					[ 5, -130, 24, 141, 284995 ], [ 11, -28, 8, 27, 164405 ],
					[ 15, 19, -19, 19, 83199 ] ],

			/**
			 * terms for function precession()
			 * 
			 * Reference 資料來源/資料依據:<br />
			 * Kai Tang (2015). A long time span relativistic precession model
			 * of the Earth.<br />
			 * Table B.2 The Periodic Terms in pA, εA.
			 * 
			 * @inner
			 */
			唐凯_precession_terms = [ [ -6653, -2199, 739, -2217, 40938 ],
					[ -3349, 541, -175, -1126, 39803 ],
					[ 1526, -1218, 376, 469, 53789 ],
					[ 227, 874, -313, 84, 28832 ],
					[ -370, 256, -91, -129, 29639 ],
					[ 518, -353, 110, 174, 41557 ],
					[ 324, 542, -174, 107, 42171 ],
					[ -482, 200, -72, -158, 38875 ],
					[ -46, -201, 63, -17, 42847 ],
					[ -140, -45, 16, -50, 30127 ],
					[ -224, 404, -143, -69, 40316 ],
					[ 181, -98, 38, 55, 38379 ], [ -121, 59, -24, -35, 37783 ],
					[ -9, -73, 27, -6, 28550 ], [ 35, -42, 15, 13, 27300 ],
					[ 63, -35, 15, 16, 37225 ], [ 56, -64, 15, 12, 20459 ],
					[ 18, -77, 18, 3, 20151 ], [ -8, 41, -9, -13, 170984 ],
					[ 51, 9, -2, 16, 29197 ], [ 3425, -2525, , , 1309223 ],
					[ -2951, 1938, , , 991814 ], [ 2117, -704, , , 716770 ],
					[ 877, -993, , , 416787 ], [ -805, 226, , , 554293 ],
					[ -710, -52, , , 371201 ], [ 448, -33, , , 324763 ],
					[ -217, 111, , , 122237 ], [ 224, -55, , , 94370 ],
					[ -228, 37, , , 287695 ] ];

			唐凯_ecliptic_precession_terms
			// 原數值: [ [ 5540″, -1.98e-4″ ], [ -1608″, -2.06e-4 ] ]
			// 已轉成適用於 Julian century 使用。
			.init = [ [ 5540, -0.0198 ], [ -1608, -0.0206 ] ];
			唐凯_ecliptic_precession_terms.forEach(function(term) {
				// 100: 轉成適用於 Julian century 使用。
				// Julian year (the time reckoned from J2000.0 in years)
				// → Julian century
				term[4] = 100 * 2 * Math.PI / term[4];
			});

			唐凯_precession_terms
			// 原數值: [ [ 6221″, 50″.44766 ], [ 83953″, -8.9e-5″ ] ]
			// 已轉成適用於 Julian century 使用。
			.init = [ [ 6221, 5044.766 ], [ 83953, -0.0089 ] ];
			唐凯_precession_terms.forEach(function(term) {
				// 100: 轉成適用於 Julian century 使用。
				// Julian year (the time reckoned from J2000.0 in years)
				// → Julian century
				term[4] = 100 * 2 * Math.PI / term[4];
			});

			// ------------------------------------------------------------------------------------------------------//
			// 章動 nutation

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
					[ 0, 0, 0, 0, 1, -172064161, -174666, 33386, 92052331,
							9086, 15377 ],
					[ 0, 0, 2, -2, 2, -13170906, -1675, -13696, 5730336, -3015,
							-4587 ], [ 0, 0, 2, 0, 2,
					//
					-2276413, -234, 2796, 978459, -485, 1374 ],
					[ 0, 0, 0, 0, 2, 2074554, 207, -698, -897492, 470, -291 ],
					[ 0, 1, 0, 0, 0,
					//
					1475877, -3633, 11817, 73871, -184, -1924 ],
					[ 0, 1, 2, -2, 2,
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
			 * Jean Meeus, Astronomical Algorithms, 2nd Edition.<br />
			 * 《天文算法》 table 22.A.<br />
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
			IAU1980_nutation_terms = [
					[ 0, 0, 0, 0, 1, -171996, -1742, 92025, 89 ],
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
					[ 0, 0, -1, 2, 2, 123, 0, -53, 0 ],
					[ 2, 0, 0, 0, 0, 63, 0, 0, 0 ],
					[ 0, 0, 1, 0, 1, 63, 1, -33, 0 ],
					[ 2, 0, -1, 2, 2, -59, 0, 26, 0 ],
					[ 0, 0, -1, 0, 1, -58, -1, 32, 0 ],
					[ 0, 0, 1, 2, 1, -51, 0, 27, 0 ],
					[ -2, 0, 2, 0, 0, 48, 0, 0, 0 ],
					[ 0, 0, -2, 2, 1, 46, 0, -24, 0 ],
					[ 2, 0, 0, 2, 2, -38, 0, 16, 0 ],
					[ 0, 0, 2, 2, 2, -31, 0, 13, 0 ],
					[ 0, 0, 2, 0, 0, 29, 0, 0, 0 ],
					[ -2, 0, 1, 2, 2, 29, 0, -12, 0 ],
					[ 0, 0, 0, 2, 0, 26, 0, 0, 0 ],
					[ -2, 0, 0, 2, 0, -22, 0, 0, 0 ],
					[ 0, 0, -1, 2, 1, 21, 0, -10, 0 ],
					[ 0, 2, 0, 0, 0, 17, -1, 0, 0 ],
					[ 2, 0, -1, 0, 1, 16, 0, -8, 0 ],
					[ -2, 2, 0, 2, 2, -16, 1, 7, 0 ],
					[ 0, 1, 0, 0, 1, -15, 0, 9, 0 ],
					[ -2, 0, 1, 0, 1, -13, 0, 7, 0 ],
					[ 0, -1, 0, 0, 1, -12, 0, 6, 0 ],
					[ 0, 0, 2, -2, 0, 11, 0, 0, 0 ],
					[ 2, 0, -1, 2, 1, -10, 0, 5, 0 ],
					[ 2, 0, 1, 2, 2, -8, 0, 3, 0 ],
					[ 0, 1, 0, 2, 2, 7, 0, -3, 0 ],
					[ -2, 1, 1, 0, 0, -7, 0, 0, 0 ],
					[ 0, -1, 0, 2, 2, -7, 0, 3, 0 ],
					[ 2, 0, 0, 2, 1, -7, 0, 3, 0 ],
					[ 2, 0, 1, 0, 0, 6, 0, 0, 0 ],
					[ -2, 0, 2, 2, 2, 6, 0, -3, 0 ],
					[ -2, 0, 1, 2, 1, 6, 0, -3, 0 ],
					[ 2, 0, -2, 0, 1, -6, 0, 3, 0 ],
					[ 2, 0, 0, 0, 1, -6, 0, 3, 0 ],
					[ 0, -1, 1, 0, 0, 5, 0, 0, 0 ],
					[ -2, -1, 0, 2, 1, -5, 0, 3, 0 ],
					[ -2, 0, 0, 0, 1, -5, 0, 3, 0 ],
					[ 0, 0, 2, 2, 1, -5, 0, 3, 0 ],
					[ -2, 0, 2, 0, 1, 4, 0, 0, 0 ],
					[ -2, 1, 0, 2, 1, 4, 0, 0, 0 ],
					[ 0, 0, 1, -2, 0, 4, 0, 0, 0 ],
					[ -1, 0, 1, 0, 0, -4, 0, 0, 0 ],
					[ -2, 1, 0, 0, 0, -4, 0, 0, 0 ],
					[ 1, 0, 0, 0, 0, -4, 0, 0, 0 ],
					[ 0, 0, 1, 2, 0, 3, 0, 0, 0 ],
					[ 0, 0, -2, 2, 2, -3, 0, 0, 0 ],
					[ -1, -1, 1, 0, 0, -3, 0, 0, 0 ],
					[ 0, 1, 1, 0, 0, -3, 0, 0, 0 ],
					[ 0, -1, 1, 2, 2, -3, 0, 0, 0 ],
					[ 2, -1, -1, 2, 2, -3, 0, 0, 0 ],
					[ 0, 0, 3, 2, 2, -3, 0, 0, 0 ],
					[ 2, -1, 0, 2, 2, -3, 0, 0, 0 ] ];

			// ------------------------------------------------------------------------------------------------------//
			// Sun's aberration. 太陽地心黃經光行差修正量。

			/**
			 * constant term of Sun's aberration
			 * 
			 * Reference 資料來源/資料依據:<br />
			 * Jean Meeus, Astronomical Algorithms, 2nd Edition.<br />
			 * 《天文算法》 p.167,168 chapter 太陽位置計算.
			 * 
			 * If needed with respect to the mean equinox of the date instead of
			 * to a fixed reference frame, the constant term 3548.193 should be
			 * replaced by 3548.330. 如果Δλ須是在Date黃道中的，則應把常數項3548.193換為3548.330
			 * 
			 * The ICRF is a fixed reference frame. The FK5 based on fixed
			 * reference frame of J2000.0?
			 * http://blog.csdn.net/songgz/article/details/2680144
			 * 通過數以千計的恆星位置，反推出春風點在天球上的位置，我們常說的FK5天球坐標系統就與它有關。
			 * 
			 * @inner
			 */
			var sun_aberration_variation_constant = 3548.193,
			/**
			 * coefficients of Sun's aberration
			 * 
			 * Σ : Σ ([0] * sin ( [1] + [2] τ) )
			 * 
			 * daily variation = sun_aberration_variation_constant +
			 * Σ(variation[0]) + Σ(variation[1])*τ + Σ(variation[2])*τ² +
			 * Σ(variation[3])*τ³
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
			 * Jean Meeus, Astronomical Algorithms.<br />
			 * 《天文算法》 chapter 分點和至點.<br />
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
			var VSOP87_terms = library_namespace.null_Object();

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
			 * Jean Meeus, Astronomical Algorithms, 2nd Edition.<br />
			 * Appendix III 《天文算法》 附表3.<br />
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
						[ [ 175347046.0, 0, 0 ],
								[ 3341656.0, 4.6692568, 6283.07585 ],
								[ 34894.0, 4.6261, 12566.1517 ],
								[ 3497.0, 2.7441, 5753.3849 ],
								[ 3418.0, 2.8289, 3.5231 ],
								[ 3136.0, 3.6277, 77713.7715 ],
								[ 2676.0, 4.4181, 7860.4194 ],
								[ 2343.0, 6.1352, 3930.2097 ],
								[ 1324.0, 0.7425, 11506.7698 ],
								[ 1273.0, 2.0371, 529.691 ],
								[ 1199.0, 1.1096, 1577.3435 ],
								[ 990, 5.233, 5884.927 ],
								[ 902, 2.045, 26.298 ],
								[ 857, 3.508, 398.149 ],
								[ 780, 1.179, 5223.694 ],
								[ 753, 2.533, 5507.553 ],
								[ 505, 4.583, 18849.228 ],
								[ 492, 4.205, 775.523 ], [ 357, 2.92, 0.067 ],
								[ 317, 5.849, 11790.629 ],
								[ 284, 1.899, 796.298 ],
								[ 271, 0.315, 10977.079 ],
								[ 243, 0.345, 5486.778 ],
								[ 206, 4.806, 2544.314 ],
								[ 205, 1.869, 5573.143 ],
								[ 202, 2.458, 6069.777 ],
								[ 156, 0.833, 213.299 ],
								[ 132, 3.411, 2942.463 ],
								[ 126, 1.083, 20.775 ], [ 115, 0.645, 0.98 ],
								[ 103, 0.636, 4694.003 ],
								[ 102, 0.976, 15720.839 ],
								[ 102, 4.267, 7.114 ], [ 99, 6.21, 2146.17 ],
								[ 98, 0.68, 155.42 ], [ 86, 5.98, 161000.69 ],
								[ 85, 1.3, 6275.96 ], [ 85, 3.67, 71430.7 ],
								[ 80, 1.81, 17260.15 ], [ 79, 3.04, 12036.46 ],
								[ 75, 1.76, 5088.63 ], [ 74, 3.5, 3154.69 ],
								[ 74, 4.68, 801.82 ], [ 70, 0.83, 9437.76 ],
								[ 62, 3.98, 8827.39 ], [ 61, 1.82, 7084.9 ],
								[ 57, 2.78, 6286.6 ], [ 56, 4.39, 14143.5 ],
								[ 56, 3.47, 6279.55 ], [ 52, 0.19, 12139.55 ],
								[ 52, 1.33, 1748.02 ], [ 51, 0.28, 5856.48 ],
								[ 49, 0.49, 1194.45 ], [ 41, 5.37, 8429.24 ],
								[ 41, 2.4, 19651.05 ], [ 39, 6.17, 10447.39 ],
								[ 37, 6.04, 10213.29 ], [ 37, 2.57, 1059.38 ],
								[ 36, 1.71, 2352.87 ], [ 36, 1.78, 6812.77 ],
								[ 33, 0.59, 17789.85 ], [ 30, 0.44, 83996.85 ],
								[ 30, 2.74, 1349.87 ], [ 25, 3.16, 4690.48 ] ],
						[ [ 628331966747.0, 0, 0 ],
								[ 206059.0, 2.678235, 6283.07585 ],
								[ 4303.0, 2.6351, 12566.1517 ],
								[ 425.0, 1.59, 3.523 ],
								[ 119.0, 5.796, 26.298 ],
								[ 109.0, 2.966, 1577.344 ],
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
								[ 309.0, 0.867, 12566.152 ],
								[ 27, 0.05, 3.52 ], [ 16, 5.19, 26.3 ],
								[ 16, 3.68, 155.42 ], [ 10, 0.76, 18849.23 ],
								[ 9, 2.06, 77713.77 ], [ 7, 0.83, 775.52 ],
								[ 5, 4.66, 1577.34 ], [ 4, 1.03, 7.11 ],
								[ 4, 3.44, 5573.14 ], [ 3, 5.14, 796.3 ],
								[ 3, 6.05, 5507.55 ], [ 3, 1.19, 242.73 ],
								[ 3, 6.12, 529.69 ], [ 3, 0.31, 398.15 ],
								[ 3, 2.28, 553.57 ], [ 2, 4.38, 5223.69 ],
								[ 2, 3.75, 0.98 ] ],
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
						[ [ 100013989.0, 0, 0 ],
								[ 1670700.0, 3.0984635, 6283.07585 ],
								[ 13956.0, 3.05525, 12566.1517 ],
								[ 3084.0, 5.1985, 77713.7715 ],
								[ 1628.0, 1.1739, 5753.3849 ],
								[ 1576.0, 2.8469, 7860.4194 ],
								[ 925.0, 5.453, 11506.77 ],
								[ 542.0, 4.564, 3930.21 ],
								[ 472.0, 3.661, 5884.927 ],
								[ 346.0, 0.964, 5507.553 ],
								[ 329.0, 5.9, 5223.694 ],
								[ 307.0, 0.299, 5573.143 ],
								[ 243.0, 4.273, 11790.629 ],
								[ 212.0, 5.847, 1577.344 ],
								[ 186.0, 5.022, 10977.079 ],
								[ 175.0, 3.012, 18849.228 ],
								[ 110.0, 5.055, 5486.778 ],
								[ 98, 0.89, 6069.78 ], [ 86, 5.69, 15720.84 ],
								[ 86, 1.27, 161000.69 ],
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
								[ 1721.0, 1.0644, 12566.1517 ],
								[ 702.0, 3.142, 0 ], [ 32, 1.02, 18849.23 ],
								[ 31, 2.84, 5507.55 ], [ 25, 1.32, 5223.69 ],
								[ 18, 1.42, 1577.34 ], [ 10, 5.91, 10977.08 ],
								[ 9, 1.42, 6275.96 ], [ 9, 0.27, 5486.78 ] ],
						[ [ 4359.0, 5.7846, 6283.0758 ],
								[ 124.0, 5.579, 12566.152 ], [ 12, 3.14, 0 ],
								[ 9, 3.63, 77713.77 ], [ 6, 1.87, 5573.14 ],
								[ 3, 5.47, 18849.23 ] ],
						[ [ 145.0, 4.273, 6283.076 ], [ 7, 3.92, 12566.15 ] ],
						[ [ 4, 2.56, 6283.08 ] ] ]
			};

			// ---------------------------------------------------------------------------------------------------------------------------------------//
			// export.

			// ---------------------------------------

			return (_// JSDT:_module_
			);
		}
	});
