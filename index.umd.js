
(function(define) {

    define(function (require, exports, module) {
	const Janus = require('./lib/janus.nojquery');

        return function () {};
    });

}( // Help Node out by setting up define.
    typeof module === 'object' && module.exports && typeof define !== 'function' ?
    function (factory) { module.exports = factory(require, exports, module); } :
    define
));

