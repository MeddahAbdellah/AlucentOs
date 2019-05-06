$("button[name='phoneButton']").on("click",function(){
  var number=$("input[name='numberInput']").val()+$(this).html();
  $("input[name='numberInput']").val(number);
});

$("button[name='delete']").on("click",function(){
    var number=$("input[name='numberInput']").val();
    number = number.substring(0, number.length - 1);
    $("input[name='numberInput']").val(number);
});

$("button[name='startCall']").on("click",function(){
	ipcRenderer.on('make-action', (event, arg) => {
  })
  ipcRenderer.send('make-action',"call : "+$("input[name='numberInput']").val());
});
