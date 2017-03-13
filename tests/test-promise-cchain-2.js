const PromiseCChain = require('../index.js')

/*
 * A function that returns a task-runner function (a function that accepts a context returns a Promise)
 */
const gereate_timeout_task = function(time) {
        console.log(`Creating task for timeout for ${time}`);
        return function(context) {
            console.log(`Running task for timeout for ${time}`);
            return new Promise(function (resolve, reject) {
                console.log(`Setting timeout for ${time}`);
                setTimeout(function () {
                        console.log(`Timeout for ${time} expired`);
				                resolve(context);
                }, time);
            });
        }
    };

/*
 * Generate task functions that wait for 1, 2, 3, and 4 seconds
 */
const tasks = [
	gereate_timeout_task(1000),
	gereate_timeout_task(2000),
	gereate_timeout_task(3000),
	gereate_timeout_task(4000)
];

/*
 * Runt them as a chain
 */
PromiseCChain.factory(tasks)({context: "this is the initial context"}).then(
    function() {console.log('DONE');}
).catch(function (err) {
    console.log('UHOH', err, err.stack);
	throw err;
})
