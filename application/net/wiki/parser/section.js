﻿/**
 * @name CeL function for MediaWiki (Wikipedia / 維基百科): parse sections and
 *       anchors
 * 
 * @fileoverview 本檔案包含了 MediaWiki 自動化作業用程式庫的子程式庫。
 * 
 * TODO:<code>

</code>
 * 
 * @since 2021/12/15 6:7:47 拆分自 CeL.application.net.wiki.parser 等
 */

// More examples: see /_test suite/test.js
// Wikipedia bots demo: https://github.com/kanasimi/wikibot
'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.wiki.parser.section',

	require : 'application.net.wiki.parser.'
	//
	+ '|application.net.wiki.parser.wikitext',

	// 設定不匯出的子函式。
	no_extend : 'this,*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring
	var wiki_API = library_namespace.application.net.wiki, KEY_SESSION = wiki_API.KEY_SESSION;
	// @inner
	var PATTERN_BOT_NAME = wiki_API.PATTERN_BOT_NAME;
	var for_each_token = wiki_API.parser.parser_prototype.each;

	var
	/** {Number}未發現之index。 const: 基本上與程式碼設計合一，僅表示名義，不可更改。(=== -1) */
	NOT_FOUND = ''.indexOf('_');

	// --------------------------------------------------------------------------------------------

	// 這些 <tag> 都不能簡單解析出來。
	// @see wiki_extensiontags
	var untextify_tags = {
		ref : true,
		// e.g., <references group="gg"/>
		references : true,
		math : true
	};

	// @inner
	function preprocess_section_link_token(token, options) {
		// console.trace(token);

		// 前置作業: 處理模板之類特殊節點。
		if (typeof options.preprocess_section_link_token === 'function') {
			token = options.preprocess_section_link_token(token, options);
		}
		// console.log(token);

		while (token.type === 'transclusion'
				&& typeof token.expand === 'function') {
			// console.trace(options);
			// expand template, .expand_template(), .to_wikitext()
			// https://www.mediawiki.org/w/api.php?action=help&modules=expandtemplates
			token = wiki_API.parse(token.expand(options), options);
			if (wiki_API.template_functions) {
				// console.trace(options);
				wiki_API.template_functions.adapt_function(token, null, null,
						options);
			}
			// console.trace([ token, token.expand, options ]);
		}

		// ------------------------

		if (token.type in {
			plain : true,
			tag_inner : true
		}) {
			for_each_token.call(token, function(sub_token, index, parent) {
				// console.trace(sub_token);
				sub_token = preprocess_section_link_token(sub_token, options);
				// console.trace(sub_token);
				return sub_token;
			}, options);
			return token;
		}

		if (token.type === 'comment') {
			return '';
		}

		// console.log(token);
		if (token.type === 'tag'/* || token.type === 'tag_single' */) {
			// token: [ tag_attributes, tag_inner ]
			if (token.tag === 'nowiki') {
				// escape characters inside <nowiki>
				return preprocess_section_link_token(token[1] ? token[1]
						.toString() : '', options);
			}

			// 容許一些特定標籤能夠顯示格式。以繼承原標題的粗體斜體和顏色等等格式。
			// @see markup_tags
			if (token.tag in {
				// style
				b : true,
				i : true,
				q : true,
				s : true,
				u : true,
				big : true,
				small : true,
				sub : true,
				sup : true,
				em : true,
				ins : true,
				del : true,
				strike : true,
				strong : true,
				font : true,
				code : true,
				ruby : true,
				rb : true,
				rt : true,
				// container
				span : true,
				div : true,

				// nowiki : true,
				langconvert : true
			}) {
				// reduce HTML tags. e.g., <b>, <sub>, <sup>, <span>
				token.tag_attributes = token.shift();
				token.original_type = token.type;
				token.type = 'plain';
				token.toString = wiki_API.parse.wiki_token_toString[token.type];
				return token;
			}

			// console.trace(token);

			// 其他 HTML tag 大多無法精確轉換。
			options.root_token_list.imprecise_tokens.push(token);

			if (token.tag in untextify_tags) {
				// trick: 不再遍歷子節點。避免被進一步的處理。
				token.is_atom = true;
				token.unconvertible = true;
				return token;
			}

			// TODO: <a>

			// token that may be handlable 請檢查是否可處理此標題。
			options.root_token_list.tokens_maybe_handlable.push(token);
			// reduce HTML tags. e.g., <ref>
			var new_token = preprocess_section_link_tokens(token[1] || '',
					options);
			new_token.tag = token.tag;
			return new_token;
		}

		if (token.type === 'tag_single') {
			if (token.tag in {
				// For {{#lst}}, {{#section:}}
				// [[w:en:Help:Labeled section transclusion]]
				// e.g., @ [[w:en:Island Line, Isle of Wight]]
				section : true,
				// hr : true,
				// e.g., <br />
				br : true,
				nowiki : true
			}) {
				return '';
			}

			options.root_token_list.imprecise_tokens.push(token);

			// 從上方 `token.type === 'tag'` 複製過來的。
			if (token.tag in untextify_tags) {
				// trick: 不再遍歷子節點。避免被進一步的處理。
				token.is_atom = true;
				token.unconvertible = true;
				return token;
			}

			// token that may be handlable 請檢查是否可處理此標題。
			options.root_token_list.tokens_maybe_handlable.push(token);
			return token;
		}

		if (false && token.type === 'convert') {
			// TODO: e.g., '==-{[[:三宝颜共和国]]}-=='
			token = token.converted;
			// 接下來交給 `token.type === 'link'` 處理。
		}

		if ((token.type === 'file' || token.type === 'category')
				&& !token.is_link) {
			// 顯示時，TOC 中的圖片、分類會被消掉，圖片在內文中才會顯現。
			return '';
		}

		// TODO: interlanguage links will be treated as normal link!
		if (token.type === 'link' || token.type === 'category'
		// e.g., [[:File:file name.jpg]]
		|| token.type === 'file') {
			// escape wikilink
			// return display_text
			if (token.length > 2) {
				token = token.slice(2);
				token.type = 'plain';
				// @see wiki_API.parse.wiki_token_toString.file, for
				// token.length > 2
				token.toString = function() {
					return this.join('|')
				};
				token = preprocess_section_link_tokens(token, options);
			} else {
				// 去掉最前頭的 ":"。 @see wiki_API.parse.wiki_token_toString
				token = token[0].toString().replace(/^ *:?/, '') + token[1];
			}
			// console.log(token);
			return token;
		}

		// 這邊僅處理常用模板。需要先保證這些模板存在，並且具有預期的功能。
		// 其他常用 template 可加在 wiki.template_functions[site_name] 中。
		//
		// 模板這個部分除了解析模板之外沒有好的方法。
		// 正式應該採用 parse 或 expandtemplates 解析出實際的 title，之後 callback。
		// https://www.mediawiki.org/w/api.php?action=help&modules=parse
		if (token.type === 'transclusion') {
			// 各語言 wiki 常用 template-linking templates:
			// {{Tl}}, {{Tlg}}, {{Tlx}}, {{Tls}}, {{T1}}, ...
			if (/^(?:T[l1n][a-z]{0,3}[23]?)$/.test(token.name)) {
				// TODO: should expand as
				// "&#123;&#123;[[Template:{{{1}}}|{{{1}}}]]&#125;&#125;"
				token.shift();
				return token;
			}

			if (token.name in {
				// {{lang|語言標籤|內文}}
				Lang : true
			}) {
				return preprocess_section_link_token(token.parameters[2],
						options);
			}

			// moved to CeL.application.net.wiki.template_functions.zhmoegirl
			if (false
					&& token.name === 'Lj'
					&& wiki_API.site_name(wiki_API.session_of_options(options)) === 'zhmoegirl') {
				return preprocess_section_link_token(wiki_API.parse('-{'
						+ token.parameters[1] + '}-'), options);
			}

			// TODO: [[Template:User link]], [[Template:U]]

			// TODO: [[Template:疑問]], [[Template:Block]]

			// console.trace(token);

			// 警告: 在遇到標題包含模板時，因為不能解析連模板最後產出的結果，會產生錯誤結果。
			options.root_token_list.imprecise_tokens.push(token);
			// trick: 不再遍歷子節點。避免被進一步的處理。
			token.is_atom = true;
			token.unconvertible = true;
			return token;
		}

		if (token.type === 'external_link') {
			// escape external link
			// console.log('>> ' + token);
			// console.log(token[2]);
			// console.log(preprocess_section_link_tokens(token[2], options));
			if (token[2]) {
				return preprocess_section_link_tokens(token[2], options);
			}
			// TODO: error: 用在[URL]無標題連結會失效。需要計算外部連結的序號。
			options.root_token_list.imprecise_tokens.push(token);
			// trick: 不再遍歷子節點。避免被進一步的處理。
			token.is_atom = true;
			token.unconvertible = true;
			return token;
		}

		if (token.type === 'switch') {
			options.root_token_list.imprecise_tokens.push(token);
			return '';
		}

		if (token.type === 'bold' || token.type === 'italic') {
			// 去除粗體與斜體。
			token.original_type = token.type;
			token.type = 'plain';
			token.toString = wiki_API.parse.wiki_token_toString[token.type];
			return token;
		}

		if (typeof token === 'string') {
			// console.log('>> ' + token);
			// console.log('>> [' + index + '] ' + token);
			// console.log(parent);

			// decode '&quot;', '%00', ...
			token = library_namespace.HTML_to_Unicode(token);
			if (/\S/.test(token)) {
				// trick: 不再遍歷子節點。避免被進一步的處理，例如"&amp;amp;"。
				token = [ token ];
				token.is_atom = true;
				token.unconvertible = true;
				token.is_plain = true;
			}
			// console.trace(token);
			return token;
		}

		if (token.type in {
			convert : true,
			url : true
		}) {
			// 其他可處理的節點。
			return token;
		}

		// console.trace(token);
		if (token.type in {
			magic_word_function : true,
			parameter : true
		}) {
			// TODO: return token.evaluate()
			token.unconvertible = true;
		}

		// console.trace(token);

		// token that may be handlable 請檢查是否可處理此標題。
		if (!token.unconvertible)
			options.root_token_list.tokens_maybe_handlable.push(token);
		if (!token.is_plain) {
			// `token.is_plain`: 由 {String} 轉換而成。
			options.root_token_list.imprecise_tokens.push(token);
		}
		return token;
	}

	// @inner
	function preprocess_section_link_tokens(tokens, options) {
		if (tokens.type !== 'plain') {
			tokens = wiki_API.parse.set_wiki_type([ tokens ], 'plain');
		}

		if (false) {
			library_namespace.info('preprocess_section_link_tokens: tokens:');
			console.log(tokens);
		}
		// console.trace(tokens);

		if (!tokens.imprecise_tokens) {
			// options.root_token_list.imprecise_tokens
			tokens.imprecise_tokens = [];
			tokens.tokens_maybe_handlable = [];
		}

		if (!options.root_token_list)
			options.root_token_list = tokens;

		options.modify = true;

		// console.trace(tokens);
		return preprocess_section_link_token(tokens, options);
	}

	// TODO: The method now is NOT a good way!
	// extract_plain_text_of_wikitext(), get_plain_display_text()
	// @see [[w:en:Module:Delink]]
	function wikitext_to_plain_text(wikitext, options) {
		options = library_namespace.new_options(options);

		wikitext = wiki_API.parse(String(wikitext), options);
		// console.trace(wikitext);
		wikitext = preprocess_section_link_tokens(wikitext, options);

		// console.trace(wikitext);
		return wikitext.toString();
	}

	// --------------------------------

	// 用在 summary 必須設定 is_URI !
	function section_link_escape(text, is_URI) {
		// escape wikitext control characters,
		// including language conversion -{}-
		if (true) {
			text = text.replace(
			// 盡可能減少字元的使用量，因此僅處理開頭，不處理結尾。
			// @see [[w:en:Help:Wikitext#External links]]
			// @see PATTERN_page_name
			is_URI ? /[\|{}<>\[\]%]/g
			// 為了容許一些特定標籤能夠顯示格式，"<>"已經在preprocess_section_link_token(),section_link()裡面處理過了。
			// display_text 在 "[[", "]]" 中，不可允許 "[]"
			: /[\|{}<>]/g && /[\|{}\[\]]/g,
			// 經測試 anchor 亦不可包含[\[\]{}\n�]。
			function(character) {
				if (is_URI) {
					return '%' + character.charCodeAt(0)
					// 會比 '&#' 短一點。
					.toString(16).toUpperCase();
				}
				return '&#' + character.charCodeAt(0) + ';';
			}).replace(/[ \n]{2,}/g, ' ');
		} else {
			// 只處理特殊字元而不是採用encodeURIComponent()，這樣能夠保存中文字，使其不被編碼。
			text = encodeURIComponent(text);
		}

		return text;
	}

	// @inner
	// return [[維基連結]]
	// TODO: using external link to display "�"
	function section_link_toString(page_title, style) {
		var anchor = (this[1] || '').replace(/�/g, '?'),
		// 目前 MediaWiki 之 link anchor, display_text 尚無法接受
		// REPLACEMENT CHARACTER U+FFFD "�" 這個字元。
		display_text = (this[2] || '').replace(/�/g, '?');

		display_text = display_text ?
		//
		style ? '<span style="' + style + '">' + display_text + '</span>'
				: display_text : '';

		return wiki_API.title_link_of((page_title || this[0] || '') + '#'
				+ anchor, display_text);
		return '[[' + (page_title || this[0] || '') + '#' + anchor + '|'
				+ display_text + ']]';
	}

	// 用來保留 display_text 中的 language conversion -{}-，
	// 必須是標題裡面不會存在的字串，並且也不會被section_link_escape()轉換。
	var section_link_START_CONVERT = '\0\x01', section_link_END_CONVERT = '\0\x02',
	//
	section_link_START_CONVERT_reg = new RegExp(library_namespace
			.to_RegExp_pattern(section_link_START_CONVERT), 'g'),
	//
	section_link_END_CONVERT_reg = new RegExp(library_namespace
			.to_RegExp_pattern(section_link_END_CONVERT), 'g');

	// wiki_API.section_link.pre_parse_section_title()
	function pre_parse_section_title(parameters, options, queue) {
		parameters = parameters.toString()
		// 先把前頭的空白字元提取出來，避免被當作 <pre>。
		// 先把前頭的列表字元提取出來，避免被當作 list。
		// 這些會被當作普通文字。
		.match(/^([*#;:=\s]*)([\s\S]*)$/);
		// console.trace(parameters);
		var prefix = parameters[1];
		// 經過改變，需再進一步處理。
		parameters = wiki_API.parse(parameters[2], options, queue);
		// console.trace(parameters);
		if (parameters.type !== 'plain') {
			parameters = wiki_API.parse.set_wiki_type([ parameters ], 'plain');
		}
		if (prefix) {
			if (typeof parameters[0] === 'string')
				parameters[0] = prefix + parameters[0];
			else
				parameters.unshift(prefix);
		}
		return parameters;
	}

	section_link.pre_parse_section_title = pre_parse_section_title;

	/**
	 * 從話題/議題/章節標題產生連結到章節標題的wikilink。
	 * 
	 * @example <code>

	CeL.wiki.section_link(section_title)

	</code>
	 * 
	 * @param {String}section_title
	 *            section title in wikitext. 章節標題。 節のタイトル。
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @returns {Array}link object (see below)
	 * 
	 * @see [[phabricator:T18691]] 未來章節標題可能會有分享連結，這將更容易連結到此章節。
	 * @see [[H:MW]], {{anchorencode:章節標題}}, [[Template:井戸端から誘導の使用]], escapeId()
	 * @see https://phabricator.wikimedia.org/T152540
	 *      https://lists.wikimedia.org/pipermail/wikitech-l/2017-August/088559.html
	 */
	function section_link(section_title, options) {
		if (typeof options === 'string') {
			options = {
				page_title : options
			};
		} else if (typeof options === 'function') {
			options = {
				// TODO
				callback : options
			};
		} else {
			options = library_namespace.setup_options(options);
		}

		// console.trace(wiki_API.parse(section_title, null, []));
		// TODO: "==''==text==''==\n"
		var parsed_title = pre_parse_section_title(section_title, options);
		// pass session.
		parsed_title = preprocess_section_link_tokens(parsed_title, options);

		// 注意: 當這空白字字出現在功能性token中時，可能會出錯。
		var id = parsed_title.toString().trim().replace(/[ \n]{2,}/g, ' '),
		// anchor 網頁錨點: 可以直接拿來做 wikilink anchor 的章節標題。
		// 有多個完全相同的 anchor 時，後面的會加上"_2", "_3",...。
		// 這個部分的處理請見 function for_each_section()
		anchor = section_link_escape(id
		// 處理連續多個空白字元。長度相同的情況下，盡可能保留原貌。
		.replace(/([ _]){2,}/g, '$1').replace(/&/g, '&amp;'), true);

		var session = wiki_API.session_of_options(options);
		// TODO: for zhwiki, the anchor should NOT includes "-{", "}-"

		// console.log(parsed_title);
		for_each_token.call(parsed_title, function(token, index, parent) {
			if (token.type === 'convert') {
				// @see wiki_API.parse.wiki_token_toString.convert
				// return token.join(';');
				token.toString = function() {
					var converted = this.converted;
					if (converted === undefined) {
						// e.g., get display_text of
						// '==「-{XX-{zh-hans:纳; zh-hant:納}-克}-→-{XX-{奈}-克}-」=='
						return section_link_START_CONVERT
						// @see wiki_API.parse.wiki_token_toString.convert
						+ this.join(';') + section_link_END_CONVERT;
					}
					if (Array.isArray(converted)) {
						// e.g., '==-{[[:三宝颜共和国]]}-=='
						converted = converted.toString()
						// e.g.,
						// '==「-{XX-{zh-hans:纳; zh-hant:納}-克}-→-{XX-{奈}-克}-」=='
						// recover language conversion -{}-
						.replace(section_link_START_CONVERT_reg, '-{').replace(
								section_link_END_CONVERT_reg, '}-');
						var _options = Object.clone(options);
						// recursion, self-calling, 遞迴呼叫
						_options.is_recursive = true;
						converted = section_link(converted, _options)[2];
					}
					return section_link_START_CONVERT
					// + this.join(';')
					+ converted + section_link_END_CONVERT;
				};
			} else if (token.original_type) {
				// revert type
				token.type = token.original_type;
				token.toString
				//
				= wiki_API.parse.wiki_token_toString[token.type];
				// 保留 display_text 中的 ''', '', <b>, <i>, <span> 屬性。
				if (token.type === 'tag') {
					// 容許一些特定標籤能夠顯示格式: 會到這裡的應該都是一些被允許顯示格式的特定標籤。
					token.unshift(token.tag_attributes);
				}
			} else if (token.type === 'tag' || token.type === 'tag_single') {
				parent[index] = token.toString().replace(/</g, '&lt;').replace(
						/>/g, '&gt;');

			} else if (token.is_plain) {
				if (false) {
					// use library_namespace.DOM.Unicode_to_HTML()
					token[0] = library_namespace.Unicode_to_HTML(token[0])
					// reduce size
					.replace(/&gt;/g, '>');
				}
				// 僅作必要的轉換
				token[0] = token[0].replace(/&/g, '&amp;')
				// 這邊也必須 escape "<>"。這邊可用 "%3C", "%3E"。
				.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g,
						'&quot;').replace(/'/g, "&apos;");
			}
		}, true);
		// console.log(parsed_title);
		// console.trace(parsed_title.toString().trim());

		// display_text 應該是對已經正規化的 section_title 再作的變化。
		var display_text = parsed_title.toString().trim();
		display_text = section_link_escape(display_text);
		if (!options.is_recursive) {
			// recover language conversion -{}-
			display_text = display_text.replace(section_link_START_CONVERT_reg,
					'-{').replace(section_link_END_CONVERT_reg, '}-');
		}

		// link = [ page title 頁面標題, anchor 網頁錨點 / section title 章節標題,
		// display_text / label 要顯示的連結文字 default: section_title ]
		var link = [ options && options.page_title,
		// Warning: anchor, display_text are with "&amp;",
		// id is not with "&amp;".
		anchor, display_text ];
		// console.log(link);
		if (parsed_title.imprecise_tokens
		// section_title_token.link.imprecise_tokens
		&& parsed_title.imprecise_tokens.length > 0) {
			link.imprecise_tokens = parsed_title.imprecise_tokens;
			// section_title_token.link.tokens_maybe_handlable
			if (parsed_title.tokens_maybe_handlable
					&& parsed_title.tokens_maybe_handlable.length > 0)
				link.tokens_maybe_handlable = parsed_title.tokens_maybe_handlable;
		}
		Object.assign(link, {
			// link.id = {String}id
			// section title, NOT including "<!-- -->" and "&amp;"
			id : id,
			// original section title, including "<!-- -->",
			// not including "&amp;".
			title : section_title,
			// only for debug
			// parsed_title : parsed_title,

			// anchor : anchor.toString().trimEnd(),
			// display_text : display_text,

			// section.section_title.link.toString()
			toString : section_link_toString
		});
		// 用以獲得實際有效的 anchor 網頁錨點。 effect anchor: parsed.each_section()
		// and then section_title_token.link.id
		return link;
	}

	// --------------------------------------------------------------------------------------------

	/**
	 * 快速取得第一個標題 lead section / first section / introduction 序言 導入文 文字用。
	 * 
	 * TODO: expandtemplates for cascading protection
	 * 
	 * @example <code>

	CeL.wiki.lead_text(content);

	</code>
	 * 
	 * @param {String}wikitext
	 *            wikitext to parse
	 * 
	 * @returns {String}lead section wikitext 文字
	 * 
	 * @see [[mw:Extension:Labeled_Section_Transclusion#Transclude_the_introduction]]
	 *      {{subst:#lsth:page title}}
	 * 
	 * @see 文章的開頭部分[[WP:LEAD|導言章節]] (lead section, introduction),
	 *      [[en:Wikipedia:Hatnote]] 頂註
	 */
	function lead_text(wikitext) {
		var page_data;
		if (wiki_API.is_page_data(wikitext)) {
			page_data = wikitext;
			wikitext = wiki_API.content_of(page_data);
		}
		if (!wikitext || typeof wikitext !== 'string') {
			return wikitext;
		}

		var matched = wikitext.indexOf('\n=');
		if (matched >= 0) {
			wikitext = wikitext.slice(0, matched);
		}

		// match/去除一開始的維護模板/通知模板。
		// <del>[[File:file|[[link]]...]] 因為不容易除盡，放棄處理。</del>
		while (matched = wikitext.match(/^[\s\n]*({{|\[\[)/)) {
			// 注意: 此處的 {{ / [[ 可能為中間的 token，而非最前面的一個。但若是沒有中間的 token，則一定是第一個。
			matched = matched[1];
			// may use wiki_API.title_link_of()
			var index_end = wikitext.indexOf(matched === '{{' ? '}}' : ']]');
			if (index_end === NOT_FOUND) {
				library_namespace.debug('有問題的 wikitext，例如有首 "' + matched
						+ '" 無尾？ [' + wikitext + ']', 2, 'lead_text');
				break;
			}
			// 須預防 -{}- 之類 language conversion。
			var index_start = wikitext.lastIndexOf(matched, index_end);
			wikitext = wikitext.slice(0, index_start)
			// +2: '}}'.length, ']]'.length
			+ wikitext.slice(index_end + 2);
		}

		if (page_data) {
			page_data.lead_text = lead_text;
		}

		return wikitext.trim();
	}

	// ------------------------------------------

	/**
	 * 擷取出頁面簡介。例如使用在首頁優良條目簡介。
	 * 
	 * @example <code>

	CeL.wiki.extract_introduction(page_data).toString();

	</code>
	 * 
	 * @param {Array|Object}first_section
	 *            first section or page data
	 * @param {String}[title]
	 *            page title.
	 * 
	 * @returns {Undefined|Array} introduction object
	 * 
	 * @since 2019/4/10
	 */
	function extract_introduction(first_section, title) {
		var parsed;
		if (wiki_API.is_page_data(first_section)) {
			if (!title)
				title = wiki_API.title_of(first_section);
			parsed = page_parser(first_section).parse();
			parsed.each_section(function(section, index) {
				if (!section.section_title) {
					first_section = section;
				}
			});
		}
		if (!first_section)
			return;

		// --------------------------------------

		var introduction_section = [], representative_image;
		if (parsed) {
			introduction_section.page = parsed.page;
			introduction_section.title = title;
			// Release memory. 釋放被占用的記憶體。
			parsed = null;
		}
		introduction_section.toString = first_section.toString;

		// --------------------------------------

		var index = 0;
		for (; index < first_section.length; index++) {
			var token = first_section[index];
			// console.log(token);
			if (token.type === 'file') {
				// {String}代表圖像。
				if (!representative_image) {
					representative_image = token;
				}
				continue;
			}

			if (token.type === 'transclusion') {
				if (token.name === 'NoteTA') {
					// preserve 轉換用詞
					// TODO:
					// 因為該頁會嵌入首頁，所以請不要使用{{noteTA}}進行繁簡轉換；請用-{zh-hans:簡體字;zh-hant:繁體字}-進行單個詞彙轉換。
					// [[繁體字]] → [[繁體字|-{zh-hans:簡體字;zh-hant:繁體字}-]]
					introduction_section.push(token);
					continue;
				}

				if (token.name in {
					Cfn : true,
					Sfn : true,
					Sfnp : true,
					Efn : true,
					NoteTag : true,
					R : true,
					Clear : true
				}) {
					// Skip references
					continue;
				}

				// 抽取出代表圖像。
				if (!representative_image) {
					representative_image = token.parameters.image
							|| token.parameters.file
					// ||token.parameters['Image location']
					;
				}
				if (!representative_image) {
					token = token.toString();
					// console.log(token);
					var matched = token
							.match(/\|[^=]+=([^\|{}]+\.(?:jpg|png|svg|gif|bmp))[\s\n]*[\|}]/i);
					if (matched) {
						representative_image = matched[1];
					}
				}

				continue;
			}

			if ((token.type === 'tag' || token.type === 'tag_single')
					&& token.tag === 'ref') {
				// 去掉所有參考資料。
				continue;
			}

			if (token.type === 'table'
			// e.g., __TOC__
			|| token.type === 'switch') {
				// 去掉所有參考資料。
				continue;
			}

			if (!token.toString().trim()) {
				continue;
			}

			if (token.type === 'bold' || token.type === 'plain'
					&& token.toString().includes(title)) {
				// title_piece
				introduction_section.title_token = token;
			}

			if (token.type === 'link') {
				if (!token[0] && token[1]) {
					// 將[[#章節|文字]]的章節連結改為[[條目名#章節|文字]]的形式。
					token[0] = title;
				}
			}

			// console.log('Add token:');
			// console.log(token);
			introduction_section.push(token);
			if (introduction_section.title_token)
				break;
		}

		// ------------------

		// 已經跳過導航模板。把首段餘下的其他內容全部納入簡介中。
		while (++index < first_section.length) {
			token = first_section[index];
			// remove {{Notetag}}, <ref>
			if ((token.type === 'tag' || token.type === 'tag_single')
					&& token.tag === 'ref' || token.type === 'transclusion'
					&& token.name === 'Notetag')
				continue;
			introduction_section.push(token);
		}
		index = introduction_section.length;
		// trimEnd() 去頭去尾
		while (--index > 0) {
			if (introduction_section[index].toString().trim())
				break;
			introduction_section.pop();
		}

		// --------------------------------------

		// 首個段落不包含代表圖像。檢查其他段落以抽取出代表圖像。
		if (!representative_image) {
			parsed.each('file', function(token) {
				representative_image = token;
				return for_each_token.exit;
			});
		}

		// --------------------------------------

		if (typeof representative_image === 'string') {
			// assert: {String}representative_image

			// remove [[File:...]]
			representative_image = representative_image.replace(/^\[\[[^:]+:/i,
					'').replace(/\|[\s\S]*/, '').replace(/\]\]$/, '');
			representative_image = wiki_API.parse('[[File:'
					+ wiki_API.title_of(representative_image) + ']]');
		}
		introduction_section.representative_image = representative_image;

		return introduction_section;
	}

	// ------------------------------------------

	/**
	 * <code>

	CeL.wiki.sections(page_data);
	page_data.sections.forEach(for_sections, page_data.sections);

	CeL.wiki.sections(page_data)
	//
	.forEach(for_sections, page_data.sections);

	</code>
	 */

	// 將 wikitext 拆解為各 section list
	// get {Array}section list
	//
	// @deprecated: 無法處理 '<pre class="c">\n==t==\nw\n</pre>'
	// use for_each_section() instead.
	function deprecated_get_sections(wikitext) {
		var page_data;
		if (wiki_API.is_page_data(wikitext)) {
			page_data = wikitext;
			wikitext = wiki_API.content_of(page_data);
		}
		if (!wikitext || typeof wikitext !== 'string') {
			return;
		}

		var section_list = [], index = 0, last_index = 0,
		// 章節標題。
		section_title,
		// [ all title, "=", section title ]
		PATTERN_section = /\n(={1,2})([^=\n]+)\1\s*?\n/g;

		section_list.toString = function() {
			return this.join('');
		};
		// 章節標題list。
		section_list.title = [];
		// index hash
		section_list.index = Object.create(null);

		while (true) {
			var matched = PATTERN_section.exec(wikitext),
			// +1 === '\n'.length: skip '\n'
			// 使每個 section_text 以 "=" 開頭。
			next_index = matched && matched.index + 1,
			//
			section_text = matched ? wikitext.slice(last_index, next_index)
					: wikitext.slice(last_index);

			if (false) {
				// 去掉章節標題。
				section_text.replace(/^==[^=\n]+==\n+/, '');
			}

			library_namespace.debug('next_index: ' + next_index + '/'
					+ wikitext.length, 3, 'get_sections');
			// console.log(matched);
			// console.log(PATTERN_section);

			if (section_title) {
				// section_list.title[{Number}index] = {String}section title
				section_list.title[index] = section_title;
				if (section_title in section_list) {
					library_namespace.debug('重複 section title ['
							+ section_title + '] 將僅取首個 section text。', 2,
							'get_sections');

				} else {
					if (!(section_title >= 0)) {
						// section_list[{String}section title] =
						// {String}wikitext
						section_list[section_title] = section_text;
					}

					// 不採用 section_list.length，預防 section_title 可能是 number。
					// section_list.index[{String}section title] = {Number}index
					section_list.index[section_title] = index;
				}
			}

			// 不採用 section_list.push(section_text);，預防 section_title 可能是 number。
			// section_list[{Number}index] = {String}wikitext
			section_list[index++] = section_text;

			if (matched) {
				// 紀錄下一段會用到的資料。

				last_index = next_index;

				section_title = matched[2].trim();
				// section_title = wiki_API.section_link(section_title).id;
			} else {
				break;
			}
		}

		if (page_data) {
			page_data.sections = section_list;
			// page_data.lead_text = lead_text(section_list[0]);
		}

		// 檢核。
		if (false && wikitext !== section_list.toString()) {
			// debug 用. check parser, test if parser working properly.
			throw new Error('get_sections: Parser error'
			//
			+ (page_data ? ': ' + wiki_API.title_link_of(page_data) : ''));
		}
		return section_list;
	}

	/**
	 * 為每一個章節(討論串)執行特定作業 for_section(section)
	 * 
	 * If you want to get **every** sections, please using
	 * `parsed..each('section_title', ...)` or traversals hierarchy of
	 * `parsed.child_section_titles` instead of enumerating `parsed.sections`.
	 * `parsed.sections` do NOT include titles like this:
	 * {{Columns-list|\n==title==\n...}}
	 * 
	 * CeL.wiki.parser.parser_prototype.each_section
	 * 
	 * TODO: 這會漏算沒有日期標示的簽名
	 * 
	 * @example <code>

	// TODO: includeing `<h2>...</h2>`, `==<h2>...</h2>==`

	parsed = CeL.wiki.parser(page_data);

	parsed.each_section(function(section, section_index) {
		if (!section.section_title) {
			// first_section = section;
			// Skip lead section / first section / introduction.
			return;
		}
		console.log('#' + section.section_title);
		console.log([ section.users, section.dates ]);
		console.log([section_index, section.toString()]);

		section.each('link', function(token) {
			console.log(token.toString());
		}, {
			// for section.users, section.dates
			get_users : true,
			// 採用 parsed 的 index，而非 section 的 index。
			// 警告: 會從 section_title 開始遍歷 traverse！
			use_global_index : true
		});

		return parsed.each.exit;
	}, {
		level_filter : [ 2, 3 ],
		get_users : true
	});

	parsed.each_section();
	parsed.sections.forEach(...);

	</code>
	 */
	function for_each_section(for_section, options) {
		options = library_namespace.new_options(options);
		// this.options is from function page_parser(wikitext, options)
		if (!options[KEY_SESSION] && this.options && this.options[KEY_SESSION]) {
			// set options[KEY_SESSION] for
			// `var date = wiki_API.parse.date(token, options);`
			options[KEY_SESSION] = this.options[KEY_SESSION];
		}

		// this: parsed
		var _this = this, page_title = this.page && this.page.title,
		// parsed.sections[0]: 常常是設定與公告區，或者放置維護模板/通知模板。
		all_root_section_list = this.sections = [];

		/**
		 * 2021/11/3 18:23:24: .parent_section 歸於 .parent_section_title，
		 * .subsections 歸於 .child_section_titles。
		 */
		// var section_hierarchy = [ this.subsections = [] ];
		//
		/** `section link anchor` in section_title_hash: had this title */
		var section_title_hash = Object.create(null);
		// this.section_title_hash = section_title_hash;

		// to test: 沒有章節標題的文章, 以章節標題開頭的文章, 以章節標題結尾的文章, 章節標題+章節標題。
		// 加入 **上一個** section, "this_section"
		function add_root_section(next_section_title_index) {
			// assert: _this.type === 'plain'
			// section_title === parsed[section.range[0] - 1]
			var this_section_title_index = all_root_section_list.length > 0 ? all_root_section_list
					.at(-1).range[1]
					: undefined,
			// range: 本 section inner 在 root parsed 中的 index.
			// parsed[range[0]] to parsed[range[1] - 1]
			range = [ this_section_title_index >= 0
			// +1: 這個範圍不包括 section_title。
			? this_section_title_index + 1 : 0, next_section_title_index ],
			//
			section = _this.slice(range[0], range[1]);
			if (this_section_title_index >= 0) {
				// page_data.parsed[section.range[0]-1]===section.section_title
				section.section_title = _this[this_section_title_index];
			}
			// 添加常用屬性與方法。
			// TODO: using Object.defineProperties(section, {})
			Object.assign(section, {
				type : 'section',
				// section = parsed.slice(range[0], range[1]);
				// assert: parsed[range[0]] === '\n',
				// is the tail '\n' of "==title== "
				range : range,
				each : for_each_token,
				replace_by : replace_section_by,
				toString : _this.toString
			});
			section[wiki_API.KEY_page_data] = _this.page;
			all_root_section_list.push(section);
		}

		// max_section_level
		var level_filter
		// 要篩選的章節標題層級 e.g., {level_filter:[1,2]}
		= Array.isArray(options.level_filter)
		// assert: 必須皆為 {Number}
		? (Math.max.apply(null, options.level_filter) | 0) || 2
		// e.g., { level_filter : 3 }
		: 1 <= options.level_filter && (options.level_filter | 0)
		// default: level 2. 僅處理階級2的章節標題。
		|| 2;

		// get topics / section title / stanza title using for_each_token()
		// 讀取每一個章節的資料: 標題,內容
		// TODO: 不必然是章節，也可以有其它不同的分割方法。
		// TODO: 可以讀取含入的子頁面
		this.each('section_title', function(section_title_token,
		// section 的 index of parsed。
		section_title_index, parent_token) {
			var section_title_link = section_title_token.link;
			if (page_title) {
				// [0]: page title
				section_title_link[0] = page_title;
			}
			var id = section_title_link.id;
			if (id in section_title_hash) {
				// The index of 2nd title starts from 2
				var duplicate_NO = 2, base_anchor = id;
				// 有多個完全相同的 anchor 時，後面的會加上 "_2", "_3", ...。
				// [[w:en:Help:Section#Section linking]]
				while ((id = base_anchor + ' ' + duplicate_NO)
				// 測試是否有重複的標題 duplicated section title。
				in section_title_hash) {
					duplicate_NO++;
				}
				if (!section_title_link.duplicate_NO) {
					section_title_link.duplicate_NO = duplicate_NO;
					// hack for [[w:en:WP:DUPSECTNAME|Duplicate section names]]
					if (Array.isArray(section_title_link[1]))
						section_title_link[1].push('_' + duplicate_NO);
					else
						section_title_link[1] += '_' + duplicate_NO;
					// 用以獲得實際有效的 anchor 網頁錨點。 effect anchor
					section_title_link.id = id;
				}
			}
			// 登記已有之 anchor。
			section_title_hash[id] = null;

			var level = section_title_token.level;
			// console.trace([ level, level_filter, id ]);
			if (parent_token === _this
			// ↑ root sections only. Do not include
			// {{Columns-list|\n==title==\n...}}

			// level_filter: max_section_level
			&& level <= level_filter) {
				// console.log(section_title_token);
				add_root_section(section_title_index);
			} else {
				// library_namespace.warn('Ignore ' + section_title_token);
				// console.log([ parent_token === _this, level ]);
			}

			// ----------------------------------

			if (false) {
				// 此段已搬到 parse_section() 中。
				if (section_hierarchy.length > level) {
					// 去尾。
					section_hierarchy.length = level;
				}
				section_hierarchy[level] = section_title_token;
				// console.log(section_hierarchy);
				while (--level >= 0) {
					// 注意: level 1 的 subsections 可能包含 level 3!
					var parent_section = section_hierarchy[level];
					if (parent_section) {
						if (parent_section.subsections) {
							if (false) {
								library_namespace.log(parent_section + ' → '
										+ section_title_token);
							}
							parent_section.subsections
									.push(section_title_token);
							section_title_token
							//
							.parent_section = parent_section;
						} else {
							// assert: is root section list, parent_section ===
							// this.subsections === section_hierarchy[0]
							parent_section.push(section_title_token);
						}
						break;
					}
				}
				section_title_token.subsections = [];
			}

		}, Object.assign({
			// 不可只檢查第一層之章節標題。就算在 template 中的 section title 也會被記入 TOC。
			// e.g.,
			// [[w:en:Wikipedia:Vital_articles/Level/5/Everyday_life/Sports,_games_and_recreation]]
			// max_depth : 1,

			modify : false
		},
		// options.for_each_token_options
		options));
		// add the last section
		add_root_section(this.length);
		if (all_root_section_list[0].range[1] === 0) {
			// 第一個章節為空。 e.g., 以章節標題開頭的文章。
			// 警告：此時應該以是否有 section.section_title 來判斷是否為 lead_section，
			// 而非以 section_index === 0 判定！
			all_root_section_list.shift();
		}

		// ----------------------------

		// 讀取每一個章節的資料: 參與討論者,討論發言的時間
		// 統計各討論串中簽名的次數和發言時間。
		// TODO: 無法判別先日期，再使用者名稱的情況。 e.g., [[w:zh:Special:Diff/54030530]]
		if (options.get_users) {
			all_root_section_list.forEach(function(section) {
				// console.log(section);
				// console.log('section: ' + section.toString());

				// [[WP:TALK]] conversations, dialogues, discussions, messages
				// section.discussions = [];
				// 發言用戶名順序
				section.users = [];
				// 發言時間日期
				section.dates = [];
				for (var section_index = 0,
				// list buffer
				buffer = [], this_user, token;
				// Only check the first level. 只檢查第一層。
				// TODO: parse [[Wikipedia:削除依頼/暫定2車線]]: <div>...</div>
				// check <b>[[User:|]]</b>
				section_index < section.length || buffer.length > 0;) {
					token = buffer.length > 0 ? buffer.shift()
							: section[section_index++];
					while (/* token && */token.type === 'list') {
						var _buffer = [];
						token.forEach(function(list_item) {
							// 因為使用習慣問題，每個列表必須各別計算使用者留言次數。
							_buffer.append(list_item);
						});
						token = _buffer.shift();
						Array.prototype.unshift.apply(buffer, _buffer);
					}

					if (typeof token === 'string') {
						// assert: {String}token
						if (!token.trim() && token.includes('\n\n')) {
							// 預設簽名必須與日期在同一行。不可分段。
							this_user = null;
							continue;
						}

					} else {
						// assert: {Array}token
						token = token.toString();
						// assert: wikiprojects 計畫的簽名("~~~~~")必須要先從名稱再有日期。
						// 因此等到出現日期的時候再來處理。
						// 取得依照順序出現的使用者序列。
						var user_list = wiki_API.parse.user.all(token, true);
						if (false && section.section_title
								&& section.section_title.title.includes('')) {
							console.log('token: ' + token);
							console.log('user_list: ' + user_list);
						}

						// 判別一行內有多個使用者名稱的情況。
						// 當一行內有多個使用者名稱的情況，會取最後一個簽名。
						if (user_list.length > 0) {
							this_user = user_list.at(-1);
							// ↑ 這個使用者名稱可能為 bot。
							if (options.ignore_bot
									&& PATTERN_BOT_NAME.test(this_user)) {
								this_user = null;
							}
						}

						// --------------------------------
						if (false) {
							// 以下為取得多個使用者名稱的情況下，欲判別出簽名的程式碼。由於現在僅簡單取用最後一個簽名，已經被廢棄。

							if (user_list.length > 1
							// assert: 前面的都只是指向機器人頁面的連結。
							&& /^1+0$/.test(user_list.map(function(user) {
								return PATTERN_BOT_NAME.test(user) ? 1 : 0;
							}).join(''))) {
								user_list = user_list.slice(-1);
							}

							// 因為現在有個性化簽名，需要因應之。應該包含像[[w:zh:Special:Diff/48714597]]的簽名。
							if (user_list.length === 1) {
								this_user = user_list[0];
							} else {
								// 同一個token卻沒有找到，或找到兩個以上簽名，因此沒有辦法準確判別到底哪一個才是真正的留言者。
								// console.log(token);
								// console.log(token.length);
								// console.log(this_user);
								if (user_list.length >= 2
								// 若是有其他非字串的token介於名稱與日期中間，代表這個名稱可能並不是發言者，那麼就重設名稱。
								// 簽名長度不應超過255位元組。
								|| token.length > 255 - '[[U:n]]'.length) {
									// 一行內有多個使用者名稱的情況，取最後一個？
									// 例如簽名中插入自己的舊名稱或者其他人的情況
									this_user = null;
								}
								if (!this_user) {
									continue;
								}
							}
						}

						// 繼續解析日期，預防有類似 "<b>[[User:]] date</b>" 的情況。
					}

					if (!this_user) {
						continue;
					}
					var date = wiki_API.parse.date(token, options);
					// console.log([ this_user, date ]);
					if (!date
					// 預設不允許未來時間。
					|| !options.allow_future && !(Date.now() - date > 0)) {
						continue;
					}
					// 同時添加使用者與日期。
					section.dates.push(date);
					section.users.push(this_user);
					// reset
					this_user = null;
				}

				var min_timevalue, max_timevalue;
				// console.trace(section.dates);
				section.dates.forEach(function(date) {
					if (!date || isNaN(date = +date)) {
						return;
					}
					if (!(min_timevalue <= date))
						min_timevalue = date;
					else if (!(max_timevalue >= date))
						max_timevalue = date;
				});
				// console.trace([ min_timevalue, max_timevalue ]);
				if (min_timevalue) {
					section.dates.min_timevalue = min_timevalue;
					section.dates.max_timevalue = max_timevalue
							|| min_timevalue;
				}
				if (false) {
					section.dates.max_timevalue = Math.max.apply(null,
							section.dates.map(function(date) {
								return date.getTime();
							}));
				}

				if (false) {
					parsed.each_section();
					// scan / traversal section templates:
					parsed.each.call(parsed.sections[section_index],
							'template', function(token) {
								;
							});
				}

				if (false) {
					// 首位發言者, 發起人 index
					section.initiator_index = parsed.each_section.index_filter(
							section, true, 'first');
				}

				// 最後發言日期 index
				var last_update_index = for_each_section.index_filter(section,
						true, 'last');
				// section.users[section.last_update_index] = {String}最後更新發言者
				// section.dates[section.last_update_index] = {Date}最後更新日期
				if (last_update_index >= 0) {
					section.last_update_index = last_update_index;
				}
				// 回應數量
				section.replies
				// 要先有不同的人發言，才能算作有回應。
				= section.users.unique().length >= 2 ? section.users.length - 1
						: 0;
				// console.log('users: ' + section.users);
				// console.log('replies: ' + section.replies);
			});
		}

		// console.trace(for_section);
		if (typeof for_section === 'function') {
			level_filter
			// 要篩選的章節標題層級 e.g., {level_filter:[1,2]}
			= Array.isArray(options.level_filter) ? options.level_filter
			// e.g., { level_filter : 3 }
			: 1 <= options.level_filter && (options.level_filter | 0)
			// default: level 2. 僅處理階級2的章節標題。
			|| 2;

			var section_filter = function(section) {
				var section_title = section.section_title;
				if (!section_title)
					return true;
				if (Array.isArray(level_filter))
					return level_filter.includes(section_title.level);
				return level_filter === section_title.level;
			};

			// TODO: return (result === for_each_token.remove_token)
			// TODO: move section to another page
			if (library_namespace.is_async_function(for_section)) {
				// console.log(all_root_section_list);
				return Promise.allSettled(all_root_section_list.map(function(
						section, section_index) {
					return section_filter(section)
							&& for_section.apply(this, arguments);
				}));

				// @deprecated
				all_root_section_list
						.forEach(function(section, section_index) {
							if (false) {
								console.log('Process: ' + section.section_title
								// section_title.toString(true): get inner
								&& section.section_title.toString(true));
							}
							if (!section_filter(section))
								return;
							return eval('(async function() {'
									+ ' try { return await for_section(section, section_index); }'
									+ ' catch(e) { library_namespace.error(e); }'
									+ ' })();');
						});
			} else {
				// for_section(section, section_index)
				all_root_section_list.some(function(section) {
					// return parsed.each.exit;
					return section_filter(section) && (for_each_token.exit ===
					// exit if the result calls exit
					for_section.apply(this, arguments));
				}, this);
			}
		}
		return this;
	}

	function replace_section_by(wikitext, options) {
		options = library_namespace.setup_options(options);
		var parsed = this[wiki_API.KEY_page_data].parsed;
		// assert: parsed[range[0]] === '\n',
		// is the tail '\n' of "==title== "
		var index = this.range[0];
		if (typeof wikitext === 'string')
			wikitext = wikitext.trim();
		if (options.preserve_section_title === undefined
		// 未設定 options.preserve_section_title，則預設若有 wikitext，則保留 section title。
		? !wikitext : !options.preserve_section_title) {
			// - 1: point to section_title
			index--;
		}
		if (wikitext) {
			parsed[index] += wikitext + '\n\n';
		} else {
			parsed[index] = '';
		}
		while (++index < this.range[1]) {
			// 清空到本章節末尾。
			parsed[index] = '';
		}
	}

	// var section_index_filter =
	// CeL.wiki.parser.parser_prototype.each_section.index_filter;
	for_each_section.index_filter = function filter_users_of_section(section,
			filter, type) {
		// filter: user_name_filter
		var _filter;
		if (typeof filter === 'function') {
			_filter = filter;
		} else if (Array.isArray(filter)) {
			_filter = function(user_name) {
				// TODO: filter.some()
				return filter.includes(user_name);
			};
		} else if (library_namespace.is_Object(filter)) {
			_filter = function(user_name) {
				return user_name in filter;
			};
		} else if (library_namespace.is_RegExp(filter)) {
			_filter = function(user_name) {
				return filter.test(user_name);
			};
		} else if (typeof filter === 'string') {
			_filter = function(user_name) {
				return filter === user_name;
			};
		} else if (filter === true) {
			_filter = function() {
				return true;
			};
		} else {
			throw 'for_each_section.index_filter: Invalid filter: ' + filter;
		}

		// ----------------------------

		if (!type) {
			var user_and_date_indexs = [];
			section.users.forEach(function(user_name, index) {
				if (_filter(user_name)) {
					user_and_date_indexs.push(index);
				}
			});

			return user_and_date_indexs;
		}

		// ----------------------------

		var index_specified, date_specified;

		section.dates.forEach(function(date, index) {
			// assert: {Date}date is valid
			date = date.getTime();
			if (type === 'first' ? date_specified <= date : type === 'last'
					&& date < date_specified) {
				return;
			}

			var user_name = section.users[index];
			if (_filter(user_name)) {
				date_specified = date;
				index_specified = index;
			}
		});

		return index_specified;
	};

	// ------------------------------------------------------------------------

	// CeL.wiki.parse.anchor.normalize_anchor()
	function normalize_anchor(anchor) {
		return anchor
		// '&#39;' → "'"
		&& library_namespace.HTML_to_Unicode(anchor.toString())
		// 警告: 實際上的網頁錨點應該要 .replace(/ /g, '_')
		// 但由於 wiki 頁面中使用[[#P Q]]與[[#P_Q]]效果相同，都會產生<a href="#P_Q">，因此採用"P Q"。
		.replace(/_/g, ' ')
		// " a " → "a"
		.trim();
	}
	get_all_anchors.normalize_anchor = normalize_anchor;

	if (false) {
		wiki_session.register_redirects(
				CeL.wiki.parse.anchor.essential_templates, {
					namespace : 'Template'
				});

		// ...

		var anchor_list = CeL.wiki.parse.anchor(wikitext, CeL.wiki
				.add_session_to_options(wiki_session));

		// ------------------

		// bad method: work without session
		var anchor_list = CeL.wiki.parse.anchor(wikitext);
	}

	// CeL.wiki.parse.anchor()
	function get_all_anchors(wikitext, options) {
		if (!wikitext) {
			return [];
		}

		// const
		var anchor_hash = Object.create(null);
		function register_anchor(anchor, token) {
			anchor = normalize_anchor(anchor);
			if (typeof anchor === 'string' && anchor.length > 1000) {
				// console.trace(token);
				// console.trace(anchor);
				throw new Error('Invalid anchor!');
			}
			// 以首個出現的為準。
			if (anchor && !(anchor in anchor_hash)) {
				anchor_hash[anchor] = token;
			}
		}

		// options: pass session. for options.language
		// const
		/** {Array} parsed page content 頁面解析後的結構。 */
		var parsed = wiki_API.parser(wikitext, options).parse();
		if (false) {
			library_namespace.assert([ wikitext, parsed.toString() ],
					'wikitext parser check for wikitext');
			console.log(parsed);
		}

		var session = wiki_API.session_of_options(options);
		// console.log(wiki_API.site_name(session));

		parsed.each_section();
		parsed.each('section_title', function(section_title_token) {
			// console.log(section_title_token);
			// const
			var section_title_link = section_title_token.link;
			// TODO: 忽略包含不合理元素的編輯，例如 url。
			if (!section_title_link.imprecise_tokens) {
				// console.log(section_title_link);
				// `section_title_token.title` will not transfer "[", "]"
				register_anchor(section_title_link.id, section_title_token);

			} else if (section_title_link.tokens_maybe_handlable) {
				// exclude "=={{T}}=="
				library_namespace.warn('Title maybe handlable 請檢查是否可處理此標題: '
						+ section_title_token.title);
				console.log(section_title_link.tokens_maybe_handlable);
				console.trace(section_title_token);
			} else {
				library_namespace
						.warn('若包含的是模板，請檢查是否可於 template_functions 添加此標題中的模板: '
								+ section_title_token.title);
				console.trace(section_title_link);
			}
		});

		var _options = Object.clone(options);
		if (options)
			delete _options.print_anchors;
		// 處理包含於 template 中之 anchor 網頁錨點 (section title / id="" / name="")
		parsed.each('transclusion', function(template_token) {
			// console.trace([ template_token.name, template_token.expand ]);
			if (template_token.expand) {
				// 處理包括 {{Anchor}}, {{Anchors}}, {{Visible anchor}}, {{term}}
				// const
				var anchor = template_token.expand();
				if (!anchor || typeof anchor.toString !== 'function')
					return;
				anchor = get_all_anchors(anchor.toString(), _options);
				// console.trace(anchor);
				anchor.forEach(function(anchor) {
					register_anchor(anchor, template_token);
				});
				return;
			}

			// e.g., {{Cite book|...|ref=anchor}} @ [[日本の原子爆弾開発]]
			// {{Cite journal|...|ref=anchor}}
			if (/^Cite \w+/.test(template_token.name) || (session || wiki_API)
			// {{Citation|...|ref=anchor}}
			.is_template('Citation', template_token, options)) {
				// console.trace(JSON.stringify(template_token.name));
				var parameters = template_token.parameters;
				var anchor = parameters.ref;
				// console.trace(JSON.stringify(anchor));
				if (anchor) {
					if (anchor !== 'none') {
						// e.g., {{SfnRef|...}}
						anchor = wiki_API.wikitext_to_plain_text(anchor);
						register_anchor(anchor, template_token);
					}
					return;
				}

				// https://en.wikipedia.org/wiki/Template:Citation/doc#Anchors_for_Harvard_referencing_templates
				anchor = '';
				if (parameters.last)
					anchor += parameters.last.toString().trim();
				// @see [[w:en:Module:Citation/CS1]]
				// local function make_citeref_id (namelist, year)
				for (var index = 1; index <= 4; index++) {
					if (parameters['last' + index])
						anchor += parameters['last' + index].toString().trim();
				}

				var year = parameters.year;
				if (!year) {
					year = parameters.date;
					// TODO: extract year
					year = year && year.toString().match(/[12]\d{3}/);
					if (year)
						year = year[0];
				}
				if (year)
					anchor += year.toString().trim();

				if (anchor)
					register_anchor('CITEREF' + anchor, template_token);
				return;
			}

			if (false && options && options.print_anchors) {
				library_namespace
						.warn('get_all_anchors: Cannot expand template: '
								+ template_token);
			}
		});

		// 處理 <span class="anchor" id="anchor"></span>, <ref name="anchor">,
		// id in table cell attribute
		parsed.each('tag_attributes', function(attribute_token, index, parent) {
			// console.log(parent);
			// console.trace(attribute_token);
			// console.log(attribute_token.attributes);
			// const
			var anchor = attribute_token.attributes.id
					|| attribute_token.attributes.name;
			// console.trace(anchor);
			// <ref name="..."> 會轉成 id="cite_re-..."
			if (parent.tag ? parent.tag.toLowerCase() !== 'ref'
			// e.g., @ [[w:en:Daniel Ricciardo]]
			: parent.type === 'table_attributes') {
				// e.g., <span id="anchor">, <div id="anchor">
				if (Array.isArray(anchor)) {
					if (anchor.type !== 'plain') {
						// token = _set_wiki_type([ token ], 'plain');
						anchor = [ anchor ];
					}
					// e.g., {{Wikicite|ref={{sfnref|...}} }} .expand() 之後，
					// 解析 id="{{sfnref|...}}"
					for_each_token.call(anchor, 'transclusion', function(
							template_token, index, parent) {
						// replace by expanded text
						if (template_token.expand)
							parent[index] = template_token.expand();
					}, _options);
					anchor = anchor.map(function(token) {
						if (token.type === 'magic_word_function'
						// && token.is_magic_word
						&& token.name === 'ANCHORENCODE') {
							return token[1];
						}
						return token;
					});
				}
				if (false && /{{/.test(normalize_anchor(anchor))) {
					// Should not go to here.
					console.trace([ anchor, attribute_token ]);
				}
				register_anchor(anchor, attribute_token);
			}
		});

		var anchor_list = Object.keys(anchor_hash);
		if (options && options.print_anchors) {
			library_namespace.info('get_all_anchors: anchors:');
			console.trace(anchor_list.length > 100 ? JSON
					.stringify(anchor_list) : anchor_list);
		}
		return anchor_list;
	}

	// CeL.wiki.parse.anchor.essential_templates
	// required, indispensable
	get_all_anchors.essential_templates = [ 'Citation' ];

	// ------------------------------------------------------------------------

	// export 導出.
	// @static
	Object.assign(wiki_API, {
		lead_text : lead_text,
		extract_introduction : extract_introduction,
		// sections : deprecated_get_sections,

		section_link : section_link,
		section_link_escape : section_link_escape,

		// HTML_to_wikitext : HTML_to_wikitext,
		wikitext_to_plain_text : wikitext_to_plain_text
	});

	Object.assign(wiki_API.parser.parser_prototype, {
		each_section : for_each_section
	});

	Object.assign(wiki_API.parse, {
		anchor : get_all_anchors
	});

	// --------------------------------------------------------------------------------------------

	// 不設定(hook)本 module 之 namespace，僅執行 module code。
	return library_namespace.env.not_to_extend_keyword;
}
