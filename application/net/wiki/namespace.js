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
		&& session.language;
	}

	var PATTERN_page_name = /((?:&#(?:\d{1,8}|x[\da-fA-F]{1,8});|[^\[\]\|{}\n#�])+)/,
	/**
	 * {RegExp}wikilink內部連結的匹配模式v2 [ all_link, page_and_section, page_name,
	 * section_title, displayed_text ]
	 * 
	 * 頁面標題不可包含無效的字元：[\n\[\]{}�]，經測試 anchor 亦不可包含[\n\[\]{}]，但 display text 可以包含
	 * [\n]
	 * 
	 * @see PATTERN_link
	 */
	PATTERN_wikilink = /\[\[(((?:&#(?:\d{1,8}|x[\da-fA-F]{1,8});|[^\[\]\|{}\n#�])+)(#(?:-{[^\[\]{}\n\|]+}-|[^\[\]{}\n\|]+)?)?|#[^\[\]{}\n\|]+)(?:\|([\s\S]+?))?\]\]/,
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
	 * @type {RegExp}
	 * 
	 * @see PATTERN_URL_GLOBAL, PATTERN_URL_WITH_PROTOCOL_GLOBAL,
	 *      PATTERN_URL_prefix, PATTERN_WIKI_URL, PATTERN_wiki_project_URL,
	 *      PATTERN_external_link_global
	 */
	PATTERN_URL_GLOBAL = /(?:https?:)?\/\/(?:[^\s\|<>\[\]{}]+|{[^{}]*})+/ig,

	/**
	 * 匹配URL網址，僅用於 parse_wikitext()。
	 * 
	 * "\0" 應該改成 include_mark。
	 * 
	 * matched: [ all, previous, URL, protocol without ":", others ]
	 * 
	 * @type {RegExp}
	 * 
	 * @see PATTERN_URL_GLOBAL, PATTERN_URL_WITH_PROTOCOL_GLOBAL,
	 *      PATTERN_URL_prefix, PATTERN_WIKI_URL, PATTERN_wiki_project_URL,
	 *      PATTERN_external_link_global
	 */
	PATTERN_URL_WITH_PROTOCOL_GLOBAL =
	// 照理來說應該是這樣的。
	/(^|[^a-z\d_])((https?|s?ftp|telnet|ssh):\/\/([^\0\s\|<>\[\]{}\/][^\0\s\|<>\[\]{}]*))/ig,
	// MediaWiki實際上會parse的。
	// /(^|[^a-z\d_])((https?|s?ftp|telnet|ssh):\/\/([^\0\s\|<>\[\]{}]+))/ig,

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
	PATTERN_URL_prefix = /^(?:(?:https?|s?ftp|telnet|ssh):)?\/\/[^.:\\\/]+\.[^.:\\\/]+/i;
	// ↓ 這會無法匹配中文域名。
	// PATTERN_URL_prefix = /^(?:https?:)?\/\/([a-z\d\-]{1,20})\./i,

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
	 * @param {Boolean|String}[ignore_api]
	 *            ignore API, 'set': set API
	 * 
	 * @returns {Boolean}value 為 [ {String}API_URL/language, {String}title or
	 *          {Object}page_data ]
	 */
	function is_api_and_title(value, type, ignore_api) {
		// console.trace(value);

		if (!Array.isArray(value) || value.length !== 2
		//
		|| get_page_content.is_page_data(value[0])) {
			// 若有必要設定，應使用 wiki_API.normalize_title_parameter(title, options)。
			// 此時不能改變傳入之 value 本身，亦不能僅測試是否有 API_URL。
			return false;
		}

		if (type === true) {
			// type === true: simple test, do not test more.
			return true;
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
		|| typeof ignore_api !== 'object' || !ignore_api.is_id)) {
			library_namespace.debug('輸入的是問題頁面title: ' + title, 2,
					'is_api_and_title');
			return false;
		}

		var API_URL = value[0];

		// test API_URL: {String}API_URL/language
		if (!API_URL) {
			if (typeof ignore_api === 'object') {
				library_namespace.debug('嘗試從 options[KEY_SESSION] 取得 API_URL。',
						2, 'is_api_and_title');
				// console.log(ignore_api);
				// console.log(API_URL_of_options(ignore_api));

				// ignore_api 當作原函數之 options。
				API_URL = API_URL_of_options(ignore_api);
				if (API_URL) {
					value[0] = API_URL;
				}
				// 接下來繼續檢查 API_URL。
			} else {
				return !!ignore_api;
			}
		}

		if (typeof API_URL !== 'string') {
			// 若是未設定 action[0]，則將在 wiki_API.query() 補設定。
			// 因此若為 undefined || null，此處先不回傳錯誤。
			return !API_URL;
		}

		// for property = [ {String}language, {String}title or {Array}titles ]
		if (type === 'language') {
			return PATTERN_PROJECT_CODE_i.test(API_URL);
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
	 * @param {String}title
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * @see api_URL
	 */
	function normalize_title_parameter(title, options) {
		options = library_namespace.setup_options(options);
		var action = options.multi && Array.isArray(title)
				&& title.length === 2
				// 即便設定 options.multi，也不該有 /^https?:\/\/.+\.php/i 的標題。
				&& !/^https?:\/\/.+\.php$/.test(title[0])
				|| !is_api_and_title(title, true) ? [ , title ]
		// 不改變原 title。
		: title.clone();
		if (!is_api_and_title(action, false, options)) {
			// console.trace('normalize_title_parameter: Invalid title!');
			library_namespace.warn(
			//
			'normalize_title_parameter: Invalid title! '
					+ (wiki_API.title_link_of(title) || '(title: '
							+ JSON.stringify(title) + ')'));
			// console.trace(JSON.stringify(title));
			return;
		}

		// 處理 [ {String}API_URL, title ]
		action[1] = wiki_API.query.title_param(action[1], true, options.is_id);

		if (options.redirects) {
			// 舊版毋須 '&redirects=1'，'&redirects' 即可。
			action[1] += '&redirects=1';
		}

		return action;
	}

	/**
	 * append additional parameters of MediaWiki API.
	 * 
	 * @param {Array}action
	 * @param {Object}options
	 *            附加參數/設定選擇性/特殊功能與選項
	 * @inner
	 */
	function add_parameters(action, options) {
		if (!options.parameters) {
			return;
		}

		if (typeof options.parameters === 'string') {
			action[1] += '&' + options.parameters;
		} else if (library_namespace.is_Object(options.parameters)) {
			var parameters = Object.create(null);
			// TODO: 篩選掉指定為 false 的
			action[1] += '&' + new URLSearchParams(options.parameters);
		} else {
			library_namespace.debug('無法處理之 options.parameters: ['
					+ options.parameters + ']', 1, 'add_parameters');
		}
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
	 * @type {RegExp}
	 * 
	 * @see PATTERN_PROJECT_CODE
	 * @see PATTERN_URL_GLOBAL, PATTERN_URL_WITH_PROTOCOL_GLOBAL,
	 *      PATTERN_URL_prefix, PATTERN_WIKI_URL, PATTERN_wiki_project_URL,
	 *      PATTERN_external_link_global
	 */
	var PATTERN_wiki_project_URL = /^(https?:)?(?:\/\/)?(([a-z][a-z\d\-]{0,14})\.([a-z]+)+(?:\.[a-z]+)+)/i;

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
	function api_URL(project) {
		if (!project) {
			return wiki_API.API_URL;
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
		// @see PATTERN_PROJECT_CODE
		if (/^[a-z][a-z\d\-]{0,14}\.[a-z]+$/i.test(project)) {
			// e.g., 'en.wikisource', 'en.wiktionary'
			project += '.org';
		}

		var matched = project.match(PATTERN_wiki_project_URL);
		if (matched) {
			// 先測試是否為自訂 API。
			return /\.php$/i.test(project) ? project
			// e.g., 'https://zh.wikipedia.org/'
			// e.g., 'https://www.mediawiki.org/w/api.php'
			// e.g., 'https://www.mediawiki.org/wiki/'
			: (matched[1] || api_URL.default_protocol || 'https:') + '//'
					+ matched[2] + '/w/api.php';
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
			// is data session. e.g., "test.wikidata.org"
			session.is_wikidata = /\.wikidata\./i.test(API_URL);
			// remove cache
			delete session.last_page;
			delete session.last_data;
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
					agent : agent
				};
				if (false) {
					// set User-Agent to use:
					// Special:ApiFeatureUsage&wpagent=CeJS script_name
					wiki.get_URL_options.headers['User-Agent'] = library_namespace.get_URL.default_user_agent;
				}
			} else {
				// e.g., using XMLHttpRequest @ WWW
				session.get_URL_options = {};
			}

		}

		// TODO: 這只是簡陋的判別方法。
		var matched = session.API_URL
				&& session.API_URL.match(PATTERN_wiki_project_URL);
		// console.trace(matched);
		if (matched
				&& !/test|wiki/i.test(matched[3])
				&& ((matched = matched[4].toLowerCase()) in api_URL.shortcut_of_project)) {
			// e.g., "wikipedia"
			session.family = matched;
		}
	}

	// @see set_default_language(), language_to_site_name()
	function setup_API_language(session, language_code) {
		if (!language_code || typeof language_code !== 'string')
			return;

		language_code = language_code.toLowerCase();
		if (PATTERN_PROJECT_CODE_i.test(language_code)
				// 不包括 test2.wikipedia.org 之類。
				&& !/test|wiki/i.test(language_code)
				// 排除 'Talk', 'User', 'Help', 'File', ...
				&& !(session.configurations.namespace_pattern || get_namespace.pattern)
						.test(language_code)) {
			// e.g., 'cmn'
			if (language_code in wiki_API.language_code_to_site_alias)
				language_code = wiki_API.language_code_to_site_alias[language_code];

			// [[m:List of Wikipedias]]
			session.language
			// e.g., 'zh-classical', 'zh-yue', 'zh-min-nan', 'simple'
			= language_code;
			var site_name = wiki_API.site_name(session);
			// console.trace(site_name);
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
	 * @returns {String}Wikidata API 可使用之 site name parameter。
	 * 
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
		var session;

		// 擷取出維基姊妹項目各種 type: 先要能擷取出 language code + family
		// types: 'API', 'db', 'site', 'link', 'dump', ...

		// 不能保證 wiki_API.is_wiki_API(language) → is_Object(language)，
		// 因此使用 typeof。
		if (language && typeof language === 'object') {
			// treat language as options with session.
			session = wiki_API.session_of_options(language);
			// options.language 較 session 的設定優先。
			language = language.language || session && (
			// assert: typeof session.API_URL === 'string'
			// 注意:在取得 page 後，中途更改過 API_URL 的話，session.language 會取得錯誤的資訊！
			session.language
			// 應該採用來自宿主 host session 的 language. @see setup_data_session()
			|| session[KEY_HOST_SESSION] && session[KEY_HOST_SESSION].language)
			// || language
			;
			if (false && typeof language === 'object')
				console.trace(language);
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

		var matched = wiki_API.namespace(language, options);
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
		language = String(language || in_session && (in_session.language
		//
		|| in_session[KEY_HOST_SESSION]
		//
		&& in_session[KEY_HOST_SESSION].language)
		// else use default language
		// 警告: 若是沒有輸入，則會直接回傳預設的語言。因此您或許需要先檢測是不是設定了 language。
		|| wiki_API.language).trim().toLowerCase().replace(/[_ ]/g, '-');
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
		} else if (!family && session && !session.family && session.API_URL) {
			// e.g., API_URL: 'https://zh.moegirl.org.cn/api.php'
			// console.trace([ language, family ]);
			language = session.API_URL;
		}

		matched = language
		// e.g., 'zh-min-nan' → 'zh_min_nan'
		.replace(/-/g, '_').match(PATTERN_SITE);
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

		} else if (matched = language.match(PATTERN_wiki_project_URL)) {
			// treat language as API_URL.
			API_URL = /api\.php$/.test(language) ? language : null;
			/**
			 * 去掉 '.org' 之類。 language-code.wikipedia.org e.g.,
			 * zh-classical.wikipedia.org
			 * 
			 * matched: [ 0: protocol + host name, 1: protocol, 2: host name,<br />
			 * 3: 第一 domain name (e.g., language code / family / project),<br />
			 * 4: 第二 domain name (e.g., family: 'wikipedia') ]
			 * 
			 * @see PATTERN_PROJECT_CODE
			 */
			// console.trace(matched);
			// console.trace(session);
			library_namespace.debug(language, 4, 'language_to_site_name');
			family = family || matched[4];
			// incase 'https://test.wikidata.org/w/api.php'
			language = matched[3] !== 'test' && matched[3] || wiki_API.language;
		} else if (matched = language.match(/^([a-z\d\-_]+)\.([a-z\d\-_]+)/)) {
			language = matched[1];
			family = family || matched[2];
		} else {
			library_namespace.error('language_to_site_name: Invalid language: '
					+ language);
			// console.trace(language);
		}

		// console.trace(family);
		family = family || session && session.family || in_session
				&& in_session.family;
		// console.trace(family);
		if (!family || family === 'wiki')
			family = 'wikipedia';

		API_URL = API_URL || session && session.API_URL
				|| api_URL(language + '.' + family);
		// console.trace(API_URL);

		var site;
		if (family === 'wikidata') {
			// wikidatawiki_p
			site = family + 'wiki';
		} else {
			site = language.toLowerCase().replace(/-/g, '_')
			// e.g., 'zh' + 'wikinews' → 'zhwikinews'
			+ (family === 'wikipedia'
			// using "commonswiki" instead of "commonswikimedia"
			|| (language in wiki_API.api_URL.wikimedia) ? 'wiki' : family);
		}
		// console.trace(site);
		library_namespace.debug(site, 3, 'language_to_site_name');

		var project = language === 'www' ? family
				: language in wiki_API.api_URL.wikimedia ? language : null;
		if (project) {
			// e.g., get from API_URL
			// wikidata, commons: multilingual
			language = 'multilingual';
		} else {
			project = language + '.' + family;
		}

		// throw site;
		return options && options.get_all_properties ? {
			// en, zh
			language : language,
			// family: 'wikipedia' (default), 'wikimedia',
			// wikibooks|wiktionary|wikiquote|wikisource|wikinews|wikiversity|wikivoyage
			family : family,
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
		} : site;
	}

	// --------------------------------------------------------------------------------------------

	var user_language;
	if (typeof mediaWiki === "object" && typeof mw === "object"
			&& mediaWiki === mw) {
		// mw.config
		// wgULSCurrentAutonym: "中文（台灣）‎"
		user_language = mediaWiki.config.get('wgPreferredVariant')
				|| mediaWiki.config.get('wgUserVariant')
				|| mediaWiki.config.get('wgUserLanguage')
				|| mediaWiki.config.get('wgPageContentLanguage')
		if (false) {
			// {Array}
			user_language = mediaWiki.config.get('wgULSAcceptLanguageList')
					|| mediaWiki.config.get('wgULSBabelLanguages');
		}
	}

	// ------------------------------------------------------------------------

	/**
	 * get NO of namespace
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
		if (!options.is_page_title && (namespace == Math.floor(namespace))) {
			// {Integer}namespace
			return namespace;
		}
		var session = session_of_options(options);
		var namespace_hash = options.namespace_hash || session
				&& session.configurations.namespace_hash || get_namespace.hash;

		if (Array.isArray(namespace)) {
			namespace = namespace.join('|');
		}

		// console.log(namespace);
		if (typeof namespace === 'string') {
			var list = [];
			// e.g., 'User_talk' → 'User talk'
			namespace = namespace.replace(/[\s_]+/g, ' ');
			(options.is_page_title ? [ namespace.toLowerCase() ]
			//
			: namespace.toLowerCase()
			// for ',Template,Category', ';Template;Category',
			// 'main|file|module|template|category|help|portal'
			// https://www.mediawiki.org/w/api.php?action=help&modules=main#main.2Fdatatypes
			.split(/(?:[,;|\u001F]|%7C|%1F)/)).forEach(function(n) {
				if (options.is_page_title && n.startsWith(':')) {
					// e.g., [[:title]]
					n = n.slice(1);
				}
				// get namespace `_n` only.
				// e.g., 'wikipedia:sandbox' → 'wikipedia'
				var _n = n.replace(/:.*$/, '').trim();
				if (!_n) {
					// _n === ''
					list.push(0);
					return;
				}
				if (!options.is_page_title && (!isNaN(_n)
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
				if (options.is_page_title) {
					list.push(0);
					return;
				}
				if (namespace_hash === get_namespace.hash) {
					// console.trace(namespace);
					library_namespace.debug('Invalid namespace: ['
					//
					+ n + '] @ namespace list ' + namespace,
					//
					1, 'get_namespace');
					// console.trace(arguments);
				} else {
					list.push(options.is_page_title === false
					// options.is_page_title === false 亦即
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
						&& session.configurations.name_of_NO
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

		// the project namespace for matters about the project
		// Varies between wikis
		project : 4,

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
		// 模板
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
		if (NS === session && session.configurations.namespace_hash ? session.configurations.namespace_hash.wikipedia
				: get_namespace.hash.wikipedia) {
			if (session && session.family) {
				return wiki_API.upper_case_initial(
				// e.g., commons, wikidata
				get_wikimedia_project_name(session) || session.family);
			}
			// e.g., testwiki:
			return 'Wikipedia';
		}

		var name_of_NO = session && session.configurations.name_of_NO
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
		if (typeof page_title !== 'string') {
			library_namespace.debug(page_title, 5,
					'remove_page_title_namespace');
			return page_title;
		}
		var session = session_of_options(options);
		var namespace_pattern = session
				&& session.configurations.namespace_pattern
				|| get_namespace.pattern;
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

	// TODO: is_namespace(page_title, 'Wikipedia|User')
	function page_title_is_namespace(page_title, options) {
		var namespace = !options ? 0 : !isNaN(options) ? +options
				: typeof options === 'string' ? options : options.namespace;
		var page_ns;
		if (wiki_API.is_page_data(page_title)) {
			page_ns = page_title.ns;
		} else {
			page_title = wiki_API.normalize_title(page_title, options);
			page_ns = get_namespace(page_title, Object.assign({
				// for wiki_API.namespace()
				is_page_title : true
			}, options));
		}
		return page_ns === get_namespace(namespace, Object.assign({
			is_page_title : false
		}, options));
	}

	function convert_page_title_to_namespace(page_title, options) {
		var namespace = !options ? 0 : !isNaN(options) ? +options
				: typeof options === 'string' ? options : options.namespace;
		namespace = get_namespace(namespace, Object.assign({
			get_name : true
		}, options)) + ':';

		page_title = wiki_API.normalize_title(page_title, options);
		// console.trace(page_title);

		function to_namespace(page_title) {
			return namespace + remove_page_title_namespace(page_title, options);
		}

		if (Array.isArray(page_title)) {
			return page_title.map(to_namespace);
		}
		return to_namespace(page_title);
	}

	// ------------------------------------------

	function is_talk_namespace(namespace, options) {
		if (typeof namespace === 'string') {
			namespace = wiki_API.normalize_title(namespace, options)
					.toLowerCase();
			var session = session_of_options(options);
			var name_of_NO = session && session.configurations.name_of_NO
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
		// console.log(options);
		var session = session_of_options(options), namespace;
		if (wiki_API.is_page_data(page_title)) {
			// assert: {Number}namespace
			namespace = page_title.ns;
			page_title = wiki_API.title_of(page_title);

		} else {
			page_title = wiki_API.normalize_title(page_title, options);
			if (!session) {
				// 模組|模塊|模块 → Module talk
				if (/^(Special|特殊|特別|Media|媒體|媒体|メディア|Topic|話題|话题):/i
						.test(page_title)) {
					// There is no talk page for Topic or virtual namespaces.
					return;
				}

				// for zhwiki only. But you should use session.to_talk_page() !
				page_title = page_title.replace(/^(?:模組|模塊|模块):/i, 'Module:');
			}
			// assert: {Number|Undefined}namespace
			namespace = wiki_API.namespace(page_title, options);
		}
		// console.log([ namespace, page_title ]);

		if (!page_title || typeof page_title !== 'string' || namespace < 0)
			return;

		// console.log([ namespace, page_title ]);
		if (namespace % 2 === 1/* is_talk_namespace(namespace, options) */) {
			library_namespace.debug('Is already talk page: ' + page_title, 3,
					'to_talk_page');
			return page_title;
		}

		var name_of_NO = session && session.configurations.name_of_NO
				|| wiki_API.namespace.name_of_NO;
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
				.match(/^([^:]+):(.+)$/ && /^([a-z _]+):(.+)$/i);
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
			// assert: {Number|Undefined}namespace
			namespace = wiki_API.namespace(page_title, options);
		}

		if (!page_title || typeof page_title !== 'string')
			return page_title;

		if (namespace <= 0 || namespace % 2 === 0) {
			library_namespace.debug('Is already NOT talk page: ' + page_title,
					3, 'to_talk_page');
			return page_title;
		}

		var session = session_of_options(options);
		var name_of_NO = session && session.configurations.name_of_NO
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
	// @seealso function get_label(html) @ work_crawler.js
	function wikitext_to_plain_text(wikitext) {
		if (!wikitext || !(wikitext = wikitext.trim())) {
			// 一般 template 中之 parameter 常有設定空值的狀況，因此首先篩選以加快速度。
			return wikitext;
		}
		// TODO: "《茶花女》维基百科词条'''(法语)'''"
		wikitext = wikitext
		// 去除註解 comments。
		// e.g., "親会社<!-- リダイレクト先の「[[子会社]]」は、[[:en:Subsidiary]] とリンク -->"
		// "ロイ・トーマス<!-- 曖昧さ回避ページ -->"
		.replace(/<\!--[\s\S]*?-->/g, '')
		// 沒先處理的話，也會去除 <br />
		.replace(/<br(?:\s[^<>]*)?>/ig, '\n').replace(/<\/?[a-z][^>]*>/g, '')
		// "{{=}}" → "="
		.replace(/{{=\s*}}/ig, '=')
		// e.g., remove "{{En icon}}"
		.replace(/{{[a-z\s]+}}/ig, '')
		// e.g., "[[link]]" → "link"
		// 警告：應處理 "[[ [[link]] ]]" → "[[ link ]]" 之特殊情況
		// 警告：應處理 "[[text | [[ link ]] ]]", "[[ link | a[1] ]]" 之特殊情況
		.replace(
				PATTERN_wikilink_global,
				function(all_link, page_and_section, page_name, section_title,
						displayed_text) {
					return displayed_text || page_and_section;
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
			.replace(/[^\n]+\n/g, '\n').replace(/\n{3,}/g, '\n\n');
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
		words = String(words).trim();

		// method 1
		return words.charAt(0).toUpperCase() + words.slice(1);

		// method 2
		return words.replace(/^\S/g, function(initial_char) {
			return initial_char.toUpperCase();
		});
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
	 * @returns {String}規範後之頁面名稱。
	 * 
	 * @see [[Wikipedia:命名常規]]
	 * @see https://en.wikipedia.org/wiki/Wikipedia:Page_name#Technical_restrictions_and_limitations
	 */
	function normalize_page_name(page_name, options) {
		if (Array.isArray(page_name)) {
			return page_name.map(function(_page_name) {
				return normalize_page_name(_page_name, options);
			});
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

		page_name = page_name
		// '\u200E', '\u200F' 在當作 title 時會被濾掉。
		// 對於標題，無論前後加幾個"\u200E"(LEFT-TO-RIGHT MARK)都會被視為無物。
		// "\u200F" 亦不被視作 /\s/，但經測試會被 wiki 忽視。
		// tested: [[title]], {{title}}
		// @seealso [[w:en:Category:CS1 errors: invisible characters]]
		.replace(/[\u200E\u200F]/g, '')

		.trimEnd()
		// 去除開頭的 ":"。 /\s/.test('\u3000')===true
		.replace(/^[:\s_]+/, '')

		// 無論是中日文、英文的維基百科，所有的 '\u3000' 都會被轉成空白字元 /[ _]/。
		.replace(/　/g, ' ')

		// 處理連續多個空白字元。長度相同的情況下，盡可能保留原貌。
		.replace(/([ _]){2,}/g, '$1');

		// fix "&#39;"
		page_name = library_namespace.HTML_to_Unicode(page_name);

		/** {Boolean}採用 "_" 取代 " "。 */
		var use_underline = options.use_underline;
		page_name = use_underline
		// ' ' → '_': 在 URL 上可更簡潔。
		? page_name.replace(/ /g, '_') : page_name.replace(/_/g, ' ');

		page_name = page_name.split(':');
		var has_language;
		var session = session_of_options(options);
		var interwiki_pattern = session
				&& session.configurations.interwiki_pattern
				|| /^[a-z][a-z_\-]+$/i;
		var no_session_namespace_hash = !session
				|| !session.configurations.namespace_hash;

		page_name.some(function(section, index) {
			section = use_underline ? section.replace(/^[\s_]+/, '') : section
					.trimStart();

			// 必然包含 page title，因此不處理最後一個。
			if (index === page_name.length - 1) {
				if (options.no_upper_case_initial) {
					page_name[index] = section.toLowerCase();
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
					page_name[index] = section.toLowerCase();
				} else {
					// page title: 將首個字母轉成大寫。
					page_name[index] = upper_case_initial(section);
				}
				return true;
			}

			var namespace = isNaN(section)
			//
			&& get_namespace(section, Object.assign({
				get_name : true
			}, options));
			// console.log([ index, section, namespace ]);
			if (namespace) {
				// Wikipedia namespace
				page_name[index] = use_underline ? namespace.replace(/ /g, '_')
						: namespace.replace(/_/g, ' ');
				return false;
			}

			if (has_language) {
				if (session && interwiki_pattern.test(section)) {
					// e.g., 'EN' → 'en'
					page_name[index] = section.toLowerCase();
				} else {
					// page title: 將首個字母轉成大寫。
					page_name[index] = upper_case_initial(section);
				}
				return true;
			}

			section = use_underline ? section.replace(/[\s_]+$/, '') : section
					.trimEnd();
			if (!interwiki_pattern.test(section)) {
				// e.g., [[Avatar: The Last Airbender]]
				page_name[index] = upper_case_initial(section);
				return true;
			}

			// treat `section` as lang code
			section = section.toLowerCase();
			// lang code
			has_language = true;
			if (use_underline) {
				section = section.replace(/_/g, '-');
			}
			// else: e.g., [[m:Abc]]
			page_name[index] = section;
		});

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
	//
	// Fichier:
	// https://fr.wikipedia.org/wiki/Aide:Ins%C3%A9rer_une_image_(wikicode,_avanc%C3%A9)
	//
	// https://zh.wikipedia.org/wiki/Wikipedia:互助客栈/其他#增设空间“U：”、“UT：”作为“User：”、“User_talk：”的Alias
	// 提議增加F、FT指向File、File Talk
	/** {RegExp}檔案的匹配模式 for parser。 */
	var PATTERN_file_prefix = 'File|Fichier|檔案|档案|文件|ファイル|Image|圖像|图像|画像|Media|媒[體体](?:文件)?';

	file_pattern.source =
	// 不允許 [\s\n]，僅允許 ' '。
	// [ ':', file name, 接續 ]
	/\[\[ *(?:(:) *)?(?:Tag) *: *name *(\||\]\])/
	// [[ :File:name]] === [[File:name]]
	.source.replace('Tag', library_namespace
			.ignore_case_pattern(PATTERN_file_prefix));

	// [ all, ":", file name without "File:" or ":File" ]
	PATTERN_file_prefix = new RegExp('^ *(: *)?(?:' + PATTERN_file_prefix
			+ ') *: *' + PATTERN_page_name.source, 'i');

	// "Category" 本身可不分大小寫。
	// 分類名稱重複時，排序索引以後出現者為主。
	// TODO: using PATTERN_page_name
	var
	// [ all_category_text, category_name, sort_order, post_space ]
	PATTERN_category = /\[\[ *(?:Category|分類|分类|カテゴリ|분류) *: *([^\[\]\|{}\n�]+)(?:\s*\|\s*([^\[\]\|�]*))?\]\](\s*\n?)/ig,
	/** {RegExp}分類的匹配模式 for parser。 [all,name] */
	PATTERN_category_prefix = /^ *(?:Category|分類|分类|カテゴリ|분류) *: *([^\[\]\|{}\n�]+)/i;

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
	 * @param {Boolean}is_uri
	 *            輸出為 URI 或 URL。
	 * @returns {String}plain wikitext
	 * 
	 * @see function section_link_escape(text, is_uri)
	 * @see [[w:en:Help:Special characters]]
	 */
	function escape_text(text, is_uri) {
		function escape_character(character) {
			var code = character.charCodeAt(0);
			if (is_uri) {
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
		var keys = Object.keys(parameters), template_name, is_continue = true;
		if (options) {
			if (typeof options === 'string') {
				template_name = options;
			} else {
				template_name = options.name;
			}
		}

		var wikitext = [];
		keys.forEach(function(key) {
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
			if (!ignore_key)
				value = key + '=' + value;

			wikitext.push(value);
		});
		if (template_name) {
			wikitext.unshift(template_name);
			wikitext.toString = to_template_wikitext_toString;
		} else {
			wikitext.toString = to_template_wikitext_toString_slice;
		}
		return options && options.to_Array ? wikitext
		//
		: wikitext.toString(options && options.separator);
	}

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
	 * @see wiki_API.query.id_of_page
	 * @see wiki_API.query.title_param()
	 */
	function get_page_title(page_data) {
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
			return get_page_title(page_data[1]);
		}

		if (library_namespace.is_Object(page_data)) {
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
			page_data = page_data.replace(/^[\s:]+/, '')
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
	// TODO: #section name
	// TODO: 複製到非維基項目外的私人維基，例如moegirl時，可能需要用到[[zhwiki:]]這樣的prefix。
	function get_page_title_link(page_data, session, display_text) {
		var title,
		// e.g., is_category
		need_escape, project_prefixed;

		if (session && display_text === undefined
				&& !wiki_API.is_wiki_API(session)) {
			// e.g., `CeL.wiki.title_link_of(page_data, display_text)`
			// shift arguments
			display_text = session;
			session = null;
		}

		// console.trace(session);
		var namespace_hash = session && session.configurations.namespace_hash
				|| get_namespace.hash;

		// is_api_and_title(page_data)
		if (wiki_API.is_page_data(page_data)) {
			need_escape = page_data.ns === namespace_hash.category
					|| page_data.ns === namespace_hash.file;
			title = page_data.title;
		} else if ((title = get_page_title(page_data))
		// 通常應該:
		// is_api_and_title(page_data) || typeof page_data === 'string'
		&& typeof title === 'string') {
			// @see normalize_page_name()
			title = title.replace(/^[\s:]+/, '');

			// e.g., 'zh:title'
			// @see PATTERN_PROJECT_CODE_i
			project_prefixed = /^ *[a-z]{2}[a-z\d\-]{0,14} *:/i.test(title)
					// 排除 'Talk', 'User', 'Help', 'File', ...
					&& !(session && session.configurations.namespace_pattern || get_namespace.pattern)
							.test(title);
			// escape 具有特殊作用的 title。
			need_escape = PATTERN_category_prefix.test(title)
			// 應允許非規範過之 title，如採用 File: 與 Image:, 檔案:。
			|| PATTERN_file_prefix.test(title) || project_prefixed;
		}

		if (!title) {
			return '';
		}
		if (session && session.language && !project_prefixed) {
			// e.g., [[w:zh:title]]
			title = session.language + ':' + title;
			if (session.family
					&& (session.family in api_URL.shortcut_of_project)) {
				title = api_URL.shortcut_of_project[session.family] + ':'
						+ title;
			} else {
				need_escape = true;
			}
		}

		// TODO: [[s:zh:title]] instead of [[:zh:title]]

		if (need_escape) {
			title = ':' + title;
		}
		// TODO: for template transclusion, use {{title}}
		return '[['
				+ title
				+ (display_text && display_text !== title ? '|' + display_text
						: '') + ']]';
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
			content = library_namespace.is_Object(page_data)
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

	// return {Object}main revision (.revisions[0])
	get_page_content.revision = function(page_data, revision_index) {
		return library_namespace.is_Object(page_data)
		// treat as page data. Try to get page contents:
		// revision_content(page.revisions[0])
		// 一般說來應該是由新排到舊，[0] 為最新的版本 last revision。
		&& page_data.revisions && page_data.revisions[revision_index || 0];
	};

	get_page_content.page_exists = function(page_data) {
		return get_page_content.is_page_data(page_data)
				&& !('missing' in page_data) && !('invalid' in page_data);
	};

	// 曾經以 session.page() 請求過內容。
	get_page_content.had_fetch_content = function(page_data, revision_index) {
		return get_page_content.is_page_data(page_data)
		//
		&& (('missing' in page_data)
		// {title:'%2C',invalidreason:
		// 'The requested page title contains invalid characters: "%2C".'
		// ,invalid:''}
		|| ('invalid' in page_data)
		//
		|| typeof revision_content(
		//
		get_page_content.revision(page_data), true) === 'string');
	};

	// CeL.wiki.content_of.edit_time(page_data) -
	// new Date(page_data.revisions[0].timestamp) === 0
	// TODO: page_data.edit_time(revision_index, return_value)
	// return {Date}最後編輯時間/最近的變更日期。
	// 更正確地說，revision[0]（通常是最後一個 revision）的 timestamp。
	get_page_content.edit_time = function(page_data, revision_index,
			return_value) {
		var timestamp = library_namespace.is_Object(page_data)
				&& page_data.revisions;
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
	get_page_content.has_content = function(page_data) {
		var revision = get_page_content.revision(page_data);
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
	function siteinfo(options, callback) {
		// console.log([ options, callback ]);

		options = Object.assign({
			meta : 'siteinfo',
			siprop : 'general|namespaces|namespacealiases|specialpagealiases'
			// magicwords: #重定向 interwikimap, thumb %1px center,
			+ '|magicwords|interwikimap'
			// https://zh.wikipedia.org/w/api.php?action=query&meta=siteinfo&siprop=general|namespaces|namespacealiases|specialpagealiases|magicwords|extensiontags|protocols&utf8&format=json
			+ '|languagevariants|extensiontags|protocols'
		// + '|functionhooks|variables'
		}, options);

		var session;
		if (KEY_SESSION in options) {
			session = options[KEY_SESSION];
			delete options[KEY_SESSION];
		}

		var action = 'action=' + 'query',
		//
		API_URL = session && session.API_URL;
		if (API_URL) {
			action = [ API_URL, action ];
		}

		wiki_API.query(action, function(response, error) {
			// console.log(JSON.stringify(response));
			error = error || response && response.error;
			if (error) {
				callback(response, error);
				return;
			}

			response = response.query;
			if (session) {
				adapt_site_configurations(session, response);
			}
			callback(response);
		}, options, session);
	}

	wiki_API.siteinfo = siteinfo;

	// --------------------------------------------------------------------------------------------

	// default_site_configurations
	wiki_API.prototype.configurations = {
	//
	};

	// @see [[Special:Interwiki]] 跨維基資料 跨 wiki 字首
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

		var interwikimap =
		// session.has_languagevariants &&
		configurations.interwikimap;
		if (interwikimap) {
			// prefix_pattern
			site_configurations.interwiki_pattern = new RegExp('^('
					+ interwikimap.map(function(interwiki) {
						return interwiki.prefix;
					}).join('|') + ')(?::(.*))?$', 'i');
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
		}

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
			namespacealiases
					.forEach(function(namespace_data) {
						namespace_hash[namespace_data['*'].toLowerCase()] = namespace_data.id;
					});
			site_configurations.namespace_pattern = generate_namespace_pattern(
					namespace_hash, []);
		}
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
			session.page(task_configuration_page, adapt_configuration, {
				redirects : 1
			});
		}

		// setup_configuration()
		function adapt_configuration(page_data) {
			if (!wiki_API.content_of.page_exists(page_data)) {
				library_namespace.debug('No configuration page: '
						+ wiki_API.title_link_of(page_data), 1,
						'adapt_task_configurations');
				// 有時必須初始設定，還是得執行 configuration_adapter。
				// return;
			} else {
				library_namespace
						.info('adapt_task_configurations: Get configurations from '
								+ wiki_API.title_link_of(page_data));
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
			// latest raw task raw configuration
			var configuration = wiki_API.parse.configuration(page_data);
			// console.log(configuration);
			// TODO: valid configuration 檢測數值是否合適。
			session.latest_task_configuration = configuration;

			// 本地化 Localization: load localized messages.
			// e.g., [[w:en:User:Cewbot/log/20150916/configuration]]
			if (library_namespace.is_Object(configuration.L10n)) {
				var language = session.language || wiki_API.language;
				/** {Object}L10n messages. 符合當地語言的訊息內容。 */
				gettext.set_text(configuration.L10n, language);
				library_namespace.info('adapt_task_configurations: Load '
						+ Object.keys(configuration.L10n).length + ' '
						+ language + ' messages.');
				// console.trace(configuration.L10n);
				// free
				// delete configuration.L10n;
			}

			if (typeof configuration_adapter === 'function') {
				// 每次更改過設定之後，重新執行一次。
				// 檢查從網頁取得的設定，檢測數值是否合適。
				configuration_adapter.call(session, configuration);
				// configuration === wiki_session.latest_task_configuration
			}
			// Object.seal(configuration);
		}
	}

	wiki_API.prototype.adapt_task_configurations = adapt_task_configurations;

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
		'be-tarask' : 'be-x-old',
		cmn : 'zh',
		// gsw : 'als',
		// hbs : 'sh',
		lzh : 'zh-classical',
		nan : 'zh-min-nan',
		// nb : 'no',
		rup : 'roa-rup',
		sgs : 'bat-smg',
		vro : 'fiu-vro',
		// 為粵文維基百科特別處理。
		yue : 'zh-yue',

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
		if (typeof language !== 'string'
				|| !PATTERN_PROJECT_CODE_i.test(language)) {
			if (language) {
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
			// Can not use `wiki_API.language_code_to_site_alias`
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
	set_default_language('en');

	// [[:en:right-to-left#RTL Wikipedia languages]]
	// 找出使用了由右至左的文字，可用於{{lang}}模板。
	// 應該改用{{tl|rtl-lang}}處理右至左文字如阿拉伯語及希伯來語，請參見{{tl|lang}}的說明。
	// [ all ]
	var LTR_SCRIPTS = 'ar[cz]?|he|fa|bcc|bqi|ckb|dv|glk|kk|lrc|mzn|pnb|ps|sd|u[gr]|yi|tg-Arab',
	// CeL.wiki.PATTERN_LTR.test('ar')===true
	PATTERN_LTR = new RegExp('^(?:' + LTR_SCRIPTS + ')$');

	// ------------------------------------------------------------------------

	function is_wikidata_site(site_or_language) {
		// TODO: 不是有包含'wiki'的全都是site。
		library_namespace.debug('Test ' + site_or_language, 3,
				'is_wikidata_site');
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
		});
	}

	// wiki_session.normalize_alias(page_title)
	function redirect_target_of(page_title, options) {
		if (!page_title)
			return page_title;

		if (options && options.namespace)
			page_title = this.to_namespace(page_title, options.namespace);
		page_title = this.normalize_title(page_title);

		return this.redirects_data[page_title] || page_title;
	}

	function is_template(template_name, token, options) {
		options = Object.assign({
			namespace : 'Template'
		}, options);

		var session = wiki_API.session_of_options(options)
				|| wiki_API.is_wiki_API(this) && this;

		if (session) {
			// normalize template name
			template_name = session.redirect_target_of(template_name, options);
		}

		if (token.type === 'transclusion') {
			// treat token as template token
			// assert: token.name is normalized
			token = token.name;
		}
		if (session) {
			token = session.redirect_target_of(token, options);
		}

		// console.trace([ template_name, token ]);
		return template_name === token;
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

	function add_session_to_options(session, options) {
		options = library_namespace.setup_options(options);
		options[KEY_SESSION] = session;
		return options;
	}

	// export 導出.

	// @instance 實例相關函數。
	Object.assign(wiki_API.prototype, {
		redirect_target_of : redirect_target_of,
		is_template : is_template,

		// @see function get_continue(), get_list()
		show_next : typeof JSON === 'object' && JSON.stringify
		//
		? function show_next() {
			return this.next_mark && JSON.stringify(this.next_mark);
		} : function old_show_next() {
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
		},

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
			if (typeof options !== 'object')
				options = {
					namespace : options || 0
				}
			return page_title_is_namespace(page_title, add_session_to_options(
					this, options));
		},
		to_namespace : function to_namespace(page_title, options) {
			if (typeof options !== 'object')
				options = {
					namespace : options || 0
				}
			return convert_page_title_to_namespace(page_title,
					add_session_to_options(this, options));
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

		normalize_title
		//
		: function wiki_API_normalize_title(page_title, options) {
			return normalize_page_name(page_title, add_session_to_options(this,
					options));
		},

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
		add_parameters : add_parameters,
		is_wikidata_site : is_wikidata_site,
		language_code_to_site_alias : language_code_to_site_alias,

		PATTERN_URL_prefix : PATTERN_URL_prefix,
		PATTERN_wikilink : PATTERN_wikilink,
		PATTERN_wikilink_global : PATTERN_wikilink_global,
		PATTERN_file_prefix : PATTERN_file_prefix,
		PATTERN_URL_WITH_PROTOCOL_GLOBAL : PATTERN_URL_WITH_PROTOCOL_GLOBAL,
		PATTERN_category_prefix : PATTERN_category_prefix,

		PATTERN_PROJECT_CODE_i : PATTERN_PROJECT_CODE_i,
		PATTERN_wiki_project_URL : PATTERN_wiki_project_URL
	});

	// ------------------------------------------

	// @static
	Object.assign(wiki_API, {
		api_URL : api_URL,
		set_language : set_default_language,
		// site_name_of
		site_name : language_to_site_name,

		LTR_SCRIPTS : LTR_SCRIPTS,
		PATTERN_LTR : PATTERN_LTR,
		PATTERN_category : PATTERN_category,

		upper_case_initial : upper_case_initial,

		is_namespace : page_title_is_namespace,
		to_namespace : convert_page_title_to_namespace,
		remove_namespace : remove_page_title_namespace,
		//
		is_talk_namespace : is_talk_namespace,
		to_talk_page : to_talk_page,
		talk_page_to_main : talk_page_to_main,

		file_pattern : file_pattern,

		plain_text : wikitext_to_plain_text,

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
		// normalize_page_title
		normalize_title : normalize_page_name,
		normalize_title_pattern : normalize_name_pattern,
		get_hash : list_to_hash,
		unique_list : unique_list
	});

	// wiki_API.namespace = get_namespace;
	return get_namespace;
}
