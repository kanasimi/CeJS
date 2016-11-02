/**
 * @name CeL function for Node.js
 * @fileoverview 本檔案包含了 Node.js 專用的 functions。
 * @since
 */

'use strict';

if (typeof CeL === 'function')
	CeL.run({
		// TODO: 使用此名稱，在 include 時可能沖到原先的 CeL.platform!!
		name : 'application.platform.nodejs',
		code : function(library_namespace) {

			// http://nodejs.org/api/process.html
			if (!library_namespace.platform.nodejs) {
				library_namespace.warn('Error loading ' + this.name
						+ ': Not in Node.js?');
				// library_namespace.set_debug();
				library_namespace.debug('typeof process: ' + typeof process);
				library_namespace.debug('process.title: ' + process.title);
				library_namespace.debug('typeof global: ' + typeof global);
				library_namespace.debug('typeof require: ' + typeof require);

				return;
			}

			/**
			 * null module constructor
			 * 
			 * @class web 的 functions
			 */
			var _// JSDT:_module_
			= function() {
				// null module constructor
			};

			/**
			 * for JSDT: 有 prototype 才會將之當作 Class
			 */
			_// JSDT:_module_
			.prototype = {};

			var node_fs = require('fs');

			function copy_attributes(source, target) {
				var stat = node_fs.statSync(source);
				node_fs.utimesSync(target, stat.atime, stat.mtime);
			}
			_.copy_attributes = copy_attributes;

			function fs_copy(source, target, callback, overwrite) {
				if (!callback)
					callback = function(error) {
						// library_namespace.log(source + '\n->\n' +
						// target);
						if (error)
							library_namespace.error(error);
					};

				if (node_fs.existsSync(target))
					if (overwrite)
						node_fs.unlinkSync(path);
					else
						callback();

				// 2016/8/18 20:5:5	可採用 fs.ReadStream.prototype.bytesRead
				var source_stream = node_fs.createReadStream(source),
				//
				target_stream = node_fs.createWriteStream(target);

				source_stream.on("error", callback);
				target_stream.on("error", callback);
				target_stream.on("close", function() {
					copy_attributes(source, target);
					callback();
				});

				source_stream.pipe(target_stream);
			}
			_.fs_copy = fs_copy;

			// returns undefined if successful
			function fs_copySync(source, target, overwrite) {
				if (node_fs.existsSync(target))
					if (overwrite)
						node_fs.unlinkSync(target);
					else
						return new Error('Target file exists: [' + target
								+ ']!');

				var buffer_length = 1 * 1024 * 1024,
				//
				buffer = new Buffer(buffer_length),
				//
				source_descriptor = node_fs.openSync(source, 'r'),
				//
				target_descriptor = node_fs.openSync(target, 'w'),
				//
				bytesRead, position = 0;

				while (0 < (bytesRead
				//
				= node_fs.readSync(source_descriptor, buffer, 0, buffer_length,
						position))) {
					node_fs.writeSync(target_descriptor, buffer, 0, bytesRead);
					position += bytesRead;
				}
				node_fs.closeSync(source_descriptor);
				node_fs.closeSync(target_descriptor);

				copy_attributes(source, target);
			}
			_.fs_copySync = fs_copySync;

			/**
			 * create directory / directories
			 * 
			 * @param {String|Array}directories
			 *            directory name
			 * 
			 * @returns error count
			 */
			function create_directory(directories, mode) {
				// var node_fs = require('fs');
				var error = 0;
				if (typeof directories === 'string')
					directories = [ directories ];
				directories.forEach(function(directory_name) {
					try {
						node_fs.accessSync(directory_name, node_fs.F_OK
						//
						| node_fs.R_OK | node_fs.W_OK | node_fs.X_OK);
					} catch (e) {
						try {
							if (isNaN(mode))
								mode = parseInt('700', 8)
								//
								| (parseInt('777', 8) ^ process.umask());
							node_fs.mkdirSync(directory_name, mode);
						} catch (e) {
							if (e.code !== 'EEXIST')
								;
							error++;
						}
					}
				});
				return error;
			}
			_.fs_mkdir = create_directory;

			/** {String}path separator. e.g., '/', '\' */
			var path_separator = library_namespace.env.path_separator;
			/**
			 * remove path list.
			 * 
			 * @param {Array}list
			 *            path list.
			 * @param {Array}parent
			 *            parent directory
			 * 
			 * @returns error
			 * 
			 * @inner
			 */
			function remove_fso_list(list, parent) {
				if (parent && !/[\\\/]$/.test(parent))
					parent += path_separator;

				var error;
				list.some(function(fso_name) {
					// recurse
					return error = remove_fso(parent ? parent + fso_name
							: fso_name);
				});
				return error;
			}

			/**
			 * remove file / directory recursively.<br />
			 * TODO: 有時操作來不及，會出現錯誤，需要 flush disk cache。
			 * 
			 * @param {String|Array}path
			 *            file / directory name
			 * 
			 * @see https://github.com/isaacs/rimraf/blob/master/rimraf.js
			 */
			function remove_fso(path, callback) {
				var r = typeof callback === 'function' ? function(error) {
					callback(error);
					// normalize
					return error || undefined;
				} : function(error) {
					return error || undefined;
				};

				if (Array.isArray(path))
					return r(remove_fso_list(path));

				try {
					/**
					 * The lstat() system call is like stat() except in the case
					 * where the named file is a symbolic link, in which case
					 * lstat() returns information about the link, while stat()
					 * returns information about the file the link references.
					 */
					var stat = node_fs.lstatSync(path);
					// https://nodejs.org/api/fs.html#fs_class_fs_stats
					if (!stat.isDirectory()) {
						// delete file, link, ...
						node_fs.unlinkSync(path);
						return r();
					}

					var error
					//
					= remove_fso_list(node_fs.readdirSync(path), path);
					if (error)
						return r(error);

					// delete directory itself.
					node_fs.rmdirSync(path);

				} catch (e) {
					// https://nodejs.org/api/errors.html
					if (e.code === 'EPERM')
						// TODO: .chmodSync(path, 666) @ Windows??
						;
					if (e.code === 'EBUSY')
						// TODO
						;
					if (e.code !== 'ENOENT')
						return r(e);
				}

				return r();
			}
			_.fs_remove = remove_fso;

			/**
			 * fs.readFileSync() without throw.
			 * 
			 * @param {String}file_path
			 *            file path.
			 * @param {Object}[options]
			 *            附加參數/設定選擇性/特殊功能與選項
			 * 
			 * @returns {String}檔案內容
			 * @returns {Undefined}error occurred
			 */
			function fs_readFileSync(file_path, options) {
				try {
					return node_fs.readFileSync(file_path, options);
				} catch (e) {
					if (library_namespace.is_debug())
						library_namespace.err(e);
					// return e;
				}
			}
			_.fs_read = fs_readFileSync;

			// 取得 .json 檔案內容，並回傳 {Object} 或錯誤時回傳 undefined。
			function get_JSON_file(file_path, options) {
				if (!/\.[^.\\\.]+$/i.test(file_path)
				// auto add filename extension
				&& (!options || !options.no_add_extension)) {
					file_path += '.json';
				}
				var json = fs_readFileSync(file_path, options);
				try {
					if (json && (json = json.toString())) {
						return JSON.parse(json);
					}
				} catch (e) {
					// SyntaxError: Invalid JSON
				}
			}
			_.get_JSON = get_JSON_file;

			/**
			 * fs.writeFileSync() without throw.
			 * 
			 * @example <code>
			 * CeL.fs_write(path, data, 'utf8');
			 * </code>
			 * 
			 * @param {String}file_path
			 *            file path.
			 * @param data
			 *            data to write.
			 * @param {Object}[options]
			 *            附加參數/設定選擇性/特殊功能與選項
			 * 
			 * @returns error
			 */
			function fs_writeFileSync(file_path, data, options) {
				try {
					if (library_namespace.is_Object(data)
					//
					&& /.json$/i.test(file_path)) {
						// 自動將資料轉成 string。
						data = JSON.stringify(data);
					}
					node_fs.writeFileSync(file_path, data, options);
				} catch (e) {
					return e;
				}
			}
			_.fs_write = fs_writeFileSync;

			/**
			 * move file, fs.renameSync() without throw.
			 * 
			 * @param {String}old_path
			 *            old file path.
			 * @param {String}new_path
			 *            new file path.
			 * 
			 * @returns error
			 */
			function fs_renameSync(old_path, new_path) {
				try {
					node_fs.renameSync(old_path, new_path);
				} catch (e) {
					return e;
				}
			}
			_.fs_move = fs_renameSync;

			// --------------------------------------------

			if (false) {
				require('./_for include/node.loader.js');
				CeL.run('application.platform.nodejs');

				CeL.traverse_file_system('.',
						function(path, stat, is_directory) {
							console.log(path);
						}, /\.js$/);
			}

			// https://github.com/coolaj86/node-walk
			// https://github.com/oleics/node-filewalker/blob/master/lib/filewalker.js
			function traverse_file_system(path, handler, filter) {
				var list = node_fs.readdirSync(path);
				path += '/';
				list.forEach(function(name) {
					try {
						var full_path = path + name, stat = node_fs
								.lstatSync(full_path);
						// https://nodejs.org/api/fs.html#fs_class_fs_stats
						if (!stat.isDirectory()) {
							if (!filter || filter.test(full_path))
								handler(full_path, stat);
							return;
						}

						traverse_file_system(full_path, handler, filter);
						if (!filter || filter.test(full_path))
							handler(full_path, stat, true);

					} catch (e) {
						// https://nodejs.org/api/errors.html
						if (e.code === 'EPERM')
							// TODO: .chmodSync(path, 666) @ Windows??
							;
						if (e.code === 'EBUSY')
							// TODO
							;
						if (e.code !== 'ENOENT')
							;
					}
				});
			}

			_.traverse_file_system = traverse_file_system;

			// --------------------------------------------

			/**
			 * command line arguments 指令列參數
			 * 
			 * test code: <code>
			 * '-h|--help|-f=|--file=|-f=File|--file=File|File|file=File'.split('|').forEach(function(arg) { console.log(arg.match(/^(-{0,2})([^=]+?)(=(.*))?$/)); });
			 * </code>
			 */
			if (process.argv && process.argv.length > 2) {
				// CeL.env.argv: see module.js
				process.argv.slice(2).forEach(function(arg) {
					var matched = arg.match(/^(-{0,2})([^=]+?)(=(.*))?$/);
					if (matched[2].startsWith('-')) {
						console.warn(
						//
						'platform.nodejs: Invalid argument: [' + arg + ']');
						this[arg] = undefined;
						return;
					}

					if (!matched[3]) {
						this[matched[2]] = undefined;
						return;
					}

					this[matched[2]] = matched[4];
				}, library_namespace.env.arg_hash
				// ↑ use ((CeL.env.arg_hash)) to get command line arguments
				= library_namespace.null_Object());
			}

			// --------------------------------------------

			// TODO:
			// Buffer.prototype.indexOf()
			// https://github.com/nodejs/node/blob/master/lib/buffer.js#L578

			function export_function() {
				node_fs.copy = fs_copy;
				node_fs.copySync = fs_copySync;
			}
			_['export'] = export_function;

			// 當 require('fs') 得到同一 instance 時，才作 export。
			if (node_fs === require('fs'))
				export_function();

			return (_// JSDT:_module_
			);
		}

	});
