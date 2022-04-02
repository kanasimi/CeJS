/**
 * @name CeL function for 繁簡中文字詞彙轉換。
 * 
 * TODO:<br />
 * 在量大的時候，此方法速度頗慢。 Using Map()<br />
 * words conversion
 * 
 * @fileoverview 本檔案包含了繁體/簡體中文轉換的 functions。
 * @example <code>

// 在非 Windows 平台上避免 fatal 錯誤。
CeL.env.ignore_COM_error = true;
// load module for CeL.CN_to_TW('简体')
CeL.run('extension.zh_conversion', function() {
	var text = CeL.CN_to_TW('简体中文文字');
	CeL.CN_to_TW.file('from.htm', 'to.htm', 'utf-8');
});

 </code>
 * @see https://github.com/BYVoid/OpenCC https://zhconvert.org/
 *      https://en.wiktionary.org/wiki/Module:zh
 * @since 2014/6/17 22:39:16
 */

'use strict';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'extension.zh_conversion',

	require : 'data.|data.Convert_Pairs.|application.OS.Windows.file.',

	// 設定不匯出的子函式。
	no_extend : 'generate_converter',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {
	// requiring
	var Convert_Pairs = library_namespace.data.Convert_Pairs;

	/**
	 * null module constructor
	 * 
	 * @class 中文繁簡轉換的 functions
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

	// ------------------------------------------------------------------------

	// new RegExp(key, REPLACE_FLAG);
	var REPLACE_FLAG = undefined,
	// using BYVoid / OpenCC 開放中文轉換 (Open Chinese Convert) table.
	// https://github.com/BYVoid/OpenCC/tree/master/data/dictionary
	dictionary_base = library_namespace.get_module_path(this.id, 'OpenCC'
			+ library_namespace.env.path_separator);
	// console.log('dictionary_base: ' + dictionary_base);

	function Converter(options) {
		// console.log(options);

		// e.g., .files, .file_filter
		Object.assign(this, options);
		// console.trace(this.files);
	}

	function Converter_initialization(options) {
		// console.trace(this.files);

		function item_processor(item) {
			var matched = item.match(/^([^\t]+)\t([^\t]+)$/);
			if (matched) {
				if (!matched[1].trim())
					return;
				if (/ [^\t]+$/.test(matched[2])) {
					if (matched[2].startsWith(matched[1] + ' ')) {
						// console.log('詞有疑意: ' + item);
						// 但像是"小丑"之類的還是必須保留。
						// return;
					}
					// 必須置換，那就換個最常用的。
					return item.replace(/ +[^\t]+$/, '');
				}
			}
			return item;
		}

		function corrections_item_processor(item, options) {
			var matched = item.match(/^-([^\t\n]{1,30})$/);
			if (!matched) {
				return item;
			}
			remove_key_hash[matched[1]] = options.path;
			return '';
		}

		function to_full_file_path(file_path) {
			return /[\\\/]/.test(file_path) ? file_path : dictionary_base
					+ file_path + '.txt';
		}

		this.conversions = [];
		this.files.map(function(file_list) {
			var _options = {
				file_filter : this.file_filter,

				// no_the_same_key_value : !Array.isArray(file_list)
				// || file_list.length < 2,

				item_processor : item_processor,
				// 在開始轉換之後就不會再修改辭典檔，因此可移除 .pair_Map。
				may_remove_pair_Map : !options || !options.mode
			};

			if (!Array.isArray(file_list))
				file_list = [ file_list ];

			_options.path = file_list
			// 載入 resources。
			.map(function(file_path) {
				if (typeof file_path === 'string')
					return to_full_file_path(file_path);
				// assert: library_namespace.is_Object(file_path)
				var __options = file_path;
				// e.g., for .remove_comments
				if (!__options.file_path && !__options.path
				//
				&& __options.file_name) {
					__options.file_path
					//
					= to_full_file_path(__options.file_name);
				}
				// assert: !!__options.file_path === true
				return __options;
			});

			var convert_Pairs = new Convert_Pairs(null, _options);
			if (convert_Pairs.pair_Map.size > 0) {
				// console.trace([ convert_Pairs.pair_Map.get('猜拳斗酒') ]);
				this.conversions.push(convert_Pairs);
			}
		}, this);
		delete this.file_filter;
		// console.log(this.conversions);
		// console.trace(this.conversions[0].pair_Map.size);

		// --------------------------------------

		if (this.corrections) {
			// keys_to_remove
			var remove_key_hash = Object.create(null);
			// this.conversions: 手動修正表。提供自行更改的功能。
			this.conversions.push(new Convert_Pairs(null, {
				path : dictionary_base.replace(/[^\\\/]+[\\\/]$/,
						this.corrections),
				item_processor : corrections_item_processor,
				remove_comments : true
			}));
			delete this.corrections;

			if (!library_namespace.is_empty_object(remove_key_hash)) {
				this.conversions.forEach(function(conversion) {
					// console.trace(conversion.pair_Map.get('猜拳斗酒'));
					if (false && conversion.pair_Map.get('猜拳斗酒')) {
						console.log(conversion);
						throw conversion.pair_Map.get('猜拳斗酒');
					}
					conversion.remove(remove_key_hash, {
						remove_matched_path : true
					});
				});
				// free
				remove_key_hash = null;
			}
		}

		// 設定事前轉換表。
		if (this.prefix_conversions) {
			this.conversions.unshift(new Convert_Pairs(this.prefix_conversions,
					{
						flags : this.flags || REPLACE_FLAG
					}));
			delete this.prefix_conversions;
		}

		// 設定事後轉換表。
		if (this.postfix_conversions) {
			this.conversions.push(new Convert_Pairs(this.postfix_conversions, {
				flags : this.flags || REPLACE_FLAG
			}));
			delete this.postfix_conversions;
		}

		// console.trace(this('签'));
	}

	// convert text
	function convert_text(text, options) {
		if (!this.conversions) {
			this.initialization(options);
		}

		// 事前轉換表。
		if (options && options.prefix_conversions) {
			text = (new Convert_Pairs(options.prefix_conversions, {
				flags : options.flags || REPLACE_FLAG
			})).convert(text);
		}

		var for_each_conversion;
		if (!options) {
		} else if (options.mode === 'word') {
			// 僅轉換完全相符的詞彙 key。
			for_each_conversion = function(_text, conversion) {
				// console.log(conversion.pair)
				var convert_to = conversion.get_value(_text);
				return typeof convert_to === 'string' ? convert_to : _text;
			};
		} else if (false && options.mode === 'word_first') {
			// 輸入單一詞彙時使用，以期加快速度...可惜沒有。
			// node.js: 直接開 `conversion.convert(text)` 速度相同，且還包含
			// .special_keys_Map 的轉換，較完整。
			for_each_conversion = function(_text, conversion) {
				var convert_to = conversion.get_value(_text);
				return typeof convert_to === 'string' ? convert_to : conversion
						.convert(_text, options);
			};
		}

		text = this.conversions.reduce(for_each_conversion
				|| function(_text, conversion) {
					return conversion.convert(_text, options);
				}, text);
		// console.trace(text);

		if (!(this.max_convert_word_length >= 0)) {
			this.max_convert_word_length = this.conversions.reduce(function(
					length, conversion) {
				return Math.max(length, conversion.pair_Map_by_length.length);
			}, 0);
			// console.trace(this);
			if (this['interface'])
				this['interface'].max_convert_word_length = this.max_convert_word_length;
		}

		// 事後轉換表。
		if (options && options.postfix_conversions) {
			text = (new Convert_Pairs(options.postfix_conversions, {
				flags : options.flags || REPLACE_FLAG
			})).convert(text);
		}

		return text;
	}

	// convert text file
	function convert_file(from, to, target_encoding) {
		var text = library_namespace.get_file(from);
		text = this(text);
		library_namespace.write_file(to, text, target_encoding);
	}

	Object.assign(Converter.prototype, {
		initialization : Converter_initialization,
		convert : convert_text,
		file : convert_file
	});

	Converter.options = {
		CN_to_TW : {
			// 事前事後轉換表須事先設定。
			// 不可以 Object.assign(CeL.CN_to_TW.prefix_conversions = {}, {})
			// 來新增事前轉換表。
			// prefix_conversions : {},
			// postfix_conversions : {},

			files : [ [ 'STPhrases', 'STCharacters',
			// 以 generate_additional_table.js 合併新同文堂和 ConvertZZ 的辭典檔。
			'additional.to_TW.auto-generated',
			// 後來的會覆蓋前面的。
			{
				file_name : 'additional.to_TW',
				remove_comments : true
			} ],
			// ------------------------------------------------------
			// ** 下面的是上面詞彙與單字轉換後的再轉換。
			[ 'TWPhrasesIT',
			// ↑ TWPhrasesIT.txt 有許多常用詞彙，在 corrections_to_TW.txt 取消。
			'TWPhrasesName', 'TWPhrasesOther',
			// 若要篩選或增減 conversion files，可參考範例：
			// start_downloading() @ CeL.application.net.work_crawler.task
			{
				file_name : 'additional.to_TW.phrases',
				remove_comments : true
			} ],
			// https://github.com/BYVoid/OpenCC/blob/master/data/config/s2twp.json
			'TWVariants' ],
			corrections : 'corrections_to_TW.txt'
		},
		TW_to_CN : {
			// 事前事後轉換表須事先設定。
			// prefix_conversions : {},
			// postfix_conversions : {},

			// https://github.com/BYVoid/OpenCC/blob/master/data/config/tw2s.json
			// https://github.com/BYVoid/OpenCC/blob/master/node/dicts.gypi
			files : [ 'TWVariantsRevPhrases', [ 'TSPhrases', 'TSCharacters',
			// 以 generate_additional_table.js 合併新同文堂和 ConvertZZ 的辭典檔。
			'additional.to_CN.auto-generated',
			// 後來的會覆蓋前面的。
			{
				file_name : 'additional.to_CN',
				remove_comments : true
			} ] ],
			// ------------------------------------------------------
			// ** 下面的是上面詞彙與單字轉換後的再轉換。
			corrections : 'corrections_to_CN.txt'
		}
	};

	// ------------------------------------------------------------------------

	function set_as_default(method_name, method) {
		library_namespace[method_name] = _[method_name] = method;
	}

	function generate_converter(type, options) {
		options = library_namespace.setup_options(options);
		if (!(type in Converter.options)) {
			library_namespace.error(
			//
			'generate_converter: Invalid type: ' + type);
			return;
		}

		var converter = new Converter(Object.assign(Object
				.clone(Converter.options[type]), options));
		var converter_interface = converter.convert.bind(converter);
		converter['interface'] = converter_interface;
		if (options.set_as_default) {
			set_as_default(type, converter_interface);
		}
		return converter_interface;
	}

	var cecc;
	function using_CeCC(options) {
		// 前置處理。
		options = library_namespace.setup_options(options);
		if (cecc && !options.force_using_cecc) {
			library_namespace.debug('CeCC loaded.');
			return true;
		}

		var CeCC;
		try {
			CeCC = require('cecc');
		} catch (e) {
			try {
				// base_path/CeJS/ce.js
				// base_path/Chinese_converter/Chinese_converter.js
				CeCC = require(library_namespace.simplify_path(
				//
				library_namespace.get_module_path().replace(/[^\\\/]*$/,
						'../Chinese_converter/Chinese_converter.js')));
			} catch (e) {
			}
		}

		if (!CeCC) {
			return;
		}

		if (!options.try_LTP_server) {
			cecc = new CeCC(options);
			return setup_CeCC_methods(options);
		}

		return CeCC.has_LTP_server(options).then(function(LTP_URL) {
			if (!LTP_URL)
				return;

			options.LTP_URL = LTP_URL;
			cecc = new CeCC(options);
			cecc.is_asynchronous = true;
			return setup_CeCC_methods(options);
		});
	}

	function setup_CeCC_methods(options) {
		library_namespace.info('using_CeCC: Using CeCC ('
				+ (cecc.is_asynchronous ? 'asynchronous' : 'synchronous')
				+ ' version) to convert language.');
		var methods = {
			CN_to_TW : 'to_TW',
			TW_to_CN : 'to_TW'
		};
		for ( var method_name in methods) {
			var cecc_name = methods[method_name];
			if (!cecc.is_asynchronous)
				cecc_name += '_sync';
			var method = cecc[cecc_name].bind(cecc);
			method.is_CeCC = true;
			method.cecc = cecc;
			if (cecc.is_asynchronous)
				method.is_asynchronous = true;
			set_as_default(method_name, method);
		}
		return true;
	}

	// ------------------------------------------------------------------------
	// export

	_.generate_converter = generate_converter;
	_.using_CeCC = using_CeCC;

	try {
		var OpenCC = require('opencc');
		// Load the default Simplified to Traditional config
		_.CN_to_TW = new OpenCC('s2t.json');
		// Sync API
		_.CN_to_TW = _.CN_to_TW.convertSync.bind(_.CN_to_TW);

		_.TW_to_CN = new OpenCC('t2s.json');
		_.TW_to_CN = _.TW_to_CN.convertSync.bind(_.TW_to_CN);

	} catch (e) {
		// CeL.application.net.work_crawler.task will re-generate the functions!
		generate_converter('CN_to_TW', {
			set_as_default : true
		});
		generate_converter('TW_to_CN', {
			set_as_default : true
		});
	}

	// Warning: require('cecc') will overwrite CeL.CN_to_TW, CeL.TW_to_CN !

	return (_// JSDT:_module_
	);

}
