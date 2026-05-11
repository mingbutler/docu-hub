from langchain_community.document_loaders import GitLoader

def load_git_repo(clone_url: str, repo_path: str):
    loader = GitLoader(
        clone_url,
        repo_path,
        branch='main',
        file_filter=lambda file_path: file_path.endswith(('.md', '.mdx', '.txt', '.py', '.js', '.ts', '.java', '.cs', '.c', '.cc', '.cpp', '.cxx', '.swift', '.go', '.rb', '.rs', '.php', '.html', '.css', '.json'))
    )
    
    return loader.load()