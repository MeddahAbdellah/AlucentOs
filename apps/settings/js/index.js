var focusedInput;
$("input[type='text']").on("click",function(){
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
  $("input[type='text']").on("click",function(e){e.stopPropagation();});
  $(".mainPanel *").not("input[type='text'],.smsKeyBoard,.smsKeyBoard *").on("click",function(e){
    console.log(this);
    
    $(".smsKeyBoard").css("position","absolute");
    focusedInput=null;
  });

  $("button[name='smsKeyBoardSendButton']").on("click",function(){

    });
  $("button[name='syncGallery']").on("click",function(){
      ipcRenderer.on('make-action', (event, arg) => {
        $("button[name='syncGallery']").css("background","green");
      });
      ipcRenderer.send('make-local-action',"gallery : Dan");
  });
