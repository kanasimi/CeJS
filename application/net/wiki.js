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
[[m:Special:OAuthConsumerRegistration/propose]] (using an owner-only consumers) get (consumer_key, consumer_secret, access_token, access_secret)

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
mediaWiki.loader.load('https://kanasimi.github.io/CeJS/ce.js')
CeL.run('application.net.wiki');
CeL.wiki.page('Wikipedia:機器人',function(page_data){console.log(page_data);},{redirects:true,section:0})

// wikibits從2013年就棄用
// https://www.mediawiki.org/wiki/ResourceLoader/Legacy_JavaScript#wikibits.js
// NG: importScript('User:cewbot/*.js');

你可以在維基媒體的wiki網站URL最後增加?safemode=1來關閉你個人的CSS和JavaScript。範例：https://zh.wikipedia.org/wiki/文學?safemode=1。上面一行意思是你可以測試是否是你的使用者腳本或套件造成問題，而不必解除安裝。

</code>
 * 
 * @see https://github.com/siddharthvp/mwn
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
	 * TODO: new wiki_API(API_URL || login_options);<br />
	 * wiki_session.login(user_name, password, API_URL);
	 * 
	 * @param {String}user_name
	 *            user name
	 * @param {String}password
	 *            user password
	 * @param {String}[API_URL]
	 *            language code or API Endpoint URL
	 * 
	 * @returns {wiki_API} wiki site API
	 * @template wiki_API
	 * 
	 * @constructor
	 */
	function wiki_API(user_name, password, API_URL) {
		if (!this || this.constructor !== wiki_API) {
			return wiki_API.query.apply(null, arguments);
		}

		// TODO: this.login(user_name, password, API_URL);

		var login_options;
		if (API_URL && typeof API_URL === 'object') {
			// session = new wiki_API(user_name, password, login_options);
			login_options = API_URL;
			API_URL = null;
		} else if (!API_URL && !password && user_name
				&& typeof user_name === 'object') {
			// session = new wiki_API(login_options);
			login_options = user_name;
			user_name = null;
			// console.log(login_options);
		} else {
			login_options = Object.create(null);
		}

		user_name = user_name || login_options.user_name;
		password = password || login_options.password;
		API_URL = API_URL || login_options.API_URL/* || login_options.project */;

		// console.trace([ user_name, password, API_URL ]);
		library_namespace.debug('URL of service endpoint: ' + API_URL
				+ ', default language: ' + wiki_API.language, 3, 'wiki_API');

		// action queue 佇列。應以 append，而非整個換掉的方式更改。
		this.actions = [];
		// @see wiki_API.prototype.next
		if (login_options.is_running) {
			// Is calling from wiki_API.login()
			// login 前便執行其他作業，可能導致 Session=deleted。 e.g., running
			// login_options.configuration_adapter() @ 20201008.fix_anchor.js
			if (typeof login_options.is_running === 'string')
				this.actions.unshift([ login_options.is_running ]);
			// 執行權交給 wiki_API.login()。
			this.running = true;
		}

		// 權杖
		this.token = {
			// lgusername
			lgname : user_name,
			// user_password
			lgpassword : password
		};

		// console.trace(API_URL);
		if (!API_URL && !('language' in this)
		// wikidata 不設定 language。
		&& !this[wiki_API.KEY_HOST_SESSION]) {
			API_URL = wiki_API.language;
			// 假若未設定 API_URL 或 user_name，那就不初始化。等 .login 才初始化。
			// 若想基本的初始化，最起碼必須設定 API_URL。
			login_options.need_initialize = password && user_name;
		} else if (!('need_initialize' in login_options)) {
			login_options.need_initialize = true;
		}

		if ('use_SQL' in login_options) {
			this.use_SQL = login_options.use_SQL;
		} else if (API_URL
		// assert: typeof API_URL === 'string'
		&& API_URL.includes('://')) {
			// assert: Not MediaWiki server. Is outer server.
			this.use_SQL = false;
		}

		// console.trace(API_URL);
		// setup session, as wiki site of pywikibot.Site().
		if (API_URL) {
			// e.g., 'cmn'
			if (API_URL in wiki_API.language_code_to_site_alias)
				API_URL = wiki_API.language_code_to_site_alias[API_URL];
			wiki_API.setup_API_language(this /* session */, API_URL);
			wiki_API.setup_API_URL(this /* session */, API_URL);
		}

		[ 'site_name', 'data_API_URL', 'SPARQL_API_URL',
		// Must after wiki_API.setup_API_language()!
		'language' ]
		//
		.forEach(function(property) {
			if (property in login_options)
				this[property] = login_options[property];
		}, this);
		// console.trace(this);

		this.general_parameters = Object.clone(wiki_API.general_parameters);
		library_namespace.import_options(login_options,
		// @see CeL.application.net.wiki.namespace
		wiki_API.general_parameters_normalizer, this.general_parameters);
		if (library_namespace.is_WWW(true) && window.location
		// For non-authenticated requests, specify the value *. This
		// will cause the Access-Control-Allow-Origin header to be set,
		// but Access-Control-Allow-Credentials will be false and all
		// user-specific data will be restricted.
		&& this.general_parameters.origin !== '*') {
			var host;
			if (!window.location.host
			// e.g., locale file: window.location.host===""
			|| (host = new URL(this.API_URL).host)
					&& host !== window.location.host
					&& host !== this.general_parameters.origin) {
				library_namespace.warn([ 'wiki_API: ', {
					// gettext_config:{"id":"you-may-need-to-set-$1-=-$2"}
					T : [ 'You may need to set %1 = %2!',
					//
					'.origin', JSON.stringify(host) ]
				} ]);
			}
		}

		if (login_options.localStorage_prefix_key && wiki_API.has_storage) {
			// assert: typeof login_options.localStorage_prefix_key === 'string'
			// ||
			// typeof login_options.localStorage_prefix_key === 'number'
			this.localStorage_prefix = [ library_namespace.Class,
					wiki_API.site_name(this),
					login_options.localStorage_prefix_key, '' ]
			// '.'
			.join(library_namespace.env.module_name_separator);
		}

		// ------------------------------------------------
		// pre-loading functions

		// https://stackoverflow.com/questions/39007637/javascript-set-vs-array-performance
		// https://jsbench.me/3pkjlwzhbr/1

		// .API_parameters[modules.path].parameter_Map = parameter Map
		// @see get_API_parameters()
		this.API_parameters = Object.create(null);
		// wiki_session.redirects_data[redirect_from] = {String}redirect_to
		// = main page title without "Template:" prefix
		// @see CeL.application.net.wiki.task ,
		// CeL.application.net.wiki.namespace
		this.redirects_data = Object.create(null);
		// 不存在的頁面。 non-existent pages
		this.nonexistent_pages = Object.create(null);

		// @see wiki_API.check_stop()
		this.task_control_status = Object.create(null);
		// @see wiki_API.prototype.next
		this.checking_stop_now = Object.create(null);

		if (login_options.need_initialize) {
			this.run_after_initializing = [];
			// 注意: new wiki_API() 後之操作，應該採 wiki_session.run()
			// 的方式，確保此時已經執行過 pre-loading functions @ function wiki_API():
			// wiki_session.siteinfo(), wiki_session.adapt_task_configurations()
			this.run(initialize_wiki_API, login_options);
		} else {
			// e.g.,
			// wiki = new CeL.wiki; ...; wiki.login(login_options);
		}
	}

	function initialize_wiki_API(options) {
		var session = this;
		// console.trace(session.actions);
		// console.trace(session.running);

		// if (session.API_URL)
		session.siteinfo(load_template_functions);
		// console.trace(session.actions);
		// console.trace(session.running);

		function load_template_functions() {
			// console.trace(session);
			// @see CeL.application.net.wiki.template_functions
			if (session.load_template_functions)
				session.load_template_functions(null,
				//
				adapt_task_configurations);
			else
				adapt_task_configurations();
		}

		function adapt_task_configurations() {
			// console.trace(options);
			if (options.task_configuration_page) {
				session.adapt_task_configurations(
						options.task_configuration_page,
						function(configuration) {
							// console.trace(configuration);
							if (options.configuration_adapter)
								options.configuration_adapter(configuration);
							initialization_complete();
						});
			} else {
				initialization_complete();
			}
		}

		function initialization_complete() {
			library_namespace.debug(wiki_API.site_name(session) + ': '
					+ '初始化程序登錄完畢。' + '添加之前登錄的 ' + session.actions.length
					+ ' 個程序到佇列中。', 1, 'initialization_complete');
			session.actions.append(session.run_after_initializing);
			delete session.run_after_initializing;
			// console.trace(session.actions);
		}
	}
	initialize_wiki_API.is_initializing_process = true;

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

	if (library_namespace.is_WWW(true) && typeof mw === 'object' && mw
			&& typeof mw.config === 'object'
			&& typeof mw.config.get === 'function'
			&& typeof mediaWiki === "object" && mediaWiki === mw) {
		wiki_API.mw_web_session = true;
	}

	// 等執行再包含入必須的模組。
	this.finish = function(name_space, waiting, sub_modules_to_full_module_path) {
		var sub_modules = [ 'namespace', 'parser', 'query', 'page',
				'page.Page', 'Flow', 'list', 'edit', 'task', 'parser.wikitext',
				'parser.section', 'parser.misc', 'parser.evaluate' ];

		// ------------------------------------------------------------------------
		// auto import SQL 相關函數 @ Toolforge。

		// function setup_wmflabs()

		// only for node.js.
		if (library_namespace.platform.nodejs) {
			/** {String}Wikimedia Toolforge name. CeL.wiki.wmflabs */
			wiki_API.wmflabs =
			// inside Toolforge/Kubernetes
			// https://wikitech.wikimedia.org/wiki/Help:Toolforge/Kubernetes
			library_namespace.env.TOOL_DATA_DIR
			// 2023/12 將作業從 Grid Engine 遷移到 Kubernetes
			// https://github.com/kanasimi/wikibot/issues/50
			&& library_namespace.env.KUBERNETES_PORT
			//
			// https://wikitech.wikimedia.org/wiki/Help:Toolforge/FAQ#How_can_I_detect_if_I.27m_running_in_Cloud_VPS.3F_And_which_project_.28tools_or_toolsbeta.29.3F
			|| require('fs').existsSync('/etc/wmflabs-project')
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
		library_namespace.debug({
			T :
			// gettext_config:{"id":"load-the-main-functions-and-necessary-dependencies-to-operate-mediawiki"}
			'Load the main functions and necessary dependencies to operate MediaWiki.'
		}, 1, 'wiki_API');
		// library_namespace.set_debug(2);
		library_namespace.run(sub_modules_to_full_module_path(sub_modules),
		// The `wiki_API.mw_web_session` is a session that operates in a web
		// environment. For example, the Wikipedia widget.
		function() {
			if (wiki_API.mw_web_session) {
				wiki_API.mw_web_session = new wiki_API({
					API_URL :
					// mediaWiki.config.get('wgServer')
					location.origin
					// https://www.mediawiki.org/wiki/Manual:$wgScriptPath
					+ mediaWiki.config.get('wgScriptPath')
					// https://www.mediawiki.org/wiki/Manual:Api.php
					+ '/api.php',
					localStorage_prefix_key : 'mw_web_session'
				});
				// fill tokens
				for ( var token_name in mediaWiki.user.tokens.values) {
					wiki_API.mw_web_session.token[
					// 'csrfToken' → 'csrftoken'
					token_name.toLowerCase()]
					//
					= mediaWiki.user.tokens.values[token_name];
				}
				// 預設對所有網站會使用相同的 cookie

				// @see
				// https://doc.wikimedia.org/mediawiki-core/master/js/#!/api/mw.Api
			}
			library_namespace.debug({
				// gettext_config:{"id":"all-wiki-submodules-are-loaded"}
				T : 'All wiki submodules are loaded.'
			}, 1, 'wiki_API');
		}, waiting);
		return waiting;
	};

	return wiki_API;
}
