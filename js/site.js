// Indicates whether the Wacom tablet driver (service) is installed.

function getWacomPlugin(){
  return document.getElementById('wtPlugin');
  }

$(document).ready(function() {
    var isWacom      = getWacomPlugin().penAPI.isWacom;
    var pressure     = getWacomPlugin().penAPI.pressure;
    var pentype      = getWacomPlugin().penAPI.pointerType;
    var canoffset    = $('.can:first-child').offset();
    var draw         = false;
    var lastPoint    = null;
    var lastPoint2    = null;
    var brushColor    = "#ff0000";
    var canvas       = $(".can:first-child")[0];
    var ctx           = canvas.getContext("2d");
    ctx.strokeStyle   = brushColor;
    var pixelDataRef  = new Firebase('https://sketchdaily.firebaseio.com/pixels');
    var mouseDown     = 0;

    var drawdata      = [];
    
    $('button').button();
    $('#menu').draggable();
    /*$('.brushsize').change(function() {
      $('#slider-vertical').slider("value", this.val());
    })*/


     $('#chat').click(function() {
           //check if eraser button is toggled
      $('#menu').toggle();
       
    })
   

    if (isWacom){
        $("#pressure").append(getWacomPlugin().penAPI.pressure);
    }
    $("#customcolor").spectrum({
      color: "#f00",
      showInput: true,
      showPalette: true,
      showSelectionPalette: true,
      palette: [ ],
      localStorageKey: "spectrum.homepage",
      clickoutFiresChange: true,
      preferredFormat: "hex",
      change: function(color) {
          brushColor = color.toHexString();
          console.log(brushColor);
      }
    });
    


    w = new WOAR();

    canvas.onmousedown = function () {mouseDown = 1;};
    canvas.onmouseout = canvas.onmouseup = function () {
      mouseDown = 0; lastPoint = null;
    };
//Draw a line from the mouse's last position to its current position
    var drawLineOnMouseMove = function(e) {
      if (!mouseDown) return;
      
      if (isWacom === true){
                $("#pvalue").html(getWacomPlugin().penAPI.pressure);
                pressure = getWacomPlugin().penAPI.pressure;
                pentype  = getWacomPlugin().penAPI.pointerType;
      }
      var brushSize;
      if (pentype == 1){
        brushSize = pressure * $('.brushsize').val();
      }else{
        brushSize = $('.brushsize').val();
      }

      e.preventDefault();

      // Bresenham's line algorithm. We use this to ensure smooth lines are drawn
      var offset = $("#wrapper").offset();
      var x1 = Math.floor((e.pageX - offset.left)),
        y1 = Math.floor((e.pageY - offset.top));
      var x0 = (lastPoint == null) ? x1 : lastPoint[0];
      var y0 = (lastPoint == null) ? y1 : lastPoint[1];
      var dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
      var sx = (x0 < x1) ? 1 : -1, sy = (y0 < y1) ? 1 : -1, err = dx - dy;
      while (true) {
        //write the pixel into Firebase, or if we are drawing white, remove the pixel
        
        //pixelDataRef.child(x0 + ":" + y0).set({bcolor: brushColor, size: brushSize});
        
        //just draw it
        var data = {"size":brushSize,"bcolor":brushColor, "x":x0, "y":y0};
        drawNow(data);
        // add to array for upload
        drawdata.push(data);

        if (x0 == x1 && y0 == y1) break;
        var e2 = 2 * err;
        if (e2 > -dy) {
          err = err - dy;
          x0 = x0 + sx;
        }
        if (e2 < dx) {
          err = err + dx;
          y0 = y0 + sy;
        }
      }
      lastPoint = [x1, y1];

    };

    $(canvas).mousemove(drawLineOnMouseMove);
    $(canvas).mousedown(drawLineOnMouseMove);
    $(canvas).mouseup(function(){uploadDraw(drawdata);});
    $(canvas).mouseleave(function(){uploadDraw(drawdata);});

// Add callbacks that are fired any time the pixel data changes and adjusts the canvas appropriately.
    // Note that child_added events will be fired for initial pixel data as well.
    var drawPixel = function(snapshot) {
      var coords = snapshot.name().split(":");
      var data = snapshot.val();
      console.log(data.bcolor);
      /*ctx.fillStyle = data.bcolor;
      ctx.fillRect(parseInt(coords[0]), parseInt(coords[1]), 10, 10);
      */

      ctx.strokeStyle = data.bcolor;
      ctx.lineWidth = data.size;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(parseInt(coords[0])-1, parseInt(coords[1])-1);
      ctx.lineTo(parseInt(coords[0]), parseInt(coords[1]));
      ctx.stroke();
    };

    var drawPixelArray = function(snapshot) {

      var data = snapshot.val();
      console.log(data);
      var datalength = data.drawdata.length, item = null;
        for (var i = 0; i < datalength; i++){
            item = data.drawdata[i];

          ctx.strokeStyle = item.bcolor;
          ctx.lineWidth = item.size;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(parseInt(item.x)-1, parseInt(item.y)-1);
          ctx.lineTo(parseInt(item.x), parseInt(item.y));
          ctx.stroke();
        }
      
    };


    var drawNow = function(data) {
      //chrome doesn't like this
      console.log(data.bcolor);
      ctx.strokeStyle = data.bcolor;
      ctx.lineWidth = data.size;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(parseInt(data.x)-1, parseInt(data.y)-1);
      ctx.lineTo(parseInt(data.x), parseInt(data.y));
      ctx.stroke();
    };
    

    
    var uploadDraw = function(data){
      var timestamp = new Date().getUTCMilliseconds();
      pixelDataRef.child(window.name + timestamp).set({drawdata: data});
      drawdata = [];
    };

    pixelDataRef.on('child_added', drawPixelArray);
    //pixelDataRef.on('child_changed', drawPixel);














            function findPos(obj) {
            var curleft = 0, curtop = 0;
            if (obj.offsetParent) {
                do {
                    curleft += obj.offsetLeft;
                    curtop += obj.offsetTop;
                } while (obj = obj.offsetParent);
                return { x: curleft, y: curtop };
                }
                return undefined;
            }

            function rgbToHex(r, g, b) {
                if (r > 255 || g > 255 || b > 255)
                    throw "Invalid color component";
                return ((r << 16) | (g << 8) | b).toString(16);
            }





      //eraser
        $('button.eraser').click(function() {
           //check if eraser button is toggled
        if($("button.eraser").hasClass('active')){
               ctx.globalCompositeOperation = "source-over";
                ctx.strokeStyle = color;
                

        }else{
               ctx.globalCompositeOperation = "destination-out";
               ctx.strokeStyle = "rgba(255,255,255,255)";
                
              }
          
         });

        

      //delete drawings
        $("#deletedrawings").click(function(){
                 // Store the current transformation matrix
                  pixelDataRef.remove();

                  ctx.save();

                  // Use the identity matrix while clearing the canvas
                  ctx.setTransform(1, 0, 0, 1, 0, 0);
                  ctx.clearRect(0, 0, canvas.width, canvas.height);

                  // Restore the transform
                  ctx.restore();
                  pixelDataRef.remove();

        });

        
      //colorwheel stuff
        
       // Raphael.colorwheel($(".colorwheel")[0], 150).color("#F00").onchange(function(c){$(".input_example").css("background-color",c.hex);brushColor = c.hex;ctx.globalCompositeOperation = "source-over";});

            $( "#slider-vertical" ).slider({
                orientation: "vertical",
                range: "min",
                min: 0,
                max: 100,
                value: 5,
                step: 1,
                  slide: function( event, ui ) {
                    $( ".brushsize" ).val( ui.value );
                  }
            });
            $( ".brushsize" ).val( $( "#slider-vertical" ).slider( "value" ) );




      //save canvas

        //function helps convert CSS properties to Canvas properties
        function removepx(mystring){
          var newstring = new String(mystring);
          var pxstart = newstring.search('p');
            if (newstring.search('-') > -1){
              var start = 1;
            }else { var start = 0;}

          var cleanstring = newstring.slice(start, pxstart);
          return cleanstring;
        }

        $('#save').click(function() {
            var can2 = document.getElementById('canvasbuffer');
            var ctx2 = can2.getContext('2d');
            ctx2.font = "13px Arial";
            ctx2.fillStyle ="#ffffff";


                  //first clear the canvas
                  ctx2.save();
                  ctx2.setTransform(1, 0, 0, 1, 0, 0);
                  ctx2.clearRect(0, 0, canvas.width, canvas.height);
                  ctx2.restore();
              
              bg_img_loc = $('#wrapper').css('background-image');
              img_split_str = bg_img_loc.split('"');
              
              var img_bg = new Image();
              img_bg.src = img_split_str[1]
                
              
              ctx2.drawImage(img_bg, 0, 0, 850, 850);

              //goes through each of the pawns on the map and draws them on the buffer canvas
              $('.pawn div').each(function(index) {
                  var offset2 = $(this).offset();
                  var canvasoffset = $("#can").offset();

                  posx =  offset2.left - canvasoffset.left;
                  posy = offset2.top -canvasoffset.top;

                  var imgstring = new String($(this).css('background-image'));
                  
                    var imgh = removepx($(this).css('height'));
                    var imgw = removepx($(this).css('width'));

                    var crop = new String($(this).css('background-position'));
                    var crop_split;
                    
                    crop_split = crop.split(' ');
                     
                    var cropx = removepx(crop_split[0]);
                    var cropy = removepx(crop_split[1]);

                    var split_str, new_str;
                    split_str = imgstring.split('"');
                  

                    var img_loc = new Image();
                    img_loc.src = split_str[1]
 
                  ctx2.drawImage(img_loc, cropx, cropy, imgw, imgh, posx, posy, imgw, imgh);
                  var texty = parseInt(posy) + parseInt(imgh) + 10; 
                  var content = $(this).parent().text();
                  ctx2.fillText(content,posx,texty);
                  

                });
              

            // imgur stuff
            ctx2.drawImage(canvas, 0, 0);
            try {
                var img = can2.toDataURL('image/jpeg', 0.9).split(',')[1];
            } catch(e) {
                var img = can2.toDataURL().split(',')[1];
            }
            // open the popup in the click handler so it will not be blocked
            var w = window.open();
            w.document.write('Uploading...');
            // upload to imgur using jquery/CORS
            // https://developer.mozilla.org/En/HTTP_access_control
            $.ajax({
                url: 'http://api.imgur.com/2/upload.json',
                type: 'POST',
                data: {
                    type: 'base64',
                    // get your key here, quick and fast http://imgur.com/register/api_anon
                    key: '5d329282c17e4e1a1a7d32663fd55cf9',
                    name: map_name,
                    title: map_name,
                    caption: map_name,
                    image: img
                },
                dataType: 'json'
            }).success(function(data) {
                w.location.href = data['upload']['links']['imgur_page'];
            }).error(function() {
                alert('Could not reach api.imgur.com. Sorry :(');
                w.close();
            });


            
        });



     });