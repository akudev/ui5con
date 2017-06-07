var oTracks = require('./data/tracks.json');
var oBooths = require('./data/booths.json');

var MINUTE_HEIGHT = 1; //px

var TRACKS_HASH = "tracks";
var BOOTHS_HASH = "showfloor";
var SPEAKERS_HASH = "speakers";

// init sessions start time
var oInitialDate = new Date();
oInitialDate.setHours(9);
oInitialDate.setMinutes(30);

var bTracksLoaded = false;
var bBoothLoaded = false;
var bSpeakersLoaded = false;

var oStartDate;

$(document).ready(function() {

	var sHash = updateHash();
	updatePage(sHash);
});

$(window).bind( "hashchange", function() {
	var sHash = updateHash();
	updatePage(sHash);
});

/*
 * Switch between tracks/booths agenda and speakers views
 */
window.switchAgenda = function(sHash) {
	var oScrollState = $('html,body').scrollTop();
	window.location.hash = sHash;
	//window.location.reload(true);
	$('html,body').scrollTop(oScrollState);
};

/*
 * Ensures the hash is valid and updates it.
 * Default hash value - 'tracks'
 */
function updateHash() {
	var sHash = window.location.hash.split("#")[1];
	sHash = _verifyHash(sHash);

	// if no hash defined - set #tracks as default.
	if(!sHash) {
		sHash = TRACKS_HASH;

		// prevent scrolling
		var oScrollState = $('html,body').scrollTop();
		window.location.hash = sHash;
		$('html,body').scrollTop(oScrollState);
		//window.location.reload(true);
	}
	return sHash;
}

/*
 * Updates page layout according to the actual hash.
 * The respective view becomes visible, other - hidden.
 */
function updatePage(sHash) {
	updateTracksView(sHash);
	updateBoothsView(sHash);
	updateSpeakersView(sHash);
}

/*
 * Updates visibility of the tracks view, loads its content if necessary.
 */
function updateTracksView(sHash) {
	if(sHash == TRACKS_HASH) {
		$("#tracksSection").show();
		fillTracksInfo();
	}
	else {
		$("#tracksSection").hide();
	}
}

/*
 * Updates visibility of the booths view, loads its content if necessary.
 */
function updateBoothsView(sHash) {
	if(sHash == BOOTHS_HASH) {
		$("#boothsSection").show();
		fillBoothsInfo();
	}
	else {
		$("#boothsSection").hide();
	}
}

/*
 * Updates visibility of the speakers view, loads its content if necessary.
 */
function updateSpeakersView(sHash) {
	if(sHash == SPEAKERS_HASH) {
		$("#speakersSection").show();
		//fillAgenda();
	}
	else {
		$("#speakersSection").hide();
	}
}


function fillTracksInfo() {
	if( !bTracksLoaded ) {
		fillTimeLine("timeLine-tracks");
		fillTracks(oTracks);
	}
	bTracksLoaded = true;
}

function fillBoothsInfo() {
	if( !bBoothLoaded ) {
		fillTimeLine("timeLine-booths");
		fillTracks(oBooths);
	}
	bBoothLoaded = true;
}

function fillTimeLine(sTimeLineId) {
	var oDate = oInitialDate;

	var sTemplate = $("#timeline-item-template").html();

	for (var i = 1; i < 20; i++) {
		var $content = sTemplate.replace("{{value}}", oDate.toTimeString().substring(0,5));
		$("#" + sTimeLineId).append($content);
		oDate = _addMinutes(oDate, 30);
	}
}

function fillTracks(oTracks) {
	var oDate = oInitialDate;
	$.each(oTracks, function(sTrackIndex, oTrack){
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

function _verifyHash(sHash) {
	if(sHash) {
		sHash = sHash.toLowerCase();
		if((sHash == TRACKS_HASH || sHash == BOOTHS_HASH || sHash == SPEAKERS_HASH)){
			return sHash;
		}
	}
	return null;
}