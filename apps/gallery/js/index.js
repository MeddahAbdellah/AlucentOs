$(".imgDisplay").hide();
$(".imgDisplay").on("click",function(e){ 
	if(e.target != this) return;
	$(".imgDisplay").hide(); 
});

loadGallery();
function loadGallery(){
	console.log("gonna load")
	ipcRenderer.on('make-local-action', (event, arg) => {
		var res=arg.split("\n")
		res.shift();
		res.pop();
		console.log(res);
		for(var i in res){
			$(".gallery").append('<div class="galleryItem" data-hook="true"><img src="/home/pi/AlucentOs/public/images/'+res[i]+'"></div>');
			$(".imgDisplay").append('<img src="/home/pi/AlucentOs/public/images/'+res[i]+'">');
		}
		$(".galleryItem").on("click",function(e){
			$(".imgDisplay").show();
			$(".imgDisplay").scrollLeft($(window).width()*$('.galleryItem').index(this));
		});
	});
	ipcRenderer.send('make-local-action',"loadGallery: Abdallah");

}
