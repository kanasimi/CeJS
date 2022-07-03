/**
 * @name CeL function for MediaWiki (Wikipedia / 維基百科): parse wikitext 解析維基語法
 * 
 * @fileoverview 本檔案包含了 MediaWiki 自動化作業用程式庫的子程式庫。
 * 
 * TODO:<code>

parser [[WP:維基化]] [[w:en:Wikipedia:AutoWikiBrowser/General fixes]] [[w:en:Wikipedia:WikiProject Check Wikipedia]]
https://www.mediawiki.org/wiki/API:Edit_-_Set_user_preferences

</code>
 * 
 * @since 2021/12/14 18:53:43 拆分自 CeL.application.net.wiki.parser
 */

// More examples: see /_test suite/test.js
// Wikipedia bots demo: https://github.com/kanasimi/wikibot
'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.wiki.parser.wikitext',

	require : 'application.net.wiki.parser.',

	// 設定不匯出的子函式。
	no_extend : 'this,*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring
	var wiki_API = library_namespace.application.net.wiki;
	// @inner
	var PATTERN_wikilink = wiki_API.PATTERN_wikilink, PATTERN_wikilink_global = wiki_API.PATTERN_wikilink_global, PATTERN_file_prefix = wiki_API.PATTERN_file_prefix, PATTERN_URL_WITH_PROTOCOL_GLOBAL = wiki_API.PATTERN_URL_WITH_PROTOCOL_GLOBAL, PATTERN_category_prefix = wiki_API.PATTERN_category_prefix;

	var
	/** {Number}未發現之index。 const: 基本上與程式碼設計合一，僅表示名義，不可更改。(=== -1) */
	NOT_FOUND = ''.indexOf('_');

	// --------------------------------------------------------------------------------------------

	// CeL.wiki.HTML_to_wikitext(HTML)
	// TODO: 應該 parse HTML。
	// @see
	// https://www.mediawiki.org/w/api.php?action=help&modules=flow-parsoid-utils
	// https://www.mediawiki.org/w/api.php?action=help&modules=parse
	// https://www.mediawiki.org/w/api.php?action=help&modules=expandtemplates
	function HTML_to_wikitext(HTML, options) {
		return HTML
		//
		.replace(/<\/i><i>/g, '').replace(/<\/b><b>/g, '').replace(
				/<\/strong><strong>/g, '')
		//
		.replace(/<i>([\s\S]+?)<\/i>/g, "''$1''").replace(
				/<b>([\s\S]+?)<\/b>/g, "'''$1'''").replace(
				/<strong>([\s\S]+?)<\/strong>/g, "'''$1'''")
		//
		.replace_till_stable(/<span(?: [^<>]*)?>([^<>]*?)<\/span>/g, "$1")
		//
		.replace(/<a ([^<>]+)>([\s\S]+?)<\/a>/g,
		//
		function(all, attributes, innerHTML) {
			var href = attributes.match(/href="([^"]+)"/);
			return '[' + (href ? href[1] : '#') + ' ' + innerHTML + ']';
		})
		//
		.replace(/\s*<br(?:[^\w<>][^<>]*)?>[\r\n]*/ig, '\n').replace(
				/<p ?\/>\n*/ig, '\n\n')
		// ignore style, remove <p style="...">...</p>
		// .replace(/<p[^<>]*>([^<>]*)<\/p>[\s\n]*/g, '$1\n\n')
		.replace(/<p>([\s\S]+?)<\/p>\n*/g, '$1\n\n')
		//
		.replace(/\r?\n/g, '\n').replace(/\n{3,}/g, '\n\n');
	}

	// --------------------------------------------------------------------------------------------

	/**
	 * excluding the disambiguator, and remove diacritics of page_title
	 * 
	 * @param {String}page_title
	 *            頁面標題。
	 * @param {Boolean}to_lower_case
	 *            for case-insensitive compare
	 * 
	 * @returns {String} sort key
	 */
	function page_title_to_sort_key(page_title, to_lower_case) {
		if (!page_title)
			return;
		if (page_title.title) {
			// input page_data
			page_title = page_title.title;
		}
		// excluding the disambiguator
		// e.g., [[Abdoul Karim Sylla (footballer, born 1981)]]
		// → "Abdoul Karim Sylla"
		var sort_key = page_title.toString().replace(/ \([^()]+\)$/, '');
		if (sort_key.normalize) {
			// with diacritics removed. to Latin alphabet
			// https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
			sort_key = sort_key.normalize("NFD")
					.replace(/[\u0300-\u036f]/g, "");
		}
		if (to_lower_case)
			sort_key = sort_key.toLowerCase();
		return sort_key;
	}

	// TODO: check the sort_key is the same as page title or DEFAULTSORT
	function set_sort_key_of_category(sort_key) {
		if (typeof sort_key === 'undefined' || sort_key === null)
			return;

		var category_token = this;
		// const
		var old_sort_key = category_token.sort_key
				&& page_title_to_sort_key(category_token.sort_key);
		if (old_sort_key) {
			if (old_sort_key === sort_key) {
				// Nothing changed
				return;
			}
			if (old_sort_key.length > sort_key
					|| !old_sort_key.startsWith(sort_key)) {
				library_namespace.debug('The sort key of <code><nowiki>'
						+ category_token + '</nowiki></code> will be set to '
						+ JSON.stringify(sort_key) + '!', 1,
						'set_sort_key_of_category');
			}
		}
		category_token[2] = category_token.sort_key = sort_key;
		return true;
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
		// https://phabricator.wikimedia.org/T173889
		page_title : true,
		// external_link : true,
		url : true,
		style : true,
		tag_single : true,
		comment : true
	};

	// tree level
	var KEY_DEPTH = 'depth';

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
	 * @see wiki_token_toString
	 */
	function set_wiki_type(token, type, parent) {
		// console.trace(token);
		if (typeof token === 'string') {
			token = [ token ];
		} else if (!Array.isArray(token)) {
			library_namespace.warn('set_wiki_type: The token is not Array!');
		} else if (token.type && token.type !== 'plain') {
			// 就算 token.type !== type，可能是 <span> 中嵌套 <span> 的形式，
			// 不該直接 `return token` 。

			// 預防token本來就已經有設定類型。
			token = [ token ];
		}
		// assert: Array.isArray(token)
		token.type = type;
		if (type in atom_type) {
			token.is_atom = true;
		}
		// check
		if (false && !wiki_token_toString[type]) {
			throw new Error('.toString() not exists for type [' + type + ']!');
		}

		token.toString = wiki_token_toString[type];
		// Object.defineProperty(token, 'toString', wiki_token_toString[type]);

		if (false) {
			var depth;
			if (parent >= 0) {
				// 當作直接輸入 parent depth。
				depth = parent + 1;
			} else if (parent && parent[KEY_DEPTH] >= 0) {
				depth = parent[KEY_DEPTH] + 1;
			}
			// root 的 depth 為 (undefined|0)===0
			token[KEY_DEPTH] = depth | 0;
		}

		return token;
	}

	// --------------------------------------------------------------------------------------------

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
		if (false) {
			library_namespace.debug('queue: ' + queue.join('\n--- '), 4,
					'resolve_escaped');
			console.log('resolve_escaped: ' + JSON.stringify(queue));
		}

		var length = queue.length;
		for (var index = queue.last_resolved_length | 0; index < length; index++) {
			var item = queue[index];
			if (false)
				library_namespace.debug([ 'item', index, item ], 4,
						'resolve_escaped');
			if (typeof item !== 'string') {
				// already resolved
				// assert: Array.isArray(item)
				continue;
			}

			// result queue
			var result = [];

			item.split(include_mark).forEach(function(token, index) {
				if (index === 0) {
					if (token) {
						result.push(token);
					}
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

			if (result.length > 1) {
				// console.log(result);
				set_wiki_type(result, 'plain');
			} else {
				result = result[0];
			}
			if (result.includes(include_mark)) {
				throw new Error('resolve_escaped: 仍有 include mark 殘留！');
			}
			queue[index] = result;
		}
		queue.last_resolved_length = length;
		// console.log('resolve_escaped end: '+JSON.stringify(queue));
	}

	// 經測試發現 {{...}} 名稱中不可有 [{}<>\[\]]
	// while(/{{{[^{}\[\]]+}}}/g.exec(wikitext));
	// [|{}] or [|{}=]
	// 但允許 "{{\n name}}"
	// 模板名#後的內容會忽略。
	/** {RegExp}模板的匹配模式。 */
	// var PATTERN_transclusion =
	// /{{[\s\n]*([^\s\n#\|{}<>\[\]][^#\|{}<>\[\]]*)(?:#[^\|{}]*)?((?:\|[^<>\[\]]*)*?)}}/g;
	/**
	 * {RegExp}wikilink內部連結的匹配模式。
	 * 
	 * @see PATTERN_wikilink
	 */
	// var PATTERN_link =
	// /\[\[[\s\n]*([^\s\n\|{}<>\[\]�][^\|{}<>\[\]�]*)((?:\|[^\|{}<>\[\]]*)*)\]\]/g;
	/**
	 * Wikimedia projects 的 external link 匹配模式。
	 * 
	 * matched: [ all external link wikitext, URL, delimiter, link name ]
	 * 
	 * 2016/2/23: 經測試，若為結尾 /$/ 不會 parse 成 external link。<br />
	 * 2016/2/23: "[ http...]" 中間有空白不會被判別成 external link。
	 * 
	 * @type {RegExp}
	 * 
	 * @see PATTERN_URL_GLOBAL, PATTERN_URL_WITH_PROTOCOL_GLOBAL,
	 *      PATTERN_URL_prefix, PATTERN_WIKI_URL, PATTERN_wiki_project_URL,
	 *      PATTERN_external_link_global
	 * 
	 * @see https://zh.wikipedia.org/w/api.php?action=query&meta=siteinfo&siprop=protocols&utf8&format=json
	 */
	var PATTERN_external_link_global = /\[((?:https?:|ftps?:)?\/\/[^\s\|<>\[\]{}\/][^\s\|<>\[\]{}]*)(?:([^\S\r\n]+)([^\]]*))?\]/ig,
	// 若包含 br|hr| 會導致 "aa<br>\nbb</br>\ncc" 解析錯誤！
	/** {String}以"|"分開之 wiki tag name。 [[Help:Wiki markup]], HTML tags. 不包含 <a>！ */
	markup_tags = 'bdi|b|del|ins|i|u|font|big|small|sub|sup|h[1-6]|cite|code|em|strike|strong|s|tt|var|div|center|blockquote|[oud]l|table|caption|pre|ruby|r[tbp]|p|span|abbr|dfn|kbd|samp|data|time|mark'
			// [[Help:Parser tag]], [[Help:Extension tag]]
			+ '|includeonly|noinclude|onlyinclude'
			// https://phabricator.wikimedia.org/T263082
			// 會讀取目標語言的 MediaWiki 轉換表
			// [[w:zh:Wikipedia:互助客栈/技术#新的语言转换语法已经启用]]
			// 使用 <langconvert> 的頁面，優先級順序大概是：-{}- 頁面語言切換 > <langconvert> > 轉換組？
			+ '|langconvert'
			// [[Special:Version#mw-version-parser-extensiontags]]
			// <ce> is deprecated, using <chem>
			// Replace all usages of <ce> with <chem> on wiki
			// https://phabricator.wikimedia.org/T155125
			+ '|categorytree|ce|chem|charinsert|gallery|graph|hiero|imagemap|indicator|inputbox|nowiki|mapframe|maplink|math|poem|quiz|ref|references|score|section|source|syntaxhighlight|templatedata|templatestyles|timeline'

			// https://www.mediawiki.org/wiki/Extension:DynamicPageList_(Wikimedia)
			// + '|DynamicPageList'

			// [[w:en:Template:Term]]
			+ '|li|dt|dd',
	// MediaWiki 可接受的 HTML void elements 標籤.
	// NO b|span|sub|sup|li|dt|dd|center|small
	// 包含可使用，亦可不使用 self-closing 的 tags。
	// self-closing: void elements + foreign elements
	// https://www.w3.org/TR/html5/syntax.html#void-elements
	// @see [[phab:T134423]]
	// https://www.mediawiki.org/wiki/Manual:OutputPage.php
	//
	// templatestyles: https://www.mediawiki.org/wiki/Extension:TemplateStyles
	self_close_tags = 'nowiki|references|ref|area|base|br|col|embed|hr|img|input|keygen|link|meta|param|source|track|wbr|templatestyles'
			// Parser extension tags @ [[Special:Version]]
			// For {{#lst}}, {{#section:}}
			// [[w:en:Help:Labeled section transclusion]]
			// TODO: 標簽（tag）現在可以本地化
			+ '|section';
	/** {RegExp}HTML self closed tags 的匹配模式。 */
	var PATTERN_WIKI_TAG_VOID = new RegExp('<(\/)?(' + self_close_tags
	// allow "<br/>"
	+ ')(\/|\\s[^<>]*)?>', 'ig');

	// 在其內部的 wikitext 不會被 parse。允許內部採用 table 語法的 tags。例如
	// [[mw:Manual:Extensions]]
	// configurations.extensiontags
	var wiki_extensiontags = 'pre|nowiki|gallery|indicator|langconvert|timeline|hiero|imagemap|source|syntaxhighlight|poem|quiz|score|templatestyles|templatedata|graph|maplink|mapframe|charinsert|ref|references|inputbox|categorytree|section|math|ce|chem';
	/**
	 * {RegExp}HTML tags 的匹配模式 of <nowiki>。這些 tag 就算中間置入 "<!--" 也不會被當作
	 * comments，必須在 "<!--" 之前解析。 PATTERN_WIKI_TAG_of_wiki_extensiontags
	 */
	var PATTERN_wiki_extensiontags = wiki_API
			.get_PATTERN_full_tag(wiki_extensiontags);
	/** {RegExp}HTML tags 的匹配模式。 */
	// var PATTERN_WIKI_TAG = wiki_API.get_PATTERN_full_tag(markup_tags);
	wiki_extensiontags = wiki_extensiontags.split('|');
	markup_tags = markup_tags.split('|');
	/** {RegExp}HTML tags 的匹配模式 without <nowiki>。 */
	var PATTERN_non_wiki_extensiontags = wiki_API
			.get_PATTERN_full_tag(markup_tags.filter(function(tag) {
				return !wiki_extensiontags.includes(tag);
			}));
	wiki_extensiontags = wiki_extensiontags.to_hash();

	function evaluate_parser_function(options) {
		var argument_1 = this.parameters[1] && this.parameters[1].toString();
		var argument_2 = this.parameters[2] && this.parameters[2].toString();
		var argument_3 = this.parameters[3] && this.parameters[3].toString();

		switch (this.name) {
		case 'len':
			// {{#len:string}}

			// TODO: ags such as <nowiki> and other tag extensions will always
			// have a length of zero, since their content is hidden from the
			// parser.
			return argument_1.length;

		case 'sub':
			// {{#sub:string|start|length}}
			return argument_3 ? argument_1.substring(argument_2, argument_3)
					: argument_1.slice(argument_2);

		case 'time':
			// https://www.mediawiki.org/wiki/Help:Extension:ParserFunctions##time
			// {{#time: format string | date/time object | language code | local
			// }}
			if (!argument_2 || argument_2 === 'now') {
				argument_2 = new Date;
				return argument_1.replace(/Y/g, argument_2.getUTCFullYear())
				//
				.replace(/n/g, argument_2.getUTCMonth() + 1)
				//
				.replace(/m/g, (argument_2.getUTCMonth() + 1).pad(2))
				//
				.replace(/j/g, argument_2.getUTCDate())
				//
				.replace(/d/g, argument_2.getUTCDate().pad(2));
				// TODO
			}

		case 'if':
			// TODO: parse output of {{#if:text|...}}, {{#if:text||...}}

			// TODO
		}

		return this;
	}

	/**
	 * .toString() of wiki elements: wiki_token_toString[token.type]<br />
	 * parse_wikitext() 將把 wikitext 解析為各 {Array} 組成之結構。當以 .toString() 結合時，將呼叫
	 * .join() 組合各次元素。此處即為各 .toString() 之定義。<br />
	 * 所有的 key (type) 皆為小寫。
	 * 
	 * @type {Object}
	 * 
	 * @see parse_wikitext()
	 */
	var wiki_token_toString = {
		// internal/interwiki link : language links : category links, file,
		// subst 替換引用, ... : title
		// e.g., [[m:en:Help:Parser function]], [[m:Help:Interwiki linking]],
		// [[:File:image.png]], [[wikt:en:Wiktionary:A]],
		// [[:en:Template:Editnotices/Group/Wikipedia:Miscellany for deletion]]
		// [[:en:Marvel vs. Capcom 3: Fate of Two Worlds]]
		// [[w:en:Help:Link#Http: and https:]]
		//
		// 應當使用 [[w:zh:維基百科:編輯提示|編輯提示]] 而非 [[:zh:w:維基百科:編輯提示|編輯提示]]，
		// 見 [[User:Cewbot/Stop]]。
		//
		// @see [[Wikipedia:Namespace]]
		// https://www.mediawiki.org/wiki/Markup_spec#Namespaces
		// [[ m : abc ]] is OK, as "m : abc".
		// [[: en : abc ]] is OK, as "en : abc".
		// [[ :en:abc]] is NOT OK.
		namespaced_title : function() {
			return this.join(this.oddly ? '' : ':');
		},
		// page title, template name
		page_title : function() {
			return this.join(':');
		},
		// link 的變體。但可採用 .name 取得 file name。
		file : function() {
			return '[[' + this[0]
			// anchor 網頁錨點
			+ this[1]
			//
			+ (this.length > 2 ? '|' + this.slice(2).join('|') : '') + ']]';
		},
		// link 的變體。但可採用 .name 取得 category name。
		category : function() {
			return '[[' + this[0]
			// anchor 網頁錨點
			+ this[1]
			//
			+ (this.length > 2 ? '|' + this.slice(2).join('|') : '') + ']]';
		},
		// 內部連結 (wikilink / internal link) + interwiki link
		link : function() {
			return '[[' + this[0]
			// + (this[1] || '')
			+ this[1] + (this.length > 2
			// && this[2] !== undefined && this[2] !== null
			? '|'
			// + (this[2] || '')
			+ this[2] : '') + ']]';
		},
		// 外部連結 external link, external web link
		external_link : function() {
			// assert: this.length === 1 or 3
			// assert: this.length === 3
			// && this[1].trim() === '' && this[2] === this[2].trimStart()
			return '[' + this.join('') + ']';
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
		magic_word_function : function() {
			return '{{' + this[0] + this.slice(1).join('|') + '}}';
		},

		// [[Help:Table]]
		table : function() {
			// this: [ table style, row, row, ... ]
			return '{|' + this.join('') + '\n|}';
		},
		// table attributes / styles, old name before 2021/1/24: table_style
		table_attributes : function() {
			return this.join('') + (this.suffix || '');
		},
		// table caption
		caption : function() {
			// this: [ main caption, invalid caption, ... ]
			return (this.delimiter || '') + this.join('');
		},
		table_row : function() {
			// this: [ row style, cell, cell, ... ]
			return (this.delimiter || '') + this.join('');
		},
		table_cell : function() {
			// this: [ contents ]
			// this.delimiter:
			// /\n[!|]|!!|\|\|/ or undefined (在 style/第一區間就已當作 cell)
			return (this.delimiter || '') + this.join('');
		},

		// 手工字詞轉換 language conversion -{}-
		convert : function(language, lang_fallbacks, force_show) {
			if (!language) {
				return '-{'
				//
				+ ('flag' in this ? (this._flag || this.flag) + '|' : '')
						+ this.join(';') + '}-';
			}

			if (language === 'rule') {
				// gets the rule of conversion only
				return this.join(';');
			}

			var flag = this.flag;
			if (!force_show && (flag in {
				// add rule for convert code (but no display in placed code)
				H : true,
				T : true,
				'-' : true
			})) {
				return '';
			}

			if (flag in {
				// raw content
				R : true,
				// description
				D : true
			}) {
				return this.join(';');
			}

			language = language.trim().toLowerCase();
			if (Array.isArray(flag)) {
				if (!flag.includes(language)) {
					// 單純顯示不繁簡轉換的文字
					return this.join(';');
				}
				// TODO: 顯示繁簡轉換後的文字
				return this.join(';');
			}

			// TODO: 後援語種 fallback language variant

			// https://zh.wikipedia.org/w/api.php?action=query&meta=siteinfo&siprop=general%7Cnamespaces%7Cnamespacealiases%7Cstatistics
			// language fallbacks: [[mw:Localisation statistics]]
			// (zh-tw, zh-hk, zh-mo) → zh-hant (→ zh?)
			// (zh-cn, zh-sg, zh-my) → zh-hans (→ zh?)
			// [[Wikipedia_talk:地区词处理#zh-my|馬來西亞簡體華語]]
			// [[MediaWiki:Variantname-zh-tw]]
			if (!this.conversion[language]) {
				if (/^zh-(?:tw|hk|mo)/.test(language)) {
					language = 'zh-hant';
				} else if (/^zh/.test(language)) {
					language = 'zh-hans';
				}
			}

			var convert_to = this.conversion[language];
			if (Array.isArray(convert_to)) {
				// e.g., -{H|zh-tw:a-{b}-c}-
				var not_all_string;
				convert_to = convert_to.map(function(token) {
					if (typeof token === 'string')
						return token;
					if (token.type === 'convert'
							&& typeof token.converted === 'string')
						return token.converted;
					not_all_string = true;
				});
				if (!not_all_string)
					convert_to = convert_to.join('');
				else
					convert_to = this.conversion[language];
			}

			return convert_to
			//
			|| typeof this.converted === 'string' && this.converted
			// [[MediaWiki:Converter-manual-rule-error]]: 在手动语言转换规则中检测到错误
			|| 'converter-manual-rule-error';
		},

		// Behavior switches
		'switch' : function() {
			// assert: this.length === 1
			return '__' + this[0] + '__';
		},
		// italic type
		italic : function() {
			return "''" + this.join('') + (this.no_end ? '' : "''");
		},
		// emphasis
		bold : function() {
			return "'''" + this.join('') + (this.no_end ? '' : "'''");
		},

		// section title / section name
		// show all section titles:
		// parser=CeL.wiki.parser(page_data);parser.each('section_title',function(token,index){console.log('['+index+']'+token.title);},false,1);
		// @see for_each_token()
		// parser.each('plain',function(token){},{slice:[1,2]});
		section_title : function(get_inner) {
			// this.join(''): 必須與 wikitext 相同。見 parse_wikitext.title。
			var inner = this.join('');
			if (get_inner) {
				// section_title.toString(true): get inner
				// Must .trim() yourself.
				return inner;
			}

			var level = '='.repeat(this.level);
			return level + inner + level
			// this.postfix maybe undefined, string, {Array}
			+ (this.postfix || '');
		},

		// [[Help:Wiki markup]], HTML tags
		tag : function() {
			// this: [ {String}attributes, {Array}inner nodes ].tag
			// 欲取得 .tagName，請用 this.tag.toLowerCase();
			// 欲取得 .inner nodes，請用 this[1];
			// 欲取得 .innerHTML，請用 this[1].toString();
			return '<' + this.tag + (this[0] || '') + '>' + this[1] + '</'
					+ (this.end_tag || this.tag) + '>';
		},
		tag_attributes : function() {
			return this.join('');
		},
		tag_inner : function() {
			return this.join('');
		},
		tag_single : function() {
			// this: [ {String}attributes ].tag
			// 欲取得 .tagName，請用 this.tag.toLowerCase();
			return '<' + (this.slash || '') + this.tag + this.join('') + '>';
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
		list : function() {
			return this.join('');
		},
		list_item : function() {
			return (this.list_prefix || '') + this.join('');
		},
		pre : function() {
			return ' ' + this.join('\n ');
		},
		hr : function() {
			return this[0];
		},
		paragraph : function() {
			return this.join('\n') + (this.separator || '');
		},
		// plain text 或尚未 parse 的 wikitext.
		plain : function() {
			return this.join('');
		}
	};

	// const , for <dl>
	var DEFINITION_LIST = 'd';

	// !!default_magic_words_hash[magic_word] === 必須指定數值，採用 {{#MW:value}}
	// else 可單用 {{MW}}
	var default_magic_words_hash = Object.create(null);
	// https://www.mediawiki.org/wiki/Help:Magic_words
	// https://zh.wikipedia.org/w/api.php?action=query&meta=siteinfo&siprop=functionhooks&utf8&format=json
	('DISPLAYTITLE|DEFAULTSORT|デフォルトソート'
			+ '|ns|nse|lc|lcfirst|uc|ucfirst|urlencode|anchorencode'
			+ '|LOCALURL|FULLURL|FILEPATH'
			// TODO: [[mw:Help:Substitution]]
			// {{subst:FULLPAGENAME}} {{safesubst:FULLPAGENAME}}

			// https://www.mediawiki.org/wiki/Help:Magic_words#Transclusion_modifiers
			// https://en.wikipedia.org/wiki/Help:Transclusion#Transclusion_modifiers
			+ '|int|msg|raw|msgnw|subst|safesubst'
	// 這些需要指定數值。 e.g., {{NS:1}}: OK, {{NS}} will get " ", {{NS:}} will get ""
	).split('|').forEach(function name(magic_word) {
		default_magic_words_hash[magic_word.toUpperCase()] = true;
	});
	// https://zh.wikipedia.org/w/api.php?action=query&meta=siteinfo&siprop=variables&utf8&format=json
	('!|='
			+ '|CURRENTYEAR|CURRENTMONTH|CURRENTDAY|CURRENTTIME|CURRENTHOUR|CURRENTWEEK|CURRENTTIMESTAMP'
			+ '|NAMESPACE|NAMESPACENUMBER'
			+ '|FULLPAGENAME|PAGENAME|BASEPAGENAME|SUBPAGENAME|SUBJECTPAGENAME|ARTICLEPAGENAME|TALKPAGENAME|ROOTPAGENAME'
			+ '|FULLPAGENAMEE|PAGENAMEE|BASEPAGENAMEE|SUBPAGENAMEE|SUBJECTPAGENAMEE|ARTICLEPAGENAMEE|TALKPAGENAMEE|ROOTPAGENAMEE'
	// 這些不用指定數值。
	).split('|').forEach(function name(magic_word) {
		default_magic_words_hash[magic_word.toUpperCase()] = false;
	});

	// parse 手動轉換語法的轉換標籤的語法
	// 經測試，":"前面與後面不可皆有空白。
	// (\s{2,}): 最後的單一/\s/會被轉換為"&#160;"
	// matched: [ all, 指定轉換字串, 指定轉換詞, spaces,
	// this language code, colon, this language token, last spaces ]
	var PATTERN_conversion_slice = /^(([\s\S]+?)=>)?(\s*)(zh(?:-(?:cn|tw|hk|mo|sg|my|hant|hans))?)(\s*:|:\s*)(\S.*?)(\s{2,})?$/;

	// 狀態開關: [[mw:Help:Magic words#Behavior switches]]
	var PATTERN_BEHAVIOR_SWITCH = /__([A-Z]+(?:_[A-Z]+)*)__/g;
	PATTERN_BEHAVIOR_SWITCH = /__(NOTOC|FORCETOC|TOC|NOEDITSECTION|NEWSECTIONLINK|NONEWSECTIONLINK|NOGALLERY|HIDDENCAT|NOCONTENTCONVERT|NOCC|NOTITLECONVERT|NOTC|INDEX|NOINDEX|STATICREDIRECT|NOGLOBAL)__/g;

	// [[w:en:Wikipedia:Extended image syntax]]
	// [[mw:Help:Images]]
	var file_options = {
		// Type, display format, 表示形式
		thumb : 'format',
		thumbnail : 'format',
		frame : 'format',
		framed : 'format',
		frameless : 'format',

		// Border, 外枠, 縁取る, 境界
		border : 'border',

		// Location, Horizontal alignment option, 配置位置
		right : 'location',
		left : 'location',
		// 居中, 不浮動
		center : 'location',
		// 不浮動
		none : 'location',

		// Vertical alignment option, 垂直方向の位置
		baseline : 'alignment',
		middle : 'alignment',
		sub : 'alignment',
		'super' : 'alignment',
		'text-top' : 'alignment',
		'text-bottom' : 'alignment',
		top : 'alignment',
		bottom : 'alignment',

		// Link option
		// link : 'link',

		// alt : 'alt',
		// lang : 'language',

		// https://en.wikipedia.org/wiki/Wikipedia:Creation_and_usage_of_media_files#Setting_a_video_thumbnail_image
		// thumbtime : 'video_thumbtime',
		// start : 'video_start',
		// end : 'video_end',

		// page : 'book_page',
		// 'class' : 'CSS_class',

		// Size, Resizing option
		// 放大倍數
		upright : 'size'
	};

	function join_string_of_array(array) {
		for (var index = 1; index < array.length;) {
			if (typeof array[index] !== 'string') {
				index++;
				continue;
			}

			if (array[index] === '') {
				array.splice(index, 1);
				continue;
			}

			if (typeof array[index - 1] === 'string') {
				array[index - 1] += array[index];
				array.splice(index, 1);
			} else {
				index++;
			}
		}

		return array;
	}

	function is_parsed_element(value) {
		return Array.isArray(value) && value.type;
	}

	/**
	 * parse The MediaWiki markup language (wikitext). 解析維基語法。
	 * 
	 * TODO:<code>

	parse error: [[File:]] 可以允許換行
	[[俄羅斯公民簽證要求]]: [[File:Visa requirements for Russian citizens.png|Visa requirements for Russian citizens|thumb|800px|center|俄罗斯护照持有人可免签证或落地签证前往的国家或地区 
	{{legend|#042E9B|[[俄罗斯]]}}{{legend|#2196f3|[[克里米亚]]}}{{legend|#ffc726|[[:en:Internal_passport_of_Russia|内部护照]]|]]}}{{legend|#22b14c|免签证}}{{legend|#B5E61D|落地签证}}{{legend|#61c09a|电子签证}}{{legend|#79D343|需电子签证或预先在互联网注册}}{{legend|#A8ACAB|需要申请签证}}]]

	parse 嵌入section內文 [[mw:Extension:Labeled_Section_Transclusion]]:
	{{#lsth:page_title|section begin in wikitext|section end in wikitext}}, {{#section-h:page_title}} 語意上相當於 {{page_title#section}}。如果有多個相同名稱的section，僅轉換第一個。The matching is case insensitive
	TODO: parse <section begin=chapter1 />, {{#lst:page_title|section begin|section end}}, {{#lstx:page_title|section|replacement_text}}

	提高效率。e.g., [[三国杀武将列表]], [[世界大桥列表]], [[三国杀武将列表]]<br />
	可能為模板參數特殊設計？有些 template 內含不完整的起始或結尾，使 parameter 亦未首尾對應。

	{{L<!-- -->L}} .valueOf() === '{{LL}}'
	<p<!-- -->re>...</pre>
	CeL.wiki.page('上海外国语大学',function(page_data){CeL.wiki.parser(page_data).parse();})
	[https://a.b <a>a</a><!-- -->]
	[[<a>a</a>]]
	CeL.wiki.parser('a[[未來日記-ANOTHER:WORLD-]]b').parse()[1]
	<nowiki>...<!-- -->...</nowiki> 中的註解不應被削掉!

	parse {{Template:Single chart}}

	</code>
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
	 * @see https://blog.wikimedia.org/2013/03/04/parsoid-how-wikipedia-catches-up-with-the-web/
	 *      https://phabricator.wikimedia.org/diffusion/GPAR/
	 * 
	 * @see [[w:en:Help:Wikitext]], [[Wiki標記式語言]]
	 *      https://www.mediawiki.org/wiki/Markup_spec/BNF/Article
	 *      https://www.mediawiki.org/wiki/Markup_spec/BNF/Inline_text
	 *      https://www.mediawiki.org/wiki/Markup_spec
	 *      https://www.mediawiki.org/wiki/Wikitext
	 *      https://doc.wikimedia.org/mediawiki-core/master/php/html/Parser_8php.html
	 *      Parser.php: PHP parser that converts wiki markup to HTML.
	 *      https://mwparserfromhell.readthedocs.io/
	 */
	function parse_wikitext(wikitext, options, queue) {
		if (!wikitext) {
			return wikitext;
		}

		function _set_wiki_type(token, type) {
			// 這可能性已經在下面個別處理程序中偵測並去除。
			if (false && typeof token === 'string'
					&& token.includes(include_mark)) {
				queue.push(token);
				resolve_escaped(queue, include_mark, end_mark);
				token = [ queue.pop() ];
			}

			return set_wiki_type(token, type, wikitext);

			// 因為parse_wikitext()採用的是從leaf到root的解析法，因此無法在解析leaf時就知道depth。
			// 故以下廢棄。
			var node = set_wiki_type(token, type);
			library_namespace.debug('set depth ' + depth_of_children
					+ ' to children [' + node + ']', 3, '_set_wiki_type');
			node[KEY_DEPTH] = depth_of_children;
			return node;
		}

		// 正規化並提供可隨意改變的同內容參數，以避免修改或覆蓋附加參數。
		// 每個parse_wikitext()都需要新的options，需要全新的。
		// options = Object.assign({}, options);
		options = library_namespace.setup_options(options);

		var session = wiki_API.session_of_options(options);

		if (false) {
			// assert: false>=0, (undefined>=0)
			// assert: (NaN | 0) === 0
			var depth_of_children = ((options[KEY_DEPTH]) | 0) + 1;
			// assert: depth_of_children >= 1
			library_namespace.debug('[' + wikitext + ']: depth_of_children: '
					+ depth_of_children, 3, 'parse_wikitext');
			options[KEY_DEPTH] = depth_of_children;
		}

		var
		/**
		 * 解析用之起始特殊標記。<br />
		 * 需找出一個文件中不可包含，亦不會被解析的字串，作為解析用之起始特殊標記。<br />
		 * e.g., '\u0000'.<br />
		 * include_mark + ({ℕ⁰:Natural+0}index of queue) + end_mark
		 * 
		 * assert: /\s/.test(include_mark) === false
		 * 
		 * @type {String}
		 */
		include_mark = options.include_mark || '\u0000',
		/**
		 * {String}結束之特殊標記。 end of include_mark. 不可為數字 (\d) 或
		 * include_mark，不包含會被解析的字元如 /;/。應為 wikitext 所不容許之字元。
		 */
		end_mark = options.end_mark || '\u0001',
		/** {Boolean}是否順便作正規化。預設不會規範頁面內容。 */
		normalize = options.normalize,
		/** {Array}是否需要初始化。 [ {String}prefix added, {String}postfix added ] */
		initialized_fix = !queue && [ '', '' ],
		// 這項設定不應被繼承。
		no_resolve = options.no_resolve;
		if (no_resolve) {
			delete options.no_resolve;
		}

		if (/\d/.test(end_mark) || include_mark.includes(end_mark))
			throw new Error('Error end of include_mark!');

		if (initialized_fix) {
			// 初始化。
			if (!wikitext.replace) {
				if (Array.isArray(wikitext) && wikitext.type) {
					library_namespace.debug('Treat [' + wikitext
							+ '] as parsed token anf return directly!', 1,
							'parse_wikitext');
					return wikitext;
				}
				console.trace(wikitext);
			}
			wikitext = wikitext
			// 注意: 2004年5月早期的中文維基百科換行採用 "\r\n"，因此必須保留 "\r"。
			// .replace(/\r\n/g, '\n')
			.replace(
			// 先 escape 掉會造成問題之 characters。
			new RegExp(include_mark.replace(/([\s\S])/g, '\\$1'), 'g'),
					include_mark + end_mark);
			if (!wikitext.startsWith('\n') &&
			// /\n([*#:;]+|[= ]|{\|)/:
			// https://www.mediawiki.org/wiki/Markup_spec/BNF/Article#Wiki-page
			// https://www.mediawiki.org/wiki/Markup_spec#Start_of_line_only
			/^(?:[*#;:=\s]|{\|)/.test(wikitext))
				wikitext = (initialized_fix[0] = '\n') + wikitext;
			if (!wikitext.endsWith('\n'))
				wikitext += (initialized_fix[1] = '\n');
			// setup temporary queue
			queue = [];
		}

		var section_title_hierarchy = queue.section_title_hierarchy
				|| (queue.section_title_hierarchy = []);
		if (!section_title_hierarchy[0]) {
			// As root
			section_title_hierarchy[0] = options.target_array
					|| Object.create(null);
			section_title_hierarchy[0].child_section_titles = [];
		}

		if (!queue.conversion_table) {
			// [[MediaWiki:Conversiontable/zh-hant]]
			queue.conversion_table = Object.create(null);
		}

		if (typeof options.prefix === 'function') {
			wikitext = options.prefix(wikitext, queue, include_mark, end_mark)
					|| wikitext;
		}

		// 預防有特殊 elements 置入其中。此時將之當作普通 element 看待。
		// cf. deep resolve_escaped()
		function shallow_resolve_escaped(text) {
			if (text.includes(include_mark)) {
				// 經過改變，需再進一步處理。
				text = parse_wikitext(text, options, queue);
			}
			return text;
		}

		// console.trace(wikitext);

		// ------------------------------------------------------------------------
		// parse functions

		function parse_language_conversion(all, parameters) {
			// -{...}- 自 end_mark 向前回溯。
			var index = parameters.lastIndexOf('-{'), previous;
			if (index > 0) {
				previous = '-{' + parameters.slice(0, index);
				parameters = parameters.slice(index + '}-'.length);
			} else {
				previous = '';
			}
			library_namespace.debug(previous + ' + ' + parameters, 4,
					'parse_wikitext.convert');

			// console.log(parameters);

			var conversion = Object.create(null),
			//
			conversion_list = [], latest_language;

			var _flag = parameters.match(/^([a-zA-Z\-;\s]*)\|(.*)$/), flag;
			if (_flag) {
				parameters = _flag[2];
				var flag_hash = Object.create(null);
				_flag = _flag[1];
				flag = _flag.split(';').map(function(f) {
					f = f.trim();
					if (f)
						flag_hash[f] = true;
					return f;
				}).filter(function(f) {
					return !!f;
				});
				if (flag.length === 0) {
					flag = '';
				} else {
					// https://doc.wikimedia.org/mediawiki-core/master/php/ConverterRule_8php_source.html
					// 僅取首先符合者。
					[ 'R', 'N', '-', 'T', 'H', 'A', 'D' ].some(function(f) {
						if (flag_hash[f]) {
							flag = f;
							return true;
						}
					});
				}
			}

			var conversion_table = flag && (flag in {
				// '+' add rules for alltext
				// '+' : true,

				// these flags above are reserved for program

				// remove convert (not implement)
				// '-' : true,

				// add rule for convert code (but no display in placed code)
				H : true,
				// add rule for convert code (all text convert)
				A : true
			}) && queue.conversion_table;

			// console.log('parameters: ' + JSON.stringify(parameters));
			parameters = parameters.split(';');
			parameters.forEach(function(converted, index) {
				if (normalize) {
					// remove spaces
					converted = converted.trim();
				}
				if (PATTERN_conversion_slice.test(converted)
				// e.g., "-{ a; zh-tw: tw }-" 之 " a"
				|| conversion_list.length === 0
				// 最後一個是空白。
				|| !converted.trim() && index + 1 === parameters.length) {
					conversion_list.push(converted);
				} else {
					conversion_list[conversion_list.length - 1]
					// e.g., "-{zh-tw: tw ; tw : tw2}-"
					+= ';' + converted;
				}
			});
			// console.log(conversion_list);
			var convert_from_hash = conversion_table && Object.create(null);
			var unidirectional = [];
			/**
			 * [[Help:高级字词转换语法#基本语法]]
			 * 
			 * <code>

			-{zh-cn:cn; zh-tw:tw;}-
			→
			conversion_table['cn'] = conversion_table['tw'] =
			{'zh-cn':'cn','zh-tw':'tw'}


			-{txt=>zh-cn:cn; txt=>zh-tw:tw;}-
			→
			conversion_table['txt'] =
			{'zh-cn':'cn','zh-tw':'tw'}


			-{txt=>zh-cn:cn; zh-cn:cn; zh-tw:tw;}-
			→
			conversion_table['txt'] =
			{'zh-cn':'cn'}
			∪
			conversion_table['cn'] = conversion_table['tw'] =
			{'zh-cn':'cn','zh-tw':'tw'}

			</code>
			 */
			// TODO: 剖析不出任何對應規則的話，則為 R 旗標轉換，即是停用字詞轉換，顯示原文（R stands for raw）。
			conversion_list = conversion_list.map(function(token) {
				var matched = token.match(PATTERN_conversion_slice);
				// console.log(matched);
				if (!matched
				// e.g., -{A|=>zh-tw:tw}-
				|| matched[1] && !(matched[2] = matched[2].trim())) {
					// 經過改變，需再進一步處理。
					return parse_wikitext(token, options, queue);
				}

				// matched.shift();
				matched = matched.slice(1);

				// matched: [ 指定轉換字串, 指定轉換詞, spaces,
				// this language code, colon, this language token, last spaces ]
				if (!matched[6])
					matched.pop();

				// 語言代碼 language variant 用字模式
				var language_code = matched[3].trim(), convert_to
				// 經過改變，需再進一步處理。
				= matched[5] = parse_wikitext(matched[5], options, queue);
				if (!convert_to) {
					// 'converter-manual-rule-error'
					return parse_wikitext(token, options, queue);
				}
				conversion[language_code] = convert_to;
				if (!matched[2]) {
					matched.splice(2, 1);
				}
				// 指定僅轉換某些特殊詞彙。
				// unidirectional_convert_from
				var uniconvert_from;
				if (matched[0]) {
					uniconvert_from = matched[1].trim();
					if (!uniconvert_from) {
						// if $from is empty, strtr() could return a wrong
						// result.
					}
					matched.splice(1, 1);
				} else {
					matched.splice(0, 2);
				}
				token = _set_wiki_type(matched, 'plain');
				token.is_conversion = true;

				if (!conversion_table) {
					;
				} else if (uniconvert_from) {
					// 單向轉換 unidirectional convert
					unidirectional.push(uniconvert_from);
					if (!conversion_table[uniconvert_from]) {
						conversion_table[uniconvert_from]
						// Initialization
						= Object.create(null);
					} else if (conversion_table[uniconvert_from].conversion) {
						conversion_table[uniconvert_from] = Object.clone(
						// assert:
						// conversion_table[uniconvert_from].type==='convert'
						conversion_table[uniconvert_from].conversion);
					}

					if (false && options.conflict_conversion
					// overwrite
					&& conversion_table[uniconvert_from][language_code]) {
						options.conflict_conversion.call(conversion_table,
								uniconvert_from, language_code,
								conversion_table[uniconvert_from]
								//
								[language_code], convert_to);
					}

					conversion_table[uniconvert_from][language_code]
					// settle
					= convert_to;

				} else if (typeof convert_to === 'string') {
					// 後面的設定會覆蓋先前的設定。
					convert_from_hash[language_code] = convert_to;
				} else if (convert_to && convert_to.type === 'plain') {
					// 雙向轉換 bidirectional convert
					// -{H|zh-cn:俄-{匊}-斯;zh-tw:俄-{匊}-斯;zh-hk:俄-{匊}-斯;}-
					// 當作 "俄匊斯"
					var not_all_string;
					convert_to = convert_to.map(function(token) {
						if (typeof token === 'string')
							return token;
						if (token.type === 'convert'
								&& typeof token.converted === 'string')
							return token.converted;
						not_all_string = true;
					});
					if (!not_all_string) {
						// 後面的設定會覆蓋先前的設定。
						convert_from_hash[language_code] = convert_to.join('');
					}
				}

				// console.log(JSON.stringify(token));
				return token;
			});
			if (options.normalize) {
				// 正規化後可以不保留 -{...;}- 最後的 ';'
				conversion_list = conversion_list.filter(function(token) {
					return !!token;
				});
				conversion_list.sort(function(_1, _2) {
					// assert: {Array} _1, _2
					return _1[0] < _2[0] ? -1 : _1[0] > _2[0] ? 1 : 0;
				});
			}
			// console.log(conversion_list);
			parameters = _set_wiki_type(conversion_list, 'convert');
			parameters.conversion = conversion;
			if (unidirectional.length > 0)
				parameters.unidirectional = unidirectional.unique();
			if (typeof _flag === 'string') {
				if (_flag !== flag)
					parameters._flag = _flag;
				parameters.flag = flag;
				if (flag === 'T')
					options.conversion_title = parameters;
			}
			// console.log(convert_from_hash);
			convert_from_hash && Object.values(convert_from_hash)
			//
			.forEach(function(convert_from_string) {
				// console.log(convert_from_string);
				conversion_table[convert_from_string] = parameters;
			});
			// console.log(JSON.stringify(wikitext));
			// console.log(conversion_table);

			if (queue.switches && (queue.switches.__NOCC__
			// 使用魔術字 __NOCC__ 或 __NOCONTENTCONVERT__ 可避免轉換。
			|| queue.switches.__NOCONTENTCONVERT__)) {
				parameters.no_convert = true;
			} else if (Object.keys(conversion).length === 0) {
				// assert: parameters.length === 1
				// e.g., "-{ t {{T}} }-"
				// NOT "-{ zh-tw: tw {{T}} }-"
				parameters.converted = parameters[0];
			} else if (options.language) {
				// TODO: 先檢測當前使用的語言，然後轉成在當前環境下轉換過、會顯示出的結果。
				parameters.converted = parameters.toString(options.language);
			}

			queue.push(parameters);
			return previous + include_mark + (queue.length - 1) + end_mark;
		}

		// TODO: 緊接在連結後面的 /[a-zA-Z\x80-\x10ffff]+/ 會顯示為連結的一部分
		// https://phabricator.wikimedia.org/T263266
		function parse_wikilink(all_link, page_and_anchor, page_name, anchor,
				display_text) {
			// 自 end_mark 向前回溯。
			var previous;
			if (display_text && display_text.includes('[[')) {
				var index = all_link.lastIndexOf('[[');
				previous = all_link.slice(0, index);
				all_link = all_link.slice(index);
				if (index = all_link.match(PATTERN_wikilink)) {
					page_and_anchor = index[1];
					// `{{NAMESPACE}}:{{PAGENAME}}`
					page_name = index[2];
					anchor = index[3];
					display_text = index[4];
				} else {
					// revert
					all_link = previous + all_link;
					previous = '';
				}
			} else {
				previous = '';
			}

			if (/\n=+[^=]=+/.test(display_text)) {
				// incase '[[A|B]\n==T==\n<code>[[]]</code>'
				// TODO: fix '[[A|B]<code>]]'
				return all_link;
			}

			library_namespace.debug('[' + previous + '] + [' + all_link + ']',
					4, 'parse_wikitext.link');

			var file_matched, category_matched;
			if (!page_name) {
				// assert: [[#anchor]]
				page_name = '';
				// anchor, fragment, section_title
				anchor = page_and_anchor;
			} else {
				if (!anchor) {
					anchor = '';
				}
				if (normalize) {
					page_name = page_name.trim();
				}
				// test [[file:name|...|...]]
				file_matched = page_name.match(PATTERN_file_prefix);
				if (!file_matched) {
					category_matched = page_name
					// test [[Category:name|order]]
					.match(PATTERN_category_prefix);
					// console.log([ page_name, category_matched ]);
				} else if (file_matched[1]) {
					// console.trace(file_matched);
					file_matched = null;
				}
				if (page_name.includes(include_mark)) {
					// console.trace(page_name);
					// 預防有特殊 elements 置入link其中。
					page_name = parse_wikitext(page_name, options, queue);
					if (false) {
						console.log([ all_link, page_and_anchor, page_name,
								anchor, display_text ]);
					}
					if (page_name.some(function(token) {
						return token.is_link;
					})) {
						// e.g., [[:[[Portal:中國大陸新聞動態|中国大陆新闻]] 3月16日新闻]]
						// [[[[t|l]], t|l]]
						// console.trace(page_name);
						page_name.oddly = 'link_inside_link';
					} else {
						page_name.oddly = true;
					}
				} else {
					// TODO: normalize 對 [[文章名稱 : 次名稱]] 可能出現問題。
					page_name = page_name.split(normalize ? /\s*:\s*/ : ':');
				}
				page_name = _set_wiki_type(page_name, 'namespaced_title');
			}
			if (normalize) {
				// assert: anchor && anchor.startsWith('#')
				anchor = anchor.trimEnd();
			}
			if (anchor) {
				// 經過改變，需再進一步處理。
				// e.g., '[[t#-{c}-]]'
				anchor = parse_wikitext(anchor, options, queue);
			}

			// [ page_name, section_title / #anchor 網頁錨點, display_text ]
			var parameters = [ page_name, anchor ];
			if (false) {
				// page_title, full_page_name, {{FULLPAGENAME}}:
				// `{{NAMESPACE}}:{{PAGENAME}}`
				parameters.page_name = wiki_API.normalize_title(page_name);
			}

			// assert: 'a'.match(/(b)?/)[1]===undefined
			if (typeof display_text === 'string') {
				if (file_matched) {
					// caption 可以放在中間，但即使是空白也會被認作是 caption:
					// ;;; [[File:a.svg|caption|thumb]]
					// === [[File:a.svg|thumb|caption]]
					// !== [[File:a.svg|NG caption|thumb|]]
					// === [[File:a.svg|thumb|NG caption|]]

					// 先處理掉裏面的功能性代碼。 e.g.,
					// [[File:a.svg|alt=alt_of_{{tl|t}}|NG_caption|gykvg=56789{{tl|t}}|{{#ifexist:abc|alt|link}}=abc|{{#ifexist:abc|left|456}}|{{#expr:100+300}}px|thumb]]
					// e.g., [[File:a.svg|''a''|caption]]
					display_text = parse_wikitext(display_text, {
						no_resolve : true
					}, queue);

					parameters.index_of = Object.create(null);

					// [ file namespace, anchor / section_title,
					// parameters 1, parameters 2, parameters..., caption ]
					var token, file_option,
					// parameters 有分大小寫與繁簡體，並且各種類會以首先符合的為主。
					PATTERN = /([^\|]*?)(\||$)/ig;
					// assert: 這會將剩下來的全部分完。
					while (token = PATTERN.exec(display_text)) {
						var matched = token[1].match(
						// [ all, head space, option name or value, undefined,
						// undefined, tail space ]
						// or
						// [ all, head space, option name, "="+space, value,
						// tail space ]
						/^([\s\n]*)([^={}\[\]<>\s\n][^={}\[\]<>]*?)(?:(=[\s\n]*)([\s\S]*?))?([\s\n]*)$/
						// TODO: 經測試，link等號前方不可有空格，alt等號前方可有空格。必須用小寫的"alt"。
						// 現在的處理方法只允許等號前面不可有空格。
						// 檔案選項名稱可以在地化，不一定都是 [a-z]。
						);
						if (!matched) {
							// e.g., " a<br/>b "
							matched = token[1]
									.match(/^([\s\n]*)([\s\S]*?)([\s\n]*)$/);
							if (matched[1] || matched[3]) {
								// image_description
								parameters.caption
								// 相當於 .trim()
								= matched[2] = parse_wikitext(matched[2],
										options, queue);
								if (!matched[3])
									matched.pop();
								matched.shift();
								if (!matched[0])
									matched.shift();
								_set_wiki_type(matched, 'plain');
							} else {
								parameters.caption
								// assert: 前後都沒有空白。
								= matched = parse_wikitext(token[1], options,
										queue);
							}
							parameters.push(matched);
							if (!token[2]) {
								break;
							}
							continue;
						}

						// 除了 alt, caption 外，這些 option tokens 不應包含功能性代碼。

						matched[2]
						//
						= parse_wikitext(matched[2], options, queue);

						// has equal sign "="
						var has_equal = typeof matched[4] === 'string';
						if (has_equal) {
							// e.g., |alt=text|
							matched[4] = parse_wikitext(matched[4], options,
									queue);
							// [ head space, option name, "="+space, value,
							// tail space ]
							file_option = matched.slice(1);
						} else {
							// e.g., |right|
							// [ head space, option name or value, tail space ]
							file_option = [ matched[1],
							//
							matched[2], matched[5] ];
						}
						file_option = _set_wiki_type(file_option, 'plain');

						// 'right' of |right|, 'alt' of |alt=foo|
						var option_name = file_option[1],
						//
						option_value = has_equal && file_option[3];

						// reduce
						while (!file_option[0]) {
							file_option.shift();
						}
						while (!file_option.at(-1)) {
							file_option.pop();
						}
						if (file_option.length === 1) {
							file_option = file_option[0];
						}

						// console.log('-'.repeat(80)+64545646);
						// console.log(has_equal);
						// console.log(file_option);
						parameters.push(file_option);

						// 各參數設定。
						if (!has_equal && (option_name in file_options)) {
							if (!parameters[file_options[option_name]]
							// 'location' 等先到先得。
							|| file_options[option_name] !== 'location'
							// Type, display format
							&& file_options[option_name] !== 'format') {
								parameters[file_options[option_name]]
								//
								= option_name;
							}

						} else if (!has_equal
						//
						&& /^(?:(?:\d+)?x)?\d+ *px$/.test(option_name)) {
							// 以後到的為準。
							parameters.size = option_name;

						} else if (has_equal
								// 這些選項必須有 "="。無 "=" 的話，會被當作 caption。
								&&
								// page: DjVuファイルの場合、 page="ページ番号"で開始ページを指定できます。
								/^(?:link|alt|lang|page|thumbtime|start|end|class)$/
										.test(option_name)) {
							// 以後到的為準。
							if (option_name === 'link') {
								// pass .session
								option_value = wiki_API.normalize_title(
										option_value, options);
							}
							parameters[option_name] = option_value;
							parameters.index_of[option_name] = parameters.length - 1;

						} else if (has_equal
								&& /^(?:thumb|thumbnail|upright)$/
										.test(option_name)) {
							// 以後到的為準。
							// upright=1 →
							// parameters.size='upright'
							// parameters.upright='1'
							parameters[file_options
							//
							[option_name]] = option_name;
							parameters[option_name] = option_value;

						} else if (has_equal) {
							// 即使是空白也會被認作是 caption。
							// 相當於 .trim()
							if (typeof option_name === 'string'
									&& typeof option_value === 'string') {
								parameters.caption = option_name + '='
										+ option_value;
							} else {
								parameters.caption = [ option_name, '=',
										option_value ];
								parameters.caption
								//
								.toString = file_option.toString;
							}

						} else {
							// 相當於 .trim()
							parameters.caption = option_name;
						}

						if (!token[2]) {
							break;
						}
					}

				} else {
					var parsed_display_text = parse_wikitext(display_text,
							options, queue);
					// 需再進一步處理 {{}}, -{}- 之類。
					// [[w:en:Wikipedia:Categorization#Sort keys]]
					parameters[category_matched ? 'sort_key'
					// [[w:en:Wikipedia:Piped link]] the displayed text
					: 'display_text'] = parsed_display_text
					if (false && !category_matched) {
						parameters.plain_display_text = wikitext_to_plain_text(
								display_text, options);
					}
					parameters.push(parsed_display_text);
				}
			}

			if (page_name.oddly === 'link_inside_link') {
				// console.trace(parameters);
				// parameters.is_link = false;

				for (var index = 2; index < parameters.length; index++) {
					// recover missed '|' before display_text
					if (typeof parameters[index] === 'string') {
						parameters[index] = '|' + parameters[index];
					} else if (parameters[index].type === 'plain') {
						parameters[index].unshift('|');
					} else {
						parameters[index] = [ '|', parameters[index] ];
					}
				}

				parameters = parameters.flat();
				parameters.unshift('[[');
				parameters.push(']]');
				join_string_of_array(parameters);
				_set_wiki_type(parameters, 'plain');
			} else {
				if (file_matched || category_matched) {
					// shown by link, is a linking to a file
					// e.g., token[0][0].trim() === "File"; token[0]: namespace
					parameters.is_link = page_name[0].trim() === '';

					if (file_matched) {
						parameters.name
						// set file name without "File:"
						= wiki_API.normalize_title(file_matched[2]);
					} else if (category_matched) {
						parameters.name
						// set category name without "Category:"
						= wiki_API.normalize_title(category_matched[1]);
					}
				} else {
					parameters.is_link = true;
				}
				anchor = anchor.toString()
				// remove prefix: '#'
				.slice(1).trimEnd();
				var original_hash = anchor;
				// https://en.wikipedia.org/wiki/Percent-encoding#Types_of_URI_characters
				if (/^([\w\-~!*'();:@&=+$,/?#\[\]]|\.[\dA-F]{2})+$/
				// [[w:en:Help:Link#Section linking (anchors)]], section_title
				// e.g.,
				// [[臺灣話#.E5.8F.97.E6.97.A5.E6.9C.AC.E8.AA.9E.E5.BD.B1.E9.9F.BF.E8.80.85|(其他參考資料)]]
				.test(anchor)) {
					anchor = anchor.replace(/\.([\dA-F]{2})/g, '%$1');
				}
				// console.log([ original_hash, anchor ]);
				try {
					// if
					// (/^([\w\-.~!*'();:@&=+$,/?#\[\]]|%[\dA-F]{2})+$/.test(anchor))
					anchor = decodeURIComponent(anchor);
					if (/[\x00-\x1F\x7F]/.test(anchor)) {
						// e.g. [[w:ja:エヴァンゲリオン (架空の兵器)#Mark.09]]
						anchor = original_hash;
					}
				} catch (e) {
					// e.g., error after convert /\.([\dA-F]{2})/g
					anchor = original_hash;
				}
				// console.log(anchor);
				// wikilink_token.anchor without "#" 網頁錨點 section_title
				parameters.anchor = wiki_API.parse.anchor
						.normalize_anchor(anchor);
				// TODO: [[Special:]]
				// TODO: [[Media:]]: 連結到圖片但不顯示圖片
				_set_wiki_type(parameters, file_matched ? 'file'
						: category_matched ? 'category' : 'link');
				if (category_matched)
					parameters.set_sort_key = set_sort_key_of_category;
			}
			// console.trace(parameters);

			// [ page_name, anchor / section_title, display_text without '|' ]
			// anchor && anchor.startsWith('#')
			queue.push(parameters);
			return previous + include_mark + (queue.length - 1) + end_mark;
		}

		function parse_external_link(all, URL, delimiter, parameters) {
			// assert: all === URL + (delimiter || '') + (parameters || '')
			// including "'''". e.g., [http://a.b/''t'']
			var matched = URL.match(/^(.+?)(''.*)$/);
			if (matched) {
				URL = matched[1];
				if (delimiter) {
					parameters = matched[2] + delimiter + parameters;
				} else {
					// assert: parameters === undefined
					parameters = matched[2];
				}
				delimiter = '';
			}
			URL = [ URL.includes(include_mark)
			// 預防有特殊 elements 置入其中。此時將之當作普通 element 看待。
			? parse_wikitext(URL, options, queue)
			// 以 token[0].toString() 取得 URL。
			: _set_wiki_type(URL, 'url') ];
			if (delimiter || parameters) {
				// assert: /^\s*$/.test(delimiter)
				// && typeof delimiter === 'string'
				// && typeof parameters === 'string'
				// assert: parameters 已去除最前面的 delimiter (space)。
				if (normalize) {
					parameters = parameters.trimEnd();
					if (delimiter)
						delimiter = ' ';
				}
				// 紀錄 delimiter as {String}token[1]，
				// 否則 .toString() 時 .join() 後會與原先不同。
				URL.push(delimiter,
				// 經過改變，需再進一步處理。
				parse_wikitext(parameters, options, queue));
			}
			_set_wiki_type(URL, 'external_link');
			queue.push(URL);
			return include_mark + (queue.length - 1) + end_mark;
		}

		function parse_template_parameter(all, parameters) {
			// 自 end_mark 向前回溯。
			var index = parameters.lastIndexOf('{{{'), previous;
			if (index > 0) {
				previous = '{{{' + parameters.slice(0, index);
				parameters = parameters.slice(index + '}}}'.length);
			} else {
				previous = '';
			}
			library_namespace.debug(previous + ' + ' + parameters, 4,
					'parse_wikitext.parameter');

			parameters = parameters.split('|');
			parameters = parameters.map(function(token, index) {
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
			return previous + include_mark + (queue.length - 1) + end_mark;
		}

		// console.trace(session.configurations);
		var magic_words_hash = session
				&& session.configurations.magic_words_hash
				|| default_magic_words_hash;

		var extensiontag_hash = session
				&& session.configurations.extensiontag_hash
				|| wiki_extensiontags;
		var PATTERN_extensiontags = session
				&& session.configurations.PATTERN_extensiontags
				|| PATTERN_wiki_extensiontags;
		// PATTERN_extensiontags 正在使用中，避免污染。
		// For old version:
		// new RegExp(PATTERN_extensiontags.source,
		// PATTERN_extensiontags.flags || 'ig')
		var PATTERN_extensiontags_duplicated = new RegExp(PATTERN_extensiontags);
		var PATTERN_non_extensiontags = session
				&& session.configurations.PATTERN_non_extensiontags
				|| PATTERN_non_wiki_extensiontags;

		// or use ((PATTERN_transclusion))
		// allow {{|=...}}, e.g., [[w:zh:Template:Policy]]
		// PATTERN_template
		var PATTERN_for_transclusion = /{{([^{}][\s\S]*?)}}/g;
		function parse_transclusion(all, parameters) {
			// 自 end_mark 向前回溯。
			var index = parameters.lastIndexOf('{{'),
			// 在先的，在前的，前面的； preceding
			// (previous 反義詞 following, preceding 反義詞 exceeds)
			previous,
			// 因為可能有 "length=1.1" 之類的設定，因此不能採用 Array。
			// token.parameters[{String}key] = {String}value
			_parameters = Object.create(null),
			// token.index_of[{String}key] = {Integer}index
			parameter_index_of = Object.create(null);
			if (index > 0) {
				previous = '{{' + parameters.slice(0, index);
				parameters = parameters.slice(index + '}}'.length);
			} else {
				previous = '';
			}
			library_namespace.debug(
					'[' + previous + '] + [' + parameters + ']', 4,
					'parse_wikitext.transclusion');

			// TODO: 像是 <b>|p=</b> 會被分割成不同 parameters，
			// 但 <nowiki>|p=</nowiki>, <math>|p=</math> 不會被分割！
			parameters = parameters.split('|');

			// matched: [ all, functionname token, functionname, argument 1 ]
			var matched = parameters[0]
					.match(/^([\s\n]*#([a-z]+):)([\s\S]*)$/i);

			// if not [[mw:Help:Extension:ParserFunctions]]
			if (!matched) {
				parameters[0].each_between(include_mark, end_mark, function(
						index) {
					if (index && queue[index = +index]
					//
					&& !(queue[index].type in {
						// incase:
						// {{Wikipedia:削除依頼/ログ/{{今日}}}}
						transclusion : true,
						// incase:
						// {{Wikipedia:削除依頼/ログ/{{#time:Y年Fj日
						// |-7 days +9 hours}}}}
						magic_word_function : true,
						// {{tl{{{1|}}}|p}}
						parameter : true,

						// allow {{tl<!-- t= -->}}
						comment : true
					})) {
						// console.log(queue[index]);
						matched = true;
					}
				});

				if (matched
				// {{t<!-- -->{|p}}
				|| /[{}]/.test(parameters[0])) {
					// console.log(parameters);

					// e.g., `{{ {{tl|t}} | p }}` is incalid:
					// → `{{ {{t}} | p }}`
					return all;
				}

				// console.log(JSON.stringify(parameters[0]));

				// e.g., token.name ===
				// 'Wikipedia:削除依頼/ログ/{{#time:Y年Fj日|-7 days +9 hours}}'

			} else {
				// console.log(matched);

				// 有特殊 elements 置入其中。
				// e.g., {{ #expr: {{CURRENTHOUR}}+8}}}}

				// [[mw:Help:Extension:ParserFunctions]]
				// [[mw:Extension:StringFunctions]]
				// [[mw:Help:Magic words#Parser_functions]]
				// [[w:en:Help:Conditional expressions]]

				// will set latter
				parameters[0] = '';
				parameters.splice(1, 0, matched[3]);
			}

			index = 1;
			parameters = parameters.map(function(token, _index) {
				// trimEnd() of value, will push spaces in token[3].
				var tail_spaces = token.match(/[\s\n]*$/)[0];
				if (_index > 0 && tail_spaces) {
					token = token.slice(0, -tail_spaces.length);
				}
				// 預防經過改變，需再進一步處理。
				token = parse_wikitext(token, Object.assign({
					inside_transclusion : true
				}, options), queue);

				if (_index === 0) {
					// console.log(token);

					if (false && typeof token === 'string') {
						return _set_wiki_type(token.split(normalize ? /\s*:\s*/
								: ':'), 'page_title');
					}
					// 有特殊 elements 置入其中。
					// e.g., {{ {{t|n}} | a }}
					return token;
				}

				// 規格書 parse parameters to:
				// numeral parameter: ['', '', value]
				// [name, '=', value]: [1, '=', value], ['', '=', value],
				// [[' name'], ' = ', [value], ' '].key = name

				// {Number}parameter_index =
				// template_token.index_of[parameter_name];
				//
				// parameter_token = template_token[parameter_index];
				// {String}parameter_name = parameter_token.key;
				// if (typeof parameter_name !== 'string') throw new
				// Error('Invalid parameter_token');
				//
				// trimmed parameter_value = parameter_token[2].toString();

				// https://test.wikipedia.org/wiki/L

				if (token.type !== 'plain') {
					// e.g., "{{#time:n月j日|2020-09-15|{{PAGELANGUAGE}}}}"
					token = _set_wiki_type([ token ], 'plain');
				}

				// assert: Array.isArray(token) && token.type === 'plain'

				var matched = undefined;
				// scan
				token.some(function(t, index) {
					if (typeof t !== 'string') {
						return t.type !== 'comment';
					}
					// allow {{|=...}}, e.g., [[w:zh:Template:Policy]]
					if (t.includes('=')) {
						// index of "=", index_of_assignment
						matched = index;
						return true;
					}
				});

				if (matched === undefined) {
					if (token.length === 1) {
						// assert: {String}token[0]
						// console.trace(token);
						token.unshift('', '');
					} else {
						// assert: token.length > 1
						token = _set_wiki_type([ '', '', token ], 'plain');
					}
					// assert: token === [ '', '', value ]
					if (tail_spaces) {
						token.push(tail_spaces);
					}

					var value = token[2];
					if (Array.isArray(value) && value.some(function(t) {
						// e.g., {{t|p<nowiki></nowiki>=v}}
						return typeof t === 'string' && t.includes('=');
					})) {
						// has_invalid_key_element
						token.invalid = true;
						// token.key = undefined;
						if (library_namespace.is_debug(3)) {
							library_namespace.error(
							//
							'parse_wikitext.transclusion: Invalid parameter ['
							//
							+ token + ']');
						}
					} else {
						token.key = index;
						parameter_index_of[index] = _index;
						if (typeof value === 'string')
							value = value.trim();
						_parameters[index++] = value;
					}
					return token;
				}

				// extract parameter name
				// https://www.mediawiki.org/wiki/Help:Templates#Named_parameters
				// assert: parameter name should these characters
				// https://test.wikipedia.org/wiki/Test_n
				// OK in parameter name: ":\\\/#\"'\n"
				// NG in parameter name: "=" /\s$/

				// 要是有合規的 `parameter_name`，
				// 則應該是 [ {String} parameter_name + " = ", ... ]。
				// prevent {{| ...{{...|...=...}}... = ... }}

				matched = token.splice(0, matched + 1);
				token = _set_wiki_type([ matched,
				//
				matched.pop(), token ], 'plain');

				// matched: [ key, value ]
				// matched = token[1].match(/^([^=]*)=([\s\S]*)$/);

				// trimEnd() of key, trimStart() of value
				matched = token[1].match(/\s*=\s*/);

				// assert: matched >= 0
				if (matched.index > 0) {
					// 將 "=" 前的非空白字元補到 key 去。
					token[0].push(token[1].slice(0, matched.index));
				}
				// key token must accept '\n'. e.g., "key_ \n _key = value"
				token.key = token[0].filter(function(t) {
					// 去除 comments
					// e.g., '{{L|p<!-- -->=v}}'
					// assert: token[0].type === 'plain'
					return typeof t === 'string';
				});
				matched.k = token.key.join('');
				if (token.key.length === token[0].length) {
					// token[0]: all {String}
					token[0] = matched.k;
				} else {
					_set_wiki_type(token[0], 'plain');
				}
				token.key = matched.k.trim();
				matched.i = matched.index + matched[0].length;
				if (matched.i < token[1].length) {
					// 將 "=" 後的非空白字元補到 value 去。
					token[2].unshift(token[1].slice(matched.i));
				}
				token[1] = matched[0];

				parameter_index_of[token.key] = _index;

				var value = token[2];
				// assert: Array.isArray(value) && value.type === 'plain'
				if (value.length < 2) {
					token[2] = value = value.length === 0 ? '' : value[0];
					if (!value && (matched = tail_spaces.match(/^[^\n]+/))) {
						// tail spaces: 刪掉 \n 前的所有 spaces。
						// [p, ' =', '', ' \n '] → [p, ' = ', '', '\n ']
						token[1] += matched[0];
						tail_spaces = tail_spaces.slice(matched[0].length);
					}
					// 處理某些特殊屬性的值。
					if (false && /url$/i.test(key)) {
						try {
							// 有些參數值會迴避"="，此時使用decodeURIComponent可能會更好。
							value = decodeURI(value);
						} catch (e) {
							// TODO: handle exception
						}
					}
				}
				// assert: token.length === 2
				if (tail_spaces) {
					token.push(tail_spaces);
				}

				// 若參數名重複: @see [[Category:調用重複模板參數的頁面]]
				// 如果一個模板中的一個參數使用了多於一個值，則只有最後一個值會在顯示對應模板時顯示。
				// parser 調用超過一個Template中參數的值，只會使用最後指定的值。

				// parameter_index_of[token.key] = _index;
				_parameters[token.key] = value;
				return token;
			});

			// add properties

			// console.trace(matched);
			if (matched) {
				parameters[0] = matched[1];
				parameters.name = matched[2];
				// 若指定 .valueOf = function()，
				// 會造成 '' + token 執行 .valueOf()。
				parameters.evaluate = evaluate_parser_function;

			} else {
				// console.trace(parameters[0]);
				if (typeof parameters[0] === 'string') {
					parameters.name = parameters[0];
				} else {
					// assert: Array.isArray(parameters[0]) &&
					// (parameters[0].type === 'page_title'
					// || parameters[0].type = 'plain')
					parameters.name = parameters[0].filter(function(t) {
						return t.type !== 'comment';
					}).join('');
				}
				// console.trace(parameters.name);
				// 後面不允許空白。 must / *DEFAULTSORT:/
				parameters.name = parameters.name.trimStart();
				var namespace = parameters.name.match(/^([^:]+):([\s\S]*)$/);
				// console.trace([ parameters.name, namespace ]);
				if (!namespace)
					namespace = [ , parameters.name ];
				// incase "{{ DEFAULTSORT : }}"
				namespace[1] = namespace[1].trim()
				// 'Defaultsort' → 'DEFAULTSORT'
				.toUpperCase();

				if ((namespace[1] in magic_words_hash)
				// 例如 {{Fullurl}} 應被視作 template。
				// test if token is [[Help:Magic words]]
				&& (magic_words_hash[namespace[1]] === false
				// 這些需要指定數值。 has ":"
				|| namespace[0])) {
					// TODO: {{ {{UCFIRST:T}} }}
					// TODO: {{ :{{UCFIRST:T}} }}
					// console.log(parameters);

					parameters.name = namespace[1];
					// 此時以 parameters[0].slice(1) 可獲得首 parameter。
					parameters.is_magic_word = true;

					if (parameters.length === 1
							&& typeof parameters[0] === 'string') {
						var matched = parameters[0].match(/^(\w+:)([\s\S]*)$/);
						if (matched) {
							parameters[0] = matched[1];
							parameters.push(matched[2]);
						}
					}

				} else {
					if (namespace[0]) {
						parameters.name = namespace[2];
						namespace = namespace[1];
					} else {
						namespace = null;
					}
					// 正規化 template name。
					// 'ab/cd' → 'Ab/cd'
					parameters.name = wiki_API.normalize_title(parameters.name);
					// console.log(parameters.name);

					// parameters.name: template without "Template:" prefix.
					// parameters.page_title: page title with "Template:"
					// prefix.

					var PATTERN_template_namespaces = /^(?:Template|模板|テンプレート|Plantilla|틀)/i;
					var not_template_name = namespace
					// 預防 {{Template:name|...}}
					&& !PATTERN_template_namespaces.test(namespace)
					// wiki_API.namespace.hash using lower case
					&& (namespace.toLowerCase() in wiki_API.namespace.hash);

					// {{T}}嵌入[[Template:T]]
					// {{Template:T}}嵌入[[Template:T]]
					// {{:T}}嵌入[[T]]
					// {{Wikipedia:T}}嵌入[[Wikipedia:T]]
					parameters.page_title
					// .page_name
					= wiki_API.normalize_title((not_template_name ? namespace
							: 'Template')
							+ ':' + parameters.name);

					if (not_template_name) {
						parameters.name = parameters.page_title;
					}

					if (true) {
						;
					} else if (typeof parameters[0] === 'string') {
						var index = parameters[0]
								.indexOf(parameters.page_title);
						if (index !== NOT_FOUND) {
							parameters.page_title = _set_wiki_type(
									parameters.page_title
											.split(normalize ? /\s*:\s*/ : ':'),
									'page_title');
							parameters[0] = [
									parameters[0].slice(0, index),
									parameters.page_title,
									parameters[0].slice(0, index
											+ parameters.page_title.length) ];
						} else if (false) {
							parameters[0] = _set_wiki_type(token
									.split(normalize ? /\s*:\s*/ : ':'),
									'page_title');
						}
					} else {
						parameters.page_title = _set_wiki_type(
								parameters.page_title
										.split(normalize ? /\s*:\s*/ : ':'),
								'page_title');
					}
				}
			}
			// 參數有分大小寫與繁簡體。
			parameters.parameters = _parameters;
			parameters.index_of = parameter_index_of;

			_set_wiki_type(parameters, matched ? 'magic_word_function'
					: 'transclusion');
			queue.push(parameters);
			// TODO: parameters.parameters = []
			return previous + include_mark + (queue.length - 1) + end_mark;
		}

		// parser 標籤中的空屬性現根據HTML5規格進行解析。
		// <pages from= to= section=1>
		// 將解析為 <pages from="to=" section="1">
		// 而不是像以前那樣的 <pages from="" to="" section="1">。
		// 請改用 <pages from="" to="" section=1> or <pages section=1>。

		// [ all attributes, name, value, unquoted value, text without "=" ]
		var PATTERN_tag_attribute = /\s*(\w+)(?:=|{{\s*=\s*(?:\|[\s\S]*?)?}})("[^"]*"|'[^']*'|([^\s"'{}\|]*))|\s*([^\s"'{}\|]*)/g;

		function extract_tag_attributes(attributes) {
			// assert: typeof attributes === 'string'
			var attribute_hash = Object.create(null);

			/**
			 * TODO: parse for templates <code>

			對於 [[w:en:Template:Infobox aircraft begin]]
			{|{{Infobox aircraft begin
			 |parameters go here
			}}
			|}

			可能把整個模板內容全部當作 attributes。
			
			</code>
			 */
			if (attributes.replace(
			// TODO: allow all magic words
			/{{\s*(?:=|ANCHORENCODE:[^{}\|]*)\s*(?:\|[\s\S]*?)?}}/ig, '')
					.includes('{{')) {
				library_namespace.debug('Skip tag attributes with template: '
						+ attributes);
				return attribute_hash;
			}

			var attributes_list = [], matched;
			while ((matched = PATTERN_tag_attribute.exec(attributes))
					&& matched[0]) {
				// console.trace(matched);
				attributes_list.push(parse_wikitext(matched[0], options));
				var name = matched[1];
				if (!name) {
					// console.assert(!!matched[4]);
					if (matched[4]) {
						name = parse_wikitext(matched[4], options);
						// assert: name.toString() === matched[4]
						attribute_hash[/* name.toString() */matched[4]] = name;
					}
					continue;
				}

				// parse attributes
				// name = parse_wikitext(name, options);
				var value = matched[3]
				// 去掉 "", ''
				|| matched[2].slice(1, -1);
				if (wiki_API.HTML_to_wikitext)
					value = wiki_API.HTML_to_wikitext(value);
				value = parse_wikitext(value, options);
				attribute_hash[name] = value;
			}
			if (false) {
				console
						.assert(PATTERN_tag_attribute.lastIndex === attributes.length);
			}
			// reset PATTERN index
			PATTERN_tag_attribute.lastIndex = 0;

			return attribute_hash;
		}

		// parse attributes of HTML tags
		// Warning: `{|\n|-\n!id="h style=color:red|h\n|}`
		// will get id==="h_style=color:red", NOT id==="h"!
		function parse_tag_attributes(attributes) {
			// assert: typeof attributes === 'string'
			attributes = _set_wiki_type(
			// e.g., '{{tl|<b a{{=}}"A">i</b>}}'
			shallow_resolve_escaped(attributes || '', options, queue),
					'tag_attributes');
			// 注意: attribute_token.attributes 中的 template 都不包含
			// template_token.expand() !
			// 可利用 for_each_token() 設定 template_token.expand()。
			attributes.attributes = extract_tag_attributes(attributes
					.toString());
			return attributes;
		}

		// ------------------------------------------------

		function parse_HTML_tag(all, tag, attributes, inner, end_tag) {
			// console.log('queue start:');
			// console.log(queue);
			// console.trace(arguments);

			// 自 end_mark (tag 結尾) 向前回溯，檢查是否有同名的 tag。
			var matched = tag !== 'nowiki' && inner.match(new RegExp(
			// 但這種回溯搜尋不包含 <nowiki>
			// @see console.log(parser[418]);
			// https://zh.moegirl.org.cn/index.php?title=Talk:%E6%8F%90%E9%97%AE%E6%B1%82%E5%8A%A9%E5%8C%BA&oldid=3704938
			// <nowiki>{{subst:unwiki|<nowiki>{{黑幕|黑幕内容}}</nowiki&gt;}}</nowiki>
			'([\\s\\S]*)<(' + tag
			//
			+ ')(\\s(?:[^<>]*[^<>/])?)?>([\\s\\S]*?)$', 'i')), previous;
			if (matched) {
				previous = all.slice(0, matched[1].length - matched[0].length
				// length of </end_tag>
				- end_tag.length - 3);
				tag = matched[2];
				attributes = matched[3];
				inner = matched[4];
			} else {
				previous = '';
			}
			library_namespace.debug(previous + ' + <' + tag + '>', 4,
					'parse_wikitext.tag');

			var is_wiki_extensiontags = tag.toLowerCase() in extensiontag_hash;
			// 在章節標題、表格 td/th 或 template parameter 結束時，
			// e.g., "| t || <del>... || </del> || <s>... || </s> ||", "{{t|p=v<s>...|p2=v}}</s>"
			// 部分 HTML font style tag 似乎會被截斷，自動重設屬性，不會延續下去。
			// 因為已經先處理 {{Template}}，因此不需要用 /\n(?:[=|!]|\|})|[|!}]{2}/。
			// 此時同階的 table 尚未處理。
			if (!is_wiki_extensiontags && /\n[|!]|[|!]{2}/.test(inner.replace(
			// PATTERN_extensiontags 正在使用中，避免污染。
			PATTERN_extensiontags_duplicated, ''))) {
				// TODO: 應確認此時真在表格中。
				if (library_namespace.is_debug(3)) {
					library_namespace.warn('parse_wikitext.tag: <' + tag + '>'
					//
					+ ' 在表格 td/th 或 template parameter 中，'
					//
					+ '此時視為一般 text，當作未匹配 match HTML tag 成功。\n' + previous);
					library_namespace.info(attributes);
					library_namespace.log(inner);
					console.trace(new RegExp('^([\\s\\S]*)<(' + tag
							+ ')(\\s(?:[^<>]*[^<>/])?)?>([\\s\\S]*?)$', 'i'));
				}
				return all;
			}

			if (library_namespace.is_debug(3)) {
				library_namespace.info('parse_wikitext.tag: <' + tag
						+ '> passed:\n' + previous);
				library_namespace.debug(attributes, 0);
				library_namespace.log(inner);
			}

			// 2016/9/28 9:7:7
			// 因為 wiki_extensiontags 內部可能已解析成其他的單元，
			// 因此還是必須 parse_wikitext()。
			// e.g., '<nowiki>-{}-</nowiki>'
			// 經過改變，需再進一步處理。
			library_namespace.debug('<' + tag + '> 內部需再進一步處理。', 4,
					'parse_wikitext.tag');
			attributes = parse_tag_attributes(attributes);
			inner = parse_wikitext(inner, options, queue);

			// 處理特殊 tags。
			if (tag === 'nowiki' && Array.isArray(inner)) {
				library_namespace.debug('-'.repeat(70)
						+ '\n<nowiki> 中僅留 -{}- 有效用。', 3,
						'parse_wikitext.transclusion');
				// console.log(inner);
				if (inner.type && inner.type !== 'plain') {
					// 當 inner 本身就是特殊 token 時，先把它包裝起來。
					inner = _set_wiki_type([ inner ], 'plain');
				}
				// TODO: <nowiki><b>-{...}-</b></nowiki>
				inner.forEach(function(token, index) {
					// 處理每個子 token。 經測試，<nowiki>中 -{}- 也無效。
					if (token.type /* && token.type !== 'convert' */)
						inner[index] = inner[index].toString();
				});
				if (inner.length <= 1) {
					inner = inner[0];
				}
				// console.log(inner);
			}
			// 若為 <pre> 之內，則不再變換。
			// 但 MediaWiki 的 parser 有問題，若在 <pre> 內有 <pre>，
			// 則會顯示出內部<pre>，並取內部</pre>為外部<pre>之結尾。
			// 因此應避免 <pre> 內有 <pre>。
			if (false && !is_wiki_extensiontags) {
				inner = inner.toString();
			}

			// [ ... ]: 在 inner 為 Template 之類時，
			// 不應直接在上面設定 type=tag_inner，以免破壞應有之格式！
			// 但仍需要設定 type=tag_inner 以應 for_each_token() 之需，因此多層[]包覆。
			inner = _set_wiki_type([ inner || '' ], 'tag_inner');
			all = [ attributes, inner ];

			if (normalize) {
				tag = tag.toLowerCase();
			} else if (tag !== end_tag) {
				all.end_tag = end_tag;
			}
			all.tag = tag;
			// {String}Element.tagName
			// all.tagName = tag.toLowerCase();

			all = _set_wiki_type(all, 'tag');
			// 在遍歷 tag inner 的子 node 時，真正需要的 .parent 是 all tag 而非 inner。
			// e.g., `special page configuration.js`
			// if (parent.type === 'tag_inner' && parent.parent.type === 'tag'
			// && (parent.parent.tag === 's' || parent.parent.tag === 'del'))
			// { ... }
			inner.parent = all;
			// attributes.parent = all;
			if (attributes && attributes.attributes) {
				all.attributes = attributes.attributes;
				// delete attributes.attributes;
			}
			queue.push(all);
			// console.log('queue end:');
			// console.log(queue);
			return previous + include_mark + (queue.length - 1) + end_mark;
		}

		function parse_single_tag(all, slash, tag, attributes) {
			if (attributes) {
				if (normalize) {
					attributes = attributes.replace(/[\s\/]*$/, ' /');
				}
				attributes = parse_tag_attributes(attributes);
				if (false && attributes.type === 'plain') {
					// assert: 經過 parse_tag_attributes(), 應該不會到這邊。
					all = attributes;
				} else
					all = [ attributes ];
			} else {
				// use '' as attributes in case
				// the .join() in .toString() doesn't work.
				all = [ '' ];
			}

			if (normalize) {
				tag = tag.toLowerCase();
			}
			if (slash) {
				// prefix slash: This is invalid.
				all.slash = slash;
			}
			all.tag = tag;
			// {String}Element.tagName
			// all.tagName = tag.toLowerCase();

			_set_wiki_type(all, 'tag_single');
			if (attributes && attributes.attributes) {
				all.attributes = attributes.attributes;
				delete attributes.attributes;
			}
			queue.push(all);
			return include_mark + (queue.length - 1) + end_mark;
		}

		// ------------------------------------------------

		function parse_table(all, parameters) {
			// 經測試，table 不會向前回溯。

			function append_table_cell(table_cell, delimiter, table_row_token) {
				if (!table_cell && !delimiter) {
					// e.g., '' after 'style=""' in `{|\n|-style=""\n|t\n|}`
					return;
				}

				if (false && typeof delimiter !== 'string') {
					// e.g., 'ss' and 'ee' in
					// `{|class="wikitable"\n|-\nss||f\n|-\nee\n|}`
					table_row_token.push(shallow_resolve_escaped(table_cell));
					return;
				}

				var PATTERN_table_cell_content = /^([^|]*)\|([\s\S]*)$/;
				// cell attributes /
				// cell style / format modifier (not displayed)
				var table_cell_attributes = table_cell
						.match(PATTERN_table_cell_content);
				var data_type, value;
				if (table_cell_attributes) {
					// parse cell attributes
					table_cell = table_cell_attributes[2];
					table_cell_attributes = _set_wiki_type(
							parse_tag_attributes(table_cell_attributes[1]),
							'table_attributes');
					// '|': from PATTERN_table_cell_content
					table_cell_attributes.suffix = '|';
					data_type = table_cell_attributes.attributes
					// @see
					// [[w:en:Help:Sorting#Specifying_a_sort_key_for_a_cell]]
					&& table_cell_attributes.attributes['data-sort-type'];
				}

				var table_cell_token = _set_wiki_type(
						shallow_resolve_escaped(table_cell), 'table_cell');
				if (table_row_token.type === 'caption') {
					table_cell_token.caption = table_cell_token.toString()
							.trim();
					// 表格標題以首次出現的為主。
					if (!table_row_token.caption) {
						table_row_token.caption = table_cell_token.caption;
					}
				}
				if (table_cell_attributes) {
					table_cell_token.unshift(table_cell_attributes);
				}
				if (delimiter)
					table_cell_token.delimiter = delimiter;

				data_type = data_type && data_type.trim();
				if (data_type === 'number') {
					if (library_namespace.is_digits(table_cell)) {
						value = +table_cell;
					}
				} else if (data_type === 'isoDate') {
					value = Date.parse(table_cell);
				}
				if (value || value === 0)
					table_cell_token.value = value;

				if (table_cell_token.is_header = table_row_token.cell_is_header_now) {
					// TODO: data-sort-type in table header
					// @see
					// [[w:en:Help:Sorting#Configuring the sorting]]

					table_row_token.header_count++;
				} else {
					table_row_token.data_count++;
				}
				if (false) {
					// is cell <th> or <td> ?
					table_cell_token.table_cell_type = table_cell_token.is_header ? 'th'
							: 'td';
				}

				table_row_token.push(table_cell_token);
			}

			// 分隔 <td>, <th>
			// 必須有實體才能如預期作 .exec()。
			// matched: [ all, inner, delimiter ]
			var PATTERN_table_cell;
			// invalid:
			// | cell !! cell
			// valid:
			// ! header !! header
			// ! header || header
			// | cell || cell
			var PATTERN_table_cell_th = /([\s\S]*?)(\n[|!]|[|!]{2}|$)/g;
			// default pattern for normal row.
			var PATTERN_table_cell_td = /([\s\S]*?)(\n[|!]|\|\||$)/g;
			function append_table_row(table_row, delimiter, table_token) {
				if (!table_row && !delimiter) {
					// e.g., '' after 'style=""' in `{|\nstyle=""\n|-\n|}`
					return;
				}

				if (typeof JSON === 'object') {
					library_namespace.debug('parse table_row / row style: '
					//
					+ JSON.stringify(table_row), 5, 'parse_wikitext.table');
				}

				// 注意: caption 不被當作 table_row 看待。
				var type = delimiter === '\n|+' ?
				// 'table_caption'
				'caption' : 'table_row';
				var table_row_token = _set_wiki_type([], type);
				table_row_token.delimiter = delimiter;
				// Warning:
				// only using table_row_token.header_count may lost some td
				// <th> counter
				table_row_token.header_count = 0;
				// <td> counter
				table_row_token.data_count = 0;

				PATTERN_table_cell = PATTERN_table_cell_td;
				table_row_token.cell_is_header_now = false;

				var last_delimiter;
				// caption allow `{|\n|+style|caption 1||caption 2\n|}`
				var matched = type !== 'caption' && table_row.match(/^.+/);
				if (matched) {
					// "\n|-" 後面緊接著，換行前的 string 為
					// table row style / format modifier (not displayed)
					table_row_token.push(_set_wiki_type(
							parse_tag_attributes(matched[0]),
							'table_attributes'));
					PATTERN_table_cell.lastIndex = matched[0].length;
				} else {
					// reset PATTERN index
					PATTERN_table_cell.lastIndex = 0;
				}

				while (matched = PATTERN_table_cell.exec(table_row)) {
					// console.log(matched);
					append_table_cell(matched[1], last_delimiter,
							table_row_token);
					if (!matched[2]) {
						// assert: /$/, no separator, ended.
						if (false) {
							console
									.assert(PATTERN_table_cell.lastIndex === table_row.length);
						}
						// reset PATTERN index
						// PATTERN_table_cell.lastIndex = 0;
						break;
					}
					// matched[2] 屬於下一 cell。
					last_delimiter = matched[2];
					if (/^\n/.test(last_delimiter)
					//
					&& table_row_token.cell_is_header_now !==
					// !!matched: convert to header
					(matched = last_delimiter === '\n!')) {
						// switch pattern
						var lastIndex = PATTERN_table_cell.lastIndex;
						table_row_token.cell_is_header_now = matched;
						PATTERN_table_cell = matched ? PATTERN_table_cell_th
								: PATTERN_table_cell_td;
						PATTERN_table_cell.lastIndex = lastIndex;
					}
				}

				// 處理表格標題。
				if (table_row_token.caption
				// 表格標題以首次出現的為主。
				&& !table_token.caption) {
					table_token.caption = table_row_token.caption;
				}
				delete table_row_token.cell_is_header_now;
				table_token.push(table_row_token);
			}

			var table_token = _set_wiki_type([], 'table');
			// 添加新行由一個豎線和連字符 "|-" 組成。
			var PATTERN_table_row = /([\s\S]*?)(\n\|[\-+]|$)/g;
			// default: table_row. try `{|\n||1||2\n|-\n|3\n|}`
			var last_delimiter;
			var matched = parameters.match(/^.+/);
			if (matched) {
				// the style of whole <table>
				table_token.push(_set_wiki_type(
						parse_tag_attributes(matched[0]), 'table_attributes'));
				PATTERN_table_row.lastIndex = matched[0].length;
			}
			while (matched = PATTERN_table_row.exec(parameters)) {
				// console.log(matched);
				append_table_row(matched[1], last_delimiter, table_token);
				if (!matched[2]) {
					// assert: /$/, no separator, ended.
					if (false) {
						console
								.assert(PATTERN_table_row.lastIndex === parameters.length);
					}
					// reset PATTERN index
					// PATTERN_table_row.lastIndex = 0;
					break;
				}
				// matched[2] 屬於下一 row。
				last_delimiter = matched[2];
			}

			if (false) {
				console.assert(table_token.every(function(table_row_token) {
					return table_row_token.type === 'table_attributes'
							|| table_row_token.type === 'caption'
							|| table_row_token.type === 'table_row';
				}));
			}

			queue.push(table_token);
			// 因為 "\n" 在 wikitext 中為重要標記，因此 restore 之。
			return '\n' + include_mark + (queue.length - 1) + end_mark;
		}

		function parse_behavior_switch(all, switch_word) {
			var parameters = _set_wiki_type(switch_word, 'switch');
			if (!queue.switches) {
				queue.switches = Object.create(null);
			}
			if (!queue.switches[switch_word]) {
				queue.switches[switch_word] = [ parameters ];
			} else {
				// 照理來說通常不應該要有多個 switches...
				queue.switches[switch_word].push(parameters);
			}
			queue.push(parameters);
			return include_mark + (queue.length - 1) + end_mark;
		}

		function parse_apostrophe_type(all, apostrophes, parameters, postfix) {
			// console.log([ all, apostrophes, parameters, postfix ]);
			var index = parameters.lastIndexOf(apostrophes), previous = '';
			if (index !== NOT_FOUND) {
				previous = apostrophes + parameters.slice(0, index);
				parameters = parameters.slice(index + apostrophes.length);
			}
			// 預防有特殊 elements 置入其中。此時將之當作普通 element 看待。
			parameters = parse_wikitext(parameters, options, queue);
			// console.log(parameters);
			// 注意: parameters.length 可能大於1
			var type;
			if (apostrophes === "'''''") {
				// e.g., "''''''t''''''"
				parameters = [ _set_wiki_type(parameters, 'bold') ];
				type = 'italic';
			} else {
				type = apostrophes === "''" ? 'italic' : 'bold';
			}
			parameters = _set_wiki_type(parameters, type);
			if (apostrophes === postfix) {
				postfix = '';
			} else {
				parameters.no_end = true;
			}
			queue.push(parameters);
			return previous + include_mark + (queue.length - 1) + end_mark
					+ postfix;
		}

		function parse_section(all, previous, section_level, parameters,
				postfix) {
			function not_only_comments(token) {
				return typeof token === 'string' ? !/^[ \t]+$/.test(token)
				// assert: is_parsed_element(tail)
				: token.type !== 'comment';
			}
			if (postfix && postfix.includes(include_mark)) {
				if (false) {
					console.assert(postfix.includes(include_mark)
							&& postfix.includes(end_mark))
					console.log(JSON.stringify(postfix));
				}
				var tail = parse_wikitext(postfix, options, queue);
				// console.log(tail);
				if (is_parsed_element(tail) && (tail.type === 'plain'
				//
				? tail.some(not_only_comments) : not_only_comments(tail))) {
					// console.log(all);
					return all;
				}
				// tail = "<!-- ... -->", "\s+" or ["<!-- ... -->", "\s+", ...]
				postfix = tail;
			}

			// console.log('==> ' + JSON.stringify(all));
			if (normalize) {
				parameters = parameters.trim();
			}

			parameters = wiki_API.section_link.pre_parse_section_title(
					parameters, options, queue);
			parameters = _set_wiki_type(parameters, 'section_title');

			// Use plain section_title instead of title with wikitext.
			// 因為尚未resolve_escaped()，直接使用未parse_wikitext()者會包含未解碼之code!
			// parameters.title = parameters.toString().trim();

			// console.trace(options);
			// wiki_API.section_link() 會更動 parse_wikitext() 之結果，
			// 因此不直接傳入 parsed，而是 .toString() 另外再傳一次。
			parameters.link = wiki_API.section_link(parameters.toString(),
			// options: pass session. for options.language
			Object.assign(Object.clone(options), {
				// 重新造一個 options 以避免污染。
				target_array : null
			}));
			/** {String}section title in wikitext */
			parameters.title = parameters.link.id;

			if (postfix && !normalize)
				parameters.postfix = postfix;
			var level = section_level.length;
			// assert: level >= 1
			parameters.level = level;

			parameters.child_section_titles = [];
			// 去尾。
			section_title_hierarchy.truncate(level);
			section_title_hierarchy[level] = parameters;
			// console.log(section_title_hierarchy);
			while (level > 0) {
				// 注意：可能 level 2 跳到 4，不一定連續！
				// level 1 的 child_section_titles 可能包含 level 3!
				var parent_section_title = section_title_hierarchy[--level];
				if (parent_section_title) {
					// Create linkages
					if (level > 0) {
						if (false) {
							library_namespace.log(parent_section_title + ' → '
									+ parameters);
						}
						parameters.parent_section_title = parent_section_title;
					} else {
						// assert: is root section list, parent_section_title
						// === parsed.child_section_titles
						// === section_title_hierarchy[0]
					}
					parent_section_title.child_section_titles.push(parameters);
					break;
				}
			}

			queue.push(parameters);
			// 因為 "\n" 在 wikitext 中為重要標記，因此 restore 之。
			return previous + include_mark + (queue.length - 1) + end_mark;
		}

		// @see {{Ordered list}}
		function parse_list_line(line) {
			function push_list_item(item, list_prefix, no_parse) {
				if (!no_parse) {
					// 經過改變，需再進一步處理。
					item = parse_wikitext(item, options, queue);
				}
				// console.trace(item);
				item = _set_wiki_type(item, 'list_item');
				// 將 .list_prefix 結合在 list_item 之上。
				// (list_item_token.list_prefix)。
				item.list_prefix = list_prefix;
				if (latest_list) {
					// Will be used by function remove_token_from_parent()
					item.parent = latest_list;
					// concole.assert(item.parent[item.index] === item);
					item.index = latest_list.length;
					item.list_index = latest_list.length ? latest_list.at(-1).list_index + 1
							: 0;
					if (latest_list.list_type === '#') {
						item.serial = item.list_index
						// (isNaN(item.start_serial) ? 1 : item.start_serial)
						+ 1;
					}
					latest_list.push(item);
				}
				return item;
			}

			var index = 0, position = 0;
			while (index < list_prefixes_now.length
			// 確認本行與上一行有多少相同的列表層級。
			&& list_prefixes_now[index] ===
			//
			(list_conversion[line.charAt(position)] || line.charAt(position))) {
				// position += list_prefixes_now[index++].length;
				index++;
				position++;
			}

			// console.log(list_now);
			list_prefixes_now.truncate(position);
			list_now.truncate(position);

			var list_prefix,
			// is <dt>
			is_dt,
			// latest_list === list_now[list_now.length - 1]
			latest_list = list_now[position - 1],
			// 尋找從本行開始的新列表。
			matched = line.slice(position).match(/^([*#;:]+)(\s*)(.*)$/);
			if (!matched) {
				if (position > 0) {
					// console.log([ position, line ]);
					// '\n': from `wikitext.split('\n')`
					list_prefix = '\n' + line.slice(0, position);
					is_dt = list_prefix.endsWith(';');
					line = line.slice(position);
					matched = line.match(/^\s+/);
					if (matched) {
						// 將空白字元放在 .list_prefix 可以減少很多麻煩。
						list_prefix += matched[0];
						line = line.slice(matched[0].length);
					}

					if (is_dt) {
						// line is not push_list_item() still,
						// when the `line` push_list_item(), its index will be
						// latest_list.length.
						latest_list.dt_index.push(latest_list.length);

						// search "; title : definition"
						if (matched = line.match(/^(.*)(:\s*)(.*)$/)) {
							push_list_item(matched[1], list_prefix);
							list_prefix = matched[2];
							line = matched[3];
						}
					}

					push_list_item(line, list_prefix);
				} else {
					// 非列表。
					// assert: position === -1
					lines_without_style.push(line.slice(position));
				}
				return;
			}

			if (position > 0) {
				// '\n': from `wikitext.split('\n')`
				list_prefix = '\n' + line.slice(0, position);
				if (list_prefix.endsWith(';')) {
					// line is not push_list_item() still,
					// when the `line` push_list_item(), its index will be
					// latest_list.length.
					latest_list.dt_index.push(latest_list.length);
				}
			} else {
				list_prefix = '';
			}

			var list_symbols = matched[1].split('');
			line = matched[3];
			list_symbols.forEach(function handle_list_item(list_type) {
				// 處理直接上多層選單的情況。
				// e.g., ";#a\n:#b"
				var list = _set_wiki_type([], 'list');
				// 注意: 在以 API 取得頁面列表時，也會設定 pages.list_type。
				list.list_type = list_conversion[list_type] || list_type;
				if (list.list_type === DEFINITION_LIST) {
					// list[list.dt_index[NO]] 為 ";"。
					list.dt_index = [];
				}

				if (latest_list) {
					var list_item = push_list_item([ list ],
					//
					list_prefix, true);
					if (false) {
						// is setup @ push_list_item()
						// list_item.parent = latest_list;
						// concole.assert(list_item.parent[list_item.index] ===
						// list_item);
						// list_item.index = latest_list.length - 1;
					}
					// 要算在上一個。
					list_item.list_index--;
					list_item.serial > 1 && list_item.serial--;
					list_item.no_need_to_count = true;
					list_prefix = list_type;
				} else {
					list_prefix += list_type;
					queue.push(list);
					lines_without_style.push(
					//
					include_mark + (queue.length - 1) + end_mark);
				}

				latest_list = list;
				list_now.push(list);
				list_prefixes_now.push(list.list_type);
			});

			// console.trace(latest_list);
			is_dt = list_prefix.endsWith(';');

			// matched[2]: 將空白字元放在 .list_prefix 可以減少很多麻煩。
			list_prefix += matched[2];

			// is <dt>, should use: ';' ===
			// latest_list.list_prefix.at(-1)
			// assert: latest_list.length === latest_list.list_prefix.length - 1
			if (is_dt) {
				// assert: latest_list.length === 0
				// latest_list.dt_index.push(latest_list.length);
				latest_list.dt_index.push(0);

				// search "; title : definition"
				if (matched = line.match(/^(.*)(:\s*)(.*)$/)) {
					push_list_item(matched[1], list_prefix);
					list_prefix = matched[2];
					line = matched[3];
				}
			}

			push_list_item(line, list_prefix);
		}

		function parse_hr_tag(line, index) {
			var matched = line.match(/^(-{4,})(.*)$/);
			if (!matched
			// 例如在模板、link 中，一開始就符合的情況。
			|| index === 0 && !initialized_fix) {
				lines_without_style.push(line);
				return;
			}

			var hr = _set_wiki_type(matched[1], 'hr');

			queue.push(hr);
			lines_without_style.push(include_mark + (queue.length - 1)
					+ end_mark + matched[2]);
		}

		function parse_preformatted(line, index) {
			if (!line.startsWith(' ')
			// 例如在模板、link 中，一開始就符合的情況。
			|| index === 0 && !initialized_fix) {
				if (list_now) {
					// reset
					list_now = null;
				}
				lines_without_style.push(line);
				return;
			}

			// 經過改變，需再進一步處理。
			// 1: ' '.length
			line = parse_wikitext(line.slice(1), options, queue);

			if (list_now) {
				list_now.push(line);
				return;
			}

			list_now = _set_wiki_type([ line ], 'pre');

			queue.push(list_now);
			lines_without_style.push(include_mark + (queue.length - 1)
					+ end_mark);
		}

		// ------------------------------------------------------------------------
		// parse sequence start / start parse

		// parse 範圍基本上由小到大。
		// e.g., transclusion 不能包括 table，因此在 table 前。

		// 得先處理完有開闔的標示法，之後才是單一標示。
		// e.g., "<pre>\n==t==\nw\n</pre>" 不應解析出 section_title。

		// 可順便作正規化/維護清理/修正明顯破壞/修正維基語法/維基化，
		// 例如修復章節標題 (section title, 節タイトル) 前後 level 不一，
		// table "|-" 未起新行等。

		// ----------------------------------------------------
		// 因為<nowiki>可以打斷其他的語法，包括"<!--"，因此必須要首先處理。

		wikitext = wikitext.replace_till_stable(PATTERN_extensiontags,
				parse_HTML_tag);

		// ----------------------------------------------------
		// comments: <!-- ... -->

		// TODO: <nowiki> 之優先度更高！置於 <nowiki> 中，
		// 如 "<nowiki><!-- --></nowiki>" 則雖無功用，但會當作一般文字顯示，而非註解。

		// "<\": for Eclipse JSDoc.
		if (initialized_fix) {
			wikitext = wikitext.replace(/<\!--([\s\S]*?)-->/g,
			// 因為前後標記間所有內容無作用、能置於任何地方（除了 <nowiki> 中，"<no<!-- -->wiki>"
			// 之類），又無需向前回溯；只需在第一次檢測，不會有遺珠之憾。
			function(all, parameters) {
				// 預防有特殊 elements 置入其中。此時將之當作普通 element 看待。
				// e.g., "<!-- <nowiki>...</nowiki> ... -->"
				parameters = parse_wikitext(parameters, options, queue);
				// 不再作 parse。
				parameters = parameters.toString();
				queue.push(_set_wiki_type(parameters, 'comment'));
				return include_mark + (queue.length - 1) + end_mark;
			})
			// 缺 end mark: "...<!--..."
			.replace(/<\!--([\s\S]*)$/, function(all, parameters) {
				if (initialized_fix[1]) {
					parameters = parameters.slice(0,
					//
					-initialized_fix[1].length);
					initialized_fix[1] = '';
				}
				// 預防有特殊 elements 置入其中。此時將之當作普通 element 看待。
				// e.g., "<!-- <nowiki>...</nowiki> ... -->"
				parameters = parse_wikitext(parameters, options, queue);
				// 不再作 parse。
				parameters = parameters.toString();
				parameters = _set_wiki_type(parameters, 'comment');
				if (!normalize)
					parameters.no_end = true;
				queue.push(parameters);
				return include_mark + (queue.length - 1) + end_mark;
			});
		}

		// ----------------------------------------------------

		// 為了 "{{Tl|a<ref>[http://a.a.a b|c {{!}} {{CURRENTHOUR}}]</ref>}}"，
		// 將 -{}-, [], [[]] 等，所有中間可穿插 "|" 的置於 {{{}}}, {{}} 前。

		// ----------------------------------------------------
		// language conversion -{}- 以後來使用的為主。
		// TODO: -{R|里}-
		// TODO: -{zh-hans:<nowiki>...</nowiki>;zh-hant:<nowiki>...</nowiki>;}-
		// TODO: 特別注意語法中帶有=>的單向轉換規則 [[w:zh:模組:CGroup/IT]]
		// 注意: 有些 wiki，例如 jawiki，並沒有開啟 language conversion。
		// https://zh.wikipedia.org/wiki/Help:中文维基百科的繁简、地区词处理#常用的轉換工具語法
		// [[w:zh:H:Convert]], [[w:zh:H:AC]]
		// [[mw:Help:Magic words]], [[mw:Writing systems/LanguageConverter]]
		// https://doc.wikimedia.org/mediawiki-core/master/php/LanguageConverter_8php_source.html
		// https://doc.wikimedia.org/mediawiki-core/master/php/ConverterRule_8php_source.html
		// https://doc.wikimedia.org/mediawiki-core/master/php/ZhConversion_8php_source.html
		// https://github.com/wikimedia/mediawiki/blob/master/languages/data/ZhConversion.php
		// {{Cite web}}漢字不被轉換: 可以使用script-title=ja:。
		// TODO: 使用魔術字 __NOTC__ 或 __NOTITLECONVERT__ 可避免標題轉換。
		// TODO: <source></source>內之-{}-無效。
		// TODO:
		// 自動轉換程序會自動規避「程式碼」類的標籤，包括<pre>...</pre>、<code>...</code>兩種。如果要將前兩種用於條目內的程式範例，可以使用空轉換標籤-{}-強制啟用轉換。

		wikitext = wikitext.replace_till_stable(/-{(|[^{].*?)}-/g,
				parse_language_conversion);

		// ----------------------------------------------------
		// wikilink
		// [[~:~|~]], [[~:~:~|~]]

		// 須注意: [[p|\nt]] 可，但 [[p\n|t]] 不可！

		// 注意: [[p|{{tl|t}}]] 不會被解析成 wikilink，因此 wikilink 應該要擺在 transclusion
		// 前面檢查，或是使 display_text 不包含 {{}}。

		// 但注意: "[[File:title.jpg|thumb|a{{tl|t}}|param\n=123|{{tl|t}}]]"
		// 可以解析成圖片, Caption: "{{tl|t}}"

		// TODO: bug: 正常情況下 "[[ ]]" 不會被 parse，但是本函數還是會 parse 成 link。
		// TODO: [[::zh:title]] would be rendered as plaintext

		wikitext = wikitext.replace_till_stable(
		// or use ((PATTERN_link))
		PATTERN_wikilink_global, parse_wikilink);

		// ----------------------------------------------------
		// external link
		// [http://... ...]
		// TODO: [{{}} ...]
		wikitext = wikitext.replace_till_stable(PATTERN_external_link_global,
				parse_external_link);

		// ----------------------------------------------------
		// {{{...}}} 需在 {{...}} 之前解析。
		// [[w:zh:Help:模板]]
		// 在模板頁面中，用三個大括弧可以讀取參數。
		// MediaWiki 會把{{{{{{XYZ}}}}}}解析為{{{ {{{XYZ}}} }}}而不是{{ {{ {{XYZ}} }} }}
		// allow "{{{}}}", e.g., [[w:zh:Template:Policy]]
		wikitext = wikitext.replace_till_stable(/{{{(|[^{}][\s\S]*?)}}}/g,
				parse_template_parameter);

		// ----------------------------------------------------
		// 模板（英語：Template，又譯作「樣板」、「範本」）
		// {{Template name|}}
		wikitext = wikitext.replace_till_stable(
		//
		PATTERN_for_transclusion, parse_transclusion);

		// ----------------------------------------------------

		// 由於 <tag>... 可能被 {{Template}} 截斷，因此先處理 {{Template}} 再處理 <t></t>。
		// 先處理 <t></t> 再處理 <t/>，預防單獨的 <t> 被先處理了。

		// ----------------------------------------------------
		// [[Help:HTML in wikitext]]

		// <del>不採用 global variable，預防 multitasking 並行處理。</del>
		// reset PATTERN index
		// PATTERN_WIKI_TAG.lastIndex = 0;

		// console.log(PATTERN_TAG);
		// console.trace(PATTERN_non_extensiontags);
		// console.trace(wikitext);

		// HTML tags that must be closed.
		// <pre>...</pre>, <code>int f()</code>
		wikitext = wikitext.replace_till_stable(PATTERN_non_extensiontags,
				parse_HTML_tag);

		// ----------------------------------------------------
		// single tags. e.g., <hr />
		// TODO: <nowiki /> 能斷開如 [[L<nowiki />L]]

		// reset PATTERN index
		// PATTERN_WIKI_TAG_VOID.lastIndex = 0;

		// assert: 有 end tag 的皆已處理完畢，到這邊的是已經沒有 end tag 的。
		wikitext = wikitext.replace_till_stable(PATTERN_WIKI_TAG_VOID,
				parse_single_tag);
		// 處理有明確標示為 simgle tag 的。
		// 但 MediaWiki 現在會將 <b /> 轉成 <b>，因此不再處理這部分。
		if (false) {
			wikitext = wikitext.replace_till_stable(
					/<(\/)?([a-z]+)(\s[^<>]*\/)?>/ig, parse_single_tag);
		}

		// ----------------------------------------------------
		// table: \n{| ... \n|}
		// TODO: 在遇到過長過大的表格時，耗時甚久。 [[w:en:List of Leigh Centurions players]]
		// 因為 table 中較可能包含 {{Template}}，但 {{Template}} 少包含 table，
		// 因此先處理 {{Template}} 再處理 table。
		// {|表示表格開始，|}表示表格結束。

		wikitext = wikitext.replace_till_stable(
		// [[Help:Table]]
		/\n{\|([\s\S]*?)\n\|}/g, parse_table);

		// ----------------------------------------------------

		wikitext = wikitext.replace(PATTERN_BEHAVIOR_SWITCH,
				parse_behavior_switch);

		// 若是要處理<b>, <i>這兩項，也必須調整 wiki_API.section_link()。

		// ''''b''''' → <i><b>b</b></i>
		// 因此先從<b>開始找。

		// '''~''' 不能跨行！ 注意: '''{{font color}}''', '''{{tsl}}'''
		// ''~'' 不能跨行！
		wikitext = wikitext.replace_till_stable(
				/('''''|'''?)([^'\n].*?'*)(\1)/g, parse_apostrophe_type);
		if (false) {
			// \n, $ 都會截斷 italic, bold
			// <tag> 不會截斷 italic, bold
			wikitext = wikitext.replace_till_stable(
					/('''''|'''?)([^'\n].*?)($|\n)/g, parse_apostrophe_type);
		}
		// '', ''' 似乎會經過微調: [[n:zh:Special:Permalink/120676]]

		// ~~~, ~~~~, ~~~~~: 不應該出現

		// ----------------------------------------------------
		// parse_wikitext.section_title

		// TODO: 經測試，"\n== <code>code<code> =="會被當作title，但採用本函數將會解析錯誤。
		// [[w:zh:Special:Diff/46814116]]

		// postfix 沒用 \s，是因為 node 中， /\s/.test('\n')，且全形空白之類的確實不能用在這。

		// @see PATTERN_section
		var PATTERN_section = new RegExp(
		// 採用 positive lookahead (?=\n|$) 是為了循序匹配 section title，不跳過任何一個。
		// 不採用則 parse_wiki 處理時若遇到連續章節，不會按照先後順序，造成這邊還不能設定
		// section_title_hierarchy，只能在 parsed.each_section() 設定。
		/(^|\n)(={1,6})(.+)\2((?:[ \t]|mark)*)(?=\n|$)/g.source.replace('mark',
				library_namespace.to_RegExp_pattern(include_mark) + '\\d+'
						+ library_namespace.to_RegExp_pattern(end_mark)), 'g');
		// console.log(PATTERN_section);
		// console.log(JSON.stringify(wikitext));

		// 應該一次遍歷就找出所有的 section title，否則 section_title_hierarchy 會出錯。
		wikitext = wikitext.replace(PATTERN_section, parse_section);

		// console.log('10: ' + JSON.stringify(wikitext));

		if (false) {
			// another method to parse.
			wikitext = '{{temp|{{temp2|p{a}r{}}}}}';
			pattern = /{{[\s\n]*([^\s\n#\|{}<>\[\]][^#\|{}<>\[\]]*)/g;
			matched = pattern.exec(wikitext);
			end_index = wikitext.indexOf('}}', pattern.lastIndex);

			PATTERN_wikilink;
		}

		// ----------------------------------------------------
		// 處理 / parse bare / plain URLs in wikitext: https:// @ wikitext
		// @see [[w:en:Help:Link#Http: and https:]]

		// console.log('11: ' + JSON.stringify(wikitext));

		// 在 transclusion 中不會被當作 bare / plain URL。
		if (!options.inside_transclusion) {
			wikitext = wikitext.replace(PATTERN_URL_WITH_PROTOCOL_GLOBAL,
			//
			function(all, previous, URL) {
				all = _set_wiki_type(URL, 'url');
				// 須注意:此裸露 URL 之 type 與 external link 內之type相同！
				// 因此需要測試 token.is_bare 以確定是否在 external link 內。
				all.is_bare = true;
				queue.push(all);
				return previous + include_mark + (queue.length - 1) + end_mark;
			});
		}

		// ----------------------------------------------------
		// 處理 / parse list @ wikitext
		// @see [[w:en:MOS:LIST]], [[w:en:Help:Wikitext#Lists]]
		// 注意: 這裡僅處理在原wikitext中明確指示列表的情況，無法處理以模板型式表現的列表。

		// 列表層級。 e.g., ['#','*','#',':']
		var list_prefixes_now = [], list_now = [],
		//
		lines_without_style = [],
		//
		list_conversion = {
			';' : DEFINITION_LIST,
			':' : DEFINITION_LIST
		};

		// console.log('12: ' + JSON.stringify(wikitext));
		// console.log(queue);

		wikitext = wikitext.split('\n');
		// e.g., for "<b>#ccc</b>"
		var first_line = !initialized_fix && wikitext.shift();

		wikitext.forEach(parse_list_line);
		wikitext = lines_without_style;

		// ----------------------------------------------------
		// parse horizontal rule, line, HTML <hr /> element: ----, -{4,}
		// @see [[w:en:Help:Wikitext#Horizontal rule]]
		// Their use in Wikipedia articles is deprecated.
		// They should never appear in regular article prose.

		// reset
		lines_without_style = [];

		wikitext.forEach(parse_hr_tag);
		wikitext = lines_without_style;

		// ----------------------------------------------------
		// parse preformatted text, HTML <pre> element: \n + space
		// @seealso [[w:en:Help:Wikitext#Pre]]

		// reset
		lines_without_style = [];
		// pre_list
		list_now = null;

		wikitext.forEach(parse_preformatted);
		wikitext = lines_without_style;

		// Release memory. 釋放被占用的記憶體。
		lines_without_style = null;

		if (!initialized_fix) {
			// recover
			wikitext.unshift(first_line);
		}
		wikitext = wikitext.join('\n');

		// ↑ parse sequence finished *EXCEPT FOR* paragraph
		// ------------------------------------------------------------------------

		// console.log('13: ' + JSON.stringify(wikitext));
		if (typeof options.postfix === 'function')
			wikitext = options.postfix(wikitext, queue, include_mark, end_mark)
					|| wikitext;

		// console.log('14: ' + JSON.stringify(wikitext));
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

		// ----------------------------------------------------
		// MUST be last: 處理段落 / parse paragraph @ wikitext

		// console.log('15: ' + JSON.stringify(wikitext));
		// [ all, text, separator ]
		var PATTERN_paragraph = /([\s\S]*?)((?:\s*?\n){2,}|$)/g;
		if (initialized_fix && options.parse_paragraph
				&& /\n\s*?\n/.test(wikitext)) {
			// 警告: 解析段落的動作可能破壞文件的第一層結構，會使文件的第一層結構以段落為主。
			wikitext = wikitext.replace(PATTERN_paragraph,
			// assert: 這個 pattern 應該能夠完全分割 wikitext。
			function(all, text, separator) {
				if (!all) {
					return '';
				}
				all = text.split('\n');
				// console.log(all);
				// 經過改變，需再進一步處理。
				all = all.map(function(t) {
					return parse_wikitext(t, options, queue);
				});
				// console.log(all);
				all = _set_wiki_type(all, 'paragraph');
				if (separator)
					all.separator = separator;
				// console.log('queue index: ' + queue.length);
				queue.push(all);
				return include_mark + (queue.length - 1) + end_mark;
			});
		}

		// console.log(wikitext);
		if (no_resolve) {
			return wikitext;
		}

		// console.log('16: ' + JSON.stringify(wikitext));
		queue.push(wikitext);
		if (false) {
			console.log('='.repeat(80));
			console.log(queue);
			console.log(JSON.stringify(wikitext));
			console.log(options);
		}
		resolve_escaped(queue, include_mark, end_mark);

		wikitext = queue.at(-1);
		// console.log(wikitext);
		if (initialized_fix
		// 若是解析模板，那麼添加任何的元素，都可能破壞轉換成字串後的結果。
		// plain: 表示 wikitext 可能是一個頁面。最起碼是以 .join('') 轉換成字串的。
		&& (wikitext.type === 'plain'
		// options.no_reduce, options.is_page
		|| options.with_properties)) {
			if (Array.isArray(options.target_array) && Array.isArray(wikitext)) {
				// 可藉以複製必要的屬性。
				// @see function parse_page(options)
				options.target_array.truncate();
				// copy parsed data to .target_array
				Array.prototype.push.apply(options.target_array, wikitext);
				wikitext = options.target_array;
			}

			if (queue.switches)
				wikitext.switches = queue.switches;

			if (!library_namespace.is_empty_object(queue.conversion_table))
				wikitext.conversion_table = queue.conversion_table;
			if (options.conversion_title)
				wikitext.conversion_title = queue.conversion_title;
		}

		// Release memory. 釋放被占用的記憶體。
		queue = null;

		if (initialized_fix
		// 若是解析模板，那麼添加任何的元素，都可能破壞轉換成字串後的結果。
		// plain: 表示 wikitext 可能是一個頁面。最起碼是以 .join('') 轉換成字串的。
		&& wikitext.type === 'plain' && !options.parse_paragraph) {
			// console.log(wikitext);
			// 純文字分段。僅切割第一層結構。
			for (var index = 0; index < wikitext.length; index++) {
				var token = wikitext[index], matched;
				// console.log('---> [' + index + '] ' + token);
				if (typeof token === 'string') {
					if (!/\n\s*?\n/.test(token)) {
						continue;
					}
					// 刪掉原先的文字 token = wikitext[index]。
					wikitext.splice(index, 1);
					// 從這裡開始，index 指的是要插入字串的位置。
					while ((matched = PATTERN_paragraph.exec(token))
							&& matched[0]) {
						// console.log('#1 ' + token);
						// console.log(matched);
						// text, separator 分開，在做 diff 的時候會更容易處理。
						if (matched[1] && matched[2]) {
							wikitext.splice(index, 0, matched[1], matched[2]);
							index += 2;
						} else {
							// assert:
							// case 1: matched[2] === '',
							// matched[0] === matched[1]
							// case 2: matched[1] === '',
							// matched[0] === matched[2]
							wikitext.splice(index++, 0, matched[0]);
						}
					}
					// 回復 index 的位置。
					index--;
					// reset PATTERN index
					PATTERN_paragraph.lastIndex = 0;

				} else {
					// assert: typeof wikitext[index] === 'object'
					if (index > 0
							&& typeof (token = wikitext[index - 1]) === 'string'
							&& (matched = token
									.match(/^([\s\S]*[^\s\n])([\s\n]*\n)$/))) {
						// e.g., ["abc \n","{{t}}"] → ["abc"," \n","{{t}}"]
						// console.log('#2 ' + token);
						// console.log(matched);
						// text, space 分開，在做 diff 的時候會更容易處理。
						wikitext.splice(index - 1, 1, matched[1], matched[2]);
						index++;
					}
					token = wikitext[index + 1];
					// console.log('>>> ' + token);
					if (typeof token === 'string'
							&& (matched = token.match(/^(\n+)([^\n][\s\S]*?)$/))) {
						// e.g., ["{{t}}","\nabc"] → ["{{t}}","\n","abc"]
						// console.log('#3 ' + token);
						// console.log(matched);
						// text, space 分開，在做 diff 的時候會更容易處理。
						wikitext.splice(index + 1, 1, matched[1], matched[2]);
					}
				}
			}

			// console.trace(section_title_hierarchy[0]);
			if (!options.target_array)
				Object.assign(wikitext, section_title_hierarchy[0]);
		}

		if (false) {
			library_namespace.debug('set depth ' + (depth_of_children - 1)
					+ ' to node [' + wikitext + ']', 3, 'parse_wikitext');
			wikitext[KEY_DEPTH] = depth_of_children - 1;
		}

		return wikitext;
	}

	// ------------------------------------------------------------------------

	// export 導出.

	Object.assign(parse_wikitext, {
		wiki_token_toString : wiki_token_toString,

		set_wiki_type : set_wiki_type
	});

	Object.assign(wiki_API, {
		// {Object} file option hash
		file_options : file_options,

		markup_tags : markup_tags,

		DEFINITION_LIST : DEFINITION_LIST,

		page_title_to_sort_key : page_title_to_sort_key,

		HTML_to_wikitext : HTML_to_wikitext,
		// wikitext_to_plain_text : wikitext_to_plain_text,

		parse : parse_wikitext
	});

	// --------------------------------------------------------------------------------------------

	// 不設定(hook)本 module 之 namespace，僅執行 module code。
	return library_namespace.env.not_to_extend_keyword;
}
