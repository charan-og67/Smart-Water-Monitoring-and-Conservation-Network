const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = __dirname;
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const has = (p, terms) => {
  if (!exists(p)) return false;
  const text = read(p);
  return terms.every(t => text.includes(t));
};

function checkNodeSyntax(file) {
  try {
    execFileSync(process.execPath, ['--check', path.join(ROOT, file)], { stdio: 'ignore' });
    return true;
  } catch { return false; }
}

function runStaticChecks() {
  const results = [];
  const add = (id, name, status, detail, evidence) => results.push({ id, name, status, detail, evidence });

  add(1, 'Responsive web application',
    ['index.html','register.html','login.html','stations.html','alerts.html'].every(exists) ? 'PASS' : 'FAIL',
    'Core stakeholder, station and alert pages are present.',
    'HTML pages + CSS layout');

  add(2, 'Bootstrap redesign',
    has('index.html', ['bootstrap@5.3.3','container','row','col-lg-7']) && has('register.html', ['bootstrap@5.3.3','form-control','btn-primary']) ? 'PASS' : 'FAIL',
    'Bootstrap grid/components/utilities are present in the redesigned pages.',
    'Bootstrap 5 CDN + grid/classes');

  add(3, 'JavaScript validation',
    has('js/app.js', ['validateEmail','validatePassword','validateNumber','registerForm','loginForm','stationForm','alertForm']) ? 'PASS' : 'FAIL',
    'Client-side validation functions and handlers are present for the main forms.',
    'js/app.js');

  add(4, 'ES6 + OpenWeatherMap + graphs',
    has('js/experiment4.js', ['=>','Promise','async','await','map(','reduce(','openweathermap.org','Chart']) ? 'READY' : 'FAIL',
    'ES6 syntax, Promise/async-await, OpenWeatherMap request and Chart.js code are present. A live weather call needs an API key.',
    'js/experiment4.js');

  add(5, 'Java JDBC CRUD',
    exists('SmartWaterCRUD.java') && exists('DBConnection.java') && exists('schema.sql') && has('SmartWaterCRUD.java', ['INSERT INTO','SELECT * FROM','UPDATE','DELETE FROM']) ? 'READY' : 'FAIL',
    'Java CRUD source and SQL schema are present. Running it requires MySQL and MySQL Connector/J.',
    'SmartWaterCRUD.java + schema.sql');

  const xml = exists('water-data.xml') ? read('water-data.xml') : '';
  add(6, 'XML + DTD + XSD',
    exists('water-data.xml') && exists('water-data.dtd') && exists('water-data.xsd') && xml.includes('<!DOCTYPE') ? 'PASS' : 'FAIL',
    'XML, DTD and XSD files are present and the XML references a DTD. Full schema validation should be run with an XML validator.',
    'water-data.xml/.dtd/.xsd');

  add(7, 'Servlet controller',
    exists('SmartWaterServlet.java') && has('SmartWaterServlet.java', ['@WebServlet','doGet','doPost']) ? 'READY' : 'FAIL',
    'Servlet controller source is present. Running it requires a Jakarta Servlet container such as Tomcat.',
    'SmartWaterServlet.java');

  add(8, 'Transaction history',
    exists('TransactionHistory.java') && has('TransactionHistory.java', ['archive','printHistory','LocalDateTime']) ? 'READY' : 'FAIL',
    'Transaction archive class is present with archive and history-printing operations.',
    'TransactionHistory.java');

  add(9, 'Cookies + HTTP Session',
    exists('SessionDemoServlet.java') && has('SessionDemoServlet.java', ['HttpSession','setAttribute','Cookie','setMaxAge']) ? 'READY' : 'FAIL',
    'Session and cookie code is present. Running it requires a Jakarta Servlet container.',
    'SessionDemoServlet.java');

  add(10, 'Custom Node.js server',
    exists('custom-server.js') && has('custom-server.js', ["require('http')","require('os')","require('path')","require('events')","/sensor","/system"]) && checkNodeSyntax('custom-server.js') ? 'PASS' : 'FAIL',
    'Custom http server uses os, path and EventEmitter and exposes /sensor and /system.',
    'custom-server.js');

  add(11, 'Express REST CRUD APIs',
    exists('server.js') && has('server.js', ['express','app.get','app.post','app.put','app.delete',"crud('stations'","crud('measurements'","crud('alerts'"]) ? 'PASS' : 'FAIL',
    'Express CRUD routes for stations, measurements and alerts are implemented.',
    'server.js');

  add(12, 'JWT authorization',
    exists('server.js') && has('server.js', ['jsonwebtoken','jwt.sign','jwt.verify','authorization','/api/secure/dashboard']) ? 'PASS' : 'FAIL',
    'JWT creation and protected dashboard endpoint are implemented. The live check below verifies unauthorized and authorized access.',
    'server.js');

  add(13, 'React application + routing',
    exists('react-app.jsx') && has('react-app.jsx', ['BrowserRouter','Routes','Route','Dashboard','Register','Login','Contact','About']) ? 'READY' : 'FAIL',
    'React routing/application source is present. A React toolchain and dependencies are required to build/run it.',
    'react-app.jsx');

  add(14, 'React weather service + Chart.js-ready data',
    exists('react-weather-service.js') && has('react-weather-service.js', ['openweathermap.org','getWeather','averageTemperature']) ? 'READY' : 'FAIL',
    'React weather service and temperature aggregation are present. Chart rendering must be connected through a React build.',
    'react-weather-service.js');

  add(15, 'React sampling/maintenance TODO',
    exists('react-todo.jsx') && has('react-todo.jsx', ['useState','Sampling & Maintenance Tasks','Add']) ? 'READY' : 'FAIL',
    'React task component is present for sampling and maintenance tasks.',
    'react-todo.jsx');

  return results;
}

async function httpJson(url, options = {}) {
  const response = await fetch(url, options);
  let body = null;
  try { body = await response.json(); } catch {}
  return { response, body };
}

async function runLiveChecks(baseUrl) {
  const live = [];
  const add = (id, name, status, detail) => live.push({ id, name, status, detail });

  try {
    const health = await httpJson(`${baseUrl}/api/health`);
    add('L1', 'Unified server health', health.response.ok && health.body?.ok ? 'PASS' : 'FAIL', `HTTP ${health.response.status}`);

    const pages = ['/', '/index.html', '/register.html', '/login.html', '/stations.html', '/alerts.html', '/weather.html', '/experiments.html'];
    let pagePass = true;
    for (const page of pages) {
      const r = await fetch(`${baseUrl}${page}`);
      if (!r.ok) pagePass = false;
    }
    add('L2', 'Core web pages served', pagePass ? 'PASS' : 'FAIL', `${pages.length} pages checked`);

    const station = await httpJson(`${baseUrl}/api/stations`);
    add('L3', 'GET stations API', station.response.ok && Array.isArray(station.body) ? 'PASS' : 'FAIL', `HTTP ${station.response.status}`);

    const measurement = await httpJson(`${baseUrl}/api/measurements`);
    add('L4', 'GET measurements API', measurement.response.ok && Array.isArray(measurement.body) ? 'PASS' : 'FAIL', `HTTP ${measurement.response.status}`);

    const alert = await httpJson(`${baseUrl}/api/alerts`);
    add('L5', 'GET alerts API', alert.response.ok && Array.isArray(alert.body) ? 'PASS' : 'FAIL', `HTTP ${alert.response.status}`);

    const suffix = Date.now();
    const testStation = await httpJson(`${baseUrl}/api/stations`, {
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id:`TEST-${suffix}`,name:'Automated Test Station',location:'Test',status:'Test'})
    });
    const stationCreated = testStation.response.status === 201 && testStation.body?.id;
    let stationUpdated = false, stationDeleted = false;
    if (stationCreated) {
      const updated = await httpJson(`${baseUrl}/api/stations/${encodeURIComponent(testStation.body.id)}`, {
        method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({status:'Updated'})
      });
      stationUpdated = updated.response.ok && updated.body?.status === 'Updated';
      const deleted = await httpJson(`${baseUrl}/api/stations/${encodeURIComponent(testStation.body.id)}`, {method:'DELETE'});
      stationDeleted = deleted.response.ok;
    }
    add('L6', 'Stations CRUD', stationCreated && stationUpdated && stationDeleted ? 'PASS' : 'FAIL', 'POST → PUT → DELETE temporary test station');

    const login = await httpJson(`${baseUrl}/api/login`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'test-user'})});
    const token = login.body?.token;
    const denied = await fetch(`${baseUrl}/api/secure/dashboard`);
    const allowed = token ? await httpJson(`${baseUrl}/api/secure/dashboard`, {headers:{Authorization:`Bearer ${token}`}}) : null;
    add('L7', 'JWT protection', denied.status === 401 && allowed?.response?.ok ? 'PASS' : 'FAIL', `No token: HTTP ${denied.status}; token: HTTP ${allowed?.response?.status ?? 'N/A'}`);

    const registered = await httpJson(`${baseUrl}/api/register`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Automated Test User'})});
    add('L8', 'Registration API', registered.response.status === 201 ? 'PASS' : 'FAIL', `HTTP ${registered.response.status}`);

    add('L9', 'Custom Node server', 'MANUAL', 'Start with "npm run custom-server" and check http://localhost:8081/sensor and /system.');
    add('L10', 'Java/MySQL + Servlet runtime', 'MANUAL', 'Requires MySQL/Connector-J and Tomcat/Jakarta; source-level checks are shown above.');
    add('L11', 'OpenWeatherMap live call', 'MANUAL', 'Requires a valid OpenWeatherMap API key; the weather page validates the request and draws charts when connected.');
    add('L12', 'React build/runtime', 'MANUAL', 'Requires a React toolchain and react-router-dom; source-level checks are shown above.');
  } catch (error) {
    add('LX', 'Live test runner', 'FAIL', error.message);
  }
  return live;
}

module.exports = { runStaticChecks, runLiveChecks };
