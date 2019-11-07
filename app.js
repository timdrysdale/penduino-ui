var canvas = document.getElementById('video-canvas');

var urlParams = new URLSearchParams(window.location.search);

stream = urlParams.get('stream');

host = urlParams.get('host');

port = urlParams.get('port');

secure = urlParams.get('secure');

data = urlParams.get('data');

if (host == null) {
	host = 'video.practable.io';
}

if (secure == null) {
	scheme = 'ws://'
	if (port == null){
		port = '8080';
	}
	
} else {
	scheme = 'wss://'
	if (port == null){
		port = '443';
	}
}

if (port == null){
	port = '80'
}

playerUrl = scheme + host + ':' + port + '/' + stream;

console.log(playerUrl)

var player = new JSMpeg.Player(playerUrl, {canvas: canvas});

dataUrl =  scheme + host + ':' + port + '/' + data;

console.log(dataUrl)

var dataSocket = new WebSocket(dataUrl);

var dataOpen = false;

var driveSlider = document.getElementById("driveParam");
var driveOutput = document.getElementById("driveValue");
driveOutput.innerHTML = driveSlider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
driveSlider.oninput = function() {
	driveOutput.innerHTML = this.value;
}

driveSlider.onchange = function() {
	console.log("drive", this.value)
	dataSocket.send(JSON.stringify({
		cmd: "drive",
		param: this.value
	}));
}


var brakeSlider = document.getElementById("brakeParam");
var brakeOutput = document.getElementById("brakeValue");
brakeOutput.innerHTML = brakeSlider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
brakeSlider.oninput = function() {
	brakeOutput.innerHTML = this.value;
}

brakeSlider.onchange = function() {
	console.log("brake", this.value)
	dataSocket.send(JSON.stringify({
		cmd: "brake",
		param: this.value
	}));
}

var startSlider = document.getElementById("startParam");
var startOutput = document.getElementById("startValue");
startOutput.innerHTML = startSlider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
startSlider.oninput = function() {
	startOutput.innerHTML = this.value;
}

startSlider.onchange = function() {
	console.log("start", this.value)
	// don't send a websocket because it will make it start 
}

var dataSlider = document.getElementById("dataParam");
var dataOutput = document.getElementById("dataValue");
dataOutput.innerHTML = dataSlider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
dataSlider.oninput = function() {
	dataOutput.innerHTML = this.value;
}

dataSlider.onchange = function() {
	console.log("data delay", this.value)
	dataSocket.send(JSON.stringify({
		cmd: "interval",
		param: this.value
	}));
}

var chart = new SmoothieChart({millisPerPixel:11,grid:{fillStyle:'#ffffff'}}),
canvas = document.getElementById('smoothie-chart'),
series = new TimeSeries();

chart.addTimeSeries(series, {lineWidth:2,strokeStyle:'#0024ff'});
chart.streamTo(canvas, 200);

dataSocket.onopen = function (event) {
	console.log("dataSocket open");
	dataOpen = true; 

	dataSocket.send(JSON.stringify({
		cmd: "drive",
		param: driveSlider.value
	}));
	dataSocket.send(JSON.stringify({
		cmd: "brake",
		param: brakeSlider.value
	}));
	
	dataSocket.send(JSON.stringify({
		cmd: "interval",
		param: dataSlider.value
	}));

};

dataSocket.onmessage = function (event) {
	try {
		var obj = JSON.parse(event.data);
		series.append(new Date().getTime(),obj.enc)
	} catch (e) {}
}

document.getElementById("start").onclick = function(){
	dataSocket.send(JSON.stringify({
		cmd: "start",
		param: startSlider.value
	}));
}

document.getElementById("brake").onclick = function(){
	dataSocket.send(JSON.stringify({
		cmd: "stop",
		param: "brake"
	}));
}

document.getElementById("free").onclick = function(){
	dataSocket.send(JSON.stringify({
		cmd: "stop",
		param: "unloaded"
	}));
}

document.getElementById("load").onclick = function(){
	dataSocket.send(JSON.stringify({
		cmd: "stop",
		param: "loaded"
	}));
}

document.getElementById("cal").onclick = function(){
	dataSocket.send(JSON.stringify({
		cmd: "calibrate"
	}));
}


