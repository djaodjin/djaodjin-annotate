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
	width: "640", 		// Width of canvas
	height: "400", 		// Height of canvas
	color:"red", 		// Color for shape and text
	type : "rectangle", // default shape: can be "rectangle", "arrow" or "text"
	img: null,  		// Path for the image src
	linewidth:2, 		// Line width for rectangle and arrow shapes
	fontsize:"20px", 	// font size for text
	bootstrap: true,  	// Bootstrap theme design
	position: "top"		// Poistion of toolbar (available only with bootstrap)
}
```

Once initilaized, it can be deestoy:

```javascript
$("#myCanvas").annotate("destroy");
```

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