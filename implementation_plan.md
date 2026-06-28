# PeoplePost Production Readiness Plan

To make the PeoplePost platform fully "production-ready," we need to replace development mock-ups with real features, improve error handling, and ensure the government officials can actually manage the lifecycle of a report.

## Open Questions
> [!IMPORTANT]
> **User Feedback Needed:**
> 1. Do you want to deploy the Python ML API to the cloud (e.g., Render/Heroku) or just ensure it works reliably locally for now?
> 2. Are there any other specific functional changes you had in mind that aren't listed below?

## Proposed Changes

### 1. Real Geolocation Integration
The "Capture My Current GPS Location" button in the report form currently returns a hardcoded fake location for testing.
- **Change:** Implement the HTML5 `navigator.geolocation.getCurrentPosition()` API to pull the citizen's exact real-world latitude and longitude.

### 2. Official Dashboard: Status Updates
Currently, Government Officials can view issues on the map, but there isn't a clear way to update the status (e.g., changing an issue from `NEW` to `RESOLVED`).
- **Change:** Add a "Status Update" dropdown/button to the official's `ReportList` or issue detail view.
- **Change:** Create a server action in `actions.js` to update the `status` column in the Supabase `reports` table.

### 3. UI Error Handling (Login/Signup)
When an error occurs (like the "Invalid credentials" we saw earlier), it only prints in the server terminal, leaving the user confused.
- **Change:** Update `actions.js` to return error messages, and update `login/page.js` and `signup/page.js` to display these errors in a red banner.

### 4. Remove Mock Data
The `GovernmentBoard.js` file still contains a `MOCK_ISSUES` array which can be confusing when mixed with real database entries.
- **Change:** Strip out all mock data so the dashboard reflects 100% real, live database inputs.

### 5. Environment Variables & ML API
- **Change:** Move the hardcoded `http://localhost:5000/predict` URL to an environment variable (`NEXT_PUBLIC_ML_API_URL`) so it can be easily swapped to a production server when deployed.

---

## Verification Plan
1. **Reporting:** We will create a new report using real GPS data and confirm it appears in the Supabase database with the correct coordinates.
2. **Official Actions:** We will log in as the `admin` user, view the new report, and update its status to `RESOLVED`.
3. **Error Checking:** We will intentionally enter a wrong password to verify the UI displays a proper error message.
