CREATE DATABASE IF NOT EXISTS smart_water;
USE smart_water;

CREATE TABLE IF NOT EXISTS monitoring_stations (
    station_id INT PRIMARY KEY AUTO_INCREMENT,
    station_name VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL,
    status VARCHAR(30) NOT NULL
);

CREATE TABLE IF NOT EXISTS water_measurements (
    measurement_id INT PRIMARY KEY AUTO_INCREMENT,
    station_id INT NOT NULL,
    ph DECIMAL(5,2),
    temperature DECIMAL(6,2),
    turbidity DECIMAL(8,2),
    measured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (station_id) REFERENCES monitoring_stations(station_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS alerts (
    alert_id INT PRIMARY KEY AUTO_INCREMENT,
    station_id INT NOT NULL,
    alert_type VARCHAR(100) NOT NULL,
    message VARCHAR(255) NOT NULL,
    severity VARCHAR(30) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (station_id) REFERENCES monitoring_stations(station_id) ON DELETE CASCADE
);
