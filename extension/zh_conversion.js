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

	/**
	 * 正規化 item，轉成純粹 `from "\t" to`。
	 * 
	 * @param {String}text
	 *            text line
	 * 
	 * @return {String} `from "\t" to`
	 */
	function default_item_processor(item) {
		var matched = item.match(/^([^\t]+)\t([^\t]+)$/);
		if (matched) {
			var trimmed_convert_from = matched[1].trim();
			if (!trimmed_convert_from) {
				library_namespace
						.warn('default_item_processor: Skip line without convert from: '
								+ item);
				return;
			}
			if (trimmed_convert_from !== matched[1]) {
				library_namespace.warn('default_item_processor: 前後有空白: ['
						+ matched[1] + '] @ ' + item);
			}

			// 當from含有空白字元時不當作有不同選項可用。
			// e.g., "第三百二十五章 面" → "第三百二十五章 麵"
			var splitted = !/\s/.test(trimmed_convert_from)
					&& matched[2].split(/\s+/);
			// 當to含有空白字元時表示有不同選項可用。
			if (splitted && splitted.length > 1
			// e.g., "方便面" → "泡麵 速食麵"
			// && matched[1].length === splitted[0].length
			) {
				if (matched[1] === splitted[0]) {
					// console.log('詞有疑意: ' + item);
					// 但像是"小丑"之類的還是必須保留。
					// return;
				}
				// 必須置換，那就換個最常用的。
				item = matched[1] + '\t' + splitted[0];
			}
		}
		return item;
	}

	/** @inner */
	function to_full_file_path(file_path) {
		return /[\\\/]/.test(file_path) ? file_path : dictionary_base
				+ file_path + '.txt';
	}

	/**
	 * @param {Object|Array}conversion_group_options
	 *            conversion group configuration
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @example <code>

	CeL.zh_conversion.CN_to_TW[CeL.zh_conversion.KEY_converter].add_conversions(file_path)
	</code>
	 * @alias add_conversion_group
	 */
	function add_conversions(/* const */conversion_group_options, options) {
		/** {Boolean}正在初始化。 */
		var is_initializing = this.conversions
		// assert: Array.isArray(this.conversions
		&& this.conversions.length < this.files.length;

		// insert at
		var sort_index = conversion_group_options.sort;
		// 警告: .add_conversions({sort:}) 必須配合 Converter.options @
		// CeL.zh_conversion！
		// assert: this.files[] 一一對應 this.conversions[]。
		if (sort_index && typeof sort_index === 'string') {
			// sort_name → sort_index
			this.files.some(function(__conversion_group_options, index) {
				if (__conversion_group_options.sort_name === sort_index
				// 只取第一個 single_conversion_options，
				|| Array.isArray(__conversion_group_options)
				//
				&& __conversion_group_options[0]
				// 當作 conversion_group_options.sort_name。
				&& __conversion_group_options[0].sort_name === sort_index) {
					library_namespace.debug('.sort_name ' + sort_index + '→'
							+ index + ': ' + __conversion_group_options, 1,
							'add_conversions');
					sort_index = index;
					return true;
				}
			});
		}
		if (sort_index >= 0) {
			if (!is_initializing) {
				// 將 conversion_group_options 插入 this.files[] 以確保與
				// this.conversions[] 一一對應。
				if (!Array.isArray(this.files[sort_index]))
					this.files[sort_index] = [ this.files[sort_index] ];
				this.files[sort_index].push(conversion_group_options);
			} else if (this.files[sort_index] !== conversion_group_options) {
				library_namespace
						.error('add_conversions: 初始化過程中設定了不相容的 sort_index: '
								+ sort_index + ' ('
								+ JSON.stringify(conversion_group_options)
								+ ')');
				throw new Error('add_conversions: 初始化過程中設定了不相容的 sort_index: '
						+ sort_index);
			}
		} else {
			if (sort_index !== undefined
					&& (sort_index >= 0 || typeof sort_index === 'string')) {
				library_namespace.error('add_conversions: sort not found: '
						+ sort_index);
			}
			if (!is_initializing) {
				this.files.push(conversion_group_options);
			}
		}

		// console.trace(this);
		if (!this.conversions) {
			library_namespace.debug('尚未執行 Converter_initialization()。'
					+ '將在 Converter_initialization() 一起載入。', 2,
					'add_conversions');
			// console.trace(conversion_group_options);
			return;
		}

		// --------------------------------------------------------------------
		// is_initializing || 為初始化完後的補充。

		// console.trace(conversion_group_options);

		var file_path_list = conversion_group_options;
		if (library_namespace.is_Object(file_path_list)) {
			if (!file_path_list.file_path) {
				library_namespace
						.error('add_conversions: Invalid file_path_list: '
								+ JSON.stringify(file_path_list));
				return;
			}

			file_path_list = file_path_list.file_path;
		}

		if (!Array.isArray(file_path_list))
			file_path_list = [ file_path_list ];
		// console.trace(file_path_list);

		/**
		 * 用於 new Convert_Pairs(null, convert_pairs_path_options); 或
		 * use_conversion.add_path(convert_pairs_path_options);
		 */
		var convert_pairs_path_options = {
			// 這邊不能先設定欲載入的 resources。
			// path : file_path_list,

			file_filter : this.file_filter,

			remove_comments : conversion_group_options.remove_comments,

			// no_the_same_key_value : !Array.isArray(file_path_list)
			// || file_path_list.length < 2,

			item_processor : default_item_processor,
			// 在 convert_text() 開始轉換之後就不會再修改辭典檔，因此可移除 .pair_Map。
			may_remove_pair_Map : !options
			// @see convert_text(text, options)
			|| !options.mode
		};

		var new_tailored_key_Set = new Set;
		new_tailored_key_Set.main_tailored_key = conversion_group_options.tailored_key
				// @see work_data.convert_options @
				// CeL.application.net.work_crawler.ebook
				|| conversion_group_options.work_title
		// || conversion_group_options.original_work_title
		;

		/**
		 * Build convert_pairs_path_options
		 * 
		 * @param {Object|String}single_conversion_options
		 *            single conversion configuration
		 * @returns
		 */
		function add_single_conversion(single_conversion_options) {
			if (typeof single_conversion_options === 'string') {
				// Treat single_conversion_options as file_path.
				return to_full_file_path(single_conversion_options);
			}

			// assert: library_namespace.is_Object(single_conversion_options)
			if (single_conversion_options.sort_name) {
				if (file_path_list.sort_name) {
					library_namespace
							.error('add_single_conversion: sort_name: '
									+ file_path_list.sort_name + '→'
									+ single_conversion_options.sort_name);
				}
				file_path_list.sort_name = single_conversion_options.sort_name;
			}

			// e.g., for .remove_comments
			if (!single_conversion_options.file_path
					&& !single_conversion_options.path
					&& single_conversion_options.file_name) {
				single_conversion_options = library_namespace
						.new_options(single_conversion_options);
				single_conversion_options.file_path
				//
				= to_full_file_path(single_conversion_options.file_name);
			}

			if (!single_conversion_options.file_path) {
				// e.g., {"sort_name":"主要繁簡轉換"}
				if (!single_conversion_options.sort_name
						|| Object.keys(single_conversion_options).length !== 1) {
					library_namespace
							.error('add_single_conversion: Invalid single_conversion_options: '
									+ JSON.stringify(single_conversion_options));
				}
				return;
			}

			// ------------------------------------------

			var tailored_key = single_conversion_options.tailored_key
					|| single_conversion_options.work_title
					// || single_conversion_options.original_work_title
					|| new_tailored_key_Set.main_tailored_key;

			if (tailored_key) {
				var tailored_conversion = this.tailored_conversions[tailored_key];
				if (!tailored_conversion) {
					// initialization an empty {Convert_Pairs}
					tailored_conversion = this.tailored_conversions[tailored_key] = new Convert_Pairs(
							null, convert_pairs_path_options);
					new_tailored_key_Set.add(tailored_key);
				}

				var tailored_single_conversion_options = single_conversion_options;
				single_conversion_options = library_namespace
						.new_options(single_conversion_options);
				/**
				 * 警告: 載入特設辭典後無法卸除! 必須在轉換文字時設定
				 * conversion_group_options.tailored_key 才能使用完整特設辭典。
				 * 
				 * 但就算沒設定
				 * conversion_group_options.tailored_key，依然會採用特設辭典中與一般性辭典(Converter.options)沒衝突的部分。
				 * 
				 * this.tailored_conversions 放置的只有衝突的部分。
				 */
				single_conversion_options.filter_existing_key_on_set = function(
						key, original_value, value) {
					var source = Object.create(null);
					source[key] = value;
					tailored_conversion.add(source,
							tailored_single_conversion_options);
					return false;
				};
			}

			// ------------------------------------------

			return single_conversion_options;
		}

		convert_pairs_path_options.path = file_path_list.map(
				add_single_conversion, this);
		// console.trace(convert_pairs_path_options);

		var use_conversion
		// assert: this.files[] 一一對應 this.conversions[]。
		// this.conversions && this.conversions.length >= this.files
		// this.conversions = [ {Convert_Pairs}, {Convert_Pairs}, ... ]
		= sort_index >= 0 && this.conversions[sort_index];

		if (use_conversion && use_conversion.pair_Map_by_length
				&& !use_conversion.pair_Map) {
			library_namespace.error('add_conversions: '
					+ '先前未保留 .pair_Map，忽略 .sort 設定! 這可能造成執行時錯誤!');
			// 問題在: this.files[] 一一對應 this.conversions[]
			use_conversion = null;
		}

		if (use_conversion) {
			use_conversion.add_path(convert_pairs_path_options);
		} else {
			use_conversion = new Convert_Pairs(null, convert_pairs_path_options);
			if (file_path_list.sort_name)
				use_conversion.sort_name = file_path_list.sort_name;

			// console.trace(this);
			// console.trace(use_conversion);
			// console.trace(use_conversion.pair_Map.size);

			// 確認有東西才加入此 conversion。
			if (use_conversion.pair_Map.size === 0) {
				library_namespace.warn('add_conversions: 空的轉換: '
						+ JSON.stringify(conversion_group_options));
			}

			// console.trace([ use_conversion.pair_Map.get('猜拳斗酒') ]);

			// 注意: 沒指定 conversion_group_options.sort
			// 時，預設會加在最後，其他轉換都完成後才會處理這些轉換。
			this.conversions.push(use_conversion);
		}

		new_tailored_key_Set.forEach(function(tailored_key) {
			var tailored_conversion = this.tailored_conversions[tailored_key];
			if (tailored_conversion.pair_Map.size === 0) {
				// 特設辭典無內容，或已全部納入一般辭典。
				delete this.tailored_conversions[tailored_key];
			} else {
				library_namespace.info('add_conversions: '
				//
				+ '特色辭典 [' + tailored_key + '] 與'
				//
				+ (use_conversion.sort_name ? ' ['
				//
				+ use_conversion.sort_name + '] ' : '主要轉換') + '辭典衝突的轉換詞:');
				tailored_conversion.pair_Map.forEach(function(value, key) {
					library_namespace.log(key + '→' + value);
				});
			}
		}, this);

		// 加入了新辭典，可能有新詞，需要重新計算 this.max_convert_word_length。
		delete this.max_convert_word_length;
	}

	// --------------------------------

	/** @inner */
	function Converter_initialization(options) {
		// console.trace(this.files);

		function corrections_item_processor(item, options) {
			var matched = item.match(/^-([^\t\n]{1,30})$/);
			if (!matched) {
				return item;
			}
			remove_key_hash[matched[1]] = options.path;
			return '';
		}

		// Will reset
		this.conversions = [];
		// 特設辭典對應集。
		this.tailored_conversions = Object.create(null);
		// @see add_conversions()
		this.files.forEach(function(conversion_group_options) {
			this.add_conversions(conversion_group_options, options);
		}, this);
		// assert: this.files[] 一一對應 this.conversions[]。

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
		options = library_namespace.setup_options(options);

		if (!this.conversions) {
			this.initialization(options);
		}

		// 事前轉換表。
		if (options.prefix_conversions) {
			text = (new Convert_Pairs(options.prefix_conversions, {
				flags : options.flags || REPLACE_FLAG
			})).convert(text);
		}

		var for_each_conversion;
		if (options.mode === 'word') {
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

		var use_conversions = this.conversions;
		// @see work_data.convert_options @
		// CeL.application.net.work_crawler.ebook
		// @see function convert_paragraph(paragraph, options) @
		// Chinese_converter.js
		[ 'tailored_key', 'work_title', 'original_work_title' ].some(function(
				key) {
			var tailored_key = options[key];
			var conversions = tailored_key
					&& this.tailored_conversions[tailored_key];
			if (conversions) {
				// 先處理衝突部分。
				use_conversions = [ conversions ].append(use_conversions);
				return true;
			}
		}, this);

		text = use_conversions.reduce(for_each_conversion
				|| function(_text, conversion) {
					return conversion.convert(_text, options);
				}, text);
		// console.trace(text);

		if (!(this.max_convert_word_length >= 0)) {
			// 計算 this.max_convert_word_length。
			// console.trace(this);
			var may_remove_pair_Map = this.may_remove_pair_Map;
			if (may_remove_pair_Map) {
				library_namespace.debug(
						'在 convert_text() 開始轉換之後就不會再修改辭典檔，因此可移除 .pair_Map。', 1,
						'Convert_Pairs__convert');
			}
			this.max_convert_word_length = this.conversions.reduce(function(
					length, conversion) {
				if (may_remove_pair_Map)
					delete conversion.pair_Map;
				return Math.max(length, conversion.pair_Map_by_length.length);
			}, 0);
			// console.trace(this);
			if (this['interface'])
				this['interface'].max_convert_word_length = this.max_convert_word_length;
		}

		// 事後轉換表。
		if (options.postfix_conversions) {
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
		file : convert_file,
		add_conversions : add_conversions
	});

	Converter.options = {
		CN_to_TW : {
			// 事前事後轉換表須事先設定。
			// 不可以 Object.assign(CeL.CN_to_TW.prefix_conversions = {}, {})
			// 來新增事前轉換表。
			// prefix_conversions : {},
			// postfix_conversions : {},

			files : [ [ {
				sort_name : '主要繁簡轉換'
			}, 'STPhrases', 'STCharacters',
			// 以 generate_additional_table.js 合併新同文堂和 ConvertZZ 的辭典檔。
			'additional.to_TW.auto-generated',
			// 後來的會覆蓋前面的。
			{
				file_name : 'additional.to_TW',
				remove_comments : true
			} ],
			// ------------------------------------------------------
			// ** 下面的是上面詞彙與單字轉換後的再轉換。
			[ {
				sort_name : '再轉換'
			}, 'TWPhrasesIT',
			// ↑ TWPhrasesIT.txt 有許多常用詞彙，在 corrections_to_TW.txt 取消。
			'TWPhrasesName', 'TWPhrasesOther',
			// 若要篩選或增減 conversion files，可參考範例：
			// start_downloading() @ CeL.application.net.work_crawler.task
			{
				file_name : 'additional.to_TW.phrases',
				remove_comments : true
			} ],
			// https://github.com/BYVoid/OpenCC/blob/master/data/config/s2twp.json
			[ {
				sort_name : '變體字'
			}, 'TWVariants' ] ],
			// 手動修正表
			corrections : 'corrections_to_TW.txt'
		},
		TW_to_CN : {
			// 事前事後轉換表須事先設定。
			// prefix_conversions : {},
			// postfix_conversions : {},

			// https://github.com/BYVoid/OpenCC/blob/master/data/config/tw2s.json
			// https://github.com/BYVoid/OpenCC/blob/master/node/dicts.gypi
			files : [ 'TWVariantsRevPhrases', [ {
				sort_name : '主要繁簡轉換'
			}, 'TSPhrases', 'TSCharacters',
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

	var KEY_converter = typeof Symbol === 'function' ? Symbol('KEY_converter')
			: 'KEY converter';
	_.KEY_converter = KEY_converter;
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
		// method to get the original converter.
		converter_interface[KEY_converter] = converter;
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
