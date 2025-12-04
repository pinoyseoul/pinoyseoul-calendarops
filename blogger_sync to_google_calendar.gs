// ==========================================
// BLOGGER SYNC (Website Posts)
// ==========================================

function syncBloggerToCalendar() {
  var props = PropertiesService.getScriptProperties();
  var BLOG_ID = props.getProperty('BLOGGER_ID');
  var CAL_ID = props.getProperty('BLOGGER_CAL_ID');
  var DAYS_WINDOW = 30;

  var today = new Date();
  var future = new Date();
  future.setDate(today.getDate() + DAYS_WINDOW);
  var past = new Date();
  past.setDate(today.getDate() - 2);

  try {
    var url = "https://www.googleapis.com/blogger/v3/blogs/" + BLOG_ID + "/posts" +
              "?view=ADMIN" +
              "&status=LIVE&status=SCHEDULED" + 
              "&fetchBodies=false";
    
    var token = ScriptApp.getOAuthToken();
    var params = {
      method: "get",
      headers: { "Authorization": "Bearer " + token },
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch(url, params);
    var json = JSON.parse(response.getContentText());
    var posts = json.items || [];

    if (posts.length === 0) return;

    var calendar = CalendarApp.getCalendarById(CAL_ID);
    var existingEvents = calendar.getEvents(past, future);

    for (var i = 0; i < posts.length; i++) {
      var post = posts[i];
      var pubDate = new Date(post.published);
      if (pubDate < past || pubDate > future) continue;

      var status = (post.status || "UNKNOWN").toUpperCase();
      var author = post.author ? post.author.displayName : "Editor";
      var labels = post.labels ? post.labels.join(", ") : "Uncategorized";
      var icon = status === 'LIVE' ? "📰" : "🕰️";
      var title = icon + " [Blog] " + post.title;

      var description = 
        "📰 PLATFORM: Blogger\n" +
        "👤 AUTHOR: " + author + "\n" +
        "🏷️ TAGS: " + labels + "\n" +
        "📊 STATUS: " + status + "\n\n" +
        "🔗 LINK: " + post.url;

      var startTime = pubDate;
      var endTime = new Date(startTime.getTime() + (15 * 60 * 1000));

      var isDuplicate = false;
      for (var j = 0; j < existingEvents.length; j++) {
        var ev = existingEvents[j];
        if (ev.getTitle() === title && Math.abs(ev.getStartTime() - startTime) < 60000) {
            isDuplicate = true;
            if (ev.getDescription() !== description) {
               ev.setDescription(description);
            }
            break;
        }
      }

      if (!isDuplicate) {
        var newEvent = calendar.createEvent(title, startTime, endTime, {description: description});
        newEvent.setColor("10"); // Green
      }
    }
  } catch (e) {
    Logger.log("Error syncing Blogger: " + e.toString());
  }
}
