'use strict'

function PromiseChain(promiseFactories) {
	this.steps = promiseFactories.map(
		function(step) {
			if (typeof step === 'string')
				return require(step)
			else if (typeof step === 'function')
				return step
			else
				throw "factory must be a function that returns a promise, or the name of a module to require which returns a function that returns a promise";
		}
	);
}

PromiseChain.factory = function (factories) {

	const pc = new PromiseChain(factories);

	return function(context) {
		if (!context) {
			context = {};
		}
		return pc.steps.reduce(function(promiseChain, step) {
			return promiseChain.then(function(data) {
				return step(context);
			});
		}, Promise.resolve());
	}
}

module.exports = PromiseChain;
