/**
 * @name CeL function for era calendar.
 * @fileoverview 本檔案包含了東亞傳統曆法/中國傳統曆法/曆書/歷譜/帝王紀年/年號紀年，農曆、夏曆、陰曆，中西曆/信史的日期轉換功能。<br />
 *               以歷史上使用過的曆數為準。用意不在推導曆法，而在對過去時間作正確轉換。因此僅用查表法，不作繁複天文計算。
 * 
 * @since 2013/2/13 12:45:44
 * 
 * TODO:<br />
 * 檢查前後相交的記年資料 每個月日數是否相同<br />
 * 歲時記事 幾龍治水、幾日得辛、幾牛耕地、幾姑把蠶、蠶食幾葉
 * http://mathematicsclass.blogspot.tw/2009/06/blog-post_17.html<br />
 * bug: 西漢武帝後元2年<br />
 * 太複雜了，效率不高，重構。<br />
 * 舊唐書/卷11 <span data-era="~">寶應元年</span>..<span data-era="~">二年</span>..<span
 * data-era="~">二月甲午</span>，回紇登裏可汗辭歸蕃。<span data-era="~">三月甲辰</span>朔，襄州右兵馬使梁崇義殺大將李昭，據城自固，仍授崇義襄州刺史、山南東道節度使。<span
 * data-era="~">丁未</span>，袁傪破袁晁之眾於浙東。玄宗、肅宗歸祔山陵。自<span data-era="~">三月一日</span>廢朝，至於<span
 * data-era="~">晦日</span>，百僚素服詣延英門通名起居。<br />
 * CeL.era('二年春正月丁亥朔',{after:'寶應元年'})<br />
 * CeL.era('丁亥朔',{after:'寶應二年春正月'})<br />
 * CeL.era('寶應元年',{period_end:true})<br />
 * CeL.era('嘉慶十六年二月二十四日寅刻')===CeL.era('嘉慶十六年二月二十四日寅時')<br />
 * Period 獨立成 class<br />
 * 南明紹宗隆武1年閏6月月干支!=甲申, should be 癸未<br />
 * 月令別名 http://140.112.30.230/datemap/monthalias.php<br />
 * 月の異称 http://www.geocities.jp/okugesan_com/yougo.html<br />
 * 西周金文紀時術語. e.g., 初吉，既生霸，既望，既死霸
 * (http://wywu.pixnet.net/blog/post/22412573-%E6%9C%88%E7%9B%B8%E8%A8%98%E6%97%A5%E8%A1%A8)
 * 
 * 未來發展：<br />
 * 加入世界各國的對應機能。<br />
 * 加入 國旗
 * 
 * @example <code>


// demo / feature: 較常用、吸引人的特性。

CeL.log('公曆農曆(陽曆陰曆)日期互換:');

var 農曆, 公曆;

// 公曆←農曆特定日期。
農曆 = '農曆2014年1月1日';
公曆 = CeL.era(農曆).format('公元%Y年%m月%d日');
CeL.log(['農曆: ', 農曆, ' → 公曆: ', 公曆]);

// 農曆←公曆特定日期。
公曆 = '公元2014年1月1日';
農曆 = CeL.era({date:公曆.to_Date(), era:'農曆'}).format({parser:'CE',format:'%紀年%年年%月月%日日',locale:'cmn-Hant-TW'});
CeL.log(['公曆: ', 公曆, ' → 農曆: ', 農曆]);

// 今天的農曆日期。
var 今天的農曆日期 = (new Date).format('Chinese');
CeL.log(['今天是農曆: ', 今天的農曆日期]);
今天的農曆日期 = CeL.era({date:new Date, era:'農曆'}).format({parser:'CE',format:'農曆%年(%歲次)年%月月%日日',locale:'cmn-Hant-TW'});
CeL.log(['今天是農曆: ', 今天的農曆日期]);

// 取得公元 415年, 中曆 三月 之 CE Date。
CeL.era.中曆('415年三月');

// CeL.era('') 相當於:
// https://docs.microsoft.com/zh-tw/dotnet/api/system.datetime.parse
// DateTime.Parse("")
// https://support.office.com/en-us/article/datevalue-function-df8b07d4-7761-4a93-bc33-b7471bbff252?omkt=en-US&ui=en-US&rs=en-US&ad=US
// Excel: =DATEVALUE("")



CeL.run('data.date.era', test_era_data);

// era.onload
CeL.env.era_data_load = function(country, queue) {
	if (typeof country === 'object') {
		// 第一次呼叫 callback。
		// 在載入era模組之前設定好，可以用來篩選需要載入的國家。
		// gettext_config:{"id":"china"}
		queue.truncate().push('中國');
		return;
	}

	// assert: 已載入 {String}country
	CeL.log('era data of [' + country + '] loaded.');
	// 判斷是否已載入所有曆數資料。
	if (!queue) {
		CeL.log('All era data loaded.');
		// assert: CeL.era.loaded === true
	}
};


function test_era_data() {
	// 判斷是否已載入所有曆數資料。
	if (!CeL.era.loaded) {
		setTimeout(test_era_data, 80);
		return;
	}
}


// More examples: see /_test suite/test.js


 // should be error: 清任何一個紀年無第一八八〇年。
 '清一八八〇年四月二十一日七時'.to_Date('era').format({parser:'CE',format:'%歲次年%月干支月%日干支日%時干支時',locale:'cmn-Hant-TW'})
 // should be error
 '元一八八〇年四月二十一日七時'.to_Date('era').format({parser:'CE',format:'%歲次年%月干支月%日干支日%時干支時',locale:'cmn-Hant-TW'})



 // ---------------------------------------

 廢棄:

 查找：某 era name → era data:
 1st: [朝代 or 朝代兼紀年] from dynasty{*}
 2ed: [朝代:君主(帝王) list] from dynasty{朝代:{*}}
 3ed: [朝代君主(帝王):紀年 list] from dynasty{朝代:{君主(帝王):[]}}

 查找：某日期 → era data:
 1. get start date: 定 era_start_UTC 所有 day 或之前的 index。
 2. get end date, refrence:
 遍歷 era_end_UTC，處理所有（結束）日期於 day 之後的，即所有包含此日期的 data。


 </code>
 */

'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	name : 'data.date.era',
	// data.code.compatibility. : for String.prototype.repeat(),
	// String.prototype.trim()
	// includes() @ data.code.compatibility.
	require : 'data.code.compatibility.'
	// data.native. : for Array.prototype.search_sorted()
	+ '|data.native.'
	// application.locale. : 中文數字
	+ '|application.locale.'
	// data.date. : 干支
	+ '|data.date.String_to_Date'
	// Maya 需要用到 data.date.calendar。
	+ '|data.date.Julian_day|data.date.calendar.',
	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code,
	// 設定不匯出的子函式。
	// this is a sub module.
	// 完全不 export 至 library_namespace.
	no_extend : '*'
});

function module_code(library_namespace) {

	// requiring
	var String_to_Date = this.r('String_to_Date'), Julian_day = this
			.r('Julian_day');

	// ---------------------------------------------------------------------//
	// basic constants. 定義基本常數。

	// 工具函數。
	function generate_pattern(pattern_source, delete_干支, flag) {
		if (library_namespace.is_RegExp(pattern_source)) {
			if (flag === undefined && ('flags' in pattern_source))
				flag = pattern_source.flags;
			pattern_source = pattern_source.source;
		}
		pattern_source = pattern_source
		// 數字
		.replace(/數/g, '(?:[' + library_namespace
		// "有": e.g., 十有二月。
		.positional_Chinese_numerals_digits + '百千]|[十廿卅]有?)');
		if (delete_干支) {
			pattern_source = pattern_source.replace(/干支\|/g, '');
		} else {
			pattern_source = pattern_source
			// 天干
			.replace(/干/g, '[' + library_namespace.STEM_LIST + ']')
			// 地支
			.replace(/支/g, '[' + library_namespace.BRANCH_LIST + ']');
		}
		return new RegExp(pattern_source, flag || '');
	}

	function to_list(string) {
		if (typeof string === 'string') {
			if (string.includes('|'))
				string = string.split('|');
			else if (string.includes(','))
				string = string.split(',');
			else
				string = string.chars('');
		}
		return string;
	}

	var is_Date = library_namespace.is_Date,

	/**
	 * 把第2個引數陣列添加到第1個引數陣列後面
	 * 
	 * or try Array.prototype.splice()
	 */
	Array_push = Array.prototype.push.apply.bind(Array.prototype.push),

	Date_to_String_parser = library_namespace.Date_to_String.parser,
	//
	strftime = Date_to_String_parser.strftime,

	// copy from data.date.
	/** {Number}一整天的 time 值。should be 24 * 60 * 60 * 1000 = 86400000. */
	ONE_DAY_LENGTH_VALUE = new Date(0, 0, 2) - new Date(0, 0, 1),
	/** {Number}一分鐘的 time 值(in milliseconds)。should be 60 * 1000 = 60000. */
	ONE_MINUTE_LENGTH_VALUE = new Date(0, 0, 1, 0, 2) - new Date(0, 0, 1, 0, 1),

	CE_REFORM_YEAR = library_namespace.Gregorian_reform_date.getFullYear(),

	CE_COMMON_YEAR_LENGTH_VALUE
	//
	= new Date(2, 0, 1) - new Date(1, 0, 1),
	//
	CE_LEAP_YEAR_LENGTH_VALUE = CE_COMMON_YEAR_LENGTH_VALUE
			+ ONE_DAY_LENGTH_VALUE,
	//
	CE_REFORM_YEAR_LENGTH_VALUE = library_namespace
	//
	.is_leap_year(CE_REFORM_YEAR, true) ? CE_LEAP_YEAR_LENGTH_VALUE
			: CE_COMMON_YEAR_LENGTH_VALUE,

	CE_COMMON_YEAR_DATA = Object.seal(library_namespace.get_month_days()),
	//
	CE_LEAP_YEAR_DATA = Object.seal(library_namespace.get_month_days(true)),
	//
	CE_REFORM_YEAR_DATA = library_namespace.get_month_days(CE_REFORM_YEAR),

	// cache
	gettext_date = library_namespace.gettext.date,

	// 專門供搜尋各特殊紀年使用。
	// @see create_era_search_pattern()
	era_search_pattern, era_key_list,

	// search_index[ {String}key : 朝代、君主(帝王)、帝王紀年、年號紀年、國家 ]
	// = Set(對應之 era_list index list)
	// = [ Set(對應之 era_list index list), 'key of search_index',
	// 'key'..
	// ]
	search_index = Object.create(null),

	// constant 常數。

	// http://zh.wikipedia.org/wiki/Talk:%E8%BE%B2%E6%9B%86
	// 將公元日時換算為夏曆日時，1929年1月1日以前，應將時間換為北京紫禁城（東經116.4度）實際時間，1929年1月1日開始，則使用東八區（東經120度）的標準時間。
	DEFAULT_TIMEZONE = String_to_Date.zone.CST,

	// http://zh.wikipedia.org/wiki/%E7%AF%80%E6%B0%A3
	// 中氣持續日期/前後範疇。
	中氣日_days = 3,
	// 中氣發生於每月此日起 (中氣日_days - 1) 日間。
	// assert: 在整個作業年代中，此中氣日皆有效。起碼須包含
	// proleptic Gregorian calendar -1500 – 2100 CE。
	中氣日 = [ 19, 18, 20, 19, 20, 20, 22, 22, 22, 22, 21, 20 ],

	/** {Number}未發現之index。 const: 基本上與程式碼設計合一，僅表示名義，不可更改。(=== -1) */
	NOT_FOUND = ''.indexOf('_'),

	// 起始年月日。年月日 starts form 1.
	// 基本上與程式碼設計合一，僅表示名義，不可更改。
	START_YEAR = 1, START_MONTH = 1, START_DATE = 1,

	// 閏月名前綴。
	// 基本上與程式碼設計合一，僅表示名義，不可更改。
	// TODO: 閏或潤均可
	LEAP_MONTH_PREFIX = '閏',

	// (年/月分資料=[年分各月資料/月分日數])[NAME_KEY]=[年/月分名稱]
	NAME_KEY = 'name', LEAP_MONTH_KEY = 'leap',
	// 月次，歲次
	START_KEY = 'start',
	// 起始日名/起始日碼/起始日期名
	START_DATE_KEY = 'start date',
	//
	MONTH_NAME_KEY = 'month name',
	//
	MINUTE_OFFSET_KEY = 'minute offset',

	COUNT_KEY = 'count',

	// 亦用於春秋戰國時期"周諸侯國"分類
	PERIOD_KEY = '時期',
	//
	PERIOD_PREFIX = 'period:',
	//
	PERIOD_PATTERN = new RegExp('^' + PERIOD_PREFIX + '(.+)$'),
	// 日期連接號。 e.g., "–".
	// 減號"-"與太多符號用途重疊，因此不是個好的選擇。
	PERIOD_DASH = '–',

	// set normal month count of a year.
	// 月數12: 每年有12個月.
	LUNISOLAR_MONTH_COUNT = 12,

	// 可能出現的最大日期值。
	MAX_DATE_NUMBER = 1e5,

	// 二進位。
	// 基本上與程式碼設計合一，僅表示名義，不可更改。
	RADIX_2 = 2,

	/**
	 * parseInt( , radix) 可處理之最大 radix， 與 Number.prototype.toString ( [ radix ] )
	 * 可用之最大基數 (radix, base)。<br />
	 * 10 Arabic numerals + 26 Latin alphabet.
	 * 
	 * @inner
	 * @see <a href="http://en.wikipedia.org/wiki/Hexadecimal"
	 *      accessdate="2013/9/8 17:26">Hexadecimal</a>
	 */
	PACK_RADIX = 10 + 26,

	LEAP_MONTH_PADDING = new Array(
	// 閏月會有 LUNISOLAR_MONTH_COUNT 個月 + 1個閏月 筆資料。
	(LUNISOLAR_MONTH_COUNT + 1).toString(RADIX_2).length + 1).join(0),

	// 每年月數資料的固定長度。
	// 依當前實作法，最長可能為長度 4。
	YEAR_CHUNK_SIZE = parseInt(
	// 為了保持應有的長度，最前面加上 1。
	'1' + new Array(LUNISOLAR_MONTH_COUNT).join(
	// 農曆通常是大小月相間。
	'110').slice(0, LUNISOLAR_MONTH_COUNT + 1)
	// 13 個月可以二進位 1101 表現。
	+ (LUNISOLAR_MONTH_COUNT + 1).toString(RADIX_2), RADIX_2)
	//
	.toString(PACK_RADIX).length,

	PACKED_YEAR_CHUNK_PADDING = new Array(
	// using String.prototype.repeat
	YEAR_CHUNK_SIZE + 1).join(' '),

	// 篩選出每年月數資料的 pattern。
	CALENDAR_DATA_SPLIT_PATTERN = new RegExp('[\\s\\S]{1,'
	// 或可使用: /[\s\S]{4}/g
	+ YEAR_CHUNK_SIZE + '}', 'g'),

	// date_data 0/1 設定。
	// 農曆一個月是29日或30日。
	// long month / short month
	大月 = 30, 小月 = 29,
	// length of the months
	// 0:30, 1:29
	// 注意:會影響到 parse_era()!
	// 基本上與程式碼設計合一，僅表示名義，不可更改。
	MONTH_DAYS = [ 大月, 小月 ],

	// month length / month days: 公曆大月為31天。
	// 僅表示名義，不可更改。
	CE_MONTH_DAYS = 31,

	// 所有所處理的曆法中，可能出現的每月最大日數。
	// now it's CE.
	MAX_MONTH_DAYS = CE_MONTH_DAYS,

	MONTH_DAY_INDEX = Object.create(null),

	// 辨識曆數項。
	// 基本上與程式碼設計合一，不可更改。
	// 見 extract_calendar_data()
	// [ all, front, date_name, calendar_data, back ]
	// 曆數_PATTERN =
	// /(?:([;\t]|^))(.*?)=?([^;\t=]+)(?:([;\t]|$))/g,
	//
	// [ all, date_name, calendar_data, back ]
	曆數_PATTERN = /(.*?)=?([^;\t=]+)([;\t]|$)/g,
	// 以最快速度測出已壓縮曆數。
	// 見 initialize_era_date()
	已壓縮曆數_PATTERN = /^(?:[\d\/]*=)?[\da-z]{3}[\da-z ]*$/,

	// matched: [ , is_閏月, 月序/月分號碼 ]
	// TODO: 11冬月, 12臘月.
	// TODO: [閏後]
	MONTH_NAME_PATTERN = /^([閏闰])?([正元]|[01]?\d)月?$/,

	干支_PATTERN = generate_pattern(/^干支$/),

	年_SOURCE =
	// 年分名稱。允許"嘉慶十八年癸酉"之類表"嘉慶十八年癸酉歲"。
	/([前\-−‐]?\d{1,4}|干支|前?數{1,4}|元)[\/.\-年]\s*(?:(?:歲次)?干支\s*)?/
	//
	.source,
	// 月分名稱。
	月_SOURCE = /\s*([^\s\/.\-年月日]{1,20})[\/.\-月]/.source,
	// 日期名稱。
	日_SOURCE = /\s*初?(\d{1,2}|數{1,3}|[^\s日朔晦望]{1,5})日?/.source,

	// 四季, 四時
	季_LIST = to_list('春夏秋冬'),
	// ⛱️,☀️
	季_Unicode = to_list('🌱,😎,🍂,⛄'),
	// 季名稱。e.g., 春正月
	季_SOURCE = '[' + 季_LIST + ']?王?',

	孟仲季_LIST = to_list('孟仲季'),

	// see: numeralize_time()
	時刻_PATTERN = generate_pattern(
	// '(?:[早晚夜])'+
	/(支)(?:時?\s*([初正])([初一二三123])刻|時)/),

	// should matched: 月|年/|/日|月/日|/月/日|年/月/|年/月/日
	// ^(年?/)?月/日|年/|/日|月$
	// matched: [ , 年, 月, 日 ]
	// TODO: 11冬月, 12臘月.
	起始日碼_PATTERN =
	// [日朔晦望]
	/^(-?\d+|元)?[\/.\-年]([閏闰]?(?:[正元]|[01]?\d))[\/.\-月]?(?:(初?\d{1,2}?|[正元])日?)?$/
	//
	,

	// e.g., 滿洲帝國, 中華民國
	國_PATTERN = /^(.*[^民帝])國$/,

	// [ , 名稱 ]
	名稱加稱號_PATTERN = /^(.{2,})(?:天皇|皇后)$/,

	// 取得/保存前置資訊。
	前置_SOURCE = '^(.*?)',
	// 取得/保存後置資訊。
	後置_SOURCE = '(.*?)$',

	// NOT: 測試是否全為數字，單純只有數字用。
	// 測試是否為單一中文數字字元。
	單數字_PATTERN = generate_pattern(/^數$/),

	// 當前的 ERA_DATE_PATTERN 必須指明所求年/月/日，無法僅省略日。
	// 否則遇到'吳大帝太元元年1月1日'之類的無法處理。
	// 若有非數字，干支之年分名稱，需要重新設計！
	// matched: [ , prefix, year, month, date, suffix ]
	ERA_DATE_PATTERN = generate_pattern(前置_SOURCE + 年_SOURCE + 季_SOURCE
			+ 月_SOURCE + 日_SOURCE + 後置_SOURCE),

	// 減縮版 ERA_DATE_PATTERN: 省略日期，或亦省略月分。 ERA_DATE_PATTERN_NO_DATE
	ERA_DATE_PATTERN_ERA_ONLY
	// matched: [ , prefix, year, numeral month, month, suffix ]
	= generate_pattern(前置_SOURCE + 年_SOURCE + 季_SOURCE
	// 月分名稱。參考 (月_SOURCE)。
	+ /\s*(?:([01]?\d)|([^\s\/.\-年月日]{1,20})月)?/.source + 後置_SOURCE),

	// 減縮版 ERA_DATE_PATTERN: parse 年分 only。
	// matched: [ , prefix, year, , , suffix ]
	ERA_DATE_PATTERN_YEAR = generate_pattern(前置_SOURCE
	// 年分名稱。
	+ /([前\-−‐]?\d{1,4}|干支|前?數{1,4})[\/.\-年]?()()/.source + 後置_SOURCE),

	// 用來測試如 "一八八〇"
	POSITIONAL_DATE_NAME_PATTERN = new RegExp('^['
			+ library_namespace.positional_Chinese_numerals_digits + ']{1,4}$'),

	ERA_PATTERN =
	//
	/^([東西南北前後]?\S)(.{1,3}[祖宗皇帝王君公侯伯叔主子后])(.{0,8})(?:([一二三四五六七八九十]{1,3})年)?/
	//
	,

	持續日數_PATTERN = /^\s*\+\d+\s*$/,

	// [ 紀年曆數, 起始日期名, 所參照之紀年或國家 ]
	參照_PATTERN = /^(?:(.*?)=)?:(.+)$/,

	// 可指示尚存疑/爭議資料，例如傳說時代/神話之資料。
	// https://en.wikipedia.org/wiki/Circa
	// c., ca or ca. (also circ. or cca.), means "approximately" in
	// several European languages including English, usually in
	// reference to a date.
	//
	// r. can be used to designate the ruling period of a person in
	// dynastic power, to distinguish from his or her lifespan.
	準確程度_ENUM = {
		// 資料尚存有爭議或疑點
		疑 : '尚存疑',
		// 為傳說時代/神話之資料
		傳說 : '傳說時代'
	},

	主要索引名稱 = to_list('紀年,君主,朝代,國家'),

	// 配合 parse_era() 與 get_next_era()。
	// 因為須從範圍小的開始搜尋，因此範圍小的得排前面！
	紀年名稱索引值 = {
		era : 0,
		紀年 : 0,
		// gettext_config:{"id":"era-date"}
		"年號" : 0,
		// 紀年法: 日本年號, 元号/年号
		元号 : 0,

		// 稱號
		// 統治者, 起事者, 國家最高領導人, 國家元首, 作亂/起辜/起義領導者, 民變領導人, 領袖, 首領
		君主 : 1,
		// monarch, ruler
		ruler : 1,
		// 君主姓名
		君主名 : 1,
		// 君主字,小字(乳名)
		表字 : 1,
		帝王 : 1,
		總統 : 1,
		// 天皇名
		天皇 : 1,
		// 自唐朝以後，廟號在前、諡號在後的連稱方式，構成已死帝王的全號。
		// 唐朝以前的皇帝有廟號者較少，所以對歿世的皇帝一般簡稱諡號，如漢武帝、隋明帝，不稱廟號。唐朝以後，由於皇帝有廟號者佔絕大多數，所以多稱廟號，如唐太宗、宋太宗等。
		// NG: 謚號
		諡 : 1,
		諱 : 1,
		称号 : 1,
		廟號 : 1,
		// 尊號: 君主、后妃在世時的稱呼。不需避諱
		// 尊號 : 1,
		封號 : 1,
		分期 : 1,
		// for 琉球國
		// 童名常有重複
		// 童名 : 1,
		神號 : 1,

		君主性別 : 1,

		// dynasty
		朝代 : 2,
		政權 : 2,
		國號 : 2,
		// 王國名
		國名 : 2,

		// 王朝, 王家, 帝國, Empire

		// state 州
		// Ancient Chinese states
		// https://en.wikipedia.org/wiki/Ancient_Chinese_states
		//
		// 諸侯國名
		諸侯國 : 2,
		// 歷史時期 period. e.g., 魏晉南北朝, 五代十國
		// period : 2,
		時期 : 2,

		// country
		// e.g., 中國, 日本
		國家 : 3
	// territory 疆域
	// nation
	// 民族 : 3
	// 地區, 區域. e,g, 中亞, 北亞, 東北亞
	},

	Period_屬性歸屬 = Object.assign({
		// 君主出生日期
		生 : 1,
		// 君主逝世/死亡日期, 天子駕崩/諸侯薨
		卒 : 1,
		// 君主在位期間: 上任/退位, 執政,君主統治,統治,支配
		在位 : 1
	}, 紀年名稱索引值),

	// era data refrence 對應
	// sorted by: start Date 標準時間(如UTC+8) → parse_era() 插入順序.
	/** {Array}按照起始時間排列的所有紀年列表 */
	era_list = [],

	// era tree.
	// period_root[國家]
	// = 次階層 Period
	period_root = new Period,

	// default date parser.
	// 採用 'Chinese' 可 parse 日干支。
	DEFAULT_DATE_PARSER = 'Chinese',
	// 不使用 parser。
	PASS_PARSER = [ 'PASS_PARSER' ],
	// 標準時間分析器名稱（如公元）
	// gettext_config:{"id":"common-era"}
	standard_time_parser_name = '公元',
	// 標準時間分析器（如公元紀年日期）, 標準紀年時間
	standard_time_parser = 'CE',
	// default date format
	// 基本上與程式碼設計合一，不可更改。
	DATE_NAME_FORMAT = '%Y/%m/%d',
	// pass to date formatter.
	standard_time_format = {
		parser : standard_time_parser,
		format : DATE_NAME_FORMAT
	}, standard_year_format = {
		parser : standard_time_parser,
		format : '%Y年'
	},

	// @see get_era_name(type)

	// 基本上僅表示名義。若欲更改，需考慮對外部程式之相容性。
	SEARCH_STRING = 'dynasty',
	//
	WITH_PERIOD = 'period', WITH_COUNTRY = 'country',

	// 年名後綴
	POSTFIX_年名稱 = '年',

	// 十二生肖，或屬相。
	// Chinese Zodiac
	十二生肖_LIST = to_list('鼠牛虎兔龍蛇馬羊猴雞狗豬'),
	// Chinese Zodiac in Unicode, 表情符號/圖畫文字/象形字
	十二生肖圖像文字_LIST = to_list('🐁🐄🐅🐇🐉🐍🐎🐑🐒🐓🐕🐖'),
	// 陰陽五行
	// The Wu Xing, (五行 wŭ xíng) also known as the Five
	// Elements, Five
	// Phases, the Five Agents, the Five Movements, Five
	// Processes, and
	// the Five Steps/Stages
	陰陽五行_LIST = to_list('木火土金水'),

	// @see https://zh.wikipedia.org/wiki/%E5%8D%81%E4%BA%8C%E5%BE%8B
	// 十二月律
	// 黃鐘之月:十一月子月
	// 蕤賓 or 蕤賔 http://sidneyluo.net/a/a05/016.htm 晉書 卷十六 ‧ 志第六 律歷上
	月律_LIST = to_list('太簇,夾鐘,姑洗,仲呂,蕤賓,林鐘,夷則,南呂,無射,應鐘,黃鐘,大呂'),

	// 各月の別名, 日本月名
	// https://ja.wikipedia.org/wiki/%E6%97%A5%E6%9C%AC%E3%81%AE%E6%9A%A6#.E5.90.84.E6.9C.88.E3.81.AE.E5.88.A5.E5.90.8D
	月の別名_LIST = to_list('睦月,如月,弥生,卯月,皐月,水無月,文月,葉月,長月,神無月,霜月,師走'),
	// '大安赤口先勝友引先負仏滅'.match(/../g)
	六曜_LIST = to_list('大安,赤口,先勝,友引,先負,仏滅'),
	// 七曜, 曜日. ㈪-㈰: ㈰㈪㈫㈬㈭㈮㈯. ㊊-㊐: ㊐㊊㊋㊌㊍㊎㊏
	七曜_LIST = to_list('日月火水木金土'),
	// "十二值位星"（十二值:建除十二神,十二值位:十二建星） @ 「通勝」或農民曆
	// 建、除、滿、平、定、執、破、危、成、收、開、閉。
	// http://jerry100630902.pixnet.net/blog/post/333011570-%E8%AA%8D%E8%AD%98%E4%BD%A0%E7%9A%84%E5%A2%83%E7%95%8C~-%E9%99%BD%E6%9B%86%E3%80%81%E9%99%B0%E6%9B%86%E3%80%81%E9%99%B0%E9%99%BD%E5%90%88%E6%9B%86---%E7%AF%80%E6%B0%A3-
	// 十二建星每月兩「建」，即正月建寅、二月建卯、三月建辰……，依此類推。正月為寅月，所以六寅日（甲寅、丙寅、戊寅、庚寅、壬寅）中必須有兩個寅日和「建」遇到一起；二月為卯月，所以六卯日（乙卯、丁卯、己卯、辛卯、癸卯）中必須有兩個卯日和「建」遇到一起，否則就不對。逢節（立春、驚蜇、清明、立夏、芒種、小暑、立秋、白魯、寒露、立冬、大雪、小寒）兩個建星相重，這樣才能保證本月第一個與月支相同之日與「建」相遇。
	十二直_LIST = to_list('建除満平定執破危成納開閉'),
	// "廿八星宿" @ 農民曆: 東青龍7北玄武7西白虎7南朱雀7
	// It will be splitted later.
	// jp:角亢氐房心尾箕斗牛女虚危室壁奎婁胃昴畢觜参井鬼柳星張翼軫
	// diff: 虚, 参
	// 因始於中國，採中國字。
	二十八宿_LIST = '角亢氐房心尾箕斗牛女虛危室壁奎婁胃昴畢觜參井鬼柳星張翼軫',
	// 二十八宿にあり二十七宿にはない宿は、牛宿である。
	// It will be splitted and modified later.
	二十七宿_LIST = 二十八宿_LIST.replace(/牛/, ''),
	// 旧暦（太陽太陰暦）における月日がわかれば、自動的に二十七宿が決定される。
	// 各月の朔日の宿
	二十七宿_offset = to_list('室奎胃畢參鬼張角氐心斗虛'),
	// 六十甲子納音 / 納音五行
	// 《三命通會》《論納音取象》
	// http://ctext.org/wiki.pl?if=gb&chapter=212352
	納音_LIST = to_list('海中,爐中,大林,路旁,劍鋒,山頭,澗下,城頭,白蠟,楊柳,井泉,屋上,霹靂,松柏,長流,'
	// 0 – 59 干支序轉納音: 納音_LIST[index / 2 | 0]; '/2': 0,1→0; 2,3→1; ...
	+ '砂中,山下,平地,壁上,金泊,覆燈,天河,大驛,釵釧,桑柘,大溪,沙中,天上,石榴,大海'),
	// It will be splitted later.
	九星_LIST = '一白水星,二黑土星,三碧木星,四綠木星,五黃土星,六白金星,七赤金星,八白土星,九紫火星',
	// '一白水星,二黒土星,三碧木星,四緑木星,五黄土星,六白金星,七赤金星,八白土星,九紫火星'
	九星_JP_LIST = to_list(九星_LIST.replace(/黑/, '黒').replace(/綠/, '緑').replace(
			/黃/, '黄'));

	// ---------------------------------------------------------------------//
	// 初始調整並規範基本常數。

	九星_LIST = to_list(九星_LIST);

	(function() {
		var a = [ 2, 1 ];
		Array_push(a, [ 4, 3 ]);
		if (a.join(',') !== "2,1,4,3")
			Array_push = function(array, list) {
				return Array.prototype.push.apply(array, list);
			};

		a = library_namespace.Gregorian_reform_date;
		a = [ a.getFullYear(), a.getMonth() + 1, a.getDate() ];
		if (CE_REFORM_YEAR_LENGTH_VALUE > CE_COMMON_YEAR_LENGTH_VALUE
				&& a[1] < 3 && library_namespace
				//
				.is_different_leap_year(a[0], true))
			CE_REFORM_YEAR_LENGTH_VALUE = CE_COMMON_YEAR_LENGTH_VALUE,
					CE_REFORM_YEAR_DATA[1]--;
		var d = library_namespace.Julian_shift_days(a);
		CE_REFORM_YEAR_LENGTH_VALUE += d * ONE_DAY_LENGTH_VALUE;
		CE_REFORM_YEAR_DATA[a[1] - 1] += d;
		// TODO: 無法處理 1582/10/15-30!!

		Object.seal(CE_REFORM_YEAR_DATA);

		二十八宿_LIST = to_list(二十八宿_LIST);
		to_list('蛟龍貉兔狐虎豹獬牛蝠鼠燕豬貐狼狗雉雞烏猴猿犴羊獐馬鹿蛇蚓')
		// https://zh.wikisource.org/wiki/演禽通纂_(四庫全書本)/全覽
		// 角木蛟〈蛇父雉母細頸上白嬰四脚〉亢金龍 氐土狢
		// 房日兎 心月狐 尾火虎〈為暗禽〉
		// 箕水豹〈為暗禽〉 斗木獬 牛金牛
		// 女土蝠 虚日䑕 危月燕
		// 室火猪 壁水㺄 奎木狼
		// 婁金狗 胃土雉 昴日雞〈為明禽〉
		// 畢月烏 嘴火猴 參水猿
		// 井木犴 鬼金羊 柳土獐
		// 星日馬 張月鹿 翼火蛇
		// 軫水蚓
		.forEach(function(動物, index) {
			二十八宿_LIST[index]
			// starts from '角木蛟'
			+= 七曜_LIST[(index + 4) % 七曜_LIST.length] + 動物;
		});

		a = 二十七宿_offset;
		// d = 二十七宿_LIST.length;
		// 二十七宿_offset[m] 可得到 m月之 offset。
		二十七宿_offset = new Array(START_MONTH);
		a.forEach(function(first) {
			二十七宿_offset.push(二十七宿_LIST.indexOf(first) - START_DATE);
		});

		二十七宿_LIST = to_list(二十七宿_LIST);

		// 為納音配上五行。
		if (false) {
			'金火木土金火水土金木水土火木水金火木土金火水土金木水土火木水'
			// 六十甲子納音 / 納音五行
			.replace(/(.)/g, function($0, 五行) {
				var index = '火木水土金'.indexOf(五行);
				return index === -1 ? $0 : index;
			});
			// "401340234123012401340234123012"
			// 401340234123012
			// 401 340 234 123 012
			// 456 345 234 123 012
		}

		a = '火木水土金';
		a += a;
		for (d = 納音_LIST.length; d-- > 0;)
			// "% 15": 30個 → 15個 loop : 0 – 14
			納音_LIST[d] += a.charAt(4 - ((d % 15) / 3 | 0) + (d % 3));
	})();

	if (false)
		// assert: this is already done.
		主要索引名稱.forEach(function(name, index) {
			紀年名稱索引值[name] = index;
		});

	// 預設國家。
	// parse_era.default_country = '中國';

	// clone MONTH_DAYS
	parse_era.days = [];

	parse_era.chunk_size = YEAR_CHUNK_SIZE;

	MONTH_DAYS.forEach(function(days, index) {
		MONTH_DAY_INDEX[days] = index;
		parse_era.days.push(days);
	});

	// ---------------------------------------------------------------------//
	// private tool functions. 工具函數

	// search_index 處理。search_index public interface。
	// TODO: 增加效率。
	// search_index 必須允許以 ({String}key in search_index)
	// 的方式來偵測是否具有此 key。
	function for_each_era_of_key(key, operator, queue) {
		// 預防循環參照用。
		function not_in_queue(key) {
			if (!queue.has(key)) {
				queue.add(key);
				return true;
			}
			library_namespace.debug('skip [' + eras[i] + ']. (queue: ['
					+ queue.values() + '])', 1, 'for_each_era_of_key');
		}

		var eras = search_index[key],
		//
		for_single = function(era) {
			if (not_in_queue(era))
				operator(era);
		};

		if (!library_namespace.is_Set(queue))
			queue = new Set;
		// assert: queue is Set.

		// era: Era, Set, []
		if (Array.isArray(eras)) {
			eras[0].forEach(for_single);

			for (var i = 1; i < eras.length; i++)
				if (not_in_queue(eras[i]))
					for_each_era_of_key(eras[i], operator, queue);
		} else
			eras.forEach(for_single);
	}

	// bug: 當擅自改變子紀年時，將因 cache 而無法得到正確的 size。
	function era_count_of_key(key, queue) {
		var eras = search_index[key],
		//
		size = ('size' in eras) && eras.size;

		if (!size && Array.isArray(eras)) {
			size = eras[0].size;

			if (Array.isArray(queue)) {
				if (queue.includes(key)) {
					library_namespace.debug(
					// 將造成之後遇到此 key 時，使 for_each_era_of_key() 不斷循環參照。
					'別名設定存在循環參照！您應該改正別名設定: ' + queue.join('→') + '→' + key, 1,
							'era_count_of_key');
					return 0;
				}
				queue.push(key);
			} else
				queue = [ key ];
			for (var i = 1; i < eras.length; i++)
				size += era_count_of_key(eras[i], queue);
			eras.size = size;
		}

		return size;
	}

	// 取得以 key 登錄之所有 era。
	// get era Set of {String}key
	function get_era_Set_of_key(key, no_expand) {
		var eras = search_index[key];

		if (Array.isArray(eras)) {
			if (no_expand)
				// eras[0]: 所有僅包含 key 的 era Set。
				return eras[0];
			if (eras.cache)
				eras = eras.cache;
			else {
				var i = 1, length = eras.length,
				// 不動到 search_index
				set = library_namespace.Set_from_Array(eras[0]);
				for (; i < length; i++)
					for_each_era_of_key(eras[i], function(era) {
						// console.log(String(era));
						set.add(era);
					});
				eras.cache = set;
				eras = set;
			}
		}

		return eras;
	}

	// 為取得單一 era。否則應用 to_era_Date()。
	function get_era(name) {
		if (name instanceof Era) {
			return name;
		}

		var list = search_index[name];
		if (!list) {
			return;
		}

		if (Array.isArray(list)) {
			// assert: list = [ {Set}, {String}alias ]
			if (list.length === 1) {
				list = list[0];
			} else if (list.length === 2 && library_namespace.is_Set(list[0])
					&& list[0].size === 0) {
				return get_era(list[1]);
			} else {
				return;
			}
		}

		var era;
		if (library_namespace.is_Set(list)) {
			if (list.size !== 1)
				return;
			list.forEach(function(_era) {
				era = _era;
			});
		} else {
			// list is {Era}
			era = list;
		}
		return era;
	}

	// 登錄 key，使 search_index[key] 可以找到 era。
	// 可處理重複 key 之情況，而不覆蓋原有值。
	function add_to_era_by_key(key, era) {
		if (!key || !era || key === era)
			return;

		var eras = search_index[key];
		if (!eras)
			// 初始化 search_index[key]。
			if (typeof era !== 'string') {
				// search_index[]: Set, [原生 Set, alias String 1,
				// alias
				// String 2, ..]
				(search_index[key] = eras = library_namespace
						.Set_from_Array(Array.isArray(era)
						// era: Era, string, []
						? era : [ era ])).origin = true;
				return;

			} else
				(search_index[key] = eras = new Set).origin = true;

		if (era instanceof Era) {
			if (Array.isArray(eras)) {
				// .size, .cache 已經不準。
				delete eras.size;
				delete eras.cache;
				// 添加在原生 Set: 名稱本身即為此 key。
				eras = eras[0];
			}
			eras.add(era);

			// else assert: typeof era==='string'
		} else if (Array.isArray(eras)) {
			eras.push(era);
			// .size, .cache 已經不準。
			delete eras.size;
			delete eras.cache;
		} else
			(search_index[key] = eras = [ eras, era ]).origin = true;
	}

	function append_period(object, name) {
		var start = object.start,
		// 處理精度
		format = object.精 === '年' ? standard_year_format : standard_time_format;
		name.push(' (', (is_Date(start) ? start : new Date(start))
				.format(format),
		// @see CeL.date.parse_period.PATTERN
		// [\-–~－—─～〜﹣至]
		'~', new Date(object.end
		// 向前一天以取得最後一日。
		// 並非萬全之法?
		- ONE_DAY_LENGTH_VALUE).format(format), ')');
	}

	// ---------------------------------------------------------------------//
	// bar 工具函數。

	// TODO: comparator()
	// sorted_array: sorted by .[start_key]
	function order_bar(sorted_array, start_key, end_key, comparator) {
		if (sorted_array.length === 0)
			return [];

		if (!start_key)
			// .start
			start_key = 'start';
		if (!end_key)
			// .end
			end_key = 'end';

		var bars = [], all_end = -Infinity,
		// 置入最後欲回傳的階層。
		layer = [ bars ];

		function settle(do_reset) {
			// clear. 結清。
			// 寫入/紀錄階層序數。

			if (bars.length > 1) {
				// sort 前一區間。
				// TODO: 若有接續前後者的，酌加權重。
				bars.sort(function(a, b) {
					// 大→小。
					return b.weight - a.weight;
				});

				if (do_reset)
					layer.push(bars = []);
			}
		}

		sorted_array.forEach(function(object) {
			var bar,
			//
			start = object[start_key], end = object[end_key];

			if (start < all_end) {
				// 有重疊。

				if (bars.length === 1 && bars[0].length > 1) {
					// 先結清一下前面沒重疊的部分，只擠出最後一個元素。
					// bars : last bar
					bars = bars[0];
					// bar : 最後一個元素。
					bar = bars.pop();
					bars.end = bars.at(-1).end;
					bars.weight -= bar.end - bar.start;
					// 重建新的 bar。
					(bars = [ bar ]).weight -= bar.end - bar.start;
					bars.end = bar.end;
					// 置入最後欲回傳的階層。
					layer.push(bars = [ bars ]);
					// reset
					bar = null;
				}

				// 取 bar 之 end 最接近 object.start 者。
				var
				// 最接近間距。
				closest_gap = Infinity,
				// 最接近之 bar index。
				closest_index = undefined;

				bars.forEach(function(bar, i) {
					var gap = start - bar.end;
					if (gap === 0 || 0 < gap && (
					// TODO: comparator()
					closest_index === undefined
					//
					|| gap < end - start ? gap < closest_gap
					// 當 gap 極大時，取不同策略。
					: bar.end - bar.start - gap
					//
					< bars[closest_index].end - bars[closest_index].start
					//
					- closest_gap)) {
						closest_gap = gap;
						closest_index = i;
					}
				});

				if (closest_index !== undefined)
					bar = bars[closest_index];

			} else {
				settle(true);
				bar = bars[0];
			}

			// start = 本 object 之 weight。
			start = end - start;
			// 將本 object 加入 bars 中。
			if (bar) {
				bar.push(object);
				bar.weight += start;
			} else {
				// 初始化。
				bars.push(bar = [ object ]);
				bar.weight = start;
			}
			bar.end = end;

			if (all_end < end)
				all_end = end;
		});

		settle();
		layer[start_key] = sorted_array[0][start_key];
		layer[end_key] = all_end;

		return layer;
	}

	// TODO: comparator
	// sorted_array: sorted by .[start_key]
	function order_bar_another_type(sorted_array, start_key, end_key) {
		if (sorted_array.length === 0)
			return [];

		if (!start_key)
			start_key = 'start';
		if (!end_key)
			end_key = 'end';

		var bars = [], all_end = -Infinity,
		// 最後欲回傳的階層。
		layer = [ [] ];

		function settle() {
			if (bars.length > 0) {
				// clear. 結清。
				// 寫入/紀錄階層序數。

				var layer_now;

				if (bars.length === 1) {
					layer_now = layer[0];
					bars[0].forEach(function(object) {
						layer_now.push(object);
					});

				} else {
					// sort 前一區間。
					// TODO: 若有接續前後者的，酌加權重。
					bars.sort(function(a, b) {
						// 大→小。
						return b.weight - a.weight;
					});

					bars.forEach(function(bar, i) {
						layer_now = layer[i];
						if (!layer_now)
							layer_now = layer[i] = [];
						bar.forEach(function(object) {
							layer_now.push(object);
						});
					});
				}

				// reset
				bars = [];
			}
		}

		sorted_array.forEach(function(object) {
			var bar,
			//
			start = object[start_key], end = object[end_key];

			if (start < all_end) {
				// 有重疊。
				// 取 bar 之 end 最接近 object.start 者。
				var
				// 最接近間距。
				closest_gap = Infinity,
				// 最接近之 bar index。
				closest_index = undefined;

				bars.forEach(function(bar, i) {
					var gap = start - bar.end;
					if (gap < closest_gap && 0 <= gap) {
						closest_gap = gap;
						closest_index = i;
					}
				});

				if (closest_index !== undefined)
					bar = bars[closest_index];

			} else
				settle();

			// start = 本 object 之 weight。
			start = end - start;
			// 將本 object 加入 bars 中。
			if (bar) {
				bar.push(object);
				bar.weight += start;
			} else {
				// 初始化。
				bars.push(bar = [ object ]);
				bar.weight = start;
			}
			bar.end = end;

			if (all_end < end)
				all_end = end;
		});

		settle();

		return layer;
	}

	// ---------------------------------------------------------------------//

	// 時期/時段 class。
	function Period(start, end) {
		// {Integer}
		this.start = start;
		// {Integer}
		this.end = end;
		// this.sub[sub Period name] = sub Period
		this.sub = Object.create(null);
		// 屬性值 attributes
		// e.g., this.attributes[君主名] = {String}君主名
		this.attributes = Object.create(null);

		// .name, .parent, .level: see Period.prototype.add_sub()

		// 階層序數: 0, 1, 2..
		// see get_periods()
		// this.bar = [ [], [], ..];
	}

	Period.is_Period = function(value) {
		return value.constructor === Period;
	};

	Period.prototype.add_sub = function(start, end, name) {
		var sub;
		if (typeof start === 'object' && start.start) {
			sub = start;
			name = end;
		} else
			sub = new Period(start, end);

		if (!name)
			name = sub.name;

		// 若子 period/era 之時間範圍於原 period (this) 外，
		// 則擴張原 period 之時間範圍，以包含本 period/era。
		if (!(this.start <= sub.start))
			this.start = sub.start;
		if (!(sub.end <= this.end))
			this.end = sub.end;

		this.sub[name] = sub;
		// {String}
		sub.name = name;
		sub.parent = this;
		sub.level = (this.level | 0) + 1;
		// return this;
		return sub;
	};

	Period.prototype.toString = function(type) {
		var name = this.name;
		if (!name)
			name = '[class Period]';
		else if (type === WITH_PERIOD) {
			append_period(this, name = [ name ]);
			name = name.join('');
		}
		return name;
	};

	// ---------------------------------------------------------------------//
	// 處理農曆之工具函數。

	/**
	 * 正規化名稱，盡量將中文數字、漢字數字轉為阿拉伯數字。
	 * 
	 * @param {String}number_String
	 *            中文數字。
	 * 
	 * @returns {String}數字化名稱
	 */
	function normalize_number(number_String) {
		number_String = String(number_String).trim()
		//
		.replace(/([十廿卅])有/g, '$1')
		// ㋀㋁㋂㋃㋄㋅㋆㋇㋈㋉㋊㋋
		.replace(/[㋀-㋋]/g, function($0) {
			return ($0.charCodeAt(0) - START_INDEX_0月) + '月';
		})
		// ㏠㏡㏢㏣㏤㏥㏦㏧㏨㏩㏪㏫㏬㏭㏮㏯㏰㏱㏲㏳㏴㏵㏶㏷㏸㏹㏺㏻㏼㏽㏾
		.replace(/[㏠-㏾]/g, function($0) {
			return ($0.charCodeAt(0) - START_INDEX_0日) + '日';
		});

		return library_namespace.Chinese_numerals_Formal_to_Normal(
		// "有": e.g., 十有二月。
		library_namespace.normalize_Chinese_numeral(number_String));
	}

	// 處理 square symbols
	// http://unicode.org/cldr/utility/list-unicodeset.jsp?a=[%E3%8B%80-%E3%8B%8B%E3%8F%A0-%E3%8F%BE%E3%8D%98-%E3%8D%B0]
	var START_INDEX_0月 = '㋀'.charCodeAt(0) - 1, START_INDEX_0日 = '㏠'
			.charCodeAt(0) - 1, START_INDEX_0時 = '㍘'.charCodeAt(0);

	/**
	 * 正規化日期名稱，盡量將中文數字、漢字數字轉為阿拉伯數字。
	 * 
	 * @param {String}number_String
	 *            中文數字年/月/日。
	 * 
	 * @returns {String}數字化日期名稱
	 */
	function numeralize_date_name(number_String, no_alias) {
		if (!number_String)
			return number_String === 0 ? 0 : '';

		number_String = String(number_String).trim();

		// 處理元年, [閏闰]?[正元]月, 初日
		if (!no_alias)
			number_String = number_String.replace(/^初/, '')
			// 初吉即陰曆初一朔日。
			.replace(/[正元吉]$/, 1)
			// TODO: 統整月令別名。
			.replace(/冬$/, 10).replace(/臘$/, 11)
			// e.g., '前104' (年) → -104
			.replace(/^前/, '-');
		else if (/正$/.test(number_String))
			// 最起碼得把會當作數字的處理掉。
			return number_String;

		return POSITIONAL_DATE_NAME_PATTERN.test(number_String)
		//
		? library_namespace.from_positional_Chinese_numeral(number_String)
		//
		: library_namespace.from_Chinese_numeral(number_String);
	}

	/**
	 * 正規化時間名稱，盡量將中文數字、漢字數字轉為阿拉伯數字。
	 * 
	 * 至順治二年（公元1645年）頒行時憲曆後，改為日96刻，每時辰八刻（初初刻、初一刻、初二刻、初三刻、正初刻、正一刻、正二刻、正三刻）。自此每刻15分，無「四刻」之名。
	 * 
	 * @param {String}time_String
	 *            中文數字時間。
	 * 
	 * @returns {String}數字化時間名稱
	 */
	function numeralize_time(time_String) {
		time_String = String(time_String).trim()
		// 時刻 to hour
		.replace(時刻_PATTERN, function($0, 時, 初正, 刻) {
			return (2
			//
			* library_namespace.BRANCH_LIST.indexOf(時)
			//
			- (初正 === '初' ? 1 : 0)) + '時'
			//
			+ (刻 && (刻 = isNaN(刻)
			//
			? '初一二三'.indexOf(刻) : +刻) ? 15 * 刻 + '分' : '');
		});

		// ㍘㍙㍚㍛㍜㍝㍞㍟㍠㍡㍢㍣㍤㍥㍦㍧㍨㍩㍪㍫㍬㍭㍮㍯㍰
		time_String.replace(/[㍘-㍰]/g, function($0) {
			return ($0.charCodeAt(0) - START_INDEX_0時) + '時';
		});

		return time_String;
	}

	/**
	 * 檢查是否可能是日數。
	 * 
	 * @param {String}string
	 *            欲檢查之字串。
	 * 
	 * @returns {Boolean}可能是日數。
	 */
	function maybe_month_days(string) {
		// 因為得考慮月中起始的情況，因此只檢查是否小於最大可能之日數。
		return string <= MAX_MONTH_DAYS;
	}

	// 解壓縮日數 data 片段。
	function extract_calendar_slice(calendar_data_String, date_name, 閏月名) {
		if (maybe_month_days(calendar_data_String))
			return [ date_name, calendar_data_String ];

		var calendar_data = calendar_data_String
		// TODO: 除此 .split() 之外，盡量不動到這些過於龐大的資料…戯言。
		// http://jsperf.com/chunk-vs-slice
		// JavaScript 中 split 固定長度比 .slice() 慢。
		.match(CALENDAR_DATA_SPLIT_PATTERN),
		//
		calendar_data_Array = [], initial_month = date_name || '';

		if (initial_month.includes('/')) {
			initial_month = initial_month.split('/');
			// 須考慮特殊情況。
			if (initial_month.length === 2 && !initial_month[0])
				// e.g., '/2': should be 1/1/2.
				initial_month = null;
			else
				// 一般情況。 e.g., 2/3/4, 2/3
				initial_month = initial_month[1];
		}
		// assert: initial_month && typeof initial_month === 'string'

		if (calendar_data.length === 0) {
			library_namespace.error('extract_calendar_slice: 無法辨識日數資料 ['
					+ calendar_data_String + ']！');
			return [ date_name, calendar_data_String ];
		}

		calendar_data.forEach(function(year_data) {
			year_data = parseInt(year_data, PACK_RADIX).toString(RADIX_2)
					.slice(1);

			var year_data_Array = [], leap_month_index, leap_month_index_list;

			// LUNISOLAR_MONTH_COUNT 個月 + 1個閏月 = 13。
			while (year_data.length > LUNISOLAR_MONTH_COUNT + 1) {
				leap_month_index = parseInt(
				// 閏月的部分以 4 (LEAP_MONTH_PADDING.length) 個二進位數字指示。
				year_data.slice(-LEAP_MONTH_PADDING.length), RADIX_2);
				year_data = year_data.slice(0, -LEAP_MONTH_PADDING.length);

				if (leap_month_index_list) {
					library_namespace
							.error('extract_calendar_slice: 本年有超過1個閏月！');
					leap_month_index_list.unshift(leap_month_index);
				} else
					leap_month_index_list = [ leap_month_index ];
			}

			leap_month_index
			// assert: 由小至大。
			= leap_month_index_list
			// 僅取最小的 1個閏月。
			&& leap_month_index_list.sort()[0];

			if (initial_month
			// && initial_month != START_MONTH
			) {
				if (閏月名)
					// 正規化閏月名。
					initial_month = initial_month.replace(閏月名,
							LEAP_MONTH_PREFIX);
				if (initial_month === LEAP_MONTH_PREFIX)
					initial_month += leap_month_index;

				if (initial_month = initial_month.match(MONTH_NAME_PATTERN)) {

					if (initial_month[1]
					//
					|| leap_month_index < initial_month[2]) {
						if (initial_month[1]) {
							if (initial_month[2] != leap_month_index)
								library_namespace
										.error('extract_calendar_slice: 起始閏月次['
												+ initial_month[2]
												+ '] != 日數資料定義之閏月次['
												+ leap_month_index + ']！');
							// 由於已經在起頭設定閏月或之後起始，
							// 因此再加上閏月的指示詞，會造成重複。
							leap_month_index = null;
						}

						// 閏月或之後起始，須多截1個。
						initial_month[2]++;
					}

					initial_month = initial_month[2] - START_MONTH;

					if (!(0 <= (leap_month_index -= initial_month)))
						leap_month_index = null;

					// 若有起始月分，則會 truncate 到起始月分。
					// 注意：閏月之 index 是 padding 前之資料。
					year_data = year_data.slice(initial_month);

					// 僅能使用一次。
					initial_month = null;
				}
			}
			year_data = to_list(year_data);

			year_data.forEach(function(month_days) {
				year_data_Array.push(
				//
				(leap_month_index === year_data_Array.length
				//
				? LEAP_MONTH_PREFIX + '=' : '') + MONTH_DAYS[month_days]);
			});

			calendar_data_Array.push(year_data_Array
					.join(pack_era.month_separator));
		});

		return [ date_name, calendar_data_Array.join(pack_era.year_separator) ];
	}

	// 解壓縮日數 data。
	function extract_calendar_data(calendar_data, era) {
		return calendar_data.replace(曆數_PATTERN,
		// replace slice
		function(all, date_name, calendar_data, back) {
			calendar_data = extract_calendar_slice(calendar_data, date_name,
					era && era.閏月名);
			return (calendar_data[0] ? calendar_data.join('=')
					: calendar_data[1])
					+ back;
		});
	}

	// date_Array = [ 年, 月, 日 ]
	function numeralize_date_format(date_Array, numeral) {
		return [ gettext_date.year(date_Array[0], numeral),
				gettext_date.month(date_Array[1], numeral),
				gettext_date.date(date_Array[2], numeral) ];
	}

	function split_era_name(name) {
		if (name = name.trim().match(ERA_PATTERN))
			return {
				朝代 : name[1],
				君主 : name[2],
				// 紀年/其他
				紀年 : name[3],
				// 日期名稱
				日期 : name[4]
			};
	}

	// ---------------------------------------------------------------------//

	// 紀年 class。
	function Era(properties, previous) {
		for ( var property in properties)
			this[property] = properties[property];
	}

	// 當紀年名稱以這些字元結尾時，接上日期(年月日)時就會多添加上空格。
	// ": "Casper", include [[en:Thai (Unicode block)]]
	var NEED_SPLIT_CHARS = /a-zA-Z\d\-,'"\u0E00-\u0E7F/.source,
	//
	NEED_SPLIT_PREFIX = new RegExp(
	//
	'^[' + NEED_SPLIT_CHARS + ']'),
	//
	NEED_SPLIT_POSTFIX = new RegExp(
	//
	'[' + NEED_SPLIT_CHARS.replace('\\d', '') + ']$'),
	//
	REDUCE_PATTERN = new RegExp('([^' + NEED_SPLIT_CHARS + ']) ([^'
			+ NEED_SPLIT_CHARS.replace('\\d', '') + '])', 'g');

	// 把紀年名稱與日期連接起來，並且在有需要的時候添加上空格。
	// 警告: 會改變 name_with_date_Array!
	// @return {String}
	function concat_era_name(name_with_date_Array) {
		name_with_date_Array.forEach(function(slice, index) {
			var _slice = String(slice).trim();
			if (index > 0 && NEED_SPLIT_PREFIX.test(_slice)
			//
			&& NEED_SPLIT_POSTFIX.test(name_with_date_Array[index - 1])) {
				// 為需要以 space 間隔之紀元名添加 space。
				_slice = ' ' + _slice;
			}
			if (_slice !== slice)
				name_with_date_Array[index] = _slice;
		});
		return name_with_date_Array.join('');
	}

	// remove needless space in the era name
	function reduce_era_name(name) {
		return name.trim()
		// 去除不需要以 space 間隔之紀元名中之 space。
		.replace(REDUCE_PATTERN, '$1$2');
	}

	// <a
	// href="http://big5.huaxia.com/zhwh/wszs/2009/12/1670026.html"
	// accessdate="2013/5/2 19:46">《中國歷史紀年表》解惑</a>
	// 謚號紀年的方法是：國號——帝王謚號——年號(無年號者不用)——年序號，如漢惠帝五年，梁武帝大同八年。
	// 自唐朝開始，改紀年方式為國號——帝王廟號——年號——年序號。如唐高宗永徽四年，清世宗雍正八年等。
	function get_era_name(type) {
		var name = this.name;
		if (type === SEARCH_STRING)
			// 搜尋時，紀年顯示方法："紀年 (朝代君主(帝王), 國家)"
			// e.g., "元始 (西漢平帝劉衍, 中國)"
			return name[紀年名稱索引值.紀年] + ' (' + (name[紀年名稱索引值.朝代] || '')
					+ (name[紀年名稱索引值.君主] || '') + ', ' + name[紀年名稱索引值.國家] + ')';

		if (!name.cache) {
			// 基本上不加國家名稱。
			// name → [ 朝代, 君主, 紀年 ]
			name = name.slice(0, 3).reverse();

			// 對重複的名稱作適當簡略調整。
			if (name[0] && name[0].includes(name[2])
			//
			|| name[1] && name[1].includes(name[2]))
				name[2] = '';
			if (name[1]) {
				// 處理如周諸侯國之類。
				// 例如 魯國/魯昭公 → 魯昭公
				var matched = name[0].match(國_PATTERN);
				if (name[1].startsWith(matched ? matched[1] : name[0]))
					name[0] = '';
			}

			if (type === WITH_PERIOD)
				append_period(this, name);

			this.name.cache = reduce_era_name(name.join(' '));
			name = this.name;
		}

		return type === WITH_COUNTRY ? [ this.name[紀年名稱索引值.國家], name.cache ]
				: name.cache;
	}

	// ---------------------------------------
	// 月次，歲次或名稱與序號 (index) 之互換。

	// 歲序(index: start from 0)
	// →歲次(ordinal/serial/NO № #序數: start with START_YEAR)
	// →歲名(name)
	function year_index_to_name(歲序) {
		var 歲名 = this.calendar[NAME_KEY];
		if (!歲名 || !(歲名 = 歲名[歲序])) {
			歲名 = 歲序 + (START_KEY in this.calendar
			//
			? this.calendar[START_KEY] : START_YEAR);
			if (this.skip_year_0 && 歲名 >= 0)
				歲名++;
		}
		return 歲名;
	}

	// (歲名 name→)
	// 歲次(ordinal/serial/NO: start with START_YEAR)
	// →歲序(index of year[]: start from 0)
	function year_name_to_index(歲名) {
		if (!歲名)
			return;

		var 歲序 = this.calendar[NAME_KEY];
		if (!歲序 || (歲序 = 歲序.indexOf(歲名)) === NOT_FOUND) {
			歲名 = numeralize_date_name(歲名);

			if (isNaN(歲名)) {
				// 可能只是 to_era_Date() 在作測試，看是否能成功解析。
				if (library_namespace.is_debug())
					library_namespace.error(
					//
					'year_name_to_index: 紀年 [' + this + '] '
					//
					+ (歲序 ? '沒有[' + 歲名 + ']年！' : '不具有特殊名稱設定！'));
				return;
			}

			if (this.skip_year_0 && 歲名 > 0)
				歲名--;

			歲序 = 歲名 - (START_KEY in this.calendar
			//
			? this.calendar[START_KEY] : START_YEAR);
		}
		return 歲序;
	}

	// 月序(index: start from 0)
	// →月次(ordinal/serial/NO: start with START_MONTH)
	// →月名(name)
	function month_index_to_name(月序, 歲序) {
		歲序 = this.calendar[歲序];
		var 月名 = 歲序[NAME_KEY];
		// 以個別命名的月名為第一優先。
		if (!月名 || !(月名 = 月名[月序])) {
			月名 = 月序 + (START_KEY in 歲序 ? 歲序[START_KEY] : START_MONTH);

			if (this.歲首序 && (月名 += this.歲首序) > LUNISOLAR_MONTH_COUNT)
				月名 -= LUNISOLAR_MONTH_COUNT;
		}

		// 依 month_index_to_name() 之演算法，
		// 若為閏月起首，則 [START_KEY] 須設定為下一月名！
		// e.g., 閏3月起首，則 [START_KEY] = 4。
		if (月序 >= 歲序[LEAP_MONTH_KEY]) {
			if (!isNaN(月名) && --月名 < START_MONTH)
				// 確保月數為正。
				月名 += LUNISOLAR_MONTH_COUNT;
			if (月序 === 歲序[LEAP_MONTH_KEY]) {
				// 是為閏月。
				月名 = (this.閏月名 || LEAP_MONTH_PREFIX) + 月名;
			}
		}
		return 月名;
	}

	// (月名 name→)
	// 月次(ordinal/serial/NO: start with START_MONTH)
	// →月序(index of month[]: start from 0)
	function month_name_to_index(月名, 歲序) {
		if (!月名 || !(歲序 in this.calendar))
			return;

		var is_閏月, 歲_data = this.calendar[歲序], 月序 = 歲_data[NAME_KEY],
		// (閏月序) 與 [LEAP_MONTH_KEY] 皆為 (index of month[])！
		// 若當年 .start = 3，並閏4月，則 (閏月序 = 2)。
		閏月序 = 歲_data[LEAP_MONTH_KEY];

		if (!月序 || (月序
		// 以個別命名的月名為第一優先。
		= 月序.indexOf(numeralize_date_name(月名, true))) === NOT_FOUND) {

			月名 = String(numeralize_date_name(月名));

			if (this.閏月名)
				// 正規化閏月名。
				月名 = 月名.replace(this.閏月名, LEAP_MONTH_PREFIX);

			if (!isNaN(is_閏月 = this.歲首序))
				月名 = 月名.replace(/\d+/, function(month) {
					if ((month -= is_閏月) < 1)
						month += LUNISOLAR_MONTH_COUNT;
					return month;
				});

			if (月名 === LEAP_MONTH_PREFIX) {
				if (isNaN(月序 = 閏月序)) {
					// 可能只是 to_era_Date() 在作測試，看是否能成功解析。
					if (library_namespace.is_debug())
						library_namespace.warn(
						//
						'month_name_to_index: 紀年 [' + this + '] 之 ['
								+ this.歲名(歲序) + ']年沒有閏月！');
					return;
				}

			} else if ((月序 = String(numeralize_date_name(月名)))
			// 直接用 String(numeralize_date_name(月名)).match()
			// 在 Chrome 中可能造成值為 null。
			// e.g., 北魏孝武帝永興1年12月 曆譜
			&& (月序 = 月序.match(MONTH_NAME_PATTERN))) {
				is_閏月 = 月序[1];
				月序 = 月序[2] - (START_KEY in 歲_data
				//
				? 歲_data[START_KEY] : START_MONTH);
				// 閏月或之後，月序++。
				if (is_閏月 || 月序 >= 閏月序)
					月序++;

				if (is_閏月 && 月序 !== 閏月序) {
					// 可能只是 to_era_Date() 在作測試，看是否能成功解析。
					if (library_namespace.is_debug())
						library_namespace.warn(
						//
						'month_name_to_index: 紀年 [' + this + '] 之 ['
								+ this.歲名(歲序) + ']年沒有 [' + 月名 + ']月'
								+ (閏月序 ? '，只有' + this.月名(閏月序, 歲序) + '月' : '')
								+ '！');
					return;
				}

			} else {
				// 可能只是 to_era_Date() 在作測試，看是否能成功解析。
				if (library_namespace.is_debug())
					library_namespace.warn('month_name_to_index: 紀年 ['
							+ this
							+ '] 之 ['
							+ this.歲名(歲序)
							+ ']年'
							+ (歲_data[NAME_KEY] ? '不具有特殊月分名稱設定！' : '沒有月分名稱['
									+ 月名 + ']！'));
				return;
			}
		}

		return 月序;
	}

	// 日序轉成日名。
	// [ 日名, 月名, 歲名 ]
	function date_index_to_name(日序, 月序, 歲序, 日序_only) {
		if (月序 < 0 || this.calendar[歲序].length <= 月序)
			if (月序 = this.shift_month(月序, 歲序)) {
				歲序 = 月序[1];
				月序 = 月序[0];
			} else
				return;

		日序 += 月序 === 0 && (START_DATE_KEY in this.calendar[歲序])
		// 若當年首月有設定起始日名/起始日碼，則使用之。
		? this.calendar[歲序][START_DATE_KEY]
		// 不採 this.calendar[START_DATE_KEY]
		// : 月序 === 0 && 歲序 === 0 && (START_DATE_KEY in this.calendar)
		//
		// ? this.calendar[START_DATE_KEY]
		//
		: START_DATE;

		return 日序_only ? 日序 : [ 日序, this.月名(月序, 歲序), this.歲名(歲序) ];
	}

	// 日名轉成日序。
	function date_name_to_index(日名, 首月採用年序) {
		if (!isNaN(日名
		//
		= numeralize_date_name(日名))) {
			// 不採 this.calendar[START_DATE_KEY]
			日名 -= ((首月採用年序 in this.calendar)
			//
			&& (START_DATE_KEY in (首月採用年序 = this.calendar[首月採用年序]))
			//
			? 首月採用年序[START_DATE_KEY] : START_DATE);
		}
		return 日名;
	}

	// 取得 (歲序)年，與 (月數) 個月之後的月序與歲序。
	function shift_month(月數, 歲數, 基準月) {
		if (Array.isArray(月數))
			基準月 = 月數, 月數 = 歲數 = 0;
		else {
			if (isNaN(月數 |= 0))
				月數 = 0;
			if (Array.isArray(歲數))
				基準月 = 歲數, 歲數 = 0;
			else {
				if (isNaN(歲數 |= 0))
					歲數 = 0;
				if (!Array.isArray(基準月))
					基準月 = [ 0, 0 ];
			}
		}

		// 基準月: [ 月序, 歲序, 差距月數 ]
		var 月序 = (基準月[0] | 0) + 月數,
		//
		歲序 = 基準月[1] | 0,
		//
		差距月數 = (基準月[2] | 0) + 月數;

		if (歲數 > 0)
			while (歲數 > 0 && 歲序 < this.calendar.length)
				歲數--, 差距月數 += this.calendar[歲序++].length;
		else
			while (歲數 < 0 && 歲序 > 0)
				歲數++, 差距月數 -= this.calendar[歲序--].length;

		if (月序 > 0)
			while (true) {
				if (歲序 >= this.calendar.length) {
					if (library_namespace.is_debug())
						// 可能是孝徳天皇之類，期間過短，又嘗試
						// get_month_branch_index()
						// 的。
						library_namespace.error('shift_month: 已至 [' + this
								+ '] 曆數結尾，無可資利用之月分資料！');
					差距月數 = NaN;
					歲序--;
					break;
				}
				月數 = this.calendar[歲序].length;
				if (月序 < 月數)
					break;
				歲序++;
				月序 -= 月數;
			}
		else
			while (月序 < 0) {
				if (--歲序 < 0) {
					if (library_namespace.is_debug())
						library_namespace.error('shift_month: 已至 [' + this
								+ '] 曆數起頭，無可資利用之月分資料！');
					差距月數 = NaN;
					歲序 = 0;
					break;
				}
				月序 += this.calendar[歲序].length;
			}

		基準月[0] = 月序;
		基準月[1] = 歲序;
		基準月[2] = 差距月數;
		return !isNaN(差距月數) && 基準月;
	}

	// date index of era → Date
	function date_index_to_Date(歲序, 月序, 日序, strict) {
		if (!this.shift_month(歲序 = [ 月序, 歲序 ]))
			return;
		// 差距日數
		月序 = 歲序[0];
		歲序 = 歲序[1];
		日序 |= 0;

		var date = this.year_start[歲序],
		//
		i = 0, calendar = this.calendar[歲序];
		// TODO: use Array.prototype.reduce() or other method
		for (; i < 月序; i++)
			日序 += calendar[i];

		date += 日序 * ONE_DAY_LENGTH_VALUE;
		if (strict && this.end - date < 0)
			// 作邊界檢查。
			return;
		return new Date(date);
	}

	/**
	 * parse date name of calendar data.
	 * 
	 * @param {String}date_name
	 *            date name
	 * @returns [ 年名, 月名, 起始日碼 ]
	 */
	function parse_calendar_date_name(date_name) {
		if (!date_name)
			return [];

		// matched: [ , 年, 月, 日 ]
		var matched = date_name.match(/^\/(\d+)$/);
		date_name = matched ? [ , , matched[1] ]
		//
		: (matched = date_name.match(起始日碼_PATTERN)) ? matched.slice(1)
				: date_name.split('/');
		// 得考慮有特殊月名的情況，因此不可採
		// (name === LEAP_MONTH_PREFIX ||
		// MONTH_NAME_PATTERN.test(name))
		// 之類的測試方式。
		if (date_name.length === 1)
			// 月名
			date_name = [ , date_name[0] ];
		if (date_name.length > 3)
			library_namespace.warn('parse_calendar_date_name: 日碼 ['
					+ date_name.join('/') + '].length = ' + date_name.length
					+ '，已過長！');

		date_name.forEach(function(name, index) {
			date_name[index] = numeralize_date_name(name);
		});

		// 正規化月名。
		if ((matched = date_name[1]) && typeof matched === 'string')
			if (matched = matched.match(MONTH_NAME_PATTERN))
				// 去空白與"月"字。
				date_name[1] = (matched[1] || '') + matched[2];
			else if (library_namespace.is_debug()
					&& date_name[1] !== LEAP_MONTH_PREFIX)
				library_namespace.warn(
				//
				'parse_calendar_date_name: 特殊月名: [' + date_name[1] + ']');

		return date_name;
	}

	function clone_year_data(year_data, clone_to) {
		if (!clone_to)
			clone_to = year_data.slice();
		[ START_KEY, LEAP_MONTH_KEY
		// , NAME_KEY
		]
		//
		.forEach(
		// 複製本年之月 START_KEY, LEAP_MONTH_KEY 等。
		function(key) {
			if (key in year_data) {
				var value = year_data[key];
				clone_to[key] = Array.isArray(value) ? value.slice() : value;
			}
		});
		return clone_to;
	}

	// 需在設定完個別 this_year_data 之月名後，才作本紀年泛用設定。
	function add_month_name(月名_Array, this_year_data) {
		var name_Array = this_year_data[NAME_KEY],
		//
		leap = this_year_data[LEAP_MONTH_KEY], start;
		if (start = this_year_data[START_KEY])
			start -= START_MONTH;
		else
			start = 0;

		if (!Array.isArray(name_Array))
			if (isNaN(leap)) {
				if (Array.isArray(月名_Array)) {
					// this_year_data = clone_year_data(this_year_data);
					this_year_data[NAME_KEY] = start ? 月名_Array.slice(start)
							: 月名_Array;
				}
				return;
			} else {
				// this_year_data = clone_year_data(this_year_data);
				name_Array = this_year_data[NAME_KEY] = [];
			}

		月名_Array.forEach(function(名, index) {
			if (0 <= (index -= start)) {
				if (leap <= index) {
					if (leap === index && !(index in name_Array)
							&& 月名_Array[index + start - 1])
						name_Array[index]
						// 閏月使用上一 index 月名。
						= 月名_Array[index + start - 1];
					// index 為閏月或之後，則使用在下一 index 之月名。
					index++;
				}
				// 不作覆蓋。
				if (名 && !(index in name_Array))
					name_Array[index] = 名;
			}
		});
	}

	function is_正統(era, key) {
		// assert: era.正統 === undefined || typeof era.正統 === 'string' ||
		// Array.isArray(era.正統)
		return era.正統 && (era.正統 === true
		// 採用"正統"方法，可避免某些情況下因「挑選最後結束之紀年」之演算法，造成最後無可供參照之紀年。
		// 但這需要手動測試每一種參照 key，並依測試結果添加。非萬全之道。
		|| key && era.正統.includes(key));
	}

	var important_properties = {
		精 : true,
		準 : true,
		曆法 : true
	};
	// 複製當前參照紀年之重要屬性至本紀年。
	// 注意: 由於這會在 initialize_era_date()，產生曆譜時才會執行，
	// 因此像是展示時間線圖時並不具有這些屬性。若紀年本身沒設定非準確屬性，則會當作準確紀年來顯示。
	function copy_important_properties(from_era, to_era) {
		for ( var property in important_properties) {
			if (!(property in from_era)) {
				continue;
			}
			var value = from_era[property];
			if (property in to_era) {
				// 可能是本紀年自己的，可能是從其他參照紀年獲得的。
				if (to_era[property] !== value
						&& important_properties[property]) {
					library_namespace.warn('copy_important_properties: '
							+ '紀年 [' + to_era + '] 原有重要屬性 [' + property
							+ '] 為"' + to_era[property] + '"，與所參照紀年 ['
							+ from_era + '] 之屬性值"' + value + '" 不同！');
				}
				continue;
			}
			library_namespace.debug('複製當前參照紀年之重要屬性 [' + property + '] = '
					+ value, 1, 'copy_important_properties');
			to_era[property] = value;
		}
	}

	// parse_era() 之後，初始化/parse 紀年之月分日數 data。
	// initialize era date.
	function initialize_era_date() {
		// IE 需要 .getTime()：IE8 以 new Date(Date object) 會得到 NaN！
		var days,
		/**
		 * {Date}本紀年的起始時間。
		 */
		start_time = this.start.getTime(),
		// 當前年分之各月資料 cache。calendar_data[this year]。
		this_year_data,
		//
		紀年曆數 = this.calendar, this_end = this.end.getTime(),

		// 最後將作為 this.year_start 之資料。
		year_start_time = [ start_time ],
		// 最後將作為 this.calendar 之資料。
		// (年/月分資料=[年分各月資料/月分日數])[NAME_KEY]=[年/月分名稱],
		// [START_KEY] = start ordinal,
		// [LEAP_MONTH_KEY] = leap month index.
		calendar_data = [],

		//
		年序, 月序;

		start_time = new Date(start_time);

		// ---------------------------------------

		if (!紀年曆數 || typeof 紀年曆數 !== 'string') {
			library_namespace.error('initialize_era_date: 無法辨識曆數資料！');
			return;
		}

		if ((月序 = 紀年曆數.match(參照_PATTERN))
		// [ 紀年曆數, 起始日期名, 所參照之紀年或國家 ]
		&& ((年序 = 月序[2]) in search_index
		//
		|| (年序 in String_to_Date.parser
		//
		&& 年序 in Date_to_String_parser))) {
			var 曆法 = 年序,
			// [ 年名, 月名, 起始日碼 ]
			date_name = parse_calendar_date_name(月序[1]);
			library_namespace.debug(this + ': 參照紀年或國家 [' + 曆法 + '] 之曆數。', 2);

			// 處理紀年曆數所設定之起始年名：基本上僅允許年分不同。
			// 其他月名，日數皆得與起訖時間所設定的相同。
			// 年名應可允許 '0' 與負數。
			if (date_name[0] !== '' && !isNaN(date_name[0])
			//
			&& (date_name[0] |= 0) !== START_YEAR)
				// 複製本年之 START_KEY。
				calendar_data[START_KEY] = date_name[0];

			if (曆法 in search_index) {
				// ---------------------------------------

				/**
				 * e.g., test: <code>

				CeL.era.set('古曆|-60~1230|-61/=:中國');
				CeL.era('古曆9年');

				 * </code>
				 * 
				 * <code>

				CeL.set_debug(6);
				CeL.era.set('古曆|Egyptian:-571/11~-570|:Egyptian|準=年');

				CeL.Log.clear();
				CeL.era('古曆2年1月').format({parser:'CE',format:'%Y/%m/%d'});

				 * </code>
				 */

				// CeL.era.set('古曆|-60~80|-60/=:中國');CeL.era('古曆1年');
				// CeL.era.set('古曆|25/2/17~27|:中國');CeL.era('古曆1年');
				// CeL.era.set('古曆|-60~1230|-61/=:中國');CeL.era('古曆249年');
				// CeL.era.set('古曆|-57~-48|-58/=:中國');//CeL.era('古曆-58年');
				// CeL.era.set('古曆|-54~-48|-55/=:中國');//CeL.era('古曆-55年');
				// n='古曆',sy=-55;CeL.era.set(n+'|'+(sy+1)+'~'+(sy+10)+'|'+sy+'/=:中國');//CeL.era(n+sy+'年');
				// CeL.era.set('古曆|901~1820|900/=:中國');
				// CeL.era('古曆54年1月').format({parser:'CE',format:'%Y/%m/%d'});
				// CeL.era.dates('古曆901年',{year_limit:2000,date_only:true});
				this.參照紀年 = 曆法;

				var tmp,
				// 所有候選紀年。
				// assert: 不會更動到候選紀年之資料。
				era_Array = [],

				// 當前參照之紀年。
				era,
				// 當前參照紀年之 date 指標。
				date_index,
				// era_year_data: 當前參照紀年之當前年分各月資料。
				era_year_data,
				// for lazy evaluation.
				correct_month_count,
				// 校正 this_year_data 之月份數量:
				// 參照紀元引入的可能只能用到 10月，但卻具足了到 12月的資料。
				// 此時需要先將後兩個月的資料剔除，再行 push()。
				// tested:
				// 百濟汾西王1年
				// 成漢太宗建興1年
				// 新羅儒禮尼師今7年
				correct_month = function(月中交接) {
					// 參照紀元 era 之參照月序。
					var era_month =
					// 參考 month_name_to_index()
					(era_year_data[START_KEY] || START_MONTH) + 月序;
					if ((LEAP_MONTH_KEY in era_year_data)
					//
					&& era_year_data[LEAP_MONTH_KEY] < 月序)
						era_month--;

					var month_diff
					//
					= (this_year_data[START_KEY] || START_MONTH)
					// 當前月序
					+ this_year_data.length;
					if ((LEAP_MONTH_KEY in this_year_data)
					//
					&& this_year_data[LEAP_MONTH_KEY] < month_diff)
						month_diff--;

					if (月中交接
					// 之前已經有東西，並非處在第一個月，「月中交接」才有意義。
					&& this_year_data.length > 0)
						month_diff--;

					// 減去參照紀元 era 之參照月序
					month_diff -= era_month;

					if (!library_namespace.is_debug())
						return;

					if (month_diff > 0) {
						library_namespace.debug('引入 [' + era + '] 前，先刪掉年序 '
								+ (calendar_data.length - 1) + ' 之 '
								+ month_diff + ' 個月份。 ('
								+ this_year_data.length + ' - ' + month_diff
								+ ')', 1, 'initialize_era_date.correct_month');
						this_year_data.length -= month_diff;
					} else if (month_diff === -1 ?
					// 若是當前 this_year_data 的下一個月為閏月，
					// 亦可能出現 (month_diff = -1) 的情況。
					// 這時得避免亂噴警告。
					era_year_data[LEAP_MONTH_KEY] !== 月序
					//
					|| this_year_data[LEAP_MONTH_KEY] >= 0
					//
					&& this_year_data[LEAP_MONTH_KEY]
					//
					!== this_year_data.length :
					// 差太多了。
					month_diff < -1)
						library_namespace.warn(
						//
						'initialize_era_date.correct_month: 建構途中之曆數資料，與當前正欲參照之紀元 ['
								+ era + '] 間，中斷了 ' + (-month_diff) + ' 個月份！');
				},
				// 當無須改變最後一年曆數，例如已在年尾時，不再複製。
				clone_last_year = function(月中交接) {
					if (!correct_month_count) {
						correct_month(月中交接);
						return;
					}

					var tmp = calendar_data.length - 1;
					if (calendar_data[tmp][COUNT_KEY]) {
						this_year_data = calendar_data[tmp];
						this_year_data.length
						//
						= this_year_data[COUNT_KEY]
						//
						+= correct_month_count;

						correct_month(月中交接);
						return;
					}

					tmp = calendar_data.pop();
					calendar_data.push(this_year_data
					// 初始化本年曆數。
					= tmp.slice(0, correct_month_count));
					this_year_data[COUNT_KEY] = correct_month_count;
					if (tmp.月名)
						this_year_data.月名 = tmp.月名
								.slice(0, correct_month_count);

					clone_year_data(tmp, this_year_data);
					// 複製 era 之[NAME_KEY]。
					if (NAME_KEY in tmp)
						this_year_data[NAME_KEY] = tmp[NAME_KEY].slice(0,
								correct_month_count);

					// 去除標記。
					correct_month_count = null;

					correct_month(月中交接);
				},
				// 處理月中換日的情況，複製本年本月之月分名稱與本月日數。
				copy_date = function(本月日數) {
					var 月名 = era_year_data[NAME_KEY];
					if (月名 && (月名 = 月名[月序])) {
						if (!(NAME_KEY in this_year_data))
							// 初始化本年之月分名稱。
							this_year_data[NAME_KEY] = [];
						library_namespace.debug(
						//
						'複製本年本月之月分名稱。月序' + 月序 + '，本月現有 '
						//
						+ this_year_data.length + '個月。', 3);
						this_year_data[NAME_KEY][
						//
						this_year_data.length] = 月名;
					}

					this_year_data.push(本月日數);
					// 本月已處理完，將月序指向下一個月。
					月序++;
				};

				// 初始化:取得所有候選紀年列表。
				tmp = start_time.getTime();
				for_each_era_of_key(曆法, function(era) {
					if (// era !== this &&
					era.start - this_end < 0
					// 有交集(重疊)才納入。
					&& tmp - era.end < 0 && (era.year_start
					// 篩選合宜的紀年。
					|| !參照_PATTERN.test(era.calendar)))
						era_Array.push(era);
				}
				// .bind(this)
				);

				// sort by era start time.
				era_Array.sort(compare_start_date);
				library_namespace.debug('[' + this + '] 參照紀年 key [' + 曆法
						+ ']: 共有 ' + era_Array.length + ' 個候選紀年。', 1,
						'initialize_era_date');
				library_namespace.debug('候選紀年列表: [' + era_Array
				//
				.join('<span style="color:#c50;">|</span>') + ']。', 2,
						'initialize_era_date');

				// 因為 parse_calendar_date_name() 與 .日名()
				// 得到相反次序的資料，因此需要轉回來。因為有些項目可能未指定，因此不能用 .reverse()。
				tmp = date_name[0];
				date_name[0] = date_name[2];
				date_name[2] = tmp;

				/**
				 * 參照紀年之演算機制：定 this.year_start 與 this.calendar 之過程。
				 * <dl>
				 * <dt>查找下一參照紀元。</dt>
				 * <dd>優先取用：
				 * <ul>
				 * <li>在(前紀元.end)之時間點，前後紀元之日、月名稱相同，或可銜接。</li>
				 * <li>挑選最後結束之紀年，(後紀元.end)越後面者。較後結束的能減少轉換次數。<br />
				 * 但這方法在魏蜀吳會出問題。以採用"正統"方法迴避。</li>
				 * <li>恰好銜接(前紀元.end === 後紀元.start)。否則取用有重疊的部分之紀元。</li>
				 * </ul>
				 * </dd>
				 * <dt>確定交接日序、日名。</dt>
				 * <dt>處理年中分割，更替時間點不在本年年首的情況。</dt>
				 * <dd>分割點於本月中間而不在首尾，重疊部分本月之日數，以後一使用紀元為準。<br />
				 * 分割點於本年中間之月首，而不在本年首尾。複製本年接下來每月之曆數。</dd>
				 * <dt>盡可能以複製參照的方式，複製整年之暦數。</dt>
				 * <dt>若已是最後一個紀年，則表示完成暦數參照。跳出。</dt>
				 * <dt>設定下一輪必要的初始參數，以及正確之月序。</dt>
				 * </dl>
				 * 須考量僅有幾日的情形，並盡可能利用原有之曆數。
				 */

				// main copy loop
				while (true) {
					/**
					 * 查找下一參照紀元。
					 */

					// 於此，年序作為前後紀元之日、月名稱相同，或可銜接之紀元列表。
					年序 = [];
					// 月序作為月名稱不同，但日名稱相同，或可銜接之紀元列表。
					// 例如改正朔。
					月序 = [];

					// 先從 era_Array[0] 向後找到可銜接或有重疊的任何參照紀元。
					while (era = era_Array.shift()) {
						// 第二輪後，start_time 代表 (前紀元.end)，而非代表 this.start。
						days = era.start - start_time;
						if (library_namespace.is_debug(2)) {
							if (days === 0)
								tmp = 'a44;">恰好銜接';
							else {
								tmp = days / ONE_DAY_LENGTH_VALUE;
								tmp = (days < 0 ? '4a4;">重疊 ' + -tmp
										: '888;">間隔 ' + tmp)
										+ '日';
							}
							library_namespace.debug([
									'測試  / 餘 ',
									era_Array.length,
									': ' + era,
									' (<span style="color:#'
									//
									+ tmp + '</span>)',
									' (',
									[
											(era.疑 ? '存在疑問、不準確的紀年' : ''),
											(era.參照曆法 ? '參照曆法: ' + era.參照曆法
													: ''),
											(era.參照紀年 ? '參照紀年: ' + era.參照紀年
													: '') ].filter(function(m) {
										return m;
									}).join(', '), ')' ], 2,
									'initialize_era_date');
						}

						if (days > 0) {
							era_Array.unshift(era);
							break;
						}

						tmp = null;
						if (calendar_data.length === 0
						// test: 後紀元無法轉換此 date。
						|| (date_index = era
						// [ 歲序, 月序, 日序 | 0 ]
						.Date_to_date_index(start_time))
						// days === 0: 恰好銜接且無重疊者。無縫接軌。毋須檢測。
						&& (days === 0 || (date_name[0]
						// .日名(日序, 月序, 歲序) = [ 日名, 月名, 歲名 ]
						=== (tmp = era.日名(date_index[2],
						// 月日名連續性檢測。
						// 檢測前後紀元之接續日、月名稱相同。是否為同一月內同一日。
						// 主要指本紀元結束時間 (this.end)
						// 在兩紀元中之月日名：
						// 從 this.end 開始複製可以最節省資源，不用再重複複製重疊部分。
						date_index[1], date_index[0]))[0] || !date_name[0]
						// 檢測月名是否相同。
						? !date_name[1] || date_name[1] === tmp[1]
						// 測試月名稱可否銜接。
						: (!date_name[1]
						// 因為 era.end 不一定於 this 範圍內，可能剛好在邊界上，
						// 因此須作特殊處理。
						|| date_name[1] + 1 === tmp[1]
						// 測試是否為跨年。
						|| (tmp[1] === START_MONTH
						//
						&& (date_name[1] === LUNISOLAR_MONTH_COUNT
						//
						|| date_name[1] === LEAP_MONTH_PREFIX
						//
						+ LUNISOLAR_MONTH_COUNT)))
						// 測試日名稱可否銜接。是否為年內換月。
						// era 的 date index 為首日。
						&& tmp[0] === START_DATE
						// 確認 date name 為此月最後一天的後一天。
						// 這邊採用的是不嚴謹的測試:
						// 只要 date name <b>有可能</b>是此月最後一天就算通過。
						&& (date_name[0] === 小月 + 1
						//
						|| date_name[0] === 大月 + 1)))) {
							// 通過檢驗。
							年序.push([ era, days, date_index ]);

						} else if (tmp && (date_name[0] === tmp[0]
						//
						|| tmp[0] === START_DATE
						// 確認 date name
						// 為此月最後一天的後一天。
						// 這邊採用的是不嚴謹的測試:
						// 只要 date name
						// <b>有可能</b>是此月最後一天就算通過。
						&& (date_name[0] === 小月 + 1
						//
						|| date_name[0] === 大月 + 1))) {
							月序.push([ era, days, date_index ]);

						} else if (tmp || library_namespace.is_debug(3)) {
							library_namespace.debug([ '前後紀元之接續月日名不同！' + this,
									' ', date_name.slice().reverse().join('/'),
									' != ', era.toString(), ' ',
									tmp ? tmp.reverse().join('/') : '(null)' ],
									2, 'initialize_era_date');
						}
					}

					// 僅存在月名稱不同，但日名稱相同，或可銜接之紀元列表。
					if (年序.length === 0) {
						if (月序.length === 0) {
							var message =
							//
							'initialize_era_date: [' + this + ']: '
							//
							+ (era_Array.length > 0
							//
							? '尋找 [' + 曆法 + '] 至 [' + era_Array[0]
							//
							+ ']，中間存在有未能尋得曆數之時間段！'
							//
							: '已遍歷所有 [' + 曆法 + ']紀年，至結尾無可供參照之紀年！');
							// 因為本函數中應初始化本紀年曆數，否則之後的運算皆會出問題；
							// 因此若無法初始化，則 throw。

							if (false && era_Array.length > 0)
								throw new Error(message);

							library_namespace.error(message);
							library_namespace.error('改採用標準曆法: '
									+ standard_time_parser_name + '，但這將導致['
									+ this + ']解析出錯誤的日期！');

							message = '因參照紀年[' + this.參照紀年
									+ ']錯誤，本紀年顯示的是錯誤的日期！';
							// gettext_config:{"id":"note"}
							add_attribute(this, '註', message, true);

							this.calendar = this.calendar.replace(/:.+/g, ':'
									+ standard_time_parser);
							this.initialize();
							return;
						}
						年序 = 月序;
					}

					// 設定指標初始值，將 era 指到最佳候選。首先採用 [0]。
					era = 年序.pop();
					if (年序.length > 0 && is_正統(era[0], 曆法))
						// 已是最佳(正統)候選，不用再找下去了。
						年序 = [];
					while (date_index = 年序.pop()) {
						// 尋找最佳候選: 最後結束之紀年。

						// assert: 此時若 (this.start - era[0].start ===
						// era[1] === 0)，
						// 表示 era[0] 與 date_index[0] 有相同之起訖時間。
						if ((tmp = era[0].end - date_index[0].end) < 0
						//
						|| tmp === 0 && date_index[1] === 0) {
							era = date_index;
							if (is_正統(era[0], 曆法))
								break;
						}
					}

					/**
					 * 確定交接日序、日名。
					 */
					// [ 歲序, 月序, 日序 | 0 ]
					date_index = era[2]
							|| era[0].Date_to_date_index(start_time);
					library_namespace.debug(
					//
					'交接日序、日名: ' + date_index, 5);
					if (!date_index)
						throw new Error('initialize_era_date: 無法取得 [' + era[0]
								+ ']('
								+ start_time.format(standard_time_format)
								+ ') 的日期名！');
					// 重設 (年序), (月序), (date_index) 作為 era 之指標。
					年序 = date_index[0];
					月序 = date_index[1];
					date_index = date_index[2];

					era = era[0];
					// era_year_data: 當前參照紀年之當前年分各月資料。
					era_year_data = era.calendar[年序];

					if (library_namespace.is_debug())
						library_namespace.info([ 'initialize_era_date: ',
								start_time.format(standard_time_format),
								' 接續參照：', is_正統(era, 曆法) ? '<em>['
								// 曆法.name.join('/')
								+ 曆法 + '] 正統</em> ' : '',
								era.toString(WITH_PERIOD) ]);

					copy_important_properties(era, this);

					if (false
					// && options.check_overleap
					) {
						// TODO: deep check if conflicts
						// 一一檢測前後紀元時間重疊的部分曆數是否有衝突。
						// also need to check KEYs
					}

					if (calendar_data.length === 0) {
						// first era. 第一輪，從新的參照紀年開始。
						// assert: 應該只有首個紀年會到這邊。
						// 初始化本紀元曆數 (this.calendar)。

						calendar_data[NAME_KEY] = [];

						// 該 copy 的其他紀年屬性全 copy 過來。
						library_namespace.set_method(this, era,
								to_list('歲首序|閏月名'));

						// 複製首年之 START_DATE_KEY。
						tmp = era.日名(date_index, 月序, 年序, true);
						if (tmp !== START_DATE)
							calendar_data[START_DATE_KEY] = tmp;

						if (月序 > 0 || (START_KEY in era_year_data)
						// 有時 era_year_data[START_KEY] === START_MONTH。
						&& era_year_data[START_KEY] !== START_MONTH) {
							// 非首月。
							// assert: this_year_data === undefined
							calendar_data.push(
							// this_year_data 一造出來就在 calendar_data 中。
							this_year_data = []);
							// 參考 month_index_to_name()。
							tmp = 月序 + (era_year_data[START_KEY]
							//
							|| START_MONTH);
							// 依 month_index_to_name() 之演算法，
							// 若為閏月起首，則 [START_KEY] 須設定為下一月名！
							// e.g., 閏3月起首，則 [START_KEY] = 4。
							if (月序 > era_year_data[LEAP_MONTH_KEY])
								tmp--;
							this_year_data[START_KEY] = tmp;
						}

						if (date_index > 0) {
							// 非首日。處理到下一個月。
							if (!this_year_data)
								calendar_data.push(
								// 設定好 this_year_data 環境。
								this_year_data = []);

							copy_date(era_year_data[月序] - date_index);
							date_index = 0;
						}

						if (!this_year_data)
							// 首月首日。須保持 calendar_data.length ===
							// year_start_time.length
							year_start_time = [];

						if (library_namespace.is_debug(1)) {
							// check 日次。
							// tmp: 紀年曆數所設定之起始日次。
							tmp = date_name[0] | 0;
							if (tmp && tmp !==
							//
							calendar_data[START_DATE_KEY])
								library_namespace.error([
										'initialize_era_date: ', '紀年 [' + this,
										'] 於曆數所設定之起始日名 ', tmp,
										' 與從參照紀年 [' + era, '] 得到的日次 ',
										(calendar_data[START_DATE_KEY]
										//
										|| START_DATE), ' 不同！' ]);

							// check 月次。
							// tmp: 紀年曆數所設定之起始月次。
							tmp = date_name[1] | 0;
							if (tmp && tmp !==
							//
							(this_year_data[START_KEY]
							//
							|| START_MONTH))
								library_namespace.warn([
										'initialize_era_date: ', '紀年 [' + this,
										'] 於曆數所設定之起始月名 ', tmp,
										' 與從參照紀年 [' + era, '] 得到的月次 ',
										(this_year_data[START_KEY]
										//
										|| START_MONTH), ' 不同！（本年閏月次',
										//
										era_year_data[LEAP_MONTH_KEY],
										//
										'）' ]);
						}
					}

					/**
					 * 處理年中分割，更替時間點不在本年年首的情況。
					 */

					/**
					 * 分割點於本月中間而不在首尾，重疊部分本月之日數，以後一使用紀元為準。
					 */
					if (date_index > 0 || 年序 === 0 && 月序 === 0
					//
					&& (START_DATE_KEY in era.calendar)
					// 處理紀年於月中交接，交接時日序非 0 的情況。
					// assert: && era.calendar[START_DATE_KEY] !==
					// START_DATE
					) {
						library_namespace.debug(
						//
						'處理年中分割，更替時間點不在本年年首的情況。', 5);
						// 續用 this_year_data。
						// 必須設定好 this_year_data 環境。
						clone_last_year(true);

						// 先記下本月現有天數。
						// 若在 clone_last_year() 之前，此時 this_year_data
						// 可能參照的是原參照紀年，為唯讀，因此不使用 .pop()。
						tmp = this_year_data.pop();

						// 參考 date_index_to_name()。
						if (calendar_data.length === 1
						// this.年序 === 0 && this.月序 === 0
						&& this_year_data.length === 0
						//
						&& (START_DATE_KEY in calendar_data))
							tmp
							//
							+= calendar_data[START_DATE_KEY] - START_DATE;
						// 由後一使用紀元得出本月實際應有天數。
						// TODO: 若前後紀元各自設有 START_DATE_KEY，恐怕仍有 bug。
						date_index = era_year_data[月序];
						if (年序 === 0 && 月序 === 0
						//
						&& (START_DATE_KEY in era.calendar))
							date_index
							//
							+= era.calendar[START_DATE_KEY] - START_DATE;
						// check
						if (tmp !== date_index
						// isNaN(tmp): 紀年起始，因此本來就沒有「原先參照的紀元」之資料。
						&& !isNaN(tmp))
							library_namespace.warn([ 'initialize_era_date: ',
									'後一紀元 [' + era, '] 本月 ', date_index,
									'天，不等於原先參照的紀元(為 ', tmp, '天)！' ]);
						// 設定起始日碼。
						// TODO: 若前後紀元各自設有 START_DATE_KEY，恐怕仍有 bug。
						if (calendar_data.length === 1
						// this.年序 === 0 && this.月序 === 0
						&& this_year_data.length === 0
						//
						&& (START_DATE_KEY in calendar_data))
							date_index
							// 當接續紀元時，若本已有 START_DATE_KEY 則減去之。
							-= calendar_data[START_DATE_KEY] - START_DATE;
						copy_date(date_index);
					}

					/**
					 * 處理分割點於本年中間之月首，而不在本年首尾的情況。
					 */
					if (月序 > 0 || (START_KEY in era_year_data)
					// 有時 era_year_data[START_KEY] === START_MONTH。
					&& era_year_data[START_KEY] !== START_MONTH) {
						library_namespace.debug(
						//
						'處理分割點於本年中間之月首 (月序='
						//
						+ 月序 + ')，而不在本年首尾的情況。', 5);
						clone_last_year();

						library_namespace.debug(
						//
						'複製本年接下來每月之曆數: ' + 月序 + PERIOD_DASH
								+ era_year_data.length + '。', 5);
						if (月序 < era_year_data.length)
							Array_push(this_year_data, era_year_data.slice(月序));

						// 複製本年之 LEAP_MONTH_KEY。
						// 須考慮日月名稱未連續的情況。
						tmp = era_year_data[LEAP_MONTH_KEY]
						// 參考 month_index_to_name()。
						+ (era_year_data[START_KEY] || START_MONTH)
						// 轉成 this_year_data 中之閏月 index。
						- (this_year_data[START_KEY] || START_MONTH);
						if ((tmp > 0 || tmp === 0
						// 本月是否為閏月？若是，則 (===)。
						&& 月序 === era_year_data[LEAP_MONTH_KEY])
						// check: this_year_data[LEAP_MONTH_KEY]
						// 可能已存在。
						&& (!(LEAP_MONTH_KEY in this_year_data)
						//
						|| tmp !== this_year_data[LEAP_MONTH_KEY])) {
							library_namespace.debug(
							//
							'複製本年之 LEAP_MONTH_KEY。 index ' + tmp, 5);
							if (LEAP_MONTH_KEY in this_year_data)
								library_namespace.warn([
										'initialize_era_date: ' + this, ' 年序 ',
										calendar_data.length - 1, '，尋至' + era,
										' 年序 ', 年序, '，此年有兩個閏月設定：',
										this_year_data[LEAP_MONTH_KEY],
										' vs. ', tmp, '！' ]);

							this_year_data[LEAP_MONTH_KEY] = tmp;
						}

						tmp = era_year_data[NAME_KEY];
						if (tmp && 月序 < tmp.length) {
							library_namespace.debug(
							//
							'複製本年接下來每月之月分名稱 (' + 月序 + PERIOD_DASH + tmp.length
									+ ') [' + tmp + ']。', 5);
							// console.log(era_year_data);
							// console.log(this_year_data);
							if (!(NAME_KEY in this_year_data))
								// 初始化本年之月分名稱。
								this_year_data[NAME_KEY] = [];
							this_year_data[NAME_KEY].length
							// 先截至當前交接之月分。
							= this_year_data.length
							// 減掉前面 copy 過之每月曆數長度。
							- era_year_data.length + 月序;
							Array_push(this_year_data[NAME_KEY], tmp.slice(月序));
						}

						if (library_namespace.is_debug(1)) {
							// check 曆數
							tmp = this_year_data.length;
							library_namespace.debug([ this + ' 年序 ',
									calendar_data.length - 1, ' 參考 ' + era,
									'，得曆數 ', tmp, ' 個月: [',
									this_year_data.join(','), ']' ], 2,
									'initialize_era_date');
							if (START_KEY in this_year_data)
								tmp += this_year_data[START_KEY] - START_MONTH;
							if (tmp !== LUNISOLAR_MONTH_COUNT
							//
							+ (LEAP_MONTH_KEY
							//
							in this_year_data ? 1 : 0))
								library_namespace.warn([
								//
								'initialize_era_date: ' + this,
								//
								' 年序 ', calendar_data.length - 1,
								//
								'：本年參照紀年 [' + era, '] 年序 ', 年序,
								//
								'，共至 ', tmp, ' 月，陰陽曆正常情況應為 ',
								//
								LUNISOLAR_MONTH_COUNT + (LEAP_MONTH_KEY
								//
								in this_year_data ? 1 : 0), ' 個月！' ]);
						}

						// 月序 = 0;
						年序++;
					}
					// else: assert: 更替時間點除了'年'外，沒其他的了。本年首月首日,
					// date_index === 月序 === 0

					/**
					 * 盡可能以複製參照的方式，複製整年之暦數。
					 */
					// 第二輪後，start_time 代表 (前紀元.end)，而非代表 this.start。
					start_time = era.end;
					// date_index: is last era. 已至 this.end。
					// 保持 start_time <= this_end。
					date_index = this_end - start_time <= 0;
					if (date_index) {
						tmp = era.year_start.search_sorted(this_end, {
							found : true
						});
						if (era.year_start[tmp] < this_end)
							tmp++;
						if (tmp > era.calendar.length)
							tmp = era.calendar.length;
					} else
						for (tmp = era.calendar.length;
						// assert: era.year_start.length ===
						// era.calendar.length + 1
						start_time - era.year_start[tmp - 1] <= 0;)
							// 預防 era 之暦數超過 era.end 所在年的情況。
							// 此時須取得 era.end 在 era 暦數中真正的位置。
							tmp--;

					// 加速: 逐年複製 era 之暦數，至 this.end 或 era 已無曆數為止。
					if (年序 < tmp) {
						// 有可整年複製之暦數。

						if (this_year_data
						//
						&& this_year_data[COUNT_KEY])
							delete this_year_data[COUNT_KEY];

						// year_start_time 總是與 calendar_data 作相同
						// push/pop 處理，包含與 calendar_data 相同筆數的資料。
						Array_push(year_start_time, era.year_start.slice(年序,
								tmp));
						// assert: era.year_start.length ===
						// era.calendar.length + 1
						Array_push(calendar_data, era.calendar.slice(年序, tmp));
						// 複製這些年分之 NAME_KEY。
						if (NAME_KEY in era.calendar) {
							calendar_data[NAME_KEY].length
							//
							= calendar_data.length;
							Array_push(calendar_data[NAME_KEY], era.calendar
									.slice(年序, tmp));
						}
					}

					/**
					 * 若已是最後一個紀年，則表示完成暦數參照。跳出。
					 */
					if (date_index) {
						if (this_year_data
						//
						&& this_year_data[COUNT_KEY])
							delete this_year_data[COUNT_KEY];

						// done.
						// assert: 此時 tmp 代表當前參照紀年之年序。
						break;
					}

					/**
					 * 設定下一輪必要的初始參數，以及正確之月序。
					 */
					// era 已無曆數。需要跳到下個紀元。查找下一參照紀元。
					// 會到這邊，基本上都是經過整年複製的。
					// 有必要重新處理（跨紀年之類）。
					//
					// 設定正確之月序。這時測試前一天。
					// assert: 取前一天則必須為紀年起始後（紀年範圍內），與最後一日期間內；
					// 必能被 parse，且可取得 index。
					// [ 歲序, 月序, 日序 | 0 ]
					月序 = era.Date_to_date_index(new Date(
					// 因為已經處理本年到本年曆數最後一月(倒不見得是年底)，因此需要重設 index。
					// 為預防參照源僅有幾個月或數日，還不到年底，因此不重設年序、跳到下一年。
					start_time - ONE_DAY_LENGTH_VALUE));
					if (!月序)
						throw new Error('initialize_era_date: 無法取得 [' + era
								+ '].end 的日期序！');

					// 設定好交接的 date_name。
					// .日名(日序, 月序, 歲序) = [ 日名, 月名, 歲名 ]
					date_name = era.日名(月序[2], 月序[1], 月序[0]);
					if (!date_name)
						throw new Error('initialize_era_date: 無法取得 [' + era
								+ '].end 的日期名！');
					// 因為取得的是交接點前一日之日名，因此須將日名延後一日，以取得實際交接點應該有的 date。
					date_name[0]++;

					// 做標記。
					// 設定正確之月序。+1: 月序 index → length
					correct_month_count = 月序[1] + 1;
				}

				// assert: year_start_time.length ===
				// calendar_data.length
				// TODO: 若無 era 時之處理。
				year_start_time.push(era.year_start[tmp]);

				if (calendar_data[NAME_KEY].length === 0)
					delete calendar_data[NAME_KEY];

				if (!(MINUTE_OFFSET_KEY in this) && (MINUTE_OFFSET_KEY in era))
					this[MINUTE_OFFSET_KEY] = era[MINUTE_OFFSET_KEY];

				// 不再作一般性的解析。
				紀年曆數 = null;

			} else {
				// ---------------------------------------

				this.參照曆法 = 曆法;

				// 因為了 parser 作設計可能大幅度改變各
				// method，方出此下策，沿用原先的資料結構。
				var time = start_time.getTime(),
				//
				next_time, 日數,
				//
				_to_String
				//
				= Date_to_String_parser[曆法],
				//
				to_String = function(time) {
					return _to_String(time, '%Y/%m/%d').split('/');
				},
				//
				ordinal = to_String(start_time);

				if (isNaN(ordinal[0])
				// 檢測
				|| date_name[1] && date_name[1] !== ordinal[1]
				//
				|| date_name[2] && date_name[2] !== ordinal[2])
					library_namespace.warn('initialize_era_date: 紀年 [' + this
							+ '] 起訖時間所設定的紀年<b>開始時間</b> [' + ordinal.join('/')
							+ ']，與從曆數資料取得的 [' + date_name.join('/') + '] 不同！');

				// 不可設為 START_DATE。
				if (isNaN(ordinal[2] |= 0)) {
					library_namespace.error('initialize_era_date: 紀年 [' + this
							+ '] 無法順利轉換日期 [' + ordinal.join('/') + ']！');
					return;
				}
				// 於曆數起頭設定起始日碼。
				if (ordinal[2] !== START_DATE) {
					// 這時還沒設定 calendar_data[0] = this_year_data。
					// calendar_data[0][START_DATE_KEY] =
					calendar_data[START_DATE_KEY] = ordinal[2];
				}

				if (曆法 === 'CE') {
					// 加速 CE 的演算。另可試試不採用 .calendar = [] 的方法，而直接改變
					// this.attributes。
					this.大月 = CE_MONTH_DAYS;
					// this.小月 = CE_MONTH_DAYS - 1;

					// next_time: this year.
					next_time = ordinal[0];

					if ((ordinal[1] |= 0) === START_MONTH
							&& ordinal[2] === START_DATE)
						ordinal = false;

					while (time < this_end) {
						if (next_time === CE_REFORM_YEAR) {
							next_time++;
							this_year_data = CE_REFORM_YEAR_DATA;
							time += CE_REFORM_YEAR_LENGTH_VALUE;
						} else {
							// 日數: year (next_time) is leap year.
							日數 = library_namespace
									.is_leap_year(next_time++, 曆法);
							time += 日數 ? CE_LEAP_YEAR_LENGTH_VALUE
									: CE_COMMON_YEAR_LENGTH_VALUE;
							this_year_data = 日數 ? CE_LEAP_YEAR_DATA
									: CE_COMMON_YEAR_DATA;
						}

						if (ordinal) {
							// 處理第一年非 1/1 起始的情況。
							日數 = ordinal[2] -= START_DATE;
							// to_String, _to_String: tmp
							to_String = _to_String = ordinal[1] - START_MONTH
									| 0;
							while (to_String > 0)
								日數 += this_year_data[--to_String];
							time -= 日數 * ONE_DAY_LENGTH_VALUE;
							this_year_data = this_year_data.slice(_to_String);
							this_year_data[START_KEY] = ordinal[1];
							this_year_data[0] -= ordinal[2];

							ordinal = false;
						}

						year_start_time.push(time);
						calendar_data.push(
						//
						this_year_data);
					}

				} else {
					this_year_data = [];
					if ((ordinal[1] |= 0)
					//
					&& ordinal[1] !== START_MONTH)
						this_year_data[START_KEY] = ordinal[1];

					// date 設為 START_DATE，為每個月初的遍歷作準備。
					ordinal[2] = START_DATE;

					if (!String_to_Date.parser[曆法]) {
						library_namespace.error('未設定好 String_to_Date.parser['
								+ 曆法 + ']!');
					}
					曆法 = String_to_Date.parser[曆法];
					// TODO: 這方法太沒效率。
					while (time < this_end) {
						// 找下一月初。
						++ordinal[1];
						next_time = 曆法(ordinal.join('/'), undefined, {
							// 於 CE 可避免 80 被 parse 成 1980。
							year_padding : 0
						});
						if (library_namespace.is_debug(2))
							library_namespace.debug(this + ': '
							//
							+ ordinal.join('/') + ' → '
							//
							+ next_time.format(
							//
							standard_time_format));
						日數 = (next_time - time) / ONE_DAY_LENGTH_VALUE;
						if (!(日數 > 0) && 日數 !== (日數 | 0)) {
							library_namespace.error(
							// 可能是時區問題?
							'initialize_era_date: 紀年 [' + this + '] 無法順利轉換日期 ['
									+ ordinal.join('/') + ']: 錯誤日數！');
							return;
						}
						this_year_data.push(日數);
						time = ordinal;
						ordinal = to_String(next_time);
						if (time.join('/') !== ordinal.join('/')) {
							// 預期應該是隔年一月。
							if (++time[0] === 0
							// CE 預設無 year 0 (第0年/第零年)。
							&& !this.零年 && !this.year0)
								++time[0];
							time[1] = START_MONTH;
							if (time.join('/') !== ordinal.join('/')) {
								library_namespace.error(
								//
								'initialize_era_date: 紀年 [' + this
										+ '] 無法順利轉換日期！[' + time.join('/')
										+ ']→[' + ordinal.join('/') + ']');
								return;
							}
							year_start_time.push(next_time.getTime());
							calendar_data.push(this_year_data);
							this_year_data = [];
						}
						time = next_time.getTime();
					}
					if (this_year_data.length > 0) {
						// 注意:這最後一個月可能超過 this.end!
						year_start_time.push(next_time.getTime());
						calendar_data.push(this_year_data);
					}
				}

				// 不再作一般性的解析。
				紀年曆數 = null;
			}

		} else
			// 解壓縮日數 data。
			紀年曆數 = extract_calendar_data(紀年曆數, this);

		// ---------------------------------------

		if (紀年曆數)
			紀年曆數 = 紀年曆數.split(pack_era.year_separator);

		if (紀年曆數) {
			// 一般性的解析。
			var 閏月名 = this.閏月名,
			// 為了測試曆數是否已壓縮。
			era = this;

			紀年曆數.forEach(function(year_data) {
				var month_data = year_data.split(pack_era.month_separator);

				// 初始設定。
				days = 0;
				年序 = START_YEAR;
				月序 = START_MONTH;
				calendar_data.push(this_year_data = []);

				month_data.forEach(function(date_data) {
					// 當月之日數|日數 data
					// =當月之日數|日數 data
					// 年名/月名/起始日碼=當月之日數|日數 data
					// /月名/起始日碼=當月之日數|日數 data
					// 年名/月名=當月之日數|日數 data
					// 月名=當月之日數|日數 data

					var date_name = date_data.match(/^(?:(.*?)=)?([^;\t=]+)$/);

					if (!library_namespace.is_digits(date_data = date_name[2]
							.trim())
							// 接受 0日，是為了如 Myanmar 需要調整月名的情況。
							|| (date_data |= 0) <= 0) {
						library_namespace
								.error('initialize_era_date: 無法辨識日數資料 ['
										+ calendar_data + '] 中的 [' + date_data
										+ ']！');
						return;
					}

					// 處理日期名稱。
					if (date_name
					//
					= parse_calendar_date_name(date_name[1])) {
						var tmp, 年名 = date_name[0],
						//
						月名 = date_name[1],
						// 僅允許整數。
						起始日碼 = date_name[2] | 0;

						// 設定年分名稱
						if (年名 && 年名 != 年序) {
							if (/^-?\d+$/.test(年名))
								// 還預防有小數。
								年名 = Math.floor(年名);
							if (typeof 年名 === 'number'
									&& !(NAME_KEY in calendar_data)
									&& !(START_KEY in calendar_data))
								calendar_data[START_KEY] = 年序 = 年名;

							else {
								if (!(NAME_KEY in calendar_data)) {
									calendar_data[NAME_KEY] = [];
									// TODO: 填補原先應有的名稱。

								} else {
									if (calendar_data[NAME_KEY]
									//
									[calendar_data.length])
										library_namespace.warn(
										//
										'initialize_era_date: ' + '重複設定年分名稱！');
									if (this_year_data.length > 0)
										library_namespace.warn(
										//
										'initialize_era_date: '
												+ '在年中，而非年初設定年分名稱！');
								}

								calendar_data[NAME_KEY]
								//
								[calendar_data.length] = 年名;
							}

						}

						// 設定起始日碼。
						if (!起始日碼 || 起始日碼 === START_DATE) {
							// 無須設定。

						} else if (!library_namespace.is_digits(起始日碼)) {
							// 測試是否為合理之數值:不合資格。
							library_namespace.warn(
							//
							'initialize_era_date: 設定非數字的年度月中起始日碼 [' + 起始日碼
									+ ']！將忽略之。');
						} else {
							if (START_DATE_KEY in this_year_data)
								library_namespace.warn(
								//
								'initialize_era_date: 本年已設定過月中起始日碼 [' + 起始日碼
										+ ']！');
							else {
								this_year_data[START_DATE_KEY] = 起始日碼;
								// 測試曆數是否已壓縮。
								if (已壓縮曆數_PATTERN.test(era.calendar))
									date_data -= 起始日碼 - START_DATE;
							}

							// 於最起頭才能設定 calendar_data[START_DATE_KEY]。
							// 確定在曆數資料一開始即設定月中日期，而非在中途設定日期。
							if (calendar_data.length === 1)
								// 確定之前尚未設定。
								if (START_DATE_KEY in calendar_data) {
									library_namespace.warn(
									//
									'initialize_era_date: 本紀年已設定過起始日碼 [' + 起始日碼
											+ ']！將忽略之。');
								} else {
									calendar_data[START_DATE_KEY]
									// 設定紀年起始之月中日數。
									= 起始日碼;
								}
						}

						// 設定月分名稱。
						// TODO:
						if (月名 && 月名 != 月序) {
							if (library_namespace.is_digits(月名))
								月名 |= 0;
							if (typeof 月名 === 'number') {
								if (!(NAME_KEY in this_year_data)
								//
								&& !(START_KEY in this_year_data))
									this_year_data[START_KEY]
									// 若 月序
									// ==
									// 月名，則不會到這。
									= 月序 = 月名;
								else {
									if (!(NAME_KEY in this_year_data))
										// 初始化本年之月分名稱。
										this_year_data[NAME_KEY] = [];
									this_year_data[NAME_KEY]
									// e.g.,
									// 唐武后久視1年
									[this_year_data.length] = 月名;
								}

							} else if (月名 === LEAP_MONTH_PREFIX || 閏月名
									&& 月名 === 閏月名
									|| (tmp = 月名.match(MONTH_NAME_PATTERN))
									&& tmp[1]
									&& (!tmp[2] || (tmp[2] |= 0) + 1 == 月序
									// 閏月起始。
									|| !(NAME_KEY in this_year_data)
									//
									&& !(START_KEY in this_year_data)))
								if (LEAP_MONTH_KEY in this_year_data)
									library_namespace
											.warn('initialize_era_date: '
													+ '本年有超過1個閏月！將忽略之。');
								else {
									this_year_data[LEAP_MONTH_KEY]
									// 閏月
									// index:
									// 閏月將排在
									// [this_year_data.length]。
									= this_year_data.length;
									if (START_KEY in this_year_data)
										// 因為閏月，減1個月序。
										月序--;
									else
										this_year_data[START_KEY]
										// 閏月起始之處理。
										= 月序 = tmp && tmp[2]
										// 將
										// START_KEY
										// 設成下一月序，以便轉換月名時容易處理。
										// 因為所有閏月之後，包括閏月本身，都會減一。
										? 1 + tmp[2]
										//
										: 2 + LUNISOLAR_MONTH_COUNT
												- month_data.length;
								}
							else {
								if (!(NAME_KEY in this_year_data)) {
									// 初始化本年之月分名稱。
									this_year_data[NAME_KEY] = [];
									// TODO: 填補原先應有的名稱。

								} else {
									if (this_year_data[NAME_KEY]
									//
									[this_year_data.length])
										library_namespace.warn(
										//
										'initialize_era_date: ' + '重複設定月分名稱！');
								}

								this_year_data[NAME_KEY]
								//
								[this_year_data.length] = 月名;
							}
						}

					}
					// 日期名稱處理完畢。

					// 當月之日數。
					this_year_data.push(date_data);
					days += date_data;

					月序++;
					// build year_start_time.

					// 注意:需要依照 MONTH_DAYS 更改公式!
				});

				// 後設定。
				start_time.setDate(start_time.getDate() + days);
				year_start_time.push(start_time.getTime());
				days = 0;
				年序++;
			});
		}

		// ---------------------------------------

		if ((START_DATE_KEY in calendar_data)
		//
		&& !(START_DATE_KEY in calendar_data[0]))
			calendar_data[0][START_DATE_KEY]
			// assert: 於前面，"於曆數起頭設定起始日碼"處未設定之值。
			= calendar_data[START_DATE_KEY];

		if (Array.isArray(月序 = this[MONTH_NAME_KEY]))
			calendar_data.forEach(function(this_year_data) {
				add_month_name(月序, this_year_data);
			});

		// 彌封。
		calendar_data.forEach(function(data) {
			Object.seal(data);
		});

		// ---------------------------------------
		// 能跑到這邊才算是成功解析，能設定暦數。
		this.year_start = Object.seal(year_start_time);
		this.calendar = Object.seal(calendar_data);

		this.skip_year_0 = calendar_data[START_KEY] < 0
		// 沒有 year 0 (第0年/第零年)?
		&& !this.零年 && !this.year0;

		// ---------------------------------------
		// 出廠前檢測。
		year_start_time = year_start_time.at(-1);
		if (year_start_time === this_end) {
			;
		} else if (紀年曆數 && this_end < year_start_time) {
			// 可能是為了壓縮而被填補滿了。
			days = new Date(this_end);
			// assert: 取前一天則必須為紀年起始後（紀年範圍內），與最後一日期間內；
			// 必能被 parse，且可取得 index。
			days.setDate(days.getDate() - 1);
			// [ 歲序, 月序, 日序 | 0 ]
			days = this.Date_to_date_index(days);

			if (days[0] + 1 > this.calendar.length) {
				// truncate 年。
				this.calendar.length = days[0] + 1;

			} else if (days[0] + 1 < this.calendar.length)
				library_namespace
						.debug('由紀年 [' + this
								+ '] 曆數資料取得的紀年<b>結束時間</b>，較其起訖時間所設定的 ['
								+ this.end.format(standard_time_format)
								+ '] 長了 '
								+ (this.calendar.length - (days[0] + 1))
								+ ' 年。可手動刪除之。');

			// truncate 月。
			if (days[1] + 1 > this.calendar[days[0]].length)
				this.calendar[days[0]].length = days[1] + 1;

			// truncate 日: skip。此數據可能保留了當月實際的日數。
			// this.calendar[days[0]][days[1]] = days[2] + 1;

			// TODO: 設定最後之 year_start_time
			// 為真實之下一年開頭，可能需要查詢下一紀年之曆數。
			// 注意:這表示，最後一個 era.year_start 可能與 .calendar
			// 有接近一整年之距離!

		} else {
			if (!this.參照紀年 && year_start_time < this_end
			//
			|| library_namespace.is_debug())
				library_namespace.warn('initialize_era_date: 紀年 ['
						+ this
						+ '] 起訖時間所設定的紀年<b>結束時間</b> ['
						+ this.end.format(standard_time_format)
						+ ']，與從曆數資料取得的 ['
						+ (new Date(year_start_time))
								.format(standard_time_format) + '] 不同！');
			if (false)
				this.year_start.forEach(function(date, index) {
					console.log(index + ':'
							+ new Date(date).format(standard_time_format));
				});
		}
	}

	// get （起始）年干支序。
	// 設定"所求干支序"，將回傳所求干支序之年序。
	// 未設定"所求干支序"，將回傳紀年首年之年干支index。
	function get_year_stem_branch_index(所求干支序) {
		var 曆數 = this.calendar, 年干支 = this.起始年干支序, 起始月分, offset;

		if (isNaN(年干支)) {
			// 盡量取得正月，不需要調整的月分。
			if ((起始月分 = 曆數[0][START_KEY])
			// assert: 即使是只有一個月的短命政權，也得要把日數資料填到年底！
			&& (offset = this.year_start[1]))
				年干支 = new Date(offset);
			else {
				年干支 = new Date(this.start.getTime());
				if (起始月分)
					年干支.setMonth(年干支.getMonth() + START_MONTH - 起始月分);
			}
			年干支 = 年干支.getFullYear()
			// 中曆年起始於CE年末，則應算作下一年之 YEAR_STEM_BRANCH_EPOCH。
			+ (年干支.getMonth() > 9 ? 1 : 0) - (offset ? 1 : 0);
			// e.g., 中曆2001年: 2001
			this.起始年序 = 年干支;
			年干支 = (年干支 - library_namespace.YEAR_STEM_BRANCH_EPOCH)
					.mod(library_namespace.SEXAGENARY_CYCLE_LENGTH);
			this.起始年干支序 = 年干支;
		}

		if (!isNaN(所求干支序) && (年干支 = 所求干支序 - 年干支) < 0)
			年干支 += library_namespace.SEXAGENARY_CYCLE_LENGTH;

		return 年干支;
	}

	// get （起始）月干支序。

	// 設定"月干支"，將回傳所求月干支之 [ 月序, 歲序 ]。
	// 未設定"月干支"，將回傳紀年首年首月(index: 0, 0)之月干支index。

	// 此非紀年首年歲首之月干支序，而是紀年首年首月之月干支序。
	// 只有在未設定首年起始月數(this.calendar[0][START_KEY])的情況下，兩者才會相等。
	// TODO: bug: 唐肅宗上元1年閏4月, 干支!==巳!!
	function get_month_branch_index(月干支, 歲序) {
		var 曆數 = this.calendar, 起始月干支 = this.起始月干支序, 月序;

		// 確定建正：以建(何支)之月為正月(一月)。除顓頊曆，通常即正朔。
		// 以冬至建子之月為曆初。
		// 「三正」一說是夏正（建寅的農曆月份，就是現行農曆的正月）殷正（建丑，即現行農曆的十二月）、周正（建子，即現行農曆的十一月）；
		// 建正與歲首一般是統一的。秦始皇統一中國後，改以建亥之月（即夏曆的十月）為歲首（分年/歲之月；當年第一個月），但夏正比較適合農事季節，所以並不稱十月為正月（秦朝管正月叫「端月」），不改正月為四月，

		if (isNaN(起始月干支)) {
			// 月序 = START_DATE_KEY in 曆數 ? 1 : 0 ;

			// 找到第一個非閏月。
			// 一般說來，閏月不應該符合中氣，因此照理不需要這段篩選。
			if (false)
				while (isNaN(this.月名(月序[0], 月序[1])))
					if (!this.shift_month(1, 月序)) {
						library_namespace.error(
						//
						'get_month_branch_index: 無法取得月次（數字化月分名稱）！');
						return;
					}

			// 判別此月份所包含之中氣日。
			// 包冬至 12/21-23 的為建子之月。
			// 冬至所在月份為11冬月、大寒所在月份為12臘月、雨水所在月份為1正月、春分所在月份為2二月、…、小雪所在月份為10十月，無中氣的月份為前一個月的閏月。
			var ST本月中氣起始日, 下個月起始日差距, ST月序, 中氣差距日數,
			/**
			 * 閏月或閏月之後。
			 * 
			 * @type {Boolean}
			 */
			閏月後,
			// 如果不是從當月1號開始，那麼就找下一個月來測試。
			ST本月起始日 = isNaN(this.歲首序) ? START_DATE_KEY in 曆數 ? 1 : 0 : -1;
			for (月序 = [ 0, 0 ];;)
				if (this.shift_month(ST本月起始日, 月序)) {
					// 標準時間ST(Standard Time) (如公曆UTC+8)之 本月月初起始日
					ST本月起始日 = this.date_index_to_Date(月序[1], 月序[0]);
					// 標準時間ST(Standard Time) (如公曆UTC+8)之 本月中氣起始日
					ST本月中氣起始日 = 中氣日[ST月序 = ST本月起始日.getMonth()];
					// 中氣起始日與本月月初起始日之差距日數。
					中氣差距日數 = ST本月中氣起始日 - ST本月起始日.getDate();
					// 下個月月初起始日，與本月月初起始日之差距日數。
					// 即本月之日數。
					下個月起始日差距 = 曆數[月序[1]][月序[0]];

					if (中氣差距日數 < 0) {
						if (false && 月序[2] === 0 && 0 < 中氣差距日數 + 中氣日_days + 2) {
							// TODO: 紀年首月之前一個月絕對包含(ST月序)中氣。
							break;
						}

						// 日期(of 標準時間月)於中氣前，改成下個月的中氣日。
						if (++ST月序 >= 中氣日.length)
							ST月序 = 0;
						ST本月中氣起始日 = 中氣日[ST月序];
						// 重新計算中氣差距日數。
						中氣差距日數 = ST本月中氣起始日 - ST本月起始日.getDate();

						// 加上本標準時間月日數，
						// e.g., 3月為31日。
						// 使(中氣差距日數)成為下個月的中氣日差距。
						// .setDate(0) 可獲得上個月的月底日。
						ST本月起始日.setMonth(ST月序, 0);
						中氣差距日數 += ST本月起始日.getDate();
					}

					// 只要本月包含所有中氣可能發生的時段，就當作為此月。
					if (中氣差距日數 + 中氣日_days < 下個月起始日差距) {
						// 標準時間月序(ST月序) No 0:
						// 包含公元當年1月之中氣(大寒)，為臘月，
						// 月建丑，月建序 1(子月:0)。餘以此類推。

						// 歲序(月序[1])月序(月序[0])，
						// 距離紀年初(月序[2])個月，
						// 包含公元當年(ST月序 + 1)月之中氣，
						// 其月建序為(ST月序 + 1)。

						// 判定建正。

						// 寅正:
						// 中曆月: B C 1 2 3 4 5 6 7 8 9 A
						// 中月序: A B 0 1 2 3 4 5 6 7 8 9

						// 中氣序: B 0 1 2 3 4 5 6 7 8 9 A

						// ..月建: 子丑寅卯辰巳午未申酉戌亥
						// 月建序: 0 1 2 3 4 5 6 7 8 9 A B

						閏月後 = 月序[0] >= 曆數[月序[1]][LEAP_MONTH_KEY];
						if (library_namespace.is_debug()) {
							library_namespace.debug('閏月或之後: ' + 閏月後, 1,
									'get_month_branch_index');

							// 中曆月序=(曆數[月序[1]].start-START_MONTH)+月序[0]-(閏月或之後?1:0)
							library_namespace.debug('中曆月序 = '
									+ ((START_KEY in 曆數[月序[1]]
									//
									? 曆數[月序[1]][START_KEY] - START_MONTH : 0)
											+ 月序[0] - (閏月後 ? 1 : 0)), 1,
									'get_month_branch_index');

							// 歲首包含中氣序=ST月序-月序
							library_namespace.debug('歲首包含中氣序 = '
									+ (ST月序 - ((START_KEY in 曆數[月序[1]]
									//
									? 曆數[月序[1]][START_KEY] - START_MONTH : 0)
											+ 月序[0] - (閏月後 ? 1 : 0))), 1,
									'get_month_branch_index');

							// 歲首月建序=(歲首中氣序+1)%LUNISOLAR_MONTH_COUNT
							library_namespace.debug('歲首月建序 = '
									+ (1 + ST月序
									//
									- ((START_KEY in 曆數[月序[1]]
									//
									? 曆數[月序[1]][START_KEY] - START_MONTH : 0)
											+ 月序[0] - (閏月後 ? 1 : 0))), 1,
									'get_month_branch_index');
						}

						this.歲首月建序 = ST月序 - 月序[0]
						// 歲首月建序=(ST月序+(is leap?2:1)-月序[0]
						// -(曆數[月序[1]][START_KEY]-START_MONTH))%LUNISOLAR_MONTH_COUNT
						- (START_KEY in 曆數[月序[1]]
						//
						? 曆數[月序[1]][START_KEY] - START_MONTH : 0)
						// 過閏月要再減一。
						+ (閏月後 ? 2 : 1);

						// 將(ST月序)轉為紀年首月之月建序差距。
						// 1: 月建序 - 中氣序
						ST月序 += (閏月後 ? 2 : 1) - (月序[2] || 0);
						break;
					}

					// 跳過無法判斷之月分，移往下個月。
					ST本月起始日 = 1;

				} else {
					// 無法判別的，秦至漢初歲首月建序預設 11。
					// 子正:歲首月建序=0
					// 設定 this.歲首序:已手動設定歲首。
					this.歲首月建序 = (this.歲首序 || 0) + 2;

					// 其他預設甲子年正月(月序0):
					// 丙寅月，月建序(index)=2+月序。
					ST月序 = this.歲首月建序 + (曆數[0] && (START_KEY in 曆數[0])
					//
					? 曆數[0][START_KEY] - START_MONTH : 0);
					break;
				}

			this.歲首月建序 = this.歲首月建序.mod(library_namespace.BRANCH_LIST.length);

			// 對於像是"西晉武帝泰始1年12月"這種特殊日期，元年12月1日起始，但是卻包含有平常的一月中氣(雨水)，這種情況就得要手動設定建正。
			if (this.建正) {
				var 建正序 = library_namespace.BRANCH_LIST.indexOf(this.建正);
				if (建正序 === NOT_FOUND) {
					library_namespace.error(this + ': 建正非地支之一: ' + this.建正);
				} else if (建正序 !== this.歲首月建序) {
					// (建正序 - this.歲首月建序): 需要手動橫移的序數。
					ST月序 += 建正序 - this.歲首月建序;
					this.歲首月建序 = 建正序;
				}
			}

			// 取得月干支。月干支每5年一循環。
			起始月干支 = this.get_year_stem_branch_index()
			// + 月序[1]??
			;
			// (ST月序):紀年首月之月建序差距。
			// 對11,12月，必須要算是下一年的。
			if (ST月序 === 0 || ST月序 === 1) {
				起始月干支++;
			}
			起始月干支 = (起始月干支 * LUNISOLAR_MONTH_COUNT + ST月序)
					.mod(library_namespace.SEXAGENARY_CYCLE_LENGTH);
			this.起始月干支序 = 起始月干支;
		}

		if (月干支 && isNaN(月干支))
			月干支 = library_namespace.stem_branch_index(月干支);
		if (isNaN(月干支))
			// 回傳紀年首年首月之月干支index。
			return 起始月干支;

		// 找出最接近的月干支所在。
		// 回傳所求干支序之 [ 月序, 歲序 ]。
		// 就算有閏月，每年也不過移動 LUNISOLAR_MONTH_COUNT。
		if (歲序 |= 0) {
			// 算出本歲序首月之月干支。
			// 有閏月的話，月干支會少位移一個月。
			起始月干支 = (起始月干支 + 曆數[0].length - (曆數[0][LEAP_MONTH_KEY] ? 1 : 0)
			//
			+ LUNISOLAR_MONTH_COUNT * (歲序 - 1))
					% library_namespace.SEXAGENARY_CYCLE_LENGTH;
		}
		// now: 起始月干支 = 歲序(歲序)月序(0)之月干支

		// 取得差距月數，須取得歲序(歲序)月序(0)往後(月干支)個月。
		if ((月序 = 月干支 - 起始月干支) < 0)
			// 確保所求差距月數於起始月干支後。
			月序 += library_namespace.SEXAGENARY_CYCLE_LENGTH;
		if (月序 >= LUNISOLAR_MONTH_COUNT) {

			library_namespace.error('get_month_branch_index: '
			//
			+ this.歲名(歲序) + '年並無此月干支 [' + 月干支 + ']！');

			// 判斷前後差距何者較大。
			if (月序 - 曆數[歲序].length
			// 若是向後月數過大，才採用向前的月分。否則普通情況採用向後的月分。
			> library_namespace.SEXAGENARY_CYCLE_LENGTH - 月序) {
				// 採用向前的月分。
				月序 = library_namespace.SEXAGENARY_CYCLE_LENGTH - 月序;
				// 警告，須檢查(歲序<0)的情況。
				歲序 -= 月序 / LUNISOLAR_MONTH_COUNT | 0;
				月序 %= LUNISOLAR_MONTH_COUNT;
				月序 = 曆數[歲序].length - 月序;
				if (月序 >= 曆數[歲序][LEAP_MONTH_KEY])
					月序--;
			} else {
				// 普通情況採用向後的月分。
				// 警告，須檢查(歲序>=曆數.length)的情況。
				歲序 += 月序 / LUNISOLAR_MONTH_COUNT | 0;
				月序 %= LUNISOLAR_MONTH_COUNT;
			}

		}
		曆數 = 歲序 < 曆數.length && 曆數[歲序];
		// 採用 '>=' 會取非閏月。
		if (曆數 && 曆數[LEAP_MONTH_KEY] <= 月序)
			月序--;
		return [ 月序, 歲序 ];
	}

	// date name of era → Date
	// 年, 月, 日 次/序(ordinal/serial/NO)
	// (start from START_YEAR, START_MONTH, START_DATE)
	// or 年, 月, 日 名(name)
	// or 年, 月, 日 干支
	// end_type = 1: 日, 2: 月, 3: 年, 紀年: 4.
	function date_name_to_Date(年, 月, 日, strict, end_type) {
		if (!this.year_start)
			this.initialize();

		var 干支, year_index = this.歲序(年), month_index;

		if (isNaN(year_index)
		//
		&& !isNaN(干支 = library_namespace.stem_branch_index(年)))
			// 處理年干支。
			year_index = this.get_year_stem_branch_index(干支);

		// 是否為月建。
		if (月)
			if (月.length === 1 && NOT_FOUND !== (干支
			//
			= library_namespace.BRANCH_LIST.indexOf(月))) {
				if (isNaN(this.歲首月建序))
					this.get_month_branch_index();
				month_index = 干支 - this.歲首月建序;
				if (month_index < 0)
					month_index
					//
					+= library_namespace.BRANCH_LIST.length;

			} else if (isNaN(month_index = this.月序(月, year_index || 0))
			//
			&& !isNaN(干支 = library_namespace.stem_branch_index(月))) {
				// 處理月干支。
				// 回傳所求月干支之 [ 月序, 歲序 ]。
				month_index = this.get_month_branch_index(干支, year_index || 0);
				// 檢查此年之此月是否為此干支。
				if (year_index !== month_index[1]) {
					if (!isNaN(year_index))
						library_namespace.error('date_name_to_Date: '
								+ this.歲名(year_index) + '年並無此月干支 [' + 月 + ']！');
					// 直接設定歲序。
					year_index = month_index[1];
				}
				month_index = month_index[0];
			}

		if (isNaN(year_index)) {
			// assert: !!年 === false
			// 可能只是 to_era_Date() 在作測試，看是否能成功解析？
			if (年 && library_namespace.is_debug()
					|| library_namespace.is_debug(2))
				library_namespace.warn('date_name_to_Date: 未設定或無法辨識年分[' + 年
						+ '] @ ' + this + '。');
			return new Date((end_type === 4 ? this.end : this.start).getTime());
		} else if (end_type === 3)
			year_index++;

		if (isNaN(month_index)) {
			// 可能只是 to_era_Date() 在作測試，看是否能成功解析？
			if (月 && library_namespace.is_debug()
					|| library_namespace.is_debug(2))
				library_namespace.warn('date_name_to_Date: 未設定或無法辨識月分[' + 月
						+ '] @ ' + this + '。');
			return year_index < this.calendar.length
					&& new Date(this.year_start[year_index]);
		} else if (end_type === 2)
			month_index++;

		switch (日) {
		// gettext_config:{"id":"new-moon"}
		case '朔':
			// 警告:藏曆規定每月十五為望，所以初一可能並不是朔。伊斯蘭曆將新月初現定為每月的第一天，朔則在月末前三四天。
			日 = 1;
			break;
		case '望':
			// 警告:望可能在每月的十五或十六日。
			日 = 15;
			break;
		case '晦':
			日 = this.calendar[year_index][month_index];
			break;
		default:
			break;
		}

		// this.日序(): see date_name_to_index()
		干支 = 日 && this.日序(日, month_index === 0 && year_index);
		if (!isNaN(干支) && end_type === 1)
			干支++;
		// 取得基準 Date。
		year_index = this.date_index_to_Date(year_index, month_index,
		//
		干支 || 0,
		// 作邊界檢查。
		strict);
		// 處理日干支。
		if (isNaN(日) && !isNaN(干支 = library_namespace.stem_branch_index(日)))
			year_index = library_namespace.convert_stem_branch_date(干支,
					year_index);

		return year_index;
	}

	/**
	 * Date → date index of era
	 * 
	 * @param {Date}date
	 * @param {Boolean}accept_end
	 * @returns {Array} [ 歲序, 月序, 日序 | 0 ]
	 */
	function Date_to_date_index(date, accept_end) {
		if (!this.year_start)
			this.initialize();

		var date_value;
		if (is_Date(date)) {
			date_value = date.getTime()
			// 有些古老時代，例如"西漢哀帝元壽2年6月26日"，這兩個數值有差異，必須修正。
			- (date.getTimezoneOffset() - present_local_minute_offset)
					* ONE_MINUTE_LENGTH_VALUE;
		} else {
			date_value = +date;
		}

		var 歲序 = this.year_start.search_sorted(date_value, {
			found : true
		}),
		//
		month_data = this.calendar[歲序], 月序 = 0, days,
		//
		日序 = Math.floor((date_value - this.year_start[歲序])
				/ ONE_DAY_LENGTH_VALUE);

		if (!month_data) {
			if (accept_end && 日序 === 0)
				// 剛好在邊界上，越過年。
				// assert: date - this.end === 0 – ONE_DAY_LENGTH_VALUE
				return [ 歲序 - 1, 0, 0 ];

			// 可能只是 to_era_Date() 在作測試，看是否能成功解析。
			if (library_namespace.is_debug())
				library_namespace.error([
						'Date_to_date_index: 日期[',
						(is_Date(date) ? date : new Date(date))
								.format(standard_time_format),
						'] 並不在紀年 [' + this, '] 時段內！' ]);
			return;
		}

		while ((days = month_data[月序]) <= 日序)
			日序 -= days, 月序++;

		return [ 歲序, 月序, 日序 | 0 ];
	}

	// 把一年十二個月和天上的十二辰聯繫起來。
	// 閏月月建同本月。
	// 子月：大雪(12月7/8日)至小寒前一日，中氣冬至。
	// 因此可以與12月7日最接近的月首，作為子月初一。
	function note_月建(date) {
		return date.月干支
		// assert: (date.月干支) 為干支 e.g., '甲子'
		&& date.月干支.charAt(1) || '';
	}

	function get_季(月_index, get_icon) {
		return 0 <= 月_index && (get_icon ? 季_Unicode : 季_LIST)[月_index / 3 | 0]
				|| '';
	}

	// 僅適用於夏曆!
	function note_季(date, options) {
		var 月 = date.月序;

		// 此非季節，而為「冬十月」之類用。
		return get_季(月 - START_MONTH, options && options.icon);
	}

	// 僅適用於夏曆!
	function note_孟仲季(date) {
		var 月 = date.月序;

		return 0 <= (月 -= START_MONTH)
		// 此非季節，而為「冬十月」之類用。
		&& (孟仲季_LIST[月 % 3] + get_季(月)) || '';
	}

	// 僅適用於夏曆!
	function note_月律(date) {
		return 月律_LIST[date.月序 - START_MONTH];
	}

	function note_月の別名(date, 新暦) {
		// 新暦に適用する
		var index = 新暦 ? date.getMonth() : date.月序 - START_MONTH;
		return index >= 0 ? 月の別名_LIST[index] : '';
	}

	function note_旬(date) {
		var 日 = date.日;
		return isNaN(日) ? ''
		// 一個月的第一個十天為上旬，第二個十天為中旬，餘下的天數為下旬。
		: 日 > 10 ? 日 > 20 ? '下' : '中' : '上';
	}

	function note_生肖(date, 圖像文字) {
		if (date.年干支序 >= 0) {
			var LIST = 圖像文字 ? 十二生肖圖像文字_LIST : 十二生肖_LIST;
			return LIST[date.年干支序 % LIST.length];
		}
		return '';
	}

	function note_五行(date, using_地支) {
		var index = date.年干支序;
		if (using_地支) {
			// mapping
			index = note_五行.地支_mapping[index % note_五行.地支_mapping.length];
		}
		return index >= 0 ? (index % 2 ? '陰' : '陽')
		// http://zh.wikipedia.org/wiki/五行#五行與干支表
		+ 陰陽五行_LIST[(index >> 1) % 陰陽五行_LIST.length] : '';
	}
	note_五行.地支_mapping = [ 8, 5, 0, 1, 4, 3, 2, 5, 6, 7, 4, 9 ];

	function note_繞迥(date) {
		var 生肖 = note_生肖(date),
		// 第一繞迥(rabqung)自公元1027年開始算起
		// 每60年一繞迥，library_namespace.SEXAGENARY_CYCLE_LENGTH
		year_serial = date.getFullYear() - (1027 - 60);
		return '第' + library_namespace.to_Chinese_numeral(
		// 勝生周 丁卯周
		Math.floor(year_serial / 60)) + '繞迥'
		//
		+ (生肖 ? ' ' + ((year_serial % 60) + 1)
		//
		+ note_五行(date).replace(/金$/, '鐵') + 生肖 : '');
	}

	function note_納音(date, type) {
		if (type === '年') {
			date = date.歲次;
			if (!date)
				return;
		} else if (type === '月') {
			// date.月干支序===library_namespace.stem_branch_index(date.月干支)
			date = date.月干支;
			if (!date)
				return;
		}
		var index = library_namespace.stem_branch_index(date);
		// 0 – 59 干支序轉納音: 納音_LIST[index / 2 | 0];
		// '/2': 0,1→0; 2,3→1; ...
		// or [index >>> 1]
		return 納音_LIST[index / 2 | 0];
	}

	function note_二十八宿(date, type) {
		var index;
		if (type === '年') {
			// 14: 二十八宿_年禽_offset
			index = date.年序 + 14;
		} else if (type === '月') {
			// 在日宿當值之年，正月起角，順布十二個月，其他仿此。
			// 19: 二十八宿_月禽_offset
			index = 19 + date.年序 * 12 + date.月序;
		} else {
			// http://koyomi8.com/sub/rekicyuu_doc01.htm
			// 日の干支などと同様、28日周期で一巡して元に戻り、これを繰り返すだけである。
			// 8: 二十八宿_日禽_offset
			index = 8
			// 不可用 "| 0"
			+ Math.floor(date.getTime() / ONE_DAY_LENGTH_VALUE);
		}
		return 二十八宿_LIST[index.mod(二十八宿_LIST.length)];
	}

	function note_二十七宿(date) {
		var index = 二十七宿_offset[date.月序] + date.日;
		return date.參照曆法 !== 'CE' && index >= 0
		// 僅對於日本之旧暦與紀年，方能得到正確之暦注值！
		? 二十七宿_LIST[index % 二十七宿_LIST.length] : '';
	}

	function note_七曜(date) {
		// 七曜, 曜日
		return 七曜_LIST[date.getDay()];
	}

	function note_六曜(date) {
		var index = date.月序 + date.日;
		return date.參照曆法 !== 'CE' && index >= 0
		// 六曜は元々は、1箇月（≒30日）を5等分して6日を一定の周期とし（30÷5 =
		// 6）、それぞれの日を星毎に区別する為の単位として使われた。
		// https://ja.wikipedia.org/wiki/%E5%85%AD%E6%9B%9C
		// 旧暦の月の数字と旧暦の日の数字の和が6の倍数であれば大安となる。
		? 六曜_LIST[index % 六曜_LIST.length] : '';
	}

	function note_反支(date, 六日反支標記) {
		var 朔干支序 = (library_namespace
		// 月朔日干支序。
		.stem_branch_index(date) - date.日 + START_DATE)
				.mod(library_namespace.BRANCH_LIST.length),
		// 凡反支日，用月朔為正。戌、亥朔，一日反支。申、酉朔，二日反支。午、未朔，三日反支。辰、巳朔，四日反支。寅、卯朔，五日反支。子、丑朔，六日反支。
		第一反支日 = 6 - (朔干支序 / 2 | 0),
		//
		offset = date.日 - 第一反支日, 反支;
		if (offset % 6 === 0
		// 月朔日為子日之初一，亦可符合上述條件。
		&& 0 <= offset)
			if (offset % 12 === 0)
				// 睡虎地和孔家坡:12日一反支
				反支 = '反支';
			else if (六日反支標記)
				// 標記孔家坡:6日一反支
				反支 = 六日反支標記;

		return 反支 || '';
	}

	function note_血忌(date) {
		var index = date.月序;
		if (index > 0) {
			var 干支序 = ++index / 2 | 0;
			if (index % 2 === 1)
				干支序 += 6;
			if ((library_namespace.stem_branch_index(date)
			// 12: library_namespace.BRANCH_LIST.length
			- 干支序) % 12 === 0)
				return '血忌';
		}
		return '';

		index = [];
		to_list(library_namespace.BRANCH_LIST)
		// note: 示例如何計算出各月 index。
		.forEach(function(s) {
			index.push(library_namespace.stem_branch_index(s));
		});
		[ 1, 7, 2, 8, 3, 9, 4, 10, 5, 11, 6, 0 ];
		return index;
	}

	// a proxy for application.astronomy.立春年()
	var 立春年 = function(date, options) {
		if (library_namespace.立春年)
			return (立春年 = library_namespace.立春年)(date, options);

		var year = date.getFullYear(), month = date.getMonth();
		library_namespace.warn('立春年: 請先載入 application.astronomy。'
				+ '公曆2月3至5日立春後才改「運」，但此處恆定為2月4日改，會因此造成誤差。');
		if (month < 1 || month === 1 && date.getDate() < 4)
			// assert: 公曆一、二月，中曆過年前。
			year--;
		return year;
	};

	// 年紫白飛星
	// TODO: 八卦方位圖
	function note_年九星(date) {
		// offset 64: 64 CE 為甲子:上元花甲 一運。其他如 1684, 1864年(康熙二十三年)亦可。
		// 180: 一個花甲，共有六十年。而三元三個花甲，總得一百八十年。
		var index = (64 - 立春年(date)).mod(180);
		// assert: 0 <= index < 180

		return 九星_LIST[index % 九星_LIST.length]
		//
		+ ' (' + library_namespace.to_stem_branch(-index) + ')';
	}

	// 月九星每15年一輪。
	function note_月九星(date) {
		var index = 立春年(date, true);
		// 1863年11月:上元甲子月
		// offset 47 = (1863 * 12 + 11) % 180
		index = (47 - index[0] * LUNISOLAR_MONTH_COUNT - index[1]).mod(180);
		// assert: 0 <= index < 180

		return 九星_LIST[index % 九星_LIST.length]
		//
		+ ' (' + library_namespace.to_stem_branch(-index) + ')';
	}

	/**
	 * 日家九星遁起始日。
	 * 
	 * 注意:<br />
	 * 請先載入 application.astronomy<br />
	 * 此處夏至、冬至皆指 CE 當年。例如 2000 年冬至指 2000/12 之冬至。
	 * 
	 * @param {Number}年
	 *            CE 當年
	 * @param {Boolean}[冬至]
	 *            取得冬至前後陽遁開始日JD
	 * 
	 * @returns {Array} [ 開始日JD, 閏 ]
	 * 
	 * @see http://koyomi8.com/sub/9sei.htm
	 */
	function 遁開始日(年, 冬至) {
		if (年 % 1 >= .5)
			冬至 = true;
		年 = Math.floor(年);

		var cache = 遁開始日[冬至 ? '冬' : '夏'];
		if (年 in cache)
			return cache[年];

		var 閏,
		// 60/2=30
		HALF_LENGTH = library_namespace
		//
		.SEXAGENARY_CYCLE_LENGTH / 2 | 0,
		// 夏至・冬至の日付を計算する
		// 夏至 90° 節氣序 index 6, 冬至 270° 節氣序 index 18.
		// 夏至後至冬至間: 夏至 JD, else 冬至 JD.
		至日JD = library_namespace.solar_term_JD(年, 冬至 ? 6 + 12 : 6),
		//
		至日干支序 = library_namespace.stem_branch_index(
		//
		library_namespace.JD_to_Date(至日JD)),
		// 取前一個甲子作分界日。
		開始日JD = 至日JD - 至日干支序;

		library_namespace.debug(
		//
		年 + '年' + (冬至 ? '冬至 ' : '夏至 ')
		//
		+ library_namespace.JD_to_Date(至日JD).format(
		//
		draw_era.date_options), 2);

		if (HALF_LENGTH <= 至日干支序) {
			// 取後一個甲子，最接近前至日。
			開始日JD += library_namespace.SEXAGENARY_CYCLE_LENGTH;
			// 3=366/2-遁週期(180), 只有在這範圍內才需要檢查是否以閏起始。
			if (至日干支序 < HALF_LENGTH + 3) {
				// 年 - 1 : 算前一年的冬至。
				var 前至日JD = library_namespace.solar_term_JD(冬至 ? 年 : 年 - 1,
				//
				冬至 ? 6 : 6 + 12),
				//
				前至日干支序 = library_namespace.stem_branch_index(
				//	
				library_namespace.JD_to_Date(前至日JD));
				library_namespace.debug(
				//
				'前至日 ' + library_namespace.JD_to_Date(前至日JD).format(
				//
				draw_era.date_options) + ' 干支序 ' + 前至日干支序, 2);
				if (前至日干支序 <= HALF_LENGTH) {
					// 順便紀錄前至日遁開始日
					遁開始日[冬至 ? '夏' : '冬'][冬至 ? 年 : 年 - 1] = [ 前至日JD - 前至日干支序 ];
					library_namespace.debug('遇日家九星の「閏」，開始日前移' + HALF_LENGTH
							+ '日。', 2);
					閏 = true;
					開始日JD -= HALF_LENGTH;
				}
			}
		}

		return 遁開始日[冬至 ? '冬' : '夏'][年] = [ 開始日JD, 閏 ];
	}

	/**
	 * 遁開始日 cache
	 */
	// 遁開始日.夏[年] = [ 夏至前後陰遁開始日JD, 閏 ];
	遁開始日.夏 = [];
	// 遁開始日.冬[年] = [ 冬至前後陽遁開始日JD, 閏 ];
	遁開始日.冬 = [];

	// 九星は年、月、日、時刻それぞれに割り当てられる。
	// http://koyomi.vis.ne.jp/doc/mlwa/201007040.htm
	// https://ja.wikipedia.org/wiki/%E4%B9%9D%E6%98%9F#.E6.97.A5.E3.81.AE.E4.B9.9D.E6.98.9F
	// http://koyomi8.com/sub/rekicyuu_doc01.htm#9sei
	// http://d.hatena.ne.jp/nobml/20121231/1356881216
	// http://www.fushantang.com/1012/1012d/j4083.html
	// http://blog.xuite.net/chen992/twblog/99860418-%E4%B8%89%E5%85%83%E4%B9%9D%E9%81%8B
	// http://www.kaiun.com.tw/share_detail.asp?niid=33
	// http://www.gtomb.com/news-31.html
	// http://wenku.baidu.com/view/3dcb027302768e9951e738c3.html
	// "冬至上元甲子起" "飛星之法上元甲子一白入中宮"
	// http://blog.xuite.net/nortonwu1015/twblog/137586855
	/**
	 * 日時九星推法
	 * 
	 * cf. "太乙數"
	 * 
	 * 注意:<br />
	 * 請先載入 application.astronomy<br />
	 */
	function note_日家九星(date) {
		var JD = library_namespace.Date_to_JD(date.offseted_value());

		// 像是 東晉哀帝隆和1年11月30日 363/1/1 必須多前溯 .5 才能保證後面 days >= 0。
		var index, 年 = date.getFullYear() - .5;
		if (date.getMonth() < 6)
			年 -= .5;
		// 確定 date 之前一至日。
		// +1 : JD 為當地當天0時。但交節時刻會在至日0時之後。因此需算到整日過完，即 JD+1。
		// 若交節時刻剛好落在隔日剛開始(子夜0時)，則今日還是應該算前一個。
		while (遁開始日(年 + .5)[0] < JD + 1)
			年 += .5;
		library_namespace.debug(
		//
		遁開始日(年) + ' - ' + JD + ' - ' + 遁開始日(年 + .5)
		//
		+ ' (' + (遁開始日(年 + .5)[0] - 遁開始日(年)[0]) + ')', 2);
		index = 遁開始日(年);

		// days: 遁開始日後經過天數。0–179
		var days = JD + 1 - index[0] | 0,
		//
		result = Object.create(null);
		result.days = days;
		result.閏 = index[1];

		// assert: 0 <= days < 210 (or 180=(366/2/60|0)*60)
		index = days
		//
		+ (index[1] ? library_namespace.SEXAGENARY_CYCLE_LENGTH : 0);

		if (年 % 1 === 0) {
			// 夏至後→冬至間。陰遁、逆飛。
			result.type = '陰遁';
			// 將 index 轉為逆序。
			index = -index - 1;
		} else {
			// 冬至後→夏至間。
			result.type = '陽遁';
		}

		result.index = index = index.mod(九星_JP_LIST.length);
		result.九星 = 九星_JP_LIST[index];

		return result;
	}

	function note_三元九運(date) {
		// offset 64: 64 CE 為甲子:上元花甲 一運。其他如 1684, 1864年(康熙二十三年)亦可。
		// 180: 一個花甲，共有六十年。而三元三個花甲，總得一百八十年。
		var index = (立春年(date) - 64).mod(180);

		if (false && (index - 1 - (date.年干支序
		// 採用過年改「運」
		|| library_namespace
		// 60: library_namespace.SEXAGENARY_CYCLE_LENGTH
		.guess_year_stem_branch(date, true))) % 60 === 0)
			;
		else {
			// assert: index % 60 === (date.年干支序 ||
			// library_namespace.guess_year_stem_branch(date, true))
		}

		// get "運": 二十年一運
		index = index / 20 | 0;

		return '上中下'.charAt(index / 3 | 0) + '元'
		// + 1 : 運 starts from 1.
		+ library_namespace.to_Chinese_numeral(index + 1) + '運';
	}

	/**
	 * 為 era Date 增添標記，加上曆注(暦注)之類。 add note, add_note
	 * 
	 * @param {Date}date
	 * @param {Object}[options]
	 *            附加參數/設定特殊功能與選項
	 */
	function sign_note(date, options) {
		add_offset_function(date, this);

		var date_index = this.notes, tmp, tmp2;

		if (!date_index) {
			// 初始化 era.notes
			date_index = this.notes
			// do cache.
			= Object.create(null);

			sign_note.copy_attributes.forEach(function(key) {
				if (this[key])
					date_index[key] = this[key];
			}, this);

			date_index.注 = Array.isArray(tmp = this.注) ? tmp
			// 備考
			: tmp ? [ tmp ] : [];

			// 查詢某時間點（時刻）的日期資訊，如月干支等：
			// 對所有紀年，找出此時間點相應之曆數：
			// 若年分起始未初始化，則初始化、解壓縮之。
			// 依年分起始 Date value，以 binary search 找到年分。
			// 依該年之月分資料，找出此時間點相應之月分、日碼(date of month)。

			// Object.seal(紀年);
			// date_index.name = this.name.slice(0, 4);
			date_index.name = this.name;

			date_index.紀年名 = this.toString();

			for (var tmp = this.name.length,
			// 設定其他屬性。
			tmp2 = period_root; tmp > 0;) {
				tmp2 = tmp2.sub[this.name[--tmp]];
				if (!tmp2)
					break;
				Object.assign(date_index, tmp2.attributes);
			}

			// for '初始.君主: 孺子嬰#1'
			主要索引名稱.forEach(function(name, index) {
				if (tmp = this.name[index])
					if (date_index[name])
						if (Array.isArray(date_index[name]))
							date_index[name].unshift(tmp);
						else
							date_index[name]
							//
							= [ tmp, date_index[name] ];
					else
						date_index[name] = tmp;
			}, this);

		}

		// copy 屬於本紀年的曆注。
		Object.assign(date, date_index);

		// 接著 copy 僅屬於本日期的曆注。

		// [ 歲序, 月序, 日序 | 0 ]
		date_index = this.Date_to_date_index(date);
		if (!date_index) {
			library_namespace.error('sign_note: 加注日期於紀年 [' + this + '] 範圍外！');
			date.error = 'out of range';
		} else {
			// 欲使用 date_index，應該考慮採 (date.年|date.年序, date.月序, date.日)。
			// 因為日期可能不是從1月1日開始。
			// Object.seal(date.index = date_index);

			date.年干支序 = tmp
			//
			= this.get_year_stem_branch_index() + date_index[0];
			date.年序 = this.起始年序 + date_index[0];

			date.歲次 = library_namespace.to_stem_branch(tmp);

			// 精密度至年。
			if (this.精 && (date.精 = this.精) === '年') {
				date.年 = this.歲名(date_index[0]);
			} else {
				// 日本の暦注。

				// .日名(日序, 月序, 歲序) = [ 日名, 月名, 歲名 ]
				tmp = this.日名(date_index[2], date_index[1], date_index[0])
						.reverse();
				tmp2 = tmp[1];
				date.閏月 = typeof tmp2 === 'string'
				//
				&& tmp2.charAt(0) === LEAP_MONTH_PREFIX;
				date.月序 = date.閏月 ? +tmp2
						.slice(/* LEAP_MONTH_PREFIX.length */1) : tmp2;

				if (options.numeral)
					tmp = numeralize_date_format(tmp, options.numeral);
				date.年 = tmp[0];
				date.月 = tmp[1];
				date.日 = tmp[2];

				if (this.年名) {
					date.年名稱 = this.年名;
				}

				if (this.參照曆法)
					date.參照曆法 = this.參照曆法;

				if (0 < +tmp[1]) {
					// http://www.geocities.jp/mishimagoyomi/12choku/12choku.htm

					// var new_year_day = this.year_start[date_index[0]];
					// TODO: 歲時記事

					// 冬至の頃（旧暦11月）に北斗七星のひしゃくの柄の部分が真北（子）に向くため、この日を「建子」の月としました。そこで旧暦11月節（大雪）後の最初の子の日を「建」と定めました。

					// 《通緯·孝經援神契》：「大雪後十五日，斗指子，為冬至，十一月中。陰極而陽始至，日南至，漸長至也。」
					// 大雪後首子日，十二直為「建」。但12節重複前一日之十二直，因此須先計算12節。
					// http://koyomi8.com/sub/rekicyuu_doc01.htm#jyuunicyoku
					if (false)
						date.十二直 = 十二直_LIST[(十二直_LIST.length - tmp[1]
						// 誤:日支與當月之月建相同，則十二直為"建"。
						+ library_namespace.stem_branch_index(date))
								% 十二直_LIST.length];
				}

				// 計算當月日名/日碼。
				tmp2 = this.calendar[date_index[0]];
				tmp = tmp2[date_index[1]];
				if (date_index[1] === 0
				//
				&& (START_DATE_KEY in tmp2))
					tmp += tmp2[START_DATE_KEY] - START_DATE;

				// 大月
				tmp2 = this.大月;
				date.大小月 = tmp2 ? tmp < tmp2 ? '小' : '大'
				//
				: tmp === 大月 ? '大' : tmp === 小月 ? '小' : '(' + tmp + '日)';

				// 取得當年閏月 index。
				tmp = this.calendar[
				//
				tmp2 = date_index[0]][LEAP_MONTH_KEY];
				date.月干支 = library_namespace.to_stem_branch(
				// 基準點。
				this.get_month_branch_index()
				// 就算有閏月，每年也不過移動 LUNISOLAR_MONTH_COUNT。
				+ LUNISOLAR_MONTH_COUNT * tmp2 + date_index[1]
				// 為非一月開始的紀年作修正。
				- (0 < tmp2 && (tmp2 = this.calendar[0][START_KEY])
				//
				? tmp2 - START_MONTH : 0)
				// 閏月或在閏月之後的 index，都得減一。
				- (!tmp || date_index[1] < tmp ? 0 : 1));

				// var new_year_day =
				// this.year_start[date_index[0]],new_year_day_stem_branch_index;
				// if
				// (!this.calendar[0][START_KEY]||this.calendar[0][START_KEY]===START_MONTH){new_year_day_stem_branch_index=(library_namespace.to_stem_branch(new_year_day)+START_DATE-this.calendar[START_DATE_KEY]).mod(library_namespace.SEXAGENARY_CYCLE_LENGTH);}
				// TODO: date.歲時記事=

			}
		}

		if (false)
			date.日干支 = date.format({
				format : '%日干支',
				locale : library_namespace.gettext.to_standard('Chinese')
			});

		// 後期修正。post fix.
		if (typeof this.fix === 'function')
			this.fix(date);

		// after care.
		if (date.注.length === 0)
			delete date.注;

		return date;
	}

	Object.assign(sign_note, {
		// 預設會 copy 的紀年曆注。
		// @see function translate_era(era) @ _test suite/era.js
		// "精"會特別處理。
		// 據: 依據/根據/出典/原始參考文獻/資料引用來源/典拠。
		copy_attributes : to_list('據,準,疑,傳說,曆法,'
				+ '君主名,表字,君主號,諱,諡,廟號,生,卒,君主性別,在位,加冕,年號,父,母,配偶'),
		// 曆注, note
		// 減輕負擔:要這些曆注的自己算。
		notes : {
			"月建" : note_月建,
			"季" : note_季,
			"旬" : note_旬,
			// gettext_config:{"id":"chinese-zodiac"}
			"生肖" : note_生肖,
			// gettext_config:{"id":"wu-xing"}
			"五行" : note_五行,
			"繞迥" : note_繞迥,
			// 紫白飛星
			"年九星" : note_年九星,
			"月九星" : note_月九星,
			"日家九星" : note_日家九星,
			"三元九運" : note_三元九運,

			"孟仲季" : note_孟仲季,
			"月律" : note_月律,
			// gettext_config:{"id":"japanese-month-name"}
			"月の別名" : note_月の別名,

			"反支" : note_反支,
			"血忌" : note_血忌,
			// gettext_config:{"id":"7-luminaries"}
			"七曜" : note_七曜,
			// gettext_config:{"id":"6-luminaries"}
			"六曜" : note_六曜,
			"納音" : note_納音,
			// gettext_config:{"id":"28-mansions"}
			"二十八宿" : note_二十八宿,
			// gettext_config:{"id":"27-mansions"}
			"二十七宿" : note_二十七宿
		}
	});

	Object.assign(Era.prototype, {
		// 月次，歲次與 index 之互換。
		// 注意：此處"序"指的是 Array index，從 0 開始。
		// "次"則從 1 開始，閏月次與本月次相同。
		// 若無特殊設定，則"次"="名"。
		歲序 : year_name_to_index,
		月序 : month_name_to_index,
		日序 : date_name_to_index,
		歲名 : year_index_to_name,
		月名 : month_index_to_name,
		日名 : date_index_to_name,

		shift_month : shift_month,

		initialize : initialize_era_date,
		get_month_branch_index : get_month_branch_index,
		get_year_stem_branch_index : get_year_stem_branch_index,
		date_name_to_Date : date_name_to_Date,
		date_index_to_Date : date_index_to_Date,
		Date_to_date_index : Date_to_date_index,

		sign_note : sign_note,
		// 若偵測是否已經存在，則 IE 8 得特別設定。恐怕因原先已經存在?
		toString : get_era_name
	});

	// ---------------------------------------------------------------------//

	// private 工具函數：分割資料檔使用之日期(起訖時間)。
	// return [ {String}起始時間, {String}訖, parser ]
	function parse_duration(date, era) {
		var tmp;
		if (typeof date === 'string' && (tmp = date.match(
		// Must include PERIOD_DASH
		// [ matched, parser, 起, 訖1, 訖2 ]
		/^\s*(?:([^:]+):)?\s*([^–~－—─～〜﹣至:]*)(?:[–~－—─～〜﹣至]\s*(.*)|(\+\d+))\s*$/
		// @see CeL.date.parse_period.PATTERN
		)))
			date = [ tmp[2], tmp[3] || tmp[4], tmp[1] ];

		if (Array.isArray(date) && date.length > 0) {
			if (!date[2]) {
				// 起始時間
				tmp = date[0];
				// 針對從下一筆紀年調來的資料。
				if (typeof tmp === 'string' && (tmp = tmp
				// @see CeL.date.parse_period.PATTERN
				// Must include PERIOD_DASH
				.match(/^\s*(?:([^:]+):)?\s*([^–~－—─～〜﹣至:]*)/)))
					date = [ tmp[2], date[1], tmp[1] ];
			}

			if (/^\d{1,2}\/\d{1,2}$/.test(date[1])
			//
			&& (tmp = date[0].match(/^(\d+\/)\d{1,2}\/\d{1,2}$/)))
				// 補上與起始時間相同年分。
				date[1] = tmp[1] + date[1];

			return date;
		}

		library_namespace.error('parse_duration: 無法判別 [' + era.toString()
				+ '] 之起訖時間！');
		// return date;
	}

	/**
	 * 工具函數：正規化日期。
	 * 
	 * @private
	 */
	function normalize_date(date, parser, period_end, get_date) {
		library_namespace.debug('以 parser [' + parser + '] 解析 [' + date + ']。',
				2, 'normalize_date');
		if (!date)
			return '';

		var parsed;
		if (!is_Date(date)
				&& !period_end
				&& (!parser || parser === 'CE')
				&& /^-?\d/.test(date)
				&& (parsed = Julian_day(date, parser || standard_time_parser,
						true)))
			// 採用 Julian_day 較快。
			date = Julian_day.to_Date(parsed);

		if (!is_Date(date)) {
			var string, to_period_end = period_end && function() {
				var tmp, matched = string.match(
				// 警告:並非萬全之法!
				/(-?\d+)(?:[\/.\-年 ](\d+)(?:[\/.\-月 ](\d+))?)?/);

				if (matched) {
					matched.shift();
					while (!(tmp = matched.pop()))
						;
					matched.push(++tmp);
					string = matched.join('/');
					period_end = false;
				}
			};

			// 像是 'Maya'，在登記完 Maya 紀年後便存在。
			// 因此需要先檢查 (parser in String_to_Date.parser)
			// 再檢查 (parser in search_index)
			if (parser in String_to_Date.parser) {
				string = String(date).trim();
				date = string.to_Date({
					parser : parser === PASS_PARSER ? undefined : parser
							|| DEFAULT_DATE_PARSER,
					period_end : period_end,
					// 於 CE 可避免 80 被 parse 成 1980。
					year_padding : 0
				});

			} else if (parser in search_index) {
				var era_Set = search_index[parser];
				if (!(era_Set instanceof Set)
				// 確定 parser 為唯一且原生的 era key。
				|| era_Set.size !== 1) {
					library_namespace.error(
					//
					'normalize_date: 無法確認 parser：共有 ' + era_Set.size + ' 個 ['
							+ parser + ']！');
					return;
				}
				// 取得那唯一個 parser。
				era_Set.forEach(function(era) {
					parser = era;
				});
				string = date;
				period_end && to_period_end();
				date = to_era_Date({
					紀年 : parser,
					日期 : string
				}, {
					date_only : true
				});
				if (period_end) {
					// 警告:取後一日,並非萬全之法!
					date.setDate(date.getDate() + 1);
				}

			} else if ((/^-?\d{1,4}$/.test(string = String(date).trim())
			// 因為 String_to_Date 不好設定僅 parse ('80') 成
			// '80/1/1'，因此在此須自己先作個 padding。
			? (string = string.replace(/^(\d{1,2})$/, '$1'.pad(4, 0)))
			//
			: '' === string.replace(
			// 先確定 .to_Date 有辦法 parse。
			String_to_Date.default_parser.date_first, ''))
					//
					&& typeof string.to_Date === 'function'
					// 為了使 'Babylonian-556/4' 不被執行 string.to_Date()
					// 參考 (年_SOURCE)
					&& /^[前\-−‐]?\d/.test(string)
					//
					&& (parser = string.to_Date({
						parser : parser === PASS_PARSER ? undefined : parser
								|| DEFAULT_DATE_PARSER,
						period_end : period_end,
						// 於 CE 可避免 80 被 parse 成 1980。
						year_padding : 0
					}))) {
				date = parser;

			} else {
				// e.g., 魯春秋-722, 秦漢歷-246
				period_end && to_period_end();
				date = to_era_Date(string, {
					date_only : true
				});
				if (period_end) {
					// 警告:取後一日,並非萬全之法!
					date.setDate(date.getDate() + 1);
				}
			}
		} else {
			// 已經處理過了?
		}

		if (is_Date(date)) {
			if (get_date) {
				return date;
			} else if (typeof date.format === 'function') {
				return date.format(DATE_NAME_FORMAT);
			}
		}

		library_namespace.error('normalize_date: 無法解析 [' + date + ']！');
	}

	/**
	 * 在可適度修改或檢閱紀年資料的範疇內，極小化壓縮紀年的曆數資料。<br />
	 * 會更改到 plain_era_data！
	 * 
	 * @example <code>
	CeL.era.pack('/文宗/天曆|1329/8/25~|2/8=30;29;29;30;30\t29;30;30;29');
	 * </code>
	 * 
	 * @param {Array|Object|String}plain_era_data
	 *            紀年資料。
	 * 
	 * @returns {String}壓縮後的紀年資料。
	 */
	function pack_era(plain_era_data) {

		// 單筆/多筆共用函數。

		function pre_parse(era) {
			if (typeof era === 'string')
				era = era.split(pack_era.field_separator);
			if (Array.isArray(era) && era.length === 1 && era[0].includes(
			//
			pack_era.month_separator))
				// gettext_config:{"id":"era-name"}
				era.unshift('紀年', '');
			if (Array.isArray(era) && 1 < era.length) {
				// 使 pack_era() 可採用 Era / 壓縮過的日期資料 為 input。
				// TODO: 尚未完善。應直接採用 parse_era 解析。
				era[0] = era[0].split(pack_era.era_name_classifier);
				(era[2] = era[2].split(pack_era.year_separator))
						.forEach(function(date, index) {
							era[2][index] = date
									.split(pack_era.month_separator);
						});
				era = {
					紀年 : era[0],
					起訖 : parse_duration(era[1], era[0])
					// @see CeL.date.parse_period.PATTERN
					// Must include PERIOD_DASH
					// assert: 已經警示過了。
					|| era[1].split(/[–~－—─～〜﹣至]/),
					曆數 : era[2]
				};
			}
			return era;
		}

		// -----------------------------
		// 處理多筆紀年。

		if (Array.isArray(plain_era_data)) {
			var last_era = [],
			/** {Date}上一紀年結束日期。 */
			last_end_date, era_list = [];

			plain_era_data.forEach(function(era) {
				if (!library_namespace.is_Object(
				//
				era = pre_parse(era))) {
					library_namespace.error('pack_era: 跳過資料結構錯誤的紀年資料！');
					return;
				}

				// 簡併紀年名稱。
				var i = 0, this_era = era.紀年, no_inherit;
				if (!Array.isArray(this_era))
					this_era = [ this_era ];
				for (; i < this_era.length; i++)
					if (!no_inherit && this_era[i] === last_era[i])
						this_era[i] = '';
					else {
						no_inherit = true;
						if (this_era[i] !== parse_era.inherit)
							last_era[i] = this_era[i] || '';
					}
				era.紀年 = this_era;

				// 簡併起訖日期。
				// 起訖 : [ 起, 訖, parser ]
				if (!(this_era = parse_duration(era.起訖, this_era))) {
					library_namespace.error('pack_era(Array): 跳過起訖日期錯誤的紀年資料！');
					return;
				}
				// 回存。
				era.起訖 = this_era;

				// 正規化日期。
				// assert: 整個 era Array 都使用相同 parser。

				// 若上一紀年結束日期 == 本紀年開始日期，
				// 則除去上一紀年結束日期。
				if (
				// cache 計算過的值。
				(this_era[0] = normalize_date(this_era[0], this_era[2]
						|| PASS_PARSER))
						&& this_era[0] === last_end_date) {
					library_namespace.debug('接續上一個紀年的日期 [' + last_end_date
							+ ']。除去上一紀年結束日期。', 2);
					last_era.date[1] = '';

					// 這是採除去本紀年開始日期時的方法。
					// this_era[0] = '';

					// 之所以不採除去本紀年的方法，是因為：
					// 史書通常紀載的是紀年開始的日期，而非何時結束。
				} else
					library_namespace.debug('未接續上一個紀年的日期: [' + last_end_date
							+ ']→[' + this_era[0] + ']。', 2);

				if (持續日數_PATTERN.test((last_era.date = this_era)[1])) {
					(last_end_date = normalize_date(this_era[0], this_era[2]
							|| PASS_PARSER, true, true)).setDate(+this_era[1]);
					last_end_date = normalize_date(last_end_date);
					library_namespace.debug('訖時間 "+d" [' + this_era[1]
							+ '] : 持續日數 [' + last_end_date + ']。', 2);
				} else {
					last_end_date = normalize_date(this_era[1].trim(),
							this_era[2] || PASS_PARSER, true);
					library_namespace.debug('訖時間 "－y/m/d" [' + this_era[1]
							+ '] : 指定 end date [' + last_end_date + ']。', 2);
				}

				era_list.push(era);
			});

			// 因為可能動到前一筆資料，只好在最後才從頭再跑一次。
			library_namespace.debug('開始 pack data。', 2);
			last_era = [];
			era_list.forEach(function(era) {
				last_era.push(pack_era(era));
			});

			library_namespace.debug('共轉換 ' + last_era.length + '/'
					+ era_list.length + '/' + plain_era_data.length + ' 筆紀錄。');

			return last_era;
		}

		// -----------------------------
		// 處理單筆紀年。

		if (!library_namespace.is_Object(
		//
		plain_era_data = pre_parse(plain_era_data))) {
			library_namespace.error('pack_era: 無法判別紀年資料！');
			return plain_era_data;
		}

		// 至此 plain_era_data = {
		// 紀年 : [ 朝代, 君主(帝王), 紀年名稱 ],
		// 起訖 : [ 起, 訖, parser ],
		// 曆數 : [ [1年之月分資料], [2年之月分資料], .. ],
		// 其他附加屬性 : ..
		// }

		var i = 0, j,
		//
		year_data,
		// 當前年度
		year_now = START_YEAR,
		// 當前月分
		month_now,
		// 壓縮用月分資料
		month_data,
		//
		month_name,
		//
		前項已壓縮,
		// {String} 二進位閏月 index
		leap_month_index_base_2, 日數,
		//
		年名, 月名, 起始日碼,
		//
		to_skip = {
			紀年 : 0,
			起訖 : 1,
			曆數 : 2
		}, packed_era_data,
		//
		紀年名稱 = plain_era_data.紀年,
		//
		起訖時間 = parse_duration(plain_era_data.起訖, 紀年名稱),
		// calendar_data
		年度月分資料 = plain_era_data.曆數;

		if (!起訖時間) {
			起訖時間 = [];
			// return;
		}

		if (!Array.isArray(年度月分資料) || !年度月分資料[0]) {
			library_namespace.error('pack_era: 未設定年度月分資料！');
			return;
		}

		if (Array.isArray(紀年名稱))
			紀年名稱 = 紀年名稱.join(pack_era.era_name_classifier)
			//
			.replace(pack_era.era_name_重複起頭, pack_era.era_name_classifier)
			//
			.replace(pack_era.era_name_符號結尾, '');
		if (!紀年名稱 || typeof 紀年名稱 !== 'string') {
			library_namespace.error(
			//
			'pack_era: 無法判別紀年名稱: [' + 紀年名稱 + ']');
			return;
		}

		// 簡併月分資料。
		for (; i < 年度月分資料.length; i++, year_now++) {
			year_data = 年度月分資料[i];
			// 每年自一月開始。
			month_now = START_MONTH;
			month_data = [];
			leap_month_index_base_2 = '';
			for (j = 0; j < year_data.length; j++, month_now++) {
				// 允許之日數格式：
				// 日數
				// '起始日碼=日數'
				// [ 起始日碼, 日數 ]
				if (isNaN(日數 = year_data[j])) {
					if (typeof 日數 === 'string')
						日數 = 日數.split('=');

					if (!Array.isArray(日數) || 日數.length !== 2) {
						library_namespace.error(
						//
						'pack_era: 無法辨識日數資料 [' + year_data[j] + ']！');
						month_data = null;

					} else {
						if (起始日碼 = parse_calendar_date_name(
						//
						月名 = String(日數[0])))
							// [ 年名, 月名, 起始日碼 ]
							年名 = 起始日碼[0], 月名 = 起始日碼[1], 起始日碼 = 起始日碼[2];

						else {
							library_namespace.warn(
							//
							'pack_era: 無法辨識紀年 [' + 紀年名稱 + '] ' + year_now
									+ '年之年度月分資料 ' + j + '/' + year_data.length
									+ '：起始日碼 [' + 月名 + ']，將之逕作為月分名！');
							年名 = 起始日碼 = '';
						}

						// assert: 至此 (年名), (月名), (起始日碼) 皆已設定。

						日數 = 日數[1];

						if (year_now == 年名)
							年名 = '';
						if (month_now == 月名)
							月名 = '';
						if (START_DATE == 起始日碼)
							起始日碼 = '';

						if ((month_name = 月名) || 年名 || 起始日碼) {
							// 可能為: [閏闰]?\d+, illegal.

							if (i === 0 && j === 0 && !起始日碼
									&& (month_name = month_name.match(
									//
									MONTH_NAME_PATTERN))) {
								library_namespace.info(
								//
								'pack_era: 紀年 [' + 紀年名稱 + '] '
								//
								+ (年名 || year_now) + '年：起始的年月分並非 ' + year_now
										+ '/' + month_now + '，而為 ' + 年名 + '/'
										+ 月名);

								// 將元年前面不足的填滿。
								// 為了增高壓縮率，對元年即使給了整年的資料，也僅取從指定之日期開始之資料。
								month_data = to_list(new Array(
								// reset
								month_now = +month_name[2]
										+ (month_name[1] ? 1 : 0)).join('0'));
							}

							// 處理簡略表示法: '閏=\d+'
							if (月名 === LEAP_MONTH_PREFIX)
								月名 += month_now - 1;
							// 可壓縮: 必須為閏(month_now - 1)
							if ((month_name = 月名) !== LEAP_MONTH_PREFIX
									+ (month_now - 1)
									|| 年名 || 起始日碼) {
								if ((month_name = 月名)
								//
								!== LEAP_MONTH_PREFIX + (month_now - 1)
										&& (i > 0 || j > 0)) {
									library_namespace.warn(
									//
									'pack_era: 紀年 [' + 紀年名稱 + '] '
									//
									+ year_now + '年：日期非序號或未按照順序。月分資料 '
											+ (j + START_MONTH) + '/'
											+ year_data.length + ' ['
											+ year_now + '/' + month_now + '/'
											+ START_DATE + '] → [' + (年名 || '')
											+ '/' + (月名 || '') + '/'
											+ (起始日碼 || '') + ']');
									month_data = null;
								}

							} else if (leap_month_index_base_2) {
								library_namespace.error(
								//
								'pack_era: 本年有超過1個閏月！');
								month_data = null;

							} else {
								// 處理正常閏月。
								if (month_data) {
									leap_month_index_base_2 =
									// 二進位
									month_data.length
									//
									.toString(RADIX_2);
									// 預防
									// leap_month_index_base_2
									// 過短。
									leap_month_index_base_2
									//
									= LEAP_MONTH_PADDING
									//
									.slice(0, LEAP_MONTH_PADDING.length
									//
									- leap_month_index_base_2.length)
											+ leap_month_index_base_2;
								} else
									leap_month_index_base_2
									//
									= month_now;

								month_now--;
							}

							if (month_name = (年名 ? 年名 + '/' : '') + (月名 || '')
									+ (起始日碼 ? '/' + 起始日碼 : ''))
								month_name += '=';

							if (year_data[j] != (month_name += 日數))
								year_data[j] = month_name;

							if (年名 !== '' && !isNaN(年名)) {
								library_namespace.debug('year: ' + year_now
										+ ' → ' + 年名, 2);
								year_now = 年名;
							}

							if (月名 !== ''
									&& typeof 月名 === 'string'
									&& !isNaN(月名 = 月名.replace(
											MONTH_NAME_PATTERN, '$2'))
									&& month_now != 月名) {
								library_namespace.debug('month: ' + month_now
										+ ' → ' + 月名, 2);
								month_now = 月名;
							}

						} else if (year_data[j] != 日數)
							// 可省略起始日碼的情況。
							year_data[j] = 日數;

					}
				}

				if (month_data)
					if (日數 in MONTH_DAY_INDEX) {
						month_data.push(MONTH_DAY_INDEX[日數]);
					} else {
						library_namespace.warn(
						//
						'pack_era: 錯誤的日數？[' + 日數 + ']日。');
						month_data = null;
					}
			}

			if (month_data) {
				j = LUNISOLAR_MONTH_COUNT + (leap_month_index_base_2 ? 1 : 0);
				if (month_data.length < j) {
					// padding
					Array_push(
					//
					month_data, to_list(new Array(j + 1 - month_data.length)
							.join(0)));
				} else if (month_data.length > j) {
					library_namespace.warn('pack_era: 紀年 [' + 紀年名稱 + '] '
							+ year_now + '年：月分資料過長！ (' + month_data.length
							+ '>' + j + ') month_data: ' + month_data);
				}

				if (library_namespace.is_debug(2))
					j = '] ← ['
							+ month_data.join('')
							+ (leap_month_index_base_2 ? ' '
									+ leap_month_index_base_2 : '') + '] ← ['
							+ year_data.join(pack_era.month_separator) + ']';
				month_data = parseInt(
				// 為了保持應有的長度，最前面加上 1。
				'1' + month_data.join('') + leap_month_index_base_2, RADIX_2)
				//
				.toString(PACK_RADIX);

				if (month_data.length > YEAR_CHUNK_SIZE)
					library_namespace.warn('pack_era: 紀年 [' + 紀年名稱 + '] '
							+ year_now + '年：月分資料過長！ (' + month_data.length
							+ '>' + YEAR_CHUNK_SIZE + ') month_data: '
							+ month_data);
				else if (month_data.length < YEAR_CHUNK_SIZE
				// 非尾
				&& i < 年度月分資料.length - 1) {
					if (month_data.length < YEAR_CHUNK_SIZE - 1
					// 非首
					&& i > 0)
						// 非首非尾
						library_namespace.warn('pack_era:紀年 [' + 紀年名稱 + '] '
								+ year_now + '年：月分資料過短！ (' + month_data.length
								+ '<' + YEAR_CHUNK_SIZE + ') month_data: '
								+ month_data);
					// 注意：閏月之 index 是 padding 前之資料。
					month_data += PACKED_YEAR_CHUNK_PADDING.slice(0,
							YEAR_CHUNK_SIZE - month_data.length);
				}
				library_namespace.debug('[' + month_data + j, 2);

				if (i === 0 && /\=./.test(year_data[0]))
					month_data = year_data[0].replace(/[^=]+$/, '')
							+ month_data;
				年度月分資料[i] = month_data;

			} else {
				// 可能只是 to_era_Date() 在作測試，看是否能成功解析。
				if (library_namespace.is_debug())
					library_namespace.warn(
					//
					'pack_era: 無法壓縮紀年 [' + 紀年名稱 + '] ' + year_now + '年資料 ['
							+ year_data.join(pack_era.month_separator) + ']');
				// 年與年以 pack_era.year_separator 分隔。
				// 月與月以 pack_era.month_separator 分隔。
				年度月分資料[i] = (前項已壓縮 ? pack_era.year_separator : '')
						+ year_data.join(pack_era.month_separator)
						+ pack_era.year_separator;
			}

			前項已壓縮 = !!month_data;
		}

		年度月分資料[i - 1] = 前項已壓縮 ? 年度月分資料[i - 1].replace(/\s+$/, '')
				: 年度月分資料[i - 1].slice(0, -1);

		起訖時間[0] = normalize_date(起訖時間[0], 起訖時間[2] || PASS_PARSER);
		if (!持續日數_PATTERN.test(起訖時間[1]))
			// assert: isNaN(起訖時間[1])
			起訖時間[1] = normalize_date(起訖時間[1], 起訖時間[2] || PASS_PARSER);
		// 去掉相同年分。
		// 800/1/1－800/2/1 → 800/1/1–2/1
		if ((i = 起訖時間[0].match(/^[^\/]+\//)) && 起訖時間[1].indexOf(i = i[0]) === 0)
			起訖時間[1] = 起訖時間[1].slice(i.length);
		packed_era_data = [ 紀年名稱, (起訖時間[2] ? 起訖時間[2] + ':' : '')
		//
		+ 起訖時間[0] + PERIOD_DASH + 起訖時間[1], 年度月分資料.join('') ];

		// 添加其他附加屬性名稱。
		for (i in plain_era_data)
			if (!(i in to_skip))
				// TODO: 檢查屬性是否有特殊字元。
				packed_era_data.push(i + '=' + plain_era_data[i]);

		return packed_era_data.join(pack_era.field_separator);
	}

	parse_era.inherit = '=';
	pack_era.field_separator = '|';
	// assert: .length === 1
	pack_era.year_separator = '\t';
	// assert: .length === 1
	pack_era.month_separator = ';';
	pack_era.era_name_separator = pack_era.month_separator;

	pack_era.era_name_classifier = '/';
	pack_era.era_name_重複起頭 = new RegExp('^\\' + pack_era.era_name_classifier
			+ '{2,}');
	// 應當用在 "朝代//" 的情況，而非 "/君主/"。
	pack_era.era_name_符號結尾 = new RegExp('\\' + pack_era.era_name_classifier
			+ '+$');

	// ---------------------------------------------------------------------//
	// private 工具函數。

	// set time zone / time offset (UTC offset by minutes)
	function set_minute_offset(date, minute_offset, detect_if_configured) {
		// 偵測/預防重複設定。
		if (detect_if_configured)
			if ('minute_offset' in date) {
				// 已設定過。
				if (date.minute_offset !== minute_offset)
					library_namespace.error('set_minute_offset: 之前已將 ' + date
							+ ' 設定成 ' + date.minute_offset + ' 分鐘，現在又欲設定成 '
							+ minute_offset + ' 分鐘！');
				return;
			} else
				date.minute_offset = minute_offset;
		date.setMinutes(date.getMinutes() - minute_offset);
	}

	function create_era_search_pattern(get_pattern) {
		if (!era_search_pattern) {
			era_key_list = [];
			for ( var key in search_index)
				era_key_list.push(key);
			library_namespace.debug(
			//
			'初始化 search pattern: ' + era_key_list.length + ' era keys', 3);

			// 排序:長的 key 排前面。
			era_key_list.sort(function(key_1, key_2) {
				return key_2.length - key_1.length || era_count_of_key(key_2)
						- era_count_of_key(key_1);
			});
			// 從最後搜尋起。
			// 從後端開始搜尋較容易一開始就取得最少的候選者（越後面特異度越高），能少做點處理，較有效率。
			// 且可能較正確。 e.g., "他國王+紀年+年"，應優先選用 紀年+年 而非 他國王+年。
			// 因為採用 /().*?$/ 的方法不一定能 match 到所需（按順序）的 key，只好放棄
			// /().*?$/。
			era_search_pattern = new RegExp('(?:' + era_key_list.join('|')
			// escape.
			.replace(/([()])/g, '\\$1')
			// 處理 space。
			.replace(/\s+/g, '\\s*') + ')$',
			// 對分大小寫之名稱，應允許混用。
			'i');
		}

		return get_pattern ? era_search_pattern : era_key_list;
	}

	// private 工具函數。
	function compare_start_date(era_1, era_2) {
		return era_1.start - era_2.start;
	}

	// 避免重複設定或覆蓋原有值。 set_attribute()
	// object[key] = value
	// TODO: {Array}value
	function add_attribute(object, key, value, prepend) {
		if (key in object) {
			// 有衝突。
			var values = object[key];
			if (Array.isArray(values)) {
				// 不重複設定。
				if (!values.includes(value))
					// prepend or append
					if (prepend)
						values.unshift(value);
					else
						values.push(value);
			} else if (values !== value)
				object[key] = prepend ? [ value, values ] : [ values, value ];
		} else {
			// 一般情況。
			object[key] = value;
		}
	}

	function parse_month_name(月名, 月名_Array) {
		月名 = 月名.split(pack_era.month_separator);
		if (月名.length > 0) {
			if (!Array.isArray(月名_Array))
				月名_Array = [];

			var index = 0, matched;
			月名.forEach(function(名) {
				名 = 名.trim();
				if ((matched = 名.match(/^(\d+)\s*:\s*(.+)$/))
						&& START_MONTH <= matched[1])
					index = matched[1] - START_MONTH, 名 = matched[2];
				if (名)
					月名_Array[index++] = 名;
			});
		}

		return 月名_Array;
	}

	function get_closed_year_start(date) {
		var year = date.getFullYear(), 前 = new Date(0, 0),
		// 僅使用 new Date(0) 的話，會含入 timezone offset (.getTimezoneOffset)。
		// 因此得使用 new Date(0, 0)。
		後 = new Date(0, 0);

		// incase year 0–99
		前.setFullYear(year, 0, 1);
		後.setFullYear(year + 1, 0, 1);

		return date - 前 < 後 - date ? 前 : 後;
	}

	// 處理朝代紀年之 main functions。

	// build data (using insertion):
	// parse era data
	function parse_era(era_data_array, options) {
		if (!era_data_array) {
			// Invalid input.
			if (options && options.國家) {
				// 可能由CeL.env.era_data_load()篩選過。
				library_namespace.error('Unknown country: ' + options.國家);
			}
			return;
		}

		function pre_parse_紀年資料(index) {
			var i, j, 附加屬性, era_data = era_data_array[index];
			if (typeof era_data === 'string')
				era_data = era_data.split(pack_era.field_separator);

			else if (library_namespace.is_Object(era_data)) {
				附加屬性 = era_data;
				if (era_data.data) {
					era_data = era_data.data.split(pack_era.field_separator);
					delete 附加屬性.data;
				} else
					era_data = [];

				for (i in 紀年名稱索引值)
					// 當正式名稱闕如時，改附加屬性作為正式名稱。
					if (!era_data[j = 紀年名稱索引值[i]] && (i in 附加屬性)) {
						era_data[j] = 附加屬性[i];
						delete 附加屬性[i];
					}
			}

			if (!Array.isArray(era_data) || era_data.length < 2) {
				library_namespace.error('parse_era.pre_parse_紀年資料: 無法判別紀年 ['
						+ index + '] 之資料！');
				return;
			}

			if (!era_data.parsed) {

				if (era_data.length < 3) {
					if (library_namespace.is_Object(i = era_data[1]))
						附加屬性 = i;
					else
						i = [ i ];
					era_data = era_data[0].split(pack_era.field_separator);
				} else
					i = era_data.slice(3);

				if (!附加屬性)
					附加屬性 = Object.create(null);
				i.forEach(function(pair) {
					pair = pair.trim();
					if (j = pair.match(
					// 允許 "\n"
					/^([^=]+)=([\s\S]+)$/))
						add_attribute(附加屬性, j[1].trim(), j[2].trim());
					else if (/^[^\s,.;]+$/.test(pair))
						// 當作屬性名稱，預設將屬性定為 true。
						add_attribute(附加屬性, pair, true);
					else
						library_namespace.warn(
						//
						'pre_parse_紀年資料: 無法解析屬性值[' + pair + ']！');
				});

				era_data.length = 3;
				era_data[3] = 附加屬性;
				era_data.parsed = true;
				// 回存。
				era_data_array[index] = era_data;
			}
			return era_data;
		}

		// 前置處理。
		if (!library_namespace.is_Object(options))
			options = Object.create(null);

		if (!Array.isArray(era_data_array))
			era_data_array = [ era_data_array ];

		// 主要功能。
		var 前一紀年名稱 = [],
		//
		國家 = options.國家 || parse_era.default_country,
		/** {Era}上一紀年資料 @ era_list。 */
		last_era_data,
		// 紀元所使用的當地之 time zone / time offset (UTC offset by minutes)。
		// e.g., UTC+8: 8 * 60 = 480
		// e.g., UTC-5: -5 * 60
		minute_offset = era_data_array.minute_offset
		// 直接將時間設定成「紀元使用地真正之時間」使用。
		// (era_data_array.minute_offset || 0) +
		// String_to_Date.default_offset
		;

		function for_era_data(era_data, index) {

			if (!(era_data = pre_parse_紀年資料(index)))
				return;

			var tmp, i, j, k,
			// 紀年:紀年名稱
			紀年 = era_data[0],
			/** {Array}起訖日期 [ {Date}起, {Date}訖, parser ] */
			起訖 = era_data[1],
			//
			曆數 = era_data[2], 附加屬性 = era_data[3];

			// 至此已定出 (紀年), (起訖), (曆數), (其他附加屬性)，接下來作進一步解析。

			if (紀年 && !Array.isArray(紀年))
				紀年 = String(紀年).split(pack_era.era_name_classifier);
			if (!紀年 || 紀年.length === 0) {
				library_namespace.error('parse_era: 無法判別紀年 [' + index
						+ '] 之名稱資訊！');
				return;
			}

			library_namespace.debug(
			//
			'前期準備：正規化紀年 [' + 紀年 + '] 之名稱資訊。', 2);

			// 紀年 = [ 朝代, 君主(帝王), 紀年 ]
			// 配合 (紀年名稱索引值)
			if (紀年.length === 1 && 紀年[0]) {
				// 朝代兼紀年：紀年=朝代
				前一紀年名稱 = [ 紀年[2] = 紀年[0] ];

			} else {
				if (!紀年[0] && (tmp = 前一紀年名稱.length) > 0) {
					// 填補 inherited 繼承值/預設值。
					// 得允許前一位有紀年，後一位無；以及相反的情況。
					紀年.shift();
					tmp -= 紀年.length;
					// 3 = 最大紀年名稱資料長度 = 紀年名稱索引值.國家
					Array.prototype.unshift.apply(紀年, 前一紀年名稱.slice(0,
							tmp > 1 ? tmp : 1));
				}
				紀年.forEach(function(name, index) {
					if (name === parse_era.inherit) {
						if (!前一紀年名稱[index])
							library_namespace.error('parse_era: 前一紀年 ['
							//
							+ 前一紀年名稱 + '] 並未設定 index [' + index + ']！');
						紀年[index] = 前一紀年名稱[index] || '';
					}
				});

				// do clone
				前一紀年名稱 = 紀年.slice();
				if (紀年[1] && !紀年[2])
					// 朝代/君主(帝王)：紀年=君主(帝王)
					紀年[2] = 紀年[1];
			}

			// 處理如周諸侯國之類。
			tmp = 紀年[0].match(國_PATTERN);
			// 例如:
			// 魯國/昭公 → 魯國/魯昭公
			// 秦國/秦王政 → 秦國/秦王政 (no change)
			if (tmp && !紀年[1].includes('國') && !紀年[1].includes(tmp = tmp[1])) {
				// add_attribute(附加屬性, '君主', tmp[1] + 紀年[1]);

				// 直接改才能得到效果。
				紀年[1] = tmp + 紀年[1];
			}

			紀年.reverse();

			if (國家) {
				if (!紀年[3])
					紀年[3] = 國家;

				tmp = 紀年[0].match(名稱加稱號_PATTERN);
				if (tmp) {
					// 為了parse不包括"天皇"，如 "推古９年" 的情況。
					紀年.push(tmp[1]);
				}
			}

			// assert: 至此
			// 前一紀年名稱 = [ 朝代, 君主(帝王), 紀年 ]
			// 紀年 = [ 紀年, 君主(帝王), 朝代, 國家 ]

			tmp = false;
			if (/\d$/.test(紀年[0])) {
				tmp = '紀年名稱 [' + 紀年[0] + ']';
			} else if (/\d$/.test(紀年[1])) {
				tmp = '君主名稱 [' + 紀年[1] + ']';
			}
			if (tmp) {
				tmp = 'parse_era: ' + tmp
				//
				+ ' 以阿拉伯數字做結尾，請改成原生語言之數字表示法，或如羅馬數字之結尾。'
				//
				+ '本函式庫以阿拉伯數字標示年分，因此阿拉伯數字結尾之名稱將與年分混淆。';
				// 注意: 這邊的警告在載入後會被清空。
				library_namespace.warn(tmp);
				// throw new Error(tmp);
			}

			library_namespace.debug(
			//
			'前期準備：正規化紀年 [' + 紀年 + '] 起訖日期。', 2);

			if (!(起訖 = parse_duration(起訖, 紀年)))
				if (options.extract_only)
					起訖 = [ new Date(0), new Date(0) ];
				else {
					library_namespace.error('parse_era: 跳過起訖日期錯誤的紀年資料！');
					return;
				}

			if (!起訖[0])
				if (index > 0)
					// 本一個紀年的起始日期接續上一個紀年。
					起訖[0] = era_data_array[index - 1].end;
				else if (options.extract_only)
					起訖[0] = new Date(0);
				else {
					library_namespace.error('parse_era: 沒有上一紀年以資參考！');
					return;
				}

			起訖[0] = normalize_date(起訖[0], 起訖[2], false, true);
			if (!起訖[0])
				throw new Error('parse_era: 未能 parse 起始日期: [' + 紀年 + ']！');

			if (起訖[1])
				// tmp 於此將設成是否取終點。
				tmp = true;
			else if ((tmp = pre_parse_紀年資料(index + 1))
			// 下一個紀年的起始日期接續本紀年，因此先分解下一個紀年。
			// assert: tmp[1](起訖) is String
			&& (tmp = parse_duration(tmp[1], tmp[0])) && tmp[0]) {
				起訖[1] = tmp[0];
				起訖[2] = tmp[2];
				// 既然直接採下一個紀年的起始日期，就不需要取終點了。
				tmp = false;
			} else if (options.extract_only)
				起訖[1] = new Date(0);
			else {
				library_namespace.error('parse_era: 無法求得紀年[' + 紀年.toString()
						+ ']之結束時間！');
				return;
			}

			if (持續日數_PATTERN.test(起訖[1])) {
				// 訖時間 "+d" : 持續日數
				tmp = +起訖[1];
				(起訖[1] = normalize_date(起訖[0], 起訖[2], true, true)).setDate(tmp);

			} else
				// 訖時間 "–y/m/d"
				起訖[1] = normalize_date(起訖[1], 起訖[2], tmp, true);

			last_era_data = {
				// 紀年名稱資訊（範疇小→大）
				// [ 紀年, 君主(帝王), 朝代, 國家, 其他搜尋 keys ]
				name : 紀年,

				// {Date}起 標準時間(如UTC+8),開始時間.
				start : 起訖[0],
				start_JDN : library_namespace.date.Date_to_JDN(起訖[0]),
				// {Date}訖 標準時間(如UTC+8), 結束時間.
				end : 起訖[1],
				end_JDN : library_namespace.date.Date_to_JDN(起訖[1]),

				// 共存紀年/同時存在紀年 []:
				// 在本紀年開始時尚未結束的紀年 list,
				contemporary : [],

				// 年分起始 Date value (搜尋用) [ 1年, 2年, .. ],
				// year_tart:[],

				// 曆數/歷譜資料:
				// 各月分資料 [ [1年之月分資料], [2年之月分資料], .. ],
				// 這邊還不先作處理。
				calendar : 曆數

			// { 其他附加屬性 : .. }
			};

			// 處理 time zone / time offset (UTC offset by minutes)
			if (!isNaN(minute_offset)) {
				// 注意:這邊不設定真正的 date value，使得所得出的值為「把本地當作紀元所使用的當地」所得出之值。
				last_era_data[MINUTE_OFFSET_KEY] = minute_offset;
				// set_minute_offset(起訖[0], minute_offset, true);
				// set_minute_offset(起訖[1], minute_offset, true);
			}

			// assert: 至此
			// 起訖 = [ 起 Date, 訖 Date, parser ]

			last_era_data = new Era(last_era_data);

			library_namespace.debug('add period [' + 紀年 + ']。', 2);

			i = 紀年名稱索引值.國家;
			k = undefined;
			tmp = period_root;
			// [ , 君主, 朝代, 國家 ]
			var period_attribute_hierarchy = [];
			for (var start = 起訖[0].getTime(),
			//
			end = 起訖[1].getTime();;) {
				// 若本 era 之時間範圍於原 period 外，
				// 則擴張 period 之時間範圍以包含本 era。
				if (!(tmp.start <= start))
					tmp.start = start;
				if (!(end <= tmp.end))
					tmp.end = end;

				if (!(j = 紀年[i]) || i <= 0) {
					if (j || (j = k)) {
						if (!tmp.era)
							tmp.era = Object.create(null);
						add_attribute(tmp.era, j, last_era_data);
						if (library_namespace.is_debug()
								&& Array.isArray(tmp.era[j]))
							library_namespace.warn(
							//
							'add_attribute: 存在相同朝代、名稱重複之紀年 '
									+ tmp.era[j].length + ' 個: '
									+ last_era_data);
					}
					break;
				}

				k = j;
				if (!(j in tmp.sub))
					tmp.add_sub(start, end, j);

				period_attribute_hierarchy[i--]
				// move to sub-period.
				= (tmp = tmp.sub[j]).attributes;
			}

			library_namespace.debug('設定紀年[' + 紀年 + ']之搜尋用 index。', 2);

			紀年.forEach(function(era_token) {
				add_to_era_by_key(era_token, last_era_data);
			});

			library_namespace.debug(
			//
			'正規化紀年 [' + 紀年 + '] 之其他屬性。', 2);

			for (i in 附加屬性) {
				j = 附加屬性[i];
				if (i in Period_屬性歸屬) {
					i = Period_屬性歸屬[tmp = i];
					// now: tmp = name,
					// i = Period_屬性歸屬 index of name
					// e.g., tmp = 君主名, i = 1

					// 解開屬性值。
					// j = 'a;b' → k = [ 'a', 'b' ]
					if (Array.isArray(j)) {
						k = [];
						j.forEach(function(name) {
							Array_push(k, name
							//
							.split(pack_era.era_name_separator));
						});

					} else
						k = j.split(pack_era.era_name_separator);

					// 將屬性值搬移至 period_root 之 tree 中。
					// i === 0，即紀元本身時，毋須搬移。
					// 使用者測試資料時，可能導致 j 為 undefined。
					if (0 < i && (j = period_attribute_hierarchy[i])) {
						// j: attributes of hierarchy[i]
						// assert: Object.isObject(j)
						if (tmp in j)
							// 解決重複設定、多重設定問題。
							// assert: Array.isArray(j[tmp])
							Array_push(j[tmp], k);
						else
							j[tmp] = k;

						// 僅將(留下)君主、紀元年號相關的附加屬性供查閱，其他較高階的朝代、國家等則省略之。
						// 恐還需要更改 ((sign_note.copy_attributes))!
						if (Period_屬性歸屬[tmp] <= Period_屬性歸屬.君主)
							add_attribute(last_era_data, tmp, j[tmp]);
						// 實際效用:將此屬性搬移、設定到 period_root 之 tree 中。
						delete 附加屬性[tmp];
					}

					if (tmp in 紀年名稱索引值) {
						library_namespace.debug(
						// 設定所有屬性值之 search index。
						'設定紀年[' + 紀年 + ']之次要搜尋用 index ['
						// 例如: 元太祖→大蒙古國太祖
						+ tmp + '] (level ' + i + ')。', 2);
						k.forEach(function(name) {
							if (name
							//
							&& !紀年.includes(name)) {
								add_to_era_by_key(name,
								// 對 i 不為 0–2 的情況，將 last_era_data 直接加進去。
								i >= 0 ? 紀年[i] : last_era_data);

								// 實際效用:除了既定的((紀年名稱索引值))外，
								// ((紀年)) 都被拿來放屬性索引值。
								// TODO:
								// 對其他同性質的亦能加入此屬性。
								// 例如設定
								// "朝代=曹魏"
								// 則所有曹魏紀年皆能加入此屬性，
								// 如此則不須每個紀年皆個別設定。
								if (i === 0)
									// ((紀年)) === last_era_data.name
									紀年.push(name);
							}
						});
					}

				} else if (i === '月名' || i === MONTH_NAME_KEY) {
					if (j = parse_month_name(j, last_era_data[MONTH_NAME_KEY]))
						last_era_data[MONTH_NAME_KEY] = j;
				} else
					add_attribute(last_era_data, i, j);
			}

			// era.精=:歷史上這個時期曆法與公元的對照本來就無法追溯得精準至日，甚至曆法本身就不夠精準。
			// era.準=:歷史上這個時期曆法與公元的對照應該非常精準，但是本數據庫的資料準確程度不足。
			// era.疑=:歷史上這個時期曆法與公元的對照應該非常精準，本數據庫的資料尺度標示也很精準，但是本數據庫的資料實際上存在疑問、可能不準確。
			// era.傳說=:為傳說時代/神話之資料

			// 處理 accuracy/準度/誤差/正確度。
			if (!last_era_data.準) {
				for (i in 準確程度_ENUM) {
					// 這裡會設定如 era.準 = "疑"
					if (last_era_data[i]) {
						last_era_data.準 = i;
						break;
					}
				}
			}
			// check 準度。
			if (i = last_era_data.準) {
				if (!/^\d*[年月日]$/.test(i) && !(i in 準確程度_ENUM))
					library_namespace.warn('parse_era: 未支援紀年[' + 紀年
							+ ']所指定之準確度：[' + i + ']');
				if (!last_era_data.calendar && !last_era_data.精)
					last_era_data.精 = '年';
			}

			// 處理 precision/精度準度/精密度準確度。
			// cf. https://en.wikipedia.org/wiki/Module:Wikidata
			i = last_era_data.精;
			if (i === '年') {
				if (!last_era_data.calendar)
					last_era_data.calendar
					// 自動指定個常用的曆法。
					= ':' + standard_time_parser;
				last_era_data.大月 = CE_MONTH_DAYS;

			} else {
				if (i && i !== '月' && i !== '日')
					library_namespace.warn('parse_era: 未支援紀年[' + 紀年
							+ ']所指定之精密度：[' + i + ']');

				if (('歲首' in last_era_data)
				// 此處之"歲首"指每年開始之月序數，當前農曆為1。秦曆始於10。
				// 惟曆法上之"歲首"指每歲起算點(之月序數)。當前農曆之"歲"指冬至月首至冬至月首之間，"年"指正月首(1月1日)至正月首之間，故歲首為11月1日夜半(子夜時刻)。
				&& (i = last_era_data.歲首 | 0) !== START_MONTH
				//
				&& 0 < i && i <= LUNISOLAR_MONTH_COUNT)
					last_era_data.歲首序 = i - START_MONTH;

				if (!(0 < (last_era_data.大月 |= 0)) || last_era_data.大月 === 大月)
					delete last_era_data.大月;
			}

			if (last_era_data.參照用) {
				library_namespace.debug(
				//
				'為使後來的操作能利用此新加入紀年 [' + last_era_data
				//
				+ ']，重新設定 era_search_pattern。', 3);
				era_search_pattern = null;
			}

			if (options.extract_only)
				return;

			i = era_list.length;
			if (i === 0) {
				era_list.push(last_era_data);
				return;
			}

			if (起訖[0] - era_list[i - 1].end === 0) {
				// assert: 本紀年接續著上一個紀年。
				if (紀年[1] !== era_list[i - 1].name[1]) {
					last_era_data.name.前任 = era_list[i - 1].name;
					var _i = i, _前任 = era_list[i - 1].name[1];
					while (_i-- > 0 && _前任 === era_list[_i].name[1]) {
						era_list[_i].name.繼任 = 紀年;
					}
				} else if (era_list[i - 1].name.前任) {
					last_era_data.name.前任 = era_list[i - 1].name.前任;
				}
			}

			var start = 起訖[0], start_JDN = last_era_data.start_JDN,
			//
			contemporary = last_era_data.contemporary;

			// 紀年E 插入演算：
			// 依紀年開始時間，以 binary search 找到插入點 index。
			i -= 4;
			// 因為輸入資料通常按照時間順序，
			// 因此可以先檢查最後幾筆資料，以加快速度。
			if (i < 9) {
				i = 0;
			} else if (0 < era_list[i].start - start) {
				i = era_list.search_sorted(last_era_data, {
					comparator : compare_start_date,
					found : true,
					start : 0
				});
			}

			// 這一段其實可以不要。下一段while()可以補充這一段的功能。但是使用`.start_JDN`應該會比`.start`快一點點。
			while (i < era_list.length && era_list[i].start_JDN < start_JDN) {
				i++;
			}
			// assert: era_list[i].start_JDN >= start_JDN

			while (i < era_list.length && era_list[i].start - start <= 0) {
				// 預防本紀年實為開始時間最早者，
				// 因此在這邊才處理是否該插入在下一 index。

				// 因為 .search_sorted(, {found : true})
				// 會回傳 <= 的值，
				// 因此應插入在下一 index。

				// 這方法還會跳過相同時間的紀年，將本紀年插入在相同時間的紀念群最後面，成為最後一個。
				// 需要注意: [MINUTE_OFFSET_KEY]將會有作用，會按照時區排列。
				i++;
			}

			// 以 Array.prototype.splice(插入點 index, 0, 紀年) 插入紀年E，
			// 使本紀年E 之 index 為 (插入點 index)。
			era_list.splice(i, 0, last_era_data);

			// 向後處理"共存紀年" list：
			// 依紀年開始時間，
			// 將所有紀年E 之後(其開始時間 >= 紀年E 開始時間)，
			// 所有開始時間在其結束時間前的紀年，
			// 插入紀年E 於"共存紀年" list。
			for (k = last_era_data.end_JDN,
			// 從本紀年E 之下個紀年起。
			j = i + 1; j < era_list.length; j++) {
				// next {Era}
				tmp = era_list[j];
				if (tmp.start_JDN < k) {
					tmp = tmp.contemporary;
					tmp.push(last_era_data);
					if (tmp.length > 1) {
						// 不能保證依照 紀年開始時間 時序，應該插入在最後。
						tmp.sort(compare_start_date);
					}
				} else
					break;
			}

			// 處理與`last_era_data`同時開始之`.共存紀年` list：
			j = [];
			while (i > 0 && (tmp = era_list[--i]).start_JDN === start_JDN) {
				// tmp: 與`last_era_data`同時開始的紀年。
				j.unshift(tmp);
				tmp.contemporary.push(last_era_data);
			}

			// 向前處理"共存紀年" list：
			// 檢查前一紀年，
			// 與其"在本紀年開始時尚未結束的紀年 list"，
			// 找出所有(其結束時間 period_end > 紀年E 開始時間)之紀年，
			// 將之插入紀年E 之"共存紀年" list。
			tmp = era_list[i];
			tmp.contemporary.concat(tmp).forEach(function(era) {
				if (era.end - start > 0)
					contemporary.push(era);
			});
			// 為了按照 紀年開始時間 順序排列。
			if (j.length > 0)
				Array_push(contemporary, j);
		}

		era_data_array.forEach(for_era_data);

		if (last_era_data) {
			if (options.extract_only) {
				last_era_data.initialize();
				return last_era_data;
			}
			// 當有新加入者時，原先的 pattern 已無法使用。
			era_search_pattern = null;
		}
	}

	// ---------------------------------------------------------------------//
	// 工具函數。

	/**
	 * 對於每個朝代，逐一執行 callback。
	 * 
	 * @param {Function}callback
	 *            callback(dynasty_name, dynasty);
	 * @param {String|RegExp}[filter]
	 *            TODO
	 */
	function for_dynasty(callback, filter) {
		for ( var nation_name in period_root.sub) {
			var nations = period_root.sub[nation_name].sub;
			for ( var dynasty_name in nations)
				callback(dynasty_name, nations[dynasty_name]);
		}
	}

	/**
	 * 對於每個君主，逐一執行 callback。
	 * 
	 * @param {Function}callback
	 *            callback(monarch_name, monarch);
	 * @param {String|RegExp}[filter]
	 *            TODO
	 */
	function for_monarch(callback, filter) {
		for ( var nation_name in period_root.sub) {
			var nations = period_root.sub[nation_name].sub;
			for ( var dynasty_name in nations) {
				var dynasty = nations[dynasty_name].sub;
				for ( var monarch_name in dynasty)
					callback(monarch_name, nations[monarch_name]);
			}
		}
	}

	/**
	 * 為 era Date 添加上共存紀年。
	 * 
	 * @param {Date}date
	 * @param {Era}[指定紀年]
	 *            主要紀年
	 * @param {Object}[options]
	 *            附加參數/設定特殊功能與選項
	 * 
	 * @returns {Array} 共存紀年
	 */
	function add_contemporary(date, 指定紀年, options) {
		var tmp, date_index, time_offset = date.getTimezoneOffset()
				* ONE_MINUTE_LENGTH_VALUE,
		// 以當日為單位而非採用精準時間
		use_whole_day = options && ('use_whole_day' in options)
		//
		? options.use_whole_day
		//
		: 'precision' in date ? date.precision === 'day'
		//
		: date % ONE_DAY_LENGTH_VALUE === time_offset,
		// 沒意外的話，共存紀年應該會照紀年初始時間排序。
		// 共存紀年.start <= date < 共存紀年.end
		共存紀年,
		// 某時間點（時刻）搜尋演算：
		era_index = (options && Array.isArray(options.list)
		// 查詢某時間點（時刻）存在的所有紀年與資訊：
		// 依紀年開始時間，以 binary search 找到插入點 index。
		? options.list : era_list).search_sorted({
			start : date
		}, {
			comparator : compare_start_date,
			found : true
		}),
		//
		紀年 = era_list[era_index];

		if ((紀年.精 || 紀年.準
		// 準確程度_ENUM
		|| 紀年.疑 || 紀年.傳說) && (tmp = options && options.尋精準)) {
			tmp = Math.max(era_index - Math.max(2, tmp | 0), 0);
			for (date_index = era_index; date_index > tmp
			// 使用這方法不能保證無漏失，應該使用 (紀年.contemporary)。
			&& (共存紀年 = era_list[--date_index]).end - date > 0;)
				if (!共存紀年.精 && !共存紀年.準 && !共存紀年.疑
				// 盡可能向前找到精密暨準確的紀年。
				&& 共存紀年.Date_to_date_index(date)) {
					era_index = date_index;
					紀年 = 共存紀年;
					break;
				}
		}

		if (era_index === 0 && date - 紀年.start < 0) {
			if (library_namespace.is_debug())
				library_namespace.warn('add_contemporary: 日期 ['
						+ date.format(standard_time_format) + '] 在所有已知紀年之前！');
			return;
		}

		// 至此 (era_list[era_index].start <= date)
		// 除非 date < era_list[0].start，那麼 (era_index===0)。

		共存紀年 = [];
		// 向前找。
		紀年.contemporary
		//
		.forEach(function(era) {
			// 檢查其"共存紀年" list，
			// 找出所有(所求時間 < 其結束時間 period_end)之紀年，即為所求紀年。
			if (date - era.end < 0 && (!era.參照用 || options.含參照用))
				共存紀年.push(era);
		});

		// 本紀年本身+向後找。
		// 為了待會取未交疊的相同國家紀年作為前後紀年，這邊不改變 era_index。
		for (date_index = era_index;
		//
		date_index < era_list.length; date_index++) {
			tmp = era_list[date_index];
			if (date - tmp.start < 0)
				break;
			else if (date - tmp.end < 0 && (!tmp.參照用 || options.含參照用))
				共存紀年.push(tmp);
		}

		if (options.era_only)
			return 共存紀年;

		if (指定紀年) {
			var 指定紀年名 = 指定紀年.name;
			if (Array.isArray(指定紀年名))
				指定紀年名 = 指定紀年名[0] || 指定紀年名[2];
			tmp = 共存紀年;
			共存紀年 = [];
			tmp.forEach(function(era) {
				// 去除指定紀年本身。
				if (era === 指定紀年)
					tmp = null;
				// 避免循環參照。
				else if (era.year_start || era.參照紀年 !== 指定紀年名)
					共存紀年.push(era);
			});

			if (tmp)
				// 不包含指定紀年本身。
				指定紀年 = null;
			else
				// 包含指定紀年本身。
				紀年 = 指定紀年;
		}

		// 取未交疊的相同國家紀年作為前後紀年。
		tmp = era_index;
		while (0 < tmp--)
			if (era_list[tmp].end - 紀年.start <= 0
			// 相同國家
			&& era_list[tmp].name[3] === 紀年.name[3]) {
				date.前紀年 = era_list[tmp].toString();
				break;
			}

		tmp = era_index;
		while (++tmp < era_list.length)
			if (紀年.end - era_list[tmp].start <= 0
			// 相同國家
			&& era_list[tmp].name[3] === 紀年.name[3]) {
				date.後紀年 = era_list[tmp].toString();
				break;
			}

		// 作結尾檢測 (bounds check)。
		if (紀年.end - date <= 0) {
			if (指定紀年) {
				if (library_namespace.is_debug())
					library_namespace.warn(
					//
					'add_contemporary: 日期 ['
							+ date.format(standard_time_format) + '] 在指定紀年 ['
							+ 指定紀年 + '] 之後！');
				return;
			}
			if (共存紀年.length === 0) {
				if (library_namespace.is_debug())
					library_namespace.warn('add_contemporary: 日期 ['
							+ date.format(standard_time_format)
							+ '] 在所有已知紀年之後！');
				return;
			}
			紀年 = 共存紀年[0];
		}

		// 至此已確定所使用紀年。
		共存紀年.紀年 = 紀年;

		if (共存紀年.length > 0) {
			if (typeof options.contemporary_filter === 'function')
				共存紀年 = 共存紀年.filter(options.contemporary_filter);
			tmp = [];
			共存紀年.forEach(function(era) {
				if (date_index = era.Date_to_date_index(date
				// 轉成目標共存紀年的當日零時。
				- time_offset + (era[MINUTE_OFFSET_KEY] || 0)
						* ONE_MINUTE_LENGTH_VALUE)) {
					// .日名(日序, 月序, 歲序) = [ 日名, 月名, 歲名 ]
					date_index = era.日名(date_index[2], date_index[1],
							date_index[0]).reverse();
					if (options.numeral) {
						date_index = numeralize_date_format(date_index,
								options.numeral);
					}

					// [ era, 年, 月, 日 ]
					var name = [ era ];
					name.toString = function() {
						return this.join('');
					};
					// add properties needed.
					for ( var 準確程度 in 準確程度_ENUM) {
						if (era[準確程度]) {
							// 特別標示存在疑問、不準確的紀年。
							name[準確程度] = era[準確程度];
						}
					}
					// 為需要以 space 間隔之紀元名添加 space。
					if (NEED_SPLIT_POSTFIX.test(name))
						name.push(' ');
					name.push(date_index[0] + (
					// era.年名 ||
					POSTFIX_年名稱));
					if (era.精 !== '年') {
						name.push(date_index[1] + '月');
						if (era.精 !== '月')
							name.push(date_index[2]
									+ (options.numeral === 'Chinese'
									//
									? '' : '日'));
					}
					if (options.add_country)
						name = [ era.name[紀年名稱索引值.國家], name ];
					tmp.push(name);
				}
			});
			if (tmp.length > 0)
				date.共存紀年 = tmp;
		}

		return 共存紀年;
	}

	// e.g., UTC+8: -8 * 60 = -480
	var present_local_minute_offset = (new Date).getTimezoneOffset() || 0;

	function offseted_value(minute_offset) {
		if (minute_offset === undefined)
			minute_offset = this[MINUTE_OFFSET_KEY];
		else if (minute_offset === '') {
			// 可用來還原 local 之時間。
			minute_offset = -this.getTimezoneOffset() || 0;
		}

		if (!isNaN(minute_offset)) {
			if (isNaN(this.original_value))
				this.original_value = this.getTime();
			return this.original_value
					- (minute_offset + (this.getTimezoneOffset() || 0))
					* ONE_MINUTE_LENGTH_VALUE;
		}
	}

	function adapt_minute_offset(minute_offset) {
		var offseted_value = this.offseted_value(minute_offset);
		if (!isNaN(offseted_value))
			this.setTime(offseted_value);
		return this;
	}

	function add_offset_function(date, 紀年) {
		if (MINUTE_OFFSET_KEY in 紀年) {
			date[MINUTE_OFFSET_KEY] = 紀年[MINUTE_OFFSET_KEY];
			date.offseted_value = offseted_value;

			// 注意:這邊不更改真正的 date value，使得所得出的值為「把本地當作紀元所使用的當地」所得出之值。
			// 例如求 "東漢明帝永平1年1月1日"，
			// 得到的是 date = "58/2/13 0:0 (UTC-5)"，
			// 實際上只是把本地（例如紐約）當作中國時，所得之時間。
			// 若須得到「紀元使用地真正之時間」（中國真正之時間） "58/2/13 0:0 (UTC+8)"，
			// 則得使用 date.adapt_offset()。
			// 再使用 date.adapt_offset('')，
			// 或 date.adapt_offset(-5*60)，
			// 或 date.adapt_offset(-date.getTimezoneOffset())，
			// 可以還原 local 之時間。
			if (false)
				date.adapt_offset = adapt_minute_offset;
		}
	}

	// ---------------------------------------------------------------------//
	// 應用功能。

	/**
	 * 取得 year CE 當年，特定之月日之日期。
	 * 
	 * @example <code>

	// gettext_config:{"id":"china"}
	CeL.era.Date_of_CE_year(1850, 1, 1, '中國');
	CeL.era.Date_of_CE_year(1850);

	 </code>
	 * 
	 * @param {Integer}year
	 *            CE year
	 * @param {Integer}[月]
	 *            month of era. default: START_MONTH = 1.
	 * @param {Integer}[日]
	 *            date of era. default: START_DATE = 1.
	 * @param {String}[era_key] //
	 *            gettext_config:{"id":"china"} e.g., '中國'
	 * 
	 * @returns {Date}
	 * 
	 * @since 2014/12/15 20:32:43
	 * 
	 */
	function get_Date_of_key_by_CE(year, 月, 日, era_key) {
		var 日期,
		// 7: 年中， (1 + LUNISOLAR_MONTH_COUNT >> 1)
		date = new Date((year < 0 ? year : '000' + year) + '/7/1'),
		//
		共存紀年 = add_contemporary(date, null, {
			era_only : true,
			尋精準 : true,
			list : !era_key || !(era_key = get_Date_of_key_by_CE.default_key)
			//
			? era_list : get_era_Set_of_key(era_key).values()
		});

		共存紀年.forEach(function(紀年) {
			if (!日期) {
				// [ 歲序, 月序, 日序 | 0 ]
				var date_index = 紀年.Date_to_date_index(date);
				日期 = 紀年.date_name_to_Date(紀年.歲名(date_index[0]), 月, 日, true);
			}
		});

		return 日期;
	}

	// gettext_config:{"id":"china"}
	get_Date_of_key_by_CE.default_key = '中國';

	// ---------------------------------------------------------------------//
	// 應用功能。

	/**
	 * date.getTimezoneOffset() 這個數字會隨著夏令時間、各個歷史時代而作調整，不一定和當前的時區相同。<br />
	 * `new Date(-1e13)` 會使 Chrome 69.0.3493.3 把台北標準時間從 GMT+0800 改成 GMT+0806。<br />
	 * new Date(-1e13).getTimezoneOffset()!==new Date().getTimezoneOffset()
	 * 因此利用UTC、Julian_day得出的時間，在`d.getMinutes()`的時候會產生誤差。此時需要做調整。
	 * 
	 * 注意: 這個調整最多只能做一次，之後若要演算也必須把時間調回來。
	 * 
	 * @param {Date}date
	 */
	function correct_timezone_offset(date) {
		var timezone_offset_min = date.getTimezoneOffset()
				- present_local_minute_offset;
		if (timezone_offset_min !== 0) {
			date.setMinutes(date.getMinutes() + timezone_offset_min);
		}
	}

	/**
	 * 傳入完整紀年日期，將之轉成具有紀年附加屬性的 Date。
	 * 
	 * @param {String|Object|Array|Date}date
	 *            所欲解析之完整紀年日期。<br />
	 *            era string<br /> { 國家:'', 朝代:'', 君主:'', 紀年:'', 日期:'' , ... }<br />
	 *            duration: [start_date, end_date]
	 * @param {Object}[options]
	 *            附加參數/設定特殊功能與選項. 此 options 可能會被變更!<br />
	 *            {String|Date}.base: base date. 會選出最接近此日期之紀年。<br /> //
	 *            gettext_config:{"id":"china"} {String}.range:
	 *            限定於此範圍內尋找紀年。e.g., '中國'<br />
	 *            {Boolean}.get_era: 僅回傳所解析出之紀年 {Era}。<br />
	 *            {Boolean}.get_era_list: 僅回傳所解析出之紀年 list: {Set}。<br />
	 *            {Boolean}.get_range: 僅回傳所解析出之期間: [ "前", "後" ]。<br />
	 *            {Boolean}.get_range_String: 僅回傳所解析出之期間: "前–後"。<br />
	 *            {Boolean}.era_only: 僅回傳所解析出之共存紀年 list: {Array}。<br />
	 *            {Boolean}.parse_only: 僅回傳所解析出之紀年資訊: [ 紀年_list, 紀年, 年, 月, 日 ]<br />
	 *            {Boolean}.is_era: 找不到可用之紀年時，直接 abort 跳出，回傳 undefined。<br />
	 *            {Boolean}.date_only: 僅回傳所解析出之{Date}紀年日期，不包括附加資訊。<br />
	 * 
	 * @returns {Date} 解析出之日期
	 */
	function to_era_Date(date, options) {
		library_namespace.debug('parse (' + typeof date + ') [' + date + ']',
				3, 'to_era_Date');

		// 前置處理。
		if (!library_namespace.is_Object(options))
			options = Object.create(null);

		if (!date)
			date = new Date();

		var 紀年_list, 紀年, origin = true, 指定紀年, tmp, tmp2;
		// 欲改變 紀年_list。
		function check_to_modify() {
			if (origin) {
				// 防止改變原先的 data。
				(紀年_list =
				//
				library_namespace.Set_from_Array(紀年_list)).名 = origin;
				origin = false;
			}
		}

		// 取 key 與 (紀年_list) 之交集。
		function get_intersection(key, no_expand) {
			if (key.start && key.end) {
				origin = false;
				(紀年_list = library_namespace.Set_from_Array(
				// or use: (紀年_list = new Set).add(key);
				// 紀年_list.名 = key.name;
				[ key ])).名 = key.name;
				return 紀年_list;
			}

			library_namespace.debug('Get 紀年 list of [' + key + ']', 2,
					'to_era_Date');
			var list = get_era_Set_of_key(key, no_expand);
			if (!list ||
			// assert: (Set)list
			list.size === 0)
				return;
			// 初次設定。
			if (!紀年_list) {
				if (key)
					origin = key;
				return 紀年_list = list;
			}

			library_namespace.debug('取交集 of [' + key + ']', 2, 'to_era_Date');
			紀年_list.forEach(function(era) {
				if (!list.has(era))
					check_to_modify(), 紀年_list['delete'](era);
			});

			if (Array.isArray(list = 紀年_list.values()))
				library_namespace.debug(
				//
				'取交集 [' + key + '] 得到 [' + list.join() + ']', 2, 'to_era_Date');
			return 紀年_list;
		}

		// 取得任何一個紀年作為主紀年。
		function get_next_era() {
			if (!紀年_list || 紀年_list.size === 0)
				return 紀年 = null;

			var key = 紀年_list.名 || origin || false;
			if (typeof key === 'string') {
				try {
					紀年_list.forEach(function(era) {
						if (era.name[0] === key) {
							library_namespace.debug('採用同名紀年 [' + era + ']', 2,
									'to_era_Date');
							紀年 = era;
							// TODO: 以更好的方法處理，不用 throw。
							// 只要有一些通過，就成。但((紀年_list))非Array，不能用.some()。
							throw 0;
						}
					});
				} catch (e) {
					return 紀年;
				}
			}

			try {
				紀年_list.forEach(function(era) {
					library_namespace.debug('採用紀年 [' + era + ']', 2,
							'to_era_Date');
					紀年 = era;
					// TODO: 以更好的方法處理，不用 throw。
					// 只要有一些通過，就成。但((紀年_list))非Array，不能用.some()。
					throw 0;
				});
			} catch (e) {
			}

			return 紀年;
		}

		if (typeof date === 'number')
			date = Math.abs(date) < 4000
			// 當作年分。
			? new Date(date, 0, 1)
			// 當作 date value。
			: new Date(date);

		else if (library_namespace.is_Object(date)) {
			library_namespace.debug('era information Object → Date', 3,
					'to_era_Date');

			// 從範圍小的開始搜尋。
			// TODO: 搜尋日期?
			for ( var i in 紀年名稱索引值)
				if (i = date[i])
					get_intersection(i);

			date = date.日期 || date.date;
		}

		if (typeof date === 'string') {
			library_namespace.debug('parse 紀年日期 string [' + date + ']', 3,
					'to_era_Date');

			// era information String
			// → era information Object
			var matched, 年, 月, 日, 偵測集 = [],
			// 正規化數字。
			numeralized = normalize_number(date = date.trim()),
			// 對每一個((偵測集))的字串，從後方開始一個個找到剛好符合紀元名稱的部分。
			// 會更改到((偵測集))
			search_era = function search_era() {
				// 通常後方的條件會比較精細。
				while (偵測集.length > 0) {
					var slice = 偵測集.pop();
					while (slice) {
						if (matched = slice.match(era_search_pattern)) {
							if (0 < matched.index)
								偵測集.push(
								// 放回前面尚未處理的部分。
								slice.slice(0, matched.index));
							if (false) {
								if (slice = slice.slice(
								// 放回後面尚未處理的部分:
								// 由於從後面找，保證了後面的不存在可符合的部分，因此現在用不到。
								matched.index + matched[0].length))
									偵測集.push(slice);
							}
							return matched;
						}
						// 自後頭一個一個剔除，以找到剛好符合的部分。
						// 因為era_search_pattern會符合以紀元名稱結尾。
						// TODO:
						// 使era_search_pattern匹配出現在中間的紀元名稱，不必一個個回退。
						slice = slice.slice(0, -1);
					}
				}
			};

			// --------------------------------------------
			// 開始解析。

			// 前置, 後置 改成 Array (紀年指示詞偵測集)，統一處理。
			if (tmp = numeralized.match(ERA_DATE_PATTERN)
			// 僅在應解析，但是沒解析出來的時候才增加新的pattern。
			// 若是能解析出固定錯誤模式，那麼應該要在下面 "if (tmp2)", "if (matched)" 這地方做修正。
			|| (tmp2 = numeralized.match(ERA_DATE_PATTERN_ERA_ONLY))
					|| (matched = numeralized.match(ERA_DATE_PATTERN_YEAR))) {
				library_namespace.debug('辨識出紀年+日期之樣式 [' + tmp + '] ('
				//
				+ (tmp2 ? 'ERA_DATE_PATTERN_ERA_ONLY'
				//
				: matched ? 'ERA_DATE_PATTERN_YEAR'
				//
				: 'ERA_DATE_PATTERN') + ')', 2, 'to_era_Date');

				// 中間多為日期，前後為紀年。
				年 = tmp[2];
				月 = tmp[3];
				日 = tmp[4];

				if (tmp2) {
					// .match(ERA_DATE_PATTERN_ERA_ONLY)
					// 減縮版 ERA_DATE_PATTERN: 省略日期，或亦省略月分。
					if (!月)
						if (日) {
							月 = 日;
							// 處理月相
							// e.g.,
							// '寶應二年三月晦日'
							matched = tmp[5].match(/^\s*([朔晦望])/);
							日 = matched ? matched[1] : '';
						} else if (!isNaN(numeralize_date_name(tmp[1] + 年))) {
							// 省略日期月分。修正僅有年分時出現之問題。
							// e.g., '五千六百七十八年', '前五千六百七十八年'
							年 = tmp[1] + 年;
							tmp[1] = '';
						}

				} else if (matched) {
					if (matched = tmp[5].match(/^月(?:([^日]{1,3})日?)?/)
					// .match(ERA_DATE_PATTERN_YEAR)
					// 減縮版 ERA_DATE_PATTERN: parse 年分 only。
					) {
						// e.g., '三月一日'
						月 = 年;
						年 = null;
						日 = matched[1];
						if (tmp[1] === '閏') {
							// e.g., tmp=[閏六月,閏,六,,,月]
							月 = tmp[1] + 月;
							tmp[1] = '';
						}
					} else if (tmp[5].charAt(0) === '日'
					// e.g., '一日'
					// 僅輸入單一干支，當作日干支而非年干支。
					// e.g.,
					// ('丁亥朔', {base : '寶應二年春正月'})
					|| options.base
					// 排除如"正月乙巳", "三月庚子"
					&& !/^(.+)月\s*$/.test(tmp[1])
					// 干支_PATTERN.test(年) 即: (( 年.length === 2 &&
					// !isNaN(library_namespace.stem_branch_index(年)) ))
					&& 干支_PATTERN.test(年)) {
						日 = 年;
						年 = null;
					} else if (!月 && !日) {
						if ((tmp[1] || tmp[5])
						// 此處((年))應該是年號中間的文字，只是被篩選到了。
						&& 單數字_PATTERN.test(年)) {
							// e.g., 百濟多婁王, 四条天皇天福, 四条天皇文暦, 後一条天皇長元.
							// 但須考量(剔除) "元至正十七"
							年 = '';
						} else if (tmp[5]
						// 修正僅有年分時出現之問題。
						// e.g., '五千六百七十八', '前五千六百七十八'
						&& !isNaN(numeralize_date_name(tmp[5]))) {
							年 += tmp[5];
							tmp[5] = '';
						} else if (干支_PATTERN.test(年)
						// 解析中文月分名稱如"正月乙巳", "三月庚子"，
						// 防止 CeL.era('正月乙巳',{base:'建隆元年',parse_only:true})
						// 被解析成 前置:正月,年:乙巳
						&& (matched = tmp[1].match(/^(.+)月\s*$/))) {
							日 = 年;
							月 = matched[1].trim();
							年 = null;
							tmp[1] = '';
							//
							date = null;
						} else if (干支_PATTERN.test(年)
						// 不能採用"&& !tmp[1]"，會無法正確解析'西涼太祖庚子三月'
						// 如農曆年月"乙巳正月"
						&& (matched = tmp[5].match(/^(.+)月(?:([^日]{1,3})日?)?/))) {
							月 = matched[1].trim();
							日 = matched[2];
							tmp[5] = '';
							//
							date = null;
						}
					}

					// 預防萬一，將 date 資料偵測一次。
					// 不用 numeralized，預防有些紀年名稱包含可被數字化的資料。
					偵測集.push(date, null);
				}

				// 依照習慣，前置多為(通常應為)紀年。
				tmp2 = tmp[1].replace(to_era_Date.ignore_pattern, '');
				if (tmp2 = numeralize_time(tmp2)) {
					if (tmp2 === numeralized.replace(/\s*\d+年[\s\S]*$/, '')) {
						// assert: 紀年名稱包含這個之類的數字，被正規化之後反而出錯。
						// e.g., "江戸朝廷後西天皇万治" 正規化→ "江戸朝廷後西天皇萬治"
						偵測集.push(date.replace(/\s*\d+年[\s\S]*$/, ''));
					} else {
						偵測集.push(tmp2);
					}
				}
				// 依照習慣，後置多為(通常應為)時間。
				tmp2 = tmp[5].replace(to_era_Date.ignore_pattern, '');
				if (tmp2 = numeralize_time(tmp2))
					偵測集.push(tmp2);

			} else {
				tmp2 = date.trim();
				if (options.base
						&& (tmp = tmp2.match(/([朔晦])日?/)
								|| tmp2.match(/^(望)日?$/)))
					日 = tmp[1];
				if (options.base && (tmp = tmp2.match(/([明隔去])年/)))
					年 = tmp[1];
				if (tmp = tmp2.replace(to_era_Date.ignore_pattern, ''))
					偵測集.push(tmp);
				library_namespace.debug('無法辨識出 [' + date + '] 之紀年樣式'
						+ (tmp ? '，直接當紀年名稱處理' : '') + '。', 2, 'to_era_Date');
			}

			// 首先確定紀年。
			if (偵測集.length > 0) {
				// backup(.clone): tmp2 自此當作時間偵測集。
				tmp2 = 偵測集.slice();

				if (!era_search_pattern)
					// 初始化 search pattern。
					create_era_search_pattern();

				do {
					// reset 紀年_list.
					紀年_list = undefined;
					if (search_era() && (tmp = get_intersection(matched[0]))
							&& tmp.size > 1) {
						// backup(.clone): 為了預防使用別名，因此不一開始就設定 no_expand。
						date = 偵測集.slice();
						// 進一步篩選，緊縮符合範圍。
						while (紀年_list.size > 1 && search_era()) {
							if (年 && tmp2[1] === null
							// 檢查((年))是否為紀年名稱之一部份。
							// 須考量(剔除) "文化14"
							&& matched[0].includes(年))
								// 表示((年))應該為紀年名稱之一部份。這樣就不應該設定((年))了。
								年 = '';
							get_intersection(matched[0]);
						}
						if (紀年_list.size > 1) {
							// 依舊有超過一個候選，則設定別擴大解釋。
							// revert, 重新 parse 一次。
							偵測集 = date;
							while (紀年_list.size > 1 && search_era())
								// 已經有太多匹配的了，因此設定 no_expand。
								get_intersection(matched[0], true);
						}
					}
					// "後一条天皇長元" 需要檢測到 (while ..) 這一項。
				} while ((!紀年_list || 紀年_list.size === 0) && 偵測集.length > 0);
			} else {
				tmp2 = null;
			}

			// 避免如 "三月庚子" 被解析成 "太祖庚子"
			// 避免如 "十二月丁未" 被解析成 "丁先皇帝太平"
			if (紀年_list && 紀年_list.size > 0
			// 避免 資治通鑑/卷022#征和二年（庚寅，公元前九一年）
			// https://zh.wikisource.org/wiki/User_talk:Kanashimi/era_note.js#%E5%85%B3%E4%BA%8E%E6%AD%A4%E5%B7%A5%E5%85%B7
			&& (options.base || !年 && 月) && 干支_PATTERN.test(日)) {
				// console.log([ date, 年, 月, 日 ]);
				紀年_list.forEach(function(era) {
					if (era.name.some(function(name) {
						return 日.includes(name);
					})) {
						check_to_modify();
						// 刪掉不合適的紀年。
						紀年_list['delete'](era);
					}
				});
			}
			// console.log([ date, 紀年_list ]);

			if (date = options.base) {
				if (!Array.isArray(date)
				//
				&& !is_Date(date)) {
					tmp = to_era_Date(date, {
						parse_only : true
					});
					date = tmp[1] && tmp[0] && tmp[0].size > 0 ? tmp
							: numeralize_date_name(date).to_Date(
									standard_time_parser);
				}

				// assert: date(=options.base) 為 Date
				// 或 [ {Set}紀年_list, {Era}紀年, 年, 月, 日 ]。

				if (Array.isArray(date)) {
					// e.g.,
					// options.base 之後，第一個符合 argument(date) 的日期。
					// CeL.era('二年春正月丁亥朔', {base : '寶應元年'})
					// CeL.era('丁亥朔', {base : '寶應元年二年春正月'})
					// CeL.era('明年',{base:'嘉靖元年'})

					tmp = [ 年, 月, 日 ];
					for (matched = 0; matched < tmp.length; matched++)
						if (tmp[matched])
							break;
					switch (matched) {
					// 此處需要與 options.parse_only 之 return 配合。
					case 3:
						日 = date[4];
					case 2:
						月 = date[3];
					case 1:
						年 = date[2];
					case 0:
						origin = true;
						紀年_list = date[0];
						tmp = 0;
						// 明年
						if (/[明隔]/.test(年))
							tmp = 1;
						else if (/[去]/.test(年))
							tmp = -1;
						if (tmp)
							// assert: numeralize_date_name('元') === '1'
							年 = +(date[2] > 0 ? date[2]
									: numeralize_date_name(date[2]))
									+ tmp;
					}

				} else if (date && !isNaN(date.getTime())) {
					if (紀年_list && 紀年_list.size > 0) {
						if (紀年_list.size > 1) {
							// e.g.,
							// CeL.era('建武二年',{parse_only:true,base:CeL.era('大明八年',{date_only:true})})
							tmp = date.getTime();
							matched = Array.from(紀年_list).map(function(era) {
								var distance = tmp < era.start.getTime()
								// 取得與基準日期的距離。
								? era.start.getTime() - tmp
								//
								: era.end.getTime() < tmp
								//
								? tmp - era.end.getTime() : 0;
								return [ era, distance ];
							}).sort(function(_e1, _e2) {
								return _e1[1] - _e2[1];
							});
							紀年_list = new Set;
							// 選取與基準日期date最接近的候選紀年。
							// 每一個候選紀年與基準日期date的差距不可太大。
							matched.some(function(_e) {
								紀年_list.add(_e[0]);
								// 這邊可以控制想要篩選的最低數量。
								return _e[1] > 0;
							});
						}

					} else {
						// e.g.,
						// ('庚辰年庚辰月庚辰日庚辰時', {base : '1850年'})

						// 針對歲次特別做修正。
						// 注意:非泛用方法。
						if (紀年 = library_namespace.stem_branch_index(年)) {
							tmp = library_namespace.SEXAGENARY_CYCLE_LENGTH;
							// 計算差距年數。
							if (紀年 = (紀年 - (date.getFullYear() - library_namespace.YEAR_STEM_BRANCH_EPOCH))
									% tmp) {
								if (紀年 < 0)
									紀年 += tmp;
								if (紀年 > tmp >> 1)
									紀年 -= tmp;
								// 重設年分。
								date.setFullYear(年 = date.getFullYear() + 紀年);
							}
						}

						// 找出最接近date的日期。
						// 注意:這邊採用的方法並不完備。
						紀年 = era_list.search_sorted({
							start : date
						}, {
							comparator : compare_start_date,
							found : era_list
						});
						if (紀年)
							紀年_list = library_namespace
									.Set_from_Array(紀年.contemporary.concat(紀年));
					}
				}
			}

			if (options.parse_without_check) {
				// e.g., do not check range
				return [ 紀年_list, 年, 月, 日 ];
			}

			// TODO: 篩選*所有*可用之紀年。
			if (!('strict' in options)
			//
			&& 紀年_list && 紀年_list.size > 1) {
				// 有多個選擇，因此嚐試嚴格篩選。
				options.strict = true;
			}
			if (tmp = options.period_end) {
				// 取得結束時間。else: 取得開始時間。
				tmp = 日 ? 1 : 月 ? 2 : 年 ? 3 : 4;
			}
			// 從紀年、日期篩選可用之紀年，取得 Date。
			date = null;
			while (get_next_era()
					&& (!(date = 紀年.date_name_to_Date(年, 月, 日, options.strict,
							tmp))
					// 在紀年範圍外。
					|| isNaN(date.getTime()))) {
				check_to_modify();
				// 刪掉不合適的紀年。
				紀年_list['delete'](紀年);
				date = 紀年 = null;
			}

			if (紀年) {
				指定紀年 = 紀年;
				if (紀年_list.size > 1) {
					// 可能是相同紀年之延續。現有元文宗天曆、太平天囯具此情況。
					tmp = [];
					紀年_list.forEach(function(era) {
						if (!tmp.includes(
						// 僅記錄未重複的紀年，忽略重複的紀年名稱。
						era = era.toString()))
							tmp.push(era);
					});
					// tmp = Array.from(紀年_list).unique()
					if (tmp.length > 1) {
						// 有超過1個紀年。
						if (options.pick) {
							tmp = options.pick(tmp) || tmp;
						} else {
							if (false && options.base) {
								library_namespace.log('base: ' + options.base);
							}
							if (library_namespace.is_debug()) {
								library_namespace.warn('to_era_Date: 共取得 '
										+ tmp.length + ' 個可能的紀年名稱！ ['
										+ tmp.join(', ') + ']');
							}
						}
					}
				}

			} else if (tmp = numeralized.match(
			// assert: !紀年_list || 紀年_list.size === 0 未特定紀年。
			/^(JDN?)\s*(\d+(?:.\d*)?)$/i)) {
				date = library_namespace.JD_to_Date(tmp[2]);
				// 此時不該當作符合了。

			} else if (library_namespace.is_debug()
			//
			&& arguments[0]) {
				library_namespace.info([ 'to_era_Date: 無法自 [', {
					b : arguments[0],
					S : 'color:#e92;'
				}, '] 辨識出特殊地域之紀年名稱。（時間不在所求紀年範圍內？）',
				//
				'將視為' + standard_time_parser_name
				//
				+ '紀年時間，嘗試以日期解析器 [', standard_time_parser, '] 解析。' ]);
			}

			// 警告:請勿隨意更改這些回傳值，因為他們也為 module 內部其他功能所用!
			if (options.get_era)
				return 紀年;
			if (options.get_era_list
			// 若是還未能解析出特殊紀年，例如輸入公元紀年，則待後面再行處理。
			&& 紀年)
				return 紀年_list;
			if (options.parse_only)
				return [ 紀年_list, 紀年, 年, 月, 日 ];

			if (date) {
				if (options.get_range_String
				//
				&& !options.get_range)
					options.get_range = -1;
				if (options.get_range) {
					// shift microseconds
					tmp2 = typeof options.get_range === 'boolean' ? 0
							: options.get_range | 0;

					if (!年 || isNaN(年 = numeralize_date_name(年)))
						tmp = new Date(紀年.end.getTime() + tmp2);
					else {
						// [ 歲序, 月序, 日序 | 0 ]
						tmp = 紀年.Date_to_date_index(date);
						if (!月)
							tmp = new Date(紀年.year_start[tmp[0] + 1] + tmp2);
						else if (!日)
							tmp = new Date(date.getTime() + tmp2
							//
							+ (紀年.calendar[tmp[0]][tmp[1]] - tmp[2])
									* ONE_DAY_LENGTH_VALUE);
						else
							tmp = new Date(date.getTime() + tmp2
									+ ONE_DAY_LENGTH_VALUE);
					}
					// 警告:未處理 options.minute_offset。
					// 警告:跨統治者的紀年，或紀年末的情況可能會出錯。

					tmp2 = options.get_range_String;
					if (!tmp2)
						return [ date, tmp ];

					correct_timezone_offset(date);
					correct_timezone_offset(tmp);

					// treat options.get_range_String as format
					date = date.format(tmp2);
					tmp = tmp.format(tmp2);
					if (date !== tmp) {
						// 起始、結束於不同一天。
						紀年 = /^([^年]+)年/;
						年 = date.match(紀年);
						if (年
						//
						&& (tmp2 = tmp.match(紀年))
						// 去除同一年。
						&& 年[1] === tmp2[1])
							tmp = tmp.replace(紀年, '');
						date += PERIOD_DASH + tmp;
					}
					// for 公元前。
					return date.replace(/-(\d+年)/g, '前$1');
				}

			} else if (options.is_era) {
				// 找不到可用之紀年，卻 must era；直接 about。
				return;

			} else if (年 && !isNaN(年 = numeralize_date_name(年))) {
				// 視為標準紀年時間（如公元），嘗試以日期解析器解析
				date = ((年 < 0 ? 年 : 年.pad(4)) + POSTFIX_年名稱
				//
				+ (月 ? (numeralize_date_name(月) || START_MONTH) + '月'
				//
				+ (日 ? (numeralize_date_name(日) || START_DATE) + '日' : '')
				//
				: '')).to_Date({
					parser : standard_time_parser,
					period_end : options.period_end
				});

				library_namespace.debug('parsed date: [' + date + ']', 3,
						'to_era_Date');
				if (!date || isNaN(date.getTime())) {
					// 可能到這邊的:如 '1880年庚辰月庚辰日庚辰時'。
					// 從 era_list.search_sorted() 擇出所有可能候選。
					var 候選,
					//
					紀年起序 = era_list.search_sorted({
						// 年初
						start : new Date(年 | 0, 0, 1)
					}, {
						comparator : compare_start_date,
						found : true
					}), 紀年迄序 = era_list.search_sorted({
						// 年尾
						start : new Date(年 + 1, 0, 1)
					}, {
						comparator : compare_start_date,
						found : true
					});
					// 找出所有可能之共存紀年。
					紀年_list = era_list[紀年起序].contemporary.concat(era_list
							.slice(紀年起序, 紀年迄序 + 1));

					for (date = new Date(年 | 0, 6, 1), 紀年起序 = 0;
					// 紀年起序 as tmp
					紀年起序 < 紀年_list.length; 紀年起序++) {
						紀年 = 紀年_list[紀年起序];
						候選 = 紀年.Date_to_date_index(date);
						if (候選 && (候選
						// 確定共存紀年延續至當年中。
						= 紀年.date_name_to_Date(紀年.歲名(候選[0]), 月, 日)))
							break;
					}

					date = 候選;
					if (!date) {
						library_namespace.warn(
						//
						'to_era_Date: 無可選的紀年。將 ['
						//
						+ numeralized + '] 當作系統日期 ' + 年 + '/'
						//
						+ (numeralize_date_name(月) || START_MONTH)
						//
						+ '/' + (numeralize_date_name(日) || START_DATE) + '。');
						// 沒當作公元日期的原因，是當前尚不能正反解析如"公元8899年1月1日"之類。
						date = new Date(年,
						//
						(numeralize_date_name(月) || START_MONTH) - 1,
						//
						numeralize_date_name(日) || START_DATE);
						紀年_list = null;
					}
				}
			}

			if (!date)
				// 死馬當活馬醫。
				// 不可用 DEFAULT_DATE_PARSER，恐造成循環參照。
				date = String(
						library_namespace.from_Chinese_numeral(numeralized))
						.to_Date(standard_time_parser);

			if (date && tmp2) {
				while (0 < tmp2.length) {
					if ((tmp = tmp2.pop())
					//
					&& (tmp = String(library_namespace
					//
					.from_Chinese_numeral(tmp))
					//
					.replace(/^\D+/, '').replace(/[^\d時分秒]+$/, ''))
					// e.g., '五千六百七十八', '前五千六百七十八'
					&& !(Math.abs(tmp) > 60)
					//
					&& (tmp = String_to_Date(tmp))
					//
					&& (tmp -= new Date(tmp.getTime())
					//
					.setHours(0, 0, 0, 0))) {
						library_namespace.debug('處理時間。 [' + tmp + ']', 3,
								'to_era_Date');
						date.setTime(date.getTime() + tmp);
						break;
					}
				}
			}

			// 處理完 {String}Date。
			// -----------------------------
		} else if (get_next_era()) {
			指定紀年 = 紀年;
		}

		if (options.get_era || options.get_era_list && (紀年 || !date)
				|| options.parse_only || options.get_range
				|| options.get_range_String)
			return;

		if (!date && (指定紀年 || (指定紀年 = get_next_era())))
			date = new Date(指定紀年.start.getTime());

		if (!is_Date(date) || isNaN(date.getTime())) {
			library_namespace.error('to_era_Date: 無法判別紀年 ['
			// numeralized
			+ arguments[0] + '] 之時間或名稱資訊！');
			return;
		}

		// 到這裡，date 最起碼是紀年初始時間。

		if (!isNaN(tmp = options.minute_offset))
			set_minute_offset(date, tmp);

		if (options.date_only) {
			if (指定紀年) {
				add_offset_function(date, 指定紀年);
				if (false && 指定紀年.精)
					date.精 = 指定紀年.精;
			}
			return date;
		}

		// 至此 date 應為 Date，並已篩出可能的主要紀年。
		// Date → era information Date (Date += era information)

		if (tmp = add_contemporary(date, 指定紀年, options)) {
			// 取得真正使用之紀年。
			// 但若可判別(指定紀年)，則以其為主。e.g., CeL.era('泰國陰曆2302/2/1')
			紀年 = 指定紀年 || tmp.紀年;

			if (options.range && tmp.length > 0) {
				if (!Array.isArray(偵測集 = options.range))
					偵測集 = [ 偵測集 ];
				紀年_list = library_namespace.Set_from_Array(tmp);
				while (search_era() && get_intersection(matched[0])
						&& 紀年_list.size > 1)
					;
				tmp = Array.from(紀年_list);
				if (tmp.length === 1)
					紀年 = tmp[0];
				else if (tmp.length === 0)
					tmp = 紀年_list = undefined;

			} else
				delete tmp.紀年;
		}

		if (options.get_era_list)
			return 紀年_list;

		if (!tmp)
			return options.era_only ? [] : date;

		if (options.era_only)
			// 此時未設定 (date.共存紀年)
			return tmp;

		紀年.sign_note(date, options);

		return date;
	}

	// TODO: CE, BCE
	to_era_Date.ignore_pattern = /(?:^|\s)[公西][元曆暦](?:$|\s)/;

	// ---------------------------------------------------------------------//
	// 應用功能。

	/**
	 * 取得指定關鍵字之候選列表。
	 * 
	 * @param {String}key
	 *            指定關鍵字。
	 * 
	 * @returns {Array}指定關鍵字之候選列表。
	 */
	function get_candidate(key) {
		var list;
		if (!key) {
			// 取得所有年代之列表。
			if (!get_candidate.all_list) {
				list = Object.create(null);
				era_list.forEach(function(era) {
					list[era] = era.toString(SEARCH_STRING);
				});
				get_candidate.all_list = list;
			}
			return get_candidate.all_list;
		}

		if (key in search_index) {
			list = Object.create(null);
			for_each_era_of_key(key, function(era) {
				list[era] = era.toString(SEARCH_STRING);
			});
		}

		else if (key = to_era_Date(key, {
			era_only : true
		})) {
			list = Object.create(null);
			key.forEach(function name(era) {
				list[era] = era.toString(SEARCH_STRING);
			});
		}

		return list;
	}

	var PATTERN_公元年_中曆月日
	// [ all, 公元年, 中曆月, 中曆日, 中曆日 ]
	= /(-?\d+)年(?:([閏闰]?\d{1,2})月)?(?:初(\d)|(\d{1,2})日)?/;

	/**
	 * 取得公元 CE_year 年, 中曆 月/日 之 CE Date。
	 * 
	 * @param {Natural|String}CE_year
	 *            公元年
	 * @param {Natural|String}[月]
	 *            中曆月 (=1)
	 * @param {Natural}[日]
	 *            中曆日 (=1)
	 * @param {String}[country]
	 *            國家 (= 中國)
	 * 
	 * @returns {Date|Undefined}date: 公元 CE date.<br />
	 *          {String}date.era: 紀年日期.
	 * 
	 * @since 2016/1/11
	 */
	function 公元年_中曆月日(CE_year, 月, 日, country) {
		if (!CE_year && CE_year !== 0)
			return;

		var candidate,
		//
		date = typeof CE_year === 'string'
		// e.g., '401年閏八月初六'
		&& numeralize_date_name(CE_year);
		if (date && (date = date.match(PATTERN_公元年_中曆月日)
		// 把 2000/1/1 當作公元2000年 中曆1月1日。
		|| date.match(/(\d+)[\/年 ](\d+)\/(\d+)/))) {
			if (!日 && !country)
				country = 月;
			CE_year = date[1];
			月 = date[2];
			日 = date[3] || date[4];
		}

		if (!country)
			// gettext_config:{"id":"china"}
			country = '中國';
		日 |= 0;
		if (日 < START_DATE)
			日 = START_DATE;

		// 轉成連續年分
		if (CE_year < 0)
			CE_year++;

		if (isNaN(月)) {
			// for 閏月
			date = numeralize_date_name(月).match(MONTH_NAME_PATTERN);
			if (date)
				date = date[2] | 0;
			else
				date = START_MONTH;
		} else
			date = 月 | 0;
		if (date < START_MONTH)
			date = START_MONTH;
		if (!月 || 月 < START_MONTH)
			月 = START_MONTH;

		// 先估計最接近目標之公元日期。
		// +2: 中曆當年比公元晚兩個月的日期，應該已經跨中曆年。因此以之作為基準。
		// e.g., 公元412年，則 412/3/1 應該已在中曆當年內。
		// <9: 若中曆月取太晚，例如超過10月，可能會出問題，取得下一年的日期!
		date += (date < 9 ? 2 : 0)
		// -1: month serial → month index.
		// e.g., 2000/1/1: new Date(2000,0,1)
		- 1;
		date = new Date(CE_year, date, 日);
		if (CE_year < 100)
			date.setFullYear(CE_year);

		// 測試每一個共存紀年。
		add_contemporary(date, null, {
			contemporary_filter : function(era) {
				if (candidate || era.name[3] !== country)
					return false;
				var date_index = era.Date_to_date_index(date);
				if (date_index) {
					date_index = era.toString() + era.歲名(date_index[0]) + (
					// era.年名 ||
					POSTFIX_年名稱) + 月 + '月' + 日 + '日';
					candidate = to_era_Date(date_index, {
						date_only : true
					});
					if (candidate) {
						candidate.era = date_index;
						return true;
					}
				}
				return false;
			}
		});

		if (candidate)
			return candidate;
		// else: undefined
	}

	// 將 era object 增加到 list 結構中。
	function add_period(object, list, options) {
		var has_period;
		function add_object(o) {
			list.push(o);
			// 掃描有無時期設定。
			// era 無 .attributes
			if (o.attributes && o.attributes[PERIOD_KEY])
				// assert: Array.isArray(o.attributes.時期);
				// assert: o.level === 2
				// === 主要索引名稱.length - 紀年名稱索引值.時期
				o.attributes[PERIOD_KEY].forEach(function(p) {
					if (!list[PERIOD_KEY][p]) {
						has_period = true;
						(list[PERIOD_KEY][p] = new Period).name
						//
						= PERIOD_PREFIX + p;
					}
					list[PERIOD_KEY][p].add_sub(o);
				});
			else
				list[PERIOD_KEY][''].push(o);
		}

		var is_created = !list[PERIOD_KEY];
		if (is_created)
			list[PERIOD_KEY] = {
				'' : []
			};

		for ( var name in object) {
			if (!Array.isArray(name = object[name]))
				name = [ name ];

			name.forEach(function(o) {
				// 去除循環相依。
				if (o === object)
					return;

				if (!options.含參照用 && Period.is_Period(o)) {
					var i;
					// 只要 .sub, .era
					// 有任一個不是"參照用"，那就顯示出來。
					for (i in o.sub) {
						if (!o.sub[i].參照用) {
							add_object(o);
							return;
						}
					}
					for (i in o.era) {
						if (!o.era[i].參照用) {
							add_object(o);
							return;
						}
					}

				} else if (options.含參照用 || !o.參照用) {
					add_object(o);
					return;
				}

				if (library_namespace.is_debug())
					library_namespace.info([ 'add_period: ', {
						// gettext_config:{"id":"skip-$1-the-$2-is-for-reference-purpose-only"}
						T : [ '跳過 [%1]：本[%2]僅供參照用。', o.toString(), 'period' ]
					} ]);
			});
		}

		if (has_period) {
			for ( var p in list[PERIOD_KEY])
				if (p !== '')
					list[PERIOD_KEY][''].push(list[PERIOD_KEY][p]);
		} else if (is_created)
			// 無時期之標注。
			delete list[PERIOD_KEY];

		// return list;
	}

	// get_periods('中國/p:魏晉南北朝'.split('/'))
	// get_periods('中國/p:魏晉南北朝/成漢'.split('/'))
	// get_periods('中國/成漢'.split('/'))
	/**
	 * 取得指定層次/關鍵字之紀年列表。<br />
	 * 
	 * 回傳之列表，會以<b>是否可放在同一時間軸線圖中</b>作為分隔。<br />
	 * e.g.,<code>
	 [
		 [
		 	[ 紀年(1年-2年), 紀年(3年-4年) ]
		 ],
		 [
			 [ 紀年(5年-6年), 紀年(7年-8年) ],
			 [ 紀年(6年-7年), 紀年(8年-9年) ]
		 ]
	 ]
	 * </code>
	 * 
	 * @param {Array|String}hierarchy
	 *            指定層次/關鍵字。
	 * @param {Object}[options]
	 *            附加參數/設定特殊功能與選項.
	 * 
	 * @returns {Array}紀年列表。<br /> [ 同階層紀年列表 ]
	 */
	function get_periods(hierarchy, options) {
		var period_now = period_root;

		if (hierarchy)
			if (!Array.isArray(hierarchy))
				if (Period.is_Period(hierarchy))
					period_now = hierarchy.sub, hierarchy = null;
				else
					hierarchy = [ hierarchy ];

		// 將 period_now 推到指定層次。
		if (hierarchy && hierarchy.length)
			hierarchy.forEach(function(name) {
				// skip 時期/分類/分區.
				if (!period_now)
					return;
				var matched = name.match(PERIOD_PATTERN);
				period_now =
				//
				matched && period_now[PERIOD_KEY][matched = matched[1]]
				//
				? period_now[PERIOD_KEY][matched]
				//
				: period_now.sub[name];
			});

		if (!period_now) {
			library_namespace.warn('get_periods: 無法取得指定之紀年層次 [' + hierarchy
					+ ']！');
			return;
		}

		if (!period_now.bar) {
			// 前置處理。
			if (!library_namespace.is_Object(options))
				options = Object.create(null);

			var list = [];
			add_period(period_now.sub, list, options);
			add_period(period_now.era, list, options);
			// 作 cache。
			period_now.bar = order_bar(list.sort(compare_start_date));

			get_periods.copy_attributes.forEach(function(key) {
				if (period_now.attributes[key])
					period_now.bar[key] = period_now.attributes[key];
			}, this);

			// 處理歷史時期的 bar。
			if (list = list[PERIOD_KEY]) {
				period_now.bar[PERIOD_KEY] = Object.create(null);
				period_now[PERIOD_KEY] = Object.create(null);
				for ( var period_name in list) {
					var period_list = list[period_name];
					if (Array.isArray(period_list))
						period_list = order_bar(period_list
								.sort(compare_start_date));
					else {
						// assert: period_name && period_name !== ''
						// assert: Period.is_Period(list[period_name])
						var period_data
						//
						= period_now[PERIOD_KEY][period_name]
						//
						= period_list;
						period_list = [];
						for ( var _p in period_data.sub)
							period_list.push(period_data.sub[_p]);
						period_list = order_bar(period_list
								.sort(compare_start_date));
						period_data.bar = period_list;
					}

					(period_now.bar[PERIOD_KEY][period_name]
					//
					= period_list)
					//
					.name = PERIOD_PREFIX + period_name;
				}
			}
		}

		return options && options.merge_periods && period_now.bar[PERIOD_KEY]
		//
		? period_now.bar[PERIOD_KEY][''] : period_now.bar;
	}

	// 預設會 copy 的 period 屬性。
	// 生卒年月日 Date of Birth and Death, lifetime.
	get_periods.copy_attributes = to_list('生,卒');

	/**
	 * 取得指定紀年之文字式曆譜:年曆,朔閏表,曆日譜。
	 * 
	 * @param {String}era
	 *            完整紀年日期。<br />
	 * @param {Object}[options]
	 *            附加參數/設定特殊功能與選項. 此 options 可能會被變更!<br />
	 * 
	 * @returns {Array}曆譜
	 */
	function get_dates(era, options) {
		if (!era)
			return;

		// 前置處理。
		if (!library_namespace.is_Object(options))
			options = Object.create(null);

		var date_list = [], era_list,
		// date: 月曆/日曆，非年曆。
		date = options.月 || options.日,
		//
		add_date = options.date_only ? function(date_time, era) {
			date_list.push(date = new Date(date_time));
			add_offset_function(date, era);
		} : function(date_time, era) {
			date_list.push(date = new Date(date_time));
			add_contemporary(date, era, options);
			era.sign_note(date, options);
		};

		if (typeof era === 'string') {
			// 去掉不需要的空白。
			era = era.replace(/\s+([年月日])/g, '$1')
			//
			.replace(/([年月日])\s+/g, '$1');
			if (era_list = normalize_number(era).match(
			// 月分名稱。參考 (月_SOURCE)。
			/\d年([^\s\/.\-年月日]{1,20}月)?/))
				options.月 = 1, options.日 = era_list[1] && 1;

			if (date = date || options.月 || options.日)
				options.get_era = true;
			else
				options.get_era_list = true;
			era_list = to_era_Date(era, options);

		} else
			era_list = era;

		if (!era_list || !date && era_list.size === 0) {
			library_namespace.info([ 'get_dates: ', {
				// gettext_config:{"id":"can-t-find-era-or-regnal-year-named-$1"}
				T : [ '無年號或帝王紀年名稱作 [%1]！', era ]
			} ]);
			return;
		}

		// 紀錄備查: 由於取得的是最小資訊，不包含共存紀年，因此有需要應自行擷取。
		// date_list.date = era_list;

		if (era_list.精 === '年' || era_list.精 === '月') {
			// 精密度不足。
			if (era_list.精 === '年')
				delete options.月;
			delete options.日;
			delete options.get_era;
			options.get_era_list = true;
			era_list = to_era_Date(era, options);
			date = null;
		}

		if (date) {
			delete options.get_era;
			// [ 歲序, 月序, 日序 | 0 ];
			date_list.selected = era_list.Date_to_date_index(to_era_Date(era,
					options));
			era = era_list;
			if (!era.year_start)
				era.initialize();
		}

		if (options.月 && !options.日) {
			// 月曆。
			var year_index = date_list.selected[0],
			//
			j, calendar = era.calendar,
			//
			start_time, year_left = options.year_limit | 0;

			if (year_left < 1)
				year_left = get_dates.DEFAULT_YEARS;

			if (0 < year_index)
				// 紀錄前一年段的索引。
				// TODO: 添加多個紀年之日期。
				date_list.previous = concat_era_name([
						era,
						era.歲名(year_index < year_left ? 0 : year_index
								- year_left)
								+ (
								// era.年名 ||
								POSTFIX_年名稱) ]);

			for (year_left = Math.min(year_left, calendar.length - year_index); 0 < year_left--; year_index++) {
				start_time = era.year_start[year_index];
				for (j = 0; j < calendar[year_index].length
						&& start_time < era.end;
				//
				start_time += ONE_DAY_LENGTH_VALUE * calendar[year_index][j++])
					add_date(start_time, era);
			}

			date_list.type = 1;
			if (year_index < calendar.length)
				// 紀錄後一年段的索引。
				date_list.next = concat_era_name([ era, era.歲名(year_index) + (
				// era.年名 ||
				POSTFIX_年名稱) ]);
			return date_list;
		}

		if (date) {
			// 日曆。
			date = date_list.selected;
			var i = 0, start_time = 0,
			//
			this_year_data = era.calendar[date[0]];

			for (; i < date[1]; i++)
				// days of month
				start_time += this_year_data[i];
			start_time = era.year_start[date[0]] + ONE_DAY_LENGTH_VALUE
					* start_time;
			this_year_data = start_time + this_year_data[i]
					* ONE_DAY_LENGTH_VALUE;
			if (this_year_data > era.end)
				this_year_data = era.end;
			for (; start_time < this_year_data;
			//
			start_time += ONE_DAY_LENGTH_VALUE)
				add_date(start_time, era);

			date_list.type = 2;
			date = date_list.selected;
			// .日名(日序, 月序, 歲序) = [ 日名, 月名, 歲名 ]
			if (i = era.日名(0, date[1] - 1, date[0]))
				// 紀錄前一個月的索引。
				date_list.previous = concat_era_name([ era, i[2] + (
				// era.年名 ||
				POSTFIX_年名稱) + i[1] + '月' ]);
			if (start_time < era.end && (i = era.日名(0, date[1] + 1, date[0])))
				// 紀錄後一個月的索引。
				date_list.next = concat_era_name([ era, i[2] + (
				// era.年名 ||
				POSTFIX_年名稱) + i[1] + '月' ]);
			return date_list;
		}

		// 年曆。

		era_list.forEach(function(era) {
			if (era.參照用 && !options.含參照用
					&& !get_dates.no_limit_era.includes(era)) {
				library_namespace.info([ 'get_dates: ', {
					// gettext_config:{"id":"skip-$1-the-$2-is-for-reference-purpose-only"}
					T : [ '跳過 [%1]：本[%2]僅供參照用。', era.toString(), '紀年' ]
				} ]);
				return;
			}

			if (!era.year_start)
				era.initialize();

			var year_start = era.year_start,
			//
			i = 0, l = year_start.length - 1;

			if (l > get_dates.ERA_YEAR_LIMIT
			//
			&& !get_dates.no_limit_era.includes(era)) {
				library_namespace.warn([
				//
				'get_dates: 跳過 [' + era + ']： 跨度過長，共有 '
				//
				+ l + '個年分！您可嘗試縮小範圍、加注年分 (如輸入 "'
				//
				+ concat_era_name([ era,
				//
				era.歲名(0) + (
				// era.年名 ||
				POSTFIX_年名稱) ]) + '")，或', {
					a : {
						// Cancel the restriction
						T : '取消限制'
					},
					href : '#',
					onclick : function() {
						get_dates.set_restriction(era, false);
						return false;
					}
				}, '。' ]);
			} else {
				for (; i < l; i++) {
					if (true || date_list.length < get_dates.LIMIT)
						add_date(year_start[i], era);
					else {
						library_namespace.warn(
						//
						'get_dates: 輸出年段紀錄過長，已超過輸出總筆數限制 ' + get_dates.LIMIT
								+ ' 筆！');
						break;
					}
				}
			}
		});

		return date_list;
	}

	// 輸出總筆數限制。
	// get_dates.LIMIT = Infinity;
	// 跳過跨度過長之紀年。
	get_dates.ERA_YEAR_LIMIT = 150;
	get_dates.no_limit_era = [];
	// 預設月曆之年數。
	get_dates.DEFAULT_YEARS = 10;

	// 可取消限制，強制顯示 allow display/showing, disable restriction
	// CeL.era.dates.set_restriction('泰國陰曆', false)
	get_dates.set_restriction = function(era, enable_restriction) {
		if (typeof era === 'string') {
			var _era = get_era(era);
			if (!_era) {
				library_namespace.warn('set_restriction: Invalid era key: '
						+ era);
				return;
			}
			era = _era;
		}

		var index = get_dates.no_limit_era.indexOf(era);
		if (typeof enable_restriction !== 'boolean') {
			return index === NOT_FOUND;
		}

		if (enable_restriction) {
			if (index !== NOT_FOUND) {
				get_dates.no_limit_era.splice(index, 1);
				library_namespace.info('已回復 [' + era + '] 之限制。');
			}
			return true;

		} else if (index === NOT_FOUND) {
			get_dates.no_limit_era.push(era);
			library_namespace.info(
			//
			'已取消 [' + era + '] 之限制。請注意有些操作將極度費時！');
			return false;
		}
	};

	// ---------------------------------------------------------------------//

	// 警告: 此函數會更改原輸入之 date_value!
	function Date_to_era_String(date_value, format, locale, options) {
		// 前置處理。
		if (!library_namespace.is_Object(options))
			options = Object.create(null);
		var config = this || options, 紀年名,
		// 指定紀年。
		紀年 = config.era_object;
		if (!紀年) {
			// 在有綁定時，不考慮 options.era。
			if (紀年名 = config.era)
				if ((紀年 = get_era_Set_of_key(紀年名))
				//
				&& 0 < (紀年 = 紀年.values()).length) {
					if (紀年.length !== 1)
						// assert: 有超過1個紀年。
						library_namespace.warn('Date_to_era_String: 共取得 '
								+ 紀年.length + ' 個可能的紀年 [' + 紀年名 + ']！');
					紀年 = 紀年[0];
				} else
					紀年 = to_era_Date(紀年名, {
						get_era : true
					});

			if (!紀年) {
				library_namespace.warn(
				//
				'Date_to_era_String: 無法取得指定之紀年 [' + 紀年名 + ']！');
				return;
			}

			// 紀年之 cache。
			if (this)
				this.era_object = 紀年;
		}

		// 前置處理。
		if (!date_value)
			date_value = new Date;
		if (!('numeral' in options) && ('numeral' in config))
			options.numeral = config.numeral;

		// 警告: 此函數會更改原輸入之 date_value!

		紀年.sign_note(date_value, options);

		return strftime(date_value,
		//
		format || config.format,
		//
		locale || config.locale, options);
	}

	(function() {
		var era_name, era_data,
		// 為各特殊曆法特設。
		// 今天是農曆 <code>(new Date).format('Chinese')</code>
		era_to_export = {
			Chinese : {
				era : '中曆',
				format : '%歲次年%月月%日'
			}
		};

		Date_to_String_parser.era = Date_to_era_String;

		for (era_name in era_to_export) {
			Date_to_String_parser[era_name] = Date_to_era_String.bind(
			//
			era_data = era_to_export[era_name]);
			if (!era_data.numeral)
				era_data.numeral = era_name;
			if (!era_data.locale)
				era_data.locale = library_namespace.gettext
						.to_standard(era_name);
		}
	})();

	// ---------------------------------------------------------------------//
	// 網頁應用功能。
	// warning: need CeL.interact.DOM

	// UNDONE
	function determain_node_era(node) {
		var node_queue = [];
		var era_data = library_namespace.DOM_data(node, 'era');

	}

	/**
	 * 計算已具紀年標記之指定 HTML node 之紀年值。
	 * 
	 * @param {ELEMENT_NODE}node
	 *            具紀年標記之指定 node。
	 * @param {Boolean}[return_type]
	 *            回傳的型別。 'String': 僅回傳 era String。
	 * 
	 * @returns [range] || {String}date
	 */
	function calculate_node_era(node, return_type) {
		var era, date, previous_date_to_check, original_era,
		// data-era: read-only
		era_data = library_namespace.DOM_data(node, 'era');
		if (!era_data) {
			// no era data. Not a era node. Skip this node.
			return;
		}

		// 看看是不是有之前解析、驗證過的cache。
		if (return_type === 'String'
				&& (era = library_namespace.DOM_data(node, 'era_refrenced'))) {
			return era;
		}
		era = library_namespace.DOM_data(node, 'era_parsed');
		// console.log(era);
		if (!era) {
			// determain node era
			if (false) {
				var node_queue = [], era_map = new Map;
				// 自身不完整。溯前尋找 base。
				for (var node_to_test = node;;
				//
				node_to_test = library_namespace.previous_node_of(node_to_test)) {
					if (!node_to_test) {
						break;
					}
					if (!node_to_test.tagName
							|| node_to_test.tagName.toLowerCase() !== set_up_era_nodes.default_tag) {
						continue;
					}
					// console.log(node_to_test);

					era = library_namespace
							.DOM_data(node_to_test, 'era_parsed');
					if (era) {
						node_queue.unshift(node_to_test);
						continue;
					}

					var era_data = library_namespace.DOM_data(node_to_test,
							'era');
					era = library_namespace.set_text(node_to_test);
					if (era_data !== '~') {
						// '~':如英語字典之省略符號，將以本node之內含文字代替。
						era = era_data.replace('~', era);
					}
					// console.log(era);

					// 去除(干支_PATTERN): 預防"丁未"被 parse 成丁朝之類的意外。
					date = !干支_PATTERN.test(era)
					// 預防被解析為明朝的年份。
					&& !era.startsWith('明年') && to_era_Date(era, {
						parse_only : true
					});

					if (!date || !date[1]) {
						continue;
					}

					// date: [ {Set}紀年_list, {Era}紀年, 年, 月, 日 ]
					node_queue.unshift([ node_to_test, date, date[0].size ]);
					if (node_queue.length > 3 && date[0].size === 1) {
						// 找到了準確認判斷出的。
						break;
					}

					// console.log(date[0]);
					date[0].forEach(function(era) {
						// console.log(era);
						era_map.set(era,
								era_map.has(era) ? era_map.get(era) + 1 : 1);
					});
				}

				console.log([ node_queue, era_map ]);
				return;
			}

			// ------------------------------------
			// 解析 era。
			era = library_namespace.set_text(node);
			if (era_data !== '~') {
				// '~':如英語字典之省略符號，將以本node之內含文字代替。
				era = era_data.replace('~', ' ' + era);
			}
			// console.log([ 'era:', era ]);

			// 去除(干支_PATTERN): 預防"丁未"被 parse 成丁朝之類的意外。
			date = !干支_PATTERN.test(era)
			// 預防被解析為明朝的年份。
			&& !era.startsWith('明年') && to_era_Date(era, {
				parse_only : true
			});

			var previous_date = undefined,
			//
			get_previous_date = function() {
				var node_queue = [];
				// 自身不完整。溯前尋找 base。
				var node_to_test = node;
				while (node_to_test = library_namespace
						.previous_node_of(node_to_test)) {
					// 向前取第一個可以明確找出日期的。
					if (previous_date = calculate_node_era(node_to_test,
							'String'))
						break;
				}
				return previous_date;
			};

			// date: [ {Set}紀年_list, {Era}紀年, 年, 月, 日 ]
			if (!date || !date[1]) {
				if (!get_previous_date()
				// && (!date || !date[1])
				) {
					return;
				}

				original_era = date = to_era_Date(era, {
					parse_without_check : true
				});
				// console.log([ 'original_era:', original_era ]);
				if (original_era && original_era[0]
						&& original_era[0].size === 1) {
					original_era = Array.from(original_era[0])[0];
				} else {
					original_era = null;
				}
				date = to_era_Date(era, {
					parse_only : true,
					base : previous_date
				});
				// console.log([ previous_date, date.join(', ') ]);
				if (!date[1])
					return;

				// 避免 資治通鑑/卷022#征和二年（庚寅，公元前九一年）
				// https://zh.wikisource.org/wiki/User_talk:Kanashimi/era_note.js#%E5%85%B3%E4%BA%8E%E6%AD%A4%E5%B7%A5%E5%85%B7
				if (original_era && original_era.name.includes(date[4])) {
					original_era = null;
				}

				// 檢查本節點有幾項資料。
				previous_date_to_check = [];
				date.slice(2).forEach(function(name, index) {
					if (name)
						previous_date_to_check.push(index);
				});
				if (previous_date_to_check.length === 1) {
					previous_date_to_check.unshift(previous_date);
				} else {
					previous_date_to_check = null;
				}
			}

			// assert: date: [ {Set}紀年_list, {Era}紀年, 年, 月, 日 ]

			var era_list = date.shift();
			if (era_list && era_list.size > 1) {
				// 當存在有多個可能的紀年時，應該從前文來篩選出比較可能的一個。
				if (previous_date || get_previous_date()) {
					// console.log(previous_date);
					// console.log(era);
					era_list = to_era_Date(era, {
						parse_only : true,
						base : to_era_Date(previous_date, {
							date_only : true
						})
					});
					// console.log(era_list);
					era_list.shift();
					if (era_list[0] && era_list[1]) {
						// 確定可以找到時，才採用以{Date}為準的日期。
						date = era_list;
					} else {
						// e.g., "永曆二年" + "閏六月"
					}
					// assert: 必然會選出最接近的一個紀年。
					era_list = null;

				} else {
					library_namespace.warn('calculate_node_era: [' + era
					//
					+ ']: 共取得 ' + era_list.size + ' 個可能的紀年名稱: '
					//
					+ Array.from(era_list).map(function(era) {
						// 大約年份
						return era + ' (' + era.start.format('%Y') + ')';
					}).join(', '));
				}

			} else {
				era_list = null;
			}

			era = date.shift();
			if (!era) {
				// e.g., 昭宗永曆 注
				return;
			}
			if (Array.isArray(era.name)) {
				// 當有多個可能的紀年名稱時，僅取紀年名，保留最大可能性。
				era = era_list ? era.name[0] : era.toString();
			}
			if (original_era
					&& era !== (original_era = original_era.toString())) {
				library_namespace.debug('本節點本來就指定了紀年名稱[' + original_era
						+ ']，因此當作後續節點之參考時，將使用原先的紀年，而不採用解析出的紀年[' + era + ']。');
			} else {
				original_era = null;
			}

			// console.log([ 'date:', date.join(', '), 'era:', era ]);
			var date_name = date.shift();
			if (date_name) {
				var tmp = date_name + (
				// original_era && original_era.年名 ||
				POSTFIX_年名稱);
				era += tmp;
				if (original_era)
					original_era += tmp;
				if (date_name = date.shift()) {
					tmp = date_name + '月';
					era += tmp;
					if (original_era)
						original_era += tmp;
					if (date_name = date.shift()) {
						tmp = date_name + '日';
						era += tmp;
						if (original_era)
							original_era += tmp;
					}
				}
			}

			// assert: {String}era

			// cache.
			if (original_era)
				library_namespace.DOM_data(node, 'era_refrenced', original_era);
			library_namespace.DOM_data(node, 'era_parsed', era);
		}

		var era_date = to_era_Date(era);
		if (era_date.error) {
			node.title = era + ': ' + era_date.error;
			// 假如有明確指定紀年名稱，則依然可參照之。
			var tmp = to_era_Date(library_namespace.set_text(node), {
				parse_only : true
			});
			if (false)
				console.log([ node, library_namespace.set_text(node), tmp, era,
						era_date ]);
			if (!tmp || !tmp[1] || tmp[1].toString() !== era_date.紀年名) {
				library_namespace.set_class(node, 'era_text', {
					remove : true
				});
				// reset event / style
				node.style.cursor = '';
				node.onclick = node.onmouseover = node.onmouseout = null;
				return;
			}
		}

		if (return_type === 'String') {
			if (previous_date_to_check) {
				var error = null,
				//
				previous_date = to_era_Date(previous_date_to_check[0]);
				// 當僅有年月日其中一項資料的時候，比較有可能是判讀、解析錯誤。因此某些情況下不拿來當作參考對象。
				if (previous_date - era_date > 0) {
					error = '時間更早';
				} else {
					var diff_in_2_months = (era_date - previous_date)
							/ (2 * 大月 * ONE_DAY_LENGTH_VALUE);
					if (previous_date_to_check[1] === 2 ? diff_in_2_months > 1
					// ↑ 僅有日期資料。 ↓ 僅有月份資料。
					: previous_date_to_check[1] === 1 ? diff_in_2_months > 12
					// 當間隔過大，例如超過80年時，則跳過這一筆。
					: diff_in_2_months > 40 * 12) {
						error = '間距過長';
					}
				}
				if (error) {
					node.title = era + ': ' + error;
					library_namespace.warn('calculate_node_era: 本節點[' + era
							+ ']比起前一個節點[' + previous_date_to_check[0] + ']'
							+ error + '，且只有一項資料['
							+ '年月日'.charAt(previous_date_to_check[1])
							+ ']，因此跳過本節點而取前一個節點。');
					return;
				}
			}

			// console.log([ 'trace back to', era ]);
			return /* !era_date.error && */era;
		}

		if (era_date.error) {
			return;
		}

		// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/time
		node.setAttribute('datetime', era_date.toISOString());
		if (return_type === 'Date')
			return era_date;
		date = era_date.format(calculate_node_era.era_format);

		var tmp = to_era_Date(era, {
			get_range_String : calculate_node_era.format
		});
		if (tmp.includes(PERIOD_DASH))
			date += '起';

		tmp = [ era, date, tmp ];
		// TODO: era_date.精;
		// TODO: era_date.準;
		if (era_date.共存紀年) {
			// old: ☼
			date = '<br />⏳ ';
			tmp.push('<hr />'
			// gettext_config:{"id":"contemporary-period"}
			+ library_namespace.gettext('共存紀年') + '：' + date
			//
			+ era_date.共存紀年.map(function(era_date) {
				var era_string = era_date.toString();
				// 準確程度_ENUM
				if (era_date.疑 || era_date.傳說) {
					return '<span style="color:#888;" title="存在疑問、不準確的紀年">'
					//
					+ era_string.toString() + '<sub>('
					// 特別標示存在疑問、不準確的紀年。
					+ (era_date.疑 ? '疑' : '傳說') + ')</sub></span>';
				}
				return era_string;
			}).join(date));
		}

		return tmp;
	}

	// 紀年名
	calculate_node_era.era_format = {
		parser : standard_time_parser,
		format : '%紀年名%年年%月月%日日(%日干支)',
		locale : 'cmn-Hant-TW'
	};
	// range
	calculate_node_era.format = {
		parser : standard_time_parser,
		format : standard_time_parser_name + '%Y年%m月%d日'
	};

	/**
	 * popup 紀年資訊 dialog 之功能。
	 * 
	 * @returns {Boolean}false
	 */
	function popup_era_dialog() {
		var era = this.era_popup, date;
		if (era) {
			// had cached
			library_namespace.toggle_display(this.era_popup, true);

		} else if (era = calculate_node_era(this)) {
			if (date = this.add_date) {
				date = {
					get_range_String : {
						parser : standard_time_parser,
						format : String(date) === 'true'
						//
						? popup_era_dialog.format : date
					}
				};
				date = to_era_Date(calculate_node_era(this, 'String'), date);
				// `date` maybe `undefined`
			}
			if (date) {
				date = '（' + date + '）';

				if (this.appendChild)
					this.appendChild(document.createTextNode(date));
				else
					this.innerHTML += date;

				// reset flag.
				try {
					delete this.add_date;
				} catch (e) {
					this.add_date = undefined;
				}
			}

			// TODO: 檢驗若無法設定 this.era_popup

			library_namespace.locate_node(this.era_popup = library_namespace
					.new_node({
						div : era.join('<br />'),
						C : 'era_popup',
						// 盡可能預防殘留 dialog。
						onmouseout : popup_era_dialog.clear.bind(this)
					}, document.body), this);
		}

		if (era)
			library_namespace.set_class(this, 'era_popupd');

		return false;
	}

	popup_era_dialog.format = '%Y年%m月%d日';

	popup_era_dialog.clear = function(clear) {
		if (this.era_popup)
			library_namespace.toggle_display(this.era_popup, false);
		if (clear)
			this.era_popup = null;
		library_namespace.set_class(this, 'era_popupd', {
			remove : true
		});

		return false;
	};

	/**
	 * 設定好 node，使紀年標示功能作動。
	 * 
	 * @param {ELEMENT_NODE}node
	 */
	function set_up_era_node(node, options) {
		// 先測試是否已標記完成，以加快速度。
		if (!library_namespace.has_class(node, 'era_text')
		//
		&& library_namespace.DOM_data(node, 'era')) {
			node.onmouseover = popup_era_dialog;
			node.onmouseout = popup_era_dialog.clear;
			if (options) {
				if (options.add_date)
					// append date
					node.add_date = options.add_date;
				if (options.onclick) {
					node.onclick = function(e) {
						// 清掉殘存的 dialog。
						popup_era_dialog.clear.call(this, true);
						return options.onclick.call(this, e);
					};
					node.style.cursor = 'pointer';
				}
			}
			library_namespace.set_class(node, 'era_text');
		}
	}

	/**
	 * 設定好所有 <tag> node，使紀年標示功能作動。
	 * 
	 * @param {String}tag
	 */
	function set_up_era_nodes(tag, options) {
		// var last_era;
		if (!tag)
			tag = set_up_era_nodes.default_tag;
		if (typeof tag === 'string')
			library_namespace.for_nodes(options ? function(node) {
				set_up_era_node(node, options);
			} : set_up_era_node, tag);

		else if (library_namespace.is_ELEMENT_NODE(tag))
			set_up_era_node(tag, options);

		else
			library_namespace.warn('set_up_era_nodes: 無法設定 [' + tag + ']');
	}

	// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/time
	set_up_era_nodes.default_tag = 'time'.toLowerCase();

	// --------------------------------------------

	// 辨識史籍(historical book)紀年用之 pattern。
	// [ all, head, era, tail ]
	var 史籍紀年_PATTERN, ERA_ONLY_PATTERN,
	//
	朔干支_PATTERN = generate_pattern('(朔<\\/' + set_up_era_nodes.default_tag
			+ '>)(干支)()', false, 'g'),
	// 十二地支時辰. e.g., 光緒十九年八月初二日丑刻
	時干支_PATTERN = generate_pattern(/(支)[時刻]/, false, 'g'),
	// see era_text_to_HTML.build_pattern()
	REPLACED_data_era = '$1<' + set_up_era_nodes.default_tag
			+ ' data-era="~">$2</' + set_up_era_nodes.default_tag + '>$3';

	/**
	 * 將具有紀年日期資訊的純文字文本(e.g., 史書原文)，轉成供 set_up_era_node() 用之 HTML。<br />
	 * 設定 node.innerHTML = node 後，需要自己設定 set_up_era_node()!
	 * 
	 * @param {String}text
	 *            具紀年日期資訊的純文字文本(e.g., 史書原文)
	 * @param {ELEMENT_NODE}[node]
	 * 
	 * @returns {String} 供 set_up_era_node() 用之 HTML。
	 */
	function era_text_to_HTML(text, node, options) {
		if (!史籍紀年_PATTERN)
			era_text_to_HTML.build_pattern();

		if (typeof text === 'string') {
			// search
			// 預防 `史籍紀年_PATTERN` 於利用到 pattern 前後，這部分被吃掉。
			// 像 "十年，七月庚辰" 就會在 match 了 "十年，" 後，無法 match 到 "七月"。
			var matched, list = [], last_index = 0;
			while (matched = 史籍紀年_PATTERN.exec(text)) {
				// @see REPLACED_data_era
				list.push(text.slice(last_index, matched.index
						+ matched[1].length), '<'
						+ set_up_era_nodes.default_tag + ' data-era="~">'
						+ matched[2] + '</' + set_up_era_nodes.default_tag
						+ '>');
				史籍紀年_PATTERN.lastIndex -= matched[3].length;
				last_index = 史籍紀年_PATTERN.lastIndex;
			}
			list.push(text.slice(last_index));
			text = list.join('');

			// search for 僅紀年亦轉換的情況。 e.g., '天皇'.
			text = text.replace(ERA_ONLY_PATTERN, REPLACED_data_era)
			//
			.replace(朔干支_PATTERN, REPLACED_data_era)
			//
			.replace(時干支_PATTERN, function($0, 時辰) {
				var end = library_namespace.BRANCH_LIST
				// 2: 每個時辰兩小時
				.indexOf(時辰) * 2 + 1, start = end - 2;
				if (start < 0)
					// 24: 每天24小時
					start += 24;
				// 時: 小時
				start += PERIOD_DASH + end + '時';
				return options && options.add_date
				//
				? $0 + '(' + start + ')'
				//
				: '<' + set_up_era_nodes.default_tag
				//
				+ ' title="' + start + '">'
				//
				+ $0 + '</' + set_up_era_nodes.default_tag + '>';
			})
			// format
			.replace(/\n/g, '<br />');
		}

		if (node) {
			if (typeof node === 'string')
				node = document.getElementById(node);
			node.innerHTML = text;
			// console.log(node);
			// set_up_era_node(node, options);
			set_up_era_nodes(null, options);
		} else
			return text;
	}

	/**
	 * 建構辨識史籍紀年用之 pattern。
	 */
	era_text_to_HTML.build_pattern = function(options) {
		var 紀年 = [];
		create_era_search_pattern().forEach(function(key) {
			var matched = key.match(/^(.+)(?:天皇|皇后)$/);
			if (matched)
				紀年.push(matched[1]);
		});
		ERA_ONLY_PATTERN = new RegExp('([^>])((?:' + 紀年.join('|')
				+ ')(?:天皇|皇后))([^<])', 'g');

		// (紀年)?年(月(日)?)?|(月)?日|月
		紀年 = create_era_search_pattern().join('|')
				.replace(/\s*\([^()]*\)/g, '');
		// 去掉「〇」
		// "一二三四五六七八九"
		var 日 = library_namespace.Chinese_numerals_Normal_digits.slice(1),
		// e.g., 元, 二, 二十, 二十二, 二十有二, 卅又二
		年 = '(?:(?:[廿卅]|[' + 日 + ']?十)[有又]?[' + 日 + ']?|[' + 日 + '元明隔去]){1,4}年',
		// 春王正月 冬十有二月, 秦二世二年後九月
		月 = 季_SOURCE + '[閏闰後]?(?:[正臘' + 日 + ']|十[有又]?){1,3}月';
		日 = '(?:(?:(?:干支)?(?:初[' + 日 + ']日?|(?:' + 日
		// "元日":正月初一，常具文意而不表示日期，剔除之。
		+ '|(?:[一二三]?十|[廿卅])[有又]?[' + 日 + ']?|[' + 日 + '])日)|干支日?)[朔晦望]?旦?'
		// 朔晦望有其他含義，誤標率較高。
		+ (options && options.add_望 ? '|[朔晦望]日?' : '') + ')';

		/**
		 * 建構 史籍紀年_PATTERN
		 * 
		 * TODO: 排除 /干支[年歲嵗]/
		 * 
		 * <code>

		// test cases:

		地皇三年，天鳳六年改為地皇。
		改齊中興二年爲天監元年
		以建平二年為太初元年
		一年中地再動
		大酺五日
		乃元康四年嘉谷
		（玄宗開元）十年

		道光十九年正月廿五

		未及一年
		去年
		明年
		是[年月日]
		《清華大學藏戰國竹簡（貳）·繫年》周惠王立十又七年
		歲 次丙子四月丁卯

		TODO:
		公元前九一年

		</code>
		 */
		史籍紀年_PATTERN = [
		// 識別干支紀年「年號+干支(年)」。
		'(?:' + 紀年 + ')+干支年?',
		// 一般紀年. 立: 周惠王立十又七年, [)]: （玄宗開元）十年
		'(?:' + 紀年 + ')*(?:）|\\)|立)?' + 年 + '(?:' + 月 + 日 + '?)?',
				'(?:' + 月 + ')?' + 日, 月 ];
		// console.log(史籍紀年_PATTERN);
		史籍紀年_PATTERN = generate_pattern(
		// 0: head 為爲乃
		'(^|[^酺])'
		// 1: era
		+ '(' + 史籍紀年_PATTERN.join('|') + ')'
		// 2: tail
		+ '([^中]|$)', false, 'g');
		// console.log(史籍紀年_PATTERN);
		return 史籍紀年_PATTERN;
	};

	/**
	 * 標注文本: 直接處理一整個 HTML 元素，加上帝王紀年/年號紀年標示。
	 * 
	 * @example <code>
	CeL.run([ 'data.date.era', 'interact.DOM' ]);
	CeL.env.era_data_load = function(country, queue) {
		if (!queue) {
			CeL.era.note_node('#mw-content-text', { add_date : true });
		}
	};
	 * </code>
	 */
	function add_era_note(node, options) {
		library_namespace.for_nodes(function(node, index) {
			// console.log(node);
			var text;
			if (node.nodeType !== document.TEXT_NODE
					|| !(text = library_namespace.set_text(node)).trim()) {
				return;
			}

			var HTML = era_text_to_HTML(text, null, options);
			if (text === HTML) {
				// 沒有改變。處理下一個。
				return;
			}

			var last_node = node, parentNode = node.parentNode,
			//
			container = document.createElement(parentNode.tagName || 'div');
			container.innerHTML = HTML;
			// console.log(container);
			library_namespace.get_tag_list(container.childNodes).reverse()
			// node.parentNode.childNodes[index] === node;
			.forEach(function(n) {
				parentNode.insertBefore(n, last_node);
				last_node = n;
				if (false && n.tagName && n.tagName.toLowerCase()
				// TODO: useless...
				=== set_up_era_nodes.default_tag)
					set_up_era_node(n, options);
			});
			// 去掉原先的文字節點。
			node.parentNode.removeChild(node);

		}, node, {
			traversal : true
		});

		set_up_era_nodes(null, options);
	}

	// ---------------------------------------------------------------------//
	// export 導出.

	Object.assign(to_era_Date, {
		set : parse_era,
		pack : pack_era,
		extract : extract_calendar_data,
		periods : get_periods,
		// normalize_date : normalize_date,
		get_candidate : get_candidate,
		dates : get_dates,
		era_list : create_era_search_pattern,
		for_dynasty : for_dynasty,
		for_monarch : for_monarch,
		numeralize : numeralize_date_name,
		中曆 : 公元年_中曆月日,

		NEED_SPLIT_PREFIX : NEED_SPLIT_PREFIX,
		NEED_SPLIT_POSTFIX : NEED_SPLIT_POSTFIX,
		concat_name : concat_era_name,
		reduce_name : reduce_era_name,

		compare_start : compare_start_date,
		Date_of_CE_year : get_Date_of_key_by_CE,
		MINUTE_OFFSET_KEY : MINUTE_OFFSET_KEY,

		// 網頁應用功能。
		node_era : calculate_node_era,
		setup_nodes : set_up_era_nodes,
		to_HTML : era_text_to_HTML,
		note_node : add_era_note,
		//
		PERIOD_PATTERN : PERIOD_PATTERN
	}, sign_note.notes);

	// 加工處理。
	(function() {
		function note_proxy(date_value, options) {
			return this(options
			//
			&& options.original_Date || date_value);
		}
		var notes = sign_note.notes;
		for ( var name in notes)
			notes[name]
			//
			= note_proxy.bind(notes[name]);
	})();

	Object.assign(sign_note.notes, {
		// 注意:依 .format() 之設定，在未設定值時將採本處之預設。
		// 因此對於可能不設定的值，預設得設定為 ''。

		// 講述東周歷史的兩部典籍《春秋》和《戰國策》都是使用帝王紀年。
		// 共伯和/周定公、召穆公
		// 國號
		朝代 : '',
		// 君主(帝王)號
		君主 : '',

		// 共和
		// 君主(帝王)/年號/民國
		紀年 : '',
		紀年名 : '',

		// 季節:
		// 立春到立夏前為春季，立夏到立秋前為夏季，立秋到立冬前為秋季，立冬到立春前為冬季。

		年 : '(年名)',
		月 : '(月名)',
		日 : '(日名)',

		// 重新定義 (override)
		// 東漢四分曆前，用歲星紀年和太歲紀年（歲星:木星）。以來用干支紀年。
		// 干支紀年萌芽於西漢，始行於王莽，通行於東漢後期。
		歲次 : function(date_value, options) {
			return (options
			//
			&& options.original_Date || date_value).歲次
					|| library_namespace.guess_year_stem_branch(date_value,
							options);
		},
		// 重新定義 (override) alias
		// gettext_config:{"id":"year-of-the-sexagenary-cycle"}
		年干支 : '歲次',
		// gettext_config:{"id":"year-of-the-sexagenary-cycle"}
		年柱 : '歲次',

		// 星座 : '',

		// 佔位:會引用 Date object 本身的屬性。
		// see strftime()
		// gettext_config:{"id":"month-of-the-sexagenary-cycle"}
		月干支 : '月干支',
		// 每年正月初一即改變干支，例如錢益謙在崇禎十五年除夕作「壬午除夕」、隔日作「癸未元日」
		// 日干支:'干支紀日',
		// 月干支:'干支紀月',
		// gettext_config:{"id":"month-of-the-sexagenary-cycle"}
		月柱 : '月干支',
		閏月 : '(是否為閏月)',
		大小月 : '(大小月)',

		// 晝夜 : '',
		// 第一個時辰是子時，半夜十一點到一點。
		// 時辰 : '子丑寅卯辰巳午未申酉戌亥',
		// 晚上七點到第二天早上五點平均分為五更（合十個小時），每更合二個小時。
		// 更 : '',

		// 用四柱神算推算之時辰八字
		四柱 : '%年柱%月柱%日柱%時柱',
		// 生辰八字
		八字 : '%年干支%月干支%日干支%時干支',

		// 夏曆 : '%歲次年%月月%日日%辰時',
		// 農民曆 : '',

		// 授時歷即統天歷
		曆法 : '',

		// 注解
		注 : ''
	});
	strftime.set_conversion(sign_note.notes,
	//
	library_namespace.gettext.to_standard('Chinese'));
	// 已經作過改變，不再利用之。
	delete sign_note.notes;

	Object.assign(library_namespace, {
		十二生肖_LIST : 十二生肖_LIST,
		十二生肖圖像文字_LIST : 十二生肖圖像文字_LIST,
		陰陽五行_LIST : 陰陽五行_LIST
	});

	String_to_Date.parser.era = function(date_string, minute_offset, options) {
		if (false) {
			// 依 String_to_Date() 當前之實作，不會出現此般差錯。

			// 引數之前置處理。
			if (library_namespace.is_Object(minute_offset)) {
				if (!options)
					options = minute_offset;
			} else if (!isNaN(minute_offset)) {
				if (!library_namespace.is_Object(options))
					options = Object.create(null);
				options.minute_offset = minute_offset;
			}
		}

		library_namespace.debug('parse (' + typeof date_string + ') ['
				+ date_string + ']', 3, 'String_to_Date.parser.era');
		return to_era_Date(date_string, options);
	};

	// 更正 data.date .age_of.get_new_year
	library_namespace.date.age_of.get_new_year = get_Date_of_key_by_CE;

	// ---------------------------------------

	this.finish = function(name_space, waiting) {
		// 載入各紀年期間曆數資料 (era_data.js)。
		var queue = [ library_namespace.get_module_path(this.id + '_data')
		// .replace(/\\{2,}/g, '\\')
		];
		if (library_namespace.is_WWW(true))
			// 載入 CSS resource(s)。
			// include resources of module.
			queue.unshift(library_namespace.get_module_path(this.id).replace(
					/[^.]+$/, 'css'));
		// library_namespace.log(queue);
		library_namespace.run(queue, waiting);
		return waiting;
	};

	return to_era_Date;
}
