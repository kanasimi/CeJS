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

			var fs = require('fs');

			function copy_attributes(source, target) {
				var stat = fs.statSync(source);
				fs.utimesSync(target, stat.atime, stat.mtime);
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

				if (fs.existsSync(target))
					if (overwrite)
						fs.unlinkSync(path);
					else
						callback();

				var source_stream = fs.createReadStream(source),
				//
				target_stream = fs.createWriteStream(target);

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
				if (fs.existsSync(target))
					if (overwrite)
						fs.unlinkSync(target);
					else
						return new Error('Target file exists: [' + target
								+ ']!');

				var buffer_length = 1 * 1024 * 1024,
				//
				buffer = new Buffer(buffer_length),
				//
				source_descriptor = fs.openSync(source, 'r'),
				//
				target_descriptor = fs.openSync(target, 'w'),
				//
				bytesRead, position = 0;

				while (0 < (bytesRead
				//
				= fs.readSync(source_descriptor, buffer, 0, buffer_length,
						position))) {
					fs.writeSync(target_descriptor, buffer, 0, bytesRead);
					position += bytesRead;
				}
				fs.closeSync(source_descriptor);
				fs.closeSync(target_descriptor);

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
				// var fs = require('fs');
				if (isNaN(mode))
					mode = fs.F_OK | fs.R_OK | fs.W_OK | fs.X_OK;
				var error = 0;
				directories.forEach(function(directory_name) {
					try {
						fs.accessSync(directory_name);
					} catch (e) {
						try {
							fs.mkdirSync(directory_name, mode);
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
				fs.copy = fs_copy;
				fs.copySync = fs_copySync;
			}
			_['export'] = export_function;

			// 當 require('fs') 得到同一 instance 時，才作 export。
			if (fs === require('fs'))
				export_function();

			return (_// JSDT:_module_
			);
		}

	});
