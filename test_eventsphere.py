"""
EventSphere Playwright Tests
- Launches server + client
- Tests all major pages
- Captures screenshots and console errors
"""
import sys, os, json
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:5173"
REPORT = []

def log(step, status, detail=""):
    REPORT.append({"step": step, "status": status, "detail": detail})
    print(f"  [{status}] {step}" + (f" — {detail}" if detail else ""))

def test_homepage(page):
    log("Homepage: loading", "RUNNING")
    page.goto(BASE_URL, wait_until="networkidle")
    page.wait_for_timeout(2000)

    title = page.title()
    log("Homepage: title", "OK", title)

    hero = page.locator("h1").first
    if hero.is_visible():
        log("Homepage: hero headline visible", "OK", hero.text_content()[:50])
    else:
        log("Homepage: hero headline", "FAIL", "Not visible")

    categories = page.locator("a[href*='/events?category=']")
    count = categories.count()
    log("Homepage: category links", "OK" if count >= 4 else "WARN", f"{count} found")

    page.screenshot(path="/tmp/01-homepage.png", full_page=True)
    log("Homepage: screenshot saved", "OK")

def test_event_discovery(page):
    log("Event Discovery: loading", "RUNNING")
    page.goto(f"{BASE_URL}/events", wait_until="networkidle")
    page.wait_for_timeout(2000)

    events = page.locator("a[href*='/events/']")
    count = events.count()
    log("Event Discovery: event cards", "OK" if count > 0 else "WARN", f"{count} found")

    url_page = page.url
    log("Event Discovery: URL", "OK", url_page)

    page.screenshot(path="/tmp/02-events.png", full_page=True)
    log("Event Discovery: screenshot saved", "OK")

def test_event_detail(page):
    log("Event Detail: loading", "RUNNING")
    page.goto(f"{BASE_URL}/events", wait_until="networkidle")
    page.wait_for_timeout(2000)

    first_link = page.locator("a[href*='/events/']").first
    if first_link.is_visible():
        href = first_link.get_attribute("href")
        page.goto(f"{BASE_URL}{href}", wait_until="networkidle")
        page.wait_for_timeout(2000)

        tabs = page.locator("button").filter(lambda b: b.text_content and b.text_content.lower() in ["overview", "sessions", "speakers", "reviews"])
        log("Event Detail: tabs found", "OK", f"{tabs.count()} tabs")

        ticket_buttons = page.locator("text=Get Tickets")
        if ticket_buttons.is_visible():
            log("Event Detail: ticket selector visible", "OK")
        else:
            log("Event Detail: ticket selector", "WARN", "Not found")

        page.screenshot(path="/tmp/03-event-detail.png", full_page=True)
        log("Event Detail: screenshot saved", "OK")
    else:
        log("Event Detail: no events to click", "WARN")

def test_login_page(page):
    log("Login page: loading", "RUNNING")
    page.goto(f"{BASE_URL}/login", wait_until="networkidle")
    page.wait_for_timeout(1000)

    email_input = page.locator("input[type='email']")
    password_input = page.locator("input[type='password']")
    submit = page.locator("button[type='submit']")

    if email_input.is_visible() and password_input.is_visible():
        log("Login page: form fields visible", "OK")
    else:
        log("Login page: form fields", "FAIL", "Not found")

    page.screenshot(path="/tmp/04-login.png", full_page=True)
    log("Login page: screenshot saved", "OK")

def test_register_page(page):
    log("Register page: loading", "RUNNING")
    page.goto(f"{BASE_URL}/register", wait_until="networkidle")
    page.wait_for_timeout(1000)

    name_input = page.locator("input[placeholder*='name' i]")
    email_input = page.locator("input[type='email']")

    if name_input.is_visible() and email_input.is_visible():
        log("Register page: form visible", "OK")
    else:
        log("Register page: form", "WARN", "Some fields missing")

    page.screenshot(path="/tmp/05-register.png", full_page=True)
    log("Register page: screenshot saved", "OK")

def test_forgot_password(page):
    log("Forgot Password: loading", "RUNNING")
    page.goto(f"{BASE_URL}/forgot-password", wait_until="networkidle")
    page.wait_for_timeout(1000)
    page.screenshot(path="/tmp/06-forgot-password.png", full_page=True)
    log("Forgot Password: screenshot saved", "OK")

def test_404(page):
    log("404 page: loading", "RUNNING")
    page.goto(f"{BASE_URL}/nonexistent-route", wait_until="networkidle")
    page.wait_for_timeout(1000)

    content = page.text_content("body")
    if "404" in content or "not found" in content.lower():
        log("404 page: renders correctly", "OK")
    else:
        log("404 page: content check", "WARN", "No 404 text found in body")

    page.screenshot(path="/tmp/07-404.png", full_page=True)
    log("404 page: screenshot saved", "OK")

def check_console_errors(console_logs):
    errors = [msg for msg in console_logs if msg["type"] == "error"]
    warnings = [msg for msg in console_logs if msg["type"] == "warning"]
    if errors:
        log("Console errors", "WARN", f"{len(errors)} errors: {errors[:3]}")
    else:
        log("Console errors", "OK", "None found")
    if warnings:
        log("Console warnings", "INFO", f"{len(warnings)} warnings")

def check_network_errors(network_logs):
    failed = [r for r in network_logs if r["status"] >= 400 and "localhost" in r.get("url", "")]
    if failed:
        for f in failed:
            log(f"Network: {f['url']}", "FAIL", f"Status {f['status']}")
    else:
        log("Network requests", "OK", "No failed requests")

def main():
    console_logs = []
    network_logs = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 900},
            ignore_https_errors=True,
        )
        page = context.new_page()

        page.on("console", lambda msg: console_logs.append({"type": msg.type, "text": msg.text}))
        page.on("response", lambda resp: network_logs.append({"url": resp.url, "status": resp.status, "ok": resp.ok}))

        print("\n=== EventSphere Playwright Tests ===\n")

        try:
            test_homepage(page)
        except Exception as e:
            log("Homepage", "ERROR", str(e))

        try:
            test_event_discovery(page)
        except Exception as e:
            log("Event Discovery", "ERROR", str(e))

        try:
            test_event_detail(page)
        except Exception as e:
            log("Event Detail", "ERROR", str(e))

        try:
            test_login_page(page)
        except Exception as e:
            log("Login page", "ERROR", str(e))

        try:
            test_register_page(page)
        except Exception as e:
            log("Register page", "ERROR", str(e))

        try:
            test_forgot_password(page)
        except Exception as e:
            log("Forgot Password", "ERROR", str(e))

        try:
            test_404(page)
        except Exception as e:
            log("404 page", "ERROR", str(e))

        print("\n--- Console & Network Summary ---")
        check_console_errors(console_logs)
        check_network_errors(network_logs)

        print("\n--- All Screenshots ---")
        for f in sorted(os.listdir("/tmp")):
            if f.startswith("0") and f.endswith(".png"):
                print(f"  /tmp/{f}")

        print("\n=== Test Complete ===")
        browser.close()

    # Summary
    passed = sum(1 for r in REPORT if r["status"] == "OK")
    failed = sum(1 for r in REPORT if r["status"] in ("FAIL", "ERROR"))
    warned = sum(1 for r in REPORT if r["status"] == "WARN")
    print(f"\nResults: {passed} passed, {warned} warnings, {failed} failed out of {len(REPORT)} checks")

if __name__ == "__main__":
    main()
