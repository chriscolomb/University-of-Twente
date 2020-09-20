
<?php

include('../src/google_proxy.php');

$calendar = new GoogleCalendarProxy(
    "c.colomb@student.utwente.nl@developer.gserviceaccount.com",
    "c.colomb@student.utwente.nl.apps.googleusercontent.com",
    file_get_contents("AIzaSyB2FQvt3PLM09t8qrouYRysk7rlrlVpSfw"),
    "sqills.com_32353339353033353331@resource.calendar.google.com"
);

$calendar->connect();
?>
