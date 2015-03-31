
module.exports.register = function (Handlebars, options) {
	'use strict';

	Handlebars.registerHelper('times', function(n, block) {
		var accum = '';
		for(var i = 0; i < n; ++i)
			accum += block.fn(i);
		return accum;
	});

	Handlebars.registerHelper('mod', function (a, b) {
	return a % b;
	});


	Handlebars.registerHelper('modequals', function (a, b, c) {
	return (a % b == c)? true : false;
	});

	Handlebars.registerHelper('renderPartial', function(partialName, context, options) {
	    if (!partialName) {
	        console.error('No partial name given.');
	        return '';
	    }
	    var partial = Handlebars.partials[partialName];
	    if (!partial) {
	        console.error('Couldnt find the compiled partial: ' + partialName);
	        return '';
	    }
	
	    var fn = Handlebars.compile(partial);
	    return new Handlebars.SafeString( fn(context, options.hash) );
	});


	Handlebars.registerHelper('renderLayout', function(layoutName, context) {
	    if (!layoutName) {
	        console.error('No layout name given.');
	        return '';
	    }
	    var template = Handlebars.templates[layoutName];
	    if (!template) {
	        console.error('Couldnt find the compiled layout: ' + layoutName);
	        return '';
	    }
	    return new Handlebars.SafeString( template(context) );
	});


    Handlebars.registerHelper('icon', function(key){
        return new Handlebars.SafeString('<span class="icon '+key+'" aria-hidden="true"></span>');
      }
    );


    Handlebars.registerHelper('listlayouts', function(){
        return Handlebars.layouts;
    });

    Handlebars.registerHelper('eachOptions', function(collection, options) {
		var accum = '';
		for(var key in collection) {
			var context = {}
			context.key = key;
			context.value = collection[key];
			context.options = options.hash;
			//console.log(JSON.stringify (context)); 
			accum += options.fn( context );
		}
		return accum;
    });
};
