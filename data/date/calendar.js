
/**
 * @name	CeL function for calendrical calculations.
 * @fileoverview
 * 本檔案包含了曆法轉換的功能。
 *
 * @since 2014/4/12 15:37:56
 */

// http://www.funaba.org/calendar-conversion
// http://www.fourmilab.ch/documents/calendar/
// http://the-light.com/cal/converter/
// http://keith-wood.name/calendars.html
// http://www.cc.kyoto-su.ac.jp/~yanom/pancanga/index.html

'use strict';
if (typeof CeL === 'function')
CeL.run(
{
name : 'data.date.calendar',
// |application.astronomy.
require : 'data.code.compatibility.|data.native.set_bind|data.date.String_to_Date|data.date.is_leap_year',

code : function(library_namespace) {

//	requiring
var set_bind, String_to_Date, is_leap_year;
eval(this.use());


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


// copy from data.date.
// 一整天的 time 值。should be 24 * 60 * 60 * 1000 = 86400000.
var ONE_DAY_LENGTH_VALUE = new Date(0, 0, 2) - new Date(0, 0, 1),
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
	return 數字序號 (numerical serial) [ {Integer}year, {Natural}month, {Natural}date ]

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
function _format(date, options, to_name, is_leap) {
	var format = options && options.format;

	if (format === 'serial')
		return date;

	if (typeof to_name === 'function')
		// 當作 month_to_name。
		date[1] = to_name(date[1], is_leap, options);
	else if (Array.isArray(to_name))
		to_name.forEach(function(func, index) {
			if (index === 3)
				index = KEY_WEEK;
			date[index] = func(date[index], is_leap);
		});
	else
		library_namespace.warn('_format: 無法辨識之 to_name: ' + to_name);

	if (format === 'item')
		return date;

	if (options && typeof options.numeral === 'function') {
		date[0] = options.numeral(date[0]);
		date[2] = options.numeral(date[2]);
	}

	format = date.slice(0, 3).reverse().join(' ');
	if (options) {
		if (options.postfix)
			format += options.postfix;
		if (options.prefix)
			format = options.prefix + format;
	}

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
	options = Object.assign(library_namespace.null_Object(),
			new_tester.default_options, options || {});
	var epoch = options.epoch || to_Date.epoch || 0,
	//
	month_days = options.month_days, CE_format = options.CE_format, continued_month = options.continued_month;

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

		function get_month_serial(month) {
			if (isNaN(month)) {
				var matched = month.match(/^\D?(\d{1,2})$/);
				if (!matched)
					throw 'Illegal month name: ' + month;
				month = matched[1] | 0;
			}
			return month;
		}

		var begin = new Date, date_name, old_date_name, error = [];
		if (!(0 < error_limit && error_limit < 1e9))
			error_limit = new_tester.default_options.error_limit;

		for (; begin_Date <= end_Date && error.length < error_limit; begin_Date += ONE_DAY_LENGTH_VALUE) {
			// 正解: Date → calendar date
			date_name = to_Calendar(new Date(begin_Date), options);
			if (old_date_name
					//
					&& (date_name[2] - old_date_name[2] !== 1 || old_date_name[1] !== date_name[1])) {
				if (false)
					library_namespace.log((begin_Date - epoch)
							/ ONE_DAY_LENGTH_VALUE + ': ' + date_name.join());
				// 確定 old_date_name 的下一個天為 date_name。
				// 月差距
				tmp = get_month_serial(date_name[1])
						- get_month_serial(old_date_name[1]);

				if (date_name[2] - old_date_name[2] === 1)
					tmp = tmp !== 0 && !continued_month(date_name[1], old_date_name[1])
						&& '隔日(日期名接續)，但月 serial 差距 !== 0';
				else if (date_name[2] !== 1)
					tmp = '日期名未接續: 隔月/隔年，但日期非以 1 起始';
				else if (!(old_date_name[2] in month_days))
					tmp = '日期名未接續: 前一月末日數 ' + old_date_name[2] + '未設定於 month_days 中';
				else if (tmp !== 1 && (tmp !== 0
					// 這邊不再檢查年份是否差一，因為可能是閏月。
					// || date_name[0] - old_date_name[0] !== 1
					) && !continued_month(date_name[1], old_date_name[1]))
					tmp = '月名未接續';
				else if (date_name[2] === old_date_name[2])
					tmp = '前後日期名相同';
				else
					// 若 OK，必得設定 tmp!
					tmp = false;

				if (tmp) {
					error.push(tmp + ': ' + old_date_name.join('/') + ' ⇨ '
							+ date_name.join('/') + ' ('
							+ (new Date(begin_Date)).format(CE_format) + ')');
				}
			}
			old_date_name = date_name;

			// 反解: calendar date → Date
			tmp = to_Date(date_name[0], date_name[1], date_name[2]);
			if (begin_Date - tmp !== 0)
				error.push(begin_Date + ' ('
						+ (new Date(begin_Date)).format(CE_format) + ', '
						+ (begin_Date - epoch) / ONE_DAY_LENGTH_VALUE
						+ ' days): ' + date_name.join(',') + ' → '
						+ tmp.format(CE_format));
		}

		library_namespace.debug((new Date - begin) + ' ms, error '
				+ error.length + '/' + error_limit);
		return error;
	};
}

new_tester.default_options = {
	month_days : {
		29 : '大月',
		30 : '小月'
	},
	CE_format : {
		parser : 'CE',
		format : '%Y/%m/%d CE'
	},
	// 延續的月序，月序未中斷。continued/non-interrupted month serial.
	continued_month : function(month, old_month) {
		return month === 1 && (old_month === 12 || old_month === 13);
	},
	// get 數字序號 (numerical serial).
	format : 'serial',
	error_limit : 20
};


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
var Hebrew_month_serial = library_namespace.null_Object(),
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

	library_namespace.err('Hebrew_Date.month_serial: Unknown month name: '
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
		library_namespace.err('Hebrew_Date.month_index: Unknown month: '
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

// caculate days from 1/1/1.
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
			options = library_namespace.null_Object();

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
// GMT 584283
// https://en.wikipedia.org/wiki/Template:Maya_Calendar
var Maya_epoch = (new Date(-3114 + 1, 8 - 1, 11)).getTime(),
// Era Base date, the date of creation is expressed as 13.13.13.13.13.13.13.13.13.13.13.13.13.13.13.13.13.13.13.13.0.0.0.0 4 Ajaw 8 Kumk'u
/*
// get offset:
// 4 Ajaw → 3/13, 19/20
for (i = 0, d = 3, l = 20; i < l; i++, d += 13)
	if (d % l === 19)
		throw d;
// 159
*/
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

	return new Date(days * ONE_DAY_LENGTH_VALUE + Maya_epoch);
}

Maya_Date.days = function(date) {
	return Math.floor((date - Maya_epoch) / ONE_DAY_LENGTH_VALUE);
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





// 求取反函數 caculator[-1](result)
function get_boundary(caculator, result, down, up, limit) {
	if (up - down === 0)
		return up;

	var boundary, value, increase;
	// assert: caculator(down) – caculator(up) 為嚴格遞增/嚴格遞減函數。
	if (caculator(up) - caculator(down) < 0)
		// swap.
		boundary = up, up = down, down = boundary;

	// assert: caculator(down)<caculator(up)
	increase = down < up;
	if (!(limit > 0))
		limit = 800;

	do {
		boundary = (up + down) / 2;
		// console.log(down + ' – ' + boundary + ' – ' + up);
		if (boundary === down || boundary === up)
			return boundary;
		value = result - caculator(boundary);
		if (value === 0) {
			if (result - caculator(down) === 0)
				down = boundary, value = true;
			if (result - caculator(up) === 0)
				up = boundary, value = true;
			if (value && (increase ? up - down > 0 : up - down < 0))
				continue;
			return boundary;
		}
		if (value > 0)
			down = boundary;
		else
			up = boundary;
	} while (--limit > 0 && (increase ? up - down > 0 : up - down < 0));

	throw 'get_boundary: caculator is not either strictly increasing or decreasing?';
}






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
		options = library_namespace.null_Object();

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
// Myanmar_month_days[ type : 0, 1, 2 ]
// = [ days of month 1 (Tagu), days of month 2, ... ]
Myanmar_month_days = [],
// Myanmar_month_days_count[ type : 0, 1, 2 ]
// = [ accumulated days of month 1 (Tagu), accumulated days of month 2, ... ]
Myanmar_month_days_count = [],

// 1060: beginning of well-known (historical) Myanmar year
// well-known exceptions
Myanmar_adjust_watat = {
	1201 : true,
	1202 : false,
	1263 : true,
	1264 : false,
	1344 : true,
	1345 : false
},
// well-known exceptions
Myanmar_adjust_fullmoon = {
	1120 : 1,
	1126 : -1,
	1150 : 1,
	1172 : -1,
	1207 : 1,
	1234 : 1,
	1261 : -1,
	1377 : 1
},
// for fullmoon: Cool Emerald - Based on various evidence such as inscriptions, books, etc...
// Cool Emerald(2015/5)
// got modified dates based on feedback from U Aung Zeya who referred to multiple resources such as Mhan Nan Yar Za Win, Mahar Yar Za Win, J. C. Eade, and inscriptions etc...
Myanmar_adjust_CE = {
	205 : 1,
	246 : 1,
	572 : -1,
	651 : 1,
	653 : 2,
	656 : 1,
	672 : 1,
	729 : 1,
	767 : -1,
	813 : -1,
	849 : -1,
	851 : -1,
	854 : -1,
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
Myanmar_Date.epoch = new Date(2015, 4 - 1, 16, 20, 35, 57) - 1377 * Myanmar_YEAR_LENGTH_VALUE;


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
	m = Myanmar_Date.month_name.en;
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
 * Using integer to caculate Myanmar new year's day.
 *
 * @param {Integer}year
 *            year of Myanmar calendar.
 * @param {Object}[options]
 *            options to use
 *
 * @returns {Date} proleptic Gregorian calendar
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
 * @returns {Date} proleptic Gregorian calendar
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
			type : 0
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
		type : true,
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
	= Myanmar_Date.watat_data(--last_watat_year, reference)).type);

	if (year_data.type)
		// This year is a watat year, and test if it is a big watat year.
		year_data.type
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
	month_days = Myanmar_month_days[year_data.type].slice(0, date[1] - 1);
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
		Array.prototype.unshift.apply(month_days, (new Array(end)).fill(0));

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
 * @returns {Date} proleptic Gregorian calendar
 */
function Myanmar_Date(year, month, date, options) {
	var year_data = Myanmar_Date.year_data(year, options);
	if (isNaN(date))
		date = 1;

	// reckon days count from Tagu 1
	var month_days = Myanmar_month_days_count[year_data.type];
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
 *            system date.
 * @param {Object}[options]
 *            options to use
 *
 * @returns {Array} [ year, month, date ]
 */
function Date_to_Myanmar(date, options) {
	// 前置處理。
	if (!library_namespace.is_Object(options))
		options = library_namespace.null_Object();

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
	accumulated_days = Myanmar_month_days_count[year_data.type];

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
	 * @see http://cool-emerald.blogspot.tw/2013/12/myanmar-astrological-calendar-days.html
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
						tmp = 'သင်္ကြန်အကျ (Thingyan start, ' + (new Date(new_year_info.start_time))
							.format({
								parser : 'CE',
								format : '%H:%M:%S'
							}) + ')';
						break;

					case tmp - 1:
						// Thingyan end day. atat day. atat time:
						tmp = 'သင်္ကြန်အတက် (Thingyan end, ' + (new Date(new_year_info.end_time))
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
		else if (year_data.type && month > 3)
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


CeL.run('https://googledrive.com/host/0B7WW8_JrpDFXTHRHbUJkV0FBdFU/mc.js');

for(var y=-100;y<2000;y++){var d=chk_my(y);CeL.assert([d.myt,CeL.Myanmar_Date.year_data(y).type],'t'+y);d=j2w(d.tg1,1);CeL.assert([d.y+'/'+d.m+'/'+d.d,CeL.Myanmar_Date(y).format('%Y/%m/%d')],y);}
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

/**
 * 泰國佛曆
 * @see https://th.wikipedia.org/wiki/%E0%B8%9B%E0%B8%8F%E0%B8%B4%E0%B8%97%E0%B8%B4%E0%B8%99%E0%B8%AA%E0%B8%B8%E0%B8%A3%E0%B8%B4%E0%B8%A2%E0%B8%84%E0%B8%95%E0%B8%B4%E0%B9%84%E0%B8%97%E0%B8%A2
 * @see https://th.wikipedia.org/wiki/%E0%B8%AA%E0%B8%96%E0%B8%B2%E0%B8%99%E0%B8%B5%E0%B8%A2%E0%B9%88%E0%B8%AD%E0%B8%A2:%E0%B9%80%E0%B8%AB%E0%B8%95%E0%B8%B8%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%93%E0%B9%8C%E0%B8%9B%E0%B8%B1%E0%B8%88%E0%B8%88%E0%B8%B8%E0%B8%9A%E0%B8%B1%E0%B8%99
 */
function Date_to_Thai(date, month, year, weekday) {
	if (library_namespace.is_Date(date)) {
		weekday = date.getDay();
		year = 543 + date.getFullYear();
		month = date.getMonth();
		date = date.getDate();
	} else if (month > 0)
		// month start from 0.
		month--;
	else
		month = null;

	date = [
			(weekday = Date_to_Thai.weekday_name[weekday]) ? 'วัน' + weekday
					: '', date || '', Date_to_Thai.month_name[month] || '',
			year || '' ];
	if (date[0] && (date[1] || date[2] || date[3]))
		date[0] += 'ที่';

	if (!date[2] && !isNaN(date[3]))
		// year only?
		date[3] = 'พ.ศ. ' + date[3];

	year = [];
	date.forEach(function(n) {
		if (n)
			year.push(n);
	});
	return year.join(' ');
}

// start from 0.
Date_to_Thai.month_name = 'มกราคม|กุมภาพันธ์|มีนาคม|เมษายน|พฤษภาคม|มิถุนายน|กรกฎาคม|สิงหาคม|กันยายน|ตุลาคม|พฤศจิกายน|ธันวาคม'
		.split('|');

// 0: Sunday.
Date_to_Thai.weekday_name = 'อาทิตย์|จันทร์|อังคาร|พุธ|พฤหัสบดี|ศุกร์|เสาร์'
		.split('|');


_.Date_to_Thai = Date_to_Thai;


//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// 長曆: 巴哈伊曆法 / Bahá'í calendar / Badí‘ calendar
// https://en.wikipedia.org/wiki/Bah%C3%A1'%C3%AD_calendar
// http://www.bahai.us/welcome/principles-and-practices/bahai-calendar/


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
		options = library_namespace.null_Object();

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
// http://orthodoxwiki.org/Coptic_calendar
// Egypt used the Coptic Calendar till the Khedive Ismael adopted the Western Gregorian Calendar in the nineteenth century and applied it in Egypt's government departments.
// The Coptic calendar has 13 months, 12 of 30 days each and an intercalary month at the end of the year of 5 or 6 days, depending whether the year is a leap year or not. The year starts on 29 August in the Julian Calendar or on the 30th in the year before (Julian) Leap Years. The Coptic Leap Year follows the same rules as the Julian Calendar so that the extra month always has six days in the year before a Julian Leap Year.
// The Feast of Neyrouz marks the first day of the Coptic year. Its celebration falls on the 1st day of the month of Thout, the first month of the Coptic year, which for AD 1901 to 2098 usually coincides with 11 September, except before a Gregorian leap year when it's September 12. Coptic years are counted from AD 284, the year Diocletian became Roman Emperor, whose reign was marked by tortures and mass executions of Christians, especially in Egypt. Hence, the Coptic year is identified by the abbreviation A.M. (for Anno Martyrum or "Year of the Martyrs"). The A.M. abbreviation is also used for the unrelated Jewish year (Anno Mundi).
// To obtain the Coptic year number, subtract from the Julian year number either 283 (before the Julian new year) or 284 (after it).
// http://orthodoxwiki.org/Calendar

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
Armenian_month_name = 'Նավասարդ|Հոռի|Սահմի|Տրե|Քաղոց|Արաց|Մեհեկան|Արեգ|Ահեկան|Մարերի|Մարգաց|Հրոտից|Ավելյաց'.split('|'),
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

	days = [ year, month + 1, days + 1 ];

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
// ** 自 22 BCE 之後不準確。


// References:

// A Chronological Survey of Precisely Dated Demotic and Abnormal Hieratic Sources
// Version 1.0 (February 2007)
// http://www.trismegistos.org/top.php

// Date Converter for Ancient Egypt
// http://aegyptologie.online-resourcen.de/Date_converter_for_Ancient_Egypt

// https://en.wikipedia.org/wiki/Transliteration_of_Ancient_Egyptian
// https://en.wikipedia.org/wiki/Egyptian_hieroglyphs

// https://en.wikipedia.org/wiki/Egyptian_calendar
// According to Roman writer Censorinus (3rd century AD), the Egyptian New Year's Day fell on July 20 in the Julian Calendar in 139 CE, which was a heliacal rising of Sirius in Egypt.
// In 238 BCE, the Ptolemaic rulers decreed that every 4th year should be 366 days long rather than 365. The Egyptians, most of whom were farmers, did not accept the reform, as it was the agricultural seasons that made up their year. The reform eventually went into effect with the introduction of the "Alexandrian calendar" by Augustus in 26/25 BCE, which included a 6th epagomenal day for the first time in 22 BCE. This almost stopped the movement of the first day of the year, 1 Thoth, relative to the seasons, leaving it on 29 August in the Julian calendar except in the year before a Julian leap year, when a 6th epagomenal day occurred on 29 August, shifting 1 Thoth to 30 August.
Egyptian_Date.epoch = String_to_Date('139/7/20', {
	parser : 'Julian'
});

var Egyptian_epochal_year = Egyptian_Date.epoch.getFullYear() | 0,
//
Egyptian_month_days = 30,
//
Egyptian_year_days = 12 * Egyptian_month_days + 5;

Egyptian_Date.epoch = Egyptian_Date.epoch.getTime();

// 521 BCE 與之前應採 -1，520 BCE 之後採 0 則可幾近與 CE 同步。但 520+1460=1980 BCE 與之前應採 -2。
// https://en.wikipedia.org/wiki/Sothic_cycle
Egyptian_Date.default_shift = 0;



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
 * @returns {Date} proleptic Gregorian calendar
 */
function Egyptian_Date(year, month, date, shift) {
	// no year 0. year: -1 → 0
	if (year < 0)
		year++;

	if (shift === undefined)
		shift = Egyptian_Date.default_shift;
	if (shift && !isNaN(shift))
		year += shift;

	date = new Date(Egyptian_Date.epoch + ONE_DAY_LENGTH_VALUE *
	//		
	((year - Egyptian_epochal_year) * Egyptian_year_days
	//
	+ (month - 1) * Egyptian_month_days + date - 1));

	// is the latter year
	if (shift === true && (year = date.format({
		parser : 'CE',
		format : '%Y/%m/%d'
	}).match(/^(-?\d+)\/1\/1$/))
	//
	&& library_namespace.is_leap_year(year[1], 'CE'))
		date = new Date(date.getTime() + Egyptian_year_days
				* ONE_DAY_LENGTH_VALUE);

	return date;
}


_.Egyptian_Date = Egyptian_Date;


function Date_to_Egyptian(date, options) {
	var shift = options && ('shift' in options) && options.shift || Egyptian_Date.default_shift,
	days = (date - Egyptian_Date.epoch) / ONE_DAY_LENGTH_VALUE,
	year = Math.floor(days / Egyptian_year_days) + Egyptian_epochal_year,
	month = (days = days.mod(Egyptian_year_days)) / Egyptian_month_days | 0;
	days = days.mod(Egyptian_month_days) + 1;

	if (!isNaN(shift))
		year -= shift;
	if (year <= 0)
		// year: 0 → -1
		year--;

	date = [ year, month + 1, days | 0 ];
	if (days %= 1)
		date.push(days);

	return date;
}


/*


CeL.Egyptian_Date(-726,1,1,-1).format('CE')
"-527/1/1".to_Date('CE').to_Egyptian({shift:-1})


CeL.Egyptian_Date.test(new Date(-5000, 1, 1), 4e6, 4).join('\n') || 'OK';
// "OK"

*/
Egyptian_Date.test = new_tester(Date_to_Egyptian, Egyptian_Date, {
	month_days : {
		30 : 'common month 1–12',
		5 : 'Epagomenal days',
	}
});




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
 * @returns {Date} proleptic Gregorian calendar
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
				// 透過從德黑蘭（或東經52.5度子午線）和喀布爾精確的天文觀測，確定每年的第一天（納吾肉孜節）由春分開始。
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

Solar_Hijri_Date.month_name = function(month, is_leap, options) {
	return Solar_Hijri_month_name[options && options.locale || 'ایران'][month];
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
 * @returns {Date} proleptic Gregorian calendar
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
 * @returns {Date} proleptic Gregorian calendar
 */
function Yi_Date(year, month, date) {
	// no year 0. year: -1 → 0
	if (year < 1)
		year++;

	if (month !== (month | 0) || !(0 < month && month < 12)) {
		library_namespace.err('Invalid month: ' + month
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
// TODO:
// https://en.wikipedia.org/wiki/Bengali_calendar
// https://en.wikipedia.org/wiki/Nanakshahi_calendar


//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// reform of lunisolar calendar

/*

tropical year:
365.2421896698 − 6.15359×10−6T − 7.29×10−10T2 + 2.64×10−10T3
It will get shorter

synodic month:
The long-term average duration is 29.530587981 days (29 d 12 h 44 min 2.8016 s)

ContinuedFraction[365.2421896698/29.530587981]
{12, 2, 1, 2, 1, 1, 17, 2, 1, 2, 20}

FromContinuedFraction[{12, 2, 1, 2, 1, 1, 17, 2, 1, 2, 20}]
687688/55601~~12.3683
// too long
// After these time, the value itself changes. We need another rule.

FromContinuedFraction[{12, 2, 1, 2, 1, 1}]
235/19~~12.3684
// Metonic cycle

(235*29.530587981-19*365.2421896698)*24*60
124.663404672
// About 2 hours error after 19 tropical years
// Surely it's great.

FromContinuedFraction[{12, 2, 1, 2, 1, 1, 17}]
4131/334~~12.3683

(365.2421896698*334-29.530587981*4131)*24*60
46.656291168
// About 1 hour error after 334 tropical years
// But still too long. And the cycle changes with time.

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

// e.g., "8.19.15.3.4 1 K'an 2 K'ayab'".to_Date('Maya').format()
Object.assign(String_to_Date.parser, {
	Myanmar : function(date, minute_offset, options) {
		var period_end = options && options.period_end;

		if (!isNaN(date)) {
			// use the new year's day
			return Myanmar_Date.new_year_Date(date);

			// use year/1/1
			date |= 0;
			return Myanmar_Date(period_end ? 1 + date : date, 1, 1);
		}

		if (date = date.match(/(-?\d{1,4})[\/\-](\d{1,2})(?:[\/\-](\d{1,2}))?/)) {
			if (period_end)
				date[date[3] ? 3 : 2]++;
			return Myanmar_Date(date[1], date[2], date[3] || 1);
		}
	},
	Maya : Maya_Date
});

library_namespace.set_method(Date.prototype, {
	to_Long_Count : set_bind(Maya_Date.to_Long_Count),
	to_Tabular : set_bind(Date_to_Tabular),
	to_Hebrew : set_bind(Date_to_Hebrew),
	to_Dai : function(options) {
		// 轉成紀元積日數。
		return Dai_Date.date_of_days((this - Dai_Date.epoch)
				/ ONE_DAY_LENGTH_VALUE | 0, options);
	},
	to_Myanmar : set_bind(Date_to_Myanmar),
	to_Indian_national : set_bind(Date_to_Indian_national),
	to_Thai : set_bind(Date_to_Thai),
	to_Bahai : set_bind(Date_to_Bahai),
	to_Coptic : set_bind(Date_to_Coptic),
	to_Ethiopian : set_bind(Date_to_Ethiopian),
	to_Armenian : set_bind(Date_to_Armenian),
	to_Egyptian : set_bind(Date_to_Egyptian),

	to_Republican : set_bind(Date_to_French_Republican),
	to_Solar_Hijri : set_bind(Date_to_Solar_Hijri),
	// to_Yi_calendar
	to_Yi : set_bind(Date_to_Yi)
});


return (
	_// JSDT:_module_
);
}


});

