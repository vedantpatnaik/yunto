import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import MobileApp from "./MobileApp";
import LoginPage from "@/features/auth/LoginPage";
import { getToken } from "@/api/client";
import DashboardPage from "@/features/dashboard/DashboardPage";

/** Gate the admin app behind a session — no token → login screen. */
function RequireAuth() {
  return getToken() ? <Outlet /> : <Navigate to="/login" replace />;
}
import LeadsPage from "@/features/leads/LeadsPage";
import CampaignsPage from "@/features/campaigns/CampaignsPage";
import CreatorsPage from "@/features/creators/CreatorsPage";
import CreatorDetailPage from "@/features/creator-detail/CreatorDetailPage";
import ContactsPage from "@/features/contacts/ContactsPage";
import RevenuePage from "@/features/revenue/RevenuePage";
import LeadDetailPage from "@/features/lead-detail/LeadDetailPage";
import SettingsPage from "@/features/settings/SettingsPage";
import PeoplePage from "@/features/people/PeoplePage";
import ChatPage from "@/features/chat/ChatPage";
import CalendarPage from "@/features/calendar/CalendarPage";
import InvoicesPage from "@/features/invoices/InvoicesPage";
import ContractsPage from "@/features/contracts/ContractsPage";
import RemindersPage from "@/features/reminders/RemindersPage";
import SetTargetPage from "@/features/set-target/SetTargetPage";
import NewLeadsPage from "@/features/new-leads/NewLeadsPage";
import ContactedLeadsPage from "@/features/contacted-leads/ContactedLeadsPage";
import NewLeadDetailPage from "@/features/new-lead-detail/NewLeadDetailPage";
import LeadConnectedPage from "@/features/lead-connected/LeadConnectedPage";
import CampaignDetailPage from "@/features/campaign-detail/CampaignDetailPage";
import CampaignCreatorListPage from "@/features/campaign-creator-list/CampaignCreatorListPage";
import CampaignAssignPage from "@/features/campaign-assign/CampaignAssignPage";
import RatingCreatorPage from "@/features/rating-creator/RatingCreatorPage";
import CreatorsFindPage from "@/features/creators-find/CreatorsFindPage";
import CreatorsSharedLinkPage from "@/features/creators-shared-link/CreatorsSharedLinkPage";
import ShareLinkListPage from "@/features/share-link-creator-list/ShareLinkListPage";
import AddOnsMyCreatorsPage from "@/features/add-ons-my-creators/AddOnsMyCreatorsPage";
import AddOnsEditorsPage from "@/features/add-ons-editors/AddOnsEditorsPage";
import AddOnsVideographersPage from "@/features/add-ons-videographers/AddOnsVideographersPage";
import CreatorDetailMyPage from "@/features/creator-detail-my/CreatorDetailMyPage";
import SearchPage from "@/features/search/SearchPage";
import PaidPaymentSummaryPage from "@/features/paid-payment-summary/PaidPaymentSummaryPage";
import BarterPaymentSummaryPage from "@/features/barter-payment-summary/BarterPaymentSummaryPage";
import PaymentsReceivedPage from "@/features/payments-received/PaymentsReceivedPage";
import ConnectLeadPollPage from "@/features/connect-lead-poll/ConnectLeadPollPage";
import GeneralPollPage from "@/features/general-poll/GeneralPollPage";
import PollResultPage from "@/features/poll-result/PollResultPage";
import PollTypePage from "@/features/poll-type/PollTypePage";
import InterestedPollPage from "@/features/interested-poll/InterestedPollPage";
import LeavesPage from "@/features/leaves/LeavesPage";
import AddHolidaysPage from "@/features/leaves-add-holidays/AddHolidaysPage";
import ApplyLeavePage from "@/features/apply-leave/ApplyLeavePage";
import AssignCreatorsPage from "@/features/people-assign-creators/AssignCreatorsPage";
import LeaveRequestPage from "@/features/leave-request/LeaveRequestPage";
import LeavesRequestPage from "@/features/leaves-request/LeavesRequestPage";
import PeopleLeavesPage from "@/features/people-leaves/PeopleLeavesPage";
import InfluencerChatRoomPage from "@/features/influencer-chat-room/InfluencerChatRoomPage";
import CampaignChatRoomPage from "@/features/campaign-chat-room/CampaignChatRoomPage";
import ChannelCreatedPage from "@/features/channel-created/ChannelCreatedPage";
import CreateChannelPage from "@/features/create-channel/CreateChannelPage";
import CalendarAllCreatorPage from "@/features/calendar-all/CalendarAllCreatorPage";
import CalendarShiftDatePage from "@/features/calendar-shift/CalendarShiftDatePage";
import CalendarBrandPage from "@/features/calendar-brand/CalendarBrandPage";
import ApplyLeavesPage from "@/features/apply-leaves/ApplyLeavesPage";
import CreateLeadPaidPage from "@/features/create-lead-paid/CreateLeadPaidPage";
import CreateLeadBarterPage from "@/features/create-lead-barter/CreateLeadBarterPage";
import ContactedLeadDetailPage from "@/features/contacted-lead-detail/ContactedLeadDetailPage";
import NewLeadSearchPage from "@/features/new-lead-search/NewLeadSearchPage";
import CampCreatorDetailAllPage from "@/features/campaign-creator-detail-all/CampCreatorDetailAllPage";
import CampCreatorDetailMyPage from "@/features/campaign-creator-detail-my/CampCreatorDetailMyPage";
import SettingsLeadDistPage from "@/features/settings-lead-distribution/SettingsLeadDistPage";
import SettingsCollabsPage from "@/features/settings-collabs/SettingsCollabsPage";
import LeadsDownloadPage from "@/features/leads-download/LeadsDownloadPage";
import NewLeadCreatorListPage from "@/features/new-lead-creator-list/NewLeadCreatorListPage";
import AddCreatorPage from "@/features/add-creator/AddCreatorPage";
import BrandCampaignCreatorListPage from "@/features/brand-campaign-creator-list/BrandCampaignCreatorListPage";
import SettingsIntegrationPage from "@/features/settings-integration/SettingsIntegrationPage";
import SettingsAddMembersPage from "@/features/settings-add-members/SettingsAddMembersPage";
import SettingsCollabPage from "@/features/settings-collab/SettingsCollabPage";
import PollInChatPage from "@/features/poll-in-chat/PollInChatPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/m/*" element={<MobileApp />} />
      <Route element={<RequireAuth />}>
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/leads/detail" element={<LeadDetailPage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/creators" element={<CreatorsPage />} />
        <Route path="/creators/detail" element={<CreatorDetailPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/revenue" element={<RevenuePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/people" element={<PeoplePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/contracts" element={<ContractsPage />} />
        <Route path="/reminders" element={<RemindersPage />} />
        <Route path="/set-target" element={<SetTargetPage />} />
        <Route path="/leads/new" element={<NewLeadsPage />} />
        <Route path="/leads/contacted" element={<ContactedLeadsPage />} />
        <Route path="/leads/new-detail" element={<NewLeadDetailPage />} />
        <Route path="/leads/connected" element={<LeadConnectedPage />} />
        <Route path="/campaigns/detail" element={<CampaignDetailPage />} />
        <Route path="/campaigns/creator-list" element={<CampaignCreatorListPage />} />
        <Route path="/campaigns/assign" element={<CampaignAssignPage />} />
        <Route path="/campaigns/rating" element={<RatingCreatorPage />} />
        <Route path="/creators/find" element={<CreatorsFindPage />} />
        <Route path="/creators/shared-link" element={<CreatorsSharedLinkPage />} />
        <Route path="/creators/share-link-list" element={<ShareLinkListPage />} />
        <Route path="/creators/add-ons" element={<AddOnsMyCreatorsPage />} />
        <Route path="/creators/add-ons-editors" element={<AddOnsEditorsPage />} />
        <Route path="/creators/add-ons-videographers" element={<AddOnsVideographersPage />} />
        <Route path="/creators/my-detail" element={<CreatorDetailMyPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/payments/paid" element={<PaidPaymentSummaryPage />} />
        <Route path="/payments/barter" element={<BarterPaymentSummaryPage />} />
        <Route path="/payments/received" element={<PaymentsReceivedPage />} />
        <Route path="/polls/connect-lead" element={<ConnectLeadPollPage />} />
        <Route path="/polls/general" element={<GeneralPollPage />} />
        <Route path="/polls/result" element={<PollResultPage />} />
        <Route path="/polls/type" element={<PollTypePage />} />
        <Route path="/polls/interested" element={<InterestedPollPage />} />
        <Route path="/people/leaves" element={<LeavesPage />} />
        <Route path="/people/holidays" element={<AddHolidaysPage />} />
        <Route path="/people/apply-leave" element={<ApplyLeavePage />} />
        <Route path="/people/assign-creators" element={<AssignCreatorsPage />} />
        <Route path="/people/leave-request" element={<LeaveRequestPage />} />
        <Route path="/people/leaves-request" element={<LeavesRequestPage />} />
        <Route path="/people/leaves-tab" element={<PeopleLeavesPage />} />
        <Route path="/chat/influencer" element={<InfluencerChatRoomPage />} />
        <Route path="/chat/campaign" element={<CampaignChatRoomPage />} />
        <Route path="/chat/channel-created" element={<ChannelCreatedPage />} />
        <Route path="/chat/create-channel" element={<CreateChannelPage />} />
        <Route path="/calendar/all" element={<CalendarAllCreatorPage />} />
        <Route path="/calendar/shift" element={<CalendarShiftDatePage />} />
        <Route path="/calendar/brand" element={<CalendarBrandPage />} />
        <Route path="/people/apply-leaves" element={<ApplyLeavesPage />} />
        <Route path="/leads/create-paid" element={<CreateLeadPaidPage />} />
        <Route path="/leads/create-barter" element={<CreateLeadBarterPage />} />
        <Route path="/leads/contacted-detail" element={<ContactedLeadDetailPage />} />
        <Route path="/leads/new-search" element={<NewLeadSearchPage />} />
        <Route path="/campaigns/creator-detail-all" element={<CampCreatorDetailAllPage />} />
        <Route path="/campaigns/creator-detail-my" element={<CampCreatorDetailMyPage />} />
        <Route path="/settings/lead-distribution" element={<SettingsLeadDistPage />} />
        <Route path="/settings/collabs" element={<SettingsCollabsPage />} />
        <Route path="/leads/download" element={<LeadsDownloadPage />} />
        <Route path="/leads/creator-list" element={<NewLeadCreatorListPage />} />
        <Route path="/leads/add-creator" element={<AddCreatorPage />} />
        <Route path="/campaigns/brand-creator-list" element={<BrandCampaignCreatorListPage />} />
        <Route path="/settings/integration" element={<SettingsIntegrationPage />} />
        <Route path="/settings/add-members" element={<SettingsAddMembersPage />} />
        <Route path="/settings/collab" element={<SettingsCollabPage />} />
        <Route path="/polls/in-chat" element={<PollInChatPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
      </Route>
    </Routes>
  );
}
