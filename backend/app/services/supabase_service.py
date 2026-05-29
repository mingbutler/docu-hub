import os
from typing import cast
from supabase import create_client, Client

supabase_url = cast(str, os.environ.get('SUPABASE_URL'))
supabase_key = cast(str, os.environ.get('SUPABASE_SECRET_KEY'))

supabase: Client = create_client(supabase_url, supabase_key)