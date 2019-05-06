var serverUrl="https://9224e1eb.ngrok.io";
var service_uuid="75cf7374-a137-47e7-95e5-e675189c8a3e";
var characteristic_uuid="0d563a58-196a-48ce-ace2-dfec78acc814";
var dataReader=null;
var connectedDevice=null;
var serialRead = '';
var lastRead = new Date();
var lastX1=0;
var lastY1=0;
var lastX2=0;
var lastY2=0;
var lastTouch1=0;
var lastTouch2=0;
var activeButton1=null;
var activeButton2=null;
var hoverHits1=[];
var hoverHits2=[];
var oldHoverHits1=[];
var oldHoverHits2=[];
var speechRecognitionActive=false;
var callActive=false;
var focusedInput=null;
var turnOffTrigger=0;
var scrollValue=0;
var swipeValue=0;
var smsOptions = {
        replaceLineBreaks: false, // true to replace \n by a new line, false by default
        android: {
          //  intent: 'INTENT'  // send SMS with the native android SMS messaging
            intent: '' // send SMS without open any other app
        }
      }
var options = {
  language:"en-US",
  matches:1,
  prompt:"Resnicd",
  showPopup:false,
  showPartial:false}


/* START BTS communication */
// renderer process
var ipcRenderer = require('electron').ipcRenderer;
$(document).ready(function(){
ipcRenderer.on('bluetoothData', function (event,data) {
  showData(data);
});
});


/* END BTS communication */

function moveCursor(cursorX,cursorY,cursor){
  //  $(cursor).velocity("stop");
    $(cursor).css({left: cursorX+'px',
              bottom: cursorY+'px'});//,{ duration: 0 ,queue:false});

}
function showData(data){
  var x1 = data.substring(0,data.indexOf(","));
  var y1 = data.substring(getPosition(data,",",1)+1,getPosition(data,",",2));
  var touch1 = data.substring(getPosition(data,",",2)+1,getPosition(data,",",3));

  var x2 = data.substring(getPosition(data,",",3)+1,getPosition(data,",",4));
  var y2 = data.substring(getPosition(data,",",4)+1,getPosition(data,",",5));
  var touch2 = data.substring(getPosition(data,",",5)+1,getPosition(data,",",6));

  x1=parseInt(x1);
  y1=parseInt(y1);

  y1= y1*parseFloat($(document).height()/58)+0.1;
  x1=x1*parseFloat($(document).width()/52);
  x1=x1.toFixed(2);
  y1=y1.toFixed(2);

  x2=parseInt(x2);
  y2=parseInt(y2);
  y2= y2*parseFloat($(window).height()/58)+0.1;
  x2=x2*parseFloat($(window).width()/52);
  x2=x2.toFixed(2);
  y2=y2.toFixed(2);

  if(isNaN(x1))x1=0;
  if(isNaN(x2))x2=0;
  if(isNaN(y1))y1=0.1;
  if(isNaN(y2))y2=0.1;

  if($(".smsKeyBoard").css("position")=="static"){
   // y1=calibrate(y1);
   // y2=calibrate(y2);
  }
  //console.log("x1 : "+x1+" y1 : "+y1+" touch1 : "+touch1+" x2 : "+x2+" y2 : "+y2+" touch2 : "+touch2);
  if(x1>$(window).width())x1=$(window).width()-$(".cursor1").width();
  if(y1>$(window).height())y1=$(window).height()-$(".cursor1").height();

  if(x2>$(window).width())x2=$(window).width()-$(window).width();
  if(y2>$(window).height())y2=$(window).height()-$(window).height();

  $(".cursorShadow1").css({left: x1+'px',
                           bottom: y1+'px'});
  $(".cursorShadow2").css({left: x2+'px',
                           bottom: y2+'px'});
  if(turnOffTrigger>1)toggleScreenLight();
  if(touch1=="5" && touch2=="5"){
      turnOffTrigger++;
      setTimeout(function(){turnOffTrigger=0;},10000);
  }

  handleCursor(x1,y1,touch1,".cursor1");
  handleCursor(x2,y2,touch2,".cursor2");
}
function calibrate(y){
  //console.log(y);
  if(y<(parseFloat($("body").height())-(parseFloat($(".galleryHeader").height())+parseFloat($("input[name='phoneSmsInput']").height()))))return (y*(parseFloat($(".smsKeyBoard").height())+parseFloat($("input[name='smsInput']").height())+20)/(parseFloat($("body").height())-(parseFloat($(".galleryHeader").height())+parseFloat($("input[name='phoneSmsInput']").height()))));
  else return y;
}
function handleCursor(x,y,touch,cursor){
  
  moveClick(x,y,touch,cursor);
  /*if(localStorage.getItem("currentPage")==".appsWrapper" || localStorage.getItem("currentPage")==".phoneCallWrapper")moveClick(x,y,touch,cursor)
  else if (localStorage.getItem("currentPage")==".smsWrapper")moveSpeakClickScroll(x,y,touch,cursor);
  else if (localStorage.getItem("currentPage")==".galleryWrapper" || localStorage.getItem("currentPage")==".imgWrapper")moveScrollZoomClick(x,y,touch,cursor);
  */
}
function toggleScreenLight(touch){
  turnOffTrigger=0;
  $(".lockScreen").toggle();
  $(".lockScreen").css({position:"absolute"});
  if(touch == 0 && lastTouch1==4 /*&& !(lastTouch1==4 && lastTouch2==4) && (lastTouch1==4 || lastTouch2=4)*/){
    //console.log("turning Off");
  //adb shell input keyevent 82 && adb shell input keyevent 66
  // COMBAK: TURN OFF/ON SCREEN
  }
}

function moveClick(x,y,touch,cursor){
  var lastTouch=0;
  if(cursor===".cursor1"){
    lastTouch=lastTouch1;
  }
  else if(cursor===".cursor2"){
    lastTouch=lastTouch2;
  }
  if(touch=="0" && lastTouch=="1"){click(cursor);}
  else if(touch=="2" && callActive){console.log("stoping call");
   // COMBAK: END CALL
  callActive=false;}
  else if(touch=="3"){
      var scrollHits=$(cursor).collision("[data-scroll='true']");
      var swipeHits=$(cursor).collision("[data-swipe='true']");
      if(scrollHits.length>0){
        scroll(y,$(scrollHits[0]),cursor);
      }
      if(swipeHits.length>0){
        swipe(x,$(swipeHits[0]),cursor);
      }
    }
  else if(touch=="4"){
      var scrollHits=$(cursor).collision("[data-scroll='true']");
      var swipeHits=$(cursor).collision("[data-swipe='true']");
      if(scrollHits.length>0){
        scroll(y,$(scrollHits[0]),cursor);
      }
      if(swipeHits.length>0){
        swipe(x,$(swipeHits[0]),cursor);
      }
    }
  checkHits(cursor,x,y);
  //moveCursor(x,y,cursor);
  if(cursor===".cursor1"){
    lastTouch1=touch;
  }
  else if(cursor===".cursor2"){
    lastTouch2=touch;
  }
}


function moveScrollZoomClick(x,y,touch,cursor){
  var lastTouch=0;
  if(cursor===".cursor1"){
    lastTouch=lastTouch1;
  }
  else if(cursor===".cursor2"){
    lastTouch=lastTouch2;
  }
  if(cursor===".cursor1"){
    lastTouch1=touch;
  }
  else if(cursor===".cursor2"){
    lastTouch2=touch;
  }
  //console.log("before Condition : "+touch+ "and "+ lastTouch );
  if(touch=="0" && lastTouch=="1"){
    $(cursor).addClass("clickBackground");
    click(cursor);
  }else if(touch=="1" && lastTouch=="1"){
      if(localStorage.getItem("currentPage")===".imgWrapper"){
      if((lastTouch1==4 || lastTouch1==3) && (lastTouch2==4 || lastTouch2==3))zoom();
      else swipe(x,$(".imgDisplay"),cursor);
    }
    else{
    scroll(y,$(".galleryImages"),cursor);
    }
  }
  else if(touch=="2"){}
  else if(touch=="3"){
    if(localStorage.getItem("currentPage")===".imgWrapper"){
      if((lastTouch1==4 || lastTouch1==3) && (lastTouch2==4 || lastTouch2==3))zoom();
      else swipe(x,$(".imgDisplay"),cursor);
    }
    else{
    scroll(y,$(".galleryImages"),cursor);
    }
  }
  else if(touch=="4"){
    if(localStorage.getItem("currentPage")===".imgWrapper"){
      if((lastTouch1==4 || lastTouch1==3) && (lastTouch2==4 || lastTouch2==3))zoom();
      else swipe(x,$(".imgDisplay"),cursor);
    }
    else{
    scroll(y,$(".galleryImages"),cursor);
    }
  }else if(touch=="0" && (lastTouch=="4" || lastTouch=="3")){
    if(cursor===".cursor1"){
      swipe(lastX1,$(".imgDisplay"),cursor);
    }
    else if(cursor===".cursor2"){
      swipe(lastX2,$(".imgDisplay"),cursor);
    }
  }
  //$("#cursorPosition").html("CursorX: "+x+" CursorY: "+y);
  checkHits(cursor,x,y);

}
function moveSpeakClickScroll(x,y,touch,cursor){
  var lastTouch=0;
  if(cursor===".cursor1"){
    lastTouch=lastTouch1;
  }
  else if(cursor===".cursor2"){
    lastTouch=lastTouch2;
  }
  if(touch=="0" && lastTouch=="1"){
    $(cursor).addClass("clickBackground");
    click(cursor);
  }
  else if(touch=="2"){/*// COMBAK: SPEECH RECOGNITION console.log("clicked : " + speechRecognitionActive);*/}
  else if(touch=="3"){scroll(y,$(".texts"),cursor); $(cursor).addClass("holdBackground");}
  else if(touch=="4"){scroll(y,$(".texts"),cursor); $(cursor).addClass("longBackground");}
  else $(cursor).removeClass("clickBackground");
  $("#cursorPosition").html("CursorX: "+x+" CursorY: "+y);
  checkHits(cursor,x,y);
  if(cursor===".cursor1"){
    lastTouch1=touch;
  }
  else if(cursor===".cursor2"){
    lastTouch2=touch;
  }
}
function checkHits(cursor,x,y){

  var hits=[];
  if(cursor===".cursor1"){
    hits = $(".cursorShadow1").collision("[data-hook='true']");
    oldHoverHits1=hoverHits1;
    hoverHits1 = $(".cursor1").collision("[data-hover='true']");
    }
  if(cursor===".cursor2"){
    //hits = $(".cursorShadow2").collision("[data-hook='true']");
    oldHoverHits2=hoverHits2;
    //hoverHits2 = $(".cursorShadow2").collision("[data-hover='true']");
    }

  checkHovers(hoverHits1,hoverHits2);
  
  if(hits.length >=1){
    if(hits.length>1)hits=hits[0];
    if($(hits).data("scroll")!=true){
      $( cursor ).position({
        my: "center",
        at: "center",
        of: hits
      });
    }
    if(cursor==".cursor1")activeButton1=hits;
    if(cursor==".cursor2")activeButton2=hits;
}else if(hits.length!=1){
  if(localStorage.getItem("currentPage")==".galleryWrapper" || localStorage.getItem("currentPage")==".imgWrapper")$(cursor).css({top:"auto"});
  if(cursor===".cursor1"){

    activeButton1=null;
    if(lastX1!=x || lastY1!=y){
      lastX1=x;
      lastY1=y;
      if(x<=0)x=0.01
      if(y<=0)y=0.01
      $(cursor).css({top:"auto"});
      moveCursor(x,y,cursor);
    }
  }
  else if(cursor===".cursor2"){
    activeButton2=null;
    if(lastX2!=x || lastY2!=y){
      lastX2=x;
      lastY2=y;
      if(x<=0)x=0.01
      if(y<=0)y=0.01
      $(cursor).css({top:"auto"});
      moveCursor(x,y,cursor);
    }
  }
}

}
function checkHovers(hoverHits1,hoverHits2){
  cmprHoverHits1=hoverHits1.toArray();
  cmprOldHoverHits1=oldHoverHits1.toArray();
 // if(cmprOldHoverHits1.length>cmprHoverHits1.length){

    for(var i=0; i < cmprOldHoverHits1.length; i++){
      var index = $.inArray(cmprOldHoverHits1[i],cmprHoverHits1);
      if(index < 0){
          
          if($(oldHoverHits1[i]).hasClass($(oldHoverHits1[i]).data("hoverClass")))$(oldHoverHits1[i]).removeClass($(oldHoverHits1[i]).data("hoverClass"));
      }
    }
 // }
  if(hoverHits1.length >=1){
    
    for(var i=0;i<hoverHits1.length;i++){
      if(!$(hoverHits1[i]).hasClass($(hoverHits1[i]).data("hoverClass")))$(hoverHits1[i]).addClass($(hoverHits1[i]).data("hoverClass"));
    }
    
  }
  else if(hoverHits2.length >=1){
    if(!$(hoverHits2[0]).hasClass($(hoverHits2[0]).data("hoverClass")))$(hoverHits2[0]).addClass($(hoverHits2[0]).data("hoverClass"));
    for(var i=1;i<hoverHits2.length;i++){
      if($(hoverHits2[i]).data("hoverClass") !== undefined)$(hoverHits2[i]).removeClass($(hoverHits2[i]).data("hoverClass"));
    }
  }
  else{
    $("[data-hover='true']").each(function() {
     if($(this).data("hoverClass") !== undefined){
       if($(this).hasClass($(this).data("hoverClass"))){$(this).removeClass($(this).data("hoverClass"));}
     }
    });
  }
  }

function click(cursor)
{ //console.log("click");
    if(cursor==".cursor1" && activeButton1!==null)activeButton1.click();
    else if(cursor==".cursor2" && activeButton2!==null)activeButton2.click();
    else{
    var clickPoint = $(cursor).position();
    y=clickPoint.top+($(cursor).height()/2);
    x=clickPoint.left+($(cursor).width()/2);
    //console.log("CursorX click: "+x+" CursorY click: "+y);
    var ev = new MouseEvent('click', {
        'view': window,
        'bubbles': true,
        'cancelable': true,
        'screenX': x,
        'screenY': y
    });

    var el = document.elementFromPoint(x, y);

    if(el!==null)el.dispatchEvent(ev);
  }
}
function scroll(y,divToScroll,cursor){

  if(cursor==".cursor1")scrollValue+=parseInt(parseInt(y-lastY1)*5);
  if(cursor==".cursor2")scrollValue+=parseInt(parseInt(y-lastY2)*5);
  if(scrollValue < 0)scrollValue = 0;
  if(scrollValue > divToScroll.prop("scrollHeight"))scrollValue = divToScroll.prop("scrollHeight");

    if (!divToScroll.is(':animated')) {
      divToScroll.animate({scrollTop:scrollValue});
    }


}

function zoom(){
  if(lastTouch1==4 && lastTouch2==4){
  var cursor1 = $(".cursor1").position();
  var cursor2 = $(".cursor2").position();
  var zoom = (Math.abs(cursor1.left-cursor2.left)/340)+1;
  //console.log("zooming cursor1: "+cursor1.left+" cursor2: "+cursor2.left+" zoom: "+zoom);
  $(".imgDisplay").css({transform:"scale("+zoom+")"});
  }
}
function swipe(x,divToScroll,cursor){
  swipeValue=divToScroll.scrollLeft();
  var imgIndex= parseInt(divToScroll.scrollLeft()/divToScroll.width());
  var posDifference=0;
  if(cursor==".cursor1")posDifference=parseInt(parseInt(lastX1-x)*4);
  if(cursor==".cursor2")posDifference=parseInt(parseInt(lastX2-x)*4);
  console.log("posDIFF : "+posDifference);
  swipeValue+=posDifference;

  if(posDifference > (divToScroll.width()*(0.5)) && posDifference > 0){
    imgIndex++;
    swipeValue=divToScroll.width()*imgIndex;
    console.log(" > > >");
    console.log("swipeValue before : "+swipeValue);
    console.log("lastX1-x : "+parseInt(parseInt(lastX1-x))*2);
    console.log("imgIndex : "+imgIndex);
  }
  if(posDifference < -(divToScroll.width()*(0.5)) && posDifference <0){
    console.log(" < < <");
    console.log("swipeValue before : "+swipeValue);
    console.log("lastX1-x : "+parseInt(parseInt(lastX1-x))*2);
    console.log("imgIndex : "+imgIndex);
    imgIndex--;
    swipeValue=divToScroll.width()*imgIndex;
  }
  if(swipeValue < 0){
    swipeValue = 0;
    imgIndex=0;
  }
  if(swipeValue > divToScroll.prop("scrollWidth")){
    swipeValue = divToScroll.prop("scrollWidth");
    imgIndex=divToScroll.length;
  }
  console.log("swipeValue after : "+swipeValue);
  if (!divToScroll.is(':animated')) {
    divToScroll.animate({scrollLeft:swipeValue},700);
  }

}

function getPosition(string, subString, index) {
   return string.split(subString, index).join(subString).length;
}

/* Drivers */
function stringToBytes(string) {
   var array = new Uint8Array(string.length);
   for (var i = 0, l = string.length; i < l; i++) {
       array[i] = string.charCodeAt(i);
    }
    return array.buffer;
}
function bytesToString(buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
}
function serialToString(view){

                               if(view.length >= 1) {
                                   for(var i=0; i < view.length; i++) {
                                       // if we received a \n, the message is complete, display it
                                       if(view[i] === 13) {
                                           // check if the read rate correspond to the arduino serial print rate
                                          var now = new Date();
                                          showData(serialRead);
                                          lastRead = now;
                                          serialRead= '';
                                       }
                                       // if not, concatenate with the begening of the message
                                       else {
                                           var temp_str = String.fromCharCode(view[i]);
                                           serialRead+= temp_str;
                                       }
                                   }
                               }
}
/* END Drivers */

function isIn(array1,variable1){
  for(i in array1){
    if(array1[i].name===variable1){
      return true;
    }
  }
  return false;
}
