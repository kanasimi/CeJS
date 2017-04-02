/**
 * @name framework loader for node.js.
 * 
 * @fileoverview Example to include CeL (CeJS) in node.js. node.js 下之 CeL
 *               簡易加載器。本檔僅包括含入並運用 node.loader.js 的最精簡程式碼。
 * 
 * usage: See ../README.md
 */

typeof CeL !== 'function' && (function() {
	"use strict";

	var full_root = module.filename && module.filename.replace(/[^\\\/]+$/, ''),
	// WARNING: CeL_path_file should be an absolute path in some environment.
	CeL_path_file = (full_root || './') + '_CeL.path.txt',
	//
	node_fs = require('fs'), CeL_path_list = node_fs.readFileSync(CeL_path_file);
	if (!CeL_path_list || !(CeL_path_list = CeL_path_list.toString())) {
		console.error(
		//
		'Please set the absolute path list of CeL library in the file ['
		//
		+ CeL_path_file + ']!');
		return;
	}

	// ----------------------------------------------------------------------------
	// Load CeJS library. For node.js loading.
	// Copy/modified from "/_for include/_CeL.loader.nodejs.js".

	function check_path(path) {
		if (path.charAt(0) === '#') {
			// path is comments
			return;
		}
		try {
			// accessSync() throws if any accessibility checks fail, and does
			// nothing otherwise.
			node_fs.accessSync(path);
			var loader = '/_for include/node.loader.js';
			require(path + (path.indexOf('/') !== -1 ? loader
			//
			: loader.replace(/\//g, '\\')));
			return true;
		} catch (e) {
			// try next path
		}
		if (full_root && !/^(?:\/|[A-Z]:\\)/i.test(path)) {
			check_path(full_root + path);
		}
	}

	CeL_path_list.split(CeL_path_list.indexOf('\n') === -1 ? '|' : /\r?\n/)
	// 載入CeJS基礎泛用之功能。（如非特殊目的使用的載入功能）
	.some(check_path);

	// If no latest version found, try to use cejs module instead.
	if (typeof use_cejs_mudule === 'boolean'
	// Set "global.use_cejs_mudule = true;" if you need to do so anyway.
	&& use_cejs_mudule && typeof CeL !== 'function') {
		try {
			// 若有CeJS則用之。
			require('cejs');
			console.log('Load cejs module, require("cejs") instead!');
			return;

		} catch (e) {
		}

		console.error('Failed to load CeJS library!');
		// No CeJS library.
		throw '請先安裝 CeJS library:\nnpm install cejs';
	}

	if (typeof CeL !== 'function') {
		console.error('Failed to load CeL!');
		console.error('current working directory: ' + process.cwd());
		console.error('main script: ' + process.mainModule.filename);
		console.error('loader path: ' + module.filename);
	}

})();

// ----------------------------------------------------------------------------
// Load module.

// CeL.env.no_catch = true;
// CeL.set_debug(2);

// CeL.run([ 'data.code.compatibility' ]);
