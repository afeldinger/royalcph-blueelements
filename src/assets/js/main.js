

$(document).ready(function() {

    $('#snapshot-viewport').draggable(
        {
            containment: 'parent',
            opacity: 0.5
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