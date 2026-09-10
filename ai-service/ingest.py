import os
import re
import json

import numpy as np
import faiss

from dotenv import load_dotenv
from google import genai
from google.genai import types


load_dotenv()


DOCUMENTS_DIR = "documents"
VECTORSTORE_DIR = "vectorstore"

EMBEDDING_MODEL = "gemini-embedding-001"
EMBEDDING_DIMENSION = 768


def normalize_vector(vector):
    vector = np.array(vector, dtype=np.float32)

    norm = np.linalg.norm(vector)

    if norm == 0:
        return vector

    return vector / norm


def get_embedding(client, text):

    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
        config=types.EmbedContentConfig(
            task_type="RETRIEVAL_DOCUMENT",
            output_dimensionality=EMBEDDING_DIMENSION
        )
    )

    return normalize_vector(
        response.embeddings[0].values
    )


def ingest_documents():

    chunks = []

    for anime_name in os.listdir(DOCUMENTS_DIR):

        anime_path = os.path.join(
            DOCUMENTS_DIR,
            anime_name
        )

        if not os.path.isdir(anime_path):
            continue

        for filename in os.listdir(anime_path):

            if not filename.endswith(".txt"):
                continue

            match = re.search(
                r"ep(\d+)",
                filename.lower()
            )

            if not match:
                continue

            episode_number = int(match.group(1))

            path = os.path.join(
                anime_path,
                filename
            )

            with open(
                path,
                "r",
                encoding="utf-8"
            ) as file:

                content = file.read()

            chunks.append({
                "content": content,
                "anime": anime_name,
                "episode": episode_number
            })

    if not chunks:

        print("No episode documents found.")

        return

    print(
        f"Loaded episode documents: {len(chunks)}"
    )

    print(
        f"Creating embeddings for {len(chunks)} documents..."
    )

    client = genai.Client()

    vectors = []

    for index, chunk in enumerate(chunks):

        print(
            f"Embedding {index + 1}/{len(chunks)}..."
        )

        vector = get_embedding(
            client,
            chunk["content"]
        )

        vectors.append(vector)

    vectors = np.array(
        vectors,
        dtype=np.float32
    )

    # Create FAISS index
    index = faiss.IndexFlatIP(
        EMBEDDING_DIMENSION
    )

    index.add(vectors)

    os.makedirs(
        VECTORSTORE_DIR,
        exist_ok=True
    )

    # Save FAISS index
    faiss.write_index(
        index,
        os.path.join(
            VECTORSTORE_DIR,
            "anime.index"
        )
    )

    # Save document metadata/content
    with open(
        os.path.join(
            VECTORSTORE_DIR,
            "documents.json"
        ),
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            chunks,
            file,
            ensure_ascii=False,
            indent=2
        )

    print(
        "\nGemini FAISS vectorstore created successfully."
    )

    print(
        f"Indexed documents: {len(chunks)}"
    )

    anime_counts = {}

    for chunk in chunks:

        anime = chunk["anime"]

        anime_counts[anime] = (
            anime_counts.get(anime, 0) + 1
        )

    print("\nIndexed anime:")

    for anime, count in anime_counts.items():

        print(
            f"{anime}: {count} documents"
        )


if __name__ == "__main__":

    ingest_documents()