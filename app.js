var firebase = require("firebase");
var cron = require('cron');

var startTimeMills = new Date().getTime();

console.log('System boot at ' + startTimeMills);

firebase.initializeApp({
  serviceAccount: "firebase-service-account.json",
  databaseURL: "https://project-1899617701854337217.firebaseio.com/"
});

/*
*Listener de Alertas
*/

var db = firebase.database();

listenRadar('radar1');
listenRadar('radar2');
listenRadar('radar3');
listenRadar('radar4');

var job = new cron.CronJob('* * * * *', function() {
    for(i=1; i<=12; i++){
      var ref = db.ref("avisos/radar"+i);
      console.log('updating radar' + i);
      updateLevel(ref, 'radar'+i,  new Date().getTime());
    }
}, null, true);

job.start();

var INTERVAL = 15 * 60 * 1000;
//var INTERVAL = 1 * 60 * 1000;

function listenRadar(radarName){
  var ref = db.ref("avisos/"+radarName);
  ref.on('child_added', function(snapshot, prevChildKey) {
  	if(snapshot.val().timestamp > startTimeMills){
      updateLevel(ref, radarName, snapshot.val().timestamp);
  	}
  });
}

function updateLevel(ref, radarName, timestamp){
  ref.orderByChild("timestamp").startAt(timestamp - INTERVAL).once("value", function(snapshot) {
    var alertNum15min = snapshot.numChildren();
    var refRadar = db.ref("radares/" + radarName);
    refRadar.update({'estado':alertlevel(alertNum15min)});
  });
}

function alertlevel(alertNum){
    if(alertNum<10){
      return 'alert-green';
    }
    else if(alertNum<30){
    return 'alert-orange';
    }
    else {
      return 'alert-red';
    }
}

console.log('Running!');
