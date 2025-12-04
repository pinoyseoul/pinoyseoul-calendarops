// ==========================================
// POSTIZ SYNC (Social Schedule)
// ==========================================

function syncPostizToCalendar() {
  var props = PropertiesService.getScriptProperties();
  var API_KEY = props.getProperty('POSTIZ_API_KEY');
  var BASE_URL = props.getProperty('POSTIZ_BASE_URL');
  var CAL_ID = props.getProperty('POSTIZ_CAL_ID');
  var DAYS_TO_FETCH = 30;

  var today = new Date();
  var future = new Date();
  future.setDate(today.getDate() + DAYS_TO_FETCH);

  var startStr = today.toISOString();
  var endStr = future.toISOString();

  var endpoint = BASE_URL + '/api/public/v1/posts?startDate=' + startStr + '&endDate=' + endStr;
  
  var headers = {
    "Authorization": API_KEY,
    "Content-Type": "application/json"
  };

  try {
    var response = UrlFetchApp.fetch(endpoint, { "method": "get", "headers": headers });
    var json = JSON.parse(response.getContentText());
    var posts = json.posts || [];

    if (posts.length === 0) return;

    var calendar = CalendarApp.getCalendarById(CAL_ID);
    var existingEvents = calendar.getEvents(today, future);

    for (var i = 0; i < posts.length; i++) {
      var post = posts[i];
      
      // Clean HTML
      var rawContent = post.content || "Image Post";
      var cleanContent = rawContent.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim();
      
      // Get Account Info
      var accountName = "General";
      var platform = "Social";
      var icon = "📱";
      
      if (post.integration) {
        accountName = post.integration.name || "Unknown Account";
        var provider = (post.integration.providerIdentifier || "").toLowerCase();
        
        if (provider.includes('twitter') || provider.includes('x')) { icon = "🐦"; platform = "X/Twitter"; }
        else if (provider.includes('facebook')) { icon = "📘"; platform = "Facebook"; }
        else if (provider.includes('instagram')) { icon = "📸"; platform = "Instagram"; }
        else if (provider.includes('linkedin')) { icon = "💼"; platform = "LinkedIn"; }
        else if (provider.includes('youtube')) { icon = "▶️"; platform = "YouTube"; }
        else if (provider.includes('tiktok')) { icon = "🎵"; platform = "TikTok"; }
      }

      var shortContent = cleanContent.length > 40 ? cleanContent.substring(0, 40) + "..." : cleanContent;
      var title = icon + " " + shortContent;

      var state = (post.state || "SCHEDULED").toUpperCase();
      var description = 
        "📱 PLATFORM: " + platform + "\n" +
        "📢 ACCOUNT: " + accountName + "\n" +
        "📊 STATUS: " + state + "\n" +
        "📝 CONTENT:\n" + cleanContent + "\n\n" +
        "⚙️ EDIT: " + BASE_URL;

      var startTime = new Date(post.publishDate);
      var endTime = new Date(startTime.getTime() + (30 * 60 * 1000)); 

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
        newEvent.setColor("6"); // Orange
      }
    }
  } catch (e) {
    Logger.log("Error syncing Postiz: " + e.toString());
  }
}
