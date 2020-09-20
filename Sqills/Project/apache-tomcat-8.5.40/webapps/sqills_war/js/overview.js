(function loop() {
    $("#clock").html(new Date().toString().substring(0, 25));
    setTimeout(loop, 1000);
})();

$.getJSON("/sqills/api/rooms", function (data) {
    var rooms, i, roomCount;
    rooms = $("#rooms");
    for (i = 0; i < Math.ceil(data.length / 4); i++) {
        rooms.append("<div class=\"row row-eq-height\" style=\"margin-top: 30px\"></div>");
    }
    roomCount = 0;
    $(data).each(function () {
        var room;
        room = $(this).prop("id");
        rooms.children().eq(Math.floor(roomCount / 4)).append("<div class=\"col-3\" style=\"display: flex;\">" +
        		"<button class=\"col-12 btn btn-success btn-lg\" id=\"" + room + "\" value=\"" + room + "\">" +
				"<h1>Room " + room + "</h1><hr><div class=\"information\"><h2>Available</h2></div></button></div>");
        roomCount++;
    });
    $("button").click(function () {
        $(location).prop("href", "./room/" + $(this).val());
    });
    (function loop() {
        $.getJSON("/sqills/api/reservations/overview", function (data) {
            $(data).each(function () {
                var currentTime, startTime, endTime, buttonClass, information;
                buttonClass = "col-12 btn btn-success btn-lg";
                information = "<h2>Available</h2>";
                if ($(this).prop("id") !== 0) {
                    currentTime = new Date().getTime();
                    startTime = $(this).prop("startTime");
                    endTime = $(this).prop("endTime");
                    if (currentTime < startTime) {
                        if (startTime - currentTime <= 300000) {
                            buttonClass = "col-12 btn btn-warning btn-lg";
                            information = "<h2>Occupied Soon</h2>";
                        }
                    } else {
                        if (endTime - currentTime > 300000) {
                            buttonClass = "col-12 btn btn-danger btn-lg";
                            information = "<h2>Occupied</h2>";
                        } else {
                            buttonClass = "col-12 btn btn-warning btn-lg";
                            information = "<h2>Available Soon</h2>";
                        }
                    }
                    startTime = new Date(startTime).toString().substring(16, 21);
                    endTime = new Date(endTime).toString().substring(16, 21);
                    information += "<h3>" + startTime + "-" + endTime + "</h3>";
                    if (!$(this).prop("privateMeeting")) {
                    	information += "<hr><h4>" + $(this).prop("meetingName") + "</h4>";
                    	information += "<h5>" + $(this).prop("firstName") + " " + $(this).prop("lastName");
                    	information += "<br>and " + ($(this).prop("numberOfAttendees") - 1) + " others" + "</h5>";
                    } else {
                    	information += "<hr><h4>Private Meeting</h4>";
                    }
                }
                $("button#" + $(this).prop("room")).prop("class", buttonClass);
                $("button#" + $(this).prop("room")).find(".information").html(information);
            });
        });
        setTimeout(loop, 1000);
    })();
});