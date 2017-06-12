var oTracks = require('./data/tracks.json');
var oBooths = require('./data/booths.json');
var oSpeakers = require('./data/speakers.json');

var MINUTE_HEIGHT = 1; //px

var VIEW_PARAMETER = "view";
var TRACKS_HASH = "tracks";
var BOOTHS_HASH = "showfloor";
var SPEAKERS_HASH = "speakers";
var TOPIC_TYPE_BREAK = "break";

var DISPLAY_NONE_CSS = "display_none";
var ACTIVE_BUTTON_CSS = "active";

var SESSION_TYPE_KEYNOTE = "Key Note";
var SESSION_TYPE_LECTURE = "Lecture";
var SESSION_TYPE_HANSON = "Hands-On";
var TYPE_KEYNOTE_CSS = "keynote";
var TYPE_LECTURE_CSS = "lecture";
var TYPE_HANSON_CSS = "handson";


// init sessions start time
var oInitialDate = new Date();
oInitialDate.setHours(9);
oInitialDate.setMinutes(30);

var bTracksLoaded = false;
var bBoothLoaded = false;
var bSpeakersLoaded = false;

var oStartDate;
var sCurrentMode = TRACKS_HASH;


$(document).ready(function() {

	prepareTracks(oTracks, "s_");
	prepareTracks(oBooths, "b_");
	var sHash = getUrlParameter(VIEW_PARAMETER) || TRACKS_HASH;
	updatePage(sHash, window.location.hash);

	// close popup on escape key
	$(document).keyup(function(e){
		if(e.which === 27) {
			closePopup();
		}
	});
	// close popup on block layer click
	$('#popupBlocklayer').click(closePopup);
});

$(window).bind( "hashchange", function() {
	if(sHash) {
		var iTop = $(sHash).position().top;
		$(window).scrollTop( iTop );
	}
});

/*
 * Switch between tracks/booths agenda and speakers views
 */
window.switchAgenda = function(sViewName) {
	window.location.href = addOrReplaceUrlParameter(VIEW_PARAMETER, sViewName)
};

function prepareTracks(oTracks, sIdPrefix) {
	var iTrackId = 0;
	$.each(oTracks, function(sTrackIndex, oTrack){
		$.each(oTrack, function(sTopicIndex, oTopic) {
			oTopic.id = sIdPrefix + iTrackId++;
		} );
	});
}

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
	}
	return sHash;
}

/*
 * Updates page layout according to the actual hash.
 * The respective view becomes visible, other - hidden.
 */
function updatePage(sParam, sHash) {
	updateTracksView(sParam);
	updateBoothsView(sParam);
	updateSpeakersView(sParam);
	if(sHash) {
		var iTop = $(sHash).position().top;
		$(window).scrollTop( iTop );
	}
}

/*
 * Updates visibility of the tracks view, loads its content if necessary.
 */
function updateTracksView(sHash) {
	fillTracksInfo();
	if(sHash == TRACKS_HASH) {
		$("#tracksSection").show();
		$("#tracks").addClass(ACTIVE_BUTTON_CSS);
	}
	else {
		$("#tracksSection").hide();
		$("#tracks").removeClass(ACTIVE_BUTTON_CSS);
	}
}

/*
 * Updates visibility of the booths view, loads its content if necessary.
 */
function updateBoothsView(sHash) {
	if(sHash == BOOTHS_HASH) {
		$("#boothsSection").show();
		$("#showfloor").addClass(ACTIVE_BUTTON_CSS);
		fillBoothsInfo();
	}
	else {
		$("#boothsSection").hide();
		$("#showfloor").removeClass(ACTIVE_BUTTON_CSS);
	}
}

/*
 * Updates visibility of the speakers view, loads its content if necessary.
 */
function updateSpeakersView(sHash) {
	if(sHash == SPEAKERS_HASH) {
		$("#speakersSection").show();
		$("#speakers").addClass(ACTIVE_BUTTON_CSS);
		fillSpeakersInfo();
	}
	else {
		$("#speakersSection").hide();
		$("#speakers").removeClass(ACTIVE_BUTTON_CSS);
	}
}


function fillTracksInfo() {
	if( !bTracksLoaded ) {
		oInitialDate.setHours(9);
		oInitialDate.setMinutes(30);
		fillTimeLine("timeLine-tracks", oInitialDate, 20);
		fillTracks(oTracks);
		bTracksLoaded = true;
	}
}

function fillBoothsInfo() {
	if( !bBoothLoaded ) {
		oInitialDate.setHours(10);
		oInitialDate.setMinutes(00);
		fillTimeLine("timeLine-booths", oInitialDate, 17);
		fillTracks(oBooths);
		bBoothLoaded = true;
	}
}

function fillSpeakersInfo() {
	if( !bSpeakersLoaded ) {
		createSpeakersViewContent();
		bSpeakersLoaded = true;
	}
}

function fillTimeLine(sTimeLineId, oInitialDate, iCount) {
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

function createSpeakersViewContent() {
	var oSortedSpeakersInfo = prepareSpeakersInfo();

	var aLetters = Object.keys((oSortedSpeakersInfo));

	// fill navigation letter panel
	var oNavLettersElement = $("#navigationLetters");
	var oSpeakersSection = $("#speakersSection");
	var sNavLetterTemplate =  $("#nav-letter-item-template").html();
	var sSpeakersSectionTemplate =  $("#speakers-section-item-template").html();
	var sLetterTemplate = $("#timeline-item-template").html();
	var sSpeakerTemplate = $("#speaker-item-template").html();

	$.each(oSortedSpeakersInfo, function(sLetter, oSpeakers) {
		// add the  letter to navigation panel
		var $content = sNavLetterTemplate.replace(new RegExp("{{letter}}", 'g'), sLetter);
		oNavLettersElement.append($content);

		// create a new speakers section for the letter
		var oSpeakersSectionItem = sSpeakersSectionTemplate.replace(new RegExp("{{letter}}", 'g'), sLetter);
		oSpeakersSection.append(oSpeakersSectionItem);

		// get the letter block element
		var oLetterBlock = $("#letter_" + sLetter);
		var oSpeakersBlock = $("#speakersBlock_" + sLetter);

		var oLetterItem = sLetterTemplate.replace("{{value}}", sLetter);
		oLetterBlock.append(oLetterItem);

		$.each(oSpeakers, function(sTopicIndex, oSpeaker) {
			var oSession = findSession(oSpeaker.name);

			var sSessionId = oSession ? oSession.id : "";
			var sSessionTitle = oSession ? oSession.title : "";
			var sCompany = oSpeaker.company || "";
			var oSpeakerItem = sSpeakerTemplate
				.replace("{{name}}", oSpeaker.name)
				.replace("{{bio}}", oSpeaker.bio)
				.replace("{{company}}", sCompany)
				.replace(/{{show-company}}/g, sCompany.length > 0 ? "" : DISPLAY_NONE_CSS)
				.replace("{{view}}", sSessionId.indexOf("s_") >= 0 ? TRACKS_HASH : BOOTHS_HASH)
				.replace("{{session_id}}", sSessionId)
				.replace("{{session}}", sSessionTitle)
				.replace("{{show-session}}", sSessionTitle.length > 0 ? "" : DISPLAY_NONE_CSS )
				.replace("{{HH:MM}}", oSpeaker.meetMe )
				.replace("{{show-meet-me}}", oSpeaker.meetMe ? "" : DISPLAY_NONE_CSS )
				.replace("{{picture}}", oSpeaker.picture);
			oSpeakersBlock.append(oSpeakerItem);
		} );
	} );
}

function findSession(sSpeakerName) {
	var oSession = null;
	var sSearchName = sSpeakerName.toUpperCase();
	
	$.each(oTracks, function(sTrackIndex, oTrack){
		$.each(oTrack, function(sTopicIndex, oTopic) {
			if (oTopic.type != TOPIC_TYPE_BREAK &&
				oTopic.speaker.toUpperCase().indexOf(sSearchName)>= 0) {
				oSession = oTopic;
				// break the internal loop
				return false; 
			}
		} );
		
		// break the external loop if session found
		return (oSession == null);
	});

	if(oSession == null) {
		$.each(oBooths, function(sTrackIndex, oTrack){
			$.each(oTrack, function(sTopicIndex, oTopic) {
				if (oTopic.type != TOPIC_TYPE_BREAK &&
					oTopic.speaker.toUpperCase().indexOf(sSearchName)>= 0) {
					oSession = oTopic;
					// break the internal loop
					return false;
				}
			} );

			// break the external loop if session found
			return (oSession == null);
		});
	}
	return oSession;
}

function prepareSpeakersInfo() {
	oSpeakers = $(oSpeakers).sort(function(oSpeaker1, oSpeaker2) {
		var sComp1 = oSpeaker1.name.toUpperCase();
		var sComp2 = oSpeaker2.name.toUpperCase();
		return sComp1.localeCompare(sComp2);
	});

	var oSortedSpeakersInfo = {};
	$.each(oSpeakers, function(oIndex, oSpeaker){

		// Classify a speaker simply by the first letter of his name
		var sLetter = oSpeaker.name.trim().substring(0, 1);
		if(!oSortedSpeakersInfo[sLetter]) {
			oSortedSpeakersInfo[sLetter] = [];
		}
		oSortedSpeakersInfo[sLetter].push(oSpeaker);
	});

	return oSortedSpeakersInfo;
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
		var sTypeCss = "";
		switch (oTopic.type) {
			case SESSION_TYPE_KEYNOTE:
				sTypeCss = TYPE_KEYNOTE_CSS;
				break;
			case SESSION_TYPE_LECTURE:
				sTypeCss = TYPE_LECTURE_CSS;
				break;
			default:
				sTypeCss = TYPE_HANSON_CSS;
		}

		sTitle = oTopic.title;
		sTemplate = (iDuration == 20)
			? $("#track-item-template-20").html()
			: $("#track-item-template").html() ;
		sTemplate = sTemplate
			.replace("{{trackId}}", oTopic.speaker + "@@||@@" + oTopic.title)
			.replace("{{id}}", oTopic.id)
			.replace("{{speaker}}", oTopic.speaker)
			.replace("{{typeCss}}", sTypeCss)
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

function getUrlParameter(sParam) {
	var sPageURL = decodeURIComponent(window.location.search.substring(1)),
		sURLVariables = sPageURL.split('&'),
		sParameterName,
		i;

	for (i = 0; i < sURLVariables.length; i++) {
		sParameterName = sURLVariables[i].split('=');

		if (sParameterName[0] === sParam) {
			return sParameterName[1] === undefined ? true : sParameterName[1];
		}
	}
};


function addOrReplaceUrlParameter(sParam, sNewData) {
	var sStringToAdd = sParam + "=" + sNewData;

	if (window.location.search == "")
		return window.location.href + sStringToAdd;

	if (window.location.search.indexOf(sParam +'=') == -1)
		return window.location.href + sStringToAdd;

	var newSearchString = "";
	var searchParams = window.location.search.substring(1).split("&");
	for (var i = 0; i < searchParams.length; i++) {
		if (searchParams[i].indexOf(sParam +'=') > -1) {
			searchParams[i] = sStringToAdd;
			break;
		}
	}
	return window.location.href.split("?")[0] + "?" + searchParams.join("&");
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

/** popup functions **/
$ = jQuery;

window.showPopup = function (sId) {
	var aSegments = sId.split("@@||@@");
	var oDetailTopic = null;
	var oDate = oInitialDate;
	var oAllTracks = Object.assign(oTracks, oBooths);

	$.each(oAllTracks, function(sTrackIndex, aTopics) {
		if (!oDetailTopic) {
			oDate = oInitialDate;
		} else {
			return;
		}
		for (var i = 0; i < aTopics.length; i++) {
			var oTopic = aTopics[i];
			if (oTopic.speaker === aSegments[0] && oTopic.title === aSegments[1]) {
				oDetailTopic = oTopic;
				return;
			}
			oDate = _addMinutes(oDate, oTopic.duration);
		}
	});

	if (!oDetailTopic) {
		return;
	}

	var oEndDate = _addMinutes(oDate, oDetailTopic.duration);
	var sTime = _getTimeSpanAsString(oDate, oEndDate);

	var sTemplate = $("#session-detail-template").html();
	sTemplate = sTemplate.replace("{{title}}", oDetailTopic.title)
		.replace("{{speaker}}", oDetailTopic.speaker)
		.replace("{{type}}", oDetailTopic.type)
		.replace("{{time}}", sTime);

	openPopup(sTemplate);
};

function openPopup(sContent) {
	$('#popupBlocklayer').fadeIn('slow');

	var $popup = $('#popup');
	$popup.html(sContent);
	$('#popup').removeClass("b-popup__hidden");

	//center popup
	var top = document.documentElement.scrollTop;
	var popupWidth = $popup.width();
	var popupHeight = $popup.height();
	$popup.css({
		position: 'absolute',
		top: $("body").scrollTop() + $(window).height()/2 - popupHeight/2,
		left: $(window).width()/2 - Math.min(800, $(window).width())/2,
	});
	$('#popupBlocklayer').css("top", ($("body").scrollTop()));
}

window.closePopup = function () {
	$('#popup').addClass("b-popup__hidden");
	$('#popupBlocklayer').fadeOut('slow');
};
