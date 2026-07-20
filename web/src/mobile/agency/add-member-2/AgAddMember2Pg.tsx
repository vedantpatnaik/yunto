import {
  ArrowLeft,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Pencil,
  Plus,
  Users,
} from "lucide-react";

const CLASH = "'Clash Display', sans-serif";
const INTER = "Inter, sans-serif";
const URBANIST = "Urbanist, sans-serif";
const OUTFIT = "Outfit, sans-serif";
const IMG_PLACEHOLDER = "linear-gradient(135deg,#E9E4F0,#D9CFEA)";

export default function AgAddMember2Pg() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: 375,
        height: 946,
        background: "#FDFDFD",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* ===== Decorative background ellipses (behind everything) ===== */}
      <div style={{ position: "absolute", left: 3.8, top: 1891.1, width: 204.3, height: 196.5, borderRadius: "50%", background: "#FBB7C6" }} />
      <div style={{ position: "absolute", left: -4, top: 1798, width: 196.5, height: 191.1, borderRadius: "50%", background: "linear-gradient(135deg,#F3D29F,#EE9688)" }} />
      <div style={{ position: "absolute", left: 66.6, top: 612, width: 493.7, height: 488.6, borderRadius: "50%", background: "#FF90A9" }} />
      <div style={{ position: "absolute", left: 135.2, top: 457.6, width: 476.7, height: 473.2, borderRadius: "50%", background: "linear-gradient(135deg,#8673B3,#A79AC6)" }} />
      <div style={{ position: "absolute", left: -16.4, top: 167.5, width: 163.4, height: 157.1, borderRadius: "50%", background: "#CCF5FD" }} />
      <div style={{ position: "absolute", left: -25, top: 93, width: 157.1, height: 152.8, borderRadius: "50%", background: "linear-gradient(135deg,rgba(70,181,252,0.7),rgba(143,190,255,0.7))" }} />

      {/* Background image (Rectangle) */}
      <div style={{ position: "absolute", left: -13, top: 0, width: 402, height: 2045, background: IMG_PLACEHOLDER }} />

      {/* ===== Header nav bar ===== */}
      <div style={{ position: "absolute", left: 0, top: 70, width: 375, height: 54, background: "#FFFFFF", border: "1px solid #717171" }} />
      <div style={{ position: "absolute", left: 16, top: 85, width: 24, height: 24 }}>
        <ArrowLeft width={24} height={24} color="#000000" strokeWidth={2} />
      </div>
      <div style={{ position: "absolute", left: 44, top: 82, width: 298, height: 30, color: "#1B1B1C", fontFamily: CLASH, fontWeight: 500, fontSize: 20, lineHeight: "37px", textAlign: "left" }}>
        Team
      </div>

      {/* ===== Card 1: Team / Create a team / Operations ===== */}
      <div style={{ position: "absolute", left: 20, top: 136, width: 336, height: 212, background: "#FFFFFF", border: "1px solid #000000", borderRadius: 8 }} />
      {/* edit icon */}
      <div style={{ position: "absolute", left: 40, top: 152.5, width: 20, height: 20 }}>
        <Pencil width={16} height={16} color="#000000" strokeWidth={1.5} />
      </div>
      <div style={{ position: "absolute", left: 76, top: 152.5, width: 234, height: 20, color: "#242220", fontFamily: CLASH, fontWeight: 500, fontSize: 14, lineHeight: "20px" }}>
        Team
      </div>
      <div style={{ position: "absolute", left: 319, top: 156.5, width: 24, height: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ChevronDown width={16} height={12} color="#000000" />
      </div>

      {/* Create a team (yellow) */}
      <div style={{ position: "absolute", left: 37, top: 190, width: 303, height: 44, background: "#FFFAD7", border: "1px solid #000000", borderRadius: 8 }} />
      <div style={{ position: "absolute", left: 151, top: 202, width: 75, height: 20, color: "#000000", fontFamily: CLASH, fontWeight: 500, fontSize: 11, lineHeight: "20px", textAlign: "center" }}>
        Create a team
      </div>

      {/* Operations row */}
      <div style={{ position: "absolute", left: 37, top: 264, width: 303, height: 62, background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 8 }} />
      <div style={{ position: "absolute", left: 50, top: 275, width: 34, height: 34, background: "#ECC5F5", border: "1px solid #F8F8F8", borderRadius: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Users width={20} height={20} color="#000000" />
      </div>
      <div style={{ position: "absolute", left: 90, top: 271, width: 110, height: 24, color: "#000000", fontFamily: CLASH, fontWeight: 500, fontSize: 15, lineHeight: "24px" }}>
        Operations
      </div>
      <div style={{ position: "absolute", left: 189, top: 277, width: 12, height: 12 }}>
        <Pencil width={12} height={12} color="#000000" strokeWidth={1} />
      </div>
      <div style={{ position: "absolute", left: 313, top: 271, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <MoreVertical width={16} height={16} color="#000000" />
      </div>
      <div style={{ position: "absolute", left: 92, top: 289, width: 110, height: 24, color: "#000000", fontFamily: CLASH, fontWeight: 500, fontSize: 10, lineHeight: "24px" }}>
        Stellar Agency
      </div>

      {/* ===== Card 2: Team Members ===== */}
      <div style={{ position: "absolute", left: 24, top: 367, width: 336, height: 435, background: "#FFFFFF", border: "1px solid #000000", borderRadius: 8 }} />
      {/* Team Members header row */}
      <div style={{ position: "absolute", left: 41, top: 378, width: 303, height: 62, border: "1px solid #E5E7EB", borderRadius: 8 }} />
      <div style={{ position: "absolute", left: 41, top: 378, width: 139, height: 24, color: "#000000", fontFamily: CLASH, fontWeight: 500, fontSize: 15, lineHeight: "24px" }}>
        Team Members
      </div>
      <div style={{ position: "absolute", left: 317, top: 385, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <MoreVertical width={16} height={16} color="#000000" />
      </div>
      <div style={{ position: "absolute", left: 41, top: 401, width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Users width={16} height={16} color="#000000" />
      </div>
      <div style={{ position: "absolute", left: 62, top: 399, width: 110, height: 20, color: "#000000", fontFamily: CLASH, fontWeight: 500, fontSize: 10, lineHeight: "24px" }}>
        22 Members
      </div>
      <div style={{ position: "absolute", left: 254, top: 387, width: 86, height: 23, background: "#212020", border: "1px solid #131414", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#FFFDFD", fontFamily: CLASH, fontWeight: 500, fontSize: 10, lineHeight: "24px" }}>Add Members</span>
      </div>

      {/* Member 1: Sanjay Sharma */}
      <div style={{ position: "absolute", left: 41, top: 433, width: 303, height: 62, background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 8 }} />
      <div style={{ position: "absolute", left: 51, top: 441, width: 42, height: 42, background: IMG_PLACEHOLDER, border: "1px solid #373636", borderRadius: 9999 }} />
      <div style={{ position: "absolute", left: 106, top: 441, width: 110, height: 24, color: "#000000", fontFamily: CLASH, fontWeight: 500, fontSize: 15, lineHeight: "24px" }}>
        Sanjay Sharma
      </div>
      <div style={{ position: "absolute", left: 106, top: 460, width: 99, height: 23, color: "#000000", fontFamily: INTER, fontWeight: 400, fontSize: 10, lineHeight: "24px" }}>
        Operations
      </div>
      <div style={{ position: "absolute", left: 317, top: 440, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <MoreVertical width={16} height={16} color="#000000" />
      </div>
      <div style={{ position: "absolute", left: 226, top: 443, width: 53, height: 20, background: "#FFFFFF", border: "1px solid #000000", borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#4CCC16", fontFamily: INTER, fontWeight: 500, fontSize: 8, lineHeight: "16px" }}>Active</span>
      </div>

      {/* Member 2: Riya Verma */}
      <div style={{ position: "absolute", left: 41, top: 505, width: 303, height: 62, background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 8 }} />
      <div style={{ position: "absolute", left: 51, top: 513, width: 42, height: 42, background: IMG_PLACEHOLDER, border: "1px solid #373636", borderRadius: 9999 }} />
      <div style={{ position: "absolute", left: 106, top: 513, width: 110, height: 24, color: "#000000", fontFamily: CLASH, fontWeight: 500, fontSize: 15, lineHeight: "24px" }}>
        Riya Verma
      </div>
      <div style={{ position: "absolute", left: 106, top: 532, width: 99, height: 23, color: "#000000", fontFamily: INTER, fontWeight: 400, fontSize: 10, lineHeight: "24px" }}>
        Sales
      </div>
      <div style={{ position: "absolute", left: 317, top: 512, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <MoreVertical width={16} height={16} color="#000000" />
      </div>
      <div style={{ position: "absolute", left: 200, top: 515, width: 53, height: 20, background: "#FFFFFF", border: "1px solid #000000", borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#1D4ED8", fontFamily: INTER, fontWeight: 500, fontSize: 8, lineHeight: "16px" }}>Invite Sent</span>
      </div>

      {/* ===== Gray modal backdrop ===== */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 375, height: 946, background: "#7C7C7C" }} />

      {/* ===== Add Member modal ===== */}
      <div style={{ position: "absolute", left: 20, top: 196, width: 330, height: 627, background: "#FFFFFF", border: "1px solid #000000", borderRadius: 12 }} />

      {/* Modal title */}
      <div style={{ position: "absolute", left: 35, top: 212.5, width: 257, height: 22, color: "#111827", fontFamily: URBANIST, fontWeight: 600, fontSize: 15, lineHeight: "24px" }}>
        Add Member
      </div>

      {/* Send Invite pill */}
      <div style={{ position: "absolute", left: 212, top: 209, width: 95, height: 28, background: "#1B1B1B", borderRadius: 24 }} />
      <div style={{ position: "absolute", left: 220, top: 215, width: 59, height: 16, color: "#FFF9F9", fontFamily: OUTFIT, fontWeight: 400, fontSize: 12, lineHeight: "16px" }}>
        Send Invite
      </div>
      <div style={{ position: "absolute", left: 282, top: 215, width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ArrowUp width={12} height={12} color="#FFF9F9" strokeWidth={2} />
      </div>

      {/* Plus button */}
      <div style={{ position: "absolute", left: 312, top: 209, width: 28, height: 28, background: "#FFFFFF", border: "1px solid #D4D4D4", borderRadius: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Plus width={17} height={17} color="#000000" />
      </div>

      {/* Inputs: name / email / contact number */}
      <div style={{ position: "absolute", left: 31, top: 252.5, width: 309, height: 34, background: "#FAFAFA", border: "1px solid #E5E7EB", borderRadius: 8 }} />
      <div style={{ position: "absolute", left: 37, top: 261.5, width: 65, height: 16, color: "#7F7F7F", fontFamily: INTER, fontWeight: 400, fontSize: 12, lineHeight: "16px" }}>
        Enter name
      </div>
      <div style={{ position: "absolute", left: 31, top: 296.5, width: 309, height: 34, background: "#FAFAFA", border: "1px solid #E5E7EB", borderRadius: 8 }} />
      <div style={{ position: "absolute", left: 37, top: 305.5, width: 113, height: 16, color: "#7F7F7F", fontFamily: INTER, fontWeight: 400, fontSize: 12, lineHeight: "16px" }}>
        Enter email address
      </div>
      <div style={{ position: "absolute", left: 31, top: 340.5, width: 309, height: 34, background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 8 }} />
      <div style={{ position: "absolute", left: 43, top: 345.5, width: 265, height: 24, color: "#000000", fontFamily: INTER, fontWeight: 400, fontSize: 12, lineHeight: "24px" }}>
        Contact Number
      </div>

      {/* Permission heading */}
      <div style={{ position: "absolute", left: 31, top: 389, width: 99, height: 22, color: "#040404", fontFamily: INTER, fontWeight: 500, fontSize: 13, lineHeight: "24px" }}>
        Permission
      </div>

      {/* Permission dropdown (overlapping designs kept as-is) */}
      <div style={{ position: "absolute", left: 31, top: 416, width: 304, height: 38, background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 8 }} />
      <div style={{ position: "absolute", left: 31, top: 416, width: 309, height: 38, background: "#FFFFFF", border: "1px solid #F0EFF1", borderRadius: 8 }} />
      <div style={{ position: "absolute", left: 43, top: 423, width: 102, height: 24, color: "#000000", fontFamily: INTER, fontWeight: 400, fontSize: 13, lineHeight: "24px" }}>
        Sales
      </div>
      <div style={{ position: "absolute", left: 312, top: 427, width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ChevronDown width={12} height={8} color="#000000" strokeWidth={2.5} />
      </div>

      {/* Advance Settings section */}
      <div style={{ position: "absolute", left: 31, top: 465, width: 309, height: 269, background: "#FFFFFF", border: "1px solid #000000", borderRadius: 8 }} />
      <div style={{ position: "absolute", left: 43, top: 472, width: 114, height: 24, color: "#000000", fontFamily: INTER, fontWeight: 500, fontSize: 13, lineHeight: "24px" }}>
        Advance Settings
      </div>
      <div style={{ position: "absolute", left: 311, top: 476, width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ChevronUp width={12} height={8} color="#000000" strokeWidth={2.5} />
      </div>

      {/* Permission toggle rows */}
      {/* Row 1: Team Lead */}
      <div style={{ position: "absolute", left: 43, top: 508, width: 201, height: 24, color: "#000000", fontFamily: CLASH, fontWeight: 500, fontSize: 15, lineHeight: "24px" }}>
        Team Lead
      </div>
      <div style={{ position: "absolute", left: 43, top: 532, width: 201, height: 24, color: "#000000", fontFamily: INTER, fontWeight: 400, fontSize: 10, lineHeight: "24px" }}>
        Manage team and view team analytics
      </div>
      <div style={{ position: "absolute", left: 276, top: 519.5, width: 51, height: 26, background: "#E1DFDF", borderRadius: 15.5 }} />
      <div style={{ position: "absolute", left: 278, top: 521.5, width: 24, height: 22, background: "#FFFFFF", borderRadius: 13.5 }} />

      {/* Row 2: Add team members */}
      <div style={{ position: "absolute", left: 43, top: 564, width: 201, height: 24, color: "#000000", fontFamily: CLASH, fontWeight: 500, fontSize: 15, lineHeight: "24px" }}>
        Add team members
      </div>
      <div style={{ position: "absolute", left: 43, top: 588, width: 201, height: 24, color: "#000000", fontFamily: INTER, fontWeight: 400, fontSize: 10, lineHeight: "24px" }}>
        Add team members &amp; managing
      </div>
      <div style={{ position: "absolute", left: 276, top: 575.5, width: 51, height: 26, background: "#E1DFDF", borderRadius: 15.5 }} />
      <div style={{ position: "absolute", left: 278, top: 577.5, width: 24, height: 22, background: "#FFFFFF", borderRadius: 13.5 }} />

      {/* Row 3: Delete Leads */}
      <div style={{ position: "absolute", left: 43, top: 620, width: 201, height: 24, color: "#000000", fontFamily: CLASH, fontWeight: 500, fontSize: 15, lineHeight: "24px" }}>
        Delete Leads
      </div>
      <div style={{ position: "absolute", left: 43, top: 644, width: 201, height: 24, color: "#000000", fontFamily: INTER, fontWeight: 400, fontSize: 10, lineHeight: "24px" }}>
        Allow users to permanently delete leads
      </div>
      <div style={{ position: "absolute", left: 276, top: 631.5, width: 51, height: 26, background: "#E1DFDF", borderRadius: 15.5 }} />
      <div style={{ position: "absolute", left: 278, top: 633.5, width: 24, height: 22, background: "#FFFFFF", borderRadius: 13.5 }} />

      {/* Row 4: Manage Integrations */}
      <div style={{ position: "absolute", left: 43, top: 676, width: 201, height: 24, color: "#000000", fontFamily: CLASH, fontWeight: 500, fontSize: 15, lineHeight: "24px" }}>
        Manage Integrations
      </div>
      <div style={{ position: "absolute", left: 43, top: 700, width: 201, height: 24, color: "#000000", fontFamily: INTER, fontWeight: 400, fontSize: 10, lineHeight: "24px" }}>
        Connect or disconnect third-party tools
      </div>
      <div style={{ position: "absolute", left: 276, top: 687.5, width: 51, height: 26, background: "#E1DFDF", borderRadius: 15.5 }} />
      <div style={{ position: "absolute", left: 278, top: 689.5, width: 24, height: 22, background: "#FFFFFF", borderRadius: 13.5 }} />

      {/* Save Permissions button */}
      <div style={{ position: "absolute", left: 40, top: 749, width: 284, height: 48, background: "#B7D0EE", border: "1px solid #000000", borderRadius: 16 }} />
      <div style={{ position: "absolute", left: 97, top: 765, width: 170, height: 16, color: "#333333", fontFamily: CLASH, fontWeight: 500, fontSize: 15, lineHeight: "18.5px", textAlign: "center" }}>
        Save Permissions
      </div>
    </div>
  );
}
