/**
 * @name framework loader for node.js.
 * 
 * @fileoverview Example to include CeL (CeJS) in node.js. node.js 下之 CeL
 *               簡易加載器。本檔僅包括含入並運用 node.loader.js 的最精簡程式碼。<br />
 *               Copy from:
 *               https://github.com/kanasimi/CeJS/blob/master/_for%20include/_CeL.loader.nodejs.js
 * 
 * usage: See ../README.md
 */

typeof CeL !== 'function' && (function() {
	"use strict";

	var full_root =
	// require('electron').app.getPath('userData')
	module.filename
	// TODO:
	// https://www.electronjs.org/docs/latest/api/app#appgetpathname
	// https://stackoverflow.com/questions/71365401/how-to-read-config-file-in-electronjs-app
	&& module.filename.replace(/[^\\\/]+$/, ''),
	// WARNING: repository_path_list_file should be an absolute path in some
	// environment.
	repository_path_list_file
	//
	= (full_root || './') + '_repository_path_list.txt',
	//
	matched = full_root.match(/^(.+?[\\\/])_for include[\\\/]$/),
	//
	node_fs = require('fs'),
	//
	CeL_path_list = node_fs.readFileSync(repository_path_list_file);
	CeL_path_list = CeL_path_list && CeL_path_list.toString() || '';

	if (matched) {
		// `CeL_path_list` should not be "" here,
		// but it doesn’t matter.

		// 直接 require 函式庫下面的本檔案。 e.g.,
		// require('path\\JS\\_for include\\_CeL.loader.nodejs.js');
		// 如此可以不依靠 repository_path_list_file。
		// ** 這時應該採用: require('path/to/node.loader.js');
		CeL_path_list += '\n' + matched[1];
	}

	if (!CeL_path_list) {
		console.error(
		//
		'Please set the absolute path list of CeL library in the file ['
		//
		+ repository_path_list_file + ']!');
		return;
	}

	// ----------------------------------------------------------------------------
	// Load CeJS library. For node.js loading.
	// Copy/modified from "/_for include/_CeL.loader.nodejs.js".

	function check_path(path) {
		path = path.trim();
		if (!path || path.charAt(0) === '#') {
			// path is comments or blank line
			return;
		}
		// console.log('Try path: ' + JSON.stringify(path));
		try {
			// old node.js has no method 'accessSync'.
			// accessSync() added in: v0.11.15
			if (node_fs.accessSync) {
				// accessSync() throws if any accessibility checks fail,
				// and does nothing otherwise.
				node_fs.accessSync(path);
			} else if (!node_fs.existsSync(path)) {
				throw 'ENOENT';
			}

			if (!/[^\\\/]$/.test(path)) {
				path += require('path').sep;
			}
			if (typeof global.CeL !== 'function'
			//
			&& (typeof global.CeL !== 'object' || !CeL)) {
				global.CeL = {};
			}
			CeL.library_path = path + 'ce.js';

			var loader = '/_for include/node.loader.js';
			loader = path + (path.indexOf('/') !== -1 ? loader
			//
			: loader.replace(/\//g, '\\'));
			// console.log('Try loader path: ' + loader);
			require(loader);
			return CeL.version;
		} catch (e) {
			// console.error(e);
			// try next path
		}

		// Try the file below loader for relative path.
		if (full_root && !/^(?:\/|[A-Z]:\\)/i.test(path)) {
			return check_path(full_root + path);
		}
	}

	CeL_path_list.split(CeL_path_list.indexOf('\n') === -1 ? '|' : /\r?\n/)
	// 載入CeJS基礎泛用之功能。（例如非特殊目的使用的載入功能）
	.some(check_path);

	// If no latest version found, try to use cejs module instead.
	if (typeof use_cejs_mudule === 'boolean'
	// Set "global.use_cejs_mudule = true;" if you need to do so anyway.
	&& use_cejs_mudule && typeof CeL !== 'function') {
		try {
			// 若有 CeJS 則用之。
			require('cejs');
			console.log('cejs loader: use npm, not the latest version!');
			return;

		} catch (e) {
			// console.error(e);
		}

		console.error('Failed to load CeJS library!\n');
		console.info('Please install CeJS library first.'
		//
		+ ' 請先安裝 CeJS library:\n' + 'npm install cejs\n\n'
		//
		+ 'Or you may trying the latest version:\n'
		//
		+ 'See https://github.com/kanasimi/CeJS');
		throw 'No CeJS library';
	}

	if (typeof CeL !== 'function') {
		console.error('Failed to load CeL!');
		console.error('current working directory: ' + process.cwd());
		console.error('main script: '
		//
		+ (require.main && require.main.filename));
		console.error('loader path: ' + module.filename);
	}

})();

// ----------------------------------------------------------------------------
// Load module.

// CeL.env.no_catch = true;
// CeL.set_debug(2);

// CeL.run([ 'data.code.compatibility' ]);
