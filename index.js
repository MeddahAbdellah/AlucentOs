const { ipcMain ,app, BrowserWindow } = require('electron');
const https = require('https');
const bleno = require('bleno');
const { exec } = require('child_process');
const fs = require('fs');
const download = require('download');
const bluetooth = require('node-bluetooth');
const piWifi = require('pi-wifi');
// create bluetooth device instance
const device = new bluetooth.DeviceINQ();
let explorer=null;
const name = 'resncidglasses';
var Characteristic = bleno.Characteristic;
var PrimaryService = bleno.PrimaryService;
var controllerConnected=false;
function createWindow () {
  //lunchBLEserver();
  lunchBluetooth();
  // Create Os 
  explorer = new BrowserWindow({ width: 800, height: 600 ,backgroundColor: '#000000'/*,alwaysOnTop:true,fullscreen:true*/});
  // and load the index.html of the app.


  explorer.loadFile('./views/index.html');
  //explorer.loadFile('./apps/calling/index.html');
  //explorer.loadFile('./apps/messaging/index.html');
  ipcMain.on('make-local-action', (event, arg) => {
  console.log(arg);
  var action = arg.substring(0, arg.indexOf(":"));
  console.log("gonna do : "+ action=="loadGallery");
  var param = arg.substring(arg.indexOf(":")+1,arg.length);
  handleLocalAction(event,action,param);
  });

}
function handleLocalAction(event,action,param){
  if(action=="wifi"){
    chageWifiCredentials(event,param);
  }if(action=="syncGallery"){
    syncGallery(param);
  }if(action=="loadGallery"){
    loadGallery(event,param);
  }
}
//syncGallery("Abdallah");
//createWindow();
app.on('ready', createWindow);
function loadGallery(event,param){
    exec("ls /home/pi/AlucentOs/public/images "+param+"*",(err,stdout,stderr)=>{
      console.log(stdout.split("\n"));
      event.sender.send('make-local-action',stdout)
    });
}
function changeWifiCrendentials(event,param){
      var res = param.split(",");
    ssid=res[0];
    password=res[1];
    piWifi.connectTo({ssid: ssid,password:password}, function(err) {
      if (!err) { //Network created correctly
	setTimeout(function () {
	  piwifi.check(ssid, function (err, status) {
	    if (!err && status.connected) {
	      event.sender.send('make-local-action','Connected to the network ' + ssid + '!');
	    } else {
	      event.sender.send('make-local-action','Unable to connect to the network ' + ssid + '!');
	    }
	  });
	}, 2000);
      } else {
	event.sender.send('make-local-action','Unable to create the network ' + ssid + '.');
      }
    });
}
function syncGallery(param){
    https.get('https://1047a606.ngrok.io/listFiles?id='+param, (resp) => {
    let data = '';
    resp.on('data', (chunk) => {
      data += chunk;
    });
    resp.on('end', () => {
      var downloadImgs=data.split("\r\n");
      downloadImgs.pop();
      console.log(downloadImgs);
      downloadGallery(downloadImgs)
      
    });

  }).on("error", (err) => {
    //event.sender.send('make-local-action',"Error: " + err.message);
    console.log(err)
  });
}
async function downloadGallery(downloadImgs){	
        var downloadCount=0;
	for(var i in downloadImgs){
	 await download('https://1047a606.ngrok.io/images/'+downloadImgs[i], '/home/pi/AlucentOs/public/images').then(() => {
		console.log("downloaded : "+downloadCount);
		downloadCount++;
	  });	
	  
      }
}
function lunchBLEserver(){
      primaryService = new PrimaryService({
	  uuid: '75cf7374-a137-47e7-95e5-e675189c8a3e',
	  characteristics: [
	      new Characteristic({
	  uuid: '0d563a58-196a-48ce-ace2-dfec78acc814', 
	  properties: ["notify"], 
	  secure: null, 
	  value: null,
	  descriptors: null,
	  onSubscribe:function(maxValueSize, updateValueCallback) {
			  console.log('NotifyOnlyCharacteristic subscribe');
			  ipcMain.on('make-action', (event, arg) => {
			  console.log(arg);
			  var data = new Buffer(arg);
			  updateValueCallback(data);
			  event.sender.send('make-action', 'successful');
			});
		      }
      })
	  ]
      });


      bleno.on('stateChange', function(state) {
	if (state === 'poweredOn'){
	  bleno.startAdvertising(name, ["75cf7374-a137-47e7-95e5-e675189c8a3e"]);
	}
	else
	  bleno.stopAdvertising();
      });

      bleno.on('advertisingStart', function(error) {
	console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

	if (!error) {
	  bleno.setServices([primaryService], function(error){
	    console.log('setServices: '  + (error ? 'error ' + error : 'success'));    });
	}
      });
  }
function lunchBluetooth(){
  device.on('finished',  function(){
    if(controllerConnected){
      console.log('finished');
    }else{
      console.log('searching for controller');
      device.scan();
    }
      
    }

  )
		.on('found', function found(address, name){
		  	console.log('Found RFCOMM channel for serial port on %s: ', name);
			if(name == "alucentController"){  
			  
			  device.findSerialPortChannel(address, function(channel){

				  // make bluetooth connect to remote device
					  bluetooth.connect(address, channel, function(err, connection){
						  if(err) return console.error(err);
						  controllerConnected=true;
						  connection.on('data', (buffer) => {
							var data = buffer.toString();
							var outData=[];
							outData =data.match(/[^BTSDATA\ :]+$/g);
							console.log('received message:', outData[0]);
							explorer.webContents.send('bluetoothData', outData[0]);
						  });
					  });
			 
				});
			}
		}).scan();
	
}
/*
function lunchBLE(){
	noble.on('stateChange', function(state) {
	if (state === 'poweredOn')
		noble.startScanning();
	else
		noble.stopScanning();
	});
    noble.on('discover', function(device) {
		if(device.advertisement.localName=="resncid"){
		  console.log("Device Found : "+ device.advertisement.localName);
		  device.connect(function(error){console.log("error : "+error);});
		  device.once('disconnect', function() { console.log("disconnected");});
		  device.once('rssiUpdate', function(rssi){console.log(rssi)});
		  device.once('connect', function(){
			  console.log("connected");
			  device.discoverSomeServicesAndCharacteristics(serviceUUIDs, characteristicUUIDs, function(error, services, characteristics){
				console.log("found char : ");
				var esp=characteristics[0];
				esp.on('data',function(data) {
                          var string = data.toString('ascii');
						  console.log(string);                   
                      });
				esp.subscribe(function(){console.log("subscribed")});
			    //setInterval(getData,10,characteristics[0])
				});
		  });
		}
	});
}

function getData(characteristic){
	
	characteristic.read();
}
*/
