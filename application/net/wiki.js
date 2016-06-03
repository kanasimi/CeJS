/**
 * @name CeL function for MediaWiki (Wikipedia / 維基百科)
 * 
 * @fileoverview 本檔案包含了 MediaWiki 自動化作業用的程式庫，主要用於編寫[[維基百科:機器人]]
 *               ([[WP:{{{name|{{int:Group-bot}}}}}|{{{name|{{int:Group-bot}}}}}]])。
 * 
 * TODO:<code>

wiki_API.work() 遇到 Invalid token 之類問題，中途跳出 abort 時，無法紀錄。應將紀錄顯示於 console 或 local file。
wiki_API.page() 整合各 action=query 至單一公用 function。

parser 標籤中的空屬性現根據HTML5規格進行解析。<pages from= to= section=1>將解析為<pages from="to=" section="1">而不是像以前那樣的<pages from="" to="" section="1">。請改用<pages from="" to="" section=1> or <pages section=1>。這很可能影響維基文庫項目上的頁面。
parser 所有子頁面加入白名單 white-list
parser [[WP:維基化]]
https://en.wikipedia.org/wiki/Wikipedia:WikiProject_Check_Wikipedia
https://en.wikipedia.org/wiki/Wikipedia:AutoWikiBrowser/General_fixes
https://www.mediawiki.org/wiki/API:Edit_-_Set_user_preferences
https://www.mediawiki.org/wiki/OAuth/Owner-only_consumers

Wikimedia REST API
https://www.mediawiki.org/wiki/RESTBase


https://zh.wikipedia.org/w/index.php?title=title&action=history&hilight=123,456


-{zh-hans:访问;zh-hant:訪問;zh-tw:瀏覽}-量
https://wikitech.wikimedia.org/wiki/Analytics/PageviewAPI
https://en.wikipedia.org/wiki/Wikipedia:Pageview_statistics
https://dumps.wikimedia.org/other/pagecounts-raw/
https://tools.wmflabs.org/pageviews
https://wikitech.wikimedia.org/wiki/Analytics/Data/Pagecounts-raw
https://meta.wikimedia.org/wiki/Research:Page_view


</code>
 * 
 * @since 2015/1/1
 * @see https://www.mediawiki.org/w/api.php
 */

// More examples: see /_test suite/test.js
// Wikipedia bots demo: https://github.com/kanasimi/wikibot
'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.wiki',
	// .includes() @ data.code.compatibility
	// .between() @ data.native
	// .append() @ data.native
	require : 'data.code.compatibility.|data.native.'
	// (new Date).format('%4Y%2m%2d'), (new Date).format() @ data.date
	// optional: .show_value() @ interact.DOM, application.debug
	// optional: .fs_mkdir() @ CeL.wiki.cache()
	// @ CeL.wiki.traversal() @ application.platform.nodejs
	+ '|application.net.Ajax.get_URL|data.date.',
	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code,
	// 設定不匯出的子函式。
	no_extend : '*'
});

function module_code(library_namespace) {

	// requiring
	var get_URL = this.r('get_URL');

	// --------------------------------------------------------------------------------------------

	/** {String} old key: 'wiki' */
	var SESSION_KEY = 'session';

	/**
	 * web Wikipedia / 維基百科 用的 functions。<br />
	 * 可執行環境: node.js, JScript。
	 * 
	 * @param {String}user_name
	 *            user name
	 * @param {String}password
	 *            user password
	 * @param {String}[API_URL]
	 *            language code or API URL
	 * 
	 * @constructor
	 */
	function wiki_API(user_name, password, API_URL) {
		if (!this || this.constructor !== wiki_API)
			return wiki_API.query.apply(null, arguments);

		this.token = {
			// lgusername
			lgname : user_name,
			lgpassword : password
		};

		// action queue 佇列。應以 append，而非整個換掉的方式更改。
		this.actions = [];

		// 紀錄各種後續檢索用索引值。應以 append，而非整個換掉的方式更改。
		// 對舊版本須用到 for (in .next_mark)
		this.next_mark = library_namespace.null_Object();

		// setup session.
		if (API_URL) {
			setup_API_language(this /* session */, API_URL);
			setup_API_URL(this /* session */, API_URL);
		}

		if (!('language' in this)
		// wikidata 不設定 language。
		&& !this.is_wikidata) {
			setup_API_language(this /* session */, default_language);
		}
	}

	// --------------------------------------------------------------------------------------------
	// 工具函數。

	// https://phabricator.wikimedia.org/rOPUP558bcc29adc3dd7dfebbc66c1bf88a54a8b09535#3ce6dc61
	// server:
	// (wikipedia|wikibooks|wikinews|wikiquote|wikisource|wikiversity|wikivoyage|wikidata|wikimediafoundation|wiktionary|mediawiki)

	/**
	 * Wikimedia projects 的 URL pattern
	 * 
	 * matched: [ protocol + host name, protocol, host name, language / project ]
	 * 
	 * @type {String}
	 */
	var PATTERN_wiki_project_URL = /^(https?:)?(?:\/\/)?(([a-z\-\d]{2,20})(?:\.[a-z]+)+)/i;

	/**
	 * Get the API URL of specified project.
	 * 
	 * @param {String}project
	 *            wiki project, domain or language. 指定維基百科語言/姊妹計劃<br />
	 *            e.g., 'en', 'en.wikisource'.
	 * 
	 * @returns {String}API URL
	 * 
	 * @see https://en.wikipedia.org/wiki/Wikipedia:Wikimedia_sister_projects
	 *      TODO:
	 *      https://zh.wikipedia.org/wiki/Wikipedia:%E5%A7%8A%E5%A6%B9%E8%AE%A1%E5%88%92#.E9.93.BE.E6.8E.A5.E5.9E.8B
	 */
	function api_URL(project) {
		if (!project) {
			return wiki_API.API_URL;
		}

		project = String(project);
		if (project in api_URL.alias)
			project = api_URL.alias[project];
		// /^[a-z\-\d]{2,20}$/i.test(undefined) === true
		if (/^[a-z\-\d]{2,20}$/i.test(project)) {
			if (project in api_URL.wikimedia) {
				project += '.wikimedia';
			} else if (project in api_URL.project) {
				// (default_language || 'www') + '.' + project
				project = default_language + '.' + project;
			} else if (/wik/i.test(project)) {
				// e.g., 'mediawiki' → 'www.mediawiki'
				// e.g., 'wikidata' → 'www.wikidata'
				project = 'www.' + project;
			} else {
				// e.g., 'en' → 'en.wikipedia' ({{SERVERNAME}})
				// e.g., 'zh-yue' → 'zh-yue.wikipedia', 'zh-classical'
				// e.g., 'test2' → 'test2.wikipedia' ({{SERVERNAME}})
				project += '.wikipedia';
			}
		}
		if (/^[a-z\-\d]{2,20}\.[a-z]+$/i.test(project))
			// e.g., 'en.wikisource', 'en.wiktionary'
			project += '.org';

		var matched = project.match(PATTERN_wiki_project_URL);
		if (matched) {
			// e.g., 'http://zh.wikipedia.org/'
			// e.g., 'https://www.mediawiki.org/w/api.php'
			// e.g., 'https://www.mediawiki.org/wiki/'
			return (matched[1] || api_URL.default_protocol || 'https:') + '//'
					+ matched[2] + '/w/api.php';
		}

		library_namespace.err('api_URL: Unknown project: [' + project
				+ ']! Using default API URL.');
		return wiki_API.API_URL;
	}

	// https://www.wikimedia.org/
	api_URL.wikimedia = {
		meta : true,
		commons : true,
		species : true,
		incubator : true,
		wikitech : true
	}
	// project with language prefix
	api_URL.project = {
		wikipedia : true,
		wikibooks : true,
		wikinews : true,
		wikiquote : true,
		wikisource : true,
		wikiversity : true,
		wikivoyage : true,
		wiktionary : true
	};
	api_URL.alias = {};

	/**
	 * setup API URL.
	 * 
	 * @param {wiki_API}session
	 *            正作業中之 wiki_API instance。
	 * @param {String}[API_URL]
	 *            language code or API URL of Wikidata
	 * 
	 * @inner
	 */
	function setup_API_URL(session, API_URL) {
		if (API_URL === true) {
			// force to login.
			API_URL = session.API_URL || wiki_API.API_URL;
		}

		if (API_URL && typeof API_URL === 'string') {
			session.API_URL = api_URL(API_URL);
			// is data session.
			session.is_wikidata = /wikidata/i.test(API_URL);
			delete session.last_page;
			// force to login again: see wiki_API.login
			// 據測試，不同 project 間之 token 不能通用。
			delete session.token.csrftoken;
			delete session.token.lgtoken;
			// library_namespace.set_debug(6);

			if (library_namespace.platform.nodejs) {
				// 初始化 agent。
				// create and keep a new agent. 維持一個獨立的 agent。
				// 以不同 agent 應對不同 host。
				var agent = library_namespace.application.net
				//
				.Ajax.setup_node_net(session.API_URL);
				session.get_URL_options = {
					// start_time : Date.now(),
					// API_URL : session.API_URL,
					agent : agent
				};
			}
		}
	}

	// @see set_default_language()
	function setup_API_language(session, language_code) {
		// e.g., 'zh-yue', 'zh-classical'
		if (/^[a-z\-\d]{2,20}$/i.test(language_code)
		// 不包括 test2.wikipedia.org 之類。
		&& !/test|wiki/i.test(language_code)) {
			session.language
			//
			= language_code = language_code.toLowerCase();
			// apply local lag interval rule.
			if (!(session.lag >= 0) && (language_code in wiki_API.query.lag)) {
				session.lag = wiki_API.query.lag[language_code];
				library_namespace.debug('Use interval ' + session.lag
						+ ' for language ' + language_code, 1,
						'setup_API_language');
			}
		}
	}

	// ------------------------------------------------------------------------

	/**
	 * get NO of namespace
	 * 
	 * @param {String}namespace
	 *            namespace
	 * 
	 * @returns {ℕ⁰:Natural+0}namespace NO.
	 */
	function get_namespace(namespace) {
		if (typeof namespace === 'string'
				&& ((namespace = namespace.toLowerCase()) in get_namespace.hash))
			return get_namespace.hash[namespace];
		if (isNaN(namespace)) {
			if (namespace)
				library_namespace.warn('get_namespace: Invalid namespace: ['
						+ namespace + ']');
			return namespace;
		}
		return namespace | 0;
	}

	/**
	 * The namespace number of the page. 列舉型別 (enumeration)
	 * 
	 * {{NAMESPACENUMBER:{{FULLPAGENAME}}}}
	 * 
	 * @type {Object}
	 * 
	 * @see https://en.wikipedia.org/wiki/Wikipedia:Namespace
	 */
	get_namespace.hash = {
		// Virtual namespaces
		media : -2,
		special : -1,
		// 0: (Main/Article) main namespace 主要(條目內容/內文)命名空間/識別領域
		// 條目 entry 文章 article: ns = 0, 頁面 page: ns = any. 章節/段落 section
		'' : 0,
		// 討論對話頁面
		talk : 1,
		// 使用者頁面
		user : 2,
		user_talk : 3,
		// project
		wikipedia : 4,
		wikipedia_talk : 5,
		// image
		file : 6,
		file_talk : 7,
		mediawiki : 8,
		mediawiki_talk : 9,
		template : 10,
		template_talk : 11,
		help : 12,
		help_talk : 13,
		category : 14,
		category_talk : 15,
		portal : 100,
		portal_talk : 101,
		book : 108,
		book_talk : 109,
		draft : 118,
		draft_talk : 119,
		education_program : 446,
		education_program_talk : 447,
		timedtext : 710,
		timedtext_talk : 711,
		module : 828,
		module_talk : 829,
		topic : 2600
	};

	/**
	 * build ((get_namespace.pattern))
	 */
	(function() {
		var source = [];
		for ( var namespace in get_namespace.hash)
			source.push(namespace);
		// [ , namespace, title ]
		get_namespace.pattern = new RegExp('^(['
				+ source.join('|').replace(/_/g, '[ _]') + ']):(.+)$', 'i');
	})();

	/**
	 * remove namespace part of the title.
	 * 
	 * @param {String}title
	 *            page title 頁面標題。
	 * 
	 * @returns {String}title without namespace
	 */
	function remove_namespace(title) {
		if (typeof title !== 'string') {
			library_namespace.debug(title, 5, 'remove_namespace');
			if (get_page_content.is_page_data(title)) {
				title = title.title;
				// assert: now title is string.
			} else
				return title;
		}
		var matched = title.match(get_namespace.pattern);
		library_namespace.debug(
		//
		'Test [[' + title + ']], get [' + matched + '] using pattern '
				+ get_namespace.pattern, 4, 'remove_namespace');
		if (matched)
			return (matched ? matched[2] : title).trim();
	}

	// ------------------------------------------------------------------------
	// 創建 match pattern 相關函數。

	function upper_case_initial(word) {
		return word.charAt(0).toUpperCase() + word.slice(1);
	}

	/**
	 * 規範/正規化頁面名稱 page name。
	 * 
	 * TODO: 簡化。
	 * 
	 * 這種規範化只能通用於本 library 內。Wikipedia 並未硬性設限。<br />
	 * 依照
	 * [https://www.mediawiki.org/w/api.php?action=query&titles=Wikipedia_talk:Flow&prop=info]，
	 * "Wikipedia_talk:Flow" → "Wikipedia talk:Flow"<br />
	 * 亦即底線 "_" → space " "，首字母大寫。
	 * 
	 * @param {String}page_name
	 *            頁面名 valid page name。
	 * @param {Boolean}[use_underline]
	 *            採用 "_" 取代 " "。
	 * 
	 * @returns {String}規範後之頁面名稱。
	 * 
	 * @see https://en.wikipedia.org/wiki/Wikipedia:Page_name#Technical_restrictions_and_limitations
	 */
	function normalize_page_name(page_name, use_underline) {
		if (!page_name || typeof page_name !== 'string')
			return page_name;

		page_name = page_name.trimRight().replace(/^[\s:]+/, '');

		page_name = use_underline
		// ' ' → '_': 在 URL 上可更簡潔。
		? page_name.replace(/ /g, '_') : page_name.replace(/_/g, ' ');

		page_name = page_name.split(':');
		var has_language;

		page_name.some(function(section, index) {
			section = use_underline ? section.replace(/^[\s_]+/, '') : section
					.trimLeft();
			if (index === page_name.length - 1
			//
			|| !(use_underline ? /^[a-z\-\d_]{2,20}$/i
			//
			: /^[a-z\-\d ]{2,20}$/i).test(section.trimRight())) {
				// page title: 將首個字母轉成大寫。
				page_name[index] = upper_case_initial(section);
				return true;
			}

			if ((use_underline ? section : section.replace(/ /g, '_'))
			//
			.trimRight().toLowerCase() in get_namespace.hash) {
				// Wikipedia namespace
				section = section.trimRight().toLowerCase();
				if (!use_underline) {
					section = section.replace(/_/g, ' ');
				}
				page_name[index] = upper_case_initial(section);

			} else if (has_language) {
				// page title: 將首個字母轉成大寫。
				page_name[index] = upper_case_initial(section);
				return true;

			} else {
				section = use_underline ? section.replace(/[\s_]+$/, '')
						: section.trimRight();
				section = section.toLowerCase();
				if (section.length > 1) {
					// lang code
					has_language = true;
					if (use_underline) {
						section = section.replace(/_/g, '-');
					}
				}
				// else: e.g., [[m:Abc]]
				page_name[index] = section;
			}

		});

		return page_name.join(':');
	}

	// @see wiki_toString
	function normalize_name_pattern(file_name, add_group, remove_namespace) {
		if (get_page_content.is_page_data(file_name))
			file_name = file_name.title;
		if (!file_name)
			return file_name;

		if (typeof file_name === 'string' && file_name.includes('|'))
			file_name = file_name.split('|');

		if (Array.isArray(file_name)) {
			var files = [];
			file_name
					.forEach(function(name) {
						if (name = normalize_name_pattern(name, false,
								remove_namespace))
							files.push(name);
					});
			return (add_group ? '(' : '(?:') + files.join('|') + ')';
		}

		if (remove_namespace) {
			// 去除 namespace。e.g., Template:
			// console.log('去除 namespace: [' + file_name + ']');
			file_name = file_name.replace(/^[^:]+:\s*/, '');
		}

		file_name =
		// wiki file 首字不區分大小寫。
		// the case of the first letter is not significant.
		library_namespace.ignore_first_char_case(
		// escape 特殊字元。注意:照理說來檔案或模板名不應該具有特殊字元！
		library_namespace.to_RegExp_pattern(String(file_name).trim()))
		// 不區分空白與底線。
		.replace(/[ _]/g, '[ _]');

		if (add_group)
			file_name = '(' + file_name + ')';

		return file_name;
	}

	/**
	 * 創建匹配 [[File:file_name]] 之 pattern。
	 * 
	 * @param {String}file_name
	 *            file name.
	 * @param {String}flag
	 *            RegExp flag
	 * 
	 * @returns {RegExp} 能 match [[File:file_name]] 之 pattern。
	 */
	function file_pattern(file_name, flag) {
		return (file_name = normalize_name_pattern(file_name, true))
				//
				&& new RegExp(file_pattern.source.replace(/name/, file_name),
						flag || 'g');
	}

	// [[維基百科:名字空間#文件名字空间]]
	// [[Media:image.png]]：產生一個指向檔案本身的連結
	// https://github.com/dbpedia/extraction-framework/blob/master/core/src/main/settings/zhwiki-configuration.xml
	// https://github.com/dbpedia/extraction-framework/blob/master/core/src/main/scala/org/dbpedia/extraction/wikiparser/impl/wikipedia/Namespaces.scala
	var PATTERN_file_prefix = 'File|Image|Media|[檔档]案|[圖图]像|文件|媒[體体](?:文件)?';

	file_pattern.source =
	// 不允許 [\s\n]，僅允許 ' '。
	// [ ':', file name, 接續 ]
	/\[\[ *(?:(:) *)?(?:Tag) *: *name *(\||\]\])/
	// [[ :File:name]] === [[File:name]]
	.source.replace('Tag', library_namespace
			.ignore_case_pattern(PATTERN_file_prefix));

	// [ all, file name ]
	PATTERN_file_prefix = new RegExp('^ *(?:: *)?(?:' + PATTERN_file_prefix
			+ ') *: *([^\| ][^\| ]*)', 'i');

	// ------------------------------------------------------------------------

	/**
	 * 將 page data list 轉為 hash。<br />
	 * cf. Array.prototype.to_hash @ data.native
	 * 
	 * @param {Array}page_data_list
	 *            list of page_data.
	 * @param {Boolean}use_id
	 *            use page id instead of title.
	 * 
	 * @returns {Object}title/id hash
	 */
	function list_to_hash(page_data_list, use_id) {
		var hash = library_namespace.null_Object();
		page_data_list.forEach(use_id ? function(page_data) {
			// = true
			hash[page_data.pageid] = page_data;
		} : function(page_data) {
			// = true
			hash[page_data.title] = page_data;
		});
		return hash;
	}

	/**
	 * 去掉 page data list 中重複的 items。<br />
	 * cf. Array.prototype.uniq @ data.native
	 * 
	 * @param {Array}page_data_list
	 *            list of page_data.
	 * 
	 * @returns {Array}unique list
	 */
	function unique_list(page_data_list) {
		var array = [],
		// 以 hash 純量 index 加速判別是否重複。
		hash = library_namespace.null_Object();

		page_data_list.forEach(function(page_data) {
			var key = typeof page_data == 'string' ? page_data
					: page_data.title;
			if (!(key in hash)) {
				hash[key] = null;
				// 能確保順序不變。
				array.push(page_data);
			}
		});

		return array;
	}

	// --------------------------------------------------------------------------------------------
	// parse wikitext.

	/**
	 * 不包含可 parse 之要素，不包含 text 之 type。<br />
	 * 不應包含 section title，因可能有 "==[[]]==" 的情況。
	 * 
	 * @type {Object}
	 */
	var atom_type = {
		namespace : true,
		page_title : true,
		external_link : true,
		URL : true,
		style : true,
		tag_single : true,
		comment : true
	};

	/**
	 * 設定 token 為指定 type。將 token 轉為指定 type。
	 * 
	 * @param {Array}token
	 *            parse_wikitext() 解析 wikitext 所得之，以 {Array} 組成之結構。
	 * @param {String}type
	 *            欲指定之類型。 e.g., 'transclusion'.
	 * 
	 * @returns {Array}token
	 * 
	 * @see wiki_toString
	 */
	function set_wiki_type(token, type) {
		if (typeof token === 'string') {
			token = [ token ];
		} else if (!Array.isArray(token)) {
			library_namespace.warn('set_wiki_type: The token is not Array!');
		}
		// assert: Array.isArray(token)
		token.type = type;
		if (type in atom_type)
			token.is_atom = true;
		// check
		if (false && !wiki_toString[type])
			throw new Error('.toString() not exists for type [' + type + ']!');
		token.toString = wiki_toString[type];
		return token;
	}

	/*
	 * 
	 * should use: class Wiki_page extends Array { }
	 * http://www.2ality.com/2015/02/es6-classes-final.html
	 * 
	 */

	/**
	 * constructor (建構子) of {wiki page parser}. wikitext 語法分析程式, wikitext 語法分析器.
	 * 
	 * TODO:<code>

	should use:
	class Wiki_page extends Array { }
	http://www.2ality.com/2015/02/es6-classes-final.html

	 * </code>
	 * 
	 * @param {String|Object}wikitext
	 *            wikitext / page data to parse
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @returns {wiki page parser}
	 */
	function page_parser(wikitext, options) {
		if (typeof wikitext === 'string') {
			wikitext = [ wikitext ];
		} else if (get_page_content.is_page_data(wikitext)) {
			// 可以用 "CeL.wiki.parser(page_data).parse();" 來設置 parser。
			var page_data = wikitext;
			page_data.parsed = wikitext = [ get_page_content(page_data) ];
			wikitext.page = page_data;
		} else if (!wikitext) {
			library_namespace.warn('page_parser: No wikitext specified.');
			wikitext = [];
		} else {
			throw new Error('page_parser: Unknown wikitext: [' + wikitext
					+ '].');
		}

		if (library_namespace.is_Object(options)) {
			wikitext.options = options;
		}
		// copy prototype methods
		Object.assign(wikitext, page_prototype);
		set_wiki_type(wikitext, 'text');
		return wikitext;
	}

	/** {Object}prototype of {wiki page parser} */
	var page_prototype = {
		// 在執行 .each() 之前，應該先執行 .parse()。
		each : for_each_token,
		parse : parse_page
	};

	/** {Object}alias name of type */
	page_parser.type_alias = {
		row : 'table_row',
		tr : 'table_row',
		// table_cell 包含 th + td，須自行判別！
		th : 'table_cell',
		td : 'table_cell',
		template : 'transclusion',
		'' : 'plain'
	};

	// ------------------------------------------

	if (false) {
		wikitext = 'a\n[[File:f.jpg|thumb|d]]\nb';
		CeL.wiki.parser(wikitext).parse().each('namespace',
				function(token, index, parent) {
					console.log([ index, token, parent ]);
				}, true).toString();
	}

	/**
	 * 對所有指定類型 type，皆執行特定作業 processor。
	 * 
	 * @param {String}[type]
	 *            欲搜尋之類型。 e.g., 'template'. see ((wiki_toString)).<br />
	 *            未指定: 處理所有節點。
	 * @param {Function}processor
	 *            執行特定作業: processor({Array|String|undefined}inside token list,
	 *            {ℕ⁰:Natural+0}index, {Array}parent) {<br />
	 *            return {String}wikitext or {Object}element;}
	 * @param {Boolean}[modify_this]
	 *            若 processor 的回傳值為{String}wikitext，則將指定類型節點替換/replace作此回傳值。
	 * 
	 * @returns {wiki page parser}
	 * 
	 * @see page_parser.type_alias
	 */
	function for_each_token(type, processor, modify_this) {
		if (typeof type === 'function' && modify_this === undefined)
			// shift arguments.
			modify_this = processor, processor = type;
		if (type && typeof type !== 'string') {
			library_namespace.warn('for_each_token: Invalid type specified! ['
					+ type + ']');
			return this;
		}
		// normalize type
		type = type.toLowerCase().replace(/\s/g, '_');
		if (type in page_parser.type_alias)
			type = page_parser.type_alias[type];

		if (!this.parsed)
			// 因為本函數為 CeL.wiki.parser(content) 最常使用者，
			// 因此放在這少一道 .parse() 工序。
			this.parse();

		// 遍歷 tokens
		function traversal_tokens(_this) {
			_this.forEach(function(token, index) {
				// console.log('token:');
				// console.log(token);

				if (!type
				// 'plain': 對所有 plain text 或尚未 parse 的 wikitext.，皆執行特定作業。
				|| type === (Array.isArray(token) ? token.type : 'plain')) {
					// get result. 須注意: 此 token 可能為 Array, string, undefined！
					var result = processor(token, index, _this);
					if (modify_this) {
						if (typeof result === 'string')
							// {String}wikitext to ( {Object}element or '' )
							result = parse_wikitext(result);
						if (typeof result === 'string'
						//
						|| Array.isArray(result)) {
							// 將指定類型節點替換作此回傳值。
							_this[index] = token = result;
						}
					}
				}

				// depth-first search (DFS) 向下層巡覽，再進一步處理。
				// is_atom: 不包含可 parse 之要素，不包含 text。
				if (Array.isArray(token) && !token.is_atom
				// comment 可以放在任何地方，因此能滲透至任一層。
				// 但這可能性已經在 parse_wikitext() 中偵測並去除。
				// && type !== 'comment'
				) {
					traversal_tokens(token);
				}
			});
		}

		traversal_tokens(this);

		return this;
	}

	/**
	 * 設定好，並執行解析頁面的作業。
	 * 
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @returns {wiki page parser}
	 * 
	 * @see parse_wikitext()
	 */
	function parse_page(options) {
		if (!this.parsed) {
			// assert: this = [ {String} ]
			var parsed = parse_wikitext(this[0], options);
			// library_namespace.log(parsed);
			if (Array.isArray(parsed) && parsed.type === 'text') {
				this.pop();
				Array.prototype.push.apply(this, parsed);
			} else
				this[0] = parsed;
			this.parsed = true;
		}
		return this;
	}

	/**
	 * 將特殊標記解譯/還原成 {Array} 組成之結構。
	 * 
	 * @param {Array}queue
	 *            temporary queue.
	 * @param {String}include_mark
	 *            解析用之起始特殊標記。
	 * @param {String}end_mark
	 *            結束之特殊標記。
	 * 
	 * @see parse_wikitext()
	 */
	function resolve_escaped(queue, include_mark, end_mark) {
		library_namespace.debug('queue: ' + queue.join('\n--- '), 4,
				'resolve_escaped');
		queue.forEach(function(item, index) {
			library_namespace.debug([ 'item', index, item ], 4,
					'resolve_escaped');
			if (typeof item !== 'string')
				// assert: Array.isArray(item)
				return;

			// result queue
			var result = [];

			item.split(include_mark).forEach(function(token, index) {
				if (index === 0) {
					if (token)
						result.push(token);
					return;
				}
				index = token.indexOf(end_mark);
				if (index === 0) {
					result.push(include_mark);
					return;
				}
				result.push(queue[+token.slice(0, index)]);
				if (token = token.slice(index + end_mark.length))
					result.push(token);
			});

			if (result.length > 1)
				set_wiki_type(result, 'text');
			else
				result = result[0];
			if (result.includes(include_mark))
				throw new Error('resolve_escaped: 仍有 include mark 殘留！');
			queue[index] = result;
		});
	}

	// 經測試發現 {{...}} 名稱中不可有 [{}<>\[\]]
	// while(/{{{[^{}\[\]]+}}}/g.exec(wikitext));
	// 模板名#後的內容會忽略。
	var PATTERN_transclusion = /{{[\s\n]*([^\s\n#\|{}<>\[\]][^#\|{}<>\[\]]*)(?:#[^\|{}]*)?((?:\|[^<>\[\]]*)*?)}}/g,
	//
	PATTERN_link = /\[\[[\s\n]*([^\s\n\|{}<>\[\]][^\|{}<>\[\]]*)((?:\|[^\|{}<>\[\]]*)*)\]\]/g,
	/** {String}以"|"分開之 wiki tag name。 [[Help:Wiki markup]], HTML tags. 不包含 <a>！ */
	markup_tags = 'nowiki|references|ref|includeonly|noinclude|onlyinclude|syntaxhighlight|br|hr|bdi|b|del|ins|i|u|font|big|small|sub|sup|h[1-6]|cite|code|em|strike|strong|s|tt|var|div|center|blockquote|[oud]l|table|caption|pre|ruby|r[tbp]|p|span|abbr|dfn|kbd|samp|data|time|mark';

	/**
	 * .toString() of wiki elements<br />
	 * parse_wikitext() 將把 wikitext 解析為各 {Array} 組成之結構。當以 .toString() 結合時，將呼叫
	 * .join() 組合各次元素。此處即為各 .toString() 之定義。<br />
	 * 所有的 key (type) 皆為小寫。
	 * 
	 * @type {Object}
	 * 
	 * @see parse_wikitext()
	 */
	var wiki_toString = {
		// Internal/interwiki link : language links : category links, file,
		// subst,
		// ... : title
		// e.g., [[m:en:Help:Parser function]], [[m:Help:Interwiki_linking]],
		// [[:File:image.png]], [[wikt:en:Wiktionary:A]],
		// [[:en:Template:Editnotices/Group/Wikipedia:Miscellany for deletion]]
		// [[:en:Marvel vs. Capcom 3: Fate of Two Worlds]]
		//
		// @see [[Wikipedia:Namespace]]
		// https://www.mediawiki.org/wiki/Markup_spec#Namespaces
		// [[ m : abc ]] is OK, as "m : abc".
		// [[: en : abc ]] is OK, as "en : abc".
		// [[ :en:abc]] is NOT OK.
		namespace : function() {
			return this.join(':');
		},
		// page title, template name
		page_title : function() {
			return this.join(':');
		},
		// link 的變體。但可採用 .name 取得 file name。
		file : function() {
			return '[[' + this.join('|') + ']]';
		},
		// 內部連結
		link : function() {
			return '[[' + this.join('|') + ']]';
		},
		// External link
		external_link : function() {
			return '[' + this.join(this.delimiter || ' ') + ']';
		},
		url : function() {
			return this.join('');
		},
		// template parameter
		parameter : function() {
			return '{{{' + this.join('|') + '}}}';
		},
		// e.g., template
		transclusion : function() {
			return '{{' + this.join('|') + '}}';
		},
		// [[Help:Table]]
		table : function() {
			// this: [ table style, row, row, ... ]
			return '{|' + this.join('\n|-') + '\n|}';
		},
		// table caption
		caption : function() {
			// this: [ main caption, invalid caption, ... ]
			return '\n|+' + this.join('||');
		},
		table_row : function() {
			// this: [ row style, cell, cell, ... ]
			return this.join('');
		},
		table_cell : function() {
			// this: [ contents ]
			// this.delimiter:
			// /\n[!|]|!!|\|\|/ or undefined (在 style/第一區間就已當作 cell)
			return (this.delimiter || '') + this.join('');
		},
		// attributes, styles
		style : function() {
			return this.join('');
		},
		// [[H:Convert]]
		convert : function() {
			return '-{' + this.join('|') + '}-';
		},
		// section title
		section_title : function() {
			var level = '='.repeat(this.level);
			return level
			// this.join(''): 必須與 text 相同。見 parse_wikitext.title。
			+ this.join('') + level + (this.postfix || '');
		},
		// [[Help:Wiki markup]], HTML tags
		tag : function() {
			// this: [ attributes, inner nodes ].tag
			return '<' + this.tag + (this[0] || '') + '>'
					+ this.slice(1).join('') + '</'
					+ (this.end_tag || this.tag) + '>';
		},
		tag_single : function() {
			// this: [ attributes ].tag
			return '<' + this.tag + this.join('') + '>';
		},
		// comments: <!-- ... -->
		comment : function() {
			// "<\": for Eclipse JSDoc.
			return '<\!--' + this.join('') + (this.no_end ? '' : '-->');
		},
		line : function() {
			// https://www.mediawiki.org/wiki/Markup_spec/BNF/Article
			// NewLine = ? carriage return and line feed ? ;
			return this.join('\n');
		},
		// plain text 或尚未 parse 的 wikitext.
		text : function() {
			return this.join('');
		}
	};

	/**
	 * parse The MediaWiki markup language (wikitext).
	 * 
	 * TODO:<code>
	提高效率。e.g., [[三国杀武将列表]], [[世界大桥列表]], [[三国杀武将列表]]<br />
	可能為模板參數特殊設計？有些 template 內含不完整的起始或結尾，使 parameter 亦未首尾對應。

	{{L<!-- -->L}} .valueOf() === '{{LL}}'
	<p<!-- -->re>...</pre>
	CeL.wiki.page('上海外国语大学',function(page_data){CeL.wiki.parser(page_data).parse();})
	[https://a.b <a>a</a><!-- -->]
	[[<a>a</a>]]
	CeL.wiki.parser('a[[未來日記-ANOTHER:WORLD-]]b').parse()[1]
	<nowiki>...<!-- -->...</nowiki> 中的註解不應被削掉!

	 * </code>
	 * 
	 * 此功能之工作機制/原理：<br />
	 * 找出完整的最小單元，並將之 push 入 queue，並把原 string 中之單元 token 替換成:<br />
	 * {String}include_mark + ({ℕ⁰:Natural+0}index of queue) + end_mark<br />
	 * e.g.,<br />
	 * "a[[p]]b{{t}}" →<br />
	 * "a[[p]]b\00;", queue = [ ["t"].type='transclusion' ] →<br />
	 * "a\01;b\00;", queue = [ ["t"].type='transclusion', ["p"].type='link' ]<br />
	 * 最後再依 queue 與剩下的 wikitext，以 resolve_escaped() 作 resolve。
	 * 
	 * @param {String}wikitext
	 *            wikitext to parse
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * @param {Array}[queue]
	 *            temporary queue. 基本上僅供內部使用。
	 * 
	 * @returns {Array}parsed data
	 * 
	 * @see [[:en:Wiki markup]], [[Wiki標記式語言]]
	 *      https://www.mediawiki.org/wiki/Markup_spec/BNF/Article
	 *      https://www.mediawiki.org/wiki/Markup_spec/BNF/Inline_text
	 *      https://www.mediawiki.org/wiki/Markup_spec
	 *      https://www.mediawiki.org/wiki/Wikitext
	 *      https://doc.wikimedia.org/mediawiki-core/master/php/html/Parser_8php.html
	 *      Parser.php: PHP parser that converts wiki markup to HTML.
	 */
	function parse_wikitext(wikitext, options, queue) {
		if (!wikitext)
			return wikitext;

		function _set_wiki_type(token, type) {
			// 這可能性已經在下面個別處理程序中偵測並去除。
			if (false && typeof token === 'string'
					&& token.includes(include_mark)) {
				queue.push(token);
				resolve_escaped(queue, include_mark, end_mark);
				token = [ queue.pop() ];
			}
			return set_wiki_type(token, type);
		}

		var
		/**
		 * 解析用之起始特殊標記。<br />
		 * 需找出一個文件中不可包含，亦不會被解析的字串，作為解析用之起始特殊標記。<br />
		 * e.g., '\u0000'.<br />
		 * include_mark + ({ℕ⁰:Natural+0}index of queue) + end_mark
		 * 
		 * @type {String}
		 */
		include_mark = options && options.include_mark || '\0',
		/** {String}結束之特殊標記。 end of include_mark. 不可為數字 (\d) 或 include_mark。 */
		end_mark = options && options.end_mark || ';',
		/** {Boolean}是否順便作正規化。預設不會規範頁面內容。 */
		normalize = options && options.normalize,
		/** {Array}是否需要初始化。 [ {String}prefix added, {String}postfix added ] */
		initialized_fix = !queue && [ '', '' ];

		if (/\d/.test(end_mark) || include_mark.includes(end_mark))
			throw new Error('Error end of include_mark!');

		if (initialized_fix) {
			// 初始化。
			wikitext = wikitext.replace(/\r\n/g, '\n').replace(
			// 先 escape 掉會造成問題之 chars。
			new RegExp(include_mark.replace(/([\s\S])/g, '\\$1'), 'g'),
					include_mark + end_mark);
			if (!wikitext.startsWith('\n') &&
			// /\n([*#:;]+|[= ]|{\|)/:
			// https://www.mediawiki.org/wiki/Markup_spec/BNF/Article#Wiki-page
			// https://www.mediawiki.org/wiki/Markup_spec#Start_of_line_only
			/^(?:[*#:;= ]|{\|)/.test(wikitext))
				wikitext = (initialized_fix[0] = '\n') + wikitext;
			if (!wikitext.endsWith('\n'))
				wikitext += (initialized_fix[1] = '\n');
			// temporary queue
			queue = [];
		}

		if (options && typeof options.prefix === 'function')
			wikitext = options.prefix(wikitext, queue, include_mark, end_mark)
					|| wikitext;

		// ------------------------------------------------------------------------
		// parse sequence start / start parse

		// parse 範圍基本上由小到大。
		// e.g., transclusion 不能包括 table，因此在 table 前。

		// 可順便作正規化/維護清理/修正明顯破壞/修正維基語法/維基化，
		// 例如修復章節標題 section title 前後 level 不一，
		// table "|-" 未起新行等。

		// ----------------------------------------------------
		// comments: <!-- ... -->
		// "<\": for Eclipse JSDoc.
		if (initialized_fix) {
			// 因為前後標記間所有內容無作用、能置於任何地方（除了 <nowiki> 中，"<no<!---->wiki>"
			// 之類），又無需向前回溯；只需在第一次檢測，不會有遺珠之憾。
			wikitext = wikitext.replace(/<\!--([\s\S]*?)-->/g,
					function(all, parameters) {
						// 不再作 parse。
						queue.push(_set_wiki_type(parameters, 'comment'));
						return include_mark + (queue.length - 1) + end_mark;
					})
			// 缺 end mark
			.replace(/<\!--([\s\S]*)$/g, function(all, parameters) {
				// 不再作 parse。
				if (initialized_fix[1]) {
					parameters = parameters.slice(0,
					//
					-initialized_fix[1].length);
					initialized_fix[1] = '';
				}
				parameters = _set_wiki_type(parameters, 'comment');
				if (!normalize)
					parameters.no_end = true;
				queue.push(parameters);
				return include_mark + (queue.length - 1) + end_mark;
			});
		}

		// 為了 "{{Tl|a<ref>[http://a.a.a b|c {{!}} {{CURRENTHOUR}}]</ref>}}"，
		// 將 -{}-, [], [[]] 等，所有中間可穿插 "|" 的置於 {{{}}}, {{}} 前。

		// ----------------------------------------------------
		// -{...}-
		wikitext = wikitext.replace_till_stable(/-{(.+?)}-/g, function(all,
				parameters) {
			// 自 end_mark 向前回溯。
			var index = parameters.lastIndexOf('-{'), prevoius;
			if (index > 0) {
				prevoius = '-{' + parameters.slice(0, index);
				parameters = parameters.slice(index + '}-'.length);
			} else {
				prevoius = '';
			}
			library_namespace.debug(prevoius + ' + ' + parameters, 4,
					'parse_wikitext.convert');

			parameters = parameters.split('|').map(function(token, index) {
				// 經過改變，需再進一步處理。
				return parse_wikitext(token, options, queue);
			});
			_set_wiki_type(parameters, 'convert');
			queue.push(parameters);
			return prevoius + include_mark + (queue.length - 1) + end_mark;
		});

		// ----------------------------------------------------
		// 須注意: [[p|\nt]] 可，但 [[p\n|t]] 不可！
		// [[~:~|~]], [[~:~:~|~]]
		wikitext = wikitext.replace_till_stable(
		// or use ((PATTERN_link))
		/\[\[([^\[\]]+)\]\]/g, function(all, parameters) {
			if (normalize)
				parameters = parameters.trim();
			// 自 end_mark 向前回溯。
			var index = parameters.lastIndexOf('[['), prevoius;
			if (index > 0) {
				prevoius = '[[' + parameters.slice(0, index);
				parameters = parameters.slice(index + ']]'.length);
			} else {
				prevoius = '';
			}
			library_namespace.debug(prevoius + ' + ' + parameters, 4,
					'parse_wikitext.link');

			// test [[file:name|...|...]]
			var file_matched = parameters.match(PATTERN_file_prefix);
			parameters = parameters.split('|').map(function(token, index) {
				return index === 0
				// 預防有特殊 elements 置入其中。此時將之當作普通 element 看待。
				&& !token.includes(include_mark) ? _set_wiki_type(
				// TODO: normalize 對 [[文章名稱 : 次名稱]] 可能出現問題。
				token.split(normalize ? /\s*:\s*/ : ':'), 'namespace')
				// 經過改變，需再進一步處理。
				: parse_wikitext(token, options, queue);
			});
			if (file_matched)
				// file name
				parameters.name = file_matched[1];
			_set_wiki_type(parameters, file_matched ? 'file' : 'link');
			queue.push(parameters);
			return prevoius + include_mark + (queue.length - 1) + end_mark;
		});

		// ----------------------------------------------------
		// [http://... ...]
		// TODO: [{{}} ...]
		wikitext = wikitext.replace_till_stable(
		// 2016/2/23: 經測試，若為結尾 /$/ 不會 parse 成 external link。
		/\[((?:https?:|ftp:)?\/\/[^\/\s][^\]\s]+)(?:(\s)([^\]]*))?\]/gi,
		//
		function(all, URL, delimiter, parameters) {
			URL = [ URL.includes(include_mark)
			// 預防有特殊 elements 置入其中。此時將之當作普通 element 看待。
			? parse_wikitext(URL, options, queue)
			//
			: _set_wiki_type(URL, 'url') ];
			if (delimiter) {
				if (normalize)
					parameters = parameters.trim();
				else {
					// 紀錄 delimiter，否則 .toString() 時 .join() 後會與原先不同。
					if (delimiter !== ' ')
						URL.delimiter = delimiter;
					// parameters 已去除最前面的 delimiter (space)。
				}
				// 經過改變，需再進一步處理。
				URL.push(parse_wikitext(parameters, options, queue));
			}
			_set_wiki_type(URL, 'external_link');
			queue.push(URL);
			return include_mark + (queue.length - 1) + end_mark;
		});

		// ----------------------------------------------------
		// {{{...}}} 需在 {{...}} 之前解析。
		// https://zh.wikipedia.org/wiki/Help:%E6%A8%A1%E6%9D%BF
		// 在模板頁面中，用三個大括弧可以讀取參數。
		// MediaWiki 會把{{{{{{XYZ}}}}}}解析為{{{ {{{XYZ}}} }}}而不是{{ {{ {{XYZ}} }} }}
		wikitext = wikitext.replace_till_stable(
		//
		/{{{([^{}][\s\S]*?)}}}/g, function(all, parameters) {
			// 自 end_mark 向前回溯。
			var index = parameters.lastIndexOf('{{{'), prevoius;
			if (index > 0) {
				prevoius = '{{{' + parameters.slice(0, index);
				parameters = parameters.slice(index + '}}}'.length);
			} else {
				prevoius = '';
			}
			library_namespace.debug(prevoius + ' + ' + parameters, 4,
					'parse_wikitext.parameter');

			parameters = parameters.split('|').map(function(token, index) {
				return index === 0
				// 預防有特殊 elements 置入其中。此時將之當作普通 element 看待。
				&& !token.includes(include_mark)
				//
				? _set_wiki_type(
				//
				token.split(normalize ? /\s*:\s*/ : ':'), 'page_title')
				// 經過改變，需再進一步處理。
				: parse_wikitext(token, options, queue);
			});
			_set_wiki_type(parameters, 'parameter');
			queue.push(parameters);
			return prevoius + include_mark + (queue.length - 1) + end_mark;
		});

		// ----------------------------------------------------
		// 模板（英語：Template，又譯作「樣板」、「範本」）
		// {{Template name|}}
		wikitext = wikitext.replace_till_stable(
		// or use ((PATTERN_transclusion))
		/{{([^{}][\s\S]*?)}}/g,
		//
		function(all, parameters) {
			// 自 end_mark 向前回溯。
			var index = parameters.lastIndexOf('{{'), prevoius,
			// 因為可能有 "length=1.1" 之類的設定，因此不能採用 Array。
			_parameters = {};
			if (index > 0) {
				prevoius = '{{' + parameters.slice(0, index);
				parameters = parameters.slice(index + '}}'.length);
			} else {
				prevoius = '';
			}
			library_namespace.debug(prevoius + ' + ' + parameters, 4,
					'parse_wikitext.transclusion');

			index = 1;
			parameters = parameters.split('|').map(function(token, _index) {
				if (_index === 0
				// 預防有特殊 elements 置入其中。此時將之當作普通 element 看待。
				// e.g., {{ #expr: {{CURRENTHOUR}}+8}}}}
				&& !token.includes(include_mark)) {
					return _set_wiki_type(
					//
					token.split(normalize ? /\s*:\s*/ : ':'), 'page_title');
				}

				// 經過改變，需再進一步處理。
				token = parse_wikitext(token, options, queue);

				var _token = token;
				if (Array.isArray(_token)) {
					_token = _token[0];
				}
				if (typeof _token === 'string') {
					_token = _token.trim();
					// @see function parse_template()
					var matched = _token.match(/^([^=]+)=(.*)$/);
					if (matched) {
						var key = matched[1].trimRight(),
						//
						value = matched[2].trimLeft();

						// 若參數名重複: @see [[Category:調用重複模板參數的頁面]]
						// 如果一個模板中的一個參數使用了多於一個值，則只有最後一個值會在顯示對應模板時顯示。
						// parser 調用超過一個Template中參數的值，只有最後提供的值會被使用。
						if (typeof _token === 'string') {
							_parameters[key] = value;
						} else {
							// assert: Array.isArray(token)
							_token = token.clone();
							_token[0] = value;
							_parameters[key] = _token;
						}
					} else {
						_parameters[index++]
						// TODO: token 本身並未 .trim()
						= typeof token === 'string' ? _token : token;
					}

				} else {
					// e.g., {{t|[http://... ...]}}
					if (library_namespace.is_debug(3)) {
						library_namespace.err(
						//
						'parse_wikitext.transclusion: Can not parse ['
						//
						+ token + ']');
						library_namespace.err(token);
					}
					// TODO: token 本身並未 .trim()
					_parameters[index++] = token;
				}

				return token;
			});

			parameters.name = parameters[0].toString().trim().replace(
					/\s*:\s*/g, ':');
			parameters.parameters = _parameters;

			_set_wiki_type(parameters, 'transclusion');
			queue.push(parameters);
			// TODO: parameters.parameters = []
			return prevoius + include_mark + (queue.length - 1) + end_mark;
		});

		// ----------------------------------------------------
		// [[Help:HTML in wikitext]]
		// 由於 <tag>... 可能被 {{Template}} 截斷，因此先處理 {{Template}} 再處理 <t></t>。
		// 先處理 <t></t> 再處理 <t/>，預防單獨的 <t> 被先處理了。

		// 不採用 global pattern，預防 multitasking 並行處理。
		var PATTERN_TAG = new RegExp('<(' + markup_tags
				+ ')(\\s[^<>]*)?>([\\s\\S]*?)<\\/(\\1)>', 'gi');

		// HTML tags that must be closed.
		// <pre>...</pre>, <code>int f()</code>
		wikitext = wikitext.replace_till_stable(PATTERN_TAG, function(all, tag,
				attribute, inner, end_tag) {
			// 在章節標題、表格 td/th 或 template parameter 結束時，
			// 部分 HTML font style tag 似乎會被截斷，自動重設屬性，不會延續下去。
			// 因為已經先處理 {{Template}}，因此不需要用 /\n(?:[=|!]|\|})|[|!}]{2}/。
			if (/\n(?:[=|!]|\|})|[|!]{2}/.test(inner)) {
				// 此時視為一般 text，當作未匹配 match 成功。
				return all;
			}
			// 自 end_mark (tag 結尾) 向前回溯，檢查是否有同名的 tag。
			var matched = inner.match(new RegExp(
			//
			'<(' + tag + ')(\\s[^<>]*)?>([\s\S]*?)$', 'i')), prevoius;
			if (matched) {
				prevoius = all.slice(0, -matched[0].length
				// length of </end_tag>
				- end_tag.length - 3);
				tag = matched[1];
				attribute = matched[2];
				inner = matched[3];
			} else {
				prevoius = '';
			}
			library_namespace.debug(prevoius + ' + <' + tag + '>', 4,
					'parse_wikitext.tag');

			// 經過改變，需再進一步處理。
			all = parse_wikitext(inner, options, queue);
			if (all.type !== 'text')
				all = [ all ];
			if (normalize)
				tag = tag.toLowerCase();
			else if (tag !== end_tag)
				all.end_tag = end_tag;
			all.tag = tag;
			all.unshift(parse_wikitext(attribute, options, queue));
			_set_wiki_type(all, 'tag');
			queue.push(all);
			return prevoius + include_mark + (queue.length - 1) + end_mark;
		});

		// ----------------------------------------------------
		// single tags. e.g., <hr />
		// TODO: <nowiki /> 能斷開如 [[L<nowiki />L]]
		wikitext = wikitext.replace_till_stable(
		// HTML tags that may not be closed
		/<(nowiki|references|ref|[bh]r|li|d[td]|center)(\s[^<>]*|\/)?>/gi,
		//
		function(all, tag, attribute) {
			if (attribute) {
				if (normalize)
					attribute = attribute.replace(/[\s\/]*$/, ' /');
				// 預防有特殊 elements 置入其中。此時將之當作普通 element 看待。
				all = parse_wikitext(attribute, options, queue);
				if (all.type !== 'text')
					all = [ all ];
			} else
				// use '' as attribute in case the .join() in .toString()
				// doesn't
				// work.
				all = [ '' ];
			if (normalize)
				tag = tag.toLowerCase();
			all.tag = tag;
			_set_wiki_type(all, 'tag_single');
			queue.push(all);
			return include_mark + (queue.length - 1) + end_mark;
		});

		// ----------------------------------------------------
		// table: \n{| ... \n|}
		// 因為 table 中較可能包含 {{Template}}，但 {{Template}} 少包含 table，
		// 因此先處理 {{Template}} 再處理 table。
		// {|表示表格開始，|}表示表格結束。
		wikitext = wikitext.replace_till_stable(
		//
		/\n{\|([\s\S]*?)\n\|}/g, function(all, parameters) {
			// 經測試，table 不會向前回溯。
			// 處理表格標題。
			var main_caption;
			parameters = parameters.replace(/\n\|\+(.*)/g, function(all,
					caption) {
				// '||': 應採用 /\n(?:\|\|?|!)|\|\||!!/
				caption = caption.split('||').map(function(piece) {
					return parse_wikitext(piece, options, queue);
				});
				if (main_caption === undefined)
					// 表格標題以首次出現的為主。
					// .toString(): 可能會包括 include_mark, end_mark，應去除之！
					main_caption = caption[0].toString().trim();
				// 'table_caption'
				caption = _set_wiki_type(caption, 'caption');
				queue.push(caption);
				return include_mark + (queue.length - 1) + end_mark;
			});
			// 添加新行由一個豎線和連字符 "|-" 組成。
			parameters = parameters.split('\n|-').map(function(token, index) {
				if (index === 0
				// 預防有特殊 elements 置入其中。此時將之當作普通 element 看待。
				&& !token.includes(include_mark)
				// 含有 delimiter 的話，即使位在 "{|" 之後，依舊會被當作 row。
				&& !/\n[!|]|!!|\|\|/.test(token)) {
					// table style / format modifier (not displayed)
					// 'table_style'
					// "\n|-" 後面的 string
					return _set_wiki_type(token, 'style');
				}
				var row, matched, delimiter,
				// 分隔 <td>, <th>
				// [ all, inner, delimiter ]
				// 必須有實體才能如預期作 .exec()。
				// "\n|| t" === "\n| t"
				PATTERN_CELL = /([\s\S]*?)(\n(?:\|\|?|!)|\|\||!!|$)/g;
				while (matched = PATTERN_CELL.exec(token)) {
					if (matched[2].length === 3 && matched[2].charAt(2)
					// e.g., "\n||| t"
					=== token.charAt(PATTERN_CELL.lastIndex)) {
						// 此時 matched 須回退 1字元。
						matched[2] = matched[2].slice(0, -1);
						PATTERN_CELL.lastIndex--;
					}
					if (row || /[<>]/.test(token)) {
						var cell = matched[1].match(/^([^|]+)(\|[\s\S]*)$/);
						if (cell)
							cell = [ cell[1].includes(include_mark)
							// 預防有特殊 elements 置入其中。此時將之當作普通 element 看待。
							? parse_wikitext(cell[1], options, queue)
							//
							: _set_wiki_type(cell[1],
							// cell style / format modifier (not displayed)
							'style'),
							//
							parse_wikitext(cell[2], options, queue) ];
						else {
							// 經過改變，需再進一步處理。
							cell = parse_wikitext(matched[1], options, queue);
							if (cell.type !== 'text')
								// {String} or other elements
								cell = [ cell ];
						}
						_set_wiki_type(cell, 'table_cell');

						if (delimiter) {
							cell.delimiter = delimiter;
							cell.is_head = delimiter.startsWith('\n')
							// TODO: .is_head, .table_type 擇一。
							? delimiter.endsWith('!') : row.is_head;
							// is cell <th> or <td> ?
							cell.table_type = cell.is_head ? 'th' : 'td';
						}

						if (!row)
							row = [];
						row.push(cell);

					} else {
						// assert: matched.index === 0
						row = [ matched[1].includes(include_mark)
						// 預防有特殊 elements 置入其中。此時將之當作普通 element 看待。
						? parse_wikitext(matched[1], options, queue)
						//
						: _set_wiki_type(matched[1],
						// row style / format modifier (not displayed)
						'style') ];
					}

					// matched[2] 屬於下一 cell。
					delimiter = matched[2];
					if (!delimiter)
						// assert: /$/, no separater, ended.
						break;

					// assert: !!delimiter === true, and is the first time
					// matched.
					if (!('is_head' in row)
					// 初始設定本行之 type。
					&& !(row.is_head = delimiter.includes('!'))) {
						// 經測試，當此行非 table head 時，會省略 '!!' 不匹配。
						// 但 '\n!' 仍有作用。
						var lastIndex = PATTERN_CELL.lastIndex;
						// console.log("省略 '!!' 不匹配: " +
						// token.slice(lastIndex));
						PATTERN_CELL = /([\s\S]*?)(\n(?:\|\|?|!)|\|\||$)/g;
						PATTERN_CELL.lastIndex = lastIndex;
					}
				}
				// assert: Array.isArray(row)
				return _set_wiki_type(row, 'table_row');
			});

			_set_wiki_type(parameters, 'table');
			if (main_caption !== undefined)
				parameters.caption = main_caption;
			queue.push(parameters);
			// 因為 "\n" 在 wikitext 中為重要標記，因此 restore 之。
			return '\n' + include_mark + (queue.length - 1) + end_mark;
		});

		// TODO: Magic words
		// '''~''' 不能跨行！ 注意: '''{{font color}}''', '''{{tsl}}'''
		// ''~'' 不能跨行！
		// ~~~~~
		// ----

		// ----------------------------------------------------
		// parse_wikitext.section_title
		wikitext = wikitext.replace_till_stable(
		//
		/\n(=+)(.+)\1(\s*)\n/g, function(all, prefix, parameters, postfix) {
			if (normalize)
				parameters = parameters.trim();
			// 經過改變，需再進一步處理。
			parameters = parse_wikitext(parameters, options, queue);
			if (parameters.type !== 'text')
				parameters = [ parameters ];
			parameters = _set_wiki_type(parameters, 'section_title');
			if (postfix && !normalize)
				parameters.postfix = postfix;
			parameters.level = prefix.length;
			queue.push(parameters);
			// 因為 "\n" 在 wikitext 中為重要標記，因此 restore 之。
			return '\n' + include_mark + (queue.length - 1) + end_mark + '\n';
		});

		if (false) {
			// another method to parse.
			wikitext = '{{temp|{{temp2|p{a}r{}}}}}';
			pattern = /{{[\s\n]*([^\s\n#\|{}<>\[\]][^#\|{}<>\[\]]*)/g;
			matched = pattern.exec(wikitext);
			end_index = wikitext.indexOf('}}', pattern.lastIndex);

			/\[\[([^\|\[\]{}]+)/g;
		}

		// ↑ parse sequence end
		// ------------------------------------------------------------------------

		if (options && typeof options.postfix === 'function')
			wikitext = options.postfix(wikitext, queue, include_mark, end_mark)
					|| wikitext;

		if (initialized_fix) {
			// 去掉初始化時添加的 fix。
			// 須預防有些為完結的標記，把所添加的部分吃掉了。此時不能直接 .slice()，
			// 而應該先檢查是不是有被吃掉的狀況。
			if (initialized_fix[0] || initialized_fix[1])
				wikitext = wikitext.slice(initialized_fix[0].length,
				// assert: '123'.slice(1, undefined) === '23'
				// if use length as initialized_fix[1]:
				// assert: '1'.slice(0, [ 1 ][1]) === '1'
				initialized_fix[1] ? -initialized_fix[1].length : undefined);
		}

		queue.push(wikitext);
		resolve_escaped(queue, include_mark, end_mark);

		wikitext = queue[queue.length - 1];
		return wikitext;
	}

	// ------------------------------------------------------------------------

	// 模板名#後的內容會忽略。
	// matched: [ , Template name ]
	var TEMPLATE_NAME_PATTERN = /{{[\s\n]*([^\s\n#\|{}<>\[\]][^#\|{}<>\[\]]*)[|}]/,
	//
	TEMPLATE_START_PATTERN = new RegExp(TEMPLATE_NAME_PATTERN.source.replace(
			/\[[^[]+$/, ''), 'g'),
	/** {RegExp}內部連結 PATTERN */
	LINK_NAME_PATTERN = /\[\[[\s\n]*([^\s\n\|{}<>\[\]][^\|{}<>\[\]]*)(\||\]\])/;

	/**
	 * parse template token. 取得完整的模板 token。<br />
	 * CeL.wiki.parse.template();
	 * 
	 * TODO:<br />
	 * {{link-en|{{convert|198|cuin|L|abbr=on}} ''斜置-6'' 198|Chrysler Slant 6
	 * engine#198}}
	 * 
	 * @param {String}wikitext
	 *            模板前後之 content。<br />
	 *            assert: wikitext 為良好結構 (well-constructed)。
	 * @param {String|Array}[template_name]
	 *            擷取模板名 template name。
	 * @param {Number}[parse_type]
	 *            1: [ {String}模板名, parameters ]<br />
	 *            true: 不解析 parameters。<br />
	 *            false: 解析 parameters。
	 * 
	 * @returns {Undefine}wikitext 不包含此模板。
	 * @returns {Array}token = [ {String}完整的模板 wikitext token, {String}模板名,
	 *          {Array}parameters ];<br />
	 *          token.count = count('{{') - count('}}')，正常情況下應為 0。<br />
	 *          token.index, token.lastIndex: index.<br />
	 *          parameters[0] is {{{1}}}, parameters[1] is {{{2}}}, ...<br />
	 *          parameters[p] is {{{p}}}
	 */
	function parse_template(wikitext, template_name, parse_type) {
		template_name = normalize_name_pattern(template_name, true, true);
		var matched = template_name
		// 模板起始。
		? new RegExp(/{{[\s\n]*/.source + template_name + '\\s*[|}]', 'gi')
				: new RegExp(TEMPLATE_NAME_PATTERN.source, 'g');
		library_namespace.debug('Use pattern: ' + matched, 3, 'parse_template');
		// template_name : start token
		template_name = matched.exec(wikitext);

		if (!template_name) {
			// not found.
			return;
		}

		var pattern = new RegExp('}}|'
		// 不用 TEMPLATE_NAME_PATTERN，預防把模板結尾一起吃掉了。
		+ TEMPLATE_START_PATTERN.source, 'g'), count = 1;
		// lastIndex - 1 : the last char is [|}]
		template_name.lastIndex = pattern.lastIndex = matched.lastIndex - 1;

		while (count > 0 && (matched = pattern.exec(wikitext))) {
			// 遇到模板結尾 '}}' 則減1，否則增1。
			if (matched[0] === '}}')
				count--;
			else
				count++;
		}

		wikitext = pattern.lastIndex > 0 ? wikitext.slice(template_name.index,
				pattern.lastIndex) : wikitext.slice(template_name.index);
		var result = [
		// [0]: {String}完整的模板token
		wikitext,
		// [1]: {String}模板名
		template_name[1].trim(),
		// [2] {String}parameters
		// 接下來要作用在已經裁切擷取過的 wikitext 上，需要設定好 index。
		// assert: 其他餘下 parameters 的部分以 [|}] 起始。
		// -2: 模板結尾 '}}'.length
		wikitext.slice(template_name.lastIndex - template_name.index, -2) ];
		Object.assign(result, {
			count : count,
			index : template_name.index,
			lastIndex : pattern.lastIndex
		});

		if (!parse_type || parse_type === 1) {
			// {{t|p=p|1|q=q|2}} → [ , 1, 2; p:'p', q:'q' ]
			var index = 1,
			/** {Array}parameters */
			parameters = [];
			// 警告:這邊只是單純的以 '|' 分割，但照理來說應該再 call parser 來處理。
			// 最起碼應該除掉所有可能包含 '|' 的語法，例如內部連結 [[~|~]], 模板 {{~|~}}。
			result[2].split(/[\s\n]*\|[\s\n]*/)
			// 不處理 template name。
			.slice(1)
			//
			.forEach(function(token) {
				var matched = token.match(/^([^=]+)=(.*)$/);
				if (matched) {
					var key = matched[1].trim(),
					//
					value = matched[2].trim();
					if (false) {
						if (key in parameters) {
							// 參數名重複: @see [[Category:調用重複模板參數的頁面]]
							// 如果一個模板中的一個參數使用了多於一個值，則只有最後一個值會在顯示對應模板時顯示。
							// parser 調用超過一個Template中參數的值，只有最後提供的值會被使用。
							if (Array.isArray(parameters[key]))
								parameters[key].push(value);
							else
								parameters[key] = [ parameters[key], value ];
						} else {
							parameters[key] = value;
						}
					}
					parameters[key] = value;
				} else {
					parameters[index++] = token;
				}
			});

			if (parse_type === 1) {
				parameters[0] = result[1];
				result = parameters;
				// result[0] is template name.
				// result[p] is {{{p}}}
				// result[1] is {{{1}}}
				// result[2] is {{{2}}}
			} else {
				// .shift(): parameters 以 '|' 起始，因此需去掉最前面一個。
				// 2016/5/14 18:1:51 採用 [index] 的方法加入，因此無須此動作。
				// parameters.shift();
				result[2] = parameters;
			}
		}

		return result;
	}

	// ----------------------------------------------------

	/**
	 * parse date string to {Date}
	 * 
	 * @param {String}wikitext
	 *            wikitext to parse
	 * 
	 * @returns {Date}date of the date string
	 */
	function parse_date_zh(wikitext) {
		// $dateFormats, 'Y年n月j日 (D) H:i'
		// https://github.com/wikimedia/mediawiki/blob/master/languages/messages/MessagesZh_hans.php
		return wikitext && wikitext
		// 去掉年分前之雜項。
		.replace(/.+(\d{4}年)/, '$1')
		// 去掉星期與其後之雜項。
		.replace(/日\s*\([^()]+\)/, '日 ')
		// Warning: need data.date.
		.to_Date();
	}

	/**
	 * 使用者/用戶對話頁面所符合的模式。
	 * 
	 * matched: [ all, "user name" ]
	 * 
	 * @type {RegExp}
	 * 
	 * @see https://zh.wikipedia.org/w/api.php?action=query&meta=siteinfo&siprop=general|namespaces|namespacealiases|statistics&utf8
	 *      https://github.com/wikimedia/mediawiki/blob/master/languages/messages/MessagesZh_hant.php
	 */
	var PATTERN_user =
	// "\/": e.g., [[user talk:user_name/Flow]]
	/\[\[\s*(?:user(?:[ _]talk)?|用户(?:讨论|对话)?|用戶(?:討論|對話)?|使用者(?:討論)?|利用者(?:‐会話)?|사용자(?:토론)?)\s*:\s*([^\|\]\/]+)/i;

	/**
	 * parse user name. 解析使用者/用戶對話頁面資訊。
	 * 
	 * @param {String}wikitext
	 *            wikitext to parse
	 * @param {Boolean}full_link
	 *            get a full link
	 * 
	 * @returns {String}user name / full link
	 * @returns {Undefined}Not a user link.
	 */
	function parse_user(wikitext, full_link) {
		var matched = wikitext && wikitext.match(PATTERN_user);
		if (matched) {
			matched = full_link ? matched[0].trimRight() + ']]' : matched[1]
					.trim();
			return matched;
		}
	}

	//
	/**
	 * 重定向頁所符合的模式。 Note that the redirect link must be explicit – it cannot
	 * contain magic words, templates, etc.
	 * 
	 * matched: [ all, "title#section" ]
	 * 
	 * @type {RegExp}
	 * 
	 * @see https://en.wikipedia.org/wiki/Module:Redirect
	 *      https://zh.wikipedia.org/w/api.php?action=query&meta=siteinfo&siprop=general|namespaces|namespacealiases|statistics&utf8
	 *      https://github.com/wikimedia/mediawiki/blob/master/languages/messages/MessagesZh_hant.php
	 *      https://en.wikipedia.org/wiki/Help:Redirect
	 *      https://phabricator.wikimedia.org/T68974
	 */
	var PATTERN_redirect = /(?:^|[\s\n]*)#(?:REDIRECT|重定向|넘겨주기)\s*(?::\s*)?\[\[([^\[\]{}|]+)(?:\|[^\[\]{}]+)?\]\]/i;

	/**
	 * parse redirect page. 解析重定向資訊。 若 wikitext 重定向到其他頁面，則回傳其{String}頁面名:
	 * "title#section"。
	 * 
	 * @param {String}wikitext
	 *            wikitext to parse
	 * 
	 * @returns {String}title#section
	 * @returns {Undefined}Not a redirect page.
	 */
	function parse_redirect(wikitext) {
		var matched = wikitext && wikitext.match(PATTERN_redirect);
		if (matched) {
			return matched[1].trim();
		}
	}

	// ----------------------------------------------------

	// https://zh.wikipedia.org/wiki/條目#hash 說明
	// https://zh.wikipedia.org/zh-tw/條目#hash 說明
	// https://zh.wikipedia.org/zh-hans/條目#hash 說明
	// https://zh.wikipedia.org/w/index.php?title=條目
	// https://zh.wikipedia.org/w/index.php?uselang=zh-tw&title=條目
	// https://zh.m.wikipedia.org/wiki/條目#hash
	/**
	 * Wikipedia:Wikimedia sister projects 之 URL。
	 * 
	 * matched: [ all, language code, title 條目名稱, section 章節, link說明 ]
	 * 
	 * TODO: /wiki/條目#hash 說明
	 * 
	 * @type {RegExp}
	 * 
	 * @see https://en.wikipedia.org/wiki/Wikipedia:Wikimedia_sister_projects
	 */
	var PATTERN_WIKI_URL = /^(?:https?:)?\/\/([a-z\-\d]{2,20})\.(?:m\.)?wikipedia\.org\/(?:(?:wiki|zh-[a-z]{2,4})\/|w\/index\.php\?(?:uselang=zh-[a-z]{2}&)?title=)([^ #]+)(#[^ ]*)?( .+)?$/i;

	/**
	 * Convert URL to wiki link.
	 * 
	 * TODO: 在 default_language 非 zh 使用 uselang, /zh-tw/條目 會有問題。 TODO: [[en
	 * link]] → [[:en:en link]] TODO: use {{tsl}} or {{link-en}},
	 * {{en:Template:Interlanguage link multi}}.
	 * 
	 * @param {String}URL
	 *            URL
	 * @param {Boolean}[add_quote]
	 *            是否添加 [[]] 或 []。
	 * @param {Function}[callback]
	 *            回調函數。 callback({String}wiki link)
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @returns {String}wiki link
	 * 
	 * @see [[WP:LINK#跨语言链接]]
	 */
	function URL_to_wiki_link(URL, add_quote, callback, options) {
		URL = URL.trim();

		var matched = URL.match(PATTERN_WIKI_URL);
		if (!matched) {
			library_namespace.debug('Can not parse URL: [' + URL + ']', 3,
					'URL_to_wiki_link');
			if (add_quote)
				URL = '[[' + URL + ']]';
			if (callback)
				callback(URL);
			return URL;
		}

		/** {String}章節 = URL hash */
		var section = matched[3] || '';
		// for [[:mw:Multimedia/Media Viewer]],
		// [[:mw:Extension:MultimediaViewer|媒體檢視器]]
		if (section) {
			if (section.startsWith('#/media/File:')) {
				// 8 === '#/media/'.length
				return section.slice(8);
			}

			// 對某些 section 可能 throw！
			section = decodeURIComponent(section.replace(/\./g, '%'));
		}

		/** {String}URL之語言 */
		var language = matched[1].toLowerCase(),
		/** {String}條目名稱 */
		title = decodeURIComponent(matched[2]);

		function compose_link() {
			var link = (language === default_language ? ''
			//
			: ':' + language + ':') + title + section
			// link 說明
			+ (matched[4] && (matched[4] = matched[4].trim())
			//
			!== title ? '|' + matched[4]
			// [[Help:編輯頁面#链接]]
			// 若"|"後直接以"]]"結束，則儲存時會自動添加連結頁面名。
			: !section && /\([^()]+\)$/.test(title)
			// e.g., [[title (type)]] → [[title (type)|title]]
			// 在 <gallery> 中，"[[title (type)|]]" 無效，因此需要明確指定。
			? '|' + title.replace(/\s*\([^()]+\)$/, '') : '');

			if (add_quote) {
				link = '[[' + link + ']]';
			}

			return link;
		}

		// 無 callback，直接回傳 link。
		if (!callback)
			return compose_link();

		// 若非外project 或不同 language，則直接 callback(link)。
		if (section || language === default_language) {
			callback(compose_link());
			return;
		}

		// 嘗試取得本project 之對應連結。
		wiki_API.langlinks([ language, title ], function(to_title) {
			if (to_title) {
				language = default_language;
				title = to_title;
				// assert: section === ''
			}
			callback(compose_link());
		}, default_language, options);
	}

	// ----------------------------------------------------

	// 簡易快速但很有可能出錯的 parser。
	// e.g.,
	// CeL.wiki.parse.every('{{lang}}','~~{{lang|en|ers}}ff{{ee|vf}}__{{lang|fr|fff}}@@{{lang}}',function(token){console.log(token);})
	// CeL.wiki.parse.every('{{lang|ee}}','~~{{lang|en|ers}}ff{{ee|vf}}__{{lang|fr|fff}}@@{{lang}}',function(token){console.log(token);})
	// CeL.wiki.parse.every(['template','lang'],'~~{{lang|en|ers}}ff{{ee|vf}}__{{lang|fr|fff}}@@{{lang}}',function(token){console.log(token);})
	// CeL.wiki.parse.every(/{{[Ll]ang\b[^{}]*}}/g,'~~{{lang|en|ers}}ff{{ee|vf}}__{{lang|fr|fff}}@@{{lang}}',function(token){console.log(token);},CeL.wiki.parse.template)
	function parse_every(pattern, wikitext, callback, parser) {
		// assert: pattern.global === true
		var matched, count = 0;

		if (!parser) {
			if (typeof pattern === 'string'
					&& (matched = pattern.match(/{{([^{}]+)}}/)))
				pattern = [ 'template', matched[1] ];

			if (Array.isArray(pattern)) {
				parser = parse_wikitext[matched = pattern[0]];
				pattern = pattern[1];
				if (typeof pattern === 'string') {
					if (matched === 'template')
						pattern = new RegExp('{{ *(?:' + pattern
								+ ')(?:}}|[^a-z].*?}})', 'gi');
				}
			}
		}

		while (matched = pattern.exec(wikitext)) {
			if (parser) {
				var data = matched;
				matched = parser(matched[0]);
				if (!matched)
					// nothing got.
					continue;

				// recover index
				matched.index = data.index;
			}

			matched.lastIndex = pattern.lastIndex;
			matched.count = count++;
			callback(matched);
		}
	}

	function parse_timestamp(timestamp) {
		// return Date.parse(timestamp);
		return new Date(timestamp);
	}

	// CeL.wiki.parser(wikitext) 傳回 parser，可作 parser.parse()。
	// CeL.wiki.parse.*(wikitext) 僅處理單一 token，傳回 parse 過的 data。
	// TODO: 統合於 CeL.wiki.parser 之中。
	Object.assign(parse_wikitext, {
		template : parse_template,
		date : parse_date_zh,
		// timestamp : parse_timestamp,
		user : parse_user,
		redirect : parse_redirect,

		wiki_URL : URL_to_wiki_link,

		every : parse_every
	});

	// ------------------------------------------------------------------------

	/**
	 * get title of page.
	 * 
	 * @example <code>
	   var title = CeL.wiki.title_of(page_data);
	 * </code>
	 * 
	 * @param {Object}page_data
	 *            page data got from wiki API.
	 * 
	 * @returns {String|Undefined}title of page, maybe undefined.
	 * 
	 * @seealso wiki_API.query.title_param()
	 */
	function get_page_title(page_data) {
		// 處理 [ {String}API_URL, {String}title or {Object}page_data ]
		if (Array.isArray(page_data)) {
			if (get_page_content.is_page_data(page_data[0]))
				// assert: page_data = [ page data, page data, ... ]
				return page_data.map(get_page_title);
			// assert: page_data =
			// [ {String}API_URL, {String}title || {Object}page_data ]
			return get_page_title(page_data[1]);
		}

		if (library_namespace.is_Object(page_data)) {
			var title = page_data.title;
			// 檢測一般頁面
			if (title)
				// should use get_page_content.is_page_data(page_data)
				return title;

			// for flow page
			// page_data.header: 在 Flow_page() 中設定。
			// page_data.revision: 由 Flow_page() 取得。
			title =
			// page_data.is_Flow &&
			(page_data.header || page_data).revision;
			if (title && (title = title.articleTitle))
				// e.g., "Wikipedia talk:Flow tests"
				return title;

			return undefined;
		}

		// e.g., (typeof page_data === 'string')
		// e.g., page_data === undefined
		return page_data;
	}

	/**
	 * get the contents of page data. 取得頁面內容。
	 * 
	 * @example <code>
	   var content = CeL.wiki.content_of(page_data);
	 * </code>
	 * 
	 * @param {Object}page_data
	 *            page data got from wiki API.
	 * @param {String}flow_view
	 *            對 flow page，所欲取得之頁面內容項目。<br />
	 *            default: 'header'
	 * 
	 * @returns {String|Undefined}content of page, maybe undefined.
	 */
	function get_page_content(page_data, flow_view) {
		// for flow page: 因為 page_data 可能符合一般頁面標準，
		// 此時會先得到 {"flow-workflow":""} 之類的內容，
		// 因此必須在檢測一般頁面之前先檢測 flow page。
		// page_data.header: 在 Flow_page() 中設定。
		// page_data.revision: 由 Flow_page() 取得。
		var content = page_data &&
		// page_data.is_Flow &&
		(page_data[flow_view || 'header'] || page_data).revision;
		if (content && (content = content.content))
			// page_data.revision.content.content
			return content.content;

		// 檢測一般頁面
		if (get_page_content.is_page_data(page_data))
			return (content = get_page_content.has_content(page_data)) ? content['*']
					: null;

		// 一般都會輸入 page_data: {"pageid":0,"ns":0,"title":""}
		// : typeof page_data === 'string' ? page_data

		// ('missing' in page_data): 此頁面已刪除。
		// e.g., { ns: 0, title: 'title', missing: '' }
		// TODO: 提供此頁面的刪除和移動日誌以便參考。
		return page_data && ('missing' in page_data) ? undefined
				: String(page_data || '');
	}

	/**
	 * check if page_data is page data.
	 * 
	 * @param {Object}page_data
	 *            page data got from wiki API.
	 * 
	 * @returns {String|Number} pageid
	 */
	get_page_content.is_page_data = function(page_data) {
		return library_namespace.is_Object(page_data)
		// 可能是 missing:""，此時仍算 page data。
		&& (page_data.title || ('pageid' in page_data));
	};

	/**
	 * get the id of page
	 * 
	 * @param {Object}page_data
	 *            page data got from wiki API.
	 * 
	 * @returns {String|Number} pageid
	 */
	get_page_content.pageid = function(page_data) {
		return get_page_content.is_page_data(page_data) && page_data.pageid;
	};

	// return .revisions[0]
	// 不回傳 {String}，減輕負擔。
	get_page_content.has_content = function(page_data) {
		return library_namespace.is_Object(page_data)
		// treat as page data. Try to get page contents: page.revisions[0]['*']
		// 一般說來應該是由新排到舊，[0] 為最新的版本。
		&& page_data.revisions && page_data.revisions[0];
	};

	// --------------------------------------------------------------------------------------------
	// instance 相關函數。

	wiki_API.prototype.toString = function(type) {
		return get_page_content(this.last_page) || '';
	};

	// @see function get_continue(), get_list()
	wiki_API.prototype.show_next = typeof JSON === 'object' && JSON.stringify
	//
	? function() {
		return this.next_mark && JSON.stringify(this.next_mark);
	} : function() {
		if (!this.next_mark)
			return;
		var line = [], value;
		for ( var name in this.next_mark) {
			value = this.next_mark[name];
			line.push(name + ':' + (typeof value === 'string'
			//
			? '"' + value.replace(/"/g, '\\"') + '"' : value));
		}
		if (line.length > 0)
			return '{' + line.join(',') + '}';
	};

	/**
	 * 設定工作/添加新的工作。
	 * 
	 * 警告: 若 callback throw，可能導致工作中斷，不會自動復原，得要以 wiki.next() 重起工作。
	 * 
	 * 工作原理: 每個實體會hold住一個queue ({Array}this.actions)。 當設定工作時，就把工作推入佇列中。
	 * 另外內部會有另一個行程負責依序執行每一個工作。
	 */
	wiki_API.prototype.next = function() {
		if (!(this.running = 0 < this.actions.length)) {
			library_namespace.debug('Empty queue.', 2,
					'wiki_API.prototype.next');
			// console.warn(this);
			return;
		}

		library_namespace.debug('剩餘 ' + this.actions.length + ' action(s)', 2,
				'wiki_API.prototype.next');
		if (library_namespace.is_debug(3)
		// .show_value() @ interact.DOM, application.debug
		&& library_namespace.show_value)
			library_namespace.show_value(this.actions.slice(0, 10));
		var _this = this, next = this.actions.shift(),
		// 不改動 next。
		type = next[0], list_type;
		if (type in get_list.type) {
			list_type = type;
			type = 'list';
		}

		if (library_namespace.is_debug(2))
			library_namespace.debug('處理 '
					+ (this.token.lgname ? this.token.lgname + ' ' : '') + '['
					+ next.map(function(arg) {
						// for function
						return String(arg).slice(0, 80);
					}) + ']', 1, 'wiki_API.prototype.next');

		// 若需改變，需同步更改 wiki_API.prototype.next.methods
		switch (type) {
		case 'page':
			// this.page(page data, callback, options);
			if (library_namespace.is_Object(next[2]) && !next[3])
				// 直接輸入 options，未輸入 callback。
				next.splice(2, 0, null);

			// → 此法會採用所輸入之 page data 作為 this.last_page，不再重新擷取 page。
			if (get_page_content.is_page_data(next[1])
			// 必須有頁面內容，要不可能僅有資訊。有時可能已經擷取過卻發生錯誤而沒有頁面內容，此時依然會再擷取一次。
			&& get_page_content.has_content(next[1])) {
				library_namespace.debug('採用所輸入之 [' + next[1].title
						+ '] 作為 this.last_page。', 2, 'wiki_API.prototype.next');
				this.last_page = next[1];
				if (typeof next[2] === 'function')
					// next[1] : callback
					next[2].call(this, next[1]);
				this.next();
			} else if (typeof next[1] === 'function') {
				// this.page(callback): callback(last_page)
				// next[1] : callback
				next[1].call(this, this.last_page);
				this.next();
			} else {
				// this.page(title, callback, options)
				// next[1] : title
				// next[3] : options
				// [ {String}API_URL, {String}title or {Object}page_data ]
				wiki_API.page(Array.isArray(next[1]) ? next[1] : [
						this.API_URL, next[1] ], function(page_data, error) {
					// assert: 當錯誤發生，例如頁面不存在，依然需要模擬出 page_data。
					// 如此才能執行 .page().edit()。
					_this.last_page
					// 正常情況。
					= Array.isArray(page_data) ? page_data[0] : page_data;
					// next[2] : callback
					if (typeof next[2] === 'function')
						next[2].call(_this, page_data, error);
					_this.next();
				},
				// next[3] : options
				Object.assign({
					// [SESSION_KEY]
					session : this
				}, next[3]));
			}
			break;

		case 'redirect_to':
			// this.redirect_to(page data, callback, options);
			if (library_namespace.is_Object(next[2]) && !next[3])
				// 直接輸入 options，未輸入 callback。
				next.splice(2, 0, null);

			// this.redirect_to(title, callback, options)
			// next[1] : title
			// next[3] : options
			// [ {String}API_URL, {String}title or {Object}page_data ]
			wiki_API.redirect_to(Array.isArray(next[1]) ? next[1] : [
					this.API_URL, next[1] ], function(redirect_data, page_data,
					error) {
				// next[2] : callback
				if (typeof next[2] === 'function')
					next[2].call(_this, redirect_data, page_data, error);
				_this.next();
			},
			// next[3] : options
			Object.assign({
				// [SESSION_KEY]
				session : this
			}, next[3]));
			break;

		case 'list':
			// get_list(). e.g., 反向連結/連入頁面.
			// next[1] : title
			wiki_API[list_type]([ this.API_URL, next[1] ], function(title,
					titles, pages) {
				// [ last_list ]
				_this.last_titles = titles;
				// [ page_data ]
				_this.last_pages = pages;

				if (typeof next[2] === 'function') {
					// next[2] : callback(title, titles, pages)
					next[2].call(_this, title, titles, pages);
				} else if (next[2] && next[2].each) {
					// next[2] : 當作 work，處理積存工作。
					if (pages) {
						_this.work(next[2]);
					} else {
						// 只有在本次有處理頁面時，才繼續下去。
						library_namespace.info('無頁面可處理（已完成？），中斷跳出。');
					}
				}

				_this.next();
			},
			// next[3] : options
			Object.assign({
				// [SESSION_KEY]
				session : this
			}, this.next_mark, next[3]));
			break;

		case 'search':
			wiki_API.search([ this.API_URL, next[1] ], function(key, pages,
					hits) {
				// [ page_data ]
				_this.last_pages = pages;
				// 設定/紀錄後續檢索用索引值。
				// 若是將錯誤的改正之後，應該重新自 offset 0 開始 search。
				// 因此這種情況下基本上不應該使用此值。
				if (pages.sroffset)
					_this.next_mark.sroffset = pages.sroffset;

				if (typeof next[2] === 'function')
					// next[2] : callback(key, pages, hits)
					next[2].call(_this, key, pages, hits);
				else if (next[2] && next[2].each)
					// next[2] : 當作 work，處理積存工作。
					_this.work(next[2]);

				_this.next();
			},
			// next[3] : options
			Object.assign({
				// [SESSION_KEY]
				session : this
			}, next[3]));
			break;

		case 'check':
			// 正規化並提供可隨意改變的同內容參數，以避免修改或覆蓋附加參數。
			next[1] = library_namespace.new_options(this.check_options,
			// next[1]: options
			typeof next[1] === 'boolean' ? {
				force : next[1]
			} : typeof options === 'string' ? {
				title : next[1]
			} : next[1]);

			// ('stopped' in this): 已經有 cache。
			if (('stopped' in this)
			// force to check
			&& next[1].force) {
				library_namespace.debug('Skip check_stop().', 1,
						'wiki_API.prototype.next');
				this.next();
			} else {
				library_namespace.debug('以 .check_stop() 檢查與設定是否須停止編輯作業。', 1,
						'wiki_API.prototype.next');
				library_namespace
						.debug('Using options to check_stop(): '
								+ JSON.stringify(next[1]), 2,
								'wiki_API.prototype.next');
				next[1].token = this.token;
				// 正作業中之 wiki_API instance。
				next[1][SESSION_KEY] = this;
				wiki_API.check_stop(function(stopped) {
					// cache
					_this.stopped = stopped;

					_this.next();
				},
				// next[1] : options
				next[1]);
			}
			break;

		case 'edit':
			// TODO: {String|RegExp|Array}filter
			if (!this.last_page) {
				library_namespace
						.warn('wiki_API.prototype.next: No page in the queue. You must run .page() first!');
				// next[3] : callback
				if (typeof next[3] === 'function')
					next[3].call(_this, undefined, 'no page');
				this.next();

			} else if (!('stopped' in this)) {
				// rollback, check if need stop 緊急停止.
				this.actions.unshift([ 'check' ], next);
				this.next();
			} else if (this.stopped && !next[2].skip_stopped) {
				library_namespace.warn('wiki_API.prototype.next: 已停止作業，放棄編輯[['
						+ this.last_page.title + ']]！');
				// next[3] : callback
				if (typeof next[3] === 'function')
					next[3].call(_this, this.last_page.title, '已停止作業');
				this.next();

			} else if (this.last_page.is_Flow) {
				// next[2]: options to edit_topic()
				// .section: 章節編號。 0 代表最上層章節，new 代表新章節。
				if (next[2].section !== 'new') {
					library_namespace
							.warn('wiki_API.prototype.next: The page to edit is Flow. I can not edit directly.');
					// next[3] : callback
					if (typeof next[3] === 'function')
						next[3].call(this, this.last_page.title, 'is Flow');
					this.next();

				} else if (!this.last_page.header) {
					// rollback
					this.actions.unshift(next);
					// 先取得關於討論板的描述。以此為依據，檢測頁面是否允許機器人帳戶訪問。
					Flow_page(this.last_page, function() {
						// next[3] : callback
						if (typeof next[3] === 'function')
							next[3].call(this, this.last_page.title);
						// 因為已經更動過內容，為了預防會取得舊的錯誤資料，因此將之刪除。但留下標題資訊。
						delete _this.last_page.revisions;
						_this.next();
					}, {
						flow_view : 'header',
						// [SESSION_KEY]
						session : this
					});

				} else if ((!next[2] || !next[2].ignore_denial)
						&& wiki_API.edit.denied(this.last_page,
								this.token.lgname, next[2]
										&& next[2].notification)) {
					// {{bot}} support for flow page
					// 採用 this.last_page 的方法，
					// 在 multithreading 下可能因其他 threading 插入而造成問題，須注意！
					library_namespace
							.warn('wiki_API.prototype.next: Denied to edit flow [['
									+ this.last_page.title + ']]');
					// next[3] : callback
					if (typeof next[3] === 'function')
						next[3].call(this, this.last_page.title, 'denied');
					this.next();

				} else {
					library_namespace.debug('直接採用 Flow 的方式增添新話題。');
					// get the contents
					if (typeof next[1] === 'function') {
						// next[1] = next[1](get_page_content(this.last_page),
						// this.last_page.title, this.last_page);
						// 需要同時改變 wiki_API.edit！
						// next[2]: options to edit_topic()
						// .call(options,): 使(回傳要編輯資料的)設定值函數能即時變更 options。
						next[1] = next[1].call(next[2], this.last_page);
					}
					edit_topic([ this.API_URL, this.last_page ],
					// 新章節/新話題的標題文字。
					next[2].sectiontitle,
					// 新話題最初的內容。因為已有 contents，直接餵給轉換函式。
					// [[mw:Flow]] 會自動簽名，因此去掉簽名部分。
					next[1].replace(/[\s\n\-]*~~~~[\s\n\-]*$/, ''),
					//
					this.token,
					// next[2]: options to edit_topic()
					Object.assign({
						// [SESSION_KEY]
						session : this
					}, next[2]), function(title, error, result) {
						// next[3] : callback
						if (typeof next[3] === 'function')
							next[3].call(_this, title, error, result);
						// 因為已經更動過內容，為了預防會取得舊的錯誤資料，因此將之刪除。但留下標題資訊。
						delete _this.last_page.revisions;
						_this.next();
					});
				}

			} else if ((!next[2] || !next[2].ignore_denial)
					&& wiki_API.edit.denied(this.last_page, this.token.lgname,
							next[2] && next[2].notification)) {
				// 採用 this.last_page 的方法，
				// 在 multithreading 下可能因其他 threading 插入而造成問題，須注意！
				library_namespace
						.warn('wiki_API.prototype.next: Denied to edit [['
								+ this.last_page.title + ']]');
				// next[3] : callback
				if (typeof next[3] === 'function')
					next[3].call(this, this.last_page.title, 'denied');
				this.next();

			} else {
				if (typeof next[1] === 'function') {
					// next[1] = next[1](get_page_content(this.last_page),
					// this.last_page.title, this.last_page);
					// 需要同時改變 wiki_API.edit！
					// next[2]: options to edit_topic()
					// .call(options,): 使(回傳要編輯資料的)設定值函數能即時變更 options。
					next[1] = next[1].call(next[2], this.last_page);
				}
				if (next[2] && next[2].skip_nochange
				// 採用 skip_nochange 可以跳過實際 edit 的動作。
				&& next[1] === get_page_content(this.last_page)) {
					library_namespace.debug('Skip [' + this.last_page.title
							+ ']: The same contents.');
					// next[3] : callback
					if (typeof next[3] === 'function')
						next[3].call(this, this.last_page.title, 'nochange');
					this.next();
				} else
					wiki_API.edit([ this.API_URL, this.last_page ],
					// 因為已有 contents，直接餵給轉換函式。
					next[1], this.token,
					// next[2]: options to edit()
					Object.assign({
						// [SESSION_KEY]
						session : this
					}, next[2]), function(title, error, result) {
						// 當運行過多次，就可能出現 token 不能用的情況。需要重新 get token。
						if (result ? result.error
						//
						? result.error.code === 'badtoken'
						// 有時 result 可能會是 ""，或者無 result.edit。這通常代表 token lost。
						: !result.edit : result === '') {
							// Invalid token
							library_namespace.warn('wiki_API.prototype.next: '
							//
							+ 'It seems we lost the token. 似乎丟失了 token。');
							if (!library_namespace.platform.nodejs) {
								library_namespace
										.err('wiki_API.prototype.next: '
												+ 'Not using nod.js!');
								return;
							}
							// 下面的 workaround 僅適用於 node.js。
							if (!_this.token.lgpassword) {
								library_namespace
										.err('wiki_API.prototype.next: '
												+ 'No password preserved!');
								// 死馬當活馬醫，仍然嘗試重新取得 token...沒有密碼無效。
								return;
							}
							library_namespace.info('wiki_API.prototype.next: '
									+ 'Try to get token again. 嘗試重新取得 token。');
							// reset node agent.
							// 應付 2016/1 MediaWiki 系統更新，
							// 需要連 HTTP handler 都重換一個，重起 cookie。
							// 發現大多是因為一次處理數十頁面，可能遇上 HTTP status 413 的問題。
							setup_API_URL(_this /* session */, true);
							if (false && result === '') {
								// force to login again: see wiki_API.login
								delete _this.token.csrftoken;
								delete _this.token.lgtoken;
								// library_namespace.set_debug(6);
							}
							// rollback
							_this.actions.unshift(next);

							// 直到 .edit 動作才會出現 badtoken，
							// 因此在 wiki_API.login 尚無法偵測是否 badtoken。
							if ('retry_login' in _this) {
								if (++_this.retry_login > 2) {
									throw new Error(
									// 當錯誤 login 太多次時，直接跳出。
									'wiki_API.next: Too many failed login attempts: ['
											+ _this.token.lgname + ']');
								}
								library_namespace.info('wiki_API.next: Retry '
										+ _this.retry_login);
							} else {
								_this.retry_login = 0;
							}

							// 重新取得 token。
							wiki_API.login(_this.token.lgname,
							//
							_this.token.lgpassword, {
								force : true,
								// [SESSION_KEY]
								session : _this,
								// 將 'login' 置於最前頭。
								login_mark : true
							});

						} else {
							if ('retry_login' in _this)
								// 已成功 edit，去除 retry flag。
								delete _this.retry_login;
							// next[3] : callback
							if (typeof next[3] === 'function')
								next[3].call(_this, title, error, result);
							// 因為已經更動過內容，為了預防會取得舊的錯誤資料，因此將之刪除。但留下標題資訊。
							delete _this.last_page.revisions;
							_this.next();
						}
					});
			}
			break;

		// ------------------------------------------------

		case 'login':
			library_namespace.debug(
					'正 log in 中，當 login 後，會自動執行 .next()，處理餘下的工作。', 2,
					'wiki_API.prototype.next');
		case 'wait':
			// rollback
			this.actions.unshift(next);
			break;

		case 'logout':
			// 結束
			wiki_API.logout(function() {
				if (typeof next[1] === 'function')
					next[1].call(_this);
				_this.next();
			},
			// next[2] : options
			Object.assign({
				// [SESSION_KEY]
				session : this
			}, next[2]));
			break;

		case 'set_URL':
			setup_API_URL(this /* session */, next[1]);
			this.next();
			break;

		case 'set_language':
			setup_API_language(this /* session */, next[1]);
			this.next();
			break;

		case 'set_data':
			// 設定 this.data_session。
			// setup_data_session(session, callback, API_URL, password, force)
			setup_data_session(this /* session */,
			// 確保 data_session login 了才執行下一步。
			function() {
				if (typeof next[1] === 'function')
					next[1].call(_this);
				_this.next();
			}, next[2], next[3], next[4]);
			break;

		case 'run':
			if (typeof next[1] === 'function')
				next[1].call(this, next[2]);
			this.next();
			break;

		// ------------------------------------------------

		case 'data':
			if (!('data_session' in this)) {
				// rollback, 確保已設定 this.data_session。
				this.actions.unshift([ 'set_data' ], next);
				this.next();
				break;
			}

			if (typeof next[1] === 'function') {
				// 直接輸入 callback。
				if (this.last_data) {
					next[1](this.last_data);
					break;
				} else {
					if (!this.last_page) {
						next[1].call(this, undefined, {
							code : 'no_id',
							message : 'Did not set id! 未設定欲取得之特定實體id。'
						});
						this.next();
						break;
					}
					next.splice(1, 0, this.last_page);
				}
			}

			if (typeof next[2] === 'function') {
				// 未設定/不設定 property
				// shift arguments
				next.splice(2, 0, null);
			}

			// wikidata_entity(key, property, callback, options)
			wikidata_entity(next[1], next[2], function(data, error) {
				// 就算發生錯誤，依然設定一個 dummy，預防 edit_data 時引用可能非所欲的 this.last_page。
				_this.last_data = data || {
					key : next[1],
					error : error
				};
				// next[3] : callback
				if (typeof next[3] === 'function')
					next[3].call(this, data, error);
				_this.next();
			},
			// next[4] : options
			Object.assign({
				// [SESSION_KEY]
				session : this.data_session
			}, next[4]));
			break;

		case 'edit_data':
			if (!('data_session' in this)) {
				// rollback, 確保已設定 this.data_session。
				this.actions.unshift([ 'set_data' ], next);
				this.next();
				break;
			}

			// wiki.edit_data([id, ]data[, options, callback])

			if (typeof next[1] === 'function'
			//
			|| library_namespace.is_Object(next[1]) && !is_entity(next[1])) {
				// 未設定/不設定 id，第一個 next[1] 即為 data。
				// next = [ 'edit_data', data[, options, callback] ]
				if (library_namespace.is_Object(next[2]) && next[2]['new']) {
					// create item/property
					next.splice(1, 0, null);

				} else {
					// 自動填補 id。
					// 直接輸入 callback。
					if (typeof next[2] === 'function' && !next[3]) {
						// 未輸入 options，但輸入 callback。
						next.splice(2, 0, null);
					}

					// next = [ 'edit_data', data, options[, callback] ]
					if (this.last_data) {
						if (!is_entity(this.last_data)) {
							next[3] && next[3].call(this, undefined, {
								code : 'no_last_data',
								message : '前一次之wikidata實體取得失敗: ['
								// 例如提供的 foreign title 錯誤，
								+ (this.last_data.key
								// 或是 foreign title 為 redirected。
								|| (this.last_data.site
								// 抑或者存在 foreign title 頁面，但沒有 wikidata entity。
								+ ':' + this.last_data.title)) + ']'
							});
							this.next();
							break;
						}
						// shift arguments
						next.splice(1, 0, this.last_data);

					} else if (this.last_page) {
						next.splice(1, 0, this.last_page);

					} else {
						next[3] && next[3].call(this, undefined, {
							code : 'no_id',
							message : 'Did not set id! 未設定欲取得之特定實體id。'
						});
						this.next();
						break;
					}
				}
			}

			// needless: 會從 get_data_API_URL(options) 取得 API_URL。
			if (false && !Array.isArray(next[1])) {
				next[1] = [ this.data_session.API_URL, next[1] ];
			}

			// next = [ 'edit_data', id, data[, options, callback] ]
			if (typeof next[3] === 'function' && !next[4]) {
				// 未輸入 options，但輸入 callback。
				next.splice(3, 0, null);
			}

			// wikidata_edit(id, data, token, options, callback)
			wikidata_edit(next[1], next[2], this.data_session.token,
			// next[3] : options
			Object.assign({
				// [SESSION_KEY]
				session : this.data_session
			}, next[3]),
			//
			function(data, error) {
				_this.last_data = data || {
					last_data : _this.last_data,
					key : next[1],
					error : error
				};
				// next[4] : callback
				if (typeof next[4] === 'function')
					next[4].call(this, data, error);
				_this.next();
			});
			break;

		case 'merge_data':
			if (!('data_session' in this)) {
				// rollback, 確保已設定 this.data_session。
				this.actions.unshift([ 'set_data' ], next);
				this.next();
				break;
			}

			// next = [ 'merge_data', to, from[, options, callback] ]
			if (typeof next[3] === 'function' && !next[4]) {
				// 未輸入 options，但輸入 callback。
				next.splice(3, 0, null);
			}

			// next = [ 'merge_data', to, from, options[, callback] ]
			wikidata_merge(next[1], next[2], this.data_session.token,
			// next[3] : options
			Object.assign({
				// [SESSION_KEY]
				session : this.data_session
			}, next[3]),
			// next[4] : callback
			function(data, error) {
				// 此 wbmergeitems 之回傳 data 不包含 item 資訊。
				// next[4] : callback
				if (typeof next[4] === 'function')
					next[4].call(this, data, error);
				_this.next();
			});
			break;

		case 'query':
			// wdq
			// wikidata_query(query, callback, options)
			wikidata_query(next[1], function(data) {
				_this.last_list = Array.isArray(data) ? data : null;
				// next[2] : callback
				if (typeof next[2] === 'function')
					next[2].call(this, data);
				_this.next();
			}, next[3]);
			break;

		// ------------------------------------------------

		default:
			library_namespace.warn('Unknown operation: [' + next.join() + ']');
			this.next();
			break;
		}
	};

	/**
	 * wiki_API.prototype.next() 已登記之 methods。<br />
	 * 之後會再自動加入 get_list.type 之 methods。<br />
	 * NG: ,login
	 * 
	 * @type {Array}
	 */
	wiki_API.prototype.next.methods = 'page,redirect_to,check,edit,search,logout,run,set_URL,set_language,set_data,data,edit_data,merge_data,query'
			.split(',');

	// ------------------------------------------------------------------------

	/**
	 * default date format. 預設的日期格式
	 * 
	 * @type {String}
	 * @see ISO 8601
	 */
	wiki_API.prototype.date_format = '%4Y%2m%2dT%2H%2M';

	/** {String}後續檢索用索引值標記名稱 */
	wiki_API.prototype.continue_key = '後續索引';

	/**
	 * 規範 log 之格式。(for wiki_API.prototype.work)
	 * 
	 * @param {String}message
	 *            message
	 * @param {String}[title]
	 *            message title.
	 */
	function add_message(message, title) {
		title = get_page_title(title);
		// escape 具有特殊作用的 title。
		// assert: 為規範過之 title，如採用 File: 而非 Image:, 檔案:。
		if (title && /^(?:Category|File):/.test(title))
			title = ':' + title;
		this.push('* ' + (title ? '[[' + title + ']]: ' : '') + message);
	}

	function reset_messages() {
		// 設定 time stamp。
		this.start = this.last = new Date;
		// clear
		this.clear();
	}

	/**
	 * 輸入 URI component list，得出自 [0] 至 [邊際index-1] 以 encodeURIComponent()
	 * 串聯起來，長度不超過 limit_length。
	 * 
	 * @param {Array}piece_list
	 *            URI component list
	 * @param {Natural}[limit]
	 *            limit index
	 * @param {Natural}[limit_length]
	 *            limit length
	 * 
	 * @returns {Number}邊際index。
	 */
	function check_max_length(piece_list, limit, limit_length) {
		// 8000: 8192 - (除了 piece_list 外必要之字串長)。
		//
		// 8192: https://httpd.apache.org/docs/current/mod/core.html
		// defaule LimitRequestLine: 8190
		//
		// assert: 除了 piece_list 外必要之字串長 < 192
		// e.g.,
		// "https://zh.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content|timestamp&titles=...&format=json&utf8=1"
		if (!(limit_length > 0))
			limit_length = 8000;

		var length = 0, index = piece_list.length;

		if (false)
			piece_list.slice(0, limit_length / 30).join('|').slice(0,
					limit_length).replace(/[^|]+$/, '');

		piece_list.some(function(piece, i) {
			// +3 === encodeURIComponent('|').length: separator '|'
			length += encodeURIComponent(piece).length + 3;
			if (i >= limit || length >= limit_length) {
				index = i;
				return true;
			}
		});
		CeL.debug('0–' + index + ': length ' + length, 4, 'check_max_length');

		return index;
	}

	// wiki_API.prototype.work(config): configuration:
	({
		first : function(messages, titles, pages) {
		},
		// {Function|Array} 每個 page 執行一次。
		each : function(page_data, messages) {
			return 'text to replace';
		},
		last : function(messages, titles, pages) {
		},
		// 不作編輯作業。
		no_edit : true,
		// 設定寫入目標。一般為 debug、test 測試期間用。
		write_to : '',
		/** {String}運作記錄存放頁面。 */
		log_to : 'User:Robot/log/%4Y%2m%2d',
		/** {String}編輯摘要。總結報告。「新條目、修飾語句、修正筆誤、內容擴充、排版、內部鏈接、分類、消歧義、維基化」 */
		summary : ''
	});

	/**
	 * robot 作業操作之輔助套裝函數。<br />
	 * 不會推入 this.actions queue，即時執行。因此需要先 get list！
	 * 
	 * @param {Object}config
	 *            configuration
	 * @param {Array}pages
	 *            page data list
	 * @param {Array}[titles]
	 *            title list
	 */
	wiki_API.prototype.work = function(config, pages, titles) {
		if (typeof config === 'function')
			config = {
				each : config
			};
		if (!config || !config.each) {
			library_namespace.warn('wiki_API.work: Bad callback!');
			return;
		}

		if (!pages)
			pages = this.last_pages, titles = this.last_titles;
		// config.run_empty: 即使無頁面/未取得頁面，依舊強制執行下去。
		if (!pages && !titles && !config.run_empty) {
			// 採用推入前一個 this.actions queue 的方法，
			// 在 multithreading 下可能因其他 threading 插入而造成問題，須注意！
			library_namespace
					.warn('wiki_API.work: No list. Please get list first!');
			return;
		}

		library_namespace.debug('wiki_API.work: 開始執行:先作環境建構與初始設定。');
		if (config.summary)
			// '開始處理 ' + config.summary + ' 作業'
			library_namespace.sinfo([ 'wiki_API.work: start [', 'fg=yellow',
					config.summary, '-fg', ']' ]);

		/**
		 * <code>
		 * default handler [ text replace function(title, content), {Object}options, callback(title, error, result) ]
		 * </code>
		 */
		var each,
		// options 在此暫時作為 default options。
		options = config.options || {
			// Throw an error if the page doesn't exist.
			// 若頁面不存在，則產生錯誤。
			// 要取消這項，須注意在重定向頁之對話頁操作之可能。
			nocreate : 1,
			// 該編輯是一個小修訂 (minor edit)。
			minor : 1,
			// 標記此編輯為機器人編輯。[[WP:AL|機器人對其他使用者對話頁的小修改將不會觸發新訊息提示]]。
			bot : 1,
			// 設定寫入目標。一般為 debug、test 測試期間用。
			write_to : '',
			// 採用 skip_nochange 可以跳過實際 edit 的動作。
			// 對於大部分不會改變頁面的作業，能大幅加快速度。
			skip_nochange : true
		}, callback,
		/** {ℕ⁰:Natural+0}全無變更頁面數。 */
		nochange_count = 0;

		if (typeof config.each === 'function') {
			// {Function}
			each = [ config.each ];
			if (!config.options) {
				// 直接將 config 的設定導入 options。
				// e.g., write_to
				for (callback in options) {
					if (callback in config) {
						if (!config[callback] && callback in {
							nocreate : 1,
							minor : 1,
							bot : 1
						}) {
							// 即使設定 minor=0 似乎也會當作設定了，得完全消滅才行。
							delete options[callback];
						} else
							options[callback] = config[callback];
					}
				}
			}

		} else if (Array.isArray(config.each))
			each = config;
		else
			library_namespace.err(
			//
			'wiki_API.work: Invalid function for each page!');

		if (each[1])
			Object.assign(options, each[1]);
		// 採用 {{tlx|template_name}} 時，[[Special:最近更改]]頁面無法自動解析成 link。
		options.summary = (callback = config.summary)
		// 是為 Robot 運作。
		? /bot/i.test(callback) ? callback
		// Robot: 若用戶名包含 'bot'，則直接引用之。
		: (this.token.lgname.length < 9 && /bot/i.test(this.token.lgname)
		//
		? this.token.lgname : 'Robot') + ': ' + callback
		// 未設置時，一樣添附 Robot。
		: 'Robot';

		// assert: 因為要作排程，為預防衝突與不穩定的操作結果，自此以後不再 modify options。

		var done = 0,
		//
		log_item = Object.assign(library_namespace.null_Object(),
				wiki_API.prototype.work.log_item, config.log_item),
		/** {Boolean}console 不顯示訊息，也不處理 {Array}messages。 */
		no_message = config.no_message, messages = [];
		messages.add = no_message ? library_namespace.null_function
				: add_message;
		messages.reset = no_message ? library_namespace.null_function
				: reset_messages;
		messages.reset();

		callback = each[2];
		// each 現在轉作為對每一頁面執行之工作。
		each = each[0];
		if (!callback) {
			callback = no_message ? library_namespace.null_function
			// default logger.
			: function(title, error, result) {
				if (error)
					if (error === 'nochange') {
						done++;
						// 未經過 wiki 操作，於 wiki_API.edit 發現為[[WP:NULLEDIT|無改變]]的。
						nochange_count++;
						error = '無改變。';
						result = 'nochange';
					} else {
						// 有錯誤發生。
						// e.g., [protectedpage]
						// The "editprotected" right is required to edit this
						// page
						result = [ 'error', error ];
						error = '結束: ' + error;
					}
				else if (!result.edit) {
					// 有時 result 可能會是 ""，或者無 result.edit。這通常代表 token lost。
					library_namespace.err('wiki_API.work: 無 result.edit'
							+ (result.edit ? '.newrevid' : '')
							+ '！可能是 token lost！');
					error = '無 result.edit' + (result.edit ? '.newrevid' : '')
							+ '。';
					result = [ 'error', 'token lost?' ];
				} else {
					// 成功完成。
					done++;
					if (result.edit.newrevid) {
						// https://en.wikipedia.org/wiki/Help:Wiki_markup#Linking_to_old_revisions_of_pages.2C_diffs.2C_and_specific_history_pages
						// https://zh.wikipedia.org/?diff=000
						error = ' [[Special:Diff/' + result.edit.newrevid
								+ '|完成]]。';
						result = 'succeed';
					} else if ('nochange' in result.edit) {
						// 經過 wiki 操作，發現為[[WP:NULLEDIT|無改變]]的。
						nochange_count++;
						error = '無改變。';
						result = 'nochange';
					} else {
						// 有時無 result.edit.newrevid。
						library_namespace.err('無 result.edit.newrevid');
						error = '完成。';
						result = 'succeed';
					}
				}

				// error: message, result: result type.

				// 間隔
				error = '隔 ' + messages.last.age(new Date) + '，'
				// 紀錄使用時間, 歷時, 費時, elapsed time
				+ (messages.last = new Date)
				//
				.format(config.date_format || this.date_format) + ' ' + error;
				if (log_item[Array.isArray(result)
				// {Array}result = [ main, sub ]
				? result.join('_') in log_item ? result.join('_') : result[0]
						: result]) {
					messages.add(error, title);
				}
			};
		}

		if (Array.isArray(pages) && pages.slice(0, 10).every(function(item) {
			return typeof item === 'string';
		})) {
			// 傳入標題列表。
			messages.input_title_list = true;
		}

		if (false && Array.isArray(pages)
		//
		&& (Array.isArray(titles) ? pages.length !== titles.length : !titles)) {
			library_namespace.warn('wiki_API.work: rebuild titles.');
			titles = [];
			pages.forEach(function(page) {
				titles.push(page.title);
			});
		}

		// do a little check.
		if (Array.isArray(pages) && Array.isArray(titles)
		//
		&& pages.length !== titles.length)
			library_namespace.warn(
			//
			'wiki_API.work: The length of pages and titles are different!');

		var main_work = (function(data) {
			if (!Array.isArray(data))
				if (!data && pages.length === 0) {
					library_namespace.info(
					//
					'wiki_API.work: ' + config.summary + ': 未取得或設定任何頁面。已完成？');
					data = [];
				} else
					// 可能是 page data 或 title。
					data = [ data ];

			if (Array.isArray(pages) && data.length !== pages.length
					&& !setup_target)
				library_namespace.warn('wiki_API.work: query 所得之 length ('
						+ data.length + ') !== pages.length (' + pages.length
						+ ') ！');

			// 傳入標題列表，則由程式自行控制，毋須設定後續檢索用索引值。
			if (!messages.input_title_list
					// config.continue_session:
					// 後續檢索用索引值存儲所在的 {wiki_API}，將會以此 instance 之值寫入 log。
					&& (pages = 'continue_session' in config ? config.continue_session
							: this)
					// pages: 後續檢索用索引值之暫存值。
					&& (pages = pages.show_next()))
				messages.add(this.continue_key + ': ' + pages);

			if (!no_message) {
				// 使用時間, 歷時, 費時, elapsed time
				pages = '首先使用 ' + messages.last.age(new Date) + ' 以取得 '
						+ data.length + ' 個頁面內容。';
				// 在「首先使用」之後才設定 .last，才能正確抓到「首先使用」。
				messages.last = new Date;
				if (log_item.get_pages)
					messages.add(pages);
				library_namespace.debug(pages, 2, wiki_API.work);
				if (library_namespace.is_debug()
				// .show_value() @ interact.DOM, application.debug
				&& library_namespace.show_value)
					library_namespace.show_value(data, 'pages');
			}

			pages = data;

			// 注意: 一次取得大量頁面時，回傳內容不一定會按照原先輸入的次序排列！
			// 若有必要，此時得用 config.first 自行處理！
			if (typeof config.first === 'function') {
				// titles 可能為 undefined！
				config.first.call(this, messages, titles, pages);
			}

			/**
			 * 處理回傳超過 limit (12 MB)，被截斷之情形。
			 * 
			 * @deprecated: 已經在 wiki_API.page 處理。
			 */
			if (false && ('continue' in pages)) {
				if (setup_target) {
					var continue_id = pages['continue'].rvcontinue
					// assert: pages['continue'].rvcontinue = 'id|...'。
					.match(/^\d+/)[0],
					// -pages.length: 先回溯到 pages 開頭之 index。
					effect_length = -(work_continue - pages.length);
					/**
					 * 找到 pages.continue 所指之 index。
					 */
					if (config.is_id) {
						// 須注意 type，有 number 1 !== string '1' 之問題。
						if (typeof target[--work_continue] === 'number')
							continue_id |= 0;
						// 從後頭搜尋比較快。
						work_continue = target.lastIndexOf(continue_id,
								work_continue);
						if (work_continue === NOT_FOUND)
							throw new Error('page id not found: ' + continue_id);
						// assert: 一定找得到。
						// work_continue≥pages開頭之index=(原work_continue)-pages.length
					} else {
						continue_id |= 0;
						while (pages[--work_continue].pageid !== continue_id)
							;
					}
					effect_length += work_continue;
					if (false)
						console.log([ effect_length, pages.length,
								work_continue ]);

					// assert: 0 < effect_length < pages.length
					library_namespace.debug('一次取得大量頁面時，回傳內容過長而被截斷。將回退 '
							+ (pages.length - effect_length) + '頁，下次將自 '
							+ effect_length + '/' + pages.length + ' [['
							+ pages[effect_length].title + ']] id '
							+ continue_id + ' 開始。', 1, 'wiki_API.work');
					pages = pages.slice(0, effect_length);

				} else {
					library_namespace.err('wiki_API.work: 回傳內容過長而被截斷！');
				}
			}

			/**
			 * 處理回傳超過 limit (12 MB)，被截斷之情形。
			 */
			if ('OK_length' in pages) {
				if (setup_target) {
					// -pages.length: 先回溯到 pages 開頭之 index。
					work_continue -= pages.length - pages.OK_length;
				} else {
					library_namespace.err('wiki_API.work: 回傳內容過長而被截斷！');
				}

				library_namespace.debug('一次取得大量頁面時，回傳內容過長而被截斷。將回退 '
						+ (pages.length - pages.OK_length) + '頁，下次將自 '
						+ pages.OK_length + '/' + pages.length + ' [['
						+ pages[pages.OK_length].title + ']] id '
						+ pages[pages.OK_length].pageid + ' 開始。', 1,
						'wiki_API.work');
				pages = pages.slice(0, pages.OK_length);
			}

			library_namespace.debug('for each page: 主要機制是把工作全部推入 queue。', 2,
					'wiki_API.work');
			pages.forEach(function(page, index) {
				if (library_namespace.is_debug(2)
				// .show_value() @ interact.DOM, application.debug
				&& library_namespace.show_value)
					library_namespace.show_value(page, 'page');
				if (!page) {
					// nochange_count++;
					// Skip invalid page. 預防如 .work(['']) 的情況。
					return;
				}

				var _this = this;

				function clear_work() {
					// 警告: 直接清空 .actions 不安全！
					// _this.actions.clear();
					work_continue = target.length;

					var next;
					while (next = _this.actions[0]) {
						next = next[0];
						if (next === 'page' || next === 'edit')
							_this.actions.shift();
						else
							break;
					}
					library_namespace.debug('清空 actions queue: 剩下'
							+ _this.actions.length + ' actions。', 1,
							'wiki_API.work');
				}

				if (config.no_edit) {
					// 不作編輯作業。
					// 取得頁面內容。
					this.page(page, function(page_data) {
						each(page_data, messages);
						if (messages.quit_operation) {
							clear_work();
						}
					}, config.page_options);

				} else {
					// clone() 是為了能個別改變 summary。
					// 例如: each() { options.summary += " -- ..."; }
					var work_options = Object.clone(options);
					// 取得頁面內容。一頁頁處理。
					this.page(page, null, config.page_options)
					// 編輯頁面內容。
					.edit(function(page_data) {
						// edit/process
						if (!no_message)
							library_namespace.sinfo([ 'wiki_API.work: edit '
							//
							+ (index + 1) + '/' + pages.length
							//
							+ ' [[', 'fg=yellow',
							//
							page_data.title, '-fg', ']]' ]);
						// 以 each() 的回傳作為要改變成什麼內容。
						var content = each(page_data, messages, work_options);
						if (messages.quit_operation) {
							clear_work();
						}
						return content;
					}, work_options, callback);
				}
			}, this);

			this.run(function() {
				if (!no_message) {
					library_namespace.debug('收尾。', 1, 'wiki_API.work');
					var count_summary = ': 完成 '
							+ done
							//
							+ (done === pages.length ? '' : '/' + pages.length)
							//
							+ (pages.length === target.length ? '' : '//'
									+ target.length) + ' 條目';
					if (log_item.report)
						messages.unshift(count_summary + '，'
						// 未改變任何條目。
						+ (nochange_count ? (done === nochange_count
						//
						? '所有' : nochange_count + ' ') + '條目未作變更，' : '')
						// 使用時間, 歷時, 費時, elapsed time
						+ '前後總共 ' + messages.start.age(new Date) + '。');
					if (this.stopped)
						messages.add("'''已停止作業'''，放棄編輯。");
					if (done === nochange_count)
						messages.add('全無變更。');
					if (log_item.title && config.summary)
						// unescape
						messages.unshift(config.summary.replace(/</g, '&lt;'));
				}

				if (typeof config.last === 'function')
					// 對於量過大而被分割者，每次分段結束都將執行一次 .last()。
					config.last.call(this, messages, titles, pages);

				var log_to = 'log_to' in config ? config.log_to
				// default log_to
				: 'User:' + this.token.lgname + '/log/'
						+ (new Date).format('%4Y%2m%2d'),
				// options for summary.
				options = {
					// new section. append 章節/段落 after all, at bottom.
					section : 'new',
					// 章節標題
					sectiontitle : '['
							+ (new Date).format(config.date_format
									|| this.date_format) + ']' + count_summary,
					// Robot: 若用戶名包含 'bot'，則直接引用之。
					summary : (this.token.lgname.length < 9
					//
					&& /bot/i.test(this.token.lgname)
					//
					? this.token.lgname : 'Robot') + ': '
					//
					+ config.summary + count_summary,
					// Throw an error if the page doesn't exist.
					// 若頁面不存在，則產生錯誤。
					nocreate : 1,
					// 標記此編輯為機器人編輯。
					bot : 1,
					// 就算設定停止編輯作業，仍強制編輯。一般僅針對測試頁面或自己的頁面，例如寫入 log。
					skip_stopped : true
				};

				if (no_message) {
					;
				} else if (log_to && (done !== nochange_count
				// 若全無變更，則預設僅從 console 提示，不寫入 log 頁面。因此無變更者將不顯示。
				|| config.log_nochange)) {
					this.page(log_to)
					// 將 robot 運作記錄、log summary 報告結果寫入 log 頁面。
					// TODO: 以表格呈現。
					.edit(messages.join('\n'), options,
					// wiki_API.work() 添加網頁報告。
					function(title, error, result) {
						if (error) {
							library_namespace.warn(
							//
							'wiki_API.work: Can not write log to [' + log_to
							//
							+ ']! Try to write to [' + 'User:'
							//
							+ this.token.lgname + ']');
							library_namespace.log(
							//
							'\nlog:<br />\n' + messages.join('<br />\n'));
							// 改寫於可寫入處。e.g., 'Wikipedia:Sandbox'
							// TODO: bug: 當分批時，只會寫入最後一次。
							this.page('User:' + this.token.lgname)
							//
							.edit(messages.join('\n'), options);
						}
					});
				} else {
					library_namespace.log('\nlog:<br />\n'
							+ messages.join('<br />\n'));
				}

				if (setup_target && work_continue < target.length) {
					// 繼續下一批。
					setup_target();
					return;
				}

				// config.callback()
				// 只有在成功時，才會繼續執行。
				if (typeof config.after === 'function')
					this.run(config.after);

				this.run(function() {
					library_namespace.log('wiki_API.work: 結束 .work() 作業'
					// 已完成作業
					+ (config.summary ? ' [' + config.summary + ']' : '。'));
				});
			});

		}).bind(this);

		var target = pages || titles,
		// 首先取得多個頁面內容所用之 options。
		page_options = Object.assign({
			is_id : config.is_id,
			multi : true
		}, config.page_options),
		// 處理數目限制 limit。單一頁面才能取得多 revisions。多頁面(≤50)只能取得單一 revision。
		// https://www.mediawiki.org/w/api.php?action=help&modules=query
		// titles/pageids: Maximum number of values is 50 (500 for bots).
		slice_size = config.slice >= 1 ? Math.min(config.slice | 0, 500) : 500,
		/** {ℕ⁰:Natural+0}自此 index 開始繼續作業 */
		work_continue = 0, setup_target;

		if (!config.no_edit) {
			var check_options = config.check_options;
			if (!check_options && typeof config.log_to === 'string'
			// 若 log_to 以數字作結，自動將其當作 section。
			&& (check_options = config.log_to.match(/\d+$/))) {
				check_options = {
					section : check_options[0]
				};
			}

			if (check_options)
				// wiki_API.check_stop()
				this.check(check_options);
		}

		if (Array.isArray(target)) {
			// Split when length is too long. 分割過長的 list。
			setup_target = (function() {
				var this_slice = target.slice(work_continue, work_continue
						+ slice_size),
				// 自動判別最大可用 index，預防 "414 Request-URI Too Long"。
				// 因為 8000/500-3 = 13 > 最長 page id，因此即使 500頁也不會超過。
				// 為提高效率，不作 check。
				max_size = config.is_id ? 500 : check_max_length(this_slice);
				if (max_size < slice_size)
					this_slice = this_slice.slice(0, max_size);
				if (work_continue === 0 && max_size === target.length) {
					library_namespace.debug('設定一次先取得所有 ' + target.length
							+ ' 個頁面之 revisions (page contents 頁面內容)。', 2,
							'wiki_API.work');
				} else {
					nochange_count = target.length;
					// start-end/all
					done = '處理分塊 ' + (work_continue + 1) + '–'
							+ (work_continue + max_size) + '/' + nochange_count;
					// Add percentage.
					if (nochange_count > 1e4)
						done += ' ('
								+ (100 * work_continue / nochange_count | 0)
								+ '%)';
					// done += '。';
					nochange_count = 'wiki_API.work: ';
					done = config.summary ? [ nochange_count, 'fg=green',
							config.summary, '-fg', ': ' + done ]
							: [ nochange_count + done ];
					library_namespace.sinfo(done);
				}

				// reset count and log.
				done = nochange_count = 0;
				messages.reset();

				work_continue += max_size;
				this.page(this_slice, main_work, page_options);
			}).bind(this);
			setup_target();

		} else {
			// assert: target is {String}title or {Object}page_data
			library_namespace.debug('取得單一頁面之 (page contents 頁面內容)。', 2,
					'wiki_API.work');
			this.page(target, main_work, page_options);
		}
	};

	/**
	 * 選擇要紀錄的項目。在大量編輯時，可利用此縮減 log。
	 * 
	 * @type {Object}
	 */
	wiki_API.prototype.work.log_item = {
		title : true,
		report : true,
		get_pages : true,
		// 跳過[[WP:NULLEDIT|無改變]]的。
		// nochange : false,
		error : true,
		succeed : true
	};

	// --------------------------------------------------------------------------------------------
	// 以下皆泛用，無須 wiki_API instance。

	/**
	 * 實際執行 query 操作，直接 call API 之核心函數。
	 * 
	 * 所有會利用到 wiki_API.prototype.work ← wiki_API.prototype.next ← <br />
	 * wiki_API.page, wiki_API.edit, ... ← wiki_API.query ← get_URL ← <br />
	 * need standalone http agent 的功能，都需要添附 session 參數。
	 * 
	 * @param {String|Array}action
	 *            {String}action or [ {String}api URL, {String}action,
	 *            {Object}other parameters ]
	 * @param {Function}callback
	 *            回調函數。 callback(response data, error)
	 * @param {Object}[post_data]
	 *            data when need using POST method
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項<br />
	 *            wiki_API.edit 可能輸入 session 當作 options。
	 */
	wiki_API.query = function(action, callback, post_data, options) {
		// 處理 action
		library_namespace.debug('action: ' + action, 2, 'wiki_API.query');
		if (typeof action === 'string')
			action = [ , action ];
		else if (!Array.isArray(action))
			library_namespace.err('wiki_API.query: Invalid action: [' + action
					+ ']');
		library_namespace.debug('api URL: (' + (typeof action[0]) + ') ['
				+ action[0] + '] → [' + api_URL(action[0]) + ']', 3,
				'wiki_API.query');
		action[0] = api_URL(action[0]);

		// https://www.mediawiki.org/w/api.php?action=help&modules=query
		if (!/^[a-z]+=/.test(action[1]))
			action[1] = 'action=' + action[1];

		// respect maxlag. 若為 query，非 edit (modify)，則不延遲等待。
		var need_check_lag
		// method 2: edit 時皆必須設定 token。
		= post_data && post_data.token,
		// 檢測是否間隔過短。支援最大延遲功能。
		to_wait,
		// interval.
		lag_interval = options && options.lag >= 0 ? options.lag :
		// ↑ wiki_API.edit 可能輸入 session 當作 options。
		// options[SESSION_KEY] && options[SESSION_KEY].lag ||
		wiki_API.query.default_lag;

		if (false) {
			// method 1:
			// assert: typeof action[1] === 'string'
			need_check_lag = action[1]
					.match(/(?:action|assert)=([a-z]+)(?:&|$)/);
			if (!need_check_lag) {
				library_namespace.warn('wiki_API.query: Unknown action: '
						+ action[1]);
			} else if (need_check_lag = /edit|create/i.test(need_check_lag[1])) {
				to_wait = lag_interval
						- (Date.now() - wiki_API.query.last[action[0]]);
			}
		}
		if (need_check_lag) {
			to_wait = lag_interval
					- (Date.now() - wiki_API.query.last[action[0]]);
		}

		// TODO: 伺服器負載過重的時候，使用 exponential backoff 進行延遲。
		if (to_wait > 0) {
			library_namespace.debug('Waiting ' + to_wait + ' ms..', 2,
					'wiki_API.query');
			setTimeout(function() {
				wiki_API.query(action, callback, post_data, options);
			}, to_wait);
			return;
		}
		if (need_check_lag) {
			// reset timer
			wiki_API.query.last[action[0]] = Date.now();
		} else {
			library_namespace.debug('非 edit (modify)，不延遲等待。', 3,
					'wiki_API.query');
		}

		// https://www.mediawiki.org/wiki/API:Data_formats
		// 因不在 white-list 中，無法使用 CORS。
		action[0] += '?' + action[1];
		// [ {String}api URL, {String}action, {Object}other parameters ]
		// →
		// [ {String}URL, {Object}other parameters ]
		action = library_namespace.is_Object(action[2]) ? [ action[0],
				action[2] ]
		//
		: [ action[2] ? action[0] + action[2] : action[0],
				library_namespace.null_Object() ];
		if (!action[1].format)
			// 加上 "&utf8", "&utf8=1" 可能會導致把某些 link 中 URL 編碼也給 unescape 的情況！
			action[0] = get_URL.add_param(action[0], 'format=json&utf8');

		// 一般情況下會重新導向至 https。
		// 若在 Tool Labs 中，則視為在同一機房內，不採加密。如此亦可加快傳輸速度。
		if (wmflabs && wiki_API.use_Varnish) {
			// UA → nginx → Varnish:80 → Varnish:3128 → Apache → HHVM → database
			// https://wikitech.wikimedia.org/wiki/LVS_and_Varnish
			library_namespace.debug('connect to Varnish:3128 directly.', 3,
					'wiki_API.query');
			// [[User:Antigng/https expected]]
			var HOST;
			action[0] = action[0].replace(
			//
			/^https?:\/\/([a-z\-\d]{2,20}\.wikipedia\.org)\//,
			//
			function(all, host) {
				HOST = host;
				return 'http://cp1008.wikimedia.org:3128/';
			});
			if (HOST) {
				action = {
					URL : action,
					headers : {
						HOST : HOST,
						'X-Forwarded-For' : '127.0.0.1',
						'X-Forwarded-Proto' : 'https'
					}
				};
			}
		}

		/**
		 * TODO: 簡易的泛用先期處理程式。
		 * 
		 * @inner
		 */
		function response_handler(response) {
			if (library_namespace.is_debug(3)
			// .show_value() @ interact.DOM, application.debug
			&& library_namespace.show_value)
				library_namespace.show_value(data, 'wiki_API.query: data');

			var error = data && data.error;
			// 檢查伺服器回應是否有錯誤資訊。
			if (error) {
				library_namespace.err('wiki_API.query: ['
				//
				+ error.code + '] ' + error.info);
			}

			if (typeof callback === 'function')
				callback(response);
		}

		// 開始處理 query request。
		if (!post_data && wiki_API.query.allow_JSONP) {
			library_namespace.debug(
					'採用 JSONP callback 的方法。須注意：若有 error，將不會執行 callback！', 2,
					'wiki_API.query');
			library_namespace.debug('callback : (' + (typeof callback) + ') ['
					+ callback + ']', 3, 'wiki_API.query');
			get_URL(action, {
				callback : callback
			});

		} else {
			var get_URL_options = options && options.get_URL_options;
			// @see function setup_API_URL(session, API_URL)
			if (!get_URL_options) {
				var session = options && (options[SESSION_KEY]
				// 檢查若 options 本身即為 session。
				|| options.token && options);
				if (session) {
					// assert: get_URL_options 為 session。
					if (!session.get_URL_options) {
						library_namespace.debug(
								'為 wiki_API instance，但無 agent，需要造出 agent。', 2,
								'wiki_API.query');
						setup_API_URL(session, true);
					}
					get_URL_options = session.get_URL_options;

				}
			}

			if (false) {
				// test options.get_URL_options
				if (get_URL_options) {
					if (false)
						console.log('wiki_API.query: Using get_URL_options: '
								+ get_URL_options.agent);
					// console.log(options);
					// console.log(action);
				} else {
					// console.trace('wiki_API.query: Without get_URL_options');
					// console.log(action);
					throw 'wiki_API.query: Without get_URL_options';
				}
			}

			if (false && typeof callback === 'function'
			// use options.get_URL_options:{onfail:function(error){}} instead.
			&& (!get_URL_options || !get_URL_options.onfail)) {
				get_URL_options = Object.assign({
					// 警告: 若是自行設定 .onfail，則需要自己處理 callback。
					// 例如可能得在最後自己執行 ((wiki.running = false))。
					onfail : function(error) {
						callback && callback(undefined, error);
					}
				}, get_URL_options);
			}

			var agent = get_URL_options && get_URL_options.agent;
			if (agent && agent.last_cookie && (agent.last_cookie.length > 80
			// cache cache: 若是用同一個 agent 來 access 過多 Wikipedia 網站，
			// 可能因 wikiSession 過多(如.length === 86)而造成 413 (請求實體太大)。
			|| agent.cookie_cache)) {
				if (agent.last_cookie.length > 80) {
					library_namespace.debug('重整 cookie['
							+ agent.last_cookie.length + ']。', 1,
							'wiki_API.query');
					if (!agent.cookie_cache)
						agent.cookie_cache
						// {zh:['','',...],en:['','',...]}
						= library_namespace.null_Object();
					var last_cookie = agent.last_cookie;
					agent.last_cookie = [];
					while (last_cookie.length > 0) {
						var cookie_item = last_cookie.pop();
						if (!cookie_item) {
							// 不知為何，也可能出現這種 cookie_item === undefined 的情況。
							continue;
						}
						var matched = cookie_item
								.match(/^([a-z_\d]{2,20})wiki/);
						if (matched) {
							var language = matched[1];
							if (language in agent.cookie_cache)
								agent.cookie_cache[language].push(cookie_item);
							else
								agent.cookie_cache[language] = [ cookie_item ];
						} else {
							agent.last_cookie.push(cookie_item);
						}
					}
					library_namespace.debug('重整 cookie: → ['
							+ agent.last_cookie.length + ']。', 1,
							'wiki_API.query');
				}

				var language = session && session.language;
				if (!language) {
					library_namespace.debug(
							'未設定 session，自 API_URL 擷取 language: [' + action[0]
									+ ']。', 1, 'wiki_API.query');
					language = typeof action[0] === 'string'
					// TODO: 似乎不能真的擷取到所需 language。
					&& action[0].match(/^https?:\/\/([a-z\-\d]{2,20})\./);
					language = language && language[1] || default_language;
					library_namespace.warn('wiki_API.query: Get "' + language
							+ '" from ' + JSON.stringify(action));
				}
				language = language.replace(/-/g, '_');
				if (language in agent.cookie_cache) {
					agent.last_cookie.append(agent.cookie_cache[language]);
					delete agent.cookie_cache[language];
				}
			}

			get_URL(action, function(XMLHttp) {
				var status_code = XMLHttp.status,
				//
				response = XMLHttp.responseText;
				if (/^[45]/.test(status_code)) {
					// e.g., 503, 413
					if (get_URL_options
							&& typeof get_URL_options.onfail === 'function') {
						get_URL_options.onfail(status_code);
					} else if (typeof callback === 'function') {
						library_namespace.warn(
						//
						'wiki_API.query: Get error ' + status_code + ': '
						// 避免 TypeError:
						// Cannot convert object to primitive value
						+ JSON.stringify(action));
						callback(response, status_code);
					}
					return;
				}

				// response = XMLHttp.responseXML;
				library_namespace.debug('response ('
						+ response.length
						+ ' characters): '
						+ (library_namespace.platform.nodejs ? '\n' + response
								: response.replace(/</g, '&lt;')), 3,
						'wiki_API.query');

				// "<\": for Eclipse JSDoc.
				if (/<\html[\s>]/.test(response.slice(0, 40))) {
					response = response.between('source-javascript', '</pre>')
							.between('>')
							// 去掉所有 HTML tag。
							.replace(/<[^>]+>/g, '');

					// '&#123;' : (")
					// 可能會導致把某些 link 中 URL 編碼也給 unescape 的情況?
					if (response.includes('&#'))
						response = library_namespace.HTML_to_Unicode(response);
				}

				// library_namespace.log(response);
				// library_namespace.log(library_namespace.HTML_to_Unicode(response));
				if (response) {
					try {
						response = library_namespace.parse_JSON(response);
					} catch (e) {
						// <title>414 Request-URI Too Long</title>
						// <title>414 Request-URI Too Large</title>
						if (response.includes('>414 Request-URI Too ')) {
							library_namespace.debug(
							//
							action[0], 1, 'wiki_API.query');
						} else {
							// TODO: 處理 API 傳回結尾亂編碼的情況。
							// https://phabricator.wikimedia.org/T134094
							// 不一定總是有效。

							library_namespace.err(
							//
							'wiki_API.query: Invalid content: ['
									+ String(response).slice(0, 40000) + ']');
							library_namespace.err(e);
						}

						// error handling
						if (get_URL_options.onfail) {
							get_URL_options.onfail(e);
						} else if (typeof callback === 'function') {
							callback(response, e);
						}

						// exit!
						return;
					}
				}

				if (typeof callback === 'function') {
					callback(response);
				}

			}, undefined, post_data, get_URL_options);
		}
	};

	/**
	 * edit (modify) 時之最大延遲參數。<br />
	 * default: 使用5秒 (5000 ms) 的最大延遲參數。
	 * 
	 * 在 Tool Labs edit wikidata，單線程均速最快約 1584 ms/edits。
	 * 
	 * @type {Object} of {ℕ⁰:Natural+0}
	 * 
	 * @see https://www.mediawiki.org/wiki/Manual:Maxlag_parameter
	 *      https://www.mediawiki.org/wiki/API:Etiquette 禮儀
	 *      https://phabricator.wikimedia.org/T135240
	 */
	wiki_API.query.default_lag = 5000;

	// local rule
	wiki_API.query.lag = {
		// [[:ja:WP:bot]]
		// Botの速度は、おおよそ毎分 6 編集を限度としてください。
		// e.g., @ User contributions,
		// Due to high database server lag, changes newer than 30 seconds may
		// not be shown in this list.
		// 由於資料庫回應延遲，此清單可能不會顯示最近 30 秒內的變更。
		// Changes newer than 25 seconds may not be shown in this list.
		// 此清單可能不會顯示最近 25 秒內的變更。
		ja : 10000
	};

	/**
	 * 對於可以不用 XMLHttp 的，直接採 JSONP callback 法。
	 * 
	 * @type {Boolean}
	 */
	wiki_API.query.allow_JSONP = library_namespace.is_WWW(true);

	/**
	 * URL last queried.<br />
	 * wiki_API.query.last[URL] = {Date}last queried date
	 * 
	 * @type {Object}
	 */
	wiki_API.query.last = library_namespace.null_Object();

	/**
	 * 取得 page_data 之 title parameter。<br />
	 * e.g., {pageid:8,title:'abc'} → 'pageid=8'<br />
	 * e.g., {title:'abc'} → 'title=abc'<br />
	 * e.g., 'abc' → 'title=abc'<br />
	 * 
	 * @param {Object}page_data
	 *            page data got from wiki API.
	 * @param {Boolean}[multi]
	 *            page_data is {Array}multi-page_data
	 * @param {Boolean}[is_id]
	 *            page_data is page_id instead of page_data
	 * @param {String}[param_name]
	 *            param name. default: 'title' or 'titles'.
	 */
	wiki_API.query.title_param = function(page_data, multi, is_id, param_name) {
		var pageid;

		if (Array.isArray(page_data)) {
			// auto detect multi
			if (multi === undefined)
				multi = pageid.length > 1;

			pageid = [];
			// 確認所有 page_data 皆有 pageid 屬性。
			if (page_data.every(function(page) {
				// {ℕ⁰:Natural+0}page.pageid
				if (page = page && page.pageid)
					pageid.push(page);
				return page;
			})) {
				pageid = pageid.join('|');

			} else {
				if (library_namespace.is_Object(page_data)) {
					library_namespace
							.warn('wiki_API.query.title_param: 看似有些非正規之頁面資料。');
					library_namespace
							.info('wiki_API.query.title_param: 將採用 title 為主要查詢方法。');
				}
				// reset
				pageid = page_data
						.map(function(page) {
							// {String}title or {title:'title'}
							return (typeof page === 'object' ? page.title
									: page)
									|| '';
						});
				if (is_id) {
					pageid = pageid.join('|');
				} else {
					page_data = pageid.join('|');
					pageid = undefined;
				}
				library_namespace.debug(pageid || page_data, 2,
						'wiki_API.query.title_param');
			}

		} else if (library_namespace.is_Object(page_data)) {
			if (page_data.pageid)
				// 有 pageid 則使用之，以加速 search。
				pageid = page_data.pageid;
			else
				page_data = page_data.title;

		} else if (is_id !== false && typeof page_data === 'number'
		// {ℕ⁰:Natural+0}pageid should > 0.
		// pageid 0 回傳格式不同於 > 0 時。
		// https://www.mediawiki.org/w/api.php?action=query&prop=revisions&pageids=0
		&& page_data > 0 && page_data === (page_data | 0)) {
			pageid = page_data;

		} else if (!page_data) {
			library_namespace
					.err('wiki_API.query.title_param: Invalid title: ['
							+ page_data + ']');
			// console.warn(page_data);
		}

		multi = multi ? 's=' : '=';

		return pageid === undefined
		//
		? (param_name || 'title' + multi) + encodeURIComponent(page_data)
		//
		: 'pageid' + multi + pageid;
	};

	/**
	 * get id of page
	 * 
	 * @param {Object}page_data
	 *            page data got from wiki API.
	 * @param {Boolean}[title_only]
	 *            get title only
	 */
	wiki_API.query.id_of_page = function(page_data, title_only) {
		if (Array.isArray(page_data))
			return page_data.map(function(page) {
				wiki_API.query.id_of_page(page, title_only);
			});
		if (library_namespace.is_Object(page_data))
			// 有 pageid 則使用之，以加速。
			return !title_only && page_data.pageid || page_data.title;

		if (!page_data)
			library_namespace.err('wiki_API.query.id_of_page: Invalid title: ['
					+ page_data + ']');
		return page_data;
	};

	// TODO
	function normalize_title_parameter(title, options) {
		// 處理 [ {String}API_URL, {String}title or {Object}page_data ]
		if (!Array.isArray(title)
		// 為了預防輸入的是問題頁面。
		|| title.length !== 2 || typeof title[0] === 'object')
			title = [ , title ];
		title[1] = wiki_API.query.title_param(title[1], true, options
				&& options.is_id);

		if (options && options.redirects)
			// 毋須 '&redirects=1'
			title[1] += '&redirects';

		return title;
	}

	// ------------------------------------------------------------------------

	if (false) {
		wiki.page('巴黎協議 (消歧義)', {
			query_props : 'pageprops'
		});
		// wiki.last_page
	}

	/**
	 * 讀取頁面內容，取得頁面源碼。可一次處理多個標題。
	 * 
	 * @example <code>

	CeL.wiki.page('史記', function(page_data) {
		CeL.show_value(page_data);
	});

	 </code>
	 * 
	 * @param {String|Array}title
	 *            title or [ {String}API_URL, {String}title or {Object}page_data ]
	 * @param {Function}[callback]
	 *            回調函數。 callback(page_data, error) { page_data.title; var
	 *            content = CeL.wiki.content_of(page_data); }
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @see https://www.mediawiki.org/w/api.php?action=help&modules=query%2Brevisions
	 */
	wiki_API.page = function(title, callback, options) {
		if (typeof callback === 'object' && options === undefined) {
			// shift arguments
			options = callback;
			callback = undefined;
		}

		// 正規化並提供可隨意改變的同內容參數，以避免修改或覆蓋附加參數。
		options = library_namespace.new_options(options);

		if (options.query_props) {
			var query_props = options.query_props, page_data,
			//
			get_properties = function(page) {
				if (page) {
					if (page_data)
						Object.assign(page_data, page);
					else
						page_data = page;
				}
				var prop;
				while (query_props.length > 0
				//
				&& !(prop = query_props.shift()))
					;

				if (!prop || page_data && ('missing' in page_data)) {
					callback(page_data);
				} else {
					library_namespace.debug('Get property: [' + prop + ']', 1,
							'wiki_API.page');
					options.prop = prop;
					wiki_API.page(title, get_properties, options);
				}
			};

			delete options.query_props;
			if (typeof query_props === 'string')
				query_props = query_props.split('|');
			if (Array.isArray(query_props)) {
				if (!options.no_content)
					query_props.push('revisions');
				get_properties();
			} else {
				library_namespace.err('wiki_API.page: Invalid .query_props!');
				throw 'Invalid .query_props';
			}
			return;
		}

		var action = Array.isArray(title) ? title.clone() : title;

		// 處理 [ {String}API_URL, {String}title or {Object}page_data ]
		if (!Array.isArray(action)
		// 為了預防輸入的是問題頁面。
		|| action.length !== 2 || typeof action[0] === 'object')
			action = [ , action ];
		action[1] = wiki_API.query.title_param(action[1], true, options
				&& options.is_id);

		if (options.redirects)
			// 毋須 '&redirects=1'
			action[1] += '&redirects';

		var get_content;
		if ('prop' in options) {
			get_content = options.prop &&
			// {String|Array}
			options.prop.includes('revisions');
		} else {
			options.prop = 'revisions';
			get_content = true;
		}

		if (get_content) {
			// 處理數目限制 limit。單一頁面才能取得多 revisions。多頁面(≤50)只能取得單一 revision。
			// https://www.mediawiki.org/w/api.php?action=help&modules=query
			// titles/pageids: Maximum number of values is 50 (500 for bots).
			if ('rvlimit' in options) {
				if (options.rvlimit > 0 || options.rvlimit === 'max')
					action[1] += '&rvlimit=' + options.rvlimit;
			} else if (!action[1].includes('|')
			//
			&& !action[1].includes(encodeURIComponent('|')))
				// default: 僅取得單一 revision。
				action[1] += '&rvlimit=1';

			// prop=info|revisions
			action[1] = 'rvprop='
			//
			+ ((Array.isArray(options.rvprop)
			//
			&& options.rvprop.join('|') || options.rvprop)
			//
			|| wiki_API.page.rvprop) + '&'
			// &rvexpandtemplates=1
			+ action[1];
		}

		// 輸入 prop:'' 或再加上 redirects:1 可以僅僅確認頁面是否存在，以及頁面的正規標題。
		if (options.prop) {
			if (Array.isArray(options.prop))
				options.prop = options.prop.join('|');

			// e.g., prop=pageprops|revisions
			action[1] = 'prop=' + options.prop + '&' + action[1];
		}

		action[1] = 'query&' + action[1];

		if (!action[0])
			action = action[1];

		if (false)
			library_namespace.debug('get url token: ' + action, 0,
					'wiki_API.page');

		wiki_API.query(action, typeof callback === 'function'
		//
		&& function(data) {
			if (library_namespace.is_debug(2)
			// .show_value() @ interact.DOM, application.debug
			&& library_namespace.show_value)
				library_namespace.show_value(data, 'wiki_API.page: data');

			var error = data && data.error;
			// 檢查伺服器回應是否有錯誤資訊。
			if (error) {
				library_namespace.err('wiki_API.page: ['
				//
				+ error.code + '] ' + error.info);
				/**
				 * e.g., Too many values supplied for parameter 'pageids': the
				 * limit is 50
				 */
				if (data.warnings && data.warnings.query
				//
				&& data.warnings.query['*'])
					library_namespace.warn(
					//
					'wiki_API.page: ' + data.warnings.query['*']);
				callback(undefined, error);
				return;
			}

			if (data.warnings && data.warnings.result
			/**
			 * e.g., <code>
			 * { continue: { rvcontinue: '2421|39477047', continue: '||' },
			 *   warnings: { result: { '*': 'This result was truncated because it would otherwise  be larger than the limit of 12,582,912 bytes' } },
			 *   query:
			 *    { pages:
			 *       { '13': [Object],
			 *       ...
			 * </code>
			 * limit: 12 MB. 此時應該有 .continue。
			 */
			&& data.warnings.result['*']) {
				if (false && data.warnings.result['*'].includes('truncated'))
					data.truncated = true;
				library_namespace.warn(
				//
				'wiki_API.page: ' + data.warnings.result['*']);
			}

			if (!data || !data.query || !data.query.pages) {
				library_namespace.warn('wiki_API.page: Unknown response: ['
				// e.g., 'wiki_API.page: Unknown response:
				// [{"batchcomplete":""}]'
				+ (typeof data === 'object' && typeof JSON !== 'undefined'
				//
				? JSON.stringify(data) : data) + ']');
				// library_namespace.set_debug(6);
				if (library_namespace.is_debug()
				// .show_value() @ interact.DOM, application.debug
				&& library_namespace.show_value)
					library_namespace.show_value(data);
				callback(undefined, 'Unknown response');
				return;
			}

			var page_list = [],
			//
			page_cache_prefix = library_namespace.platform.nodejs && node_fs
			//
			&& options.page_cache_prefix;

			var continue_id;
			if ('continue' in data) {
				// page_list['continue'] = data['continue'];
				if (data['continue']
				//
				&& typeof data['continue'].rvcontinue === 'string'
				//
				&& (continue_id = data['continue'].rvcontinue
				// assert: page_list['continue'].rvcontinue = 'id|...'。
				.match(/^[1-9]\d*/))) {
					continue_id = Math.floor(continue_id[0]);
				}
				if (false && data.truncated)
					page_list.truncated = true;
			}

			var pages = data.query.pages;

			for ( var pageid in pages) {
				var page = pages[pageid];
				if (!get_page_content.has_content(page)) {
					// 其他 .prop 本來就不會有內容。
					var need_warn = get_content;

					if (continue_id && continue_id === page.pageid) {
						// 找到了 page_list.continue 所指之 index。
						// effect length
						page_list.OK_length = page_list.length;
						// 當過了 continue_id 之後，表示已經被截斷，則不再警告。
						need_warn = false;
					}

					if (need_warn) {
						library_namespace.warn('wiki_API.page: '
						// 頁面不存在。Page does not exist. Deleted?
						+ ('missing' in page ? 'Not exists' : 'No content')
						//
						+ ': ' + (page.title ? '[[' + page.title + ']]'
						//
						: 'id ' + page.pageid));
					}

				} else if (page_cache_prefix) {
					node_fs.writeFile(page_cache_prefix + page.title + '.json',
					/**
					 * 寫入cache。
					 */
					JSON.stringify(pages), wiki_API.encoding);
				}

				page_list.push(page);
			}

			// options.multi: 即使只取得單頁面，依舊回傳 Array。
			if (!options.multi) {
				if (page_list.length <= 1) {
					// e.g., pages: { '1850031': [Object] }
					library_namespace.debug('只取得單頁面 [[' + page_list
					//
					+ ']]，將回傳此頁面內容，而非 Array。', 2, 'wiki_API.page');
					page_list = page_list[0];
					if (page_list && get_content
					//
					&& (page_list.is_Flow = is_Flow(page_list))
					// e.g., { flow_view : 'header' }
					&& options.flow_view) {
						Flow_page(page_list, callback, options);
						return;
					}

				} else {
					library_namespace.debug('Get ' + page_list.length
					//
					+ ' page(s)! The pages will all '
					//
					+ 'passed to the callback as Array!', 2, 'wiki_API.page');
				}
			}

			if (options.save_response) {
				// 附帶原始回傳查詢資料。
				// save_data, query_data
				// assert: !('response' in page_list)
				page_list.response = data;
			}

			// page 之 structure 將按照 wiki API 本身之 return！
			// page_data = {pageid,ns,title,revisions:[{timestamp,'*'}]}
			callback(page_list);

		}, null, options);
	};

	// default properties of revisions
	// timestamp 是為了 wiki_API.edit 檢查用。
	wiki_API.page.rvprop = 'content|timestamp';

	// ------------------------------------------------------------------------

	/**
	 * 取得頁面之重定向/重新導向資料。
	 * 
	 * @example <code>

	CeL.wiki.redirect_to('史記', function(redirect_data, page_data) {
		CeL.show_value(redirect_data);
	});

	 </code>
	 * 
	 * @param {String|Array}title
	 *            title or [ {String}API_URL, {String}title or {Object}page_data ]
	 * @param {Function}[callback]
	 *            回調函數。 callback({String}title that redirect to or {Object}with
	 *            redirect to what section, {Object}page_data, error)
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @see https://www.mediawiki.org/w/api.php?action=help&modules=query%2Brevisions
	 */
	wiki_API.redirect_to = function(title, callback, options) {
		wiki_API.page(title, function(page_data, error) {
			if (!page_data || ('missing' in page_data) || error) {
				// error?
				callback(undefined, page_data, error);
				return;
			}

			// e.g., [ { from: 'AA', to: 'A', tofragment: 'aa' } ]
			var redirect_data = page_data.response.query.redirects;
			if (redirect_data) {
				if (redirect_data.length !== 1) {
					// 可能是多重重定向？
					// e.g., A→B→C
					library_namespace.warn('wiki_API.redirect_to: Get '
							+ redirect_data.length + ' redirect links for ['
							// title.join(':')
							+ title + ']!');
					library_namespace.warn(redirect_data);
				}
				// 僅取用並回傳第一筆資料。
				redirect_data = redirect_data[0];
				// assert: redirect_data && redirect_data.to === page_data.title

				// test REDIRECT [[title#section]]
				if (redirect_data.tofragment) {
					library_namespace.debug('[[' + title
					// →
					+ ']] redirected to section [[' + redirect_data.to + '#'
							+ redirect_data.tofragment + ']]!', 1,
							'wiki_API.redirect_to');
					callback(redirect_data, page_data);
					return;
				}

			}

			// page_data.title is normalized title.
			callback(page_data.title, page_data);

		}, Object.assign({
			// 輸入 prop:'' 或再加上 redirects:1 可以僅僅確認頁面是否存在，以及頁面的正規標題。
			prop : '',
			redirects : 1,
			save_response : true
		}, options));
	};

	// ------------------------------------------------------------------------

	if (false) {
		CeL.wiki.langlinks('語言', function(title) {
			title === 'Language';
			if (title)
				CeL.show_value(title);
		}, 'en');

		CeL.wiki.langlinks([ 'en', 'Language' ], function(title) {
			title === '語言';
			if (title)
				CeL.show_value(title);
		}, 'zh');

		// TODO?
		// return 'title' or {langs:['',''], lang:'title'}
		CeL.wiki.langlinks('語言', function(title) {
			if (title)
				CeL.show_value(title);
		}) == CeL.wiki.langlinks('語言', function(title) {
			if (title)
				CeL.show_value(title);
		}, 10)
		// == {langs:['',''], lang:'title'}

		// 未指定 page，表示已完成。
	}

	/**
	 * 取得 title 在其他語系 (to_lang) 之標題。 Interlanguage title. 可一次處理多個標題。
	 * 
	 * @param {String|Array}title
	 *            the page title to search continue information
	 * @param {Function|Object}callback
	 *            回調函數 or options。
	 * @param {String}to_lang
	 *            所欲求語言。
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @see https://www.mediawiki.org/wiki/Manual:Langlinks_table
	 */
	wiki_API.langlinks = function(title, callback, to_lang, options) {
		var from_lang;
		if (Array.isArray(title) && title.length === 2
				&& (!title[0] || typeof title[0] === 'string'))
			from_lang = title[0], title = title[1];
		title = 'query&prop=langlinks&'
				+ wiki_API.query.title_param(title, true, options
						&& options.is_id);
		if (to_lang)
			title += (to_lang > 0 || to_lang === 'max' ? '&lllimit='
					: '&lllang=')
					+ to_lang;
		if (options && (options.limit > 0 || options.limit === 'max'))
			title += '&lllimit=' + options.limit;
		// console.log('ll title:' + title);
		if (from_lang)
			// llinlanguagecode 無效。
			title = [ from_lang, title ];

		wiki_API.query(title, typeof callback === 'function'
		//
		&& function(data) {
			if (!data || !data.query || !data.query.pages) {
				/**
				 * From version 1.25 onwards, the API returns a batchcomplete
				 * element to indicate that all data for the current "batch" of
				 * pages has been returned.
				 * 
				 * @see https://www.mediawiki.org/wiki/API:Query#batchcomplete
				 */
				if (data && ('batchcomplete' in data)) {
					// assert: data.batchcomplete === ''
					library_namespace.debug(
					//
					'[' + title + ']: Done.', 1, 'wiki_API.langlinks');
				} else {
					library_namespace.warn(
					//
					'wiki_API.langlinks: Unknown response: ['
					//
					+ (typeof data === 'object' && typeof JSON !== 'undefined'
					//
					? JSON.stringify(data) : data) + ']');
					// console.log(data);
				}
				// console.warn(data);
				if (library_namespace.is_debug()
				// .show_value() @ interact.DOM, application.debug
				&& library_namespace.show_value)
					library_namespace.show_value(data);
				callback();
				return;
			}

			data = data.query.pages;
			var pages = [];
			for ( var pageid in data)
				pages.push(data[pageid]);
			if (pages.length !== 1 || (options && options.multi)) {
				if (library_namespace.is_debug())
					library_namespace.info(
					//
					'wiki_API.langlinks: Get ' + pages.length
					//
					+ ' page(s)! We will pass all pages to callback!');
				// page 之 structure 按照 wiki API 本身之 return！
				// page = {pageid,ns,title,revisions:[{langlinks,'*'}]}
				callback(pages);
			} else {
				if (library_namespace.is_debug() && !pages[0].langlinks) {
					library_namespace.warn('wiki_API.langlinks: '
					//
					+ ('pageid' in pages[0] ? '無' + (to_lang && isNaN(to_lang)
					//
					? '所欲求語言[' + to_lang + ']之' : '其他語言')
					//
					+ '連結' : '不存在此頁面') + ': [' + pages[0].title + ']');
					// library_namespace.show_value(pages);
				}
				pages = pages[0].langlinks;
				callback(pages ? to_lang && isNaN(to_lang) ? pages[0]['*']
				//
				: wiki_API.langlinks.parse(pages) : pages);
			}
		}, null, options);
	};

	wiki_API.langlinks.parse = function(langlinks, to_lang) {
		if (langlinks && Array.isArray(langlinks.langlinks))
			langlinks = langlinks.langlinks;

		if (!Array.isArray(langlinks)) {
			if (library_namespace.is_debug()) {
				library_namespace.warn(
				//
				'wiki_API.langlinks.parse: No langlinks exists?'
						+ (langlinks && langlinks.title ? ' [['
								+ langlinks.title + ']]' : ''));
				if (library_namespace.is_debug(2)
				// .show_value() @ interact.DOM, application.debug
				&& library_namespace.show_value)
					library_namespace.show_value(langlinks, 'langlinks.parse');
			}
			return;
		}

		var langs;
		if (to_lang) {
			langlinks.some(function(lang) {
				if (to_lang == lang.lang) {
					langs = lang['*'];
					return true;
				}
			});

		} else {
			langs = library_namespace.null_Object();
			langs.langs = [];
			langlinks.forEach(function(lang) {
				langs[lang.lang] = lang['*'];
				langs.langs.push(lang.lang);
			});
		}
		return langs;
	};

	// ------------------------------------------------------------------------

	/**
	 * 自 title 頁面取得後續檢索用索引值 (continuation data)。<br />
	 * e.g., 'continue'
	 * 
	 * @param {String|Array}title
	 *            the page title to search continue information
	 * @param {Function|Object}callback
	 *            回調函數 or options。 callback({Object} continue data);
	 * 
	 * @see https://www.mediawiki.org/wiki/API:Query#Continuing_queries
	 */
	function get_continue(title, callback) {
		var options;
		if (library_namespace.is_Object(callback))
			callback = (options = callback).callback;
		else
			// 前置處理。
			options = library_namespace.null_Object();

		wiki_API.page(title, function(page_data) {
			var matched, done, content = get_page_content(page_data),
			// {RegExp}[options.pattern]:
			// content.match(pattern) === [ , '{type:"continue"}' ]
			pattern = options.pattern,
			// {Object} continue data
			data = library_namespace.null_Object();

			if (!pattern)
				pattern = new RegExp(library_namespace.to_RegExp_pattern(
				//
				(options.continue_key || wiki_API.prototype.continue_key)
						.trim())
						+ ' *:? *({[^{}]{0,80}})', 'g');
			library_namespace.debug('pattern: ' + pattern, 2, 'get_continue');

			while (matched = pattern.exec(content)) {
				library_namespace.debug('continue data: [' + matched[1] + ']',
						2, 'get_continue');
				if (!(done = /^{\s*}$/.test(matched[1])))
					data = Object.assign(data,
					//
					library_namespace.parse_JSON(matched[1]));
			}

			// options.get_all: get all continue data.
			if (!options.get_all)
				if (done) {
					library_namespace.debug('最後一次之後續檢索用索引值為空，可能已完成？', 1,
							'get_continue');
					data = null;
				} else {
					// {String|Boolean}[options.type]: what type to search.
					matched = options.type;
					if (matched in get_list.type)
						matched = get_list.type[matched] + 'continue';

					content = data;
					data = library_namespace.null_Object();
					if (matched in content)
						data[matched] = content[matched];
				}

			// callback({Object} continue data);
			callback(data || library_namespace.null_Object());
		}, options);
	}

	// ------------------------------------------------------------------------

	if (false) {
		// 若是想一次取得所有 list，不應使用單次版:
		wiki.categorymembers('Category_name', function(title, titles, pages) {
			console.log(pages.length);
		}, {
			limit : 'max'
		});

		// 而應使用循環取得資料版:
		CeL.wiki.cache({
			type : 'categorymembers',
			list : 'Category_name',
		}, function(list) {
			CeL.log('Get ' + list.length + ' item(s).');
		}, {
			// default options === this
			// [SESSION_KEY]
			session : wiki,
			// title_prefix : 'Template:',
			// cache path prefix
			prefix : base_directory
		});
	}

	/**
	 * get list. 檢索/提取列表<br />
	 * 注意: 可能會改變 options！
	 * 
	 * @param {String}type
	 *            one of get_list.type
	 * @param {String}title
	 *            page title 頁面標題。
	 * @param {Function}callback
	 *            回調函數。 callback(title, titles, pages)
	 * @param {ℕ⁰:Natural+0|String|Object}namespace
	 *            one of get_namespace.hash
	 */
	function get_list(type, title, callback, namespace) {
		library_namespace.debug(type + (title ? ' [[' + title + ']]' : '')
				+ ', callback: ' + callback, 3, 'get_list');
		var options,
		/** {String} 前置字首。 */
		prefix = get_list.type[type], parameter, title_preprocessor;
		library_namespace.debug('parameters: ' + JSON.stringify(prefix), 3,
				'get_list');
		if (Array.isArray(prefix)) {
			parameter = prefix[1] || get_list.default_parameter;
			title_preprocessor = prefix[2];
			prefix = prefix[0];
		} else {
			parameter = get_list.default_parameter;
		}
		if (library_namespace.is_Object(namespace))
			// 當作 options。
			namespace = (options = namespace).namespace;
		else
			// 前置處理。
			options = library_namespace.null_Object();

		if (isNaN(namespace = get_namespace(namespace)))
			delete options.namespace;
		else
			options.namespace = namespace;

		// 處理 [ {String}API_URL, {String}title or {Object}page_data ]
		if (!Array.isArray(title))
			title = [ , title ];

		var continue_from = prefix + 'continue',
		// {wiki_API}options.continue_session: 藉以取得後續檢索用索引值之 {wiki_API}。
		// 若未設定 .next_mark，才會自 options.get_continue 取得後續檢索用索引值。
		continue_session = options.continue_session;
		if (continue_session)
			if (continue_session.constructor === wiki_API) {
				library_namespace.debug(
						'直接傳入了 {wiki_API}；可延續使用上次的後續檢索用索引值，避免重複 loading page。',
						4, 'get_list');
				// usage:
				// options: { continue_session : wiki_API instance ,
				// get_continue : log_to }
				// 注意: 這裡會改變 options！
				// assert: {Object}continue_session.next_mark
				if (continue_from in continue_session.next_mark) {
					// {String}continue_session.next_mark[continue_from]:
					// 後續檢索用索引值。
					options[continue_from] = continue_session.next_mark[continue_from];
					// 經由,經過,通過來源
					library_namespace.info('get_list: continue from ['
							+ options[continue_from] + '] via {wiki_API}');
					// 刪掉標記，避免無窮迴圈。
					delete options.get_continue;
				} else {
					// 設定好 options.get_continue，以進一步從 page 取得後續檢索用索引值。
					if (typeof options.get_continue === 'string')
						// 採用 continue_session 之 domain。
						options.get_continue = [ continue_session.API_URL,
								options.get_continue ];
				}
			} else {
				library_namespace.debug('傳入的不是 {wiki_API}。 ', 4, 'get_list');
				continue_session = undefined;
			}

		// options.get_continue: 用以取用後續檢索用索引值之 title。
		// {String}title || {Array}[ API_URL, title ]
		if (options.get_continue) {
			// 在多人共同編輯的情況下，才需要每次重新 load page。
			get_continue(Array.isArray(options.get_continue)
			//
			? options.get_continue : [ title[0], options.get_continue ], {
				type : type,
				// [SESSION_KEY]
				session : continue_session || options[SESSION_KEY],
				continue_key : (continue_session || options[SESSION_KEY])
				//
				.continue_key,
				callback : function(continuation_data) {
					if (continuation_data = continuation_data[continue_from]) {
						library_namespace.info('get_list: continue from ['
								+ continuation_data + '] via page');
						// 注意: 這裡會改變 options！
						// 刪掉標記，避免無窮迴圈。
						delete options.get_continue;
						// 設定/紀錄後續檢索用索引值，避免無窮迴圈。
						if (continue_session)
							continue_session.next_mark

							[continue_from] = continuation_data;
						else
							options[continue_from] = continuation_data;
						get_list(type, title, callback, options);
					} else {
						// delete options[continue_from];
						library_namespace.debug('Nothing to continue!', 1,
								'get_list');
						if (typeof callback === 'function')
							callback();
					}
				}
			});
			return;
		}

		if (continue_from = options[continue_from]) {
			library_namespace.debug(type + (title ? ' [[' + title + ']]' : '')
					+ ': start from ' + continue_from, 2, 'get_list');
		}

		title[1] = title[1] ? '&'
		// allpages 不具有 title。
		+ (parameter === get_list.default_parameter ? prefix : '')
		//
		+ wiki_API.query.title_param(title[1]) : '';

		if (typeof title_preprocessor === 'function') {
			// title_preprocessor(title_parameter)
			library_namespace.debug('title_parameter: [' + title[1] + ']', 3,
					'get_list');
			title[1] = title_preprocessor(title[1]);
			library_namespace.debug('→ [' + title[1] + ']', 3, 'get_list');
		}

		title[1] = 'query&' + parameter + '=' + type + title[1]
		// 處理數目限制 limit。
		// No more than 500 (5,000 for bots) allowed.
		+ (options.limit > 0 || options.limit === 'max'
		// @type integer or 'max'
		// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Brevisions
		? '&' + prefix + 'limit=' + options.limit : '')
		// next start from here.
		+ (continue_from ?
		// allpages 的 apcontinue 為 title，需要 encodeURIComponent()。
		'&' + prefix + 'continue='
		// 未處理allpages 的 escape 可能造成 HTTP status 400。
		+ encodeURIComponent(continue_from) : '')
		//
		+ ('namespace' in options
		//
		? '&' + prefix + 'namespace=' + options.namespace : '');
		if (!title[0])
			title = title[1];
		// console.log('get_list: title: ' + title);

		if (typeof callback !== 'function') {
			library_namespace.err('callback is NOT function! callback: ['
					+ callback + ']');
			library_namespace.debug('可能是想要當作 wiki instance，卻未設定好，直接呼叫了 '
			// TODO: use module_name
			+ library_namespace.Class + '.wiki？\ne.g., 想要 var wiki = '
					+ library_namespace.Class
					+ '.wiki(user, password) 卻呼叫了 var wiki = '
					+ library_namespace.Class + '.wiki？', 3);
			return;
		}

		wiki_API.query(title,
		// treat as {Function}callback or {Object}wiki_API.work config.
		function(data) {
			function add_page(page) {
				titles.push(page.title);
				pages.push(page);
			}

			if (library_namespace.is_debug(2)
			// .show_value() @ interact.DOM, application.debug
			&& library_namespace.show_value)
				library_namespace.show_value(data, 'get_list: ' + type);

			var titles = [], pages = [],
			// 取得列表後，設定/紀錄新的後續檢索用索引值。
			// https://www.mediawiki.org/wiki/API:Query#Backwards_compatibility_of_continue
			// {Object}next_index: 後續檢索用索引值。
			next_index = data['continue'] || data['query-continue'];
			if (library_namespace.is_Object(next_index)) {
				pages.next_index = next_index;
				library_namespace.debug(
						'因為 continue_session 可能與作業中之 wiki_API instance 不同，'
						//
						+ '因此需要在本函數 function get_list() 中設定好。', 4, 'get_list');
				// console.log(continue_session);
				if (continue_session
				//
				|| (continue_session = options[SESSION_KEY])) {
					// console.log(continue_session.next_mark);
					// console.log(next_index);
					// console.log(continue_session);
					if ('query-continue' in data)
						// style of 2014 CE. 例如:
						// {backlinks:{blcontinue:'[0|12]'}}
						for ( var type_index in next_index)
							Object.assign(continue_session.next_mark,
									next_index[type_index]);
					else
						// nowadays. e.g.,
						// {continue: { blcontinue: '0|123', continue: '-||' }}
						Object.assign(continue_session.next_mark, next_index);
					library_namespace.debug('next index of ' + type + ': '
							+ continue_session.show_next());
				}
				if (library_namespace.is_debug(2)
				// .show_value() @ interact.DOM, application.debug
				&& library_namespace.show_value)
					library_namespace.show_value(next_index,
							'get_list: get the continue value');
			}
			// 紀錄清單類型。
			// assert: overwrite 之屬性不應該是原先已經存在之屬性。
			pages.list_type = type;
			if (get_page_content.is_page_data(title))
				title = title.title;

			if (!data || !data.query) {
				library_namespace.err('get_list: Unknown response: ['
						+ (typeof data === 'object'
								&& typeof JSON !== 'undefined' ? JSON
								.stringify(data) : data) + ']');

			} else if (data.query[type]) {
				// 一般情況。
				if (Array.isArray(data = data.query[type]))
					data.forEach(add_page);

				library_namespace.debug('[' + title + ']: ' + titles.length
						+ ' page(s)', 2, 'get_list');
				callback(title, titles, pages);

			} else {
				// console.log(data.query);
				data = data.query.pages;
				for ( var pageid in data) {
					if (pages.length)
						library_namespace
								.warn('get_list: More than 1 page got!');
					else {
						var page = data[pageid];
						if (Array.isArray(page[type]))
							page[type].forEach(add_page);

						library_namespace.debug('[' + page.title + ']: '
								+ titles.length + ' page(s)', 1, 'get_list');
						callback(page.title, titles, pages);
					}
					return;
				}
				library_namespace.err('get_list: No page got!');
			}
		}, null, options);
	}

	// const: 基本上與程式碼設計合一，僅表示名義，不可更改。
	get_list.default_parameter = 'list';

	/**
	 * All list types MediaWiki supported.
	 * 
	 * @type {Object}
	 * 
	 * @see https://www.mediawiki.org/wiki/API:Lists/All
	 */
	get_list.type = {

		// 'type name' : 'abbreviation 縮寫 / prefix' (parameter :
		// get_list.default_parameter)

		// 按標題排序列出指定的名字空間的頁面 title。
		// 可用來遍歷所有頁面。
		// includes redirection 包含重定向頁面.
		// @see traversal_pages()
		// https://www.mediawiki.org/wiki/API:Allpages
		// 警告: 不在 Tool Labs 執行 allpages 速度太慢。但若在 Tool Labs，當改用 database。
		allpages : 'ap',

		// https://www.mediawiki.org/wiki/API:Alllinks
		// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Balllinks
		alllinks : 'al',

		/**
		 * 為頁面標題執行前綴搜索。<br />
		 * <code>
		CeL.wiki.prefixsearch('User:Cewbot/log/20151002/', function(title, titles, pages){ console.log(titles); }, {limit:'max'});
		wiki_instance.prefixsearch('User:Cewbot', function(title, titles, pages){ console.log(titles); }, {limit:'max'});
		 * </code>
		 * 
		 * @see https://www.mediawiki.org/w/api.php?action=help&modules=query%2Bprefixsearch
		 */
		prefixsearch : [ 'ps', , function(title_parameter) {
			return title_parameter.replace(/^&pstitle=/, '&pssearch=');
		} ],

		// 取得連結到 [[title]] 的頁面。
		// e.g., [[name]], [[:Template:name]].
		// https://www.mediawiki.org/wiki/API:Backlinks
		backlinks : 'bl',

		// 取得所有嵌入包含 title 的頁面。 (transclusion, inclusion)
		// e.g., {{Template name}}, {{/title}}.
		// 設定 title 'Template:tl' 可取得使用指定 Template 的頁面。
		// https://en.wikipedia.org/wiki/Wikipedia:Transclusion
		// https://www.mediawiki.org/wiki/API:Embeddedin
		embeddedin : 'ei',

		// 取得所有使用 file 的頁面。
		// e.g., [[File:title.jpg]].
		// https://www.mediawiki.org/wiki/API:Imageusage
		imageusage : 'iu',

		// 列出在指定分類中的所有頁面。
		// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Bcategorymembers
		categorymembers : [ 'cm', , function(title_parameter) {
			// 要列舉的分類（必需）。必須包括Category:前綴。不能與cmpageid一起使用。
			if (/^&cmtitle=[Cc]ategory%3A/.test(title_parameter))
				return title_parameter;
			return title_parameter.replace(/^&cmtitle=/, '&cmtitle=Category:');
		} ],

		// 'type name' : [ 'abbreviation 縮寫 / prefix', 'parameter' ]
		// ** 可一次處理多個標題，但可能較耗資源、較慢。

		// linkshere: 取得連結到 [[title]] 的頁面。
		// [[Special:Whatlinkshere]]
		// 使用說明:連入頁面
		// https://zh.wikipedia.org/wiki/Help:%E9%93%BE%E5%85%A5%E9%A1%B5%E9%9D%A2
		linkshere : [ 'lh', 'prop' ],

		// 取得所有使用 title (e.g., [[File:title.jpg]]) 的頁面。
		// 基本上同 imageusage。
		fileusage : [ 'fu', 'prop' ],

		// 回傳指定頁面的所有連結。
		// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Blinks
		links : [ 'pl', 'prop', function(title_parameter) {
			return title_parameter.replace(/^&title=/, '&titles=');
		} ]
	};

	(function() {
		// 登記 methods。
		var methods = wiki_API.prototype.next.methods;

		for ( var name in get_list.type) {
			methods.push(name);
			wiki_API[name] = get_list.bind(null, name);
		}

		// add method to wiki_API.prototype
		// setup other wiki_API.prototype methods.
		methods.forEach(function(method) {
			library_namespace.debug('add action to wiki_API.prototype: '
					+ method, 2);
			wiki_API.prototype[method] = function() {
				// assert: 不可改動 method @ IE！
				var args = [ method ];
				Array.prototype.push.apply(args, arguments);
				try {
					library_namespace.debug('add action: '
							+ args.join('<br />\n'), 3, 'wiki_API.prototype.'
							+ method);
				} catch (e) {
					// TODO: handle exception
				}
				this.actions.push(args);
				if (!this.running)
					this.next();
				return this;
			};
		});
	})();

	// ------------------------------------------------------------------------

	/**
	 * 取得完整 list 後才作業。<br />
	 * 注意: 可能會改變 options！
	 * 
	 * @param {String}target
	 *            page title 頁面標題。
	 * @param {Function}callback
	 *            回調函數。 callback(pages, target, options)
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 */
	wiki_API.list = function(target, callback, options) {
		// 前置處理。
		if (!library_namespace.is_Object(options))
			options = library_namespace.null_Object();

		if (!options.initialized) {
			if (!options[SESSION_KEY])
				options[SESSION_KEY] = new wiki_API;
			if (!options.type)
				options.type = wiki_API.list.default_type;
			options.initialized = true;
		}

		options[SESSION_KEY][options.type](target, function(title, titles,
				pages) {
			library_namespace.debug('Get ' + pages.length + ' ' + options.type
					+ ' pages of [[' + title + ']]', 2, 'wiki_API.list');
			if (typeof options.callback === 'function') {
				// options.callback() 為取得每一階段清單時所會被執行的函數
				options.callback(title, titles, pages);
			}
			if (options.pages)
				Array.prototype.push.apply(options.pages, pages);
			else
				options.pages = pages;
			if (pages.next_index) {
				library_namespace.debug('尚未取得所有清單，因此繼續取得下一階段清單。', 2,
						'wiki_API.list');
				setImmediate(function() {
					wiki_API.list(target, callback, options);
				});
			} else {
				library_namespace.debug('run callback after all list got.', 2,
						'wiki_API.list');
				callback(options.pages, target, options);
			}
		}, {
			continue_session : options[SESSION_KEY],
			limit : options.limit || 'max'
		});
	};

	wiki_API.list.default_type = 'embeddedin';

	// ------------------------------------------------------------------------

	// 登入認證用。
	// https://www.mediawiki.org/wiki/API:Login
	// https://www.mediawiki.org/wiki/API:Edit
	// 認證用 cookie:
	// {zhwikiSession,centralauth_User,centralauth_Token,centralauth_Session,wikidatawikiSession,wikidatawikiUserID,wikidatawikiUserName}
	wiki_API.login = function(name, password, options) {
		function _next() {
			if (typeof callback === 'function')
				callback(session.token.lgname);
			library_namespace.debug('已登入 [' + session.token.lgname
					+ ']。自動執行 .next()，處理餘下的工作。', 1, 'wiki_API.login');
			// popup 'login'.
			session.actions.shift();
			session.next();
		}

		function _done(data) {
			// 在 mass edit 時會 lose token (badtoken)，需要保存 password。
			if (!session.preserve_password)
				// 捨棄 password。
				delete session.token.lgpassword;
			if (data && (data = data.login)) {
				if (data.result === 'NeedToken') {
					library_namespace.err('wiki_API.login: login ['
							+ session.token.lgname + '] failed!');
				} else {
					wiki_API.login.copy_keys.forEach(function(key) {
						if (data[key])
							session.token[key] = data[key];
					});
				}
			}
			if (session.token.csrftoken)
				_next();
			else {
				library_namespace.debug('Try to get the csrftoken ...', 1,
						'wiki_API.login');
				wiki_API.query([ session.API_URL,
				// https://www.mediawiki.org/wiki/API:Tokens
				// 'query&meta=tokens&type=csrf|login|watch'
				'query&meta=tokens' ],
				//
				function(data) {
					if (data && data.query && data.query.tokens) {
						Object.assign(session.token, data.query.tokens);
						library_namespace.debug('csrftoken: '
						//
						+ session.token.csrftoken
						//
						+ (session.token.csrftoken === '+\\'
						//
						? ' (login as anonymous!)' : ''), 1, 'wiki_API.login');
					} else {
						library_namespace.err(
						//
						'wiki_API.login: Unknown response: ['
						//
						+ (data && data.warnings && data.warnings.tokens
						//
						&& data.warnings.tokens['*'] || data) + ']');
						if (library_namespace.is_debug()
						// .show_value() @ interact.DOM, application.debug
						&& library_namespace.show_value)
							library_namespace.show_value(data);
					}
					_next();
				},
				// Tokens may not be obtained when using a callback
				library_namespace.null_Object(), session);
			}
		}

		// 支援斷言編輯功能。
		var action = 'assert=user', callback, session, API_URL;
		if (library_namespace.is_Object(options)) {
			API_URL = options.API_URL;
			session = options[SESSION_KEY];
			callback = options.callback;
		} else {
			if (typeof options === 'function')
				callback = options;
			// treat as API_URL
			else if (typeof options === 'string')
				API_URL = options;
			// 前置處理。
			options = library_namespace.null_Object();
		}

		if (!session) {
			// 初始化 session 與 agent。這裡 callback 當作 API_URL。
			session = new wiki_API(name, password, API_URL);
		}

		// copy configurations
		if (options.preserve_password)
			session.preserve_password = options.preserve_password;

		if (!('login_mark' in options) || options.login_mark) {
			// hack: 這表示正 log in 中，當 login 後，會自動執行 .next()，處理餘下的工作。
			// @see wiki_API.prototype.next
			if (options.login_mark)
				// 將 'login' 置於工作佇列最前頭。
				session.actions.unshift([ 'login' ]);
			else
				// default: 依順序將 'login' 置於最末端。
				session.actions.push([ 'login' ]);
		}
		if (session.API_URL) {
			library_namespace.debug('API URL: [' + session.API_URL + ']。', 3,
					'wiki_API.login');
			action = [ session.API_URL, action ];
		}
		library_namespace.debug('action: [' + action + ']。', 3,
				'wiki_API.login');

		library_namespace.debug('準備登入 [' + name + ']。', 1, 'wiki_API.login');
		wiki_API.query(action, function(data) {
			// 確認尚未登入，才作登入動作。
			if (data === '' && !options.force) {
				// 您已登入。
				library_namespace.debug('You are already logged in.', 1,
						'wiki_API.login');
				_done();
				return;
			}

			// https://www.mediawiki.org/w/api.php?action=help&modules=login
			var token = Object.assign(library_namespace.null_Object(),
					session.token);
			// .csrftoken 是本函式為 cache 加上的，非正規 parameter。
			delete token.csrftoken;
			wiki_API.query([ session.API_URL,
			// 'query&meta=tokens&type=login'
			'login' ], function(data) {
				if (data && data.login && data.login.result === 'NeedToken') {
					token.lgtoken = session.token.lgtoken = data.login.token;
					wiki_API.query([ session.API_URL, 'login' ], _done, token,
							session);
				} else {
					library_namespace
							.err('wiki_API.login: 無法 login！ Abort! Response:');
					library_namespace.err(data);
				}
			}, token, session);
		}, null, session);

		return session;
	};

	/** {Array}欲 copy 至 session.token 之 keys。 */
	wiki_API.login.copy_keys = 'lguserid,lgtoken,cookieprefix,sessionid'
			.split(',');

	// ------------------------------------------------------------------------

	/**
	 * check if need to stop / 檢查是否需要緊急停止作業 (Emergency shutoff-compliant).
	 * 
	 * 此功能之工作機制/原理：<br />
	 * 在 .edit() 編輯（機器人執行作業）之前，先檢查是否有人在緊急停止頁面留言要求 stop。<br />
	 * 只要在緊急停止頁面有指定的章節標題、或任何章節，就當作有人留言要 stop，並放棄編輯。
	 * 
	 * TODO:<br />
	 * https://www.mediawiki.org/w/api.php?action=query&meta=userinfo&uiprop=hasmsg
	 * 
	 * @param {Function}callback
	 *            回調函數。 callback({Boolean}need stop)
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @see https://www.mediawiki.org/wiki/Manual:Parameters_to_index.php#Edit_and_submit
	 *      https://www.mediawiki.org/wiki/Help:Magic_words#URL_encoded_page_names
	 *      https://www.mediawiki.org/wiki/Help:Links
	 *      https://zh.wikipedia.org/wiki/User:Cewbot/Stop
	 */
	wiki_API.check_stop = function(callback, options) {
		// 前置處理。
		if (!library_namespace.is_Object(options))
			if (typeof options === 'string')
				options = {
					title : options
				};
			else
				options = library_namespace.null_Object();

		/**
		 * 緊急停止作業將檢測之頁面標題。 check title:<br />
		 * 只檢查此緊急停止頁面。
		 * 
		 * @type {String}
		 */
		var title = options.title;
		if (typeof title === 'function')
			title = title(options.token);
		if (!title)
			title = wiki_API.check_stop.title(options.token);

		library_namespace.debug('檢查緊急停止頁面 [[' + title + ']]', 1,
				'wiki_API.check_stop');

		wiki_API.page([ this.API_URL, title ], function(page_data) {
			var content = get_page_content(page_data),
			// default: NOT stopped
			stopped = false, PATTERN;

			if (typeof options.checker === 'function') {
				// 以 options.checker 的回傳來設定是否stopped。
				stopped = options.checker(content);
				if (stopped)
					library_namespace.warn(
					//
					'wiki_API.check_stop: 已設定停止編輯作業！');
				content = null;

			} else {
				// 指定 pattern
				PATTERN = options.pattern
				// options.section: 指定的緊急停止章節標題, section title to check.
				/** {String}緊急停止作業將檢測之章節標題。 */
				|| options.section
				/**
				 * <code>
				 * (new RegExp('\n==(.*?)' + '20150503' + '\\s*==\n')).test('\n== 停止作業:20150503 ==\n') === true
				 * </code>
				 */
				&& new RegExp('\n==(.*?)' + options.section + '\\s*==\n');
			}

			if (content) {
				if (!library_namespace.is_RegExp(PATTERN))
					PATTERN = wiki_API.check_stop.pattern;
				library_namespace.debug(
				//
				'wiki_API.check_stop: 採用 pattern: ' + PATTERN);
				stopped = PATTERN.test(content, page_data);
				if (stopped)
					library_namespace
							.warn('緊急停止頁面[[' + title + ']]有留言要停止編輯作業！');
			}

			callback(stopped);
		}, options);
	};

	/**
	 * default page title to check:<br />
	 * [[{{TALKSPACE}}:{{ROOTPAGENAME}}/Stop]]
	 * 
	 * @param {Object}token
	 *            login 資訊，包含“csrf”令牌/密鑰。
	 * 
	 * @returns {String}
	 */
	wiki_API.check_stop.title = function(token) {
		return 'User_talk:' + token.lgname + '/Stop';
	};

	/**
	 * default check pattern: 任何章節/段落 section<br />
	 * default: 只要在緊急停止頁面有任何章節，就當作有人留言要求 stop。
	 * 
	 * @type {RegExp}
	 */
	wiki_API.check_stop.pattern = /\n=([^\n]+)=\n/;

	// ------------------------------------------------------------------------

	/**
	 * 編輯頁面。一次處理一個標題。<br />
	 * 警告:除非 text 輸入 {Function}，否則此函數不會檢查頁面是否允許機器人帳戶訪問！此時需要另外含入檢查機制！
	 * 
	 * @param {String|Array}title
	 *            page title 頁面標題。 {String}title or [ {String}API_URL,
	 *            {String}title or {Object}page_data ]
	 * @param {String|Function}text
	 *            page contents 頁面內容。 {String}text or {Function}text(page_data)
	 * @param {Object}token
	 *            login 資訊，包含“csrf”令牌/密鑰。
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * @param {Function}callback
	 *            回調函數。 callback(title, error, result)
	 * @param {String}timestamp
	 *            頁面時間戳記。 e.g., '2015-01-02T02:52:29Z'
	 */
	wiki_API.edit = function(title, text, token, options, callback, timestamp) {
		var is_undo = options && options.undo;
		if (is_undo) {
			// 一般 undo_count 超過1也不一定能成功？因此設定輸入 {undo:1} 時改 {undo:true} 亦可。
			if (is_undo === true) {
				options.undo = is_undo = 1;
			} else if (!(is_undo >= 1)) {
				delete options.undo;
			}
		}

		var undo_count = options
				&& (options.undo_count || is_undo
						&& (is_undo < wiki_API.edit.undo_count_limit && is_undo));

		if (undo_count || typeof text === 'function') {
			library_namespace.debug('先取得內容再 edit [' + get_page_title(title)
					+ ']。', 1, 'wiki_API.edit');
			// console.log(title);
			if (undo_count) {
				var _options = Object.clone(options);
				if (!_options.rvlimit) {
					_options.rvlimit = undo_count;
				}
				if (!_options.rvprop) {
					_options.rvprop =
					// user: 提供 user name 給 text() 用。
					typeof text === 'function' ? 'ids|timestamp|user'
					// 無須 content，盡量減少索求的資料量。
					: 'ids|timestamp';
				}
			}

			wiki_API.page(
			//
			Array.isArray(title) ? title.clone() : title, function(page_data) {
				if (options && (!options.ignore_denial && wiki_API.edit
				//
				.denied(page_data, options.bot_id, options.notification))) {
					library_namespace.warn(
					// Permission denied
					'wiki_API.edit: Denied to edit ['
							+ get_page_title(page_data) + ']');
					callback(get_page_title(page_data), 'denied');

				} else {
					if (undo_count) {
						delete options.undo_count;
						// page_data =
						// {pageid:0,ns:0,title:'',revisions:[{revid:0,parentid:0,user:'',timestamp:''},...]}
						timestamp = page_data.revisions[0].timestamp;
						// 指定 rev_id。
						options.undo = page_data.revisions[0].revid;
						options.undoafter = page_data.revisions
						// get the oldest revision
						[page_data.revisions.length - 1].parentid;
					}
					// 需要同時改變 wiki_API.prototype.next！
					wiki_API.edit(title,
					// 這裡不直接指定 text，是為了讓使(回傳要編輯資料的)設定值函數能即時依page_data變更 options。
					// undo_count ? '' :
					typeof text === 'function' &&
					// or: text(get_page_content(page_data),
					// page_data.title, page_data)
					// .call(options,): 使(回傳要編輯資料的)設定值函數能即時變更 options。
					text.call(options, page_data), token, options, callback,
							timestamp);
				}
			}, _options);
			return;
		}

		var action = !is_undo
				&& wiki_API.edit.check_data(text, title, 'wiki_API.edit');
		if (action) {
			callback(get_page_title(title), action);
			return;
		}

		action = 'edit';
		// 處理 [ {String}API_URL, {String}title or {Object}page_data ]
		if (Array.isArray(title))
			action = [ title[0], action ], title = title[1];
		if (options && options.write_to) {
			// 設定寫入目標。一般為 debug、test 測試期間用。
			// e.g., write_to:'Wikipedia:沙盒',
			title = options.write_to;
			library_namespace.debug('依 options.write_to 寫入至 [[' + title + ']]',
					1, 'wiki_API.edit');
		}

		// 造出可 modify 的 options。
		if (options)
			library_namespace.debug('#1: ' + Object.keys(options).join(','), 4,
					'wiki_API.edit');
		if (is_undo) {
			options = library_namespace.setup_options(options);
		} else {
			options = Object.assign({
				text : text
			}, options);
		}
		if (library_namespace.is_Object(title)) {
			wiki_API.edit.set_stamp(options, title);
			if (title.pageid)
				options.pageid = title.pageid;
			else
				options.title = title.title;
		} else {
			options.title = title;
		}
		if (timestamp)
			wiki_API.edit.set_stamp(options, timestamp);
		// the token should be sent as the last parameter.
		options.token = library_namespace.is_Object(token) ? token.csrftoken
				: token;
		library_namespace.debug('#2: ' + Object.keys(options).join(','), 4,
				'wiki_API.edit');

		var session;
		if ('session' in options) {
			session = options[SESSION_KEY];
			delete options[SESSION_KEY];
		}

		wiki_API.query(action, function(data) {
			var error = data.error
			// 檢查伺服器回應是否有錯誤資訊。
			? '[' + data.error.code + '] ' + data.error.info : data.edit
					&& data.edit.result !== 'Success'
					&& ('[' + data.edit.result + '] '
					// 新用戶要輸入過多或特定內容如URL，可能遇到:<br />
					// [Failure] 必需輸入驗證碼
					+ (data.edit.info || data.edit.captcha && '必需輸入驗證碼'));
			if (error) {
				/**
				 * <code>
				   wiki_API.edit: Error to edit [User talk:Flow]: [no-direct-editing] Direct editing via API is not supported for content model flow-board used by User_talk:Flow
				 * </code>
				 * 
				 * @see https://doc.wikimedia.org/mediawiki-core/master/php/ApiEditPage_8php_source.html
				 */
				if (data.error && data.error.code === 'no-direct-editing'
				// .section: 章節編號。 0 代表最上層章節，new 代表新章節。
				&& options.section === 'new') {
					// 無法以正常方式編輯，嘗試當作 Flow 討論頁面。
					edit_topic(title, options.sectiontitle,
					// [[mw:Flow]] 會自動簽名，因此去掉簽名部分。
					text.replace(/[\s\n\-]*~~~~[\s\n\-]*$/, ''), options.token,
							options, callback);
					return;
				}
				/**
				 * <s>遇到過長的頁面 (e.g., 過多 transclusion。)，可能產生錯誤：<br />
				 * [editconflict] Edit conflict detected</s>
				 * 
				 * when edit:<br />
				 * [contenttoobig] The content you supplied exceeds the article
				 * size limit of 2048 kilobytes
				 * 
				 * 頁面大小系統上限 2,048 KB = 2 MB。
				 * 
				 * 須注意是否有其他競相編輯的 bots。
				 */
				library_namespace.warn('wiki_API.edit: Error to edit [['
						+ get_page_title(title) + ']]: ' + error);
			} else if (data.edit && ('nochange' in data.edit))
				// 在極少的情況下，data.edit === undefined。
				library_namespace.info('wiki_API.edit: ['
						+ get_page_title(title) + ']: no change');
			if (typeof callback === 'function')
				// title.title === get_page_title(title)
				callback(title.title, error, data);
		}, options, session);
	};

	/**
	 * 放棄編輯頁面用。<br />
	 * assert: true === !!wiki_API.edit.cancel
	 * 
	 * @type any
	 */
	wiki_API.edit.cancel = {
		cancel : '放棄編輯頁面用'
	};

	/** {Natural}小於此數則代表當作 undo 幾個版本。 */
	wiki_API.edit.undo_count_limit = 100;

	/**
	 * 對要編輯的資料作基本檢測。
	 * 
	 * @param data
	 *            要編輯的資料。
	 * @param title
	 *            title or id.
	 * @param {String}caller
	 *            caller to show.
	 */
	wiki_API.edit.check_data = function(data, title, caller) {
		var action;
		// 可以利用 ((return [ CeL.wiki.edit.cancel, 'reason' ];)) 來回傳 reason。
		// ((return [ CeL.wiki.edit.cancel, 'skip' ];)) 來跳過 skip。
		if (data === wiki_API.edit.cancel)
			// 統一規範放棄編輯頁面訊息。
			data = [ wiki_API.edit.cancel ];

		if (!data) {
			action = [ 'empty', typeof data === 'string' ? '內容被清空' : '未設定編輯內容' ];

		} else if (Array.isArray(data) && data[0] === wiki_API.edit.cancel) {
			action = data.slice(1);
			if (action.length === 1)
				// error messages
				action[1] = action[0] || '放棄編輯頁面';
			if (!action[0])
				// error code
				action[0] = 'cancel';

			library_namespace.debug('採用個別特殊訊息: ' + action, 2, caller
					|| 'wiki_API.edit.check_data');
		}

		if (action) {
			title = get_page_title(title);
			if (action[1] !== 'skip') {
				// 被 skip/pass 的話，連警告都不顯現，當作正常狀況。
				library_namespace.warn((caller || 'wiki_API.edit.check_data')
				// 未提供原因
				+ ': [[' + title + ']]: ' + (action[1] || '未描述原因'));
			} else {
				library_namespace.debug('Skip [[' + title + ']]', 2, caller
						|| 'wiki_API.edit.check_data');
			}
			return action[0];
		}
	};

	/**
	 * 處理編輯衝突用。 to detect edit conflicts.
	 * 
	 * 注意: 會改變 options! Warning: will modify options！
	 * 
	 * 此功能之工作機制/原理：<br />
	 * 在 .page() 會取得每個頁面之 page_data.revisions[0].timestamp（各頁面不同）。於 .edit()
	 * 時將會以從 page_data 取得之 timestamp 作為時間戳記傳入呼叫，當 MediaWiki 系統 (API)
	 * 發現有新的時間戳記，會回傳編輯衝突，並放棄編輯此頁面。<br />
	 * 詳見 [https://github.com/kanasimi/CeJS/blob/master/application/net/wiki.js
	 * wiki_API.edit.set_stamp]。
	 * 
	 * @param {Object}options
	 *            附加參數/設定選擇性/特殊功能與選項
	 * @param {String}timestamp
	 *            頁面時間戳記。 e.g., '2015-01-02T02:52:29Z'
	 * 
	 * @returns {Object}options
	 * 
	 * @see https://www.mediawiki.org/wiki/API:Edit
	 */
	wiki_API.edit.set_stamp = function(options, timestamp) {
		if (get_page_content.is_page_data(timestamp)
		// 在 .page() 會取得 page_data.revisions[0].timestamp
		&& (timestamp = get_page_content.has_content(timestamp)))
			// 自 page_data 取得 timestamp.
			timestamp = timestamp.timestamp;
		// timestamp = '2000-01-01T00:00:00Z';
		if (timestamp) {
			library_namespace.debug(timestamp, 3, 'wiki_API.edit.set_stamp');
			options.basetimestamp = options.starttimestamp = timestamp;
		}
		return options;
	};

	/**
	 * Get the contents of [[Template:Bots]].
	 * 
	 * @param {String}content
	 *            page contents 頁面內容。
	 * 
	 * @returns {Array}contents of [[Template:Bots]].
	 * 
	 * @see https://zh.wikipedia.org/wiki/Template:Bots
	 */
	wiki_API.edit.get_bot = function(content) {
		// TODO: use parse_template(content, 'bots')
		var bots = [], matched, PATTERN = /{{[\s\n]*bots[\s\n]*([\S][\s\S]*?)}}/ig;
		while (matched = PATTERN.exec(content)) {
			library_namespace.debug(matched.join('<br />'), 1,
					'wiki_API.edit.get_bot');
			if (matched = matched[1].trim().replace(/(^\|\s*|\s*\|$)/g, '')
			// .split('|')
			)
				bots.push(matched);
		}
		if (0 < bots.length) {
			library_namespace.debug(bots.join('<br />'), 1,
					'wiki_API.edit.get_bot');
			return bots;
		}
	};

	/**
	 * 測試頁面是否允許機器人帳戶訪問，遵守[[Template:Bots]]。機器人另須考慮{{Personal announcement}}的情況。
	 * 
	 * @param {String}content
	 *            page contents 頁面內容。
	 * @param {String}bot_id
	 *            機器人帳戶名稱。
	 * @param {String}notification
	 *            message notifications of action. 按通知種類而過濾(optout)。
	 * 
	 * @returns {Boolean|String}封鎖機器人帳戶訪問。
	 */
	wiki_API.edit.denied = function(content, bot_id, notification) {
		if (!content)
			return;
		var page_data;
		if (get_page_content.is_page_data(content)) {
			if (!(content = get_page_content(content)))
				return;
			page_data = content;
		}

		library_namespace.debug('contents to test: [' + content + ']', 3,
				'wiki_API.edit.denied');

		var bots = wiki_API.edit.get_bot(content),
		/** {String}denied messages */
		denied, allow_bot;

		if (bots) {
			library_namespace.debug('test ' + bot_id + '/' + notification, 3,
					'wiki_API.edit.denied');
			// botlist 以半形逗號作間隔。
			bot_id = (bot_id = bot_id && bot_id.toLowerCase()) ? new RegExp(
					'(?:^|[\\s,])(?:all|' + bot_id + ')(?:$|[\\s,])', 'i')
					: wiki_API.edit.denied.all;

			if (notification) {
				if (typeof notification === 'string'
				// optout 以半形逗號作間隔。
				&& notification.includes(','))
					notification = notification.split(',');
				if (Array.isArray(notification))
					notification = notification.join('|');
				if (typeof notification === 'string')
					// 預設必須包含 optout=all
					notification = new RegExp('(?:^|[\\s,])(?:all|'
							+ notification.toLowerCase() + ')(?:$|[\\s,])');
				else if (!library_namespace.is_RegExp(notification)) {
					library_namespace.warn(
					//
					'wiki_API.edit.denied: Invalid notification: ['
							+ notification + ']');
					notification = null;
				}
				// 自訂 {RegExp}notification 可能頗危險。
			}

			bots.some(function(data) {
				library_namespace.debug('test [' + data + ']', 1,
						'wiki_API.edit.denied');
				data = data.toLowerCase();

				var matched,
				/** {RegExp}封鎖機器人訪問之 pattern。 */
				PATTERN;

				// 過濾機器人所發出的通知/提醒
				// 頁面/用戶以bots模板封鎖通知
				if (notification) {
					PATTERN = /(?:^|\|)[\s\n]*optout[\s\n]*=[\s\n]*([^|]+)/ig;
					while (matched = PATTERN.exec(data)) {
						if (notification.test(matched[1])) {
							// 一被拒絕即跳出。
							return denied = 'Opt out of ' + matched[1];
						}
					}
				}

				// 檢查被拒絕之機器人帳戶名稱列表（以半形逗號作間隔）
				PATTERN = /(?:^|\|)[\s\n]*deny[\s\n]*=[\s\n]*([^|]+)/ig;
				while (matched = PATTERN.exec(data)) {
					if (bot_id.test(matched[1])) {
						// 一被拒絕即跳出。
						return denied = 'Banned: ' + matched[1];
					}
				}

				// 檢查被允許之機器人帳戶名稱列表（以半形逗號作間隔）
				PATTERN = /(?:^|\|)[\s\n]*allow[\s\n]*=[\s\n]*([^|]+)/ig;
				while (matched = PATTERN.exec(data)) {
					if (!bot_id.test(matched[1])) {
						// 一被拒絕即跳出。
						return denied = 'Not in allowed bots list: ['
								+ matched[1] + ']';
					}

					if (page_data)
						allow_bot = matched[1];
				}

			});
		}

		// {{Nobots}}判定
		if (!denied && /{{[\s\n]*nobots[\s\n]*}}/i.test(content))
			denied = 'Ban all compliant bots.';

		if (denied) {
			library_namespace.warn('wiki_API.edit.denied: ' + denied);
			return denied;
		}

		if (allow_bot) {
			// 特別標記本 bot 為被允許之 bot。
			page_data.allow_bot = allow_bot;
		}
	};

	/**
	 * pattern that will be denied.<br />
	 * i.e. "deny=all", !("allow=all")
	 * 
	 * @type {RegExp}
	 */
	wiki_API.edit.denied.all = /(?:^|[\s,])all(?:$|[\s,])/;

	// ------------------------------------------------------------------------

	/**
	 * full text search<br />
	 * search wikitext: using prefix "insource:". e.g.,
	 * https://www.mediawiki.org/w/api.php?action=query&list=search&srwhat=text&srsearch=insource:abc+def
	 * 
	 * @param {String}key
	 *            search key
	 * @param {Function}[callback]
	 *            回調函數。 callback(key, pages, hits)
	 * @param {Object}options
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @see https://www.mediawiki.org/wiki/API:Search_and_discovery
	 * @see https://www.mediawiki.org/wiki/Help:CirrusSearch
	 */
	wiki_API.search = function(key, callback, options) {
		if (options > 0 || options === 'max')
			options = {
				srlimit : options
			};
		var API_URL;
		if (Array.isArray(key))
			API_URL = key[0], key = key[1];
		wiki_API.query([ API_URL,
				'query&list=search&' + get_URL.param_to_String(Object.assign({
					srsearch : key
				}, wiki_API.search.default_parameters, options)) ], function(
				data) {
			if (library_namespace.is_debug(2)
			// .show_value() @ interact.DOM, application.debug
			&& library_namespace.show_value)
				library_namespace.show_value(data, 'wiki_API.search');

			options = data && (data['continue'] || data['query-continue']);
			if (data && (data = data.query)) {
				if (options)
					// data.search.sroffset = options.search.sroffset;
					Object.assign(data.search, options.search);
				data.search.hits = data.searchinfo.totalhits;
				data = data.search;
			}

			// data: [ page_data ].hits = \d+, .sroffset = next
			if (typeof callback === 'function')
				// callback(key, pages, hits)
				callback(key, data, data.hits);
		}, null, options);
	};

	wiki_API.search.default_parameters = {
		srprop : 'redirecttitle',
		// srlimit : 10,
		srinterwiki : 1
	};

	// ------------------------------------------------------------------------

	// TODO:
	// https://zh.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop&titles=Money|貨幣|數據|說明&redirects&format=json&utf8
	// https://zh.wikipedia.org/w/api.php?action=query&prop=redirects&rdprop&titles=Money|貨幣|數據|說明&redirects&format=json&utf8
	// https://zh.wikipedia.org/w/api.php?action=query&prop=redirects&rdprop=title&titles=Money|貨幣|數據|說明&redirects&format=json&utf8

	/**
	 * 取得所有 redirect 到 [[title]] 之 pages。<br />
	 * 可以 [[Special:链入页面]] 確認。
	 * 
	 * @param {String}title
	 *            頁面名。
	 * @param {Function}callback
	 *            callback(root_page_data, redirect_list) { redirect_list = [
	 *            page_data, page_data, ... ]; }
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項. 此 options 可能會被變更！<br />
	 *            {Boolean}options.no_trace: 若頁面還重定向到其他頁面則不溯源。溯源時 title 將以 root
	 *            替代。<br />
	 *            {Boolean}options.include_root 回傳 list 包含 title，而不只是所有 redirect
	 *            到 [[title]] 之 pages。
	 */
	wiki_API.redirects = function(title, callback, options) {
		// 前置處理。
		if (!library_namespace.is_Object(options))
			options = library_namespace.null_Object();

		if (!options.no_trace) {
			// 溯源(追尋重定向終點)
			wiki_API.page(title, function(page_data) {
				var content = get_page_content(page_data),
				//
				redirect_to = parse_redirect(content);
				// clone Object, 避免更改 options.
				options = Object.clone(options);
				options.no_trace = true;
				if (redirect_to) {
					wiki_API.redirects(redirect_to, callback, options);
				} else {
					wiki_API.redirects(title, callback, options);
				}
			}, options);
			return;
		}

		// 處理 [ {String}API_URL, {String}title or {Object}page_data ]
		if (!Array.isArray(title))
			title = [ , title ];
		title[1] = 'query&prop=redirects&rdlimit=max&'
		//
		+ wiki_API.query.title_param(title[1], true, options && options.is_id);
		if (!title[0])
			title = title[1];

		wiki_API.query(title, typeof callback === 'function'
		//
		&& function(data) {
			// copy from wiki_API.page()

			var error = data && data.error;
			// 檢查伺服器回應是否有錯誤資訊。
			if (error) {
				library_namespace.err(
				//
				'wiki_API.redirects: [' + error.code + '] ' + error.info);
				/**
				 * e.g., Too many values supplied for parameter 'pageids': the
				 * limit is 50
				 */
				if (data.warnings && data.warnings.query
				//
				&& data.warnings.query['*'])
					library_namespace.warn(data.warnings.query['*']);
				callback();
				return;
			}

			if (!data || !data.query || !data.query.pages) {
				library_namespace.warn(
				//
				'wiki_API.redirects: Unknown response: ['
				//
				+ (typeof data === 'object' && typeof JSON !== 'undefined'
				//
				? JSON.stringify(data) : data) + ']');
				if (library_namespace.is_debug()
				// .show_value() @ interact.DOM, application.debug
				&& library_namespace.show_value)
					library_namespace.show_value(data);
				callback();
				return;
			}

			data = data.query.pages;
			var pages = [];
			for ( var pageid in data) {
				var page = data[pageid];
				pages.push(page);
				// 僅處理第一頁。
				if ('missing' in page)
					// 頁面不存在。Page does not exist. Deleted?
					library_namespace.warn(
					//
					'wiki_API.redirects: Not exists: '
					//
					+ (page.title ? '[[' + page.title + ']]'
					//
					: ' id ' + page.pageid));
				break;
			}

			pages = pages[0];

			// page 之 structure 將按照 wiki API 本身之 return！
			// page = {pageid,ns,title,redirects:[{},{}]}
			var redirects = pages.redirects || [];
			library_namespace.debug(
			//
			get_page_title(pages) + ': 有 ' + redirects.length
			//
			+ ' 個同名頁面(重定向至此頁面)。', 2, 'wiki_API.redirects');
			if (options.include_root) {
				redirects = redirects.slice();
				redirects.unshift(pages);
			}
			// callback(root_page_data 本名, redirect_list 別名 alias list)
			callback(pages, redirects);
		}, null, options);
	};

	/**
	 * 計算實質嵌入包含(transclusion)之頁面數。
	 * 
	 * 若條目(頁面)嵌入包含有模板(頁面)別名，則將同時登記 embeddedin 於別名 alias 與 root。<br />
	 * e.g., 當同時包含 {{Refimprove}}, {{RefImprove}} 時會算作兩個，但實質僅一個。<br />
	 * 惟計數時，此時應僅計算一次。本函數可以去除重複名稱，避免模板尚有名稱重複者。
	 * 
	 * @param {Object}root_name_hash
	 *            模板本名 hash. 模板本名[{String}模板別名/本名] = {String}root 模板本名
	 * @param {Array}embeddedin_list
	 *            頁面嵌入包含之模板 list。
	 * 
	 * @returns {ℕ⁰:Natural+0}normalized count
	 */
	wiki_API.redirects.count = function(root_name_hash, embeddedin_list) {
		if (!Array.isArray(embeddedin_list)) {
			library_namespace
					.warn('wiki_API.redirects.count: Invalid embeddedin list.');
			return 0;
		}
		var name_hash = library_namespace.null_Object();
		embeddedin_list.forEach(function(title) {
			title = get_page_title(title);
			library_namespace.debug('含有模板{{' + root_name_hash[title] + '}}←{{'
					+ title + '}}', 3, 'wiki_API.redirects.count');
			name_hash[root_name_hash[title] || title] = null;
		});
		return Object.keys(name_hash).length;
	};

	// ------------------------------------------------------------------------

	/** {String}default language / wiki name */
	var default_language;

	/**
	 * Set default language. 改變預設之語言。
	 * 
	 * @example <code>
	   CeL.wiki.set_language('en');
	 * </code>
	 * 
	 * @param {String}[language]
	 *            language.<br />
	 *            e.g., 'en'.
	 * 
	 * @returns {String}預設之語言。
	 * 
	 * @see setup_API_language()
	 */
	function set_default_language(language) {
		// e.g., 'zh-yue', 'zh-classical'
		if (typeof language !== 'string' || !/^[a-z\-\d]{2,20}$/.test(language)) {
			if (language)
				library_namespace.warn(
				//
				'set_default_language: Invalid language: [' + language
						+ ']. e.g., "en".');
			return default_language;
		}

		// assert: default_language is in lower case. See URL_to_wiki_link().
		default_language = language.toLowerCase();
		// default api URL. Use <code>CeL.wiki.API_URL = api_URL('en')</code> to
		// change it.
		// see also: application.locale
		wiki_API.API_URL = api_URL((library_namespace.is_WWW()
				&& (navigator.userLanguage || navigator.language) || default_language)
				.toLowerCase().replace(/-.+$/, ''));

		if (SQL_config)
			SQL_config.set_language(default_language);

		return wiki_API.language = default_language;
	}

	// 設定預設之語言。 English
	set_default_language('en');

	// [[:en:right-to-left#RTL Wikipedia languages]]
	// 找出使用了由右至左的文字，可用於{{lang}}模板。
	// 應該改用{{tl|rtl-lang}}處理右至左文字如阿拉伯語及希伯來語，請參見{{tl|lang}}的說明。
	// [ all ]
	var LTR_SCRIPTS = 'ar[cz]?|he|fa|bcc|bqi|ckb|dv|glk|kk|lrc|mzn|pnb|ps|sd|u[gr]|yi|tg-Arab',
	// CeL.wiki.PATTERN_LTR.test('ar')===true
	PATTERN_LTR = new RegExp('^(?:' + LTR_SCRIPTS + ')$');

	// ------------------------------------------------------------------------

	/** {Object|Function}fs in node.js */
	var node_fs;
	try {
		if (library_namespace.platform.nodejs)
			// @see https://nodejs.org/api/fs.html
			node_fs = require('fs');
		if (typeof node_fs.readFile !== 'function')
			throw true;
	} catch (e) {
		// enumerate for wiki_API.cache
		// 模擬 node.js 之 fs，以達成最起碼的效果（即無 cache 功能的情況）。
		library_namespace.warn('無 node.js 之 fs，因此不具備 cache 或 SQL 功能。');
		node_fs = {
			readFile : function(file_name, encoding, callback) {
				if (typeof callback === 'function')
					callback(true);
			},
			writeFile : library_namespace.null_function
		};
	}

	// ------------------------------------------------------------------------
	// SQL 相關函數。

	var
	// http://stackoverflow.com/questions/9080085/node-js-find-home-directory-in-platform-agnostic-way
	// Windows: process.platform.toLowerCase().startsWith('win')
	/** {String}user home directory */
	home_directory = library_namespace.platform.nodejs
			&& (process.env.HOME || process.env.USERPROFILE),
	/** {String}Tool Labs database host */
	TOOLSDB = 'tools-db',
	/** {String}user/bot name */
	user_name,
	/** {String}Tool Labs name */
	wmflabs,
	/** mysql handler */
	mysql,
	/** {Object}default SQL configurations */
	SQL_config;

	if (home_directory
			&& (home_directory = home_directory.replace(/[\\\/]$/, ''))) {
		user_name = home_directory.match(/[^\\\/]+$/);
		user_name = user_name ? user_name[0] : undefined;
		if (user_name)
			wiki_API.user_name = user_name;
		home_directory += library_namespace.env.path_separator;
	}

	// setup SQL config language (and database/host).
	function set_SQL_config_language(language) {
		if (!language)
			return;
		if (typeof language !== 'string') {
			library_namespace.err(
			//
			'set_SQL_config_language: Invalid language: [' + language + ']');
			return;
		}

		// 正規化。
		language = language.trim().toLowerCase().replace(/wiki$/, '');
		this.language = language;

		if (language === 'meta') {
			// @see /usr/bin/sql
			this.host = 's7.labsdb';
			// https://wikitech.wikimedia.org/wiki/Nova_Resource:Tools/Help#Metadata_database
			this.database = 'meta_p';

		} else if (language === TOOLSDB) {
			this.host = language;
			// delete this.database;

		} else {
			this.host = language + 'wiki.labsdb';
			/**
			 * The database names themselves consist of the mediawiki project
			 * name, suffixed with _p
			 * 
			 * @see https://wikitech.wikimedia.org/wiki/Help:Tool_Labs/Database
			 */
			this.database = language + 'wiki_p';
		}
	}

	/**
	 * return new SQL config
	 * 
	 * @param {String}[language]
	 *            database language.<br />
	 *            e.g., 'en', 'commons', 'wikidata', 'meta'.
	 * @param {String}[user]
	 *            SQL database user name
	 * @param {String}[password]
	 *            SQL database user password
	 * 
	 * @returns {Object}SQL config
	 */
	function new_SQL_config(language, user, password) {
		var config, is_clone;
		if (user)
			config = {
				user : user,
				password : password,
				db_prefix : user + '__',
				set_language : set_SQL_config_language
			};
		else if (SQL_config) {
			is_clone = true;
			config = Object.clone(SQL_config);
		} else {
			config = {};
		}

		if (typeof language === 'object') {
			if (is_clone)
				delete config.database;
			Object.assign(config, language);
		} else if (typeof language === 'string' && language) {
			if (is_clone)
				delete config.database;
			// change language (and database/host).
			config.set_language(language, !user);
		}

		return config;
	}

	/**
	 * 讀取並解析出 SQL 設定。
	 * 
	 * @param {String}file_name
	 *            file name
	 * 
	 * @returns {Object}SQL config
	 */
	function parse_SQL_config(file_name) {
		var config;
		try {
			config = library_namespace.get_file(file_name);
		} catch (e) {
			library_namespace.err(
			//
			'parse_SQL_config: Can not read config file [ ' + file_name + ']!');
			return;
		}

		// 應該用 parser。
		var user = config.match(/\n\s*user\s*=\s*([^\s]+)/), password;
		if (!user || !(password = config.match(/\n\s*password\s*=\s*([^\s]+)/)))
			return;

		return new_SQL_config(default_language, user[1], password[1]);
	}

	// only for node.js.
	// https://wikitech.wikimedia.org/wiki/Help:Tool_Labs#How_can_I_detect_if_I.27m_running_in_Labs.3F_And_which_project_.28tools_or_toolsbeta.29.3F
	if (library_namespace.platform.nodejs) {
		/** {String}Tool Labs name */
		wmflabs = node_fs.existsSync('/etc/wmflabs-project')
		// e.g., 'tools-bastion-05'.
		// if use ((process.env.INSTANCEPROJECT)), you may get 'tools' or
		// 'tools-login'.
		&& (process.env.INSTANCENAME
		// 以 /usr/bin/jsub 執行時可得。
		// e.g., 'tools-exec-1210.eqiad.wmflabs'
		|| process.env.HOSTNAME || true);
	}

	if (wmflabs) {
		wiki_API.wmflabs = wmflabs;

		// default: use Wikimedia Varnish Cache.
		// wiki_API.use_Varnish = true;
		// 2016/4/9 9:9:7 預設不使用 Wikimedia Varnish Cache。速度較慢，但較有保障。
		// delete CeL.wiki.use_Varnish;

		try {
			if (mysql = require('mysql'))
				SQL_config = parse_SQL_config(home_directory
				// The production replicas.
				// https://wikitech.wikimedia.org/wiki/Help:Tool_Labs#The_databases
				// https://wikitech.wikimedia.org/wiki/Help:Tool_Labs/Database
				// 此資料庫僅為正式上線版之刪節副本。資料並非最新版本(但誤差多於數分內)，也不完全，
				// <s>甚至可能為其他 users 竄改過</s>。
				+ 'replica.my.cnf');
		} catch (e) {
			// TODO: handle exception
		}
	}

	// ------------------------------------------------------------------------

	/**
	 * execute SQL command.
	 * 
	 * @param {String}SQL
	 *            SQL command.
	 * @param {Function}callback
	 *            回調函數。 callback({Object}error, {Array}rows, {Array}fields)
	 * @param {Object}[config]
	 *            configuration.
	 * 
	 * @see https://wikitech.wikimedia.org/wiki/Help:Tool_Labs/Database
	 * 
	 * @require https://github.com/felixge/node-mysql<br />
	 *          TODO: https://github.com/sidorares/node-mysql2
	 */
	function run_SQL(SQL, callback, config) {
		if (!config && !(config = SQL_config))
			return;

		var connection = mysql.createConnection(config);
		connection.connect();
		connection.query(SQL, callback);
		connection.end();
	}

	if (false) {
		CeL.wiki.SQL('SELECT * FROM `revision` LIMIT 3000,1;',
		//
		function(error, rows, fields) {
			if (error)
				throw error;
			// console.log('The result is:');
			console.log(rows);
		});
	}

	// ------------------------------------------------------------------------

	/**
	 * Create a new user database.
	 * 
	 * @param {String}dbname
	 *            database name.
	 * @param {Function}callback
	 *            回調函數。
	 * @param {String}[language]
	 *            database language.<br />
	 *            e.g., 'en', 'commons', 'wikidata', 'meta'.
	 * 
	 * @see https://wikitech.wikimedia.org/wiki/Help:Tool_Labs/Database#Creating_new_databases
	 */
	function create_database(dbname, callback, language) {
		if (!SQL_config)
			return;

		var config;
		if (typeof dbname === 'object') {
			config = Object.clone(dbname);
			dbname = config.database;
			delete config.database;
		} else {
			config = new_SQL_config(language || TOOLSDB);
			if (!language) {
				delete config.database;
			}
		}

		library_namespace.log('create_database: Try to create database ['
				+ dbname + ']');
		if (false) {
			/**
			 * 用此方法會:<br />
			 * [Error: ER_PARSE_ERROR: You have an error in your SQL syntax;
			 * check the manual that corresponds to your MariaDB server version
			 * for the right syntax to use near ''user__db'' at line 1]
			 */
			var SQL = {
				// placeholder
				// 避免 error.code === 'ER_DB_CREATE_EXISTS'
				sql : 'CREATE DATABASE IF NOT EXISTS ?',
				values : [ dbname ]
			};
		}

		if (dbname.includes('`'))
			throw new Error('Invalid database name: [' + dbname + ']');

		run_SQL('CREATE DATABASE IF NOT EXISTS `' + dbname + '`', function(
				error, rows, fields) {
			if (typeof callback !== 'function')
				return;
			if (error)
				callback(error);
			else
				callback(null, rows, fields);
		}, config);

		return config;
	}

	// ------------------------------------------------------------------------

	/**
	 * SQL 查詢功能之前端。
	 * 
	 * @example <code>
	 * // change language (and database/host).
	 * //CeL.wiki.SQL.config.set_language('en');
	 * CeL.wiki.SQL(SQL, function callback(error, rows, fields) { if(error) console.error(error); }, 'en');
	 * </code>
	 * 
	 * @example <code>

	// 進入 default host (TOOLSDB)。
	var SQL_session = new CeL.wiki.SQL(()=>{});
	// 進入 default host (TOOLSDB)，並預先創建 user's database 'dbname' (e.g., 's00000__dbname')
	var SQL_session = new CeL.wiki.SQL('dbname', ()=>{});
	// 進入 zhwiki.zhwiki_p。
	var SQL_session = new CeL.wiki.SQL(()=>{}, 'zh');
	// 進入 zhwiki.zhwiki_p，並預先創建 user's database 'dbname' (e.g., 's00000__dbname')
	var SQL_session = new CeL.wiki.SQL('dbname', ()=>{}, 'zh');

	// create {SQL_session}instance
	new CeL.wiki.SQL('mydb', function callback(error, rows, fields) { if(error) console.error(error); } )
	// run SQL query
	.SQL(SQL, function callback(error, rows, fields) { if(error) console.error(error); } );

	 * </code>
	 * 
	 * @param {String}[dbname]
	 *            database name.
	 * @param {Function}callback
	 *            回調函數。
	 * @param {String}[language]
	 *            database language (and database/host). default host: TOOLSDB.<br />
	 *            e.g., 'en', 'commons', 'wikidata', 'meta'.
	 * 
	 * @returns {SQL_session}instance
	 * 
	 * @constructor
	 */
	function SQL_session(dbname, callback, language) {
		if (!(this instanceof SQL_session)) {
			if (typeof language === 'object') {
				language = new_SQL_config(language);
			} else if (typeof language === 'string' && language) {
				// change language (and database/host).
				SQL_config.set_language(language);
				if (language === TOOLSDB)
					delete SQL_config.database;
				language = null;
			}
			// dbname as SQL query string.
			return run_SQL(dbname, callback, language);
		}

		if (typeof dbname === 'function' && !language) {
			// shift arguments
			language = callback;
			callback = dbname;
			dbname = null;
		}

		this.config = new_SQL_config(language || TOOLSDB);
		if (dbname) {
			if (typeof dbname === 'object') {
				Object.assign(this.config, dbname);
			} else {
				// 自動添加 prefix。
				this.config.database = this.config.db_prefix + dbname;
			}
		} else if (this.config.host === TOOLSDB) {
			delete this.config.database;
		} else {
			// this.config.database 已經在 set_SQL_config_language() 設定。
		}

		var _this = this;
		this.connect(function(error) {
			// console.error(error);
			if (error && error.code === 'ER_BAD_DB_ERROR'
					&& !_this.config.no_create && _this.config.database) {
				// Error: ER_BAD_DB_ERROR: Unknown database '...'
				create_database(_this.config, callback);
			} else if (typeof callback === 'function') {
				callback(error);
			}
		});
	}

	// need reset connection,
	function need_reconnect(error) {
		return error
		// Error: Cannot enqueue Handshake after fatal error.
		&& (error.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR'
		// ECONNRESET: socket hang up
		|| error.code === 'ECONNRESET');
	}

	// run SQL query
	SQL_session.prototype.SQL = function(SQL, callback) {
		var _this = this;
		this.connection.query(SQL, function(error) {
			if (need_reconnect(error)) {
				// re-connect. 可能已經斷線。
				_this.connection.connect(function(error) {
					if (error) {
						// console.error(error);
					}
					_this.connection.query(SQL, callback);
				});
			} else {
				callback.apply(null, arguments);
			}
		});
		return this;
	};

	SQL_session.prototype.connect = function(callback, force) {
		if (!force)
			try {
				var _this = this;
				this.connection.connect(function(error) {
					if (need_reconnect(error)) {
						// re-connect.
						_this.connect(callback, true);
					} else if (typeof callback === 'function')
						callback(error);
				});
				return this;
			} catch (e) {
				// TODO: handle exception
			}

		try {
			this.connection.end();
		} catch (e) {
			// TODO: handle exception
		}
		// 需要重新設定 this.connection，否則會出現:
		// Error: Cannot enqueue Handshake after invoking quit.
		this.connection = mysql.createConnection(this.config);
		this.connection.connect(callback);
		return this;
	};

	/**
	 * get database list.
	 * 
	 * <code>

	var SQL_session = new CeL.wiki.SQL('testdb',
	//
	function callback(error, rows, fields) {
		if (error)
			console.error(error);
		else
			s.databases(function(list) {
				console.log(list);
			});
	});

	</code>
	 * 
	 * @param {Function}callback
	 *            回調函數。
	 * @param {Boolean}all
	 *            get all databases. else: get my databases.
	 * 
	 * @returns {SQL_session}
	 */
	SQL_session.prototype.databases = function(callback, all) {
		var _this = this;
		function filter(dbname) {
			return dbname.startsWith(_this.config.db_prefix);
		}

		if (this.database_cache) {
			var list = this.database_cache;
			if (!all)
				// .filter() 會失去 array 之其他屬性。
				list = list.filter(filter);
			if (typeof callback === 'function')
				callback(list);
			return this;
		}

		var SQL = 'SHOW DATABASES';
		if (false && !all)
			// SHOW DATABASES LIKE 'pattern';
			SQL += " LIKE '" + this.config.db_prefix + "%'";

		this.connect(function(error) {
			// reset connection,
			// 預防 PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR
			_this.connection.query(SQL, function(error, rows, fields) {
				if (error || !Array.isArray(rows)) {
					library_namespace.err(error);
					rows = null;
				} else {
					rows = rows.map(function(row) {
						for ( var field in row)
							return row[field];
					});
					_this.database_cache = rows;
					if (!all)
						// .filter() 會失去 array 之其他屬性。
						rows = rows.filter(filter);
					// console.log(rows);
				}
				if (typeof callback === 'function')
					callback(rows);
			});
		});

		return this;
	};

	if (SQL_config) {
		library_namespace
				.debug('wiki_API.SQL_session: You may use SQL to get data.');
		wiki_API.SQL = SQL_session;
		// export 導出: CeL.wiki.SQL() 僅可在 Tool Labs 使用。
		wiki_API.SQL.config = SQL_config;
		// wiki_API.SQL.create = create_database;
	}

	// ----------------------------------------------------

	/**
	 * Convert MediaWiki database timestamp to ISO 8601 format.<br />
	 * UTC: 'yyyymmddhhmmss' → 'yyyy-mm-ddThh:mm:ss'
	 * 
	 * @param {String}timestamp
	 *            MediaWiki database timestamp
	 * 
	 * @returns {String}ISO 8601 Data elements and interchange formats
	 * 
	 * @see https://www.mediawiki.org/wiki/Manual:Timestamp
	 */
	function SQL_timestamp_to_ISO(timestamp) {
		if (!timestamp)
			// ''?
			return;
		timestamp = timestamp.toString('utf8').chunk(2);
		if (timestamp.length === 7)
			// 'NULL'?
			return;

		return timestamp[0] + timestamp[1]
		//
		+ '-' + timestamp[2] + '-' + timestamp[3]
		//
		+ 'T' + timestamp[4] + ':' + timestamp[5] + ':' + timestamp[6];
	}

	/**
	 * Get page title 頁面標題 list of [[Special:RecentChanges]] 最近更改.
	 * 
	 * <code>
	   // get title list
	   CeL.wiki.recent(function(rows){console.log(rows.map(function(row){return row.title;}));}, 0, 20);
	   </code>
	 * 
	 * TODO: filter
	 * 
	 * @param {Function}callback
	 *            回調函數。 callback({Array}page title 頁面標題 list)
	 * @param {Integer}[namespace]
	 *            namespace NO.
	 * @param {ℕ⁰:Natural+0}[limit]
	 *            limit count
	 */
	function get_recent(callback, namespace, limit) {
		var SQL = 'SELECT * FROM `recentchanges` WHERE `rc_bot`=0'
		// https://www.mediawiki.org/wiki/Manual:Recentchanges_table
		+ (library_namespace.is_digits(namespace)
		//
		? ' AND `rc_namespace`=' + namespace : '')
		// new → old, may contain duplicate title.
		+ ' ORDER BY `rc_timestamp` DESC LIMIT '
				+ (library_namespace.is_digits(limit) ? limit : 10);

		run_SQL(SQL, function(error, rows, fields) {
			if (error)
				callback();
			else {
				rows = rows.map(function(row) {
					return {
						// page id
						id : row.rc_cur_id,
						namespace : row.rc_namespace,
						title : row.rc_title.toString('utf8'),
						//
						user : row.rc_user,
						is_new : !!row.rc_new,
						length : row.rc_new_len,
						old_len : row.rc_old_len,
						// use new Date(.timestamp)
						timestamp : SQL_timestamp_to_ISO(row.rc_timestamp
								.toString('utf8')),
						//
						oldid : row.rc_this_oldid,
					};
				});
				callback(rows);
			}
		});
	}

	if (SQL_config) {
		wiki_API.recent = get_recent;
	}

	// --------------------------------------------------------------------------------------------

	/**
	 * 取得最新之 Wikimedia dump。
	 * 
	 * @param {String}[project]
	 *            project code name. e.g., 'enwiki'
	 * @param {Function}callback
	 *            回調函數。
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @see https://en.wikipedia.org/wiki/Wikipedia:Database_download#Where_do_I_get...
	 * 
	 * @inner
	 */
	function get_latest_dump(project, callback, options) {
		if (false && !wmflabs) {
			// 最起碼須有 bzip2, wget 特定版本輸出訊息 @ /bin/sh
			throw new Error('Only for Tool Labs!');
		}

		if (typeof project === 'function' && typeof callback !== 'function'
				&& !options) {
			// shift arguments
			options = callback;
			callback = project;
			project = null;
		}

		// 正規化並提供可隨意改變的同內容參數，以避免修改或覆蓋附加參數。
		options = library_namespace.new_options(options);

		if (!project)
			// e.g., 'enwiki'.
			project = language_to_project(options.project);

		// dump host
		var host = options.host || 'http://dumps.wikimedia.org/',
		// e.g., '20160305'.
		latest = options.latest;
		if (!latest) {
			get_URL(
			// Get the latest version.
			host + project + '/', function(XMLHttp) {
				var response = XMLHttp.responseText;
				var latest = 0, previous, matched,
				//
				PATTERN = / href="(\d{8,})/g;
				while (matched = PATTERN.exec(response)) {
					matched = Math.floor(matched[1]);
					if (latest < matched)
						previous = latest, latest = matched;
				}
				// 不動到原來的 options。
				options = Object.clone(options);
				// default: 'latest'
				options.latest = latest || 'latest';
				if (previous)
					options.previous = previous;
				get_latest_dump(project, callback, options);
			});
			return;
		}

		var directory = options.directory || './',
		//
		filename = options.filename || project + '-' + latest
				+ '-pages-articles.xml';

		/**
		 * <code>
		head -n 80 zhwiki-20160305-pages-meta-current1.xml
		less zhwiki-20160305-pages-meta-current1.xml
		tail -n 80 zhwiki-20160305-pages-meta-current1.xml
		</code>
		 */

		/**
		 * e.g., <code>
		callback = function(data) { console.log(data); };
		latest = '20160305';
		project = 'enwiki';
		//dump_directory = '~/dumps/';
		// https://wikitech.wikimedia.org/wiki/Help:Tool_Labs/Developing#Using_the_shared_Pywikibot_files_.28recommended_setup.29
		// /shared/: shared files
		dump_directory = '/shared/dumps/'
		filename = project + '-' + latest + '-pages-articles-multistream-index.txt';
		</code>
		 */

		var data_file_OK;
		try {
			// check if file exists
			data_file_OK = node_fs.statSync(directory + filename);
		} catch (e) {
		}

		if (data_file_OK) {
			library_namespace.log('get_latest_dump: Using data file (.xml): ['
					+ directory + filename + ']');
			callback(directory + filename);
			return;
		}

		// ----------------------------------------------------

		function extract() {
			library_namespace.log('get_latest_dump.extract: Extracting ['
					+ source_directory + archive + ']...');
			// share the xml dump file. 應由 caller 自行設定。
			// process.umask(parseInt('0022', 8));
			require('child_process').exec(
			//
			'/bin/bzip2 -cd "' + source_directory + archive + '" > "'
			//
			+ directory + filename + '"', function(error, stdout, stderr) {
				if (error) {
					library_namespace.err(error);
				} else {
					library_namespace.log(
					//
					'get_latest_dump.extract: Done. Running callback...');
				}
				callback(directory + filename);
			});
		}

		// search the latest file in the local directory.
		// https://wikitech.wikimedia.org/wiki/Help:Tool_Labs#Dumps
		// 可在 /public/dumps/public/zhwiki/ 找到舊 dumps。 (using `df -BT`)
		// e.g.,
		// /public/dumps/public/zhwiki/20160203/zhwiki-20160203-pages-articles.xml.bz2
		var source_directory, archive = options.archive || filename + '.bz2';

		if (wmflabs) {
			source_directory = '/public/dumps/public/' + project + '/' + latest
					+ '/';
			library_namespace.debug('Check if public dump archive exists: ['
					+ source_directory + archive + ']', 1, 'get_latest_dump');
			try {
				node_fs.accessSync(source_directory + archive);
				library_namespace.log('get_latest_dump: Public dump archive ['
						+ source_directory + archive + '] exists.');
				extract();
				return;
			} catch (e) {
			}
		}

		// ----------------------------------------------------

		source_directory = directory;

		library_namespace.debug('Check if file exists: [' + source_directory
				+ archive + ']', 1, 'get_latest_dump');
		try {
			node_fs.statSync(source_directory + archive);
			library_namespace.log('get_latest_dump: Archive ['
					+ source_directory + archive + '] exists.');
			extract();
			return;
		} catch (e) {
		}

		// ----------------------------------------------------

		library_namespace.log('get_latest_dump: Try to save archive to ['
				+ source_directory + archive + ']...');
		// https://nodejs.org/api/child_process.html
		var child = require('child_process').spawn('/usr/bin/wget',
		// -O=""
		[ '--output-document=' + source_directory + archive,
		// 經測試，採用 .spawn() 此種方法毋須考慮 '"' 之類 quote 的問題。
		host + project + '/' + latest + '/' + archive ]);

		child.stdout.setEncoding('utf8');
		child.stderr.setEncoding('utf8');

		/**
		 * http://stackoverflow.com/questions/6157497/node-js-printing-to-console-without-a-trailing-newline
		 * 
		 * In Windows console (Linux, too), you should replace '\r' with its
		 * equivalent code \033[0G:
		 */
		child.stdout.on('data', function(data) {
			process.stdout.write(data);
		});

		child.stderr.on('data', function(data) {
			data = data.toString('utf8');
			/**
			 * <code>
			 e.g.,
			259000K .......... .......... .......... .......... .......... 21%  282M 8m26s
			999950K .......... .......... .......... .......... .......... 82% 94.2M 1m46s
			1000000K .......... .......... .......... .......... .......... 82%  103M 1m46s
			</code>
			 */
			// [ all, downloaded, percentage, speed, remaining 剩下時間 ]
			var matched = data
					.match(/([^\n\.]+)[.\s]+(\d+%)\s+([^\s]+)\s+([^\s]+)/);
			if (matched) {
				data = matched[2] + '  ' + matched[1] + '  ' + matched[4]
						+ '                    \r';
			} else if (data.includes('....') || /\d+[ms]/.test(data)
					|| /\.\.\s*\d+%/.test(data))
				return;
			process.stderr.write(data);
		});

		child.on('close', function(error_code) {
			if (error_code) {
				library_namespace.err('get_latest_dump: Error code '
						+ error_code);
				// 有時最新版本可能 dump 到一半，正等待中。
				if (options.previous) {
					library_namespace.info(
					// options.previous: latest 的前一個版本。
					'get_latest_dump: Use previous version: ['
							+ options.previous + '].');
					options.latest = options.previous;
					delete options.previous;
					get_latest_dump(project, callback, options);
				} else {
					callback();
				}
				return;
			}

			library_namespace.log('get_latest_dump: Got archive file ['
					+ source_directory + archive + '].');
			extract();
		});
	}

	/**
	 * 還原 XML text 成原先之文本。
	 * 
	 * @param {String}xml
	 *            XML text
	 * 
	 * @returns {String}還原成原先之文本。
	 * 
	 * @inner
	 */
	function unescape_xml(xml) {
		return xml.replace(/&quot;/g, '"')
		// 2016/3/11: Wikimedia dumps do NOT include '&apos;'.
		.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
		// MUST be the last one.
		.replace(/&amp;/g, '&');
	}

	var
	/** {Number}未發現之index。 const: 基本上與程式碼設計合一，僅表示名義，不可更改。(=== -1) */
	NOT_FOUND = ''.indexOf('_');

	/**
	 * Parse Wikimedia dump xml text.
	 * 
	 * @param {String}xml
	 *            xml text
	 * @param {ℕ⁰:Natural+0}[start_index]
	 *            start index to parse.
	 * @param {Function}[filter]
	 *            filter :<br />
	 *            function(pageid, revid) { return {Boolean}need_process; }
	 * 
	 * @returns {Object}page_data =
	 *          {pageid,ns,title,revisions:[{revid,timestamp,'*'}]}
	 */
	function parse_dump_xml(xml, start_index, filter) {
		if (!(start_index >= 0))
			start_index = 0;

		// 主要頁面內容所在。
		var revision_index = xml.indexOf('<revision>', start_index);
		if (revision_index === NOT_FOUND
		// check '<model>wikitext</model>'
		// || xml.indexOf('<model>wikitext</model>') === NOT_FOUND
		) {
			// 有 end_mark '</page>' 卻沒有 '<revision>'
			library_namespace.err('parse_dump_xml: Bad data:\n'
					+ xml.slice(0, index));
			return;
		}

		var pageid = xml.between('<id>', '</id>', start_index) | 0,
		// ((revid|0)) 可能出問題。
		revid = Math.floor(xml.between('<id>', '</id>', revision_index));

		if (filter && !filter(pageid, revid)) {
			if (false)
				library_namespace.debug('Skip id ' + pageid, 4,
						'parse_dump_xml');
			return;
		}

		// page 之 structure 按照 wiki API 本身之 return
		// page_data = {pageid,ns,title,revisions:[{revid,timestamp,'*'}]}
		// includes redirection 包含重新導向頁面.
		// includes non-ns0.
		var page_data = {
			pageid : pageid,
			ns : xml.between('<ns>', '</ns>', start_index) | 0,
			title : unescape_xml(xml
					.between('<title>', '</title>', start_index)),
			revisions : [ {
				// rev_id
				revid : revid,
				// e.g., '2000-01-01T00:00:00Z'
				timestamp : xml.between('<timestamp>', '</timestamp>',
						revision_index),
				// old: e.g., '<text xml:space="preserve" bytes="80">'??
				// 2016/3/11: e.g., '<text xml:space="preserve">'
				'*' : unescape_xml(xml.between('<text xml:space="preserve">',
						'</text>', revision_index))
			} ]
		};

		return page_data;
	}

	/**
	 * 讀取/parse Wikimedia dumps 之 xml 檔案。
	 * 
	 * 注意: 必須自行 include 'application.platform.nodejs'。 <code>
	   CeL.run('application.platform.nodejs');
	 * </code><br />
	 * 
	 * @param {String}[filename]
	 *            欲讀取的 .xml 檔案名稱。
	 * @param {Function}callback
	 *            回調函數。 callback({Object}page_data)
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @returns {String}file path
	 * 
	 * @see <a href="http://dumps.wikimedia.org/backup-index.html">Wikimedia
	 *      database backup dumps</a>
	 * @see https://www.mediawiki.org/wiki/Help:Export
	 * 
	 * @since 2016/3/11
	 */
	function read_dump(filename, callback, options) {
		if (typeof filename === 'function' && typeof callback !== 'function'
				&& !options) {
			// shift arguments
			options = callback;
			callback = filename;
			filename = null;
		}

		if (typeof filename !== 'string' || !filename.endsWith('.xml')) {
			if (filename)
				library_namespace.log('read_dump: Invalid file path: ['
						+ filename + '], try to get the latest dump file...');
			get_latest_dump(filename, function(filename) {
				read_dump(filename, callback, options);
			}, options);
			// 警告: 無法馬上取得檔案時，將不會回傳任何資訊！
			return;
		}

		options = library_namespace.setup_options(options);

		if (typeof options.first === 'function')
			options.first(filename);

		var run_last = function(quit_operation) {
			library_namespace.debug('Finish work.', 1, 'read_dump');
			if (run_last && typeof options.last === 'function') {
				options.last.call(file_stream, anchor, quit_operation);
			}
			// run once only.
			run_last = null;
		},
		/** {String}file encoding for dump file. */
		encoding = options.encoding || wiki_API.encoding,
		/** {String}處理中之資料。 */
		buffer = '',
		/** end mark */
		end_mark = '</page>',
		/**
		 * 錨/定位點.<br />
		 * anchor[pageid] = [ position of the xml dump file, page length in
		 * bytes ]
		 * 
		 * @type {Array}
		 */
		anchor = options.anchor && [],
		//
		filter = options.filter,
		/**
		 * dump file stream.
		 * 
		 * filename: XML file path.<br />
		 * e.g., 'enwiki-20160305-pages-meta-current1.xml'
		 * 
		 * @type {String}
		 */
		file_stream = new node_fs.ReadStream(filename, {
			// 加大 buffer。據測試，改到 1 MiB 反而慢。
			highWaterMark : 128 * 1024
		}),
		/**
		 * 掌握進度用。 (100 * file_status.pos / file_status.size | 0) + '%'<br />
		 * 此時 stream 可能尚未初始化，(file_stream.fd===null)，<br />
		 * 因此不能使用 fs.fstatSync()。
		 * 
		 * @type {Object}
		 */
		// file_status = node_fs.fstatSync(file_stream.fd);
		// file_status = node_fs.statSync(filename),
		/** {Natural}檔案長度。掌握進度用。 */
		// file_size = node_fs.statSync(filename).size,
		/**
		 * byte counter. 已經處理過的資料長度，為 bytes，非 characters。指向 buffer 起頭在 file
		 * 中的位置。
		 * 
		 * @type {ℕ⁰:Natural+0}
		 */
		bytes = 0;
		// 若是預設 encoding，會造成 chunk.length 無法獲得正確的值。
		// 若是為了能掌握進度，則不預設 encoding。
		// 2016/3/26: 但這會造成破碎/錯誤的編碼，只好放棄。
		file_stream.setEncoding(encoding);

		file_stream.on('error', options.onerror || function(error) {
			library_namespace.err('read_dump: Error occurred: ' + error);
		});

		/**
		 * 工作流程: 循序讀取檔案內容。每次讀到一個區塊/段落 (chunk)，檢查是不是有結束標記。若是沒有，則得繼續讀下去。<br />
		 * 有結束標記，則取出開始標記至結束標記中間之頁面文字資料，紀錄起始與結尾檔案位置，放置於 anchor[pageid]，並開始解析頁面。<br />
		 * 此時 bytes 指向檔案中 start position of buffer，可用來設定錨/定位點。
		 */

		library_namespace.info('read_dump: Starting read data...');

		/**
		 * Parse Wikimedia dump xml file slice.
		 * 
		 * TODO: 把工具函數寫到 application.platform.nodejs 裡面去。
		 */
		function parse_buffer(index) {
			index = buffer.indexOf(end_mark, index);
			if (index === NOT_FOUND)
				// 資料尚未完整，繼續讀取。
				return;

			// 回頭找 start mark '<page>'
			var start_index = buffer.lastIndexOf('<page>', index);
			if (start_index === NOT_FOUND) {
				throw new Error(
						'parse_buffer: We have end mark without start mark!');
			}

			var page_data = parse_dump_xml(buffer, start_index, filter);
			if (!page_data) {
				if (false)
					library_namespace.debug(
					//
					'跳過此筆紀錄。 index: ' + index + ', buffer: ' + buffer.length,
							3, 'parse_dump_xml');
				bytes += Buffer.byteLength(buffer.slice(0, index
						+ end_mark.length), encoding);
				// 截斷。
				buffer = buffer.slice(index + end_mark.length);
				// 雖然跳過此筆紀錄，但既然還能處理，便需要繼續處理。
				return true;
			}

			var pageid = page_data.pageid,
			//
			start_pos = Buffer.byteLength(buffer.slice(0, start_index),
					encoding),
			// 犧牲效能以確保採用無須依賴 encoding 特性之實作法。
			page_bytes = Buffer.byteLength(buffer.slice(start_index, index
					+ end_mark.length), encoding),
			// [ start position of file, length in bytes ]
			page_anchor = [ bytes + start_pos, page_bytes ];
			if (false && anchor && (pageid in anchor))
				library_namespace.err('parse_buffer: Duplicated page id: '
						+ pageid);
			if (anchor)
				anchor[pageid] = page_anchor;
			// 跳到下一筆紀錄。
			bytes += start_pos + page_bytes;
			// 截斷。
			buffer = buffer.slice(index + end_mark.length);

			if (wiki_API.quit_operation ===
			/**
			 * function({Object}page_data, {Natural}position: 到本page結束時之檔案位置,
			 * {Array}page_anchor)
			 */
			callback(page_data, bytes, page_anchor/* , file_status */)) {
				// console.log(file_stream);
				library_namespace.info('read_dump: Quit operation, 中途跳出作業...');
				file_stream.close();
				// free RAM.
				buffer = '';
				run_last(true);
				return;
			}

			return true;
		}

		file_stream.on('data', function(chunk) {

			// 之前的 buffer 已經搜尋過，不包含 end_mark。
			var index = buffer.length;

			/**
			 * 當未採用 .setEncoding(encoding)，之後才 += chunk.toString(encoding)；
			 * 則一個字元可能被切分成兩邊，這會造成破碎/錯誤的編碼。
			 * 
			 * This properly handles multi-byte characters that would otherwise
			 * be potentially mangled if you simply pulled the Buffers directly
			 * and called buf.toString(encoding) on them. If you want to read
			 * the data as strings, always use this method.
			 * 
			 * @see https://nodejs.org/api/stream.html#stream_class_stream_readable
			 */
			buffer += chunk;
			// buffer += chunk.toString(encoding);

			// --------------------------------------------

			/**
			 * 以下方法廢棄 deprecated。 an alternative method: 另一個方法是不設定
			 * file_stream.setEncoding(encoding)，而直接搜尋 buffer 有無 end_mark '</page>'。直到確認不會打斷
			 * character，才解 Buffer。若有才分割、執行 .toString(encoding)。但這需要依賴最終
			 * encoding 之特性，並且若要採 Buffer.concat() 也不見得更高效， and
			 * Buffer.prototype.indexOf() needs newer node.js. 或許需要自己寫更底層的功能，直接
			 * call fs.read()。此外由於測試後，發現瓶頸在網路傳輸而不在程式碼執行，因此不如犧牲點效能，確保採用無須依賴
			 * encoding 特性之實作法。
			 */

			;

			// --------------------------------------------
			while (parse_buffer(index))
				// 因為 buffer 已經改變，reset index.
				index = 0;

			// 頁面大小系統上限 2,048 KB = 2 MB。
			if (buffer.length > 3e6) {
				library_namespace.err(
				//
				'read_dump: buffer too long (' + buffer.length
						+ ' characters)! Paused! 有太多無法處理的 buffer，可能是格式錯誤？');
				console.log(buffer.slice(0, 1e3) + '...');
				file_stream.pause();
				// file_stream.resume();
				// throw buffer.slice(0,1e3);
			}
		});

		file_stream.on('end', run_last);

		// * @returns {String}file path
		// * @returns {node_fs.ReadStream}file handler
		// return file_stream;
	}

	wiki_API.read_dump = read_dump;

	// ------------------------------------------------------------------------

	/**
	 * cache 相關函數:
	 * 
	 * @see application.storage.file.get_cache_file
	 *      application.OS.Windows.file.cacher
	 *      application.net.Ajax.get_URL_cache<br />
	 *      application.net.wiki<br />
	 *      wiki_API.cache() CeL.wiki.cache()
	 */

	if (false) {
		// example

		CeL.wiki.cache({
			type : 'page',
			file_name : 'file_name',
			list : 'WP:SB',
			operator : function(data) {
				console.log(data);
			}
		}, function callback(data) {
			console.log(data);
		}, {
			// default options === this
			// [SESSION_KEY]
			// session : wiki,
			// title_prefix : 'Template:',
			// cache path prefix
			prefix : 'base_directory/'
		});

		CeL.set_debug(6);
		CeL.wiki.cache({
			type : 'callback',
			file_name : 'file_name',
			list : function(callback) {
				callback([ 1, 2, 3 ]);
			},
			operator : function(data) {
				console.log(data);
			}
		}, function callback(data) {
			console.log(data);
		}, {
			// default options === this
			// [SESSION_KEY]
			// session : wiki,
			// title_prefix : 'Template:',
			// cache path prefix
			prefix : './'
		});

		CeL.set_debug(6);
		var wiki = Wiki(true);
		CeL.wiki.cache({
			type : 'wdq',
			file_name : 'countries',
			list : 'claim[31:6256]',
			operator : function(list) {
				// console.log(list);
				result = list;
			}
		}, function callback(list) {
			// console.log(list);
		}, {
			// default options === this
			// [SESSION_KEY]
			session : wiki,
			// title_prefix : 'Template:',
			// cache path prefix
			prefix : './'
		});
	}

	/**
	 * cache 作業操作之輔助套裝函數。<br />
	 * only for node.js.
	 * 
	 * 注意: 必須自行 include 'application.platform.nodejs'。 <code>
	   CeL.run('application.platform.nodejs');
	 * </code><br />
	 * 注意: 需要自行先創建各 type 之次目錄，如 page, redirects, embeddedin, ...<br />
	 * 注意: 會改變 operation, _this！ Warning: will modify operation, _this!
	 * 
	 * 連續作業: 依照 _this 設定 {Object}default options，即傳遞於各 operator 間的 ((this))。<br />
	 * 依照 operation 順序個別執行單一項作業。
	 * 
	 * 單一項作業:<br />
	 * 設定檔名。<br />
	 * 若不存在此檔，則:<br />
	 * >>> 依照 operation.type 與 operation.list 取得資料。<br />
	 * >>> 若 Array.isArray(operation.list) 則處理多項列表作業:<br />
	 * >>>>>> 個別處理單一項作業，每次執行 operation.each() || operation.each_retrieve()。<br />
	 * >>> 執行 data = operation.retrieve()，以其回傳作為將要 cache 之 data。<br />
	 * >>> 寫入cache。<br />
	 * 執行 operation.operator(data)
	 * 
	 * TODO: file_stream<br />
	 * TODO: do not write file
	 * 
	 * @param {Object|Array}operation
	 *            作業設定。
	 * @param {Function}[callback]
	 *            所有作業(operation)執行完後之回調函數。 callback(response data)
	 * @param {Object}[_this]
	 *            傳遞於各 operator 間的 ((this))。注意: 會被本函數更動！
	 */
	wiki_API.cache = function(operation, callback, _this) {
		if (library_namespace.is_Object(callback) && !_this) {
			// shift arguments.
			_this = callback;
			callback = undefined;
		}

		/**
		 * 連續作業時，轉到下一作業。
		 * 
		 * node.js v0.11.16: In strict mode code, functions can only be declared
		 * at top level or immediately within another function.
		 */
		function next_operator(data) {
			library_namespace.debug('處理連續作業序列，轉到下一作業: ' + (index + 1) + '/'
					+ operation.length, 2, 'wiki_API.cache.next_operator');
			// [ {Object}operation, {Object}operation, ... ]
			// operation = { type:'embeddedin', operator:function(data) }
			if (index < operation.length) {
				var this_operation = operation[index++];
				if (!this_operation) {
					// Allow null operation.
					library_namespace.debug('未設定 operation[' + (index - 1)
							+ ']。Skip this operation.', 1,
							'wiki_API.cache.next_operator');
					next_operator(data);

				} else {
					if (!('list' in this_operation)) {
						// use previous data as list.
						library_namespace.debug(
								'未特別指定 list，以前一次之回傳 data 作為 list。', 3,
								'wiki_API.cache.next_operator');
						library_namespace.debug('前一次之回傳 data: '
								+ (data && JSON.stringify(data).slice(0, 180))
								+ '...', 3, 'wiki_API.cache.next_operator');
						this_operation.list = data;
					}
					if (data) {
						this_operation.last_data = data;
					}
					// default options === _this: 傳遞於各 operator 間的 ((this))。
					wiki_API.cache(this_operation, next_operator, _this);
				}

			} else if (typeof callback === 'function') {
				// last 收尾
				callback.call(_this, data);
			}
		}

		if (Array.isArray(operation)) {
			var index = 0;

			next_operator();
			return;
		}

		// ----------------------------------------------------
		/**
		 * 以下為處理單一次作業。
		 */
		library_namespace.debug('處理單一次作業。', 2, 'wiki_API.cache');
		library_namespace.debug(
				'using operation: ' + JSON.stringify(operation), 6,
				'wiki_API.cache');

		if (typeof _this !== 'object') {
			// _this: 傳遞於各 operator 間的 ((this))。
			_this = library_namespace.null_Object();
		}

		var file_name = operation.file_name,
		/** 前一次之回傳 data。每次產出的 data。 */
		last_data = operation.last_data;

		if (typeof file_name === 'function') {
			// @see wiki_API.cache.title_only
			file_name = file_name.call(_this, last_data, operation);
		}

		var
		/** {String}method to get data */
		type = operation.type,
		/** {Boolean}是否自動嘗試建立目錄。 */
		try_mkdir = typeof library_namespace.fs_mkdir === 'function'
				&& operation.mkdir,
		//
		operator = typeof operation.operator === 'function'
				&& operation.operator,
		//
		list = operation.list;

		if (!file_name) {
			// 若自行設定了檔名，則慢點執行 list()，先讀讀 cache。因為 list() 可能會頗耗時間。
			// 基本上，設定 this.* 應該在 operation.operator() 中，而不是在 operation.list() 中。
			if (typeof list === 'function')
				// TODO: 允許非同步方法。
				list = list.call(_this, last_data, operation);

			if (!operation.postfix)
				if (type === 'file')
					operation.postfix = '.txt';
				else if (type === 'URL')
					operation.postfix = '.htm';

			// 自行設定之檔名 operation.file_name 優先度較 type/title 高。
			// 需要自行創建目錄！
			file_name = _this[type + '_prefix'] || type;
			file_name = [ file_name ? file_name + '/' : '',
			//
			get_page_content.is_page_data(list) ? list.title
			// 若 Array.isArray(list)，則 ((file_name = ''))。
			: typeof list === 'string' && normalize_page_name(list, true) ];
			if (file_name[1]) {
				file_name = file_name[0]
				// 正規化檔名。
				+ file_name[1].replace(/\//g, '_');
			} else {
				// assert: node_fs.readFile('') 將執行 callback(error)
				file_name = '';
			}
		}

		if (file_name) {
			if (!('postfix' in operation) && !('postfix' in _this)
					&& /\.[a-z\-\d]+$/.test(file_name)) {
				// 若已設定 filename extension，則不自動添加。
				operation.postfix = '';
			}

			file_name = [ 'prefix' in operation ? operation.prefix
			// _this.prefix: cache path prefix
			: 'prefix' in _this
			//
			? _this.prefix : wiki_API.cache.prefix, file_name,
			// auto detect filename extension
			'postfix' in operation ? operation.postfix
			//
			: 'postfix' in _this ? _this.postfix : wiki_API.cache.postfix ];
			library_namespace.debug('Pre-normalized cache file name: ['
					+ file_name + ']', 5, 'wiki_API.cache');
			if (false)
				library_namespace.debug('file name param:'
						+ [ operation.file_name, _this[type + '_prefix'], type,
								JSON.stringify(list) ].join(';'), 6,
						'wiki_API.cache');
			// 正規化檔名。
			file_name = file_name.join('').replace(/[:*?<>]/g, '_');
		}
		library_namespace.debug('Try to read cache file: [' + file_name + ']',
				3, 'wiki_API.cache');

		var
		/**
		 * 採用 JSON<br />
		 * TODO: parse & stringify 機制
		 * 
		 * @type {Boolean}
		 */
		use_JSON = 'json' in operation ? operation.json : /\.json$/i
				.test(file_name),
		/** {String}file encoding for fs of node.js. */
		encoding = _this.encoding || wiki_API.encoding;
		// list file path
		_this.file_name = file_name;

		node_fs.readFile(file_name, encoding, function(error, data) {
			/**
			 * 結束作業。
			 */
			function finish_work(data) {
				last_data = data;
				if (operator)
					operator.call(_this, data, operation);
				if (typeof callback === 'function')
					callback.call(_this, data);
			}

			if (!error && (data ||
			// 當資料 Invalid，例如採用 JSON 卻獲得空資料時；則視為 error，不接受此資料。
			('accept_empty_data' in _this
			//
			? _this.accept_empty_data : !use_JSON))) {
				library_namespace.debug('Using cached data.', 3,
						'wiki_API.cache');
				library_namespace.debug('Cached data: [' + data.slice(0, 200)
						+ ']...', 5, 'wiki_API.cache');
				finish_work(use_JSON ? data ? JSON.parse(data)
				// error? 注意: 若中途 abort，此時可能需要手動刪除大小為 0 的 cache file！
				: undefined : data);
				return;
			}

			library_namespace.debug('No valid cached data. Try to get data...',
					3, 'wiki_API.cache');

			/**
			 * 寫入 cache 至檔案系統。
			 */
			function write_cache(data) {
				if (operation.cache === false) {
					// 當設定 operation.cache: false 時，不寫入 cache。
					library_namespace.debug(
							'設定 operation.cache === false，不寫入 cache。', 3,
							'wiki_API.cache.write_cache');
				} else if (/[^\\\/]$/.test(file_name)) {
					library_namespace
							.info('wiki_API.cache: Write cache data to ['
									+ file_name + '].');
					library_namespace.debug('Cache data: '
							+ (data && JSON.stringify(data).slice(0, 190))
							+ '...', 3, 'wiki_API.cache.write_cache');
					var write = function() {
						// 為了預防需要建立目錄，影響到後面的作業，
						// 因此採用 fs.writeFileSync() 而非 fs.writeFile()。
						node_fs.writeFileSync(file_name, use_JSON ? JSON
								.stringify(data) : data, encoding);
					};
					try {
						write();
					} catch (error) {
						// assert: 此 error.code 表示上層目錄不存在。
						var matched = error.code === 'ENOENT'
						// 未設定 operation.mkdir 的話，預設會自動嘗試建立目錄。
						&& try_mkdir !== false
						//
						&& file_name.match(/[\\\/][^\\\/]+$/);
						if (matched) {
							// 僅測試一次。設定 "已嘗試過" flag。
							try_mkdir = false;
							// create parent directory
							library_namespace.fs_mkdir(file_name.slice(0,
									matched.index));
							// re-write file again.
							try {
								write();
							} catch (e) {
								library_namespace.err(
								//
								'wiki_API.cache: Error to write cache data!');
								library_namespace.err(e);
							}
						}
					}
				}

				finish_work(data);
			}

			// node.js v0.11.16: In strict mode code, functions can only be
			// declared
			// at top level or immediately within another function.
			/**
			 * 取得並處理下一項 data。
			 */
			function get_next_item(data) {
				library_namespace.debug('處理多項列表作業: ' + index + '/'
						+ list.length, 2, 'wiki_API.cache.get_next_item');
				if (index < list.length) {
					// 利用基本相同的參數以取得 cache。
					_operation.list = list[index++];
					wiki_API.cache(_operation, get_next_item, _this);
				} else {
					// last 收尾
					// All got. retrieve data.
					if (_operation.data_list)
						data = _operation.data_list;
					if (typeof operation.retrieve === 'function')
						data = operation.retrieve.call(_this, data);
					write_cache(data);
				}
			}

			if (typeof list === 'function' && type !== 'callback') {
				list = list.call(_this, last_data, operation);
			}
			if (list === wiki_API.cache.abort) {
				library_namespace
						.debug('Abort operation.', 1, 'wiki_API.cache');
				return;
			}

			if (Array.isArray(list)) {
				if (!type) {
					library_namespace.debug('採用 list (length ' + list.length
							+ ') 作為 data。', 1, 'wiki_API.cache');
					write_cache(list);
					return;
				}
				if (list.length > 1e6) {
					library_namespace.warn(
					//
					'wiki_API.cache: 警告: list 過長 (length ' + list.length
							+ ')，將過於耗時而不實際！');
				}

				/**
				 * 處理多項列表作業。
				 */
				var index = 0, _operation = Object.clone(operation);
				// 個別頁面不設定 .file_name, .end。
				delete _operation.end;
				if (_operation.each_file_name) {
					_operation.file_name = _operation.each_file_name;
					delete _operation.each_file_name;
				} else {
					delete _operation.file_name;
				}
				if (typeof _operation.each === 'function') {
					// 每一項 list 之項目執行一次 .each()。
					_operation.operator = _operation.each;
					delete _operation.each;
				} else {
					if (typeof _operation.each_retrieve === 'function')
						_operation.each_retrieve = _operation.each_retrieve
								.bind(_this);
					else
						delete _operation.each_retrieve;
					/**
					 * 預設處理列表的函數。
					 */
					_operation.operator = function(data) {
						if ('each_retrieve' in operation)
							// 資料事後處理程序 (post-processor):
							// 將以 .each_retrieve() 的回傳作為要處理的資料。
							data = operation.each_retrieve.call(_this, data);
						if (_operation.data_list) {
							if (Array.isArray(data))
								Array.prototype.push.apply(
										_operation.data_list, data);
							else if (data)
								_operation.data_list.push(data);
						} else {
							if (Array.isArray(data))
								_operation.data_list = data;
							else if (data)
								_operation.data_list = [ data ];
						}
					};
				}
				library_namespace.debug('處理多項列表作業, using operation: '
						+ JSON.stringify(_operation), 5, 'wiki_API.cache');

				get_next_item();
				return;
			}

			// ------------------------------------------------
			/**
			 * 以下為處理單一項作業。
			 */

			var to_get_data, list_type;
			if (type in get_list.type) {
				list_type = type;
				type = 'list';
			}

			switch (type) {
			case 'callback':
				if (typeof list !== 'function') {
					library_namespace
							.warn('wiki_API.cache: list is not function!');
					callback(last_data);
					break;
				}
				// 手動取得資料。使用 list=function(callback){callback(list);}
				to_get_data = function(list, callback) {
					library_namespace.log('wiki_API.cache: '
							+ 'manually get data and then callback(list).');
					if (typeof list === 'function') {
						// assert: (typeof list === 'function') 必須自己回 call！
						list.call(_this, callback, last_data, operation);
					}
				};
				break;

			case 'file':
				// 一般不應用到。
				// get file 內容。
				to_get_data = function(file_path, callback) {
					library_namespace.log('wiki_API.cache: Get file ['
							+ file_path + '].');
					node_fs.readFile(file_path, operation.encoding, function(
							error, data) {
						if (error)
							library_namespace.err(
							//
							'wiki_API.cache: Error get file [' + file_path
									+ ']: ' + error);
						callback(data);
					});
				};
				break;

			case 'URL':
				// get URL 頁面內容。
				to_get_data = function(URL, callback) {
					library_namespace.log('wiki_API.cache: Get URL of [' + URL
							+ '].');
					get_URL(URL, callback);
				};
				break;

			case 'wdq':
				to_get_data = function(query, callback) {
					if (_this[SESSION_KEY]) {
						if (!_this[SESSION_KEY].data_session) {
							_this[SESSION_KEY].set_data();
							_this[SESSION_KEY].run(function() {
								// retry again
								to_get_data(query, callback);
							});
							return;
						}
						operation[SESSION_KEY]
						//
						= _this[SESSION_KEY].data_session;
					}

					library_namespace.log('wiki_API.cache: Wikidata Query ['
							+ query + '].');
					wikidata_query(query, callback, operation);
				};
				break;

			case 'page':
				// get page contents 頁面內容。
				to_get_data = function(title, callback) {
					library_namespace.log('wiki_API.cache: Get content of [['
							+ get_page_title(title) + ']].');
					wiki_API.page(title, function(page_data) {
						callback(page_data);
					}, library_namespace.new_options(_this, operation));
				};
				break;

			case 'redirects':
				to_get_data = function(title, callback) {
					wiki_API.redirects(title, function(root_page_data,
							redirect_list) {
						library_namespace.log(
						//
						'redirects (alias) of [['
						//
						+ get_page_title(title) + ']]: ('
						//
						+ redirect_list.length + ') ['
						//
						+ redirect_list.slice(0, 3)
						//
						.map(function(page_data) {
							return page_data.title;
						}) + ']...');
						if (!operation.keep_redirects && redirect_list
								&& redirect_list[0])
							// cache 中不需要此累贅之資料。
							// redirect_list[0].redirects
							// === redirect_list.slice(1)
							delete redirect_list[0].redirects;
						callback(redirect_list);
					}, Object.assign({
						include_root : true
					}, _this, operation));
				};
				break;

			case 'list':
				to_get_data = function(title, callback) {
					wiki_API.list(title, function(pages) {
						library_namespace.log(list_type
						// allpages 不具有 title。
						+ (title ? ' [[' + get_page_title(title) + ']]' : '')
						//
						+ ': ' + pages.length + ' page(s).');
						// page list, title page_data
						callback(pages);
					}, Object.assign({
						type : list_type
					}, _this, operation));
				};
				break;

			default:
				if (typeof type === 'function')
					to_get_data = type.bind(Object.assign(library_namespace
							.null_Object(), _this, operation));
				else if (type)
					throw new Error('wiki_API.cache: Bad type: ' + type);
				else {
					library_namespace.debug('直接採用 list 作為 data。', 1,
							'wiki_API.cache');
					write_cache(list);
					return;
				}
			}

			// recover type
			// if (list_type) type = list_type;

			var title = list;
			if (typeof title === 'string' && _this.title_prefix)
				title = _this.title_prefix + title;
			library_namespace.debug('處理單一項作業: [[' + get_page_title(title)
					+ ']]。', 3, 'wiki_API.cache');
			to_get_data(title, write_cache);
		});
	};

	/** {String}預設 file encoding for fs of node.js。 */
	wiki_API.encoding = 'utf8';
	/** {String}檔名預設前綴。 */
	wiki_API.cache.prefix = '';
	/** {String}檔名預設後綴。 */
	wiki_API.cache.postfix = '.json';
	/**
	 * 若 operation.list() return wiki_API.cache.abort，<br />
	 * 則將直接中斷離開 operation，不執行 callback。<br />
	 * 此時須由 operation.list() 自行處理 callback。
	 */
	wiki_API.cache.abort = library_namespace.null_Object();
	/**
	 * 只取檔名，僅用在 operation.each_file_name。<br />
	 * <code>{
	 * each_file_name : CeL.wiki.cache.title_only,
	 * }</code>
	 * 
	 * @type {Function}
	 */
	wiki_API.cache.title_only = function(last_data, operation) {
		var list = operation.list;
		if (typeof list === 'function')
			operation.list = list = list.call(this, last_data, operation);
		return operation.type + '/' + remove_namespace(list);
	};

	// --------------------------------------------------------------------------------------------

	/**
	 * 由 Tool Labs database replication 讀取所有 ns0，且未被刪除頁面最新修訂版本之版本號 rev_id
	 * (包含重定向)。<br />
	 * 從 `page` 之 page id 確認 page 之 namespace，以及未被刪除。然後選擇其中最大的 revision id。
	 * 
	 * @type {String}
	 * 
	 * @see https://www.mediawiki.org/wiki/Manual:Page_table#Sample_MySQL_code
	 */
	var all_revision_SQL = 'SELECT `rev_page` AS i, MAX(`rev_id`) AS r FROM `revision` INNER JOIN `page` ON `page`.`page_id` = `revision`.`rev_page` WHERE `page`.`page_namespace` = 0 AND `revision`.`rev_deleted` = 0 GROUP BY `rev_page`';

	if (false)
		/**
		 * 採用此 SQL 之極大問題: page.page_latest 並非最新 revision id.<br />
		 * the page.page_latest is not the latest revision id of a page in Tool
		 * Labs database replication.
		 */
		all_revision_SQL = 'SELECT `page_id` AS i, `page_latest` AS l FROM `page` p INNER JOIN `revision` r ON p.page_latest = r.rev_id WHERE `page_namespace` = 0 AND r.rev_deleted = 0';
	if (false)
		// for debug.
		all_revision_SQL += ' LIMIT 8';

	/**
	 * 應用功能: 遍歷所有頁面。 CeL.wiki.traversal()
	 * 
	 * @param {Object}[config]
	 *            configuration
	 * @param {Function}callback
	 *            回調函數。 callback(page_data)
	 */
	function traversal_pages(config, callback) {
		if (typeof config === 'function' && callback === undefined) {
			// shift arguments.
			callback = config;
			config = library_namespace.null_Object();
		} else {
			// 正規化並提供可隨意改變的同內容參數，以避免修改或覆蓋附加參數。
			config = library_namespace.new_options(config);
		}

		if (config.use_dump) {
			// 僅僅使用 dump，不採用 API 取得最新頁面內容。
			// @see process_dump.js
			if (config.use_dump === true)
				// 這邊的 ((true)) 僅表示要使用，並採用預設值；不代表設定 dump file path。
				config.use_dump = null;
			read_dump(config.use_dump, callback, {
				// directory to restore dump files.
				// e.g., '/shared/dumps/', '~/dumps/'
				directory : config.dump_directory,
				first : config.first,
				last : config.last
			});
			return;
		}

		/** {Array}id/title list */
		var id_list, rev_list,
		/** {Object}用在 wiki_API.cache 之 configuration。 */
		cache_config = {
			// all title/id list
			file_name : config.file_name
			// use default_language
			// all_pages.*.json 存有當前語言維基百科當前所有的頁面id以及最新版本 (*:當前語言)
			|| traversal_pages.list_file + '.' + default_language + '.json',
			operator : function(list) {
				if (list.length === 3
						&& JSON.stringify(list[0]) === JSON
								.stringify(traversal_pages.id_mark)) {
					library_namespace.info(
					// cache file 內容來自 The production replicas (database)，
					// 為經過 cache_config.list 整理過之資料。
					'traversal_pages: 此資料似乎為 page id，來自 production replicas: ['
							+ this.file_name + ']');
					// Skip list[0] = traversal_pages.id_mark
					rev_list = list[2];
					list = list[1];
					// 讀取 production replicas 時，儲存的是 pageid。
					list.is_id = true;
				}
				id_list = list;
			},
			after : config.after
		};

		if (Array.isArray(config.list)) {
			library_namespace.debug('採用輸入之 list，length ' + config.list.length
					+ '。', 1, 'traversal_pages');
			cache_config.list = config.list;

		} else if (wmflabs && !config.no_database) {
			library_namespace.debug('若沒有 cache，則嘗試讀取 database 之資料。', 1,
					'traversal_pages');
			cache_config.list = function() {
				library_namespace.info(
				// database replicas
				'traversal_pages: 嘗試讀取 Tool Labs 之 database replication 資料，'
						+ '一次讀取完所有頁面最新修訂版本之版本號 rev_id...');
				// default: 採用 page_id 而非 page_title 來 query。
				var is_id = 'is_id' in config ? config.is_id : true;
				run_SQL(is_id ? all_revision_SQL
				//
				: all_revision_SQL.replace(/page_id/g, 'page_title'), function(
						error, rows, fields) {
					if (error) {
						library_namespace.err(error);
						config.no_database = error;
					} else {
						library_namespace.log('traversal_pages: All '
								+ rows.length + ' pages. 轉換中...');
						// console.log(rows.slice(0, 2));
						var id_list = [], rev_list = [];
						rows.forEach(function(row) {
							// .i, .r: @see all_revision_SQL
							id_list.push(is_id ? row.i | 0 : row.i
									.toString('utf8'));
							rev_list.push(row.r);
						});
						config.list = [ traversal_pages.id_mark, id_list,
								rev_list ];
						// config.is_id = is_id;
					}
					traversal_pages(config, callback);
				});
				return wiki_API.cache.abort;
			};

		} else {
			library_namespace.debug('採用 API type = allpages。', 1,
					'traversal_pages');
			cache_config.type = 'allpages';
		}

		wiki_API.cache(cache_config,
		// do for each page
		function() {
			// 有設定 config[SESSION_KEY] 才能獲得如 bot 之類，一次讀取/操作更多頁面的好處。
			var session = config[SESSION_KEY]
			//
			|| new wiki_API(config.user, config.password, config.language);
			library_namespace.log('traversal_pages: 開始遍歷 '
			// includes redirection 包含重新導向頁面.
			+ (id_list && id_list.length) + ' pages...');

			/**
			 * 工作原理:<code>

			 * 經測試，讀取 file 會比讀取 MariaDB 快，且又更勝於經 API 取得資料。
			 * 經測試，遍歷 xml dump file 約 3分鐘(see process_dump.js)，會比隨機存取快得多。
			 * database replicas @ Tool Labs 無 `text` table，因此實際頁面內容不僅能經過 replicas 存取。

			# 先將最新的 xml dump file 下載到本地(實為 network drive)並解開: read_dump()
			# 由 Tool Labs database replication 讀取所有 ns0 且未被刪除頁面最新修訂版本之版本號 rev_id (包含重定向): traversal_pages() + all_revision_SQL
			# 遍歷 xml dump file，若 dump 中為最新修訂版本，則先用之 (約 95%)；純粹篩選約需近 3 minutes: try_dump()
			# 經 API 讀取餘下 dump 後近 5% 更動過的頁面內容: traversal_pages() + wiki_API.prototype.work
			# 於 Tool Labs，解開 xml 後；自重新抓最新修訂版本之版本號起，網路連線順暢時整個作業時間約 12分鐘。

			</code>
			 */

			function try_dump() {
				var start_read_time = Date.now(), length = id_list.length,
				// max_length = 0,
				count = 0, limit = config.limit,
				//
				file_size, rev_of_id = [], is_id = id_list.is_id;

				id_list.forEach(function(id, index) {
					if (id in rev_of_id)
						library_namespace.warn('traversal_pages: 存在重複之id: '
								+ id);
					rev_of_id[id] = rev_list[index];
				});

				// release
				id_list = rev_list = null;

				if (dump_file === true)
					// 這邊的 ((true)) 僅表示要使用，並不代表設定 dump file path。
					dump_file = null;
				read_dump(dump_file,
				//
				function(page_data, position, page_anchor) {
					// filter
					if (false) {
						if (!page_data || ('missing' in page_data))
							return [ CeL.wiki.edit.cancel, '條目已不存在或被刪除' ];
						if (page_data.ns !== 0)
							return [ CeL.wiki.edit.cancel, '本作業僅處理條目命名空間' ];
					}

					// TODO
					if (false && limit > 0 && count > limit) {
						library_namespace.log(count + '筆資料，已到 limit，跳出。');
					}

					if (++count % 1e4 === 0) {
						var speed = count / (Date.now() - start_read_time);
						speed = speed < .1 ? (1e3 * speed).toFixed(2)
								+ ' page/s' : speed.toFixed(3) + ' page/ms';
						// e.g.,
						// "2730000 (99%): 21.326 page/ms [[Category:大洋洲火山岛]]"
						library_namespace.log(
						// 'traversal_pages: ' +
						count + ' ('
						//
						+ (100 * position / file_size | 0) + '%): '
						//
						+ speed + ' [[' + page_data.title + ']]');
					}

					// ----------------------------
					// Check data.

					if (false) {
						/** {Object}revision data. 修訂版本資料。 */
						var revision = page_data.revisions
								&& page_data.revisions[0];
						/** {String}page title = page_data.title */
						var title = CeL.wiki.title_of(page_data),
						/**
						 * {String}page content, maybe undefined. 條目/頁面內容 =
						 * revision['*']
						 */
						content = CeL.wiki.content_of(page_data);

						// 似乎沒 !page_data.title 這種問題。
						if (false && !page_data.title)
							library_namespace.warn('* No title: [['
									+ page_data.pageid + ']]!');
						// [[Wikipedia:快速删除方针]]
						if (revision['*']) {
							// max_length = Math.max(max_length,
							// revision['*'].length);

							// filter patterns

						} else {
							library_namespace.warn('* No contents: [['
									+ page_data.title + ']]! 沒有頁面內容！');
						}
					}

					// 註記為 dump。可以 ((messages)) 判斷是在 .work() 中執行或取用 dump 資料。
					// page_data.dump = true;
					// page_data.dump = dump_file;

					// ------------------------------------
					// 有必要中途跳出時則須在 callback() 中設定：
					// @ callback(page_data, messages):
					if (false && need_quit) {
						if (messages) {
							// 當在 .work() 中執行時。
							messages.quit_operation = true;
							// 在 .edit() 時不設定內容。但照理應該會在 .page() 中。
							return;
						}
						// 當在本函數，下方執行時，不包含 messages。
						return CeL.wiki.quit_operation;
					}
					// ------------------------------------

					return callback(page_data);

				}, {
					// 指定 dump file 放置的 directory。
					directory : config.dump_directory,
					first : function(xml_filename) {
						dump_file = xml_filename;
						try {
							file_size = node_fs.statSync(xml_filename).size;
						} catch (e) {
							// 若不存在 dump_directory，則會在此出錯。
							if (e.code === 'ENOENT') {
								library_namespace.err('traversal_pages: '
										+ 'You may need to create '
										+ 'the dump directory yourself!');
							}
							throw e;
						}
					},
					filter : function(pageid, revid) {
						if ((pageid in rev_of_id)
								&& rev_of_id[pageid] === revid) {
							// 隨時 delete rev_of_id[] 會使速度極慢。
							// delete rev_of_id[pageid];
							rev_of_id[pageid] = null;
							return true;
						}
					},
					last : function(anchor, quit_operation) {
						// e.g.,
						// "All 1491092 pages in dump xml file, 198.165 s."
						// includes redirection 包含重新導向頁面.
						library_namespace.log('traversal_pages: All ' + count
								+ '/' + length + ' pages using dump xml file ('
								+ (1000 * count / length | 0) / 10 + '%), '
								+ ((Date.now() - start_read_time) / 1000 | 0)
								+ ' s elapsed.');
						var need_API = [];
						need_API.is_id = is_id;
						for ( var id in rev_of_id)
							if (rev_of_id[id] !== null)
								need_API.push(id);
						// release
						rev_of_id = null;

						// library_namespace.set_debug(3);
						// 一般可以達到 95% 以上採用 dump file 的程度，10分鐘內跑完。
						run_work(need_API, quit_operation);
					}
				});
			}

			function run_work(id_list, quit_operation) {
				if (quit_operation) {
					library_namespace.info(
					// 直接結束作業
					'traversal_pages: 已中途跳出作業，不再讀取 production database。');
					if (typeof config.after === 'function')
						config.after();
					return;
				}

				if (typeof config.filter === 'function')
					library_namespace.log(
					//
					'traversal_pages: 開始讀取 production，執行 .work(): '
							+ (id_list && id_list.length) + ' pages...');
				session.work({
					is_id : id_list.is_id,
					no_message : true,
					no_edit : 'no_edit' in config ? config.no_edit : true,
					each : callback,
					// 取得多個頁面內容所用之 options。
					// e.g., { rvprop : 'ids|timestamp|content' }
					// Warning: 這對經由 dump 取得之 page 無效！
					page_options : config.page_options,
					// config.last(/* no meaningful arguments */)
					after : config.after
				}, id_list);
			}

			// 工作流程: config.filter() → run_work()

			// 若 config.filter 非 function，表示要先比對 dump，若修訂版本號相同則使用之，否則自 API 擷取。
			// 並以 try_dump() 當作 filter()。
			// 設定 config.filter 為 ((true)) 表示要使用預設為最新的 dump，
			// 否則將之當作 dump file path。

			// 若不想使用 dump，可不設定 .filter。
			// 經測試，全部使用 API，最快可入50分鐘內，一般在 1-2 hours 左右。
			var dump_file;
			if (config.filter && (typeof config.filter !== 'function')) {
				dump_file = config.filter;
				config.filter = try_dump;
			}

			if (typeof config.filter === 'function') {
				// preprocessor before running .work()
				// 可用於額外功能。
				// e.g., 若 revision 相同，從 dump 而不從 API 讀取。
				// id_list, rev_list 採用相同的 index。
				config.filter(run_work, callback, id_list, rev_list);
			} else {
				run_work(id_list);
			}

		}, {
			// cache path prefix
			// e.g., task name
			prefix : config.directory
		});
	}

	/**
	 * ((traversal_pages.id_mark)) indicate it's page id instead of page title.
	 * 表示此 cache list 為 page id，而非 page title。 須採用絕不可能用來當作標題之 value。<br />
	 * 勿用過於複雜、無法 JSON.stringify() 或過於簡單的結構。
	 */
	traversal_pages.id_mark = {};

	/** {String}default list file name (will append .json by wiki_API.cache) */
	traversal_pages.list_file = 'all_pages';

	// --------------------------------------------------------------------------------------------
	// Flow page support. Flow 功能支援。
	// [[mediawikiwiki:Extension:Flow/API]]
	// https://www.mediawiki.org/w/api.php?action=help&modules=flow

	// https://zh.wikipedia.org/w/api.php?action=query&prop=flowinfo&titles=Wikipedia_talk:Flow_tests
	// https://zh.wikipedia.org/w/api.php?action=flow&submodule=view-topiclist&page=Wikipedia_talk:Flow_tests&vtlformat=wikitext&utf8=1
	// .roots[0]
	// https://zh.wikipedia.org/w/api.php?action=flow&submodule=view-topic&page=Topic:sqs6skdav48d3xzn&vtformat=wikitext&utf8=1

	// https://www.mediawiki.org/w/api.php?action=flow&submodule=view-header&page=Talk:Sandbox&vhformat=wikitext&utf8=1
	// https://www.mediawiki.org/w/api.php?action=flow&submodule=view-topiclist&utf8=1&page=Talk:Sandbox

	/**
	 * get the infomation of Flow.
	 * 
	 * @param {String|Array}title
	 *            page title 頁面標題。可為話題id/頁面標題+話題標題。<br />
	 *            {String}title or [ {String}API_URL, {String}title or
	 *            {Object}page_data ]
	 * @param {Function}callback
	 *            回調函數。 callback({Object}page_data)
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 */
	function Flow_info(title, callback, options) {
		// 處理 [ {String}API_URL, {String}title or {Object}page_data ]
		if (!Array.isArray(title)
		// 為了預防輸入的是問題頁面。
		|| title.length !== 2 || typeof title[0] === 'object')
			title = [ , title ];
		title[1] = wiki_API.query.title_param(title[1], true, options
				&& options.is_id);

		if (options && options.redirects)
			// 毋須 '&redirects=1'
			title[1] += '&redirects';

		title[1] = 'query&prop=flowinfo&' + title[1];
		if (!title[0])
			title = title[1];

		wiki_API.query(title, typeof callback === 'function'
		//
		&& function(data) {
			if (library_namespace.is_debug(2)
			// .show_value() @ interact.DOM, application.debug
			&& library_namespace.show_value)
				library_namespace.show_value(data, 'Flow_info: data');

			var error = data && data.error;
			// 檢查伺服器回應是否有錯誤資訊。
			if (error) {
				library_namespace.err('Flow_info: ['
				//
				+ error.code + '] ' + error.info);
				/**
				 * e.g., Too many values supplied for parameter 'pageids': the
				 * limit is 50
				 */
				if (data.warnings
				//
				&& data.warnings.query && data.warnings.query['*'])
					library_namespace.warn(data.warnings.query['*']);
				callback();
				return;
			}

			if (!data || !data.query || !data.query.pages) {
				library_namespace.warn('Flow_info: Unknown response: ['
				//
				+ (typeof data === 'object'
				//
				&& typeof JSON !== 'undefined'
				//
				? JSON.stringify(data) : data) + ']');
				if (library_namespace.is_debug()
				// .show_value() @ interact.DOM, application.debug
				&& library_namespace.show_value)
					library_namespace.show_value(data);
				callback();
				return;
			}

			data = data.query.pages;
			var pages = [];
			for ( var pageid in data) {
				var page = data[pageid];
				pages.push(page);
			}

			// options.multi: 即使只取得單頁面，依舊回傳 Array。
			if (!options || !options.multi)
				if (pages.length <= 1) {
					if (pages = pages[0])
						pages.is_Flow = is_Flow(pages);
					library_namespace.debug('只取得單頁面 [[' + pages.title
					//
					+ ']]，將回傳此頁面資料，而非 Array。', 2, 'Flow_info');
				} else {
					library_namespace.debug('Get ' + pages.length
					//
					+ ' page(s)! The pages'
					//
					+ ' will all passed to callback as Array!'
					//
					, 2, 'Flow_info');
				}

			/**
			 * page 之 structure 將按照 wiki API 本身之 return！<br />
			 * <code>
			page_data = {ns,title,missing:'']}
			page_data = {pageid,ns,title,flowinfo:{flow:[]}}
			page_data = {pageid,ns,title,flowinfo:{flow:{enabled:''}}}
			 * </code>
			 */
			callback(pages);
		}, null, options);
	}

	/**
	 * 檢測 page_data 是否為 Flow 討論頁面系統。
	 * 
	 * @param {Object}page_data
	 *            page data got from wiki API.
	 * 
	 * @returns {Boolean}是否為 Flow 討論頁面。
	 */
	function is_Flow(page_data) {
		var flowinfo = page_data &&
		// get_page_content.is_page_data(page_data) &&
		page_data.flowinfo;
		if (flowinfo)
			// flowinfo:{flow:{enabled:''}}
			return flowinfo.flow && ('enabled' in flowinfo.flow);
		// e.g., 從 wiki_API.page 得到的 page_data
		if (page_data = get_page_content.has_content(page_data))
			return page_data.contentmodel === 'flow-board';
	}

	/** {Object}abbreviation 縮寫 */
	var Flow_abbreviation = {
		// 關於討論板的描述。
		header : 'h',
		// 討論板話題列表。
		topiclist : 'tl'
	};

	/**
	 * get topics of the page.
	 * 
	 * @param {String|Array}title
	 *            page title 頁面標題。可為話題id/頁面標題+話題標題。 {String}title or [
	 *            {String}API_URL, {String}title or {Object}page_data ]
	 * @param {Function}callback
	 *            回調函數。 callback({Object}topiclist)
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 */
	function Flow_page(title, callback, options) {
		// 處理 [ {String}API_URL, {String}title or {Object}page_data ]
		if (!Array.isArray(title)
		// 為了預防輸入的是問題頁面。
		|| title.length !== 2 || typeof title[0] === 'object')
			title = [ , title ];

		var page_data;
		if (get_page_content.is_page_data(title[1]))
			page_data = title[1];

		title[1] = 'page=' + encodeURIComponent(get_page_title(title[1]));

		if (options && options.redirects)
			// 毋須 '&redirects=1'
			title[1] += '&redirects';

		// e.g., { flow_view : 'header' }
		var view = options && options.flow_view
		//
		|| Flow_page.default_flow_view;
		title[1] = 'flow&submodule=view-' + view + '&v'
				+ (Flow_abbreviation[view] || view.charAt(0).toLowerCase())
				+ 'format=' + (options && options.format || 'wikitext') + '&'
				+ title[1];

		if (!title[0])
			title = title[1];

		wiki_API.query(title, typeof callback === 'function'
		//
		&& function(data) {
			if (library_namespace.is_debug(2)
			// .show_value() @ interact.DOM, application.debug
			&& library_namespace.show_value)
				library_namespace.show_value(data, 'Flow_page: data');

			var error = data && data.error;
			// 檢查伺服器回應是否有錯誤資訊。
			if (error) {
				library_namespace.err(
				//
				'Flow_page: [' + error.code + '] ' + error.info);
				callback(page_data);
				return;
			}

			// data =
			// { flow: { 'view-topiclist': { result: {}, status: 'ok' } } }
			if (!(data = data.flow)
			//
			|| !(data = data['view-' + view]) || data.status !== 'ok') {
				library_namespace.err(
				//
				'Flow_page: Error status [' + (data && data.status) + ']');
				callback(page_data);
				return;
			}

			if (page_data)
				// assert: data.result = { ((view)) : {} }
				Object.assign(page_data, data.result);
			else
				page_data = data.result[view];
			callback(page_data);
		}, null, options);
	}

	/** {String}default view to flow page */
	Flow_page.default_flow_view = 'topiclist';

	/**
	 * Create a new topic. 發新話題。 Reply to an existing topic.
	 * 
	 * @param {String|Array}title
	 *            page title 頁面標題。 {String}title or [ {String}API_URL,
	 *            {String}title or {Object}page_data ]
	 * @param {String}topic
	 *            新話題的標題文字。 {String}topic
	 * @param {String|Function}text
	 *            page contents 頁面內容。 {String}text or {Function}text(page_data)
	 * @param {Object}token
	 *            login 資訊，包含“csrf”令牌/密鑰。
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * @param {Function}[callback]
	 *            回調函數。 callback(title, error, result)
	 * 
	 * @see https://www.mediawiki.org/w/api.php?action=help&modules=flow%2Bnew-topic
	 *      https://www.mediawiki.org/w/api.php?action=help&modules=flow%2Breply
	 */
	function edit_topic(title, topic, text, token, options, callback) {
		var action = 'flow';
		// 處理 [ {String}API_URL, {String}title or {Object}page_data ]
		if (Array.isArray(title))
			action = [ title[0], action ], title = title[1];

		if (get_page_content.is_page_data(title))
			title = title.title;
		// assert: typeof title === 'string' or title is invalid.
		if (title.length > 260) {
			// [nttopic] 話題標題已限制在 260 位元組內。
			// 自動評論與摘要的長度限制是260個字符。需要小心任何超出上述限定的東西將被裁剪掉。
			// 260 characters
			// https://github.com/wikimedia/mediawiki-extensions-Flow/blob/master/includes/Model/PostRevision.php
			// const MAX_TOPIC_LENGTH = 260;
			// https://github.com/wikimedia/mediawiki-extensions-Flow/blob/master/i18n/zh-hant.json
			library_namespace
					.warn('edit_topic: Title is too long and will be truncated: ['
							+ error.code + ']');
			title = title.slice(0, 260);
		}

		// default parameters
		var _options = {
			notification : 'flow',
			submodule : 'new-topic',
			page : title,
			nttopic : topic,
			ntcontent : text,
			ntformat : 'wikitext'
		};

		wiki_API.login.copy_keys.forEach(function(key) {
			if (options[key])
				_options[key] = options[key];
		});

		// the token should be sent as the last parameter.
		_options.token = library_namespace.is_Object(token) ? token.csrftoken
				: token;

		wiki_API.query(action, typeof callback === 'function'
		//
		&& function(data) {
			if (library_namespace.is_debug(2)
			// .show_value() @ interact.DOM, application.debug
			&& library_namespace.show_value)
				library_namespace.show_value(data, 'edit_topic: data');

			var error = data && data.error;
			// 檢查伺服器回應是否有錯誤資訊。
			if (error) {
				library_namespace.err('edit_topic: ['
				//
				+ error.code + '] ' + error.info);
			} else if (!(data = data.flow)
			//
			|| !(data = data['new-topic']) || data.status !== 'ok') {
				// data = { flow: { 'new-topic': { status: 'ok',
				// workflow: '', committed: {} } } }
				error = 'edit_topic: Error status ['
				//
				+ (data && data.status) + ']';
				library_namespace.err(error);
			}

			if (typeof callback === 'function')
				// title.title === get_page_title(title)
				callback(title.title, error, data);
		}, _options, options);
	}

	/** {Array}欲 copy 至 Flow edit parameters 之 keys。 */
	wiki_API.login.copy_keys = 'summary|bot|redirect|nocreate'.split(',');

	Object.assign(Flow_info, {
		is_Flow : is_Flow,
		page : Flow_page,
		edit : edit_topic
	});

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
	 * @param value
	 *            要測試的值。
	 * 
	 * @returns {Boolean}value 為實體項目。
	 */
	function is_entity(value) {
		return library_namespace.is_Object(value)
		// {String}id: Q\d+ 或 P\d+。
		&& value.id && library_namespace.is_Object(value.labels);
	}

	/**
	 * API URL of wikidata.<br />
	 * e.g., 'https://www.wikidata.org/w/api.php',
	 * 'https://test.wikidata.org/w/api.php'
	 * 
	 * @type {String}
	 */
	var wikidata_API_URL = api_URL('wikidata');

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

		if (session.data_session && API_URL & !force)
			return;

		if (session.data_session) {
			// 直接清空佇列。
			// TODO: 強制中斷所有正在執行之任務。
			session.data_session.actions.clear();
		}

		if (typeof API_URL === 'string' && !/wikidata/i.test(API_URL)
				&& !/^[a-z\-\d]{2,20}$/i.test(API_URL)) {
			// e.g., 'test' → 'test.wikidata'
			API_URL += '.wikidata';
		}

		// set Wikidata session
		session.data_session = wiki_API.login(session.token.lgname,
		// wiki.set_data(host, password)
		password || session.token.lgpassword,
		// API_URL: host
		typeof API_URL === 'string' && api_URL(API_URL) || wikidata_API_URL);
		session.data_session.run(callback);
	}

	// ------------------------------------------------------------------------

	/**
	 * 搜索標籤包含特定關鍵字(label=key)的項目。
	 * 
	 * 此搜索有極大問題:不能自動偵測與轉換中文繁簡體。 或須轉成英語再行搜尋。
	 * 
	 * @example<code>

	CeL.wiki.data.search('宇宙', function(entity) {result=entity;console.log(entity[0]==='Q1');}, {get_id:true});
	CeL.wiki.data.search('宇宙', function(entity) {result=entity;console.log(entity==='Q1');}, {get_id:true, limit:1});
	CeL.wiki.data.search('形狀', function(entity) {result=entity;console.log(entity==='P1419');}, {get_id:true,type:'property'});

	</code>
	 * 
	 * @param {String}key
	 *            要搜尋的關鍵字。
	 * @param {Function}[callback]
	 *            回調函數。 callback({Array}entity list or {Object}entity or
	 *            {String}entity id, error)
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 */
	function wikidata_search(key, callback, options) {

		if (typeof options === 'function')
			options = {
				filter : options
			};
		else if (typeof options === 'string')
			options = {
				language : options
			};
		else
			// 正規化並提供可隨意改變的同內容參數，以避免修改或覆蓋附加參數。
			options = library_namespace.new_options(options);

		if (Array.isArray(key))
			// for [ {String}language, {String}key ]
			options.language = key[0], key = key[1];

		key = key.trim();
		var action = [
				options.API_URL
				//
				|| options[SESSION_KEY] && options[SESSION_KEY].API_URL
						|| wikidata_API_URL,
				// search. e.g.,
				// https://www.wikidata.org/w/api.php?action=wbsearchentities&search=abc&language=en&utf8=1
				'wbsearchentities&search=' + encodeURIComponent(key)
				//
				+ '&language=' + (options.language || default_language)
				//
				+ '&limit=' + (options.limit || 'max') ];

		if (options.type)
			action[1] += '&type=' + options.type;

		if (options['continue'] > 0)
			action[1] += '&continue=' + options['continue'];

		wiki_API.query(action, function(data) {
			var error = data && data.error;
			// 檢查伺服器回應是否有錯誤資訊。
			if (error) {
				library_namespace.err('wikidata_search: ['
				//
				+ error.code + '] ' + error.info);
				callback(undefined, error);
				return;
			}

			// console.log(data);
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
					if (key === item.match.text)
						return true;
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

			if (Array.isArray(list.length > 1)) {
				list = Array.prototype.concat.apply([], list);
			} else {
				list = list[0];
			}
			if (options.get_id) {
				list = list.map(function(item) {
					return item.id;
				});
			}
			if (!options.multi && (
			// options.limit <= 1
			list.length <= 1)) {
				list = list[0];
			}
			callback(list);
		}, null, options);
	}

	// ------------------------------------------------------------------------

	/**
	 * {Array}時間精度單位。
	 * 
	 * @see https://www.mediawiki.org/wiki/Wikibase/DataModel/JSON#time
	 */
	var time_unit = '十億年,億年,千萬年,百萬年,十萬年,萬年,千紀,世紀,年代,年,月,日,時,分,秒,毫秒,微秒,納秒'
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

	/**
	 * 將特定的屬性值轉為JavaScript的物件。
	 * 
	 * @param {Object}value
	 *            從Wikidata所得到的屬性值。
	 * @param {Function}[callback]
	 *            回調函數。 callback(轉成JavaScript的值)
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @returns 轉成JavaScript的值。
	 * 
	 * @see https://www.mediawiki.org/wiki/Wikibase/DataModel/JSON#Claims_and_Statements
	 *      https://www.mediawiki.org/wiki/Wikibase/API
	 *      https://www.mediawiki.org/wiki/Wikibase/Indexing/RDF_Dump_Format#Value_representation
	 */
	function wikidata_datavalue(value, callback, options) {
		if (Array.isArray(value)) {
			if (value.length > 1) {
				// TODO: array + ('numeric-id' in value)
				value = value.map(wikidata_datavalue);
				if (typeof callback === 'function')
					callback(value);
				return value;
			}
			value = value[0];
		}

		if (is_entity(value)) {
			// get label of entity
			value = value.labels;
			var language = options && options[SESSION_KEY]
					&& options[SESSION_KEY].language;
			language = language && value[language] || value[default_language]
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

		// TODO: value.qualifiers, value['qualifiers-order']
		// TODO: value.references
		value = value.mainsnak || value;
		value = value.datavalue || value;

		var type = value.type;
		// TODO: type 可能為 undefined!

		if ('value' in value)
			value = value.value;

		if (typeof value !== 'object') {
			// e.g., typeof value === 'string'
			if (typeof callback === 'function')
				callback(value);
			return value;
		}

		if ('text' in value) {
			// e.g., { text: 'Ὅμηρος', language: 'grc' }
			return value.text;
		}

		if ('amount' in value) {
			// qualifiers 純量數值
			if (typeof callback === 'function')
				callback(+value.amount);
			return +value.amount;
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
			return coordinate;
		}

		if ('time' in value) {
			// date & time. 時間日期
			var matched, year, precision = value.precision;

			if (precision <= 9) {
				matched = value.time.match(/^[+\-]\d+/);
				year = +matched[0];
				var power = Math.pow(10, 9 - precision);
				matched = [ year / power | 0 ];
				matched.unit = [ time_unit[precision] ];
				matched.power = power;

			} else {
				matched = value.time.match(
				// [ all, Y, m, d, H, M, S ]
				/^([+\-]\d+)-(\d+)-(\d+)T(\d+):(\d+):(\d+)Z$/);
				// +1: is length, not index
				// +1: year starts from 1.
				matched = matched.slice(1, precision - 9 + 1 + 1)
				//
				.map(function(value) {
					return +value;
				});
				year = matched[0];
				matched.unit = time_unit.slice(9, precision + 1);
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
			&& (Julian_day = library_namespace.Julian_day))
				// start JDN
				matched.JD = Julian_day.from_YMD(year, matched[1], matched[2],
						!matched.Julian);
			matched.toString = time_toString;
			if (typeof callback === 'function')
				callback(matched);
			return matched;
		}

		if ('numeric-id' in value) {
			// wikidata entity. 實體
			value = 'Q' + value['numeric-id'];
			if (typeof callback === 'function') {
				library_namespace.debug('Trying to get entity ' + value, 1,
						'wikidata_datavalue');
				wikidata_entity(value, options && options.get_object ? callback
				// default: get label 標籤標題
				: function(entity) {
					entity = entity.labels || entity;
					entity = entity[options && options.language
							|| default_language]
							|| entity;
					callback('value' in entity ? entity.value : entity);
				}, options && options.language);
			}
			return value;
		}

		library_namespace.warn('wikidata_datavalue: 尚無法處理此屬性: [' + type
				+ ']，請修改本函數。');
		return value;
	}

	// ------------------------------------------------------------------------

	// TODO:
	// [[:sourceforge:project/shownotes.php?release id=226003&group id=34373]]
	// http://sourceforge.net/project/shownotes.php%3Frelease_id%3D226003%26group_id%3D34373
	// [[:gerrit:gitweb?p=mediawiki/core.git;a=blob;f=RELEASE-NOTES-1.23]]
	// https://gerrit.wikimedia.org/r/gitweb%3Fp%3Dmediawiki/core.git;a%3Dblob;f%3DRELEASE-NOTES-1.23
	// [[:google:湘江]]
	// https://www.google.com/search?q=%E6%B9%98%E6%B1%9F
	// [[:imdbtitle:0075713]], [[:imdbname:2339825]] → {{imdb name}}
	// http://www.imdb.com/title/tt0075713/
	// [[:arxiv:Hep-ex/0403017]]
	// [[:gutenberg:27690]]
	// [[:scores:Das wohltemperierte Klavier I, BWV 846-869 (Bach, Johann
	// Sebastian)]]
	// [[:wikt:제비]]
	// [[:yue:海珠湖國家濕地公園]]
	/**
	 * language code → Wikidata site name / Wikimedia project name<br />
	 * 將語言代碼轉為 Wikidata API 可使用之 site name。
	 * 
	 * @param {String}language
	 *            語言代碼。
	 * 
	 * @returns {String}Wikidata API 可使用之 site name。
	 */
	function language_to_project(language) {
		// 正規化。
		language = (language && String(language).trim().toLowerCase() || default_language)
		// e.g., 'zh-min-nanwiki' → 'zh_min_nanwiki'
		.replace(/-/g, '_');

		// 以防 incase wikt, wikisource
		if (!language.includes('wik')
		// 光是只有 "Category"，代表還是在本 wiki 中，不算外語言。
		&& !/^category/i.test(language))
			language += 'wiki';

		// 為日文特別處理。
		if (language === 'jpwiki')
			language = 'jawiki';
		// 為粵文維基百科特別處理。
		else if (language === 'yuewiki')
			language = 'zh_yuewiki';

		return language;
	}

	/**
	 * 自 options[SESSION_KEY] 取得 wikidata API 所須之 site parameter。
	 * 
	 * @param {Object}options
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @return {String}wikidata API 所須之 site parameter。
	 * 
	 * @inner
	 */
	function wikidata_get_site(options) {
		var language = options[SESSION_KEY];
		if (language) {
			// 注意:在取得 page 後，中途更改過 API_URL 的話，這邊會取得錯誤的資訊！
			if (language.language) {
				language = language.language;
			} else if (language = language.API_URL
					.match(PATTERN_wiki_project_URL)) {
				// 去掉 '.org' 之類。
				language = language[3];
			}
		}
		if (false)
			library_namespace.debug('language: ' + options + '→'
					+ language_to_project(language || options), 3,
					'wikidata_get_site');
		return language_to_project(language || options);
	}

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
			var label = labels[language || default_language];
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
			var link = sitelinks[language_to_project(language)];
			if (link)
				return link.title;
			if (!language) {
				link = [];
				for (language in sitelinks) {
					link.push(sitelinks[language].title);
				}
				return link;
			}
		}
	}

	// wikidata_search_cache[{String}"性質"] = {String}"P31";
	var wikidata_search_cache = library_namespace.null_Object();

	function get_data_API_URL(options, default_API_URL) {
		if (!options) {
			return;
		}
		var session = options[SESSION_KEY];
		if (session) {
			return session.data_session ? session.data_session.API_URL
					: session.API_URL;
		}
		return options.API_URL || default_API_URL || wikidata_API_URL;
	}

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
	 *            entity id. 欲取得之特定實體id。 e.g., 'Q1', 'P6'
	 * @param {String}[property]
	 *            取得特定屬性值。
	 * @param {Function}[callback]
	 *            回調函數。 callback(轉成JavaScript的值)
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @see https://www.mediawiki.org/wiki/Wikibase/DataModel/JSON
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
		if (typeof property === 'string' && !/^P\d{1,10}$/.test(property)) {
			if (library_namespace.is_debug(2)
					&& /^(?:(?:info|sitelinks|sitelinks\/urls|aliases|labels|descriptions|claims|datatype)\|)+$/
							.test(property + '|'))
				library_namespace.warn(
				//
				'wikidata_entity: 您或許該採用 options.props = ' + property);
			/** {String}setup language of key and property name. 僅在需要 search 時使用。 */
			property = [ options.language || default_language, property ];
		}

		if (Array.isArray(property) && property.length === 2
		// for property =
		// [ {String}language, {String}title or {Array}titles ]
		&& /^[a-z]{2,3}$/i.test(property[0])) {
			// TODO: property 可能是 [ language code, 'labels|aliases' ] 之類。
			// property.join(':')
			var property_title = property[0] + ':' + property[1];
			if (property_title in wikidata_search_cache) {
				// has cache.
				property = wikidata_search_cache[property_title];

			} else {
				wikidata_search(property, function(id) {
					library_namespace.debug(
					//
					'property ' + id + ' ← [' + property_title + ']', 1,
							'wikidata_entity');
					// cache
					wikidata_search_cache[property_title] = id;
					wikidata_entity(key, id, callback, options);
				}, {
					API_URL : API_URL,
					type : 'property',
					get_id : true,
					limit : 1
				});
				// Waiting for conversion
				return;
			}
		}

		// ----------------------------
		// convert key: title to id
		if (typeof key === 'number')
			key = [ key ];
		else if (typeof key === 'string'
				&& !/^[PQ]\d{1,10}(\|[PQ]\d{1,10})*$/.test(key))
			/** {String}setup language of key and property name. 僅在需要 search 時使用。 */
			key = [ options.language || default_language, key ];

		if (Array.isArray(key)) {
			if (Array.isArray(key) && key.length === 2
			// for key = [ {String}language, {String}title or {Array}titles ]
			&& /^[a-z\-\d]{2,20}$/i.test(key[0])) {
				wikidata_search(key, function(id) {
					if (id) {
						library_namespace.debug(
						//
						'entity ' + id + ' ← [[:' + key.join(':') + ']]', 1,
								'wikidata_entity');
						wikidata_entity(id, property, callback, options);
						return;
					}

					// 可能為重定向頁面？
					wiki_API.page(key.clone(), function(page_data) {
						var content = get_page_content(page_data),
						// 測試檢查是否為重定向頁面。
						redirect = parse_redirect(content);
						if (redirect) {
							library_namespace.info(
							//
							'wikidata_entity: 處理重定向頁面: [[:' + key.join(':')
									+ ']] → [[:' + key[0] + ':' + redirect
									+ ']]。');
							wikidata_entity([ key[0],
							// normalize_page_name():
							// 此 API 無法自動轉換首字大小寫之類！因此需要自行正規化。
							normalize_page_name(redirect) ], property,
									callback, options);
							return;
						}

						library_namespace.err(
						//
						'wikidata_entity: Wikidata 不存在 [[:' + key.join(':')
								+ ']] 之數據，' + (content ? '但' : '且不')
								+ '存在此 Wikipedia 頁面。無法處理此 Wikidata 數據要求。');
						callback(undefined, 'no_key');
					});

				}, {
					API_URL : API_URL,
					get_id : true,
					limit : 1
				});
				// Waiting for conversion
				return;
			}
			key = key.map(function(id) {
				if (/^[PQ]\d{1,10}$/.test(id))
					return id;
				if (library_namespace.is_digits(id))
					return 'Q' + id;
				library_namespace.warn('wikidata_entity: Invalid id: ' + id);
				return '';
			}).join('|');
		}

		// ----------------------------

		if (!key) {
			library_namespace.err('wikidata_entity: 未設定欲取得之特定實體id。');
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
		// 不採用 get_page_content.is_page_data(key)
		// 以允許自行設定 {title:title,language:language}。
		if (key.title) {
			action = 'sites='
					+ (key.language && language_to_project(key.language) || wikidata_get_site(options))
					+ '&titles=' + encodeURIComponent(key.title);
		} else {
			action = 'ids=' + key;
		}
		library_namespace.debug('action: [' + action + ']', 2,
				'wikidata_entity');
		action = [ API_URL, 'wbgetentities&' + action ];

		if (property && !options.props)
			options.props = 'claims';
		var props = options.props;
		if (Array.isArray(props)) {
			props = props.join('|');
		}
		if (props) {
			// retrieve properties. 僅擷取這些屬性。
			action[1] += '&props=' + props;
			if (props.includes('|'))
				// 對於多種屬性，不特別取之。
				props = null;
		}
		if (options.languages)
			// retrieve languages, language to callback. 僅擷取這些語言。
			action[1] += '&languages=' + options.languages;

		// console.log(action);
		// console.log(arguments);
		// TODO:
		wiki_API.query(action, function(data) {
			var error = data && data.error;
			// 檢查伺服器回應是否有錯誤資訊。
			if (error) {
				if (error.code === 'param-missing') {
					library_namespace.err(
					/**
					 * 可能是錯把 "category" 之類當作 sites name??
					 * 
					 * wikidata_entity: [param-missing] A parameter that is
					 * required was missing. (Either provide the item "ids" or
					 * pairs of "sites" and "titles" for corresponding pages)
					 */
					'wikidata_entity: 未設定欲取得之特定實體id。請確定您的要求，尤其是 sites 存在: '
							+ decodeURI(action[0]));
				} else {
					library_namespace.err('wikidata_entity: ['
					//
					+ error.code + '] ' + error.info);
				}
				callback(undefined, error);
				return;
			}

			// data:
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
					}
				}
			}

			if (property = data) {
				property = data.claims
				//
				? data.claims[property] : data[property];
			}
			if (property) {
				wikidata_datavalue(property, callback, options);
			} else {
				callback(data);
			}
		}, null, options);
	}

	// is Q4167410: Wikimedia disambiguation page 維基媒體消歧義頁
	// CeL.wiki.data.is_DAB(entity)
	function is_DAB(entity, callback) {
		var property = entity && entity.claims && entity.claims.P31;
		if (property && wikidata_datavalue(property) === 'Q4167410') {
			if (callback)
				callback(true, entity);
			else
				return true;
		}
		if (!callback)
			return;

		// wikidata 的 item 或 Q4167410 需要手動加入，非自動連結。
		// 因此不能光靠 Q4167410 準確判定是否為消歧義頁。其他屬性相同。
		// 準確判定得自行檢查原維基之資訊，例如檢查 action=query&prop=info。

		// 基本上只有 Q(entity, 可連結 wikipedia page) 與 P(entity 的屬性) 之分。
		// 再把各 wikipedia page 手動加入 entity 之 sitelink。

		// TODO: 檢查 [[Category:All disambiguation pages]]

		// TODO: 檢查標題是否有 "(消歧義)" 之類。

		// TODO: 檢查
		// https://en.wikipedia.org/w/api.php?action=query&titles=title&prop=pageprops
		// 看看是否 ('disambiguation' in page_data.pageprops)；
		// 這方法即使在 wikipedia 沒 entity 時依然有效。
		callback(null, entity);
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
		is_DAB : is_DAB
	});

	// ------------------------------------------------------------------------

	/**
	 * Creates or modifies Wikibase entity. 創建或編輯Wikidata實體。
	 * 
	 * 注意: 若是本來已有某個值（例如 label），採用 add 會被取代。或須偵測並避免更動原有值。
	 * 
	 * @example<code>

	wiki = Wiki(true, 'test.wikidata');
	// TODO:
	wiki.page('宇宙').data(function(entity){result=entity;console.log(entity);}).edit(function(){return '';}).edit_data(function(){return {};});
	wiki.page('宇宙').edit_data(function(entity){result=entity;console.log(entity);});

	</code>
	 * 
	 * @param {String|Array}id
	 *            id to modify or entity you want to create.<br />
	 *            item/property 將會創建實體。
	 * @param {Object|Function}data
	 *            used as the data source to modify. 要編輯（更改或創建）的資料。<br />
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
	 *      Bots should add instance of (P31 性質) or subclass of (P279 上一級分類) or
	 *      part of (P361 屬於) if possible<br />
	 *      Bots importing from Wikipedia should add in addition to imported
	 *      from (P143) also reference URL (P854) with the value of the full URL
	 *      and either retrieved (P813) or include the version id of the source
	 *      page in the full URL.
	 * 
	 */
	function wikidata_edit(id, data, token, options, callback) {
		if (typeof options === 'function' && !callback) {
			// shift arguments.
			callback = options;
			options = null;
		}

		if (!library_namespace.is_Object(options))
			// 前置處理。
			options = library_namespace.null_Object();

		if (!id && !options['new']) {
			callback(undefined, {
				code : 'no_id',
				message : 'Did not set id! 未設定欲取得之特定實體id。'
			});
			return;
		}

		if (typeof data === 'function') {
			if (is_entity(id)) {
				library_namespace.debug('餵給(回傳要編輯資料的)設定值函數 ' + id.id + ' ('
						+ (get_entity_label(id) || get_entity_link(id)) + ')。',
						2, 'wikidata_edit');
				// .call(options,): 使(回傳要編輯資料的)設定值函數能即時變更 options。
				data = data.call(options, id);

			} else {
				wikidata_entity(id, options.props, function(entity) {
					if (entity && ('missing' in entity)) {
						// TODO
					}
					delete options.props;
					delete options.languages;
					wikidata_edit(id,
					// .call(options,): 使(回傳要編輯資料的)設定值函數能即時變更 options。
					data.call(options, entity), token, options, callback);
				}, options);
				return;
			}
		}

		if (is_entity(id)) {
			// 輸入 id 為實體項目 entity
			if (!options.baserevid) {
				// 檢測編輯衝突用。
				options.baserevid = id.lastrevid;
			}
			id = id.id;
		}

		var action = wiki_API.edit.check_data(data, id, 'wikidata_edit');
		if (action) {
			callback(id, action);
			return;
		}

		if (!id) {
			if (!options['new'])
				library_namespace
						.debug('未設定 id，您可能需要手動檢查。', 2, 'wikidata_edit');

		} else if (is_entity(id)
		// && /^Q\d{1,10}$/.test(id.id)
		) {
			options.id = id.id;

		} else if (get_page_content.is_page_data(id)) {
			options.site = wikidata_get_site(options);
			options.title = encodeURIComponent(id.title);

		} else if (id === 'item' || id === 'property') {
			options['new'] = id;

		} else if (/^Q\d{1,10}$/.test(id)) {
			// e.g., 'Q1'
			options.id = id;

		} else if (Array.isArray(id) && id.length === 2
		// for id = [ {String}language/site, {String}title ]
		&& /^[a-z]{2,20}$/i.test(id[0])) {
			options.site = language_to_project(id[0]);
			options.title = id[1];

		} else {
			library_namespace.warn('wikidata_edit: Invalid id: ' + id);
		}

		var session;
		if ('session' in options) {
			session = options[SESSION_KEY];
			delete options[SESSION_KEY];
		}

		// TODO: 創建Wikibase陳述。
		// https://www.wikidata.org/w/api.php?action=help&modules=wbcreateclaim
		// TODO: 創建實體項目重定向。
		// https://www.wikidata.org/w/api.php?action=help&modules=wbcreateredirect

		// edit實體項目entity
		action = [
		// https://www.wikidata.org/w/api.php?action=help&modules=wbeditentity
		get_data_API_URL(options), 'wbeditentity' ];

		// 還存在此項可能會被匯入 query 中。但須注意刪掉後未來將不能再被利用！
		delete options.API_URL;

		options.data = JSON.stringify(data);

		// the token should be sent as the last parameter.
		options.token = library_namespace.is_Object(token) ? token.csrftoken
				: token;

		wiki_API.query(action, function(data) {
			var error = data && data.error;
			// 檢查伺服器回應是否有錯誤資訊。
			if (error) {
				library_namespace.err(
				// e.g., 數據庫被禁止寫入以進行維護，所以您目前將無法保存您所作的編輯
				// Mediawiki is in read-only mode during maintenance
				'wikidata_edit: ' + (options.id ? options.id + ': ' : '')
				// [readonly] The wiki is currently in read-only mode
				+ '[' + error.code + '] ' + error.info);
				callback(undefined, error);
				return;
			}

			if (data.entity)
				data = data.entity;
			callback(data);
		}, options, session);
	}

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

	// common characters. 不能用來判別語言的泛用符號/字元。應該是英語也能接受的符號。
	// Øω…～Ⅱ“”·
	// [[:en:Chùa Báo Quốc]]
	// {{tsl|ja|オメガクインテット|*ω*Quintet}}
	// {{tsl|en|Tamara de Lempicka|Tamara Łempicka}}
	// {{link-en|Željko Ivanek|Zeljko Ivanek}}
	var PATTERN_common_characters = /[\s\d_,.:;'"!()\-+\&<>\\\/\?–`@#$%^&*=~×☆★♪♫♬♩○●©®℗™℠]+/g,
	// non-Chinese / non-CJK: 必須置於所有非中日韓語言之後測試!!
	// 2E80-2EFF 中日韓漢字部首補充 CJK Radicals Supplement
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
		// 'áéíñóúü'.toLowerCase().split('').sort().uniq().join('')
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
		if (add_to_list)
			add_to_list.push(label);
		return label;
	};

	/**
	 * 當想把 labels 加入 entity 時，輸入之則可自動去除重複的 labels，並回傳 wikidata_edit() 可用的編輯資料。
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
			// library_namespace.null_Object();
			data = {
			// labels : [],
			// aliases : []
			};
		}

		var count = 0;
		// excludes existing label or alias. 去除已存在的 label/alias。
		for ( var language in labels) {
			if (!Array.isArray(labels[language])) {
				if (labels[language])
					;
				library_namespace.warn('wikidata_edit.add_labels: language ['
						+ language + '] is not Array: ('
						+ (typeof labels[language]) + ')' + labels[language]);
				continue;
			}

			// TODO: 提高效率。
			var alias = entity_labels_and_aliases(entity, language, data_alias),
			/** {Boolean}此語言是否有此label */
			has_this_language_label = undefined,
			/** {Array}本次 labels[language] 已添加之 label list */
			new_alias = undefined,
			//
			matched = language.match(/^([a-z]{2,3})-/);

			if (matched) {
				// 若是要添加 'zh-tw'，則應該順便檢查 'zh'。
				entity_labels_and_aliases(entity, matched[1], alias);
			}

			labels[language]
			// 確保 "title" 在 "title (type)" 之前。
			.sort()
			// 避免要添加的 labels[language] 本身即有重複。
			.uniq()
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

				if (alias.includes(label)
				// 當已有 "title" 時，不添加 "title (type)"。
				|| label_without_type && (alias.includes(label_without_type)
				// assert: !new_alias.includes(label)，已被 .uniq() 除去。
				|| new_alias && new_alias.includes(label_without_type))) {
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

	// 要合併自的ID
	// 要合併到的ID
	// 要忽略衝突的項的元素數組，只能包含值“description”和/或“sitelink”和/或“statement”。
	// 多值 (以 | 分隔)：description、sitelink、statement
	// 網站鏈接和描述
	// TODO: wikidata_merge([to, from1, from2], ...)
	function wikidata_merge(to, from, token, options, callback) {
		if (!/^Q\d{1,10}$/.test(to)) {
			wikidata_entity(to, function(entity) {
				wikidata_merge(entity.id, from, callback, options);
			});
			return;
		}

		if (!/^Q\d{1,10}$/.test(from)) {
			wikidata_entity(from, function(entity) {
				wikidata_merge(to, entity.id, callback, options);
			});
			return;
		}

		// 正規化並提供可隨意改變的同內容參數，以避免修改或覆蓋附加參數。
		options = library_namespace.new_options(options);

		var ignoreconflicts = 'ignoreconflicts' in options ? options.ignoreconflicts
				// 最常使用的功能是合併2頁面。可忽略任何衝突的 description, statement。
				// https://www.wikidata.org/wiki/Help:Statements
				: 'description';

		var session;
		if ('session' in options) {
			session = options[SESSION_KEY];
			delete options[SESSION_KEY];
		}

		var action = 'wbmergeitems&fromid=' + from + '&toid=' + to;
		if (ignoreconflicts)
			action += '&ignoreconflicts=' + ignoreconflicts;

		action = [
		// 合併重複項。
		// https://www.wikidata.org/w/api.php?action=help&modules=wbmergeitems
		get_data_API_URL(options), action ];

		// the token should be sent as the last parameter.
		options.token = library_namespace.is_Object(token) ? token.csrftoken
				: token;

		wiki_API.query(action, function(data) {
			var error = data && data.error;
			// 檢查伺服器回應是否有錯誤資訊。
			if (error) {
				library_namespace.err('wikidata_merge: ['
				// [failed-modify] Attempted modification of the item failed.
				// (Conflicting descriptions for language zh)
				+ error.code + '] ' + error.info);
				callback(undefined, error);
				return;
			}

			// Will create redirection.
			// 此 wbmergeitems 之回傳 data 不包含 item 資訊。
			// data =
			// {"success":1,"redirected":1,"from":{"id":"Q1","type":"item","lastrevid":1},"to":{"id":"Q2","type":"item","lastrevid":2}}
			// {"success":1,"redirected":0,"from":{"id":"Q1","type":"item","lastrevid":1},"to":{"id":"Q2","type":"item","lastrevid":2}}
			callback(data);
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
	 *            回調函數。 callback(轉成JavaScript的值. e.g., {Array}list)
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
			data = JSON.parse(data.responseText);
			var items = data.items;
			if (!items || options && options.get_id) {
				callback(data.status);
				return;
			}
			if (items.length > 50) {
				// 上限值為 50 (機器人為 500)。
				library_namespace.debug('wikidata_query: Get ' + items.length
						+ ' items, more than 50.');
				var session = options && options[SESSION_KEY];
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

	/**
	 * 查詢 Wikidata Query Service (SPARQL)。
	 * 
	 * @example<code>

	CeL.wiki.SPARQL('SELECT ?item ?itemLabel WHERE { ?item wdt:P31 wd:Q146 . SERVICE wikibase:label { bd:serviceParam wikibase:language "en" } }', function(list) {result=list;console.log(list);})

	</code>
	 * 
	 * @param {String}query
	 *            查詢語句。
	 * @param {Function}[callback]
	 *            回調函數。 callback(轉成JavaScript的值. e.g., {Array}list)
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @see https://www.mediawiki.org/wiki/Wikidata_query_service/User_Manual
	 *      https://www.wikidata.org/wiki/Wikidata:Data_access#SPARQL_endpoints
	 */
	function wikidata_SPARQL(query, callback, options) {
		var action = [ options && options.API_URL || wikidata_SPARQL_API_URL,
				'?query=', encodeURIComponent(query), '&format=json' ];

		get_URL(action.join(''), function(data) {
			data = JSON.parse(data.responseText);
			var items = data.results;
			if (!items || !Array.isArray(items = items.bindings)) {
				callback(data);
				return;
			}
			callback(items);
		});
	}

	// --------------------------------------------------------------------------------------------

	// export 導出.
	Object.assign(wiki_API, {
		api_URL : api_URL,
		set_language : set_default_language,
		LTR_SCRIPTS : LTR_SCRIPTS,
		PATTERN_LTR : PATTERN_LTR,
		PATTERN_common_characters : PATTERN_common_characters,

		namespace : get_namespace,
		remove_namespace : remove_namespace,

		file_pattern : file_pattern,

		parse : parse_wikitext,
		parser : page_parser,

		/** constant 中途跳出作業用。 */
		quit_operation : {},

		is_page_data : get_page_content.is_page_data,
		is_entity : is_entity,

		title_of : get_page_title,
		content_of : get_page_content,
		normalize_title : normalize_page_name,
		normalize_title_pattern : normalize_name_pattern,
		get_hash : list_to_hash,
		uniq_list : unique_list,

		parse_dump_xml : parse_dump_xml,
		traversal : traversal_pages,

		Flow : Flow_info,

		guess_language : guess_language,

		data : wikidata_entity,
		edit_data : wikidata_edit,
		merge_data : wikidata_merge,
		wdq : wikidata_query,
		SPARQL : wikidata_SPARQL
	});

	return wiki_API;
}
