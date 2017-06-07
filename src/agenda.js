var oAgenda = require('./data/tracks.json');

var MINUTE_HEIGHT = 1; //px

// init sessions start time
var oInitialDate = new Date();
oInitialDate.setHours(9);
oInitialDate.setMinutes(30);

var oStartDate;

function fillAgenda() {
	fillTimeLine();
	fillTracks();
}

function fillTimeLine() {
	var oDate = oInitialDate;

	var sTemplate = $("#timeline-item-template").html();

	for (var i = 1; i < 20; i++) {
		var $content = sTemplate.replace("{{value}}", oDate.toTimeString().substring(0,5));
		$("#timeLine").append($content);
		oDate = _addMinutes(oDate, 30);
	}
}

function fillTracks() {
	var oDate = oInitialDate;
	$.each(oAgenda, function(sTrackIndex, oTrack){
		oStartDate = oInitialDate;
		var oTrackElement = $("#" + sTrackIndex);

		$.each(oTrack, function(sTopicIndex, oTopic) {
			var $content = _createTopicContent(oTopic, oDate);
			oTrackElement.append($content);
		} );
	});
}

function _createTopicContent(oTopic) {
	var sTemplate,
		sTitle,
		sTime,
		sType = oTopic.type,
		iDuration = oTopic.duration;

	if(sType === "break") {
		sTitle = oTopic.title || "";
		sTemplate =  $("#break-item-template").html();
	}
	else {
		sTitle = oTopic.title;
		sTemplate = (iDuration == 20)
			? $("#track-item-template-20").html()
			: $("#track-item-template").html() ;
		sTemplate = sTemplate
			.replace("{{speaker}}", oTopic.speaker)
			.replace("{{type}}", oTopic.type);
	}

	var oEndDate = _addMinutes(oStartDate, iDuration);
	sTime =  _getTimeSpanAsString(oStartDate, oEndDate);
	oStartDate = oEndDate;

	sTemplate = sTemplate
		.replace("{{duration}}", iDuration)
		.replace("{{title}}", sTitle)
		.replace("{{time}}", sTime);

	return sTemplate;
}

function _addMinutes(date, minutes) {
	return  new Date(date.getTime() + minutes*60000);
}

function _getTimeSpanAsString( oDateStart, oDateEnd) {
	return oDateStart.toTimeString().substring(0,5) + " - " + oDateEnd.toTimeString().substring(0,5);
}

fillAgenda();