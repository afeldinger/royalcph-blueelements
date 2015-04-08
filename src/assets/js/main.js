
(function() {
	'use strict';


	var touchevents = function() {
		var bool;
		if(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
		  bool = true;
		}
	};


	$(document).ready(function() {

		if (!touchevents()) {
			$('body').addClass('no-touch');
		}
		
		// Move snapshot object sideways on small clients
		$('.snapshot-view').each(function() {
			
			var viewport_img = $(this).find('svg');
			var viewport_min_width = viewport_img.width();
			var viewport_width = viewport_min_width;
			var viewport_oob = 0;
			
			var viewfinder = $(this).find('#snapshot-viewport');
			var viewfinder_width = viewfinder.width();
			
		    viewfinder.draggable({
		        containment: 'parent',
		        opacity: 0.5
		    }).on('dragstart', function() {
		    	viewport_width = $(this).parents('.snapshot-view:first').width();
		    	viewport_oob = viewport_min_width - viewport_width;
		    }).on('drag', function() {
		    	if (viewport_width < viewport_min_width) {
		    		var x = $(this).offset().left;
		    		var x_ratio = x / (viewport_width - viewfinder_width);
		    		var x_offset = -1 * Math.ceil(x_ratio * viewport_oob);
		    		viewport_img.css('left', x_offset + 'px');
		    	}
		    });
		});

		// IE fix for missing li:hover
	    $('.tiles li').hover(
	    	function() {
	    		$(this).addClass('over');
	    	},
	    	function() {
	    		$(this).removeClass('over');
	    	}
	    );

		// init flexsliders on page
		$('.flexslider').flexslider({
			animation: 'slide',
			slideshow: false,
		});

		// handle video links in a lightbox
		$('a[href*="vimeo.com"], a[href*="youtube.com"]').magnificPopup({
			type: 'iframe',
		});

	});
})();