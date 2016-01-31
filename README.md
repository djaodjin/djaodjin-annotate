#djaodjin-annotate.js

djaodjin-annotate.js is a simple jquery plugin allowing you to annotate
a screenshot. Try the live demo on [DjaoDjin blog](https://djaodjin.com/blog/jquery-plugin-to-annotate-images.blog).


#Usage

Load djaodjin-annotate.css and djaodjin-annotate.js
```html
<!DOCTYPE html>
<html>
<head>
	<meta charset=utf-8 />
	<title></title>
	<link rel="stylesheet" type="text/css" href="/static/css/djaodjin-annotate.css" />
</head>
<body>


	<script type="text/javascript" src="//code.jquery.com/jquery-1.11.3.min.js"></script>
	<script type="text/javascript" src="/static/js/djaodjin-annotate.js"></script>
</body>
</html>
```

Just add a div element inside ```body``.

```html
<div id="myCanvas"></div>
```

and on a script:

```javascript
$(document).ready(function(){
	$("#myCanvas").annotate(options);
});
```

customizable options:

```javascript
options = {
	width: "640",			// Width of canvas
	height: "400",			// Height of canvas
	color:"red", 			// Color for shape and text
	type : "rectangle",		// default shape: can be "rectangle", "arrow" or "text"
	images: null,			// Array of images path : ["images/image1.png", "images/image2.png"]
	linewidth:2,			// Line width for rectangle and arrow shapes
	fontsize:"20px",		// font size for text
	bootstrap: true,		// Bootstrap theme design
	position: "top",		// Position of toolbar (available only with bootstrap)
	idAttribute: "id",		// Attribute to select image id.
	selectEvent: "change",	// listened event to select image
	unselectTool: false		// display an unselect tool for mobile
}
```

### Destroy an annotate
Once initialized, it can be destroy:

```javascript
$("#myCanvas").annotate("destroy");
```

### Add image to existing annotate
It's also possible to provide new images by pushing them:

- Push an image with only path: (If image exists an id will be automatically created.)
```javascript
$("#myCanvas").annotate("push", "images/test_2.jpg");
```


- Push an image with and id and a path: (allow to build an image selector manually)

```javascript
$("#myCanvas").annotate("push", {id:"unique_identifier", path: "images/test_2.jpg"});
```

### Events

* ```annotate-image-added```: Fired when an image is initialized (plugin initialization or when a new image is pushed). Can be used to build image selector.

ex:

```javascript
	$('#myCanvas').on("annotate-image-added", function(event, id, path){
		$(".my-image-selector").append("<label><input type=\"radio\" name=\"image-selector\" class=\"annotate-image-select\" id=\"" + id + "\" checked><img src=\"" + path + "\" width=\"35\" height=\"35\"></label>");
	});
```

If multiple images provided, an image selector is necessary to switch. Image selector must trigger an event on ```annotate-image-select``` class. you can custom the event by using ```selectEvent``` option (default: ```change```) and custom the readable image attribute by using ```idAttribute``` option (default: ```id```)

#Release notes

###v0.0.3

- Responsive annotation position
- Reponsive line width and font size

###v0.0.2

- Ability to destroy an annotate instance
- work with multiple images
- Ability add new image after initialization

###v0.0.1

- bower release

#License

Copyright (c) 2015, Djaodjin Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.