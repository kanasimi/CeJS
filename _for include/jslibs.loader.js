/**
 * @name framework loader for jslibs.
 * @example for including:<br />
 *          <code>
 * LoadModule('jsio');
 * 
 * eval(new File("path/to/jslibs.loader.js").Open('r').Read().replace(/\/\*.*?\*\//g, ''));
 * </code>
 * @since 2011/11/27 17:00:08
 * @see http://code.google.com/p/jslibs/
 */

"use strict";

try {

	if (typeof CeL !== 'function' && (typeof CeL !== 'object' || !CeL))
		Function('return this')().CeL = {};

	// main lib path relative to the loader script.
	CeL.library_path = '../ce.js';

	if (!CeL.loader_script)
		CeL.loader_script = arguments[0], CeL.loader_arguments = arguments;

	(function() {

		LoadModule('jsio');

		var script_code = [], main_lib_binary = new File(/^[\\\/]/
				.test(CeL.library_path) ? CeL.library_path : CeL.loader_script
				.replace(/[^\\\/]+$/, CeL.library_path)).Open('r').Read();

		// .charCodeAt() @ jslibs: -128~127

		// _configuration.stdout( main_lib_binary.length );

		// a simplified .get_file() for UTF-32.
		var c1, c2, i = 2, l = main_lib_binary.length;
		for (; i < l;) {
			c1 = main_lib_binary.charCodeAt(i++);
			if (c1 < 0)
				c1 += 256;
			c2 = main_lib_binary.charCodeAt(i++);
			if (c2 < 0)
				c2 += 256;
			script_code.push(String.fromCharCode(c1 + 256 * c2));
		}

		CeL.library_code = script_code.join('');
		// _configuration.stdout(script_code.slice(0,300));

	})();

	eval(CeL.library_code);
	// _configuration.stdout('CeL: ' + typeof CeL);
	// _configuration.stdout(CeL.set_debug);

	delete CeL.get_old_namespace().script_code;

} catch (e) {
	_configuration.stderr(e);
}

if (false && typeof CeL === 'function') {
	CeL.set_debug();

	CeL.run('data.math', function() {
		var n1 = 123, n2 = 234;
		CeL.log('GCD(' + n1 + ', ' + n2 + ') = ' + CeL.GCD(n1, n2));
	});
}
