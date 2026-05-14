import os
from typing import cast
from dotenv import load_dotenv
from langchain_community.document_loaders import GithubFileLoader

load_dotenv()
ACCESS_TOKEN = cast(str, os.environ.get('GITHUB_PERSONAL_ACCESS_TOKEN'))

def load_git_repo(repo_path: str):
    loader = GithubFileLoader(
        repo=repo_path,
        branch='main',
        access_token=ACCESS_TOKEN,
        github_api_url="https://api.github.com",
        file_filter=lambda file_path: file_path.endswith(('.md', '.mdx', '.txt', '.py', '.js', '.ts', '.java', '.cs', '.c', '.cc', '.cpp', '.cxx', '.swift', '.go', '.rb', '.rs', '.php', '.html', '.css', '.json'))
    )
    
    return loader.load()