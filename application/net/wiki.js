
/**
 * @name	CeL function for Wikipedia / 維基百科
 * @fileoverview
 * 本檔案包含了 Wikipedia / 維基百科 用的 functions。
 * @since 2015/1/1	
 * @example <code>

// TODO: 使用魔術字{{noexternallanglinks}}禁止條目使用維基數據的連結。
// TODO: 最大延遲參數 https://www.mediawiki.org/wiki/Manual:Maxlag_parameter

// [[維基百科:機器人]]
// https://en.wikipedia.org/w/api.php?action=help&modules=query

// Wikipedia:沙盒
// https://zh.wikipedia.org/wiki/Wikipedia:%E6%B2%99%E7%9B%92
// https://zh.wikipedia.org/wiki/Special:API%E6%B2%99%E7%9B%92


// for debug: 'interact.DOM', 'application.debug',
CeL.run([ 'interact.DOM', 'application.debug', 'application.net.wiki' ]);


CeL.run([ 'interact.DOM', 'application.debug', 'application.net.wiki' ], function() {
	var wiki = CeL.wiki.login('', '')
	//
	.page('Wikipedia:沙盒', function(title, contents) {
		CeL.info(title);
		CeL.log(contents);
	});
	// 執行過 .page() 後，與上一種方法相同。
	.page(function(title, contents) {
		CeL.info(title);
		CeL.log(contents);
	})
	//
	.edit('text to replace', {
		summary : 'summary'
	})
	//
	.edit(function(contents) {
		return 'text to replace';
	}, {
		summary : 'summary'
	});

	CeL.wiki.page('Wikipedia:沙盒', function(title, contents) {
		CeL.info(title);
		CeL.log(contents);
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
// optional: .show_value() @ interact.DOM, application.debug
require : 'data.native.|application.net.Ajax.get_URL',
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

	// setup session.
	if (API_URL && typeof API_URL === 'string')
		this.API_URL = API_URL;

	this.token = {
		// lgusername
		lgname : name,
		lgpassword : password
	};

	// action queue
	this.actions = [];
}


wiki_API.prototype.toString = function(type) {
	// last_page = [ title, contents, timestamp ];
	return this.last_page && this.last_page[1] || '';
};

wiki_API.prototype.next = function() {
	library_namespace.debug(this.actions.length + ' work(s) left', 1, 'wiki_API.prototype.next');
	if (!(this.running = 0 < this.actions.length))
		return;

	var _this = this, next = this.actions.shift();
	switch (next[0]) {
	case 'page':
		if (typeof next[1] === 'function') {
			// next[1] : title
			next[1](this.last_page[0], this.last_page[1]);
			this.next();
		} else
			wiki_API.page(next[1], function(title, contents, page_data, timestamp) {
				_this.last_page = [ title, contents, timestamp ];
				// next[2] : callback
				if (typeof next[2] === 'function')
					next[2](title, contents);
				_this.next();
			});
		break;

	case 'backlinks':
	case 'fileusage':
		// 反向連結/連入頁面
		// next[1] : title
		wiki_API[next[0]](next[1], function(title, titles) {
			// next[2] : callback
			if (typeof next[2] === 'function')
				next[2](title, titles);
			_this.next();
		},
		// next[3] : options
		next[3]);
		break;

	case 'edit':
		if (wiki_API.edit.denied(this.last_page[1], this.token.lgname, next[2] && next[2].action)) {
			library_namespace.warn('wiki_API.prototype.next: Denied to edit [' + this.last_page[0] + ']');
			this.next();
		} else {
			if (typeof next[1] === 'function')
				next[1] = next[1](this.last_page[1]);
			wiki_API.edit(this.last_page[0], next[1], this.token, next[2], function() {
				_this.next();
			});
		}
		break;

	case 'login':
		wiki_API.login(this.token.lgname, this.token.lgpassword, function() {
			_this.next();
		});
		break;

	case 'logout':
		// 結束
		wiki_API.logout(function() {
			_this.next();
		});
		break;

	default:
		library_namespace.warn('Unknown operator: [' + next[0] + ']');
		this.next();
		break;
	}
};

// setup other wiki_API.prototype methods.
'page,edit,login,logout,backlinks,fileusage'.split(',').forEach(function(method) {
	library_namespace.debug('add action to wiki_API.prototype: ' + method, 2);
	wiki_API.prototype[method] = function() {
		// assert: 不可改動 method @ IE!
		var args = [ method ];
		Array.prototype.push.apply(args, arguments);
		library_namespace.debug('add action: ' + args.join('|'), 3, 'wiki_API.prototype.' + method);
		this.actions.push(args);
		if (!this.running)
			this.next();
		return this;
	};
});



//--------------------------------------------------------------------------------------------- //

wiki_API.API_URL = 'https://zh.wikipedia.org/w/api.php?';

// 列舉型別 (enumeration)
// options.namespace: https://en.wikipedia.org/wiki/Wikipedia:Namespace
wiki_API.namespace = function(namespace) {
	if (namespace in wiki_API.namespace.hash)
		return wiki_API.namespace.hash[namespace];
	if (isNaN(namespace)) {
		if (namespace)
			library_namespace.warn('wiki_API.namespace: Illegal namespace: [' + namespace + ']');
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

wiki_API.query = function (action, callback, post_data) {
	var to_wait = Date.now() - wiki_API.query.last;
	if (to_wait < wiki_API.query.lag) {
		to_wait = wiki_API.query.lag - to_wait;
		library_namespace.debug('Waiting ' + to_wait + ' ms..', 1, 'wiki_API.query');
		setTimeout(function() {
			wiki_API.query(action, callback, post_data);
		}, to_wait);
		return;
	}

	library_namespace.debug(action, 1, 'wiki_API.query');
	if (!/^[a-z]+=/.test(action))
		action = 'action=' + action;

	wiki_API.query.last = Date.now();
	get_URL(wiki_API.API_URL + action, function(XMLHttp) {
		var response = XMLHttp.responseText;
		library_namespace.debug(response.replace(/</g, '&lt;'), 3, 'wiki_API.query');

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
				response = eval('(' + response + ');');
			} catch (e) {
				library_namespace.err('Illegal contents: [' + response + ']');
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
wiki_API.query.lag = 5000;

//---------------------------------------------------------------------//

// 讀取
// callback(title, contents, page_data, timestamp)
// timestamp: e.g., '2015-01-02T02:52:29Z'
wiki_API.page = function(title, callback) {
	// &rvexpandtemplates=1
	// prop=info|revisions
	wiki_API.query('query&prop=revisions&rvprop=content|timestamp&rvlimit=1&titles='
			+ encodeURIComponent(title), typeof callback === 'function'
	//
	&& function(data) {
		data = data.query.pages;
		// TODO: multi pages
		for ( var pageid in data) {
			var page = data[pageid], revision = page.revisions[0];
			callback(page.title, revision['*'], page, revision.timestamp);
		}
	});
};

//---------------------------------------------------------------------//

function get_list(prop, prefix, title, callback, namespace) {
	var options;
	if (library_namespace.is_Object(namespace))
		namespace = (options = namespace).namespace;
	else
		options = library_namespace.null_Object();

	if (isNaN(namespace = wiki_API.namespace(namespace)))
		delete options.namespace;
	else
		options.namespace = namespace;

	wiki_API.query('query&prop=' + prop + '&titles=' + encodeURIComponent(title)
	//
	+ (0 < options.limit ? '&' + prefix + 'limit=' + options.limit : '')
	//
	+ ('namespace' in options ? '&' + prefix + 'namespace=' + options.namespace : ''),

	typeof callback === 'function'
	//
	&& function(data) {
		data = data.query.pages;
		// TODO: multi pages
		for ( var pageid in data) {
			var page = data[pageid], titles = [];
			if (Array.isArray(page[prop]))
				page[prop].forEach(function(link) {
					// link.pageid
					titles.push(link.title);
				});

			library_namespace.debug('[' + page.title + ']: '
					+ titles.length + ' backlinks', 1,
					'wiki_API.backlinks');
			callback(page.title, titles);
		}
	});
}

// backlinks: 連結到 title 的頁面
// [[Special:Whatlinkshere]]
// https://zh.wikipedia.org/wiki/Help:%E9%93%BE%E5%85%A5%E9%A1%B5%E9%9D%A2
wiki_API.backlinks = function(title, callback, namespace) {
	get_list('linkshere', 'lh', title, callback, namespace);
};

wiki_API.fileusage = function(title, callback, namespace) {
	get_list('fileusage', 'fu', title, callback, namespace);
};

//---------------------------------------------------------------------//

// 登入
wiki_API.login = function(name, password, callback) {
	function _next() {
		if (typeof callback === 'function')
			callback(session.token.lgname);
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
				session.token.csrftoken = data.query.tokens.csrftoken;
				library_namespace.debug('csrftoken: ' + session.token.csrftoken, 1, 'wiki_API.login');
				_next();
			});
	}

	var session = new wiki_API(name, password, callback);

	wiki_API.query('assert=user', function(data) {
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

// 編輯
wiki_API.edit = function(title, text, token, options, callback, timestamp) {
	if (typeof text === 'function') {
		library_namespace.debug('先取得內容再 edit [' + title + ']。', 1, 'wiki_API.edit');
		wiki_API.page(title, function(title, contents, page_data, timestamp) {
			if (wiki_API.edit.denied(contents, options.bot_id, options.action)) {
				library_namespace.warn('wiki_API.edit: Denied to edit [' + title + ']');
				callback(title);
			} else {
				wiki_API.edit.set_stamp(options, timestamp);
				wiki_API.edit(title, text(contents), token, options, callback);
			}
		});
		return;
	}

	// 造出可 modify 的 options。
	library_namespace.debug('#1: ' + Object.keys(options).join(','), 4, 'wiki_API.edit');
	options = Object.assign({
		title : title,
		text : text
	}, options);
	wiki_API.edit.set_stamp(options, timestamp);
	//  the token should be sent as the last parameter.
	options.token = library_namespace.is_Object(token) ? token.csrftoken : token;
	library_namespace.debug('#2: ' + Object.keys(options).join(','), 4, 'wiki_API.edit');

	wiki_API.query('edit', function(data) {
		var error = data.error
		// 檢查伺服器回應是否有錯誤資訊。
		? '[' + data.error.code + '] ' + data.error.info
		//
		: data.edit && data.edit.result !== 'Success' && data.edit.result;
		if (error)
			library_namespace.warn('wiki_API.edit: Error to edit [' + title + ']: ' + error);
		else if ('nochange' in data.edit)
			library_namespace.info('wiki_API.edit: [' + title + ']: no change');
		if (typeof callback === 'function')
			error ? callback(title) : callback(title, text);
	}, options);
};

// 處理編輯衝突
// warning: will modify options!
// https://www.mediawiki.org/wiki/API:Edit
// to detect edit conflicts.
wiki_API.edit.set_stamp = function(options, timestamp) {
	//timestamp = '2000-01-01T00:00:00Z';
	if (timestamp) {
		library_namespace.debug(timestamp, 1, 'wiki_API.edit.set_stamp');
		options.basetimestamp = options.starttimestamp = timestamp;
	}
	return options;
};

// https://zh.wikipedia.org/wiki/Template:Bots
wiki_API.edit.get_bot = function(contents) {
	var bots = [], matched, PATTERN = /{{[\s\n]*bots[\s\n]*([\S][\s\S]*?)}}/ig;
	while (matched = PATTERN.exec(contents)){
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
wiki_API.edit.denied = function(contents, bot_id, action) {
	var bots = wiki_API.edit.get_bot(contents), denied;
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

	return denied || /{{[\s\n]*nobots[\s\n]*}}/i.test(contents);
};

// deny=all, !(allow=all)
wiki_API.edit.denied.all = /(?:^|[\s,])all(?:$|[\s,])/;

//---------------------------------------------------------------------//


return wiki_API;
}


});
