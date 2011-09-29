# photoJS
"photoJS" (or pJS for short) is a lightweight jQuery plugin for creating nice image galleries.
It can load user supplied images, or from the [Picasa Web Albums Data API](https://code.google.com/apis/picasaweb/overview.html).

Unlike many image gallery plugins, photoJS is very minimal. It simply downloads your images, and displays them in a grid.
After that, it is up to you to use another plugin such as [jQuery lightBox](http://leandrovieira.com/projects/jquery/lightbox/)
or something from [jQuery UI](http://jqueryui.com/) to style, provide transitions, etc.

To see a live demo of photoJS, check out the site it was built for, [SamWhited.com](https://samwhited.com/photography/).

# Using pJS
Using photoJS is as easy as calling `$( selector ).pJS( settings[, complete] )`. However, this won't do much (read, "anything").
To make photoJS really shine, we need to include some settings.

Let's assume we have a div on our page that we want to contain a gallery:

	<div id="portfolio"></div>
	
To style it using photoJS we would include jQuery, then do something like this:

	<script type="text/javascript">
	$( function() {
		$( '#portfolio' ).pJS({
			'api': 'picasa',
			'columns': 4,
			'id': '5629373182085820817',
			'user': 'samwhitedphotography'
		});
	});
	</script>
	
or, in CoffeeScript:

	$ ->
		$( '#portfolio' ).pJS
			api: 'picasa'
			columns: 4
			id: '5629373182085820817'
			user: 'samwhitedphotography'

Nice and easy -- but that's not all photoJS can do.

# Settings
There are a lot of different ways you can configure photoJS, below is the default settings object, and some explanation where necessary:

	settings = {
		api: 'none',			// Only supports 'picasa' or 'none' right now
		preload: 'all',			// 'thumbs,' 'images,' 'all,' or 'none.' Loads asynchronously.
		columns: 4,				// Integer, or 'auto' to calculate based on number of photos
		id: '',					// The id of the album to download (if api is not 'none')
		user: '',				// The username to feed the API (if api is not 'none')
		imgmax: '512',			// The longest edge length of the image to download
		thumbmax: '104',		// The longest edge of the thumbnail image
		cropped: true,			// True if the thumbnail should be cropped to a square (Picasa Web Albums only)
		images: [],				// An array of image objects or src strings (not recommended).
		thumbnails: [],			// An array of paths to thumbnails (not recommended).
								// If used, the 0th thumbnail maps to the first image that is a string,
								// even if it is not the 0th element.
		format: {
			colSpace: '0.5em',	// The space between columns
			rowSpace: '0.5em',	// The space between rows
			rowClass: '',		// A list of classes to add to the row divs
			imgClass: '',		// A list of classes to add to the img tags
			aClass: ''			// A list of classes to add to the anchors
		},
		load: '',				// A callback to be called when all preloaded images are done loading
		complete: complete		// A callback function to be called after the DOM is ready
								// By default, it is set to the second argument passed to the
								// function call. The settings object takes priority.
	}
