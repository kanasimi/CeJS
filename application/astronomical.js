/**
 * @name CeL function for astronomical calculations.
 * @fileoverview 本檔案包含了天文演算用的日期轉換功能。
 * 
 * @since 2015/3/20 23:5:43
 * 
 * @see 計算順序: http://www.iausofa.org/
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
			//
			ONE_DAY_SECONDS = 24 * 60 * 60,
			//			
			SOLAR_TERM_NAME =
			// Chinese name
			'春分,清明,穀雨,立夏,小滿,芒種,夏至,小暑,大暑,立秋,處暑,白露,秋分,寒露,霜降,立冬,小雪,大雪,冬至,小寒,大寒,立春,雨水,驚蟄'
					.split(',');

			// 工具函數。

			// 儒略世紀數 = (JDE - 2451545) / 36525;

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
					[ 10583.6, -1014.41, 33.78311 - 5.952053, -0.1798452,
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
			 * chapter 大氣折射.<br />
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
					// Meeus: 在90°時，不作第二項修正反而更好。
					return apparent;

				// refraction in arcminutes. 折射角單位是分.
				var refraction = 1 / Math
						.tan((apparent + 7.31 / (apparent + 4.4))
								* DEGREES_TO_RADIANS);
				// 第二項公式修正
				refraction -= 0.06 * Math.sin(14.7 * refraction + 13);
				// assert: refraction > 0

				// Meeus: 大約修正。折射率還與光的波長有關。這些運算式適用于黃光，它對人眼的靈敏度最高。
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
					// Meeus: h=90°時，該式算得R不等於零。
					return real;

				// refraction in arcminutes. 折射角單位是分.
				var refraction = 1.02 / Math.tan((real + 10.3 / (real + 5.11))
						* DEGREES_TO_RADIANS);
				// assert: refraction > 0

				// Meeus: 大約修正。折射率還與光的波長有關。這些運算式適用于黃光，它對人眼的靈敏度最高。
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
			// chapter 分點和至點.

			// 從VSOP87中取出一些主要項(詳見附錄II)，利用它計算得到的太陽位置在-2000到6000年範圍內精度是1"。
			// 誤差 365.25*24*60*60/360/60/60 = 24.35秒鐘。相當於半分鐘。

			// [ 春分, 夏至, 秋分, 冬至 ]
			// [ March equinox, June Solstice, September equinox,
			// December Solstice ]

			/**
			 * @inner
			 */
			// for years -1000 to 1000
			var team_before_1000 = [
			// March equinox, 春分
			[ 1721139.29189, 365242.13740, 0.06134, 0.00111, -0.00071 ],
			// June Solstice, 夏至
			[ 1721233.25401, 365241.72562, -0.05323, 0.00907, 0.00025 ],
			// September equinox, 秋分
			[ 1721325.70455, 365242.49558, -0.11677, -0.00297, 0.00074 ],
			// December Solstice, 冬至
			[ 1721414.39987, 365242.88257, -0.00769, -0.00933, -0.00006 ] ],
			// for years 1000 to 3000
			team_after_1000 = [
			// March equinox, 春分
			[ 2451623.80984, 365242.37404, 0.05169, -0.00411, -0.00057 ],
			// June Solstice, 夏至
			[ 2451716.56767, 365241.62603, 0.00325, 0.00888, -0.00030 ],
			// September equinox, 秋分
			[ 2451810.21715, 365242.01767, -0.11575, 0.00337, 0.00078 ],
			// December Solstice, 冬至
			[ 2451900.05952, 365242.74049, -0.06223, -0.00823, 0.00032 ] ],
			// 週期項
			periodic_term = [ [ 485, 324.96, 1934.136 ],
					[ 203, 337.23, 32964.467 ], [ 199, 342.08, 20.186 ],
					[ 182, 27.85, 445267.112 ], [ 156, 73.14, 45036.886 ],
					[ 136, 171.52, 22518.443 ], [ 77, 222.54, 65928.934 ],
					[ 74, 296.72, 3034.906 ], [ 70, 243.58, 9037.513 ],
					[ 58, 119.81, 33718.147 ], [ 52, 297.17, 150.678 ],
					[ 50, 21.02, 2281.226 ], [ 45, 247.54, 29929.562 ],
					[ 44, 325.15, 31555.956 ], [ 29, 60.93, 4443.417 ],
					[ 18, 155.12, 67555.328 ], [ 17, 288.79, 4562.452 ],
					[ 16, 198.04, 62894.029 ], [ 14, 199.76, 31436.921 ],
					[ 12, 95.39, 14577.848 ], [ 12, 287.11, 31931.756 ],
					[ 12, 320.81, 34777.259 ], [ 9, 227.73, 1222.114 ],
					[ 8, 15.45, 16859.074 ] ];

			// 把能先做的做一做，加快運算速度。
			periodic_term.forEach(function(teams) {
				teams[1] *= DEGREES_TO_RADIANS;
				teams[2] *= DEGREES_TO_RADIANS;
			});

			/**
			 * 分點和至點, 太陽視黃經λ為0°或90°或180°或270°. 在西元1951–2050的誤差 < 1分.
			 * 
			 * @param {Integer}year
			 *            年
			 * @param {Integer}index
			 *            0–3: [ 春分, 夏至, 秋分, 冬至 ]
			 * 
			 * @returns {Number} JDE
			 */
			function equinox(year, index, no_ΔT) {
				// year is an integer; other values for year, would give
				// meaningless results!
				var JDE0 = (year |= 0) < 1000 ? team_before_1000
						: team_after_1000;
				// 計算相應的平分點或平至點的時刻。
				JDE0 = polynomial_value(JDE0[index |= 0], (year < 1000 ? year
						: year - 2000) / 1000);

				var T = (JDE0 - 2451545.0) / 36525,
				//
				W = (35999.373 * T - 2.47) * DEGREES_TO_RADIANS;

				// 要計算的分點或至點時刻(儒略曆書時,即力學時）表達為：
				JDE0 += 0.00001 *
				// JDE0 + 0.00001 S / Δλ 日
				periodic_term.reduce(function(S, teams) {
					return S + teams[0] * Math.cos(teams[1] + teams[2] * T);
				}, 0) /
				// Δλ
				(1 + 0.0334 * Math.cos(W) + 0.0007 * Math.cos(2 * W));

				if (!no_ΔT)
					// ΔT(year, month)
					JDE0 -= ΔT(year, index * 3 + 3.5) / ONE_DAY_SECONDS;

				return JDE0;
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

				if (index % (24 / 4) === 0)
					return equinox(year, index / (24 / 4));

				// TODO

			}

			// ---------------------------------------------------------------------//
			// export.

			// ---------------------------------------

			return (_// JSDT:_module_
			);
		}
	});
