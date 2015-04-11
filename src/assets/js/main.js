var FB;
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

(function() {
    'use strict';

    // Base url for ajax requests
    var server_uri = '';
    if (location.host === 'localhost' || location.host === 'git.krympevaerk.dk') {
        server_uri = 'http://blueelements.rc.magnetix.dk';
    }
    //console.log(server_uri);

    var pageID = null;


    // Facebook integration

    // Retrieve FB account details and use in fields
    function showAccountInfo() {
        FB.api('/me?fields=name,picture,email', function(response) {
            //Set variable her!!
            //document.getElementById('accountInfo').innerHTML = ('<img src="' + response.picture.data.url + '"> ' + response.name);
            //console.log(response);
            if (response !== null && response.id !== null && response.id !== '') {
                var nameSplit = response.name.split(' ');
                $('#userfirstname').val(nameSplit[0].trim()).trigger('blur');
                $('#userlastname').val(response.name.substring(nameSplit[0].length).trim()).trigger('blur');
                $('#useremail').val(response.email).trigger('blur');
                $('#userfacebookId').val(response.id);
            }
        });               
    }

    // Share snapshot on FB
    function shareImageSnap() {
        FB.ui({
            display: 'popup',
            method: 'feed',
            //href: 'https://developers.facebook.com/docs/',
            link: $('#fb_link').val(),
            picture: $('#fullImageUrl').val(),
            name: $('#fb_name').val(),
            caption: $('#fb_caption').val(),
            description: $('#fb_description').val()

        }, function(response) {
            if (response !== null && response.post_id !== null && response.post_id !== '') {
                // Update user data.
                updateImageSnap($('#snapId').val(), '', '', '', '', '', null, response.post_id, null);
            }
        });
    }

    /* Facebook connect */
    window.fbAsyncInit = function() {
        FB.init({
            appId: $('#facebookAppId').val(),
            xfbml: true,
            version: 'v2.2'
        });

        FB.Event.subscribe('auth.statusChange', function(response) {
            if (response.status === 'connected') {
                showAccountInfo();
            }
        });
    };



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

                    var full_url = result.imageUrl;
                    $('#userimagecrop').attr('src', full_url).show();
                    $('#fullImageUrl').val(full_url);
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
                    //console.log('User updated');
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

    function validateEmail(email) {
        var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        return re.test(email);
    }

    // Returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // N milliseconds. If `immediate` is passed, trigger the function on the
    // leading edge, instead of the trailing.
    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) {
                    func.apply(context, args);
                }
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) {
                func.apply(context, args);
            }
        };
    }

    $(document).ready(function() {

        pageID = $('#pageId').val();

        // Move snapshot object sideways on small clients
        $('.snapshot-view').each(function() {

            
            var viewport_img = $(this).find('svg');
            var viewport_min_width = viewport_img.width();
            var viewport_width = viewport_min_width;
            var viewport_oob = 0;
            
            var viewfinder = $(this).find('#snapshot-viewport');
            var viewfinder_width = viewfinder.width();

            var x_offset = 0;
            
            viewfinder.draggable({
                containment: 'parent',
                opacity: 0.5,
                start: function() {
                    viewport_width = $(this).parents('.snapshot-view:first').width();
                    viewport_oob = viewport_min_width - viewport_width;
                },
                drag: debounce(function() {
                    if (viewport_width < viewport_min_width) {
                        var x = $(this).offset().left;
                        var x_ratio = x / (viewport_width - viewfinder_width);
                        x_offset = -1 * Math.ceil(x_ratio * viewport_oob);
                        viewport_img.css('transform', 'translateX(' + x_offset + 'px)');
                    }
                }, 10, true),
                stop: function(event, ui) {
                    var pos = $(this).offset();
                    var x = pos.left;
                    var y = pos.top - $('.snapshot-form').offsetParent().offset().top;
                    $('.snapshot-form').css({'left':x, 'top':y, 'height':$(this).height()});
                }
            }).click(function(event) {

                var pos = $(this).position();
                var top = pos.top;
                var left = pos.left;
                if (viewport_width < viewport_min_width) {
                    left -= x_offset;
                }
                var scale = 2226 / viewport_min_width;



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

                $('#userimagecrop').hide();
                $('.snapshot-form').addClass('active').find('.form-step:first').addClass('active').siblings('.form-step').removeClass('active');
     

            }).find('a').click(function(event) {
                event.preventDefault();


            });
        });

        $('.snapshot-form').each(function() {

            $(this).find('.close').click(function(event) {
                event.preventDefault();
                $(this).parents('.snapshot-form').removeClass('active');
            });

            $(this).find('form').submit(function(event) {
                event.preventDefault();
            });
            /*
            $(this).find('.form-step button.next').click(function(event) {
                event.preventDefault();


                //$(this).parents('.form-step').removeClass('active').next('.form-step').addClass('active');
            });
            */
            $(this).find('#btn-add-comment').click(function(event) {
                event.preventDefault();
                //updateImageSnap(snapId, firstName, lastName, email, comment, facebookId, clickedFacebookShare, facebookSharePostId, allowEmailPermission);
                updateImageSnap($('#snapId').val(), '', '', '', $('#usercomment').val(), '', null, '', null);
                $(this).parents('.form-step').removeClass('active').next('.form-step').addClass('active');
            });

            $(this).find('#btn-add-userdata').click(function(event) {
                event.preventDefault();
                
                // validate user data before submitting
                var err = false;
                $(this).parents('.form-step:first').find('input:visible').filter('[type=text], [type=email]').each(function() {

                    $(this).parents('label').toggleClass('error', $(this).val() === '');

                    if ($(this).is('[type=email]') && $(this).val() !== '') {
                        $(this).parents('label').toggleClass('error', !validateEmail($(this).val()));
                    }

                    if ($(this).parents('label').hasClass('error')) {
                        err = true;
                    }
                });

                if (!err) {
                    var userallowemailpermission = document.getElementById('userallowemailpermission').checked;
                    updateImageSnap($('#snapId').val(), $('#userfirstname').val(), $('#userlastname').val(), $('#useremail').val(), '', $('#userfacebookId').val(), null, '', userallowemailpermission);

                    $(this).parents('.form-step').removeClass('active').next('.form-step').addClass('active');

                    // submission flow is complete: hide the viewfinder
                    $('#snapshot-viewport').hide();
                }

            });

            $(this).find('button.fb-connect').click(function(event) {
                event.preventDefault();

                FB.login(function(response) {

                }, { scope: 'email' });

            });


            $(this).find('#share-btn').click(function(event) {
                event.preventDefault();
                updateImageSnap($('#snapId').val(), '', '', '', '', '', true, '', null);
                shareImageSnap();
            });

            $(this).find('.terms-link a').click(function(event) {
                event.preventDefault();
                $('.terms-content').toggleClass('active');
            });

        });


 /*
 
        document.getElementById('login-btn').onclick = function() {
            FB.login(function(response) {
 
            }, { scope: 'email' });
            return false;
        }
 

 */


        // control checkboxes and radiobuttons
        $('input[type=radio], input[type=checkbox]').each(function() {

            // set state on load
            $(this).parents('label').toggleClass('checked', $(this).is(':checked'));

            $(this).on('change', function() {

                var fld_name = $(this).attr('name');
                $('input[name=' + fld_name + ']', $(this).parents('form:first')).add(this).each(function() {
                    $(this).parents('label').toggleClass('checked', $(this).is(':checked'));
                });
            });
        });

        // control input fields focus/blur state
        $(':input').focus(function() {
            $(this).parents('label').addClass('focus');
        }).blur(function() {
            $(this).parents('label')
                .removeClass('focus')
                .toggleClass('has-value', $(this).val()!=='')
            ;
        }).each(function() {
            $(this).parents('label').toggleClass('has-value', $(this).val()!=='');
        });

        $('label').hover(
            function() {
                $(this).addClass('over');
            }, 
            function() {
                $(this).removeClass('over');
            }
        ).filter(':has(.icon)').addClass('has-icon');




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


