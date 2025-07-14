  const CLIENTLOG_API_URL = "https://api.dev.clientlog.bayis.co.uk/v1/event";
  const CLIENTLOG_PROJECT = "bayis/home";

  async function logPageView() {
    try {
      const data = {
        project: CLIENTLOG_PROJECT,
        action: "page_view",
        session: "new",
        payload: JSON.stringify({
          url: window.location.href,
          referrer: document.referrer
        })
      };

      await fetch(CLIENTLOG_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error("[clientlog] Failed to log page view:", error);
    }
  }

  document.addEventListener("DOMContentLoaded", logPageView);
