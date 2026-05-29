const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gkffwjicqlzoubdchdmz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrZmZ3amljcWx6b3ViZGNoZG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMzY2MTQsImV4cCI6MjA4OTkxMjYxNH0.oxrvKLZWM1B6wzXccIwTCMSZib1g0-HN-HRWVGezjB0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    // Let's run a query via RPC if possible or fetch the schema details from REST API
    // Wait! Since REST API doesn't expose pg_catalog, let's see if we can do an RPC call if we have one,
    // or let's try to update status to different lowercase/uppercase strings to see what works!
    const id = '4eaac734-bb29-4448-99b5-1a71bdf2e0f4';
    
    const candidates = ['pending', 'running', 'completed', 'Pending', 'Running', 'Completed', 'active', 'Active'];
    
    for (const status of candidates) {
        const { error } = await supabase
            .from('simulations')
            .update({ status })
            .eq('id', id);
        
        if (error) {
            console.log(`Status "${status}" failed: ${error.message}`);
        } else {
            console.log(`Status "${status}" SUCCEEDED!`);
        }
    }
}

check();
