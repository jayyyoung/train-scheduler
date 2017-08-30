// Initialize Firebase
var config = {
    apiKey: "AIzaSyBIhkWBckpezAWiXp-wzMg7uRABpb6iOUA",
    authDomain: "running-of-the-trains.firebaseapp.com",
    databaseURL: "https://running-of-the-trains.firebaseio.com",
    projectId: "running-of-the-trains",
    storageBucket: "",
    messagingSenderId: "11245214450"
};
firebase.initializeApp(config)


var database = firebase.database();

// Initial Values
var trainName = "";
var destination = "";
var firstTrainTime = "";
var frequency = 0;
var currentTime = moment();
var index = 0;
var trainIDs = [];

// Show current time
var datetime = null,
date = null;

var update = function () {
  date = moment(new Date())
  datetime.html(date.format('dddd, MMMM Do YYYY, h:mm:ss a'));
};

$(document).ready(function(){
  datetime = $('#current-status')
  update();
  setInterval(update, 1000);
});


// Capture Button Click
$("#add-train").on("click", function() {

  // Grabbed values from text boxes
  trainName = $("#train-name").val().trim();
  destination = $("#destination").val().trim();
  firstTrainTime = $("#train-time").val().trim();
  frequency = $("#frequency").val().trim();
  
  // First Time (pushed back 1 year to make sure it comes before current time)
  var firstTimeConverted = moment(firstTrainTime, "hh:mm").subtract(1, "years");
  
  // Difference between the times
  var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
  
  // Time apart (remainder)
  var tRemainder = diffTime % frequency;
  
  // Minute Until Train
  var minutesAway = frequency - tRemainder;
  
  // Next Train
  var nextTrain = moment().add(minutesAway, "minutes");

  // Arrival time
  var nextArrival = moment(nextTrain).format("hh:mm a");

  var nextArrivalUpdate = function() {
    date = moment(new Date())
    datetime.html(date.format('hh:mm a'));
  }

  // Code for handling the push
  database.ref().push({
    trainName: trainName,
    destination: destination,
    firstTrainTime: firstTrainTime,
    frequency: frequency,
    minutesAway: minutesAway,
    nextArrival: nextArrival,
    dateAdded: firebase.database.ServerValue.TIMESTAMP
  });
  

  // has the text are blank
  $("#train-name").val("");
  $("#destination").val("");
  $("#train-time").val("");
  $("#frequency").val("");
  

  return false; 
});

  database.ref().orderByChild("dateAdded").limitToLast(20).on("child_added", function(snapshot) {


    console.log("Train name: " + snapshot.val().trainName);
    console.log("Destination: " + snapshot.val().destination);
    console.log("First train: " + snapshot.val().firstTrainTime);
    console.log("Frequency: " + snapshot.val().frequency);
    console.log("Next train: " + snapshot.val().nextArrival);
    console.log("Minutes away: " + snapshot.val().minutesAway);
    console.log("---------------");


  // Change the HTML to reflect
  $("#new-train").append("<tr><td>" + snapshot.val().trainName + "</td>" +
    "<td>" + snapshot.val().destination + "</td>" + 
    "<td>" + "Every " + snapshot.val().frequency + " mins" + "</td>" + 
    "<td>" + snapshot.val().nextArrival + "</td>" +
    "<td>" + snapshot.val().minutesAway + " minutes until arrival" + "</td>" +
    "</td></tr>");

  index++;

  //0e0rrors Handler
  }, function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
  });

  //Gets the train IDs in an Array
  database.ref().once('value', function(dataSnapshot){ 
    var trainIndex = 0;

      dataSnapshot.forEach(
          function(childSnapshot) {
              trainIDs[trainIndex++] = childSnapshot.key();
          }
      );
  });

  console.log(trainIDs);