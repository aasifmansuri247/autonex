import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle,
  Zap,
  Plus,
  RefreshCw,
  LogOut,
  User,
  Sliders
} from 'lucide-react';
import { Post, DashboardData, UserSession, OfferInfo } from './types';
import {
  getSession,
  clearSession,
  fetchDashboardApi,
  approvePostApi,
  regeneratePostApi,
  isDemoModeEnabled
} from './services/api';
import { LoginView } from './components/LoginView';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { PostCard } from './components/PostCard';
import { ReviewModal } from './components/ReviewModal';
import { CreatePostModal } from './components/CreatePostModal';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { OfferPage } from './components/OfferPage';
import { AccountView } from './components/AccountView';
import { LogoutConfirmModal } from './components/LogoutConfirmModal';
import { Toast } from './components/Toast';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  const [session, setSessionState] = useState<UserSession | null>(getSession());
  const [activePage, setActivePage] = useState<string>('home');
  const [posts, setPosts] = useState<Post[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'pending' | 'published'>('all');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modals
  const [reviewPost, setReviewPost] = useState<Post | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isApiSettingsOpen, setIsApiSettingsOpen] = useState<boolean>(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState<boolean>(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  }, []);

  const loadDashboard = useCallback(async () => {
    const currentSession = getSession();
    if (!currentSession) {
      setSessionState(null);
      return;
    }

    setIsLoading(true);
    try {
      const data = await fetchDashboardApi(currentSession.token, currentSession.clientId);
      setDashboardData(data);
      if (data.posts) {
        setPosts(data.posts);
      }
      if (isDemoModeEnabled()) {
        showToast(`Preview Mode • Client #${currentSession.clientId}`);
      } else {
        showToast(`Connected to AutoNex • Client #${currentSession.clientId}`);
      }
    } catch (err: any) {
      if (err.message === 'SESSION_EXPIRED') {
        clearSession();
        setSessionState(null);
        showToast('Session expired. Please sign in again.');
      } else {
        console.error('Error loading dashboard:', err);
        showToast(err.message || 'Could not connect to AutoNex server.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (session) {
      loadDashboard();
    }
  }, [session, loadDashboard]);

  const handleLogout = () => {
    clearSession();
    setSessionState(null);
    setDashboardData(null);
    setPosts([]);
    setIsLogoutConfirmOpen(false);
    showToast('Logged out of AutoNex');
  };

  const handleApprove = async (id: string) => {
    if (!session) return;

    showToast('Publishing post to Instagram...');
    try {
      await approvePostApi(session.token, session.clientId, id);
      showToast('Post approved and published ✓');
      await loadDashboard();
    } catch (err: any) {
      console.error('Approve error:', err);
      showToast(err.message || 'Could not approve post.');
    }
  };

  const handleRegenerate = async (id: string) => {
    if (!session) return;

    showToast('Regenerating post with AI...');
    try {
      const res = await regeneratePostApi(session.token, session.clientId, id);
      showToast(res.message || 'Post regenerated successfully ✓');
      await loadDashboard();
      setActivePage('posts');
    } catch (err: any) {
      console.error('Regenerate error:', err);
      showToast(err.message || 'Could not regenerate post.');
    }
  };

  const handleViewPost = (id: string) => {
    const found = posts.find((p) => String(p.id) === String(id));
    if (found) {
      setReviewPost(found);
    }
  };

  const handleOfferSaved = (savedOffer: OfferInfo) => {
    if (dashboardData) {
      setDashboardData({
        ...dashboardData,
        offer: savedOffer
      });
    }
  };

  const formatDate = (val?: string) => {
    if (!val) return '—';
    const d = new Date(val + (String(val).length === 10 ? 'T00:00:00' : ''));
    if (Number.isNaN(d.getTime())) return val;
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // If not logged in, show Pure Mobile Login view
  if (!session) {
    return (
      <>
        <LoginView
          onLoginSuccess={() => setSessionState(getSession())}
          onOpenApiSettings={() => setIsApiSettingsOpen(true)}
          onToast={showToast}
        />
        <ApiSettingsModal
          isOpen={isApiSettingsOpen}
          onClose={() => setIsApiSettingsOpen(false)}
          onToast={showToast}
          onConfigChanged={() => {}}
        />
        <Toast message={toastMessage} />
        <OfflineIndicator />
      </>
    );
  }

  // Filtered posts calculation
  const pendingPosts = posts.filter((p) => p.status === 'Pending');
  const publishedPosts = posts.filter((p) => p.status === 'Published');
  const filteredList =
    filterType === 'pending'
      ? pendingPosts
      : filterType === 'published'
      ? publishedPosts
      : posts;

  const businessName =
    dashboardData?.business?.name || `Client #${session.clientId}`;
  const avatarInitials =
    businessName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((x) => x[0])
      .join('')
      .toUpperCase() || 'AN';

  const offerText = dashboardData?.offer?.offer_text || dashboardData?.offer?.text || 'No active offer';
  const offerDate = dashboardData?.offer?.end_date || dashboardData?.offer?.date || '';

  return (
    <div className="min-h-screen bg-[#070b18] text-[#f5f7ff] flex flex-col font-sans select-none antialiased">
      {/* Desktop Sidebar */}
      <Sidebar
        activePage={activePage}
        onChangePage={setActivePage}
        pendingCount={pendingPosts.length}
        onLogout={() => setIsLogoutConfirmOpen(true)}
        onOpenApiSettings={() => setIsApiSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-3.5 sm:p-6 md:p-8 max-w-7xl pb-24 md:pb-8 pt-[max(0.875rem,env(safe-area-inset-top))]">
        {/* Topbar: Mobile & Desktop Native Header */}
        <div className="flex items-center justify-between gap-3 mb-5 sm:mb-8 pb-3.5 border-b border-[#1c2740]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-2xl font-extrabold text-white capitalize">
                {activePage === 'home'
                  ? 'Dashboard'
                  : activePage === 'posts'
                  ? 'Posts & Content'
                  : activePage === 'approval'
                  ? 'Pending Approvals'
                  : activePage === 'offer'
                  ? 'Manage Offer'
                  : 'Account & Settings'}
              </h2>
              {isLoading && (
                <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-[#9aa7c2] mt-0.5">
              {businessName}
            </p>
          </div>

          {/* Quick Header Actions: Easy Logout Button & User Avatar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* EASY LOGOUT BUTTON (Prominent in Header) */}
            <button
              onClick={() => setIsLogoutConfirmOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 active:scale-95 transition shadow-sm"
              title="Log Out of AutoNex"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">Log Out</span>
            </button>

            {/* Quick Profile Pill */}
            <button
              onClick={() => setActivePage('account')}
              className="flex items-center gap-2 p-1 pl-2.5 rounded-2xl bg-[#0e1628] border border-[#24304a] hover:border-cyan-500/40 transition active:scale-95"
              title="Account & Settings"
            >
              <span className="text-[11px] font-bold text-white hidden sm:inline max-w-[120px] truncate">
                {businessName}
              </span>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-xs font-black text-white shadow-md shadow-cyan-500/20">
                {avatarInitials}
              </div>
            </button>
          </div>
        </div>

        {/* PAGE 1: HOME (Dashboard) */}
        {activePage === 'home' && (
          <div className="space-y-5 sm:space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-[#0d1426] to-[#0b1120] border border-[#24304a] rounded-2xl p-4 sm:p-5 shadow-lg">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
                  {posts.length}
                </div>
                <div className="text-xs text-[#9aa7c2] mt-1">Posts this month</div>
              </div>

              <div className="bg-gradient-to-br from-[#0d1426] to-[#0b1120] border border-[#24304a] rounded-2xl p-4 sm:p-5 shadow-lg">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
                  {pendingPosts.length}
                </div>
                <div className="text-xs text-[#9aa7c2] mt-1">Pending approval</div>
              </div>

              <div className="bg-gradient-to-br from-[#0d1426] to-[#0b1120] border border-[#24304a] rounded-2xl p-4 sm:p-5 shadow-lg">
                <div className="w-8 h-8 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
                  {publishedPosts.length}
                </div>
                <div className="text-xs text-[#9aa7c2] mt-1">Published</div>
              </div>

              <div className="bg-gradient-to-br from-[#0d1426] to-[#0b1120] border border-[#24304a] rounded-2xl p-4 sm:p-5 shadow-lg">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
                  {dashboardData?.monthly_usage ?? 60}%
                </div>
                <div className="text-xs text-[#9aa7c2] mt-1">Monthly usage</div>
              </div>
            </div>

            {/* Upcoming Posts & Active Offer Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
              {/* Upcoming Posts (7 cols) */}
              <div className="lg:col-span-7 bg-gradient-to-br from-[#0d1426] to-[#0b1120] border border-[#24304a] rounded-2xl p-4 sm:p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1c2740]">
                  <h3 className="font-bold text-white text-base">Upcoming Posts</h3>
                  <button
                    onClick={() => setActivePage('posts')}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition"
                  >
                    View all ({posts.length}) →
                  </button>
                </div>

                <div className="space-y-1">
                  {posts.length > 0 ? (
                    posts.slice(0, 2).map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onApprove={handleApprove}
                        onRegenerate={handleRegenerate}
                        onView={handleViewPost}
                      />
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-[#9aa7c2]">
                      No posts found. Tap "Create post" to start generating content.
                    </div>
                  )}
                </div>
              </div>

              {/* Current Offer Panel (5 cols) */}
              <div className="lg:col-span-5 bg-gradient-to-br from-[#0d1426] to-[#0b1120] border border-[#24304a] rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1c2740]">
                    <h3 className="font-bold text-white text-base">Current Offer</h3>
                    <button
                      onClick={() => setActivePage('offer')}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition"
                    >
                      Edit Offer
                    </button>
                  </div>

                  <div className="p-4 rounded-xl border border-[#29436c] bg-gradient-to-br from-blue-600/15 to-purple-600/10 space-y-3">
                    <span className="text-[10px] font-extrabold text-[#67e8f9] uppercase tracking-wider">
                      Active offer
                    </span>
                    <h4 className="text-xl font-extrabold text-white leading-tight">
                      {offerText}
                    </h4>
                    <p className="text-xs text-[#9aa7c2]">
                      Valid until <strong className="text-white">{formatDate(offerDate)}</strong>
                    </p>

                    <div className="h-2 w-full bg-[#182238] rounded-full overflow-hidden mt-3">
                      <div className="h-full w-3/5 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full"></div>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-[#9aa7c2] mt-4 pt-3 border-t border-[#1c2740]">
                  ✨ Your AI content engine automatically weaves the active offer into all scheduled posts.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PAGE 2: POSTS */}
        {activePage === 'posts' && (
          <div className="bg-gradient-to-br from-[#0d1426] to-[#0b1120] border border-[#24304a] rounded-2xl p-4 sm:p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-[#1c2740]">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-white">All Posts</h3>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 active:scale-95 shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Create post
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-[#080d1b] border border-[#24304a] rounded-xl p-1 self-start sm:self-auto">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    filterType === 'all'
                      ? 'bg-[#121b31] text-cyan-300 border border-cyan-500/40'
                      : 'text-[#9aa7c2] hover:text-white'
                  }`}
                >
                  All ({posts.length})
                </button>
                <button
                  onClick={() => setFilterType('pending')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    filterType === 'pending'
                      ? 'bg-[#121b31] text-amber-300 border border-amber-500/40'
                      : 'text-[#9aa7c2] hover:text-white'
                  }`}
                >
                  Pending ({pendingPosts.length})
                </button>
                <button
                  onClick={() => setFilterType('published')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    filterType === 'published'
                      ? 'bg-[#121b31] text-blue-300 border border-blue-500/40'
                      : 'text-[#9aa7c2] hover:text-white'
                  }`}
                >
                  Published ({publishedPosts.length})
                </button>
              </div>
            </div>

            {/* Posts List */}
            <div className="divide-y divide-[#1c2740]">
              {filteredList.length > 0 ? (
                filteredList.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onApprove={handleApprove}
                    onRegenerate={handleRegenerate}
                    onView={handleViewPost}
                  />
                ))
              ) : (
                <div className="p-12 text-center text-xs text-[#9aa7c2]">
                  No posts found matching the selected filter.
                </div>
              )}
            </div>
          </div>
        )}

        {/* PAGE 3: APPROVALS */}
        {activePage === 'approval' && (
          <div className="bg-gradient-to-br from-[#0d1426] to-[#0b1120] border border-[#24304a] rounded-2xl p-4 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#1c2740]">
              <div>
                <h3 className="text-base font-bold text-white">Posts Waiting for Your Approval</h3>
                <p className="text-xs text-[#9aa7c2] mt-0.5">
                  Review generated images & captions before they are published to Instagram
                </p>
              </div>
            </div>

            <div className="divide-y divide-[#1c2740]">
              {pendingPosts.length > 0 ? (
                pendingPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onApprove={handleApprove}
                    onRegenerate={handleRegenerate}
                    onView={handleViewPost}
                  />
                ))
              ) : (
                <div className="p-12 text-center text-xs text-[#9aa7c2] space-y-2">
                  <div className="text-2xl">🎉</div>
                  <div className="font-semibold text-white">All caught up!</div>
                  <div>No posts are currently waiting for your review.</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PAGE 4: OFFER */}
        {activePage === 'offer' && (
          <OfferPage
            offer={dashboardData?.offer}
            token={session.token}
            clientId={session.clientId}
            onOfferSaved={handleOfferSaved}
            onToast={showToast}
          />
        )}

        {/* PAGE 5: ACCOUNT & EASY LOGOUT */}
        {activePage === 'account' && (
          <AccountView
            session={session}
            dashboardData={dashboardData}
            onLogout={() => setIsLogoutConfirmOpen(true)}
            onOpenApiSettings={() => setIsApiSettingsOpen(true)}
            onToast={showToast}
            onRefresh={loadDashboard}
          />
        )}
      </main>

      {/* Pure Mobile Bottom Navigation Bar */}
      <BottomNav
        activePage={activePage}
        onChangePage={setActivePage}
        pendingCount={pendingPosts.length}
      />

      {/* Modals */}
      <ReviewModal
        post={reviewPost}
        onClose={() => setReviewPost(null)}
        onApprove={handleApprove}
        onRegenerate={handleRegenerate}
      />

      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        token={session.token}
        clientId={session.clientId}
        onSuccess={loadDashboard}
        onToast={showToast}
      />

      <ApiSettingsModal
        isOpen={isApiSettingsOpen}
        onClose={() => setIsApiSettingsOpen(false)}
        onToast={showToast}
        onConfigChanged={loadDashboard}
      />

      <LogoutConfirmModal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleLogout}
        businessName={businessName}
      />

      <Toast message={toastMessage} />
      <OfflineIndicator />
    </div>
  );
}
