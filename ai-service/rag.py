import re

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

from google import genai
from dotenv import load_dotenv

load_dotenv()

VECTORSTORE_DIR = "vectorstore"


def normalize_anime_name(name):
    return re.sub(
        r"[^a-zA-Z0-9_-]",
        "-",
        name.lower()
    ).strip("-")


def get_vectorstore():
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    return FAISS.load_local(
        VECTORSTORE_DIR,
        embeddings,
        allow_dangerous_deserialization=True
    )


def ask_rag(question, current_episode, anime):
    vectorstore = get_vectorstore()

    documents = vectorstore.similarity_search(
        question,
        k=30
    )

    requested_anime = normalize_anime_name(anime)

    safe_documents = [
        doc
        for doc in documents
        if normalize_anime_name(
            doc.metadata.get("anime", "")
        ) == requested_anime
        and doc.metadata.get("episode", 0) <= current_episode
    ]

    if not safe_documents:
        return "I don't have enough information from the episodes you've watched."

    context = "\n\n".join(
        f"Anime: {doc.metadata['anime']}\n"
        f"Episode {doc.metadata['episode']}:\n"
        f"{doc.page_content}"
        for doc in safe_documents
    )

    client = genai.Client()

    prompt = f"""
You are an anime assistant for an anime social-media platform.

The user is watching: {anime}
The user has watched up to Episode {current_episode}.

IMPORTANT SPOILER RULE:

You may ONLY use information from {anime}
Episode {current_episode} or earlier.

Never reveal information from later episodes.

Never use your general knowledge to reveal future events.

Never assume or invent information that is not present
in the provided context.

Answer the user's question using ONLY the provided context.

If the provided context does not contain enough information,
say exactly:

"I don't have enough information from the episodes you've watched."

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