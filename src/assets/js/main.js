
(function() {
	'use strict';

	var server_uri = 'http://blueelements.rc.magnetix.dk';

	var touchevents = function() {
		return (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch)? true:false;
	};

    function getImageSnapList(countRequest) {
        var request = {
            imageSnapCountRequest: countRequest
        };

        $.ajax({
            async: true,
            url: server_uri + '/umbraco/surface/ImageSnapSurface/GetImageSnaps',
            type: "post",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(request),
            success: function(result) {
                if (result.success) {
                    return result.snapList;
                } else {
                    console.log(result.error);
                }
            },
            error: function() {
                console.log('Error fetching image snaps');
            }
        });
    }

	$(document).ready(function() {

		if (!touchevents()) {
			$('body').addClass('no-touch');
		}


		var snaps = getImageSnapList(15);
		console.log(snaps);

		
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
		        opacity: 0.5,
		        start: function() {
			    	viewport_width = $(this).parents('.snapshot-view:first').width();
			    	viewport_oob = viewport_min_width - viewport_width;
			    },
			    drag: function() {
			    	if (viewport_width < viewport_min_width) {
			    		var x = $(this).offset().left;
			    		var x_ratio = x / (viewport_width - viewfinder_width);
			    		var x_offset = -1 * Math.ceil(x_ratio * viewport_oob);
			    		viewport_img.css('transform', 'translate(' + x_offset + 'px,0)');
			    	}
			    },
			    stop: function(event, ui) {

			        // event.toElement is the element that was responsible
			        // for triggering this event. The handle, in case of a draggable.
			        $( event.originalEvent.target ).one('click', function(e){
			        	e.stopImmediatePropagation(); 
			       	});

			    	var pos = $(this).offset();
			    	var x = pos.left;
			    	var y = pos.top - $('.snapshot-form').offsetParent().offset().top;
			    	$('.snapshot-form').css({'left':x, 'top':y, 'height':$(this).height()});
			    }
		    }).click(function(event) {
		    	$('.snapshot-form').addClass('active');
		    }).find('a').click(function(event) {
		    	event.preventDefault();
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