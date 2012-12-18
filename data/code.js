
/**
 * @name	CeL function for source code.
 * @fileoverview
 * 本檔案包含了處理 source code/text 的 functions。
 * @since	
 */


'use strict';
if (typeof CeL === 'function')
CeL.run({name:'data.code',
code:function(library_namespace) {

//	nothing required


/**
 * null module constructor
 * @class	處理 source code 的 functions
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



/**
 * 類似 sprintf，處理 escape sequence 字串之 function.
 * 
 * @example <code>
 * CeL.set_run('data.code',function(){var e=CeL.parse_escape('00%M0\\\\\\\\\\%Mg\\a1\\n1\\s1\\a222',function(s){return s.replace(/%M/g,'_');});CeL.info(e.replace(/\n/g,'<br />'));CeL.assert(e==='00_0\\\\%Mga1\n1s1a222');});
 * </code>
 * 
 * @param {String}string
 *            欲格式化之字串 / source text.
 * @param {Object|String}option
 *            選擇性功能: {<br />
 *            {character}escape: escape character,<br />
 *            {Object}escape_length: escape sequence length,<br />
 *            {Function}handle: 處理 source text (非 escape sequence) 之 function,<br />
 *            {Function}escape_handle: 處理 escape sequence 之 function.<br /> }
 * 
 * @returns {Array} source text list:<br />
 *          [source text, escape sequence, source text, escape sequence, ..]
 */
function parse_escape(string, option) {
	var
	/**
	 * 搜索到 match 之部分
	 */
	match,
	/**
	 * 搜索之 pattern
	 */
	parse_RegExp,
	/**
	 * 下次檢索的起始點
	 */
	start_index = 0,
	/**
	 * <a href="http://en.wikipedia.org/wiki/Escape_character"
	 * accessdate="2012/3/24 11:16" title="Escape character">escape character</a>
	 * 
	 * @type {character}
	 */
	e_c = '\\',
	/**
	 * escape sequence length.<br />
	 * default: 1.<br />
	 * 為處理不定長 escape sequence. 這裡僅列出需要特別注意的。
	 * 
	 * @type {Object}
	 */
	e_l = {
		// TODO: [\d],
		u : 4,
		U : 8,
		x : 2
	},
	/**
	 * handle function.<br />
	 * 處理 source text (非 escape sequence) 之 function.
	 * 
	 * @type {Function}
	 */
	handle = undefined,
	/**
	 * Single Character Escape Sequences
	 * 
	 * @type {Object}
	 */
	s_c_e_s = {
		u : to_char,
		U : to_char,
		x : to_char,
		// '"' : '\"', "'" : "\'", '\\' : '\\',
		b : '\b',
		t : '\t',
		n : '\n',
		v : '\v',
		f : '\f',
		r : '\r'
	},
	/**
	 * escape sequence handle function.<br />
	 * 處理 escape sequence 之 function.
	 * 
	 * @type {Function}
	 */
	e_s_handle = function(s, a) {
		//library_namespace.debug(s + ': additional [' + a + '], ');
		if (s in s_c_e_s) {
			var f = s_c_e_s[s];
			s = typeof f === 'function' ? f(s, a) : f;
		}
		return s;
	},
	/**
	 * 回傳之 source text list:<br />
	 * [source text, escape sequence, source text, escape sequence, ..]
	 * 
	 * @type {Array}
	 */
	source_text_list = [];

	/**
	 * Unicode to character.
	 * 
	 * @param {character}c
	 *            escape sequence 的種類: x, u, U, ..
	 * @param {String}x
	 *            hexadecimal digits /[\da-f]/i
	 * 
	 * @returns {character} character
	 */
	function to_char(c, x) {
		//library_namespace.debug('U+' + x + ': [' + String.fromCharCode(parseInt(x, 16)) + ']');
		return String.fromCharCode(parseInt(x, 16));
	}

	/**
	 * 處理 match 之部分:<br />
	 * [source text, escape sequence]
	 * 
	 * @param {String}s
	 *            source text
	 * @param {String}e_s
	 *            escape sequence
	 */
	function handle_slice(s, e_s) {
		//library_namespace.debug(start_index + ': [' + s + ']<em>|</em>' + (e_s || ''));
		if (s && handle)
			s = handle(s);
		if (e_s) {
			var l, e = '';
			if (e_s in e_l) {
				e = string.substr(start_index, l = e_l[e_s]);
				//library_namespace.debug('(' + l + ') [' + e_s + e + ']');
				parse_RegExp.lastIndex = (start_index += l);
			}
			if (e_s_handle)
				e_s = e_s_handle(e_s, e);
			else if (e !== '')
				e_s += e;
			source_text_list.push(s, e_s);
		} else if (s)
			source_text_list.push(s);
	}

	if (typeof option === 'string')
		e_c = option;
	else if (typeof option === 'function')
		handle = option;
	else if (library_namespace.is_Object(option)) {
		if (option.escape)
			e_c = option.escape;
		if (option.escape_length)
			e_l = option.escape_length;
		if (option.handle)
			handle = option.handle;
		if (option.escape_handle)
			e_s_handle = option.escape_handle;
	}

	parse_RegExp = new RegExp('((.|\n)*?)\\' + e_c + '(.)', 'g');

	//library_namespace.debug('[' + string + ']');
	while (match = parse_RegExp.exec(string)) {
		start_index = parse_RegExp.lastIndex;
		handle_slice(match[1], match[3]);
	}
	handle_slice(string.slice(start_index));

	return handle ? source_text_list.join('') : source_text_list;
};


_// JSDT:_module_
.
parse_escape = parse_escape;


//----------------------------------------------------------------------------------------------------------------------------------------------------------//
//TODO

//	format (escape sequence / conversion specifications) parser
//	functional keyword,
function format_parser(escape_character, command_set, option) {
	if (typeof escape_character !== 'string' || !escape_character
			|| !library_namespace.is_Object(command_set))
		return;

	function get_pattern() {
		var pattern = [];
		for ( var i in command_set) {
			pattern.push(command_set[i] && command_set[i].pattern || i);
		}
		return pattern.join('|');
	}

	var search;
	if (option) {
		if (!library_namespace.is_Object(this.option = option))
			option = {
					search : option
			};
		search = option.search;
	} else
		this.option = false;

	if (!search) {
		// RegExp punctuators, reserved words
		escape_character = escape_character.replace(/([!?:.*+-^${}()\\\-\[\]])/g, '\\$1');
		search = new RegExp('((?:[^' + escape_character + ']+|'
				+ escape_character + '{2})+)(' + escape_character + ')('
				+ get_pattern() + ')', 'g');
	} else if (!library_namespace.is_type(search, 'RegExp')) {
		search = new RegExp(('' + search).replace(/pattern/g, get_pattern()), 'g');
	}

	this.search = search;
	return format_parser.default_parser.bind(this);
}

//	parser|parser array
format_parser.default_parser = function(object, format, usage) {
	var search = this.search, command_set = this.command_set, option = this.option,
	// 處理整段 match 的函數。
	parse_match = option.parser,
	// 處理一般字串的函數。
	normal_parser = option.normal_parser,
	// main-loop 所需。
	match, last_index = 0, command, result = [];

	// 為了 g 初始化. 或者設定 .lastIndex = 0 ?
	search.exec('');
	while (match = search.exec(format)) {
		last_index = search.lastIndex;
		if (parse_match)
			result.push(parse_match.call(this, object, match, usage));
		else {
			// match = [matched slice (normal + escape sequence), normal, escape character, format pattern, format command];
			// 處理一般字串。
			result.push(normal_parser ? normal_parser(object, match[1], usage)
					: match[1]);
			// 處理一般 format。
			command = match[4] || match[3];
			result.push(command in command_set ? command_set[command].call(
					object, match[3]) : match[2] + match[3]);
		}
	}
	// 加入最後一段。
	match = format.slice(last_index);
	result.push(normal_parser ? normal_parser(object, match, usage) : match);

	return result.join('');
};
format_parser.default_parser.constructor = format_parser;

format_parser.prototype.concat = function(parser) {
	//	TODO
	throw new Error(1, 'format_parser.prototype.concat: Not Yet Implemented!');
};

format_parser.prototype.extend = function() {
	var new_parser = new format_parser(this);
};


function hex_to_Unicode() {
	//	TODO
	throw new Error(1, 'hex_to_Unicode: Not Yet Implemented!');
}

if (0) {
//	backslash escape sequence parser
var backslash_parser = new format_parser('\\', {
		u : {pattern : /[\da-z]{4}/i ,handle : hex_to_Unicode},
		U : {pattern : /[\da-z]{8}/i, handle : hex_to_Unicode},
		x : {pattern : /[\da-z]{2}/i, handle : hex_to_Unicode},
		// '"' : '\"', "'" : "\'", '\\' : '\\',
		b : '\b',
		t : '\t',
		n : '\n',
		v : '\v',
		f : '\f',
		r : '\r'
});


//	sprintf-like format parser. % conversion specifications
var sprintf = new format_parser('%', {
		// 數字
		d : function() {
			return parseInt(this.valueOf());
		},
		s : function() {
			return String(this.valueOf());
		}
}, {
	//	replace '[.]'
	search : /%([+\-]?)(\d{0,3})(?:\.(\d{1,2}))([.])/,
	//	pre-parser
	normal_parser : backslash_parser
});

var extend_sprintf = sprintf.extend('%', {
	// 數字
	z : function() {
	}

}, {
	//	replace '[.]'
	search : /%([+\-]?)(\d{0,3})(?:\.(\d{1,2}))([.])/
});

}

function set_toString(Class, format_parser, special_condition) {
	if (!Class || typeof format_parser !== 'function')
		return;

	// 以指定 format 轉換 Class 之內容成 string。
	var old_toString = Class.prototype.toString;
	Class.prototype.toString = function(format, /* 用途：i18n|不同領域、不同產業採用不同 format */
			usage) {
		if (!argument.length)
			return old_toString.call(this);
		if (typeof format === 'number' && special_condition)
			format = typeof special_condition === 'object' ? special_condition[format]
					: typeof special_condition === 'function' ? special_condition(format)
							: format;
		return format_parser.call(this, format, usage);
	};
	return old_toString;
}


if (0) {

set_toString(Date, backslash_parser.extend('%', {
	// 完整年份(四位數的數字，如2000)
	Y : function() {
		return this.getFullYear();
	},
	// 月份 (1-12)。
	m : function() {
		return 1 + this.getMonth();
	}

},	{
	search : /%([+\-]?)(\d{0,3})(?:\.(\d{1,2}))([.])/
}));


set_toString(Number);
set_toString(library_namespace.quotient, backslash_parser.extend('%', {
	// numerator
	n : function() {
		return this.n;
	},
	//	denominator
	d : function() {
		return this.d;
	}
}, {
	search : /%([+\-]?)(\d{0,3})(?:\.(\d{1,2}))([.])/
}));


}

//----------------------------------------------------------------------------------------------------------------------------------------------------------//


return (
	_// JSDT:_module_
);
}


});

