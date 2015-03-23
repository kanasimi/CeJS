/**
 * @name CeL function for astronomical calculations.
 * @fileoverview 本檔案包含了天文演算用的日期轉換功能。
 * 
 * @since 2015/3/20 23:5:43
 * 
 * @see 計算順序:
 *      https://github.com/kanasimi/IAU-SOFA/blob/master/doc/sofa_ast_c.pdf
 * 
 * TODO:<br />
 * 大地測量:地球表面兩點間之距離<br />
 * http://wywu.pixnet.net/blog/post/27459116
 * http://iotresearch.wikispaces.com/GPS<br />
 * Andoyer 方法最大的誤差約為50公尺，Lambert 方法最大的誤差約30m。
 * http://usenrong.iteye.com/blog/2147341
 * http://en.wikipedia.org/wiki/Haversine_formula
 * http://en.wikipedia.org/wiki/Spherical_law_of_cosines
 * http://en.wikipedia.org/wiki/Vincenty's_formulae<br />
 * http://bieyu.com/<br />
 * http://www.fjptsz.com/xxjs/xjw/rj/117/index.htm
 * 
 * 未來發展：<br />
 * 
 */

'use strict';
// 'use asm';

if (false) {
	CeL.run('application.astronomical', function() {
		CeL.assert([ 1.11, Math.round(10 * CeL.deltaT(2010) / 6) / 100 ],
				'get ΔT of year 2010 in minutes');
		CeL.assert([ 95.17, Math.round(10 * CeL.deltaT(500) / 6) / 100 ],
				'get ΔT of year 500 in minutes');

		// 例15.a：表面光滑的太陽圓盤下邊沿視緯度是30′。設太陽的真直徑是32′，氣溫及大氣壓為常規條件。求真位置。
		CeL.refraction(CeL.refraction.to_real(30 / 60) + 32 / 60) * 60;
		// get 57.9′

		CeL.JD_to_Date(CeL.equinox(1962, 1));
		// get 1962-06-21 21:24
	});
}

if (typeof CeL === 'function')
	CeL.run({
		name : 'application.astronomical',
		//
		require : 'data.code.compatibility.'
				+ '|data.native.|application.locale.|data.date.String_to_Date',

		code : function(library_namespace) {

			// requiring
			var String_to_Date;
			eval(this.use());

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

			// ---------------------------------------------------------------------//
			// 定義基本常數。

			/**
			 * degrees * DEGREES_TO_RADIANS = radians.
			 * 1.745329251994329576923691e-2
			 */
			var DEGREES_TO_RADIANS = 2 * Math.PI / 360,
			// degrees * DEGREES_TO_ARCSECONDS = arcseconds.
			DEGREES_TO_ARCSECONDS = 60 * 60,
			// arcseconds * ARCSECONDS_TO_RADIANS = radians.
			ARCSECONDS_TO_RADIANS = DEGREES_TO_RADIANS / DEGREES_TO_ARCSECONDS,
			//
			ONE_DAY_SECONDS = 24 * 60 * 60,
			// Reference epoch (J2000.0), Julian Date
			// https://github.com/kanasimi/IAU-SOFA/blob/master/src/sofam.h
			J2000_epoch = 2451545.0,
			// Days per Julian century
			// https://github.com/kanasimi/IAU-SOFA/blob/master/src/sofam.h
			DAYS_OF_JULIAN_CENTURY = 36525,
			//			
			SOLAR_TERM_NAME =
			// Chinese name
			'春分,清明,穀雨,立夏,小滿,芒種,夏至,小暑,大暑,立秋,處暑,白露,秋分,寒露,霜降,立冬,小雪,大雪,冬至,小寒,大寒,立春,雨水,驚蟄'
					.split(',');

			// 工具函數。

			if (false) {
				polynomial_value([ 3, 4, 5 ], 2) === 3 + 4 * 2 + 5 * 2 * 2;
			}

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
				// or use coefficients.reduce();
				var i = coefficients.length, value = coefficients[--i];
				while (i > 0)
					value = value * variable + coefficients[--i];
				return value;
			}

			// ---------------------------------------------------------------------//
			// obliquity 轉軸傾角

			/**
			 * 地球的轉軸傾角。 get mean obliquity of the ecliptic (Earth's axial tilt),
			 * IAU 2006 precession model.<br />
			 * 資料來源/資料依據:
			 * https://github.com/kanasimi/IAU-SOFA/blob/master/src/obl06.c
			 * 
			 * @param {Number}JD
			 *            Julian date
			 * 
			 * @returns {Number} obliquity in degrees
			 * 
			 * @see https://en.wikipedia.org/wiki/Axial_tilt
			 */
			function obliquity(JD) {
				return polynomial_value([ 84381.406, -46.836769, -0.0001831,
						0.00200340, -0.000000576, -0.0000000434 ],
				// Interval between fundamental date J2000.0 and given date
				// (JC).
				(JD - J2000_epoch) / DAYS_OF_JULIAN_CENTURY)
						/ DEGREES_TO_ARCSECONDS;
			}

			_.obliquity = obliquity;

			// ---------------------------------------------------------------------//
			// ΔT

			// 資料來源/資料依據:
			// http://www.staff.science.uu.nl/~gent0113/deltat/deltat_old.htm
			var ΔT_year_start = [ 2150, 2050, 2005, 1986, 1961, 1941, 1920,
					1900, 1860, 1800, 1700, 1600, 500, -500 ],
			// http://eclipse.gsfc.nasa.gov/SEcat5/deltatpoly.html
			// All values of ΔT based on Morrison and Stephenson [2004]
			// assume a value for the Moon's secular acceleration of -26
			// arcsec/cy^2.
			ΔT_year_diff = [ 1820, 1820, 2000, 2000, 1975, 1950, 1920, 1900,
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

			/**
			 * get ΔT of year.<br />
			 * ΔT = TT - UT<br />
			 * <br />
			 * 天文計算/星曆表使用 Terrestrial Time (TT, 地球時標)，<br />
			 * 日常生活中使用 UTC, 接近 Universal Time (UT, 世界時標), 主要為 UT1。<br />
			 * <br />
			 * 天文計算用時間 TT = 日常生活時間 UT + ΔT
			 * 
			 * @param {Number}year
			 *            the year value of time = year + (month - 0.5) / 12
			 * @param {Number}[month]
			 *            the month of time.
			 * 
			 * @returns {Number} ΔT of year in seconds.
			 * 
			 * @see https://en.wikipedia.org/wiki/%CE%94T
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
				return polynomial_value(ΔT_coefficients[index],
						(year - ΔT_year_diff[index]) / 100);
			}

			_.deltaT = ΔT;

			// ---------------------------------------------------------------------//
			// Atmospheric refraction

			/**
			 * true apparent in degrees ← apparent altitude.<br />
			 * 大氣折射公式: 真地平緯度 ← 視地平緯度<br />
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
				// 再多就變負數。
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
				// 再多就變負數。
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

			// ---------------------------------------------------------------------//
			// 二十四節氣 (solar terms)

			// 資料來源/資料依據:
			// Jean Meeus, Astronomical Algorithms.
			// 《天文算法》 chapter 分點和至點.

			// [ 春分, 夏至, 秋分, 冬至 ]
			// [ March equinox, June Solstice, September equinox,
			// December Solstice ]

			/**
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

			// 太陽地心黃經光行差修正項 (20.10)
			function solar_aberration(R) {
				// 式中R是日地距離(天文單位)。分子是光行差常數(κ=20″.49552 arcseconds at
				// J2000)乘以a*(1-e^2)，與24.5式的分子相同。因此24.10中的分子中其實是一個緩慢變化的數，在0年是20".4893，在+4000年是20".4904。
				return -20.4898 / R;
			}

			/**
			 * 分點和至點, 太陽視黃經λ為0°或90°或180°或270°. 在西元1951–2050的誤差 < 1分.
			 * 
			 * @param {Integer}year
			 *            年
			 * @param {Integer}index
			 *            0–3: [ 春分, 夏至, 秋分, 冬至 ]
			 * 
			 * @returns {Number} Julian date (JD)
			 */
			function equinox(year, index, no_ΔT) {
				// year is an integer; other values for year, would give
				// meaningless results!
				var JD = (year |= 0) < 1000 ? equinox_teams_before_1000
						: equinox_teams_after_1000;
				// 計算相應的平分點或平至點的時刻。
				JD = polynomial_value(JD[index |= 0], (year < 1000 ? year
						: year - 2000) / 1000);

				var T = (JD - 2451545.0) / 36525,
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

				// λ: 太陽黃經Θ是Date黃道分點座標的真幾何黃經。要取得視黃經λ，還應加上精確的黃經章動及光行差。
				// TODO: 黃經周年光行差修正量：-20".161 (公式(24.10)), 黃經章動效果：Δψ = -12".965
				// (詳見第22章), 轉到FK5系統的修正值(-0".09033) (公式(24.9))
				// 光行差 aberration
				// 章動 nutation

				if (!no_ΔT)
					// ΔT(year, month)
					λ -= ΔT(year, index * 3 + 3.5) / ONE_DAY_SECONDS;

				return λ;
			}

			_.equinox = equinox;

			// 黃經0度~
			function solar_term(year, index) {
				if (isNaN(index)
				//
				&& (index = index ? SOLAR_TERM_NAME.indexOf(index) : 0)) {
					library_namespace.err('solar_term: Invalid solar term!');
					return;
				}

				var JD = equinox(year, index / (24 / 4));
				if (index % (24 / 4) === 0)
					return JD;

				// TODO
				var L = VSOP87(JD, 'Earth', 'L');
				return L;
			}

			_.solar_term = solar_term;

			// 物侯

			function initialize_VSOP87(subteams) {
				subteams.forEach(function(series) {
					series.forEach(function(items) {
						items[1] *= DEGREES_TO_RADIANS;
						items[2] *= DEGREES_TO_RADIANS;
					});
				});
				subteams.initialized = true;
			}

			// 資料來源/資料依據:
			// Jean Meeus, Astronomical Algorithms.
			// 《天文算法》 chapter 太陽位置計算
			// Jean Meeus
			// 從VSOP87中取出一些主要項(詳見附錄II)，利用它計算得到的太陽位置在-2000到6000年範圍內精度是1"。
			// 誤差 365.25*24*60*60/360/60/60 = 24.35秒鐘。相當於半分鐘。
			function VSOP87(JD, object, team) {
				var object_teams, subteams,
				// 儒略千年數 millennium
				τ = (JD - 2451545.0) / 365250,
				//				
				result = library_namespace.null_Object();
				if (!object)
					object = 'Earth';
				object_teams = VSOP87_team[object];
				if (!team)
					// request L黃經 longitude + B黃緯 latitude + R距離
					team = 'LBR'.split('');
				else if (!Array.isArray(team))
					team = [ team ];

				team.forEach(function(team_name) {
					var coefficients = [], subteams = object_teams[team_name];
					if (!subteams) {
						library_namespace.err('VSOP87: Invalid team name: ['
								+ team_name + ']');
						return;
					}
					if (!subteams.initialized)
						initialize_VSOP87(subteams);
					// series: 序列 L0,L1,..,B0,B1,..,R0,R1,..
					subteams.forEach(function(series) {
						coefficients.push(series.reduce(function(value, items) {
							return value + items[0] * Math.cos(
							// items: 三個數字項 [A,B,C]
							// 每項(表中各行)的值計算表達式是：
							// A*cos(B+C*τ);
							items[1] + items[2] * τ);
						}, 0));
					});

					subteams =
					// L=(L0+L1*τ+L2*τ^2+L3*τ^3+L4*τ^4+L5*τ^5)/108
					polynomial_value(coefficients, τ) / 1e8;
					if (team_name === 'L' || team_name === 'B')
						// 日心黃經L、黃緯B 單位是弧度
						// R的單位是天文單位（AU）
						subteams /= DEGREES_TO_RADIANS;
					result[team_name] = subteams;
				});

				return team.length > 1 ? result : result[team[0]];
			}

			_.VSOP87 = VSOP87;

			// ---------------------------------------------------------------------//
			// VSOP87 半解析（semi-analytic）理論 periodic terms
			var VSOP87_team = library_namespace.null_Object();

			// 資料來源/資料依據:
			// Jean Meeus, Astronomical Algorithms.
			// 附表3
			// http://forums.parallax.com/showthread.php/154838-Azimuth-angle-conversion-from-east-to-west

			// VSOP87_team.Earth[L黃經/B黃緯/R距離]=[L0:[[A,B,C],[A,B,C]]];
			VSOP87_team.Earth = {
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
						[ [ 280.0, 3.199, 84334.662 ],
								[ 102.0, 5.422, 5507.553 ],
								[ 80, 3.88, 5223.69 ], [ 44, 3.7, 2352.87 ],
								[ 32, 4, 1577.34 ] ],
						[ [ 9, 3.9, 5507.55 ], [ 6, 1.73, 5223.69 ] ] ],
				// 行星 Earth 地球: 到太陽的距離
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

			// ---------------------------------------------------------------------//
			// export.

			// ---------------------------------------

			return (_// JSDT:_module_
			);
		}
	});
