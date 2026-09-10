import json
import os
import re

import faiss
import numpy as np

from dotenv import load_dotenv
from google import genai
from google.genai import types


load_dotenv()


VECTORSTORE_DIR = "vectorstore"

EMBEDDING_MODEL = "gemini-embedding-001"
EMBEDDING_DIMENSION = 768


def normalize_anime_name(name):
    return re.sub(
        r"[^a-zA-Z0-9_-]",
        "-",
        name.lower()
    ).strip("-")


def normalize_vector(vector):
    vector = np.array(
        vector,
        dtype=np.float32
    )

    norm = np.linalg.norm(vector)

    if norm == 0:
        return vector

    return vector / norm


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


def get_query_embedding(client, question):

    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=question,
        config=types.EmbedContentConfig(
            task_type="RETRIEVAL_QUERY",
            output_dimensionality=EMBEDDING_DIMENSION
        )
    )

    return normalize_vector(
        response.embeddings[0].values
    )


def ask_rag(
    question,
    current_episode,
    anime
):

    client = genai.Client()

    index, documents = load_vectorstore()

    query_vector = get_query_embedding(
        client,
        question
    )

    query_vector = np.array(
        [query_vector],
        dtype=np.float32
    )

    # Retrieve relevant documents
    scores, indices = index.search(
        query_vector,
        min(30, len(documents))
    )

    requested_anime = normalize_anime_name(
        anime
    )

    safe_documents = []

    for idx in indices[0]:

        if idx < 0:
            continue

        document = documents[idx]

        document_anime = normalize_anime_name(
            document.get("anime", "")
        )

        episode = int(
            document.get("episode", 0)
        )

        # Anime filter + spoiler protection
        if (
            document_anime == requested_anime
            and episode <= current_episode
        ):
            safe_documents.append(
                document
            )

    # Nothing safe/relevant found
    if not safe_documents:

        return (
            "I don't have enough information "
            "from the episodes you've watched."
        )

    # Build context
    context = "\n\n".join(
        f"Anime: {document['anime']}\n"
        f"Episode {document['episode']}:\n"
        f"{document['content']}"
        for document in safe_documents
    )

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

    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=prompt
    )

    return response.text


if __name__ == "__main__":

    anime = input("Anime: ")

    current_episode = int(
        input("Current episode: ")
    )

    question = input("Question: ")

    answer = ask_rag(
        question,
        current_episode,
        anime
    )

    print("\nAI:")
    print(answer)