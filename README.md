# Google App Scripts-Powered Media Stack (CalendarOps Framework)

**A Serverless CalOps (Calendar Operations) Framework for Media Startups.**

Google Apps Scripts that automates Azuracast, Postiz, Blogger and Kimai to fetch schedules and activities to Google Calendar Aggregates operational data from self-hosted open-source tools into a "Single Pane of Glass" using Google Calendar. It allows teams to visualize Workforce, Broadcast, Social, and Editorial schedules in one unified view without paying for expensive enterprise middleware.

## The Architecture: "Single Pane of Glass"

This framework creates four distinct operational layers in Google Calendar:

| Color | Layer Name | Source System | Function |
| :--- | :--- | :--- | :--- |
| 🔵 **Blue** | **Team Logs** | [Kimai](https://www.kimai.org/) | Visualizes who is working and on what project (Time Tracking). |
| 🟣 **Purple** | **Radio Schedule** | [AzuraCast](https://www.azuracast.com/) | Displays the current on-air schedule and DJs. |
| 🟠 **Orange** | **Social Schedule** | [Postiz](https://postiz.com/) | Shows scheduled social media posts across all platforms. |
| 🟢 **Green** | **Website Posts** | [Blogger](https://blogger.com/) | Tracks article publication schedules (Scheduled & Live). |

## Prerequisites

* A Google Workspace or Gmail account.
* Self-hosted instances of Kimai, AzuraCast, and Postiz (or cloud versions).
* 4 separate Google Calendars created (one for each layer).

## Installation

### 1. Create the Google Apps Script Project
1.  Go to [script.google.com](https://script.google.com).
2.  Click **New Project**.
3.  Name it `Media-CalOps-Stack`.

### 2. Configure Script Properties (Secrets)
To keep your API keys safe, do not hardcode them. Go to **Project Settings (Gear Icon)** > **Script Properties** and add the following:

| Property | Value |
| :--- | :--- |
| `KIMAI_API_TOKEN` | Your Kimai Bearer Token (Long string) |
| `KIMAI_BASE_URL` | e.g., `https://time.yourdomain.com` |
| `KIMAI_CAL_ID` | Google Calendar ID for the Blue Layer |
| `AZURA_API_KEY` | Your AzuraCast API Key |
| `AZURA_BASE_URL` | e.g., `https://radio.yourdomain.com` |
| `AZURA_STATION_ID` | Station ID (usually `1`) |
| `AZURA_CAL_ID` | Google Calendar ID for the Purple Layer |
| `POSTIZ_API_KEY` | Your Postiz Public API Key |
| `POSTIZ_BASE_URL` | e.g., `https://social.yourdomain.com` |
| `POSTIZ_CAL_ID` | Google Calendar ID for the Orange Layer |
| `BLOGGER_ID` | Your Blogger Blog ID |
| `BLOGGER_CAL_ID` | Google Calendar ID for the Green Layer |

### 3. Deploy the Code
1.  Copy the contents of the `.gs` files in this repo into your Apps Script project (create new script files for each).
2.  Update the `appsscript.json` manifest file (Enable "Show manifest" in settings first) to unlock permissions.

### 4. Set Triggers
1.  Go to the **Triggers (Clock Icon)** tab.
2.  Create a new trigger for each sync function:
    * `syncKimaiToCalendar` -> Time-driven -> Every Hour
    * `syncAzuraCastToCalendar` -> Time-driven -> Every Hour
    * `syncPostizToCalendar` -> Time-driven -> Every Hour
    * `syncBloggerToCalendar` -> Time-driven -> Every Hour

## Contributing
This project is a proof-of-concept for **Serverless CalOps**. Feel free to fork and add integrations for other tools (Trello, Jira, etc.).

## License
MIT
