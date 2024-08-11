/**
 * @name CeL function for native (built-in) objects.
 * @fileoverview 本檔案包含了 native objects 的擴充功能。
 * 
 * http://www.hunlock.com/blogs/Ten_Javascript_Tools_Everyone_Should_Have
 * 
 * @see https://github.com/andrewplummer/Sugar
 * @since
 */

'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

typeof CeL === 'function' && CeL.run({
	// module name
	name : 'data.native',

	// require : '',

	// 設定不匯出的子函式。
	// no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	var
	/** {Number}未發現之index。 const: 基本上與程式碼設計合一，僅表示名義，不可更改。(=== -1) */
	NOT_FOUND = ''.indexOf('_');

	/**
	 * null module constructor
	 * 
	 * @class native objects 的 functions
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

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

	// cache
	var set_method = library_namespace.set_method,
	// https://en.wikipedia.org/wiki/Unicode_subscripts_and_superscripts
	SUPERSCRIPT_NUMBER = superscript_integer.map = (superscript_integer.digits = '⁰¹²³⁴⁵⁶⁷⁸⁹')
			.split(''),
	//
	SUBSCRIPT_NUMBER = subscript_integer.map = (subscript_integer.digits = '₀₁₂₃₄₅₆₇₈₉')
			.split('');

	SUPERSCRIPT_NUMBER['+'] = '⁺';
	SUPERSCRIPT_NUMBER['-'] = '⁻';
	SUBSCRIPT_NUMBER['+'] = '₊';
	SUBSCRIPT_NUMBER['-'] = '₋';

	function superscript_integer() {
		var v = [];
		this.digits().forEach(function(i) {
			v.push(SUPERSCRIPT_NUMBER[i]);
		});
		return v.join('');
	}

	function subscript_integer() {
		var v = [];
		this.digits().forEach(function(i) {
			v.push(SUBSCRIPT_NUMBER[i]);
		});
		return v.join('');
	}

	/**
	 * padding / fill. 將 string 以 character 補滿至長 length。
	 * 
	 * @see Number.prototype.toLocaleString()
	 *      https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString
	 * 
	 * TODO: 效能測試:與 "return n > 9 ? n : '0' + n;" 相較。
	 * 
	 * @example <code>

	 // More examples: see /_test suite/test.js

	 * </code>
	 * 
	 * @param {String}string
	 *            基底 string。
	 * @param {Integer}length
	 *            補滿至長 length (maxLength)。
	 * @param {String}fillString
	 *            以 fillString 補滿。
	 * @param {Boolean}from_start
	 *            補滿方向。基本為 5 → ' 5'，設定 from_start 時，為 5 → '5 '。
	 * 
	 * @since 2012/3/25 19:46:42
	 * 
	 * @returns {String} padding 過後之 string
	 */
	function pad(string, length, fillString, from_start) {
		// 為負數作特殊處理。
		// e.g., pad(-9, 3) === '-09'
		if (typeof string === 'number' && string < 0
		//
		&& !from_start && (!fillString || fillString === 0))
			return '-' + pad(-string, length - 1, '0');

		string = String(string);

		// 差距。
		var gap = length - string.length;
		if (gap > 0) {
			// library_namespace.debug(gap + ' [' + fillString + ']');
			if (!fillString || typeof fillString !== 'string') {
				fillString = typeof fillString === 'number' ? String(fillString)
						: string === '' || isNaN(string) ? ' ' : '0';
			}
			// assert: {String}fillString

			var l = fillString.length,
			/**
			 * TODO: binary extend.<br />
			 * .join() is too slow.
			 */
			fill = new Array(l > 1 ? Math.ceil(gap / l) : gap);
			// library_namespace.debug('fill.length = ' + fill.length);

			if (from_start) {
				fill[0] = string;
				fill.length++;
				string = fill.join(fillString);
				if (string.length > length)
					string = string.slice(0, length);
			} else if (l > 1) {
				fill.length++;
				string = fill.join(fillString).slice(0, gap) + string;
			} else {
				fill.push(string);
				string = fill.join(fillString);
			}
		}
		return string;
	}

	_.pad = pad;

	/**
	 * <code>
	function經ScriptEngine會轉成/取用'function'開始到'}'為止的字串

	用[var thisFuncName=parse_function().funcName]可得本身之函數名
	if(_detect_)alert('double run '+parse_function().funcName+'() by '+parse_function(arguments.callee.caller).funcName+'()!');

	You may use this.constructor


	TODO:
	to call: parse_function(this,arguments)
	e.g., parent_func.child_func=function(){var name=parse_function(this,arguments);}

	bug:
	函數定義 .toString() 時無法使用。
	</code>
	 */

	_// JSDT:_module_
	.
	/**
	 * 函數的文字解譯/取得函數的語法
	 * 
	 * @param {Function|String}
	 *            function_name function name or function structure
	 * @param flags
	 *            =1: reduce
	 * @return
	 * @example parsed_data = new parse_function(function_name);
	 * @see http://www.interq.or.jp/student/exeal/dss/ref/jscript/object/function.html,
	 *      Syntax error:
	 *      http://msdn.microsoft.com/library/en-us/script56/html/js56jserrsyntaxerror.asp
	 * @_memberOf _module_
	 * @since 2010/5/16 23:04:54
	 */
	parse_function = function parse_function(function_name, flags) {
		if (!function_name)
			try {
				function_name = parse_function.caller;
				if (typeof function_name !== 'function')
					return;
			} catch (e) {
				return;
			}
		if (typeof function_name === 'string'
				&& !(function_name = library_namespace
						.get_various(function_name)))
			return;

		var fs = String(function_name), m = fs
				.match(library_namespace.PATTERN_function);
		library_namespace.debug(typeof function_name + '\n' + fs + '\n' + m, 6);

		// detect error, 包含引數
		// 原先：functionRegExp=/^\s*function\s+(\w+) ..
		// 因為有function(~){~}這種的，所以改變。
		if (!m) {
			// JScript5 不能用 throw!
			// http://www.oldversion.com/Internet-Explorer.html
			// Syntax error!
			// gettext_config:{"id":"syntax-error"}
			throw new Error(1002, '語法錯誤！');
		}

		if (function_name != m[1]) {
			// Function name unmatched.
			library_namespace.warn({
				// gettext_config:{"id":"function-name-unmatched"}
				T : '函數名稱不相符，可能是用了 reference？'
			});
		}

		library_namespace.debug('function ' + m[1] + '(' + m[2] + '){\n' + m[3]
				+ '\n}', 9);

		return {
			string : fs,
			name : m[1],
			// 去除前後空白
			arguments : m[2].replace(/[\s\n]+/g, '').split(','),
			code : m[3]
		};
	};

	// 補強 String.fromCharCode()
	function fromCharCode(c) {
		if (!isNaN(c))
			return String.fromCharCode(c);
		try {
			// 直接最快
			return eval('String.fromCharCode(' + c + ');');
		} catch (e) {
		}

		// comments
		if (typeof c == 'string') {
			// c=c.split(','); 後者可以通過審查
			return eval('String.fromCharCode(' + n + ')');
		}
		if (typeof c == 'object') {
			var t = '', d, i, a, n = [];
			if (c.length)
				a = c;
			else {
				a = [];
				for (i in c)
					a.push(c[i]);
			}
			for (i = 0; i < a.length; i++)
				if (!isNaN(c = a[i]) || !isNaN(c = ('' + a[i]).charCodeAt(0)))
					// 跳過無法判讀的值
					n.push(c);
			// n.join(',') 這樣較快
			return eval('String.fromCharCode(' + n + ')');
		}
	}

	_// JSDT:_module_
	.
	/**
	 * ASCII_code_at, 對付有時 charCodeAt 會傳回 >256 的數值。 若確定編碼是 ASCII (char code 是
	 * 0~255) 即可使用此函數替代 charCodeAt。
	 * 
	 * @param text
	 *            string
	 * @param position
	 *            at what position
	 * @return
	 * @since 2008/8/2 10:10:49
	 * @see http://www.alanwood.net/demos/charsetdiffs.html
	 * @_memberOf _module_
	 */
	toASCIIcode = function(text, position) {
		var _f = arguments.callee, c;

		if (!_f.t) {
			// initialize
			var i = 129, t = _f.t = [], l = {
				8364 : 128,
				8218 : 130,
				402 : 131,
				8222 : 132,
				8230 : 133,
				8224 : 134,
				8225 : 135,
				710 : 136,
				8240 : 137,
				352 : 138,
				8249 : 139,
				338 : 140,
				381 : 142,
				8216 : 145,
				8217 : 146,
				8220 : 147,
				8221 : 148,
				8226 : 149,
				8211 : 150,
				8212 : 151,
				732 : 152,
				8482 : 153,
				353 : 154,
				8250 : 155,
				339 : 156,
				382 : 158,
				376 : 159
			};
			for (; i < 256; i += 2)
				t[i] = i;
			for (i in l) {
				library_namespace.debug(i + ' = ' + l[i], 6);
				t[i | 0] = l[i];
			}
		}

		if (position < 0 && !isNaN(text))
			c = text;
		else
			c = text.charCodeAt(position || 0);

		return c < 128 ? c : (_f.t[c] || c);
	};

	/**
	 * <code>	2008/8/2 9:9:16
	encodeURI, encodeURIComponent 僅能編成 utf-8，對於其他 local 編碼可使用本函數。

	e.g.,
	f.src='http://www.map.com.tw/search_engine/searchBar.asp?search_class=address&SearchWord='+encodeUC(q[0],'big5')


	perl
	#use Encode qw(from_to);
	use Encode;

	my $tEnc='utf-8';

	$t="金";

	$t=Encode::decode($t,'big5');

	Encode::from_to($t,$lEnc,$outEnc);

	Encode::from_to

	@b=split(//,$a);

	for($i=0;$i<scalar(@b);$i++){
	$r.=sprintf('%%%X',ord($b[$i]));
	};


	</code>
	 */
	// encodeUC[generateCode.dLK]='toASCIIcode';
	function encodeUC(u, enc) {
		if (!enc || enc == 'utf8')
			return encodeURI(u);

		var i = 0, c = new ActiveXObject("ADODB.Stream"), r = [];
		// adTypeText;
		c.Type = 2;
		c.Charset = enc;
		c.Open();
		c.WriteText(u);
		c.Position = 0;
		c.Charset = 'iso-8859-1';
		u = c.ReadText();
		c.Close();

		for (; i < u.length; i++)
			r.push((c = u.charCodeAt(i)) < 0x80 ? u.charAt(i) : '%'
					+ toASCIIcode(c, -1).toString(0x10).toUpperCase());

		return r.join('').replace(/ /g, '+');
	}

	/**
	 * String pattern (e.g., "/a+/g") to RegExp pattern.<br />
	 * escape RegExp pattern，以利作為 RegExp source 使用。<br />
	 * cf. qq// in perl.
	 * 
	 * <code>
	 * String.prototype.to_RegExp_pattern = function(f) { return to_RegExp_pattern(this.valueOf(), f); };
	 * </code>
	 * 
	 * @param {String}pattern
	 *            pattern text.
	 * @param {RegExp}[escape_pattern]
	 *            char pattern need to escape.
	 * @param {Boolean|String}[RegExp_flags]
	 *            flags when need to return RegExp object.
	 * 
	 * @return {String|RegExp} escaped RegExp pattern or RegExp object.
	 */
	function to_RegExp_pattern(pattern, escape_pattern, RegExp_flags) {
		pattern = pattern
		// 不能用 $0。
		.replace(escape_pattern || /([.*?+^$|()\[\]\\{}])/g, '\\$1')
		// 這種方法不完全，例如對 /^\s+|\s+$/g
		.replace(/^([\^])/, '\\^').replace(/(\$)$/, '\\$');

		return RegExp_flags === undefined ? pattern : new RegExp(pattern,
				_.PATTERN_RegExp_flags.test(RegExp_flags) ? RegExp_flags : '');
	}
	_// JSDT:_module_
	.to_RegExp_pattern = to_RegExp_pattern;

	// CeL.ignore_first_char_case('abc') === '[Aa]bc'
	function ignore_first_char_case(pattern) {
		// pattern 無特殊字元！否則應該出警告。
		var lower_case = pattern.charAt(0),
		//
		upper_case = lower_case.toUpperCase();
		if (upper_case !== lower_case
		//
		|| upper_case !== (lower_case = upper_case.toLowerCase()))
			pattern = '[' + upper_case + lower_case + ']' + pattern.slice(1);
		return pattern;
	}
	_// JSDT:_module_
	.ignore_first_char_case = ignore_first_char_case;

	// CeL.ignore_case_pattern('abc') === '[Aa][Bb][Cc]'
	function ignore_case_pattern(pattern, only_first_char) {
		pattern = pattern.split('');
		// pattern 無特殊字元！否則應該出警告。
		pattern.forEach(function(lower_case, index) {
			var upper_case = lower_case.toUpperCase();
			if (upper_case !== lower_case
			//
			|| upper_case !== (lower_case = upper_case.toLowerCase()))
				pattern[index] = '[' + upper_case + lower_case + ']';
		})
		return pattern.join('');
	}
	_// JSDT:_module_
	.ignore_case_pattern = ignore_case_pattern;

	// pattern.replace(string)
	// 警告: 必須自行檢查 string! 否則會出現 pattern.replace(undefined) === 'undefined'
	function pattern_replace(string) {
		// assert: {RegExp}this pattern
		// assert: pattern has .replace_to
		return String(string).replace(this, this.replace_to);
	}

	if (false) {
		pattern = '/move from/g'.to_RegExp();
		pattern = '/move from/replace to/g'.to_RegExp({
			allow_replacement : true
		});
		pattern.replace('*move from*') === '*replace to*';
	}

	/**
	 * 將 String pattern (e.g., "/a+/g") 轉成 RegExp。<br />
	 * TODO:<br />
	 * and, or, not.<br />
	 * (?:(^|\s*\|)\s*(!)?(\/(?:[^\/]+|\\\/)(\/([a-z]*))?|\\(\S+)|\S+))+<br />
	 * {Object|Array}preprocessor<br />
	 * 
	 * cf. CeL.to_RegExp_pattern()
	 * 
	 * @param {String}pattern
	 *            欲轉換成 RegExp 的 pattern text。
	 * @param {Object}[options]
	 *            附加參數/設定特殊功能與選項 options = {<br />
	 *            {String}flags : RegExp 的 flags。<br />
	 *            {Function|String}error_handler : 當遇到不明 pattern 時的處理程序。<br /> }
	 * 
	 * @returns {RegExp} RegExp object。
	 * 
	 * @since 2012/10/13 10:22:20
	 */
	function String_to_RegExp(pattern, options) {
		// 前置作業。
		if (typeof options === 'string' && _.PATTERN_RegExp_flags.test(options)) {
			options = {
				flags : options
			};
		} else if (typeof options === 'function') {
			options = {
				error_handler : options
			};
		} else {
			options = library_namespace.setup_options(options);
		}

		if (typeof pattern === 'string') {
			if (typeof String_to_RegExp.preprocessor === 'function')
				pattern = String_to_RegExp.preprocessor(pattern);

			if (typeof pattern === 'string' && pattern.length > 1)
				// pattern.trim()
				if (pattern.charAt(0) === '/') {
					library_namespace.debug({
						// gettext_config:{"id":"treat-$1-as-regexp"}
						T : [ 'Treat [%1] as RegExp.', pattern ]
					}, 3, 'String_to_RegExp');
					var matched = pattern.match(_.PATTERN_RegExp), replace_to;
					if (!matched && options.allow_replacement
					//
					&& (matched = pattern.match(_.PATTERN_RegExp_replacement))) {
						replace_to = matched[2];
						// matched[2] = matched[3];
						matched.splice(2, 1);
					}
					// 設定 flags。
					var flags = _.PATTERN_RegExp_flags.test(options.flags)
							&& options.flags
							|| (matched ? matched[2]
									: String_to_RegExp.default_flags);

					try {
						try {
							pattern = new RegExp(matched ? matched[1] : pattern
									.slice(1), flags);
						} catch (e) {
							try {
								if (matched) {
									// 設定絕對可接受的 flags，或完全不設定。
									pattern = new RegExp(matched[1]);
									library_namespace.warn([
									//
									'String_to_RegExp: ', {
										// gettext_config:{"id":"invalid-flags-$1"}
										T : [ 'Invalid flags: [%1]', flags ]
									} ]);
								} else
									throw true;
							} catch (e) {
								library_namespace.warn([
								// Illegal pattern: /%1/
								'String_to_RegExp: ', {
									// gettext_config:{"id":"illegal-pattern-$1"}
									T : [ 'Illegal pattern: [%1]', matched[1] ]
								} ]);
							}
						}
					} catch (e) {
						library_namespace.debug({
							// gettext_config:{"id":"conversion-mode-$1-error-invalid-regexp?-$2"}
							T : [ '轉換模式 [%1] 出錯：並非 RegExp？ %2', pattern,
									e.message ]
						}, 2, 'String_to_RegExp');
					}

					if (replace_to) {
						pattern.replace_to = replace_to;
						if (false) {
							pattern.replace = function replace(string) {
								return string.replace(pattern, replace_to);
							};
						}
						pattern.replace = pattern_replace;
					}

				} else if (pattern.charAt(0) === '\\'
						&& typeof library_namespace.wildcard_to_RegExp === 'function') {
					library_namespace.debug({
						T : [
						// gettext_config:{"id":"treat-pattern-$1-as-windows-wildcard-search-string"}
						'Treat pattern [%1] as Windows wildcard search string.'
						//
						, pattern ]
					}, 3, 'String_to_RegExp');
					pattern = new RegExp(library_namespace
							.wildcard_to_RegExp(pattern));
				}

			if (typeof pattern === 'string')
				try {
					pattern = typeof options.error_handler === 'function'
					// default unknown handler.
					? options.error_handler(pattern) : new RegExp(pattern
					// .replace(/,/g, '|')
					);
				} catch (e) {
					library_namespace.debug({
						// gettext_config:{"id":"unable-to-convert-mode-$1"}
						T : [ '無法轉換模式 [%1]！', pattern ]
					}, 3, 'String_to_RegExp');
				}
		}

		return pattern;
	}

	String_to_RegExp.default_flags = 'i';

	// 前置處理。
	String_to_RegExp.preprocessor = function(pattern) {
		var m;
		if (pattern.length < 800
				&& (m = pattern
						.match(/^／((?:＼／|[^\\\/|?*":<>／\0-\x1f]+)+)／([a-z]*)(?:\.[^.]+)?$/)))
			try {
				/**
				 * @see application.net.to_file_name()
				 */
				library_namespace.debug('因為 pattern [' + pattern
						+ '] 以 "／" 起首，可能是以 directory name / file name'
						+ ' 充當 pattern，嘗試將之還原為 regular pattern。', 2,
						'String_to_RegExp.preprocessor');

				pattern = new RegExp(m[1]
				// functional characters
				.replace(/＼/g, '\\').replace(/／/g, '/').replace(/｜/g, '|')
				//
				.replace(/？/g, '?').replace(/＊/g, '*')
				//
				.replace(/((?:^|[^\\])(?:\\\\)*)\\([\\\/|?*])/g,
				//
				function($0, $1, $2) {
					return $1 + '[\\$2' + {
						'\\' : '＼',
						'/' : '／',
						'|' : '｜',
						'?' : '？',
						'*' : '＊'
					}[$2] + ']';
				})

				// normal characters
				.replace(/＂/g, '["＂]').replace(/：/g, '[:：]').replace(/＜/g,
						'[<＜]').replace(/＞/g, '[>＞]')

				// control characters
				.replace(/_/g, '[_\\r\\n\\t\\f\\v]'), m[2]);

			} catch (e) {
			}

		return pattern;
	};

	/**
	 * 將 string 轉成 search pattern，並回傳是否 matched。
	 * 
	 * @param {String}pattern
	 *            欲轉換成 RegExp 的 pattern。
	 * @param {String}[text]
	 *            欲測試的 text。
	 * @param {Function}[unknown_handler]
	 *            當遇到不明 pattern 時的處理程序。
	 * @returns 是否 matched。
	 * 
	 * @since 2012/10/13 10:22:20
	 * 
	 * @see CeL.data.fit_filter()
	 */
	function is_matched(pattern, text, unknown_handler) {
		pattern = String_to_RegExp(pattern, unknown_handler);

		if (typeof text !== 'string')
			if (typeof text === 'undefined' || text === null)
				return pattern;
			else
				text = String(text);

		return library_namespace.is_RegExp(pattern) ? text.match(pattern)
				: text.indexOf(String(pattern)) !== NOT_FOUND;
	}

	_.is_matched = is_matched;

	var RegExp_flags = /./g.flags === 'g'
	// get RegExp.prototype.flags
	? function(regexp) {
		return regexp.flags;
	} : function(regexp) {
		// regexp = RegExp.prototype.toString.call(regexp);
		// return ('' + regexp).match(/[^\/]*$/)[0];
		regexp = '' + regexp;
		return regexp.slice(regexp.lastIndexOf('/') + 1);

		var flags = [];
		for ( var flag in RegExp_flags.flags)
			if (regexp[flag])
				flags.push(RegExp_flags.flags[flag]);
		return flags.join('');
	};

	library_namespace.RegExp_flags = RegExp_flags;

	// RegExp.prototype.flags
	// 注意: 本 shim 實際上應放置於 data.code.compatibility。惟其可能會被省略執行，因此放置於此。
	if (!('flags' in RegExp.prototype)
	//
	&& !Object.defineProperty[library_namespace.env.not_native_keyword])
		Object.defineProperty(RegExp.prototype, 'flags', {
			get : function() {
				return RegExp_flags(this);
			}
		});

	// https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/flags
	RegExp_flags.flags = {
		// Proposed for ES6
		// extended : 'x',
		global : 'g',
		ignoreCase : 'i',
		multiline : 'm',
		dotAll : 's',
		unicode : 'u',
		sticky : 'y',
		// https://github.com/tc39/proposal-regexp-match-indices
		indices : 'd'
	};

	if (Object.values) {
		_.PATTERN_RegExp_flags = Object.values(RegExp_flags.flags);
	} else {
		// e.g., @ WSH (Windows Script Host)
		_.PATTERN_RegExp_flags = [];
		(function() {
			for ( var flag in RegExp_flags.flags)
				_.PATTERN_RegExp_flags.push(RegExp_flags.flags[flag]);
		})();
	}
	// TODO: flags 只能出現一次!
	_.PATTERN_RegExp_flags = _.PATTERN_RegExp_flags.join('');
	// CeL.PATTERN_RegExp
	// [ all, pattern source, flags ]
	_.PATTERN_RegExp = new RegExp(
	// /^\/(.+)\/([iugms]*)$/
	// /^\/((?:\\[\s\S]|[^\/])+)\/([gimsuy]*)$/
	/^\/((?:\\[\s\S]|[^\/])+)\/([flags]*)$/.source.replace('flags',
			_.PATTERN_RegExp_flags));

	// CeL.PATTERN_RegExp_replacement
	// e.g., '/只/隻/i'
	_.PATTERN_RegExp_replacement = new RegExp(
	// [ all, pattern source, replace to, flags ]
	/^\/((?:\\[\s\S]|[^\/])+)\/((?:\\[\s\S]|[^\/])*)\/([flags]*)$/.source
			.replace('flags', _.PATTERN_RegExp_flags));

	// CeL.PATTERN_RegExp_flags
	_.PATTERN_RegExp_flags = new RegExp(/^[flags]+$/.source.replace('flags',
			_.PATTERN_RegExp_flags));

	/**
	 * <code>

	use (new RegExp(regexp.source, flags)) instead.
	or even (new RegExp(regexp, flags)):
	RexExp constructor no longer throws when the first argument is a RegExp and the second argument is present. Instead it creates a new RegExp using the same patterns as the first arguments and the flags supplied by the second argument.

	</code>
	 */

	/**
	 * 重新設定 RegExp object 之 flags. change the flags of a RegExp instances.
	 * 
	 * @param {RegExp}regexp
	 *            RegExp object to set
	 * @param {String}flags
	 *            flags of RegExp
	 * @return {RegExp}
	 * @example <code>

	// 附帶 'g' flag 的 RegExp 對相同字串作 .test() 時，第二次並不會重設。
	// 因此像下面的 expression 兩次並不會得到相同結果。
	var r = /,/g, t = 'a,b';
	WScript.Echo(r.test(t) + ',' + r.test(t));

	// 改成這樣就可以了：
	var r = /,/g, t = 'a,b', s = renew_RegExp_flags(r, '-g');
	WScript.Echo(s.test(t) + ',' + s.test(t));

	// 這倒沒問題：
	r = /,/g, a = 'a,b';
	if (r.test(a))
		library_namespace.debug(a.replace(r, '_'));

	// delete r.lastIndex; 無效，得用 r.lastIndex = 0; 因此下面的亦可：
	if (r.global)
		r.lastIndex = 0;
	if (r.test(a)) {
		// ...
	}

	</code>
	 * 
	 * @see http://msdn.microsoft.com/zh-tw/library/x9h97e00(VS.80).aspx,
	 *      如果規則運算式已經設定了全域旗標，test 將會從 lastIndex 值表示的位置開始搜尋字串。如果未設定全域旗標，則 test
	 *      會略過 lastIndex 值，並從字串之首開始搜尋。
	 *      http://www.aptana.com/reference/html/api/RegExp.html
	 * @_memberOf _module_
	 */
	function renew_RegExp_flags(regexp, flags) {
		// 未指定 flags: get flags
		if (!flags) {
			flags = '';
			for ( var i in RegExp_flags.flags)
				if (regexp[i])
					flags += RegExp_flags.flags[i];
			return flags;
		}

		var a = flags.charAt(0), F = '', m;
		a = a === '+' ? 1 : a === '-' ? 0 : (F = 1);

		if (F) {
			// 無 [+\-]
			F = flags;
		} else {
			// f: [+\-]~ 的情況，parse flags
			for ( var i in RegExp_flags.flags)
				if ((m = flags.indexOf(RegExp_flags.flags[i], 1) !== NOT_FOUND)
						&& a || !m && regexp[i])
					F += RegExp_flags.flags[i];
		}

		// for JScript<=5
		try {
			return new RegExp(regexp.source, F);
		} catch (e) {
			// TODO: handle exception
		}
	}

	_// JSDT:_module_
	.renew_RegExp_flags = renew_RegExp_flags;

	// ---------------------------------------------------------------------//

	// Unicode category

	// 使用例之說明：
	// @see CeL.data.native for Unicode category (e.g., \p{Cf})

	if (false) {
		var
		/**
		 * 振り仮名 / 読み仮名 の正規表現。
		 * 
		 * @type {RegExp}
		 * @see [[d:Property:P1814|假名]]
		 */
		PATTERN_読み仮名 = CeL.RegExp(/^[\p{Hiragana}\p{Katakana}ー・ 　]+$/, 'u');
	}

	// https://github.com/slevithan/xregexp/blob/master/tools/output/categories.js
	// http://stackoverflow.com/questions/11598786/how-to-replace-non-printable-unicode-characters-javascript
	var Unicode_category = {
		// Control
		Cc : '\0-\x1F\x7F-\x9F',
		// Format
		Cf : '\xAD\u0600-\u0605\u061C\u06DD\u070F\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB',
		// Unassigned
		Cn : '\u0378\u0379\u0380-\u0383\u038B\u038D\u03A2\u0530\u0557\u0558\u0560\u0588\u058B\u058C\u0590\u05C8-\u05CF\u05EB-\u05EF\u05F5-\u05FF\u061D\u070E\u074B\u074C\u07B2-\u07BF\u07FB-\u07FF\u082E\u082F\u083F\u085C\u085D\u085F-\u089F\u08B5-\u08E2\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09FC-\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF2-\u0AF8\u0AFA-\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B55\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B78-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0BFF\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5B-\u0C5F\u0C64\u0C65\u0C70-\u0C77\u0C80\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0D00\u0D04\u0D0D\u0D11\u0D3B\u0D3C\u0D45\u0D49\u0D4F-\u0D56\u0D58-\u0D5E\u0D64\u0D65\u0D76-\u0D78\u0D80\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DE5\u0DF0\u0DF1\u0DF5-\u0E00\u0E3B-\u0E3E\u0E5C-\u0E80\u0E83\u0E85\u0E86\u0E89\u0E8B\u0E8C\u0E8E-\u0E93\u0E98\u0EA0\u0EA4\u0EA6\u0EA8\u0EA9\u0EAC\u0EBA\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F48\u0F6D-\u0F70\u0F98\u0FBD\u0FCD\u0FDB-\u0FFF\u10C6\u10C8-\u10CC\u10CE\u10CF\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u137D-\u137F\u139A-\u139F\u13F6\u13F7\u13FE\u13FF\u169D-\u169F\u16F9-\u16FF\u170D\u1715-\u171F\u1737-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17DE\u17DF\u17EA-\u17EF\u17FA-\u17FF\u180F\u181A-\u181F\u1878-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1943\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19DD\u1A1C\u1A1D\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1A9F\u1AAE\u1AAF\u1ABF-\u1AFF\u1B4C-\u1B4F\u1B7D-\u1B7F\u1BF4-\u1BFB\u1C38-\u1C3A\u1C4A-\u1C4C\u1C80-\u1CBF\u1CC8-\u1CCF\u1CF7\u1CFA-\u1CFF\u1DF6-\u1DFB\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FC5\u1FD4\u1FD5\u1FDC\u1FF0\u1FF1\u1FF5\u1FFF\u2065\u2072\u2073\u208F\u209D-\u209F\u20BF-\u20CF\u20F1-\u20FF\u218C-\u218F\u23FB-\u23FF\u2427-\u243F\u244B-\u245F\u2B74\u2B75\u2B96\u2B97\u2BBA-\u2BBC\u2BC9\u2BD2-\u2BEB\u2BF0-\u2BFF\u2C2F\u2C5F\u2CF4-\u2CF8\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D71-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E43-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3040\u3097\u3098\u3100-\u3104\u312E-\u3130\u318F\u31BB-\u31BF\u31E4-\u31EF\u321F\u32FF\u4DB6-\u4DBF\u9FD6-\u9FFF\uA48D-\uA48F\uA4C7-\uA4CF\uA62C-\uA63F\uA6F8-\uA6FF\uA7AE\uA7AF\uA7B8-\uA7F6\uA82C-\uA82F\uA83A-\uA83F\uA878-\uA87F\uA8C5-\uA8CD\uA8DA-\uA8DF\uA8FE\uA8FF\uA954-\uA95E\uA97D-\uA97F\uA9CE\uA9DA-\uA9DD\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A\uAA5B\uAAC3-\uAADA\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB66-\uAB6F\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uD7FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBC2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFE\uFDFF\uFE1A-\uFE1F\uFE53\uFE67\uFE6C-\uFE6F\uFE75\uFEFD\uFEFE\uFF00\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFF8\uFFFE\uFFFF',
		// Private_Use
		Co : '\uE000-\uF8FF',
		// Surrogate
		Cs : '\uD800-\uDFFF',
		// Other
		C : '\0-\x1F\x7F-\x9F\xAD\u0378\u0379\u0380-\u0383\u038B\u038D\u03A2\u0530\u0557\u0558\u0560\u0588\u058B\u058C\u0590\u05C8-\u05CF\u05EB-\u05EF\u05F5-\u0605\u061C\u061D\u06DD\u070E\u070F\u074B\u074C\u07B2-\u07BF\u07FB-\u07FF\u082E\u082F\u083F\u085C\u085D\u085F-\u089F\u08B5-\u08E2\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09FC-\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF2-\u0AF8\u0AFA-\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B55\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B78-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0BFF\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5B-\u0C5F\u0C64\u0C65\u0C70-\u0C77\u0C80\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0D00\u0D04\u0D0D\u0D11\u0D3B\u0D3C\u0D45\u0D49\u0D4F-\u0D56\u0D58-\u0D5E\u0D64\u0D65\u0D76-\u0D78\u0D80\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DE5\u0DF0\u0DF1\u0DF5-\u0E00\u0E3B-\u0E3E\u0E5C-\u0E80\u0E83\u0E85\u0E86\u0E89\u0E8B\u0E8C\u0E8E-\u0E93\u0E98\u0EA0\u0EA4\u0EA6\u0EA8\u0EA9\u0EAC\u0EBA\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F48\u0F6D-\u0F70\u0F98\u0FBD\u0FCD\u0FDB-\u0FFF\u10C6\u10C8-\u10CC\u10CE\u10CF\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u137D-\u137F\u139A-\u139F\u13F6\u13F7\u13FE\u13FF\u169D-\u169F\u16F9-\u16FF\u170D\u1715-\u171F\u1737-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17DE\u17DF\u17EA-\u17EF\u17FA-\u17FF\u180E\u180F\u181A-\u181F\u1878-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1943\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19DD\u1A1C\u1A1D\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1A9F\u1AAE\u1AAF\u1ABF-\u1AFF\u1B4C-\u1B4F\u1B7D-\u1B7F\u1BF4-\u1BFB\u1C38-\u1C3A\u1C4A-\u1C4C\u1C80-\u1CBF\u1CC8-\u1CCF\u1CF7\u1CFA-\u1CFF\u1DF6-\u1DFB\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FC5\u1FD4\u1FD5\u1FDC\u1FF0\u1FF1\u1FF5\u1FFF\u200B-\u200F\u202A-\u202E\u2060-\u206F\u2072\u2073\u208F\u209D-\u209F\u20BF-\u20CF\u20F1-\u20FF\u218C-\u218F\u23FB-\u23FF\u2427-\u243F\u244B-\u245F\u2B74\u2B75\u2B96\u2B97\u2BBA-\u2BBC\u2BC9\u2BD2-\u2BEB\u2BF0-\u2BFF\u2C2F\u2C5F\u2CF4-\u2CF8\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D71-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E43-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3040\u3097\u3098\u3100-\u3104\u312E-\u3130\u318F\u31BB-\u31BF\u31E4-\u31EF\u321F\u32FF\u4DB6-\u4DBF\u9FD6-\u9FFF\uA48D-\uA48F\uA4C7-\uA4CF\uA62C-\uA63F\uA6F8-\uA6FF\uA7AE\uA7AF\uA7B8-\uA7F6\uA82C-\uA82F\uA83A-\uA83F\uA878-\uA87F\uA8C5-\uA8CD\uA8DA-\uA8DF\uA8FE\uA8FF\uA954-\uA95E\uA97D-\uA97F\uA9CE\uA9DA-\uA9DD\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A\uAA5B\uAAC3-\uAADA\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB66-\uAB6F\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBC2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFE\uFDFF\uFE1A-\uFE1F\uFE53\uFE67\uFE6C-\uFE6F\uFE75\uFEFD-\uFF00\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFFB\uFFFE\uFFFF',

		// 振り仮名 / 読み仮名
		// http://www.unicode.org/charts/PDF/U3040.pdf
		Hiragana : '\u3041-\u3096\u309D-\u309F',
		Katakana : '\u30A1-\u30FA\u30FD-\u30FF\u31F0-\u31FF\u32D0-\u32FE\u3300-\u3357\uFF66-\uFF6F\uFF71-\uFF9D'
	};

	if (!('unicode' in RegExp.prototype)) {
		Unicode_category.C = Unicode_category.C.replace('\uD7FC',
		// exclude surrogate pair control characters
		// (surrogate code point, \uD800-\uDFFF)
		'\uD7FC-\uD7FF\uE000');
	}

	// invalid characters @ wikitext, XML.
	Unicode_category.invalid = Unicode_category.C.replace('\0',
	// 去除 \t\n\r
	'\0-\x08\x0B\x0C\x0E');

	/**
	 * 可以使用 /\p{C}/u 之類的 RegExp。
	 * 
	 * @param {String|RegExp}source
	 *            source of RegExp instance.
	 * @param {String}[flags]
	 *            flags of RegExp instance.
	 * 
	 * @returns {RegExp}RegExp instance.
	 */
	function new_RegExp(source, flags) {
		if (has_Unicode_flag) {
			try {
				return new RegExp(source, flags);
			} catch (e) {
				// e.g., 自行設定了 Unicode_category
			}
		}

		if (library_namespace.is_RegExp(source)) {
			if (flags === undefined)
				flags = source.flags;
			source = source.source;
		}

		if (typeof flags === 'string' && flags.includes('u')) {
			if (!has_Unicode_flag)
				flags = flags.replace(/u/g, '');

			// 後處理 Unicode category。
			source = source.replace(/\\p{([A-Z][A-Za-z_]*)}/g, function(all,
					category) {
				return Unicode_category[category] || all;
			});
		}

		return new RegExp(source, flags);
	}

	new_RegExp.category = Unicode_category;

	var has_Unicode_flag;
	try {
		if (has_Unicode_flag = ('unicode' in RegExp.prototype)
				&& new RegExp(/\p{C}/, 'u')) {
			has_Unicode_flag = has_Unicode_flag.test('\u200E')
					&& has_Unicode_flag.unicode
					&& has_Unicode_flag.flags === 'u';
		}
	} catch (e) {
		has_Unicode_flag = false;
	}
	_.RegExp = new_RegExp;

	// ---------------------------------------------------------------------//

	/**
	 * <code>	2004/5/27 16:08
	將 MS-DOS 萬用字元(wildcard characters)轉成 RegExp, 回傳 pattern
	for search

	usage:
	p=new RegExp(wildcard_to_RegExp('*.*'))


	flags&1	有變化的時候才 return RegExp
	flags&2	add ^$


	萬用字元經常用在檔名的置換。
	 * 代表任意檔案名稱
	如：ls * 表示列出所有檔案名稱。
	? 則代表一個字元
	如: ls index.??? 表示列出所有 index.三個字元 的檔案名稱
	[ ] 代表選擇其中一個字元
	[Ab] 則代表 A 或 b 二者之中的一個字元
	如: ls [Ab]same 為 Asame 或 bsame
	[! ] 代表除外的一個字元
	[!Ab] 則代表 不是 A 且 不是 b 的一個字元
	如: [!0-9] 表不是數字字元
	如: *[!E] 表末尾不是 E 的檔名

	memo:
	檔案名稱不可包含字元	** 不包含目錄分隔字元 [\\/]:
	/:*?"<>|/

	</code>
	 */

	// 萬用字元 RegExp source, ReadOnly
	// wildcard_to_RegExp.w_chars = '*?\\[\\]';
	wildcard_to_RegExp.w_chars = '*?';

	function wildcard_to_RegExp(pattern, flags) {

		if (library_namespace.is_RegExp(pattern))
			return pattern;
		if (!pattern || typeof pattern !== 'string')
			return;

		var ic = wildcard_to_RegExp.w_chars, r;
		if ((flags & 1) && !new RegExp('[' + ic + ']').test(pattern))
			return pattern;

		ic = '[^' + ic + ']';
		if (false) {
			// old: 考慮 \
			r = pattern.replace(/(\\*)(\*+|\?+|\.)/g, function($0, $1, $2) {
				var c = $2.charAt(0);
				return $1.length % 2 ? $0 : $1
						+ (c === '*' ? ic + '*' : c === '?' ? ic + '{'
								+ $2.length + '}' : '\\' + $2);
			})
		}

		r = pattern

		// 處理目錄分隔字元：多轉一，'/' → '\\' 或相反
		.replace(/[\\\/]+/g, library_namespace.env.path_separator)

		// 在 RegExp 中有作用，但非萬用字元，在檔名中無特殊作用的
		.replace(/([().^$\-])/g, '\\$1')

		// * 代表任意檔案字元
		.replace(/\*+/g, '\0*')

		// ? 代表一個檔案字元
		.replace(/\?+/g, function($0) {
			return '\0{' + $0.length + '}';
		})

		// [ ] 代表選擇其中一個字元
		// pass
		.replace(/([\[\]])/g, '\\$1')

		// [! ] 代表除外的一個字元
		// pass
		// .replace(/\[!([^\]]*)\]/g, '[^$1]')

		// translate wildcard characters
		.replace(/\0+/g, ic)

		;

		// console.trace(r);

		// 有變化的時候才 return RegExp
		if (!(flags & 1) || pattern !== r) {
			try {
				pattern = new RegExp(flags & 2 ? '^' + r + '$' : r, 'i');
			} catch (e) {
				// 輸入了不正確的 RegExp：未預期的次數符號等
			}
		}

		return pattern;
	}

	_.wildcard_to_RegExp = wildcard_to_RegExp;

	function remove_Object_value(object, value) {
		for ( var i in object)
			if (object[i] === value)
				delete object[i];
	}

	_// JSDT:_module_
	.remove_Object_value = remove_Object_value;

	// string & Number 處理 -----------------------------------------------

	var PATTERN_SPACES = /[ _]+/g,
	// Punctuation marks 無實際意義的標點符號
	PUNCTUATION_MARKS = /[ _,.;:?'"`~!@#$%^&*()\/\-\[\]<>]+/g;

	// String.covers(string_1, string_2, options)
	// string_1.covers(string_2, options)
	// @see Knuth–Morris–Pratt algorithm
	/**
	 * @return true: 兩者相同, false: 兩者等長但不相同,<br />
	 *         1: str2為str1之擴展 (str2涵蓋str1), -1: str1為str2之擴展, 2: 兩者等價, 0: 皆非
	 */
	function String_covers(string_1, string_2, options) {
		// 前置作業。
		options = library_namespace.setup_options(options);

		// 預先處理函數. e.g., 是否忽略大小寫
		if (options && typeof options.preprocessor === 'function') {
			string_1 = options.preprocessor(string_1);
			string_2 = options.preprocessor(string_2);
		}

		// ignore punctuation marks
		if (options.ignore_marks) {
			string_1 = string_1.replace(PATTERN_PUNCTUATION_MARKS, '');
			string_2 = string_2.replace(PATTERN_PUNCTUATION_MARKS, '');
		} else if (options.ignore_spaces) {
			// assert: PATTERN_PUNCTUATION_MARKS including PATTERN_SPACES
			string_1 = string_1.replace(PATTERN_SPACES, '');
			string_2 = string_2.replace(PATTERN_SPACES, '');
		}

		if (string_1.length === string_2.length) {
			if (string_1 === string_2)
				return true;
			if (!options || !options.force
					|| typeof options.equals !== 'function')
				// 就算兩者等長但不相同，還是有可能等價。
				return false;
		}

		var result = 1;
		// swap: string_2 轉成長的。 (短,長)
		if (string_1.length > string_2.length) {
			result = string_2, string_2 = string_1, string_1 = result;
			result = -1;
		}

		// string_1 = string_1.replace(/\s+/g, ' ');

		string_1 = string_1.chars(true);
		string_2 = string_2.chars(true);

		var string_1_index = 0, string_2_index = 0, character_1 = string_1[0],
		// comparer
		equals = options && typeof options.equals === 'function' ? options.equals
				: String_covers.equals;

		string_2.some(function(character_2, index) {
			if (equals(character_1, character_2))
				if (++string_1_index === string_1.length) {
					string_2_index = index;
					return true;
				} else
					character_1 = string_1[string_1_index];
		});

		return string_1_index === string_1.length ? result : 0;
	}

	String_covers.equals = function(a, b) {
		return a === b;
	};

	// compare file name. 比較檔名是否相同。str2 為 str1 添加字元後的擴展？表示兩檔名等價
	String_covers.file_name_equals = function(a, b) {
		return a === b || /^[ ・.]+$/.test(a + b) || /^[-～]+$/.test(a + b)
				|| /^[［\[]+$/.test(a + b) || /^[］\]]+$/.test(a + b);
	};

	set_method(String, {
		covers : String_covers,
		similarity : similarity_coefficient
	});

	function split_String_by_length_(s, l, m) {
		var
		// less than
		lt, lt2,
		// great than
		gt,
		// index
		i = 0,
		// left count index(left length now)
		c = l,
		// text now
		t = '',
		// text index
		I = 0;
		while (I < s.length) {
			// 將lt,gt定在下一label之首尾,i為下一次搜尋起點.label定義:/<.+?>/
			if (i !== NOT_FOUND)
				if ((lt = s.indexOf('<', i)) !== NOT_FOUND) {
					if ((gt = s.indexOf('>', lt + 1)) === NOT_FOUND)
						i = lt = NOT_FOUND;
					else {
						i = gt + 1;
						while (lt !== NOT_FOUND
								&& (lt2 = s.indexOf('<', lt + 1)) !== NOT_FOUND
								&& lt2 < gt)
							lt = lt2;
					}
				} else
					i = lt = NOT_FOUND;
			if (false && s.indexOf('') !== NOT_FOUND)
				alert(i + ',' + lt + ',' + gt + ';' + l + ',' + c + '\n' + t);
			if (lt === NOT_FOUND)
				gt = lt = s.length;
			// 未來:考慮中英文大小，不分隔英文字。前提:'A'<'z'..或許不用
			while (I + c <= lt) {
				t += s.substr(I, c) + (m ? '\n' : '<br />');
				I += c;
				c = l;
			}
			t += s.slice(I, gt + 1);
			c -= lt - I;
			I = gt + 1;
		}
		return t;
	}
	/*
	 * 將字串以長l分隔, split String by fixed length. m==0: html用, 1:text.
	 */
	// split_String_by_length[generateCode.dLK]='split_String_by_length_';
	function split_String_by_length(l, m) {
		var s = this.valueOf(), t = [], sp = '<br />';
		if (!s || !l || l < 1
		// ||!String.charCodeAt: for v5.5
		|| !String.fromCharCode)
			return m ? s.gText() : s;
		// (m):這樣就不用再費心思了.不過既然都作好了,就留著吧..不,還是需要
		s = s.turnU(m);
		if (s.length <= l)
			return s;
		if (!m)
			s = s.replace(/<w?br([^>]*)>/gi, sp);

		// deal with line
		s = s.split(sp = m ? '\n' : sp);
		try {
			// 預防JS5不能push
			for (var i = 0; i < s.length; i++)
				t.push(split_String_by_length_(s[i], l, m));
		} catch (e) {
			return this.valueOf();
		}
		return t.join(sp);
	}

	/**
	 * 將字串以長 size 切割。
	 * 
	 * @param {Integer}size
	 *            切割大小。可以 ((.length / count) | 0 ) 取得。
	 * @returns {Array} chunks
	 * 
	 * @see <a
	 *      href="http://stackoverflow.com/questions/7033639/javascript-split-large-string-in-n-size-chunks"
	 *      accessdate="2015/3/2 23:27">regex - javascript: Split large string
	 *      in n-size chunks - Stack Overflow</a>
	 */
	function chunk(size) {
		if ((size |= 0) < 1)
			return [ this ];

		var index = 0, length = this.length, result = [];
		for (; index < length; index += size)
			result.push(this.substr(index, size));

		return result;
	}

	// ---------------------------------------------------------------------//

	var no_string_index;
	// for IE 6. Or use .chars(), .split(''), .charAt()
	try {
		no_string_index = '01';
		no_string_index = !(no_string_index[1] === '1');
	} catch (e) {
		// e.g., IE 6
		no_string_index = true;
	}

	// To test if RegExp.prototype has unicode flag:
	// if ('unicode' in RegExp.prototype) {}
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp

	var has_spread_syntax;
	try {
		has_spread_syntax = eval("[...'ab'].join(',')==='a,b'");
	} catch (e) {
	}

	var PATTERN_char, PATTERN_char_with_combined, split_by_code_point;
	try {
		// using [\s\S] or [^] or /./s
		// @see https://github.com/tc39/proposal-regexp-dotall-flag
		// tested @ Edge/12.10240
		PATTERN_char = new RegExp(/[\s\S]/.source, 'ug');
		// 注意:因為/./u會切分[[en:Combining character#Unicode ranges]]，
		// 因此對組合字符，得要另外處理。
		PATTERN_char_with_combined = new RegExp(
				/[\s\S][\u0300-\u036F\uFE20-\uFE2F\u20D0-\u20FF\u1DC0-\u1DFF\u1AB0-\u1AFF]*/.source,
				'ug');

		/**
		 * 對於可能出現 surrogate pairs 的字串，應當以此來取代 .split('')！<br />
		 * handling of surrogate pairs / code points
		 * 
		 * TODO: 利用.split('')增進效率。
		 * 
		 * @see https://en.wikipedia.org/wiki/UTF-16#Code_points_U.2B10000_to_U.2B10FFFF
		 *      http://teppeis.hatenablog.com/entry/2014/01/surrogate-pair-in-javascript
		 *      https://docs.oracle.com/javase/6/docs/api/java/lang/String.html#toCharArray()
		 */
		split_by_code_point = function(with_combined) {
			// if (has_spread_syntax && !with_combined) return [...this];
			return this.match(with_combined ? PATTERN_char_with_combined
					: PATTERN_char)
					|| [];
			// show HEX:
			// .map(function(char){return
			// char.codePointAt(0).toString(0x10).toUpperCase();});
		};
	} catch (e) {
		// 舊版。
		var PATTERN_surrogate = /[\uD800-\uDBFF][\uDC00-\uDFFF]/;
		PATTERN_char = /[\uD800-\uDBFF][\uDC00-\uDFFF]|[\s\S]/g;
		PATTERN_char_with_combined = /(?:[\uD800-\uDBFF][\uDC00-\uDFFF]|[\s\S])[\u0300-\u036F\uFE20-\uFE2F\u20D0-\u20FF\u1DC0-\u1DFF\u1AB0-\u1AFF]*/g;
		split_by_code_point = function(with_combined) {
			return with_combined // || !PATTERN_surrogate
					|| PATTERN_surrogate.test(this) ? this
					.match(with_combined ? PATTERN_char_with_combined
							: PATTERN_char)
					|| [] : this.split('');
		};
	}

	// String.prototype.codePoints()
	// http://docs.oracle.com/javase/8/docs/api/java/lang/CharSequence.html#codePoints--
	function codePoints() {
		return split_by_code_point.call(this)
		// need data.code.compatibility!
		.map(function(char) {
			return char.codePointAt(0);
		});
	}

	/**
	 * get string between head and foot.<br />
	 * 取得 text 中，head 與 foot 之間的字串。不包括 head 與 foot。<br />
	 * 可以 [3] last index 是否回傳 NOT_FOUND (-1) 檢測到底是有找到，只是回傳空字串，或是沒找到。
	 * 
	 * TODO: {RegExp}head, {RegExp}foot
	 * 
	 * @example <code>

	 // More examples: see /_test suite/test.js

	 * </code>
	 * 
	 * @param {Array}data [
	 *            text 欲篩選字串, head 首字串, foot 尾字串, start index ]
	 * 
	 * @returns [ 0: text 欲篩選字串, 1: head 首字串, 2: foot 尾字串, 3: last index, 4:
	 *          head 與 foot 之間的字串 ]
	 * 
	 * @since 2014/8/4 21:34:31
	 */
	function get_intermediate_Array(data) {
		if (data && data[0]
		// = String(data[0])
		) {
			// start index of intermediate.
			var index;
			if (!data[1])
				index = 0;
			else if ((index = data[0].indexOf(data[1], data[3])) !== NOT_FOUND)
				index += data[1].length;
			// library_namespace.debug('head index: ' + index, 4);

			if ((data[3] = index) !== NOT_FOUND
					&& (!data[2] || (data[3] = data[0].indexOf(data[2], index)) !== NOT_FOUND))
				data[4] = data[2] ? data[0].slice(index, data[3])
				//
				: index ? data[0].slice(index)
				//
				: data[0];
		}
		return data;
	}

	/**
	 * get string between head and foot.<br />
	 * 取得 text 中，head 與 foot 之間的字串。不包括 head 與 foot。<br />
	 * 回傳 undefined 表示沒找到。只是回傳空字串表示其間為空字串。
	 * 
	 * TODO: lastIndexOf()
	 * 
	 * @example <code>

	 // More examples: see /_test suite/test.js

	 * </code>
	 * 
	 * @param {String}text
	 *            欲篩選字串。
	 * @param {String}[head]
	 *            首字串。 TODO: RegExp
	 * @param {String}[foot]
	 *            尾字串。 TODO: RegExp
	 * 
	 * @returns head 與 foot 之間的字串。undefined 表示沒找到。
	 * 
	 * @since 2014/7/26 11:28:18
	 */
	function get_intermediate(text, head, foot, index, return_data) {
		if (text
		// = String(text)
		) {
			// start index of intermediate.
			if (!head) {
				index = 0;
			} else if ((index = text.indexOf(head, index | 0)) !== NOT_FOUND) {
				index += head.length;
			}
			library_namespace.debug('head index: ' + index, 4);

			if (index !== NOT_FOUND && (!foot || (foot = foot.tail
			// 可以用 {tail:'foot'} 來從結尾搜尋。from tail
			? text.lastIndexOf(foot.tail)
			// 正常:從頭搜尋。
			: text.indexOf(foot, index)) !== NOT_FOUND)) {
				head = foot >= 0 ? text.slice(index, foot) : index > 0 ? text
						.slice(index) : text;
				return return_data ?
				// [ last index, head 與 foot 之間的字串 ]
				[ foot || text.length, head ] : head;
			}
		}

		if (return_data) {
			return [ NOT_FOUND, ];
		}
	}

	_.get_intermediate = get_intermediate;

	/**
	 * <code>

	// 推薦 use .find_between(), 見下一段例
	var data = html.find_between('>', '<'), text;

	text = data.search().search().search().toString();

	while (data.next()) {
		text = data.toString();
	}

	// method 1:
	while (term = terms.next()) {
		term.toString();
	}

	// method 2:
	while (typeof (text = data.search()) === 'string') {
		;
	}

	</code>
	 */
	function next_intermediate(index) {
		if (this[3] !== NOT_FOUND) {
			var data = get_intermediate(this[0], this[1], this[2], this[3],
					true);
			library_namespace.debug('Get [' + data + ']', 4);
			if ((this[3] = data[0]) !== NOT_FOUND) {
				this[4] = data[1];
				return this;
			}
		}
	}
	// find out next
	// 為避免 overwrite Array.prototype.find()，因此改名為 search。
	function search_intermediate(index) {
		this.next();
		return this;
	}
	function intermediate_result() {
		return this[3] !== NOT_FOUND && this[4] || '';
	}
	function intermediate_between() {
		return String.prototype.between.apply(this.toString(), arguments);
	}
	// 2017/1/3 13:48:21 API change:
	// set_intermediate()→find_between()
	// WARNING: 請盡可能採用find_between()，勿使用deprecated_find_between()。
	// 要用此函數，不如直接採用RegExp.prototype.exec()比較快。
	function deprecated_find_between(head, foot, index) {
		var data = [ this, head, foot, index | 0 ];
		data.next = next_intermediate;
		data.search = search_intermediate;
		data.toString = intermediate_result;
		// data.between = intermediate_between;
		return data;
	}

	/**
	 * 2017/2/15 16:5:0 API change: rename to .find_between<br />
	 * all_between()→find_between()
	 * 
	 * TODO:<br />
	 * return {Iterator} of all between
	 * 
	 * @see http://jsrocks.org/cn/2015/09/javascript-iterables-and-iterators/
	 *      http://es6.ruanyifeng.com/#docs/symbol
	 * 
	 * <code>

	// 推薦用法
	var get_next_between = html.find_between('>', '<'), text;

	while ((text = get_next_between()) !== undefined) {
		text;
	}

	</code>
	 */

	// 採用String.prototype.indexOf()以增進速度，超越RegExp.prototype.exec()。
	// @see /_test suite/test.js
	function find_between(head, foot, index) {
		// start index
		index |= 0;
		// assert: !!head && !!foot
		// && typeof head === 'string' && typeof foot === 'string'
		var text = this, head_length = head.length, foot_length = foot.length;

		function get_next_between() {
			if (index !== NOT_FOUND
					&& (index = text.indexOf(head, index)) !== NOT_FOUND) {
				var foot_index = text.indexOf(foot, index += head_length);
				if (foot_index !== NOT_FOUND) {
					var token = text.slice(index, foot_index);
					// +foot_length: search next starts from end of foot
					index = foot_index + foot_length;
					return token;
				}
				// 接下來皆無foot，則即使再存有head亦無效。
				index = NOT_FOUND;
			}
			// return undefined;
		}

		return get_next_between;
	}

	// return {Array}all matched
	function all_between(head, foot, index) {
		// start index
		index |= 0;
		// assert: !!head && !!foot
		// && typeof head === 'string' && typeof foot === 'string'
		var matched = [], head_length = head.length, foot_length = foot.length;

		while (index !== NOT_FOUND
				&& (index = this.indexOf(head, index)) !== NOT_FOUND) {
			var foot_index = this.indexOf(foot, index += head_length);
			if (foot_index === NOT_FOUND) {
				// 接下來皆無foot，則即使再存有head亦無效。
				break;
			}
			matched.push(this.slice(index, foot_index));
			// +foot_length: search next starts from end of foot
			index = foot_index + foot_length;
		}

		return matched;
	}

	// callback(token, index, foot_index);
	// 沒有輸入foot的話，則會把head拿來當作foot。
	// TODO: {RegExp}head, foot
	function each_between(head, foot, callback, thisArg, index) {
		if (Array.isArray(head) && typeof foot === 'function') {
			// shift arguments.
			index = thisArg;
			thisArg = callback;
			callback = foot;
			// for head: [head, foot]
			if (Array.isArray(head) && head.length === 2) {
				foot = head[1];
				head = head[0];
			} else {
				if (typeof head === 'string') {
					// 每個head切一段?
					library_namespace
							.error('If you needs cut string into small pieces, please using string.split().slice(1).forEach() !');
				}
				throw new TypeError('Invalid head type');
			}
		}

		// this.all_between(head, foot, index).forEach(callback, thisArg);

		// start index
		index |= 0;
		// assert: !!head && !!foot
		// && typeof head === 'string' && typeof foot === 'string'
		var head_length = head ? head.length : 0, foot_length = foot ? foot.length
				: 0, foot_index;

		if (!thisArg) {
			thisArg = this;
		}

		while (foot || !(foot_index > 0) ? index !== NOT_FOUND
		// allow null header
		&& (!head || (index = this.indexOf(head, index)) !== NOT_FOUND)
				: (index = foot_index) < this.length) {
			foot_index = this.indexOf(foot || head, index += head_length);
			if (foot_index === NOT_FOUND) {
				// 接下來皆無(foot||head)，則即使再存有head亦無效。
				if (foot) {
					break;
				}
				foot_index = this.length;
			}
			callback.call(thisArg, this.slice(index, foot_index), index,
					foot_index);
			// +foot_length: search next starts from end of foot
			index = foot_index + foot_length;
		}
	}

	// =====================================================================================================================

	function set_bind(handler, need_meny_arg) {
		if (typeof need_meny_arg !== 'boolean')
			need_meny_arg = handler.length > 1;

		return need_meny_arg ? function(args) {
			if (arguments.length < 2)
				return handler(this, args);

			// Array.from()
			args = Array.prototype.slice.call(arguments);
			args.unshift(this);
			return handler.apply(handler, args);
		} : function(args) {
			return handler(this, args);
		};
	}

	function set_bind_valueOf(handler, need_meny_arg) {
		var ReturnIfAbrupt = function(v) {
			// 尚有未竟之處。
			switch (library_namespace.is_type(v)) {
			case 'Boolean':
			case 'Number':
			case 'String':
				v = v.valueOf();
			}
			return v;
		};
		return need_meny_arg ? function(args) {
			if (arguments.length < 2)
				return handler(ReturnIfAbrupt(this), args);

			// Array.from()
			args = Array.prototype.slice.call(arguments);
			args.unshift(ReturnIfAbrupt(this));
			return handler.apply(handler, args);
		} : function(args) {
			return handler(ReturnIfAbrupt(this), args);
		};
	}

	// ReturnIfAbrupt
	var need_valueOf = false;
	String.prototype.test_valueOf = (function() {
		return function() {
			if (typeof this !== 'string')
				if (this && typeof this.valueOf() === 'string')
					need_valueOf = true;
				else
					library_namespace.error('set_bind: 無法判別是否該使用 .valueOf()！');
		};
	})();
	'.'.test_valueOf();
	try {
		delete String.prototype.test_valueOf;
	} catch (e) {
		String.prototype.test_valueOf = undefined;
	}

	_.set_bind = need_valueOf ? set_bind_valueOf : set_bind;

	/**
	 * 
	 * @param {Array}array
	 * @param {Function}[comparator]
	 * @returns
	 */
	function unique_and_sort_Array(array, comparator) {
		if (comparator) {
			array.sort(comparator);
		} else {
			array.sort();
		}

		var i = 1, j = -1;
		for (; i < array.length; i++)
			if (array[i] === array[i - 1]) {
				if (j < 0)
					j = i;
			} else if (j >= 0)
				array.splice(j, i - j), i = j, j = -1;

		if (j >= 0)
			array.splice(j, i - j);
		return array;
	}

	// -------------------------------------------
	var type_index = {
		string : 0,
		number : 1,
		boolean : 2,
		'undefined' : 3
	};
	function deprecated_unique_Array(sorted) {
		var array = [];

		if (sorted) {
			var last;
			this.forEach(function(element) {
				if (last !== element)
					array.push(element);
				last = element;
			});

		} else {
			// 以 hash 純量 index 加速判別是否重複。
			var hash = Object.create(null);
			this.forEach(function(element) {
				var type = typeof element;
				// 能確保順序不變。
				if (type in type_index) {
					// TODO: -0
					if (!(element in hash)
							|| !(type_index[type] in hash[element])) {
						array.push(element);
						(hash[element] = [])[type_index[type]] = null;
					}
				} else if (array.indexOf(element) === NOT_FOUND)
					array.push(element);
			});
		}

		return array;
	}
	// -------------------------------------------

	// @see cardinal_1()
	function unique_sorted_Array(get_key) {
		if (this.length === 0)
			return [];

		var latest_key = this[0];
		var unique_array = [ latest_key ];
		if (get_key)
			latest_key = get_key(latest_key);

		for (var index = 1, length = this.length; index < length; index++) {
			var element = this[index];
			var key = get_key ? get_key(element) : element;
			if (!Object.is(latest_key, key))
				unique_array.push(element);
			latest_key = key;
		}

		return unique_array;
	}

	/**
	 * 取交集 array_1 ∩ array_2
	 * 
	 * @param {Array}array_1
	 *            array 1
	 * @param {Array}array_2
	 *            array 2
	 * @param {Function}[key_of_item]
	 *            Function to get key of item.
	 * @param {Boolean}[sorted]
	 *            true: array_1, array_2 are sorted.
	 * 
	 * @returns {Array}intersection of array_1 and array_2
	 */
	function Array_intersection(array_1, array_2, key_of_item, sorted) {
		if (key_of_item === true) {
			sorted = true;
			key_of_item = null;
		}
		if (!sorted) {
			var sort_function = typeof key_of_item === 'function' ? function(
					_1, _2) {
				return general_ascending(key_of_item(_1), key_of_item(_2));
			} : general_ascending;
			array_1 = array_1.clone().sort(sort_function);
			array_2 = array_2.clone().sort(sort_function);
		}
		// console.log([array_1, array_2]);

		var index_of_array_1 = 0, index_of_array_2 = 0,
		// Object.create(array_1)
		result = [];
		for (; index_of_array_1 < array_1.length
				&& index_of_array_2 < array_2.length; index_of_array_1++) {
			var item = array_1[index_of_array_1];
			if (key_of_item)
				item = key_of_item(item);

			do {
				var item_2 = array_2[index_of_array_2];
				if (key_of_item)
					item_2 = key_of_item(item_2);
				if (item_2 < item) {
					index_of_array_2++;
					continue;
				}
				if (item_2 === item) {
					// 相同元素最多取 array_1, array_2 之最小個數。
					index_of_array_2++;
					result.push(item);
				}
				break;
			} while (index_of_array_2 < array_2.length);
		}
		return result;
	}

	var has_native_Map = !Map[library_namespace.env.not_native_keyword];
	// 警告: 相同的 key 只會留下一個 item！
	function Array_intersection_Map(array_1, array_2, key_of_item, sorted) {
		if (key_of_item === true) {
			sorted = true;
			key_of_item = null;
		}
		if (sorted)
			return Array_intersection(array_1, array_2, key_of_item, sorted);

		// @see function unique_Array()
		var map = new Map;
		function set_item(item) {
			var key = key_of_item ? key_of_item(item) : item;
			if (!map['has'](key))
				map['set'](key, /* item */null);
		}
		array_1.forEach(set_item);
		var result = array_2.filter(function(item) {
			var key = key_of_item ? key_of_item(item) : item;
			return map['has'](key);
		});
		return result;
	}

	/**
	 * Count occurrence of $search in string.<br />
	 * 計算 string 中出現 search 之次數。<br />
	 * 
	 * 用 s/// 亦可 @ perl
	 * 
	 * @param {String}string
	 *            在 string 中搜尋。
	 * @param {String|RegExp}search
	 *            搜尋對象。
	 * @param {Integer}[position]
	 *            開始搜尋的位置(start index)。
	 * 
	 * @returns {Integer} string 中出現 search 之次數。
	 * 
	 * @see http://jsperf.com/count-string-occurrence-in-string,
	 *      http://jsperf.com/count-the-number-of-occurances-in-string
	 *      http://stackoverflow.com/questions/881085/count-the-number-of-occurences-of-a-character-in-a-string-in-javascript
	 * 
	 * @since 2013/2/13 11:12:38 重構
	 * @since 2014/8/11 12:54:34 重構
	 */
	function count_occurrence(string, search, position) {
		// 正規化 position 成 index (0, 1, ..)。
		// 注意:過大的 position 在 |0 時會變成負數!
		if (isNaN(position) || (position |= 0) < 0)
			position = 0;

		if (position > 0)
			string = string.slice(position);

		return string.split(search).length - 1;

		// 以下放棄。

		if (library_namespace.is_RegExp(search))
			return (string = (position > 0 ? string.slice(position) : string)
					.match(search)) ? string.length : 0;

		// 正規化 search。
		if (!search || !(search = String(search)))
			return 0;

		// 使用 String.prototype.indexOf (searchString, position)
		var count = 0, length = search.length;

		while ((position = string.indexOf(search, position)) !== NOT_FOUND)
			count++, position += length;

		return count;
	}

	function determine_line_separator(text) {
		var matched, PATTERN = /\r?\n|\r/g, rn = 0, r = 0, n = 0;
		while (matched = PATTERN.exec(text)) {
			if (matched[0] === '\r\n')
				rn++;
			else if (matched[0] === '\n')
				n++;
			else
				r++;
		}

		if (rn > n && rn > r) {
			return '\r\n';
		}
		if (n > r && n > rn) {
			return '\n';
		}
		if (r > n && r > rn) {
			return '\r';
		}

		return library_namespace.env.line_separator;
	}

	_.determine_line_separator = determine_line_separator;

	/**
	 * 取至小數 digits 位， 肇因： JScript即使在做加減運算時，有時還是會出現 3*1.6=4.800000000000001,
	 * 2.4/3=0.7999999999999999 等數值。此函數可取至 1.4 與 0.1。 c.f., round()
	 * 
	 * @see Number.prototype.toLocaleString()
	 *      https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString
	 * 
	 * @param {Number}[decimals]
	 *            1,2,...: number of decimal places shown
	 * @param {Number}[max]
	 *            maximum decimals. max===0:round() else floor()
	 * 
	 * @return {Number}取至小數 digits 位後之數字。
	 * 
	 * @see https://bugzilla.mozilla.org/show_bug.cgi?id=5856
	 *      IEEE754の丸め演算は最も報告されるES3「バグ」である。 http://www.jibbering.com/faq/#FAQ4_6
	 *      http://en.wikipedia.org/wiki/Rounding
	 * 
	 * @example <code>
	 * var d=new Date,v=0.09999998,i=0,a;
	 * for(;i<100000;i++)a=v.to_fixed(2);
	 * alert(v+'\n→'+a+'\ntime:'+format_date(new Date-d));
	 * </code>
	 * 
	 * @_memberOf _module_
	 */
	function slow_to_fixed(decimals, max) {
		var value = this.valueOf(), i, negative;

		if (isNaN(value))
			return value;

		if (isNaN(decimals) || (decimals = Math.floor(decimals)) < 0) {
			// TODO: using Number.EPSILON

			// 內定：10位
			decimals = 10;
		} else if (decimals > 20)
			// 16: Math.ceil(Math.abs(Math.log10(Number.EPSILON)))
			decimals = 16;

		if (!max && Number.prototype.toFixed) {
			// 去掉末尾的0。必須預防 `(49.5).to_fixed(0)`。
			return parseFloat(value.toFixed(decimals).replace(/\.0+$/, ''));
		}

		if (value < 0)
			// 負數
			negative = true, value = -value;

		value = value.toString(10);
		i = value.indexOf('e');
		if (i !== NOT_FOUND) {
			// e-\d: 數字太小.
			return value.charAt(i + 1) === '-' ? 0 : value;
		}

		library_namespace.debug(value, 2);
		// TODO: using +.5 的方法
		// http://clip.artchiu.org/2009/06/26/%E4%BB%A5%E6%95%B8%E5%AD%B8%E7%9A%84%E5%8E%9F%E7%90%86%E8%99%95%E7%90%86%E3%80%8C%E5%9B%9B%E6%8D%A8%E4%BA%94%E5%85%A5%E3%80%8D/
		i = value.indexOf('.');
		if (i !== NOT_FOUND && i + 1 + decimals < value.length) {
			if (max) {
				value = '00000000000000000000' + Math.round(
				//
				value.slice(0, i++) + value.substr(i, decimals)
				//
				+ '.' + value.charAt(i + decimals)).toString(10);
				if (value != 0)
					library_namespace.debug(value + ',' + value.length + ','
							+ decimals + ','
							+ value.substr(0, value.length - decimals) + ','
							+ value.substr(max), 2);
				max = value.length - decimals;
				value = value.slice(0, max) + '.' + value.substr(max);
			} else
				value = value.slice(0, i + 1 + decimals);
		}

		return value ? parseFloat((negative ? '-' : '') + value) : 0;
	}

	// (15*1.33).to_fixed()===19.95

	// old:very slow
	function deprecated_to_fixed(d, m) {
		var v = this.valueOf(), i;
		if (isNaN(v))
			return v;
		if (isNaN(d) || d < 0)
			d = 8; // 內定：8位
		if (!m) {
			v = Math.round(Math.pow(10, d) * v);
			v = v < 0 ? '-' + '0'.repeat(d) + (-v) : '0'.repeat(d) + v;
			v = v.slice(0, i = v.length - d) + '.' + v.substr(i);
		} else if (i = (v = '' + v).indexOf('.') + 1)
			v = v.slice(0, i + (d ? d : d - 1));
		return parseFloat(v || 0);
	}

	if (false) {
		var addDenominationSet = {
			a : ',,,,'.split(',')
		},
		// 增添單位
		addDenomination = function addDenomination(a, b) {
			TODO;
		};
	}

	/**
	 * 取至小數 digits 位，<br />
	 * 肇因： JScript即使在做加減運算時，有時還是會出現 3*1.6=4.800000000000001,<br />
	 * 2.4/3=0.7999999999999999 等數值。此函數可取至 1.4 與 0.1，避免 <a
	 * href="http://en.wikipedia.org/wiki/Round-off_error" accessdate="2012/9/19
	 * 22:21" title="Round-off error">round-off error</a>。<br />
	 * c.f., Math.round()
	 * 
	 * @param {Number}[decimals]
	 *            1,2,..: number of decimal places shown.
	 * @return 取至小數 digits 位後之數字。
	 * 
	 * @see https://bugzilla.mozilla.org/show_bug.cgi?id=5856
	 *      IEEE754の丸め演算は最も報告されるES3「バグ」である。 http://www.jibbering.com/faq/#FAQ4_6
	 *      http://en.wikipedia.org/wiki/Rounding
	 * 
	 * @example <code>
	var d = new Date, v = 0.09999998, i = 0, a;
	for (; i < 100000; i++)
		a = v.to_fixed(2);
	alert(v + '\n→' + a + '\ntime:' + format_date(new Date - d));
	 * </code>
	 * 
	 * @_memberOf _module_
	 */
	function native_to_fixed(decimals) {
		// (21.1*2006).toFixed(11) === "42326.60000000001"
		// (21.1*200006).toFixed(9)==="4220126.600000001"
		// 256738996346789.1.toFixed(10)==="256738996346789.0937500000"
		return decimals <= 0 ? Math.round(this) : parseFloat(this
				.toFixed(decimals || 12));
	}

	var to_fixed = slow_to_fixed;
	_.to_fixed = slow_to_fixed;

	/**
	 * non-negative modulo, positive modulo. 保證 modulo 結果 >=0。 轉成最接近 0 之正 index。
	 * 
	 * @param {Number}dividend
	 *            被除數。
	 * @param {Number}divisor
	 *            除數。
	 * 
	 * @returns {Number}remainder 餘數
	 */
	function non_negative_modulo(dividend, divisor) {
		if (false)
			return ((dividend % divisor) + divisor) % divisor;

		if ((dividend %= divisor) < 0)
			dividend += divisor;
		return dividend;
	}

	/**
	 * <code>
	var sourceF=WScript.ScriptName,targetF='test.js';simpleWrite('tmp.js',alert+'\n'+simpleRead+'\n'+simpleWrite+'\nvar t="",ForReading=1,ForWriting=2,ForAppending=8\n,TristateUseDefault=-2,TristateTrue=-1,TristateFalse=0\n,WshShell=WScript.CreateObject("WScript.Shell"),fso=WScript.CreateObject("Scripting.FileSystemObject");\nt='+'data.native'(simpleRead(sourceF),80)+';\nsimpleWrite("'+targetF+'",t);//eval(t);\nalert(simpleRead("'+sourceF+'")==simpleRead("'+targetF+'")?"The same (test dQuote OK!)":"Different!");');//WshShell.Run('"'+getFolder(WScript.ScriptFullName)+targetF+'"');

	//	determine quotation mark:輸入字串，傳回已加'或"之字串。
	dQuote.qc=function(c,C){
	return c<32?'\\'+c:C;
	};

	TODO:
	use JSON.stringify()

	</code>
	 * 
	 * @see JSON.stringify()
	 */
	// string,分割長度(會採用'~'+"~"的方式),separator(去除末尾用)
	function dQuote(s, len, sp) {
		var q;
		s = String(s);
		if (sp)
			// 去除末尾之sp
			s = s.replace(new RegExp('[' + sp + ']+$'), '');
		if (isNaN(len) || len < 0)
			len = 0;
		if (len) {
			var t = '';
			for (; s;)
				t += '+' + dQuote(s.slice(0, len))
				// '\n':line_separator
				+ '\n', s = s.substr(len);
			return t.substr(1);
		}

		// test用
		if (false && len) {
			var t = '';
			for (; s;)
				t += 't+=' + dQuote(s.slice(0, len)) + '\n', s = s.substr(len);
			return t.substr(3);
		}

		s = s.replace(/\\/g, '\\\\').replace(/\r/g, '\\r')
		//
		.replace(/\n/g, '\\n')
		// \b,\t,\f

		// 轉換控制字符
		.replace(/([\0-\37\x7f\xff])/g, function($0, $1) {
			var c = $1.charCodeAt(0);
			return c < 8 * 8 ? '\\' + c.toString(8) : '\\x'
			//
			+ (c < 0x10 ? '0' : '') + c.toString(0x10);
		})
		// .replace(/([\u00000100-\uffffffff])/g, function($0, $1) {})
		;
		if (false) {
			q = s.length;
			while (s.charAt(--q) == sp)
				;
			s = s.slice(0, q + 1);
		}
		if (s.indexOf(q = "'") !== NOT_FOUND)
			q = '"';
		if (s.indexOf(q) !== NOT_FOUND) {
			library_namespace.debug(
			//
			"Can't determine quotation mark, the resource may cause error.\n"
					+ s);
			s = s.replace(new RegExp(q = "'", 'g'), "\\'");
		}
		return q + s + q;
	}

	_.dQuote = dQuote;

	// ----------------------------------------------------
	// 可以處理 circular 的 JSON.stringify()，以及可以復原的 JSON.parse()。

	// 盡量找不會用到，又不包含特殊字元的字串作為識別碼。
	var default_KEY_reference = 'REF|';

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
	// https://github.com/WebReflection/circular-json/blob/master/src/circular-json.js

	// https://stackoverflow.com/questions/11616630/json-stringify-avoid-typeerror-converting-circular-structure-to-json
	function create_reference_map(object, recover_value, KEY_reference) {
		if (KEY_reference === undefined) {
			KEY_reference = default_KEY_reference;
		}

		// e.g., reference_map[{k:0}] = 'REF|0'
		// reference_list = [ {k:0}, ... ]
		var reference_map = new Map, reference_hash = Object.create(null), index = 0;

		return JSON.stringify(object, function(key, value) {
			// console.log([ this, key, value ]);

			// only objects may circular
			if (typeof value === 'object') {
				// return a reference to the value if it had beed processed
				if (reference_map.has(value))
					return reference_map.get(value);

				// record the value

				// find a key that is not in reference_hash or we will be
				// confused if there are duplicate keys
				while ((key = KEY_reference + index++) in reference_hash) {
					if (recover_value) {
						throw new Error('create_reference_map: Invalid index '
								+ key + '. It should not happen.');
					}
				}
				// assert: typeof key!=='object', or will be traversed by
				// JSON.stringify()

				reference_hash[key] = value;
				reference_map.set(value, key);

			} else if (typeof value !== 'object' && recover_value
					&& (value in reference_hash)) {
				// recover value
				this[key] = reference_hash[value];

			} else if (typeof value === 'string' && !recover_value
					&& value.startsWith(KEY_reference)) {
				throw new Error('create_reference_map: '
				//
				+ 'You should specify another KEY_reference instead of '
						+ JSON.stringify(KEY_reference) + '. Confused value: '
						+ value);
			}

			return value;
		});
	}

	// KEY_reference: Any value of object wont starts with KEY_reference
	// 若是有任何一個value包含了 default_KEY_reference + 數字的格式，則需要另外指定 KEY_reference。
	function stringify_circular(object, KEY_reference) {
		return create_reference_map(object, false, KEY_reference);
	}

	function parse_circular(json_string, KEY_reference) {
		var parsed = JSON.parse(json_string);
		// stringify again, using the same algorithm as JSON.stringify() in
		// JSON.stringify_circular().
		create_reference_map(parsed, true, KEY_reference);

		return parsed;
	}

	// old JScript engine do not have JSON
	if (typeof JSON === 'object' && typeof JSON.parse === 'function') {
		set_method(JSON, {
			stringify_circular : stringify_circular,
			parse_circular : parse_circular
		});
	}

	// ----------------------------------------------------

	_// JSDT:_module_
	.
	/**
	 * check input string send to SQL server
	 * 
	 * @param {String}
	 *            string input string
	 * @return {String} 轉換過的 string
	 * @since 2006/10/27 16:36
	 * @see from lib/perl/BaseF.pm (or program/database/BaseF.pm)
	 * @_memberOf _module_
	 */
	checkSQLInput = function(string) {
		if (!string)
			return '';

		// 限制長度 maximum input length
		if (maxInput && string.length > maxInput)
			string = string.slice(0, maxInput);

		return string
		// for \uxxxx
.replace(/\\u([\da-f]{4})/g, function($0, $1) {
			return String.fromCharCode($1);
		}).replace(/\\/g, '\\\\')

		// .replace(/[\x00-\x31]/g,'')
		.replace(/\x00/g, '\\0')

		// .replace(/\x09/g,'\\t')
		// .replace(/\x1a/g,'\\Z')

		// .replace(/\r\n/g,' ')
		.replace(/\r/g, '\\r').replace(/\n/g, '\\n')

		// .replace(/"/g,'\\"')
		.replace(/'/g, "''");
	};

	_// JSDT:_module_
	.
	/**
	 * 轉換字串成數值，包括分數等。分數亦將轉為分數。
	 * 
	 * @param {String}
	 *            number 欲轉換之值。
	 * @return
	 * @_memberOf _module_
	 */
	parse_number = function(number) {
		var m = typeof number;
		if (m === 'number')
			return number;
		if (!number || m !== 'string')
			return NaN;

		number = number.replace(/(\d),(\d)/g, '$1$2');
		if (m = number.match(/(-?[\d.]+)\s+([\d.]+)\/([\d.]+)/)) {
			var p = parseFloat(m[1]), q = parseFloat(m[2]) / parseFloat(m[3]);
			return p + (m[1].charAt(0) === '-' ? -q : q);
		}
		if (m = number.match(/(-?[\d.]+)\/([\d.]+)/))
			// new quotient(m[1],m[2])
			return parseFloat(m[1]) / parseFloat(m[2]);

		if (false) {
			try {
				return isNaN(m = parseFloat(number)) ?
				// TODO: security hole
				eval(number) : m;
			} catch (e) {
				return m;
			}
		}
	};

	/**
	 * filter object. .map() of {Object}<br />
	 * for Object.filter()
	 * 
	 * @param {Object}object
	 *            object to filter
	 * @param {Function}filter
	 *            callback/receiver to filter the value. <br />
	 *            filter(value, key, object) is true: will be preserved.
	 * 
	 * @returns filtered object
	 */
	function Object_filter(object, filter) {
		if (typeof filter !== 'function' || typeof object !== 'object')
			return object;

		var key, delete_keys = [];
		for (key in object) {
			if (!filter(object[key], key, object))
				// 在這邊 delete object[key] 怕會因執行環境之不同實作方法影響到 text 的結構。
				delete_keys.push(key);
		}

		if (delete_keys.length > 0)
			delete_keys.forEach(function(key) {
				delete object[key];
			});
	}

	var has_spread_operator, clone_Object;
	try {
		has_spread_operator = eval('clone_Object=function(object){return {...object};};');
	} catch (e) {
		// TODO: handle exception
	}

	/**
	 * clone object.<br />
	 * for Object.clone()
	 * 
	 * @param {Object}object
	 *            object to clone
	 * @param {Boolean}deep
	 *            deep clone / with trivial
	 * 
	 * @returns {Object}cloned object
	 * 
	 * @see clone() @ CeL.data
	 * @see https://www.bram.us/2018/01/10/javascript-removing-a-property-from-an-object-immutably-by-destructuring-it/
	 * @see `return {...object}` :
	 *      https://juejin.im/post/5b2a186cf265da596d04a648
	 */
	var Object_clone = function clone(object, deep, copy_to) {
		if (!object || typeof object !== 'object') {
			// assert: object is 純量。
			return object;
		}

		// for read-only??
		// return Object.create(object);

		if (deep) {
			// @see
			// http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-an-object
			return JSON.parse(JSON.stringify(object));
		}

		if (!copy_to) {
			if (Array.isArray(object)) {
				// for {Array}
				return object.clone();
			}

			if (clone_Object) {
				return clone_Object(object);
			}
		}

		// shallow clone Object.
		return Object.assign(copy_to || Object.create(
		// copy prototype
		Object.getPrototypeOf(object)), object);
	};

	/**
	 * Test if no property in the object.<br />
	 * for Object.is_empty(), Object.isEmpty()
	 * 
	 * for ArrayLike, use .length instead. This method includes non-numeric
	 * property.
	 * 
	 * @param {Object}object
	 *            object to test
	 * 
	 * @returns {Boolean}the object is empty.
	 * 
	 * @see CeL.is_empty_object()
	 * @see http://stackoverflow.com/questions/3426979/javascript-checking-if-an-object-has-no-properties-or-if-a-map-associative-arra
	 */
	function Object_is_empty(object) {
		if (object !== null)
			for ( var key in object) {
				if (!Object.hasOwn || Object.hasOwn(object, key)) {
					return false;
				}
			}
		return true;
	}

	// Object.clean() 從 object 中移除所有項目。
	// 通常用於釋放記憶體。 Usually used to release memory.
	// cf. array.truncate()
	// {Boolean|Natural}deepth=1: 清理到 object 底下底幾層。
	function Object_clean(object, deepth) {
		if (!object || typeof object !== 'object')
			return;

		if (deepth > 0 && deepth !== true)
			deepth--;

		Object.keys(object).forEach(function(key) {
			// 當有引用重要物件時，不應該採用 deep。
			if (deepth)
				Object_clean(object[key], deepth);
			delete object[key];
		});
	}

	// Object.reverse_key_value({a:b}) → {b:a}
	function Object_reverse_key_value(object) {
		var new_object = Object.create(null);
		if (!object)
			return new_object;

		for ( var key in object) {
			if (!Object.hasOwn || Object.hasOwn(object, key)) {
				new_object[object[key]] = key;
			}
		}
		return new_object;
	}

	/**
	 * Count properties of the object.<br />
	 * for Object.size()
	 * 
	 * for ArrayLike, use .length instead. This method will count non-numeric
	 * properties.
	 * 
	 * @param {Object}object
	 *            object to count properties
	 * 
	 * @returns {Boolean}properties count
	 * 
	 * @see http://stackoverflow.com/questions/5223/length-of-a-javascript-object-that-is-associative-array
	 */
	function Object_size(object) {
		if (object === null)
			return 0;
		var count = 0;
		for ( var key in object) {
			if (!Object.hasOwn || Object.hasOwn(object, key)) {
				count++;
			}
		}
		return count;
	}

	function the_same_content(value_1, value_2) {
		if (value_1 === value_2)
			return true;
		// @see Object.is()
		// check NaN. May use Number.isNaN() as well.
		if (value_1 !== value_1 && value_2 !== value_2)
			return true;
		if (typeof value_1 !== 'object' || typeof value_2 !== 'object')
			return false;

		// TODO: adapt for Map, Set, ...

		var keys_1 = Object.keys(value_1), keys_2 = Object.keys(value_2);
		if (keys_1.length !== keys_2.length)
			return false;

		for (var index = 0; index < keys_1.length; index++) {
			var key = keys_1[index];
			if (!(key in value_2)
					|| !the_same_content(value_1[key], value_2[key]))
				return false;
		}

		return true;
	}

	set_method(Object, {
		filter : Object_filter,
		clone : Object_clone,
		is_empty : Object_is_empty,
		the_same_content : the_same_content,
		clean : Object_clean,
		reverse_key_value : Object_reverse_key_value,
		size : Object_size
	});

	// 非 deep, 淺層/表面 clone/copy: using Array.from().
	var Array_clone = Array.prototype.slice;
	Array_clone = Array_clone.call.bind(Array_clone);
	(function() {
		var a = [ 2, 3 ], b = Array_clone(a);
		if (b.join(',') !== '2,3')
			Array_clone = function clone() {
				// Array.prototype.slice.call(array);
				// library_namespace.get_tag_list():
				// Array.prototype.slice.call(document.getElementsByTagName(tagName));
				return this.slice(0);
			};
	})();
	// or use Array.from(): https://kknews.cc/zh-tw/code/x625ppg.html
	// Array.prototype.clone = function() { return Array.from(this); };

	// 將 element_toPush 加入 array_pushTo 並篩選重複的（本來已經加入的並不會變更）
	// array_reverse[value of element_toPush]=index of element_toPush
	function pushUnique(array_pushTo, element_toPush, array_reverse) {
		if (!array_pushTo || !element_toPush)
			return array_pushTo;
		var i;
		if (!array_reverse)
			for (array_reverse = new Array, i = 0; i < array_pushTo; i++)
				array_reverse[array_pushTo[i]] = i;

		if (typeof element_toPush != 'object')
			i = element_toPush, element_toPush = new Array, element_toPush
					.push(i);

		var l;
		for (i in element_toPush)
			if (!array_reverse[element_toPush])
				// array_pushTo.push(element_toPush),array_reverse[element_toPush]=array_pushTo.length;
				array_reverse[array_pushTo[l = array_pushTo.length] = element_toPush[i]] = l;

		return array_pushTo;
	}

	/**
	 * append/merge to original Array.<br />
	 * Array.prototype.concat does not change the existing arrays, it only
	 * returns a copy of the joined arrays.
	 * 
	 * @param {Array}array
	 *            添加至此 Array list.
	 * @param {Array}list
	 *            欲添加的 Array list. TODO: 若非Array，則會當作單一元素 .push()。
	 * @param {Integer}index
	 *            從 list[index] 開始 append。
	 * 
	 * @returns this
	 */
	function append_to_Array(list, index) {
		if (Array.isArray(list) && (index ? 0 < (index = parseInt(index))
		// TODO: for index < 0
		&& index < list.length : list.length > 0)) {
			if (index > 0) {
				list = Array.prototype.slice.call(list, index);
			}
			// 警告: 當 list 太大時可能產生 RangeError: Maximum call stack size exceeded
			try {
				Array.prototype.push.apply(this, list);
			} catch (e) {
				// e.g., 'Maximum call stack size exceeded'
				index = 0;
				while (index < list.length)
					Array.prototype.push.call(this, list[index++]);
			}
			// return this.concat(list);
			// return Array.prototype.concat.apply(this, arguments);
		}

		return this;
	}

	// count elements that has something
	if (false) {
		Array.prototype.count_things = function() {
			return this.reduce(function(count, e) {
				return e ? count + 1 : count;
			}, 0);
		};
	}

	// Array.prototype.frequency()
	// values count, 發生率
	function array_frequency(select_max, target) {
		var count = 0;
		if (target !== undefined) {
			this.forEach(library_namespace.is_RegExp(pattern) ? function(item) {
				if (target.test(item))
					count++;
			} : function(item) {
				if (item === target)
					count++;
			});
			return count;
		}

		// new Map()
		var hash = Object.create(null);
		if (!select_max) {
			this.forEach(function(item) {
				if (item in hash) {
					hash[item]++;
				} else
					hash[item] = 1;
			});
			return hash;
		}

		var max_count = 0, max_index;
		this.forEach(function(item, index) {
			var count;
			if (item in hash) {
				count = ++hash[item];
			} else
				count = hash[item] = 1;
			if (select_max === true) {
				if (max_count < count) {
					max_count = count;
					max_index = index;
				}
			} else if (max_count <= count) {
				if (max_count < count
				// select_max = 1: maximum case 也選擇較大的 item
				// select_max = -1: min case 選擇較小的item
				|| !(select_max < 0
				//
				? this[max_index] < (isNaN(item) ? item : +item)
				//
				: this[max_index] > (isNaN(item) ? item : +item)))
					max_index = index;
				max_count = count;
			}
		}, this);
		// hash[this[max_index]] === max_count
		return {
			hash : hash,
			value : this[max_index],
			count : max_count,
			index : max_index
		};
	}

	/**
	 * <code>

	// to inherit from native object:

	function Child() {
		// Parent: native object
		var instance = new Parent;

		// do something need to apply arguments
		;

		// The same as `instance.__proto__ = Child.prototype;`
		Object.setPrototypeOf(instance, Child.prototype);
		// ↑ ** if there is no prototype chain, we should copy the properties manually.

		// do something need to initialize
		;

		return instance;
	}

	// setup inheritance: only works for prototype chain.
	// The same as `Child.prototype = new Parent;`
	Object.setPrototypeOf(Child.prototype, Parent.prototype);

	// setup Child.prototype.attributes
	Child.prototype.property = property;
	Child.prototype.method = function () { };


	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create

	</code>
	 */

	// subclass and inherit from Array
	// 注意: 此處的繼承重視原生 Array 之功能，因此 instance instanceof SubArray 於 IE8 等舊版中不成立。
	function new_Array_instance(array_type, no_proto, items) {
		var instance;
		// 除 Array 外，其他 TypedArray，如 Uint32Array 有不同行為。
		// 此處僅處理 constructor。
		if (array_type === Array)
			if (items && 1 < items.length)
				// 將 items copy 至 this instance。
				Array.prototype.push.apply(instance = new Array, items);
			else
				instance = new Array(items && items.length ? items[0] : 0);
		else
			instance = items ? new array_type(items[0]) : new array_type();

		if (no_proto)
			// if there is no prototype chain, we should copy the properties
			// manually.
			// TODO: 此方法極無效率！此外，由於並未使用 .prototype，因此即使採用 delete
			// instance[property]，也無法得到預設值，且不能探測是否為 instance 特有 property。
			set_method(instance, this.prototype, null);
		else {
			Object.setPrototypeOf(instance, this.prototype);
			// TODO: NG:
			// instance.prototype = Object.create(this.prototype);
		}

		return instance;
	}

	function Array_derive(sub_class, array_type) {
		if (!array_type)
			array_type = Array;

		Object.setPrototypeOf(sub_class.prototype, array_type.prototype);
		// TODO: NG:
		// sub_class.prototype = Object.create(array_type.prototype);

		return new_Array_instance.bind(sub_class, array_type, false);
	}

	function Array_derive_no_proto(sub_class, array_type) {
		// e.g., IE8
		return new_Array_instance.bind(sub_class, array_type || Array, true);
	}

	/**
	 * 
	 * @example<code>

	function SubArray() {
		var instance = SubArray.new_instance(arguments);

		// do something need to initialize
		;

		return instance;
	}
	// setup inheritance
	SubArray.new_instance = Array.derive(SubArray);
	// setup SubArray.prototype
	SubArray.prototype.property = property;
	SubArray.prototype.method = function () { };


	// manually test code

	// setup

	// see data.code.compatibility.
	if (!Object.setPrototypeOf && typeof {}.__proto__ === 'object')
		Object.setPrototypeOf = function (object, proto) { object.__proto__ = proto; return object; };

	Array.derive = Object.setPrototypeOf ? Array_derive : Array_derive_no_proto;


	// main test code

	function SubArray() {
		var instance = new_instance(arguments);

		// do something need to initialize
		;

		return instance;
	}
	// setup inheritance
	var new_instance = Array.derive(SubArray);
	// setup SubArray.prototype
	SubArray.prototype.last = function () { return this.at(-1); };

	var a = new SubArray(2, 7, 4), b = [4]; a[6] = 3; a.push(8);
	if (Object.setPrototypeOf && !(a instanceof SubArray) || !(a instanceof Array) || a[1] !== 7 || a.length !== 8 || a.last() !== 8 || b.last) console.error('failed');



	function SubUint32Array() {
		var instance = SubUint32Array.new_instance(arguments);

		// do something need to initialize
		;

		return instance;
	}
	// setup inheritance
	SubUint32Array.new_instance = Array.derive(SubUint32Array, Uint32Array);
	// setup SubUint32Array.prototype
	SubUint32Array.prototype.last = function () { return this.at(-1); };

	var a = new SubUint32Array(8, 7, 4), b = new Uint32Array(4); a[6] = 3; a[7] = 5; a[8] = 4;
	if (Object.setPrototypeOf && !(a instanceof SubUint32Array) || !(a instanceof Uint32Array) || a[8] || a[6] !== 3 || a.length !== 8 || a.last() !== 5 || b.last) console.error('failed');


	</code>
	 */

	set_method(Array, {
		// for data.clone()
		clone : Array_clone,
		derive : Object.setPrototypeOf ? Array_derive : Array_derive_no_proto,
		intersection : has_native_Map ? Array_intersection_Map
				: Array_intersection
	});

	// ------------------------------------
	// comparator, compare_function, sort_function for array.sort()

	// 用於由小至大升序序列排序, ascending, smallest to largest, A to Z。
	// 注意：sort 方法會在原地排序 Array 物件。
	// @see std::less<int>()
	function general_ascending(a, b) {
		// '12/34', '56/78' 可以比大小，但不能相減。
		// 但這對數字有問題: '1212'<'987'
		// 若對一般物件，採用 .sort() 即可。
		return a < b ? -1 : a > b ? 1 : 0;
	}

	function general_descending(a, b) {
		return a < b ? 1 : a > b ? -1 : 0;
	}

	function Number_ascending(a, b) {
		// 升序序列排序: 小→大
		return a - b;

		// '12/34', '56/78' 可以比大小，但不能相減。
		// 但這對數字有問題: '1212'<'987'
		// 若對一般物件，採用 .sort() 即可。
		return a < b ? -1 : a > b ? 1 : 0;

		return _1 - _2;
		return Math.sign(a - b);
	}

	function Number_descending(a, b) {
		// 降序序列排序: 大→小
		return b - a;

		return a < b ? 1 : a > b ? -1 : 0;
	}

	_.general_ascending = general_ascending;
	_.general_descending = general_descending;
	_.ascending = Number_ascending;
	_.descending = Number_descending;

	/**
	 * 以二分搜尋法(binary search)搜尋已排序的 array。<br />
	 * binary search an Array.<br /> ** 注意：使用前須先手動將 array 排序！<br />
	 * TODO: 依資料分布:趨近等差/等比/對數等，以加速搜尋。
	 * 
	 * cf. Array.prototype.search()
	 * 
	 * @param {Array}array
	 *            由小至大已排序的 array。
	 * @param value
	 *            value to search.
	 * @param {Object}[options]
	 *            附加參數/設定特殊功能與選項 options = {<br />
	 *            found : found_callback(index, not_found:
	 *            closed/is_near/未準確相符合，僅為趨近、近似),<br />
	 *            near : not_found_callback(較小的 index, not_found),<br />
	 *            start : start index,<br />
	 *            last : last/end index,<br />
	 *            length : search length.<br />
	 *            <em>last 與 length 二選一。</em><br /> }
	 * 
	 * @returns default: 未設定 options 時，未找到為 NOT_FOUND(-1)，找到為 index。
	 * 
	 * @since 2013/3/3 19:30:2 create.<br />
	 */
	function search_sorted_Array(array, value, options) {
		if (library_namespace.is_RegExp(value)
				&& (!options || !options.comparator)) {
			// 處理搜尋 {RegExp} 的情況: 此時回傳最後一個匹配的 index。欲找首次出現，請用 first_matched()。
			if (value.global) {
				library_namespace
						.error('search_sorted_Array: 當匹配時，不應採用 .global！ '
								+ value);
			}
			if (!options) {
				options = Object.create(null);
			}
			options.comparator = function(v) {
				return value.test(v) ? -1 : 1;
			};
			if (!('near' in options)) {
				options.near = true;
			}
		} else if (!options
		//
		&& (typeof value === 'object' || typeof value === 'function')) {
			options = value;
			value = undefined;
		}

		if (typeof options === 'function') {
			options = {
				comparator : options
			};
		} else if (typeof options === 'boolean' || Array.isArray(options)) {
			options = {
				found : options
			};
		} else if (library_namespace.is_digits(options)) {
			options = {
				start : options
			};
		} else if (!library_namespace.is_Object(options)) {
			options = Object.create(null);
		}

		var callback, comparison, not_found = true,
		//
		comparator = options.comparator
				|| (typeof array[0] === 'number' ? Number_ascending
						: search_sorted_Array.default_comparator),
		//
		start = (options.start | 0) || 0, small = start, index = start,
		//
		big = (options.last | 0)
				|| (options.length ? options.length | 0 + start - 1
						: array.length - 1);

		// main comparare loop
		// http://codereview.stackexchange.com/questions/1480/better-more-efficient-way-of-writing-this-javascript-binary-search
		while (true) {
			if (small > big) {
				if (comparison > 0 && index > start)
					// 修正成較小的 index。
					// 除非是 [2,3].search_sorted(1.5,{found:1})，
					// 否則 assert: big + 1 === start === index
					index--;
				break;

			} else {
				// 首引數應該採用最多資訊者，因此array[]擺在value前。
				comparison = comparator(array[index = (small + big) >> 1],
						value
				// , index
				);

				// 若下一 loop 跳出，則此時之狀態為
				// start = index = big; value 介於 array[index±1]。
				// 或
				// start = index, big; value 介於兩者間。

				if (comparison > 0) {
					// 往前找
					big = index - 1;
					// 若下一 loop 跳出，則此時之狀態為
					// big, start = index
					// value 介於兩者間。

				} else if (comparison < 0) {
					// 往後找
					small = index + 1;
					// 若下一 loop 跳出，則此時之狀態為
					// index = big, small
					// value 介於兩者間。

				} else {
					not_found = false;
					break;
				}
			}
		}

		// 挑一個可用的。
		callback = not_found && options.near || options.found;
		// console.log([ not_found, callback, index ]);

		return Array.isArray(callback)
		// treat options.found as mapper
		? callback[index]
		//
		: typeof callback === 'function' ? callback.call(array, index,
				not_found)
		//
		: not_found && (!callback
		// 當 library_namespace.is_RegExp(value) 時，callback 僅表示匹不匹配。
		|| library_namespace.is_RegExp(value)
		// assert: 此時 index === 0 or array.length-1
		// 這樣會判別並回傳首個匹配的。
		&& (index === 0 && comparator(array[index]) > 0)) ? NOT_FOUND
		// default: return index of value
		: index;
	}

	search_sorted_Array.default_comparator = general_ascending;

	_.search_sorted_Array = search_sorted_Array;

	// return first matched index.
	// assert: array 嚴格依照 mismatched→matched，有個首次出現的切分點。
	function first_matched(array, pattern, get_last_matched) {
		if (!array || !pattern) {
			return NOT_FOUND;
		}
		var first_matched_index = array.length;
		if (first_matched_index === 0) {
			return NOT_FOUND;
		}
		var is_RegExp = library_namespace.is_RegExp(pattern), is_Function = !is_RegExp
				&& library_namespace.is_Function(pattern),
		//
		last_mismatched_index = 0;
		if (is_RegExp && pattern.global) {
			library_namespace.error('first_matched: 當匹配時，不應採用 .global！ '
					+ pattern);
		}

		var matched;
		while (last_mismatched_index < first_matched_index) {
			// binary search
			var index = (last_mismatched_index + first_matched_index) / 2 | 0;
			matched = is_RegExp ? pattern.test(array[index])
					: is_Function ? pattern(array[index]) : array[index]
							.includes(pattern);
			if (false && matched && is_RegExp) {
				library_namespace.log(last_mismatched_index + '-[' + index
						+ ']-' + first_matched_index + '/' + array.length
						+ ': ' + matched + ' ' + pattern);
				console.log(array[index].match(pattern));
			}
			if (get_last_matched ? !matched : matched) {
				first_matched_index = index;
			} else if (last_mismatched_index === index) {
				break;
			} else {
				last_mismatched_index = index;
			}
		}

		if (get_last_matched) {
			if (last_mismatched_index === 0 && !matched) {
				library_namespace.debug('Not found.', 3, 'first_matched');
				return NOT_FOUND;
			}
			library_namespace.debug('return ' + last_mismatched_index, 3,
					'first_matched');
			return last_mismatched_index;
		}

		return first_matched_index === array.length ? NOT_FOUND
				: first_matched_index;
	}

	_.first_matched = first_matched;

	/**
	 * merge / combine string with duplicated characters.<br />
	 * merge 2 array by order, without order change<br />
	 * 警告: 此法僅於無重複元素時有效。
	 * 
	 * @param {Array}sequence_list
	 *            sequence list to merge
	 * 
	 * @returns {Array}merged chain
	 * 
	 * @see find duplicate part of 2 strings<br />
	 *      https://en.wikipedia.org/wiki/String_metric
	 *      https://en.wikipedia.org/wiki/Shortest_common_supersequence_problem
	 *      http://codegolf.stackexchange.com/questions/17127/array-merge-without-duplicates
	 *      https://en.wikipedia.org/wiki/Topological_sorting
	 */
	function merge_unduplicated_sequence(sequence_list) {
		var map = Object.create(null);

		function add_node(element, index) {
			var chain = map[element];
			if (!chain)
				chain = map[element]
				// [ 0: possible backward, 1: possible foreword ]
				= [ Object.create(null), Object.create(null) ];
			if (index > 0)
				// 登記前面的。
				chain[0][this[index - 1]] = true;
			if (index + 1 < this.length)
				// 登記前面的。
				chain[1][this[index + 1]] = true;
			return;
			// 不必記太多，反而稱加操作複雜度。上面的相當於把 'abc' 拆成 'ab', 'bc'
			var i = 0;
			for (; i < index; i++)
				// 登記前面的。
				chain[0][this[i]] = true;
			// i++: skip self
			for (i++; i < this.length; i++)
				// 登記後面的。
				chain[1][this[i]] = true;
		}

		sequence_list.forEach(function(sequence) {
			if (typeof sequence === 'string')
				sequence = sequence.split('');
			if (typeof sequence.forEach === 'function'
			// && Array.isArray(sequence)
			) {
				sequence.forEach(add_node, sequence);
			} else {
				library_namespace.warn(
				//
				'merge_unduplicated_sequence: Invalid sequence: [' + sequence
						+ ']');
			}
		});

		// 此法僅於無重複時有效。
		/**
		 * result chain / sequence.<br />
		 * result = [ start of chain, ends of chain ]
		 * 
		 * @type {Array}
		 */
		var result = [ [], [] ];
		while (true) {
			/** {Array}temporary queue */
			var queue = [ [], [] ],
			/** {Array}elements added */
			added = [];
			for ( var element in map) {
				if (element in added)
					continue;
				// 先考慮添入起首，再考慮結尾。
				if (Object.is_empty(map[element][0])) {
					queue[0].push(element);
					// 登記。
					added.push(element);
					continue;
				}
				if (Object.is_empty(map[element][1])) {
					queue[1].push(element);
					// 登記。
					added.push(element);
					continue;
				}
			}

			if (added.length === 0)
				// nothing can do.
				// e.g., a ring / cycle, 有重複。
				break;

			if (queue[0].length === 1)
				result[0].push(queue[0][0]);
			else if (queue[0].length > 0) {
				// 有多重起頭。
				throw new Error('Invalid starts: ' + queue[0]);
			}
			if (queue[1].length === 1)
				result[1].unshift(queue[1][0]);
			else if (queue[1].length > 0) {
				// 有多重結尾。
				throw new Error('Invalid ends: ' + queue[1]);
			}

			// remove node.
			added.forEach(function(element) {
				var data = map[element];
				for ( var node in data[0])
					delete map[node][1][element];
				for ( var node in data[1])
					delete map[node][0][element];
				delete map[element];
			});
		}

		result = result[0].concat(result[1]);
		return result;
	}

	_.merge_sequence = merge_unduplicated_sequence;

	// ------------------------------------

	// TODO: add `Promise` version

	/**
	 * 依照順序從 index 至 last 執行 for_each。
	 * 
	 * @examples <code>

	function for_item(run_next, index, index, list) {
		// do something
		run_next();
	}
	CeL.run_serial(for_item, last_NO, first_NO, function() { 'done'; });

	function for_item(run_next, item, index, list) {
		// do something
		run_next();
	}
	CeL.run_serial(for_item, list, function() { 'done'; });

	 * </code>
	 * 
	 * @param {Function}for_each
	 *            run for_each(run_next, item, index, list[, get_status]) for
	 *            every elements. Must handle exception yourself.
	 *            {Object}function get_status(): 狀態探測函數。
	 * @param {Integer|Array}last
	 *            last index or {Array}list
	 * @param {Integer|Array}[index]
	 *            start index or [start index, last index].<br />
	 *            default: starts from 0.
	 * @param {Function}[callback]
	 *            Will run after all elements executed
	 * @param {Object}[_this]
	 *            passed to for_each
	 * @param {Boolean}[parallelly]
	 *            run parallelly
	 * 
	 * @see CeL.data.code.thread
	 */
	function run_serial_asynchronous(for_each, last, index, callback, _this,
			parallelly) {
		var list;
		// initialization
		if (Array.isArray(last)) {
			list = last;
			last = list.length;
		}
		if (typeof index === 'function') {
			// shift arguments.
			parallelly = _this;
			_this = callback;
			callback = index;
			index = 0;
		} else if (Array.isArray(index)) {
			last = index[1];
			index = index[0];
		} else {
			// default: starts from 0.
			index |= 0;
		}

		// console.log([ for_each, last, index, callback, _this, parallelly ]);

		// ----------------------------------------------------------
		// main loop for serial
		function run_next() {
			// 預留可變動 list 的空間。
			if (list ? index === list.length : index > last) {
				// done.
				typeof callback === 'function' && callback.call(_this);
				return;
			}

			library_namespace.debug(index + '/' + last, 3,
					'run_serial_asynchronous');
			// 先增加 index，預防 callback 直接 call run_next()。
			var _index = index++;
			var _arguments = [ run_next, list ? list[_index] : _index, _index,
					list ];
			if (_this && _this.run_interval >= 0) {
				library_namespace.log_temporary(index + '/' + last
						+ ' Waiting ' + _this.run_interval + ' ms to run');
				setTimeout(function() {
					for_each.apply(_this, _arguments);
				}, _this.run_interval);
			} else {
				for_each.apply(_this, _arguments);
			}
		}

		if (!parallelly
		// parallelly 在這情況下不會執行 callback。
		|| !(index <= last)) {
			run_next();
			return;
		}

		// ----------------------------------------------------------
		// parallelly

		function get_status() {
			return {
				left : left
			};
		}

		var check_left = function(exit_loop) {
			if (--left === 0 || exit_loop === 'quit') {
				// run once only
				check_left = library_namespace.null_function;
				typeof callback === 'function' && callback.call(_this);
				return;
			}
			library_namespace.debug(left + ' left...', 3,
					'run_parallel_asynchronous');
		};

		if (_this) {
			for_each = for_each.bind(_this);
		}

		var left = 0;
		if (list) {
			if (list.length === 0) {
				setImmediate(check_left, 'quit');
			} else {
				list.forEach(function(item, index) {
					left++;
					setImmediate(for_each, check_left, item, index, list,
							get_status);
				});
			}
			return;
		}

		for (; index <= last; index++, left++) {
			setImmediate(for_each, check_left, index, index, list, get_status);
		}

	}

	_.run_serial = run_serial_asynchronous;

	// 警告: 採用非同步的方法，獲得網址的順序不一定。因此不能採用 .push()，而應採用 [index] 的方法來記錄。
	function run_parallel_asynchronous(for_each, last, index, callback, _this) {
		run_serial_asynchronous(for_each, last, index, callback, _this, true);
	}

	_.run_parallel = run_parallel_asynchronous;

	// ---------------------------------------------------------------------//

	if (false) {
		CeL.edit_distance('from A', 'from B');
	}

	// Levenshtein distance (edit distance)
	// @see LCS()
	// https://en.wikipedia.org/wiki/Levenshtein_distance#Iterative_with_two_matrix_rows
	// http://www.codeproject.com/Articles/13525/Fast-memory-efficient-Levenshtein-algorithm
	// http://locutus.io/php/strings/levenshtein/
	// https://github.com/component/levenshtein/blob/master/index.js
	// https://en.wikibooks.org/wiki/Algorithm_Implementation/Strings/Levenshtein_distance
	// http://jsperf.com/levenshtein-distance-2
	function Levenshtein_distance(string_1, string_2) {
		string_1 = (string_1 || '').chars(true);
		string_2 = (string_2 || '').chars(true);

		var length_1 = string_1 && string_1.length || 0, length_2 = string_2
				&& string_2.length || 0;
		// degenerate cases
		if (length_1 === 0) {
			return length_2;
		}
		if (length_2 === 0) {
			return length_1;
		}
		if (length_1 === length_2 && string_1 === string_2) {
			return 0;
		}

		// create two work vectors of integer distances
		var vector_1 = new Array(length_2 + 1), i = 0;
		// initialize vector_1 (the previous row of distances)
		// this row is A[0][i]: edit distance for an empty string_1
		// the distance is just the number of characters to delete from string_2
		for (; i <= length_2; i++) {
			vector_1[i] = i;
		}

		for (i = 0; i < length_1; i++) {
			// calculate vector_2 (current row distances) from the previous row
			// vector_1

			// use formula to fill in the rest of the row
			for (var j = 0,
			// first element of vector_2 is A[i+1][0]
			// edit distance is delete (i+1) chars from string_1 to match empty
			// string_2
			last_vector_2 = i + 1, vector_2 = [ last_vector_2 ]; j < length_2; j++) {
				last_vector_2 = Math.min(
				// The cell immediately above + 1
				last_vector_2 + 1,
				// The cell immediately to the left + 1
				vector_1[j + 1] + 1,
				// The cell diagonally above and to the left plus the cost
				vector_1[j] + (/* cost */string_1[i] === string_2[j] ? 0 : 1));
				vector_2.push(last_vector_2);
			}

			// copy vector_2 (current row) to vector_1 (previous row) for next
			// iteration
			vector_1 = vector_2;
		}

		return vector_2[length_2];
	}

	_.edit_distance = Levenshtein_distance;

	// ------------------------------------

	/**
	 * Get LCS length / trace array
	 * 
	 * @param {Array}from
	 * @param {Array}to
	 * 
	 * @returns {Array}
	 * 
	 * @since 2017/4/5 10:0:36
	 * 
	 * @see https://en.wikipedia.org/wiki/Longest_common_subsequence_problem
	 *      https://github.com/GerHobbelt/google-diff-match-patch
	 */
	function LCS_length(from, to, get_trace_array) {
		if (typeof from === 'string')
			from = from.chars(true);
		if (typeof to === 'string')
			to = to.chars(true);
		// assert: Array.isArray(from) && Array.isArray(from)

		// console.trace([ from.length, to.length ]);
		var get_length_only = !get_trace_array,
		//
		from_length = from.length, to_length = to.length,
		// TODO: 當文件有過多行時的處置方式。
		trace_Array = from_length * (get_length_only ? 2 : to_length);
		trace_Array = typeof Uint16Array === 'function' ? new Uint16Array(
				trace_Array) : new Array(trace_Array).fill(0);

		// loop of ↓
		for (var to_index = 0, trace_index = 0, last_trace_index = trace_index
				- from_length; to_index < to_length; to_index++) {
			if (get_length_only) {
				if (to_index % 2 === 0) {
					last_trace_index = 0;
					// assert: 已經 = from_length
					// trace_index = from_length;
				} else {
					// assert: 已經 = from_length
					// last_trace_index = from_length;
					trace_index = 0;
				}
			}
			// loop of →
			for (var to_element = to[to_index], from_index = 0; from_index < from_length; from_index++, trace_index++, last_trace_index++) {
				// @see LCS function
				if (to_element === from[from_index]) {
					// to[to_index] === from[from_index]
					trace_Array[trace_index] =
					// 這條件也保證了 last_trace_index > 0
					from_index > 0 && to_index > 0 ? trace_Array[last_trace_index - 1] + 1
							: 1;
				} else {
					// to[to_index] !== from[from_index]
					trace_Array[trace_index] = from_index > 0 ? trace_Array[trace_index - 1]
							: 0;
					if (last_trace_index >= 0
							&& trace_Array[trace_index] < trace_Array[last_trace_index]) {
						trace_Array[trace_index] = trace_Array[last_trace_index];
					}
				}
			}
		}

		if (get_length_only) {
			return trace_Array[trace_index - 1];
		}

		if (library_namespace.is_debug(3)) {
			library_namespace.debug('to\\f\t' + from.join('\t') + '\n'
					+ '-'.repeat(8 * (from.length + 2)));
			for (var to_index = 0; to_index < to_length; to_index++) {
				library_namespace.debug(to[to_index]
						+ '\t'
						+ trace_Array.slice(to_index * from_length,
								(to_index + 1) * from_length).join('\t'));
			}
			library_namespace.debug('-'.repeat(8 * (from.length + 3)));
		}

		// trace_Array.LCS_length = trace_Array[trace_index - 1];
		return trace_Array;
	}

	_.LCS_length = LCS_length;

	if (false) {
		diff_list = CeL.LCS(old_text, new_text, {
			// line : true,
			diff : true
		});

		diff_list.forEach(function(diff_pair) {
			// added_text === inserted_text
			// const [removed_text, added_text] = diff;
			var removed_text = diff_pair[0], added_text = diff_pair[1];
		});
	}

	if (false) {
		diff_list = CeL.LCS('from A', 'from B', {
			diff : true
		});

		diff_list = CeL.LCS('from A', 'from B', {
			with_diff : true
		});
	}

	/**
	 * Get LCS / diff
	 * 
	 * Longest Common Subsequence 最長公共子序列
	 * 
	 * 警告：在 line_mode，"A \n"→"A\n" 的情況下，"A" 會同時出現在增加與刪除的項目中，此時必須自行檢測排除。
	 * 
	 * @param {Array|String}from
	 *            from text
	 * @param {Array|String}to
	 *            to text
	 * @param {Object|String}options
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @returns {Array|String}
	 */
	function LCS(from, to, options) {
		// 前置作業。
		options = library_namespace.setup_options(options);

		var treat_as_String = 'treat_as_String' in options ? options.treat_as_String
				: typeof from === 'string' && typeof to === 'string',
		// options.line : 強制採用行模式，連輸入{String|Array}都會以'\n'結合。
		line_mode = 'line' in options ? options.line : treat_as_String
				&& (from.includes('\n') || to.includes('\n')),
		//
		separator = options.separator || (line_mode ? '\n' : '');
		if (false) {
			library_namespace.debug('separator: ' + JSON.stringify(separator)
					+ (line_mode ? '，採用行模式。' : ''), 3, 'LCS');
		}
		if (typeof from === 'string') {
			from = separator ? from.split(separator) : from.chars(true);
		} else if (!from) {
			from = [];
		}
		if (typeof to === 'string') {
			to = separator ? to.split(separator) : to.chars(true);
		} else if (!to) {
			to = [];
		}
		// assert: Array.isArray(from) && Array.isArray(from)

		var from_length = from.length, from_index = from_length - 1, to_index = to.length - 1,
		// Completed LCS Table
		trace_Array = options.trace_Array || LCS_length(from, to, true),
		// 獨特/獨有的 exclusive 元素列表。
		diff_list = [], from_unique, to_unique,
		// flags
		get_all = !!options.all,
		// get index instead of contents
		get_index = options.index || get_all,
		// get diff as well
		get_diff = !!(options.diff || options.with_diff),
		// get diff ONLY
		diff_only = get_diff && !get_all && !options.with_diff,
		//
		try_to_merge_diff = !!options.try_to_merge_diff;

		// ---------------------------------------
		// 工具函數。

		function unique(list) {
			return list.map(function(result_Array) {
				// assert: .join() 與 .split() 採用的是 result_Array 不包含的字串。
				return result_Array.join('\0');
			}).unique().map(function(result_Array) {
				return result_Array.split('\0');
			});
		}

		function normalize_unique(_unique, _this) {
			if (!Array.isArray(_unique)) {
				// return '';
				// return;
				return treat_as_String ? '' : _unique;
				// return [];
			}

			// _unique = [ from index, to index ]
			if (options.diff_line) {
				return _unique;
			}

			var index = _unique[0];
			if (index === _unique[1]) {
				if (_unique === from_unique) {
					from_unique = [ index, index ];
				} else {
					to_unique = [ index, index ];
				}
				// return _this[index];
			}

			_unique = _this.slice(index, _unique[1] + 1);

			return treat_as_String ? _unique.join(separator) : _unique;
		}

		function generate_diff_pair(from_index, to_index) {
			var diff_pair = [ normalize_unique(from_unique, from),
					normalize_unique(to_unique, to) ];
			if (false && to_unique) {
				diff_pair.push(normalize_unique(to_unique, to));
			}
			// Array.isArray(to_unique) && from_unique===undefined 代表本段落為新增文字。
			// diff_pair.index: 本次差異開始的 index。
			// diff_pair.index = [ from_index, to_index ];
			// _index = [ start_index, end_index ]
			// .indexes
			diff_pair.index = [ from_unique, to_unique ];
			// diff_pair.last_index: 上一個相同元素的 index。
			// 警告: diff_pair.last_index 在 _unique 最初的一個 index 可能不準確!
			diff_pair.last_index = [ from_index, to_index ];

			return diff_pair;
		}

		function add_to_diff_list(from_index, to_index) {
			if (!get_diff || (!from_unique && !to_unique)) {
				// assert: 連續相同元素時
				return;
			}

			if (false) {
				library_namespace.debug(JSON.stringify([ from_index, to_index,
						from_unique, to_unique ]), 3, 'add_to_diff_list');
			}

			var diff_pair = generate_diff_pair(from_index, to_index);

			if (try_to_merge_diff && diff_list.length > 0) {
				var previous_diff_of_start = (to_index === NOT_FOUND ? 0
				// 本次不同內容開始的 index 差異。
				: to_index) - (from_index === NOT_FOUND ? 0 : from_index);
				for (var index = 0; index < diff_list.length
				// && 1: 只檢測文字交換。 e.g., "品質" → "質量"，避免太多差異被合併在一起。
				&& 1; index++) {
					var _diff_pair = diff_list[index];
					// 到 _diff_pair 為止，from 之不同內容最後的 index 差異。
					var last_index_0 = _diff_pair.index[0] ? _diff_pair.index[0][1]
							: _diff_pair.last_index[0];
					// 到 _diff_pair 為止，to 之不同內容最後的 index 差異。
					var last_index_1 = _diff_pair.index[1] ? _diff_pair.index[1][1]
							: _diff_pair.last_index[1];
					// 到 _diff_pair 為止，不同內容最後的 index 差異。
					var following_diff_of_start = last_index_1 - last_index_0;
					if (following_diff_of_start !== previous_diff_of_start) {
						continue;
					}

					diff_list.splice(0, index + 1);
					if (!from_unique) {
						from_unique = [ to_unique[0] ];
						if (from_index === NOT_FOUND)
							from_index = 0;
					}
					from_unique[1] = last_index_0;
					if (!to_unique) {
						to_unique = [ from_unique[0] ];
						if (to_index === NOT_FOUND)
							to_index = 0;
					}
					to_unique[1] = last_index_1;
					diff_pair = generate_diff_pair(from_index, to_index);
					break;
				}
			}

			diff_list.unshift(diff_pair);
			// reset indexes.
			from_unique = to_unique = undefined;
		}

		// backtrack subroutine
		function backtrack(from_index, to_index, all_list) {
			// 因為函數 backtrack() 中呼叫自己，可能出現：
			// RangeError: Maximum call stack size exceeded
			// 因此必須採用非遞迴呼叫(recursive call)版本。
			while (true) {
				if (false) {
					library_namespace.debug(String([ from_index, to_index ]),
							3, 'LCS.backtrack');
					library_namespace.debug(String([ from_unique, to_unique,
							diff_list ]), 6, 'LCS.backtrack');
				}
				if (from_index < 0 || to_index < 0) {
					if (false) {
						library_namespace.debug('→ '
								+ JSON.stringify([ from_index, to_index,
										from_unique, to_unique ]), 3);
					}
					if (from_index === -1 && to_index === -1) {
						// assert: from_index === -1 && to_index === -1
						if (false) {
							library_namespace.debug(
							//
							'LCS starts from the first element of each list, '
									+ JSON.stringify([ from_index, to_index,
											from[0], to[0] ]), 3,
									'LCS.backtrack');
						}
					} else if (to_index === -1) {
						if (false) {
							library_namespace.debug('因為 ' + from_index + ',0→('
									+ from_index + '|' + (from_index - 1)
									+ '),-1 時不會處理到 from_unique，只好補處理。', 3,
									'LCS.backtrack');
						}
						if (Array.isArray(from_unique)) {
							// e.g., CeL.LCS('abc123', 'def123', 'diff')
							from_unique[0] = 0;
						} else {
							// e.g., CeL.LCS('a0', 'b0', 'diff')
							// e.g., CeL.LCS('a0', '0b', 'diff')
							from_unique = [ 0, from_index ];
						}
					} else if (from_index === -1) {
						if (false) {
							library_namespace.debug('因為 0,' + to_index
									+ ',0→-1,(' + to_index + '|'
									+ (to_index - 1)
									+ ') 時不會處理到 to_unique，只好補處理。', 3,
									'LCS.backtrack');
						}
						if (Array.isArray(to_unique)) {
							to_unique[0] = 0;
						} else {
							// e.g., CeL.LCS('a1b2', '1a2b', 'diff')
							to_unique = [ 0, to_index ];
						}
					} else {
						library_namespace
								.warn('LCS.backtrack: Invalid situation!');
					}
					add_to_diff_list(from_index, to_index);
					return;
				}

				if (from[from_index] === to[to_index]) {
					// 此元素為 LCS 之一部分。
					if (false) {
						library_namespace.debug('相同元素 @ '
								+ [ from_index, to_index ] + ': '
								+ from[from_index], 3, 'LCS.backtrack');
					}
					if (!diff_only) {
						// get_index = 1: from_index, 2: to_index
						var common = get_index ? get_index === 2 ? to_index
								: from_index : from[from_index];
						if (get_all) {
							all_list.forEach(function(result_Array) {
								result_Array.unshift(common);
							});
						} else {
							all_list[0].unshift(common);
						}
					}
					add_to_diff_list(from_index, to_index);

					// 常常出現 Maximum call stack size exceeded 錯誤的地方...
					// backtrack(from_index - 1, to_index - 1, all_list);
					// return;

					// 採用 iteration
					from_index--;
					to_index--;
					continue;
				}

				var trace_index;
				if (from_index > 0
				// ↑ 預防 trace_Array[trace_index - 1] 取到範圍外的值。
				&& (trace_index = to_index * from_length + from_index) > 0
				// trace_Array[trace_index]
				// = max( trace_Array[trace_index - 1], [上面一階])
				&& trace_Array[trace_index] === trace_Array[trace_index - 1]) {
					if (false) {
						library_namespace.debug('trace_index: ' + trace_index,
								3, 'LCS.backtrack');
						library_namespace.debug('trace: '
								+ trace_Array[trace_index - 1] + ' → '
								+ trace_Array[trace_index], 3);
					}

					var _all_list;
					if (get_all
					// 如此亦保證 to_index > 0
					&& trace_index >= from_length && trace_Array[trace_index]
					//
					=== trace_Array[trace_index - from_length]) {
						if (false) {
							library_namespace.debug(trace_Array[trace_index]
									+ ': ' + all_list, 3, 'LCS.backtrack');
						}
						_all_list = all_list.map(function(result_Array) {
							return result_Array.clone();
						});
						backtrack(from_index, to_index - 1, _all_list);
					}

					if (false) {
						library_namespace.debug('檢測前一個。 '
								+ [ from_index, to_index ], 3, 'LCS.backtrack');
					}
					if (get_diff) {
						if (Array.isArray(from_unique)) {
							from_unique[0] = from_index;
						} else {
							from_unique = [ from_index, from_index ];
						}
						if (false) {
							library_namespace.debug(
							//
							'from_index: ' + [ from_index,
							//
							JSON.stringify(from_unique) ], 3, 'LCS.backtrack');
						}
					}
					// TODO: 對於比較長的結構，這裡常出現
					// RangeError: Maximum call stack size exceeded
					// workaround: 現在只能以重跑程式、跳過這篇文章繞過。
					backtrack(from_index - 1, to_index, all_list);

					if (get_all) {
						if (false) {
							library_namespace.debug('merge: '
									+ [ all_list, _all_list ], 3);
						}
						all_list = unique(all_list.append(_all_list));
					}
					return;

				} else {
					if (false) {
						library_namespace.debug('檢測上一排。 '
								+ [ from_index, to_index ], 3, 'LCS.backtrack');
					}
					if (get_diff) {
						if (to_unique) {
							to_unique[0] = to_index;
						} else {
							to_unique = [ to_index, to_index ];
						}
						if (false) {
							library_namespace.debug('to_index: '
									+ [ to_index, JSON.stringify(to_unique) ],
									3, 'LCS.backtrack');
						}
					}

					// backtrack(from_index, to_index - 1, all_list);

					// 採用 iteration
					to_index--;
				}
			}
		}

		// ---------------------------------------

		// 取得所有 LCS，而不僅是其中之一。
		var all_list = [ [] ];

		// 主要作業。
		if (isNaN(from_index) || isNaN(to_index)) {
			library_namespace.error('LCS: isNaN(from:' + from_index
					+ ') || isNaN(' + to_index + ')');
			throw new Error('LCS: isNaN(from_index) || isNaN(to_index)');
		}
		try {
			backtrack(from_index, to_index, all_list);
		} catch (e) {
			if (options.no_throw_when_stack_size_is_exceeded) {
				library_namespace.error('LCS: stack size is exceeded: ' + e);
				all_list.error = e;
				return all_list;
			}
			throw new RangeError(
					'Maximum call stack size exceeded @ backtrack()');
		}

		// 以下為後續處理。
		if (get_all) {
			// 去掉重複的 LCS。
			all_list = unique(all_list);
		}

		if (treat_as_String || !get_index) {
			all_list = all_list
			// index → 元素
			.map(function(result_Array) {
				if (get_index) {
					result_Array = result_Array.map(function(index) {
						return get_index === 2 ? to[index] : from[index];
					});
				}
				return treat_as_String && !options.index
				// 特別指定 options.index 時，即使輸入{String}亦保持index，不轉換為{String}。
				? result_Array.join(separator) : result_Array;
			});
		}

		if (get_diff && !diff_only) {
			// 應為 treat_as_String
			if (treat_as_String) {
				// 為了能設定 .diff。
				// assert: diff_list 設定在 all_list[0] 上，
				// 且不因前面 unique(all_list) 而改變。
				all_list[0] = new String(all_list[0]);
			}
			all_list[0].diff = diff_list;
		}

		if (!get_all) {
			all_list = diff_only ? diff_list : all_list[0];
		}
		if (options.with_list) {
			if (typeof all_list !== 'object') {
				all_list = new String(all_list);
			}
			all_list.from = from;
			all_list.to = to;
		}

		/**
		 * <code>

		all_list = diff_only ? diff_list : all_list[0];

		{Array}diff_list
			= [ diff_pair 1, diff_pair 2, ...,
			// need options.with_list
			from: [ 'diff from source' ], to: [ 'diff to source' ]
			]

		{Array}diff_pair =
			// 若僅有 from_diff_unique 或 to_diff_unique 則另一方會是 undefined。
			// 兩者皆有則表示為變更/modify。
			[ {Array}from_diff_unique, {Array}to_diff_unique,
			$**deprecated** [ {Array|String|Undefined}from_diff_unique, {Array|String|Undefined}to_diff_unique,

			// diff_pair.index = [ from_index, to_index ];
			// _index = [ start_index, end_index ]
			index:
				[ {Array}from_unique_indexes, {Array}to_unique_indexes ],

			// diff_pair.last_index: 上一個相同元素的 index。
			// 警告: diff_pair.last_index 在 _unique 最初的一個 index 可能不準確!
			last_index: [ {Integer}index of from, {Integer}index of to ]
			]

		{Array|Undefined}from_unique_indexes, to_unique_indexes
			= [ {Integer}start_index, {Integer}end_index ]
			or = undefined (insert / delete only)
			$**deprecated** or = {Integer}start index

		{Array}from_diff_unique, to_diff_unique
			= [ {String}diff_unique_line, {String}diff_unique_line, ...  ]
			$**deprecated** or = {String}diff_unique_line
			$**deprecated** or = undefined

		</code>
		 */
		return all_list;
	}

	_.LCS = LCS;

	/**
	 * <code>

	from	*    *   *        *
	index	012345678 9 10 11 12 13 14
	text	_0123_456 7 8  9  a
	text	 0123 456_7 8  9
	index	 0123 45678 9  10    11 12
	to

	</code>
	 */

	// 取得 to 之與 from 相對應的索引。
	// from[index_of_from] 相對應於
	// to[CeL.LCS.corresponding_index(diff_list, index_of_from_text)]
	function get_corresponding_index(diff_list, index_of_from_text,
			is_index_of_to) {
		if (diff_list.length === 0)
			return index_of_from_text;

		var FROM_INDEX = is_index_of_to ? 1 : 0, TO_INDEX = 1 - FROM_INDEX;
		var diff_list_index = 0, latest_offset_delta = 0;
		while (true) {
			var diff_pair = diff_list[diff_list_index++];
			var from_indexes = diff_pair.index[FROM_INDEX];
			if (!from_indexes) {
				from_indexes = diff_pair.last_index[FROM_INDEX] + 1;
				from_indexes = [ from_indexes, from_indexes ];
			}

			if (index_of_from_text > from_indexes[1]) {
				if (diff_list_index < diff_list.length) {
					continue;
				}
				from_indexes = diff_pair.index[FROM_INDEX];
				var to_indexes = diff_pair.index[TO_INDEX];
				latest_offset_delta = (to_indexes ? to_indexes[1]
						: diff_pair.last_index[TO_INDEX])
						- (from_indexes ? from_indexes[1]
								: diff_pair.last_index[FROM_INDEX]);
				break;
			}

			if (index_of_from_text < from_indexes[0]) {
				latest_offset_delta = diff_pair.last_index[TO_INDEX]
						- diff_pair.last_index[FROM_INDEX];
				break;
			}

			var to_indexes = diff_pair.index[TO_INDEX];
			if (!to_indexes) {
				to_indexes = diff_pair.last_index[TO_INDEX] + 1;
				to_indexes = [ to_indexes, to_indexes ];
			}

			if (from_indexes[1] === from_indexes[0]
					|| to_indexes[1] === to_indexes[0]) {
				return diff_pair.index[FROM_INDEX] ? to_indexes[0]
						: to_indexes[1] + 1;
			}

			return to_indexes[0] + (index_of_from_text - from_indexes[0])
					* (to_indexes[1] - to_indexes[0])
					/ (from_indexes[1] - from_indexes[0]);

		}

		return index_of_from_text + latest_offset_delta;
	}

	LCS.corresponding_index = get_corresponding_index;

	// unfinished
	function diff_with_Array(to, options) {
		function append(array, item, item_index) {
			if (item) {
				if (Array.isArray(item_index)) {
					item_index = item_index[0];
				}
				if (Array.isArray(item)) {
					array.append(item.filter(function(i, index) {
						if (i) {
							array.index.push(item_index + index);
							return true;
						}
					}));
				} else {
					array.index.push(item_index);
					array.push(item);
				}
			}
		}

		var diff = LCS(this || [], to || [], Object.assign({
			diff : true
		}, options)), from_added = [], to_added = [],
		// 避免經過重排後，已經無法回溯至原先資料。
		from_added_index = from_added.index = [], move_to = Object.create(null);
		to_added.index = [];

		// TODO: diff其中有undefined

		diff.forEach(function(pair) {
			append(from_added, pair[0], pair.index[0]);
			append(to_added, pair[1], pair.index[1]);
		});

		function scan_list(from_item, from_index) {
			// assert: {String}item
			var index = to_added.indexOf(from_item);
			// 去掉完全相同的行。
			if (index !== NOT_FOUND) {
				move_to[from_added.index[from_index]] = to_added.index[index];
				to_added.index.splice(index, 1);
				to_added.splice(index, 1);
				from_added.index.splice(from_index, 1);
				from_added[from_index] = false;
				return;
			}

			if (typeof from_item === 'string') {
				from_item = from_item.chars(true);
			}
			// use LCS() again
			var max_LCS_length = 0,
			// ↑ = Math.max(20, from_item.length / 2 | 0)
			max_LCS_data;
			to_added.forEach(function(to_item, to_index) {
				// assert: from_item, to_item 皆無 "\n"
				// console.log(to_item);
				if (typeof to_item === 'string') {
					to_item = to_item.chars(true);
				}
				var trace_Array = LCS_length(from_item, to_item, true),
				// const
				this_LCS_length = trace_Array.at(-1);
				if (max_LCS_length < this_LCS_length) {
					max_LCS_length = this_LCS_length;
					max_LCS_data = [ to_index, trace_Array, to_item ];
				}
			});

			if (!max_LCS_data) {
				return;
			}

			var diff = from_item.diff_with(max_LCS_data[2], {
				trace_Array : max_LCS_data[1]
			});
			if (diff[1]) {
				to_added[max_LCS_data[0]] = diff[1];
			} else {
				to_added.splice(max_LCS_data[0], 1);
			}
			from_added[from_index] = from_item = diff[0];
			if (from_item) {
				// 經過變更之後，可能需要再掃描一次。
				scan_list(from_item, from_index);
			}
		}
		// 檢查是否有被移到前方的，確保回傳的真正是 unique 的。在只有少量增加時較有效率。
		from_added.forEach(scan_list);

		from_added = from_added.filter(function(item) {
			return !!item;
		});

		if (from_added.length === 0) {
			from_added = [];
		} else {
			// 將item轉為{String}
			from_added = [ from_added.map(function(line) {
				return Array.isArray(line) ? line.join('') : line;
			}) ];
		}

		if (to_added.length > 0) {
			// 將item轉為{String}
			to_added = to_added.map(function(line) {
				return Array.isArray(line) ? line.join('') : line;
			});
			from_added[1] = to_added;
		}

		from_added.index = from_added_index;
		from_added.moved = move_to;
		return from_added;
	}

	function diff_with_String(to, options) {
		return diff_with_Array.call((this || '').split('\n'),
				Array.isArray(to) ? to : (to || '').split('\n'), options);
	}

	// ---------------------------------------------------------------------//

	if (false) {
		styled_list = CeL.coloring_diff('a b c d', 'a a c c', {
			headers : [ 'header 1: ', 'header 2: ' ],
			print : true
		});
	}

	// 為 diff 著色。
	function coloring_diff(from, to, options) {
		options = library_namespace.new_options(options);
		var diff_list = library_namespace.LCS(from, to, {
			diff : true
		});
		from = [ from /* , { reset : true } */];
		to = [ to /* , { reset : true } */];
		var diff, normal_style = options.normal_style || {
			// bold : false,
			fg : 'white',
			bg : 'black'
		}, diff_style = options.diff_style || {
			// bold : true,
			fg : 'red',
			bg : 'white'
		},
		// 用在多出來的文字的格式。
		insertion_style = options.insertion_style || {
			// bold : true,
			fg : 'white',
			bg : 'green'
		};

		function add_diff(styled_list, diff_index, is_insertion) {
			if (!diff_index) {
				// e.g., 只有義方有多東西。
				return;
			}

			var next_index = diff_index[1] + 1, this_slice = styled_list
					.shift();
			styled_list.unshift(this_slice.slice(0, diff_index[0]),
					is_insertion ? insertion_style : diff_style, this_slice
							.slice(diff_index[0], next_index), normal_style,
					this_slice.slice(next_index));
		}

		while (diff = diff_list.pop()) {
			var from_index = diff.index[0], to_index = diff.index[1];
			// console.trace([ from, from_index, to, to_index ]);
			add_diff(from, from_index, !to_index);
			add_diff(to, to_index, !from_index);
		}

		var headers = Array.isArray(options.headers) ? options.headers : [];
		from.unshift(headers[0] || '', normal_style);
		to.unshift(headers[1] || '', normal_style);
		if (options.header_style) {
			from.unshift('', options.header_style);
			to.unshift('', options.header_style);
		}

		if (options.print) {
			library_namespace.slog(from);
			library_namespace.slog(to);
		}
		// 注意: from.length 不一定等於 to.length
		return [ from, to ];
	}

	_.coloring_diff = coloring_diff;

	// ---------------------------------------------------------------------//

	/**
	 * Find the longest common starting substring in a set of strings
	 * 
	 * TODO: 可以嘗試先分割words整個字比對
	 * 
	 * @param {Array}string_list
	 *            array of strings
	 * @returns {ℕ⁰:Natural+0} longest common starting substring length
	 * 
	 * @see https://stackoverflow.com/questions/1916218/find-the-longest-common-starting-substring-in-a-set-of-strings/1917041#1917041
	 */
	function longest_common_starting_length(string_list) {
		string_list = string_list.filter(function(string) {
			return typeof string === 'string';
		});
		if (string_list.length <= 1) {
			return string_list[0] ? string_list[0].length : 0;
		}

		var char_index = 0;
		for (var last = string_list[0].length; char_index < last; char_index++) {
			var char_now = string_list[0].charAt(char_index);
			for (var index = 1; index < string_list.length; index++) {
				if (char_now !== string_list[index].charAt(char_index)) {
					return char_index;
				}
			}
		}
		return char_index;
	}

	_.longest_common_starting_length = longest_common_starting_length;

	// ---------------------------------------------------------------------//
	// https://en.wikipedia.org/wiki/Letter_case#Headings_and_publication_titles
	// http://adminsecret.monster.com/training/articles/358-what-to-capitalize-in-a-title
	// http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
	// to_title_case()
	// Capitalize the first letter of string
	// also use CSS: text-transform:capitalize;
	// @see Camel_to_underscore() @ data.code
	/**
	 * 轉成標題用之格式。基本上即將每個字的第一個字母轉成大寫。
	 * 
	 * @param {Boolean}to_lower_first
	 *            將要轉換的文字先全部轉換成小寫。
	 * 
	 * @returns {String}標題用之格式文字。
	 * 
	 * @see function upper_case_initial(words) @ CeL.application.net.wiki
	 */
	function toTitleCase(to_lower_first) {
		// 要轉換的文字。
		var title = this.trim();
		if (to_lower_first)
			title = title.toLowerCase();
		return title.replace(/(^|\s)((\w)(\w*))/g,
		//
		function($0, $1, $2, $3, $4) {
			// console.log($0);
			return $2 in toTitleCase.lower ? $0
			//
			: $2 in toTitleCase.upper ? $0.toUpperCase()
			//
			: ($1 ? ' ' : '') + $3.toUpperCase() + $4;
		})
		// capitalize the first and last word of the title itself.
		// in case title === ''
		.replace(/^\w/, function($0) {
			return $0.toUpperCase();
		}).replace(/\s(\w)([\w\-]*)$/, function($0, $1, $2) {
			return ' ' + $1.toUpperCase() + $2;
		});
	}

	/**
	 * add exception words
	 * 
	 * @param {String|Array}words
	 *            exception words
	 */
	toTitleCase.add_exception = function(words, upper) {
		// initialize
		if (!toTitleCase.lower)
			toTitleCase.lower = Object.create(null);
		if (!toTitleCase.upper)
			toTitleCase.upper = Object.create(null);

		var target = upper ? toTitleCase.upper : toTitleCase.lower;

		if (typeof words === 'string')
			words = words.split(',');

		if (Array.isArray(words))
			words.forEach(function(word) {
				target[word] = true;
			});
		else
			Object.assign(target, words);
	};

	toTitleCase
			.add_exception('at,by,down,for,from,in,into,like,near,of,off,on,onto,over,past,to,upon,with,and,but,or,yet,for,nor,so,as,if,once,than,that,till,when,to,a,an,the');
	toTitleCase.add_exception(
			'id,tv,i,ii,iii,iv,v,vi,vii,viii,ix,x,xi,xii,xiii', true);

	if (false) {
		// 警告:這將使 node.js 6.2.2 卡住。
		/\[\[(?:[^\[\]]+|\[[^\[]|\][^\]])*\]\]/
				.test("[[                                     [[ ]] [[ ]] [[ ]] ]]");
	}

	if (false) {
		// 若要消除 "'''" 與 "''"，應將長的置於前面。
		wikitext = wikitext.remove_head_tail("'''", 0, ' ').remove_head_tail(
				"''", 0, ' ');
	}

	/**
	 * 去除首尾。這或許該置於 CeL.data.native...
	 * 
	 * @param {String}text
	 *            指定的輸入字串。
	 * @param {String}head
	 *            欲移除之首字串。
	 * @param {String}[tail]
	 *            欲移除之尾字串。
	 * @param {String}[insert_string]
	 *            將首尾以((insert_string))取代。 有設定 insert_string 時，會保留內容物。未設定
	 *            insert_string 時，會將內容物連同首尾一同移除。
	 * 
	 * @returns {String}replaced text. 變更/取代後的結果。
	 */
	function remove_head_tail(text, head, tail, insert_string) {
		var head_eq_tail, index_start, index_end;
		if (!tail) {
			tail = head;
			head_eq_tail = true;
		} else {
			head_eq_tail = head === tail;
		}

		var head_length = head.length, tail_length = tail.length;

		while (true) {

			if (head_eq_tail) {
				// 改採自前面搜尋模式。
				index_start = text.indexOf(head);
				if (index_start === NOT_FOUND) {
					// 無首
					return text;
				}
				index_end = text.indexOf(tail, index_start + head_length);
				if (index_end === NOT_FOUND) {
					// 有首無尾
					return text;
				}

			} else {
				index_end = text.indexOf(tail);
				if (index_end === NOT_FOUND) {
					// 無尾
					return text;
				}
				// 須預防中間包含 head / tail 之字元。
				index_start = text.lastIndexOf(head, index_end - head_length);
				if (index_start === NOT_FOUND) {
					// 有尾無首
					return text;
				}
			}

			text = text.slice(0, index_start)
			// 未設定 insert_string 時，會將內容物連同首尾一同移除。
			+ (insert_string === undefined ? '' : insert_string
			// 有設定 insert_string 時，會保留內容物。
			+ text.slice(index_start + head_length, index_end) + insert_string)
					+ text.slice(index_end + tail_length);
		}
	}

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
	var has_replacement_offset;
	'ab'.replace(/b/g, function(all, offset, string) {
		has_replacement_offset = offset === 1 && string === 'ab';
	});

	/**
	 * 持續執行 .replace()，直到處理至穩定平衡無變動為止。
	 * 
	 * @param {String}text
	 *            指定的輸入字串。
	 * @param {RegExp}pattern
	 *            要搜索的正規表示式/規則運算式模式。
	 * @param {String|Function}replace_to
	 *            用於替換的字串。
	 * 
	 * @returns {String}replaced text. 變更/取代後的結果。
	 */
	function replace_till_stable(text, pattern, replace_to) {
		if (false)
			library_namespace.debug('pattern: ' + pattern, 6,
					'replace_till_stable');
		for (var original; original !== text;) {
			original = text;
			if (has_replacement_offset) {
				// new browsers
				text = original.replace(pattern, replace_to);
			} else {
				// old browsers
				text = original.replace(pattern, function(all) {
					var args = Array.from(arguments);
					args.push(original.indexOf(all, pattern.lastIndex || 0),
					// original_string 原字串。
					original,
					// 缺乏 group 的代表非常舊的 JavaScript 引擎版本，只能模擬一個代替。
					Object.create(null));
					replace_to.apply(undefined, args);
				});
			}
			if (false) {
				library_namespace.debug('[' + original + '] '
						+ (original === text ? 'done.' : '→ [' + text + ']'),
						6, 'replace_till_stable');
			}
		}
		return text;
	}

	/**
	 * 當欲變更/取代文字前後的文字符合要求時，才執行取代。
	 * 
	 * @param {String}text
	 *            指定的輸入字串。
	 * @param {RegExp}pattern
	 *            要搜索的正規表示式/規則運算式模式。
	 * @param {String|Function}replace_to
	 *            用於替換的字串。
	 * @param {Function|Undefined}[match_previous]
	 *            filter match_previous(previous token) return true if it's OK
	 *            to replace, false if it's NOT OK to replace.
	 * @param {Function|Undefined}[match_following]
	 *            filter match_following(next token) return true if it's OK to
	 *            replace, false if it's NOT OK to replace.
	 * 
	 * @returns {String}replaced text. 變更/取代後的結果。
	 */
	function replace_check_near(text, pattern, replace_to, match_previous,
			match_following) {
		var matched, results = [], last_index = 0;
		if (!pattern.global) {
			library_namespace.debug("The pattern doesn't has 'global' flag!",
					2, 'replace_check_near');
		}

		while (matched = pattern.exec(text)) {
			library_namespace.debug(pattern + ': ' + matched, 5,
					'replace_check_near');
			var previous_text = text.slice(last_index, matched.index),
			//
			_last_index = matched.index + matched[0].length;
			if ((!match_previous || match_previous(previous_text))
			// context 上下文 前後文
			// 前面的 foregoing paragraphs, see above, previously stated, precedent
			// 後面的 next; behind rearwards;back;posteriority;atergo;rearward
			&& (!match_following || match_following(text.slice(_last_index)))) {
				last_index = pattern.lastIndex;
				library_namespace.debug(previous_text + ',' + matched[0] + ','
						+ matched[0].replace(pattern, replace_to), 5,
						'replace_check_near');
				results.push(
				//
				previous_text, matched[0].replace(pattern, replace_to));
				// restore lastIndex.
				pattern.lastIndex = last_index;
				last_index = _last_index;
			}
			if (!pattern.global) {
				// 僅執行此一次。
				break;
			}
		}

		// 收尾。理想的 pattern 應該用 /([\s\S]*?)(delimiter|$)/g 之類，如此則無須收尾。
		if (last_index < text.length) {
			if (last_index === 0)
				// 完全沒相符的。
				return text;
			results.push(text.slice(last_index));
		}
		return results.join('');
	}

	var PATTERN_bigrams = /.{2}/g;

	/**
	 * Get Sørensen index, or Dice's coefficient.
	 * 
	 * String.similarity()
	 * 
	 * @param {String}string_1
	 *            sequence 1
	 * @param {String}string_2
	 *            sequence 2
	 * 
	 * @returns {Number}index (or named coefficient)
	 * 
	 * @see https://en.wikipedia.org/wiki/S%C3%B8rensen%E2%80%93Dice_coefficient
	 */
	function similarity_coefficient(string_1, string_2) {
		var count = 0,
		//
		bigrams_1 = string_1.match(PATTERN_bigrams).concat(
				string_1.slice(1).match(PATTERN_bigrams)),
		//
		bigrams_2 = string_2.match(PATTERN_bigrams).concat(
				string_2.slice(1).match(PATTERN_bigrams));

		bigrams_1.forEach(function(bigram) {
			if (bigrams_2.includes(bigram))
				count++;
		});

		// 0–1
		return 2 * count / (bigrams_1.length + bigrams_2.length);
	}

	function Array_truncate(length) {
		length = Math.max(0, length | 0);
		// This is faster than ((this.length = 0))
		while (this.length > length) {
			this.pop();
		}
		return this;
	}

	// ------------------------------------

	// 傳回字串於等寬字型monospaced font的寬度。螢幕對齊用。
	// 對fullwidth全形字元, width應算2
	// http://hyperrate.com/topic-view-thread.php?tid=3322
	// TODO: 警告:本函數尚未完善
	// @see http://unicode.org/Public/UNIDATA/EastAsianWidth.txt
	function String_display_width(string, font) {
		// 須注意:不同的字型對不同字元的規範可能不同!如'→'可能為2或1

		// @see [[en:Arrow (symbol)]]
		string = String(string).replace(/[\u2190-\u21FF]/g, '  ');

		// @see http://www.allenkuo.com/genericArticle/view1299.aspx
		// @see [[zh:全形和半形]]
		return string.replace(/[\u3000-\uFF5E]/g, '  ').length;
	}

	var DEFAULT_DISPLAY_WIDTH = 80;
	// 螢幕寬度多少字元。
	function screen_display_width() {
		return library_namespace.platform.nodejs && process.stdout.columns
		// process.stdout.columns 可能被設定為0。 e.g., at Travis CI
		|| DEFAULT_DISPLAY_WIDTH;
	}
	if (false) {
		library_namespace.debug('screen_display_width: '
				+ screen_display_width());
	}

	// CLI 螢幕顯示對齊用。e.g., 對比兩者。
	// left justification, to line up in correct
	function display_align(lines, options) {
		// 前置作業。
		options = library_namespace.setup_options(options);

		if (library_namespace.is_Object(lines)) {
			// pairs/lines={key:value,key:value,...}
			lines = Object.entries(lines);
		}
		var use_display_width = options.display_width || screen_display_width();
		library_namespace.debug('display width: ' + use_display_width, 3);
		var key_display_width = [], line_separator = String('line_separator' in options ? options.line_separator
				// '\n'
				: determine_line_separator()), force_using_new_line = line_separator === '\r\n' ? '\n'
				: line_separator;
		var some_has_new_line = lines.some(function(line) {
			var key = String(line[0]), value = String(line[1]);
			// assert: key.includes(line_separator) === false
			if ((value.length > use_display_width)
					|| value.includes(force_using_new_line)) {
				return true;
			}
			key_display_width.push(String_display_width(key));
		});

		var key_style = options.key_style,
		// e.g., value_style : { color : 'green' }
		value_style = options.value_style,
		// 採用醒目多色彩的顯示方式。
		using_style = !!('using_style' in options ? options.using_style
				: key_style || value_style),
		//
		display_lines = [], max_key_display_width = !some_has_new_line
				&& Math.max.apply(null, key_display_width);
		lines.forEach(function(line) {
			var key = String(line[0]), value = line[1];
			if (some_has_new_line) {
				key = key.trim();
				value = String(value);
				if (using_style) {
					value = [ key_style ? {
						T : key,
						S : key_style
					} : key, line_separator, value_style ? {
						T : value,
						S : value_style
					} : value ];
				} else {
					value = key + line_separator + value;
				}
			} else {
				// 可能沒有 key.padStart()!
				key = key.pad(key.length + max_key_display_width
				// assert: String_display_width(' ') === 1
				- key_display_width.shift(), options.to_fill || ' ',
						options.from_start);
				if (using_style) {
					value = [ key_style ? {
						T : key,
						S : key_style
					} : key, value_style ? {
						T : value,
						S : value_style
					} : value ];
				} else {
					value = key + value;
				}
			}
			if (using_style) {
				if (display_lines.length > 0) {
					// 前面有東西就先跳一行。
					display_lines.push(line_separator);
				}
				display_lines.append(value);
			} else {
				display_lines.push(value);
			}
		});
		return using_style ? display_lines : display_lines.join(line_separator);
	}

	_.display_align = display_align;

	// ------------------------------------

	var has_native_Math_imul = Math.imul
			&& !Math.imul[library_namespace.env.not_native_keyword];

	// ------------------------------------

	set_method(String.prototype, {
		covers : function(string) {
			return this.length >= string.length
			//
			&& !!String_covers(string, this);
		},

		count_of : set_bind(count_occurrence, true),
		// gText : getText,
		// HTML_to_Unicode : HTML_to_Unicode,

		// split_by : split_String_by_length,
		chunk : chunk,

		// 對於可能出現 surrogate pairs 的字串，應當以此來取代 .split('')！
		chars : split_by_code_point,
		codePoints : codePoints,

		remove_head_tail : set_bind(remove_head_tail, true),

		// repeatedly replace till stable
		replace_till_stable : set_bind(replace_till_stable, true),
		replace_check_near : set_bind(replace_check_near, true),

		pad : set_bind(pad, true),
		// 2021/5/4: ''.toRegExp() remane to → ''.to_RegExp()
		to_RegExp : set_bind(String_to_RegExp, true),
		toTitleCase : toTitleCase,
		between : function(head, foot, index, return_data) {
			// 確保可用 string.between().between() 的方法來作簡易篩選。
			/**
			 * <code>
			var data = get_intermediate([ this, head, foot, index ]);
			return data[3] !== NOT_FOUND && data[4] || '';
			</code>
			 */
			return get_intermediate(this, head, foot, index,
			//
			return_data) || '';
		},
		find_between : find_between,
		all_between : all_between,
		each_between : each_between,

		edit_distance : set_bind(Levenshtein_distance),
		diff_with : diff_with_String,

		display_width : set_bind(String_display_width),

		// https://docs.oracle.com/javase/10/docs/api/java/lang/String.html#hashCode()
		hashCode : has_native_Math_imul
		// https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0
		? function hashCode_imul() {
			var hash = 0;
			for (var index = 0, length = this.length; index < length; index++) {
				hash = (Math.imul(31, hash) + this.charCodeAt(index))
				// Convert to 32bit integer
				| 0;
			}
			return hash;
		}
		// https://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
		// https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
		: function hashCode_left_shift() {
			var hash = 0;
			for (var index = 0, length = this.length; index < length; index++) {
				hash = ((hash << 5) - hash + this.charCodeAt(index))
				// Convert to 32bit integer
				| 0;
			}
			return hash;
		}
	});

	set_method(Number.prototype, {
		// 'super' 於 IE 為保留字。
		to_super : superscript_integer,
		to_sub : subscript_integer,
		to_fixed : to_fixed,
		mod : set_bind(non_negative_modulo),
		pad : set_bind(pad, true)
	});

	set_method(RegExp.prototype, {
		clone : function() {
			// TODO: using Object.getOwnPropertyNames() to copy others
			return new RegExp(this.source, this.flags);
		},
		reflags : set_bind(renew_RegExp_flags)
	});

	set_method(library_namespace.env.global, {
		// 在 old IE 中 typeof alert==='object'
		// alert : JSalert,

		// https://developer.mozilla.org/en-US/docs/Web/API/Window/setImmediate
		// https://github.com/YuzuJS/setImmediate/blob/master/setImmediate.js
		// TODO: window.postMessage can be used to trigger an immediate but
		// yielding callback.
		setImmediate : function setImmediate(callback) {
			var args = arguments;
			// 因為 setTimeout(callback, 0) 可能使 callback 傳入未規範的 arguments，因此不在外面處理
			// callback。
			return setTimeout(function() {
				if (args.length === 0) {
					callback();
					return;
				}
				args = Array.from(args);
				args.shift();
				callback.apply(null, args);
			}, 0);
		},
		clearImmediate : function clearImmediate(id) {
			return clearTimeout(id);
		}
	});

	// 建議不用，因為在for(in Array)時會...
	set_method(Array.prototype, {
		// Array.prototype.clone
		clone : function() {
			// TODO: using Object.getOwnPropertyNames() to copy others
			return this.slice();
		},
		remove_once : function(value) {
			var index = this.indexOf(value);
			if (index !== NOT_FOUND)
				return this.splice(index, 1);
		},
		// remove all. https://esdiscuss.org/topic/array-prototype-remove-item
		// value 很多的話，應該用 Set, 或 delete + 去除 blank。
		remove : function(value) {
			var index = 0;
			while ((index = this.indexOf(value, index)) !== NOT_FOUND)
				this.splice(index, 1);
		},
		// TODO: should use Array.prototype.reduce()
		// e.g., array.reduce((p,e)=>p+e)
		// Array.prototype.sum()
		sum : function(using_index) {
			// total summation
			// ABSORBING_ELEMENT
			var sum = 0;
			this.forEach(using_index ? function(e, i) {
				sum += i;
			} : function(e) {
				sum += +e;
			});
			return sum;
		},
		// Array.prototype.product()
		product : function(using_index) {
			// MULTIPLICATIVE_IDENTITY
			var product = 1;
			this.every(using_index ? function(e, i) {
				return product *= i;
			} : function(e) {
				return product *= +e;
			});
			return product;
		},
		// TODO: use Object.fromEntries(array.map((e,i)=>[e,i]))
		// TODO: Object.revert_key_value(array, get_key, hash)
		//
		// Array.prototype.to_hash()
		// ['1e3',5,66]→{'1e3':0,'5':1,'66':2}
		// {Function}[get_key]
		to_hash : function(get_key, hash) {
			if (false) {
				return Object.assign(hash || Object.create(null),
				//
				Object.fromEntries(this.map(function(value, index) {
					if (get_key)
						value = get_key(value);
					if (typeof value === 'object')
						value = JSON.stringify(value);
					return [ value, index ];
				})));
			}

			if (!hash) {
				hash = Object.create(null);
			}
			// TODO: 衝突時處理。
			this.forEach(get_key ? function(value, index) {
				value = get_key(value);
				hash[typeof value === 'object' ? JSON.stringify(value)
				//
				: value] = index;
			} : function(value, index) {
				hash[typeof value === 'object' ? JSON.stringify(value)
				//
				: value] = index;
			});
			return hash;
		},
		// Array.prototype.frequency()
		frequency : array_frequency,
		// clone: Array.prototype.slice,
		append : append_to_Array,
		unique_sorted : unique_sorted_Array,
		/**
		 * 去掉已排序，或最起碼將相同元素集在一起之 Array 中重複的 items。
		 * 
		 * 應能確保順序不變。
		 */
		unique : function unique_Array(sorted, get_key) {
			if (typeof sorted === 'function') {
				// shift arguments.
				get_key = sorted;
				sorted = false;

			} else if (sorted) {
				return this.unique_sorted(get_key);
			} else if (typeof get_key !== 'function') {
				return Array.from(new Set(this));
			}

			// @see function Array_intersection_Map()
			var map = new Map;
			function set_item(item) {
				if (!map['has'](item))
					map['set'](get_key(item), item);
			}
			this.forEach(set_item);
			return Array.from(map.values());
		},
		// Check if there is only one unique/single value in the array.
		// 集合中包含不重複的元素的個數=1
		cardinal_1 : function cardinal_1() {
			var configured, value;
			value = this.every(function(element) {
				if (configured) {
					return Object.is(element, value);
				}
				value = element;
				return configured = true;
			});
			return !!(configured && value);
		},
		// Array.prototype.search_sorted
		search_sorted : set_bind(search_sorted_Array, true),
		// Array.prototype.first_matched
		first_matched : set_bind(first_matched, true),

		diff_with : diff_with_Array,

		// warpper
		run_serial :
		// [].run_serial(for_each(run_next, item, index, list), callback, _this)
		function Array_run_serial_asynchronous(for_each, callback, _this) {
			run_serial_asynchronous(for_each, this, callback, _this);
		},
		// [].run_parallel(for_each(run_next, item, index, list, get_status),
		// callback, _this)
		run_parallel : function Array_run_parallel_asynchronous(for_each,
				callback, _this) {
			run_serial_asynchronous(for_each, this, callback, _this, true);
		},

		truncate : Array_truncate,
		// empty the array. 清空 array. truncate
		// Array.prototype.clear()
		clear : Array_truncate
	});

	// ---------------------------------------------------------------------//

	/**
	 * patch: parse ISO date String for IE.<br />
	 * for this function, you should also include 'data.code.compatibility' for
	 * toISOString().
	 * 
	 * @example <code>

	CeL.log((new Date).toISOString());
	CeL.log('' + CeL.ISO_date((new Date).toISOString()));

	 * </code>
	 * 
	 * @param {String}ISO_date_String
	 * 
	 * @returns {Date} date
	 * 
	 * @since 2014/7/26 11:56:1
	 */
	function IE_ISO_date(ISO_date_String) {
		return new Date(IE_ISO_date.parse(ISO_date_String));
	}

	// 應測試是否可正確 parse。
	if (isNaN(Date.parse('0000-01-01T00:00:00.000Z'))) {
		// IE8?
		IE_ISO_date.offset = (new Date).getTimezoneOffset();

		IE_ISO_date.parse = function(ISO_date_String) {
			if (false) {
				library_namespace.debug(ISO_date_String
						.replace(/\.\d{3}Z$/, '').replace(/-/, '/'));
				library_namespace.debug(Date.parse(ISO_date_String.replace(
						/\.\d{3}Z$/, '').replace(/-/, '/')));
			}
			return Date.parse(ISO_date_String.replace(/\.\d{3}Z$/, '').replace(
					/-/, '/'))
					+ IE_ISO_date.offset;
		};
	} else {
		// normal.
		IE_ISO_date.parse = Date.parse;
	}

	_.ISO_date = IE_ISO_date;

	set_method(Date.prototype, {
		clone : function() {
			// TODO: using Object.getOwnPropertyNames() to copy others
			return new Date(this.getTime());
		}
	});

	// ---------------------------------------------------------------------//

	var fulfilled = Object.create(null);
	// assert: needs Promise.race()!
	//
	// status_handler(value is fulfilled && ('not thenable' || 'resolved' ||
	// 'rejected'), value: this_thenable)
	//
	// return promise to wait for the result
	function status_of_thenable(value, status_handler) {
		// Promise.isPromise()
		if (!library_namespace.is_thenable(value)) {
			status_handler('not thenable', value);
			return;
		}

		// https://stackoverflow.com/questions/30564053/how-can-i-synchronously-determine-a-javascript-promises-state
		// https://github.com/kudla/promise-status-async/blob/master/lib/promiseState.js
		/**
		 * <code>
		Promise.race([value, fulfilled]).then(v => { status = v === t ? "pending" : "fulfilled" }, () => { status = "rejected" });
		</code>
		 */
		return Promise.race([ value, fulfilled ])
		//
		.then(function(first_fulfilled) {
			var result = first_fulfilled !== fulfilled && 'resolved';
			status_handler(result, value);
			return result;
		}, function(error_reason) {
			// assert: first_fulfilled !== fulfilled
			// 因為 fulfilled 不會 throw
			var result = 'rejected';
			status_handler(result, value);
			return result;
		});
	}

	_.status_of_thenable = status_of_thenable;

	// ---------------------------------------------------------------------//

	// reverse key and value, 改成 value → key
	function Map__reverse_key_value(options) {
		// 前置處理。
		options = library_namespace.setup_options(options);
		var preserve_older = options.preserve_older,
		// original key is number
		key_is_number = options.key_is_number,
		//
		ignore_null_value = options.ignore_null_value;

		// if (library_namespace.env.has_for_of)
		var reversed_Map = new Map;
		this.forEach(preserve_older === false ? function(key, value) {
			if (ignore_null_value && !key)
				return;
			if (key_is_number)
				value = +value;
			// newer will overwrite older
			reversed_Map.set(key, value);
		} : function(key, value) {
			if (ignore_null_value && !key)
				return;
			if (key_is_number)
				value = +value;
			if (reversed_Map.has(key)) {
				if (!preserve_older) {
					// ignore exists
					return;
				}
				library_namespace
						.warn('Map__reverse_key_value: duplicated key [' + key
								+ ']: ' + reversed_Map.get(key) + '→' + value);
			}
			reversed_Map.set(key, value);
		});
		return reversed_Map;
	}

	set_method(Map.prototype, {
		reverse_key_value : Map__reverse_key_value
	});

	// ------------------------------------

	return (_// JSDT:_module_
	);
}
