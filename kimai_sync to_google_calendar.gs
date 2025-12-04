// ==========================================
// KIMAI SYNC (Team Logs)
// ==========================================

function syncKimaiToCalendar() {
  // Load Secrets
  var props = PropertiesService.getScriptProperties();
  var API_TOKEN = props.getProperty('KIMAI_API_TOKEN');
  var BASE_URL = props.getProperty('KIMAI_BASE_URL');
  var CAL_ID = props.getProperty('KIMAI_CAL_ID');

  var today = new Date();
  var startOfDay = new Date(today.setHours(0,0,0,0)).toISOString().split('.')[0]; 
  
  var headers = {
    "Authorization": "Bearer " + API_TOKEN,
    "Content-Type": "application/json"
  };

  // 1. Fetch Maps (Users/Projects/Activities)
  var userMap = {};
  var activityMap = {};
  var projectMap = {};

  try {
    var userResp = UrlFetchApp.fetch(BASE_URL + '/api/users?visible=1', {headers: headers});
    JSON.parse(userResp.getContentText()).forEach(function(u) { userMap[u.id] = u.alias || u.username; });

    var actResp = UrlFetchApp.fetch(BASE_URL + '/api/activities?visible=1', {headers: headers});
    JSON.parse(actResp.getContentText()).forEach(function(a) { activityMap[a.id] = a.name; });

    var projResp = UrlFetchApp.fetch(BASE_URL + '/api/projects?visible=1', {headers: headers});
    JSON.parse(projResp.getContentText()).forEach(function(p) { projectMap[p.id] = p.name; });
  } catch (e) {
    Logger.log("Warning: Could not fetch maps. " + e.message);
  }

  // 2. Fetch Timesheets
  var endpoint = BASE_URL + '/api/timesheets?begin=' + startOfDay + '&user=all';
  
  try {
    var response = UrlFetchApp.fetch(endpoint, { "method": "get", "headers": headers });
    var data = JSON.parse(response.getContentText());
    
    if (!Array.isArray(data) || data.length === 0) return;

    var calendar = CalendarApp.getCalendarById(CAL_ID);
    var existingEvents = calendar.getEventsForDay(new Date());
    
    for (var i = 0; i < data.length; i++) {
      var entry = data[i];
      var userName = userMap[entry.user] || ("User " + entry.user);
      var activityName = activityMap[entry.activity] || ("Activity " + entry.activity);
      var projectName = projectMap[entry.project] || ("Project " + entry.project);
      
      var title = "👤 [" + userName + "] " + activityName;
      var description = 
        "📂 PROJECT: " + projectName + "\n" +
        "📝 NOTE: " + (entry.description || "") + "\n" +
        "🔗 Synced from Kimai";

      var startTime = new Date(entry.begin);
      var endTime = entry.end ? new Date(entry.end) : new Date();

      // Duplicate Check
      var isDuplicate = false;
      for (var j = 0; j < existingEvents.length; j++) {
        var ev = existingEvents[j];
        if (ev.getTitle() === title && Math.abs(ev.getStartTime() - startTime) < 60000) {
            isDuplicate = true;
            if (Math.abs(ev.getEndTime() - endTime) > 60000) {
               ev.setTime(startTime, endTime);
               ev.setDescription(description);
            }
            break;
        }
      }

      if (!isDuplicate) {
        var newEvent = calendar.createEvent(title, startTime, endTime, {description: description});
        newEvent.setColor(CalendarApp.EventColor.BLUE); 
      }
    }
  } catch (e) {
    Logger.log("Critical Error: " + e.toString());
  }
}
