import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jbjjdjstfjcyipyfxtoc.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiampkanN0ZmpjeWlweWZ4dG9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzODg1OTEsImV4cCI6MjA1NDk2NDU5MX0.fcenyOvp0iIBVRXRUu-PzxkxQNSl14SgitgnMQ7kwA8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);