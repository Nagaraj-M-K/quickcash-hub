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

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()

    if (roleError || !roleData) {
      throw new Error('Admin access required')
    }

    const { clickId, status } = await req.json()

    if (!clickId || !status) {
      throw new Error('Missing required fields: clickId, status')
    }

    if (!['pending', 'confirmed', 'rejected'].includes(status)) {
      throw new Error('Invalid status. Must be: pending, confirmed, or rejected')
    }

    // Update click status
    const { data: updatedClick, error: updateError } = await supabaseClient
      .from('clicks')
      .update({ 
        status,
        confirmed_at: status === 'confirmed' ? new Date().toISOString() : null
      })
      .eq('id', clickId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating click:', updateError)
      throw new Error(`Failed to update click: ${updateError.message}`)
    }

    console.log(`Click ${clickId} updated to ${status}`)

    let payoutId = null

    // If confirmed, check if payout threshold is met (₹100+)
    if (status === 'confirmed' && updatedClick.user_id) {
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('confirmed_earnings, upi_id')
        .eq('id', updatedClick.user_id)
        .single()

      if (profile && profile.confirmed_earnings >= 100 && profile.upi_id) {
        console.log(`User ${updatedClick.user_id} eligible for payout: ₹${profile.confirmed_earnings}`)
        
        // Create payout record
        const { data: payout, error: payoutError } = await supabaseClient
          .from('payouts')
          .insert({
            user_id: updatedClick.user_id,
            amount: profile.confirmed_earnings,
            upi_id: profile.upi_id,
            status: 'pending'
          })
          .select()
          .single()

        if (!payoutError && payout) {
          payoutId = payout.id
          console.log(`Payout created: ${payoutId} for ₹${profile.confirmed_earnings}`)
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Click status updated to ${status}`,
        click: updatedClick,
        payoutId
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in sync-rewards:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: errorMessage.includes('Unauthorized') || errorMessage.includes('Admin') ? 403 : 400
      }
    )
  }
})