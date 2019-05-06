var focusedInput;
$("input[name='smsInput']").on("click",function(){
    $(".smsKeyBoard").css("position","static");
    focusedInput=this;
  });

  $("button[name='smsKeyBoardButton']").on("click",function(){
    var number=$(focusedInput).val()+$(this).html();
    $(focusedInput).val(number);
  });
  $("button[name='smsKeyBoardSendButton']").on("click",function(){
	//send Sms
  });
  $("button[name='smsKeyBoardDeleteButton']").on("click",function(){
    var number=$(focusedInput).val();
    number = number.substring(0, number.length - 1);
    $(focusedInput).val(number);
  });
  $(".mainPanel *").not("input[name='smsInput'],.smsKeyBoard,.smsKeyBoard *").on("click",function(){
    $(".smsKeyBoard").css("position","absolute");
    focusedInput=null;
  });

  $("button[name='smsKeyBoardSendButton']").on("click",function(){
    	ipcRenderer.on('make-action', (event, arg) => {
      $(".texts").append("<div class='messageSent'><hgroup class='speech-bubble'><p>"+$("input[name='smsInput']").val()+"</p></hgroup></div>");
      $("input[name='smsInput']").val("")
      $(".texts").animate({scrollTop:$(".texts").prop("scrollHeight")});
      });
      ipcRenderer.send('make-action',"sms : " + $("#correspondant").data("value")+","+$("input[name='smsInput']").val(""));
  });
