/**
 * @name CeL function for MediaWiki (Wikipedia / 維基百科): Page
 * 
 * @fileoverview 本檔案包含了 MediaWiki 自動化作業用程式庫的子程式庫。
 * 
 * TODO:<code>


</code>
 * 
 * @since
 */

// More examples: see /_test suite/test.js
// Wikipedia bots demo: https://github.com/kanasimi/wikibot
'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.wiki.page.Page',

	require : 'application.net.wiki.page.',

	// 設定不匯出的子函式。
	no_extend : 'this,*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring
	var wiki_API = library_namespace.application.net.wiki, KEY_SESSION = wiki_API.KEY_SESSION;
	// @inner
	var get_namespace = wiki_API.namespace, upper_case_initial = wiki_API.upper_case_initial;

	var
	/** node.js file system module */
	node_fs = library_namespace.platform.nodejs && require('fs');

	var
	/** {Number}未發現之index。 const: 基本上與程式碼設計合一，僅表示名義，不可更改。(=== -1) */
	NOT_FOUND = ''.indexOf('_');

	// ------------------------------------------------------------------------

	if (false) {
		// call new_Page()
		page = wiki_session.Page(page_title);
		// TODO:
		(page.revision() || page.fetch() || page.read() || page.wikitext())
				.then();
		page.is_biography().then();
		page.backliinks().then();
	}

	function new_Page(page_title, options) {
		var session = this;
		// options = wiki_API.add_session_to_options(session, options);
		var page = new Page(page_title, options, session);
		return page;
	}

	function Page(page_title, options, session) {
		// var session = wiki_API.session_of_options(options);
		// bind session to new Page.
		// wiki_API.add_session_to_options(session, this);

		this[KEY_SESSION] = session;

		var namespace_pattern = session && session.configurations
				&& session.configurations.namespace_pattern
				|| get_namespace.pattern;
		// namespace_pattern matched: [ , namespace, title ]
		var matched = page_title.match(namespace_pattern);

		var namespace_hash = session && session.configurations.namespace_hash
				|| get_namespace.hash;
		// page_data 之 structure 按照 wiki API 本身之 return
		// page_data = {pageid,ns,title,revisions:[{revid,timestamp,'*'}]}
		Object.assign(this, {
			// page name without
			// @see function remove_page_title_namespace(page_title, options)
			// page_name : upper_case_initial(matched ? matched[2] : page_title,
			// options),

			// pageid : 0,

			// namespace_hash[name.toLowerCase()] = namespace_NO;
			// ns : matched ? namespace_hash[matched[1].toLowerCase()] : 0,
			ns : session ? session.namespace(page_title) : wiki_API
					.namespace(page_title),

			// @see function remove_page_title_namespace(page_title, options)
			title : session ? session.normalize_title(page_title) : wiki_API
					.normalize_title(page_title)
		});
	}

	// ------------------------------------------------------------------------

	// export 導出.

	Object.assign(wiki_API.prototype, {
		Page : new_Page
	});

	Object.assign(Page.prototype, {
	//
	});

	return Page;
}
