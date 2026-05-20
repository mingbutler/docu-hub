import os
from dotenv import load_dotenv
from typing import cast

from langchain_community.vectorstores import SupabaseVectorStore
from langchain_openai import OpenAIEmbeddings
from supabase.client import Client, create_client    

load_dotenv()

supabase_url = cast(str, os.environ.get('SUPABASE_URL'))
supabase_key = cast(str, os.environ.get('SUPABASE_SERVICE_KEY'))
openai_api_key = cast(str, os.environ.get('OPENAI_API_KEY'))

supabase: Client = create_client(supabase_url, supabase_key)

embeddings = OpenAIEmbeddings(model='text-embedding-3-small')

vector_store = SupabaseVectorStore(
    client=supabase,
    embedding=embeddings,
    table_name='documents',
    query_name='match_documents'
)
