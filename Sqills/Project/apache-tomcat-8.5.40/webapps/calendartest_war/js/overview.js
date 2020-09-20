var roomNames = [];
(function loop() {
    $("#clock").html(new Date().toString().substring(0, 25));
    setTimeout(loop, 1000);
})();

$.getJSON("/sqills/api/rooms", function (data) {
    var rooms, i, roomCount;
    rooms = $("#rooms");
    rooms.append("<div class=\"row flex-row flex-nowrap\" style=\"height: 75vh;\"></div>");
    roomCount = 0;
    $(data).each(function () {
        var room;
        var roomName;
        room = $(this).prop("id");
        roomName = $(this).prop("name");
        roomNames.push(roomName);
        rooms.children().append("<div class=\"col-lg-3 col-md-4 col-sm-6 mb-4\" style=\"display: flex;\">" +
        		"<button class=\"col-12 btn btn-success btn-lg\" id=\"" + room + "\" value=\"" + room + "\">" +
				"<h1>" + roomName + "</h1><hr><div class=\"information\"><h2>Available</h2></div></button></div>");
        roomCount++;
    });
    var select = document.getElementById("dropdown");

    for(var i = 0; i < roomNames.length; i++) {
    	
        var name = roomNames[i];
        var el = document.createElement("option");
        
        el.textContent = name;
        el.value = name;
        select.appendChild(el);
    }
    $(".col-12").click(function () {
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
                            buttonClass = "col-12 btn btn-danger btn-lg";
                            information = "<h2>Occupied Soon</h2>";
                        }
                    } else {
                        if (endTime - currentTime > 300000) {
                            buttonClass = "col-12 btn btn-warning btn-lg";
                            information = "<h2>Occupied</h2>";
                        } else {
                            buttonClass = "col-12 btn btn-danger btn-lg";
                            information = "<h2>Available Soon</h2>";
                        }
                    }
                    startTime = new Date(startTime).toString().substring(16, 21);
                    endTime = new Date(endTime).toString().substring(16, 21);
                    information += "<h3>" + startTime + "-" + endTime + "</h3>";
                    if (!$(this).prop("secret")) {
                    	information += "<hr><h4>" + $(this).prop("meetingName") + "</h4>";
                    	information += "<h5>" + $(this).prop("firstName") + " " + $(this).prop("lastName");
                    	information += "<br>and " + ($(this).prop("numberOfAttendees") - 1) + " others" + "</h5>";
                    } else {
                    	information += "<hr><h4>Private Meeting</h4>";
                    }
                }
                $("button#" + $(this).prop("room").id).prop("class", buttonClass).children(".information").html(information);
            });
        });
        setTimeout(loop, 1000);
    })();
    
    

    

    var standard;
    var index;
    //Populates the dropdown menu with all the rooms
    $("#submitbtn").click(function () {
    	var namevalue = [];
    	var value = $("#dropdown").val();
    	localStorage.setItem('standard', value);
    	localStorage.setItem('index', (roomNames.indexOf(value) + 1));
        console.log(localStorage.getItem('standard'));
        console.log(localStorage.getItem('index'));
        
    });
    
    //Checks if the standard room changes and applies it to the button
    (function loop() {
    	if (localStorage.getItem('standard') == null) {
    		document.getElementById("standardRoom").innerHTML = "No default room set";
    	} else {
        document.getElementById("standardRoom").innerHTML = "Back to room: <b>" + localStorage.getItem('standard') + "</b>";
    	}

        setTimeout(loop, 1000);
    })();

    //Returns to default page on click
    document.getElementById("standardRoom").onclick = function () {
    	if (localStorage.getItem('standard') != null) {
    		location.href = "/sqills/room/" + localStorage.getItem('index');
    	}
   
    };
    
    $(document).ready(function(){
  	  // Add smooth scrolling to all links
  	  $("#arrowright").on('click', function(event) {

  	    // Make sure this.hash has a value before overriding default behavior
  	    

  	      // Using jQuery's animate() method to add smooth page scroll
  	      // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
  	      $(".scrollable").animate({
  	        scrollLeft: "800px"
  	      }, 500, function(){
  
  	      });
  	     // End if
  	  });
  	});
});
