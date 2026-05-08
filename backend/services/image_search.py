import os
import random
import requests
from ddgs import DDGS

SERPAPI_KEY = os.getenv("SERPAPI_KEY", "")

# ── Hardcoded fallback images (beautiful travel shots, no API needed) ──────────
FALLBACK_IMAGES = [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/24701-nature-natural-beauty.jpg/1280px-24701-nature-natural-beauty.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sunflower_from_Silesia2.jpg/1280px-Sunflower_from_Silesia2.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Golden_Gate_Bridge_from_the_Marin_Headlands_in_March_2019.jpg/1280px-Golden_Gate_Bridge_from_the_Marin_Headlands_in_March_2019.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Empire_State_Building_%28aerial_view%29.jpg/800px-Empire_State_Building_%28aerial_view%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/The_Eiffel_Tower_from_the_Trocad%C3%A9ro.jpg/800px-The_Eiffel_Tower_from_the_Trocad%C3%A9ro.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/1280px-Above_Gotham.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Aerial_view_of_the_Statue_of_Liberty.jpg/1024px-Aerial_view_of_the_Statue_of_Liberty.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Goa_beach.jpg/1280px-Goa_beach.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Manali_Town.jpg/1280px-Manali_Town.jpg",
]


def search_serpapi_images(query: str) -> str | None:
    """SerpAPI Google Images search — primary source."""
    if not SERPAPI_KEY:
        print("SerpAPI: no key set, skipping")
        return None
    try:
        r = requests.get(
            "https://serpapi.com/search.json",
            params={
                "engine": "google_images",
                "q": query,
                "api_key": SERPAPI_KEY,
                "num": 5,
                "safe": "active",
            },
            timeout=10,
        )
        r.raise_for_status()
        data = r.json()
        results = data.get("images_results", [])
        # Pick a high-res image, skip tiny thumbnails
        for img in results:
            url = img.get("original", "")
            if url and img.get("original_width", 0) >= 800:
                return url
        if results:
            return results[0].get("original")
    except Exception as e:
        print(f"SerpAPI Images failed: {e}")
    return None


def search_ddg_images(query: str) -> str | None:
    """DuckDuckGo image search via ddgs package."""
    try:
        with DDGS() as d:
            results = list(d.images(query, max_results=5))
        for r in results:
            url = r.get("image", "")
            if url and r.get("width", 0) >= 800:
                return url
        if results:
            return results[0].get("image")
    except Exception as e:
        print(f"DDG Images failed: {e}")
    return None


def search_wikimedia_images(destination: str) -> str | None:
    """
    Wikimedia Commons image search — no API key needed.
    Uses the MediaWiki generator API to find relevant images.
    """
    # Use first part of destination for best matches (e.g. "Mukteshwar" from "Mukteshwar, Uttarakhand")
    query = destination.split(",")[0].strip()
    try:
        r = requests.get(
            "https://commons.wikimedia.org/w/api.php",
            params={
                "action": "query",
                "generator": "search",
                "gsrsearch": destination,
                "gsrnamespace": 6,      # File namespace
                "gsrlimit": 10,
                "prop": "imageinfo",
                "iiprop": "url|size|mime",
                "iiurlwidth": 1200,
                "format": "json",
                "origin": "*",
            },
            timeout=10,
        )
        r.raise_for_status()
        data = r.json()
        pages = data.get("query", {}).get("pages", {})

        candidates = []
        for page in pages.values():
            info_list = page.get("imageinfo", [])
            if not info_list:
                continue
            info = info_list[0]
            mime = info.get("mime", "")
            # Only use actual photos, skip SVGs, PDFs, maps
            if not mime.startswith("image/jpeg") and not mime.startswith("image/png"):
                continue
            w = info.get("thumbwidth") or info.get("width", 0)
            h = info.get("thumbheight") or info.get("height", 0)
            # Skip very small images
            if w < 600 or h < 400:
                continue
            url = info.get("thumburl") or info.get("url", "")
            if url:
                candidates.append((w * h, url))

        if candidates:
            # Return the largest image found
            candidates.sort(reverse=True)
            return candidates[0][1]

    except Exception as e:
        print(f"Wikimedia Commons failed: {e}")
    return None


async def get_destination_image(destination: str) -> str:
    """
    Return best image URL for a destination.
    Fallback chain: SerpAPI → Wikimedia Commons → Hardcoded
    """
    query = f"{destination} travel landscape"

    # 1. SerpAPI Google Images
    url = search_serpapi_images(query)
    if url:
        print(f"Image source: SerpAPI — {url[:60]}")
        return url

    # 2. DuckDuckGo (ddgs)
    url = search_ddg_images(query)
    if url:
        print(f"Image source: DDG — {url[:60]}")
        return url

    # 3. Wikimedia Commons (free, no key)
    url = search_wikimedia_images(destination)
    if url:
        print(f"Image source: Wikimedia — {url[:60]}")
        return url

    # 4. Hardcoded beautiful travel fallback
    chosen = random.choice(FALLBACK_IMAGES)
    print(f"Image source: Hardcoded fallback — {chosen[:60]}")
    return chosen
