import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get auth user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { upiId } = await req.json()

    if (!upiId || typeof upiId !== 'string') {
      throw new Error('Valid UPI ID is required')
    }

    // Validate UPI ID format (basic validation)
    const upiRegex = /^[\w.-]+@[\w.-]+$/
    if (!upiRegex.test(upiId)) {
      throw new Error('Invalid UPI ID format. Example: username@upi')
    }

    // Update user profile with UPI ID
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ upi_id: upiId })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating UPI ID:', updateError)
      throw new Error(`Failed to update UPI ID: ${updateError.message}`)
    }

    console.log(`UPI ID updated for user ${user.id}`)

    return new Response(
      JSON.stringify({ 
        message: 'UPI ID updated successfully',
        upiId
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in update-upi:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: errorMessage.includes('Unauthorized') ? 403 : 400
      }
    )
  }
})