
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTasksTable() {
  try {
    // Check table info
    const { data: info, error: infoError } = await supabase
      .from('tarefas')
      .select('*')
      .limit(1)

    if (infoError) {
      console.error('Error fetching tasks:', infoError)
    } else {
      console.log('Tasks sample data:', info)
      if (info && info.length > 0) {
        console.log('Columns found in tarefas:', Object.keys(info[0]))
      } else {
        console.log('Table tarefas is empty, cannot determine columns from data.')
      }
    }

    // Try to get column info via RPC or just query a non-existent column to see error message?
    // Usually, the best way without direct DB access is to check the response of a select *
  } catch (e) {
    console.error('Exception:', e)
  }
}

checkTasksTable()
