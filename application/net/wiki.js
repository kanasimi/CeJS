/**
 * @name CeL function for MediaWiki (Wikipedia / 維基百科)
 * 
 * @fileoverview 本檔案包含了 MediaWiki 自動化作業用的程式庫，主要用於編寫[[維基百科:機器人]]
 *               ([[WP:{{{name|{{int:Group-bot}}}}}|{{{name|{{int:Group-bot}}}}}]])。
 * 
 * TODO:<code>

wiki_API.work() 遇到 Invalid token 之類問題，中途跳出 abort 時，無法紀錄。應將紀錄顯示於 console 或 local file。
wiki_API.page() 整合各 action=query 至單一公用 function。
[[mw:Manual:Pywikibot/zh]]

[[mw:Help:OAuth]]
https://www.mediawiki.org/wiki/OAuth/Owner-only_consumers
https://meta.wikimedia.org/wiki/Steward_requests/Miscellaneous#OAuth_permissions

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

WikiData Remote editor
http://tools.wmflabs.org/widar/


get user infomation:
https://www.mediawiki.org/w/api.php?action=help&modules=query%2Busers
https://zh.wikipedia.org/w/api.php?action=query&format=json&list=users&usprop=blockinfo|groups|implicitgroups|rights|editcount|registration|emailable|gender|centralids|cancreate&usattachedwiki=zhwiki&ususers=username|username
https://www.mediawiki.org/w/api.php?action=help&modules=query%2Busercontribs
https://zh.wikipedia.org/w/api.php?action=query&format=json&list=usercontribs&uclimit=1&ucdir=newer&ucprop=ids|title|timestamp|comment|parsedcomment|size|sizediff|flags|tags&ucuser=username

對Action API的更改，請訂閱
https://lists.wikimedia.org/pipermail/mediawiki-api-announce/

雙重重定向/重新導向/転送
特別:二重リダイレクト
Special:DoubleRedirects
Special:BrokenRedirects
https://www.mediawiki.org/w/api.php?action=help&modules=query%2Bquerypage
[[mw:User:Duplicatebug/API Overview/action]]
https://test.wikipedia.org/w/api.php?action=query&list=querypage&qppage=DoubleRedirects&qplimit=max


gadgets 小工具 [[Wikipedia:Tools]], [[Category:Wikipedia scripts]], [[mw:ResourceLoader/Core modules]]
[[Special:MyPage/common.js]] [[使用說明:維基用戶腳本開發指南]]

// ---------------------------------------------------------

// https://doc.wikimedia.org/mediawiki-core/master/js/#!/api/mw.loader
mw.loader.load('https://kanasimi.github.io/CeJS/ce.js')
CeL.run('application.net.wiki');
CeL.wiki.page('Wikipedia:機器人',function(page_data){console.log(page_data);},{redirects:true,section:0})

// wikibits從2013年就棄用
// https://www.mediawiki.org/wiki/ResourceLoader/Legacy_JavaScript#wikibits.js
// NG: importScript('User:cewbot/*.js');

你可以在維基媒體的wiki網站URL最後增加?safemode=1來關閉你個人的CSS和JavaScript。範例：https://zh.wikipedia.org/wiki/文學?safemode=1。上面一行意思是你可以測試是否是你的使用者腳本或套件造成問題，而不必解除安裝。

</code>
 */

// More examples: see /_test suite/test.js
// Wikipedia bots demo: https://github.com/kanasimi/wikibot
// JavaScript MediaWiki API for ECMAScript 2017+ :
// https://github.com/kanasimi/wikiapi
'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.wiki',

	// .includes() @ CeL.data.code.compatibility
	// .between() @ CeL.data.native
	// .append() @ CeL.data.native
	require : 'data.code.compatibility.|data.native.'
	// (new Date).format('%4Y%2m%2d'), (new Date).format() @ CeL.data.date
	// optional 選用: .show_value() @ CeL.interact.DOM, CeL.application.debug
	// optional 選用: CeL.wiki.cache(): CeL.application.platform.nodejs.fs_mkdir()
	// optional 選用: CeL.wiki.traversal(): CeL.application.platform.nodejs
	// optional 選用: wiki_API.work(): gettext():
	// optional 選用: CeL.application.storage
	// CeL.application.locale.gettext()
	+ '|application.net.Ajax.get_URL'
	// CeL.date.String_to_Date(), Julian_day(), .to_millisecond(): CeL.data.date
	+ '|data.date.',

	// 設定不匯出的子函式。
	no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring
	var get_URL = this.r('get_URL'),
	//
	gettext = library_namespace.cache_gettext(function(_) {
		gettext = _;
	});

	var
	/** {Number}未發現之index。 const: 基本上與程式碼設計合一，僅表示名義，不可更改。(=== -1) */
	NOT_FOUND = ''.indexOf('_');

	// --------------------------------------------------------------------------------------------

	/** {String} old key: 'wiki' */
	var KEY_SESSION = 'session', KEY_HOST_SESSION = 'host';

	// https://github.com/Microsoft/TypeScript/wiki/JSDoc-support-in-JavaScript
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
	 * @returns {wiki_API} wiki site API
	 * @template wiki_API
	 * 
	 * @constructor
	 */
	function wiki_API(user_name, password, API_URL) {
		var options;
		if (API_URL && typeof API_URL === 'object') {
			// session = new wiki_API(user_name, password, options);
			options = API_URL;
			API_URL = options.API_URL;
		} else if (!API_URL && !password && user_name
				&& typeof user_name === 'object') {
			// session = new wiki_API(options);
			options = user_name;
			// console.log(options);
			user_name = options.user_name;
			password = options.password;
			API_URL = options.API_URL;
		} else {
			options = Object.create(null);
		}

		// console.trace([ user_name, password, API_URL ]);
		library_namespace.debug('API_URL: ' + API_URL + ', default language: '
				+ wiki_API.language, 3, 'wiki_API');
		if (!this || this.constructor !== wiki_API) {
			return wiki_API.query.apply(null, arguments);
		}

		this.token = {
			// lgusername
			lgname : user_name,
			lgpassword : password
		};

		// action queue 佇列。應以 append，而非整個換掉的方式更改。
		this.actions = [];

		// 紀錄各種後續檢索用索引值。應以 append，而非整個換掉的方式更改。
		// 對舊版本須用到 for (in .next_mark)
		this.next_mark = Object.create(null);

		// setup session.
		if (API_URL) {
			setup_API_language(this /* session */, API_URL);
			setup_API_URL(this /* session */, API_URL);
		}

		if (!('language' in this)
		// wikidata 不設定 language。
		&& !this.is_wikidata) {
			setup_API_language(this /* session */, wiki_API.language);
		}

		// ------------------------------------------------
		// pre-loading functions

		this.siteinfo();

		// console.log(options);
		if (options.task_configuration_page) {
			this.adapt_task_configurations(options.task_configuration_page,
					options.adapt_configuration);
		}
	}

	/**
	 * 檢查若 value 為 session。
	 * 
	 * @param value
	 *            value to test. 要測試的值。
	 * 
	 * @returns {Boolean} value 為 session。
	 */
	function is_wiki_API(value) {
		return value
				&& ((value instanceof wiki_API) || value.API_URL && value.token);
	}

	// extract session from options, get_session_from_options
	// var session = session_of_options(options);
	function session_of_options(options) {
		var session = options
		// 此時嘗試從 options[KEY_SESSION] 取得 session。
		&& options[KEY_SESSION] || options;
		if (is_wiki_API(session)) {
			return session;
		}
	}

	// 維基姊妹項目
	// TODO: 各種 type 間的轉換: 先要能擷取出 language code + family
	//
	// type: 'API', 'db', 'site', 'link', 'dump', ...
	// API URL (default): e.g., 'https://www.wikidata.org/w/api.php'
	//
	// https://www.wikidata.org/w/api.php?action=help&modules=wbgetentities
	// site: e.g., 'zhwiki'. `.wikiid` @ siteinfo
	// @see wikidatawiki_p.wb_items_per_site.ips_site_id
	//
	// [[en:Help:Interwikimedia_links]] [[Special:Interwiki]]
	// https://zh.wikipedia.org/wiki/Special:GoToInterwiki/testwiki:
	// link prefix: e.g., 'zh:n:' for zh.wikinews
	//
	// https://dumps.wikimedia.org/backup-index.html
	// dump: e.g., 'zhwikinews'
	//
	// SHOW DATABASES;
	// db: e.g., 'zhwiki_p'
	//
	//
	// language (or family/project): default language: wiki_API.language
	// e.g., 'en', 'zh-classical', 'ja', ...
	//
	// project = language_code.family
	//
	// [[meta:List of Wikimedia projects by size]]
	// family: 'wikipedia' (default), 'news', 'source', 'books', 'quote', ...
	function get_project(language, family, type) {
		// @see CeL.wiki.site_name(wiki), language_to_site_name(wiki)
		TODO;
	}

	// @inner TODO: MUST re-design
	function get_wikimedia_project_name(session) {
		return is_wiki_API(session)
		// e.g., commons, wikidata
		&& session.family === 'wikimedia'
		// https://meta.wikimedia.org/wiki/Special:SiteMatrix
		// TODO: using session.project_name or something others
		&& session.language;
	}

	var
	/**
	 * {RegExp}wikilink內部連結的匹配模式v2 [ all_link, page_and_section, page_name,
	 * section_title, displayed_text ]
	 * 
	 * 頁面標題不可包含無效的字元：[\n\[\]{}�]，經測試 anchor 亦不可包含[\n\[\]{}]，但 display text 可以包含
	 * [\n]
	 * 
	 * @see PATTERN_link
	 */
	PATTERN_wikilink = /\[\[(([^\[\]\|{}\n#�]+)(#(?:-{[^\[\]{}\n\|]+}-|[^\[\]{}\n\|]+)?)?|#[^\[\]{}\n\|]+)(?:\|([\s\S]+?))?\]\]/,
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
			// 若有必要設定，應使用 normalize_title_parameter(title, options)。
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
			// 毋須 '&redirects=1'
			action[1] += '&redirects';
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
			// TODO: 篩選掉指定為false的
			action[1] += '&' + get_URL.parameters_to_String(options.parameters);
		} else {
			library_namespace.debug('無法處理之 options.parameters: ['
					+ options.parameters + ']', 1, 'add_parameters');
		}
	}

	// --------------------------------------------------------------------------------------------

	var default_site_configurations = {

	};

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
		// && is_wiki_API(session)
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
					wiki.get_URL_options.headers['User-Agent'] = CeL.get_URL.default_user_agent;
				}
			}

		}

		// TODO: 這只是簡陋的判別方法。
		var matched = session.API_URL
				&& session.API_URL.match(PATTERN_wiki_project_URL);
		if (matched
				&& !/test|wiki/i.test(matched[3])
				&& ((matched = matched[4].toLowerCase()) in api_URL.shortcut_of_project)) {
			// e.g., "wikipedia"
			session.family = matched;
		}
	}

	// @see set_default_language(), language_to_site_name()
	function setup_API_language(session, language_code) {
		if (PATTERN_PROJECT_CODE_i.test(language_code)
				// 不包括 test2.wikipedia.org 之類。
				&& !/test|wiki/i.test(language_code)
				// 排除 'Talk', 'User', 'Help', 'File', ...
				&& !(session.configurations.namespace_pattern || get_namespace.pattern)
						.test(language_code)) {
			// [[m:List of Wikipedias]]
			session.language
			// e.g., 'zh-classical', 'zh-yue', 'zh-min-nan', 'simple'
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
			// 'main|module|template|category'
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
				// 要指定所有值，請使用*。
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
					library_namespace.debug('Invalid namespace: ['
					//
					+ n + '] @ namespace list ' + namespace,
					//
					1, 'get_namespace');
				} else {
					list.push(0);
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

		if (namespace !== undefined) {
			library_namespace.warn('get_namespace: Invalid namespace: ['
					+ namespace + ']');
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
		return page_ns === get_namespace(namespace, options);
	}

	function convert_page_title_to_namespace(page_title, options) {
		var namespace = !options ? 0 : !isNaN(options) ? +options
				: typeof options === 'string' ? options : options.namespace;
		page_title = wiki_API.normalize_title(page_title, options);
		return get_namespace(namespace, Object.assign({
			get_name : true
		}, options)) + ':' + remove_page_title_namespace(page_title, options);
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
			CeL.debug('Is already talk page: ' + page_title, 3, 'to_talk_page');
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
			CeL.debug('Is already NOT talk page: ' + page_title, 3,
					'to_talk_page');
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
		return words.replace(/^[^\s]/g, function(initial_char) {
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

		/** {Boolean}採用 "_" 取代 " "。 */
		var use_underline = options.use_underline;
		page_name = use_underline
		// ' ' → '_': 在 URL 上可更簡潔。
		? page_name.replace(/ /g, '_') : page_name.replace(/_/g, ' ');

		page_name = page_name.split(':');
		var has_language;
		var session = session_of_options(options);
		var no_session_namespace_hash = !session
				|| !session.configurations.namespace_hash;
		var interwiki_pattern = session
				&& session.configurations.interwiki_pattern
				|| /^[a-z][a-z_\-]+$/i;
		page_name.some(function(section, index) {
			section = use_underline ? section.replace(/^[\s_]+/, '') : section
					.trimStart();

			// 必然包含 page title，因此不處理最後一個。
			if (index === page_name.length - 1) {
				// page title: 將首個字母轉成大寫。
				page_name[index] = upper_case_initial(section);
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
				session && interwiki_pattern.test(section)) {
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

	// [ all, file name without "File:" ]
	PATTERN_file_prefix = new RegExp('^ *(?:: *)?(?:' + PATTERN_file_prefix
			+ ') *: *([^\\[\\]|#]+)', 'i');

	// "Category" 本身可不分大小寫。
	// 分類名稱重複時，排序索引以後出現者為主。
	var
	// [ all_category_text, category_name, sort_order, post_space ]
	PATTERN_category = /\[\[ *(?:Category|分類|分类|カテゴリ|분류) *: *([^\[\]\|{}\n]+)(?:\s*\|\s*([^\[\]\|�]*))?\]\](\s*\n?)/ig,
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

		if (session && display_text === undefined && !is_wiki_API(session)) {
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

	function revision_content(revision) {
		if (!revision)
			return '';

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
		return revision['*'] || '';
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
	 * @param {String}flow_view
	 *            對 flow page，所欲取得之頁面內容項目。<br />
	 *            default: 'header'
	 * 
	 * @returns {String|Undefined}content of page, maybe undefined.
	 */
	function get_page_content(page_data, flow_view) {
		if (!page_data) {
			// e.g., page_data === undefined
			return page_data;
		}

		// for flow page: 因為 page_data 可能符合一般頁面標準，
		// 此時會先得到 {"flow-workflow":""} 之類的內容，
		// 因此必須在檢測一般頁面之前先檢測 flow page。
		// page_data.header: 在 Flow_page()=CeL.wiki.Flow.page 中設定。
		// page_data.revision: 由 Flow_page()=CeL.wiki.Flow.page 取得。
		var content =
		// page_data.is_Flow &&
		(page_data[flow_view] || page_data['header'] || page_data).revision;
		if (content && (content = content.content)) {
			// page_data.revision.content.content
			return content.content;
		}

		if (page_data.expandtemplates
		// 若有則用之，否則最起碼回傳一般的內容。
		&& ('wikitext' in page_data.expandtemplates)) {
			if (flow_view === 'expandtemplates')
				return String(page_data.expandtemplates.wikitext || '');

			library_namespace.debug(wiki_API.title_link_of(page_data)
			//
			+ ': The page has expandtemplates.wikitext but do not used.', 1,
					'get_page_content');
		}

		// 檢測一般頁面。
		if (wiki_API.is_page_data(page_data)) {
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
			if (content.length > 1 && typeof flow_view !== 'number') {
				// 有多個版本的情況：因為此狀況極少，不統一處理。
				// 一般說來caller自己應該知道自己設定了rvlimit>1，因此此處不警告。
				// 警告：但多版本的情況需要自行偵測是否回傳{Array}！
				return content.map(function(revision) {
					return revision_content(revision);
				});
			}
			// treat flow_view as revision_index
			if (flow_view < 0) {
				// e.g., -1: select the oldest revision.
				flow_view += content.length;
			}
			content = content[flow_view | 0];
			return revision_content(content);
		}

		// 一般都會輸入 page_data: {"pageid":0,"ns":0,"title":""}
		// : typeof page_data === 'string' ? page_data

		// ('missing' in page_data): 此頁面不存在/已刪除。
		// e.g., { ns: 0, title: 'title', missing: '' }
		// TODO: 提供此頁面的刪除和移動日誌以便參考。
		return ('missing' in page_data) || ('invalid' in page_data) ? undefined
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

	// return {Object}main revision (.revisions[0])
	get_page_content.revision = function(page_data, revision_index) {
		return library_namespace.is_Object(page_data)
		// treat as page data. Try to get page contents:
		// revision_content(page.revisions[0])
		// 一般說來應該是由新排到舊，[0] 為最新的版本 last revision。
		&& page_data.revisions && page_data.revisions[revision_index || 0];
	};

	// 曾經以 session.page() 請求過內容。
	get_page_content.had_fetch_content = function(page_data, revision_index) {
		return get_page_content.revision(page_data) || ('missing' in page_data)
		// {title:'%2C',invalidreason:
		// 'The requested page title contains invalid characters: "%2C".'
		// ,invalid:''}
		|| ('invalid' in page_data);
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
			: 'page',
	// 用來取得 entity value 之屬性名。 函數 : wikidata_entity_value
	// 為了方便使用，不採用 Symbol()。
	KEY_get_entity_value = 'value';

	// check if session.last_data is usable, 非過期資料。
	function last_data_is_usable(session) {
		// When "servers are currently under maintenance", session.last_data is
		// a string.
		if (typeof session.last_data === 'object' && !session.last_data.error
		// 若是session.last_data與session.last_page連動，必須先確認是否沒變更過session.last_page，才能當作cache、跳過重新擷取entity之作業。
		&& (!(KEY_CORRESPOND_PAGE in session.last_data)
		// assert:
		// wiki_API.is_page_data(session.last_data[KEY_CORRESPOND_PAGE])
		|| session.last_page === session.last_data[KEY_CORRESPOND_PAGE])) {
			library_namespace.debug('Use cached data: [['
			//
			+ (KEY_CORRESPOND_PAGE in session.last_data
			// may use wiki_API.title_link_of()
			? session.last_page.id : session.last_data.id) + ']]', 1,
					'last_data_is_usable');
			return true;
		}
	}

	// --------------------------------------------------------------------------------------------
	// instance 實例相關函數。

	wiki_API.prototype.configurations = default_site_configurations;

	/**
	 * 設定工作/添加新的工作。
	 * 
	 * 注意: 每個 callback 皆應在最後執行 session.next()。
	 * 
	 * 警告: 若 callback throw，可能導致工作中斷，不會自動復原，得要以 wiki.next() 重起工作。
	 * 
	 * 工作原理: 每個實體會hold住一個queue ({Array}this.actions)。 當設定工作時，就把工作推入佇列中。
	 * 另外內部會有另一個行程負責依序執行每一個工作。
	 */
	wiki_API.prototype.next = function next() {
		this.running = 0 < this.actions.length;
		if (!this.running) {
			// this.thread_count = 0;
			library_namespace.debug('The queue is empty.', 2,
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
		if (// type in get_list.type
		wiki_API.list.type_list.includes(type)) {
			list_type = type;
			type = 'list';
		}

		if (library_namespace.is_debug(3)) {
			library_namespace.debug(
			//
			'處理 ' + (this.token.lgname ? this.token.lgname + ' ' : '') + '['
			//
			+ next.map(function(arg) {
				// for function
				var message;
				if (arg && arg.toString) {
					message = arg.toString();
				} else {
					try {
						message = JSON.stringify(arg);
					} catch (e) {
						// message = String(arg);
						message = library_namespace.is_type(arg);
					}
				}
				return message && message.slice(0, 80);
			}) + ']', 1, 'wiki_API.prototype.next');
		}

		// 若需改變，需同步更改 wiki_API.prototype.next.methods
		switch (type) {

		// ------------------------------------------------
		// setup options

		case 'set_URL':
			// next[1] : callback
			setup_API_URL(this /* session */, next[1]);
			this.next();
			break;

		case 'set_language':
			// next[1] : callback
			setup_API_language(this /* session */, next[1]);
			this.next();
			break;

		case 'set_data':
			// 設定 this.data_session。
			// using @inner
			// setup_data_session(session, callback, API_URL, password, force)
			wiki_API.setup_data_session(this /* session */,
			// 確保 data_session login 了才執行下一步。
			function() {
				// next[1] : callback of set_data
				if (typeof next[1] === 'function')
					next[1].call(_this);
				_this.next();
			}, next[2], next[3], next[4]);
			break;

		// ------------------------------------------------
		// account

		case 'login':
			library_namespace.debug(
					'正 log in 中，當 login 後，會自動執行 .next()，處理餘下的工作。', 2,
					'wiki_API.prototype.next');
			// rollback
			this.actions.unshift(next);
			break;

		case 'logout':
			// 結束
			// next[1] : callback
			wiki_API.logout(this /* session */, next[1]);
			// this.next();
			break;

		// ------------------------------------------------
		// page access

		case 'query':
			console.trace('use query');
			throw new Error('Please use .query_API() instead of only .query()!');
			library_namespace
					.error('Please use .query_API() instead of only .query()!');
		case 'query_API':
			// wiki_API.query(action, callback, post_data, options)
			wiki_API.query(next[1], function query_API_callback(data, error) {
				if (typeof next[2] === 'function') {
					// next[2] : callback
					next[2].call(_this, data, error);
				}
				// 再設定一次，預防有執行期中間再執行的情況。
				// e.g., wiki.query_api(action,function(){wiki.page();})
				// 注意: 這動作應該放在callback()執行完後設定。
				_this.next();
			}, next[3],
			// next[4] : options
			add_session_to_options(this, next[4]));
			break;

		case 'siteinfo':
			// wiki.siteinfo(options, callback)
			// wiki.siteinfo(callback)
			if (typeof next[1] === 'function' && !next[2]) {
				// next[1] : callback
				next[2] = next[1];
				next[1] = null;
			}

			wiki_API.siteinfo(add_session_to_options(this, next[1]), function(
					data, error) {
				if (typeof next[2] === 'function') {
					// next[2] : callback
					next[2].call(_this, data, error);
				}
				// run next action
				_this.next();
			});
			break;

		case 'page':
			// this.page(page data, callback, options);
			if (library_namespace.is_Object(next[2]) && !next[3]) {
				// 直接輸入 options，未輸入 callback。
				next.splice(2, 0, null);
			}

			// → 此法會採用所輸入之 page data 作為 this.last_page，不再重新擷取 page。
			if (wiki_API.is_page_data(next[1])
			// 必須有頁面內容，要不可能僅有資訊。有時可能已經擷取過卻發生錯誤而沒有頁面內容，此時依然會再擷取一次。
			&& (get_page_content.has_content(next[1])
			// 除非剛剛才取得，同一個執行緒中不需要再度取得內容。
			|| next[3] && next[3].allow_missing
			// && ('missing' in next[1])
			)) {
				library_namespace.debug('採用所輸入之 '
						+ wiki_API.title_link_of(next[1])
						+ ' 作為 this.last_page。', 2, 'wiki_API.prototype.next');
				this.last_page = next[1];
				if (typeof next[2] === 'function') {
					// next[2] : callback
					next[2].call(this, next[1]);
				}
				this.next();
			} else if (typeof next[1] === 'function') {
				// this.page(callback): callback(last_page)
				// next[1] : callback
				next[1].call(this, this.last_page);
				this.next();
			} else {
				if (false) {
					console.trace(_this.thread_count + '/'
							+ _this.actions.length + 'actions: '
							+ _this.actions.slice(0, 9).map(function(action) {
								return action[0];
							}));
					// console.log(next);
				}

				// this.page(title, callback, options)
				// next[1] : title
				// next[3] : options
				// [ {String}API_URL, {String}title or {Object}page_data ]
				wiki_API.page(is_api_and_title(next[1]) ? next[1] : [
						this.API_URL, next[1] ],
				//
				function wiki_API_next_page_callback(page_data, error) {
					if (false) {
						if (Array.isArray(page_data)) {
							console.trace(page_data.length
									+ ' pages get: '
									+ page_data.slice(0, 10).map(
											function(page_data) {
												return page_data.title;
											}));
						} else {
							console.trace([ page_data, error ]);
						}
					}
					// assert: 當錯誤發生，例如頁面不存在/已刪除，依然需要模擬出 page_data。
					// 如此才能執行 .page().edit()。
					_this.last_page
					// 正常情況。確保this.last_page為單頁面。需要使用callback以取得result。
					= Array.isArray(page_data) ? page_data[0] : page_data;
					// next[2] : callback
					if (typeof next[2] === 'function')
						next[2].call(_this, page_data, error);
					_this.next();
				},
				// next[3] : options
				add_session_to_options(this, next[3]));
			}
			break;

		case 'parse':
			// e.g., wiki.page('title').parse();
			// next[1] : options
			wiki_API.parser(this.last_page, next[1]);
			this.next();
			break;

		case 'purge':
			if (typeof next[1] === 'string' || typeof next[1] === 'number') {
				// purge() 可以直接輸入頁面，不必先 .page('Title')
				// wiki.purge('Title', callback, options)
				// wiki.purge('Title', options)
				// wiki.purge(pageid, callback, options)
				// wiki.purge('pageid|pageid', options)
			} else {
				// wiki.page('Title').purge()
				// wiki.page('Title').purge(callback, options)
				// wiki.page('Title').purge(options)
				next.splice(1, 0, this.last_page);
			}

			if (library_namespace.is_Object(next[2]) && !next[3]) {
				// 直接輸入 options，未輸入 callback。
				next.splice(2, 0, null);
			}

			// next: [ 'purge', pages, callback, options ]

			if (!next[1]) {
				library_namespace
						.warn('wiki_API.prototype.next.purge: No page inputed!');
				// next[3] : callback
				if (typeof next[3] === 'function') {
					next[3].call(_this, undefined, 'no page');
				}
				this.next();

			} else {
				wiki_API.purge([ this.API_URL, next[1] ],
				//
				function wiki_API_next_purge_callback(purge_pages, error) {
					// next[2] : callback
					if (typeof next[2] === 'function') {
						next[2].call(_this, purge_pages, error);
					}
					_this.next();
				},
				// next[3] : options
				add_session_to_options(this, next[3]));
			}
			break;

		case 'redirect_to':
			// this.redirect_to(page data, callback, options);
			if (library_namespace.is_Object(next[2]) && !next[3]) {
				// 直接輸入 options，未輸入 callback。
				next.splice(2, 0, null);
			}

			// this.redirect_to(title, callback, options)
			// next[1] : title
			// next[3] : options
			// [ {String}API_URL, {String}title or {Object}page_data ]
			wiki_API.redirect_to(is_api_and_title(next[1]) ? next[1] : [
					this.API_URL, next[1] ],
			//
			function wiki_API_next_redirect_to_callback(redirect_data,
					page_data, error) {
				// next[2] : callback
				if (typeof next[2] === 'function') {
					next[2].call(_this, redirect_data, page_data, error);
				}
				_this.next();
			},
			// next[3] : options
			add_session_to_options(this, next[3]));
			break;

		case 'list':
			// get_list(). e.g., 反向連結/連入頁面。

			// next[1] : 大部分是 page title,
			// 但因為有些方法不需要用到頁面標題(recentchanges,allusers)因此對於這一些方法需要特別處理。
			if (typeof next[1] === 'function' && typeof next[2] !== 'function') {
				next.splice(1, 0, '');
			}

			// 注意: arguments 與 get_list() 之 callback 連動。
			wiki_API[list_type]([ this.API_URL, next[1] ],
			//
			function wiki_API_next_list_callback(pages, error) {
				// [ page_data ]
				_this.last_pages = pages;

				if (typeof next[2] === 'function') {
					// 注意: arguments 與 get_list() 之 callback 連動。
					// next[2] : callback(pages, error)
					next[2].call(_this, pages, error);
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
				// [KEY_SESSION]
				session : this
			}, this.next_mark, next[3]));
			break;

		// case 'category_tree':
		// @see wiki_API.prototype.category_tree @ application.net.wiki.list

		case 'search':
			wiki_API.search([ this.API_URL, next[1] ],
			//
			function wiki_API_search_callback(pages, error) {
				// undefined || [ page_data ]
				_this.last_pages = pages;
				// 設定/紀錄後續檢索用索引值。
				// 若是將錯誤的改正之後，應該重新自 offset 0 開始 search。
				// 因此這種情況下基本上不應該使用此值。
				if (pages && pages.sroffset)
					_this.next_mark.sroffset = pages.sroffset;

				if (typeof next[2] === 'function') {
					// next[2] : callback(...)
					next[2].call(_this, pages || [], error);
				} else if (next[2] && next[2].each) {
					// next[2] : 當作 work，處理積存工作。
					// next[2].each(page_data, messages, config)
					_this.work(next[2]);
				}

				_this.next();
			},
			// next[3] : options
			add_session_to_options(this, next[3]));
			break;

		case 'copy_from':
			// `wiki_API_prototype_copy_from`
			wiki_API.edit.copy_from.apply(this, next.slice(1));
			// TODO: callback: this.next();
			break;

		// ----------------------------------------------------------------------------------------

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
			if (this.checking_now || ('stopped' in this)
			// force to check
			&& !next[1].force) {
				if (this.checking_now) {
					library_namespace.debug('checking now...', 3,
							'wiki_API.prototype.next');
				} else {
					library_namespace.debug('Skip check_stop().', 1,
							'wiki_API.prototype.next');
				}
				if (typeof next[2] === 'function') {
					// next[2] : callback(...)
					next[2].call(this, this.stopped);
				}
				// 在多執行緒的情況下，避免 `RangeError: Maximum call stack size exceeded`。
				setTimeout(this.next.bind(this), 0);

			} else {
				// 僅檢測一次。在多執行緒的情況下，可能遇上檢測多次的情況。
				this.checking_now = next[1].title || true;

				library_namespace.debug('以 .check_stop() 檢查與設定是否須停止編輯作業。', 1,
						'wiki_API.prototype.next');
				library_namespace
						.debug('Using options to call check_stop(): '
								+ JSON.stringify(next[1]), 2,
								'wiki_API.prototype.next');
				next[1].token = this.token;
				// 正作業中之 wiki_API instance。
				next[1][KEY_SESSION] = this;
				wiki_API.check_stop(function(stopped) {
					delete _this.checking_now;
					library_namespace.debug('check_stop: ' + stopped, 1,
							'wiki_API.prototype.next');
					_this.stopped = stopped;
					if (typeof next[2] === 'function') {
						// next[2] : callback(...)
						next[2].call(_this, stopped);
					}
					_this.next();
				},
				// next[1] : options
				next[1]);
			}
			break;

		case 'edit':
			// wiki.edit(page contents, options, callback)
			if (typeof next[2] === 'string') {
				// wiki.edit(page contents, summary, callback)
				next[2] = {
					summary : next[2]
				};
			}

			// 在多執行緒的情況下，例如下面
			// `next[1] = next[1].call(next[2], next[2].page_to_edit)`
			// 的時候，this.last_page 可能會被改變，因此先作個 cache。
			// next[2]: options
			// console.trace(next[2]);
			next[2] = library_namespace.setup_options(next[2]);
			// `next[2].page_to_edit`: 手動指定要編輯的頁面。
			if (!next[2].page_to_edit) {
				next[2].page_to_edit = this.last_page;
			}
			// console.trace(next[2]);
			// console.trace(next);

			// TODO: {String|RegExp|Array}filter

			if (false && next[2].page_to_edit !== this.last_page) {
				console.trace('session.edit: '
						+ (next[2].page_to_edit && next[2].page_to_edit.title));
				console.log('last_page: '
						+ (this.last_page && this.last_page.title));
			}

			if (!next[2].page_to_edit) {
				library_namespace
						.warn('wiki_API.prototype.next: No page in the queue. You must run .page() first!');
				// next[3] : callback
				if (typeof next[3] === 'function') {
					next[3].call(_this, undefined, 'no page');
				}
				this.next();
				break;
			}

			if (typeof next[1] !== 'string'
			//
			&& !get_page_content.had_fetch_content(next[2].page_to_edit)) {
				if (false) {
					library_namespace
							.warn('wiki_API.prototype.next: 有多個執行緒互相競爭？本執行緒將會直接跳出，等待另一個取得頁面內容的執行緒完成後，由其處理。');
					console.trace(next);
				}
				console.log(next);
				throw new Error('wiki_API.prototype.next: 有多個執行緒互相競爭？');
				break;
			}

			if (!('stopped' in this)) {
				library_namespace.debug(
						'edit: rollback, check if need stop 緊急停止.', 2,
						'wiki_API.prototype.next');
				this.actions.unshift([ 'check', null, function() {
					library_namespace.debug(
					//
					'edit: recover next[2].page_to_edit: '
					//
					+ wiki_API.title_link_of(next[2].page_to_edit) + '.',
					//
					2, 'wiki_API.prototype.next');
					// _this.last_page = next[2].page_to_edit;
				} ], next);
				this.next();
				break;
			}

			if (this.stopped && !next[2].skip_stopped) {
				library_namespace.warn('wiki_API.prototype.next: 已停止作業，放棄編輯'
						+ wiki_API.title_link_of(next[2].page_to_edit) + '！');
				// next[3] : callback
				if (typeof next[3] === 'function')
					next[3].call(this, next[2].page_to_edit.title, '已停止作業');
				this.next();
				break;
			}

			var check_and_delete_revisions = function() {
				if (!next[2].page_to_edit)
					return;
				if (_this.actions.length[0] && _this.actions[0][0] === 'edit'
				//明確指定內容時，只要知道標題即可，不必特地檢查是否有內容。
				&& typeof _this.actions[0][1] !== 'string'
				//
				&& next[2].page_to_edit === _this.actions[0][2].page_to_edit) {
					// assert: wiki.page().edit().edit()
					// e.g., 20160906.archive_moegirl.js
					// Should reget page
					_this.actions.unshift([ 'page',
							_this.actions[0][2].page_to_edit ]);
				}
				// 因為已經更動過內容，為了預防 this.last_page 取得已修改過的錯誤資料，因此將之刪除。但留下標題資訊。
				delete next[2].page_to_edit.revisions;
			};

			if (next[2].page_to_edit.is_Flow) {
				// next[2]: options to call edit_topic()=CeL.wiki.Flow.edit
				// .section: 章節編號。 0 代表最上層章節，new 代表新章節。
				if (next[2].section !== 'new') {
					library_namespace
							.warn('wiki_API.prototype.next: The page to edit is Flow. I can not edit it directly.');
					// next[3] : callback
					if (typeof next[3] === 'function') {
						// 2017/9/18 Flow已被重新定義為結構化討論 / 結構式討論。
						// is [[mw:Structured Discussions]].
						next[3].call(this, next[2].page_to_edit.title,
								'is Flow');
					}
					this.next();
					break;
				}

				if (!next[2].page_to_edit.header) {
					// rollback
					this.actions.unshift(next);
					// 先取得關於討論板的描述。以此為依據，檢測頁面是否允許機器人帳戶訪問。
					// Flow_page()
					wiki_API.Flow.page(next[2].page_to_edit, function() {
						// next[3] : callback
						if (typeof next[3] === 'function')
							next[3].call(this, next[2].page_to_edit.title);
						check_and_delete_revisions();
						_this.next();
					}, {
						flow_view : 'header',
						// [KEY_SESSION]
						session : this
					});
					break;
				}

				if ((!next[2] || !next[2].ignore_denial)
						&& wiki_API.edit.denied(next[2].page_to_edit,
								this.token.lgname, next[2]
										&& next[2].notification)) {
					// {{bot}} support for flow page
					// 採用 next[2].page_to_edit 的方法，
					// 在 multithreading 下可能因其他 threading 插入而造成問題，須注意！
					library_namespace
							.warn('wiki_API.prototype.next: Denied to edit flow '
									+ wiki_API
											.title_link_of(next[2].page_to_edit));
					// next[3] : callback
					if (typeof next[3] === 'function')
						next[3]
								.call(this, next[2].page_to_edit.title,
										'denied');
					this.next();
					break;
				}

				library_namespace.debug('直接採用 Flow 的方式增添新話題。');
				// use/get the contents of next[2].page_to_edit
				if (typeof next[1] === 'function') {
					// next[1] =
					// next[1](get_page_content(next[2].page_to_edit),
					// next[2].page_to_edit.title, next[2].page_to_edit);
					// 需要同時改變 wiki_API.edit！
					// next[2]: options to call
					// edit_topic()=CeL.wiki.Flow.edit
					// .call(options,): 使(回傳要編輯資料的)設定值函數能以this即時變更 options。
					next[1] = next[1].call(next[2], next[2].page_to_edit);
				}

				// edit_topic()
				wiki_API.Flow.edit([ this.API_URL, next[2].page_to_edit ],
				// 新章節/新話題的標題文字。
				next[2].sectiontitle,
				// 新話題最初的內容。因為已有 contents，直接餵給轉換函式。
				// [[mw:Flow]] 會自動簽名，因此去掉簽名部分。
				next[1].replace(/[\s\n\-]*~~~~[\s\n\-]*$/, ''),
				//
				this.token,
				// next[2]: options to call edit_topic()=CeL.wiki.Flow.edit
				add_session_to_options(this, next[2]), function(title, error,
						result) {
					// next[3] : callback
					if (typeof next[3] === 'function')
						next[3].call(_this, title, error, result);
					check_and_delete_revisions();
					_this.next();
				});
				break;
			}

			if ((!next[2] || !next[2].ignore_denial)
					&& wiki_API.edit.denied(next[2].page_to_edit,
							this.token.lgname, next[2] && next[2].notification)) {
				// 採用 next[2].page_to_edit 的方法，
				// 在 multithreading 下可能因其他 threading 插入而造成問題，須注意！
				library_namespace
						.warn('wiki_API.prototype.next: Denied to edit '
								+ wiki_API.title_link_of(next[2].page_to_edit));
				// next[3] : callback
				if (typeof next[3] === 'function')
					next[3].call(this, next[2].page_to_edit.title, 'denied');
				this.next();
				break;
			}

			// ----------------------------------------------------------------------
			// wiki_API.edit()

			var original_queue,
			// 必須在最終執行剛好一次 check_next() 以 `this.next()`。
			check_next = function(no_next) {
				if (original_queue) {
					// assert: {Array}original_queue.length > 0
					if (false) {
						console.trace('回填/回復 queue[' + original_queue.length
								+ ']');
					}
					_this.actions.append(original_queue);
					// free
					original_queue = null;
				}
				// 無論如何都再執行 this.next()，並且設定 this.running。
				// e.g., for
				// 20200209.「S.P.A.L.」関連ページの貼り換えのbot作業依頼.js
				if (!no_next)
					_this.next();
			};

			if (typeof next[1] === 'function') {
				// 為了避免消耗 memory，儘可能把本 sub 任務先執行完。
				// e.g., 20200206.reminded_expired_AfD.js
				// 採用 cache queue 再回填/回復 queue，在程序把 edit 動作與後面的動作連成一體、相互影響時會出錯。
				if (false && this.actions.length > 0) {
					original_queue = this.actions.clone();
					this.actions.truncate();
					// console.trace('queue[' + original_queue.length + ']');
				}
				// console.trace('next:');
				// console.log(next);

				// next[1] = next[1](get_page_content(next[2].page_to_edit),
				// next[2].page_to_edit.title, next[2].page_to_edit);
				// 需要同時改變 wiki_API.edit！
				// next[2]: options to call edit_topic()=CeL.wiki.Flow.edit
				// .call(options,): 使(回傳要編輯資料的)設定值函數能以this即時變更 options。
				next[1] = next[1].call(next[2], next[2].page_to_edit);
			}

			if (next[2] && next[2].skip_nochange
			// 採用 skip_nochange 可以跳過實際 edit 的動作。
			&& next[1] === get_page_content(next[2].page_to_edit)) {
				library_namespace
						.debug('Skip [' + next[2].page_to_edit.title
								+ ']: The same contents.', 1,
								'wiki_API.prototype.next');
				// next[3] : callback
				if (typeof next[3] === 'function')
					next[3].call(this, next[2].page_to_edit.title, 'nochange');
				check_next();
				break;
			}

			wiki_API.edit([ this.API_URL, next[2].page_to_edit ],
			// 因為已有 contents，直接餵給轉換函式。
			next[1], this.token,
			// next[2]: options to call wiki_API.edit()
			add_session_to_options(this, next[2]),
			//
			function wiki_API_next_edit_callback(title, error, result) {
				// 當運行過多次，就可能出現 token 不能用的情況。需要重新 get token。
				if (result ? result.error
				//
				? result.error.code === 'badtoken'
				// 有時 result 可能會是 ""，或者無 result.edit。這通常代表 token lost。
				: !result.edit
				// flow:
				// {status:'ok',workflow:'...',committed:{topiclist:{...}}}
				&& result.status !== 'ok' : result === '') {
					// Invalid token
					library_namespace.warn(
					//
					'wiki_API.prototype.next: ' + _this.language
					//
					+ ': It seems we lost the token. 似乎丟失了 token。');
					// console.log(result);
					if (!library_namespace.platform.nodejs) {
						library_namespace.error('wiki_API.prototype.next: '
								+ 'Not using node.js!');
						return;
					}
					// 下面的 workaround 僅適用於 node.js。
					if (!_this.token.lgpassword) {
						library_namespace.error('wiki_API.prototype.next: '
								+ 'No password preserved!');
						// 死馬當活馬醫，仍然嘗試重新取得 token...沒有密碼無效。
						return;
					}
					library_namespace.info('wiki_API.prototype.next: '
							+ 'Try to get token again. 嘗試重新取得 token。');
					// rollback
					_this.actions.unshift(
					// 重新登入以後，編輯頁面之前再取得一次頁面內容。
					[ 'page', next[2].page_to_edit.title ], next);
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
					// TODO: 在這即使 rollback 了 action，
					// 還是可能出現丟失 next[2].page_to_edit 的現象。
					// e.g., @ 20160517.解消済み仮リンクをリンクに置き換える.js

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

					check_next(true);

					// 重新取得 token。
					wiki_API.login(_this.token.lgname,
					//
					_this.token.lgpassword, {
						force : true,
						// [KEY_SESSION]
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
						next[3].apply(_this, arguments);
					// assert: 應該有 next[2].page_to_edit。
					check_and_delete_revisions();
					check_next();
				}
			});
			break;

		// ----------------------------------------------------------------------------------------

		case 'upload':
			var tmp = next[1];
			if (typeof tmp === 'object'
			// wiki.upload(file_data + options, callback)
			&& (tmp = tmp.file_path
			//
			|| tmp.media_url || tmp.file_url)) {
				// shift arguments
				next.splice(1, 0, tmp);

			} else if (typeof next[2] === 'string') {
				// wiki.upload(file_path, comment, callback)
				next[2] = {
					comment : next[2]
				};
			}

			// wiki.upload(file_path, options, callback)
			wiki_API.upload(next[1], this.token.csrftoken,
			// next[2]: options to call wiki_API.edit()
			add_session_to_options(this, next[2]), function(result, error) {
				// next[3] : callback
				if (typeof next[3] === 'function')
					next[3].call(_this, result, error);
				_this.next();
			});
			break;

		case 'cache':
			if (library_namespace.is_Object(next[2]) && !next[3]) {
				// 未設定/不設定 callback
				// shift arguments
				next.splice(2, 0, undefined);
			}

			// 因為 wiki_API.cache(list) 會使用到 wiki_API.prototype[method]，
			// 算是 .next() 編制外功能；
			// 因此需要重新設定 this.running，否則可能中途停止。
			// 例如 this.running = true，但是實際上已經不會再執行了。
			// TODO: 這可能會有bug。
			this.running = 0 < this.actions.length;

			// wiki.cache(operation, callback, _this);
			wiki_API.cache(next[1], function() {
				// overwrite callback() to run this.next();
				// next[2] : callback
				if (typeof next[2] === 'function')
					next[2].apply(_this, arguments);
				// 因為 wiki_API.cache(list) 會使用到 wiki_API.prototype[method]；
				// 其最後會再 call wiki_API.next()，是以此處不再重複 call .next()。
				// _this.next();
			},
			// next[3]: options to call wiki_API.cache()
			Object.assign({
				// default options === this

				// including main, File, Template, Category
				// namespace : '0|6|10|14',

				// title_prefix : 'Template:',

				// cache path prefix
				// prefix : base_directory,

				// [KEY_SESSION]
				session : this
			}, next[3]));
			break;

		case 'listen':
			if (!wiki_API.wmflabs) {
				// 因為 wiki_API.cache(list) 會使用到 wiki_API.prototype[method]；
				// 其最後會再 call wiki_API.next()，是以此處不再重複 call .next()。

				// 因為接下來的操作會呼叫 this.next() 本身，
				// 因此必須把正在執行的標記消掉。
				this.running = false;
			}

			wiki_API.listen(next[1],
			// next[2]: options to call wiki_API.listen()
			add_session_to_options(this, next[2]));

			if (wiki_API.wmflabs) {
				this.next();
			}
			break;

		// ------------------------------------------------
		// Wikidata access

		case 'data':
			if (!('data_session' in this)) {
				// rollback, 確保已設定 this.data_session。
				this.actions.unshift([ 'set_data' ], next);
				this.next();
				break;
			}

			if (typeof next[1] === 'function') {
				library_namespace.debug(
						'直接將 last_data 輸入 callback: ' + next[1], 3,
						'wiki_API.prototype.next.data');
				if (last_data_is_usable(this)) {
					next[1].call(this, this.last_data);
					this.next();
					break;
				} else {
					library_namespace.debug('last data 不能用。', 3,
							'wiki_API.prototype.next.data');
					// delete this.last_data;
					if (!this.last_page) {
						next[1].call(this, undefined, {
							code : 'no_id',
							message : 'Did not set id! 未設定欲取得之特定實體 id。'
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

			// 因為前面利用cache時會檢查KEY_CORRESPOND_PAGE，且KEY_CORRESPOND_PAGE只會設定在page_data，
			// 因此這邊自屬於page_data之輸入項目設定 .last_page
			if (wiki_API.is_page_data(next[1])
			// 預防把 wikidata entity 拿來當作 input 了。
			&& !wiki_API.is_entity(next[1])) {
				this.last_page = next[1];
			}
			// wikidata_entity(key, property, callback, options)
			wiki_API.data(next[1], next[2], function(data, error) {
				// 就算發生錯誤，依然設定一個 dummy，預防 edit_data 時引用可能非所欲的 this.last_page。
				_this.last_data = data || {
					key : next[1],
					error : error
				};
				if (false) {
					// 因為在wikidata_entity()裡面設定了[KEY_SESSION]，因此JSON.stringify()會造成:
					// TypeError: Converting circular structure to JSON
					library_namespace.debug('設定 entity data: '
							+ JSON.stringify(_this.last_data), 3,
							'wiki_API.prototype.next.data');
				}
				// next[3] : callback
				if (typeof next[3] === 'function') {
					next[3].call(this, data, error);
				}
				_this.next();
			},
			// next[4] : options
			add_session_to_options(this.data_session, next[4]));
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
			|| library_namespace.is_Object(next[1])
					&& !wiki_API.is_entity(next[1])) {
				library_namespace.debug('未設定/不設定 id，第一個 next[1] 即為 data。', 6,
						'wiki_API.next.edit_data');
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

					if (false) {
						// TypeError: Converting circular structure to JSON
						library_namespace.debug('this.last_data: '
								+ JSON.stringify(this.last_data), 6,
								'wiki_API.next.edit_data');
						library_namespace.debug('this.last_page: '
								+ JSON.stringify(this.last_page), 6,
								'wiki_API.next.edit_data');
					}
					if (last_data_is_usable(this)) {
						// shift arguments
						next.splice(1, 0, this.last_data);

					} else if (this.last_data && this.last_data.error
					// @see last_data_is_usable(session)
					&& this.last_page === this.last_data[KEY_CORRESPOND_PAGE]) {
						library_namespace.debug('前一次之wikidata實體取得失敗', 6,
								'wiki_API.next.edit_data');
						next[3] && next[3].call(this, undefined, {
							code : 'last_data_failed',
							message : '前一次之wikidata實體取得失敗: ['
							// 例如提供的 foreign title 錯誤，
							+ (this.last_data[KEY_CORRESPOND_PAGE]
							// 或是 foreign title 為 redirected。
							|| (this.last_data.site
							// 抑或者存在 foreign title 頁面，但沒有 wikidata entity。
							+ ':' + this.last_data.title)) + ']'
						});
						this.next();
						break;

					} else if (this.last_page) {
						library_namespace.debug('自 .last_page '
								+ wiki_API.title_link_of(this.last_page)
								+ ' 取得特定實體。', 6, 'wiki_API.next.edit_data');
						// e.g., edit_data({Function}data)
						next.splice(1, 0, this.last_page);

					} else {
						next[3] && next[3].call(this, undefined, {
							code : 'no_id',
							message : 'Did not set id! 未設定欲取得之特定實體 id。'
						});
						this.next();
						break;
					}
				}
			}

			// needless: 會從 get_data_API_URL(options) 取得 API_URL。
			if (false && !Array.isArray(next[1])) {
				// get_data_API_URL(this)
				next[1] = [ this.data_session.API_URL, next[1] ];
			}

			// next = [ 'edit_data', id, data[, options, callback] ]
			if (typeof next[3] === 'function' && !next[4]) {
				// 未輸入 options，但輸入 callback。
				next.splice(3, 0, null);
			}

			// 因為前面利用cache時會檢查KEY_CORRESPOND_PAGE，且KEY_CORRESPOND_PAGE只會設定在page_data，
			// / / 因此這邊自屬於page_data之輸入項目設定 .last_page
			if (wiki_API.is_page_data(next[1])
			// 預防把 wikidata entity 拿來當作 input 了。
			&& !wiki_API.is_entity(next[1])) {
				this.last_page = next[1];
			}
			// wikidata_edit(id, data, token, options, callback)
			wiki_API.edit_data(next[1], next[2], this.data_session.token,
			// next[3] : options
			add_session_to_options(this.data_session, next[3]),
			// callback
			function(data, error) {
				if (false && data && !wiki_API.is_entity(data)) {
					console.trace(data);
					throw 'data is NOT entity';
				}
				_this.last_data = data || {
					// 有發生錯誤:設定 error log Object。
					last_data : _this.last_data,
					key : next[1],
					error : error
				};
				// next[4] : callback
				if (typeof next[4] === 'function') {
					next[4].call(this, data, error);
				}
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
			// wikidata_merge(to, from, token, options, callback)
			wiki_API.merge_data(next[1], next[2], this.data_session.token,
			// next[3] : options
			add_session_to_options(this.data_session, next[3]),
			// next[4] : callback
			function(data, error) {
				// 此 wbmergeitems 之回傳 data 不包含 item 資訊。
				// next[4] : callback
				if (typeof next[4] === 'function') {
					next[4].call(this, data, error);
				}
				_this.next();
			});
			break;

		case 'query_data':
			// wdq, query data
			// wikidata_query(query, callback, options)
			wiki_API.wdq(next[1], function(data) {
				_this.last_list = Array.isArray(data) ? data : null;
				// next[2] : callback
				if (typeof next[2] === 'function')
					next[2].call(this, data);
				_this.next();
			}, next[3]);
			break;

		// ------------------------------------------------

		// administrator functions

		case 'move_to':
			// wiki_API.move_to(): move a page from `from` to target `to`.

			// wiki.page(from title)
			// .move_to(to, [from title,] options, callback)

			// wiki.move_to(to, from, options, callback)
			// wiki.move_to(to, from, options)
			// wiki.move_to(to, from, callback)
			// wiki.move_to(to, from)

			// wiki.page(from).move_to(to, options, callback)
			// wiki.page(from).move_to(to, options)
			// wiki.page(from).move_to(to, callback)
			// wiki.page(from).move_to(to)

			if (type === 'move_to') {
				var move_to_title;
				if (typeof next[1] === 'string') {
					move_to_title = next[1];
					// shift arguments
					next.splice(1, 1);
				}
			}

		case 'remove':
			// wiki.page(title).remove([title,] options, callback)
			if (type === 'remove') {
				// 正名。
				type = 'delete';
			}
		case 'delete':
			// wiki.page(title).delete([title,] options, callback)

		case 'protect':
			// wiki.page(title).protect([title,] options, callback)

		case 'rollback':
			// wiki.page(title).rollback([title,] options, callback)

			// --------------------------------------------

			// 這些控制用的功能，不必須取得頁面內容。
			if (typeof next[1] === 'string') {
				// 輸入的第一個參數是頁面標題。
				// e.g.,
				// wiki.remove(title, options, callback)
				this.last_page = {
					title : next[1]
				};
				// shift arguments
				next.splice(1, 1);
			}

			if (typeof next[1] === 'function') {
				// shift arguments
				// insert as options
				next.splice(1, 0, undefined);
			}
			if (!next[1]) {
				// initialize options
				next[1] = Object.create(null);
			}

			if (type === 'move_to') {
				if (move_to_title) {
					next[1].to = move_to_title;
				}
			}

			// 保護/回退
			if (this.stopped && !next[1].skip_stopped) {
				library_namespace.warn('wiki_API.prototype.next: 已停止作業，放棄 '
				//
				+ type + ' [['
				//
				+ (next[1].title || next[1].pageid || this.last_page
				//
				&& this.last_page.title) + ']]！');
				// next[2] : callback
				if (typeof next[2] === 'function')
					next[2].call(this, next[1], '已停止作業');
				this.next();

			} else {
				next[1][KEY_SESSION] = this;
				wiki_API[type](next[1], function(response, error) {
					// next[2] : callback
					if (typeof next[2] === 'function')
						next[2].call(_this, response, error);
					_this.next();
				});
			}
			break;

		// ------------------------------------------------
		// 流程控制

		case 'wait':
			// rollback
			this.actions.unshift(next);
			break;

		case 'run':
			// next[1] : callback
			if (typeof next[1] === 'function') {
				// pass arguments
				next[1].apply(this, next.slice(2));
			}
			this.next();
			break;

		case 'run_async':
			// ** MUST call `this.next();` in the callback function!
			// next[1] : callback
			if (typeof next[1] === 'function') {
				// pass arguments
				next[1].apply(this, next.slice(2));
			} else {
				this.next();
			}
			break;

		// ------------------------------------------------

		default:
			library_namespace.error('Unknown operation: [' + next.join() + ']');
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
	wiki_API.prototype.next.methods = 'query_API|siteinfo|page|parse|redirect_to|purge|check|copy_from|edit|upload|cache|listen|category_tree|search|remove|delete|move_to|protect|rollback|logout|run|run_async|set_URL|set_language|set_data|data|edit_data|merge_data|query_data|query'
			.split('|');

	// ------------------------------------------------------------------------

	// e.g., " (99%): 0.178 page/ms, 1.5 minutes estimated."
	function estimated_message(processed_amount, total_amount, starting_time,
			page_count, unit) {
		/** {Natural}ms */
		var time_elapsed = Date.now() - starting_time;
		// estimated time of completion 估計時間 預計剩下時間 預估剩餘時間 預計完成時間還要多久
		var estimated = time_elapsed / processed_amount
				* (total_amount - processed_amount);
		if (estimated > 99 && estimated < 1e15/* Infinity */) {
			estimated = library_namespace.age_of(0, estimated, {
				digits : 1
			});
			estimated = ', ' + estimated + ' estimated';
		} else {
			estimated = '';
		}

		var speed;
		if (page_count > 0) {
			if (!unit) {
				// page(s)
				unit = 'page';
			}
			speed = page_count / time_elapsed;
			speed = speed < 1 ? (1e3 * speed).toFixed(2) + ' ' + unit + '/s'
					: speed.toFixed(3) + ' ' + unit + '/ms';
			speed = ': ' + speed;
		} else {
			speed = '';
		}

		return (page_count > 0 ? page_count === total_amount ? processed_amount
				+ '/' + total_amount : page_count : '')
				+ ' ('
				+ (100 * processed_amount / total_amount | 0)
				+ '%)'
				+ speed + estimated;
	}

	// ------------------------------------------------------------------------

	// 或者還可以去除 "MediaWiki message delivery" 這些系統預設的非人類發布者。
	/** {RegExp}pattern to test if is a robot name. CeL.wiki.PATTERN_BOT_NAME */
	var PATTERN_BOT_NAME = /bot(?:$|[^a-z])|[機机][器械]人|ボット(?:$|[^a-z])|봇$/i;
	// ↑ /(?:$|[^a-z])/: e.g., PxBot~testwiki, [[ko:User:2147483647 (bot)]],
	// a_bot2, "DynBot Srv2", "Kwjbot II", "Purbo T"
	// TODO: [[User:CommonsDelinker]], BotMultichill, "Flow talk page manager",
	// "Maintenance script", "MediaWiki default", "MediaWiki message delivery"

	/**
	 * default date format. 預設的日期格式
	 * 
	 * @type {String}
	 * @see ISO 8601
	 */
	wiki_API.prototype.date_format = '%4Y%2m%2dT%2H%2M';

	var default_continue_key = 'Continue key';
	/** {String}後續索引。後續檢索用索引值標記名稱。 */
	wiki_API.prototype.continue_key = default_continue_key;

	/**
	 * 規範 log 之格式。(for wiki_API.prototype.work)
	 * 
	 * 若有必要跳過格式化的訊息，應該自行調用 message.push({String}message) 而非
	 * message.add({String}message)。
	 * 
	 * @param {String}message
	 *            message
	 * @param {String}[title]
	 *            message title.
	 * @param {Boolean}[use_ordered_list]
	 *            use ordered list.
	 */
	function add_message(message, title, use_ordered_list) {
		if (typeof message !== 'string') {
			message = message && String(message) || '';
		}
		message = message.trim();
		if (message) {
			if (title) {
				title = wiki_API.title_link_of(title);
				if (title) {
					if (/^\[\[[^\[\]\|{}\n#�:]*:/.test(title)) {
						// 對於非條目作特殊處理。
						title = "'''" + title + "'''";
					}
					title += ' ';
				}
			}
			message = (use_ordered_list ? '# ' : '* ') + (title || '')
					+ message;
			this.push(message);
		}
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
	 *            URI component list: page id / title / data
	 * @param {Natural}[limit]
	 *            max count
	 * @param {Natural}[limit_length]
	 *            max length in bytes
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
		if (!(limit_length > 0)) {
			limit_length = 8000;
		}
		if (false && !(limit > 0)) {
			limit = 5000;
		}

		var length = 0, index = piece_list.length;

		if (false)
			piece_list.slice(0, limit_length / 30).join('|').slice(0,
					limit_length).replace(/[^|]+$/, '');

		if (piece_list.some(function(piece, i) {
			if (!piece || !(piece.pageid >= 0)) {
				length = 1;
				return true;
			}
			// console.log([ piece, length ]);
			length += piece.pageid.toString().length + 3;
			if (i === index || i >= limit || length >= limit_length) {
				// console.log({ i, index, limit, limit_length, length });
				index = i;
				length = 0;
				return true;
			}
		}) && length > 0) {
			library_namespace.debug('Some pieces are not page data.', 1,
					'check_max_length');
			length = 0;
			piece_list.some(function(piece, i) {
				length += encodeURIComponent(piece && piece.title
				// +3 === encodeURIComponent('|').length: separator '|'
				|| piece).length + 3;
				if (i >= limit || length >= limit_length) {
					index = i;
					return true;
				}
			});
		}
		// console.log(piece_list);
		library_namespace.debug('1–' + index + '/' + piece_list.length
				+ ', length ' + length, 2, 'check_max_length');
		if (false && typeof piece_list[2] === 'string')
			library_namespace.log(piece_list.slice(0, index).join('|'));

		return index;
	}

	// wiki_API.prototype.work(config, page_list): configuration:
	({
		// 注意: 與 wiki_API.prototype.work(config)
		// 之 config.before/config.after 連動。
		before : function before(messages, pages) {
		},
		// {Function|Array} 每個 page 執行一次。
		each : function each(page_data, messages) {
			return 'text to replace';
		},
		// 注意: 與 wiki_API.prototype.work(config)
		// 之 config.before/config.after 連動。
		after : function after(messages, pages) {
		},
		// run this at last. 在 wiki_API.prototype.work() 工作最後執行此 config.last()。
		last : function last() {
		},
		// 不作編輯作業。
		no_edit : true,
		// 設定寫入目標。一般為 debug、test 測試期間用。
		write_to : '',
		/** {String}運作記錄存放頁面。 */
		log_to : 'User:Robot/log/%4Y%2m%2d',
		// 「新條目、修飾語句、修正筆誤、內容擴充、排版、內部鏈接、分類、消歧義、維基化」
		/** {String}編輯摘要。總結報告。編輯理由。 edit reason. */
		summary : ''
	});

	/**
	 * robot 作業操作之輔助套裝函數。此函數可一次取得50至300個頁面內容再批次處理。<br />
	 * 不會推入 this.actions queue，即時執行。因此需要先 get list！
	 * 
	 * 注意: arguments 與 get_list() 之 callback 連動。
	 * 
	 * @param {Object}config
	 *            configuration. { page_options: { rvprop: 'ids|timestamp|user' } }
	 * @param {Array}pages
	 *            page data list
	 */
	wiki_API.prototype.work = function do_batch_work(config, pages) {
		// console.log(JSON.stringify(pages));
		if (typeof config === 'function')
			config = {
				each : config
			};
		if (!config || !config.each) {
			library_namespace.warn('wiki_API.work: Bad callback!');
			return;
		}
		if (!('no_edit' in config)) {
			// default: 未設定 summary 則不編輯頁面。
			config.no_edit = !config.summary;
		} else if (!config.no_edit && !config.summary) {
			library_namespace
					.warn('wiki_API.work: Did not set config.summary when edit page (config.no_edit='
							+ config.no_edit + ')!');
		}

		if (!pages)
			pages = this.last_pages;
		// config.run_empty: 即使無頁面/未取得頁面，依舊強制執行下去。
		if (!pages && !config.run_empty) {
			// 採用推入前一個 this.actions queue 的方法，
			// 在 multithreading 下可能因其他 threading 插入而造成問題，須注意！
			library_namespace
					.warn('wiki_API.work: No list. Please get list first!');
			return;
		}

		library_namespace.debug('wiki_API.work: 開始執行: 先作環境建構與初始設定。');
		if (config.summary) {
			// '開始處理 ' + config.summary + ' 作業'
			library_namespace.sinfo([ 'wiki_API.work: Start [', 'fg=yellow',
					config.summary, '-fg', ']' ]);
		}

		/**
		 * <code>
		 * default handler [ text replace function(title, content), {Object}options, callback(title, error, result) ]
		 * </code>
		 */
		var each,
		// options 在此暫時作為 default options。
		options = config.options || {
			// 預設會取得大量頁面。
			multi : true,
			// Throw an error if the page doesn't exist.
			// 若頁面不存在/已刪除，則產生錯誤。
			// 要取消這項，須注意在重定向頁之對話頁操作之可能。
			nocreate : 1,
			// 該編輯是一個小修訂 (minor edit)。
			minor : 1,
			// 標記此編輯為機器人編輯。[[WP:AL|機器人對其他使用者對話頁的小修改將不會觸發新訊息提示]]。
			bot : 1,
			// [[Special:tags]]
			// tags : 'bot|test',
			// 設定寫入目標。一般為 debug、test 測試期間用。
			write_to : '',
			// 採用 skip_nochange 可以跳過實際 edit 的動作。
			// 對於大部分不會改變頁面的作業，能大幅加快速度。
			skip_nochange : true
		}, callback,
		/** {ℕ⁰:Natural+0}全無變更頁面數。 */
		nochange_count = 0;

		if (Array.isArray(pages) && pages.length === 0) {
			if (!config.no_warning) {
				library_namespace.info('wiki_API.work: 列表中沒有項目，快速完結。');
			}
			if (typeof config.last === 'function') {
				this.run(config.last.bind(options));
			}
			return;
		}

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

		} else if (Array.isArray(config.each)) {
			each = config;
		} else {
			library_namespace.error(
			//
			'wiki_API.work: Invalid function for each page!');
		}

		if (each[1]) {
			Object.assign(options, each[1]);
		}
		callback = config.summary;
		// 採用 {{tlx|template_name}} 時，[[Special:RecentChanges]]頁面無法自動解析成 link。
		options.summary = callback
		// 是為 Robot 運作。
		? PATTERN_BOT_NAME.test(callback) ? callback
		// Robot: 若用戶名包含 'bot'，則直接引用之。
		: (this.token.lgname && this.token.lgname.length < 9
				&& PATTERN_BOT_NAME.test(this.token.lgname)
		//
		? this.token.lgname : 'Robot')
				+ ': ' + callback
		// 未設置時，一樣添附 Robot。
		: 'Robot';

		// assert: 因為要作排程，為預防衝突與不穩定的操作結果，自此以後不再 modify options。

		var done = 0,
		//
		log_item = Object.assign(Object.create(null),
				wiki_API.prototype.work.log_item, config.log_item), messages = [];
		/** config.no_message: {Boolean}console 不顯示訊息，也不處理 {Array}messages。 */
		messages.add = config.no_message ? library_namespace.null_function
				: add_message;
		messages.reset = config.no_message ? library_namespace.null_function
				: reset_messages;
		messages.reset();

		callback = each[2];
		// each 現在轉作為對每一頁面執行之工作。
		each = each[0];
		if (!callback) {
			// TODO: [[ja:Special:Diff/62546431|有時最後一筆記錄可能會漏失掉]]
			callback = config.no_message ? library_namespace.null_function
			// default logger.
			: function do_batch_work_summary(title, error, result) {
				if (error) {
					// ((return [ CeL.wiki.edit.cancel, 'skip' ];))
					// 來跳過 (skip) 本次編輯動作，不特別顯示或處理。
					// 被 skip/pass 的話，連警告都不顯現，當作正常狀況。
					if (error === 'skip') {
						done++;
						nochange_count++;
						return;
					}

					if (error === 'nochange') {
						done++;
						// 未經過 wiki 操作，於 wiki_API.edit 發現為[[WP:NULLEDIT|無改變]]的。
						// 無更動 沒有變更 No modification made
						nochange_count++;
						error = gettext('no change');
						result = 'nochange';
					} else {
						// 有錯誤發生。
						// e.g., [protectedpage]
						// The "editprotected" right is required to edit this
						// page
						if (config.onerror)
							config.onerror(error);
						result = [ 'error', error ];
						error = gettext('finished: %1', error);
					}
				} else if (!result || !result.edit) {
					// 有時 result 可能會是 ""，或者無 result.edit。這通常代表 token lost。
					library_namespace.error('wiki_API.work: 無 result.edit'
							+ (result && result.edit ? '.newrevid' : '')
							+ '！可能是 token lost！');
					if (false) {
						console.trace(Array.isArray(title) && title[1]
								&& title[1].title ? title[1].title : title);
					}
					error = 'no "result.edit'
							+ (result && result.edit ? '.newrevid".' : '.');
					result = [ 'error', 'token lost?' ];

				} else {
					// 成功完成。
					done++;
					if (result.edit.newrevid) {
						// https://en.wikipedia.org/wiki/Help:Wiki_markup#Linking_to_old_revisions_of_pages.2C_diffs.2C_and_specific_history_pages
						// https://zh.wikipedia.org/?diff=000
						// cf. [[Special:Permalink/0|title]],
						// [[Special:Diff/prev/0]]
						error = ' [[Special:Diff/' + result.edit.newrevid + '|'
						// may use wiki_API.title_link_of()
						+ gettext('finished') + ']]';
						result = 'succeed';
					} else if ('nochange' in result.edit) {
						// 經過 wiki 操作，發現為[[WP:NULLEDIT|無改變]]的。
						nochange_count++;
						error = gettext('no change');
						result = 'nochange';
					} else {
						// 有時無 result.edit.newrevid。
						library_namespace.error('無 result.edit.newrevid');
						error = gettext('finished');
						result = 'succeed';
					}
				}

				// error: message, result: result type.

				if (log_item[Array.isArray(result)
				// {Array}result = [ main error code, sub ]
				? result.join('_') in log_item ? result.join('_') : result[0]
						: result]) {
					error = gettext('%1 elapsed, %3 at %2',
					// 紀錄使用時間, 歷時, 費時, elapsed time
					messages.last.age(new Date), (messages.last = new Date)
					//
					.format(config.date_format || this.date_format), error);

					// 對各個條目的紀錄加入計數。
					messages.add(error, title, true);
				}
			};
		}

		if (Array.isArray(pages) && pages.slice(0, 10).every(function(item) {
			return typeof item === 'string';
		})) {
			// 傳入標題列表。
			messages.input_title_list = true;
		}

		if (false && Array.isArray(pages) && !titles) {
			library_namespace.warn('wiki_API.work: rebuild titles.');
			titles = pages.map(function(page) {
				return page.title;
			});
		}

		var main_work = (function(data, error) {
			if (error) {
				library_namespace.error('wiki_API.work: Get error: '
						+ (error.info || error));
				// console.log(error);
				data = [];
			} else if (!Array.isArray(data)) {
				if (!data && this_slice_size === 0) {
					library_namespace.info('wiki_API.work: ' + config.summary
					// 任務/工作
					+ ': 未取得或設定任何頁面。這個部份的任務已完成？');
					data = [];
				} else if (data) {
					// 可能是 page data 或 title。
					data = [ data ];
				} else {
					library_namespace
							.error('wiki_API.work: No valid data got!');
					data = [];
				}
			}

			if (false && data.length !== this_slice_size) {
				// @deprecated: using pages.OK_length

				// assert: data.length < this_slice_size
				if (data.truncated) {
					if (setup_target) {
						// 處理有時可能連 data 都是 trimmed 過的。
						// -this_slice_size: 先回溯到 pages 開頭之 index。
						work_continue -= this_slice_size - data.length;
						library_namespace.debug('一次取得大量頁面時，回傳內容超過限度而被截斷。將回退 '
								+ (this_slice_size - data.length) + '頁。', 0,
								'wiki_API.work');

					} else if (library_namespace.is_debug(0)) {
						library_namespace.warn(
						//
						'wiki_API.work: query 所得之 length (' + data.length
						//
						+ ') !== this slice size (' + this_slice_size + ') ！');
					}

				} else if (!config.no_warning) {
					// TODO: 此時應該沒有 .continue。
					library_namespace.warn('wiki_API.work: 取得 ' + data.length
							+ '/' + this_slice_size + ' 個頁面，應有 '
							+ (this_slice_size - data.length) + ' 個不存在或重複頁面。');
				}
			}

			// 傳入標題列表，則由程式自行控制，毋須設定後續檢索用索引值。
			if (!messages.input_title_list
					// config.continue_session:
					// 後續檢索用索引值存儲所在的 {wiki_API}，將會以此 instance 之值寫入 log。
					&& (pages = 'continue_session' in config ? config.continue_session
							: this)
					// pages: 後續檢索用索引值之暫存值。
					&& (pages = pages.show_next())) {
				// 當有 .continue_session 時，其實用不到 log page 之 continue_key。
				if (!config.continue_session && !this
				// 忽略表示完結的紀錄，避免每個工作階段都顯示相同訊息。
				|| pages !== '{}'
				// e.g., 後続の索引: {"continue":"-||"}
				&& !/^{"[^"]+":"[\-|]{0,9}"}$/.test(pages)) {
					// console.log(config);
					// console.log(options);
					// console.log(this.continue_key + ':' +
					// JSON.stringify(pages));
					messages.add(this.continue_key + ': ' + pages);
				}
			}

			if (!config.no_message) {
				// 使用時間, 歷時, 費時, elapsed time
				pages = gettext('First, use %1 to get %2 pages.', messages.last
						.age(new Date), data.length);
				// 在「首先使用」之後才設定 .last，才能正確抓到「首先使用」。
				messages.last = new Date;
				if (log_item.get_pages) {
					messages.add(pages);
				}
				library_namespace.debug(pages, 2, 'wiki_API.work');
				if (library_namespace.is_debug()
				// .show_value() @ interact.DOM, application.debug
				&& library_namespace.show_value)
					library_namespace.show_value(data, 'pages');
			}

			pages = data;

			// run before every batch task. 在處理每個批次前執行此function。
			// 注意: 一次取得大量頁面時，回傳內容不一定會按照原先輸入的次序排列！
			// 若有必要，此時得用 config.before() 自行處理！
			if (typeof config.before === 'function') {
				// titles 可能為 undefined！
				// 注意: 與 wiki_API.prototype.work(config)
				// 之 config.before/config.after 連動。
				//
				// 2016/6/22 change API 應用程式介面變更:
				// .first(messages, titles, pages) → .before(messages, pages,
				// titles)
				// 2019/8/7 change API 應用程式介面變更:
				// .before(messages, pages, titles) → .before(messages, pages)
				// 按照需求程度編排 arguments，並改變適合之函數名。
				config.before.call(this, messages, pages);
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
						if (work_continue === NOT_FOUND) {
							throw new Error('page id not found: ' + continue_id);
						}
						// assert: 一定找得到。
						// work_continue≥pages開頭之index=(原work_continue)-pages.length
					} else {
						continue_id |= 0;
						while (pages[--work_continue].pageid !== continue_id)
							;
					}
					effect_length += work_continue;
					if (false) {
						console.log([ effect_length, pages.length,
								work_continue ]);
					}

					// assert: 0 < effect_length < pages.length
					library_namespace.debug('一次取得大量頁面時，回傳內容過長而被截斷。將回退 '
							+ (pages.length - effect_length) + '頁，下次將自 '
							+ effect_length + '/' + pages.length + ' '
							//
							+ wiki_API.title_link_of
							//
							(pages[effect_length]) + ' id ' + continue_id
							+ ' 開始。', 1, 'wiki_API.work');
					pages = pages.slice(0, effect_length);

				} else {
					library_namespace.error('wiki_API.work: 回傳內容過長而被截斷！');
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
					library_namespace.error('wiki_API.work: 回傳內容超過限度而被截斷！僅取得 '
							+ pages.length + '/' + this_slice_size + ' 個頁面');
				}

				library_namespace.debug('一次取得大量頁面時，回傳內容超過限度而被截斷。將回退 '
						+ (pages.length - pages.OK_length)
						+ '頁'
						+ (pages[pages.OK_length] ? '，下次將自 '
								+ pages.OK_length
								+ '/'
								+ pages.length
								+ ' '
								+ wiki_API
										.title_link_of(pages[pages.OK_length])
								+ ' id ' + pages[pages.OK_length].pageid
								+ ' 開始' : '') + '。', 1, 'wiki_API.work');
				pages = pages.slice(0, pages.OK_length);

			} else if (!config.no_warning && pages.length !== this_slice_size) {
				// assert: data.length < this_slice_size
				library_namespace.warn('wiki_API.work: 取得 ' + pages.length
						+ '/' + this_slice_size + ' 個頁面，應有 '
						+ (this_slice_size - pages.length) + ' 個不存在或重複頁面。');
			}

			library_namespace.debug('for each page: 主要機制是把工作全部推入 queue。', 2,
					'wiki_API.work');
			// 剩下的頁面數量 pages remaining. cf. ((done))
			var promises = [];
			if (pages.length > 0) {
				var pages_left = 0, pages_rationed = false;
				pages.forEach(function for_each_page(page, index) {
					if (library_namespace.is_debug(2)
					// .show_value() @ interact.DOM, application.debug
					&& library_namespace.show_value)
						library_namespace.show_value(page, 'page');
					if (!page) {
						// nochange_count++;
						// Skip invalid page. 預防如 .work(['']) 的情況。
						return;
					}

					function clear_work() {
						// 警告: 直接清空 .actions 不安全！
						// this.actions.clear();
						work_continue = target.length;

						var next;
						while (next = this.actions[0]) {
							next = next[0];
							if (next === 'page' || next === 'edit')
								this.actions.shift();
							else
								break;
						}
						library_namespace.debug('清空 actions queue: 剩下'
								+ this.actions.length + ' actions。', 1,
								'wiki_API.work');
					}

					pages_left++;
					if (config.no_edit) {
						// 不作編輯作業。
						// 取得頁面內容。
						// console.log(page);
						// console.trace(this.running);
						this.page(page, function work_page_callback(page_data,
								error) {
							// TODO: if (error) {...}
							// console.log([ page_data, config.page_options ]);
							var result = each.call(this, page_data, messages,
									config);
							if (messages.quit_operation) {
								clear_work.call(this);
							} else if (library_namespace.is_thenable(result)) {
								promises.push(result);
							}
							if (--pages_left === 0 && pages_rationed) {
								finish_up.call(this, promises);
							}
						}, single_page_options);

					} else {
						// clone() 是為了能個別改變 summary。
						// 例如: each() { options.summary += " -- ..."; }
						var work_options = Object.clone(options);
						// 取得頁面內容。一頁頁處理。
						this.page(page, null, single_page_options)
						// 編輯頁面內容。
						.edit(function(page_data) {
							if ('missing' in page_data) {
								// return [ wiki_API.edit.cancel, 'skip' ];
							}

							// edit/process
							if (!config.no_message) {
								var _messages = [
								//
								'wiki_API.work: edit '
								//
								+ (index + 1) + '/' + pages.length + ' ' ];
								if ('missing' in page_data) {
									_messages.push(
									//
									'fg=yellow', 'missing page');
								} else if ('invalid' in page_data) {
									_messages.push(
									//
									'fg=yellow', 'invalid page title');
								} else {
									_messages.push('', '[[', 'fg=yellow',
									//
									page_data.title, '-fg', ']]');
								}
								library_namespace.sinfo(_messages);
							}
							// 以 each() 的回傳作為要改變成什麼內容。
							var content = each.call(
							// 注意: this === work_options
							// @see wiki_API.edit()
							this, page_data, messages, config);
							if (messages.quit_operation) {
								clear_work.call(this);
							} else if (library_namespace.is_thenable(content)) {
								promises.push(content);
							}
							// console.trace(content);
							return content;
						}, work_options, function work_edit_callback(
						// title, error, result
						) {
							// console.trace(arguments);
							// nomally call do_batch_work_summary()
							callback.apply(this, arguments);
							if (--pages_left === 0 && pages_rationed) {
								finish_up.call(this, promises);
							}
						});
					}
				}, this);
				// 工作配給完畢。
				pages_rationed = true;
				if (pages_left === 0) {
					// 前面已經同步處理完畢了，卻還沒執行 finish_up()。
					finish_up.call(this);
				}

			} else {
				// 都沒有東西的時候依然應該執行收尾。
				finish_up.call(this);
			}

			// 警告：不可省略，只為避免 clear_work()誤刪！
			this.run(function wikiAPI_work__waiting_for_winding_up() {
				library_namespace.debug('工作配給完畢，等待 callback 結束，準備收尾。', 3,
						'wiki_API.work');
			});

			// 不應用 .run(finish_up)，而應在 callback 中呼叫 finish_up()。
			function finish_up(promises) {
				if (promises && promises.length > 0) {
					// e.g., check_deletion_page() @
					// 20191214.maintain_historical_deletion_records.js
					library_namespace.debug(
							'Waiting for all promises settled...', 1,
							'wiki_API.work');
					// console.log(promises);
					Promise.allSettled(promises).then(
							finish_up.bind(this, null),
							finish_up.bind(this, null));
					return;

					var _this = this;
					Promise.allSettled(promises)
					// finish_up.bind(this, null)
					.then(function(result) {
						finish_up.call(_this);
					}, function(error) {
						finish_up.call(_this);
					});
					return;
				}

				if (!config.no_message) {
					library_namespace.debug('收尾。', 1, 'wiki_API.work');
					var count_summary;

					if (config.no_edit) {
						if (pages.length === target.length)
							count_summary = '';
						else
							count_summary = pages.length + '/';
					} else if (pages.length === target.length) {
						if (done === pages.length)
							count_summary = '';
						else
							count_summary = done + '/';
					} else {
						if (done === pages.length)
							count_summary = done + '//';
						else
							count_summary = done + '/' + pages.length + '//';
					}

					if (work_continue && work_continue < target.length) {
						count_summary += ' '
						//
						+ work_continue + '/' + target.length + ' ('
						// 紀錄整體進度
						+ (100 * work_continue / target.length | 0) + '%)';
					} else {
						count_summary += target.length;
					}

					count_summary = ': '
							+ gettext('%1 pages done', count_summary);
					// console.trace(count_summary);

					if (log_item.report) {
						messages.unshift(count_summary + (nochange_count > 0
						//
						? gettext(', %1%2 pages no change',
						//
						done === nochange_count
						// 未改變任何條目。
						? gettext('all ')
						//
						: '', nochange_count) : '')
						// 使用時間, 歷時, 費時, elapsed time
						+ gettext(', %1 elapsed.',
						//
						messages.start.age(new Date)));
					}
					if (this.stopped) {
						messages
								.add(gettext("'''Stopped''', give up editing."));
					}
					if (done === nochange_count && !config.no_edit) {
						messages.add(gettext('Nothing change.'));
					}
					if (log_item.title && config.summary) {
						// unescape
						messages.unshift(
						// 避免 log page 添加 Category。
						// 在編輯摘要中加上使用者連結，似乎還不至於驚擾到使用者。因此還不用特別處理。
						config.summary.replace(/</g, '&lt;').replace(
						// @see PATTERN_category @ CeL.wiki
						/\[\[\s*(Category|分類|分类|カテゴリ|분류)\s*:/ig, '[[:$1:'));
					}
				}

				// run after every batch task. 在處理每個批次後執行此function。
				if (typeof config.after === 'function') {
					// 對於量過大而被分割者，每次分段結束都將執行一次 config.after()。
					// 注意: 與 wiki_API.prototype.work(config)
					// 之 config.before/config.after 連動。
					//
					// 2016/6/22 change API 應用程式介面變更:
					// .last(messages, titles, pages) → .after(messages, pages,
					// titles)
					// 2019/8/7 change API 應用程式介面變更:
					// .after(messages, pages, titles) → .after(messages, pages)
					// 按照需求程度編排 arguments，並改變適合之函數名。
					config.after.call(this, messages, pages);
				}

				var log_to = 'log_to' in config ? config.log_to
				// default log_to
				: this.token.lgname ? 'User:' + this.token.lgname + '/log/'
						+ (new Date).format('%4Y%2m%2d') : null,
				// options for summary.
				options = {
					// new section. append 章節/段落 after all, at bottom.
					section : 'new',
					// 新章節的標題。
					sectiontitle : '['
							+ (new Date).format(config.date_format
									|| this.date_format) + ']' + count_summary,
					// Robot: 若用戶名包含 'bot'，則直接引用之。
					// 注意: this.token.lgname 可能為 undefined！
					summary : (this.token.lgname
							&& PATTERN_BOT_NAME.test(this.token.lgname)
					//
					? this.token.lgname : 'Robot')
							+ ': '
							//
							+ config.summary + count_summary,
					// Throw an error if the page doesn't exist.
					// 若頁面不存在/已刪除，則產生錯誤。
					nocreate : 1,
					// 標記此編輯為機器人編輯。
					bot : 1,
					// 就算設定停止編輯作業，仍強制編輯。一般僅針對測試頁面或自己的頁面，例如寫入 log。
					skip_stopped : true
				};

				if (config.no_message) {
					;
				} else if (log_to && (done !== nochange_count
				// 若全無變更，則預設僅從 console 提示，不寫入 log 頁面。因此無變更者將不顯示。
				|| config.log_nochange)) {
					// console.trace(log_to);
					// CeL.set_debug(6);
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

				// run this at last.
				// 在wiki_API.prototype.work()工作最後執行此config.last()。
				// config.callback()
				// 只有在成功時，才會繼續執行。
				//
				// 2016/6/22 change API 應用程式介面變更:
				// .after() → .last()
				// 改變適合之函數名。
				if (typeof config.last === 'function') {
					this.run(config.last.bind(options));
				}

				if (!config.no_message) {
					this.run(function() {
						library_namespace.log(
						// 已完成作業
						'wiki_API.work: 結束 .work() 作業'
								+ (config.summary ? ' [' + config.summary + ']'
										: '。'));
					});
				}
			}

		}).bind(this);

		var target = pages,
		// 首先取得多個頁面內容所用之 options。
		// e.g., page_options:{rvprop:'ids|content|timestamp'}
		// @see
		// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Brevisions
		page_options = Object.assign({
			allow_missing : config.no_warning,
			is_id : config.is_id,
			multi : true
		},
		// 處理數目限制 limit。單一頁面才能取得多 revisions。多頁面(≤50)只能取得單一 revision。
		config.page_options), slice_size = (config.slice | 0) >= 1 ? Math.min(
				config.slice | 0, 500)
		// https://www.mediawiki.org/w/api.php?action=help&modules=query
		// titles/pageids: Maximum number of values is 50 (500 for bots).
		: PATTERN_BOT_NAME.test(this.token && this.token.lgname) ? 500 : 50,
		/** {ℕ⁰:Natural+0}自此 index 開始繼續作業 */
		work_continue = 0, this_slice_size, setup_target;

		// https://www.mediawiki.org/w/api.php?action=help&modules=query
		[ 'redirects', 'converttitles' ].forEach(function(parameter) {
			if (config[parameter]) {
				library_namespace.debug('Copy [' + parameter
						+ '] to page_options', 2, 'wiki_API.work');
				page_options[parameter] = config[parameter];
			}
		});

		// 個別頁面會採用的 page options 選項。
		var single_page_options = Object.assign({
			// 已經在多個頁面的時候取得過內容，因此不需要再確認一次。只是要過個水設定一下。
			// 若是沒有設定這個選項，那麼對於錯誤的頁面，將會再嘗試取得。
			allow_missing : true
		}, config.page_options);
		// 在個別頁面還採取 .multi 這個選項會造成錯誤。
		delete single_page_options.multi;

		if (!config.no_edit) {
			var check_options = config.check_options;
			if (!check_options && typeof config.log_to === 'string'
			// 若 log_to 以數字作結，自動將其當作 section。
			&& (check_options = config.log_to.match(/\d+$/))) {
				check_options = {
					section : check_options[0]
				};
			}

			if (check_options) {
				// wiki_API.check_stop()
				this.check(check_options);
			}
		}

		// console.log(JSON.stringify(pages));
		// console.log(pages===target);
		// console.log(JSON.stringify(target));
		if (Array.isArray(target)) {
			// Split when length is too long. 分割過長的 list。
			setup_target = (function() {
				var this_slice = target.slice(work_continue, work_continue
						+ slice_size),
				// 自動判別最大可用 index，預防 "414 Request-URI Too Long"。
				// 因為 8000/500-3 = 13 > 最長 page id，因此即使 500頁也不會超過。
				// 為提高效率，不作 check。
				max_size = config.is_id ? 500 : check_max_length(this_slice,
						500);

				if (false) {
					console.log([ 'max_size:', max_size, this_slice.length,
							target.length, config.is_id, work_continue ]);
				}
				if (max_size < slice_size) {
					this_slice = this_slice.slice(0, max_size);
				}
				if (work_continue === 0 && max_size === target.length) {
					library_namespace.debug('設定一次先取得所有 ' + target.length
							+ ' 個頁面之 revisions (page contents 頁面內容)。', 2,
							'wiki_API.work');
				} else {
					nochange_count = target.length;
					// "Process %1"
					done = '處理分塊 ' + (work_continue + 1) + '–' + (work_continue
					// start–end/all
					+ Math.min(max_size, nochange_count)) + '/'
							+ nochange_count;
					// Add percentage message.
					if (nochange_count > 1e4
					// 數量太大或執行時間過長時，就顯示剩餘時間訊息。
					|| Date.now() - config.start_working_time > 2 * 60 * 1000) {
						done += estimated_message(work_continue,
								nochange_count, config.start_working_time);
					}
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

				this_slice_size = this_slice.length;
				work_continue += this_slice_size;
				// console.log([ 'page_options:', page_options ]);
				this.page(this_slice, main_work, page_options);
			}).bind(this);

			config.start_working_time = Date.now();
			setup_target();

		} else {
			// assert: target is {String}title or {Object}page_data
			library_namespace.debug('取得單一頁面之 (page contents 頁面內容)。', 2,
					'wiki_API.work');
			this_slice_size = target.length;
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

	// ------------------------------------------------------------------------

	// 未登錄/anonymous時的token
	var BLANK_TOKEN = '+\\';

	// get token
	// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Btokens
	wiki_API.prototype.get_token = function(callback, options) {
		// assert: this (session) 已登入成功， callback 已設定好。
		if (typeof options === 'string') {
			options = {
				type : options
			};
		} else {
			options = library_namespace.setup_options(options);
		}
		var type = options.type
		// default_type: csrf (cross-site request forgery) token
		|| 'csrf';
		// TODO: for {Array}type
		var session = this, token = session.token;
		if (!options.force && token[type + 'token']) {
			// 已存有此 token。
			callback(token[type + 'token']);
			return this;
		}

		library_namespace.debug('Try to get the ' + type + 'token ...', 1,
				'wiki_API.prototype.get_token');
		// console.log(this);
		wiki_API.query([ session.API_URL,
		// https://www.mediawiki.org/wiki/API:Tokens
		// 'query&meta=tokens&type=csrf|login|watch'
		'query&meta=tokens' + (type ? '&type=' + type : '') ],
		//
		function(data) {
			if (data && data.query && data.query.tokens) {
				// 設定 tokens。
				Object.assign(session.token, data.query.tokens);
				if (!session.token[type + 'token'])
					session.token[type + 'token'] = BLANK_TOKEN;
				library_namespace.debug(
				//
				type + 'token: ' + session.token[type + 'token']
				//
				+ (session.token[type + 'token'] === BLANK_TOKEN
				//
				? ' (login as anonymous!)' : ''),
				//
				1, 'wiki_API.prototype.token');
				// console.log(this);
				callback(session.token[type + 'token'] || session.token);
				return;
			}

			library_namespace.error(
			//
			'wiki_API.prototype.token: Unknown response: ['
			//
			+ (data && data.warnings && data.warnings.tokens
			//
			&& data.warnings.tokens['*'] || data) + ']');
			if (library_namespace.is_debug()
			// .show_value() @ interact.DOM, application.debug
			&& library_namespace.show_value)
				library_namespace.show_value(data);
			callback();
		},
		// Tokens may not be obtained when using a callback
		Object.create(null), session);
		return this;
	};

	// 登入認證用。
	// https://www.mediawiki.org/wiki/API:Login
	// https://www.mediawiki.org/wiki/API:Edit
	// 認證用 cookie:
	// {zhwikiSession,centralauth_User,centralauth_Token,centralauth_Session,wikidatawikiSession,wikidatawikiUserID,wikidatawikiUserName}
	//
	// TODO: https://www.mediawiki.org/w/api.php?action=help&modules=clientlogin
	wiki_API.login = function(name, password, options) {
		var error;
		function _next() {
			callback && callback(session.token.lgname, error);
			library_namespace.debug('已登入 [' + session.token.lgname
					+ ']。自動執行 .next()，處理餘下的工作。', 1, 'wiki_API.login');
			// popup 'login'.
			session.actions.shift();
			session.next();
		}

		function _done(data, _error) {
			// 注意: 在 mass edit 時會 lose token (badtoken)，需要保存 password。
			if (!session.preserve_password) {
				// 捨棄 password。
				delete session.token.lgpassword;
			}

			// console.log(JSON.stringify(data));
			if (data && data.warnings) {
				// console.log(JSON.stringify(data.warnings));
			}

			if (_error) {
				error = _error;
			} else if (data && (data = data.login)) {
				if (data.result === 'Success') {
					wiki_API.login.copy_keys.forEach(function(key) {
						if (data[key]) {
							session.token[key] = data[key];
						}
					});

					delete session.login_failed_count;
					// 紀錄最後一次成功登入。
					// session.last_login = new Date;
				} else {
					// login error
					if (!(session.login_failed_count > 0)) {
						session.login_failed_count = 1;
					} else if (++session.login_failed_count > wiki_API.login.MAX_ERROR_RETRY) {
						// 連續登入失敗太多次就跳出程序。
						throw 'wiki_API.login: Login failed '
								+ session.login_failed_count + ' times! Exit!';
					}
					// delete session.last_login;

					/**
					 * 當沒有登入成功時的處理以及警訊。
					 * 
					 * e.g., data = <code>
					{"login":{"result":"Failed","reason":"Incorrect password entered.\nPlease try again."}}

					{"login":{"result":"Failed","reason":"You have made too many recent login attempts. Please wait 5 minutes before trying again."}}

					{"warnings":{"main":{"*":"Subscribe to the mediawiki-api-announce mailing list at <https://lists.wikimedia.org/mailman/listinfo/mediawiki-api-announce> for notice of API deprecations and breaking changes."},"login":{"*":"Main-account login via \"action=login\" is deprecated and may stop working without warning. To continue login with \"action=login\", see [[Special:BotPasswords]]. To safely continue using main-account login, see \"action=clientlogin\"."}},"login":{"result":"Success","lguserid":263674,"lgusername":"Cewbot"}}
					 * </code>
					 */
					library_namespace.error('wiki_API.login: login ['
							+ session.token.lgname + '] failed '
							+ session.login_failed_count + '/'
							+ wiki_API.login.MAX_ERROR_RETRY + ': ['
							+ data.result + '] ' + data.reason + ' ('
							+ session.API_URL + ')');
					if (data.result !== 'Failed' || data.result !== 'NeedToken') {
						// Unknown result
					}
					error = data;
				}
			}
			session.get_token(_next);
		}

		// 支援斷言編輯功能。
		var action = 'assert=user', callback, session, API_URL;
		if (library_namespace.is_Object(options)) {
			API_URL = options.API_URL;
			session = options[KEY_SESSION];
			callback = options.callback;
		} else {
			if (typeof options === 'function') {
				callback = options;
			} else if (typeof options === 'string') {
				// treat options as API_URL
				API_URL = options;
			}
			// 前置處理。
			options = Object.create(null);
		}
		callback = typeof callback === 'function' && callback;

		if (!session) {
			// 初始化 session 與 agent。這裡 callback 當作 API_URL。
			session = new wiki_API(name, password, options);
		}
		if (!name || !password) {
			library_namespace
					.warn('wiki_API.login: The user name or password is not provided. Abandon login attempt.');
			// console.trace('Stop login');
			callback && callback();
			return session;
		}

		// copy configurations
		if (options.preserve_password) {
			session.preserve_password = options.preserve_password;
		}

		if (!('login_mark' in options) || options.login_mark) {
			// hack: 這表示正 log in 中，當 login 後，會自動執行 .next()，處理餘下的工作。
			// @see wiki_API.prototype.next
			if (options.login_mark) {
				// 將 'login' 置於工作佇列最前頭。
				session.actions.unshift([ 'login' ]);
			} else {
				// default: 依順序將 'login' 置於最末端。
				session.actions.push([ 'login' ]);
			}
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

			delete session.token.csrftoken;
			// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Btokens
			// wiki_API.query(action, callback, post_data, options)
			wiki_API.query([ session.API_URL,
			// Fetching a token via "action=login" is deprecated.
			// Use "action=query&meta=tokens&type=login" instead.
			'query&meta=tokens&type=login' ], function(data, _error) {
				// console.log([ data, error ]);
				if (_error || !data.query || !data.query.tokens
						|| !data.query.tokens.logintoken) {
					library_namespace.error(
					//		
					'wiki_API.login: 無法 login！ Abort! Response:');
					error = _error;
					library_namespace.error(error || data);
					callback && callback(null, error || data);
					return;
				}

				Object.assign(session.token, data.query.tokens);
				// console.log(data.query.tokens);
				// https://www.mediawiki.org/w/api.php?action=help&modules=login
				var token = Object.create(null);
				for ( var parameter in wiki_API.login.parameters) {
					var key = wiki_API.login.parameters[parameter];
					if (key in session.token)
						token[parameter] = session.token[key];
				}
				// console.log(token);
				wiki_API.query([ session.API_URL, 'login' ], _done, token,
						session);
			}, null, session);

			return;

			// deprecated:

			// https://www.mediawiki.org/w/api.php?action=help&modules=login
			var token = Object.assign(Object.create(null), session.token);
			// console.log(token);
			// .csrftoken 是本函式為 cache 加上的，非正規 parameter。
			delete token.csrftoken;
			wiki_API.query([ session.API_URL,
			// 'query&meta=tokens&type=login|csrf'
			'login' ], function(data, error) {
				if (data && data.login && data.login.result === 'NeedToken') {
					token.lgtoken = session.token.lgtoken = data.login.token;
					wiki_API.query([ session.API_URL, 'login' ], _done, token,
							session);
				} else {
					library_namespace.error(
					//		
					'wiki_API.login: 無法 login！ Abort! Response:');
					library_namespace.error(data);
					callback && callback(null, data);
				}
			}, token, session);

		}, null, session);

		return session;
	};

	/** {Natural}登入失敗時最多重新嘗試下載的次數。 */
	wiki_API.login.MAX_ERROR_RETRY = 8;

	wiki_API.login.parameters = {
		lgname : 'lgname',
		lgpassword : 'lgpassword',
		lgtoken : 'logintoken',
		lgdomain : 'lgdomain'
	};

	/** {Array}欲 copy 至 session.token 之 keys。 */
	wiki_API.login.copy_keys = 'lguserid,lgtoken,cookieprefix,sessionid'
			.split(',');

	// ------------------------------------------------------------------------

	wiki_API.logout = function(session, callback) {
		var API_URL = typeof session === 'string' ? session
				: API_URL_of_options(session);
		wiki_API.query([ API_URL, 'logout' ], function(data) {
			// data: {}
			// console.log(data);
			delete session.token;
			if (typeof callback === 'function') {
				callback.call(session, data);
			}
		});
	};

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
		if ('session' in options) {
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

	// TODO
	// @see [[Special:Interwiki]] 跨維基資料 跨 wiki 字首
	function adapt_site_configurations(session, configurations) {
		// console.log(configurations);
		var site_configurations = session.configurations;
		session.latest_site_configurations = configurations;
		if (site_configurations === default_site_configurations) {
			session.configurations = site_configurations
			//
			= Object.assign(Object.create(null),
			//
			default_site_configurations);
		}

		var general = configurations.general;
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

		var interwikimap = configurations.interwikimap;
		if (interwikimap) {
			// prefix_pattern
			site_configurations.interwiki_pattern = new RegExp('^('
					+ interwikimap.map(function(interwiki) {
						return interwiki.prefix;
					}).join('|') + ')(?::(.+))?$', 'i');
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

	// 從網頁取得/讀入自動作業用的人為設定 manual settings。
	// 本設定頁面將影響作業功能，應受適當保護。且應謹慎編輯，以防機器人無法讀取。移動本頁面必須留下重定向。
	// TODO: 檢查設定。
	function adapt_task_configurations(task_configuration_page,
			configuration_adapter, options) {
		options = library_namespace.setup_options(options);
		var session = this, task_configuration = session.task_configuration
				|| (session.task_configuration = Object.create(null));
		if (typeof configuration_adapter === 'function') {
			if (!options.once)
				session.task_configuration.adapter = configuration_adapter;
		} else {
			configuration_adapter = session.task_configuration.adapter;
		}

		if (!task_configuration_page
				&& !(task_configuration_page = task_configuration.page)) {
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

		function adapt_configuration(page_data) {
			if (!options.once) {
				// cache
				Object.assign(task_configuration, {
					// {String}設定頁面。已經轉換過、正規化後的最終頁面標題。
					page : page_data.title,
					last_update : Date.now()
				});
			}
			// latest raw task raw configuration
			session.latest_task_configuration
			// TODO: valid configuration 檢測數值是否合適。
			= wiki_API.parse_configuration(page_data);
			library_namespace
					.info('adapt_task_configurations: Get configurations from '
							+ wiki_API.title_link_of(page_data));
			// console.log(session.latest_task_configuration);
			configuration_adapter
			// 每次更改過設定之後，重新執行一次。
			&& configuration_adapter(session.latest_task_configuration);
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
		// cmn : 'zh',
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
		wiki_API.language = language.toLowerCase();
		// default api URL. Use <code>CeL.wiki.API_URL = api_URL('en')</code> to
		// change it.
		// see also: application.locale
		wiki_API.API_URL = library_namespace.is_WWW()
				&& (navigator.userLanguage || navigator.language)
				|| wiki_API.language;
		if (!(wiki_API.API_URL in valid_language)) {
			// 'en-US' → 'en'
			wiki_API.API_URL = wiki_API.API_URL.toLowerCase().replace(/-.+$/,
					'');
		}
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
	// SQL 相關函數 @ Toolforge。

	function setup_wmflabs() {
		/** {String}Wikimedia Toolforge name. CeL.wiki.wmflabs */
		var wmflabs;

		// only for node.js.
		// https://wikitech.wikimedia.org/wiki/Help:Toolforge/FAQ#How_can_I_detect_if_I.27m_running_in_Cloud_VPS.3F_And_which_project_.28tools_or_toolsbeta.29.3F
		if (library_namespace.platform.nodejs) {
			/** {String}Wikimedia Toolforge name. CeL.wiki.wmflabs */
			wmflabs = require('fs').existsSync('/etc/wmflabs-project')
			// e.g., 'tools-bastion-05'.
			// if use `process.env.INSTANCEPROJECT`,
			// you may get 'tools' or 'tools-login'.
			&& (library_namespace.env.INSTANCENAME
			// 以 /usr/bin/jsub 執行時可得。
			// e.g., 'tools-exec-1210.eqiad.wmflabs'
			|| library_namespace.env.HOSTNAME || true);
		}

		if (wmflabs) {
			// CeL.wiki.wmflabs
			wiki_API.wmflabs = wmflabs;

			var module_name = this.id;
			this.finish = function(name_space, waiting) {
				// import CeL.application.net.wiki.Toolforge
				library_namespace.run(module_name + '.Toolforge', waiting);
				return waiting;
			};
		}
	}

	setup_wmflabs.call(this);

	// --------------------------------------------------------------------------------------------

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
		library_namespace.warn(this.id
				+ ': 無 node.js 之 fs，因此不具備 cache 或 SQL 功能。');
		node_fs = {
			// library_namespace.storage.read_file()
			readFile : function(file_path, options, callback) {
				library_namespace.error('Can not read file ' + file_path);
				if (typeof callback === 'function')
					callback(true);
			},
			// library_namespace.storage.write_file()
			writeFile : function(file_path, data, options, callback) {
				library_namespace.error('Can not write to file ' + file_path);
				if (typeof options === 'function' && !callback)
					callback = options;
				if (typeof callback === 'function')
					callback(true);
			}
		};
	}

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
		// examples

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
			// namespace : '0|1',
			// [KEY_SESSION]
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
			// namespace : '0|1',
			// [KEY_SESSION]
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
			// namespace : '0|1',
			// [KEY_SESSION]
			session : wiki,
			// title_prefix : 'Template:',
			// cache path prefix
			prefix : './'
		});
	}

	/**
	 * cache 作業操作之輔助套裝函數。
	 * 
	 * 注意: only for node.js. 必須自行 include 'application.platform.nodejs'。 <code>
	   CeL.run('application.platform.nodejs');
	 * </code><br />
	 * 注意: 需要自行先創建各 type 之次目錄，如 page, redirects, embeddedin, ...<br />
	 * 注意: 會改變 operation, _this！ Warning: will modify operation, _this!
	 * 
	 * 連續作業: 依照 _this 設定 {Object}default options，即傳遞於各 operator 間的 ((this))。<br />
	 * 依照 operation 順序個別執行單一項作業。
	 * 
	 * 單一項作業流程:<br />
	 * 設定檔名。<br />
	 * 若不存在此檔，則:<br />
	 * >>> 依照 operation.type 與 operation.list 取得資料。<br />
	 * >>> 若 Array.isArray(operation.list) 則處理多項列表作業:<br />
	 * >>>>>> 個別處理單一項作業，每次執行 operation.each() || operation.each_retrieve()。<br />
	 * >>> 執行 data = operation.retrieve(data)，以其回傳作為將要 cache 之 data。<br />
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
			// 未設定/不設定 callback
			// shift arguments.
			_this = callback;
			callback = undefined;
		}

		var index = 0;
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
				// console.log(this_operation);
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
						library_namespace.debug('設定 .last_data_got: '
								+ (data && JSON.stringify(data).slice(0, 180))
								+ '...', 3, 'wiki_API.cache.next_operator');
						this_operation.last_data_got = data;
					}
					// default options === _this: 傳遞於各 operator 間的 ((this))。
					wiki_API.cache(this_operation, next_operator, _this);
				}

			} else if (typeof callback === 'function') {
				if (false && Array.isArray(data)) {
					// TODO: adapt to {Object}operation
					library_namespace.log('wiki_API.cache: Get ' + data.length
							+ ' page(s).');
					// 自訂list
					// data = [ '' ];
					if (_this.limit >= 0) {
						// 設定此初始值，可跳過之前已經處理過的。
						data = data.slice(0 * _this.limit, 1 * _this.limit);
					}
					library_namespace.debug(data.slice(0, 8).map(
							wiki_API.title_of).join('\n')
							+ '\n...');
				}

				// last 收尾
				callback.call(_this, data);
			}
		}

		if (Array.isArray(operation)) {
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
			_this = Object.create(null);
		}

		var file_name = operation.file_name,
		/** 前一次之回傳 data。每次產出的 data。 */
		last_data_got = operation.last_data_got;

		if (typeof file_name === 'function') {
			// @see wiki_API.cache.title_only
			file_name = file_name.call(_this, last_data_got, operation);
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
			if (typeof list === 'function') {
				// TODO: 允許非同步方法。
				list = list.call(_this, last_data_got, operation);
			}

			if (!operation.postfix) {
				if (type === 'file')
					operation.postfix = '.txt';
				else if (type === 'URL')
					operation.postfix = '.htm';
			}

			// 自行設定之檔名 operation.file_name 優先度較 type/title 高。
			// 需要自行創建目錄！
			file_name = _this[type + '_prefix'] || type;
			file_name = [ file_name
			// treat file_name as directory
			? /[\\\/]/.test(file_name) ? file_name : file_name + '/' : '',
			//
			wiki_API.is_page_data(list) ? list.title
			// 若 Array.isArray(list)，則 ((file_name = ''))。
			: typeof list === 'string' && wiki_API.normalize_title(list, true) ];
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
					&& /\.[a-z\d\-]+$/i.test(file_name)) {
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
		using_JSON = 'json' in operation ? operation.json : /\.json$/i
				.test(file_name),
		/** {String}file encoding for fs of node.js. */
		encoding = _this.encoding || wiki_API.encoding;
		// list file path
		_this.file_name = file_name;

		// console.log('Read file: ' + file_name);
		node_fs.readFile(file_name, encoding, function(error, data) {
			/**
			 * 結束作業。
			 */
			function finish_work(data) {
				library_namespace.debug('finish work', 3,
						'wiki_API.cache.finish_work');
				last_data_got = data;
				if (operator)
					operator.call(_this, data, operation);
				library_namespace.debug('loading callback', 3,
						'wiki_API.cache.finish_work');
				if (typeof callback === 'function')
					callback.call(_this, data);
			}

			if (!operation.reget && !error && (data ||
			// 當資料 Invalid，例如採用 JSON 卻獲得空資料時；則視為 error，不接受此資料。
			('accept_empty_data' in _this
			//
			? _this.accept_empty_data : !using_JSON))) {
				library_namespace.debug('Using cached data.', 3,
						'wiki_API.cache');
				library_namespace.debug('Cached data: ['
						+ (data && data.slice(0, 200)) + ']...', 5,
						'wiki_API.cache');
				if (using_JSON && data) {
					try {
						data = JSON.parse(data);
					} catch (e) {
						library_namespace.error(
						// error. e.g., "undefined"
						'wiki_API.cache: Can not parse as JSON: ' + data);
						// 注意: 若中途 abort，此時可能需要手動刪除大小為 0 的 cache file！
						data = undefined;
					}
				}
				finish_work(data);
				return;
			}

			library_namespace.debug(
					operation.reget ? 'Dispose cache. Reget again.'
					// ↑ operation.reget: 放棄 cache，重新取得資料。
					: 'No valid cached data. Try to get data...', 3,
					'wiki_API.cache');

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
									+ file_name + '].'
									+ (using_JSON ? ' (using JSON)' : ''));
					library_namespace.debug('Cache data: '
							+ (data && JSON.stringify(data).slice(0, 190))
							+ '...', 3, 'wiki_API.cache.write_cache');
					var write = function() {
						// 為了預防需要建立目錄，影響到後面的作業，
						// 因此採用 fs.writeFileSync() 而非 fs.writeFile()。
						node_fs.writeFileSync(file_name, using_JSON ? JSON
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
								library_namespace.error(
								//
								'wiki_API.cache: Error to write cache data!');
								library_namespace.error(e);
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
				library_namespace.debug('處理多項列表作業: ' + (index + 1) + '/'
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
				library_namespace.debug('Call .list()', 3, 'wiki_API.cache');
				list = list.call(_this, last_data_got, operation);
				// 對於 .list() 為 asynchronous 函數的處理。
				if (list === wiki_API.cache.abort) {
					library_namespace.debug('It seems the .list()'
							+ ' is an asynchronous function.' + ' I will exit'
							+ ' and wait for the .list() finished.', 3,
							'wiki_API.cache');
					return;
				}
			}
			if (list === wiki_API.cache.abort) {
				library_namespace
						.debug('Abort operation.', 1, 'wiki_API.cache');
				finish_work();
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
					'wiki_API.cache: 警告: list 過長/超過限度 (length ' + list.length
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
			if (// type in get_list.type
			wiki_API.list.type_list.includes(type)) {
				list_type = type;
				type = 'list';
			}

			switch (type) {
			case 'callback':
				if (typeof list !== 'function') {
					library_namespace
							.warn('wiki_API.cache: list is not function!');
					callback.call(_this, last_data_got);
					break;
				}
				// 手動取得資料。使用 list=function(callback){callback(list);}
				to_get_data = function(list, callback) {
					library_namespace.log('wiki_API.cache: '
							+ 'manually get data and then callback(list).');
					if (typeof list === 'function') {
						// assert: (typeof list === 'function') 必須自己回 call！
						list.call(_this, callback, last_data_got, operation);
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
							library_namespace.error(
							//
							'wiki_API.cache: Error get file [' + file_path
									+ ']: ' + error);
						callback.call(_this, data);
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
					if (_this[KEY_SESSION]) {
						if (!_this[KEY_SESSION].data_session) {
							_this[KEY_SESSION].set_data();
							_this[KEY_SESSION].run(function() {
								// retry again
								to_get_data(query, callback);
							});
							return;
						}
						operation[KEY_SESSION]
						//
						= _this[KEY_SESSION].data_session;
					}

					library_namespace.log('wiki_API.cache: Wikidata Query ['
							+ query + '].');
					// wikidata_query(query, callback, options)
					wiki_API.wdq(query, callback, operation);
				};
				break;

			case 'page':
				// get page contents 頁面內容。
				// title=(operation.title_prefix||_this.title_prefix)+operation.list
				to_get_data = function(title, callback) {
					library_namespace.log('wiki_API.cache: Get content of '
							+ wiki_API.title_link_of(title));
					wiki_API.page(title, function(page_data) {
						callback(page_data);
					}, library_namespace.new_options(_this, operation));
				};
				break;

			case 'redirects_here':
				// 取得所有重定向到(title重定向標的)之頁面列表，(title重定向標的)將會排在[0]。
				// 注意: 無法避免雙重重定向問題!
				to_get_data = function(title, callback) {
					// wiki_API.redirects_here(title, callback, options)
					wiki_API.redirects_here(title, function(root_page_data,
							redirect_list) {
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
					var options = Object.assign({
						type : list_type
					}, _this, operation);
					wiki_API.list(title, function(pages) {
						if (!options.for_each || options.get_list) {
							library_namespace.log(list_type
									// allpages 不具有 title。
									+ (title ? ' '
											+ wiki_API.title_link_of(title)
											: '') + ': ' + pages.length
									+ ' page(s).');
						}
						pages.query_title = title;
						// page list, title page_data
						callback(pages);
					}, options);
				};
				break;

			default:
				if (typeof type === 'function')
					to_get_data = type.bind(Object.assign(Object.create(null),
							_this, operation));
				else if (type)
					throw new Error('wiki_API.cache: Bad type: ' + type);
				else {
					library_namespace.debug('直接採用 list 作為 data。', 1,
							'wiki_API.cache');
					write_cache(list);
					return;
				}
			}

			// 回復 recover type
			// if (list_type) type = list_type;

			var title = list;

			if (typeof title === 'string') {
				// 可以用 operation.title_prefix 覆蓋 _this.title_prefix
				if ('title_prefix' in operation) {
					if (operation.title_prefix)
						title = operation.title_prefix + title;
				} else if (_this.title_prefix)
					title = _this.title_prefix + title;
			}
			library_namespace.debug('處理單一項作業: ' + wiki_API.title_link_of(title)
					+ '。', 3, 'wiki_API.cache');
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
	wiki_API.cache.abort = typeof Symbol === 'function' ? Symbol('ABORT_CACHE')
	//
	: {
		cache : 'abort'
	};
	/**
	 * 只取檔名，僅用在 operation.each_file_name。<br />
	 * <code>{
	 * each_file_name : CeL.wiki.cache.title_only,
	 * }</code>
	 * 
	 * @type {Function}
	 */
	wiki_API.cache.title_only = function(last_data_got, operation) {
		var list = operation.list;
		if (typeof list === 'function') {
			operation.list = list = list.call(this, last_data_got, operation);
		}
		return operation.type + '/' + remove_page_title_namespace(list);
	};

	// --------------------------------------------------------------------------------------------

	/**
	 * 自 options[KEY_SESSION] 取得 wikidata API 所須之 site parameter。
	 * 
	 * @param {Object}options
	 *            附加參數/設定選擇性/特殊功能與選項
	 * @param {Boolean}get_language
	 *            get language instead of site
	 * 
	 * @return {String}wikidata API 所須之 site parameter。
	 * 
	 * @inner 現階段屬於內部成員。未來可能會改變。
	 */
	function wikidata_get_site(options, get_language) {
		if (typeof options === 'string') {
			return PATTERN_PROJECT_CODE.test(options) && options;
		}
		var session = session_of_options(options),
		// options.language 較 session 的設定優先。
		language = options && options.language;
		if (session) {
			if (!language) {
				// 注意:在取得 page 後，中途更改過 API_URL 的話，這邊會取得錯誤的資訊！
				language = session.language
				// 應該採用來自宿主 host session 的 language. @see setup_data_session()
				|| session[KEY_HOST_SESSION]
						&& session[KEY_HOST_SESSION].language;
			}
			// console.log(session[KEY_HOST_SESSION]);
			if (!language) {
				var API_URL = session[KEY_HOST_SESSION]
						&& session[KEY_HOST_SESSION].API_URL || session.API_URL;
				if (language = API_URL.match(PATTERN_wiki_project_URL)) {
					// 去掉 '.org' 之類。
					language = language[3];
				}
			}
		}
		if (false) {
			library_namespace.debug('language: ' + options + '→'
					+ wiki_API.site_name(language || options), 3,
					'wikidata_get_site');
		}
		return get_language ? language
		// language_to_site_name()
		: wiki_API.site_name(language || options);
	}

	// --------------------------------------------------------------------------------------------

	var user_language;
	if (typeof mediaWiki === "object" && typeof mw === "object"
			&& mediaWiki === mw) {
		// mw.config
		user_language = mediaWiki.config.get('wgPreferredVariant')
		// || mediaWiki.config.get('wgUserVariant')
		// || mediaWiki.config.get('wgUserLanguage')
		// || mediaWiki.config.get('wgPageContentLanguage')
		;
	}

	// --------------------------------------------------------------------------------------------

	function add_session_to_options(session, options) {
		options = library_namespace.setup_options(options);
		options[KEY_SESSION] = session;
		return options;
	}

	// export 導出.

	// @instance 實例相關函數。
	Object.assign(wiki_API.prototype, {
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

	// @inner
	library_namespace.set_method(wiki_API, {
		KEY_SESSION : KEY_SESSION,
		KEY_HOST_SESSION : KEY_HOST_SESSION,
		KEY_CORRESPOND_PAGE : KEY_CORRESPOND_PAGE,
		KEY_get_entity_value : KEY_get_entity_value,

		BLANK_TOKEN : BLANK_TOKEN,

		session_of_options : session_of_options,
		setup_API_URL : setup_API_URL,
		API_URL_of_options : API_URL_of_options,
		is_api_and_title : is_api_and_title,
		normalize_title_parameter : normalize_title_parameter,
		add_parameters : add_parameters,
		wikidata_get_site : wikidata_get_site,
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

		estimated_message : estimated_message,

		LTR_SCRIPTS : LTR_SCRIPTS,
		PATTERN_LTR : PATTERN_LTR,
		PATTERN_BOT_NAME : PATTERN_BOT_NAME,
		PATTERN_category : PATTERN_category,

		upper_case_initial : upper_case_initial,

		namespace : get_namespace,
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

		escape_text : escape_text,

		/** constant 中途跳出作業用。 */
		quit_operation : {
			// 單純表達意思用的內容結構，可以其他的值代替。
			quit : true
		},

		is_wiki_API : is_wiki_API,
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

	return wiki_API;
}
