
/**
 * @name	CeL function for Wikipedia / 維基百科
 * @fileoverview
 * 本檔案包含了 Wikipedia / 維基百科 用的 functions。
 * @since 2015/1/1
 * @example <code>


// [[維基百科:機器人]]
// https://en.wikipedia.org/w/api.php

// Wikipedia:沙盒
// https://zh.wikipedia.org/wiki/Wikipedia:%E6%B2%99%E7%9B%92
// https://zh.wikipedia.org/wiki/Special:API%E6%B2%99%E7%9B%92


// for debug: 'interact.DOM', 'application.debug',
CeL.run([ 'interact.DOM', 'application.debug', 'application.net.wiki' ]);


CeL.run([ 'interact.DOM', 'application.debug', 'application.net.wiki' ], function() {
	var wiki = CeL.wiki.login('', '')
	// get the content of page
	.page('Wikipedia:沙盒', function(title, content) {
		CeL.info(title);
		CeL.log(content);
	})
	// get the content of page, and then replace it.
	.page('Wikipedia:沙盒 ').edit('* [[沙盒]]', {
		section : 'new',
		sectiontitle : ' 沙盒 test section',
		summary : ' 沙盒 test edit (section)',
		nocreate : 1
	})
	// get the content of page, and then modify it.
	.page('Wikipedia:沙盒 ').edit(function(text) {
		return text + '\n\n* [[沙盒]]';
	}, {
		summary : ' 沙盒 test edit',
		nocreate : 1,
		bot : 1
	});
	// 執行過 .page() 後，與上一種方法相同。
	.page(function(title, content) {
		CeL.info(title);
		CeL.log(content);
	})
	// get the content of page, replace it, and set summary.
	.edit('text to replace', {
		summary : 'summary'
	})
	// get the content of page, modify it, and set summary.
	.edit(function(content) {
		return 'text to replace';
	}, {
		summary : 'summary'
	});

	CeL.wiki.page('Wikipedia:沙盒', function(title, content) {
		CeL.info(title);
		CeL.log(content);
	});

	wiki.logout();
});


 </code>
 */

'use strict';
if (typeof CeL === 'function')
CeL.run({
name : 'application.net.wiki',
// .between() @ data.native
// (new Date).format('%4Y%2m%2d'), (new Date).toISOString() @ data.date
// optional: .show_value() @ interact.DOM, application.debug
require : 'data.native.|application.net.Ajax.get_URL|data.date.',
code : function(library_namespace) {

//	requiring
var get_URL,
//const: 基本上與程式碼設計合一，僅表示名義，不可更改。(== -1)
NOT_FOUND = ''.indexOf('_');
eval(this.use());


// --------------------------------------------------------------------------------------------- //


/**
 * web Wikipedia / 維基百科 用的 functions
 */
function wiki_API(name, password, API_URL) {
	if (!this || this.constructor !== wiki_API)
		return wiki_API.query(name, password, API_URL);

	this.token = {
		// lgusername
		lgname : name,
		lgpassword : password
	};

	// action queue
	this.actions = [];

	this.next_mark = library_namespace.null_Object();

	// setup session.
	//this.set_URL(API_URL);
	if (API_URL)
		this.API_URL = wiki_API.api_URL(API_URL);
}


// get title of page
wiki_API.title_of = function(page_data) {
	// 處理 [ {String}API_URL, {String}title ]
	if (Array.isArray(page_data))
		page_data = page_data[1];
	return page_data.title || page_data;
};


wiki_API.prototype.show_next = typeof JSON === 'object' && JSON.stringify ? function() {
	return JSON.stringify(this.next_mark);
} : function() {
	var line = [];
	for (var name in this.next_mark)
		line.push(name + ':"' + this.next_mark[name] + '"');
	return '{' + line.join(',') + '}';
};


// get contents of page
function page_content(page_data) {
	return page_content.is_page_data(page_data) ?
	//
	(page_data = page_content.has_content(page_data)) && page_data['*'] || undefined
			: String(page_data);
}
// return pageid
page_content.is_page_data = function(page_data) {
	return library_namespace.is_Object(page_data) && page_data.title
			&& page_data.pageid;
};
// return .revisions[0]
// 不回傳 {String}，減輕負擔。
page_content.has_content = function(page_data) {
	return library_namespace.is_Object(page_data)
	// treat as page data. Try to get page contents: page.revisions[0]['*']
	&& page_data.revisions && page_data.revisions[0];
};

wiki_API.content_of = page_content;

wiki_API.prototype.toString = function(type) {
	return page_content(this.last_page) || '';
};

wiki_API.prototype.next = function() {
	if (!(this.running = 0 < this.actions.length)) {
		library_namespace.debug('Empty queue.', 2, 'wiki_API.prototype.next');
		return;
	}

	library_namespace.debug('剩餘 ' + this.actions.length + ' action(s)', 2, 'wiki_API.prototype.next');
	if (library_namespace.is_debug(3))
		library_namespace.show_value(this.actions.slice());
	var _this = this, next = this.actions.shift();
	library_namespace.debug('處理 ' + (this.token.lgname ? this.token.lgname + ' ' : '') + '[' + next + ']', 2, 'wiki_API.prototype.next');
	switch (next[0]) {
	case 'page':
		// this.page(page data, callback) → 採用所輸入之 page data 作為 this.last_page。
		if (page_content.is_page_data(next[1]) && page_content.has_content(next[1])) {
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
			// [ {String}API_URL, {String}title ]
			wiki_API.page([ this.API_URL, next[1] ], function(page_data) {
				_this.last_page = Array.isArray(page_data) ? page_data[0] : page_data;
				// next[2] : callback
				if (typeof next[2] === 'function')
					next[2].call(_this, page_data);
				_this.next();
			});
		break;

	case 'backlinks':
	case 'imageusage':
	case 'linkshere':
	case 'fileusage':
		// get list. e.g., 反向連結/連入頁面.
		// next[1] : title
		wiki_API[next[0]]([ this.API_URL, next[1] ], function(title, titles, pages) {
			// [ last_list ]
			_this.last_titles = titles;
			// [ page_data ]
			_this.last_pages = pages;
			if (library_namespace.is_Object(pages.next)) {
				// pages.next: 例如 {backlinks:{blcontinue:'[0|12]'}}
				for ( var type in pages.next)
					Object.assign(_this.next_mark, pages.next[type]);
				library_namespace.debug('next: ' + _this.show_next());
			}

			if (typeof next[2] === 'function')
				// next[2] : callback
				next[2].call(_this, title, titles, pages);
			else if (next[2] && next[2].each)
				// next[2] : 當作 work，處理積存工作。
				_this.work(next[2]);

			_this.next();
		},
		// next[3] : options
		Object.assign(library_namespace.null_Object(), this.next_mark, next[3]));
		break;

	case 'edit':
		if (!this.last_page) {
			library_namespace.warn('wiki_API.prototype.next: No page in the queue. You must run .page() first!');
			// next[3] : callback
			if (typeof next[3] === 'function')
				next[3].call(_this, title, 'no page');
			this.next();
		} else if (wiki_API.edit.denied(this.last_page, this.token.lgname, next[2] && next[2].action)) {
			// 採用 this.last_page 的方法，在 multithreading 下可能因其他 threading 插入而造成問題，須注意！
			library_namespace.warn('wiki_API.prototype.next: Denied to edit [' + this.last_page.title + ']');
			// next[3] : callback
			if (typeof next[3] === 'function')
				next[3].call(_this, title, 'denied');
			this.next();
		} else
			wiki_API.edit([ this.API_URL, this.last_page ],
			// 因為已有 contents，直接餵給轉換函式。
			typeof next[1] === 'function' ? next[1](page_content(this.last_page), this.last_page.title) : next[1],
			// next[2]: options to edit()
			this.token, next[2], function(title, error, result) {
				// next[3] : callback
				if (typeof next[3] === 'function')
					next[3].call(_this, title, error, result);
				_this.next();
			});
		break;

	case 'login':
		library_namespace.debug('正 log in 中，當 login 後，會自動執行 .next()，處理餘下的工作。', 2, 'wiki_API.prototype.next');
	case 'wait':
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
			this.API_URL = wiki_API.api_URL(next[1]);
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

// wiki_API.prototype.next() 已登記之 methods。
// 之後會再加入 get_list.type 之 methods。
// NG: ,login
wiki_API.prototype.next.methods = 'page,edit,logout,run,set_URL'
	.split(',');

//---------------------------------------------------------------------//

// wiki_API.prototype.work(config): configuration:
({
	first : function(messages, titles, pages) {
	},
	// {Function|Array} 每個 page 執行一次。
	each : function(content, title, messages, page_data) {
		return 'text to replace';
	},
	last : function(messages, titles, pages) {
	},
	// log summary 運作記錄。
	log_to : 'User:Robot/log/%4Y%2m%2d',
	summary : ''
});

// 不會推入 this.actions queue，即時執行。因此需要先 get list!
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
	if (!Array.isArray(pages) && !titles) {
		// 採用推入前一個 this.actions queue 的方法，
		// 在 multithreading 下可能因其他 threading 插入而造成問題，須注意！
		library_namespace
				.warn('wiki_API.work: No list. Please get list first!');
		return;
	}

	library_namespace.debug('wiki_API.work: 開始執行:先做環境建構與初始設定。');

	// default handler [ text replace function(title, content), {Object}options, callback(title, error, result) ]
	var each;
	if (typeof config.each === 'function')
		// {Function}
		each = [ config.each ];
	else if (Array.isArray(config.each))
		each = config.slice();
	else
		library_namespace
				.err('wiki_API.work: Invalid function for each page!');

	each[1] = Object.assign({
		// Robot 運作
		summary : 'Robot' + (config.summary ? ': ' + config.summary : ''),
		nocreate : 1,
		minor : 1,
		bot : 1
	}, each[1]);

	if (!each[2])
		each[2] = function(title, error, result) {
			if (error)
				error = ' 結束: ' + error;
			else {
				done++;
				if (result.edit.newrevid)
					error = ' [[Special:Diff/' + result.edit.newrevid + '|完成]]';
				else {
					// 有時無 result.edit.newrevid
					library_namespace.err('無 result.edit.newrevid');
					error = '完成';
				}
			}
				
			messages.push('* [[' + title + ']]: 費時 ' + messages.last.age(new Date)
					+ '，' + (messages.last = new Date).toISOString() + error);
		};

	var done = 0, messages = [];
	messages.start = messages.last = new Date;

	if (false && Array.isArray(pages)
	//
	&& (Array.isArray(titles) ? pages.length !== titles.length : !titles)) {
		library_namespace.warn('wiki_API.work: rebuild titles.');
		titles = [];
		pages.forEach(function(page) {
			titles.push(page.title);
		});
	}

	if (Array.isArray(pages) && Array.isArray(titles) && pages.length !== titles.length)
		library_namespace.warn('wiki_API.work: The length of pages and titles are different!');

	library_namespace.debug('wiki_API.work: 設定一次先取得所有 revisions (page content)。', 2);
	this.page(pages || titles, function(data) {
		if (data.length !== pages.length)
			library_namespace.warn('wiki_API.work: query 所得之 length ' + data.length + ' !== pages.length ' + pages.length + ' !');
		pages = '* 首先費時 ' + messages.last.age(new Date) + ' 以取得 ' + data.length + ' 頁面內容。';
		messages.last = new Date;
		messages.push(pages);
		library_namespace.debug(pages, 2, wiki_API.work);
		library_namespace.show_value(data, 'pages');
		pages = data;

		if (typeof config.first === 'function')
			config.first.call(this, messages, titles, pages);

		library_namespace.debug('wiki_API.work: for each page: 主要機制是把工作全部推入 queue。', 2);
		pages.forEach(function(page) {
			if (library_namespace.is_debug(2)
				// .show_value() @ interact.DOM, application.debug
				&& library_namespace.show_value)
				library_namespace.show_value(page, 'page');
			this.page(page).edit(function(content, title) {
				library_namespace.info('wiki_API.work: edit [[' + page.title + ']]');
				return each[0](content, title, messages, page);
			}, each[1], each[2]);
		}, this);

		this.run(function() {
			library_namespace.debug('wiki_API.work: 收尾。');
			if (config.summary)
				messages.unshift(config.summary, ': 完成 ' + done + '/' + pages.length
					+ ' 條目，總共費時 ' + messages.start.age(new Date) + '。');

			if (typeof config.last === 'function')
				config.last.call(this, messages, titles, pages);

			var log_to = 'log_to' in config ? config.log_to
			// default log_to
			: 'User:' + this.token.lgname + '/log/' + (new Date).format('%4Y%2m%2d'),
			//
			options = {
				section : 'new',
				sectiontitle : '[' + (new Date).toISOString() + '] ' + done
						+ '/' + pages.length + ' 條目',
				summary : 'Robot: 完成 ' + done + '/' + pages.length + ' 條目',
				nocreate : 1
			};

			if (log_to)
				this.page(log_to)
				// log summary. Robot 運作記錄。
				// TODO: 以表格呈現。
				.edit(messages.join('\n'), options, function(title, error, result) {
					if (error) {
						library_namespace.warn('wiki_API.work: Can not write log to [' + log_to
						//
						+ ']! Try to write to [' + 'User:' + this.token.lgname + ']');
						library_namespace.log('log:<br />\n' + messages.join('<br />\n'));
						// 改寫於可寫入處。e.g., 'Wikipedia:Sandbox'
						this.page('User:' + this.token.lgname).edit(messages.join('\n'), options);
					}
				});
			else
				library_namespace.log('log:<br />\n' + messages.join('<br />\n'));
		});
	});
};

//--------------------------------------------------------------------------------------------- //

// https://en.wikipedia.org/wiki/Wikipedia:Wikimedia_sister_projects
// project, domain or language
wiki_API.api_URL = function(project) {
	return project ? project.indexOf('://') === NOT_FOUND ? 'https://' + project + '.wikipedia.org/w/api.php' : project : wiki_API.API_URL;
};

// default api URL
// see also: application.locale
wiki_API.API_URL = wiki_API.api_URL(
	(library_namespace.is_WWW() && (navigator.userLanguage || navigator.language) || 'zh')
	.toLowerCase().replace(/-.+$/, ''));

// 列舉型別 (enumeration)
// options.namespace: https://en.wikipedia.org/wiki/Wikipedia:Namespace
wiki_API.namespace = function(namespace) {
	if (namespace in wiki_API.namespace.hash)
		return wiki_API.namespace.hash[namespace];
	if (isNaN(namespace)) {
		if (namespace)
			library_namespace.warn('wiki_API.namespace: Invalid namespace: [' + namespace + ']');
		return namespace;
	}
	return namespace | 0;
};

wiki_API.namespace.hash = {
	// Virtual namespaces
	media : -2,
	special : -1,
	// 0: (Main/Article)
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

//---------------------------------------------------------------------//


// {String}action or [ {String}api URL, {String}action, {Object}other parameters ]
wiki_API.query = function (action, callback, post_data) {
	// 處理 action
	library_namespace.debug('action: ' + action, 2, 'wiki_API.query');
	if (typeof action === 'string')
		action = [ , action ];
	else if (!Array.isArray(action))
		library_namespace.err('wiki_API.query: Invalid action: [' + action + ']');
	action[0] = wiki_API.api_URL(action[0]);

	// 檢測是否間隔過短。
	var to_wait = Date.now() - wiki_API.query.last[action[0]];
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
		action[0] = get_URL.add_param(action[0], 'format=json&utf8=1');

	// 開始處理
	if (!post_data && wiki_API.query.allow_JSONP) {
		library_namespace.debug('採用 JSONP callback 的方法。須注意：若有 error，將不會執行 callback！', 2, 'wiki_API.query');
		get_URL(action, {
			callback : callback
		});
	} else
		get_URL(action, function(XMLHttp) {
			var response = XMLHttp.responseText;
			library_namespace.debug('response: ' + response.replace(/</g, '&lt;'), 3, 'wiki_API.query');

			if (/<html[\s>]/.test(response.slice(0, 40)))
				response = response.between('source-javascript', '</pre>').between('>')
				// 去掉所有 HTML tag。
				.replace(/<[^>]+>/g, '');

			// '&#123;' : (")
			if (response.indexOf('&#') !== NOT_FOUND)
				response = library_namespace.HTML_to_Unicode(response);
			// library_namespace.log(response);
			// library_namespace.log(library_namespace.HTML_to_Unicode(response));
			if (response)
				try {
					response = library_namespace.parse_JSON(response);
				} catch (e) {
					library_namespace.err('Invalid content: [' + response + ']');
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

// 使用5秒的最大延遲參數。
// https://www.mediawiki.org/wiki/Manual:Maxlag_parameter
wiki_API.query.lag = 5000;

// 對於可以不用 XMLHttp 的，直接採 JSONP callback 法。
wiki_API.query.allow_JSONP = library_namespace.is_WWW(true);

// wiki_API.query.last[URL] = {Date}last query
wiki_API.query.last = library_namespace.null_Object();

// 取得 page_data 之 title parameter。
// e.g., {pageid:8,title:'abc'} → 'pageid=8'
// e.g., {title:'abc'} → 'title=abc'
// e.g., 'abc' → 'title=abc'
wiki_API.query.title_param = function(page_data, multi) {
	multi = multi ? 's=' : '=';
	var pageid;
	if (Array.isArray(page_data)) {
		pageid = [];
		// 確認所有 page_data 皆有 pageid 屬性。
		pageid = page_data.every(function(page) {
			pageid.push(page = page && page.pageid);
			return page;
		}) && pageid.join('|');
		if (!pageid) {
			if (library_namespace.is_Object(page_data)) {
				library_namespace.warn('wiki_API.query.title_param: 看似有些非正規之頁面資料。');
				library_namespace.info('wiki_API.query.title_param: 將採用 title 為主要查詢方法。');
			}
			pageid = [];
			page_data.forEach(function(page) {
				pageid.push((typeof page === 'object' ? page.title : page) || '');
			});
			page_data = pageid.join('|');
			library_namespace.debug(page_data, 2, 'wiki_API.query.title_param');
			pageid = undefined;
		}

	} else if (library_namespace.is_Object(page_data))
		if (page_data.pageid)
			// 有 pageid 使用之，以加速。
			pageid = page_data.pageid;
		else
			page_data = page_data.title;
	else if (!page_data)
		library_namespace.err('wiki_API.query.title_param: Invalid title: [' + page_data + ']');

	return pageid === undefined ? 'title' + multi + encodeURIComponent(page_data)
	//
	: 'pageid' + multi + pageid;
};
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

//---------------------------------------------------------------------//


// 讀取頁面內容。可一次處理多個標題。
// {String}title or [ {String}API_URL, {String}title ]
// {Function}callback(page_data)
// {String}timestamp: e.g., '2015-01-02T02:52:29Z'
// CeL.wiki.page('道',function(p){CeL.show_value(p);});
wiki_API.page = function(title, callback) {
	// 處理 [ {String}API_URL, {String}title ]
	if (!Array.isArray(title)
	// 為了預防輸入的是問題頁面。
	|| title.length !== 2 || typeof title[0] === 'object')
		title = [ , title ];
	title[1] = wiki_API.query.title_param(title[1], true);
	if (title[1].indexOf('|') === NOT_FOUND
	//
	&& title[1].indexOf(encodeURIComponent('|')) === NOT_FOUND)
		title[1] = 'rvlimit=1&' + title[1];
	title[1] = 'query&prop=revisions&rvprop=content|timestamp&'
	// &rvexpandtemplates=1
	// prop=info|revisions
	+ title[1];
	if (!title[0])
		title = title[1];

	wiki_API.query(title, typeof callback === 'function'
	//
	&& function(data) {
		if (library_namespace.is_debug(2)
			// .show_value() @ interact.DOM, application.debug
			&& library_namespace.show_value)
			library_namespace.show_value(data, 'wiki_API.page: data');

		if (!data || !data.query || !data.query.pages) {
			library_namespace.warn('wiki_API.page: Unknown response: [' + data + ']');
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
			if (!page_content.has_content(page))
				library_namespace.warn('wiki_API.page: No content: [' + page.title + ']');
		}

		if (pages.length !== 1 && library_namespace.is_debug())
			library_namespace.info('wiki_API.page: Get ' + pages.length
			//
			+ ' page(s)! We will pass all pages to callback!');
		// page 之 structure 按照 wiki 本身之 return！
		// page = {pageid,ns,title,revisions:[{timestamp,'*'}]}
		callback(pages.length < 2 ? pages[0] : pages);
	});
};

//---------------------------------------------------------------------//

/*

// 'Language'
CeL.wiki.langlinks('語言',function(p){CeL.show_value(p);},'en');

// '語言'
CeL.wiki.langlinks(['en','Language'],function(p){CeL.show_value(p);},'zh');

CeL.wiki.langlinks('語言',function(p){CeL.show_value(p);})
==
CeL.wiki.langlinks('語言',function(p){CeL.show_value(p);},10)
== {langs:['',''], lang:'title'}

*/

// 取得 title 在其他語系 (to_lang) 之標題。可一次處理多個標題。
// return 'title' or {langs:['',''], lang:'title'}
wiki_API.langlinks = function(title, callback, to_lang) {
	var from_lang;
	if (Array.isArray(title) && title.length === 2 && (!title[0] || typeof title[0] === 'string'))
		from_lang = title[0], title = title[1];
	title = 'query&prop=langlinks&' + wiki_API.query.title_param(title, true);
	if (to_lang)
		title += (0 < to_lang ? '&lllimit=' : '&lllang=') + to_lang;
	if (from_lang)
		// llinlanguagecode 無效。
		title = [ from_lang, title ];

	wiki_API.query(title, typeof callback === 'function'
	//
	&& function(data) {
		if (!data || !data.query || !data.query.pages) {
			library_namespace.warn('wiki_API.langlinks: Unknown response: [' + data + ']');
			if (library_namespace.is_debug()
				// .show_value() @ interact.DOM, application.debug
				&& library_namespace.show_value)
				library_namespace.show_value(data);
			return callback();
		}

		data = data.query.pages;
		var pages = [];
		for ( var pageid in data)
			pages.push(data[pageid]);
		if (pages.length !== 1) {
			if (library_namespace.is_debug())
				library_namespace.info('wiki_API.langlinks: Get ' + pages.length
				//
				+ ' page(s)! We will pass all pages to callback!');
			// page 之 structure 按照 wiki 本身之 return！
			// page = {pageid,ns,title,revisions:[{langlinks,'*'}]}
			callback(pages);
		} else {
			if (library_namespace.is_debug() && !pages[0].langlinks) {
				library_namespace.warn('wiki_API.langlinks: '
				//
				+ ('pageid' in pages[0] ? '無' + (to_lang && isNaN(to_lang) ? '所欲求語言[' + to_lang + ']之' : '其他語言') + '連結' : '不存在此頁面')
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
			library_namespace.warn('wiki_API.langlinks.parse: No langlinks exists?'
				+ (langlinks && langlinks.title ? ' [[' + langlinks.title + ']]' : ''));
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
		(langs = library_namespace.null_Object()).langs = [];
		langlinks.forEach(function(lang) {
			langs[lang.lang] = lang['*'];
			langs.langs.push(lang.lang);
		});
	}
	return langs;
};


//---------------------------------------------------------------------//

function get_list(type, title, callback, namespace) {
	var options, prefix = get_list.type[type], parameter;
	if (Array.isArray(prefix)) {
		parameter = prefix[1];
		prefix = prefix[0];
	} else
		parameter = get_list.default_parameter;
	if (library_namespace.is_Object(namespace))
		namespace = (options = namespace).namespace;
	else
		options = library_namespace.null_Object();

	if (isNaN(namespace = wiki_API.namespace(namespace)))
		delete options.namespace;
	else
		options.namespace = namespace;

	// 處理 [ {String}API_URL, {String}title ]
	if (!Array.isArray(title))
		title = [ , title ];

	if (options[prefix + 'continue'])
		library_namespace.debug('[' + title[1] + ']: next start from ' + options[prefix + 'continue']);

	title[1] = 'query&' + parameter + '=' + type + '&'
	//
	+ (parameter === get_list.default_parameter ? prefix : '') + wiki_API.query.title_param(title[1])
	//
	+ (0 < options.limit ? '&' + prefix + 'limit=' + options.limit : '')
	// next start from here.
	+ (options[prefix + 'continue'] ? '&' + prefix + 'continue=' + options[prefix + 'continue'] : '')
	//
	+ ('namespace' in options ? '&' + prefix + 'namespace=' + options.namespace : '');
	if (!title[0])
		title = title[1];

	wiki_API.query(title, typeof callback === 'function' && function(data) {
		function add_page(page) {
			titles.push(page.title);
			pages.push(page);
		}

		if (library_namespace.is_debug(2)
			// .show_value() @ interact.DOM, application.debug
			&& library_namespace.show_value)
			library_namespace.show_value(data, 'get_list:' + type);

		var titles = [], pages = [];
		if (data['query-continue'])
			pages.next = data['query-continue'];
		if (page_content.is_page_data(title))
			title = title.title;

		if (!data || !data.query) {
			library_namespace.err('get_list: Unknown response: [' + data + ']');

		} else if (data.query[type]) {
			if (Array.isArray(data = data.query[type]))
				data.forEach(add_page);

			library_namespace.debug('[' + title + ']: '
					+ titles.length + ' page(s)', 2,
					'get_list');
			callback(title, titles, pages);

		} else {
			data = data.query.pages;
			for ( var pageid in data) {
				if (pages.length) {
					library_namespace.warn('get_list: More than 1 pages got!');
					break;
				}
				var page = data[pageid];
				if (Array.isArray(page[type]))
					page[type].forEach(add_page);

				library_namespace.debug('[' + page.title + ']: '
						+ titles.length + ' page(s)', 1,
						'get_list');
				callback(page.title, titles, pages);
			}
		}
	});
}

//const: 基本上與程式碼設計合一，僅表示名義，不可更改。(== 'list')
get_list.default_parameter = 'list';

// [[Special:Whatlinkshere]]
// https://zh.wikipedia.org/wiki/Help:%E9%93%BE%E5%85%A5%E9%A1%B5%E9%9D%A2
get_list.type = {
	// 'type name' : 'prefix' (parameter : 'list')
	// backlinks: 取得連結到 [[title]] 的頁面。
	backlinks : 'bl',
	// 取得所有使用 title (e.g., [[File:title.jpg]]) 的頁面。
	imageusage : 'iu',
	// 'type name' : [ 'prefix', 'parameter' ]
	// linkshere: 取得連結到 [[title]] 的頁面。
	linkshere : ['lh', 'prop' ],
	// 取得所有使用 title (e.g., [[File:title.jpg]]) 的頁面。
	// 基本上同 imageusage。但可一次處理多個標題。
	fileusage : ['fu', 'prop' ]
};


(function() {
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

// 登入
wiki_API.login = function(name, password, callback) {
	function _next() {
		if (typeof callback === 'function')
			callback(session.token.lgname);
		library_namespace.debug('已登入。自動執行 .next()，處理餘下的工作。', 1, 'wiki_API.login');
		session.actions.shift();
		session.next();
	}

	function _done(data) {
		delete session.token.lgpassword;
		if (data && (data = data.login))
			wiki_API.login.copy_keys.forEach(function(key) {
				if (data[key])
					session.token[key] = data[key];
			});
		if (session.token.csrftoken)
			_next();
		else
			// try to get the csrftoken
			wiki_API.query('query&meta=tokens', function(data) {
				if (data && data.query && data.query.tokens) {
					session.token.csrftoken = data.query.tokens.csrftoken;
					library_namespace.debug('csrftoken: ' + session.token.csrftoken, 1, 'wiki_API.login');
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
			{});
	}

	var action = 'assert=user',
	// 這裡 callback 當作 API_URL。
	session = new wiki_API(name, password, callback);
	// hack: 這表示正 log in 中，當 login 後，會自動執行 .next()，處理餘下的工作。
	session.actions.push([ 'login' ]);

	if (session.API_URL)
		action = [ session.API_URL, action ];

	library_namespace.debug('準備登入 [' + name + ']。', 1, 'wiki_API.login');
	wiki_API.query(action, function(data) {
		// 確認尚未登入，才作登入動作。
		if (data === '') {
			// 您已登入。
			library_namespace.debug('You are already logged in.', 1, 'wiki_API.login');
			_done();
			return;
		}

		wiki_API.query('login', function(data) {
			if (data && data.login && data.login.result === 'NeedToken') {
				session.token.lgtoken = data.login.token;
				wiki_API.query('login', _done, session.token);
			} else
				library_namespace.err(data);
		}, session.token);
	});

	return session;
};

wiki_API.login.copy_keys = 'lguserid,cookieprefix,sessionid'.split(',');

//---------------------------------------------------------------------//

// 編輯頁面。一次處理一個標題。
// ({String|Array}title 頁面標題, {String|Function}頁面內容, {Object}“csrf”令牌, {Object}options, {Function}callback, {String}timestamp)
// {String}text or {Function}text(content, title)
// {String}title or [ {String}API_URL, {String}title ]
// callback(title, error, result)
wiki_API.edit = function(title, text, token, options, callback, timestamp) {
	if (typeof text === 'function') {
		library_namespace.debug('先取得內容再 edit [' + wiki_API.title_of(title) + ']。', 1, 'wiki_API.edit');
		return wiki_API.page(title, function(page_data) {
			if (wiki_API.edit.denied(page_data, options.bot_id, options.action)) {
				library_namespace.warn('wiki_API.edit: Denied to edit [' + page_data.title
						+ ']');
				callback(page_data.title, 'denied');
			} else
				wiki_API.edit(page_data, text(page_content(page_data), page_data.title), token, options, callback);
		});
	}

	var action;
	// 基本檢測。
	if (Array.isArray(text) && text[0] === wiki_API.edit.cancel) {
		action = text.slice(1);
		library_namespace.debug('採用個別特殊訊息: ' + action, 2, 'wiki_API.edit');
		// 可以利用 (return [ CeL.wiki.edit.cancel, 'reason' ];) 來回傳 reason。
		if (action.length === 1)
			action[1] = action[0];
	} else if (text === wiki_API.edit.cancel)
		action = [ '放棄編輯頁面', '放棄編輯頁面' ];
	else if (!text)
		// 內容被清空
		action = [ 'empty', '未設定編輯內容' ];

	if (action) {
		title = wiki_API.title_of(title);
		library_namespace.warn('wiki_API.edit: ' + action[1] + ' [' + title + ']');
		return callback(title, action[0]);
	}

	action = 'edit';
	// 處理 [ {String}API_URL, {String}title ]
	if (Array.isArray(title))
		action = [ title[0], action ], title = title[1];

	// 造出可 modify 的 options。
	library_namespace.debug('#1: ' + Object.keys(options).join(','), 4, 'wiki_API.edit');
	options = Object.assign({
		text : text
	}, options);
	if (library_namespace.is_Object(title)) {
		wiki_API.edit.set_stamp(options, title);
		if (title.pageid)
			options.pageid = title.pageid;
		else
			options.title = title.title;
	} else
		options.title = title;
	wiki_API.edit.set_stamp(options, timestamp);
	//  the token should be sent as the last parameter.
	options.token = library_namespace.is_Object(token) ? token.csrftoken : token;
	library_namespace.debug('#2: ' + Object.keys(options).join(','), 4, 'wiki_API.edit');

	wiki_API.query(action, function(data) {
		var error = data.error
		// 檢查伺服器回應是否有錯誤資訊。
		? '[' + data.error.code + '] ' + data.error.info
		//
		: data.edit && data.edit.result !== 'Success'
		&& ('[' + data.edit.result + '] ' + (data.edit.info || data.edit.captcha && '必需輸入驗證碼'));
		if (error)
			library_namespace.warn('wiki_API.edit: Error to edit [' + wiki_API.title_of(title) + ']: ' + error);
		else if ('nochange' in data.edit)
			library_namespace.info('wiki_API.edit: [' + wiki_API.title_of(title) + ']: no change');
		if (typeof callback === 'function')
			callback(wiki_API.title_of(title), error, data);
	}, options);
};

// 放棄編輯頁面用。
wiki_API.edit.cancel = library_namespace.null_Object();

// 處理編輯衝突
// warning: will modify options!
// https://www.mediawiki.org/wiki/API:Edit
// to detect edit conflicts.
wiki_API.edit.set_stamp = function(options, timestamp) {
	if (page_content.is_page_data(timestamp)
	&& (timestamp = page_content.has_content(timestamp)))
		timestamp = timestamp.timestamp;
	//timestamp = '2000-01-01T00:00:00Z';
	if (timestamp) {
		library_namespace.debug(timestamp, 3, 'wiki_API.edit.set_stamp');
		options.basetimestamp = options.starttimestamp = timestamp;
	}
	return options;
};

// https://zh.wikipedia.org/wiki/Template:Bots
wiki_API.edit.get_bot = function(content) {
	var bots = [], matched, PATTERN = /{{[\s\n]*bots[\s\n]*([\S][\s\S]*?)}}/ig;
	while (matched = PATTERN.exec(content)){
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
wiki_API.edit.denied = function(content, bot_id, action) {
	if (!content || page_content.is_page_data(content) && !(content = page_content(content)))
		return;

	var bots = wiki_API.edit.get_bot(content), denied;
	if (bots) {
		library_namespace.debug('test ' + bot_id + '/' + action, 3,
				'wiki_API.edit.denied');
		// botlist 以半形逗號作間隔
		bot_id = (bot_id = bot_id && bot_id.toLowerCase()) ?
				new RegExp('(?:^|[\\s,])(?:all|' + bot_id + ')(?:$|[\\s,])')
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

			var matched,
			// 封鎖機器人訪問
			PATTERN = /(?:^|\|)[\s\n]*deny[\s\n]*=[\s\n]*([^|]+)/ig;
			while (!denied && (matched = PATTERN.exec(data)))
				denied = bot_id.test(matched[1]);

			PATTERN = /(?:^|\|)[\s\n]*allow[\s\n]*=[\s\n]*([^|]+)/ig;
			while (!denied && (matched = PATTERN.exec(data)))
				denied = !bot_id.test(matched[1]);

			// 過濾所有機器人所發出的所有通知
			if (action) {
				PATTERN = /(?:^|\|)[\s\n]*optout[\s\n]*=[\s\n]*([^|]+)/ig;
				while (!denied && (matched = PATTERN.exec(data)))
					denied = action.test(matched[1]);
			}

			if (denied)
				library_namespace.warn('wiki_API.edit.denied: Denied for ' + data);
		});
	}

	return denied || /{{[\s\n]*nobots[\s\n]*}}/i.test(content);
};

// deny=all, !(allow=all)
wiki_API.edit.denied.all = /(?:^|[\s,])all(?:$|[\s,])/;


//---------------------------------------------------------------------//


return wiki_API;
}


});
