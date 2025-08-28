import { supabase } from "./supabase";

const FunctionsURL = `${import.meta.env.VITE_BASE_URL}/functions/v1`

async function makeAuthenticatedRequest(functionName, options = {}) {
    const {data: { session }} = await supabase.auth.getSession();

    if (!session) {
        throw new Error("No active session found");
    };

    const response =  await fetch (`${FunctionsURL}/${functionName}`, {
        ...options,
        headers: {
            ...options.headers,
            "Authorization": `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
            ...options.headers,
        },
    })

    if(!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error making authenticated request");
    }

    return response.json();
};

export const api = {
    //shorten url
    async shortenUrl(data){
        return makeAuthenticatedRequest("shorten-url", {
            method: "POST",
            body: JSON.stringify(data)
        })
    },

    // Get user's URLs with analytics
    async getUserUrls() {
        return makeAuthenticatedRequest('get-user-urls', {
        method: 'GET',
        })
    },

    // Delete a URL
    async deleteUrl(urlId) {
        const { error } = await supabase
        .from('urls')
        .delete()
        .eq('id', urlId)

        if (error) throw error
    },
}

export function isValidUrl(string) {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      document.execCommand('copy')
    } catch (err) {
      console.error('Fallback: Could not copy text', err)
    }
    document.body.removeChild(textArea)
  }
}