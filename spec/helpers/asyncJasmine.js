['it','xit','fit'].forEach(fnName => {

	var jIt = global[fnName];
	global[fnName] = function(text, cb) {
		if (cb) {
			if (cb.length > 0) {
				jIt(text, done);
			} else {
				jIt(text, (done) => chainCb(cb, done));
			}
		} else {
			jIt(text);
		}
	};

});


['beforeAll','beforeEach','afterEach','afterAll'].forEach(fnName => {

	var jFn = global[fnName];
	global[fnName] = function(cb) {
		if (cb && cb.length > 0) {
			jFn(cb);
		} else {
			jFn((done) => chainCb(cb, done));
		}
	};

});

function chainCb(cb, done) {
	var r = cb();
	if (r && r.then) {
		r.then(done, mongooseFail(done));
	} else {
		done();
	}
}

function mongooseFail(done) {
	return function(error) {
		if (error.errors) {
			console.error(JSON.stringify(error.errors, null, 2));
		}
		done.fail(error);
	};
}
