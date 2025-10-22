import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0'
import { corsHeaders } from '../_shared/cors.ts'

// Rate limiting storage (in-memory, resets on cold start)
const rateLimiter = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const userLimit = rateLimiter.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimiter.set(userId, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (userLimit.count >= maxRequests) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

// Enhanced UPI validation
function validateUpiId(upiId: string): { valid: boolean; error?: string } {
  // Length check
  if (upiId.length < 3 || upiId.length > 50) {
    return { valid: false, error: 'UPI ID must be 3-50 characters' };
  }
  
  // Format check: username@provider (alphanumeric, dots, underscores, hyphens)
  const upiRegex = /^[a-zA-Z0-9._-]{3,}@[a-zA-Z]{3,}$/;
  if (!upiRegex.test(upiId)) {
    return { valid: false, error: 'Invalid UPI ID format. Use: username@provider' };
  }
  
  // Known providers validation (common Indian UPI providers)
  const knownProviders = ['paytm', 'googlepay', 'phonepe', 'ybl', 'okaxis', 'okhdfcbank', 'okicici', 'oksbi', 'ibl', 'axl'];
  const provider = upiId.split('@')[1].toLowerCase();
  
  if (!knownProviders.includes(provider)) {
    console.warn(`Unknown UPI provider: ${provider} for UPI ID: ${upiId}`);
    // Don't block unknown providers, but log for monitoring
  }
  
  return { valid: true };
}

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

    // Rate limiting: 5 requests per minute per user
    if (!checkRateLimit(user.id, 5, 60000)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429
        }
      )
    }

    const { upiId } = await req.json()

    if (!upiId || typeof upiId !== 'string') {
      throw new Error('Valid UPI ID is required')
    }

    // Enhanced UPI validation
    const validation = validateUpiId(upiId);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid UPI ID');
    }

    // Update user profile with UPI ID
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ upi_id: upiId })
      .eq('id', user.id)

    if (updateError) {
      const requestId = crypto.randomUUID();
      console.error(`[${requestId}] Error updating UPI ID:`, {
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        code: updateError.code
      });
      return new Response(
        JSON.stringify({ 
          error: 'Failed to update UPI ID. Please try again or contact support.',
          reference: requestId
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
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