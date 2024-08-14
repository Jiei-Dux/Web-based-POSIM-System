let supabase, db;

const SUPABASE_URL = 'https://ljerjrqcdsvdlnhssemt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZXJqcnFjZHN2ZGxuaHNzZW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg4NzE5MzksImV4cCI6MjAzNDQ0NzkzOX0.uAeqlHTxjgRPUS2K0DyYifFZqeD4hRaKlRGAH-eISaY';

function initSupabase() {
    supabase = supabase || window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Supabase initialized:', supabase);
}