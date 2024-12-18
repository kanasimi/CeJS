/**
 * @name CeL function for MediaWiki (Wikipedia / 維基百科): wikidata
 * 
 * @fileoverview 本檔案包含了 MediaWiki 自動化作業用程式庫的子程式庫。
 * 
 * TODO:<code>

https://www.wikidata.org/wiki/Help:QuickStatements

</code>
 * 
 * @since 2019/10/11 拆分自 CeL.application.net.wiki
 * 
 * @see https://github.com/maxlath/wikibase-sdk
 *      https://github.com/OpenRefine/OpenRefine/wiki/Reconciliation
 */

// More examples: see /_test suite/test.js
// Wikipedia bots demo: https://github.com/kanasimi/wikibot
'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.wiki.data',

	require : 'data.native.|data.date.' + '|application.net.wiki.'
	// load MediaWiki module basic functions
	+ '|application.net.wiki.namespace.'
	//
	+ '|application.net.wiki.query.|application.net.wiki.page.'
	// wiki_API.edit.check_data()
	+ '|application.net.wiki.edit.'
	// wiki_API.parse.redirect()
	+ '|application.net.wiki.parser.'
	//
	+ '|application.net.Ajax.get_URL',

	// 設定不匯出的子函式。
	no_extend : 'this,*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring
	var wiki_API = library_namespace.application.net.wiki, KEY_SESSION = wiki_API.KEY_SESSION, KEY_HOST_SESSION = wiki_API.KEY_HOST_SESSION;
	// @inner
	var API_URL_of_options = wiki_API.API_URL_of_options, is_api_and_title = wiki_API.is_api_and_title, is_wikidata_site_nomenclature = wiki_API.is_wikidata_site_nomenclature, language_code_to_site_alias = wiki_API.language_code_to_site_alias;
	var KEY_CORRESPOND_PAGE = wiki_API.KEY_CORRESPOND_PAGE, PATTERN_PROJECT_CODE_i = wiki_API.PATTERN_PROJECT_CODE_i;

	var get_URL = this.r('get_URL');

	var
	/** {Number}未發現之index。 const: 基本上與程式碼設計合一，僅表示名義，不可更改。(=== -1) */
	NOT_FOUND = ''.indexOf('_');

	var gettext = library_namespace.cache_gettext(function(_) {
		gettext = _;
	});

	// ------------------------------------------------------------------------

	// 用來取得 entity value 之屬性名。 函數 : wikidata_entity_value
	// 為了方便使用，不採用 Symbol()。
	var KEY_get_entity_value = 'value';

	// ------------------------------------------------------------------------

	// 客製化的設定。
	// wikidata_site_alias[site code] = Wikidata site code
	// @see https://www.wikidata.org/w/api.php?action=help&modules=wbeditentity
	// for sites
	var wikidata_site_alias = {
		// 為粵文維基百科特別處理。
		yuewiki : 'zh_yuewiki',

		// 為日文特別修正: 'jp' is wrong!
		jpwiki : 'jawiki'
	};

	function get_data_API_URL(options, default_API_URL) {
		// library_namespace.debug('options:', 0, 'get_data_API_URL');
		// console.trace(options);

		var API_URL = options && options.data_API_URL, session;

		if (API_URL) {
		} else if (wiki_API.is_wiki_API(
		//
		session = wiki_API.session_of_options(options))) {
			if (session.data_session) {
				API_URL = session.data_session.API_URL;
			}
			if (!API_URL && session[KEY_HOST_SESSION]) {
				// is data session. e.g., https://test.wikidata.org/w/api.php
				API_URL = session.API_URL;
			}
			if (!API_URL) {
				// e.g., lingualibre
				API_URL = session.data_API_URL;
			}
		} else {
			API_URL = API_URL_of_options(options);
		}

		if (!API_URL) {
			API_URL = default_API_URL || wikidata_API_URL;
		}

		library_namespace.debug('API_URL: ' + API_URL, 3, 'get_data_API_URL');
		return API_URL;
	}

	// --------------------------------------------------------------------------------------------
	// Wikidata 操作函數
	// https://www.wikidata.org/wiki/Wikidata:Data_access

	/**
	 * @see <code>

	// https://meta.wikimedia.org/wiki/Wikidata/Notes/Inclusion_syntax
	{{label}}, {{Q}}, [[d:Q1]]

	http://wdq.wmflabs.org/api_documentation.html
	https://github.com/maxlath/wikidata-sdk

	</code>
	 * 
	 * @since
	 */

	/**
	 * 測試 value 是否為實體項目 wikidata entity / wikibase-item.
	 * 
	 * is_wikidata_page()
	 * 
	 * @param value
	 *            value to test. 要測試的值。
	 * @param {Boolean}[strict]
	 *            嚴格檢測。
	 * 
	 * @returns {Boolean}value 為實體項目。
	 */
	function is_entity(value, strict) {
		return library_namespace.is_Object(value)
		// {String}id: Q\d+ 或 P\d+。
		&& (strict ? /^[PQ]\d{1,10}$/.test(value.id) : value.id)
		//
		&& library_namespace.is_Object(value.labels);
	}

	/**
	 * API URL of wikidata.<br />
	 * e.g., 'https://www.wikidata.org/w/api.php',
	 * 'https://test.wikidata.org/w/api.php'
	 * 
	 * @type {String}
	 */
	var wikidata_API_URL = wiki_API.api_URL('wikidata');

	/**
	 * Combine ((session)) with Wikidata. 立即性(asynchronous)設定 this.data_session。
	 * 
	 * @param {wiki_API}session
	 *            正作業中之 wiki_API instance。
	 * @param {Function}[callback]
	 *            回調函數。 callback({Array}entity list or {Object}entity or
	 * @param {String}[API_URL]
	 *            language code or API URL of Wikidata
	 * @param {String}[password]
	 *            user password
	 * @param {Boolean}[force]
	 *            無論如何重新設定 this.data_session。
	 * 
	 * @inner
	 */
	function setup_data_session(session, callback, API_URL, password, force) {
		if (force === undefined) {
			if (typeof password === 'boolean') {
				// shift arguments.
				force = password;
				password = null;
			} else if (typeof API_URL === 'boolean' && password === undefined) {
				// shift arguments.
				force = API_URL;
				API_URL = null;
			}
		}

		if (session.data_session && API_URL & !force) {
			return;
		}

		if (session.data_session) {
			library_namespace.debug('直接清空佇列。', 2, 'setup_data_session');
			// TODO: 強制中斷所有正在執行之任務。
			session.data_session.actions.clear();
		}

		if (!API_URL
		// https://test.wikipedia.org/w/api.php
		// https://test2.wikipedia.org/w/api.php
		&& /test\d?\.wikipedia/.test(session.API_URL)) {
			API_URL = 'test.wikidata';

		} else if (typeof API_URL === 'string' && !/wikidata/i.test(API_URL)
				&& !PATTERN_PROJECT_CODE_i.test(API_URL)) {
			// e.g., 'test' → 'test.wikidata'
			API_URL += '.wikidata';
		}

		// data_configuration: set Wikidata session
		var data_login_options = {
			user_name : session.token.lgname,
			// wiki.set_data(host session, password)
			password : password || session.token.lgpassword,
			// API_URL: host session
			API_URL : typeof API_URL === 'string' && wiki_API.api_URL(API_URL)
					|| get_data_API_URL(session),
			preserve_password : session.preserve_password
		};
		// console.trace([ data_login_options, session.API_URL ]);
		if (false && data_login_options.API_URL === session.API_URL) {
			// TODO: test
			// e.g., lingualibre
			library_namespace.debug('設定 session 的 data_session 即為本身。', 2,
					'setup_data_session');
			session.data_session = session;
		} else if (data_login_options.user_name && data_login_options.password) {
			session.data_session = wiki_API.login(data_login_options);
		} else {
			// 警告: 可能需要設定 options.is_running
			session.data_session = new wiki_API(data_login_options);
		}

		library_namespace.debug('Setup 宿主 host session.', 2,
				'setup_data_session');
		session.data_session[KEY_HOST_SESSION] = session;
		library_namespace.debug('run callback: ' + callback, 2,
				'setup_data_session');
		session.data_session.run(callback);
	}

	// ------------------------------------------------------------------------

	function normalize_wikidata_key(key) {
		if (typeof key !== 'string') {
			library_namespace.error('normalize_wikidata_key: key: '
					+ JSON.stringify(key));
			// console.trace(key);
			throw new Error('normalize_wikidata_key: key should be string!');
		}
		return key.replace(/_/g, ' ').trim();
	}

	/**
	 * 搜索標籤包含特定關鍵字(label=key)的項目。
	 * 
	 * 此搜索有極大問題:不能自動偵測與轉換中文繁簡體。 或須轉成英語再行搜尋。
	 * 
	 * @example<code>

	CeL.wiki.data.search('宇宙', function(entity) {result=entity;console.log(entity[0]==='Q1');}, {get_id:true});
	CeL.wiki.data.search('宇宙', function(entity) {result=entity;console.log(entity==='Q1');}, {get_id:true, limit:1});
	CeL.wiki.data.search('形狀', function(entity) {result=entity;console.log(entity==='P1419');}, {get_id:true, type:'property'});

	</code>
	 * 
	 * @param {String}key
	 *            要搜尋的關鍵字。item/property title.
	 * @param {Function}[callback]
	 *            回調函數。 callback({Array}entity list or {Object}entity or
	 *            {String}entity id, error)
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 */
	function wikidata_search(key, callback, options) {
		if (!key) {
			callback(undefined, 'wikidata_search: No key assigned.');
			return;
		}
		if (typeof options === 'function')
			options = {
				filter : options
			};
		else if (typeof options === 'string') {
			options = {
				language : options
			};
		} else {
			// 正規化並提供可隨意改變的同內容參數，以避免修改或覆蓋附加參數。
			options = library_namespace.new_options(options);
		}

		var language = options.language;
		var type = options.type;
		// console.trace([ key, is_api_and_title(key, 'language') ]);
		if (is_api_and_title(key, 'language')) {
			if (is_wikidata_site_nomenclature(key[0])) {
				wikidata_entity(key, function(entity, error) {
					// console.log(entity);
					var id = !error && entity && entity.id;
					// 預設找不到 sitelink 會作搜尋。
					if (!id && !options.no_search) {
						key = key.clone();
						if (key[0] = key[0].replace(/wiki.*$/, '')) {
							wikidata_search(key, callback, options);
							return;
						}
					}
					callback(id, error);
				}, {
					props : ''
				});
				return;
			}
			// for [ {String}language, {String}key ].type
			if (key.type)
				type = key.type;
			language = key[0];
			key = key[1];
		}

		// console.log('key: ' + key);
		key = normalize_wikidata_key(key);
		language = language || wiki_API.site_name(options, {
			get_all_properties : true
		}).language;

		var action = {
			action : 'wbsearchentities',
			// search. e.g.,
			// https://www.wikidata.org/w/api.php?action=wbsearchentities&search=abc&language=en&utf8=1
			search : key,
			// https://www.wikidata.org/w/api.php?action=help&modules=wbsearchentities
			language : language
		};

		if (options.limit || wikidata_search.default_limit) {
			action.limit = options.limit || wikidata_search.default_limit;
		}

		if (type) {
			// item|property
			// 預設值：item
			action.type = type;
		}

		if (options['continue'] > 0)
			action['continue'] = options['continue'];

		action = [ API_URL_of_options(options) || wikidata_API_URL, action ];

		wiki_API.query(action, function handle_result(data, error) {
			error = wiki_API.query.handle_error(data, error);
			// 檢查伺服器回應是否有錯誤資訊。
			if (error) {
				library_namespace.error('wikidata_search: ' + error);
				callback(data, error);
				return;
			}

			/**
			 * e.g., <code>
			{"searchinfo":{"search":"Universe"},"search":[{"id":"Q1","title":"Q1","pageid":129,"repository":"wikidata","url":"//www.wikidata.org/wiki/Q1","concepturi":"http://www.wikidata.org/entity/Q1","label":"universe","description":"totality consisting of space, time, matter and energy","match":{"type":"label","language":"en","text":"universe"}}],"search-continue":1,"success":1}
			</code>
			 */
			// console.trace(data);
			// console.trace(data.search);
			var list;
			if (!Array.isArray(data.search)) {
				list = [];
			} else if (!('filter' in options)
					|| typeof options.filter === 'function') {
				list = data.search.filter(options.filter ||
				// default filter
				function(item) {
					// 自此結果能得到的資訊有限。
					// label: 'Universe'
					// match: { type: 'label', language: 'zh', text: '宇宙' }
					if (item.match && key.toLowerCase()
					// .trim()
					=== item.match.text.toLowerCase()
					// 通常不會希望取得維基百科消歧義頁。
					// @see 'Wikimedia disambiguation page' @
					// [[d:MediaWiki:Gadget-autoEdit.js]]
					&& !/disambiguation|消歧義|消歧義|曖昧さ回避/.test(item.description)) {
						return true;
					}
				});
			}

			if (Array.isArray(options.list)) {
				options.list.push(list);
			} else {
				options.list = [ list ];
			}
			list = options.list;

			if (!options.limit && data['search-continue'] > 0) {
				options['continue'] = data['search-continue'];
				wikidata_search(key, callback, options);
				return;
			}

			if (Array.isArray(list.length) && list.length > 1) {
				// clone list
				list = list.clone();
			} else {
				list = list[0];
			}
			if (options.get_id) {
				list = list.map(function(item) {
					return item.id;
				});
			}
			// multiple pages
			if (!options.multi && (
			// options.limit <= 1
			list.length <= 1)) {
				list = list[0];
			}
			// console.trace(options);
			callback(list);
		}, null, options);
	}

	// wikidata_search_cache[{String}"zh:隸屬於"] = {String}"P31";
	var wikidata_search_cache = {
	// 載於, 出典, source of claim
	// 'en:stated in' : 'P248',
	// 導入自, source
	// 'en:imported from Wikimedia project' : 'P143',
	// 來源網址, website
	// 'en:reference URL' : 'P854',
	// 檢索日期
	// 'en:retrieved' : 'P813'
	},
	// entity (Q\d+) 用。
	// 可考量加入 .type (item|property) 為 key 的一部分，
	// 或改成 wikidata_search_cache={item:{},property:{}}。
	wikidata_search_cache_entity = Object.create(null);

	// wikidata_search.default_limit = 'max';

	// TODO: add more types: form, item, lexeme, property, sense, sense
	// https://www.wikidata.org/w/api.php?action=help&modules=wbsearchentities
	wikidata_search.add_cache = function add_cache(key, id, language, is_entity) {
		var cached_hash = is_entity ? wikidata_search_cache_entity
				: wikidata_search_cache;
		language = wiki_API.site_name(language, {
			get_all_properties : true
		}).language;
		cached_hash[language + ':' + key] = id;
	};

	// wrapper function of wikidata_search().
	wikidata_search.use_cache = function use_cache(key, callback, options) {
		if (!options && library_namespace.is_Object(callback)) {
			// shift arguments.
			options = callback;
			callback = undefined;
		}
		// console.trace(options);
		if (options && options.must_callback && !callback) {
			library_namespace.warn('設定 options.must_callback，卻無 callback!');
		}

		var language_and_key,
		// 須與 wikidata_search() 相同!
		// TODO: 可以 guess_language(key) 猜測語言。
		language = options && options.language || wiki_API.site_name(options, {
			get_all_properties : true
		}).language,
		// https://www.wikidata.org/w/api.php?action=help&modules=wbsearchentities
		cached_hash = options && options.type && options.type !==
		// default_options.type: 'property'
		wikidata_search.use_cache.default_options.type ? wikidata_search_cache_entity
				: wikidata_search_cache;
		// console.trace([ key, language, options ]);

		key = normalize_value_of_properties(key, language);
		var entity_type = key && key.type;

		if (typeof key === 'string') {
			key = normalize_wikidata_key(key);
			language_and_key = language + ':' + key;

		} else if (Array.isArray(key)) {
			// console.trace(key);
			if (is_api_and_title(key, 'language')) {
				// key.join(':')
				language_and_key = key[0] + ':'
				//
				+ normalize_wikidata_key(key[1]);
			} else {
				// 處理取得多 keys 之 id 的情況。
				var index = 0,
				//
				cache_next_key = function() {
					library_namespace.debug(index + '/' + key.length, 3,
							'use_cache.cache_next_key');
					if (index === key.length) {
						// done. callback(id_list)
						var id_list = key.map(function(k) {
							if (is_api_and_title(k, 'language')) {
								return cached_hash[k[0] + ':'
								//
								+ normalize_wikidata_key(k[1])];
							}
							k = normalize_wikidata_key(k);
							return cached_hash[language + ':' + k];
						});
						// console.trace(id_list);
						callback(id_list);
						return;
					}
					// console.trace(options);
					wikidata_search.use_cache(key[index++], cache_next_key,
					//
					Object.assign({
						API_URL : get_data_API_URL(options)
					}, wikidata_search.use_cache.default_options, {
						// 警告: 若是設定 must_callback=false，會造成程序不 callback 而中途跳出!
						must_callback : true
					}, options));
				};
				cache_next_key();
				return;
			}

		} else {
			// 避免若是未match is_api_and_title(key, 'language')，
			// 可能導致 infinite loop!
			key = 'wikidata_search.use_cache: Invalid key: [' + key + ']';
			// console.warn(key);
			callback(undefined, key);
			return;
		}
		library_namespace.debug('search '
				+ (language_and_key || JSON.stringify(key)) + ' ('
				+ is_api_and_title(key, 'language') + ')', 4,
				'wikidata_search.use_cache');

		if ((!options || !options.force)
		// TODO: key 可能是 [ language code, labels|aliases ] 之類。
		// &&language_and_key
		&& (language_and_key in cached_hash)) {
			library_namespace.debug('has cache: [' + language_and_key + '] → '
					+ cached_hash[language_and_key], 4,
					'wikidata_search.use_cache');
			key = cached_hash[language_and_key];

			if (/^[PQ]\d{1,10}$/.test(key)) {
			}
			if (options && options.must_callback) {
				callback(key);
				return;
			} else {
				// 只在有 cache 時才即刻回傳。
				return key;
			}
		}

		if (!options || library_namespace.is_empty_object(options)) {
			options = Object.clone(wikidata_search.use_cache.default_options);
		} else if (!options.get_id) {
			if (!options.must_callback) {
				// 在僅設定 .must_callback 時，不顯示警告而自動補上應有的設定。
				library_namespace.warn('wikidata_search.use_cache: 當把實體名稱 ['
						+ language_and_key
						+ '] 轉換成 id 時，應設定 options.get_id。 options: '
						+ JSON.stringify(options));
			}
			options = Object.assign({
				get_id : true
			}, options);
		} else if (entity_type) {
			options = Object.clone(options);
		}

		if (entity_type)
			options.type = entity_type;

		// console.log(arguments);
		wikidata_search(key, function(id, error) {
			// console.log(language_and_key + ': ' + id);
			// console.trace(options.search_without_cache);
			if (!id) {
				library_namespace
						.error('wikidata_search.use_cache: Nothing found: ['
								+ language_and_key + ']');
				// console.log(options);
				// console.trace('wikidata_search.use_cache: Nothing found');

			} else if (!options.search_without_cache && typeof id === 'string'
					&& /^[PQ]\d{1,10}$/.test(id)) {
				library_namespace.info('wikidata_search.use_cache: cache '
				// 搜尋此類型的實體。 預設值：item
				+ (options && options.type || 'item')
				//
				+ ' [' + language_and_key + '] → ' + id);
			}
			if (!options.search_without_cache) {
				// 即使有錯誤，依然做 cache 紀錄，避免重複偵測操作。
				cached_hash[language_and_key] = id;
			}
			// console.trace([ language_and_key, id ]);

			// console.trace('' + callback);
			if (callback)
				callback(id, error);
		}, options);
	};

	// default options passed to wikidata_search()
	wikidata_search.use_cache.default_options = {
		// 若有必要用上 options.API_URL，應在個別操作內設定。

		// 通常 property 才值得使用 cache。
		// entity 可採用 'item'
		// https://www.wikidata.org/w/api.php?action=help&modules=wbsearchentities
		type : 'property',
		// limit : 1,
		get_id : true
	};

	// ------------------------------------------------------------------------

	/**
	 * {Array}時間精度(精密度)單位。
	 * 
	 * 注意：須配合 index_precision @ CeL.data.date！
	 * 
	 * @see https://doc.wikimedia.org/Wikibase/master/php/md_docs_topics_json.html#json_datavalues_time
	 */
	var time_unit = 'gigayear,100 megayear,10 megayear,megayear,100 kiloyear,10 kiloyear,millennium,century,decade,year,month,day,hour,minute,second,microsecond'
			.split(','),
	// 精密度至日: 11。
	INDEX_OF_PRECISION = time_unit.to_hash();
	// 千紀: 一千年, https://en.wikipedia.org/wiki/Kyr
	time_unit.zh = '十億年,億年,千萬年,百萬年,十萬年,萬年,千紀,世紀,年代,年,月,日,時,分,秒,毫秒,微秒,納秒'
			.split(',');

	/**
	 * 將時間轉為字串。
	 * 
	 * @inner
	 */
	function time_toString() {
		var unit = this.unit;
		if (this.power) {
			unit = Math.abs(this[0]) + unit[0];
			return this.power > 1e4 ? unit + (this[0] < 0 ? '前' : '後')
			//
			: (this[0] < 0 ? '前' : '') + unit;
		}

		return this.map(function(value, index) {
			return value + unit[index];
		}).join('');
	}

	/**
	 * 將經緯度座標轉為字串。
	 * 
	 * @inner
	 */
	function coordinate_toString(type) {
		// 經緯度座標 coordinates [ latitude 緯度, longitude 經度 ]
		return Marh.abs(this[0]) + ' ' + (this[0] < 0 ? 'S' : 'N')
		//
		+ ', ' + Marh.abs(this[1]) + ' ' + (this[1] < 0 ? 'W' : 'E');
	}

	// https://www.wikidata.org/wiki/Help:Statements
	// https://www.mediawiki.org/wiki/Wikibase/DataModel#Statements
	// statement = claim + rank + references
	// claim = snak + qualifiers
	// snak: data type + value

	/**
	 * 將特定的屬性值轉為 JavaScript 的物件。
	 * 
	 * @param {Object}data
	 *            從Wikidata所得到的屬性值。
	 * @param {Function}[callback]
	 *            回調函數。 callback(轉成JavaScript的值)
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @returns 轉成JavaScript的值。
	 * 
	 * @see https://www.mediawiki.org/wiki/Wikibase/API#wbformatvalue
	 *      https://www.mediawiki.org/wiki/Wikibase/DataModel/JSON#Claims_and_Statements
	 *      https://www.mediawiki.org/wiki/Wikibase/API
	 *      https://www.mediawiki.org/wiki/Wikibase/Indexing/RDF_Dump_Format#Value_representation
	 *      https://www.wikidata.org/wiki/Special:ListDatatypes
	 */
	function wikidata_datavalue(data, callback, options) {
		// console.log(data);
		// console.log(JSON.stringify(data));
		if (library_namespace.is_Object(callback) && !options) {
			// shift arguments.
			options = callback;
			callback = undefined;
		}

		// 正規化並提供可隨意改變的同內容參數，以避免修改或覆蓋附加參數。
		options = library_namespace.new_options(options);

		callback = typeof callback === 'function' && callback;

		var value = options.multi && !Array.isArray(data) ? [ data ] : data;

		if (Array.isArray(value)) {
			if (!options.single) {
				if (options.multi) {
					delete options.multi;
				}
				// TODO: array + ('numeric-id' in value)
				// TODO: using Promise.allSettled([])
				if (callback) {
					// console.log(value);
					value.run_parallel(function(run_next, item, index) {
						// console.log([ index, item ]);
						wikidata_datavalue(item, function(v, error) {
							// console.log([ index, v ]);
							value[index] = v;
							run_next();
						}, options);
					}, function() {
						callback(value);
					});
				}
				return value.map(function(v) {
					return wikidata_datavalue(v, undefined, options);
				});
			}

			// 選擇推薦值/最佳等級。
			var first;
			if (value.every(function(v) {
				if (!v) {
					return true;
				}
				if (v.rank !== 'preferred') {
					if (!first) {
						first = v;
					}
					return true;
				}
				// TODO: check v.mainsnak.datavalue.value.language
				value = v;
				// return false;
			})) {
				// 沒有推薦值，選擇首個非空的值。
				value = first;
			}
		}

		if (is_entity(value)) {
			// get label of entity
			value = value.labels;
			var language = wiki_API.site_name(options, {
				get_all_properties : true
			}).language;
			language = language && value[language] || value[wiki_API.language]
			// 最起碼選個國際通用的。
			|| value.en;
			if (!language) {
				// 隨便挑一個語言的 label。
				for (language in value) {
					value = value[language];
					break;
				}
			}
			return value.value;
		}

		if (!value || typeof value !== 'object') {
			callback && callback(value);
			return value;
		}

		// TODO: value.qualifiers, value['qualifiers-order']
		// TODO: value.references
		value = value.mainsnak || value;
		if (value) {
			// console.log(value);
			// console.log(JSON.stringify(value));

			// 與 normalize_wikidata_value() 須同步!
			if (value.snaktype === 'novalue') {
				value = null;
				callback && callback(value);
				return value;
			}
			if (value.snaktype === 'somevalue') {
				// e.g., [[Q1]], Property:P1419 形狀
				// Property:P805 主條目
				if (callback && data.qualifiers
						&& Array.isArray(value = data.qualifiers.P805)) {
					if (value.length === 1) {
						value = value[0];
					}
					delete options[library_namespace.new_options.new_key];
					// console.log(value);
					wikidata_datavalue(value, callback, options);
					return;
				}
				value = wikidata_edit.somevalue;
				callback && callback(value);
				return value;
			}
		}
		// assert: value.snaktype === 'value'
		value = value.datavalue || value;

		var type = value.type;
		// TODO: type 可能為 undefined!

		if ('value' in value) {
			if (type === 'literal'
			// e.g., SPARQL: get ?linkcount of:
			// ?item wikibase:sitelinks ?linkcount
			&& value.datatype === 'http://www.w3.org/2001/XMLSchema#integer') {
				// assert: typeof value.value === 'string'
				// Math.floor()
				value = +value.value;
			} else {
				value = value.value;
			}
		}

		if (typeof value !== 'object') {
			// e.g., typeof value === 'string'
			callback && callback(value);
			return value;
		}

		if ('text' in value) {
			// e.g., { text: 'Ὅμηρος', language: 'grc' }
			value = value.text;
			callback && callback(value);
			return value;
		}

		if ('amount' in value) {
			// qualifiers 純量數值
			value = +value.amount;
			callback && callback(value);
			return value;
		}

		if ('latitude' in value) {
			// 經緯度座標 coordinates [ latitude 緯度, longitude 經度 ]
			var coordinate = [ value.latitude, value.longitude ];
			if (false) {
				// geodetic reference system, 大地座標系/坐標系統測量基準
				var system = value.globe.match(/[^\\\/]+$/);
				system = system && system[0];
				switch (system) {
				case 'Q2':
					coordinate.system = 'Earth';
					break;
				case 'Q11902211':
					coordinate.system = 'WGS84';
					break;
				case 'Q215848':
					coordinate.system = 'WGS';
					break;
				case 'Q1378064':
					coordinate.system = 'ED50';
					break;
				default:
					if (system)
						coordinate.system = system;
					else
						// invalid data?
						;
				}
			}
			// TODO: precision
			coordinate.precision = value.precision;
			coordinate.toString = coordinate_toString;
			value = coordinate;
			callback && callback(value);
			return value;
		}

		if ('time' in value) {
			// date & time. 時間日期
			var matched, year, precision = value.precision;
			// console.trace([ value, precision ]);

			if (precision <= INDEX_OF_PRECISION.year) {
				// 時間尺度為1年以上
				matched = value.time.match(/^[+\-]\d+/);
				year = +matched[0];
				var power = Math.pow(10, INDEX_OF_PRECISION.year - precision);
				matched = [ year / power | 0 ];
				matched.unit = [ time_unit.zh[precision] ];
				matched.power = power;

			} else {
				// 時間尺度為不到一年
				matched = value.time.match(
				// [ all, Y, m, d, H, M, S ]
				/^([+\-]\d+)-(\d+)-(\d+)T(\d+):(\d+):(\d+)Z$/);
				matched = matched.slice(1, precision -
				// +1: is length, not index
				// +1: year starts from 1.
				INDEX_OF_PRECISION.year + 1 + 1).map(function(value) {
					return +value;
				});
				year = matched[0];
				matched.unit = time_unit.zh.slice(INDEX_OF_PRECISION.year,
						precision + 1);
			}

			// proleptic Gregorian calendar:
			// http://www.wikidata.org/entity/Q1985727
			// proleptic Julian calendar:
			// http://www.wikidata.org/entity/Q1985786
			var type = value.calendarmodel.match(/[^\\\/]+$/);
			if (type && type[0] === 'Q1985786') {
				matched.Julian = true;
				// matched.type = 'Julian';
			} else if (type && type === 'Q1985727') {
				// matched.type = 'Gregorian';
			} else {
				// matched.type = type || value.calendarmodel;
			}

			var Julian_day;
			if (year >= -4716
			//
			&& (Julian_day = library_namespace.Julian_day)) {
				// start JDN
				matched.JD = Julian_day.from_YMD(year, matched[1], matched[2],
						!matched.Julian);
			}
			matched.toString = time_toString;
			// console.trace([ matched, value, precision ]);
			callback && callback(matched);
			return matched;
		}

		if ('numeric-id' in value) {
			// wikidata entity. 實體
			value = 'Q' + value['numeric-id'];
			if (callback) {
				library_namespace.debug('Trying to get entity ' + value, 1,
						'wikidata_datavalue');
				// console.log(value);
				// console.log(wiki_API.site_name(options,{get_all_properties:true}).language);
				wikidata_entity(value, options.get_object ? callback
				// default: get label 標籤標題
				: function(entity, error) {
					// console.log([ entity, error ]);
					if (error) {
						library_namespace.debug(
								'Failed to get entity ' + value, 0,
								'wikidata_datavalue');
						callback && callback(undefined, error);
						return;
					}
					entity = entity.labels || entity;
					entity = entity[wiki_API.site_name(options, {
						get_all_properties : true
					}).language] || entity;
					callback
							&& callback('value' in entity ? entity.value
									: entity);
				}, {
					languages : wiki_API.site_name(options, {
						get_all_properties : true
					}).language
				});
			}
			return value;
		}

		library_namespace.warn('wikidata_datavalue: 尚無法處理此屬性: [' + type
				+ ']，請修改本函數。');
		callback && callback(value);
		return value;
	}

	// 取得value在property_list中的index。相當於 property_list.indexOf(value)
	// type=-1: list.lastIndexOf(value), type=1: list.includes(value),
	// other type: list.indexOf(value)
	wikidata_datavalue.get_index = function(property_list, value, type) {
		function to_comparable(value) {
			if (Array.isArray(value) && value.JD) {
				// e.g., new Date('2000-1-1 UTC+0')
				var date = new Date(value.join('-') + ' UTC+0');
				if (isNaN(date.getTime())) {
					library_namespace
							.error('wikidata_datavalue.get_index: Invalid Date: '
									+ value);
				}
				value = date;
			}
			// e.g., library_namespace.is_Date(value)
			return typeof value === 'object' ? JSON.stringify(value) : value;
		}

		property_list = wikidata_datavalue(property_list, undefined, {
			// multiple
			multi : true
		}).map(to_comparable);

		value = to_comparable(value && value.datavalue ? wikidata_datavalue(value)
				: value);

		if (!isNaN(value) && property_list.every(function(v) {
			return typeof v === 'number';
		})) {
			value = +value;
		}

		// console.log([ value, property_list ]);

		if (type === 0) {
			return [ property_list, value ];
		}
		if (type === 1) {
			return property_list.includes(value);
		}
		if (type === -1) {
			return property_list.lastIndexOf(value);
		}
		return property_list.indexOf(value);
	};

	// ------------------------------------------------------------------------

	/**
	 * get label of entity. 取得指定實體的標籤。
	 * 
	 * CeL.wiki.data.label_of()
	 * 
	 * @param {Object}entity
	 *            指定實體。
	 * @param {String}[language]
	 *            指定取得此語言之資料。
	 * @param {Boolean}[use_title]
	 *            當沒有標籤的時候，使用各語言連結標題。
	 * @param {Boolean}[get_labels]
	 *            取得所有標籤。
	 * 
	 * @returns {String|Array}標籤。
	 */
	function get_entity_label(entity, language, use_title, get_labels) {
		if (get_labels) {
			if (use_title) {
				use_title = get_entity_link(entity, language);
				if (!Array.isArray(use_title))
					use_title = use_title ? [ use_title ] : [];
			}
			return entity_labels_and_aliases(entity, language, use_title);
		}

		var labels = entity && entity.labels;
		if (labels) {
			var label = labels[language || wiki_API.language];
			if (label)
				return label.value;
			if (!language)
				return labels;
		}

		if (use_title) {
			return get_entity_link(entity, language);
		}
	}

	/**
	 * get site link of entity. 取得指定實體的語言連結標題。
	 * 
	 * CeL.wiki.data.title_of(entity, language)
	 * 
	 * @param {Object}entity
	 *            指定實體。
	 * @param {String}[language]
	 *            指定取得此語言之資料。
	 * 
	 * @returns {String}語言標題。
	 */
	function get_entity_link(entity, language) {
		var sitelinks = entity && entity.sitelinks;
		if (sitelinks) {
			var link = sitelinks[wiki_API.site_name(language)];
			if (link) {
				return link.title;
			}
			if (!language) {
				link = [];
				for (language in sitelinks) {
					link.push(sitelinks[language].title);
				}
				return link;
			}
		}
	}

	// https://www.wikidata.org/w/api.php?action=help&modules=wbgetentities
	// Maximum number of values is 50
	var MAX_ENTITIES_TO_GET = 50;

	var PATTERN_entity_id = /^Q(\d{1,10})$/i;
	var PATTERN_property_id = /^P(\d{1,5})$/i;

	/**
	 * 取得特定實體的特定屬性值。
	 * 
	 * @example<code>

	CeL.wiki.data('Q1', function(entity) {result=entity;});
	CeL.wiki.data('Q2', function(entity) {result=entity;console.log(JSON.stringify(entity).slice(0,400));});
	CeL.wiki.data('Q1', function(entity) {console.log(entity.id==='Q1'&&JSON.stringify(entity.labels)==='{"zh":{"language":"zh","value":"宇宙"}}');}, {languages:'zh'});
	CeL.wiki.data('Q1', function(entity) {console.log(entity.labels['en'].value+': '+entity.labels['zh'].value==='universe: 宇宙');});
	// Get the property of wikidata entity.
	// 取得Wikidata中指定實體項目的指定屬性/陳述。
	CeL.wiki.data('Q1', function(entity) {console.log(entity['en'].value+': '+entity['zh'].value==='universe: 宇宙');}, 'labels');
	// { id: 'P1', missing: '' }
	CeL.wiki.data('Q1|P1', function(entity) {console.log(JSON.stringify(entity[1])==='{"id":"P1","missing":""}');});
	CeL.wiki.data(['Q1','P1'], function(entity) {console.log(entity);});

	CeL.wiki.data('Q11188', function(entity) {result=entity;console.log(JSON.stringify(entity.labels.zh)==='{"language":"zh","value":"世界人口"}');});

	CeL.wiki.data('P6', function(entity) {result=entity;console.log(JSON.stringify(entity.labels.zh)==='{"language":"zh","value":"政府首长"');});

	CeL.wiki.data('宇宙', '形狀', function(entity) {result=entity;console.log(entity==='宇宙的形狀');})
	CeL.wiki.data('荷马', '出生日期', function(entity) {result=entity;console.log(''+entity==='前8世紀');})
	CeL.wiki.data('荷马', function(entity) {result=entity;console.log(CeL.wiki.entity.value_of(entity.claims.P1477)==='Ὅμηρος');})
	CeL.wiki.data('艾薩克·牛頓', '出生日期', function(entity) {result=entity;console.log(''+entity==='1643年1月4日,1642年12月25日');})

	// 實體項目值的鏈接數據界面 (無法篩選所要資料，傳輸量較大。)
	// 非即時資料!
	CeL.get_URL('https://www.wikidata.org/wiki/Special:EntityData/Q1.json',function(r){r=JSON.parse(r.responseText);console.log(r.entities.Q1.labels.zh.value)})

	// ------------------------------------------------------------------------

	wiki = CeL.wiki.login(user_name, pw, 'wikidata');
	wiki.data(id, function(entity){}, {is_key:true}).edit_data(function(entity){});
	wiki.page('title').data(function(entity){}, options).edit_data().edit()

	wiki = Wiki(true)
	wiki.page('宇宙').data(function(entity){result=entity;console.log(entity);})

	wiki = Wiki(true, 'wikidata');
	wiki.data('宇宙', function(entity){result=entity;console.log(entity.labels['en'].value==='universe');})
	wiki.data('宇宙', '形狀', function(entity){result=entity;console.log(entity==='宇宙的形狀');})
	wiki.query('CLAIM[31:14827288] AND CLAIM[31:593744]', function(entity) {result=entity;console.log(entity.labels['zh-tw'].value==='維基資料');})

	</code>
	 * 
	 * @param {String|Array}key
	 *            entity id. 欲取得之特定實體 id。 e.g., 'Q1', 'P6'
	 * @param {String}[property]
	 *            取得特定屬性值。
	 * @param {Function}[callback]
	 *            回調函數。 callback(轉成JavaScript的值, error)
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @see https://www.mediawiki.org/wiki/Wikibase/DataModel/JSON
	 * @see https://www.wikidata.org/w/api.php?action=help&modules=wbgetentities
	 */
	function wikidata_entity(key, property, callback, options) {
		if (typeof property === 'function' && !options) {
			// shift arguments.
			options = callback;
			callback = property;
			property = null;
		}

		if (typeof options === 'string') {
			options = {
				props : options
			};
		} else if (typeof options === 'function') {
			options = {
				filter : options
			};
		} else {
			// 正規化並提供可隨意改變的同內容參數，以避免修改或覆蓋附加參數。
			options = library_namespace.new_options(options);
		}

		var API_URL = get_data_API_URL(options);

		// ----------------------------
		// convert property: title to id
		if (typeof property === 'string' && !PATTERN_property_id.test(property)) {
			if (library_namespace.is_debug(2)
					&& /^(?:(?:info|sitelinks|sitelinks\/urls|aliases|labels|descriptions|claims|datatype)\|)+$/
							.test(property + '|'))
				library_namespace.warn(
				//
				'wikidata_entity: 您或許該採用 options.props = ' + property);
			/** {String}setup language of key and property name. 僅在需要 search 時使用。 */
			property = [ wiki_API.site_name(options, {
				get_all_properties : true
			}).language, property ];
		}

		// console.log('property: ' + property);
		if (is_api_and_title(property, 'language')) {
			// TODO: property 可能是 [ language code, 'labels|aliases' ] 之類。
			property = wikidata_search.use_cache(property, function(id, error) {
				wikidata_entity(key, id, callback, options);
			}, options);
			if (!property) {
				// assert: property === undefined
				// Waiting for conversion.
				return;
			}
		}

		// ----------------------------
		// convert key: title to id
		if (typeof key === 'number') {
			key = [ key ];
		} else if (typeof key === 'string'
				&& !/^[PQ]\d{1,10}(\|[PQ]\d{1,10})*$/.test(key)) {
			/** {String}setup language of key and property name. 僅在需要 search 時使用。 */
			key = [ wiki_API.site_name(options, {
				get_all_properties : true
			}).language, key ];
		}

		if (Array.isArray(key)) {
			if (is_api_and_title(key)) {
				if (is_wikidata_site_nomenclature(key[0])) {
					key = {
						site : key[0],
						title : key[1]
					};

				} else {
					wikidata_search(key, function(id) {
						// console.trace(id);
						if (id) {
							library_namespace.debug(
							//
							'entity ' + id + ' ← [[:' + key.join(':') + ']]',
									1, 'wikidata_entity');
							wikidata_entity(id, property, callback, options);
							return;
						}

						// 可能為重定向頁面？
						// 例如要求 "A of B" 而無此項，
						// 但 [[en:A of B]]→[[en:A]] 且存在 "A"，則會回傳本"A"項。
						wiki_API.page(key.clone(), function(page_data) {
							var content = wiki_API.content_of(page_data),
							// 測試檢查是否為重定向頁面。
							redirect = wiki_API.parse.redirect(content);
							if (redirect) {
								library_namespace.info(
								//
								'wikidata_entity: 處理重定向頁面: [[:' + key.join(':')
										+ ']] → [[:' + key[0] + ':' + redirect
										+ ']]。');
								wikidata_entity([ key[0],
								// wiki_API.normalize_title():
								// 此 API 無法自動轉換首字大小寫之類！因此需要自行正規化。
								wiki_API.normalize_title(redirect) ], property,
										callback, options);
								return;
							}

							library_namespace.error(
							//
							'wikidata_entity: Wikidata 不存在/已刪除 [[:'
									+ key.join(':') + ']] 之數據，'
									+ (content ? '但' : '且無法取得/不')
									+ '存在此 Wikipedia 頁面。無法處理此 Wikidata 數據要求。');
							callback(undefined, 'no_key');
						});

					}, Object.assign({
						API_URL : API_URL,
						get_id : true,
						limit : 1
					}, options));
					// Waiting for conversion.
					return;
				}

			} else if (key.length > MAX_ENTITIES_TO_GET) {
				if (!key.not_original) {
					key = key.clone();
					key.not_original = true;
				}
				var result, _error;
				var get_next_slice = function get_next_slice() {
					library_namespace.info('wikidata_entity: ' + key.length
							+ ' items left...');
					wikidata_entity(key.splice(0, MAX_ENTITIES_TO_GET),
					//
					property, function(entities, error) {
						// console.log(Object.keys(entities));
						if (result)
							Object.assign(result, entities);
						else
							result = entities;
						_error = error || _error;
						if (key.length > 0) {
							get_next_slice();
						} else {
							callback(result, _error);
						}
					}, options);
				}
				get_next_slice();
				return;

			} else {
				key = key.map(function(id) {
					if (PATTERN_entity_id.test(id)
					//
					|| PATTERN_property_id.test(id))
						return id;
					if (library_namespace.is_digits(id))
						return 'Q' + id;
					library_namespace.warn(
					//
					'wikidata_entity: Invalid id: ' + id);
					return '';
				}).join('|');
			}
		}

		// ----------------------------

		if (!key || library_namespace.is_empty_object(key)) {
			library_namespace.error('wikidata_entity: 未設定欲取得之特定實體 id。');
			console.trace(key);
			callback(undefined, 'no_key');
			return;
		}

		// 實體項目 entity
		// https://www.wikidata.org/w/api.php?action=wbgetentities&ids=Q1&props=labels&utf8=1
		// TODO: claim/聲明/屬性/分類/陳述/statement
		// https://www.wikidata.org/w/api.php?action=wbgetclaims&ids=P1&props=claims&utf8=1
		// TODO: 維基百科 sitelinks
		// https://www.wikidata.org/w/api.php?action=wbgetentities&ids=Q1&props=sitelinks&utf8=1
		var action;
		// 不採用 wiki_API.is_page_data(key)
		// 以允許自行設定 {title:title,language:language}。
		// console.trace(key);
		if (key.title) {
			if (false) {
				console.trace([ key.site,
						wiki_API.site_name(key.language, options), key ]);
			}
			action = 'sites=' + (key.site ||
			// 在 options 包含之 wiki session 中之 key.language。
			// e.g., "cz:" 在 zhwiki 將轉為 cs.wikipedia.org
			wiki_API.site_name(key.language, options)) + '&titles='
					+ encodeURIComponent(key.title);
		} else {
			if (typeof key === 'object') {
				console.trace(key);
				callback(undefined,
						'wikidata_entity: Input object instead of string');
				return;
			}
			action = 'ids=' + key;
		}
		library_namespace.debug('action: [' + action + ']', 2,
				'wikidata_entity');
		// https://www.wikidata.org/w/api.php?action=help&modules=wbgetentities
		action = [ API_URL, 'action=wbgetentities&' + action ];

		if (property && !('props' in options)) {
			options.props = 'claims';
		}
		var props = options.props;
		if (Array.isArray(props)) {
			props = props.join('|');
		}
		if (wiki_API.is_page_data(key) && typeof props === 'string') {
			// for data.lastrevid
			if (!props) {
				props = 'info';
			} else if (!/(?:^|\|)info(?:$|\|)/.test(props)) {
				props += '|info';
			}
		}
		// 可接受 "props=" (空 props)。
		if (props || props === '') {
			// retrieve properties. 僅擷取這些屬性。
			action[1] += '&props=' + props;
			if (props.includes('|')) {
				// 對於多種屬性，不特別取之。
				props = null;
			}
		}
		if (options.languages) {
			// retrieve languages, language to callback. 僅擷取這些語言。
			action[1] += '&languages=' + options.languages;
		}
		// console.log(options);
		// console.log(action);
		// console.trace([ key, arguments, action ]);
		// console.log(wiki_API.session_of_options(options));

		// library_namespace.log('wikidata_entity: API_URL: ' + API_URL);
		// library_namespace.log('wikidata_entity: action: ' + action);
		var _arguments = arguments;
		// TODO:
		wiki_API.query(action, function handle_result(data, error) {
			error = wiki_API.query.handle_error(data, error);
			// 檢查伺服器回應是否有錯誤資訊。
			if (error) {
				if (error.code === 'param-missing') {
					library_namespace.error(
					/**
					 * 可能是錯把 "category" 之類當作 sites name??
					 * 
					 * wikidata_entity: [param-missing] A parameter that is
					 * required was missing. (Either provide the item "ids" or
					 * pairs of "sites" and "titles" for corresponding pages)
					 */
					'wikidata_entity: 未設定欲取得之特定實體 id。請確定您的要求，尤其是 sites 存在: '
							+ decodeURI(action[0]));
				} else {
					library_namespace.error('wikidata_entity: ' + error);
				}
				callback(data, error);
				return;
			}

			// assert: library_namespace.is_Object(data):
			// {entities:{Q1:{pageid:129,lastrevid:0,id:'P1',labels:{},claims:{},...},P1:{id:'P1',missing:''}},success:1}
			// @see https://www.mediawiki.org/wiki/Wikibase/DataModel/JSON
			// @see https://www.wikidata.org/wiki/Special:ListDatatypes
			if (data && data.entities) {
				data = data.entities;
				var list = [];
				for ( var id in data) {
					list.push(data[id]);
				}
				data = list;
				if (data.length === 1) {
					data = data[0];
					if (props && (props in data)) {
						data = data[props];
					} else {
						if (wiki_API.is_page_data(key)) {
							library_namespace.debug('id - ' + data.id
									+ ' 對應頁面: ' + wiki_API.title_link_of(key),
									1, 'wikidata_entity');
							data[KEY_CORRESPOND_PAGE] = key;
							if (false && !data.lastrevid) {
								library_namespace
										.log('wikidata_entity: action: '
												+ action);
								console.trace(_arguments);
							}
						}
						// assert: KEY_get_entity_value, KEY_SESSION
						// is NOT in data
						Object.defineProperty(data, KEY_get_entity_value, {
							value : wikidata_entity_value
						});
						if (options && options[KEY_SESSION]) {
							// for .resolve_item
							data[KEY_SESSION] = options[KEY_SESSION];
						}
					}
				}
			}

			if (property && data) {
				property = (data.claims
				// session.structured_data()
				// [[commons:Commons:Structured data]]
				|| data.statements || data)[property];
			}
			if (property) {
				wikidata_datavalue(property, callback, options);
			} else {
				callback(data);
			}
		}, null, options);
	}

	/**
	 * 取得特定屬性值。
	 * 
	 * @param {String}[property]
	 *            取得特定屬性值。
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * @param {Function}[callback]
	 *            回調函數。 callback(轉成JavaScript的值)
	 * 
	 * @returns 屬性的值
	 * 
	 * @inner
	 */
	function wikidata_entity_value(property, options, callback) {
		// console.trace(property);
		if (Array.isArray(property)) {
			// e.g., entity.value(['property','property'])
			var property_list = property;
			property = Object.create(null);
			property_list.forEach(function(key) {
				property[key] = null;
			});
		}
		if (library_namespace.is_Object(property)) {
			// e.g., entity.value({'property':'language'})
			if (callback) {
				;
			}
			// console.trace(property);

			// TODO: for callback
			for ( var key in property) {
				var _options = property[key];
				if (typeof _options === 'string'
						&& PATTERN_PROJECT_CODE_i.test(_options)) {
					_options = Object.assign({
						language : _options.toLowerCase()
					}, options);
				} else {
					_options = options;
				}
				property[key] = wikidata_entity_value.call(this, key, _options);
			}
			return property;
		}

		var value, language = wiki_API.site_name(options, {
			get_all_properties : true
		}).language, matched = typeof property === 'string'
				&& property.match(PATTERN_property_id);

		if (matched) {
			property = +matched[1];
		}

		if (property === 'label') {
			value = this.labels && this.labels[language];
		} else if (property === 'alias') {
			value = this.aliases && this.aliases[language];
		} else if (property === 'sitelink') {
			value = this.sitelinks && this.sitelinks[language];
		} else if (typeof property === 'number') {
			if (!this.claims) {
				library_namespace
						.warn('wikidata_entity_value: 未取得 entity.claims！');
				value = null;
			} else {
				value = this.claims['P' + property];
			}
		} else if (value = wikidata_search.use_cache(property, Object.assign({
			type : 'property'
		}, options))) {
			// 一般 property
			if (!this.claims) {
				library_namespace
						.warn('wikidata_entity_value: 未取得 entity.claims！');
				value = null;
			} else if (Array.isArray(value)) {
				var property_list = value;
				for (var index = 0; index < property_list.length; index++) {
					var property_name = property_list[index];
					if (property_name in this.claims) {
						value = this.claims[property_name];
						library_namespace.log('wikidata_entity_value: 自多個 "'
								+ property + '" 同名屬性中 ('
								+ property_list.join(', ') + ')，選擇第一個有屬性值的 '
								+ property_name + '。');
						break;
					}
				}
			} else {
				value = this.claims[value];
			}
		} else {
			library_namespace
					.error('wikidata_entity_value: Cannot deal with property ['
							+ property + ']');
			return;
		}

		if (options && options.resolve_item) {
			// console.trace([ property, value ]);
			value = wikidata_datavalue(value);
			if (Array.isArray(value)) {
				// 有的時候因為操作錯誤，所以會有相同的屬性值。但是這一種情況應該要更正原資料。
				// value = value.unique();
			}
			this[KEY_SESSION][KEY_HOST_SESSION].data(value, callback);
			return value;
		}

		return wikidata_datavalue(value, callback, options);
	}

	// ------------------------------------------------------------------------

	// test if is Q4167410: Wikimedia disambiguation page 維基媒體消歧義頁
	// [[Special:链接到消歧义页的页面]]: 頁面內容含有 __DISAMBIG__ (或別名) 標籤會被作為消歧義頁面。
	// CeL.wiki.data.is_DAB(entity)
	function is_DAB(entity, callback) {
		var property = entity && entity.claims && entity.claims.P31;
		var entity_is_DAB = property
		// wikidata 的 item 或 Q4167410 需要手動加入，非自動連結。
		// 因此不能光靠 Q4167410 準確判定是否為消歧義頁。其他屬性相同。
		// 準確判定得自行檢查原維基之資訊，例如檢查 action=query&prop=info。
		? wikidata_datavalue(property) === 'Q4167410'
		//
		: entity && /\((?:disambiguation|消歧義|消歧義|曖昧さ回避)\)$/
		// 檢查標題是否有 "(消歧義)" 之類。
		.test(typeof entity === 'string' ? entity : entity.title);

		// 基本上只有 Q(entity, 可連結 wikipedia page) 與 P(entity 的屬性) 之分。
		// 再把各 wikipedia page 手動加入 entity 之 sitelink。

		// TODO: expand 之後檢查 __DISAMBIG__ page property

		// TODO: 檢查 [[Category:All disambiguation pages]]

		// TODO: 檢查
		// https://en.wikipedia.org/w/api.php?action=query&titles=title&prop=pageprops
		// 看看是否 ('disambiguation' in page_data.pageprops)；
		// 這方法即使在 wikipedia 沒 entity 時依然有效。

		if (callback) {
			callback(entity_is_DAB, entity);
		}
		return entity_is_DAB;
	}

	// ------------------------------------------------------------------------

	// TODO: 自 root 開始尋找所有的 property
	function property_tree(root, property, callback, options) {
		if (typeof options === 'string') {
			options = {
				retrieve : options
			};
		} else {
			options = library_namespace.setup_options(options);
		}

		var entity_now = root,
		// 擷取具有代表性的特性。 label/sitelink/property/entity
		retrieve = options.retrieve || 'label',
		//
		tree = [];

		function next_entity() {
			wikidata_entity(entity_now, function(data, error) {
				;
			});
		}

		next_entity();
	}

	// ------------------------------------------------------------------------

	// export 導出.
	Object.assign(wikidata_entity, {
		search : wikidata_search,
		// 標籤
		label_of : get_entity_label,
		// 標題
		title_of : get_entity_link,
		value_of : wikidata_datavalue,
		is_DAB : is_DAB,

		// CeL.wiki.data.include_label()
		include_label : include_label
	});

	// ------------------------------------------------------------------------

	// P143 (導入自, 'imported from Wikimedia project') for bot, P248 (載於, stated
	// in) for humans
	// + 來源網址 (P854) reference URL
	// + 檢索日期 (P813) retrieved date

	// @see wikidata_search_cache
	// wikidata_datatype_cache.P31 = {String}datatype of P31;
	var wikidata_datatype_cache = Object.create(null);

	// callback(datatype of property, error)
	function wikidata_datatype(property, callback, options) {
		if (is_api_and_title(property, 'language')) {
			property = wikidata_search.use_cache(property, function(id, error) {
				wikidata_datatype(id, callback, options);
			}, Object.assign(Object.create(null),
					wikidata_search.use_cache.default_options, options));
			if (!property) {
				// assert: property === undefined
				// Waiting for conversion.
				return;
			}
		}

		if (property > 0) {
			property = 'P' + property;
		}
		if (!PATTERN_property_id.test(property)) {
			callback(undefined, 'wikidata_datatype: Invalid property: ['
					+ property + ']');
			return;
		}

		var datatype = wikidata_datatype_cache[property];
		if (datatype) {
			callback(datatype);
			return;
		}

		var action = [ get_data_API_URL(options),
		// https://www.wikidata.org/w/api.php?action=wbgetentities&props=datatype&ids=P7
		'action=wbgetentities&props=datatype&ids=' + property ];
		wiki_API.query(action, function handle_result(data, error) {
			error = wiki_API.query.handle_error(data, error);
			// 檢查伺服器回應是否有錯誤資訊。
			if (error) {
				library_namespace.error('wikidata_datatype: ' + error);
				callback(data, error);
				return;
			}

			// data =
			// {"entities":{"P7":{"type":"property","datatype":"wikibase-item","id":"P7"}},"success":1}
			// data.entities[property].datatype
			if (!(data = data.entities) || !(data = data[property])) {
				callback(data, 'Invalid/Unknown return for ['
				//
				+ property + ']');
				return;
			}

			library_namespace.debug('datatype of property [' + property
					+ ']: [' + data.datatype + ']', 1, 'wikidata_datatype');
			// cache
			wikidata_datatype_cache[property] = data.datatype;
			callback(data.datatype);
		}, null, options);
	}

	// ------------------------------------------------------------------------

	// auto-detect if are multiple values
	function is_multi_wikidata_value(value, options) {
		if (value === wikidata_edit.remove_all)
			return false;

		// 'multi' in options
		if (options.multi !== undefined)
			return options.multi;

		if (!Array.isArray(value))
			return false;

		// auto-detect: guess if is multi

		// 去除 [ language, key to search ] 的情形。
		if (is_api_and_title(value, 'language'))
			return false;

		// 去除經緯度+高度的情形。
		if (value.length === 2 || value.length === 3)
			if (typeof value[0] === 'number' && typeof value[1] === 'number')
				return false;

		return true;
	}

	// https://github.com/DataValues/Number/blob/master/src/DataValues/DecimalValue.php#L43
	// const QUANTITY_VALUE_PATTERN = '/^[-+]([1-9]\d*|\d)(\.\d+)?\z/';

	// return quantity acceptable by wikidata API ({String}with sign)
	// https://www.wikidata.org/wiki/Help:Statements#Quantitative_values
	// https://phabricator.wikimedia.org/T119226
	function wikidata_quantity(value, unit) {
		// assert: typeof value === 'number'
		value = +value;
		// TODO: 極大極小值。
		// 負數已經自動加上 "-"
		return value < 0 ? String(value)
		// `value || 0`: for NaN
		: '+' + (value || 0);
	}

	/**
	 * 盡可能模擬 wikidata (wikibase) 之 snak 之 JSON 資料結構。
	 * 
	 * TODO: callback
	 * 
	 * @param value
	 *            要解析的值
	 * @param {String}[datatype]
	 *            資料型別
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @returns {Object}wikidata (wikibase) 之 JSON 資料結構。
	 * 
	 * @see https://www.wikidata.org/w/api.php?action=help&modules=wbparsevalue
	 *      https://www.mediawiki.org/wiki/Wikibase/API#wbparsevalue
	 *      https://phabricator.wikimedia.org/T112140
	 */
	function normalize_wikidata_value(value, datatype, options,
			argument_to_pass) {
		if (library_namespace.is_Object(datatype) && options === undefined) {
			// 輸入省略了datatype。
			// input: normalize_wikidata_value(value, options)
			options = datatype;
			datatype = undefined;
		} else if (typeof options === 'string'
				&& /^[PQ]\d{1,5}$/i.test(options)) {
			options = {
				property : options
			};
		} else if (typeof options === 'string'
				&& PATTERN_PROJECT_CODE_i.test(options)) {
			options = {
				language : options.toLowerCase()
			};
		} else {
			options = library_namespace.setup_options(options);
		}

		if (value_is_to_remove(value)) {
			if (typeof options.callback === 'function')
				options.callback(value, argument_to_pass);
			return value;
		}

		var is_multi = is_multi_wikidata_value(value, options);
		// console.trace([ 'is_multi: ' + is_multi, 'value:', value ]);
		if (is_multi) {
			if (!Array.isArray(value)) {
				value = [ value ];
			}
			// 正規化並提供可隨意改變的同內容參數，以避免修改或覆蓋附加參數。
			options = library_namespace.new_options(options);
			delete options.multi;
			var left = value.length, callback = options.callback;
			options.callback = function(normalized_data, index) {
				if (!(0 <= index && index < value.length)) {
					throw new Error('normalize_wikidata_value: Invalid index: '
							+ index);
				}
				library_namespace.debug('Set [' + index + ']: '
						+ JSON.stringify(normalized_data), 3,
						'normalize_wikidata_value');
				// console.log(normalized_data);
				value[index] = normalized_data;
				if (--left === 0 && typeof callback === 'function') {
					library_namespace.debug('is_multi: Run callback:', 3,
							'normalize_wikidata_value');
					// console.log(value);
					// console.log(callback + '');
					callback(value, argument_to_pass);
				}
			};
			value = value.map(function(v, index) {
				return normalize_wikidata_value(v, datatype, options, index);
			});
			return value;
		}

		// --------------------------------------

		if (!datatype && options.property
				&& typeof options.callback === 'function'
				&& (!('get_type' in options) || options.get_type)) {
			// 先取得/確認指定 property 之 datatype。
			wikidata_datatype(options.property, function(datatype) {
				var matched = datatype
						&& datatype.match(/^wikibase-(item|property)$/);
				var entity_id = library_namespace.is_Object(value)
						&& value.value || value;
				if (matched && entity_id && !/^[PQ]\d{1,10}$/.test(entity_id)) {
					if (typeof value === 'object') {
						library_namespace.error('normalize_wikidata_value: '
								+ 'Invalid object value!');
						console.trace([ value, datatype, options.property ]);
						normalize_wikidata_value(value, datatype, options,
								argument_to_pass);
						return;
					}

					library_namespace.debug('將屬性名稱轉換成 id (' + datatype + '): '
							+ JSON.stringify(value), 3,
							'normalize_wikidata_value');
					// console.log(options);
					wikidata_search.use_cache(value, function(id, error) {
						// console.trace(options);
						// console.trace('' + options.callback);
						normalize_wikidata_value(id ||
						// 'normalize_wikidata_value: Nothing found: [' + value
						// + ']'
						value, datatype, options, argument_to_pass);
					}, Object.assign(Object.create(null),
					// 因wikidata_search.use_cache.default_options包含.type設定，必須將特殊type設定放在匯入default_options後!
					wikidata_search.use_cache.default_options, {
						type : matched[1],
						// 警告: 若是設定 must_callback=false，會造成程序不 callback 而中途跳出!
						must_callback : true
					}, options));
				} else {
					normalize_wikidata_value(value, datatype || NOT_FOUND,
							options, argument_to_pass);
				}
			}, options);
			return;
		}

		// --------------------------------------
		// 處理單一項目。
		var snaktype, datavalue_type, error;

		function normalized() {
			var normalized_data = {
				snaktype : snaktype || 'value'
			};
			if (options.property) {
				normalized_data.property = options.property;
			}
			if (options.hash) {
				normalized_data.hash = options.hash;
			}
			if (datatype) {
				normalized_data.datavalue = {
					value : value,
					type : datavalue_type
				};
				normalized_data.datatype = datatype;
			}
			if (error) {
				normalized_data.error = error;
				library_namespace.error(error);
				// console.trace(normalized_data);
			}

			// console.log(JSON.stringify(normalized_data));
			// console.log(normalized_data);
			if (typeof options.callback === 'function') {
				options.callback(normalized_data, argument_to_pass);
			}
			return normalized_data;
		}

		// delete: {P1:CeL.wiki.edit_data.remove_all}
		// delete: {P1:value,remove:true}
		// snaktype novalue 無數值: {P1:null}
		// snaktype somevalue 未知數值: {P1:CeL.wiki.edit_data.somevalue}
		// snaktype value: {P1:...}

		if (value === null) {
			snaktype = 'novalue';
			return normalized();
		}

		if (value === wikidata_edit.somevalue) {
			snaktype = 'somevalue';
			return normalized();
		}

		if (datatype === NOT_FOUND) {
			// 例如經過 options.get_type 卻沒找到。
			// 因為之前應該已經顯示過錯誤訊息，因此這邊直接放棄作業。
			return normalized();
		}

		// --------------------------------------
		// 處理一般賦值。

		if (!datatype) {
			// auto-detect: guess datatype

			// https://www.wikidata.org/w/api.php?action=help&modules=wbparsevalue
			// https://www.wikidata.org/w/api.php?action=wbgetentities&ids=P3088&props=datatype
			// +claims:P1793
			//
			// url: {P856:"https://url"}, {P1896:"https://url"}
			// monolingualtext: {P1448:"text"} ← 自動判別language,
			// monolingualtext: {P1448:"text",language:"zh-tw"}
			// string: {P1353:"text"}
			// external-id: {P212:'id'}
			// math: {P2534:'1+2'}
			// commonsMedia: {P18:'file.svg'}
			//
			// quantity: {P1114:0}
			// time: {P585:new Date} date.precision=1
			// wikibase-item: {P1629:Q1}
			// wikibase-property: {P1687:P1}
			// globe-coordinate 經緯度:
			// {P625: [ {Number}latitude 緯度, {Number}longitude 經度 ]}

			if (typeof value === 'number') {
				datatype = 'quantity';
			} else if (Array.isArray(value)
					&& (value.length === 2 || value.length === 3)) {
				datatype = 'globe-coordinate';
			} else if (library_namespace.is_Date(value)) {
				datatype = 'time';
			} else {
				value = String(value);
				var matched = value.match(/^([PQ])(\d{1,10})$/i);
				if (matched) {
					datatype = /^[Qq]$/.test(matched[1]) ? 'wikibase-item'
							: 'wikibase-property';
				} else if ('language' in options) {
					datatype = 'monolingualtext';
				} else if (/^(?:https?|ftp):\/\//i.test(value)) {
					datatype = 'url';
				} else if (/\.(?:jpg|png|svg)$/i.test(value)) {
					datatype = 'commonsMedia';
				} else {
					// TODO: other types: external-id, math
					datatype = 'string';
				}
			}
			// console.log('guess datatype: ' + datatype + ', value: ' + value);
		}

		// --------------------------------------

		if (typeof value === 'object' && value.snaktype && value.datatype) {
			// 若 value 已經是完整的 wikidata object，則直接回傳之。
			if (datatype !== value.datatype) {
				library_namespace.error(
				// 所指定的與 value 的不同。
				'normalize_wikidata_value: The datatype of the value ['
						+ value.datatype + '] is different from specified: ['
						+ datatype + ']');
			}

			if (typeof options.callback === 'function') {
				options.callback(value, argument_to_pass);
			}
			return value;
		}

		// --------------------------------------
		// 依據各種不同的 datatype 生成結構化資料。

		switch (datatype) {
		case 'globe-coordinate':
			datavalue_type = 'globecoordinate';
			value = {
				latitude : +value[0],
				longitude : +value[1],
				// altitude / height / -depth
				altitude : typeof value[2] === 'number' ? value[2] : null,
				// 1: 整個地球?
				precision : value.precision || options.precision || 0.000001,
				globe : options.globe || 'http://www.wikidata.org/entity/Q2'
			};
			break;

		case 'monolingualtext':
			// console.trace([ value, datatype ]);
			datavalue_type = datatype;
			value = {
				text : value,
				language : wiki_API.site_name(options, {
					get_all_properties : true
				}).language || guess_language(value)
			};
			// console.log('use language: ' + value.language);
			break;

		case 'quantity':
			datavalue_type = datatype;
			var unit = options.unit || 1;
			value = wikidata_quantity(value);
			value = {
				amount : value,
				// unit of measure item (empty for dimensionless values)
				// e.g., 'http://www.wikidata.org/entity/Q857027'
				unit : String(unit)
			};
			// optional https://www.wikidata.org/wiki/Help:Data_type
			if (typeof options.upperBound === 'number')
				value.upperBound = wikidata_quantity(options.upperBound);
			// optional https://www.wikidata.org/wiki/Help:Data_type
			if (typeof options.lowerBound === 'number')
				value.lowerBound = wikidata_quantity(options.lowerBound);
			if (options.add_bound) {
				// isNaN(null)
				if (!('upperBound' in value))
					value.upperBound = value.amount;
				if (!('lowerBound' in value))
					value.lowerBound = value.amount;
			}
			break;

		case 'time':
			datavalue_type = datatype;
			var precision = value && value.precision || options.precision;
			// 規範日期。
			if (!library_namespace.is_Date(value)) {
				var date_value;
				// TODO: 解析各種日期格式。
				if (value && isNaN(date_value = Date.parse(value))) {
					// Warning:
					// String_to_Date()只在有載入CeL.data.date時才能用。但String_to_Date()比parse_date()功能大多了。
					date_value = library_namespace.String_to_Date(value, {
						// 都必須當作UTC+0，否則被轉換成UTC+0時會出現偏差。
						zone : 0
					});
					if (date_value) {
						if (('precision' in date_value)
						//
						&& (date_value.precision in INDEX_OF_PRECISION)) {
							precision = INDEX_OF_PRECISION[date_value.precision];
						}
						date_value = date_value.getTime();
					} else {
						date_value = parse_date(value, true) || NaN;
					}
				}
				if (isNaN(date_value)) {
					error = 'Invalid Date: [' + value + ']';
				} else {
					// TODO: 按照date_value設定.precision。
					value = new Date(date_value);
				}
			} else if (isNaN(value.getTime())) {
				error = 'Invalid Date';
			}

			// console.trace([ value, precision ]);
			if (isNaN(precision)) {
				if (precision in INDEX_OF_PRECISION) {
					precision = INDEX_OF_PRECISION[precision];
				} else {
					if (precision) {
						library_namespace
								.warn('normalize_wikidata_value: Invalid precision of time, using precision=day instead: '
										+ precision);
					}
					precision = INDEX_OF_PRECISION.day;
				}
			}
			if (error) {
				value = String(value);
			} else {
				if (precision === INDEX_OF_PRECISION.day) {
					// 當 precision=INDEX_OF_PRECISION.day 時，時分秒*必須*設置為 0!
					value.setUTCHours(0, 0, 0, 0);
				}
				value = value.toISOString();
			}
			value = {
				// Data value corrupt: $timestamp must resemble ISO 8601, given
				time : value
				// '2000-01-01T00:00:00.000Z' → '2000-01-01T00:00:00Z'
				.replace(/\.\d{3}Z$/, 'Z')
				// '2000-01-01T00:00:00Z' → '+2000-01-01T00:00:00Z'
				.replace(/^(\d{4}-)/, '+$1'),
				timezone : options.timezone || 0,
				before : options.before || 0,
				after : options.after || 0,
				precision : precision,
				calendarmodel : options.calendarmodel
				// using `https://` will cause to
				// "⧼wikibase-validator-bad-prefix⧽" error!
				// proleptic Gregorian calendar:
				|| 'http://www.wikidata.org/entity/Q1985727'
			};
			break;

		case 'wikibase-item':
		case 'wikibase-property':
			datavalue_type = 'wikibase-entityid';
			// console.log(value);
			var matched = typeof value === 'string'
					&& value.match(/^([PQ])(\d{1,10})$/i);
			if (matched) {
				value = {
					'entity-type' : datatype === 'wikibase-item' ? 'item'
							: 'property',
					'numeric-id' : +matched[2],
					// 在設定時，id 這項可省略。
					id : value
				};
			} else {
				// console.trace(datatype);
				// console.trace(arguments);
				error = 'normalize_wikidata_value: Illegal ' + datatype + ': '
						+ JSON.stringify(value);
			}
			break;

		case 'url':
			datavalue_type = 'string';
			value = String(value);
			/**
			 * <code>
			Error: [modification-failed] URLs are not allowed to contain certain characters like spaces or square brackets: https://doi.org/10.1002/(sici)1098-2825(1997)11:6<315::aid-jcla1>3.0.co;2-4 [wikibase-validator-bad-url] ["https://doi.org/10.1002/(sici)1098-2825(1997)11:6<315::aid-jcla1>3.0.co;2-4"]
			</code>
			 */
			if (/[<>\[\]]/.test(value))
				value = encodeURI(value);
			break;

		case 'commonsMedia':
		case 'external-id':
		case 'math':
		case 'string':
			datavalue_type = 'string';
			// Data value corrupt: Can only construct StringValue from strings
			value = String(value);
			break;

		default:
			error = 'normalize_wikidata_value: Unknown datatype [' + datatype
					+ '] and value [' + JSON.stringify(value) + ']';
		}

		return normalized();
	}

	/**
	 * @inner only for set_claims()
	 */
	var entity_properties = {
		// 值的部分為單純表達意思用的內容結構，可以其他的值代替。
		pageid : 1,
		ns : 0,
		title : 'Q1',
		lastrevid : 1,
		modified : '2000-01-01T00:00:00Z',
		type : 'item',
		id : 'Q1',

		// [[commons:Commons:Structured_data]]
		// statements : [],

		labels : [],
		descriptions : [],
		aliases : [],
		claims : [],

		// https://www.wikidata.org/wiki/Wikidata:Glossary
		// snak: property + value
		// snaks : [],

		sitelinks : []
	},
	//
	KEY_property_options = typeof Symbol === 'function' ? Symbol('options')
			: 'options',
	/**
	 * 放置不應該成為 key 的一些屬性名稱
	 * 
	 * @inner only for set_claims()
	 */
	claim_properties = {
		// 值的部分為單純表達意思用的內容結構，可以其他的值代替。
		// mainsnak : {},
		// snaktype : '',
		// datavalue : {},
		// id : '',
		type : '',
		rank : '',
		language : '',
		// 警告: 此屬性應置於個別 claim 中。
		remove : true,
		// additional_properties, KEY_property_options
		// options : {},
		multi : true,
		qualifiers : [],
		references : []
	};

	// get qualifiers / references of property_data
	function get_property(property_data, type) {
		if (!property_data)
			return;

		return property_data[KEY_property_options]
				&& type in property_data[KEY_property_options] ? property_data[KEY_property_options][type]
				: property_data[type];
	}

	// @inner
	// 為欲刪除之index。
	// TODO: 查無此值時顯示警告。
	function value_is_to_remove(value) {
		// {key:{remove:true}}
		return library_namespace.is_Object(value)
		// {Function}Array.prototype.remove
		&& (value.remove || value.remove === 0
		// TODO:
		// https://www.wikidata.org/w/api.php?action=help&modules=wbeditentity
		// || value.remove === ''
		);
	}

	// @inner
	// @since 2020/6
	function normalize_value_of_properties(value, language) {
		if (library_namespace.is_Object(value)) {
			// convert language+value object
			// {language:'language',value:'value'}
			if (value.language && ('value' in value)) {
				// e.g., {language:'ja',value:'日本'}
				return [ value.language, value.value ];
			}

			var language_and_key;
			if (value_is_to_remove(value)) {
				// {key:{remove:true}}

			} else if ((language_and_key = Object.keys(value)).length === 1
			//
			&& is_api_and_title(language_and_key = [
			// e.g., {key:{ja:'日本'}}
			language_and_key[0], value[language_and_key[0]] ], 'language')) {
				return language_and_key;
			}

		} else if (Array.isArray(value) && value.length === 2
		// TODO: using is_api_and_title(value, 'language')
		// treat as [ language, key to search ]
		&& !value[0] && language) {
			value[0] = language;
		}

		return value;
	}

	// example 1:
	//
	// {Object}可接受的原始輸入形式之一
	// {載於:'宇宙',導入自:'zhwiki',來源網址:undefined,臺灣物種名錄物種編號:{value:123,remove:true},language:'zh',references:{...}}+exists_property_hash
	//
	// {Array}可接受的原始輸入形式之2: 直接轉換為{Array}陣列
	// [{載於:'宇宙',導入自:'zhwiki',來源網址:undefined,臺灣物種名錄物種編號:{value:123,remove:true},language:'zh',references:{...}}]
	// +exists_property_hash
	//
	// {Array}可接受的原始輸入形式之2'
	// 分析每一個個別的{Object}項目，將{Object}簡易的屬性雜湊轉換成{Array}屬性名稱列表。這期間可能會改變要求項目的項目數 →
	// [{載於:'宇宙',options:AP},{導入自:'zhwiki',options:AP},{來源網址:undefined,options:AP},{臺灣物種名錄物種編號:123,remove:true,options:AP}]
	// + additional_properties: AP={language:'zh',references:{...}}
	// + exists_property_hash
	// * {Object|Array}AP.references 當作個別{Object} properties 項目的參照。
	// * 若某項有 .mainsnak 或 .snaktype 則當作輸入了已正規化、全套完整的資料，不處理此項。
	//
	// {Array}可接受的原始輸入形式之3
	// 將{Array}屬性名稱列表轉換成{Array}屬性 id 列表 →
	// [{P248:'宇宙',property:'P248'},{P143:'zhwiki',property:'P143'},{P854:undefined,property:'P854'},{P3088:123,remove:true,property:'P3088'}]
	// + additional_properties + exists_property_hash
	//
	// 去掉 exists_property_hash 已有、重複者。
	// 處理 remove:true & remove all。
	//
	// get datatype of each property →
	// [{P248:'Q1'},{P143:'Q30239'},{P854:undefined},{P3088:123,remove:true}]
	// + additional_properties + exists_property_hash
	//
	// normalize property data value →
	// [{P248:{normalized value of P248}},{P143:{normalized value of P143}}
	// ,{property:P854,remove:true,value:undefined},{property:P3088,remove:true,value:123}]
	// + additional_properties
	//
	// 去掉殼 → data = [{normalized value of P248},{normalized value of P143}
	// ,{property:P854,remove:true,value:undefined},{property:P3088,remove:true,value:123}]
	// .additional=additional_properties
	//
	// callback(data)

	// example 2:
	//
	// [{生物俗名:['SB2#1','SB2#2','SB2#3'],multi:true,language:'zh-tw',references:{臺灣物種名錄物種編號:123456}},
	// {読み仮名 : 'かな',language : 'ja',references : {'imported from Wikimedia
	// project' : 'jawiki'}}]
	// +exists_property_hash
	//
	// {Array}可接受的原始輸入形式之2'
	// 分析每一個個別的{Object}項目，將{Object}簡易的屬性雜湊轉換成{Array}屬性名稱列表。這期間可能會改變要求項目的項目數 →
	// [{生物俗名:'SB2#1',options:AP1},{生物俗名:'SB2#2',options:AP1},{生物俗名:'SB2#3',options:AP1},
	// {読み仮名 : 'かな',options(KEY_property_options):AP2}]
	// +additional_properties:AP1={language:'zh-tw',references:{臺灣物種名錄物種編號:123456}}
	// +additional_properties:AP2={language:'ja',references:{'imported from
	// Wikimedia project':'jawiki'}}

	/**
	 * 規範化屬性列表。
	 * 
	 * @param {Object|Array}properties
	 *            要轉換的屬性。
	 * @param {Function}callback
	 *            回調函數。 callback({Array}property list, error)
	 * @param {Object}[exists_property_hash]
	 *            已經存在的屬性雜湊。可以由 wikidata API 取得。
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 */
	function normalize_wikidata_properties(properties, callback,
			exists_property_hash, options) {
		// console.log(properties);
		// console.trace(options);
		// console.trace('normalize_wikidata_properties');

		if (options.process_sub_property)
			properties = properties[options.process_sub_property];

		try {
			library_namespace.debug('normalize properties: '
					+ JSON.stringify(properties), 3,
					'normalize_wikidata_properties');
		} catch (e) {
			// RangeError: Maximum call stack size exceeded
		}

		// console.log('-'.repeat(40));
		// console.log(properties);

		if (library_namespace.is_Object(properties)) {
			// {Array}可接受的原始輸入形式之2: 直接轉換為{Array}陣列
			properties = [ properties ];

		} else if (!Array.isArray(properties)) {
			if (properties) {
				library_namespace.error('normalize_wikidata_properties: '
						+ 'Invalid properties: ' + JSON.stringify(properties));
			}

			callback(properties);
			return;
		}

		// 分析每一個個別的{Object}項目，將{Object}簡易的屬性雜湊轉換成{Array}屬性名稱列表。這期間可能會改變要求項目的項目數

		// 索求、需要轉換的屬性名稱 property key
		var demands = [],
		// demands 對應的 property
		property_corresponding = [],
		//
		options_language = wiki_API.site_name(options, {
			get_all_properties : true
		}).language;

		// console.trace(options);
		// console.log(options_language);
		// console.log('-'.repeat(20));
		// console.log(properties);

		var old_properties = properties;
		// 把正規化之後的放入 properties。
		properties = [];
		old_properties.forEach(function(property) {
			// console.trace(property);
			if (!property) {
				// Skip null property.
				return;
			}

			// .process_sub_property 指的是可以全部刪除的，即 .references。
			if (options.process_sub_property && value_is_to_remove(property)) {
				properties.push(property);
				return;
			}

			// e.g., property:{P1:'',P2:'',language:'zh',references:{}}
			// assert: library_namespace.is_Object(property)

			// * 若某項有 .mainsnak 或 .snaktype 則當作輸入了已正規化、全套完整的資料，不處理此項。
			if (property.mainsnak || property.snaktype || property.snaks) {
				properties.push(property);
				// Skip it.
				return;
			}

			// [KEY_property_options]: additional properties
			// 參照用設定: 設定每個屬性的時候將參照的設定，包含如 .language 等。
			var additional_properties = property[KEY_property_options],
			//
			check = function(property_data) {
				// console.trace(property_data);
				var language = get_property(property_data, 'language')
						|| options_language;
				var value = property_data.value
				//
				= normalize_value_of_properties(property_data.value, language);
				if (is_api_and_title(value, 'language')) {
					// treat as [ language, key to search ]
					if (!value.type)
						value.type = 'item';
					demands.push(value);
					property_corresponding.push(property_data);
				}

				var property_key = property_data.property;
				if (!/^[PQ]\d{1,10}$/.test(property_key)) {
					// 有些設定在建構property_data時尚存留於((property))，這時得要自其中取出。

					// console.log(property);
					// console.log(options);
					// console.trace(language);
					// throw language;
					if (language) {
						property_key = [ language, property_key ];
					} else {
						property_key = [ , property_key ];
					}
					// e.g., qualifiers: { 'series ordinal': 1 }
					// The 'series ordinal' is property name.
					property_key.type = 'property';
					demands.push(property_key);
					property_corresponding.push(property_data);
				}

				if (property.language)
					property_data.language = property.language;
				properties.push(property_data);
			};

			// .property: property key
			if (property.property) {
				check(property);
				return;
			}

			// e.g.,
			// properties:{P1:'',P2:'',language:'zh',references:{}}
			// assert: library_namespace.is_Object(properties)

			// 將{Object}簡易的屬性雜湊轉換成{Array}屬性名稱列表 →
			// 因為需要動到不可回復的操作，因此不更動到原先的屬性。
			// 初始化
			additional_properties = Object.assign({
				// 先記錄泛用 properties。
				language : get_property(property, 'language')
						|| options_language
			}, additional_properties);

			// console.trace(property);

			// properties應該為{Array}屬性名稱/id列表陣列。
			// 將 參照用設定 設為空，以便之後使用。
			// 把應該用做參照用設定的移到 property[KEY_property_options]，
			// 其他的屬性值搬到新的 properties。
			for ( var key in property) {
				if (key === KEY_property_options) {
					continue;
				}

				var value = property[key];
				if (key in claim_properties) {
					additional_properties[key] = value;
					continue;
				}

				var language = additional_properties.language;

				value = normalize_value_of_properties(value, language);

				// console.trace(value);

				var is_multi = value !== wikidata_edit.remove_all
				//
				&& ('multi' in additional_properties
				//
				? additional_properties.multi
				//
				: is_multi_wikidata_value(value, property));
				if (is_multi) {
					// e.g., [ 'jawiki', ['日本', '米国'] ]
					if (is_api_and_title(value, 'language')
					// [ 'jawiki', '日本' ] 可能會混淆。
					&& Array.isArray(value[1])) {
						value = value[1].map(function(v) {
							// return [ value[0], v ];
							return {
								language : value[0],
								value : v
							};
						});
					}
					// console.log(value);

					// set multiple values
					(Array.isArray(value) ? value : [ value ])
					//
					.forEach(function(v) {
						var property_data = {
							// 將屬性名稱 property key 儲存在 .property
							property : key,
							value : v
						};
						property_data[KEY_property_options]
						//
						= additional_properties;
						check(property_data);
					});
				} else {
					var property_data = {
						// 將屬性名稱 property key 儲存在 .property
						property : key,
						value : value
					};
					property_data[KEY_property_options]
					//
					= additional_properties;
					check(property_data);
				}
			}
			// 這應該僅用於指示本 property，因此處理過後已經無用。
			delete additional_properties.multi;
		});

		// console.log('-'.repeat(60));
		// console.log(properties);

		// Release memory. 釋放被占用的記憶體。
		old_properties = null;

		// --------------------------------------

		function process_property_id_list(property_id_list) {
			// console.trace(property_id_list);
			// console.trace(property_corresponding);

			// 將{Array}屬性名稱列表轉換成{Array}屬性 id 列表 →
			if (property_id_list.length !== property_corresponding.length) {
				throw new Error('normalize_wikidata_properties: '
						+ 'property_id_list.length ' + property_id_list.length
						+ ' !== property_corresponding.length '
						+ property_corresponding.length);
			}

			property_id_list.forEach(function(id, index) {
				var property_data = property_corresponding[index];
				// console.trace([ id, property_data ]);
				// @see check() above
				var value = property_data.value;
				if (value_is_to_remove(value)) {
					// value.key = property_data.property;
					// 紀錄 id，以供之後 remove_qualifiers() 使用。
					value.property = id;
					// console.trace(value);
					return;
				}

				if (is_api_and_title(value, 'language')) {
					// treat as [ language, key to search ]
					property_data.value = id;
					return;
				}

				if (Array.isArray(id) && id.length > 0) {
					library_namespace.error('normalize_wikidata_properties: '
							+ 'Get multi properties: ' + id + ' for '
							+ JSON.stringify(property_data));
					return;
				}

				// 沒找到的時候，id 為 undefined。
				if (/^[PQ]\d{1,10}$/.test(id)) {
					if (!('value' in property_data)) {
						property_data.value
						//
						= property_data[property_data.property];
					}
					property_data.property = id;
					return;
				}

				library_namespace.error('normalize_wikidata_properties: '
						+ 'Skip invalid property key: '
						+ JSON.stringify(property_data));
			});

			function property_value(property_data) {
				return 'value' in property_data ? property_data.value
						: property_data[property_data.property];
			}

			// 跳過要刪除的。
			function is_property_to_remove(property_data) {
				if (!('remove' in property_data)
						&& property_data[KEY_property_options]
						&& ('remove' in property_data[KEY_property_options])) {
					if (typeof property_data[KEY_property_options].remove
					//
					=== 'function') {
						console.log(property_data[KEY_property_options]);
						throw new Error('normalize_wikidata_properties: '
								+ '.remove is function');
					}
					// delete property_data.value;
					property_data.remove
					// copy configuration.
					// 警告: 此屬性應置於個別 claim 中，而非放在參照用設定。
					// 注意: 這操作會更改 property_data!
					= property_data[KEY_property_options].remove;
				}

				if (value_is_to_remove(property_data)) {
					return true;
				}
				var value = property_value(property_data);
				if (value === wikidata_edit.remove_all
				// 若遇刪除此屬性下所有值，必須明確指定 wikidata_edit.remove_all，避免錯誤操作。
				// && value === undefined
				) {
					// delete property_data.value;
					// 正規化 property_data.remove: 若有刪除操作，必定會設定 .remove。
					// 注意: 這操作會更改 property_data!
					property_data.remove = wikidata_edit.remove_all;
					return true;
				}
			}

			// console.trace(exists_property_hash);
			// 去掉 exists_property_hash 已有、重複者。
			if (exists_property_hash) {
				// console.trace(exists_property_hash);
				properties = properties.filter(function(property_data) {
					// 當有輸入 exists_property_hash 時，所有的相關作業都會在這段處理。
					// 之後 normalize_next_value()不會再動到 exists_property_hash 相關作業。
					var property_id = property_data.property;
					if (!property_id) {
						// 在此無法處理。例如未能轉換 key 成 id。
						return true;
					}
					var value = property_value(property_data),
					//
					exists_property_list = exists_property_hash[property_id];
					// console.trace(exists_property_hash);
					// console.trace(property_id);
					// console.trace(property_data);
					// console.trace(exists_property_list);

					if (!(property_id in wikidata_datatype_cache)
							&& exists_property_list) {
						var datatype = exists_property_list[0]
								&& exists_property_list[0].mainsnak
								&& exists_property_list[0].mainsnak.datatype;
						if (datatype) {
							// 利用原有 datatype 加快速度。
							wikidata_datatype_cache[property_id] = datatype;
						}
					}

					// console.trace('Check
					// is_property_to_remove(property_data)');
					if (is_property_to_remove(property_data)) {
						library_namespace.debug(
								'test 刪除時，需要存在此 property 才有必要處置。', 1,
								'normalize_wikidata_properties');
						// console.trace(property_data, exists_property_list);
						if (!exists_property_list) {
							library_namespace.debug('Skip '
							//
							+ property_id
							//
							+ (value ? '=' + JSON.stringify(value) : '')
									+ ': 無此屬性 id，無法刪除。', 1,
									'normalize_wikidata_properties');
							return false;
						}

						// ((true >= 0))
						if (typeof property_data.remove === 'number'
								&& property_data.remove >= 0) {
							if (property_data.remove in exists_property_list) {
								return true;
							}
							// 要刪除的值不存在。
							library_namespace.warn(
							//
							'normalize_wikidata_properties: '
							//
							+ 'Skip ' + property_id
							//
							+ (value ? '=' + JSON.stringify(value) : '')
							//
							+ ': 不存在指定要刪除的 index ' + property_data.remove + '/'
									+ exists_property_list.length + '，無法刪除。');
							return false;
						}

						if (!property_data.remove || property_data.remove
						//
						=== wikidata_edit.remove_all) {
							return true;
						}

						if (property_data.remove !== true) {
							library_namespace.warn(
							//
							'normalize_wikidata_properties: '
							//
							+ 'Invalid .remove ['
							//
							+ property_data.remove + ']: ' + property_id
							//
							+ (value ? '=' + JSON.stringify(value) : '')
							//
							+ ', will still try to remove the property.');
							// property_data.remove = true;
						}

						// 直接檢測已有的 index，設定於 property_data.remove。
						// 若有必要刪除，從最後一個相符的刪除起。
						var duplicate_index = wikidata_datavalue.get_index(
								exists_property_list, value, -1);
						if (false) {
							// console.log(exists_property_list);
							// console.log(value);
							console.trace(property_data, duplicate_index,
									exists_property_list[duplicate_index]);
						}

						if (duplicate_index !== NOT_FOUND) {
							// delete property_data.value;

							property_data.id
							// https://www.wikidata.org/w/api.php?action=help&modules=wbeditentity
							// for "code": "invalid-claim",
							// "info": "Cannot remove a claim with no GUID",
							// @see normalize_wbeditentity_data()
							= exists_property_list[duplicate_index].id;
							property_data.remove = duplicate_index;
							return true;
						}
						// 要刪除的值不存在。
						library_namespace.debug(
						//
						'Skip ' + property_id
						//
						+ (value ? '=' + JSON.stringify(value)
						//
						+ ': 此屬性無此值，無法刪除。' : ': 無此屬性 id，無法刪除。')
						//
						, 1, 'normalize_wikidata_properties');
						if (false) {
							console.trace(wikidata_search.use_cache([
									property_data.language, value ], {
								get_id : true
							}));
						}
						return false;
					}

					// console.trace(exists_property_list);
					if (!exists_property_list) {
						// 設定值時，不存在此 property 即有必要處置。
						return true;
					}

					// 檢測是否已有此值。
					if (false) {
						console.log(wikidata_datavalue.get_index(
								exists_property_list, value, 0));
					}
					// 若有必要設定 qualifiers / references，從首個相符的設定起。
					var duplicate_index = wikidata_datavalue.get_index(
							exists_property_list, value);
					if (duplicate_index === NOT_FOUND) {
						if (false) {
							console.log(JSON.stringify(exists_property_list));
							console.trace('No duplicate_index of value: '
									+ value);
						}
						return true;
					}

					// console.trace(property_data);

					var rank = get_property(property_data, 'rank'),
					//
					qualifiers = get_property(property_data, 'qualifiers'),
					/*
					 * {Object|Array}property_data[KEY_property_options].references
					 * 當作每個 properties 的參照。
					 */
					references = get_property(property_data, 'references');
					library_namespace.debug('Skip ' + property_id + '['
							+ duplicate_index + ']: 此屬性已存在相同值 [' + value + ']。'
							+ (rank || qualifiers || references
							//
							? '但依舊處理其 rank / qualifiers / references 設定，'
							//
							+ '以防設定了 .force_add_sub_properties。' : ''), 1,
							'normalize_wikidata_properties');
					if (rank || typeof qualifiers === 'object'
							|| typeof references === 'object') {
						// delete property_data.value;
						property_data.exists_index = duplicate_index;
						// console.trace(property_data);
						return true;
					}
					return false;
				});
			}

			// console.trace(properties);
			var index = 0,
			//
			normalize_next_value = function normalize_next_value() {
				library_namespace.debug(index + '/' + properties.length, 3,
						'normalize_next_value');
				if (index === properties.length) {
					library_namespace.debug(
							'done: 已經將可查到的屬性名稱轉換成屬性 id。 callback(properties);',
							2, 'normalize_next_value');
					callback(properties);
					return;
				}

				var property_data = properties[index++];
				if (is_property_to_remove(property_data)) {
					// 跳過要刪除的。
					normalize_next_value();
					return;
				}

				// * 若某項有 .mainsnak 或 .snaktype 則當作輸入了已正規化、全套完整的資料，不處理此項。
				if (property_data.mainsnak || property_data.snaktype
						|| property_data.snaks) {
					// console.trace(property_data);
					normalize_next_value();
					// Skip it.
					return;
				}

				function normalize_wikidata_value__callback(normalized_value) {
					// console.trace(options);
					// console.trace(normalized_value);
					if (typeof options.value_filter === 'function') {
						normalized_value = options
								.value_filter(normalized_value);
					}

					if (Array.isArray(normalized_value) && options.aoto_select) {
						// 採用首個可用的，最有可能是目標的。
						normalized_value.some(function(value) {
							if (value && !value.error
									&& value.datatype !== NOT_FOUND) {
								normalized_value = value;
								return true;
							}
						});
					}

					if (Array.isArray(normalized_value)
							|| normalized_value.error
							|| normalized_value.datatype === NOT_FOUND) {
						// 將無法轉換的放在 .error。
						if (properties.error) {
							properties.error.push(property_data);
						} else {
							properties.error = [ property_data ];
						}

						if (Array.isArray(normalized_value)) {
							// 得到多個值而非單一值。
							library_namespace
									.error('normalize_next_value: '
											+ 'get multiple values instead of just one value: ['
											+ value + '] → '
											+ JSON.stringify(normalized_value));
							// console.trace(value);

						} else if (false && normalized_value.error) {
							// 之前應該已經在 normalize_wikidata_value() 顯示過錯誤訊息。
							library_namespace.error('normalize_next_value: '
									+ normalized_value.error);
						}
						// 因為之前應該已經顯示過錯誤訊息，因此這邊直接放棄作業，排除此 property。

						properties.splice(--index, 1);
						normalize_next_value();
						return;
					}

					if (false) {
						console.log('-'.repeat(60));
						console.log(normalized_value);
						console.trace(property_data.property + ': '
						//
						+ JSON.stringify(exists_property_hash
						//
						[property_data.property]));
					}

					var rank = get_property(property_data, 'rank');

					var qualifiers = get_property(property_data, 'qualifiers');
					/*
					 * {Object|Array}property_data[KEY_property_options].references
					 * 當作每個 properties 的參照。
					 */
					var references = get_property(property_data, 'references');

					if (exists_property_hash[property_data.property]
					// 二次篩選:因為已經轉換/取得了 entity id，可以再次做確認。
					&& (normalized_value.datatype === 'wikibase-item'
					// and 已經轉換了 date time
					|| normalized_value.datatype === 'time')
					//
					&& wikidata_datavalue.get_index(
					//
					exists_property_hash[property_data.property],
					//
					normalized_value, 1)) {
						if (!options.force_add_sub_properties || !rank
								&& !qualifiers && !references) {
							var message = '[' + value + ']';
							if (value !==
							//
							wikidata_datavalue(normalized_value)) {
								message += ' ('
								//
								+ wikidata_datavalue(normalized_value) + ')';
							}
							if (!rank && !qualifiers && !references) {
								library_namespace.debug('Skip exists value: '
										+ message, 1, 'normalize_next_value');
							} else if (!options.no_skip_attributes_note) {
								library_namespace.warn([
								//
								'normalize_next_value: ', {
									T : [
									// gettext_config:{"id":"skip-the-$1-for-$2-and-do-not-set-them-because-the-values-already-exist-and-$3-is-not-set"}
									'跳過 %2 之 %1 設定，因數值已存在且未設定 %3。'
									//
									, [ rank ? 'rank' : 0,
									//
									qualifiers ? 'qualifiers' : 0,
									//
									references ? 'references' : 0
									//
									].filter(function(v) {
										return !!v;
									})
									// gettext_config:{"id":"Comma-separator"}
									.join(gettext('Comma-separator')),
									//
									property_data.property + ' = ' + message,
									//
									'options.force_add_sub_properties' ]
								} ]);
							}
							properties.splice(--index, 1);
							normalize_next_value();
							return;
						}

						// TODO: 依舊增添 rank / qualifiers / references。
						library_namespace.debug('Skip '
								+ property_data.property + ': 此屬性已存在相同值 ['
								+ value + '] ('
								+ wikidata_datavalue(normalized_value)
								+ ')，但依舊處理其 '
								+ 'rank / qualifiers / references 設定。', 1,
								'normalize_next_value');
						// NG: property_data.exists_index = index - 1;
						// console.trace(property_data);
					}

					if (false) {
						// normalize property data value →
						property_data[property_data.property]
						//
						= normalized_value;
					}

					// console.log('-'.repeat(60));
					// console.log(normalized_value);
					// 去掉殼 →
					properties[index - 1] = normalized_value;
					// 複製/搬移需要用到的屬性。
					if (property_data.exists_index >= 0) {
						normalized_value.exists_index
						//
						= property_data.exists_index;
					}
					if (property_data.language) {
						normalized_value.language = property_data.language;
					}
					// console.trace(normalized_value);

					if (rank) {
						// {String}
						normalized_value.rank = rank;
					}

					if (typeof qualifiers === 'object') {
						// {Array|Object}
						normalized_value.qualifiers = qualifiers;
					}

					if (typeof references === 'object') {
						// {Array|Object}
						normalized_value.references = references;
					}

					// console.trace(normalized_value);
					normalize_next_value();
				}

				// get datatype of each property →
				var language = get_property(property_data, 'language')
						|| options_language,
				//
				_options = Object.assign(Object.clone(options),
				//
				property_data[KEY_property_options], {
					// multi : false,
					callback : normalize_wikidata_value__callback,
					property : property_data.property
				});
				if (language) {
					_options.language = language;
				}

				// console.log('-'.repeat(60));
				// console.trace(property_data);
				var value = property_value(property_data);
				// console.log('-'.repeat(60));
				// console.trace([ value, property_data ]);
				// console.log(_options);
				normalize_wikidata_value(value, property_data.datatype,
						_options);
			};

			normalize_next_value();
		}

		// console.trace(demands);

		// 將{Array}屬性名稱列表轉換成{Array}屬性 id 列表 →
		wikidata_search.use_cache(demands, process_property_id_list, Object
				.assign(Object.create(null),
						wikidata_search.use_cache.default_options, options));

	}

	// ----------------------------------------------------

	function entity_id_to_link(id) {
		if (!id && id !== 0) {
			return '';
		}
		if (PATTERN_property_id.test(id)) {
			return '[[Property:' + id + ']]';
		}
		return '[[' + id + ']]';
	}

	function append_parameters(POST_data, options) {
		if (options.bot) {
			POST_data.bot = 1;
		}
		if (options.summary) {
			POST_data.summary = options.summary;
		}
		if (options.tags) {
			POST_data.tags = options.tags;
		}
		// TODO: baserevid, 但這需要每次重新取得 revid。

		if (options.token) {
			// the token should be sent as the last parameter.
			// delete POST_data.token;
			POST_data.token = options.token;
		} else {
			// throw new Error('No token specified!');
		}
		// console.trace(POST_data);
	}

	// @inner
	function set_rank(exists_property_data, property_data, callback, options,
			API_URL, session, exists_rank) {
		// console.trace(arguments);
		var message = 'Set '
				+ entity_id_to_link(wikidata_datavalue(exists_property_data))
				+ '.rank=' + property_data.rank + '←'
				+ exists_property_data.rank;
		library_namespace.debug(exists_property_data.id + ': ' + message, 1,
				'set_rank');
		var original_rank = exists_property_data.rank;
		exists_property_data.rank = property_data.rank;
		var POST_data = {
			claim : JSON.stringify(exists_property_data)
		};

		append_parameters(POST_data, options);
		POST_data.summary = POST_data.summary.trimEnd() + ' (' + message + ')';

		wiki_API.query([ API_URL, 'action=wbsetclaim' ],
		// https://www.wikidata.org/w/api.php?action=help&modules=wbsetclaim
		function handle_result(data, error) {
			// console.trace([ GUID, data, error ]);
			error = wiki_API.query.handle_error(data, error);
			// 檢查伺服器回應是否有錯誤資訊。
			if (error) {
				library_namespace.error('set_rank: ' + message + ': ' + error);
				// recover
				exists_property_data.rank = original_rank;
			}
			// data:
			// {"pageinfo":{"lastrevid":1566340699},"success":1,"claim":{"mainsnak":{"snaktype":"value","property":"P1476","hash":"443d60bb6a5c6380dfdcf1c398b408edddd3b4e1","datavalue":{"value":{"text":"title","language":"en"},"type":"monolingualtext"},"datatype":"monolingualtext"},"type":"statement","id":"Q73311308$0B9608D8-FD38-4462-BD6D-FDE58DD48BAE","rank":"deprecated"}}
			callback(data, error);
		}, POST_data, session);
	}

	// @inner
	function set_single_qualifier(GUID, qualifier, callback, options, API_URL,
			session) {
		var POST_data = {
			// TODO: baserevid
			claim : GUID,
			snaktype : qualifier.snaktype,
			property : qualifier.property,
			value : JSON
					.stringify(qualifier.snaktype === 'value' ? qualifier.datavalue.value
							: '')
		// snakhash : ''
		};

		append_parameters(POST_data, options);

		library_namespace.debug(GUID + ': Set ' + qualifier.property + '='
				+ qualifier.datavalue.value, 1, 'set_single_qualifier');
		wiki_API.query([ API_URL, 'action=wbsetqualifier' ],
		// https://www.wikidata.org/w/api.php?action=help&modules=wbsetqualifier
		function handle_result(data, error) {
			// console.trace([ GUID, data, error ]);
			error = wiki_API.query.handle_error(data, error);
			// 檢查伺服器回應是否有錯誤資訊。
			if (error) {
				library_namespace.error('set_single_qualifier: Set '
						+ qualifier.property + '='
						// e.g., ""
						+ JSON.stringify(qualifier.datavalue.value) + ': '
						+ error);
				// console.trace([ GUID, qualifier ]);
			}
			// data:
			// {"pageinfo":{"lastrevid":1},"success":1,"claim":{"mainsnak":{"snaktype":"value","property":"P1","hash":"","datavalue":{"value":{"entity-type":"item","numeric-id":1,"id":"Q1"},"type":"wikibase-entityid"},"datatype":"wikibase-item"},"type":"statement","qualifiers":{"P1":[{"snaktype":"value","property":"P1111","hash":"050a39e5b316e486dc21d365f7af9cde9ad25a3e","datavalue":{"value":{"amount":"+8937","unit":"1","upperBound":"+8937","lowerBound":"+8937"},"type":"quantity"},"datatype":"quantity"}]},"qualifiers-order":["P1"],"id":"","rank":"normal"}}
			callback(data, error);
		}, POST_data, session);
	}

	function remove_qualifiers(GUID, qualifier, callback, options, API_URL,
			session, exists_qualifiers) {
		// console.trace(exists_qualifiers);

		var qualifier_list = exists_qualifiers
				&& exists_qualifiers[qualifier.property];
		if (!Array.isArray(qualifier_list)) {
			var error = 'remove_qualifiers: No property [' + qualifier.property
					+ '] found!';
			library_namespace.error(error);
			callback(undefined, new Error(error));
			return;
		}

		if (qualifier.value_processor)
			qualifier.value_processor(qualifier_list);

		var qualifier_hashs = qualifier_list.map(function(qualifier) {
			return qualifier.hash;
		}).join('|');

		var POST_data = {
			// TODO: baserevid
			claim : GUID,
			qualifiers : qualifier_hashs
		};

		append_parameters(POST_data, options);
		// console.trace(session.token);

		wiki_API.query([ API_URL, 'action=wbremovequalifiers' ],
		// https://www.wikidata.org/w/api.php?action=help&modules=wbremovequalifiers
		function handle_result(data, error) {
			error = wiki_API.query.handle_error(data, error);
			// 檢查伺服器回應是否有錯誤資訊。
			if (error) {
				library_namespace.error('remove_qualifiers: ' + error);
			}
			// console.trace(data);
			// console.trace(JSON.stringify(data));
			// data = { pageinfo: { lastrevid: 1 }, success: 1 }
			callback(data, error);
		}, POST_data, session);
	}

	// 量詞/限定詞
	function set_qualifiers(GUID, property_data, callback, options, API_URL,
			session, exists_qualifiers) {
		// console.trace(property_data);
		// console.trace(options);

		normalize_wikidata_properties(property_data.qualifiers, function(
				qualifiers) {
			if (!Array.isArray(qualifiers)) {
				if (qualifiers) {
					library_namespace
							.error('set_qualifiers: Invalid qualifiers: '
									+ JSON.stringify(qualifiers));
				} else {
					// assert: 本次沒有要設定 qualifiers 的資料。
				}
				callback();
				return;
			}

			// console.log(JSON.stringify(property_data.qualifiers));
			// console.log(property_data.qualifiers);

			// console.log(JSON.stringify(qualifiers));
			// console.trace(qualifiers);

			var qualifier_index = 0, latest_data_with_claim;
			function set_next_qualifier(data, error) {
				// console.trace([ qualifier_index, qualifiers, error ]);
				if (data && data.claim)
					latest_data_with_claim = data;
				if (error || qualifier_index === qualifiers.length) {
					// console.trace([ data, error ]);
					callback(data, error);
					return;
				}

				var qualifier = qualifiers[qualifier_index++];
				if (typeof qualifier === 'function') {
					qualifier = qualifier(latest_data_with_claim
							&& latest_data_with_claim.claim
							// 警告: 這並非最新資料!
							&& latest_data_with_claim.claim.qualifiers
							|| exists_qualifiers);
				}
				// console.trace(qualifier);
				if (value_is_to_remove(qualifier)) {
					remove_qualifiers(GUID, qualifier, set_next_qualifier,
							options, API_URL, session, exists_qualifiers);
					return;
				}

				set_single_qualifier(GUID, qualifier, set_next_qualifier,
						options, API_URL, session);
			}
			set_next_qualifier();

		}, exists_qualifiers
		// 確保會設定 .remove / .exists_index = duplicate_index。
		|| Object.create(null),
		//
		Object.assign({
			language : property_data.qualifiers.language
					|| get_property(property_data, 'language') || options
					&& options.language,
			// [KEY_SESSION]
			session : session
		}));
	}

	// ----------------------------------------------------

	function set_single_references(GUID, references, callback, options,
			API_URL, session, exists_references) {
		// console.log(references);
		// console.trace(JSON.stringify(references));
		var POST_data = {
			// TODO: baserevid
			statement : GUID,
			snaks : JSON.stringify(references)
		};

		if (options.reference_index >= 0) {
			POST_data.index = options.reference_index;
		}

		append_parameters(POST_data, options);

		wiki_API.query([ API_URL, {
			action : 'wbsetreference'
		} ],
		// https://www.wikidata.org/w/api.php?action=help&modules=wbsetreference
		function handle_result(data, error) {
			error = wiki_API.query.handle_error(data, error);
			// console.log(data);
			// console.log(JSON.stringify(data));
			// 檢查伺服器回應是否有錯誤資訊。
			if (error) {
				// e.g., set_single_references: [failed-save] Edit conflict.
				library_namespace.error('set_single_references: ' + error);
			}
			// data =
			// {"pageinfo":{"lastrevid":1},"success":1,"reference":{"hash":"123abc..","snaks":{...},"snaks-order":[]}}
			callback(data, error);

		}, POST_data, session);
	}

	function remove_references(GUID, reference_data, callback, options,
			API_URL, session, exists_references) {
		// console.trace(reference_data);
		// console.trace(exists_references);

		if (reference_data.value_processor)
			reference_data.value_processor(reference_list);

		var POST_data = {
			// TODO: baserevid
			statement : GUID,
			references : reference_data.reference_hash
		};

		append_parameters(POST_data, options);
		// console.trace(session.token);
		// console.trace(POST_data);

		wiki_API.query([ API_URL, 'action=wbremovereferences' ],
		// https://www.wikidata.org/w/api.php?action=help&modules=wbremovereferences
		function handle_result(data, error) {
			error = wiki_API.query.handle_error(data, error);
			// 檢查伺服器回應是否有錯誤資訊。
			if (error) {
				library_namespace.error('remove_referencess: ' + error);
			}
			// console.trace(data);
			// console.trace(JSON.stringify(data));
			// data = { pageinfo: { lastrevid: 1 }, success: 1 }
			callback(data, error);
		}, POST_data, session);

	}

	/**
	 * references: {Pid:value}
	 * 
	 * @inner only for set_claims()
	 */
	function set_references(GUID, property_data, callback, options, API_URL,
			session, exists_references) {
		// console.trace(property_data);

		normalize_wikidata_properties(property_data, function(references) {
			if (!Array.isArray(references)) {
				var error;
				if (references) {
					var error = new Error(
							'set_references: Invalid references: '
									+ JSON.stringify(references));
					library_namespace.error(error);
				} else {
					// assert: 本次沒有要設定 references 的資料。
				}
				callback(exists_references, error);
				return;
			}

			// console.trace(references);
			// console.trace(exists_references);

			// ----------------------------------

			// e.g., references:[{P1:'',language:'zh'},{P2:'',references:{}}]
			property_data.references = references;

			// console.log(references);

			// console.log(JSON.stringify(property_data.references));
			// console.log(property_data.references);

			var references_snaks = [];
			function serialize_reference(reference_data) {
				if (value_is_to_remove(reference_data)) {
					if (!exists_references || exists_references.length === 0) {
						library_namespace.error(
						//		
						'set_references: No reference to remove.');
						return;
					}

					var index = reference_data.reference_index >= 0
					//
					? reference_data.reference_index
					// default: remove latest reference
					: exists_references.length - 1;
					if (!exists_references[index]) {
						library_namespace.error(
						//		
						'set_references: No reference[' + index
								+ '] to remove.');
						return;
					}

					reference_data.reference_hash =
					//
					exists_references[index].hash;
					references_to_remove.push(reference_data);
					return;
				}

				if (reference_data.snaks) {
					// reference_data.snaks.forEach(serialize_reference);
					references_snaks.push(reference_data.snaks);
				} else if (!reference_data.property) {
					library_namespace
							.error('set_references: Invalid references: '
									+ JSON.stringify(reference_data));
				} else if (references[reference_data.property]) {
					references[reference_data.property].push(reference_data);
				} else {
					references[reference_data.property] = [ reference_data ];
				}
			}

			references = Object.create(null);
			property_data.references.forEach(serialize_reference);

			// ----------------------------------

			var reference_index = 0, references_to_remove = [];
			var latest_data_with_claim = exists_references;
			function remove_next_references(data, error) {
				if (error) {
					callback(data || latest_data_with_claim, error);
					return;
				}

				latest_data_with_claim = data;
				if (reference_index === references_to_remove.length) {
					process_next_references_snaks();
					return;
				}

				remove_references(GUID,
						references_to_remove[reference_index++],
						remove_next_references, options, API_URL, session,
						exists_references);
			}

			// console.trace(references);
			remove_next_references();

			// ----------------------------------

			function process_next_references_snaks(data, error) {
				if (references_snaks.length > 0) {
					set_single_references(GUID, references_snaks.shift(),
							process_next_references_snaks, options, API_URL,
							session, exists_references);
					return;
				}

				if (library_namespace.is_empty_object(references)) {
					callback(data || latest_data_with_claim, error);
					return;
				}

				latest_data_with_claim = data;
				set_single_references(GUID, references, callback, options,
						API_URL, session, exists_references);
			}

		}, exists_references && exists_references[0].snaks
		// 確保會設定 .remove / .exists_index = duplicate_index。
		|| Object.create(null),
		//
		Object.assign({
			// .process_sub_property 指的是可以全部刪除的，即 .references。
			process_sub_property : 'references',
			language : property_data.references.language
					|| get_property(property_data, 'language') || options
					&& options.language,
			// [KEY_SESSION]
			session : session
		}));
	}

	// ----------------------------------------------------

	/**
	 * remove/delete/刪除 property/claims
	 * 
	 * @inner only for set_claims()
	 */
	function remove_claims(exists_property_list, callback, options, API_URL,
			session, index) {
		if (index === wikidata_edit.remove_all) {
			// delete one by one
			index = exists_property_list.length;
			var remove_next_claim = function() {
				if (index-- > 0) {
					remove_claims(exists_property_list, remove_next_claim,
							options, API_URL, session, index);
				} else {
					callback();
				}
			};
			remove_next_claim();
			return;
		}

		library_namespace.debug('delete exists_property_list[' + index + ']: '
				+ JSON.stringify(exists_property_list[index]), 1,
				'remove_claims');
		var POST_data = {
			claim : exists_property_list[index].id
		};

		append_parameters(POST_data, options);

		wiki_API.query([ API_URL, {
			action : 'wbremoveclaims'
		} ], function handle_result(data, error) {
			error = wiki_API.query.handle_error(data, error);
			// console.log(data);
			// 檢查伺服器回應是否有錯誤資訊。
			if (error) {
				library_namespace.error('remove_claims: ' + error);
			}
			// data =
			// {pageinfo:{lastrevid:1},success:1,claims:['Q1$123-ABC']}
			callback(data, error);
		}, POST_data, session);
	}

	/**
	 * edit property/claims
	 * 
	 * @inner only for wikidata_edit()
	 */
	function set_claims(data, token, callback, options, session, entity) {
		library_namespace.debug('normalize data: ' + JSON.stringify(data), 3,
				'set_claims');

		if (!data.claims) {
			library_namespace.debug(
					'把所有不是正規屬性的當作是 claims property key，搬到 data.claims。'
							+ '正規屬性留在原處。', 5, 'set_claims');
			data.claims = Object.create(null);
			for ( var key in data) {
				if (!(key in entity_properties)) {
					data.claims[key] = data[key];
					delete data[key];
				}
			}
		}
		if (library_namespace.is_empty_object(data.claims)) {
			delete data.claims;
		}

		var POST_data = {
			entity : options.id || entity && entity.id,
			// placeholder 佔位符
			property : null,
			snaktype : null,
			value : null
		},
		// action to set properties. 創建Wikibase陳述。
		// https://www.wikidata.org/w/api.php?action=help&modules=wbcreateclaim
		claim_action = [ get_data_API_URL(options), {
			action : 'wbcreateclaim'
		} ],
		/** {Number}process to what index of {Array}claims */
		claim_index = 0;

		if (!POST_data.entity) {
			// console.log(options);
			if (!options.title) {
				throw new Error('set_claims: No entity id specified!');
			}

			// 取得 id
			wikidata_entity({
				site : options.site,
				title : decodeURIComponent(options.title)
			}, function(_entity, error) {
				if (error) {
					callback(undefined, error);
					return;
				}
				// console.log(_entity);
				options = Object.assign({
					id : _entity.id
				}, options);
				delete options.site;
				delete options.title;
				set_claims(data, token, callback,
				//
				options, session, entity && entity.claims ? entity : _entity);
			},
			// 若是未輸入 entity，那就取得 entity 內容以幫助檢查是否已存在相同屬性值。
			Object.assign(entity && entity.claims ? {
				props : ''
			} : Object.create(null), options));
			return;
		}

		if (!entity || !entity.claims) {
			library_namespace.debug('未輸入 entity 以供檢查是否已存在相同屬性值。', 1,
					'set_claims');
		}

		// TODO: 可結合成 wbsetclaim
		// https://www.wikidata.org/w/api.php?action=help&modules=wbsetclaim

		append_parameters(POST_data, options);

		// the token should be sent as the last parameter.
		POST_data.token = token;

		var set_next_claim = function() {
			var claims = data.claims;
			// assert: {Array}claims
			// console.trace(data.claims);
			library_namespace.debug('claims: ' + JSON.stringify(claims), 3,
					'set_next_claim');
			// console.log(claim_index + '-'.repeat(60));
			// console.log(data);
			// console.log(claims);
			if (claim_index === claims.length) {
				library_namespace.debug('done. 已處理完所有能處理的。 callback();', 2,
						'set_next_claim');
				// 去除空的設定。
				if (library_namespace.is_empty_object(data.claims)) {
					delete data.claims;
				}

				// console.log('' + callback);
				callback();
				return;
			}

			var property_data = claims[claim_index];
			if (!property_data) {
				// Should not go to here!
				library_namespace
						.error('set_next_claim: No property_data get!');
				console.trace([ claim_index, claims ]);
				shift_to_next();
				return;
			}
			var mainsnak = property_data.mainsnak || property_data, property_id = mainsnak.property, exists_property_list = entity
					&& entity.claims && entity.claims[property_id];
			// console.trace([ property_id, mainsnak, property_data ]);

			if (property_data.remove === wikidata_edit.remove_all) {
				// assert: 有此屬性id
				// delete: {P1:CeL.wiki.edit_data.remove_all}
				library_namespace.debug(
						'delete ' + property_id + ' one by one', 1,
						'set_next_claim');
				remove_claims(exists_property_list, shift_to_next, POST_data,
						claim_action[0], session, property_data.remove);
				return;
			}

			// ((true >= 0))
			if (typeof property_data.remove === 'number'
					&& property_data.remove >= 0) {
				// delete: {P1:value,remove:true}
				library_namespace.debug('delete ' + property_id + '['
						+ property_data.remove + ']', 1, 'set_next_claim');
				remove_claims(exists_property_list, shift_to_next, POST_data,
						claim_action[0], session, property_data.remove);
				return;
			}

			if (value_is_to_remove(property_data)) {
				library_namespace.error('set_next_claim: Invalid .remove ['
						+ property_data.remove + '].');
				shift_to_next();
				return;
			}

			if (property_data.exists_index >= 0) {
				library_namespace.debug('Skip ' + property_id + '['
						+ property_data.exists_index + ']: 此屬性已存在相同值 ['
						+ wikidata_datavalue(property_data) + ']'
						+ (options.force_add_sub_properties
						//
						? '，但依舊處理其 rank / qualifiers / references 設定' : '')
						+ '。', 1, 'set_next_claim');
				// console.trace([ property_data, claims ]);

				if (!options.force_add_sub_properties || !property_data.rank
						&& !property_data.qualifiers
						&& !property_data.references) {
					// default: 跳過已存在相同屬性值之 rank / qualifiers / references 設定。
					// 因為此時 rank / qualifiers / references 可能為好幾組設定，不容易分割排除重複
					// rank / qualifiers / references，結果將會造成重複輸入。
					shift_to_next();
					return;
				}

				var process_references = function process_references() {
					if (!property_data.references) {
						shift_to_next();
						return;
					}

					// 即使已存在相同屬性值，依然添增/處理其 references 設定。
					var exists_references = entity.claims[property_id][property_data.exists_index].references;
					// console.trace(exists_references);
					set_references(
							exists_property_list[property_data.exists_index].id,
							property_data, shift_to_next, POST_data,
							claim_action[0], session,
							// should use .references[*].snaks
							exists_references);
				};

				var process_qualifiers = function process_qualifiers(result,
						error) {
					if (!error && result && result.claim)
						entity.claims[property_id][property_data.exists_index] = result.claim;
					// 即使已存在相同屬性值，依然添增/處理其 qualifiers 設定。
					var exists_qualifiers = entity.claims[property_id][property_data.exists_index].qualifiers;
					// console.trace(exists_qualifiers);
					// console.trace(property_data);
					POST_data.language = get_property(property_data, 'language')
							|| data.language;
					if (property_data.qualifiers) {
						set_qualifiers(
								exists_property_list[property_data.exists_index].id,
								property_data, process_references, POST_data,
								claim_action[0], session,
								// should use .qualifiers[*].snaks
								exists_qualifiers);
					} else {
						process_references();
					}
				};

				var process_rank = function process_rank() {
					// 即使已存在相同屬性值，依然添增/處理其 rank 設定。
					var exists_rank = entity.claims[property_id][property_data.exists_index].rank;
					// console.trace(exists_rank);
					// console.trace(property_data);
					if (property_data.rank
							&& property_data.rank !== exists_property_list[property_data.exists_index].rank) {
						// TODO: using
						// https://www.wikidata.org/w/api.php?action=help&modules=wbsetclaim
						set_rank(
								exists_property_list[property_data.exists_index],
								property_data, process_qualifiers, POST_data,
								claim_action[0], session, exists_rank);
					} else {
						process_qualifiers();
					}
				};

				process_rank();

				return;
			}

			POST_data.property = property_id;
			// 照 datavalue 修改 POST_data。
			POST_data.snaktype = mainsnak.snaktype;
			if (POST_data.snaktype === 'value') {
				POST_data.value = JSON.stringify(mainsnak.datavalue.value);
			} else {
				// 不直接刪掉 POST_data.value，因為此值為 placeholder 佔位符。
				POST_data.value = '';
			}

			// console.log(JSON.stringify(POST_data));
			// console.trace(POST_data);

			wiki_API.query(claim_action, function handle_result(_data, error) {
				/**
				 * e.g., <code>
				_data: { pageinfo: { lastrevid: 000 }, success: 1, claim: { mainsnak: { ... }, type: 'statement', id: 'Q...', rank: 'normal' } }
				</code>
				 */
				// console.trace(_data);
				error = wiki_API.query.handle_error(_data, error);
				// console.trace([ error, property_data ]);
				// console.trace(data);
				if (data.language)
					POST_data.language = data.language;
				// console.trace(POST_data);
				// 檢查伺服器回應是否有錯誤資訊。
				if (error) {
					/**
					 * e.g., <code>
					set_next_claim: [invalid-entity-id] Invalid entity ID. (The serialization "読み仮名" is not recognized by the configured id builders)
					</code>
					 */
					try {
						library_namespace.error('set_next_claim: ' + error);
						library_namespace.warn('claim_action: '
								+ JSON.stringify(claim_action));
						library_namespace.warn('data to write: '
								+ JSON.stringify(POST_data));
					} catch (e) {
					}
					// console.log(claim_index);
					// console.log(claims);
					claim_index++;
					set_next_claim();
					return;
				}

				process_rank();

				function process_rank() {
					if (property_data.rank
							&& property_data.rank !== _data.claim.rank) {
						library_namespace.debug('設定完主要數值，接著設定 rank。', 1,
								'set_next_claim');
						set_rank(_data.claim, property_data,
								process_qualifiers, POST_data, claim_action[0],
								session);

					} else {
						process_qualifiers();
					}
				}

				function process_qualifiers(result, error) {
					if (!error && result && result.claim)
						_data.claim = result.claim;
					if (property_data.qualifiers) {
						library_namespace.debug(
								'設定完主要數值 / rank，接著設定 qualifiers。', 1,
								'set_next_claim');
						set_qualifiers(_data.claim.id, property_data,
								process_references, POST_data, claim_action[0],
								session);

					} else {
						process_references();
					}
				}

				function process_references() {
					if (property_data.references) {
						// _data =
						// {"pageinfo":{"lastrevid":00},"success":1,"claim":{"mainsnak":{"snaktype":"value","property":"P1","datavalue":{"value":{"text":"name","language":"zh"},"type":"monolingualtext"},"datatype":"monolingualtext"},"type":"statement","id":"Q1$1-2-3","rank":"normal"}}

						library_namespace.debug(
								'設定完主要數值 / rank / qualifiers，接著設定 references。',
								1, 'set_next_claim');
						set_references(_data.claim.id, property_data,
								shift_to_next, POST_data, claim_action[0],
								session);

					} else {
						shift_to_next();
					}
				}

			}, POST_data, session);
			// console.log('set_next_claim: Waiting for ' + claim_action);
		},
		//
		shift_to_next = function() {
			var claims = data.claims;
			library_namespace.debug(claim_index + '/' + claims.length, 3,
					'shift_to_next');
			// 排掉能處理且已經處理完畢的 claim。
			if (claim_index === 0) {
				claims.shift();
			} else {
				// assert: claim_index>0
				claims.splice(claim_index, 1);
			}
			set_next_claim();
		};

		// 先正規化再 edit。
		normalize_wikidata_properties(data.claims, function(claims) {
			if (!Array.isArray(claims)) {
				if (claims) {
					library_namespace.error('set_claims: Invalid claims: '
							+ JSON.stringify(claims));
				} else {
					// assert: 本次沒有要設定 claim 的資料。
				}
				callback();
				return;
			}

			// e.g., claims:[{P1:'',language:'zh'},{P2:'',references:{}}]
			data.claims = claims;

			// console.log(data.claims);
			// console.trace(JSON.stringify(data.claims));
			set_next_claim();
		}, entity && entity.claims
		// 確保會設定 .remove / .exists_index = duplicate_index。
		|| Object.create(null),
		//
		Object.assign({
			language : data.language,
			// [KEY_SESSION]
			session : session
		}, options));
	}

	if (false) {
		// examples

		// Cache the id of "隸屬於" first. 先快取必要的屬性id值。
		CeL.wiki.data.search.use_cache('隸屬於', function(id_list) {
			// Get the id of property '隸屬於' first.
			// and here we get the id of '隸屬於': "P31"
			CeL.log(id_list);
			// 執行剩下的程序. run rest codes.
		}, {
			must_callback : true,
			type : 'property'
		});

		// ----------------------------
		// rest codes:

		// Set up the wiki instance.
		var wiki = CeL.wiki.login(user_name, password, 'zh');

		wiki.data('維基數據沙盒2', function(data_JSON) {
			CeL.wiki.data.search.use_cache('隸屬於', function(id_list) {
				data_JSON.value('隸屬於', {
					// resolve wikibase-item
					resolve_item : true
				}, function(entity) {
					// get "Wikidata Sandbox"
					CeL.log(entity.value('label', 'en'));
				});
			}, {
				must_callback : true,
				type : 'property'
			});
		});

		// If we have run CeL.wiki.data.search.use_cache('隸屬於')
		// first or inside it...
		wiki.data('維基數據沙盒2', function(data_JSON) {
			data_JSON.value('隸屬於', {
				// resolve wikibase-item
				resolve_item : true
			}, function(entity) {
				// get "Wikidata Sandbox"
				CeL.log(entity.value('label', 'en'));
			});
		});

		// Old style. The same effect as codes above.
		wiki.data('維基數據沙盒2', function(data_JSON) {
			// Here we are running the callback.
			CeL.wiki.data.search.use_cache('隸屬於', function(id_list) {
				wiki.data(data_JSON.value('隸屬於'), function(entity) {
					// via wikidata_entity_value()
					// get "维基数据测试沙盒"
					CeL.log(entity.value('label'));
				});
			}, {
				must_callback : true,
				type : 'property'
			});
		});

		wiki.data('維基數據沙盒2', function(data_JSON) {
			wiki.data(data_JSON.value('隸屬於'), function(entity) {
				// via wikidata_entity_value()
				// get "维基数据测试沙盒"
				CeL.log(entity.value('label'));
			});
		});

		// edit properties
		wiki.edit_data(function(entity) {
			// add new / set single value with references
			return {
				生物俗名 : '維基數據沙盒2',
				language : 'zh-tw',
				references : {
					臺灣物種名錄物種編號 : 123456,
					// [[d:Special:AbuseFilter/54]]
					// 導入自 : 'zhwiki',
					載於 : '臺灣物種名錄物種',
					來源網址 : 'https://www.wikidata.org/',
					檢索日期 : new Date
				}
			};

			// set multiple values
			return {
				labels : {
					ja : 'ウィキデータ・サンドボックス2',
					'zh-tw' : [ '維基數據沙盒2', '維基數據沙盒#2', '維基數據沙盒-2' ]
				},
				descriptions : {
					'zh-tw' : '作為沙盒以供測試功能'
				},
				claims : [ {
					生物俗名 : [ 'SB2#1', 'SB2#2', 'SB2#3' ],
					multi : true,
					language : 'zh-tw',
					references : {
						臺灣物種名錄物種編號 : 123456
					}
				}, {
					読み仮名 : 'かな',
					language : 'ja',
					references : {
						// P143
						'imported from Wikimedia project' : 'jawikipedia'
					}
				} ]
			};

			// remove specified value 生物俗名=SB2
			return {
				生物俗名 : 'SB2',
				language : 'zh-tw',
				remove : true
			};

			// to remove ALL "生物俗名"
			return {
				生物俗名 : CeL.wiki.edit_data.remove_all,
				language : 'zh-tw'
			};

		}, {
			bot : 1,
			summary : 'bot test: edit properties'
		});

		// ----------------------------

		// add property/claim to Q13406268
		wiki.data('維基數據沙盒2', function(data_JSON) {
			data_JSON;
		}).edit_data(function(entity) {
			return {
				生物俗名 : '維基數據沙盒2',
				language : 'zh-tw'
			};
		}, {
			bot : 1,
			summary : 'bot test: edit property'
		});

		// delete property/claim (all 生物俗名)
		wiki.data('維基數據沙盒2', function(data_JSON) {
			data_JSON;
		}).edit_data(function(entity) {
			return {
				生物俗名 : CeL.wiki.edit_data.remove_all,
				language : 'zh-tw'
			};
		}, {
			bot : 1,
			summary : 'bot test: edit property'
		});

		// delete property/claim (生物俗名=維基數據沙盒2)
		wiki.data('維基數據沙盒2', function(data_JSON) {
			data_JSON;
		}).edit_data(function(entity) {
			return {
				生物俗名 : '維基數據沙盒2',
				language : 'zh-tw',
				remove : true
			};
		}, {
			bot : 1,
			summary : 'bot test: edit property'
		});

		wiki.data('維基數據沙盒2', function(data_JSON) {
			data_JSON;
		}).edit_data(function(entity) {
			return {
				生物俗名 : '維基數據沙盒2',
				language : 'zh-tw',
				references : {
					臺灣物種名錄物種編號 : 123456,
					// [[d:Special:AbuseFilter/54]]
					// 導入自 : 'zhwiki',
					載於 : '臺灣物種名錄物種',
					來源網址 : 'https://www.wikidata.org/',
					檢索日期 : new Date
				}
			};
		}, {
			bot : 1,
			summary : 'bot test: edit property'
		});

		// ----------------------------

		// using [,'2008 Canadian federal election'] or {en:'2008 Canadian
		// federal election'} to search the entity named '2008 Canadian federal
		// election' in English, else will treat as plain text '2008 Canadian
		// federal election'

		// remove claim: 'candidacy in election'
		// = '2008 Canadian federal election'
		wiki.data('Wikidata Sandbox 2', function(data) {
			result = data;
		}).edit_data(function(entity) {
			return {
				'candidacy in election' :
				//
				[ , '2008 Canadian federal election' ],
				remove : true,
				language : 'en'
			};
		}, {
			bot : 1,
			summary : 'bot test: edit property'
		});

		// create claim: 'candidacy in election'
		// = '2008 Canadian federal election' with qualifiers and references
		wiki.data('Wikidata Sandbox 2', function(data) {
			result = data;
		}).edit_data(function(entity) {
			return {
				'candidacy in election' :
				//
				[ , '2008 Canadian federal election' ],
				qualifiers : {
					'votes received' : 8937,
					'electoral district' : 'Terrebonne—Blainville',
					'parliamentary group' : 'Liberal Party of Canada'
				},
				references : {
					'reference URL' : "http://example.com/",
					publisher : 'Library of Parliament (Canada)',
					retrieved : new Date
				},
				language : 'en'
			};
		}, {
			bot : 1,
			summary : 'bot test: edit property'
		});

		// remove 'votes received' of claim: 'candidacy in election'
		// = '2008 Canadian federal election'
		wiki.data('Wikidata Sandbox 2', function(data) {
			result = data;
		}).edit_data(function(entity) {
			return {
				'candidacy in election' :
				//
				[ , '2008 Canadian federal election' ],
				qualifiers : {
					'votes received' : {
						remove : true
					}
				},
				language : 'en'
			};
		}, {
			bot : 1,
			summary : 'bot test: edit property',
			force_add_sub_properties : true
		});

		// add 'votes received' of claim: 'candidacy in election'
		// = '2008 Canadian federal election'
		wiki.data('Wikidata Sandbox 2', function(data) {
			result = data;
		}).edit_data(function(entity) {
			return {
				'candidacy in election' :
				//
				[ , '2008 Canadian federal election' ],
				qualifiers : {
					'votes received' : 8938
				},
				language : 'en'
			};
		}, {
			bot : 1,
			summary : 'bot test: edit property',
			force_add_sub_properties : true
		});

		// remove 'parliamentary group' of claim: 'candidacy in election'
		// = '2008 Canadian federal election'
		wiki.data('Wikidata Sandbox 2', function(data) {
			result = data;
		}).edit_data(function(entity) {
			return {
				'candidacy in election' :
				//
				[ , '2008 Canadian federal election' ],
				qualifiers : {
					'parliamentary group' : {
						remove : true
					}
				},
				language : 'en'
			};
		}, {
			bot : 1,
			summary : 'bot test: edit property',
			force_add_sub_properties : true
		});

		// add 'member of political party' of claim: 'candidacy in election'
		// = '2008 Canadian federal election'
		wiki.data('Wikidata Sandbox 2', function(data) {
			result = data;
		}).edit_data(function(entity) {
			return {
				'candidacy in election' :
				//
				[ , '2008 Canadian federal election' ],
				qualifiers : {
					'member of political party' : 'Liberal Party of Canada'
				},
				language : 'en'
			};
		}, {
			bot : 1,
			summary : 'bot test: edit property',
			force_add_sub_properties : true
		});

		// remove ALL references of claim: 'candidacy in election'
		// = '2008 Canadian federal election'
		wiki.data('Wikidata Sandbox 2', function(data) {
			result = data;
		}).edit_data(function(entity) {
			return {
				'candidacy in election' :
				//
				[ , '2008 Canadian federal election' ],
				references : {
					remove : true
				},
				language : 'en'
			};
		}, {
			bot : 1,
			summary : 'bot test: edit property',
			force_add_sub_properties : true
		});
	}

	// ----------------------------------------------------

	// TODO:
	// data.labels + data.aliases:
	// {language_code:[label,{value:label,language:language_code,remove:''},...],...}
	// or will auto-guess language 未指定語言者將會自動猜測:
	// [label,{value:label,language:language_code,remove:''},{value:label,remove:''}]
	// or
	// [ [language_code,label], [language_code,label], ... ]
	//
	// 正規化 →
	// {language_code:[label_1,label_2,...],...}
	//
	// 去掉重複的標籤 →
	// {language_code:[label_1,label_2,...],...}
	// + .remove: {language_code:[label_1,label_2,...],...}
	//
	// → data.labels = {language_code:{value:label,language:language_code},...}
	// + data.aliases =
	// {language_code:[{value:label,language:language_code}],...}

	// adjust 調整 labels to aliases
	// @see wikidata_edit.add_labels
	function normalize_labels_aliases(data, entity, options) {
		var label_data = data.labels;
		if (typeof label_data === 'string') {
			label_data = [ label_data ];
		}

		if (library_namespace.is_Object(label_data)) {
			// assert: 調整 {Object}data.labels。
			// for
			// {en:[{value:label,language:language_code},{value:label,language:language_code},...]}
			var labels = [];
			for ( var language in label_data) {
				var label = label_data[language];
				if (Array.isArray(label)) {
					label.forEach(function(l) {
						// assert: {Object}l
						labels.push({
							language : language,
							value : l
						});
					});
				} else {
					labels.push(typeof label === 'string' ? {
						language : language,
						value : label
					}
					// assert: {Object}label || [language,label]
					: label);
				}
			}
			label_data = labels;

		} else if (!Array.isArray(label_data)) {
			if (label_data !== undefined) {
				// error?
			}
			return;
		}

		// assert: {Array}label_data = [label,label,...]

		// for
		// [{value:label,language:language_code},{value:label,language:language_code},...]

		// 正規化 →
		// labels = {language_code:[label_1,label_2,...],...}
		var labels = Object.create(null),
		// 先指定的為主labels，其他多的labels放到aliases。
		aliases = data.aliases || Object.create(null),
		// reconstruct labels
		error_list = label_data.filter(function(label) {
			if (!label && label !== '') {
				// Skip null label.
				return;
			}

			if (typeof label === 'string') {
				label = {
					language : wiki_API.site_name(options, {
						get_all_properties : true
					}).language || guess_language(label),
					value : label
				};
			} else if (is_api_and_title(label, 'language')) {
				label = {
					language : label[0] || guess_language(label[1]),
					value : label[1]
				};
			} else if (!label.language
			//
			|| !label.value && !('remove' in label)) {
				library_namespace.error('set_labels: Invalid label: '
						+ JSON.stringify(label));
				return true;
			}

			if (!(label.language in labels) && entity && entity.labels
					&& entity.labels[label.language]) {
				labels[label.language]
				// 不佚失原label。
				= entity.labels[label.language].value;
			}

			if (!labels[label.language] || !labels[label.language].value
			//
			|| ('remove' in labels[label.language])) {
				// 設定成為新的值。
				labels[label.language] = label;
				return;
			}

			// 先指定的為主labels，其他多的labels放到aliases。
			if (aliases[label.language]) {
				// assert: Array.isArray(aliases[label.language])
				aliases[label.language].push(label);
			} else {
				aliases[label.language] = [ label ];
			}
		});

		// 去除空的設定。
		if (library_namespace.is_empty_object(labels)) {
			delete data.labels;
		} else {
			data.labels = labels;
		}

		if (library_namespace.is_empty_object(aliases)) {
			delete data.aliases;
		} else {
			data.aliases = aliases;
		}

		// return error_list;
	}

	/**
	 * edit labels
	 * 
	 * @inner only for wikidata_edit()
	 */
	function set_labels(data, token, callback, options, session, entity) {
		if (!data.labels) {
			// Nothing to set
			callback();
			return;
		}

		normalize_labels_aliases(data, entity, options);

		var data_labels = data.labels;
		// e.g., data.labels={language_code:label,language_code:[labels],...}
		if (!library_namespace.is_Object(data_labels)) {
			library_namespace.error('set_labels: Invalid labels: '
					+ JSON.stringify(data_labels));
			callback();
			return;
		}

		var labels_to_set = [];
		for ( var language in data_labels) {
			var label = data_labels[language];
			if (!library_namespace.is_Object(label)) {
				library_namespace.error('set_labels: Invalid label: '
						+ JSON.stringify(label));
				continue;
			}

			labels_to_set.push(label);
		}

		if (labels_to_set.length === 0) {
			callback();
			return;
		}

		var POST_data = {
			id : options.id,
			language : '',
			value : ''
		};

		append_parameters(POST_data, options);

		// the token should be sent as the last parameter.
		POST_data.token = token;

		var index = 0,
		// https://www.wikidata.org/w/api.php?action=help&modules=wbsetlabel
		action = [ get_data_API_URL(options), 'action=wbsetlabel' ];

		function set_next_labels() {
			if (index === labels_to_set.length) {
				library_namespace.debug('done. 已處理完所有能處理的。 callback();', 2,
						'set_next_labels');
				// 去除空的設定。
				if (library_namespace.is_empty_object(data.labels)) {
					delete data.labels;
				}

				callback();
				return;
			}

			var label = labels_to_set[index++];
			// assert: 這不會更改POST_data原有keys之順序。
			// Object.assign(POST_data, label);

			POST_data.language = label.language;
			// wbsetlabel 處理 value='' 時會視同 remove。
			POST_data.value = 'remove' in label ? ''
			// assert: typeof label.value === 'string' or 'number'
			: label.value;

			// 設定單一 Wikibase 實體的標籤。
			wiki_API.query(action, function handle_result(data, error) {
				error = wiki_API.query.handle_error(data, error);
				// 檢查伺服器回應是否有錯誤資訊。
				if (error) {
					/**
					 * e.g., <code>

					</code>
					 */
					library_namespace.error('set_next_labels: ' + error);
				} else {
					// successful done.
					delete data_labels[label.language];
				}

				set_next_labels();

			}, POST_data, session);
		}

		set_next_labels();

		// TODO: set sitelinks
		// TODO: 可拆解成 wbsetsitelink
	}

	/**
	 * edit aliases
	 * 
	 * @inner only for wikidata_edit()
	 */
	function set_aliases(data, token, callback, options, session, entity) {
		if (!data.aliases) {
			// Nothing to set
			callback();
			return;
		}

		// console.log(data.aliases);

		var data_aliases = data.aliases, aliases_queue;
		if (Array.isArray(data_aliases)) {
			aliases_queue = data_aliases;
			data_aliases = Object.create(null);
			aliases_queue.forEach(function(alias) {
				// 判別 language。
				var value = alias && alias.value, language = alias.language
						|| options.language || guess_language(value);
				if (language in data_aliases) {
					data_aliases[language].push(alias);
				} else {
					data_aliases[language] = [ alias ];
				}
			});

		} else if (!library_namespace.is_Object(data_aliases)) {
			library_namespace.error('set_aliases: Invalid aliases: '
					+ JSON.stringify(data_aliases));
			callback();
			return;
		}

		aliases_queue = [];
		for ( var language in data_aliases) {
			var alias_list = data_aliases[language];
			if (!Array.isArray(alias_list)) {
				if (alias_list === wikidata_edit.remove_all) {
					// 表示 set。
					aliases_queue.push([ language, [] ]);
				} else if (alias_list && typeof alias_list === 'string') {
					// 表示 set。
					aliases_queue.push([ language, [ alias_list ] ]);
				} else {
					library_namespace.error('set_aliases: Invalid aliases: '
							+ JSON.stringify(alias_list));
				}
				continue;
			}

			var aliases_to_add = [], aliases_to_remove = [];
			alias_list.forEach(function(alias) {
				if (!alias) {
					// 跳過沒東西的。
					return;
				}
				if ('remove' in alias) {
					if (alias.remove === wikidata_edit.remove_all) {
						// 表示 set。這將會忽略所有remove。
						aliases_to_remove = undefined;
					} else if ('value' in alias) {
						if (aliases_to_remove) {
							aliases_to_remove.push(alias.value);
						}
					} else {
						library_namespace
								.error('set_aliases: No value to value for '
										+ language);
					}
				} else if ('set' in alias) {
					// 表示 set。這將會忽略所有remove。
					aliases_to_remove = undefined;
					aliases_to_add = [ alias.value ];
					// 警告:當使用 wbeditentity，並列多個未設定 .add 之 alias 時，
					// 只會加入最後一個。但這邊將會全部加入，因此行為不同！
				} else if (alias.value === wikidata_edit.remove_all) {
					// 表示 set。這將會忽略所有remove。
					aliases_to_remove = undefined;
				} else {
					aliases_to_add.push(alias.value);
				}
			});

			if (aliases_to_add.length > 0 || aliases_to_remove > 0) {
				aliases_queue.push([ language, aliases_to_add.unique(),
						aliases_to_remove && aliases_to_remove.unique() ]);
			}
		}

		if (aliases_queue.length === 0) {
			callback();
			return;
		}

		// console.log(aliases_queue);

		var POST_data = {
			id : options.id,
			language : ''
		// set : '',
		// add : '',
		// remove : ''
		};

		append_parameters(POST_data, options);

		var
		// https://www.wikidata.org/w/api.php?action=help&modules=wbsetaliases
		action = [ get_data_API_URL(options), 'action=wbsetaliases' ];

		function set_next_aliases() {
			if (aliases_queue.length === 0) {
				library_namespace.debug('done. 已處理完所有能處理的。 callback();', 2,
						'set_next_aliases');
				// 有錯誤也已經提醒。
				delete data.aliases;

				callback();
				return;
			}

			var aliases_data = aliases_queue.pop();
			// assert: 這不會更改POST_data原有keys之順序。

			POST_data.language = aliases_data[0];
			if (aliases_data[2]) {
				delete POST_data.set;
				POST_data.add = aliases_data[1].join('|');
				POST_data.remove = aliases_data[2].join('|');
			} else {
				delete POST_data.add;
				delete POST_data.remove;
				POST_data.set = aliases_data[1].join('|');
			}

			// the token should be sent as the last parameter.
			delete POST_data.token;
			POST_data.token = token;

			// 設定單一 Wikibase 實體的標籤。
			wiki_API.query(action, function handle_result(data, error) {
				error = wiki_API.query.handle_error(data, error);
				// 檢查伺服器回應是否有錯誤資訊。
				if (error) {
					/**
					 * e.g., <code>

					</code>
					 */
					library_namespace.error('set_next_aliases: ' + error);
				} else {
					// successful done.
				}

				set_next_aliases();

			}, POST_data, session);
		}

		set_next_aliases();
	}

	/**
	 * edit descriptions
	 * 
	 * @inner only for wikidata_edit()
	 */
	function set_descriptions(data, token, callback, options, session, entity) {
		if (!data.descriptions) {
			// Nothing to set
			callback();
			return;
		}

		// console.log(data.descriptions);

		var data_descriptions = data.descriptions;
		if (typeof data_descriptions === 'string') {
			data_descriptions = [ data_descriptions ];
		}

		if (library_namespace.is_Object(data_descriptions)) {
			// assert: 調整 {Object}data.descriptions。
			// for
			// {en:[{value:label,language:language_code},{value:label,language:language_code},...]}
			var descriptions = [];
			for ( var language in data_descriptions) {
				var description = data_descriptions[language];
				if (Array.isArray(description)) {
					description.forEach(function(d) {
						// assert: {Object}d
						descriptions.push({
							language : language,
							value : d
						});
					});
				} else {
					descriptions.push(typeof description === 'string' ? {
						language : language,
						value : description
					}
					// assert: {Object}description || [language,description]
					: description);
				}
			}
			data_descriptions = descriptions;

		} else if (!Array.isArray(data_descriptions)) {
			if (data_descriptions !== undefined) {
				// error?
			}
			return;
		}

		// 正規化 →
		// descriptions = {language_code:description,...}
		var descriptions = Object.create(null),
		//
		default_lang = session.language || session[KEY_HOST_SESSION].language
				|| wiki_API.language,
		// reconstruct labels
		error_list = data_descriptions.filter(function(description) {
			var language;
			if (typeof description === 'string') {
				language = wiki_API.site_name(options, {
					get_all_properties : true
				}).language || guess_language(description) || default_lang;
			} else if (is_api_and_title(description, 'language')) {
				language = description[0] || guess_language(description[1])
						|| default_lang;
				description = description[1];
			} else if (!description || !description.language
			//
			|| !description.value && !('remove' in description)) {
				library_namespace
						.error('set_descriptions: Invalid descriptions: '
								+ JSON.stringify(description));
				return true;
			} else {
				language = description.language
						|| wiki_API.site_name(options, {
							get_all_properties : true
						}).language || guess_language(description.value)
						|| default_lang;
				if ('remove' in description) {
					description = '';
				} else {
					description = description.value;
				}
			}

			// 設定成為新的值。
			descriptions[language] = description || '';
		});

		// 去除空的設定。
		if (library_namespace.is_empty_object(descriptions)) {
			delete data.descriptions;
			callback();
			return;
		}

		// console.log(descriptions);

		var POST_data = {
			id : options.id,
			language : '',
			value : ''
		};

		append_parameters(POST_data, options);

		// the token should be sent as the last parameter.
		POST_data.token = token;

		var description_keys = Object.keys(descriptions),
		// https://www.wikidata.org/w/api.php?action=help&modules=wbsetdescription
		action = [ get_data_API_URL(options), 'action=wbsetdescription' ];

		function set_next_descriptions() {
			if (description_keys.length === 0) {
				library_namespace.debug('done. 已處理完所有能處理的。 callback();', 2,
						'set_next_descriptions');
				// 有錯誤也已經提醒。
				delete data.descriptions;

				callback();
				return;
			}

			var language = description_keys.pop();
			// assert: 這不會更改POST_data原有keys之順序。

			POST_data.language = language;
			POST_data.value = descriptions[language];

			// 設定單一 Wikibase 實體的標籤。
			wiki_API.query(action, function handle_result(data, error) {
				error = wiki_API.query.handle_error(data, error);
				// 檢查伺服器回應是否有錯誤資訊。
				if (error) {
					/**
					 * e.g., <code>

					{"error":{"code":"failed-save","info":"The save has failed.","messages":[{"name":"wikibase-api-failed-save","parameters":[],"html":{"*":"The save has failed."}},{"name":"abusefilter-warning","parameters":["Adding non-latin script language description in latin script","48"],"html":{"*":"..."}}],"*":"See https://www.wikidata.org/w/api.php for API usage. Subscribe to the mediawiki-api-announce mailing list at &lt;https://lists.wikimedia.org/postorius/lists/mediawiki-api-announce.lists.wikimedia.org/&gt; for notice of API deprecations and breaking changes."},"servedby":"mw1377"}

					</code>
					 */
					library_namespace.error('set_next_descriptions: '
							+ language + '=' + JSON.stringify(POST_data.value)
							+ ': ' + error);
				} else {
					// successful done.
				}

				set_next_descriptions();

			}, POST_data, session);
		}

		set_next_descriptions();
	}

	function set_sitelinks(data, token, callback, options, session, entity) {
		// console.trace(data);
		var sitelinks = data.sitelinks;
		if (library_namespace.is_Object(sitelinks)) {
			// Convert to {Array}
			data.sitelinks = Object.keys(sitelinks).map(function(sitelink) {
				var sitelink_data = sitelinks[sitelink];
				if (typeof sitelink_data === 'string') {
					return {
						site : sitelink,
						title : sitelink_data
					};
				}
				// assert: library_namespace.is_Object(sitelink_data)
				// e.g., {title:'',badges:['',],new:'item'}
				if (!sitelink_data.site) {
					sitelink_data.site = sitelink;
				} else {
					// assert: sitelink_data.site === sitelink
				}
				return sitelink_data;
			});
		}
		// console.trace(data);

		// TODO:
		// https://www.wikidata.org/w/api.php?action=help&modules=wbsetsitelink

		callback();
	}

	// ----------------------------------------------------

	// [ {property:'P1',value:'v1'}, {property:'P1',value:'v2'},
	// {property:'P2',value:'v'} ]
	// →
	// { P1:[ {property:'P1',value:'v1'}, {property:'P1',value:'v2'} ], P2:[
	// {property:'P2',value:'v'} ] }
	// @inner
	function group_by_properties(property_list) {
		if (!property_list || property_list.length === 0)
			return;
		// assert: Array.isArray(property_list)

		if (property_list[0].snaks) {
			// assert: 應為已存在的屬性 claim.references。
			return property_list;
		}

		var property_group = Object.create(null);

		property_list.forEach(function(property_data) {
			var property_id = property_data.property;
			if (!property_group[property_id])
				property_group[property_id] = [];
			property_group[property_id].push(property_data);
		});

		return property_group;
	}

	var KEY_has_new = typeof Symbol === 'function' ? Symbol('options')
			: '\0KEY_has_new';

	function merge_additional_property(old_property, new_property) {
		if (!Array.isArray(old_property)) {
			// assert: {Object}old_property
			old_property = [ old_property ];
		} else {
			old_property = old_property.clone();
		}

		// for remove duplicate
		var exist_property_Map = new Map;
		old_property.forEach(function(property) {
			var property_Object = library_namespace.is_Object(property.snaks)
			//
			? property.snaks : property;

			for ( var property_name in property_Object) {
				if (!PATTERN_property_id.test(property_name)) {
					continue;
				}
				if (exist_property_Map.has(property_name)) {
					// 已存在相同的 property_name。
				}
				exist_property_Map.set(property_name,
						property_Object[property_name]);
				break;
			}
		});

		var insert_to_property_list;
		if (old_property[0].snaks) {
			insert_to_property_list = [];
		} else {
			insert_to_property_list = old_property;
		}

		if (!Array.isArray(new_property)) {
			// assert: {Object}new_property
			new_property = [ new_property ];
		}

		new_property.forEach(function(property) {
			var property_Object = library_namespace.is_Object(property.snaks)
			//
			? property.snaks : property;

			for ( var property_name in property_Object) {
				if (!PATTERN_property_id.test(property_name)) {
					continue;
				}
				var value = wikidata_datavalue(property_Object[property_name]);
				if (exist_property_Map.has(property_name)) {
					library_namespace.log('merge_additional_property: '
							+ '跳過已存在的屬性 ' + property_name + '=' + value);
				} else if (insert_to_property_list) {
					exist_property_Map.set(property_name,
							property_Object[property_name]);
					insert_to_property_list.push(property);
					old_property[KEY_has_new] = true;
				} else {
					library_namespace.log('merge_additional_property: '
							+ '跳過設定屬性 ' + property_name + '=' + value);
				}
				break;
			}
		});

		if (insert_to_property_list !== old_property
				&& insert_to_property_list.length > 0) {
			old_property.push(insert_to_property_list);
		} else if (old_property.length === 1 && old_property[0].snaks) {
			// assert: old_property 為原先已存在之 property。
			old_property = old_property[0];
		}

		return old_property;
	}

	function __merge_duplicate_claim(old_claim, new_claim) {
		// 這個動作也會複製 old_claim.id。
		new_claim = Object.assign(Object.create(null), old_claim, new_claim);

		if (old_claim.qualifiers) {
			new_claim.qualifiers = merge_additional_property(
					old_claim.qualifiers, new_claim.qualifiers);
		} else if (new_claim.qualifiers) {
			new_claim.qualifiers[KEY_has_new] = true;
		}

		if (old_claim.references) {
			new_claim.references = merge_additional_property(
					old_claim.references, new_claim.references);
		} else if (new_claim.references) {
			new_claim.references[KEY_has_new] = true;
		}

		// console.trace(new_claim);
		return new_claim;
	}

	function default_merge_duplicate_claim(old_claim, new_claim, entity) {
		// assert: new_claim.id === undefined
		// && (old_claim.property || old_claim.mainsnak.property) ===
		// (new_claim.property || new_claim.mainsnak.property)
		// && wikidata_datavalue(old_claim) === wikidata_datavalue(new_claim)

		var old_claim_id = old_claim.id;
		var property_id = new_claim.property;
		var value = wikidata_datavalue(new_claim);
		var old_claim_has_additional = /* old_claim.rank || */old_claim.qualifiers
				|| old_claim.references;
		var new_claim_has_additional = /* new_claim.rank || */new_claim.qualifiers
				|| new_claim.references;

		// 重複設定 property_id = value
		if (!new_claim_has_additional) {
			library_namespace.log([
			//
			'default_merge_duplicate_claim: ', {
				T : [
				// gettext_config:{"id":"skip-the-$1-for-$2-and-do-not-set-them-because-the-values-already-exist-and-$3-is-not-set"}
				'跳過 %2 之 %1 設定，因數值已存在且未設定 %3。'
				//
				, [ new_claim.rank ? 'rank' : 0,
				//
				new_claim.qualifiers ? 'qualifiers' : 0,
				//
				new_claim.references ? 'references' : 0
				//
				].filter(function(v) {
					return !!v;
				})
				// gettext_config:{"id":"Comma-separator"}
				.join(gettext('Comma-separator')),
				//
				property_id + ' = ' + value,
				//
				'options.force_add_sub_properties' ]
			} ]);

			return;
		}

		// --------------------------------------

		if (old_claim_id) {
			library_namespace.log('default_merge_duplicate_claim: '
			//
			+ '[[' + entity.id + ']]: 已存在 ' + property_id + '=' + value
			//
			+ (old_claim_has_additional ? ' 且有額外屬性 .qualifiers 或 .references'
			//
			: '') + '，為其添加額外屬性。');

		} else {
			library_namespace.log('default_merge_duplicate_claim: ' + '[['
					+ entity.id + ']]: 重複設定 ' + property_id + '=' + value
					+ '，合併兩者以採用更完整的資料。');
		}

		new_claim = __merge_duplicate_claim(old_claim, new_claim);
		// console.trace(old_claim_id, new_claim);
		if (new_claim.qualifiers && new_claim.qualifiers[KEY_has_new]
				|| new_claim.references && new_claim.references[KEY_has_new]) {
			if (new_claim.qualifiers)
				delete new_claim.qualifiers[KEY_has_new];
			if (new_claim.references)
				delete new_claim.references[KEY_has_new];
			return new_claim;
		}

		library_namespace.log('default_merge_duplicate_claim: ' + '[['
				+ entity.id + ']]: ' + property_id + '=' + value
				+ ' 無新額外屬性以設定。');
	}

	// https://www.wikidata.org/w/api.php?action=help&modules=wbeditentity
	function normalize_wbeditentity_data(data, entity, options, callback) {
		normalize_labels_aliases(data, entity, options);

		/** {Number}process to what index of {Array}claims */
		var claim_index = 0;

		function normalize_next_claim() {
			var claims = data.claims;
			if (claim_index === claims.length) {
				// assert: claims.length > 0
				// console.trace(claims, group_by_properties(claims));
				// data.claims = group_by_properties(claims);
				callback();
				return;
			}

			var property_data = claims[claim_index];
			normalize_wikidata_properties(property_data.qualifiers,
			//
			function(qualifiers) {
				qualifiers = group_by_properties(qualifiers);
				if (qualifiers) {
					// console.trace(property_data.qualifiers, qualifiers);
					property_data.qualifiers = qualifiers;
				} else {
					// e.g.,
					// library_namespace.is_empty_object(property_data.qualifiers)
					delete property_data.qualifiers;
				}
				normalize_wikidata_properties(property_data.references,
				//
				function(references) {
					references = group_by_properties(references);
					if (references) {
						// console.trace(property_data.references, references);
						property_data.references = library_namespace
								.is_Object(references) ? [ {
							snaks : references
						} ] : references;
					} else {
						// e.g.,
						// library_namespace.is_empty_object(property_data.references)
						delete property_data.references;
					}

					claim_index++;
					// 直接 normalize_next_claim(); 的話，有時（同一 property 過多項？）會造成
					// RangeError: Maximum call stack size exceeded 。
					setTimeout(normalize_next_claim, 0);
				}, Object.create(null), options);
			}, Object.create(null), options);
		}

		options = Object.assign({
			language : data.language,
		// [KEY_SESSION]
		// session : session
		}, options);

		var merge_duplicate_claim = options.merge_duplicate_claim
				|| default_merge_duplicate_claim;

		var exists_property_hash = entity && entity.claims;
		// 先正規化再 edit。
		// @see set_claims()
		normalize_wikidata_properties(data.claims, function(claims) {
			if (!Array.isArray(claims)) {
				if (claims) {
					library_namespace.error('normalize_wbeditentity_data:'
							+ ' Invalid claims: ' + JSON.stringify(claims));
				} else {
					// assert: 本次沒有要設定 claim 的資料。
				}

				callback();
				return;
			}

			data.claims = [];

			/**
			 * value_to_modify. 本次設定的值。<br />
			 * value_to_set[property_id] = Map{value=>claim}
			 */
			var value_to_set = Object.create(null);

			// claims: e.g.,
			// claims:[{property:'P1',qualifiers:{P2:''}},{property:'P3',references:{P4:''}}]

			// Remove duplicates.
			claims.forEach(function(new_claim) {
				if (value_is_to_remove(new_claim)) {
					if (new_claim.id) {
						data.claims.push(new_claim);
					} else {
						library_namespace.error('normalize_wbeditentity_data: '
						//
						+ '[[' + entity.id + ']]: 欲刪除 ' + property_id
						//
						+ ' 卻未設定原有 id！' + JSON.stringify(new_claim));
						// property_data = new_claim
					}
					return;
				}

				// ------------------------------

				var property_id = new_claim.property;
				if (!property_id) {
					library_namespace.error('未設定 claim.property！' + '\n'
							+ JSON.stringify(new_claim));
					throw new Error('未設定 claim.property！');
				}

				// 注意: 這邊 wbeditentity_only: true 的行為與
				// wbeditentity_only: false
				// @ process_property_id_list(property_id_list)
				// 的應相同。

				// Detect duplicate.
				if (exists_property_hash) {
					var exists_property_list
					//
					= exists_property_hash[property_id];
					var duplicate_index = wikidata_datavalue.get_index(
							exists_property_list, new_claim);
					if (false) {
						console.trace(new_claim, duplicate_index,
								exists_property_list);
					}

					if (duplicate_index !== NOT_FOUND) {
						var exists_claim
						//
						= exists_property_list[duplicate_index];
						new_claim = merge_duplicate_claim(exists_claim,
								new_claim, entity);
						if (!new_claim)
							return;
					}
				}

				// ------------------------------

				var value = wikidata_datavalue(new_claim);
				// console.trace([ property_id, value ]);
				if (!(property_id in value_to_set)) {
					// 用 {Map} 以防 {Object}value。
					value_to_set[property_id] = new Map;
				} else if (value_to_set[property_id].has(value)) {
					new_claim = merge_duplicate_claim(value_to_set[property_id]
							.get(value), new_claim, entity);
					if (!new_claim)
						return;
				}

				// Register the value set this time. 登記本次設定的值。
				value_to_set[property_id].set(value, new_claim);

				// ------------------------------

				var property_data = new_claim.mainsnak ? new_claim : {
					type : 'statement',
					rank : new_claim.rank || 'normal',
					mainsnak : new_claim
				};

				if (new_claim.qualifiers) {
					property_data.qualifiers = new_claim.qualifiers;
					// delete new_claim.qualifiers;
				}
				if (new_claim.references) {
					property_data.references = new_claim.references;
					// delete new_claim.references;
				}

				data.claims.push(property_data);
			});

			// console.trace(data.claims);
			// console.trace(JSON.stringify(data.claims));
			normalize_next_claim();
		}, exists_property_hash
		// 確保會設定 .remove / .exists_index = duplicate_index。
		|| Object.create(null), options);

	}

	// ----------------------------------------------------

	/**
	 * @example<code>
	//	2021/7/3 18:9:28

	language_string	=	{language:'zh-tw', value:''}
	// simplify → value

	sitelink = {
		site:			'zhwiki',
		title:			'',
		//badges:		['Q17437798']
	}
	// simplify → title??

	snak = {
		snaktype:'value',
		property:		'P00',
		//hash:'R/O',
		datavalue: {
			value:'', type:'string'
			//value:{'entity-type':'item','id':'Q000'}, type:'wikibase-entityid'
		},
		//datatype:	'可省略'
	}
	// simplify → string, {Date}, number, ...

	snaks = {
		//hash:'R/O'
		snaks:			[ snak, ],
		//snaks-order:	[ 'P00', ]
	}

	claim = {
		mainsnak:		snak,
		type:			'statement',
		qualifiers:		[ snak, ],
		//qualifiers-order: [ 'P00', ],
		//id:'R/O: Q00$...',
		//rank:			'normal|preferred|deprecated',
		references:		[ snaks, ],
	}

	//data_to_modify
	entity = {
		//id:			'Q000',
		labels:			[ language_string, ],
		aliases:		[ language_string, ],
		descriptions:	[ language_string, ],
		claims:			[ claim, ],
		sitelinks:		[ sitelink, ],
		type:	'item'
	}

	// ------------------------------------------

	// TODO:
	
	// 目的在製造出方便存取組成成分，並且其值能直接用在 wbeditentity 的 object。
	entity = await CeL.wiki.data.Entity('Q000', options)
	entity = await CeL.wiki.data.Entity([language,value], options)

	entity.add_label(value, options)
	entity.get_label(language, options): language_string

	entity.add_alias(value, options)
	entity.get_aliases(language, options): [ language_string, ]

	entity.add_description(value, options)
	entity.get_description(language, options): language_string

	await entity.add_sitelink(title, options)
	entity.get_sitelink(site, options): {Sitelink}

	await entity.add_claim(Claim)
	entity.get_claims(property): [ Claim, ]

	// publish, 寫入網路上的wiki伺服器
	await entity.write()
	// reget, 取得最新版本
	await entity.refresh()

	await claim.set_mainsnak(Snak)
	//claim.get_mainsnak(): Snak===claim.mainsnak

	await claim.add_qualifier(Snak)
	claim.get_qualifier(property): Snak

	await claim.add_references([ Snak, ])
	claim.get_references(filter): [ Snak, ]

	snak.get_value(): String, number, Date, ...

	// ------------------------------------------

	// TODO:
	//data_to_modify
	.edit_data({
		//new:		'item',
		id:			Q_label,

		labels:			{ language: ''  , },
		aliases:		{ language:['',], },
		descriptions:	{ language: ''  , },
		claims:	{
			P_label: [ {
				mainsnak || value:	snak_value,
				qualifiers:	{P_label:snak_value,},
				//qualifiers-order: [ 'P00', ],
				//rank:	'normal|preferred|deprecated',
				references:	[
					[
						{P_label:snak_value,},
						//{snaks-order:[ 'P00', ]}
					],
				],
			}, ],
		},
		sitelinks:	{
			site:		'',
			site:		{title:'',badges:['',]}
		}
	});

	Q_label: 'Q000'	|| 'language:title'
	P_label: 'P00'	|| 'language:title'
	snak_value:	'Q000' || 'string value' || 123 || Date()
		|| {value:'', type:'string'}
		|| {datavalue: {value:'', type:'string'}, datatype:''}

	</code>
	 */

	/**
	 * Creates or modifies Wikibase entity. 創建或編輯Wikidata實體。
	 * 
	 * 注意: 若是本來已有某個值（例如 label），採用 add 會被取代。或須偵測並避免更動原有值。
	 * 
	 * @example<code>

	 wiki = Wiki(true, 'test.wikidata');

	// Create new item.
	wiki.edit_data({},{new:'item',bot:1,summary:'Create new item'});
	wiki.edit_data({labels:{en:"Evolution in Mendelian Populations"},P698:"17246615",P932:"1201091"},{bot:1,summary:'Test edit'});

	 // TODO:
	 wiki.page('宇宙').data(function(entity){result=entity;console.log(entity);}).edit(function(){return '';}).edit_data(function(){return {};});
	 wiki.page('宇宙').edit_data(function(entity){result=entity;console.log(entity);});

	 </code>
	 * 
	 * @param {String|Array}id
	 *            id to modify or entity you want to create.<br />
	 *            item/property 將會創建實體。
	 * @param {Object|Function}data
	 *            used as the data source to modify. 要編輯（更改或創建）的資料。可能被更改！<br />
	 *            {Object}data or {Function}data(entity)
	 * @param {Object}token
	 *            login 資訊，包含“csrf”令牌/密鑰。
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * @param {Function}callback
	 *            回調函數。 callback(entity, error)
	 * 
	 * @see https://www.wikidata.org/wiki/Wikidata:Creating_a_bot
	 * @see https://www.wikidata.org/wiki/Wikidata:Bots<br />
	 *      Monitor
	 *      https://www.wikidata.org/wiki/Wikidata:Database_reports/Constraint_violations<br />
	 *      Bots should add instance of (P31 隸屬於) or subclass of (P279 上一級分類) or
	 *      part of (P361 屬於) if possible<br />
	 *      Bots importing from Wikipedia should add in addition to imported
	 *      from (P143) also reference URL (P854) with the value of the full URL
	 *      and either retrieved (P813) or include the version id of the source
	 *      page in the full URL.
	 */
	function wikidata_edit(id, data, token, options, callback) {
		if (typeof options === 'function' && !callback) {
			// shift arguments.
			callback = options;
			options = null;
		}

		if (!library_namespace.is_Object(options)) {
			// 前置處理。
			options = Object.create(null);
		}

		if (!id && !options['new']) {
			callback(undefined, {
				code : 'no_id',
				message : 'Did not set id! 未設定欲取得之特定實體 id。'
			});
			return;
		}

		if (typeof data === 'function') {
			if (is_entity(id)) {
				library_namespace.debug('餵給(回傳要編輯資料的)設定值函數 ' + id.id + ' ('
						+ (get_entity_label(id) || get_entity_link(id)) + ')。',
						2, 'wikidata_edit');
				// .call(options,):
				// 使(回傳要編輯資料的)設定值函數能以 `this` 即時變更 options.summary。
				data = data.call(options, id);

			} else {
				if (false) {
					library_namespace.debug(
					// TypeError: Converting circular structure to JSON
					'Get id from ' + JSON.stringify(id), 3, 'wikidata_edit');
				}
				// console.trace(id);
				// console.trace(options);
				// library_namespace.set_debug(6)
				wikidata_entity(id, options.props, function(entity, error) {
					if (error) {
						library_namespace.debug('Get error '
								+ JSON.stringify(error), 3, 'wikidata_edit');
						callback(undefined, error);
						return;
					}
					if (false) {
						// TypeError: Converting circular structure to JSON
						library_namespace.debug('Get entity '
								+ JSON.stringify(entity), 3, 'wikidata_edit');
					}
					if ('missing' in entity) {
						// TODO: e.g., 此頁面不存在/已刪除。
						// return;
					}

					delete options.props;
					delete options.languages;
					// console.trace(entity);

					// .call(options,):
					// 使(回傳要編輯資料的)設定值函數能以 `this` 即時變更 options.summary。
					// entity 可能是 {id:'M000',missing:''}
					data = data.call(options, entity, error);
					wikidata_edit(id, data, token, options, callback);
				}, options);
				return;
			}
		}

		var entity;
		if (is_entity(id)) {
			// 輸入 id 為實體項目 entity
			entity = id;
			options.id = options.id || entity.id;
			if (!options.baserevid) {
				if (id.lastrevid > 0) {
					// 檢測編輯衝突用。
					options.baserevid = id.lastrevid;
				} else {
					console.trace(id);
					throw new Error(
							'wikidata_edit: Invalid entity: No .lastrevid!');
				}
			}
			id = id.id;
		}

		var action = wiki_API.edit.check_data(data, id, options,
				'wikidata_edit');
		if (action) {
			library_namespace.debug('直接執行 callback。', 2, 'wikidata_edit');
			callback(undefined, action);
			return;
		}

		if (!id) {
			if (!options['new'])
				library_namespace
						.debug('未設定 id，您可能需要手動檢查。', 2, 'wikidata_edit');

		} else if (is_entity(id)
		// && PATTERN_entity_id.test(id.id)
		) {
			options.id = id.id;

		} else if (wiki_API.is_page_data(id)) {
			options.site = wiki_API.site_name(options);
			options.title = id.title;

		} else if (id === 'item' || id === 'property') {
			options['new'] = id;

		} else if (PATTERN_entity_id.test(id)) {
			// e.g., 'Q1'
			options.id = id;

		} else if (is_api_and_title(id)) {
			options.site = wiki_API.site_name(id[0]);
			options.title = id[1];

		} else if (!options.id || options.id !== id) {
			library_namespace.warn('wikidata_edit: Invalid id: ' + id);
			// console.trace(id);
		}

		var session = wiki_API.session_of_options(options);
		// set_claims() 中之 get_data_API_URL() 會用到 options[KEY_SESSION];
		// delete options[KEY_SESSION];

		// edit 實體項目 entity
		action = [
		// https://www.wikidata.org/w/api.php?action=help&modules=wbeditentity
		get_data_API_URL(options), {
			action : 'wbeditentity'
		} ];
		// console.trace(options);
		// console.log(action);

		// 還存在此項可能會被匯入 query 中。但須注意刪掉後未來將不能再被利用！
		delete options.API_URL;

		if (library_namespace.is_Object(token)) {
			token = token.csrftoken;
		}

		function preparing_wbeditentity() {
			for ( var key in data) {
				if (Array.isArray(data[key]) ? data[key].length === 0
						: library_namespace.is_empty_object(data[key])) {
					delete data[key];
				}
			}

			if (library_namespace.is_empty_object(data) && !options['new']) {
				callback(data);
				return;
			}

			// TODO:
			// Will get wikidata_edit.do_wbeditentity Error:
			// [invalid-claim] undefined [wikibase-api-invalid-claim] [""]
			normalize_wbeditentity_data(data, entity, options, do_wbeditentity);
		}

		function do_wbeditentity() {
			// console.trace(data, JSON.stringify(data));
			if (data.claims && data.claims.length === 0)
				delete data.claims;
			if (library_namespace.is_empty_object(data) && !options['new']) {
				callback(data);
				return;
			}

			// e.g., {"descriptions":{"en":{"language":"en","value":""}}}

			var POST_data = Object.clone(options);
			// 去掉非 API 之 parameters。
			delete POST_data.search_without_cache;
			delete POST_data.no_skip_attributes_note;
			delete POST_data.data_API_URL;
			delete POST_data.force_add_sub_properties;
			delete POST_data[KEY_SESSION];
			// data 會在 set_claims() 被修改，因此不能提前設定。
			POST_data.data = JSON.stringify(data);
			if (library_namespace.is_debug(2)) {
				library_namespace.debug('POST_data.data: ' + POST_data.data, 2,
						'wikidata_edit.do_wbeditentity');
				console.log(data);
			}

			// the token should be sent as the last parameter.
			POST_data.token = token;

			// console.trace(POST_data.data);
			// console.trace(POST_data);

			wiki_API.query(action, function handle_result(result_data, error) {
				error = wiki_API.query.handle_error(result_data, error);
				// 檢查伺服器回應是否有錯誤資訊。
				if (error) {
					library_namespace.error(
					// e.g., "數據庫被禁止寫入以進行維護，所以您目前將無法保存您所作的編輯"
					// Mediawiki is in read-only mode during maintenance
					'wikidata_edit.do_wbeditentity: '
					//
					+ (POST_data.id ? POST_data.id + ': ' : '')
					// [readonly] The wiki is currently in read-only mode
					+ error);
					try {
						console.trace([ action, POST_data ]);
						// console.log(POST_data.data);
					} catch (e) {
						library_namespace.warn('action: '
						//
						+ JSON.stringify(action));
					}
					if (false) {
						// TypeError: Converting circular structure to JSON
						library_namespace.warn('data to write: '
								+ JSON.stringify(POST_data));
					}
					callback(result_data, error);
					return;
				}

				if (entity) {
					entity.had_modified = {
						// modify_data : data,
						// result : result_data,
						time : Date.now()
					};
				}
				if (result_data.entity) {
					result_data = result_data.entity;
				}
				callback(result_data);
			}, POST_data, session);
		}

		if (false && Array.isArray(data)) {
			// TODO: 按照內容分類。
			library_namespace
					.warn('wikidata_edit: Treat {Array}data as {claims:data}!');
			data = {
				claims : data
			};
		}

		// TODO: 創建實體項目重定向。
		// https://www.wikidata.org/w/api.php?action=help&modules=wbcreateredirect

		// console.trace(JSON.stringify(data));
		// console.trace(options);
		// console.trace(entity);

		if (!entity && options['new']
		// combine_edit_queries
		// https://doc.wikimedia.org/Wikibase/master/php/md_docs_topics_changeop_serializations.html
		|| options.wbeditentity_only) {
			delete options.wbeditentity_only;
			// 直接呼叫 wbeditentity。
			// TODO: 經過 set_labels()...set_sitelinks() 等一連串動作，不做編輯只 parse。
			preparing_wbeditentity();
			return;
		}

		delete options['new'];

		// TODO: 避免 callback hell: using ES7 async/await?
		// TODO: 用更簡單的方法統合這幾個函數。
		library_namespace.debug('Run set_labels', 2, 'wikidata_edit');
		// 先 set_labels() 可以在 history 早一點看到描述。
		set_labels(data, token, function() {
			library_namespace.debug('Run set_descriptions',
			//
			2, 'wikidata_edit');
			set_descriptions(data, token, function() {
				library_namespace.debug('Run set_aliases', 2, 'wikidata_edit');
				set_aliases(data, token, function() {
					library_namespace.debug('Run set_claims', 2,
							'wikidata_edit');
					set_claims(data, token, function() {
						library_namespace.debug('Run set_sitelinks', 2,
								'wikidata_edit');
						set_sitelinks(data, token, preparing_wbeditentity,
								options, session, entity);
					}, options, session, entity);
				}, options, session, entity);
			}, options, session, entity);
		}, options, session, entity);
	}

	// CeL.wiki.edit_data.somevalue
	// snaktype somevalue 未知數值 unknown value
	wikidata_edit.somevalue = {
		// 單純表達意思用的內容結構，可以其他的值代替。
		unknown_value : true
	};

	// CeL.wiki.edit_data.remove_all
	// 注意: 不可為 index!
	wikidata_edit.remove_all = {
		// 單純表達意思用的內容結構，可以其他的值代替。
		remove_all : true
	};

	/**
	 * 取得指定實體，指定語言的所有 labels 與 aliases 值之列表。
	 * 
	 * @param {Object}entity
	 *            指定實體的 JSON 值。
	 * @param {String}[language]
	 *            指定取得此語言之資料。
	 * @param {Array}[list]
	 *            添加此原有之 label 列表。<br />
	 *            list = [ {String}label, ... ]
	 * 
	 * @returns {Array}所有 labels 與 aliases 值之列表。
	 */
	function entity_labels_and_aliases(entity, language, list) {
		if (!Array.isArray(list))
			// 初始化。
			list = [];

		if (!entity)
			return list;

		if (false && language && is_entity(entity) && !list) {
			// faster

			/** {Object|Array}label */
			var label = entity.labels[language],
			/** {Array}aliases */
			list = entity.aliases && entity.aliases[language];

			if (label) {
				label = label.value;
				if (list)
					// 不更動到原 aliases。
					(list = list.map(function(item) {
						return item.value;
					})).unshift(label);
				else
					list = [ label ];
			} else if (!list) {
				return [];
			}

			return list;
		}

		function add_list(item_list) {
			if (Array.isArray(item_list)) {
				// assert: {Array}item_list 為 wikidata_edit() 要編輯（更改或創建）的資料。
				// assert: item_list = [{language:'',value:''}, ...]
				list.append(item_list.map(function(item) {
					return item.value;
				}));

			} else if (!language) {
				// assert: {Object}item_list
				for ( var _language in item_list) {
					// assert: Array.isArray(aliases[label])
					add_list(item_list[_language]);
				}

			} else if (language in item_list) {
				// assert: {Object}item_list
				item_list = item_list[language];
				if (Array.isArray(item_list))
					add_list(item_list);
				else
					list.push(item_list.value);
			}
		}

		entity.labels && add_list(entity.labels);
		entity.aliases && add_list(entity.aliases);
		return list;
	}

	// common characters.
	// FULLWIDTH full width form characters 全形 ØωⅡ
	var PATTERN_common_characters_FW = /[\s\-ー・·．˙•，、。？！；：“”‘’「」『』（）－—…《》〈〉【】〖〗〔〕～←→↔⇐⇒⇔]+/g,
	// [[:en:Chùa Báo Quốc]]
	// {{tsl|ja|オメガクインテット|*ω*Quintet}}
	// {{tsl|en|Tamara de Lempicka|Tamara Łempicka}}
	// {{link-en|Željko Ivanek|Zeljko Ivanek}}
	// @see sPopP.RepeatC @ CeL.interact.DOM
	/** {RegExp}常用字母的匹配模式。應該是英語也能接受的符號。 */
	PATTERN_common_characters = /[\s\d_,.:;'"!()\-+\&<>\\\/\?–`@#$%^&*=~×☆★♪♫♬♩○●©®℗™℠]+/g,
	// 不能用來判別語言、不能表達意義的泛用符號/字元。無關緊要（不造成主要意義）的字元。
	PATTERN_only_common_characters = new RegExp('^['
			+ PATTERN_common_characters.source.slice(1, -2)
			//
			+ PATTERN_common_characters_FW.source.slice(1, -2) + ']*$'),
	// non-Chinese / non-CJK: 必須置於所有非中日韓語言之後測試!!
	// 2E80-2EFF 中日韓漢字部首補充 CJK Radicals Supplement
	/** {RegExp}非漢文化字母的匹配模式。 */
	PATTERN_non_CJK = /^[\u0008-\u2E7F]+$/i,
	/**
	 * 判定 label 標籤標題語言使用之 pattern。
	 * 
	 * @type {Object}
	 * 
	 * @see [[以人口排列的語言列表]], [[維基百科:維基百科語言列表]], [[Special:統計#其他語言的維基百科]],
	 *      application.locale.encoding
	 */
	label_language_patterns = {
		// 常用的[[英文字母]]需要放置於第一個測試。
		en : /^[a-z]+$/i,

		// [[西班牙語字母]]
		// 'áéíñóúü'.toLowerCase().split('').sort().unique_sorted().join('')
		es : /^[a-záéíñóúü]+$/i,
		// [[:en:French orthography]]
		// http://character-code.com/french-html-codes.php
		fr : /^[a-z«»àâæçèéêëîïôùûüÿœ₣€]+$/i,
		// [[德語字母]], [[:de:Deutsches Alphabet]]
		de : /^[a-zäöüß]+$/i,

		// [[Arabic script in Unicode]] [[阿拉伯字母]]
		// \u10E60-\u10E7F
		ar : /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+$/,

		// 印度 [[印地語]][[天城文]]
		bh : /^[\u0900-\u097F\uA8E0-\uA8FF\u1CD0-\u1CFF]+$/,
		// [[:en:Bengali (Unicode block)]]
		bn : /^[\u0980-\u09FF]+$/,

		// [[俄語字母]], [\p{IsCyrillic}]+
		ru : /^[\u0401-\u0451]+$/,

		// [[Unicode and HTML for the Hebrew alphabet]] [[希伯來字母]]
		// [[Hebrew (Unicode block)]]
		he : /^[\u0591-\u05F4]+$/,

		// [[越南文字母]]
		vi : /^[aăâbcdđeêghiklmnoôơpqrstuưvxy]+$/i

	}, label_CJK_patterns = {
		ja : /^[\u3041-\u30FF\u31F0-\u31FF\uFA30-\uFA6A]+$/,
		// [[朝鮮字母]]
		ko : /^[\uAC00-\uD7A3\u1100-\u11FF\u3131-\u318E]+$/
	};

	/**
	 * 猜測 label 標籤標題之語言。
	 * 
	 * @param {String}label
	 *            標籤標題
	 * @param {String}[CJK_language]
	 *            預設之中日韓語言 code。
	 * 
	 * @returns {String|Undefined}label 之語言。
	 */
	function guess_language(label, CJK_language) {
		if (!label
		// 先去掉所有泛用符號/字元。
		|| !(label = label.replace(PATTERN_common_characters, ''))) {
			// 刪掉泛用符號/字元後已無東西剩下。
			return;
		}

		// non_CJK: 此處事實上為非中日韓漢字之未知語言。
		var non_CJK = PATTERN_non_CJK.test(label),
		//
		patterns = non_CJK ? label_language_patterns : label_CJK_patterns;

		for ( var language in patterns) {
			if (patterns[language].test(label)) {
				return language;
			}
		}

		if (!non_CJK) {
			return CJK_language;
		}

		library_namespace.warn(
		//
		'guess_language: Unknown non-CJK label: [' + label + ']');
		return '';
	}

	/**
	 * 回傳 wikidata_edit() 可用的個別 label 或 alias 設定項。
	 * 
	 * @param {String}label
	 *            label 值。
	 * @param {String}[language]
	 *            設定此 label 之語言。
	 * @param {String}[default_lang]
	 *            default language to use
	 * @param {Array}[add_to_list]
	 *            添加在此編輯資料列表中。
	 * 
	 * @returns {Object}個別 label 或 alias 設定項。
	 */
	wikidata_edit.add_item = function(label, language, default_lang,
			add_to_list) {
		if (!language || typeof language !== 'string') {
			// 無法猜出則使用預設之語言。
			language = guess_language(label) || default_lang;
			if (!language) {
				return;
			}
		}
		label = {
			language : language,
			value : label,
			add : 1
		};
		if (add_to_list) {
			add_to_list.push(label);
		}
		return label;
	};

	// --------------------------------

	// 測試是否包含前，正規化 label。
	// 注意: 因為會變更 label，不可將此輸出作為最後 import 之內容！
	function key_of_label(label) {
		return label && String(label)
		// 去掉無關緊要（不造成主要意義）的字元。 ja:"・", "ー"
		.replace(PATTERN_common_characters_FW, '').toLowerCase()
		// 去掉複數。 TODO: 此法過於簡略。
		.replace(/s$/, '')
		// 當有大小寫轉換後相同的標籤時應跳過。
		// should not append the alias when the alias is the same with label
		// after lower cased.
		.toLowerCase()
		// 保證回傳 {String}。 TODO: {Number}0
		|| '';
	}

	// 測試是否包含等價或延伸（而不僅僅是完全相同的） label。
	// 複雜版 original.includes(label_to_test)
	// TODO: 可省略 /[,;.!]/
	function include_label(original, label_to_test) {
		// 沒東西要測試，表示也毋須作進一步處理。
		if (!label_to_test) {
			return true;
		}
		// 原先沒東西，表示一定沒包含。
		if (!original) {
			return false;
		}

		label_to_test = key_of_label(label_to_test);

		if (Array.isArray(original)) {
			return original.some(function(label) {
				return key_of_label(label).includes(label_to_test);
			});
		}

		// 測試正規化後是否包含。
		return key_of_label(original).includes(label_to_test);
	}

	/**
	 * 當想把 labels 加入 entity 時，輸入之則可自動去除重複的 labels，並回傳 wikidata_edit() 可用的編輯資料。
	 * merge labels / alias
	 * 
	 * TODO: 不區分大小寫與空格（這有時可能為 typo），只要存在即跳過。或最起碼忽略首字大小寫差異。
	 * 
	 * @param {Object}labels
	 *            labels = {language:[label list],...}
	 * @param {Object}[entity]
	 *            指定實體的 JSON 值。
	 * @param {Object}[data]
	 *            添加在此編輯資料中。
	 * 
	 * @returns {Object}wikidata_edit() 可用的編輯資料。
	 */
	wikidata_edit.add_labels = function(labels, entity, data) {
		var data_alias;

		// assert: {Object}data 為 wikidata_edit() 要編輯（更改或創建）的資料。
		// data={labels:[{language:'',value:'',add:},...],aliases:[{language:'',value:'',add:},...]}
		if (data && (Array.isArray(data.labels) || Array.isArray(data.aliases))) {
			// {Array}data_alias
			data_alias = entity_labels_and_aliases(data);
			if (false) {
				if (!Array.isArray(data.labels))
					data.labels = [];
				else if (!Array.isArray(data.aliases))
					data.aliases = [];
			}

		} else {
			// 初始化。
			// Object.create(null);
			data = {
			// labels : [],
			// aliases : []
			};
		}

		var count = 0;
		// excludes existing label or alias. 去除已存在的 label/alias。
		for ( var language in labels) {
			// 此語言要添加的 label data。
			var label_data = labels[language];
			if (language === 'no') {
				library_namespace.debug('change language [' + language
						+ '] → [nb]', 2, 'wikidata_edit.add_labels');
				// using the language code "nb", not "no", at no.wikipedia.org
				// @see [[phab:T102533]]
				language = 'nb';
			}
			if (!Array.isArray(label_data)) {
				if (label_data)
					;
				library_namespace.warn('wikidata_edit.add_labels: language ['
						+ language + '] is not Array: (' + (typeof label_data)
						+ ')' + label_data);
				continue;
			}

			// TODO: 提高效率。
			var alias = entity_labels_and_aliases(entity, language, data_alias),
			/** {Boolean}此語言是否有此label */
			has_this_language_label = undefined,
			/** {Array}本次 label_data 已添加之 label list */
			new_alias = undefined,
			//
			matched = language.match(/^([a-z]{2,3})-/);

			if (matched) {
				// 若是要添加 'zh-tw'，則應該順便檢查 'zh'。
				entity_labels_and_aliases(entity, matched[1], alias);
			}

			label_data
			// 確保 "title" 在 "title (type)" 之前。
			.sort()
			// 避免要添加的 label_data 本身即有重複。
			.unique_sorted()
			// 處理各 label。
			.forEach(function(label) {
				if (!label || typeof label !== 'string') {
					// warnning: Invalid label.
					return;
				}

				var label_without_type = /\([^()]+\)$/.test(label)
				// e.g., label === "title (type)"
				// → label_without_type = "title"
				&& label.replace(/\s*\([^()]+\)$/, '');

				// 測試是否包含等價或延伸（而不僅僅是完全相同的） label。
				// TODO: 每個 label 每次測試皆得重新 key_of_label()，效率過差。
				if (include_label(alias, label)
				//
				|| label_without_type
				// 當已有 "title" 時，不添加 "title (type)"。
				&& (include_label(alias, label_without_type)
				// assert: !new_alias.includes(label)，已被 .unique() 除去。
				|| new_alias && include_label(new_alias, label_without_type))) {
					// Skip. 已有此 label 或等價之 label。
					return;
				}

				count++;
				if (new_alias)
					new_alias.push(label);
				else
					new_alias = [ label ];

				var item = wikidata_edit.add_item(label, language);

				if (has_this_language_label === undefined)
					has_this_language_label
					// 注意: 若是本來已有某個值（例如 label），採用 add 會被取代。或須偵測並避免更動原有值。
					= entity.labels && entity.labels[language]
					//
					|| data.labels && data.labels.some(function(item) {
						return item.language === language;
					});

				if (!has_this_language_label) {
					// 因為預料會增加的 label/aliases 很少，因此採後初始化。
					if (!data.labels)
						data.labels = [];
					// 第一個當作 label。直接登錄。
					data.labels.push(item);
				} else {
					// 因為預料會增加的 label/aliases 很少，因此採後初始化。
					if (!data.aliases)
						data.aliases = [];
					// 其他的當作 alias
					data.aliases.push(item);
				}
			});

			if (new_alias) {
				if (data_alias)
					data_alias.append(new_alias);
				else
					data_alias = new_alias;
			}
		}

		if (count === 0) {
			// No labels/aliases to set. 已無剩下需要設定之新 label/aliases。
			return;
		}

		if (false) {
			// 已採後初始化。既然造出實例，表示必定有資料。
			// trim 修剪；修整
			if (data.labels.length === 0)
				delete data.labels;
			if (data.aliases.length === 0)
				delete data.aliases;
		}

		return data;
	};

	// ------------------------------------------------------------------------

	/**
	 * 合併自 wikidata 的 entity。
	 * 
	 * TODO: wikidata_merge([to, from1, from2], ...)
	 * 
	 * @param {String}to
	 *            要合併自的ID
	 * @param {String}from
	 *            要合併到的ID
	 * @param {Object}token
	 *            login 資訊，包含“csrf”令牌/密鑰。
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * @param {Function}[callback]
	 *            回調函數。 callback(轉成JavaScript的值. e.g., {Array}list)
	 */
	function wikidata_merge(to, from, token, options, callback) {
		if (!PATTERN_entity_id.test(to)) {
			wikidata_entity(to, function(entity, error) {
				if (error) {
					callback(undefined, error);
				} else {
					wikidata_merge(entity.id, from, callback, options);
				}
			});
			return;
		}

		if (!PATTERN_entity_id.test(from)) {
			wikidata_entity(from, function(entity, error) {
				if (error) {
					callback(undefined, error);
				} else {
					wikidata_merge(to, entity.id, callback, options);
				}
			});
			return;
		}

		// 正規化並提供可隨意改變的同內容參數，以避免修改或覆蓋附加參數。
		options = library_namespace.new_options(options);

		// 要忽略衝突的項的元素數組，只能包含值“description”和/或“sitelink”和/或“statement”。
		// 多值 (以 | 分隔)：description、sitelink、statement
		// 網站鏈接和描述
		var ignoreconflicts = 'ignoreconflicts' in options ? options.ignoreconflicts
				// 最常使用的功能是合併2頁面。可忽略任何衝突的 description, statement。
				// https://www.wikidata.org/wiki/Help:Statements
				: 'description';

		var session = wiki_API.session_of_options(options);
		if (KEY_SESSION in options) {
			delete options[KEY_SESSION];
		}

		var action = 'action=wbmergeitems&fromid=' + from + '&toid=' + to;
		if (ignoreconflicts) {
			action += '&ignoreconflicts=' + ignoreconflicts;
		}

		action = [
		// 合併重複項。
		// https://www.wikidata.org/w/api.php?action=help&modules=wbmergeitems
		get_data_API_URL(options), action ];

		// the token should be sent as the last parameter.
		options.token = library_namespace.is_Object(token) ? token.csrftoken
				: token;

		wiki_API.query(action, function handle_result(data, error) {
			error = wiki_API.query.handle_error(data, error);
			// 檢查伺服器回應是否有錯誤資訊。
			if (error) {
				library_namespace.error('wikidata_merge: '
				// [failed-modify] Attempted modification of the item failed.
				// (Conflicting descriptions for language zh)
				+ error);
			}

			// Will create redirection.
			// 此 wbmergeitems 之回傳 data 不包含 item 資訊。
			// data =
			// {"success":1,"redirected":1,"from":{"id":"Q1","type":"item","lastrevid":1},"to":{"id":"Q2","type":"item","lastrevid":2}}
			// {"success":1,"redirected":0,"from":{"id":"Q1","type":"item","lastrevid":1},"to":{"id":"Q2","type":"item","lastrevid":2}}
			callback(data, error);
		}, options, session);
	}

	// ------------------------------------------------------------------------

	/** {String}API URL of Wikidata Query. */
	var wikidata_query_API_URL = 'https://wdq.wmflabs.org/api';

	/**
	 * 查詢 Wikidata Query。
	 * 
	 * @example<code>

	 CeL.wiki.wdq('claim[31:146]', function(list) {result=list;console.log(list);});
	 CeL.wiki.wdq('CLAIM[31:14827288] AND CLAIM[31:593744]', function(list) {result=list;console.log(list);});
	 //	查詢國家
	 CeL.wiki.wdq('claim[31:6256]', function(list) {result=list;console.log(list);});


	 // Wikidata filter claim
	 // https://wdq.wmflabs.org/api_documentation.html
	 // https://wdq.wmflabs.org/wdq/?q=claim[31:146]&callback=eer
	 // https://wdq.wmflabs.org/api?q=claim[31:146]&callback=eer
	 CeL.get_URL('https://wdq.wmflabs.org/api?q=claim[31:146]', function(data) {result=data=JSON.parse(data.responseText);console.log(data.items);})
	 CeL.get_URL('https://wdq.wmflabs.org/api?q=string[label:宇宙]', function(data) {result=data=JSON.parse(data.responseText);console.log(data.items);})

	 </code>
	 * 
	 * @param {String}query
	 *            查詢語句。
	 * @param {Function}[callback]
	 *            回調函數。 callback(轉成JavaScript的值. e.g., {Array}list, error)
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 */
	function wikidata_query(query, callback, options) {
		var action = [ options && options.API_URL || wikidata_query_API_URL,
				'?q=', encodeURIComponent(query) ];

		if (options) {
			if (typeof options === 'string') {
				options = {
					props : options
				};
			} else if (Array.isArray(options)) {
				options = {
					props : options.join(',')
				};
			} else {
				// 已使用過。
				delete options.API_URL;
			}

			if (options.wdq_props)
				action.push('&props=', options.wdq_props);
			if (options.noitems)
				// 毋須 '&noitems=1'
				action.push('&noitems');
			// &callback=
		}

		get_URL(action.join(''), function(data) {
			var items;
			// error handling
			try {
				items = JSON.parse(data.responseText).items;
			} catch (e) {
			}
			if (!items || options && options.get_id) {
				callback(undefined, data && data.status || 'Failed to get '
						+ query);
				return;
			}
			if (items.length > 50) {
				// 上限值為 50 (機器人為 500)。
				library_namespace.debug('Get ' + items.length
						+ ' items, more than 50.', 2, 'wikidata_query');
				var session = wiki_API.session_of_options(options);
				// session && session.data(items, callback, options);
				if (session && !session.data_session) {
					// 得先登入。
					session.set_data(function() {
						wikidata_entity(items, callback, options);
					});
					return;
				}
			}
			wikidata_entity(items, callback, options);
		});
	}

	/** {String}API URL of Wikidata Query Service (SPARQL). */
	var wikidata_SPARQL_API_URL = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql';
	// https://query.wikidata.org/sparql
	// https://commons-query.wikimedia.org/sparql
	// https://www.dictionnairedesfrancophones.org/sparql

	/**
	 * 查詢 Wikidata Query Service (SPARQL)。
	 * 
	 * @example<code>

	 CeL.wiki.SPARQL('SELECT ?item ?itemLabel ?itemDescription WHERE { ?item wdt:P31 wd:Q146 . SERVICE wikibase:label { bd:serviceParam wikibase:language "en" } }', function(list) {result=list;console.log(list);})

	 </code>
	 * 
	 * @param {String}query
	 *            查詢語句。
	 * @param {Function}[callback]
	 *            回調函數。 callback(轉成JavaScript的值. e.g., {Array}list, error)
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @see https://www.mediawiki.org/wiki/Wikidata_query_service/User_Manual
	 *      https://www.wikidata.org/wiki/Wikidata:Data_access#SPARQL_endpoints
	 */
	function wikidata_SPARQL(query, callback, options) {
		// options.API_URL: custom SPARQL endpoint
		var action = options && options.API_URL;
		if (!action) {
			var session = wiki_API.session_of_options(options);
			action = session && session.SPARQL_API_URL;
		}
		// console.trace(action);
		action = [ action || wikidata_SPARQL_API_URL, '?query=',
				encodeURIComponent(query), '&format=json' ];

		get_URL(action.join(''), function(data, error) {
			if (error) {
				callback(undefined, error);
				return;
			}
			// console.log(data.responseText);
			try {
				data = JSON.parse(data.responseText);
			} catch (e) {
				// e.g., java.util.concurrent.TimeoutException
				callback(undefined, e);
				return;
			}
			// {"head":{"vars":["item"]},"results":{"bindings":[{"item":{"type":"uri","value":"http://www.wikidata.org/entity/Q1"}},...]}}
			// console.log(JSON.stringify(data));

			var items = data.results;
			if (!items || !Array.isArray(items = items.bindings)) {
				callback(data);
				return;
			}

			// 正常情況
			items.for_id = for_erach_SPARQL_item_process_id;
			// e.g., items.id_list('item'); items.id_list();
			// .get_item_ids()
			items.id_list = get_SPARQL_id_list;
			callback(items);
		});
	}

	var default_item_name = 'item';
	function for_erach_SPARQL_item_process_id(processor, item_list, item_name) {
		item_list = item_list || this;
		item_list.forEach(function(item, index) {
			var matched = item[item_name || default_item_name];
			if (matched && matched.type === "uri") {
				matched = matched.value && matched.value.match(/Q\d+$/);
				if (matched) {
					// processor('Q000', item, index, item_list)
					processor(matched[0], item, index, item_list);
					return;
				}
			}
			// Unknown item.
			processor(undefined, item, index, item_list);
		});
	}

	function get_SPARQL_id_list(options) {
		if (typeof options === 'string') {
			options = {
				item_name : options
			};
		}
		var id_list = [];
		for_erach_SPARQL_item_process_id(function(id, item) {
			// console.trace([ id, item ]);
			id_list.push(id);
		}, this, options && options.item_name || default_item_name);
		return id_list;
	}

	// --------------------------------------------------------------------------------------------

	/** {String}API URL of PetScan. */
	var wikidata_PetScan_API_URL = 'https://petscan.wmflabs.org/',
	// 常用 parameters。
	PetScan_parameters = 'combination,sparql'.split(',');

	/**
	 * PetScan can generate lists of Wikipedia (and related projects) pages or
	 * Wikidata items that match certain criteria, such as all pages in a
	 * certain category, or all items with a certain property.
	 * 
	 * @example<code>

	// [[:Category:日本のポップ歌手]]直下の記事のうちWikidataにおいて性別(P21)が女性(Q6581072)となっているもの
	CeL.wiki.petscan('日本のポップ歌手',function(items){result=items;console.log(items);},{language:'ja',sparql:'SELECT ?item WHERE { ?item wdt:P21 wd:Q6581072 }'})

	 </code>
	 * 
	 * @param {String}categories
	 *            List of categories, one per line without "category:" part.
	 * @param {Function}[callback]
	 *            回調函數。 callback({Array}[{Object}item])
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 */
	function petscan(categories, callback, options) {
		var _options;
		if (options) {
			if (typeof options === 'string') {
				options = {
					language : options
				};
			} else {
				_options = options;
			}
		} else {
			options = Object.create(null);
		}

		var language = options.language || wiki_API.language, parameters;
		if (is_api_and_title(categories, 'language')) {
			language = categories[0];
			categories = categories[1];
		}

		if (_options) {
			parameters = Object.create(null);
			PetScan_parameters.forEach(function(parameter) {
				if (parameter in options) {
					parameters[parameter] = options[parameter];
				}
			});
			Object.assign(parameters, options.parameters);
		}
		_options = {
			language : language,
			wikidata_label_language : language,
			categories : Array.isArray(categories)
			// List of categories, one per line without "category:" part.
			// 此時應設定 combination:union/subset
			? categories.join('\n') : categories,
			project : options.project || options.family || 'wikipedia',
			// 確保輸出為需要的格式。
			format : 'wiki',
			doit : 'D'
		};
		if (parameters) {
			Object.assign(parameters, _options);
		} else {
			parameters = _options;
		}

		var url = new library_namespace.URI(options.API_URL
				|| wikidata_PetScan_API_URL);
		url.search_params.set_parameters(parameters);

		get_URL(url.to_String(), function(data, error) {
			if (error) {
				callback(undefined, error);
				return;
			}
			data = data.responseText;
			var items = [], matched,
			/**
			 * <code>
			!Title !! Page ID !! Namespace !! Size (bytes) !! Last change !! Wikidata
			| [[Q234598|宇多田ヒカル]] || 228187 || 0 || 49939 || 20161028033707
			→ format form PetScan format=json
			{"id":228187,"len":49939,"namespace":0,"title":"Q234598","touched":"20161028033707"},
			 </code>
			 */
			PATTERN =
			// [ all, title, sitelink, miscellaneous ]
			// TODO: use PATTERN_wikilink
			/\n\|\s*\[\[([^{}\[\]\|<>\t\n�]+)\|([^\[\]\t\n]*?)\]\]\s*\|\|([^\t\n]+)/g
			//
			;
			while (matched = PATTERN.exec(data)) {
				var miscellaneous = matched[3].split(/\s*\|\|\s*/),
				//
				item = {
					id : +miscellaneous[0],
					len : +miscellaneous[2],
					namespace : +miscellaneous[1],
					title : matched[1],
					touched : miscellaneous[3]
				};
				if (matched[2]) {
					// Maybe it's label...
					item.sitelink = matched[2];
				}
				if ((matched = miscellaneous[4])
				// @see function to_talk_page()
				&& (matched = matched.match(
				//
				/\[\[:d:([^{}\[\]\|<>\t\n#�:]+)/))) {
					item.wikidata = matched[1];
				}
				items.push(item);
			}
			callback(items);
		});
	}

	// ------------------------------------------------------------------------

	// export 導出.

	// @inner
	library_namespace.set_method(wiki_API, {
		setup_data_session : setup_data_session
	});

	// ------------------------------------------

	// @static
	Object.assign(wiki_API, {
		PATTERN_common_characters : PATTERN_common_characters,
		PATTERN_only_common_characters : PATTERN_only_common_characters,

		guess_language : guess_language,

		is_entity : is_entity,

		// data : wikidata_entity,
		edit_data : wikidata_edit,
		merge_data : wikidata_merge,
		//
		wdq : wikidata_query,
		SPARQL : wikidata_SPARQL,
		petscan : petscan
	});

	return wikidata_entity;
}
