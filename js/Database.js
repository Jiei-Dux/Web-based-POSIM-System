let supabase, db;

// ===== ===== ===== ===== ===== SHIT DATABASE ===== ===== ===== ===== ===== //
// const SUPABASE_URL = 'https://ljerjrqcdsvdlnhssemt.supabase.co';
// const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZXJqcnFjZHN2ZGxuaHNzZW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg4NzE5MzksImV4cCI6MjAzNDQ0NzkzOX0.uAeqlHTxjgRPUS2K0DyYifFZqeD4hRaKlRGAH-eISaY';

// function initSupabase() {
//     supabase = supabase || window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
//     console.log('Supabase initialized:', supabase);
// }




// ===== ===== ===== ===== ===== NORMALIZED DATABASE ===== ===== ===== ===== ===== //
const SUPABASE_URL = 'https://tezthkniocwkidfyvevf.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlenRoa25pb2N3a2lkZnl2ZXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ3MzU4OTEsImV4cCI6MjA0MDMxMTg5MX0.kxqQM0O-rQkl2dtGtRIXNqX-AhdYsOOuaM8QraC2flQ';

function initSupabase() {
    supabase = supabase || window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Supabase initialized'/*, supabase*/);
}