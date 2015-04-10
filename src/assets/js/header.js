
(function() {
    'use strict';

    var touchevents = function() {
        return (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch)? true:false;
    };

    if (!touchevents()) {
    	document.body.className = 'no-touch';
    }
    

	
})();
