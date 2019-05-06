/*ipcRenderer.on('get-sources-reply', (event, arg) => {
  alert(arg) // affiche "pong"
})
ipcRenderer.send('get-srouces-sequest', 'test');
*/

const { remote } = require('electron')
$("[data-app='osHome']").on("click",function(){
	remote.getCurrentWindow().loadFile('/home/pi/AlucentOs/views/index.html');
});
$("[data-app]").not("[data-app='osHome']").on("click",function(){
	remote.getCurrentWindow().loadFile('/home/pi/AlucentOs/apps/'+$(this).data("app")+'/index.html');
});
