require('file-loader?name=[name].[ext]!./index.html');
require('file-loader?name=[name].[ext]!./agenda.html');
var markerImg = require('./blocks/b-direction/marker.png');

// MAP
var s = document.createElement("script");
s.async = true;
s.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyCXJT0u0UY0GDNoVLDtJCVcAfSTFh0Q-Fc&callback=initMap";
var a = document.getElementsByTagName("script")[0];
a.parentNode.insertBefore(s, a);

window.initMap = function () {
    var map = new google.maps.Map(document.getElementsByClassName('b-direction__map')[0], {
        center: { lat: 49.240150, lng: 8.639048 },
        minZoom: 1,
        maxZoom: 16,
        zoom: 16,
        streetViewControl: false,
        mapTypeControl: true,
        scrollwheel: false,
        zoomControl: true
    });

    new google.maps.Marker({
        position: {
            lat: 49.241254, /* original center - 49.240850 */
            lng: 8.639473
        },
        map: map,
        clickable: false,
        icon: markerImg
    });
};

window.onscroll = function() {
	if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
		document.getElementById("navTopButton").style.display = "block";
	} else {
		document.getElementById("navTopButton").style.display = "none";
	}
};

// When the user clicks on the button, scroll to the top of the document
window.scrollToTop = function() {
	document.body.scrollTop = 0;
	document.documentElement.scrollTop = 0;
};


//Google Analytics
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
ga('create', 'UA-50072417-1', 'sap.github.io');
ga('set', 'anonymizeIp', true);
ga('send', 'pageview');

//Internal pixel
new Image().src = "https://openui5.hana.ondemand.com/resources/sap/ui/core/themes/base/img/1x1.gif?page=ui5con&ref=" + encodeURIComponent(document.referrer);