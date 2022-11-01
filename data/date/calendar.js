
/**
 * @name	CeL function for calendrical calculations.
 *
 * If you need a online demo of these calendars, please visit:
 * http://lyrics.meicho.com.tw/lib/JS/_test%20suite/era.htm
 *
 * @fileoverview
 * 本檔案包含了曆法轉換的功能。
 *
 * @since 2014/4/12 15:37:56
 */

// https://www.funaba.org/cc
// http://www.fourmilab.ch/documents/calendar/
// http://the-light.com/cal/converter/
// http://keith-wood.name/calendars.html
// http://www.cc.kyoto-su.ac.jp/~yanom/pancanga/index.html

/*

TODO:
https://en.wikipedia.org/wiki/Vikram_Samvat
the official calendar of Nepal

*/


'use strict';
if (typeof CeL === 'function')
CeL.run(
{
name : 'data.date.calendar',
// |application.astronomy.
// data.math.find_root
require : 'data.code.compatibility.|data.native.set_bind|data.date.String_to_Date|data.date.is_leap_year|data.date.Julian_day|data.math.',

code : function(library_namespace) {

//	requiring
var set_bind = this.r('set_bind'), String_to_Date = this.r('String_to_Date'), is_leap_year = this.r('is_leap_year'), Julian_day = this.r('Julian_day');



/**
 * null module constructor
 * @class	calendars 的 functions
 */
var _// JSDT:_module_
= function() {
	//	null module constructor
};


/**
 * for JSDT: 有 prototype 才會將之當作 Class
 */
_// JSDT:_module_
.prototype = {
};


//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// 工具函數。


var
// copy from data.date.
/** {Number}一整天的 time 值。should be 24 * 60 * 60 * 1000 = 86400000. */
ONE_DAY_LENGTH_VALUE = new Date(0, 0, 2) - new Date(0, 0, 1);

var
// 24 hours
ONE_DAY_HOURS = (new Date(1, 1, 1, -1)).getHours() | 0,
// set weekday name converter.
KEY_WEEK = 'week';


function _Date(year, month, date) {
	if (year < 100) {
		// 僅使用 new Date(0) 的話，會含入 timezone offset (.getTimezoneOffset)。
		// 因此得使用 new Date(0, 0)。
		var d = new Date(0, 0);
		d.setFullYear(year, month, date);
		return d;
	}
	return new Date(year, month, date);
}

function _time(year, month, date, hour) {
	if (year < 100) {
		// 僅使用 new Date(0) 的話，會含入 timezone offset (.getTimezoneOffset)。
		// 因此得使用 new Date(0, 0)。
		var d = new Date(0, 0);
		d.setFullYear(year, month, date, hour);
		return d;
	}
	return new Date(year, month, date, hour);
}



/**
 * format 回傳處理。
 *
 * <code>
 * API:

Date_to_Calendar({Date}, {Object}options)

options.format = 'serial':
	return 數字序號 (numerical serial №) [ {Integer}year, {Natural}month, {Natural}date ]

options.format = 'item':
	一般會:
	return [ {Integer}year, {String}month name, {Natural}date ]
	return [ {Integer}year, {String}month name, {Natural}date, {小數}餘下不到一日之時間值 remainder (單位:日) ]

options.format = 'text':
	return {String} 當地語言之表現法。常是 "weekday, date month year"。

others:
	default: text

 * </code>
 *
 * @param {Array}date [
 *            {Integer}year, {Natural}month, {Natural}date ],<br />
 *            date[KEY_WEEK] = {Integer}weekday
 * @param {Object}[options]
 *            options that called
 * @param {Array|Function}to_name [
 *            {Function}year serial to name, {Function}month serial to name,
 *            {Function}date serial to name, {Function}weekday serial to name ]
 * @returns
 */
function _format(date, options, to_name, is_leap, combine) {
	var format = options && options.format;

	if (format === 'serial')
		return date;

	if (typeof to_name === 'function')
		// 當作 month_to_name。
		date[1] = to_name(date[1], is_leap, options);
	else if (Array.isArray(to_name))
		to_name.forEach(function(func, index) {
			date[ index === 3 ? KEY_WEEK : index ]
			//
			= func(date[index], is_leap, index);
		});
	else
		library_namespace.warn('_format: 無法辨識之 to_name: ' + to_name);

	if (format === 'item')
		return date;

	if (options && typeof options.numeral === 'function') {
		date[0] = options.numeral(date[0]);
		date[2] = options.numeral(date[2]);
	}

	if (typeof combine === 'function') {
		format = combine(date);
	} else {
		format = date.slice(0, 3);
		// direction
		if (combine !== true)
			format = format.reverse();
		format = format.join(' ');
	}

	if (options) {
		if (options.postfix)
			format += options.postfix;
		if (options.prefix)
			format = options.prefix + format;
	}

	// add weekday name
	if (date[KEY_WEEK])
		format = date[KEY_WEEK] + ', ' + format;
	return format;
}



/**
 * 創建測試器。<br />
 * test: 經過正反轉換運算，應該回到相同的日子。
 * 
 * @param {Function}to_Calendar
 * @param {Function}to_Date
 * @param {Object}[options]
 * 
 * @returns {Function}測試器。
 */
function new_tester(to_Calendar, to_Date, options) {
	options = Object.assign(Object.create(null),
			new_tester.default_options, options || {});
	var epoch = (options.epoch || to_Date.epoch) - 0 || 0,
	//
	month_days = options.month_days, CE_format = options.CE_format,
	//
	continued_month = options.continued_month,
	//
	get_month_serial = options.month_serial;

	return function(begin_Date, end_Date, error_limit) {
		begin_Date = typeof begin_Date === 'number' ? epoch + (begin_Date | 0)
				* ONE_DAY_LENGTH_VALUE : begin_Date - 0;
		var tmp = typeof end_Date === 'string'
				&& end_Date.trim().match(/^\+(\d+)$/);
		end_Date = tmp || typeof end_Date === 'number' ? (tmp ? begin_Date
				: epoch)
				+ end_Date * ONE_DAY_LENGTH_VALUE : end_Date - 0;
		if (isNaN(begin_Date) || isNaN(end_Date))
			return;

		var begin = Date.now(), last_show = begin, date_name, old_date_name, error = [];
		if (!(0 < error_limit && error_limit < 1e9))
			error_limit = new_tester.default_options.error_limit;

		for (; begin_Date <= end_Date && error.length < error_limit; begin_Date += ONE_DAY_LENGTH_VALUE) {
			// 正解: Date → calendar date
			date_name = to_Calendar(new Date(begin_Date), options);
			if (old_date_name
					//
					&& (date_name[2] - old_date_name[2] !== 1 || old_date_name[1] !== date_name[1])) {
				if (date_name[0] !== old_date_name[0]
				// 每世紀記錄一次使用時間。
				&& date_name[0] % 100 === 0 && Date.now() - last_show > 20000) {
					console.log((begin_Date - epoch) / ONE_DAY_LENGTH_VALUE
							+ ' days: ' + date_name.join() + ' ('
							+ (new Date(begin_Date)).format(CE_format) + ')'
							+ ', 使用時間 ' + ((last_show = Date.now()) - begin)
							+ ' ms.');
				}
				// 確定 old_date_name 的下一個天為 date_name。
				// 月差距
				tmp = get_month_serial(date_name)
						- get_month_serial(old_date_name);

				if (date_name[2] - old_date_name[2] === 1)
					tmp = tmp !== 0
							&& !continued_month(date_name[1], old_date_name[1])
							&& '隔日(日期名接續)，但月 serial 差距 !== 0';
				else if (date_name[2] !== 1)
					tmp = '日期名未接續: 隔月/隔年，但日期非以 1 起始';
				else if (!(old_date_name[2] in month_days))
					tmp = '日期名未接續: 前一月末日數 ' + old_date_name[2]
							+ '未設定於 month_days 中';
				else if (tmp !== 1 && (tmp !== 0
				// 這邊不再檢查年份是否差一，因為可能是閏月。
				// || date_name[0] - old_date_name[0] !== 1
				) && !continued_month(date_name[1], old_date_name[1]))
					tmp = '月名未接續 (' + old_date_name[1] + '→' + date_name[1]
							+ ': 相差' + tmp + ')';
				else if (date_name[2] === old_date_name[2])
					tmp = '前後日期名相同';
				else if (date_name[0] !== old_date_name[0]
						&& date_name[0] - old_date_name[0] !== 1
						// Skip last day of -1 → first day of 1
						&& date_name[0] !== 1 && old_date_name[0] !== -1)
					tmp = '前後年份不同: ' + old_date_name[0] + '→' + date_name[0];
				else
					// 若 OK，必得設定 tmp!
					tmp = false;

				if (tmp) {
					error.push(tmp + ': 前一天 ' + old_date_name.join('/')
							+ ' ⇨ 隔天 ' + date_name.join('/') + ' ('
							+ (new Date(begin_Date)).format(CE_format) + ', '
							+ begin_Date + ')');
				}
			}
			old_date_name = date_name;

			// 反解: calendar date → Date
			tmp = to_Date(date_name[0], date_name[1], date_name[2]);
			if (begin_Date - tmp !== 0) {
				tmp = '正反解到了不同日期: ' + (new Date(begin_Date)).format(CE_format)
						+ ', ' + (begin_Date - epoch) / ONE_DAY_LENGTH_VALUE
						+ ' days → ' + date_name.join(',') + ' → '
						+ (tmp ? tmp.format(CE_format) : tmp);
				error.push(tmp);
				if (error.length < 9)
					console.error(tmp);
			}
		}

		library_namespace.info((new Date - begin) + ' ms, error '
				+ error.length + '/' + error_limit);
		if (true || error.length)
			return error;
	};
}


new_tester.default_options = {
	// length of the months
	month_days : {
		29 : '陰陽曆大月',
		30 : '陰陽曆小月'
	},
	CE_format : {
		parser : 'CE',
		format : '%Y/%m/%d %HH CE'
	},
	// 延續的月序，月序未中斷。continued/non-interrupted month serial.
	continued_month : function(month, old_month) {
		return month === 1 && (old_month === 12 || old_month === 13);
	},
	// get month serial
	// 其他方法: 見 Hindu_Date.test
	month_serial : function(date_name) {
		var month = date_name[1];
		if (isNaN(month)) {
			var matched = month.match(/^\D?(\d{1,2})$/);
			if (!matched)
				throw 'tester: Illegal month name: ' + month;
			month = matched[1] | 0;
		}
		return month;
	},
	// get 數字序號 (numerical serial).
	format : 'serial',
	error_limit : 20
};


function continued_month_中曆(month, old_month) {
	var matched;
	if (typeof old_month === 'string')
		return (matched = old_month.match(/^閏(\d{1,2})$/))
				&& (matched[1] - month === 1 || month === 1 && matched[1] == 12);
	if (typeof month === 'string')
		return (matched = month.match(/^閏(\d{1,2})$/))
				&& (matched[1] - old_month === 0 || matched[1] == 1
						&& old_month === 12);
	return month === 1 && old_month === 12;
}

/**
 * 提供 to calendar date 之 front-end (wrapper)
 * 
 * @param {Function}calendar_Date
 *            to calendar date
 * @param {Function}[new_year_Date]
 *            to calendar new year's day
 * 
 * @returns {Function} parser
 */
function _parser(calendar_Date, new_year_Date) {

	return function(date, minute_offset, options) {
		var period_end = options && options.period_end;

		if (!isNaN(date)) {
			if (new_year_Date)
				// use the new year's day
				return new_year_Date(date);

			// use year/1/1
			// String → Number
			date |= 0;
			return calendar_Date(period_end ? 1 + date : date, 1, 1);
		}

		if (date = date.match(/(-?\d{1,4})[\/\-](\d{1,2})(?:[\/\-](\d{1,2}))?/)) {
			if (period_end)
				date[date[3] ? 3 : 2]++;
			return calendar_Date(date[1] | 0, date[2] | 0, date[3] && (date[3] | 0) || 1);
		}
	};

}

//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// 長曆: 伊斯蘭曆
// گاه‌شماری هجری قمری
// https://fa.wikipedia.org/wiki/%DA%AF%D8%A7%D9%87%E2%80%8C%D8%B4%D9%85%D8%A7%D8%B1%DB%8C_%D9%87%D8%AC%D8%B1%DB%8C_%D9%82%D9%85%D8%B1%DB%8C
// تقويم هجري
// https://ar.wikipedia.org/wiki/%D8%AA%D9%82%D9%88%D9%8A%D9%85_%D9%87%D8%AC%D8%B1%D9%8A

// Tabular Islamic calendar / lunar Hijri calendar (AH, A.H. = anno hegirae), lunar Hejrī calendar / التقويم الهجري المجدول /
// http://en.wikipedia.org/wiki/Tabular_Islamic_calendar
// 伊斯蘭曆(回回曆)
// 陳垣編的《中西回史日曆》(中華書局1962年修訂重印)。
// 陈氏中西回史日历冬至订误，鲁实先


// There are 11 leap years in a 30 year cycle.
var Tabular_cycle_years = 30 | 0, Tabular_half_cycle = 15 | 0,
// 平年日數。6=(12個月 / 2)
// 每年有12個月。奇數個月有30天，偶數個月有29天，除第12/最後一個月在閏年有30天。
Tabular_common_year_days = (30 + 29) * 6 | 0,
// 每一30年周期內設11閏年。
Tabular_leaps_in_cycle = 11 | 0,
//
Tabular_cycle_days = Tabular_common_year_days * Tabular_cycle_years
		+ Tabular_leaps_in_cycle,

// Tabular_leap_count[shift + Tabular_cycle_years]
// = new Array( 30 : [ 各年於30年周期內已累積 intercalary days ] )
Tabular_leap_count = [],
// 各月1日累積日數。
// = [0, 30, 30+29, 30+29+30, ..]
// Tabular_month_days.length = 12
Tabular_month_days = [ 0 ];

(function() {
	for (var month = 0, count = 0; month < 12;)
		Tabular_month_days.push(count += (month++ % 2 === 0 ? 30 : 29));
	// assert: Tabular_common_year_days === Tabular_month_days.pop();
})();

function Tabular_list_leap() {
	for (var s = -Tabular_cycle_years; s <= Tabular_cycle_years; s++) {
		for (var year = 1, shift = s, leap = []; year <= Tabular_cycle_years; year++)
			if ((shift += Tabular_leaps_in_cycle) > Tabular_half_cycle)
				shift -= Tabular_cycle_years, leap.push(year);
		library_namespace.log(s + ': ' + leap);
	}
}

// 0: 2,5,7,10,13,16,18,21,24,26,29
// -3: 2,5,8,10,13,16,19,21,24,27,29
// 1: 2,5,7,10,13,15,18,21,24,26,29
// -5: 2,5,8,11,13,16,19,21,24,27,30

// shift: 小餘, -30–30.
function get_Tabular_leap_count(shift, year_serial) {
	if (0 < (shift |= 0))
		shift %= Tabular_cycle_years;
	else
		shift = 0;
	// + Tabular_cycle_years: 預防有負數。
	if (!((shift + Tabular_cycle_years) in Tabular_leap_count))
		// 計算各年於30年周期內已累積 intercalary days。
		for (var year = 0, count = 0,
		// new Array(Tabular_cycle_years)
		intercalary_days_count = Tabular_leap_count[shift + Tabular_cycle_years] = [ 0 ];
		//
		year < Tabular_cycle_years; year++) {
			if ((shift += Tabular_leaps_in_cycle) > Tabular_half_cycle)
				shift -= Tabular_cycle_years, count++;
			intercalary_days_count.push(count);
		}

	return Tabular_leap_count[shift + Tabular_cycle_years][year_serial];
}

// Tabular date to Date.
function Tabular_Date(year, month, date, shift) {
	return new Date(Tabular_Date.epoch +
	// 計算距離 Tabular_Date.epoch 日數。
	(Math.floor((year = year < 0 ? year | 0 : year > 0 ? year - 1 : 0)
	// ↑ No year 0.
	/ Tabular_cycle_years) * Tabular_cycle_days
	// 添上閏年數。
	+ get_Tabular_leap_count(shift,
	// 確認 year >=0。
	(year %= Tabular_cycle_years) < 0 ? (year += Tabular_cycle_years) : year)
	// 添上整年之日數。
	+ year * Tabular_common_year_days
	// 添上整月之日數。
	+ Tabular_month_days[(month || 1) - 1]
	// 添上月初至 date 日數。
	+ (date || 1) - 1) * ONE_DAY_LENGTH_VALUE);
}

// 622/7/15 18:0 Tabular begin offset
// 伊斯蘭曆每日以日落時分日。例如 AH 1/1/1 可與公元 622/7/16 互換，
// 但 AH 1/1/1 事實上是從 622/7/15 的日落時算起，一直到 622/7/16 的日落前為止。
// '622/7/16'.to_Date('CE').format(): '622/7/19' === new Date(622, 7 - 1, 19)
Tabular_Date.epoch = String_to_Date('622/7/16', {
	parser : 'CE'
}).getTime();

var Tabular_month_name_of_serial = '|محرم|صفر|ربيع الأول|ربيع الثاني|جمادى الأول|جمادى الآخر|رجب |شعبان|رمضان|شوال|ذو القعدة|ذو الحجة'.split('|');
Tabular_Date.month_name = function(month_serial) {
	return Tabular_month_name_of_serial[month_serial];
};

Tabular_Date.is_leap = function(year, shift) {
	// 轉正。保證變數值非負數。
	if ((year %= Tabular_cycle_years) < 1)
		year += Tabular_cycle_years;
	return get_Tabular_leap_count(shift, year)
			- get_Tabular_leap_count(shift, year - 1);
};

// 有更快的方法。
function Date_to_Tabular(date, options) {
	var month,
	// 距離 Tabular_Date.epoch 的日數。
	tmp = (date - Tabular_Date.epoch) / ONE_DAY_LENGTH_VALUE,
	//
	delta = tmp - (date = Math.floor(tmp)),
	// 距離 Tabular_Date.epoch 的30年周期之年數。
	year = Math.floor(date / Tabular_cycle_days) * Tabular_cycle_years;

	// 本30年周期內之日數。
	date %= Tabular_cycle_days;
	// 保證 date >=0。
	if (date < 0)
		date += Tabular_cycle_days;

	// month: 本30年周期內之積年數: 0–30。
	// 30: 第29年年底。
	month = (date / Tabular_common_year_days) | 0;
	year += month;
	date %= Tabular_common_year_days;

	// 不動到原 options。
	options = Object.assign({
		postfix:' هـ'
	},options);

	// 求出為本年第幾天之序數。
	// 減去累積到第 month 年首日，應該有幾個閏日。
	tmp = get_Tabular_leap_count(options.shift, month);
	if (date < tmp)
		// 退位。
		year--, date += Tabular_common_year_days
		//
		- get_Tabular_leap_count(options.shift, month - 1);
	else
		date -= tmp;


	// 至此確定年序數與求出本年第幾天之序數。

	// 這邊的計算法為 Tabular Islamic calendar 特殊設計過，並不普適。
	// 理據: 每月日數 >=29 && 末月累積日數 - 29*月數 < 29 (不會 overflow)

	// tmp 可能是本月，或是下月累積日數。
	tmp = Tabular_month_days[month = (date / 29) | 0];
	if (date < tmp
	// assert: month === 12: 年內最後一天。
	|| month === 12)
		// tmp 是下月累積日數。
		tmp = Tabular_month_days[--month];
	// 本月日數。
	date -= tmp;

	// 日期序數→日期名。year/month/date index to serial.
	// There is no year 0.
	if (year >= 0)
		year++;

	// [ year, month, date, 餘下時間值(單位:日) ]
	return _format([ year, month + 1, date + 1, delta ], options,
			Tabular_Date.month_name);
}

/*

CeL.run('data.date.calendar');


CeL.Tabular_Date.test(-2e4, 4e6, 4).join('\n') || 'OK';
// "OK"

'624/6/23'.to_Date('CE').to_Tabular({format : 'serial'})
// [2, 12, 30, 0]

CeL.Tabular_Date(3, 7, 1).format('CE')

*/
Tabular_Date.test = new_tester(Date_to_Tabular, Tabular_Date);


_.Tabular_Date = Tabular_Date;


//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// 長曆: הַלּוּחַ הָעִבְרִי / Hebrew calendar / Jewish Calendar / 希伯來曆 / 猶太曆計算
// https://en.wikipedia.org/wiki/Hebrew_calendar
// http://www.stevemorse.org/jcal/rules.htm
// http://www.jewishgen.org/infofiles/m_calint.htm


// Hebrew_month_serial[month_name] = month serial (1–12 or 13)
var Hebrew_month_serial = Object.create(null),
// Hour is divided into 1080 parts called haliq (singular of halaqim)
Hebrew_1_HOUR = 1080 | 0,
// hour length in halaqim
Hebrew_1_DAY = 24 * Hebrew_1_HOUR | 0,
// month length in halaqim
// The Jewish month is defined to be 29 days, 12 hours, 793 halaqim.
Hebrew_1_MONTH = 29 * Hebrew_1_DAY + 12 * Hebrew_1_HOUR + 793 | 0,
// Metonic cycle length in halaqim
// Metonic cycle = 235 months (about 19 years): Hebrew calendar 採十九年七閏法
//Hebrew_1_cycle = (19 * 12 + 7) * Hebrew_1_MONTH | 0,

ONE_HOUR_LENGTH_VALUE = Date.parse('1/1/1 2:0') - Date.parse('1/1/1 1:0'),
// 1 hour of Date / 1 hour of halaqim (Hebrew calendar).
// (length of halaqim) * halaqim_to_Date_ratio = length value of Date
halaqim_to_Date_ratio = ONE_HOUR_LENGTH_VALUE / Hebrew_1_HOUR,

// http://www.stevemorse.org/jcal/rules.htm
// Molad of Tishri in year 1 occurred on Monday at 5hr, 204hq (5hr, 11mn, 20 sc)
// i.e., evening before Monday daytime at 11 min and 20 sec after 11 PM
Hebrew_epoch_halaqim = 5 * Hebrew_1_HOUR + 204 | 0,
// https://en.wikipedia.org/wiki/Molad
// The traditional epoch of the cycle was 5 hours 11 minutes and 20 seconds
// after the mean sunset (considered to be 6 hours before midnight) at the epoch
// of the Hebrew calendar (first eve of Tishrei of Hebrew year 1).
Hebrew_epoch_shift_halaqim = -6 * Hebrew_1_HOUR | 0,
// for reduce error.
Hebrew_epoch_shift = Math.round(Hebrew_epoch_shift_halaqim
		* halaqim_to_Date_ratio),
// 1/Tishri/1: Julian -3761/10/7
//
// https://en.wikipedia.org/wiki/Hebrew_calendar
// The Jewish calendar's epoch (reference date), 1 Tishrei AM 1, is equivalent
// to Monday, 7 October 3761 BC/BCE in the proleptic Julian calendar, the
// equivalent tabular date (same daylight period) and is about one year before
// the traditional Jewish date of Creation on 25 Elul AM 1, based upon the Seder
// Olam Rabbah.
//
// http://www.stevemorse.org/jcal/jcal.html
// http://www.fourmilab.ch/documents/calendar/
Hebrew_epoch = String_to_Date('-3761/10/7', {
	parser : 'Julian'
}).getTime();

// ---------------------------------------------------------------------------//
// Hebrew to Date

// Hebrew year, month, date
// get_days: get days of year
function Hebrew_Date(year, month, date, get_days) {
	// no year 0. year: -1 → 0
	if (year < 0 && !Hebrew_Date.year_0)
		year++;

	var is_leap = Hebrew_Date.is_leap(year),
	//
	days = isNaN(date) ? 0 : date - 1 | 0,
	// days diff (year type)
	// add_days = -1 (defective) / 0 (normal) / 1 (complete)
	add_days = Hebrew_Date.days_of_year(year) - 354 | 0;

	if (add_days > 1)
		add_days -= 30;

	if (!month)
		// month index 0
		month = 0;
	else if (isNaN(month = Hebrew_Date.month_index(month, is_leap)))
		return;

	// month: month index (0–11 or 12)

	if (month > 2 || month === 2 && add_days > 0) {
		// 所有後面的月份皆須加上此 add_days。
		days += add_days;
		if (is_leap && month > 5)
			// subtract the 30 days of leap month Adar I.
			month--, days += 30;
	}

	days += (month >> 1) * (30 + 29);
	if (month % 2 === 1)
		days += 30;

	// days: days from new year day

	return get_days ? days : Hebrew_Date.new_year_days(year, days, true);
}

// Are there year 0?
// 警告：除了 Hebrew_Date(), Date_to_Hebrew() 之外，其他函數皆假定有 year 0！
Hebrew_Date.year_0 = false;

//---------------------------------------------------------------------------//
// tools for month name

// https://en.wikipedia.org/wiki/Hebrew_Academy
// Academy name of specified month serial.
// common year: Nisan: 1, Iyyar: 2, .. Adar: 12
// leap year: Nisan: 1, Iyyar: 2, .. (Adar I): 12, (Adar II/Adar/Ve'Adar): 13
// Tishri: 下半年的開始。 http://en.wikipedia.org/wiki/Babylonian_calendar
(Hebrew_Date.month_name_of_serial = "|Nisan|Iyyar|Sivan|Tammuz|Av|Elul|Tishri|Marẖeshvan|Kislev|Tevet|Shvat|Adar"
		.split('|'))
//
.forEach(function(month_name, month_serial) {
	if (month_serial > 0)
		Hebrew_month_serial[month_name.toLowerCase()] = month_serial;
});
// other common names.
// all should be in lower case!
Object.assign(Hebrew_month_serial, {
	nissan : 1,
	iyar : 2,
	siwan : 3,
	tamuz : 4,
	ab : 5,
	tishrei : 7,
	heshvan : 8,
	marcheshvan : 8,
	cheshvan : 8,
	'marẖeshwan' : 8,
	chisleu : 9,
	chislev : 9,
	tebeth : 10,
	shevat : 11,
	shebat : 11,
	sebat : 11,
	// 'adar 1':12,
	// 'adar 2':12,

	// Occasionally instead of Adar I and Adar II, "Adar" and "Ve'Adar" are used
	// (Ve means 'and' thus: And Adar).
	veadar : 13,
	"ve'adar" : 13
});

// return Academy name of specified month serial.
// common year: 1: Nisan, 2: Iyyar, .. 12: Adar
// leap year: 1: Nisan, 2: Iyyar, .. 12: Adar, 13: Adar II
Hebrew_Date.month_name = function(month_serial, is_leap_year) {
	if (month_serial >= 12 && (month_serial === 13 || is_leap_year))
		return month_serial === 12 ? 'Adar I' : 'Adar II';
	return Hebrew_Date.month_name_of_serial[month_serial];
};

// return month serial.
// common year: Nisan: 1, Iyyar: 2, .. Adar: 12
// leap year: Nisan: 1, Iyyar: 2, .. (Adar I): 12, (Adar II/Adar/Ve'Adar): 13
Hebrew_Date.month_serial = function(month_name, is_leap_year) {
	if (typeof month_name === 'string') {
		// normalize month name.
		month_name = month_name.trim().toLowerCase();
		if (/^adar\s*[1i]$/i.test(month_name))
			// Only in Leap years.
			return 12;
		if (/^adar\s*(2|ii)$/i.test(month_name))
			// Only in Leap years.
			return 13;
		if (month_name === 'adar')
			if (is_leap_year)
				return 13;
			else if (is_leap_year === undefined) {
				if (library_namespace.is_debug(2))
					library_namespace
							.warn('May be 12, but will return 13 for Adar.');
				return 13;
			}
		if (month_name in Hebrew_month_serial)
			return Hebrew_month_serial[month_name];
	}

	library_namespace.error('Hebrew_Date.month_serial: Unknown month name: '
			+ month_name);
	return month_name;
};

// month: month name or serial
//
// return 0: Tishri, 1: Heshvan, ..
//
// common year: 0–11
// leap year: 0–12
//
// for numeral month name (i.e. month serial):
// Hebrew year begins on 7/1, then month 8, 9, .. 12, 1, 2, .. 6.
//
// common year: 7→0 (Tishri), 8→1, .. 12→5 (Adar),
// 1→6 (Nisan), 2→7, .. 6→11 (Elul)
//
// leap year: 7→0 (Tishri), 8→1, .. 12→5 (Adar I), 13→6 (Adar II),
// 1→7 (Nisan), 2→8, .. 6→12 (Elul)
Hebrew_Date.month_index = function(month, is_leap_year) {
	if (isNaN(month))
		// month name to serial
		month = Hebrew_Date.month_serial(month, is_leap_year);

	if (month === (month | 0))
		if (month === 13)
			// Adar II
			return 6;
		else if (1 <= month && month <= 12 && (month -= 7) < 0)
			// leap 1→-6→7, ..
			// common: 1→-6→6, ..
			month += is_leap_year ? 13 : 12;

	if (Number.isNaN(month))
		library_namespace.error('Hebrew_Date.month_index: Unknown month: '
				+ month);
	return month;
};

//---------------------------------------------------------------------------//


/*

for (y = 0; y < 19; y++)
	if (Hebrew_Date.is_leap(y))
		console.log(y);

*/

// the years 3, 6, 8, 11, 14, 17, and 19
// are the long (13-month) years of the Metonic cycle
Hebrew_Date.is_leap = function(year) {
	year = (7 * (year | 0) + 1) % 19;
	// 轉正。保證變數值非負數。
	if (year < 0)
		year += 19;
	return year < 7;
};


/*
累積 leap:
(7 * year - 6) / 19 | 0

Simplify[12*(year - 1) + (7*year - 6)/19]
1/19 (-234 + 235 year)
*/
// 累積 months of new year begins (7/1)
Hebrew_Date.month_count = function(year, month_index) {
	return Math.floor((235 * year - 234 | 0) / 19) + (month_index | 0);
};

// halaqim of molad from Hebrew_epoch
// month_index 0: Tishri
// CeL.Hebrew_Date.molad(1,0,true).format('CE')==="-3761/10/6 23:11:20.000"
Hebrew_Date.molad = function(year, month_index, get_Date) {
	year = Hebrew_Date.month_count(year, month_index) * Hebrew_1_MONTH
			+ Hebrew_epoch_halaqim;
	return get_Date ? new Date(Hebrew_epoch + Hebrew_epoch_shift + year
			* halaqim_to_Date_ratio) : year;
};

// return [ week_day (0:Sunday, 1:Monday, .. 6),
// hour (0–23 from sunset 18:0 of previous day), halaqim (0–) ]
// @see
// http://www.stevemorse.org/jcal/molad.htm?year=1
Hebrew_Date.molad_date = function(year, month_index) {
	var halaqim = Hebrew_Date.molad(year, month_index),
	// the first day of 1/1/1 is Monday, index 1.
	week_day = (Math.floor(halaqim / Hebrew_1_DAY) + 1) % 7 | 0;
	// 轉正。保證變數值非負數。
	if (week_day < 0)
		week_day += 7;
	halaqim %= Hebrew_1_DAY;
	if (halaqim < 0)
		halaqim += Hebrew_1_DAY;
	return [ week_day, halaqim / Hebrew_1_HOUR | 0, halaqim % Hebrew_1_HOUR | 0 ];
};

// cache
var Hebrew_delay_days = [], Hebrew_new_year_days = [];

/*
test:

for (year = 0; year < 1e4; year++)
	if (CeL.Hebrew_Date.delay_days(year) === 2
			&& (!CeL.Hebrew_Date.delay_days(year - 1) || !CeL.Hebrew_Date
					.delay_days(year + 1)))
		throw year;

*/

// return 0, 1, 2
Hebrew_Date.delay_days = function(year) {
	if ((year |= 0) in Hebrew_delay_days)
		return Hebrew_delay_days[year];

	var delay_days = Hebrew_Date.molad_date(year),
	//
	week_day = delay_days[0] | 0, hour = delay_days[1] | 0, halaqim = delay_days[2] | 0;

	// phase 1
	// http://www.stevemorse.org/jcal/rules.htm
	// Computing the beginning of year (Rosh Hashanah):
	if (delay_days =
	// (2) If molad Tishri occurs at 18 hr (i.e., noon) or later, Tishri 1 must
	// be delayed by one day.
	hour >= 18
	// (3) If molad Tishri in a common year falls on Tuesday at 9 hr 204 hq
	// (i.e., 3:11:20 AM) or later, then Tishri 1 is delayed by one day
	|| week_day === 2 && (hour > 9 || hour === 9 && halaqim >= 204)
			&& !Hebrew_Date.is_leap(year)
			// (4) If molad Tishri following a leap year falls on Monday at 15
			// hr 589 hq (9:32:43 1/3 AM) or later, Tishri 1 is delayed by one
			// day
			|| week_day === 1 && (hour > 15 || hour === 15 && halaqim >= 589)
			&& Hebrew_Date.is_leap(year - 1)
	// default: no delayed
	? 1 : 0)
		week_day++;

	// phase 2
	// (1) If molad Tishri occurs on Sunday, Wednesday, or Friday, Tishri 1 must
	// be delayed by one day
	//
	// since the molad Tishri of year 2 falls on a Friday, Tishri 1 of that year
	// should have been delayed by rule 1 so that Yom Kippor wouldn't be on the
	// day after the Sabbath. However Adam and Eve would not yet have sinned as
	// of the start of that year, so there was no predetermined need for them to
	// fast on that first Yom Kippor, and the delay rule would not have been
	// needed. And if year 2 was not delayed, the Sunday to Friday of creation
	// would not have been from 24-29 Elul but rather from 25 Elul to 1 Tishri.
	// In other words, Tishri 1 in the year 2 is not the first Sabbath, but
	// rather it is the day that Adam and Eve were created.
	//
	// http://www.stevemorse.org/jcal/jcal.js
	// year 3 wants to start on Wed according to its molad, so delaying year
	// 3 by the WFS rule would require too many days in year 2, therefore
	// WFS must be suspended for year 3 as well
	if (3 * week_day % 7 < 3 && 3 < year)
		delay_days++;

	return Hebrew_delay_days[year] = delay_days | 0;
};

// return days of year's first day.
Hebrew_Date.new_year_Date_original = function(year, days) {
	days = new Date(Hebrew_epoch + Hebrew_Date.molad(year)
			* halaqim_to_Date_ratio
			+ (Hebrew_Date.delay_days(year) + (days | 0))
			* ONE_DAY_LENGTH_VALUE);
	// set to 0:0 of the day
	days.setHours(0, 0, 0, 0);
	return days;
};

// calculate days from 1/1/1.
// simplify from Hebrew_Date.new_year_Date_original()
// new_year_days(1) = 0
// new_year_days(2) = 354
// new_year_days(3) = 709
// CeL.Hebrew_Date.new_year_days(1,0,true).format('CE')
Hebrew_Date.new_year_days = function(year, days, get_Date) {
	if (!(year in Hebrew_new_year_days))
		Hebrew_new_year_days[year] = Math.floor(Hebrew_Date.molad(year)
				/ Hebrew_1_DAY)
				//
				+ Hebrew_Date.delay_days(year) | 0;
	year = Hebrew_new_year_days[year] + (days | 0);
	return get_Date ? new Date(Hebrew_epoch + year * ONE_DAY_LENGTH_VALUE)
			: year;
};

// return days of year's first day.
// Please use Hebrew_Date.new_year_days(year, days, true) instead.
if (false)
	Hebrew_Date.new_year_Date = function(year, days) {
		return Hebrew_Date.new_year_days(year, days, true);
	};



/*

test:

for (var year = 0, d, d2; year <= 1e5; year++) {
	d = CeL.Hebrew_Date.days_of_year_original(year);
	d2 = CeL.Hebrew_Date.days_of_year(year);
	if (d !== d2)
		throw year + ': ' + d + '!==' + d2;
	// common year has 353 (defective), 354 (normal), or 355 (complete) days
	d -= 354;
	if (d > 1)
		d -= 30;
	if (d !== Math.sign(d))
		throw year + ': ' + d2 + ' days';
}
console.log('OK');

*/

// day count of year.
Hebrew_Date.days_of_year_original = function(year) {
	// common year has 353 (defective), 354 (normal), or 355 (complete) days
	// leap year has 383 (defective), 384 (normal), or 385 (complete) days
	return (Hebrew_Date.new_year_Date_original(year + 1) - Hebrew_Date
			.new_year_Date_original(year))
			/ ONE_DAY_LENGTH_VALUE | 0;
};

// day count of year.
// days_of_year(1) = 354
// days_of_year(2) = 354
// days_of_year(3) = 384
// common year has 353 (defective), 354 (normal), or 355 (complete) days
// leap year has 383 (defective), 384 (normal), or 385 (complete) days
Hebrew_Date.days_of_year = function(year) {
	return Hebrew_Date.new_year_days(year + 1)
			- Hebrew_Date.new_year_days(year);
};

// month days of normal common year
var Hebrew_normal_month_days = [];
(function() {
	for (var m = 0; m < 12; m++)
		Hebrew_normal_month_days.push(m % 2 === 0 ? 30 : 29);
})();

Hebrew_Date.year_data = function(year) {
	var days = Hebrew_Date.days_of_year(year) | 0,
	// copy from normal
	data = Hebrew_normal_month_days.slice();
	data.days = days;

	days -= 354;
	if (days > 1)
		days -= 30, data.leap = true, data.splice(5, 0, 30);
	// assert: days = -1 (defective) / 0 (normal) / 1 (complete)
	data.add_days = days;

	if (days > 0)
		data[1]++;
	else if (days < 0)
		data[2]--;

	return Object.assign(data, {
		delay_days : Hebrew_Date.delay_days(year),
		new_year_days : Hebrew_Date.new_year_days(year)
	});
};

//---------------------------------------------------------------------------//
// Date to Hebrew

/*

days = new_year_days + Δ
# 0 <= Δ < 385
new_year_days = days - Δ

Math.floor(Hebrew_Date.molad(year) / Hebrew_1_DAY) + Hebrew_Date.delay_days(year)
= new_year_days

→

Math.floor((Hebrew_Date.month_count(year, month_index) * Hebrew_1_MONTH + Hebrew_epoch_halaqim) / Hebrew_1_DAY) + Hebrew_Date.delay_days(year)
= new_year_days

→

Math.floor((Math.floor((235 * year - 234 | 0) / 19) * Hebrew_1_MONTH + Hebrew_epoch_halaqim) / Hebrew_1_DAY) + Hebrew_Date.delay_days(year)
= new_year_days

→

(((235 * year - 234) / 19 + Δ2) * Hebrew_1_MONTH + Hebrew_epoch_halaqim) / Hebrew_1_DAY + Δ1 + delay_days
= new_year_days

# 0 <= (Δ1, Δ2) <1
# delay_days = 0, 1, 2

→

year
= ((((days - Δ - Δ1 - delay_days) * Hebrew_1_DAY - Hebrew_epoch_halaqim) / Hebrew_1_MONTH - Δ2) * 19 + 234) / 235
<= ((days * Hebrew_1_DAY - Hebrew_epoch_halaqim) / Hebrew_1_MONTH * 19 + 234) / 235
< (days * Hebrew_1_DAY - Hebrew_epoch_halaqim) / Hebrew_1_MONTH * 19 / 235 + 1


test:

var begin = new Date;
for (var year = 0, new_year_days, days = 0; year <= 1e5; year++)
	for (new_year_days = CeL.Hebrew_Date.new_year_days(year + 1); days < new_year_days; days++)
		if (CeL.Hebrew_Date.year_of_days(days) !== year)
			throw 'CeL.Hebrew_Date.year_of_days(' + days + ') = '
					+ CeL.Hebrew_Date.year_of_days(days) + ' != ' + year;
console.log('CeL.Hebrew_Date.year_of_days() 使用時間: ' + (new Date - begin) / 1000);
//CeL.Hebrew_Date.year_of_days() 使用時間: 154.131

*/

// return year of the day;
Hebrew_Date.year_of_days = function(days) {
	// 即使預先計算參數(coefficient)，以加快速度，也不會顯著加快。@ Chrome/36
	var year = Math.ceil((days * Hebrew_1_DAY - Hebrew_epoch_halaqim)
			/ Hebrew_1_MONTH * 19 / 235) + 1 | 0;

	// assert: 最多減兩次。
	// 經測試 0–4e6，96% 皆為減一次。
	// [ 139779, 3859350, 871 ]
	while (days < Hebrew_Date.new_year_days(year))
		year--;

	return year;
};


/*
d = '-3761/10/7'.to_Date('CE').to_Hebrew();
*/
function Date_to_Hebrew(date, options) {
	var tmp, month, days = date - Hebrew_epoch - Hebrew_epoch_shift,
	//
	hour = days % ONE_DAY_LENGTH_VALUE,
	//
	year = Hebrew_Date.year_of_days(days = Math.floor(days
			/ ONE_DAY_LENGTH_VALUE) | 0),
	//
	is_leap = Hebrew_Date.is_leap(year),
	//
	add_days = Hebrew_Date.days_of_year(year) - 354 | 0;

	// 轉正。保證變數值非負數。
	if (hour < 0)
		hour += ONE_DAY_LENGTH_VALUE;

	days -= Hebrew_Date.new_year_days(year);
	// assert: days: days from new year day

	if (add_days > 1)
		// assert: is_leap === true
		add_days -= 30;
	// assert: add_days = -1 (defective) / 0 (normal) / 1 (complete)

	// 將 days 模擬成 normal common year.
	// 因此需要作相應的處理:
	// 從前面的日期處理到後面的，
	// 自開始被影響，與 normal common year 不同的那天起將之改成與 normal common year 相同。
	// days → month index / days index of month
	if (add_days !== 0)
		if (add_days === 1) {
			// 30 + 29: complete year 開始被影響的一日。
			if (days === 30 + 29)
				// 因為 normal common year 沒有辦法表現 8/30，須特別處理 8/30。
				month = 1, days = 29, tmp = true;
			else if (days > 30 + 29)
				days--;
		} else if (days >= 30 + 29 + 29)
			// 30 + 29 + 29: defective year 開始被影響的一日。
			// assert: add_days === -1
			days++;

	if (!tmp) {
		// is_leap 還會用到，因此將 tmp 當作暫用值。
		// 3 * (30 + 29): leap year 開始被影響的一日。
		if (tmp = is_leap && days >= 3 * (30 + 29))
			days -= 30;

		// 計算有幾組 (30 + 29) 月份。
		month = days / (30 + 29) | 0;
		// 計算 date in month。
		days -= month * (30 + 29);
		// 每組 (30 + 29) 月份有 2個月。
		month <<= 1;
		// normal common year 每組 (30 + 29) 月份，首月 30日。
		if (days >= 30)
			month++, days -= 30;
		if (tmp)
			// 加上 leap month.
			month++;
	}

	// 日期序數→日期名。year/month/date index to serial.
	// index 0 → serial 7
	month += 7;
	// add_days: months of the year.
	tmp = is_leap ? 13 : 12;
	if (month > tmp)
		month -= tmp;
	if (year <= 0 && !Hebrew_Date.year_0)
		// year: 0 → -1
		--year;

	// 前置處理。
	if (!library_namespace.is_Object(options))
		if (options === true)
			options = {
				// month serial to name
				month_name : true
			};
		else
			options = Object.create(null);

	return _format([ year, month, days + 1,
	// hour
	Math.floor(hour / ONE_HOUR_LENGTH_VALUE) | 0,
	// halaqim
	(hour % ONE_HOUR_LENGTH_VALUE) / halaqim_to_Date_ratio ], options,
			Hebrew_Date.month_name, is_leap);
}


/*

CeL.Hebrew_Date.test(-2e4, 4e6, 4).join('\n') || 'OK';
// "OK"

'-3762/9/18'.to_Date('CE').to_Hebrew({format : 'serial'})
// -1/6/29

CeL.Hebrew_Date(3, 7, 1).format('CE')

*/
Hebrew_Date.test = new_tester(Date_to_Hebrew, Hebrew_Date, {
	epoch : Hebrew_epoch
});


_.Hebrew_Date = Hebrew_Date;

//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// 長曆: Mesoamerican Long Count calendar / 馬雅長紀曆
// <a href="https://en.wikipedia.org/wiki/Mesoamerican_Long_Count_calendar" accessdate="2014/4/28 22:15" title="Mesoamerican Long Count calendar">中美洲長紀曆</a>

// GMT correlation: starting-point is equivalent to August 11, 3114 BCE in the proleptic Gregorian calendar
// https://en.wikipedia.org/wiki/Template:Maya_Calendar
// GMT 584283
// GMT+2 584285
// Thompson (Lounsbury) 584,285
// 注意：據 mayaman@ptt 言，<q>目前比較流行的是GMT+2  如果你要統治者紀年的話</q>。
Maya_Date.epoch = (new Date(-3114 + 1, 8 - 1, 11/* + 2*/)).getTime();

// Era Base date, the date of creation is expressed as 13.13.13.13.13.13.13.13.13.13.13.13.13.13.13.13.13.13.13.13.0.0.0.0 4 Ajaw 8 Kumk'u
/*
// get offset:
// 4 Ajaw → 3/13, 19/20
for (i = 0, d = 3, l = 20; i < l; i++, d += 13)
	if (d % l === 19)
		throw d;
// 159
*/
var
Tzolkin_day_offset = 159,
Tzolkin_day_period = 13 * 20,
/*
// get offset:
// 8 Kumk'u → 348/(20 * 18 + 5)
365 - 17 = 348
*/
Haab_day_offset = 348, Haab_day_period = 20 * 18 + 5;

function Maya_Date(date, minute_offset, options) {
	if (typeof date === 'string')
		date = date.split(/[,.]/);
	else if (!Array.isArray(date))
		return new Date(NaN);

	var days = 0, length = date.length - 1, i = 0,
	// e.g., 8.19.15.3.4 1 K'an 2 K'ayab'
	matched = date[length].match(/^(\d{1,2})\s/);
	if (matched)
		date[length] = matched[1] | 0;
	if (matched = date[0].match(/\s(\d{1,2})$/))
		date[0] = matched[1] | 0;
	length--;

	while (i < length)
		days = days * 20 + (date[i++] | 0);
	days = (days * 18 + (date[i] | 0)) * 20 + (date[++i] | 0);

	if (options && options.period_end)
		days++;

	return new Date(days * ONE_DAY_LENGTH_VALUE + Maya_Date.epoch);
}

Maya_Date.days = function(date) {
	return Math.floor((date - Maya_Date.epoch) / ONE_DAY_LENGTH_VALUE);
};

Maya_Date.to_Long_Count = function(date, get_Array) {
	var days = Maya_Date.days(date),
	// Mesoamerican Long Count calendar.
	Long_Count;
	if (!Number.isFinite(days))
		// NaN
		return;
	if (days <= 0)
		// give a 13.0.0.0.0
		// but it should be:
		// 13.13.13.13.13.13.13.13.13.13.13.13.13.13.13.13.13.13.13.13.0.0.0.0
		days += 13 * 20 * 20 * 18 * 20;
	Long_Count = [ days % 20 ];
	days = Math.floor(days / 20);
	Long_Count.unshift(days % 18);
	days = Math.floor(days / 18) | 0;
	while (days > 0 || Long_Count.length < 5) {
		Long_Count.unshift(days % 20);
		days = days / 20 | 0;
	}
	return get_Array ? Long_Count : Long_Count.join('.');
};

Maya_Date.Tzolkin_day_name = "Imix'|Ik'|Ak'b'al|K'an|Chikchan|Kimi|Manik'|Lamat|Muluk|Ok|Chuwen|Eb'|B'en|Ix|Men|Kib'|Kab'an|Etz'nab'|Kawak|Ajaw"
		.split('|');
// <a href="https://en.wikipedia.org/wiki/Tzolk%27in" accessdate="2014/4/30
// 18:56">Tzolk'in</a>
// type = 1: {Array} [ 13-day cycle index, 20-day cycle index ] (index: start
// from 0),
//
// 2: {Array} [ 13-day cycle name, 20-day cycle ordinal/serial: start from 1,
// 20-day cycle name ],
//
// 3: {Array} [ 13-day cycle name, 20-day cycle name ],
// others (default): {String} (13-day cycle name) (20-day cycle name)
Maya_Date.to_Tzolkin = function(date, type) {
	var days = Maya_Date.days(date) + Tzolkin_day_offset;
	// 轉正。保證變數值非負數。
	if (days < 0)
		days = days % Tzolkin_day_period + Tzolkin_day_period;

	// 20: Maya_Date.Tzolkin_day_name.length
	days = [ days % 13, days % 20 ];
	if (type === 1)
		return days;

	days[0]++;
	var day_name = Maya_Date.Tzolkin_day_name[days[1]];
	if (type === 2) {
		days[1]++;
		days[2] = day_name;
	} else if (type === 3)
		days[1] = day_name;
	else
		// 先日子，再月份。
		days = days[0] + ' ' + day_name;
	return days;
};

Maya_Date.Haab_month_name = "Pop|Wo'|Sip|Sotz'|Sek|Xul|Yaxk'in'|Mol|Ch'en|Yax|Sak'|Keh|Mak|K'ank'in|Muwan'|Pax|K'ayab|Kumk'u|Wayeb'"
		.split('|');
// <a href="https://en.wikipedia.org/wiki/Haab%27" accessdate="2014/4/30
// 18:56">Haab'</a>
// type = 1: {Array} [ date index, month index ] (index: start from 0),
//
// 2: {Array} [ date ordinal/serial: start from 1, month ordinal/serial: start
// from 1, date name, month name ],
//
// 3: {Array} [ date name, month name ],
// others (default): {String} (date name) (month name)
Maya_Date.to_Haab = function(date, type) {
	var days = (Maya_Date.days(date) + Haab_day_offset) % Haab_day_period;
	// 轉正。保證變數值非負數。
	if (days < 0)
		days += Haab_day_period;

	// 20 days in a month.
	days = [ days % 20, days / 20 | 0 ];
	if (type === 1)
		return days;

	// Day numbers began with a glyph translated as the "seating of" a named
	// month, which is usually regarded as day 0 of that month, although a
	// minority treat it as day 20 of the month preceding the named month. In
	// the latter case, the seating of Pop is day 5 of Wayeb'. For the majority,
	// the first day of the year was Seating Pop. This was followed by 1 Pop, 2
	// Pop ... 19 Pop, Seating Wo, 1 Wo and so on.
	days[2] = days[0] === 0 ? 'Seating' : days[0];
	days[3] = Maya_Date.Haab_month_name[days[1]];
	if (type === 2)
		days[1]++;
	else {
		days.splice(0, 2);
		if (type !== 3)
			// 先日子，再月份。
			days = days.join(' ');
	}
	return days;
};


_.Maya_Date = Maya_Date;


//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// 長曆: 西雙版納傣曆計算。傣历 / Dai Calendar
// 適用範圍: 傣曆 714年（1352/3/28–）至 3190年期間內。

/*

基本上按张公瑾:《西双版纳傣文〈历法星卜要略〉历法部分译注》、《傣历中的纪元纪时法》計算公式推算，加上過去暦書多有出入，因此與實暦恐有一兩天差距。
《中国天文学史文集 第三集》


http://blog.sina.com.cn/s/blog_4131e58f0101fikx.html
傣曆和農曆一樣，用干支紀年和紀日。傣曆干支約於東漢時由漢地傳入，使用年代早於紀元紀時的方法。不過傣族十二地支所代表的對象和漢族不完全相同，如「子」不以表鼠而代表大象，「辰」不代表龍，而代表蛟或大蛇。


[张公瑾,陈久金] 傣历中的干支及其与汉历的关系 (傣曆中的干支及其與漢曆的關係, 《中央民族学院学报》1977年第04期)
值得注意的是, 傣历中称干支日为“腕乃” 或‘婉傣” , 意思是“ 里面的日子” 或“傣族的日子” , 而一周一匕日的周日, 明显地是从外面传进来的, 则称为“腕诺” 或,’m 命” , 即“外面的日子· 或“ 你的日子’, , 两者你我相对, 内外有8lJ, 是很清楚的。很明显, 傣历甲的干支纪年与纪日是从汉历中吸收过来的, 而且已经成了傣历中不可分害少的组成部分。在傣文的两本最基本的推算历法书‘苏定》和《苏力牙》中, 干支纪年与纪日的名称冠全书之首, 可见汉历成份在傣历中的重要性。


《中央民族學院學報》 1979年03期
傣曆中的紀元紀時法
張公瑾
傣曆中的紀元紀時法,與公曆的紀時法相近似,即以某一個時間為傣曆紀元開始累計的時間,以後就順此按年月日往下記,至今年(1979年)10月1日(農曆己未年八月十一)為傣曆1341年12月月出11日,這是一種情況。
還有一種情況是:公元1979年10月1日又是傣曆紀元的第1341年、傣曆紀元的第16592月,並是傣曆紀元的第489982日。對這種年月日的累計數,現譯稱為傣曆紀元年數、紀元積月數和紀元積日數。


TODO:
有極少例外，如1190年未閏（八月滿月），而1191年閏。

*/


/*
year:
傣曆紀元年數。

應可處理元旦，空日，除夕，閏月，後六月，後七月等。

Dai_Date(紀元積日數)
Dai_Date(紀元年數, 特殊日期)
	特殊日期: 元旦/除夕/空1/空2
Dai_Date(紀元年數, 0, 當年日序數)
Dai_Date(紀元年數, 月, 日)
	月: 1–12/閏/後6/後7

元旦：
	Dai_Date(year, 0)
	Dai_Date(year, '元旦')
當年日序 n：
	Dai_Date(year, 0, n)
空日（當年元旦之前的）：
	Dai_Date(year, '空1日')
	Dai_Date(year, '空2日')
	Dai_Date(year, 0, -1)
	Dai_Date(year, 0, -2)
除夕（當年元旦之前的）：
	Dai_Date(year, '除夕')
閏月：
	Dai_Date(year, '閏9', date)
	Dai_Date(year, '雙9', date)
	Dai_Date(year, '閏', date)

後六月：
	Dai_Date(year, '後6', date)

後七月：
	Dai_Date(year, '後7', date)


注意：由於傣曆元旦不固定在某月某日，因此同一年可能出現相同月分與日期的日子。例如傣曆1376年（公元2014年）就有兩個六月下五日。

為了維持獨一性，此處以"後六月"稱第二次出現的六月同日。

*/
function Dai_Date(year, month, date, get_days) {
	if (isNaN(year = Dai_Date.to_valid_year(year)))
		return get_days ? NaN : new Date(NaN);

	var days = typeof date === 'string'
			&& (date = date.trim()).match(/^(\D*)(\d+)/), is_leap;
	// 處理如「六月下一日」或「六月月下一日」即傣曆6月16日。
	if (days) {
		date = days[2] | 0;
		if (/月?上/.test(days[1]))
			date += 15;
	} else
		date |= 0;

	if (typeof month === 'string')
		if (/^[閏雙後][9九]?月?$/.test(month))
			month = 9, is_leap = true;
		else if (days = month.match(/^後([67])/))
			month = days[1];

	if (isNaN(month) || month < 1 || 12 < month) {
		// 確定元旦之前的空日數目。
		days = Dai_Date.vacant_days(year - 1);
		switch (month) {
		case '空2日':
			// 若有空2日，其必為元旦前一日。
			date--;
		case '空日':
		case '空1日':
			date -= days;
		case '除夕':
			date -= days + 1;
		}

		// 當作當年日序。
		days = Dai_Date.new_year_days(year) + date | 0;

	} else {
		// 將 (month) 轉成月序：
		// 6月 → 0
		// 7月 → 1
		// ...
		// 12月 → 6
		// 1月 → 7
		if ((month -= 6) < 0
		// 後6月, 後7月
		|| days)
			month += 12;

		// 處理應為年末之6月, 7月的情況。
		if (month < 2 && 0 < date
		// 七月: 7/1 → 6/30, 7/2 → 6/31..
		&& (month === 0 ? date : 29 + date) <
		//
		Dai_Date.new_year_date_serial(year))
			month += 12;

		days = Dai_Date.days_6_1(year) + date - 1
		//
		+ (month >> 1) * (29 + 30) | 0;
		if (month % 2 === 1)
			days += 29;

		if ((month > 3 || month === 3 && is_leap)
		// 處理閏月。
		&& Dai_Date.is_leap(year))
			days += 30;
		if (month > 2 && Dai_Date.is_full8(year))
			days++;
	}

	return get_days ? days : new Date(Dai_Date.epoch + days
			* ONE_DAY_LENGTH_VALUE);
}

// 適用範圍: 傣曆 0–103295 年
Dai_Date.to_valid_year = function(year, ignore_range) {
	if (false && year < 0)
		library_namespace.warn('Dai_Date.to_valid_year: 公式不適用於過小之年分：' + year);
	return !isNaN(year) && (ignore_range ||
	// 一般情況
	// -1e2 < year && year < 103296
	// from new_year_date_serial()
	0 <= year && (year < 2 || 714 <= year && year <= 3190)
	//
	) && year == (year | 0) ? year | 0 : NaN;
};

// 傣曆採十九年七閏法，平年有12個月，閏年有13個月。閏月固定在9月，所以閏年又稱為「雙九月」年
// 閏9月, 閏九月。
// 適用範圍: 傣曆 0– 年
Dai_Date.is_leap = function(year) {
	// 傣曆零年當年九月置閏月。
	return year == 0 ||
	// 攝 = (year + 1) % 19;
	(((7 * year | 0) - 6) % 19 + 19) % 19 < 7;
};


// 當年日數。365 or 366.
Dai_Date.year_days = function(year) {
	return Dai_Date.new_year_days(year + 1) - Dai_Date.new_year_days(year);
};

// 當年空日數目。1 or 2.
// 注意：這邊之年分，指的是當年除夕後，即明年（隔年）元旦之前的空日數目。與 Dai_Date() 不同！
// e.g., Dai_Date.vacant_days(100) 指的是傣曆100年除夕後，即傣曆101年元旦之前的空日數目。
// 依 Dai_Date.date_of_days() 的做法，空日本身會被算在前一年內。
Dai_Date.vacant_days = function(year) {
	// 傣曆潑水節末日之元旦（新年的第一天）與隔年元旦間，一般為365日（有「宛腦」一天）或366日（有「宛腦」兩天）。
	return Dai_Date.year_days(year) - 364;
};

/*

傣历算法剖析

原法@曆法星卜要略, 傣曆中的紀元紀時法：
x := year + 1
y := Floor[(year + 4)/9]
z := Floor[(year - y)/3]
r := Floor[(x - z)/2]
R := year - r + 49049
S := Floor[(36525875 year + R)/100000]
d := S + 1
Simplify[d]

1 + Floor[(
  49049 + 36525876 year -
   Floor[1/2 (1 + year - Floor[1/3 (year - Floor[(4 + year)/9])])])/
  100000]


簡化法：
x := year + 1
y := ((year + 4)/9)
z := ((year - y)/3)
r := ((x - z)/2)
R := year - r + 49049
S := ((36525875 year + R)/100000)
d := S + 1
Simplify[d]

(1609723 + 394479457 year)/1080000


// test 簡化法 @ Javascript:
for (var year = -1000000, days; year <= 1000000; year++) {
	if (CeL.Dai_Date.new_year_days(year) !== CeL.Dai_Date
			.new_year_days_original(year))
		console.error('new_year_days: ' + year);
	var days = CeL.Dai_Date.new_year_days(year);
	if (CeL.Dai_Date.year_of_days(days) !== year
			|| CeL.Dai_Date.year_of_days(days - 1) !== year - 1)
		console.error('year_of_days: ' + year);
}


// get:
-976704
-803518
-630332
-523297
-350111
-176925
-69890
103296
276482
449668
556703
729889
903075

*/

// 元旦紀元積日數, accumulated days
// 原法@曆法星卜要略：
Dai_Date.new_year_days_original = function(year) {
	return 1 + Math
			.floor((49049 + 36525876 * year - Math.floor((1 + year - Math
					.floor((year - Math.floor((4 + year) / 9)) / 3)) / 2)) / 100000);
};


// 元旦紀元積日數, accumulated days
// 簡化法：適用於 -69889–103295 年
Dai_Date.new_year_days = function(year, get_remainder) {
	// 防止 overflow。但效果相同。
	// var v = 365 * year + 1 + (279457 * year + 529723) / 1080000,
	var v = (394479457 * year + 1609723) / 1080000 | 0,
	//
	f = Math.floor(v);
	// 餘數
	return get_remainder ? v - f : f;
};

// 簡化法：適用於 -3738–1000000 年
Dai_Date.year_of_days = function(days) {
	return Math.floor((1080000 * (days + 1) - 1609723) / 394479457) | 0;
};


// 紀元積月數, accumulated month


/*

原法@傣曆中的紀元紀時法：
day = 元旦紀元積日數

b := 11 day + 633
c := Floor[(day + 7368)/8878]
d := Floor[(b - c)/692]
dd := day + d
e := Floor[dd/30]
f := Mod[dd, 30]
Simplify[e]
Simplify[f]

e:
Floor[1/30 (day +
    Floor[1/692 (633 + 11 day - Floor[(7368 + day)/8878])])]

f:
Mod[day + Floor[1/692 (633 + 11 day - Floor[(7368 + day)/8878])], 30]

*/


// cache
var new_year_date_serial = [ 30 ];

// 元旦之當月日序基數
// d = 30–35: 7/(d-29)
// others: 6/d
Dai_Date.new_year_date_serial = function(year, days, ignore_year_limit) {
	if (year in new_year_date_serial)
		return new_year_date_serial[year];

	if (isNaN(year = Dai_Date.to_valid_year(year, ignore_year_limit)))
		return NaN;

	// days: 元旦紀元積日數。
	if (isNaN(days))
		days = Dai_Date.new_year_days(year) | 0;
	else if (days < 0)
		library_namespace.warn('Dai_Date.new_year_date_serial: 輸入負數日數 [' + days + ']!');

	// 參考用元旦之當月日序基數：常常須作調整。
	var date = (days +
	// 小月補足日數
	Math.floor((633 + 11 * days - Math.floor((7368 + days) / 8878)) / 692)
	// (date / 30 | 0) 是元旦所在月的紀元積月數
	) % 30 | 0;

	// 年初之6/1累積日數
	var days_diff
	// 平年年初累積日數
	= year * 354
	// 閏月年初累積日數 = 30 * (年初累積閏月數 (7r-6)/19+1=(7r+13)/19)
	+ 30 * (((7 * (year - 1) - 6) / 19) + 2 | 0)
	// 八月滿月年初累積日數。.194: 經手動測試，誤差=0 or 1日@部分0–1400年
	+ (.194 * year | 0)
	// 為傣曆紀元始於 7/1，而非 6/1；以及 date 由 6/1 而非 6/0 起始而調整。
	- 30
	// 至上方為年初之6/1累積日數，因此需要再加上元旦之當月日序基數，才是元旦紀元積日數。
	+ date
	// 計算兩者差距。
	- days | 0;

	// assert: -31 < days_diff < 2
	// for (var i = 0, j, y; i < 1200; i++) if ((j = CeL.Dai_Date.new_year_date_serial(i)) > 1 || j < -31) y = i;
	// 599
	// for (var i = 1200, j, y; i < 103296; i++) if ((j = CeL.Dai_Date.new_year_date_serial(i)) > 1 || j < -31) throw i;
	// 3191
	// return days_diff;
	if (false && library_namespace.is_debug(3)
			&& !(-31 < days_diff && days_diff < 2))
		library_namespace.warn('days_diff of ' + year + ': ' + days_diff);

	// 判斷 date 在 6月 或 7月：選擇與應有日數差距較小的。
	if (Math.abs(days_diff) > Math.abs(days_diff + 30))
		// 七月. 7/date0 → 6/30, 7/date1 → 6/31..
		date += 30;

	// 微調：當前後年 6/1 間不是指定的日數時，應當前後移動一兩日。但據調查發現，除前一年是雙九月暨八月滿月外，毋須微調。
	// 六月出一日與隔年六月出一日間，平年354天（八月小月）或355天（八月滿月），雙九月之年384天。
	if (Dai_Date.is_leap(year - 1)) {
		var last_days = Dai_Date.new_year_days(year - 1);
		if ((days - date) - (
		// 前一年是雙九月暨八月滿月，則將八月滿月推移至本年，元旦之當月日序基數後調一日。
		last_days - Dai_Date.new_year_date_serial(year - 1, last_days, true)) === 354 + 30 + 1)
			date++;
	}

	// cache
	return new_year_date_serial[year] = date | 0;
};


// 6/1 紀元積日數, accumulated days
// 簡化法：適用於 -69889–103295 年
Dai_Date.days_6_1 = function(year, days) {
	// days: 元旦紀元積日數。
	if (isNaN(days))
		days = Dai_Date.new_year_days(year) | 0;

	var date = Dai_Date.new_year_date_serial(year, days) | 0;

	return days - date + 1 | 0;
};


/*



(394479457 * 19) / 1080000
=
7495109683/1080000
=
6939.916373148^_  (period 3)


354*19+30*7
=
6936


19/(7495109683/1080000-6936)
=
20520000/4229683
=
4.851427400114854943030009577549901493799889968113449636769469...

「八月滿月」 4.8514274 年一次?


→
(year+k)/4.85142740011485494303|0 = 累積八月滿月?
0<=k<4.85142740011485494303

八月滿月 years:
1166–:
1167, 1172, 1176,


d := 20520000/4229683
Floor[(1168+k)/d]-Floor[(1167+k)/d]==1





var d = 20520000 / 4229683, year;
function get_diff(k){return ((year+1+k)/d|0)-((year+k)/d|0);}

for(var i=0,last=-1,v,a=[];i<d;i+=.01,last=v)if(last!==(v=get_diff(i)))a.push(String(i).slice(0,7)+': '+v);a.join('\n');

function get_full8_range(full8_years) {
	var range = [ 0, Infinity ];

	// 八月滿月 years
	full8_years.forEach(function(y) {
		year = y;

		var low, high, b = 1;
		if (y > 1200 && y < 1280)
			b = 0;
		if (get_diff(b) == get_diff(b + 1)
				|| get_diff(b + 1) == get_diff(b + 2))
			throw '1==2 or 2==3 on ' + y;

		low = get_boundary(get_diff, 1, b, b + 1);
		y = (low - 1) * 4229683;
		if (Math.abs(y - Math.round(y)) > 1e-5)
			throw 'Error low on ' + year;
		if (range[0] < y)
			range[0] = Math.round(y);

		high = get_boundary(get_diff, 1, b + 1, b + 2);
		if (Math.abs(high - low - 1) > 1e-5)
			throw 'high-low!=1 on ' + year;
		y = (high - 2) * 4229683;
		if (Math.abs(y - Math.round(y)) > 1e-5)
			throw 'Error high on ' + year;
		if (range[1] > y)
			range[1] = Math.round(y);
	});

	range.push('function full8_days(year){return (4229683*year+'
			+ (4229683 + ((range[0] + range[1]) >> 1)) + ')/20520000|0;}');
	return range;
}


get_full8_range([ 1167, 1172, 1176, 1207, 1216, 1221, 1226, 1281, 1295 ])



year = 1167;
get_boundary(get_diff, 1, 1, 2);
// 1.1940034276800588=1+820573/4229683
get_boundary(get_diff, 1, 2, 3);
// 2.194003427680059=2+820573/4229683

.194003427680059≈820573/4229683

1+820573/4229683
<=k<
2+820573/4229683



year = 1172;
get_boundary(get_diff, 1, 1, 2);
// 1.045430827794803=1+192158/4229683
get_boundary(get_diff, 1, 2, 3);
// 2.045430827794803=2+192158/4229683


year = 1176;
get_boundary(get_diff, 1, 1, 2);
// 1.8968582279097745=1+3793426/4229683
get_boundary(get_diff, 1, 2, 3);
// 2.8968582279097745=2+3793426/4229683


1+820573/4229683
<=k<
2+192158/4229683




function _get_diff(k){return ((4229683*(year+1)+k)/20520000|0)-((4229683*(year)+k)/20520000|0);}

八月滿月 year:


year = 1207;
get_diff(1) != get_diff(2) && (get_boundary(get_diff, 1, 1, 2) - 1) * 4229683
// 3793426
get_diff(2) != get_diff(3) && (get_boundary(get_diff, 1, 2, 3) - 2) * 4229683
// 3793426


year = 1216;
(get_boundary(get_diff, 1, 1, 2) - 1) * 4229683
// 2995789
(get_boundary(get_diff, 1, 2, 3) - 2) * 4229683

year = 1221;
(get_boundary(get_diff, 1, 1, 2) - 1) * 4229683
// 2367374

year = 1226;
(get_boundary(get_diff, 1, 1, 2) - 1) * 4229683
// 1738959

year = 1281;
(get_boundary(get_diff, 1, 1, 2) - 1) * 4229683
// 4229683

year = 1295;
(get_boundary(get_diff, 1, 1, 2) - 1) * 4229683
// 4229683



1+820573/4229683
<=k<
2+1738959/4229683

(1+820573/4229683+2+1738959/4229683)/2


Math.floor(year / 19) * (19 * 354 + 7 * 30) + (7 * y / 19)

但由前面幾組即可發現，不存在此k值。

事實上，1398年年初累積八月滿月日數為271。
因此另設
年初累積八月滿月日數為:
Math.floor(a*year+b)

1397年為八月滿月，
1397年年初累積八月滿月日數為270
1398年年初累積八月滿月日數為271
→
(271-2)/1397<a<(271+1)/(1397+1)
-(271+1)/(1397+1)<b<(1397-4*(271-2))/1397


// 八月滿月 full8_years: { full8_year : 隔年年初累積八月滿月日數 }
function get_full8_range(full8_years) {
	var range = [ 0, 1, -1, 1 ], days, boundary;

	for ( var year in full8_years) {
		days = full8_years[year |= 0] | 0;
		// range[0]<a<range[1]
		// range[2]<b<range[3]
		boundary = (days - 2) / year;
		if (range[0] < boundary)
			range[0] = boundary;
		boundary = (days + 1) / (year + 1);
		if (range[1] > boundary)
			range[1] = boundary;
		boundary = -boundary;
		if (range[2] < boundary)
			range[2] = boundary;
		boundary = (year - 4 * (days - 2)) / year;
		if (range[3] > boundary)
			range[3] = boundary;
	}

	return range;
}

get_full8_range({
	1184 : 230,
	1207 : 234,
	1216 : 236,
	1221 : 237,
	1226 : 238,
	1397 : 271
});
[0.19256756756756757, 0.1945364238410596, -0.1945364238410596, 0.22972972972972974]


*/

// 當年是否為八月滿月。
Dai_Date.is_full8 = function(year) {
	if (year == 0)
		// 0年 days_diff = 29，排成無八月滿月較合適。
		return 0;
	var days_diff = Dai_Date.days_6_1(year + 1) - Dai_Date.days_6_1(year) - 354
			| 0;
	// assert: 0: 無閏月, 30: 閏9月.
	// assert: 雙九月與八月滿月不置在同一年。
	if (days_diff >= 30)
		days_diff -= 30;
	// assert: days_diff == 0 || 1
	return days_diff;
};

/*

CeL.Dai_Date(0).format({
	parser : 'CE',
	format : '%Y/%m/%d %年干支年%日干支日',
	locale : 'cmn-Hant-TW'
});

for (var y = 1233, i = 0, m; i < 12; i++) {
	m = i + 6 > 12 ? i - 6 : i + 6;
	console.log(y + '/' + m + '/' + 1 + ': ' + CeL.Dai_Date(y, m, 1).format({
		parser : 'CE',
		format : '%年干支年%日干支日',
		locale : 'cmn-Hant-TW'
	}));
}

*/

Dai_Date.date_name = function(date) {
	return date > 15 ? '下' + (date - 15) : date === 15 ? '望' : '出' + date;
};

// 當年日序 : 節日名
var Dai_festivals = {
	1 : '潑水節 元旦',
	364 : '潑水節 除夕',
	365 : '潑水節 空1日',
	366 : '潑水節 空2日'
};

// return 紀元積日數之 [ year, month, date, festival ];
Dai_Date.date_of_days = function(days, options) {
	// 前置處理。
	if (!library_namespace.is_Object(options))
		options = Object.create(null);

	var date, festival,
	//
	year = Dai_Date.to_valid_year(Dai_Date.year_of_days(days),
			options.ignore_year_limit),
	//
	date_name = options.format === 'serial' ? function(d) {
		return d;
	} : Dai_Date.date_name;
	if (isNaN(year))
		// 超出可轉換之範圍。
		return [];

	date = Dai_Date.new_year_days(year) | 0;
	// 節日
	festival = Dai_festivals[days - date + 1];
	// 取得自 6/1 起之日數(當年日序數)
	date = days - Dai_Date.days_6_1(year, date);
	if (date >= (29 + 30 + 29)) {
		if (Dai_Date.is_full8(year)) {
			if (date === (29 + 30 + 29))
				return [ year, 8, date_name(30), festival ];
			date--;
		}
		if (date >= 2 * (29 + 30) && Dai_Date.is_leap(year)) {
			if (date < 2 * (29 + 30) + 30) {
				if ((date -= 2 * (29 + 30) - 1) === 15)
					festival = '關門節';
				return [ year, '閏9', date_name(date), festival ];
			}
			date -= 30;
		}
	}

	// month starts @ 6.
	var month = 6 + ((date / (29 + 30) | 0) << 1) | 0;
	if ((date %= 29 + 30) >= 29)
		month++, date -= 29;
	date++;
	if (month > 12) {
		month -= 12;
		if (month >= 6 && ((month > 6 ? date + 29 : date)
		// 在 date < 今年元旦日序的情況下，由於仍具有獨一性，因此不加上'後'。
		>= Dai_Date.new_year_date_serial(year)))
			// 會將空日視為前面的一年。
			month = '後' + month;
	}
	if (!festival && date === 15)
		if (month === 12)
			festival = '開門節';
		else if (month === 9 && !Dai_Date.is_leap(year))
			festival = '關門節';

	return [ year, month, date_name(date), festival ];
};


// 傣曆紀元起算日期。
Dai_Date.epoch = String_to_Date('638/3/22', {
	parser : 'Julian'
}).getTime()
// 傣曆紀元積日數 = JDN - 1954166
- Dai_Date.new_year_days(0) * ONE_DAY_LENGTH_VALUE;


/*

console.error(CeL.Dai_Date.test(-20 * 366, 20000 * 366).join('\n'));
console.error(CeL.Dai_Date.test('699/3/21'.to_Date('CE'), 4).join('\n'));

console.error(CeL.Dai_Date.test(1000 * 366, 2000 * 366).join('\n'));
console.error(CeL.Dai_Date.test(new Date('1845/4/11'), 4).join('\n'));

// get:
-42657868800000 (-7304): -20/6/20
-42626332800000 (-6939): -19/6/1
-42594796800000 (-6574): -18/6/12
-42563174400000 (-6208): -17/6/24
-42531638400000 (-5843): -16/6/5
-42500102400000 (-5478): -15/6/15
-42468566400000 (-5113): -14/6/26
-42436944000000 (-4747): -13/6/8
-42405408000000 (-4382): -12/6/19
-42342336000000 (-3652): -10/6/10
-42310713600000 (-3286): -9/6/22
-42279177600000 (-2921): -8/6/3
-42247641600000 (-2556): -7/6/14
-42216105600000 (-2191): -6/6/25
-42184483200000 (-1825): -5/6/6
-42152947200000 (-1460): -4/6/17
-42121411200000 (-1095): -3/6/28
-42089875200000 (-730): -2/6/9
-42058252800000 (-364): -1/6/21


2014/4/27 13:44:6
CeL.Dai_Date.test(CeL.Dai_Date.new_year_days(0,0,1),CeL.Dai_Date.new_year_days(3192,0,1)).join('\n')
日期名未接續: 0/6/9/潑水節 空1日 ⇨ 1/6/12/潑水節 元旦 (639/3/22 CE)
日期名未接續: 1/5/22/潑水節 空2日 ⇨ 2/6/0/潑水節 元旦 (640/3/22 CE)
...

CeL.Dai_Date.test(CeL.Dai_Date.new_year_days(712,0,1),CeL.Dai_Date.new_year_days(3192,0,1)).join('\n')
...
日期名未接續: 712/5/9/潑水節 空1日 ⇨ 713/6/0/潑水節 元旦 (1351/3/28 CE)
...
日期名未接續: 3190/後7/29/潑水節 空2日 ⇨ 3191/6/0/潑水節 元旦 (3829/5/16 CE)
...

CeL.Dai_Date.test(CeL.Dai_Date.new_year_days(714, 0, 1), CeL.Dai_Date.new_year_days(3191, 0, 1) - 1).join('\n') || 'OK';
// "OK"

*/

Dai_Date.test = new_tester(function(date) {
	return date.to_Dai({
		ignore_year_limit : true,
		format : 'serial'
	});
}, Dai_Date);


_.Dai_Date = Dai_Date;



//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// Myanmar calendar, 緬曆, 緬甸曆法, မြန်မာသက္ကရာဇ်.

// References:

// Wikipedia: Burmese calendar
// https://en.wikipedia.org/wiki/Burmese_calendar

// Irwin(1909)
// The Burmese & Arakanese calendars
// Irwin, Alfred Macdonald Bulteel. (A.M.B. Irwin) 1853-
// https://archive.org/details/burmesearakanese00irwiiala

// Cool Emerald(2015)
// Cool Emerald: Algorithm, Program and Calculation of Myanmar Calendar
// http://cool-emerald.blogspot.sg/2013/06/algorithm-program-and-calculation-of.html
// "My algorithm is only designed for ME years >= 0"

// Cool Emerald(2015/5)
// https://plus.google.com/u/1/+YanNaingAye-Mdy/posts/1eMwo3CbrWZ


// Irwin(1909) paragraph 34.
// According to the Surya Siddhanta a maha-yug of
// 4,320,000 years contains
// 1,577,917,828 days.
// 1,603,000,080 didi.
// 25,082,252 kaya.
// 51,840,000 solar months.
// 53,433,336 lunar months.
// 1,593,336 adimath.
//
// https://en.wikipedia.org/wiki/Yuga
// MAHAYUG: 1200*(4*360)+1200*(3*360)+1200*(2*360)+1200*(1*360) = 4320000
//
// mean tropical year days  (Thandeikta solar year, ayana hnit)
// ≈ 365.2587564814814814814814814814814814814814814814814814814814...
var Myanmar_YEAR_DAYS = 1577917828 / 4320000,
// ONE_DAY_LENGTH_VALUE * Myanmar_YEAR_DAYS
// = 31558356560
Myanmar_YEAR_LENGTH_VALUE = ONE_DAY_LENGTH_VALUE / 4320000 * 1577917828,
// mean synodic month days (Thandeikta lunar month)
// ≈ 29.53058794607171822474269620747617180405879954790769567522417...
Myanmar_MONTH_DAYS = 1577917828 / 53433336,

// accumulated solar days of every month.
// = Myanmar_YEAR_DAYS / 12 - Myanmar_MONTH_DAYS
// = 26189096670773/28854001440000
// ≈ 0.907641760718405232047427249313951652731323908882427781565952...
// cf. epact: the moon age when tropical year starts. https://en.wikipedia.org/wiki/Epact
Myanmar_month_accumulated_days = Myanmar_YEAR_DAYS / 12 - Myanmar_MONTH_DAYS,

// https://en.wikipedia.org/wiki/Kali_Yuga
// According to the Surya Siddhanta, Kali Yuga began at midnight (00:00) on 18 February 3102 BCE in the proleptic Julian calendar
//
// Cool Emerald(2015)
// The Kali Yuga year number can be obtained by adding 3739 to the Myanmar year.
// The start of Kali Yuga in the Myanmar calendar is found to be 588465.560139 in Julian date. (MO - 3739 SY)
Myanmar_Kali_Yuga_offset = 3739,
// The first era: The era of Myanmar kings
// The second era: The era under British colony
Myanmar_era_2_year = 1217,
// The third era: The era after Independence
Myanmar_era_3_year = 1312,
// Irwin(1909) paragraph 50.
// The difference in time between the entry of the apparent sun and that of the mean sun into the sign Meiktha is called in India Sodhya, and in Burma Thingyan. The length of this period is fixed at 2 yet 10 nayi and 3 bizana (2 days 4 hours 1 minute and 12 seconds).
// The day on which the Thingyan commences is called Thingyan Kya, and the day on which it ends Thingyan Tet.
// = 187272000
Myanmar_Thingyan_LENGTH_VALUE = new Date(0, 0, 2, 4, 1, 12) - new Date(0, 0, 0, 0, 0, 0),
// Cool Emerald(2015)
// A typical Myanmar calendar mentions the beginning of the year called the atat time and it is the end of the Thingyan. The starting time of the Thingyan is called the akya time.
// The length of the Thingyan currently recognized by Myanmar Calendar Advisory Board is 2.169918982 days ( 2days, 4 hours, 4 minutes and 41 seconds). When the time of ancient Myanmar kings, 2.1675 days (2 days, 4 hours, 1 min and 12 seconds) was used as the length of the Thingyan.
// = 187481000
Myanmar_Thingyan_3rd_LENGTH_VALUE = new Date(0, 0, 2, 4, 4, 41) - new Date(0, 0, 0, 0, 0, 0),
// local timezone offset value
TIMEZONE_OFFSET_VALUE = String_to_Date.default_offset * (ONE_DAY_LENGTH_VALUE / 24 / 60),

// Myanmar_cache[reference][year] = year data = {
//	Tagu_1st: time value of Tagu 1st,
//	watat: watat type (0: common / 1: little watat / 2: big watat),
//	full_moon: time value of full moon day of watat year
// }
Myanmar_cache = [ [], [] ],
// Myanmar_month_days[ watat : 0, 1, 2 ]
// = [ days of month 1 (Tagu), days of month 2, ... ]
Myanmar_month_days = [],
// Myanmar_month_days_count[ watat : 0, 1, 2 ]
// = [ accumulated days of month 1 (Tagu), accumulated days of month 2, ... ]
Myanmar_month_days_count = [],

// @see https://github.com/yan9a/mcal/blob/master/mc.js
// 1060: beginning of well-known (historical) Myanmar year
// well-known exceptions
Myanmar_adjust_watat = {
	// Thandeikta (ME 1100 - 1216)
	1201 : true,
	1202 : false,

	// The second era (the era under British colony: 1217 ME - 1311 ME)
	1263 : true,
	1264 : false,

	// The third era (the era after Independence	1312 ME and after)
	1344 : true,
	1345 : false
},
// well-known exceptions
Myanmar_adjust_fullmoon = {
	// Thandeikta (ME 1100 - 1216)
	1120 : 1,
	1126 : -1,
	1150 : 1,
	1172 : -1,
	1207 : 1,

	// The second era (the era under British colony: 1217 ME - 1311 ME)
	1234 : 1,
	1261 : -1,

	// The third era (the era after Independence	1312 ME and after)
	1377 : 1
},
// for fullmoon: Cool Emerald - Based on various evidence such as inscriptions, books, etc...
// Cool Emerald(2015/11)
// got modified dates based on feedback from U Aung Zeya who referred to multiple resources such as Mhan Nan Yar Za Win, Mahar Yar Za Win, J. C. Eade, and inscriptions etc...
Myanmar_adjust_CE = {
	// Makaranta system 1 (ME 0 - 797)
	205 : 1,
	246 : 1,
	471 : 1,
	572 : -1,
	651 : 1,
	653 : 2,
	656 : 1,
	672 : 1,
	729 : 1,
	767 : -1,

	// Makaranta system 2 (ME 798 - 1099)
	813 : -1,
	849 : -1,
	851 : -1,
	854 : -1,
	927 : -1,
	933 : -1,
	936 : -1,
	938 : -1,
	949 : -1,
	952 : -1,
	963 : -1,
	968 : -1,
	1039 : -1
},
// for fullmoon: Tin Naing Toe & Dr. Than Tun
// Cool Emerald(2015/5)
// from T. N. Toe (1999) which he said referred from Dr. Than Tun and Irwin. I am currently building that of Irwin (xIRWIN)  and J. C. Eade (xEADE) to add in the calendar.﻿
Myanmar_adjust_TNT = {
	205 : 1,
	246 : 1,
	813 : -1,
	854 : -1,
	1039 : -1
},
// references before 1060.
Myanmar_reference =[ Myanmar_adjust_CE, Myanmar_adjust_TNT ];



// Year 0 date
// https://en.wikipedia.org/wiki/Burmese_calendar
// (Luce Vol. 2 1970: 336): According to planetary positions, the current Burmese era technically began at 11:11:24 on 22 March 638.
if (false)
	Myanmar_Date.epoch = String_to_Date('638/3/22 11:11:24', {
		parser : 'Julian'
	}).getTime();

// Cool Emerald(2015/5)
// ME 1377 (my=1377) Myanmar calendar says new year time is 2015-Apr-16 20:35:57
// = 638/3/22 13:12:53.880 local time	(new Date(CeL.Myanmar_Date.epoch).format('CE'))
// Myanmar_Date.epoch = new Date(2015, 4 - 1, 16, 20, 35, 57) - 1377 * Myanmar_YEAR_LENGTH_VALUE;

// Cool Emerald(2018/7)
// beginning of 0 ME: MO is estimated as Julian Date 1954168.050623.
Myanmar_Date.epoch = library_namespace.JD_to_Date(1954168.050623).getTime();

// 'နှောင်း': Hnaung (e.g., Hnaung Tagu, Late Tagu)
Myanmar_Date.month_name = 'ဦးတပေါင်း|တန်ခူး|ကဆုန်|နယုန်|ဝါဆို|ဝါခေါင်|တော်သလင်း|သီတင်းကျွတ်|တန်ဆောင်မုန်း|နတ်တော်|ပြာသို|တပို့တွဲ|တပေါင်း|နှောင်းတန်ခူး|နှောင်းကဆုန်'
	.split('|');
// intercalary month
// 'ဒု': Second (e.g., Second Waso)
Myanmar_Date.month_name.waso = [ 'ပဝါဆို', 'ဒုဝါဆို' ];

Myanmar_Date.month_name.en = 'Early Tabaung|Tagu|Kason|Nayon|Waso|Wagaung|Tawthalin|Thadingyut|Tazaungmon|Nadaw|Pyatho|Tabodwe|Tabaung|Late Tagu|Late Kason'
	.split('|');
Myanmar_Date.month_name.en.waso = [ 'First Waso', 'Second Waso' ];

// Irwin(1909) paragraph 38.
// In Burma the zero of celestial longitude does not move with the precession of the equinoxes as in Europe.
// Irwin(1909) paragraph 104.
// The equinox is said to have coincided with Thingyan Kya about 207 years before Poppasaw's epoch, i.e., about 411 A.D.
// Irwin(1909) paragraph 107.
// Through the accumulation of precession, Thingyan Kya is now about 24 days after the vernal equinox.

// initialization of accumulated days / month name
(function() {
	function push_queue() {
		(m = month_name.slice())
		// reverse index
		.forEach(function(value, index) {
			m[value] = index;
		});

		(m.en = month_name.en.slice())
		// reverse index
		.forEach(function(value, index) {
			m[value] = index;
		});

		queue.month = m;
		Myanmar_month_days_count.push(queue);
	}

	var m, count = 0, days, queue = [ count ],
	// days in the month
	month_days = [],
	// new year's day often falls on middle Tagu, even Kason.
	month_name = Myanmar_Date.month_name.slice();
	month_name.en = Myanmar_Date.month_name.en.slice();

	for (m = 0; m < month_name.length; m++) {
		month_days.push(days = m % 2 === 0 ? 29 : 30);
		queue.push(count += days);
	}
	push_queue();

	Myanmar_month_days.push(month_days.slice());
	month_days.splice(5 - 1, 0, 30);
	Myanmar_month_days.push(month_days.slice());
	month_days[2]++;
	Myanmar_month_days.push(month_days);

	// insert leap month, 2nd Waso
	queue = queue.slice();
	// 5: index of 2nd Waso
	queue.splice(5, 0, queue[5 - 1]);

	// adapt intercalary month name.
	m = Myanmar_Date.month_name.waso;
	month_name.splice(5 - 1, 1, m[0], m[1]);
	m = Myanmar_Date.month_name.en.waso;
	month_name.en.splice(5 - 1, 1, m[0], m[1]);

	// add accumulated days to all months after 2nd Waso
	for (m = 5; m < month_name.length; m++)
		queue[m] += 30;
	push_queue();

	queue = queue.slice();
	// add 1 day to all months after 30 days Nayon
	// 3: index of Nayon
	for (m = 3; m < month_name.length; m++)
		queue[m]++;
	push_queue();
})();


// Cool Emerald(2015)
// The day before the akya day is called the akyo day (the Thingyan eve).
// the day after the atat day is called new year's day.
// The days between the akya day and the atat day are called akyat days.
/**
 * get year start date of Myanmar calendar.<br />
 * Using integer to calculate Myanmar new year's day.
 *
 * @param {Integer}year
 *            year of Myanmar calendar.
 * @param {Object}[options]
 *            options to use
 *
 * @returns {Date} system Date (proleptic Gregorian calendar with year 0)
 */
Myanmar_Date.new_year_Date = function(year, options) {
	var date = Myanmar_Date.epoch + year * Myanmar_YEAR_LENGTH_VALUE,
	// remainder: time value after local midnight of the date.
	// (date + TIMEZONE_OFFSET_VALUE): convert ((date)) to UTC so we can use .mod(ONE_DAY_LENGTH_VALUE) to reckon the time value.
	// Because (date at UTC+0 midnight).mod(ONE_DAY_LENGTH_VALUE) === 0.
	remainder = (date + TIMEZONE_OFFSET_VALUE).mod(ONE_DAY_LENGTH_VALUE), info,
	// get detail information.
	detail = options && options.detail;

	if (detail)
		info = {
			// * Thingyan start: Thingyan Kya, akya time
			start_time : date - (year < Myanmar_era_3_year ? Myanmar_Thingyan_LENGTH_VALUE
			//
			: Myanmar_Thingyan_3rd_LENGTH_VALUE),
			// * Thingyan end: Thingyan Tet, atat time
			end_time : date
		};

	// Convert the date to local midnight of next day, the new year's day.
	// assert: The remainder should bigger than 0.
	date += ONE_DAY_LENGTH_VALUE - remainder;

	if (!detail)
		// local midnight of new year's day
		return options && options.get_value ? date : new Date(date);

	// get time and more information.
	// new year's day (local midnight)
	info.new_year = date;
	// Thingyan end day: atat day (local midnight)
	info.end = date - ONE_DAY_LENGTH_VALUE;

	date = info.start_time;
	// assert: The remainder should bigger than 0.
	date -= (date + TIMEZONE_OFFSET_VALUE).mod(ONE_DAY_LENGTH_VALUE);
	// Thingyan (သႀကၤန္), Myanmar new year festival: akya day (local midnight)
	info.start = date;
	// Thingyan eve: akyo day (local midnight)
	info.eve = date - ONE_DAY_LENGTH_VALUE;

	if (false)
		for (date in info)
			info[date] = (new Date(info[date])).format('CE');

	// info.eve: Thingyan eve: akyo day
	// info.start: Thingyan start day, Myanmar new year festival, 潑水節: akya day
	// info.start_time: Thingyan start: Thingyan Kya, akya time
	//
	// days between akya day, atat day: akyat days
	//
	// info.end: Thingyan end day: atat day
	// info.end_time: Thingyan end: Thingyan Tet, atat time
	// info.new_year: new year's day
	return info;
};



/*

# Myanmar leap year

Myanmar leap year on 2,5,7,10,13,15,18 / 19

** But Wikipedia denotes prior to 1740, it's 2, 5, 8, 10, 13, 16, 18.

for(var i=0;i<19;i++){for(var y=0,_y,l=[];y<19;y++){_y=(7*y+i)%19;if(_y<7)l.push(y);}console.log(i+':'+l);}
// 9:2,5,7,10,13,15,18
@see Tabular_list_leap()

→ Myanmar year is a leap year if:
(7*year+9).mod(19)<7

*/

/**
 * check if it's a watat year.<br />
 *
 * @param {Integer}year
 *            year of Myanmar calendar.
 * @param {Integer}[reference]
 *            reference to use. see Myanmar_reference.
 *
 * @returns {Date} system Date (proleptic Gregorian calendar with year 0)
 */
Myanmar_Date.watat_data = function(year, reference) {
	var cache = Myanmar_cache[reference |= 0];
	if (year in cache)
		return cache[year];

	var accumulated_months = year < Myanmar_era_2_year ? -1 : year < Myanmar_era_3_year ? 4 : 8,
	// reckon excess days
	excess_days = ((year + Myanmar_Kali_Yuga_offset) * Myanmar_YEAR_DAYS) % Myanmar_MONTH_DAYS;
	// adjust excess days
	if (excess_days < Myanmar_month_accumulated_days * (12 - accumulated_months))
		excess_days += Myanmar_MONTH_DAYS;

	// Using historical data directly.
	var watat = year in Myanmar_adjust_watat ? Myanmar_adjust_watat[year]
	// find watat by 19 years metonic cycle.
	// see "# Myanmar leap year" above.
	: year < Myanmar_era_2_year ? (7 * year + 9).mod(19) < 7
	// find watat based on excess days. value below denotes threshold for watat.
	: excess_days >= Myanmar_MONTH_DAYS - Myanmar_month_accumulated_days * accumulated_months;

	// the full moon day of Second Waso only needs to reckon in the watat year.
	if (!watat)
		return cache[year] = {
			watat : 0
		};

	// reckon the full moon day of second Waso

	// Use TIMEZONE_OFFSET_VALUE & Math.floor() to convert between UTC and local time,
	// to get local midnight of specified date.
	var fullmoon = Math.floor((Myanmar_Date.epoch + TIMEZONE_OFFSET_VALUE) / ONE_DAY_LENGTH_VALUE
		// full moon accumulated days from Myanmar_Date.epoch
		+ (year * Myanmar_YEAR_DAYS - excess_days + 4.5 * Myanmar_MONTH_DAYS
		// 1.1, 0.85:
		// The constant which is used to adjust the full moon time of Second Waso is denoted by WO and its value for the third era is therefore -0.5.
		// By analyzing ME table [Toe, 1999], to fit them to our method,
		// we've got two offsets as 1.1 and 0.85 for before and after ME 1100
		// respectively
		- (year < 1100 ? 1.1 : year < Myanmar_era_2_year ? 0.85
		// 4 / accumulated_months:
		// it is 4 and half month from the latest new moon before new year
		// 2 nd era is 1 day earlier and 3rd ear is 0.5 day earlier (i.e. to make full
		// moon at midnight instead of noon)
		: 4 / accumulated_months))
		);

	// adjust for exceptions
	var table
	// 1060: beginning of well-known (historical) Myanmar year
	= year < 1060 ? reference && Myanmar_reference[reference] || Myanmar_reference[0] : Myanmar_adjust_fullmoon;
	if (year in table)
		fullmoon += table[year];

	return cache[year] = {
		// is watat year
		watat : true,
		// to get local midnight of specified date.
		fullmoon : fullmoon * ONE_DAY_LENGTH_VALUE - TIMEZONE_OFFSET_VALUE
	};
};


/**
 * get information of year. e.g., watat year, full moon day.<br />
 * Here we use the algorithm developed by Yan Naing Aye.
 *
 * @param {Integer}year
 *            year of Myanmar calendar.
 * @param {Object}[options]
 *            options to use
 *
 * @returns {Object} year data {<br />
 *          watat : 0: common / 1: little watat / 2: big watat,<br />
 *          Tagu_1st : The first day of Tagu<br />
 *          fullmoon : full moon day of 2nd Waso<br /> }
 *
 * @see http://cool-emerald.blogspot.sg/2013/06/algorithm-program-and-calculation-of.html
 * @see http://mmcal.blogspot.com
 */
Myanmar_Date.year_data = function(year, options) {
	var year_data = Myanmar_Date.watat_data(year),
	//
	reference = (options && options.reference) | 0;
	// "TypeError: invalid 'in' operand year_data" for minus years
	if ('Tagu_1st' in year_data)
		return year_data;

	var last_watat_year = year, last_watat_data;
	while (0 === (last_watat_data
	// find the lastest watat year before this year.
	= Myanmar_Date.watat_data(--last_watat_year, reference)).watat);

	if (year_data.watat)
		// This year is a watat year, and test if it is a big watat year.
		year_data.watat
		// assert: (... % 354) should be 30 or 31.
		= (year_data.fullmoon - last_watat_data.fullmoon) / ONE_DAY_LENGTH_VALUE
		// 354: common year days.
		% 354 === 31 ? 2 : 1;

	// Tagu 1st time value
	// The first day of Tagu is not only determined by the full moon day of that year.
	year_data.Tagu_1st = last_watat_data.fullmoon + (354 * (year - last_watat_year) - 102) * ONE_DAY_LENGTH_VALUE;

	return year_data;
};


/**
 * get days count of specified year.<br />
 * The sum of all days should be 365 or 366.
 *
 * @param {Integer}year
 *            year of Myanmar calendar.
 * @param {Object}[options]
 *            options to use
 *
 * @returns {Array} days count
 */
Myanmar_Date.month_days = function(year, options) {
	var year_data = Myanmar_Date.year_data(year),
	end = Myanmar_Date.new_year_Date(year + 1, {
		get_value : true
	}),
	// the last day of the year counts from Tagu 1.
	date = Date_to_Myanmar(end - ONE_DAY_LENGTH_VALUE, {
		format : 'serial'
	}),
	//
	month_days = Myanmar_month_days[year_data.watat].slice(0, date[1] - 1);
	month_days.end = end;
	month_days.end_date = date;
	month_days.push(date[2]);

	month_days.start_date
	// date (new year's day) counts from Tagu 1.
	= date = Date_to_Myanmar(month_days.start = Myanmar_Date.new_year_Date(year, {
		get_value : true
	}), {
		format : 'serial'
	});

	if (date[1] < 1)
		// assert: date[1] === 0
		// Early Tabaung: 30 days
		month_days.unshift(30 + 1 - date[2]);
	else
		month_days.splice(0, date[1], month_days[date[1] - 1] + 1 - date[2]);

	if (options && ('start_month' in options)
	// assert: options.start_month < date[1]. e.g., ((0))
	&& (end = date[1] - options.start_month) > 0)
		Array.prototype.unshift.apply(month_days, new Array(end).fill(0));

	return month_days;
};


/**
 * get Date of Myanmar calendar.<br />
 * Myanmar date → Date
 *
 * @param {Integer}year
 *            year of Myanmar calendar.
 * @param {Natural}month
 *            month of Myanmar calendar.<br />
 *            Using 1 for Oo Tagu (Early Tagu) and 13 (14) for Hnaung Tagu (Late Tagu).
 * @param {Natural}date
 *            date of Myanmar calendar.
 * @param {Object}[options]
 *            options to use
 *
 * @returns {Date} system Date (proleptic Gregorian calendar with year 0)
 */
function Myanmar_Date(year, month, date, options) {
	var year_data = Myanmar_Date.year_data(year, options);
	if (isNaN(date))
		date = 1;

	// reckon days count from Tagu 1
	var month_days = Myanmar_month_days_count[year_data.watat];
	if (isNaN(month))
		// e.g., CeL.Myanmar_Date(1370,'Tawthalin',18).format()
		// @see 'reverse index' of push_queue()
		// may get invalid month name.
		month = month_days.month[month];

	// e.g., 654/3/23 CE
	// treat as the last month, 'Early Tabaung' (30 days) of last year.
	if (month === 0)
		// - 1: serial to index.
		date -= 30 + 1;
	else
		// -1: serial to index.
		date += month_days[month - 1 || 0] - 1;

	return new Date(year_data.Tagu_1st + date * ONE_DAY_LENGTH_VALUE);
}

_.Myanmar_Date = Myanmar_Date;


/**
 * get Myanmar calendar (of Date).<br />
 * Date → Myanmar date
 *
 * @param {Date}date
 *            system date to convert.
 * @param {Object}[options]
 *            options to use
 *
 * @returns {Array} [ year, month, date ]
 */
function Date_to_Myanmar(date, options) {
	// 前置處理。
	if (!library_namespace.is_Object(options))
		options = Object.create(null);

	// reckon the year of ((date))
	var year = Math.floor((date - Myanmar_Date.epoch)
			/ Myanmar_YEAR_LENGTH_VALUE),
	//
	year_data = Myanmar_Date.year_data(year, options),
	// days count from Tagu 1
	days = (date - year_data.Tagu_1st) / ONE_DAY_LENGTH_VALUE,
	// 30 > mean month days. So the true month may be month or month + 1.
	month = days / 30 | 0,
	// for notes
	weekday = options.notes && date.getDay(),
	//
	accumulated_days = Myanmar_month_days_count[year_data.watat];

	// Test next month, or should be this month.
	var Myanmar_date = days - accumulated_days[month + 1];
	if (Myanmar_date < 0)
		days -= accumulated_days[month];
	else
		days = Myanmar_date, month++;

	if (days < 0)
		if (month !== 0)
			throw 'Unknown error of ' + date.format('CE');
		else
			// month: 0 → -1
			// e.g., 654/3/23 CE
			// Early Tabaung: 30 days
			month--, days += 30;
	// month: month index, Tagu: 0
	// assert: now days >=0.

	// +1: index to ordinal.
	Myanmar_date = [ year, month + 1, ++days | 0 ];
	if (0 < (days %= 1))
		Myanmar_date.push(days);

	// Early Tabaung: 30 days
	var month_days = month < 0 ? 30
	//
	: accumulated_days[month + 1] - accumulated_days[month];

	/**
	 * calendar notes / 曆注<br />
	 * Myanmar Astrological Calendar Days
	 *
	 * notes: {Array} all notes with Myanmar language
	 *
	 * @see http://cool-emerald.blogspot.sg/2013/12/myanmar-astrological-calendar-days.html
	 */
	if (typeof weekday === 'number') {
		var notes = [],
		// 0–11, do not count First Waso.
		month_index = month,
		//
		tmp = ((date - Myanmar_Date.epoch)
				% Myanmar_YEAR_LENGTH_VALUE) / ONE_DAY_LENGTH_VALUE | 0;

		// at start or end of year.
		if (tmp < 2 || 359 < tmp) {
			var new_year_info = Myanmar_Date.new_year_Date(tmp < 2 ? year : year + 1, {
				detail : true
			});
			if (tmp < 2) {
				if (date - new_year_info.new_year === 0)
					// New year's day
					notes.push("နှစ်ဆန်းတစ်ရက် (New year's day)");
			} else {
				days = date - new_year_info.eve;
				if (days >= 0 && new_year_info.new_year - date >= 0) {
					days = days / ONE_DAY_LENGTH_VALUE | 0;
					tmp = (new_year_info.new_year - new_year_info.eve) / ONE_DAY_LENGTH_VALUE | 0;
					switch (days) {
					case 0:
						// Thingyan eve (akyo day)
						tmp = 'သင်္ကြန်အကြို (Thingyan eve)';
						break;

					case 1:
						// Thingyan start day. akya day. akya time:
						tmp = 'သင်္ကြန်အကျ (Thingyan start at ' + (new Date(new_year_info.start_time))
							.format({
								parser : 'CE',
								format : '%H:%M:%S'
							}) + ')';
						break;

					case tmp - 1:
						// Thingyan end day. atat day. atat time:
						tmp = 'သင်္ကြန်အတက် (Thingyan end at ' + (new Date(new_year_info.end_time))
							.format({
								parser : 'CE',
								format : '%H:%M:%S'
							}) + ')';
						break;

					default:
						// Thingyan akyat, days between akya day, atat day: akyat days
						tmp = 'သင်္ကြန်အကြတ် (Thingyan akyat)';
						break;
					}

					notes.push(tmp);
				}
			}
		}

		if (month_index < 0)
			// assert: month_index === -1 (Early Tabaung)
			month_index = 11;
		else if (year_data.watat && month > 3)
			// month after First Waso.
			month_index--;

		days = Myanmar_date[2];
		// full moon days, new moon days and waxing and waning 8 are sabbath days. The day before sabbath day is sabbath eve.
		if (days === 8 || days === 15 || days === 23 || days === month_days)
			// Sabbath
			notes.push('ဥပုသ်');
		else if (days === 7 || days === 14 || days === 22 || days === month_days - 1)
			// Sabbath Eve
			notes.push('အဖိတ်');

		// Yatyaza: ရက်ရာဇာ
		tmp = [ {
			3 : 1,
			4 : 2,
			5 : 1,
			6 : 2
		}, {
			3 : 2,
			4 : 1,
			5 : 2,
			6 : 1
		}, {
			0 : 2,
			1 : 2,
			2 : 1,
			4 : 1
		}, {
			0 : 1,
			2 : 2,
			3 : 3
		} ][month_index % 4][weekday];
		if (tmp)
			if (tmp === 3)
				// Yatyaza, Pyathada (afternoon) / Afternoon Pyathada
				notes.push('ရက်ရာဇာ', 'မွန်းလွဲပြဿဒါး');
			else
				// [ , 'Yatyaza', 'Pyathada' ]
				notes.push([ , 'ရက်ရာဇာ', 'ပြဿဒါး' ][tmp]);

		//for(month=0;month<12;month++){i=month===8?7:(((month+3)%12)*2)%7+1;console.log(month+':'+i);}
		if ((weekday - (month_index === 8 ? 7 : ((month_index + 3) % 12) * 2 + 1)) % 7 >= -1) {
			// Thamanyo
			tmp = 'သမားညို';
			if (month_index === 10 && weekday === 3)
				// (afternoon)
				tmp = 'မွန်းလွဲ' + tmp;
			notes.push(tmp);
		}

		// days: waxing or waning day, 1–14
		if ((days = Myanmar_date[2]) > 15)
			days -= 15;
		if (days === [ 8, 3, 7, 2, 4, 1, 5 ][weekday])
			// Amyeittasote
			notes.push('အမြိတ္တစုတ်');
		if (days === [ 1, 4, 8, 9, 6, 3, 7 ][weekday])
			// Warameittugyi
			notes.push('ဝါရမိတ္တုကြီး');
		if (days + weekday === 12)
			// Warameittunge
			notes.push('ဝါရမိတ္တုငယ်');
		if (days === [ 1, 4, 6, 9, 8, 7, 8 ][weekday])
			// Yatpote
			notes.push('ရက်ပုပ်');
		if ([ [ 1, 2 ], [ 6, 11 ], [ 6 ], [ 5 ], [ 3, 4, 6 ], [ 3, 7 ], [ 1 ] ][weekday].includes(days))
			// Thamaphyu
			notes.push('သမားဖြူ');
		if ([ [ 2, 19, 21 ], [ 1, 2, 4, 12, 18 ], [ 10 ], [ 9, 18 ], [ 2 ], [ 21 ], [ 17, 26 ] ][weekday].includes(Myanmar_date[2]))
			// Nagapor
			notes.push('နဂါးပေါ်');
		if (days % 2 === 0
		//
		&& days === (month_index % 2 ? month_index + 3 : month_index + 6) % 12)
			// Yatyotema
			notes.push('ရက်ယုတ်မာ');
		if (days - 1 === (((month_index + 9) % 12) / 2 | 0))
			// Mahayatkyan
			notes.push('မဟာရက်ကြမ်း');
		if (days === [ 8, 8, 2, 2, 9, 3, 3, 5, 1, 4, 7, 4 ][month_index])
			// Shanyat
			notes.push('ရှမ်းရက်');
		// Nagahle
		// http://www.cool-emerald.com/2013/12/blog-post.html#nagahlem
		notes.push('နဂါးခေါင်းလှည့်: ' + nagahle_direction[((month_index + 1) % 12) / 3 | 0]);

		if (notes.length > 0)
			Myanmar_date.notes = notes;
	}

	if (options.format === 'serial') {

	} else if (options.locale === 'my') {
		// ↑ my: Myanmar language

		// Produce a Myanmar date string
		// @see https://6885131898aff4b870269af7dd32976d97cca04b.googledrive.com/host/0B7WW8_JrpDFXTHRHbUJkV0FBdFU/mc_main_e.js
		// function m2str(my, myt, mm, mmt, ms, d, wd)

		// CeL.numeral.to_Myanmar_numeral()
		var numeral = library_namespace.to_Myanmar_numeral || function(number) {
			return number;
		};
		// Myanmar year
		Myanmar_date[0] = 'မြန်မာနှစ် ' + numeral(year) + ' ခု၊ ';
		// month
		Myanmar_date[1] = accumulated_days.month[Myanmar_date[1]];
		// date
		days = Myanmar_date[2];
		Myanmar_date[2] = days < 15 ? 'လဆန်း ' + numeral(days) + ' ရက်'
		// The 15th of the waxing (လပြည့် [la̰bjḛ]) is the civil full moon day.
		: days === 15 ? 'လပြည့်'
		// The civil new moon day (လကွယ် [la̰ɡwɛ̀]) is the last day of the month (14th or 15th waning).
		: days >= 29 && days === month_days ? 'လကွယ်' : 'လဆုတ် ' + numeral(days - 15) + ' ရက်';
		// time
		if (options.time) {
			days = date.getHours();
			// hour
			Myanmar_date[4] = (days === 0 ? 'မွန်းတက် ၁၂ '
			: days === 12 ? 'မွန်းလွဲ ၁၂ '
			: days < 12 ? 'မနက် ' + numeral(h)
				: ((days -= 12) > 6 ? 'ည '
				: days > 3 ? 'ညနေ '
				// assert: 0 < days <= 3
				: 'နေ့လယ် '
				)+ numeral(h)
			) + 'နာရီ၊';
			// assert: Myanmar_date.length === 5
			// minute, second
			Myanmar_date.push(numeral(date.getMinutes()) + ' မိနစ်၊', numeral(date.getSeconds()) + ' စက္ကန့်');
		}
		// weekday
		Myanmar_date[3] = '၊ '
			+ [ 'တနင်္ဂနွေ', 'တနင်္လာ', 'အင်္ဂါ', 'ဗုဒ္ဓဟူး',
				'ကြာသပတေး', 'သောကြာ', 'စနေ' ][date.getDay()] + 'နေ့၊';

		// Myanmar_date = [ year, month, date, weekday, hour, minute, second ]
		// Using Myanmar_date.join(' ') to get full date name.

	} else {
		Myanmar_date[1] = accumulated_days.month.en[Myanmar_date[1]];
		days = Myanmar_date[2];
		Myanmar_date[2] = days < 15 ? 'waxing ' + days
		// The 15th of the waxing (လပြည့် [la̰bjḛ]) is the civil full moon day.
		: days === 15 ? 'full moon'
		// The civil new moon day (လကွယ် [la̰ɡwɛ̀]) is the last day of the month (14th or 15th waning).
		: days >= 29 && days === month_days ? 'new moon' : 'waning ' + (days - 15);
	}

	return Myanmar_date;
}

// west,north,east,south
var nagahle_direction = 'အနောက်,မြောက်,အရှေ့,တောင်'.split(',');


/*

// confirm
CeL.run('https://googledrive.com/host/0B7WW8_JrpDFXTHRHbUJkV0FBdFU/mc.js');

for(var y=-100;y<2000;y++){var d=chk_my(y);CeL.assert([d.myt,CeL.Myanmar_Date.year_data(y).watat],'t'+y);d=j2w(d.tg1,1);CeL.assert([d.y+'/'+d.m+'/'+d.d,CeL.Myanmar_Date(y).format('%Y/%m/%d')],y);}
// true


'654/3/23'.to_Date('CE').to_Myanmar()

CeL.Myanmar_Date.test(-2e4, 4e6, 4).join('\n') || 'OK';
// "OK"

*/
Myanmar_Date.test = new_tester(Date_to_Myanmar, Myanmar_Date, {
	epoch : Date.parse('638/3/22'),
	continued_month : function(month, old_month) {
		// month === 0: e.g., 654/3/23 CE
		// month === 2: e.g., Late Tagu / Late Kason → Kason
		return month <= 2 && 0 <= month
		// The old month is the last month of last year.
		&& 12 <= old_month && old_month <= 14;
	}
});



//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// 長曆: Hindu calendar / 印度曆
// https://en.wikipedia.org/wiki/Hindu_calendar

/*
基本計算參照來源:
http://www.cc.kyoto-su.ac.jp/~yanom/pancanga/
Based on Pancanga (version 3.14) with small changes.

S. P. Bhattacharya and S. N. Sen, Ahargana in Hindu Astronomy, IJHS 4.1-2 (1969) 144-55.
http://insa.nic.in/writereaddata/UpLoadedFiles/IJHS/Vol04_1And2_14_SPBhattacharyya.pdf



http://ephemeris.com/history/india.html
Like Ptolemy, Hindu astronomers used epicycles (small circular motions within the larger circular orbit around the Earth) to describe the motion of the planets in a geocentric Solar System. One method of epicycles ("manda" in Sanskrit) was given in the Surya Siddhanta.

http://www.ima.umn.edu/~miller/Nelsonlecture1.pdf
古印度占星術(天文學)中，星體運行主要依循繞著地球公轉的軌道，但星體本身繞著此軌道小公轉。而所有軌道皆正圓(?)，皆以恆定速率公轉、小公轉。
因此星體經度可以從紀元積日數 (Ahargana)乘以平均速率，加上 apogee (遠地點)參數估算推得。


@see
https://archive.org/details/indiancalendarwi00seweuoft
https://en.wikipedia.org/wiki/Hindu_calendar
http://vedicastro.com/vedic-system-of-calculating-ascendant/
https://en.wikipedia.org/wiki/Hindu_astrology
http://www2u.biglobe.ne.jp/~suchowan/when_exe/When/Ephemeris/Hindu.html
http://zh.scribd.com/doc/133208102/Horoscope-Construction-and-Organisation
http://www.hamsi.org.nz/p/blog-page_19.html
http://www.encyclopedia.com/doc/1G2-2830904948.html

https://astrodevam.com/blog/tag/sayana-lagna/
http://jyotisha.00it.com/Difference.htm
http://vedicastro.com/basic-concepts-of-astronomy-relevant-to-astrology/
http://www.rubydoc.info/gems/when_exe/0.4.1/When/Ephemeris/Hindu

http://www.astrogyan.com/panchang/day-24/month-06/year-2015/indian_calender_june_24_2015.html
https://github.com/suchowan/when_exe/blob/master/lib/when_exe/region/indian.rb

Indian Calendar
http://www.math.nus.edu.sg/aslaksen/calendar/indian.html

*/


// copy from application.astronomy
var
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

// $PlanetCircumm{}
Hindu_circum = {
	sun : 13 + 50 / 60,
	moon : 31 + 50 / 60
},

Hindu_apogee = {
	sun : 77 + 17 / 60
},

//https://en.wikipedia.org/wiki/Ujjain
Hindu_day_offset = 75.777222 / TURN_TO_DEGREES,
//Month names based on the rāshi (Zodiac sign) into which the sun transits
//within a lunar month
//https://en.wikipedia.org/wiki/Hindu_zodiac
Hindu_zodiac_signs = 12 | 0,
Hindu_zodiac_angle = TURN_TO_DEGREES / Hindu_zodiac_signs | 0,

Hindu_month_count = Hindu_zodiac_signs,
Hindu_month_angle = TURN_TO_DEGREES / Hindu_month_count | 0,

// 自日出起算。日出 (6:0) 為印度曆當日起始。Day begins at sunrise.
Hindu_days_begin = .25,

// names
Hindu_leap_prefix = 'Adhika ',
// month names (मासाः, भारतीयमासाः)
// https://sa.wikipedia.org/wiki/%E0%A4%AD%E0%A4%BE%E0%A4%B0%E0%A4%A4%E0%A5%80%E0%A4%AF%E0%A4%AE%E0%A4%BE%E0%A4%B8%E0%A4%BE%E0%A4%83
Hindu_month_name =
	//'|Chaitra|Vaiśākha|Jyeṣṭha|Āṣāḍha|Śrāvaṇa|Bhādrapada, Bhādra or Proṣṭhapada|Āśvina|Kārtika|Agrahāyaṇa, Mārgaśīrṣa|Pauṣa|Māgha|Phālguna'
	'|Chaitra (चैत्र)|Vaiśākha (वैशाख)|Jyeṣṭha (ज्येष्ठ)|Āṣāḍha (आषाढ)|Śrāvaṇa (श्रावण)|Bhādra (भाद्रपद)|Āśvina (अश्विन्)|Kārtika (कार्तिक)|Agrahāyaṇa (मार्गशीर्ष)|Pauṣa (पौष)|Māgha (माघ)|Phālguna (फाल्गुन)'
	.split('|'),
Hindu_year_name =
	'Prabhava|Vibhava|Shukla|Pramoda|Prajāpati|Āngirasa|Shrīmukha|Bhāva|Yuva|Dhātri|Īshvara|Bahudhānya|Pramādhi|Vikrama|Vrisha|Chitrabhānu|Svabhānu|Tārana|Pārthiva|Vyaya|Sarvajeeth|Sarvadhāri|Virodhi|Vikrita|Khara|Nandana|Vijaya|Jaya|Manmatha|Durmukhi|Hevilambi|Vilambi|Vikāri|Shārvari|Plava|Shubhakruti|Sobhakruthi|Krodhi|Vishvāvasu|Parābhava|Plavanga|Kīlaka|Saumya|Sādhārana|Virodhikruthi|Paridhāvi|Pramādicha|Ānanda|Rākshasa|Anala|Pingala|Kālayukthi|Siddhārthi|Raudra|Durmathi|Dundubhi|Rudhirodgāri|Raktākshi|Krodhana|Akshaya'
	.split('|'),
// Nakshatra (Sanskrit: नक्षत्र, IAST: Nakṣatra) 二十七宿
// https://en.wikipedia.org/wiki/Nakshatra
Nakṣatra =
	// 'Ashwini (अश्विनि)|Bharani (भरणी)|Kritika (कृत्तिका)|Rohini(रोहिणी)|Mrigashīrsha(म्रृगशीर्षा)|Ārdrā (आर्द्रा)|Punarvasu (पुनर्वसु)|Pushya (पुष्य)|Āshleshā (आश्लेषा)|Maghā (मघा)|Pūrva or Pūrva Phalgunī (पूर्व फाल्गुनी)|Uttara or Uttara Phalgunī (उत्तर फाल्गुनी)|Hasta (हस्त)|Chitra (चित्रा)|Svātī (स्वाति)|Viśākhā (विशाखा)|Anurādhā (अनुराधा)|Jyeshtha (ज्येष्ठा)|Mula (मूल)|Pūrva Ashādhā (पूर्वाषाढ़ा)|Uttara Aṣāḍhā (उत्तराषाढ़ा)|Śrāvaṇa (श्र‌ावण)|Śrāviṣṭha (श्रविष्ठा) or Dhanishta|Shatabhisha (शतभिषा)or Śatataraka|Pūrva Bhādrapadā (पूर्वभाद्रपदा)|Uttara Bhādrapadā (उत्तरभाद्रपदा)|Revati (रेवती)'
	'Aśvinī अश्विनी|Bharaṇī भरणी|Kṛttikā कृत्तिका|Rohiṇī रोहिणी|Mṛgaśirṣa मृगशिर्ष|Ārdrā आद्रा|Punarvasu पुनर्वसु|Puṣya पुष्य|Aśleṣā आश्ळेषा / आश्लेषा|Maghā मघा|Pūrva or Pūrva Phalguṇī पूर्व फाल्गुनी|Uttara or Uttara Phalguṇī उत्तर फाल्गुनी|Hasta हस्त|Citrā चित्रा14|Svāti स्वाति|Viśākha विशाखा|Anurādhā अनुराधा|Jyeṣṭha ज्येष्ठा|Mūla मूल/मूळ|Pūrvāṣāḍha पूर्वाषाढा|Uttarāṣāḍha उत्तराषाढा|Śravaṇa श्रवण|Śraviṣṭhā or Dhaniṣṭha श्रविष्ठा or धनिष्ठा|Śatabhiṣak or Śatatārakā शतभिषक् / शततारका|Pūrva Bhādrapadā पूर्वभाद्रपदा / पूर्वप्रोष्ठपदा|Uttara Bhādrapadā उत्तरभाद्रपदा / उत्तरप्रोष्ठपदा|Revatī रेवती'
	.split('|'),
//Hindu_weekday_name
// the Vāsara (ancient nomeclature), vāra (modern nomeclature), like in ravi-vāra, somā-vāra, etc. or weekday
Vāsara = 'Ravi vāsara रविवासर|Soma vāsara सोमवासर|Maṅgala vāsara मंगलवासर|Budha vāsara बुधवासर|Guru vāsara गुरुवासर|Śukra vāsara शुक्रवासर|Śani vāsara शनिवासर'.split('|'),

/*
https://en.wikipedia.org/wiki/Kali_Yuga
According to the Surya Siddhanta, Kali Yuga began at midnight (00:00) on 18 February 3102 BCE in the proleptic Julian calendar, or 14 January 3102 BC in the proleptic Gregorian calendar.

http://www.new1.dli.ernet.in/data1/upload/insa/INSA_1/2000c4e3-359.pdf
K. Chandra Hari, HISTORICAL NOTES. Indian Journal of History of Science, 39.3 (2004) 359-364.
Kali epoch: 18 February 3102 BC 06:00 Ujjain Mean time
Varahamihira Epoch: Tuesday, Caitra 1,427 Saka (22 March 505 AD)
Brahmagupta epoch: Sunday Caitra 1, 587 Saka (23 March 665 AD). JDN (Bag)= 1964031 : This refers to the day beginning at 12:00 GMT of Sunday and not the 00:00 GMT of Sunday or mean sunrise at Ujjain.
Epoch of KaraYJ,akutuhala: Bag placed the KaraYJ, akutuhala epoch at Thursday, Caitra-s ukla mean sunrise Saka1105 (24 February 1183 AD), Kalilnda6 = 1564737.
Epoch ofGrahaliighava: Caitra S(l), 19 March 1520 AD, Kalidina = 1687850
*/
Kali_epoch = String_to_Date('-3102/2/18', {
	parser : 'Julian'
}).getTime(),

Hindu_year_offset = {
	// Saka 0 = Kali Yuga 3179, サカ紀元
	Saka : 3179,
	Vikrama : 3044
},


Hindu_constants = Object.create(null);

// सूर्य सिद्धांत
// https://en.wikipedia.org/wiki/Surya_Siddhanta
// based on SuryaSiddhanta (c. 1200).
// Saura, HIL, p.15
// It is partly based on Vedanga Jyotisha, which itself might reflect traditions going back to the Indian Iron Age (around 700 BCE).
Hindu_constants.Surya_Siddhanta = {
	// revolutions in a mahayuga
	// asterisrn
	star : 1582237828,

	// planets
	// revolutions in a mahayuga
	sun : 4320000,
	moon : 57753336,
	mercury : 17937060,
	venus : 7022376,
	mars : 2296832,
	jupiter : 364220,
	saturn : 146568,

	// http://www.hamsi.org.nz/p/blog-page_19.html
	// Candrocca, the apogee of Moon. 月球遠地點
	moon_apogee : 488203,
	// Rahu, the south lunar nodes, 月球升交點
	north_lunar_node : -232238
};

// https://en.wikipedia.org/wiki/Var%C4%81hamihira#Pancha-Siddhantika
// based on older constants in Pancasiddhantika (c. 575).
// Latadeva/Ardharatrika, HIL, p.15
Hindu_constants.Pancha_Siddhantika = {
	star : 1582237800,

	sun : 4320000,
	moon : 57753336,
	mercury : 17937000,
	venus : 7022388,
	mars : 2296824,
	jupiter : 364220,
	saturn : 146564,

	moon_apogee : 488219,
	north_lunar_node : -232226
};

var Hindu_default_system = Hindu_constants.Surya_Siddhanta;


//Hindu_Date.constants = Hindu_constants;

(function() {
	for ( var system in Hindu_constants) {
		system = Hindu_constants[system];
		var civil_days = system.star - system.sun;
		// assert: 0 < system[object]: 星體每天移動的角度 (degrees)。
		// so we can use ((days * system[object]))
		// to get the mean longitude of the object in the Indian astronomy.
		for ( var object in system)
			system[object] *= TURN_TO_DEGREES / civil_days;
		system.year_days = TURN_TO_DEGREES / system.sun;
		// cache for Hindu_Date.conjunction()
		system.conjunction = Object.create(null);
		system.moon_sun = 1 / (system.moon - system.sun);
		system.moon_days = system.moon_sun * TURN_TO_DEGREES;
	}

	for ( var object in Hindu_circum)
		Hindu_circum[object] /= TURN_TO_DEGREES;
})();

/*
manda correction 修正

manda (Sanskrit: मन्द)
http://www.sanskritdictionary.com/scans/?col=3&img=mw0787.jpg
the (upper) apsis of a planet's course or (according to some) its anomalistic motion - See more at: http://www.sanskritdictionary.com/manda/171277/1#sthash.ASB1VNSi.dpuf
http://www.sanskritdictionary.com/?q=luna&iencoding=iast&lang=sans

http://www.physics.iitm.ac.in/~labs/amp/kerala-astronomy.pdf
two correctionsnamely manda samskara and sighra samskara are applied to the mean planet to obtain the true longitude.
Themandasamskara is equivalentto taking into account tbe eccentricity of the planet's orbit. DitTerent computational schemes for the manda samsknra arc discussed in Indian astronomical literature.
http://ephemeris.com/history/india.html
Like Ptolemy, Hindu astronomers used epicycles (small circular motions within the larger circular orbit around the Earth) to describe the motion of the planets in a geocentric Solar System. One method of epicycles ("manda" in Sanskrit) was given in the Surya Siddhanta.
*/
Hindu_Date.longitude_correction = function(circum, argument) {
	// circum: Hindu_circum[object]
	return Math.asin(circum * Math.sin(argument * DEGREES_TO_RADIANS))
			/ DEGREES_TO_RADIANS;
};

// the true longitudes of Sun in the Indian astronomy
//sub get_tslong
Hindu_Date.true_solar_longitude = function(days, system) {
	var mean_longitude = days * system.sun;
	return mean_longitude - Hindu_Date.longitude_correction
	// mean solar longitude → true solar longitude
	(Hindu_circum.sun, mean_longitude - Hindu_apogee.sun);
};

// the true longitudes of Moon in the Indian astronomy
//sub get_tllong
Hindu_Date.true_lunar_longitude = function(days, system) {
	var mean_longitude = days * system.moon;
	return mean_longitude - Hindu_Date.longitude_correction
	// mean lunar longitude → true lunar longitude
	(Hindu_circum.moon, mean_longitude
	//
	- days * system.moon_apogee - TURN_TO_DEGREES / 4);
};



//sub get_conj
Hindu_Date.conjunction = function(days, system, angle, next, no_recursion) {
	if (!(angle >= 0))
		// 日月夾角 angle in degrees: 0–TURN_TO_DEGREES
		angle = (Hindu_Date.true_lunar_longitude(days, system) - Hindu_Date
				.true_solar_longitude(days, system)).mod(TURN_TO_DEGREES);

	// 設定初始近似值。
	if (next)
		days += (TURN_TO_DEGREES - angle) * system.moon_sun;
	else
		days -= angle * system.moon_sun;

	// 使用 cache 約可省一半時間。

	// index: month count from Kali_epoch
	var index = Math.round(days / system.moon_days);
	if (index in system.conjunction) {
		return system.conjunction[index];
	}

	// console.log('count [' + index + ']:' + days);
	var longitude;
	// 範圍設在 [ days - 1, days + 1 ] 會在 Hindu_Date.test(1969867, 1969868) 出問題。
	days = library_namespace.find_root(function(days) {
		longitude = Hindu_Date.true_solar_longitude(days, system);
		angle = (Hindu_Date.true_lunar_longitude(days, system) - longitude)
				.mod(TURN_TO_DEGREES);
		// console.log(days + ': ' + longitude + ',' + angle);
		// angle: -180–180
		return angle > TURN_TO_DEGREES / 2 ? angle - TURN_TO_DEGREES : angle;
	}, days - 1, days + 1);

	if (!Number.isFinite(days))
		throw 'Hindu_Date.conjunction: Cannot find days!';

	// ** 在此計算 month, year 不能節省時間，純粹為了降低複雜度用。
	longitude = longitude.mod(TURN_TO_DEGREES);

	// $masa_num
	// month index
	// 月分名以當月月初之後首個太陽進入的 Rāśi (zodiac sign) 為準。
	var month = longitude / Hindu_zodiac_angle + 1,
	// 只有恰好在前後的時候，才需要檢測。否則月中跨越 zodiac 的次數應該都是 1。
	transit = Math.abs(month - Math.round(month)) > .1 && 1;
	month = (month | 0).mod(Hindu_zodiac_signs);
	if (!transit) {
		if (no_recursion)
			// 不遞迴
			return {
				month : month
			};
		// 檢測下一次日月合朔時的 longitude 與資訊。
		transit = (Hindu_Date.conjunction(days, system, 0, true, true).month - month)
				.mod(Hindu_zodiac_signs);
	}

	// 日月合朔時的 conjunction information
	return system.conjunction[index] = {
		// start days (Kali-ahargana, NOT date!)
		days : days,
		// month index: 0–(Hindu_zodiac_signs-1)
		month : month,
		// How many times the sun transits into next rāshis.
		// 太陽在月中跨越 zodiac 的次數。
		// 0: Adhika means "extra", leap month.
		// 1: normal month.
		// 2: Kṣaya means "loss". (Ksaya)
		transit : transit,
		// Kali year: 以太陽實際進入 Meṣa 所在月份來分年，當月為新年第一月。
		year : Math.floor((month < 2
		// https://en.wikipedia.org/wiki/Hindu_calendar#Year_of_the_lunisolar_calendar
		// * If an adhika Chaitra is followed by a nija Chaitra, the new year
		// starts with the nija Chaitra.
		// * If an adhika Chaitra is followed by a Chaitra-Vaishākha kshaya, the
		// new year starts with the adhika Chaitra.
		// * If a Chaitra-Vaiśākha Kṣaya occurs with no adhika Chaitra before
		// it, then it starts the new year.
		&& (0 < month || 0 < transit)
		// If a Chaitra-Phālguna Kṣaya' occurs, it starts the new year.
		|| month === Hindu_zodiac_signs - 1 && transit === 2
		// 當在年初年尾時，若判別已經過、或將進入 Meṣa，特別加點數字以當作下一年。
		// 採用 2 個月是為了預防有 leap。
		? days + 60 : days) / system.year_days),
		longitude : longitude
	};
};


function Hindu_Date(year, month, date, options) {
	// 前置處理。
	if (!library_namespace.is_Object(options))
		options = Object.create(null);

	if (options.era in Hindu_year_offset)
		year += Hindu_year_offset[options.era];

	var system = options.system && Hindu_constants[options.system]
			|| Hindu_default_system,
	// 太陽在月中跨越 zodiac 的次數。
	transit = 1, matched;

	if (typeof month === 'string')
		if (month.startsWith(Hindu_leap_prefix))
			transit = 0, month = month.slice(Hindu_leap_prefix.length);
		else if (matched = month.match(/(\d{1,2})[\-–]\d{1,2}/))
			transit = 2, month = matched[1];

	var diff, last_diff = Infinity, days,
	// 設定初始近似值。
	conjunction = Hindu_Date.conjunction(year * system.year_days + --month
			* system.moon_days, system);

	// 找尋準確值。
	while (diff = (year - conjunction.year)
			* system.year_days
			+ (month - conjunction.month
			// If we want to get a normal month after leap month, add 1.
			// 這時 conjunction 為上個月的。
			+ (conjunction.transit === 0 && transit > 0
					&& month === conjunction.month ? 1 : 0)) * system.moon_days) {
		// 進來至此的機會應該不多。
		// console.log('Hindu_Date: diff: ' + diff);

		// 應該越來越接近。
		if (!(Math.abs(diff) < last_diff))
			throw new Error('Hindu_Date(' + [ year,
			//
			transit ? month + 1 : '"' + Hindu_leap_prefix + (month + 1) + '"',
			//
			date ] + '): 無法找到準確值!');
		last_diff = Math.abs(diff);
		conjunction = Hindu_Date
				.conjunction(conjunction.days + diff, system, 0);
	}

	// assert: 年月份皆已正確。

	if (transit !== conjunction.transit)
		// 做補救措施。
		if (transit === 0 && month === 0) {
			// 處理如 4115/Adhika 1 (1015/2/22 CE)，為 4116/1 前一個月的情況。
			// assert: conjunction.transit === 1,
			// 取到了本年1月，但本應該取年末之 Adhika 1。
			conjunction = Hindu_Date.conjunction((year + 1) * system.year_days
					- system.moon_days, system);
		} else if (transit === 0 && conjunction.transit === 1
				&& month === conjunction.month) {
			// If we want to get the leap month before normal month, sub 1.
			// 這時 conjunction 為下個月的。
			conjunction = Hindu_Date.conjunction(conjunction.days
					- system.moon_days, system, 0);
		} else if (transit === 2 && conjunction.transit === 1
				&& month === conjunction.month) {
			// e.g., Hindu_Date(5393,'2-3',29)
			conjunction = Hindu_Date.conjunction(conjunction.days
					- system.moon_days, system, 0);
		}

	// last check.
	if (transit !== conjunction.transit || year !== conjunction.year
			|| month !== conjunction.month)
		throw new Error('Hindu_Date(' + [ year,
		//
		transit ? month + 1 : '"' + Hindu_leap_prefix + (month + 1) + '"',
		//
		date ] + '): 無法找到準確值: 日期或 transit 錯誤。 transit: ' + transit + ', get '
				+ conjunction.transit);

	// 合朔後首個日出開始為當月起始。
	// conjunction.days 為日月合朔時刻。
	var days = Math.floor(conjunction.days - Hindu_days_begin) + date;

	// 還是取到 midnight (0:0)。
	return new Date(Kali_epoch + days * ONE_DAY_LENGTH_VALUE);
}


_.Hindu_Date = Hindu_Date;


function Date_to_Hindu(date, options) {
	// 前置處理。
	if (!library_namespace.is_Object(options))
		options = Object.create(null);

	// $year/$month/$day → $JulianDay
	// → $ahar, $mllong, $mslong, $tllong, $tslong, $tithi, $clong, $nclong
	// → $YearSaka|$YearVikrama/$adhimasa $masa_num/$sukla_krsna $tithi_day

	// Kali-ahargana, civil days
	// Ahargana: Heap of days, sum of days, day count, 紀元積日數
	// http://www.indiadivine.org/content/topic/1445853-calendar/
	// Every kerala Panchanga (ephemeris) gives the Ahargana (kalidina) alias 'day count' for for every day.
	// http://cs.annauniv.edu/insight/Reading%20Materials/astro/sharptime/ahargana.htm
	// In Sanskrit 'ahoratra' means one full day and 'gana' means count. Hence, the Ahargana on any given day stands for the number of lunar days that have elapsed starting from an epoch.
	// http://www.ibiblio.org/sripedia/oppiliappan/archives/jun05/msg00030.html
	// 6, 6, 2005, Monday has been the 1865063rd day(5106.4 year) in Kali Yuga (Kali-ahargana: 1865063)
	var days = (date - Kali_epoch) / ONE_DAY_LENGTH_VALUE + Hindu_days_begin;

	// 後面的演算基於在 Ujjain 的天文觀測，因此需要轉換 local days 至 Ujjain 對應的日數。
	if (!isNaN(options.minute_offset))
		// desantara
		days += Hindu_day_offset - options.minute_offset / 60 / 24;

	var system = options.system && Hindu_constants[options.system]
			|| Hindu_default_system,
	//
	true_lunar_longitude = Hindu_Date.true_lunar_longitude(days, system).mod(TURN_TO_DEGREES),
	// 日月夾角 angle in degrees: 0–TURN_TO_DEGREES
	angle = (true_lunar_longitude - Hindu_Date.true_solar_longitude(days, system)).mod(TURN_TO_DEGREES),
	// 上一次日月合朔時的 longitude
	conjunction = Hindu_Date.conjunction(days, system, angle),
	// 太陽在月中跨越 zodiac 的次數。
	transit = conjunction.transit;

	// https://en.wikipedia.org/wiki/Tithi
	// reckon tithi: the longitudinal angle between the Moon and the Sun to increase by 12°.
	// tithi 相當於中曆日期，或月齡。
	// When a new moon occurs before sunrise on a day, that day is said to be the first day of the lunar month.
	if(false)
		Hindu_date = angle / Hindu_month_count | 0;
	// 為了使日期在例如 1315/10/8 能延續，因此採用減去月初日期的方法，而非上者。
	var Hindu_date = days - conjunction.days | 0;

	Hindu_date = [ conjunction.year, conjunction.month + 1, Hindu_date + 1 ];
	// $YearKali → other era
	if (options.era in Hindu_year_offset)
		Hindu_date[0] -= Hindu_year_offset[options.era];

	Hindu_date.transit = transit;
	if (transit > 1)
		Hindu_date[1] += '–' + (Hindu_date[1] < Hindu_zodiac_signs ? Hindu_date[1] + 1 : 1);
	// month type. e.g., [ 'leap', '', 'loss' ]
	// Adhika Māsa (Adhika or "extra"), nija ("original") or Śuddha ("unmixed"), Kṣaya-Māsa (Ksaya or "loss")
	if (options.epithet) {
		Hindu_date[1] = options.epithet[Hindu_date.transit] + Hindu_date[1];
	} else if (transit === 0)
		Hindu_date[1] = Hindu_leap_prefix + Hindu_date[1];

	if (options.format === 'serial') {
		if (options.note) {
			// $naksatra
			// 時不時有重號或跳號現象。似乎是正常？
			Hindu_date.Nakṣatra = Nakṣatra[true_lunar_longitude * 27 / TURN_TO_DEGREES | 0];
			Hindu_date.Vāsara = Vāsara[date.getDay()];
		}

	} else {
		// 12: Manmatha (2015-16)
		Hindu_date[0] = Hindu_year_name[(Hindu_date[0] + 11).mod(Hindu_year_name.length)];

		if (transit === 0)
			// reset
			Hindu_date[1] = conjunction.month + 1;
		// TODO: epithet nija ("original") or Śuddha ("unmixed").
		Hindu_date[1] = (isNaN(Hindu_date[1]) ? Hindu_date[1].replace(/\d+/g, function($0) {
			return Hindu_month_name[$0];
		}) : Hindu_month_name[Hindu_date[1]])
		// epithet / prefix
		+ (transit === 0 ? ' adhika-' : transit > 1 ? ' kṣaya-' : ' ')
		// māsa = lunar month
		+ 'māsa';

		// https://en.wikipedia.org/wiki/Tithi

		Hindu_date[2] = Hindu_date[2] < 15
		// https://en.wikipedia.org/wiki/Amavasya
		// Amavasya (Sanskrit: अमावस्या) means new moon night in Sanskrit.
		// Shukla Paksha is a period of 15 days, which begins on the Shukla Amavasya (New Moon) day and culminating Poornima (Full Moon) day and is considered auspicious.
		? Hindu_date[2] === 1 ? 'Amavasya (अमावस्या)'
		// http://marathidictionary.org/meaning.php?id=55359&lang=Marathi
		// शुक्लपक्ष - suklapaksa - [śuklapakṣa]
		// the period of the waxing moon.
		// Śukla Pakṣa, 'bright part' of the month
		: 'Śukla Pakṣa (शुक्लपक्ष) ' + Hindu_date[2]
		// https://en.wikipedia.org/wiki/Purnima
		// Purnima (also called Poornima, Sanskrit: पूर्णिमा) Pūrṇimā (the full moon)
		: Hindu_date[2] === 15 ? 'Purnima (पूर्णिमा)'
		// http://www.marathidictionary.org/meaning.php?id=12728&lang=Marathi
		// कृष्णपक्ष - krsnapaksa - [kṛṣṇapakṣa]
		// the fortnight of the waning moon
		// Kṛṣṇa Pakṣa, the'dark part' of the month.
		: 'Kṛṣṇa Pakṣa (कृष्णपक्ष) ' + (Hindu_date[2] - 15);

		if (options.format === 'name')
			Hindu_date = Hindu_date.join(' ');
	}

	return Hindu_date;
}


/*

var Kali_epoch = CeL.String_to_Date('-3102/2/18', {
	parser : 'Julian'
}).getTime();
('0001/1/1'.to_Date('CE')-Kali_epoch)/86400000

'0001/1/1'.to_Date('CE').to_Hindu({era:'Saka'})
'0300/1/1'.to_Date('CE').to_Hindu({era:'Saka'})
for(d=new Date(-1,0,1).getTime();d<new Date();d+=86400000)new Date(d).to_Hindu({era:'Saka'})

s=new Date;for(d=new Date(1600,0,1).getTime();d<new Date();d+=86400000)new Date(d).to_Hindu({era:'Saka'});new Date-s;

?? 1315. October 8 to November 5 were Kārtika Adhika-Māsa. November 6 to December 5 were Kārtika-Mārgaśīrṣa Kṣaya-Māsa. December 6 onwards was Pauṣa.
'1315/10/8'.to_Date('CE').to_Hindu({era:'Saka'})

*/

/*

CeL.Hindu_Date.test(15e5, 2e6, 4).join('\n') || 'OK';
CeL.Hindu_Date(4115,'Adhika 1',1)
CeL.Hindu_Date(4124,'Adhika 2',1)
CeL.Hindu_Date(4134,'8-9',1)
// 1455/1/19
new Date(-16249536000000).to_Hindu()


CeL.Hindu_Date.test(1969867, 1969868, 4).join('\n') || 'OK';
// Hindu_Date(5393,2,1): 無法找到準確值: 日期或 transit 錯誤。 transit: 2, get 1
CeL.Hindu_Date(5393,2,1)


new Date(-25541942400000).to_Hindu()


CeL.Hindu_Date.test(2574530, 4e6, 4).join('\n') || 'OK';
new Date(3947,11,26).to_Hindu()
new Date(62416454400000).to_Hindu()

CeL.Hindu_Date.test(-2e4, 4e6, 4).join('\n') || 'OK';
// "OK"
// 564259 ms, error 0/4

*/
Hindu_Date.test = new_tester(Date_to_Hindu, Hindu_Date, {
	epoch : Kali_epoch,
	month_serial : function(date_name) {
		return (Hindu_Date(date_name[0], date_name[1], 1)
		// 計算月份差距。
		- Hindu_Date(date_name[0], 1, 1))
		// 29 <= 最小月份日數，但又不致跳月。
		/ 29 / ONE_DAY_LENGTH_VALUE | 0;
	},
	continued_month : function(month, old_month) {
		if (typeof old_month === 'string')
			if (old_month.startsWith(Hindu_leap_prefix))
				return month === +old_month.slice(Hindu_leap_prefix.length);
		return month === 1 && (old_month === 12 || old_month === 13);
	}
});



//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// 長曆: भारतीय राष्ट्रीय पंचांग / Indian national calendar / Saka calendar / 印度國定曆
// https://en.wikipedia.org/wiki/Indian_national_calendar

// Years are counted in the Saka Era, which starts its year 0 in the year 78 of the Common Era.
// epochal year of 78 CE
var Saka_epochal_year = 78 | 0,
// 前六個月日數。
Indian_national_6_months_days = 6 * 31 | 0,
// Indian_national_month_name[month_serial] = month name
Indian_national_month_name = '|Chaitra|Vaishākha|Jyaishtha|Āshādha|Shrāvana|Bhādrapada|Āshwin|Kārtika|Agrahayana|Pausha|Māgha|Phālguna'.split('|');

function Indian_national_Date(year, month, date) {
	// has year 0

	year += Saka_epochal_year;
	// 預設當作閏年，3/21 起 Indian_national_6_months_days 日 + 6*30日。
	if (--month > 0
	// 則只有平年一月份需特別處理。
	|| is_leap_year(year))
		date--;
	date += month < 6 ? 31 * month : Indian_national_6_months_days + 30
			* (month - 6);

	return _Date(year, 3 - 1, 21 + date);
}

// Usage officially started at Chaitra 1, 1879 Saka Era, or March 22, 1957.
Indian_national_Date.epoch = _Date(Saka_epochal_year, 3 - 1, 22).getTime();

Indian_national_Date.is_leap = function(year) {
	return is_leap_year(Saka_epochal_year + year);
};

Indian_national_Date.month_name = function(month_serial) {
	return Indian_national_month_name[month_serial];
};


function Date_to_Indian_national(date, options) {
	var year = date.getFullYear() | 0, month = date.getMonth() | 0, days;

	if (month < 3 - 1 || month === 3 - 1 && ((days = date.getDate()) < 21
	// 3/20 or 3/21 (平年) 與之前，起始點算在前一年。
	// In leap years, Chaitra has 31 days and starts on March 21 instead.
	|| days === 21 && !is_leap_year(year)))
		year--;

	days = (date - _Date(year, 3 - 1, 21)) / ONE_DAY_LENGTH_VALUE | 0;
	// assert : days >= 0

	if (days >= Indian_national_6_months_days)
		days -= Indian_national_6_months_days,
		//
		month = 6 + days / 30 | 0, days %= 30;

	else if ((month = days / 31 | 0) > 0)
		days %= 31;
	else if (!is_leap_year(year))
		days--;

	// 日期序數→日期名。year/month/date index to serial.
	return _format([ year - Saka_epochal_year, month + 1, days + 1 ], options,
			Date_to_Indian_national.to_name);
}

Date_to_Indian_national.to_name = [ library_namespace.to_Devanagari_numeral,
		Indian_national_Date.month_name,
		library_namespace.to_Devanagari_numeral ];

/*

CeL.Indian_national_Date.test(-2e4, 4e6, 4).join('\n') || 'OK';
// "OK"

'0078/3/24'.to_Date().to_Indian_national()
// [0, 1, 3]

*/
Indian_national_Date.test = new_tester(Date_to_Indian_national,
		Indian_national_Date, {
			month_days : {
				31 : 'first 6 months',
				30 : 'last 6 months'
			}
		});


_.Indian_national_Date = Indian_national_Date;


//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// 長曆: 現行孟加拉曆
// The Bengali Calendar or Bangla Calendar (বঙ্গাব্দ Bônggabdô or Banggabda) (New revised tropical version - Bangladesh)
// https://en.wikipedia.org/wiki/Bengali_calendar
// http://www.pallab.com/services/bangladateconverter.aspx

// TODO:
// traditional unrevised Bangla calendar 現行於 West Bengal，聽說 "Bangla Panjikas according to Surya Siddhanta"，但未詳述計算方法。
// http://www.ponjika.com/pBosor.aspx
// http://usingha.com/1.html

// epochal year
// the starting date: 14 April 594 CE
var Bangla_epochal_year = 594 - 1 | 0,
// normalized string. e.g., 'আষাঢ়'.normalize() === 'আষাঢ়'
Bangla_month_name = '|Bôishakh (বৈশাখ)|Jyôishţhô (জ্যৈষ্ঠ)|Ashaŗh (আষাঢ়)|Shrabôn (শ্রাবণ)|Bhadrô (ভাদ্র)|Ashbin (আশ্বিন)|Kartik (কার্তিক)|Ôgrôhayôn (অগ্রহায়ণ)|Poush (পৌষ)|Magh (মাঘ)|Falgun (ফাল্গুন)|Chôitrô (চৈত্র)'
		.split('|'),
// 0: Sunday.
Bangla_weekday_name = 'Rôbibar (রবিবার)|Sombar (সোমবার)|Mônggôlbar (মঙ্গলবার)|Budhbar (বুধবার)|Brihôspôtibar (বৃহস্পতিবার)|Shukrôbar (শুক্রবার)|Shônibar (শনিবার)'
		.split('|');

function Bangla_Date(year, month, date, options) {
	// has year 0

	// according to the revised version of the calendar, now followed in
	// Bangladesh, Pôhela Bôishakh always falls on 14 April.
	year += Bangla_epochal_year;
	date = 14 + Math.min(5, --month) + month * 30 + date - 1;
	if (month === 11 && library_namespace.is_leap_year(year + 1))
		// 為閏年。
		date++;

	if (year < 100 && year >= 0)
		(date = new Date(0, 0)).setFullYear(year, 4 - 1, date);
	else
		date = new Date(year, 4 - 1, date);

	return date;
}

_.Bangla_Date = Bangla_Date;

Bangla_Date.month_name = function(month_serial) {
	return Bangla_month_name[month_serial];
};

Bangla_Date.weekday_name = function(weekday_serial) {
	return Bangla_weekday_name[weekday_serial];
};


// Date.parse 不會比 new Date 快 @ Chrome/45.0.2427.7
function to_date_value(year, month, date) {
	if (year < 100 && year > 0)
		// assert: new Date(Date.parse('0001-01-01')).format() === 1/1/1
		return Date.parse((year < 10 ? '000' : '00') + year + '-'
				+ (month < 10 ? '0' + month : month) + '-'
				+ (date < 10 ? '0' + date : date));
	return Date.parse(year + '/' + month + '/' + date);
}


function Date_to_Bangla(date, options) {
	var _year = date.getFullYear(), year = _year, month = date.getMonth();
	if (month <= 4 - 1 &&
	//
	(month < 4 - 1 || date.getDate() < 14))
		// 取上一年的 4/14，使 days >= 0
		year--;
	// Date.parse 不會比 new Date 快 @ Chrome/45.0.2427.7
	var days = (date - new Date(year, 4 - 1, 14)) / ONE_DAY_LENGTH_VALUE;
	// assert: days >= 0
	if (days < 5 * 31) {
		month = days / 31 | 0;
		days %= 31;
	} else {
		days -= 5 * 31;
		month = 5 + days / 30 | 0;
		days %= 30;
		if (month >= 11 && library_namespace.is_leap_year(_year)
		// 是否為 11/31 或 12/30?
		&& --days < 0) {
			// is 11/31?
			days = --month === 10 ? 30 : 29;
		}
	}

	date = [ year - Bangla_epochal_year, month + 1, (days | 0) + 1,
			date.getDay() ];
	if (days %= 1)
		date.push(days);

	// 日期序數→日期名。year/month/date index to serial.
	return _format(date, options, Date_to_Bangla.to_name);
}

Date_to_Bangla.to_name = [ library_namespace.to_Bangla_numeral,
		Bangla_Date.month_name, library_namespace.to_Bangla_numeral,
		Bangla_Date.weekday_name ];

/*

new Date('540/1/12').to_Bangla({format : 'serial'})
CeL.Bangla_Date(-54, 9, 28).format()
new Date('540/1/14').to_Bangla({format : 'serial'})

new Date('540/3/11').to_Bangla({format : 'serial'})
new Date('540/3/13').to_Bangla({format : 'serial'})
new Date('540/4/13').to_Bangla({format : 'serial'})

CeL.Bangla_Date.test(-2e4, 4e6, 4).join('\n') || 'OK';
// "OK"

*/
Bangla_Date.test = new_tester(Date_to_Bangla, Bangla_Date, {
	epoch : new Date(Bangla_epochal_year + 1, 4 - 1, 14),
	month_days : {
		31 : 'first 5 months or leap month',
		30 : 'last 7 months'
	}
});


// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

/**
 * 長曆: 1941/1/1 CE (พ.ศ. 2484) 起的泰國佛曆元旦是每年(CE) 1/1。
 * 1889/4/1 (พ.ศ. 2432)  起泰國元旦是每年(CE) 4/1。這之前泰國元旦是每年陰曆五月初五，應落在 CE:3,4月。
 * @see https://en.wikipedia.org/wiki/Thai_solar_calendar
 * @see https://th.wikipedia.org/wiki/%E0%B8%9B%E0%B8%8F%E0%B8%B4%E0%B8%97%E0%B8%B4%E0%B8%99%E0%B9%84%E0%B8%97%E0%B8%A2
 * @see https://th.wikipedia.org/wiki/%E0%B8%9B%E0%B8%8F%E0%B8%B4%E0%B8%97%E0%B8%B4%E0%B8%99%E0%B8%AA%E0%B8%B8%E0%B8%A3%E0%B8%B4%E0%B8%A2%E0%B8%84%E0%B8%95%E0%B8%B4%E0%B9%84%E0%B8%97%E0%B8%A2
 * @see https://th.wikipedia.org/wiki/%E0%B8%AA%E0%B8%96%E0%B8%B2%E0%B8%99%E0%B8%B5%E0%B8%A2%E0%B9%88%E0%B8%AD%E0%B8%A2:%E0%B9%80%E0%B8%AB%E0%B8%95%E0%B8%B8%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%93%E0%B9%8C%E0%B8%9B%E0%B8%B1%E0%B8%88%E0%B8%88%E0%B8%B8%E0%B8%9A%E0%B8%B1%E0%B8%99
 */

var Thai_lunar, Thai_epochal_year = -543 | 0;

function Date_to_Thai(date, month, year, options) {
	if (typeof month === 'object') {
		options = month;
	} else {
		options = Object.create(null);
	}
	var _Date, weekday = options.weekday;
	// normalize date
	if (library_namespace.is_Date(date)) {
		_Date = date;
		weekday = date.getDay();
		// month start from 0.
		month = date.getMonth() + 1;
		// http://www.wat.austhai.biz/Home/thai-calendar
		// http://www.myhora.com/%E0%B8%9B%E0%B8%8F%E0%B8%B4%E0%B8%97%E0%B8%B4%E0%B8%99/
		year = date.getFullYear();
		date = date.getDate();
	}

	var use_Thai_lunar = (year < 1889 || year === 1889 && month < 4)
	//
	&& (Thai_lunar || (Thai_lunar = library_namespace.era(
	//
	'ปฏิทินจันทรคติไทย', {
		get_era : true
	}))), 準, holidays = [];
	if (use_Thai_lunar) {
		if ((_Date || (_Date = new Date(year, month - 1, date)))
				- Thai_lunar.start < 0)
			準 = '年';
	} else if (year < 1889) {
		準 = '年';
	}
	if (use_Thai_lunar && !準
	//
	&& (use_Thai_lunar = Thai_lunar.Date_to_date_index(_Date))) {
		// @see 光緒15年3月
		date = Thai_lunar.日名(use_Thai_lunar[2], use_Thai_lunar[1],
				use_Thai_lunar[0]);
		year = date[2];
		month = date[1];
		date = date[0];
		if (month < 5 || month === 5 && date < 5) {
			// 這之前泰國元旦是每年陰曆五月初五，應落在 CE:3,4月。
			year--;
		} else if (month === 5 && date === 5) {
			// 新年
			holidays.push('วันขึ้นปีใหม่');
		}

	} else if (year < 1941) {
		// @see 中曆1939年11月, 中曆1940年2月, 中曆1940年12月
		// 月份不動，按照公元的排。
		if (month < 4) {
			year -= Thai_epochal_year + 1;
		} else {
			if (year >= 1889 && month === 4 && date === 1) {
				holidays.push('วันขึ้นปีใหม่');
			}
			year -= Thai_epochal_year;
		}

	} else {
		// 1941/1/1 CE (พ.ศ. 2484) 起
		year -= Thai_epochal_year;
		if (month === 1 && date === 1) {
			// 1941/1/1 CE (พ.ศ. 2484) 起的泰國佛曆元旦是每年(CE) 1/1。
			holidays.push('วันขึ้นปีใหม่');
		} else if (month === 4 && 13 <=date && date <= 15) {
			// 潑水節
			holidays.push('สงกรานต์');
		} 
	}

	if (options.format === 'serial') {
		date = [ year, month, date ];
		if (use_Thai_lunar) {
			date.is_lunar = true;
		}
		if (準) {
			date.準 = 準;
		}
		if (year > 0) {
			date.生肖 = library_namespace.十二生肖_LIST[(year + 5).mod(12)];
		}
		if (holidays.length > 0) {
			date.holidays = holidays;
		}
		return date;
	}

	if (use_Thai_lunar) {
		// https://th.wikipedia.org/wiki/%E0%B8%9B%E0%B8%8F%E0%B8%B4%E0%B8%97%E0%B8%B4%E0%B8%99%E0%B9%84%E0%B8%97%E0%B9%80%E0%B8%94%E0%B8%B4%E0%B8%A1
		date = [
				date > 0 ? (date > 15 ? 'วันขึ้น' : 'วันแรม')
						+ library_namespace.to_Thai_numeral(date % 15) : '',
				month === '雙8' ? 'เดือนแปดหลัง(๘-๘)'
				// ↑ 'เดือนแปดหลัง' = เดือน แปด หลัง or "เดือน 8 หลัง"
				// or "๘๘" or "๘-๘" or "กำลังสร้าง เดือน ๘"
				: (month = Date_to_Thai.lunar_month_name[month]) ? 'เดือน'
						+ month + '('
						+ library_namespace.to_Thai_numeral(month) + ')' : '',
				year > 0 ? 'ปี' + Date_to_Thai.year_name[(year + 5).mod(12)]
						: '' ];
		// date.unshift('ตรงกับ');

	} else {
		date = [
				(weekday = Date_to_Thai.weekday_name[weekday]) ? 'วัน'
						+ weekday : '', date || '',
				Date_to_Thai.month_name[month] || '', year || '' ];

		if (date[0] && (date[1] || date[2] || date[3])) {
			date[0] += 'ที่';
		}

		if (!date[2] && !isNaN(date[3])) {
			// year only?
			// add 佛滅紀元 พุทธศักราช
			date[3] = 'พ.ศ. ' + date[3];
		}
	}

	return date.filter(function(n) {
		return n;
	}).join(' ');
}


// ปีนักษัตร
Date_to_Thai.year_name = 'ชวด|ฉลู|ขาล|เถาะ|มะโรง|มะเส็ง|มะเมีย|มะแม|วอก|ระกา|จอ|กุน'
	.split('|');

// start from 1.
Date_to_Thai.month_name = '|มกราคม|กุมภาพันธ์|มีนาคม|เมษายน|พฤษภาคม|มิถุนายน|กรกฎาคม|สิงหาคม|กันยายน|ตุลาคม|พฤศจิกายน|ธันวาคม'
	.split('|');
Date_to_Thai.lunar_month_name = '|อ้าย|ยี่|สาม|สี่|ห้า|หก|เจ็ด|แปด|เก้า|สิบ|สิบเอ็ด|สิบสอง'
	.split('|');

// 0: Sunday.
Date_to_Thai.weekday_name = 'อาทิตย์|จันทร์|อังคาร|พุธ|พฤหัสบดี|ศุกร์|เสาร์'
		.split('|');

Date_to_Thai.weekday_color = 'red|yellow|pink|green|orange|blue|purple'.split('|');
Date_to_Thai.weekday_bgcolor = 'red|yellow|pink|#0d0|orange|#88f|#d0d'.split('|');

_.Date_to_Thai = Date_to_Thai;

// -------------------------------------

//e.g., new Date(1935,3,4).format({parser:'Thai'})
//e.g., new Date(1935,3,4).format('Thai')
function Thai_parser(date_value, format, locale, options) {
	var Thai_date = Date_to_Thai(date_value, {
		format : 'serial'
	});
	return library_namespace.parse_escape(format || Thai_parser.default_format, function(s) {
		return s.replace(/%([Ymd])/g, function(all, s) {
			s = Thai_parser.convertor[s];
			return typeof s === 'function' ? s(date_value) : Thai_date[s] || all;
		});
	});
};

Thai_parser.default_format = '%Y/%m/%d';
Thai_parser.convertor = {
		Y :	0,
		m :	1,
		d :	2
};

// 註冊parser以供泰國君主使用。
library_namespace.Date_to_String.parser.Thai = Thai_parser;


//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// 長曆: "تقویم بهائی" / "گاه‌شماری بهائی" / 巴哈伊曆法 / Bahá'í calendar / Badí‘ calendar
// https://en.wikipedia.org/wiki/Bah%C3%A1'%C3%AD_calendar
// http://www.bahai.us/welcome/principles-and-practices/bahai-calendar/
// http://bahaical.org/default.aspx?ln=fa


// month (Bahai_Ha): month serial of Ayyám-i-Há (intercalary days)
// assert: Bahai_Ha != 1, 2, 3, .. 19.
var Bahai_Ha = -1 | 0,
// start hour of day: -6.
Bahai_start_hour_of_day = -6 | 0,
// i.e., 18:0
Bahai_start_hour_of_day_non_negative = (Bahai_start_hour_of_day % ONE_DAY_HOURS + ONE_DAY_HOURS)
		% ONE_DAY_HOURS | 0,
// 1844 CE
Bahai_epochal_year = 1844 | 0,
//
Bahai_year_months = 19 | 0,
//
Bahai_Vahid_years = 19 | 0, Bahai_Kull_i_Shay_years = 19 * Bahai_Vahid_years | 0,
// Years in a Váḥid
Bahai_year_name = "Alif|Bá’|Ab|Dál|Báb|Váv|Abad|Jád|Bahá'|Ḥubb|Bahháj|Javáb|Aḥad|Vahháb|Vidád|Badí‘|Bahí|Abhá|Váḥid".split('|'),
// Bahai_month_name[month_serial] = month name
// the days of the month have the same names as the names of the month
Bahai_month_name = '|Bahá|Jalál|Jamál|‘Aẓamat|Núr|Raḥmat|Kalimát|Kamál|Asmá’|‘Izzat|Mashíyyat|‘Ilm|Qudrat|Qawl|Masá’il|Sharaf|Sulṭán|Mulk|‘Alá’'.split('|');
Bahai_month_name[Bahai_Ha] = 'Ayyám-i-Há';

function Bahai_Date(year, month, date) {
	if (month == Bahai_year_months)
		month = 0, year++;
	else if (month == Bahai_Ha)
		month = Bahai_year_months;

	date = new Date(_Date(Bahai_epochal_year - 1 + year, 3 - 1, 2
	// , Bahai_start_hour_of_day
	).getTime() + (month * Bahai_year_months + date - 1)
			* ONE_DAY_LENGTH_VALUE);

	return date;
}

// 1844/3/21
Bahai_Date.epoch = new Date(Bahai_epochal_year, 3 - 1, 21).getTime();

Bahai_Date.month_name = function(month_serial) {
	return Bahai_month_name[month_serial];
};

// return [ Kull-i-Shay’, Váḥid, Bahá'í year ]
Bahai_Date.Vahid = function(year, numerical) {
	var Kull_i_Shay = Math.floor(--year / Bahai_Kull_i_Shay_years) + 1 | 0, Vahid = year
			% Bahai_Kull_i_Shay_years | 0;
	// 轉正。保證變數值非負數。
	if (Vahid < 0)
		Vahid += Bahai_Kull_i_Shay_years;
	year = Vahid % Bahai_Vahid_years | 0;
	return [ Kull_i_Shay, (Vahid / Bahai_Vahid_years | 0) + 1,
			numerical ? year + 1 : Bahai_year_name[year] ];
};


function Date_to_Bahai(date, options) {
	var year = date.getFullYear(), month = date.getMonth(), days, delta;

	if (month < 3 - 1 || month === 3 - 1 && date.getDate() === 1
			&& date.getHours() < Bahai_start_hour_of_day_non_negative)
		// 3/1 18: 之前，起始點算在前一年。
		year--;

	days = (date - _Date(year, 3 - 1, 2, Bahai_start_hour_of_day))
			/ ONE_DAY_LENGTH_VALUE;
	// assert: days>=0
	delta = days % 1;
	month = (days |= 0) / Bahai_year_months | 0;
	days %= Bahai_year_months;
	if (month === 0)
		// ‘Alá’
		month = Bahai_year_months, year--;
	else if (month === Bahai_year_months)
		month = Bahai_Ha;

	// 前置處理。
	if (!library_namespace.is_Object(options))
		options = Object.create(null);

	// 日期序數→日期名。year/month/date index to serial.
	year -= Bahai_epochal_year - 1;
	date = options.single_year ? [ year ] : Bahai_Date.Vahid(year,
			options.numerical_date || options.format === 'serial');
	++days;
	if (options.format !== 'serial') {
		days = Bahai_Date.month_name(days);
		month = Bahai_Date.month_name(month);
	}
	date.push(month, days, delta);
	if (options.format !== 'serial' && options.format !== 'item') {
		// popup delta.
		date.pop();
		date = date.reverse().join(' ');
	}

	return date;
}



/*

CeL.Bahai_Date.test(-2e4, 4e6, 4).join('\n') || 'OK';
// "OK"

'1845/3/2'.to_Date('CE').to_Bahai({single_year : true})
// -1/6/29

*/
Bahai_Date.test = new_tester(Date_to_Bahai, Bahai_Date, {
	month_days : {
		19 : 'common month',
		4 : 'intercalary month',
		5 : 'intercalary month + intercalary day'
	},
	continued_month : function(month, old_month) {
		return old_month === Bahai_year_months && month === 1
				|| old_month === Bahai_year_months - 1 && month === Bahai_Ha
				|| old_month === Bahai_Ha && month === Bahai_year_months;
	},
	CE_format : {
		parser : 'CE',
		format : '%Y/%m/%d %H: CE'
	},
	single_year : true
});


_.Bahai_Date = Bahai_Date;


//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// 長曆: 科普特曆 / Coptic calendar / Alexandrian calendar
// 埃及東正教仍然在使用。
// Egyptian calendar → Era of Martyrs (Diocletian era) = Coptic calendar

// http://orthodoxwiki.org/Coptic_calendar
// Egypt used the Coptic Calendar till the Khedive Ismael adopted the Western Gregorian Calendar in the nineteenth century and applied it in Egypt's government departments.
// The Coptic calendar has 13 months, 12 of 30 days each and an intercalary month at the end of the year of 5 or 6 days, depending whether the year is a leap year or not. The year starts on 29 August in the Julian Calendar or on the 30th in the year before (Julian) Leap Years. The Coptic Leap Year follows the same rules as the Julian Calendar so that the extra month always has six days in the year before a Julian Leap Year.
// The Feast of Neyrouz marks the first day of the Coptic year. Its celebration falls on the 1st day of the month of Thout, the first month of the Coptic year, which for AD 1901 to 2098 usually coincides with 11 September, except before a Gregorian leap year when it's September 12. Coptic years are counted from AD 284, the year Diocletian became Roman Emperor, whose reign was marked by tortures and mass executions of Christians, especially in Egypt. Hence, the Coptic year is identified by the abbreviation A.M. (for Anno Martyrum or "Year of the Martyrs"). The A.M. abbreviation is also used for the unrelated Jewish year (Anno Mundi).
// To obtain the Coptic year number, subtract from the Julian year number either 283 (before the Julian new year) or 284 (after it).
// http://orthodoxwiki.org/Calendar

// https://en.wikipedia.org/wiki/Era_of_Martyrs
// The Era of the Martyrs (Latin: anno martyrum or AM), also known as the Diocletian era (Latin: anno Diocletiani), is a method of numbering years used by the Church of Alexandria beginning in the 4th century anno Domini and by the Coptic Orthodox Church of Alexandria from the 5th century to the present.

var Coptic_common_month = 30,
//
Coptic_common_year_days = 12 * Coptic_common_month + 5 | 0,
// Coptic 4 year cycle days.
Coptic_cycle_days = 4 * Coptic_common_year_days + 1 | 0,
//
Coptic_month_name = '|Thout|Paopi|Hathor|Koiak|Tobi|Meshir|Paremhat|Paremoude|Pashons|Paoni|Epip|Mesori|Pi Kogi Enavot'
		.split('|');

function Coptic_Date(year, month, date, get_days, year_0) {
	// no year 0. year: -1 → 0
	if (year < 0 && !year_0)
		year++;

	var days = Math.floor(--year / 4) * Coptic_cycle_days | 0;
	// 轉正。保證變數值非負數。
	if ((year %= 4) < 0)
		year += 4;
	days += year * Coptic_common_year_days | 0;
	// all days @ year 3 of the cycle (0–3) needs to add 1 day for the
	// intercalary day of year 3.
	if (year === 3)
		days++;

	days += (month - 1) * Coptic_common_month + date - 1 | 0;
	return get_days ? days : new Date(Coptic_Date.epoch + days
			* ONE_DAY_LENGTH_VALUE);
}

// year 1/1/1 begins on 284/8/29.
// year 0/1/1 begins on 283/8/30.
// the Coptic_Date.epoch is Coptic 1/1/1!
Coptic_Date.epoch = String_to_Date('284/8/29', {
	parser : 'Julian'
}).getTime();

// leap year: 3, 3+4, 3+8, ..
// e.g., year 3: 286/8/29–287/8/29 CE, 366 days.
Coptic_Date.is_leap = function(year) {
	// 轉正。保證變數值非負數。
	if ((year %= 4) < 0)
		year += 4;
	return year === 3;
};

Coptic_Date.month_name = function(month) {
	return Coptic_month_name[month];
};


function Date_to_Coptic(date, options) {
	var days = Math.floor((date - Coptic_Date.epoch) / ONE_DAY_LENGTH_VALUE) | 0,
	//
	year = Math.floor(days / Coptic_cycle_days) * 4 + 1 | 0,
	//
	month = 3 * Coptic_common_year_days | 0;
	// 轉正。保證變數值非負數。
	if ((days %= Coptic_cycle_days) < 0)
		days += Coptic_cycle_days;

	if (days === month)
		// (3+4k)/13/6.
		// e.g., 287/8/29
		year += 2, month = 12, date = 5;
	else {
		if (days < month) {
			month = days / Coptic_common_year_days | 0;
			year += month;
			days -= month * Coptic_common_year_days;
		} else
			year += 3, days -= month + 1;

		month = days / Coptic_common_month | 0;
		date = days % Coptic_common_month;
	}

	// 日期序數→日期名。year/month/date index to serial.
	if (year <= 0 && (!options || !options.year_0))
		// year: 0 → -1
		--year;

	return _format([ year, month + 1, date + 1 ], options,
			Coptic_Date.month_name);
}


/*

CeL.Coptic_Date.test(-2e4, 4e6, 4).join('\n') || 'OK';
// "OK"

*/
Coptic_Date.test = new_tester(Date_to_Coptic, Coptic_Date, {
	month_days : {
		30 : 'common month',
		5 : 'intercalary month',
		6 : 'intercalary month + intercalary day'
	}
});


_.Coptic_Date = Coptic_Date;


//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// 長曆: የኢትዮጵያ ዘመን አቆጣጠር / 衣索比亞曆 / 埃塞俄比亚历 / Ethiopian calendar
// https://am.wikipedia.org/wiki/%E1%8B%A8%E1%8A%A2%E1%89%B5%E1%8B%AE%E1%8C%B5%E1%8B%AB_%E1%8B%98%E1%88%98%E1%8A%95_%E1%8A%A0%E1%89%86%E1%8C%A3%E1%8C%A0%E1%88%AD
// The Ethiopian months begin on the same days as those of the Coptic calendar, but their names are in Ge'ez.
// http://www.ethiopiancalendar.net/


function Ethiopian_Date(year, month, date, year_0) {
	// no year 0. year: -1 → 0
	if (year < 0 && !year_0)
		year++;

	year += Ethiopian_year_to_Coptic;

	return Coptic_Date(year, month, date, false, true);
}

// year 1/1/1 begins on 8/8/29.
// Ethiopians and followers of the Eritrean churches today use the Incarnation Era, which dates from the Annunciation or Incarnation of Jesus on March 25 of 9 AD (Julian), as calculated by Annianus of Alexandria c. 400; thus its first civil year began seven months earlier on August 29, 8 AD. Meanwhile, Europeans eventually adopted the calculations made by Dionysius Exiguus in 525 AD instead, which placed the Annunciation eight years earlier than had Annianus.
Ethiopian_Date.epoch = String_to_Date('008/8/29', {
	parser : 'Julian'
}).getTime();

var Ethiopian_year_to_Coptic = (new Date(Ethiopian_Date.epoch)).getFullYear()
		- (new Date(Coptic_Date.epoch)).getFullYear(),
//
Ethiopian_month_name = '|Mäskäräm (መስከረም)|Ṭəqəmt(i) (ጥቅምት)|Ḫədar (ኅዳር)|Taḫśaś ( ታኅሣሥ)|Ṭərr(i) (ጥር)|Yäkatit (Tn. Läkatit) (የካቲት)|Mägabit (መጋቢት)|Miyazya (ሚያዝያ)|Gənbot (ግንቦት)|Säne (ሰኔ)|Ḥamle (ሐምሌ)|Nähase (ነሐሴ)|Ṗagʷəmen/Ṗagume (ጳጐሜን/ጳጉሜ)'
		.split('|');

Ethiopian_Date.month_name = function(month) {
	return Ethiopian_month_name[month];
};


function Date_to_Ethiopian(date, options) {
	date = Date_to_Coptic(date, {
		format : 'serial',
		year_0 : true
	});
	date[0] -= Ethiopian_year_to_Coptic;

	// 日期序數→日期名。year/month/date index to serial.
	if (date[0] <= 0 && (!options || !options.year_0))
		// year: 0 → -1
		--date[0];

	return _format(date, options, Ethiopian_Date.month_name);
}



/*

CeL.Ethiopian_Date.test(-2e4, 4e6, 4).join('\n') || 'OK';
// "OK"

*/
Ethiopian_Date.test = new_tester(Date_to_Ethiopian, Ethiopian_Date, {
	month_days : {
		30 : 'common month',
		5 : 'intercalary month',
		6 : 'intercalary month + intercalary day'
	}
});


_.Ethiopian_Date = Ethiopian_Date;


//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// Հայկական եկեղեցական տոմար, 教會亞美尼亞曆法, Armenian calendar
// https://hy.wikipedia.org/wiki/%D5%80%D5%A1%D5%B5%D5%AF%D5%A1%D5%AF%D5%A1%D5%B6_%D5%A5%D5%AF%D5%A5%D5%B2%D5%A5%D6%81%D5%A1%D5%AF%D5%A1%D5%B6_%D5%BF%D5%B8%D5%B4%D5%A1%D6%80

// Հայկյան տոմար, 傳統/古亞美尼亞曆法
// https://hy.wikipedia.org/wiki/%D5%80%D5%A1%D5%B5%D5%AF%D5%B5%D5%A1%D5%B6_%D5%BF%D5%B8%D5%B4%D5%A1%D6%80
// http://haytomar.com/index.php?l=am
// http://www.anunner.com/grigor.brutyan/ՀԱՅԿԱԿԱՆ_ՕՐԱՑՈՒՅՑԸ_ԻՐ_ՍԿԶԲՆԱՒՈՐՈՒՄԻՑ_ՄԻՆՉԵՎ_ՄԵՐ_ՕՐԵՐԸ_(համառօտ_ակնարկ)

// 每月天數。
var Armenian_MONTH_DAYS = 30,
// 一年12個月。
Armenian_MONTH_COUNT = 12,
// Epagomenal days
Armenian_Epagomenal_days = 5,
// 365-day year with no leap year
Armenian_year_days = Armenian_MONTH_COUNT * Armenian_MONTH_DAYS + Armenian_Epagomenal_days,
// ամիս
Armenian_month_name = 'Նավասարդի|Հոռի|Սահմի|Տրե|Քաղոց|Արաց|Մեհեկան|Արեգի|Ահեկի|Մարերի|Մարգաց|Հրոտից|Ավելյաց'.split('|'),
// օր
Armenian_date_name = 'Արէգ|Հրանդ|Արամ|Մարգար|Ահրանք|Մազդեղ կամ Մազդեկան|Աստղիկ|Միհր|Ձոպաբեր|Մուրց|Երեզկան կամ Երեզհան|Անի|Պարխար|Վանատուր|Արամազդ|Մանի|Ասակ|Մասիս|Անահիտ|Արագած|Գրգուռ|Կորդուիք|Ծմակ|Լուսնակ|Ցրոն կամ Սփյուռ|Նպատ|Վահագն|Սիմ կամ Սեին|Վարագ|Գիշերավար'.split('|'),
//
Armenian_epagomenal_date_name = 'Լուծ|Եղջերու|Ծկրավորի|Արտախույր|Փառազնոտի'.split('|'),
// շաբատվա օր
Armenian_weekday_name = 'Արեգակի|Լուսնի|Հրատի|Փայլածուի|Լուսնթագի|Արուսյակի|Երևակի'.split('|'),
// 夜間時段 → 日間時段
// starts from 0:0 by http://haytomar.com/converter.php?l=am
Armenian_hour_name = 'Խաւարականն|Աղջամուղջն|Մթացեալն|Շաղաւոտն|Կամաւօտն|Բաւականն|Հաւթափեալն|Գիզկան|Լուսաճեմն|Առաւոտն|Լուսափայլն|Փայլածումն|Այգն|Ծայգն|Զօրացեալն|Ճառագայթեալն|Շառաւիղեալն|Երկրատեսն|Շանթակալն|Հրակաթն|Հուրթափեալն|Թաղանթեալն|Առաւարն|Արփողն'.split('|');

// Armenian year 1 began on 11 July AD 552 (Julian).
Armenian_Date.epoch = String_to_Date('552/7/11', {
	parser : 'Julian'
}).getTime();

function Armenian_Date(year, month, date) {
	// no year 0. year: -1 → 0
	if (year < 0)
		year++;

	return new Date(Armenian_Date.epoch + (
	// days from Armenian_Date.epoch.
	(year - 1) * Armenian_year_days
	//
	+ (month - 1) * Armenian_MONTH_DAYS
	//
	+ date - 1) * ONE_DAY_LENGTH_VALUE);
}


function Date_to_Armenian(date, options) {
	var days = (date - Armenian_Date.epoch) / ONE_DAY_LENGTH_VALUE,
	// տարի
	year = Math.floor(days / Armenian_year_days) + 1;
	// no year 0
	if (year < 1)
		year--;

	days = days.mod(Armenian_year_days);
	var month = days / Armenian_MONTH_DAYS | 0;
	days %= Armenian_MONTH_DAYS;

	days = [ year, month + 1, days + 1 | 0 ];

	if (options && options.format === 'name') {
		//days[0] = 'տարի ' + days[0];
		days[1] = Armenian_month_name[month];
		days[2] = (month > Armenian_MONTH_COUNT
		//
		? Armenian_epagomenal_date_name : Armenian_date_name)[days[2] - 1];
		days = days.join(' / ')
		// add weekday, շաբատվա օր.
		+ ', ' + Armenian_weekday_name[date.getDay()] + ' օր';
	}

	return days;
}


/*

CeL.Armenian_Date.test(-2e4, 4e6, 4).join('\n') || 'OK';
// "OK"

*/
Armenian_Date.test = new_tester(Date_to_Armenian, Armenian_Date, {
	month_days : {
		30 : 'common month 1–12',
		5 : 'Epagomenal days',
	}
});


_.Armenian_Date = Armenian_Date;





//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// Egyptian calendar, 古埃及曆法.
// ** 自 22 BCE 之後不改制。


// References:

/**
 * A Chronological Survey of Precisely Dated Demotic and Abnormal Hieratic
 * Sources, Version 1.0 (February 2007)
 * 
 * From year 21 of Ptolemy II Philadelphos until the very beginning of the reign
 * of Ptolemy V Epiphanes, a so-called financial calendar was in use
 * 
 * @see http://www.trismegistos.org/top.php
 */


// Date Converter for Ancient Egypt
// http://aegyptologie.online-resourcen.de/Date_converter_for_Ancient_Egypt


// https://en.wikipedia.org/wiki/Egyptian_calendar#Ptolemaic_and_Roman_calendar
// According to Roman writer Censorinus (3rd century AD), the Egyptian New Year's Day fell on July 20 in the Julian Calendar in 139 CE, which was a heliacal rising of Sirius in Egypt.
// In 238 BCE, the Ptolemaic rulers decreed that every 4th year should be 366 days long rather than 365 (the so-called Canopic reform). The Egyptians, most of whom were farmers, did not accept the reform, as it was the agricultural seasons that made up their year. The reform eventually went into effect with the introduction of the "Alexandrian calendar" (or Julian calendar) by Augustus in 26/25 BCE, which included a 6th epagomenal day for the first time in 22 BCE. This almost stopped the movement of the first day of the year, 1 Thoth, relative to the seasons, leaving it on 29 August in the Julian calendar except in the year before a Julian leap year, when a 6th epagomenal day occurred on 29 August, shifting 1 Thoth to 30 August.
Egyptian_Date.epoch = String_to_Date('139/7/20', {
	parser : 'Julian'
});

var Egyptian_epochal_year = Egyptian_Date.epoch.getFullYear() | 0,
// 開始 reform 之閏年 (no year 0)。22 BCE, Egyptian year -23 (shift 0)
// +1: no year 0.
// = -22
Egyptian_reform_year = -23 + 1,
// the reform epochal year of Egyptian calendar (no year 0).
// 自此年 (Egyptian year, shift 0) 起計算，第四年年末為第一個閏年。
// = -25 (-25/8/29)
Egyptian_reform_epochal_year = Egyptian_reform_year - 4 + 1,
//
Egyptian_reform_epoch,
//
Egyptian_month_days = 30,
//
Egyptian_year_days = 12 * Egyptian_month_days + 5,
//
Egyptian_year_circle = 4,
// additional 1 day every Egyptian_year_circle years
Egyptian_reform_year_days = Egyptian_year_days + 1 / Egyptian_year_circle


Egyptian_Date.epoch = Egyptian_Date.epoch.getTime();

// -1: adapt year 0.
// = -62903980800000
Egyptian_reform_epoch = Egyptian_Date(Egyptian_reform_epochal_year - 1, 1, 1, {
	shift : 0,
	no_reform : true,
	get_value : true
});


// -1: adapt year 0.
// = -26
Egyptian_Date.reform_epochal_year = Egyptian_reform_epochal_year - 1;

// [30,30,30,30,30,30,30,30,30,30,30,30,5]
Egyptian_Date.month_days = new Array(13).fill(0).map(function(v, index) {
	return index === 12 ? 5 : Egyptian_month_days;
});

Egyptian_Date.leap_month_days = Egyptian_Date.month_days.slice();
Egyptian_Date.leap_month_days[Egyptian_Date.leap_month_days.length - 1]++;



// 521 BCE 與之前應採 -1，520 BCE 之後採 0 則可幾近與 CE 同步。但 520+1460=1980 BCE 與之前應採 -2。
// https://en.wikipedia.org/wiki/Sothic_cycle
Egyptian_Date.default_shift = 0;

// https://en.wikipedia.org/wiki/Transliteration_of_Ancient_Egyptian
// https://en.wikipedia.org/wiki/Egyptian_hieroglyphs
Egyptian_Date.season_month = function(month) {
	var serial = month - 1, season = serial / 4 | 0;
	// Skip 5 epagomenal days.
	if (season = Egyptian_Date.season_name[season])
		return ((serial % 4) + 1) + ' ' + season;
	//return 'nꜣ hrw 5 n ḥb';
};

// https://en.wikipedia.org/wiki/Season_of_the_Inundation
Egyptian_Date.season_name = 'Akhet|Peret|Shemu'.split('|');

Egyptian_Date.month_name = function(month_serial) {
	return Egyptian_Date.month_name.Greek[month_serial];
};

// Latin script of Greek
Egyptian_Date.month_name.Greek = '|Thoth|Phaophi|Athyr|Choiak|Tybi|Mechir|Phamenoth|Pharmouthi|Pachon|Payni|Epiphi|Mesore|Epagomenai'
		.split('|');

// Latin script of Egyptian Arabic
Egyptian_Date.month_name.Egyptian_Arabic = '|توت|بابه|هاتور|(كياك (كيهك|طوبه|أمشير|برمهات|برموده|بشنس|بئونه|أبيب|مسرا|Epagomenai'
		.split('|');


/**
 * Egyptian calendar
 *
 * @param {Integer}year
 *            year of Egyptian calendar.
 * @param {Natural}month
 *            month of Egyptian calendar. for epagomenal day: 13.
 * @param {Natural}date
 *            date of Egyptian calendar.
 *
 * @returns {Date} system Date (proleptic Gregorian calendar with year 0)
 */
function Egyptian_Date(year, month, date, options) {
	// no year 0. year: -1 → 0
	if (year < 0)
		year++;

	// adapt shift.
	var shift = options ? options.shift : undefined;
	if (shift === undefined)
		shift = Egyptian_Date.default_shift;
	if (shift && !isNaN(shift))
		year += shift;

	// calculate days.
	date = (year - Egyptian_epochal_year) * Egyptian_year_days
	//
	+ (month ? (month - 1) * Egyptian_month_days : 0)
	//
	+ (date ? date - 1 : 0);

	if (year >= Egyptian_reform_year
	//
	&& (!options || !options.no_reform))
		date += Math.floor((year - Egyptian_reform_epochal_year) / Egyptian_year_circle);

	date = date * ONE_DAY_LENGTH_VALUE + Egyptian_Date.epoch;

	// is the latter year
	if (shift === true && (year = new Date(date).format({
		parser : 'CE',
		format : '%Y/%m/%d'
	}).match(/^(-?\d+)\/1\/1$/))
	//
	&& library_namespace.is_leap_year(year[1], 'CE'))
		date += Egyptian_year_days * ONE_DAY_LENGTH_VALUE;

	return options && options.get_value ? date : new Date(date);
}


_.Egyptian_Date = Egyptian_Date;




function Date_to_Egyptian(date, options) {
	var shift = options && ('shift' in options) && options.shift || Egyptian_Date.default_shift,
	//
	days = (date - Egyptian_Date.epoch) / ONE_DAY_LENGTH_VALUE,
	year = Math.floor(days / Egyptian_year_days) + Egyptian_epochal_year;

	if (year >= Egyptian_reform_year && (!options || !options.no_reform)) {
		// reformed. adapt reform days.
		days = (date - Egyptian_reform_epoch) / ONE_DAY_LENGTH_VALUE;
		// 計算有幾個 Egyptian_year_days
		year = Math.floor((days
		// 採用此方法可以直接用 (...) / Egyptian_reform_year_days 即得到年分。
		+ 1 - 1 / Egyptian_year_circle) / Egyptian_reform_year_days);
		// 取得年內日數。
		days -= Math.floor(year * Egyptian_reform_year_days);
		year += Egyptian_reform_epochal_year;
	} else {
		// 取得年內日數。
		days = days.mod(Egyptian_year_days);
	}

	// assert: days >= 0

	var month = days / Egyptian_month_days | 0;
	days = days.mod(Egyptian_month_days) + 1;

	if (!isNaN(shift))
		year -= shift;
	if (year <= 0)
		// year: 0 → -1
		year--;

	date = [ year, month + 1, days | 0 ];
	if (days %= 1)
		date.push(days);

	return _format(date, options, Egyptian_Date.month_name, null, true);
}


/*


CeL.Egyptian_Date(-726,1,1,-1).format('CE')
"-527/1/1".to_Date('CE').to_Egyptian({shift:-1})


CeL.Egyptian_Date(-727,1,1).format('CE')
'-726/2/21'.to_Date('CE').to_Egyptian({format:'serial'})

'-727'.to_Date('Egyptian').format('CE')
// "-726/2/21 0:0:0.000"

// OK
CeL.Egyptian_Date(-23,1,1).format('CE')
'-23/8/29'.to_Date('CE').to_Egyptian({format:'serial'})

CeL.Egyptian_Date(-22,1,1).format('CE')
'-22/8/30'.to_Date('CE').to_Egyptian({format:'serial'})


CeL.Egyptian_Date.test(new Date(-5000, 1, 1), 4e6, 4).join('\n') || 'OK';
// "OK"

*/
Egyptian_Date.test = new_tester(Date_to_Egyptian, Egyptian_Date, {
	month_days : {
		30 : 'common month 1–12',
		5 : 'Epagomenal days',
		6 : 'Epagomenal days (leap)'
	}
});


//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// The Byzantine Creation Era, also "Creation Era of Constantinople," or "Era of the World" (Greek: Έτη Γενέσεως Κόσμου κατά 'Ρωμαίους [1] also Έτος Κτίσεως Κόσμου or Έτος Κόσμου )
// http://orthodoxwiki.org/Byzantine_Creation_Era
// https://en.wikipedia.org/wiki/Byzantine_calendar
// https://en.wikipedia.org/wiki/Anno_Mundi

/*

the names of the months were transcribed from Latin into Greek,
the first day of the year was September 1, so that both the Ecclesiastical and Civil calendar years ran from 1 September to 31 August, (see Indiction), which to the present day is the Church year, and,
the date of creation, its year one, was September 1, 5509 BC to August 31, 5508 BC.

*/

var Byzantine_epochal_year = -5509,
// "Religions du Pont-Euxin : actes du VIIIe Symposium de Vani, Colchide, 1997" p87
//
// BASILICA The Official Newsletter of Byzantium Novum Issue #9 (May 2015)
// https://xa.yimg.com/kq/groups/9483617/384276876/name/Basilica+issue+9.pdf
Byzantine_month_name = '|Petagnicios|Dionisius|Eiclios|Artemesios|Licios|Bosporius|Iateos|Agrantos|Malatorus|Ereo|Carneios|Machanios'
	.split('|');

function Byzantine_Date(year, month, date) {
	// no year 0. year: -1 → 0
	if (year < 0)
		year++;

	// 9/1 起才是此年。
	if (month < 9)
		year++;

	// Byzantine calendar to Julian calendar
	year += Byzantine_epochal_year;

	return Julian_day.to_Date(Julian_day.from_YMD(year, month, date));

	return String_to_Date.parser.Julian(
	// slow~~
	year + '/' + month + '/' + date, undefined, {
		no_year_0 : false,
		year_padding : 0
	});
}

_.Byzantine_Date = Byzantine_Date;

Byzantine_Date.month_name = function(month_serial) {
	return Byzantine_month_name[month_serial];
};


function Date_to_Byzantine(date, options) {
	date = Julian_day.to_YMD(Julian_day(date));
	if (false)
		// slow~~
		date = library_namespace.Date_to_String.parser.Julian(date, '%Y/%m/%d', undefined, {
			no_year_0 : false
		}).split('/');

	date[0] -= Byzantine_epochal_year;
	if ((date[1] |= 0) < 9)
		date[0]--;
	// no year 0
	if (date[0] < 1)
		date[0]--;

	date[2] = +date[2];

	return _format(date, options, Byzantine_Date.month_name);
}

/*

'0001-01-01'.to_Date('Julian').to_Byzantine()
'-1-01-01'.to_Date('Julian').to_Byzantine()
CeL.String_to_Date.parser.Julian('100/1/1', undefined, {no_year_0 : false,year_padding : 0}).format('CE')

CeL.Byzantine_Date.test(-2e4, 4e6, 4).join('\n') || 'OK';
// "OK"
// 53167 ms, error 0/4

*/
Byzantine_Date.test = new_tester(Date_to_Byzantine, Byzantine_Date, {
	epoch : new Date(-1, 12, 1),
	month_days : {
		28 : 'common February',
		29 : 'leap February',
		30 : 'short month',
		31 : 'long month'
	}
});


//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// Nanakshahi calendar, 印度錫克教日曆 基本上與 Gregorian calendar 同步。
// https://en.wikipedia.org/wiki/Nanakshahi_calendar
// The Nanakshahi (Punjabi: ਨਾਨਕਸ਼ਾਹੀ, nānakashāhī) calendar is a tropical solar calendar
// New Year's Day falls annually on what is March 14 in the Gregorian Western calendar.
// year one is the year of Guru Nanak's birth (1469 CE). As an example, April 2014 CE is Nanakshahi 546.
// http://www.purewal.biz/fixed_sangrand_dates.pdf
// http://www.purewal.biz/Gurbani_and_Nanakshahi_Calendar.pdf
// Nanakshahi Sangrand Dates in Gregorian Calendar - Forever from 14 March 2003 CE / 535 NS

// Nanakshahi epoch: Gregorian 1469/3/14
var Nanakshahi_year_offset = 1469 - 1,
// 此 month name 會令 Eclipse 加大行距。
// https://en.wikipedia.org/wiki/Nanakshahi_calendar#Months_of_the_Nanakshahi_calendar
Nanakshahi_month_name = '|Chet (ਚੇਤ)|Vaisakh (ਵੈਸਾਖ)|Jeth (ਜੇਠ)|Harh (ਹਾੜ)|Sawan (ਸਾਵਣ)|Bhadon (ਭਾਦੋਂ)|Assu (ਅੱਸੂ)|Katak (ਕੱਤਕ)|Maghar (ਮੱਘਰ)|Poh (ਪੋਹ)|Magh (ਮਾਘ)|Phagun (ਫੱਗਣ)'.split('|');

Nanakshahi_Date.month_name = function(month_serial) {
	return Nanakshahi_month_name[month_serial];
};

function Nanakshahi_Date(year, month, date) {
	// no year 0. year: -1 → 0
	if (year < 0)
		year++;

	var JDN = Julian_day.from_YMD(year + 1468, 3, 14, true) + date - 1
	// Nanakshahi 前5個月 31日。
	+ (month > 5 ? 5 * 31 + (month - 6) * 30 : (month - 1) * 31);

	return Julian_day.to_Date(JDN);
}

_.Nanakshahi_Date = Nanakshahi_Date;


function Date_to_Nanakshahi(date, options) {
	var year = date.getFullYear(), month = date.getMonth();
	// Nanakshahi epoch: Gregorian 1469/3/14
	if (month < 3 - 1 || month === 3 - 1 && date.getDate() < 14)
		year--;
	var days = Julian_day(date)
	// get the first day of this Nanakshahi year.
	- Julian_day.from_YMD(year, 3, 14, true) | 0;
	// assert: 0 <= days <= 366

	// Nanakshahi 前5個月 31日。
	if (days < 5 * 31)
		month = days / 31 | 0, date = days % 31;
	else {
		days -= 5 * 31;
		month = 5 + (days / 30 | 0);
		if (month === 12)
			// The leap day, i.e., the last day of the leap year.
			month = 11, date = 30;
		else
			date = days % 30;
	}

	year -= Nanakshahi_year_offset;
	if (year <= 0)
		// year: 0 → -1
		year--;
	date = [ year, month + 1, date + 1 ];

	return _format(date, options, Date_to_Nanakshahi.to_name);
}

Date_to_Nanakshahi.to_name = [ library_namespace.to_Gurmukhi_numeral,
	Nanakshahi_Date.month_name, library_namespace.to_Gurmukhi_numeral ];


/*

CeL.Nanakshahi_Date.test(-2e4, 4e6, 4).join('\n') || 'OK';
// 40717 ms, error 0/4

*/
Nanakshahi_Date.test = new_tester(Date_to_Nanakshahi, Nanakshahi_Date, {
	epoch : new Date(1469, 3 - 1, 14),
	month_days : {
		30 : 'short month 6–12',
		31 : 'long month 1–5'
	}
});


//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// 儒略改革曆, Revised Julian calendar
// http://orthodoxwiki.org/Revised_Julian_Calendar
// The Revised Julian Calendar is a calendar that was considered for adoption by several Orthodox churches at a synod in Constantinople in May 1923. The synod synchronized the new calendar with the Gregorian Calendar by specifying that October 1, 1923, in the Julian Calendar will be October 14 in the Revised Julian Calendar, thus dropping thirteen days.
// https://en.wikipedia.org/wiki/Revised_Julian_calendar

// Revised Julian Calendar epoch: 0/1/1
var Revised_Julian_epoch = new Date(0, 0),
//
Revised_Julian_days = [ , 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ],
// 本年累積月份日數。
Revised_Julian_accumulated_days = [ , 0 ];

Revised_Julian_epoch.setFullYear(0, 0, 2);
Revised_Julian_epoch = Revised_Julian_epoch.getTime();

Revised_Julian_days.forEach(function(days, index) {
	if (index > 0)
		Revised_Julian_accumulated_days.push(days
				+ Revised_Julian_accumulated_days[index]);
});

/**
 * Get the days count from epoch.
 * 
 * @param {Integer}year
 *            year of Revised Julian calendar. (Astronomical year numbering)
 * @param {Natural}month
 *            month of Revised Julian calendar.
 * 
 * @returns {Integer} days count from epoch.
 */
Revised_Julian_Date.days = function(year, month) {
	// 要用來計算 leap 日數的年分。未過3月則應當做前一年計算。
	var y = month >= 3 ? year : year - 1, m900 = y.mod(900);

	// days from epoch
	return 365 * year
	// 計算 leap 日數。
	+ Math.floor(y / 4) - Math.floor(y / 100)
	// Years evenly divisible by 4 are leap years, except that years evenly
	// divisible by 100 are not leap years, unless they leave a remainder of 200
	// or 600 when divided by 900, in which case they are leap years.
	+ 2 * Math.floor(y / 900) + (m900 >= 600 ? 2 : m900 >= 200 ? 1 : 0)
	// 本年累積月份日數。
	+ Revised_Julian_accumulated_days[month];
}

/**
 * Revised Julian calendar → system Date
 * 
 * @param {Integer}year
 *            year of Revised Julian calendar.
 * @param {Natural}month
 *            month of Revised Julian calendar.
 * @param {Natural}date
 *            date of Revised Julian calendar.
 * 
 * @returns {Date} system Date (proleptic Gregorian calendar with year 0)
 */
function Revised_Julian_Date(year, month, date) {
	// no year 0. year: -1 → 0
	if (year < 0)
		year++;

	date += Revised_Julian_Date.days(year, month) - 1;

	return new Date(Revised_Julian_epoch + date * ONE_DAY_LENGTH_VALUE);
}

_.Revised_Julian_Date = Revised_Julian_Date;


/**
 * system Date → Revised Julian calendar
 * 
 * @param {Date}date
 *            system date to convert.
 * @param {Object}[options]
 *            options to use
 * 
 * @returns {Array} [ year, month, date ]
 */
function Date_to_Revised_Julian(date, options) {
	var days = (date - Revised_Julian_epoch) / ONE_DAY_LENGTH_VALUE,
	// 估測
	year = date.getFullYear() | 0, month = date.getMonth() + 1 | 0;

	// TODO: ugly method. Try to improve it.
	while (true) {
		date = days - Revised_Julian_Date.days(year, month);
		// 經測試，在前後萬年範圍內，最多僅修正一次。
		if (date < 0) {
			if (month === 3) {
				date = days - Revised_Julian_Date.days(year, month = 2);
				break;
			}
			if (--month < 1)
				month = 12, year--;
		} else if (date >= Revised_Julian_days[month]) {
			if (month === 2) {
				days -= Revised_Julian_Date.days(year, 3);
				if (days >= 0)
					month = 3, date = days;
				break;
			}
			if (++month > 12)
				month = 1, year++;
		} else
			break;
	}

	if (year <= 0)
		// year: 0 → -1
		year--;

	return [ year, month, date + 1 ];
}

/*

CeL.Revised_Julian_Date(6400,3,1).format()
new Date('6400/3/1').to_Revised_Julian()

CeL.Revised_Julian_Date.test(-2e4, 4e6, 4).join('\n') || 'OK';
// 59804 ms, error 0/4
// 修正 138217 次。平均 29+ 日（每個月）會修正一次。

*/
Revised_Julian_Date.test = new_tester(Date_to_Revised_Julian, Revised_Julian_Date, {
	epoch : Revised_Julian_epoch,
	month_days : {
		28 : 'common February',
		29 : 'leap February',
		30 : 'short month',
		31 : 'long month'
	}
});



//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// 《太初曆》於漢成帝末年，由劉歆重新編訂，改稱三統曆。
// 漢簡曆日考徵 許名瑲
// http://www.bsm.org.cn/show_article.php?id=2033
// http://www.bsm.org.cn/show_article.php?id=2042
// http://www.bsm.org.cn/show_article.php?id=2262
// 漢書 律曆志
// http://ctext.org/han-shu/lv-li-zhi-shang/zh

// 曆法:歲:回歸年,月:朔望月,日:平太陽日
// 曆法上之"歲首"指每歲(嵗)起算點(之月序數)，常為中氣(一般為冬至)時間。月首朔旦，朔旦到朔旦爲一月(朔望月)。日首夜半，夜半到夜半爲一日(平太陽日)。
// 當前農曆之"歲"指冬至月首至冬至月首之間(回歸年)，"年"指正月首(1月1日)至正月首之間，故歲首為11月1日夜半(子夜時刻)。
// 元嘉曆之"歲"指正月首(1月1日)至正月首之間，與"年"相同。

/*

index: Math.ceil(太初曆_月日數/(2*太初曆_節氣日數-太初曆_月日數))-1 = 32月為太初曆首個無中氣月(閏月)
積年3, index: 8月 = 3年閏6月為太初曆首個無中氣月(閏月)
惟此推步非實曆。


*/
function 太初曆數() {
	// 元始黃鐘初九自乘，一龠之數，得日法。
	var 日法 = 9 * 9,
	// 章歲。十九年七閏，是為一章(十九歲七閏)
	// 朔不得中，是謂閏月。無中置閏
	閏法 = 19,
	// 經歷一統千五百三十九年，冬至與月朔相合夜半時刻。
	統法 = 日法 * 閏法,
	// 參統法，得元法。
	// 經歷一元四千六百一十七年，冬至與月朔相合甲子夜半。
	元法 = 3 * 統法,
	// 47: 參天九，兩地十，得會數。
	// 三統曆以一百三十五月為「朔望之會」，有廿三交食，四十七「朔望之會」，得六千三百四十五月(47×135＝6345)為「會月」，則交食起于冬至朔旦。
	會數 = 3 * 9 + 2 * 10,
	// 五位乘會數，得章月。案：章月即一章(十九年)之朔望月數二百三十五(十九年七閏；12×19+7＝235)。
	章月 = 5 * 會數,
	// 朔望月長: 29+43/81 = 2392/81
	// 以朔策廿九日又八十一分之四十三日化為分數，得八十一分之二千三百九十二日；即一日為八十一分，則一月有二千三百九十二分。二千三百九十二，名之曰「月法」
	月法 = 29 * 日法 + 43,
	//
	月日數 = 月法 / 日法,
	// 四分月法，得通法。
	通法 = 月法 / 4,
	// 以章月乘通法，得中法。
	中法 = 章月 * 通法,
	// 30+2020/4617 = 70265/4617 ≈ 487/16 = 30.4375
	中氣日數 = 中法 / 元法,
	// 一統之日數。
	周天 = 章月 * 月法,
	// 歲中十二。以三統乘四時，得歲中。案：即一歲有十二中氣。
	歲中 = 3 * 4,
	// 以章月加閏法，得月周。
	// 一章中月亮經天周數；一章中恒星月數。
	// 朔望月大于恒星月，三統曆以一章二百三十五朔望月等于二百五十四恒星月，恰為「章月加閏法」之數，劉歆故云。
	月周 = 章月 + 閏法,
	// 參天數二十五，兩地數三十
	// 此為交食周期，三統曆據實測，以一百三十五朔望月有二十三交食
	朔望之會 = 3 * 25 + 2 * 30,
	// 合廿七章，五百一十三歲
	會月 = 會數 * 朔望之會,
	// 合八十一章，一千五百三十九年。
	統月 = 3 * 會月,
	// 合三統，四千六百一十七年，則交食起于甲子朔旦冬至，所謂「九會而元復」。
	元月 = 3 * 統月,
	// 一章有二百二十八中氣(19×12＝228)，名曰「章中」。一章二百三十五朔望月，七個月無中氣，三統閏法「朔不得中，是謂閏月。」
	章中 = 閏法 * 歲中,
	//
	統中 = 日法 * 章中,
	//
	元中 = 3 * 統中,
	// 什乘元中，以減周天，得策餘。
	// 三統曆歲實(冬至點間的時間間隔,回歸年)三百六十五日又一千五百三十九分之三百八十五日，去其六周甲子，餘五日又一千五百三十九分之三百八十五日，化為分數，取其分子，得八千八十，名曰「策餘」。
	策餘 = 周天 - 10 * 元中,
	//
	周至 = 3 * 閏法,
	// 太初元年上元積年
	上元積年 = 143127,
	// 閏餘0
	積月 = 1770255,
	// 小餘0
	朔積日 = 52277160,
	// 小餘0
	氣積日 = 52277160;

	// 步算

}


// copy from CeL.astronomy.SOLAR_TERMS
var SOLAR_TERMS = ["春分","清明","穀雨","立夏","小滿","芒種","夏至","小暑","大暑","立秋","處暑","白露","秋分","寒露","霜降","立冬","小雪","大雪","冬至","小寒","大寒","立春","雨水","驚蟄"];

/**
 * 每年節氣數: 每年24節氣.<br />年節氣數 = 歲中(嵗中) * 2 = 歲中 + 氣法?
 * 
 * Should be library_namespace.SOLAR_TERMS.length
 * 
 * @type {Natural} constant
 */
var 年節氣數 = SOLAR_TERMS.length;

// 程式處理時，應在可精準處理的範圍內盡量減少工序。因此不須時時作 mod 演算以降低數字大小。

/**
 * 指定曆數後，產出平氣平朔、無中置閏復原曆法(厯法)之曆算推步方法。實際應為「需要置閏時，置閏於首個無中月」，而非「無中月必置閏」。
 * 
 * TODO: 招差術
 * 
 * @param {Number|Array}曆數_月日數
 *            {Number}每月日數 or [ {Natural}月長, {Natural}月之日長, {Integer}初始朔餘 ].<br />
 *            朔策(朔望月長) = 月法 / 日法 = 通周 / 日法
 * @param {Number|Array}曆數_節氣日數
 *            {Number}每節氣日數 = 歲實 / 年節氣數 or [ {Natural}節氣長, {Natural}節氣之日長,
 *            {String}節氣小餘名 ], 周天 = 中法 / 元法 / 2<br />
 *            歲實(冬至點間的時間間隔,回歸年) = 12 * 中法 / 元法
 * @param {Integer}曆元JDN
 *            上元, 曆法起算點之 JDN, e.g., 夜半甲子朔旦冬至之日。
 * @param {Object}[options]
 *            options to use.<br />
 *            {String}options.曆名: 平氣平朔無中置閏曆名。
 * 
 * @returns {Array} [ {Function}to_Date, {Function}from_Date ]
 * 
 * @see https://github.com/suchowan/when_exe/blob/master/lib/when_exe/region/chinese/twins.rb
 */
function 平氣平朔無中置閏(曆數_月日數, 曆數_節氣日數, 曆元JDN, options) {

	/**
	 * 取得平氣平朔太陰太陽曆法積日當天之積月。
	 * 
	 * @param {Integer}積日
	 *            積日
	 * 
	 * @returns {Integer}積月
	 * 
	 * @deprecated
	 */
	function deprecated_平氣平朔太陰太陽曆法_積月(積日, get_積日) {
		var 積月 = Math.ceil(積日 / 曆數_月日數),
		// 先測試下個月的月始積日。
		月始積日 = Math.floor(積月 * 曆數_月日數);
		if (積日 < 月始積日)
			// 應採用上個月。
			月始積日 = Math.floor(--積月 * 曆數_月日數);
		return get_積日 ? [ 積月, 月始積日 ] : 積月;
	}

	/**
	 * 取得平氣平朔太陰太陽曆法積日當天之積月數。
	 * 
	 * @param {Integer}積日
	 *            積日數
	 * 
	 * @returns {Integer}積月數
	 */
	function 平氣平朔太陰太陽曆法_積月(積日) {
		// 每年以朔分月（朔日為每月初一）。
		// +1: 明日子夜時刻小餘=0時，今日之積月還是該算前一個。
		var _積月 = (積日 + 1 + 曆元閏餘日數) / 曆數_月日數, 積月 = Math.floor(_積月);
		return _積月 === 積月 ? 積月 - 1 : 積月;
	}

	function 平氣平朔太陰太陽曆法_年初積月(積年) {
		 return 平氣平朔太陰太陽曆法_積月(Math.floor(積年 * 年節氣數 * 曆數_節氣日數));
	}

	/**
	 * 取得平氣平朔太陰太陽曆法積日當天之積節氣數。
	 * 
	 * 自曆元累積節氣數。今日之內變換之節氣都算今天的。
	 * 
	 * @param {Integer}積日
	 *            積日數
	 * 
	 * @returns {Integer}積節氣數
	 */
	function 平氣平朔太陰太陽曆法_積節氣(積日) {
		if (false)
			return Math.floor(((積日 + 1) % 曆數_節氣日數 === 0 ? 積日 : 積日 + 1)
					/ 曆數_節氣日數);
		// +1: 明日子夜時刻節氣小餘=0時，今日之節氣還是該算前一個。
		var _積節氣 = (積日 + 1) / 曆數_節氣日數, 積節氣 = Math.floor(_積節氣);
		return _積節氣 === 積節氣 ? 積節氣 - 1 : 積節氣;
	}

	/**
	 * get Date of 平氣平朔太陰太陽曆法.<br />
	 * 平氣平朔太陰太陽曆法 → Date
	 * 
	 * @param {Integer}year
	 *            year of 平氣平朔太陰太陽曆法.
	 * @param {Natural}month
	 *            month of 平氣平朔太陰太陽曆法.
	 * @param {Natural}date
	 *            date of 平氣平朔太陰太陽曆法.
	 * @param {Object}[options]
	 *            options to use
	 * 
	 * @returns {Date} system Date (proleptic Gregorian calendar with year 0)
	 * 
	 * @deprecated
	 */
	function deprecated_平氣平朔太陰太陽曆法_Date(year, month, date, options) {
		// 輸入閏月(leap month)。
		var 為閏月;
		if (isNaN(month)) {
			--year;
			為閏月 = month.match(/^閏(\d{1,2})$/);
		} else if (month < 11 + 月位移) {
			// 1–10月算作前一年，從前一年起算。
			--year;
			month -= 月位移;
		} else {
			month -= 11 + 月位移 - 1 + 2;
		}

		var 年初積月 = Math.floor(year * 年節氣數 * 曆數_節氣日數 / 曆數_月日數);
		// 當年首日之積日
		// var days = Math.floor(年初積月 * 曆數_月日數);

		if (為閏月) {
			// +1: 閏月為本月之下一月。
			month = (為閏月[1] | 0) + 1 - 月位移;
			// assert: 月位移=0時，1 <= month <= 12
			// TODO: 檢查本月是否真為閏月。

		} else if (Math.floor((year + 1) * 年節氣數 * 曆數_節氣日數 / 曆數_月日數
		// +1e-10: 為了補償 (曆數_節氣日數 = 節氣長 / 節氣之日長) 的誤差。
		// 若做的是整數乘除法，則無須此項修正。
		// 此數值必須比最小之可能分數值(小餘=1)更小，小最起碼可能造成浮點誤差的程度。
		//
		// 在 CeL.大明曆_Date(73527, 10, 1) 須採 ">= 12".
		// 但如此拖慢效能過多；改 +1e-10，採 +5e-3 可迴避之。(workaround)
		+ 5e-3) - 年初積月 > 12) {
			// 需檢查哪個是閏月。
			// 說明見 function Date_to_平氣平朔太陰太陽曆法()
			var 閏月 = Math.ceil(((年初積月 + 1) * 曆數_月日數 - year * 年節氣數 * 曆數_節氣日數)
					/ (2 * 曆數_節氣日數 - 曆數_月日數));
			while (Math.floor((年初積月 + 閏月) * 曆數_月日數) <= (year * 年節氣數 + (閏月 - 1) * 2)
					* 曆數_節氣日數)
				閏月--;
			// 若於閏月後，則需要添加入一個月(即閏月)。
			if (閏月 <= month + 1)
				month++;
		} else if (false && 閏月序(年初積月, year) <= month + 1)
			// error: CeL.太初曆_Date(19,11,1).format('CE');
			month++;

		return Julian_day.to_Date(曆元JDN
		// 積月日數+date
		+ Math.floor((年初積月 + month - 1
		// +2: 11月→1月
		+ 2) * 曆數_月日數) + date - 1);
	}

	// 取得首個無中氣月份之年初起算index。
	// @returns	應為 undefined or 1–12. 1: 閏1月, 2: 閏2月
	function 閏月序(年初積月, 積年) {
		// console.log([ 年初積月, 積年 ]);
		var 下一年的年初積月 = 平氣平朔太陰太陽曆法_年初積月(積年 + 1);
		// 年月數 > 12 (應為13)，則置閏月。
		if (下一年的年初積月 - 年初積月 !== 12 + 1) {
			return;
		}

		if (固定置閏) {
			// e.g., 年終置閏法, 置閏於年底。
			return 固定置閏;
		}

		// 無中置閏法: 計算、搜尋本年度第一個無中氣的月份。

		// 初始值: {Real}第二個月(一般為12月)合朔積日時間 (單位:日)
		var 合朔積日時間 = (年初積月 + 1) * 曆數_月日數,
		// 初始值: {Real}歲首中氣(一般為冬至)時間 (單位:日)
		中氣積日時間 = 積年 * 年節氣數 * 曆數_節氣日數,
		// 時間差 = 合朔積日時間 - 中氣積日時間 (單位:日)
		// -1: 預防中氣出現在日末。只要在當日，都應算當日的。
		閏月 = (合朔積日時間 - 中氣積日時間 - 1) / (2 * 曆數_節氣日數 - 曆數_月日數) | 0;
		// assert: 閏月 = 自第二個月(年初起算index 1)起算的 index: 0–12
		// 年初起算index 0 必存有歲首中氣(一般為冬至)，可跳過。
		if (閏月 < 1)
			閏月 = 1;
		// +1e-9: 預防浮點捨入誤差 Round-off error。
		// e.g., 太初曆 @ -1644/11/25 CE, 元嘉曆 @ 17844/4/4 CE (+1e-10: NG)
		合朔積日時間 += 閏月 * 曆數_月日數 + 1e-9;
		中氣積日時間 += 閏月 * 2 * 曆數_節氣日數 + 1e-9;
		// 用加的，並且由前往後搜尋，取得首個無中氣之月。
		while (中氣積日時間 < Math.floor(合朔積日時間)) {
			閏月++;
			合朔積日時間 += 曆數_月日數;
			中氣積日時間 += 2 * 曆數_節氣日數;
		}
		// 自第二個月(年初起算index 1)起算，index ((閏月))個月時，恰好((中氣>=朔日))
		// 是故此時年初起算index ((閏月-1+1)) 為閏月。

		// assert: {Natural}閏月=1–12
		// 但 +1e-10 在 `CeL.元嘉曆_Date(23104, 12, 30).format('CE');` 會出現13!
		return 閏月;

		/** <code>

		// --------------------------------------
		// 以下先估算方法常常會漏失，已經廢棄。

		// 先估算、取得最大可能值：
		// 因為分子實際應取第一天子夜，而非第一天月小餘為0的時刻；因此實際值一定小於此。
		閏月 = Math.ceil(
		// 需要追趕之日數: 自冬至起，至第2(index:1)個月第一天子夜。
		((年初積月 + 1) * 曆數_月日數 - 積年 * 年節氣數 * 曆數_節氣日數) /
		// 每個月可追趕之日數. 中氣與中氣間之日數 = 2* 曆數_節氣日數
		(2 * 曆數_節氣日數 - 曆數_月日數));
		// 檢查是否(月初積日>前一節氣時間)，若非，則表示應該往前找。
		// 閏有進退，以無中氣御之。例：
		// (index:1)月(子夜時刻)與冬至(節氣index:0)相較，
		// (index:2)月(子夜時刻)與(節氣index:1)相較。
		while (Math.floor((年初積月 + 閏月) * 曆數_月日數) <= (積年 * 年節氣數 + (閏月 - 1) * 2)
				* 曆數_節氣日數)
			// 最多應該只會 loop Math.ceil(1/(2 * 曆數_節氣日數 - 曆數_月日數)) = 2次?
			閏月--;
		// 若在閏月 index 之後，則 -1 以接下來進一步轉換成月名。
		閏月 = 月 >= 閏月 && 月-- === 閏月;

		</code> */
	}

	/**
	 * 平氣平朔太陰太陽曆法曆算推步。<br />
	 * system Date → 平氣平朔太陰太陽曆法(平氣平朔無中置閏曆日)
	 * 
	 * @param {Date}date
	 *            system date to convert.
	 * @param {Object}[options]
	 *            options to use
	 * 
	 * @returns {Array} [ 年, 月, 日 ]
	 */
	function Date_to_平氣平朔太陰太陽曆法(date, options) {
		// 正規化並提供可隨意改變的同內容參數，以避免修改或覆蓋附加參數。
		options = library_namespace.new_options(options);

		// 積日:自曆元起算，至本日子夜所累積的完整日數。曆元當日為0。
		// 積月/積節氣:本日之內(子夜0:0至23:59最後一刻)變換，則子夜起即算變換月/節氣了。
		// 積年:本月之內變換，則月初首日子夜起即算變換年了。

		// 00 01 02 03 04 05 06 07 08 09 10 11 month index
		// 11 12 01 02 03 04 05 06 07 08 09 10 月

		// 小餘餘分: 大餘者日也 小餘者日之奇分也
		var 加注小餘 = options.小餘,
		// for 氣朔表
		加注節氣 = options.節氣,
		// 自曆元至本日開始累積日數，本日距離曆元 (西漢武帝元封7年11月1日甲子朔旦冬至) 之日數。
		// 曆元西漢武帝元封7年11月1日當日積日為0日。
		積日 = Julian_day(date) - 曆元JDN,
		// 自曆元至本日結束累積月數。
		積月 = 平氣平朔太陰太陽曆法_積月(積日),
		// 自曆元至本日結束累積節氣數。
		積節氣 = 平氣平朔太陰太陽曆法_積節氣(積日),
		// 自曆元至本月底累積年數。將在之後調整。
		積年 = Math.floor(積節氣 / 年節氣數),
		// 日 = 積日 - 月始積日
		// +1: 日期自1起算。
		日 = 積日 - Math.floor(積月 * 曆數_月日數 - 曆元閏餘日數) + 1;

		// --------------------------------------------------------------------

		// new method

		// 年初冬至日之積月。
		// 冬至所在月為十一月(天正月)，之後為十二月、正月、二月……復至十一月。
		var 年初積月 = 平氣平朔太陰太陽曆法_年初積月(積年);
		// 月序(0–11, 有閏月年份的末月:12)
		var 月 = 積月 - 年初積月;

		var 閏月 = 閏月序(年初積月, 積年);
		if (閏月) {
			// 若在閏月 index 之後，則 -1 以接下來進一步轉換成月名。
			// 月 → 去除閏月後之 index。
			閏月 = 月 >= 閏月 && 月-- === 閏月;
			// 閏月: 本月是否為閏月
		}

		// 月序 → 月份名稱
		月 += 曆元月序;
		var 年 = 積年 + 曆元年序;
		if (月 > 12) {
			月 -= 12;
			年++;
		}

		/**
		 * old complicated method
		 * 
		 * <code>

		var 下一冬至積日;

		// 最末月須確定積年，因為可能位在下一年了。
		// -2: 僅有在此範圍內，才有必要檢測本日是否與冬至在同一個月，又在冬至之前。
		if (積節氣.mod(年節氣數) >= 年節氣數 - 2
		// 檢測下一個冬至的積日數
		&& (下一冬至積日 = Math.ceil(積節氣 / 年節氣數) * 年節氣數 * 曆數_節氣日數)
		// 下一個月月初積日
		< Math.floor((積月 + 1) * 曆數_月日數)
		// 檢測是否與下一個冬至在同一個月，或之前 (e.g., 583/11/20 CE to 大明曆)。
		&& 積月 <= 平氣平朔太陰太陽曆法_積月(下一冬至積日)) {
			// 本日與冬至在同一個月，又在冬至時刻之前。
			積年++;
			年初積月 = 積月;
		} else {
			// 一般情況:冬至時刻或之後。
			// 歲實 = 冬至點間的時間間隔 = 年節氣數 * 曆數_節氣日數
			年初積月 = 平氣平朔太陰太陽曆法_積月(Math.floor((積年 + 0) * 年節氣數 * 曆數_節氣日數));
		}
		// 至此((積年))調整完畢。

		// 確定月份。
		// get 年初起算之月份index: 0–11
		月 = 積月 - 年初積月;

		if (閏月 = 閏月序(年初積月, 積年)) {
			// 若在閏月 index 之後，則 -1 以接下來進一步轉換成月名。
			// 月 → 去除閏月後之 index。
			閏月 = 月 >= 閏月 && 月-- === 閏月;
			// 閏月: 本月是否為閏月
		}

		// month index (0–11) to month serial (1–12)
		// original: (月-歲首差).mod(12)+1
		// 12: 12個月
		// 10: index 0 → 10+1月
		月 = ((月 + 10 + 月位移) % 12) + 1;

		// 11→12→(跨年)1→2→...→10
		年 = 月 < 11 + 月位移 ? 積年 + 1 : 積年;

		</code>
		 */

		// --------------------------------------------------------------------


		if (加注小餘 && 月之日長 && 日 === 1) {
			// 加注小餘: 添加朔餘（月分小餘、前小餘）。
			// 推朔術：以通數乘積分，為朔積分，滿日法為積日，不盡為小餘。
			日 += ' (朔餘' + (積月 * 月長 + 曆元閏餘小分).mod(月之日長) + ')';
			// 這邊採用 `- 曆元閏餘小分` 可以獲得和
			// http://www.bsm.org.cn/show_article.php?id=2372 許名瑲 青川郝家坪秦牘《田律》曆日考釋
			// 相同的朔餘。但照理來說，應該要用 `+ 曆元閏餘小分` 才對？
		}

		if (正月偏移) {
			// -1, +1: 月序數從1開始。
			月 = (月 - 1 + 正月偏移).mod(12) + 1;
		}
		date = [ 年, 閏月 ? '閏' + 月 : 月, 日 ];

		// 檢查當天是否為節氣日。
		// 測試今天之內有無變換至下一節氣:今昨天相較。
		// assert: 積節氣 - 平氣平朔太陰太陽曆法_積節氣(積日 - 1) === (0 or 1)
		if (加注節氣 && 積節氣 > 平氣平朔太陰太陽曆法_積節氣(積日 - 1)) {
			// 今天之內變換至下一節氣。
			if (SOLAR_TERMS) {
				if (加注小餘) {
					加注小餘 = 節氣之日長 &&
					// 後小餘, 氣小餘
					' (' + 節氣小餘名 + (積節氣 * 節氣長).mod(節氣之日長) + ')';
				}
				積節氣 = SOLAR_TERMS[(積節氣 + 曆元節氣偏移).mod(年節氣數)];
				if (加注小餘)
					積節氣 += 加注小餘;
			}
			date.push(積節氣);
		}

		return date;
	}

	/**
	 * get Date of 平氣平朔太陰太陽曆法.<br />
	 * 平氣平朔太陰太陽曆法 → Date
	 * 
	 * @param {Integer}year
	 *            year of 平氣平朔太陰太陽曆法.
	 * @param {Natural}month
	 *            month of 平氣平朔太陰太陽曆法.
	 * @param {Natural}date
	 *            date of 平氣平朔太陰太陽曆法.
	 * @param {Object}[options]
	 *            options to use
	 * 
	 * @returns {Date} system Date (proleptic Gregorian calendar with year 0)
	 */
	function 平氣平朔太陰太陽曆法_Date(year, month, date, options) {
		// 正規化並提供可隨意改變的同內容參數，以避免修改或覆蓋附加參數。
		options = library_namespace.new_options(options);

		// 輸入閏月(leap month)。
		var 為閏月 = isNaN(month) && month.match(/^閏(\d{1,2})$/);
		// 還原至 {Integer}積年>=0, {Integer}月_index(0–11)。
		var 月_index = 為閏月 ? 為閏月[1] : month;
		if (正月偏移) {
			// -1, +1: 月序數從1開始。
			月_index = (月_index - 1 - 正月偏移).mod(12) + 1;
		}
		月_index -= 曆元月序;
		var 積年 = year - 曆元年序;
		if (月_index < 0) {
			// 應該用前1年的曆數
			月_index += 12;
			積年--;
		}

		var 年初積月 = 平氣平朔太陰太陽曆法_年初積月(積年);
		var 閏月 = 閏月序(年初積月, 積年);
		// 過閏月
		if (閏月 <= 月_index
		// 或閏月當月
		|| 閏月 === 月_index + 1 && 為閏月) {
			月_index++;
		}

		var 積月 = 年初積月 + 月_index;
		// -1: 日 starts from 1
		var 積日 = Math.floor(積月 * 曆數_月日數 - 曆元閏餘日數) + (date - 1);

		return Julian_day.to_Date(曆元JDN + 積日);
	}

	// ------------------------------------------------------------------------

	// 正規化並提供可隨意改變的同內容參數，以避免修改或覆蓋附加參數。
	options = library_namespace.new_options(options);

	// 初始化曆法數據。

	var 月長, 月之日長,
	//
	節氣長, 節氣之日長, 節氣小餘名, 初始朔餘;

	if (曆數_月日數 > 0)
		(曆數_月日數 = library_namespace.to_rational_number(曆數_月日數)).pop();
	if (Array.isArray(曆數_月日數)) {
		// TODO:
		// 初始朔餘 = 曆數_月日數[2] | 0;
		// e.g., 月長 27759 / 月之日長 940
		// {正實數}
		曆數_月日數 = (月長 = +曆數_月日數[0]) / (月之日長 = +曆數_月日數[1]);
	}

	if (曆數_節氣日數 > 0)
		(曆數_節氣日數 = library_namespace.to_rational_number(曆數_節氣日數)).pop();
	if (Array.isArray(曆數_節氣日數)) {
		節氣小餘名 = 曆數_節氣日數[2] || '節氣小分';
		// {正實數}
		曆數_節氣日數 = (節氣長 = +曆數_節氣日數[0]) / (節氣之日長 = +曆數_節氣日數[1]);
	}

	var 曆元節氣 = options.曆元節氣 || '冬至';
	// const 冬至序 = SOLAR_TERMS.indexOf('冬至') = 18;
	var 曆元節氣偏移 = SOLAR_TERMS.indexOf(曆元節氣);
	if (!(曆元節氣偏移 >= 0))
		throw new Error('曆元節氣錯誤: 沒有此節氣: ' + 曆元節氣);
	// 冬至建子 → 0
	var 曆元月建序 = Math.ceil((曆元節氣偏移 - SOLAR_TERMS.indexOf('冬至')) / 2).mod(12) | 0;
	// 寅: 2, 子: 0
	var 歲首月建序 = library_namespace.stem_branch_index(options.歲首月建 || options.建正 || '寅') | 0;
	var 建正序 = options.建正 ? library_namespace.stem_branch_index(options.建正) : 歲首月建序;
	// 當年月序數 + 正月偏移 = 實際月份名稱
	// 處理歲首不在正月(1月)的情況。每年從正月開始的，此數值應該皆為0。
	// e.g, 顓頊曆從10月開始新的一年，歲首月序=月序1+正月偏移9=實際月份名稱10
	var 正月偏移 = 歲首月建序 - 建正序;

	// {Integer}曆元冬至預設在十一月建子。
	// assert: 曆元月序>0 
	var 曆元月序 = +options.曆元月序;
	// {Integer}通常曆元冬至位在第0年。過了年後才是第一年。
	var 曆元年序 = 1;
	if (!曆元月序) {
		// 一般曆元在冬至11月，建正為寅的曆法，應該是:
		// (0 - 2).mod(12) + 1 = 11 
		// 曆元月序 = (曆元月建序 - 歲首月建序).mod(12) + 1;

		曆元月序 = 曆元月建序 - 歲首月建序;
		if (曆元月序 < 0) {
			// 一般曆元在冬至11月，建正為寅的曆法，曆元在第一年之前。
			曆元月序 += 12;
			曆元年序--;
		}
		// +1: 月序數從1開始，(1年)1月。
		曆元月序++;
	}
	if ('曆元年序' in options)
		曆元年序 = +options.曆元年序;

	var 曆元閏餘日數 = +options.曆元閏餘日數 || 0;
	if (曆元閏餘日數) {
		// 1e-9: 預防浮點捨入誤差 Round-off error。
		// e.g., 魯曆 5784/閏12/29 ⇨ 隔天 5785/1/0 (3784/1/19 CE) (+1e-10: NG)
		曆元閏餘日數 += 曆元閏餘日數 < 0 ? -1e-9 : 1e-9;
	}
	// {Integer} e.g., 魯曆: 1460 = 940 + 521
	var 曆元閏餘小分 = Math.round(曆元閏餘日數 * 月之日長);

	// 固定置閏於月序數(1–12)，指定本年曆數中index:[固定置閏]為閏月。因此不應為首個月[0]，可為末個[12]。
	var 固定置閏;
	if (options.固定置閏 >= 1) {
		固定置閏 = options.固定置閏 | 0;
	} else if (options.固定置閏 === '年終') {
		// 年終置閏法, 置閏於年底。
		// 一般古六歷: 固定置閏 = 12
		固定置閏 = 歲首月建序 - 曆元月建序;
		if (固定置閏 < 1) {
			固定置閏 += 12;
		}
	}

	// 曆元夜半甲子朔旦冬至: 歲首=11, 歲首差=2, 月位移=0
	// assert: 若有設置月位移(實際為月序位移，而非包括閏月之月數！)，則月位移=1 or 2
	// TODO: 月位移仍有 bug，並且需要簡化。
	// var 月位移 = (曆元月序 - 11).mod(2);

	// free
	options = null;

	return [ 平氣平朔太陰太陽曆法_Date, Date_to_平氣平朔太陰太陽曆法 ];
}


var to_曆 = Object.create(null);
// warpper
function add_平氣平朔太陰太陽曆法(config) {
	for ( var 曆名 in config) {
		var 曆數 = config[曆名];
		if (typeof 曆數 === 'string')
			曆數 = 曆數.split(',');
		// 曆數:
		// [ 曆數_月日數, 曆數_節氣日數, 曆元JDN, 行用起訖JDN, options ]
		// 行用起訖JDN: {Integer}起JDN or [ 起JDN, 訖JDN ]; 訖JDN 指結束行用之<b>隔日</b>!
		if (typeof 曆數[0] === 'string')
			曆數[0] = 曆數[0].split('/');
		if (typeof 曆數[1] === 'string')
			曆數[1] = 曆數[1].split('/');

		if (typeof 曆數[3] === 'string')
			曆數[3] = library_namespace.parse_period(曆數[3]);
		if (Array.isArray(曆數[3])) {
			曆數[3][0] = 曆數[3][0] && Julian_day.to_Date(Julian_day(曆數[3][0], 'CE'), null,
					true) || undefined;
			曆數[3][1] = 曆數[3][1] && Julian_day.to_Date(Julian_day(曆數[3][1], 'CE'), null,
					true) || undefined;
		}

		var 曆術 = 平氣平朔無中置閏(曆數[0], 曆數[1], 曆數[2] | 0, 曆數[4]);

		var 章歲 = 曆數[0][0] * 曆數[1][1], 章閏 = 年節氣數 * 曆數[0][1] * 曆數[1][0] % 章歲,
		// test 十九年七閏法
		GCD = library_namespace.GCD(章歲, 章閏);
		章閏 /= GCD, 章歲 /= GCD;
		曆術[0].閏法 = 章歲 + '年' + 章閏 + '閏';
		library_namespace.debug(曆名 + ': ' + 曆術[0].閏法, 1, 'add_平氣平朔太陰太陽曆法');

		(_[曆名 + '_Date'] = 曆術[0]).行用 = 曆數[3];
		to_曆['to_' + 曆名] = set_bind(曆術[1]);
		曆術[0].test = new_tester(曆術[1], 曆術[0], {
			epoch : add_平氣平朔太陰太陽曆法.epoch,
			continued_month : continued_month_中曆
		});
	}
}

add_平氣平朔太陰太陽曆法.epoch = Julian_day.YMD_to_Date(-2000, 1, 1, null, true);


// 古六曆至隋大業曆採平氣平朔，唐戊寅元暦至明大統曆採平氣定朔，清時憲曆（於順治二年頒行）後大致採定氣定朔。
// 王广超:明清之际定气注历之转变	唐初历法即已应用定气作为太阳改正，但是注历依然采用平气。
// 梅文鼎深受王锡阐的影响，学术取向上与王有很多相似之处，对节气注历的看法即是一例。在《历学疑问补》中，梅文鼎谈到对“定气注历”的看法。首先，梅氏指出中国传统历算家并非不知定气，只是以恒气注历，以定气算日月交食，

// 張培瑜《中國先秦史歷表》 http://bbs.nongli.net/dispbbs_2_19913.html
// 近代学者认为春秋时期各诸侯国行用不同的历法。《左传》早期作者杂采各国史策，因而历日杂用三正。例如，一般认为当时晋国很可能行用夏历。
add_平氣平朔太陰太陽曆法({
	// 曆名 : '每月日數,每節氣日數,曆元JDN,行用起訖日期,options'

	// 古六歷或古六曆, 四分曆術（四分法, 戰國四分曆）, 年終置閏法, 置閏於年底
	// https://zh.wikipedia.org/wiki/古六歷
	// http://www.bsm.org.cn/show_article.php?id=2372 許名瑲 青川郝家坪秦牘《田律》曆日考釋
	// https://github.com/suchowan/when_exe/blob/master/lib/when_exe/region/chinese/twins.rb
	// https://github.com/ytliu0/ChineseCalendar/issues/2

	// 2019/7/11 21:21:26
	// 和 青川郝家坪秦牘《田律》曆日考釋
	// http://www.bsm.org.cn/show_article.php?id=2372
	// 比較的結果，除了殷曆差一個月（但這邊做出的歷表和廖育棟(Yuk Tung Liu)老師的相符合，不曉得是不是許名瑲老師另外做過調整？）
	// https://ytliu0.github.io/ChineseCalendar/table_chinese.html
	// 以及魯曆的朔餘有差別之外（見前面"加注小餘"段），其他部分（月序數、朔餘、節氣小餘）都能夠重現出來了。

	// 4560年: 1元, 秦始皇26年(-222/10/31)秦滅六國

	// 黃帝曆上元辛卯至今2760863年算外，相當2760863-713=前2760150年，近元在2760150%4560=前1350年。 
	// 最接近前1350年1月1日的冬至，
	// CeL.date.stem_branch_index(new Date(CeL.Julian_day.to_Date(CeL.Julian_day.from_YMD(-1351,12,27,'CE',true),'CE',true)))===CeL.date.stem_branch_index('甲子')
	// 在公元前1351年12月27日，
	// CeL.Julian_day.from_YMD(-1351,12,27,'CE',true)=1228331
	黃帝曆 : [ '27759/940', '487/32', 1228331, [ '-479/12/19', '-222/10/31' ], {
		固定置閏 : /* 12 */'年終',
		// 曆元節氣 : '冬至',
		// 曆元閏餘日數 : 0,

		// 建正: 正月(一月)月建。歲首月建可能採用其他月建。
		建正 : '子'
	} ],

	// 顓頊曆上元乙卯至今2761019年算外，相當2761019-713=前2760306年，近元在2760306%4560=前1506年。
	// 己巳日夜半立春合朔齊同: 最接近前1506年1月1日的立春己巳，
	// CeL.date.stem_branch_index(new Date(CeL.Julian_day.to_Date(CeL.Julian_day.from_YMD(-1506,2,9,'CE',true),'CE',true)))===CeL.date.stem_branch_index('己巳')
	// 在公元前1506年2月9日，
	// CeL.Julian_day.from_YMD(-1506,2,9,'CE',true)=1171396
	顓頊曆 : [ '27759/940', '487/32', 1171396, [ '-479/12/19', '-222/10/31' ], {
		固定置閏 : '年終',
		曆元節氣 : '立春',
		// 曆元月序 : 4
		建正 : '寅',
		// 以夏曆孟冬十月為一年之開始。
		歲首月建 : '亥'
	} ],
	// 後期顓頊曆 : '27759/940,487/32,1171396',

	// 夏曆上元乙丑至今2760589年算外，相當2760589-713=前2759876年，近元在2759876%4560=前1076年。
	// 甲子日夜半冬至合朔齊同版，最接近前1076年1月1日的冬至，
	// CeL.date.stem_branch_index(new Date(CeL.Julian_day.to_Date(CeL.Julian_day.from_YMD(-1077,12,28,'CE',true),'CE',true)))===CeL.date.stem_branch_index('甲子')
	// 在公元前1077年12月28日，
	// CeL.Julian_day.from_YMD(-1077,12,28,'CE',true)=1328411
	古夏曆 : [ '27759/940', '487/32', 1328411, [ '-722/1/16', '-222/10/31' ], {
		固定置閏 : '年終',
		歲首月建 : '寅'
	} ],
	// 张培瑜《中国先秦史历表》
	// 汉魏时期所传夏历已有以人正甲子朔旦雨水或十一月甲子朔旦冬至为历元两种推算方法（上元甲子应为乙丑，《开元占经》给出的干支符合）。

	// 殷曆上元甲寅至今2761080年算外，相當2761080-713=前2760367年，近元在2760367%4560=前1567年。
	// 最接近前1567年1月1日的冬至，
	// CeL.date.stem_branch_index(new Date(CeL.Julian_day.to_Date(CeL.Julian_day.from_YMD(-1568,12,26,'CE',true),'CE',true)))===CeL.date.stem_branch_index('甲子')
	// 在公元前1568年12月26日，
	// CeL.Julian_day.from_YMD(-1568,12,26,'CE',true)=1149071
	殷曆 : [ '27759/940', '487/32', 1149071, [ '-722/1/16', '-222/10/31' ], {
		固定置閏 : '年終',
		// 歲首建丑
		歲首月建 : '丑'
	} ],

	// 周曆上元丁巳至今2761137年算外，相當2761137-713=前2760424年，近元在2760424%4560=前1624年。
	// 最接近前1624年1月1日的冬至，
	// CeL.date.stem_branch_index(new Date(CeL.Julian_day.to_Date(CeL.Julian_day.from_YMD(-1625,12,25,'CE',true),'CE',true)))===CeL.date.stem_branch_index('甲子')
	// 在公元前1625年12月25日，
	// CeL.Julian_day.from_YMD(-1625,12,25,'CE',true)=1128251
	周曆 : [ '27759/940', '487/32', 1128251, [ '-722/1/16', '-222/10/31' ], {
		固定置閏 : /* 12 */'年終',
		// 歲首建子
		歲首月建 : '子'
	} ],

	// 魯曆上元庚子至今2761334年算外，相當前2760621年，近元在前1821年。
	// 魯曆 : '27759/940,487/32,1048991',
	//
	// https://ytliu0.github.io/ChineseCalendar/guliuli_chinese.html
	// 《開元占經》給出的魯曆上元積年是2761334，歷代多位學者已發現這數字不正確。
	// 張培瑜推算2761514年算外，相當2761514-713=前2760801年，近元在2760801%4560=前2001年。
	// 最接近前2001年1月1日的冬至，
	// CeL.date.stem_branch_index(new Date(CeL.Julian_day.to_Date(CeL.Julian_day.from_YMD(-2002,12,25,'CE',true),'CE',true)))===CeL.date.stem_branch_index('甲子')
	// 在公元前2002年12月25日，
	// CeL.Julian_day.from_YMD(-2002,12,25,'CE',true)=990551
	魯曆 : [ '27759/940', '487/32', 990551, [ '-479/12/19', '-222/10/31' ], {
		固定置閏 : /* 12 */'年終',
		// 歲首建子
		// 张培瑜《中国先秦史历表》
		// 鲁历蔀首之岁正月朔日在冬至之前1/19 个月，即1又521/940日。
		曆元閏餘日數: 1 / 19 * (27759 / 940),
		歲首月建 : '子'
	} ],

	// ------------------------------------------------------------------------

	// 《太初曆》於漢成帝末年，由劉歆重新編訂，改稱三統曆。行用於太初元年夏五月至後漢章帝元和二年二月甲寅(104 BCE–85 CE)
	// 曆元: 西漢武帝元封7年11月1日 (天正月, 冬至十一月), 105/12/25 BC, -105/12/25
	// 至於元封七年，復得閼逢攝提格之歲，中冬(仲冬)十一月甲子朔旦冬至，日月在建星，太歲在子，已得太初本星度新正。
	// 朔策(朔望月長) = 月法 / 日法 = 2392 / 81 ≈ 29.530864197530864
	// 中法 / 元法 / 2 = 140530 / 4617 / 2 ≈ 30.43751353692874/2 ≈ 15.21875676846437
	// 太初曆歲實(冬至點間的時間間隔,回歸年長) = 12 * 中法 / 元法 ≈ 365.2501624431449
	//太初曆 : '2392/81,70265/4617/節氣小餘,1683431,-104/6/20~85/3/18',
	太初曆 : [ '2392/81', '70265/4617/節氣小餘', 1683431, '-104/6/20~85/3/18', {
		// 曆元年序 : 143126
	} ],

	// 後漢四分曆以文帝後元三年十一月甲子朔旦冬至(西漢文帝後元3年10月29日, -162/12/25)為曆元。上距魯哀公十四年春孔子獲麟320年。
	// http://www.bsm.org.cn/show_article.php?id=2053
	// lcm(29+499/940, 365+1/4) = 27759/4 = 6939.75日
	// 27759/(365+1/4) = 76年
	後漢四分曆 : '27759/940,487/32/節氣小餘,1662611,85/3/18~237/4/13',

	// 乾象曆_曆元JDN = -898129 = 1796292 - 7377 * 35855 / 2356 | 0
	// 上元己丑以來，至建安十一年丙戌，歲積七千三百七十八年。
	// 1796292: 後漢四分曆 東漢獻帝建安10年冬至
	// http://www.xysa.net/a200/h350/05jinshu/t-017.htm
	// http://sidneyluo.net/a/a05/017.htm
	// https://zh.wikisource.org/wiki/%E6%99%89%E6%9B%B8/%E5%8D%B7017
	//
	// 太陽年 = 周天 / 紀法 = 365+145/589=215130/589
	// 節氣: 求二十四氣: 置冬至小餘，加大餘十五，小餘五百一十五，滿二千三百五十六從大餘，命如法。
	// 215130/589 / 年節氣數 = 35855/2356 = 15 515/2356
	//
	// 朔望月 = 通法 / 日法 = 29+773/1457=43026/1457
	乾象曆 : '43026/1457,35855/2356/節氣小餘,-898129,223/2/18~280/5/16',

	// 景初曆 小餘 曆元
	// https://zh.wikisource.org/wiki/%E6%99%89%E6%9B%B8/%E5%8D%B7018
	// 壬辰以來，至景初元年丁已歲，積四千四十六，算上。
	// (CeL.stem_branch_index('壬辰')-CeL.stem_branch_index('丁已')).mod(60)===(CeL.from_Chinese_numeral('四千四十六')-1).mod(60)
	// 此元以天正建子黃鐘之月為曆初，元首之歲，夜半甲子朔旦冬至。
	//
	// 太陽年 = 周天 / 紀法 = 365+455/1843 = 673150/1843
	// 節氣 推二十四氣術
	// 673150/1843/24 =336575/22116 = 15 4835/22116
	// 求次氣，加大餘十五，小餘四百二，小分十一，小分滿氣法(12)從小餘，小餘滿紀法(1843)從大餘，命如前，次氣日也。
	// 15+(402+11/12)/1843 = 336575/22116
	//
	// 朔望月 = 通數 / 日法 = 29+2419/4559 = 134630/4559
	// 推朔術曰：以通數乘積月，為朔積分。如日法而一，為積日，不盡為小餘。以六十去積日，餘為大餘。大餘命以紀，算外，所求年天正十一月朔日也。
	// 求次月，加大餘二十九，小餘二千四百一十九，小餘滿日法從大餘，命如前，次月朔日也。小餘二千一百四十(朔虛分)以上，其月大也。
	//
	// 近點月 = 通周 /日法 = 27+2528/4559 = 125621/4559
	//
	// 壬辰以來，至景初元年丁已歲，積4046，算上。此元以天正建子黃鐘之月為曆初，元首之歲，夜半甲子朔旦冬至。元法11058。紀法1843。紀月22795。章歲。19。章月235。章閏7。通數134630。日法4559。餘數9670。周天673150。紀歲中12。氣法12。沒分67315。沒法967。月周24638。通法47。會通790110。朔望合數67315。入交限數722795。通周125621。周日日餘2528。周虛2031。斗分455。
	// 十九年七閏法: 周天/紀法 / (通數/日法) = 673150/1843 / (134630/4559) = 24 * (336575/22116) / (134630/4559) = 12 7/19
	//
	// 景初曆_曆元JDN = 330191 = 1807615 - 4045 * 年節氣數 * 336575 / 22116 | 0,
	// 1807615: 後漢四分曆 青龍4年冬至
	景初曆 : '134630/4559,336575/22116,330191,237/4/13~452/2/6',

	// 姜岌厯: 姜岌造《三紀甲子歷》，始悟以月食衝檢日宿度所在。
	// 晉書/卷018:
	// 甲子上元以來，至魯隱西元年已未歲，凡八萬二千七百三十六，至晉孝武太元九年甲申歲，凡八萬三千八百四十一，算上。元法七千三百五十三。紀法二千四百五十一。通數十七萬九千四十四。日法六千六十二。月周三萬二千七百六十六。氣分萬二千八百六十。元月九萬九百四十五。紀月三萬三百一十五。沒分四萬四千七百六十一。沒法六百四十三。斗分六百五。周天八十九萬五千二百二十。一名紀日。章月二百三十五。章歲十九。章閏七。歲中十二。會數四十七。日月八百九十三歲凡四十七會分盡。氣中十二。甲子紀交差九千一百五十七。甲申紀交差六千三百三十七。甲辰紀交差三千五百一十七。周半一百二十七。朔望合數九百四十一。會歲八百九十三。會月萬一千四十五。小分二千一百九十六。章數一百二十九。小分二千一百八十三。周閏大分七萬六千二百六十九。曆周四十四萬七千六百一十。半周天會分三萬八千一百三十四。差分一萬一千九百八十六。會率一千八百八十二。小分法二千二百九。入交限一萬一百四。小周二百五十四。甲子紀差率四萬九千一百七十八。甲申紀差率五萬八千二百三十一。甲辰紀差率六萬七千二百八十四。通周十六萬七千六十三。周日日餘三千三百六十二。周虛二千七百一。
	// 甲子上元以來，至魯隱西元年已未歲，凡82736，至晉孝武太元9年甲申歲，凡83841，算上。元法7353。紀法2451。通數179044。日法6062。月周32766。氣分12860。元月90945。紀月30315。沒分44761。沒法643。斗分605。周天895220。1名紀日。章月235。章歲19。章閏7。歲中12。會數47。日月893歲凡47會分盡。氣中12。甲子紀交差9157。甲申紀交差6337。甲辰紀交差3517。周半127。朔望合數941。會歲893。會月11045。小分2196。章數129。小分2183。周閏大分76269。曆周447610。半周天會分38134。差分11986。會率1882。小分法2209。入交限10104。小周254。甲子紀差率49178。甲申紀差率58231。甲辰紀差率67284。通周167063。周日日餘3362。周虛2701。
	// 周天/紀法 / (通數/日法) = 895220/2451 / (179044/6062) = 12 898/2451
	//
	// 12 7/19 = 5×47/19
	//
	// 895220/2451 / (179044/6062) = (2^2×5×17×2633)/(3×19×43) /
	// ((2^2×17×2633)/(2×7×433))
	// FactorInteger[895220/2451 / (179044/6062)] = (2×5×7×433)/(3×19×43)
	//
	// (2^2×5×17×2633)/(3×19×43) / ((2^2×17×2633)/m)=12 7/19 → m = 6063
	// 為使十九年七閏，通數應為6063。應為傳鈔錯？
	//
	// 179044/6063 = 29 3217/6063
	// 895220/2451/24 = 223805/14706 = 15 3215/14706
	// 三紀曆 曆元JDN = -28760989 = 1861305 - 83840 * 24 * 223805/14706 | 0
	// 1861305: 景初曆東晉孝武帝太元8年11月冬至
	三紀曆 : '179044/6063,223805/14706,-28760989,384/5/7~417/9/21',

	// 唐開元占經 卷一百五：古今歷積年及章率 http://ctext.org/wiki.pl?if=gb&chapter=449774
	// 《梁趙厯》上元甲寅，至今六萬一千七百四十算上。 元法四十三萬二千，紀法七萬二千，蔀法七千二百，章歲六百，章月七千四百二十一（亦曰時法），章閏二百二十二，周天二百六十二萬九千七百五十九，亦曰通數餘數三萬七千七百五十九，斗分一千七百五十九，日法八萬九千五十二，亦曰蔀日月周九萬六千二百五十二，小周八千二十二，會數一百七十三，度餘二萬七千七百一十九，會虛六萬一千三百三十三，交會差一百四十七，度餘三千三百一十一，遲疾差六百餘四千五百三十，周日二十七日，餘四萬九千三百八十，周虛三萬九千六百七十二。
	// 上元甲寅，至今(開元2年)61740算上。元法432000，紀法72000，蔀法7200，章歲600，章月7421，(亦曰時法)章閏222，周天2629759，(亦曰通數)餘數37759，斗分1759，日法89052，(亦曰蔀)日月周96252，小周8022，會數173，度餘27719，會虛61333，交會差147，度餘3311，遲疾差600餘4530，周日27日，餘49380，周虛39672。
	//
	// 疇人傳卷第六: 趙𢾺，河西人也。善曆算。沮渠蒙遜元始時，修元始術。上元甲寅至元始元年壬子，積六萬一千四百三十八算上，元法四十三萬二千，紀法七萬二千，蔀法七千二百。章歲六百，章月七千四百二十一，亦曰時法。章閏二百二十一，周天二百六十二萬九千七百五十九，亦曰通數。餘數三萬七千七百五十九，斗分一千七百五十九，日法八萬九千五十二，亦曰蔀月。月周九萬六千二百五十二，小周八千二十一，會數一百七十三，度餘二萬七千七百一十九，會虛六萬一千三百三十三，交會差一百四十七，度餘三千三百一十一，遲疾差六百，餘四萬一千五百三十。周日二十七，日餘四萬九千三百八十。周虛三萬九千六百七十二。《宋書 大且渠蒙遜傳》、《魏書 律曆志》、《開元占經》
	// 上元甲寅至元始元年壬子，積61438算上，元法432000，紀法72000，蔀法7200。章歲600，章月7421，亦曰時法。章閏221，周天2629759，亦曰通數。餘數37759，斗分1759，日法89052，亦曰蔀月。月周96252，小周8021，會數173，度餘27719，會虛61333，交會差147，度餘3311，遲疾差600，餘41530。周日27，日餘49380。周虛39672。
	//
	// 周天/蔀法 / (通數/日法) = 2629759/7200 / (2629759/89052) = 12 221/600
	// 玄始曆 曆元JDN = -20568349 = 1871530 - 61438 * 24 * 2629759/172800 | 0
	// 1871530: 子夜最接近北涼太祖永安11年11月(北涼太祖玄始0年11月, 411/12)天文冬至之JDN
	玄始曆 : '2629759/89052,2629759/172800,-20568349,452/2/6~522/2/12',

	// https://zh.wikisource.org/wiki/%E5%AE%8B%E6%9B%B8/%E5%8D%B713
	// 《元嘉曆法》：上元庚辰甲子紀首至太甲元年癸亥，三千五百二十三年，至元嘉二十年癸未，五千七百三年，算外。
	// 元嘉曆以寅月（正月）為歲首，寅月中氣雨水為氣首；曆元在正月朔旦夜半雨水時刻。
	//
	// 元嘉曆_曆元JDN = -200089 = 1882912 - 5703 * 年節氣數 * 111035 / 7296 | 0,
	// 1882912: 子夜最接近元嘉20年1月天文雨水(5703/11/3 22:)之JDN(5703/11/4)。
	//
	// 通數/日法 = 29+399/752 = 22207/752
	//
	// 度法，三百四。
	// 365+75/304 = 111035/304
	// 111035/304/24 = 111035/7296 = 15 1595/7296 = 15+(66+11/24)/304 = 15+66/304+11/304/24
	// 推二十四氣術：置入紀年算外，以餘數乘之，滿度法三百四為積沒，不盡為小餘。以六旬去積沒，不盡為大餘，命以紀，算外，所求年雨水日也。求次氣，加大餘十五，小餘六十六，小分十一，小分滿氣法從小餘，小餘滿度法從大餘，次氣日也。雨水在十六日以後者，如法減之，得立春。
	元嘉曆 : [ '22207/752', '111035/7296', -200089, '445/1/24~510/1/26', {
		曆元節氣 : '雨水',
		// 曆元當天是1月1日
		// 曆元月序 : 1
	} ],

	// 大明曆_曆元JDN = -17080189 = 1890157 - 51939 * 年節氣數 * 3605951 / 236946 | 0,
	// 上元甲子至宋大明七年癸卯，五萬一千九百三十九年算外。
	// 1890157: 元嘉曆 大明6年11月冬至
	//
	// 14423804/39491/24 = 3605951/236946
	// 採391年置144閏月法: 24 * (3605951/236946) / (116321/3939) = 12 144/391
	大明曆 : '116321/3939,3605951/236946,-17080189,510/1/26~589/2/21',

	// 魏書/卷107上
	// 壬子元以來，至今大魏正光三年歲在壬寅，積十六萬七千七百五十，算外
	// 正光曆 曆元JDN = -59357929 = 1911706 - 167750 * 年節氣數 * 2213377/145440 | 0,
	// 1911706: 北魏孝明帝正光2年11月天文冬至日
	// 
	// 周天分/日法 = 2213377/74952 = 29 39769/74952
	// 周天分/蔀法/年節氣數 = 2213377/6060/24 = 2213377/145440
	// 推二十四氣術：求次氣，加大餘十五、小餘一千三百二十四、小分一，小分滿氣法二十四，從小餘一；小餘滿蔀法，從大餘一
	// (2213377/6060/24%1)*6060 = 1324 1/24
	正光曆 : '2213377/74952,2213377/145440,-59357929,522/2/12~540/1/25',

	// 上元甲子以來，至大魏興和二年歲在庚申，積二十九萬三千九百九十七，算上。
	// 興和曆 曆元JDN = -105462049 = 1918281 - 293996 * 年節氣數 * 6158017/404640 | 0,
	// 1918281: 孝靜帝興和1年11月天文冬至
	// 周天/蔀法/年節氣數 = 6158017/16860/24 = 6158017/404640
	// 通數/日法 = 6158017/208530 = 29 110647/208530
	興和曆 : '6158017/208530,6158017/404640,-105462049,540/1/25~550/5/31',

	// https://github.com/suchowan/when_exe/blob/master/lib/when_exe/region/chinese/twins.rb
	// 隋書/卷17:
	// 上元甲子，至天保元年庚午，積十一萬五百六算外，章歲六百七十六，度法二萬三千六百六十，斗分五千七百八十七，曆餘十六萬二千二百六十一。
	// 上元甲子(0)，至天保元年(550)庚午(6)，積110506算外，章歲676，度法23660，斗分5787，曆餘162261。
	// 110506%60=46, 110526%60=6, 積年110506→應為110526 + 60n。
	// 天保曆 曆元JDN = -38447089 = 1921934 - 110526 * 24 * 8641687/567840 | 0,
	// 1921934: 近東魏孝靜帝武定7年11月天文冬至
	//
	// 唐開元占經 卷一百五 http://ctext.org/wiki.pl?if=gb&chapter=449774
	// 齊宋景天保厯上元甲子至今一十一萬六百九十筭外 元法一百四十一萬九千六百　紀法二千三萬六千六百　蔀法三萬三千六百六十(亦名日度法)章嵗六百七十六(亦名日度法)章閏二百四十九(亦名閏法)章中八千一百一十二　章月八千三百六十一　日法二十九萬二千六百三十五　周天八百六十四萬一千六百八十五(亦名通數 亦名蔀法 亦名没分)餘數一十二萬四千八十七(亦名没分)斗名五千七百八十七　嵗中十二　氣法二十四　㑹數一百七十三　餘九萬一千五十八　㑹通五千七十一萬六千九百一十三　㑹虚二十七萬一千五百七十七　周日二十七　餘一十六萬二千二百六十一　通周八百六萬三千四百六　周虚一十三萬三百七十四　小周九千三十七　月周三十一萬六千二百九十五　望十四餘二十二萬三千九百五十三半　交限數一百五十八　餘一十五萬九千七百三十九半　經月二十九　餘一十五萬五千二百七十二　虚分十三萬七千三百六十三
	// 齊宋景天保厯上元甲子至今110690筭外 元法1419600　紀法20036600　蔀法33660(亦名日度法)章嵗676(亦名日度法)章閏249(亦名閏法)章中8112　章月8361　日法292635　周天8641685(亦名通數 亦名蔀法 亦名没分)餘數124087(亦名没分)斗名5787　嵗中12　氣法24　㑹數173　餘91058　㑹通50716913　㑹虚271577　周日27　餘162261　通周8063406　周虚130374　小周9037　月周316295　望十四餘223953半　交限數158　餘159739半　經月29　餘155272　虚分137363
	// 日法/蔀法=292635/23660=12 249/676=12 章閏/章嵗，故日法、蔀法應無誤。蔀法33660→應為23660。
	// 因 "經月29　餘155272"，29*292635+155272=8641687，周天8641685→應為8641687。
	//
	// 周天/日法 = 8641687/292635 = 29 155272/292635 = 經月+朔餘/日法
	// 月法?/蔀法 = 8641687/23660 = 365 5787/23660 = 365+斗名/蔀法
	// 8641687/23660/24 = 8641687/567840
	天保曆 : '8641687/292635,8641687/567840,-38447089,550/5/31~577/4/4',

	// 隋書/卷17
	// 及武帝時，甄鸞造《天和曆》。上元甲寅至天和元年丙戌，積八十七萬五千七百九十二算外，章歲三百九十一，蔀法二萬三千四百六十，日法二十九萬一百六十，朔餘十五萬三千九百九十一，斗分五千七百三十一，會餘九萬三千五百一十六，曆餘一十六萬八百三十，冬至斗十五度，參用推步。終於宣政元年。
	// 及武帝時，甄鸞造《天和曆》。上元甲寅(50)至天和元年(566)丙戌(22)，積875792算外，章歲391，蔀法23460，日法290160，朔餘十五萬三千九百九十一，斗分5731，會餘93516，曆餘160830，冬至斗十五度，3用推步。終於宣政元年。
	// 875792%60=(22-50)%60
	// 天和曆  曆元JDN = -317950249 = 1927776 - 875792 * 24 * 8568631/563040 | 0,
	// 1927777: 近北周武帝保定5年11月天文冬至
	//
	// 唐開元占經 卷一百五 http://ctext.org/wiki.pl?if=gb&chapter=449774
	// 周甄變天和厯上元甲寅至今八十七萬五千九百四十算外 章嵗三百九十一　章閏一百四十四　蔀法三萬三千四百六十　日法二十九萬一百六十　朔餘一十九萬三千九百九十一　斗分五千七百三十一　㑹餘九萬三千五百一十六　厯餘一十六萬八百三十　冬至日在斗十五度
	// 周甄變天和厯上元甲寅至今875940算外 章嵗391　章閏144　蔀法33460　日法290160　朔餘193991　斗分5731　㑹餘93516　厯餘160830　冬至日在斗15度
	//
	// 8568631/23460 = 365 5731/23460 = 365+斗名/蔀法
	// 8568631/23460/24 = 8568631/563040
	// 8568631/290160 = 29 153991/290160 = 29+朔餘/日法
	天和曆 : '8568631/290160,8568631/563040,-317950249,566/2/6~579/3/14',

	// 隋書/卷17
	// 大象元年，太史上士馬顯等，又上《丙寅元曆》...上元丙寅至大象元年己亥，積四萬一千五百五十四算上。日法五萬三千五百六十三，亦名蔀會法。章歲四百四十八，斗分三千一百六十七，蔀法一萬二千九百九十二。章中為章會法。日法五萬三千五百六十三，曆餘二萬九千六百九十三，會日百七十三，會餘一萬六千六百一十九，冬至日在斗十二度。小周餘、盈縮積，其曆術別推入蔀會，分用陽率四百九十九，陰率九。每十二月下各有日月蝕轉分，推步加減之，乃為定蝕大小餘，而求加時之正。
	// 上元丙寅至大象元年己亥，積41554算上。日法53563，亦名蔀會法。章歲448，斗分3167，蔀法12992。章中為章會法。日法53563，曆餘29693，會日百七十三，會餘16619，冬至日在斗12度。小周餘、盈縮積，其曆術別推入蔀會，分用陽率499，陰率9。每12月下各有日月蝕轉分，推步加減之，乃為定蝕大小餘，而求加時之正。
	// 大象曆  曆元JDN = -13244449 = 1932525 - 41553 * 24 * 1581749/103936 | 0,
	// 1932525: 北周武帝宣政1年11月5日 天文冬至日
	//
	// 唐開元占經 卷一百五 http://ctext.org/wiki.pl?if=gb&chapter=449774
	// 周馬顯景寅元厯上元景寅至今四萬一千六百八十八算外 章嵗四百四十八　章閏一百六十五　斗分三千一百六十七　蔀法一萬三千九百九十二　日法五萬三千五百六十三亦曰蔀㑹法厯餘二萬九千六百九十三　㑹日一百七十三　㑹餘一萬六千六百一十九　冬至日在斗十二度
	// 周馬顯景寅元厯上元景寅至今41688算外 章嵗448　章閏165　斗分3167　蔀法13992　日法53563(亦曰蔀㑹法)厯餘29693　㑹日173　㑹餘16619　冬至日在斗12度
	//
	// 4745247/12992/24 = 1581749/103936
	大象曆 : '1581749/53563,1581749/103936,-13244449,579/3/14~584/2/17',

	// 隋書卷17
	// 張賓所造曆法，其要：以上元甲子已來，至開皇四年歲在甲辰，積四百一十二萬九千一，算上。蔀法，一十萬二千九百六十。章歲，四百二十九。章月，五千三百六。通月，五百三十七萬二千二百九。日法，一十八萬一千九百二十。斗分，二萬五千六十三。會月，一千二百九十七。會率，二百二十一。會數，一百一十半。會分，一十一億八千七百二十五萬八千一百八十九。會日法，四千二十萬四千三百二十。會日，百七十三。餘，五萬六千一百四十三。小分，一百一十。交法，五億一千二百一十萬四千八百。交分法，二千八百一十五。陰陽曆，一十三。餘，十一萬二百六十三。小分，二千三百二十八。朔差，二。餘，五萬七千九百二十一。小分，九百七十四。蝕限，一十二。餘，八萬一千三百三。小分，四百三十三半。定差，四萬四千五百四十八。周日，二十七。餘，一十萬八百五十九。亦名少大法木精曰歲星，合率四千一百六萬三千八百八十九。火精曰熒惑，合率八千二十九萬七千九百二十六。土精曰鎮星，合率三千八百九十二萬五千四百一十三。金精曰太白，合率六千一十一萬九千六百五十五。水精曰辰星，合率一千一百九十三萬一千一百二十五。
	// 張賓所造曆法，其要：以上元甲子已來，至開皇4年歲在甲辰，積4129001，算上。蔀法，102960。章歲，429。章月，5306。通月，5372209。日法，181920。斗分，25063。會月，1297。會率，221。會數，110半。會分，1187258189。會日法，40204320。會日，173。餘，56143。小分，110。交法，512104800。交分法，2815。陰陽曆，13。餘，110263。小分，2328。朔差，2。餘，57921。小分，974。蝕限，12。餘，81303。小分，433半。定差，44548。周日，27。餘，100859。亦名少大法木精曰歲星，合率41063889。火精曰熒惑，合率80297926。土精曰鎮星，合率38925413。金精曰太白，合率60119655。水精曰辰星，合率11931125。
	//
	// 唐開元占經 卷一百五 http://ctext.org/wiki.pl?if=gb&chapter=449774
	// 隋張賔厯上元甲子至今四百一十二萬九千一百三十筭外 元法六百一十七萬七千六百　紀法一百二萬九千六百　蔀法十萬二千九百六十亦名度法章嵗四百二十九　章閏一百五十八　章月五千三百六通月五百三十七萬二千二百九　日法十八萬一千一百二十亦名周法虚分八萬五千三百九十一　朔時法一萬五千六百一十　周天分三千七百六十萬五千四百六十三亦曰没分餘數五十三萬九千八百六十三亦曰没法嵗中十二　斗分三萬五千六十三氣法二十四　氣時法八千五百八十　㑹月一千二百九十七　㑹率二百二十二　合數一百一十半　㑹分一十一億八千七百二十五萬八千一百八十九　㑹通六十九億六千七百七十五萬五千七十三亦曰交數㑹日法四千二十萬四千三百二十㑹日一百七十三　餘五萬六千一百四十三　小分一百一十　㑹虚一十二萬五千七百七十六小分一百一十一　㑹日限一百五十八　㑹九萬八千八百三十八　小分二百二十半　朔望合日數十四　餘一十三萬九千二百二十四　小分一百一十半　交法五億一千二百一十萬四千八百三分法二千八百一十五　隂陽厯一十三　餘三萬二百六十三　小分二千三百二十八　厯合二十七　餘三萬八千六百七　小分一千八百四十一　朔差二　餘五萬七千九百二十二　小分九百七十四　望差一　餘二萬八千九百六十一小分一千八百九十四半　蝕限十二　餘八萬一千三百三　小分四百三十三半　定差四萬四千五百四十八　通周五百一萬二千六百九十九餘嵗一萬三千八百九十七　限三千八百一十三　周日二十七　餘十萬八百五十九亦名小大法周虚八萬一千六十一　通率七　差虚十三萬七千三百七十二　轉率二百四十　分率七百五十八日周一百三十七萬六千四百　小周五千七百三十五　朔望合數十四度　餘一十三萬九千二百二十四半
	// 隋張賔厯上元甲子至今4129130筭外 元法6177600　紀法1029600　蔀法十萬二千九百六十亦名度法章嵗429　章閏158　章月5306通月5372209　日法十八萬一千一百二十亦名周法虚分85391　朔時法15610　周天分37605463亦曰没分餘數539863亦曰没法嵗中十二　斗分35063氣法24　氣時法8580　㑹月1297　㑹率222　合數110半　㑹分1187258189　㑹通6967755073亦曰交數㑹日法40204320㑹日173　餘56143　小分110　㑹虚125776小分111　㑹日限158　㑹98838　小分220半　朔望合日數十四　餘139224　小分110半　交法512104803分法2815　隂陽厯13　餘30263　小分2328　厯合27　餘38607　小分1841　朔差2　餘57922　小分974　望差1　餘28961小分1894半　蝕限十二　餘81303　小分433半　定差44548　通周5012699餘嵗13897　限3813　周日27　餘十萬八百五十九亦名小大法周虚81061　通率7　差虚十三萬七千三百七十二　轉率240　分率758日周1376400　小周5735　朔望合數十四度　餘139224半
	// 開皇曆  曆元JDN = -1506155749 = 1934351 - 4129000 * 24 * 37605463/2471040 | 0,
	// 1934351: 隋文帝開皇3年11月29日 天文冬至日
	//
	// 通月/日法 = 5372209/181920 = 29 96529/181920
	// 周天分/蔀法 = 37605463/102960 = 365 25063/102960
	// 37605463/102960/24 = 37605463/2471040
	開皇曆 : '5372209/181920,37605463/2471040,-1506155749,584/2/17~597/1/24',

	// 隋書卷17
	// 自甲子元至大業四年戊辰，百四十二萬七千六百四十四年，算外。章歲，四百一十。章閏，百五十一。章月，五千七十一。日法，千一百四十四。月法，三萬三千七百八十三。辰法，二百八十六。歲分，一千五百五十七萬二千九百六十三。度法，四萬二千六百四十。沒分，五百一十九萬一千三百一十一沒法，七萬四千五百二十一。周天分，一千五百五十七萬四千四百六十六。斗分，一萬八百六十六。氣法，四十六萬九千四十。氣時法，一萬六百六十。周日，二十七。日餘，一千四百一十三。周通，七萬二百九。周法，二千五百四十八。
	// 自甲子元至大業4年戊辰，1427644年，算外。章歲，410。章閏，151。章月，5071。日法，1144。月法，33783。辰法，286。歲分，15572963。度法，42640。沒分，5191311沒法，74521。周天分，15574466。斗分，10866。氣法，469040。氣時法，10660。周日，27。日餘，1413。周通，70209。周法，2548。
	// 因 (15573963/42640)/(33783/1144) = 12 151/410，歲分15572963→應為15573963。
	//
	// 唐開元占經 卷一百五 http://ctext.org/wiki.pl?if=gb&chapter=449774
	// 大業曆  曆元JDN = -519493909 = 1943118 - 1427644 * 24 * 5191321/341120 | 0,
	// 1943118: 近隋煬帝大業3年11月26日 天文冬至日
	//
	// 月法/日法 = 33783/1144
	// 歲分/度法 = 15573963/42640 = 365 10363/42640
	// 15573963/42640/24 = 5191321/341120
	大業曆 : '33783/1144,5191321/341120,-519493909,597/1/24~619/1/21',

	// 貞觀十九年（645年）之後採用平朔法。
	// 新唐書/卷025:
	// 《戊寅曆》上元戊寅歲至武德九年丙戌，積十六萬四千三百四十八算外。章歲六百七十六。亦名行分法。章閏二百四十九。章月八千三百六十一。月法三十八萬四千七十五。日法萬三千六。時法六千五百三度法、氣法九千四百六十四氣時法千一百八十三。歲分三百四十五萬六千六百七十五。歲餘二千三百一十五。周分三百四十五萬六千八百四十五半。斗分一千四百八十五半。沒分七萬六千八百一十五。沒法千一百三。曆日二十七，曆餘萬六千六十四。曆周七十九萬八千二百。曆法二萬八千九百六十八。餘數四萬九千六百三十五。章月乘年，如章歲得一，為積月。以月法乘積月，如日法得一，為朔積日；餘為小餘。日滿六十，去之；餘為大餘。命甲子算外，得天正平朔。加大餘二十九、小餘六千九百一，得次朔。加平朔大餘七、小餘四千九百七十六、小分四之三，為上弦。又加，得望。又加，得下弦。餘數乘年，如氣法得一，為氣積日。命日如前，得冬至。加大餘十五、小餘二千六十八、小分八之一，得次氣日。加四季之節大餘十二、小餘千六百五十四、小分四，得土王。凡節氣小餘，三之，以氣時法而一，命子半算外，各其加時。置冬至小餘，八之，減沒分，餘滿沒法為日。加冬至去朔日算，依月大小去之，日不滿月算，得沒日。餘分盡為減。加日六十九、餘七百八，得次沒。
	// 《戊寅曆》上元戊寅歲至武德9年丙戌，積164348算外。章歲676。亦名行分法。章閏249。章月8361。月法384075。日法13006。時法6503度法、氣法9464氣時法1183。歲分3456675。歲餘2315。周分3456845半。斗分1485半。沒分76815。沒法1103。曆日27，曆餘16064。曆周798200。曆法28968。餘數49635。章月乘年，如章歲得1，為積月。以月法乘積月，如日法得1，為朔積日；餘為小餘。日滿60，去之；餘為大餘。命甲子算外，得天正平朔。加大餘29、小餘6901，得次朔。加平朔大餘7、小餘4976、小分4之3，為上弦。又加，得望。又加，得下弦。餘數乘年，如氣法得1，為氣積日。命日如前，得冬至。加大餘15、小餘2068、小分8之1，得次氣日。加4季之節大餘12、小餘1654、小分4，得土王。凡節氣小餘，3之，以氣時法而1，命子半算外，各其加時。置冬至小餘，8之，減沒分，餘滿沒法為日。加冬至去朔日算，依月大小去之，日不滿月算，得沒日。餘分盡為減。加日69、餘708，得次沒。
	//
	// 唐開元占經 卷一百五 http://ctext.org/wiki.pl?if=gb&chapter=449774
	// 傅仁均戊寅厯上元戊寅至今一十六萬四千四百三十六筭外 章嵗六百七十六亦名行分法章閏二百四十九　章月八千六百六十一　月法三十八萬四千七十五日法一萬三千六　時法六千五百三　度法九千四百六十四亦名氣法氣時法一千一百八十三　嵗分三百四十五萬六千六百七十五　嵗餘二千三百一十五　周天分三百四十五萬六千八百四十五斗分二千四百八十五半　没分七萬六千八百一十五没法一千一百三　厯日二十七　厯日餘一萬六千六十四　厯周七十九萬八千二百　厯法二萬八千九百六十八　餘數四萬九千六百三十五
	// 傅仁均戊寅厯上元戊寅至今164436筭外 章嵗676亦名行分法章閏249　章月8661　月法384075 日法13006　時法6503　度法9464亦名氣法氣時法1183　嵗分3456675　嵗餘2315　周天分3456845 斗分2485半　没分76815没法1103　厯日27　厯日餘16064　厯周798200　厯法28968　餘數49635
	// 平朔戊寅元曆  曆元JDN = -58077529 = 1949692 - 164348 * 24 * 1152225/75712 | 0,
	// 1949692: 近唐高祖武德8年11月14日 天文冬至日
	//
	// 嵗分/度法/年節氣數 = 3456675/9464/24 = 1152225/75712
	// 月法/日法 = 384075/13006
	//
	// 為避連四大月，貞觀十九年（645年）之後採用平朔法。麟德元年（664年），被《麟德曆》取代。
	//
	// https://github.com/suchowan/when_exe/blob/master/lib/when_exe/region/chinese/calendars.rb
	平朔戊寅元曆 : '384075/13006,1152225/75712,-58077529,645/2/2~666/2/9',

	// 文武天皇元年（697年）から儀鳳暦が単独で用いられるようになった（ただし、前年の持統天皇10年説・翌年の文武天皇2年説もある）。ただし、新暦の特徴の1つであった進朔は行われなかったとされている。その後67年間使用されて、天平宝字8年（764年）に大衍暦に改暦された。
	// https://github.com/suchowan/when_exe/blob/master/lib/when_exe/region/japanese/twins.rb
	// 122357/335/24 = 122357/8040
	// 續日本紀/卷第廿四: 天平寶字七年八月戊子: 廢儀鳳暦始用大衍暦。
	平朔儀鳳暦 : '39571/1340,122357/8040,-96608689,696/2/9~764/2/7'
});




/*

'-86/12/25'.to_Date('CE').to_太初曆()
CeL.太初曆_Date(38,10,1).format('CE');

CeL.太初曆_Date.test(-2e4, 1e7, 4).join('\n') || 'OK';
// 110476 ms, error 0/4


CeL.後漢四分曆_Date.test(-2e4, 1e7, 4).join('\n') || 'OK';
// 103443 ms, error 0/4

CeL.乾象曆_Date.test(-2e4, 1e7, 4).join('\n') || 'OK';
// 100272 ms, error 0/4


CeL.景初曆_Date.test(-2e4, 1e7, 4).join('\n') || 'OK';
// 105011 ms, error 0/4





CeL.元嘉曆_Date.test(-2e4, 1e7, 4).join('\n') || 'OK';
// 106947 ms, error 0/4


CeL.大明曆_Date.test(-2e4, 1e7, 4).join('\n') || 'OK';
// 97203 ms, error 0/4


CeL.顓頊曆_Date.test(-2e4, 1e7, 4).join('\n') || 'OK';
// OK

CeL.魯曆_Date.test(-2e4, 1e7, 4).join('\n') || 'OK';
// OK


*/



//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// 以下為應用天文演算的曆法。

//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// Le calendrier républicain, ou calendrier révolutionnaire français (法國共和曆, French Republican Calendar).

// ** Warning: need application.astronomy

// 每月天數。
var French_Republican_MONTH_DAYS = 30,
// epochal year of 1792 CE
French_Republican_epochal_year = 1792 - 1,
// month name
French_Republican_month_name = '|Vendémiaire|Brumaire|Frimaire|Nivôse|Pluviôse|Ventôse|Germinal|Floréal|Prairial|Messidor|Thermidor|Fructidor|Jours complémentaires'
		.split('|'),
// weekday name
French_Republican_weekday_name = 'Primidi|Duodi|Tridi|Quartidi|Quintidi|Sextidi|Septidi|Octidi|Nonidi|Décadi'
		.split('|'),
// 預防 load 時尚未 ready.
French_Republican_year_starts = function(year) {
	if (library_namespace.solar_term_calendar)
		return (French_Republican_year_starts
		// 每年第一天都從秋分日開始。
		= library_namespace.solar_term_calendar('秋分',
		// French: UTC+1
		1 * 60))(year);
};

French_Republican_year_starts.year_of = function(date) {
	French_Republican_year_starts();
	if (this !== French_Republican_year_starts.year_of)
		return French_Republican_year_starts.year_of(date);
};

// 先嘗試看看。
French_Republican_year_starts();

French_Republican_Date.month_name = function(month) {
	return French_Republican_month_name[month];
};

/**
 * calendrier républicain → Gregorian Date @ local
 *
 * TODO: time
 *
 * @param {Integer}year
 *            year of calendrier républicain.
 * @param {Natural}month
 *            month of calendrier républicain. Using 13 for the complementary
 *            days.
 * @param {Natural}date
 *            date of calendrier républicain.
 *
 * @returns {Date} system Date (proleptic Gregorian calendar with year 0)
 */
function French_Republican_Date(year, month, date, shift) {
	// no year 0. year: -1 → 0
	if (year < 1)
		year++;

	return new Date(
			French_Republican_year_starts(year + French_Republican_epochal_year)
					// 一年分為12個月，每月30天，每月分為3周，每周10天，廢除星期日，每年最後加5天，閏年加6天。
					+ ((month - 1) * French_Republican_MONTH_DAYS + date - 1 + (shift || 0))
					* ONE_DAY_LENGTH_VALUE);
}

_.Republican_Date = French_Republican_Date;

function Date_to_French_Republican(date, options) {
	var days = French_Republican_year_starts.year_of(date),
	//
	year = days[0] - French_Republican_epochal_year;
	days = days[1];

	date = Math.floor(days).divided(French_Republican_MONTH_DAYS);
	// year/0/0 → year/1/1
	date[0]++;
	date[1]++;

	if (days %= 1)
		// Each day was divided in 10 hours of 100 minutes.
		// 共和曆的時間單位為十進位制，一旬為十日，一日為十小時，一小時為一百分鐘，一分鐘為一百秒
		date.push(days);
	// no year 0
	if (year < 1)
		year--;
	date.unshift(year);

	// 不動到原 options。
	date[KEY_WEEK] = French_Republican_weekday_name[
		//
		(date[2] - 1) % French_Republican_weekday_name.length];
	days = _format(date, options, French_Republican_Date.month_name);
	if (typeof days === 'string' && (year = days.match(/^(.+? \d+ \D+ )(-?\d+)$/))) {
		if (year[2] > 0 && library_namespace.to_Roman_numeral)
			year[2] = library_namespace.to_Roman_numeral(year[2]);

		var décade = (((date[2] - 1) / French_Republican_weekday_name.length) | 0) + 1;
		// e.g., output:
		// Septidi, 7 Floréal an CCXXIII
		days = 'Décade ' + décade + ' Jour du ' + year[1] + 'an ' + year[2];
	}
	if (false)
		days.décade = (((date[2] - 1) / French_Republican_weekday_name.length) | 0) + 1;
	return days;
}

/*

CeL.Republican_Date.test(-2e4, 4e6, 4).join('\n') || 'OK';
// "OK"

*/
French_Republican_Date.test = new_tester(Date_to_French_Republican, French_Republican_Date, {
	epoch : Date.parse('1792/9/22'),
	month_days : {
		30 : 'common month',
		5 : 'common complementary days',
		6 : 'complementary days in leap year'
	}
});


//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// گاه‌شماری هجری خورشیدی (Solar Hijri calendar, the solar heǰrī calendar)

// ** Warning: need application.astronomy

// 現在伊朗(1925/3/31–)和阿富汗(1922 CE–)的官方曆。
// The present Iranian calendar was legally adopted on 31 March 1925, under the early Pahlavi dynasty.
// Afghanistan legally adopted the official Jalali calendar in 1922 but with different month names.

// http://www.iranicaonline.org/articles/afghanistan-x-political-history
// the solar heǰrī calendar officially replaced the lunar calendar in 1301 Š./1922.
// 阿富汗官方語言 	達利語（波斯語）、普什圖語

// Persian calendar, Kurdish calendar, Afghan calendar
// http://www.calendarhome.com/calculate/convert-a-date
// http://www.viewiran.com/calendar-converter.php


// epochal year of 622 CE
var Solar_Hijri_epochal_year = 622 - 1,
// month name, 春4 夏4 秋4 冬4
// https://fa.wikipedia.org/wiki/%DA%AF%D8%A7%D9%87%E2%80%8C%D8%B4%D9%85%D8%A7%D8%B1%DB%8C_%D9%87%D8%AC%D8%B1%DB%8C_%D8%AE%D9%88%D8%B1%D8%B4%DB%8C%D8%AF%DB%8C
Solar_Hijri_month_name = {
	// 伊朗現代波斯語名稱, گاه‌شماری در ایران
	'ایران' : '|فروردین|اردیبهشت|خرداد|تیر|مرداد|شهریور|مهر|آبان|آذر|دی|بهمن|اسفند'.split('|'),
	// 阿富汗波斯語名稱 （古伊朗波斯語名稱）
	'افغانستان' : '|حمل|ثور|جوزا|سرطان|اسد|سنبله|میزان|عقرب|قوس|جدی|دلو|حوت'.split('|'),
	// 普什圖語（پښتو），帕圖語
	'پشتو' : '|وری|غویی|غبرګولی|چنګاښ|زمری|وږی|تله|لړم|لیندۍ|مرغومی|سلواغه|کب'.split('|'),
	// 庫德語
	'کردی' : '|خاکه‌لێوه|گوڵان|جۆزەردان|پووشپەڕ|گەلاوێژ|خەرمانان|ڕەزبەر|خەزەڵوەر|سەرماوەز|بەفرانبار|ڕێبەندان|رەشەمە'.split('|')
},
// weekday name. In the Iranian calendar, every week begins on Saturday and ends on Friday.
Solar_Hijri_weekday_name = ''
		.split('|'),
// 預防 load 時尚未 ready.
Solar_Hijri_year_starts = function(year) {
	if (library_namespace.solar_term_calendar)
		return (Solar_Hijri_year_starts
				// 透過從德黑蘭（或東經52.5度子午線）和喀布爾精準的天文觀測，確定每年的第一天（納吾肉孜節）由春分開始。
				// the first noon is on the last day of one calendar year and the second
				// noon is on the first day (Nowruz) of the next year.
				// 如果春分點在連續兩個正午之間，那第一個正午落在上一年的最後一天，第二個正午落在下一年的第一天。
				//
				// https://en.wikipedia.org/wiki/Solar_Hijri_calendar#Solar_Hijri_and_Gregorian_calendars
				= library_namespace.solar_term_calendar('春分',
						// 3.5: UTC+3.5 → minute offset
						// 12: 移半天可以取代正午之效果。
						(3.5 + 12) * 60))(year);
};

Solar_Hijri_year_starts.year_of = function(date) {
	Solar_Hijri_year_starts();
	if (this !== Solar_Hijri_year_starts.year_of)
		return Solar_Hijri_year_starts.year_of(date);
};

// 先嘗試看看。
Solar_Hijri_year_starts();

Solar_Hijri_Date.month_name = function(month_serial, is_leap, options) {
	return Solar_Hijri_month_name[options && options.locale || 'ایران'][month_serial];
};

/**
 * Solar Hijri calendar
 *
 * @param {Integer}year
 *            year of Solar Hijri calendar.
 * @param {Natural}month
 *            month of Solar Hijri calendar
 *            days.
 * @param {Natural}date
 *            date of Solar Hijri calendar.
 *
 * @returns {Date} system Date (proleptic Gregorian calendar with year 0)
 */
function Solar_Hijri_Date(year, month, date) {
	// no year 0. year: -1 → 0
	if (year < 1)
		year++;

	return new Date(Solar_Hijri_year_starts(year + Solar_Hijri_epochal_year)
	// 伊朗曆月名由12 個波斯名字組成。前6個月是每月31天，下5個月是30天，最後一個月平年29天，閏年30天。
	// The first six months (Farvardin–Shahrivar) have 31 days, the next
	// five (Mehr–Bahman) have 30 days, and the last month (Esfand) has 29
	// days or 30 days in leap years.
	+ (--month * 30 + Math.min(month, 6) + date - 1)
			* ONE_DAY_LENGTH_VALUE);
}

_.Solar_Hijri_Date = Solar_Hijri_Date;

function Date_to_Solar_Hijri(date, options) {
	var days = Solar_Hijri_year_starts.year_of(date),
	//
	year = days[0] - Solar_Hijri_epochal_year;
	days = days[1];

	date = Math.floor(days);
	if (date < 31 * 6)
		date = date.divided(31);
	else {
		date = (date - 31 * 6).divided(30);
		date[0] += 6;
	}
	// year/0/0 → year/1/1
	date[0]++;
	date[1]++;

	if (days %= 1)
		date.push(days);
	// no year 0
	if (year < 1)
		year--;
	date.unshift(year);

	// 不動到原 options。
	options = Object.assign({
		numeral : library_namespace.to_Perso_numeral
	}, options);
	days = _format(date, options, Solar_Hijri_Date.month_name);
	return days;
}

/*

CeL.Solar_Hijri_Date.test(-2e4, 4e6, 4).join('\n') || 'OK';
// "OK"

*/
Solar_Hijri_Date.test = new_tester(Date_to_Solar_Hijri, Solar_Hijri_Date, {
	epoch : Date.parse('622/3/22'),
	month_days : {
		31 : 'month 1–6',
		30 : 'month 7–11, 12 (leap year)',
		29 : 'common month 12'
	}
});


//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// 彝曆
// TODO: 彝文历算书《尼亥尼司》研究

// 每月天數。
var Yi_MONTH_DAYS = 36,
// 一年10個月。
Yi_MONTH_COUNT = 10,
// 首年（東方之年）以虎為首，依序紀日不間斷。
Yi_DAY_OFFSET = 0,
// 木火土銅水, 分公母/雌雄. 以「銅」代「金」、以「公母」代「陰陽」
Yi_month_name = [],
//
Yi_year_name = '東,東南,南,西南,西,西北,北,東北'.split(','),
// 預防 load 時尚未 ready.
Yi_year_starts = function(year) {
	if (library_namespace.solar_term_calendar)
		return (Yi_year_starts = library_namespace.solar_term_calendar('冬至',
		// 8: UTC+8 → minute offset
		8 * 60))(year);
};

Yi_year_starts.year_of = function(date) {
	Yi_year_starts();
	if (this !== Yi_year_starts.year_of)
		return Yi_year_starts.year_of(date);
};


// 先嘗試看看。
Yi_year_starts();

Yi_month_name.length = 1;
'木火土銅水'.split('').forEach(function(五行) {
	// 陰陽
	Yi_month_name.push(五行 + '公月', 五行 + '母月');
});
// 過年日於曆算法中，古稱「歲餘日」。
Yi_month_name.push('歲餘日');

Yi_Date.month_name = function(month, is_leap, options) {
	return Yi_month_name[month];
};

/**
 * Yi calendar
 *
 * @param {Integer}year
 *            year of Yi calendar.
 * @param {Natural}month
 *            month of Yi calendar.
 *            過年日: 11
 * @param {Natural}date
 *            date of Yi calendar.
 *
 * @returns {Date} system Date (proleptic Gregorian calendar with year 0)
 */
function Yi_Date(year, month, date) {
	// no year 0. year: -1 → 0
	if (year < 1)
		year++;

	if (month !== (month | 0) || !(0 < month && month < 12)) {
		library_namespace.error('Invalid month: ' + month
				+ ' Should be 1–10. 11 for leap year.');
		return new Date(NaN);
	}
	return new Date(Yi_year_starts(year)
	// 2000年: 以 2000/12/21 冬至為基準，1–10月往前數，過年日(11月)往後數。
	+ (date - 1 - ((Yi_MONTH_COUNT + 1) - month) * Yi_MONTH_DAYS)
			* ONE_DAY_LENGTH_VALUE);
}

_.Yi_Date = Yi_Date;

function Date_to_Yi(date, options) {
	var days = Yi_year_starts.year_of(date),
	//
	year = days[0],
	//
	month = (Yi_year_starts(year + 1) - date) / ONE_DAY_LENGTH_VALUE,
	//
	_date = date;
	// console.log([ month, days ])
	days = days[1];

	// no year 0
	if (year < 1)
		year--;

	if ( // days < 5 ||
	Yi_MONTH_COUNT * Yi_MONTH_DAYS < month) {
		date = [ year, Yi_MONTH_COUNT + 1, days + 1 ];
	} else {
		date = [ year + 1,
		//
		Yi_MONTH_COUNT + 1 - Math.ceil(month / Yi_MONTH_DAYS),
		//
		days = 1 + (-month).mod(Yi_MONTH_DAYS) ];
		if (days %= 1) {
			date[2] |= 0;
			date.push(days);
		}
	}

	if (options && options.format === 'name') {
		// 由下面測試，發現 1991–2055 以 +1 能得到最多年首由虎日起，為東方之年之情況。
		if (false) {
			for (var y = 1900, n; y < 2100; y++) {
				n = CeL.Yi_Date(y, 1, 1).to_Yi({
					format : 'name'
				});
				if (n.includes('虎日'))
					console.log(y + n);
			}
		}
		date[0]
		// 但依 hosi.org，2015/5北方之年，應該採 -1。
		//= Yi_year_name[(date[0] - 1).mod(Yi_year_name.length)] + '方之年';
		+= '年';

		date[1] = Yi_Date.month_name(month = date[1]);

		days = date[2];
		if (library_namespace.十二生肖_LIST) {
			days = library_namespace.十二生肖_LIST[(Yi_DAY_OFFSET +
			//
			library_namespace.stem_branch_index(_date))
			//
			% library_namespace.十二生肖_LIST.length];
		}
		date[2] = (month < Yi_MONTH_COUNT + 1 ? (1 + ((date[2] - 1)
		//
		/ library_namespace.十二生肖_LIST.length | 0)) + '輪' : '') + days + '日';
		date = date.join('');
	}

	return date;
}

/*

CeL.Yi_Date.test(-2e4, 4e6, 4).join('\n') || 'OK';
// "OK"

*/
Yi_Date.test = new_tester(Date_to_Yi, Yi_Date, {
	epoch : Date.parse('1000/1/1'),
	continued_month : function(month, old_month) {
		return month === 1 && old_month === 11;
	},
	month_days : {
		36 : '10個月',
		5 : '過年日',
		6 : '閏年過年日'
	}
});



//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// reform of lunisolar calendar

/*

https://en.wikipedia.org/wiki/Lunisolar_calendar#Determining_leap_months

tropical year:
365.2421896698 − 6.15359×10−6T − 7.29×10−10T2 + 2.64×10−10T3
It will get shorter

synodic month:
The long-term average duration is 29.530587981 days (29 d 12 h 44 min 2.8016 s)

ContinuedFraction[365.2421896698/29.530587981]
{12, 2, 1, 2, 1, 1, 17, 2, 1, 2, 20}

FromContinuedFraction[{12, 2, 1, 2, 1, 1, 17, 2, 1, 2, 20}]
687688/55601≈12.3683
// too long
// After these time, the value itself changes. We need another rule.

FromContinuedFraction[{12, 2, 1, 2, 1, 1}]
235/19≈12.3684
// Metonic cycle

(235*29.530587981-19*365.2421896698)*24*60
124.663404672
// About 2 hours error after 19 tropical years
// Surely it's great.

FromContinuedFraction[{12, 2, 1, 2, 1, 1, 17}]
4131/334≈12.3683

(365.2421896698*334-29.530587981*4131)*24*60
46.656291168
// About 1 hour error after 334 tropical years
// But still too long. And the cycle changes with time.

*/



/*

//2667年冬至: JD 747310.9998001553, -2667/1/10 19:59:42.734, 日干支 0, 月日視黃經差 1.1136104778852314, score 1.5306026653852314
//3673年冬至: JD 3062950.8316446813, 3673/12/21 15:57:34.100, 日干支 0, 月日視黃經差 -1.5341348762158304, score 1.7006387824658304


for 理想單調（monotone）之平氣平朔無中置閏曆法

// find 曆元

TODO: 去除ΔT影響

CeL.LEA406.default_type = 'a';
for (var year = -10000; year < 5000; year++) {
	//冬至
	var JD = CeL.equinox(year, 3);
	//甲子
	if (Math.abs(JD % 60 - 61 / 6) > 2) continue;
	//朔旦
	if (CeL.lunar_phase_of_JD(JD, {
			index: true
		}) !== 0 && CeL.lunar_phase_of_JD(JD - 1, {
			index: true
		}) !== 0)
		continue;
	//精算
	JD = CeL.solar_term_JD(year, 18);
	var 日干支 = JD - 61 / 6 | 0,
	//取子夜
	JD0=(JD-日干支<.5?日干支:日干支+1)+61 / 6;
	日干支 = (JD0 - 61 / 6 | 0).mod(60);
	var score = (CeL.JD_to_Date(JD0) - 0) / 24;
	score = Math.abs(JD - JD0) + (日干支 > 30 ? 60 - 日干支 : 日干支) + Math.abs(CeL.lunar_phase_angel_of_JD(JD0)/29.5);
	if (score > 1) continue;
	console.log(year + '年冬至: JD ' + JD + ', ' + CeL.JD_to_Date(JD0).format() + ', 日干支 ' + 日干支 + ', 月日視黃經差 ' + CeL.lunar_phase_angel_of_JD(JD0) + ', score ' + score);
}

//-2610年冬至: JD 768129.8507179104, -2610/12/20 0:0:0.000, 日干支 0, 月日視黃經差 2.9119043939281255, score 0.4146573797018283
//640年冬至: JD 1955169.7904528817, 640/12/22 0:0:0.000, 日干支 0, 月日視黃經差 -0.4712520273751579, score 0.3921884300238532
//2185年冬至: JD 2519469.9652989875, 2185/12/22 0:0:0.000, 日干支 0, 月日視黃經差 -2.492848316425807, score 0.2858710118122517

('-2610/12/20'.to_Date()-'2185/12/22'.to_Date())/86400000=1751340
// 回歸年
1751340/(2185+2609)=365.3191489361702

*/


//----------------------------------------------------------------------------------------------------------------------------------------------------------//

// http://en.wikipedia.org/wiki/Easter
// http://en.wikipedia.org/wiki/Computus
// http://www.merlyn.demon.co.uk/estralgs.txt
function jrsEaster(YR) { // Fast JRSEaster, unsigned 32-bit year
  var gn, xx, cy, DM
  gn = YR % 19					// gn ~ GoldenNumber
  xx = (YR/100)|0
  cy = ((3*(xx+1)/4)|0) - (((13+xx*8)/25)|0)	// cy ~ BCPcypher
  xx = ( 6 + YR + ((YR/4)|0) - xx + ((YR/400)|0) ) % 7
  DM = 21 + (gn*19 + cy + 15)%30 ; DM -= ((gn>10) + DM > 49) // PFM
  return DM + 1 + (66-xx-DM)%7 /* Day-of-March */ }


//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// export methods.

// register
Object.assign(String_to_Date.parser, {
	// e.g., "8.19.15.3.4 1 K'an 2 K'ayab'".to_Date('Maya').format()
	Maya : Maya_Date,
	Myanmar : _parser(Myanmar_Date, Myanmar_Date.new_year_Date),
	Egyptian : _parser(Egyptian_Date)
});

library_namespace.set_method(Date.prototype, Object.assign({
	to_Long_Count : set_bind(Maya_Date.to_Long_Count),
	to_Tabular : set_bind(Date_to_Tabular),
	to_Hebrew : set_bind(Date_to_Hebrew),
	to_Dai : function(options) {
		// 轉成紀元積日數。
		return Dai_Date.date_of_days((this - Dai_Date.epoch)
				/ ONE_DAY_LENGTH_VALUE | 0, options);
	},
	to_Myanmar : set_bind(Date_to_Myanmar),
	to_Hindu : set_bind(Date_to_Hindu),
	to_Indian_national : set_bind(Date_to_Indian_national),
	to_Bangla : set_bind(Date_to_Bangla),
	to_Thai : set_bind(Date_to_Thai),
	to_Bahai : set_bind(Date_to_Bahai),
	to_Coptic : set_bind(Date_to_Coptic),
	to_Ethiopian : set_bind(Date_to_Ethiopian),
	to_Armenian : set_bind(Date_to_Armenian),
	to_Egyptian : set_bind(Date_to_Egyptian),
	to_Byzantine : set_bind(Date_to_Byzantine),
	to_Nanakshahi : set_bind(Date_to_Nanakshahi),
	to_Revised_Julian : set_bind(Date_to_Revised_Julian),

	// 以下為應用天文演算的曆法。
	to_Republican : set_bind(Date_to_French_Republican),
	to_Solar_Hijri : set_bind(Date_to_Solar_Hijri),
	// to_Yi_calendar
	to_Yi : set_bind(Date_to_Yi)
}, to_曆));


return (
	_// JSDT:_module_
);
}


});

