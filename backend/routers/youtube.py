from fastapi import APIRouter, Query
from youtube_search import YoutubeSearch
import logging
import json

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("")
async def search_youtube(q: str = Query(..., min_length=1)):
    """Search YouTube for a travel video based on the destination/query."""
    try:
        query = f"{q} cinematic travel vlog 4k"
        # results is a json string if to_json() is used, or a list of dicts if to_dict() is used
        results = YoutubeSearch(query, max_results=1).to_dict()
        
        if results and len(results) > 0:
            video = results[0]
            # youtube_search returns suffix urls like '/watch?v=abcd'
            url_suffix = video.get('url_suffix')
            if url_suffix:
                return {"youtubeUrl": f"https://www.youtube.com{url_suffix}"}
                
        return {"youtubeUrl": None}
    except Exception as e:
        logger.error(f"YouTube search failed for {q}: {e}")
        return {"youtubeUrl": None}
