
/**
 * @name	CeL function for Wikipedia / 維基百科
 * @fileoverview
 * 本檔案包含了 Wikipedia / 維基百科 用的 functions。
 * @since 2015/1/1
 * @example <code>

 </code>
 */

// [[維基百科:機器人]], [[WP:{{{name|{{int:Group-bot}}}}}|{{{name|{{int:Group-bot}}}}}]]
// https://en.wikipedia.org/w/api.php

// Wikipedia:沙盒
// https://zh.wikipedia.org/wiki/Wikipedia:%E6%B2%99%E7%9B%92
// https://zh.wikipedia.org/wiki/Special:API%E6%B2%99%E7%9B%92

// TODO:
// https://en.wikipedia.org/wiki/Wikipedia:WikiProject_Check_Wikipedia
// https://en.wikipedia.org/wiki/Wikipedia:AutoWikiBrowser/General_fixes
// [[Wikipedia:维基化]]

'use strict';
//'use asm';

if (false) {
	// examples

	// for debug: 'interact.DOM', 'application.debug',
	CeL.run([ 'interact.DOM', 'application.debug', 'application.net.wiki' ]);
	CeL.assert([ '!![[File:abc d.svg]]@@', '!![[File : Abc_d.png]]@@'
	//
	.replace(CeL.wiki.file_pattern('abc d.png'), '[[$1File:abc d.svg$3') ]);

	CeL.run([ 'interact.DOM', 'application.debug', 'application.net.wiki' ],
			function() {
				var wiki = CeL.wiki.login('', '')
				// get the content of page
				.page('Wikipedia:沙盒', function(page_data) {
					CeL.info(page_data.title);
					var content = CeL.wiki.content_of(page_data);
					CeL.log(content === undefined ? 'page deleted!' : content);
				})
				// get the content of page, and then replace it.
				.page('Wikipedia:沙盒').edit('* [[沙盒]]', {
					section : 'new',
					sectiontitle : '沙盒測試 section',
					summary : '沙盒 test edit (section)',
					nocreate : 1
				})
				// get the content of page, and then modify it.
				.page('Wikipedia:沙盒').edit(function(page_data) {
					return CeL.wiki.content_of(page_data) + '\n\n* [[WP:Sandbox|沙盒]]';
				}, {
					summary : '沙盒 test edit',
					nocreate : 1,
					bot : 1
				})
				// 執行過 .page() 後，與上一種方法相同。
				.page(function(page_data) {
					CeL.info(page_data.title);
					CeL.log(CeL.wiki.content_of(page_data));
				})
				// get the content of page, replace it, and set summary.
				.edit('text to replace', {
					summary : 'summary'
				})
				// get the content of page, modify it, and set summary.
				.edit(function(page_data) {
					var title = page_data.title,
					//
					content = CeL.wiki.content_of(page_data);
					return 'text to replace';
				}, {
					summary : 'summary'
				});

				CeL.wiki.page('Wikipedia:沙盒', function(page_data) {
					CeL.info(page_data.title);
					CeL.log(CeL.wiki.content_of(page_data));
				});

				wiki.logout();
			});
	
	// 取得完整 embeddedin list 後才作業。
	CeL.wiki.list('Template:a‎‎', function(pages) {
		// console.log(pages);
		console.log(pages.length + ' pages got.');
	}, {
		type : 'embeddedin'
	});

	var wiki = CeL.wiki.login('', '', 'zh.wikisource');
	wiki.page('史記').edit(function(page_data) {
		var title = page_data.title,
		//
		content = CeL.wiki.content_of(page_data);
		CeL.info(title);
		CeL.log(content);
	});
	//
	wiki.work({
		each : function(page_data) {
			var content = CeL.wiki.content_of(page_data);
		},
		summary : '',
		log_to : ''
	}, [ '史記' ]);

	// TODO: http://www.mediawiki.org/wiki/API:Edit_-_Set_user_preferences
}

// --------------------------------------------------------------------------------------------- //


if (typeof CeL === 'function')
CeL.run({
name : 'application.net.wiki',
// .includes() @ data.code.compatibility
// .between() @ data.native
// (new Date).format('%4Y%2m%2d'), (new Date).format() @ data.date
// optional: .show_value() @ interact.DOM, application.debug
require : 'data.code.compatibility.|data.native.|application.net.Ajax.get_URL|data.date.',
code : function(library_namespace) {

//	requiring
var get_URL;
eval(this.use());


// --------------------------------------------------------------------------------------------- //


/**
 * web Wikipedia / 維基百科 用的 functions。<br />
 * 可執行環境: node.js, JScript。
 * 
 * @param {String}name
 *            user name
 * @param {String}password
 *            user password
 * @param {String}[API_URL]
 *            language code or API URL
 * 
 * @constructor
 */
function wiki_API(name, password, API_URL) {
	if (!this || this.constructor !== wiki_API)
		return wiki_API.query.apply(null, arguments);

	this.token = {
		// lgusername
		lgname : name,
		lgpassword : password
	};

	// action queue。應以 append，而非整個換掉的方式更改。
	this.actions = [];

	// 紀錄各種後續檢索用索引值。應以 append，而非整個換掉的方式更改。
	// 對舊版本須用到 for (in .next_mark)
	this.next_mark = library_namespace.null_Object();

	// setup session.
	//this.set_URL(API_URL);
	if (API_URL)
		this.API_URL = api_URL(API_URL);
}


//--------------------------------------------------------------------------------------------- //
// 工具函數。

/**
 * Get the API URL of specified project.
 * 
 * @param {String}project
 *            wiki project, domain or language. 指定維基百科語言/姊妹計劃<br />
 *            e.g., 'zh', 'en', 'zh.wikisource'.
 * 
 * @returns {String}API URL
 * 
 * @see https://en.wikipedia.org/wiki/Wikipedia:Wikimedia_sister_projects
 * TODO: https://zh.wikipedia.org/wiki/Wikipedia:%E5%A7%8A%E5%A6%B9%E8%AE%A1%E5%88%92#.E9.93.BE.E6.8E.A5.E5.9E.8B
 */
function api_URL(project) {
	if (project)
		// /^[a-z]+$/i.test(undefined) === true
		if (/^[a-z]+$/i.test(project))
			// e.g., 'zh' → 'zh.wikipedia.org' ({{SERVERNAME}})
			project += '.wikipedia.org';
		else if (/^[a-z]+\.[a-z]+$/i.test(project))
			// e.g., 'zh.wikisource', 'zh.wiktionary'
			project += '.org';

	var matched = /^(https?:\/\/)?[a-z]+(\.[a-z]+)+(\/?)$/i.test(project);
	if (matched)
		// e.g., 'http://zh.wikipedia.org/'
		return (matched[1] || 'https://') + project + (matched[2] || '/')
				+ 'w/api.php';

	if (/^https?:\/\//i.test(project))
		// e.g., 'http://zh.wikipedia.org/w/api.php'
		return project;

	if (project)
		library_namespace.err('Unknown project: [' + project
				+ ']! Using default API URL.');

	return wiki_API.API_URL;
}


//---------------------------------------------------------------------//


/**
 * get NO of namespace
 * 
 * @param {String}namespace
 *            namespace
 * 
 * @returns {Integer}namespace NO.
 */
function get_namespace(namespace) {
	if (typeof namespace === 'string'
			&& ((namespace = namespace.toLowerCase()) in get_namespace.hash))
		return get_namespace.hash[namespace];
	if (isNaN(namespace)) {
		if (namespace)
			library_namespace.warn('get_namespace: Invalid namespace: ['
					+ namespace + ']');
		return namespace;
	}
	return namespace | 0;
}

/**
 * The namespace number of the page. 列舉型別 (enumeration)
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
	// 0: (Main/Article) main namespace 主要(條目)命名空間/識別領域
	// 條目 entry 文章 article: ns = 0, 頁面 page: ns = any. 章節/段落 section
	'' : 0,
	talk : 1,
	user : 2,
	user_talk : 3,
	// project
	wikipedia : 4,
	wikipedia_talk : 5,
	// image
	file : 6,
	file_talk : 7,
	mediawiki : 8,
	mediawiki_talk : 9,
	template : 10,
	template_talk : 11,
	help : 12,
	help_talk : 13,
	category : 14,
	category_talk : 15,
	portal : 100,
	portal_talk : 101,
	book : 108,
	book_talk : 109,
	draft : 118,
	draft_talk : 119,
	education_program : 446,
	education_program_talk : 447,
	timedtext : 710,
	timedtext_talk : 711,
	module : 828,
	module_talk : 829,
	topic : 2600
};

(function() {
	var source = [];
	for ( var namespace in get_namespace.hash)
		source.push(namespace);
	// [ , namespace, title ]
	get_namespace.pattern = new RegExp('^(['
			+ source.join('|').replace(/_/g, '[ _]') + ']):(.+)$', 'i');
})();

function remove_namespace(title) {
	if (typeof title !== 'string') {
		library_namespace.debug(title, 5, 'remove_namespace');
		if (get_page_content.is_page_data(title)) {
			title = title.title;
			// assert: now title is string.
		} else
			return title;
	}
	var matched = title.match(get_namespace.pattern);
	library_namespace.debug(
	//
	'Test [[' + title + ']], get [' + matched + '] using pattern '
			+ get_namespace.pattern, 4, 'remove_namespace');
	if (matched)
		return (matched ? matched[2] : title).trim();
}


//---------------------------------------------------------------------//
// 創建 match patten 相關函數。

/**
 * 規範頁面名稱 page name。
 * 
 * 這種規範化只能通用於本 library 內。Wikipedia 並未硬性設限。
 * 
 * @param {String}page_name
 *            頁面名 page name。
 * 
 * @returns {String}規範後之頁面名稱。
 */
function normalize_page_name(page_name) {
	if (!page_name || typeof page_name !== 'string')
		return page_name;
	page_name = page_name.trim().split(':');
	var name_list = [];
	page_name.forEach(function(section, index) {
		section = section.trim();
		if (index > 1 || index > 0 && page_name[0] || index === page_name.length - 1)
			// ' ' → '_': 在 URL 上可更簡潔。
			name_list.push(section.charAt(0).toUpperCase() + section.slice(1).replace(/ /g, '_'));
		else if (section in get_namespace.hash)
			// Wikipedia namespace
			name_list.push(section.charAt(0).toUpperCase() + section.slice(1));
		else
			// lang code
			name_list.push(section.toLowerCase());
	});
	return name_list.join(':');
}

function normalize_name_pattern(file_name, add_group) {
	if (!file_name)
		return file_name;

	if (Array.isArray(file_name)) {
		var files = [];
		file_name.forEach(function(name) {
			if (name = normalize_name_pattern(name))
				files.push(name);
		});
		return (add_group ? '(' : '(?:') + files.join('|') + ')';
	}

	file_name =
	// wiki file 首字不區分大小寫。
	// the case of the first letter is not significant.
	library_namespace.ignore_first_char_case(
	// escape 特殊字元。注意:照理說來檔案或模板名不應該具有特殊字元!
	library_namespace.to_RegExp_pattern(String(file_name).trim()))
	// 不區分空白與底線。
	.replace(/[ _]/g, '[ _]');

	if (add_group)
		file_name = '(' + file_name + ')';

	return file_name;
}

/**
 * 創建匹配 [[File:file_name]] 之 patten。
 *
 * @param {String}file_name
 *            file name
 * @param {String}flag
 *            RegExp flag
 *
 * @returns {RegExp} 能 match [[File:file_name]] 之 patten。
 */
function file_pattern(file_name, flag) {
	return (file_name = normalize_name_pattern(file_name, true))
	//
	&& new RegExp(file_pattern.source.replace(/name/, file_name), flag || 'g');
}

file_pattern.source =
//[ ':', file name, 接續 ]
 /\[\[[\s\n]*(?:(:)[\s\n]*)?(?:Tag)[\s\n]*:[\s\n]*name\s*(\||\]\])/
//[[ :File:name]] === [[File:name]]
.source.replace('Tag', library_namespace.ignore_case_pattern('File|Image|[檔档]案|[圖图]像'));


//---------------------------------------------------------------------//

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
	var hash = library_namespace.null_Object();
	page_data_list.forEach(use_id ? function(page_data) {
		// = true
		hash[page_data.id] = page_data;
	} : function(page_data) {
		// = true
		hash[page_data.title] = page_data;
	});
	return hash;
}

/**
 * 去掉 page data list 中重複的 items。<br />
 * cf. Array.prototype.uniq @ data.native
 * 
 * @param {Array}page_data_list
 *            list of page_data.
 * 
 * @returns {Array}unique list
 */
function unique_list(page_data_list) {
	var array = [],
	// 以 hash 純量 index 加速判別是否重複。
	hash = library_namespace.null_Object();

	page_data_list.forEach(function(page_data) {
		var key = typeof page_data == 'string' ? page_data : page_data.title;
		if (!(key in hash)) {
			hash[key] = null;
			// 能確保順序不變。
			array.push(page_data);
		}
	});

	return array;
}

//---------------------------------------------------------------------//

// 模板名#後的內容會忽略。
// [ , Template name ]
var TEMPLATE_NAME_PATTERN = /{{[\s\n]*([^\s\n#\|{}<>\[\]][^#\|{}<>\[\]]*)[|}]/,
//
TEMPLATE_START_PATTERN = new RegExp(TEMPLATE_NAME_PATTERN.source.replace(
		/\[[^[]+$/, ''), 'g'),
// 內部連結
LINK_NAME_PATTERN = /\[\[[\s\n]*([^\s\n\|{}<>\[\]][^\|{}<>\[\]]*)(\||\]\])/;

if (false) {
	template_token('a{{temp|{{temp2|p{a}r}}}}b', 0, 0)
	template_token('a{{temp|{{temp2|p{a}r}}}}b', 0, 1)
	template_token('a{{temp|{{temp2|p{a}r}}}}b', 'temp', 0)
	template_token('a{{temp|{{temp2|p{a}r}}}}b', 'temp', 1)
	template_token('a{{temp|{{temp2|p{a}r}}}}b', 'temp2', 0)
	template_token('a{{temp|{{temp2|p{a}r}}}}b', 'temp2', 1)

	CeL.assert([ '{{temp|{{temp2|p{a}r}}}}',
	      		template_token('a{{temp|{{temp2|p{a}r}}}}b')[0] ]);
	CeL.assert([ '{{temp|{{temp2|p{a}r}}}}',
		      		template_token('a{{temp|{{temp2|p{a}r}}}}b', 'temp')[0] ]);
	CeL.assert([ '{{temp2|p{a}r}}',
		      		template_token('a{{temp|{{temp2|p{a}r}}}}b', 'temp2')[0] ]);
}

/**
 * 取得完整的模板 token。<br />
 * 此功能未來可能會統合於 parser 之中。
 * 
 * @param {String}wikitext
 *            模板前後之 content。<br />
 *            assert: wikitext 為良好結構 (well-constructed)。
 * @param {String|Array}[template_name]
 *            擷取模板名。
 * @param {Boolean}[no_parse]
 *            是否不解析 parameters。
 * 
 * @returns {Array}token = [ {String}完整的模板token, {String}模板名,
 *          {Array}parameters ];<br />
 *          token.count = count('{{') - count('}}')，正常情況下應為 0。<br />
 *          token.index, token.lastIndex: index.
 */
function template_token(wikitext, template_name, no_parse) {
	var matched = (template_name = normalize_name_pattern(template_name, true))
	// 模板起始。
	? new RegExp(/{{[\s\n]*/.source + template_name + '\\s*[|}]', 'gi')
			: new RegExp(TEMPLATE_NAME_PATTERN.source, 'g');
	library_namespace.debug('Use patten: ' + matched, 2);
	// template_name : start token
	template_name = matched.exec(wikitext);

	if (!template_name)
		// not found.
		return;

	var pattern = new RegExp('}}|'
	// 不用 TEMPLATE_NAME_PATTERN，預防把模板結尾一起吃掉了。
	+ TEMPLATE_START_PATTERN.source, 'g'), count = 1;
	// lastIndex - 1 : the last char is [|}]
	template_name.lastIndex = pattern.lastIndex = matched.lastIndex - 1;

	while (count > 0 && (matched = pattern.exec(wikitext))) {
		// 遇到模板結尾 '}}' 則減1，否則增1。
		if (matched[0] === '}}')
			count--;
		else
			count++;
	}

	wikitext = pattern.lastIndex > 0 ? wikitext.slice(template_name.index,
			pattern.lastIndex) : wikitext.slice(template_name.index);
	var result = [
	// [0]: {String}完整的模板token
	wikitext,
	// [1]: {String}模板名
	template_name[1].trim(),
	// [2] {String}parameters
	// 接下來要作用在已經裁切擷取過的 wikitext 上，需要設定好 index。
	// assert: 其他餘下 parameters 的部分以 [|}] 起始。
	// -2: 模板結尾 '}}'.length
	wikitext.slice(template_name.lastIndex - template_name.index, -2) ];
	Object.assign(result, {
		count : count,
		index : template_name.index,
		lastIndex : pattern.lastIndex
	});

	if (!no_parse) {
		// {Array}parameters
		// 警告:這邊只是單純的以 '|' 分割，但照理來說應該再 call parser 來處理。
		// 最起碼應該除掉所有可能包含 '|' 的語法，例如內部連結 [[~|~]], 模板 {{~|~}}。
		// .shift(): parameters 以 '|' 起始，因此需去掉最前面一個。
		(result[2] = result[2].split(/[\s\n]*\|[\s\n]*/)).shift();
	}

	return result;
}


// --------------------------------------------------------------------------------------------- //
// TODO: parse wikitext


/*

{{outdent|}}
<code>int m2()</code>
[[~:~|~]]
[[~:~:~|~]]
[~ ~]
[{{}} ]
-{}-
'''~'''
''~''
\n{| ~ \n|}



var wiki_page = CeL.parse_wiki_page(page_data);
wiki_page.each('transclusion', function(list) {
	// this = list;
});
return wiki_page.toString();

*/


// 可順便作正規化，例如修復章節標題 section title 前後 level 不一，
// table "|-" 未起新行等。
var wiki_toString = {
	// Internal/interwiki link : language links : category links, file, subst,
	// ... : title
	// e.g., [[m:en:Help:Parser function]]
	// https://www.mediawiki.org/wiki/Markup_spec#Namespaces
	namespace : function() {
		return this.join(':');
	},
	// page title, Template name
	page_title : function() {
		return this.join(':');
	},
	link : function() {
		return '[[' + this.join('|') + ']]';
	},
	// External link
	external_link : function() {
		return '[' + this.join(' ') + ']';
	},
	URL : function() {
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
	// https://meta.wikimedia.org/wiki/Help:Table
	table : function() {
		// this: [ table style, row, row, ... ]
		return '{|' + this.join('\n|-') + '\n|}';
	},
	table_row : function() {
		// this: [ row style, cell, cell, ... ]
		return this.join('');
	},
	table_cell : function() {
		// this: [ type /\n[!|]|!!|\|\|/, contents ]
		return this.join('');
	},
	style : function() {
		return this.join('');
	},
	// [[H:Convert]]
	convert : function() {
		return '-{' + this.join('|') + '}-';
	},
	// section title
	title : function() {
		var level = '='.repeat(this.level);
		return level + this[0] + level + (this.postfix || '');
	},
	html : function() {
		return this.join('');
	},
	// "<\": for Eclipse JSDoc.
	comment : function() {
		return '<\!--' + this.join('') + '-->';
	},
	line : function() {
		// https://www.mediawiki.org/wiki/Markup_spec/BNF/Article
		// NewLine = ? carriage return and line feed ? ;
		return this.join('\n');
	},
	// plain text 或尚未 parse 的 wikitext.
	text : function() {
		return this.join('');
	}
};


// comments, transclusion

var atom_type = {
	namespace : true,
	page_title : true,
	title : true,
	external_link : true,
	URL : true,
	style : true,
	comment : true
};

// {Array}token
function set_wiki_methods(token, type) {
	if (typeof token === 'string')
		token = [ token ];
	token.type = type;
	token.is_atom = type in atom_type;
	token.toString = wiki_toString[type];
	return token;
}


/*

should use:
class Wiki_page extends Array { }
http://www.2ality.com/2015/02/es6-classes-final.html

*/
var page_prototype = {
	each : for_each_token,
	each_text : for_each_text,
	parse : parse_page
};


if (false) {
	CeL.wiki.wiki_page.parse('{{temp|{{temp2|p{a}r{}}}}}');
	JSON.stringify(CeL.wiki.wiki_page.parse('a{{temp|e{{temp2|p{a}r}}}}b'));
	CeL.wiki.wiki_page('a{{temp|e{{temp2|p{a}r}}}}b').parse().each_text(function(token) { CeL.log(token); });
	CeL.wiki.wiki_page('a{{temp|e{{temp2|p{a}r}}}}b').parse().each('template', function(template) { CeL.log(template.toString()); }) && '';
	CeL.wiki.wiki_page('a{{temp|e{{temp2|p{a}r}}}}b<!--ff[[r]]-->[[t|e]]\n{|\n|r1-1||r1-2\n|-\n|r2-1\n|r2-2\n|}[http://r.r ee]').parse();
	CeL.wiki.wiki_page('\n{|\n|r1-1||r1-2\n|-\n|r2-1\n|r2-2\n|}').parse().each('table', function(table) { CeL.log(table); }) && '';
}


function wiki_page(wikitext, options) {
	if (typeof wikitext === 'string')
		wikitext = [ wikitext ];
	else if (get_page_content.is_page_data(wikitext)) {
		var tmp = [ get_page_content(wikitext) ];
		tmp.page = wikitext;
		wikitext = Object.create(tmp, page_parameters);
	} else
		throw new Error('wiki_page: Unknown wikitext.');

	if (library_namespace.is_Object(options))
		wikitext.options = options;
	// copy prototype methods
	Object.assign(wikitext, page_prototype);
	set_wiki_methods(wikitext, 'text');
	return wikitext;
}

function for_each_text(processor, modify_this) {
	this.forEach(function(token, index) {
		if (typeof token === 'string') {
			// get result
			token = processor(token);
			if (false && modify_this) {
				if (this.type === 'text' && token.type === 'text'
						&& token.length > 1) {
					// 經過改變，需再進一步處理。
					for_each_text.call(token, processor, modify_this);
					token.unshift(index, 1);
					this[index].splice(token);

				} else if (this[index] !== token) {
					this[index] = token;
					// 經過改變，需再進一步處理。
					if (Array.isArray(token))
						for_each_text.call(token, processor, modify_this);
				}
			}

		} else if (Array.isArray(token) && !token.is_atom)
			for_each_text.call(token, processor, modify_this);
	}, this);

	return this;
}

wiki_page.type_alias = {
	row : 'table_row',
	template : 'transclusion'
};

// 觸發器 : function(Array inside node)
function for_each_token(type, trigger) {
	if (type in wiki_page.type_alias)
		type = wiki_page.type_alias[type];

	this.forEach(function(token, index) {
		if (Array.isArray(token)) {
			if (token.type === type)
				trigger(token);
			// is_atom: 不包含可 parse 之要素，不包含 text。
			if (!token.is_atom)
				for_each_token.call(token, type, trigger);
		}
	}, this);

	return this;
}


function parse_page(options) {
	// 範圍由大到小。
	// e.g., transclusion 不能包括 table，因此在 table 後。
	// this.each_text(parse_comment, true);
	// this.each_text(parse_table, true);
	// this.each_text(parse_transclusion, true);
	// this.each_text(parse_link, true);
	if (!this.parsed) {
		// assert: this = [ {String} ]
		var parsed = parse_wikitext(this[0], options);
		// library_namespace.log(parsed);
		if (Array.isArray(parsed) && parsed.type === 'text') {
			this.pop();
			Array.prototype.push.apply(this, parsed);
		} else
			this[0] = parsed;
		this.parsed = true;
	}
	return this;
}

function resolve_escaped(queue, include_mark, end_mark) {
	library_namespace.debug('queue: ' + queue.join('\n--- '), 4,
			'resolve_escaped');
	queue.forEach(function(item, index) {
		library_namespace.debug([ 'item', index, item ], 4, 'resolve_escaped');
		if (typeof item !== 'string')
			// assert: Array.isArray(item)
			return;

		// result queue
		var result = [];

		item.split(include_mark).forEach(function(token, index) {
			if (index === 0) {
				if (token)
					result.push(token);
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

		if (result.length > 1)
			set_wiki_methods(result, 'text');
		else
			result = result[0];
		queue[index] = result;
	});
}


// 經測試發現 {{...}} 名稱中不可有 [{}<>\[\]]
// while(/{{{[^{}\[\]]+}}}/g.exec(wikitext));
// 模板名#後的內容會忽略。
var PATTERN_transclusion = /{{[\s\n]*([^\s\n#\|{}<>\[\]][^#\|{}<>\[\]]*)(?:#[^\|{}]*)?((?:\|[^<>\[\]]*)*?)}}/g,
//
PATTERN_link = /\[\[[\s\n]*([^\s\n\|{}<>\[\]][^\|{}<>\[\]]*)((?:\|[^\|{}<>\[\]]*)*)\]\]/g;

/**
 * parse The MediaWiki markup language (wikitext)
 * 
 * 此功能之工作機制/原理：<br />
 * 找出完整的最小單元，並將之 push 入 queue，並把原 string 中之單元 token 替換成:<br />
 * {String}include_mark + ({Integer}index of queue) + end_mark<br />
 * e.g.,<br />
 * "a[[p]]b{{t}}" →<br />
 * "a[[p]]b\00;", queue = [ ["t"].type='transclusion' ] →<br />
 * "a\01;b\00;", queue = [ ["t"].type='transclusion', ["p"].type='link' ]<br />
 * 最後再依 queue 與剩下的 wikitext 作 resolve。
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
 * @see [[:en:Wiki markup]], [[Wiki標記式語言]]
 *      https://www.mediawiki.org/wiki/Markup_spec/BNF/Article
 *      https://www.mediawiki.org/wiki/Markup_spec/BNF/Inline_text
 *      https://www.mediawiki.org/wiki/Markup_spec
 *      https://www.mediawiki.org/wiki/Wikitext
 *      https://doc.wikimedia.org/mediawiki-core/master/php/html/Parser_8php.html
 *      Parser.php: PHP parser that converts wiki markup to HTML.
 */
function parse_wikitext(wikitext, options, queue) {
	if (!wikitext)
		return wikitext;

	/**
	 * 找出一個文件中不可包含的字串，作為解析用之特殊標記。<br />
	 * e.g., '\u0000'.<br />
	 * include_mark + ({Integer}index of queue) + end_mark
	 * 
	 * @type {String}
	 */
	var include_mark = options && options.include_mark || '\0',
	/** {String}end of include_mark. 不可為數字 (\d) 或 include_mark。 */
	end_mark = options && options.end_mark || ';',
	/** {Boolean}是否順便作正規化。預設不會作正規化。 */
	normalize = options && options.normalize,
	/** {Boolean}是否需要初始化。 */
	need_initialize = !queue;

	if (/\d/.test(end_mark) || include_mark.includes(end_mark))
		throw new Error('Error end of include_mark!');

	if (need_initialize) {
		// 初始化
		wikitext = wikitext.replace(/\r\n/g, '\n').replace(
		// 先 escape 掉會造成問題之 chars。
		new RegExp(include_mark.replace(/([\s\S])/g, '\\$1'), 'g'),
				include_mark + end_mark);
		// temporary queue
		queue = [];

		if (options && typeof options.prefix === 'function')
			wikitext = options.prefix(wikitext, queue, include_mark, end_mark);
	}

	// start parse

	// "<\": for Eclipse JSDoc.
	wikitext = wikitext.replace_till_stable(/<\!--([\s\S]*?)-->/g, function(
			all, parameters) {
		queue.push(set_wiki_methods(parameters, 'comment'));
		return include_mark + (queue.length - 1) + end_mark;
	});

	// {{{...}}} 需在 {{...}} 之前解析。
	// https://zh.wikipedia.org/wiki/Help:%E6%A8%A1%E6%9D%BF
	// 在模板頁面中，用三個大括弧可以讀取參數
	// MediaWiki 會把{{{{{{XYZ}}}}}}解析為{{{ {{{XYZ}}} }}}而不是{{ {{ {{XYZ}} }} }}
	wikitext = wikitext.replace_till_stable(/{{{([^{}][\s\S]*?)}}}/g, function(
			all, parameters) {
		// 自 end_mark 向前回溯。
		var index = parameters.lastIndexOf('{{{'), prevoius;
		if (index > 0) {
			prevoius = '{{{' + parameters.slice(0, index);
			parameters = parameters.slice(index + '}}}'.length);
		} else {
			prevoius = '';
		}
		library_namespace.debug(prevoius + ' + ' + parameters, 4,
				'parse_wikitext.parameter');

		parameters = parameters.split('|').map(
				function(token, index) {
					return index === 0 ? set_wiki_methods(token.split(':'),
							'page_title')
					// 經過改變，需再進一步處理。
					: parse_wikitext(token, options, queue);
				});
		set_wiki_methods(parameters, 'parameter');
		queue.push(parameters);
		return prevoius + include_mark + (queue.length - 1) + end_mark;
	});

	// 模板（英語：Template，又譯作「樣板」、「範本」）
	// PATTERN_transclusion
	wikitext = wikitext.replace_till_stable(/{{([^{}][\s\S]*?)}}/g,
	//
	function(all, parameters) {
		// 自 end_mark 向前回溯。
		var index = parameters.lastIndexOf('{{'), prevoius;
		if (index > 0) {
			prevoius = '{{' + parameters.slice(0, index);
			parameters = parameters.slice(index + '}}'.length);
		} else {
			prevoius = '';
		}
		library_namespace.debug(prevoius + ' + ' + parameters, 4,
				'parse_wikitext.transclusion');

		parameters = parameters.split('|').map(
				function(token, index) {
					return index === 0 ? set_wiki_methods(token.split(':'),
							'page_title')
					// 經過改變，需再進一步處理。
					: parse_wikitext(token, options, queue);
				});
		set_wiki_methods(parameters, 'transclusion');
		queue.push(parameters);
		return prevoius + include_mark + (queue.length - 1) + end_mark;
	});

	wikitext = wikitext.replace_till_stable(/-{(.+?)}-/g, function(all,
			parameters) {
		// 自 end_mark 向前回溯。
		var index = parameters.lastIndexOf('-{'), prevoius;
		if (index > 0) {
			prevoius = '-{' + parameters.slice(0, index);
			parameters = parameters.slice(index + '}-'.length);
		} else {
			prevoius = '';
		}
		library_namespace.debug(prevoius + ' + ' + parameters, 4,
				'parse_wikitext.convert');

		parameters = parameters.split('|').map(function(token, index) {
			// 經過改變，需再進一步處理。
			return parse_wikitext(token, options, queue);
		});
		set_wiki_methods(parameters, 'convert');
		queue.push(parameters);
		return prevoius + include_mark + (queue.length - 1) + end_mark;
	});

	// PATTERN_link
	// 須注意: [[p|\nt]] 可，但 [[p\n|t]] 不可!
	wikitext = wikitext.replace_till_stable(/\[\[([^\[\]]+)\]\]/g, function(
			all, parameters) {
		// 自 end_mark 向前回溯。
		var index = parameters.lastIndexOf('[['), prevoius;
		if (index > 0) {
			prevoius = '[[' + parameters.slice(0, index);
			parameters = parameters.slice(index + ']]'.length);
		} else {
			prevoius = '';
		}
		library_namespace.debug(prevoius + ' + ' + parameters, 4,
				'parse_wikitext.link');

		parameters = parameters.split('|').map(function(token, index) {
			return index === 0 ? set_wiki_methods(
			// [[: en : abc]] is OK,
			// [[ : en : abc]] is NOT OK.
			token.split(normalize ? /\s*:\s*/ : ':'), 'namespace')
			// 經過改變，需再進一步處理。
			: parse_wikitext(token, options, queue);
		});
		set_wiki_methods(parameters, 'link');
		queue.push(parameters);
		return prevoius + include_mark + (queue.length - 1) + end_mark;
	});

	wikitext = wikitext.replace_till_stable(
	// 若為結尾 /$/ 亦會 parse 成 external link。
	/\[((?:https?:|ftp:)?\/\/[^\/\s][^\s]+)((?:\s[^\]]*)?)(?:\]|$)/gi,
	//
	function(all, URL, parameters) {
		URL = [ set_wiki_methods(URL, 'URL') ];
		if (normalize)
			parameters = parameters.trim();
		if (parameters)
			URL.push(parameters);
		set_wiki_methods(URL, 'external_link');
		queue.push(URL);
		return include_mark + (queue.length - 1) + end_mark;
	});

	// 經測試，table 不會向前回溯。
	wikitext = wikitext.replace_till_stable(/\n{\|([\s\S]*?)\n\|}/g, function(
			all, parameters) {
		parameters = parameters.split('\n|-').map(function(token, index) {
			if (index === 0
			// 含有 delimiter 的話，即使位在 "{|" 之後，依舊會被當作 row。
			&& !/\n[!|]|!!|\|\|/.test(token)) {
				// table style
				return set_wiki_methods(token, 'style');
			}
			var row, matched, separater,
			// 必須有實體才能如預期作 .exec()。
			pattern = /([\s\S]*?)(\n[!|]|!!|\|\||$)/g;
			while (matched = pattern.exec(token)) {
				if (row)
					row.push(set_wiki_methods([ separater,
					// 經過改變，需再進一步處理。
					parse_wikitext(matched[1], options, queue) ],
					//
					'table_cell'));
				else
					row = [ set_wiki_methods(token.slice(0, matched.index),
					// row style
					'style') ];
				separater = matched[2];
				if (!separater)
					// ended.
					break;
			}
			return set_wiki_methods(row, 'table_row');
		});

		set_wiki_methods(parameters, 'table');
		queue.push(parameters);
		return include_mark + (queue.length - 1) + end_mark;
	});

	// TODO: HTML tags, Magic words

	wikitext = wikitext.replace_till_stable(/\n(=+)(.+)\1(\s*)\n/g, function(
			all, prefix, parameters, postfix) {
		if (normalize)
			parameters = parameters.trim();
		else if (postfix)
			(parameters = [ parameters ]).postfix = postfix;
		set_wiki_methods(parameters, 'title');
		parameters.level = prefix.length;
		queue.push(parameters);
		return '\n' + include_mark + (queue.length - 1) + end_mark + '\n';
	});

	if (false) {
		// another method to parse.
		wikitext = '{{temp|{{temp2|p{a}r{}}}}}';
		pattern = /{{[\s\n]*([^\s\n#\|{}<>\[\]][^#\|{}<>\[\]]*)/g;
		matched = pattern.exec(wikitext);
		end_index = wikitext.indexOf('}}', pattern.lastIndex);

		/\[\[([^\|\[\]{}]+)/g;
	}

	if (need_initialize && options && typeof options.postfix === 'function')
		wikitext = options.postfix(wikitext, queue, include_mark, end_mark);

	queue.push(wikitext);
	resolve_escaped(queue, include_mark, end_mark);

	return queue[queue.length - 1];
}

wiki_page.parse = parse_wikitext;


// parse Date
function parse_Date(wikitext) {
	return wikitext && wikitext
	// 去掉年分前之雜項。
	.replace(/.+(\d{4}年)/, '$1')
	// 去掉星期。
	.replace(/日\s*\([^()]+\)/, '日 ')
	// Warning: need data.date.
	.to_Date();
}

// parse user name
function parse_user(wikitext) {
	var matched = wikitext && wikitext.match(
	// 使用者/用戶對話頁面
	/\[\[\s*(?:user(?:[ _]talk)?|用户(?:讨论)|用戶(?:討論))\s*:\s*([^\|\]]+)/i);
	if (matched)
		return matched[1].trim();
}


// 若重定向到其他頁面，則回傳其頁面名。
function parse_redirect(wikitext) {
	var matched = wikitext && wikitext.match(
	//
	/(?:^|[\s\n]*)#(?:REDIRECT|重定向)\s*\[\[([^\]]+)\]\]/i);
	if (matched)
		return matched[1].trim();
}

Object.assign(wiki_page, {
	Date : parse_Date,
	user : parse_user,
	redirect : parse_redirect
});


//---------------------------------------------------------------------//

/**
 * get title of page.
 * 
 * @param {Object}page_data
 *            page data got from wiki API
 * 
 * @returns {String} title of page
 * 
 * @seealso wiki_API.query.title_param()
 */
function get_page_title(page_data) {
	// 處理 [ {String}API_URL, {String}title ]
	if (Array.isArray(page_data)) {
		if (get_page_content.is_page_data(page_data[0]))
			// assert: page_data = [ page data, page data, ... ]
			return page_data.map(get_page_title);
		// assert: page_data =
		// [ {String}API_URL, {String}title || {Object}page_data ]
		page_data = page_data[1];
	}
	// should use get_page_content.is_page_data(page_data)
	return library_namespace.is_Object(page_data) ? 'title' in page_data ? page_data.title
			: null
			: page_data;
}


/**
 * get the contents of page data. 取得頁面內容。
 *
 * @param {Object}page_data
 *            page data got from wiki API
 *
 * @returns {String} content of page
 */
function get_page_content(page_data) {
	return get_page_content.is_page_data(page_data) ?
	//
	(page_data = get_page_content.has_content(page_data)) && page_data['*']
			|| null

	// 一般都會輸入 page_data: {"pageid":0,"ns":0,"title":""}
	//: typeof page_data === 'string' ? page_data

	// ('missing' in page_data): 此頁面已刪除。
	// e.g., { ns: 0, title: 'title', missing: '' }
	// TODO: 提供此頁面的刪除和移動日誌以便參考。
	: page_data && ('missing' in page_data) ? undefined : String(page_data);
}

/**
 * check if page_data is page data.
 * 
 * @param {Object}page_data
 *            page data got from wiki API
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
 *            page data got from wiki API
 * 
 * @returns {String|Number} pageid
 */
get_page_content.pageid = function(page_data) {
	return get_page_content.is_page_data(page_data) && page_data.pageid;
};

// return .revisions[0]
// 不回傳 {String}，減輕負擔。
get_page_content.has_content = function(page_data) {
	return library_namespace.is_Object(page_data)
	// treat as page data. Try to get page contents: page.revisions[0]['*']
	&& page_data.revisions && page_data.revisions[0];
};


//--------------------------------------------------------------------------------------------- //
// instance 相關函數。

wiki_API.prototype.toString = function(type) {
	return get_page_content(this.last_page) || '';
};

// @see function get_continue(), get_list()
wiki_API.prototype.show_next = typeof JSON === 'object' && JSON.stringify ? function() {
	return this.next_mark && JSON.stringify(this.next_mark);
} : function() {
	if (!this.next_mark)
		return;
	var line = [], value;
	for (var name in this.next_mark) {
		value = this.next_mark[name];
		line.push(name + ':' + (typeof value === 'string'
		//
		? '"' + value.replace(/"/g, '\\"') + '"' : value));
	}
	if (line.length > 0)
		return '{' + line.join(',') + '}';
};

wiki_API.prototype.next = function() {
	if (!(this.running = 0 < this.actions.length)) {
		library_namespace.debug('Empty queue.', 2, 'wiki_API.prototype.next');
		//console.warn(this);
		return;
	}

	library_namespace.debug('剩餘 ' + this.actions.length + ' action(s)', 2, 'wiki_API.prototype.next');
	if (library_namespace.is_debug(3)
		// .show_value() @ interact.DOM, application.debug
		&& library_namespace.show_value)
		library_namespace.show_value(this.actions.slice());
	var _this = this, next = this.actions.shift();
	library_namespace.debug('處理 ' + (this.token.lgname ? this.token.lgname + ' ' : '') + '[' + next + ']', 2, 'wiki_API.prototype.next');
	switch (next[0]) {
	case 'page':
		// this.page(page data, callback) → 採用所輸入之 page data 作為 this.last_page。
		if (get_page_content.is_page_data(next[1]) && get_page_content.has_content(next[1])) {
			library_namespace.debug('採用所輸入之 [' + next[1].title + '] 作為 this.last_page。', 2, 'wiki_API.prototype.next');
			this.last_page = next[1];
			if (typeof next[2] === 'function')
				// next[1] : callback
				next[2].call(this, next[1]);
			this.next();
		} else if (typeof next[1] === 'function') {
			// this.page(callback): callback(last_page)
			// next[1] : callback
			next[1].call(this, this.last_page);
			this.next();
		} else
			// this.page(title, callback)
			// next[1] : title
			// next[3] : options
			// [ {String}API_URL, {String}title ]
			wiki_API.page([ this.API_URL, next[1] ], function(page_data) {
				_this.last_page = Array.isArray(page_data) ? page_data[0] : page_data;
				// next[2] : callback
				if (typeof next[2] === 'function')
					next[2].call(_this, page_data);
				_this.next();
			}, next[3]);
		break;

	case 'backlinks':
	case 'embeddedin':
	case 'imageusage':
	case 'linkshere':
	case 'fileusage':
		// get_list(). e.g., 反向連結/連入頁面.
		// next[1] : title
		wiki_API[next[0]]([ this.API_URL, next[1] ], function(title, titles, pages) {
			// [ last_list ]
			_this.last_titles = titles;
			// [ page_data ]
			_this.last_pages = pages;

			if (typeof next[2] === 'function')
				// next[2] : callback(title, titles, pages)
				next[2].call(_this, title, titles, pages);
			else if (next[2] && next[2].each)
				// next[2] : 當作 work，處理積存工作。
				if (pages)
					_this.work(next[2]);
				else
					// 只有在本次有處理頁面時，才繼續下去。
					library_namespace.info('無頁面可處理（已完成？），中斷跳出。');

			_this.next();
		},
		// next[3] : options
		Object.assign(library_namespace.null_Object(), this.next_mark, {
			// 作業中之 {wiki_API}
			wiki : _this
		}, next[3]));
		break;

	case 'search':
		wiki_API.search([ this.API_URL, next[1] ], function(key, pages, hits) {
			// [ page_data ]
			_this.last_pages = pages;
			// 設定/紀錄後續檢索用索引值。
			// 若是將錯誤的改正之後，應該重新自 offset 0 開始 search。
			// 因此這種情況下基本上不應該使用此值。
			if (pages.sroffset)
				_this.next_mark.sroffset = pages.sroffset;

			if (typeof next[2] === 'function')
				// next[2] : callback(key, pages, hits)
				next[2].call(_this, key, pages, hits);
			else if (next[2] && next[2].each)
				// next[2] : 當作 work，處理積存工作。
				_this.work(next[2]);

			_this.next();
		},
		// next[3] : options
		next[3]);
		break;

	case 'check':
		next[1] = Object.assign(library_namespace.null_Object(), this.check_options,
		// next[1]: options
		typeof next[1] === 'boolean' ? {
			force : next[1]
		} : typeof options === 'string' ? {
			title : next[1]
		} : library_namespace.is_Object(next[1]) ? next[1] : {});

		// ('stopped' in this): 已經有 cache。
		if (('stopped' in this) 
		// force to check
		&& next[1].force) {
			library_namespace.debug('Skip check_stop().', 1, 'wiki_API.prototype.next');
			this.next();
		} else {
			library_namespace.debug('以 .check_stop() 檢查與設定是否須停止編輯作業。', 1, 'wiki_API.prototype.next');
			library_namespace.debug('Using options to check_stop(): ' + JSON.stringify(next[1]), 2, 'wiki_API.prototype.next');
			next[1].token = this.token;
			wiki_API.check_stop(function(stopped) {
				// cache
				_this.stopped = stopped;

				_this.next();
			}, next[1]);
		}
		break;

	case 'edit':
		// TODO: {String|RegExp|Array}filter
		if (!this.last_page) {
			library_namespace.warn('wiki_API.prototype.next: No page in the queue. You must run .page() first!');
			// next[3] : callback
			if (typeof next[3] === 'function')
				next[3].call(_this, title, 'no page');
			this.next();

		} else if (!('stopped' in this)) {
			// rollback
			this.actions.unshift([ 'check' ], next);
			this.next();
		} else if (this.stopped && !next[2].skip_stopped) {
			library_namespace.warn('wiki_API.prototype.next: 已停止作業，放棄編輯[[' + this.last_page.title + ']]！');
			// next[3] : callback
			if (typeof next[3] === 'function')
				next[3].call(_this, title, '已停止作業');
			this.next();

		} else if (wiki_API.edit.denied(this.last_page, this.token.lgname, next[2] && next[2].action)) {
			// 採用 this.last_page 的方法，在 multithreading 下可能因其他 threading 插入而造成問題，須注意！
			library_namespace.warn('wiki_API.prototype.next: Denied to edit [[' + this.last_page.title + ']]');
			// next[3] : callback
			if (typeof next[3] === 'function')
				next[3].call(this, this.last_page.title, 'denied');
			this.next();
		} else {
			if (typeof next[1] === 'function') {
				// next[1] = next[1](get_page_content(this.last_page), this.last_page.title, this.last_page);
				// 需要同時改變 wiki_API.edit!
				next[1] = next[1](this.last_page);
			}
			if (next[2] && next[2].skip_nochange
			// 採用 skip_nochange 可以跳過實際 edit 的動作。
			&& next[1] === get_page_content(this.last_page)) {
				library_namespace.debug('Skip [' + this.last_page.title + ']: The same contents.');
				// next[3] : callback
				if (typeof next[3] === 'function')
					next[3].call(this, this.last_page.title, 'nochange');
				_this.next();
			} else
				wiki_API.edit([ this.API_URL, this.last_page ],
				// 因為已有 contents，直接餵給轉換函式。
				next[1], this.token,
				// next[2]: options to edit()
				next[2], function(title, error, result) {
					// 當運行過多次，就可能出現 token 不能用的情況。需要重新 get token。
					if (result && result.error && result.error.code === 'badtoken') {
						// Invalid token
						library_namespace.warn('wiki_API.prototype.next: It seems we lost the token.');
						if (!_this.token.lgpassword) {
							library_namespace.err('wiki_API.prototype.next: No password to get token again. About.');
							return;
						}
						library_namespace.info('wiki_API.prototype.next: Try to get token again. 似乎丟失了 token，嘗試重新取得 token。');
						// rollback
						_this.actions.unshift(next);
						// see wiki_API.login
						delete _this.token.csrftoken;
						wiki_API.login(_this.token.lgname, _this.token.lgpassword, {
							session : _this,
							// 將 'login' 置於最前頭。
							login_mark : true
						});
					} else {
						// next[3] : callback
						if (typeof next[3] === 'function')
							next[3].call(_this, title, error, result);
						_this.next();
					}
				});
		}
		break;

	case 'login':
		library_namespace.debug('正 log in 中，當 login 後，會自動執行 .next()，處理餘下的工作。', 2, 'wiki_API.prototype.next');
	case 'wait':
		// rollback
		this.actions.unshift(next);
		break;

	case 'logout':
		// 結束
		wiki_API.logout(function() {
			if (typeof next[1] === 'function')
				next[1].call(_this);
			_this.next();
		});
		break;

	case 'set_URL':
		if (next[1] && typeof next[1] === 'string')
			this.API_URL = api_URL(next[1]);
		this.next();
		break;

	case 'run':
		if (typeof next[1] === 'function')
			next[1].call(this, next[2]);
		this.next();
		break;

	default:
		library_namespace.warn('Unknown operation: [' + next.join() + ']');
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
wiki_API.prototype.next.methods = 'page,check,edit,search,logout,run,set_URL'
		.split(',');


//---------------------------------------------------------------------//

/**
 * default date format. 預設的日期格式
 * 
 * @type {String}
 * @see ISO 8601
 */
wiki_API.prototype.date_format = '%4Y%2m%2dT%2H%2M';

/** {String}後續檢索用索引值標記名稱 */
wiki_API.prototype.continue_key = '後續索引';

/**
 * 規範 log 之格式。(for wiki_API.prototype.work)
 * 
 * @param {String}message
 *            message
 * @param {String}[title]
 *            message title
 */
function add_message(message, title) {
	this.push('* ' + ((title = get_page_title(title)) ? '[[' + title + ']]: ' : '') + message);
}


// wiki_API.prototype.work(config): configuration:
({
	first : function(messages, titles, pages) {
	},
	// {Function|Array} 每個 page 執行一次。
	each : function(page_data, messages) {
		return 'text to replace';
	},
	last : function(messages, titles, pages) {
	},
	// 不作編輯作業。
	no_edit : true,
	// 設定寫入目標。一般為 debug、test 測試期間用。
	write_to : '',
	/** {String}運作記錄存放頁面。 */
	log_to : 'User:Robot/log/%4Y%2m%2d',
	/** {String}編輯摘要。總結報告。「新條目、修飾語句、修正筆誤、內容擴充、排版、內部鏈接、分類、消歧義、維基化」 */
	summary : ''
});

/**
 * robot 作業操作之輔助套裝函數。<br />
 * 不會推入 this.actions queue，即時執行。因此需要先 get list!
 * 
 * @param {Object}config
 *            configuration
 * @param {Array}pages
 *            page data list
 * @param {Array}[titles]
 *            title list
 */
wiki_API.prototype.work = function(config, pages, titles) {
	if (typeof config === 'function')
		config = {
			each : config
		};
	if (!config || !config.each) {
		library_namespace.warn('wiki_API.work: Bad callback!');
		return;
	}

	if (!pages)
		pages = this.last_pages, titles = this.last_titles;
	// config.run_empty: 即使無頁面/未取得頁面，依舊強制執行下去。
	if (!pages && !titles && !config.run_empty) {
		// 採用推入前一個 this.actions queue 的方法，
		// 在 multithreading 下可能因其他 threading 插入而造成問題，須注意！
		library_namespace
				.warn('wiki_API.work: No list. Please get list first!');
		return;
	}

	library_namespace.debug('wiki_API.work: 開始執行:先作環境建構與初始設定。');
	if (config.summary)
		library_namespace.info('wiki_API.work: start [' + config.summary + ']');

	// default handler [ text replace function(title, content), {Object}options, callback(title, error, result) ]
	var each,
	// options 在此暫時作為 default options。
	options = config.options || {
		// Throw an error if the page doesn't exist.
		// 若頁面不存在，則產生錯誤。
		// 要取消這項，須注意在重定向頁之對話頁操作之可能。
		nocreate : 1,
		// 該編輯是一個小修訂 (minor edit)。
		minor : 1,
		// 標記此編輯為機器人編輯。
		bot : 1,
		// 設定寫入目標。一般為 debug、test 測試期間用。
		write_to : '',
		// 採用 skip_nochange 可以跳過實際 edit 的動作。
		// 對於大部分不會改變頁面的作業，能大幅加快速度。
		skip_nochange : true
	}, callback, nochange_count = 0;

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
						})
						// 即使設定 minor=0 似乎也會當作設定了，得完全消滅才行。
						delete options[callback];
					else
						options[callback] = config[callback];
				}
			}
		}

	} else if (Array.isArray(config.each))
		each = config;
	else
		library_namespace.err(
		//
		'wiki_API.work: Invalid function for each page!');

	if (each[1])
		Object.assign(options, each[1]);
	options.summary = (callback = config.summary)
	// 是為 Robot 運作。
	? /bot/i.test(callback) ? callback : 'Robot: ' + callback
	// 未設置時，一樣添附 Robot。
	: 'Robot';

	// assert: 因為要作排程，為預防衝突與不穩定的操作結果，自此以後不再 modify options。

	var log_item = Object.assign(library_namespace.null_Object(),
			wiki_API.prototype.work.log_item, config.log_item);

	if (!(callback = each[2]))
		// default logger.
		callback = function(title, error, result) {
			if (error)
				if (error === 'nochange') {
					done++;
					// 未經過 wiki 操作，於 wiki_API.edit 發現為無改變的。
					nochange_count++;
					error = '無改變。';
					result = 'nochange';
				} else {
					// 有錯誤發生。
					result = [ 'error', error ];
					error = '結束: ' + error;
				}
			else {
				// 成功完成。
				done++;
				if (result.edit.newrevid) {
					// https://en.wikipedia.org/wiki/Help:Wiki_markup#Linking_to_old_revisions_of_pages.2C_diffs.2C_and_specific_history_pages
					error = ' [[Special:Diff/' + result.edit.newrevid + '|完成]]。';
					result = 'succeed';
				} else if ('nochange' in result.edit) {
					// 經過 wiki 操作，發現為無改變的。
					nochange_count++;
					error = '無改變。';
					result = 'nochange';
				} else {
					// 有時無 result.edit.newrevid。
					library_namespace.err('無 result.edit.newrevid');
					error = '完成。';
					result = 'succeed';
				}
			}

			// error: message, result: result type.

			error = '間隔 ' + messages.last.age(new Date) + '，'
			// 紀錄使用時間, 歷時, 費時
			+ (messages.last = new Date).format(config.date_format || this.date_format) + ' ' + error;
			if (log_item[ Array.isArray(result) ?
			// {Array}result = [ main, sub ]
			result.join('_') in log_item ? result.join('_') : result[0] : result ])
				messages.add(error, title);
		};
	// each 現在轉作為對每一頁面執行之工作。
	each = each[0];

	var done = 0, messages = [];
	// 設定 time stamp。
	messages.start = messages.last = new Date;
	messages.add = add_message;
	if (Array.isArray(pages) && pages.slice(0, 10).every(function(item) {
		return typeof item === 'string';
	})) {
		// 傳入標題列表。
		messages.input_title_list = true;
	}

	if (false && Array.isArray(pages)
	//
	&& (Array.isArray(titles) ? pages.length !== titles.length : !titles)) {
		library_namespace.warn('wiki_API.work: rebuild titles.');
		titles = [];
		pages.forEach(function(page) {
			titles.push(page.title);
		});
	}

	// do a little check.
	if (Array.isArray(pages) && Array.isArray(titles) && pages.length !== titles.length)
		library_namespace.warn('wiki_API.work: The length of pages and titles are different!');

	library_namespace.debug('wiki_API.work: 設定一次先取得所有 revisions (page content)。', 2);
	this.page(pages || titles, function(data) {
		if (!Array.isArray(data))
			if (!data && pages.length === 0) {
				library_namespace.info('wiki_API.work: 未取得或設定任何頁面。已完成？');
				data = [];
			} else
				// 可能是 page data 或 title。
				data = [ data ];

		if (Array.isArray(pages) && data.length !== pages.length)
			library_namespace.warn('wiki_API.work: query 所得之 length (' + data.length + ') !== pages.length (' + pages.length + ') ！');
		// 傳入標題列表，則由程式自行控制，毋須設定後續檢索用索引值。
		if (!messages.input_title_list
			// config.continue_wiki: 後續檢索用索引值存儲所在的 {wiki_API}，將會以此 instance 之值寫入 log。
			&& (pages = 'continue_wiki' in config ? config.continue_wiki : this)
			// pages: 後續檢索用索引值之暫存值。
			&& (pages = pages.show_next()))
			messages.add(this.continue_key + ': ' + pages);
		// 使用時間, 費時
		pages = '首先使用 ' + messages.last.age(new Date) + ' 以取得 ' + data.length + ' 個頁面內容。';
		// 在「首先使用」之後才設定 .last，才能正確抓到「首先使用」。
		messages.last = new Date;
		if (log_item.get_pages)
			messages.add(pages);
		library_namespace.debug(pages, 2, wiki_API.work);
		if (library_namespace.is_debug()
			// .show_value() @ interact.DOM, application.debug
			&& library_namespace.show_value)
			library_namespace.show_value(data, 'pages');
		pages = data;

		if (typeof config.first === 'function')
			config.first.call(this, messages, titles, pages);

		library_namespace.debug('wiki_API.work: for each page: 主要機制是把工作全部推入 queue。', 2);
		pages.forEach(function(page, index) {
			if (library_namespace.is_debug(2)
				// .show_value() @ interact.DOM, application.debug
				&& library_namespace.show_value)
				library_namespace.show_value(page, 'page');
			if (config.no_edit)
				// 不作編輯作業。
				// 取得頁面內容。
				this.page(page, function(page_data) {
					each(page_data, messages);
				});
			else {
				// clone() 是為了能個別改變 summary。
				// 例如: each() { options.summary += " -- ..."; }  
				var work_options = Object.clone(options);
				// 取得頁面內容。一頁頁處理。
				this.page(page)
				// 編輯頁面內容。
				.edit(function(page_data) {
					// edit/process
					library_namespace.info('wiki_API.work: edit '
					//
					+ (index + 1) + '/' + pages.length + ' [[' + page_data.title + ']]');
					// 以 each() 的回傳作為要改變成什麼內容。
					return each(page_data, messages, work_options);
				}, work_options, callback);
			}
		}, this);

		this.run(function() {
			library_namespace.debug('wiki_API.work: 收尾。');
			if (log_item.report)
				messages.unshift(': 完成 ' + done + (done === pages.length ? '' : '/' + pages.length) + ' 條目，'
				// 未改變任何條目。
				+ (nochange_count ? (done === nochange_count ? '所有' : nochange_count + ' ') + '條目未作變更，' : '')
				// 使用時間, 費時
				+ '前後總共 ' + messages.start.age(new Date) + '。');
			if (this.stopped)
				messages.add("'''已停止作業'''，放棄編輯。");
			if (done === nochange_count)
				messages.add('全無變更。');
			if (log_item.title && config.summary)
				// unescape
				messages.unshift(config.summary.replace(/</g, '&lt;'));

			if (typeof config.last === 'function')
				config.last.call(this, messages, titles, pages);

			var log_to = 'log_to' in config ? config.log_to
			// default log_to
			: 'User:' + this.token.lgname + '/log/' + (new Date).format('%4Y%2m%2d'),
			// options for summary.
			options = {
				// append 章節/段落 after all, at bottom.
				section : 'new',
				// 章節標題
				sectiontitle : '[' + (new Date).format(config.date_format || this.date_format) + '] ' + done
				//
				+ (done === pages.length ? '' : '/' + pages.length) + ' 條目',
				summary : 'Robot: ' + config.summary + ': 完成 ' + done + (done === pages.length ? '' : '/' + pages.length) + ' 條目',
				// Throw an error if the page doesn't exist.
				// 若頁面不存在，則產生錯誤。
				nocreate : 1,
				// 標記此編輯為機器人編輯。
				bot : 1,
				// 就算設定停止編輯作業，仍強制編輯。
				skip_stopped : true
			};

			if (log_to && (done !== nochange_count
				// 若全無變更，則預設僅從 console 提示，不寫入 log 頁面。
				|| config.log_nochange)) {
				this.page(log_to)
				// 將 robot 運作記錄、log summary 報告結果寫入 log 頁面。
				// TODO: 以表格呈現。
				.edit(messages.join('\n'), options, function(title, error, result) {
					if (error) {
						library_namespace.warn('wiki_API.work: Can not write log to [' + log_to
						//
						+ ']! Try to write to [' + 'User:' + this.token.lgname + ']');
						library_namespace.log('\nlog:<br />\n' + messages.join('<br />\n'));
						// 改寫於可寫入處。e.g., 'Wikipedia:Sandbox'
						this.page('User:' + this.token.lgname).edit(messages.join('\n'), options);
					}
				});
			} else {
				library_namespace.log('\nlog:<br />\n' + messages.join('<br />\n'));
			}

			// config.callback()
			// 只有在成功時，才會繼續執行。
			if (typeof config.after === 'function')
				this.run(config.after);
		});
	}, {
		multi : true
	});
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
	// 跳過無改變的。
	// nochange : false,
	error : true,
	succeed : true
};


//--------------------------------------------------------------------------------------------- //
// 以下皆泛用，無須 instance。

/**
 * 實際執行 query 操作，直接 call API 之核心函數。
 * 
 * @param {String|Array}action
 *            {String}action or [ {String}api URL, {String}action, {Object}other
 *            parameters ]
 * @param {Function}callback
 *            回調函數。 callback(response data)
 * @param {Object}[post_data]
 *            data when need using POST method
 */
wiki_API.query = function(action, callback, post_data) {
	// 處理 action
	library_namespace.debug('action: ' + action, 2, 'wiki_API.query');
	if (typeof action === 'string')
		action = [ , action ];
	else if (!Array.isArray(action))
		library_namespace.err('wiki_API.query: Invalid action: [' + action + ']');
	library_namespace.debug('api URL: (' + (typeof action[0]) + ') [' + action[0] + '] → [' + api_URL(action[0]) + ']', 3, 'wiki_API.query');
	action[0] = api_URL(action[0]);

	// 檢測是否間隔過短。
	var to_wait = Date.now() - wiki_API.query.last[action[0]];
	// TODO: 伺服器負載過重的時候，使用 exponential backoff 進行延遲。
	if (to_wait < wiki_API.query.lag) {
		to_wait = wiki_API.query.lag - to_wait;
		library_namespace.debug('Waiting ' + to_wait + ' ms..', 2, 'wiki_API.query');
		setTimeout(function() {
			wiki_API.query(action, callback, post_data);
		}, to_wait);
		return;
	}
	wiki_API.query.last[action[0]] = Date.now();

	// https://en.wikipedia.org/w/api.php?action=help&modules=query
	if (!/^[a-z]+=/.test(action[1]))
		action[1] = 'action=' + action[1];
	// https://www.mediawiki.org/wiki/API:Data_formats
	// 因不在 white-list 中，無法使用 CORS。
	action[0] += '?' + action[1];
	// [ {String}api URL, {String}action, {Object}other parameters ]
	// →
	// [ {String}URL, {Object}other parameters ]
	action = library_namespace.is_Object(action[2]) ? [ action[0], action[2] ]
	//
	: [ action[2] ? action[0] + action[2] : action[0], library_namespace.null_Object() ];
	if (!action[1].format)
		// 加上 "&utf8=1" 可能會導致把某些 link 中 URL 編碼也給 unescape 的情況！
		action[0] = get_URL.add_param(action[0], 'format=json&utf8=1');

	// 開始處理。
	if (!post_data && wiki_API.query.allow_JSONP) {
		library_namespace.debug('採用 JSONP callback 的方法。須注意：若有 error，將不會執行 callback！', 2, 'wiki_API.query');
		library_namespace.debug('callback : (' + (typeof callback) + ') [' + callback + ']', 3, 'wiki_API.query');
		get_URL(action, {
			callback : callback
		});
	} else
		get_URL(action, function(XMLHttp) {
			var response = XMLHttp.responseText;
			library_namespace.debug('response: '
				+ (library_namespace.is_node ? '\n' + response : response.replace(/</g, '&lt;')), 3, 'wiki_API.query');

			// "<\": for Eclipse JSDoc.
			if (/<\html[\s>]/.test(response.slice(0, 40))) {
				response = response.between('source-javascript', '</pre>').between('>')
				// 去掉所有 HTML tag。
				.replace(/<[^>]+>/g, '');

				// '&#123;' : (")
				// 可能會導致把某些 link 中 URL 編碼也給 unescape 的情況?
				if (response.includes('&#'))
					response = library_namespace.HTML_to_Unicode(response);
			}

			// library_namespace.log(response);
			// library_namespace.log(library_namespace.HTML_to_Unicode(response));
			if (response)
				try {
					response = library_namespace.parse_JSON(response);
				} catch (e) {
					library_namespace.err('wiki_API.query: Invalid content: [' + response + ']');
					// exit!
					return;
				}

			// response = XMLHttp.responseXML;
			if (library_namespace.is_debug()
				// .show_value() @ interact.DOM, application.debug
				&& library_namespace.show_value)
				library_namespace.show_value(response);
			if (typeof callback === 'function')
				callback(response);
		}, '', post_data);
};

/**
 * 最大延遲參數。<br />
 * default: 使用5秒的最大延遲參數。
 * 
 * @type {Number}
 * 
 * @see https://www.mediawiki.org/wiki/Manual:Maxlag_parameter
 */
wiki_API.query.lag = 5000;

/**
 * 對於可以不用 XMLHttp 的，直接採 JSONP callback 法。
 * 
 * @type {Boolean}
 */
wiki_API.query.allow_JSONP = library_namespace.is_WWW(true);

/**
 * URL last queried.<br />
 * wiki_API.query.last[URL] = {Date}last queried date
 * 
 * @type {Object}
 */
wiki_API.query.last = library_namespace.null_Object();

/**
 * 取得 page_data 之 title parameter。<br />
 * e.g., {pageid:8,title:'abc'} → 'pageid=8'<br />
 * e.g., {title:'abc'} → 'title=abc'<br />
 * e.g., 'abc' → 'title=abc'<br />
 * 
 * @param {Object}page_data
 *            page data got from wiki API
 * @param {Boolean}[multi]
 *            is multi-pages
 */
wiki_API.query.title_param = function(page_data, multi) {
	var pageid;
	if (Array.isArray(page_data)) {
		pageid = [];
		// 確認所有 page_data 皆有 pageid 屬性。
		if (page_data.every(function(page) {
			// {Number}page.pageid
			if (page = page && page.pageid)
				pageid.push(page);
			return page;
		})) {
			// auto detect
			if (multi === undefined)
				multi = pageid.length > 1;
			pageid = pageid.join('|');
		} else {
			if (library_namespace.is_Object(page_data)) {
				library_namespace.warn('wiki_API.query.title_param: 看似有些非正規之頁面資料。');
				library_namespace.info('wiki_API.query.title_param: 將採用 title 為主要查詢方法。');
			}
			pageid = [];
			page_data.forEach(function(page) {
				// {String}title or {title:'title'}
				pageid.push((typeof page === 'object' ? page.title : page) || '');
			});
			// auto detect
			if (multi === undefined)
				multi = pageid.length > 1;
			page_data = pageid.join('|');
			library_namespace.debug(page_data, 2, 'wiki_API.query.title_param');
			pageid = undefined;
		}

	} else if (library_namespace.is_Object(page_data))
		if (page_data.pageid)
			// 有 pageid 則使用之，以加速 search。
			pageid = page_data.pageid;
		else
			page_data = page_data.title;
	else if (typeof page_data === 'number'
	// {Number}pageid should > 0.
	// pageid 0 回傳格式不同於 > 0。
	// https://en.wikipedia.org/w/api.php?action=query&prop=revisions&pageids=0
	&& page_data > 0 && page_data === page_data | 0)
		pageid = page_data;
	else if (!page_data) {
		library_namespace.err('wiki_API.query.title_param: Invalid title: [' + page_data + ']');
		//console.warn(page_data);
	}

	multi = multi ? 's=' : '=';

	return pageid === undefined ? 'title' + multi + encodeURIComponent(page_data)
	//
	: 'pageid' + multi + pageid;
};

/**
 * get id of page
 * 
 * @param {Object}page_data
 *            page data got from wiki API
 * @param {Boolean}[title_only]
 *            get title only
 */
wiki_API.query.id_of_page = function(page_data, title_only) {
	if (Array.isArray(page_data))
		return page_data.map(function(page) {
			wiki_API.query.id_of_page(page, title_only);
		});
	if (library_namespace.is_Object(page_data))
		// 有 pageid 則使用之，以加速。
		return !title_only && page_data.pageid || page_data.title;

	if (!page_data)
		library_namespace.err('wiki_API.query.id_of_page: Invalid title: [' + page_data + ']');
	return page_data;
};


// TODO
function normalize_title_parameter(title, options) {
	// 處理 [ {String}API_URL, {String}title ]
	if (!Array.isArray(title)
	// 為了預防輸入的是問題頁面。
	|| title.length !== 2 || typeof title[0] === 'object')
		title = [ , title ];
	title[1] = wiki_API.query.title_param(title[1], true);

	if (options && options.redirects)
		title[1] += '&redirects=1';

	return title;
}


//---------------------------------------------------------------------//


/**
 * 讀取頁面內容。可一次處理多個標題。
 *
 * @example <code>

CeL.wiki.page('道', function(p) {
	CeL.show_value(p);
});

 </code>
 * @param {String|Array}title
 *            title or [ {String}API_URL, {String}title ]
 * @param {Function}callback
 *            回調函數。 callback(page_data) { page_data.title; var content = CeL.wiki.content_of(page_data); }
 * @param {Object}[options]
 *            附加參數/設定選擇性/特殊功能與選項
 *
 * @see https://en.wikipedia.org/w/api.php?action=help&modules=query%2Brevisions
 */
wiki_API.page = function(title, callback, options) {
	// 處理 [ {String}API_URL, {String}title ]
	if (!Array.isArray(title)
	// 為了預防輸入的是問題頁面。
	|| title.length !== 2 || typeof title[0] === 'object')
		title = [ , title ];
	title[1] = wiki_API.query.title_param(title[1], true);

	// 處理 limit。單一頁面才能取得多 revisions。多頁面(<=50)只能取得單一 revision。
	// https://en.wikipedia.org/w/api.php?action=help&modules=query
	// titles/pageids: Maximum number of values is 50 (500 for bots).
	if (options && ('rvlimit' in options)) {
		if (options.rvlimit > 0 || options.rvlimit === 'max')
			title[1] += '&rvlimit=' + options.rvlimit;
	} else if (!title[1].includes('|')
	//
	&& !title[1].includes(encodeURIComponent('|')))
		// default: 僅取得單一 revision。
		title[1] += '&rvlimit=1';

	if (options && options.redirects)
		title[1] += '&redirects=1';

	title[1] = 'query&prop=revisions&rvprop=content|timestamp&'
	// &rvexpandtemplates=1
	// prop=info|revisions
	+ title[1];
	if (!title[0])
		title = title[1];

	// library_namespace.debug('get url token: ' + title, 0, 'wiki_API.page');

	wiki_API.query(title, typeof callback === 'function'
	//
	&& function(data) {
		if (library_namespace.is_debug(2)
			// .show_value() @ interact.DOM, application.debug
			&& library_namespace.show_value)
			library_namespace.show_value(data, 'wiki_API.page: data');

		var error = data && data.error;
		// 檢查伺服器回應是否有錯誤資訊。
		if (error) {
			library_namespace.err('wiki_API.page: [' + error.code + '] ' + error.info);
			// e.g., Too many values supplied for parameter 'pageids': the limit is 50
			if (data.warnings && data.warnings.query && data.warnings.query['*'])
				library_namespace.warn(data.warnings.query['*']);
			return callback();

		} else if (!data || !data.query || !data.query.pages) {
			library_namespace.warn('wiki_API.page: Unknown response: [' + data + ']');
			if (library_namespace.is_debug()
				// .show_value() @ interact.DOM, application.debug
				&& library_namespace.show_value)
				library_namespace.show_value(data);
			callback();
			return;
		}

		data = data.query.pages;
		var pages = [];
		for ( var pageid in data) {
			var page = data[pageid];
			pages.push(page);
			if (!get_page_content.has_content(page)) {
				library_namespace.warn('wiki_API.page: '
				// 頁面不存在。Page does not exist. Deleted?
				+ ('missing' in page ? 'Not exists' : 'No content') + ': [' + page.title + ']');
			}
		}

		// options.multi: 即使只取得單頁面，依舊回傳 Array。
		if (!options || !options.multi)
			if (pages.length <= 1) {
				pages = pages[0];
				library_namespace.debug('只取得單頁面 [[' + pages.title + ']]，將回傳此頁面內容，而非 Array。', 2, 'wiki_API.page');
			} else
				library_namespace.debug('Get ' + pages.length
				//
				+ ' page(s)! The pages will all passed to callback as Array!', 2, 'wiki_API.page');

		// page 之 structure 將按照 wiki 本身之 return！
		// page_data = {pageid,ns,title,revisions:[{timestamp,'*'}]}
		callback(pages);
	});
};


//---------------------------------------------------------------------//

/*

// 'Language'
CeL.wiki.langlinks('語言',function(p){CeL.show_value(p);},'en');

// '語言'
CeL.wiki.langlinks(['en','Language'],function(p){if(p)CeL.show_value(p);},'zh');

// TODO?
// return 'title' or {langs:['',''], lang:'title'}
CeL.wiki.langlinks('語言',function(p){if(p)CeL.show_value(p);})
==
CeL.wiki.langlinks('語言',function(p){if(p)CeL.show_value(p);},10)
== {langs:['',''], lang:'title'}

未指定 page，表示已完成。

*/

/**
 * 取得 title 在其他語系 (to_lang) 之標題。可一次處理多個標題。
 * 
 * @param {String|Array}title
 *            the page title to search continue information
 * @param {Function|Object}callback
 *            回調函數 or options。
 * @param {String}to_lang
 * 所欲求語言
 * @param {Object}[options]
 *            附加參數/設定選擇性/特殊功能與選項
 */
wiki_API.langlinks = function(title, callback, to_lang, options) {
	var from_lang;
	if (Array.isArray(title) && title.length === 2
			&& (!title[0] || typeof title[0] === 'string'))
		from_lang = title[0], title = title[1];
	title = 'query&prop=langlinks&' + wiki_API.query.title_param(title, true);
	if (to_lang)
		title += (to_lang > 0 || to_lang === 'max' ? '&lllimit=' : '&lllang=')
				+ to_lang;
	if (options.limit > 0 || options.limit === 'max')
		title += '&lllimit=' + options.limit;
	// console.log('ll title:' + title);
	if (from_lang)
		// llinlanguagecode 無效。
		title = [ from_lang, title ];

	wiki_API.query(title, typeof callback === 'function'
	//
	&& function(data) {
		if (!data || !data.query || !data.query.pages) {
			/**
			 * From version 1.25 onwards, the API returns a batchcomplete
			 * element to indicate that all data for the current "batch" of
			 * pages has been returned.
			 * 
			 * @see https://www.mediawiki.org/wiki/API:Query#batchcomplete
			 */
			if (data && ('batchcomplete' in data)) {
				// assert: data.batchcomplete === ''
				if (false)
					library_namespace.info(
					//
					'wiki_API.langlinks: [' + title + ']: Done.');
			} else {
				library_namespace.warn(
				//
				'wiki_API.langlinks: Unknown response: [' + data + ']');
				// console.log(data);
			}
			// console.warn(data);
			if (library_namespace.is_debug()
			// .show_value() @ interact.DOM, application.debug
			&& library_namespace.show_value)
				library_namespace.show_value(data);
			callback();
			return;
		}

		data = data.query.pages;
		var pages = [];
		for ( var pageid in data)
			pages.push(data[pageid]);
		if (pages.length !== 1 || (options && options.multi)) {
			if (library_namespace.is_debug())
				library_namespace.info(
				//
				'wiki_API.langlinks: Get ' + pages.length
				//
				+ ' page(s)! We will pass all pages to callback!');
			// page 之 structure 按照 wiki 本身之 return！
			// page = {pageid,ns,title,revisions:[{langlinks,'*'}]}
			callback(pages);
		} else {
			if (library_namespace.is_debug() && !pages[0].langlinks) {
				library_namespace.warn('wiki_API.langlinks: '
				//
				+ ('pageid' in pages[0] ? '無' + (to_lang && isNaN(to_lang)
				//
				? '所欲求語言[' + to_lang + ']之' : '其他語言') + '連結' : '不存在此頁面')
				//
				+ ': [' + pages[0].title + ']');
				// library_namespace.show_value(pages);
			}
			pages = pages[0].langlinks;
			callback(pages ? to_lang && isNaN(to_lang) ? pages[0]['*']
			//
			: wiki_API.langlinks.parse(pages) : pages);
		}
	});
};

wiki_API.langlinks.parse = function(langlinks, to_lang) {
	if (langlinks && Array.isArray(langlinks.langlinks))
		langlinks = langlinks.langlinks;

	if (!Array.isArray(langlinks)) {
		if (library_namespace.is_debug()) {
			library_namespace.warn(
			//
			'wiki_API.langlinks.parse: No langlinks exists?'
					+ (langlinks && langlinks.title ? ' [[' + langlinks.title
							+ ']]' : ''));
			if (library_namespace.is_debug(2)
			// .show_value() @ interact.DOM, application.debug
			&& library_namespace.show_value)
				library_namespace.show_value(langlinks, 'langlinks.parse');
		}
		return;
	}

	var langs;
	if (to_lang) {
		langlinks.some(function(lang) {
			if (to_lang == lang.lang) {
				langs = lang['*'];
				return true;
			}
		});

	} else {
		langs = library_namespace.null_Object();
		langs.langs = [];
		langlinks.forEach(function(lang) {
			langs[lang.lang] = lang['*'];
			langs.langs.push(lang.lang);
		});
	}
	return langs;
};


//---------------------------------------------------------------------//

/**
 * 自 title 頁面取得後續檢索用索引值 (continuation data)。 e.g., 'continue'
 *
 * @param {String|Array}title
 *            the page title to search continue information
 * @param {Function|Object}callback
 *            回調函數 or options。 callback({Object} continue data);
 */
function get_continue(title, callback) {
	var options;
	if (library_namespace.is_Object(callback))
		callback = (options = callback).callback;
	else
		// 前置處理。
		options = library_namespace.null_Object();

	wiki_API.page(title, function(page_data) {
		var matched, done, content = get_page_content(page_data),
		// {RegExp}[options.pattern]:
		// content.match(pattern) === [ , '{type:"continue"}' ]
		pattern = options.pattern,
		// {Object} continue data
		data = library_namespace.null_Object();

		if (!pattern)
			pattern = new RegExp(library_namespace.to_RegExp_pattern(
			//
			(options.continue_key || wiki_API.prototype.continue_key).trim())
					+ ' *:? *({[^{}]{0,80}})', 'g');
		library_namespace.debug('pattern: ' + pattern, 2, 'get_continue');

		while (matched = pattern.exec(content)) {
			library_namespace.debug('continue data: [' + matched[1] + ']', 2, 'get_continue');
			if (!(done = /^{\s*}$/.test(matched[1])))
				data = Object.assign(data,
				//
				library_namespace.parse_JSON(matched[1]));
		}

		// options.get_all: get all continue data.
		if (!options.get_all)
			if (done) {
				library_namespace.debug('最後一次之後續檢索用索引值為空，可能已完成？', 1, 'get_continue');
				data = null;
			} else {
				// {String|Boolean}[options.type]: what type to search.
				matched = options.type;
				if (matched in get_list.type)
					matched = get_list.type[matched] + 'continue';

				content = data;
				data = library_namespace.null_Object();
				if (matched in content)
					data[matched] = content[matched];
			}

		// callback({Object} continue data);
		callback(data || library_namespace.null_Object());
	}, options);
}


//---------------------------------------------------------------------//

/**
 * get list<br />
 * 注意:可能會改變 options!
 *
 * @param {String}type
 *            one of get_list.type
 * @param {String}title
 *            頁面標題。
 * @param {Function}callback
 *            回調函數。 callback(title, titles, pages)
 * @param {Number|String}namespace
 *            one of get_namespace.hash
 */
function get_list(type, title, callback, namespace) {
	library_namespace.debug(type + '[[' + title + ']], callback: ' + callback,
			3);
	var options,
	// 前置字首
	prefix = get_list.type[type], parameter;
	if (Array.isArray(prefix)) {
		parameter = prefix[1];
		prefix = prefix[0];
	} else
		parameter = get_list.default_parameter;
	if (library_namespace.is_Object(namespace))
		// 當作 options。
		namespace = (options = namespace).namespace;
	else
		// 前置處理。
		options = library_namespace.null_Object();

	if (isNaN(namespace = get_namespace(namespace)))
		delete options.namespace;
	else
		options.namespace = namespace;

	// 處理 [ {String}API_URL, {String}title ]
	if (!Array.isArray(title))
		title = [ , title ];

	var continue_from = prefix + 'continue',
	// {wiki_API}options.continue_wiki: 藉以取得後續檢索用索引值之 {wiki_API}。
	// 若未設定 .next_mark，才會自 options.get_continue 取得後續檢索用索引值。
	continue_wiki = options.continue_wiki;
	if (continue_wiki)
		if(continue_wiki.constructor === wiki_API) {
			library_namespace.debug('直接傳入了 {wiki_API}；可延續使用上次的後續檢索用索引值，避免重複 loading page。', 4, 'get_list');
			// usage: options: { continue_wiki : wiki, get_continue : log_to }
			// 注意:這裡會改變 options!
			// assert: {Object}continue_wiki.next_mark
			if (continue_from in continue_wiki.next_mark) {
				// {String}continue_wiki.next_mark[continue_from]: 後續檢索用索引值。
				options[continue_from] = continue_wiki.next_mark[continue_from];
				// 經由,經過,通過來源
				library_namespace.info('get_list: continue from [' + options[continue_from] + '] via {wiki_API}');
				// 刪掉標記，避免無窮迴圈。
				delete options.get_continue;
			} else {
				// 設定好 options.get_continue，以進一步從 page 取得後續檢索用索引值。
				if (typeof options.get_continue === 'string')
					// 採用 continue_wiki 之 domain。
					options.get_continue = [ continue_wiki.API_URL, options.get_continue ];
			}
		} else {
			library_namespace.debug('傳入的不是 {wiki_API}。 ', 4, 'get_list');
			continue_wiki = undefined;
		}

	// options.get_continue: 用以取用後續檢索用索引值之 title。
	// {String}title || {Array}[ API_URL, title ]
	if (options.get_continue) {
		// 在多人共同編輯的情況下，才需要每次重新 load page。
		get_continue(Array.isArray(options.get_continue) ? options.get_continue : [ title[0], options.get_continue ], {
			type : type,
			// options.wiki: 作業中之 {wiki_API}
			continue_key : (continue_wiki || options.wiki).continue_key,
			callback : function(continuation_data) {
				if (continuation_data = continuation_data[continue_from]) {
					library_namespace.info('get_list: continue from [' + continuation_data + '] via page');
					// 注意:這裡會改變 options!
					// 刪掉標記，避免無窮迴圈。
					delete options.get_continue;
					// 設定/紀錄後續檢索用索引值，避免無窮迴圈。
					if (continue_wiki)
						continue_wiki.next_mark[continue_from] = continuation_data;
					else
						options[continue_from] = continuation_data;
					get_list(type, title, callback, options);
				} else {
					//delete options[continue_from];
					library_namespace.debug('Nothing to continue!', 1, 'get_list');
					if (typeof callback === 'function')
						callback();
				}
			}
		});
		return;
	}

	if (continue_from = options[continue_from]) {
		library_namespace.debug('[[' + title[1] + ']]: start from '
				+ continue_from, 2, 'get_list');
	}

	title[1] = 'query&' + parameter + '=' + type + '&'
	//
	+ (parameter === get_list.default_parameter ? prefix : '')
	//
	+ wiki_API.query.title_param(title[1])
	// 數目限制。No more than 500 (5,000 for bots) allowed.
	// Type: integer or max
	// https://en.wikipedia.org/w/api.php?action=help&modules=query%2Brevisions
	+ (options.limit > 0 || options.limit === 'max' ? '&' + prefix + 'limit=' + options.limit : '')
	// next start from here.
	+ (continue_from ?
	//
	'&' + prefix + 'continue=' + continue_from : '')
	//
	+ ('namespace' in options
	//
	? '&' + prefix + 'namespace=' + options.namespace : '');
	if (!title[0])
		title = title[1];
	// console.log('get_list: title: ' + title);

	if (typeof callback !== 'function') {
		library_namespace.err('callback is NOT function! callback: ['
				+ callback + ']');
		library_namespace.debug('可能是想要當作 wiki instance，卻未設定好，直接呼叫了 '
				+ library_namespace.Class + '.wiki？\ne.g., 想要 var wiki = '
				+ library_namespace.Class
				+ '.wiki(user, password) 卻呼叫了 var wiki = '
				+ library_namespace.Class + '.wiki？', 3);
		return;
	}

	wiki_API.query(title,
	// treat as {Function}callback or {Object}wiki_API.work config.
	function(data) {
		function add_page(page) {
			titles.push(page.title);
			pages.push(page);
		}

		if (library_namespace.is_debug(2)
		// .show_value() @ interact.DOM, application.debug
		&& library_namespace.show_value)
			library_namespace.show_value(data, 'get_list:' + type);

		var titles = [], pages = [],
		// 取得列表後，設定/紀錄新的後續檢索用索引值。
		// https://www.mediawiki.org/wiki/API:Query#Backwards_compatibility_of_continue
		// {Object}next_index: 後續檢索用索引值。
		next_index = data['continue'] || data['query-continue'];
		if (library_namespace.is_Object(next_index)) {
			pages.next_index = next_index;
			library_namespace.debug('因為 continue_wiki 可能與作業中之 {wiki_API} 不同，因此需要在本函數 function get_list() 中設定好。', 4, 'get_list');
			//console.log(continue_wiki);
			if (continue_wiki
				// options.wiki: 作業中之 {wiki_API}
				|| (continue_wiki = options.wiki)) {
				//console.log(continue_wiki.next_mark);
				//console.log(next_index);
				//console.log(continue_wiki);
				if ('query-continue' in data)
					// style of 2014 CE. 例如 {backlinks:{blcontinue:'[0|12]'}}。
					for ( var type_index in next_index)
						Object.assign(continue_wiki.next_mark, next_index[type_index]);
				else
					// nowadays. e.g., {continue: { blcontinue: '0|123', continue: '-||' }}
					Object.assign(continue_wiki.next_mark, next_index);
				library_namespace.debug('next index of ' + type + ': ' + continue_wiki.show_next());
			}
			if (library_namespace.is_debug(2)
			// .show_value() @ interact.DOM, application.debug
			&& library_namespace.show_value)
				library_namespace.show_value(next_index,
						'get_list:get the continue value');
		}
		// 紀錄清單類型。
		// assert: overwrite 之屬性不應該是原先已經存在之屬性。
		pages.list_type = type;
		if (get_page_content.is_page_data(title))
			title = title.title;

		if (!data || !data.query) {
			library_namespace.err('get_list: Unknown response: [' + data + ']');

		} else if (data.query[type]) {
			// 一般情況。
			if (Array.isArray(data = data.query[type]))
				data.forEach(add_page);

			library_namespace.debug('[' + title + ']: ' + titles.length
					+ ' page(s)', 2, 'get_list');
			callback(title, titles, pages);

		} else {
			//console.log(data.query);
			data = data.query.pages;
			for ( var pageid in data) {
				if (pages.length)
					library_namespace.warn('get_list: More than 1 page got!');
				else {
					var page = data[pageid];
					if (Array.isArray(page[type]))
						page[type].forEach(add_page);

					library_namespace.debug('[' + page.title + ']: '
							+ titles.length + ' page(s)', 1, 'get_list');
					callback(page.title, titles, pages);
				}
				return;
			}
			library_namespace.err('get_list: No page got!');
		}
	});
}


// const: 基本上與程式碼設計合一，僅表示名義，不可更改。(== 'list')
get_list.default_parameter = 'list';

// [[Special:Whatlinkshere]]
// 使用說明:連入頁面
// https://zh.wikipedia.org/wiki/Help:%E9%93%BE%E5%85%A5%E9%A1%B5%E9%9D%A2
get_list.type = {

	// 'type name' : 'prefix' (parameter : 'list')

	// 取得連結到 [[title]] 的頁面。
	// e.g., [[name]], [[:Template:name]].
	// https://www.mediawiki.org/wiki/API:Backlinks
	backlinks : 'bl',

	// 取得所有嵌入包含 title 的頁面。 (transclusion, inclusion)
	// e.g., {{Template name}}, {{/title}}.
	// 設定 title 'Template:tl' 可取得使用指定 Template 的頁面。
	// https://en.wikipedia.org/wiki/Wikipedia:Transclusion
	// https://www.mediawiki.org/wiki/API:Embeddedin
	embeddedin : 'ei',

	// 取得所有使用 file 的頁面。
	// e.g., [[File:title.jpg]].
	// https://www.mediawiki.org/wiki/API:Imageusage
	imageusage : 'iu',

	// 'type name' : [ 'prefix', 'parameter' ]
	// ** 可一次處理多個標題，但可能較耗資源、較慢。

	// linkshere: 取得連結到 [[title]] 的頁面。
	linkshere : ['lh', 'prop' ],

	// 取得所有使用 title (e.g., [[File:title.jpg]]) 的頁面。
	// 基本上同 imageusage。
	fileusage : ['fu', 'prop' ]
};


(function() {
	// 登記 methods。
	var methods = wiki_API.prototype.next.methods;

	for (var name in get_list.type) {
		methods.push(name);
		wiki_API[name] = get_list.bind(null, name);
	}

	// add method to wiki_API.prototype
	// setup other wiki_API.prototype methods.
	methods.forEach(function(method) {
		library_namespace.debug('add action to wiki_API.prototype: ' + method, 2);
		wiki_API.prototype[method] = function() {
			// assert: 不可改動 method @ IE!
			var args = [ method ];
			Array.prototype.push.apply(args, arguments);
			library_namespace.debug('add action: ' + args.join('<br />\n'), 3, 'wiki_API.prototype.' + method);
			this.actions.push(args);
			if (!this.running)
				this.next();
			return this;
		};
	});
})();


//---------------------------------------------------------------------//

/**
 * 取得完整 list 後才作業。<br />
 * 注意:可能會改變 options!
 * 
 * @param {String}target
 *            頁面標題。
 * @param {Function}callback
 *            回調函數。 callback(pages, target, options)
 * @param {Object}[options]
 *            附加參數/設定選擇性/特殊功能與選項
 */
wiki_API.list = function(target, callback, options) {
	// 前置處理。
	if (!library_namespace.is_Object(options))
		options = library_namespace.null_Object();

	if (!options.initialized) {
		if (!options.wiki)
			options.wiki = new wiki_API;
		if (!options.type)
			options.type = wiki_API.list.default_type;
		options.initialized = true;
	}

	options.wiki[options.type](target, function(title, titles, pages) {
		library_namespace.debug('Get ' + pages.length + ' pages', 2, 'wiki_API.list');
		if (typeof options.callback === 'function')
			options.callback(title, titles, pages);
		if (options.pages)
			Array.prototype.push.apply(options.pages, pages);
		else
			options.pages = pages;
		if (pages.next_index)
			setTimeout(function() {
				wiki_API.list(target, callback, options);
			}, 0);
		else
			// run callback after all list got.
			callback(options.pages, target, options);
	}, {
		continue_wiki : options.wiki,
		limit : options.limit || 'max'
	});
};


wiki_API.list.default_type = 'embeddedin';

//---------------------------------------------------------------------//

// 登入用。
wiki_API.login = function(name, password, options) {
	function _next() {
		if (typeof callback === 'function')
			callback(session.token.lgname);
		library_namespace.debug('已登入 [' + session.token.lgname + ']。自動執行 .next()，處理餘下的工作。', 1, 'wiki_API.login');
		// popup 'login'.
		session.actions.shift();
		session.next();
	}

	function _done(data) {
		// 在 mass edit 時會 lose token (badtoken)，需要保存 password。
		if (!session.preserve_password)
			// 捨棄 password。
			delete session.token.lgpassword;
		if (data && (data = data.login))
			if (data.result === 'NeedToken')
				library_namespace.err('wiki_API.login: login [' + session.token.lgname + '] failed!');
			else
				wiki_API.login.copy_keys.forEach(function(key) {
					if (data[key])
						session.token[key] = data[key];
				});
		if (session.token.csrftoken)
			_next();
		else {
			library_namespace.debug('Try to get the csrftoken ...', 1, 'wiki_API.login');
			wiki_API.query([ session.API_URL, 'query&meta=tokens' ], function(data) {
				if (data && data.query && data.query.tokens) {
					session.token.csrftoken = data.query.tokens.csrftoken;
					library_namespace.debug('csrftoken: ' + session.token.csrftoken
					//
					+ (session.token.csrftoken === '+\\' ? ' (login as anonymous!)' : ''), 1, 'wiki_API.login');
				} else {
					library_namespace.err('wiki_API.login: Unknown response: ['
					//
					+ (data && data.warnings && data.warnings.tokens && data.warnings.tokens['*'] || data) + ']');
					if (library_namespace.is_debug()
						// .show_value() @ interact.DOM, application.debug
						&& library_namespace.show_value)
						library_namespace.show_value(data);
				}
				_next();
			},
			// Tokens may not be obtained when using a callback
			library_namespace.null_Object());
		}
	}

	var action = 'assert=user', callback, session;
	if (library_namespace.is_Object(options)) {
		session = options.session;
		callback = options.callback;
	} else {
		if (typeof options === 'function'
		// treat as API_URL
		|| typeof options === 'string')
			callback = options;
		// 前置處理。
		options = library_namespace.null_Object();
	}

	if (!session)
		// 初始化 session。這裡 callback 當作 API_URL。
		session = new wiki_API(name, password, callback);
	if (!('login_mark' in options) || options.login_mark) {
		// hack: 這表示正 log in 中，當 login 後，會自動執行 .next()，處理餘下的工作。
		// @see wiki_API.prototype.next
		if (options.login_mark)
			// 將 'login' 置於最前頭。
			session.actions.unshift([ 'login' ]);
		else
			// default: 依順序將 'login' 置於最末端。
			session.actions.push([ 'login' ]);
	}
	if (session.API_URL) {
		library_namespace.debug('API URL: [' + session.API_URL + ']。', 3, 'wiki_API.login');
		action = [ session.API_URL, action ];
	}
	library_namespace.debug('action: [' + action + ']。', 3, 'wiki_API.login');

	library_namespace.debug('準備登入 [' + name + ']。', 1, 'wiki_API.login');
	wiki_API.query(action, function(data) {
		// 確認尚未登入，才作登入動作。
		if (data === '') {
			// 您已登入。
			library_namespace.debug('You are already logged in.', 1, 'wiki_API.login');
			_done();
			return;
		}

		wiki_API.query([ session.API_URL, 'login' ], function(data) {
			if (data && data.login && data.login.result === 'NeedToken') {
				session.token.lgtoken = data.login.token;
				wiki_API.query([ session.API_URL, 'login' ], _done, session.token);
			} else
				library_namespace.err(data);
		}, session.token);
	});

	return session;
};

wiki_API.login.copy_keys = 'lguserid,cookieprefix,sessionid'.split(',');


//---------------------------------------------------------------------//

/**
 * check if need to stop / 檢查是否需要緊急停止作業 (Emergency shutoff-compliant).
 * 
 * 此功能之工作機制/原理：<br />
 * 在 .edit() 編輯之前，先檢查是否有人在緊急停止頁面留言要求 stop。<br />
 * 只要在緊急停止頁面有指定的章節標題、或任何章節，就當作有人留言要 stop，並放棄編輯。
 * 
 * TODO:<br />
 * https://zh.wikipedia.org/w/api.php?action=query&meta=userinfo&uiprop=hasmsg
 * 
 * @param {Function}callback
 *            回調函數。 callback({Boolean}need stop)
 * @param {Object}[options]
 *            附加參數/設定選擇性/特殊功能與選項
 * 
 * @see https://www.mediawiki.org/wiki/Manual:Parameters_to_index.php#Edit_and_submit
 *      https://www.mediawiki.org/wiki/Help:Magic_words#URL_encoded_page_names
 *      https://www.mediawiki.org/wiki/Help:Links
 *      https://zh.wikipedia.org/wiki/User:Cewbot/Stop
 */
wiki_API.check_stop = function(callback, options) {
	// 前置處理。
	if (!library_namespace.is_Object(options))
		if (typeof options === 'string')
			options = {
				title : options
			};
		else
			options = library_namespace.null_Object();

	/**
	 * 緊急停止頁面標題 check title:<br />
	 * 只檢查此緊急停止頁面。
	 * 
	 * @type {String}
	 */
	var title = options.title;
	if (typeof title === 'function')
		title = title(options.token);
	if (!title)
		title = wiki_API.check_stop.title(options.token);

	library_namespace.debug('檢查緊急停止頁面 [[' + title + ']]', 1,
			'wiki_API.check_stop');

	wiki_API.page([ this.API_URL, title ], function(page_data) {
		var content = get_page_content(page_data),
		// default: NOT stopped
		stopped = false, PATTERN;

		if (typeof options.checker === 'function') {
			// 以 options.checker 的回傳來設定是否stopped。
			stopped = options.checker(content);
			if (stopped)
				library_namespace.warn(
				//
				'wiki_API.check_stop: 已設定停止編輯作業！');
			content = null;
		} else {
			// 指定 pattern
			PATTERN = options.pattern
			// options.section: 指定的緊急停止章節標題, section title to check
			|| options.section
			/**
			 * <code>
			 * (new RegExp('\n==(.*?)' + '20150503' + '\\s*==\n')).test('\n== 停止作業:20150503 ==\n') === true
			 * </code>
			 */
			&& new RegExp('\n==(.*?)' + options.section + '\\s*==\n');
		}

		if (content) {
			if (!library_namespace.is_RegExp(PATTERN))
				PATTERN = wiki_API.check_stop.pattern;
			stopped = PATTERN.test(content, page_data);
			if (stopped)
				library_namespace.warn('緊急停止頁面[[' + title + ']]有留言要停止編輯作業！');
		}

		callback(stopped);
	});
};

/**
 * default page title to check:<br />
 * [[{{TALKSPACE}}:{{ROOTPAGENAME}}/Stop]]
 * 
 * @param {Object}token
 *            “csrf”令牌。
 * 
 * @returns {String}
 */
wiki_API.check_stop.title = function(token) {
	return 'User_talk:' + token.lgname + '/Stop';
};

/**
 * default check pattern: 任何章節/段落 section<br />
 * default: 只要在緊急停止頁面有任何章節，就當作有人留言要求 stop。
 * 
 * @type {RegExp}
 */
wiki_API.check_stop.pattern = /\n=([^\n]+)=\n/;


//---------------------------------------------------------------------//

/**
 * 編輯頁面。一次處理一個標題。
 *
 * @param {String|Array}title
 *            頁面標題。 {String}title or [ {String}API_URL, {String}title or {Object}page_data ]
 * @param {String|Function}text
 *            頁面內容。 {String}text or {Function}text(page_data)
 * @param {Object}token
 *            “csrf”令牌。
 * @param {Object}[options]
 *            附加參數/設定選擇性/特殊功能與選項
 * @param {Function}callback
 *            回調函數。 callback(title, error, result)
 * @param {String}timestamp
 *            頁面時間戳記。 e.g., '2015-01-02T02:52:29Z'
 */
wiki_API.edit = function(title, text, token, options, callback, timestamp) {
	if (typeof text === 'function') {
		library_namespace.debug('先取得內容再 edit [' + get_page_title(title)
				+ ']。', 1, 'wiki_API.edit');
		return wiki_API.page(title,
				function(page_data) {
					if (wiki_API.edit.denied(page_data, options.bot_id,
							options.action)) {
						library_namespace
								.warn('wiki_API.edit: Denied to edit ['
										+ page_data.title + ']');
						callback(page_data.title, 'denied');
					} else {
						// text(get_page_content(page_data), page_data.title, page_data)
						// 需要同時改變 wiki_API.prototype.next!
						wiki_API.edit(page_data, text(page_data), token, options, callback);
					}
				});
	}

	var action;
	// 基本檢測。
	if (Array.isArray(text) && text[0] === wiki_API.edit.cancel) {
		action = text.slice(1);
		library_namespace.debug('採用個別特殊訊息: ' + action, 2, 'wiki_API.edit');
		// 可以利用 ((return [ CeL.wiki.edit.cancel, 'reason' ];)) 來回傳 reason。
		// ((return [ CeL.wiki.edit.cancel, 'skip' ];)) 來 skip。
		if (action.length === 1)
			action[1] = action[0];
	} else if (text === wiki_API.edit.cancel)
		action = [ '放棄編輯頁面', '放棄編輯頁面' ];
	else if (!text)
		// 內容被清空
		action = [ 'empty', '未設定編輯內容' ];

	if (action) {
		title = get_page_title(title);
		if (action[1] !== 'skip') {
			// 被 skip/pass 的話，連警告都不顯現，當作正常狀況。
			library_namespace.warn('wiki_API.edit: [[' + title + ']]: ' + action[1]);
		} else {
			library_namespace.debug('Skip [[' + title + ']]', 2);
		}
		return callback(title, action[0]);
	}

	action = 'edit';
	// 處理 [ {String}API_URL, {String}title or {Object}page_data ]
	if (Array.isArray(title))
		action = [ title[0], action ], title = title[1];
	if (options && options.write_to) {
		// 設定寫入目標。一般為 debug、test 測試期間用。
		// e.g., write_to:'Wikipedia:沙盒',
		title = options.write_to;
		library_namespace.debug('依 options.write_to 寫入至 [[' + title + ']]', 1,
			'wiki_API.edit');
	}

	// 造出可 modify 的 options。
	if (options)
		library_namespace.debug('#1: ' + Object.keys(options).join(','), 4,
			'wiki_API.edit');
	options = Object.assign({
		text : text
	}, options);
	if (library_namespace.is_Object(title)) {
		wiki_API.edit.set_stamp(options, title);
		if (title.pageid)
			options.pageid = title.pageid;
		else
			options.title = title.title;
	} else {
		options.title = title;
	}
	if (timestamp)
		wiki_API.edit.set_stamp(options, timestamp);
	// the token should be sent as the last parameter.
	options.token = library_namespace.is_Object(token) ? token.csrftoken
			: token;
	library_namespace.debug('#2: ' + Object.keys(options).join(','), 4,
			'wiki_API.edit');

	wiki_API.query(action, function(data) {
		var error = data.error
		// 檢查伺服器回應是否有錯誤資訊。
		? '[' + data.error.code + '] ' + data.error.info : data.edit
				&& data.edit.result !== 'Success'
				&& ('[' + data.edit.result + '] '
				//
				+ (data.edit.info || data.edit.captcha && '必需輸入驗證碼'));
		if (error)
			library_namespace.warn('wiki_API.edit: Error to edit ['
					+ get_page_title(title) + ']: ' + error);
		else if (data.edit && ('nochange' in data.edit))
			// 在極少的情況下，data.edit === undefined。
			library_namespace.info('wiki_API.edit: ['
					+ get_page_title(title) + ']: no change');
		if (typeof callback === 'function')
			callback(get_page_title(title), error, data);
	}, options);
};

/**
 * 放棄編輯頁面用。
 * 
 * @type any
 */
wiki_API.edit.cancel = {
		cancel : '放棄編輯頁面用'
};

/**
 * 處理編輯衝突用。 to detect edit conflicts.
 * 
 * 注意:會改變 options! Warning: will modify options!
 * 
 * 此功能之工作機制/原理：<br />
 * 在 .page() 會取得每個頁面之 page_data.revisions[0].timestamp（各頁面不同）。於
 * .edit() 時將會以從 page_data 取得之 timestamp 作為時間戳記傳入呼叫，當 MediaWiki 系統 (API)
 * 發現有新的時間戳記，會回傳編輯衝突，並放棄編輯此頁面。<br />
 * 詳見 [https://github.com/kanasimi/CeJS/blob/master/application/net/wiki.js
 * wiki_API.edit.set_stamp]。
 * 
 * @param {Object}options
 *            附加參數/設定選擇性/特殊功能與選項
 * @param {String}timestamp
 *            頁面時間戳記。 e.g., '2015-01-02T02:52:29Z'
 * 
 * @returns {Object}options
 * 
 * @see https://www.mediawiki.org/wiki/API:Edit
 */
wiki_API.edit.set_stamp = function(options, timestamp) {
	if (get_page_content.is_page_data(timestamp)
	// 在 .page() 會取得 page_data.revisions[0].timestamp
	&& (timestamp = get_page_content.has_content(timestamp)))
		// 自 page_data 取得 timestamp.
		timestamp = timestamp.timestamp;
	// timestamp = '2000-01-01T00:00:00Z';
	if (timestamp) {
		library_namespace.debug(timestamp, 3, 'wiki_API.edit.set_stamp');
		options.basetimestamp = options.starttimestamp = timestamp;
	}
	return options;
};


// @see https://zh.wikipedia.org/wiki/Template:Bots
wiki_API.edit.get_bot = function(content) {
	// TODO: use template_token(content, 'bots')
	var bots = [], matched, PATTERN = /{{[\s\n]*bots[\s\n]*([\S][\s\S]*?)}}/ig;
	while (matched = PATTERN.exec(content)) {
		library_namespace.debug(matched.join('<br />'), 1, 'wiki_API.edit.get_bot');
		if (matched = matched[1].trim().replace(/(^\|\s*|\s*\|$)/g, '')
				// .split('|')
				)
					bots.push(matched);
	}
	if (0 < bots.length) {
		library_namespace.debug(bots.join('<br />'), 1, 'wiki_API.edit.get_bot');
		return bots;
	}
};

// 遵守[[Template:Bots]]
// 另須考慮{{Personal announcement}}的情況。
wiki_API.edit.denied = function(content, bot_id, action) {
	if (!content || get_page_content.is_page_data(content) && !(content = get_page_content(content)))
		return;

	var bots = wiki_API.edit.get_bot(content), denied;
	if (bots) {
		library_namespace.debug('test ' + bot_id + '/' + action, 3,
				'wiki_API.edit.denied');
		// botlist 以半形逗號作間隔
		bot_id = (bot_id = bot_id && bot_id.toLowerCase()) ?
				new RegExp('(?:^|[\\s,])(?:all|' + bot_id + ')(?:$|[\\s,])', 'i')
				: wiki_API.edit.denied.all;
		if (action)
			// optout 以半形逗號作間隔
			// optout=all
			action = new RegExp('(?:^|[\\s,])(?:all|' + action.toLowerCase()
					+ ')(?:$|[\\s,])');
		bots.forEach(function(data) {
			library_namespace.debug('test [' + data + ']', 1,
				'wiki_API.edit.denied');
			data = data.toLowerCase();

			// 封鎖機器人訪問之 pattern
			var matched, PATTERN;
			if (!denied) {
				PATTERN = /(?:^|\|)[\s\n]*deny[\s\n]*=[\s\n]*([^|]+)/ig;
				while ((matched = PATTERN.exec(data))
						// 一被拒絕即跳出。
						&& !(denied = bot_id.test(matched[1]) && ('Banned: ' + matched[1])))
					;
			}

			// 允許之機器人帳戶列表（以半形逗號作間隔）
			if (!denied) {
				PATTERN = /(?:^|\|)[\s\n]*allow[\s\n]*=[\s\n]*([^|]+)/ig;
				while ((matched = PATTERN.exec(data))
						// 一被拒絕即跳出。
						&& !(denied = !bot_id.test(matched[1])
						// denied messages
						&& ('Not in allowed bots list: [' + matched[1] + ']')))
					;
			}

			// 過濾機器人所發出的通知/提醒
			// 用戶以bots模板封鎖通知
			if (!denied && action) {
				PATTERN = /(?:^|\|)[\s\n]*optout[\s\n]*=[\s\n]*([^|]+)/ig;
				while ((matched = PATTERN.exec(data))
						// 一被拒絕即跳出。
						&& !(denied = action.test(matched[1]) && ('Opt out of ' + matched[1])))
					;
			}

			if (denied)
				library_namespace.warn('wiki_API.edit.denied: Denied for ' + data);
		});
	}

	return denied || /{{[\s\n]*nobots[\s\n]*}}/i.test(content) && 'Ban all compliant bots.';
};

/**
 * pattern that will be denied.<br />
 * i.e. "deny=all", !("allow=all")
 * 
 * @type {RegExp}
 */
wiki_API.edit.denied.all = /(?:^|[\s,])all(?:$|[\s,])/;


//---------------------------------------------------------------------//

/**
 * full text search<br />
 * search wikitext: using prefix "insource:". e.g.,
 * https://en.wikipedia.org/w/api.php?action=query&list=search&srwhat=text&srsearch=insource:abc+def
 * 
 * @param {String}key
 *            search key
 * @param {Function}callback
 *            回調函數。 callback(key, pages, hits)
 * @param {Object}options
 *            附加參數/設定選擇性/特殊功能與選項
 * 
 * @see https://www.mediawiki.org/wiki/API:Search_and_discovery
 * @see https://www.mediawiki.org/wiki/Help:CirrusSearch
 */
wiki_API.search = function(key, callback, options) {
	if (options > 0 || options === 'max')
		options = {
			srlimit : options
		};
	var API_URL;
	if (Array.isArray(key))
		API_URL = key[0], key = key[1];
	wiki_API.query([ API_URL, 'query&list=search&' + get_URL.param_to_String(Object.assign({
		srsearch : key
	}, wiki_API.search.default_parameter, options)) ], function(data) {
		if (library_namespace.is_debug(2)
			// .show_value() @ interact.DOM, application.debug
			&& library_namespace.show_value)
			library_namespace.show_value(data, 'wiki_API.search');

		options = data && (data['continue'] || data['query-continue']);
		if (data && (data = data.query)) {
			if (options)
				// data.search.sroffset = options.search.sroffset;
				Object.assign(data.search, options.search);
			data.search.hits = data.searchinfo.totalhits;
			data = data.search;
		}

		// data: [ page_data ].hits = \d+, .sroffset = next
		if (typeof callback === 'function')
			// callback(key, pages, hits)
			callback(key, data, data.hits);
	});
};

wiki_API.search.default_parameter = {
	srprop : 'redirecttitle',
	//srlimit : 10,
	srinterwiki : 1
};


//---------------------------------------------------------------------//

/**
 * 取得所有 redirect 到 [[title]] 之 pages。<br />
 * 可以 [[Special:链入页面]] 確認。
 * 
 * @param {String}title
 *            頁面名。
 * @param {Function}callback
 *            callback(root_page_data, redirect_list) { redirect_list = [ page_data, page_data, ... ]; }
 * @param {Object}[options]
 *            附加參數/設定選擇性/特殊功能與選項. 此 options 可能會被變更!<br />
 *            {Boolean}options.no_trace: 若頁面還重定向到其他頁面則不溯源。溯源時 title 將以 root 替代。<br />
 *            {Boolean}options.include_root 回傳 list 包含 title，而不只是所有 redirect 到
 *            [[title]] 之 pages。
 */
wiki_API.redirects = function(title, callback, options) {
	// 前置處理。
	if (!library_namespace.is_Object(options))
		options = library_namespace.null_Object();

	if (!options.no_trace) {
		// 溯源(追尋重定向終點)
		wiki_API.page(title, function(page_data) {
			var content = get_page_content(page_data),
			//
			redirect_to = parse_redirect(content);
			// clone Object, 避免更改 options.
			options = Object.clone(options);
			options.no_trace = true;
			if (redirect_to)
				wiki_API.redirects(redirect_to, callback, options);
			else
				wiki_API.redirects(title, callback, options);
		});
		return;
	}

	// 處理 [ {String}API_URL, {String}title ]
	if (!Array.isArray(title))
		title = [ , title ];
	title[1] = wiki_API.query.title_param(title[1], true);

	title[1] = 'query&prop=redirects&rdlimit=max&'
	//
	+ title[1];
	if (!title[0])
		title = title[1];

	wiki_API.query(title, typeof callback === 'function'
	//
	&& function(data) {
		// copy from wiki_API.page()

		var error = data && data.error;
		// 檢查伺服器回應是否有錯誤資訊。
		if (error) {
			library_namespace.err('wiki_API.redirects: [' + error.code + '] ' + error.info);
			// e.g., Too many values supplied for parameter 'pageids': the limit is 50
			if (data.warnings && data.warnings.query && data.warnings.query['*'])
				library_namespace.warn(data.warnings.query['*']);
			return callback();

		} else if (!data || !data.query || !data.query.pages) {
			library_namespace.warn('wiki_API.redirects: Unknown response: [' + data + ']');
			if (library_namespace.is_debug()
				// .show_value() @ interact.DOM, application.debug
				&& library_namespace.show_value)
				library_namespace.show_value(data);
			return callback();
		}

		data = data.query.pages;
		var pages = [];
		for ( var pageid in data) {
			var page = data[pageid];
			pages.push(page);
			// 僅處理第一頁。
			if ('missing' in page)
				// 頁面不存在。Page does not exist. Deleted?
				library_namespace.warn('wiki_API.redirects: Not exists: [' + page.title + ']');
			break;
		}

		pages = pages[0];

		// page 之 structure 將按照 wiki 本身之 return！
		// page = {pageid,ns,title,redirects:[{},{}]}
		var redirects = pages.redirects || [];
		library_namespace.debug(get_page_title(pages)
				+ ': 有 ' + redirects.length + ' 個同名頁面(重定向至此頁面).', 2, 'wiki_API.redirects');
		if (options.include_root) {
			redirects = redirects.slice();
			redirects.unshift(pages);
		}
		// callback(root_page_data 本名, redirect_list 別名 alias list)
		callback(pages, redirects);
	});
};


/**
 * 計算實質嵌入包含(transclusion)之頁面數。
 * 
 * 若條目(頁面)嵌入包含有模板(頁面)別名，則將同時登記 embeddedin 於別名 alias 與 root。<br />
 * e.g., 當同時包含 {{Refimprove}}, {{RefImprove}} 時會算作兩個，但實質僅一個。<br />
 * 惟計數時，此時應僅計算一次。本函數可以去除重複名稱，避免模板尚有名稱重複者。
 * 
 * @param {Object}root_name_hash
 *            模板本名 hash. 模板本名[{String}模板別名/本名] = {String}root 模板本名
 * @param {Array}embeddedin_list
 *            頁面嵌入包含之模板 list。
 * 
 * @returns {Integer}normalized count
 */
wiki_API.redirects.count = function(root_name_hash, embeddedin_list) {
	var name_hash = library_namespace.null_Object();
	embeddedin_list.forEach(function(title) {
		title = get_page_title(title);
		library_namespace.debug('含有模板{{' + root_name_hash[title] + '}}←{{'
				+ title + '}}', 3, 'wiki_API.redirects.count');
		name_hash[root_name_hash[title] || title] = null;
	});
	return Object.keys(name_hash).length;
};


//---------------------------------------------------------------------//

/** {Object|Function}fs in node.js */
var node_fs;
try {
	if (library_namespace.is_node)
		// @see https://nodejs.org/api/fs.html
		node_fs = require('fs');
	if (typeof node_fs.readFile !== 'function')
		throw true;
} catch (e) {
	// enumerate for wiki_API.cache
	// 模擬 node.js 之 fs，以達成最起碼的效果（即無 cache 功能的情況）。
	library_namespace.warn('無 node.js 之 fs，因此不具備cache 功能。');
	node_fs = {
		readFile : function(file_name, encoding, callback) {
			callback(true);
		},
		writeFile : library_namespace.null_function
	};
}


/*

cache 相關函數:
@see
application.storage.file.get_cache_file
application.OS.Windows.file.cacher
application.net.Ajax.get_URL_cache
application.net.wiki wiki_API.cache() CeL.wiki.cache()

*/


/**
 * cache 作業操作之輔助套裝函數。
 * 
 * 注意: 需要自行先創建各 type 之次目錄，如 page, redirects, embeddedin, ...<br />
 * 注意: 會改變 operation, _this! Warning: will modify operation, _this!
 * 
 * 連續作業: 依照 _this 設定 {Object}default options，即傳遞於各 operator 間的 ((this))。<br />
 * 依照 operation 順序個別執行單一項作業。
 * 
 * 單一項作業:<br />
 * 設定檔名。<br />
 * 若不存在此檔，則:<br />
 * >>> 依照 operation.type 與 operation.list 取得資料。<br />
 * >>> 若 Array.isArray(operation.list) 則處理多項列表作業:<br />
 * >>>>>> 個別處理單一項作業，每次執行 operation.each() || operation.each_retrieve()。<br />
 * >>> 執行 data = operation.retrieve()，以其回傳作為將要 cache 之 data。<br />
 * >>> 寫入cache。<br />
 * 執行 operation.operator(data)
 * 
 * @param {Object|Array}operation
 *            作業設定。
 * @param {Function}[callback]
 *            回調函數。 callback(response data)
 * @param {Object}[_this]
 *            傳遞於各 operator 間的 ((this))。
 */
wiki_API.cache = function(operation, callback, _this) {
	// node.js v0.11.16: In strict mode code, functions can only be declared at top level or immediately within another function.
	/**
	 * 連續作業時，轉到下一作業。
	 */
	function next_operator(data) {
		library_namespace.debug('處理連續作業，轉到下一作業: ' + index + '/'
				+ operation.length, 2, 'wiki_API.cache.next_operator');
		// [ {Object}operation, {Object}operation, ... ]
		// operation = { type:'embeddedin', operator:function(data) }
		if (index < operation.length) {
			if (!('list' in operation[index])) {
				// use previous data as list.
				library_namespace.debug('未特別指定 list，以前一次之回傳 data 作為 list。',
						3, 'wiki_API.cache.next_operator');
				library_namespace.debug('前一次之回傳 data: '
						+ (data && JSON.stringify(data).slice(0, 180))
						+ '...', 3, 'wiki_API.cache.next_operator');
				operation[index].list = data;
			}
			// default options === _this: 傳遞於各 operator 間的 ((this))。
			wiki_API.cache(operation[index++], next_operator, _this);
		} else if (typeof callback === 'function') {
			// last 收尾
			callback.call(_this);
		}
	}

	if (Array.isArray(operation)) {
		var index = 0;

		next_operator();
		return;
	}

	// ----------------------------------------------------
	/**
	 * 以下為處理單一次作業。
	 */
	library_namespace.debug('處理單一次作業。', 2, 'wiki_API.cache');
	library_namespace.debug('using operation: ' + JSON.stringify(operation), 6,
			'wiki_API.cache');

	if (typeof _this !== 'object')
		// _this: 傳遞於各 operator 間的 ((this))。
		_this = library_namespace.null_Object();

	var file_name = operation.file_name;

	if (typeof file_name === 'function')
		file_name = file_name.call(_this, operation);

	// operation.type: method to get data
	var type = operation.type,
	//
	operator = typeof operation.operator === 'function' && operation.operator,
	//
	list = operation.list;

	if (!file_name) {
		// 若自行設定了檔名，則慢點執行 list()，先讀讀 cache。因為 list() 可能會頗耗時間。
		// 基本上，設定 this.* 應該在 operation.operator() 中，而不是在 operation.list() 中。
		if (typeof list === 'function')
			list = list.call(_this, operation);

		// 自行設定之檔名 operation.file_name 優先度較 type/title 高。
		file_name = ((file_name = _this[type + '_prefix'] || type) ?
		// 需要自行創建目錄!
				file_name + '/' : '')
		//
		+ (get_page_content.is_page_data(list) ? list.title
		//
		: typeof list === 'string' && normalize_page_name(list) || '');
	}

	// _this.prefix: cache path prefix
	file_name = [ 'prefix' in operation ? operation.prefix
	//
	: 'prefix' in _this ? _this.prefix : wiki_API.cache.prefix, file_name,
	//
	'postfix' in operation ? operation.postfix
	//
	: 'postfix' in _this ? _this.postfix : wiki_API.cache.postfix ];
	library_namespace.debug(
			'Pre-normalized cache file name: [' + file_name + ']', 5,
			'wiki_API.cache');
	if (false)
		library_namespace.debug('file name param:'
				+ [ operation.file_name, _this[type + '_prefix'], type,
						JSON.stringify(list) ].join(';'), 6, 'wiki_API.cache');
	// 正規化檔名。
	file_name = file_name.join('').replace(/[:*?<>]/g, '_');
	library_namespace.debug('Try to read cache file: [' + file_name + ']', 3,
			'wiki_API.cache');

	/**
	 * 採用 JSON<br />
	 * TODO: parse & stringify 機制
	 * 
	 * @type {Boolean}
	 */
	var use_JSON = 'json' in operation ? operation.json : /\.json$/i
			.test(file_name),
	/** {String}file encoding for fs of node.js. */
	encoding = _this.encoding || wiki_API.encoding;

	node_fs.readFile(file_name, encoding, function(
			error, data) {
		/**
		 * 結束作業。
		 */
		function finish_work(data) {
			if (operator)
				operator.call(_this, data, operation);
			if (typeof callback === 'function')
				callback.call(_this, data);
		}

		if (!error && (data ||
		// 當資料 Invalid，例如採用 JSON 卻獲得空資料時；則視為 error，不接受此資料。
		('accept_empty_data' in _this ? _this.accept_empty_data : !use_JSON))) {
			library_namespace.debug('Using cached data.', 3, 'wiki_API.cache');
			library_namespace.debug('Cached data: [' + data.slice(0, 200)
					+ ']...', 5, 'wiki_API.cache');
			finish_work(use_JSON ? data ? JSON.parse(data)
			// error? 注意: 若中途 about，此時可能需要手動刪除大小為 0 的 cache file!
			: undefined : data);
			return;
		}

		library_namespace.debug('No valid cached data. Try to get data...', 3,
				'wiki_API.cache');

		/**
		 * 寫入cache。
		 */
		function write_cache(data) {
			if (/[^\\\/]$/.test(file_name)) {
				library_namespace.info('wiki_API.cache: Write cache data to ['
						+ file_name + '].');
				library_namespace.debug('Cache data: '
						+ (data && JSON.stringify(data).slice(0, 190)) + '...',
						3, 'wiki_API.cache.write_cache');
				node_fs.writeFile(file_name, use_JSON ? JSON.stringify(data)
						: data, encoding);
			}
			finish_work(data);
		}

		// node.js v0.11.16: In strict mode code, functions can only be declared at top level or immediately within another function.
		/**
		 * 取得下一項 data。
		 */
		function get_next_item(data) {
			library_namespace.debug('處理多項列表作業: ' + index + '/'
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

		if (typeof list === 'function')
			list = list.call(_this, operation);
		if (Array.isArray(list)) {
			if (!type) {
				library_namespace.debug('採用 list (length ' + list.length
						+ ') 作為 data。', 1, 'wiki_API.cache');
				write_cache(list);
				return;
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
				// 每一項執行一次 .each()
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
							Array.prototype.push.apply(_operation.data_list,
									data);
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

		var to_get_data;

		switch (type) {
		case 'page':
			// page content 內容
			to_get_data = function(title, callback) {
				library_namespace.log('Get content of [[' + title + ']]');
				wiki_API.page(title, function(page_data) {
					callback(page_data);
				}, Object.assign(library_namespace.null_Object(), _this,
						operation));
			};
			break;
		case 'redirects':
			to_get_data = function(title, callback) {
				wiki_API.redirects(title, function(root_page_data,
						redirect_list) {
					library_namespace.log(
					//
					'redirects (alias) of [[' + title + ']]: ('
					//
					+ redirect_list.length + ') [' + redirect_list.slice(0, 3)
					//
					.map(function(page_data) {
						return page_data.title;
					}) + ']...');
					if (!operation.keep_redirects && redirect_list
							&& redirect_list[0])
						// cache 中不需要此累贅之資料。
						// redirect_list[0].redirects == redirect_list.slice(1)
						delete redirect_list[0].redirects;
					callback(redirect_list);
				}, Object.assign({
					include_root : true
				}, _this, operation));
			};
			break;
		case 'backlinks':
		case 'embeddedin':
		case 'imageusage':
		case 'linkshere':
		case 'fileusage':
			to_get_data = function(title, callback) {
				wiki_API.list(title, function(pages) {
					library_namespace.log('[[' + get_page_title(title) + ']]: '
					//
					+ pages.length + ' pages ' + type + '.');
					// page list, title page_data
					callback(pages);
				}, Object.assign({
					type : type
				}, _this, operation));
			};
			break;
		default:
			if (typeof type === 'function')
				to_get_data = type.bind(Object.assign(library_namespace
						.null_Object(), _this, operation));
			else if (type)
				throw new Error('wiki_API.cache: Bad type: ' + type);
			else {
				library_namespace
						.debug('採用 list 作為 data。', 1, 'wiki_API.cache');
				write_cache(list);
				return;
			}
		}

		var title = list;
		if (typeof title === 'string' && _this.title_prefix)
			title = _this.title_prefix + title;
		library_namespace.debug('處理單一項作業: [[' + get_page_title(title) + ']]。',
				3, 'wiki_API.cache');
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
 * 只取檔名，僅用在 operation.each_file_name。<br />
 * <code>{
 * each_file_name : CeL.wiki.cache.title_only,
 * }</code>
 * 
 * @type {Function}
 */
wiki_API.cache.title_only = function(operation) {
	var list = operation.list;
	if (typeof list === 'function')
		operation.list = list = list.call(_this, operation);
	return operation.type + '/' + remove_namespace(list);
};


// --------------------------------------------------------------------------------------------- //

// export 導出.
Object.assign(wiki_API, {
	api_URL : api_URL,
	// default api URL. Use <code>CeL.wiki.API_URL = api_URL('en')</code> to change it.
	// see also: application.locale
	API_URL : api_URL((library_namespace.is_WWW()
			&& (navigator.userLanguage || navigator.language) || 'zh')
			.toLowerCase().replace(/-.+$/, '')),

	namespace : get_namespace,
	remove_namespace : remove_namespace,

	file_pattern : file_pattern,
	template_token : template_token,

	wiki_page : wiki_page,

	content_of : get_page_content,
	title_of : get_page_title,
	normalize_title : normalize_page_name,
	normalize_title_pattern : normalize_name_pattern,
	get_hash : list_to_hash,
	uniq_list : unique_list
});


return wiki_API;
},

no_extend : '*'

});
