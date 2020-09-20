import java.sql.*;

public class Database {

    public static Connection conn;

    public static void main(String args[]) {
        String host = "farm09.ewi.utwente.nl";
        String dbName = "docker";
        String username = "docker";
        String password = "Lx9tNgO7sx";
        String url = "jdbc:postgresql://" + host + ":7107/" + dbName;

        try {
            Class.forName("org.postgresql.Driver");

            try {
                conn = DriverManager.getConnection(url, username, password);
                queryTest();

                // ---test reservation---
                /*Date reservationDate = Date.valueOf("2019-05-11");
                Time startTime = new Time(15, 0, 0);
                Time endTime = new Time(18, 0, 0);

                makeReservation("jgentry@sqills.com",103, reservationDate, startTime, endTime);*/

                conn.close();
            } catch (SQLException sqle) {
                System.err.println("Error connecting: " + sqle);
            }
        } catch (ClassNotFoundException e) {
            System.err.println("JDBC driver not loaded");
        }
    }

    public static void queryTest() {
        try {
            Statement st = conn.createStatement();
            ResultSet rs = st.executeQuery(
                    "SELECT tc1 FROM test WHERE tc1 = 'test1'");
            int i=1;
            while (rs.next())
            {
                System.out.println(i+" : "+rs.getString(1));
                i++;
            }
            rs.close();
            st.close();
        } catch(SQLException e) {
            System.err.println("Oops: " + e.getMessage() );
            System.err.println("SQLState: " + e.getSQLState() );
        }
    }



    public static boolean isRoomAvailable(int roomId, Date date, Time startTime, Time endTime) {
        return true;
    }

    public static void makeReservation(String email, int roomId, Date date, Time startTime, Time endTime) {
        try {
            if (isRoomAvailable(roomId, date, startTime, endTime)) {
                Statement st1 = conn.createStatement();
                ResultSet rs1 = st1.executeQuery(
                        "SELECT personId " +
                                "FROM Person " +
                                "WHERE email = " + "'" + email + "'");
                //System.out.println(rs1.getString(1));
                String personId = rs1.getString(1);
                rs1.close();
                st1.close();
                Statement st2 = conn.createStatement();
                st2.executeQuery(
                        "INSERT INTO Reservation(roomId, date, startTime, endTime) " +
                                "VALUES(" + roomId + ", " + date + ", " + startTime + ", " + endTime + ", " + personId + ")");
                st2.close();
            }
        } catch(SQLException e) {
            System.err.println("Oops: " + e.getMessage() );
            System.err.println("SQLState: " + e.getSQLState() );
        }
    }

}
