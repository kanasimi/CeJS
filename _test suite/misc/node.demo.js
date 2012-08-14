//	usage:
//	node "path/to/node.demo.js"

require("../_for include/node.loader.js");

CeL.set_run('data.math', function() {
	var n1 = 123, n2 = 234;
	CeL.log('GCD(' + n1 + ', ' + n2 + ') = ' + CeL.GCD(n1, n2));
});
