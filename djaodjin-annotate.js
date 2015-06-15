/* djaodjin-annotate.js
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
       this.storedUndo = [];
       this.storedElement = [];
       this.img = null;
       this.init();
   }

    Annotate.prototype = {
        init: function () {
            var self = this;
            self.canvas = document.getElementById(self.$el.attr("id"));
            self.context = self.canvas.getContext("2d");
            if( self.options.width && self.options.height ) {
                self.resize(self.options.width, self.options.height);
            }
            self.checkUndoRedo();

            var classPosition1 = "btn-group";
            var classPosition2 = "";

            if( self.options.position === "left"
                || self.options.position === "right" ){
                classPosition1 = "btn-group-vertical";
                classPosition2 = "btn-block";
            }

            self.$el.css({border: "1px solid black"});
            if( self.options.bootstrap ){
            /*jshint multistr: true */
            $("body").append("<div id=\"annotate_tools\">"
+ "<a id=\"undoaction\" title=\"Undo the last annotation\""
+ " class=\"btn btn-primary " + classPosition2 + "\">"
+ "<i class=\"fa fa-undo\"></i></a>"
+ "<div class=\"" + classPosition1 + "\" data-toggle=\"buttons\">"
+ "  <label class=\"btn btn-primary active\">"
+ "    <input type=\"radio\" name=\"tool_option\" id=\"rectangle\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Draw an rectangle\"><i class=\"fa fa-square-o\"></i></label>"
+ "  <label class=\"btn btn-primary\">"
+ "    <input type=\"radio\" name=\"tool_option\" id=\"text\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Write some text\"> T</label>"
+ "  <label class=\"btn btn-primary\">"
+ "    <input type=\"radio\" name=\"tool_option\" id=\"arrow\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Draw an arrow\"> <i class=\"fa fa-long-arrow-up\"></i></label>"
+ "</div>"
+ "<a type=\"button\" id=\"redoaction\" title=\"Redo the last undone "
+ "annotation\" class=\"btn btn-primary " + classPosition2
+ "\"><i class=\"fa fa-undo fa-flip-horizontal\"></i></a>"
+ "</div>");
            } else {
                $("body").append("<div id=\"annotate_tools\""
+ " style=\"display:inline-block\">"
+ "<button id=\"undoaction\">UNDO</button>"
+ "<input type=\"radio\" name=\"tool_option\" id=\"rectangle\" checked>RECTANGLE"
+ "<input type=\"radio\" name=\"tool_option\" id=\"text\">TEXT"
+ "<input type=\"radio\" name=\"tool_option\" id=\"arrow\">ARROW"
+ "<button id=\"redoaction\" title=\"Redo the last undone annotation\">REDO</button>"
+ "</div>");
            }
         if (self.options.position !== "top" && !self.options.bootstrap){
            $("#annotate_tools").append("<em>Position option available only with <a href=\"http://getbootstrap.com/\" target=\"_blank\">Bootstrap</a></em>");
         }

         $("body").append("<textarea id=\"input_text\""
+ " style=\"position:absolute;z-index:100000;display:none;top:0;left:0;"
+ "background:transparent;border:1px dotted; line-height:25px;"
             + ";font-size:" + self.options.fontsize
             + ";font-family:sans-serif;color:" + self.options.color
             + ";word-wrap: break-word;outline-width: 0;overflow: hidden;"
+ "padding:0px\"></textarea>");

         if( self.options.img ) {
            self.img = new Image();
            self.img.src = self.options.img;
            self.img.onload = function () {
                self.redraw();
            };
         }

         $(document).on(
             "change", "input[name=\"tool_option\"]", self.selectTool);
         $(document).on("click", "#redoaction", self.redoaction);
         $(document).on("click", "#undoaction", self.undoaction);
         self.$el.on("mousedown", self.mousedown);
         self.$el.on("mouseup", self.mouseup);
         self.$el.on("mousemove", self.mousemove);
         self.checkUndoRedo();
      },

      resize: function(width, height) {
         var self = this;
         $("#annotate_section").css({width: width, height: height});
         var position = self.$el.offset();
         if( self.options.position === "top" ||
             (self.options.position !== "top" && !self.options.bootstrap) ) {
            $("#annotate_tools").css({position: "absolute",
                top: position.top - 35,
                left: position.left});
         } else {
            if( self.options.position === "left" && self.options.bootstrap ) {
               $("#annotate_tools").css({position: "absolute",
                   top: position.top - 35,
                   left: position.left - 20});
            } else if( self.options.position === "right"
                       && self.options.bootstrap ) {
               $("#annotate_tools").css({position: "absolute",
                   top: position.top - 35,
                   left: position.left + self.canvas.width + 20});
            } else if( self.options.position === "bottom"
                       && self.options.bootstrap ){
                $("#annotate_tools").css({position: "absolute",
                   top: position.top + self.canvas.height + 35,
                   left: position.left});
            }
         }
      },

      checkUndoRedo: function(){
         var self = this;
         if( self.storedUndo.length === 0 ) {
            $("#redoaction").attr("disabled", true);
         } else {
            $("#redoaction").attr("disabled", false);
         }
         if( self.storedElement.length === 0 ) {
            $("#undoaction").attr("disabled", true);
         } else {
            $("#undoaction").attr("disabled", false);
         }
      },

      undoaction: function(event){
         var self = this;
         event.preventDefault();
         self.storedUndo.push(
             self.storedElement[self.storedElement.length - 1]);
         self.storedElement.pop();
         self.checkUndoRedo();
         self.redraw();
      },

      redoaction: function(event){
         var self = this;
         event.preventDefault();
         self.storedElement.push(
             self.storedUndo[self.storedUndo.length - 1]);
         self.storedUndo.pop();
         self.checkUndoRedo();
         self.redraw();
      },

      redraw: function() {
          var self = this;
          self.canvas.width = self.canvas.width;
          if( self.img ) {
               var width = (self.options.width > 0 ?
                   self.options.width : self.img.width);
               var height = (self.options.height > 0 ?
                   self.options.height : self.img.height);
               self.resize(width, height);
               self.context.drawImage(self.img, 0, 0, width, height);
          }

          if (self.storedElement.length === 0) { return; }

         // redraw each stored line
         for (var i = 0; i < self.storedElement.length; i++) {
            var element = self.storedElement[i];
            if (element.type === "rectangle") {
               self.drawRectangle(
                   element.fromx, element.fromy,
                   element.tox, element.toy);
            }else if (element.type === "arrow") {
               self.drawArrow(
                   element.fromx, element.fromy,
                   element.tox, element.toy);
            }else if (element.type === "text") {
               self.drawText(
                   element.text, element.fromx,
                   element.fromy, element.maxwidth);
            }
         }
      },

      drawRectangle: function(x, y, w, h) {
         var self = this;
         self.context.beginPath();
         self.context.rect(x, y, w, h);
         self.context.fillStyle = "transparent";
         self.context.fill();
         self.context.lineWidth = self.options.linewidth;
         self.context.strokeStyle = self.options.color;
         self.context.stroke();
      },

      drawArrow: function(x, y, w, h) {
         var self = this;
         var angle = Math.atan2(h - y, w - x);
         self.context.beginPath();
         self.context.lineWidth = self.options.linewidth;
         self.context.moveTo(x, y);
         self.context.lineTo(w, h);
         self.context.lineTo(
             w - 10 * Math.cos(angle - Math.PI / 6),
             h - 10 * Math.sin(angle - Math.PI / 6));
         self.context.moveTo(w, h);
         self.context.lineTo(
             w - 10 * Math.cos(angle + Math.PI / 6),
             h - 10 * Math.sin(angle + Math.PI / 6));
         self.context.strokeStyle = self.options.color;
         self.context.stroke();
      },

      wrapText: function(context, text, x, y, maxWidth, lineHeight) {
         var words = text.split(" ");
         var line = "";

         for(var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + " ";
            var metrics = context.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
               context.fillText(line, x, y);
               line = words[n] + " ";
               y += lineHeight;
            }
            else {
               line = testLine;
            }
         }
         context.fillText(line, x, y);
      },

      drawText: function(text, x, y, maxWidth) {
         var self = this;
         self.context.font = self.options.fontsize + " sans-serif";
         self.context.textBaseline = "top";
         self.context.fillStyle = self.options.color;
         self.wrapText(self.context, text, x + 3, y + 4, maxWidth, 25);
      },

      // Events
      selectTool: function() {
         var self = this;
         self.options.type = $(this).attr("id");
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
         var offset = self.$el.offset();
         self.clicked = true;
         if ($("#input_text").is(":visible")){
             var text = $("#input_text").val();
             $("#input_text").val("").hide();
             if( text ) {
                 if( !self.tox ) {
                     self.tox = 100;
                 }
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
             self.redraw();
         }
          self.tox = null;
          self.toy = null;
          self.fromx = event.pageX - offset.left;
          self.fromy = event.pageY - offset.top;
          self.fromxText = event.pageX;
          self.fromyText = event.pageY;
          if (self.options.type === "text") {
              $("#input_text").css({
                  left: self.fromxText + 2, top: self.fromyText,
                  width: 0, height: 0}).show();
          }
      },

      mouseup: function(){ // unused parameter event?
          var self = this;
         this.clicked = false;
         if( self.toy !== null && self.tox !== null ) {
             if (self.options.type === "rectangle" ) {
               self.storedElement.push({type: "rectangle",
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
         if( !self.clicked ) { return; }
         self.redraw();
         var offset = self.$el.offset();
         if (self.options.type === "rectangle"){
            self.tox = event.pageX - offset.left - self.fromx;
            self.toy = event.pageY - offset.top - self.fromy;
            self.drawRectangle(self.fromx, self.fromy, self.tox, self.toy);
         }else if (self.options.type === "arrow"){
            self.tox = event.pageX - offset.left;
            self.toy = event.pageY - offset.top;
            self.drawArrow(self.fromx, self.fromy, self.tox, self.toy);
         }else if (self.options.type === "text"){
            self.tox = event.pageX - self.fromxText;
            self.toy = event.pageY - self.fromyText;
            $("#input_text").css({
                left: self.fromxText + 2, top: self.fromyText,
                width: self.tox - 12, height: self.toy});
         }
      }
   };

   $.fn.annotate = function(options) {
      var opts = $.extend( {}, $.fn.annotate.defaults, options );
      return new Annotate($(this), opts);
   };

   $.fn.annotate.defaults = {
      width: 640,
      hegiht: 480,
      img: null,
      color: "red",
      type: "rectangle",
      linewidth: 2,
      fontsize: "20px",
      bootstrap: false,
      position: "top"
   };

})(jQuery);
