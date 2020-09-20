$(function () {
	// Display reservations
	(function () {
		var rowData;
		$.getJSON("/sqills/api/reservations", function (data) {
			var dataSet, i, reservation, table;
			dataSet = [];
			for (i = 0; i < data.length; i++) {
				reservation = data[i];
				dataSet.push([reservation.eventId, reservation.room.name, new Date(reservation.startTime).toString().substring(4, 21),
						new Date(reservation.endTime).toString().substring(4, 21), reservation.user.email, reservation.name,
						reservation.numberOfAttendees, reservation.visible]);
			}
			table = $("#dt-select").DataTable({
				data: dataSet,
				columns: [
					{
						title: "Id"
					}, {
						title: "Room"
					}, {
						title: "Start time",
						type: "date"
					}, {
						title: "End time",
						type: "date"
					}, {
						title: "User"
					}, {
						title: "Name",
						orderable: false
					}, {
						title: "Number of attendees",
						orderable: false
					}, {
						title: "Visible"
					}
				],
				dom: "ftipr",
				select: {
					blurable: true,
					info: false,
					style: "single"
				}
			}).on("deselect", function () {
				$("#editButton").prop("disabled", true);
				$("#deleteButton").prop("disabled", true);
			}).on("select", function (indexes) {
				$("#editButton").prop("disabled", false);
				$("#deleteButton").prop("disabled", false);
				rowData = table.row(indexes[0]).data();
			});
		});
		$("#btnYes").click(function () {
			$.ajax({
				method: "DELETE",
				url: "/sqills/api/reservations?eventId=" + rowData[0],
				success: function () {
					setTimeout(function () {
						location.reload();
					}, 1000);
				}
			});
		});
	})();
	$("#deleteButton").click(function () {
		$("#modalDelete").modal("show");
	});
	// Configure modal for adding reservation
	(function () {
		var displayInvalidFeedback = function (selector, message) {
			var element = $(selector);
			if (element.prop("tagName") !== "SELECT") {
				if (message !== null) {
					element.addClass("is-invalid").siblings(".invalid-feedback").html(message);
				} else {
					element.removeClass("is-invalid").siblings(".invalid-feedback").html("");
				}
			} else {
				if (message !== null) {
					element.addClass("is-invalid").parent().siblings(".invalid-feedback").css("display", "block");
				} else {
					element.removeClass("is-invalid").parent().siblings(".invalid-feedback").css("display", "none");
				}
			}
		}
		$("#room").change(function (e) {
			displayInvalidFeedback("#room", null);
			if ($("#numberOfAttendees").val() !== "" && !$("#numberOfAttendees").hasClass("is-invalid")) {
				var numberOfAttendees = parseInt($("#numberOfAttendees").val());
				var capacity = $("#room option:selected").data("capacity");
				if (numberOfAttendees > capacity) {
					displayInvalidFeedback("#numberOfAttendees", "Please enter number smaller than " + (capacity + 1) + ".");
				}
			}
		});
		$("#email").keyup(function (e) {
			if (e.target.value === "") {
				displayInvalidFeedback("#email", "Please enter email.");
			} else if (!e.target.value.match(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)) {
				displayInvalidFeedback("#email", "Please enter valid email.");
			} else {
				displayInvalidFeedback("#email", null);
			}
		});
		$("#numberOfAttendees").keyup(function (e) {
			if (e.target.value === "") {
				displayInvalidFeedback("#numberOfAttendees", "Please enter number of attendees.");
			} else if (e.target.value.match(/^[1-9]\d*$/) === null) {
				displayInvalidFeedback("#numberOfAttendees", "Please enter number larger than 0.");
			} else if ($("#room").val() !== "" && parseInt(e.target.value) > $("#room option:selected").data("capacity")) {
				displayInvalidFeedback("#numberOfAttendees", "Please enter number smaller than " + ($("#room option:selected").data("capacity") + 1) + ".");
			} else {
				displayInvalidFeedback("#numberOfAttendees", null);
			}
		});
		$("#secret").change(function (e) {
			$("#email").val("").trigger("change");
			displayInvalidFeedback("#email", null);
			$("#meetingName").val("").trigger("change");
			displayInvalidFeedback("#meetingName", null);
			$("#numberOfAttendees").val("").trigger("change");
			displayInvalidFeedback("#numberOfAttendees", null);
			if ($(e.target).prop("checked")) {
				$("#email").parent().prop("hidden", true);
				$("#meetingName").parent().prop("hidden", true);
				$("#numberOfAttendees").parent().prop("hidden", true);
			} else {
				$("#email").parent().prop("hidden", false);
				$("#meetingName").parent().prop("hidden", false);
				$("#numberOfAttendees").parent().prop("hidden", false);
			}
		});
		$("#modalAddButton").click(function () {
			if ($("#modalAdd .is-invalid").length !== 0) {
				return;
			}
			// Final validation
			if ($("#room").prop("selectedIndex") === 0) {
				displayInvalidFeedback("#room", "Please select room.");
			}
			if ($("#startTime").val() !== "" && $("#endTime").val() !== "" && $("#startTime").val() >= $("#endTime").val()) {
				displayInvalidFeedback("#startTime", "Please select time before " + $("#endTime").val() + ".");
				displayInvalidFeedback("#endTime", "Please select time after " + $("#startTime").val() + ".");
			}
			var user = {};
			if (!$("#secret").prop("checked")) {
				if ($("#email").val() === "") {
					displayInvalidFeedback("#email", "Please enter email.");
				} else {
					$.getJSON("/sqills/api/users?email=" + $("#email").val(), function (data) {
						if (data.length === 0) {
							displayInvalidFeedback("#email", "Unknown email");
						} else {
							user = data[0];
						}
					});
				}
				if ($("#numberOfAttendees").val() === "") {
					displayInvalidFeedback("#numberOfAttendees", "Please enter number of attendees.");
				}
			}
			$(document).ajaxComplete(function (event, jqXHR, ajaxOptions) {
				console.log(event);
				console.log(jqXHR);
				console.log(ajaxOptions);
				if ($("#modalAdd .is-invalid").length !== 0) {
					return;
				}
				// Process reservation
				var reservation = {};
				reservation.id = 0;
				reservation.room = {
						id: parseInt($("#room option:selected").val()),
						name: $("#room option:selected").text(),
						capacity: $("#room option:selected").data("capacity")
				};
				reservation.startTime = new Date($("#date").val() + " " + $("#startTime").val()).getTime();
				reservation.endTime = new Date($("#date").val() + " " + $("#endTime").val()).getTime();
				reservation.user = user;
				reservation.name = $("#meetingName").val();
				reservation.numberOfAttendees = parseInt($("#numberOfAttendees").val());
				reservation.secret = $("#secret").prop("checked");
				console.log(JSON.stringify(reservation));
			});
		});
		$("#modalAdd").on("show.bs.modal", function () {
			$.getJSON("/sqills/api/rooms", function (data) {
				var options = $("#room").prop("options");
				for (var i = 0; i < data.length; i++) {
					var room = data[i];
					var option = new Option(room.name, room.id);
					$(option).data("capacity", room.capacity);
					options.add(option);
				}
				$("#room").materialSelect();
			});
			$("#date").pickadate({
				format: "dd mmm yyyy",
				min: 0,
				onSet: function () {
					if ($("#date").val() === "") {
						displayInvalidFeedback("#date", "Please select date.");
					} else {
						displayInvalidFeedback("#date", null);
					}
				}
			}).data("pickadate").set("select", new Date());
			$("#startTime").pickatime({
				afterDone: function () {
					if ($("#startTime").val() === "") {
						displayInvalidFeedback("#startTime", "Please select start time.");
					} else if ($("#endTime").val() !== "" && $("#startTime").val() >= $("#endTime").val()) {
						displayInvalidFeedback("#startTime", "Please select time before " + $("#endTime").val() + ".");
					} else {
						displayInvalidFeedback("#startTime", null);
						displayInvalidFeedback("#endTime", null);
					}
				}
			}).val(new Date().toTimeString().substring(0, 5));
			$("#endTime").pickatime({
				afterDone: function () {
					if ($("#endTime").val() === "") {
						displayInvalidFeedback("#endTime", "Please select end time.");
					} else if ($("#startTime").val() !== "" && $("#endTime").val() <= $("#startTime").val()) {
						displayInvalidFeedback("#endTime", "Please select time after " + $("#startTime").val() + ".");
					} else {
						displayInvalidFeedback("#endTime", null);
						displayInvalidFeedback("#startTime", null);
					}
				}
			}).val(new Date().toTimeString().substring(0, 5));
		}).on("hidden.bs.modal", function () {
			displayInvalidFeedback("#modalAdd .is-invalid", null);
			var options = $("#room").prop("options");
			options.selectedIndex = 0;
			while (options.length > 1) {
				options.remove(1);
			}
			$("#secret").prop("checked", false).trigger("change");
		});
	})();
});