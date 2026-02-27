from tavily import TavilyClient
from screenmind.config import TAVILY_API_KEY

_client = TavilyClient(api_key=TAVILY_API_KEY)


def search_web(query: str, max_results: int = 5) -> list[dict]:
    """Search the web using Tavily and return structured results."""
    try:
        response = _client.search(
            query=query,
            search_depth="basic",
            max_results=max_results,
            include_answer=True,
        )
    except Exception as exc:
        return [{"title": "Search unavailable", "content": str(exc), "url": ""}]

    results = []

    if response.get("answer"):
        results.append(
            {"title": "AI Summary", "content": response["answer"], "url": ""}
        )

    for item in response.get("results", []):
        results.append(
            {
                "title": item.get("title", ""),
                "content": item.get("content", ""),
                "url": item.get("url", ""),
            }
        )

    return results
