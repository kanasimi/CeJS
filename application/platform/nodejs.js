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

			// TODO:
			// move file

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
