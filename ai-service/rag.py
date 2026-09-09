from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

from google import genai
from dotenv import load_dotenv

load_dotenv()

VECTORSTORE_DIR = "vectorstore"


def get_vectorstore():
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    return FAISS.load_local(
        VECTORSTORE_DIR,
        embeddings,
        allow_dangerous_deserialization=True
    )


def ask_rag(question, current_episode):
    vectorstore = get_vectorstore()

    # Retrieve more results than we finally need
    documents = vectorstore.similarity_search(
        question,
        k=8
    )

    # Remove spoilers
    safe_documents = [
        doc for doc in documents
        if doc.metadata.get("episode", 0) <= current_episode
    ]

    if not safe_documents:
        return "I don't have enough information from the episodes you've watched."

    # Build context
    context = "\n\n".join(
        f"Episode {doc.metadata['episode']}:\n{doc.page_content}"
        for doc in safe_documents
    )

    client = genai.Client()

    prompt = f"""
You are an anime assistant for an anime social-media platform.

The user has watched up to Episode {current_episode}.

IMPORTANT SPOILER RULE:
You may ONLY use information from Episode {current_episode}
or earlier.

Never reveal information from later episodes.
Never use your general knowledge to reveal future events.

Answer the user's question using ONLY the provided context.

If the provided context does not contain enough information,
say:

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

    current_episode = int(
        input("Current episode: ")
    )

    question = input("Ask about Naruto: ")

    answer = ask_rag(
        question,
        current_episode
    )

    print("\nAI:")
    print(answer)