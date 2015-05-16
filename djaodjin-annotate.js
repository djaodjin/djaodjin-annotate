/* 
annotate.js
Copyright (c) 2014, Djaodjin Inc.
MIT License
*/

(function ($) {
   var _this = null;
   var baseCanvas = null;
   var drawingCanvas = null;
   var baseContext = null;
   var drawingContext = null;
   var clicked = false;
   var fromx = null;
   var fromy = null;
   var prevx = null;
   var prevy = null;
   var fromx_text = null;
   var fromy_text = null;
   var tox = null;
   var toy = null;
   var points = [];
   var stored_undo = [];
   var stored_element = [];
   var img = null;
         
   function Annotate(el, options){
      this.$el = $(el);
      this.check_redo_undo();
      this.options = options;
      this._init();
   }
   
   Annotate.prototype = {
      _init: function () {
         _this = this;
         _this.$el.addClass('annotate-container');
         // console.log(container);
         _this.$el.append($('<canvas id="baseLayer"></canvas>'));
         _this.$el.append($('<canvas id="drawingLayer"></canvas>'));
         baseCanvas = document.getElementById('baseLayer');
         drawingCanvas = document.getElementById('drawingLayer');
         baseContext = baseCanvas.getContext('2d');
         drawingContext = drawingCanvas.getContext('2d');
         type = _this.options.type;
         color = _this.options.color;
         baseCanvas.width = drawingCanvas.width = _this.options.width;
         baseCanvas.height = drawingCanvas.height = _this.options.height;

         baseContext.lineJoin = "round";
         drawingContext.lineJoin = "round";
         var class_position1 = "btn-group";
         var class_position2 = "";

         if (_this.options.position == "left" || _this.options.position == "right"){
            class_position1 = "btn-group-vertical";
            class_position2 = "btn-block" ;
         }


         $('#annotate_section').css({"width":_this.options.width,"height":_this.options.height});
         _this.$el.css({"border":"1px solid black"});
         if (_this.options.bootstrap){
            /*jshint multistr: true */
            $('body').append('<div id="annotate_tools">\
               <a id="undoaction" title="Undo the last annotation" class="btn btn-primary '+class_position2+'"><i class="glyphicon glyphicon-arrow-left"></i></a>\
               <div class="'+ class_position1 +'" data-toggle="buttons">\
               <label class="btn btn-primary active">\
               <input type="radio" name="tool_option" id="rectangle" data-toggle="tooltip" data-placement="top" title="Draw an rectangle"><i class="glyphicon glyphicon-unchecked"></i>\
               </label>\
               <label class="btn btn-primary">\
               <input type="radio" name="tool_option" id="text" data-toggle="tooltip" data-placement="top" title="Write some text"> <i class="glyphicon glyphicon-font"></i>\
               </label>\
               <label class="btn btn-primary">\
               <input type="radio" name="tool_option" id="arrow" data-toggle="tooltip" data-placement="top" title="Draw an arrow"> <i class="glyphicon glyphicon-arrow-up"></i>\
               </label>\
               <label class="btn btn-primary">\
               <input type="radio" name="tool_option" id="pen" data-toggle="tooltip" data-placement="top" title="Pen Tool"> <i class="glyphicon glyphicon-pencil"></i>\
               </label>\
               </div>\
               <a type="button" id="redoaction" title="Redo the last undone annotation" class="btn btn-primary ' + class_position2 +'"><i class="glyphicon glyphicon-arrow-right"></i></a>\
               </div>');
         }else{
            $('body').append('<div id="annotate_tools" style="display:inline-block">\
               <button id="undoaction">UNDO</button>\
               <input type="radio" name="tool_option" id="rectangle" checked>RECTANGLE\
               <input type="radio" name="tool_option" id="text"> TEXT\
               <input type="radio" name="tool_option" id="arrow">ARROW\
               <input type="radio" name="tool_option" id="pen">PEN\
               <button id="redoaction" title="Redo the last undone annotation">REDO</button>\
               </div>');
         }
         var position = _this.$el.offset();
         if (_this.options.position != "top" && !_this.options.bootstrap){
            $('#annotate_tools').append('<em>Position option available only with <a href="http://getbootstrap.com/" target="_blank">Bootstrap</a></em>');
         }

         if (_this.options.position == "top" || (_this.options.position != "top" && !_this.options.bootstrap)){
            $('#annotate_tools').css({"position":'absolute', "top":position.top - 35, "left":position.left});
         }else{
            if (_this.options.position == "left" && _this.options.bootstrap){
               $('#annotate_tools').css({"position":'absolute', "top":position.top - 35, "left":position.left - 20});
            }else if (_this.options.position == "right" && _this.options.bootstrap){
               $('#annotate_tools').css({"position":'absolute', "top":position.top - 35, "left":position.left + canvas.width + 20});
            }else if (_this.options.position == "bottom" && _this.options.bootstrap){
               $('#annotate_tools').css({"position":'absolute', "top":position.top + canvas.height + 35 , "left":position.left});
            }
         }
         
         
          
         $('body').append('<textarea id="input_text" style="position:absolute;z-index:100000;display:none;top:0;left:0;background:transparent;border:1px dotted '+ _this.options.color +';font-size:'+ _this.options.fontsize +';font-family:sans-serif;color:'+_this.options.color+';word-wrap: break-word;outline-width: 0;overflow: hidden;padding:0px"></textarea>');
         
        
         
         if (_this.options.img){
            img = new Image();
            img.src = _this.options.img;
            img.onload = function () {
               baseContext.drawImage(img,  0, 0, _this.options.width, _this.options.height);
            };
         }
            
         $(document).on('change','input[name="tool_option"]', _this._selecttool);
         $(document).on('click','#redoaction',_this.redoaction);
         $(document).on('click','#undoaction',_this.undoaction);
         _this.$el.on('mousedown',_this._mousedown);
         _this.$el.on('mouseup',_this._mouseup);
         _this.$el.on('mousemove',_this._mousemove);
         _this.check_redo_undo();
      },
      
      check_redo_undo: function(){
         if (stored_undo.length == 0){
            $('#redoaction').attr('disabled',true);
         }else{
            $('#redoaction').attr('disabled',false);
         }
         if (stored_element.length == 0){
            $('#undoaction').attr('disabled',true);
         }else{
            $('#undoaction').attr('disabled',false);
         }
      },
      
      undoaction: function(event){
         event.preventDefault();
         stored_undo.push(stored_element[stored_element.length -1]);
         stored_element.pop();
         _this.check_redo_undo();
         _this.clear();
         _this.redraw();
      },
      
      redoaction: function(event){
         event.preventDefault();
         stored_element.push(stored_undo[stored_undo.length -1]);
         stored_undo.pop();
         _this.check_redo_undo();
         _this.clear();
         _this.redraw();
      },
      
      redraw: function(){
         baseCanvas.width = baseCanvas.width;
         if (_this.options.img){
           baseContext.drawImage(img,  0, 0, _this.options.width, _this.options.height);
         }
         if (stored_element.length == 0) {
            return;
         }
         // clear each stored line
         for (var i = 0; i < stored_element.length; i++) {
            var element = stored_element[i];
            if (element.type == 'rectangle'){
               _this.drawRectangle(baseContext, element.fromx, element.fromy, element.tox, element.toy);
            }else if (element.type == 'arrow'){
               _this.drawArrow(baseContext, element.fromx, element.fromy,element.tox,element.toy);
             }else if (element.type == 'pen'){
              for(var b = 0; b < element.points.length-1; b++){
                fromx = element.points[b][0];
                fromy = element.points[b][1];
                tox = element.points[b + 1][0];
                toy = element.points[b + 1][1];
                _this.drawPen(baseContext,fromx, fromy, tox, toy);
             }    
            }else if (element.type == 'text'){
               _this.drawText(baseContext, element.text, element.fromx,element.fromy, element.maxwidth);
            }
         }
      },

      clear: function(){
         //Clear Canvas
         drawingCanvas.width = drawingCanvas.width;
      },
      
      
      drawRectangle: function(context, x, y, w, h){
         context.beginPath();
         context.rect(x, y, w, h);
         context.fillStyle = 'transparent';
         context.fill();
         context.lineWidth = _this.options.linewidth;
         context.strokeStyle = _this.options.color;
         context.stroke();
      },
   
      drawArrow: function(context, x, y, w, h){
         var angle = Math.atan2(h-y,w-x);
         context.beginPath();
         context.lineWidth = _this.options.linewidth;
         context.moveTo(x, y);
         context.lineTo(w, h);
         context.lineTo(w-10*Math.cos(angle-Math.PI/6),h-10*Math.sin(angle-Math.PI/6));
         context.moveTo(w, h);
         context.lineTo(w-10*Math.cos(angle+Math.PI/6),h-10*Math.sin(angle+Math.PI/6));
         context.strokeStyle = _this.options.color;
         context.stroke();
      },

      drawPen: function(context, fromx, fromy, tox, toy){
         context.lineWidth = _this.options.linewidth;
         context.moveTo(fromx, fromy);
         context.lineTo(tox, toy);
         
         context.strokeStyle = _this.options.color;
         
         context.stroke();
      },
      
      wrapText: function(drawingContext, text, x, y, maxWidth, lineHeight) {
         var words = text.split(' ');
         var line = '';

         for(var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ';
            var metrics = drawingContext.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
               drawingContext.fillText(line, x, y);
               line = words[n] + ' ';
               y += lineHeight;
            }
            else {
               line = testLine;
            }
         }
         drawingContext.fillText(line, x, y);
      },
      
      drawText: function(context, text, x, y, maxWidth){
         context.font= _this.options.fontsize +" sans-serif";
         context.textBaseline = 'top';
         context.fillStyle = _this.options.color;
         _this.wrapText(context, text, x+3, y+4, maxWidth, 25) ;
      },
      
      
      // Events
      _selecttool: function(){
         _this.options.type = $(this).attr('id');
         if ($('#input_text').is(":visible")){
            var text = $('#input_text').val();
            $('#input_text').val('').hide();
            if (text != '' ){
               stored_element.push({'type':'text','text':text,'fromx':fromx,'fromy':fromy,'maxwidth':tox});
               if (stored_undo.length > 0){
                  stored_undo = [];
               }
            }
            _this.clear();
         }
      },
      
      _mousedown: function(event){
         clicked = true;
         var offset = _this.$el.offset();
         if ($('#input_text').is(":visible")){
            var text = $('#input_text').val();
            $('#input_text').val('').hide();
            if (text != '' ){
               if (!tox){
                  tox = 100;
               }
               _this.drawText(baseContext, text, fromx_text - offset.left, fromy_text- offset.top, tox);
               stored_element.push({'type':'text','text':text,'fromx':fromx_text - offset.left,'fromy':fromy_text- offset.top,'maxwidth':tox});
               if (stored_undo.length > 0){
                  stored_undo = [];
               }
            }
            _this.clear();
         }
         tox = null;
         toy = null;
         points = [];

         fromx = event.pageX - offset.left;
         fromy = event.pageY - offset.top;
         fromx_text = event.pageX;
         fromy_text = event.pageY;
         if (_this.options.type == 'text'){
            $('#input_text').css({"left": fromx_text+2, "top": fromy_text, "width": 0, "height": 0}).show();
         }
         if (_this.options.type == 'pen'){
            points.push([fromx,fromy]);
         }
      },
      
      _mouseup: function(event){
         clicked = false;
         if (toy != null && tox != null){
            if (_this.options.type=='rectangle'){
               _this.drawRectangle(baseContext, fromx, fromy, tox, toy);
               stored_element.push({'type':'rectangle','fromx':fromx,'fromy':fromy,'tox':tox,'toy':toy});
            }else if (_this.options.type == 'arrow'){
               _this.drawArrow(baseContext, fromx, fromy, tox, toy);
               stored_element.push({'type':'arrow','fromx':fromx,'fromy':fromy,'tox':tox,'toy':toy});
            }else if (_this.options.type == 'pen'){
               // console.log(points);
               stored_element.push({'type':'pen', 'points': points});
               for(var i = 0; i < points.length-1; i++){
                  fromx = points[i][0];
                  fromy = points[i][1];
                  tox = points[i + 1][0];
                  toy = points[i + 1][1];
                  _this.drawPen(baseContext,fromx, fromy, tox, toy);
               }    
               points = [];
            }else if (_this.options.type == 'text'){
               $('#input_text').css({left: fromx_text+2, top: fromy_text, width: tox-12, height: toy});
            }
            if (stored_undo.length > 0){
                  stored_undo = [];
            }
            _this.check_redo_undo();
            _this.clear();
         }else{
            if (_this.options.type == 'text'){
               $('#input_text').css({left: fromx_text+2, top: fromy_text, width: 100, height: 50});
            }
         }
      },
      
      _mousemove: function(event){
         if (clicked == false) return;
         // _this.clear();
         var offset = _this.$el.offset();
         if (_this.options.type == 'rectangle'){
            _this.clear();
            tox = event.pageX - offset.left - fromx;
            toy = event.pageY - offset.top - fromy;
            _this.drawRectangle(drawingContext, fromx, fromy, tox, toy);
         }else if (_this.options.type == 'arrow'){
            _this.clear();
            tox = event.pageX - offset.left;
            toy = event.pageY - offset.top;
            _this.drawArrow(drawingContext, fromx, fromy, tox, toy);
         }else if (_this.options.type == 'pen'){
            tox = event.pageX - offset.left;
            toy = event.pageY - offset.top;
            fromx = points[points.length - 1][0];
            fromy = points[points.length - 1][1];
            points.push([tox, toy])
            _this.drawPen(drawingContext,fromx, fromy, tox, toy);
         }else if (_this.options.type == 'text'){
            _this.clear();
            tox = event.pageX - fromx_text;
            toy = event.pageY - fromy_text;
            $('#input_text').css({left: fromx_text+2, top:fromy_text, width: tox-12, height: toy});
         }
      }
   };
   
   $.fn.annotate = function(options) {
      var opts = $.extend( {}, $.fn.annotate.defaults, options );
      annotate = new Annotate($(this), opts);
   };
   
   $.fn.annotate.defaults = {
      width: "640",
      height: "400",
      color:'red',
      type : 'rectangle',
      img: null,
      linewidth:2,
      fontsize:'20px',
      bootstrap: false,
      position: "top"
   };

})(jQuery);

   