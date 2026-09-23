import { DashboardData, Post, PostStatus, UserSession } from '../types';

export const DEFAULT_API_BASE = 'http://192.168.43.134:5678';

export function getApiBaseUrl(): string {
  return localStorage.getItem('autonex_api_base') || DEFAULT_API_BASE;
}

export function setApiBaseUrl(url: string): void {
  const clean = url.trim().replace(/\/+$/, '');
  localStorage.setItem('autonex_api_base', clean);
}

export function isDemoModeEnabled(): boolean {
  return localStorage.getItem('autonex_demo_mode') === 'true';
}

export function setDemoModeEnabled(enabled: boolean): void {
  localStorage.setItem('autonex_demo_mode', enabled ? 'true' : 'false');
}

export function getSession(): UserSession | null {
  const token = localStorage.getItem('autonex_token');
  const clientId = localStorage.getItem('autonex_client_id');
  const expiresAt = localStorage.getItem('autonex_expires_at');
  const email = localStorage.getItem('autonex_user_email') || undefined;

  if (!token || !clientId) return null;

  // Check expiration if present
  if (expiresAt) {
    const exp = new Date(expiresAt).getTime();
    if (!Number.isNaN(exp) && exp < Date.now()) {
      clearSession();
      return null;
    }
  }

  return { token, clientId, expiresAt: expiresAt || '', email };
}

export function setSession(token: string, clientId: string, expiresAt: string, email?: string): void {
  localStorage.setItem('autonex_token', token);
  localStorage.setItem('autonex_client_id', String(clientId));
  localStorage.setItem('autonex_expires_at', expiresAt);
  if (email) localStorage.setItem('autonex_user_email', email);
}

export function clearSession(): void {
  localStorage.removeItem('autonex_token');
  localStorage.removeItem('autonex_client_id');
  localStorage.removeItem('autonex_expires_at');
  localStorage.removeItem('autonex_user_email');
}

export const fallbackImage = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="700" height="500" viewBox="0 0 700 500">
<rect width="700" height="500" fill="#111a30"/>
<text x="350" y="235" text-anchor="middle" fill="#9aa7c2" font-family="Arial" font-size="28">AutoNex</text>
<text x="350" y="275" text-anchor="middle" fill="#66748f" font-family="Arial" font-size="18">Image not available</text>
</svg>`);

export function normalizeStatus(status?: string): PostStatus {
  const s = String(status || 'Pending').trim().toLowerCase();
  if (s.includes('publish')) return 'Published';
  if (s.includes('approve')) return 'Approved';
  if (s.includes('reject')) return 'Rejected';
  return 'Pending';
}

export function normalizePosts(rawPosts: any[]): Post[] {
  return (rawPosts || []).map((p, index) => ({
    id: String(p.post_id || p['Post ID'] || p.Post_ID || p.id || `post-${index}-${Date.now()}`),
    date: p.created_date || p.date || new Date().toISOString().split('T')[0],
    title: p.topic || p.title || 'Untitled post',
    caption: p.caption || 'Caption is not available yet.',
    status: normalizeStatus(p.status),
    img: p.image_url || p.img || fallbackImage,
    hashtags: p.hashtags || '#AutoNex #AI #SocialMedia'
  }));
}

// Demo fallback mock data for testing outside local LAN
const mockDemoPosts: Post[] = [
  {
    id: 'post-101',
    date: '2026-09-22',
    title: 'Artisan Truffle & Mozzarella Pizza',
    caption: 'Crispy wood-fired sourdough crust meets freshly shaved black truffle and creamy Buffalo mozzarella. Hand-crafted daily by our master pizzaiolo.',
    status: 'Pending',
    img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    hashtags: '#PizzaLover #ArtisanPizza #FoodieGram #ItalianCuisine #Foodstagram'
  },
  {
    id: 'post-102',
    date: '2026-09-21',
    title: 'Signature Berry Bliss Mocktail',
    caption: 'Refresh your evening with muddled wild blackberries, fresh garden mint, zesty lime, and sparkling tonic water. 100% alcohol-free deliciousness.',
    status: 'Pending',
    img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80',
    hashtags: '#Mocktail #Refreshing #SummerVibes #BarExperience #CraftDrinks'
  },
  {
    id: 'post-103',
    date: '2026-09-19',
    title: 'Weekend Chef Table Experience',
    caption: 'An intimate 5-course culinary journey celebrating seasonal farm-to-table flavors. Limited seats available for Friday and Saturday seatings.',
    status: 'Published',
    img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
    hashtags: '#ChefsTable #FineDining #FoodArt #CulinaryJourney #ChefSpecials'
  },
  {
    id: 'post-104',
    date: '2026-09-17',
    title: 'Midnight Chocolate Lava Fondant',
    caption: 'Molten dark Belgian chocolate center flowing into vanilla bean gelato. The ultimate sweet finale to your dining experience.',
    status: 'Published',
    img: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80',
    hashtags: '#DessertLovers #Chocoholic #LavaCake #SweetTooth #GourmetDessert'
  }
];

let localDemoData: DashboardData = {
  success: true,
  business: {
    id: 108,
    name: 'ABC Gourmet Lounge',
    email: 'client@abclounge.com'
  },
  offer: {
    offer_text: '20% OFF Family Dinner Special',
    end_date: '2026-10-15',
    start_date: '2026-09-20'
  },
  posts: [...mockDemoPosts],
  monthly_usage: 60
};

// API Services
export async function loginApi(email: string, password: string): Promise<{ success: boolean; token: string; client_id: string; expires_at: string; message?: string }> {
  if (isDemoModeEnabled()) {
    const demoToken = 'mock_demo_token_' + Math.random().toString(36).substring(2);
    const demoExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    return {
      success: true,
      token: demoToken,
      client_id: '108',
      expires_at: demoExpiry
    };
  }

  const base = getApiBaseUrl();
  const url = `${base}/webhook/autonex-login`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || data.error || `Invalid credentials (status ${res.status})`);
    }

    if (!data.token || !data.client_id || !data.expires_at) {
      throw new Error('Login response is missing session information');
    }

    return data;
  } catch (err: any) {
    // If user is testing without LAN access, offer fallback demo mode
    if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
      throw new Error(`Cannot reach n8n server at ${base}. Make sure your phone/browser is on the same Wi-Fi, or enable Demo Mode.`);
    }
    throw err;
  }
}

export async function fetchDashboardApi(token: string, clientId: string): Promise<DashboardData> {
  if (isDemoModeEnabled()) {
    return { ...localDemoData };
  }

  const base = getApiBaseUrl();
  const url = `${base}/webhook/autonex-dashboard?client_id=${encodeURIComponent(clientId)}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.status === 401 || res.status === 403) {
      clearSession();
      throw new Error('SESSION_EXPIRED');
    }

    if (!res.ok) {
      throw new Error(`API returned status ${res.status}`);
    }

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Dashboard API returned an error');
    }

    return {
      ...data,
      posts: normalizePosts(data.posts)
    };
  } catch (err: any) {
    if (err.message === 'SESSION_EXPIRED') throw err;
    if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
      console.warn('Dashboard fetch failed due to network. Falling back to cached/demo state.');
      return { ...localDemoData };
    }
    throw err;
  }
}

export async function approvePostApi(token: string, clientId: string, postId: string): Promise<any> {
  if (isDemoModeEnabled()) {
    if (localDemoData.posts) {
      localDemoData.posts = localDemoData.posts.map(p =>
        p.id === postId ? { ...p, status: 'Published' } : p
      );
    }
    return { success: true, message: 'Post approved and published ✓' };
  }

  const base = getApiBaseUrl();
  const url = `${base}/webhook/autonex-approve`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      client_id: String(clientId),
      post_id: String(postId)
    })
  });

  const data = await res.json();
  if (res.status === 401 || res.status === 403) {
    clearSession();
    throw new Error('SESSION_EXPIRED');
  }

  if (!res.ok || !data.success) {
    throw new Error(data.message || data.error || `API returned status ${res.status}`);
  }

  return data;
}

export async function regeneratePostApi(token: string, clientId: string, postId: string): Promise<any> {
  if (isDemoModeEnabled()) {
    if (localDemoData.posts) {
      localDemoData.posts = localDemoData.posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            caption: `${p.caption} [Updated with new AI variation]`,
            img: `https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80`
          };
        }
        return p;
      });
    }
    return { success: true, message: 'Post regenerated successfully ✓' };
  }

  const base = getApiBaseUrl();
  const url = `${base}/webhook/autonex-regenerate`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      client_id: String(clientId),
      post_id: String(postId)
    })
  });

  let data: any = {};
  try {
    data = await res.json();
  } catch (_) {}

  if (res.status === 401 || res.status === 403) {
    clearSession();
    throw new Error('SESSION_EXPIRED');
  }

  if (!res.ok || data.success === false) {
    throw new Error(data.message || data.error || `API returned status ${res.status}`);
  }

  return data;
}

export async function saveOfferApi(token: string, clientId: string, offerText: string, endDate: string): Promise<any> {
  const startDate = new Date().toISOString().split('T')[0];

  if (isDemoModeEnabled()) {
    localDemoData.offer = {
      offer_text: offerText,
      end_date: endDate,
      start_date: startDate
    };
    return { success: true, offer_text: offerText, end_date: endDate, message: 'Offer saved successfully ✓' };
  }

  const base = getApiBaseUrl();
  const url = `${base}/webhook/autonex-offer`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      client_id: clientId,
      offer_text: offerText,
      start_date: startDate,
      end_date: endDate
    })
  });

  if (!res.ok) {
    throw new Error(`API returned ${res.status}`);
  }

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Offer API returned an error');
  }

  return data;
}

export async function createPostApi(token: string, clientId: string, title: string, description: string, files: File[]): Promise<any> {
  if (isDemoModeEnabled()) {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      title: title,
      caption: description,
      status: 'Pending',
      img: files.length > 0 ? URL.createObjectURL(files[0]) : 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80',
      hashtags: '#NewItem #Fresh #AutoNex'
    };
    if (!localDemoData.posts) localDemoData.posts = [];
    localDemoData.posts.unshift(newPost);
    return { success: true, message: 'Post generated successfully ✓' };
  }

  const base = getApiBaseUrl();
  const url = `${base}/webhook/autonex-create-post`;

  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description);
  formData.append('features_description', description);
  formData.append('client_id', String(clientId));

  files.forEach((file, index) => {
    formData.append(`image_${index}`, file, file.name);
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  let data: any = {};
  try {
    data = await res.json();
  } catch (_) {}

  if (res.status === 401 || res.status === 403) {
    clearSession();
    throw new Error('SESSION_EXPIRED');
  }

  if (!res.ok || data.success === false) {
    throw new Error(data.message || data.error || `API returned status ${res.status}`);
  }

  return data;
}

export async function pingApiServer(url: string): Promise<boolean> {
  try {
    const cleanUrl = url.trim().replace(/\/+$/, '');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${cleanUrl}/webhook/autonex-dashboard`, {
      method: 'GET',
      signal: controller.signal
    }).catch(err => {
      // If CORS or 401/403/404, server exists!
      if (err.name !== 'AbortError') return { ok: true, status: 0 };
      throw err;
    });

    clearTimeout(timeout);
    return !!res;
  } catch (_) {
    return false;
  }
}
