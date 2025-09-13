from dotenv import load_dotenv
import os
from supabase import create_client
from supabase.lib.client_options import ClientOptions

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

supabase = create_client(
    url,
    key,
    options=ClientOptions(
        postgrest_client_timeout=30,   # increase Postgrest timeout
        storage_client_timeout=30,     # storage operations timeout
        schema="public"
    )
)

response = supabase.auth.sign_up(
    {
        "email": "imagegpt101@gmail.com",
        "password": "123456",
    }
)
print(response)