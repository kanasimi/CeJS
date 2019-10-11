/**
 * @name CeL function for MediaWiki (Wikipedia / 維基百科)
 * 
 * @fileoverview 本檔案包含了 MediaWiki 自動化作業用的程式庫，主要用於編寫[[維基百科:機器人]]
 *               ([[WP:{{{name|{{int:Group-bot}}}}}|{{{name|{{int:Group-bot}}}}}]])。
 * 
 * 完整版的依賴鍊可參照 https://github.com/kanasimi/wikiapi/blob/master/wikiapi.js
 * https://github.com/kanasimi/wikibot/blob/master/wiki%20loader.js
 * https://github.com/kanasimi/CeJS/blob/master/_test%20suite/test.js
 * 
 * TODO:<code>

wiki_API.work() 遇到 Invalid token 之類問題，中途跳出 abort 時，無法紀錄。應將紀錄顯示於 console 或 local file。
wiki_API.page() 整合各 action=query 至單一公用 function。
[[mw:Manual:Pywikibot/zh]]

const util = require('util'); new util.promisify(CeL.wiki)(...)

parser 標籤中的空屬性現根據HTML5規格進行解析。<pages from= to= section=1>將解析為<pages from="to=" section="1">而不是像以前那樣的<pages from="" to="" section="1">。請改用<pages from="" to="" section=1> or <pages section=1>。這很可能影響維基文庫項目上的頁面。
parser 所有子頁面加入白名單 white-list
parser 所有node當前之level層級
parser 提供 .previousSibling, .nextSibling, .parentNode 將文件結構串起來。
parser [[WP:維基化]]
https://en.wikipedia.org/wiki/Wikipedia:WikiProject_Check_Wikipedia
https://en.wikipedia.org/wiki/Wikipedia:AutoWikiBrowser/General_fixes
https://www.mediawiki.org/wiki/API:Edit_-_Set_user_preferences

[[mw:Help:OAuth]]
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

WikiData Remote editor
http://tools.wmflabs.org/widar/


get user infomation:
https://www.mediawiki.org/w/api.php?action=help&modules=query%2Busers
https://zh.wikipedia.org/w/api.php?action=query&format=json&list=users&usprop=blockinfo|groups|implicitgroups|rights|editcount|registration|emailable|gender|centralids|cancreate&usattachedwiki=zhwiki&ususers=username|username
https://www.mediawiki.org/w/api.php?action=help&modules=query%2Busercontribs
https://zh.wikipedia.org/w/api.php?action=query&format=json&list=usercontribs&uclimit=1&ucdir=newer&ucprop=ids|title|timestamp|comment|parsedcomment|size|sizediff|flags|tags&ucuser=username



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

	// .includes() @ CeL.data.code.compatibility
	// .between() @ CeL.data.native
	// .append() @ CeL.data.native
	require : 'data.code.compatibility.|data.native.'
	// (new Date).format('%4Y%2m%2d'), (new Date).format() @ CeL.data.date
	// optional 選用: .show_value() @ CeL.interact.DOM, CeL.application.debug
	// optional 選用: CeL.wiki.cache(): CeL.application.platform.nodejs.fs_mkdir()
	// optional 選用: CeL.wiki.traversal(): CeL.application.platform.nodejs
	// optional 選用: wiki_API.work(): gettext():
	// CeL.application.locale.gettext()
	+ '|application.net.Ajax.get_URL'
	// CeL.date.String_to_Date(), Julian_day(): CeL.data.date
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

	// 維基姊妹項目
	// TODO: 各種 type 間的轉換: 先要能擷取出 language code + family
	// @see language_to_site_name()
	//
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
	// language (or family/project): default: default_language
	// e.g., 'en', 'zh-classical', 'ja', ...
	//
	// project = language_code.family
	//
	// [[meta:List of Wikimedia projects by size]]
	// family: 'wikipedia' (default), 'news', 'source', 'books', 'quote', ...
	function get_project(language, family, type) {
		;
	}

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
		// console.trace([ user_name, password, API_URL ]);
		library_namespace.debug('API_URL: ' + API_URL + ', default_language: '
				+ default_language, 3, 'wiki_API');
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
			setup_API_language(this /* session */, default_language);
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
		if (!options) {
			return;
		}
		return options.API_URL
		// 此時嘗試從 options[KEY_SESSION] 取得 API_URL。
		|| options[KEY_SESSION] && options[KEY_SESSION].API_URL;
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
			// 若是未設定 action[0]，則將在wiki_API.query()補設定。
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
		var action = is_api_and_title(title, true)
		// 不改變原 title。
		? title.clone() : [ , title ];
		if (!is_api_and_title(action, false, options)) {
			library_namespace.warn(
			//
			'normalize_title_parameter: Invalid title! '
					+ get_page_title_link(title));
			return;
		}

		// 處理 [ {String}API_URL, title ]
		action[1] = wiki_API.query.title_param(action[1], true, options
				&& options.is_id);

		if (options && options.redirects) {
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
		library_namespace.debug('API_URL: ' + API_URL + ', default_language: '
				+ default_language, 3, 'setup_API_URL');
		// console.log(session);
		// console.trace(default_language);
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
		&& !get_namespace.pattern.test(language_code)) {
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
	 * 
	 * @returns {Integer|String|Undefined}namespace NO.
	 */
	function get_namespace(namespace, options) {
		options = library_namespace.setup_options(options);
		if (!options.is_page_title && (namespace == Math.floor(namespace))) {
			// {Integer}namespace
			return namespace;
		}
		var namespace_hash = options.namespace_hash || get_namespace.hash;

		if (typeof namespace === 'string') {
			var list = [];
			namespace.replace(/[_\s]+/g, '_').toLowerCase()
			// for ',Template,Category', ';Template;Category',
			// 'main|module|template|category'
			// https://www.mediawiki.org/w/api.php?action=help&modules=main#main.2Fdatatypes
			.split(/(?:[,;|\u001F]|%7C|%1F)/).forEach(function(n) {
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
				if (!options.is_page_title && !isNaN(_n)) {
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
				library_namespace.warn('get_namespace: Invalid namespace: ['
				//
				+ n + '] @ namespace list ' + namespace);
			});
			if (list.length === 0) {
				return;
			}
			// list.sort().unique_sorted().join('|');
			list = list.unique();
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
		// 條目 entry 文章 article: ns = 0, 頁面 page: ns = any. 章節/段落 section
		'' : 0,
		main : 0,
		// 討論對話頁面
		talk : 1,

		// 使用者頁面
		user : 2,
		user_talk : 3,
		// the project namespace for matters about the project
		// Varies between wikis
		project : 4,
		wikipedia : 4,
		// https://en.wikinews.org/wiki/Help:Namespace
		wikinews : 4,
		// Varies between wikis
		project_talk : 5,
		wikipedia_talk : 5,
		// image
		file : 6,
		file_talk : 7,
		// [[MediaWiki:title]]
		mediawiki : 8,
		mediawiki_talk : 9,
		// 模板
		template : 10,
		template_talk : 11,
		// [[Help:title]], [[使用說明:title]]
		help : 12,
		help_talk : 13,
		category : 14,
		category_talk : 15,
		// 主題/主題首頁
		portal : 100,
		// 主題討論
		portal_talk : 101,
		book : 108,
		book_talk : 109,
		draft : 118,
		draft_talk : 119,
		education_program : 446,
		education_program_talk : 447,
		timedtext : 710,
		timedtext_talk : 711,
		// 模块 模塊 模組
		module : 828,
		module_talk : 829,
		// 話題
		topic : 2600
	};

	get_namespace.name_of_NO = [];

	/**
	 * build `get_namespace.pattern`
	 * 
	 * @inner
	 */
	function generate_namespace_pattern(namespace_hash, name_of_NO) {
		var source = [];
		for ( var namespace in namespace_hash) {
			name_of_NO[namespace_hash[namespace]] = namespace;
			if (namespace)
				source.push(namespace);
		}

		// return pattern
		// [ , namespace, title ]
		return new RegExp('^(' + source.join('|').replace(/_/g, '[ _]')
				+ '):(.+)$', 'i');
	}
	get_namespace.pattern = generate_namespace_pattern(get_namespace.hash,
			get_namespace.name_of_NO);
	// console.log(get_namespace.pattern);

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
			if (wiki_API.is_page_data(title)) {
				title = title.title;
				// assert: now title is string.
			} else
				return title;
		}
		var matched = title.match(get_namespace.pattern);
		library_namespace.debug('Test ' + wiki_API.title_link_of(title)
				+ ', get [' + matched + '] using pattern '
				+ get_namespace.pattern, 4, 'remove_namespace');
		if (matched)
			return (matched ? matched[2] : title).trim();
	}

	function is_talk_namespace(namespace) {
		var n;
		if (typeof namespace === 'string') {
			// treat ((namespace)) as page title
			// get namespace only. e.g., 'wikipedia:sandbox' → 'wikipedia'
			namespace = namespace.replace(/:.*$/, '');
			if (isNaN(namespace) && !/^(?:[a-z _]+[_ ])?talk$/i.test(namespace))
				return false;
		}

		if (typeof namespace === 'number' || namespace > 0) {
			return namespace % 2 === 1;
		}

		n = get_namespace.name_of_NO[get_namespace(namespace)];
		// {String|Undefined}n
		return n
		// ((namespace)) is valid namespace,
		// {String}n is this normalized namespace
		&& n.endsWith('talk');
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

	wiki_API.upper_case_initial = upper_case_initial;

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
	 * @see [[Wikipedia:命名常規]]
	 * @see https://en.wikipedia.org/wiki/Wikipedia:Page_name#Technical_restrictions_and_limitations
	 */
	function normalize_page_name(page_name, use_underline) {
		if (!page_name || typeof page_name !== 'string')
			return page_name;

		page_name = page_name
		// 不採用 .trimEnd()：對於標題，無論前後加幾個"\u200E"(LEFT-TO-RIGHT MARK)都會被視為無物。
		// "\u200F" 亦不被視作 /\s/，但經測試會被 wiki 忽視。
		// tested: [[title]], {{title}}
		// @seealso [[w:en:Category:CS1 errors: invisible characters]]
		.replace(/[\s\u200B\u200E\u200F\u2060]+$/, '')
		// 只能允許出現頂多一個 ":"。
		.replace(
		// \u2060: word joiner (WJ). /^\s$/.test('\uFEFF')
		/^[\s\u200B\u200E\u200F\u2060]*(?::[\s\u200B\u200E\u200F\u2060]*)?/
		// 去除不可見字符 \p{Cf}，警告 \p{C}。
		, '')
		// 無論是中日文、英文的維基百科，所有的 '\u3000' 都會被轉成空白字元 /[ _]/。
		.replace(/　+/g, ' ')
		// 處理連續多個空白字元。長度相同的情況下，盡可能保留原貌。
		.replace(/([ _]){2,}/g, '$1');

		page_name = use_underline
		// ' ' → '_': 在 URL 上可更簡潔。
		? page_name.replace(/ /g, '_') : page_name.replace(/_/g, ' ');

		page_name = page_name.split(':');
		var has_language;

		page_name.some(function(section, index) {
			section = use_underline ? section.replace(/^[\s_]+/, '') : section
					.trimStart();
			if (index === page_name.length - 1
			// @see PATTERN_PROJECT_CODE
			|| !(use_underline ? /^[a-z][a-z\d\-_]{0,14}$/i
			//
			: /^[a-z][a-z\d\- ]{0,14}$/i).test(section.trimEnd())) {
				// page title: 將首個字母轉成大寫。
				page_name[index] = upper_case_initial(section);
				return true;
			}

			if ((use_underline ? section : section.replace(/ /g, '_'))
			//
			.trimEnd().toLowerCase() in get_namespace.hash) {
				// Wikipedia namespace
				section = section.trimEnd().toLowerCase();
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
						: section.trimEnd();
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

	// [ all, file name ]
	PATTERN_file_prefix = new RegExp('^ *(?:: *)?(?:' + PATTERN_file_prefix
			+ ') *: *([^\\[\\]|#]+)', 'i');

	// "Category" 本身可不分大小寫。
	// 分類名稱重複時，排序索引以後出現者為主。
	var
	// [ all_category_text, category_name, sort_order, post_space ]
	PATTERN_category = /\[\[ *(?:Category|分類|分类|カテゴリ) *: *([^\[\]\|{}\n]+)(?:\s*\|\s*([^\[\]\|�]*))?\]\](\s*\n?)/ig,
	/** {RegExp}分類的匹配模式 for parser。 [all,name] */
	PATTERN_category_prefix = /^ *(?:Category|分類|分类|カテゴリ) *: *([^\[\]\|{}\n�]+)/i;

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
			// page_data.header: 在 Flow_page() 中設定。
			// page_data.revision: 由 Flow_page() 取得。
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

		// is_api_and_title(page_data)
		if (wiki_API.is_page_data(page_data)) {
			need_escape = page_data.ns === get_namespace.hash.category
					|| page_data.ns === get_namespace.hash.file;
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
			&& !get_namespace.pattern.test(title);
			// escape 具有特殊作用的 title。
			need_escape = PATTERN_category_prefix.test(title)
			// 應允許非規範過之 title，如採用 File: 與 Image:, 檔案:。
			|| PATTERN_file_prefix.test(title) || project_prefixed;
		}

		if (!title) {
			return '';
		}
		if (is_wiki_API(session)) {
			if (session.language && !project_prefixed) {
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
		} else if (session) {
			// e.g., `CeL.wiki.title_link_of(page_data, display_text)`
			// shift arguments
			display_text = session;
			session = null;
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
		// page_data.header: 在 Flow_page() 中設定。
		// page_data.revision: 由 Flow_page() 取得。
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

			library_namespace.debug(get_page_title_link(page_data)
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
		return ('missing' in page_data) ? undefined : String(page_data || '');
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
	// instance 相關函數。

	wiki_API.prototype.configurations = default_site_configurations;

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
	 * 注意: 每個 callback 皆應在最後執行 session.next()。
	 * 
	 * 警告: 若 callback throw，可能導致工作中斷，不會自動復原，得要以 wiki.next() 重起工作。
	 * 
	 * 工作原理: 每個實體會hold住一個queue ({Array}this.actions)。 當設定工作時，就把工作推入佇列中。
	 * 另外內部會有另一個行程負責依序執行每一個工作。
	 */
	wiki_API.prototype.next = function() {
		this.running = 0 < this.actions.length;
		if (!this.running) {
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
				if (arg.toString) {
					message = arg.toString();
				} else {
					try {
						message = JSON.stringify(arg);
					} catch (e) {
						// message = String(arg);
						message = library_namespace.is_type(arg);
					}
				}
				return message.slice(0, 80);
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
			break;

		// ------------------------------------------------
		// page access

		case 'query':
			console.trace('use query');
			throw 'Please use .query_API() instead of only .query()!';
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
			Object.assign({
				// [KEY_SESSION]
				session : this
			}, next[4]));
			break;

		case 'siteinfo':
			// wiki.siteinfo(options, callback)
			// wiki.siteinfo(callback)
			if (typeof next[1] === 'function' && !next[2]) {
				// next[1] : callback
				next[2] = next[1];
				next[1] = null;
			}

			wiki_API.siteinfo(Object.assign({
				// [KEY_SESSION]
				session : this
			}, next[1]), function(data, error) {
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
			if (library_namespace.is_Object(next[2]) && !next[3])
				// 直接輸入 options，未輸入 callback。
				next.splice(2, 0, null);

			// → 此法會採用所輸入之 page data 作為 this.last_page，不再重新擷取 page。
			if (wiki_API.is_page_data(next[1])
			// 必須有頁面內容，要不可能僅有資訊。有時可能已經擷取過卻發生錯誤而沒有頁面內容，此時依然會再擷取一次。
			&& (get_page_content.has_content(next[1])
			// 除非剛剛才取得，同一個執行緒中不需要再度取得內容。
			|| next[3] && next[3].allow_missing && ('missing' in next[1]))) {
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
				// this.page(title, callback, options)
				// next[1] : title
				// next[3] : options
				// [ {String}API_URL, {String}title or {Object}page_data ]
				wiki_API.page(is_api_and_title(next[1]) ? next[1] : [
						this.API_URL, next[1] ],
				//
				function wiki_API_next_page_callback(page_data, error) {
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
				Object.assign({
					// [KEY_SESSION]
					session : this
				}, next[3]));
			}
			break;

		case 'parse':
			// e.g., wiki.page('title').parse();
			// next[1] : options
			page_parser(this.last_page, next[1]);
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
				Object.assign({
					// [KEY_SESSION]
					session : this
				}, next[3]));
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
			Object.assign({
				// [KEY_SESSION]
				session : this
			}, next[3]));
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

		case 'search':
			wiki_API.search([ this.API_URL, next[1] ],
			//
			function wiki_API_search_callback(pages, totalhits, key) {
				// undefined || [ page_data ]
				_this.last_pages = pages;
				// 設定/紀錄後續檢索用索引值。
				// 若是將錯誤的改正之後，應該重新自 offset 0 開始 search。
				// 因此這種情況下基本上不應該使用此值。
				if (pages && pages.sroffset)
					_this.next_mark.sroffset = pages.sroffset;

				if (typeof next[2] === 'function') {
					// next[2] : callback(...)
					next[2].call(_this, pages || [], totalhits, key);
				} else if (next[2] && next[2].each) {
					// next[2] : 當作 work，處理積存工作。
					// next[2].each(page_data, messages, config)
					_this.work(next[2]);
				}

				_this.next();
			},
			// next[3] : options
			Object.assign({
				// [KEY_SESSION]
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
						.debug('Using options to call check_stop(): '
								+ JSON.stringify(next[1]), 2,
								'wiki_API.prototype.next');
				next[1].token = this.token;
				// 正作業中之 wiki_API instance。
				next[1][KEY_SESSION] = this;
				wiki_API.check_stop(function(stopped) {
					// cache
					_this.stopped = stopped;

					_this.next();
				},
				// next[1] : options
				next[1]);
			}
			break;

		case 'copy_from':
			// `wiki_API_prototype_copy_from`
			wiki_API.edit.copy_from.apply(this, next.slice(1));
			break;

		case 'edit':
			// wiki.edit(page contents, options, callback)
			if (typeof next[2] === 'string') {
				// wiki.edit(page contents, summary, callback)
				next[2] = {
					summary : next[2]
				};
			}

			// TODO: {String|RegExp|Array}filter
			if (!this.last_page) {
				library_namespace
						.warn('wiki_API.prototype.next: No page in the queue. You must run .page() first!');
				// next[3] : callback
				if (typeof next[3] === 'function') {
					next[3].call(_this, undefined, 'no page');
				}
				this.next();

			} else if (!('stopped' in this)) {
				library_namespace.debug('rollback, check if need stop 緊急停止.',
						2, 'wiki_API.prototype.next');
				this.actions.unshift([ 'check' ], next);
				this.next();
			} else if (this.stopped && !next[2].skip_stopped) {
				library_namespace.warn('wiki_API.prototype.next: 已停止作業，放棄編輯'
						+ wiki_API.title_link_of(this.last_page) + '！');
				// next[3] : callback
				if (typeof next[3] === 'function')
					next[3].call(this, this.last_page.title, '已停止作業');
				this.next();

			} else if (this.last_page.is_Flow) {
				// next[2]: options to call edit_topic()
				// .section: 章節編號。 0 代表最上層章節，new 代表新章節。
				if (next[2].section !== 'new') {
					library_namespace
							.warn('wiki_API.prototype.next: The page to edit is Flow. I can not edit it directly.');
					// next[3] : callback
					if (typeof next[3] === 'function') {
						// 2017/9/18 Flow已被重新定義為結構化討論 / 結構式討論。
						// is [[mw:Structured Discussions]].
						next[3].call(this, this.last_page.title, 'is Flow');
					}
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
						// [KEY_SESSION]
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
							.warn('wiki_API.prototype.next: Denied to edit flow '
									+ wiki_API.title_link_of(this.last_page));
					// next[3] : callback
					if (typeof next[3] === 'function')
						next[3].call(this, this.last_page.title, 'denied');
					this.next();

				} else {
					library_namespace.debug('直接採用 Flow 的方式增添新話題。');
					// use/get the contents of this.last_page
					if (typeof next[1] === 'function') {
						// next[1] = next[1](get_page_content(this.last_page),
						// this.last_page.title, this.last_page);
						// 需要同時改變 wiki_API.edit！
						// next[2]: options to call edit_topic()
						// .call(options,): 使(回傳要編輯資料的)設定值函數能以this即時變更 options。
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
					// next[2]: options to call edit_topic()
					Object.assign({
						// [KEY_SESSION]
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
						.warn('wiki_API.prototype.next: Denied to edit '
								+ wiki_API.title_link_of(this.last_page));
				// next[3] : callback
				if (typeof next[3] === 'function')
					next[3].call(this, this.last_page.title, 'denied');
				this.next();

			} else {
				if (typeof next[1] === 'function') {
					// next[1] = next[1](get_page_content(this.last_page),
					// this.last_page.title, this.last_page);
					// 需要同時改變 wiki_API.edit！
					// next[2]: options to call edit_topic()
					// .call(options,): 使(回傳要編輯資料的)設定值函數能以this即時變更 options。
					next[1] = next[1].call(next[2], this.last_page);
				}
				if (next[2] && next[2].skip_nochange
				// 採用 skip_nochange 可以跳過實際 edit 的動作。
				&& next[1] === get_page_content(this.last_page)) {
					library_namespace.debug('Skip [' + this.last_page.title
							+ ']: The same contents.', 1,
							'wiki_API.prototype.next');
					// next[3] : callback
					if (typeof next[3] === 'function')
						next[3].call(this, this.last_page.title, 'nochange');
					this.next();
				} else {
					wiki_API.edit([ this.API_URL, this.last_page ],
					// 因為已有 contents，直接餵給轉換函式。
					next[1], this.token,
					// next[2]: options to call wiki_API.edit()
					Object.assign({
						// [KEY_SESSION]
						session : this
					}, next[2]), function wiki_API_next_edit_callback(title,
							error, result) {
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
								library_namespace
										.error('wiki_API.prototype.next: '
												+ 'Not using node.js!');
								return;
							}
							// 下面的 workaround 僅適用於 node.js。
							if (!_this.token.lgpassword) {
								library_namespace
										.error('wiki_API.prototype.next: '
												+ 'No password preserved!');
								// 死馬當活馬醫，仍然嘗試重新取得 token...沒有密碼無效。
								return;
							}
							library_namespace.info('wiki_API.prototype.next: '
									+ 'Try to get token again. 嘗試重新取得 token。');
							// rollback
							_this.actions.unshift(
							// 重新登入以後，編輯頁面之前再取得一次頁面內容。
							[ 'page', _this.last_page.title ], next);
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
							// 還是可能出現丟失 this.last_page 的現象。
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
								next[3].call(_this, title, error, result);
							// assert: 應該有_this.last_page。
							// 因為已經更動過內容，為了預防會取得舊的錯誤資料，因此將之刪除。但留下標題資訊。
							if (_this.last_page) {
								delete _this.last_page.revisions;
							}
							_this.next();
						}
					});
				}
			}
			break;

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
			Object.assign({
				// [KEY_SESSION]
				session : this
			}, next[2]), function(result, error) {
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
			// 因為接下來的操作會呼叫 this.next() 本身，
			// 因此必須把正在執行的標記特消掉。
			this.running = false;
			add_listener(next[1],
			// next[2]: options to call wiki_API.listen()
			Object.assign({
				// [KEY_SESSION]
				session : this
			}, next[2]));
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
			Object.assign({
				// [KEY_SESSION]
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
			wikidata_edit(next[1], next[2], this.data_session.token,
			// next[3] : options
			Object.assign({
				// [KEY_SESSION]
				session : this.data_session
			}, next[3]),
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
			wikidata_merge(next[1], next[2], this.data_session.token,
			// next[3] : options
			Object.assign({
				// [KEY_SESSION]
				session : this.data_session
			}, next[3]),
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
			wikidata_query(next[1], function(data) {
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
	wiki_API.prototype.next.methods = 'query_API|siteinfo|page|parse|redirect_to|purge|check|copy_from|edit|upload|cache|listen|search|remove|delete|move_to|protect|rollback|logout|run|set_URL|set_language|set_data|data|edit_data|merge_data|query_data|query'
			.split('|');

	// ------------------------------------------------------------------------

	// e.g., " (99%): 0.178 page/ms, 1.5 minutes estimated."
	function estimated_message(processed_amount, total_amount, starting_time,
			page_count, unit) {
		/** {Natural}ms */
		var time_elapsed = Date.now() - starting_time;
		// estimated time of completion 估計時間 預計剩下時間 預估剩餘時間 預計完成時間還要多久
		var estimated = time_elapsed / processed_amount
				* (total_amount - processed_amount)
				// default showing interval: 1 minute
				/ library_namespace.to_millisecond('1 min');
		if (estimated > 1) {
			estimated = estimated > 99 ? (estimated / 60).toFixed(1) + ' hours'
					: estimated.toFixed(1) + ' minutes';
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
		if (!(limit_length >= 0)) {
			limit_length = 8000;
		}
		if (false && !(limit >= 0)) {
			limit = 5000;
		}

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
		// run this at last. 在wiki_API.prototype.work()工作最後執行此config.last()。
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
	wiki_API.prototype.work = function(config, pages) {
		if (typeof config === 'function')
			config = {
				each : config
			};
		if (!config || !config.each) {
			library_namespace.warn('wiki_API.work: Bad callback!');
			return;
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
			library_namespace.sinfo([ 'wiki_API.work: start [', 'fg=yellow',
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
			library_namespace.info('wiki_API.work: 列表中沒有項目，快速完結。');
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
		// 採用 {{tlx|template_name}} 時，[[Special:RecentChanges]]頁面無法自動解析成 link。
		options.summary = (callback = config.summary)
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
			// TODO: [[ja:Special:Diff/62546431|有時最後一筆記錄可能會漏失掉]]
			callback = no_message ? library_namespace.null_function
			// default logger.
			: function(title, error, result) {
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
						result = [ 'error', error ];
						error = gettext('finished: %1', error);
					}
				} else if (!result || !result.edit) {
					// 有時 result 可能會是 ""，或者無 result.edit。這通常代表 token lost。
					library_namespace.error('wiki_API.work: 無 result.edit'
							+ (result && result.edit ? '.newrevid' : '')
							+ '！可能是 token lost！');
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
				library_namespace.error('wiki_API.work: Get error: ' + error);
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

			if (data.length !== this_slice_size) {
				// 處理有時可能連 data 都是 trimmed 過的。
				// assert: data.length < this_slice_size
				if (true || data.truncated) {
					if (!setup_target || library_namespace.is_debug())
						library_namespace.warn(
						//
						'wiki_API.work: query 所得之 length (' + data.length
						//
						+ ') !== this slice size (' + this_slice_size + ') ！');

					if (setup_target) {
						// -this_slice_size: 先回溯到 pages 開頭之 index。
						work_continue -= this_slice_size - data.length;
						library_namespace.debug('一次取得大量頁面時，回傳內容超過限度而被截斷。將回退 '
								+ (this_slice_size - data.length) + '頁。', 1,
								'wiki_API.work');
					}
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

			if (!no_message) {
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
					library_namespace.error('wiki_API.work: 回傳內容超過限度而被截斷！');
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
			}

			library_namespace.debug('for each page: 主要機制是把工作全部推入 queue。', 2,
					'wiki_API.work');
			// 剩下的頁面數量 pages remaining. cf. ((done))
			var pages_left = 0;
			if (pages.length > 0) {
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
						this.page(page, function(page_data, error) {
							// TODO: if (error) {...}
							// console.log([ page_data, config.page_options ]);
							each.call(this, page_data, messages, config);
							if (messages.quit_operation) {
								clear_work.call(this);
							}
							if (--pages_left === 0) {
								finish_up.call(this);
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
							// edit/process
							if (!no_message) {
								library_namespace.sinfo([
								//
								'wiki_API.work: edit '
								//
								+ (index + 1) + '/' + pages.length
								//
								+ ' [[', 'fg=yellow',
								//
								page_data.title, '-fg', ']]' ]);
							}
							// 以 each() 的回傳作為要改變成什麼內容。
							var content = each.call(
							// 注意: this === work_options
							// @see wiki_API.edit()
							this, page_data, messages, config);
							if (messages.quit_operation) {
								clear_work.call(this);
							}
							return content;
						}, work_options, function() {
							// function(title, error, result)
							callback.apply(this, arguments);
							if (--pages_left === 0) {
								finish_up.call(this);
							}
						});
					}
				}, this);

			} else {
				// 都沒有東西的時候依然應該執行收尾。
				finish_up.call(this);
			}

			// 警告：不可省略，只為避免clear_work()誤刪！
			this.run(function() {
				library_namespace.debug('工作配給完畢，等待 callback 結束，準備收尾。', 3,
						'wiki_API.work');
			});

			// 不應用 .run(finish_up)，而應在 callback 中呼叫 finish_up()。
			function finish_up() {
				if (!no_message) {
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
						/\[\[\s*(Category|分類|分类|カテゴリ)\s*:/ig, '[[:$1:'));
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

				this.run(function() {
					library_namespace.log('wiki_API.work: 結束 .work() 作業'
					// 已完成作業
					+ (config.summary ? ' [' + config.summary + ']' : '。'));
				});
			}

		}).bind(this);

		var target = pages,
		// 首先取得多個頁面內容所用之 options。
		// e.g., page_options:{rvprop:'ids|content|timestamp'}
		// @see
		// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Brevisions
		page_options = Object.assign({
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
				// console.log([ 'max_size:', max_size, config.is_id ]);
				if (max_size < slice_size) {
					this_slice = this_slice.slice(0, max_size);
				}
				if (work_continue === 0 && max_size === target.length) {
					library_namespace.debug('設定一次先取得所有 ' + target.length
							+ ' 個頁面之 revisions (page contents 頁面內容)。', 2,
							'wiki_API.work');
				} else {
					nochange_count = target.length;
					done = '處理分塊 ' + (work_continue + 1) + '–' + (work_continue
					// start–end/all
					+ Math.min(max_size, nochange_count)) + '/'
							+ nochange_count;
					// Add percentage message.
					if (nochange_count > 1e4) {
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
	wiki_API.prototype.get_token = function(callback, type) {
		// assert: this (session) 已登入成功， callback 已設定好。
		if (!type) {
			// default_type: csrf (cross-site request forgery) token
			type = 'csrf';
		}
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
			session = new wiki_API(name, password, API_URL);
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
			// magicwords: #重定向 interwikimap, thumb %1px center,
			// https://zh.wikipedia.org/w/api.php?action=query&meta=siteinfo&siprop=general|namespaces|namespacealiases|specialpagealiases|magicwords|extensiontags|protocols&utf8&format=json
			siprop : 'general|namespaces|namespacealiases|specialpagealiases'
					+ '|magicwords|languagevariants|extensiontags|protocols'
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
		console.log(configurations);
		var site_configurations = session.configurations;
		if (site_configurations === default_site_configurations) {
			session.configurations = site_configurations
			//
			= Object.assign(Object.create(null),
			//
			default_site_configurations);
		}

		var general = configurations.general;
		if (general) {
			// site_configurations.general=general;
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

		var namespaces = configurations.namespaces;
	}

	// html to wikitext
	// https://zh.wikipedia.org/w/api.php?action=help&modules=flow-parsoid-utils

	// ------------------------------------------------------------------------
	// administrator functions. 管理員相關函數。

	// 自 options 汲取出 parameters。
	// TODO: 整合進 normalize_parameters。
	// default_parameters[parameter name] = required
	function draw_parameters(options, default_parameters, token_type) {
		if (!options) {
			// Invalid options/parameters
			return 'No options specified';
		}

		// 汲取出 parameters。
		var parameters = Object.create(null);
		if (default_parameters) {
			for ( var parameter_name in default_parameters) {
				if (parameter_name in options) {
					parameters[parameter_name] = options[parameter_name];
				} else if (default_parameters[parameter_name]) {
					// 表示此屬性為必須存在/指定的屬性。
					// This parameter is required.
					return 'No property ' + parameter_name + ' specified';
				}

			}
		}

		var session = options[KEY_SESSION];

		// assert: 有parameters, e.g., {Object}parameters
		// 可能沒有 session

		// ----------------------------
		// 處理 target page。
		var KEY_ID = 'pageid', KEY_TITLE = 'title';
		if (parameters.to) {
			// move_to
			KEY_ID = 'fromid';
			KEY_TITLE = 'from';
		}

		// 都先從 options 取值，再從 session 取值。
		if (options[KEY_ID] >= 0 || options.pageid >= 0) {
			parameters[KEY_ID] = options[KEY_ID] >= 0 ? options[KEY_ID]
					: options.pageid;
		} else if (options[KEY_TITLE] || options.title) {
			parameters[KEY_TITLE] = options[KEY_TITLE] || options.title;
		} else if (wiki_API.is_page_data(session && session.last_page)) {
			// options.page_data
			if (session.last_page.pageid >= 0)
				parameters[KEY_ID] = session.last_page.pageid;
			else
				parameters[KEY_TITLE] = session.last_page.title;
		} else {
			// 可能沒有 page_data
			if (library_namespace.is_debug()) {
				library_namespace.error('draw_parameters: No page specified: '
						+ JSON.stringify(options));
			}
			return 'No page id/title specified';
		}

		// ----------------------------
		// 處理 token。
		if (!token_type) {
			token_type = 'csrf';
		}
		var token = options.token || session && session.token;
		if (token && typeof token === 'object') {
			// session.token.csrftoken
			token = token[token_type + 'token'];
		}
		if (!token) {
			// TODO: use session
			if (false) {
				library_namespace
						.error('wiki_API.protect: No token specified: '
								+ options);
			}
			return 'No ' + token_type + 'token specified';
		}
		parameters.token = token;

		return parameters;
	}

	// use "csrf" token retrieved from action=query&meta=tokens
	// callback(response, error);
	function wiki_operator(action, default_parameters, options, callback) {
		// default_parameters
		// Warning: 除 pageid/title/token 之外，這邊只要是能指定給 API 的，皆必須列入！
		var parameters = draw_parameters(options, default_parameters);
		// console.log(parameters);
		if (!library_namespace.is_Object(parameters)) {
			// error occurred.
			if (typeof callback === 'function')
				callback(undefined, parameters);
			return;
		}

		var session = options[KEY_SESSION];
		// TODO: 若是頁面不存在/已刪除，那就直接跳出。

		if (action === 'move') {
			library_namespace.is_debug((parameters.fromid || parameters.from)
					+ ' → ' + parameters.to, 1, 'wiki_operator.move');
		}

		var _action = 'action=' + action;
		var API_URL = session && session.API_URL;
		if (API_URL) {
			_action = [ API_URL, action ];
		}

		wiki_API.query(_action, function(response, error) {
			// console.log(JSON.stringify(response));
			error = error || response && response.error;
			if (error) {
				callback(response, error);
			} else {
				callback(response[action]);
			}
		}, parameters, session);
	}

	// ----------------------------------------------------

	// wiki_API.delete(): remove / delete a page.
	wiki_API['delete'] = function(options, callback) {
		// https://www.mediawiki.org/w/api.php?action=help&modules=delete

		/**
		 * response: <code>
		{"delete":{"title":"Title","reason":"content was: \"...\", and the only contributor was \"[[Special:Contributions/Cewbot|Cewbot]]\" ([[User talk:Cewbot|talk]])","logid":0000}}
		{"error":{"code":"nosuchpageid","info":"There is no page with ID 0.","*":"See https://test.wikipedia.org/w/api.php for API usage. Subscribe to the mediawiki-api-announce mailing list at &lt;https://lists.wikimedia.org/mailman/listinfo/mediawiki-api-announce&gt; for notice of API deprecations and breaking changes."},"servedby":"mw1232"}
		 * </code>
		 */

		wiki_operator('delete', {
			reason : false,
			tags : false,
			watchlist : false,
			oldimage : false
		}, options, callback);
	};

	// ----------------------------------------------------

	// wiki_API.move_to(): move a page from `from` to target `to`.
	wiki_API.move_to = function(options, callback) {
		// https://www.mediawiki.org/w/api.php?action=help&modules=move
		var default_parameters = {
			// move_to_title
			to : true,
			reason : false,
			movetalk : false,
			movesubpages : false,
			noredirect : false,
			watchlist : false,
			ignorewarnings : false,
			tags : false
		};

		/**
		 * response: <code>
		{"error":{"code":"nosuchpageid","info":"There is no page with ID 0.","*":"See https://zh.wikipedia.org/w/api.php for API usage. Subscribe to the mediawiki-api-announce mailing list at &lt;https://lists.wikimedia.org/mailman/listinfo/mediawiki-api-announce&gt; for notice of API deprecations and breaking changes."},"servedby":"mw1277"}
		error:
		{"code":"articleexists","info":"A page of that name already exists, or the name you have chosen is not valid. Please choose another name.","*":"See https://zh.wikipedia.org/w/api.php for API usage. Subscribe to the mediawiki-api-announce mailing list at &lt;https://lists.wikimedia.org/mailman/listinfo/mediawiki-api-announce&gt; for notice of API deprecations and breaking changes."}
		{"code":"selfmove","info":"The title is the same; cannot move a page over itself.","*":"See https://zh.wikipedia.org/w/api.php for API usage. Subscribe to the mediawiki-api-announce mailing list at &lt;https://lists.wikimedia.org/mailman/listinfo/mediawiki-api-announce&gt; for notice of API deprecations and breaking changes."}
		 * </code>
		 */

		// console.log(options);
		wiki_operator('move', default_parameters, options, callback);
	};

	// ----------------------------------------------------

	// @see wiki_API.is_protected
	// Change the protection level of a page.
	wiki_API.protect = function(options, callback) {
		// https://www.mediawiki.org/w/api.php?action=help&modules=protect

		/**
		 * response: <code>
		{"protect":{"title":"title","reason":"存檔保護作業","protections":[{"edit":"sysop","expiry":"infinite"},{"move":"sysop","expiry":"infinite"}]}}
		{"servedby":"mw1203","error":{"code":"nosuchpageid","info":"There is no page with ID 2006","*":"See https://zh.wikinews.org/w/api.php for API usage"}}
		 * </code>
		 */

		wiki_operator('protect', {
			// protections: e.g., 'edit=sysop|move=sysop', 一般說來edit應與move同步。
			protections : true,
			// 在正式場合，最好給個好的理由。
			// reason: @see [[MediaWiki:Protect-dropdown]]
			reason : false,
			// expiry : 'infinite',
			expiry : false,
			tags : false,
			cascade : false,
			watchlist : false
		}, Object.assign({
			protections : 'edit=sysop|move=sysop'
		}, options), callback);
	};

	// ----------------------------------------------------

	// rollback 僅能快速撤銷/回退/還原某一頁面最新版本之作者(最後一位使用者)一系列所有編輯至另一作者的編輯
	// The rollback revision will be marked as minor.
	wiki_API.rollback = function(options, callback) {
		var session = options[KEY_SESSION];

		if (session && !session.token.rollbacktoken) {
			session.get_token(function() {
				wiki_API.rollback(options, callback);
			}, 'rollback');
		}

		var parameters = draw_parameters(options, {
			// default_parameters
			// Warning: 除外pageid/title/token這邊只要是能指定給 API 的，皆必須列入！
			user : false,
			summary : false,
			markbot : false,
			tags : false
		}, 'rollback');
		if (!library_namespace.is_Object(parameters)) {
			// error occurred.
			if (typeof callback === 'function')
				callback(undefined, parameters);
			return;
		}

		// 都先從 options 取值，再從 session 取值。
		var page_data =
		// options.page_data ||
		options.pageid && options || session && session.last_page;

		// assert: 有parameters, e.g., {Object}parameters
		// 可能沒有 session, page_data

		if (!parameters.user && wiki_API.content_of.revision(page_data)) {
			// 將最後一個版本的編輯者當作回退對象。
			parameters.user = wiki_API.content_of.revision(page_data).user;
		}

		// https://www.mediawiki.org/w/api.php?action=help&modules=rollback
		// If the last user who edited the page made multiple edits in a row,
		// they will all be rolled back.
		if (!parameters.user) {
			// 抓最後的編輯者試試。
			// 要用pageid的話，得採page_data，就必須保證兩者相同。
			if (!parameters.title && page_data
					&& parameters.pageid !== page_data.pageid) {
				callback(undefined, 'parameters.pageid !== page_data.pageid');
				return;
			}
			wiki_API.page(page_data || parameters.title, function(page_data,
					error) {
				if (error || !wiki_API.content_of.revision(page_data)
				// 保證不會再持續執行。
				|| !wiki_API.content_of.revision(page_data).user) {
					if (false) {
						library_namespace.error(
						//
						'wiki_API.rollback: No user name specified!');
					}

					callback(undefined,
					//
					'No user name specified and I can not guess it!');
					return;
				}
				wiki_API.rollback(options, callback);
			}, Object.assign({
				rvprop : 'ids|timestamp|user'
			}, options));
			return;
		}

		if (!('markbot' in parameters) && options.bot) {
			parameters.markbot = options.bot;
		}

		var action = 'action=rollback';
		if (session && session.API_URL) {
			action = [ session.API_URL, action ];
		}

		/**
		 * response: <code>
		{"rollback":{"title":"title","pageid":1,"summary":"","revid":9,"old_revid":7,"last_revid":1,"messageHtml":"<p></p>"}}
		{"servedby":"mw1190","error":{"code":"badtoken","info":"Invalid token","*":"See https://zh.wikinews.org/w/api.php for API usage"}}
		 * </code>
		 */
		wiki_API.query(action, function(response) {
			var error = response && response.error;
			if (error) {
				callback(response, error);
			} else {
				// revid 回滾的版本ID。
				// old_revid 被回滾的第一個（最新）修訂的修訂ID。
				// last_revid 被回滾最後一個（最舊）版本的修訂ID。
				// 如果回滾不會改變的頁面，沒有新修訂而成。在這種情況下，revid將等於old_revid。
				callback(response.rollback);
			}
		}, parameters, session);
	};

	// ----------------------------------------------------

	// 目前的修訂，不可隱藏。
	// This is the current revision. It cannot be hidden.
	wiki_API.hide = function(options, callback) {
		TODO;
	};

	// ========================================================================

	// 不可 catch default_language。
	// 否則會造成 `wiki_API.set_language()` 自行設定 default_language 時無法取得最新資料。
	/** {String}default language / wiki name */
	var default_language;

	// Wikimedia project code alias
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
				// get default_language
			}
			return default_language;
		}

		// assert: default_language is in lower case. See URL_to_wiki_link().
		default_language = language.toLowerCase();
		// default api URL. Use <code>CeL.wiki.API_URL = api_URL('en')</code> to
		// change it.
		// see also: application.locale
		wiki_API.API_URL = library_namespace.is_WWW()
				&& (navigator.userLanguage || navigator.language)
				|| default_language;
		if (!(wiki_API.API_URL in valid_language)) {
			// 'en-US' → 'en'
			wiki_API.API_URL = wiki_API.API_URL.toLowerCase().replace(/-.+$/,
					'');
		}
		wiki_API.API_URL = api_URL(wiki_API.API_URL);
		library_namespace.debug('wiki_API.API_URL = ' + wiki_API.API_URL, 3,
				'set_default_language');

		if (SQL_config) {
			SQL_config.set_language(default_language);
		}

		wiki_API.prototype.continue_key = gettext(default_continue_key);

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
		library_namespace.warn(this.id
				+ ': 無 node.js 之 fs，因此不具備 cache 或 SQL 功能。');
		node_fs = {
			readFile : function(file_path, options, callback) {
				library_namespace.error('Can not read file ' + file_path);
				if (typeof callback === 'function')
					callback(true);
			},
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

	function is_wikidata_site(site_or_language) {
		// TODO: 不是有包含'wiki'的全都是site。
		library_namespace.debug('Test ' + site_or_language, 3,
				'is_wikidata_site');
		return /^[a-z_\d]{2,20}?(?:wiki(?:[a-z]{4,7})?|wiktionary)$/
				.test(site_or_language);
	}

	// ------------------------------------------------------------------------
	// SQL 相關函數。

	var
	// http://stackoverflow.com/questions/9080085/node-js-find-home-directory-in-platform-agnostic-way
	// Windows: process.platform.toLowerCase().startsWith('win')
	/** {String}user home directory */
	home_directory = library_namespace.platform.nodejs
			&& (process.env.HOME || process.env.USERPROFILE),
	/** {String}Wikimedia Toolforge database host */
	TOOLSDB = 'tools-db',
	/** {String}user/bot name */
	user_name,
	/** {String}Wikimedia Toolforge name. CeL.wiki.wmflabs */
	wmflabs,
	/** {Object}Wikimedia Toolforge job data. CeL.wiki.job_data */
	job_data,
	/** node mysql handler */
	node_mysql,
	/** {Object}default SQL configurations */
	SQL_config;

	if (home_directory
			&& (home_directory = home_directory.replace(/[\\\/]$/, '').trim())) {
		user_name = home_directory.match(/[^\\\/]+$/);
		user_name = user_name ? user_name[0] : undefined;
		if (user_name) {
			wiki_API.user_name = user_name;
		}
		// There is no CeL.storage.append_path_separator() here!
		home_directory += library_namespace.env.path_separator;
	}

	// setup SQL config language (and database/host).
	function set_SQL_config_language(language) {
		if (!language) {
			return;
		}
		if (typeof language !== 'string') {
			library_namespace.error(
			//
			'set_SQL_config_language: Invalid language: [' + language + ']');
			return;
		}

		// 正規化。
		language = language.trim().toLowerCase();
		// TODO: 'zh.news'
		// 警告: this.language 可能包含 'zhwikinews' 之類。
		this.language = language
		// 'zhwiki' → 'zh'
		.replace(/wik[it][a-z]{0,9}$/, '')
		// 'zh-classical' → 'zh_classical'
		.replace(/-/g, '_');

		if (language === 'meta') {
			// @see /usr/bin/sql
			this.host = 's7.labsdb';
			// https://wikitech.wikimedia.org/wiki/Nova_Resource:Tools/Help#Metadata_database
			this.database = 'meta_p';

		} else if (language === TOOLSDB) {
			this.host = language;
			// delete this.database;

		} else if (is_wikidata_site(language)) {
			this.host = language + '.labsdb';
			/**
			 * The database names themselves consist of the mediawiki project
			 * name, suffixed with _p
			 * 
			 * @see https://wikitech.wikimedia.org/wiki/Help:Toolforge/Database
			 */
			this.database = language + '_p';
		} else {
			// e.g., 'zh', 'zh_classical'
			this.host = language + 'wiki.labsdb';
			this.database = language + 'wiki_p';
		}
		// console.log(this);
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
		if (user) {
			config = {
				user : user,
				password : password,
				db_prefix : user + '__',
				set_language : set_SQL_config_language
			};
		} else if (SQL_config) {
			is_clone = true;
			config = Object.clone(SQL_config);
		} else {
			config = {};
		}

		if (typeof language === 'object') {
			if (is_clone) {
				delete config.database;
			}
			if (language.API_URL) {
				// treat language as session.
				// use set_SQL_config_language()
				config.set_language(wiki_API.site_name(language), !user);
			} else {
				Object.assign(config, language);
			}
		} else if (typeof language === 'string' && language) {
			if (is_clone) {
				delete config.database;
			}
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
			library_namespace.error(
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
	// https://wikitech.wikimedia.org/wiki/Help:Toolforge/FAQ#How_can_I_detect_if_I.27m_running_in_Cloud_VPS.3F_And_which_project_.28tools_or_toolsbeta.29.3F
	if (library_namespace.platform.nodejs) {
		/** {String}Wikimedia Toolforge name. CeL.wiki.wmflabs */
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
		// CeL.wiki.wmflabs
		wiki_API.wmflabs = wmflabs;

		// default: use Wikimedia Varnish Cache.
		// wiki_API.use_Varnish = true;
		// 2016/4/9 9:9:7 預設不使用 Wikimedia Varnish Cache。速度較慢，但較有保障。
		// delete CeL.wiki.use_Varnish;

		try {
			if (node_mysql = require('mysql')) {
				SQL_config = parse_SQL_config(home_directory
				// The production replicas.
				// https://wikitech.wikimedia.org/wiki/Help:Toolforge#The_databases
				// https://wikitech.wikimedia.org/wiki/Help:Toolforge/Database
				// Wikimedia Toolforge
				// 上之資料庫僅為正式上線版之刪節副本。資料並非最新版本(但誤差多於數分內)，也不完全，
				// <s>甚至可能為其他 users 竄改過</s>。
				+ 'replica.my.cnf');
			}
		} catch (e) {
			// TODO: handle exception
		}

		if (process.env.JOB_ID && process.env.JOB_NAME) {
			// assert: process.env.ENVIRONMENT === 'BATCH'
			wiki_API.job_data = job_data = {
				id : process.env.JOB_ID,
				name : process.env.JOB_NAME,
				request : process.env.REQUEST,
				script : process.env.JOB_SCRIPT,
				stdout_file : process.env.SGE_STDOUT_PATH,
				stderr_file : process.env.SGE_STDERR_PATH,
				// 'continuous' or 'task'
				is_task : process.env.QUEUE === 'task'
			};
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
	 * @see https://wikitech.wikimedia.org/wiki/Help:Toolforge/Database
	 * 
	 * @require https://github.com/mysqljs/mysql <br />
	 *          https://quarry.wmflabs.org/ <br />
	 *          TODO: https://github.com/sidorares/node-mysql2
	 */
	function run_SQL(SQL, callback, config) {
		var _callback = function(error, results, fields) {
			// the connection will return to the pool, ready to be used again by
			// someone else.
			// connection.release();

			// close the connection and remove it from the pool
			// connection.destroy();

			callback(error, results, fields);
		};
		_callback = callback;

		// TypeError: Converting circular structure to JSON
		// library_namespace.debug(JSON.stringify(config), 3, 'run_SQL');
		if (!config && !(config = SQL_config)) {
			return;
		}

		// treat config as language.
		if (typeof config === 'string' || wiki_API.is_wiki_API(config)) {
			config = new_SQL_config(config);
		}

		library_namespace.debug(String(SQL), 3, 'run_SQL');
		// console.log(JSON.stringify(config));
		var connection = node_mysql.createConnection(config);
		connection.connect();
		if (Array.isArray(SQL)) {
			// ("SQL", [values], callback)
			connection.query(SQL[0], SQL[1], _callback);
		} else {
			// ("SQL", callback)
			connection.query(SQL, _callback);
		}
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
				// placeholder 佔位符
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

	// change language (and database/host).
	//CeL.wiki.SQL.config.set_language('en');
	CeL.wiki.SQL(SQL, function callback(error, rows, fields) { if(error) console.error(error); else console.log(rows); }, 'en');

	// get sitelink count of wikidata items
	// https://www.mediawiki.org/wiki/Wikibase/Schema/wb_items_per_site
	// https://www.wikidata.org/w/api.php?action=help&modules=wbsetsitelink
	var SQL_get_sitelink_count = 'SELECT ips_item_id, COUNT(*) AS `link_count` FROM wb_items_per_site GROUP BY ips_item_id LIMIT 10';
	var SQL_session = new CeL.wiki.SQL(function(error){}, 'wikidata');
	function callback(error, rows, fields) { if(error) console.error(error); else console.log(rows); SQL_session.connection.destroy(); }
	SQL_session.SQL(SQL_get_sitelink_count, callback);

	// one-time method
	CeL.wiki.SQL(SQL_get_sitelink_count, callback, 'wikidata');

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

	SQL_session.connection.destroy();

	 * </code>
	 * 
	 * @param {String}[dbname]
	 *            database name.
	 * @param {Function}callback
	 *            回調函數。 callback(error)
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
		this.connection = node_mysql.createConnection(this.config);
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
					library_namespace.error(error);
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
		// export 導出: CeL.wiki.SQL() 僅可在 Wikimedia Toolforge 上使用。
		wiki_API.SQL.config = SQL_config;
		// wiki_API.SQL.create = create_database;
	}

	// ----------------------------------------------------

	/**
	 * Convert MediaWiki database timestamp to ISO 8601 format.<br />
	 * UTC: 'yyyymmddhhmmss' → 'yyyy-mm-ddThh:mm:ss'
	 * 
	 * @param {String|Buffer}timestamp
	 *            MediaWiki database timestamp
	 * 
	 * @returns {String}ISO 8601 Data elements and interchange formats
	 * 
	 * @see https://www.mediawiki.org/wiki/Manual:Timestamp
	 */
	function SQL_timestamp_to_ISO(timestamp) {
		if (!timestamp) {
			// ''?
			return;
		}
		// timestamp可能為{Buffer}
		timestamp = timestamp.toString('utf8').chunk(2);
		if (timestamp.length !== 7) {
			// 'NULL'?
			return;
		}

		return timestamp[0] + timestamp[1]
		//
		+ '-' + timestamp[2] + '-' + timestamp[3]
		//
		+ 'T' + timestamp[4] + ':' + timestamp[5] + ':' + timestamp[6] + 'Z';
	}

	function generate_SQL_WHERE(condition, field_prefix) {
		var condition_array = [], value_array = [];

		if (typeof condition === 'string') {
			;

		} else if (Array.isArray(condition)) {
			// TODO: for ' OR '
			condition = condition.join(' AND ');

		} else if (library_namespace.is_Object(condition)) {
			for ( var name in condition) {
				var value = condition[name];
				if (value === undefined) {
					// 跳過這一筆設定。
					continue;
				}
				if (!name) {
					// condition[''] = [ condition 1, condition 2, ...];
					if (Array.isArray(value)) {
						value_array.append(value);
					} else {
						value_array.push(value);
					}
					return;
				}
				if (!/^[a-z_]+$/.test(name)) {
					throw 'Invalid field name: ' + name;
				}
				if (!name.startsWith(field_prefix)) {
					name = field_prefix + name;
				}
				var matched = typeof value === 'string'
				// TODO: for other operators
				// @see https://mariadb.com/kb/en/mariadb/select/
				// https://mariadb.com/kb/en/mariadb/functions-and-operators/
				&& value.match(/^([<>!]?=|[<>]|<=>|IN |IS )([\s\S]+)$/);
				if (matched) {
					name += matched[1] + '?';
					// DO NOT quote the value yourself!!
					value = matched[2];
					// Number.MAX_SAFE_INTEGER starts from 9.
					if (/^[+\-]?[1-9]\d{0,15}$/.test(value)
					// ↑ 15 = String(Number.MAX_SAFE_INTEGER).length-1
					&& +value <= Number.MAX_SAFE_INTEGER) {
						value = +value;
					}
				} else {
					name += '=?';
				}
				condition_array.push(name);
				value_array.push(value);
			}

			// TODO: for ' OR '
			condition = condition_array.join(' AND ');

		} else {
			library_namespace.error('Invalid condition: '
					+ JSON.stringify(condition));
			return;
		}

		return [ ' WHERE ' + condition, value_array ];
	}

	// ----------------------------------------------------

	// https://www.mediawiki.org/wiki/API:RecentChanges
	// const
	var ENUM_rc_type = 'edit,new,move,log,move over redirect,external,categorize';

	/**
	 * Get page title 頁面標題 list of [[Special:RecentChanges]] 最近更改.
	 * 
	 * @examples<code>
		// get title list
		CeL.wiki.recent(function(rows){console.log(rows.map(function(row){return row.title;}));}, {language:'ja', namespace:0, limit:20});
		// 應並用 timestamp + this_oldid
		CeL.wiki.recent(function(rows){console.log(rows.map(function(row){return [row.title,row.rev_id,row.row.rc_timestamp.toString()];}));}, {where:{timestamp:'>=20170327143435',this_oldid:'>'+43772537}});
		</code>
	 * 
	 * TODO: filter
	 * 
	 * @param {Function}callback
	 *            回調函數。 callback({Array}page title 頁面標題 list)
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項.
	 * 
	 * @see https://www.mediawiki.org/wiki/Manual:Recentchanges_table
	 *      https://www.mediawiki.org/wiki/Actor_migration
	 */
	function get_recent_via_databases(callback, options) {
		if (options && (typeof options === 'string')) {
			options = {
				// treat options as language
				language : options
			};
		} else {
			options = library_namespace.setup_options(options);
		}

		var SQL = options.SQL;
		if (!SQL) {
			SQL = Object.create(null);
			if (options.bot === 0 || options.bot === 1) {
				// assert: 0 || 1
				SQL.bot = options.bot;
			}
			// 不指定namespace，或者指定namespace為((undefined)): 取得所有的namespace。
			/** {Integer|String}namespace NO. */
			var namespace = wiki_API.namespace(options.namespace);
			if (namespace !== undefined) {
				SQL.namespace = namespace;
			}
			Object.assign(SQL,
			// {String|Array|Object}options.where: 自訂篩選條件。
			options.where);
			SQL = generate_SQL_WHERE(SQL, 'rc_');

			// https://phabricator.wikimedia.org/T223406
			// TODO: 舊版上 `actor`, `comment` 這兩個資料表不存在會出錯，需要先偵測。
			var fields = [
					'*',
					// https://www.mediawiki.org/wiki/Manual:Actor_table#actor_id
					'(SELECT `actor_user` FROM `actor` WHERE `actor`.`actor_id` = `recentchanges`.`rc_actor`) AS `userid`',
					'(SELECT `actor_name` FROM `actor` WHERE `actor`.`actor_id` = `recentchanges`.`rc_actor`) AS `user_name`',
					// https://www.mediawiki.org/wiki/Manual:Comment_table#comment_id
					'(SELECT `comment_text` FROM `comment` WHERE `comment`.`comment_id` = `recentchanges`.`rc_comment_id`) AS `comment`',
					'(SELECT `comment_data` FROM `comment` WHERE `comment`.`comment_id` = `recentchanges`.`rc_comment_id`) AS `comment_data`' ];

			SQL[0] = 'SELECT ' + fields.join(',')
			// https://www.mediawiki.org/wiki/Manual:Recentchanges_table
			+ ' FROM `recentchanges`' + SQL[0]
			// new → old, may contain duplicate title.
			// or rc_this_oldid, but too slow (no index).
			+ ' ORDER BY `rc_timestamp` DESC LIMIT ' + (
			/** {ℕ⁰:Natural+0}limit count. */
			options.limit > 0 ? Math.min(options.limit
			// 筆數限制。就算隨意輸入，強制最多只能這麼多筆資料。
			, 1e3)
			// default records to get
			: options.where ? 1e4 : 100);
		}

		if (false) {
			console.log([ options.config, options.language,
					options[KEY_SESSION] && options[KEY_SESSION].language ]);
			console.log(options[KEY_SESSION]);
			throw 1;
		}

		run_SQL(SQL, function(error, rows, fields) {
			if (error) {
				callback();
				return;
			}

			var result = [];
			rows.forEach(function(row) {
				if (!(row.rc_user > 0) && !(row.rc_type < 5)
				//
				&& (!('rc_type' in options)
				//
				|| options.rc_type !== ENUM_rc_type[row.rc_type])) {
					// On wikis using Wikibase the results will otherwise be
					// meaningless.
					return;
				}
				var namespace_text
				//
				= wiki_API.namespace.name_of_NO[row.rc_namespace];
				if (namespace_text) {
					namespace_text = upper_case_initial(namespace_text) + ':';
				}
				// 基本上API盡可能與recentchanges一致。
				result.push({
					type : ENUM_rc_type[row.rc_type],
					// namespace
					ns : row.rc_namespace,
					// .rc_title未加上namespace prefix!
					title : (namespace_text
					// @see normalize_page_name()
					+ row.rc_title.toString()).replace(/_/g, ' '),
					// links to the page_id key in the page table
					// 0: 可能為flow. 此時title為主頁面名，非topic。由.rc_params可獲得相關資訊。
					pageid : row.rc_cur_id,
					// rev_id
					// Links to the rev_id key of the new page revision
					// (after the edit occurs) in the revision table.
					revid : row.rc_this_oldid,
					old_revid : row.rc_last_oldid,
					rcid : row.rc_id,
					user : row.user_name && row.user_name.toString()
					// text of the username for the user that made the
					// change, or the IP address if the change was made by
					// an unregistered user. Corresponds to rev_user_text
					//
					// `rc_user_text` deprecated: MediaWiki version: ≤ 1.33
					|| row.rc_user_text && row.rc_user_text.toString(),
					// NULL for anonymous edits
					userid : row.userid
					// 0 for anonymous edits
					// `rc_user` deprecated: MediaWiki version: ≤ 1.33
					|| row.rc_user,
					// old_length
					oldlen : row.rc_old_len,
					// new length
					newlen : row.rc_new_len,
					// Corresponds to rev_timestamp
					// use new Date(.timestamp)
					timestamp : SQL_timestamp_to_ISO(row.rc_timestamp),
					comment : row.comment && row.comment.toString()
					// `rc_comment` deprecated: MediaWiki version: ≤ 1.32
					|| row.rc_comment && row.rc_comment.toString(),
					// usually NULL
					comment_data : row.comment_data
							&& row.comment_data.toString(),
					// parsedcomment : TODO,
					logid : row.rc_logid,
					// TODO
					logtype : row.rc_log_type,
					logaction : row.rc_log_action.toString(),
					// logparams: TODO: should be {Object}, e.g., {userid:0}
					logparams : row.rc_params.toString(),
					// tags: ["TODO"],

					// 以下為recentchanges之外，本函數額外加入。
					is_new : !!row.rc_new,
					// e.g., 1 or 0
					// is_bot : !!row.rc_bot,
					// is_minor : !!row.rc_minor,
					// e.g., mw.edit
					is_flow : row.rc_source.toString() === 'flow',
					// patrolled : !!row.rc_patrolled,
					// deleted : !!row.rc_deleted,

					row : row
				});
			});
			callback(result);
		},
		// SQL config
		options.config || options.language || options[KEY_SESSION]);
	}

	function get_recent_via_API(callback, options) {
		var session = options && options[KEY_SESSION];
		if (!session) {
			// 先設定一個以方便操作。
			session = new wiki_API(null, null, options.language
					|| default_language);
		}
		// use get_list()
		// 注意: arguments 與 get_list() 之 callback 連動。
		session.recentchanges(callback, options);
	}

	// 一定會提供的功能。
	wiki_API.recent_via_API = get_recent_via_API;
	// 可能會因環境而不同的功能。讓 wiki_API.recent 採用較有效率的實現方式。
	wiki_API.recent = SQL_config ? get_recent_via_databases
			: get_recent_via_API;

	// ----------------------------------------------------

	// 監視最近更改的頁面。
	// 注意: 會改變 options！
	// 注意: options之屬性名不可與wiki_API.recent衝突！
	// 警告: 同時間只能有一隻程式在跑，否則可能會造成混亂！
	function add_listener(listener, options) {
		if (!options) {
			options = Object.create(null);
		} else if (options > 0) {
			options = {
				interval : options
			};
		} else if (typeof options === 'string'
		//
		|| library_namespace.is_RegExp(options)) {
			options = {
				// language : '',
				// title_filter
				title : options
			};
		}

		if (isNaN(options.max_page) || options.max_page >= 1) {
			// normal
		} else {
			throw new Error(
					'add_listener: assert: isNaN(options.max_page) || options.max_page >= 1');
		}

		if (!(options.limit > 0)) {
			// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Brevisions
			options.rvlimit = 500;
		}

		var session = options[KEY_SESSION],
		// @see .SQL_config
		where = options.SQL_options
		//
		|| (options.SQL_options = Object.create(null));
		where = where.where || (where.where = Object.create(null));
		// console.log(session);

		if (!session
		//
		&& (options.with_diff || options.with_content)) {
			// 先設定一個以方便操作。
			session = new wiki_API(null, null, options.language
					|| default_language);
		}

		var use_SQL = SQL_config
		// options.use_SQL: 明確指定 use SQL. use SQL as possibile
		&& (options.use_SQL || !options.parameters
		// 只設定了rcprop
		|| Object.keys(options.parameters).join('') === 'rcprop'), recent_options,
		//
		get_recent = use_SQL ? get_recent_via_databases : get_recent_via_API,
		// 僅取得最新版本。注意: 這可能跳過中間編輯的版本，造成有些修訂被忽略。
		latest_only = 'latest' in options ? options.latest : true;
		if (use_SQL) {
			recent_options = options.SQL_options;
			if (options[KEY_SESSION]) {
				// pass API config
				recent_options[KEY_SESSION] = options[KEY_SESSION];
			}
		} else {
			// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Brecentchanges
			recent_options = {
				// List newest first (default).
				// Note: rcstart has to be later than rcend.
				// rcdir : 'older',
				rcdir : 'newer',

				// new Date().toISOString()
				// rcstart : 'now',
				rctype : 'edit|new'
			};
			if (latest_only) {
				recent_options.rctoponly = 1;
			}
			if (options.parameters) {
				// 警告:這會更動options!
				Object.assign(options.parameters, recent_options);
				recent_options = options;
			} else {
				recent_options = Object.assign({
					parameters : recent_options
				}, options);
			}
			if (recent_options.parameters.rcprop
			// 為了之後設定 last_query_time，因此必須要加上timestamp這一項information。
			&& !recent_options.parameters.rcprop.includes('timestamp')) {
				if (Array.isArray(recent_options.parameters.rcprop))
					recent_options.parameters.rcprop.push('timestamp');
				else if (typeof recent_options.parameters.rcprop)
					recent_options.parameters.rcprop += '|timestamp';
				else
					throw 'Unkonwn rcprop: ' + recent_options.parameters.rcprop;
			}
		}

		var namespace = wiki_API.namespace(options.namespace);
		if (namespace !== undefined) {
			// 不指定namespace，或者指定namespace為((undefined)): 取得所有的namespace。
			if (use_SQL) {
				recent_options.namespace = namespace;
			} else {
				recent_options.parameters.rcnamespace = namespace;
			}
		}

		if (options.type) {
			if (use_SQL) {
				recent_options.type = options.type;
			} else {
				recent_options.parameters.rctype = options.type;
			}
			// TODO: other options
		}

		if (options.with_diff && !options.with_diff.diff
				&& !options.with_diff.with_diff) {
			options.with_diff.diff = true;
		}

		// 注意:
		// {String|Natural}options.start, options.delay:
		// 將會用 CeL.date.to_millisecond() 來解析。
		// 推薦用像是 "2days", "3min", "2d", "3m" 這樣子的方法來表現。
		//
		// {Date}options.start: 從這個時間點開始回溯。
		// {Natural}options.start: 回溯 millisecond 數。
		// {Natural}options.delay > 0: 延遲時間,等待 millisecond 數。

		var delay_ms = library_namespace.to_millisecond(options.delay),
		//
		interval = library_namespace.to_millisecond(options.interval) || 500,
		// assert: {Date}last_query_time start time
		last_query_time,
		// TODO: 僅僅採用 last_query_revid 做控制，不需要偵測是否有重複。 latest_revid
		last_query_revid = options.revid | 0,
		// {String}設定頁面。 注意: 必須是已經轉換過、正規化後的最終頁面標題。
		configuration_page_title = typeof options.adapt_configuration === 'function'
				&& wiki_API.normalize_title(options.configuration_page);

		if (!(delay_ms > 0))
			delay_ms = 0;

		if (library_namespace.is_Date(options.start)) {
			last_query_time = isNaN(options.start.getTime()) ? new Date
					: options.start;
		} else if (options.start
				&& !isNaN(last_query_time = Date.parse(options.start))) {
			last_query_time = new Date(last_query_time);
		} else if ((last_query_time = library_namespace
				.to_millisecond(options.start)) > 0) {
			// treat as time back to 回溯這麼多時間。
			if (last_query_time > library_namespace.to_millisecond('31d')) {
				library_namespace
						.info('add_listener: 2017 CE 最多約可回溯30天。您所指定的時間 ['
								+ options.start + '] 似乎過長了。');
			}
			last_query_time = new Date(Date.now() - last_query_time);
		} else {
			// default: search from NOW
			last_query_time = new Date;
		}

		library_namespace.info('add_listener: 開始監視 / scan '
		//
		+ (session && session.language || default_language)
		//
		+ (session && session.family ? '.' + session.family : '') + ' '
		//
		+ (Date.now() - last_query_time > 100 ?
		//
		library_namespace.age_of(last_query_time, Date.now()) + ' 前開始' : '最近')
				+ '更改的頁面。');

		if (configuration_page_title) {
			library_namespace.info('add_listener: Configuration page: '
					+ wiki_API.title_link_of(configuration_page_title));
		}

		if (false) {
			library_namespace.debug('recent_options: '
			// TypeError: Converting circular structure to JSON
			+ JSON.stringify(recent_options), 1, 'add_listener');
		}

		// 取得頁面資料。
		function receive() {

			function receive_next() {
				// 預防上一個任務還在執行的情況。
				// https://zh.moegirl.org/index.php?limit=500&title=Special%3A%E7%94%A8%E6%88%B7%E8%B4%A1%E7%8C%AE&contribs=user&target=Cewbot&namespace=&tagfilter=&start=2019-08-12&end=2019-08-13
				if (next_task_id) {
					library_namespaceinfo('已經設定過下次任務。可能是上一個任務還在查詢中，或者應該會 timeout？將會清除之前的任務，重新設定任務。');
					// for debug:
					console.log(next_task_id);
					clearTimeout(next_task_id);
				}

				var real_interval_ms = Date.now() - receive_time;
				library_namespace
						.debug('interval from latest receive() starts: '
								+ real_interval_ms + ' ms (' + Date.now()
								+ ' - ' + receive_time + ')', 3, 'receive_next');
				next_task_id = setTimeout(receive,
				// 減去已消耗時間，達到更準確的時間間隔控制。
				Math.max(interval - real_interval_ms, 0));
			}

			var next_task_id = undefined;
			// 上一次執行 receive() 的時間。
			var receive_time = Date.now();

			library_namespace.debug('Get recent change from '
					+ (library_namespace.is_Date(last_query_time)
							&& last_query_time.getTime() ? last_query_time
							.toISOString() : last_query_time)
					+ ', last_query_revid=' + last_query_revid, 1,
					'add_listener.receive');

			// 根據不同的實現方法採用不一樣的因應方式。
			if (use_SQL) {
				if (!library_namespace.is_Date(last_query_time)) {
					// assert: !!(last_query_time)
					// 可能來自"設定成已經取得的最新一個編輯rev。"
					last_query_time = new Date(last_query_time);
				}
				where.timestamp = '>=' + last_query_time
				// MediaWiki format
				.format('%4Y%2m%2d%2H%2M%2S');
				where.this_oldid = '>' + last_query_revid;
				if (delay_ms > 0) {
					where[''] = 'rc_timestamp<='
					// 截止期限。
					+ new Date(Date.now() - delay_ms)
					// MediaWiki format
					.format('%4Y%2m%2d%2H%2M%2S');
				}
			} else {
				// rcend
				recent_options.parameters.rcstart = library_namespace
						.is_Date(last_query_time) ? last_query_time
						.toISOString() : last_query_time;
				if (false) {
					console.log('set rcstart: '
							+ recent_options.parameters.rcstart);
				}
				if (delay_ms > 0) {
					recent_options.parameters.rcend
					// 截止期限。
					= new Date(Date.now() - delay_ms).toISOString();
				}
			}

			get_recent(function(rows) {
				if (!rows) {
					library_namespace.warn((new Date).toISOString()
							+ ': No rows get.');
					return;
				}

				if (false) {
					library_namespace.log(recent_options.parameters
							|| recent_options.SQL_options);
					console.log(rows);
				}

				// 去除之前已經處理過的頁面。
				if (rows.length > 0) {
					// 判別新舊順序。
					var has_new_to_old = rows.length > 1
					// 2019/9/12: 可能有亂序。
					&& rows.some(function(row, index) {
						return index > 0 && rows[index - 1].revid > row.revid;
					});
					if (has_new_to_old) {
						// e.g., use SQL
						library_namespace.debug('判別新舊順序: 有新到舊或亂序: Get '
								+ rows.length + ' recent pages:\n'
								+ rows.map(function(row) {
									return row.revid;
								}), 2, 'add_listener');
						library_namespace.debug('把從新的排列到舊的或亂序轉成從舊的排列到新的。', 1,
								'add_listener');
						// 因可能有亂序，不能光以 .reverse() 轉成 old to new。
						rows.sort(function(row_1, row_2) {
							return row_1.revid - row_2.revid;
						});
					}

					library_namespace.debug(
							'準備去除掉重複的紀錄。之前已處理到 last_query_revid='
									+ last_query_revid + ', 本次取得 '
									+ rows.length + ' record(s). revid: '
									+ rows.map(function(row) {
										return row.revid;
									}), 3);
					// e.g., use API 常常會回傳和上次有重疊的資料
					while (rows.length > 0
					// 去除掉重複的紀錄。因為是從舊的排列到新的，因此從起頭開始去除。
					&& rows[0].revid <= last_query_revid) {
						rows.shift();
					}

					if (rows.length > 0) {
						// assert: options.max_page >= 1
						if (rows.length > options.max_page) {
							// 直接截斷，僅處理到 .max_page。
							rows.truncate(options.max_page);
						}

						// cache the lastest record
						last_query_time = rows[rows.length - 1];
						// 紀錄/標記本次處理到哪。
						// 注意：type=edit會增加revid，其他type似乎會沿用上一個revid。
						last_query_revid = last_query_time.revid;
						last_query_time = last_query_time.timestamp;
						// 確保 {Date}last_query_time
						// last_query_time = new Date(last_query_time);
					}

					// 預設全部都處理完，因此先登記。假如僅處理其中的一部分，屆時再特別登記。
					library_namespace.debug('The lastest record: '
							+ JSON.stringify(last_query_time), 4);
				}
				library_namespace.debug('去除掉重複的紀錄之後 last_query_revid='
						+ last_query_revid + ', ' + rows.length
						+ ' record(s) left. revid: ' + rows.map(function(row) {
							return row.revid;
						}).join(', '), 1);

				// 使 wiki.listen() 可隨時監視設定頁面與緊急停止頁面的變更。
				var configuration_row;
				if (configuration_page_title) {
					// 檢測看看是否有 configuration_page_title
					rows.forEach(function(row, index) {
						if (row.title === configuration_page_title)
							configuration_row = row;
					});
				}
				if (configuration_row) {
					library_namespace.info('add_listener: Configuration page '
							+ wiki_API.title_link_of(configuration_page_title)
							+ ' edited. Re-parse...');
				}

				if (options.filter && rows.length > 0) {
					// TODO: 把篩選功能放到get_recent()，減少資料處理的成本。
					rows = rows.filter(
					// 篩選函數。rcprop必須加上篩選函數需要的資料，例如編輯摘要。
					typeof options.filter === 'function' ? options.filter
					// 篩選標題。警告:從API取得的標題不包括"/"之後的文字，因此最好還是等到之後listener處理的時候，才來對標題篩選。
					: library_namespace.is_RegExp(options.filter)
					// 篩選PATTERN
					? function(row) {
						return row.title && options.filter.test(row.title);
					} : Array.isArray(options.filter) ? function(row) {
						return row.title && options.filter.includes(row.title);
					} : function(row) {
						if (false)
							library_namespace.log([ row.title, options.filter,
							//
							wiki_API.normalize_title(options.filter) ]);
						// assert: typeof options.filter === 'string'
						return row.title
						// treat options.filter as page title
						&& (row.title.includes(options.filter)
						// 區分大小寫
						|| row.title.startsWith(
						//
						wiki_API.normalize_title(options.filter)));
					});
					library_namespace.debug('Get ' + rows.length
							+ ' recent pages after filter:\n'
							+ rows.map(function(row) {
								return row.revid;
							}), 2, 'add_listener');
					// console.log([ row.title, options.filter ]);
				}

				// TODO: configuration_row 應該按照 rows 的順序，
				// 並且假如特別 filter 到設定頁面的時候，那麼設定頁面還是應該要被 listener 檢查。
				if (configuration_row && !rows.includes(configuration_row)) {
					if (library_namespace.is_debug()) {
						library_namespace.debug(
								'unshift configuration_row revid='
										+ configuration_row.revid + ':', 1,
								'add_listener');
						console.log(configuration_row);
					}
					// 保證 configuration_page_title 的變更一定會被檢查到。
					rows.unshift(configuration_row);
				}

				var exit;
				if (rows.length > 0) {
					library_namespace.debug('Get ' + rows.length
							+ ' recent pages:\n' + rows.map(function(row) {
								return row.revid;
							}), 2, 'add_listener');

					// 比較頁面修訂差異。
					if (options.with_diff || options.with_content >= 2) {
						// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Brevisions
						// rvdiffto=prev 已經 parsed，因此仍須自行解析。
						// TODO: test
						// 因為採用.run_serial(.page())，因此約一秒會跑一頁面。
						rows.run_serial(function(run_next, row, index, list) {
							// console.log(row);
							if (!row.pageid) {
								run_next();
								return;
							}

							library_namespace.debug('Get page: ' + index + '/'
									+ rows.length + ' revid=' + row.revid, 2,
									'add_listener.with_diff');

							var page_options = {
								// 這裡的rvstartid指的是新→舊。
								// 偶爾有可能出現: [badid_rvstartid] No revision was
								// found for parameter "rvstartid".
								rvstartid : row.revid
							};
							// or: row.old_revid >= 0
							if (row.old_revid > 0) {
								page_options.rvendid = row.old_revid;
							}

							page_options = Object.assign({
								is_id : true,
								rvlimit : options.with_content >= 3
								// default: 僅取最近的兩個版本作 diff
								? options.with_content : 2,
								// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Brevisions
								parameters : page_options,
								rvprop
								// e.g.,
								// minor:'',anon:''/* e.g., IP user 匿名用戶 */,
								// bot flag: ('bot' in row)
								: 'ids|content|timestamp|user|flags|size'
							}, options.with_diff);

							session.page(row.pageid,
							//
							function(page_data, error) {
								if (exit || !page_data || error) {
									if (error)
										console.error(error);
									run_next();
									return;
								}

								var revisions = page_data.revisions;
								if (latest_only && (!revisions || !revisions[0]
								// 確定是最新版本 revisions[0].revid。
								|| revisions[0].revid !== row.revid)) {
									library_namespace.log(
									//
									'add_listener.with_diff: '
									//
									+ wiki_API.title_link_of(row)
									//
									+ ': 從 recentchanges table 取得的版本 '
									//
									+ row.revid + ' 不同於從頁面內容取得的最新版本 '
									//
									+ (revisions && revisions[0]
									//
									&& revisions[0].revid) + '，跳過這一項。');
									run_next();
									return;
								}

								// merge page data
								Object.assign(row, page_data);

								// console.log(revisions);
								if (revisions && revisions.length >= 1
								//
								&& revisions[0] && revisions[0].timestamp) {
									// 設定成已經取得的最新一個編輯rev。
									last_query_time
									// 確保 {Date}last_query_time
									// = new Date(revisions[0].timestamp);
									= revisions[0].timestamp;
									// last_query_revid = revisions[0].revid;
								}

								// assert: (row.is_new || revisions.length > 1)
								if (revisions && revisions.length >= 1
										&& options.with_diff) {

									// wiki_API.content_of(row, -1);
									var from = revisions.length >= 2
											&& revision_content(
											// select the oldest revision.
											revisions[revisions.length - 1])
											|| '',
									// 解析頁面結構。
									to = revision_content(revisions[0]);

									if (!options.with_diff.line) {
										from = page_parser(from).parse();
										row.from_parsed = from;
										// console.log(from);
										from = from.map(function(token) {
											if (!token && (token !== ''
											// 有時會出意外。
											|| from.length !== 1)) {
												console.log(row);
												throw new Error(row.title);
											}
											return token.toString();
										});

										to = page_parser(row).parse();
										to = to.map(function(token) {
											if (!token && (token !== ''
											//
											|| to.length !== 1)) {
												console.log(row);
												throw new Error(row.title);
											}
											return token.toString();
										});

										// verify parser

										if (revision_content(revisions[0])
										//
										!== to.join('')) {
											console.log(
											//
											revision_content(revisions[0]));
											console.log(to);
											to
											//
											= revision_content(revisions[0]);
											console.log(library_namespace.LCS(
											//
											to, parse_wikitext(to).toString(),
													'diff'));
											throw 'Parser error (to): ' +
											// debug 用. check parser, test
											// if parser working properly.
											wiki_API.title_link_of(page_data);
										}

										if (revisions.length > 1 &&
										//
										revision_content
										//
										(revisions[revisions.length - 1])
										//
										!== from.join('')) {
											console.log(library_namespace.LCS(
											//
											revision_content
											//
											(revisions[revisions.length - 1]),
											//
											from.join(''), 'diff'));
											throw 'Parser error (from): ' +
											// debug 用. check parser, test
											// if parser working properly.
											wiki_API.title_link_of(page_data);
										}
									}

									if (options.with_diff.LCS) {
										row.diff = library_namespace.LCS(from,
												to, options.with_diff);

									} else {
										row.diff = from.diff_with(to,
												options.with_diff);
									}
								}

								if (configuration_row === row) {
									options.adapt_configuration(
									// (page_data)
									parse_configuration(row));
									run_next();
									return;
								}

								if (exit = listener.call(options, row, index,
										rows)) {
									last_query_time = new Date;
								}

								run_next();
							}, page_options);

						}, function() {
							if (!exit) {
								library_namespace.debug(
										'Get next recent pages', 2,
										'add_listener.with_diff');
								receive_next();
							}
						});
						return;
					}

					// use options.with_content as the options of wiki.page()
					if (options.with_content || configuration_row) {
						// TODO: 考慮所傳回之內容過大，i.e. 回傳超過 limit (12 MB)，被截斷之情形。
						session.page(rows.map(function(row) {
							return row.pageid;
						}), function(page_list, error) {
							if (error || !Array.isArray(page_list)) {
								// e.g., 還原編輯
								// wiki_API.page: Unknown response:
								// [{"batchcomplete":""}]
								if (error !== 'Unknown response')
									library_namespace.error(error
											|| 'add_listener: No page got!');
								receive_next();
								return;
							}

							// 配對。
							var page_id_hash = Object.create(null);
							page_list.forEach(function(page_data, index) {
								page_id_hash[page_data.pageid] = page_data;
							});
							exit = rows.some(function(row, index) {
								if (false) {
									console.log('-'.repeat(40));
									console.log(JSON.stringify(row));
									console.log(JSON.stringify(
									//
									page_id_hash[row.pageid]));
								}
								Object.assign(row, page_id_hash[row.pageid]);
								if (configuration_row === row) {
									options.adapt_configuration(
									//
									parse_configuration(row));
									return;
								}
								listener.call(options, row, index, rows);
							});
							// Release memory. 釋放被占用的記憶體。
							page_id_hash = page_list = null;
							if (!exit) {
								receive_next();
							}

						}, Object.assign({
							// rvdiffto : 'prev',
							// rvcontentformat : 'text/javascript',
							is_id : true,
							multi : true
						}, options.with_content));
						return;
					}

					// 除非設定 options.input_Array，否則單筆單筆輸入。
					if (options.input_Array) {
						exit = listener.call(options, rows);
					} else {
						exit = rows.some(listener, options);
					}

				} else if (options.even_empty) {
					// default: skip empty, 除非設定 options.even_empty.
					exit = listener.call(options, options.input_Array ? rows
					// 模擬rows單筆之結構。
					: {
						row : Object.create(null)
					});
				}

				// if listener() return true, the operation will be stopped.
				if (!exit) {
					receive_next();
				}

			}, recent_options);
		}

		receive();
	}

	// wiki.listen()
	wiki_API.listen = add_listener;

	// --------------------------------------------------------------------------------------------

	/**
	 * 取得最新之 Wikimedia dump。
	 * 
	 * TODO: using
	 * /public/dumps/public/zhwiki/latest/zhwiki-latest-pages-articles.xml.bz2
	 * 
	 * @param {String}[wiki_site_name]
	 *            project code name. e.g., 'enwiki'
	 * @param {Function}callback
	 *            回調函數。
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @see https://en.wikipedia.org/wiki/Wikipedia:Database_download#Where_do_I_get_it.3F
	 * 
	 * @inner
	 */
	function get_latest_dump(wiki_site_name, callback, options) {
		if (false && !wmflabs) {
			// 最起碼須有 bzip2, wget 特定版本輸出訊息 @ /bin/sh
			// Wikimedia Toolforge (2017/8 之前舊稱 Tool Labs)
			// https://wikitech.wikimedia.org/wiki/Labs_labs_labs#Toolforge
			throw new Error('Only for Wikimedia Toolforge!');
		}

		if (typeof wiki_site_name === 'function'
				&& typeof callback !== 'function' && !options) {
			// shift arguments
			options = callback;
			callback = wiki_site_name;
			wiki_site_name = null;
		}

		// 正規化並提供可隨意改變的同內容參數，以避免修改或覆蓋附加參數。
		options = library_namespace.new_options(options);

		if (!wiki_site_name) {
			// console.log(options);
			// console.log(options[KEY_SESSION]);
			// throw options[KEY_SESSION].language;
			wiki_site_name = wiki_API.site_name(options[KEY_SESSION]
					|| options.project || options.family);
		}

		// dump host: http "301 Moved Permanently" to https
		var host = options.host || 'https://dumps.wikimedia.org/',
		// e.g., '20160305'.
		latest = options.latest;
		if (!latest) {
			get_URL(
			// Get the latest version.
			host + wiki_site_name + '/', function(XMLHttp) {
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
				get_latest_dump(wiki_site_name, callback, options);
			});
			return;
		}

		var directory = options.directory || './',
		//
		filename = options.filename || wiki_site_name + '-' + latest
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
		wiki_site_name = 'enwiki';
		// directory to restore dump files.
		// 指定 dump file 放置的 directory。
		// e.g., '/shared/cache/', '/shared/dumps/', '~/dumps/'
		// https://wikitech.wikimedia.org/wiki/Help:Toolforge/Developing#Using_the_shared_Pywikibot_files_.28recommended_setup.29
		// /shared/: shared files
		dump_directory = '/shared/cache/'
		filename = wiki_site_name + '-' + latest + '-pages-articles-multistream-index.txt';
		</code>
		 */

		// 若是目標目錄不存在/已刪除則嘗試創建之。
		try {
			node_fs.statSync(directory);
		} catch (e) {
			library_namespace.info('get_latest_dump: 存放 dump file 的目錄['
					+ directory + ']不存在/已刪除，嘗試創建之。');
			node_fs.mkdirSync(directory, parseInt('777', 8));
			node_fs.writeFileSync(directory
					+ '_FEEL_FREE_TO_REMOVE_THIS_DIRECTORY_ANYTIME', '');
			// 若是沒有辦法創建目錄，那就直接throw。
		}

		var data_file_OK;
		try {
			// check if data file exists and big enough
			data_file_OK = node_fs.statSync(directory + filename).size > 1e7;
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
					library_namespace.error(error);
				} else {
					library_namespace.log(
					//
					'get_latest_dump.extract: Done. Running callback...');
				}
				callback(directory + filename);
			});
		}

		var public_dumps_directory = '/public/dumps/public/',
		// search the latest file in the local directory.
		// https://wikitech.wikimedia.org/wiki/Help:Tool_Labs#Dumps
		// 可在 /public/dumps/public/zhwiki/ 找到舊 dumps。 (using `df -BT`)
		// e.g.,
		// /public/dumps/public/zhwiki/20160203/zhwiki-20160203-pages-articles.xml.bz2
		source_directory, archive = options.archive || filename + '.bz2';

		if (wmflabs) {

			source_directory = public_dumps_directory + wiki_site_name + '/'
					+ latest + '/';
			library_namespace.debug('Check if public dump archive exists: ['
					+ source_directory + archive + ']', 1, 'get_latest_dump');
			try {
				// 1e7: Only using the cache when it exists and big enough.
				// So we do not using node_fs.accessSync() only.
				if (node_fs.statSync(source_directory + archive).size > 1e7) {
					library_namespace
							.log('get_latest_dump: Using public dump archive file ['
									+ source_directory + archive + '].');
					extract();
					return;
				}
			} catch (e) {
			}
		}

		// ----------------------------------------------------

		source_directory = directory;

		library_namespace.debug('Check if file exists: [' + source_directory
				+ archive + ']', 1, 'get_latest_dump');
		try {
			if (node_fs.statSync(source_directory + archive).size > 1e7) {
				library_namespace.log('get_latest_dump: Archive ['
						+ source_directory + archive + '] exists.');
				extract();
				return;
			}
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
		host + wiki_site_name + '/' + latest + '/' + archive ]);

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
				library_namespace.error('get_latest_dump: Error code '
						+ error_code);
				// 有時最新版本可能 dump 到一半，正等待中。
				if (options.previous) {
					library_namespace.info(
					// options.previous: latest 的前一個版本。
					'get_latest_dump: Use previous version: ['
							+ options.previous + '].');
					options.latest = options.previous;
					delete options.previous;
					get_latest_dump(wiki_site_name, callback, options);
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
			library_namespace.error('parse_dump_xml: Bad data:\n'
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
			if (filename) {
				library_namespace.log('read_dump: Invalid file path: ['
						+ filename + '], try to get the latest dump file...');
			}
			get_latest_dump(filename, function(filename) {
				read_dump(filename, callback, options);
			}, options);
			// 警告: 無法馬上取得檔案時，將不會回傳任何資訊！
			return;
		}

		options = library_namespace.setup_options(options);

		if (typeof options.first === 'function') {
			options.first(filename);
		}

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
			library_namespace.error('read_dump: Error occurred: ' + error);
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
				library_namespace.error('parse_buffer: Duplicated page id: '
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
				file_stream.end();
				// Release memory. 釋放被占用的記憶體。
				buffer = null;
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
				library_namespace.error(
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

			if (!operation.postfix)
				if (type === 'file')
					operation.postfix = '.txt';
				else if (type === 'URL')
					operation.postfix = '.htm';

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
					wikidata_query(query, callback, operation);
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
					wiki_API_list(title, function(pages) {
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
	wiki_API.cache.abort = {
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
		return operation.type + '/' + remove_namespace(list);
	};

	// --------------------------------------------------------------------------------------------

	if (false) {
		(function() {
			/**
			 * usage of revision_cacher()
			 */

			var
			/** {revision_cacher}記錄處理過的文章。 */
			processed_data = new CeL.wiki.revision_cacher(base_directory
					+ 'processed.' + use_language + '.json');

			function for_each_page(page_data) {
				// Check if page_data had processed useing revid.
				if (processed_data.had(page_data)) {
					// skipped_count++;
					return [ CeL.wiki.edit.cancel, 'skip' ];
				}

				// 在耗費資源的操作後，登記已處理之 title/revid。其他為節省空間，不做登記。
				// 初始化本頁之 processed data: 只要處理過，無論成功失敗都作登記。
				var data_to_cache = processed_data.data_of(page_data);
				// or:
				// 注意: 只有經過 .data_of() 的才造出新實體。
				// 因此即使沒有要取得資料，也需要呼叫一次 .data_of() 以造出新實體、登記 page_data 之 revid。
				processed_data.data_of(page_data);
				processed_data.data_of(title, revid);

				// page_data is new than processed data

				// main task...

				// 成功才登記。失敗則下次重試。
				processed_data.remove(title);

				// 可能中途 killed, crashed，因此尚不能 write_processed()，
				// 否則會把 throw 的當作已處理過。
			}

			function finish_work() {
				// 由於造出 data 的時間過長，可能丟失 token，
				// 因此將 processed_data 放在 finish_work() 階段。
				processed_data.renew();
			}

			function onfail() {
				// 確保沒有因特殊錯誤產生的漏網之魚。
				titles.unique().forEach(processed_data.remove, processed_data);
			}

			// Finally: Write to cache file.
			processed_data.write();
		})();
	}

	/**
	 * 記錄處理過的文章。
	 * 
	 * @param {String}cache_file_path
	 *            記錄處理過的文章。
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @constructor
	 */
	function revision_cacher(cache_file_path, options) {
		this.read(cache_file_path, options);
	}

	revision_cacher.prototype = {
		KEY_DATA : 'data',
		// id or 'revid'
		KEY_ID : 'id',
		encoding : wiki_API.encoding,
		// 連續跳過超過此頁面數 .show_skip 則會顯示訊息。
		show_skip : 9,

		// renew cache data
		renew : function() {
			// Object.create(null)
			this[this.KEY_DATA] = {};
		},
		read : function(cache_file_path, options) {
			if (typeof cache_file_path === 'object' && !options) {
				options = cache_file_path;
				cache_file_path = options.file;
			}
			if (cache_file_path) {
				this.file = cache_file_path;
			}

			var setup_new;
			if (options === true) {
				setup_new = false;
				options = {
					// Do NOT discard old data, use the old one.
					// 保存舊資料不廢棄。
					// 為了預防 this[this.KEY_DATA] 肥大，一般應將舊資料放在 this.cached，
					// 本次新處理的才放在 this[this.KEY_DATA]。
					preserve : true
				};
			} else {
				options = library_namespace.setup_options(options);
				setup_new = !options.preserve;
			}

			// this.options = options;

			// for .id_only, .KEY_ID, .encoding, .show_skip
			Object.assign(this, options);

			// reset skipped_count
			// this.skipped = 0;
			// 連續跳過計數。
			if (this.show_skip > 0) {
				this.continuous_skip = 0;
			}

			/**
			 * {Object}舊資料/舊結果報告。
			 * 
			 * cached_data[local page title] = { this.KEY_ID : 0,
			 * user_defined_data }
			 * 
			 * if set .id_only, then:<br />
			 * cached_data[local page title] = {Natural}revid<br />
			 * 這可進一步減少空間消耗。cached_data cache 已經處理完成操作的 data，但其本身可能也會占用一些以至大量RAM。
			 */
			var cached_data;
			try {
				cached_data = node_fs.readFileSync(cache_file_path,
						this.encoding);
			} catch (e) {
				// nothing get.
			}
			cached_data = cached_data && JSON.parse(cached_data) || {};
			this.cached = cached_data;

			if (setup_new) {
				Object.seal(cached_data);
				this.renew();
			} else {
				// this[this.KEY_DATA]: processed data
				this[this.KEY_DATA] = cached_data;
			}
		},
		write : function(cache_file_path, callback) {
			node_fs.writeFile(cache_file_path || this.file, JSON
					.stringify(this[this.KEY_DATA]), this.encoding, function(
					error) {
				// 因為此動作一般說來不會影響到後續操作，因此採用同時執行。
				library_namespace.debug('Write to cache file: done.', 1,
						'revision_cacher.write');
				if (typeof callback === 'function')
					callback(error);
			});
			return;

			node_fs.writeFileSync(cache_file_path || this.file, JSON
					.stringify(this[this.KEY_DATA]), this.encoding);
			library_namespace.debug('Write to cache file: done.', 1,
					'revision_cacher.write');
			if (typeof callback === 'function')
				callback(error);
		},

		// 注意: 若未 return true，則表示 page_data 為正規且 cache 中沒有，或較 cache 新的頁面資料。
		had : function(page_data) {
			// page_data 為正規?
			if (!page_data || ('missing' in page_data)) {
				// error? 此頁面不存在/已刪除。
				return 'missing';
			}

			var
			/** {String}page title = page_data.title */
			title = wiki_API.title_of(page_data),
			/** {Natural}所取得之版本編號。 */
			revid = wiki_API.content_of.revision(page_data);
			if (revid) {
				revid = revid.revid;
			}

			// console.log(CeL.wiki.content_of(page_data));

			library_namespace.debug(wiki_API.title_link_of(title) + ' revid '
					+ revid, 4, 'revision_cacher.had');
			if (title in this.cached) {
				var this_data = this[this.KEY_DATA], setup_new = this_data !== this.cached,
				//
				cached = this.cached[title], cached_revid = this.id_only ? cached
						: cached[this.KEY_ID];
				library_namespace.debug(wiki_API.title_link_of(title)
						+ ' cached revid ' + cached_revid, 4,
						'revision_cacher.had');
				if (cached_revid === revid) {
					if (setup_new) {
						// copy old data.
						// assert: this_data[title] is modifiable.
						this_data[title] = cached;
					}
					// this.skipped++;
					this.continuous_skip++;
					library_namespace.debug('Skip ' + this.continuous_skip
							+ ': ' + wiki_API.title_link_of(title) + ' revid '
							+ revid, 2, 'revision_cacher.had');
					return true;
				}
				// assert: cached_revid < revid
				// rebuild data
				if (setup_new) {
					delete this_data[title];
				}
				// 因為要顯示連續跳過計數資訊，因此不先跳出。
				// return false;
			}

			if (this.continuous_skip > 0) {
				if (this.continuous_skip > this.show_skip) {
					library_namespace.debug(
					// 實際運用時，很少會到這邊。
					'Skip ' + this.continuous_skip + ' pages.', 1,
							'revision_cacher.had');
				}
				this.continuous_skip = 0;
			}
		},
		// 注意: 只有經過 .data_of() 的才造出新實體。
		// 因此即使沒有要取得資料，也需要呼叫一次 .data_of() 以造出新實體、登記 page_data 之 revid。
		data_of : function(page_data, revid) {
			var this_data = this[this.KEY_DATA],
			/** {String}page title = page_data.title */
			title = typeof page_data === 'string' ? page_data : wiki_API
					.title_of(page_data);

			if (title in this_data) {
				return this_data[title];
			}

			// 登記 page_data 之 revid。
			if (!revid && (!(revid = wiki_API.content_of.revision(page_data))
			/** {Natural}所取得之版本編號。 */
			|| !(revid = revid.revid))) {
				library_namespace.error(
				// 照理來說，會來到這裡的都應該是經過 .had() 確認，因此不該出現此情況。
				'revision_cacher.data_of: No revision id (.revid): ('
						+ (typeof page_data) + ') '
						+ JSON.stringify(page_data).slice(0, 800));
				return;
			}

			if (this.id_only) {
				// 注意: 這個時候回傳的不是 {Object}
				return this_data[title] = revid;
			}

			/** {Object}本頁之 processed data。 */
			var data = this_data[title] = {};
			data[this.KEY_ID] = revid;
			return data;
		},
		remove : function(page_data) {
			var this_data = this[this.KEY_DATA],
			/** {String}page title = page_data.title */
			title = typeof page_data === 'string' ? page_data : wiki_API
					.title_of(page_data);

			if (title in this_data) {
				delete this_data[title];
			}
		}
	};

	// --------------------------------------------------------------------------------------------

	/**
	 * 由 Wikimedia Toolforge 上的 database replication 讀取所有 ns0，且未被刪除頁面最新修訂版本之版本編號
	 * rev_id (包含重定向)。<br />
	 * 從 `page` 之 page id 確認 page 之 namespace，以及未被刪除。然後選擇其中最大的 revision id。
	 * 
	 * should get: { i: page id, r: latest revision id }
	 * 
	 * AND `page`.`page_is_redirect` = 0
	 * 
	 * @type {String}
	 * 
	 * @see https://www.mediawiki.org/wiki/Manual:Page_table#Sample_MySQL_code
	 *      https://phabricator.wikimedia.org/diffusion/MW/browse/master/maintenance/tables.sql
	 */
	var all_revision_SQL = 'SELECT `page`.`page_id` AS `i`, `page`.`page_latest` AS `r` FROM `page` INNER JOIN `revision` ON `page`.`page_latest` = `revision`.`rev_id` WHERE `page`.`page_namespace` = 0 AND `revision`.`rev_deleted` = 0';

	if (false) {
		/**
		 * 採用此 SQL 之極大問題: page.page_latest 並非最新 revision id.<br />
		 * the page.page_latest is not the latest revision id of a page in
		 * Wikimedia Toolforge database replication.
		 */
		all_revision_SQL = 'SELECT `page_id` AS `i`, `page_latest` AS `l` FROM `page` p INNER JOIN `revision` r ON p.page_latest = r.rev_id WHERE `page_namespace` = 0 AND r.rev_deleted = 0';
		/**
		 * 2019/7 deprecated: too late
		 */
		all_revision_SQL = 'SELECT `rev_page` AS `i`, MAX(`rev_id`) AS `r` FROM `revision` INNER JOIN `page` ON `page`.`page_id` = `revision`.`rev_page` WHERE `page`.`page_namespace` = 0 AND `revision`.`rev_deleted` = 0 GROUP BY `rev_page`';
	}
	if (false) {
		// for debug.
		all_revision_SQL += ' LIMIT 8';
	}

	/**
	 * 應用功能: 遍歷所有頁面。 CeL.wiki.traversal()
	 * 
	 * TODO: 配合 revision_cacher，進一步加快速度。
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
			config = Object.create(null);
		} else {
			// 正規化並提供可隨意改變的同內容參數，以避免修改或覆蓋附加參數。
			config = library_namespace.new_options(config);
		}

		if (config.use_dump) {
			library_namespace.debug(
					'use dump only: 僅僅使用 dump，不採用 API 取得最新頁面內容。', 1,
					'traversal_pages');
			// @see process_dump.js
			if (config.use_dump === true) {
				// 這邊的 ((true)) 僅表示要使用，並採用預設值；不代表設定 dump file path。
				config.use_dump = null;
			}
			read_dump(config.use_dump, callback, {
				// 一般來說只會用到 config.last，將在本函數中稍後執行，
				// 因此先不開放 config.first, config.last。

				// options.first(filename) of read_dump()
				// first : config.first,

				// options.last.call(file_stream, anchor, quit_operation)
				// of read_dump()
				// last : config.last,

				// directory to restore dump files.
				// 指定 dump file 放置的 directory。
				// e.g., '/shared/cache/', '/shared/dumps/', '~/dumps/'
				// https://wikitech.wikimedia.org/wiki/Help:Tool_Labs/Developing#Using_the_shared_Pywikibot_files_.28recommended_setup.29
				// /shared/: shared files
				directory : config.dump_directory
			});
			return;
		}

		/** {Array}id/title list */
		var id_list, rev_list,
		//
		use_language = wikidata_get_site(config, true)
		// else use default_language
		|| default_language,
		/** {Object}用在 wiki_API.cache 之 configuration。 */
		cache_config = {
			// all title/id list
			file_name : config.file_name
			// all_pages.*.json 存有當前語言維基百科當前所有的頁面id以及最新版本 (*:當前語言)
			|| traversal_pages.list_file + '.' + use_language + '.json',
			operator : function(list) {
				if (!Array.isArray(list)) {
					throw 'traversal_pages: No list get!';
				}
				if (list.length === 3
						&& JSON.stringify(list[0]) === JSON
								.stringify(traversal_pages.id_mark)) {
					library_namespace.info(
					// cache file 內容來自 The production replicas (database)，
					// 為經過下方 generate_revision_list() 整理過之資料。
					'traversal_pages: 此資料似乎為 page id，來自 production replicas: ['
							+ this.file_name + ']');
					// Skip list[0] = traversal_pages.id_mark
					rev_list = list[2];
					list = list[1];
					// 讀取 production replicas 時，儲存的是 pageid。
					list.is_id = true;
				} else {
					library_namespace
							.error('traversal_pages: cache 檔案未設定 rev_list：可能是未知格式？ '
									+ this.file_name);
				}
				id_list = list;
			}
		};

		if (Array.isArray(config.list)) {
			library_namespace.debug('採用輸入之 list，列表長度 ' + config.list.length
					+ '。', 1, 'traversal_pages');
			cache_config.list = config.list;

		} else if (wmflabs && !config.no_database) {
			library_namespace.debug('若沒有 cache，則嘗試讀取 database 之資料。', 1,
					'traversal_pages');
			cache_config.list = function generate_revision_list() {
				library_namespace.info(
				// Wikimedia Toolforge database replicas.
				'traversal_pages: 嘗試讀取 Wikimedia Toolforge 上之 database replication 資料，'
						+ '一次讀取完所有頁面最新修訂版本之版本號 rev_id...');
				// default: 採用 page_id 而非 page_title 來 query。
				var is_id = 'is_id' in config ? config.is_id : true;
				run_SQL(is_id ? all_revision_SQL
				//
				: all_revision_SQL.replace(/page_id/g, 'page_title'), function(
						error, rows, fields) {
					if (error) {
						library_namespace.error('traversal_pages: '
						//
						+ 'Error reading database replication!');
						library_namespace.error(error);
						config.no_database = error;
						delete config.list;
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
					// 因為已經取得所有列表，重新呼叫traversal_pages()。
					traversal_pages(config, callback);
				}, config && config.SQL_config
				// 光從 use_language 無法獲得如 wikinews 之資訊。
				|| new_SQL_config(config[KEY_SESSION] || use_language));
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
			// 有設定 config[KEY_SESSION] 才能獲得如 bot 之類，一次讀取/操作更多頁面的好處。
			var session = config[KEY_SESSION]
			//
			|| new wiki_API(config.user, config.password, config.language);
			library_namespace.log('traversal_pages: 開始遍歷 '
			// includes redirection 包含重新導向頁面.
			+ (id_list && id_list.length) + ' pages...');

			/**
			 * 工作原理:<code>

			 * 經測試，讀取 file 會比讀取 MariaDB 快，且又更勝於經 API 取得資料。
			 * 經測試，遍歷 xml dump file 約 3分鐘(see process_dump.js)，會比隨機存取快得多。
			 * database replicas @ Wikimedia Toolforge 無 `text` table，因此實際頁面內容不僅能經過 replicas 存取。

			# 先將最新的 xml dump file 下載到本地(實為 network drive)並解開: read_dump()
			# 由 Wikimedia Toolforge database replication 讀取所有 ns0 且未被刪除頁面最新修訂版本之版本號 rev_id (包含重定向): traversal_pages() + all_revision_SQL
			# 遍歷 xml dump file，若 dump 中為最新修訂版本，則先用之 (約 95%)；純粹篩選約需近 3 minutes: try_dump()
			# 經 API 讀取餘下 dump 後近 5% 更動過的頁面內容: traversal_pages() + wiki_API.prototype.work
			# 於 Wikimedia Toolforge，解開 xml 後；自重新抓最新修訂版本之版本號起，網路連線順暢時整個作業時間約 12分鐘。

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

				// Release memory. 釋放被占用的記憶體。
				id_list = rev_list = null;

				if (dump_file === true) {
					// 這邊的 ((true)) 僅表示要使用，並不代表設定 dump file path。
					dump_file = null;
				}
				read_dump(dump_file,
				//
				function(page_data, position, page_anchor) {
					// filter

					// TODO
					if (false && limit > 0 && count > limit) {
						library_namespace.log(count + '筆資料，已到 limit，跳出。');
					}

					if (++count % 1e4 === 0) {
						library_namespace.log(
						// 'traversal_pages: ' +
						estimated_message(position, file_size, start_read_time,
						// e.g.,
						// "2730000 (99%): 21.326 page/ms [[Category:大洋洲火山岛]]"
						count) + '. ' + wiki_API.title_link_of(page_data));
					}

					// ----------------------------
					// Check data.

					if (false) {
						if (!page_data || ('missing' in page_data)) {
							// error? 此頁面不存在/已刪除。
							return [ CeL.wiki.edit.cancel, '條目不存在或已被刪除' ];
						}
						if (page_data.ns !== 0
								&& page_data.title !== 'Wikipedia:サンドボックス') {
							return [ CeL.wiki.edit.cancel,
							// 本作業は記事だけを編集する
							'本作業僅處理條目命名空間或模板或 Category' ];
							throw '非條目: ' + wiki_API.title_link_of(page_data)
							//
							+ '! 照理來說不應該出現 ns !== 0 的情況。';
						}

						/** {Object}revision data. 修訂版本資料。 */
						var revision = page_data && page_data.revisions
								&& page_data.revisions[0],
						/** {Natural}所取得之版本編號。 */
						revid = revision && revision.revid;
						revid = page_data && page_data.revisions
								&& page_data.revisions[0]
								&& page_data.revisions[0].revid;

						/** {String}page title = page_data.title */
						var title = CeL.wiki.title_of(page_data),
						/**
						 * {String}page content, maybe undefined. 條目/頁面內容 =
						 * CeL.wiki.revision_content(revision)
						 */
						content = CeL.wiki.content_of(page_data);

						// 當取得了多個版本:
						// content = CeL.wiki.content_of(page_data, 0);

						// 似乎沒 !page_data.title 這種問題。
						if (false && !page_data.title)
							library_namespace.warn('* No title: [['
									+ page_data.pageid + ']]!');

						// typeof content !== 'string'
						if (!content) {
							return [
									CeL.wiki.edit.cancel,
									'No contents: '
											+ CeL.wiki.title_link_of(page_data)
											// or: 此頁面不存在/已刪除。
											+ '! 沒有頁面內容！' ];
						}

						var last_edit_Date = CeL.wiki.content_of
								.edit_time(page_data);

						// [[Wikipedia:快速删除方针]]
						if (CeL.wiki.revision_content(revision)) {
							// max_length = Math.max(max_length,
							// CeL.wiki.revision_content(revision).length);

							// filter patterns

						} else {
							library_namespace.warn('* No contents: '
									+ CeL.wiki.title_link_of(page_data)
									+ '! 沒有頁面內容！');
						}

						/** {Array}頁面解析後的結構。 */
						var parsed = CeL.wiki.parser(page_data).parse();
						// debug 用.
						// check parser, test if parser working properly.
						if (CeL.wiki.content_of(page_data) !== parsed
								.toString()) {
							console.log(CeL.LCS(CeL.wiki.content_of(page_data),
									parsed.toString(), 'diff'));
							throw 'Parser error: '
									+ CeL.wiki.title_link_of(page_data);
						}

						// using for_each_token()
						parsed.each('link', function(token, index) {
							console.log(token);
						});
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
					session : config[KEY_SESSION],
					// directory to restore dump files.
					directory : config.dump_directory,
					// options.first(filename) of read_dump()
					first : function(xml_filename) {
						dump_file = xml_filename;
						try {
							file_size = node_fs.statSync(xml_filename).size;
						} catch (e) {
							// 若不存在 dump_directory，則會在此出錯。
							if (e.code === 'ENOENT') {
								library_namespace.error('traversal_pages: '
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
					// options.last.call(file_stream, anchor, quit_operation)
					// of read_dump()
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
						// Release memory. 釋放被占用的記憶體。
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
					// 模擬 wiki_API.prototype.work(config) 之config.last()，與之連動。
					// 此處僅能傳入 .work() 在執行 .last() 時提供的 arguments。
					// 但因為 .work() 在執行 .last() 時也沒傳入 arguments，
					// 因此此處亦不傳入 arguments。
					if (typeof config.last === 'function') {
						config.last();
					}
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
					// run this at last.
					// 在wiki_API.prototype.work()工作最後執行此config.last()。
					// config.last(/* no meaningful arguments */)
					// 沒傳入 arguments的原因見前 "config.last();"。
					last : config.last
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
	// https://zh.wikipedia.org/w/api.php?action=query&prop=info&titles=Wikipedia_talk:Flow_tests
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
		var action = normalize_title_parameter(title, options);
		if (!action) {
			throw 'Flow_info: Invalid title: ' + wiki_API.title_link_of(title);
		}

		// [[mw:Extension:StructuredDiscussions/API#Detection]]
		// 'prop=flowinfo' is deprecated. use 'query&prop=info'.
		// The content model will be 'flow-board' if it's enabled.
		action[1] = 'query&prop=info&' + action[1];
		if (!action[0])
			action = action[1];

		wiki_API.query(action, typeof callback === 'function'
		//
		&& function(data) {
			if (library_namespace.is_debug(2)
			// .show_value() @ interact.DOM, application.debug
			&& library_namespace.show_value)
				library_namespace.show_value(data, 'Flow_info: data');

			var error = data && data.error;
			// 檢查伺服器回應是否有錯誤資訊。
			if (error) {
				library_namespace.error('Flow_info: ['
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

			// TODO: data.query.normalized=[{from:'',to:''},...]

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
	 * other contentmodel: "MassMessageListContent"
	 * 
	 * @param {Object}page_data
	 *            page data got from wiki API.
	 * 
	 * @returns {Boolean}是否為 Flow 討論頁面。
	 */
	function is_Flow(page_data) {
		if ('contentmodel' in page_data) {
			// used in prop=info
			return page_data.contentmodel === 'flow-board';
		}

		var flowinfo = page_data &&
		// wiki_API.is_page_data(page_data) &&
		page_data.flowinfo;
		if (flowinfo) {
			// used in prop=flowinfo (deprecated)
			// flowinfo:{flow:{enabled:''}}
			return flowinfo.flow && ('enabled' in flowinfo.flow);
		}

		// e.g., 從 wiki_API.page 得到的 page_data
		if (page_data = wiki_API.content_of.revision(page_data))
			return (page_data.contentmodel || page_data.slots
					&& page_data.slots.main
					&& page_data.slots.main.contentmodel) === 'flow-board';
	}

	/** {Object}abbreviation 縮寫 */
	var Flow_abbreviation = {
		// https://www.mediawiki.org/w/api.php?action=help&modules=flow%2Bview-header
		// 關於討論板的描述。使用 .revision
		header : 'h',
		// https://www.mediawiki.org/w/api.php?action=help&modules=flow%2Bview-topiclist
		// 討論板話題列表。使用 .revisions
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
		if (!is_api_and_title(title)) {
			title = [ options[KEY_SESSION] && options[KEY_SESSION].API_URL,
					title ];
		}

		var page_data;
		if (wiki_API.is_page_data(title[1]))
			page_data = title[1];

		title[1] = 'page=' + encodeURIComponent(wiki_API.title_of(title[1]));

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
				library_namespace.error(
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
				library_namespace.error(
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
		if (Array.isArray(title)) {
			action = [ title[0], action ];
			title = title[1];
		} else if (options[KEY_SESSION]) {
			action = [ options[KEY_SESSION].API_URL, action ];
		}

		if (wiki_API.is_page_data(title))
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
			// notification : 'flow',
			submodule : 'new-topic',
			page : title,
			nttopic : topic,
			ntcontent : text,
			ntformat : 'wikitext'
		};

		edit_topic.copy_keys.forEach(function(key) {
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
				library_namespace.error('edit_topic: ['
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
				library_namespace.error(error);
			}

			if (typeof callback === 'function') {
				// title.title === wiki_API.title_of(title)
				callback(title.title, error, data);
			}
		}, _options, options);
	}

	/** {Array}欲 copy 至 Flow edit parameters 之 keys。 */
	edit_topic.copy_keys = 'summary|bot|redirect|nocreate'.split(',');

	Object.assign(Flow_info, {
		is_Flow : is_Flow,
		page : Flow_page,
		edit : edit_topic
	});

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
		var session = options && options[KEY_SESSION],
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

	// export 導出.

	// @inner
	library_namespace.set_method(wiki_API, {
		KEY_SESSION : KEY_SESSION,
		KEY_HOST_SESSION : KEY_HOST_SESSION,

		API_URL_of_options : API_URL_of_options,
		is_api_and_title : is_api_and_title,
		normalize_title_parameter : normalize_title_parameter,
		add_parameters : add_parameters,
		wmflabs : wmflabs,
		node_fs : node_fs,
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

	// @static
	Object.assign(wiki_API, {
		api_URL : api_URL,
		set_language : set_default_language,

		estimated_message : estimated_message,

		LTR_SCRIPTS : LTR_SCRIPTS,
		PATTERN_LTR : PATTERN_LTR,
		PATTERN_BOT_NAME : PATTERN_BOT_NAME,
		PATTERN_category : PATTERN_category,

		namespace : get_namespace,
		remove_namespace : remove_namespace,
		is_talk_namespace : is_talk_namespace,

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
		unique_list : unique_list,

		parse_dump_xml : parse_dump_xml,
		traversal : traversal_pages,

		Flow : Flow_info,

		revision_cacher : revision_cacher
	});

	return wiki_API;
}
