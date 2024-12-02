/**
 * @name CeL function for MediaWiki (Wikipedia / 維基百科): 特色內容特設功能。
 * 
 * 注意: 本程式庫必須應各wiki特色內容改動而改寫。
 * 
 * @fileoverview 本檔案包含了 MediaWiki 自動化作業用程式庫的子程式庫。
 * 
 * @example <code>

CeL.run('application.net.wiki.featured_content');
wiki.get_featured_content('FFA', function(FC_data_hash) {});
wiki.get_featured_content('GA', function(FC_data_hash) {});
wiki.get_featured_content('FA', function(FC_data_hash) {});
wiki.get_featured_content('FL', function(FC_data_hash) {});

</code>
 * 
 * @since 2020/1/22 9:18:43
 */

// Wikipedia bots demo: https://github.com/kanasimi/wikibot
'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.wiki.featured_content',

	require : 'data.native.' + '|application.net.wiki.'
	// load MediaWiki module basic functions
	+ '|application.net.wiki.namespace.'
	// for to_exit
	+ '|application.net.wiki.parser.'
	//
	+ '|application.net.wiki.page.|application.net.wiki.list.',

	// 設定不匯出的子函式。
	no_extend : 'this,*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {
	// requiring
	var wiki_API = library_namespace.application.net.wiki, KEY_SESSION = wiki_API.KEY_SESSION;
	// @inner
	// var is_api_and_title = wiki_API.is_api_and_title,
	// normalize_title_parameter = wiki_API.normalize_title_parameter;

	var to_exit = wiki_API.parser.parser_prototype.each.exit;

	// --------------------------------------------------------------------------------------------

	function featured_content() {
	}

	function get_parsed(page_data) {
		if (!page_data)
			return;

		var parsed = typeof page_data.each === 'function'
		// `page_data` is parsed data
		? page_data : wiki_API.parser(page_data);

		return parsed;
	}

	// ------------------------------------------------------------------------

	/** 特色內容為列表 */
	var KEY_IS_LIST = 'is_list';
	/** 為已撤銷的特色內容 */
	var KEY_ISFFC = 'is_former';
	/** 特色內容類別 */
	var KEY_CATEGORY = 'category';
	/** 指示用。會在 parse_each_zhwiki_FC_item_list_page() 之後就刪除。 */
	var KEY_LIST_PAGE = 'list page';

	function remove_KEY_LIST_PAGE(FC_data_hash) {
		for ( var title in FC_data_hash) {
			delete FC_data_hash[title][KEY_LIST_PAGE];
		}
	}

	var featured_content_configurations = {
		zhwiki : {
			// @see [[Category:特色内容]]
			list_source : {
				FA : '典范条目',
				FL : '特色列表',
				FP : '特色图片',
				GA : '優良條目',
			},
			get_FC : /* get_zhwiki_FC_via_list_page */get_FC_via_category
		},
		jawiki : {
			// @see [[ja:Category:記事の選考]]
			list_source : {
				FA : 'ウィキペディア 秀逸な記事',
				FL : 'ウィキペディア 秀逸な一覧',
				FP : 'ウィキペディア 秀逸な画像',
				GA : 'ウィキペディア 良質な記事'
			},
			get_FC : get_FC_via_category
		},
		enwiki : {
			// @see [[en:Category:Featured content]]
			list_source : {
				FFA : {
					page : 'Wikipedia:Former featured articles',
					handler : parse_enwiki_FFA
				},
				DGA : 'Delisted good articles',
				FA : 'Featured articles',
				FL : 'Featured lists',
				FP : 'Featured pictures',
				FT : 'Featured topics',
				GA : 'Good articles'
			},
			get_FC : get_FC_via_category
		}
	};

	function get_site_configurations(session) {
		// e.g., 'zhwiki'
		var site_name = wiki_API.site_name(session);
		var FC_configurations = featured_content_configurations[site_name];
		return FC_configurations;
	}

	// @see 20190101.featured_content_maintainer.js
	// 注意: 這邊尚未處理 redirects 的問題!!
	function parse_each_zhwiki_FC_item_list_page(page_data, redirects_to_hash,
			sub_FC_list_pages) {
		var using_GA = options.type === 'GA';
		/** {String}將顯示的類型名稱。 */
		var TYPE_NAME = using_GA ? '優良條目' : '特色內容';
		/** {Array}錯誤記錄 */
		var error_logs = [];
		var FC_data_hash = this.FC_data_hash
		// FC_data_hash[redirected FC_title] = { FC_data }
		|| (this.FC_data_hash = Object.create(null));

		/**
		 * {String}page title = page_data.title
		 */
		var title = wiki_API.title_of(page_data);
		/**
		 * {String}page content, maybe undefined. 條目/頁面內容 =
		 * wiki_API.revision_content(revision)
		 */
		var content = wiki_API.content_of(page_data);
		//
		var matched;
		/** 特色內容為列表 */
		var is_list = /list|列表/.test(title)
		// e.g., 'Wikipedia:FL'
		|| /:[DF]?[FG]L/.test(page_data.original_title || title),
		// 本頁面為已撤消的條目列表。注意: 這包含了被撤銷後再次被評為典範的條目。
		is_FFC = [ page_data.original_title, title ].join('|');

		// 對於進階的條目，採用不同的 is_FFC 表示法。
		is_FFC = using_GA && /:FF?A/.test(is_FFC) && 'UP'
				|| /:[DF][FG][AL]|已撤消的|已撤销的/.test(is_FFC);

		if (is_FFC) {
			// 去掉被撤銷後再次被評為典範的條目/被撤銷後再次被評為特色的列表/被撤銷後再次被評選的條目
			content = content.replace(/\n== *(?:被撤銷後|被撤销后)[\s\S]+$/, '');
		}

		// 自動偵測要使用的模式。
		function test_pattern(pattern, min) {
			var count = 0, matched;
			while (matched = pattern.exec(content)) {
				if (matched[1] && count++ > (min || 20)) {
					return pattern;
				}
			}
		}

		var catalog,
		// matched: [ all, link title, display, catalog ]
		PATTERN_Featured_content = test_pattern(
		// @see [[Template:FA number]] 被標記為粗體的條目已經在作為典範條目時在首頁展示過
		// 典範條目, 已撤銷的典範條目, 已撤销的特色列表: '''[[title]]'''
		// @see PATTERN_category
		/'''\[\[([^{}\[\]\|<>\t\n#�]+)(?:\|([^\[\]\|�]*))?\]\]'''|\n==([^=].*?)==\n/g)
				// 特色列表: [[:title]]
				|| test_pattern(/\[\[:([^{}\[\]\|<>\t\n#�]+)(?:\|([^\[\]\|�]*))?\]\]|\n==([^=].*?)==\n/g)
				// 優良條目轉換到子頁面模式: 警告：本頁中的所有嵌入頁面都會被機器人當作優良條目的分類列表。請勿嵌入非優良條目的分類列表。
				|| test_pattern(/{{(Wikipedia:[^{}\|]+)}}/g, 10)
				// 優良條目子分類列表, 已撤消的優良條目: all links NOT starting with ':'
				|| /\[\[([^{}\[\]\|<>\t\n#�:][^{}\[\]\|<>\t\n#�]*)(?:\|([^\[\]\|�]*))?\]\]|\n===([^=].*?)===\n/g;
		library_namespace.log(wiki_API.title_link_of(title)
				+ ': '
				+ (is_FFC ? 'is former'
						+ (is_FFC === true ? '' : ' (' + is_FFC + ')')
						: 'NOT former') + ', '
				+ (is_list ? 'is list' : 'is article') + ', using pattern '
				+ PATTERN_Featured_content);

		// reset pattern
		PATTERN_Featured_content.lastIndex = 0;
		// 分類/類別。
		if (matched = title.match(/\/(?:分類|分类)\/([^\/]+)/)) {
			catalog = matched[1];
		}

		if (false) {
			library_namespace.log(content);
			console.log([ page_data.original_title || title, is_FFC, is_list,
					PATTERN_Featured_content ]);
		}
		while (matched = PATTERN_Featured_content.exec(content)) {
			// 還沒繁簡轉換過的標題。
			var original_FC_title = wiki_API.normalize_title(matched[1]);

			if (matched.length === 2) {
				sub_FC_list_pages.push(original_FC_title);
				continue;
			}

			// assert: matched.length === 4

			if (matched[3]) {
				// 分類/類別。
				catalog = matched[3].replace(/<\!--[\s\S]*?-->/g, '').trim()
						.replace(/\s*（\d+）$/, '');
				continue;
			}

			// 去除並非文章，而是工作連結的情況。 e.g., [[File:文件名]], [[Category:维基百科特色内容|*]]
			if (this.namespace(original_FC_title, 'is_page_title') !== 0) {
				continue;
			}

			// 轉換成經過繁簡轉換過的最終標題。
			var FC_title = redirects_to_hash
					&& redirects_to_hash[original_FC_title]
					|| original_FC_title;

			if (FC_title in FC_data_hash) {
				// 基本檢測與提醒。
				if (FC_data_hash[FC_title][KEY_ISFFC] === is_FFC) {
					library_namespace.warn(
					//
					'parse_each_zhwiki_FC_item_list_page: Duplicate '
							+ TYPE_NAME + ' title: ' + FC_title + '; '
							+ JSON.stringify(FC_data_hash[FC_title]) + '; '
							+ matched[0]);
					error_logs.push(wiki_API.title_link_of(title)
							+ '有重複條目: '
							+ wiki_API.title_link_of(original_FC_title)
							+ (original_FC_title === FC_title ? '' : ', '
									+ wiki_API.title_link_of(FC_title)));
				} else if (!!FC_data_hash[FC_title][KEY_ISFFC] !== !!is_FFC
						&& (FC_data_hash[FC_title][KEY_ISFFC] !== 'UP' || is_FFC !== false)) {
					error_logs
							.push(wiki_API.title_link_of(FC_title)
									+ ' 被同時列在了現存及已撤銷的'
									+ TYPE_NAME
									+ '清單中: '
									+ wiki_API.title_link_of(original_FC_title)
									+ '@'
									+ wiki_API.title_link_of(title)
									+ ', '
									+ wiki_API
											.title_link_of(FC_data_hash[FC_title][KEY_LIST_PAGE][1])
									+ '@'
									+ wiki_API
											.title_link_of(FC_data_hash[FC_title][KEY_LIST_PAGE][0]));
					library_namespace.error(wiki_API.title_link_of(FC_title)
							+ ' 被同時列在了現存及已撤銷的' + TYPE_NAME + '清單中: ' + is_FFC
							+ '; ' + JSON.stringify(FC_data_hash[FC_title]));
				}
			}
			var FC_data = FC_data_hash[FC_title] = Object.create(null);
			FC_data[KEY_IS_LIST] = is_list;
			FC_data[KEY_ISFFC] = is_FFC;
			if (catalog)
				FC_data[KEY_CATEGORY] = catalog;
			FC_data[KEY_LIST_PAGE] = [ title, original_FC_title ];
		}

		return error_logs;
	}

	function get_zhwiki_FC_via_list_page(options, callback) {
		var session = this;
		var using_GA = options.type === 'GA';
		var FC_list_pages = (using_GA ? 'WP:GA' : 'WP:FA|WP:FL').split('|');
		var Former_FC_list_pages = (using_GA ? 'WP:DGA|WP:FA|WP:FFA'
				: 'WP:FFA|WP:FFL').split('|');
		var page_options = {
			redirects : 1,
			multi : true
		};

		this.page(FC_list_pages.concat(Former_FC_list_pages), function(
				page_data_list) {
			var sub_FC_list_pages = [];
			page_data_list.forEach(function(page_data) {
				parse_each_zhwiki_FC_item_list_page.call(session, page_data,
						options.redirects_to_hash, sub_FC_list_pages);
			});

			if (sub_FC_list_pages.length === 0) {
				remove_KEY_LIST_PAGE(session.FC_data_hash);
				callback && callback(session.FC_data_hash);
				return;
			}

			session.page(sub_FC_list_pages, function(page_data_list) {
				page_data_list.forEach(function(page_data) {
					parse_each_zhwiki_FC_item_list_page.call(session,
							page_data, options.redirects_to_hash);
				});
				remove_KEY_LIST_PAGE(session.FC_data_hash);
				callback && callback(session.FC_data_hash);
			}, page_options);
		}, page_options);
	}

	// ------------------------------------------------------------------------

	function parse_enwiki_FFA(page_data, type_name) {
		/**
		 * {String}page content, maybe undefined. 條目/頁面內容 =
		 * wiki_API.revision_content(revision)
		 */
		var content = wiki_API.content_of(page_data);
		content = content.replace(/^[\s\S]+?\n(==.+?==)/, '$1')
		// remove == Former featured articles that have been re-promoted ==
		.replace(/==\s*Former featured articles.+?==[\s\S]*$/, '');
		var FC_data_hash = this.FC_data_hash;
		var PATTERN_Featured_content = /\[\[(.+?)\]\]/g, matched;
		while (matched = PATTERN_Featured_content.exec(content)) {
			var FC_title = matched[1];
			var FC_data = FC_data_hash[FC_title];
			if (FC_data) {
				if (!FC_data.types.includes(type_name)) {
					// 把重要的放在前面。
					FC_data.types.unshift(type_name);
				}
				// Do not overwrite
				continue;
			}

			FC_data = FC_data_hash[FC_title] = {
				type : type_name,
				types : [ type_name ]
			};
			FC_data[KEY_ISFFC] = true;
			// FC_data[KEY_IS_LIST] = is_list;
		}
	}

	// ------------------------------------------------------------------------

	function normalize_type_name(type) {
		return type;
	}

	function get_FC_via_category(options, callback) {
		var FC_configurations = get_site_configurations(this);

		var type_name = normalize_type_name(options.type);
		var list_source = FC_configurations.list_source[type_name];
		// console.trace([ FC_configurations, type_name, list_source ]);
		if (!list_source) {
			// library_namespace.error('get_FC_via_category: ' + error);
			callback && callback(null, !options.ignore_missed && new Error('Unknown type: ' + options.type));
			return;
		}

		// ----------------------------

		var FC_data_hash = this.FC_data_hash
		// FC_data_hash[redirected FC_title] = { FC_data }
		|| (this.FC_data_hash = Object.create(null));

		// ----------------------------

		var session = this;
		if (list_source.page) {
			this.page(list_source.page, function(page_data) {
				list_source.handler.call(session, page_data, type_name);
				callback && callback(FC_data_hash);
			});
			return;
		}

		// ----------------------------

		var category_title = list_source;

		/** 特色內容為列表 */
		var is_list = /list|列表/.test(category_title);
		wiki_API.list(category_title, function(list/* , target, options */) {
			list.forEach(function(page_data) {
				var FC_title = page_data.title;
				var FC_data = FC_data_hash[FC_title];
				if (!FC_data) {
					FC_data = FC_data_hash[FC_title] = {
						type : type_name,
						types : [ type_name ]
					};
				} else if (FC_data.type !== type_name) {
					if (FC_data.type !== 'FFA' || type_name === 'FA') {
						if (options.on_conflict) {
							options.on_conflict(FC_title, {
								from : FC_data.type,
								to : type_name,
								category : category_title
							});
						} else {
							library_namespace.warn('get_FC_via_category: '
									+ FC_title + ': ' + FC_data.type + '→'
									+ type_name);
						}
					}
					if (!FC_data.types.includes(type_name)) {
						// 把重要的放在前面。
						FC_data.types.unshift(type_name);
					}
					FC_data.type = type_name;
				}
				FC_data[KEY_IS_LIST] = is_list;
				// FC_data[KEY_ISFFC] = false;
				// if (catalog) FC_data[KEY_CATEGORY] = catalog;
			});
			callback && callback(FC_data_hash);

		}, {
			// [KEY_SESSION]
			session : this,
			// namespace: '0|1',
			type : 'categorymembers'
		});
	}

	// --------------------------------------------------------------------------------------------

	// export 導出.
	// Object.assign(featured_content, {});

	// ------------------------------------------------------------------------

	// wrapper for local function
	wiki_API.prototype.get_featured_content_configurations = function get_featured_content_configurations() {
		return get_site_configurations(this);
	};

	// callback(wiki.FC_data_hash);
	// e.g.,
	// wiki.FC_data_hash[title]={type:'GA',types:['GA','FFA'],is_former:true,is_list:false}
	wiki_API.prototype.get_featured_content = function get_featured_content(
			options, callback) {
		var FC_configurations = this.get_featured_content_configurations();
		var get_FC_function = FC_configurations && FC_configurations.get_FC;
		if (!get_FC_function) {
			library_namespace.error('get_featured_content: '
					+ 'Did not configured how to get featured content! '
					+ wiki_API.site_name(this));
			return;
		}

		if (typeof options === 'string') {
			options = {
				type : options
			};
		} else {
			options = library_namespace.setup_options(options);
		}
		get_FC_function.call(this, options, callback);
	};

	// 不設定(hook)本 module 之 namespace，僅執行 module code。
	return library_namespace.env.not_to_extend_keyword;
	// return featured_content;
}
