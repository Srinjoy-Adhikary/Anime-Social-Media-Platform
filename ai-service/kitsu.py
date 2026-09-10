import os
import re
import requests


KITSU_API = "https://kitsu.io/api/edge"
DOCUMENTS_DIR = "documents"


def normalize_anime_name(name):
    return re.sub(
        r"[^a-zA-Z0-9_-]",
        "-",
        name.lower()
    ).strip("-")


def find_anime_id(anime_name):
    """
    Find the Kitsu anime ID using the anime title.
    """

    url = f"{KITSU_API}/anime"

    response = requests.get(
        url,
        params={
            "filter[text]": anime_name,
            "page[limit]": 10
        },
        headers={
            "Accept": "application/vnd.api+json"
        },
        timeout=10
    )

    response.raise_for_status()

    data = response.json()

    results = data.get("data", [])

    if not results:
        return None

    # Try to find the closest title match
    normalized_search = normalize_anime_name(anime_name)

    for item in results:

        attributes = item.get("attributes", {})

        titles = attributes.get("titles") or {}

        possible_titles = [
            attributes.get("canonicalTitle"),
            titles.get("en"),
            titles.get("en_jp"),
            titles.get("ja_jp")
        ]

        for title in possible_titles:

            if title and normalize_anime_name(title) == normalized_search:
                return item.get("id")

    # Fall back to Kitsu's first search result
    return results[0].get("id")


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

            attributes = item.get(
                "attributes",
                {}
            )

            episode_number = attributes.get(
                "number"
            )

            if episode_number is None:
                continue

            episodes.append({
                "episode": episode_number,
                "title": attributes.get(
                    "canonicalTitle"
                ) or "",
                "synopsis": attributes.get(
                    "synopsis"
                ) or "",
                "airDate": attributes.get(
                    "airdate"
                )
            })

        if len(items) < limit:
            break

        offset += limit

    return episodes


def create_episode_documents(
    anime_name,
    episodes
):

    safe_name = normalize_anime_name(
        anime_name
    )

    anime_dir = os.path.join(
        DOCUMENTS_DIR,
        safe_name
    )

    os.makedirs(
        anime_dir,
        exist_ok=True
    )

    created = 0

    for episode in episodes:

        episode_number = episode["episode"]

        filename = f"ep{episode_number}.txt"

        filepath = os.path.join(
            anime_dir,
            filename
        )

        # Don't download/create it again
        if os.path.exists(filepath):
            continue

        content = f"""Anime: {anime_name}
Episode: {episode_number}
Title: {episode["title"]}
Air Date: {episode["airDate"] or "Unknown"}

Synopsis:
{episode["synopsis"] or "No synopsis available."}
"""

        with open(
            filepath,
            "w",
            encoding="utf-8"
        ) as file:

            file.write(content)

        created += 1

    print(
        f"Created {created} new episode documents."
    )

    print(
        f"Location: {anime_dir}"
    )

    return anime_dir


def ensure_anime_documents(anime_name):

    safe_name = normalize_anime_name(
        anime_name
    )

    anime_dir = os.path.join(
        DOCUMENTS_DIR,
        safe_name
    )

    # Already downloaded
    if os.path.isdir(anime_dir):

        existing_files = [
            file
            for file in os.listdir(anime_dir)
            if file.endswith(".txt")
        ]

        if existing_files:

            print(
                f"{anime_name} already exists "
                f"({len(existing_files)} episodes)."
            )

            return anime_dir

    print(
        f"Anime not found locally: {anime_name}"
    )

    print(
        f"Searching Kitsu for: {anime_name}"
    )

    kitsu_id = find_anime_id(
        anime_name
    )

    if not kitsu_id:

        print(
            f"Could not find {anime_name} on Kitsu."
        )

        return None

    print(
        f"Kitsu ID: {kitsu_id}"
    )

    print(
        "Fetching episode data..."
    )

    episodes = get_episodes(
        kitsu_id
    )

    if not episodes:

        print(
            f"No episodes found for {anime_name}."
        )

        return None

    print(
        f"Fetched {len(episodes)} episodes."
    )

    return create_episode_documents(
        anime_name,
        episodes
    )


if __name__ == "__main__":

    anime_name = input(
        "Anime name: "
    ).strip()

    ensure_anime_documents(
        anime_name
    )