/**
 * @name CeL function for encoding and language identification
 * @fileoverview 本檔案包含了編碼，例如自動偵測地區語系/文化設定編碼的 functions。言語判定ライブラリ。
 * @since
 */

'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.locale.encoding',

	// initialize_kana_romaji() need CeL.data.Convert_Pairs()
	require : 'data.|data.Convert_Pairs.|data.native.'
	//
	+ '|application.OS.Windows.new_COM'
	//
	+ '|application.locale.language_tag'
	//
	+ '|application.OS.Windows.file.open_file'
	// library_namespace.file_exists()
	+ '|application.storage.'
	//
	+ '|application.OS.Windows.file.is_file'
	//
	+ '|application.OS.Windows.file.AdoEnums'
	//
	+ '|application.OS.Windows.file.translate_ADO_Stream_binary_data',

	// 設定不匯出的子函式。
	// no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	var module_name = this.id,
	// requiring
	new_COM = this.r('new_COM'), language_tag = this.r('language_tag'), open_file = this
			.r('open_file'), is_file = this.r('is_file'), AdoEnums = this
			.r('AdoEnums'), translate_ADO_Stream_binary_data = this
			.r('translate_ADO_Stream_binary_data');

	// var to_standard_language_tag = gettext.to_standard;

	/**
	 * null module constructor
	 * 
	 * @class encoding and language identification 的 functions
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

	// ascii
	var binary_charset = 'ISO-8859-1';

	/**
	 * <code>
	TODO:
	考慮字頻。
	只檢測常用的幾個字，無法判別才廣泛測試。

	http://atedev.wordpress.com/2007/09/19/bom-bom-bom/
	00 00 fe ff UTF-32, Big Endian
	fe ff 00 00 UTF-32, Little Endian
	fe ff ## ## UTF-16, Big Endian
	ff fe ## ## UTF-16, Little Endian
	ef bb bf UTF-8

	var FN='I:\\Documents and Settings\\kanashimi\\My Documents\\kanashimi\\www\\cgi-bin\\game\\Shift_JIS.txt',enc=guess_encoding(FN);alert('['+enc+'] '+FN+'\n'+_.read_file(FN,enc).slice(0,900));
	</code>
	 */
	/**
	 * <code>	自動判別檔案（或字串）之編碼	文字エンコーディング判定を行う
	autodetect encoding
	http://www.hawk.34sp.com/stdpls/dwsh/charset_adodb.html
	http://www.ericphelps.com/q193998/
	http://hp.vector.co.jp/authors/VA003334/ado/adostream.htm

	</code>
	 */
	// guess_encoding[generateCode.dLK]='is_file,open_file,guess_text_language,get_HTML_encoding';
	/**
	 * guess character encoding / character set of file. 偵測檔案編碼。現可偵測中日韓東亞語言。
	 * 
	 * @param {String}file_path
	 *            檔案path
	 * @param {Boolean}[is_HTML]
	 *            為 HTML 檔案
	 * @param [open_function]
	 *            open_function(file_path, length, encoding)
	 * @returns
	 * @see <a
	 *      href="http://zh.wikipedia.org/wiki/%E5%AD%97%E7%AC%A6%E9%9B%86%E6%8E%A2%E6%B5%8B"
	 *      accessdate="2012/3/17 20:7" title="Character encoding detection,
	 *      charset detection, or code page detection is the process of
	 *      heuristically guessing the character encoding of a series of bytes
	 *      that represent text.">字符集探测</a>, <a
	 *      href="http://svn.perian.org/trunk/UniversalDetector/universalchardet/doc/UniversalCharsetDetection.doc"
	 *      accessdate="2012/2/25 9:26">A composite approach to
	 *      language/encoding detection</a>, <a
	 *      href="http://xygszsh.blog.163.com/blog/static/1922151720102230136335/"
	 *      accessdate="2012/2/25 9:13" title="一种语言/编码检测的复合方法（转） - 少華的日志 -
	 *      网易博客">一种语言/编码检测的复合方法</a>, <a
	 *      href="http://blog.csdn.net/marising/article/details/1845038"
	 *      accessdate="2012/2/25 9:14" title="一种语言/编码检测的复合方法 - 李海波 -- 做影响一亿人的产品 -
	 *      博客频道 - CSDN.NET">一种语言/编码检测的复合方法</a>, <a
	 *      href="http://cs229.stanford.edu/proj2007/KimPark-AutomaticDetectionOfCharacterEncodingAndLanguages.pdf"
	 *      accessdate="2012/2/25 9:14" title="Automatic Detection of Character
	 *      Encoding and Language">Automatic Detection of Character Encoding and
	 *      Language</a>,
	 */
	function guess_encoding(file_path, is_HTML, options) {
		// 前置處理。
		if (library_namespace.is_Object(is_HTML))
			options = is_HTML, is_HTML = undefined;
		else if (!library_namespace.is_Object(options)) {
			options = isNaN(options) ? Object.create(null) : {
				reading_length : options
			};
		}

		var t, code;
		if (false && typeof ActiveXObject == 'undefined') {
			alert("guess_encoding: Can't find ActiveXObject!");
			return;
		}
		if (false && typeof _.get_HTML_encoding != 'function')
			is_HTML = false;
		// TODO: using library_namespace.file_exists(file_path) @ build.js
		if (!is_file(file_path)) {
			library_namespace.debug('Treat [' + file_path + '] as string.');
			return file_path.length < 1024 ? guess_encoding.unknown_encoding
					: (t = guess_text_language(file_path, undefined, options)) ? t
							: (is_HTML || typeof is_HTML === 'undefined')
									&& (t = _.get_HTML_encoding(file_path)) ? t
									: guess_encoding.unknown_encoding;
		}

		// 讀 binary data 用 'ISO-8859-1' 會 error encoding.
		var ADO_Stream = open_file(file_path, binary_charset);
		if (library_namespace.is_type(ADO_Stream, 'Error')) {
			return guess_encoding.unknown_encoding;
		}

		// 0: read all.
		var reading_length = options.reading_length;
		if (isNaN(reading_length) || (reading_length |= 0) < 0
				|| reading_length > guess_encoding.max_length_to_test)
			// default
			reading_length = is_HTML ? guess_encoding.min_length_of_HTML
					: guess_encoding.min_length_to_test;

		t = ADO_Stream.ReadText(3);
		// t = ADO_Stream.Read(3);

		library_namespace.debug(file_path + ': ['
				+ t.slice(0, 3).split('').join(',') + ']..', 2);

		if (typeof is_HTML === 'undefined')
			is_HTML = /\.[xs]?html?$/i.test(file_path);

		var question_mark_count;
		if (typeof t != 'string') {
			// 此時type通常是unknown，不能用+=
			// t=''+t;
			return guess_encoding.unknown_encoding;
		}
		/**
		 * Unicode的Byte Order Mark(BOM)在UTF-16LE(little
		 * endian)裏，它是以FF-FE這兩個bytes表達，在BE(big
		 * endian)裏，是FEFF。而在UTF-8裏，它是以EF-BB-BF這三個bytes表達。
		 */
		if (t.slice(0, 2) === '\xFF\xFE') {
			// Unicode big-endian
			code = 'unicodeFFFE';
			// code = 'UTF-16BE';
			// code = 'unicodeFFFE';
		} else if (t.slice(0, 2) === '\xFE\xFF') {
			// UTF-16LE: Unicode little-endian.
			// In practice, due to Windows using little-endian order by default,
			// many applications also assume little-endian encoding by default.
			code = 'unicode';
		} else if (t === '\xEF\xBB\xBF')
			code = 'UTF-8';
		else {
			// 即使是用OpenTextFile(_.open_format.TristateFalse)，UTF-8還是會被轉換而判別不出來。
			// from http://www.hawk.34sp.com/stdpls/dwsh/charset_adodb.html
			var l, codes = {}, reg = new RegExp(), stream = open_file(
					file_path, 'binary');
			codes[binary_charset] = '[\\x09\\x0a\\x0d\\x20-\\x7e]';
			// http://www.cns11643.gov.tw/web/word/big5/index.html
			if (false)
				codes['Big5'] = codes[binary_charset]
						+ '|[\\xa4-\\xc6\\xc9-\\xf9][\\x40-\\xfe]';
			// http://hp.vector.co.jp/authors/VA013241/misc/shiftjis.html
			if (false)
				codes['Shift_JIS'] = codes[binary_charset]
						+ '|[\\x81-\\x9f\\xe0-\\xef\\xfa-\\xfc][\\x40-\\x7e\\x80-\\xfc]|[\\xa1-\\xdf]';
			if (false)
				codes['EUC-JP'] = codes[binary_charset]
						+ '|\\x8f[\\xa1-\\xfe][\\xa1-\\xfe]|[\\xa1-\\xfe][\\xa1-\\xfe]|\\x8e[\\xa1-\\xdf]';
			codes['UTF-8'] = codes[binary_charset]
					+ '|[\\xc0-\\xdf][\\x80-\\xbf]|[\\xe0-\\xef][\\x80-\\xbf]{2}|[\\xf0-\\xf7][\\x80-\\xbf]{3}'
					+ '|[\\xf8-\\xfb][\\x80-\\xbf]{4}|[\\xfc-\\xfd][\\x80-\\xbf]{5}';
			// GBK
			// http://zh.wikipedia.org/wiki/GB_18030
			// http://zh.wikipedia.org/wiki/GB_2312
			if (false)
				codes['GB 2312'] = codes[binary_charset]
						+ '|[\\xa1-\\xf7][\\xa1-\\xfe]';

			t = stream.read();
			stream.close();
			stream = null;

			code = translate_ADO_Stream_binary_data(t, reading_length);
			if (!is_HTML
					&& code.indexOf('<') !== -1
					// 檢測是否符合 XML 文件標準。
					// ** WARNING: 使用以下方法，對某些奇怪的檔案會產生問題！
					// && /^(<\/?[^<>]+>|[^<>]+)*(<[^<>]*)?$/.test(code)
					// && /^(?:[^<>]+|<\/?[\s\S]+?>)*$/.test(code)
					// 以下 OK.
					&& !/[<>]/.test(code.replace(/<\/?[a-z][^<>]*>/gi, '')
							.replace(/<(?:[a-z][^<>]*)?$/, ''))) {
				library_namespace.debug('Treat [' + file_path + '] as HTML.',
						1, 'guess_encoding');
				is_HTML = true;
				// reading_length === 0: 已 read all.
				if (reading_length
						&& reading_length < guess_encoding.min_length_of_HTML) {
					library_namespace.debug('原先取樣文本長度: ' + reading_length
							+ ' 過短，重新讀取長度: '
							+ guess_encoding.min_length_of_HTML + '。', 2);
					reading_length = guess_encoding.min_length_of_HTML;
					t = translate_ADO_Stream_binary_data(t, reading_length);
				} else
					t = code;
			} else
				t = code;
			code = undefined;
			library_namespace.debug('取樣文本 (' + t.length
					+ ') [<span style="color:#b99;">' + t.replace(/</g, '&lt;')
					+ '</span>]', 2, 'guess_encoding');
			// 另可使用 .split(',').length - 1
			question_mark_count = t.count_of('?');
			library_namespace.debug("question mark '?' count = "
					+ question_mark_count, 2, 'guess_encoding');

			for ( var _e in codes) {
				reg = new RegExp('^(?:' + codes[_e] + ')');
				var l = 0, s = t;
				while (l !== s.length)
					l = s.length, s = s.replace(reg, '');
				if (s === '') {
					code = _e;
					break;
				}
			}

		}
		library_namespace.debug('coding: [' + code + '] in phase 1.', 2,
				'guess_encoding');

		// 假如是HTML檔，判斷是否有 charset 設定。這個判別放在unicode之後，其他自動判別之前。
		if (is_HTML) {
			if (ADO_Stream.Type === AdoEnums.adTypeBinary) {
				ADO_Stream.Close();
				ADO_Stream = open_file(file_path, binary_charset);
			}
			ADO_Stream.Position = 0;
			// 讀 binary data 用 'ISO-8859-1' 會 error encoding.
			ADO_Stream.Charset = binary_charset;
			if (t = _.get_HTML_encoding(reading_length ? ADO_Stream
					.ReadText(reading_length)
			// ADO_Stream.ReadText(adReadAll)
			: ADO_Stream.ReadText()))
				code = t;

			library_namespace.debug('coding: [' + code + '] in phase 2.', 2,
					'guess_encoding');
		}

		var i,
		// best confidence
		most_probable_code, highest_ratio = 0, unknown_character_count;

		if (!code) {
			var enc, enc_tmp, lang_code = guess_encoding.test_group, c, test_group = {}, EMPTY_TEST_GROUP = 0, most_probable_code_changed;
			// 初始化 test_group.
			if (false) {
				test_group['EUC-KR'] = {
					'EUC-KR' : 1,
					'EUC-JP' : 1
				};
				test_group['EUC-JP'] = {
					'EUC-KR' : 1,
					'EUC-JP' : 1
				};
			}
			if (Array.isArray(lang_code)) {
				for (i = 0; i < lang_code.length; i++) {
					c = {};
					for (enc_tmp = 0; enc_tmp < lang_code[i].length; enc_tmp++) {
						c[lang_code[i][enc_tmp]] = lang_code[i];
						test_group[lang_code[i][enc_tmp]] = c;
					}
				}
			}

			for (enc in guess_encoding.mapping) {
				if (ADO_Stream.Type === AdoEnums.adTypeBinary) {
					ADO_Stream.Close();
					ADO_Stream = open_file(file_path, binary_charset);
				}
				ADO_Stream.Position = 0;
				try {
					ADO_Stream.Charset = enc in guess_encoding.OS_alias ? guess_encoding.OS_alias[enc]
							: enc;
				} catch (e) {
					library_namespace
							.error('ADO Stream DO NOT support encoding [' + enc
									+ ']!', 1, 'guess_encoding');
				}

				t = reading_length ? ADO_Stream.ReadText(reading_length)
				// ADO_Stream.ReadText(adReadAll)
				: ADO_Stream.ReadText();
				library_namespace.debug(enc + '(' + ADO_Stream.Size
						+ '):<br />' + t.slice(0, 200), 4);

				if (enc === 'EUC-JP') {
					// 半角・全角形[ｦ-ﾝ] 可能在以 'EUC-JP' 讀取 'EUC-KR' 或 'GB 2312'
					// 時大量出現而造成誤判。加以日本語文件本身也少僅用這些字母，因此割愛。
					t = t.replace(/[\uFF66-\uFF9D]+/g, '');

					i = t.replace(/[\t\x20-\x7f]+/g, '')
					// Windows 下， EUC-JP 對無法編碼者會改成 '・' 而非 '�'。
					if (library_namespace.is_debug(2))
						library_namespace.debug('[・] count: ' + i.count_of('・')
								+ ' / ' + i.length + '='
								+ (i.count_of('・') / i.length) + ' @ ' + enc,
								1, 'guess_encoding');
					// 計算 '・' 佔非 ASCII 之比例。
					// .02: 依據經驗而得之 magic number 閾值。
					if (i.count_of('・') / i.length > .08)
						continue;
				}

				// http://en.wikipedia.org/wiki/Specials_%28Unicode_block%29#Replacement_character
				// 可惜 ADO_Stream.ReadText 僅會把無法編碼者改成 '?'，而不會改成 replacement
				// character '�'。
				// TODO: '�' 的比例過大時(e.g., ratio>.0001 && count>1)則 pass.
				if ((i = t.indexOf('�')) === -1) {
					unknown_character_count = t.count_of('?')
							- question_mark_count;
					if (library_namespace.is_debug(2)) {
						library_namespace.debug("question mark '?' count of ["
								+ enc + "] = " + unknown_character_count, 2,
								'guess_encoding');
					}
				} else if (t.indexOf('�', i) !== -1) {
					unknown_character_count = t.count_of('�');
				}
				// .001: 依據經驗而得之 magic number 閾值。
				if (unknown_character_count / t.length > .001) {
					library_namespace.debug('看來似乎不是 encoding [' + enc
							+ ']! Unknown characters: '
							+ unknown_character_count + ' / ' + t.length
							+ ' = ' + (unknown_character_count / t.length), 2,
							'guess_encoding');
					continue;
				}

				lang_code = guess_encoding.mapping[enc];
				library_namespace.debug('Test charset [' + enc + ' ('
						+ lang_code + ')' + '] decoded as (' + t.length
						+ ') [<span style="color:#aaa;">'
						+ t.replace(/</g, '&lt;') + '</span>]', 2,
						'guess_encoding');
				c = guess_text_language(t, lang_code, Object.assign({
					return_ratio : true
				}, options));
				library_namespace.debug(function() {
					return 'Wish ' + lang_code + ' and get ' + c;
				}, 3, 'guess_encoding');
				most_probable_code_changed = false;
				for (i in c)
					if (c[i] > highest_ratio) {
						library_namespace.debug('Most probable code now: ['
								+ enc + '].[' + i + '] = ' + c[i], 2,
								'guess_encoding');
						most_probable_code_changed = true;
						most_probable_code = enc;
						highest_ratio = c[i];
					}

				// 處理 test_group.
				if (library_namespace.is_Object(test_group[enc])) {
					delete test_group[enc][enc];
					enc_tmp = 0;
					for (enc_tmp in test_group[enc])
						break;
					if (!enc_tmp)
						test_group[enc] = EMPTY_TEST_GROUP;
				}

				// most_probable_code_changed 或 test_group 剛結束時皆需要作測試。
				if (most_probable_code_changed
						|| test_group[enc] === EMPTY_TEST_GROUP) {
					if (most_probable_code_changed)
						library_namespace.debug('Test ' + enc + ': ['
								+ lang_code + '] and get ['
								+ most_probable_code + '].', 2,
								'guess_encoding');
					if (test_group[enc] === EMPTY_TEST_GROUP)
						delete test_group[enc];
					if (highest_ratio >= guess_encoding.default_select_boundary) {
						if (!(enc in test_group)) {
							// code = ADO_Stream.Charset;
							code = most_probable_code;
							break;
						} else if (library_namespace.is_debug(2)) {
							for (i in test_group[enc_tmp]) {
								library_namespace.debug('由於 ' + enc + ' @ ['
										+ test_group[enc_tmp][i]
										+ ']　編碼類似，有時會產生誤判，因此持續作測試以找出最可能之編碼。',
										2, 'guess_encoding');
								break;
							}
						}
					}
				}
			}
		}

		ADO_Stream.Close();
		ADO_Stream = null;
		// ascii=ISO-8859-1, _autodetect, _autodetect_all
		return code || most_probable_code || guess_encoding.unknown_encoding;
	}

	// default code
	guess_encoding.unknown_encoding = undefined;

	guess_encoding.max_length_to_test = 1e8;

	// 特殊字元，各種編碼及判別所需最短長度。對 HTML 來說，需要更長一點。
	guess_encoding.min_length_to_test = 8e3;

	// 對 HTML 來說，判別所需最短長度需要更長一點。
	guess_encoding.min_length_of_HTML = 1e5;

	guess_encoding.default_select_boundary = .9;

	// 對相似的 code，需要 test 完 group 中所有 codes 方得確認。
	// 基於經驗，而非理論或是算法的作法。
	guess_encoding.test_group = [ [ 'EUC-KR', 'EUC-JP', 'GB 2312' ] ];

	// HKEY_CLASSES_ROOT\MIME\Database\Charset
	// 語言文字標記. 起碼須列出至 script (書寫文字格式). See ISO 15924 - Alphabetical Code List.
	// { character encoding : IANA language tag }
	// @see <a href="http://en.wikipedia.org/wiki/IETF_language_tag"
	// accessdate="2012/8/22 15:25">IETF language tag</a> (script code)

	// TODO: EUC-TW, ISO2022-XX，和HZ。
	// TODO: 提供一種通用模式來處理單字節編碼 - 俄語編碼(KOI8-R, ISO8859-5, window1251,
	// Mac-cyrillic, ibm866, ibm855)
	// TODO: parse <a href="http://tools.ietf.org/html/rfc5646">IANA language
	// tag</a>: cmn-Hant-TW, cmn-Hans-CN
	// @see
	// http://www.cnblogs.com/sink_cup/archive/2010/07/01/language_subtag_registry.html
	guess_encoding.mapping = {
		// <a href="http://zh.wikipedia.org/wiki/EUC" accessdate="2011/12/28
		// 15:21" title="Extended Unix Code (EUC)">EUC</a>

		// 將 EUC-KR 排在 EUC-JP 前面是因為 EUC-KR 字碼的字在 EUC-JP 中看來常常只是些罕用字，而非無法辨識的情況。
		'EUC-KR' : {
			// EUC-KR 的標準需要再降低一點。
			'ko-KR' : .8
		},
		'EUC-JP' : 'ja-JP',

		// 將 GB 2312 排在 Big5 前面是因為 GB 2312 常用字在 Big5 中常常是\u8000之後的常用字，Big5
		// 常用字卻常常是 GB 2312 中奇怪字碼與罕用字。
		'GB 2312' : {
			// 0: use guess_text_language.default_select_boundary
			'cmn-Hans-CN' : 0,
			// 偶爾會有以 'GB 2312' 編碼的 'cmn-Hant-TW'. .8: 依據經驗而得之 magic number 閾值。
			'cmn-Hant-TW' : 0
		},
		'Big5' : {
			// 0: use guess_text_language.default_select_boundary
			'cmn-Hant-TW' : 0,
			// 偶爾會有以 'Big5' 編碼的 'cmn-Hans-CN'. .8: 依據經驗而得之 magic number 閾值。
			'cmn-Hans-CN' : 0
		},
		'Shift_JIS' : 'ja-JP',

		// <a
		// href="http://zh.wikipedia.org/wiki/%E9%98%BF%E6%8B%89%E4%BC%AF%E5%AD%97%E6%AF%8D"
		// accessdate="2012/3/17 20:26">阿拉伯字母</a>,
		// <a
		// href="http://baheyeldin.com/arabization/history-of-arabic-on-computers.html"
		// accessdate="2012/3/17 21:2">Arabic on the Internet: History of Arabic
		// on Computers | The Baheyeldin Dynasty</a>.
		// ar-SA — Arabic
		'Windows-1256' : 'arb-Arab',

		// bn-IN — Bengali (India)
		// '':'bn-Beng-IN',

		// <a
		// href="http://zh.wikipedia.org/wiki/%E4%BF%84%E8%AF%AD%E5%AD%97%E6%AF%8D"
		// accessdate="2012/3/17 20:27">俄語字母</a>,
		// <a
		// href="http://rlandmann.fedorapeople.org/pug/appe-Users_Guide-Language_codes.html"
		// accessdate="2012/3/17 23:19">Appendix D. Language codes</a>
		// ru-RU — Russian
		'Windows-1251' : 'ru-RU',

		'ISO-8859-1' : 'en-US'
	};

	// character encoding used in guess_encoding.mapping : character encoding
	// name used in OS.
	// TODO: 與 open_file.OS_alias 統合。
	guess_encoding.OS_alias = {
		'GB 2312' : 'GB2312'
	};

	// will ignore upper/lower case
	// TODO
	guess_encoding.alias = {
		'Shift_JIS' : [ 'Shift-JIS', 'ShiftJIS', 'Shift JIS', 'x-sjis' ],
		'Big5' : [ 'Big 5', 'BIG-5' ],
		'EUC-JP' : 'EUCJP',
		'EUC-KR' : 'EUCKR',
		'GB 2312' : 'GB2312',
		// 'GB 2312' : 'EUC-CN',
		'UTF-8' : [ 'UTF8', 'UTF 8' ]
	};

	guess_encoding.alias_to_official = function alias_code_to_official(code) {
		var map = guess_encoding.alias.map;
		if (!map) {
			map = {};
			var i, j, alias = guess_encoding.alias, list;
			for (i in alias) {
				list = alias[i];
				if (Array.isArray(list)) {
					for (j in list)
						if (typeof list[j] === 'string')
							map[list[j].toLowerCase()] = i;
				} else if (typeof list === 'string')
					map[list.toLowerCase()] = i;
			}
			guess_encoding.alias.map = map;
		}
		return map[('' + code).toLowerCase()] || code;
	};

	_// JSDT:_module_
	.guess_encoding = guess_encoding;

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

	_// JSDT:_module_
	.
	// 偵測是否為 HTML。
	is_HTML_file = function(text) {
		if (typeof text !== 'string')
			return;

		var HTML_pattern = /^(([\s\n]*<[\w?!][^>]*>)*?)[\s\n]*<html([\s\n][^>]*)?>/i;
		library_namespace.debug('is_HTML_file: text is '
				+ (HTML_pattern.test(text) ? '' : '<em>NOT</em> ')
				+ 'HTML document.', 3);
		if (false) {
			var m = text.match(HTML_pattern);
			if (m && /<\?xml([\s\n][^>?]+)?\?>/.test(m[1])) {
			}
		}
		return HTML_pattern.test(text);
	};

	_// JSDT:_module_
	.guess_text_type = function(text) {
		if (typeof text !== 'string')
			return;

		if (_.is_HTML_file(text)) {
			return 'html';
		}

		return type;
	};

	_// JSDT:_module_
	.
	/**
	 * 判斷 HTML 檔是否有 charset 設定
	 * 
	 * @param file_contents
	 *            file contents
	 * @returns
	 */
	get_HTML_encoding = function(file_contents) {
		var m;
		if ((m = file_contents.match(/<meta([\s\n][^>]*)?>/i))
				&& (m = m[1].match(/content="([^"]+)"/i)
						|| m[1].match(/content=([^\w]+)/i))
				&& (m = m[1].match(/charset=([\w-]{2,})/i))
				|| (m = file_contents
						.match(/<\?xml([\s\n][^>]*)?[\s\n]encoding[\s\n]*=[\s\n]*["']([a-zA-Z\d\-]+)["']/))) {
			library_namespace.debug('get_HTML_encoding: coding: [' + m[1]
					+ '].', 3);
			return m[1];
		}
	};

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

	/**
	 * 靠常用字自動判別文本或字串之編碼。<br />
	 * detect language.<br />
	 * TODO: <a href="http://zh.wikipedia.org/wiki/%E5%A4%A9%E5%9F%8E%E6%96%87"
	 * accessdate="2012/3/17 20:27">天城文</a>, <a
	 * href="http://zh.wikipedia.org/wiki/%E5%AD%9F%E5%8A%A0%E6%8B%89%E6%96%87"
	 * accessdate="2012/3/17 20:27">孟加拉文</a>
	 * 
	 * @param {String}text
	 *            文本或字串
	 * @param {Object|String}[language_to_test]
	 *            指定欲判別之編碼。
	 * @param {Object}[option]
	 *            default: {<br />
	 *            return_ratio (return ratio object): false,<br />
	 *            test_all (test all language codes): false };
	 * 
	 * @returns {String}code (default) 判別出之編碼。
	 * @returns {Object}ratio object {code: 比例/ratio/可能性/possibility}
	 * 
	 * @since 2011/12/11 00:18:07 重構<br />
	 *        2011/12/28 22:28:35 refactoring: 重構以判別 EUC-KR。 2012/3/17 17:16:32
	 *        兩段式判別：降低不常用字之比重。 2012/3/17 23:20:20 Adding Arabic, Russian.
	 *        2012/3/28 23:51:59 move to application.locale.encoding
	 */
	function guess_text_language(text, language_to_test, options) {
		text = guess_text_language.remove_support_contents(text);
		if (!text)
			return;

		library_namespace.debug(text.length
				+ ' characters after remove_support_contents():'
				+ ' [<span style="color:#9b9;">' + text.replace(/</g, '&lt;')
				+ '</span>]', 2);

		// 前置處理。
		if (!library_namespace.is_Object(options)) {
			options = Object.create(null);
		}

		var i, old_length = text.length,
		// 特殊 chacacters.
		featured,
		// 未辨識 length
		unrecognized, character_count = {
			all : old_length
		}, seldom_character_count = {}, return_ratio = options.return_ratio, test_all = options.test_all, signature_RegExp = guess_text_language
				.get_signature_RegExp(), remove_lang = function(lang, add_tag) {
			var filter = lang;
			if (add_tag === seldom_character_count)
				filter += guess_text_language.seldom_postfix;

			if (old_length && signature_RegExp[filter]) {
				if (library_namespace.is_debug(2)) {
					if (unrecognized = text.match(signature_RegExp[filter])) {
						unrecognized = unrecognized.join('');
						library_namespace.debug('character of ' + filter
								+ ': (' + unrecognized.length + ') ['
								+ unrecognized.slice(0, 80) + ']'
								+ (unrecognized.length > 80 ? '..' : ''), 2,
								'guess_text_language');
					}
				}
				text = text.replace(signature_RegExp[filter], '');
				unrecognized = text.length;

				// add_tag 本 lang 為計算所必須，不能 miss。但一一判斷速度過慢。
				if (false)
					if (typeof add_tag === 'undefined')
						add_tag = !(lang in guess_text_language.boundary);

				if (add_tag || old_length !== unrecognized) {
					if (add_tag !== seldom_character_count)
						character_count[lang] = old_length - unrecognized;
					else if (old_length !== unrecognized)
						seldom_character_count[lang] = old_length
								- unrecognized;
					old_length = unrecognized;
				}
			}
		};

		// 按照特徵碼一個個將之去除，計算符合的長度，猜測最有可能者。
		remove_lang('en-US', true);
		remove_lang('en-US', seldom_character_count);
		// 因為 'en-US' ⊂ 'x-general'，必須將 'en-US' 排在 'x-general' 之前。
		remove_lang('x-general', true);
		remove_lang('x-CJK', true);
		for (i in guess_text_language.boundary) {
			remove_lang(i);
			remove_lang(i, seldom_character_count);
		}

		if (library_namespace.is_debug(2)) {
			for (i in character_count) {
				if (character_count[i])
					library_namespace.debug('count ' + i + ': '
							+ character_count[i], 2, 'guess_text_language');
			}
			if (unrecognized)
				library_namespace.debug(unrecognized + ' unknown characters: ['
						+ text.slice(0, 300) + ']');
		}

		// 依各種常用字母之經驗法則偵測/判別。.95, .5: 依據經驗而得之 magic number 閾值。
		if ((character_count['en-US'] + (seldom_character_count['en-US'] || 0))
				/ (character_count.all - unrecognized) > .95
				&& character_count['en-US']
						/ (character_count.all - unrecognized) > .5)
			return 'en-US';

		featured = character_count.all - character_count['en-US']
				- (seldom_character_count['en-US'] || 0)
				- character_count['x-general'];
		library_namespace
				.debug('unrecognized ' + unrecognized + ' / featured '
						+ featured + ' = '
						+ +((unrecognized / featured).toFixed(3))
						+ ',  boundary '
						+ guess_text_language.unrecognized_boundary, 2);
		if (
		// 判斷已知的同時，未知字碼需要極少…不過這在遇上符號時可能會出現錯誤。因此最好將符號排除。
		unrecognized / featured > guess_text_language.unrecognized_boundary) {
			if (library_namespace.is_debug(2)) {
				library_namespace.debug('unrecognized > boundary: total '
						+ text.length + ' unknown characters.', 2);
				for (var i = 0, l = text.length; i < l; i++) {
					library_namespace.debug('[<em class="Unicode">'
							+ text.charAt(i) + '</em>]: U+'
							+ text.charCodeAt(i).toString(16).toUpperCase()
							+ ' (' + text.charCodeAt(i)
							+ '<span class="down">10</span>)', 3);
				}
			}
			// 若 ratio === 1 但指定 language_to_test{}，可能造成回傳與原先結構不同之
			// language_to_test{}!
			return return_ratio ? {} : undefined;
		}

		var count, seldom_count, denominator, ratio,
		// best confidence
		most_probable_code, highest_ratio = 0, language, recognized_featured_characters = featured
				- unrecognized - character_count['x-CJK'];
		library_namespace.debug('recognized featured characters: '
				+ recognized_featured_characters, 2);

		if (options.contains_JP && (i = character_count['ja-JP'])) {
			library_namespace.debug('Add JP count to TW, CN.', 2);
			character_count['cmn-Hant-TW'] = (character_count['cmn-Hant-TW'] || 0)
					+ i;
			character_count['cmn-Hans-CN'] = (character_count['cmn-Hans-CN'] || 0)
					+ i;
		}

		if (i = character_count['x-CJK']) {
			// 由於 CJK 於各語言各有不同比例，因此加點比重至此。各比例為依據經驗而得之 magic number。
			character_count['cmn-Hant-TW'] = (character_count['cmn-Hant-TW'] || 0)
					+ i * .2;
			character_count['cmn-Hans-CN'] = (character_count['cmn-Hans-CN'] || 0)
					+ i * .15;
			character_count['ja-JP'] = (character_count['ja-JP'] || 0) + i * .1;
		}

		// 設定要測試的 codes。
		if (!library_namespace.is_Object(language_to_test))
			if (language_to_test in guess_text_language.boundary) {
				(i = {})[language_to_test] = guess_text_language.boundary[language_to_test];
				language_to_test = i;
			} else {
				language_to_test = guess_text_language.boundary;
			}
		if (return_ratio) {
			// clone object
			// http://jsperf.com/cloning-an-object/50
			var j = {};
			for (i in language_to_test)
				j[i] = 0;
			language_to_test = j;
		}

		for (i in language_to_test) {
			count = character_count[i] || 0;
			seldom_count = seldom_character_count[i] || 0;

			denominator = recognized_featured_characters
			//
			+ character_count['x-CJK'] * .2
			// 加上 unrecognized 的影響。3: 實為依據經驗而得之 magic number。
			+ (i in {
				'ru-RU' : 9
			} ? 9 : 3) * unrecognized;

			// 'ko-KR' 幾乎只用한글(朝鲜字母)，為作平衡加回來。.5: 實為依據經驗而得之 magic number。
			if (i === 'ko-KR') {
				denominator += character_count['x-CJK'] * .5;
			} else if (options.contains_JP
					&& (i === 'cmn-Hant-TW' || i === 'cmn-Hans-CN')) {
				count += character_count['x-CJK'];
				denominator += character_count['x-CJK'];
			}

			ratio = (count + seldom_count * guess_text_language.seldom_weight)
					/ denominator;
			library_namespace.debug('test language [' + i + ']: ' + count
					+ ' + ' + seldom_count + ' / (all featured characters '
					+ recognized_featured_characters
					+ (recognized_featured_characters === denominator ? ''
					//
					: ' → ' + denominator) + ') ≈ ' + +(ratio.toFixed(3))
					+ ' (boundary: ' + (language_to_test[i]
					//
					|| guess_text_language.default_boundary) + ')', 2);
			if (return_ratio) {
				// 設定好 ratio
				language_to_test[i] = ratio;
			}

			if (// count > (most_probable_code ?
			// character_count[most_probable_code] : 0) &&
			ratio > Math.max(guess_text_language.default_boundary,
					highest_ratio)) {
				if (ratio >= (test_all ? 1 : language_to_test[i]
						|| guess_text_language.default_select_boundary)) {
					library_namespace
							.debug('return the most probable code [' + i
									+ ']: ' + ratio + '.', 2,
									'guess_text_language');
					return return_ratio ? language_to_test : i;
				}
				library_namespace.debug('Most probable code now: [' + i
						+ '] = ' + ratio, 1, 'guess_text_language');
				most_probable_code = i;
				highest_ratio = ratio;
			}
		}

		if (return_ratio) {
			return language_to_test;
		}

		// 經過廝殺戰的才當作有其價值。
		if (!test_all)
			library_namespace.debug('沒有所佔比例超過門檻，且可以準確判斷的 encoding。 ', 2,
					'guess_text_language');
		library_namespace.debug('the most probable code [' + most_probable_code
				+ ']: ' + highest_ratio, 2, 'guess_text_language');

		return most_probable_code;

	}
	;

	// 某種語言之字元數大於此界線閾值，即視為此種語言。依據經驗而得之 magic number。應 > Math.max(.5,
	// guess_text_language.default_boundary)。若低於此，則進入廝殺戰。
	guess_text_language.default_select_boundary = .9;

	// 要作為候選者之最低限度閾值。依據經驗而得之 magic number。
	guess_text_language.default_boundary = .4;

	// 若無法判別之字元比例大於此界線閾值，則當作 miss 過多，無法判別。依據經驗而得之 magic number。
	guess_text_language.unrecognized_boundary = .3;

	// 依據經驗而得之 magic number。
	guess_text_language.seldom_weight = .3;
	guess_text_language.seldom_postfix = '.seldom';

	guess_text_language.remove_support_contents = function(text) {
		if (typeof text !== 'string')
			return;

		if (_.is_HTML_file(text)) {
			if (library_namespace.is_debug(3)) {
				library_namespace.debug('<em>1.</em> ' + text.length
						+ ' characters: [' + text.replace(/</g, '&lt;') + ']');
				library_namespace.debug('<em>2.</em> '
						+ text.length
						+ ' characters: ['
						+ text.replace(/<\!--[\s\S]*?-->/g, '').replace(/</g,
								'&lt;') + ']');
				library_namespace.debug('<em>3.</em> '
						+ text.length
						+ ' characters: ['
						+ text.replace(/<\!--[\s\S]*?-->/g, '').replace(
								/<script([\s\n][^>]*)?>[\s\S]*?<\/script>/ig,
								'').replace(/</g, '&lt;') + ']');
			}

			// 去掉 markup (<> 標籤)，僅留 contents。
			text = text
			// 去除註解。 Remove comments. "<!-- comment -->"
			.replace(/<\!--[\s\S]*?-->/g, '').replace(
					/<script([\s\n][^>]*)?>[\s\S]*?<\/script>/ig, '').replace(
					/[\s\n]*<[\w?!\/][^>]*>/g, '')
			// 把最後未完結的 tag 刪掉。
			.replace(/<[^<]+$/, '');
			if (library_namespace.HTML_to_Unicode)
				text = library_namespace.HTML_to_Unicode(text);
		}

		// 直接去掉無法拿來判別的 characters.
		// <a href="http://ja.wikipedia.org/wiki/Unicode#.E4.B8.80.E8.A6.A7"
		// accessdate="2012/3/17 14:17">Unicode一覧</a>
		return text
				.replace(
						/[\s\n\d\0-\32<>()\[\]\-\\\/\|,.*'"·©°»\u00A0\u0250-\u036F\u2000-\u27FF\u3300-\u33FF\uFF01-\uFF65]+/g,
						'');
	};

	// from [word frequency.js]
	// TODO: 可否 reduce 匹配的集合？
	// nl-NL, fr-FR, it-IT, de-DE, es-ES, tr-TR, pl-PL, cs-CZ, bg-BG, pt-PT,
	// sl-SI, sk-SK, fy-NL, pt-BR, da-DK, lt-LT, ja-JP-mac, gl-ES, sq-AL, he-IL,
	// en-GB, fa-IR, km-KH, uk-UA, hr-HR, be-BY, ro-RO, es-AR, hu-HU, nb-NO,
	// fi-FI, ca-AD, ar, ml-IN, wa-BE, is-IS, mk-MK
	var
	// 常用字: 依語系常用度排序。
	character_signature = {
		// U+3100-312F Bopomofo 注音字母 （注音符号）
		'cmn-Hant-TW' : "\u3100-\u312F國這來會們對與說學實經麼樣關應兩體卻將內黨臺總處觀灣變聲氣權傳覺兒寫滿萬產數讓樂醫獨帶靜戰單濟讀輕絕區歲眾邊條爭裡舉轉燈畫斷廣歷價聯顯錢續雙懷歡圖隨鄉據亞稱辦嚴驗參黃藥證僅盡樓繼專夠媽歐腳雜惡檳寬縣擴虛幫轎辭屆閱擠獎巿匯吳鹽攝譯疊磚盪灑賺籲蟲劑俠祕駛",
		'cmn-Hans-CN' : "这个为们发说时对业经过进开现产动长实种还关从报场两问电资员总样济无间军记华设题务书门应头东见队农义强际话尔达术战给结统儿论认决计组别领议处车气联办运导马调规广难变亚张传价观风权团项许质举专该级边选带标爱识视谈历确单赛营证转亲费让罗约极则听类织创众厂连职势县协备况师构严觉兴节远满续优责亿语纪艺护线乐仅维积热环复较乡红钱获讲响图离轻显兰请验劳销紧飞评负须坚贸读击继终访养银镇态苏陈阳刘财户预铁卫层围欢习刚虽诗货岁检吗讯闻纳绝险龙剧够试监汉伤买胜挥诉药适执树础编奖细额谁稳馆脸讨临阶陆审荣帮妇词顾宁简减冲泽脑卖杨训录网竞笔园贵换顿鲁错妈杀绍压灵购粮扩怀补惊测饭块丽杂谢顺汇庆练叶损贫钟孙异萨岛烟扬库针纸伦鲜吴矿韩遗驻敌灾败签戏伟输赶恶阵寻归轮诺纷齐币坏奋拥钢莱渐赞释吨综桥误弹疗梦枪绩虑乌绿邓厅译毕贝择赵订圣丝摄鱼违盖谓彻启夺顶课载仪贷贯盘晓诚宾谋摆贡辆摇纯艰挂乔爷宽宫锦债筹亩灭诸阴抢罚凤卢软圆墙袭倾缓弃邮烧辉颗趋辑郑闭隐鹏鸡岗剑鉴缩跃键册赏偿穷惯坛润络览劲贴忆储亏蓝洁饮龄闪涨净忧犹毁闹纽肃玛废贺镜缘页叹绕骑鸟舰迟暂宪阔辈烦沟轨档码迈铺赖饰绪颇汤辩询扫辽伪荡浓纺闲递帐剂迁邻锁锋腾纵凯赢罢腊厉丧冯铜狱侧谊涌频阅炼贾骗侨篮纠绘驶兹挤胁诞滚详阁俩骂钻拨畅轰尝赔鸣丛颁劝渔愤颜滨扑扰驾脉盐陕烂脏尘诊牵摊闯飘驱踪锡缴丢赠聪纲吕拟柜饱韦栏胀吓苍唤贤疯涂怜抚逻厌弯贩胶锅窝锐牺莲轿贪挣滩娱夹逊赋恼诱悬缝辅鸿帅庙雾仓岭咨舆侦闷赚钦惩辖喷猎萧绳浑艳卧冻巩庞笼谨铃兽谱绑肠饿阐祸顽纹肤纤颤裤挡婴驰赌撑鲍韵岂砖饲齿缅颖纱绵滥兑壳谦颂硕骤绸谅睁贿缠邹谐饼苹骄沪隶谭皱铭肿泼衔铸冈鹰勋琼聂拦狮驳锻凑鸭绒坝灿衬颠鹅讼恳钩耻骚蕴叠顷链贼赐饥斋坟钉岚谴栋渗妆垒渊耸仑轴娅诈讽饶颈厢酿绣鹤枣焕窑捞帜谎缔钓讶厕懒瞩坠哑胳桩壶荆晕轩账垄娇辐侠伞搁钞啸溃谜揽舱稣垦贞挚浆蜡沧贬俭烛瞒铝帘宠诵蚀垫铅崭哗赁镑鸦竖龚畴缆荫麽缚潇阎枫钥谣肾秃拢炕驴斩嘿澜浇腻粪汕萝邢泻谬窜驼涩驹瑶蚁纬瘫杠琐濒烁讳虾赣闸庐闽呐碱搅葱旷虏锣哟咏捡沦呕鄂钧绅挠掷缉矶凿缪轧毙颊龟贱搂鸽呜诫觅烫莹秽酱尴酋捣匀锤缕聋侣涝侄镶阀歼删窥尧馈冉芜浊赂袜睐缀娄盏骆胧拣绎屿贮坞讥汹眯筛绞韧瑛诀赃涤瘾氢闺诡矫蝇痒婶窦洼谍祁跻赎晖酝盔挝骏窍悯邯掺翘蚂氨恪铮绰锈鑫彝滕铲橱骥骇墩鳞筝绷缎惫绥惭苇锯驯颓凛诧泵憋铀涡檐铎茧辫嚣溅樱笋皖钮沥雏黔疮攒捂痪祯棱荧彤炽榄诬鲸绽篱咙娣拧淄敛颐搀毗娴喔栅绊笃桨橄颅谛浒镖绚琅骡辙锭诅茬绢帧笺噜韬蔼锥钊渎鳌屉羁倩饺辗槛忏砚唠擒钝慑驭桦蓦贻酶恺荪袄嬷蹬禀馒荔浏匮叽莺峪锄轶悍纶坯殡怅葆滤陇肮奚钙鳖辍厮捅荟芊缭栈椭诃镀踌潍铉钾谤钳毡诲禺郸癫诏宓嗨绮秸谕锌诠鲨蝎狈巅缤纫镐辄衅棣锚浚攥萦哝侥鹃亵跺诣涟俨驮谟焘袅芍槟崽佟秆鬓匕鳄粞馅喽姗哧骋陨炜鸠赘讷呛囱妩脓缮鸥啧茯峦桢绛驿雳疟舔傣撵镯铐帼沅赈馍诶脐涧跄鸳钗泾铧媲诂渍讹诽纭呗祛懋隽箫敖镰钠饷谚珑泞鳗觑谆锹讴蹒窿掖饵",
		// 在香港增補字型集2016裡面，有收錄了22個香港常用字形與大五碼所用字形不同
		// 原字符為：兌悅挩敓梲涗稅脫蛻說銳閱媼慍氳熅縕膃蘊轀醞告。轉換成的目標字符為：兌悅挩挩敚梲涚稅脫蛻説鋭閲媼慍氳熅緼膃藴輼醖吿。
		// 'cmn-Hant-HK' : "兌悅挩挩敚梲涚稅脫蛻説鋭閲媼慍氳熅緼膃藴輼醖吿",

		// 加上 日本語の仮名: 平仮名+片仮名, 片仮名拡張,
		// <a
		// href="http://ja.wikipedia.org/wiki/CJK%E4%BA%92%E6%8F%9B%E6%BC%A2%E5%AD%97"
		// accessdate="2012/3/17 14:6">CJK互換漢字</a>
		// 日本の文字コード規格JIS X 0213において人名許容・康煕別掲と呼ばれる漢字の一群と互換性を確保するために収録されたもの。
		'ja-JP' : "\u3041-\u30FF\u31F0-\u31FF\uFA30-\uFA6A発権対戦経産関実済気働労変図増応伝続価衆団総収説験様営観売両齢挙拡満仏単塩戸値児従鉄効検廃歴処県栄楽転囲円歩険込悪豊撃択読覚歳壊帰払辺絶専継汚雑絵薬録乗繊拠頼焼剤圏顔縄蔵厳扱摂弾鉱脳軽隷沢仮抜庁恵郷暦亜闘訳巻鎌臓緑縁稲銭譲釈浄掲勅悩氷遅窓寛覧勧拝啓枠揺聴駅騒戻賛陥繰犠駆粋黙奨霊顕歯殻彫隠猟覇瀬縦惣舎斎漑竜斉詔懐閲舗嬢剣獣娯姉鶏廻挿穏渋涙鋳畳捜渇歓菓鋭銃駄桜呉畠咲峠滝戯鉢搾鳩曽髄錬亀呪鸞酔雰蛍俵槻謡姫倹頬掟砕竪脇襖徠讃竝壱煕埼醤塁綬醸呑塀勲煬萩崋栃讐倶曄渓渕罫錠喩匂諏鞄鴎汎",
		// CJK general
		// CJK 各語種通用之標點符號與常用字
		'x-CJK' : "\u3000-\u303F的一是不人在有我了中為以大之生個他上而也時到可年自地要能那就於出子家然成著如過得心下多作和所後十天無都情民小現政因此當事前去種其行意方文日好但想發性者分看三法美起只用最她外本長同你開理主已沒面代動間及力些二重由定道還新裏高化女又共己進從或愛使公感正世相知更等明全常問立社老很教活何書物工並再四表身果點才真把度頭回向至走受風像什合見水業次界許少統題位五月台手幾被名平山必選光命九言安加目提結它員部花每太路治則任機先望便親入義話流解白各論認場難今交視建未百利做原期第車色詩放形深遠市電孩育影北八往反口神曾念金別比特空失師華通夜清求近制接給七即眼直信且品非報識門記象量落展思改該打院海六西運千談候完式母取呢整際字程考張務持步父切造南病資議強質決容聽死雖喜指東音計語基甚存若男故示管設極保似調始離告類具友係林仍令境府除需快精根片件苦值紅吃住態須早英笑連另引易血否導星婚樹首熱段般委局史究乎夢夫馬土術軍較願格希確亦推半研香越達響足依朋角紀致消終竟永節校標刻構火勢包待怎服痛系素商層環韓衛歌青士低傷免充集項領嗎德例約聞群食收族漸策陸木細規底雨園試房草古增密找景創黑興功晚福陽久劇倒斯悲況照突坐追息善科居費元庭叫春拉筆破級排案注亮效習維限責官富準演初港組屬施王執室康復留簡陳客班益街異假怕查協野靈投承球職舊跟微藝阿司幸爾份楊石背送飛麗率緊李站吧零備播革句綠請適支講尤抗超啊城預供奇獲負浪曲穿篇雲助派省階隻團害算克河溫謂討驚冷良財借尋急答評顧龍止配忘愈味某衣護停判休呼誰均散買館困積臨訴課檢秋退固壓農布短村版婦營醒健臉銀印唯宣律換擔緣號述寧忽技朝油皮線葉守料源裝透既逐養修烈眠睡紙貴靠戲拿歸狀企列忍潮私訊遇型堅沙亂差採腦漫窗菜掉脂唱抱漢雄察擁童端里戀概餘肯速酒慮互威憶洲禮訪默剛恐戶模激蛋迷露典疑遊勞妳岸忙武防升患掌織趣努授握江沈險午塊遍錯煙移範危症缺避陣鐵鞋額屋左脫舞途乃座純補遺哥店探榔玩衝章吸圍席羅予周暗爸票賣寂波狂禁豪擇田紛莫閒頓徵括析淚略觸減肉鐘順隱亡央尊弟批擊棄淡湖藉降頁副彩揮熟束療練翻虎享含延慢憂折製頂傾劃尚稅蕭壞志怪普洋誠謝鮮偶優彈榮錄乾冰詞雪孤您智索酸繁蘇釋針厚圓惜救沉祖跳髮序毒浮訓君器妻架編偏楚泥飯柔牽畢貿夏廠敢皆哀寒欣置銷隊刀掛殺遭旁船鼓勝卡堆弱植蘭右彼癌登競飄堂妹島床染渡警貪魚劉桌溝濃巴憲欲毛牛絲複凡吉喝域材股仰尼招麻刺挑旅暴盛藏諸刊套媒搖敗朵附昨耳胸貨輝隔介吹抽映秘納豐輪帝彷愁泰衡跑乏奔幻怨懂昏牌築荒鬧孔恨晨睛誤趕齊垂寶慣擺替茶融賞骨塵宜州廳彿攤涉緒緩縱聚鏡鳥姻揚測牠硬縮谷趨遷射干橋距郭佔尺敬枝混灰狗竹罪雞餐伸嘴巧彭獻磨籍壯控杜毫牙載雷顆佛兵培審旦淋蓋奮窮罷賽陷頗飲俗婆幅暫曹杯滋牆監糖膽莊陰倫嘗宗擾敏款鬥齡俄抬柯殘涼湧番符累藍閃雅孫板森碎鬆丈京喪拜珍甘跡返促哲喊巨拍穩貧付估儘凝啟妙旗昇礦耶脅辛兄哭廢暖橫猶聖菊貌賴霧仔勇寞封洗琴諾辯週麥伴幕敘涵裂壁弄慧焦痕薄裁迴邱障坡季淨疾皇肅描核爬蓮訂仁坦奈滴災瑞盤輸逃遙魂姿徹搬爐盼祝稍胞踏迎博姓姊寄幹幽末犯督稿肩脈貢闊飾塑泛溪礎米售孕川幣怒肪裕冬匆宇忌忠旋洛煩粗芙豈躍顏勵圈奏悅慎拒擦曉燒秀伯佳哈戴按珠誌豆邦頻魯咖啡埋堪措槍洞滅濫碧糊署讚賢鬱鬼佈娘崇損操殊疏羽軟逝遲呈拋振璃盆瞭簽網茫違閉傘兼哪奉徑懼拐抵滾煤爆臟航袋詳輩迫醉閣震龐刑塞尾屈撥擬游粉艱覆謀購邁邀隆偉偷億夕姐嬰尿幼徒恩慾扮淺疲繞蕩診貼串余倍剩卷呀峰巷循抑敵杖松汗滑濕炸爛玻繫蝶貓販逵鄰醇鎮陌陶妥彎攻污潤玉碰躺陪丹乘仙喚嘆壇悟扎托拔柴潔肺腸苗葛蒼輛鎖冒宮悄悔搞洩甲跨召憐插摸昔沖沿添淇濤猛甜申瘦綿耕誕譬乳併割勤慘掙液燕粒胡舒袖貶貸赴跌蹤輯辜逢飽餅魔占廿惑愚慶戒枯瓦瓶翠胖荷鈴阻鳴仇坑尖挖拾歎澤獸祇窄耐詢賓贈丁契奶宅宋峽徐捨斥昆梯櫃烏獄盟稀籠蓉衰赤逼馳啦悠憑掃斜朗歧氏漂潛礙繪腐菲謹迅遞騰准匹吐嚼悉椅棉樸歉汽渴癡禍穆纏罵耀腿芳蒙襲貫銳鋼鍾雕侵傑儀償奧宿惠捕撞株玲盾肥胎腹莎蔬諧鄧酬騎慈扭援摩撐晶柳洪涯燃賦贏麵伏冊妨宴憤拖晴淑託辱駐倡傲唐夾愉扣抓桃棒汙盞眉糾綱脆菸董衷遜采劍叔吟呵嚇廟憾挺搭殖漁牲狹碌貝鋪鍵丟厭孟慨披挫捲晃棵淪漠猜盈矛紹羊翼肚蔡鼠傭叢娛寸岩嶺帆廉悶懸扇拓掩朱氓燦犧籌紋罩聰腔荻趙蹟躲輔醜鑑鳳仿俱儒冠刷娃宏恒慕扯捐掘撫梅汪泣泊炎絡聊胃芽賭辨郎伊勁吞墨宙寺庫弊恰恆恕慰暮棟漲牢祥稻紐績縫臂舍蔭薪券卑婉敲斤昂暢柏欄欺毀泡泉浸溶溜燭狠矣碼翎遂井俊債儲勾圾垃弦恢惱捉捧搶暈枚泳瀆熬矮緻肝蘆覓郝鍊黎齒伍俯凌剪劣嘛奪宰挽曼梵殷氛渾澳瑰瘋磅腎膀膜芒蓄虔躁逆遵雀顛馨騙鼻傅催削剝勉勃勒厲孝扶攀敦柱梭澄潑灌瓜畏租秩羞翁脹膚蝴裔謬郊霜丸倦勸吾吻喃嫁嫩屏抒桂湯漆盲碗稚紫綜腰舟芬蒂誓誼諒譽軌遮銘駕側呆喧噴姑崩幢截扁抹撲撒桑沾溢漏煥睜碑筋臥蛇蜜謙鄭鑽驕鶴鹿黯亭叮咬喻嗔嚮塔姆嫌寓帽戚扛柵瑪甫盧碩箱虐賄逸鍋云伙偽傻吊堡填媳宛愧懇拆撤摯暑欠毅津潰煮畔眸祈秤糟締罰膨菌衍訝迪酷銅鋒陋髒侶咳喉嘯岡崗怖揭擱攜晰朽沛浩澈玫瑣痴皺秒窩粹紮罹聳莽裸誇謎辰迄邏郵闢雇顫伐凍凱凸剎吵圃堤塗壽嬌庸廊廚恍抉拳旨枕榜浴滔疫疼碟綻肌臭舌芭葡薯虧註赫轟迢鞭騷乖倚哨嘩嚐囊墜壤巾帳彌怯惟斗曠樁歇池淹淫潭濛澀灘烤焚牧矯稽糙繳罐翅翩萎蔽薩蠢裙譜贊輿閥驅鵝鼎僵劫卜叛唸喬墓墾寡恥拚擲斬栽楞殿渺漪漿炒疇瘤瞧肆膝艾莉萄蕾襟詮賀蹲郁驟亟仗倆允凋吼喘址姨媚媜履役徊憬抖捷摘撰攪昭汁熙爺眷砍筒耗肖脖臣藩蝕誘踩銜錦隙魁乍佇佩函哦啞啼嗜嘻噪坎埃塌壘夷奢妄尹屠帕廂彰徘慌擋攘斑曦櫥淵溺濁煞爽狼瞎祭禽禿秉稼笨箋繡翔聆膠茁茲萌蓬虹衫襄諱跋輒逛遣邪霍霸靖頑頒魅僻卓哺唇夥峻惹戈拂撼昌棘棋歪泌淘湊烘熄爍玄瑩痞癖盜睹瞻砲秦穫竿籤糞耍聘膛茂蘊蚊蟹袱褪証誦諮謠趁軀酌錫霞韻鷹倖倉兢冥卒咯唉嘉嘲坷墳奠娜寮巡掠摔摧框梳棚樑溯煌甦眺縛繩肢腫臘舖蕉藷蜂裳裹詭豫貞賤逗遼釘餓魄鴨麟丘乙兔冤卵卸卿吏吱啪嗽囚坊寵屑岳幟廝弓征忡惚挾挨擅昊曰毋澎焉煉珊瑜瞇瞬硝禱穎簿耽脊菩葬蟻豎豔跪踢頃頸飢餵駭鴻侯倬僕僑兮剔勿卅吶咎嗓噩妝屢弗怡慚憫拘拼拭掀搗昧札梁梢械棕氾沫淌渥渣炭獅琳疆砂碳穴竊筍糕絆綺罕肇脾芸茅茄苞荊菁葦藤虞蠻裴豬蹈辣闖阮驀鬍仞佐刮匈匱厄咄啃嘶嚷壺妒姜婿嬉帥忱悴悽愕憔揉搜撕敷斧旺枉椰楓榕毯渠灼炫犬瑟瓷町矩砌祉笛箭簇羨耘耿艘芝芹萍蒸薑賈賠釣鈔鑼隘頰饒駁鴿侈侮僚剖咒喟嘟嘔嚨圳坤寨屁屍彙恭惋惘惕憧扔捏摒撈攸曳枷桶沸沮洽淆潘濺烹煎爪犁瑕甩疤窒笙篤糧綑緬繭繽腺臼苟葫蔓蕃蛛趟踽迭逮酣鐸闔陡陵雯韋鯨黏仲侷倘偕傢兀兇兆凄匪咕咽哩喳嗅垢奕奴婪寰峭崖巍巢徨惶慄憊懲扒抨拱拯揣擎攏斌晦暇柄棍椎榴檜汲涓湄漾潺澱瀟瀰烽燙狄瓣癒皂盯眩磋穀竭笠簾粥紡紊綴苛茸藺蛙豁賜蹄逾遁釵鈍霎餽黝亥仕佣傍凹刃匙后哼塚妮姥嫂孰孽尬尷庚廓徬怠憎懊懺扉拙掏捻攬敞曇棲槓樟氧淙漬濡炊炳焰熊熾犀疚盒瞪矗矜磁竄笈紗芋芯苓蔚蝦褐蹊蹺轄迥迸遏釐鏤阱陀雁霓鬚鬢丑于伺侃偎剌剋匠叉叩哎哇咪哄啜喂嘈垮堵墊姪姦嫉宵寥尉屎屐屜屯峙嵐庇廬廷恃恬恣悼惆懦揆敝杞杉杆樊橙歹氯汐沃湃漓滲澆炮烙煽猴獵珮畸瘡禦稜窘筷粽綁緘缸羡翱腕膺艋苔蜿蜒螂衲詠詹諦謊豚貯軒遐遑遽鄙酵鉛鑿駝黛丰乞佼俐偵僧兜冀凶厝叭吆咀咱咻喇嗯噬埸妃妓姬嬗岱峋嵌帖弔彬怔惻慷憩懵戍戮扳押挪搥摹晤曖曝杏汝沐汰沼渦溉滌瀾炙炯熔燥燼狐珂畦疵痰痺皓盅盹眨睫瞄瞳磷礁秧粧絨翰肋膏范菠蕪蕻蜘蟑裨詐譚踉踱迤逄邃鋤阪隧霉骯骸髓鴉仆佑俺偌倏凰凳划劈卉厥吮呻咚哉咫啤唳啻啾嗤噓噎噹嚕嚥垠墟夭妾姚娶嫻孺寢峨嶙巳庶庵弛怵恫惦悸惰懾戳拈拎捱揹搏撮攔攫旭旱枒棺椏榷榻榖橘欽氟汶淤涸淮湘漩濯瀏瀚瀝灶爵琉琦瘍瘴盎瞞瞥矇砸硫祗稠窪笆籐籽粱糯絮綽緯繃纔罈罔臻芷茱莞蓊蕙薰薦蛾蝟蟄蠕袍贖趴跚跛踰蹦躬輻逅邂邸酥錮鎔鑲隅霾靴飴馴魏鯉鱗鶯鷺丫么乒伕佃伶俎刁勘募勳勺匿吭呎吠咐咸咦咧啥唾嗣嗚嗡噢嚅埔堯壑奄奸娓娥娼婷嫗寇屹嶄嶼弘弭彗徉徙徜忿怦悚愷懈憨戊抄捺据搓搧摺斂斃斟旬暉朴柚桔栗梨棠楔槽檻殉汀汾泯涕涎淅淬渲渝淼濾瀑炬熠燻爹牟牡琢璞瓊瓢甬癥皎矢砰硯磊磯窯篷簫簸絢綣羈胰腋腑腮臆舜艦芻莘蒲蔑蚋蜷蝸螺蠟詰諺諳賊贅踞蹂踵辟逍逕醃釁釉鍛鏗閑閤閻阡霖靡鞦韁韆韶飼馥鮑鱷麝丐乓仄伽俑俟倥倔倪冕冶冽几卦卯叱呷咆咋哮唬啁喏嘎嚏囿坪垓埂墅壕夸奎妖嫦嫣嬝孜孵寅岐崎崛崔帚帛帙并弧弩彆御徽忖忪惺愫慵戎戛戢戾拌抿拮掬捩掣捶搪撇擄擘昀晌暨暱曙朔朦朧杭杰柢桐梗棗椒榆椿樺橡檀殃殆氈氤氰汔沽浦涅淳湛渭湍滇漱澡濘濠瀕灸燎燠狎狽狸猖獃獗獰琛瑯瑚瑤璧瓏甕畝畜痔痹瘠癟皈盱眶睦睿瞠砭磕礫祠禧禹稔穗穢穹竇竺筐箸箇篋粘絃紳辮羚羲翡翳聾腥膳臍舐舛舶芥茉苯茵萃菱蓆蕊薇藜藹虜蜻螃蟀蟋衊衙袁褂褶訣詫詣誡諭謄謾譴豹貂賂趾趿跎跫踮蹉蹴躅轍迂迦逞邵醺鉗錐鏘闕陞霏靨鞍鞠饅骼鮭鶉鹹麴鼾丕亨伎佰俏俘倌倨俾傀儡兌冗凜刈刎刨剃匍匐匡叨吒呱咿唆唧哽唏啄啖喀喋喑嗝嘖嘹噁噙囌圜坍埕埠墀壅夙娑娟娩娉嫖孀宕宦寐岔嵯嶽巫帷幔庖廖彀彊恤恂恙悖愣憚懣扼拄拇捎捆捫挲掂掐揩揍揪揶揄撩撚擂攣旄旌晏朕杳柙柒桓桉栖桎梓梏楠楫楝楣椽榨槁榭槭槿樽櫛檬檸櫺殄毽氮汜沌沂沏泄浣淦淖湮溲滓漉潢澹瀋瀛烯煦熏燄牝牴狡猝猾玖琵琶璀璇璜璨畚痊痙瘀瘟癰盃眈睏睬睽瞌碘碉稟窈窕窖窟窣窸箕篆簌粕粟糜紉絹綢緞縝繹繾缽羔羹翌翦肘肴胥胚胝胭胼胯胺脯腴腧臊舂舅舵艇荐茴荏莓萋菡菇蓁蕨薛藐藻蚓蚵蚱蚯蛔蛤蜀蜉蜢蜥蜴蝗蝣袓袤褚褓褒褥褻覷訟訛訢誅誣誨諫謔謅謨貳賃赭蹋蹙躇蹭躊軋軸逡遨遴邇鄒酢醋醛釗閔闇陛隄隳雌雛霄靦鞘韙頷顎飩饉饗駒髻鱒鳶鹵麒麓麩麾黜黠黴亢亳仟伉仳佗佞佚侍佬侖俚俞俸儷剉剜剿勛勰匾叟叼吁吋吝呃呂吩呤哂哆唔唄喫喙嗟嗦嗥嗒嗲嘀噗噘噫噤噥嚎嚓囝囤囫圭圯坌垣垛堙塘塹壹妁妞姍姶婢媛媾嬴孑孚孳宥屣崙崧嵋嵬嶂巇巖幄幌幡庄庾弈徂徇忑忐忮忤怍恿悱愎愆愿慟戌戟戡扈拗拽拷拴捍捌挼掮捸揖揠搽搔搐摁摟摑搴摭撂撓擢攆擻晒晾暄暌暸曜曩杌杵杼柬枸桀桅梧梆棹楷椹榛槐槤樵檮櫓欒欷欸歆歃歟毓汛沁汨泓泅泠泫洫洒洙浬浠湎湲渫湫溥漳潦炷焊烷焙煨煖燧爝爰牒牖犄犢狙狷猥猩猷猿玦玷珀珺琪琥瑙瑾璁璐瓠甄甭甯甸畀疋疙疹痂痍痣痠瘁瘩瘝瘸癩癲盥眇睇睨瞅瞟瞰瞿矽矸砥碓碇碣碾磐磺祀祺禎禾稷窠窳竣笳筑筵箝箔箍箴篁篡篾簧簪簞粲糗紘紺絞綾綸緋縉縴縻纂罌罣翟耆聒聶聿肄肓肛胱胴脛腆膊臃臀臚臾芮苣苜苑茹茗茨茜莠荼堇菰葵萼葩葺蒿蒜蒺蒔蓿蔻薔藪藕蘑蘚蘸蚪蚤蚌蚣蛀蛭蛩蜓蜈蜃蜚蝌蟆螫螯蠅蠣蠹衢袂衿袒裎裘裱裾褊褸襤覃觚訖訥訶誹諜謁謗豇豉豕豳赧赦趺跤踝踟蹇蹚蹩軾迓迨逋逭遄郢酊酐酗酖酡酩酮醐醍釜鉤鈿銑鋅鋏銹鍍錨錘鍬鎬鎚閏隋陲隼雍雉雩霆霹靶靳鞬韭頤餌餚餬餮饕馭駿騖驄骷髦髫髭鬃鯖鰓鰻黥黧齧国来会学于着与当么体没机将区点内万并几条党数声争参巴却查写装划断采双称医游随尽黄站欧号奥跟份按股范愿卡画税独拿抓吧担某属哈届状牌俄售靠温藏哪假宝怕楼托献哥静搞篇勒佛乱您缺旧湾沉套丰穿脚澳跑啊礼脱姐尤掉姆伙默残迹麦灯励誉虚践泪壮径潜辞触横胆凭涛浙峡猪虫蒋叙厦碍恋凉盗寿湿晋惨炉猫遥浅尸抛悦弥惧携滞剥厨窃禅狭屡嘱厘彪蛮芦粤彦刹祷枢躯斐淀禄蚕阜昼堕丙渤郡茎寝栓硅挟嘘踊殴邑蔗匣柿蝉璋栩沓嵩堰斡狩柑荀祟甥岑泗酪丞萱坂劾舷熹雹弼痢槌亘菖皿塾冢羌筏虱糠柩晁汞妍昕砺酉胄嫡盂奘倭浜虻鞅赳咤髯橇厩妊怏娠隍痘胤宸漕黍疸槃瞑桧蟠祚癸渚畿檄杷蛆偈蛹稗壬疱襁僭裟柘袈俳岬笞蓑悌靼菟珈腱砒杓弁瞋菅噌砦斫笏衾疥槎桁徭肱沆苫毘霰羯甑藁掴鬲蛉椋楮堀瞽俣愍樗箪檗隈恚缶蛸薨禊笄楸笥搦祓旻磔拶尻祐襞魃梃袴跏襦笊埒袢埴悛邨璟掾甍貊鉾舳毬儁嚢酎檎羂糸冱鮟麿鱇脩丶珪靄歔巣鬘髪抔蹠憺崑薙媼絜谿帯昉樫燐膣荘誂捗疎麹鞜靺叡黒冑鞨遡堺隣徳笹侘潟徴繕広渉穽穂靭瑠倣毎轡粛槨楯楢碁梶査壌晩圧襴畑苧剰辻痩農組諸憲広護島協輸財閣備製職貿織圧帯積線鮮異課準側適葉復減銀負徴違",

		// Hangul characters frequency table
		// 加上 한글(朝鲜字母): Hangul Syllables ハングル, Hangul Jamo ハングル字母, Hangul
		// Compatibility Jamo ハングル互換字母
		'ko-KR' : '\uAC00-\uD7A3\u1100-\u11FF\u3131-\u318E',
		// http://hunjang.blogspot.tw/2004/03/korean-language-frequency-of-syllables.html
		// The most frequent syllables are i, ta, nûn, ûl, ka, ko, kû, e, chi, ô
		// (이 다 는 을 가 고 에 지 어) in that order.

		'arb-Arab' : '\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF',

		// Cyrillic + Cyrillic Supplement
		// https://en.wikipedia.org/wiki/Russian_alphabet#Frequency
		// 'ОEAИHTCЛBPКMДПЫУБЯЬГЗЧЙЖXШЮЦЭЩФЁЪ'
		'ru-RU' : 'ОEAИHTCЛBPКMДПЫУБЯЬГЗЧЙЖXШЮЦ',

		// 基本字母.
		// <a href="http://en.wikipedia.org/wiki/Letter_frequency"
		// accessdate="2012/3/17 15:55">Letter frequency</a>:
		// In English, the space is slightly more frequent than the top letter
		// (e) and the non-alphabetic characters (digits, punctuation, etc.)
		// occupy the fourth position, between t and a.
		// <a href="http://mtgap.bilfo.com/letter_frequency.html"
		// accessdate="2012/3/17 16:1">LETTER FREQUENCY</a>:
		// Punctuation Frequency: , . - " _ ' ) ( ; = : / * ! ? $ > { } [ ] \ +
		// | & < % @ # ^ ` ~
		'en-US' : ' etaoinshrdlcETAOINSHRDLC,.\\-"0-9',
		// <a
		// href="http://zh.wikipedia.org/wiki/Unicode%E5%AD%97%E7%AC%A6%E5%88%97%E8%A1%A8#.E5.9F.BA.E6.9C.AC.E6.8B.89.E4.B8.81.E5.AD.97.E6.AF.8D.E5.92.8C.E6.8B.89.E4.B8.81.E7.AC.A6.E8.99.9F"
		// accessdate="2012/3/17 14:7" title="Unicode字符列表">基本 Latin
		// 拉丁字母和拉丁符號</a> ♥♡
		'x-general' : '\u0020-\u007e×'
	},
	// 次常用字, 罕用字
	seldom_signature = {
		'cmn-Hant-TW' : "廈踐纖艷褲懶錶祂悵檔諷儉滄癮縷釀闆淒螢鉅颱洶輾閩墮瑋頌馮囂曬覽醞醬頹鵑晉桿脣蔣撿殼禪簷蘿襯饋癱膩蘋颯檯籬隕韌瘓縈蒐蔔蟬僱嚀矚窺纍萊郤闌顱龜嘰囑巒愴揀晝滯漣濱瀉蔥蛻螞囉篩紓舺莖裊襪閡閨鵬鵰齣瀅籃繆鋁鑰饑鹼齋亙儼噸壟嫵嬤摻旳槳櫻犖纜譏蹌蹣迺闡騁刪嗆婁彥擷斲殯澗癢紜緝聇蠶詛諍譎躓邐鏽鐫鑄颳飪饞馱駱驥魘剷勻啣囁壢壼崢嶸巔幀廁曆樞櫸熒燬璣皚箏簑繚蠱袞詡貲躪輟釦鈣鏟飆驢鷥傚傯僥嘮嬸孿懨扞掄棧櫚氫氳涇猙獷痳睞礡祿穌簍籟艙荖蓀襉訧謐贓踴躑軼鈞鉀銓鑒闋隸顥餿鴣鵪鷓齟齬嘓噠囀囈圇塭壩嫄廕懍懟懹搆摃搟攙攢敻斕朼楬橢櫫歛毿泹猻疪痾祼簣粵紈紿緲縹膾虩螻蟈袪詎詼詬諤謢謫賸踄踼躋軔軛轅鄴鈕錕鑠閘閹靂韜顰颶餒餛駴騅騾驁驪鯊鰣鴕鵠鼕齪齷傖儂儐儻兀匭呇哖喲嗩噉噲嚙囓囪埆堊堭塢墻奐媧嬈嬏嫺屘宧屧屨崁嶇巘幗庛廌廇廡慳慼慫扡扙拫掅摜撻擰擯朸枻榞檥欞殞瞉沬泝浹渙渧溼滬滷濔瀲灝灩烴焄玆瑧甌痌癇矓礪禋禢秏穈篳籮糢糰絀紽絳緇綖縟繖纓翹芵芧芔萵葰葯蒞蔪蔘薊蜆蛺襬觴訐訕詆諄諓諡譁貽賒賬躕躚躡輊輀輓轆迆迼遯鄔醱鈙鈷鉻鋌錳鎂鍰鎊鎳鎗鏈鏢鐮鐺鐲鑣鑪鑾閶闃闓阨雋霽鞏韾頇頡餞餡饌饜駟髏鬨鬩魷鯽鴝鵲鶚鶩鷂鸝黷",
		'cmn-Hans-CN' : "鸯迩掳飓沱辘痉缰谙伫唁砾萤闵跷馀抡玺铿鹊挎烬锵狞撷潼蜕鲤镁诙阙蓓犊抠挛炖涣臧摞钵咔谒蹑侏惴钰饪嗳惬哒酯楂苒谏噶佯犷鸵篓撬缨讪筱瘪荃玮铨斓镌癞卞轼锢滦赡阑岖锲泸疡铢硌惮蜗悻鳍鹭猬辕卤侗冼栾腌腓馋瓮掰牍缄馁罂皑蔷撅芩谧懿镍珅躏锰镣礴熨忒圩啬仃囔嗷鄱侬嗬赓腼籁昵濮诘珥铵痫烨崴忻麋夯蝠鹦汩擞骠溟怆榈咂赊栉谑怂煜燮骅镛诛孪莆涮蛟恻粳捋奂呸霭镭铠皋芪蛰徕鹉淞蹿蝙脍蛐胫镢峥缜鼐嗖阖晗飒岌荤箩刽疽绯闰蓟唷诿褴涪泱恸漯鹳钨阂篝飙澧啕菏挞洱舀褛硒偃枳筠耷珏绀噼掇狰碴鸾跆耙裆猕昙铛皙馏暧柠龛颍觐矾啷舫嵘闩钛诩湟琏粼绫扪堑懑郴岷闾栀遛咛蛎惇匝剽弋潞蟾驷豌铬阉坳濂嵇幷婕牦髅掸诋萸苎涿姣铤飕杈舸獭嗫剁枭骁绉颚鏖踹煊绶搡酰飨邬颉砧楹耄饯滂鱿鲟琮镂缥蹶鲻妲绺珲谩芎蠡颌嗑飚郅晔爿摈癣燔霁赝孢幺噔骊颧殚郧唢啐蔺荚蟒辊虬仨纾稞粑唰潸蛊缫俪蔫靓塬谀汴嘁睑钚颏谄铡遒珩昱崮豺罄颔酚莅纨兖佤铣殓鹜啮锃饨骰蛳缈旮鳝荞纣邋旯膘魇鲫翊敕婊犟馄氦墒咝珞茏昶饽膈铂斛孬烃傩瓯哐旖灏銮骞镳鞑垩镕鹗偻遢鹫旎鹄枇睢鄯嘤驸锨滁琨蚜伢呓痼锷衮砷睾糅沭锺恽荥钅嘭趄腈耋孱圪龌龊垅钺赅婀谲垸畲岫烩缙娲铆鲲尕倜聩荠嫔硼刍熵圻谶骈佘鳅钴猗绌衩蜇闫僮啵痈鹘邳蹼涔龇蝈夔藓肽岜愠焱浃嵊铄橹滹痨邈贲诌莒訇轱囡洵坨咣藿玥诤棂苡爻佻怩鬟浔颦篙锂砣薹誊砝叁轲鹂佝陂贽邕犍暹趔囹柞忸芾戕婺栎骧锉艮葳炀揿溴薮鬈邝妪蓖圄馗讣饬姘鄢桠勐觎侩煲锑矍噱垭侔郦剐殒鹑秭瓴囵蒌蒯畹叵觊钎歙膑谥谌胛贰镉犒苕滢诰痿谪脘坻钤龉蜍迳觞龃崂傥擀醴澍橐诨伧峁闳珉戬骝溧逶磬碜儆鳏薏鳟龋謇溘晟杲殁靛祜姹焯喁鳃篑玑羸抻瓤嗄诮籼茔欤辎陟嗵乜豢螟傈蒡鄞鸪谵沤氲鲑谗苷蕤颀哔玳耦烊铰忾钼秣旃绦嘣狒馊枞苋龈琰讫螳牯翕悒呲纰恹鹌涞醚婵讦饴舢恁炔钿鸨骛麸苻娆阄鎏郜苁钡榫珐蕲琬璎劭踯锏锴秫擤濑褡獾啰挈幛呶轭钒氅弑邺唿鹞痧钹钏癜罡磙鸢韫甙僳耒邡铳焖椁缛瑁陉阕峄瓒媪腚屺骜汊绔蒴滟唑儋辔谡阗蓼洄轫螨晷讧铱镫髋侉缦锶玟嗐樾趵岿洮庥癯煅蘅砻鹧轳缢罅溏殇腭馑掼巽垧榉狍邰茆玎绾畈辇鞣哞僖鲈钜屙鹈呦妤綦咭诟锗疝囗渑荸鬣捭獐砀酽诒缃鹕谔芨娌馔泔靥峒锒踅撺凫鼬鼹艄镗蹓芗羟榘颢獠妯枰沣糌咩骐叻篦橛芡臬蓥啭趸瘘疴馕阇疣廪灞阚朐莪锛碚筮姝膻鲇瑗荨闱郗箧墉怄荦竽笤疖麂逖疃鳕菽檩雎枋觥蘖扦茭莼蚩锟薤埝绂偬枥韪匏悭辚亻仉樯薷皴曷稹鸩纥鹬镊痱貉沔峤郓鲅撸隰毂桡仡馐邛珙喱鬻咴绻泮讱岙郯黢樨氵鲛怿嘬訾哙醮逦氖睥蹰缇隗阒羿莜沩鲢豸瀣阆栝跹怫妗耧蚶篌砼椴垴碡箜葭蝼呋锆缱鲭虢诳埙莴铍嫚狺淝碛奁镏瘢碶箨犸骢邗餍蚝眦箐逑抟洇醪庑锱鸱镞筚鲠眙蚬婧颞劢岘戆椤氡嶝埭琚濉萘蕈籀俅伥黩潋蚧腠溆疳鲶鲱篪嘞莨庠郿铩魆芫蜊帏趼硷桕磴鸹菔雠凇甾眬侪茕鳜喵圮狲牾渌鄄狯鸷鏊鳎吡瘙郾氐铖崤诓氩凼柽挹猢衄鲵疠疔穑蠲镓垡茌仫燹毳阈褫邙鹁坩阊霈铯鬯鲧鲷蝮譞葚笸裢艽琊哕伛镝槲窨嫫黟胪乩佶跶薅鲎戗鳔瘌塍膂麇蚡鸫仝竦綮赀罘圹扌傧顸衽钣癔嶷猡筌蔸蛄洌卟忝洹佥荑羧桫赉猞轸谰俦骓崃麈崆苄欹妣氘禳缁暝耜猁螅埚椠糍缟桄詈鲳庋糁糨驽镒铋缬谘鸬脔礽颟铌洚錾濞莳魑畛蚍寤葸焐雒耪蟊勖潴羼昝殍坭穰哌辶拊骶卍睃鸶鋆魍聃苴纡砬痤骘啶薜蜣蟥栲蠖鼋铙魉腩逯桴瑭楦荩牋觇睚榧簋蒗葶诔泷谯髹瘰钍溷邾蒹嘏鞡溽堞荽褙怙剡亓哏繇蓍嚯夤籴孛鹚粜蚴踬笕哓秕幂苈棰箬跞憍簟箅鲡嗪苌翮昴栊塄浯戥菀缂毖廛劬筲螵嫒鳇跗艹腬澶瘿唛崐疬纛暾翥黻溱瘐齑瘧帔橥枧圉顼蛞颛彧讵呣钯耨淠庹跸谠刿娈钕聱螈阏荜鼙菪杪詝荛郏蠓呒滏廄瘥喹憷睒阋螽怛蜮缒卮椟愬瓿氙鹩坼芟硐枘蹁呔瘳跖矬蛴仵绡蝓趑漶闼缣亍怃椐髀辏犭辋剀镬虺涠孓谝铒耑臌靰轾姒鲥蛏郇骒掊骟镪碲帑瑷髂锔铊赍彳阍妫洧噻髡橼鹆耩伲郃侑氽佾砘愀戋岢濬啉硖钇砗尥桷爨頫榇鼯茑饧囟蠊蕖柈蹽鹋垆赜怼氚嘧獒煳缧坜熳鸸嫘孥荇蝻鹪鳙脬墁萏羰懔嘌礅髑蓣呖肼哳舨柁洎倮瘕钋祢徼铈缑觏揎悫棼酃鸲鞯罟鳊罱馓缵殛钽跬陬肫朊鲞犰郄愦绐螬嗉皲酹嗞丨戽鲐绨葑璩莸蔹鲂旒绱谳彖菘脒骖蘩睺撄邴裉氆蚨襻惝蘧馃旰阃篼彘萁钐捃豨锞祧礞黾辂砩氇阝貘嫱瘊甓钲瞀埤卣甏媸鲔薢骀觌萆锇飧铗罴蛱踔毵蜱揸镆绗艏缯毹粝绁陔龠镔虼芰痖蕞劁柰鲮栌铷峣魈浍珰茺啌邶贶闍匦龢嵛煸皤鳐艿迮铟蚰眵晡禛瘅镅铫氍鲯旆夼悝颃蹀诼狨髌畋垌刖狳泺裣瓞骺藭酞晞唼裥笫忉堍缗乇钌蠛砟喈蔟咵屌垕痦澌饔绋跣蟮熘嬖龅炝诜鼍忄隹崦鬏鹇鲋屄镱佉硗鲽艉蜩癃蝾潲谇蓐祆幞郐獬蠼玠颙芴脲湔虮鳢鹣疭觋裒谖殪嗌槊舁镲扃卺媵蚺鲆蛲搌铼啯眄犋荬鼢陧揳喎瘗眚殂躞镧瘛缡鲣廨吔茛绠玢瘼醯廑犏盍眭筢郫埏笪岣莩螋慊氪艨诎袷尜蕺钫謦钭埽浞赙螭趱杩攮茼酤轺苘醅轹胗璺钆蝥耠殳劓鲩艟蒽觳硇痄泚宀嫠蜾疰鹛袼磲蝤衖阌饫鼷鋈礓笱脞虿苤喾蟪篥镠涑枨纟跽砉厍貔炅枵裰觯躐桤噍恧钪衤饣筇镘曛桲嚆濇宄柝敫茳帻癀觜鰤髁搛垲诖绲撙犴泖鄣缍郛槔鳓瀹踺猓鲦镦肭嵫埵龆蝽诹酲癍樘湉偾硪霪猱谫瑢刳蠃硭兕蕅奭麯舻揲昰舾鸺慝勣絷觫飑蕹炻胬膹厶醢瘵炱腽驩顒耱敉吣跐酆簏琇珧搠驵砑剞矧牤迕鮣嘡糈劂崞猊晄焮罶锸哜褰窬舴悃嵝礌璆僦罨醌阽铪慓冫蘼勔渖銎龀萑垤咶槠狝嗾稃胂榀遘炆囮嚭颡硃俜胙鹨劼驺儇鲚闿鐍汆鲼鞲忭鸰燉鹡菹耢醵铽猹僬狁铑痃箦锾槅吖礻檠黼铕躜羝锓弢螗帱洳罾胍镩昃讠葙牮奀檞瞢芤酾萜潆蝰鎦鹎搿蒉鍪呯缳瘈貅刂牂漐铞鎯硎埯厣蓠唪巉筘唦轵孖颥鞫笮奓綎摽醑斠臁擗舄楗竻蛑簦狴捯冖誖吲恝讬唣闶蛘谂芏菃缌挢谮掯蟛湜禩缏眜锎厓鞴嘚黹肷狻哚纩钔茇镙蹅屦嬲锝葜淴瑊庳聍坫菝卨咈裼蕷邠猃涫荭毱赆罥痎巯曌粢笾浼筅畎煺縯茈耵黉仂肟佧尢佴吽鷉膪饩獯彐苊齉憹恓缋廾昺鸊耥蟅攵滛嚜箢窆芘廒胨摅膦熜佺缞靿踥匚鹾圊鼗椈馇茓烜稂倧糇掎钷湓圬漭醣獍坶瞵拤蹾瘆蕡穸菤赕芑铥鸮踡瀵镟锼岵眍呴澉傺墚蔌骣黪杺浈斝狃鳘嵴铘鳆钬愔砜泶灬嗍喒踣氕酏劙呙埘芄蜞莶澫蓰瘖刭萹舡疒齁搋鲒贳阼暍艚碹躔牿滗龁侁瘭觔锪唵鞒臜莛肜麉琤蒇耖泐庀珓鹀窀飏焓锖梣菂镥镨寘浥暩怊旸骱砹镡瞤饹馘珦唻瀒叇稆芐滪猸榱靸玘阢陴穊锬锜砮姷锕榾駃蒈缲铴滠飗冂廴湣颎捵醭墼錡岽奫窭袆溻丿禆嫜焗伾觖毪琍瞍俶礤騟筻鼩篚矑撴傕檫喆憝锩粬郕跩寔锽吜呿堋颺藘諲榅澼堠韂崚侂鞞巂嗻蹯捽簖檑茚臢穞磉锘猇舣攉搕匜窋眢圞栳囷裛撢夂蠋揞觬鲺钶咹掭胩鹱烺噚芈穉撖刬嗼蒎癕辁纻煝睖羑刼棙偓姼銼涴柃笰镄獚琔珣冁镴沑螓鹙髟醰蕚焜朮鸻餂岍榍埜縡彟擐哿鲰螦铹橦誴瘃亠舯暅锿冏镎欬弪亼戤亸莝衭崟甗倓轕莰蠷齎荮毌亶璘鐇桯尫扠矋眊胲毆邲禵锳詥汋栴躄嗙柟纮嶒繺臠锫苲苠禚碥娭蓨蘗鲬穭洺蹻煿娙娖絓娕朘娔葎娐祩虍搳娊迻弝攴弣餦盬镤癎凵溍箙炘姟鄹噯玕拏鐾妀閰鳁烀滍衃觱絺霑衪朿鯆叆鲕徯艴俬瓓鶖铚匋搨瓘瓲摀肏篸鮄沲馉牸綼脰勹鲴陘棻鹮尪褉苾儴娞芃牣桊畗鄜斶睄娀釭蠔擩鈩瞐麕莂轇鈯撧饙驃饸娤彡娏矤錩鼽澂鮈鐩锍垯锊骎晳喤菵蟓萚燊轪赒爫鞔暷轷曈鎶赲曤籥騞镋娚飈赺蟟镵劐縜膆腘潽腂跂閂埮譓栆褆脶蓇脎挃抷喯閺砫佷岈赇蕁蕧牎逘鼱脧諐慍肶釡傤阠愊籣粁嫰惔瓖忞娨璮娦璢娝薐穵娎榰踇姺磰磵繐顮姡槜璈乂踿亷頦袊聺菥頞漤耲讔粃癴堉翧垍弴珫橒橚橞腙麨囍庴祅筼帡焑伷蘹遝訒岋齗翛厖羶厔蚇卐罽禤爁尅寯劻殽肀寕偁孃耔氹牳鰲誾蝘鯩冡洊猔洑罍瑒鬊琯塥鬭琝遹苨粦魟魌蚖怳粰籘丏粻弤鶫鬑獦猄猂賁狟銧犞犎娪蠵牪裀糵紕俛紞牚跕簥簠簒簃蘘爕篴篯爂姾燿奌霿絏絖誃絸兺絼綅閽熯贇熛铇熇獴焠憇炟惲玃悰玒髤髖皝箠箓髈岮箑髃骻骍炁玚驛娢玭蟢灂瀺鍥衒濽珷濩麔嚗覅緗啲呍郳緧濈黶鮓僇鉏諪鉈阓鯅潯貖潠酴踆漼笂竷痮竢竓漘蔲竑蕒竅愐窽惙滉縳藠帩鐑湝峇淯尙蝱媭鶿鷸涐娫涏娗涍蠆姳姁繟夒穜衂衹袮騣麃麖珹褵嚄珽襆繸琈唗覩鄗訆吿瑀詀瑄勍瑔剟洤洣瑫傜泬鯧沨沍鰥譃沄偼秿秾秼譠秳讙毠殢禥豮禟禜閟邽趦翝跥殜殗殑歠欖钖櫕逥祶祳痲檍懴檂礱橪翯耞蔞聠蔳聭蕣聻憣樦慠璙悮鶌磣皯馻皪馌徧碅薥楘皧璤頾璪璫椫藸椇弳廎瓰肐肻蘡脗脢嶴嵓岶椄屪棾棥蚆梿硏硋蛫桭蛵孮砤矻螀栬鰽鞧鱅螆栠鱠鱥鱳鲓鷈栍鷭媟鲹鳀柺娬鳉鳚娧娋姽腗腯姵腶膙姱膴姮膷奯枟夶夀枙枔朓曚袏晼墌鞁靷臗臷屮鹒饖鹟裩瞫褃昞昚瞜褯餔瞆嚒噳嘅覎鄷嗱唡畯覲畺觓觝敭觽呄芣卌芺苶麫苺勗茰勄剚睘釯諣眽眹冮眛兪僶擓傞盩盝莟阛莯菎菛撝傒齄倷摵齘鳫鳾佢鳿譇鴒鴢讖鴷乣摏搝萢楱貙丌閵镚葇搑揾揋餄飐颻跘揈掱踒掞踨捿崾巛捊鑺挶挜挓轘挐抃扽扂逷懽",
		// <a
		// href="http://ja.wikipedia.org/wiki/%E5%8D%8A%E8%A7%92%E3%82%AB%E3%83%8A"
		// accessdate="2012/8/3 23:50">半角カナ</a>・全角形 可能在以 'EUC-JP' 讀取 'EUC-KR' 或
		// 'GB 2312' 時大量出現而造成誤判。
		'ja-JP' : "｡-ﾟ薫椀麺暁讒弐枡犂狛繋賎陝篠噂噛榎鰯揃謳逓騫丼墺妬籾膿覗峯樋鎧餃冴呟瀧餠鷲圀珎琲糺鯰旛縞鮎蝋詁銚冨嶋暎繍銛塙烝頽喰弖鏃鴟鵜匁巌蟇釧鰊楕滸潅贄轢韃騨廏隴鯛鰹梱涜賑鉉掻禰筰錆鍮鐐駈騏髷鹸兎囃壻撹璽箒紬蔦薗鏑閾雫靱鴫凧喨牀眞瞼穣艫艶谺辿頚鮫壷廐楡櫨竈筥筧菫薺諌鋸鵞倅勦呰噺愾慇慙桟櫂渟甃癪筈篭蓴蕗貰軻陜鱈黌﨟偐嚶奝懃柊桝殲洟燵碕蕎譫贋轗韮俥厠嗇嚠壙尭幇焔皰絽綏罠翫膵萠蔀袿覦覬鎰鐙鑓鑵鰭偸凪憮朶杣栂欅烱爲稙竃絣臈菴蝿蟷袗躙鋲餉駢鮒鰕俤厰唖唹囎壜嫋宍尓屓怺拵梟櫟澪琿畷癬砿礬簀紆纒聡艪苅茣蓙薈裃訃諂諛贔躰銕鍼霙顋饂髣髴鮪鰐鱶鵺",
		// <a
		// href="http://ja.wikipedia.org/wiki/CJK%E4%BA%92%E6%8F%9B%E6%BC%A2%E5%AD%97"
		// accessdate="2012/3/17 14:6">CJK互換漢字</a>
		// 韓国の文字コード規格KS X 1001 (収録当時の規格番号はKS C 5601)
		// に含まれる重複漢字との往復変換を保証するために収録された漢字。
		// 半角・全角形.
		'ko-KR' : '\uF900-\uFA0B\uFFA1-\uFFDC',

		'arb-Arab' : '\u08A0-\u08FF\U0001EE00-\U0001EEFF',

		// Cyrillic Extended
		'ru-RU' : '\u0400-\u052F\u2DE0-\u2DFF\uA640-\uA69F',

		'en-US' : 'umwfgypbvkjxqzUMWFGYPBVKJXQZ'
	};

	character_signature['ru-RU'] += character_signature['ru-RU'].toLowerCase();

	/**
	 * @see <a href="http://ja.wikipedia.org/wiki/Unicode#.E4.B8.80.E8.A6.A7"
	 *      accessdate="2012/3/17 14:17">Unicode一覧</a>
	 * @returns
	 */
	guess_text_language.get_signature_RegExp = function() {
		var signature_RegExp = guess_text_language.signature_RegExp;

		if (!signature_RegExp) {
			// init

			var i, char_array, add_char = function(start, end) {
				char_array.push(String.fromCharCode(start) + '-'
						+ String.fromCharCode(end));
			}, set_RegExp = function(characters) {
				return new RegExp([ '[', characters, ']+' ].join(''), 'g');
			};

			// { IANA language tag : boundary ratio }
			guess_text_language.boundary = {};

			guess_text_language.signature_RegExp = signature_RegExp = {};

			for (i in character_signature) {
				signature_RegExp[i] = set_RegExp(character_signature[i]);
				if ((new language_tag(i)).language && i !== 'en-US') {
					library_namespace.debug('Adding [' + i + ']', 2,
							'guess_text_language.get_signature_RegExp');
					guess_text_language.boundary[i] = 0;
				}
			}

			for (i in seldom_signature) {
				signature_RegExp[i + guess_text_language.seldom_postfix] = set_RegExp(seldom_signature[i]);
			}

			/**
			 * <code>
			char_array = [ '[' ];
			add_char(0xFF66, 0xFF9D);
			char_array.push(seldom_signature['ja-JP'], ']+');
			signature_RegExp['ja-JP' + guess_text_language.seldom_postfix] = new RegExp(
					char_array.join(''), 'g');
			</code>
			 */

			if (library_namespace.is_debug(3)) {
				for (char_array in signature_RegExp) {
					library_namespace.debug(char_array + ': '
							+ signature_RegExp[char_array], 3,
							'guess_text_language.get_signature_RegExp');
				}
			}
		}

		return signature_RegExp;
	};

	_// JSDT:_module_
	.guess_text_language = guess_text_language;

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

	var guess_encodingSP = [];

	'3005:J,3006:J,3402:J,3447:C,3468:J,3473:C,359e:C,360e:C,361a:C,3918:C,396e:C,39cf:C,39d0:C,39df:C,3a73:C,3b4e:C,3b77:J,3c6e:C,3ce0:C,3f57:J,4056:C,415f:C,42c6:J,4302:J,4337:C,43ac:C,43b1:C,43dd:C,44be:J,44d4:J,44d6:C,464c:C,4661:C,4723:C,4729:C,477c:C,478d:C,4947:C,497a:C,497d:C,4982:C,4983:C,4985:C,4986:C,499b:C,499f:C,49b0:J,49b6:C,49b7:C,4c77:C,4c9f:C,4ca0:C,4ca1:C,4ca2:C,4ca3:C,4d13:C,4d14:C,4d15:C,4d16:C,4d17:C,4d18:C,4d19:C,4dae:C,4e12:J,4e13:C,4e1a:C,4e1b:C,4e1c:C,4e1d:C,4e24:C,4e25:C,4e27:C,4e28:J,4e2a:C,4e34:C,4e3a:C,4e3c:J,4e3d:C,4e3e:C,4e49:C,4e4c:C,4e50:C,4e54:C,4e60:C,4e61:C,4e62:J,4e66:C,4e70:C,4e71:C,4e8f:C,4e9a:C,4ea7:C,4ea9:C,4eb2:C,4eb5:C,4ebf:C,4ec5:C,4ece:C,4ed0:J,4ed1:C,4ed3:C,4eea:C,4eec:C,4f17:C,4f1b:C,4f1d:J,4f1e:C,4f1f:C,4f20:C,4f24:C,4f25:C,4f26:C,4f27:C,4f2a:C,4f65:C,4f66:J,4fa0:C,4fa1:J,4fa4:J,4fa5:C,4fa6:C,4fa7:C,4fa8:C,4fa9:C,4faa:C,4fac:C,4fb0:J,4fe3:J,4fe4:J,4fe5:J,4fe6:C,4fe7:J,4fe8:C,4fe9:C,4fea:C,4fed:C,5039:J,503a:C,503b:J,503e:C,5051:J,507b:C,507e:C,507f:C,50a5:C,50a7:C,50a8:C,50a9:C,50cd:J,50de:C,50f2:J,5170:C,5173:C,5174:C,517b:C,517d:C,5181:C,5188:C,5199:C,519b:C,519c:C,51af:C,51b2:C,51bb:C,51e4:C,51e7:J,51e9:J,51ea:J,51eb:C,51ed:C,51ee:J,51ef:C,51fb:C,51ff:C,520d:C,5218:C,5219:C,521a:C,521b:C,522b:C,522c:C,522d:C,523d:C,523f:C,5240:C,5242:C,5250:C,5251:C,5257:C,5267:C,5273:C,529d:C,529e:C,52a1:C,52a8:C,52b1:C,52b2:C,52b3:C,52bf:C,52cb:C,52da:C,5301:J,5302:J,5307:J,5326:C,532e:C,533b:C,534e:C,534f:C,5355:C,5356:C,5362:C,5364:C,536b:C,5385:C,5386:C,5389:C,538b:C,538c:C,538d:C,5395:C,53a0:C,53a3:C,53bf:C,53c2:C,53c6:C,53c7:C,53cc:C,53d1:C,53d8:C,53f6:C,53f7:C,53f9:C,53fa:J,53fd:C,540b:J,5413:C,5417:C,542f:C,544e:J,544f:J,5452:C,5453:C,5455:C,5456:C,5457:C,5458:C,545b:C,545c:C,5484:J,5491:J,5499:C,549b:C,549c:J,549d:C,54cd:C,54d1:C,54d2:C,54d3:C,54d4:C,54d5:C,54d7:C,54d8:J,54d9:C,54dd:C,54df:C,54e9:J,5500:J,551b:C,551d:C,5520:C,5521:C,5522:C,5553:C,5567:C,556c:C,556d:C,556e:C,5570:C,5578:C,55b0:J,55b7:C,55bd:C,55be:C,55eb:C,55f3:C,5624:C,5631:C,565c:C,565d:C,5678:J,567a:J,56a3:C,56c9:J,56ce:J,56e2:C,56ed:C,56f2:J,56f4:C,56f5:C,56fe:C,5706:C,5715:J,5726:J,5737:J,5738:J,5739:C,573a:C,5746:J,5757:C,575a:C,575b:C,575c:C,575d:C,575e:C,575f:C,5760:C,5784:C,5786:C,5788:J,5789:J,5792:C,57a4:J,57a6:C,57a9:C,57ab:C,57ac:J,57ad:C,57b0:J,57b2:C,57b3:J,57d6:J,57d8:C,57d9:C,57da:C,5811:C,5815:C,5840:J,5870:J,5899:C,58b8:J,58b9:J,58d7:J,58e5:J,58ee:C,58f0:C,58f3:C,58f6:C,58f8:C,5904:C,5907:C,5934:C,5939:C,593a:C,5941:C,594b:C,5956:C,5986:C,5987:C,5988:C,598b:J,599b:J,59a9:C,59aa:C,59ab:C,59c9:J,5a04:C,5a05:C,5a06:C,5a07:C,5a08:C,5a32:C,5a34:C,5a47:J,5a72:J,5a73:C,5a74:C,5a75:C,5a76:C,5aac:J,5ad2:C,5ad4:C,5af1:C,5b00:C,5b36:J,5b59:C,5b66:C,5b6a:C,5b93:J,5b9e:C,5ba0:C,5ba1:C,5baa:C,5bbd:C,5bbe:C,5bc9:J,5bdd:C,5bf9:C,5bfb:C,5bfc:C,5bff:C,5c06:C,5c14:C,5c18:C,5c1d:C,5c27:C,5c34:C,5c3d:C,5c42:C,5c5e:C,5c61:C,5c66:C,5c76:J,5c7f:C,5c81:C,5c82:C,5c96:C,5c97:C,5c98:C,5c9a:C,5c9b:C,5cbc:J,5cbd:C,5cbe:J,5cbf:C,5cc3:C,5cc4:C,5cc5:J,5ce0:J,5ce1:C,5ce3:C,5ce4:C,5ce6:C,5d02:C,5d03:C,5d10:C,5d2c:C,5d2d:C,5d58:C,5d59:J,5d5a:C,5d5d:C,5d76:J,5dc5:C,5de9:C,5def:C,5e01:C,5e05:C,5e08:C,5e0f:C,5e10:C,5e1c:C,5e26:C,5e27:C,5e2e:C,5e3b:C,5e3c:C,5e7f:C,5e83:J,5e86:C,5e90:C,5e91:C,5e93:C,5e94:C,5e99:C,5e9e:C,5e9f:C,5ebc:C,5f00:C,5f03:C,5f16:J,5f20:C,5f25:C,5f2f:C,5f39:C,5f41:J,5f45:J,5f52:C,5f53:C,5f55:C,5f7b:C,5f84:C,5f95:C,5fa4:J,5fc6:C,5fdc:J,5fe7:C,5ff0:J,5ffe:C,6001:C,6002:C,6003:C,6004:C,6005:C,6006:C,603a:J,603b:C,603c:C,603f:C,604b:C,6073:C,6076:C,6077:J,6078:C,6079:C,607a:C,607b:C,607c:C,607d:C,60ab:C,60ac:C,60ad:C,60af:C,60e7:C,60e8:C,60e9:C,60eb:C,60ec:C,60ed:C,60ee:C,60ef:C,6124:C,6126:C,6151:C,6164:C,61d1:C,61d2:C,6206:C,620b:C,620f:C,6217:C,6218:C,6256:J,6267:C,6268:J,6269:C,626a:C,626b:C,626c:C,629a:C,629f:C,62a0:C,62a1:C,62a2:C,62a4:C,62a5:C,62c5:C,62df:C,62e2:C,62e3:C,62e5:C,62e6:C,62e7:C,62e8:C,62e9:C,630a:J,6317:J,6318:J,631a:C,631b:C,631c:C,631d:C,631e:C,631f:C,6320:C,6321:C,6322:C,6324:C,6325:C,6326:C,6327:J,635e:C,635f:C,6361:C,6363:C,6364:J,6386:C,63b3:C,63b4:C,63b5:J,63b7:C,63b8:C,63ba:C,63bc:C,63fd:C,63ff:C,6400:C,6401:C,6402:C,6405:C,643e:J,6444:C,6445:C,6446:C,6448:C,644a:C,6484:C,64b5:C,64b7:C,64ba:C,64d3:C,64de:C,6512:C,654c:C,655b:C,6570:C,658b:C,6593:C,65a9:C,65ad:C,65e0:C,65e7:C,65f6:C,65f7:C,65f8:C,6619:C,663c:C,663d:C,663e:C,6653:C,6654:C,6655:C,6682:C,6683:J,66a7:C,66fb:J,6722:J,672f:C,6740:C,6741:J,6742:C,6743:C,6761:C,6762:J,6763:J,6764:J,6765:C,6766:J,6768:C,678c:J,679e:C,67a0:J,67a1:J,67a2:C,67a3:C,67a5:C,67a6:J,67a7:C,67a8:C,67a9:J,67aa:C,67ab:C,67ad:C,67d5:J,67e0:C,67fd:C,67fe:J,6802:J,6803:J,6807:C,6808:C,6809:C,680a:C,680b:C,680c:C,680d:J,680e:C,680f:C,6811:C,682c:J,6837:C,683e:C,685b:J,685c:J,685d:J,6861:C,6862:C,6863:C,6864:C,6865:C,6866:C,6867:C,6868:C,6869:C,6898:C,68a6:C,68ba:J,68bb:J,68c0:C,68c2:C,6917:J,6919:J,691a:J,691b:J,691f:C,6920:C,6921:J,6923:J,6924:C,6925:J,6926:J,6928:J,692a:J,692d:C,693f:J,697c:C,697e:J,697f:J,6980:J,6981:J,6984:C,6987:C,6988:C,6989:C,698a:J,69c7:J,69da:C,69db:C,69dd:J,69df:C,69e0:C,6a2b:J,6a2e:J,6a2f:C,6a30:J,6a31:C,6a3b:J,6a67:J,6a72:J,6a73:J,6a78:J,6a79:C,6a7c:C,6ab0:J,6ae4:J,6b1f:J,6b22:C,6b24:C,6b27:C,6b7c:C,6b87:C,6b8b:C,6b92:C,6b93:C,6b9a:C,6ba1:C,6ba8:C,6bb4:C,6bbb:C,6bc2:C,6bd5:C,6bd9:C,6bdf:J,6be1:C,6bee:J,6bf5:C,6c07:C,6c17:J,6c22:C,6c29:C,6c47:C,6c49:C,6c62:J,6c64:C,6c9f:C,6ca3:C,6ca4:C,6ca5:C,6ca6:C,6ca7:C,6ca8:C,6ca9:C,6caa:C,6cea:C,6cf7:C,6cf8:C,6cfa:C,6cfb:C,6cfc:C,6cfd:C,6cfe:C,6d43:C,6d45:C,6d46:C,6d47:C,6d48:C,6d49:C,6d4a:C,6d4b:C,6d4d:C,6d4e:C,6d4f:C,6d50:C,6d51:C,6d52:C,6d53:C,6d54:C,6d55:C,6d9b:C,6d9c:J,6d9d:C,6d9e:C,6d9f:C,6da0:C,6da1:C,6da2:C,6da4:C,6da6:C,6da7:C,6da8:C,6da9:C,6e0a:C,6e0d:C,6e0e:C,6e10:C,6e11:C,6e14:C,6e17:C,6e7e:C,6e7f:C,6e82:J,6e83:C,6e85:C,6e87:C,6ed7:C,6ede:C,6edf:C,6ee0:C,6ee1:C,6ee4:C,6ee5:C,6ee6:C,6ee8:C,6ee9:C,6eea:C,6f47:C,6f4b:C,6f4d:C,6f57:J,6f59:C,6f76:J,6f9c:C,6fbe:C,6fd1:C,6fd2:C,6ff9:J,704f:C,7067:C,706d:C,706f:C,7075:C,707e:C,707f:C,7080:C,7089:C,709c:C,709d:C,70b9:C,70bb:J,70bc:C,70bd:C,70c1:C,70c2:C,70c3:C,70db:C,70e6:C,70e7:C,70e8:C,70e9:C,70eb:C,70ec:C,70ed:C,7116:C,7118:C,7144:J,7173:J,7194:J,7195:J,71f5:J,7231:C,7232:C,7237:C,7240:C,724d:C,7275:C,727a:C,728a:C,72b6:C,72b7:C,72b8:C,72b9:C,72c6:J,72c8:C,72de:C,72ec:C,72ed:C,72ee:C,72ef:C,72f1:C,72f2:C,7303:C,730e:C,7315:C,7321:C,732b:C,732e:C,7341:C,736d:C,7391:C,739b:C,73ae:C,73af:C,73b0:C,73b1:C,73ba:C,73c6:J,73d1:C,73f2:C,740e:C,740f:C,7410:C,7411:J,743c:C,7443:J,7477:C,748e:C,74d2:C,74e7:J,74e9:J,74ea:J,74ef:C,74f0:J,74f1:J,74f2:J,74f8:J,74fc:J,7505:J,7523:C,7535:C,753b:C,753c:J,7545:C,7551:J,7560:J,7569:J,7573:J,7574:C,757d:J,7596:C,7597:C,759f:C,75a0:C,75a1:C,75ac:C,75ae:C,75af:C,75c7:J,75c8:C,75c9:C,75e8:C,75eb:C,7605:C,7606:C,7617:C,7618:C,762a:C,762b:C,762e:C,763b:C,763e:C,763f:C,764c:J,765e:C,7663:C,7667:C,766a:J,766b:C,7691:C,76b1:C,76b2:C,76cf:C,76d0:C,76d1:C,76d6:C,76d8:C,770d:C,7750:C,7751:C,7792:C,7798:C,77a9:C,77eb:C,77f6:C,77fe:C,77ff:C,7800:C,7801:C,7816:C,7817:C,781a:C,781c:C,783a:C,783b:C,783e:C,7840:C,7855:C,7856:C,7857:C,7859:C,785a:C,7872:J,7874:J,7877:C,788d:C,7897:J,789b:C,789c:C,78b5:J,78b8:C,7935:J,793c:C,794e:C,7962:C,796f:C,7977:C,7978:C,7985:C,79ef:C,79f0:C,79fd:C,7a23:C,7a2d:C,7a33:C,7a43:J,7a51:C,7a5d:J,7a77:C,7a83:C,7a8d:C,7a8e:C,7a9c:C,7a9d:C,7aa5:C,7aa6:C,7aad:C,7ac8:C,7acd:J,7acf:J,7ad3:J,7ad5:J,7ad6:C,7ade:C,7ae1:J,7aea:C,7af0:J,7b02:J,7b03:C,7b0b:C,7b14:C,7b15:C,7b39:J,7b3a:C,7b3c:C,7b3d:J,7b3e:C,7b5a:C,7b5b:C,7b79:C,7b7e:C,7b80:C,7b93:C,7ba5:J,7ba6:C,7ba7:C,7ba8:C,7ba9:C,7baa:C,7bab:C,7bcf:J,7bd1:C,7bd3:C,7bee:C,7c13:J,7c16:C,7c17:J,7c31:J,7c41:C,7c4f:J,7c74:C,7c75:J,7c7b:C,7c7e:J,7c81:J,7c82:J,7c8d:J,7c8f:J,7c90:J,7c9c:C,7c9d:C,7ca0:J,7ca8:J,7caa:C,7cab:J,7cad:J,7cae:C,7cc0:J,7cc1:C,7cce:J,7cd8:J,7d25:C,7d26:J,7d27:C,7d5d:C,7d76:C,7d77:C,7d89:C,7d9b:J,7dab:C,7db3:C,7dd1:C,7dd5:J,7dfc:C,7e05:J,7e27:C,7e28:J,7e4a:J,7e67:J,7e6e:C,7e83:J,7e90:J,7ea0:C,7ea1:C,7ea2:C,7ea3:C,7ea4:C,7ea5:C,7ea6:C,7ea7:C,7ea8:C,7ea9:C,7eaa:C,7eab:C,7eac:C,7ead:C,7eaf:C,7eb0:C,7eb1:C,7eb2:C,7eb3:C,7eb4:C,7eb5:C,7eb6:C,7eb7:C,7eb8:C,7eb9:C,7eba:C,7ebc:C,7ebd:C,7ebe:C,7ebf:C,7ec0:C,7ec1:C,7ec2:C,7ec3:C,7ec4:C,7ec5:C,7ec6:C,7ec7:C,7ec8:C,7ec9:C,7eca:C,7ecb:C,7ecc:C,7ecd:C,7ece:C,7ecf:C,7ed0:C,7ed1:C,7ed2:C,7ed3:C,7ed4:C,7ed5:C,7ed6:C,7ed7:C,7ed8:C,7ed9:C,7eda:C,7edb:C,7edc:C,7edd:C,7ede:C,7edf:C,7ee0:C,7ee1:C,7ee2:C,7ee3:C,7ee5:C,7ee6:C,7ee7:C,7ee8:C,7ee9:C,7eea:C,7eeb:C,7eed:C,7eee:C,7eef:C,7ef0:C,7ef2:C,7ef3:C,7ef4:C,7ef5:C,7ef6:C,7ef7:C,7ef8:C,7efa:C,7efb:C,7efc:C,7efd:C,7efe:C,7eff:C,7f00:C,7f01:C,7f02:C,7f03:C,7f04:C,7f05:C,7f06:C,7f07:C,7f08:C,7f09:C,7f0a:C,7f0c:C,7f0e:C,7f11:C,7f12:C,7f13:C,7f14:C,7f15:C,7f16:C,7f17:C,7f18:C,7f19:C,7f1a:C,7f1b:C,7f1c:C,7f1d:C,7f1e:C,7f1f:C,7f20:C,7f21:C,7f22:C,7f23:C,7f24:C,7f25:C,7f26:C,7f27:C,7f28:C,7f29:C,7f2a:C,7f2b:C,7f2c:C,7f2d:C,7f2e:C,7f2f:C,7f30:C,7f31:C,7f32:C,7f33:C,7f34:C,7f35:C,7f3c:J,7f42:C,7f4e:C,7f57:C,7f5a:C,7f62:C,7f74:C,7f81:C,7f9f:C,7faa:J,7fd8:C,7fda:C,8022:C,8027:C,802e:C,8038:C,8042:C,804b:C,804c:C,804d:C,8054:C,8062:J,8069:C,806a:C,8083:C,80a0:C,80a4:C,80be:C,80bf:C,80c0:C,80c1:C,80c6:C,80e7:C,80e8:C,80ea:C,80eb:C,80f1:J,80f6:C,8109:C,810d:C,810f:C,8110:C,8111:C,8113:C,8114:C,8135:J,8136:C,8138:C,8156:C,8158:C,817a:J,817b:C,817e:C,8191:C,81a4:J,81b5:J,81cd:J,81dc:C,8206:C,8220:J,822e:J,8230:C,8231:C,823b:C,8249:J,825d:J,8260:J,8270:C,8273:C,827a:C,8282:C,8297:C,829c:C,82a6:C,82c1:C,82c5:J,82c7:C,82c8:C,82cb:C,82cd:C,82cf:C,830e:C,830f:C,8311:C,8314:C,8315:C,834e:J,835a:C,835b:C,835c:C,835e:C,835f:C,8360:C,8361:C,8363:C,8364:C,8365:C,8366:C,8367:C,8368:C,8369:C,836a:C,836b:C,836c:C,836d:C,836e:C,836f:C,83b1:C,83b2:C,83b3:C,83b4:C,83b7:C,83b8:C,83b9:C,83ba:C,83bc:C,8419:J,841a:C,841d:C,8421:J,8422:J,8424:C,8425:C,8426:C,8427:C,8428:C,8429:J,8464:C,8485:J,8487:C,8489:C,848b:C,848c:C,8493:C,84d9:J,84da:J,84dc:J,84dd:C,84df:C,84e3:C,84e6:C,8534:C,8536:J,8537:C,8539:C,853a:C,853c:C,8552:C,8572:C,8574:C,85ae:C,85d3:C,85f4:C,8612:J,8630:J,8645:J,864f:C,8651:C,8672:J,867d:C,867e:C,867f:C,8680:C,8681:C,8682:C,86ab:J,86ac:C,86ca:C,86ce:C,86cf:C,86ee:C,86ef:J,86f0:C,86f1:C,86f2:C,86f3:C,86f4:C,8717:C,8747:C,8748:C,8749:C,877c:C,877e:C,87a7:J,87a8:C,87a9:J,87cf:C,87d0:J,87f5:J,8845:C,8846:C,8854:C,8865:C,886c:C,8884:C,8885:C,889c:C,88ad:C,88b0:J,88c3:J,88c4:J,88c5:C,88c6:C,88e2:C,88e3:C,88e4:C,88e5:C,8902:J,8904:J,891b:C,891c:J,8934:C,8947:C,8977:J,898e:C,89c1:C,89c2:C,89c3:C,89c4:C,89c5:C,89c6:C,89c7:C,89c8:C,89c9:C,89ca:C,89cb:C,89cc:C,89ce:C,89cf:C,89d0:C,89d1:C,89de:C,8a29:C,8a33:J,8a5f:C,8a89:C,8a8a:C,8aac:C,8aad:J,8aae:J,8ada:J,8b21:C,8b2d:C,8ba1:C,8ba2:C,8ba3:C,8ba4:C,8ba5:C,8ba6:C,8ba7:C,8ba8:C,8ba9:C,8baa:C,8bab:C,8bad:C,8bae:C,8baf:C,8bb0:C,8bb2:C,8bb3:C,8bb4:C,8bb5:C,8bb6:C,8bb7:C,8bb8:C,8bb9:C,8bba:C,8bbb:C,8bbc:C,8bbd:C,8bbe:C,8bbf:C,8bc0:C,8bc1:C,8bc2:C,8bc3:C,8bc4:C,8bc5:C,8bc6:C,8bc7:C,8bc8:C,8bc9:C,8bca:C,8bcb:C,8bcc:C,8bcd:C,8bce:C,8bcf:C,8bd1:C,8bd2:C,8bd3:C,8bd4:C,8bd5:C,8bd6:C,8bd7:C,8bd8:C,8bd9:C,8bda:C,8bdb:C,8bdd:C,8bde:C,8bdf:C,8be0:C,8be1:C,8be2:C,8be3:C,8be4:C,8be5:C,8be6:C,8be7:C,8be8:C,8be9:C,8beb:C,8bec:C,8bed:C,8bee:C,8bef:C,8bf0:C,8bf1:C,8bf2:C,8bf3:C,8bf4:C,8bf5:C,8bf6:C,8bf7:C,8bf8:C,8bf9:C,8bfa:C,8bfb:C,8bfc:C,8bfd:C,8bfe:C,8bff:C,8c00:C,8c01:C,8c02:C,8c03:C,8c04:C,8c05:C,8c06:C,8c07:C,8c08:C,8c09:C,8c0a:C,8c0b:C,8c0c:C,8c0d:C,8c0e:C,8c0f:C,8c10:C,8c11:C,8c12:C,8c13:C,8c14:C,8c15:C,8c16:C,8c17:C,8c18:C,8c19:C,8c1a:C,8c1b:C,8c1c:C,8c1d:C,8c1e:C,8c1f:C,8c20:C,8c21:C,8c22:C,8c23:C,8c24:C,8c25:C,8c26:C,8c27:C,8c28:C,8c29:C,8c2a:C,8c2b:C,8c2c:C,8c2d:C,8c2e:C,8c2f:C,8c30:C,8c31:C,8c32:C,8c33:C,8c34:C,8c35:C,8c36:C,8c6e:C,8cae:J,8ceb:C,8cec:J,8d0b:C,8d1c:C,8d1d:C,8d1e:C,8d1f:C,8d21:C,8d22:C,8d23:C,8d24:C,8d25:C,8d26:C,8d27:C,8d28:C,8d29:C,8d2a:C,8d2b:C,8d2c:C,8d2d:C,8d2e:C,8d2f:C,8d30:C,8d31:C,8d32:C,8d33:C,8d34:C,8d35:C,8d36:C,8d37:C,8d38:C,8d39:C,8d3a:C,8d3b:C,8d3c:C,8d3d:C,8d3e:C,8d3f:C,8d41:C,8d42:C,8d43:C,8d44:C,8d45:C,8d46:C,8d48:C,8d49:C,8d4a:C,8d4b:C,8d4c:C,8d4d:C,8d4e:C,8d4f:C,8d50:C,8d52:C,8d53:C,8d54:C,8d55:C,8d56:C,8d57:C,8d58:C,8d59:C,8d5a:C,8d5b:C,8d5c:C,8d5d:C,8d5e:C,8d60:C,8d61:C,8d62:C,8d63:C,8d6a:C,8d71:J,8d75:C,8d8b:C,8db1:C,8db8:C,8dc3:C,8dc4:C,8def:J,8df4:J,8df5:C,8df7:C,8df8:C,8df9:C,8dfb:C,8e0c:C,8e2c:C,8e2f:C,8e51:C,8e52:C,8e7f:C,8e8f:C,8e9c:C,8eae:J,8eaf:C,8eb5:J,8ebb:J,8ebe:J,8ec5:J,8ec8:J,8ee4:C,8ef2:C,8f4c:J,8f66:C,8f67:C,8f68:C,8f69:C,8f6b:C,8f6c:C,8f6d:C,8f6e:C,8f6f:C,8f70:C,8f71:C,8f72:C,8f73:C,8f74:C,8f76:C,8f77:C,8f78:C,8f79:C,8f7a:C,8f7b:C,8f7c:C,8f7d:C,8f7e:C,8f7f:C,8f82:C,8f83:C,8f84:C,8f85:C,8f86:C,8f87:C,8f88:C,8f89:C,8f8a:C,8f8b:C,8f8d:C,8f8e:C,8f8f:C,8f90:C,8f91:C,8f93:C,8f94:C,8f95:C,8f96:C,8f97:C,8f98:C,8f99:C,8f9a:C,8f9e:C,8fa9:C,8fab:C,8fb7:J,8fb9:C,8fbb:J,8fbc:J,8fbd:C,8fbe:C,8fc1:C,8fc7:C,8fc8:C,8fd0:C,8fd8:C,8fd9:C,8fda:J,8fdb:C,8fdc:C,8fdd:C,8fde:C,8fdf:C,8fe9:C,8ff9:C,9009:C,900a:C,9012:C,9026:C,9027:J,903b:C,9056:J,9057:C,9093:C,909d:C,90ac:C,90ae:C,90b9:C,90ba:C,90bb:C,90cf:C,90d0:C,90d1:C,90d2:J,90d3:C,90e6:C,90e7:C,90f8:C,915b:J,915d:C,9171:C,917d:C,917e:C,917f:C,9196:C,91ca:C,91d7:J,91fa:C,91fb:J,91fe:C,9208:C,920e:C,9225:J,9226:J,9228:J,9229:J,922c:J,9239:J,923e:J,9255:C,9262:C,926b:J,9274:C,9286:J,92ab:J,92ae:C,92af:J,92b1:C,92c5:J,92e5:C,92ed:C,92f2:J,9307:C,9332:C,9335:J,933a:J,933e:C,9340:C,9341:C,9344:J,9369:C,9384:C,9386:J,9387:C,93b8:C,93b9:J,93bf:C,93e5:J,93f0:C,941d:C,9420:J,9421:J,9426:C,9427:C,942f:C,9453:J,9454:C,9465:C,9479:C,9486:C,9487:C,9488:C,9489:C,948a:C,948b:C,948c:C,948d:C,948e:C,948f:C,9490:C,9492:C,9493:C,9494:C,9495:C,9496:C,9497:C,9498:C,9499:C,949a:C,949b:C,949d:C,949e:C,949f:C,94a0:C,94a1:C,94a2:C,94a4:C,94a5:C,94a6:C,94a7:C,94a8:C,94a9:C,94aa:C,94ab:C,94ac:C,94ad:C,94ae:C,94af:C,94b0:C,94b1:C,94b2:C,94b3:C,94b4:C,94b5:C,94b6:C,94b7:C,94b9:C,94ba:C,94bb:C,94bc:C,94bd:C,94be:C,94bf:C,94c0:C,94c1:C,94c2:C,94c3:C,94c4:C,94c5:C,94c6:C,94c8:C,94c9:C,94ca:C,94cb:C,94cc:C,94cd:C,94ce:C,94cf:C,94d0:C,94d1:C,94d2:C,94d3:C,94d5:C,94d7:C,94d9:C,94db:C,94dc:C,94dd:C,94de:C,94df:C,94e0:C,94e1:C,94e2:C,94e3:C,94e4:C,94e5:C,94e7:C,94e8:C,94e9:C,94ea:C,94eb:C,94ec:C,94ed:C,94ee:C,94ef:C,94f0:C,94f1:C,94f2:C,94f3:C,94f5:C,94f6:C,94f7:C,94f8:C,94f9:C,94fa:C,94fc:C,94fd:C,94fe:C,94ff:C,9500:C,9501:C,9502:C,9503:C,9504:C,9505:C,9506:C,9507:C,9508:C,9509:C,950b:C,950c:C,950e:C,950f:C,9510:C,9511:C,9512:C,9513:C,9514:C,9515:C,9517:C,9518:C,9519:C,951a:C,951b:C,951d:C,951e:C,951f:C,9521:C,9522:C,9523:C,9524:C,9525:C,9526:C,9527:C,9528:C,952b:C,952d:C,952e:C,952f:C,9530:C,9531:C,9532:C,9534:C,9535:C,9536:C,9537:C,9538:C,9539:C,953b:C,953c:C,953e:C,953f:C,9540:C,9541:C,9542:C,9543:C,9544:C,9545:C,9547:C,9549:C,954a:C,954b:C,954c:C,954d:C,954e:C,954f:C,9550:C,9551:C,9552:C,9553:C,9554:C,9556:C,9557:C,9558:C,955a:C,955b:C,955c:C,955d:C,955e:C,9562:C,9563:C,9564:C,9565:C,9566:C,9567:C,9568:C,9569:C,956a:C,956b:C,956c:C,956d:C,956e:C,956f:C,9570:C,9571:C,9572:C,9573:C,9574:C,9576:C,957f:C,9584:J,9587:J,958a:J,9596:J,95a0:J,95a7:C,95aa:J,95b2:C,95b8:J,95e6:J,95e8:C,95e9:C,95ea:C,95ed:C,95ee:C,95ef:C,95f0:C,95f1:C,95f2:C,95f4:C,95f5:C,95f7:C,95f8:C,95f9:C,95fa:C,95fb:C,95fc:C,95fd:C,95fe:C,95ff:C,9600:C,9601:C,9602:C,9603:C,9604:C,9605:C,9606:C,9608:C,9609:C,960a:C,960b:C,960c:C,960d:C,960e:C,960f:C,9610:C,9611:C,9612:C,9614:C,9615:C,9616:C,9617:C,9619:C,961a:C,961f:C,9633:C,9634:C,9635:C,9636:C,9645:C,9646:C,9647:C,9648:C,9649:C,9655:C,9668:C,9669:C,968f:C,9690:C,96b6:C,96be:C,96cf:C,96e0:C,96eb:J,96f3:C,96fe:C,9701:C,972d:C,974d:J,974e:J,974f:J,9753:C,9765:C,9779:J,9786:J,9790:J,9791:C,9792:C,979c:J,97af:C,97bd:C,97e6:C,97e7:C,97e8:C,97e9:C,97ea:C,97eb:C,97ec:C,97f5:C,983d:C,9854:C,986c:C,9875:C,9876:C,9877:C,9878:C,9879:C,987a:C,987b:C,987c:C,987d:C,987e:C,987f:C,9880:C,9881:C,9882:C,9883:C,9884:C,9885:C,9886:C,9887:C,9888:C,9889:C,988a:C,988b:C,988c:C,988d:C,988f:C,9890:C,9891:C,9893:C,9894:C,9896:C,9897:C,9898:C,9899:C,989b:C,989c:C,989d:C,989e:C,989f:C,98a0:C,98a1:C,98a2:C,98a4:C,98a5:C,98a6:C,98a7:C,98aa:J,98ce:C,98d2:C,98d3:C,98d4:C,98d5:C,98d7:C,98d8:C,98d9:C,98de:C,98e8:C,98ff:C,9904:C,990d:C,990e:C,990f:C,9919:J,991c:C,9936:C,9937:C,9942:J,994a:C,9962:C,9965:C,9966:C,9967:C,9968:C,9969:C,996a:C,996b:C,996c:C,996d:C,996e:C,996f:C,9970:C,9971:C,9972:C,9973:C,9974:C,9975:C,9976:C,9977:C,9978:C,9979:C,997a:C,997b:C,997c:C,997d:C,997f:C,9981:C,9983:C,9984:C,9985:C,9986:C,9987:C,9988:C,9989:C,998a:C,998b:C,998d:C,998e:C,998f:C,9990:C,9991:C,9992:C,9993:C,9994:C,9995:C,99e1:C,99f2:J,9a6b:J,9a6c:C,9a6d:C,9a6e:C,9a6f:C,9a70:C,9a71:C,9a73:C,9a74:C,9a75:C,9a76:C,9a77:C,9a78:C,9a79:C,9a7a:C,9a7b:C,9a7c:C,9a7d:C,9a7e:C,9a7f:C,9a80:C,9a81:C,9a82:C,9a84:C,9a85:C,9a86:C,9a87:C,9a88:C,9a8a:C,9a8b:C,9a8c:C,9a8e:C,9a8f:C,9a90:C,9a91:C,9a92:C,9a93:C,9a96:C,9a97:C,9a98:C,9a9a:C,9a9b:C,9a9c:C,9a9d:C,9a9e:C,9a9f:C,9aa0:C,9aa1:C,9aa2:C,9aa4:C,9aa5:C,9aa7:C,9ac5:C,9acb:C,9acc:C,9aea:J,9b13:C,9b47:C,9b49:C,9b5d:J,9b5e:J,9b6c:J,9b74:J,9b78:J,9b79:J,9b81:C,9b84:J,9b8d:C,9b8e:C,9b95:J,9b96:J,9b97:J,9b98:J,9b9d:C,9b9f:J,9ba3:C,9bb1:J,9bb4:J,9bba:C,9bce:J,9bcf:J,9bd0:J,9bd1:J,9bd2:J,9be1:J,9bf0:J,9bf1:J,9bf2:J,9bf3:J,9bff:C,9c02:C,9c04:J,9c0c:C,9c10:C,9c12:J,9c18:J,9c1f:C,9c21:J,9c27:C,9c2e:J,9c2f:J,9c30:J,9c35:C,9c39:J,9c45:C,9c47:J,9c48:J,9c5a:J,9c69:J,9c6a:J,9c6b:J,9c70:J,9c7c:C,9c7d:C,9c7f:C,9c81:C,9c82:C,9c85:C,9c86:C,9c87:C,9c88:C,9c8a:C,9c8b:C,9c8d:C,9c8e:C,9c8f:C,9c90:C,9c91:C,9c92:C,9c94:C,9c96:C,9c97:C,9c99:C,9c9a:C,9c9b:C,9c9c:C,9c9d:C,9c9e:C,9c9f:C,9ca0:C,9ca1:C,9ca2:C,9ca3:C,9ca4:C,9ca5:C,9ca6:C,9ca7:C,9ca8:C,9ca9:C,9cab:C,9cad:C,9cae:C,9cb0:C,9cb1:C,9cb2:C,9cb3:C,9cb5:C,9cb6:C,9cb7:C,9cb8:C,9cbb:C,9cbd:C,9cbf:C,9cc1:C,9cc3:C,9cc4:C,9cc5:C,9cc6:C,9cc7:C,9cca:C,9ccc:C,9ccd:C,9cce:C,9ccf:C,9cd1:C,9cd2:C,9cd3:C,9cd4:C,9cd5:C,9cd6:C,9cd7:C,9cd8:C,9cd9:C,9cdb:C,9cdc:C,9cdd:C,9cde:C,9cdf:C,9ce2:C,9ce3:C,9cec:C,9cf0:J,9cfe:C,9d2b:J,9d30:J,9d34:C,9d46:J,9d47:J,9d48:J,9d64:J,9d6e:C,9d93:C,9da5:C,9dab:J,9dc0:C,9dc4:C,9dc9:C,9e0a:C,9e1f:C,9e20:C,9e21:C,9e22:C,9e23:C,9e25:C,9e26:C,9e27:C,9e28:C,9e29:C,9e2a:C,9e2b:C,9e2c:C,9e2d:C,9e2e:C,9e2f:C,9e30:C,9e31:C,9e32:C,9e33:C,9e35:C,9e36:C,9e37:C,9e38:C,9e39:C,9e3a:C,9e3b:C,9e3c:C,9e3d:C,9e3e:C,9e3f:C,9e41:C,9e42:C,9e43:C,9e44:C,9e45:C,9e46:C,9e47:C,9e48:C,9e49:C,9e4a:C,9e4b:C,9e4c:C,9e4f:C,9e50:C,9e51:C,9e52:C,9e55:C,9e56:C,9e57:C,9e58:C,9e59:C,9e5a:C,9e5b:C,9e5c:C,9e5e:C,9e61:C,9e63:C,9e64:C,9e65:C,9e66:C,9e67:C,9e68:C,9e69:C,9e6a:C,9e6b:C,9e6c:C,9e6d:C,9e6f:C,9e70:C,9e73:C,9e7e:C,9e91:J,9ea6:C,9eaf:C,9eb8:C,9ebd:C,9ebf:J,9ec9:C,9ee1:C,9ee9:C,9efe:C,9f0b:C,9f0d:C,9f21:J,9f50:C,9f51:C,9f7f:C,9f80:C,9f83:C,9f84:C,9f85:C,9f86:C,9f87:C,9f88:C,9f89:C,9f8a:C,9f8b:C,9f8c:C,9f99:C,9f9a:C,9f9b:C,9f9f:C,fa0f:J,fa13:J,fa20:J,fa21:J,fa24:J,fa29:J'
	//
	.split(',').forEach(function(o) {
		var m = o.split(/:/);
		guess_encodingSP[parseInt(m[0], 16)] = m[1];
	});

	/**
	 * 靠常用字自動判別字串之編碼 string,預設編碼。
	 * 
	 * @param str
	 * @deprecated
	 */
	function guess_String_language(str) {
		if (typeof str !== 'string' || !(str = str.replace(/\s+/g, '')))
			return str;
		var len = str.length, i = 0, c, a, kana = 0, jianhuazi = 0, halfwidthKatakana = 0, Hangul = 0, ascii = 0, asciiHigh = 0, kanji = 0, kokuji = 0, symbol = 0, unknown = 0;
		// if (len > 9000) len = 9000;
		// var unknownC = '';

		// char分類
		for (; i < len; i++)
			if (c = str.charCodeAt(i), c < 0x80)
				ascii++;
			else if (c < 0x100)
				asciiHigh++;
			else if (c > 0x3040 && c < 0x30ff)
				kana++;
			else if (c === 0x30fb || c > 0xff65 && c < 0xff9e)
				halfwidthKatakana++;
			else if (c >= 0x1100 && c < 0x11fa || c >= 0xac00 && c < 0xad00
					|| c >= 0xd700 && c < 0xd7a4)
				Hangul++;
			else if (c > 0x4dff && c < 0x9fa6) {
				kanji++, a = guess_encodingSP[c];
				if (a === 'C')
					jianhuazi++;
				else if (a === 'J')
					kokuji++;
			} else if (c > 0xfa00 && c < 0xfa6b) {
				if (guess_encodingSP[c] === 'J')
					kokuji++;
			} else if (c > 0x2010 && c < 0x2610 || c >= 0xfe30 && c < 0xfe70
					|| c > 0xff00 && c < 0xff5f)
				symbol++;
			else if (c >= 0x3000 && c < 0x3400 || c > 0x33ff && c < 0x4db6)
				if (guess_encodingSP[c] === 'J')
					kokuji++;
				else
					symbol++;
			else {
				unknown++;
				// unknownC += str.charAt(i);
			}

		if (false) {
			alert('len=' + len + '\nkana=' + kana + '\nkokuji=' + kokuji
					+ '\njianhuazi=' + jianhuazi + '\nhalfwidthKatakana='
					+ halfwidthKatakana + '\nHangul=' + Hangul + '\nascii='
					+ ascii + '\nasciiHigh=' + asciiHigh + '\nkanji=' + kanji
					+ '\nsymbol=' + symbol + '\nunknown=' + unknown);
			if (unknownC)
				alert('unknown:\n' + unknownC.slice(0, 200));
			alert(unknownC.slice(0, 200) + '\n' + str.slice(0, 1000));
		}

		// 依各種常用字母之條件判別
		if (ascii + asciiHigh === len)
			return binary_charset;
		// unicode; unknown不能太多
		if (unknown > .05 * (len - ascii))
			return '';

		if (kana > .2 * len && kanji + kana + symbol > 3 * halfwidthKatakana)
			return 'Shift_JIS';

		if (kanji + symbol > .7 * (len - ascii) && kana < .05 * (len - ascii))
			return jianhuazi > .1 * kanji ? 'GB 2312' : 'Big5';
		// ks_c_5601
		if (Hangul + symbol > .7 * (len - ascii))
			return 'korean';

		if (kanji > .2 * (len - ascii))
			return jianhuazi > .1 * kanji ? kokuji > .02 * kanji ? 'unicode'
					: 'GB 2312' : kokuji > .02 * kanji ? 'Shift_JIS' : 'Big5';
		// unicode
		return '';
	}
	;

	/**
	 * <code>
	http://bbs.ee.ntu.edu.tw/boards/Linux/7/9/58.html	http://libai.math.ncu.edu.tw/~shann//Chinese/big5.html	http://wiki.debian.org.tw/index.php/Big5Variants	http://leoboard.cpatch.org/cgi-bin/topic.cgi?forum=20&topic=64&changemode=1
	http://www.theorem.ca/~mvcorks/cgi-bin/unicode.pl.cgi?start=F900&end=FAFF	http://homepage1.nifty.com/nomenclator/unicode/normalization.htm

	Unicode的漢字大致是以康熙部首排序，不過中間有部分字排錯部首筆劃
	第一批在1993年加進Unicode的，
	於中國內地、台灣、南韓及日本已有字集的漢字，
	編碼於U+4E00至U+9FA5，
	亦有部分南韓重覆漢字被編到U+F900至U+FA0B、
	兩個Big-5重覆漢字被編到U+FA0C至U+FA0D、
	日本廠商漢字被編到U+FA0E至U+FA2D

	全形符號（只限鍵盤上那94個）位於U+FF01至U+FF5E
	中日韓專用符號放到了U+3000至U+33FF內，
	其餘有部分符號放到了U+2XXX及U+FE30至U+FE6F

	第二批在1999年加進Unicode的，
	加進了新加坡用漢字、南韓PKS C 5700-2 1994、
	部分CNS11643第三、四、十五字面等用字、
	未包括在第一批字的數個GB字集用字，
	被編入U+3400至U+4DB5

	第三批在2001年加進Unicode的，
	加進了CNS11643第三、四、五、六、七、十五字面所有字、
	香港增補字集用字、四庫全書、辭海、辭源、康熙字典、
	漢語大字典、漢語大詞典內的所有用字，
	被編入U+20000至U+2A6D6
	JIS-X0213漢字被加到U+FA30至U+FA6A
	CNS11643重覆漢字被加到U+2F800至U+2FA1D

	简化字总表	http://cdns.twnic.net.tw/cjktable/	http://www.sxyw.cn/YuWenGongZuo/gfzs22.htm	http://huayuqiao.org/articles/xieshiya/Simplified/6_XinJiaPoTiaoZhengJianTiZi-XP.htm	http://www.hk-place.com/vp.php?board=2&id=333-9
	简化字分布似乎並無規範，只好以array判斷:

	<div id="dataGB">
	http://cdns.twnic.net.tw/cjktable/simtab.html
	簡化字總表之 UNICODE 碼表
	</div>
	<div id="dataJP">
	http://homepage2.nifty.com/TAB01645/ohara/index_j2.htm
	JIS区点索引
	</div>

	<script type="text/javascript">
	var i = 0, c = 0, guess_encodingSP = [], m = document.getElementById('dataGB').innerHTML
			.match(/\([0-9A-F]{4},\w*\)/g), t = "set_Object_value('guess_encodingSP','";
	for (; i < m.length; i++)
		// if(m[i].indexOf('C')!=-1&&m[i].slice(m[i].indexOf(',')+1).indexOf('T')==-1)t+=m[i].substr(1,5);
		if (m[i].indexOf('T') == -1)
			guess_encodingSP[parseInt(m[i].substr(1, 4), 16)] = 'C';
	for (i = 0, m = document.getElementById('dataJP').innerHTML.match(/【.】/g); i < m.length; i++)
		guess_encodingSP[parseInt(m[i].charCodeAt(1))] = guess_encodingSP[parseInt(m[i]
				.charCodeAt(1))] ? 0 : 'J';
	
	m = [];
	for (i in guess_encodingSP)
		m.push(parseInt(i));
	m.sort();
	for (i = 0; i < m.length; i++)
		if (guess_encodingSP[m[i]]) {
			t += m[i].toString(16) + '=' + guess_encodingSP[m[i]] + ',', c++;
			if (c % 40 == 0)
				t += "'<br />+'";
		}
	alert(c + '字');
	document.getElementById('dataJP').innerHTML = '';
	document.getElementById('dataGB').innerHTML = t.slice(0, -1) + "',1,16);";
	</script>


	和製漢字(国字)は、和語(ﾔﾏﾄｺﾄﾊﾞ)に相当する漢字が無い場合に新規につくられたもので、奈良時代から作られた。ほとんどは訓読みしかない。魚篇や木篇が多い。
	http://homepage2.nifty.com/TAB01645/ohara/index.htm
	http://zh.wiktionary.org/wiki/%E8%BE%BB
	http://www.unicode.org/cgi-bin/GetUnihanData.pl?codepoint=8fbb
	http://jprs.jp/doc/rule/saisoku-1-wideusejp-furoku-4.html
	http://m2000.idv.tw/informer/zhi/char-root.htm
	http://www.ajisai.sakura.ne.jp/~dindi/chrc/ref/wincode2.txt
	http://cs-people.bu.edu/butta1/personal/hkscs/hkscs-oct.html
	http://www.nobi.or.jp/i/kotoba/kanji/wasei-kanji.html
	http://www.melma.com/mag/52/m00011552/a00000066.html


	韓語字母/諺文
	http://www.sinica.edu.tw/~cytseng/Korean%20reader/hangul.htm
	http://www.unicode.org/charts/normalization/

	old:
	//	自動判別檔案（或字串）之編碼
	function guess_encoding(FN) {
		if (!is_file(FN))
			return FN.length > 64 ? guess_String_language(FN)
					: guess_encoding.unknown_encoding;
		open_file(FN, binary_charset);
		if (!AdoEnums)
			return guess_encoding.unknown_encoding;
		// ADO_Stream.Type=AdoEnums.adTypeBinary;
		ADO_Stream.LoadFromFile(FN);
		var t = ADO_Stream.ReadText(3), code;
		// Unicode的Byte Order Mark(BOM)在UTF-16LE(little endian)裏，它是以FF-FE這兩個bytes表達，在BE(big endian)裏，是FEFF。而在UTF-8裏，它是以EF-BB-BF這三個bytes表達。
		if (t.slice(0, 2) === '\xFF\xFE')
			code = 'unicodeFFFE';
		if (t.slice(0, 2) === '\xFE\xFF')
			code = 'unicode';
		if (t === '\xEF\xBB\xBF')
			code = 'UTF-8';
		if (code) {
			ADO_Stream.Close();
			return code;
		}
	
		if (!code) {
			// 將 Shift_JIS 排在 GB 2312 與 Big5 前面是因為 Shift_JIS 常符合 GB 2312，且 Shift_JIS
			// 之判定相當嚴。
			if (!code)
				ADO_Stream.Position = 0, ADO_Stream.Charset = 'Shift_JIS',
						code = guess_String_language(ADO_Stream.ReadText(900),
								ADO_Stream.Charset);
			// 將 GB 2312 排在 Big5 前面是因為 GB 2312 常用字在 Big5 中常常是0x8000之後的常用字，Big5
			// 常用字卻常常是 GB 2312 中奇怪字碼與罕用字。
			if (!code)
				ADO_Stream.Position = 0, ADO_Stream.Charset = 'GB 2312',
						code = guess_String_language(ADO_Stream.ReadText(2000),
								ADO_Stream.Charset);
			if (!code)
				ADO_Stream.Position = 0, ADO_Stream.Charset = 'Big5',
						code = guess_String_language(ADO_Stream.ReadText(2000),
								ADO_Stream.Charset);
		}
	
		ADO_Stream.Close();
		return code || guess_encoding.unknown_encoding; // ascii=ISO-8859-1,_autodetect,_autodetect_all
	}
	// 靠常用字自動判別字串之編碼 string,預設編碼
	function guess_String_language(str, dcode) {
		var code;
		if (str.length > 9000)
			str = str.slice(0, 9000);
	
		// 將Shift_JIS排在 GB 2312 與Big5前面是因為Shift_JIS常符合gb，且Shift_JIS之判定相當嚴。
		if (dcode == 'Shift_JIS' || !dcode && !code) {
			// http://www.asahi-net.or.jp/~hc3j-tkg/unicode/
			// http://www.unicode.org/Public/UNIDATA/DerivedCoreProperties.txt
			var i = 0, c, k = 0, u = 0, h = 0;// h_=u_=k_='';
			for (; i < str.length; i++)
				if (c = str.charCodeAt(i), c > 0xFF)
					if (c == 0x30FB || c > 0xFF65 && c < 0xFF9E) {
						// HALFWIDTH
						h++;
						// h_+=str.charAt(i);//||c===0xE134
					}
					// KATAKANA LETTER等可能不是日文文件中會出現的char
					else if (c > 0x3040 && c < 0x30FF) {
						// kana
						k++;
						// k_+=str.charAt(i);
					} else {
						// unknown kanji
						u++;
						// u_+=str.charAt(i);
					}
			if (false) {
				alert(k + ',' + u + ',' + h + '\n*' + k_ + '\n*' + u_ + '\n*' + h_);
				alert(u_.charCodeAt(2));
			}
			if (k + u > 2 * h)
				// HALFWIDTH KATAKANA LETTER數目比漢字少時判別為Shift_JIS
				code = 'Shift_JIS';
		}
	
		// 將 GB 2312 排在Big5前面是因為 GB 2312 常用字在Big5中常常是0x8000之後的常用字，Big5常用字卻常常是 GB
		// 2312 中奇怪字碼與罕用字
		if (dcode == 'Big5' || dcode == 'GB 2312' || !dcode && !code) {
			var i = 0, c, k = 0, u = 0;
			// k_=u_='';
			for (; i < str.length; i++)
				if (c = str.charCodeAt(i), c > 0xFF)
					if (c > 0x4DFF && c < 0x9FA6 || c > 0xFF00 && c < 0xFF5F
							|| c > 0x33ff && c < 0x4DB6 || c == 0x2605
							|| c == 0x2606) {
						// 2605,6:★☆
						k++;
						// k_+=str.charAt(i);
					} else {
						u++;
						// ,u_+=str.charAt(i);
					}
			if (false)
				alert(k + ',' + u + '\n' + k_ + '\n*' + u_);
			if (k > 5 * u)
				// 漢字比不認識的字多時判定
				code = dcode || 'Big5';
		}
	
		if (dcode == binary_charset || dcode == 'ascii' || !dcode && !code) {
		}
	
		return code;
	}
	</code>
	 */

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//
	var to_kana_pair, to_romaji_pair;

	/**
	 * convert romaji to kana. ロマ字→仮名.
	 * 
	 * @example <code>

	// More examples: see /_test suite/test.js

	 * </code>
	 * 
	 * @param {String}text
	 *            text to be converted.
	 * @returns {String} text converted.
	 */
	function to_kana(text) {
		return to_kana_pair.convert(text);
	}

	/**
	 * convert kana to romaji. 仮名→ロマ字.
	 * 
	 * @param {String}text
	 *            text to be converted.
	 * @returns {String} text converted.
	 */
	function to_romaji(text) {
		return to_romaji_pair.convert(text);
	}

	/**
	 * initialize 仮名/ロマ字(羅馬字) pair.
	 */
	function initialize_kana_romaji(function_name) {
		if (!to_kana_pair) {
			to_kana_pair = new library_namespace.data.Convert_Pairs(null, {
				path : library_namespace.get_module_path(module_name.replace(
						/[^.]+$/, ''),
				// 'resources/kana romaji.txt'
				library_namespace.env.resources_directory_name
						+ '/kana romaji.txt'),
				encoding : 'UTF-8',
				remove_comments : true
			});
			to_romaji_pair = to_kana_pair.clone().reverse();
		}

		return function_name === 'to_kana' ? to_kana : to_romaji;
	}

	library_namespace.set_initializor('to_kana', initialize_kana_romaji, _);
	library_namespace.set_initializor('to_romaji', initialize_kana_romaji, _);

	// --------------------------------------------------------

	_// JSDT:_module_
	.
	/**
	 * 將 BIG5 日文假名碼修改為 Unicode 日文假名。
	 * 
	 * @param {String}
	 *            text Unicode text
	 * @return {String}Unicode 日文假名。
	 * @see from Unicode 補完計畫 jrename.js
	 */
	Big5_kana_fix = function(text) {
		var H = [], t, i = 0;
		for (; i < text.length; i++) {
			t = c.charCodeAt(0);
			// 某次破解 Windows Installer 所用的資料
			// H += String.fromCharCode(t > 61300 ? t - 48977 : t);
			H.push(t === 63219 ? 'ー' : String.fromCharCode(
			// ひらがな
			t >= 63223 && t <= 63305 ? t - 50870 :
			// カタカナ
			t >= 63306 && t <= 63391 ? t - 50857 :
			// text.charAt(i);
			t));
		}
		return H.join('');
	};

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

	return (_// JSDT:_module_
	);
}
