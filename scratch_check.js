const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gkffwjicqlzoubdchdmz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrZmZ3amljcWx6b3ViZGNoZG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMzY2MTQsImV4cCI6MjA4OTkxMjYxNH0.oxrvKLZWM1B6wzXccIwTCMSZib1g0-HN-HRWVGezjB0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase
        .from('simulations')
        .select('id, status, total_agents, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
    
    if (error) {
        console.error('Error fetching list:', error);
    } else {
        console.log('Last 5 simulations:');
        data.forEach(row => {
            console.log(`ID: ${row.id} | Status: ${row.status} | Total Agents: ${row.total_agents} | Created At: ${row.created_at}`);
        });
    }
}

check();
