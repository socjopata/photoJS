/*
 * jQuery photoJS Album 0.2.x
 *
 * Copyright 2011 Sam Whited (https://samwhited.com)
 * Licensed under the Creative Commons Attribution 3.0 Unported license (CC BY 3.0)
 * https://creativecommons.org/licenses/by/3.0/
 *
 * https://github.com/SamWhited/photoJS
 */
(function( $, root, undefined ) {
	evalResponse = function ( json ) {
		// Make sure the JSON is actually parsed
		if ( typeof json === "string" ) {
			json = $.parseJSON( json );
		}
		apiResponse = json;
		return json;
	}
	var methods = {
		init: function( settings, complete ) {
			// Recursively extend the default settings
			// object with any user defined settings.
			settings = $.extend( true, {
				'api': 'none',			// Only supports 'picasa' or 'none' right now
				'preload': 'thumbs',		// 'thumbs,' 'images,' 'all,' or 'none.' Loads asynchronously.
				'columns': 4,			// Integer, or 'auto' to calculate based on number of photos
				'id': '',			// The API id of the album to download
				'user': '',			// The username to feed the API
				'imgmax': '512',		// The longest edge length of the image to download
				'thumbmax': '104',		// The longest edge of the thumbnail image
				'cropped': true,		// True if the thumbnail should be cropped to a square
				'images': [],			// An array of image objects or src strings (not recommended).
				'thumbnails': [],		// An array of src strings to thumbnails for image src strings
								// If used, the 0th thumbnail maps to the first image that is a string,
								// even if it is not the 0th element (not recommended for use).
				'format': {			// Properties relating to the formatting of the album
					'colSpace': '0.5em',
					'rowSpace': '0.5em',
					'rowClass': '',
					'imgClass': '',
					'aClass': ''
				},
				'complete': complete,		// Callback for when pJS has added the album to $this
				'load': ''			// Callback for when all preloaded photos are done loading
			}, settings);
			return this.each( function() {
				var $this = $( this ),
				data = $this.data( 'pJS' ),
				album = {
					'author': '',
					'images': [],
					'icon': '',
					'title': '',
					'subtitle': '',
					'updated': ''
				};
				if ( ! data ) {
					$this.data( 'pJS', {
						'target': $this,
						'settings': settings,
						'album': album
					});
					data = $this.data( 'pJS' );
				}
				
				// Update or create the album
				$this.pJS( 'update' );
			});
		},
		update: function() {
			return this.each( function() {
				var $this = $( this ),
					data = $this.data( 'pJS' );
				
				// Clear out any data that has already been loaded
				data.album.images = [];
				data.album.albumDiv = $('<div/>');
													
				// Load user supplied images 
				$this.pJS( 'userImages' );

				// Load album info from Picasa Web Albums
				if ( data.settings['api'] === 'picasa' ) {
					$this.pJS( 'picasa', function( jqXHR, textStatus ) {
						// After the API request completes, load some images
						if ( textStatus === 'success' ) {
							// Start loading any images that need to be preloaded
							if ( data.settings['preload'] && typeof data.settings['preload'] === 'string' ) {
								$this.pJS( 'load', data.settings['preload'] );
							}
						}
						else {
							// TODO: Fail more gracefully
							$.error( 'Loading data from Picasa failed with status: "' + textStatus +'."' );
						}
						// Create the actual album and add it to $this
						var albumDiv = data.album.albumDiv,
							columns = data.settings.columns,
							i = 0,
							rows;
		
						if ( columns === 'auto' ) {
							columns = Math.ceil( Math.sqrt( data.album.images.length ) );
						} else {
							// Prevent division by zero
							// Default to 4 columns
							columns = columns || 4;
						}
						rows = Math.ceil( data.album.images.length / columns );
		
						for ( var row = 0; row < rows; ++row ) {
								var rowDiv = $( '<div/>' )
									.addClass( 'pJSRow' )
									.addClass( data.settings['format']['rowClass'] )
									.appendTo( albumDiv );
									
								if ( row != rows - 1 ) {
									rowDiv.css( 'margin-bottom', data.settings['format']['rowSpace'] );
								}
									
							for ( var col = 0; col < columns; ++col ) {
								if ( i < data.album.images.length ) {
									var entry = data.album.images[i],
										anchor = $( '<a/>' )
											.attr( 'href', entry.src )
											.addClass( data.settings['format']['aClass'] )
											.appendTo( rowDiv )
									$( '<img/>' )
										.attr( 'title', entry.title )
										.attr( 'src', entry.thumbnail )
										.addClass( data.settings['format']['imgClass'] )
										.css( 'vertical-align', 'bottom' ) // Make sure the image is aligned properly
										.appendTo( anchor );
										
									if ( col != columns - 1 ) {
										anchor.css( 'margin-right', data.settings['format']['colSpace'] )
									}
									++i;
								} else {
									break;
								}
							}
						}

						// Put the album in $this after the DOM has loaded
						$( function() {
							$this.empty().append( albumDiv );
							if ( typeof data.settings['complete'] === 'function' ) {
								data.settings['complete'].call( this );
							}
						});
					});
				}
			});
		},
		destroy: function() {
			return this.each( function() {
				var $this = $( this ),
				data = $this.data( 'pJS' );

				$(document).unbind('.pJS');
				data.pJS.remove();
				$this.removeData( 'pJS' );
			});
		},
		load: function( images ) {
			var imgs = images;
			return this.each( function() {
				var $this = $( this ),
					data = $this.data( 'pJS' ),
					images = imgs;

				if ( images === 'thumbs' || images === 'thumbnails' ) {
					// Load user supplied thumbnails
					var thumbs = [];
					if ( data.settings['thumbnails'].length > 0 ) {
						thumbs = thumbs.concat( data.settings['thumbnails'] );
					}
					$.each( data.settings['images'].concat( data.album['images'] ) , function( index, value ) {
						if ( typeof value === 'object' && typeof value.thumbnail === 'string' ) {
							thumbs.push( value.thumbnail );
						}
					});
					$this.pJS( 'load', thumbs );
				} else if ( images === 'images' ) {
					// Load images
					var images = [];
					$.each( data.settings['images'].concat( data.album['images'] ), function( index, value ) {
						if ( typeof value === 'string' ) {
							images.push( value );
						} else if ( typeof value === 'object' && typeof value.src === 'string' ) {
							images.push( value.src );
						}
					});
					$this.pJS( 'load', images );
				} else if ( images === 'both' || images === 'all' ) {
					var images = [];
					if ( data.settings['thumbnails'].length > 0 ) {
						images = images.concat( data.settings['thumbnails'] );
					}
					$.each( data.settings['images'].concat( data.album['images'] ), function( index, value ) {
						if ( typeof value === 'object' ) {
							if ( typeof value.thumbnail === 'string' ) {
								images.push( value.thumbnail );
							}
							if ( typeof value.src === 'string' ) {
								images.push( value.src );
							}
						} else if ( typeof value === 'string' ) {
							images.push( value );
						}
					});
					$this.pJS( 'load', images )
				} else if ( $.isArray( images ) ) {
					// Load images from array
					var imagesLoaded = 0;
					$.each( images, function( index, value ) {
						var img = $( '<img/>' ).load( function() {
							imagesLoaded++;
							if ( imagesLoaded === images.length && typeof data.settings['load'] === 'function' ) {
								data.settings['load'].call( $this );
							}
						}).attr("src", value);
					});
				}
			});
		},
		userImages: function() {
			return this.each( function() {
				var $this = $( this ),
					data = $this.data( 'pJS' );
				// TODO: Add a default image
				if ( data.settings.images.length > 0 ) {
					var dt = new Date(),
						stringCount = 0;
					$.each( data.settings.images, function( index, value ) {
						// Allow for an array of image objects, or just strings
						if ( typeof value === 'string' ) {
							data.album.images.push({
								src: value,
								type: '',
								title: '',
								updated: dt,
								published: dt,
								thumbnail: data.settings.thumbnails[stringCount] || value
							});
							++stringCount;
						} else if ( typeof value === 'object' ) {
							data.album.images.push( $.extend({
								src: '',
								type: '',
								title: '',
								updated: dt,
								published: dt,
								thumbnail: ''
							}, value));
						}
					});
				}
			});
		},
		picasa: function( complete ) {
			return this.each( function() {
				var $this = $( this ),
					data = $this.data( 'pJS' ),
					apiString = ( data.settings['SSL'] ? 'https://' : 'http://' )
						+ 'picasaweb.google.com/data/feed/base/'
						+ 'user/'
						+ data.settings['user']
						+ '/albumid/'
						+ data.settings['id']
						+ '?';
				$.ajax({
					url: apiString,
					datatype: 'script',
					data: {
						alt: 'json-in-script',
						callback: 'evalResponse',
						kind: 'photo',
						imgmax: data.settings['imgmax'],
						thumbsize: data.settings['thumbmax'] + ( data.settings['cropped'] ? 'c' : 'u' )
					},
					success: function( response ) {
						// Make sure everything runs smoothly
						// in browsers like Firefox.
						if ( root.apiResponse === undefined ) {
							eval( response ); // TODO: This is a terrible hack. Find a better way.
						}
						var feed = apiResponse.feed;
						data.api = {
							query: apiString,
							response: response
						};
						data.album.author = feed.author[0].name.$t;
						data.album.icon = feed.icon.$t;
						data.album.title = feed.title.$t;
						data.album.subtitle = feed.subtitle.$t;
						data.album.updated = new Date( feed.updated.$t );
						$.each( feed.entry, function( index, value ) {
							data.album.images.push({
								'src': value.content.src,
								'type': value.content.type,
								'title': value.title.$t,
								'updated': new Date( value.updated.$t ),
								'published': value.published.$t,
								'thumbnail': value.media$group.media$thumbnail[0].url
							});
						});
					},
					complete: complete
				});

			});
		}
	};

	$.fn.pJS = function( method ) {
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' + method + ' does not exist on jQuery.pJS' );
		}
	};
})( jQuery, this );
