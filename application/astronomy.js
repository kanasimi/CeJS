/**
 * @name CeL function for astronomical calculations.
 * @fileoverview 本檔案包含了天文演算用的日期轉換功能。
 * 
 * @since 2015/3/20 23:5:43
 * 
 * TODO:
 * 
 * 簡易朔望/天象計算功能/千年 節氣 計算。<br />
 * http://bieyu.com/<br />
 * http://www.fjptsz.com/xxjs/xjw/rj/117/index.htm
 * http://blog.csdn.net/orbit/article/details/7910220
 * http://www.chris.obyrne.com/Eclipses/calculator.html
 * http://eclipse.gsfc.nasa.gov/JSEX/JSEX-index.html
 * http://en.wikipedia.org/wiki/New_moon
 * http://www.informatik.uni-leipzig.de/~duc/amlich/calrules.html
 * http://blog.csdn.net/songgz/article/details/2680144
 * http://www.todayonhistory.com/wnl/lhl.htm
 * @see <a href="http://www.nongli.com/item2/index.html" accessdate="2013/5/2
 *      20:23">农历知识:传统节日,24节气，农历历法，三九，三伏，天文历法,天干地支阴阳五行</a>
 * @see <a href="http://www.chinesefortunecalendar.com/CLC/clcBig5.htm"
 *      accessdate="2013/5/2 20:23">如何轉換陰陽曆</a>
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
 * 未來發展：<br />
 * 計算順序: https://github.com/kanasimi/IAU-SOFA/blob/master/doc/sofa_ast_c.pdf
 * 
 */

'use strict';
// 'use asm';

if (false) {
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

		CeL.assert([ 2015, CeL.立春年(new Date('2015/2/4')) ], '立春年 2015/2/4');
		CeL.assert([ 2014, CeL.立春年(new Date('2015/2/3')) ], '立春年 2015/2/3');

	});
}

// ------------------------------------------------------------------------------------------------------------------//

if (typeof CeL === 'function')
	CeL.run({
		name : 'application.astronomy',
		//
		require : 'data.code.compatibility.',

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
			TURN_TO_DEGREES = 360,
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
			DEGREES_TO_ARCSECONDS = 60 * 60,
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
			ONE_DAY_SECONDS = 24 * 60 * 60,
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
			 * Days per Julian century
			 * 
			 * DAYS_OF_JULIAN_CENTURY = (365 + 1/4) * 100
			 * 
			 * @see https://github.com/kanasimi/IAU-SOFA/blob/master/src/sofam.h
			 */
			DAYS_OF_JULIAN_CENTURY = 36525,
			/**
			 * speed of light in vacuum (m/s), c
			 */
			CELERITAS = 299792458,
			/**
			 * Astronomical unit (m).<br />
			 * 1 astronomical unit = 149597870700 meters (exactly)
			 */
			AU_TO_METERS = 149597870700,
			/**
			 * light-time for AU distance (days).<br />
			 * AU_LIGHT_TIME = 149597870700/299792458/86400 ≈
			 * 0.005775518331436995
			 */
			AU_LIGHT_TIME = AU_TO_METERS / CELERITAS / ONE_DAY_SECONDS,
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
			// 二十四節氣名。
			SOLAR_TERMS_NAME =
			// Chinese name
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
			DEGREES_BETWEEN_SOLAR_TERMS = TURN_TO_DEGREES / SOLAR_TERMS_COUNT;

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
			 * @returns {Number} Julian centuries of JD from J2000.0
			 */
			function Julian_century(JD) {
				return (JD - J2000_epoch) / DAYS_OF_JULIAN_CENTURY;
			}

			_.Julian_century = Julian_century;

			// to proper degrees 0 ~ less than 360
			// near_0: -180 ~ less than 180
			function normalize_degrees(degree, near_0) {
				if ((degree %= TURN_TO_DEGREES) < 0)
					degree += TURN_TO_DEGREES;
				if (near_0 && degree >= TURN_TO_DEGREES / 2)
					degree -= TURN_TO_DEGREES;
				return degree;
			}

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
						if (padding >= 0)
							degree = (degree < 10 ? ' ' : '')
									+ degree.toFixed(padding);
						show += degree + '″';
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
			// obliquity 轉軸傾角

			/**
			 * 地球的平均轉軸傾角，平黃赤交角。 get mean obliquity of the ecliptic (Earth's
			 * axial tilt), IAU 2006 precession model.
			 * 
			 * 資料來源/資料依據:
			 * https://github.com/kanasimi/IAU-SOFA/blob/master/src/obl06.c
			 * 
			 * @param {Number}JD
			 *            Julian date
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
			 * 資料來源/資料依據: Laskar, J. (1986). "Secular Terms of Classical
			 * Planetary Theories Using the Results of General Relativity".
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
			 * 天文計算用時間 TT = 日常生活時間 UT + ΔT
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

			// ------------------------------------------------------------------------------------------------------//
			// Atmospheric refraction

			/**
			 * true apparent in degrees ← apparent altitude.<br />
			 * 大氣折射公式: 真地平緯度 ← 視地平緯度<br />
			 * 大氣折射又稱蒙氣差、折光差（蒙氣即行星的大氣）
			 * 
			 * 資料來源/資料依據:<br />
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
			 * 資料來源/資料依據:<br />
			 * Jean Meeus, Astronomical Algorithms, 2nd Edition.<br />
			 * 《天文算法》 p.167,168 chapter 太陽位置計算.<br />
			 * 
			 * @param {Number}R
			 *            日地距離(天文單位 AU), radius vector in AU。
			 * @param {Number}JD
			 *            Julian date
			 * 
			 * @returns {Number} degree
			 * 
			 * @see https://en.wikipedia.org/wiki/Aberration_of_light
			 */
			function sun_aberration_high(R, JD) {
				// 儒略千年數 millennium
				var τ = Julian_century(JD) / 10,
				// coefficients of Δλ
				coefficients = [];

				sun_aberration_variation.forEach(function(team) {
					var coefficient = 0;
					team.forEach(function(sub_team) {
						coefficient += sub_team[0]
								* Math.sin(sub_team[1] + sub_team[2] * τ);
					});
					coefficients.push(coefficient);
				});

				/**
				 * constant term of Sun's aberration
				 * 
				 * If needed with respect to the mean equinox of the date
				 * instead of to a fixed reference frame, the constant term
				 * 3548.193 should be replaced by 3548.330.
				 * 如果Δλ須是在Date黃道中的，則應把常數項3548.193換為3548.330
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
							+ show_degrees(sun_aberration_low(R)));

				return aberration;
			}

			/**
			 * Sun's aberration. 太陽地心黃經光行差修正量。
			 * 
			 * 資料來源/資料依據:<br />
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
				// 乘以a*(1-e^2)，與24.5式的分子相同。
				// 因此24.10中的分子中其實是一個緩慢變化的數，在0年是20".4893，在+4000年是20".4904。
				return -20.4898 / DEGREES_TO_ARCSECONDS / R;
				// 24.10式本身不是一個嚴格的準確的運算式，因為它是假設地球軌道是不受攝動的標準橢圓。當受到攝動時，月球的攝動可引起0".01的誤差。
				// 當需要進行高精度計算時(比使用附錄II計算精度要求更高時)，可用以下方法進行光行差修正
				// sun_aberration_high(R, JD)
			}

			var sun_aberration = sun_aberration_high;

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
			 * 資料來源/資料依據:<br />
			 * Nutation, IAU 2000B model.
			 * 
			 * @param {Number}JD
			 *            Julian date
			 * 
			 * @returns {Array} [ 黃經章動Δψ, 黃赤交角章動Δε ] (radians)
			 * 
			 * @see https://github.com/kanasimi/IAU-SOFA/blob/master/src/nut00b.c
			 * @see http://www.neoprogrammics.com/nutations/nutations_1980_2000b/index.php
			 */
			function IAU2000B_nutation(JD) {
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

				for (var team,
				// Summation of luni-solar nutation series
				// (smallest terms first).
				index = IAU2000B_nutation_teams.length; index > 0;) {
					team = IAU2000B_nutation_teams[--index];
					var argument = 0;
					// 5: length of parameters
					for (var i = 0; i < 5; i++)
						// team[i] 常為0
						argument += team[i] * parameters[i];

					var _sin = Math.sin(argument), _cos = Math.cos(argument);
					Δψ += (team[5] + team[6] * T) * _sin + team[7] * _cos;
					Δε += (team[8] + team[9] * T) * _cos + team[10] * _sin;
				}

				i = ARCSECONDS_TO_RADIANS / 1e7;
				// Fixed offsets in lieu of planetary terms
				Δψ = Δψ * i + IAU2000B_nutation_offset_Δψ;
				Δε = Δε * i + IAU2000B_nutation_offset_Δε;

				library_namespace.debug(
				//
				'IAU2000B nutation 章動修正值 of ' + JD + ' ('
						+ library_namespace.JD_to_Date(JD).format('CE') + '): '
						+ Δψ / DEGREES_TO_RADIANS + '°, ' + Δε
						/ DEGREES_TO_RADIANS + '°', 3);
				return [ Δψ, Δε ];
			}

			/**
			 * IAU 1980 model nutation (地球章動) 修正值。
			 * 
			 * @param {Number}JD
			 *            Julian date
			 * 
			 * @returns {Array} [ 黃經章動Δψ, 黃赤交角章動Δε ] (degrees)
			 */
			function IAU1980_nutation(JD) {
				// T 是 J2000.0 起算的儒略世紀數：
				var T = Julian_century(JD),
				//
				parameters = [], Δψ = 0, Δε = 0;
				IAU1980_nutation_parameters.forEach(function(parameter) {
					parameters.push((polynomial_value(parameter, T)
					//
					% TURN_TO_DEGREES) * DEGREES_TO_RADIANS);
				});

				// IAU1980_nutation_teams[6,8] 有乘以十倍了。
				T /= 10;

				IAU1980_nutation_teams.forEach(function(team) {
					var c, argument = 0, i = 0;
					// 5: parameters.length
					for (; i < 5; i++)
						// 正弦(計算Δψ用sine)的角度參數及餘弦(計算Δε用cosine)的角度參數是D、M、M'、F、Ω這5個基本參數的線性組合。
						// c常為0
						if (c = team[i])
							argument += c * parameters[i];

					Δψ += (team[5] + team[6] * T) * Math.sin(argument);
					if (c = team[7] + team[8] * T)
						Δε += c * Math.cos(argument);
				});

				// 表中的係數的單位是0".0001。
				T = 1e4 * DEGREES_TO_ARCSECONDS;
				return [ Δψ / T, Δε / T ];
			}

			var nutation = IAU2000B_nutation;
			_.nutation = nutation;

			// ------------------------------------------------------------------------------------------------------//
			// VSOP87 model

			/**
			 * 無用:因為 items[1,2] 已經是弧度。
			 * 
			 * @deprecated
			 */
			function initialize_VSOP87(subteams) {
				if (subteams.init)
					// 另一 thread 正初始化中。
					return;
				subteams.init = true;

				subteams.forEach(function(series) {
					series.forEach(function(items) {
						items[1] *= DEGREES_TO_RADIANS;
						items[2] *= DEGREES_TO_RADIANS;
					});
				});

				subteams.initialized = true;
				delete subteams.init;
			}

			/**
			 * VSOP87 行星的日心座標位置 (Heliocentric ecliptic spherical coordinates)
			 * 計算。<br />
			 * 得到行星在動力學Date平黃道座標(Bretagnon的VSOP定義的)中的日心黃經L、黃緯B。<br />
			 * <br />
			 * does not include nutation or aberration.
			 * 
			 * 資料來源/資料依據:<br />
			 * Jean Meeus, Astronomical Algorithms, 2nd Edition.<br />
			 * 《天文算法》 chapter 太陽位置計算.
			 * 
			 * @param {Number}JD
			 *            Julian date
			 * @param {String}object
			 *            planets 行星.
			 * @param {Object}[options]
			 *            options:<br />
			 *            {String|Array}options.teams: request teams.<br />
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
				// 儒略千年數 millennium
				var τ = Julian_century(JD) / 10,
				//				
				coordinate = library_namespace.null_Object(),
				//
				object_teams = VSOP87_teams[VSOP87.object_name(object)];
				if (!object_teams)
					throw new Error('VSOP87: Invalid object [' + object + ']');

				// 前置處理。
				if (!library_namespace.is_Object(options))
					options = library_namespace.null_Object();

				var teams = options.teams;
				if (!teams)
					teams = 'LBR'.split('');
				else {
					if (!Array.isArray(teams))
						teams = [ teams ];
					if (options.FK5 !== false
							&& (teams.includes('L') || teams.includes('R'))) {
						if (!teams.includes('L'))
							teams.push('L');
						if (!teams.includes('B'))
							teams.push('B');
					}
				}

				teams.forEach(function(team_name) {
					var coefficients = [], subteams = object_teams[team_name];
					if (!subteams) {
						library_namespace.err('VSOP87: Invalid team name: ['
								+ team_name + ']');
						return;
					}

					// 無用:因為 items[1,2] 已經是弧度。
					if (false && !subteams.initialized) {
						initialize_VSOP87(subteams);
					}

					// series: 序列 L0,L1,..,B0,B1,..,R0,R1,..
					subteams.forEach(function(series) {
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

					coordinate[team_name] =
					// L=(L0+L1*τ+L2*τ^2+L3*τ^3+L4*τ^4+L5*τ^5)/10^8
					// (倍數: 10^-8)
					polynomial_value(coefficients, τ);
					// 倍數
					if (object_teams.multiplier > 0)
						coordinate[team_name] *= object_teams.multiplier;
					library_namespace.debug(object
							+ '.'
							+ team_name
							+ ' @ '
							+ JD
							+ ' ≈ '
							+ (team_name === 'R' ? coordinate[team_name]
									+ '  AU' : show_degrees(normalize_degrees(
									coordinate[team_name] / DEGREES_TO_RADIANS,
									team_name === 'B'))) + ' (coefficients: '
							+ coefficients.join(', ') + ')', 3);
				});

				/**
				 * 座標變換: 轉換到FK5(第5基本星表)坐標系統。<br />
				 * VSOP87 → FK5: translate VSOP87 coordinate to the FK5 frame.
				 * 
				 * 資料來源/資料依據:<br />
				 * Jean Meeus, Astronomical Algorithms, 2nd Edition.<br />
				 * p. 219 formula 32.3
				 * 
				 * 太陽黃經☉及黃緯β是P.Bretagnon的VSOP行星理論定義的動力學黃道坐標。這個參考系與標準的FK5坐標系統(詳見20章)僅存在很小的差別。
				 * 可按以下方法把☉、β轉換到FK5坐標系統中,其中T是J2000起算的儒略世紀數,或T=10τ。
				 * J2000.0的VSOP黃道與J2000.0的FK5黃道存在一個很小的夾角 E = 0".0554 左右，所以作以上修正。
				 */
				if (options.FK5 !== false) {
					// 先計算 L′ = L - 1°.397*T - 0°.00031*T^2
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

				return teams.length > 1 ? coordinate : coordinate[teams[0]];
			}

			_.VSOP87 = VSOP87;

			VSOP87.object_name = function(object) {
				if (typeof object === 'string')
					return object.trim().toLowerCase();
			};

			function VSOP87_add_teams(object, teams) {
				object = VSOP87.object_name(object);
				if (object === solar_terms_object)
					// reset solar_terms_cache
					solar_terms_cache = [];
				VSOP87_teams[object] = teams;
			}

			VSOP87.add_teams = VSOP87_add_teams;

			function VSOP87_load_teams(object, callback) {
				library_namespace.run(module_name + '.VSOP87_'
						+ VSOP87.object_name(object), callback);
			}

			VSOP87.load_teams = VSOP87_load_teams;

			// ------------------------------------------------------------------------------------------------------//
			// solar coordinate 太陽位置(坐標) & 二十四節氣 (solar terms)

			/**
			 * 分點和至點, 太陽視黃經λ為0°或90°或180°或270°. 在西元1951–2050的誤差 < 1分.
			 * 
			 * 資料來源/資料依據:<br />
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
			 * @returns {Number} Julian date (JD)
			 */
			function equinox(year, index, no_fix) {
				// year is an integer; other values for year, would give
				// meaningless results!
				var JD = (year |= 0) < 1000 ? equinox_teams_before_1000
						: equinox_teams_after_1000;
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
				equinox_periodic_terms.reduce(function(S, teams) {
					return S + teams[0] * Math.cos(teams[1] + teams[2] * T);
				}, 0) /
				// Δλ
				(1 + 0.0334 * Math.cos(W) + 0.0007 * Math.cos(2 * W));

				// λ: 太陽黃經☉是Date黃道分點座標的真幾何黃經。要取得視黃經λ，還應加上精確的黃經章動及光行差。
				// TODO: 黃經周年光行差修正量：-20".161 (公式(24.10)), 黃經章動效果：Δψ =
				// -12".965
				// (詳見第22章), 轉到 FK5 系統的修正值(-0".09033) (公式(24.9))
				// 光行差 aberration
				// 章動 nutation

				// ΔT(year, month)
				λ -= ΔT(year, index * 3 + 3.5) / ONE_DAY_SECONDS;

				return λ;
			}

			_.equinox = equinox;

			/**
			 * solar coordinate 太陽位置(坐標)計算。<br />
			 * ObsEcLon (Observer ecliptic lon. & lat.) or PAB-LON (PHASE angle &
			 * bisector) @ HORIZONS?
			 * 
			 * 資料來源/資料依據:<br />
			 * Jean Meeus, Astronomical Algorithms, 2nd Edition.<br />
			 * 《天文算法》 p.166~ p. 169 Example 25.b
			 * 
			 * @param {Number}JD
			 *            Julian date
			 * 
			 * @returns {Object} { apparent:太陽視黃經, λ:地心黃經(度), β:地心黃緯β(度),
			 *          Δ:日地距離(m), L:黃經 longitude, B:黃緯 latitude, R:距離 radius
			 *          vector }
			 */
			function solar_coordinate(JD) {
				// apply ΔT.
				// 天文計算用時間 TT = 日常生活時間 UT + ΔT
				// + 2000: Julian_century(JD) starts from year 2000.
				JD += ΔT(Julian_century(JD) * 100 + 2000) / ONE_DAY_SECONDS;

				// heliocentric coordinate. 計算日心坐標中地球的位置。
				var heliocentric = VSOP87(JD, solar_terms_object, {
					degrees : true
				});

				// 弧度單位日心黃經L → 地心黃經(geocentric longitude)λ(度)
				// Jean Meeus 文中以 "☉" 表示此處之 λ。
				var λ = heliocentric.L + TURN_TO_DEGREES / 2,
				// 弧度單位日心黃緯B → 地心黃緯β(度)
				β = -heliocentric.B;

				// 太陽的視黃經 (apparent longitude)λ(度)
				// Jean Meeus 文中以 "λ" 表示此處之視黃經 apparent。
				//
				// https://en.wikipedia.org/wiki/Apparent_longitude
				// Apparent longitude is used in the definition of
				// equinox and solstice.
				// 節氣以太陽視黃經為準。
				// ** 問題:但中國古代至點以日長為準。兩者或可能產生出入？
				var apparent = λ
				// 修正太陽光行差 aberration
				+ sun_aberration(heliocentric.R, JD)
				// 修正章動 nutation。
				+ nutation(JD)[0] / DEGREES_TO_RADIANS;

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
			 *            0 ~ less than 360.<br />
			 *            angle in degrees from March equinox of the year.<br />
			 *            指定太陽視黃經角度，自當年黃經0度(春分)開始。
			 * 
			 * @returns {Number} Julian date
			 */
			function JD_of_solar_angle(year, degrees) {
				var offset, apparent,
				// index: 下界 index of 分點和至點, 0~3
				index = degrees / EQUINOX_SOLSTICE_DEGREES | 0,
				// JD 近似值(下界)。
				JD = equinox(year, index, true);
				// 經測試，有時每天太陽的視黃經 (apparent longitude) 可能會增加近 .95°
				// NOT 360/365.25

				// 太陽的視黃經最大變化量
				// http://jpkc.haie.edu.cn/jpkc/dqgl/content.asp?classid=17&id=528
				// 在遠日點，地球公轉慢，太陽每日黃經差Δλ也慢，為57′
				// 在近日點，地球公轉快，太陽每日黃經差Δλ也快，為61′

				if (degrees % EQUINOX_SOLSTICE_DEGREES > 0)
					JD += ((index === 3 ? equinox(year + 1, 0) : equinox(year,
							index + 1)) - JD)
							// 以內插法取得近似值。
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

				return JD;
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
			 * 取得指定年分 year 年，指定節氣/分點和至點之 Julian date。
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
			 * @param {Integer}year
			 *            year 年(CE)
			 * @param {Number}index
			 *            index. 0: 春分
			 * @param {Number}[type]
			 *            1: 分點和至點, others (default): 二十四節氣，<br />
			 *            皆自當年黃經0度(春分)開始。
			 * 
			 * @returns {Number} Julian date
			 */
			function solar_term_JD(year, index, type) {
				var angle;
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
				// angle is now angle (0~less than 360),
				// from March equinox of year.
				return JD_of_solar_angle(year, angle);
			}

			_.solar_term_JD = solar_term_JD;

			var solar_terms_object = 'earth',
			// solar_terms_cache[ year ]
			// = [ 春分JD, 清明JD, 穀雨JD, ... 24個節氣 ]
			solar_terms_cache = [];

			/**
			 * 取得指定 Julian date 之節氣名，或已經過日數。
			 * 
			 * @param {Number}JD
			 *            Julian date
			 * @param {Object}[options]
			 *            options:<br />
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

					// JD 將被視為當地時間當日0時!
					if ((days = get_cache(true) - JD) < 1) {
						// 初候
						index = SOLAR_TERMS_NAME[index];
						if (options.time) {
							index += ' ' + ((days *= 24) | 0) + ':';
							// options.time > 1 : add seconds.
							if (options.time > 1)
								index += ((days = (days % 1) * 60) | 0) + ':';
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
			// 應用功能:需配合 'data.date'。

			var
			// 起始年月日。年月日 starts form 1.
			// 基本上與程式碼設計合一，僅表示名義，不可更改。
			START_YEAR = 1, START_MONTH = 1, START_DATE = 1,
			// set normal month count of a year.
			// 月數12: 每年有12個月.
			MONTH_COUNT = 12,
			// = 2. assert: 為整數
			SOLAR_TERMS_MONTH_RATE = SOLAR_TERMS_NAME.length / MONTH_COUNT | 0,
			// 21
			立春NO = SOLAR_TERMS_NAME.indexOf('立春') | 0,
			// 立春年_OFFSET = 5
			立春年_OFFSET = (MONTH_COUNT + START_MONTH) * SOLAR_TERMS_MONTH_RATE
					- 立春NO | 0;

			// 計算以節氣(實為十二節)分年月。每年以立春交節時刻為界。
			// 十二節年月, 節氣年月, 立春年月
			// 立春，指太陽到達黃經315°時，屬相（生肖）以立春作為起始點。
			// 中國古時春節曾專指立春，也被視為一年的開始。
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
				//
				< solar_term_JD(year - 1, 立春NO) ? year - 1 : year;
			}

			// CeL.立春年(2001).format('CE');
			_.立春年 = 立春年;

			// ----------------------------------------------------------------------------------------------------------------------------------------------//

			/**
			 * data section: 以下為計算用天文數據。
			 */

			// ------------------------------------------------------------------------------------------------------//
			// teams for obliquity 轉軸傾角
			var IAU2006_obliquity_coefficients = [ 84381.406, -46.836769,
					-0.0001831, 0.00200340, -0.000000576, -0.0000000434 ];

			/**
			 * teams for function equinox()
			 * 
			 * 資料來源/資料依據:<br />
			 * Jean Meeus, Astronomical Algorithms, 2nd Edition.<br />
			 * 《天文算法》 chapter 章動及黃赤交角.<br />
			 * 
			 * @inner
			 */
			var Laskar_obliquity_coefficients = [
			// ε = 23° 26′ 21.448″ − 4680.93″ T − 1.55″ T2
			// + 1999.25″ T3 − 51.38″ T4 − 249.67″ T5
			// − 39.05″ T6 + 7.12″ T7 + 27.87″ T8 + 5.79″ T9 + 2.45″ T10
			23 * 60 * 60 + 26 * 60 + 21.448, -4680.93, -1.55, 1999.25, -51.38,
					-249.67, -39.05, 7.12, 27.87, 5.79, 2.45 ];
			Laskar_obliquity_coefficients.forEach(function(v, index) {
				Laskar_obliquity_coefficients[index] = v
						/ DEGREES_TO_ARCSECONDS;
			});

			// ------------------------------------------------------------------------------------------------------//
			// teams for ΔT

			/**
			 * teams for function ΔT()
			 * 
			 * 資料來源/資料依據:<br />
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
			// arcsec/cy^2.
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
			// Sun's aberration. 太陽地心黃經光行差修正量。

			/**
			 * constant term of Sun's aberration
			 * 
			 * 資料來源/資料依據:<br />
			 * Jean Meeus, Astronomical Algorithms, 2nd Edition.<br />
			 * 《天文算法》 p.167,168 chapter 太陽位置計算.
			 * 
			 * If needed with respect to the mean equinox of the date instead of
			 * to a fixed reference frame, the constant term 3548.193 should be
			 * replaced by 3548.330. 如果Δλ須是在Date黃道中的，則應把常數項3548.193換為3548.330
			 */
			var sun_aberration_variation_constant = 3548.193,
			/**
			 * coefficients of Sun's aberration
			 * 
			 * Σ : Σ ([0] * sin ( [1] + [2] τ) )
			 * 
			 * daily variation = sun_aberration_variation_constant +
			 * Σ(variation[0]) + Σ(variation[1])*τ + Σ(variation[2])*τ^2 +
			 * Σ(variation[3])*τ^3
			 * 
			 * τ的係數為359993.7、719987或1079981的週期項，與地球離心率相關。<br />
			 * τ的係數為4452671、9224660或4092677的週期項，與月球運動相關。<br />
			 * τ的係數為450369、225184、315560或675553的週期項，與金星攝動相關。<br />
			 * τ的係數為329645、659289、或299296的週期項，與火星攝動相關。
			 */
			sun_aberration_variation = [
					// τ^0
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
					// τ^1
					[ [ 7.311, 333.4515, 359993.7286 ],
							[ 0.305, 330.9814, 719987.4571 ],
							[ 0.010, 328.5170, 1079981.1857 ] ],
					// τ^2
					[ [ 0.309, 241.4518, 359993.7286 ],
							[ 0.021, 205.0482, 719987.4571 ],
							[ 0.004, 297.8610, 4452671.1152 ] ],
					// τ^3
					[ [ 0.010, 154.7066, 359993.7286 ] ] ];

			sun_aberration_variation.forEach(function(team) {
				team.forEach(function(sub_team) {
					sub_team[1] *= DEGREES_TO_RADIANS;
					sub_team[2] *= DEGREES_TO_RADIANS;
				});
			});

			// ------------------------------------------------------------------------------------------------------//

			/**
			 * teams for function equinox()
			 * 
			 * 資料來源/資料依據:<br />
			 * Jean Meeus, Astronomical Algorithms.<br />
			 * 《天文算法》 chapter 分點和至點.<br />
			 * 
			 * @inner
			 */
			// for years -1000 to 1000
			var equinox_teams_before_1000 = [
			// March equinox, 春分
			[ 1721139.29189, 365242.13740, 0.06134, 0.00111, -0.00071 ],
			// June Solstice, 夏至
			[ 1721233.25401, 365241.72562, -0.05323, 0.00907, 0.00025 ],
			// September equinox, 秋分
			[ 1721325.70455, 365242.49558, -0.11677, -0.00297, 0.00074 ],
			// December Solstice, 冬至
			[ 1721414.39987, 365242.88257, -0.00769, -0.00933, -0.00006 ] ],
			// for years 1000 to 3000
			equinox_teams_after_1000 = [
			// March equinox, 春分
			[ 2451623.80984, 365242.37404, 0.05169, -0.00411, -0.00057 ],
			// June Solstice, 夏至
			[ 2451716.56767, 365241.62603, 0.00325, 0.00888, -0.00030 ],
			// September equinox, 秋分
			[ 2451810.21715, 365242.01767, -0.11575, 0.00337, 0.00078 ],
			// December Solstice, 冬至
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
			equinox_periodic_terms.forEach(function(teams) {
				teams[1] *= DEGREES_TO_RADIANS;
				teams[2] *= DEGREES_TO_RADIANS;
			});

			// ------------------------------------------------------------------------------------------------------//
			// 章動 nutation

			/**
			 * teams for function nutation()
			 * 
			 * 資料來源/資料依據:<br />
			 * Nutation, IAU 2000B model.
			 * 
			 * @see https://github.com/kanasimi/IAU-SOFA/blob/master/src/nut00b.c
			 * @see http://www.neoprogrammics.com/nutations/nutations_1980_2000b/index.php
			 * 
			 * @inner
			 */
			var IAU2000B_nutation_parameters = [
			// Mean anomaly of the Moon. 月亮平近點角
			[ 485868.249036, 1717915923.2178
			// , 31.8792, 0.051635, -0.00024470
			],
			// Mean anomaly of the Sun. 太陽平近點角
			[ 1287104.79305, 129596581.0481
			// , -0.5532, 0.000136, -0.00001149
			],
			// Mean argument of the latitude of the Moon. 月亮平升交角距
			[ 335779.526232, 1739527262.8478
			// , -12.7512, -0.001037, 0.00000417
			],
			// Mean elongation of the Moon from the Sun. 日月平角距
			[ 1072260.70369, 1602961601.2090
			// , -6.3706, 0.006593, -0.00003169
			],
			// Mean longitude of the ascending node of the Moon. 月亮升交點平黃經
			[ 450160.398036, -6962890.5431
			// , 7.4722, 0.007702, -0.00005939
			] ],

			// 0~4: coefficients of l,l',F,D,Om
			// int nl,nlp,nf,nd,nom;
			// 5~7: longitude sin, t*sin, cos coefficients
			// double ps,pst,pc;
			// 8~10: obliquity cos, t*cos, sin coefficients
			// double ps,pst,pc;
			IAU2000B_nutation_teams = [
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
			 * teams for function nutation()
			 * 
			 * 資料來源/資料依據:<br />
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
			// D = 297.85036 + 445267.111480*T - 0.0019142*T^2 +
			// T^3/189474
			[ 297.85036, 445267.111480, -0.0019142, 1 / 189474 ],
			// 太陽（地球）平近點角：
			// M = 357.52772 + 35999.050340*T - 0.0001603*T^2 -
			// T^3/300000
			[ 357.52772, 35999.050340, -0.0001603, -1 / 300000 ],
			// 月球平近點角：
			// M′= 134.96298 + 477198.867398*T + 0.0086972*T^2 +
			// T^3/56250
			[ 134.96298, 477198.867398, 0.0086972, 1 / 56250 ],
			// 月球緯度參數：
			// F = 93.27191 + 483202.017538*T - 0.0036825*T^2 +
			// T^3/327270
			[ 93.27191, 483202.017538, -0.0036825, 1 / 327270 ],
			// 黃道與月球平軌道升交點黃經，從Date黃道平分點開始測量：
			// Ω= 125.04452 - 1934.136261*T + 0.0020708*T^2 +
			// T^3/450000
			[ 125.04452, -1934.136261, 0.0020708, 1 / 450000 ] ],

			// 這些項來自 IAU 1980 章動理論，忽略了係數小於0".0003的項。
			// https://github.com/kanasimi/IAU-SOFA/blob/master/src/nut80.c
			IAU1980_nutation_teams = [
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
			// VSOP87 半解析（semi-analytic）理論 periodic terms

			/**
			 * teams for VSOP87 model used in function VSOP87()
			 * 
			 * full data:<br />
			 * ftp://ftp.imcce.fr/pub/ephem/planets/vsop87/README
			 * ftp://ftp.imcce.fr/pub/ephem/planets/vsop87/VSOP87D.ear
			 * 
			 * TODO: VSOP2013
			 * 
			 * see also:<br />
			 * JPL DE422:<br />
			 * http://ssd.jpl.nasa.gov/?ephemerides
			 * ftp://ssd.jpl.nasa.gov/pub/eph/planets/ascii/de422/
			 * 
			 * @inner
			 */
			var VSOP87_teams = library_namespace.null_Object();

			/**
			 * 這邊僅擷取行星 Earth 地球數值，以計算二十四節氣 (solar terms)。
			 * 
			 * VSOP87_teams.earth[L黃經/B黃緯/R距離] = [L0:[[A,B,C],[A,B,C]]];
			 * 
			 * modified VSOP87: Jean Meeus
			 * 從VSOP87中取出一些主要項(詳見附錄II)，利用它計算得到的太陽位置在-2000到6000年範圍內精度是1"。<br />
			 * 誤差 365.25*24*60*60/360/60/60 = 24.35秒鐘。相當於半分鐘。
			 * 
			 * 資料來源/資料依據:<br />
			 * Jean Meeus, Astronomical Algorithms, 2nd Edition.<br />
			 * Appendix III 《天文算法》 附表3.<br />
			 * http://forums.parallax.com/showthread.php/154838-Azimuth-angle-conversion-from-east-to-west
			 * 
			 * @see http://www.neoprogrammics.com/vsop87/source_code_generator_tool/
			 *      VSOP87B日心黃道球面坐標 Heliocentric LBR - J2000
			 * @see ftp://ftp.imcce.fr/pub/ephem/planets/vsop87/VSOP87B.ear
			 */
			VSOP87_teams.earth = {
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
				// 行星 Earth 地球: 行星到太陽的距離, 日地距離
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
