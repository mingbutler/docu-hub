import requests

from langchain_community.document_loaders import SitemapLoader, RecursiveUrlLoader

def load_web_docs(url: str):
    sitemap_url = f"{url.rstrip('/')}/sitemap.xml"
    
    response = requests.head(sitemap_url)
    if response.status_code == 200:
        print("Sitemap found. Initiating fast load...")
        loader = SitemapLoader(web_path=sitemap_url)
    else: 
        # fallback
        print("No sitemap found. Initiating recursive crawl...")
        loader = RecursiveUrlLoader(url=url, max_depth=3)
        
    return loader.load()
    