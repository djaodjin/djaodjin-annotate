/*
annotate.js
Copyright (c) 2015, Djaodjin Inc.
MIT License
*/

/*global document jQuery Image:true*/

(function ($) {
   "use strict";

   function Annotate(el, options){
      this.options = options;
      this.$el = $(el);
      this.clicked = false;
      this.fromx = null;
      this.fromy = null;
      this.fromxText = null;
      this.fromyText = null;
      this.tox = null;
      this.toy = null;
      this.points = [];
      this.storedUndo = [];
      this.storedElement = [];
      this.img = null;
      this.init();
   }

   Annotate.prototype = {
      init: function () {
         var self = this;
         self.$el.addClass("annotate-container");
         self.$el.css({cursor: "crosshair"});
         self.$el.append($("<canvas id=\"baseLayer\"></canvas>"));
         self.$el.append($("<canvas id=\"drawingLayer\"></canvas>"));
         self.baseCanvas = document.getElementById("baseLayer");
         self.drawingCanvas = document.getElementById("drawingLayer");
         self.baseContext = self.baseCanvas.getContext("2d");
         self.drawingContext = self.drawingCanvas.getContext("2d");

         self.baseContext.lineJoin = "round";
         self.drawingContext.lineJoin = "round";

         var classPosition1 = "btn-group";
         var classPosition2 = "";

         if( self.options.position === "left"
             || self.options.position === "right" ){
             classPosition1 = "btn-group-vertical";
             classPosition2 = "btn-block";
         }

         self.$el.css({"border": "1px solid black"});
         if (self.options.bootstrap){
            /*jshint multistr: true */
            $("body").append("<div id=\"annotate_tools\">"
               + "<button id=\"undoaction\" title=\"Undo the last annotation\""
               + " class=\"btn btn-primary " + classPosition2 + "\">"
               + "<i class=\"glyphicon glyphicon-arrow-left\"></i></button>"
               + "<div class=\"" + classPosition1 + "\" data-toggle=\"buttons\">"
               + "<label class=\"btn btn-primary active\">"
               + "<input type=\"radio\" name=\"tool_option\" id=\"rectangle\""
               + " data-toggle=\"tooltip\" data-placement=\"top\""
               + " title=\"Draw an rectangle\"><i class=\"glyphicon glyphicon-unchecked\"></i>"
               + "</label>"
               + "<label class=\"btn btn-primary\">"
               + "<input type=\"radio\" name=\"tool_option\" id=\"circle\""
               + " data-toggle=\"tooltip\" data-placement=\"top\" title=\"Write some text\">"
               + "<i class=\"glyphicon glyphicon-copyright-mark\"></i>"
               + "</label>"
               + "<label class=\"btn btn-primary\">"
               + "<input type=\"radio\" name=\"tool_option\" id=\"text\""
               + " data-toggle=\"tooltip\" data-placement=\"top\" title=\"Write some text\">"
               + "<i class=\"glyphicon glyphicon-font\"></i>"
               + "</label>"
               + "<label class=\"btn btn-primary\">"
               + "<input type=\"radio\" name=\"tool_option\" id=\"arrow\""
               + " data-toggle=\"tooltip\" data-placement=\"top\" title=\"Draw an arrow\">"
               + "<i class=\"glyphicon glyphicon-arrow-up\"></i>"
               + "</label>"
               + "<label class=\"btn btn-primary\">"
               + "<input type=\"radio\" name=\"tool_option\" id=\"pen\""
               + " data-toggle=\"tooltip\" data-placement=\"top\" title=\"Pen Tool\">"
               + "<i class=\"glyphicon glyphicon-pencil\"></i>"
               + "</label>"
               + "</div>"
               + "<button type=\"button\" id=\"redoaction\""
               + " title=\"Redo the last undone annotation\""
               + "class=\"btn btn-primary " + classPosition2 + "\">"
               + "<i class=\"glyphicon glyphicon-arrow-right\"></i></button>"
               + "</div>");
         }else{
            $("body").append("<div id=\"annotate_tools\" style=\"display:inline-block\">"
               + "<button id=\"undoaction\">UNDO</button>"
               + "<input type=\"radio\" name=\"tool_option\" id=\"rectangle\" checked>RECTANGLE"
               + "<input type=\"radio\" name=\"tool_option\" id=\"circle\">CIRCLE"
               + "<input type=\"radio\" name=\"tool_option\" id=\"text\"> TEXT"
               + "<input type=\"radio\" name=\"tool_option\" id=\"arrow\">ARROW"
               + "<input type=\"radio\" name=\"tool_option\" id=\"pen\">PEN"
               + "<button id=\"redoaction\" title=\"Redo the last undone annotation\">REDO</button>"
               + "</div>");
         }
         var canvasPosition = self.$el.offset();

         if (self.options.position === "top" || (self.options.position !== "top" && !self.options.bootstrap)){
            $("#annotate_tools").css({"position": "absolute", "top": canvasPosition.top - 35, "left": canvasPosition.left});
         }else{
            if (self.options.position === "left" && self.options.bootstrap){
               $("#annotate_tools").css({"position": "absolute", "top": canvasPosition.top - 35, "left": canvasPosition.left - 20});
            }else if (self.options.position === "right" && self.options.bootstrap){
               $("#annotate_tools").css({"position": "absolute", "top": canvasPosition.top - 35, "left": canvasPosition.left + self.baseCanvas.width + 20});
            }else if (self.options.position === "bottom" && self.options.bootstrap){
               $("#annotate_tools").css({"position": "absolute", "top": canvasPosition.top + self.baseCanvas.height + 35, "left": canvasPosition.left});
            }
         }

         $("body").append("<textarea id=\"input_text\""
+ " style=\"position:absolute;z-index:100000;display:none;top:0;left:0;"
+ "background:transparent;border:1px dotted; line-height:25px;"
             + ";font-size:" + self.options.fontsize
             + ";font-family:sans-serif;color:" + self.options.color
             + ";word-wrap: break-word;outline-width: 0;overflow: hidden;"
+ "padding:0px\"></textarea>");

         if (self.options.img){
            self.img = new Image();
            self.img.src = self.options.img;
            self.img.onload = function () {
               if (!(self.options.width && self.options.height)){
                  self.options.width = this.width;
                  self.options.height = this.height;
               }
               self.baseCanvas.width = self.drawingCanvas.width = self.options.width;
               self.baseCanvas.height = self.drawingCanvas.height = self.options.height;
               self.baseContext.drawImage(self.img, 0, 0, self.options.width, self.options.height);
            };
         }else{
            if (!self.options.width && !self.options.height){
               self.options.width = 640;
               self.options.height = 480;
            }
            self.baseCanvas.width = self.drawingCanvas.width = self.options.width;
            self.baseCanvas.height = self.drawingCanvas.height = self.options.height;
         }

         $(document).on("change", "input[name=\"tool_option\"]", function(){
            self.selectTool($(this));
         });

         $(document).on("click", "#redoaction", function(event){
            self.redoaction(event);
         });
         $(document).on("click", "#undoaction", function(event){
            self.undoaction(event);
         });
         self.$el.on("mousedown", function(event){
            self.mousedown(event);
         });
         $(document).on("mouseup", function(event){
            self.mouseup(event);
         });
         self.$el.on("mousemove", function(event){
            self.mousemove(event);
         });
         self.checkUndoRedo();
      },

      checkUndoRedo: function(){
         var self = this;
         if (self.storedUndo.length === 0){
            $("#redoaction").attr("disabled", true);
         }else{
            $("#redoaction").attr("disabled", false);
         }
         if (self.storedElement.length === 0){
            $("#undoaction").attr("disabled", true);
         }else{
            $("#undoaction").attr("disabled", false);
         }
      },

      undoaction: function(event){
         event.preventDefault();
         var self = this;
         self.storedUndo.push(self.storedElement[self.storedElement.length - 1]);
         self.storedElement.pop();
         self.checkUndoRedo();
         self.clear();
         self.redraw();
      },

      redoaction: function(event){
         event.preventDefault();
         var self = this;
         self.storedElement.push(self.storedUndo[self.storedUndo.length - 1]);
         self.storedUndo.pop();
         self.checkUndoRedo();
         self.clear();
         self.redraw();
      },

      redraw: function(){
         var self = this;
         self.baseCanvas.width = self.baseCanvas.width;
         if (self.options.img){
           self.baseContext.drawImage(self.img, 0, 0, self.options.width, self.options.height);
         }
         if (self.storedElement.length === 0) {
            return;
         }
         // clear each stored line
         for (var i = 0; i < self.storedElement.length; i++) {
            var element = self.storedElement[i];
            if (element.type === "rectangle"){
               self.drawRectangle(self.baseContext, element.fromx, element.fromy, element.tox, element.toy);
            }else if (element.type === "arrow"){
               self.drawArrow(self.baseContext, element.fromx, element.fromy, element.tox, element.toy);
             }else if (element.type === "pen"){
              for(var b = 0; b < element.points.length - 1; b++){
                var fromx = element.points[b][0];
                var fromy = element.points[b][1];
                var tox = element.points[b + 1][0];
                var toy = element.points[b + 1][1];
                self.drawPen(self.baseContext, fromx, fromy, tox, toy);
             }
            }else if (element.type === "text"){
               self.drawText(self.baseContext, element.text, element.fromx, element.fromy, element.maxwidth);
            }else if (element.type === "circle"){
              self.drawCircle(self.baseContext, element.fromx, element.fromy, element.tox, element.toy);
            }
         }
      },

      clear: function(){
         var self = this;
         //Clear Canvas
         self.drawingCanvas.width = self.drawingCanvas.width;
      },

      drawRectangle: function(context, x, y, w, h){
         var self = this;
         context.beginPath();
         context.rect(x, y, w, h);
         context.fillStyle = "transparent";
         context.fill();
         context.lineWidth = self.options.linewidth;
         context.strokeStyle = self.options.color;
         context.stroke();
      },

      drawCircle: function(context, x1, y1, x2, y2){
        var radiusX = (x2 - x1) * 0.5,
          radiusY = (y2 - y1) * 0.5,
          centerX = x1 + radiusX,
          centerY = y1 + radiusY,
          step = 0.01,
          a = step,
          pi2 = Math.PI * 2 - step,
          self = this;

        context.beginPath();
        context.moveTo(centerX + radiusX * Math.cos(0), centerY + radiusY * Math.sin(0));

        for(; a < pi2; a += step) {
          context.lineTo(centerX + radiusX * Math.cos(a),
                centerY + radiusY * Math.sin(a));
        }
        context.lineWidth = self.options.linewidth;
        context.strokeStyle = self.options.color;
        context.closePath();
        context.stroke();
      },

      drawArrow: function(context, x, y, w, h){
         var self = this;
         var angle = Math.atan2(h - y, w - x);
         context.beginPath();
         context.lineWidth = self.options.linewidth;
         context.moveTo(x, y);
         context.lineTo(w, h);
         context.lineTo(w - 10 * Math.cos(angle - Math.PI / 6), h - 10 * Math.sin(angle - Math.PI / 6));
         context.moveTo(w, h);
         context.lineTo(w - 10 * Math.cos(angle + Math.PI / 6), h - 10 * Math.sin(angle + Math.PI / 6));
         context.strokeStyle = self.options.color;
         context.stroke();
      },

      drawPen: function(context, fromx, fromy, tox, toy){
         var self = this;
         context.lineWidth = self.options.linewidth;
         context.moveTo(fromx, fromy);
         context.lineTo(tox, toy);
         context.strokeStyle = self.options.color;
         context.stroke();
      },

      wrapText: function(drawingContext, text, x, y, maxWidth, lineHeight) {
         var words = text.split(" ");
         var line = "";
         for(var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + " ";
            var metrics = drawingContext.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
               drawingContext.fillText(line, x, y);
               line = words[n] + " ";
               y += lineHeight;
            }
            else {
               line = testLine;
            }
         }
         drawingContext.fillText(line, x, y);
      },

      drawText: function(context, text, x, y, maxWidth){
         var self = this;
         context.font = self.options.fontsize + " sans-serif";
         context.textBaseline = "top";
         context.fillStyle = self.options.color;
         self.wrapText(context, text, x + 3, y + 4, maxWidth, 25);
      },

      // Events
      selectTool: function(element) {
         var self = this;
         self.options.type = element.attr("id");
         if ($("#input_text").is(":visible")){
            var text = $("#input_text").val();
            $("#input_text").val("").hide();
            if( text ) {
               self.storedElement.push({
                   type: "text",
                   text: text,
                   fromx: self.fromx,
                   fromy: self.fromy,
                   maxwidth: self.tox});
               if (self.storedUndo.length > 0){
                  self.storedUndo = [];
               }
            }
            self.redraw();
         }
      },

      mousedown: function(event){
         var self = this;
         self.clicked = true;
         var offset = self.$el.offset();
         if ($("#input_text").is(":visible")){
            var text = $("#input_text").val();
            $("#input_text").val("").hide();
            if (text !== "" ){
               if (!self.tox){
                  self.tox = 100;
               }
               self.drawText(self.baseContext, text, self.fromxText - offset.left, self.fromyText - offset.top, self.tox);
               self.storedElement.push({
                     type: "text",
                     text: text,
                     fromx: self.fromxText - offset.left,
                     fromy: self.fromyText - offset.top,
                     maxwidth: self.tox});
               if (self.storedUndo.length > 0){
                  self.storedUndo = [];
               }
            }
            self.clear();
         }
         self.tox = null;
         self.toy = null;
         self.points = [];

         self.fromx = event.pageX - offset.left;
         self.fromy = event.pageY - offset.top;
         self.fromxText = event.pageX;
         self.fromyText = event.pageY;
         if (self.options.type === "text"){
            $("#input_text").css({
                  left: self.fromxText + 2, top: self.fromyText,
                  width: 0, height: 0}).show();
         }
         if (self.options.type === "pen"){
            self.points.push([self.fromx, self.fromy]);
         }
      },

      mouseup: function(){
          var self = this;
         this.clicked = false;
         if( self.toy !== null && self.tox !== null ) {
             if (self.options.type === "rectangle" ) {
               self.storedElement.push({type: "rectangle",
                   fromx: self.fromx, fromy: self.fromy,
                   tox: self.tox, toy: self.toy});
            } else if (self.options.type === "circle" ) {
             self.storedElement.push({type: "circle",
               fromx: self.fromx, fromy: self.fromy,
               tox: self.tox, toy: self.toy});
           } else if (self.options.type === "arrow"){
               self.storedElement.push({type: "arrow",
                   fromx: self.fromx, fromy: self.fromy,
                   tox: self.tox, toy: self.toy});
            } else if (self.options.type === "text" ){
               $("#input_text").css({
                   left: self.fromxText + 2, top: self.fromyText,
                   width: self.tox - 12, height: self.toy});
            }else if (self.options.type === "pen"){
            self.storedElement.push({type: "pen",
                   points: self.points});

            for(var i = 0; i < self.points.length - 1; i++){
               self.fromx = self.points[i][0];
               self.fromy = self.points[i][1];
               self.tox = self.points[i + 1][0];
               self.toy = self.points[i + 1][1];
               self.drawPen(self.baseContext, self.fromx, self.fromy, self.tox, self.toy);
            }
            self.points = [];
         }
            if (self.storedUndo.length > 0){
                  self.storedUndo = [];
            }
            self.checkUndoRedo();
            self.redraw();
         } else {
            if (self.options.type === "text"){
               $("#input_text").css({
                   left: self.fromxText + 2, top: self.fromyText,
                   width: 100, height: 50});
            }
         }
      },

      mousemove: function(event){
         var self = this;
         if (!self.clicked) { return; }
         var offset = self.$el.offset();
         if (self.options.type === "rectangle"){
            self.clear();
            self.tox = event.pageX - offset.left - self.fromx;
            self.toy = event.pageY - offset.top - self.fromy;
            self.drawRectangle(self.drawingContext, self.fromx, self.fromy, self.tox, self.toy);
         }else if (self.options.type === "arrow"){
            self.clear();
            self.tox = event.pageX - offset.left;
            self.toy = event.pageY - offset.top;
            self.drawArrow(self.drawingContext, self.fromx, self.fromy, self.tox, self.toy);
         }else if (self.options.type === "pen"){
            self.tox = event.pageX - offset.left;
            self.toy = event.pageY - offset.top;
            self.fromx = self.points[self.points.length - 1][0];
            self.fromy = self.points[self.points.length - 1][1];
            self.points.push([self.tox, self.toy]);
            self.drawPen(self.drawingContext, self.fromx, self.fromy, self.tox, self.toy);
         }else if (self.options.type === "text"){
            self.clear();
            self.tox = event.pageX - self.fromxText;
            self.toy = event.pageY - self.fromyText;
            $("#input_text").css({
               left: self.fromxText + 2, top: self.fromyText,
               width: self.tox - 12, height: self.toy
            });
         }else if(self.options.type === "circle"){
           self.clear();
           self.tox = event.pageX - offset.left;
           self.toy = event.pageY - offset.top;
           self.drawCircle(self.drawingContext, self.fromx, self.fromy, self.tox, self.toy);
         }
      }
   };

   $.fn.annotate = function(options) {
      var opts = $.extend( {}, $.fn.annotate.defaults, options );
      return new Annotate($(this), opts);
   };

   $.fn.annotate.defaults = {
      width: null,
      height: null,
      img: null,
      color: "red",
      type: "rectangle",
      linewidth: 2,
      fontsize: "20px",
      bootstrap: false,
      position: "top"
   };

})(jQuery);
