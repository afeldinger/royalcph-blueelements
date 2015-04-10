
(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = '//connect.facebook.net/en_US/sdk.js';
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

/* Facebook connect */
window.fbAsyncInit = function() {
    FB.init({
        appId: '287716124685668',
        xfbml: true,
        version: 'v2.2'
    });

    FB.Event.subscribe('auth.statusChange', function(response) {
        if (response.status === 'connected') {
            showAccountInfo();
        }
    });
};

(function() {
	'use strict';

	// Base url for ajax requests
	
	var server_uri = '';
	if (location.host === 'localhost' || location.host === 'git.krympevaerk.dk') {
		server_uri = 'http://blueelements.rc.magnetix.dk';
	}
	console.log(server_uri);

	var pageID = null; // should use @UmbracoContext.PageId

	var touchevents = function() {
		return (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch)? true:false;
	};

	// Retrieve FB account details and use in fields
    function showAccountInfo() {
        FB.api('/me?fields=name,picture,email', function(response) {
            //Set variable her!!
            //document.getElementById('accountInfo').innerHTML = ('<img src="' + response.picture.data.url + '"> ' + response.name);

            if (response !== null && response.id !== null && response.id !== '') {
                var nameSplit = response.name.split(' ');
                $('#userfirstname').val(nameSplit[0].trim());
                $('#userlastname').val(response.name.substring(nameSplit[0].length).trim());
                $('#useremail').val(response.email);
                $('#userfacebookId').val(response.id);
                //console.log(response);
            }
        });
    }

    // Share snapshot on FB
    function shareImageSnap() {
        FB.ui({
            display: 'popup',
            method: 'feed',
            //href: 'https://developers.facebook.com/docs/',
            link: 'http://local.blueelements.rc.com/dk',
            //picture: $('#fullImageUrl').val(),
            picture: 'http://placehold.it/550x450',
            name: 'Name',
            caption: 'Caption text',
            description: 'Description'

        }, function(response) {
            if (response !== null && response.post_id !== null && response.post_id !== '') {
                // Update user data.
                updateImageSnap($('#snapId').val(), '', '', '', '', '', null, response.post_id, null);
            }
        });
    }


	// Ajax requests
    function send_crop_data(top, left, scale, firstName, lastName, email, comment, facebookId, clickedFacebookShare, facebookSharePostId, allowEmailPermission) {
        var snapdata = {
            Left: left,
            Top: top,
            ScaleFactor: scale,
            FirstName: firstName,
            LastName: lastName,
            Email: email,
            Comment: comment,
            FacebookId: facebookId,
            ClickedFacebookShare: clickedFacebookShare,
            FacebookSharePostId: facebookSharePostId,
            AllowEmailPermission: allowEmailPermission
        };
 
 		
        $.ajax({
            async: true,
            url: server_uri + '/umbraco/surface/ImageSnapSurface/SubmitImageSnap',
            type: 'post',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify({ imageSnap: snapdata, pi: pageID }),
            success: function(result) {
                if (result.success) {
                	console.log(result);

                    //$('<img src="' + result.imageUrl + '" style="padding:5px;" width="100"><br/>').appendTo($('#results'));
                    $('#fullImageUrl').val('http://local.blueelements.rc.com/' + result.imageUrl);
                    $('#snapId').val(result.snapId);
                } else {
                    console.log(result.error);
                }
            },
            error: function() {
                console.log('Der opstod en teknisk fejl');
            }
        });
    }
 
    function updateImageSnap(snapId, firstName, lastName, email, comment, facebookId, clickedFacebookShare, facebookSharePostId, allowEmailPermission) {
        var snapdata = {
            SnapId: snapId,
            FirstName: firstName,
            LastName: lastName,
            Email: email,
            Comment: comment,
            FacebookId: facebookId,
            ClickedFacebookShare: clickedFacebookShare,
            FacebookSharePostId: facebookSharePostId,
            AllowEmailPermission: allowEmailPermission
        };
        $.ajax({
            async: true,
            //url: "/home/crop",
            url: server_uri + '/umbraco/surface/ImageSnapSurface/UpdateUserData',
            type: 'post',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify({ imageSnap: snapdata, pi: pageID }),
            success: function(result) {
                if (result.success) {
                    //$('<img src="/uploadedfiles/' + result.filename + '" style="padding:5px;" width="100"><br/>').appendTo($('#results'));
                    console.log('User updated');
                } else {
                    console.log(result.error);
                }
            },
            error: function() {
                console.log('Der opstod en teknisk fejl');
            }
        });
    }


    function getImageSnapList(countRequest) {
        var request = {
            imageSnapCountRequest: countRequest
        };

        $.ajax({
            async: true,
            url: server_uri + '/umbraco/surface/ImageSnapSurface/GetImageSnaps',
            type: 'post',
            contentType: 'application/json; charset=utf-8',
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

		pageID = $('#pageId').val();
		console.log('pageid: '+pageID);

/*
		var snaps = getImageSnapList(15);
		console.log(snaps);
*/
		if ($('.scroll-down').length === 0) {
			$('<div class="scroll scroll-down"><span class="icon icon-scroll-down" aria-hidden="true"></span></div>').insertAfter('header.page-header');
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
			    	var pos = $(this).offset();
			    	var x = pos.left;
			    	var y = pos.top - $('.snapshot-form').offsetParent().offset().top;
			    	$('.snapshot-form').css({'left':x, 'top':y, 'height':$(this).height()});
			    }
		    }).click(function(event) {
		    	$('.snapshot-form').addClass('active');

		    	var pos = $(this).position();
		    	var top = pos.top;
		    	var left = pos.left;
		    	var scale = 2226 / viewport_min_width;

		    	console.log(pos);

/*
	            $("<img/>")
	            .attr("src", $("#scaledimage").attr("src"))
	            .load(function() {
	                var scaledimage = $('#scaledimage').offset();
	                var sel = $('#cropselector');
	                var scale = this.width / $("#scaledimage").width(); //originalbilledet er jo større end det brugeren ser og det skal afspejles når der croppes
	                var top = sel.position().top - scaledimage.top;
	                var left = sel.position().left - scaledimage.left;

	                //console.log('---> Kordinater <---\r\nTop: ' + top + '\r\nLeft: ' + left + '\r\nScale: ' + scale);
*/


		    	// send snapshot coordinates to server
	            //var scaledimage = $('#scaledimage').offset();
	            //var sel = $('#cropselector');
	            var firstName = $('#userfirstname').val();
	            var lastName = $('#userlastname').val();
	            var email = $('#useremail').val();
	            var comment = $('#usercomment').val();
	            var facebookId = $('#userfacebookId').val();
	            var clickedFacebookShare = null;
	            var facebookSharePostId = $('#facebookSharePostId').val();
	            var allowEmailPermission = null;

	            var crop_data = send_crop_data(top, left, scale, firstName, lastName, email, comment, facebookId, clickedFacebookShare, facebookSharePostId, allowEmailPermission);
	 
	 /*
	            $("<img/>")
	                .attr("src", $("#scaledimage").attr("src"))
	                .load(function() {
	                    //console.log(this);
	                    var scale = this.width / $("#scaledimage").width(); //originalbilledet er jo større end det brugeren ser og det skal afspejles når der croppes
	                    var top = sel.position().top - scaledimage.top;
	                    var left = sel.position().left - scaledimage.left;
	                    send_crop_data(top, left, scale, firstName, lastName, email, comment, facebookId, clickedFacebookShare, facebookSharePostId, allowEmailPermission);
	                });
*/
            }).find('a').click(function(event) {
		    	event.preventDefault();


		    });
		});

		$('.snapshot-form').each(function() {

			$(this).find('.close').click(function(event) {
				event.preventDefault();
				$(this).parents('.snapshot-form').removeClass('active');
			});
			
			$(this).find('.form-step button.next').click(function(event) {
				event.preventDefault();


				$(this).parents('.form-step').removeClass('active').next('.form-step').addClass('active');
			});
		});


 /*
        document.getElementById('add-comment-btn').onclick = function() {
            //updateImageSnap(snapId, firstName, lastName, email, comment, facebookId, clickedFacebookShare, facebookSharePostId, allowEmailPermission);
            updateImageSnap($('#snapId').val(), "", "", "", $('#usercomment').val(), "", null, "", null);
            return false;
        }
 
        document.getElementById('login-btn').onclick = function() {
            FB.login(function(response) {
 
            }, { scope: 'email' });
            return false;
        }
 
        document.getElementById('add-userdata-btn').onclick = function() {
            var userallowemailpermission = document.getElementById('userallowemailpermission').checked;
            updateImageSnap($('#snapId').val(), $('#userfirstname').val(), $('#userlastname').val(), $('#useremail').val(), "", $('#userfacebookId').val(), null, "", userallowemailpermission);
            return false;
        }

        document.getElementById('share-btn').onclick = function() {
            updateImageSnap($('#snapId').val(), "", "", "", "", "", true, "", null);
            shareImageSnap();
            return false;
        }
 */




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


