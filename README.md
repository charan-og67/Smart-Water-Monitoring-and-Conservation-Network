# Smart Water Quality Monitoring and Conservation Network

Combined project containing the Smart Water frontend and the Java JDBC CRUD implementation.

## Files
- `index.html` - home/dashboard
- `register.html` - stakeholder registration
- `login.html` - login
- `stations.html` - monitoring stations
- `alerts.html` - alert management
- `weather.html` - weather and water-quality trends (ES6)
- `css/style.css` - shared styling
- `js/app.js` - shared frontend logic
- `js/experiment4.js` - ES6 weather functionality
- `DBConnection.java` - MySQL JDBC connection
- `SmartWaterCRUD.java` - CRUD operations for stations, measurements, and alerts
- `schema.sql` - MySQL database schema
- `README-JDBC.md` - JDBC setup notes

## Java/JDBC
The Java files are intentionally in this same project folder; there is no separate Experiment 5 folder.

Run `schema.sql` in MySQL, update the database credentials in `DBConnection.java`, add MySQL Connector/J to the classpath, then compile and run `SmartWaterCRUD`.


LOGIN/REGISTRATION FIX
- Registration stores accounts in browser localStorage when using Live Server/static mode.
- Login checks the registered email and password and creates a session in sessionStorage.
- The Node/Express API also validates registration and login and issues a JWT.
