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
	CeL.run('extension.zh_conversion',function () {
		// 事前事後轉換表須事先設定。
		//CeL.CN_to_TW.pre = {};
		//CeL.CN_to_TW.post = {};
		var text = CeL.CN_to_TW('简体中文文字');
		CeL.CN_to_TW.file('from.htm', 'to.htm', 'utf-8');
	});

 </code>
 * @see https://github.com/BYVoid/OpenCC https://zhconvert.org/
 * @since 2014/6/17 22:39:16
 */

'use strict';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'extension.zh_conversion',

	require : 'data.pair|application.OS.Windows.file.',

	// 設定不匯出的子函式。
	// no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {
	// requiring
	var pair = this.r('pair');

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
	var REPLACE_FLAG = 'gi',
	// using BYVoid / OpenCC 開放中文轉換 (Open Chinese Convert) table.
	// https://github.com/BYVoid/OpenCC/tree/master/data/dictionary
	dictionary_base = library_namespace.get_module_path(this.id, 'OpenCC'
			+ library_namespace.env.path_separator);
	// console.log('dictionary_base: ' + dictionary_base);

	function CN_to_TW(text, options) {
		if (!CN_to_TW.conversions) {
			CN_to_TW.initialization();
		}

		// 事前轉換表。
		if (options && options.pre)
			text = (new pair(options.pre, {
				flag : options.flag || REPLACE_FLAG
			})).convert(text);

		CN_to_TW.conversions.forEach(function(conversion) {
			text = conversion.convert(text);
		});

		// 事後轉換表。
		if (options && options.post)
			text = (new pair(options.post, {
				flag : options.flag || REPLACE_FLAG
			})).convert(text);

		return text;
	}

	CN_to_TW.files = 'STPhrases,STCharacters,TWPhrasesName,TWPhrasesIT'
	// 因此得要一個個 replace。
	+ ',TWPhrasesOther,TWVariants,TWVariantsRevPhrases';

	// 若要篩選或增減 conversion files，可參考範例：
	// start_downloading() @ CeL.application.net.work_crawler.task
	CN_to_TW.files = CN_to_TW.files.split(',');

	CN_to_TW.initialization = function() {
		CN_to_TW.conversions = CN_to_TW.files.map(function(file_name, index) {
			// 載入 resource。
			return new pair(null, {
				path : dictionary_base + file_name + '.txt',
				item_processor : function(item) {
					return item.replace(/ .+$/, '');
				}
			});
		});

		// keys_to_remove
		var remove_keys = Object.create(null);
		// 手動修正表。
		CN_to_TW.conversions.push(new pair(null, {
			path : dictionary_base
					.replace(/[^\\\/]+[\\\/]$/, 'corrections.txt'),
			item_processor : function(item) {
				var matched = item.match(/^-([^\t\n]{1,30})$/);
				if (!matched) {
					return item;
				}
				remove_keys[matched[1]] = true;
				return '';
			},
			remove_comments : true
		}));

		if (!library_namespace.is_empty_object(remove_keys)) {
			remove_keys = Object.keys(remove_keys);
			CN_to_TW.conversions.forEach(function(conversion) {
				if (false && conversion.pair.皮膚) {
					console.log(conversion);
					throw conversion.pair.皮膚;
				}
				conversion.remove(keys);
			});
		}

		// 設定事前轉換表。
		if (CN_to_TW.pre) {
			CN_to_TW.conversions.unshift(new pair(CN_to_TW.pre, {
				flag : CN_to_TW.flag || REPLACE_FLAG
			}));
		}

		// 設定事後轉換表。
		if (CN_to_TW.post) {
			CN_to_TW.conversions.push(new pair(CN_to_TW.post, {
				flag : CN_to_TW.flag || REPLACE_FLAG
			}));
		}
	};

	CN_to_TW.file = function(from, to, target_encoding) {
		var text = library_namespace.get_file(from);
		text = CN_to_TW(text);
		library_namespace.write_file(to, text, target_encoding);
	};

	// 事前事後轉換表須事先設定。
	// 可以 Object.assign(CeL.CN_to_TW.pre = {}, {}) 來新增事前轉換表。
	// CN_to_TW.pre = {};
	// CN_to_TW.post = {};

	// CN_to_TW.conversions: 提供自行更改的功能。

	// ------------------------------------------------------------------------

	var opencc_s2t;

	function CN_to_TW_opencc(text, options) {
		// Sync API
		return opencc_s2t.convertSync(text);
	}

	// ------------------------------------------------------------------------
	// export

	try {
		var OpenCC = require('opencc');
		// Load the default Simplified to Traditional config
		opencc_s2t = new OpenCC('s2t.json');
		_.CN_to_TW = CN_to_TW_opencc;
	} catch (e) {
		_.CN_to_TW = CN_to_TW;
	}

	return (_// JSDT:_module_
	);

}
