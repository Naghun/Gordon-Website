export const GA_MEASUREMENT_ID = "G-LV83LXGE38";

function sendEvent(name, parameters = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  window.gtag("event", name, {
    ...parameters,
    send_to: GA_MEASUREMENT_ID,
  });
}

export function trackPageView(path) {
  sendEvent("page_view", {
    page_title: document.title,
    page_location: window.location.href,
    page_path: path,
  });
}

export function trackLead(formName) {
  sendEvent("generate_lead", { form_name: formName });
}

export function trackContactClick(channel, url) {
  sendEvent(`click_${channel}`, { link_url: url });
}
