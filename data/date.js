/**
 * @name CeL function for date / time operations.
 * @fileoverview 本檔案包含了 date / time 的功能。
 * 
 * TODO: http://momentjs.com/
 * @see Moment.js https://momentjs.com/
 * @since
 */

'use strict';
// 'use asm';

// More examples: see /_test suite/test.js

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'data.date',
	// includes() @ CeL.data.code.compatibility.
	require : 'data.code.compatibility.'

	// for gettext()
	// + '|application.locale'

	+ '|data.native.set_bind|data.code.parse_escape|data.native.pad',

	// 設定不匯出的子函式。
	// no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring
	var set_bind = this.r('set_bind'), parse_escape = this.r('parse_escape'), pad = this
			.r('pad');

	/**
	 * null module constructor
	 * 
	 * @class date objects 的 functions
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

	if (false) {
		(function() {
			/*
			 * opposite of toUTCString() 尚不成熟！假如是type=='date'，不如用new Date()!
			 * string大部分可用new Date(Date.parse(str))代替!
			 * http://www.comsharp.com/GetKnowledge/zh-CN/TeamBlogTimothyPage_K742.aspx
			 */
			var UTCDay, UTCMonth;
			set_Object_value('UTCDay', 'Sun,Mon,Tue,Wed,Thu,Fri,Sat', 1);
			set_Object_value('UTCMonth',
					'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec', 1);
			// 0:[Mon, 9 Aug 2004 12:05:00 GMT],1:[Thu Sep 30
			// 18:12:08 UTC+0800 2004],2:[Sat Jun 26 18:19:46 2004]
			var fromUTCStringFormat = [ [ 0, 3, 2, 1, 4 ], [ 0, 5, 1, 2, 3 ],
					[ 0, 4, 1, 2, 3 ] ];
			function fromUTCString(str, format) {
				var s = '' + str, f;
				if (!s)
					return;
				if (typeof format == 'undefined')
					if (f = Date.parse(s))
						return new Date(f);
					else
						return 'Unknown format!';// format=0;
				if (!isNaN(format) && format < fromUTCStringFormat.length)
					f = fromUTCStringFormat[format];
				else
					return 'Yet support this kind of format[' + format
							+ ']!\nWe support to ' + fromUTCStringFormat.length
							+ '.';
				if (!f[0])
					f[0] = ' ';
				s = s.replace(new RegExp(f[0] + '+', 'g'), f[0]).split(f[0]);
				if (s.length < f.length)
					return 'The item length of data: ' + s.length
							+ ' is less then format[' + format + ']: '
							+ f.length + '!\n' + s.join(',');// new
				// Date
				if (f.length == 5)
					s[f[4]] = s[f[4]].split(':');
				else if (f.length == 7)
					s[f[4]] = [ s[f[4]], s[f[5]], s[f[6]] ];
				else
					return 'Illegal date format!';
				if (format == 1 && s[4].match(/([+\-]\d{2})/))
					s[f[4]][0] = parseInt(s[f[3]][0]) + parseInt(RegExp.$1);
				library_namespace.debug(str + '\n' + s[f[1]] + ',' + s[f[2]]
						+ '(' + UTCMonth[s[f[2]]] + '),' + s[f[3]] + ','
						+ s[f[4]][0] + ',' + s[f[4]][1] + ',' + s[f[4]][2]);
				// check, 可以包括星期
				if (!(s[f[2]] = UTCMonth[s[f[2]]])
						|| !(s = new Date(s[f[1]], s[f[2]], s[f[3]],
								s[f[4]][0], s[f[4]][1], s[f[4]][2]))) // Date.UTC()
					s = 'Input data error!';
				return s;
			}
		});
	}

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

	var is_Date = library_namespace.is_Date,
	//
	UTC_PATTERN = /UTC(?:\s*([+\-]?\d{1,2})(:\d{1,2})?)?/i,
	// assert: isNaN(DEFAULT_TIME_ZONE) === true
	// isNaN(Object.create(null)) will throw @ Chrome/36
	// (Cannot convert object to primitive value),
	// therefore we can't use Object.create(null) here.
	DEFAULT_TIME_ZONE = {
		timezone : 'default'
	};

	// 嘗試 UTC+08:00 之類的標準表示法。
	function get_minute_offset(date_string) {
		var matched = date_string.match(UTC_PATTERN);
		if (matched) {
			return 60 * (matched[1] | 0) + (matched[2] | 0);
		}
	}

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//
	// basic constants. 定義基本常數。

	/** {Number}一整天的 time 值。should be 24 * 60 * 60 * 1000 = 86400000. */
	var ONE_DAY_LENGTH_VALUE = new Date(0, 0, 2) - new Date(0, 0, 1),
	// ONE_DAY_LENGTH_VALUE = CeL.date.to_millisecond('1D')
	// 3 * ONE_DAY_LENGTH_VALUE === CeL.date.to_millisecond('3D')

	/** {Number}一分鐘的 time 值(in milliseconds)。should be 60 * 1000 = 60000. */
	ONE_MINUTE_LENGTH_VALUE = new Date(0, 0, 1, 0, 2) - new Date(0, 0, 1, 0, 1),
	/** {Number}一整時辰的 time 值。should be 2 * 60 * 60 * 1000 = 7200000. */
	ONE_時辰_LENGTH_VALUE = new Date(0, 0, 0, 2) - new Date(0, 0, 0, 0),

	// e.g., UTC+8: -8 * 60 = -480
	present_local_minute_offset = (new Date).getTimezoneOffset() || 0;

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//
	// for Julian date. 期能不使用內建 Date 以快速計算日期。
	// @see https://en.wikipedia.org/wiki/Julian_day#Calculation
	// 適用範圍: 4717/3/1 BCE 0:0 之後。

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
	 *            calendar type. true: Gregorian, false: Julian, 'CE': Common
	 *            Era
	 * @param {Boolean}no_year_0
	 *            no year 0
	 * @param {Boolean}get_remainder
	 *            Will return [ {Number} Julian day number (JDN), {Number}
	 *            remainder ].<br />
	 *            remainder / ONE_DAY_LENGTH_VALUE = day.
	 * 
	 * @returns {Number} Julian day number (JDN)
	 */
	function Julian_day(date, type, no_year_0, get_remainder) {
		if (typeof date === 'string') {
			var matched = date
			// parse '1/1/1'
			.match(/(-?\d{1,4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
			if (matched) {
				return Julian_day.from_YMD(matched[1] | 0, matched[2] | 0,
						matched[3] | 0, type, no_year_0);
			}

			if (-4716 < date && date < 9999) {
				// treat as year
				return Julian_day.from_YMD(date | 0, 1, 1, type, no_year_0);
			}

			if (matched = date.match(/(-?\d{1,4})[\/\-](\d{1,2})/)) {
				return Julian_day.from_YMD(matched[1] | 0, matched[2] | 0, 1,
						type, no_year_0);
			}

			// throw new Error('Julian_day: Cannot parse [' + date + ']');
			if (library_namespace.is_debug(2)) {
				library_namespace.error('Julian_day: 無法解析 [' + date + ']！');
			}
			return;
		}

		if (!isNaN(date)) {
			// offset: convert local to UTC+0.
			var offset;
			if (is_Date(date)) {
				offset = date.getTimezoneOffset() * ONE_MINUTE_LENGTH_VALUE;
				date = date.getTime();
			} else {
				offset = Julian_day.default_offset;
			}

			// treat ((date)) as date value. So it's Gregorian.
			type = true;
			date -= offset
			// epoch 為 12:0，需要將之減回來以轉成 midnight (0:0)。
			+ Julian_day.epoch - ONE_DAY_LENGTH_VALUE / 2;
			var remainder;
			if (get_remainder) {
				remainder = date % ONE_DAY_LENGTH_VALUE;
				if (remainder < 0) {
					remainder += ONE_DAY_LENGTH_VALUE;
				}
			}
			date = Math.floor(date / ONE_DAY_LENGTH_VALUE);
			return get_remainder ? [ date, remainder ] : date;
		}

		if (Array.isArray(date)) {
			var JD = Julian_day.from_YMD(date[0], date[1], date[2], type,
					no_year_0);
			return get_remainder ? [ JD, date.length > 3
			//
			? Julian_day.from_HMS(date[3], date[4], date[5]) - .5 : 0 ] : JD;
		}
	}

	/**
	 * Get JDN of (year, month, date).<br />
	 * input MUST latter than -4716/3/1 (4717/3/1 BCE)!!
	 * 
	 * <code>

	JDN = CeL.Julian_day.from_YMD(year, month, date, 'CE');

	</code>
	 * 
	 * @param {Integer}year
	 *            year >= -4716
	 * @param {Natural}month
	 *            1–12
	 * @param {Natural}date
	 *            1–31
	 * @param {Boolean}type
	 *            calendar type. true: Gregorian, false: Julian, 'CE': Common
	 *            Era
	 * @param {Boolean}no_year_0
	 *            no year 0
	 * 
	 * @returns {Number} JDN
	 */
	Julian_day.from_YMD = function(year, month, date, type, no_year_0) {
		if (Array.isArray(year)) {
			return Array.isArray(month)
			// month = [H,M,S]
			? Julian_day.from_YMD(year[0], year[1], year[2], date, type) - .5
					+ Julian_day.from_HMS(month[0], month[1], month[2])
			//
			: Julian_day.from_YMD(year[0], year[1], year[2], month, date);
		}
		if (no_year_0 && year < 0) {
			// no year 0. year: -1 → 0
			year++;
		}
		if (type === 'CE') {
			type = year > 1582
			// Julian calendar（儒略曆）1582年10月4日的下一日為
			// Gregorian calendar（格里高利曆）1582年10月15日。
			|| year == 1582 && (month > 10 || month == 10 && date >= 15);
		}

		// method: 自 3月起算。
		if (false) {
			if (month < 3) {
				year = +year + 4800 - 1 | 0;
				month = +month + 12 - 3 | 0;
			} else {
				year = +year + 4800 | 0;
				month = +month - 3 | 0;
			}
		}
		// a=1: 1–2月, a=0: 3–12月
		// var a = (14 - month) / 12 | 0;
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
		if (second) {
			time += +second;
		}
		// to minutes
		time /= 60;
		if (minute) {
			time += +minute;
		}
		// to hours → to days
		return (time / 60 + (+hour || 0)) / 24;
	};

	/**
	 * Get (year, month, date) of JDN.
	 * 
	 * @param {Number}JDN
	 *            Julian date number
	 * @param {Boolean}type
	 *            calendar type. true: Gregorian, false: Julian, 'CE': Common
	 *            Era.
	 * @param {Boolean}no_year_0
	 *            no year 0
	 * 
	 * @returns {Array} [ year, month, date ]
	 * 
	 * @see https://en.wikipedia.org/wiki/Julian_day#Julian_or_Gregorian_calendar_from_Julian_day_number
	 *      algorithm by Richards 2013
	 */
	Julian_day.to_YMD = function(JDN, type, no_year_0) {
		var f = JDN + 1401 | 0;
		if (type && (type !== 'CE' || JDN >= Gregorian_reform_JDN)) {
			// to proleptic Gregorian calendar
			f += ((((4 * JDN + 274277) / 146097 | 0) * 3) / 4 | 0) - 38;
		} else {
			// to proleptic Julian calendar with year 0
		}

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

		if (no_year_0 && year < 1) {
			// no year 0. year: 0 → -1
			year--;
		}

		// TODO: time
		return [ year, month, date ];
	};

	/**
	 * JD to YMDHMS. Get (year, month, date, hour, minute, second) of JD.
	 * 
	 * @param {Number}JD
	 *            Julian date
	 * @param {Number}zone
	 *            local time zone. 0 if is UTC+0 (default), 8 if is UTC+8.
	 * @param {Boolean}type
	 *            calendar type. true: Gregorian, false: Julian, 'CE': Common
	 *            Era.
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
		var JDN = Julian_day.to_YMD(JD += .5 + 1e-16 + (zone | 0) / 24, type,
				no_year_0);
		// to local time
		JDN.push((JD = JD.mod(1) * 24) | 0, (JD = (JD % 1) * 60) | 0,
				(JD = (JD % 1) * 60) | 0);
		// milliseconds 去除 error。
		// 4e-11:
		// 1e-16*86400 ≈ 1e-11
		// (-Math.log10((1/2-1/3-1/6)*86400)|0) → 1e-11
		// So we use 1e-11 + 1e-11 = 2e-11.
		// But for CeL.Julian_day.to_YMDHMS(.6, 8), it seems still not enough.
		// We should use 4e-11 at least.
		if ((JD %= 1) > 4e-11) {
			// 8.64e-9 = 1e-16 * 86400000: 將之前加的 error 修正補回來。
			// 約精確到 1e-7 ms
			JDN.push(JD * 1000 - 8.64e-9);
		} else {
			// 當作 error。
		}
		return JDN;
	};

	/**
	 * Get the local midnight date of JDN.<br />
	 * 傳回 local midnight (0:0)。
	 * 
	 * <code>

	date = CeL.Julian_day.to_Date(JDN);

	</code>
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
		if (!is_JD) {
			// epoch 為 12:0，需要將之減回來以轉成 midnight (0:0)。
			JDN -= .5;
		}
		JDN = JDN * ONE_DAY_LENGTH_VALUE + Julian_day.epoch
		//
		+ (isNaN(offset) ? Julian_day.default_offset : offset);
		return get_value ? JDN : new Date(JDN);
	};

	Julian_day.YMD_to_Date = function(year, month, date, type, get_value,
			no_year_0) {
		var JDN = Julian_day.from_YMD(year, month, date, type, no_year_0);
		// 當作 JD 才方便 date.format() 得到正確結果。
		return Julian_day.to_Date(JDN, true, get_value);
	};

	/**
	 * Get Julian date (JD) of date.
	 * 
	 * @param {String|Date|Number}date
	 *            date or date value
	 * @param {Boolean}type
	 *            calendar type. true: Gregorian, false: Julian, 'CE': Common
	 *            Era
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
	Julian_day.default_offset = present_local_minute_offset
			* ONE_MINUTE_LENGTH_VALUE;

	// Get the epoch of Julian date, i.e., -4713/11/24 12:0
	(function() {
		var date = new Date(0),
		// [ -4713, 11, 24 ]
		JD0 = Julian_day.to_YMD(0, true);
		// set the date value of Julian date 0
		date.setUTCHours(12, 0, 0, 0);
		date.setUTCFullYear(JD0[0] | 0, (JD0[1] | 0) - 1, JD0[2] | 0);
		Julian_day.epoch = date.getTime();
		// Julian_day.epoch = -210866760000000;
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

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

	// Unix time (a.k.a. POSIX time or Epoch time)
	function Unix_time(date) {
		return ((date || Date.now()) - Unix_time.epoch) / 1000;
	}

	_.Unix_time = Unix_time;

	// Unix epoch '1970-01-01T00:00:00Z', 0 @ most systems
	Unix_time.epoch = Date.parse('1970/1/1 UTC');

	Unix_time.to_Date = function(time_value) {
		return new Date(1000 * time_value + Unix_time.epoch);
	};

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

	// The 1900 Date System
	// 序列值 1 代表 1/1/1900 12:00:00 a.m。
	// 數字 32331.06 代表日期和時間 7/7/1988年 1:26:24 a.m。
	var Excel_1900_epoch = Date.parse('1900/1/1') - ONE_DAY_LENGTH_VALUE,
	// The 1904 Date System
	// 依預設，Excel for Mac 使用 1904 日期系統，而 Excel for Windows 使用 1900 日期系統。這表示當您在
	// Excel for Mac 中輸入序列值 1 並將其格式化為日期，Excel 會將其顯示為 1/2/1904 12:00 a.m。Excel
	// for Windows 則會將序列值 1 顯示為 1/1/1900 12:00 a.m。
	// Date.parse('1904/1/2') - ONE_DAY_LENGTH_VALUE
	Excel_1904_epoch = Date.parse('1904/1/1');

	function Excel_Date(date_value, is_Mac, get_value) {
		// 0會被轉成 1900/1/0，已經不正常。
		if (date_value >= 1) {
			// 這邊採用與 function Date_to_Excel() 相對應的判別式。
			if (!is_Mac && !(date_value < 60)) {
				date_value--;
			}
			date_value = (is_Mac ? Excel_1904_epoch : Excel_1900_epoch)
					+ ONE_DAY_LENGTH_VALUE * date_value;
		} else {
			date_value = NaN;
		}
		return get_value ? date_value : new Date(date_value);
	}

	_.Excel_Date = Excel_Date;

	if (false) {
		Excel_Date.error_value = {
			valueOf : function() {
				return NaN;
			},
			toString : function() {
				return '#VALUE!';
			}
		};
	}
	// Excel 2010 會將錯誤值顯示為'#VALUE!'，但負數或過大值則會以'#'填滿格子(e.g., "#########")。
	Excel_Date.error_value = '#VALUE!';

	if (false) {
		// to show Excel date
		(date = date.to_Excel()) && date.toFixed(2)
				|| CeL.Excel_Date.error_value;
	}

	// http://support.microsoft.com/kb/214094
	// Excel for Mac uses the 1904 date system and
	// Excel for Windows uses the 1900 date system.
	function Date_to_Excel(date, is_Mac) {
		date = date.getTime() - (is_Mac ? Excel_1904_epoch : Excel_1900_epoch);
		return date >= 1 ?
		// Excel 有 1900/2/29 (60)，但現實中沒有這天。因此一般轉換時，不應出現60之值。
		// Mac 系統以 1904 CE 起始，迴避了這個問題。
		// 0: 1900/1/0
		// https://en.wikipedia.org/wiki/Year_1900_problem
		// 60: 1900/2/29 (nonexistent date)
		// 61: 1900/3/1
		(date /= ONE_DAY_LENGTH_VALUE) < 60 || is_Mac ? date : date + 1
		// or use Excel_Date.error_value
		: NaN;
	}

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

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

	// ISO 8601
	var PATTERN_ISO_DATE = /^-?\d{4,8}-[01]\d-[0-3]\d(T[012]\d:[0-6]\d:[0-6]\d(\.\d{3})?(Z|[+\-][012]\d:\d{2}))?$/;

	/**
	 * convert the string to Date object.
	 * 
	 * TODO: parse /([今昨明]|大?[前後])天/, '01-03' (相對於當前),
	 * /\d+(分[鐘钟]?|小[時时]|毫?秒|[日天週年]|星期|[禮礼]拜|[個个]月)([前後])/; 相對於
	 * options.base_date . also see indicate_date_time()
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
	 *            {Function}parser: the parser used. if set to unrecognized
	 *            (e.g., null) parser, it will use Date.parse() ONLY.<br />
	 *            {String|Number}zone: 設定 date_string 之 time zone or country
	 *            (e.g., 'CST', 'TW') || 時差 in hour (例如 TW: UTC+8 → 8, 可使用.5).<br />
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
	 * @see wikitext: {{#time:Y年n月j日|+1 day}}
	 */
	function String_to_Date(date_string, options) {
		// 檢測輸入引數(arguments)，將之正規化(normalization)，處理、轉換為規範之標準型態。
		library_namespace.debug('parse (' + typeof date_string + ') ['
				+ date_string + ']', 3, 'String_to_Date');

		if (typeof date_string === 'date') {
			// 應對在 Excel 等外部程式會出現的東西。
			return new Date(date_string);
		}
		if (is_Date(date_string)) {
			return date_string;
		}

		date_string = date_string.trim();
		if (!date_string) {
			// this.toString();
			// date_string = this.valueOf();
			return;
		}

		if (PATTERN_ISO_DATE.test(date_string)) {
			// 對於有明確指定之 UTC date 如 .toISOString() 之產出或 ISO 8601，
			// 應當不管 time zone 如何設定，直接回傳。
			return new Date(date_string);
		}

		var tmp, matched, minute_offset;

		if (library_namespace.is_RegExp(options)) {
			// 將 options 當作 pattern。
			options = {
				pattern : options
			};
		} else if (!library_namespace.is_Object(options)) {
			// 前置處理。
			tmp = options;
			options = Object.create(null);
			if (tmp) {
				if (tmp in String_to_Date.parser) {
					options.parser = String_to_Date.parser[tmp];
				} else if ((tmp in String_to_Date.zone) || !isNaN(tmp)) {
					options.zone = tmp;
				} else {
					// 判斷是否為正規 format。
					options.format = tmp;
				}
			}
		}

		// console.trace(date_string);
		if (library_namespace.is_RegExp(options.pattern)
		//
		&& (matched = date_string.match(options.pattern))) {
			// 依照 matched 匹配的來正規化/設定年月日。
			// e.g., new Date('1234/5/6')
			// === '1234年5月6日'.to_Date(/(\d+)年(\d+)月(\d+)日/)
			// ===
			// '5/6/1234'.to_Date({pattern:/(\d+)\/(\d+)\/(\d+)/,pattern_matched:[3,1,2]})
			tmp = Array.isArray(options.pattern_matched) ? options.pattern_matched
					: [ 1, 2, 3 ];
			date_string = tmp.map(function(processor) {
				return typeof processor === 'function'
				//
				? processor(matched) : matched[processor];
			}).join(
			// 長度3時當作年月日，否則當作自訂處理。
			tmp.length === 3 ? '/' : '');
		}
		// console.trace(date_string);

		// 設定指定 time zone 之 offset in minutes.
		tmp = options.zone;
		library_namespace.debug('設定 time zone / offset hours: ' + tmp, 2);
		// TODO: for Daylight Saving Time (DST) time zones, etc.
		if (tmp in String_to_Date.zone) {
			tmp = String_to_Date.zone[tmp];
		}
		if (library_namespace.is_Function(tmp)) {
			tmp = tmp();
		}
		if (typeof tmp !== 'string'
				|| isNaN(minute_offset = get_minute_offset(tmp))) {
			minute_offset =
			// 測試純數字小時。
			-12 <= tmp && tmp <= 14 ? 60 * tmp
			// 再測試純數字分鐘。
			: isNaN(tmp)
			//
			? DEFAULT_TIME_ZONE : +tmp;
		}
		library_namespace.debug('最終設定 offset '
				+ (minute_offset === DEFAULT_TIME_ZONE ? '(default　= '
						+ String_to_Date.default_offset + ')' : minute_offset)
				+ ' minutes.', 2);

		// 判別 parser。
		tmp = library_namespace.is_Function(tmp = options.parser) ? tmp
				: String_to_Date.parser[tmp] || String_to_Date.default_parser;

		if (library_namespace.is_Function(tmp)) {
			library_namespace.debug('use customize parser to parse ('
					+ typeof date_string + ') [' + date_string + '].', 2);
			// console.trace(date_string);
			if (tmp = tmp(date_string,
			// assert: parser 亦負責 parse time zone offset.
			minute_offset, options)) {
				return tmp;
			}
		}

		library_namespace.debug('無法以 parser 判別。use Date.parse() to parse.', 2);
		if (tmp = Date.parse(date_string)) {
			// TODO: period_end 無效。
			// native parser 會處理 time zone offset.
			tmp = new Date(tmp);
			if (!isNaN(minute_offset) && minute_offset !== DEFAULT_TIME_ZONE) {
				tmp.setMinutes(tmp.getMinutes() - tmp.getTimezoneOffset()
						- minute_offset);
			}
			return tmp;
		}
	}

	// 本地之 time zone / time offset (UTC offset by minutes)。
	// e.g., UTC+8: 8 * 60 = +480
	// e.g., UTC-5: -5 * 60
	// 亦為 Date.parse(date_string) 與 new Date() 會自動附上的當地時間差距。
	// assert: String_to_Date.default_offset 為整數。
	String_to_Date.default_offset = -present_local_minute_offset;

	/**
	 * <code>
	主要指是否計算 0 year。
	.no_year_0 = true: 將 astronomical year numbering 轉成一般紀年法（1 BCE→1 CE）。
	僅用於計算 Gregorian calendar, Julian calendar。
	normal	astronomical
	2	2
	1	1
	-1	0
	-2	-1
	-3	-2
	</code>
	 */
	String_to_Date.no_year_0 = Date_to_String.no_year_0 = true;

	var stem_branch_date_pattern,
	// 精密度: 千紀,世紀,年代,年,月,日,時,分,秒,毫秒
	index_precision = 'millennium,century,decade,year,month,day,hour,minute,second,microsecond'
			.split(',');
	(function() {
		// e.g., for '公元前720年2月22日'
		var start_pattern = '^[^\\d:\\-−‐前.]*',
		// with weekday 星期
		mid_pattern = '(?:\\s*\\(?[日月火水木金土一二三四五六]\\)?)?(?:\\s+',
		// e.g., for '1616年2月壬午', '7時'
		end_pattern = ')?[^\\d日時]*$',

		// pattern of date. 當今會準確使用的時間，
		// 為 -47xx BCE (Julian day 0) 至 2xxx CE。
		date_pattern = /(?:([\-−‐前]?(?:[0-4]?\d{3}|\d{1,3}))[\/.\-年 ])?\s*([01]?\d)(?:[\/.\-月 ]\s*([0-3]?\d)日?)?/.source,
		// pattern of time. [0-6]: 支持閏秒
		time_pattern = /([0-2]?\d)[:時时]\s*(?:([0-6]?\d)[:分]?\s*(?:([0-6]?\d)(?:\.(\d+))?)?)?秒?\s*(?:([PA])M)?/i.source;

		// 日期先: date [time]
		String_to_Date_default_parser.date_first = new RegExp(start_pattern
				+ date_pattern + mid_pattern + time_pattern + end_pattern, 'i');
		// 時間先: time [date]
		String_to_Date_default_parser.time_first = new RegExp(start_pattern
				+ time_pattern + mid_pattern + date_pattern + end_pattern, 'i');

		// 將於下方作初始化。
		stem_branch_date_pattern = date_pattern;
	})();

	// [ all, start month, end month, year, misc ]
	var PATTERN_EN_MONTH_YEAR = /^(?:([a-z]{3,9})\s*[.\/\-–－—─~～〜﹣])?\s*([a-z]{3,9}),?\s+(\d{1,4})( +\D.*)?$/i,
	// [ all, year, start month, end month, misc ]
	PATTERN_EN_YEAR_MONTH = /^(\d{1,4})\s+(?:([a-z]{3,9})\s*[.\/\-–－—─~～〜﹣])?\s*([a-z]{3,9})( +\D.*)?$/i,
	// U+2212 '−': minus sign
	// 為了 calendar 測試，年分需要能 parse 0–9999。
	// [ all, .*年, \d+, [百千] ]
	PATTERN_YEAR_ONLY = /^[^\d\/:\-−‐前日月年]*(\d{3,4}|([\-−‐前]?\d{1,4})([百千]?)年|[\-−‐前]\d{1,4})[^\d\/:\-−‐前日月年]*$/,
	//
	PATTERN_BCE = /(?:^|[^a-z.])B\.?C\.?E?(?:[^a-z.]|$)/i, time_boundary = new Date(
			0, 0, 1);
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
	function String_to_Date_default_parser(date_string, minute_offset, options) {
		// console.trace(date_string);
		if (is_Date(date_string)) {
			return date_string;
		}

		// 前置處理。
		if (!library_namespace.is_Object(options)) {
			options = Object.create(null);
		}

		var date_data,
		// 精密度
		precision, period_end = options.period_end,
		// matched string
		matched, tmp,
		//
		no_year_0 = 'no_year_0' in options ? options.no_year_0
				: String_to_Date.no_year_0;

		date_string = date_string.trim()
		// 注意:"紀"會轉換成結束時間。
		.replace(/世[紀纪]/g, '百年').replace(/千[紀纪]/g, '千年');

		// ------------------------------------------------

		// [ all, start month, end month, year, misc ]
		matched = date_string.match(PATTERN_EN_MONTH_YEAR);
		if (!matched && (matched = date_string.match(PATTERN_EN_YEAR_MONTH))) {
			matched.splice(4, 0, matched[1]);
			matched.splice(1, 1);
		}
		if (matched) {
			// e.g., 'May–June 1998', 'June 1998 UTC+6'
			// console.trace(period_end, matched);
			var date_value = Date.parse(
			//
			(!period_end && matched[1] || matched[2]) + ' ' + matched[3]
			// matched[4]: e.g., 'UTC+8'
			+ (matched[4] || ''));
			if (isNaN(date_value)) {
				// Cannot parse "month year"
				library_namespace.debug('無法 parse: [' + date_string + ']', 2,
						'String_to_Date_default_parser');
				return;
			}

			if (!/UTC(?:\W|$)/.test(matched[4])
			//
			&& !isNaN(minute_offset) && minute_offset !== DEFAULT_TIME_ZONE) {
				date_value -= (present_local_minute_offset + minute_offset)
						* ONE_MINUTE_LENGTH_VALUE;
			}
			date_value = new Date(date_value);
			if (period_end) {
				date_value.setMonth(date_value.getMonth() + 1);
			} else if (false && matched[1]) {
				library_namespace.warn('Cannot handle date range: '
						+ date_string);
			}

			// .precision 將會影響 function wikidata_datavalue() @
			// CeL.application.net.wiki.data
			date_value.precision = 'month';
			return date_value;
		}

		// ------------------------------------------------

		if (isNaN(minute_offset)
				&& !isNaN(tmp = get_minute_offset(date_string))) {
			minute_offset = tmp;
			// 留下此 pattern 在 match 時會出錯。
			date_string = date_string.replace(UTC_PATTERN, '').trim();
		}

		// TODO:
		// e.g., '10.12', '10/12'
		// e.g., '10/12, 2001'
		// e.g., '10 12, 2001'
		// e.g., '2001 10 12'

		if (matched = date_string.match(PATTERN_YEAR_ONLY)) {
			// 僅有 xxx/1xxx/2xxx 年(year) 時。
			precision = matched[3] === '百' ? 'century'
					: matched[3] === '千' ? 'millennium'
					// 注意：這邊不會檢查如"2016年代"之合理性（應當為"2010年代"）
					: date_string.includes('年代') ? 'decade' : 'year';
			date_string = (matched[2] || matched[1]).replace(/^[−‐前]/, '-000');
			if (period_end) {
				if (matched[3]) {
					// 將於後面才作位數處理。
					++date_string;
				} else {
					// 作位數處理。
					matched = date_string.includes('00');
					if (!++date_string) {
						// 預防 前1年 → 0年。
						date_string = no_year_0 ? '0001' : '0000';
					} else if (matched
							&& (date_string = '00' + date_string).length < 4) {
						date_string = '0' + date_string;
					}
				}
				// 已處理過 period_end，因此除去此 flag。
				period_end = false;
			}
			if (matched[3]) {
				date_string = date_string
				// 轉換到正確的年份。
				* (precision === 'century' ? 100 : 1000);
				// 作位數處理。
				if (0 < date_string && date_string < 1000) {
					date_string = '0' + date_string;
				} else if (date_string === 0) {
					date_string = '000';
				}
			}
			// 添加月份以利parse。
			date_string += '/1';
		} else {
			// 依照中文之習慣，日期 + 時間中間可不加空格。
			date_string = date_string.replace(/日(\d)/, '日 $1');
		}

		if (false &&
		// 速度似乎差不多。
		(date_data = date_string.match(/^(-?\d{1,4})\/(\d{1,2})\/(\d{1,2})$/))) {
			// library_namespace.debug('輸入格式: 日期', 2);
			date_data.shift();

		} else if ((date_data = date_string
				.match(String_to_Date_default_parser.date_first))
				&& isNaN(date_data[0])) {
			// library_namespace.debug('輸入格式: 日期 (+ 時間)', 2);
			date_data.shift();

		} else if (date_data = date_string
				.match(String_to_Date_default_parser.time_first)) {
			// library_namespace.debug('輸入格式: 時間 (+ 日期): 未匹配或僅有一數字', 2);
			// [ 1, 2, 3, 4, 5, 6, 7, 8 ]
			// → [ 6, 7, 8, 1, 2, 3, 4, 5 ]
			date_data.shift();
			date_data.unshift(date_data[5], date_data[6], date_data[7]);
			date_data.length = 8;

		} else {
			library_namespace.debug('無法 parse: [' + date_string + ']', 2,
					'String_to_Date_default_parser');
			return;
		}

		if (!precision) {
			// 這邊僅處理年以下的單位。
			date_data.some(function(value, index) {
				if (!value) {
					// value should be undefined.
					if (index > 0) {
						precision = index_precision[index + 2];
					}
					return true;
				}
			});
		}

		// ----------------------------------------------------

		// date_data: index: [ year, month, month_day (Day of
		// the month), hour, minute, second, milliseconds, Ante
		// meridiem or Post meridiem ]

		library_namespace.debug(date_data.join('<br />'), 2,
				'String_to_Date_default_parser');

		tmp = date_data.length === 8 && date_data.pop();
		if (tmp === 'P' || tmp === 'p') {
			// is PM (else: AM or 24-hour format)
			date_data[3] = 12 + (date_data[3] | 0);
		}

		var year = +date_data[0];
		if (isNaN(year) && /^前/.test(date_data[0])) {
			year = -date_data[0].slice(1);
		}
		// fix browser Date.parse() bug for BCE date.
		else if (year > 0 && PATTERN_BCE.test(date_string)) {
			year = -year;
			if (!('no_year_0' in options)) {
				// default: no year 0
				no_year_0 = true;
			}
		}

		// 確定正確年份: 若無 year 0 則所有負的年份皆 +1，
		// 轉成<a
		// href="http://en.wikipedia.org/wiki/Astronomical_year_numbering"
		// accessdate="2013/2/11 15:40" title="Astronomical year
		// numbering">天文年號</a>。
		// (BCE) -1 → 0, -2 → -1, -3 → -2, ...
		if (year < 0) {
			if (no_year_0) {
				year++;
			}

		} else if (year < 100 && date_data[0].length < 3
		// year padding: 0–99 的年份會加上此年份。
		&& (tmp = isNaN(options.year_padding)
		//
		? String_to_Date_default_parser.year_padding : options.year_padding)) {
			year += tmp;
		}

		date_data[0] = year;
		if (period_end) {
			tmp = date_data.length;
			// 由小至大，將第一個有指定的加一即可。
			while (tmp-- > 0) {
				// IE 中，String.prototype.match() 未成功時會回傳 ''，
				// 而 !isNaN('')===true，因此無法正確判別。
				if (!isNaN(date_data[tmp]) && date_data[tmp] !== '') {
					date_data[tmp]++;
					break;
				}
			}
			year = date_data[0];
		}

		if (!(0 < (date_data[2] = +date_data[2]))) {
			date_data[2] = 1;
		}
		if (typeof options.post_process === 'function') {
			options.post_process(date_data);
		}

		year = +year || 0;
		// time zone.
		tmp = +date_data[4] || 0;
		var base_on_UTC = !isNaN(minute_offset)
				&& minute_offset !== DEFAULT_TIME_ZONE;
		// 若是未設定，則當作 local time zone。
		if (base_on_UTC) {
			// 否則基於本機當前的時區來調整成基於 UTC 之 `minute_offset`
			// local time + .getTimezoneOffset() = UTC
			tmp -= present_local_minute_offset + minute_offset;
		}

		if (year < 100 && year >= 0) {
			// 僅使用 new Date(0) 的話，會含入 timezone offset (.getTimezoneOffset)。
			// 因此得使用 new Date(0, 0)。
			date_value = new Date(0, 0);
			// 先設定小單位，再設定大單位：設定小單位時會影響到大單位。反之不然。
			// 下兩者得到的值不同。
			// (d=new Date(0, 0)).setFullYear(0, 0, -1, 0, 480, 0, 0);
			// d.toISOString()
			//
			// (d=new Date(0, 0)).setHours(0, 480, 0, 0);
			// d.setFullYear(0, 0, -1);d.toISOString()
			date_value.setHours(+date_data[3] || 0, tmp, +date_data[5] || 0,
					+date_data[6] || 0);
			date_value.setFullYear(
			// new Date(10, ..) === new Date(1910, ..)
			year, date_data[1] ? date_data[1] - 1 : 0, date_data[2]);
		} else {
			date_value = new Date(year, date_data[1] ? date_data[1] - 1 : 0,
					date_data[2], +date_data[3] || 0, tmp, +date_data[5] || 0,
					+date_data[6] || 0);
		}
		if (base_on_UTC
				&& date_value.getTimezoneOffset() !== present_local_minute_offset) {
			/**
			 * 當基於本機當前的時區來調整成UTC時間時，若是 time zone 和預設的
			 * `present_local_minute_offset` 不同，就必須在以 new Date() 設定時間後，才調整 time
			 * zone。
			 */
			date_value.setMinutes(date_value.getMinutes()
					+ present_local_minute_offset
					- date_value.getTimezoneOffset());
		}

		// 測試僅輸入時刻的情況。e.g., '7時'
		if (options.near && date_value.getFullYear() === 0
				&& date_value - time_boundary > 0) {
			// 判別未輸入時預設年份設對了沒：以最接近 options.near 的為基準。
			tmp = is_Date(options.near) ? options.near : new Date;
			date_string = tmp.getFullYear();
			matched = new Date(date_value.getTime());
			date_value.setFullYear(date_string);
			matched.setFullYear(date_value - tmp > 0 ? date_string - 1
					: date_string + 1);
			if (date_value - tmp > 0 && date_value - tmp > tmp - matched
					|| date_value - tmp < 0 && date_value - tmp < tmp - matched) {
				date_value = matched;
			}
		}

		if (precision) {
			date_value.precision = precision;
		}
		return date_value;
	}

	// 0–99 的年份會加上此年份 (1900)。
	String_to_Date_default_parser.year_padding = (new Date(0, 0, 1))
			.getFullYear();
	String_to_Date.default_parser = String_to_Date_default_parser;

	// date_string.match(String_to_Date.parser_PATTERN)
	// === [, parser name, date string ]
	// e.g., "Âm lịch"
	String_to_Date.parser_PATTERN = /^\s*(?:([^:]+):)?\s*(.+)/i;

	String_to_Date.parser = {

		Julian : Julian_String_to_Date,
		// Common Era / Before the Common Era, CE / BCE. 公元/西元.
		CE : function(date_string, minute_offset, options) {
			if (!library_namespace.is_Object(options)) {
				options = Object.create(null);
			}
			if (!('no_year_0' in options)) {
				options.no_year_0 = true;
			}
			var date_value = String_to_Date_default_parser(date_string,
					minute_offset, options);
			return date_value - Gregorian_reform_of(options.reform) < 0
			//
			? Julian_String_to_Date(date_string, minute_offset, options)
					: date_value;
		},

		// <a href="http://php.net/manual/en/function.date.php"
		// accessdate="2012/3/23 20:51">PHP: date - Manual</a>
		PHP : function() {
			// TODO
			throw new Error('String_to_Date.parser.PHP: Not Yet Implemented!');
		},
		// <a href="http://www.freebsd.org/cgi/man.cgi?query=strftime"
		// accessdate="2012/3/23 20:59">strftime</a>,
		// <a href="http://hacks.bluesmoon.info/strftime/" accessdate="2012/3/23
		// 21:9">strftime: strftime for Javascript</a>
		strftime : function() {
			// TODO
			throw new Error(
					'String_to_Date.parser.strftime: Not Yet Implemented!');
		}
	};

	// 時區縮寫。
	// <a href="http://en.wikipedia.org/wiki/List_of_time_zone_abbreviations"
	// accessdate="2012/12/2 13:0" title="List of time zone abbreviations">time
	// zone abbreviations</a> and offset in hour.
	// TODO: Daylight Saving Time (DST).
	// @see CeL.application.locale.time_zone_of_language()
	String_to_Date.zone = {
		// UTC+08:00
		// China Standard Time
		CST : 8,
		Z中國 : 8,

		JST : 9,
		Z日本 : 9,

		EST : -5,
		PST : -8,

		// Greenwich Mean Time
		GMT : 0,
		// Coordinated Universal Time
		UTC : 0
	};

	_// JSDT:_module_
	.String_to_Date = String_to_Date;

	// ---------------------------------------------------------

	/**
	 * test if the year is leap year. has year 0!<br />
	 * 
	 * @param {Integer}year
	 * @param type
	 *            calendar type: true: use Julian calendar, false: use Gregorian
	 *            calendar, 'CE': use CE
	 * 
	 * @returns {Boolean}
	 */
	function is_leap_year(year, type) {
		if (type === 'CE') {
			if (reform_year < year) {
				type = false;
			} else if (year < 0) {
				year++;
			}
		}
		// Julian calendar
		return type ? year % 4 === 0
		// Gregorian calendar
		: year % 400 === 0 || year % 100 !== 0 && year % 4 === 0;
	}
	_.is_leap_year = is_leap_year;

	/**
	 * test if in the year, Gregorian calendar and Julian calendar have
	 * different intercalation.
	 * 
	 * @param {Integer}year
	 * @returns {Boolean} 當年 Julian 與 UTC 為不同閏年規定: Gregorian 當年沒有閏日，但 Julian 有。
	 */
	function is_different_leap_year(year) {
		return year % 100 === 0 && year % 400 !== 0;
	}
	_.is_different_leap_year = is_different_leap_year;

	/**
	 * 計算 Gregorian 與 Julian 的日數差距。 the secular difference between the two
	 * calendars.<br />
	 * 會將 date_data: Julian → Gregorian.
	 * 
	 * @param {Array}date_data
	 *            Julian date [year, month, date]
	 * 
	 * @returns {Number} Julian → Gregorian 時，需要減去的日數。（除少數特例外，即 Gregorian →
	 *          Julian 時，需要加上的日數。）
	 * 
	 * @see https://en.wikipedia.org/wiki/Gregorian_calendar#Difference_between_Gregorian_and_Julian_calendar_dates
	 */
	function Julian_shift_days(date_data) {
		var year = +date_data[0];
		// 測試是否為有差異的當年
		if (is_different_leap_year(year)
		// 測試是否為閏日。
		// 閏日前(before Julian calendar leap day)還要算是上一階段。
		&& date_data[1] < 3) {
			year--;
		}
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
	 * parse proleptic Julian calendar date_string and return the new Date.<br />
	 * 
	 * 借用系統內建的計時機制。其他 arguments 見 String_to_Date_default_parser()。
	 * 
	 * @param {String}date_string
	 *            Julian calendar date string.
	 * 
	 * @returns {Date} new Date
	 * 
	 * @see http://en.wikipedia.org/wiki/Old_Style_and_New_Style_dates
	 * @see http://eclipse.gsfc.nasa.gov/SEhelp/julian.html
	 */
	function Julian_String_to_Date(date_string, minute_offset, options) {
		if (!library_namespace.is_Object(options)) {
			options = Object.create(null);
		}

		options.post_process = Julian_shift_days;

		return String_to_Date_default_parser(date_string, minute_offset,
				options);
	}

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

	function parse_English_date(date) {
		date = date.trim().replace(/.+\[(?:\d{1,2}|note \d+)\]$/i, '');
		var accuracy = date.match(/^(?:before|after)[\s ](.+)$/i), matched;
		if (accuracy) {
			date = accuracy[1].trim();
			accuracy = accuracy[0];
		}
		if (accuracy = date.match(/^ca?.(.+)$/)) {
			date = accuracy[1].trim();
			accuracy = accuracy[0];
		}
		if (/^[a-z]{3,9}\s+-?\d+$/i.test(date)) {
			date = '1 ' + date;
			accuracy = date;
		}

		if (date.includes('?')) {
			accuracy = date;
			date = date.replace(/\?/g, '');
		}

		if (!isNaN(date) || /^\d+\/\d+$/.test(date)) {
			accuracy = date;
		} else if (!isNaN(matched = Date.parse(date))) {
			date = new Date(matched + String_to_Date.default_offset
					* ONE_MINUTE_LENGTH_VALUE).toISOString()
			//
			.match(/^\d+-\d+-\d+/)[0].replace(/^0+/, '').replace(/(\d)-0*/g,
					'$1\/');
		} else {
			library_namespace.warn(date);
			return;
		}
		return [ date, accuracy ];
	}

	_.parse_English_date = parse_English_date;

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

	/**
	 * 顯示格式化日期時間 string：依照指定格式輸出日期與時間。<br />
	 * TODO:<br />
	 * 各 locale 有不同 format 與 time zone offset.
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
	 *      <a href="http://blog.csdn.net/xzknet/article/details/2278101"
	 *      accessdate="2012/3/24 15:11" title="如何使用Javascript格式化日期显示 -
	 *      虫二的专栏~~在路上~~~ - 博客频道 - CSDN.NET">JsJava中提供了專用的類，專門對日期進行指定格式的字符串輸出</a>,<br />
	 *      <a href="http://www.merlyn.demon.co.uk/js-date8.htm"
	 *      accessdate="2012/3/25 1:42">Merlyn - JSDT 8 : Enhancing the Object -
	 *      J R Stockton</a>,<br />
	 *      U.S. Naval Observatory <a
	 *      href="http://aa.usno.navy.mil/data/docs/JulianDate.php"
	 *      accessdate="2012/3/25 1:42">Julian Date Converter</a><br />
	 *      ISO 8601:2004(E)
	 * 
	 * @_memberOf _module_
	 */
	function Date_to_String(date_value, options) {
		// 前置處理。
		if (typeof options === 'string') {
			options = options in Date_to_String.parser ? {
				parser : Date_to_String.parser[options]
			} : {
				format : options
			};
		} else if (typeof options === 'function') {
			options = {
				parser : options
			};
		} else if (!library_namespace.is_Object(options)) {
			options = Object.create(null);
		}

		if (false) {
			if (options.parser
					&& !library_namespace.is_Function(options.parser)
					&& !library_namespace
							.is_Function(String_to_Date.parser[options.parser])) {
				library_namespace.warn('Date_to_String: 無法判斷 parser ['
						+ options.parser + ']！');
			}
		}

		// if (!date_value) date_value = new Date;

		if (date_value && !is_Date(date_value)
		// String_to_Date() 會幫忙做正規化。
		? String_to_Date(date_value) : date_value) {
			return (library_namespace.is_Function(options.parser) ? options.parser
					: Date_to_String.parser[options.parser]
							|| Date_to_String.default_parser)(date_value,
					options.format, library_namespace.gettext.to_standard
					//
					? library_namespace.gettext.to_standard(options.locale)
							: options.locale, options);
		}

		library_namespace.warn('Date_to_String: 無法判斷 date value [' + date_value
				+ ']！');
	}

	// default parser.
	Date_to_String.default_parser = strftime;

	Date_to_String.parser = {

		// <a href="http://php.net/manual/en/function.date.php"
		// accessdate="2012/3/23 20:51">PHP: date - Manual</a>
		PHP : function(date_value, format, locale) {
			// TODO
			throw new Error('Date_to_String.parser.PHP: Not Yet Implemented!');
		},
		// ISO 8601:2004(E)
		ISO8601 : function(date_value, format, locale) {
			// TODO
			throw new Error(
					'Date_to_String.parser.ISO8601: Not Yet Implemented!');
		},
		// .NET standard format string (standard date and time format string) <a
		// href="http://msdn.microsoft.com/zh-tw/library/az4se3k1.aspx"
		// accessdate="2012/3/24 17:43">標準日期和時間格式字串</a>
		SFS : function(date_value, format, locale) {
			// TODO
			throw new Error('Date_to_String.parser.SFS: Not Yet Implemented!');
		},
		// <a href="http://www.freebsd.org/cgi/man.cgi?query=strftime"
		// accessdate="2012/3/23 20:59">strftime</a>,
		// <a href="http://hacks.bluesmoon.info/strftime/" accessdate="2012/3/23
		// 21:9">strftime: strftime for Javascript</a>
		strftime : strftime,

		Gregorian : Date_to_Gregorian,
		Julian : Date_to_Julian,
		// Common Era / Before the Common Era, CE / BCE.
		CE : function(date_value, format, locale, options) {
			// 前置處理。
			if (!library_namespace.is_Object(options)) {
				options = Object.create(null);
			}
			if (!('no_year_0' in options)) {
				options.no_year_0 = true;
			}

			return (date_value - Gregorian_reform_of(options.reform) < 0
			//
			? Date_to_Julian : Date_to_Gregorian)(date_value, format, locale,
					options);
		},

		// Turn to RFC 822 date-time
		// <a
		// href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date/toUTCString"
		// accessdate="2012/3/24 8:5" title="toUTCString - MDN">The most common
		// return value is a RFC-1123 formatted date stamp, which is a slightly
		// updated version of RFC-822 date stamps.</a>
		// Date_to_RFC822[generateCode.dLK]='String_to_Date';
		RFC822 : function(date_value) {
			// e.g., "Wed, 14 Jun 2017 07:00:00 GMT"
			return date_value.toUTCString().replace(/UTC/gi, 'GMT');
		}
	};

	_// JSDT:_module_
	.Date_to_String = Date_to_String;

	// ---------------------------------------------------------

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
	 *      <a href="http://www.freebsd.org/cgi/man.cgi?query=strftime"
	 *      accessdate="2012/3/23 20:59">strftime</a>,<br />
	 *      <a href="http://hacks.bluesmoon.info/strftime/"
	 *      accessdate="2012/3/23 21:9">strftime: strftime for Javascript</a>,
	 */
	function strftime(date_value, format, locale, options) {
		// 前置處理。
		if (!library_namespace.is_Object(options)) {
			options = Object.create(null);
		}

		var original_Date = options.original_Date || date_value,
		/**
		 * 支援的 conversion specifications (轉換規格).
		 */
		conversion = strftime.conversion[locale]
				|| strftime.conversion[strftime.null_domain],
		/**
		 * 所須搜尋的 conversion specifications (轉換規格) pattern.<br />
		 * .search_pattern
		 */
		search = strftime.search[locale]
				|| strftime.search[strftime.null_domain];

		// 也可以使用 options.zone 設定要轉換成的時區(timezone)。
		if (isNaN(options.offset) && !isNaN(options.zone)) {
			options.offset = options.zone * 60;
		}
		// console.log(options);
		// library_namespace.debug('options.offset = ' + options.offset, 0);

		// to this minute offset. UTC+8: 8 * 60 = +480
		// or using options.minute_offset?
		if (!isNaN(options.offset)) {
			date_value = new Date(date_value.getTime()
					+ ONE_MINUTE_LENGTH_VALUE
					* (options.offset - String_to_Date.default_offset));
		}

		function convertor(s) {
			return s.replace(search, function(all, pad_count, use_conversion) {
				// 可以在 conversion 中，用
				// this[conversion name].apply(this, arguments)
				// 來取得另一 conversion 之結果。
				var v = use_conversion in original_Date
				//
				? original_Date[use_conversion]
				// original_Date[use_conversion] 為物件本身之特殊屬性，應當排在泛用函數
				// conversion[use_conversion] 之前。
				: typeof (v = conversion[use_conversion])
				//
				=== 'function' ? conversion[use_conversion]
						(date_value, options)
				//
				: v in original_Date ? original_Date[v]
				// 將之當作 format。
				: /%/.test(v) ? parse_escape(v, convertor)
				//
				: v;
				// library_namespace.debug([v, pad_count, use_conversion]);
				return pad_count ? pad(v, pad_count) : v;
			});
		}

		return parse_escape(format || strftime.default_format, convertor);
	}

	// .toISOString(): '%4Y-%2m-%2dT%2H:%2M:%2S.%fZ'
	strftime.default_format = '%Y/%m/%d %H:%M:%S.%f';

	strftime.get_conversion = function get_conversion(locale, options) {
		var locale_conversion;
		if (!(locale in (locale_conversion = strftime.conversion))) {
			return;
		}

		locale_conversion = locale_conversion[locale];
		return locale_conversion;
	};

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
	strftime.set_conversion = function set_conversion(conversion, locale,
			options) {
		var i, v, locale_conversion, gettext = library_namespace.gettext,
		// escape special char.
		escape_string = function(s) {
			return s.replace(/[*?!+.()\[\]\|\-^$\\\/]/g, '\\$0');
		},
		/**
		 * 所須搜尋的 conversion specifications (轉換規格) pattern.
		 */
		search;

		if (!strftime.search) {
			library_namespace.debug('初始化 strftime', 2,
					'strftime.set_conversion');
			strftime.search = Object.create(null);
			strftime.conversion = Object.create(null);
		}

		// 前置處理。
		if (!library_namespace.is_Object(options)) {
			options = Object.create(null);
		}

		if (locale && gettext.to_standard && !options.no_gettext) {
			locale = gettext.to_standard(locale);
		}
		if (!locale) {
			locale = strftime.null_domain;
		}

		if (!(locale in (locale_conversion = strftime.conversion))) {
			locale_conversion[locale] = Object.create(null);
		}
		locale_conversion = locale_conversion[locale];
		for (i in conversion) {
			// 不變更引數 conversion，且允許重複添增。
			locale_conversion[i] = v = conversion[i];
			if (v in locale_conversion) {
				search = [ v ];
				while (v in locale_conversion) {
					// 處理 alias。
					locale_conversion[i] = v = locale_conversion[v];
					if (search.includes(v)) {
						// 預防迴圈。
						break;
					}
					search.push(v);
				}
			}
		}

		v = '';
		search = [];
		// 造出 search pattern。
		for (i in locale_conversion) {
			if ((i = escape_string(i)).length > 1) {
				search.push(i);
			} else {
				v += i;
			}
		}
		// 從長的排到短的。
		search.sort(function(a, b) {
			// 長→短
			return b.length - a.length;
		});
		if (v) {
			search.push('[' + v + ']');
		}
		strftime.search[locale] = search = new RegExp('%(\\d?)('
				+ search.join('|') + ')', 'g');
		library_namespace.debug('use conversion specifications ' + locale
				+ ': ' + search, 2, 'strftime.set_conversion');

		return search;
	};

	strftime.null_domain = '';

	var gettext_date = library_namespace.gettext.date;
	if (!gettext_date) {
		gettext_date = function(v) {
			if (library_namespace.locale.gettext) {
				gettext_date = library_namespace.locale.gettext.date;
				return gettext_date[this].apply(gettext_date, arguments);
			}
			return v;
		};
		'year,month,date,week,full_week'.split(',').forEach(function(type) {
			gettext_date[type] = gettext_date.bind(type);
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
		&& (typeof is_leap === 'number' ? is_leap_year(is_leap) : is_leap)) {
			year_data[1 - month]++;
		}

		// 處理首月的曆數。
		if (date > 1) {
			year_data[0] -= date - 1;
		}

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
		if (is_Date(month)) {
			date = month.getDate() | 0, is_leap = is_leap_year(month
					.getFullYear()), month = month.getMonth() | 0;
		} else {
			--month;
			if (typeof is_leap === 'number') {
				// treat as year.
				is_leap = is_leap_year(is_leap);
			}
		}
		if (is_leap && month > 1) {
			date++;
		}
		return accumulated_days[month] + date | 0;
	}
	_.ordinal_date = ordinal_date;

	// week date, 週日期, 表示年內的星期數天數，再加上星期內第幾天。
	// https://en.wikipedia.org/wiki/ISO_week_date
	// return [ year, week (1-52 or 53), weekday (1-7) ]
	// var w = week_date(new Date);
	// w[0].pad(4) + '-W' + w[1].pad(2) + '-' + w[2]
	function week_date(date, to_ISO) {
		var year = date.getFullYear() | 0, weekday = date.getDay() | 0, days = ordinal_date(date) | 0, week;
		if (weekday === 0) {
			weekday = 7;
		}
		week = (10 + days - weekday) / 7 | 0;
		if (week === 0) {
			week = 53;
			year--;
		}
		// 計算首日是否為 星期四 或 (星期三 + leap)；
		// 此為有 W53 之條件。
		else if (week > 52 && (days = (weekday + 1 - days).mod(7)) !== 4
				&& (days !== 3 || !is_leap_year(year))) {
			week = 1;
			year++;
		}

		if (to_ISO) {
			// TODO: 在IS0 8601中星期以星期一開始
			// 一年的首星期必須包含1月4日, 包含一年的首個星期四
			year = year.pad(4);
			week = 'W' + week.pad(2);
		}
		days = [ year, week, weekday ];
		if (to_ISO === 1) {
			days = days.join('');
		} else if (to_ISO !== 2) {
			days = days.join('-');
		}

		return days;
	}
	_.week_date = week_date;

	// <a href="http://www.cppreference.com/wiki/cn/chrono/c/strftime"
	// accessdate="2012/3/24 15:23">strftime [C++ Reference]</a>
	// <a
	// href="http://help.adobe.com/zh_TW/as2/reference/flashlite/WS5b3ccc516d4fbf351e63e3d118cd9b5f6e-7923.html"
	// accessdate="2012/3/24 15:29">Adobe Flash Platform * Date</a>
	// <a href="http://msdn.microsoft.com/zh-tw/library/dca21baa.aspx"
	// accessdate="2012/3/24 15:30">Date 物件</a>
	// 除非必要，這邊不應用上 options.original_Date。
	strftime.default_conversion = {
		// ----------------------------
		// date

		// 完整年份(非兩位數的數字，近十年應為四位數的數字，如2013) 以4位十進制數寫年份。
		Y : function(date_value, options) {
			return date_value.getFullYear();
		},
		// 以替用方式寫年。例如在 ja_JP 本地環境中，以「平成23年」取代「2011年」。
		EY : function(date_value, options) {
			return gettext_date.year(
			// (options && options.original_Date || date_value)
			date_value.getFullYear(), options.numeral || options.locale);
		},

		// 月分 (1-12)。 將月份寫作十進制數（範圍[01,12]）。
		// also: %B, %b
		m : function(date_value, options) {
			return 1 + date_value.getMonth();
		},
		// 寫完整月名，例如 October。
		B : function full_month_name(date_value, options) {
			// console.trace(options);
			return gettext_date.month(1 +
			// (options && options.original_Date || date_value)
			date_value.getMonth(), options.locale);
		},
		// 寫縮略月名，例如 Oct （本地環境依賴）。
		b : function(date_value, options) {
			var month_name = strftime.default_conversion.B.apply(this,
					arguments);
			if (/^en/.test(options.locale))
				month_name = month_name.slice(0, 3);
			return month_name;
		},

		// 月中的第幾天 (1-31) 以十進制數寫月的第幾日（範圍[01,31]）。
		d : function(date_value, options) {
			return date_value.getDate();
		},
		// 以替用數字系統寫零基的月的第幾日。例如 ja_JP 本地環境中「二十七」取代「 27 」。
		Od : function(date_value, options) {
			return gettext_date.date(
			// (options && options.original_Date || date_value)
			date_value.getDate(), options.locale);
		},

		// ----------------------------
		// week

		// 2017/8/16 增加在地化的星期名稱表示法。之前曾經用過"%w"這個方式的，都需要改成"%A"。
		// 寫縮略的星期日期名，例如Fri（本地環境依賴）。
		a : function(date_value, options) {
			return gettext_date.week(
			// (options && options.original_Date || date_value)
			date_value.getDay(), options.locale);
		},
		// 寫完整的星期日期名，例如Friday（本地環境依賴）。
		A : function(date_value, options) {
			return gettext_date.full_week(
			// (options && options.original_Date || date_value)
			date_value.getDay(), options.locale);
		},
		// 星期 (0-6) 以十進制數寫星期日期，其中星期日是0（範圍[0-6]）。
		w : function(date_value, options) {
			return date_value.getDay();
		},

		// ----------------------------
		// time

		// 小時數 (0-23) 以十進制數寫時，24小時制（範圍[00-23]）。
		H : function(date_value, options) {
			return date_value.getHours();
		},
		// 分鐘數 (0-59) 以十進制數寫分（範圍[00,59]）。
		M : function(date_value, options) {
			return date_value.getMinutes();
		},
		// 秒數 (0-59) 以十進制數寫秒（範圍[00,59]）。
		S : function(date_value, options) {
			return date_value.getSeconds();
		},
		/**
		 * 毫秒(milliseconds) (000-999)
		 * 
		 * @see %f: zero-padded millisecond / microsecond: <a
		 *      href="http://bugs.python.org/issue1982" accessdate="2012/3/24
		 *      12:44">Issue 1982: Feature: extend strftime to accept
		 *      milliseconds - Python tracker</a>
		 */
		f : function(date_value, options) {
			var ms = date_value.getMilliseconds();
			return ms > 99 ? ms : ms > 9 ? '0' + ms : ms >= 0 ? '00' + ms : ms;
		},

		// 以 ISO 8601 格式（例如 -0430 ）寫距 UTC 的偏移
		z : function(date_value, options) {
			var offset = '+', minutes = -date_value.getTimezoneOffset();
			if (minutes < 0) {
				offset = '-';
				minutes = -minutes;
			}
			var hours = minutes / 60 | 0;
			offset += hours.pad(2) + (minutes % 60).pad(2);
			return offset;
		},

		// ----------------------------
		// misc

		// 年日數 以十進制數寫年的第幾日（範圍[001,366]）。
		// (new Date).format('%4Y-%3o')
		j : function(date_value, options) {
			return ordinal_date(date_value);
		},
		// 週數 以十進制數寫年的第幾個星期（星期一是星期的首日）（範圍[00,53]）。
		W : function(date_value, options) {
			return week_date(date_value)[1];
		},

		// 有相同開頭的時候，長的要放前面！
		// (new Date).format('%JDN')
		JDN : Date_to_JDN,
		// (new Date).format('%JD')
		JD : Date_to_JD,

		// gettext_config:{"id":"year-of-the-sexagenary-cycle"}
		"歲次" : guess_year_stem_branch,
		// alias
		// gettext_config:{"id":"year-of-the-sexagenary-cycle"}
		年干支 : '歲次',
		// gettext_config:{"id":"year-of-the-sexagenary-cycle"}
		年柱 : '歲次',

		日干支序 : date_stem_branch_index,
		// 計算距離甲子共有幾日，再於 index_to_stem_branch() 取模數。
		// 假定為不間斷之循環紀日。
		// gettext_config:{"id":"day-of-the-sexagenary-cycle"}
		"日干支" : function(date_value, options) {
			return index_to_stem_branch(date_stem_branch_index(date_value,
					options));
		},
		// gettext_config:{"id":"day-of-the-sexagenary-cycle"}
		日柱 : '日干支',

		// 時辰干支: 計算距離甲子共有幾個時辰，再於 index_to_stem_branch() 取模數。
		// 時干支不受子初分日(子初換日/子正換日)影響。
		時干支序 : hour_stem_branch_index,
		時干支 : function(date_value, options) {
			return index_to_stem_branch(hour_stem_branch_index(date_value,
					options));
		},
		時柱 : '時干支',
		// 每刻15分。
		// e.g., 子正初刻
		// 隋後普遍行百刻制，每天100刻。至順治二年（公元1645年）頒行時憲曆後，改為日96刻，每時辰八刻（初初刻、初一刻、初二刻、初三刻、正初刻、正一刻、正二刻、正三刻）[7,13,14]。自此每刻15分，無「四刻」之名。
		時刻 : function(date_value, options) {
			var diff = Math.floor(hour_stem_branch_index(date_value, options))
			// 12: BRANCH_LIST.length
			.mod(12);
			return BRANCH_LIST.charAt(diff) + (diff % 2 ? '正' : '初')
					+ '初一二三'.charAt(date_value.getMinutes() / 4 | 0) + '刻';
		}
	};

	strftime.set_conversion(strftime.default_conversion, strftime.null_domain);

	function Date_to_Gregorian(date_value, format, locale, options) {

		if ('no_year_0' in options ? options.no_year_0
				: Date_to_String.no_year_0) {
			var Year = date_value.getYear(), FullYear = date_value
					.getFullYear(), UTCFullYear = date_value.getUTCFullYear();

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
				// calendar used in the international standard ISO 8601, the
				// traditional
				// proleptic Gregorian calendar (like the Julian calendar) does
				// not
				// have a year 0 and instead uses the ordinal numbers 1, 2, …
				// both for
				// years AD and BC.

				// 前置處理。
				if (!library_namespace.is_Object(options)) {
					options = Object.create(null);
				}

				if (!options.no_new_Date) {
					// IE 需要 .getTime()：IE8 以 new Date(Date
					// object) 會得到 NaN！
					date_value = new Date(date_value.getTime());
				}

				if (FullYear < 1) {
					date_value.getYear = new Function('return ' + (Year - 1));
					date_value.getFullYear = new Function('return '
							+ (FullYear - 1));
				}
				if (UTCFullYear < 1) {
					date_value.getUTCFullYear = FullYear === UTCFullYear ?
					// 一般情況 (FullYear === UTCFullYear)。
					// else: 預防 1/1, 12/31 時，getYear()
					// 與 getUTCFullYear() 可能會有不同值。
					// 盡量少帶入變數。
					date_value.getFullYear : new Function('return '
							+ (UTCFullYear - 1));
				}
			}
		}

		return strftime(date_value, format, locale, options);
	}

	// 代替 getDate() 用。
	var leap_date = new Function('return 29');

	/**
	 * proleptic Julian calendar.<br />
	 * 
	 * TODO: 太沒效率。
	 * 
	 * 以系統內建的計時機制，<br />
	 * 將擴展/外推/延伸的格里曆, proleptic Gregorian calendar<br /> → proleptic Julian
	 * calendar for 4713 BCE－2200 CE.
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
		// 計算 Gregorian 與 Julian 的 different days。
		// 0年時，差了 2日。這演算法對差異大至 31+28 日的時段不適用。
		shift_days = 2 + Math.floor(year / 400) - Math.floor(year / 100),
		// 當年 Julian 與 UTC 為不同閏年規定: Gregorian 當年沒有閏日，但 Julian 有。
		is_leap_year = is_different_leap_year(year);

		if (shift_days || is_leap_year) {
			var week_day = date_value.getDay();

			// 前置處理。
			if (!library_namespace.is_Object(options)) {
				options = Object.create(null);
			}
			// 因為可能會更改 date_value，因此把本來的 date_value 放在 options
			// 中供有需要的取用。
			if (!options.original_Date) {
				options.original_Date = date_value;
			}
			// 不改變原先的 date_value。
			options.no_new_Date = true;
			// 以新的 UTC Date instance 模擬 Julian calendar。
			// IE 需要 .getTime()：IE8 以 new Date(Date object) 會得到 NaN！
			date_value = new Date(date_value.getTime());
			date_value.setDate(date_value.getDate() + shift_days);

			if (is_leap_year && date_value.getFullYear() <= year) {
				// 原 → 現 → 應
				// ... → 2/27 → 2/28
				// ... → 2/28 → 2/29
				// ... → 3/1 → 3/1
				var month = date_value.getMonth();
				// 分水嶺: 以 Julian date 3/1 0:0 為分界。
				// 在不同閏年當年，Julian date 3/1 前需要特別處理。
				if (month < 2 || date_value.getFullYear() < year) {
					// 因為加至當年沒有閏日的 Gregorian，2/29 會變成 3/1。
					if (month === 1 && date_value.getDate() === 28) {
						// is leap day
						// 便宜行事: 不設 delta，直接把 3/1 → 2/28，再強制使 .getDate() = 29。
						// TODO: .getDay() 恐有誤。
						// 當 Julian date 2/29 閏日當日，UTC 非閏日的時候，需要特別處理。
						// TODO: 處理其他。
						date_value.getDate = leap_date;
					} else {
						// Julian date 2/29 閏日前。少算的，須更正。
						// 閏日前(before Julian calendar leap day)還要算是上一階段。
						date_value.setDate(date_value.getDate() + 1);
					}
				}
			}

			// 處理 day of the week: 就算以另一個日期模擬 UTC，原先的星期不會改變。
			if (date_value.getDay() !== week_day) {
				date_value.getDay = new Function('return ' + week_day);
			}
			// TODO: .getUTCDay()
		}

		date_value = Date_to_Gregorian(date_value, format, locale, options);
		if (library_namespace.is_Object(options)) {
			// 預防此 options 為重複使用。
			delete options.original_Date;
		}
		return date_value;
	}

	/**
	 * <code>


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

	</code>
	 */

	// 設定 .as_UTC_time 當作 UTC 時，將加上為本地時間調整所需之 offset。
	var Julian_Date_local_offset = String_to_Date.default_offset / 60 / 24;

	// Julian Date (JD)
	// <a href="http://aa.usno.navy.mil/data/docs/JulianDate.php"
	// accessdate="2013/2/11 9:10">Julian Date Converter</a>
	function Date_to_JD(date_value, options) {
		date_value = ((options && options.original_Date || date_value) - Julian_Date_epoch)
				/ ONE_DAY_LENGTH_VALUE;
		if (options && options.as_UTC_time) {
			date_value += Julian_Date_local_offset;
		}
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
		// 注意：此輸出常顯示為系統之 proleptic Gregorian calendar，
		// 而一般天文計算使用 proleptic Julian calendar！
		return new Date(Julian_Date_epoch + ONE_DAY_LENGTH_VALUE * JD);
	}

	_.Date_to_JD = Date_to_JD;
	_.Date_to_JDN = Date_to_JDN;
	_.JD_to_Date = JD_to_Date;

	// ---------------------------------------------------------------------------//
	// basic constants. 定義基本常數。

	// for Julian Date (JD), Julian Day Number (JDN).
	// Julian Date: 由公元前4713年1月1日，協調世界時中午12時開始所經過的天數。
	// 原點實際設在 -004713-11-24T12:00:00.000Z。
	// http://www.tondering.dk/claus/cal/julperiod.php
	// http://aa.usno.navy.mil/data/docs/JulianDate.php
	var Julian_Date_epoch = Date.parse('-004713-11-24T12:00:00.000Z');
	if (!Julian_Date_epoch) {
		// 替代方法. 慢.
		Julian_Date_epoch = String_to_Date('-4713/1/1 12:0', {
			parser : 'Julian',
			zone : 0
		});
		Julian_Date_epoch = Julian_Date_epoch.getTime()
				+ (present_local_minute_offset - (Julian_Date_epoch
						.getTimezoneOffset() || 0)) * ONE_MINUTE_LENGTH_VALUE;
	}

	// 預設的 Gregorian calendar 改曆日期:
	// Julian calendar → Gregorian calendar.
	//
	// 這天開始使用 Gregorian calendar。之前使用 Julian calendar。
	// e.g., UTC/Gregorian 1582/10/14 ⇔ Julian 1582/10/4.
	//
	// 西曆改曆分界點。這天之後採用 Gregorian calendar 表示。
	// 西曆以1582年10月15日為改曆分界點，Julian calendar（儒略曆）1582年10月4日的下一日為 Gregorian
	// calendar（格里高利曆）1582年10月15日。
	var reform_year = 1582;
	_.Gregorian_reform_date = new Date(reform_year, 10 - 1, 15);

	// gcal-3.6/doc/GREG-REFORM
	// http://www.tondering.dk/claus/cal/gregorian.php
	// http://www.webexhibits.org/calendars/year-countries.html
	// http://sizes.com/time/cal_Gregadoption.htm
	/*
	 * https://en.wikipedia.org/wiki/List_of_adoption_dates_of_the_Gregorian_calendar_per_country
	 * 
	 * 使用公共轉換組「外國地名翻譯」
	 * https://zh.wikipedia.org/wiki/%E6%A8%A1%E5%9D%97:CGroup/%E5%9C%B0%E5%90%8D
	 */
	var reform_by_region = {
		// gettext_config:{"id":"italy"}
		'Italy' : '1582/10/15',
		// gettext_config:{"id":"poland"}
		'Poland' : '1582/10/15',
		// gettext_config:{"id":"portugal"}
		'Portugal' : '1582/10/15',
		// gettext_config:{"id":"spain"}
		'Spain' : '1582/10/15',
		// gettext_config:{"id":"france"}
		'France' : '1582/12/20',
		// 盧森堡 Source?
		// gettext_config:{"id":"luxembourg"}
		'Luxembourg' : '1583/1/1',
		// Holland: 1583/1/12
		// gettext_config:{"id":"netherlands"}
		'Netherlands' : '1583/1/12',
		// Source?
		// gettext_config:{"id":"bavaria"}
		'Bavaria' : '1583/10/16',
		// gettext_config:{"id":"austria"}
		'Austria' : '1584/1/17',
		// gettext_config:{"id":"switzerland"}
		'Switzerland' : '1584/1/22',
		// gettext_config:{"id":"hungary"}
		'Hungary' : '1587/11/1',
		// gettext_config:{"id":"germany"}
		'Germany' : '1700/3/1',
		// gettext_config:{"id":"norway"}
		'Norway' : '1700/3/1',
		// gettext_config:{"id":"denmark"}
		'Denmark' : '1700/3/1',
		// Kingdom of Great Britain, 大不列顛王國, グレートブリテン王国, 英國
		// https://en.wikipedia.org/wiki/Calendar_%28New_Style%29_Act_1750
		// gettext_config:{"id":"great-britain"}
		'Great Britain' : '1752/9/14',
		// gettext_config:{"id":"sweden"}
		'Sweden' : '1753/3/1',
		// gettext_config:{"id":"finland"}
		'Finland' : '1753/3/1',
		// 日本
		// 'Japan' : '1873/1/1',
		// 中國
		// 'China' : '1911/11/20',
		// gettext_config:{"id":"bulgaria"}
		'Bulgaria' : '1916/4/14',
		// USSR, U.S.S.R., 蘇聯
		// gettext_config:{"id":"soviet-union"}
		'Soviet Union' : '1918/2/14',
		// gettext_config:{"id":"serbia"}
		'Serbia' : '1919/2/1',
		// gettext_config:{"id":"romania"}
		'Romania' : '1919/2/1',
		// gettext_config:{"id":"greece"}
		'Greece' : '1924/3/23',
		// gettext_config:{"id":"turkey"}
		'Türkiye' : '1926/1/1',
		// gettext_config:{"id":"egypt"}
		'Egypt' : '1928/10/1'
	// 之前使用伊斯蘭曆法。
	// 'Saudi Arabia':'2016/10/1'
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
		if (is_Date(region)) {
			region = region.getTime();
		} else if (typeof region === 'string' && (region in reform_by_region)) {
			region = reform_by_region[region];
		}
		return Number.isFinite(region) ? region : _.Gregorian_reform_date;
	}
	Gregorian_reform_of.regions = reform_by_region;
	_.Gregorian_reform_of = Gregorian_reform_of;

	// ---------------------------------------------------------------------------//
	// 文化/區域功能。

	var
	/** {Number}未發現之index。 const: 基本上與程式碼設計合一，僅表示名義，不可更改。(=== -1) */
	NOT_FOUND = ''.indexOf('_'),
	// 10 天干. celestial stem, Heavenly Stem.
	STEM_LIST = '甲乙丙丁戊己庚辛壬癸',
	// 12 地支. Earthly Branches. TODO: 異體字如"夘"
	BRANCH_LIST = '子丑寅卯辰巳午未申酉戌亥',
	// 60: lcm(STEM_LIST.length, BRANCH_LIST.length);
	SEXAGENARY_CYCLE_LENGTH = 60,

	// 當考慮以 CST，或以當地時間為準。
	// 因為八字與經度，以及該經度與太陽的日照相對夾角有關，因此採當地時間為準。

	// CE YEAR_STEM_BRANCH_EPOCH 3-12月為甲子年。
	// 以此計算 new Date(0) 之 offset。
	// 黃帝紀元元年 (year -2696 in proleptic Gregorian calendar) 為甲子年。
	YEAR_STEM_BRANCH_EPOCH = -2696,
	// 1984/3/31 0:0 (甲子年丁卯月)甲子日始: 以此基準點計算 new Date(0) 之 offset。
	DATE_STEM_BRANCH_EPOCH = new Date(1984, 3 - 1, 31),
	//
	DATE_STEM_BRANCH_minute_offset = DATE_STEM_BRANCH_EPOCH.getTimezoneOffset() || 0,
	// 1984/3/31 23:0 (甲子年丁卯月)甲子日甲子時始: 以此基準點計算 new Date(0) 之 offset。
	HOUR_STEM_BRANCH_epoch = new Date(1984, 3 - 1, 30, 23),
	//
	HOUR_STEM_BRANCH_minute_offset = HOUR_STEM_BRANCH_epoch.getTimezoneOffset() || 0;
	DATE_STEM_BRANCH_EPOCH = DATE_STEM_BRANCH_EPOCH.getTime();
	HOUR_STEM_BRANCH_epoch = HOUR_STEM_BRANCH_epoch.getTime();

	_.STEM_LIST = STEM_LIST;
	_.BRANCH_LIST = BRANCH_LIST;
	_.SEXAGENARY_CYCLE_LENGTH = SEXAGENARY_CYCLE_LENGTH;

	_.YEAR_STEM_BRANCH_EPOCH = YEAR_STEM_BRANCH_EPOCH;

	// 日干支序。
	// 注意：此處"序"指的是 Array index，從 0 開始。
	function date_stem_branch_index(date_value, options) {
		if (options && options.original_Date) {
			date_value = options.original_Date;
		}
		var index = Math.floor((date_value - DATE_STEM_BRANCH_EPOCH
		// 修正不同年代時刻間的時區差。
		- (date_value.getTimezoneOffset() - DATE_STEM_BRANCH_minute_offset)
				* ONE_MINUTE_LENGTH_VALUE)
				/ ONE_DAY_LENGTH_VALUE);
		// 針對需要子初分日者特別處理:直接算入下一天。
		if (Date_to_String['子初分日'] && date_value.getHours() === 23) {
			index++;
		}
		if ((index %= SEXAGENARY_CYCLE_LENGTH) < 0) {
			index += SEXAGENARY_CYCLE_LENGTH;
		}
		return index;
	}

	// 時干支序。
	// 注意：此處"序"指的是 Array index，從 0 開始。
	function hour_stem_branch_index(date_value, options) {
		date_value = options && options.original_Date || date_value;
		date_value = date_value - HOUR_STEM_BRANCH_epoch
		// 修正不同年代時刻間的時區差。
		- (date_value.getTimezoneOffset() - HOUR_STEM_BRANCH_minute_offset)
				* ONE_MINUTE_LENGTH_VALUE;
		return date_value / ONE_時辰_LENGTH_VALUE;
	}

	// 極大程度依賴 date_pattern 的寫法！
	stem_branch_date_pattern = new RegExp(stem_branch_date_pattern.replace(
			/\([^()]+\)日/, '([' + STEM_LIST + '][' + BRANCH_LIST + '])日'));

	/**
	 * parse 日干支：取得最接近 date_value 之指定日干支。
	 * 
	 * @param {String|Integer}stem_branch
	 *            指定日干支。
	 * @param {Date}date_value
	 *            基準日。
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * @returns
	 */
	function convert_stem_branch_date(stem_branch, date_value, end_date_diff) {

		if (!isNaN(stem_branch)
				|| !isNaN(stem_branch = stem_branch_to_index(stem_branch))) {

			if (!date_value) {
				date_value = new Date;
			}

			// assert: 加入干支之 date 可被正常 parse，但日干支本身會被忽略。
			// stem_branch_diff. [3]: see date_pattern.

			// 取得日干支差距。
			stem_branch -= date_stem_branch_index(date_value);

			if (!end_date_diff) {
				// 設在月底。
				end_date_diff = new Date(date_value).setMonth(date_value
						.getMonth() + 1, 0)
						- date_value;
			} else if (end_date_diff < 0) {
				// assert: !!period_end === true
				stem_branch += end_date_diff;
			}

			if (stem_branch < 0) {
				// 轉成最接近 0 之正 index。
				stem_branch = SEXAGENARY_CYCLE_LENGTH
						+ (stem_branch % SEXAGENARY_CYCLE_LENGTH);
			}
			if (Math.abs(end_date_diff) < stem_branch) {
				// 找出距離範圍最近的日干支。
				if (library_namespace.is_debug()) {
					library_namespace
							.warn('convert_stem_branch_date: 所欲求之日干支 ['
									+ stem_branch + '] 並不在範圍內！');
				}
				if (stem_branch - Math.abs(end_date_diff) > SEXAGENARY_CYCLE_LENGTH
						- stem_branch) {
					stem_branch -= SEXAGENARY_CYCLE_LENGTH;
				}
			}
			date_value.setDate(date_value.getDate() + stem_branch
					+ (end_date_diff < 0 ? end_date_diff : 0));
		}

		return date_value;
	}

	_.convert_stem_branch_date = convert_stem_branch_date;

	// 會變更 options!
	String_to_Date.parser.Chinese = function(date_string, minute_offset,
			options) {
		// 前置處理。
		if (!library_namespace.is_Object(options)) {
			options = Object.create(null);
		}

		if (isNaN(options.year_padding)) {
			options.year_padding = 0;
		}

		var date_value = String_to_Date.parser.CE(date_string, minute_offset,
				options),
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
			end_date_diff = (String_to_Date.parser.CE(date_string,
					minute_offset, options) - date_value)
					/ ONE_DAY_LENGTH_VALUE;
			// assert: if (end_date_diff < 0) than !!period_end === true

			// 復原 options。
			options.period_end = period_end;

			date_value = convert_stem_branch_date(stem_branch, date_value,
					end_date_diff);
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
		// 但以 "-1.1 | 0", "-1.1 >> 0", "≈-1.1" 會 → -1。
		// 效能:
		// http://jsperf.com/math-floor-vs-math-round-vs-parseint
		if (!isNaN(index = +index % SEXAGENARY_CYCLE_LENGTH)) {
			if ((index = Math.floor(index)) < 0) {
				index += SEXAGENARY_CYCLE_LENGTH;
			}

			// 10: STEM_LIST.length
			return STEM_LIST.charAt(index % 10)
			// 12: BRANCH_LIST.length
			+ BRANCH_LIST.charAt(index % 12);
		}
	}

	// 取得指定日干支之序數 (0-59)。
	function stem_branch_to_index(stem_branch) {
		if (!stem_branch || !(stem_branch = String(stem_branch))) {
			return;
		}

		var _0 = stem_branch.charAt(0), index = STEM_LIST.indexOf(_0);
		if (stem_branch.length > 1) {
			// '甲子'
			if (index !== NOT_FOUND
					&& (_0 = BRANCH_LIST.indexOf(stem_branch.charAt(1))) !== NOT_FOUND) {
				// 解一次同餘式組
				// index = (SEXAGENARY_CYCLE_LENGTH + 6 * index - 5 * _0) %
				// SEXAGENARY_CYCLE_LENGTH;
				index = (6 * index + 55 * _0) % SEXAGENARY_CYCLE_LENGTH;
			}
		} else if (index === NOT_FOUND) {
			// '甲' / '子'
			index = BRANCH_LIST.indexOf(_0);
		}

		if (index >= 0) {
			return index;
		}
	}

	_.to_stem_branch = index_to_stem_branch;
	// 可能回傳 0。若無法轉換，會回傳 undefined。
	_.stem_branch_index = function(value, options) {
		return is_Date(value) ? options && options.hour ? hour_stem_branch_index(value)
				: date_stem_branch_index(value)
				: stem_branch_to_index(value);
	};

	/**
	 * guess the year-stem-branch (歲次/年干支) of the date.
	 * 
	 * @param {Date|Integer}date_value
	 *            date specified.
	 * @param {Object|Boolean}options
	 *            true or {get_index:true} : get {Integer}index (年干支序) instead
	 *            of year-stem-branch.
	 * 
	 * @returns {String} year-stem-branch (歲次/年干支)
	 */
	function guess_year_stem_branch(date_value, options) {
		if (options && options.original_Date) {
			date_value = options.original_Date;
		}

		var year, month, date;
		if (is_Date(date_value)) {
			year = date_value.getFullYear();
			month = date_value.getMonth();
		} else if (isNaN(date_value)) {
			// TypeError
			throw new Error('guess_year_stem_branch: Not a Date');
		} else {
			year = date_value | 0;
			month = 7;
		}

		year -= YEAR_STEM_BRANCH_EPOCH;

		if (month < 2)
			// 正月初一的日期落在大寒至雨水
			// （一般在公曆1月19日至2月20日）之間。
			// 立春則一般在2月4日或2月5日。
			if ((date = date_value.getDate()) < 19 && month === 0) {
				// 上一年。
				year--;
			} else if (date < 20 || month < 1) {
				// 無法判別歲次：需要 include 'data.date.era'!
				return '(' + index_to_stem_branch(year - 1) + '或'
						+ index_to_stem_branch(year) + ')';
			}

		if (!options || options !== true && !options.get_index) {
			year = index_to_stem_branch(year);
		} else if ((year %= SEXAGENARY_CYCLE_LENGTH) < 0) {
			// see index_to_stem_branch()
			year += SEXAGENARY_CYCLE_LENGTH;
		}

		return year;
	}

	_.guess_year_stem_branch = guess_year_stem_branch;

	// Date_to_String['子初分日'] = false;
	// Date_to_String.子初分日 = false;

	strftime.set_conversion(Object.assign({
		// 完整民國紀年年份(2 or 3位數的數字，如 98, 102)
		R : function(date_value) {
			if ((date_value = date_value.getFullYear()) > 900) {
				// 民前0年是1911年。
				date_value -= 1911;
			}
			return date_value;
		}
	}, strftime.default_conversion), 'cmn-Hant-TW');

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//
	// timevalue → {String}日期及時間表達式

	/**
	 * 計算大略的時間間隔，以適當的時間單位縮寫簡略顯示。 count roughly duration, count date.<br />
	 * CeL.age_of(new Date(0, 0, 0), new Date(0, 0, 0, 0, 0, 8)) === '8s'
	 * 
	 * TODO: locale
	 * 
	 * @param {Date|Number}start
	 * @param {Date|Number}[end]
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 */
	function age_of(start, end, options) {
		options = library_namespace.setup_options(options);
		if (!end) {
			// count till now.
			end = end === 0 ? new Date(0) : new Date;
		}
		var difference = end - start, diff, diff2,
		//
		gettext = library_namespace.gettext;
		if (!(difference >= 0) || !isFinite(difference)) {
			return;
		}

		if (!is_Date(start)) {
			start = new Date(start);
		}
		if (!is_Date(end)) {
			end = new Date(end);
		}
		// assert: new Date(0) 得到1月1日
		// assert: (new Date(0)).getMonth()===0&&(new Date(0)).getDate()===1
		diff2 = new Date(end - start);
		// ↑ 如此可處理年尾到年首的差異。
		// 計算兩者相差年分計數。
		diff = diff2.getFullYear() - /* 1970 */new Date(0).getFullYear();
		// 計算兩者相差大概月分。
		diff2 = diff2.getMonth() + (diff2.getDate() - 1) / 30;

		// 將數字四捨五入到指定的小數位數。 TODO: 把時間表示方式改為60進位。
		var to_fixed_digits = (options.digits | 0) >= 0
		// default: 0. e.g., {digits:0}
		? options.digits | 0 : 0;
		var long_format = options.long_format;

		if (diff) {
			// assert: {Integer}diff 年 {Float}diff2 月, diff > 0.
			// → difference = {Float} 年（至小數）
			difference = diff + diff2 / 12;
			// diff = {String} format to show
			if (options.月) {
				diff = gettext(long_format ?
				// gettext_config:{"id":"$1-years-and-$2-months"}
				'%1 {{PLURAL:%1|year|years}} and %2 {{PLURAL:%2|month|months}}'
				// gettext_config:{"id":"$1-y-$2-m"}
				: '%1 Y %2 M', diff, Math.round(diff2));
			} else {
				// years 近一年, 一年多
				// SI symbol: a (for Latin annus)
				diff = gettext(long_format ?
				// gettext_config:{"id":"$1-years"}
				'%1 {{PLURAL:%1|year|years}}'
				// gettext_config:{"id":"$1-y"}
				: '%1 Y', difference.to_fixed(to_fixed_digits));
			}
			if (options.歲) {
				// 計算年齡(虛歲)幾歲。
				difference = end.getFullYear() - start.getFullYear()
				// + 1: 一出生即虛歲一歲(YO, years old, "Y/O.")。之後過年長一歲。
				// else: 計算周歲（又稱實歲、足歲）幾歲。
				+ (options.歲 === '虛' ? 1 : 0);
				if (start - age_of.get_new_year(start.getFullYear()) < 0) {
					difference++;
				}
				if (end - age_of.get_new_year(end.getFullYear()) < 0) {
					difference--;
				}
				// 時年實歲。
				diff = difference + '歲, ' + diff;
			}

			return diff;
		}

		if (diff2 >= 1 && options.max_unit !== 'day') {
			return gettext(long_format ?
			// gettext_config:{"id":"$1-months"}
			'%1 {{PLURAL:%1|month|months}}'
			// gettext_config:{"id":"$1-m"}
			: '%1 M', diff2.to_fixed(to_fixed_digits));
		}

		if (difference < 1000) {
			return gettext(long_format ?
			// gettext_config:{"id":"$1-milliseconds"}
			'%1 {{PLURAL:%1|millisecond|milliseconds}}'
			// gettext_config:{"id":"$1-ms"}
			: '%1 ms', difference | 0);
		}

		if ((difference /= 1000) < 60) {
			return gettext(long_format ?
			// gettext_config:{"id":"$1-seconds"}
			'%1 {{PLURAL:%1|second|seconds}}'
			// gettext_config:{"id":"$1-s"}
			: '%1 s', difference.to_fixed(to_fixed_digits));
		}

		if ((difference /= 60) < 60) {
			return gettext(long_format ?
			// gettext_config:{"id":"$1-minutes"}
			'%1 {{PLURAL:%1|minute|minutes}}'
			// gettext_config:{"id":"$1-min"}
			: '%1 min', difference.to_fixed(to_fixed_digits));
		}

		if ((difference /= 60) < 24) {
			return gettext(long_format ?
			// gettext_config:{"id":"$1-hours"}
			'%1 {{PLURAL:%1|hour|hours}}'
			// gettext_config:{"id":"$1-hr"}
			: '%1 hr', difference.to_fixed(to_fixed_digits));
		}

		if ((difference /= 24) < 7 || !options.weeks) {
			return gettext(long_format ?
			// gettext_config:{"id":"$1-days"}
			'%1 {{PLURAL:%1|day|days}}'
			// gettext_config:{"id":"$1-d"}
			: '%1 d', difference.to_fixed(to_fixed_digits));
		}

		return gettext(long_format ?
		// gettext_config:{"id":"$1-weeks"}
		'%1 {{PLURAL:%1|week|weeks}}'
		// gettext_config:{"id":"$1-w"}
		: '%1 W', (difference / 7).to_fixed(to_fixed_digits));
	}

	// 將在 data.date.era 更正。
	age_of.get_new_year = function(year, 月, 日, era_key) {
		// 取平均值。因無法準確判別春節（農曆正月初一）日期，此方法尚有誤差！
		return new Date((year < 0 ? year : '000' + year) + '/2/1');
	};

	_.age_of = age_of;

	// ------------------------------------------

	var recent_date_name = [
	// gettext_config:{"id":"2-days-before-yesterday-$h-$m"}
	'2 days before yesterday, %H:%M',
	// gettext_config:{"id":"the-day-before-yesterday-$h-$m"}
	'the day before yesterday, %H:%M',
	// gettext_config:{"id":"yesterday-$h-$m"}
	'yesterday, %H:%M',
	// gettext_config:{"id":"today-$h-$m"}
	'today, %H:%M',
	// gettext_config:{"id":"tomorrow-$h-$m"}
	'tomorrow, %H:%M',
	// gettext_config:{"id":"the-day-after-tomorrow-$h-$m"}
	'the day after tomorrow, %H:%M',
	// gettext_config:{"id":"2-days-after-tomorrow-$h-$m"}
	'2 days after tomorrow, %H:%M',
	// gettext_config:{"id":"3-days-after-tomorrow-$h-$m"}
	'3 days after tomorrow, %H:%M' ];
	var recent_date_name_today_index
	// gettext_config:{"id":"today-$h-$m"}
	= recent_date_name.indexOf('today, %H:%M');

	// @see https://en.wikipedia.org/wiki/Wikipedia:Comments_in_Local_Time
	// https://en.wikipedia.org/wiki/User:Gary/comments_in_local_time.js
	// https://zh.wikipedia.org/wiki/MediaWiki:Gadget-CommentsinLocalTime.js
	function indicate_date_time(date, options) {
		options = library_namespace.setup_options(options);
		if (!is_Date(date)) {
			// e.g., time value, ISO string
			// console.trace(date);
			date = new Date(date);
		}

		var base_date = options.base_date;
		if (isNaN(base_date) && !is_Date(base_date)) {
			base_date = typeof options.base_date === 'string' ? Date
					.parse(options.base_date) : Date.now();
		}

		var date_value_diff = date - base_date;
		if (isNaN(date_value_diff)) {
			// something wrong
			return;
		}

		if (Math.abs(date_value_diff) > (options.max_interval || 35 * ONE_DAY_LENGTH_VALUE)) {
			return date.format(options.general_format
					|| indicate_date_time.general_format);
		}

		var passed = date_value_diff <= 0,
		//
		gettext = library_namespace.gettext;

		if (passed) {
			date_value_diff = -date_value_diff;
		} else {
			// is future
		}

		// → seconds
		date_value_diff /= 1000;

		if (date_value_diff < 1) {
			// gettext_config:{"id":"now"}
			return gettext('now');
		}

		if (date_value_diff < 10) {
			// gettext_config:{"id":"several-seconds-ago"}
			return gettext(passed ? 'several seconds ago'
			// gettext_config:{"id":"soon"}
			: 'soon');
		}
		if (date_value_diff < 60) {
			// gettext_config:{"id":"$1-seconds-ago"}
			return gettext(passed ? '%1 {{PLURAL:%1|second|seconds}} ago'
			// gettext_config:{"id":"$1-seconds-later"}
			: '%1 {{PLURAL:%1|second|seconds}} later', Math
					.round(date_value_diff));
		}

		// → minutes
		date_value_diff /= 60;
		if (date_value_diff < 60) {
			// gettext_config:{"id":"$1-minutes-ago"}
			return gettext(passed ? '%1 {{PLURAL:%1|minute|minutes}} ago'
			// gettext_config:{"id":"$1-minutes-later"}
			: '%1 {{PLURAL:%1|minute|minutes}} later', Math
					.round(date_value_diff));
		}

		// → hours
		date_value_diff /= 60;
		if (date_value_diff < 3) {
			// gettext_config:{"id":"$1-hours-ago"}
			return gettext(passed ? '%1 {{PLURAL:%1|hour|hours}} ago'
			// gettext_config:{"id":"$1-hours-later"}
			: '%1 {{PLURAL:%1|hour|hours}} later', Math.round(date_value_diff));
		}

		// ----------------------------

		// → days
		date_value_diff /= 24;

		if (date_value_diff <= 3) {
			// the day of the month
			var message = /* date_of_month */date.getDate()
					- (is_Date(base_date) ? base_date : new Date(base_date))
							.getDate() + recent_date_name_today_index;
			// console.log([date_value_diff, message, (new Date).getDate(),
			// date.getDate()]);
			if (message > recent_date_name.length) {
				// assert: (new Date) 於本月初，date 於上月底。
				date_value_diff = new Date;
				date_value_diff.setDate(0);
				message -= date_value_diff.getDate();
			}
			message = recent_date_name[message];
			return date.format(gettext(message/* + ', %H:%M' */));
		}

		// TODO: week, 周六

		if (date_value_diff <= 35) {
			// gettext_config:{"id":"$1-days-ago"}
			return gettext(passed ? '%1 {{PLURAL:%1|day|days}} ago'
			// gettext_config:{"id":"$1-days-later"}
			: '%1 {{PLURAL:%1|day|days}} later', Math.round(date_value_diff));
		}

		// ----------------------------

		if (false && date_value_diff < 30) {
			// gettext_config:{"id":"$1-weeks-ago"}
			return gettext(passed ? '%1 {{PLURAL:%1|week|weeks}} ago'
			// gettext_config:{"id":"$1-weeks-later"}
			: '%1 {PLURAL:%1|week|weeks}} later', Math
					.round(date_value_diff / 7));
		}

		// ----------------------------

		// for dates in this year, *月*日

		// ----------------------------

		// *年*月*日

		return date.format(options.general_format
				|| indicate_date_time.general_format);
	}

	indicate_date_time.general_format = '%Y-%2m-%2d %2H:%2M';

	_.indicate_date_time = indicate_date_time;

	// ------------------------------------------
	// {String}日期及時間表達式 → {Natural}timevalue in milliseconds

	// https://en.wikipedia.org/wiki/ISO_8601#Durations
	var PATTERN_ISO_8601_durations = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/,
	// 日期及時間 由小到大排列。
	PATTERN_time_units = [ [ '(?:ms|milliseconds?|毫秒|ミリ秒)', 1 ],
			[ '(?:s(?:ec)?|秒[鐘钟]?)', 1000 ], [ '(?:m(?:in)?|分[鐘钟]?)', 60 ],
			[ '(?:h(?:r|ours?)?|[個个]?小?[時时]|[個个]?時間)', 60 ],
			// T: for ISO 8601 Durations. e.g., 'P21DT3H'
			[ '(?:d(?:ays?|T)?|[日天])', 24 ],
			[ '(?:w(?:eeks?)?|週|[個个]?星期|個?禮拜|个?礼拜)', 7, true ],
			// 以下僅僅給出約略大小。 1 month: 30 days
			[ '(?:mon(?:ths?)?|[個个ヶ]?月)', 30 ],
			// https://en.wikipedia.org/wiki/Year#SI_prefix_multipliers
			// NIST SP811 和ISO 80000-3：2006 支持將符號a作為一年的時間單位。在英語中，還使用縮寫y和yr。
			// IUPAC: 1 a = 31556925.445 seconds
			[ '(?:y(?:r|ears?)?|年)', 12 ] ];

	(function() {
		// [ all, amount ]
		var ms = 1, template = /(\d+(?:\.\d+)?|\.\d+) ?UNIT(?:[^a-z]|$)/.source;
		PATTERN_time_units = PATTERN_time_units.map(function(pair) {
			return [ new RegExp(template.replace('UNIT', pair[0]), 'i'),
					pair[2] ? ms * pair[1] : ms *= pair[1] ];
		});
	})();

	// parser time interval to timevalue (get how many millisecond)
	// TODO: 半小時
	function time_interval_to_millisecond(interval) {
		if (typeof interval !== 'string') {
			// 允許函數之類其他種類的設定，需要呼叫端進一步處理。
			return interval > 0 ? +interval : interval || 0;
		}

		var timevalue = 0, has_matched, matched = interval
				.match(PATTERN_ISO_8601_durations);
		if (matched) {
			if (false && (+matched[1] || +matched[2])) {
				throw 'We cannot handle year / month: ' + interval;
			}

			// 這可以順便用來 parse:
			// https://en.wikipedia.org/wiki/ISO_8601#Durations
			// e.g., "P23DT23H"
			interval = matched[0];

		} else if (matched = interval
		// e.g., "12:34", "12:34:56"
		.match(/(?:^|\s)(\d{1,3}):(\d{1,2})(?::(\d{1,2}))?(?:\s|$)/)) {
			interval = matched[1] + 'H' + matched[2] + 'M'
					+ (matched[3] ? matched[3] + 'S' : '');
		}

		PATTERN_time_units.forEach(function(pair) {
			matched = interval.match(pair[0]);
			if (matched) {
				has_matched = true;
				timevalue += matched[1] * pair[1];
			}
		});

		if (has_matched)
			return timevalue;

		matched = interval.split('/');
		if (matched.length === 2) {
			// https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
			matched = matched.map(function(time) {
				return Date.parse(time);
			});
			if (!isNaN(matched[0]) && !isNaN(matched[1])) {
				return matched[1] - matched[0];
			}
		}
	}

	_.to_millisecond = time_interval_to_millisecond;

	// ---------------------------------------------------------------------//

	// parse durations. period 是比較久的時間
	function parse_period(period) {
		var matched = period.match(parse_period.PATTERN);
		if (matched && (!/[日時]/.test(matched[2])
		// 預防 "10月22日夜7-8時"
		|| !/[時分秒\/]/.test(matched[2].match(/^(?:.*?)([年月日時分秒\/])/)[1]))) {
			(period = matched).shift();
			if (!period[1].includes('月')
					&& (matched = period[0].match(/[^年月]+月/))) {
				period[1] = matched[0] + period[1];
			}
			if (!period[1].includes('年')
					&& (matched = period[0].match(/[^年]+年/))) {
				period[1] = matched[0] + period[1];
			}
		} else if (library_namespace.is_debug(2)) {
			library_namespace.warn('parse_period: Cannot parse period ['
					+ period + ']');
		}
		return period;
	}

	// '1/1/1-2/1/1' → [, '1/1/1', '2/1/1' ]
	// 'Neo-Babylonian/Nabopolassar' → null
	// "[^a-z]": 避免類似 "Neo-Babylonian" 被當作 period。
	//
	// "Maya:9.2.15.3.8 12 Lamat 6 Wo－Maya:9.6.11.0.16 7 Kib' 4 K'ayab'"
	// →
	// [, "Maya:9.2.15.3.8 12 Lamat 6 Wo", "Maya:9.6.11.0.16 7 Kib' 4 K'ayab'" ]
	parse_period.PATTERN = /^(.+[^a-z]|[^\d]*\d.+)[\-–~－—─～〜﹣至]\s*([^\-].+)$/i;
	// @see String_to_Date.parser_PATTERN

	_.parse_period = parse_period;

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

	// count=1: 1–31
	// count=2: 1–15, 16–31
	// count=3: 1–10, 11–20, 21–31
	// count=4: 1–7, 8–14, 15–21, 22–31
	// count=5: 1–6, ...
	/**
	 * 將`date`所屬的月份以日子為單位平均切割成`count`個slice，回傳`date`所在slice的首尾日期。
	 * 
	 * @param {Array}date
	 *            基準日期: [year, month, date]。assert: 必須為合理日期，不可輸入[2001,1,32]之類。
	 * @param {Natural}count
	 *            將`date`所屬的月份以日子為單位平均切割成`count`個slice。 assert: count<=31
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @returns `date`所在slice的首尾日期: {Array}[起始日期, 結束日期]
	 */
	function get_date_range_via_cutting_month(date, count, options) {
		if (!options && !(count >= 1)) {
			options = library_namespace.setup_options(count);
			count = options.count;
		} else {
			options = library_namespace.setup_options(options);
		}
		if (!Array.isArray(date)) {
			if (!is_Date(date)) {
				date = new Date(date);
			}
			date = Julian_day(date);
			date = Julian_day.to_YMD(date, 'CE');
		}
		// assert: Array.isArray(date)
		var year = date[0], month = date[1];
		date = date[2];

		var days_in_this_month = Julian_day.from_YMD(year, month + 1, 1, 'CE')
				- Julian_day.from_YMD(year, month, 1, 'CE');

		// const
		var slice_days;
		if (options.slice_days >= 1 && !count) {
			slice_days = options.slice_days;
			count = days_in_this_month / slice_days | 0;
		} else {
			slice_days = days_in_this_month / count | 0;
			if (days_in_this_month - count * slice_days > 2 * slice_days) {
				// 預防最後一區塊太大。
				// e.g., ([2000,2,28], 10)
				slice_days++;
			}
		}
		var index = (date - 1) / slice_days | 0;
		if (index >= count)
			index = count - 1;
		var slice_start_date = index * slice_days + 1;
		var slice_end_date = slice_start_date + slice_days
		// 從下一個片段第一天移到本片段最後一天。
		- 1;
		if (slice_days === 0) {
			slice_start_date = slice_end_date = date;
		} else if (index === count - 1) {
			// assert: date 處在最後一個片段。
			// 最後一個片段必須包含到最後一天。
			slice_end_date = days_in_this_month;
		}

		if (options.get_Date) {
			if (false) {
				console.trace([ [ year, month, slice_start_date ],
						[ year, month, slice_end_date ] ]);
			}
			slice_start_date = Julian_day.YMD_to_Date(year, month,
					slice_start_date, 'CE');
			slice_end_date = Julian_day.YMD_to_Date(year, month,
					slice_end_date, 'CE');
		} else if (options.get_full_date) {
			slice_start_date = [ year, month, slice_start_date ];
			slice_end_date = [ year, month, slice_end_date ];
		}
		return [ slice_start_date, slice_end_date ];
	}

	_.get_date_range_via_cutting_month = get_date_range_via_cutting_month;

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

	/**
	 * <code>
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

	</code>
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
	 * 
	 * @example alert(format_date());
	 * 
	 * @since 2003/10/18 1:04 修正
	 * @since 2010/4/16 10:37:30 重構(refactoring)
	 * 
	 * @requires to_fixed
	 * 
	 * @see http://www.merlyn.demon.co.uk/js-dates.htm,
	 *      http://aa.usno.navy.mil/data/docs/JulianDate.html
	 * 
	 * @_memberOf _module_
	 */
	function format_date(date_value, mode, zero_fill, date_separator,
			time_separator) {
		library_namespace.debug('[' + (typeof date_value) + '] ' + date_value
				+ ', mode: ' + mode, 3);

		// initialization
		if (!mode) {
			mode = 0;
		}

		var output_UTC, a, b = mode, time_mode, return_string = '', show_number = zero_fill ? function(
				n) {
			return n > 9 ? n : '0' + n;
		}
				: function(n) {
					return n;
				};

		// date & time mode
		mode %= 64;
		// UTC mode
		b = (b - mode) / 64;
		// input UTC
		a = b % 2 == 1 ? 1 : 0;
		output_UTC = b - a === 1;

		time_mode = mode % 8;
		// date mode
		mode = (mode - time_mode) / 8;
		// time_mode > 4 && mode > 3: error mode: 沒啥好顯示的了

		// 處理各種不同的 date
		b = typeof date_value;
		if (b === 'number' && date_value >= 0) {
			// 全球標準時間(UCT)與本地時間之差距
			// UTC time = local time + format_date.UTC_offset(milliseconds)
			if (!a && isNaN(a = format_date.UTC_offset)) {
				// input UTC 時之差距(milliseconds)
				// .getTimezoneOffset() is in minute.
				a = format_date.UTC_offset = ONE_MINUTE_LENGTH_VALUE
						* present_local_minute_offset;
			}

			// 值過小時當作時間: d < 90000000 ≈ 24*60*60*1000，判別為當天，只顯示時間。不允許 d < 0！
			date_value = new Date(Math.abs(a += date_value) < 9e7 ? a
					: date_value);
			mode = 32;
		} else if (b === 'string' && (a = date_value.toDate())) {
			date_value = a;
		} else if (b === 'date') {
			// 應對在 Excel 等外部程式會出現的東西。
			date_value = new Date(date_value);
		} else if (
		// http://www.interq.or.jp/student/exeal/dss/ejs/1/1.html
		// 引数がオブジェクトを要求してくる場合は instanceof 演算子を使用します
		// typeof date_value!=='object'||date_value.constructor!=Date
		!(date_value instanceof Date)) {
			// new Date === new Date()
			date_value = new Date;
		}

		// 處理 date
		if (mode < 4) {
			return_string = show_number((output_UTC ? date_value.getUTCMonth()
					: date_value.getMonth()) + 1);
			if (!date_separator) {
				date_separator = '/';
			}
			if (mode < 3) {
				return_string = (output_UTC ? date_value.getUTCFullYear()
						: date_value.getFullYear())
						+ date_separator + return_string;
			}
			if (mode !== 2) {
				return_string += date_separator
						+ show_number(output_UTC ? date_value.getUTCDate()
								: date_value.getDate());
				if (mode === 1) {
					return_string += '('
							+ (output_UTC ? date_value.getUTCDay() : date_value
									.getDay()) + ')';
				}
			}
		}

		// 處理 time
		if (time_mode < 4) {
			if (mode < 4) {
				// 日期 & 時間中間分隔
				return_string += ' ';
			}
			if (!time_separator) {
				time_separator = ':';
			}
			return_string += show_number(output_UTC ? date_value.getUTCHours()
					: date_value.getHours());
			if (time_mode < 3) {
				return_string += time_separator
						+ show_number(output_UTC ? date_value.getUTCMinutes()
								: date_value.getMinutes());
				if (time_mode < 2) {
					return_string += time_separator
							+ (time_mode
							//
							? show_number(output_UTC ? date_value
									.getUTCSeconds() : date_value.getSeconds())
							//
							: (output_UTC ? date_value.getUTCSeconds()
									+ date_value.getUTCMilliseconds() / 1e3
							//
							: date_value.getSeconds()
									+ date_value.getMilliseconds() / 1e3)
									.to_fixed(3));
				}
			}
		}

		return return_string;
	}

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

	// @inner
	function serial_token_list_toString() {
		return this.join('');
	}

	// @inner
	function to_serial_token_list(item, options) {
		var serial_token_list = [];
		if (!item && item !== 0)
			return serial_token_list;

		serial_token_list.toString = serial_token_list_toString;
		var PATTERN_serial_token = /([^\d]+)(0*)([1-9]\d*)?/g;
		var max_serial_length = options.max_serial_length;

		item = String(item);
		var matched = item.match(/^\d+/);
		if (matched) {
			matched = matched[0];
			if (matched.length > max_serial_length) {
				serial_token_list.push(matched.slice(0, -max_serial_length),
						matched.slice(-max_serial_length));
			} else {
				serial_token_list.push('', matched);
			}
			PATTERN_serial_token.lastIndex = matched.length;
		}

		while (matched = PATTERN_serial_token.exec(item)) {
			if (!matched[3])
				matched[3] = '';
			var diff = max_serial_length - matched[3].length;
			if (matched[2].length <= diff) {
				serial_token_list.push(matched[1], matched[2] + matched[3]);
			} else if (0 <= diff) {
				serial_token_list.push(matched[1] + matched[2].slice(0, -diff),
						'0'.repeat(diff) + matched[3]);
			} else {
				serial_token_list.push(matched[0], '');
			}
		}

		// assert: item === serial_token_list.join('')

		// return pairs: [
		// non-serial, digits (maybe serial),
		// non-serial, digits (maybe serial),
		// ... ]
		return serial_token_list;
	}

	// @inner
	function generator_toString(serial, date) {
		var list = this.clone();
		if (typeof date === 'string') {
			date = date.to_Date() || date;
		} else if (typeof date === 'number') {
			date = new Date(date);
		}
		if (!is_Date(date) || !date.getTime()) {
			if (date) {
				library_namespace.error([ 'generator_toString: ', {
					// gettext_config:{"id":"invalid-date-$1"}
					T : [ 'Invalid date: %1', date ]
				} ]);
			}
			date = new Date;
		}

		for (var arg_index = 1, index = 1; index < list.length; index++) {
			var operator = list[index];
			if (Number.isSafeInteger(serial)) {
				if (typeof operator === 'number') {
					list[index] = operator ? serial.pad(operator) : serial;
				} else {
					list[index] = operator ? date.format(operator) :
					// assert: operator === ''
					'';
				}
			} else {
				list[index] = typeof operator === 'number' ? '%' + arg_index++
						: operator;
			}
		}
		return list.join('');
	}

	// @inner
	function get_pattern_and_generator(serial_token_list, options) {
		if (!serial_token_list)
			return;

		var pattern = serial_token_list.clone();
		var generator = serial_token_list.clone();

		for (var index = 1; index < pattern.length; index++) {
			var token = pattern[index];
			if (index % 2 === 0) {
				// assert: generator[index] === token;
				pattern[index]
				//
				= library_namespace.to_RegExp_pattern(token);
				continue;
			}

			if (!token)
				continue;

			var fixed_length = options.fixed_length || token.startsWith(0);
			generator[index] = fixed_length ? token.length : 0;
			pattern[index] = fixed_length
			//
			? '(\\d{' + token.length + '})'
			//
			: '(\\d{1,' + options.max_serial_length + '})';
		}

		// assert: new RegExp('^'+pattern+'$').test(serial_token_list.join(''))
		// === true

		// assert: CeL.gettext(generator, index, index.pad()) may generate
		// serial_token_list.join('')

		return [ pattern, generator ];
	}

	// @inner
	function new_generator(generator_array) {
		return generator_toString.bind(generator_array);
	}

	// generator string (e.g., including "%1", "%Y") to generator
	function parse_generator(generator_string) {
		// matched: [ operator, pad, date, argument_NO ]
		var PATTERN_operator = new RegExp(
				/%(?:(\d?)(conversion)|(1)|(\d?)№)/.source.replace(
						'conversion', Object.keys(strftime.default_conversion)
								.join('|')), 'g');
		var matched, generator = [], lastIndex = 0;
		while (matched = PATTERN_operator.exec(generator_string)) {
			generator.push(generator_string.slice(lastIndex, matched.index),
					matched[3] ? 0 : matched[4] ? +matched[4] : matched[0]);
			lastIndex = PATTERN_operator.lastIndex;
		}
		if (lastIndex < generator_string.length)
			generator.push(generator_string.slice(lastIndex));

		// assert: generator.toString() === generator_string
		return new_generator(generator);
	}

	detect_serial_pattern.parse_generator = parse_generator;

	// digital serial instance to pattern and generator
	function detect_serial_pattern(items, options) {
		options = library_namespace.new_options(options);
		if (!(options.max_serial_length > 0)) {
			// 4: year length
			options.max_serial_length = 4;
		}

		var pattern_hash = Object.create(null);
		function add_serial_token_list(serial_token_list) {
			var pattern = get_pattern_and_generator(serial_token_list, options);
			if (!pattern)
				return;
			var generator = pattern[1];
			pattern = pattern[0];
			var pattern_String = pattern.join('');
			if (!pattern_hash[pattern_String]) {
				(pattern_hash[pattern_String] = []).generator = generator;
			}
			pattern_hash[pattern_String].push(serial_token_list);
		}

		// 創建 pattern_hash
		items.forEach(function(item) {
			var serial_token_list = to_serial_token_list(item, options);
			add_serial_token_list(serial_token_list);
		});

		// 掃描: 有相同 digits 的不應歸為 serial。
		Object.values(pattern_hash).forEach(function(lists) {
			var need_to_resettle = [];
			for (var index = 1; index < lists.length; index += 2) {
				for (var digits_hash = Object.create(null), index_of_lists = 0;
				//
				index_of_lists < lists.length; index_of_lists++) {
					var serial_token_list = lists[index_of_lists];
					var digits = serial_token_list[index];
					if (!digits) {
						// assert: lists[*][index] === ''
						break;
					}
					if (!(digits in digits_hash)) {
						digits_hash[digits] = index_of_lists;
						continue;
					}
					// 有相同 digits 的不應歸為 serial。
					// e.g., "A1B1", "A1B2"
					// 僅有 A1B<b>1</b>, A1B<b>2</b> 可歸為 serial。
					// A<b>1</b> ["A", "1", ... ] 應改為 ["A1", "", ... ]
					serial_token_list[index - 1] += digits;
					serial_token_list[index] = '';
					if (!need_to_resettle.includes(index_of_lists))
						need_to_resettle.push(index_of_lists);
					if (digits_hash[digits] >= 0) {
						serial_token_list = lists[digits_hash[digits]];
						serial_token_list[index - 1] += digits;
						serial_token_list[index] = '';
						need_to_resettle.unshift(digits_hash[digits]);
						// 下次不再處理。
						digits_hash[digits] = -1;
					}
				}
			}

			if (need_to_resettle.length > 0) {
				need_to_resettle.sort(library_namespace.descending)
				//
				.forEach(function(index_of_lists) {
					var serial_token_list = lists.splice(index_of_lists, 1)[0];
					// rebulid pattern_hash
					add_serial_token_list(serial_token_list);
				});
			}
		});

		// 把 pattern '(\\d{1,' + max_serial_length + '})'
		// 搬到 '(\\d{' + token.length + '})'
		Object.keys(pattern_hash).forEach(function(pattern) {
			var lists = pattern_hash[pattern];
			if (lists.length === 0) {
				// Nothing left after "有相同 digits 的不應歸為 serial。".
				delete pattern_hash[pattern];
				return;
			}
			if (!pattern.includes('(\\d{1,')) {
				// Not target.
				return;
			}
			var _options = Object.clone(options);
			_options.fixed_length = true;
			for (var index_of_lists = 0;
			//
			index_of_lists < lists.length; index_of_lists++) {
				var serial_token_list = lists[index_of_lists];
				var pattern = get_pattern_and_generator(serial_token_list,
				//
				_options);
				// var generator = pattern[1];
				pattern = pattern[0];
				var pattern_String = pattern.join('');
				if (pattern_hash[pattern_String]) {
					lists.splice(index_of_lists--, 1);
					pattern_hash[pattern_String].push(serial_token_list);
				}
			}
		});

		Object.keys(pattern_hash).forEach(function(pattern) {
			if (pattern_hash[pattern].length === 0)
				delete pattern_hash[pattern];
		});

		// 把符合日期的數字以日期標示。
		Object.values(pattern_hash).forEach(function(lists) {
			var generator = lists.generator;
			for (var index = 1,
			// assert: length === generator.length
			length = generator.length; index < length; index += 2) {
				var digits_list = [];
				if (lists.some(function(serial_token_list) {
					var digits = serial_token_list[index];
					if (!digits)
						return true;
					// assert: digits_list.includes(digits) === false
					digits_list.push(digits);
				})) {
					continue;
				}

				// checker = [ typical generator label, checker,
				// has digits without 0-prefix ]
				var checker_list = [ [ '%Y', function(digits) {
					return 1900 <= digits && digits <= 2200;
				} ], [ '%m', function(digits) {
					if (1 <= digits && digits <= 12) {
						if (digits < 10 && digits.length < 2)
							this[2] = true;
						return true;
					}
				} ], [ '%d', function(digits) {
					if (1 <= digits && digits <= 31) {
						if (digits < 10 && digits.length < 2)
							this[2] = true;
						return true;
					}
				} ] ];

				checker_list = checker_list.filter(function(checker) {
					return digits_list.every(function(digits) {
						return checker[1](digits);
					});
				});

				if (checker_list.length === 0) {
					// No matched, use generator default operator
					// assert: typeof generator[index] === 'number'
					continue;
				}

				// assert: typeof generator[index] === 'number'
				generator[index] = [ generator[index] ]
				// 登記所有相符的。
				.append(checker_list);

				switch (checker_list = checker_list[0][0]) {
				case '%Y':
				case '%m':
					generator['has_' + checker_list] = true;
					break;
				}
			}

			for (var index = 1; index < generator.length; index += 2) {
				var operator = generator[index];
				if (Array.isArray(operator)) {
					var digits_length = operator[0];
					// best checker
					operator = operator[1];
					generator[index] = operator[0] === '%Y'
					// assert: generator[index] = [ number, [checker] ]
					|| generator['has_%Y'] && operator[0] === '%m'
					//
					|| generator['has_%m'] && operator[0] === '%d'
					//
					? digits_length || operator[2]
					// digits_length: "%m" → "%2m", operator[2]: "%m" → "%0m"
					? operator[0].replace('%', '%' + digits_length)
					//
					: operator[0] : digits_length;
				}
			}
		});

		// move items of %m to %2m, %d to %2d
		var pattern_group_hash = Object.create(null);
		Object.keys(pattern_hash).forEach(function(pattern) {
			var generalized = pattern.replace(/\\d{\d{1,2}}/g, '\\d{1,'
			//
			+ options.max_serial_length + '}');
			if (!pattern_group_hash[generalized]) {
				pattern_group_hash[generalized] = [ pattern ];
				return;
			}

			var pattern_to = pattern_hash[pattern].generator.join('');
			var index_in_group_hash;
			var pattern_from = pattern_group_hash[generalized]
			// 找出所有與 pattern 等價的
			.filter(function(_pattern, index) {
				_pattern = pattern_hash[_pattern].generator.join('');
				if (/%\d([md])/.test(_pattern)
				//
				!== /%\d([md])/.test(pattern_to)
				//
				&& _pattern.replace(/%\d([md])/g, '%$1')
				//
				=== pattern_to.replace(/%\d([md])/g, '%$1')) {
					if (!(index_in_group_hash >= 0))
						index_in_group_hash = index;
					return true;
				}
			});
			if (pattern_from.length === 0) {
				// Warning: 可能導致出現錯誤
				pattern_group_hash[generalized].push(pattern);
				return;
			}

			pattern_from = pattern_from[0];
			var pattern_to;
			if (/%\d([md])/.test(pattern_to)) {
				pattern_group_hash[generalized].splice(index_in_group_hash, 1);
				pattern_group_hash[generalized].push(pattern_to);
				pattern_to = pattern;
			} else {
				// switch from, to
				pattern_to = pattern_from;
				pattern_from = pattern;
			}
			// assert: !/%\d([md])/.test(pattern_from)
			// && /%\d([md])/.test(pattern_to)

			// var lists_from = pattern_hash[pattern_from];
			// var lists_to = pattern_hash[pattern_to];
			pattern_hash[pattern_to].append(pattern_hash[pattern_from]);
			delete pattern_hash[pattern_from];
		});

		var pattern_list = [];
		Object.keys(pattern_hash).forEach(function(pattern) {
			var lists = pattern_hash[pattern];
			var generator = lists.generator;
			// recover superfluous "0" (by "%m" → "%0m" above)
			for (var index = 1; index < generator.length; index += 2) {
				if (typeof generator[index] === 'string') {
					generator[index] = generator[index]
					// "%0m" → "%m"
					.replace(/^%0([md])$/g, '%$1');
				}
			}
			// assert (lists.length > 0)
			pattern_list.push({
				pattern : new RegExp('^' + pattern + '$'),
				generator : new_generator(generator),
				items : lists,
				count : lists.length
			});
		});
		// count 從大到小排序
		pattern_list.sort(function(_1, _2) {
			return _2.count - _1.count;
		});

		return pattern_list;
	}

	_.detect_serial_pattern = detect_serial_pattern;

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//
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
		if (date < this.start[0]) {
			return;
		}

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
			while (end_list[last_index] <= date) {
				last_index++;
			}
			contemporary = contemporary.slice(last_index);
		} else {
			contemporary = [];
		}

		if (date < this.get_end(edge_period)) {
			contemporary.push(edge_period);
		} else if (contemporary.length === 0) {
			return;
		}

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
				[ new Date(2015, 1, 2), new Date(2015, 4, 3), 'aaa' ], ], 0, 1);

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
		get_start = typeof start_index === 'function' ? start_index : function(
				data) {
			return +data[start_index];
		},
		// assert: Number.isFinite(get_end(period_data))
		get_end = typeof end_index === 'function' ? end_index : function(data) {
			var time = +data[end_index];
			return isNaN(time) ? +get_start(data) + unit_length : time;
		};
		if (!(unit_length > 0)) {
			unit_length = ONE_DAY_LENGTH_VALUE;
		}
		// periods.get_start = get_start;
		periods.get_end = get_end;
		// periods.unit = unit_length;

		function add_index(period_data, index) {
			start_list.push([ get_start(period_data), period_data ]);
		}
		if (typeof period_list.forEach === 'function') {
			period_list.forEach(add_index);
		} else {
			for ( var key in period_list) {
				add_index(period_list[key], key);
			}
		}

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
					&& start_time < last_end_list[past_index]) {
				past_index++;
			}
			if (past_index > 0) {
				last_end_list.slice(past_index);
				last_contemporary.slice(past_index);
			}

			if (start_time < last_end) {
				// last_period 與本 period 重疊。將之添入。
				past_index = 0;
				// 因為量應該不大，採循序搜尋。
				while (last_end_list[past_index] <= last_end) {
					past_index++;
				}
				last_end_list.splice(past_index, 0, last_end);
				last_contemporary.splice(past_index, 0, last_period);
			}

			// last_contemporary: 不包含本 period 之本 period 共存 periods。

			if (last_contemporary.length > 0) {
				(contemporary[index] = last_contemporary).end = last_end_list;
			} else {
				last_contemporary = null;
			}
			last_end = get_end(last_period = period[1]);
		});

		periods.get_contemporary = get_contemporary_periods;
		return periods;
	}

	_.sort_periods = sort_periods;

	// ---------------------------------------------------------------------//
	// export 導出.

	library_namespace.set_method(String.prototype, {
		to_Date : set_bind(String_to_Date)
	});

	library_namespace.set_method(Date.prototype, {
		to_Excel : set_bind(Date_to_Excel),

		age : set_bind(age_of, true),
		format : set_bind(Date_to_String)
	});

	return (_// JSDT:_module_
	);
}
