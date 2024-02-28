/**
 * @name CeL function for MediaWiki (Wikipedia / 維基百科): Toolforge only functions
 * 
 * @fileoverview 本檔案包含了 MediaWiki 自動化作業用程式庫的子程式庫。
 * 
 * 條件合適時，應該會由 CeL.application.net.wiki 載入。
 * 
 * TODO:<code>


</code>
 * 
 * @since 2019/10/11 拆分自 CeL.application.net.wiki
 */

// More examples: see /_test suite/test.js
// Wikipedia bots demo: https://github.com/kanasimi/wikibot
'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.wiki.Toolforge',

	require : 'data.native.|application.storage.' + '|application.net.wiki.'
	// load MediaWiki module basic functions
	+ '|application.net.wiki.namespace.',

	// 設定不匯出的子函式。
	no_extend : 'this,*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring
	var wiki_API = library_namespace.application.net.wiki, KEY_SESSION = wiki_API.KEY_SESSION;

	// ------------------------------------------------------------------------
	// SQL 相關函數 @ Toolforge。

	var
	/** {String}user home directory */
	home_directory = library_namespace.env.home,
	/** {String}Wikimedia Toolforge database host */
	TOOLSDB = 'tools-db',
	/** {String}user/bot name */
	user_name,
	/** {String}Wikimedia Toolforge name. CeL.wiki.wmflabs */
	wmflabs = wiki_API.wmflabs,
	/** {Object}Wikimedia Toolforge job data. CeL.wiki.job_data */
	job_data,
	/** node mysql handler */
	node_mysql,
	/** {Object}default SQL configurations */
	SQL_config;

	if (home_directory
			&& (home_directory = home_directory.replace(/[\\\/]$/, '').trim())) {
		user_name = home_directory.match(/[^\\\/]+$/);
		user_name = user_name ? user_name[0] : undefined;
		if (user_name) {
			wiki_API.user_name = user_name;
		}
		// There is no CeL.storage.append_path_separator() here!
		home_directory += library_namespace.env.path_separator;
	}

	// setup SQL config language (and database/host).
	function set_SQL_config_language(language) {
		if (!language) {
			return;
		}
		if (typeof language !== 'string') {
			library_namespace.error(
			//
			'set_SQL_config_language: Invalid language: [' + language + ']');
			return;
		}

		if (language === TOOLSDB) {
			this.host = language;
			// delete this.database;
			return;
		}

		// 正規化。
		var site = wiki_API.site_name(language);
		// TODO: 'zh.news'
		// 警告: this.language 可能包含 'zhwikinews' 之類。

		this.host = site + set_SQL_config_language.hostname_postfix;
		/**
		 * The database names themselves consist of the mediawiki project name,
		 * suffixed with _p
		 * 
		 * @see https://wikitech.wikimedia.org/wiki/Help:Toolforge/Database
		 */
		this.database = site + '_p';

		// console.log(this);
	}

	// https://wikitech.wikimedia.org/wiki/Help:Toolforge/Database#Connecting_to_the_database_replicas
	// .analytics.db.svc.wikimedia.cloud
	// @seealso https://phabricator.wikimedia.org/T142807
	set_SQL_config_language.hostname_postfix = '.web.db.svc.wikimedia.cloud';

	/**
	 * return new SQL config
	 * 
	 * @param {String}[language]
	 *            database language.<br />
	 *            e.g., 'en', 'commons', 'wikidata', 'meta'.
	 * @param {String}[user]
	 *            SQL database user name
	 * @param {String}[password]
	 *            SQL database user password
	 * 
	 * @returns {Object}SQL config
	 */
	function new_SQL_config(language, user, password) {
		var config, is_clone;
		if (user) {
			config = {
				user : user,
				password : password,
				db_prefix : user + '__',
				set_language : set_SQL_config_language
			};
		} else if (SQL_config) {
			is_clone = true;
			config = Object.clone(SQL_config);
		} else {
			config = {};
		}

		if (typeof language === 'object') {
			if (is_clone) {
				delete config.database;
			}
			if (language.API_URL) {
				// treat language as session.
				// use set_SQL_config_language()
				config.set_language(wiki_API.site_name(language), !user);
			} else {
				Object.assign(config, language);
			}
		} else if (typeof language === 'string' && language) {
			if (is_clone) {
				delete config.database;
			}
			// change language (and database/host).
			config.set_language(language, !user);
		}

		return config;
	}

	/**
	 * 讀取並解析出 SQL 設定。
	 * 
	 * @param {String}file_name
	 *            file name
	 * 
	 * @returns {Object}SQL config
	 */
	function parse_SQL_config(file_name) {
		var config;
		try {
			config = library_namespace.get_file(file_name);
		} catch (e) {
			library_namespace.error(
			//
			'parse_SQL_config: Cannot read config file [ ' + file_name + ']!');
			return;
		}

		// 應該用 parser。
		var user = config.match(/\n\s*user\s*=\s*(\S+)/), password;
		if (!user || !(password = config.match(/\n\s*password\s*=\s*(\S+)/)))
			return;

		return new_SQL_config(wiki_API.language, user[1], password[1]);
	}

	if (wmflabs) {
		try {
			node_mysql = require('mysql');
			if (node_mysql) {
				SQL_config = parse_SQL_config(home_directory
				// The production replicas.
				// https://wikitech.wikimedia.org/wiki/Help:Toolforge#The_databases
				// https://wikitech.wikimedia.org/wiki/Help:Toolforge/Database
				// Wikimedia Toolforge
				// 上之資料庫僅為正式上線版之刪節副本。資料並非最新版本(但誤差多於數分內)，也不完全，
				// <del>甚至可能為其他 users 竄改過</del>。
				+ 'replica.my.cnf');
			}
		} catch (e) {
			library_namespace.error(e);
		}

		if (process.env.JOB_ID && process.env.JOB_NAME) {
			// assert: process.env.ENVIRONMENT === 'BATCH'
			wiki_API.job_data = job_data = {
				id : process.env.JOB_ID,
				name : process.env.JOB_NAME,
				request : process.env.REQUEST,
				script : process.env.JOB_SCRIPT,
				stdout_file : process.env.SGE_STDOUT_PATH,
				stderr_file : process.env.SGE_STDERR_PATH,
				// 'continuous' or 'task'
				is_task : process.env.QUEUE === 'task'
			};
		}
	}

	// ------------------------------------------------------------------------

	/**
	 * execute SQL command.
	 * 
	 * @param {String}SQL
	 *            SQL command.
	 * @param {Function}callback
	 *            回調函數。 callback({Object}error, {Array}rows, {Array}fields)
	 * @param {Object}[config]
	 *            configuration.
	 * 
	 * @see https://wikitech.wikimedia.org/wiki/Help:Toolforge/Database
	 * 
	 * @require https://github.com/mysqljs/mysql <br />
	 *          https://quarry.wmflabs.org/ <br />
	 *          TODO: https://github.com/sidorares/node-mysql2
	 */
	function run_SQL(SQL, callback, config) {
		var _callback = function(error, results, fields) {
			// the connection will return to the pool, ready to be used again by
			// someone else.
			// connection.release();

			// close the connection and remove it from the pool
			// connection.destroy();

			callback(error, results, fields);
		};
		_callback = callback;

		// TypeError: Converting circular structure to JSON
		// library_namespace.debug(JSON.stringify(config), 3, 'run_SQL');
		if (!config && !(config = SQL_config)) {
			return;
		}

		// treat config as language.
		if (typeof config === 'string' || wiki_API.is_wiki_API(config)) {
			config = new_SQL_config(config);
		}

		library_namespace.debug(String(SQL), 3, 'run_SQL');
		// console.log(JSON.stringify(config));
		var connection = node_mysql.createConnection(config);
		connection.connect();
		if (Array.isArray(SQL)) {
			// ("SQL", [values], callback)
			connection.query(SQL[0], SQL[1], _callback);
		} else {
			// ("SQL", callback)
			connection.query(SQL, _callback);
		}
		connection.end();
	}

	if (false) {
		CeL.wiki.SQL('SELECT * FROM `revision` LIMIT 3000,1;',
		//
		function(error, rows, fields) {
			if (error)
				throw error;
			// console.log('The result is:');
			console.log(rows);
		});
	}

	// ------------------------------------------------------------------------

	/**
	 * Create a new user database.
	 * 
	 * @param {String}dbname
	 *            database name.
	 * @param {Function}callback
	 *            回調函數。
	 * @param {String}[language]
	 *            database language.<br />
	 *            e.g., 'en', 'commons', 'wikidata', 'meta'.
	 * 
	 * @see https://wikitech.wikimedia.org/wiki/Help:Tool_Labs/Database#Creating_new_databases
	 */
	function create_database(dbname, callback, language) {
		if (!SQL_config)
			return;

		var config;
		if (typeof dbname === 'object') {
			config = Object.clone(dbname);
			dbname = config.database;
			delete config.database;
		} else {
			config = new_SQL_config(language || TOOLSDB);
			if (!language) {
				delete config.database;
			}
		}

		library_namespace.log('create_database: Try to create database ['
				+ dbname + ']');
		if (false) {
			/**
			 * 用此方法會:<br />
			 * [Error: ER_PARSE_ERROR: You have an error in your SQL syntax;
			 * check the manual that corresponds to your MariaDB server version
			 * for the right syntax to use near ''user__db'' at line 1]
			 */
			var SQL = {
				// placeholder 佔位符
				// 避免 error.code === 'ER_DB_CREATE_EXISTS'
				sql : 'CREATE DATABASE IF NOT EXISTS ?',
				values : [ dbname ]
			};
		}

		if (dbname.includes('`'))
			throw new Error('Invalid database name: [' + dbname + ']');

		run_SQL('CREATE DATABASE IF NOT EXISTS `' + dbname + '`', function(
				error, rows, fields) {
			if (typeof callback !== 'function')
				return;
			if (error)
				callback(error);
			else
				callback(null, rows, fields);
		}, config);

		return config;
	}

	// ------------------------------------------------------------------------

	/**
	 * SQL 查詢功能之前端。
	 * 
	 * @example <code>

	// change language (and database/host).
	//CeL.wiki.SQL.config.set_language('en');
	CeL.wiki.SQL(SQL, function callback(error, rows, fields) { if(error) console.error(error); else console.log(rows); }, 'en');

	// get sitelink count of wikidata items
	// https://www.mediawiki.org/wiki/Wikibase/Schema/wb_items_per_site
	// https://www.wikidata.org/w/api.php?action=help&modules=wbsetsitelink
	var SQL_get_sitelink_count = 'SELECT ips_item_id, COUNT(*) AS `link_count` FROM wb_items_per_site GROUP BY ips_item_id LIMIT 10';
	var SQL_session = new CeL.wiki.SQL(function(error){}, 'wikidata');
	function callback(error, rows, fields) { if(error) console.error(error); else console.log(rows); SQL_session.connection.destroy(); }
	SQL_session.SQL(SQL_get_sitelink_count, callback);

	// one-time method
	CeL.wiki.SQL(SQL_get_sitelink_count, callback, 'wikidata');

	 * </code>
	 * 
	 * @example <code>

	// 進入 default host (TOOLSDB)。
	var SQL_session = new CeL.wiki.SQL(()=>{});
	// 進入 default host (TOOLSDB)，並預先創建 user's database 'dbname' (e.g., 's00000__dbname')
	var SQL_session = new CeL.wiki.SQL('dbname', ()=>{});
	// 進入 zhwiki.zhwiki_p。
	var SQL_session = new CeL.wiki.SQL(()=>{}, 'zh');
	// 進入 zhwiki.zhwiki_p，並預先創建 user's database 'dbname' (e.g., 's00000__dbname')
	var SQL_session = new CeL.wiki.SQL('dbname', ()=>{}, 'zh');

	// create {SQL_session}instance
	new CeL.wiki.SQL('mydb', function callback(error, rows, fields) { if(error) console.error(error); } )
	// run SQL query
	.SQL(SQL, function callback(error, rows, fields) { if(error) console.error(error); } );

	SQL_session.connection.destroy();

	 * </code>
	 * 
	 * @param {String}[dbname]
	 *            database name.
	 * @param {Function}callback
	 *            回調函數。 callback(error)
	 * @param {String}[language]
	 *            database language (and database/host). default host: TOOLSDB.<br />
	 *            e.g., 'en', 'commons', 'wikidata', 'meta'.
	 * 
	 * @returns {SQL_session}instance
	 * 
	 * @constructor
	 */
	function SQL_session(dbname, callback, language) {
		if (!(this instanceof SQL_session)) {
			if (typeof language === 'object') {
				language = new_SQL_config(language);
			} else if (typeof language === 'string' && language) {
				// change language (and database/host).
				SQL_config.set_language(language);
				if (language === TOOLSDB)
					delete SQL_config.database;
				language = null;
			}
			// dbname as SQL query string.
			return run_SQL(dbname, callback, language);
		}

		if (typeof dbname === 'function' && !language) {
			// shift arguments
			language = callback;
			callback = dbname;
			dbname = null;
		}

		this.config = new_SQL_config(language || TOOLSDB);
		if (dbname) {
			if (typeof dbname === 'object') {
				Object.assign(this.config, dbname);
			} else {
				// 自動添加 prefix。
				this.config.database = this.config.db_prefix + dbname;
			}
		} else if (this.config.host === TOOLSDB) {
			delete this.config.database;
		} else {
			// this.config.database 已經在 set_SQL_config_language() 設定。
		}

		var _this = this;
		this.connect(function(error) {
			// console.error(error);
			if (error && error.code === 'ER_BAD_DB_ERROR'
					&& !_this.config.no_create && _this.config.database) {
				// Error: ER_BAD_DB_ERROR: Unknown database '...'
				create_database(_this.config, callback);
			} else if (typeof callback === 'function') {
				callback(error);
			}
		});
	}

	// need reset connection,
	function need_reconnect(error) {
		return error
		// Error: Cannot enqueue Handshake after fatal error.
		&& (error.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR'
		// ECONNRESET: socket hang up
		|| error.code === 'ECONNRESET');
	}

	// run SQL query
	SQL_session.prototype.SQL = function(SQL, callback) {
		var _this = this;
		this.connection.query(SQL, function(error) {
			if (need_reconnect(error)) {
				// re-connect. 可能已經斷線。
				_this.connection.connect(function(error) {
					if (error) {
						// console.error(error);
					}
					_this.connection.query(SQL, callback);
				});
			} else {
				callback.apply(null, arguments);
			}
		});
		return this;
	};

	SQL_session.prototype.connect = function(callback, force) {
		if (!force)
			try {
				var _this = this;
				this.connection.connect(function(error) {
					if (need_reconnect(error)) {
						// re-connect.
						_this.connect(callback, true);
					} else if (typeof callback === 'function')
						callback(error);
				});
				return this;
			} catch (e) {
				// TODO: handle exception
			}

		try {
			this.connection.end();
		} catch (e) {
			// TODO: handle exception
		}
		// 需要重新設定 this.connection，否則會出現:
		// Error: Cannot enqueue Handshake after invoking quit.
		this.connection = node_mysql.createConnection(this.config);
		this.connection.connect(callback);
		return this;
	};

	/**
	 * get database list.
	 * 
	 * <code>

	var SQL_session = new CeL.wiki.SQL('testdb',
	//
	function callback(error, rows, fields) {
		if (error)
			console.error(error);
		else
			s.databases(function(list) {
				console.log(list);
			});
	});

	</code>
	 * 
	 * @param {Function}callback
	 *            回調函數。
	 * @param {Boolean}all
	 *            get all databases. else: get my databases.
	 * 
	 * @returns {SQL_session}
	 */
	SQL_session.prototype.databases = function(callback, all) {
		var _this = this;
		function filter(dbname) {
			return dbname.startsWith(_this.config.db_prefix);
		}

		if (this.database_cache) {
			var list = this.database_cache;
			if (!all)
				// .filter() 會失去 array 之其他屬性。
				list = list.filter(filter);
			if (typeof callback === 'function')
				callback(list);
			return this;
		}

		var SQL = 'SHOW DATABASES';
		if (false && !all)
			// SHOW DATABASES LIKE 'pattern';
			SQL += " LIKE '" + this.config.db_prefix + "%'";

		this.connect(function(error) {
			// reset connection,
			// 預防 PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR
			_this.connection.query(SQL, function(error, rows, fields) {
				if (error || !Array.isArray(rows)) {
					library_namespace.error(error);
					rows = null;
				} else {
					rows = rows.map(function(row) {
						for ( var field in row)
							return row[field];
					});
					_this.database_cache = rows;
					if (!all)
						// .filter() 會失去 array 之其他屬性。
						rows = rows.filter(filter);
					// console.log(rows);
				}
				if (typeof callback === 'function')
					callback(rows);
			});
		});

		return this;
	};

	if (SQL_config) {
		library_namespace
				.debug('wiki_API.SQL_session: You may use SQL to get data.');
		wiki_API.SQL = SQL_session;
		// export 導出: CeL.wiki.SQL() 僅可在 Wikimedia Toolforge 上使用。
		wiki_API.SQL.config = SQL_config;
		// wiki_API.SQL.create = create_database;
	}

	// ----------------------------------------------------

	/**
	 * Convert MediaWiki database timestamp to ISO 8601 format.<br />
	 * UTC: 'yyyymmddhhmmss' → 'yyyy-mm-ddThh:mm:ss'
	 * 
	 * @param {String|Buffer}timestamp
	 *            MediaWiki database timestamp
	 * 
	 * @returns {String}ISO 8601 Data elements and interchange formats
	 * 
	 * @see https://www.mediawiki.org/wiki/Manual:Timestamp
	 */
	function SQL_timestamp_to_ISO(timestamp) {
		if (!timestamp) {
			// ''?
			return;
		}
		// timestamp可能為{Buffer}
		timestamp = timestamp.toString('utf8').chunk(2);
		if (timestamp.length !== 7) {
			// 'NULL'?
			return;
		}

		return timestamp[0] + timestamp[1]
		//
		+ '-' + timestamp[2] + '-' + timestamp[3]
		//
		+ 'T' + timestamp[4] + ':' + timestamp[5] + ':' + timestamp[6] + 'Z';
	}

	// [wiki_API.run_SQL.KEY_additional_row_conditions]
	run_SQL.KEY_additional_row_conditions = '';

	function generate_SQL_WHERE(condition, field_prefix) {
		var condition_array = [], value_array = [];

		if (typeof condition === 'string') {
			;

		} else if (Array.isArray(condition)) {
			// TODO: for ' OR '
			condition = condition.join(' AND ');

		} else if (library_namespace.is_Object(condition)) {
			for ( var name in condition) {
				var value = condition[name];
				if (value === undefined) {
					// 跳過這一筆設定。
					continue;
				}
				if (name === run_SQL.KEY_additional_row_conditions) {
					// condition[run_SQL.KEY_additional_row_conditions] = [
					// condition 1, condition 2, ...];
					if (Array.isArray(value)) {
						condition_array.append(value);
					} else {
						condition_array.push(value);
					}
					continue;
				}

				if (!name || !/^[a-z_]+$/.test(name)) {
					throw new Error('Invalid field name: ' + name);
				}

				if (!name.startsWith(field_prefix)) {
					name = field_prefix + name;
				}
				var matched = typeof value === 'string'
				// TODO: for other operators
				// @see https://mariadb.com/kb/en/mariadb/select/
				// https://mariadb.com/kb/en/mariadb/functions-and-operators/
				&& value.match(/^([<>!]?=|[<>]|<=>|IN |IS )([\s\S]+)$/);
				if (matched) {
					name += matched[1] + '?';
					// DO NOT quote the value yourself!!
					value = matched[2];
					// Number.MAX_SAFE_INTEGER starts from 9.
					if (/^[+\-]?[1-9]\d{0,15}$/.test(value)
					// ↑ 15 = String(Number.MAX_SAFE_INTEGER).length-1
					&& +value <= Number.MAX_SAFE_INTEGER) {
						value = +value;
					}
				} else {
					name += '=?';
				}
				condition_array.push(name);
				value_array.push(value);
			}

			// TODO: for ' OR '
			condition = condition_array.join(' AND ');

		} else {
			library_namespace.error('Invalid condition: '
					+ JSON.stringify(condition));
			return;
		}

		return [ condition ? ' WHERE ' + condition : '', value_array ];
	}

	// ----------------------------------------------------

	// https://www.mediawiki.org/wiki/API:RecentChanges
	// const
	var ENUM_rc_type = 'edit,new,move,log,move over redirect,external,categorize';

	/**
	 * Get page title 頁面標題 list of [[Special:RecentChanges]] 最近更改.
	 * 
	 * @examples<code>

	// get title list
	CeL.wiki.recent(function(rows){console.log(rows.map(function(row){return row.title;}));}, {language:'ja', namespace:0, limit:20});

	// 應並用 timestamp + this_oldid
	CeL.wiki.recent(function(rows){console.log(rows.map(function(row){return [row.title,row.rev_id,row.row.rc_timestamp.toString()];}));}, {where:{timestamp:'>=20170327143435',this_oldid:'>'+43772537}});

	</code>
	 * 
	 * TODO: filter
	 * 
	 * @param {Function}callback
	 *            回調函數。 callback({Array}page title 頁面標題 list)
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項。
	 * 
	 * @see https://www.mediawiki.org/wiki/Manual:Recentchanges_table
	 *      https://www.mediawiki.org/wiki/Actor_migration
	 */
	function get_recent_via_databases(callback, options) {
		if (options && (typeof options === 'string')) {
			options = {
				// treat options as language
				language : options
			};
		} else {
			options = library_namespace.setup_options(options);
		}
		// console.trace(options);

		var SQL = options.SQL;
		if (!SQL) {
			SQL = Object.create(null);
			if (options.bot === 0 || options.bot === 1) {
				// assert: 0 || 1
				SQL.bot = options.bot;
			}
			// 不指定namespace，或者指定namespace為((undefined)): 取得所有的namespace。
			/** {Integer|String}namespace NO. */
			var namespace = wiki_API.namespace(options.namespace, options);
			if (namespace !== undefined) {
				SQL.namespace = namespace;
			}
			Object.assign(SQL,
			// {String|Array|Object}options.where: 自訂篩選條件。
			options.where);
			SQL = generate_SQL_WHERE(SQL, 'rc_');
			// console.log(SQL);

			// https://phabricator.wikimedia.org/T223406
			// TODO: 舊版上 `actor`, `comment` 這兩個資料表不存在會出錯，需要先偵測。
			// TODO: use JSON: https://phabricator.wikimedia.org/T299417
			var fields = [
					'*',
					// https://www.mediawiki.org/wiki/Manual:Actor_table#actor_id
					'(SELECT `actor_user` FROM `actor` WHERE `actor`.`actor_id` = `recentchanges`.`rc_actor`) AS `userid`',
					'(SELECT `actor_name` FROM `actor` WHERE `actor`.`actor_id` = `recentchanges`.`rc_actor`) AS `user_name`',
					// https://www.mediawiki.org/wiki/Manual:Comment_table#comment_id
					'(SELECT `comment_text` FROM `comment` WHERE `comment`.`comment_id` = `recentchanges`.`rc_comment_id`) AS `comment`',
					'(SELECT `comment_data` FROM `comment` WHERE `comment`.`comment_id` = `recentchanges`.`rc_comment_id`) AS `comment_data`' ];

			SQL[0] = 'SELECT ' + fields.join(',')
			// https://www.mediawiki.org/wiki/Manual:Recentchanges_table
			+ ' FROM `recentchanges`' + SQL[0]
			// new → old, may contain duplicate title.
			// or `rc_timestamp`
			// or rc_this_oldid, but too slow (no index).
			// ASC: 小 → 大，DESC: 大 → 小
			+ ' ORDER BY `rc_this_oldid` ASC LIMIT ' + (
			/** {ℕ⁰:Natural+0}limit count. */
			options.limit > 0 ? Math.min(options.limit
			// 筆數限制。就算隨意輸入，強制最多只能這麼多筆資料。
			, 1e4)
			// default records to get
			: options.where ? 1e4 : 5000);
		}

		if (false) {
			console.log([ options.config, options.language,
					options[KEY_SESSION] && options[KEY_SESSION].language ]);
			console.log(options[KEY_SESSION]);
			console.log(SQL);
			throw new Error(String(SQL));
		}

		run_SQL(SQL, function(error, rows, fields) {
			if (error) {
				callback();
				return;
			}

			var result = [];
			rows.forEach(function(row) {
				if (!(row.rc_user > 0) && !(row.rc_type < 5)
				//
				&& (!('rc_type' in options)
				//
				|| options.rc_type !== ENUM_rc_type[row.rc_type])) {
					// On wikis using Wikibase the results will otherwise be
					// meaningless.
					return;
				}

				var namespace_text = row.rc_namespace
				// pass session = options[KEY_SESSION]
				? wiki_API.namespace.name_of(row.rc_namespace, options) + ':'
						: '';
				// 基本上 API 盡可能模擬 recentchanges，與之一致。
				result.push({
					type : ENUM_rc_type[row.rc_type],
					// namespace
					ns : row.rc_namespace,
					// .rc_title 未加上 namespace prefix!
					title : (namespace_text
					// @see normalize_page_name()
					+ row.rc_title.toString()).replace(/_/g, ' '),
					// links to the page_id key in the page table
					// 0: 可能為flow. 此時title為主頁面名，非topic。由.rc_params可獲得相關資訊。
					pageid : row.rc_cur_id,
					// rev_id
					// Links to the rev_id key of the new page revision
					// (after the edit occurs) in the revision table.
					revid : row.rc_this_oldid,
					old_revid : row.rc_last_oldid,
					rcid : row.rc_id,
					user : row.user_name && row.user_name.toString()
					// text of the username for the user that made the
					// change, or the IP address if the change was made by
					// an unregistered user. Corresponds to rev_user_text
					//
					// `rc_user_text` deprecated: MediaWiki version: ≤ 1.33
					|| row.rc_user_text && row.rc_user_text.toString(),
					// NULL for anonymous edits
					userid : row.userid
					// 0 for anonymous edits
					// `rc_user` deprecated: MediaWiki version: ≤ 1.33
					|| row.rc_user,
					// old_length
					oldlen : row.rc_old_len,
					// new length
					newlen : row.rc_new_len,
					// Corresponds to rev_timestamp
					// use new Date(.timestamp)
					timestamp : SQL_timestamp_to_ISO(row.rc_timestamp),
					comment : row.comment && row.comment.toString()
					// `rc_comment` deprecated: MediaWiki version: ≤ 1.32
					|| row.rc_comment && row.rc_comment.toString(),
					// usually NULL
					comment_data : row.comment_data
							&& row.comment_data.toString(),
					// parsedcomment : TODO,
					logid : row.rc_logid,
					// TODO
					logtype : row.rc_log_type,
					logaction : row.rc_log_action.toString(),
					// logparams: TODO: should be {Object}, e.g., {userid:0}
					logparams : row.rc_params.toString(),
					// tags: ["TODO"],

					// 以下為recentchanges之外，本函數額外加入。
					is_new : !!row.rc_new,
					// e.g., 1 or 0
					// is_bot : !!row.rc_bot,
					// is_minor : !!row.rc_minor,
					// e.g., mw.edit
					is_Flow : row.rc_source.toString() === 'flow',
					// patrolled : !!row.rc_patrolled,
					// deleted : !!row.rc_deleted,

					row : row
				});
			});
			callback(result);
		},
		// SQL config
		options.config || options.language || options[KEY_SESSION]);
	}

	// 可能會因環境而不同的功能。讓 wiki_API.recent 採用較有效率的實現方式。
	if (SQL_config) {
		wiki_API.recent =
		// SQL_config ? get_recent_via_databases : get_recent_via_API;
		get_recent_via_databases;
	}

	// ------------------------------------------------------------------------

	// export 導出.

	// @inner
	library_namespace.set_method(wiki_API, {
		SQL_config : SQL_config,
		new_SQL_config : new_SQL_config,
		run_SQL : run_SQL
	});

	// 不設定(hook)本 module 之 namespace，僅執行 module code。
	return library_namespace.env.not_to_extend_keyword;
}
