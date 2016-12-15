var download = require('./download');

function inst(ver) {
	return download(ver);
}

module.exports = inst;
inst().then(function(result) {
	console.log(result);
});
