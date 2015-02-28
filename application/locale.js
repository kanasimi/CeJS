
/**
 * @name	CeL function for locale / i18n (Internationalization) 系列
 * @fileoverview
 * 本檔案包含了地區語系/文化設定的 functions。
 * @since	
 */

/*

http://blog.miniasp.com/post/2010/12/24/Search-and-Download-International-Terminology-Microsoft-Language-Portal.aspx
http://www.microsoft.com/language/zh-tw/default.aspx
Microsoft | 語言入口網站

*/

'use strict';
if (typeof CeL === 'function')
CeL.run({
name : 'application.locale',
code : function(library_namespace) {

var module_name = this.id,
// const: 基本上與程式碼設計合一，僅表示名義，不可更改。(== -1)
NOT_FOUND = ''.indexOf('_');
//	nothing required


/**
 * null module constructor
 * @class	locale 的 functions
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



/*
<a href="http://www.ietf.org/rfc/bcp/bcp47.txt" accessdate="2012/8/22 15:23" title="BCP 47: Tags for Identifying Languages">BCP 47</a> language tag

http://www.whatwg.org/specs/web-apps/current-work/#the-lang-and-xml:lang-attributes
The lang attribute (in no namespace) specifies the primary language for the element's contents and for any of the element's attributes that contain text. Its value must be a valid BCP 47 language tag, or the empty string.

<a href="http://www.w3.org/International/articles/language-tags/" accessdate="2012/9/23 13:29">Language tags in HTML and XML</a>
language-extlang-script-region-variant-extension-privateuse

http://www.cnblogs.com/sink_cup/archive/2011/04/15/written_language_and_spoken_language.html
http://zh.wikipedia.org/wiki/%E6%B1%89%E8%AF%AD

<a href="http://en.wikipedia.org/wiki/IETF_language_tag" accessdate="2012/8/22 15:25">IETF language tag</a>

TODO:
en-X-US

*/
function language_tag(tag) {
	return language_tag.parse.call(this, tag);
}

//	3_language[-3_extlang][-3_extlang][-4_script][-2w|3d_region]
language_tag.language_RegExp = /^(?:(?:([a-z]{2,3})(?:-([a-z]{4,8}|[a-z]{3}(?:-[a-z]{3}){0,1}))?))(?:-([a-z]{4}))?(?:-([a-z]{2}|\d{3}))?((?:-(?:[a-z\d]{2,8}))*)$/;
//	x-fragment[-fragment]..
language_tag.privateuse_RegExp = /^x((?:-(?:[a-z\d]{1,8}))+)$/;
// 片段
language_tag.privateuse_fragment_RegExp = /-([a-z\d]{1,8})/g;
language_tag.parse = function(tag) {
	this.tag = tag;
	// language tags and their subtags, including private use and
	// extensions, are to be treated as case insensitive
	tag = ('' + tag).toLowerCase();
	var i = 1, match = language_tag.language_RegExp.exec(tag);
	if (match) {
		library_namespace.debug(match.join('<br />'), 3, 'language_tag.parse');

		//	3_language[-3_extlang][-3_extlang][-4_script][-2w|3d_region]

		//	<a href="http://en.wikipedia.org/wiki/ISO_639-3" accessdate="2012/9/22 17:5">ISO 639-3 codes</a>
		//	list: <a href="http://en.wikipedia.org/wiki/ISO_639:a" accessdate="2012/9/22 16:56">ISO 639:a</a>
		//	國際語種代號標準。
		this.language = match[i++];
		// TODO: 查表對照轉換, fill this.language
		this.extlang = match[i++];

		//	<a href="http://en.wikipedia.org/wiki/ISO_15924#List_of_codes" accessdate="2012/9/22 16:57">ISO 15924 code</a>
		//	書寫文字。match[] 可能是 undefined。
		this.script = (match[i++] || '').replace(/^[a-z]/,
			function($0) {
				return $0.toUpperCase();
			});
		//	<a href="http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements" accessdate="2012/9/22 16:58">ISO 3166-1 alpha-2 code</a>
		//	國家/地區/區域/領域代碼。match[] 可能是 undefined。
		this.region = (match[i++] || '').toUpperCase();

		// TODO: variant, extension, privateuse
		this.external = match[i++];

		if (library_namespace.is_debug(2)) {
			for (i in this) {
				library_namespace.debug(i + ' : ' + this[i], 2, 'language_tag.parse');
			}
		}

	} else if (match = language_tag.privateuse_RegExp.exec(tag)) {

		//	x-fragment[-fragment]..
		library_namespace.debug('parse privateuse [' + tag + ']', 2, 'language_tag.parse');
		tag = match[1];
		this.privateuse = i = [];
		// reset 'g' flag
		language_tag.privateuse_fragment_RegExp.exec('');
		while (match = language_tag.privateuse_fragment_RegExp.exec(tag)) {
			i.push(match[1]);
		}
		library_namespace.debug('privateuse: ' + i, 2, 'language_tag.parse');

	} else if (library_namespace.is_debug()) {
		library_namespace.warn('unrecognized language tag: [' + tag + ']');
	}

	return this;
};

// 查表對照轉換。
language_tag.convert = function() {
	// TODO
	throw new Error(1,
	'language_tag.convert: Not Yet Implemented!');
};

/*
new language_tag('cmn-Hant-TW');
new language_tag('zh-cmn-Hant-TW');
new language_tag('zh-Hant-TW');
new language_tag('zh-TW');
new language_tag('cmn-Hant');
new language_tag('zh-Hant');
new language_tag('x-CJK').language;
new language_tag('zh-Hant').language;
*/


// 語系代碼，應使用 language_tag.language_code(region) 的方法。
// 主要的應該放後面。
// mapping: region code (ISO 3166) → default language code (ISO 639)
// https://en.wikipedia.org/wiki/Template:ISO_639_name
language_tag.LANGUAGE_CODE = {
	// 中文
	ZH : 'zh',
	// http://www.iana.org/assignments/language-subtag-registry/language-subtag-registry
	// Preferred-Value: cmn
	CN : 'cmn-Hans',
	HK : 'cmn-Hant',
	TW : 'cmn-Hant',
	// ja-JP
	JP : 'ja',
	// ko-KR
	KR : 'ko',
	GB : 'en',
	// en-UK
	UK : 'en',
	// en-US
	US : 'en',
	FR : 'fr',
	DE : 'de',
	// ru-RU
	RU : 'ru'
};

/**
 * Get the default language code of region.
 * 
 * @param {String}region
 *            region code (ISO 3166)
 * @returns {String} language code (ISO 639)
 */
language_tag.language_code = function(region, regular_only) {
	var code = language_tag.LANGUAGE_CODE[language_tag.region_code(region)];
	if (!code) {
		if (library_namespace.is_debug())
			library_namespace.warn('無法辨識之國家/區域：[' + region + ']');
		if (regular_only)
			return;
	}
	return code || region.toLowerCase();
}


// mapping: region name → region code (ISO 3166)
// https://en.wikipedia.org/wiki/ISO_3166-1
language_tag.REGION_CODE = {
	臺 : 'TW',
	臺灣 : 'TW',
	台 : 'TW',
	台灣 : 'TW',
	中 : 'CN',
	// for language_tag.LANGUAGE_CODE
	中文 : 'ZH',
	陸 : 'CN',
	大陸 : 'CN',
	中國大陸 : 'CN',
	日 : 'JP',
	日本 : 'JP',
	港 : 'HK',
	香港 : 'HK',
	韓國 : 'KR',
	英國 : 'UK',
	美國 : 'US',
	法國 : 'FR',
	德國 : 'DE'
};

// reverse
(function() {
	for (var language_code in language_tag.LANGUAGE_CODE)
		language_tag.REGION_CODE[language_tag.LANGUAGE_CODE[language_code]] = language_code;
})();

/**
 * Get the default region code of region.
 * 
 * @param {String}region
 *            region name
 * @returns {String} region code (ISO 3166)
 */
language_tag.region_code = function(region, regular_only) {
	var code = language_tag.REGION_CODE[region];
	if (!code) {
		// 嘗試解析。
		if (/^[a-z]+$/.test(region))
			code = language_tag.REGION_CODE[region.toLowerCase()];
		else if (code = region.match(/^(.+)[語文]$/)) {
			code = language_tag.REGION_CODE[code[1]]
			|| language_tag.REGION_CODE[code[1] + '國'];
		} else {
			code = language_tag.REGION_CODE[region + '國'];
		}
		if (!code) {
			// 依舊無法成功。
			if (library_namespace.is_debug())
				library_namespace.warn('無法辨識之國家/區域：[' + region + ']');
			if (regular_only)
				return;
			code = region.toUpperCase();
		}
	}
	return code;
}

_// JSDT:_module_
.
language_tag = language_tag;


// ----------------------------------------------------------------------------------------------------------------- //
//	中文數字 (Chinese numerals)

function to_search_pattern(keys) {
	var key, chars = [], long_keys = [];
	function add(key) {
		if (key)
			if (key.length === 1)
				chars.push(key);
			else
				long_keys.push(key);
	}

	if (Array.isArray(keys))
		keys.forEach(add);
	else
		for (key in keys)
			add(key);

	chars = chars.length > 0 ? '[' + chars.join('') + ']'
			: '';
	if (long_keys.length > 0 && chars)
		long_keys.push(chars);

	// /(?:long_keys|long_keys|[chars])/g
	// /[chars]/g
	return new RegExp(long_keys.length > 0 ? '(?:'
			+ long_keys.join('|') + ')' : chars, 'g');
}

var
//	小寫數字
Chinese_numerals_Normal_digits = '〇一二三四五六七八九',
Chinese_numerals_Normal_digits_Array = Chinese_numerals_Normal_digits.split(''),
Chinese_numerals_Normal_digits_pattern = to_search_pattern(Chinese_numerals_Normal_digits_Array),
numerals_Normal_pattern = new RegExp('(' + Chinese_numerals_Normal_digits_pattern.source
		+ '|\\d+)', 'g'),
amount_pattern = new RegExp(numerals_Normal_pattern.source
		+ '?([十百千])', 'g'),

//	正式大寫數字
Chinese_numerals_Formal_digits = '零壹貳參肆伍陸柒捌玖',
Chinese_numerals_Formal_digits_Array = Chinese_numerals_Formal_digits.split(''),
Chinese_numerals_Formal_digits_pattern = to_search_pattern(Chinese_numerals_Formal_digits_Array),

// http://thdl.ntu.edu.tw/suzhou/
// 蘇州碼子又稱花碼、番仔碼、草碼、菁仔碼
Suzhou_numerals_digits = '〇〡〢〣〤〥〦〧〨〩',
// 全形阿拉伯數字 U+FF10~U+FF19 FULLWIDTH DIGIT
FULLWIDTH_DIGITS = '０１２３４５６７８９',
//
positional_Chinese_numerals_digits = Chinese_numerals_Normal_digits + Chinese_numerals_Formal_digits + Suzhou_numerals_digits.slice(1) + FULLWIDTH_DIGITS,
positional_Chinese_numerals_digits_pattern = new RegExp('[' + positional_Chinese_numerals_digits + ']', 'g'),


//	舊時/非正式/通用數字
numeral_convert_pair = {
	// o : '〇',
	Ｏ : '〇',
	'○' : '〇',
	弌 : '壹',
	弍 : '貳',
	兩 : '二',
	叁 : '參',
	叄 : '參',
	弎 : '參',
	亖 : '四',
	//	Firefox/3.0.19 無法 parse '䦉': 錯誤: invalid property id
	'䦉' : '肆',

	//念圓 : '貳拾圓',
	//念 : '貳拾',
	廿 : '二十',
	卄 : '二十',
	卅 : '三十',
	// e.g., 卌又三年
	卌 : '四十',
	皕 : '二百',
	陌 : '百',
	阡 : '仟',
	萬萬 : '億',
	// 太常使用。
	// 經 : '京',
	杼 : '秭',
	壤 : '穰',

	厘 : '釐'
	// 太常使用。
	// 毛 : '毫'
},
//
numeral_convert_pattern,

//	denomination, 萬進系統單位
//	http://zh.wikipedia.org/wiki/%E4%B8%AD%E6%96%87%E6%95%B0%E5%AD%97	http://zh.wikipedia.org/wiki/%E5%8D%81%E8%BF%9B%E5%88%B6	http://zh.wikipedia.org/wiki/%E4%B8%AD%E6%96%87%E6%95%B0%E5%AD%97	http://lists.w3.org/Archives/Public/www-style/2003Apr/0063.html	http://forum.moztw.org/viewtopic.php?t=3043	http://www.moroo.com/uzokusou/misc/suumei/suumei.html	http://espero.51.net/qishng/zhao.htm	http://www.nchu.edu.tw/~material/nano/newsbook1.htm
//	http://www.moroo.com/uzokusou/misc/suumei/suumei1.html
//	十億（吉）,兆（萬億）,千兆（拍）,百京（艾）,十垓（澤）,秭（堯）,秭:禾予;溝(土旁);,無量大數→,無量,大數;[載]之後的[極]有的用[報]	異體：阿僧[禾氏],For Korean:阿僧祗;秭:禾予,抒,杼,For Korean:枾	For Korean:不可思議(不:U+4E0D→U+F967)
//	Espana應該是梵文所譯 因為根據「大方廣佛華嚴經卷第四十五卷」中在「無量」這個數位以後還有無邊、無等、不可數、不可稱、不可思、不可量、不可說、不可說不可說，Espana應該是指上面其中一個..因為如果你有心查查Espana其實應該是解作西班牙文的「西班牙」
//',萬,億,兆,京,垓,秭,穰,溝,澗,正,載,極,恒河沙,阿僧祇,那由他,不可思議,無量大數'
Chinese_numerals_Denominations = ',萬,億,兆,京,垓,秭,穰,溝,澗,正,載,極',
Chinese_numerals_Denominations_Array = Chinese_numerals_Denominations.split(','),
Chinese_numerals_Denominations_pattern = to_search_pattern(Chinese_numerals_Denominations_Array),
Chinese_numerals_token_pattern = new RegExp('(.*?)('
		+ Chinese_numerals_Denominations_pattern.source + ')', 'g'),

//	TODO:
//	http://zh.wikipedia.org/wiki/%E5%8D%81%E9%80%80%E4%BD%8D
//	比漠微細的，是自天竺的佛經上的數字。而這些「佛經數字」已成為「古代用法」了。
//	小數單位(十退位)：分,釐(厘),毫(毛),絲,忽,微,纖,沙,塵（納）,埃,渺,漠(皮),模糊,逡巡,須臾（飛）,瞬息,彈指,剎那（阿）,六德(德),虛,空,清,淨	or:,虛,空,清,淨→,空虛,清淨（仄）,阿賴耶,阿摩羅,涅槃寂靜（攸）
//	六釐英金庚款公債條例: 年息定為?釐, 年利率?厘
Chinese_numerals_Decimal_denominations = '分釐毫絲忽微纖沙塵埃渺漠',
numerals_Decimal_token_pattern = new RegExp(numerals_Normal_pattern.source
		+ '([' + Chinese_numerals_Decimal_denominations + '])', 'g'),

//	下數系統單位
Chinese_numerals_Normal_base_denomination = (',十,百,千' + Chinese_numerals_Denominations).split(','),
Chinese_numerals_Formal_base_denomination = (',拾,佰,仟' + Chinese_numerals_Denominations).split(','),
//
Chinese_numerals_Normal_pattern = new RegExp('(?:負?(?:[' + Chinese_numerals_Normal_digits
		+ '\\d ]['+Chinese_numerals_Normal_base_denomination.join('')
		+ ']*|['+Chinese_numerals_Normal_base_denomination.join('')
		+ ']+)+(又|分之)?)+', 'g'),
Chinese_numerals_Normal_Full_matched = new RegExp('^(?:負?[' + Chinese_numerals_Normal_digits
		+ '\\d '+Chinese_numerals_Normal_base_denomination.join('')
		+ '又]+|分之)+$'),
//
numeral_value = library_namespace.null_Object();


_.Chinese_numerals_Normal_digits = Chinese_numerals_Normal_digits;
_.Chinese_numerals_Formal_digits = Chinese_numerals_Formal_digits;
_.Chinese_numerals_Denominations = Chinese_numerals_Denominations_Array.join('');


(function() {
	var base, scale = 0;
	Chinese_numerals_Normal_digits_Array.forEach(function(digits) {
		numeral_value[digits] = scale;
		scale++;
	});

	base = scale;
	'十,百,千'.split(',').forEach(function(denomination) {
		numeral_value[denomination] = scale;
		scale *= base;
	});

	base = scale;
	Chinese_numerals_Denominations_Array.forEach(function(denomination) {
		if (denomination) {
			numeral_value[denomination] = scale;
			scale *= base;
		}
	});

	scale = .1;
	Chinese_numerals_Decimal_denominations.split('').forEach(function(denomination) {
		if (denomination) {
			numeral_value[denomination] = scale;
			scale /= 10;
		}
	});

	for (scale = 1; scale < Suzhou_numerals_digits.length; scale++) {
		numeral_value[base = Suzhou_numerals_digits.charAt(scale)] = scale;
		numeral_convert_pair[base] = Chinese_numerals_Normal_digits[scale];
	}

	for (scale = 0; scale < FULLWIDTH_DIGITS.length; scale++) {
		numeral_value[base = FULLWIDTH_DIGITS.charAt(scale)] = scale;
		numeral_convert_pair[base] = Chinese_numerals_Normal_digits[scale];
	}

	numeral_convert_pattern = to_search_pattern(numeral_convert_pair);
})();


// 對所有非正規之數字。
// TODO (bug): 十廿, 二廿
function normalize_Chinese_numeral(number_String) {
	return number_String
		//.replace(/\s+/g, '')
		//
		.replace(numeral_convert_pattern, function($0) {
			return numeral_convert_pair[$0];
		});
}

_.normalize_Chinese_numeral = normalize_Chinese_numeral;


function Chinese_numerals_Formal_to_Normal(number_String) {
	return number_String
	.replace(
			Chinese_numerals_Formal_digits_pattern,
			function($0) {
				return Chinese_numerals_Normal_digits
						.charAt(Chinese_numerals_Formal_digits.indexOf($0));
			})
	//
	.replace(/[拾佰仟]/g, function(denomination) {
		return '十百千'.charAt('拾佰仟'.indexOf(denomination));
	});
}

_.Chinese_numerals_Formal_to_Normal = Chinese_numerals_Formal_to_Normal;

function Chinese_numerals_Normal_to_Formal(number_String) {
	return number_String
	//
	.replace(
			Chinese_numerals_Normal_digits_pattern,
			function($0) {
				return Chinese_numerals_Formal_digits
						.charAt(Chinese_numerals_Normal_digits.indexOf($0));
			})
	//
	.replace(/[十百千]/g, function($0) {
		return '拾佰仟'.charAt('十百千'.indexOf($0));
	});

}

_.Chinese_numerals_Normal_to_Formal = Chinese_numerals_Normal_to_Formal;


/**
 * 將漢字中文數字轉換為半形阿拉伯數字表示法(小數系統 0-99999)
 * 
 * @deprecated use from_Chinese_numeral.
 */
function deprecated_from_Chinese_numeral(number_String) {
	if (!number_String || !isNaN(number_String))
		return number_String;

	number_String = Chinese_numerals_Formal_to_Normal(normalize_Chinese_numeral('' + number_String));

	var i = 0, l, m, n = Chinese_numerals_Normal_digits_Array, d = '萬千百十'.split(''), r = 0,
	// <a
	// href="http://zh.wikipedia.org/wiki/%E6%97%A5%E8%AA%9E%E6%95%B8%E5%AD%97"
	// accessdate="2012/9/10 21:0">日語數字</a>
	p = ('' + number_String).replace(/\s/g, '').replace(/[Ｏ○]/g, '〇');
	for (; i < n.length; i++)
		n[n[i]] = i;
	for (i = 0; i < d.length; i++) {
		if (p && (m = d[i] ? p.indexOf(d[i]) : p.length) !== NOT_FOUND)
			if (!m && d[i] === '十')
				r += 1, p = p.slice(1);
			else if (isNaN(l = n[p.slice(0, m).replace(/^〇+/, '')]))
				return number_String;
			else
				r += l, p = p.slice(m + 1);
		if (d[i])
			r *= 10;
	}

	return r;
}


/**
 * <code>

CeL.assert(['一百兆〇八億〇八百',CeL.to_Chinese_numeral(100000800000800)],'小寫中文數字');
CeL.assert(['捌兆肆仟陸佰柒拾貳億捌仟柒佰參拾捌萬玖仟零肆拾柒',CeL.to_Chinese_numeral(8467287389047,true)],'大寫中文數字');
CeL.assert(['新臺幣肆萬參拾伍圓參角肆分貳文參',CeL.to_TWD(40035.3423)],'貨幣/currency test');
CeL.assert([8467287389047,CeL.from_Chinese_numeral(CeL.to_Chinese_numeral(8467287389047,true))],'中文數字');
for(var i=0;i<=1000;i++)
	CeL.assert([i,CeL.from_Chinese_numeral(CeL.to_Chinese_numeral(i,true))],'中文數字 '+i);

CeL.assert(["壬辰以來，至景初元年丁已歲，積4046，算上。",CeL.from_Chinese_numeral('壬辰以來，至景初元年丁已歲，積四千四十六，算上。')]);
CeL.assert(['40179字',CeL.from_Chinese_numeral('四萬百七十九字')]);
CeL.assert([10000000000000000,CeL.from_Chinese_numeral('京')]);
CeL.assert(['10000字',CeL.from_Chinese_numeral('一萬字')]);
CeL.assert(['正常情況下:40379字',CeL.from_Chinese_numeral('正常情況下:四萬〇三百七十九字')]);
CeL.assert([4.5,CeL.from_Chinese_numeral('2分之九')]);
CeL.assert(["1974年",CeL.from_positional_Chinese_numeral('一九七四年')]);
CeL.assert(["一九七四年",CeL.to_positional_Chinese_numeral('1974年')]);
CeL.assert([4022,CeL.from_positional_Chinese_numeral('〤〇〢二')],'擴充蘇州碼子');

</code>
 */


function from_positional_Chinese_numeral(number_String) {
	return isNaN(number_String = number_String.replace(
			positional_Chinese_numerals_digits_pattern, function(digit) {
				return numeral_value[digit];
			})) ? number_String : +number_String;
}

function to_positional_Chinese_numeral(number_String, formal) {
	formal = formal ? Chinese_numerals_Formal_digits_Array : Chinese_numerals_Normal_digits_Array;
	return ('' + number_String).replace(
			/\d/g, function(digit) {
				return formal[digit];
			});
}

_.positional_Chinese_numerals_digits = positional_Chinese_numerals_digits;
_.from_positional_Chinese_numeral = from_positional_Chinese_numeral;
_.to_positional_Chinese_numeral = to_positional_Chinese_numeral;


// 將漢字中文數字轉換為半形阿拉伯數字表示法。(正常情況下:小數系統 0-9999)
function from_Chinese_numeral_token(amount) {
	if (!isNaN(amount))
		return +amount;

	// reset
	amount_pattern.lastIndex = 0;

	var token_sum = 0, matched, lastIndex = 0;
	while (matched = amount_pattern.exec(amount)) {
		lastIndex = amount_pattern.lastIndex;
		// [ , digit, denomination ]
		// for "一千零十一" 等。
		token_sum += (matched[1] && matched[1] !== '〇' ? numeral_value[matched[1]]
		: 1)
		* numeral_value[matched[2]];
	}

	// lastIndex 後面的全部放棄。
	amount = amount.slice(lastIndex).replace(/^〇+/, '');
	numerals_Normal_pattern.lastIndex = 0;
	if (matched = numerals_Normal_pattern.exec(amount))
		token_sum += isNaN(matched = matched[0]) ? numeral_value[matched]
	: +matched;

		return token_sum || 0;
}

// 將漢字中文數字轉換為阿拉伯數字表示法。
// 注意：本函數不會檢查 number_String 之正規與否！
function from_Chinese_numeral(number_String) {
	if (!number_String || !isNaN(number_String))
		return number_String;

	number_String = Chinese_numerals_Formal_to_Normal(normalize_Chinese_numeral(''
			+ number_String));

	if (!Chinese_numerals_Normal_Full_matched
			.test(number_String)) {
		// 部分符合，僅針對符合部分處理。
		Chinese_numerals_Normal_pattern.lastIndex = 0;
		return number_String.replace(
				Chinese_numerals_Normal_pattern,
				from_Chinese_numeral);
	}

	var sum = 0, matched, lastIndex = 0, negative = number_String
	.charAt(0) === '負';
	if (matched = number_String
			.match(/^(負)?(?:(.+)又)?(.+)分之(.+)$/)) {
		sum = (matched[2]
		&& from_Chinese_numeral(matched[2]) || 0)
		+ from_Chinese_numeral(matched[4])
		/ from_Chinese_numeral(matched[3]);
		return negative ? -sum : sum;
	}

	// reset
	Chinese_numerals_token_pattern.lastIndex = 0;

	while (matched = Chinese_numerals_token_pattern
			.exec(number_String)) {
		// [ , amount, denomination ]
		sum += from_Chinese_numeral_token(matched[1] || 1)
		* numeral_value[matched[2]];
		lastIndex = Chinese_numerals_token_pattern.lastIndex;
	}

	number_String = number_String.slice(lastIndex);
	numerals_Decimal_token_pattern.lastIndex = 0;
	if (lastIndex = numerals_Decimal_token_pattern
			.exec(number_String)) {
		// 輸入 '捌佰3分' 之類。
		lastIndex = lastIndex.index;
		matched = [ , number_String.slice(0, lastIndex),
		            number_String.slice(lastIndex) ];
	} else
		// 輸入 '捌佰3又3分' 之類。
		matched = number_String.match(/(.*)[點又.](.*)/)
		|| [ , number_String ];
	sum += from_Chinese_numeral_token(matched[1]);

	if (number_String = matched[2])
		// 小數。
		for (var base = .1, lastIndex = 0;; base /= 10) {
			numerals_Decimal_token_pattern.lastIndex = lastIndex;
			if (matched = numerals_Decimal_token_pattern
					.exec(number_String)) {
				lastIndex = numerals_Decimal_token_pattern.lastIndex;
				// 單位
				base = numeral_value[matched[2]];
				matched = matched[1];
			} else {
				numerals_Normal_pattern.lastIndex = lastIndex;
				if (matched = numerals_Normal_pattern
						.exec(number_String)) {
					lastIndex = numerals_Normal_pattern.lastIndex;
					matched = matched[0];
				} else
					break;
			}
			if (isNaN(matched))
				matched = numeral_value[matched];
			else if (matched > 9)
				matched = matched.replace(/^(\d)/, '$1.');
			else
				matched = +matched;
			sum += matched * base;
		}

	return negative ? -sum : sum;
}



// 將阿拉伯數字轉為中文數字<b>下數系統</b>大寫、小寫兩種表示法/讀法
// 處理1-99999的數,尚有bug
function to_Chinese_numeral_Low_count(number_String, formal) {
	// 用r=[]約多花一倍時間!
	var i = 0, r = '', l = number_String.length - 1, d, tnum = formal ? Chinese_numerals_Formal_digits_Array
			: Chinese_numerals_Normal_digits_Array, zero = tnum[0], tbd = formal ? Chinese_numerals_Formal_base_denomination
					: Chinese_numerals_Normal_base_denomination;

	for (; i <= l; i++)
		// if(d=parseInt(number_String.charAt(i)))比較慢
		if ((d = number_String.charAt(i)) !== '0')
			// '〇一二三四五六七八'.charAt(d) 比較慢
			r += tnum[d] + tbd[l - i];
		else if (r.slice(-1) != zero)
			if (Math.floor(number_String.substr(i + 1)))
				r += zero;
			else
				break;
	return r;
}
//2.016,2.297,2.016
//{var d=new Date,v='12345236',i=0,a;for(;i<10000;i++)a=to_Chinese_numeral(v);alert(v+'\n→'+a+'\ntime:'+gDate(new Date-d));}


/**
 * 將阿拉伯數字轉為萬進中文數字表示法。
 * num>1京時僅會取概數，此時得轉成string再輸入！
 * TODO:
 * 統整:尚有bug。
 * 廿卅
 * 小數
 * 
 * @param number
 * @param formal kind
 * @returns {String} 中文數字
 * 
 */
function to_Chinese_numeral(number, formal) {
	// number = parseFloat(number);
	number = (typeof number === 'number' ? number
			.toString(10) : '' + number).replace(/[,\s]/g,
			'');

	if (!/^[+\-]?(?:\d+(?:\.\d*)?|(?:\d*\.)?\d+)$/
			.test(number))
		// 非數值
		return number.replace(
				/[+\-]?(?:\d+(?:\.\d*)?|(?:\d*\.)?\d+)/g,
						function($0) {
					return to_Chinese_numeral($0, formal);
				});

	var j,
	// i:integer,整數;
	i,
	// d:decimal,小數
	d = number.indexOf('.'), k, l, m, addZero = false, tnum = formal ? Chinese_numerals_Formal_digits_Array
			: Chinese_numerals_Normal_digits_Array, zero = tnum[0];
	if (d === NOT_FOUND)
		d = 0;
	else
		for (number = number.replace(/0+$/, ''), i = number
				.substr(d + 1),
				number = number.slice(0, d), d = '', j = 0; j < i.length; j++)
			// 小數
			d += tnum[i.charAt(j)];

	// 至此 number 為整數。
	if (number.charAt(0) === '-')
		i = '負', number = number.substr(1);
	else
		i = '';
	number = number.replace(/^0+/, '');

	m = number.length % 4, j = m - 4,
	l = (number.length - (m || 4)) / 4;
	// addZero=false, l=Math.floor((number.length-1)/4)
	for (; j < number.length; m = 0, l--)
		// 這邊得用 parseInt( ,10):
		// parseInt('0~')會用八進位，其他也有奇怪的效果。
		if (Math.floor(m = m ? number.slice(0, m) : number
				.substr(j += 4, 4))) {
			m = to_Chinese_numeral_Low_count(m, formal);
			if (addZero = addZero && m.charAt(0) != zero)
				i += zero
				+ m
				+ Chinese_numerals_Denominations_Array[l],
				addZero = false;
			else
				i += m
				+ Chinese_numerals_Denominations_Array[l];
		} else
			addZero = true;

	return (i ? i.slice(0, 2) === '一十'
		|| i.slice(0, 2) === '一拾' ? i.substr(1) : i
				: zero)
				+ (d ? '點' + d : '');
}


_.from_Chinese_numeral = from_Chinese_numeral;
_.to_Chinese_numeral = to_Chinese_numeral;



/**
 * 各區文化特色 - 貨幣轉換:<br />
 * 轉換成新臺幣中文大寫金額表示法。<br />
 * Converted into money notation.
 * 
 * @example <code>

	//	貨幣/currency test
	CeL.assert([ '新臺幣肆萬參拾伍圓參角肆分貳文參',
	    CeL.to_TWD(40035.3423) ]);

 * </code>
 * 
 * @param {Number|String}amount
 *            貨幣數量。
 * @returns {String} 新臺幣金額中文大寫表示法。
 * 
 * @requires to_Chinese_numeral()
 */
function to_TWD(amount) {
	if (typeof amount === 'string')
		amount = amount.replace(/[\s,$]+/g, '');

	amount = to_Chinese_numeral(amount, true)
		// 銀行習慣用法，零可以不用寫。
		.replace(/([仟萬億兆京垓秭穰溝澗正載極])零/g, '$1');

	return '新臺幣'
		+ (amount.indexOf('點') === NOT_FOUND ?
			amount + '圓整'
			: amount.replace(
				/點(.)(.)?(.)?/, function($0, $1, $2, $3) {
					return '圓' + $1 + '角' + ($2 ? $2 + '分' + ($3 ? $3 + '文' : '') : '');
				}));
}

_// JSDT:_module_
.
to_TWD = to_TWD;


// ----------------------------------------------------------------------------------------------------------------- //

// https://hi.wikipedia.org/wiki/%E0%A4%AE%E0%A5%80%E0%A4%A1%E0%A4%BF%E0%A4%AF%E0%A4%BE%E0%A4%B5%E0%A4%BF%E0%A4%95%E0%A4%BF:Gadget-Numeral_converter.js
// https://hi.wikipedia.org/wiki/%E0%A4%B5%E0%A4%BF%E0%A4%95%E0%A4%BF%E0%A4%AA%E0%A5%80%E0%A4%A1%E0%A4%BF%E0%A4%AF%E0%A4%BE:%E0%A4%85%E0%A4%82%E0%A4%95_%E0%A4%AA%E0%A4%B0%E0%A4%BF%E0%A4%B5%E0%A4%B0%E0%A5%8D%E0%A4%A4%E0%A4%95

// 天城文（देवनागरी / devanāgarī）
var Devanagari_numeral = '०१२३४५६७८९',
//
Devanagari_numeral_RegExp = new RegExp('[' + Devanagari_numeral + ']', 'g');


Devanagari_numeral.split('').forEach(function(digit, index) {
	numeral_convert_pair[digit] = index;
});


function to_Devanagari_numeral(number) {
	return String(number).replace(/\d/g, function($0) {
		return Devanagari_numeral.charAt($0);
	});
}

function from_Devanagari_numeral(number) {
	number = String(number).replace(Devanagari_numeral_RegExp, function($0) {
		return numeral_convert_pair[$0];
	});
	if (!isNaN(number))
		number = Number(number);
	return number;
}

_.to_Devanagari_numeral = to_Devanagari_numeral;
_.from_Devanagari_numeral = from_Devanagari_numeral;


/*
TODO:
https://en.wikipedia.org/wiki/Eastern_Arabic_numerals
https://en.wiktionary.org/wiki/8
*/


// ----------------------------------------------------------------------------------------------------------------- //
//	JavaScript i18n (Internationalization) / l10n (Localization) / 全球化 g11n (Globalization).


/**
 * 為各種不同 domain 轉換文字（句子）。包括但不僅限於各種語系。<br />
 * 需要確認系統相應 domain resource 已載入時，請利用 gettext.use_domain(domain, callback)。
 * TODO:
 * using localStorage.
 * 
 * @example <code>

//	##i18n (Internationalization) / l10n (Localization)

//	###usage 2014/2/5

//	define gettext() user domain resource location.
//	gettext() will auto load (CeL.env.domain_location + language + '.js').
//	e.g., resource/cmn-Hant-TW.js, resource/ja-JP.js
CeL.env.domain_location = 'resource/';
//	declaration for gettext()
var _;

//	###including
CeL.run('application.locale', function() {
	// alias for CeL.gettext, then we can use _('message').
	_ = CeL.gettext;
});



//	###System message test
CeL.gettext.use_domain('TW', function() {
	CeL.assert([ '載入中…', CeL.gettext('Loading...') ]);
	CeL.assert([ '已載入 20%…', CeL.gettext('Loading %1%...', 20) ]);
	CeL.info('System message test OK.');
},
// 強制使用此 domain。 forces to this domain.
true);



//	###單數複數形式 (plural) test
CeL.gettext.set_text({
	'已載入 %1 筆資料。' : function(domain_name, arg) {
		// with error detection:
		//return (arg[1] < 2 ? (arg[1] ? arg[1] === 1 ? 'One' : 'ERROR: %1' : 'No') + ' entry' : '%1 entries') + ' loaded.';

		// No, One & more.
		return (arg[1] < 2 ? (arg[1] ? 'One' : 'No') + ' entry' : '%1 entries') + ' loaded.';

		// More simplified:
		// arg[>>>1<<<] : from %>>>1<<<'s "1"
		//return '%1 ' + (1 < arg[1] ? 'entries' : 'entry') + ' loaded.';
	}
}, 'en');

CeL.gettext.use_domain('en', function() {
	CeL.assert([ 'No entry loaded.', CeL.gettext('已載入 %1 筆資料。', 0) ]);
	CeL.assert([ 'One entry loaded.', CeL.gettext('已載入 %1 筆資料。', 1) ]);
	CeL.assert([ '2 entries loaded.', CeL.gettext('已載入 %1 筆資料。', 2) ]);
	CeL.assert([ '3 entries loaded.', CeL.gettext('已載入 %1 筆資料。', 3) ]);
	CeL.info('單數複數形式 (plural) test OK.');
}, true);



//	###basic test
CeL.gettext.use_domain('zh-TW', function() {
	;
}, true);

//	設定欲轉換的文字格式。
CeL.gettext.set_text({
	'%n1 smart ways to spend %c2' : '%Chinese/n1個花%c2的聰明方法'
}, 'Traditional Chinese');

CeL.assert([ '十個花新臺幣柒萬圓整的聰明方法',
		CeL.gettext('%n1 smart ways to spend %c2', 10, 70000) ],
		'test it with 貨幣/currency#1');

CeL.assert([ '二十五個花新臺幣捌拾億捌萬圓整的聰明方法',
		CeL.gettext('%n1 smart ways to spend %c2', 25, 8000080000) ],
		'test it with 貨幣/currency#2');

CeL.assert([ '四萬〇三十五個花新臺幣伍佰玖拾捌萬陸仟玖佰貳拾捌圓整的聰明方法',
		CeL.gettext('%n1 smart ways to spend %c2', 40035, 5986928) ],
		'test it with 貨幣/currency#3');


//	###test with 貨幣
CeL.gettext.conversion['smart way'] = [ 'no %n', '1 %n', '%d %ns' ];
// You can also use this:
CeL.gettext.conversion['smart way'] = function(count) {
	var pattern = [ 'no %n', '1 %n', '%d %ns' ];
	return pattern[count < pattern.length ? count : pattern.length - 1]
			.replace(/%n/, 'smart way').replace(/%d/, count);
};

//	then we can use:
CeL.gettext.set_text({
	'%smart way@1 to spend %c2' : '%Chinese/n1個花%c2的聰明方法'
}, 'TW');

CeL.gettext.use_domain('繁體中文');
CeL.assert([ '十個花新臺幣柒萬圓整的聰明方法',
		CeL.gettext('%smart way@1 to spend %c2', 10, 70000) ]);
CeL.assert([ '二十五個花新臺幣捌拾億捌萬圓整的聰明方法',
		CeL.gettext('%smart way@1 to spend %c2', 25, 8000080000) ]);
CeL.assert([ '四萬〇三十五個花新臺幣伍佰玖拾捌萬陸仟玖佰貳拾捌圓整的聰明方法',
		CeL.gettext('%smart way@1 to spend %c2', 40035, 5986928) ]);

CeL.gettext.use_domain('en-US', true);
CeL.assert([ '10 smart ways to spend US$70,000',
		CeL.gettext('%smart way@1 to spend %c2', 10, 70000) ]);


CeL.assert([ "二十世紀八十年代", CeL.gettext('%數1世紀%數2年代', 20, 80) ], 'conversion:小寫中文數字');
CeL.assert([ "央行上調基準利率2碼", CeL.gettext('央行上調基準利率%碼1', .005) ], 'conversion:碼');

CeL.assert([ "女人401枝花", CeL.gettext('女人%1|1枝花', 40) ], 'index 可以 "|" 終結#1');
CeL.assert([ "女人四十1枝花", CeL.gettext('女人%數1|1枝花', 40) ], 'index 可以 "|" 終結#2');


 * </code>
 * 
 * @param {String|Function|Object}text_id
 *            欲呼叫之 text id。<br /> ** 若未能取得，將直接使用此值。因此即使使用簡單的代號，也建議使用 msg#12,
 *            msg[12] 之類的表示法，而非直接以整數序號代替。<br />
 *            嵌入式的一次性使用，不建議如此作法: { domain : text id }
 * @param {String|Function}conversion_list
 *            other conversion to include
 * 
 * @returns {String}轉換過的文字。
 * 
 * @since 2012/9/9 00:53:52
 * 
 * @see <a
 *      href="http://stackoverflow.com/questions/48726/best-javascript-i18n-techniques-ajax-dates-times-numbers-currency"
 *      accessdate="2012/9/9 0:13">Best JavaScript i18n techniques / Ajax -
 *      dates, times, numbers, currency - Stack Overflow</a>,<br />
 *      <a
 *      href="http://stackoverflow.com/questions/3084675/internationalization-in-javascript"
 *      accessdate="2012/9/9 0:13">Internationalization in Javascript - Stack
 *      Overflow</a>,<br />
 *      <a
 *      href="http://stackoverflow.com/questions/9640630/javascript-i18n-internationalization-frameworks-libraries-for-clientside-use"
 *      accessdate="2012/9/9 0:13">javascript i18n (internationalization)
 *      frameworks/libraries for clientside use - Stack Overflow</a>,<br />
 *      <a href="http://msdn.microsoft.com/en-us/library/txafckwd.aspx" accessdate="2012/9/17 23:0">Composite Formatting</a>,
 *      http://wiki.ecmascript.org/doku.php?id=strawman:string_format,
 *      http://wiki.ecmascript.org/doku.php?id=strawman:string_format_take_two
 */
function gettext(text_id) {
	var arg = arguments, length = arg.length, domain_name = gettext_domain_name, domain = gettext_texts[domain_name],

	// 轉換 / convert function.
	convert = function(text_id, domain_specified) {
		// 未設定個別 domain 者，將以此訊息(text_id)顯示。
		// text_id 一般應採用原文(original)，或最常用語言；亦可以代碼表示，但須設定所有可能使用的語言。
		if (typeof text_id !== 'function' && (text_id in domain))
			text_id = domain[text_id];

		return typeof text_id === 'function' ? text_id(domain_name, arg, domain_specified)
				: text_id;
	},

	text = ''
		+ (convert(library_namespace.is_Object(text_id) ? text_id[domain_name]
		: text_id));

	if (length > 1)
		text = text
		.replace(
				/%(?:(%)|(?:([^%@\s\/]+)\/)?(?:([^%@\s\d]{1,3})|([^%@]+)@)?(\d{1,2})\|?)/g,
				function(conversion, is_escaped,
						domain_specified, format,
						object_name, NO) {
					// whole conversion specification:
					// %% || %index || %\w(conversion format specifier)\d{1,2}(index) || %[conversion specifications@]index
					// index 可以 "|" 終結。
					if (is_escaped)
						return is_escaped;

					// argument NO.
					NO = Number(NO);
					if (NO < length
							&& (!(format || (format = object_name)) || (format in gettext.conversion))) {
						// 避免 %0 形成 infinite loop。
						if (NO && domain_specified) {
							var d = domain, dn = domain_name,
							//
							_d = gettext_texts[domain_specified];
							// 臨時改變 domain。
							if (_d)
								domain = _d,
								domain_name = domain_specified;
							conversion = convert(
									arg[NO],
									domain_specified);
							// 回存。
							if (_d)
								domain = d,
								domain_name = dn;
						} else
							conversion = NO ? convert(arg[NO])
									: text_id;
						if (format)
							conversion = Array
							.isArray(object_name = gettext.conversion[format]) ? gettext_conversion_Array(
									conversion,
									object_name,
									format)
									: object_name(
											conversion,
											domain_specified
											|| domain_name);
					} else
						library_namespace
						.warn('gettext: '
								+ (NO < length ? 'Unknown format ['
										+ format
										+ ']'
										: 'given too few arguments: '
											+ length
											+ ' <= No. '
											+ NO));
					return conversion;
				});

	return text;
}


/**
 * 檢查指定資源是否已載入，若已完成，則執行 callback 序列。
 * 
 * @param {String}[domain_name]
 *            設定當前使用之 domain name。
 * @param {Integer}[type]
 *            欲設定已載入/未載入之資源類型。
 * @param {Boolean}[is_loaded]
 *            設定/登記是否尚未載入之資源類型。
 * @returns {Boolean} 此 type 是否已 loaded。
 */
function gettext_check_resource(domain_name, type,
		is_loaded) {
	if (!domain_name)
		domain_name = gettext_domain_name;

	var domain = gettext_resource[domain_name];
	if (!domain)
		gettext_resource[domain_name] = domain = library_namespace.null_Object();

	if (type)
		if (type = [ , 'system', 'user' ][type]) {
			if (typeof is_loaded === 'boolean') {
				library_namespace
				.debug('登記 [' + domain_name
						+ '] 已經載入資源 [' + type
						+ ']。', 2,
				'gettext_check_resource');
				domain[type] = is_loaded;
			}
		} else
			type = null;

	return type ? domain[type] : domain;
}


/**
 * 當設定 conversion 為 Array 時，將預設採用此 function。<br />
 * 可用在單數複數形式 (plural) 之表示上。
 * 
 * @param {Integer}amount
 *            數量。
 * @param {Array}conversion
 *            用來轉換的 Array。
 * @param {String}name
 *            format name。
 * 
 * @returns {String} 轉換過的文字/句子。
 */
function gettext_conversion_Array(amount, conversion_Array,
		name) {
	var text,
	// index used.
	// TODO: check if amount < 0 or amount is not integer.
	index = amount < conversion_Array.length ? parseInt(amount)
			: conversion_Array.length - 1;

	if (index < 0) {
		library_namespace.debug({
			T : [ 'Negative index: %1', index ]
		});
		index = 1;
	} else
		while (index >= 0
				&& !(text = conversion_Array[index]))
			index--;

	if (!text || typeof text !== 'string') {
		library_namespace
		.warn({
			T : [
			     'Nothing matched for amount [%1]',
			     amount ]
		});
		return;
	}

	if (name)
		text = text.replace(/%n/g, name);

	return text.replace(/%d/g, amount);
}


/**
 * 設定如何載入指定 domain resource，如語系檔。
 * 
 * @param {String|Function}path
 *            (String) prefix of path to load.<br />
 *            function(domain){return path to load;}
 */
gettext.use_domain_location = function(path) {
	if (typeof path === 'string') {
		gettext_location = path;
		// 重設 user domain resource。
		gettext_check_resource('', 2, false);
	}
	return gettext_location;
};
/**
 * 取得當前使用之 domain name。
 * 
 * @returns 當前使用之 domain name。
 */
gettext.get_domain_name = function() {
	return gettext_domain_name;
};
gettext.is_domain_name = function(domain_name) {
	return gettext_domain_name === gettext
	.to_standard(domain_name);
};
/**
 * 取得/設定當前使用之 domain。
 * 
 * @param {String}[domain_name]
 *            設定當前使用之 domain name。
 * @param {Function}[callback]
 *            回撥函式。
 * @param {Boolean}[force]
 *            強制載入 flag。即使不存在此 domain，亦設定之。
 * 
 * @returns 當前使用之 domain。
 */
gettext.use_domain = function(domain_name, callback, force) {
	if (typeof callback !== 'function')
		if (arguments.length === 2) {
			// shift 掉 callback。
			force = callback;
			callback = undefined;
		} else
			callback = null;

	if (domain_name
			// 查驗 domain_name 是否已載入。
			&& (domain_name in gettext_texts || (domain_name = gettext
					.to_standard(domain_name)
					|| domain_name) in gettext_texts)
					&& domain_name !== gettext_domain_name || force) {

		if (!domain_name)
			// using the default domain name.
			domain_name = gettext.default_domain;
		else if (library_namespace
				.is_included('interact.DOM'))
			// 顯示使用 domain name 之訊息：此時執行，仍無法改採新 domain 顯示訊息。
			library_namespace
			.debug(
					{
						T : [
						     '%3載入/使用 [%2] (%1) 領域/語系。',
						     domain_name,
						     gettext
						     .get_alias(domain_name),
						     (domain_name === gettext_domain_name ? '強制重複'
						    		 : '') ]
					}, 1, 'gettext');
		else
			library_namespace
			.debug(
					(domain_name === gettext_domain_name ? 'FORCE '
							: '')
							+ 'Using domain/locale ['
							+ gettext
							.get_alias(domain_name)
							+ '] ('
							+ domain_name
							+ ').', 1, 'gettext');

		gettext_domain_name = domain_name;
		if (!(domain_name in gettext_texts))
			gettext_texts[domain_name] = library_namespace.null_Object();

		var need_to_load = [];
		// TODO: use <a href="http://en.wikipedia.org/wiki/JSONP" accessdate="2012/9/14 23:50">JSONP</a>
		if (!gettext_check_resource(domain_name, 1)) {
			library_namespace.debug(
					'準備載入系統相應 domain resource。', 2,
			'gettext');
			need_to_load
			.push(
					library_namespace
					.get_module_path(
							module_name,
							'resource/'
							+ domain_name
							+ '.js'),
							function() {
						library_namespace
						.debug(
								'Resource of module included.',
								2,
						'gettext');
						gettext_check_resource(
								domain_name, 1,
								true);
					});
		}

		if (typeof gettext_location === 'string'
			//
			&& !gettext_check_resource(domain_name, 2)) {
			library_namespace.debug(
					'準備載入 user 指定 domain resource，如語系檔。',
					2, 'gettext');
			// TODO: .json
			need_to_load
			.push(
					typeof gettext_location === 'string' ? gettext_location
							+ domain_name + '.js'
							: gettext_location(domain_name),
							function() {
								library_namespace
								.debug(
										'User-defined resource included.',
										2,
								'gettext');
								gettext_check_resource(
										domain_name, 2,
										true);
							});
		}

		if (need_to_load.length > 0)
			library_namespace.run(need_to_load, callback
					&& function() {
				library_namespace.debug(
						'Running callback..', 2,
				'gettext');
				callback(domain_name);
			});
		else {
			library_namespace.debug(
					'直接設定 user domain resource。', 2,
			'gettext');
			gettext_check_resource(domain_name, 2, true);
			callback && callback(domain_name);
		}

	} else {
		if (domain_name) {
			if (domain_name !== gettext_domain_name)
				library_namespace.warn('所指定之 domain ['
						+ domain_name
						+ '] 尚未載入，若有必要請使用強制載入 flag。');

		} else if (callback && library_namespace.is_debug())
			library_namespace
			.warn('無法判別 domain，卻設定有 callback。');

		//	無論如何還是執行 callback。
		callback && callback(domain_name);
	}

	return gettext_texts[domain_name];
};


/**
 * 設定欲轉換的文字格式。
 * 
 * @param {Object}text_Object
 *            文字格式。 {<br />
 *            text id : text for this domain }<br />
 *            函數以回傳文字格式。 {<br />
 *            text id : function(domain name){ return text for this domain } }
 * @param {String}[domain]
 *            指定存入之 domain。
 * @param {Boolean}[replace]
 *            是否直接覆蓋掉原先之 domain。
 */
gettext.set_text = function(text_Object, domain, replace) {
	if (!library_namespace.is_Object(text_Object))
		return;

	if (!domain)
		domain = gettext_domain_name;

	// normalize domain
	if (!(domain in gettext_texts))
		domain = gettext.to_standard(domain);

	if (replace || !(domain in gettext_texts))
		gettext_texts[domain] = text_Object;
	else {
		// specify a new domain.
		// gettext_texts[domain] = library_namespace.null_Object();
		library_namespace.set_method(gettext_texts[domain], text_Object);
	}
};

// ------------------------------------

/**
 * 取得 domain 別名。
 * 
 * @param {String}[language]
 *            指定之正規名稱。
 * @returns {String} 主要使用之別名。
 * @returns {Object} { 正規名稱 : 別名 }
 */
gettext.get_alias = function(language) {
	return arguments.length > 0 ? gettext_main_alias[ language in gettext_main_alias ? language : gettext.to_standard(language) ] : gettext_main_alias;
};

/**
 * 設定 domain 別名。<br />
 * 本函數會改變 {Object}list!
 * 
 * @param {Object}list
 *            full alias list / 別名。 = {<br />
 *            norm/criterion (IANA language tag) : [<br />
 *            主要別名放在首個 (e.g., 當地使用之語言名稱),<br />
 *            最常用之 language tag (e.g., IETF language tag),<br />
 *            其他別名 / other aliases ] }
 */
gettext.set_alias = function(list) {
	if (!library_namespace.is_Object(list))
		return;

	var norm, alias, alias_list, index, i, l;
	for (norm in list) {
		alias_list = list[norm];
		if (typeof alias_list === 'string')
			alias_list = alias_list.split('|');
		else if (!Array.isArray(alias_list)) {
			library_namespace.warn('gettext.set_alias: Illegal alias list: [' + alias_list + ']');
			continue;
		}

		// 加入 norm 本身。
		alias_list.push(norm);

		for (i = 0, l = alias_list.length; i < l; i++)
			if (alias = alias_list[i]) {
				//library_namespace.debug('Adding [' + alias + '] → [' + norm + ']', 1, 'gettext.set_alias');
				if (!(norm in gettext_main_alias))
					gettext_main_alias[norm] = alias;

				// 正規化: 不分大小寫, _ → -
				alias = alias.replace(/_/g, '-').toLowerCase();
				// for fallback
				for (;;) {
					gettext_aliases[alias] = norm;

					index = alias.lastIndexOf('-');
					if (index < 1)
						break;
					alias = alias.slice(0, index);
				}
			}
	}
};

/**
 * 將 domain 別名正規化，轉為正規/標準名稱。<br />
 * to a standard form. normalize.
 * 
 * @param {String}alias
 *            指定之別名。
 * @returns {String} 正規名稱。
 * @returns undefined : can't found.
 */
gettext.to_standard = function(alias) {
	if (typeof alias !== 'string')
		return;

	// 正規化: 不分大小寫, _ → -
	alias = alias.toLowerCase().replace(/_/g, '-');
	var index;
	// for fallback
	for (;;) {
		//library_namespace.debug('test [' + alias + ']', 3, 'gettext.to_standard');
		if (alias in gettext_aliases)
			return gettext_aliases[alias];

		index = alias.lastIndexOf('-');
		if (index < 1)
			return;
		alias = alias.slice(0, index);
	}
};

//------------------------------------
//	DOM 操作。

/**
 * 翻譯/轉換所有指定之 nodes。<br />
 * translate all nodes to show in specified domain.
 * 
 * @param {String|NodeList|Array|HTMLElement}[filter]
 *            指定 selector || nodes || node || default domain。
 * 
 * @example <code>

//	###usage 2014/2/5

//	###runtime translate all nodes to show in specified language
//	including: interact.DOM will auto load application.locale.
CeL.run('interact.DOM', function() {
	//	setup domain (language)
	CeL.gettext.use_domain(language);

	//	simple way to create a text node with language tag.
	CeL.new_node({ T : message }, node);

	// handle with document.title in IE 8.
	if (CeL.set_text.need_check_title)
		CeL.gettext.document_title = document_title;

	// translate all nodes to show in specified language (or default domain).
	CeL.gettext.translate_nodes();
});


 * </code>
 */
gettext.translate_nodes = function(filter) {
	if (library_namespace.for_nodes) {
		gettext_DOM_id = gettext.DOM_id_key;
		library_namespace.for_nodes(gettext.translate_node, filter);
	}
};

gettext.translate_node = function(node) {
	var dataset, id, conversion, i = 0, key;
	try {
		// 為提高效率，不作檢查。
		dataset =
		// library_namespace.is_HTML_element(node) &&
		library_namespace.DOM_data && library_namespace.DOM_data(node)
				|| node.dataset;
		id =
		// dataset && dataset[gettext.DOM_id_key];
		dataset && dataset[gettext_DOM_id];

		if (!id && gettext.document_title) {
			if (node.tagName.toLowerCase() === 'title')
				// IE 8 中，除了 document.title，本工具大部分顯示皆能以 translate_nodes() 處理。
				// 對 IE 8，需要先設定 gettext.document_title = '~';
				id = gettext.document_title;
			// 若是不需要設定 gettext.document_title，則將之納入 .dataset。
			if (!library_namespace.set_text.need_check_title) {
				library_namespace.DOM_data(node, gettext_DOM_id,
						gettext.document_title);
				delete gettext.document_title;
			}
		}

	} catch (e) {
		library_namespace.warn('gettext.translate_node: 提取 gettext id 失敗。');
	}

	if (id) {
		conversion = [ id ];
		while ((key = gettext_DOM_id + ++i) in dataset)
			conversion.push(dataset[key]);
		library_namespace.set_text(node, gettext.apply(null, conversion));
	}
};
// for DOM use.
// <tag data-gettext="text id" data-gettext1="conversion 1"
// data-gettext2="conversion 2" />
gettext.DOM_id_key = gettext_DOM_id = 'gettext';
gettext.DOM_separator = '|';


gettext.adapt_domain = function(language) {
	library_namespace.debug('Loading ' + language + ' ..');

	gettext.use_domain(language, function() {
		library_namespace.debug(language + ' loaded.');
		gettext.translate_nodes();
		create_domain_menu.onchange.forEach(function(handler) {
			handler();
		});
	}, true);

	// 可能用於 element 中，直接用 return gettext.adapt_domain() 即可。
	return false;
};


/**
 * 
 * @param node
 * @param domain_Array
 */
function create_domain_menu(node, domain_Array, onchange) {
	if (!node || !domain_Array
		//
		|| !library_namespace.new_node)
		return;

	var menu = [],
	// default domain.
	tmp = gettext.get_domain_name();

	domain_Array.forEach(function(domain) {
		domain = gettext.to_standard(domain);
		var option = {
			option : gettext.get_alias(domain),
			value : domain
		};
		if (domain === tmp)
			option.selected = true;
		menu.push(option);
	});

	menu = {
		select : menu,
		onchange : function(e) {
			gettext.adapt_domain(library_namespace.node_value(this));
		}
	};

	if (tmp = create_domain_menu.tag)
		menu = [ {
			T : tmp
		}, ': ', menu ];

	if (typeof onchange === 'function')
		create_domain_menu.onchange.push(onchange);
	library_namespace.new_node(menu, node);
}

create_domain_menu.tag = 'Language';
create_domain_menu.onchange = [];

gettext.create_menu = create_domain_menu;

//------------------------------------
//	conversion specifications (轉換規格). e.g., 各區文化特色 - 數字、貨幣、時間、日期格式。

//數字系統。numeral system.
gettext.numeral = function(attribute, domain_name) {
	switch (domain_name || gettext_domain_name) {
	case 'Chinese':
		return to_Chinese_numeral(attribute);

	// 一般民間使用，相較於中文數字，更常使用阿拉伯數字。
	case 'cmn-Hant-TW':
	//	TODO: others

	default:
		return attribute;
	}
};

/**
 * 小數點, radix point, decimal point, decimal mark, decimal separator, 小数点の記号.
 * 
 * @param {String}[domain_name]
 *            設定當前使用之 domain name。
 * 
 * @returns {String} 指定/當前 domain 使用之小數點。
 * 
 * @see <a
 *      href="http://en.wikipedia.org/wiki/Decimal_mark"
 *      accessdate="2012/9/22 10:7">Decimal mark</a>
 */
gettext.numeral.decimal_mark = function(domain_name) {
	switch (domain_name || gettext_domain_name) {
	case 'cmn-Hant-TW':
		//return '點';

	//	TODO: others

	default:
		return '.';
	}
};
/**
 * thousands separator, 千位分隔符, 桁区切りの記号.
 * 
 * @param {String}[domain_name]
 *            設定當前使用之 domain name。
 * 
 * @returns {String} 指定/當前 domain 使用之 thousands separator。
 * 
 * @see <a
 *      href="http://en.wikipedia.org/wiki/Decimal_mark"
 *      accessdate="2012/9/22 10:7">Decimal mark</a>
 */
gettext.numeral.thousands_separator = function(domain_name) {
	switch (domain_name || gettext_domain_name) {
	case 'cmn-Hant-TW':
		//return '';

	//	TODO: others

	default:
		return ',';
	}
};


//	貨幣, 通貨.
gettext.currency = function(attribute, domain_name) {
	switch (domain_name || gettext_domain_name) {
	case 'cmn-Hant-TW':
		return to_TWD(attribute);

	case 'en-US':
		//	try: '-34235678908765456789098765423545.34678908765'
		var add_comma = function(v) {
			//	使用
			//	return v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
			//	可能會比較快，但小數也被置換了。
			return v.replace(/(\d+)(\d{3}(?:[.,]|$))/, function($0, $1, $2) {
				return add_comma($1) + ',' + $2;
			});
		};
		return add_comma('US$' + attribute);

	//	TODO: others

	default:
		return attribute;
	}
};

//------------------------------------

//工具函數。

function year_name(ordinal, domain_name) {
	switch (domain_name) {
	case 'Chinese':
		// number to Chinese year name.
		if (ordinal == 1)
			return '元';

		var prefix = '';
		if (ordinal < 0) {
			prefix = '前';
			ordinal = -ordinal;
		}
		return prefix
				//
				+ (ordinal > 99 ? to_positional_Chinese_numeral(ordinal)
				//
				: to_Chinese_numeral(ordinal));

	default:
		return ordinal;
	}
}

function month_name(ordinal, domain_name) {
	switch (domain_name) {
	case 'Chinese':
		// number to Chinese month name.
		// TODO: 冬月, 臘月.
		return typeof ordinal === 'string'
		//
		? ordinal.replace(/\d+/, function ($0) { return Chinese_month_name[$0]; })
		: Chinese_month_name[ordinal] || to_positional_Chinese_numeral(ordinal);

	default:
		return ordinal;
	}
}

function date_name(ordinal, domain_name) {
	switch (domain_name) {
	case 'Chinese':
		// number to Chinese date name.
		return Chinese_date_name[ordinal] || to_positional_Chinese_numeral(ordinal);

	default:
		return ordinal;
	}
}

var is_Date = library_namespace.is_Date,
//中文月名: Chinese_month_name[1]=正
Chinese_month_name = ['', '正'],
// 中文日名: Chinese_date_name[1]=初一
Chinese_date_name = [''],
Chinese_week_name = [];

// 初一, 初二, ..初十,十一..十九,二十,廿一,廿九,三十
(function () {
	var i = 2, date_name;
	while (i <= 12)
		Chinese_month_name.push(to_Chinese_numeral(i++));
	// 一般還是以"十一月"稱冬月。
	//Chinese_month_name[11] = '冬';
	//Chinese_month_name[12] = '臘';

	for (i = 1; i <= 30;) {
		date_name = to_Chinese_numeral(i++);
		if (date_name.length < 2)
			date_name = '初' + date_name;
		else if (date_name.length > 2)
			date_name = date_name.replace(/二十/, '廿');
		Chinese_date_name.push(date_name);
	}

	'日一二三四五六'.split('').forEach(function (name) {
		Chinese_week_name.push('星期' + name);
	});
})();

month_name.Chinese_month_name = Chinese_month_name;
date_name.Chinese_date_name = Chinese_date_name;


function week_name(ordinal, domain_name) {
	switch (domain_name) {
	case 'cmn-Hant-TW':
		// number to Chinese week name.
		// assert: ordinal: 0~6
		return Chinese_week_name[ordinal];

	default:
		return ordinal;
	}
}



//	日期
gettext.date = function(date, domain_name) {
	if (date && !is_Date(date) && date.to_Date)
		date = date.to_Date(domain_name);

	if (!date || !date.format)
		// warning
		return date;

	switch (domain_name) {
	case 'cmn-Hant-TW':
		// 中文日期
		return date.format('%Y年%m月%d日 %H時%M分%S秒', {
			locale : domain_name
		});
		// 19世紀80年代, 20世紀60年代

	default:
		return date;
	}
};

library_namespace.set_method(gettext.date, {
	year : year_name,
	month : month_name,
	date : date_name,
	week : week_name
});


//	時間
gettext.time = function(date, domain_name) {
	if (date && !is_Date(date) && date.to_Date)
		date = date.to_Date(domain_name);

	if (!date || !date.format)
		// warning
		return date;

	switch (domain_name) {
	case 'cmn-Hant-TW':
		// 中文時間
		return date.format('%H時%M分%S秒', {
			locale : domain_name
		});

	default:
		return date;
	}
};

//	日期+時間
gettext.datetime = function(date, domain_name) {
	if (date && !is_Date(date) && date.to_Date)
		date = date.to_Date(domain_name);

	if (!date || !date.format)
		// warning
		return date;

	switch (domain_name) {
	case 'cmn-Hant-TW':
		// 中文日期+時間
		return date.format('%Y年%m月%d日 %H時%M分%S秒', {
			locale : domain_name
		});

	default:
		return date;
	}
};


// Japanese numerals
function to_Japanese_numeral(number) {
	return to_Chinese_numeral(number).replace(/〇/g, '').replace(/萬/, '万');
}

//------------------------------------

//	{ format : function }
gettext.conversion = {
		//	中文數字 (Chinese numerals)
		數 : function (number) {
			return to_Chinese_numeral(number);
		},
		//	大陆简体中文数字。
		数 : function (number, locale) {
			return locale === 'ja-JP' ? to_Japanese_numeral(number)
			//
			: to_Chinese_numeral(number).replace(/萬/, '万');
		},
		//	日本語の漢数字。
		漢数 : to_Japanese_numeral,

		// 加成。e.g., 打六折、二成、二成七。
		成 : function (number) {
			number = to_Chinese_numeral((10 * number).to_fixed(1));
			if (number.indexOf('點') === NOT_FOUND)
				number += '成';
			else
				number = number.replace(/點/, '成');
			return number;
		},
		// e.g., 日本語 (Japanese): 2割5分
		// http://forum.wordreference.com/showthread.php?t=1292655
		// 1割: one tenth, 3割: three tenths
		// TODO: 割引: 5分引く (5% off), 1割引く (10% off), 1%割引
		割 : function (number) {
			number = to_Chinese_numeral((10 * number).to_fixed(1));
			if (number.indexOf('點') === NOT_FOUND)
				number += '割';
			else
				number = number.replace(/點/, '割') + '分';
			return number;
		},
		// 打折扣/discount。e.g., 打六折、打七二折、30% off（30﹪折扣，70% on sale）。
		// https://zh.wikipedia.org/wiki/%E6%8A%98%E6%89%A3
		// "% off" may use "⁒ off" 'COMMERCIAL MINUS SIGN' (U+2052).
		// commercial minus sign is used in commercial or tax related forms or publications in several European countries, including Germany and Scandinavia.
		折 : function (number) {
			number = (100 * number).to_fixed(0);
			// check
			if (number !== (number | 0)
			//
			|| number < 10 || 99 < number)
				throw '無法轉換 [' + number + ']！';
			number = to_positional_Chinese_numeral(number).replace(/(.)〇/, '$1');
			return number + '折';
		},

		// 基準利率 1碼 = 0.25% = 1 / 400，碼翻譯自 quarter。
		碼 : function (number) {
			return (400 * number) + '碼';
		},

		// https://en.wikipedia.org/wiki/Parts-per_notation
		// percentage (%), 百分比, ％（全形百分號）
		'％' : function (number) {
			return (100 * number).to_fixed() + '%';
		},
		// permille (‰), 千分率
		'‰' : function (number) {
			return (1000 * number).to_fixed() + '‰';
		},
		// permyriad (‱) (Basis point), 萬分率
		'‱' : function (number) {
			return (10000 * number).to_fixed() + '‱';
		},
		// ppm (parts-per-million, 10–6), ppb (parts-per-billion, 10–9), ppt (parts-per-trillion, 10–12) and ppq (parts-per-quadrillion, 10-15).

		d : gettext.date,
		t : gettext.time,
		T : gettext.datetime,
		n : gettext.numeral,
		c : gettext.currency
};


//------------------------------------
//	initialization

var gettext_DOM_id,
gettext_main_alias = library_namespace.null_Object(),
gettext_aliases = library_namespace.null_Object(),
gettext_texts = library_namespace.null_Object(),
gettext_domain_name,
// CeL.env.domain_location = 'resource/';
// CeL.gettext.use_domain_location('resource/');
gettext_location = library_namespace.env.domain_location,
gettext_resource = library_namespace.null_Object();


// TODO: lazy evaluation
//	http://www.rfc-editor.org/rfc/bcp/bcp47.txt

//	http://www.w3.org/International/articles/bcp47/

//	http://suika.fam.cx/~wakaba/wiki/sw/n/BCP%2047

//	http://www.iana.org/protocols
//	http://www.iana.org/assignments/language-subtag-registry/language-subtag-registry
//	http://www.iana.org/assignments/language-tag-extensions-registry

//	http://schneegans.de/lv/
gettext.set_alias({
	//	最推薦之標準 language tag : '主要別名 (e.g., 當地使用之語言名稱)|最常用之 language tag (e.g., IETF language tag)|其他別名 / other aliases (e.g., 英文名稱, 最細分之標準 language tag)'

	'arb-Arab' : 'العربية|ar|Arabic|阿拉伯語|ar-arb-Arab',

	//	http://www.iana.org/assignments/language-subtag-registry/language-subtag-registry
	//	Subtag: cmn, Preferred-Value: cmn
	'cmn-Hans-CN' : '简体中文|zh-CN|简体|zh-cmn-Hans-CN|CN|简化字|简化中文|簡化字|簡體中文|普通话|中国|Simplified Chinese|Mandarin Chinese',
	// 國語
	'cmn-Hant-TW' : '繁體中文|zh-TW|繁體|zh-cmn-Hant-TW|TW|Chinese|傳統中文|正體中文|正體|漢語|華語|中文|中國|臺灣|台灣|Traditional Chinese',
	// Min Nan Chinese. Macrolanguage: zh.
	// zh-min-nan: http://taigi-pahkho.wikia.com/wiki/%E9%A0%AD%E9%A0%81
	// using 臺灣閩南語推薦用字
	'nan-Hant-TW' : '臺灣閩南語|zh-min-nan|zh-min-nan-Hant-TW|臺語|台語|臺灣話|台灣話|閩南語|河洛話|福老話',

	//	Subtag: en, Suppress-Script: Latn
	//	"zh-Hant" and "zh-Hans" represent Chinese written in Traditional and Simplified scripts respectively, while the language subtag "en" has a "Suppress-Script" field in the registry indicating that most English texts are written in the Latin script, discouraging a tag such as "en-Latn-US".
	'en-US' : 'English|en-US|英語|en-eng-Latn-US|en-Latn-US|eng-Latn-US|US',

	//	Subtag: ja, Suppress-Script: Jpan
	'ja-JP' : '日本語|ja-JP|Japanese|日文|日語|国語|JP|ja-jpn-Jpan-JP|ja-Jpan-JP|jpn-Jpan-JP',

	//	Subtag: ko, Suppress-Script: Kore
	'ko-KR' : '한국어|ko-KR|Korean|韓國語|조선어|朝鮮語|조선말|고려말|韓文|韓語|ko-kor-Kore-KR|ko-Kore-KR|kor-Kore-KR|KR',

	//	Subtag: ru, Suppress-Script: Cyrl
	'ru-RU' : 'Русский|ru-RU|Russian|俄語|rus-Cyrl-RU|ru-rus-Cyrl-RU|RU'

});


// setup default/current domain. ユーザーロケール(言語と地域)の判定。
// 偏好的語言/優先言語
if (library_namespace.is_WWW()
		// http://stackoverflow.com/questions/1043339/javascript-for-detecting-browser-language-preference
		&& (gettext.default_domain = gettext.to_standard(navigator.userLanguage || navigator.language
		// IE 11
		|| navigator.browserLanguage || navigator.systemLanguage))) {
	// initialization 時，gettext 可能還沒 loaded。因此設在 post action。e.g., @ HTA.
	this.finish = function(name_space, waiting) {
		gettext.use_domain(gettext.default_domain,
				waiting, true);
		return waiting;
	};
}


_// JSDT:_module_
.
gettext = gettext;




return (
	_// JSDT:_module_
);
}


});

