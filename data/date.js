
/**
 * @name	CeL function for date / time operations.
 * @fileoverview
 * 本檔案包含了 date / time 的功能。
 * @since
 */

'use strict';
if (typeof CeL === 'function')
CeL.run(
{
name : 'data.date',
// includes() @ data.code.compatibility.
require : 'data.code.compatibility.|data.native.set_bind|data.code.parse_escape|data.native.pad',

code : function(library_namespace) {

//	requiring
var set_bind = this.r('set_bind'), parse_escape = this.r('parse_escape'), pad = this.r('pad');


/**
 * null module constructor
 * @class	date objects 的 functions
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




if (false)
(function() {
	/*
	 * opposite of toUTCString() 尚不成熟！假如是type=='date'，不如用new Date()!
	 * string大部分可用new Date(Date.parse(str))代替!
	 * http://www.comsharp.com/GetKnowledge/zh-CN/TeamBlogTimothyPage_K742.aspx
	 */
	var UTCDay, UTCMonth;
	set_Object_value('UTCDay',
			'Sun,Mon,Tue,Wed,Thu,Fri,Sat', 1);
	set_Object_value(
			'UTCMonth',
			'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec',
			1);
	// 0:[Mon, 9 Aug 2004 12:05:00 GMT],1:[Thu Sep 30
	// 18:12:08 UTC+0800 2004],2:[Sat Jun 26 18:19:46 2004]
	var fromUTCStringFormat = [ [ 0, 3, 2, 1, 4 ],
	                            [ 0, 5, 1, 2, 3 ], [ 0, 4, 1, 2, 3 ] ];
	function fromUTCString(str, format) {
		var s = '' + str, f;
		if (!s)
			return;
		if (typeof format == 'undefined')
			if (f = Date.parse(s))
				return new Date(f);
			else
				return 'Unknown format!';// format=0;
		if (!isNaN(format)
				&& format < fromUTCStringFormat.length)
			f = fromUTCStringFormat[format];
		else
			return 'Yet support this kind of format['
			+ format + ']!\nWe support to '
			+ fromUTCStringFormat.length + '.';
		if (!f[0])
			f[0] = ' ';
		s = s.replace(new RegExp(f[0] + '+', 'g'), f[0])
		.split(f[0]);
		if (s.length < f.length)
			return 'The item length of data: ' + s.length
			+ ' is less then format[' + format
			+ ']: ' + f.length + '!\n'
			+ s.join(',');// new
		// Date
		if (f.length == 5)
			s[f[4]] = s[f[4]].split(':');
		else if (f.length == 7)
			s[f[4]] = [ s[f[4]], s[f[5]], s[f[6]] ];
		else
			return 'Illegal date format!';
		if (format == 1 && s[4].match(/([+-]\d{2})/))
			s[f[4]][0] = parseInt(s[f[3]][0])
			+ parseInt(RegExp.$1);
		library_namespace.debug(str + '\n' + s[f[1]] + ','
				+ s[f[2]] + '(' + UTCMonth[s[f[2]]] + '),'
				+ s[f[3]] + ',' + s[f[4]][0] + ','
				+ s[f[4]][1] + ',' + s[f[4]][2]);
		// check, 可以包括星期
		if (!(s[f[2]] = UTCMonth[s[f[2]]])
				|| !(s = new Date(s[f[1]], s[f[2]],
						s[f[3]], s[f[4]][0], s[f[4]][1],
						s[f[4]][2]))) // Date.UTC()
			s = 'Input data error!';
		return s;
	}
});


//----------------------------------------------------------------------------------------------------------------------------------------------------------//

var is_Date = library_namespace.is_Date,
//
UTC_PATTERN = /UTC(?:\s*([+-]?\d{1,2})(:\d{1,2})?)?/i,
// assert: isNaN(DEFAULT_TIME_ZONE) === true
// isNaN(CeL.null_Object()) will throw @ Chrome/36 (Cannot convert object to primitive value),
// therefore we can't use library_namespace.null_Object() here.
DEFAULT_TIME_ZONE = {};

//	嘗試 UTC+08:00 之類的標準表示法。
function get_minute_offset(date_string) {
	var matched = date_string.match(UTC_PATTERN);
	if (matched)
		return 60 * (matched[1] | 0) + (matched[2] | 0);
}



//----------------------------------------------------------------------------------------------------------------------------------------------------------//
//	常數計算。

/** {Number}一整天的 time 值。should be 24 * 60 * 60 * 1000 = 86400000. */
var ONE_DAY_LENGTH_VALUE = new Date(0, 0, 2) - new Date(0, 0, 1),
/** {Number}一分鐘的 time 值。should be 60 * 1000 = 60000. */
ONE_MINTE_LENGTH_VALUE = new Date(0, 0, 1, 0, 2) - new Date(0, 0, 1, 0, 1),
/** {Number}一整時辰的 time 值。should be 2 * 60 * 60 * 1000 = 7200000. */
ONE_時辰_LENGTH_VALUE = new Date(0, 0, 0, 2) - new Date(0, 0, 0, 0);

//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// for Julian date. 期能不使用內建 Date 以計算日期。
// @see https://en.wikipedia.org/wiki/Julian_day#Calculation
// 適用範圍: 4717/3/1 BCE 0:0 之後。

/*

for(var JD=0,d;JD<4e6;JD++){d=CeL.Julian_day.to_YMD(JD);if(JD!==CeL.Julian_day.from_YMD(d[0],d[1],d[2]))throw JD;}
// Array [ 6239, 5, 27 ]

for(var JD=0,d;JD>-4e6;JD--){d=CeL.Julian_day.to_YMD(JD);if(JD!==CeL.Julian_day.from_YMD(d[0],d[1],d[2]))throw JD;}
// -1402
CeL.Julian_day.to_YMD(-1401)
// Array [ -4716, 3, 1 ]



for(var JD=0,d;JD<4e6;JD++){d=CeL.Julian_day.to_YMD(JD,true);if(JD!==CeL.Julian_day.from_YMD(d[0],d[1],d[2],true))throw JD;}
// Array [ 6239, 7, 11 ]

for(var JD=0,d;JD>-4e6;JD--){d=CeL.Julian_day.to_YMD(JD,true);if(JD!==CeL.Julian_day.from_YMD(d[0],d[1],d[2],true))throw JD;}
// -1364
CeL.Julian_day.to_YMD(-1363,true)
// Array [ -4716, 3, 1 ]

*/

/**
 * Get Julian day number (JDN) of date.<br />
 * If type of date is Date, we'll treat date as local date.<br />
 * 因為得出的是 UTC+0 12:0 之 JDN，UTC+0 0:0 之 JD = JDN - .5。 
 * 
 * JDN = Math.round(JD);
 * 
 * @param {String|Date|Number}date
 *            {Date}date or date value
 * @param {Boolean}type
 *            calendar type. true: Gregorian, false: Julian, 'CE': Common Era
 * @param {Boolean}no_year_0
 *            no year 0
 * @param {Boolean}get_remainder
 *            Will return [ {Number} Julian day number (JDN), {Number} remainder ].<br />
 *            remainder / ONE_DAY_LENGTH_VALUE = day.
 * 
 * @returns {Number} Julian day number (JDN)
 */
function Julian_day(date, type, no_year_0, get_remainder) {
	if (typeof date === 'string') {
		// parse '1/1/1'
		var matched = date.match(/(-?\d{1,4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
		if (matched)
			return Julian_day.from_YMD(matched[1] | 0, matched[2] | 0,
					matched[3] | 0, type, no_year_0);

		if (-4716 < date && date < 9999)
			// treat as year
			return Julian_day.from_YMD(date | 0, 1, 1, type, no_year_0);

		if (matched = date.match(/(-?\d{1,4})[\/\-](\d{1,2})/))
			return Julian_day.from_YMD(matched[1] | 0, matched[2] | 0, 1, type,
					no_year_0);

		// throw new Error('Julian_day: Can not parse [' + date + ']');
		if (library_namespace.is_debug(2))
			library_namespace.err('Julian_day: 無法解析 [' + date + ']！');
		return;
	}

	if (!isNaN(date)) {
		// offset: convert local to UTC+0.
		var offset;
		if (is_Date(date)) {
			offset = date.getTimezoneOffset() * ONE_MINTE_LENGTH_VALUE;
			date = date.getTime();
		} else
			offset = Julian_day.default_offset;

		// treat ((date)) as date value. So it's Gregorian.
		type = true;
		date -= offset
		// epoch 為 12:0，需要將之減回來以轉成 midnight (0:0)。
		+ Julian_day.epoch - ONE_DAY_LENGTH_VALUE / 2;
		var remainder;
		if (get_remainder) {
			remainder = date % ONE_DAY_LENGTH_VALUE;
			if (remainder < 0)
				remainder += ONE_DAY_LENGTH_VALUE;
		}
		date = Math.floor(date / ONE_DAY_LENGTH_VALUE);
		return get_remainder ? [ date, remainder ] : date;
	}

	if (Array.isArray(date)) {
		var JD = Julian_day.from_YMD(date[0], date[1], date[2], type, no_year_0);
		return get_remainder ? [ JD, date.length > 3 ? Julian_day.from_HMS(date[3], date[4], date[5]) - .5 : 0 ] : JD;
	}
}

/**
 * Get JDN of (year, month, date).<br />
 * input MUST latter than -4716/3/1 (4717/3/1 BCE)!!
 * 
 * @param {Integer}year
 *            year >= -4716
 * @param {Natural}month
 *            1–12
 * @param {Natural}date
 *            1–31
 * @param {Boolean}type
 *            calendar type. true: Gregorian, false: Julian, 'CE': Common Era
 * @param {Boolean}no_year_0
 *            no year 0
 * 
 * @returns {Number} JDN
 */
Julian_day.from_YMD = function(year, month, date, type, no_year_0) {
	if (Array.isArray(year)) {
		return Array.isArray(month)
		// month = [H,M,S]
		? Julian_day.from_YMD(year[0], year[1], year[2], date, type) - .5 + Julian_day.from_HMS(month[0], month[1], month[2])
		//
		: Julian_day.from_YMD(year[0], year[1], year[2], month, date);
	}
	if (no_year_0 && year < 0)
		// no year 0. year: -1 → 0
		year++;
	if (type === 'CE')
		type = year > 1582
		// Julian calendar（儒略曆）1582年10月4日的下一日為 Gregorian
		// calendar（格里高利曆）1582年10月15日。
		|| year == 1582 && (month > 10 || month == 10 && date >= 15);

	// method: 自 3月起算。
	if (false)
		if (month < 3) {
			year = +year + 4800 - 1 | 0;
			month = +month + 12 - 3 | 0;
		} else {
			year = +year + 4800 | 0;
			month = +month - 3 | 0;
		}
	// a=1: 1–2月, a=0: 3–12月
	//var a = (14 - month) / 12 | 0;
	var a = month < 3 ? 1 : 0;
	year = +year + 4800 - a | 0;
	month = +month + 12 * a - 3 | 0;
	// assert: year, month are integers. month >= 0

	// 3–7月:153日
	return +date + ((153 * month + 2) / 5 | 0)
	//
	+ 365 * year + Math.floor(year / 4) -
	// for Gregorian calendar
	(type ? 32045 + Math.floor(year / 100) - Math.floor(year / 400)
	// for Julian calendar
	: 32083);
};

/**
 * Get day value from hour, minute, second.<br />
 * TODO: microsecond µs, nanosecond ns
 * 
 * @param {Number}[hour]
 *            hour
 * @param {Number}[minute]
 *            minute
 * @param {Number}[second]
 *            second
 * @param {Number}[millisecond]
 *            millisecond
 * 
 * @returns {Number}day value
 */
Julian_day.from_HMS = function(hour, minute, second, millisecond) {
	// initialization, milliseconds to seconds
	var time = millisecond ? millisecond / 1000 : 0;
	if (second)
		time += +second;
	// to minutes
	time /= 60;
	if (minute)
		time += +minute;
	// to hours → to days
	return (time / 60 + (+hour || 0)) / 24;
};


/**
 * Get (year, month, date) of JDN.
 * 
 * @param {Number}JDN
 *            Julian date number
 * @param {Boolean}type
 *            calendar type. true: Gregorian, false: Julian, 'CE': Common Era.
 * @param {Boolean}no_year_0
 *            no year 0
 * 
 * @returns {Array} [ year, month, date ]
 */
Julian_day.to_YMD = function(JDN, type, no_year_0) {
	var f = JDN + 1401 | 0;
	if (type && (type !== 'CE' || JDN >= Gregorian_reform_JDN))
		// to proleptic Gregorian calendar
		f += ((((4 * JDN + 274277) / 146097 | 0) * 3) / 4 | 0) - 38;
	// else: to proleptic Julian calendar with year 0

	var e = 4 * f + 3 | 0,
	//
	g = (e % 1461) / 4 | 0,
	//
	h = 5 * g + 2,
	//
	date = ((h % 153) / 5 | 0) + 1,
	//
	month = (((h / 153 | 0) + 2) % 12) + 1,
	//
	year = (e / 1461 | 0) - 4716 + ((12 + 2 - month) / 12 | 0);

	if (no_year_0 && year < 1)
		// no year 0. year: 0 → -1
		year--;

	// TODO: time
	return  [ year, month, date ];
};

/**
 * JD to YMDHMS. Get (year, month, date, hour, minute, second) of JD.
 * 
 * @param {Number}JD
 *            Julian date
 * @param {Number}zone
 *            local time zone. 0 if is UTC+0 (default), 8 if is UTC+8.
 * @param {Boolean}type
 *            calendar type. true: Gregorian, false: Julian, 'CE': Common Era.
 * @param {Boolean}no_year_0
 *            no year 0
 * 
 * @returns {Array} [ year, month, date, hour, minute, second ]
 */
Julian_day.to_YMDHMS = function(JD, zone, type, no_year_0) {
	// +.5: input JD instead of JDN
	// 1e-16 (days): for error. e.g., CeL.Julian_day.to_YMDHMS(.6, 8)
	// 2451544.5 is 2000/1/1 0:0 UTC+12, 1999/12/31 12:0 UTC+0
	// → 2451545 is 2000/1/1 12:0 UTC+0
	// 0 is -4712/1/1 12:0 UTC+0, -4712/1/2 0:0 UTC+12
	var JDN = Julian_day.to_YMD(JD += .5 + 1e-16 + (zone | 0) / 24, type, no_year_0);
	// to local time
	JDN.push((JD = JD.mod(1) * 24) | 0, (JD = (JD % 1) * 60) | 0, (JD = (JD % 1) * 60) | 0);
	// milliseconds 去除 error。
	// 4e-11:
	// 1e-16*86400 ≈ 1e-11
	// (-Math.log10((1/2-1/3-1/6)*86400)|0) → 1e-11
	// So we use 1e-11 + 1e-11 = 2e-11.
	// But for CeL.Julian_day.to_YMDHMS(.6, 8), it seems still not enough.
	// We should use 4e-11 at least.
	if ((JD %= 1) > 4e-11)
		// 8.64e-9 = 1e-16 * 86400000: 將之前加的 error 修正補回來。
		// 約精確到 1e-7 ms
		JDN.push(JD * 1000 - 8.64e-9);
	// else: 當作 error。
	return JDN;
};

/**
 * Get the local midnight date of JDN.<br />
 * 傳回 local midnight (0:0)。
 * 
 * @param {Integer}JDN
 *            input {Integer}JDN or {Number}JD.
 * @param {Boolean}is_JD
 *            The JDN is JD.
 * @param {Boolean}get_value
 *            get {Number} date value instead of {Date}.
 * 
 * @returns {Date} local midnight date
 */
Julian_day.to_Date = function(JDN, is_JD, get_value, offset) {
	if (!is_JD)
		// epoch 為 12:0，需要將之減回來以轉成 midnight (0:0)。
		JDN -= .5;
	JDN = JDN * ONE_DAY_LENGTH_VALUE + Julian_day.epoch
	//
	+ (isNaN(offset) ? Julian_day.default_offset : offset);
	return get_value ? JDN : new Date(JDN);
};

Julian_day.YMD_to_Date = function(year, month, date, type, get_value, no_year_0) {
	var JDN = Julian_day.from_YMD(year, month, date, type, no_year_0);
	return Julian_day.to_Date(JDN, false, get_value);
};

/**
 * Get Julian date (JD) of date.
 * 
 * @param {String|Date|Number}date
 *            date or date value
 * @param {Boolean}type
 *            calendar type. true: Gregorian, false: Julian, 'CE': Common Era
 * @param {Boolean}no_year_0
 *            no year 0
 * 
 * @returns {Number} Julian date
 */
Julian_day.JD = function(date, type, no_year_0) {
	if (is_Date(date))
		return Date_to_JD(date);
	date = Julian_day(date, type, no_year_0, true);
	return date[0] + date[1] / ONE_DAY_LENGTH_VALUE;
};

/**
 * default offset (time value)
 * 
 * @type {Integer}
 */
Julian_day.default_offset = (new Date).getTimezoneOffset()
		* ONE_MINTE_LENGTH_VALUE;


// Get the epoch of Julian date, i.e., -4713/11/24 12:0
(function() {
	var date = new Date(0),
	// [ -4713, 11, 24 ]
	JD0 = Julian_day.to_YMD(0, true);
	// set the date value of Julian date 0
	date.setUTCFullYear(JD0[0] | 0, (JD0[1] | 0) - 1, JD0[2] | 0);
	date.setUTCHours(12);
	Julian_day.epoch = date.getTime();
})();

/**
 * Gregorian reform JDN.
 * 
 * @type {Integer}
 */
var Gregorian_reform_JDN = Julian_day.from_YMD(1582, 10, 15);

/**
 * Get weekday index of JD.
 * 
 * @param {Number}JD
 *            Julian date
 * @param {Boolean}to_ISO
 *            to ISO type.
 * 
 * @returns {Integer} weekday index.
 * 
 * @see https://en.wikipedia.org/wiki/Zeller's_congruence
 */
Julian_day.weekday = function(JD, to_ISO) {
	return to_ISO ? (Math.floor(JD) % 7) + 1
	// Sunday: 0, Monday: 1, ...
	: (Math.floor(JD) + 1) % 7;
};

_.Julian_day = Julian_day;


//----------------------------------------------------------------------------------------------------------------------------------------------------------//

// Unix time (a.k.a. POSIX time or Epoch time)
function Unix_time(date) {
	return ((date || Date.now()) - Unix_time.epoch) / 1000;
}

_.Unix_time = Unix_time;

// Unix epoch '1970-01-01T00:00:00Z', 0 @ most systems
Unix_time.epoch = Date.parse('1970/1/1 UTC');

Unix_time.to_Date = function (time_value) {
	return new Date(1000 * time_value + Unix_time.epoch);
};


//----------------------------------------------------------------------------------------------------------------------------------------------------------//

var Excel_1900_epoch = Date.parse('1900/1/0'),
Excel_1904_epoch = Date.parse('1904/1/0');


//http://support.microsoft.com/kb/214094
// Excel for Mac uses the 1904 date system and Excel for Windows uses the 1900 date system.
function Excel_date(date) {
	date = date - Excel_1900_epoch;
	return date >= 0 ?
	// 0: 1900/1/0
	// https://en.wikipedia.org/wiki/Year_1900_problem
	// 60: 1900/2/29 (nonexistent date)
	// 61: 1900/3/1
	(date /= ONE_DAY_LENGTH_VALUE) < 60 ? date : date + 1
	//
	: NaN;
}

if (false)
	Excel_date.error_value = {
		valueOf : function() {
			return NaN;
		},
		toString : function() {
			return '#VALUE!';
		}
	};
Excel_date.error_value = '#VALUE!';

_.Excel_date = Excel_date;

//(date = CeL.date.Excel_date.Mac(date)) && date.toFixed(2) || CeL.Excel_date.error_value;
Excel_date.Mac = function(date) {
	date = date - Excel_1904_epoch;
	return date >= 0 ?
	//
	date / ONE_DAY_LENGTH_VALUE : NaN;
};


// ----------------------------------------------------------------------------

// 2016/8/22 22:1:51

/**
 * <code>
 https://msdn.microsoft.com/en-us/library/system.datetime.tofiletime.aspx
 (long) DateTime.ToFileTime Method ()
 A Windows file time is a 64-bit value that represents the number of 100-nanosecond intervals that have elapsed since 12:00 midnight, January 1, 1601 A.D. (C.E.) Coordinated Universal Time (UTC). Windows uses a file time to record when an application creates, accesses, or writes to a file.
 </code>
 */
VS_file_time.epoch = Date.parse('1601-01-01T00:00:00Z');

// https://msdn.microsoft.com/en-us/library/system.datetime.fromfiletime.aspx
// DateTime.FromFileTime Method (Int64)
// Converts the specified Windows file time to an equivalent local time.
function VS_file_time(file_time, return_Date) {
	var date_value = VS_file_time.epoch + file_time / (1e-3 / (1e-9 * 100));
	return return_Date ? new Date(date_value) : date_value;
}


_.VS_file_time = VS_file_time;


//----------------------------------------------------------------------------------------------------------------------------------------------------------//


/**
 * convert the string to Date object.
 * 
 * @example <code>
 * '2003/1-4 12:53:5.45PM'.to_Date('CST').format();
 * '12:53:5.45PM 2003/1-4'.to_Date('CST').format();
 * </code>
 * 
 * @param {String}date_string
 *            date string
 * @param {Object}options {
 *            <br />
 *            {String|RegExp}format: the format used.<br />
 *            {Function}parser: the parser used. if set to unrecognized (e.g.,
 *            null) parser, it will use Date.parse() ONLY.<br />
 *            {String|Number}zone: 設定 date_string 之 time zone or country (e.g.,
 *            'CST', 'TW') || 時差 in hour (例如 TW: UTC+8 → 8, 可使用.5).<br />
 *            {Date}reform: 對某些特殊 paser，如 CE，需要特別設定改曆日期時用。<br />
 *            <br />
 *            {Boolean}period_end:<br />
 *            將指定內容視為一時段，並取得此期間之結束（終結）時間，因此 parse 後將得到第一個不屬於此範圍之時刻。<br />
 *            e.g., '2000/5' → 2000/6/1 0:0:0<br />
 *            e.g., '5/3' → 5/4 0:0:0<br />
 *            e.g., '5/3 12:' → 5/4 13:0:0<br />
 *            e.g., '5/3 12:50' → 5/4 12:51:0<br /> }
 * 
 * @returns {Date} new Date
 * @since 2012/3/22 23:58:38 重構並測試。
 * @see <a href="http://msdn.microsoft.com/zh-tw/library/t5580e8h.aspx"
 *      accessdate="2012/3/23 23:26">JScript Date 物件</a>
 */
function String_to_Date(date_string, options) {
	// 檢測輸入引數(arguments)，將之正規化(normalization)，處理、轉換為規範之標準型態。
	library_namespace.debug('parse (' + typeof date_string
			+ ') [' + date_string + ']', 3,
	'String_to_Date');

	if (typeof date_string === 'date')
		// 應對在 Excel 等外部程式會出現的東西。
		return new Date(date_string);
	if (is_Date(date_string))
		return date_string;

	if (!date_string) {
		// this.toString();
		// date_string = this.valueOf();
		return;
	}

	var tmp, minute_offset;

	if (library_namespace.is_RegExp(options)) {
		// 將 options 當作 pattern。
		options = {
			pattern : options
		};
	} else if (!library_namespace.is_Object(options)) {
		// 前置處理。
		tmp = options;
		options = library_namespace.null_Object();
		if (tmp)
			if (tmp in String_to_Date.parser)
				options.parser = String_to_Date.parser[tmp];
			else if ((tmp in String_to_Date.zone)
					|| !isNaN(tmp))
				options.zone = tmp;
			else
				// 判斷是否為正規 format。
				options.format = tmp;
	}

	if (library_namespace.is_RegExp(options.pattern)
	//
	&& (tmp = date_string.match(options.pattern))) {
		// 依照 matched 匹配的來正規化/設定年月日。
		// e.g., new Date('1234/5/6') === '1234年5月6日'.to_Date(/(\d+)年(\d+)月(\d+)日/)
		// === '5/6/1234'.to_Date({pattern:/(\d+)\/(\d+)\/(\d+)/,pattern_matched:[3,1,2]})
		minute_offset = Array.isArray(options.pattern_matched) ? options.pattern_matched : [ 1, 2, 3 ];
		date_string = minute_offset.map(function(processor) {
			return typeof processor === 'function' ? processor(matched) : tmp[processor];
		}).join(
		// 長度3時當作年月日，否則當作自訂處理。
		minute_offset.length === 3 ? '/' : '');
	}

	// 設定指定 time zone 之 offset in minutes.
	tmp = options.zone;
	library_namespace.debug('設定 time zone / offset hours: '
			+ tmp, 2);
	// TODO: for Daylight Saving Time (DST) time zones, etc.
	if (tmp in String_to_Date.zone)
		tmp = String_to_Date.zone[tmp];
	if (library_namespace.is_Function(tmp))
		tmp = tmp();
	if (typeof tmp !== 'string'
		|| isNaN(minute_offset = get_minute_offset(tmp)))
		minute_offset =
			// 測試純數字小時。
			-12 <= tmp && tmp <= 14 ? 60 * tmp
					// 再測試純數字分鐘。
					: isNaN(tmp)
					//
					? DEFAULT_TIME_ZONE : +tmp;
	library_namespace.debug(
			'最終設定 offset '
			+ (minute_offset === DEFAULT_TIME_ZONE
					? '(default　= ' + String_to_Date.default_offset + ')'
					: minute_offset)
					+ ' minutes.', 2);

	// 判別 parser。
	tmp = library_namespace
	.is_Function(tmp = options.parser) ? tmp
			: String_to_Date.parser[tmp]
	|| String_to_Date.default_parser;

	if (library_namespace.is_Function(tmp)) {
		library_namespace.debug(
				'use customize parser to parse ('
				+ typeof date_string + ') ['
				+ date_string + '].', 2);
		if (tmp = tmp(date_string,
				// assert: parser 亦負責 parse time zone offset.
				minute_offset, options))
			return tmp;
	}

	library_namespace.debug(
			'無法以 parser 判別。use Date.parse() to parse.', 2);
	if (tmp = Date.parse(date_string)) {
		//	TODO: period_end 無效。
		// native parser 會處理  time zone offset.
		tmp = new Date(tmp);
		if (minute_offset !== DEFAULT_TIME_ZONE)
			tmp.setMinutes(tmp.getMinutes()
					+ String_to_Date.default_offset
					- minute_offset);
		return tmp;
	}
}


// 本地之 time zone / time offset (UTC offset by minutes)。
// e.g., UTC+8: 8 * 60 = +480
// e.g., UTC-5: -5 * 60
// 亦為 Date.parse(date_string) 與 new Date() 會自動附上的當地時間差距。
// assert: String_to_Date.default_offset 為整數。
String_to_Date.default_offset = -(new Date).getTimezoneOffset() || 0;


/*
主要指是否計算 0 year。
.no_year_0 = true: 將 astronomical year numbering 轉成一般紀年法（1 BCE→1 CE）。
僅用於計算 Gregorian calendar, Julian calendar。

normal	astronomical
2	2
1	1
-1	0
-2	-1
-3	-2
*/
String_to_Date.no_year_0 = Date_to_String.no_year_0 = true;

var stem_branch_date_pattern;
(function() {
	// e.g., for '公元前720年2月22日'
	var start_pattern = '^[^\\d前\\-−‐:.]*', mid_pattern = '(?:\\s+',
	// e.g., for '1616年2月壬午', '7時'
	end_pattern = ')?[^\\d日時]*$',

	// pattern of date. 當今會準確使用的時間，為 -47xx BCE (Julian day
	// 0) 至 2xxx CE。
	date_pattern = /(?:([前\-−‐]?(?:[0-4]?\d{3}|\d{1,3}))[\/.\-年 ])?\s*([01]?\d)(?:[\/.\-月 ]\s*([0-3]?\d)日?)?/.source,
	// pattern of time.
	time_pattern = /([0-2]?\d)[:時时]\s*(?:([0-5]?\d)[:分]?\s*(?:([0-5]?\d)(?:\.(\d+))?)?)?秒?\s*(?:([PA])M)?/i.source;

	// 日期先: date [time]
	String_to_Date_default_parser.date_first = new RegExp(
			start_pattern + date_pattern + mid_pattern
			+ time_pattern + end_pattern, 'i');
	// 時間先: time [date]
	String_to_Date_default_parser.time_first = new RegExp(
			start_pattern + time_pattern + mid_pattern
			+ date_pattern + end_pattern, 'i');

	//	將於下方作初始化。
	stem_branch_date_pattern = date_pattern;
})();

var BCE_PATTERN = /(?:^|[^a-z.])B\.?C\.?E?(?:[^a-z.]|$)/i,
time_boundary = new Date(0, 0, 1);
time_boundary.setFullYear(0);
time_boundary = time_boundary.getTime();

/**
 * parse date_string and return the new Date.
 * 
 * @param {String}date_string
 *            date string.
 * @param {Integer}minute_offset
 *            (指定 time zone 之) offset in minutes.
 * @param {Object}options {
 *            {Boolean}period_end:<br />
 *            將指定內容視為一時段，並取得此期間之結束（終結）時間，因此 parse 後將得到第一個不屬於此範圍之時刻。<br />
 *            e.g., '2000/5' → 2000/6/1 0:0:0<br />
 *            e.g., '5/3' → 5/4 0:0:0<br />
 *            e.g., '5/3 12:' → 5/4 13:0:0<br />
 *            e.g., '5/3 12:50' → 5/4 12:51:0<br /> }
 * 
 * @returns {Date} new Date
 * @see <a href="http://php.net/manual/en/function.date.php"
 *      accessdate="2012/3/23 20:51">PHP: date - Manual</a>
 */
function String_to_Date_default_parser(date_string,
		minute_offset, options) {
	if (is_Date(date_string))
		return date_string;

	// 前置處理。
	if (!library_namespace.is_Object(options))
		options = library_namespace.null_Object();

	var date_data, period_end = options.period_end,
	// matched string
	matched,
	//
	no_year_0 = 'no_year_0' in options ? options.no_year_0
			: String_to_Date.no_year_0;

	date_string = date_string.trim();
	if (isNaN(minute_offset))
		if (isNaN(minute_offset = get_minute_offset(date_string)))
			minute_offset = String_to_Date.default_offset;
		else
			// 留下此 pattern 在 match 時會出錯。
			date_string = date_string.replace(UTC_PATTERN,
			'').trim();

	if (matched = date_string
	// U+2212 '−': minus sign
	// 為了 calendar 測試，年分需要能 parse 0–9999。
	.match(/^[^\d\/\-:日月年前]*(\d{3,4}|([前\-−‐]?\d{1,4})年|[前\-−‐]\d{1,4})[^\d\/\-:日月年前]*$/)) {
		// 僅有 xxx/1xxx/2xxx 年(year) 時。
		date_string = (matched[2] || matched[1]).replace(/^[前−]/, '-000');
		if (period_end) {
			matched = date_string.includes('00');
			if (!++date_string)
				// 預防 前1年 → 0年。
				date_string = no_year_0 ? '0001' : '0000';
			else if (matched && (date_string = '00' + date_string).length < 4)
				date_string = '0' + date_string;
			// 已處理過 period_end，因此除去此 flag。
			period_end = false;
		}
		date_string += '/1';
	} else
		// 依照中文之習慣，日期 + 時間中間可不加空格。
		date_string = date_string.replace(/日(\d)/, '日 $1');

	if (false &&
	// 速度似乎差不多。
	(date_data = date_string.match(/^(-?\d{1,4})\/(\d{1,2})\/(\d{1,2})$/))) {
		//library_namespace.debug('輸入格式: 日期', 2);
		date_data.shift();
		
	} else if ((date_data = date_string
			.match(String_to_Date_default_parser.date_first))
			&& isNaN(date_data[0])) {
		//library_namespace.debug('輸入格式: 日期 (+ 時間)', 2);
		date_data.shift();

	} else if (date_data = date_string
			.match(String_to_Date_default_parser.time_first)) {
		//library_namespace.debug('輸入格式: 時間 (+ 日期): 未匹配或僅有一數字', 2);
		//    [ 1, 2, 3, 4, 5, 6, 7, 8 ]
		// → [ 6, 7, 8, 1, 2, 3, 4, 5 ]
		date_data.shift();
		date_data.unshift(date_data[5], date_data[6], date_data[7]);
		date_data.length = 8;

	} else {
		library_namespace.debug('無法 parse: [' + date_string
				+ ']', 2, 'String_to_Date_default_parser');
		return;
	}


	// ----------------------------------------------------

	// date_data: index: [ year, month, month_day (Day of
	// the month), hour, minute, second, milliseconds, Ante
	// meridiem or Post meridiem ]

	library_namespace.debug(date_data.join('<br />'), 2,
	'String_to_Date_default_parser');

	var year, tmp = date_data.length === 8 && date_data.pop();

	if (tmp === 'P' || tmp === 'p')
		// is PM (else: AM or 24-hour format)
		date_data[3] = 12 + (date_data[3] | 0);

	if (isNaN(year = +date_data[0])
			&& /^前/.test(date_data[0]))
		year = -date_data[0].slice(1);
	// fix browser Date.parse() bug for BCE date.
	else if (year > 0 && BCE_PATTERN.test(date_string)) {
		year = -year;
		if (!('no_year_0' in options))
			// default: no year 0
			no_year_0 = true;
	}

	// 確定正確年份: 若無 year 0 則所有負的年份皆 +1，
	// 轉成<a
	// href="http://en.wikipedia.org/wiki/Astronomical_year_numbering"
	// accessdate="2013/2/11 15:40" title="Astronomical year
	// numbering">天文年號</a>。
	// (BCE) -1 → 0, -2 → -1, -3 → -2, ..
	if (year < 0) {
		if (no_year_0)
			year++;
	} else if (year < 100
			&& date_data[0].length < 3
			// year padding: 0–99 的年份會加上此年份。
			&& (tmp = isNaN(options.year_padding) ? String_to_Date_default_parser.year_padding
					: options.year_padding))
		year += tmp;

	date_data[0] = year;
	if (period_end) {
		tmp = date_data.length;
		// 由小至大，將第一個有指定的加一即可。
		while (tmp-- > 0)
			// IE 中，String.prototype.match() 未成功時會回傳 ''，
			// 而 !isNaN('')===true，因此無法正確判別。
			if (!isNaN(date_data[tmp])
					&& date_data[tmp] !== '') {
				date_data[tmp]++;
				break;
			}
		year = date_data[0];
	}

	if (!(0 < (date_data[2] = +date_data[2])))
		date_data[2] = 1;
	if (typeof options.post_process === 'function')
		options.post_process(date_data);

	year = +year || 0;
	// time zone.
	tmp = (+date_data[4] || 0)
	// 若是未設定，則當作 local zone。
	+ String_to_Date.default_offset
	- (+minute_offset || 0);

	var date_value;
	if (year < 100 && year >= 0) {
		// 僅使用 new Date(0) 的話，會含入 timezone offset (.getTimezoneOffset)。
		// 因此得使用 new Date(0, 0)。
		date_value = new Date(0, 0);
		// 先設定小單位，再設定大單位：設定小單位時會影響到大單位。反之不然。
		// 下兩者得到的值不同。
		//(d=new Date(0, 0)).setFullYear(0, 0, -1, 0, 480, 0, 0);d.toISOString()
		//(d=new Date(0, 0)).setHours(0, 480, 0, 0);d.setFullYear(0, 0, -1);d.toISOString()
		date_value.setHours(+date_data[3] || 0, tmp, +date_data[5] || 0, +date_data[6] || 0);
		date_value.setFullYear(
		// new Date(10, ..) === new Date(1910, ..)
		year, date_data[1] ? date_data[1] - 1 : 0, date_data[2]);
	} else
		date_value = new Date(year, date_data[1] ? date_data[1] - 1 : 0, date_data[2], +date_data[3] || 0,
			tmp, +date_data[5] || 0, +date_data[6] || 0);
	if (false)
		// 設定時間後才設定 time zone。
		date_value.setMinutes((+date_data[4] || 0)
			+ String_to_Date.default_offset
			- (+minute_offset || 0));

	//	測試僅輸入時刻的情況。e.g., '7時'
	if (options.near
			&& date_value.getFullYear() === 0
			&& date_value - time_boundary > 0) {
		//	判別未輸入時預設年份設對了沒：以最接近 options.near 的為基準。
		tmp = is_Date(options.near) ? options.near : new Date;
		date_string = tmp.getFullYear();
		matched = new Date(date_value.getTime());
		date_value.setFullYear(date_string);
		matched
		.setFullYear(date_value - tmp > 0 ? date_string - 1
				: date_string + 1);
		if (date_value - tmp > 0
				&& date_value - tmp > tmp - matched
				|| date_value - tmp < 0
				&& date_value - tmp < tmp - matched)
			date_value = matched;
	}

	return date_value;
}


// 0–99 的年份會加上此年份 (1900)。
String_to_Date_default_parser.year_padding = (new Date(0,
		0, 1)).getFullYear();
String_to_Date.default_parser = String_to_Date_default_parser;

// date_string.match(String_to_Date.parser_PATTERN) === [, parser name, date string ]
// e.g., "Âm lịch"
String_to_Date.parser_PATTERN = /^\s*(?:([^:]+):)?\s*(.+)/i;

String_to_Date.parser = {

	Julian: Julian_String_to_Date,
	//	Common Era / Before the Common Era, CE / BCE. 公元/西元.
	CE : function(date_string, minute_offset, options) {
		if (!library_namespace.is_Object(options))
			options = library_namespace.null_Object();
		if (!('no_year_0' in options))
			options.no_year_0 = true;
		var date_value = String_to_Date_default_parser(
				date_string, minute_offset, options);
		return date_value - Gregorian_reform_of(options.reform) < 0
		//
		? Julian_String_to_Date(date_string, minute_offset,
				options) : date_value;
	},

	//	<a href="http://php.net/manual/en/function.date.php" accessdate="2012/3/23 20:51">PHP: date - Manual</a>
	PHP : function() {
		//	TODO
		throw new Error('String_to_Date.parser.PHP: Not Yet Implemented!');
	},
	//	<a href="http://www.freebsd.org/cgi/man.cgi?query=strftime" accessdate="2012/3/23 20:59">strftime</a>,
	//	<a href="http://hacks.bluesmoon.info/strftime/" accessdate="2012/3/23 21:9">strftime: strftime for Javascript</a>
	strftime : function() {
		//	TODO
		throw new Error('String_to_Date.parser.strftime: Not Yet Implemented!');
	}
};



//	時區縮寫。
//	<a href="http://en.wikipedia.org/wiki/List_of_time_zone_abbreviations" accessdate="2012/12/2 13:0" title="List of time zone abbreviations">time zone abbreviations</a> and offset in hour.
//	TODO: Daylight Saving Time (DST).
String_to_Date.zone = {
		//	UTC+08:00
		//	China Standard Time
		CST : 8,
		Z中國 : 8,

		JST : 9,
		Z日本 : 9,

		EST : -5,
		PST : -8,

		//	Greenwich Mean Time
		GMT : 0,
		//	Coordinated Universal Time
		UTC : 0
};

_// JSDT:_module_
.
String_to_Date = String_to_Date;



//---------------------------------------------------------


/**
 * test if the year is leap year. has year 0!<br />
 * 
 * @param {Integer}year
 * @param type
 *            calendar type: true: use Julian calendar, false: use Gregorian calendar, 'CE': use CE
 * @returns {Boolean}
 */
function is_leap_year(year, type) {
	if (type === 'CE')
		if (reform_year < year)
			type = false;
		else if (year < 0)
			year++;
	// Julian calendar
	return type ? year % 4 === 0
	// Gregorian calendar
	: year % 400 === 0 || year % 100 !== 0 && year % 4 === 0;
}
_.is_leap_year = is_leap_year;

/**
 * test if in the year, Gregorian calendar and Julian calendar have different
 * intercalation.
 * 
 * @param {Integer}year
 * @returns {Boolean} 當年 Julian 與 UTC 為不同閏年規定: Gregorian 當年沒有閏日，但 Julian 有。
 */
function is_different_leap_year(year) {
	return year % 100 === 0 && year % 400 !== 0;
}
_.is_different_leap_year = is_different_leap_year;

/**
 * 計算 Gregorian 與 Julian 的日數差距。 the secular difference between the two calendars.<br />
 * 會將 date_data: Julian → Gregorian.
 * 
 * @param {Array}date_data
 *            Julian date [year, month, date]
 * 
 * @returns {Number} Julian → Gregorian 時，需要減去的日數。（除少數特例外，即 Gregorian → Julian 時，需要加上的日數。）
 * 
 * @see https://en.wikipedia.org/wiki/Gregorian_calendar#Difference_between_Gregorian_and_Julian_calendar_dates
 */
function Julian_shift_days(date_data) {
	var year = +date_data[0];
	// 測試是否為有差異的當年
	if (is_different_leap_year(year)
	// 測試是否為閏日。
	// 閏日前(before Julian calendar leap day)還要算是上一階段。
	&& date_data[1] < 3)
		year--;
	// 計算 Gregorian 與 Julian 的 different days。
	// 2: 0年時，差了2日。
	// -701: 8, -700: 7; -601: 7, -600: 6; 99: 2, 100: 1;
	year = 2 + Math.floor(year / 400) - Math.floor(year / 100);
	// 這演算法對差異大至 31+28 日的時段不適用。
	date_data[2] -= year;
	return year;
}
_.Julian_shift_days = Julian_shift_days;

/**
 * parse proleptic Julian calendar　date_string and return the new Date.<br />
 * 
 * 借用系統內建的計時機制。其他 arguments 見 String_to_Date_default_parser()。
 * 
 * @param {String}date_string
 *            Julian calendar　date string.
 * 
 * @returns {Date} new Date
 * 
 * @see http://en.wikipedia.org/wiki/Old_Style_and_New_Style_dates
 * @see http://eclipse.gsfc.nasa.gov/SEhelp/julian.html
 */
function Julian_String_to_Date(date_string, minute_offset, options) {
	if (!library_namespace.is_Object(options))
		options = library_namespace.null_Object();

	options.post_process = Julian_shift_days;

	return String_to_Date_default_parser(date_string, minute_offset, options);
}

//----------------------------------------------------------------------------------------------------------------------------------------------------------//


function parse_English_date(date) {
	date = date.trim().replace(/.+\[(?:\d{1,2}|note \d+)\]$/i, '');
	var accuracy = date.match(/^(?:before|after)[\s ](.+)$/i), matched;
	if (accuracy)
		date = accuracy[1].trim(), accuracy = accuracy[0];
	if (accuracy = date.match(/^ca?.(.+)$/))
		date = accuracy[1].trim(), accuracy = accuracy[0];
	if (/^[a-z]+\s+-?\d+$/i.test(date))
		date = '1 ' + date, accuracy = date;

	if (date.includes('?'))
		accuracy = date, date = date.replace(/\?/g, '');

	if (!isNaN(date) || /^\d+\/\d+$/.test(date))
		accuracy = date;
	else if (!isNaN(matched = Date.parse(date))) {
		date = new Date(matched + String_to_Date.default_offset
				* ONE_MINTE_LENGTH_VALUE).toISOString().match(/^\d+-\d+-\d+/)[0]
				.replace(/^0+/, '').replace(/(\d)-0*/g, '$1\/');
	} else {
		library_namespace.warn(date);
		return;
	}
	return [ date, accuracy ];
}

_.parse_English_date = parse_English_date;

//----------------------------------------------------------------------------------------------------------------------------------------------------------//

/**
 * 顯示格式化日期時間 string：依照指定格式輸出日期與時間。<br />
 * TODO:<br />
 * 各 locale 有不同 format 與 time zone offset.
 * 
 * @example <code>

// More examples: see /_test suite/test.js

 * </code>
 * 
 * @param {Date}date_value
 *            要轉換的 date, TODO? 值過小時當作時間, <0 轉成當下時間.
 * @param {Object|String|Function}options
 *            選擇性功能: {<br />
 *            {String|Function}parser: 格式字串分析器 'strftime',<br />
 *            {String}format: 格式字串 '%Y/%m/%d %H:%M:%S.%f',<br />
 *            {String}locale: 地區語系設定<br /> }
 * 
 * @returns {String} 依照指定格式格式化後輸出的日期與時間.
 * 
 * @see<br />
 * <a href="http://blog.csdn.net/xzknet/article/details/2278101" accessdate="2012/3/24 15:11" title="如何使用Javascript格式化日期显示 - 虫二的专栏~~在路上~~~ - 博客频道 - CSDN.NET">JsJava中提供了專用的類，專門對日期進行指定格式的字符串輸出</a>,<br />
 * <a href="http://www.merlyn.demon.co.uk/js-date8.htm" accessdate="2012/3/25 1:42">Merlyn - JSDT 8 : Enhancing the Object - J R Stockton</a>,<br />
 * U.S. Naval Observatory <a href="http://aa.usno.navy.mil/data/docs/JulianDate.php" accessdate="2012/3/25 1:42">Julian Date Converter</a><br />
 * ISO 8601:2004(E)
 * 
 * @_memberOf	_module_
 */
function Date_to_String(date_value, options) {
	// 前置處理。
	if (typeof options === 'string')
		options = options in Date_to_String.parser ? {
			parser : Date_to_String.parser[options]
		} : {
			format : options
		};
	else if (typeof options === 'function')
		options = {
				parser : options
		};
	else if (!library_namespace.is_Object(options))
		options = library_namespace.null_Object();

	if (false)
		if (options.parser
				&& !library_namespace
				.is_Function(options.parser)
				&& !library_namespace
				.is_Function(String_to_Date.parser[options.parser]))
			library_namespace
			.warn('Date_to_String: 無法判斷 parser ['
					+ options.parser + ']！');

	// if (!date_value) date_value = new Date;

	if (date_value && !is_Date(date_value)
			// String_to_Date() 會幫忙做正規化。
			? String_to_Date(date_value) : date_value)
		return (library_namespace
				.is_Function(options.parser) ? options.parser
						: Date_to_String.parser[options.parser]
		|| Date_to_String.default_parser)
		(
				date_value,
				options.format,
				library_namespace.gettext ? library_namespace.gettext
						.to_standard(options.locale)
						: options.locale, options);

	library_namespace
	.warn('Date_to_String: 無法判斷 date value ['
			+ date_value + ']！');
}

//	default parser.
Date_to_String.default_parser = strftime;

Date_to_String.parser = {

	//	<a href="http://php.net/manual/en/function.date.php" accessdate="2012/3/23 20:51">PHP: date - Manual</a>
	PHP : function(date_value, format, locale) {
		//	TODO
		throw new Error('Date_to_String.parser.PHP: Not Yet Implemented!');
	},
	//	ISO 8601:2004(E)
	ISO8601 : function(date_value, format, locale) {
		//	TODO
		throw new Error('Date_to_String.parser.ISO8601: Not Yet Implemented!');
	},
	//	.NET standard format string (standard date and time format string)	<a href="http://msdn.microsoft.com/zh-tw/library/az4se3k1.aspx" accessdate="2012/3/24 17:43">標準日期和時間格式字串</a>
	SFS : function(date_value, format, locale) {
		//	TODO
		throw new Error('Date_to_String.parser.SFS: Not Yet Implemented!');
	},
	//	<a href="http://www.freebsd.org/cgi/man.cgi?query=strftime" accessdate="2012/3/23 20:59">strftime</a>,
	//	<a href="http://hacks.bluesmoon.info/strftime/" accessdate="2012/3/23 21:9">strftime: strftime for Javascript</a>
	strftime : strftime,

	Gregorian : Date_to_Gregorian,
	Julian : Date_to_Julian,
	//	Common Era / Before the Common Era, CE / BCE.
	CE : function(date_value, format, locale, options) {
		// 前置處理。
		if (!library_namespace.is_Object(options))
			options = library_namespace.null_Object();
		if (!('no_year_0' in options))
			options.no_year_0 = true;

		return (date_value - Gregorian_reform_of(options.reform) < 0
		//
		? Date_to_Julian : Date_to_Gregorian)(date_value, format, locale, options);
	},

	//	Turn to RFC 822 date-time
	//	<a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date/toUTCString" accessdate="2012/3/24 8:5" title="toUTCString - MDN">The most common return value is a RFC-1123 formatted date stamp, which is a slightly updated version of RFC-822 date stamps.</a>
	//Date_to_RFC822[generateCode.dLK]='String_to_Date';
	RFC822 : function(date_value) {
		return date_value.toUTCString().replace(/UTC/gi, 'GMT');
	}
};


_// JSDT:_module_
.
Date_to_String = Date_to_String;


//---------------------------------------------------------

/**
 * 依照指定 strftime 格式輸出日期與時間。
 * 
 * @param {Date}date_value
 *            要格式化的日期。
 * @param {String}format
 *            輸出的格式字串。
 * @param {String}locale
 *            輸出的地區語系設定。
 * @param {Object}options
 *            選擇性功能。
 * 
 * @returns {String} 依照指定格式輸出的日期與時間。
 * 
 * @see<br />
 * <a href="http://www.freebsd.org/cgi/man.cgi?query=strftime" accessdate="2012/3/23 20:59">strftime</a>,<br />
 * <a href="http://hacks.bluesmoon.info/strftime/" accessdate="2012/3/23 21:9">strftime: strftime for Javascript</a>,
 */
function strftime(date_value, format, locale, options) {
	// 前置處理。
	if (!library_namespace.is_Object(options))
		options = library_namespace.null_Object();

	var original_Date = options.original_Date || date_value,
	/**
	 * 支援的 conversion specifications (轉換規格).
	 */
	conversion = strftime.conversion[locale] || strftime.conversion[strftime.null_domain],
	/**
	 * 所須搜尋的 conversion specifications (轉換規格) pattern.
	 */
	search = strftime.search[locale] || strftime.search[strftime.null_domain];

	// to this minute offset. UTC+8: 8 * 60 = +480
	// or using options.minute_offset?
	if (!isNaN(options.offset)) {
		date_value = new Date(date_value.getTime() + ONE_MINTE_LENGTH_VALUE *
		//
		(options.offset - String_to_Date.default_offset));
	}

	function convertor(s) {
		return s.replace(search, function($0, $1, $2) {
			//	可以在 conversion 中，用
			//	this[conversion name].apply(this, arguments)
			//	來取得另一 conversion 之結果。
			var v = $2 in original_Date ? original_Date[$2]
				// original_Date[$2] 為物件本身之特殊屬性，應當排在泛用函數 conversion[$2] 之前。
				: typeof (v = conversion[$2]) === 'function' ? v.call(conversion, date_value, options)
				//
				: v in original_Date ? original_Date[v]
				// 將之當作 format。
				: /%/.test(v) ? parse_escape(v, convertor)
				//
				: v;
			//library_namespace.debug([v, $1, $2]);
			return $1 ? pad(v, $1): v;
		});
	}

	return parse_escape(format || strftime.default_format, convertor);
}

strftime.default_format = '%Y/%m/%d %H:%M:%S.%f';


/**
 * 設定支援的 conversion specifications (轉換規格).<br />
 * 將直接使用輸入，因此呼叫後若改變 conversion specifications object 將出現問題！<br />
 * 
 * @example <code>
 * library_namespace.Date_to_String.parser.strftime.set_conversion({
	date : function() {
		return this.getDate();
	}
}, 'cmn-Hant-TW');
 * </code>
 * 
 * @param {Object}conversion
 *            conversion specifications (轉換規格)。
 * @param {String}locale
 *            輸出的地區語系設定。
 * 
 * @returns {RegExp} 所須搜尋的 conversion specifications (轉換規格) pattern。
 */
strftime.set_conversion = function(conversion, locale, options) {
	var i, v, locale_conversion, gettext = library_namespace.gettext,
	//	escape special char.
	escape_string = function(s) {
		return s.replace(/[*?!+.()\[\]\|\-^$\\\/]/g, '\\$0');
	},
	/**
	 * 所須搜尋的 conversion specifications (轉換規格) pattern.
	 */
	search;

	if (!strftime.search) {
		library_namespace.debug('初始化 strftime', 2, 'strftime.set_conversion');
		strftime.search = library_namespace.null_Object();
		strftime.conversion = library_namespace.null_Object();
	}

	// 前置處理。
	if (!library_namespace.is_Object(options))
		options = library_namespace.null_Object();

	if (locale && gettext && !options.no_gettext)
		locale = gettext.to_standard(locale);
	if (!locale)
		locale = strftime.null_domain;

	if (!(locale in (locale_conversion = strftime.conversion)))
		locale_conversion[locale] = library_namespace.null_Object();
	locale_conversion = locale_conversion[locale];
	for (i in conversion) {
		//	不變更引數 conversion，且允許重複添增。
		locale_conversion[i] = v = conversion[i];
		if (v in locale_conversion) {
			search = [ v ];
			while (v in locale_conversion) {
				// 處理 alias。
				locale_conversion[i] = v = locale_conversion[v];
				if (search.includes(v))
					// 預防迴圈。
					break;
				search.push(v);
			}
		}
	}

	v = '';
	search = [];
	//	造出 search pattern。
	for (i in locale_conversion)
		if ((i = escape_string(i)).length > 1)
			search.push(i);
		else
			v += i;
	// 從長的排到短的。
	search.sort(function(a, b) {
		// 長→短
		return b.length - a.length;
	});
	if (v)
		search.push('[' + v + ']');
	strftime.search[locale] = search = new RegExp('%(\\d?)(' + search.join('|') + ')', 'g');
	library_namespace.debug('use conversion specifications ' + locale + ': ' + search, 2, 'strftime.set_conversion');

	return search;
};

strftime.null_domain = '';

var gettext_date = library_namespace.gettext;
if (gettext_date)
	gettext_date = gettext_date.date;
else {
	gettext_date = function(v) {
		if (library_namespace.gettext) {
			gettext_date = library_namespace.gettext.date;
			return gettext_date[this].apply(gettext_date,
					arguments);
		}
		return v;
	};
	'year,month,date,week'.split(',').forEach(
			function(type) {
				gettext_date[type] = gettext_date
				.bind(type);
			});
}


// common year 月初累積日。查表法用。
// accumulated_days[0] = 到一月月初時累積的天數。
var accumulated_days = [ 0 ],
// common year 每月日數。
// [ 31, 28, 31, .. ]
month_days = [];
(function() {
	// select a common year.
	var date = new Date(1902, 0, 1), month = 0, days, all_days = 0;
	while (month++ < 12) {
		// 設在月底，以取得當月日數。
		date.setMonth(month, 0);
		month_days.push(days = date.getDate());
		accumulated_days.push(all_days += days);
	}
})();
Object.seal(month_days);
Object.seal(accumulated_days);

/**
 * 自 year/month/date 開始之本年曆數（每月日數）。
 * 
 * @param {Integer|Boolean}[is_leap]
 *            is leap year
 * @param {Integer}[month]
 *            月
 * @param {Integer}[date]
 *            月日期
 * @returns {Array} 每月日數。
 */
function get_month_days(is_leap, month, date) {
	// month: serial → index
	if (month |= 0)
		--month;
	// assert: month: 0–11, date: 1–28/29/30/31

	var year_data = month_days.slice(month);

	if (month < 2
	// 處理閏年。
	&& (typeof is_leap === 'number' ? is_leap_year(is_leap) : is_leap))
		year_data[1 - month]++;

	// 處理首月的曆數。
	if (date > 1)
		year_data[0] -= date - 1;

	return year_data;
}
_.get_month_days = get_month_days;


/**
 * ordinal date, 年日期.<br />
 * 本年開始至 year/month/date 之本年年內的天數。
 * 
 * @param {Integer}month
 *            月
 * @param {Integer}date
 *            月日期
 * @param {Integer|Boolean}[is_leap]
 *            is leap year
 * @returns {Integer} 年內的日數。
 * @see https://en.wikipedia.org/wiki/Ordinal_date
 */
function ordinal_date(month, date, is_leap) {
	if (is_Date(month))
		date = month.getDate() | 0,
				is_leap = is_leap_year(month.getFullYear()), month = month
						.getMonth() | 0;
	else {
		--month;
		if (typeof is_leap === 'number')
			// treat as year.
			is_leap = is_leap_year(is_leap);
	}
	if (is_leap && month > 1)
		date++;
	return accumulated_days[month] + date | 0;
}
_.ordinal_date = ordinal_date;

// week date, 週日期, 表示年內的星期數天數，再加上星期內第幾天。
// https://en.wikipedia.org/wiki/ISO_week_date
// return [ year, week (1-52 or 53), weekday (1-7) ]
// var w = week_date(new Date); w[0].pad(4) + '-W' + w[1].pad(2) + '-' + w[2]
function week_date(date, to_ISO) {
	var year = date.getFullYear() | 0, weekday = date.getDay() | 0, days = ordinal_date(date) | 0, week;
	if (weekday === 0)
		weekday = 7;
	week = (10 + days - weekday) / 7 | 0;
	if (week === 0)
		week = 53, year--;
	// 計算首日是否為 星期四 或 (星期三 + leap)；
	// 此為有 W53 之條件。
	else if (week > 52 && (days = (weekday + 1 - days).mod(7)) !== 4
			&& (days !== 3 || !is_leap_year(year)))
		week = 1, year++;

	if (to_ISO)
		year = year.pad(4), week = 'W' + week.pad(2);
	days = [ year, week, weekday ];
	if (to_ISO === 1)
		days = days.join('');
	else if (to_ISO !== 2)
		days = days.join('-');

	return days;
}
_.week_date = week_date;

//<a href="http://help.adobe.com/zh_TW/as2/reference/flashlite/WS5b3ccc516d4fbf351e63e3d118cd9b5f6e-7923.html" accessdate="2012/3/24 15:29">Adobe Flash Platform * Date</a>
//<a href="http://msdn.microsoft.com/zh-tw/library/dca21baa.aspx" accessdate="2012/3/24 15:30">Date 物件</a>
//<a href="http://www.cppreference.com/wiki/cn/chrono/c/strftime" accessdate="2012/3/24 15:23">strftime    [C++ Reference]</a>
// 除非必要，這邊不應用上 options.original_Date。
strftime.default_conversion = {
	// 完整年份(非兩位數的數字，近十年應為四位數的數字，如2013)
	Y : function(date_value, options) {
		return gettext_date.year(
		//(options && options.original_Date || date_value)
		date_value
		.getFullYear(), options.numeral || options.locale);
	},
	// 月分 (1-12)。
	m : function(date_value, options) {
		return gettext_date.month(1 +
		//(options && options.original_Date || date_value)
		date_value
		.getMonth(), options.locale);
	},
	// 月中的第幾天 (1-31)
	d : function(date_value, options) {
		return gettext_date.date(
		//(options && options.original_Date || date_value)
		date_value
		.getDate(), options.locale);
	},

	// 星期 (0-6)
	w : function(date_value, options) {
		return gettext_date.week(
		//(options && options.original_Date || date_value)
		date_value
		.getDay(), options.locale);
	},

	// 小時數 (0-23)
	H : function(date_value, options) {
		return date_value.getHours();
	},
	// 分鐘數 (0-59)
	M : function(date_value, options) {
		return date_value.getMinutes();
	},
	// 秒數 (0-59)
	S : function(date_value, options) {
		return date_value.getSeconds();
	},
	/**
	 * 毫秒(milliseconds) (000-999)
	 * 
	 * @see
	 * %f: zero-padded millisecond / microsecond:
	 * <a href="http://bugs.python.org/issue1982" accessdate="2012/3/24 12:44">Issue 1982: Feature: extend strftime to accept milliseconds - Python tracker</a>
	 */
	f : function(date_value, options) {
		var ms = date_value.getMilliseconds();
		return ms > 99 ? ms : ms > 9 ? '0' + ms : ms >= 0 ? '00' + ms : ms;
	},

	// 年日數
	// (new Date).format('%4Y-%3o')
	o : function(date_value, options) {
		return ordinal_date(date_value);
	},
	// 週數
	W : function(date_value, options) {
		return week_date(date_value)[1];
	},

	//	有相同開頭的時候，長的要放前面！
	//(new Date).format('%JDN')
	JDN : Date_to_JDN,
	//(new Date).format('%JD')
	JD : Date_to_JD,

	歲次 : guess_year_stem_branch,
	//	alias
	年干支 : '歲次',
	年柱 : '歲次',

	日干支序 : date_stem_branch_index,
	//	計算距離甲子共有幾日，再於 index_to_stem_branch() 取模數。
	//	假定為不間斷之循環紀日。
	日干支 : function(date_value, options) {
		return index_to_stem_branch(date_stem_branch_index(date_value, options));
	},
	日柱 : '日干支',

	// 時辰干支: 計算距離甲子共有幾個時辰，再於 index_to_stem_branch() 取模數。
	//	時干支不受子初分日(子初換日/子正換日)影響。
	時干支序 : hour_stem_branch_index,
	時干支 : function(date_value, options) {
		return index_to_stem_branch(hour_stem_branch_index(date_value, options));
	},
	時柱 : '時干支',
	//	每刻15分。
	//	e.g., 子正初刻
	//	隋後普遍行百刻制，每天100刻。至順治二年（公元1645年）頒行時憲曆後，改為日96刻，每時辰八刻（初初刻、初一刻、初二刻、初三刻、正初刻、正一刻、正二刻、正三刻）[7,13,14]。自此每刻15分，無「四刻」之名。
	時刻 : function(date_value, options) {
		if (options && options.original_Date)
			date_value = options.original_Date;
		// 12: BRANCH_LIST.length
		var diff = Math.floor((date_value - HOUR_STEM_BRANCH_OFFSET) / ONE_時辰_LENGTH_VALUE).mod(12);
		return BRANCH_LIST.charAt(diff) + (diff % 2 ? '正' : '初')
				+ '初一二三'.charAt(date_value.getMinutes() / 4 | 0) + '刻';
	}
};

strftime.set_conversion(strftime.default_conversion, strftime.null_domain);



function Date_to_Gregorian(date_value, format, locale, options) {

	if ('no_year_0' in options ? options.no_year_0 : Date_to_String.no_year_0) {
		var Year = date_value.getYear(), FullYear = date_value.getFullYear(), UTCFullYear = date_value
				.getUTCFullYear();

		if (FullYear < 1 || UTCFullYear < 1) {
			// 處理 0 year: Gregorian 與 Julian 沒有 0 year。
			// 因為公元前之公曆閏年出現在 1, 5, 9, 13, .. BC，因此無法以「除以4」計算。
			// 應該直接改年分，而不是將時間直接將其值減掉 (0/1/1 0:-1/1/1 0:),
			// 而當作彷彿沒有 0年這段期間的存在，直接從-1年開始。
			//
			// <a
			// href="http://en.wikipedia.org/wiki/Astronomical_year_numbering"
			// accessdate="2013/2/11 15:40" title="Astronomical year
			// numbering">天文年號</a>
			// <a
			// href="http://en.wikipedia.org/wiki/Gregorian_calendar#Proleptic_Gregorian_calendar"
			// accessdate="2013/2/11 9:7">Gregorian calendar</a>
			//
			// For dates before the year 1, unlike the proleptic Gregorian
			// calendar used in the international standard ISO 8601, the traditional
			// proleptic Gregorian calendar (like the Julian calendar) does not
			// have a year 0 and instead uses the ordinal numbers 1, 2, … both for
			// years AD and BC.

			// 前置處理。
			if (!library_namespace.is_Object(options))
				options = library_namespace.null_Object();

			if (!options.no_new_Date)
				// IE 需要 .getTime()：IE8 以 new Date(Date
				// object) 會得到 NaN！
				date_value = new Date(date_value.getTime());

			if (FullYear < 1) {
				date_value.getYear = new Function('return '
						+ (Year - 1));
				date_value.getFullYear = new Function(
						'return ' + (FullYear - 1));
			}
			if (UTCFullYear < 1)
				date_value.getUTCFullYear = FullYear === UTCFullYear ?
						// 一般情況 (FullYear === UTCFullYear)。
						// else: 預防 1/1, 12/31 時，getYear() 與 getUTCFullYear() 可能會有不同值。
						// 盡量少帶入變數。
						date_value.getFullYear
						: new Function('return '
								+ (UTCFullYear - 1));
		}
	}

	return strftime(date_value, format, locale, options);
}



//	代替 getDate() 用。
var leap_date = new Function('return 29');

/**
 * proleptic Julian calendar.<br />
 * 
 * TODO: 太沒效率。
 * 
 * 以系統內建的計時機制，<br />
 * 將擴展/外推/延伸的格里曆, proleptic Gregorian calendar<br />
 * → proleptic Julian calendar for 4713 BCE－2200 CE.
 * 
 * @param {Date}date_value
 *            要格式化的日期。
 * @param {String}format
 *            輸出的格式字串。
 * @param {String}locale
 *            輸出的地區語系設定。
 * @param {Object}options
 *            選擇性功能。
 * 
 * @returns {String} 依照指定格式輸出的日期與時間。
 * 
 * @see<br />
 *      <a
 *      href="http://en.wikipedia.org/wiki/Conversion_between_Julian_and_Gregorian_calendars"
 *      accessdate="2013/2/11 9:8">Conversion between Julian and Gregorian
 *      calendars</a>
 */
function Date_to_Julian(date_value, format, locale, options) {
	// 計算與 UTC 的差距。
	var year = date_value.getFullYear(),
	// 計算 Gregorian 與 Julian 的 different days。0年時，差了
	// 2日。這演算法對差異大至 31+28 日的時段不適用。
	shift_days = 2 + Math.floor(year / 400)
	- Math.floor(year / 100),
	// 當年 Julian 與 UTC 為不同閏年規定: Gregorian 當年沒有閏日，但 Julian 有。
	is_leap_year = is_different_leap_year(year);

	if (shift_days || is_leap_year) {
		var week_day = date_value.getDay();

		// 前置處理。
		if (!library_namespace.is_Object(options))
			options = library_namespace.null_Object();
		// 因為可能會更改 date_value，因此把本來的 date_value 放在 options
		// 中供有需要的取用。
		if (!options.original_Date)
			options.original_Date = date_value;
		// 不改變原先的 date_value。
		options.no_new_Date = true;
		// 以新的 UTC Date instance 模擬 Julian calendar。
		// IE 需要 .getTime()：IE8 以 new Date(Date object) 會得到 NaN！
		date_value = new Date(date_value.getTime());
		date_value.setDate(date_value.getDate()
				+ shift_days);

		if (is_leap_year
				&& date_value.getFullYear() <= year) {
			// 原 → 現 → 應
			// ... → 2/27 → 2/28
			// ... → 2/28 → 2/29
			// ... → 3/1 → 3/1
			var month = date_value.getMonth();
			// 分水嶺: 以 Julian date 3/1 0:0 為分界。在不同閏年當年，Julian date 3/1 前需要特別處理。
			if (month < 2
					|| date_value.getFullYear() < year)
				// 因為加至當年沒有閏日的 Gregorian，2/29 會變成 3/1。
				if (month === 1
						&& date_value.getDate() === 28)
					// is leap day
					// 便宜行事: 不設 delta，直接把 3/1 → 2/28，再強制使 .getDate() = 29。
					// TODO: .getDay() 恐有誤。
					// 當 Julian date 2/29 閏日當日，UTC 非閏日的時候，需要特別處理。
					// TODO: 處理其他。
					date_value.getDate = leap_date;
				else
					// Julian date 2/29 閏日前。少算的，須更正。
					// 閏日前(before Julian calendar leap day)還要算是上一階段。
					date_value
					.setDate(date_value.getDate() + 1);
		}

		// 處理 day of the week: 就算以另一個日期模擬 UTC，原先的星期不會改變。
		if (date_value.getDay() !== week_day)
			date_value.getDay = new Function('return '
					+ week_day);
		// TODO: .getUTCDay()
	}

	date_value = Date_to_Gregorian(date_value, format, locale,
			options);
	if (library_namespace.is_Object(options))
		// 預防此 options 為重複使用。
		delete options.original_Date;
	return date_value;
}



/*



There is no year 0 in the Julian system!


The Julian date for CE  1582 October  4 00:00:00.0 UT is
JD 2299159.500000

The dates 5 through 14 October, 1582, do not exist in the Gregorian Calendar!

The Julian date for CE  1582 October 15 00:00:00.0 UT is
JD 2299160.500000

JD 2299159.000000 is
CE 1582 October 03 12:00:00.0 UT  Wednesday

JD 2299160.000000 is
CE 1582 October 04 12:00:00.0 UT  Thursday

JD 2299161.000000 is
CE 1582 October 15 12:00:00.0 UT  Friday



JD      0.000000 is
BCE 4713 January 01 12:00:00.0 UT  Monday

JD      1.000000 is
BCE 4713 January 02 12:00:00.0 UT  Tuesday




The Julian date for CE     1 January  1 00:00:00.0 UT is
JD 1721423.500000

JD 1721423.000000 is
BCE    1 December 31 12:00:00.0 UT  Friday

JD 1721424.000000 is
CE    1 January 01 12:00:00.0 UT  Saturday


The Julian date for CE     1 March  1 00:00:00.0 UT is
JD 1721482.500000

JD 1721482.000000 is
CE    1 February 28 12:00:00.0 UT  Monday



The Julian date for CE  1000 February  1 00:00:00.0 UT is
JD 2086338.500000

The Julian date for CE  1000 February 29 00:00:00.0 UT is
JD 2086366.500000

JD 2086367.000000 is
CE 1000 February 29 12:00:00.0 UT  Thursday




The Julian date for CE   500 February 29 00:00:00.0 UT is
JD 1903741.500000

JD 1903742.000000 is
CE  500 February 29 12:00:00.0 UT  Tuesday




The Julian date for CE   100 March  1 00:00:00.0 UT is
JD 1757642.500000

JD 1757642.000000 is
CE  100 February 29 12:00:00.0 UT  Saturday

The Julian date for CE     4 March  1 00:00:00.0 UT is
JD 1722578.500000

JD 1722578.000000 is
CE    4 February 29 12:00:00.0 UT  Friday

The Julian date for CE  2000 January  1 12:00:00.0 UT is
JD 2451545.000000




The Julian date for BCE  1000 January  1 12:00:00.0 UT is
JD 1356174.000000


The Julian date for BCE  4000 January  1 12:00:00.0 UT is
JD 260424.000000


The Julian date for BCE  4710 January  1 12:00:00.0 UT is
JD   1096.000000


The Julian date for BCE  4701 January  1 12:00:00.0 UT is
JD   4383.000000

The Julian date for BCE  4700 January  1 12:00:00.0 UT is
JD   4749.000000

The Julian date for BCE  4700 February 28 12:00:00.0 UT is
JD   4807.000000

The Julian date for BCE   101 February 29 12:00:00.0 UT is
JD 1684592.000000



date=new Date(1582,10,15);
CeL.Date_to_JDN(new Date(1582,10,15));


*/


// 設定 .as_UTC_time 當作 UTC 時，將加上為本地時間調整所需之 offset。
var Julian_Date_local_offset = String_to_Date.default_offset / 60 / 24;

// Julian Date (JD)
//<a href="http://aa.usno.navy.mil/data/docs/JulianDate.php" accessdate="2013/2/11 9:10">Julian Date Converter</a>
function Date_to_JD(date_value, options) {
	date_value = ((options && options.original_Date || date_value) - Julian_Date_offset)
	/ ONE_DAY_LENGTH_VALUE;
	if (options && options.as_UTC_time)
		date_value += Julian_Date_local_offset;
	return date_value;
}
// Julian Day Number (JDN)
function Date_to_JDN(date_value, options) {
	// JDN0: JD = -.5 – .5⁻
	// JDN0: JD + .5 = 0 – 1⁻
	// 精神:以 UTC 計算時，當天從頭至尾都是相同的 JDN。
	// 基本上世界每個地方在當地當天 12:0 都有相同的 JDN，但不保證世界每個地方在當地當天 0:0 都有相同的 JDN。
	return Math.floor(Date_to_JD(date_value, options) + .5);
}
// Time Conversion Tool
// http://ssd.jpl.nasa.gov/tc.cgi
function JD_to_Date(JD) {
	// 注意：此輸出常顯示為系統之 proleptic Gregorian calendar，而一般天文計算使用 proleptic Julian calendar！
	return new Date(Julian_Date_offset
			+ ONE_DAY_LENGTH_VALUE * JD);
}

_.Date_to_JD = Date_to_JD;
_.Date_to_JDN = Date_to_JDN;
_.JD_to_Date = JD_to_Date;



//---------------------------------------------------------------------------//
//	常數計算。


//for Julian Date (JD), Julian Day Number (JDN).
//Julian Date: 由公元前4713年1月1日，協調世界時中午12時開始所經過的天數。
//	原點實際設在  -004713-11-24T12:00:00.000Z。
//	http://www.tondering.dk/claus/cal/julperiod.php
//	http://aa.usno.navy.mil/data/docs/JulianDate.php
var Julian_Date_offset = String_to_Date('-4713/1/1 12:0', {
	parser : 'Julian',
	zone : 0
}).getTime();

// 預設的 Gregorian calendar 改曆日期:
// Julian calendar → Gregorian calendar.
//
// 這天之前使用 Julian calendar。
// e.g., UTC/Gregorian 1582/10/14 → Julian 1582/10/4.
//
// 西曆改曆分界點。這天之後採用 Gregorian calendar 表示。
// 西曆以1582年10月15日為改曆分界點，Julian calendar（儒略曆）1582年10月4日的下一日為 Gregorian calendar（格里高利曆）1582年10月15日。
var reform_year = 1582;
_.Gregorian_reform_date = new Date(reform_year, 10 - 1, 15);


// gcal-3.6/doc/GREG-REFORM
// http://www.tondering.dk/claus/cal/gregorian.php
// http://www.webexhibits.org/calendars/year-countries.html
/*
http://sizes.com/time/cal_Gregadoption.htm

使用公共轉換組「外國地名翻譯」
https://zh.wikipedia.org/wiki/%E6%A8%A1%E5%9D%97:CGroup/%E5%9C%B0%E5%90%8D
*/
var reform_by_region = {
	'Italy' : '1582/10/15',
	'Spain' : '1582/10/15',
	'Portugal' : '1582/10/15',
	'Poland' : '1582/10/15',
	'France' : '1582/12/20',
	'Luxembourg' : '1583/1/1',
	'Netherlands' : '1583/1/1',
	'Bavaria' : '1583/10/16',
	'Austria' : '1584/1/17',
	'Switzerland' : '1584/1/22',
	'Hungary' : '1587/11/1',
	'Germany' : '1700/3/1',
	'Norway' : '1700/3/1',
	'Denmark' : '1700/3/1',
	// Kingdom of Great Britain, 大不列顛王國, グレートブリテン王国, 英國
	// https://en.wikipedia.org/wiki/Calendar_%28New_Style%29_Act_1750
	'Great Britain' : '1752/9/14',
	'Sweden' : '1753/3/1',
	'Finland' : '1753/3/1',
	// 日本
	// 'Japan' : '1873/1/1',
	// 中國
	// 'China' : '1911/11/20',
	'Bulgaria' : '1916/4/14',
	// USSR, U.S.S.R., 蘇聯
	'Soviet Union' : '1918/2/14',
	'Serbia' : '1919/2/1',
	'Romania' : '1919/2/1',
	'Greece' : '1924/3/23',
	'Turkey' : '1926/1/1',
	'Egypt' : '1928/10/1'
};

(function() {
	for ( var region in reform_by_region)
		reform_by_region[region] = Date.parse(reform_by_region[region]);
})();

/**
 * 取得特定區域之 Gregorian calendar 改曆日期。
 * 
 * @param {String}region
 *            {String}region, {Date}reform date, {Number}Date value
 * @returns {Number}reform Date value
 */
function Gregorian_reform_of(region) {
	if (is_Date(region))
		region = region.getTime();
	else if (typeof region === 'string' && (region in reform_by_region))
		region = reform_by_region[region];
	return Number.isFinite(region) ? region : _.Gregorian_reform_date;
}
Gregorian_reform_of.regions = reform_by_region;
_.Gregorian_reform_of = Gregorian_reform_of;

//---------------------------------------------------------------------------//
//	文化功能。



var
/** {Number}未發現之index。 const: 基本上與程式碼設計合一，僅表示名義，不可更改。(=== -1) */
NOT_FOUND = ''.indexOf('_'),
// 10 天干. celestial stem, Heavenly Stem
STEM_LIST = '甲乙丙丁戊己庚辛壬癸',
// 12 地支. Earthly Branches
BRANCH_LIST = '子丑寅卯辰巳午未申酉戌亥',
// 60: lcm(STEM_LIST.length, BRANCH_LIST.length);
SEXAGENARY_CYCLE_LENGTH = 60,

//	當考慮以 CST，或以當地時間為準。
//	因為八字與經度，以及該經度與太陽的日照相對夾角有關，因此採當地時間為準。

// CE YEAR_STEM_BRANCH_OFFSET 3-12月為甲子年。
// 以此計算 new Date(0) 之 offset。
// 黃帝紀元元年 (year -2696 in proleptic Gregorian calendar) 為甲子年。
YEAR_STEM_BRANCH_OFFSET = -2696,
//	1984/3/31 0:0 (甲子年丁卯月)甲子日始: 以此計算 new Date(0) 之 offset。
DATE_STEM_BRANCH_OFFSET = new Date(1984, 3 - 1, 31),
//	1984/3/31 23:0 (甲子年丁卯月)甲子日甲子時始: 以此計算 new Date(0) 之 offset。
HOUR_STEM_BRANCH_OFFSET = new Date(1984, 3 - 1, 30, 23);

_.STEM_LIST = STEM_LIST;
_.BRANCH_LIST = BRANCH_LIST;
_.SEXAGENARY_CYCLE_LENGTH = SEXAGENARY_CYCLE_LENGTH;

_.YEAR_STEM_BRANCH_OFFSET = YEAR_STEM_BRANCH_OFFSET;

// 日干支序。
// 注意：此處"序"指的是 Array index，從 0 開始。
function date_stem_branch_index(date_value, options) {
	if (options && options.original_Date)
		date_value = options.original_Date;
	var index = Math.floor((date_value - DATE_STEM_BRANCH_OFFSET) / ONE_DAY_LENGTH_VALUE);
	//	針對需要子初分日者特別處理:直接算入下一天。
	if (Date_to_String['子初分日'] && date_value.getHours() === 23)
		index++;
	if ((index %= SEXAGENARY_CYCLE_LENGTH) < 0)
		index += SEXAGENARY_CYCLE_LENGTH;
	return index;
}

// 時干支序。
// 注意：此處"序"指的是 Array index，從 0 開始。
function hour_stem_branch_index(date_value, options) {
	return ((options && options.original_Date || date_value) - HOUR_STEM_BRANCH_OFFSET) / ONE_時辰_LENGTH_VALUE;
}


// 極大程度依賴 date_pattern 的寫法！
stem_branch_date_pattern = new RegExp(stem_branch_date_pattern.replace(/\([^()]+\)日/, '(['
		+ STEM_LIST + '][' + BRANCH_LIST + '])日'));

/**
 * parse 日干支：取得最接近 date_value 之指定日干支。
 * 
 * @param {String|Integer}stem_branch
 *            指定日干支。
 * @param {Date}date_value
 *            基準日。
 * @param [options]
 * @returns
 */
function convert_stem_branch_date(stem_branch, date_value, end_date_diff) {

	if (!isNaN(stem_branch)
			|| !isNaN(stem_branch = stem_branch_to_index(stem_branch))) {

		if (!date_value)
			date_value = new Date;

		// assert: 加入干支之 date 可被正常 parse，但日干支本身會被忽略。
		// stem_branch_diff. [3]: see date_pattern.

		// 取得日干支差距。
		stem_branch -= date_stem_branch_index(date_value);

		if (!end_date_diff)
			// 設在月底。
			end_date_diff = new Date(date_value).setMonth(date_value
					.getMonth() + 1, 0)
					- date_value;
		else if (end_date_diff < 0)
			// assert: !!period_end === true
			stem_branch += end_date_diff;

		if (stem_branch < 0)
			// 轉成最接近 0 之正 index。
			stem_branch = SEXAGENARY_CYCLE_LENGTH
					+ (stem_branch % SEXAGENARY_CYCLE_LENGTH);
		if (Math.abs(end_date_diff) < stem_branch) {
			// 找出距離範圍最近的日干支。
			if (library_namespace.is_debug())
				library_namespace.warn('convert_stem_branch_date: 所欲求之日干支 [' + stem_branch + '] 並不在範圍內！');
			if (stem_branch - Math.abs(end_date_diff) > SEXAGENARY_CYCLE_LENGTH
					- stem_branch)
				stem_branch -= SEXAGENARY_CYCLE_LENGTH;
		}
		date_value.setDate(date_value.getDate() + stem_branch
				+ (end_date_diff < 0 ? end_date_diff : 0));
	}

	return date_value;
}

_.convert_stem_branch_date = convert_stem_branch_date;

// 會變更 options!
String_to_Date.parser.Chinese = function(date_string, minute_offset, options) {
	// 前置處理。
	if (!library_namespace.is_Object(options))
		options = library_namespace.null_Object();

	if (isNaN(options.year_padding))
		options.year_padding = 0;

	var date_value = String_to_Date.parser.CE(date_string,
			minute_offset, options),
	//
	stem_branch = date_value && date_string.match(stem_branch_date_pattern),
	//
	end_date_diff, period_end;

	// for 中國年號/中華民國紀年。
	// date_value.setFullYear(1911 + date_value.getFullYear());

	if (stem_branch
	// 確定真有 match 到干支。
	// 若沒 match 到，IE 中為 ""，其他為 undefined。
	&& (stem_branch = stem_branch[3])) {
		// 取得評估日期範圍。
		options.period_end = !(period_end = options.period_end);
		end_date_diff = (String_to_Date.parser.CE(date_string, minute_offset, options) - date_value)
				/ ONE_DAY_LENGTH_VALUE;
		// assert: if (end_date_diff < 0) than !!period_end === true

		// 復原 options。
		options.period_end = period_end;

		date_value = convert_stem_branch_date(stem_branch, date_value, end_date_diff);
	}

	return date_value;
};




/**
 * 計算干支/天干與地支<br />
 * Chinese sexagenary cycle.
 * 
 * @param {Integer}index
 *            序數 (0-59)。
 * @returns
 */
function index_to_stem_branch(index) {
	// NaN | 0 → 0, 過大的數 | 0 可能成負數。
	//
	// 當 < 0: 需要修正對負小數之模數計算。
	// 原因出自上面計算負小數時，其實應採用 Math.floor()。
	// Math.floor(-1.1) → -2。
	// 但以 "-1.1 | 0", "-1.1 >> 0", "≈-1.1" 會  → -1。
	// 效能:
	// http://jsperf.com/math-floor-vs-math-round-vs-parseint
	if (!isNaN(index = +index % SEXAGENARY_CYCLE_LENGTH)) {
		if ((index = Math.floor(index)) < 0)
			index += SEXAGENARY_CYCLE_LENGTH;

		// 10: STEM_LIST.length
		return STEM_LIST.charAt(index % 10)
		// 12: BRANCH_LIST.length
		+ BRANCH_LIST.charAt(index % 12);
	}
}


// 取得指定日干支之序數 (0-59)。
function stem_branch_to_index(stem_branch) {
	if (!stem_branch || !(stem_branch = String(stem_branch)))
		return;

	var _0 = stem_branch.charAt(0), index = STEM_LIST.indexOf(_0);
	if (stem_branch.length > 1) {
		// '甲子'
		if (index !== NOT_FOUND && (_0 = BRANCH_LIST.indexOf(stem_branch.charAt(1))) !== NOT_FOUND)
			// 解一次同餘式組
			//index = (SEXAGENARY_CYCLE_LENGTH + 6 * index - 5 * _0) % SEXAGENARY_CYCLE_LENGTH;
			index = (6 * index + 55 * _0) % SEXAGENARY_CYCLE_LENGTH;
	} else if (index === NOT_FOUND)
		// '甲' / '子'
		index = BRANCH_LIST.indexOf(_0);

	if (index >= 0)
		return index;
}


_.to_stem_branch = index_to_stem_branch;
_.stem_branch_index = function(value, options) {
	return is_Date(value)
			? options && options.hour ? hour_stem_branch_index(value) : date_stem_branch_index(value)
			: stem_branch_to_index(value);
};


/**
 * guess the year-stem-branch (歲次/年干支) of the date.
 * 
 * @param {Date|Integer}date_value
 *            date specified.
 * @param {Object|Boolean}options
 *            true or {get_index:true} : get {Integer}index (年干支序) instead of
 *            year-stem-branch.
 * 
 * @returns {String} year-stem-branch (歲次/年干支)
 */
function guess_year_stem_branch(date_value, options) {
	if (options && options.original_Date)
		date_value = options.original_Date;

	var year, month, date;
	if (is_Date(date_value)) {
		year = date_value.getFullYear();
		month = date_value.getMonth();
	} else if (isNaN(date_value))
		// TypeError
		throw new Error('guess_year_stem_branch: Not a Date');
	else
		year = date_value | 0, month = 7;

	year -= YEAR_STEM_BRANCH_OFFSET;

	if (month < 2)
		// 正月初一的日期落在大寒至雨水
		// （一般在公曆1月19日至2月20日）之間。
		// 立春則一般在2月4日或2月5日。
		if ((date = date_value.getDate()) < 19 && month === 0)
			// 上一年。
			year--;
		else if (date < 20 || month < 1)
			// 無法判別歲次：需要 include 'data.date.era'!
			return '(' + index_to_stem_branch(year - 1) + '或'
					+ index_to_stem_branch(year) + ')';

	if (!options || options !== true && !options.get_index)
		year = index_to_stem_branch(year);
	else if ((year %= SEXAGENARY_CYCLE_LENGTH) < 0)
		// see index_to_stem_branch()
		year += SEXAGENARY_CYCLE_LENGTH;

	return year;
}

_.guess_year_stem_branch = guess_year_stem_branch;


//Date_to_String['子初分日'] = false;
//Date_to_String.子初分日 = false;

strftime.set_conversion(Object.assign({
	// 完整民國紀年年份(2 or 3位數的數字，如 98, 102)
	R : function(date_value) {
		if((date_value = date_value.getFullYear()) > 900)
			date_value -= 1911;
		return date_value;
	}
}, strftime.default_conversion), 'cmn-Hant-TW');



//----------------------------------------------------------------------------------------------------------------------------------------------------------//


/**
 * 計算大略的時間間隔，以適當的單位簡略顯示。 count roughly duration, count date.<br />
 * CeL.age_of(new Date(0, 0, 0), new Date(0, 0, 0, 0, 0, 8)) === '8s'
 * 
 * @param {Date|Number}start
 * @param {Date|Number}[end]
 * @param {Object}[options]
 */
function age_of(start, end, options) {
	if (!end)
		// count till now.
		end = new Date;
	var difference = end - start, diff, diff2;
	if (!(difference >= 0) || !isFinite(difference))
		return;

	if (!is_Date(start))
		start = new Date(start);
	if (!is_Date(end))
		end = new Date(end);
	diff2 = end.getMonth() - start.getMonth()
	//
	+ (end.getDate() - start.getDate()) / 30;
	if (diff = end.getFullYear() - start.getFullYear()) {
		// assert: {Integer}diff 年 {Float}diff2 月, diff > 0.
		// → difference = {Float} 年（至小數）
		difference = diff + diff2 / 12;
		// diff = {String} format to show
		if (options && options.月) {
			diff += 'Y' + Math.round(diff2) + 'M';
		} else
			diff = difference.to_fixed(1) + 'Y';
		if (options && options.歲) {
			// 計算年齡(虛歲)幾歲。
			difference = end.getFullYear() - start.getFullYear()
			// + 1: 一出生即虛歲一歲(YO, years old, "Y/O.")。之後過年長一歲。
			// else: 計算周歲（又稱實歲、足歲）幾歲。
			+ (options.歲 === '虛' ? 1 : 0);
			if (start - age_of.get_new_year(start.getFullYear()) < 0)
				difference++;
			if (end - age_of.get_new_year(end.getFullYear()) < 0)
				difference--;
			// 時年實歲。
			diff = difference + '歲, ' + diff;
		}

		return diff;
	}

	if (diff2 >= 1)
		return diff2.to_fixed(1) + 'M';

	if (difference < 1000)
		return difference + 'ms';

	if ((difference /= 1000) < 60)
		return difference.to_fixed(1) + 's';

	if ((difference /= 60) < 60)
		return difference.to_fixed(1) + 'm';

	if ((difference /= 60) < 24)
		return difference.to_fixed(1) + 'h';

	return (difference / 24).to_fixed(1) + 'D';
}

// 將在 data.date.era 更正。
age_of.get_new_year = function(year, 月, 日, era_key) {
	// 取平均值。因無法準確判別春節（農曆正月初一）日期，此方法尚有誤差！
	return new Date((year < 0 ? year : '000' + year) + '/2/1');
};


_.age_of = age_of;



// parse Durations
function parse_period(period) {
	var matched = period.match(parse_period.PATTERN);
	if (matched && (!/[日時]/.test(matched[2])
	// 預防 "10月22日夜7-8時"
	|| !/[時分秒\/]/.test(matched[2].match(/^(?:.*?)([年月日時分秒\/])/)[1]))) {
		(period = matched).shift();
		if (!period[1].includes('月')
				&& (matched = period[0].match(/[^年月]+月/)))
			period[1] = matched[0] + period[1];
		if (!period[1].includes('年')
				&& (matched = period[0].match(/[^年]+年/)))
			period[1] = matched[0] + period[1];
	} else if (library_namespace.is_debug(2))
		library_namespace.warn('parse_period: Can not parse period [' + period + ']');
	return period;
}


// '1/1/1-2/1/1' → [, '1/1/1', '2/1/1' ]
// 'Neo-Babylonian/Nabopolassar' → null
// "[^a-z]": 避免類似 "Neo-Babylonian" 被當作 period。
//
// "Maya:9.2.15.3.8 12 Lamat 6 Wo－Maya:9.6.11.0.16 7 Kib' 4 K'ayab'"
// → [, "Maya:9.2.15.3.8 12 Lamat 6 Wo", "Maya:9.6.11.0.16 7 Kib' 4 K'ayab'" ]
parse_period.PATTERN = /^(.+[^a-z]|[^\d]*\d.+)[\-–－—─~～〜﹣]\s*([^\-].+)$/i;

_.parse_period = parse_period;



//----------------------------------------------------------------------------------------------------------------------------------------------------------//



/*
mode:
	+4:不顯示時間,
	+3:顯示時間至時,
	+2:顯示時間至分,
	+1:顯示時間至秒,
	+0:顯示時間至毫秒(milliseconds)

	+32(4<<3):不顯示日期,
	+24(3<<3):顯示日期mm/dd,
	+16(2<<3):顯示日期yyyy/mm,
	+8(1<<3):顯示日期yyyy/mm/dd(星期),
	+0:顯示日期yyyy/mm/dd

	+64(1<<6):input UTC
	+128(2<<6):output UTC

NOTE:
在現有時制下要轉換其他時區之時間成正確time:
d=_其他時區之時間_;
diff=其他時區之時差(例如 TW: UTC+8)
d.setTime(d.getTime()-60000*((new Date).getTimezoneOffset()+diff*60))

*/

/**
 * 顯示格式化日期 string
 * 
 * @deprecated use Date_to_String.
 * 
 * @param date_value
 *            要轉換的 date, 值過小時當作時間, <0 轉成當下時間
 * @param {Number}
 *            mode 要轉換的 mode
 * @param {Boolean}
 *            zero_fill 對 0-9 是否補零
 * @param {String}
 *            date_separator date separator
 * @param {String}
 *            time_separator time separator
 * @return {String} 格式化後的日期
 * @example alert(format_date());
 * @since 2003/10/18 1:04 修正
 * @since 2010/4/16 10:37:30 重構(refactoring)
 * @requires to_fixed
 * @see http://www.merlyn.demon.co.uk/js-dates.htm,
 *      http://aa.usno.navy.mil/data/docs/JulianDate.html
 * @_memberOf _module_
 */
function format_date(date_value, mode, zero_fill, date_separator, time_separator) {
	//library_namespace.debug('[' + (typeof date_value) + '] ' + date_value + ', mode: ' + mode);

	// initialization
	if (!mode)
		mode = 0;

	var output_UTC, a, b = mode, time_mode, return_string = '',
	show_number = zero_fill ? function (n) {
		return n > 9 ? n : '0' + n;
	} : function (n) {
		return n;
	};

	//	date & time mode
	mode %= 64;
	//	UTC mode
	b = (b - mode) / 64;
	//	input UTC
	a = b % 2 == 1 ? 1 : 0;
	output_UTC = b - a === 1;

	time_mode = mode % 8;
	//	date mode
	mode = (mode - time_mode) / 8;
	// time_mode > 4 && mode > 3: error mode: 沒啥好顯示的了

	//	處理各種不同的 date
	b = typeof date_value;
	if (b === 'number' && date_value >= 0) {
		// 全球標準時間(UCT)與本地時間之差距
		// UTC time = local time + format_date.UTC_offset(milliseconds)
		if (!a && isNaN(a = format_date.UTC_offset))
			//	input UTC 時之差距(milliseconds)
			//	.getTimezoneOffset() is in minute. 60*1000(milliseconds)=6e4(milliseconds)
			a = format_date.UTC_offset = 6e4 * (new Date).getTimezoneOffset();

		// 值過小時當作時間: d < 90000000 ≈ 24*60*60*1000，判別為當天，只顯示時間。不允許 d < 0！
		date_value = new Date(Math.abs(a += date_value) < 9e7 ? a : date_value);
		mode = 32;
	} else if (b === 'string' && (a = date_value.toDate()))
		date_value = a;
	else if (b === 'date')
		// 應對在 Excel 等外部程式會出現的東西。
		date_value = new Date(date_value);
	else if (
		//	http://www.interq.or.jp/student/exeal/dss/ejs/1/1.html
		//	引数がオブジェクトを要求してくる場合は instanceof 演算子を使用します
		//	typeof date_value!=='object'||date_value.constructor!=Date
			!(date_value instanceof Date))
		//	new Date === new Date()
		date_value = new Date;


	// 處理 date
	if (mode < 4) {
		return_string = show_number((output_UTC ? date_value.getUTCMonth()
				: date_value.getMonth()) + 1);
		if (!date_separator)
			date_separator = '/';
		if (mode < 3)
			return_string = (output_UTC ? date_value.getUTCFullYear() : date_value
					.getFullYear())
					+ date_separator + return_string;
		if (mode !== 2) {
			return_string += date_separator
			+ show_number(output_UTC ? date_value.getUTCDate() : date_value
					.getDate());
			if (mode === 1)
				return_string += '(' + (output_UTC ? date_value.getUTCDay()
						: date_value.getDay()) + ')';
		}
	}

	// 處理 time
	if (time_mode < 4) {
		if (mode < 4)
			// 日期 & 時間中間分隔
			return_string += ' ';
		if (!time_separator)
			time_separator = ':';
		return_string += show_number(output_UTC ? date_value.getUTCHours()
				: date_value.getHours());
		if (time_mode < 3) {
			return_string += time_separator
			+ show_number(output_UTC ? date_value.getUTCMinutes()
					: date_value.getMinutes());
			if (time_mode < 2)
				return_string += time_separator
				+ (time_mode ? show_number(output_UTC ? date_value
						.getUTCSeconds() : date_value.getSeconds())
						: (output_UTC ? date_value.getUTCSeconds()
								+ date_value.getUTCMilliseconds() / 1e3
								: date_value.getSeconds() + date_value.getMilliseconds() / 1e3
							).to_fixed(3));
		}
	}

	return return_string;
};


//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// 組織 period list，以做後續檢索。

/**
 * 取得包含 date 之 periods<br />
 * need module CeL.data.native
 * 
 * @param {Date}date
 *            欲搜尋之 date
 * 
 * @returns {Array}period data
 */
function get_contemporary_periods(date) {
	date = +date;
	if (date < this.start[0])
		return;

	var start_index = this.start.search_sorted(date, {
		found : true
	}),
	// 邊際 period
	edge_period = this[start_index], contemporary = this.contemporary[start_index];

	if (contemporary) {
		var end_list = contemporary.end;
		// 把結束時間在 date 之前的去掉。
		var last_index = 0;
		// 因為量應該不大，採循序搜尋。
		while (end_list[last_index] <= date)
			last_index++;
		contemporary = contemporary.slice(last_index);
	} else
		contemporary = [];

	if (date < this.get_end(edge_period))
		contemporary.push(edge_period);
	else if (contemporary.length === 0)
		return;

	return contemporary;
}

// TODO
function add_period(period_data) {
	var start_time = this.get_start(period_data),
	// index to insert
	index = this.start.search_sorted(start_time, {
		found : true
	});
	TODO;
	if (start_time < this.start[0])
		;
}


if (false) {
	test_periods = sortest_periods([
		[ new Date(2015, 3, 2), new Date(2015, 7, 3), 'bbb' ],
		[ new Date(2015, 1, 2), new Date(2015, 4, 3), 'aaa' ],
	], 0, 1);

	test_periods.get_contemporary(new Date(2015, 1, 1));
	test_periods.get_contemporary(new Date(2015, 3, 2));
	test_periods.get_contemporary(new Date(2015, 3, 8));
	test_periods.get_contemporary(new Date(2015, 4, 3));
	test_periods.get_contemporary(new Date(2015, 7, 2));
	test_periods.get_contemporary(new Date(2015, 7, 3));
	test_periods.get_contemporary(new Date(2015, 7, 4));
}


/**
 * 組織 period_list，以做後續檢索。
 * 
 * @param {Object|Array}period_list
 *            period list
 * @param {Number|Function}start_index
 *            start index. 若為 function，回傳須轉為 number，不應回傳 boolean, false。
 * @param {Number|Function}end_index
 *            end index. 若為 function，回傳須轉為 number，不應回傳 boolean, false。
 * @param {Number}[unit_length]
 * 
 * @returns {Array}period list
 */
function sort_periods(period_list, start_index, end_index, unit_length) {
	var periods = [], start_list = [],
	// assert: Number.isFinite(get_start(period_data))
	get_start = typeof start_index === 'function' ? start_index
			: function(data) {
				return +data[start_index];
			},
	// assert: Number.isFinite(get_end(period_data))
	get_end = typeof end_index === 'function' ? end_index : function(data) {
		var time = +data[end_index];
		return isNaN(time) ? +get_start(data) + unit_length : time;
	};
	if (!(unit_length > 0))
		unit_length = ONE_DAY_LENGTH_VALUE;
	// periods.get_start = get_start;
	periods.get_end = get_end;
	// periods.unit = unit_length;

	function add_index(period_data, index) {
		start_list.push([ get_start(period_data), period_data ]);
	}
	if (typeof period_list.forEach === 'function')
		period_list.forEach(add_index);
	else
		for ( var key in period_list)
			add_index(period_list[key], key);

	// sort by start time
	start_list.sort(function(period1, period2) {
		return period1[0] - period2[0];
	});

	// [ start time value, ... ]
	var start_time_list = [],
	// [ [ period_data, period_data, ... ], ... ]
	// contemporary 若存在，應該按照 end 時間由前至後 sort。
	contemporary = [],
	//
	last_contemporary, last_end_list, last_end,
	// 前一period
	last_period;
	periods.start = start_time_list;
	periods.contemporary = contemporary;
	if (false) {
		periods.add = add_period;
		start_list.forEach(function(period_data) {
			periods.add(period_data);
		});
	}

	start_list.forEach(function(period, index) {
		var start_time = period[0];
		periods.push(period[1]);
		start_time_list.push(start_time);
		if (last_contemporary) {
			last_contemporary = last_contemporary.slice();
			last_end_list = last_end_list.slice();
		} else {
			last_contemporary = [];
			last_end_list = [];
		}

		// 除去結束時間於本 period 之前的 period。
		var past_index = 0;
		// 因為量應該不大，採循序搜尋。
		while (last_end_list[past_index]
				&& start_time < last_end_list[past_index])
			past_index++;
		if (past_index > 0) {
			last_end_list.slice(past_index);
			last_contemporary.slice(past_index);
		}

		if (start_time < last_end) {
			// last_period 與本 period 重疊。將之添入。
			past_index = 0;
			// 因為量應該不大，採循序搜尋。
			while (last_end_list[past_index] <= last_end)
				past_index++;
			last_end_list.splice(past_index, 0, last_end);
			last_contemporary.splice(past_index, 0, last_period);
		}

		// last_contemporary: 不包含本 period 之本 period 共存 periods。

		if (last_contemporary.length > 0)
			(contemporary[index] = last_contemporary).end = last_end_list;
		else
			last_contemporary = null;
		last_end = get_end(last_period = period[1]);
	});

	periods.get_contemporary = get_contemporary_periods;
	return periods;
}

_.sort_periods = sort_periods;

//----------------------------------------------------------------------------------------------------------------------------------------------------------//


library_namespace.set_method(String.prototype, {
	to_Date : set_bind(String_to_Date)
});


library_namespace.set_method(Date.prototype, {
	age : set_bind(age_of, true),
	format : set_bind(Date_to_String)
});


return (
	_// JSDT:_module_
);
}


});

