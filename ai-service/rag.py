import json
import os
import re
import time

import faiss
import numpy as np

from dotenv import load_dotenv
from google import genai
from google.genai import types
from google.genai.errors import ClientError

from kitsu import ensure_anime_documents


load_dotenv()


VECTORSTORE_DIR = "vectorstore"

EMBEDDING_MODEL = "gemini-embedding-001"
EMBEDDING_DIMENSION = 768


# ============================================================
# ANIME NAME NORMALIZATION
# ============================================================

def normalize_anime_name(name):
    return re.sub(
        r"[^a-zA-Z0-9_-]",
        "-",
        name.lower()
    ).strip("-")


# ============================================================
# VECTOR NORMALIZATION
# ============================================================

def normalize_vector(vector):

    vector = np.array(
        vector,
        dtype=np.float32
    )

    norm = np.linalg.norm(vector)

    if norm == 0:
        return vector

    return vector / norm


# ============================================================
# LOAD FAISS VECTORSTORE
# ============================================================

def load_vectorstore():

    index = faiss.read_index(
        os.path.join(
            VECTORSTORE_DIR,
            "anime.index"
        )
    )

    with open(
        os.path.join(
            VECTORSTORE_DIR,
            "documents.json"
        ),
        "r",
        encoding="utf-8"
    ) as file:

        documents = json.load(file)

    return index, documents


# ============================================================
# SAVE FAISS VECTORSTORE
# ============================================================

def save_vectorstore(index, documents):

    os.makedirs(
        VECTORSTORE_DIR,
        exist_ok=True
    )

    faiss.write_index(
        index,
        os.path.join(
            VECTORSTORE_DIR,
            "anime.index"
        )
    )

    with open(
        os.path.join(
            VECTORSTORE_DIR,
            "documents.json"
        ),
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            documents,
            file,
            ensure_ascii=False,
            indent=2
        )


# ============================================================
# GEMINI EMBEDDING
# ============================================================

def get_embedding(
    client,
    text,
    task_type
):

    while True:

        try:

            response = client.models.embed_content(
                model=EMBEDDING_MODEL,
                contents=text,
                config=types.EmbedContentConfig(
                    task_type=task_type,
                    output_dimensionality=EMBEDDING_DIMENSION
                )
            )

            return normalize_vector(
                response.embeddings[0].values
            )

        except ClientError as error:

            # Gemini free-tier rate limit
            if error.code == 429:

                message = str(error)

                print()
                print(
                    "Gemini embedding rate limit reached."
                )

                # Try to read Google's suggested
                # retry duration
                match = re.search(
                    r"retry in ([0-9.]+)s",
                    message,
                    re.IGNORECASE
                )

                if match:

                    wait_time = (
                        float(match.group(1)) + 2
                    )

                else:

                    wait_time = 45

                print(
                    f"Waiting {wait_time:.0f} seconds..."
                )

                time.sleep(
                    wait_time
                )

                print(
                    "Retrying embedding..."
                )

            else:

                raise


# ============================================================
# GET EPISODES ALREADY INDEXED FOR ANIME
# ============================================================

def get_indexed_episodes(
    documents,
    anime
):

    requested_anime = normalize_anime_name(
        anime
    )

    indexed = set()

    for document in documents:

        document_anime = normalize_anime_name(
            document.get("anime", "")
        )

        if document_anime == requested_anime:

            indexed.add(
                int(
                    document.get(
                        "episode",
                        0
                    )
                )
            )

    return indexed


# ============================================================
# INDEX ONLY NEW WATCHED EPISODES
# ============================================================

def index_new_anime(
    anime,
    current_episode
):

    print()
    print(
        f"Preparing {anime} "
        f"up to episode {current_episode}..."
    )

    # --------------------------------------------------------
    # Automatically download episode documents from Kitsu
    # --------------------------------------------------------

    anime_dir = ensure_anime_documents(
        anime
    )

    if not anime_dir:

        return False

    # --------------------------------------------------------
    # Load existing FAISS index
    # --------------------------------------------------------

    index, documents = load_vectorstore()

    # --------------------------------------------------------
    # Find episodes already embedded
    # --------------------------------------------------------

    indexed_episodes = get_indexed_episodes(
        documents,
        anime
    )

    print(
        f"Already indexed episodes: "
        f"{len(indexed_episodes)}"
    )

    # --------------------------------------------------------
    # Gemini client
    # --------------------------------------------------------

    client = genai.Client()

    episode_files = []

    # --------------------------------------------------------
    # Find episodes that:
    #
    # 1. Exist on disk
    # 2. User has watched
    # 3. Are not already embedded
    # --------------------------------------------------------

    for filename in os.listdir(
        anime_dir
    ):

        if not filename.endswith(".txt"):
            continue

        match = re.search(
            r"ep(\d+)",
            filename.lower()
        )

        if not match:
            continue

        episode_number = int(
            match.group(1)
        )

        # Don't index future episodes
        if episode_number > current_episode:
            continue

        # Don't embed an episode twice
        if episode_number in indexed_episodes:
            continue

        episode_files.append(
            (
                episode_number,
                filename
            )
        )

    # Sort episodes numerically
    episode_files.sort(
        key=lambda x: x[0]
    )

    # --------------------------------------------------------
    # Nothing new to index
    # --------------------------------------------------------

    if not episode_files:

        print(
            f"All watched episodes of {anime} "
            f"are already indexed."
        )

        return True

    print(
        f"New episodes to embed: "
        f"{len(episode_files)}"
    )

    # --------------------------------------------------------
    # Embed episodes one by one
    # --------------------------------------------------------

    for position, (
        episode_number,
        filename
    ) in enumerate(
        episode_files,
        start=1
    ):

        filepath = os.path.join(
            anime_dir,
            filename
        )

        with open(
            filepath,
            "r",
            encoding="utf-8"
        ) as file:

            content = file.read()

        print(
            f"Embedding episode "
            f"{episode_number} "
            f"({position}/{len(episode_files)})..."
        )

        # ----------------------------------------------------
        # Generate Gemini document embedding
        # ----------------------------------------------------

        vector = get_embedding(
            client,
            content,
            "RETRIEVAL_DOCUMENT"
        )

        # ----------------------------------------------------
        # Create metadata
        # ----------------------------------------------------

        document = {
            "content": content,
            "anime": normalize_anime_name(
                anime
            ),
            "episode": episode_number
        }

        # ----------------------------------------------------
        # Add vector to FAISS
        # ----------------------------------------------------

        index.add(
            np.array(
                [vector],
                dtype=np.float32
            )
        )

        # ----------------------------------------------------
        # Add metadata
        # ----------------------------------------------------

        documents.append(
            document
        )

        # ----------------------------------------------------
        # SAVE IMMEDIATELY
        #
        # If the process stops or Render restarts,
        # already embedded episodes are preserved.
        # ----------------------------------------------------

        save_vectorstore(
            index,
            documents
        )

        print(
            f"Episode {episode_number} saved."
        )

    print()
    print(
        f"{anime} successfully indexed "
        f"up to episode {current_episode}."
    )

    return True


# ============================================================
# QUERY EMBEDDING
# ============================================================

def get_query_embedding(
    client,
    question
):

    return get_embedding(
        client,
        question,
        "RETRIEVAL_QUERY"
    )


# ============================================================
# MAIN RAG FUNCTION
# ============================================================

def ask_rag(
    question,
    current_episode,
    anime
):

    # --------------------------------------------------------
    # Load current vectorstore
    # --------------------------------------------------------

    index, documents = load_vectorstore()

    # --------------------------------------------------------
    # Automatically fetch and index ONLY episodes the user
    # has watched.
    #
    # Example:
    #
    # Bleach EP 5
    # → index EP 1-5
    #
    # Later EP 20
    # → index only EP 6-20
    # --------------------------------------------------------

    success = index_new_anime(
        anime,
        current_episode
    )

    if not success:

        return (
            "I don't have enough information "
            "from the episodes you've watched."
        )

    # --------------------------------------------------------
    # Reload because new vectors may have been added
    # --------------------------------------------------------

    index, documents = load_vectorstore()

    client = genai.Client()

    # --------------------------------------------------------
    # Embed user's question
    # --------------------------------------------------------

    query_vector = get_query_embedding(
        client,
        question
    )

    query_vector = np.array(
        [query_vector],
        dtype=np.float32
    )

    # --------------------------------------------------------
    # FAISS similarity search
    # --------------------------------------------------------

    search_count = min(
        30,
        len(documents)
    )

    scores, indices = index.search(
        query_vector,
        search_count
    )

    requested_anime = normalize_anime_name(
        anime
    )

    safe_documents = []

    # --------------------------------------------------------
    # FILTER RESULTS
    #
    # 1. Correct anime
    # 2. Episode <= user's current episode
    #
    # This is the core spoiler protection.
    # --------------------------------------------------------

    for idx in indices[0]:

        if idx < 0:
            continue

        document = documents[idx]

        document_anime = normalize_anime_name(
            document.get(
                "anime",
                ""
            )
        )

        episode = int(
            document.get(
                "episode",
                0
            )
        )

        if (
            document_anime == requested_anime
            and episode <= current_episode
        ):

            safe_documents.append(
                document
            )

    # --------------------------------------------------------
    # No safe context
    # --------------------------------------------------------

    if not safe_documents:

        return (
            "I don't have enough information "
            "from the episodes you've watched."
        )

    # --------------------------------------------------------
    # Build context for Gemini
    # --------------------------------------------------------

    context = "\n\n".join(
        f"Anime: {document['anime']}\n"
        f"Episode {document['episode']}:\n"
        f"{document['content']}"
        for document in safe_documents
    )

    # --------------------------------------------------------
    # Gemini prompt
    # --------------------------------------------------------

    prompt = f"""
You are an anime assistant for an anime
social-media platform.

The user is watching: {anime}

The user has watched up to Episode
{current_episode}.

IMPORTANT SPOILER RULE:

You may ONLY use information from
{anime} Episode {current_episode}
or earlier.

Never reveal information from later
episodes.

Never use your general knowledge to
reveal future events.

Never assume or invent information that
is not present in the provided context.

Answer the user's question using ONLY
the provided context.

If the provided context does not contain
enough information, say exactly:

"I don't have enough information from
the episodes you've watched."

Context:

{context}

User question:

{question}
"""

    # --------------------------------------------------------
    # Generate final answer
    # --------------------------------------------------------

    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=prompt
    )

    return response.text


# ============================================================
# DIRECT TERMINAL TEST
# ============================================================

if __name__ == "__main__":

    anime = input(
        "Anime: "
    )

    current_episode = int(
        input(
            "Current episode: "
        )
    )

    question = input(
        "Question: "
    )

    answer = ask_rag(
        question,
        current_episode,
        anime
    )

    print()
    print("AI:")
    print(answer)