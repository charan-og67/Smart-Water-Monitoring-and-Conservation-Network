# Smart Water Quality Monitoring and Conservation Network — Experiments 1–15

This folder combines the Smart Water project work into one project directory. It follows the supplied Node JS Project Titles specification.

## Main technologies
- Experiments 1–3: HTML5/CSS3/Bootstrap/JavaScript validation
- Experiment 4: ES6 + OpenWeatherMap
- Experiment 5: Java JDBC + MySQL (`DBConnection.java`, `SmartWaterCRUD.java`, `schema.sql`)
- Experiment 6: XML + DTD + XSD
- Experiment 7–9: Servlet/controller, transaction history, Cookies and HTTP Session source
- Experiment 10: Node `http`, `os`, `path`, `events`
- Experiment 11–12: Express REST + JWT
- Experiment 13–15: React source files

## Unified Node demo
1. Install Node.js.
2. Run `npm install`.
3. Run `npm start`.
4. Open `http://localhost:3000`.

The Express server exposes `/api/stations`, `/api/measurements`, `/api/alerts`, `/api/transactions`, registration/login, and a JWT-protected `/api/secure/dashboard`.

## Java/JDBC
Configure MySQL and the MySQL Connector/J driver, then run the existing `SmartWaterCRUD.java`.

## Servlet
`SmartWaterServlet.java` and `SessionDemoServlet.java` are source files for a Jakarta Servlet/Tomcat environment.

## React
`react-app.jsx`, `react-weather-service.js`, and `react-todo.jsx` are the React source artifacts for Experiments 13–15. Install React, React Router and Chart.js in a React build when demonstrating those experiments.

## XML
`water-data.xml` is accompanied by `water-data.dtd` and `water-data.xsd` for validation.


## Website navigation
The normal Smart Water website does not show the experiment list or Test Center in its navigation. The experiments are combined into the project implementation, while `test-all.html` is retained as a developer verification page and can be opened directly when needed.
