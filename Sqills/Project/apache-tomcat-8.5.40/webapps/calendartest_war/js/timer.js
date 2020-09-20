//Returns to default page after 3 minutes

(function(seconds) {
	if (localStorage.getItem('standard') != null) {
		var room = String($("html").data("room"));
		var standard = localStorage.getItem('index');
		if (room.localeCompare(standard) != 0) {
			var refresh,       
        		intvrefresh = function() {
            		clearInterval(refresh);
            		refresh = setTimeout(function() {
            			location.href = "/sqills/room/" + localStorage.getItem('index');
            		}, seconds * 1000);
        		};

        		$(document).on('keypress click', function() { intvrefresh() });
        		intvrefresh();
		}
	}
}(180));