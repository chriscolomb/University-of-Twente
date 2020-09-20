$(function () {
	// Clock and upcoming schedule
	(function () {
		var clock, room, url, statusContainer, status, time, additionalInformation, timeout;
		clock = $("#clock");
		room = $("html").data("room");
		url = "./" + room + "/schedule";
		statusContainer = $("#statusContainer");
		status = $("#status");
		time = $("#time");
		additionalInformation = $("#additionalInformation");
		(function loop() {
			clock.html(new Date().toString().substring(16, 21));
			$.getJSON(url, function (data) {
				var toIntervalString, getAdditionalInformation, reservation, currentTime, startTime, endTime;
				toIntervalString = function (startTime = new Date().getTime(), endTime = new Date().getTime()) {
					return new Date(startTime).toString().substring(16, 21).concat(" - ")
							.concat(new Date(endTime).toString().substring(16, 21));
				};
				getAdditionalInformation = function (reservation) {
					var name, numberOfAttendees, additionalInformation;
					if (!reservation.prop("privateMeeting")) {
						name = reservation.prop("firstName") + " " + reservation.prop("lastName");
						numberOfAttendees = reservation.prop("numberOfAttendees") - 1;
						additionalInformation = reservation.prop("meetingName") + "<br>" + name;
						if (numberOfAttendees > 0) {
							additionalInformation += " and " + numberOfAttendees +
									(numberOfAttendees === 1 ? " other" : " others");
						}
						return additionalInformation;
					} else {
						return "Private";
					}
				};
				if (data.length === 0) {
					statusContainer.prop("class", "status-success");
					status.html("Available");
					time.html("");
					additionalInformation.html("");
				} else {
					reservation = $(data).first();
					currentTime = new Date().getTime();
					startTime = reservation.prop("startTime");
					endTime = reservation.prop("endTime");
					if (currentTime < startTime) {
						if (startTime - currentTime > 300000) {
							statusContainer.prop("class", "status-success");
							status.html("Available");
							time.html("");
							additionalInformation.html("");
						} else {
							statusContainer.prop("class", "status-warning");
							status.html("Occupied Soon");
							time.html(toIntervalString(startTime, endTime));
							additionalInformation.html(getAdditionalInformation(reservation));
						}
					} else {
						if (endTime - currentTime > 300000) {
							statusContainer.prop("class", "status-danger");
							status.html("Occupied");
							time.html(toIntervalString(startTime, endTime));
							additionalInformation.html(getAdditionalInformation(reservation));
						} else {
							statusContainer.prop("class", "status-warning");
							status.html("Available Soon");
							time.html(toIntervalString(startTime, endTime));
							additionalInformation.html(getAdditionalInformation(reservation));
						}
					}
				}
			}).fail(function () {
				clearTimeout(timeout);
				console.log("Could not get data from server. Please refresh page after server becomes online.");
			});
			timeout = setTimeout(loop, 1000);
		})();
	})();
	// More schedules
	(function () {
		$(".open").click(function () {
			var arrow;
			var value;
			value += 180;
			$(".footerDrawer .content").slideToggle();
			arrow = $("#arrow");
			$("#arrow").rotate({
				animateTo : value
			})
		});
	})();


	
	// Reservation form
	(function () {
		var convertTime;
		convertTime = function (time) {
			if (typeof time === 'string') {
		        if (/^(0[0-9]|1[0-9]|2[0-3]):(0[0-9]|[1-5][0-9])$/.test(time)) {
		            return parseInt(time.substring(0, 2)) * 60 + parseInt(time.substring(3, 5));
		        } else {
		            return 0;
		        }
		    } else if (typeof time === 'number') {
		        if (time >= 0 && time < 1440) {
		            var hours = Math.floor(time / 60);
		            var minutes = time % 60;
		            return (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes);
		        } else if (time < 0) {
		            return "00:00";
		        } else {
		            return "23:59";
		        }
		    }
		};
		$("#formRoom").change(function () {
			$("#formNumberOfAttendees").prop("max", $(this).children(":selected").data("capacity"));
		});
		$("#formStartTime").change(function () {
			$("#formEndTime").prop("min", convertTime(convertTime($(this).val()) + 1));
		});
		$("#formEndTime").change(function() {
			$("#formStartTime").prop("max", convertTime(convertTime($(this).val()) - 1));
		});
		$("#form").submit(function () {
			var getLocalTime, reservation;
			getLocalTime = function (date, time) {
				var timezone;
				timezone = new Date().toString().substring(25, 33);
				return new Date(date + " " + time + " " + timezone).getTime();
			};
			reservation = {};
			reservation.id = 0;
			reservation.firstName = $("#formFirstName").val();
			reservation.lastName = $("#formLastName").val();
			reservation.email = $("#formEmail").val();
			reservation.meetingName = $("#formMeetingName").val();
			reservation.numberOfAttendees = $("#formNumberOfAttendees").prop("valueAsNumber");
			reservation.room = Number($("#formRoom").val());
			reservation.startTime = getLocalTime($("#formDate").val(), $("#formStartTime").val());
			reservation.endTime = getLocalTime($("#formDate").val(), $("#formEndTime").val());
			reservation.privateMeeting = $("#formPrivateMeeting").prop("checked");
			$.post({
				url: "/sqills/api/rooms",
				data: JSON.stringify(reservation),
				success: function (data) {
					if (data.status === "success") {
						$("#modalReservation").modal("hide");
						$("#reservationSuccessMessage").html(data.message);
						$("#centralModalSuccess").modal("show");
					} else {
						$("#form").find(".is-invalid").removeClass("is-invalid");
						$("#form").find(".form-error").prop("hidden", true);
						if (data.status === "fail-email") {
							$("#formEmail").addClass("is-invalid");
							$("#formEmailError").prop("hidden", false);
						} else if (data.status === "fail-time") {
							$("#formStartTime").addClass("is-invalid");
							$("#formEndTime").addClass("is-invalid");
							$("#formTimeError").prop("hidden", false);
						} else {
							$("#formServerError").prop("hidden", false);
						}
					}
				},
				contentType: "application/json",
				dataType: "json"
			});
			return false;
		});
		$("#modalReservation").on("hidden.bs.modal", function (e) {
			$(e.target).find("#form").get(0).reset();
			$("#form").find(".is-invalid").removeClass("is-invalid");
			$("#form").find(".form-error").prop("hidden", true);
		});
		$("#centralModalSuccess").on("shown.bs.modal", function (e) {
			setTimeout(function () {
				$(e.target).modal("hide");
			}, 5000);
		}).on("hidden.bs.modal", function (e) {
			$(e.target).find("#reservationSuccessMessage").html("");
		});
		$("#reservation").click(function () {
			$.getJSON("/sqills/api/rooms", function (data) {
				var room, options, numberOfAttendees;
				room = $("html").data("room");
				options = $("#formRoom");
				numberOfAttendees = $("#formNumberOfAttendees");
				$.each(data, function (key, val) {
					var option;
					option = $(new Option(val.id)).data("capacity", val.capacity);
					if (val.id === room) {
						option.prop("selected", true);
						numberOfAttendees.prop("max", option.data("capacity"));
					}
					options.append(option);
				});
			});
			(function () {
				var date, month, day, value;
				date = new Date();
				month = date.getMonth() + 1;
				day = date.getDate();
				value = date.getFullYear() + "-" + (month < 10 ? "0" : "") + month + "-" + (day < 10 ? "0" : "") + day;
				$("#formDate").val(value).prop("min", value);
				$("#formStartTime").val(date.toString().substring(16, 21)).prop("max", "23:58");
				$("#formEndTime").val(convertTime(convertTime($("#formStartTime").val()) + 30)).prop("min", "00:01");
			})();
			$("#modalReservation").modal("show");
		});
	})();
});