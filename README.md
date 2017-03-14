# promise-command-chain
A way to control the sequencing of a number of tasks that use promises, but which depend upon the outcome of each other.

This is partially inspired by the [Commons-Chain implementation of the Chain Of Command pattern for Java](http://commons.apache.org/proper/commons-chain/).

The idea is that you have a number of tasks (or commands in the terminology of the pattern) that here, typically, use Promises. 
However these tasks 

* need to be run in a sequence,
* (optionally) need to pass information to each other, and
* (optionally) can "short cut" the chain into terminating

So the idea is to dynamically construct a chain of Promises by adding to the chain only when the previous
Promise is resolved. 

* A context object is made available to each "task" and can be used to communicate between tasks.
* The promise resolution data from the previous Promise is also made available to the next task.
* A promise that resolves exactly to the value of `true` (i.e. `value === true`) will stop the chain (this is consistent with
the way chains are stopped in Commons Chain, the logic being that the "command" has indicated that it has fully handled the request)

The base logic for this is fairly simple, but it's not a "one-liner", so having a "one-liner" to do it is
handy (IMHO).

## Prereqs
None.

## Installation
```bash
npm install promise-command-chain
```

## Usage
1. Construct a number of `tasks` - these are functions that accept an object (the context) as an argument (and, optionally, a second argument
which is the resolution value of the previous promise), and return a Promise.

   ```javascript
   const wait10Seconds = function(context, previous_promise_value) {
      return new Promise(function (resolve, reject) {
          setTimeout(function () {
              resolve("timeout done");
          }, 10000);
      });
   }
   ```
   That's ridiculously facile but hopefully demostrative - the function itself can do anything so long as it returns a Promise, the 
   resolution of which will trigger the text step in the chain, or the end of the chain (e.g. a number of simultanious asynchronous
   tasks encapsulated in a `Promise.all` set). The developer is responsible for maintianing the context's coherence within
   each task.

2. Add these functions to an array.
3. Call `PromiseCChain.factory(your_array)`, which *itself* returns a function that takes a context object, a value object, and returns a Promise ... i.e. 
it is a bona fide `task` that itself can be included in an array of tasks to another invocation of `PromiseCChain.factory()` (i.e. nested chains)
4. Invoke that function with your initialized context object, call the "then" and "catch" function on the returned promise.

Another facile example using timeouts that are run in series:

```javascript
const PromiseCChain = require('promise-command-chain')

/*
 * A function that returns a task-runner function (a function that accepts a context, the previous Promise resolution, and returns a Promise)
 */
const gereate_timeout_task = function(time, terminate) {
        console.log(`Creating task for timeout for ${time}`);
        return function(context, previous_data) {
            console.log(`Running task for timeout for ${time}`);
            return new Promise(function (resolve, reject) {
				console.log(`Setting timeout for ${time}`);
	            setTimeout(function () {
                    console.log(`Timeout for ${time} expired`);
                    if (terminate) {
                        console.log(`terminating the chain`);
                        resolve(true)
                    } else {
                        resolve(context);
                    }
                }, time);
			});
		}
    };

/*
 * Generate task functions that wait for 1, 2, 3, and 4 seconds
 */
const tasks = [
	create_timeout_task(1000),
	create_timeout_task(2000),
	create_timeout_task(3000),
	create_timeout_task(4000)
];

/*
 * Run them as a chain
 */
PromiseCChain.factory(tasks)({message: "this is the initial context"}).then(
    function() {console.log('DONE');}
).catch(function (err) {
    console.log('UHOH', err, err.stack);
})
```

The output of which will be
```
Creating task for timeout for 1000
Creating task for timeout for 2000
Creating task for timeout for 3000
Creating task for timeout for 4000
Running task for timeout for 1000
Setting timeout for 1000
Timeout for 1000 expired
Running task for timeout for 2000
Setting timeout for 2000
Timeout for 2000 expired
Running task for timeout for 3000
Setting timeout for 3000
Timeout for 3000 expired
Running task for timeout for 4000
Setting timeout for 4000
Timeout for 4000 expired
DONE
```

However, if the task array here is constructed so:

```
const tasks = [
	gereate_timeout_task(1000),
	gereate_timeout_task(2000),
	gereate_timeout_task(3000, true),
	gereate_timeout_task(4000)
];
```

then the output will be:

```
Creating task for timeout for 1000
Creating task for timeout for 2000
Creating task for timeout for 3000
Creating task for timeout for 4000
Running task for timeout for 1000
Setting timeout for 1000
Timeout for 1000 expired
Running task for timeout for 2000
Setting timeout for 2000
Timeout for 2000 expired
Running task for timeout for 3000
Setting timeout for 3000
Timeout for 3000 expired
terminating the chain
DONE
```

i.e. the three second time-out promise resolved with exactly `true` and so told the chain to stop.

The elements of the array passed to the `factory` function can be:

* The afore-mentioned type of function
* A string refering to a `require` file which exports such a function.

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. That said, my own style is rather old-school, so any improvements that retain functionality are more than welcome.

Add unit tests for any new or changed functionality. Lint and test your code - some of which I've not been particularly careful to observe in these early releases! 

## Release History

* 1.0.0 Initial release
* 1.0.1 Name screwup fixed
* 1.1.0 Added chain-stop functionality and resolution data passing
