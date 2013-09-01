//	usage:
//	jshost "path/to/jslibs.demo.js"

LoadModule('jsio');

eval(new File(
		//'../../_for include/jslibs.loader.js'
		"D:\\USB\\cgi-bin\\lib\\JS\\_for include\\jslibs.loader.js"
		).Open('r').Read()
		//	jslibs needs this, and string == string.replace(..)!
		.replace(/\/\*.*?\*\//g, '')
		);

CeL.run('data.math', function() {
	var n1 = 123, n2 = 123 * 3;
	CeL.log('GCD(' + n1 + ', ' + n2 + ') = ' + CeL.GCD(n1, n2));
});
