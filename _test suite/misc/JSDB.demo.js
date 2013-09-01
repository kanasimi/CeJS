//	usage:
//	jsdb "path/to/JSDB.demo.js"

var CeL = {
	library_path : "D:\\USB\\cgi-bin\\lib\\JS\\ce.js"
};
load(CeL.library_path);


CeL.run('data.math', function() {
	var n1 = 123, n2 = 123 * 3;
	CeL.log('GCD(' + n1 + ', ' + n2 + ') = ' + CeL.GCD(n1, n2));
});
