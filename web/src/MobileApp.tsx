import { Routes, Route, Navigate } from "react-router-dom";
import { MobileFrame } from "./mobile/MobileFrame";
// AGENCY screen imports — appended by the mobile build workflow
import SalesHomePage from "@/mobile/agency/sales-home/SalesHomePage";
import AdminHomePage from "@/mobile/agency/admin-home/AdminHomePage";
import AgencyCampaignPage from "@/mobile/agency/campaign/AgencyCampaignPage";
import AgencyProfilePage from "@/mobile/agency/profile/AgencyProfilePage";
import AgencyCreatorsPage from "@/mobile/agency/creators/AgencyCreatorsPage";
import AgencyChatPage from "@/mobile/agency/chat/AgencyChatPage";
import AgencyLeadsPage from "@/mobile/agency/leads/AgencyLeadsPage";
import OperationHomePage from "@/mobile/agency/operation-home/OperationHomePage";
import AgencyAddCreatorPage from "@/mobile/agency/add-creator/AgencyAddCreatorPage";
import AddCreatorsPage from "@/mobile/agency/add-creators/AddCreatorsPage";
import AddMemberPage from "@/mobile/agency/add-member/AddMemberPage";
import AgencyAddRemindersPage from "@/mobile/agency/add-reminders/AgencyAddRemindersPage";
import AgencyActiveCampaignsPg from "@/mobile/agency/active-campaigns/AgencyActiveCampaignsPg";
import AgencyAddleadPg from "@/mobile/agency/addlead/AgencyAddleadPg";
import AgencyAdminSetTargetPg from "@/mobile/agency/admin-set-target/AgencyAdminSetTargetPg";
import AgencyManagerAppPg from "@/mobile/agency/agency-manager-app/AgencyManagerAppPg";
import AgencyAllCreatorsPg from "@/mobile/agency/all-creators/AgencyAllCreatorsPg";
import AgencyAssignCreatorsPg from "@/mobile/agency/assign-creators/AgencyAssignCreatorsPg";
import AgencyBrandInfoPg from "@/mobile/agency/brand-info/AgencyBrandInfoPg";
import AgAllRequestsPg from "@/mobile/agency/all-requests/AgAllRequestsPg";
import AgCreatorProfilePg from "@/mobile/agency/creator-profile/AgCreatorProfilePg";
import AgDetailSalesOperationsPg from "@/mobile/agency/detail-sales-operations/AgDetailSalesOperationsPg";
import AgDetailViewOperationsPg from "@/mobile/agency/detail-view-operations/AgDetailViewOperationsPg";
import AgDetailViewSalesPg from "@/mobile/agency/detail-view-sales/AgDetailViewSalesPg";
import AgEditProfilePg from "@/mobile/agency/edit-profile/AgEditProfilePg";
import AgEditorPg from "@/mobile/agency/editor/AgEditorPg";
import AgDeleteTeamsPg from "@/mobile/agency/delete-teams/AgDeleteTeamsPg";
import AgencyRemindersPg from "@/mobile/agency/reminders/AgencyRemindersPg";
import AgAddCreators2Pg from "@/mobile/agency/add-creators-2/AgAddCreators2Pg";
import AgAddLeadBarterCampaignPg from "@/mobile/agency/add-lead-barter-campaign/AgAddLeadBarterCampaignPg";
import AgAddLeadPaidCampaignPg from "@/mobile/agency/add-lead-paid-campaign/AgAddLeadPaidCampaignPg";
import AgAddMember2Pg from "@/mobile/agency/add-member-2/AgAddMember2Pg";
import AgAddlead2Pg from "@/mobile/agency/addlead-2/AgAddlead2Pg";
import AgAdminSetTarget2Pg from "@/mobile/agency/admin-set-target-2/AgAdminSetTarget2Pg";
import AgAssignCreators2Pg from "@/mobile/agency/assign-creators-2/AgAssignCreators2Pg";
import AgBrandInfo2Pg from "@/mobile/agency/brand-info-2/AgBrandInfo2Pg";
import AgBrandInfo3Pg from "@/mobile/agency/brand-info-3/AgBrandInfo3Pg";
import AgCampaign2Pg from "@/mobile/agency/campaign-2/AgCampaign2Pg";
import AgCreatorProfile2Pg from "@/mobile/agency/creator-profile-2/AgCreatorProfile2Pg";
import AgCreators10Pg from "@/mobile/agency/creators-10/AgCreators10Pg";
import AgCreatorsDetailPg from "@/mobile/agency/creators-detail/AgCreatorsDetailPg";
import AgEditorsDetails2Pg from "@/mobile/agency/editors-details-2/AgEditorsDetails2Pg";
import AgLeadExpanded2Pg from "@/mobile/agency/lead-expanded-2/AgLeadExpanded2Pg";
import AgLeadsDetails2Pg from "@/mobile/agency/leads-details-2/AgLeadsDetails2Pg";
import AgLeadsNotesPg from "@/mobile/agency/leads-notes/AgLeadsNotesPg";
import AgLeaves2Pg from "@/mobile/agency/leaves-2/AgLeaves2Pg";
import AgLogoutPg from "@/mobile/agency/logout/AgLogoutPg";
import AgMessagePg from "@/mobile/agency/message/AgMessagePg";
import AgNotificationPg from "@/mobile/agency/notification/AgNotificationPg";
import AgOnboarding2Pg from "@/mobile/agency/onboarding-2/AgOnboarding2Pg";
import AgOperaionsTeamOn2Pg from "@/mobile/agency/operaions-team-on-2/AgOperaionsTeamOn2Pg";
import AgOperationsDetailViewPg from "@/mobile/agency/operations-detail-view/AgOperationsDetailViewPg";
import AgOperationsPg from "@/mobile/agency/operations/AgOperationsPg";
import AgPeople2Pg from "@/mobile/agency/people-2/AgPeople2Pg";
import AgPersonalInformationPg from "@/mobile/agency/personal-information/AgPersonalInformationPg";
import AgProfileInfo2Pg from "@/mobile/agency/profile-info-2/AgProfileInfo2Pg";
import AgSalesOperations2Pg from "@/mobile/agency/sales-operations-2/AgSalesOperations2Pg";
import AgSalesTeamOnPg from "@/mobile/agency/sales-team-on/AgSalesTeamOnPg";
import AgSalesPg from "@/mobile/agency/sales/AgSalesPg";
import AgSelectedCreators2Pg from "@/mobile/agency/selected-creators-2/AgSelectedCreators2Pg";
import AgSortBy2Pg from "@/mobile/agency/sort-by-2/AgSortBy2Pg";
import AgTargetPg from "@/mobile/agency/target/AgTargetPg";
import AgSalesTeamPg from "@/mobile/agency/sales-team/AgSalesTeamPg";
import AgReminder2Pg from "@/mobile/agency/reminder-2/AgReminder2Pg";
import AgTeamCreation2Pg from "@/mobile/agency/team-creation-2/AgTeamCreation2Pg";
import AgTeamDeletePg from "@/mobile/agency/team-delete/AgTeamDeletePg";
import AgTeamManagement3Pg from "@/mobile/agency/team-management-3/AgTeamManagement3Pg";
import AgTeamPg from "@/mobile/agency/team/AgTeamPg";
import AgTeamsPeople2Pg from "@/mobile/agency/teams-people-2/AgTeamsPeople2Pg";
import AgVideographer2Pg from "@/mobile/agency/videographer-2/AgVideographer2Pg";
import AgVideographers2Pg from "@/mobile/agency/videographers-2/AgVideographers2Pg";
import AgVideographersDetails2Pg from "@/mobile/agency/videographers-details-2/AgVideographersDetails2Pg";
// INFLUENCER screen imports — appended by the mobile build workflow

/**
 * Mobile app router (Agency + Influencer, 390px). Mounted at /m/* from App.tsx.
 * The build workflow adds imports above and <Route> entries below.
 */
export default function MobileApp() {
  return (
    <MobileFrame>
      <Routes>
        {/* AGENCY routes */}
        <Route path="agency/sales-home" element={<SalesHomePage />} />
        <Route path="agency/admin-home" element={<AdminHomePage />} />
        <Route path="agency/campaign" element={<AgencyCampaignPage />} />
        <Route path="agency/profile" element={<AgencyProfilePage />} />
        <Route path="agency/creators" element={<AgencyCreatorsPage />} />
        <Route path="agency/chat" element={<AgencyChatPage />} />
        <Route path="agency/leads" element={<AgencyLeadsPage />} />
        <Route path="agency/operation-home" element={<OperationHomePage />} />
        <Route path="agency/add-creator" element={<AgencyAddCreatorPage />} />
        <Route path="agency/add-creators" element={<AddCreatorsPage />} />
        <Route path="agency/add-member" element={<AddMemberPage />} />
        <Route path="agency/add-reminders" element={<AgencyAddRemindersPage />} />
        <Route path="agency/active-campaigns" element={<AgencyActiveCampaignsPg />} />
        <Route path="agency/addlead" element={<AgencyAddleadPg />} />
        <Route path="agency/admin-set-target" element={<AgencyAdminSetTargetPg />} />
        <Route path="agency/agency-manager-app" element={<AgencyManagerAppPg />} />
        <Route path="agency/all-creators" element={<AgencyAllCreatorsPg />} />
        <Route path="agency/assign-creators" element={<AgencyAssignCreatorsPg />} />
        <Route path="agency/brand-info" element={<AgencyBrandInfoPg />} />
        <Route path="agency/all-requests" element={<AgAllRequestsPg />} />
        <Route path="agency/creator-profile" element={<AgCreatorProfilePg />} />
        <Route path="agency/detail-sales-operations" element={<AgDetailSalesOperationsPg />} />
        <Route path="agency/detail-view-operations" element={<AgDetailViewOperationsPg />} />
        <Route path="agency/detail-view-sales" element={<AgDetailViewSalesPg />} />
        <Route path="agency/edit-profile" element={<AgEditProfilePg />} />
        <Route path="agency/editor" element={<AgEditorPg />} />
        <Route path="agency/delete-teams" element={<AgDeleteTeamsPg />} />
        <Route path="agency/reminders" element={<AgencyRemindersPg />} />
        <Route path="agency/add-creators-2" element={<AgAddCreators2Pg />} />
        <Route path="agency/add-lead-barter-campaign" element={<AgAddLeadBarterCampaignPg />} />
        <Route path="agency/add-lead-paid-campaign" element={<AgAddLeadPaidCampaignPg />} />
        <Route path="agency/add-member-2" element={<AgAddMember2Pg />} />
        <Route path="agency/addlead-2" element={<AgAddlead2Pg />} />
        <Route path="agency/admin-set-target-2" element={<AgAdminSetTarget2Pg />} />
        <Route path="agency/assign-creators-2" element={<AgAssignCreators2Pg />} />
        <Route path="agency/brand-info-2" element={<AgBrandInfo2Pg />} />
        <Route path="agency/brand-info-3" element={<AgBrandInfo3Pg />} />
        <Route path="agency/campaign-2" element={<AgCampaign2Pg />} />
        <Route path="agency/creator-profile-2" element={<AgCreatorProfile2Pg />} />
        <Route path="agency/creators-10" element={<AgCreators10Pg />} />
        <Route path="agency/creators-detail" element={<AgCreatorsDetailPg />} />
        <Route path="agency/editors-details-2" element={<AgEditorsDetails2Pg />} />
        <Route path="agency/lead-expanded-2" element={<AgLeadExpanded2Pg />} />
        <Route path="agency/leads-details-2" element={<AgLeadsDetails2Pg />} />
        <Route path="agency/leads-notes" element={<AgLeadsNotesPg />} />
        <Route path="agency/leaves-2" element={<AgLeaves2Pg />} />
        <Route path="agency/logout" element={<AgLogoutPg />} />
        <Route path="agency/message" element={<AgMessagePg />} />
        <Route path="agency/notification" element={<AgNotificationPg />} />
        <Route path="agency/onboarding-2" element={<AgOnboarding2Pg />} />
        <Route path="agency/operaions-team-on-2" element={<AgOperaionsTeamOn2Pg />} />
        <Route path="agency/operations-detail-view" element={<AgOperationsDetailViewPg />} />
        <Route path="agency/operations" element={<AgOperationsPg />} />
        <Route path="agency/people-2" element={<AgPeople2Pg />} />
        <Route path="agency/personal-information" element={<AgPersonalInformationPg />} />
        <Route path="agency/profile-info-2" element={<AgProfileInfo2Pg />} />
        <Route path="agency/sales-operations-2" element={<AgSalesOperations2Pg />} />
        <Route path="agency/sales-team-on" element={<AgSalesTeamOnPg />} />
        <Route path="agency/sales" element={<AgSalesPg />} />
        <Route path="agency/selected-creators-2" element={<AgSelectedCreators2Pg />} />
        <Route path="agency/sort-by-2" element={<AgSortBy2Pg />} />
        <Route path="agency/target" element={<AgTargetPg />} />
        <Route path="agency/sales-team" element={<AgSalesTeamPg />} />
        <Route path="agency/reminder-2" element={<AgReminder2Pg />} />
        <Route path="agency/team-creation-2" element={<AgTeamCreation2Pg />} />
        <Route path="agency/team-delete" element={<AgTeamDeletePg />} />
        <Route path="agency/team-management-3" element={<AgTeamManagement3Pg />} />
        <Route path="agency/team" element={<AgTeamPg />} />
        <Route path="agency/teams-people-2" element={<AgTeamsPeople2Pg />} />
        <Route path="agency/videographer-2" element={<AgVideographer2Pg />} />
        <Route path="agency/videographers-2" element={<AgVideographers2Pg />} />
        <Route path="agency/videographers-details-2" element={<AgVideographersDetails2Pg />} />
        {/* INFLUENCER routes */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </MobileFrame>
  );
}
