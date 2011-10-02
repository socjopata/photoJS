###
jQuery photoJS Album 0.2.coffee

Copyright 2011 Sam Whited (https://samwhited.com)
Licensed under the Creative Commons Attribution 3.0 Unported license (CC BY 3.0)
https://creativecommons.org/licenses/by/3.0/

https://github.com/SamWhited/photoJS
###

$ = jQuery
root = exports ? this # Bind "root" to the global namespace, or the exports namespace under Node.JS

root.evalResponse = ( json ) ->
	# Make sure the JSON is actually parsed
	root.apiResponse = $.parseJSON json if typeof json is 'string'

methods =
	init: ( settings, complete ) ->
		settings = $.extend true
			api: 'none'
			preload: 'thumbs'
			columns: 4
			id: ''
			user: ''
			imgmax: 512
			thumbmax: 104
			cropped: true
			images: []
			thumbnails: []
			format:
				colspace: '0.5em'
				rowSpace: '0.5em'
				rowClass: ''
				imgClass: ''
				aClass: ''
			complete: complete
			load: ''
			settings

		@.each ->
			$this = $ @
			data = $this.data 'pJS'
			album =
				author: ''
				images: []
				icon: ''
				title: ''
				subtitle: ''
				updated: ''
			if not data?
				$this.data 'pJS'
					target: $this
					settings: settings
					album: album
				data = $this.data 'pJS'

			# Create the album
			$this.pJS 'update'
			return
	update: ->
		@.each ->
			$this = $ @
			data = $this.data 'pJS'

			# Clear out any data that has already been loaded
			data.album.images = []
			data.album.albumDiv = $ '<div/>'

			# Load user supplied images
			$this.pJS 'userImages'

			# Load album info from Picasa Web Albums
			if data.settings['api'] is 'picasa'
				$this.pJS 'picasa', ( jqXHR, textStatus ) ->
					# After the API request completes, load some images
					if textStatus is 'success'
						# Start loading any images that need to be preloaded
						$this.pJS 'load', data.settings['preload'] if data.settings['preload']?
					else
						# TODO: Fail more gracefully
						$.error "Loading data from Picasa Web Albums failed with status: \"#{textStatus}.\""
					# Create the actual album and add it to $this
					albumDiv = data.album.albumDiv
					columns = data.settings.columns
					i = 0

					if columns == 'auto' then columns = Math.ceil Math.sqrt data.album.images.length else columns ||= 4
					rows = Math.ceil data.album.images.length / columns

					for row in [0..rows]
						rowDiv = $( '<div/>' )
							.addClass( 'pJSRow' )
							.addClass( data.settings['format']['rowClass'] )
							.appendTo( albumDiv );
						rowDiv.css( 'margin-bottom', data.settings['format']['rowSpace'] ) if row isnt rows - 1

						for col in [0..columns]
							if i < data.album.images.length
								entry = data.album.images[i]
								anchor = $( '<a/>' )
									.attr( 'href', entry.src )
									.addClass( data.settings['format']['aClass'] )
									.appendTo( rowDiv ).append(
										$( '<img/>' )
											.attr( 'title', entry.title )
											.attr( 'src', entry.thumbnail )
											.addClass( data.settings['format']['imgClass'] )
											.css( 'vertical-align', 'bottom' )
									)

								anchor.css( 'margin-right', data.settings['format']['colSpace'] ) if col isnt columns - 1
								++i
							else break

					# Put the album in $this after the DOM is ready
					$ ->
						$this.empty().append albumDiv
						data.settings['complete'].call @ if typeof data.settings['complete'] is 'function'
						return
					return
				return
	destroy: ->
		@.each ->
			$this = $ @
			data = $this.data 'pJS'
			$( document ).unbind '.pJS'
			data.pJS.remove()
			$this.removeData 'pJS'
			return
	load: ( images ) ->
		imgs = images
		@.each ->
			$this = $ @
			data = $this.data 'pJS'
			images = ( if $.isArray data.settings['thumbnails'] then data.settings['thumbnails'] else [] ) if typeof imgs is 'string'

			if imgs is 'thumbs' or imgs is 'thumbnails'
				# Load user supplied thumbnails
				$.each ( data.settings['images'].concat data.album['images'] ), ( index, value ) ->
					images.push value.thumbnail if typeof value is 'object' and typeof value.thumbnail is 'string'
					return
				$this.pJS 'load', images
				return
			else if imgs is 'images'
				# Load images
				$.each ( data.settings['images'].concat data.album['images'] ), ( index, value ) ->
					if typeof value is 'string'
						images.push value
						return
					else if typeof value is 'object' and typeof value.src is 'string'
						images.push value.src
						return
				$this.pJS 'load', images
				return
			else if imgs is 'both' or imgs is 'all'
				$.each ( data.settings['images'].concat data.album['images'] ), ( index, value ) ->
					if typeof value is 'object'
						images.push value.thumbnail if typeof value is 'string'
						images.push value.src if typeof value.src is 'string'
						return
					else if typeof value is 'string'
						images.push value
						return
				$this.pJS 'load', images
				return
			else if $.isArray imgs
				# Load images from array
				imagesLoaded = 0
				$.each images, ( index, value ) ->
					img = $( '<img/>' ).load ->
						imagesLoaded++
						data.settings['load'].call $this if imagesLoaded is images.length and typeof data.settings['load'] is 'function'
						return
					.attr( 'src', value )
					return
	userImages: ->
		@.each ->
			$this = $ @
			data = $this.data 'pJS'

			if data.settings.images.length > 0
				dt = new Date()
				stringCount = 0
				$.each data.settings.images, ( index, value ) ->
					if typeof value is 'string'
						data.album.images.push
							src: value
							type: ''
							title: ''
							update: dt
							published: dt
							thumbnail: data.settings.thumbnails[stringcount] || value
						++stringCount
						return
					else if typeof value is 'object'
						data.album.images.push $.extend
							src: ''
							type: ''
							title: ''
							updated: dt
							published: dt
							thumbnail: ''
							value
						return
				return
	picasa: ( complete ) ->
		@.each ->
			$this = $ @
			data = $this.data 'pJS'
			apiString = ( if data.settings['SSL'] then 'https://' else 'http://' ) + "picasaweb.google.com/data/feed/base/user/#{data.settings['user']}/albumid/#{data.settings['id']}?"
			$.ajax
				url: apiString,
				datatype: 'script'
				data:
					alt: 'json-in-script'
					callback: 'evalResponse'
					kind: 'photo'
					imgmax: data.settings['imgmax']
					thumbsize: data.settings['thumbmax'] + ( if data.settings['cropped'] then 'c' else 'u' )
				success: ( response ) ->
					# Make sure the response has been evaluated
					eval( response ) if not root.apiResponse?
					feed = root.apiResponse.feed
					data.api =
						query: apiString
						response: response
					data.album.author = feed.author[0].name.$t;
					data.album.icon = feed.icon.$t
					data.album.title = feed.title.$t
					data.album.subtitle = feed.subtitle.$t
					data.album.updated = new Date feed.updated.$t
					$each feed.entry, ( index, value ) ->
						data.album.images.push
							src: value.content.src
							type: value.content.type
							title: value.title.$t
							updated: new Date value.updated.$t
							published: value.published.$t
							thumbnail: value.media$group.media$thumbnail[0].url
						return
					return
				complete: complete
			return

$.fn.pJS = ( method ) ->
	return if methods[method]
	then methods[ method ].apply @, Array.prototype.slice.call( arguments, 1 )
	else if typeof method is 'object' or not method
	then methods.init.apply @, arguments
	else
		$.error "Method #{method} does not exist on jQuery.pJS"
		return
