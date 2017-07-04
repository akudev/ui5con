var oTracks = require('./data/tracks.json');
var oBooths = require('./data/booths.json');

$(document).ready(function() {
    fillTracks(oTracks);
    fillTracks(oBooths);
});

function fillTracks(oTracks) {
    var oResult = $("#material");
    $.each(oTracks, function(sTrackIndex, oTrack){

        var sHeader = "<div class=\"b-track__header b-font size_18 color_white b-ui\">{{track}}</div>";
        var sTrackHeader = "";
        switch(sTrackIndex) {
            case "track1": sTrackHeader = "ROOM A"; break;
            case "track2": sTrackHeader = "ROOM B"; break;
            case "track3": sTrackHeader = "ROOM C"; break;
            case "booth1": sTrackHeader = "BOOTH 1"; break;
            case "booth2": sTrackHeader = "BOOTH 2"; break;
            case "booth3": sTrackHeader = "BOOTH 3"; break;
        }
        sHeader = sHeader.replace("{{track}}", sTrackHeader);
        oResult.append(sHeader);

        var bTrackEmpty = true;
        $.each(oTrack, function(sTopicIndex, oTopic) {
            if (oTopic.material && Object.keys(oTopic.material).length > 0) {
                var sContent = _createMaterialContent(oTopic);
                oResult.append(sContent);
                bTrackEmpty = false;
            }
        });
        if (bTrackEmpty) {
            oResult.append("<div class=\"b-track__header b-font color_gray b-ui\">no material available for this track yet</div>");
        } else {
            oResult.append("<br>");
        }
    });
}

function _createMaterialContent(oTopic) {
    var sTemplate = $("#material-item-template").html();

        sTemplate = sTemplate
            .replace("{{trackId}}", oTopic.speaker + "@@||@@" + oTopic.title)
            .replace("{{id}}", oTopic.id)
            .replace("{{title}}", oTopic.title)
            .replace("{{speaker}}", oTopic.speaker)
            .replace("{{type}}", oTopic.type);

        var sLink = "<a href=\"{{url}}\" target=\"_blank\">{{text}}</a>";
        var aKeys = Object.keys(oTopic.material);

        var sMaterialLinks = aKeys.map(function(oItem, iIndex) {
            return sLink
                .replace("{{url}}", oTopic.material[oItem])
                .replace("{{text}}", oItem);
        }).join("&nbsp;&nbsp;|&nbsp;&nbsp; ");

        // add links
        sTemplate = sTemplate.replace("{{material}}", sMaterialLinks);

    return sTemplate;
}