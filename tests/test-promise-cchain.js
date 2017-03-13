const PromiseCChain = require('../index.js')


const pt = function(time) {
	console.log(`Building Promise factory for ${time}`);
	return function(context) {
		console.log(`Factory Returning promise for ${time}`);
		return new Promise(function (resolve, reject) {
			console.log(`Building Timeout for ${time}`);
			setTimeout(function () {
				console.log(`Timeout for ${time} expired`);
				resolve(context);
			}, time);
		});
	}
}

const factories1 = [
	pt(1000),
	pt(2000),
	pt(3000),
	pt(4000)
];

const factories2 = [
	pt(5000),
	pt(4000),
	pt(3000),
	pt(2000)
];

const topfactories = [
	PromiseCChain.factory(factories1),
	PromiseCChain.factory(factories2),
]

const pc = PromiseCChain.factory(topfactories);

pc({}).then(
	function() {
		console.log('DONE');
	}
).catch(function (err) {
	console.log('UHOH', err, err.stack);
	throw err;
})
