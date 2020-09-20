

import java.sql.*;
import java.text.ParseException;
import java.text.SimpleDateFormat;

public class Exercise5 {

	static String host = "database.sqills.kro.kr";
	static String dbName = "sqills";
	static String username = "jasper";
	static String password = "jasper";
	static String url = "jdbc:mysql://" + host + ":3306/" + dbName;

	public Time getCurrentTime() {
		java.util.Date today = new java.util.Date();
		Time time = new java.sql.Time(today.getTime());
		return time;

	}

	public boolean checkAvailable(String roomId) {
		String query = "SELECT reservation.reservationId, reservation.startTime, reservation.endTime, current_time\r\n"
				+ "FROM reservation, room\r\n" + "WHERE reservation.roomId = room.roomId\r\n"
				+ "AND room.roomId = ? \r\n" + "AND reservation.date = CURRENT_DATE";
		// execute query
		Connection connection = null;
		ResultSet resultSet = null;
		boolean available = true;
		try {
			connection = DriverManager.getConnection(url, username, password);
			PreparedStatement statement = connection.prepareStatement(query);
			statement.setString(1, roomId);
			resultSet = statement.executeQuery();
			while (resultSet.next()) {

				System.out.println("start: " + resultSet.getTime(2));
				System.out.println("end: " + resultSet.getTime(3) + "\n");
				if (resultSet.getTime(2).before(resultSet.getTime(4))) {
					if (resultSet.getTime(4).before(resultSet.getTime(3))) {
						available = false;
					}
				}
			}
			connection.close();
		} catch (

		SQLException sqle) {
			System.err.println("Error connecting: " + sqle);
		}
		System.out.println("\nRoom available:");
		return available;
	}

	public void makeReservation(String roomId, String startTime, String endTime, String employeeId, String date) {
		String query = "INSERT INTO reservation (startTime, endTime, roomId, employeeId, DATE)"
				+ "VALUES (?, ?, ?, ?, ?)";
		Connection connection = null;

		if (checkReservation(roomId, startTime, endTime)) {
		try {
			connection = DriverManager.getConnection(url, username, password);
			PreparedStatement statement = connection.prepareStatement(query);
			statement.setString(1, startTime);
			statement.setString(2, endTime);
			statement.setString(3, roomId);
			statement.setString(4, employeeId);
			statement.setString(5, date);
			statement.execute();
			System.out.println("Added reservation.");
			connection.close();
		} catch (

		SQLException sqle) {
			System.err.println("Error connecting: " + sqle);
		}
		} else {
			System.out.println("Timeslot not available.");
		}

	}

	public Time stringToTime(String time) {
		// convert string to java.sql.time
		SimpleDateFormat sdf = new SimpleDateFormat("hh:mm:ss");
		long ms = 0;
		try {
			ms = sdf.parse(time).getTime();

		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return new Time(ms);
	}

	public boolean checkReservation(String roomId, String startTime, String endTime) {
		// convert string to java.sql.time

		Time start = stringToTime(startTime);
		Time end = stringToTime(endTime);
		boolean available = true;

		String query = "SELECT reservation.reservationId, reservation.startTime, reservation.endTime, current_time\r\n"
				+ "FROM reservation, room\r\n" + "WHERE reservation.roomId = room.roomId\r\n"
				+ "AND room.roomId = ? \r\n" + "AND reservation.date = CURRENT_DATE";
		// execute query
		Connection connection = null;
		ResultSet resultSet = null;

		try {
			connection = DriverManager.getConnection(url, username, password);
			PreparedStatement statement = connection.prepareStatement(query);
			statement.setString(1, roomId);
			resultSet = statement.executeQuery();
			while (resultSet.next()) {

				//System.out.println("start: " + resultSet.getTime(2));
				//System.out.println("end: " + resultSet.getTime(3) + "\n");

				if (start.after(resultSet.getTime(2))) {
					//System.out.println("succes 1");
					if (start.before(resultSet.getTime(3))) {
						//System.out.println("succes 1");
						available = false;
					}
				}
				if (end.after(resultSet.getTime(2))) {
					//System.out.println("succes 2");
					if (end.before(resultSet.getTime(3))) {
						//System.out.println("succes 2");
						available = false;
					}
				}
			}
			connection.close();
		} catch (

		SQLException sqle) {
			System.err.println("Error connecting: " + sqle);
		}
		//System.out.println("Requested times: " + start + " - " + end + "\nAvailable?");

		return available;

	}

	public static void main(String[] args) {

		Exercise5 a = new Exercise5();
		//System.out.println(a.checkAvailable("102"));
		a.makeReservation("102", "10:30:00", "10:45:00", "1", "20190509");
		//System.out.println(a.checkReservation("102", "10:31:00", "10:59:00"));
	}

}
