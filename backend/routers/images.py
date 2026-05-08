from fastapi import APIRouter, Query
from services.image_search import get_destination_image

router = APIRouter()


@router.get("")
async def images(destination: str = Query(..., description="Destination name")):
    """Return the best available travel image URL for a destination."""
    url = await get_destination_image(destination)
    return {"url": url, "destination": destination}
