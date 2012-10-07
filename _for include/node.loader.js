/**
 * @name framework loader for node.js.
 * @example
 * for including:<br />
 * <code>
 * require("path/to/node.loader.js");
 * </code>
 * @since 2011/11/26 23:33:32
 * @see	http://nodejs.org/
 */


try {
	//	node.js requires this method to setup REALLY global various: require isn't actually a global but rather local to each module.
	Function('return this')().CeL = {
		// main lib path relative to the loader script.
		library_path : '../ce.js'
	};

	(function() {

		var script_code = [], fs = require('fs'),
		// http://nodejs.org/docs/latest/api/fs.html#fs.readFileSync
		main_lib_binary =
			fs.readFileSync(/^[\\\/]/.test(CeL.library_path) ? CeL.library_path
						: __filename.replace(/[^\\\/]+$/, CeL.library_path)
				// encoding can be 'utf8', 'ascii', or 'base64'.
				// , 'binary'
				),
		// pass the first 2 bytes (BOM)
		i = 2, l =
		// 10
		main_lib_binary.length;

		// console.log(typeof main_lib_binary.length);

		//	a simplified .get_file() for UTF-32.
		for (; i < l;) {
			// console.log(main_lib_binary[i] + ',' + main_lib_binary[i + 1]);
			script_code.push(String.fromCharCode(main_lib_binary[i++] + 256
					* main_lib_binary[i++]));
		}

		CeL.library_code = script_code.join('');

		if (0) {
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
	if (0) {
		console.log('CeL === global.CeL: ' + (CeL === global.CeL));
		console.log('typeof CeL: ' + typeof CeL);
		console.log('CeL: ' + CeL);
		console.log('CeL.set_debug: ' + CeL.set_debug);
	}

	//	delete cache.
	delete CeL.get_old_namespace().script_code;

} catch (e) {
	console.error(e);
}

if (0 && typeof CeL === 'function') {
	CeL.set_debug();

	if(0)
		console.log(CeL.get_file('data.js')
			.slice(0, 300)
			.replace(/[\u0100-\uffff]/g, '.'));

	CeL.set_run( 'data.math', function() {
		var n1 = 123, n2 = 234;
		CeL.log('GCD(' + n1 + ', ' + n2 + ') = ' + CeL.GCD(n1, n2));
	});
}
