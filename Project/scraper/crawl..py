from collections import deque
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import time
import json

START_URLS = [
    "https://ottverse.com/",
    "https://ottverse.com/video-encoding/",
    "https://ottverse.com/video-streaming/",
    "https://ottverse.com/drm/"
]

visited = set()
queue = deque(START_URLS)
articles = []

MAX_PAGES = 100


def is_valid_url(url):
    if not url.startswith("https://ottverse.com"):
        return False

    # Skip junk pages
    if any(x in url for x in [
        "#", "tag", "author", "feed", "wp",
        "page", "category"
    ]):
        return False

    return True

def extract_article(url):
    try:
        res = requests.get(url, timeout=5)
        soup = BeautifulSoup(res.text, "html.parser")

        # Title
        title_tag = soup.find("h1")
        title = title_tag.get_text(strip=True) if title_tag else ""

        # Content container
        content_div = (
            soup.find("article") or
            soup.find("div", class_="entry-content")
        )

        if not content_div:
            return None

        paragraphs = []
        headings = []

        for tag in content_div.find_all(["p", "h2", "h3"]):
            text = tag.get_text(" ", strip=True)

            # Clean spacing issue
            text = " ".join(text.split())

            # Skip author/footer garbage
            if any(x in text.lower() for x in [
                "editor", "managing director",
                "subscribe", "newsletter"
            ]):
                continue

            if tag.name == "p":
                if len(text) > 40:  # remove tiny junk lines
                    paragraphs.append(text)

            elif tag.name in ["h2", "h3"]:
                headings.append(text)

        if len(paragraphs) < 3:
            return None

        return {
            "url": url,
            "title": title,
            "headings": headings,
            "content": paragraphs   # 🔥 LIST instead of one blob
        }

    except Exception as e:
        print(f"Error: {url} -> {e}")
        return None

while queue and len(visited) < MAX_PAGES:
    url = queue.popleft()

    if url in visited:
        continue

    print(f"Crawling: {url}")
    visited.add(url)

    try:
        res = requests.get(url, timeout=5)
        soup = BeautifulSoup(res.text, "html.parser")

        # 🔥 Extract article if possible
        data = extract_article(url)
        if data:
            articles.append(data)

        # 🔥 Extract more links
        for a in soup.find_all("a", href=True):
            next_url = urljoin(url, a["href"])

            if is_valid_url(next_url) and next_url not in visited:
                queue.append(next_url)

    except Exception as e:
        print(f"Error: {url} -> {e}")

    time.sleep(1)


# Save JSON
with open("ottverse_final.json", "w", encoding="utf-8") as f:
    json.dump(articles, f, indent=2, ensure_ascii=False)

print(f"\nSaved {len(articles)} clean articles")