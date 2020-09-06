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
	// CeL.date.String_to_Date(), Julian_day(), .to_millisecond(): CeL.data.date
	+ '|data.date.',

	// 設定不匯出的子函式。
	no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring

	// --------------------------------------------------------------------------------------------

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
			API_URL = options.API_URL/* || options.project */;
		} else if (!API_URL && !password && user_name
				&& typeof user_name === 'object') {
			// session = new wiki_API(options);
			options = user_name;
			// console.log(options);
			user_name = options.user_name;
			password = options.password;
			API_URL = options.API_URL/* || options.project */;
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
			// user_password
			lgpassword : password
		};

		// action queue 佇列。應以 append，而非整個換掉的方式更改。
		this.actions = [];

		// 紀錄各種後續檢索用索引值。應以 append，而非整個換掉的方式更改。
		// 對舊版本須用到 for (in .next_mark)
		this.next_mark = Object.create(null);

		if (!API_URL && !('language' in this)
		// wikidata 不設定 language。
		&& !this.is_wikidata) {
			API_URL = wiki_API.language;
		}

		// console.trace(API_URL);
		// setup session.
		if (API_URL) {
			wiki_API.setup_API_language(this /* session */, API_URL);
			wiki_API.setup_API_URL(this /* session */, API_URL);
		}

		// ------------------------------------------------
		// pre-loading functions

		this.siteinfo();

		// console.log(options);
		if (options.task_configuration_page) {
			this.adapt_task_configurations(options.task_configuration_page,
					options.configuration_adapter);
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

	// ------------------------------------------------------------------------

	// export 導出.

	// @static
	Object.assign(wiki_API, {
		is_wiki_API : is_wiki_API
	});

	// 等執行再包含入必須的模組。
	this.finish = function(name_space, waiting) {
		var sub_modules = [ 'namespace', 'parser', 'query', 'page', 'Flow',
				'list', 'edit', 'task' ];

		// ------------------------------------------------------------------------
		// auto import SQL 相關函數 @ Toolforge。

		// function setup_wmflabs()

		// only for node.js.
		// https://wikitech.wikimedia.org/wiki/Help:Toolforge/FAQ#How_can_I_detect_if_I.27m_running_in_Cloud_VPS.3F_And_which_project_.28tools_or_toolsbeta.29.3F
		if (library_namespace.platform.nodejs) {
			/** {String}Wikimedia Toolforge name. CeL.wiki.wmflabs */
			wiki_API.wmflabs = require('fs').existsSync('/etc/wmflabs-project')
			// e.g., 'tools-bastion-05'.
			// if use `process.env.INSTANCEPROJECT`,
			// you may get 'tools' or 'tools-login'.
			&& (library_namespace.env.INSTANCENAME
			// 以 /usr/bin/jsub 執行時可得。
			// e.g., 'tools-exec-1210.eqiad.wmflabs'
			|| library_namespace.env.HOSTNAME || true);
		}

		if (wiki_API.wmflabs) {
			// import CeL.application.net.wiki.Toolforge
			sub_modules.push('Toolforge');
		}

		// --------------------------------------------------------------------

		// Essential dependency chain
		library_namespace.debug('載入操作維基百科的主要功能 / 必要的依賴鍊。', 1, 'wiki_API');
		// library_namespace.set_debug(2);
		var module_name_prefix = this.id + '.';
		library_namespace.run(sub_modules.map(function(module) {
			return module_name_prefix + module;
		}),
		// function() { library_namespace.info('wiki_API: Loaded.'); },
		waiting);
		return true;
	};

	return wiki_API;
}
