/**
 * @name CeL function for MediaWiki (Wikipedia / 維基百科): basic 工具函數, namespace,
 *       site configuration
 * 
 * @fileoverview 本檔案包含了 MediaWiki 自動化作業用程式庫的子程式庫。
 * 
 * TODO:<code>


</code>
 * 
 * @since 2020/5/24 6:21:13 拆分自 CeL.application.net.wiki
 */

// More examples: see /_test suite/test.js
// Wikipedia bots demo: https://github.com/kanasimi/wikibot
'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.wiki.namespace',

	require : 'data.native.'
	// for library_namespace.get_URL
	// + '|application.net.Ajax.'
	// for library_namespace.URI()
	+ '|application.net.'

	// CeL.DOM.HTML_to_Unicode(), CeL.DOM.Unicode_to_HTML()
	+ '|interact.DOM.'
	// setup module namespace
	+ '|application.net.wiki.',

	// 設定不匯出的子函式。
	no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring
	var wiki_API = library_namespace.application.net.wiki;

	var gettext = library_namespace.cache_gettext(function(_) {
		gettext = _;
	});

	// --------------------------------------------------------------------------------------------

	wiki_API.general_parameters = {
		format : 'json',
		// https://www.mediawiki.org/w/api.php?action=help&modules=json
		// 加上 "&utf8", "&utf8=1" 可能會導致把某些 link 中 URL 編碼也給 unescape 的情況！
		utf8 : 1
	};
	// 設定可被匯入 general_parameters 的屬性。
	wiki_API.general_parameters_normalizer = {
		// for cross-domain AJAX request (CORS)
		origin : function(value) {
			if (value === true)
				value = '*';
			return value;
		},

		format : 'string',
		utf8 : 'boolean|number|string'
	};

	// CeL.wiki.KEY_SESSION
	/** {String}KEY_wiki_session old key: 'wiki' */
	var KEY_SESSION = 'session', KEY_HOST_SESSION = 'host';

	// @inner TODO: MUST re-design
	function get_wikimedia_project_name(session) {
		return wiki_API.is_wiki_API(session)
		// e.g., commons, wikidata
		&& session.family === 'wikimedia'
		// https://meta.wikimedia.org/wiki/Special:SiteMatrix
		// TODO: using session.project_name or something others
		// using get_first_domain_name_of_session()
		&& session.language;
	}

	// https://meta.wikimedia.org/wiki/Help:Page_name#Special_characters
	// @see $wgLegalTitleChars
	var PATTERN_invalid_page_name_characters = /[{}\[\]\|<>\t\n#�]/,
	// https://en.wikipedia.org/wiki/Wikipedia:Naming_conventions_(technical_restrictions)#Forbidden_characters
	PATTERN_page_name = /((?:&#(?:\d{1,8}|x[\da-fA-F]{1,8});|[^{}\[\]\|<>\t\n#�])+)/,
	/**
	 * {RegExp}wikilink內部連結的匹配模式v2 [ all_link, page_and_anchor, page_name,
	 * anchor / section_title, pipe_separator, displayed_text ]
	 * 
	 * 頁面標題不可包含無效的字元：PATTERN_invalid_page_name_characters，<br />
	 * 經測試 anchor 亦不可包含[\n\[\]{}]，但 display text 表達文字可以包含 [\n]
	 * 
	 * @see PATTERN_link
	 */
	PATTERN_wikilink = /\[\[(((?:&#(?:\d{1,8}|x[\da-fA-F]{1,8});|[^{}\[\]\|<>\t\n#�])+)(#(?:-{[^\[\]{}\t\n\|]+}-|[^\[\]{}\t\n\|]+)?)?|#[^\[\]{}\t\n\|]*)(?:(\||{{\s*!\s*}})([\s\S]+?))?\]\]/,
	//
	PATTERN_wikilink_global = new RegExp(PATTERN_wikilink.source, 'g');

	var
	/**
	 * 匹配URL網址。
	 * 
	 * [http://...]<br />
	 * {{|url=http://...}}
	 * 
	 * matched: [ URL ]
	 * 
	 * TODO: "https://[2001:db8:85a3:8d3:1319:8a2e:370:7348]:443/",
	 * "{{t0|urn:0{{t1|urn:1}}}}"
	 * 
	 * @deprecated Use `PATTERN_URL_WITH_PROTOCOL_GLOBAL` instead.
	 * 
	 * @see https://github.com/5j9/wikitextparser/blob/master/tests/wikitext/test_external_links.py
	 *      https://en.wikipedia.org/wiki/IPv6_address#Literal_IPv6_addresses_in_network_resource_identifiers
	 * 
	 * @type {RegExp}
	 * 
	 * @see PATTERN_URL_GLOBAL, PATTERN_URL_WITH_PROTOCOL_GLOBAL,
	 *      PATTERN_URL_prefix, PATTERN_WIKI_URL, PATTERN_wiki_project_URL,
	 *      PATTERN_external_link_global
	 */
	// PATTERN_URL_GLOBAL = /(?:https?:)?\/\/(?:[^\s\|<>\[\]{}]+|{[^{}]*})+/ig,
	/**
	 * 匹配URL網址，僅用於 parse_wikitext()。
	 * 
	 * matched: [ all, previous, URL, protocol with "://", URL_others ]
	 * 
	 * @type {RegExp}
	 * 
	 * @see https://en.wikipedia.org/wiki/Help:URL#Fixing_links_with_unsupported_characters
	 *      https://en.wikipedia.org/wiki/IPv6_address#Literal_IPv6_addresses_in_network_resource_identifiers
	 * 
	 * @see PATTERN_URL_GLOBAL, PATTERN_URL_WITH_PROTOCOL_GLOBAL,
	 *      PATTERN_URL_prefix, PATTERN_WIKI_URL, PATTERN_wiki_project_URL,
	 *      PATTERN_external_link_global
	 */
	PATTERN_URL_WITH_PROTOCOL_GLOBAL
	// 警告: PATTERN_external_link_global 會用到 '):)'
	= /(^|[^a-z\d_])(((?:https?|ssh|telnet|ftps?|sftp|gopher|ircs?|news|nntp|worldwind|svn|git|mms):?\/\/|(?:mailto|urn):)((?:\[[a-f\d:]+\]|[^\s\|<>\[\]\/])[^\s\|<>\[\]]*))/ig;

	/**
	 * 匹配以URL網址起始。
	 * 
	 * matched: [ prefix ]
	 * 
	 * @type {RegExp}
	 * 
	 * @see PATTERN_URL_GLOBAL, PATTERN_URL_WITH_PROTOCOL_GLOBAL,
	 *      PATTERN_URL_prefix, PATTERN_WIKI_URL, PATTERN_wiki_project_URL,
	 *      PATTERN_external_link_global
	 */
	var PATTERN_URL_prefix = new RegExp(PATTERN_URL_WITH_PROTOCOL_GLOBAL.source
			.replace(/^\([^()]+\)/, '(^)'), 'i');

	// 嘗試從 options 取得 API_URL。
	function API_URL_of_options(options) {
		// library_namespace.debug('options:', 0, 'API_URL_of_options');
		// console.log(options);
		var session = session_of_options(options);
		if (session) {
			return session.API_URL;
		}
	}

	/**
	 * 測試看看指定值是否為API語言以及頁面標題或者頁面。
	 * 
	 * @param value
	 *            value to test. 要測試的值。
	 * @param {Boolean|String}[type]
	 *            test type: true('simple'), 'language', 'URL'
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @returns {Boolean}value 為 [ {String}API_URL/language, {String}title or
	 *          {Object}page_data ]
	 */
	function is_api_and_title(value, type, options) {
		// console.trace(value);

		if (!Array.isArray(value) || value.length !== 2
		//
		|| get_page_content.is_page_data(value[0])) {
			// 若有必要設定，應使用 wiki_API.normalize_title_parameter(title, options)。
			// 此時不能改變傳入之 value 本身，亦不能僅測試是否有 API_URL。
			return false;
		}

		var API_URL = value[0];
		/** {Boolean|String} ignore API test, 'set': set API */
		var ignore_API_test;
		if (typeof options === 'object') {
			ignore_API_test = options.ignore_API_test;
		} else {
			ignore_API_test = options;
			options = null;
		}

		if (type === true) {
			// type === true: simple test, do not test more.
			return !API_URL || typeof API_URL === 'string';
		}

		var title = value[1];

		// test title: {String}title or {Object}page_data or {Array}titles
		if (!title || typeof title !== 'string'
		// value[1] 為 titles (page list)。
		&& !Array.isArray(title)
		// 為了預防輸入的是問題頁面。
		&& !get_page_content.is_page_data(title)
		// 處理 is_id。
		&& (!(title > 0)
		// 注意：這情況下即使是{Natural}page_id 也會pass!
		|| !options || !options.is_id)) {
			library_namespace.debug('輸入的是問題頁面 title: ' + title, 2,
					'is_api_and_title');
			return false;
		}

		// test API_URL: {String}API_URL/language
		if (!API_URL) {
			if (options) {
				library_namespace.debug('嘗試從 options[KEY_SESSION] 取得 API_URL。',
						2, 'is_api_and_title');
				// console.log(options);
				// console.log(API_URL_of_options(options));

				API_URL = API_URL_of_options(options);
				if (API_URL) {
					value[0] = API_URL;
				}
				// 接下來繼續檢查 API_URL。
			} else {
				return !!ignore_API_test;
			}
		}

		if (typeof API_URL !== 'string') {
			// 若是未設定 action[0]，則將在 wiki_API.query() 補設定。
			// 因此若為 undefined || null，此處先不回傳錯誤。
			return !API_URL;
		}

		// for property = [ {String}language, {String}title or {Array}titles ]
		if (type === 'language') {
			var metched = PATTERN_PROJECT_CODE_i.test(API_URL);
			if (options && options.multi === false) {
				// 明確指定 `title` 為單一標題，{Array} 只能解釋為 [ language, title ]。
				if (!metched) {
					library_namespace.warn('is_api_and_title: 強制將 "' + API_URL
							+ '" 視為語言代碼 [' + value + ']');
				}
				return true;
			}
			return metched;
		}

		// 處理 [ {String}API_URL/language, {String}title or {Object}page_data ]
		var metched = PATTERN_URL_prefix.test(API_URL);
		if (type === 'URL') {
			return metched;
		}

		// for key = [ {String}language, {String}title or {Array}titles ]
		// for id = [ {String}language/site, {String}title ]
		return metched || PATTERN_PROJECT_CODE_i.test(API_URL);
	}

	/**
	 * 規範化 title_parameter
	 * 
	 * setup [ {String}API_URL, title ]
	 * 
	 * @param {String|Array}title
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @returns {Array}action = [ {String}API_URL, {Search_parameters}parameters ]
	 * 
	 * @see api_URL
	 */
	function normalize_title_parameter(title, options) {
		options = library_namespace.setup_options(options);
		var session = wiki_API.session_of_options(options);
		if (false && library_namespace.is_Set(title)) {
			title = Array.from(title);
		}
		var action = options.multi && Array.isArray(title)
				&& title.length === 2
				// 即便設定 options.multi，也不該有 /^https?:\/\/.+\.php/i 的標題。
				&& !/^https?:\/\/.+\.php$/.test(title[0])
				|| !is_api_and_title(title, true) ? [
				session && session.API_URL || undefined, title ]
		// title.clone(): 不改變原 title。
		: Array.isArray(title) ? title.clone() : [];

		if (false && library_namespace.is_Set(action[1])) {
			action[1] = Array.from(action[1]);
		}
		if (options.slice_size >= 1) {
			// console.trace(action);
			if (Array.isArray(action[1])) {
				if (action[1].length > options.slice_size) {
					var titles_left = action[1].splice(options.slice_size,
							action[1].length);
					if (Array.isArray(options.titles_left)) {
						Array.prototype.unshift.apply(options.titles_left,
								titles_left);
					} else {
						if (options.titles_left) {
							throw new Error(
							// Warning:
							'normalize_title_parameter: Invalid usage: options.titles_left is not {Array}!');
							titles_left.push(options.titles_left);
						}
						options.titles_left = titles_left;
						library_namespace
								.warn('normalize_title_parameter: 將 title list 切分成 slice: '
										+ action[1].length
										+ ' + '
										+ options.titles_left.length + '。');
					}
				}
			} else if (!action[1] && Array.isArray(options.titles_left)) {
				action[1] = options.titles_left.splice(0, options.slice_size);
				library_namespace
						.log('normalize_title_parameter: 接續取得 title list slice: '
								+ action[1].length
								+ ' + '
								+ options.titles_left.length + '。');
			}
		}
		if (Array.isArray(options.titles_left)
				&& options.titles_left.length === 0) {
			delete options.titles_left;
		}

		// console.trace([ title, action ]);
		if (!is_api_and_title(action, false, options)) {
			// console.trace('normalize_title_parameter: Invalid title!');
			library_namespace.warn([ 'normalize_title_parameter: ', {
				// gettext_config:{"id":"invalid-title-$1"}
				T : [ 'Invalid title: %1',
				//
				wiki_API.title_link_of(title)
				//
				|| '(title: ' + JSON.stringify(title) + ')' ]
			} ]);
			// console.trace(JSON.stringify(title));
			return;
		}

		// 處理 [ {String}API_URL, title ]
		action[1] = wiki_API.query.title_param(action[1],
		//
		'multi_param' in options ? options.multi_param
		// 'multi' in options
		: options.multi !== undefined ? options.multi : true, options.is_id);

		if (options.redirects) {
			// 舊版毋須 '&redirects=1'，'&redirects' 即可。
			action[1].redirects = 1;
		}

		// console.trace(action);
		return action;
	}

	/**
	 * set / append additional parameters of MediaWiki API.
	 * 
	 * @param {Array}action
	 * @param {Object}options
	 *            附加參數/設定選擇性/特殊功能與選項
	 * @inner
	 */
	function set_parameters(action, options) {
		if (!options.parameters) {
			return;
		}

		// Should use
		// `action = wiki_API.extract_parameters(options, action, true);`
		if (typeof action[1] === 'string' && !/^[a-z]+=/.test(action[1])) {
			library_namespace
					.warn('set_parameters: Did not set action! Will auto add "action=".');
			console.trace(action);
			action[1] = 'action=' + action[1];
		}
		// action[1] =
		// wiki_API.extract_parameters(options.parameters, action[1], true);
		action[1] = library_namespace.Search_parameters(action[1]);
		action[1].set_parameters(options.parameters);
	}

	// --------------------------------------------------------------------------------------------

	// 工具函數。

	// https://phabricator.wikimedia.org/rOPUP558bcc29adc3dd7dfebbc66c1bf88a54a8b09535#3ce6dc61
	// server:
	// (wikipedia|wikibooks|wikinews|wikiquote|wikisource|wikiversity|wikivoyage|wikidata|wikimediafoundation|wiktionary|mediawiki)

	// e.g., [[s:]], [[zh-classical:]], [[zh-min-nan:]], [[test2:]],
	// [[metawikipedia:]], [[betawikiversity:]]
	// @see [[m:Help:Interwiki linking#Project titles and shortcuts]],
	// [[:zh:Help:跨语言链接#出現在正文中的連結]]
	// https://www.wikidata.org/w/api.php?action=help&modules=wbsearchentities
	// 警告: 應配合 get_namespace.pattern 排除 'Talk', 'User', 'Help', 'File', ...
	var PATTERN_PROJECT_CODE = /^[a-z][a-z\d\-]{0,14}$/,
	// 須亦能匹配 site key:
	// https://www.wikidata.org/w/api.php?action=help&modules=wbgetentities
	PATTERN_PROJECT_CODE_i = new RegExp(PATTERN_PROJECT_CODE.source, 'i');

	// 可用來拆分 language, family。以防 incase wikt, wikisource
	// testwikidatawiki → [,testwikidata,wiki]
	// https://www.wikidata.org/w/api.php?action=help&modules=wbsearchentities
	// e.g., 'zh_min_nanwikibooks'
	// MariaDB [zhwiki_p]> SHOW DATABASES;
	// e.g., "wikimania2018wiki_p"
	// 2020/5 left:
	// ["centralauth_p","heartbeat_p","information_schema","information_schema_p","meta_p"]
	// [ all, language code, family ]
	var PATTERN_SITE = /^([a-z\d\_]{2,13})(wiki|wikibooks|wiktionary|wikiquote|wikisource|wikinews|wikiversity|wikivoyage|wikimedia)$/;

	/**
	 * Wikimedia projects 的 URL match pattern 匹配模式。
	 * 
	 * matched: [ 0: protocol + host name, 1: protocol, 2: host name,<br />
	 * 3: 第一 domain name (e.g., language code / project),<br />
	 * 4: 第二 domain name (e.g., family: 'wikipedia') ]
	 * 
	 * @deprecated using wiki_API.hostname_of_API_URL() or wiki_API.site_name()
	 * 
	 * @type {RegExp}
	 * 
	 * @see PATTERN_PROJECT_CODE
	 * @see PATTERN_URL_GLOBAL, PATTERN_URL_WITH_PROTOCOL_GLOBAL,
	 *      PATTERN_URL_prefix, PATTERN_WIKI_URL, PATTERN_wiki_project_URL,
	 *      PATTERN_external_link_global
	 */
	var PATTERN_wiki_project_URL = /^(https?:)?(?:\/\/)?(([a-z][a-z\d\-]{0,14})\.([a-z]+)+(?:\.[a-z]+)+)/i;

	// @see wiki_API.api_URL()
	function hostname_of_API_URL(API_URL) {
		if (!/\/api\.php$/.test(API_URL))
			return;
		var url = new library_namespace.URI(API_URL);
		return url && url.hostname;
	}

	/**
	 * Get the API URL of specified project.
	 * 
	 * project = language_code.family
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
	function api_URL(project, options) {
		if (!project) {
			var session = wiki_API.session_of_options(options);
			return session && session.API_URL || wiki_API.API_URL;
		}

		project = String(project);
		var lower_case = project.toLowerCase();
		if (lower_case in api_URL.alias) {
			project = api_URL.alias[lower_case];
		}
		library_namespace.debug('project: ' + project, 3, 'api_URL');
		// PATTERN_PROJECT_CODE_i.test(undefined) === true
		if (PATTERN_PROJECT_CODE_i.test(project)) {
			if (lower_case in api_URL.wikimedia) {
				project += '.wikimedia';
			} else if (lower_case in api_URL.family) {
				// (wiki_API.language || 'www') + '.' + project
				project = wiki_API.language + '.' + project;
			} else if (/wik[it]/i.test(project)) {
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
		// @see PATTERN_PROJECT_CODE
		if (/^[a-z][a-z\d\-]{0,14}\.[a-z]+$/i.test(project)) {
			// e.g., 'en.wikisource', 'en.wiktionary'
			project += '.org';
		}

		// console.trace([ wiki_API.API_URL, project ]);
		var url = new library_namespace.URI(project,
		//
		/:\/\//.test(wiki_API.API_URL) && wiki_API.API_URL);
		if (url && url.hostname) {
			// 先測試是否為自訂 API。
			return /\/api\.php$/.test(project) ? project
			// e.g., '//zh.wikipedia.org/'
			// e.g., 'https://www.mediawiki.org/w/api.php'
			// e.g., 'https://www.mediawiki.org/wiki/'
			: (url.protocol || api_URL.default_protocol || 'https:') + '//'
					+ url.hostname + '/w/api.php';
		}

		library_namespace.error('api_URL: Unknown project: [' + project
				+ ']! Using default API URL.');
		return wiki_API.API_URL;
	}

	// the key MUST in lower case!
	// @see https://www.wikimedia.org/
	// @see [[Special:Interwiki]] 跨維基資料 跨 wiki 字首
	api_URL.wikimedia = {
		meta : true,
		commons : true,
		species : true,
		incubator : true,

		// mul : true,
		phabricator : true,
		wikitech : true,
		// https://quarry.wmflabs.org/
		quarry : true,
		releases : true
	}
	// shortcut, namespace aliases.
	// the key MUST in lower case!
	// @see [[m:Help:Interwiki linking#Project titles and shortcuts]],
	// [[mw:Manual:InitialiseSettings.php]]
	// https://noc.wikimedia.org/conf/highlight.php?file=InitialiseSettings.php
	// [[:zh:Help:跨语言链接#出現在正文中的連結]]
	// @see [[Special:Interwiki]] 跨維基資料 跨 wiki 字首
	// @see two-letter project code shortcuts
	// [[m:Requests_for_comment/Set_short_project_namespace_aliases_by_default_globally]]

	api_URL.alias = {
		// project with language prefix
		// project: language.*.org
		w : 'wikipedia',
		n : 'wikinews',
		// 維基教科書
		b : 'wikibooks',
		q : 'wikiquote',
		s : 'wikisource',
		// 維基學院
		v : 'wikiversity',
		voy : 'wikivoyage',
		wikt : 'wiktionary',

		// project: *.wikimedia.org
		m : 'meta',
		// 這一項會自動判別語言。
		metawikipedia : 'meta',
		c : 'commons',
		wikispecies : 'species',
		phab : 'phabricator',
		download : 'releases',

		// project: www.*.org
		d : 'wikidata',
		mw : 'mediawiki',
		wmf : 'wikimedia',

		betawikiversity : 'beta.wikiversity'
	};
	// families must with language prefix
	// the key MUST in lower case!
	api_URL.family = 'wikipedia|wikibooks|wikinews|wikiquote|wikisource|wikiversity|wikivoyage|wiktionary'
			.split('|').to_hash();

	// api_URL.shortcut_of_project[project] = alias
	api_URL.shortcut_of_project = Object.create(null);
	Object.keys(api_URL.alias).forEach(function(shortcut) {
		api_URL.shortcut_of_project[api_URL.alias[shortcut]] = shortcut;
	});

	/**
	 * setup API URL.
	 * 
	 * @param {wiki_API}session
	 *            正作業中之 wiki_API instance。
	 * @param {String}[API_URL]
	 *            language code or API URL of MediaWiki project
	 * 
	 * @inner
	 */
	function setup_API_URL(session, API_URL) {
		library_namespace.debug('API_URL: ' + API_URL + ', default language: '
				+ wiki_API.language, 3, 'setup_API_URL');
		// console.log(session);
		// console.trace(wiki_API.language);
		if (API_URL === true) {
			// force to login.
			API_URL = session.API_URL || wiki_API.API_URL;
		}

		if (API_URL && typeof API_URL === 'string'
		// && wiki_API.is_wiki_API(session)
		) {
			session.API_URL = api_URL(API_URL);
			// remove cache
			delete session.last_page;
			delete session[KEY_HOST_SESSION];
			// force to login again: see wiki_API.login
			// 據測試，不同 projects 間之 token 不能通用。
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
					agent : agent,
					headers : Object.create(null)
				};
				if (false) {
					// set User-Agent to use:
					// Special:ApiFeatureUsage&wpagent=CeJS script_name
					wiki.get_URL_options.headers['User-Agent'] = library_namespace.get_URL.default_user_agent;
				}
			} else {
				// e.g., 老舊版本 or using XMLHttpRequest @ WWW
				session.get_URL_options = {};
			}

		}

		// TODO: 這只是簡陋的判別方法。
		var matched = wiki_API.site_name(session, {
			get_all_properties : true
		});
		// console.trace(matched);
		if (matched && (matched.family in api_URL.family)) {
			// e.g., "wikipedia"
			session.family = matched.family;
		}
	}

	// @see set_default_language(), language_to_site_name()
	function setup_API_language(session, language_code) {
		if (!language_code || typeof language_code !== 'string')
			return;

		language_code = language_code.toLowerCase();
		var site_name = wiki_API.site_name(language_code,
				add_session_to_options(session, {
					get_all_properties : true
				}));
		if (site_name && site_name.language
				&& site_name.language !== 'multilingual') {
			// e.g., API_URL=zh.wiktionary
			language_code = site_name.language;
		}

		if (PATTERN_PROJECT_CODE_i.test(language_code)
				// 不包括 test2.wikipedia.org 之類。
				&& !/^test|wik[it]/i.test(language_code)
				// 排除 'Talk', 'User', 'Help', 'File', ...
				&& !(session.configurations
				// ↑ session === wiki_API?
				&& session.configurations.namespace_pattern || get_namespace.pattern)
						.test(language_code)) {
			if (language_code === 'simple') {
				session.first_damain_name = language_code;
				// [[w:en:Basic English]]
				// language_code = 'en-basiceng';
				language_code = 'en';
			} else if (language_code in wiki_API.language_code_to_site_alias) {
				// e.g., 'cmn'
				language_code = wiki_API.language_code_to_site_alias[language_code];
			}

			// [[m:List of Wikipedias]]
			session.language
			// e.g., 'zh-classical', 'zh-yue', 'zh-min-nan'
			= language_code;
			site_name = wiki_API.site_name(session, {
				get_all_properties : true
			});
			// console.trace([ language_code, site_name ]);
			if (site_name.language === 'multilingual'
			// e.g., language_code === 'commons'
			&& language_code === site_name.project) {
				// default: English
				session.language = 'en';
			}
			site_name = site_name.site;
			var time_interval_config = wiki_API.query.edit_time_interval;
			// apply local lag interval rule.
			if (!(session.edit_time_interval >= 0)
					&& ((site_name in time_interval_config) || (language_code in time_interval_config))) {
				session.edit_time_interval = time_interval_config[site_name]
						|| time_interval_config[language_code];
				library_namespace.debug('Use interval '
						+ session.edit_time_interval + ' for language '
						+ language_code, 1, 'setup_API_language');
			}
		}
	}

	// --------------------------------------------------------------------------------------------

	// @inner
	function get_first_domain_name_of_session(session) {
		var first_damain_name;
		if (session) {
			first_damain_name =
			// e.g., 'simple'
			session.first_damain_name
			// assert: typeof session.API_URL === 'string'
			// 注意:在取得 page 後，中途更改過 API_URL 的話，session.language 會取得錯誤的資訊！
			|| session.language
			// 應該採用來自宿主 host session 的 language. @see setup_data_session()
			|| get_first_domain_name_of_session(session[KEY_HOST_SESSION]);
		}
		return first_damain_name;
	}

	// [[en:Help:Interwikimedia_links]] [[Special:Interwiki]]
	// https://zh.wikipedia.org/wiki/Special:GoToInterwiki/testwiki:
	// TODO: link prefix: e.g., 'zh:n:' for zh.wikinews
	// [[:phab:T102533]]
	// [[:gerrit:gitweb?p=mediawiki/core.git;a=blob;f=RELEASE-NOTES-1.23]]

	/**
	 * language code → Wikidata site code / Wikidata site name / Wikimedia
	 * project name. get_project()<br />
	 * 將語言代碼轉為 Wikidata API 可使用之 site name。 [[yue:]] → zh-yue → zh_yuewiki。 亦可自
	 * options 取得 wikidata API 所須之 site parameter。
	 * 
	 * @example<code>

	// e.g., 'enwiki', 'zhwiki', 'enwikinews'
	CeL.wiki.site_name(wiki)

	</code>
	 * 
	 * @param {String|wiki_API}language
	 *            語言代碼。 language / family / project code / session. default
	 *            language: wiki_API.language e.g., 'en', 'zh-classical', 'ja',
	 *            ...
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項<br />
	 *            options.get_all_properties: return
	 *            {language,family,site,API_URL}
	 * 
	 * @returns {String}wiki_project, Wikidata API 可使用之 site name parameter。
	 * 
	 * @see mediaWiki.config.get('wgWikiID')
	 *      https://www.mediawiki.org/wiki/ResourceLoader/Core_modules#mediaWiki.config
	 * @see set_default_language()
	 * @see [[:en:Help:Interwiki linking#Project titles and shortcuts]],
	 *      [[:zh:Help:跨语言链接#出現在正文中的連結]]
	 * @see [[meta:List of Wikimedia projects by size]]
	 * @see [[m:List of Wikipedias]] IETF language tag language code for
	 *      gettext()
	 * @see https://www.wikidata.org/w/api.php?action=help&modules=wbgetentities
	 * 
	 * @since 2017/9/4 20:57:8 整合原先的 language_to_project(),
	 *        language_to_site_name()
	 */
	function language_to_site_name(language, options) {
		// console.trace(language);
		var session;

		// 擷取出維基姊妹項目各種 type: 先要能擷取出 language code + family
		// types: 'API', 'db', 'site', 'link', 'dump', ...

		// 不能保證 wiki_API.is_wiki_API(language) → is_Object(language)，
		// 因此使用 typeof。
		if (language && (typeof language === 'object'
		// || language === wiki_API
		)) {
			// treat language as options with session.
			session = wiki_API.session_of_options(language);
			// options.language 較 session 的設定優先。
			// language.language
			language = get_first_domain_name_of_session(language)
			// wikidata 沒有 session.language，會用
			// session[KEY_HOST_SESSION].language。
			|| get_first_domain_name_of_session(session)
			// || language
			;
			if (false && typeof language === 'object')
				console.trace(language);
		} else if (typeof language === 'function') {
			throw new Error('Invalid type of language: ' + typeof language);
		}
		// console.log(session);
		// console.trace(session.family);

		/**
		 * Wikimedia project / family. e.g., wikipedia, wikinews, wiktionary.
		 * assert: family && /^wik[it][a-z]{0,9}$/.test(family)
		 * 
		 * @type {String}
		 */
		var family;
		/** {wiki_API}in what wiki session */
		var in_session;

		if (typeof options === 'string') {
			// shift arguments
			family = options;
			options = null;
		} else {
			in_session = wiki_API.session_of_options(options);
			family = options && options.family;
		}
		// console.trace(language);

		var page_name;
		var matched = typeof language === 'string' && !language.includes('://')
				&& language.match(/^[:\s]*(\w+):(?:(\w+):)?(.*)/);
		if (matched) {
			matched.family = api_URL.alias[matched[1]];
			page_name = matched[3];
			if (matched.family) {
				if (matched[2]) {
					// e.g., "n:zh:title"
					language = matched[2];
				} else {
					// e.g., "n:", "n:zh", "n:title"
					language = matched[3];
				}
			} else if (matched.family = api_URL.alias[matched[2]]) {
				// e.g., "zh:n:title"
				language = matched[1];
			} else {
				// e.g., "zh:title"
				language = matched[1];
			}
			family = family || matched.family;
		}
		// console.trace(language);

		matched = wiki_API.namespace(language, options);
		// console.trace([ matched, language ]);
		if (matched && !isNaN(matched)
		//
		&& (matched !== wiki_API.namespace.hash.project
		// e.g., 'wikidata'
		|| language.trim().toLowerCase() === 'project')) {
			// e.g., input "language" of [[Category:title]]
			// 光是只有 "Category"，代表還是在本 wiki 中，不算外語言。
			language = null;
		}
		// console.trace(language);
		// console.trace(in_session);

		// 正規化。
		language = String(language
		// || in_session && in_session.language
		|| get_first_domain_name_of_session(in_session)
		// else use default language
		// 警告: 若是沒有輸入，則會直接回傳預設的語言。因此您或許需要先檢測是不是設定了 language。
		|| wiki_API.language).trim().toLowerCase();
		// zh_yue → zh-yue
		language = language.replace(/[_ ]/g, '-');
		// console.trace(language);

		var API_URL;

		var interwiki_pattern = in_session && in_session.configurations
				&& in_session.configurations.interwiki_pattern;
		var interwikimap = library_namespace.is_RegExp(interwiki_pattern)
				&& in_session.latest_site_configurations
				&& in_session.latest_site_configurations.interwikimap;
		// console.trace([ interwiki_pattern, interwikimap ]);
		if (Array.isArray(interwikimap)) {
			matched = language.match(interwiki_pattern);
			if (matched && interwikimap.some(function(map) {
				if (map.prefix === matched[1]) {
					// console.log(map);
					// API_URL = map.url;
					return matched = map
					//
					.url.replace(/\/wiki\/\$1/, '/w/api.php')
					//
					.replace(/\$1/, '');
				}
			})) {
				language = matched;
			}
		} else if (language in language_code_to_site_alias) {
			// e.g., 'lzh' → 'zh-classical'
			language = language_code_to_site_alias[language];
		} else if (!family && session && !session.family
				&& !session[KEY_HOST_SESSION] && session.API_URL) {
			// e.g., API_URL: 'https://zh.moegirl.org.cn/api.php'
			// console.trace([ language, family ]);
			language = session.API_URL;
		}

		var site, project,
		// 是為猜測的語言。
		is_guessing_language;
		matched = language
		// e.g., 'zh-min-nan' → 'zh_min_nan'
		.replace(/-/g, '_')
		// 'zhwikinews' → zh.wikinews
		.match(PATTERN_SITE);
		if (matched) {
			language = matched[1];
			family = family || matched[2];

		} else if (matched = language.match(/^[a-z\d\-]{2,13}$/)) {
			// e.g., 'zh-classical', 'zh-min-nan'
			language = matched[0];
			if (language === 'wikidata') {
				family = language;
				language = 'www';
			}
			// console.trace([ language, family ]);

		} else if (matched = wiki_API.hostname_of_API_URL(language)) {
			// treat language as API_URL.
			API_URL = language;
			// console.trace(matched);
			// console.trace(session);
			library_namespace.debug(language, 4, 'language_to_site_name');
			if (library_namespace.is_IP(matched)) {
				// We cannot get information from IP.
				matched = [ matched.replace(/\./g, '_') ];
			} else {
				matched = matched.split('.');
				if (matched.length === 2) {
					// e.g., "lingualibre.org"
					matched.unshift('');
				}
			}
			/**
			 * 去掉 '.org' 之類。 language-code.wikipedia.org e.g.,
			 * zh-classical.wikipedia.org
			 */
			family = family || matched[1];
			// incase 'https://test.wikidata.org/w/api.php'
			language = !/^test|wik[it]/i.test(matched[0]) && matched[0];
			if (!language) {
				is_guessing_language = true;
				language = wiki_API.language;
			}

		} else if (matched = language.match(/^([a-z\d\-_]+)\.([a-z\d\-_]+)/)) {
			language = matched[1];
			family = family || matched[2];

		} else {
			library_namespace.error('language_to_site_name: Invalid language: '
					+ language);
			if (false) {
				console.trace([ language,
						wiki_API.hostname_of_API_URL(language), session,
						in_session ]);
			}
		}

		// console.trace(family);
		family = family || session && session.family || in_session
				&& in_session.family;
		// console.trace(family);
		if (!family || family === 'wiki')
			family = 'wikipedia';

		if (false) {
			console.trace([ API_URL, session && session.API_URL, language,
					family ]);
		}
		API_URL = API_URL || session && session.API_URL
				|| api_URL(language + '.' + family);
		// console.trace(API_URL);

		if (family === 'wikidata') {
			// wikidatawiki_p
			site = family + 'wiki';
		} else if (family === 'wikimedia' && language === 'en'
		//
		|| (site = API_URL.match(/\/\/([\w]+)\./))
		// e.g., API_URL === 'https://test.wikipedia.org/w/api.php'
		&& /^test/i.test(site = site[1])) {
			// e.g., @ console @ https://commons.wikimedia.org/
			project = site;
			// assert: (project in wiki_API.api_URL.wikimedia)

			// 'commonswiki'
			site += 'wiki';
		} else {
			site = is_guessing_language ? '' : language.toLowerCase().replace(
					/-/g, '_');
			// e.g., 'zh' + 'wikinews' → 'zhwikinews'
			site += (family === 'wikipedia'
			// using "commonswiki" instead of "commonswikimedia"
			|| (language in wiki_API.api_URL.wikimedia) ? 'wiki' : family);
		}
		// console.trace(site);
		library_namespace.debug(site, 3, 'language_to_site_name');

		project = project || language === 'www' ? family
				: language in wiki_API.api_URL.wikimedia ? language : null;
		if (project) {
			// e.g., get from API_URL
			// wikidata, commons: multilingual
			language = 'multilingual';
		} else {
			project = is_guessing_language ? family : language + '.' + family;
		}

		if (is_guessing_language && session && session.language) {
			language = session.language;
			is_guessing_language = false;
		}

		// throw site;
		if (options && options.get_all_properties) {
			var family_prefix = wiki_API.api_URL.shortcut_of_project[family];
			// for API_URL==="https://lingualibre.org/api.php",
			// is_guessing_language=true && family_prefix===undefined
			site = {
				// en, zh
				language : language,
				is_guessing_language : is_guessing_language,
				// family: 'wikipedia' (default), 'wikimedia',
				// wikibooks|wiktionary|wikiquote|wikisource|wikinews|wikiversity|wikivoyage
				family : family,
				family_prefix : family_prefix,
				// interwikimap prefix. 在像是 https://lingualibre.org/ 的情況下不設定
				interwiki_prefix : (is_guessing_language ? undefined
						: (family_prefix || family) + ':' + language + ':'),
				// Wikimedia project name: wikidata, commons, zh.wikipedia
				project : project,

				// wikidata API 所須之 site name parameter。 wikiID
				// site_namewiki for Wikidata API. e.g., zh-classical →
				// zh_classicalwiki

				// for database: e.g., zh-classical → zh_classicalwiki_p
				// e.g., 'zhwiki'. `.wikiid` @ siteinfo

				// Also for dump: e.g., 'zhwikinews'
				// https://dumps.wikimedia.org/backup-index.html

				// @see wikidatawiki_p.wb_items_per_site.ips_site_id
				// wikidatawiki, commonswiki, zhwiki
				site : site,
				// API URL (default): e.g.,
				// https://en.wikipedia.org/w/api.php
				// https://www.wikidata.org/w/api.php
				API_URL : API_URL
			};

			if (session
			// session === wiki_API?
			&& session.configurations
			// e.g., for Fandom sites
			&& session.configurations.sitename) {
				site.sitename = session.configurations.sitename;
			}
			if (session && session.site_name) {
				site.site_name = session.site_name;
			}

			var project = session && session.latest_site_configurations
					&& session.latest_site_configurations.general.wikiid;
			if (project) {
				site.wikiid = project;
			}
			if (page_name) {
				site.page_name = page_name;
			}
		}

		// assert: {String}site
		return session && session.site_name || site;
	}

	// --------------------------------------------------------------------------------------------

	/**
	 * get NO of namespace
	 * 
	 * 注意: [[d:Q1]], [[en:T]] 之 namespace 亦為 0。須採 session.is_article() 測試。
	 * 
	 * @param {String|Integer}namespace
	 *            namespace or page title
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @returns {Integer|String|Undefined}namespace NO.
	 */
	function get_namespace(namespace, options) {
		options = library_namespace.setup_options(options);
		var is_page_title = options.is_page_title;
		if (wiki_API.is_page_data(namespace)) {
			namespace = namespace.title;
			is_page_title = true;
		}
		if (!is_page_title && (namespace == Math.floor(namespace))) {
			if (options.get_name) {
				// e.g., `wiki.namespace(NS_Category, {get_name: true});`
				namespace = String(namespace);
			} else {
				// {Integer}namespace
				return namespace;
			}
		}
		var session = session_of_options(options);
		var namespace_hash = options.namespace_hash || session
		// session === wiki_API?
		&& session.configurations && session.configurations.namespace_hash
				|| get_namespace.hash;

		if (Array.isArray(namespace)) {
			namespace = namespace.join('|');
		}

		// console.log(namespace);
		if (typeof namespace === 'string') {
			var list = [];
			// e.g., 'main{{!}}template' → 'main|template'
			namespace = prefix_page_name(namespace)
			// e.g., 'User_talk' → 'User talk'
			.replace(/[\s_]+/g, ' ');
			(is_page_title ? [ namespace.toLowerCase() ]
			//
			: namespace.toLowerCase()
			// for ',Template,Category', ';Template;Category',
			// 'main|file|module|template|category|help|portal|プロジェクト'
			// https://www.mediawiki.org/w/api.php?action=help&modules=main#main.2Fdatatypes
			.split(/(?:[,;|\u001F]|%7C|%1F)/)).forEach(function(n) {
				if (is_page_title && n.startsWith(':')) {
					// e.g., [[:title]]
					n = n.slice(1);
				}
				if (false && n.startsWith(':')) {
					// Invalid page title / namespace
					list.push(undefined);
				}
				// get namespace `_n` only.
				// e.g., 'wikipedia:sandbox' → 'wikipedia'
				var _n = n.includes(':') ? n.replace(/:.*$/, '').trim()
				// e.g., get_namespace('Wikipedia', {...})
				: is_page_title ? 0 : n;
				if (!_n) {
					// _n === ''
					list.push(0);
					return;
				}
				if (!is_page_title && (!isNaN(_n)
				// 要指定所有值，請使用*。 To specify all values, use *.
				|| _n === '*')) {
					// {Integer}_n
					list.push(_n);
					return;
				}
				if (_n in namespace_hash) {
					list.push(namespace_hash[_n]);
					return;
				}
				if (is_page_title) {
					list.push(0);
					return;
				}
				if (namespace_hash === get_namespace.hash) {
					// console.trace(namespace);
					library_namespace.debug('Invalid namespace: ['
					//
					+ n + '] @ namespace list ' + namespace,
					//
					2, 'get_namespace');
					// console.trace(arguments);
				} else {
					list.push(is_page_title === false
					// main article space
					// is_page_title === false 亦即
					// options.is_namespace === true
					&& _n !== 'main' ? undefined : 0);
				}
			});
			if (list.length === 0) {
				return;
			}
			// list.sort().unique_sorted().join('|');
			list = list.unique();
			if (options.get_name) {
				var name_of_NO = options.name_of_NO || session
				// session === wiki_API?
				&& session.configurations && session.configurations.name_of_NO
						|| get_namespace.name_of_NO;
				list = list.map(function(namespace_NO) {
					return namespace_NO in name_of_NO
					//
					? name_of_NO[namespace_NO] : namespace_NO;
				});
			}
			return list.length === 1 ? list[0] : list.join('|');
		}

		if (namespace) {
			library_namespace.warn('get_namespace: Invalid namespace: ['
					+ namespace + ']');
			// console.trace(arguments);
		}
		return;
	}

	/**
	 * The namespace number of the page. 列舉型別 (enumeration)
	 * 
	 * assert: 正規名稱必須擺在最後一個，供 function namespace_text_of_NO() 使用。
	 * 
	 * CeL.wiki.namespace.hash
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
		// 條目 条目 entry 文章 article: ns = 0, 頁面 page: ns = any. 章節/段落 section
		main : 0,
		'' : 0,
		// 討論對話頁面
		talk : 1,

		// 使用者頁面
		user : 2,
		'user talk' : 3,

		// ----------------------------

		// NS_PROJECT
		// the project namespace for matters about the project
		// Varies between wikis
		project : 4,

		// https://meta.wikimedia.org/wiki/Requests_for_comment/Set_short_project_namespace_aliases_by_default_globally
		// [[w:ja:Wikipedia:バグの報告#WPショートカットが機能しない]]
		// [[phab:rOMWCa30603ab09d162fd30ff4081f85054df81a0ae49]]
		// https://noc.wikimedia.org/conf/highlight.php?file=InitialiseSettings.php
		wp : 4,
		wb : 4,
		wv : 4,
		ws : 4,
		wn : 4,
		wq : 4,
		wt : 4,

		// WD : 4,
		wikidata : 4,
		// [[commons:title]] @ enwiki 會造成混亂
		// commons : 4,
		// COM : 4,

		// https://en.wikinews.org/wiki/Help:Namespace
		// WN : 4,
		wikinews : 4,

		// WP : 4,
		// 正規名稱必須擺在最後一個，供 function namespace_text_of_NO() 使用。
		wikipedia : 4,

		// ----------------------------

		// Varies between wikis
		'project talk' : 5,
		// 正規名稱必須擺在最後一個，供 function namespace_text_of_NO() 使用。
		'wikipedia talk' : 5,

		// image
		file : 6,
		'file talk' : 7,
		// [[MediaWiki:title]]
		mediawiki : 8,
		'mediawiki talk' : 9,

		模板 : 10,
		テンプレート : 10,
		plantilla : 10,
		틀 : 10,
		template : 10,

		'template talk' : 11,
		// [[Help:title]], [[使用說明:title]]
		// H : 12,
		// 正規名稱必須擺在最後一個，供 function namespace_text_of_NO() 使用。
		help : 12,
		'help talk' : 13,
		// https://commons.wikimedia.org/wiki/Commons:Administrators%27_noticeboard#Cleaning_up_after_creation_of_CAT:_namespace_redirect
		// CAT : 14,
		// 正規名稱必須擺在最後一個，供 function namespace_text_of_NO() 使用。
		category : 14,
		'category talk' : 15,

		// 主題/主題首頁
		portal : 100,
		// 主題討論
		'portal talk' : 101,
		book : 108,
		'book talk' : 109,
		draft : 118,
		'draft talk' : 119,
		// Education Program
		'education program' : 446,
		// Education Program talk
		'education program talk' : 447,
		// TimedText
		timedtext : 710,
		// TimedText talk
		'timedtext talk' : 711,
		// 模块 模塊 模組
		module : 828,
		'module talk' : 829,
		// Gadget
		gadget : 2300,
		'gadget talk' : 2301,
		// Gadget definition
		'gadget definition' : 2302,
		'gadget definition talk' : 2303,
		// 話題 The Flow namespace (prefix Topic:)
		topic : 2600
	};

	// Should use `CeL.wiki.namespace.name_of(NS, session)`
	// NOT `wiki_API.namespace.name_of_NO[NS]`
	get_namespace.name_of_NO = [];

	/**
	 * build session.configurations.namespace_pattern || get_namespace.pattern
	 * 
	 * @inner
	 */
	function generate_namespace_pattern(namespace_hash, name_of_NO) {
		var source = [];
		for ( var namespace in namespace_hash) {
			name_of_NO[namespace_hash[namespace]] = upper_case_initial(
					namespace)
			// [[Mediawiki talk:]] → [[MediaWiki talk:]]
			.replace(/^Mediawiki/, 'MediaWiki');
			if (namespace)
				source.push(namespace);
		}

		// namespace_pattern matched: [ , namespace, title ]
		return new RegExp('^(' + source.join('|').replace(/ /g, '[ _]')
				+ '):(.+)$', 'i');
	}
	get_namespace.pattern = generate_namespace_pattern(get_namespace.hash,
			get_namespace.name_of_NO);
	// console.log(get_namespace.pattern);

	function namespace_text_of_NO(NS, options) {
		if (!NS)
			return '';

		var session = session_of_options(options);
		if (NS === session
		// session === wiki_API?
		&& session.configurations && session.configurations.namespace_hash ? session.configurations.namespace_hash.wikipedia
				: get_namespace.hash.wikipedia) {
			if (session && session.family) {
				return wiki_API.upper_case_initial(
				// e.g., commons, wikidata
				get_wikimedia_project_name(session) || session.family);
			}
			// e.g., testwiki:
			return 'Wikipedia';
		}

		var name_of_NO = session
		// session === wiki_API?
		&& session.configurations && session.configurations.name_of_NO
				|| wiki_API.namespace.name_of_NO;
		return wiki_API.upper_case_initial(name_of_NO[NS]);
	}

	// CeL.wiki.namespace.name_of(NS, session)
	get_namespace.name_of = namespace_text_of_NO;

	/**
	 * remove namespace part of the title. 剝離 namespace。
	 * 
	 * wiki.remove_namespace(), wiki_API.remove_namespace()
	 * 
	 * TODO: wiki.remove_namespace(page, only_remove_this_namespace)
	 * 
	 * @param {String}page_title
	 *            page title 頁面標題。
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @returns {String}title without namespace
	 */
	function remove_page_title_namespace(page_title, options) {
		page_title = wiki_API.normalize_title(page_title, options);
		// console.trace(page_title);
		if (Array.isArray(page_title)) {
			return page_title.map(function(_page_title) {
				return remove_page_title_namespace(_page_title, options);
			});
		}

		if (typeof page_title !== 'string') {
			library_namespace.debug(page_title, 5,
					'remove_page_title_namespace');
			return page_title;
		}

		var session = session_of_options(options);
		var namespace_pattern = session
		// session === wiki_API?
		&& session.configurations && session.configurations.namespace_pattern
				|| get_namespace.pattern;
		if (page_title.endsWith(':')) {
			// e.g., input "Template:"
			page_title += ' ';
		}
		var matched = page_title.match(namespace_pattern);
		library_namespace.debug('Test ' + wiki_API.title_link_of(page_title)
				+ ', get [' + matched + '] using pattern ' + namespace_pattern,
				4, 'remove_page_title_namespace');
		if (matched) {
			// namespace_pattern matched: [ , namespace, title ]
			return (matched ? matched[2] : page_title).trim();
			// do not normalize page title.
		}
		// Leave untouched
		return page_title;
	}

	function namespace_of_options(options) {
		var namespace = Array.isArray(options) ? options
		// 必須預防 {Object}options。
		: !options ? 0 : typeof options === 'number' ? options
				: typeof options === 'string' ? library_namespace
						.is_digits(options) ? +options : options
						: options.namespace;
		return namespace;
	}

	// TODO: is_namespace(page_title, 'Wikipedia|User')
	function page_title_is_namespace(page_title, options) {
		var namespace = namespace_of_options(options);

		var page_ns;
		// console.trace(namespace, wiki_API.is_page_data(page_title));
		if (wiki_API.is_page_data(page_title)) {
			page_ns = page_title.ns;
		} else {
			page_title = wiki_API.normalize_title(page_title, options);
			page_ns = get_namespace(page_title, Object.assign({
				// for wiki_API.namespace()
				is_page_title : true
			}, options));
		}

		function check_namespace(namespace) {
			// 預防 jawiki.namespace('Draft') === undefined 這情況下被當作 true。
			var namespace_to_test = get_namespace(namespace, Object.assign({
				is_page_title : false
			}, options));
			if (namespace_to_test === undefined)
				namespace_to_test = namespace;
			return page_ns === namespace_to_test;
		}

		if (Array.isArray(namespace)) {
			// e.g., `CeL.wiki.is_namespace('User:user', ['Wikipedia', 'User'])`
			return namespace.some(check_namespace);
		}

		return check_namespace(namespace);
	}

	function convert_page_title_to_namespace(page_title, options) {
		var namespace = namespace_of_options(options);
		namespace = get_namespace(namespace, Object.assign({
			get_name : true
		}, options)) + ':';

		page_title = wiki_API.normalize_title(page_title, options);
		// console.trace(page_title);

		function to_namespace(page_title) {
			return page_title || page_title === 0 ? namespace
					+ remove_page_title_namespace(page_title, options)
					: page_title;
		}

		if (Array.isArray(page_title)) {
			return page_title.map(to_namespace);
		}
		return to_namespace(page_title);
	}

	// ------------------------------------------

	function is_talk_namespace(namespace, options) {
		options = Object.assign({
			// for wiki_API.namespace()
			is_page_title : true
		}, options);
		// wiki_API.is_page_data(namespace, options) ||
		// wiki_API.is_Page(namespace)
		if (typeof namespace === 'object') {
			namespace = namespace.ns >= 0 ? namespace.ns : namespace.title;
		}

		if (typeof namespace === 'string') {
			namespace = wiki_API.normalize_title(namespace, options)
					.toLowerCase();
			var session = session_of_options(options);
			var name_of_NO = session
			// session === wiki_API?
			&& session.configurations && session.configurations.name_of_NO
					|| wiki_API.namespace.name_of_NO;
			if (session) {
				// assert: {Number|Undefined}namespace
				namespace = wiki_API.namespace(namespace, options);
			} else {
				// treat ((namespace)) as page title
				// get namespace only. e.g., 'wikipedia:sandbox' → 'wikipedia'
				if (namespace.includes(':')) {
					// get namespace only, remove page title
					var _namespace = namespace.replace(/:.*$/, '');
					if (_namespace in name_of_NO)
						namespace = name_of_NO[_namespace];
					else
						return PATTERN_talk_prefix.test(namespace)
								|| PATTERN_talk_namespace_prefix
										.test(namespace);
				}
				namespace = +namespace;
			}
		}

		if (typeof namespace === 'number') {
			// 單數: talk page
			return namespace > 0 && namespace % 2 === 1;
		}
	}

	// 討論頁面不應包含 [[Special talk:*]]。
	function to_talk_page(page_title, options) {
		options = Object.assign({
			// for wiki_API.namespace()
			is_page_title : true
		}, options);
		// console.trace([ page_title, options ]);
		var session = session_of_options(options), namespace;
		if (wiki_API.is_page_data(page_title)) {
			// assert: {Number}namespace
			namespace = page_title.ns;
			page_title = wiki_API.title_of(page_title);

		} else {
			page_title = wiki_API.normalize_title(page_title, options);
			// console.trace([ page_title ]);
			if (!session) {
				if (/^(Special|特殊|特別|Media|媒體|媒体|メディア|Topic|話題|话题):/i
						.test(page_title)) {
					// There is no talk page for Topic or virtual namespaces.
					return;
				}

				// for zhwiki, jawiki only.
				// But you should use session.to_talk_page() !
				// 模組|模塊|模块|モジュール → Module talk
				page_title = page_title.replace(/^(?:模組|模塊|模块|モジュール):/i,
						'Module:');
			}
			// assert: {Number|Undefined}namespace
			namespace = wiki_API.namespace(page_title, options);
		}
		// console.trace([ namespace, page_title ]);

		if (!page_title || typeof page_title !== 'string' || namespace < 0)
			return;

		// console.trace([ namespace, page_title ]);
		if (is_talk_namespace(namespace, options)) {
			library_namespace.debug('Is already talk page: ' + page_title, 3,
					'to_talk_page');
			return page_title;
		}

		var name_of_NO = session
		// session === wiki_API?
		&& session.configurations && session.configurations.name_of_NO
				|| wiki_API.namespace.name_of_NO;
		// console.trace([ namespace, name_of_NO ]);
		if (namespace >= 0) {
			namespace = name_of_NO[namespace + 1];
			if (!namespace)
				return;
			// 剝離 namespace。
			page_title = wiki_API.remove_namespace(page_title, options);
			page_title = namespace + ':' + page_title;
			if (name_of_NO === wiki_API.namespace.name_of_NO) {
				page_title = wiki_API.normalize_title(page_title, options);
			}
			return page_title;
		}

		// assert: namespace === undefined

		var matched = page_title
				.match(/^([^{}\[\]\|<>\t\n#�:]+):(\S.*)$/ && /^([a-z_ ]+):(.+)$/i);
		// console.log([matched,page_title]);
		if (!matched
				|| /^[a-z _]+$/i.test(namespace = matched[1])
				&& isNaN(get_namespace(namespace, add_session_to_options(
						session, options)))) {
			// assert: main page (namespace: 0)
			return 'Talk:' + page_title;
		}

		return namespace + ' talk:' + matched[2];
	}

	var PATTERN_talk_prefix = /^(?:Talk|討論|讨论|ノート|토론):/i;
	var PATTERN_talk_namespace_prefix = /^([a-z _]+)(?:[ _]talk|討論|讨论|‐ノート|토론):/i;
	function talk_page_to_main(page_title, options) {
		options = Object.assign({
			// for wiki_API.namespace()
			is_page_title : true
		}, options);
		var namespace;
		if (wiki_API.is_page_data(page_title)) {
			// assert: {Number}namespace
			namespace = page_title.ns;
			page_title = wiki_API.title_of(page_title);

		} else {
			page_title = wiki_API.normalize_title(page_title, options);
			namespace = wiki_API.namespace(page_title, options);
			// assert: {Number|Undefined}namespace
		}

		if (!page_title || typeof page_title !== 'string')
			return page_title;

		if (namespace <= 0 || namespace % 2 === 0) {
			library_namespace.debug('Is already NOT talk page: ' + page_title,
					3, 'to_talk_page');
			return page_title;
		}

		var session = session_of_options(options);
		var name_of_NO = session
		// session === wiki_API?
		&& session.configurations && session.configurations.name_of_NO
				|| wiki_API.namespace.name_of_NO;
		if (namespace > 0) {
			namespace = name_of_NO[namespace - 1];
			// 剝離 namespace。
			page_title = wiki_API.remove_namespace(page_title, options);
			if (namespace) {
				page_title = namespace + ':' + page_title;
				if (name_of_NO === wiki_API.namespace.name_of_NO) {
					page_title = wiki_API.normalize_title(page_title, options);
				}
			}
			return page_title;
		}

		// assert: namespace === undefined

		if (PATTERN_talk_prefix.test(page_title))
			return page_title.replace(PATTERN_talk_prefix, '');

		if (PATTERN_talk_namespace_prefix.test(page_title)) {
			return page_title.replace(PATTERN_talk_namespace_prefix, '$1:');
		}

		return page_title;
	}

	// ------------------------------------------------------------------------

	// wikitext to plain text
	// CeL.wiki.plain_text(wikitext)
	// Please use CeL.wiki.wikitext_to_plain_text() instead!
	// @see [[Module:Plain text]],
	// @seealso function get_label(html) @ work_crawler.js
	function simple_wikitext_to_plain_text(wikitext) {
		if (!wikitext || !(wikitext = wikitext.trim())) {
			// 一般 template 中之 parameter 常有設定空值的狀況，因此首先篩選以加快速度。
			return wikitext;
		}
		// TODO: "《茶花女》维基百科词条'''(法语)'''"
		wikitext
		// e.g., "親会社<!-- リダイレクト先の「[[子会社]]」は、[[:en:Subsidiary]] とリンク -->"
		// "ロイ・トーマス<!-- 曖昧さ回避ページ -->"
		= prefix_page_name(wikitext)
		// 沒先處理的話，也會去除 <br />
		.replace(/\s*<br(?:[^\s\/][^<>]*)?>/ig, '\n').replace(
				/<\/?[a-z][^>]*>/g, '')
		// e.g., remove "{{En icon}}"
		.replace(/{{[a-z\s]+}}/ig, '')
		// e.g., "[[link]]" → "link"
		// 警告：應處理 "[[ [[link]] ]]" → "[[ link ]]" 之特殊情況
		// 警告：應處理 "[[text | [[ link ]] ]]", "[[ link | a[1] ]]" 之特殊情況
		.replace(
				PATTERN_wikilink_global,
				function(all_link, page_and_anchor, page_name, section_title,
						displayed_text) {
					return displayed_text || page_and_anchor;
				})
		// e.g., "ABC (英文)" → "ABC "
		// e.g., "ABC （英文）" → "ABC "
		.replace(/[(（][英中日德法西義韓諺俄独原][語语國国]?文?[名字]?[）)]/g, '')
		// e.g., "'''''title'''''" → " title "
		// .remove_head_tail(): function remove_head_tail() @ CeL.data.native
		.remove_head_tail("'''", 0, ' ').remove_head_tail("''", 0, ' ')
		// 有時因為原先的文本有誤，還是會有 ''' 之類的東西留下來。
		.replace(/'{2,}/g, ' ').trim()
		// 此處之 space 應為中間之空白。
		.replace(/\s{2,}/g, function(space) {
			// trim tail
			return space.replace(/[^\n]{2,}/g, ' ')
			// 避免連\n都被刪掉。
			// /[^\n]+\n/ or /.*[\r\n]+/: /./.test('\r') === false
			.replace(/[\s\S]+\n/g, '\n').replace(/\n{3,}/g, '\n\n');
		}).replace(/[(（] /g, '(').replace(/ [）)]/g, ')');

		return wikitext;
	}

	// ------------------------------------------------------------------------
	// 創建 match pattern 相關函數。

	/**
	 * 將第一個字母轉成大寫。<br />
	 * 因為 wiki 僅僅將首字母大寫，中間的字不會被改變，因此不採用 toTitleCase() @ CeL.data.native。
	 * 
	 * 注意: 您實際需要的可能是 wiki_API.normalize_title()
	 * 
	 * cf. {{lcfirst:}}
	 * 
	 * @param {String}words
	 *            要轉換的文字。
	 * 
	 * @returns {String}轉換過的文字。
	 */
	function upper_case_initial(words) {
		// 用到 upper_case_initial() 的照理來說都是標題，不以空白字元開頭。
		words = String(words).trimStart();

		// method 1
		// TODO: check .charCodeAt()
		var initial_char = words.charAt(0);
		if (initial_char !== 'ß') {
			// https://www.reddit.com/r/javascript/comments/9i455b/why_is_%C3%9Ftouppercase_equal_to_ss/
			// https://stackoverflow.com/questions/9127644/converting-%C3%9F-cfg-to-upper-case-using-touppercase-in-java
			// https://unicode.org/Public/UNIDATA/SpecialCasing.txt
			// 'ẞ'.toLowerCase()==='ß'
			// 'ß'.toUpperCase()==='SS'
			// 'ẞ'.toUpperCase()==='ẞ'

			// MediaWiki 技術上可使用這個為標題首字母:
			// https://de.wikipedia.org/wiki/Spezial:Pr%C3%A4fixindex?prefix=%C3%9F
			// https://en.wikipedia.org/wiki/Special:PrefixIndex?prefix=%C3%9F
			// 因此應保留 'ß'

			initial_char = initial_char.toUpperCase();
		}
		return initial_char + words.slice(1);

		// method 2
		return words.replace(/^\S/g, function(initial_char) {
			if (initial_char === 'ß') {
				return initial_char;
			}
			return initial_char.toUpperCase();
		});
	}

	// CeL.wiki.prefix_page_name(page_name)
	// 前置作業，用以簡化頁面名稱。
	// or prefix_parameter_name() ?
	function prefix_page_name(page_name) {
		page_name = String(page_name);

		// 去除註解。 Remove comments. "<!-- comment -->"
		page_name = page_name.replace(/<\!--[\s\S]*?-->/g, '');

		// [[mw:Help:Magic words#Escaped characters]]
		page_name = page_name
		// '{{!}}' → '|'
		.replace(/{{\s*!\s*}}/g, '|')
		// '{{=}}' → '='
		.replace(/{{\s*=\s*}}/g, '=');

		// CeL.wiki.parse.anchor.normalize_anchor() needs preserving spaces
		// page_name = page_name.trim();

		return page_name;
	}

	/** @inner */
	var PATTERN_anchor_of_page_title;
	try {
		// Negative lookbehind assertion
		PATTERN_anchor_of_page_title = new RegExp('(?<!{{)#.*');
	} catch (e) {
		// Will use old methos @ normalize_page_name()
	}

	/**
	 * 規範/正規化頁面名稱 page name。
	 * 
	 * <code>

	page_title = CeL.wiki.normalize_title(page_title && page_title.toString());

	</code>
	 * 
	 * TODO: 簡化。
	 * 
	 * TODO: normalize namespace
	 * 
	 * 這種規範化只能通用於本 library 內。Wikipedia 並未硬性設限。<br />
	 * 依照
	 * [https://www.mediawiki.org/w/api.php?action=query&titles=Wikipedia_talk:Flow&prop=info]，
	 * "Wikipedia_talk:Flow" → "Wikipedia talk:Flow"<br />
	 * 亦即底線 "_" → space " "，首字母大寫。
	 * 
	 * @param {String}page_name
	 *            頁面名 valid page name。
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @returns {String}規範後之頁面名稱。canonicaltitle。
	 * 
	 * @see [[Wikipedia:命名常規]]
	 * @see https://en.wikipedia.org/wiki/Wikipedia:Page_name#Technical_restrictions_and_limitations
	 */
	function normalize_page_name(page_name, options) {
		if (Array.isArray(page_name)) {
			if (!page_name.type) {
				return page_name.map(function(_page_name) {
					return normalize_page_name(_page_name, options);
				});
			}

			if (page_name.type === 'transclusion') {
				page_name = page_name.page_title;
			} else if (page_name.type === 'link') {
				page_name = page_name[0].toString();
			} else {
				library_namespace.warn('Cannot treat ' + page_name
						+ ' as page title!');
				page_name = page_name[0].toString();
			}
		}

		if (wiki_API.is_page_data(page_name)) {
			page_name = page_name.title;
		}
		if (!page_name || typeof page_name !== 'string')
			return page_name;

		if (options === true) {
			options = {
				use_underline : true
			};
		} else {
			options = library_namespace.setup_options(options);
		}

		// 注意:
		// '\u00FF', '\u200B', '\u2060' 可被當作正規頁面名稱的一部分，包括在開頭結尾。
		// \u200B: zero-width space (ZWSP)
		// \u2060: word joiner (WJ).

		// TODO: 去除不可見字符 \p{Cf}，警告 \p{C}。

		// true === /^\s$/.test('\uFEFF')

		page_name = prefix_page_name(page_name);

		// [[A&quot;A]]→[[A"A]]
		// fix "&#39;". 由於裡面包含"#"，所以必須在 PATTERN_anchor_of_page_title 之前處理。
		page_name = library_namespace.HTML_to_Unicode(page_name, {
			predefined : true,
			entity : true,
			numeric : true,
			is_URI : 'auto'
		});

		// e.g., "Wikipedia:削除依頼/ログ/{{#time:Y年Fj日|-1 days +9 hours}}"
		if (!options.keep_anchor/* .preserve_anchor */) {
			// Warning: The anchor will be removed!
			if (PATTERN_anchor_of_page_title) {
				page_name = page_name.replace(PATTERN_anchor_of_page_title, '');
			} else {
				// old method
				page_name = page_name.replace(/([^#]*)#.*/, function(all,
						prefix) {
					return /{{$/.test(prefix) ? all : prefix;
				});
			}
		}
		// assert: /[#|{}]/.test(page_name)===false

		page_name = page_name
		// '\u200E', '\u200F' 在當作 title 時會被濾掉。
		// 對於標題，無論前後加幾個"\u200E"(LEFT-TO-RIGHT MARK)都會被視為無物。
		// "\u200F" 亦不被視作 /\s/，但經測試會被 wiki 忽視。
		// tested: [[title]], {{title}}
		// @seealso [[w:en:Category:CS1 errors: invisible characters]]
		.replace(/[\u200E\u200F]/g, '')

		.trimEnd()

		// 去除開頭的冒號 ":"。 /\s/.test('\u3000')===true
		.replace(options.preserve_head_colon ? /^[\s_]+/ : /^[:\s_]+/, '')

		// 無論是中日文、英文的維基百科，所有的 '\u3000' 都會被轉成空白字元 /[ _]/。
		.replace(/　/g, ' ')

		// 處理連續多個空白字元。長度相同的情況下，盡可能保留原貌。
		.replace(/([ _]){2,}/g, '$1');

		// {{int:MediaWiki page name}}
		if (!options.no_convert_interface_message && /^int:.+/i.test(page_name)) {
			// 4 === 'int:'.length
			page_name = 'MediaWiki:' + page_name.slice(4).trimStart();
		}

		/** {Boolean}採用 "_" 取代 " "。 */
		var use_underline = options.use_underline;
		page_name = use_underline
		// ' ' → '_': 在 URL 上可更簡潔。
		? page_name.replace(/ /g, '_') : page_name.replace(/_/g, ' ');

		page_name = page_name.split(':');
		var skip_language, skip_namespace;
		var session = session_of_options(options);
		var interwiki_pattern = session
		// session === wiki_API?
		&& session.configurations && session.configurations.interwiki_pattern
				|| /^[a-z][a-z_\-]+$/i;
		var no_session_namespace_hash = !session || !session.configurations
				|| !session.configurations.namespace_hash;

		var _options = Object.assign(Object.clone(options), {
			is_page_title : false,
			get_name : true
		});
		page_name.some(function(section, index) {
			section = use_underline ? section.replace(/^[\s_]+/, '') : section
					.trimStart();

			// 必然包含 page title，因此不處理最後一個。
			if (index === page_name.length - 1) {
				if (options.no_upper_case_initial) {
					page_name[index] = section;
				} else {
					// page title: 將首個字母轉成大寫。
					page_name[index] = upper_case_initial(section);
				}
				return true;
			}

			if (// index === page_name.length - 1 ||
			no_session_namespace_hash
			// @see PATTERN_PROJECT_CODE
			&& !(use_underline ? /^[a-z][a-z\d\-_]{0,14}$/i
			//
			: /^[a-z][a-z\d\- ]{0,14}$/i).test(section.trimEnd())) {
				// console.log(section);
				if (// index < page_name.length - 1 &&
				session && interwiki_pattern.test(section)
						|| options.no_upper_case_initial) {
					// e.g., 'EN' → 'en'
					page_name[index] = section;
				} else {
					// page title: 將首個字母轉成大寫。
					page_name[index] = upper_case_initial(section);
				}
				return true;
			}

			if (!skip_namespace) {
				skip_namespace = isNaN(section)
				//
				&& get_namespace(section, _options);
				// console.trace([ index, section, namespace ]);
				if (skip_namespace) {
					// `section` is Wikipedia namespace
					page_name[index] = use_underline ? skip_namespace.replace(
							/ /g, '_') : skip_namespace.replace(/_/g, ' ');
					// 進入 namespace 後，剩下的皆為頁面名稱，不再容許語言標記。
					skip_language = true;
					return false;
				}
			}

			if (skip_language) {
				if (session && interwiki_pattern.test(section)) {
					// e.g., 'EN' → 'en'
					page_name[index] = section.toLowerCase();
				} else {
					// page title: 將首個字母轉成大寫。
					page_name[index] = upper_case_initial(section);
				}
				return true;
			}

			var language_code = section.replace(/[\s_]+$/, '');
			if (false && /Velocity/i.test(section)) {
				console.trace([ interwiki_pattern, section, language_code,
						upper_case_initial(section) ]);
			}
			if (!interwiki_pattern.test(language_code)) {
				// e.g., [[Velocity : Design : Comfort]]
				page_name[index] = upper_case_initial(section);
				return true;
			}

			// treat `section` as language code, all lowercased
			section = language_code.toLowerCase();
			// lang code
			skip_language = true;
			if (use_underline) {
				section = section.replace(/_/g, '-');
			}
			// else: e.g., [[m:Abc]]
			page_name[index] = section;
		});

		// console.trace(page_name);
		return page_name.join(':');
	}

	// @see wiki_toString
	function normalize_name_pattern(file_name, add_group, remove_namespace) {
		if (wiki_API.is_page_data(file_name))
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

	function generate_page_pattern_of_namespace(namespace, options) {
		var session = wiki_API.session_of_options(options);
		if (!session
		// session === wiki_API?
		|| !session.latest_site_configurations) {
			return;
		}

		var page_pattern_of_namespace = [ session.latest_site_configurations.namespaces[
		// session.configurations.namespace_hash[namespace]
		wiki_API.namespace.hash[namespace]]['*'] ];
		// console.trace(session.latest_site_configurations.namespaces);
		session.latest_site_configurations.namespacealiases
		//
		.forEach(function(namespace_data) {
			if (
			// session.configurations.namespace_hash[namespace]
			namespace_data.id === wiki_API.namespace.hash[namespace]) {
				page_pattern_of_namespace.push(namespace_data['*']);
			}
		});

		page_pattern_of_namespace = new RegExp('^ *(?:'
				+ page_pattern_of_namespace.join('|') + ') *: *'
				+ PATTERN_page_name.source
		// .replace(/#/g, '')
		, 'i');
		if (false) {
			console.trace([ wiki_API.site_name(session), namespace,
					page_pattern_of_namespace ]);
		}

		return page_pattern_of_namespace;
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
	function file_pattern(file_name, flag, options) {
		if (options === undefined && library_namespace.is_Object(flag)) {
			options = flag;
			flag = undefined;
		}

		file_name = normalize_name_pattern(file_name, true);
		if (file_name) {
			return new RegExp(file_pattern.default_source.replace(/page_title/,
					file_name), flag || 'g');
		}
	}

	// [[維基百科:命名空間#文件名字空间]]
	// [[Media:image.png]]：產生一個指向檔案本身的連結
	// https://github.com/dbpedia/extraction-framework/blob/master/core/src/main/settings/zhwiki-configuration.xml
	// https://github.com/dbpedia/extraction-framework/blob/master/core/src/main/scala/org/dbpedia/extraction/wikiparser/impl/wikipedia/Namespaces.scala
	//
	// Fichier:
	// https://fr.wikipedia.org/wiki/Aide:Ins%C3%A9rer_une_image_(wikicode,_avanc%C3%A9)
	//
	// https://zh.wikipedia.org/wiki/Wikipedia:互助客栈/其他#增设空间“U：”、“UT：”作为“User：”、“User_talk：”的Alias
	// 提議增加F、FT指向File、File Talk
	/** {RegExp}檔案的匹配模式 for parser。 */
	var PATTERN_file_prefix = 'File|檔案|档案|文件|ファイル|Image|圖像|图像|画像|Media|媒[體体](?:文件)?';

	file_pattern.default_source =
	// 不允許 [\s\n]，僅允許 ' '。
	// [ ':', page title / file name, 接續 ]
	/\[\[ *(?:(:) *)?(?:namespace_list) *: *page_title *(\||\]\])/
	// [[ :File:page_title]] === [[File:page_title]]
	.source.replace(/namespace_list/, library_namespace
			.ignore_case_pattern(PATTERN_file_prefix));

	// matched: [ all token[0], prefix ":"s before "File:",
	// file name without "File:" or ":File" ]
	PATTERN_file_prefix = new RegExp(
	// '^ *(: *)?(?:'
	'^ *(?:' + PATTERN_file_prefix + ') *: *' + PATTERN_page_name.source, 'i');

	// "Category" 本身可不分大小寫。
	// 分類名稱重複時，排序索引以後出現者為主。
	// TODO: using PATTERN_page_name
	var
	// [ all_category_text, category_name, sort_order, post_space ]
	PATTERN_category = /\[\[ *(?:Category|分類|分类|カテゴリ|분류) *: *([^{}\[\]\|<>\t\n�]+)(?:\s*\|\s*([^\[\]\|�]*))?\]\](\s*\n?)/ig,
	/** {RegExp}分類的匹配模式 for parser。 [all, category_name] */
	PATTERN_category_prefix = /^ *(?:Category|分類|分类|カテゴリ|분류) *: *([^{}\[\]\|<>\t\n�]+)/i;

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
		var hash = Object.create(null);
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
	 * cf. Array.prototype.unique @ data.native
	 * 
	 * @param {Array}page_data_list
	 *            list of page_data.
	 * 
	 * @returns {Array}unique list
	 */
	function unique_list(page_data_list) {
		var array = [],
		// 以 hash 純量 index 加速判別是否重複。
		hash = Object.create(null);

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

	/**
	 * escape wikitext control characters of text, to plain wikitext.<br />
	 * escape 掉會造成問題之 characters。
	 * 
	 * @example <code>
	CeL.wiki.escape_text(text);
	 * </code>
	 * 
	 * TODO: "&"
	 * 
	 * @param {String}text
	 *            包含有問題字元的文字字串。
	 * @param {Boolean}is_URI
	 *            輸出為 URI 或 URL。
	 * @returns {String}plain wikitext
	 * 
	 * @see function section_link_escape(text, is_URI)
	 * @see [[w:en:Help:Special characters]]
	 */
	function escape_text(text, is_URI) {
		function escape_character(character) {
			var code = character.charCodeAt(0);
			if (is_URI) {
				return '%' + code.toString(16);
			}
			return '&#' + code + ';';
		}

		return text
		// 經測試 anchor 亦不可包含[{}\[\]\n�]。
		.replace(/[\|{}\[\]<>�]/g, escape_character)
		// escape "''", "'''"
		.replace(/''/g, "'" + escape_character("'"))
		// escape [[w:en:Help:Magic links]]
		.replace(/__/g, "_" + escape_character("_"))
		// escape signing
		.replace(/~~~/g, "~~" + escape_character("~"))
		// escape list, section title
		.replace(/\n([*#;:=\n])/g, function(all, character) {
			return "\n" + escape_character(character);
		});
	}

	function to_template_wikitext_toString_slice(separator) {
		return this.join(separator || '|');
	}

	function to_template_wikitext_toString(separator) {
		var text = this.join(separator || '|'), tail = '}}';
		if (text.includes('\n'))
			tail = '\n' + tail;
		return '{{' + text + tail;
	}

	function to_template_wikitext_join_array(value) {
		return Array.isArray(value) ? value.join('\n') : value;
	}

	to_template_wikitext.join_array = to_template_wikitext_join_array;

	// 2017/1/18 18:46:2
	// TODO: escape special characters
	function to_template_wikitext(parameters, options) {
		var template_name, is_continue = true;
		if (options) {
			if (typeof options === 'string') {
				template_name = options;
			} else {
				template_name = options.name;
			}
		}
		var parameters_is_Array = Array.isArray(parameters);
		if (!template_name && (!options || !options.is_slice)
				&& parameters_is_Array && parameters[0]) {
			// CeL.wiki.template_text([name, p1, p2]);
			template_name = parameters[0];
			delete parameters[0];
		}

		var wikitext;
		if (template_name) {
			wikitext = [ template_name ];
			wikitext.toString = to_template_wikitext_toString;
		} else {
			wikitext = [];
			wikitext.toString = to_template_wikitext_toString_slice;
		}

		Object.keys(parameters).forEach(function(key) {
			var value = parameters[key], ignore_key = is_continue
			//
			&& (is_continue = library_namespace.is_digits(key));
			// console.log([ key, value ]);

			// ignore_value: 沒有設定數值時，直接忽略這一個 parameter。
			if (value === undefined) {
				if (!Array.isArray(parameters))
					return;
				// wikitext 不採用 `undefined`。
				value = '';
			} else {
				value = to_template_wikitext_join_array(value);
			}

			if (parameters_is_Array && template_name && !parameters[0]) {
				wikitext[key] = value;
			} else {
				if (!ignore_key)
					value = key + '=' + value;
				wikitext.push(value);
			}
		});

		return options && options.to_Array ? wikitext
		//
		: wikitext.toString(options && options.separator);
	}

	// ------------------------------------------------------------------------

	/**
	 * get title of page.
	 * 
	 * @example <code>
	var title = wiki.title_of(page_data);
	var title = CeL.wiki.title_of(page_data, options);
	 * </code>
	 * 
	 * @param {Object}page_data
	 *            page data got from wiki API.
	 * 
	 * @returns {String|Undefined}title of page, maybe undefined.
	 * 
	 * @see wiki_API.query.id_of_page
	 * @see wiki_API.query.title_param()
	 */
	function get_page_title(page_data, options) {
		// 處理 [ {String}API_URL, {String}title or {Object}page_data ]
		if (Array.isArray(page_data)) {
			if (wiki_API.is_page_data(page_data[0])) {
				// assert: page_data = [ page data, page data, ... ]
				return page_data.map(get_page_title);
			}
			if (is_api_and_title(page_data)) {
			}
			// assert: page_data =
			// [ {String}API_URL, {String}title || {Object}page_data ]
			return get_page_title(page_data[1], options);
		}

		if (wiki_API.is_page_data(page_data)) {
			var title = page_data.title;
			// 檢測一般頁面
			if (title) {
				// should use wiki_API.is_page_data(page_data)
				return title;
			}

			// for flow page
			// page_data.header: 在 Flow_page()=CeL.wiki.Flow.page 中設定。
			// page_data.revision: 由 Flow_page()=CeL.wiki.Flow.page 取得。
			title =
			// page_data.is_Flow &&
			(page_data.header || page_data).revision;
			if (title && (title = title.articleTitle)) {
				// e.g., "Wikipedia talk:Flow tests"
				return title;
			}

			return undefined;
		}

		if (typeof page_data === 'string') {
			// 例外處理: ':zh:title' → 'zh:title'
			page_data = page_data.replace(/^[\s:]+/, '');
			var session = wiki_API.session_of_options(options)
					|| page_data.parsed && page_data.parsed[KEY_SESSION];
			// 警告: 若無 session 就直接執行 normalize_page_name()，
			// 可能在非 Wikipedia 項目解析 Project:，如 [[Wikinews:ABC]] 時出問題!
			if (session) {
				// normalize_page_name() 會去掉 anchor。
				page_data = page_data.match(/^([^#]*)(#[\s\S]*)?$/);
				page_data = session.normalize_title(page_data[1], options)
						+ (page_data[2] || '');
			}
		} else {
			// e.g., page_data === undefined
		}

		return page_data;
	}

	// get the wikilink of page_data.
	// CeL.wiki.title_link_of()
	// 'title'→'[[title]]'
	// 'zh:title'→'[[:zh:title]]'
	// 'n:title'→'[[:n:title]]'
	// 'Category:category'→'[[:Category:category]]'
	// TODO: [[link|<span style="color: #000;">title</span>]]
	// TODO: 與 URL_to_wiki_link() 整合。
	// TODO: #section name: [page_data, section name]
	// TODO: 複製到非維基項目外的私人維基，例如moegirl時，可能需要用到[[zhwiki:]]這樣的prefix。
	function get_page_title_link(page_data, display_text, options) {
		var title,
		// e.g., is_category
		need_escape, project_prefixed;

		if (options === undefined && (wiki_API.is_wiki_API(display_text)
		// e.g., `CeL.wiki.title_link_of(page_data, wiki_session)`
		|| library_namespace.is_Object(display_text))) {
			// shift arguments
			options = display_text;
			display_text = null;
		}

		var session = wiki_API.session_of_options(options);

		// console.trace(session);
		var namespace_hash = session
		// session === wiki_API?
		&& session.configurations && session.configurations.namespace_hash
				|| get_namespace.hash;

		// is_api_and_title(page_data)
		if (wiki_API.is_page_data(page_data)) {
			need_escape = page_data.ns === namespace_hash.category
					|| page_data.ns === namespace_hash.file;
			title = page_data.title;
		} else if (Array.isArray(page_data) && (page_data.type === 'link'
		//
		|| page_data.type === 'file' || page_data.type === 'category')
		// Input wikilink token
		&& (title = page_data[0] + page_data[1])
		//
		? (display_text = display_text || page_data.caption || page_data[2])
		//
		: (title = get_page_title(page_data))
		// 通常應該:
		// is_api_and_title(page_data) || typeof page_data === 'string'
		&& typeof title === 'string') {
			// @see normalize_page_name()
			title = title.replace(/^[\s:]+/, '');

			// e.g., 'zh:title'
			// @see PATTERN_PROJECT_CODE_i
			project_prefixed = /^ *[a-z]{2}[a-z\d\-]{0,14} *:/i.test(title)
					// 排除 'Talk', 'User', 'Help', 'File', ...
					&& !(session && session.configurations
					// ↑ session === wiki_API?
					&& session.configurations.namespace_pattern || get_namespace.pattern)
							.test(title);
			// escape 具有特殊作用的 title。
			need_escape = PATTERN_category_prefix.test(title)
			// 應允許非規範過之 title，如採用 File: 與 Image:, 檔案:。
			|| PATTERN_file_prefix.test(title) || project_prefixed;
		}

		if (!title) {
			return '';
		}
		var first_domain_name
		//
		= wiki_API.get_first_domain_name_of_session(session);
		if (first_domain_name && !project_prefixed) {
			// e.g., [[w:zh:title]]
			title = first_domain_name + ':' + title;
			if (session.family
					&& (session.family in /* api_URL.family */api_URL.shortcut_of_project)) {
				title = api_URL.shortcut_of_project[session.family] + ':'
						+ title;
				need_escape = false;
			} else {
				need_escape = true;
			}
		}

		// TODO: [[s:zh:title]] instead of [[:zh:title]]

		// e.g., for /{}/
		// title = encodeURI(title);
		// or: title = wiki_API.section_link(title); ...

		if (need_escape) {
			title = ':' + title;
		}

		// TODO: for template transclusion, use {{title}}
		return '[[' + title + (display_text && display_text !== title ? '|'
		// library_namespace.Unicode_to_HTML()
		+ String(display_text).replace(/[\[\]]/g, function(char) {
			return '&#' + char.charCodeAt(0) + ';';
		}) : '') + ']]';
	}

	function revision_content(revision, allow_non_string) {
		if (!revision)
			return allow_non_string ? revision : '';

		if (revision.slots) {
			// 2019 API: page_data.revisions[0].slots.main['*']
			// https://www.mediawiki.org/wiki/Manual:Slot
			// https://www.mediawiki.org/wiki/API:Revisions
			revision = revision.slots;
			for ( var slot in revision) {
				// e.g., slot === 'main'
				revision = revision[slot];
				break;
			}
		}
		return allow_non_string ? revision['*'] : revision['*'] || '';
	}

	/**
	 * get the contents of page data. 取得頁面內容。
	 * 
	 * @example <code>
	   var content = CeL.wiki.content_of(page_data);
	   // 當取得了多個版本:
	   var content = CeL.wiki.content_of(page_data, 0);
	 * </code>
	 * 
	 * @param {Object}page_data
	 *            page data got from wiki API.
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @returns {String|Undefined}content of page, maybe undefined.
	 */
	function get_page_content(page_data, options) {
		if (!page_data) {
			// e.g., page_data === undefined
			return page_data;
		}

		if (typeof options === 'string') {
			options = {
				flow_view : options
			};
		} else if (typeof options === 'number') {
			options = {
				revision_index : options
			};
		} else {
			options = library_namespace.setup_options(options);
		}

		// for flow page: 因為 page_data 可能符合一般頁面標準，
		// 此時會先得到 {"flow-workflow":""} 之類的內容，
		// 因此必須在檢測一般頁面之前先檢測 flow page。
		// page_data.header: 在 Flow_page()=CeL.wiki.Flow.page 中設定。
		// page_data.revision: 由 Flow_page()=CeL.wiki.Flow.page 取得。
		var content =
		// page_data.is_Flow &&
		(page_data[options.flow_view] || page_data['header'] || page_data).revision;
		if (content && (content = content.content)) {
			// page_data.revision.content.content
			return content.content;
		}

		if (page_data.expandtemplates
		// 若有則用之，否則最起碼回傳一般的內容。
		&& ('wikitext' in page_data.expandtemplates)) {
			// {String}options.flow_view 對 flow page，所欲取得之頁面內容項目。<br />
			// default: 'header'
			if (options.flow_view === 'expandtemplates')
				return String(page_data.expandtemplates.wikitext || '');

			library_namespace.debug(wiki_API.title_link_of(page_data)
			//
			+ ': The page has expandtemplates.wikitext but do not used.', 1,
					'get_page_content');
		}

		// 檢測一般頁面。
		if (wiki_API.is_page_data(page_data)) {
			// ('missing' in page_data): 此頁面不存在/已刪除。
			// e.g., { ns: 0, title: 'title', missing: '' }
			// TODO: 提供此頁面的刪除和移動日誌以便參考。
			if (('missing' in page_data) || ('invalid' in page_data)) {
				return options.allow_non_String ? undefined : '';
			}

			// @see get_page_content.revision
			content = wiki_API.is_page_data(page_data)
			//
			&& page_data.revisions;
			if (!Array.isArray(content) || !content[0]) {
				// invalid page data
				// 就算 content.length === 0，本來就不該回傳東西。
				// 警告：可能回傳 null or undefined，尚未規範。
				return '';
			}
			if (content.length > 1
					&& typeof options.revision_index !== 'number') {
				// 有多個版本的情況：因為此狀況極少，不統一處理。
				// 一般說來caller自己應該知道自己設定了rvlimit>1，因此此處不警告。
				// 警告：但多版本的情況需要自行偵測是否回傳{Array}！
				return content.map(function(revision) {
					return revision_content(revision);
				});
			}
			// treat options.revision_index as revision_index
			if (options.revision_index < 0) {
				// e.g., -1: select the oldest revision.
				options.revision_index += content.length;
			}
			content = content[options.revision_index | 0];
			return revision_content(content);
		} else if (typeof (content = revision_content(page_data, true)) === 'string') {
			return content;
		}

		// 一般都會輸入 page_data: {"pageid":0,"ns":0,"title":""}
		// : typeof page_data === 'string' ? page_data

		return String(page_data || '');
	}

	/**
	 * check if page_data is page data.
	 * 
	 * @param {Object}page_data
	 *            page data got from wiki API.
	 * 
	 * @returns {String|Number} pageid
	 */
	get_page_content.is_page_data = function(page_data, strict) {
		// 可能是 {wiki_API.Page}, null
		if (!page_data || typeof page_data !== 'object')
			return false;

		if (!strict) {
			// 亦可能僅有 { title: "..." }
			return page_data.pageid >= 0 || page_data.title;
		}

		return typeof page_data.title === 'string'
		//
		&& !Number.isNaN(page_data.ns) && page_data.pageid >= 0
		// 可能是 missing:""，此時仍算 page data。
		|| ('missing' in page_data || 'invalid' in page_data);
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

	// CeL.wiki.content_of.revision(page_data, revision_index);
	// return {Object}main revision (.revisions[0])
	get_page_content.revision = function(page_data, revision_index) {
		return wiki_API.is_page_data(page_data)
		// treat as page data. Try to get page contents:
		// revision_content(page.revisions[0])
		&& page_data.revisions
		// 一般說來應該是由新排到舊，[0] 為最新的版本 last revision。
		&& page_data.revisions[revision_index >= 1 ? revision_index | 0 : 0];
	};

	get_page_content.page_exists = function(page_data) {
		return get_page_content.is_page_data(page_data)
				&& !('missing' in page_data) && !('invalid' in page_data);
	};

	// 曾經以 session.page() 請求過內容。
	get_page_content.had_fetch_content = function(page_data, revision_index) {
		if (!get_page_content.is_page_data(page_data))
			return false;

		if (('missing' in page_data)
		// {title:'%2C',invalidreason:
		// 'The requested page title contains invalid characters:
		// "%2C".'
		// ,invalid:''}
		|| ('invalid' in page_data))
			return true;

		var revision = get_page_content.revision(page_data, revision_index);
		if ('textmissing' in revision) {
			// e.g., {revid:,timestamp:,textmissing:''}
			library_namespace.warn('get_page_content.had_fetch_content: '
					+ '可能其他人正編輯 ' + wiki_API.title_link_of(page_data)
					+ '，本執行緒欲取得最新版本內容時，資料庫尚未完成變更，造成 textmissing？');
			return true;
		}

		if ('string' === typeof revision_content(revision, true))
			return true;
	};

	// CeL.wiki.content_of.edit_time(page_data) -
	// new Date(page_data.revisions[0].timestamp) === 0
	// TODO: page_data.edit_time(revision_index, return_value)
	// return {Date}最後編輯時間/最近的變更日期。
	// 更正確地說，revision[0]（通常是最後一個 revision）的 timestamp。
	get_page_content.edit_time = function(page_data, revision_index,
			return_value) {
		var timestamp = wiki_API.is_page_data(page_data) && page_data.revisions;
		if (timestamp
				&& (timestamp = timestamp[revision_index || 0] || timestamp[0])
				&& (timestamp = timestamp.timestamp)) {
			return return_value ? Date.parse(timestamp) : new Date(timestamp);
		}
	};

	/**
	 * check if the page_data has contents. 不回傳 {String}，減輕需要複製字串的負擔。
	 * 
	 * @param {Object}page_data
	 *            page data got from wiki API.
	 * 
	 * @returns {Boolean} the page_data has / do not has contents.
	 * @returns {Undefined} the page_data do not has contents.
	 */
	get_page_content.has_content = function(page_data, revision_index) {
		var revision = get_page_content.revision(page_data, revision_index);
		return !!revision_content(revision);
	};

	// ------------------------------------------------------------------------

	// @see CeL.application.net.wiki.data
	// 以下兩者必須不可能為 entity / property 之屬性。
	// 相關/對應頁面。
	var KEY_CORRESPOND_PAGE = typeof Symbol === 'function' ? Symbol('correspond page')
			: 'page';

	// ------------------------------------------------------------------------

	// https://www.mediawiki.org/w/api.php?action=help&modules=sitematrix
	// https://zh.wikipedia.org/w/api.php?action=help&modules=paraminfo

	// https://noc.wikimedia.org/conf/InitialiseSettings.php.txt
	// https://noc.wikimedia.org/conf/highlight.php?file=InitialiseSettings.php
	// https://noc.wikimedia.org/conf/VariantSettings.php.txt
	// https://phabricator.wikimedia.org/T233070

	// https://www.mediawiki.org/wiki/Manual:LocalSettings.php

	// get_site_configurations
	// https://zh.wikipedia.org/w/api.php?action=help&modules=query%2Bsiteinfo
	// https://www.mediawiki.org/wiki/API:Siteinfo
	// https://zh.wikipedia.org/w/api.php?action=query&meta=siteinfo&siprop=general%7Cnamespaces%7Cnamespacealiases%7Cstatistics&utf8
	function wiki_API_siteinfo(options, callback) {
		// console.log([ options, callback ]);
		var action = {
			action : 'query',
			meta : 'siteinfo'
		};
		if (wiki_API.need_get_API_parameters(action, options,
				wiki_API[action.meta], arguments)) {
			return;
		}

		var session = wiki_API.session_of_options(options);
		// https://zh.wikipedia.org/w/api.php?action=query&meta=siteinfo&siprop=general|namespaces|namespacealiases|specialpagealiases|magicwords|extensiontags|protocols&utf8&format=json
		options = Object.assign({
			siprop : 'general|namespaces|namespacealiases|specialpagealiases'

			// magicwords: #重定向 interwikimap, thumb %1px center,
			+ '|magicwords|functionhooks|variables'

			// + '|languages'
			+ '|interwikimap|languagevariants'

			// for {{NUMBEROFPAGES}} @ function
			// evaluate_parser_function_token(options)
			+ '|statistics'

			// 工作隊列lag
			// + '|dbrepllag'

			// + '|usergroups'
			+ '|restrictions'
			// + '|defaultoptions'
			+ '|uploaddialog|skins|rightsinfo'

			// + '|showhooks|libraries|extensions'
			+ '|extensiontags|protocols|fileextensions'

			&& session.API_parameters['query+siteinfo']
			// get all prop
			.parameter_Map.get('prop').type.join('|')
		}, options);

		var siteinfo = session && session.get_storage(action.meta);
		if (siteinfo) {
			adapt_site_configurations(session, siteinfo);
			callback(siteinfo);
			return;
		}
		// Get flash siteinfo instead

		// ------------------------------------------------

		action = wiki_API.extract_parameters(options, action, true);
		// console.trace([ options, action ]);

		wiki_API.query(action, function(response, error) {
			// console.log(JSON.stringify(response));
			error = error || response && response.error;
			if (error) {
				callback(response, error);
				return;
			}

			var siteinfo = response.query;
			siteinfo.siprop = options.siprop;
			if (session) {
				// cache siteinfo
				session.set_storage(action.meta, siteinfo);
				adapt_site_configurations(session, siteinfo);
			}
			callback(siteinfo);
		}, null, session);
	}

	wiki_API.siteinfo = wiki_API_siteinfo;

	// --------------------------------------------------------------------------------------------

	// [ all, tag, attributes, inner, ending, end_tag ]
	function get_PATTERN_full_tag(tags, must_end_tag, flags) {
		if (Array.isArray(tags))
			tags = tags.join('|');
		return new RegExp('<(' + tags
		// <s/>s</s> 會被正常解析為 <s>s</s>。
		+ ')([\\s/][^<>]*)?>([\\s\\S]*?)(' + (must_end_tag ? '' : '$|')
				+ '<\\/(\\1(?:\\s[^<>]*)?)>)', flags || 'ig');
	}

	// default_site_configurations
	wiki_API.prototype.configurations = {
	//
	};

	// @see [[Special:Interwiki]] 跨維基資料 跨 wiki 字首
	// @see https://noc.wikimedia.org/wiki.php?wiki=jawiktionary
	function adapt_site_configurations(session, configurations) {
		// console.log(configurations);
		var site_configurations = session.configurations;
		session.latest_site_configurations = configurations;
		if (site_configurations === wiki_API.prototype.configurations) {
			session.configurations = site_configurations
			//
			= Object.assign(Object.create(null),
			//
			wiki_API.prototype.configurations);
		}

		if (!configurations) {
			library_namespace
					.error('adapt_site_configurations: No configurations got!');
			return;
		}

		var general = configurations.general;
		// Using `session.latest_site_configurations.general.variants`
		// to test if langconversion is configured in the site.
		session.has_languagevariants = general && !!general.variants;

		if (general) {
			// site_configurations.general = general;
			'mainpage|sitename|linktrail|legaltitlechars|invalidusernamechars|case|lang|maxarticlesize|timezone|timeoffset|maxuploadsize'
					.split('|').forEach(function(name) {
						site_configurations[name] = general[name];
					});

			site_configurations.magiclinks = Object.keys(general.magiclinks);
			site_configurations.lang_fallback = general.fallback.map(function(
					lang) {
				return lang.code;
			});
		}

		// https://en.wikipedia.org/wiki/Wikipedia:Village_pump_(technical)/Archive_210#About_wikia_flag_in_Special:Interwiki
		// changing [[Special:Interwiki]] matrix for all Wikimedia projects
		// should be brought up at [[meta:Talk:Interwiki map]].
		// Local projects can not override this list.
		var interwikimap =
		// session.has_languagevariants &&
		configurations.interwikimap;
		if (interwikimap) {
			// prefix_pattern
			site_configurations.interwiki_pattern = new RegExp('^('
					+ interwikimap.map(function(interwiki) {
						return interwiki.prefix;
					}).join('|') + ')(?::(.*))?$', 'i');
			// 不可刪除 configurations.interwikimap: 還會用到。
		}

		var languagevariants = configurations.languagevariants;
		if (languagevariants && languagevariants.zh) {
			delete languagevariants.zh.zh;
			delete languagevariants.zh['zh-hans'];
			delete languagevariants.zh['zh-hant'];

			// language fallbacks
			site_configurations.lang_fallbacks = Object.create(null);
			for ( var lang_code in languagevariants.zh) {
				site_configurations.lang_fallbacks[lang_code] = languagevariants.zh[lang_code].fallbacks;
			}
			// Release memory. 釋放被占用的記憶體。
			// delete configurations.languagevariants;
		}

		// --------------------------------------------------------------------

		var magic_words_hash = Object.create(null);
		site_configurations.magic_words_hash = magic_words_hash;

		// console.trace(configurations.functionhooks);
		configurations.functionhooks
		//
		&& configurations.functionhooks.forEach(function(magic_word) {
			magic_words_hash[magic_word.toUpperCase()] = true;
		});
		// Release memory. 釋放被占用的記憶體。
		// delete configurations.functionhooks;

		configurations.variables
		// 可能在 .functionhooks 已設定，但以此處為主。
		// 例如 {{Fullurl}} 應被視作 template。
		// {{PAGENAME}}, {{NAMESPACE}}, {{NAMESPACENUMBER}} 之類可以引用當前頁面為參數
		// argument。
		&& configurations.variables.forEach(function(magic_word) {
			// https://harrypotter.fandom.com/api.php?action=query&meta=siteinfo&siprop=variables&utf8&format=json
			// [{"id":"wgLanguageCode","*":"en"},{"id":"wgCityId","*":509}]
			if (typeof magic_word === 'string')
				magic_words_hash[magic_word.toUpperCase()] = false;
		});
		// Release memory. 釋放被占用的記憶體。
		// delete configurations.variables;

		configurations.magicwords
		//
		&& configurations.magicwords.forEach(function(magic_word_data) {
			var name = magic_word_data.name.toUpperCase();
			var map_to;
			if (name in magic_words_hash) {
				// 在 .variables, .functionhooks 已設定，以先前設定為主。
				map_to = magic_words_hash[name];
			} else {
				// 無法自此處判斷是否需要參數。皆設定為需要參數。
				magic_words_hash[name] = map_to = name;
			}
			magic_word_data.aliases.forEach(function(magic_word) {
				magic_word = magic_word.toUpperCase();
				// Do not overwrite value
				if (!(magic_word in magic_words_hash)
				// TODO: 另外處理這些特別的 magic words
				&& !/[#:]|\$\d/.test(magic_word)) {
					magic_words_hash[magic_word] = map_to;
				}
			});
		});
		// Release memory. 釋放被占用的記憶體。
		// delete configurations.magicwords;

		// --------------------------------------------------------------------

		// @see wiki_extensiontags @ CeL.application.net.wiki.parser.wikitext
		// <noinclude>, ‎<includeonly> 在解析模板時優先權必須高於其他 tags。
		var extensiontag_list = [ 'includeonly', 'noinclude' ];

		configurations.extensiontags
		//
		&& configurations.extensiontags.forEach(function(extensiontag) {
			extensiontag = extensiontag.replace(/^</, '').replace(/>$/, '');
			extensiontag_list.push(extensiontag.toLowerCase());
		});

		site_configurations.extensiontag_hash = extensiontag_list.to_hash();

		site_configurations.PATTERN_extensiontags = wiki_API
				.get_PATTERN_full_tag(extensiontag_list, true);

		site_configurations.PATTERN_non_extensiontags = wiki_API
				.get_PATTERN_full_tag(wiki_API.markup_tags
						.filter(function(tag) {
							return !extensiontag_list.includes(tag);
						}));

		// --------------------------------------------------------------------

		var namespaces = configurations.namespaces;
		var namespacealiases = configurations.namespacealiases;
		if (namespaces && namespacealiases) {
			// create
			// session.configurations[namespace_hash,name_of_NO,namespace_pattern]
			var namespace_hash
			// namespace_hash[namespace] = NO
			= site_configurations.namespace_hash = Object.create(null);
			site_configurations.name_of_NO = Object.create(null);
			for ( var namespace_NO in namespaces) {
				var namespace_data = namespaces[namespace_NO];
				namespace_NO = +namespace_NO;
				// namespace_data.canonical || namespace_data.content
				var name = namespace_data['*'];
				if (typeof name === 'string') {
					site_configurations.name_of_NO[namespace_NO] = name;
					namespace_hash[name.toLowerCase()] = namespace_NO;
				}
				if (namespace_data.canonical
						&& typeof namespace_data.canonical === 'string'
						&& namespace_data.canonical !== name) {
					namespace_hash[namespace_data.canonical.toLowerCase()] = namespace_data.id;
				}
			}
			namespacealiases.forEach(function(namespace_data) {
				namespace_hash[namespace_data['*'].toLowerCase()]
				//
				= namespace_data.id;
			});
			site_configurations.namespace_pattern = generate_namespace_pattern(
					namespace_hash, []);
		}
		// Release memory. 釋放被占用的記憶體。
		// delete configurations.namespaces;
		// delete configurations.namespacealiases;
	}

	// ----------------------------------------------------

	/**
	 * 從網頁取得/讀入自動作業用的人為設定 manual settings。
	 * 
	 * TODO: 檢查設定。
	 * 
	 * @param {String}task_configuration_page
	 *            自動作業用的設定頁面標題。 e.g., "User:bot/設定"
	 * @param {Function}configuration_adapter
	 *            整合設定用的處理函式。應考慮頁面不存在、胡亂設定、沒有設定之情況！
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * 設定頁面措辭模板:<code>

	{{Bot use warning|bot=[[User:cewbot]]}}
	本頁面為機器人執行___作業的設定頁面。每次執行作業前，機器人都會先從本頁面讀入設定。本設定頁面將影響___作業功能，應受適當保護以免受破壞。且應謹慎編輯，以防機器人無法讀取。移動本頁面必須留下重定向。

	自動生成的報表請參見：[[User:cewbot/report]]。
	請注意：變更本頁面後，起碼必須等數分鐘，機器人才會應用新的設定。
	參見：
	GitHub上的原始碼 (source code)
	已知無法解決問題：

	</code>
	 */
	function adapt_task_configurations(task_configuration_page,
			configuration_adapter, options) {
		options = library_namespace.setup_options(options);
		var session = this, task_configuration = session.task_configuration
				|| (session.task_configuration = Object.create(null));
		if (typeof configuration_adapter === 'function') {
			if (!options.once)
				session.task_configuration.configuration_adapter = configuration_adapter;
		} else {
			configuration_adapter = session.task_configuration.configuration_adapter;
		}

		if (!task_configuration_page
				&& !(task_configuration_page = task_configuration.configuration_page_title)) {
			configuration_adapter && configuration_adapter();
			return;
		}
		library_namespace.debug('Try to get configurations from '
				+ task_configuration_page, 1, 'adapt_task_configurations');

		if (!options.once && ('min_interval' in options)) {
			// 最小檢測時間間隔
			if (options.min_interval > 0)
				task_configuration.min_interval = options.min_interval;
			else if (!options.min_interval)
				delete task_configuration.min_interval;
		}

		if (task_configuration.last_update) {
			// 曾經取得設定過。
			if (task_configuration.min_interval > Date.now()
					- task_configuration.last_update) {
				// 時間未到。
				configuration_adapter && configuration_adapter();
				return;
			}

			if (wiki_API.is_page_data(task_configuration_page)) {
				// TODO: test timestamp
				adapt_configuration(task_configuration_page);
				return;
			}

			// checck if there is new version.
			session.page(task_configuration_page, function(page_data) {
				if ((task_configuration.min_interval || 0) > Date
						.parse(page_data.touched)
						- task_configuration.last_update) {
					// No new version
					configuration_adapter && configuration_adapter();
					return;
				}
				fetch_configuration();
			}, {
				prop : 'info',
				redirects : 1
			});
			return;
		}

		fetch_configuration();

		function fetch_configuration() {
			// library_namespace.set_debug(6);
			session.page(task_configuration_page, adapt_configuration, {
				redirects : 1
			});
		}

		// setup_configuration()
		function adapt_configuration(page_data) {
			// console.trace(page_data);
			// console.trace(wiki_API.content_of(page_data));
			if (!wiki_API.content_of.page_exists(page_data)) {
				library_namespace.debug('No configuration page: '
						+ wiki_API.title_link_of(page_data), 1,
						'adapt_task_configurations');
				// 有時必須初始設定，還是得執行 configuration_adapter。
				// return;
			} else {
				library_namespace.info([ 'adapt_task_configurations: ', {
					// gettext_config:{"id":"get-configurations-from-page-$1"}
					T : [ 'Get configurations from page %1',
					//
					wiki_API.title_link_of(page_data) ]
				} ]);
			}

			if (!options.once) {
				// cache
				Object.assign(task_configuration, {
					// `session.task_configuration.configuration_page_title`
					// {String}設定頁面。已經轉換過、正規化後的最終頁面標題。 e.g., "User:bot/設定"
					configuration_page_title : page_data.title,
					// configuration_pageid : page_data.id,
					last_update : Date.now()
				});
			}
			// parse latest raw task configurations using function
			// parse_configuration(wikitext, options) @
			// CeL.application.net.wiki.parser.misc
			var configuration = wiki_API.parse.configuration(page_data);
			// console.trace(configuration);
			// TODO: valid configuration 檢測數值是否合適。
			session.latest_task_configuration = configuration;

			// 本地化 Localization: load localized messages.
			// e.g., [[w:en:User:Cewbot/log/20150916/configuration]]
			if (library_namespace.is_Object(configuration.L10n)) {
				// `gettext.get_domain_name()` for default language
				var language = gettext.to_standard(session.language
						|| wiki_API.language);
				/** {Object}L10n messages. 符合當地語言的訊息內容。 */
				gettext.set_text(configuration.L10n, language);
				// console.trace(configuration.L10n);
				library_namespace.info([ 'adapt_task_configurations: ', {
					// gettext_config:{"id":"load-$2-$1-messages-for-$3"}
					T : [ 'Load %2 %1 messages for %3.',
					//
					wiki_API.site_name(session), language,
					//
					Object.keys(configuration.L10n).length ]
				} ]);
				// Release memory. 釋放被占用的記憶體。
				// delete configuration.L10n;
			}

			if (typeof configuration_adapter === 'function') {
				// 每次更改過設定之後，重新執行一次。
				// 檢查從網頁取得的設定，檢測數值是否合適。

				// cache actions, 盡可能即時適用新的設定。
				var old_actions = session.actions.splice(0,
						session.actions.length);
				configuration_adapter.call(session, configuration);
				session.actions.append(old_actions);
				// console.trace([ session.running, session.actions ]);
				// configuration === wiki_session.latest_task_configuration
			}
			// Object.seal(configuration);
		}
	}

	wiki_API.prototype.adapt_task_configurations = adapt_task_configurations;

	// @see function add_listener(listener, options) @
	// CeL.application.net.wiki.page
	// 延遲 adapt 設定的時間: 預設為過5分鐘才 adapt configuration
	// lag_to_adapt_task_configurations
	// library_namespace.to_millisecond('5 min')
	wiki_API.prototype.delay_time_to_adapt_task_configurations = 5 * 60 * 1000;

	// html to wikitext
	// https://zh.wikipedia.org/w/api.php?action=help&modules=flow-parsoid-utils

	// ========================================================================

	// Wikimedia project code alias
	// https://doc.wikimedia.org/mediawiki-core/master/php/LanguageCode_8php_source.html
	// https://github.com/wikimedia/mediawiki/blob/master/languages/LanguageCode.php
	// language_code_to_site_alias[language code] = project code
	// @see function language_to_site_name(language, project)
	// @see [[en:Wikimedia_project#Project_codes]]
	var language_code_to_site_alias = {
		// als : 'sq',
		'be-x-old' : 'be-tarask',
		cmn : 'zh',
		// gsw : 'als',
		// hbs : 'sh',
		// TODO: https://phabricator.wikimedia.org/T30443
		// https://github.com/wikimedia/mediawiki/blob/3f08cd7/includes/language/LanguageCode.php#L47
		// 建議棄用zh-classical、改用lzh。
		lzh : 'zh-classical',
		nan : 'zh-min-nan',
		nb : 'no',
		nob : 'no',
		rup : 'roa-rup',
		sgs : 'bat-smg',
		vro : 'fiu-vro',
		// 為粵文維基百科特別處理。
		yue : 'zh-yue',
		bih : 'bh',

		// 為日文特別修正: 'jp' is wrong!
		jp : 'ja'
	},
	// @see function set_default_language(language)
	valid_language = 'nds-nl|map-bms'.split('|').to_hash();

	Object.entries(language_code_to_site_alias).forEach(function(pair) {
		if (pair[0].includes('-'))
			valid_language[pair[0]] = true;
		if (pair[1].includes('-'))
			valid_language[pair[1]] = true;
	});

	// gettext_config:{"id":"continue-key"}
	var default_continue_key = 'Continue key';
	/** {String}後續索引。後續檢索用索引值標記名稱。 */
	wiki_API.prototype.continue_key = default_continue_key;

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
		// console.trace(language);
		if (wiki_API.is_wiki_API(language))
			language = language.language;
		if (typeof language !== 'string'
				|| !PATTERN_PROJECT_CODE_i.test(language)) {
			if (language) {
				// console.trace(language);
				library_namespace.warn(
				//
				'set_default_language: Invalid language: [' + language
						+ ']. e.g., "en".');
			} else {
				// to get default language
			}
			return wiki_API.language;
		}

		// assert: default language is in lower case. See URL_to_wiki_link().
		language = language.toLowerCase();
		if (language in language_code_to_site_alias)
			language = language_code_to_site_alias[language];
		wiki_API.language = language;
		// default api URL. Use <code>CeL.wiki.API_URL = api_URL('en')</code> to
		// change it.
		// see also: application.locale
		wiki_API.API_URL = gettext.guess_language && gettext.guess_language()
				|| library_namespace.is_WWW()
				&& (navigator.userLanguage || navigator.language)
				|| wiki_API.language;
		if (!(wiki_API.API_URL in valid_language)) {
			// 'en-US' → 'en'
			wiki_API.API_URL = wiki_API.API_URL.toLowerCase().replace(/-.+$/,
					'');
			// e.g., 'cmn'
			// Cannot use `wiki_API.language_code_to_site_alias`
			if (wiki_API.API_URL in language_code_to_site_alias)
				wiki_API.API_URL = language_code_to_site_alias[wiki_API.API_URL];
		}
		// console.trace(wiki_API.API_URL);
		wiki_API.API_URL = api_URL(wiki_API.API_URL);
		library_namespace.debug('wiki_API.API_URL = ' + wiki_API.API_URL, 3,
				'set_default_language');

		if (wiki_API.SQL && wiki_API.SQL.config) {
			wiki_API.SQL.config.set_language(wiki_API.language);
		}

		wiki_API.prototype.continue_key = gettext(default_continue_key);

		return wiki_API.language;
	}

	// 設定預設之語言。 English
	set_default_language(
	// `wiki_API.mw_web_session` is not initialized at this time.
	wiki_API.mw_web_session && (
	// mediaWiki.user.options.get('language') === 'zh-tw'
	mediaWiki.config.get('wgContentLanguage')
	// wgULSCurrentAutonym: "中文（台灣）‎"
	// || mediaWiki.config.get('wgPreferredVariant')
	// || mediaWiki.config.get('wgUserVariant')
	// || mediaWiki.config.get('wgUserLanguage')
	// || mediaWiki.config.get('wgPageContentLanguage')
	// {Array} wgULSAcceptLanguageList
	// || mediaWiki.config.get('wgULSAcceptLanguageList')
	// || mediaWiki.config.get('wgULSBabelLanguages')
	) || 'en');

	// [[:en:right-to-left#RTL Wikipedia languages]]
	// 找出使用了由右至左的文字，可用於{{lang}}模板。
	// 應該改用{{tl|rtl-lang}}處理右至左文字如阿拉伯語及希伯來語，請參見{{tl|lang}}的說明。
	// [ all ]
	var LTR_SCRIPTS = 'ar[cz]?|he|fa|bcc|bqi|ckb|dv|glk|kk|lrc|mzn|pnb|ps|sd|u[gr]|yi|tg-Arab',
	// CeL.wiki.PATTERN_LTR.test('ar')===true
	PATTERN_LTR = new RegExp('^(?:' + LTR_SCRIPTS + ')$');

	// ------------------------------------------------------------------------

	// is site using wikidata nomenclature 命名法
	function is_wikidata_site_nomenclature(site_or_language) {
		// TODO: 不是有包含'wiki'的全都是site。
		library_namespace.debug('Test ' + site_or_language, 3,
				'is_wikidata_site_nomenclature');
		return /^[a-z_\d]{2,20}?(?:wiki(?:[a-z]{4,7})?|wiktionary)$/
				.test(site_or_language);
	}

	// ------------------------------------------------------------------------

	if (false) {
		wiki_session.register_redirects([ template_name_1, template_name_2,
				template_name_3 ], {
			namespace : 'Template'
		});

		// ...

		wiki_session.page(page_title, function(page_data) {
			/** {Array} parsed page content 頁面解析後的結構。 */
			var parsed = CeL.wiki.parser(page_data).parse();
			parsed.each('Template:template_name',
					function(token, index, parent) {
						// ...
					});

			// or:

			parsed.each('template', function(token, index, parent) {
				if (wiki_session.is_template(template_name_1, token)) {
					// ...

				} else if (wiki_session.is_template(template_name_2, token)) {
					// ...
				}

				// or:
				switch (wiki_session.redirect_target_of(token)) {
				case wiki_session.redirect_target_of(template_name_1):
					break;
				case wiki_session.redirect_target_of(template_name_2):
					break;
				case wiki_session.redirect_target_of(template_name_3):
					break;
				}
			});

			// or:

			parsed.each(function(token, index, parent) {
				if (token.type === 'transclusion'
				// ↑ typeof token !== 'string' 也可能通過測試。
				&& wiki_session.is_template(template_name, token)) {
					// ...
				}
			});
		});
	}

	// wiki_session.normalize_alias(page_title)
	function redirect_target_of(page_title, options) {
		if (!page_title)
			return page_title;

		// var page_title_template_token;
		if (Array.isArray(page_title)) {
			if (page_title.type !== 'transclusion') {
				return page_title.map(function(title) {
					return this.redirect_target_of(title, options);
				}, this);
			}

			// console.trace(page_title);
			// treat `page_title` as template token
			// page_title_template_token = page_title;
			page_title = page_title.page_title;
		}

		if (options && options.namespace) {
			page_title = this.to_namespace(page_title, options.namespace);
		}
		page_title = this.normalize_title(page_title);

		// console.trace(this.redirects_data, page_title);
		// console.trace(page_title + '→' + this.redirects_data[page_title]);

		if (this.redirects_data[page_title])
			return this.redirects_data[page_title];

		var pattern_hash = this.redirects_variants_patterns
				&& this.redirects_variants_patterns[this.remove_namespace(
						page_title).chars()[0]];
		if (false) {
			console.trace(pattern_hash, page_title, this.remove_namespace(
					page_title).chars()[0]);
		}
		if (pattern_hash) {
			var page_namespace = this.namespace(page_title);
			for ( var pattern_id in pattern_hash) {
				var pattern_data = pattern_hash[pattern_id];
				if (page_namespace !== pattern_data[2])
					continue;
				var pattern = pattern_data[0];
				if (pattern.test(page_title)) {
					return pattern_data[1];
				}
			}
		}

		return page_title;
	}

	function aliases_of_page(page_title, options) {
		page_title = this.normalize_title(page_title);
		options = library_namespace.setup_options(options);
		if (Array.isArray(page_title)) {
			var list = [];
			page_title.forEach(function(title) {
				list.append(this.aliases_of_page(title, options));
			}, this);
			return list;
		}

		return this.redirects_data[page_title] ? Object.keys(
				this.redirects_data).filter(function(_page_title) {
			return (!options.alias_only || _page_title !== page_title)
			//
			&& this.redirects_data[_page_title] === page_title;
		}, this) : [ page_title ];
	}

	// TODO: test for 'Module:Check for unknown parameters'
	function is_template(template_name_to_test, template_token, options) {
		if (!template_name_to_test || !template_token) {
			// e.g., async function for_each_discussion_page(page_data) @
			// 20210429.Auto-archiver.js:130
			return;
		}

		options = Object.assign({
			namespace : 'Template'
		}, options);

		var session = wiki_API.session_of_options(options)
				|| wiki_API.is_wiki_API(this) && this;

		if (Array.isArray(template_token)
				&& !template_token.type
				&& (!Array.isArray(template_name_to_test) || template_name_to_test.type)) {
			// Swap
			var tmp = template_name_to_test;
			template_name_to_test = template_token;
			template_token = tmp;
		}

		if (template_token.type === 'transclusion') {
			// treat `template_token` as template token
			// assert: template_token.name is normalized
			template_token = template_token.name;
		}

		// console.trace([ template_token, template_name_to_test ]);
		if (template_name_to_test.type === 'transclusion') {
			// e.g., wiki.is_template(template_token, template_name_to_test);
			template_name_to_test = template_name_to_test.name;

		} else if (session && Array.isArray(template_name_to_test)
				&& !template_name_to_test.type) {
			if (!template_name_to_test.normalized_template_name_Set) {
				template_name_to_test.normalized_template_name_Set = new Set(
				// normalize
				session.redirect_target_of ? session.redirect_target_of(
						template_name_to_test, options) : template_name_to_test);
				// console.trace(template_name_to_test.normalized_template_name_Set);
			}
			if (session
			// session === wiki_API?
			&& session.redirect_target_of) {
				// normalize template name
				template_token = session.redirect_target_of(template_token,
						options);
			} else {
				template_token = wiki_API.normalize_title(template_token,
						options);
			}
			if (false) {
				console.trace(template_token,
						template_name_to_test.normalized_template_name_Set);
			}
			return template_name_to_test.normalized_template_name_Set
					.has(template_token);
		}

		// ------------------------------------------------------------

		if (session) {
			// normalize template name
			template_name_to_test = session.redirect_target_of(
					template_name_to_test, options);
			template_token = session
					.redirect_target_of(template_token, options);
		} else {
			template_name_to_test = wiki_API.normalize_title(
					template_name_to_test, options);
			template_token = wiki_API.normalize_title(template_token, options);
		}

		// console.trace([ template_name_to_test, template_token ]);
		return Array.isArray(template_name_to_test) ? template_name_to_test
				.includes(template_token)
				: Array.isArray(template_token) ? template_token
						.includes(template_name_to_test)
						: template_name_to_test === template_token;
	}

	// --------------------------------------------------------------------------------------------

	wiki_API.has_storage = typeof localStorage === 'object'
			&& library_namespace.is_type(localStorage, 'Storage');
	// Must be {String} for localStorage
	// retrieve_date
	var KEY_storage_date = 'storage date';

	function get_storage(key) {
		var session = this;
		if (!session.localStorage_prefix)
			return;

		var value = localStorage.getItem(session.localStorage_prefix + key);
		try {
			value = JSON.parse(value);
			if (value[KEY_storage_date]) {
				value[KEY_storage_date] = new Date(value[KEY_storage_date]);
			}
		} catch (e) {
			// JSON.parse() or new Date() error
			return;
		}

		if (Date.now() - value[KEY_storage_date] < session.storage_life) {
			return value;
		}
	}

	// 不常改變的資料可以存放在 localStorage。
	function set_storage(key, value) {
		var session = this;
		if (!session.localStorage_prefix)
			return;

		if (value === undefined || value === null) {
			localStorage.removeItem(session.localStorage_prefix + key);
		} else {
			// assert: library_namespace.is_Object(value)
			value[KEY_storage_date] = new Date;
			// cache key=value
			value = JSON.stringify(value);
			localStorage.setItem(session.localStorage_prefix + key, value);
		}
	}

	// --------------------------------------------------------------------------------------------

	var API_path_separator = '+', KEY_API_parameters = 'API parameters';
	// @inner
	function extract_path_from_parameters(parameters) {
		if (Array.isArray(parameters)) {
			if (is_api_and_title(parameters, true)) {
				// assert: [ API, parameters ]
				// e.g., [ 'ja', {action:'edit'} ]
				parameters = parameters[1];
			} else {
				// e.g., [ 'query', 'revisions' ]
				parameters = parameters.join(API_path_separator);
			}
		}
		if (typeof parameters === 'string')
			return parameters;

		if (parameters.path)
			return parameters.path;

		if (!library_namespace.is_Object(parameters)
				&& !library_namespace.is_Search_parameters(parameters)) {
			return;
		}

		var path = parameters.action;
		if (!path)
			return;

		if (path === 'query') {
			(wiki_API.page.query_modules
			// for action=query&prop=... , &list=... , &meta=...
			|| [ 'prop', 'meta', 'list' ]).some(function(submodule) {
				var submodule_list = parameters[submodule];
				if (!submodule_list)
					return;

				submodule_list = submodule_list.split(/[,;|]/)
				// e.g., prop: 'revisions|links'
				.map(function(submodule) {
					return submodule
					//
					&& (path + API_path_separator + String(submodule).trim());
				}).filter(function(submodule) {
					return !!submodule;
				});

				if (submodule_list.length === 0)
					return;

				// console.trace(submodule_list);
				path = submodule_list;
				return true;
			});
		}
		// console.trace(path);
		return path;
	}

	if (false) {
		// Place in front of function caller() code:
		if (wiki_API.need_get_API_parameters(/* action */'path+path', options,
				caller, arguments)) {
			return;
		}

		// ...

		// Place in front of function wiki_API.query() code for GET:
		action = wiki_API.extract_parameters(options, action, true);
		// or for POST:
		// var post_data = wiki_API.extract_parameters(options, action);

		// @see function wiki_API_siteinfo(), wiki_API_edit()
	}

	var KEY_API_parameters_callback = typeof Symbol === 'function' ? Symbol('API parameters callback')
			: '\0API parameters callback';
	// @inner of need_get_API_parameters()
	function API_parameters__run_callback(session, path) {
		var callback_queue = session.API_parameters[KEY_API_parameters_callback];
		// assert: library_namespace.is_Object(session.API_parameters[path])
		// && Array.isArray(callback_queue[path])
		callback_queue[path].forEach(function(caller) {
			// console.trace(caller);
			// [ caller, _this, caller_arguments ]
			caller[0].apply(caller[1], caller[2]);
		});
		delete callback_queue[path];
	}

	// TODO: 'query+*'
	function need_get_API_parameters(path, options, caller, caller_arguments) {
		var session = wiki_API.session_of_options(options);
		if (!session) {
			// e.g., call `CeL.wiki.page();` directly with anonymous.
			library_namespace.debug('Must set session to check the necessity.',
					1, 'need_get_API_parameters');
			// console.trace(options);
			return;
		}

		path = extract_path_from_parameters(path);
		if (wiki_API.has_storage && !session.API_parameters[KEY_storage_date]) {
			// debugger;
			session.API_parameters = session.get_storage(KEY_API_parameters)
					|| session.API_parameters;
			// rebuild .parameter_Map
			build_parameter_Map(modules);
			if (false && !session.API_parameters[KEY_storage_date]) {
				throw new Error('storage error!');
				session.API_parameters[KEY_storage_date] = new Date;
			}
		}
		if (session.API_parameters[path]) {
			library_namespace.debug('Needless to get parameters of path: '
					+ path, 3, 'need_get_API_parameters');
			if (library_namespace.is_debug(6))
				console.trace(path);
			return false;
		}

		var callback_queue = session.API_parameters[KEY_API_parameters_callback];
		if (!callback_queue) {
			// initialization
			callback_queue = session.API_parameters[KEY_API_parameters_callback] = Object
					.create(null);
		}

		// console.trace([ path, caller ]);
		if (caller) {
			if (!Array.isArray(caller) || caller_arguments !== undefined) {
				// [ caller, _this, caller_arguments ]
				caller = [ caller, null, caller_arguments ];
			}

			if (callback_queue[path]) {
				// 登記要執行的 callback。當多行程複數request一同執行時，可避免卡在一起。
				callback_queue[path].push(caller);

			} else {
				callback_queue[path] = [ caller ];
				library_namespace.debug(
						'Will execute caller later after get API parameters of ['
								+ path + ']...', 1, 'need_get_API_parameters');
				// console.trace(path);
				get_API_parameters(path,
				// `options` 是用在原先的函數 caller()，包含許多額外的 parameters，
				// 會影響 wiki_API.query() @ get_API_parameters()，因此這邊只取 session。
				add_session_to_options(session),
				//
				function(modules, error, data) {
					// console.trace(data);
					if (error)
						throw error;
					API_parameters__run_callback(session, path);
				});
			}
		}
		return true;
	}

	wiki_API.need_get_API_parameters = need_get_API_parameters;

	if (false) {
		// usage:
		CeL.wiki.get_API_parameters('query+revisions', {
			session : wiki
		}, function(modules, error, data) {
			console.log([ modules, error ]);
		});

		// 檢測有沒有此項參數 @ function wiki_API_page()
		if (!session
				|| session.API_parameters['query+revisions'].parameter_Map.slots) {
			// ...
		}
	}

	// @inner
	function build_parameter_Map(modules) {
		// session.API_parameters[modules.path].parameter_Map
		var parameter_Map = modules.parameter_Map = new Map;
		modules.parameters.forEach(function(parameter_data) {
			// assert: library_namespace.is_Object(parameter_data)
			var key = parameter_data.name;
			if (parameter_Map.get(key)) {
				library_namespace.warn('已設定過 ' + modules.path + '+' + key
						+ ' 的參數資料');
			}
			parameter_Map.set(key, parameter_data);
		});
	}

	function get_API_parameters(path, options, callback) {
		path = extract_path_from_parameters(path);
		// Error.stackTraceLimit = Infinity;
		// console.trace([ path, options ]);
		// Error.stackTraceLimit = 10;
		// https://www.mediawiki.org/w/api.php?action=help&modules=paraminfo
		wiki_API.query([ , {
			action : 'paraminfo',
			// helpformat : 'wikitext',
			modules : path
		} ], function(data, error) {
			// console.trace([ data, error ]);
			var modules = !error && data && data.paraminfo
					&& Array.isArray(data.paraminfo.modules)
					&& data.paraminfo.modules[0];
			// console.trace(modules);
			if (!modules) {
				if (!error && data.warnings && data.warnings.paraminfo
				/**
				 * <code>

				{"warnings":{"paraminfo":{"*":"The module \"query\" does not have a submodule \"ids\"."}},"paraminfo":{"helpformat":"none"}}

				</code>
				 */
				&& data.warnings.paraminfo['*']) {
					error = new Error(data.warnings.paraminfo['*']);
					// console.trace(path, options, callback);
				}

				callback(undefined, error
				//
				|| new Error('Unknown query result'));
				return;
			}

			// assert: path === modules.path
			// console.trace([ path, modules.path ]);
			var session = wiki_API.session_of_options(options);
			if (session) {
				session.API_parameters[modules.path] = modules;

				session.set_storage(KEY_API_parameters,
				// session.get_storage(KEY_API_parameters) @
				// need_get_API_parameters()
				session.API_parameters);
				// modules.parameter_Map should disappeared @ localStorage
				build_parameter_Map(modules);
				library_namespace.info([ 'get_API_parameters: ', {
					T : [
					// gettext_config:{"id":"cache-information-about-the-api-modules-of-$1-module-path=$2"}
					"Cache information about the API modules of %1: module path=%2"
					//
					, wiki_API.site_name(session), path ]
				} ]);
				// console.trace(Object.keys(modules.parameter_Map));
				// console.trace(session.API_parameters);
			}
			if (callback)
				callback(modules, null, data);
		}, null, options);
	}

	wiki_API.get_API_parameters = get_API_parameters;

	// extract_parameters_from_options
	// 應盡量少用混雜的方法，如此可能有安全疑慮(security problem)。
	// @see ibrary_namespace.import_options()
	function extract_parameters(from_parameters, action,/* use GET */
	use_original_action) {
		if (action && (is_api_and_title(action)
		//
		|| library_namespace.is_Search_parameters(action[1]))) {
			action = action[1];
		}
		var session = wiki_API.session_of_options(action)
				|| wiki_API.session_of_options(from_parameters);
		var path = extract_path_from_parameters(action)
				|| extract_path_from_parameters(from_parameters);
		// console.trace(path);

		if (use_original_action) {
			// TODO: fix below: 可能已不再適用

			// 必須採用:
			// action = wiki_API.extract_parameters(options, action, true);
			// 或者:
			// post_data = wiki_API.extract_parameters(options, action);

			// 而非單純 `wiki_API.extract_parameters(options, action, true);`
			// 這樣可能不會更新 action !
		} else {
			// action = library_namespace.setup_options(action);
			action = library_namespace.Search_parameters(action);
		}

		var extract_to = use_original_action ? action
		// use POST
		// : Object.create(null)
		: new library_namespace.Search_parameters();

		var parameters = action.parameters || Object.keys(from_parameters);
		// console.trace(parameters);

		if (!session || !path) {
			library_namespace.warn('No session or no path settled!');
			if (session) {
				console.trace([ session, path, action, from_parameters ]);
			}
		}

		function for_each_parameter(key) {
			// if (typeof key !== 'string') return;

			// !key || key === KEY_SESSION will be deleted later

			/** Normalized key, used in `limited_parameters`. */
			var _key = key;
			if (limited_parameters) {
				// `limited_parameters` 中的 key 已去除 prefix。
				if (prefix) {
					if (key.startsWith(prefix)) {
						_key = key.slice(prefix.length);
					} else if ((prefix + key) in extract_to) {
						// Skip this: 以準確名稱為準。
						return;
					}
				}
				// assert: _key = 已去除 prefix 之 key。
				if (!limited_parameters.get(_key)) {
					return;
				}
			}
			var value = from_parameters[key];
			if (!wiki_API.is_valid_parameters_value(value)) {
				return;
			}

			key = prefix ? prefix + _key : _key;
			// assert: key = full key with prefix
			// console.trace([ _key, key, value ]);

			if (typeof value === 'object' && !Array.isArray(value)) {
				// Do not includes {Object}value
				// e.g., key: page_to_edit
				// console.trace(limited_parameters);
				try {
					library_namespace
							.warn('extract_parameters: Invalid value of key: ['
									+ key + ']? ' + value);
					// console.trace(from_parameters);
				} catch (e) {
					library_namespace
							.warn('extract_parameters: Invalid value of key: ['
									+ key + ']?');
				}
			}

			var information = limited_parameters
					&& limited_parameters.get(_key);
			if (information) {
				// console.trace(key, information, value);
				// console.trace(action, from_parameters);

				if (_key in action && action[_key] === value) {
					// e.g., 設定 query_props : 'pageprops', @
					// 20160517.interlanguage_link_to_wikilinks.js
					// 由於 props : 'pageprops' 應該是給 action=query 用的，
					// ppprops 不該採用同樣的值。
					return;
				}

				// 基本的檢測。
				if ('deprecated' in information) {
					library_namespace.warn(
					//
					'extract_parameters: Using deprecated parameter: ' + path
							+ ':' + _key);
				}

				switch (information.type) {
				case 'string':
					// value = String(value);
					break;
				case 'boolean':
					if (!value) {
						// return;
					} else {
						// value = 1;
					}
					break;
				case 'limit':
					if (value === 'max')
						break;
				case 'integer':
					if (!library_namespace.is_digits(value)) {
						library_namespace.warn(
						//
						'extract_parameters: Should be a integer: ' + _key
								+ '=' + value);
					}
					break;
				case 'timestamp':
					break;
				case 'user':
					break;
				case 'expiry':
					break;
				default:
					if (Array.isArray(information.type)) {
						if ('multi' in information) {
							// TODO
							// if (value.split('|').some()) {}
						} else if (!information.type.includes(value)) {
							library_namespace.warn(
							//
							'extract_parameters: Not in '
									+ JSON.stringify(information.type) + ': '
									+ _key + '=' + value);
						}
					}
				}
			}
			extract_to[key] = value;
		}

		var limited_parameters, prefix, path_list = Array.isArray(path) ? path
				: [ path ];
		for (var index = 0; index < path_list.length; index++) {
			path = path_list[index];
			limited_parameters = path && session
					&& session.API_parameters[path];
			if (limited_parameters) {
				prefix = limited_parameters.prefix;
				limited_parameters = limited_parameters.parameter_Map;
				// assert: !!limited_parameters === true
			}
			if (session && !limited_parameters && path)
				library_namespace.error('No API parameters for: ' + path);
			// console.trace(limited_parameters);

			// exclude {key: false}
			parameters.forEach(for_each_parameter);
		}

		delete extract_to[''];
		delete extract_to[KEY_SESSION];
		return extract_to;
	}

	wiki_API.extract_parameters = extract_parameters;

	// --------------------------------------------------------------------------------------------

	function URL_of_page(page_title) {
		page_title = this.normalize_title(page_title, {
			use_underline : true
		});
		return this.latest_site_configurations.general.server
				+ this.latest_site_configurations.general.articlepath.replace(
						'$1', page_title);
	}

	// --------------------------------------------------------------------------------------------

	// extract session from options, get_session_from_options
	// var session = session_of_options(options);
	function session_of_options(options) {
		// @see function setup_API_URL(session, API_URL)
		return options
		// 此時嘗試從 options[KEY_SESSION] 取得 session。
		&& (options[KEY_SESSION]
		// 檢查若 options 本身即為 session。
		|| wiki_API.is_wiki_API(options) && options);
	}

	// 設定正作業中之 wiki_API instance。
	// CeL.wiki.add_session_to_options()
	function add_session_to_options(session, options) {
		// Warning: Will append to original options!!
		// function for_each_subelement() needs assigning to original options.
		options = library_namespace.setup_options(options);
		if (session)
			options[KEY_SESSION] = session;
		return options;
	}

	// export 導出.

	// @instance 實例相關函數。
	Object.assign(wiki_API.prototype, {
		redirect_target_of : redirect_target_of,
		aliases_of_page : aliases_of_page,
		is_template : is_template,

		get_storage : wiki_API.has_storage ? get_storage
				: library_namespace.null_function,
		set_storage : wiki_API.has_storage ? set_storage
				: library_namespace.null_function,
		storage_life : library_namespace.to_millisecond('1w'),

		// session_namespace(): wrapper for get_namespace()
		namespace : function namespace(namespace, options) {
			return get_namespace(namespace, add_session_to_options(this,
					options));
		},
		remove_namespace : function remove_namespace(page_title, options) {
			return remove_page_title_namespace(page_title,
					add_session_to_options(this, options));
		},
		is_namespace : function is_namespace(page_title, options) {
			if (typeof options !== 'object') {
				options = {
					namespace : options
				};
			} else if (wiki_API.is_page_data(options)) {
				options = {
					namespace : options.ns
				};
			}
			return page_title_is_namespace(page_title, add_session_to_options(
					this, options));
		},
		to_namespace : function to_namespace(page_title, options) {
			if (typeof options !== 'object') {
				options = {
					namespace : options
				};
			}
			return convert_page_title_to_namespace(page_title,
					add_session_to_options(this, options));
		},
		// [[d:Q1]], [[en:T]] 之 namespace 亦為 0。
		is_article : function is_article(page_title) {
			page_title = this.normalize_title(page_title);
			// session.is_namespace(page_title, 'main');
			return this.is_namespace(page_title, 0)
			// 光 .test(page_title)===true 還不夠
			&& (!page_title.includes(':')
			// this.configurations.interwiki_pattern.test('en')===true
			|| !this.configurations.interwiki_pattern.test(page_title));
		},
		// wrappers
		is_talk_namespace : function wiki_API_is_talk_namespace(namespace,
				options) {
			return is_talk_namespace(namespace, add_session_to_options(this,
					options));
		},
		to_talk_page : function wiki_API_to_talk_page(page_title, options) {
			return to_talk_page(page_title, add_session_to_options(this,
					options));
		},
		talk_page_to_main : function wiki_API_talk_page_to_main(page_title,
				options) {
			return talk_page_to_main(page_title, add_session_to_options(this,
					options));
		},

		title_of : function wiki_API_get_page_title(page_data, options) {
			return get_page_title(page_data, add_session_to_options(this,
					options));
		},

		normalize_title
		//
		: function wiki_API_normalize_title(page_title, options) {
			return normalize_page_name(page_title, add_session_to_options(this,
					options));
		},

		URL_of_page : URL_of_page,

		toString : function wiki_API_toString(type) {
			return get_page_content(this.last_page) || '';
		}
	});

	// ------------------------------------------------------------------------

	// @inner
	library_namespace.set_method(wiki_API, {
		KEY_SESSION : KEY_SESSION,
		KEY_HOST_SESSION : KEY_HOST_SESSION,

		KEY_CORRESPOND_PAGE : KEY_CORRESPOND_PAGE,

		session_of_options : session_of_options,
		add_session_to_options : add_session_to_options,
		setup_API_URL : setup_API_URL,
		setup_API_language : setup_API_language,
		API_URL_of_options : API_URL_of_options,
		is_api_and_title : is_api_and_title,
		normalize_title_parameter : normalize_title_parameter,
		set_parameters : set_parameters,
		is_wikidata_site_nomenclature : is_wikidata_site_nomenclature,
		language_code_to_site_alias : language_code_to_site_alias,

		PATTERN_URL_prefix : PATTERN_URL_prefix,
		PATTERN_invalid_page_name_characters
		//
		: PATTERN_invalid_page_name_characters,
		PATTERN_wikilink : PATTERN_wikilink,
		PATTERN_wikilink_global : PATTERN_wikilink_global,
		// PATTERN_page_name : PATTERN_page_name,
		PATTERN_file_prefix : PATTERN_file_prefix,
		PATTERN_URL_WITH_PROTOCOL_GLOBAL : PATTERN_URL_WITH_PROTOCOL_GLOBAL,
		PATTERN_category_prefix : PATTERN_category_prefix,

		PATTERN_PROJECT_CODE_i : PATTERN_PROJECT_CODE_i
	});

	// ------------------------------------------

	// @static
	Object.assign(wiki_API, {
		hostname_of_API_URL : hostname_of_API_URL,
		api_URL : api_URL,
		set_language : set_default_language,
		// site_name_of
		site_name : language_to_site_name,
		// @inner
		get_first_domain_name_of_session : get_first_domain_name_of_session,

		LTR_SCRIPTS : LTR_SCRIPTS,
		PATTERN_LTR : PATTERN_LTR,
		PATTERN_category : PATTERN_category,

		get_PATTERN_full_tag : get_PATTERN_full_tag,

		upper_case_initial : upper_case_initial,

		is_namespace : page_title_is_namespace,
		to_namespace : convert_page_title_to_namespace,
		remove_namespace : remove_page_title_namespace,
		//
		is_talk_namespace : is_talk_namespace,
		to_talk_page : to_talk_page,
		talk_page_to_main : talk_page_to_main,

		generate_page_pattern_of_namespace
		//
		: generate_page_pattern_of_namespace,
		file_pattern : file_pattern,

		// Please use CeL.wiki.wikitext_to_plain_text() instead!
		plain_text : simple_wikitext_to_plain_text,

		template_text : to_template_wikitext,

		is_template : is_template,

		escape_text : escape_text,

		/** constant 中途跳出作業用。 */
		quit_operation : {
			// 單純表達意思用的內容結構，可以其他的值代替。
			quit : true
		},

		is_page_data : get_page_content.is_page_data,

		title_of : get_page_title,
		// CeL.wiki.title_link_of() 常用於 summary 或 log/debug message。
		title_link_of : get_page_title_link,
		revision_content : revision_content,
		content_of : get_page_content,
		prefix_page_name : prefix_page_name,
		// normalize_page_title
		normalize_title : normalize_page_name,
		normalize_title_pattern : normalize_name_pattern,
		get_hash : list_to_hash,
		unique_list : unique_list
	});

	// wiki_API.namespace = get_namespace;
	return get_namespace;
}
