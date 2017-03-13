'use strict'

function PromiseCChain(promiseFactories) {
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

PromiseCChain.factory = function (factories) {

	const pc = new PromiseCChain(factories);

	return function(context) {
		if (!context) {
			context = {};
		}
		return pc.steps.reduce(function(promiseCChain, step) {
			return promiseCChain.then(function(data) {
				return step(context);
			});
		}, Promise.resolve());
	}
}

module.exports = PromiseCChain;
