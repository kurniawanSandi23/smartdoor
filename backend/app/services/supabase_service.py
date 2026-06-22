import os
from supabase import create_client


class SupabaseService:
    def __init__(self):
        self.url = os.getenv("SUPABASE_URL", "")
        self.key = os.getenv("SUPABASE_KEY", "")
        self.client = create_client(self.url, self.key) if self.url and self.key else None

    def is_ready(self):
        return self.client is not None

    def table(self, table_name: str):
        if not self.client:
            raise RuntimeError("Supabase client belum dikonfigurasi")
        return self.client.table(table_name)

    def fetch_all(self, table_name: str):
        return self.table(table_name).select("*").execute()

    def fetch_by_id(self, table_name: str, record_id: str):
        return self.table(table_name).select("*").eq("id", record_id).limit(1).execute()

    def insert(self, table_name: str, payload: dict):
        return self.table(table_name).insert(payload).execute()

    def upsert(self, table_name: str, payload: dict, on_conflict: str = "id"):
        return self.table(table_name).upsert(payload, on_conflict=on_conflict).execute()

    def update(self, table_name: str, record_id: str, payload: dict):
        return self.table(table_name).update(payload).eq("id", record_id).execute()

    def delete(self, table_name: str, record_id: str):
        return self.table(table_name).delete().eq("id", record_id).execute()