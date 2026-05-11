from langchain_community.document_loaders import WebBaseLoader

def load_web_docs(urls: list[str]):
    loader = WebBaseLoader(urls)
    return loader.load()