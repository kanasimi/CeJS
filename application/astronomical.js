/**
 * @name CeL function for astronomical calculations.
 * @fileoverview 本檔案包含了天文演算用的日期轉換功能。
 * 
 * @since 2015/3/20 23:5:43
 * 
 * TODO:<br />
 * 大地測量:地球表面兩點間之距離<br />
 * http://wywu.pixnet.net/blog/post/27459116
 * http://iotresearch.wikispaces.com/GPS<br />
 * Andoyer 方法最大的誤差約為50公尺，Lambert 方法最大的誤差約30m。
 * http://usenrong.iteye.com/blog/2147341
 * http://en.wikipedia.org/wiki/Haversine_formula
 * http://en.wikipedia.org/wiki/Spherical_law_of_cosines
 * http://en.wikipedia.org/wiki/Vincenty's_formulae
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

			// 工具函數。

			if (false) {
				polynomial_value(2, [ 3, 4, 5 ]) === 3 + 4 * 2 + 5 * 2 * 2;
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
			var deltaT_year_start = [ 2150, 2050, 2005, 1986, 1961, 1941, 1920,
					1900, 1860, 1800, 1700, 1600, 500, -500 ],
			// http://eclipse.gsfc.nasa.gov/SEcat5/deltatpoly.html
			// All values of ΔT based on Morrison and Stephenson [2004]
			// assume a value for the Moon's secular acceleration of -26
			// arcsec/cy^2.
			deltaT_year_diff = [ 1820, 1820, 2000, 2000, 1975, 1950, 1920,
					1900, 1860, 1800, 1700, 1600, 1000, 0 ],
			// 為統合、方便計算，在演算方法上作了小幅變動。
			deltaT_coefficients = [
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
			function deltaT(year, month) {
				if (month > 0)
					year += (month - 0.5) / 12;

				var index = 0;
				for (;;) {
					if (year >= deltaT_year_start[index])
						break;
					if (++index === deltaT_year_start.length) {
						// before –500: the same as after 2150.
						index = 0;
						break;
					}
				}
				return polynomial_value((year - deltaT_year_diff[index]) / 100,
						deltaT_coefficients[index]);
			}

			_.deltaT = deltaT;

			// ---------------------------------------------------------------------//
			// Atmospheric refraction

			/**
			 * degrees * DEGREES_TO_RADIANS = radians
			 */
			var DEGREES_TO_RADIANS = 2 * Math.PI / 360;

			/**
			 * true apparent in degrees ← apparent altitude.<br />
			 * 大氣折射公式: 真地平緯度 ← 視地平緯度<br />
			 * 
			 * 資料來源/資料依據: Jean Meeus, Astronomical Algorithms. chapter 大氣折射.<br />
			 * from G. G. Bennett. (1982). "The Calculation of Astronomical
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
				// 常規條件: Both formulas assume an atmospheric pressure
				// of 101.0 kPa and a temperature of 10 °C
				if (!isNaN(Celsius))
					// [K] = [°C] + 273.15
					refraction *= (273 + 10) / (273 + refraction);
				if (kPa > 0)
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
				if (kPa > 0)
					refraction *= kPa / 101;

				// 1度 = 60分
				return real + refraction / 60;
			}

			refraction.to_real = refraction_to_real;
			_.refraction = refraction;

			// ---------------------------------------

			// ---------------------------------------------------------------------//
			// export.

			return (_// JSDT:_module_
			);
		}
	});
