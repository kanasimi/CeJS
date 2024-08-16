/**
 * @name CeL function for locale / i18n (Internationalization, ja:地域化) 系列
 * @fileoverview 本檔案包含了地區語系/文化設定的 functions。
 * @since
 * @see http://blog.miniasp.com/post/2010/12/24/Search-and-Download-International-Terminology-Microsoft-Language-Portal.aspx
 *      http://www.microsoft.com/language/zh-tw/default.aspx Microsoft | 語言入口網站
 */

'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.locale',

	// data.numeral.to_Chinese_numeral|data.numeral.to_positional_Chinese_numeral|data.numeral.to_English_numeral
	require : 'data.numeral.to_Chinese_numeral'
	//
	+ '|data.numeral.to_positional_Chinese_numeral',

	// 設定不匯出的子函式。
	// no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	var module_name = this.id,
	// requiring
	to_Chinese_numeral = this.r('to_Chinese_numeral'), to_positional_Chinese_numeral = this
			.r('to_positional_Chinese_numeral');

	/**
	 * null module constructor
	 * 
	 * @class locale 的 functions
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

	/**
	 * <code>
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
	</code>
	 */
	function language_tag(tag) {
		return language_tag.parse.call(this, tag);
	}

	// 3_language[-3_extlang][-3_extlang][-4_script][-2w|3d_region]
	language_tag.language_RegExp = /^(?:(?:([a-z]{2,3})(?:-([a-z]{4,8}|[a-z]{3}(?:-[a-z]{3}){0,1}))?))(?:-([a-z]{4}))?(?:-([a-z]{2}|\d{3}))?((?:-(?:[a-z\d]{2,8}))*)$/;
	// x-fragment[-fragment]..
	language_tag.privateuse_RegExp = /^x((?:-(?:[a-z\d]{1,8}))+)$/;
	// 片段
	language_tag.privateuse_fragment_RegExp = /-([a-z\d]{1,8})/g;
	language_tag.parse = function(tag) {
		this.tag = tag;
		// language tags and their subtags, including private use and
		// extensions, are to be treated as case insensitive
		tag = String(tag).toLowerCase();
		var i = 1, match = language_tag.language_RegExp.exec(tag);
		if (match) {
			library_namespace.debug(match.join('<br />'), 3,
					'language_tag.parse');

			// 3_language[-3_extlang][-3_extlang][-4_script][-2w|3d_region]

			// <a href="http://en.wikipedia.org/wiki/ISO_639-3"
			// accessdate="2012/9/22 17:5">ISO 639-3 codes</a>
			// list: <a href="http://en.wikipedia.org/wiki/ISO_639:a"
			// accessdate="2012/9/22 16:56">ISO 639:a</a>
			// 國際語種代號標準。
			this.language = match[i++];
			// TODO: 查表對照轉換, fill this.language
			this.extlang = match[i++];

			/**
			 * @see <a
			 *      href="http://en.wikipedia.org/wiki/ISO_15924#List_of_codes"
			 *      accessdate="2012/9/22 16:57">ISO 15924 code</a>
			 */
			// 書寫文字。match[] 可能是 undefined。
			this.script = (match[i++] || '').replace(/^[a-z]/, function($0) {
				return $0.toUpperCase();
			});
			/**
			 * @see <a
			 *      href="http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements"
			 *      accessdate="2012/9/22 16:58">ISO 3166-1 alpha-2 code</a>
			 */
			// 國家/地區/區域/領域代碼。match[] 可能是 undefined。
			this.region = (match[i++] || '').toUpperCase();

			// TODO: variant, extension, privateuse
			this.external = match[i++];

			if (library_namespace.is_debug(2)) {
				for (i in this) {
					library_namespace.debug(i + ' : ' + this[i], 2,
							'language_tag.parse');
				}
			}

		} else if (match = language_tag.privateuse_RegExp.exec(tag)) {

			// x-fragment[-fragment]..
			library_namespace.debug('parse privateuse subtag [' + tag + ']', 2,
					'language_tag.parse');
			tag = match[1];
			this.privateuse = i = [];
			// reset 'g' flag
			language_tag.privateuse_fragment_RegExp.exec('');
			while (match = language_tag.privateuse_fragment_RegExp.exec(tag)) {
				i.push(match[1]);
			}
			library_namespace.debug('privateuse subtag: ' + i, 2,
					'language_tag.parse');

		} else if (library_namespace.is_debug()) {
			library_namespace.warn('unrecognized language tag: [' + tag + ']');
		}

		return this;
	};

	// 查表對照轉換。
	language_tag.convert = function() {
		// TODO
		throw new Error('language_tag.convert: '
		// gettext_config:{"id":"not-yet-implemented"}
		+ gettext('Not Yet Implemented!'));
	};

	/**
	 * <code>
	new language_tag('cmn-Hant-TW');
	new language_tag('zh-cmn-Hant-TW');
	new language_tag('zh-Hant-TW');
	new language_tag('zh-TW');
	new language_tag('cmn-Hant');
	new language_tag('zh-Hant');
	new language_tag('x-CJK').language;
	new language_tag('zh-Hant').language;
	</code>
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
		// cmn-Hant-HK, yue-Hant-HK
		HK : 'cmn-Hant',
		TW : 'cmn-Hant',
		// ja-JP
		JP : 'ja',
		// ko-KR
		KR : 'ko',
		// en-GB
		GB : 'en',
		// There is no "en-UK" language code although it is often used on web
		// pages. http://microformats.org/wiki/en-uk
		// https://moz.com/community/q/uk-and-gb-when-selecting-targeted-engines-in-campaign-management
		UK : 'en',
		// en-US
		US : 'en',
		FR : 'fr',
		DE : 'de',
		// ru-RU
		RU : 'ru',
		// arb-Arab
		Arab : 'arb'
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
		if (!code
		// identity alias
		&& !language_tag.LANGUAGE_CODE[code = region.toLowerCase()]) {
			if (library_namespace.is_debug())
				library_namespace
						.warn('language_tag.language_code: 無法辨識之國家/區域：['
								+ region + ']');
			if (regular_only)
				return;
		}
		return code;
	}

	// mapping: region name → region code (ISO 3166)
	// https://en.wikipedia.org/wiki/ISO_3166-1
	// language_tag.region_code() 會自動測試添加"國"字，因此不用省略這個字。
	language_tag.REGION_CODE = {
		臺 : 'TW',
		臺灣 : 'TW',
		台 : 'TW',
		台灣 : 'TW',
		// for language_tag.LANGUAGE_CODE
		中文 : 'ZH',
		陸 : 'CN',
		大陸 : 'CN',
		中國 : 'CN',
		中國大陸 : 'CN',
		jpn : 'JP',
		日 : 'JP',
		日本 : 'JP',
		港 : 'HK',
		香港 : 'HK',
		韓國 : 'KR',
		英國 : 'GB',
		美國 : 'US',
		法國 : 'FR',
		德國 : 'DE',
		俄國 : 'RU',
		俄羅斯 : 'RU',
		阿拉伯 : 'Arab'
	};

	// reverse
	(function() {
		for ( var region_code in language_tag.REGION_CODE) {
			if ((region_code = language_tag.REGION_CODE[region_code])
			// identity alias: REGION_CODE[TW] = 'TW'
			&& !language_tag.REGION_CODE[region_code])
				language_tag.REGION_CODE[region_code] = region_code;
		}
		for ( var language_code in language_tag.LANGUAGE_CODE) {
			// reversed alias
			// e.g., ja → JP
			// e.g., cmn-hans → CN
			language_tag.REGION_CODE[language_tag.LANGUAGE_CODE[language_code]
					.toLowerCase()] = language_code;
		}
		// 因為下面的操作會改變 language_tag.LANGUAGE_CODE，因此不能與上面的同時操作。
		for ( var language_code in language_tag.LANGUAGE_CODE) {
			if ((language_code = language_tag.LANGUAGE_CODE[language_code])
			// identity alias
			&& !language_tag.LANGUAGE_CODE[language_code])
				language_tag.LANGUAGE_CODE[language_code] = language_code;
		}
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
			library_namespace.debug('嘗試解析 [' + region + ']。', 3,
					'language_tag.region_code');
			if (/^[a-z\-]+$/i.test(region)) {
				library_namespace.debug('嘗試 reversed alias 的部分。', 3,
						'language_tag.region_code');
				// language_code → region_code
				// e.g., cmn-Hant → search cmn-hant
				code = language_tag.REGION_CODE[region.toLowerCase()];

			} else if (code = region.match(/^(.+)[語文]$/)) {
				code = language_tag.REGION_CODE[code[1]]
				// e.g., 英語 → search 英國
				|| language_tag.REGION_CODE[code[1] + '國'];
			} else {
				// e.g., 英 → search 英國
				code = language_tag.REGION_CODE[region + '國'];
			}

			if (!code && (code = region.match(/-([a-z]{2,3})$/)))
				// e.g., zh-tw → search TW
				code = language_tag.REGION_CODE[code[1].toUpperCase()];

			if (!code
			// identity alias
			&& !language_tag.REGION_CODE[code = region.toUpperCase()]) {
				// 依舊無法成功。
				if (library_namespace.is_debug())
					library_namespace
							.warn('language_tag.region_code: 無法辨識之國家/區域：['
									+ region + ']');
				if (regular_only)
					return;
			}
		}
		return code;
	}

	_// JSDT:_module_
	.language_tag = language_tag;

	// -----------------------------------------------------------------------------------------------------------------
	// 各個 domain 結尾標點符號的轉換。

	var halfwidth_to_fullwidth_mapping = {
		'.' : '。'
	}, fullwidth_to_halfwidth_mapping = {
		'、' : ',',
		'。' : '.'
	};

	var PATTERN_language_code_is_CJK = /^(?:cmn|yue|ja)-/;

	function convert_punctuation_mark(punctuation_mark, domain_name) {
		if (!punctuation_mark)
			return punctuation_mark;

		// test domains_using_fullwidth_form
		if (PATTERN_language_code_is_CJK.test(domain_name)) {
			// 東亞標點符號。
			if (punctuation_mark in halfwidth_to_fullwidth_mapping) {
				return halfwidth_to_fullwidth_mapping[punctuation_mark];
			}

			if (/^ *\.{3,} *$/.test(punctuation_mark)) {
				// 中文預設標點符號前後無空白。
				punctuation_mark = punctuation_mark.trim();
				return '…'.repeat(punctuation_mark.length > 6 ? Math
						.ceil(punctuation_mark.length / 3) : 2);
			}

			if (/^ja-/.test(domain_name) && punctuation_mark === ',') {
				return '、';
			}

			if (punctuation_mark.length === 1) {
				// https://en.wikipedia.org/wiki/Halfwidth_and_Fullwidth_Forms_(Unicode_block)
				var char_code = punctuation_mark.charCodeAt(0);
				if (char_code < 0xff) {
					return String.fromCharCode(char_code + 0xfee0);
				}
			}

		} else if (/^[^\x20-\xfe]/.test(punctuation_mark)) {
			if (punctuation_mark in fullwidth_to_halfwidth_mapping) {
				return fullwidth_to_halfwidth_mapping[punctuation_mark];
			}

			if (/^…+$/.test(punctuation_mark)) {
				return punctuation_mark.length > 2 ? '...'
						.repeat(punctuation_mark.length) : '...';
			}

			if (punctuation_mark.length === 1) {
				var char_code = punctuation_mark.charCodeAt(0);
				if (char_code > 0xfee0) {
					return String.fromCharCode(char_code - 0xfee0);
				}
			}
		}

		if (punctuation_mark.length > 1) {
			// PATTERN_punctuation_marks
			return punctuation_mark.replace(/%(\d)|(:)\s*|./g, function(p_m,
					NO, p_m_with_spaces) {
				if (NO)
					return p_m;
				if (p_m_with_spaces) {
					if (!PATTERN_language_code_is_CJK.test(domain_name))
						return p_m;
					p_m = p_m_with_spaces;
				}
				return convert_punctuation_mark(p_m, domain_name);
			});
		}

		return punctuation_mark;
	}

	// -----------------------------------------------------------------------------------------------------------------

	var plural_rules__domain_name = 'gettext_plural_rules';
	// plural_rules[language_code]
	// = [ #plural forms, function(){ return #plural form; } ]
	var plural_rules_of_language_code = Object.create(null);

	gettext.set_plural_rules = function set_plural_rules(plural_rules_Object) {
		for ( var language_code in plural_rules_Object) {
			var plural_rule = plural_rules_Object[language_code];
			language_code = gettext.to_standard(language_code);
			if (language_code) {
				plural_rules_of_language_code[language_code] = plural_rule;
			}// else: 尚未支援的語言。
		}
	};

	// ------------------------------------

	// matched: [ all behavior switch, is NO, NO ]
	var PATTERN_plural_switch_header = /\{\{PLURAL: *(%)?(\d+) *\|/,
	// matched: [ all behavior switch, previous, is NO, NO, parameters ]
	PATTERN_plural_switches_global = new RegExp('('
			+ PATTERN_plural_switch_header.source + ')'
			+ /([\s\S]+?)\}\}/.source, 'ig');

	// 處理 {{PLURAL:%1|summary|summaries}}
	// 處理 {{PLURAL:$1|1=you|$1 users including you}}
	// 處理 {{PLURAL:42|42=The answer is 42|Wrong answer|Wrong answers}}
	// https://raw.githubusercontent.com/wikimedia/mediawiki-extensions-Translate/master/data/plural-gettext.txt
	// https://translatewiki.net/wiki/Plural
	// https://docs.transifex.com/formats/gettext#plural-forms-in-a-po-file
	function adapt_plural(converted_text, value_list, domain_name) {
		var plural_count, plural_rule = plural_rules_of_language_code[domain_name];
		if (Array.isArray(plural_rule)) {
			plural_count = plural_rule[0];
			plural_rule = plural_rule[1];
		}
		// console.trace([ domain_name, plural_count, plural_rule ]);

		converted_text = converted_text.replace_till_stable(
		//
		PATTERN_plural_switches_global, function(all, _previous, is_NO, NO,
				parameters) {
			// https://translatewiki.net/wiki/Plural
			// And you can nest it freely
			// 自 end_mark 向前回溯。
			// TODO: using lookbehind search?
			var previous = '', nest_matched;
			while (nest_matched = parameters
					.match(PATTERN_plural_switch_header)) {
				previous += _previous
				//
				+ parameters.slice(0, nest_matched.index);
				_previous = nest_matched[0];
				is_NO = nest_matched[1];
				NO = nest_matched[2];
				parameters = parameters.slice(nest_matched.index
						+ _previous.length);
			}

			var value = is_NO ? value_list[NO] : NO;
			if (value < 0)
				value = -value;
			var plural_NO = (typeof plural_rule === 'function'
			//
			? plural_rule(+value) : plural_rule) + 1;

			var converted, default_converted, delta = 1;
			parameters = parameters.split('|');
			parameters.some(function(parameter, index) {
				var matched = parameter.match(/^(\d+)=([\s\S]*)$/);
				if (matched) {
					delta--;
					index = +matched[1];
					parameter = matched[2];
					if (index == value) {
						converted = parameter;
						return true;
					}
					if (!default_converted)
						default_converted = parameter;
					return;
				}

				index += delta;
				if (plural_NO >= 1) {
					if (index === plural_NO) {
						converted = parameter;
						// Do not return. Incase {{PLURAL:5|one|other|5=5}}
					} else if (index === 2 && plural_count !== 2
					// Special case. e.g., {{PLURAL:2||s}}
					// @ zh(plural_count=1), ru(3), NOT fr(2)
					&& value != 1 && parameters.length === 2) {
						converted = parameter;
						// assert: Should be the last element of parameters.
					} else {
						default_converted = parameter;
					}
					return;
				}

				/**
				 * https://translatewiki.net/wiki/Plural
				 * 
				 * If the number of forms written is less than the number of
				 * forms required by the plural rules of the language, the last
				 * available form will be used for all missing forms.
				 */
				default_converted = parameter;
				if (index == value) {
					converted = parameter;
					return true;
				}
			});

			return previous
			//
			+ (converted === undefined ? default_converted : converted);
		});

		return converted_text;
	}

	gettext.adapt_plural = adapt_plural;

	// -----------------------------------------------------------------------------------------------------------------
	// JavaScript 國際化 i18n (Internationalization) / 在地化 本土化 l10n (Localization)
	// / 全球化 g11n (Globalization).

	/**
	 * 為各種不同 domain 轉換文字（句子）、轉成符合當地語言的訊息內容。包括但不僅限於各種語系。<br />
	 * 需要確認系統相應 domain resources 已載入時，請利用 gettext.use_domain(domain, callback)。
	 * 
	 * TODO: using localStorage.<br />
	 * https://translatewiki.net/wiki/Plural
	 * 
	 * @example <code>

	// More examples: see /_test suite/test.js

	 * </code>
	 * 
	 * @param {String|Function|Object}text_id
	 *            欲呼叫之 text id。<br /> ** 若未能取得，將直接使用此值。因此即使使用簡單的代號，也建議使用
	 *            msg#12, msg[12] 之類的表示法，而非直接以整數序號代替。<br />
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
	 *      accessdate="2012/9/9 0:13">Internationalization in Javascript -
	 *      Stack Overflow</a>,<br />
	 *      <a
	 *      href="http://stackoverflow.com/questions/9640630/javascript-i18n-internationalization-frameworks-libraries-for-clientside-use"
	 *      accessdate="2012/9/9 0:13">javascript i18n (internationalization)
	 *      frameworks/libraries for clientside use - Stack Overflow</a>,<br />
	 *      <a href="http://msdn.microsoft.com/en-us/library/txafckwd.aspx"
	 *      accessdate="2012/9/17 23:0">Composite Formatting</a>,
	 *      http://wiki.ecmascript.org/doku.php?id=strawman:string_format,
	 *      http://wiki.ecmascript.org/doku.php?id=strawman:string_format_take_two
	 */
	function gettext(/* message */text_id/* , ...value_list */) {
		// 轉換 / convert function.
		function convert(text_id, domain_specified) {
			// 未設定個別 domain 者，將以此訊息(text_id)顯示。
			// text_id 一般應採用原文(message of original language)，
			// 或最常用語言；亦可以代碼(message id)表示，但須設定所有可能使用的語言。
			// console.log(text_id);

			var prefix, postfix;
			if (library_namespace.is_debug(12)) {
				console.trace(domain);
			}

			// 注意: 在 text_id 與所屬 domain 之 converted_text 相同的情況下，
			// domain 中不會有這一筆記錄。
			// 因此無法以 `text_id in domain` 來判別 fallback。
			if (typeof text_id === 'function' || typeof text_id === 'object') {
				using_default = true;
			} else if (!(text_id in domain)) {
				var matched = String(text_id).match(
						PATTERN_message_with_tail_punctuation_mark);
				if (matched && (matched[2] in domain)) {
					prefix = matched[1];
					postfix = matched[3];
					text_id = matched[2];
				} else {
					using_default = true;
				}
			}
			if (!using_default) {
				text_id = domain[text_id];
				if (prefix) {
					text_id = convert_punctuation_mark(prefix, domain_name)
							+ text_id;
				}
				if (postfix
				// 預防翻譯後有結尾標點符號，但原文沒有的情況。但這情況其實應該警示。
				// && !PATTERN_message_with_tail_punctuation_mark.test(text_id)
				) {
					text_id += convert_punctuation_mark(postfix, domain_name);
				}
			}

			return typeof text_id === 'function' ? text_id(domain_name,
					value_list, domain_specified) : text_id;
		}

		function try_domain(_domain_name, recover) {
			var original_domain_data = [ domain_name, domain ];

			domain_name = _domain_name;
			// 在不明環境，如 node.js 中執行時，((gettext_texts[domain_name])) 可能為
			// undefined。
			domain = gettext_texts[domain_name];

			if (!domain) {
				if (false) {
					// No 強制載入 flag here.
					library_namespace.warn({
						// gettext_config:{"id":"specified-domain-$1-is-not-yet-loaded.-you-may-need-to-set-the-force-flag"}
						T : [ '所指定之 domain [%1] 尚未載入，若有必要請使用強制載入 flag。',
								domain_name ]
					});
				}
				domain = Object.create(null);
			}

			var _text = String(convert(library_namespace.is_Object(text_id) ? text_id[domain_name]
					: text_id));

			if (recover) {
				domain_name = original_domain_data[0];
				domain = original_domain_data[1];
			}
			return _text;
		}

		var value_list = arguments, length = value_list.length, using_default,
		// this: 本次轉換之特殊設定。
		domain_name = this && this.domain_name || gettext_domain_name,
		//
		domain, converted_text = try_domain(domain_name),
		// 強制轉換/必須轉換 force convert. e.g., 輸入 id，因此不能以 text_id 顯示。
		force_convert = using_default && this && (this.force_convert
		// for DOM
		|| this.getAttribute && this.getAttribute('force_convert'));

		// 設定 force_convert 時，最好先 `gettext.load_domain(force_convert)`
		// 以避免最後仍找不到任何一個可用的 domain。
		if (force_convert) {
			// force_convert: fallback_domain_name_list
			if (!Array.isArray(force_convert))
				force_convert = force_convert.split(',');
			force_convert.some(function(_domain_name) {
				_domain_name = gettext.to_standard(_domain_name);
				if (!_domain_name || _domain_name === domain_name)
					return;
				var _text = try_domain(_domain_name, true);
				if (!using_default) {
					domain_name = _domain_name;
					converted_text = _text;
					// using the first matched
					return true;
				}
			});
		}

		library_namespace
				.debug('Use domain_name: ' + domain_name, 6, 'gettext');

		converted_text = adapt_plural(converted_text, value_list, domain_name);

		if (length <= 1) {
			// assert: {String}converted_text
			return converted_text;
		}

		var text_list = [], matched, last_index = 0,
		// 允許 convert 出的結果為 object。
		has_object = false,
		// whole conversion specification:
		// %% || %index || %domain/index
		// || %\w(conversion format specifier)\d{1,2}(index)
		// || %[conversion specifications@]index
		//
		// 警告: index 以 "|" 終結，後接數字會被視為 patten 明確終結，並且 "|" 將被吃掉。
		// e.g., gettest("%1|123", 321) === "321123"
		// gettest("%1||123", 321) === "321||123"
		// TODO: 改成 %{index}, %{var_id}
		//
		// @see CeL.extract_literals()
		//
		// 採用 local variable，因為可能有 multithreading 的問題。
		conversion_pattern = /([\s\S]*?)%(?:(%)|(?:([^%@\s\|\/]+)\/)?(?:([^%@\s\|\d]{1,3})|([^%@\|]+)@)?(\d{1,2})(\|[\|\d])?)/g;

		while (matched = conversion_pattern.exec(converted_text)) {
			if (matched[7]) {
				// 回吐最後一個 \d
				conversion_pattern.lastIndex--;
				// conversion_pattern.lastIndex -= matched[7].length
				// - '|'.length;
			}
			last_index = conversion_pattern.lastIndex;

			// matched:
			// 0: prefix + conversion, 1: prefix, 2: is_escaped "%",
			// 3: domain_specified, 4: format, 5: object_name, 6: argument NO,
			// 7: "|" + \d.
			var conversion = matched[0];

			if (matched[2]) {
				// e.g., 'prefix%%...'
				// assert: matched[3] 之後全都沒東西。
				text_list.push(conversion);
				continue;
			}

			var NO = +matched[6], format = matched[4], _matched;
			if (NO < length && (!(format || (format = matched[5]))
			// 有設定 {String}format 的話，就必須在 gettext.conversion 中。
			|| (format in gettext.conversion))) {
				if (NO === 0) {
					conversion = text_id;
				} else {
					var domain_specified = matched[3],
					//
					domain_used = domain_specified
							&& gettext_texts[domain_specified];
					if (domain_used) {
						// 避免 %0 形成 infinite loop。
						var origin_domain = domain, origin_domain_name = domain_name;
						library_namespace.debug('臨時改變 domain: ' + domain_name
								+ '→' + domain_specified, 6, 'gettext');
						domain_name = domain_specified;
						domain = domain_used;
						conversion = convert(value_list[NO], domain_specified);
						library_namespace.debug('回存/回復 domain: ' + domain_name
								+ '→' + origin_domain_name, 6, 'gettext');
						domain_name = origin_domain_name;
						domain = origin_domain;
					} else {
						if (domain_specified) {
							library_namespace.warn('gettext: '
									+ 'Unknown domain [' + domain_specified
									+ ']');
						}
						conversion = convert(value_list[NO]);
					}
				}

				if (format) {
					conversion = Array.isArray(NO = gettext.conversion[format])
					//
					? gettext_conversion_Array(conversion, NO, format)
					// assert: gettext.conversion[format] is function
					: NO(conversion, domain_specified || domain_name);
				}

			} else if (format && matched[3]
			// The same index passern as conversion_pattern
			&& (_matched = matched[3].match(/(\d{1,2})/))
					&& _matched[0] < length) {
				// e.g., CeL.gettext('<h1>%1</h1>', 't')
				format = null;
				NO = _matched[0];
				last_index =
				// reset.
				// assert: last_index === matched[0].length
				// last_index - matched[0].length +
				//
				// 加回這次處理的部分。 1: 前導 '%'.length
				1 + matched[1].length + NO.length;
				conversion = convert(value_list[NO]);

			} else {
				library_namespace.warn('gettext: '
				//
				+ (NO < length ? 'Unknown format [' + format + ']'
				//
				: 'given too few arguments: ' + length + ' <= No. ' + NO));
			}

			if (typeof conversion === 'object') {
				has_object = true;
				text_list.push(matched[1], conversion);
			} else {
				// String(conversion): for Symbol value
				text_list.push(matched[1] + String(conversion));
			}
		}

		text_list.push(converted_text.slice(last_index));
		return has_object ? text_list : text_list.join('');
	}

	var PATTERN_is_punctuation_mark = /^[,;:.?!~、，；：。？！～]$/;
	// matched: [ all, header punctuation mark, text_id / message, tail
	// punctuation mark ]
	var PATTERN_message_with_tail_punctuation_mark = /^(\.{3,}\s*)?([\s\S]+?)(\.{3,}|…+|:\s*(%\d)?|[,;:.?!~、，；：。？！～])$/;

	function trim_punctuation_marks(text) {
		var matched = text.match(PATTERN_message_with_tail_punctuation_mark);
		return matched ? matched[2] : text;
	}

	_.trim_punctuation_marks = trim_punctuation_marks;

	// ------------------------------------------------------------------------

	// 應對多個句子在不同語言下結合時使用。
	function Sentence_combination(sentence) {
		// call super constructor.
		// Array.call(this);

		var sentence_combination = this;
		if (sentence) {
			if (Array.isArray(sentence) && sentence.every(function(_sentence) {
				return Array.isArray(_sentence);
			})) {
				// e.g., new CeL.gettext.Sentence_combination(
				// [ [ 'message', p1 ], [ 'message' ] ])
				sentence_combination.append(sentence);
			} else {
				// e.g., new CeL.gettext.Sentence_combination(
				// [ 'message', p1, p2 ])
				sentence_combination.push(sentence);
			}
		}
	}

	function deep_convert(text) {
		if (!Array.isArray(text)) {
			var converted = gettext(text);
			if (converted === text && PATTERN_is_punctuation_mark.test(text)) {
				// e.g., text === ','
				converted = convert_punctuation_mark(text, gettext_domain_name);
			}
			return converted;
		}

		// e.g., [ '%1 elapsed.', ['%1 s', 2] ]
		var converted = [ text[0] ];
		for (var index = 1; index < text.length; index++) {
			converted[index] = deep_convert(text[index]);
		}
		return gettext.apply(null, converted);
	}

	function Sentence_combination__converting() {
		var converted_list = [];
		this.forEach(function(sentence) {
			sentence = deep_convert(sentence);
			if (sentence)
				converted_list.push(sentence);
		});

		return converted_list;
	}

	// @see CeL.data.count_word()
	// 這些標點符號和下一句中間可以不用接空白字元。
	// /[\u4e00-\u9fa5]/: 匹配中文字 RegExp。
	// https://en.wikipedia.org/wiki/CJK_Unified_Ideographs_(Unicode_block)
	// https://arc-tech.hatenablog.com/entry/2021/01/20/105620
	// e.g., start quote marks
	var PATTERN_no_need_to_append_tail_space = /[\s—、，；：。？！（）［］｛｝「」『』〔〕【】〖〗〈〉《》“”‘’§(\[<{⟨‹«\u4e00-\u9fffぁ-んーァ-ヶ]$/;
	// e.g., end quote marks
	var PATTERN_no_need_to_add_header_space = /^[\s)\]>}⟩›»）］｝」』〕】〗〉》”’‰‱]/;

	function Sentence_combination__join(separator) {
		// console.trace(this);
		var converted_list = this.converting();
		if (separator || separator === '')
			return converted_list.join(separator);

		for (var index = 0; index < converted_list.length;) {
			var converted = converted_list[index];
			// console.trace([ index, converted ]);
			if (!converted
			// 要處理首字母大小寫轉換，所以不直接跳出。
			// || PATTERN_no_need_to_append_tail_space.test(converted)
			) {
				++index;
				continue;
			}

			var next_sentence, original_index = index, must_lower_case = /[,;、，；]\s*$/
					.test(converted) ? true
					: /[.?!。？！]\s*$/.test(converted) ? false : undefined;
			while (++index < converted_list.length) {
				next_sentence = converted_list[index];
				// console.trace([ converted, next_sentence, must_lower_case ]);
				// 處理首字母大小寫轉換。
				if (next_sentence && typeof must_lower_case === 'boolean') {
					var leading_spaces = next_sentence.match(/^\s+/);
					if (leading_spaces) {
						leading_spaces = leading_spaces[0];
						next_sentence = next_sentence
								.slice(leading_spaces.length);
					}
					var first_char = next_sentence.charAt(0);
					if (must_lower_case
							^ (first_char === first_char.toLowerCase())) {
						next_sentence = (must_lower_case ? first_char
								.toLowerCase() : first_char.toUpperCase())
								+ next_sentence.slice(1);
					}
					if (leading_spaces) {
						next_sentence = leading_spaces + next_sentence;
					}
					converted_list[index] = next_sentence;
				}

				// 增加子句間的空格。
				// 找出下一個（非空內容的）文字，檢查是否該在本token(converted_list[original_index])結尾加上空白字元。
				if (next_sentence || next_sentence === 0) {
					if (!PATTERN_no_need_to_append_tail_space.test(converted)
					//
					&& !PATTERN_no_need_to_add_header_space.test(next_sentence)) {
						converted_list[original_index] += ' ';
					}
					break;
				}
			}
			// console.trace([ index, converted_list[index] ]);
		}

		converted_list = converted_list.join('');
		// TODO: upper-case the first char
		return converted_list;
	}

	// https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Object/create
	Sentence_combination.prototype
	// 繼承一個父類別
	= Object.assign(Object.create(Array.prototype), {
		// 重新指定建構式
		constructor : Sentence_combination,
		converting : Sentence_combination__converting,
		join : Sentence_combination__join,
		toString : Sentence_combination__join
	});

	/**
	 * @example<code>

	messages = new gettext.Sentence_combination();
	messages.push(message, [ message ], [ message, arg_1, arg_2 ]);
	messages.toString();

	</code>
	 */
	gettext.Sentence_combination = Sentence_combination;

	function append_message_tail_space(text, options) {
		if (!options || typeof options === 'string' || !options.no_more_convert) {
			// Treat `options` as an argument to gettext.
			text = gettext.apply(null, arguments);
		}
		if (!text || PATTERN_no_need_to_append_tail_space.test(text)) {
			return text;
		}

		var next_sentence = options && options.next_sentence;
		return next_sentence
				&& !PATTERN_no_need_to_add_header_space.test(next_sentence)
				|| next_sentence === 0 ? text + ' ' : text;
	}

	gettext.append_message_tail_space = append_message_tail_space;

	// ------------------------------------------------------------------------

	// 不改變預設domain，直接取得特定domain的轉換過的文字。
	// 警告：需要確保系統相應 domain resources 已載入並設定好。
	gettext.in_domain = function(domain_name, text_id) {
		var options = typeof domain_name === 'object' ? domain_name
		//
		: typeof domain_name === 'string' ? {
			domain_name : gettext.to_standard(domain_name)
		} : {
			domain : domain_name
		};

		if (false && Array.isArray(text_id)) {
			return gettext.apply(options, text_id);
		}

		if (arguments.length <= 2) {
			// 沒有多餘的參數設定(e.g., %1, %2)。
			return gettext.call(options, text_id);
		}

		var value_list = Array.prototype.slice.call(arguments);
		value_list.shift();
		return gettext.apply(options, value_list);
	};

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
	function gettext_check_resources(domain_name, type, is_loaded) {
		if (!domain_name)
			domain_name = gettext_domain_name;

		var domain = gettext_resource[domain_name];
		if (!domain)
			gettext_resource[domain_name] = domain = Object.create(null);

		if (type)
			if (type = [ , 'system', 'user' ][type]) {
				if (typeof is_loaded === 'boolean') {
					library_namespace.debug('登記 [' + domain_name + '] 已經載入資源 ['
							+ type + ']。', 2, 'gettext_check_resources');
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
	function gettext_conversion_Array(amount, conversion_Array, name) {
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
			while (index >= 0 && !(text = conversion_Array[index]))
				index--;

		if (!text || typeof text !== 'string') {
			library_namespace.warn({
				T : [ 'Nothing matched for amount [%1]', amount ]
			});
			return;
		}

		if (name)
			text = text.replace(/%n/g, name);

		return text.replace(/%d/g, amount);
	}

	/**
	 * 設定如何載入指定 domain resources，如語系檔。
	 * 
	 * @param {String|Function}path
	 *            (String) prefix of path to load.<br />
	 *            function(domain){return path to load;}
	 */
	gettext.use_domain_location = function(path) {
		if (typeof path === 'string') {
			gettext_domain_location = path;
			// 重設 user domain resources path。
			gettext_check_resources('', 2, false);
		}
		return gettext_domain_location;
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
		return gettext_domain_name === gettext.to_standard(domain_name);
	};

	// force: 若 domain name 已經載入過，則再度載入。
	function load_domain(domain_name, callback, force) {
		var do_not_register = domain_name === plural_rules__domain_name;
		if (!domain_name || !do_not_register
				&& !(domain_name = gettext.to_standard(domain_name))) {
			// using the default domain name.
			domain_name = gettext.default_domain;
		}

		if (!domain_name || domain_name === gettext_domain_name && !force) {
			typeof callback === 'function' && callback(domain_name);
			return;
		}

		if (!(domain_name in gettext_texts) && !!do_not_register) {
			// initialization
			gettext_texts[domain_name] = Object.create(null);
		}

		var need_to_load = [];
		// TODO: use <a href="http://en.wikipedia.org/wiki/JSONP"
		// accessdate="2012/9/14 23:50">JSONP</a>
		if (!gettext_check_resources(domain_name, 1)) {
			library_namespace.debug('準備載入系統相應 domain resources。', 2, 'gettext');
			need_to_load.push(library_namespace.get_module_path(module_name,
			// resources/
			CeL.env.resources_directory_name + '/' + domain_name + '.js'),
			//
			function() {
				if (do_not_register)
					return;
				library_namespace.debug('Resources of module included.', 2,
						'gettext');
				gettext_check_resources(domain_name, 1, true);
			});
		}

		if (typeof gettext_domain_location === 'function') {
			gettext_domain_location = gettext_domain_location();
		}

		if (typeof gettext_domain_location === 'string'
		//
		&& !gettext_check_resources(domain_name, 2)) {
			library_namespace.debug('準備載入 user 指定 domain resources，如語系檔。', 2,
					'gettext');
			need_to_load.push(typeof gettext_domain_location === 'string'
			// 因 same-origin policy，採 .js 而非其他 file type 如 .json。
			? gettext_domain_location + domain_name + '.js'
					: gettext_domain_location(domain_name), function() {
				library_namespace.debug('User-defined resources included.', 2,
						'gettext');
				gettext_check_resources(domain_name, 2, true);
			});
		}

		if (need_to_load.length > 0) {
			// console.trace(need_to_load);
			library_namespace.debug('need_to_load: ' + need_to_load, 2,
					'load_domain');
			library_namespace.run(need_to_load, typeof callback === 'function'
					&& function() {
						library_namespace.debug('Running callback...', 2,
								'gettext');
						callback(domain_name);
					});
		} else {
			library_namespace.debug('Nothing to load.');
			gettext_check_resources(domain_name, 2, true);
		}
	}

	gettext.load_domain = load_domain;

	/**
	 * 取得/設定當前使用之 domain。
	 * 
	 * @example<code>

	// for i18n: define gettext() user domain resources path / location.
	// gettext() will auto load (CeL.env.domain_location + language + '.js').
	// e.g., resources/cmn-Hant-TW.js, resources/ja-JP.js
	CeL.gettext.use_domain_location(module.filename.replace(/[^\\\/]*$/,
			'resources' + CeL.env.path_separator));

	CeL.gettext.use_domain('GUESS', true);

	</code>
	 * 
	 * @param {String}[domain_name]
	 *            設定當前使用之 domain name。
	 * @param {Function}[callback]
	 *            回撥函式。 callback(domain_name)
	 * @param {Boolean}[force]
	 *            強制載入 flag。即使尚未載入此 domain，亦設定之並自動載入。但是若 domain name
	 *            已經載入過，則不會再度載入。
	 * 
	 * @returns {Object}當前使用之 domain。
	 */
	function use_domain(domain_name, callback, force) {
		if (typeof callback === 'boolean' && force === undefined) {
			// shift 掉 callback。
			force = callback;
			callback = undefined;
		}

		if (domain_name === 'GUESS') {
			domain_name = guess_language();
		}

		if (!domain_name) {
			domain_name = gettext_texts[gettext_domain_name];
			typeof callback === 'function' && callback(domain_name);
			// return domain used now.
			return domain_name;
		}

		// 查驗 domain_name 是否已載入。
		var is_loaded = domain_name in gettext_texts;
		if (!is_loaded) {
			is_loaded = gettext.to_standard(domain_name);
			if (is_loaded) {
				is_loaded = (domain_name = is_loaded) in gettext_texts;
			}
		}

		if (is_loaded) {
			gettext_domain_name = domain_name;
			library_namespace.debug({
				// gettext_config:{"id":"$1-is-loaded-setting-up-user-domain-resources-now"}
				T : [ '已載入過 [%1]，直接設定使用者自訂資源。', domain_name ]
			}, 2, 'gettext.use_domain');
			gettext_check_resources(domain_name, 2, true);
			typeof callback === 'function' && callback(domain_name);

		} else if (force && domain_name) {
			if (library_namespace.is_WWW()
					&& library_namespace.is_included('interact.DOM')) {
				// 顯示使用 domain name 之訊息：此時執行，仍無法改採新 domain 顯示訊息。
				library_namespace.debug({
					T : [ domain_name === gettext_domain_name
					// gettext_config:{"id":"force-loading-using-domain-locale-$2-($1)"}
					? '強制再次載入/使用 [%2] (%1) 領域/語系。'
					// gettext_config:{"id":"loading-using-domain-locale-$2-($1)"}
					: '載入/使用 [%2] (%1) 領域/語系。', domain_name,
							gettext.get_alias(domain_name) ]
				}, 1, 'gettext.use_domain');
			} else {
				library_namespace.debug(
				// re-load
				(domain_name === gettext_domain_name ? 'FORCE ' : '')
						+ 'Loading/Using domain/locale ['
						+ gettext.get_alias(domain_name) + '] (' + domain_name
						+ ').', 1, 'gettext.use_domain');
			}

			if (!(domain_name in gettext_texts)) {
				// 為確保回傳的是最終的domain，先初始化。
				gettext_texts[domain_name] = Object.create(null);
			}

			load_domain(domain_name, function() {
				gettext_domain_name = domain_name;
				typeof callback === 'function' && callback(domain_name);
			});

		} else {
			if (domain_name) {
				if (domain_name !== gettext_domain_name) {
					library_namespace.warn({
						// gettext_config:{"id":"specified-domain-$1-is-not-yet-loaded.-you-may-need-to-set-the-force-flag"}
						T : [ '所指定之 domain [%1] 尚未載入，若有必要請使用強制載入 flag。',
								domain_name ]
					});
				}

			} else if (typeof callback === 'function'
					&& library_namespace.is_debug())
				// gettext_config:{"id":"unable-to-distinguish-domain-but-set-callback"}
				library_namespace.warn('無法判別 domain，卻設定有 callback。');

			// 無論如何還是執行 callback。
			typeof callback === 'function' && callback(domain_name);
		}

		return gettext_texts[domain_name];
	}

	// using_domain
	gettext.use_domain = use_domain;

	function guess_language() {

		if (library_namespace.is_WWW()) {
			// http://stackoverflow.com/questions/1043339/javascript-for-detecting-browser-language-preference
			return gettext.to_standard(navigator.userLanguage
					|| navigator.language
					// || navigator.languages && navigator.languages[0]
					// IE 11
					|| navigator.browserLanguage || navigator.systemLanguage);
		}

		function exec(command, PATTERN, mapping) {
			try {
				// @see https://gist.github.com/kaizhu256/a4568cb7dac2912fc5ed
				// synchronously run system command in nodejs <= 0.10.x
				// https://github.com/gvarsanyi/sync-exec/blob/master/js/sync-exec.js
				// if (!require('child_process').execSync) { return; }

				var code = require('child_process').execSync(command, {
					stdio : 'pipe'
				}).toString();
				// console.trace([ command, code ]);
				if (PATTERN)
					code = code.match(PATTERN)[1];
				if (mapping)
					code = mapping[code];
				return gettext.to_standard(code);
			} catch (e) {
				// TODO: handle exception
			}
		}

		// console.trace(library_namespace.platform.is_Windows());
		if (library_namespace.platform.is_Windows()) {
			// TODO:
			// `REG QUERY HKLM\System\CurrentControlSet\Control\Nls\Language /v
			// InstallLanguage`

			// https://www.lisenet.com/2014/get-windows-system-information-via-wmi-command-line-wmic/
			// TODO: `wmic OS get Caption,CSDVersion,OSArchitecture,Version`
			// require('os').release()

			return exec(
					// https://docs.microsoft.com/zh-tw/powershell/module/international/get-winsystemlocale?view=win10-ps
					'PowerShell.exe -Command "& {Get-WinSystemLocale | Select-Object LCID}"',
					/(\d+)[^\d]*$/, guess_language.LCID_mapping)
					// WMIC is deprecated.
					// https://stackoverflow.com/questions/1610337/how-can-i-find-the-current-windows-language-from-cmd
					// get 非 Unicode 應用程式的語言與系統地區設定所定義的語言
					|| exec('WMIC.EXE OS GET CodeSet', /(\d+)[^\d]*$/,
							guess_language.code_page_mapping)
					// using windows active console code page
					// https://docs.microsoft.com/en-us/windows/console/console-code-pages
					// CHCP may get 65001, so we do not use this at first.
					|| exec('CHCP', /(\d+)[^\d]*$/,
							guess_language.code_page_mapping);
		}

		/**
		 * <code>

		@see https://www.itread01.com/content/1546711411.html

		TODO: detect process.env.TZ: node.js 設定測試環境使用

		GreenWich時間
		process.env.TZ = 'Europe/London';

		timezone = {
			'Europe/London' : 0,
			'Asia/Shanghai' : -8,
			'America/New_York' : 5
		};

		</code>
		 */

		var LANG = library_namespace.env.LANG;
		// e.g., LANG=zh_TW.Big5
		// en_US.UTF-8
		if (LANG)
			return gettext.to_standard(LANG);

		return exec('locale', /(?:^|\n)LANG=([^\n]+)/);
	}

	// https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/chcp
	guess_language.code_page_mapping = {
		437 : 'en-US',
		866 : 'ru-RU',
		932 : 'ja-JP',
		936 : 'cmn-Hans-CN',
		949 : 'ko-KR',
		950 : 'cmn-Hant-TW',
		1256 : 'arb-Arab',
		54936 : 'cmn-Hans-CN'
	// 65001: 'Unicode'
	};

	// https://zh.wikipedia.org/wiki/区域设置#列表
	guess_language.LCID_mapping = {
		1028 : 'cmn-Hant-TW',
		1033 : 'en-US',
		1041 : 'ja-JP',
		1042 : 'ko-KR',
		1049 : 'ru-RU',
		2052 : 'cmn-Hans-CN',
		2057 : 'en-GB',
		3076 : 'cmn-Hant-HK',
		14337 : 'arb-Arab'
	};

	gettext.guess_language = guess_language;

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
	 * @param {Boolean}[clean_and_replace]
	 *            是否直接覆蓋掉原先之 domain。
	 */
	gettext.set_text = function set_text(text_Object, domain, clean_and_replace) {
		if (!library_namespace.is_Object(text_Object))
			return;

		if (!domain)
			domain = gettext_domain_name;

		// normalize domain
		if (!(domain in gettext_texts))
			domain = gettext.to_standard(domain);
		// console.trace(domain);

		if (clean_and_replace || !(domain in gettext_texts)) {
			gettext_texts[domain] = text_Object;
		} else {
			// specify a new domain.
			// gettext_texts[domain] = Object.create(null);

			// CeL.set_method() 不覆蓋原有的設定。
			// library_namespace.set_method(gettext_texts[domain], text_Object);

			// 覆蓋原有的設定。
			Object.assign(gettext_texts[domain], text_Object);
		}
	};

	// ------------------------------------

	/**
	 * 取得 domain 別名。 若欲取得某個語言在其他語言中的名稱，應該設定好i18n，並以gettext()取得。
	 * 
	 * @param {String}[language]
	 *            指定之正規名稱。
	 * @returns {String} 主要使用之別名。
	 * @returns {Object} { 正規名稱 : 別名 }
	 */
	gettext.get_alias = function(language) {
		return arguments.length > 0 ? gettext_main_alias[language in gettext_main_alias ? language
				: gettext.to_standard(language)]
				: gettext_main_alias;
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

		/** {String}normalized domain name */
		var norm;
		/** {String}domain alias */
		var alias;
		/** {Array}domain alias list */
		var alias_list, i, l;
		for (norm in list) {
			alias_list = list[norm];
			if (typeof alias_list === 'string') {
				alias_list = alias_list.split('|');
			} else if (!Array.isArray(alias_list)) {
				library_namespace.warn([ 'gettext.set_alias: ', {
					// gettext_config:{"id":"illegal-domain-alias-list-$1"}
					T : [ 'Illegal domain alias list: [%1]', alias_list ]
				} ]);
				continue;
			}

			// 加入 norm 本身。
			alias_list.push(norm);

			for (i = 0, l = alias_list.length; i < l; i++) {
				alias = alias_list[i];
				if (!alias) {
					continue;
				}

				library_namespace.debug({
					// gettext_config:{"id":"adding-domain-alias-$1-→-$2"}
					T : [ 'Adding domain alias [%1] → [%2]...',
					//
					alias, norm ]
				}, 2, 'gettext.set_alias');
				if (!(norm in gettext_main_alias))
					gettext_main_alias[norm] = alias;

				// 正規化: 不分大小寫, _ → -
				alias = alias.replace(/_/g, '-').toLowerCase();
				alias.split(/-/).forEach(function(token) {
					if (!gettext_aliases[token])
						gettext_aliases[token] = [];
					if (!gettext_aliases[token].includes(norm))
						gettext_aliases[token].push(norm);
				});
				continue;

				// for fallback
				while (true) {
					gettext_aliases[alias] = norm;

					var index = alias.lastIndexOf('-');
					if (index < 1)
						break;
					alias = alias.slice(0, index);
				}
			}
		}
	};

	/**
	 * 將 domain 別名正規化，轉為正規/標準名稱。<br />
	 * to a standard form. normalize_domain_name().
	 * 
	 * TODO: fix CeL.gettext.to_standard('cmn-CN') ===
	 * CeL.gettext.to_standard('zh-CN')
	 * 
	 * @param {String}alias
	 *            指定之別名。
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @returns {String} 正規名稱。
	 * @returns undefined : can't found.
	 */
	gettext.to_standard = function to_standard(alias, options) {
		if (typeof alias !== 'string')
			return;

		if (options === true) {
			options = {
				get_list : true
			};
		} else {
			options = library_namespace.setup_options(options);
		}

		// 正規化: 不分大小寫, _ → -
		alias = alias.replace(/_/g, '-').toLowerCase();

		var candidates;
		alias.split(/-/)
		// 通常越後面的越有特殊性。
		.reverse().some(function(token) {
			if (!gettext_aliases[token])
				return;
			// console.log(token + ': ' +
			// JSON.stringify(gettext_aliases[token]));
			if (!candidates) {
				candidates = gettext_aliases[token];
				return;
			}

			// 取交集。
			candidates = Array.intersection(candidates,
			//
			gettext_aliases[token]);
			// console.log('candidates: ' + JSON.stringify(candidates));
			if (candidates.length < 2) {
				return true;
			}
		});

		return options.get_list ? candidates ? candidates.clone() : []
				: candidates && candidates[0];

		var index;
		// for fallback
		while (true) {
			library_namespace.debug({
				// gettext_config:{"id":"testing-domain-alias-$1"}
				T : [ 'Testing domain alias [%1]...', alias ]
			}, 6, 'gettext.to_standard');
			if (alias in gettext_aliases)
				return gettext_aliases[alias];

			index = alias.lastIndexOf('-');
			if (index < 1)
				return;
			alias = alias.slice(0, index);
		}
	};

	var time_zone_of = {
		// JST
		'ja-JP' : 9,
		// CST
		'cmn-Hans-CN' : 8,
		'cmn-Hant-TW' : 8
	};

	// @see String_to_Date.zone @ CeL.data.date
	function time_zone_of_language(language) {
		return language in time_zone_of ? time_zone_of[language]
				: time_zone_of[gettext.to_standard(language)];
	}

	_.time_zone_of_language = time_zone_of_language;

	function detect_HTML_language(HTML) {
		// e.g., <html xml:lang="ja" lang="ja">
		var matched = HTML.match(/<html ([^<>]+)>/);
		if (matched
				&& (matched = matched[1]
						.match(/lang=(?:"([^"]+)"|([^\s<>]+))/i))) {
			return gettext.to_standard(matched[1] || matched[2]);
		}

		matched = HTML.match(/<meta [^<>]+?content=(?:"([^"]+)"|([^\s<>]+))/i);
		if (matched
				&& (matched = (matched[1] || matched[2])
						.match(/charset=([^;]+)/))) {
			// TODO: combine CeL.data.character
			matched = matched[1];
			matched = {
				big5 : 'cmn-Hant-TW',
				gbk : 'cmn-Hans-CN',
				gb2312 : 'cmn-Hans-CN',
				eucjp : 'ja-JP',
				shiftjis : 'ja-JP',
				sjis : 'ja-JP'
			}[matched.toLowerCase().replace(/[\s\-]/g, '')] || matched;
			return gettext.to_standard(matched);
		}

		// Can't determine what language the html used.
	}

	_.detect_HTML_language = detect_HTML_language;

	// ------------------------------------
	// DOM 操作。

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
			CeL.gettext.document_title = 'document_title';

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
		var dataset,
		// message id
		id, conversion, i = 0, key;
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
					// IE 8 中，除了 document.title，本工具大部分顯示皆能以 translate_nodes()
					// 處理。
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
			library_namespace.warn([ 'gettext.translate_node: ', {
				// gettext_config:{"id":"failed-to-extract-gettext-id"}
				T : 'Failed to extract gettext id.'
			} ]);
		}

		if (!dataset)
			return;

		var gettext_DOM_title_id = gettext_DOM_id + '_element_title';
		if (node.title && !dataset[gettext_DOM_title_id]
				&& gettext_texts[gettext_domain_name]
				&& (node.title in gettext_texts[gettext_domain_name])) {
			dataset[gettext_DOM_title_id] = node.title;
		}
		if (dataset[gettext_DOM_title_id]) {
			node.title = gettext(dataset[gettext_DOM_title_id]);
		}

		if (id) {
			conversion = [ id ];
			while ((key = gettext_DOM_id + ++i) in dataset)
				conversion.push(dataset[key]);
			if (node.on_language_changed)
				node.on_language_changed(conversion);
			else
				library_namespace.set_text(node, gettext
						.apply(node, conversion));
		} else if (node.on_language_changed) {
			// @see CeL.DOM.new_node()
			node.on_language_changed(conversion);
		}
	};
	// for DOM use.
	// <tag data-gettext="text id" data-gettext1="conversion 1"
	// data-gettext2="conversion 2" />
	gettext.DOM_id_key = gettext_DOM_id = 'gettext';
	gettext.DOM_separator = '|';

	gettext.adapt_domain = function(language, callback) {
		library_namespace.debug({
			// gettext_config:{"id":"loading-language-domain-$1"}
			T : [ 'Loading language / domain [%1]...', language ]
		}, 1, 'gettext.adapt_domain');

		gettext.use_domain(language, function() {
			library_namespace.debug({
				// gettext_config:{"id":"language-domain-$1-loaded"}
				T : [ 'Language / domain [%1] loaded.', language ]
			}, 1, 'gettext.adapt_domain');
			if (library_namespace.is_WWW()) {
				try {
					// 設置頁面語系。
					document.getElementsByTagName('html')[0].setAttribute(
							'lang', language);
				} catch (e) {
				}
				gettext.translate_nodes();
			}
			create_domain_menu.onchange.forEach(function(handler) {
				handler(language);
			});
			typeof callback === 'function' && callback(language);
		}, true);

		// 可能用於 element 中，直接用 return gettext.adapt_domain() 即可。
		return false;
	};

	// https://en.wikipedia.org/wiki/Regional_Indicator_Symbol
	var domain_flags = {
		'arb-Arab' : '🇦🇪'
	};

	/**
	 * create domain / language menu
	 * 
	 * @param node
	 * @param domain_Array
	 */
	function create_domain_menu(node, domain_Array, onchange) {
		if (!node || !domain_Array
		//
		|| !library_namespace.new_node) {
			return;
		}

		if (false) {
			// TODO
			library_namespace.error([ 'create_domain_menu: ', {
				// gettext_config:{"id":"cannot-find-menu-node-$1"}
				T : [ 'Cannot find menu node: [%1]', node ]
			} ]);
		}

		var menu = [],
		// default domain.
		tmp = gettext.get_domain_name();

		domain_Array.forEach(function(domain) {
			domain = gettext.to_standard(domain);
			var flag;
			if (domain in domain_flags) {
				flag = domain_flags[domain];
			} else if (flag = domain && domain.match(/-([A-Z]{2})$/)) {
				// using
				// https://en.wikipedia.org/wiki/Regional_Indicator_Symbol
				// '🇦🇧🇨🇩🇪🇫🇬🇭🇮🇯🇰🇱🇲🇳🇴🇵🇶🇷🇸🇹🇺🇻🇼🇽🇾🇿'.match(/./ug)
				var delta = '🇦'.codePointAt(0) - 'A'.codePointAt(0);
				flag = String.fromCodePoint.apply(null, flag[1].chars().map(
						function(_char) {
							return delta + _char.codePointAt(0);
						}));
			} else {
				flag = '';
			}

			var option = {
				option : flag + gettext.get_alias(domain),
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

		if (tmp = create_domain_menu.tag) {
			menu = [
			// '🗣',
			{
				T : tmp
			}, ': ', menu ];
		}

		if (typeof onchange === 'function')
			create_domain_menu.onchange.push(onchange);
		library_namespace.new_node(menu, node);
	}

	// gettext_config:{"id":"language"}
	create_domain_menu.tag = 'Language';
	create_domain_menu.onchange = [];

	gettext.create_menu = create_domain_menu;

	// ------------------------------------
	// conversion specifications (轉換規格). e.g., 各區文化特色 - 數字、貨幣、時間、日期格式。

	var allow_Chinese = {
		Chinese : true
	};

	function domain_name_for_conversion(domain_name, allowed) {
		if (allowed && (domain_name in allowed))
			return domain_name;
		return gettext.to_standard(domain_name || gettext_domain_name);
	}

	// 數字系統。numeral system.
	// 英文的基數
	gettext.numeral = function(attribute, domain_name) {
		domain_name = domain_name_for_conversion(domain_name, allow_Chinese);
		library_namespace.debug({
			// gettext_config:{"id":"convert-number-$1-to-$2-format"}
			T : [ '轉換數字：[%1]成 %2 格式。', attribute, domain_name ]
		}, 6);
		switch (domain_name) {
		case 'Chinese':
			return to_Chinese_numeral(attribute);

		case 'en-US':
			return library_namespace.to_English_numeral(attribute);

			// 一般民間使用，相較於中文數字，更常使用阿拉伯數字。
		case 'cmn-Hant-TW':

			// TODO: others

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
	 * @see <a href="http://en.wikipedia.org/wiki/Decimal_mark"
	 *      accessdate="2012/9/22 10:7">Decimal mark</a>
	 */
	gettext.numeral.decimal_mark = function(domain_name) {
		domain_name = domain_name_for_conversion(domain_name);
		switch (domain_name) {
		case 'cmn-Hant-TW':
			// return '點';

			// TODO: others

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
	 * @see <a href="http://en.wikipedia.org/wiki/Decimal_mark"
	 *      accessdate="2012/9/22 10:7">Decimal mark</a>
	 */
	gettext.numeral.thousands_separator = function(domain_name) {
		domain_name = domain_name_for_conversion(domain_name);
		switch (domain_name) {
		case 'cmn-Hant-TW':
			// return '';

			// TODO: others

		default:
			return ',';
		}
	};

	// 英文的序數
	// https://en.wikipedia.org/wiki/Ordinal_number_%28linguistics%29
	var English_ordinal_suffixes = [ 'th', 'st', 'nd', 'rd' ];

	if (false) {
		CeL.gettext('The %o1 year', 21);
	}
	gettext.ordinal = function(attribute, domain_name) {
		domain_name = domain_name_for_conversion(domain_name, allow_Chinese);
		switch (domain_name) {
		case 'Chinese':
			return '第' + gettext.numeral(attribute, domain_name);

			// TODO: others

		default:
			var ordinal = attribute | 0;
			if (ordinal !== attribute || ordinal < 1)
				return attribute;
			if (3 < attribute && attribute < 21) {
				ordinal = English_ordinal_suffixes[0];
			} else {
				ordinal = English_ordinal_suffixes[ordinal % 10]
				//
				|| English_ordinal_suffixes[0];
			}
			return attribute + ordinal;
		}
	};

	// 貨幣, 通貨.
	gettext.currency = function(attribute, domain_name) {
		domain_name = domain_name_for_conversion(domain_name);
		switch (domain_name) {
		case 'cmn-Hant-TW':
			// data.numeral.to_TWD()
			return library_namespace.to_TWD(attribute);

		case 'en-US':
			// try: '-34235678908765456789098765423545.34678908765'
			var add_comma = function(v) {
				// 使用
				// return v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
				// 可能會比較快，但小數也被置換了。
				return v.replace(/(\d+)(\d{3}(?:[.,]|$))/,
				//
				function($0, $1, $2) {
					return add_comma($1) + ',' + $2;
				});
			};
			return add_comma('US$' + attribute);

			// TODO: others

		default:
			return attribute;
		}
	};

	// ------------------------------------

	// 工具函數。

	// https://commons.wikimedia.org/wiki/Module:I18n/complex_date

	function year_name(ordinal, domain_name) {
		domain_name = domain_name_for_conversion(domain_name, allow_Chinese);
		switch (domain_name) {
		case 'Chinese':
			// number to Chinese year name.
			if (ordinal == 1) {
				// 一年 → 元年
				return '元';
			}

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
		domain_name = domain_name_for_conversion(domain_name, allow_Chinese);
		switch (domain_name) {
		case 'Chinese':
			// number to Chinese month name.
			// TODO: 冬月, 臘月.
			return typeof ordinal === 'string'
			//
			? ordinal.replace(/\d+/, function($0) {
				return Chinese_month_name[$0];
			}) : Chinese_month_name[ordinal]
					|| to_positional_Chinese_numeral(ordinal);

		case 'en-US':
			// ordinal: 1–12
			return month_name[domain_name][ordinal];

		default:
			return ordinal;
		}
	}

	function date_name(ordinal, domain_name) {
		domain_name = domain_name_for_conversion(domain_name, allow_Chinese);
		switch (domain_name) {
		case 'Chinese':
			// number to Chinese date name.
			return Chinese_date_name[ordinal]
					|| to_positional_Chinese_numeral(ordinal);

		default:
			return ordinal;
		}
	}

	var is_Date = library_namespace.is_Date,
	// 中文月名: Chinese_month_name[1]=正
	Chinese_month_name = [ '', '正' ],
	// 中文日名: Chinese_date_name[1]=初一
	Chinese_date_name = [ '' ];

	// 初一, 初二, ..初十,十一..十九,二十,廿一,廿九,三十
	(function() {
		var i = 2, date_name;
		while (i <= 12)
			Chinese_month_name.push(to_Chinese_numeral(i++));
		// 一般還是以"十一月"稱冬月。
		// Chinese_month_name[11] = '冬';
		// Chinese_month_name[12] = '臘';

		for (i = 1; i <= 30;) {
			date_name = to_Chinese_numeral(i++);
			if (date_name.length < 2)
				date_name = '初' + date_name;
			else if (date_name.length > 2)
				date_name = date_name.replace(/二十/, '廿');
			Chinese_date_name.push(date_name);
		}
	})();

	Object
			.assign(
					month_name,
					{
						'en-US' : ',January,February,March,April,May,June,July,August,September,October,November,December'
								.split(','),
						Chinese : Chinese_month_name
					});

	function week_name(ordinal, domain_name, full_name) {
		// assert: ordinal: 0–6
		domain_name = domain_name_for_conversion(domain_name);
		switch (domain_name) {
		case 'cmn-Hant-TW':
		case 'cmn-Hans-CN':
			// number to Chinese week name.
			// 星期/週/禮拜
			// gettext_config:{"id":"week-day"}
			return (full_name ? '星期' : '') + week_name.cmn[ordinal];

		case 'ja-JP':
			// gettext_config:{"id":"week-day-(japanese)"}
			return week_name[domain_name][ordinal] + (full_name ? '曜日' : '');

		case 'en-US':
			var full_week_name = week_name[domain_name][ordinal];
			return full_name ? full_week_name : full_week_name.slice(0, 3);

		default:
			// unknown domain
			return ordinal;
		}
	}

	// CeL.gettext.date.week[*]
	Object.assign(week_name, {
		'en-US' : 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday'
				.split(','),
		'ja-JP' : '日月火水木金土'.split(''),
		'cmn' : '日一二三四五六'.split('')
	});

	// 日期, 用於 strftime.default_conversion @ CeL.data.date
	// or: CeL.gettext('%d1', new Date())
	gettext.date = function(date, domain_name) {
		domain_name = domain_name_for_conversion(domain_name);
		if (date && !is_Date(date) && date.to_Date)
			date = date.to_Date(domain_name);

		if (!date || !date.format)
			// warning
			return date;

		switch (domain_name) {
		case 'cmn-Hant-TW':
			// 中文日期
			return date.format('%Y年%m月%d日', {
				locale : domain_name
			});
			// 19世紀80年代, 20世紀60年代

		default:
			return date;
		}
	};

	// CeL.set_method() 不覆蓋原有的設定。
	library_namespace.set_method(gettext.date, {
		year : year_name,
		month : month_name,
		date : date_name,
		week : week_name,
		full_week : function full_week_name(ordinal, domain_name) {
			return week_name(ordinal, domain_name, true);
		}
	});

	// 時間
	gettext.time = function(date, domain_name) {
		domain_name = domain_name_for_conversion(domain_name);
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

	// 日期+時間
	gettext.datetime = function(date, domain_name) {
		domain_name = domain_name_for_conversion(domain_name);
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

	// ------------------------------------

	// { format : function }
	gettext.conversion = {
		// 中文數字 (Chinese numerals)
		數 : function(number) {
			return to_Chinese_numeral(number);
		},
		// 大陆简体中文数字。
		数 : function(number, locale) {
			return locale === 'ja-JP' ? library_namespace
					.to_Japanese_numeral(number)
			//
			: to_Chinese_numeral(number).replace(/萬/, '万');
		},
		// 日本語の漢数字。
		漢数 : library_namespace.to_Japanese_numeral,

		// 加成。e.g., 打六折、二成、二成七。
		成 : function(number) {
			number = to_Chinese_numeral((10 * number).to_fixed(1));
			if (number.includes('點'))
				number = number.replace(/點/, '成');
			else
				number += '成';
			return number;
		},
		// e.g., 日本語 (Japanese): 2割5分
		// http://forum.wordreference.com/showthread.php?t=1292655
		// 1割: one tenth, 3割: three tenths
		// TODO: 割引: 5分引く (5% off), 1割引く (10% off), 1%割引
		割 : function(number) {
			number = to_Chinese_numeral((10 * number).to_fixed(1));
			if (number.includes('點'))
				number = number.replace(/點/, '割') + '分';
			else
				number += '割';
			return number;
		},
		// 打折扣/discount。e.g., 打六折、打七二折、30% off（30﹪折扣，70% on sale）。
		// https://zh.wikipedia.org/wiki/%E6%8A%98%E6%89%A3
		// "% off" may use "⁒ off" 'COMMERCIAL MINUS SIGN' (U+2052).
		// commercial minus sign is used in commercial or tax related forms or
		// publications in several European countries, including Germany and
		// Scandinavia.
		折 : function(number) {
			number = (100 * number).to_fixed(0);
			// check
			if (number !== (number | 0)
			//
			|| number < 10 || 99 < number) {
				// gettext_config:{"id":"unable-to-convert-number-$1"}
				throw gettext('無法轉換數字 [%1]！', number);
			}
			number = to_positional_Chinese_numeral(number)
					.replace(/(.)〇/, '$1');
			return number + '折';
		},

		// 基準利率 1碼 = 0.25% = 1 / 400，碼翻譯自 quarter。
		碼 : function(number) {
			return (400 * number) + '碼';
		},

		// https://en.wikipedia.org/wiki/Parts-per_notation
		// percentage (%), 百分比, ％（全形百分號）
		'％' : function(number) {
			return (100 * number).to_fixed() + '%';
		},
		// permille (‰), 千分率
		'‰' : function(number) {
			return (1000 * number).to_fixed() + '‰';
		},
		// permyriad (‱) (Basis point), 萬分率
		'‱' : function(number) {
			return (10000 * number).to_fixed() + '‱';
		},
		// ppm (parts-per-million, 10–6), ppb (parts-per-billion, 10–9),
		// ppt (parts-per-trillion, 10–12), ppq (parts-per-quadrillion, 10–15).

		// CeL.gettext('%d1', new Date())
		d : gettext.date,
		// CeL.gettext('%t1', new Date())
		t : gettext.time,
		// CeL.gettext('%T1', new Date())
		T : gettext.datetime,
		n : gettext.numeral,
		o : gettext.ordinal,
		// CeL.gettext('%c1', 1000000)
		c : gettext.currency
	};

	// ------------------------------------
	// initialization

	var gettext_DOM_id, gettext_main_alias = Object.create(null), gettext_aliases = {
	// MUST in lower case. @see gettext.to_standard
	// hans : ['cmn-Hans-CN'],
	// hant : ['cmn-Hant-TW']
	}
			&& Object.create(null),
	/**
	 * {Object}All domain data.<br />
	 * gettext_texts[domain name] = {"message":"l10n message"}
	 */
	gettext_texts = Object.create(null),
	/** {String}domain name used now */
	gettext_domain_name,
	// CeL.env.domain_location = CeL.env.resources_directory_name + '/';
	// CeL.gettext.use_domain_location(CeL.env.resources_directory_name + '/');
	gettext_domain_location = library_namespace.env.domain_location, gettext_resource = Object
			.create(null);

	// TODO: lazy evaluation

	// https://cloud.google.com/speech-to-text/docs/languages?hl=zh-tw
	// http://www.iana.org/assignments/language-subtag-registry/language-subtag-registry

	// http://www.rfc-editor.org/rfc/bcp/bcp47.txt

	// http://www.w3.org/International/articles/bcp47/

	// http://suika.fam.cx/~wakaba/wiki/sw/n/BCP%2047

	// http://www.iana.org/protocols
	// http://www.iana.org/assignments/language-subtag-registry/language-subtag-registry
	// http://www.iana.org/assignments/language-tag-extensions-registry

	// http://www-01.sil.org/iso639-3/documentation.asp?id=cmn
	// http://www.ethnologue.com/language/cmn

	// http://schneegans.de/lv/

	// https://github.com/unicode-cldr/cldr-localenames-modern
	gettext.default_domain = {
		/**
		 * 最推薦之標準 language tag : '主要別名 (e.g., 當地使用之語言名稱)|最常用之 language tag
		 * (e.g., IETF language tag)|其他別名 / other aliases (e.g., 英文名稱, 最細分之標準
		 * language tag)'
		 */

		// ar-AE: 阿拉伯文 (阿拉伯聯合大公國)
		// ar-SA: 阿拉伯文 (沙烏地阿拉伯)
		'arb-Arab' : 'العربية|ar|Arabic|阿拉伯語|ar-arb-Arab|ar-AE|ar-SA',

		// 現代標準漢語
		'cmn-Hant-TW' : '繁體中文|zh-TW|繁體|zh-cmn-Hant-TW|TW|Hant|Chinese|傳統中文|正體中文|正體|漢語|華語|中文|中國|臺灣|台灣|官話|中華民國國語|Traditional Chinese',

		// Subtag: cmn, Preferred-Value: cmn
		'cmn-Hans-CN' : '简体中文|zh-CN|简体|zh-cmn-Hans-CN|CN|Hans|Chinese|简化字|简化中文|簡化字|簡體中文|普通话|中国|中国大陆|官话|Simplified Chinese|Mandarin Chinese',

		'cmn-Hant-HK' : '香港普通話|zh-yue-Hant-HK|Cantonese|香港華語|香港官話',

		// Min Nan Chinese. Macrolanguage: zh.
		// zh-min-nan:
		// http://taigi-pahkho.wikia.com/wiki/%E9%A0%AD%E9%A0%81
		// using 臺灣閩南語推薦用字
		'nan-Hant-TW' :
		//
		'臺灣閩南語|min-nan-Hant-TW|Taiwanese|zh-min-nan|zh-min-nan-Hant-TW|臺語|台語|臺灣話|台灣話|閩南語|河洛話|福老話',

		// 粵語審音配詞字庫 http://humanum.arts.cuhk.edu.hk/Lexis/lexi-can/
		'yue-Hant-HK' : '香港粵語|zh-yue-Hant-HK|Hong Kong Cantonese|港式粵語|香港話|港式廣東話|港式廣州話',

		// 前面的會覆蓋後來的，前面的優先度較高。
		'en-US' : 'English|en-US|英語|en-eng-Latn-US|en-Latn-US|eng-Latn-US|US|USA|United States|美語|美國英語|美式英語',

		/**
		 * Subtag: en, Suppress-Script: Latn
		 * 
		 * "zh-Hant" and "zh-Hans" represent Chinese written in Traditional and
		 * Simplified scripts respectively, while the language subtag "en" has a
		 * "Suppress-Script" field in the registry indicating that most English
		 * texts are written in the Latin script, discouraging a tag such as
		 * "en-Latn-US".
		 * 
		 * @see https://www.w3.org/International/articles/bcp47/
		 */
		'en-GB' : 'British English|en-GB|英國英語|en-eng-Latn-GB|en-Latn-GB|eng-Latn-GB|en-UK|Great Britain|United Kingdom|英式英語',

		// Subtag: ja, Suppress-Script: Jpan
		'ja-JP' : '日本語|ja-JP|Japanese|日語|日文|国語|日本|JP|ja-jpn-Jpan-JP|ja-Jpan-JP|jpn-Jpan-JP',

		// Subtag: ko, Suppress-Script: Kore
		'ko-KR' : '한국어|ko-KR|Korean|韓國語|조선어|朝鮮語|조선말|고려말|韓文|韓語|ko-kor-Kore-KR|ko-Kore-KR|kor-Kore-KR|KR',

		'th-TH' : 'ไทย|th-TH|Thai|泰語|泰國',

		// Subtag: ru, Suppress-Script: Cyrl
		'ru-RU' : 'Русский|ru-RU|Russian|俄語|rus-Cyrl-RU|ru-rus-Cyrl-RU|RU',
		// Tuvan language tyv-RU-TY https://en.wikipedia.org/wiki/ISO_3166-2:RU
		'tyv-RU' : 'Тыва дыл|tyv-RU-TY|Tuvan|圖瓦語',

		'fr-FR' : 'Français|fr-FR|French|法語',

		'de-DE' : 'Deutsch|de-DE|German|德語',

		'es-ES' : 'Español|es-ES|Spanish|西班牙語',

		'pt-BR' : 'Português|pt-BR|Brazilian Portuguese|巴西葡萄牙語|葡萄牙語|Português brasileiro',

		// Dutch language
		'nl-NL' : 'Nederlands|nl-NL|Dutch|荷蘭語',

		// Swedish language
		'sv-SE' : 'Svenska|sv-SE|Swedish|瑞典語',

		// Macedonian language
		'mk-MK' : 'Македонски јазик|mk-MK|Macedonian|馬其頓語',

		'kn-IN' : 'ಕನ್ನಡ|kn-IN|Kannada|康納達語',
		// Kashmiri language
		// https://en.wikipedia.org/wiki/Jammu_and_Kashmir_(union_territory)
		'ks-IN' : 'کٲشِر|ks-IN-JK|Kashmiri|喀什米爾語',

		// Gun language
		'guw-BJ' : 'gungbe|guw-BJ|Gun|康納達語',

		'lb-LU' : 'Lëtzebuergesch|lb-LU|Luxembourgish|盧森堡語',

		// Piedmontese language
		'pms-IT' : 'Piemontèis|pms-IT|Piedmontese|皮埃蒙特語'
	};
	gettext.set_alias(gettext.default_domain);

	// 初始化偏好的語言/優先言語。
	// setup default / current domain. ユーザーロケール(言語と地域)の判定。
	gettext.default_domain = library_namespace.env.default_domain
	// 預先手動強制設定。
	&& gettext.to_standard(library_namespace.env.default_domain)
			|| guess_language();
	// console.log('setup default / current domain: ' + gettext.default_domain);
	// initialization 時，gettext 可能還沒 loaded。
	// 因此設在 post action。e.g., @ HTA.
	this.finish = function(name_space, waiting) {
		// 無論如何都該載入複數規則。
		load_domain(plural_rules__domain_name);

		// console.trace(gettext.default_domain);

		if (!gettext.default_domain) {
			return;
		}

		gettext.use_domain(gettext.default_domain, function() {
			gettext.adapt_domain(gettext.default_domain, waiting);
		}, true);
		return waiting;
	};

	// console.log(gettext_aliases);

	_// JSDT:_module_
	.gettext = gettext;

	// -----------------------------------------------------------------------------------------------------------------
	// 常用漢字↔旧字体/正字体/旧漢字
	// https://ja.wikipedia.org/wiki/%E5%B8%B8%E7%94%A8%E6%BC%A2%E5%AD%97

	var 旧字体_RegExp = [], 常用漢字_RegExp = [],
	// from https://github.com/marionette-of-u/RevText/blob/master/Program.cs
	旧字体 = "萬與兩竝乘亂龜豫爭亙亞佛假會傳體餘倂價侮儉僞僧免兒黨圓册寫處劍劑剩勵勞效敕勉勤勸勳區醫卑單卽嚴參雙收敍臺號喝營嘆囑器團圍圖國圈壓墮塀壘塚鹽增墨壞壤壯聲壹賣變奧奬孃學寶實寬寢對壽專將堯盡屆屬層嶽峽巖巢卷帶歸廳廣廢廊辨瓣辯貳彌彈當徑從德徵應戀恆惠悔惱惡慘愼慨憎懷懲戰戲戾拂拔擇擔拜據擴擧挾插搜揭搖攝擊敏數齊齋斷既舊晝晉晚曉暑曆朗條來樞榮櫻棧梅檢樓樂槪樣槇權橫欄缺歐歡步齒歷殘毆殺殼每氣沒澤淨淺濱海淚渴濟涉澁溪渚溫灣濕滿瀧滯漢潛瀨燈爐點爲燒煮犧狀獨狹獵猪獻獸琢瑤甁畫疊癡發盜縣眞硏碎碑禮社祈祉祐祖祝神祥祿禪禍禎福祕稱稻穀穗穩穰突竊龍節粹肅絲經繪繼續總綠緖練緣繩縱繁纖罐署飜者聰聽膽腦臟臭舍舖艷藝莖莊著藏薰藥虛虜蟲蠶螢蠻衞裝褐襃霸視覺覽觀觸譯證譽讀諸謁謠謹讓豐賓贊贈踐轉輕辭邊遞逸遲遙郞鄕都醉釀釋鐵鑛錢鑄鍊錄鎭關鬪陷險隆隨隱隸雜難靈靜響頻賴顏顯類飮驛驅騷驗髓髮鷄麥黃黑默齡"
			.split(''),
	//
	常用漢字 = "万与両並乗乱亀予争亘亜仏仮会伝体余併価侮倹偽僧免児党円冊写処剣剤剰励労効勅勉勤勧勲区医卑単即厳参双収叙台号喝営嘆嘱器団囲図国圏圧堕塀塁塚塩増墨壊壌壮声壱売変奥奨嬢学宝実寛寝対寿専将尭尽届属層岳峡巌巣巻帯帰庁広廃廊弁弁弁弐弥弾当径従徳徴応恋恒恵悔悩悪惨慎慨憎懐懲戦戯戻払抜択担拝拠拡挙挟挿捜掲揺摂撃敏数斉斎断既旧昼晋晩暁暑暦朗条来枢栄桜桟梅検楼楽概様槙権横欄欠欧歓歩歯歴残殴殺殻毎気没沢浄浅浜海涙渇済渉渋渓渚温湾湿満滝滞漢潜瀬灯炉点為焼煮犠状独狭猟猪献獣琢瑶瓶画畳痴発盗県真研砕碑礼社祈祉祐祖祝神祥禄禅禍禎福秘称稲穀穂穏穣突窃竜節粋粛糸経絵継続総緑緒練縁縄縦繁繊缶署翻者聡聴胆脳臓臭舎舗艶芸茎荘著蔵薫薬虚虜虫蚕蛍蛮衛装褐褒覇視覚覧観触訳証誉読諸謁謡謹譲豊賓賛贈践転軽辞辺逓逸遅遥郎郷都酔醸釈鉄鉱銭鋳錬録鎮関闘陥険隆随隠隷雑難霊静響頻頼顔顕類飲駅駆騒験髄髪鶏麦黄黒黙齢"
			.split('');

	旧字体.forEach(function(character) {
		旧字体_RegExp.push(new RegExp(character, 'g'));
	});

	常用漢字.forEach(function(character) {
		常用漢字_RegExp.push(new RegExp(character, 'g'));
	});

	// http://stackoverflow.com/questions/12562043/fastest-way-to-replace-string-in-js
	function to_旧字体(text) {
		常用漢字_RegExp.forEach(function(pattern, index) {
			text = text.replace(pattern, 旧字体[index]);
		});
		return text;
	}

	function to_常用漢字(text) {
		旧字体_RegExp.forEach(function(pattern, index) {
			text = text.replace(pattern, 常用漢字[index]);
		});
		return text;
	}

	_.to_旧字体 = to_旧字体;
	_.to_常用漢字 = to_常用漢字;

	// -----------------------------------------------------------------------------------------------------------------

	return (_// JSDT:_module_
	);
}
