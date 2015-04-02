

$(document).ready(function() {

	// init flexsliders on page
	$('.flexslider').flexslider({
		animation: 'slide',
		slideshow: false,
	});


	$('a[href*="vimeo.com"], a[href*="youtube.com"]').magnificPopup({
		type: 'iframe',
	});

});