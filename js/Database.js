let supabase;
let db;

const supabaseUrl = 'https://ljerjrqcdsvdlnhssemt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZXJqcnFjZHN2ZGxuaHNzZW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg4NzE5MzksImV4cCI6MjAzNDQ0NzkzOX0.uAeqlHTxjgRPUS2K0DyYifFZqeD4hRaKlRGAH-eISaY';

function initSupabase() {
    supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    console.log('Supabase initialized:', supabase);
}