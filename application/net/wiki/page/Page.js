/**
 * @name CeL function for MediaWiki (Wikipedia / 維基百科): Page
 * 
 * @fileoverview 本檔案包含了 MediaWiki 自動化作業用程式庫的子程式庫。
 * 
 * TODO:<code>

</code>
 * 
 * @since
 * 
 * @see https://mwn.toolforge.org/docs/interfaces/_page_.mwnpage.html
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

	require : 'data.code.compatibility.'
	//
	+ '|application.net.wiki.page.'
	//
	+ '|application.net.wiki.list.',

	// 設定不匯出的子函式。
	no_extend : 'this,*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring
	var wiki_API = library_namespace.application.net.wiki, KEY_SESSION = wiki_API.KEY_SESSION;
	// @inner
	// var get_namespace = wiki_API.namespace;

	// ------------------------------------------------------------------------

	if (false) {
		// call new_Page()
		page = wiki_session.Page(page_title);
		// {Number}p.ns
		// {String}p.title

		// await page.backlinks({get_list:true}) will get {Array}list.
		// page.backlinks() is asyncIterator
		//
		// https://www.codementor.io/@tiagolopesferreira/asynchronous-iterators-in-javascript-jl1yg8la1
		// https://stackoverflow.com/questions/55531247/using-javascripts-symbol-asynciterator-with-for-await-of-loop
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
		// for await (const page_data of page.backlinks()) {
		// console.log(page_data); }

		// TODO:

		// typeof await(page.content() || page.read()) === 'string';

		typeof page.wikitext === 'string';

		// page.fetch() is asyncIterator 泛用方法 相當於 wiki.query()

		// page.revisions() is asyncIterator

		// typeof await(page.is_biography()) === 'boolean';
	}

	function Page(page_title, options, session) {
		this[KEY_SESSION] = session;

		if (wiki_API.is_page_data(page_title)) {
			Object.assign(this, page_title);
			return;
		}

		// page_data 之 structure 按照 wiki API 本身之 return
		// page_data = {pageid,ns,title,revisions:[{revid,timestamp,'*'}]}
		Object.assign(this, {
			// pageid : 0,
			ns : session.namespace(page_title) || 0,
			title : session.normalize_title(page_title)
		});
	}

	function set_options_session(options) {
		var session = this[KEY_SESSION];
		options = wiki_API.add_session_to_options(session, options);
		return options;
	}

	// ------------------------------------------------------------------------

	function Page__content(options) {
		options = set_options_session.call(this, options);
		if (this.revisions) {
			return wiki_API.content_of(this, options);
		}

		var promise = new Promise(function executor(resolve, reject) {
			wiki_API.page(wiki_API.is_page_data(this) ? this : this.title,
			//
			function(page_data, error) {
				if (error) {
					reject(error);
					return;
				}
				if (!page_data.revisions) {
					reject(new Error('No .revisions get!'));
					return;
				}
				Object.assign(this, page_data);
				// console.trace(this);
				return resolve(wiki_API.content_of(this, options));
			}.bind(this), options);
		}.bind(this));
		return promise;
	}

	// ------------------------------------------------------------------------

	function Page__check_stop(options) {
		// Copy from wiki_API.prototype.next.edit
		var promise = new Promise(function executor(resolve, reject) {
			wiki_API.check_stop(function(task_status, error) {
				if (error)
					reject(error);
				else
					resolve(task_status);
			}, add_session_to_options(this, options));
		}.bind(this));

		return promise;
	}

	function Page__edit(content, options) {
		options = set_options_session.call(this, options);
		var session = this[KEY_SESSION];
		var check_task_id = wiki_API.get_task_id(wiki_API
				.add_session_to_options(session, options))
				|| wiki_API.check_stop.KEY_any_task;

		// Copy from wiki_API.prototype.next.edit
		var promise = new Promise(function executor(resolve, reject) {
			if (session.task_control_status[check_task_id]
					&& session.task_control_status[check_task_id].stopped
					&& !options.skip_stopped) {
				library_namespace.warn('Page__edit: 已停止作業，放棄編輯'
						+ wiki_API.title_link_of(this) + '！');
				reject(new Error('放棄編輯'));
				return;
			}

			if (this.is_Flow) {
				reject(new Error(new Error('NYI: flow page')));
			}

			if (options.skip_nochange
			// 採用 skip_nochange 可以跳過實際 edit 的動作。
			&& content === wiki_API.content_of(this)) {
				library_namespace.debug('Skip '
				//
				+ wiki_API.title_link_of(this)
				// 'nochange', no change
				+ ': The same content.', 1, 'Page__edit');
				resolve('The same content');
				return;
			}

			// console.trace([ this, wiki_API.is_page_data(this), session.token
			// ]);
			wiki_API.edit([ session.API_URL,
			//
			wiki_API.is_page_data(this) ? this : this.title ], content,
			//
			session.token, options, function wiki_API_Page_edit_callback(title,
					error, result) {
				if (error) {
					reject(error);
					return;
				}
				resolve(result);
			});
		}.bind(this));

		if (!session.task_control_status[check_task_id]) {
			promise = Page__check_stop.call(this, options).then(promise);
		}

		if (typeof content === 'function')
			return this.content().then(promise);

		return promise;
	}

	// ------------------------------------------------------------------------

	function Page__list(options) {
		options = set_options_session.call(this, options);
		// options.type, options[KEY_SESSION] are setted in Page__list_async()
		var promise = new Promise(function executor(resolve, reject) {
			wiki_API.list(wiki_API.is_page_data(this) ? this : this.title,
			//
			function(pages, target, options) {
				if (pages.error)
					reject(pages.error);
				else
					resolve(pages);
			}, options);
		}.bind(this));
		return promise;
	}

	var Symbol_asyncIterator = typeof Symbol === 'function'
			&& Symbol.asyncIterator;

	var done_object = {
		// value : generator.page_count,
		done : true
	};

	function Page__list_async(method, options) {
		options = set_options_session.call(this, options);
		options.type = method;
		if (!Symbol_asyncIterator || options && options.get_list) {
			return Page__list.call(this, options);
		}

		// --------------------------------------

		var list_generator = Object.create(null);
		list_generator[Symbol_asyncIterator] = (function() {
			function get_next_object() {
				return {
					value : generator.queue.shift(),
					done : false
				};
			}

			var generator = {
				queue : [],
				next : function() {
					if (generator.resolve) {
						throw new Error(
								'Call resolve() before latest promise resolved');
					}

					if (generator.queue.length > 0) {
						// 執行順序3: 中間最多的是這個程序一直反覆 loop
						return Promise.resolve(get_next_object());
					}

					// assert: generator.queue.length === 0
					if (generator.done) {
						// 執行順序4: 最後一次 iterate
						return Promise.resolve(done_object);
					}

					// 執行順序1
					return new Promise(function(resolve, reject) {
						generator.resolve = resolve;
					});
				}
			};

			options.for_each_page = function(item) {
				generator.queue.push(item);
				var resolve = generator.resolve;
				if (resolve) {
					delete generator.resolve;
					// 執行順序2
					resolve(get_next_object());
				}
			};
			wiki_API.list(wiki_API.is_page_data(this) ? this : this.title,
			//
			function(list) {
				// generator.page_count = list.length;
				generator.done = true;
				var resolve = generator.resolve;
				if (resolve) {
					// 基本上不會執行到這邊 @ node.js
					delete generator.resolve;
					resolve(done_object);
				}
			}, options);

			return generator;
		}).bind(this);
		return list_generator;
	}

	// ------------------------------------------------------------------------

	// export 導出.

	Object.assign(wiki_API.prototype, {
		new_Page : function new_Page(page_title, options) {
			return new Page(page_title, options,/* session */this);
		},
		Page : Page
	});

	wiki_API.list.type_list.forEach(function(method) {
		// if (!method.includes('all'))
		Page.prototype[method] = function Page__list_frontend(options) {
			return Page__list_async.call(this, method, options);
		};
	});

	Object.assign(Page.prototype, {
		content : Page__content,
		edit : Page__edit
	});

	return Page;
}
