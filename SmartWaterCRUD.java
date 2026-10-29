import java.sql.*;
import java.util.Scanner;

public class SmartWaterCRUD {
    static Scanner sc = new Scanner(System.in);

    public static void main(String[] args) {
        try (Connection con = DBConnection.getConnection()) {
            System.out.println("Connected to Smart Water database.");
            while (true) {
                System.out.println("\n===== SMART WATER QUALITY MONITORING =====");
                System.out.println("1. Monitoring Stations");
                System.out.println("2. Water-Quality Measurements");
                System.out.println("3. Alerts");
                System.out.println("4. Exit");
                System.out.print("Enter choice: ");
                int choice = readInt();

                switch (choice) {
                    case 1 -> stationMenu(con);
                    case 2 -> measurementMenu(con);
                    case 3 -> alertMenu(con);
                    case 4 -> { System.out.println("Application closed."); return; }
                    default -> System.out.println("Invalid choice.");
                }
            }
        } catch (SQLException e) {
            System.out.println("Database connection failed: " + e.getMessage());
        }
    }

    static void stationMenu(Connection con) {
        while (true) {
            System.out.println("\n--- MONITORING STATIONS ---");
            System.out.println("1. Create  2. Read  3. Update  4. Delete  5. Back");
            System.out.print("Choice: ");
            int c = readInt();
            try {
                switch (c) {
                    case 1 -> createStation(con);
                    case 2 -> readStations(con);
                    case 3 -> updateStation(con);
                    case 4 -> deleteStation(con);
                    case 5 -> { return; }
                    default -> System.out.println("Invalid choice.");
                }
            } catch (SQLException e) { System.out.println("Error: " + e.getMessage()); }
        }
    }

    static void createStation(Connection con) throws SQLException {
        System.out.print("Station name: "); String name = sc.nextLine();
        System.out.print("Location: "); String location = sc.nextLine();
        System.out.print("Status: "); String status = sc.nextLine();
        String sql = "INSERT INTO monitoring_stations(station_name, location, status) VALUES (?, ?, ?)";
        try (PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, name); ps.setString(2, location); ps.setString(3, status);
            ps.executeUpdate();
            System.out.println("Station created successfully.");
        }
    }

    static void readStations(Connection con) throws SQLException {
        String sql = "SELECT * FROM monitoring_stations ORDER BY station_id";
        try (Statement st = con.createStatement(); ResultSet rs = st.executeQuery(sql)) {
            System.out.println("\nID | Name | Location | Status");
            while (rs.next()) {
                System.out.printf("%d | %s | %s | %s%n", rs.getInt("station_id"),
                        rs.getString("station_name"), rs.getString("location"), rs.getString("status"));
            }
        }
    }

    static void updateStation(Connection con) throws SQLException {
        System.out.print("Station ID: "); int id = readInt();
        System.out.print("New name: "); String name = sc.nextLine();
        System.out.print("New location: "); String location = sc.nextLine();
        System.out.print("New status: "); String status = sc.nextLine();
        String sql = "UPDATE monitoring_stations SET station_name=?, location=?, status=? WHERE station_id=?";
        try (PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, name); ps.setString(2, location); ps.setString(3, status); ps.setInt(4, id);
            System.out.println(ps.executeUpdate() > 0 ? "Station updated." : "Station not found.");
        }
    }

    static void deleteStation(Connection con) throws SQLException {
        System.out.print("Station ID: "); int id = readInt();
        try (PreparedStatement ps = con.prepareStatement("DELETE FROM monitoring_stations WHERE station_id=?")) {
            ps.setInt(1, id);
            System.out.println(ps.executeUpdate() > 0 ? "Station deleted." : "Station not found.");
        }
    }

    static void measurementMenu(Connection con) {
        while (true) {
            System.out.println("\n--- WATER-QUALITY MEASUREMENTS ---");
            System.out.println("1. Create  2. Read  3. Update  4. Delete  5. Back");
            System.out.print("Choice: ");
            int c = readInt();
            try {
                switch (c) {
                    case 1 -> createMeasurement(con);
                    case 2 -> readMeasurements(con);
                    case 3 -> updateMeasurement(con);
                    case 4 -> deleteMeasurement(con);
                    case 5 -> { return; }
                    default -> System.out.println("Invalid choice.");
                }
            } catch (SQLException e) { System.out.println("Error: " + e.getMessage()); }
        }
    }

    static void createMeasurement(Connection con) throws SQLException {
        System.out.print("Station ID: "); int stationId = readInt();
        System.out.print("pH: "); double ph = readDouble();
        System.out.print("Temperature: "); double temp = readDouble();
        System.out.print("Turbidity: "); double turbidity = readDouble();
        String sql = "INSERT INTO water_measurements(station_id, ph, temperature, turbidity) VALUES (?, ?, ?, ?)";
        try (PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, stationId); ps.setDouble(2, ph); ps.setDouble(3, temp); ps.setDouble(4, turbidity);
            ps.executeUpdate(); System.out.println("Measurement created.");
        }
    }

    static void readMeasurements(Connection con) throws SQLException {
        String sql = "SELECT m.*, s.station_name FROM water_measurements m JOIN monitoring_stations s ON m.station_id=s.station_id ORDER BY m.measurement_id";
        try (Statement st = con.createStatement(); ResultSet rs = st.executeQuery(sql)) {
            System.out.println("\nID | Station | pH | Temp | Turbidity | Measured At");
            while (rs.next()) System.out.printf("%d | %s | %.2f | %.2f | %.2f | %s%n",
                    rs.getInt("measurement_id"), rs.getString("station_name"), rs.getDouble("ph"),
                    rs.getDouble("temperature"), rs.getDouble("turbidity"), rs.getTimestamp("measured_at"));
        }
    }

    static void updateMeasurement(Connection con) throws SQLException {
        System.out.print("Measurement ID: "); int id = readInt();
        System.out.print("New station ID: "); int stationId = readInt();
        System.out.print("New pH: "); double ph = readDouble();
        System.out.print("New temperature: "); double temp = readDouble();
        System.out.print("New turbidity: "); double turbidity = readDouble();
        String sql = "UPDATE water_measurements SET station_id=?, ph=?, temperature=?, turbidity=? WHERE measurement_id=?";
        try (PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, stationId); ps.setDouble(2, ph); ps.setDouble(3, temp); ps.setDouble(4, turbidity); ps.setInt(5, id);
            System.out.println(ps.executeUpdate() > 0 ? "Measurement updated." : "Measurement not found.");
        }
    }

    static void deleteMeasurement(Connection con) throws SQLException {
        System.out.print("Measurement ID: "); int id = readInt();
        try (PreparedStatement ps = con.prepareStatement("DELETE FROM water_measurements WHERE measurement_id=?")) {
            ps.setInt(1, id); System.out.println(ps.executeUpdate() > 0 ? "Measurement deleted." : "Measurement not found.");
        }
    }

    static void alertMenu(Connection con) {
        while (true) {
            System.out.println("\n--- ALERTS ---");
            System.out.println("1. Create  2. Read  3. Update  4. Delete  5. Back");
            System.out.print("Choice: ");
            int c = readInt();
            try {
                switch (c) {
                    case 1 -> createAlert(con);
                    case 2 -> readAlerts(con);
                    case 3 -> updateAlert(con);
                    case 4 -> deleteAlert(con);
                    case 5 -> { return; }
                    default -> System.out.println("Invalid choice.");
                }
            } catch (SQLException e) { System.out.println("Error: " + e.getMessage()); }
        }
    }

    static void createAlert(Connection con) throws SQLException {
        System.out.print("Station ID: "); int stationId = readInt();
        System.out.print("Alert type: "); String type = sc.nextLine();
        System.out.print("Message: "); String message = sc.nextLine();
        System.out.print("Severity: "); String severity = sc.nextLine();
        String sql = "INSERT INTO alerts(station_id, alert_type, message, severity) VALUES (?, ?, ?, ?)";
        try (PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, stationId); ps.setString(2, type); ps.setString(3, message); ps.setString(4, severity);
            ps.executeUpdate(); System.out.println("Alert created.");
        }
    }

    static void readAlerts(Connection con) throws SQLException {
        String sql = "SELECT a.*, s.station_name FROM alerts a JOIN monitoring_stations s ON a.station_id=s.station_id ORDER BY a.alert_id";
        try (Statement st = con.createStatement(); ResultSet rs = st.executeQuery(sql)) {
            System.out.println("\nID | Station | Type | Message | Severity | Created At");
            while (rs.next()) System.out.printf("%d | %s | %s | %s | %s | %s%n", rs.getInt("alert_id"),
                    rs.getString("station_name"), rs.getString("alert_type"), rs.getString("message"),
                    rs.getString("severity"), rs.getTimestamp("created_at"));
        }
    }

    static void updateAlert(Connection con) throws SQLException {
        System.out.print("Alert ID: "); int id = readInt();
        System.out.print("New station ID: "); int stationId = readInt();
        System.out.print("New alert type: "); String type = sc.nextLine();
        System.out.print("New message: "); String message = sc.nextLine();
        System.out.print("New severity: "); String severity = sc.nextLine();
        String sql = "UPDATE alerts SET station_id=?, alert_type=?, message=?, severity=? WHERE alert_id=?";
        try (PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, stationId); ps.setString(2, type); ps.setString(3, message); ps.setString(4, severity); ps.setInt(5, id);
            System.out.println(ps.executeUpdate() > 0 ? "Alert updated." : "Alert not found.");
        }
    }

    static void deleteAlert(Connection con) throws SQLException {
        System.out.print("Alert ID: "); int id = readInt();
        try (PreparedStatement ps = con.prepareStatement("DELETE FROM alerts WHERE alert_id=?")) {
            ps.setInt(1, id); System.out.println(ps.executeUpdate() > 0 ? "Alert deleted." : "Alert not found.");
        }
    }

    static int readInt() { while (true) try { return Integer.parseInt(sc.nextLine()); } catch (Exception e) { System.out.print("Enter a valid number: "); } }
    static double readDouble() { while (true) try { return Double.parseDouble(sc.nextLine()); } catch (Exception e) { System.out.print("Enter a valid value: "); } }
}
