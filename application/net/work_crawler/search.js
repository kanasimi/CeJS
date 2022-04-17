/**
 * @name WWW work crawler sub-functions
 * 
 * @fileoverview WWW work crawler functions: part of search
 * 
 * @since 2019/10/13 拆分自 CeL.application.net.work_crawler
 */

'use strict';

// --------------------------------------------------------------------------------------------

if (typeof CeL === 'function') {
	// 忽略沒有 Windows Component Object Model 的錯誤。
	CeL.env.ignore_COM_error = true;

	CeL.run({
		// module name
		name : 'application.net.work_crawler.search',

		require : 'application.net.work_crawler.',

		// 設定不匯出的子函式。
		no_extend : 'this,*',

		// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
		code : module_code
	});
}

function module_code(library_namespace) {

	// requiring
	var Work_crawler = library_namespace.net.work_crawler, crawler_namespace = Work_crawler.crawler_namespace;

	var gettext = library_namespace.locale.gettext;

	// --------------------------------------------------------------------------------------------

	// @see luoxia.js, dmzj.js
	function parse_search_result_token(id_list, id_data, token_parser, token) {
		var matched = token.match(/<a\s([^<>]+)>([\s\S]+?)<\/a>/i);
		if (library_namespace.is_RegExp(token_parser)) {
			matched = token.match(token_parser);
		} else {
			// matched: [ link, attributes, inner HTML ]
			matched = token.match(/<a\s([^<>]+)>([\s\S]+?)<\/a>/i);
		}
		if (!matched)
			return;

		var id = matched[1]
		// dmzj.js: title=""href="" 中間沒有空格。
		.match(/href=["'][^"'<>]+?\/([a-z\d\-_]+)(?:\/|\.html)?["']/i);

		if (!id)
			return;

		id = id[1];
		if (false && !isNaN(id)) {
			id = +id;
		}
		id_list.push(id);

		var title = matched[1].match(/title=["']([^"'<>]+)["']/);
		id_data.push(crawler_namespace.get_label(title && title[1]
				|| matched[2]));
	}

	// only for .parse_search_result() !!
	function extract_work_id_from_search_result_link(PATTERN_item_token, html,
			token_parser) {
		// console.log(html);
		var matched,
		// {Array}id_list = [ id, id, ... ]
		id_list = [],
		// {Array}id_data = [ title, title, ... ]
		id_data = [],
		//
		search_result_parser = typeof token_parser === 'function'
		//
		&& function(token) {
			// function parser(token, id_list, id_data){console.log(token);}
			var result = token_parser.call(this, token, id_list, id_data);
			if (Array.isArray(result) && result.length === 2) {
				id_list.push(result[0]);
				id_data.push(result[1]);
			}
		};

		// PATTERN_item_token 會分離出每個作品的欄位。
		if (library_namespace.is_RegExp(PATTERN_item_token)) {
			// assert: PATTERN_item_token.global === true
			// matched: [ , HTML token to check ]
			while (matched = PATTERN_item_token.exec(html)) {
				if (search_result_parser) {
					search_result_parser(matched[1]);
				} else {
					parse_search_result_token(id_list, id_data, token_parser,
							matched[1]);
				}
			}

		} else if (Array.isArray(PATTERN_item_token)) {
			html.each_between(PATTERN_item_token[0], PATTERN_item_token[1],
					search_result_parser
							|| parse_search_result_token.bind(null, id_list,
									id_data, token_parser));

		} else {
			throw new TypeError('extract_work_id_from_search_result_link: '
					// gettext_config:{"id":"invalid-token-pattern-{$1}-$2"}
					+ gettext('Invalid token pattern: {%1} %2',
							typeof PATTERN_item_token, JSON
									.stringify(PATTERN_item_token)));
		}

		// console.log([ id_list, id_data ]);
		// throw 'extract_work_id_from_search_result_link';
		return [ id_list, id_data ];
	}

	// CeL.work_crawler.extract_work_id_from_search_result_link()
	Work_crawler.extract_work_id_from_search_result_link = extract_work_id_from_search_result_link;

	// --------------------------------------------------------------------------------------------

	var PATTERN_url_for_baidu = /([\d_]+)(?:\.html|\/(?:index\.html)?)?$/;
	if (library_namespace.is_debug()) {
		[ 'http://www.host/0/123/', 'http://www.host/123/index.html',
				'http://www.host/123.html' ].forEach(function(url) {
			console.assert('123' === 'http://www.host/123/'
					.match(PATTERN_url_for_baidu)[1]);
		});
	}

	crawler_namespace.parse_search_result_set = {
		// baidu cse
		baidu : function(html, get_label) {
			// console.log(html);
			var id_data = [],
			// {Array}id_list = [id,id,...]
			id_list = [], get_next_between = html.find_between(
					' cpos="title" href="', '</a>'), text;

			while ((text = get_next_between()) !== undefined) {
				// console.log(text);
				// 從URL網址中解析出作品id。
				var matched = text.between(null, '"').match(
						PATTERN_url_for_baidu);
				// console.log(matched);
				if (!matched)
					continue;
				id_list.push(matched[1]);
				// 從URL網址中解析出作品title。
				matched = text.match(/ title="([^"]+)"/);
				if (matched) {
					matched = matched[1];
				} else {
					// e.g., omanhua.js: <em>择</em><em>天</em><em>记</em>
					matched = text.between('<em>', {
						tail : '</em>'
					});
				}
				// console.log(matched);
				if (matched && (matched = get_label(matched))
				// 只取第一個符合的。
				// 避免如 http://host/123/, http://host/123/456.htm
				&& !id_data.includes(matched)) {
					id_data.push(matched);
				} else {
					id_list.pop();
				}
			}

			// console.log([ id_list, id_data ]);
			return [ id_list, id_data ];
		}
	};

	// --------------------------------------------------------------------------------------------

	// export 導出.

	// @instance
	Object.assign(Work_crawler.prototype, {
		search_result_file_name : 'search.json',
		cache_title_to_id : true,
		get_search_result_file : function() {
			var search_result_file = this.main_directory
					+ this.search_result_file_name;
			return search_result_file;
		},
		get_search_result : function() {
			var search_result_file = this.get_search_result_file(),
			// search cache
			// 檢查看看之前是否有獲取過。
			search_result = library_namespace.get_JSON(search_result_file);
			return search_result;
		}

	});

	// 不設定(hook)本 module 之 namespace，僅執行 module code。
	return library_namespace.env.not_to_extend_keyword;
}
