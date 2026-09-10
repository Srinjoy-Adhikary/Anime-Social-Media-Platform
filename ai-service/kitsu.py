import os
import re
import requests


KITSU_API = "https://kitsu.io/api/edge"
DOCUMENTS_DIR = "documents"


def get_episodes(kitsu_anime_id):
    url = f"{KITSU_API}/anime/{kitsu_anime_id}/episodes"

    episodes = []
    offset = 0
    limit = 20

    while True:
        params = {
            "page[limit]": limit,
            "page[offset]": offset
        }

        response = requests.get(
            url,
            params=params,
            headers={
                "Accept": "application/vnd.api+json"
            },
            timeout=10
        )

        response.raise_for_status()

        data = response.json()
        items = data.get("data", [])

        if not items:
            break

        for item in items:
            attributes = item.get("attributes", {})

            episode_number = attributes.get("number")

            # Ignore episodes without an episode number
            if episode_number is None:
                continue

            episodes.append({
                "episode": episode_number,
                "title": attributes.get("canonicalTitle") or "",
                "synopsis": attributes.get("synopsis") or "",
                "airDate": attributes.get("airdate")
            })

        # If fewer than the requested limit came back,
        # we've reached the end.
        if len(items) < limit:
            break

        offset += limit

    return episodes


def create_episode_documents(anime_name, episodes):
    # Make the anime name safe for a folder name
    safe_name = re.sub(r"[^a-zA-Z0-9_-]", "-", anime_name.lower())

    anime_dir = os.path.join(DOCUMENTS_DIR, safe_name)

    os.makedirs(anime_dir, exist_ok=True)

    for episode in episodes:
        episode_number = episode["episode"]

        filename = f"ep{episode_number}.txt"
        filepath = os.path.join(anime_dir, filename)

        content = f"""Anime: {anime_name}
Episode: {episode_number}
Title: {episode["title"]}
Air Date: {episode["airDate"] or "Unknown"}

Synopsis:
{episode["synopsis"] or "No synopsis available."}
"""

        with open(filepath, "w", encoding="utf-8") as file:
            file.write(content)

    print(f"Created {len(episodes)} episode documents.")
    print(f"Location: {anime_dir}")


if __name__ == "__main__":

    # Test with Cowboy Bebop
    kitsu_id = "1"
    anime_name = "Cowboy Bebop"

    print("Fetching episodes from Kitsu...")

    episodes = get_episodes(kitsu_id)

    print(f"Fetched {len(episodes)} episodes.")

    create_episode_documents(
        anime_name,
        episodes
    )