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

INDEX_FILE = os.path.join(
    VECTORSTORE_DIR,
    "anime.index"
)

DOCUMENTS_FILE = os.path.join(
    VECTORSTORE_DIR,
    "documents.json"
)

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
# CREATE EMPTY VECTORSTORE
# ============================================================

def create_empty_vectorstore():

    os.makedirs(
        VECTORSTORE_DIR,
        exist_ok=True
    )

    index = faiss.IndexFlatIP(
        EMBEDDING_DIMENSION
    )

    documents = []

    faiss.write_index(
        index,
        INDEX_FILE
    )

    with open(
        DOCUMENTS_FILE,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            documents,
            file,
            ensure_ascii=False,
            indent=2
        )

    return index, documents


# ============================================================
# LOAD VECTORSTORE
# ============================================================

def load_vectorstore():

    # --------------------------------------------------------
    # Render may start with no vectorstore because generated
    # files are not stored in Git.
    # --------------------------------------------------------

    if not os.path.exists(INDEX_FILE):

        print(
            "No FAISS index found."
        )

        print(
            "Creating empty FAISS vectorstore..."
        )

        return create_empty_vectorstore()

    index = faiss.read_index(
        INDEX_FILE
    )

    if os.path.exists(DOCUMENTS_FILE):

        with open(
            DOCUMENTS_FILE,
            "r",
            encoding="utf-8"
        ) as file:

            documents = json.load(file)

    else:

        documents = []

    return index, documents


# ============================================================
# SAVE VECTORSTORE
# ============================================================

def save_vectorstore(
    index,
    documents
):

    os.makedirs(
        VECTORSTORE_DIR,
        exist_ok=True
    )

    faiss.write_index(
        index,
        INDEX_FILE
    )

    with open(
        DOCUMENTS_FILE,
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

            if error.code == 429:

                message = str(error)

                print()
                print(
                    "Gemini embedding rate limit reached."
                )

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
# GET INDEXED EPISODES
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
            document.get(
                "anime",
                ""
            )
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
# INDEX NEW EPISODES
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
    # Get episode documents from Kitsu
    # --------------------------------------------------------

    anime_dir = ensure_anime_documents(
        anime
    )

    if not anime_dir:

        return False

    # --------------------------------------------------------
    # Load existing index
    # --------------------------------------------------------

    index, documents = load_vectorstore()

    indexed_episodes = get_indexed_episodes(
        documents,
        anime
    )

    print(
        f"Already indexed episodes: "
        f"{len(indexed_episodes)}"
    )

    client = genai.Client()

    episode_files = []

    # --------------------------------------------------------
    # Find only episodes that:
    #
    # - User has watched
    # - Are not already indexed
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

        # Don't embed the same episode twice
        if episode_number in indexed_episodes:
            continue

        episode_files.append(
            (
                episode_number,
                filename
            )
        )

    episode_files.sort(
        key=lambda x: x[0]
    )

    # --------------------------------------------------------
    # Nothing new to embed
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
    # Embed episodes one at a time
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

        vector = get_embedding(
            client,
            content,
            "RETRIEVAL_DOCUMENT"
        )

        document = {
            "content": content,
            "anime": normalize_anime_name(
                anime
            ),
            "episode": episode_number
        }

        # ----------------------------------------------------
        # Add vector
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
# RAG
# ============================================================

def ask_rag(
    question,
    current_episode,
    anime
):

    # --------------------------------------------------------
    # Load or create vectorstore
    # --------------------------------------------------------

    index, documents = load_vectorstore()

    # --------------------------------------------------------
    # Automatically fetch + index anime
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
    # Reload after indexing
    # --------------------------------------------------------

    index, documents = load_vectorstore()

    client = genai.Client()

    # --------------------------------------------------------
    # Embed question
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
    # FAISS search
    # --------------------------------------------------------

    if index.ntotal == 0:

        return (
            "I don't have enough information "
            "from the episodes you've watched."
        )

    search_count = min(
        30,
        index.ntotal
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
    # SPOILER FILTER
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
    # Build context
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
    # Generate answer
    # --------------------------------------------------------

    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=prompt
    )

    return response.text


# ============================================================
# TERMINAL TEST
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