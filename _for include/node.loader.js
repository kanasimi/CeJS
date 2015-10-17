/**
 * @name framework loader for node.js.
 * 
 * @example
 * 
 * for including:<br />
 * <code>
 * require("path/to/node.loader.js");
 * </code>
 * 
 * @since 2011/11/26 23:33:32
 * @see http://nodejs.org/
 */

"use strict";

if (false) {
	// examples

	// Copy this section in front of the script. Path list from /path.txt/.
	// @see node.demo.js

	"use strict";

	// ----------------------------------------------------------------------------
	// For node.js loading. Copy from /_for include/node.loader.js.
	// 載入泛用（非特殊目的使用）之功能。
	'D:\\USB\\cgi-bin\\lib\\JS|C:\\USB\\cgi-bin\\lib\\JS|H:\\cgi-bin\\lib\\JS|/home/kanashimi/www/cgi-bin/lib/JS'
	//
	.split('|').some(function(path) {
		if (path.charAt(0) !== '#' && require('fs').existsSync(path)) {
			var loader = '/_for include/node.loader.js';
			require(path + (path.indexOf('/') !== -1 ? loader
			//
			: loader.replace(/\//g, '\\')));
			return true;
		}
	});
	// ----------------------------------------------------------------------------

	CeL.run([ 'data.code.compatibility' ]);
}

// ---------------------------------------------------------------------//

try {
	// http://nodejs.org/api/globals.html
	// node.js requires this method to setup REALLY global various:
	// require isn't actually a global but rather local to each module.
	Function('return this')().CeL = {
		// main lib path relative to the loader script.
		library_path : '../ce.js'
	};
	if (false && !global.require && typeof require === 'funtion')
		global.require = require;

	(function() {

		var script_code = [], fs = require('fs'),
		// http://nodejs.org/api/fs.html#fs.readFileSync
		main_lib_binary = fs
				.readFileSync(/^[\\\/]/.test(CeL.library_path) ? CeL.library_path
						: __filename.replace(/[^\\\/]+$/, CeL.library_path)
				// The encoding can be 'utf8', 'ascii', or 'base64'.
				// http://nodejs.org/api/fs.html#fs_fs_createreadstream_path_options
				// , 'binary'
				),
		// pass the first 2 bytes (BOM)
		i = 2, l =
		// 10
		main_lib_binary.length;

		// console.log(typeof main_lib_binary.length);

		// a simplified .get_file() for UTF-32.
		for (; i < l;) {
			// console.log(main_lib_binary[i] + ',' + main_lib_binary[i + 1]);
			script_code.push(String.fromCharCode(main_lib_binary[i++] + 256
					* main_lib_binary[i++]));
		}

		CeL.library_code = script_code.join('');

		if (false) {
			console.log(script_code.length);
			// console.log(script_code.slice(0, 30));
			console.log('[' + script_code.slice(0, 300)
			// .replace(/[\x00-\x1f]/g, '.')
			.replace(/[\u0100-\uffff]/g, '.')
			// .charCodeAt(0)
			+ ']');
		}

	})();

	eval(CeL.library_code);
	if (false) {
		console.log('CeL === global.CeL: ' + (CeL === global.CeL));
		console.log('typeof CeL: ' + typeof CeL);
		console.log('CeL: ' + CeL);
		console.log('CeL.set_debug: ' + CeL.set_debug);
	}

	// delete cache.
	delete CeL.get_old_namespace().script_code;

	// for npm
	module.exports = CeL;

} catch (e) {
	console.error(e);
}

// CeL.run('application.platform.nodejs', 'data.CSV');

if (false && typeof CeL === 'function') {
	CeL.set_debug();

	if (false)
		console.log(CeL.get_file('data.js').slice(0, 300).replace(
				/[\u0100-\uffff]/g, '.'));

	CeL.run('data.math', function() {
		var n1 = 123, n2 = 234;
		CeL.log('GCD(' + n1 + ', ' + n2 + ') = ' + CeL.GCD(n1, n2));
	});
}
