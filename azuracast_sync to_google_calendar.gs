// ==========================================
// AZURACAST SYNC (Radio Schedule)
// ==========================================

function syncAzuraCastToCalendar() {
  var props = PropertiesService.getScriptProperties();
  var API_KEY = props.getProperty('AZURA_API_KEY');
  var BASE_URL = props.getProperty('AZURA_BASE_URL');
  var STATION_ID = props.getProperty('AZURA_STATION_ID');
  var CAL_ID = props.getProperty('AZURA_CAL_ID');

  var today = new Date();
  var startStr = new Date(today.setHours(0,0,0,0)).toISOString();
  var endStr   = new Date(today.setHours(23,59,59,999)).toISOString();

  var endpoint = BASE_URL + '/api/station/' + STATION_ID + '/schedule?start=' + startStr + '&end=' + endStr;
  
  var headers = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json"
  };

  try {
    var response = UrlFetchApp.fetch(endpoint, { "method": "get", "headers": headers });
    var rawData = JSON.parse(response.getContentText());
    
    var data = [];
    if (Array.isArray(rawData)) data = rawData;
    else if (rawData.rows) data = rawData.rows;

    if (data.length === 0) return;

    var calendar = CalendarApp.getCalendarById(CAL_ID);
    var existingEvents = calendar.getEventsForDay(new Date());

    for (var i = 0; i < data.length; i++) {
      var item = data[i];
      var title = "";
      var isLive = false;

      if (item.streamer_name || (item.streamer && item.streamer.display_name)) {
        var djName = item.streamer_name || item.streamer.display_name;
        title = "🎙️ LIVE: " + djName;
        isLive = true;
      } else {
        title = "🎵 " + (item.name || "AutoDJ Playlist");
      }

      var description = 
        "📻 STATION: Pinoy Seoul Radio\n" +
        (isLive ? "🎤 DJ: " + (item.streamer_name || "Live DJ") + "\n" : "") +
        "🎼 CONTENT: " + (item.name || "General Rotation") + "\n" +
        "🔗 LISTEN LIVE: " + BASE_URL + "/public/live?autoplay=true";

      var startTime = new Date(item.start);
      var endTime = new Date(item.end);

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
        newEvent.setColor("3"); // Grape (Purple)
      }
    }
  } catch (e) {
    Logger.log("Error syncing AzuraCast: " + e.toString());
  }
}
