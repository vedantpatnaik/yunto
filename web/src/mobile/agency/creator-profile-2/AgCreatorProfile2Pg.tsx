import {
  Instagram,
  ChevronDown,
  Users,
  Eye,
  Heart,
  Target,
  Check,
  ShoppingBag,
  Video,
  Scissors,
  Send,
  MessageCircle,
  FileText,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";

export default function AgCreatorProfile2Pg() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: 375,
        height: 876,
        background: "#F8F5EF",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* ================= PROFILE CARD ================= */}
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 106,
          width: 343,
          height: 185,
          background:
            "linear-gradient(135deg, #F2EDFF, rgba(255,255,255,0.6), rgba(255,236,243,0.6))",
          borderRadius: 28,
        }}
      />

      {/* Avatar image placeholder */}
      <div
        style={{
          position: "absolute",
          left: 36,
          top: 135.8,
          width: 54.2,
          height: 56,
          borderRadius: 9999,
          border: "2px solid #FFFFFF",
          background: "linear-gradient(135deg,#E9E4F0,#D9CFEA)",
        }}
      />
      {/* Avatar badge circle */}
      <div
        style={{
          position: "absolute",
          left: 74.2,
          top: 175.8,
          width: 20,
          height: 20,
          background: "#FFFFFF",
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 79.2,
          top: 180.8,
          width: 10,
          height: 10,
        }}
      >
        <Instagram size={10} color="#141311" strokeWidth={1} />
      </div>

      {/* Name */}
      <div
        style={{
          position: "absolute",
          left: 104.2,
          top: 125,
          width: 121.2,
          height: 23,
          color: "#141311",
          fontFamily: "Inter, sans-serif",
          fontWeight: 800,
          fontSize: 18,
          lineHeight: "22.5px",
        }}
      >
        Leena Sharma
      </div>
      {/* Handle */}
      <div
        style={{
          position: "absolute",
          left: 104.2,
          top: 148,
          width: 84.4,
          height: 16,
          color: "#8C8A84",
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 12,
          lineHeight: "16px",
        }}
      >
        @leenasharma
      </div>

      {/* Lifestyle pill */}
      <div
        style={{
          position: "absolute",
          left: 104.2,
          top: 175,
          width: 56,
          height: 20,
          background: "#FFFFFF",
          border: "1px solid #E8E5DF",
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 113.2,
          top: 178,
          width: 38,
          height: 14,
          color: "#141311",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 9,
          lineHeight: "13.5px",
        }}
      >
        Lifestyle
      </div>
      {/* Paid Campaign pill */}
      <div
        style={{
          position: "absolute",
          left: 166.2,
          top: 168.5,
          width: 79.4,
          height: 33,
          background: "#FFFFFF",
          border: "1px solid #E8E5DF",
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 175.2,
          top: 171.5,
          width: 44.8,
          height: 27,
          color: "#141311",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 9,
          lineHeight: "13.5px",
          whiteSpace: "pre-line",
        }}
      >
        {"Paid\nCampaign"}
      </div>

      {/* Status pill (dark) */}
      <div
        style={{
          position: "absolute",
          left: 265,
          top: 148.2,
          width: 74,
          height: 31,
          background: "#141311",
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 277,
          top: 156.2,
          width: 34,
          height: 15,
          color: "#FAF7F2",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 10,
          lineHeight: "15px",
        }}
      >
        Status
      </div>
      <div
        style={{
          position: "absolute",
          left: 317,
          top: 158.8,
          width: 10,
          height: 10,
        }}
      >
        <ChevronDown size={10} color="#FAF7F2" strokeWidth={1} />
      </div>

      {/* Campaign / Deadline / Budget white strip */}
      <div
        style={{
          position: "absolute",
          left: 36,
          top: 217.5,
          width: 303,
          height: 53.5,
          background: "#FFFFFF",
          borderRadius: 18,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 48,
          top: 229.5,
          width: 51.5,
          height: 14,
          color: "#8C8A84",
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 9,
          lineHeight: "13.5px",
        }}
      >
        CAMPAIGN
      </div>
      <div
        style={{
          position: "absolute",
          left: 48,
          top: 243,
          width: 64,
          height: 16,
          color: "#141311",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 12,
          lineHeight: "16px",
        }}
      >
        Zostel Trip
      </div>
      <div
        style={{
          position: "absolute",
          left: 184.8,
          top: 229.5,
          width: 47.9,
          height: 14,
          color: "#8C8A84",
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 9,
          lineHeight: "13.5px",
          textAlign: "right",
        }}
      >
        DEADLINE
      </div>
      <div
        style={{
          position: "absolute",
          left: 155.9,
          top: 243,
          width: 76.8,
          height: 16,
          color: "#141311",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 12,
          lineHeight: "16px",
          textAlign: "right",
        }}
      >
        Aug 12, 2025
      </div>
      <div
        style={{
          position: "absolute",
          left: 287.3,
          top: 229.5,
          width: 39.7,
          height: 14,
          color: "#8C8A84",
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 9,
          lineHeight: "13.5px",
          textAlign: "right",
        }}
      >
        BUDGET
      </div>
      <div
        style={{
          position: "absolute",
          left: 276.6,
          top: 243,
          width: 50.3,
          height: 16,
          color: "#141311",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 12,
          lineHeight: "16px",
          textAlign: "right",
        }}
      >
        ₹80,000
      </div>

      {/* ================= CREATOR ANALYTICS ================= */}
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 311,
          width: 343,
          height: 20,
          color: "#141311",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 14,
          lineHeight: "20px",
        }}
      >
        Creator Analytics
      </div>

      {/* Analytics card 1 - Followers */}
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 343,
          width: 165.5,
          height: 102,
          background: "#E9F6ED",
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 30,
          top: 360,
          width: 58.9,
          height: 14,
          color: "#8C8A84",
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 9,
          lineHeight: "13.5px",
        }}
      >
        FOLLOWERS
      </div>
      <div
        style={{
          position: "absolute",
          left: 147.5,
          top: 357,
          width: 20,
          height: 20,
          background: "#FFFFFF",
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 153,
          top: 362.5,
          width: 9,
          height: 9,
        }}
      >
        <Users size={9} color="#141311" strokeWidth={0.75} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 30,
          top: 383,
          width: 137.5,
          height: 28,
          color: "#141311",
          fontFamily: "Inter, sans-serif",
          fontWeight: 800,
          fontSize: 20,
          lineHeight: "28px",
        }}
      >
        1.2M
      </div>
      <div
        style={{
          position: "absolute",
          left: 30,
          top: 417,
          width: 137.5,
          height: 14,
          color: "#23C16B",
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: 9,
          lineHeight: "13.5px",
        }}
      >
        +8.4% this month
      </div>

      {/* Analytics card 2 - Avg Views */}
      <div
        style={{
          position: "absolute",
          left: 193.5,
          top: 343,
          width: 165.5,
          height: 102,
          background: "#F2EDFF",
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 207.5,
          top: 360,
          width: 53.5,
          height: 14,
          color: "#8C8A84",
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 9,
          lineHeight: "13.5px",
        }}
      >
        AVG VIEWS
      </div>
      <div
        style={{
          position: "absolute",
          left: 325,
          top: 357,
          width: 20,
          height: 20,
          background: "#FFFFFF",
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 330.5,
          top: 362.5,
          width: 9,
          height: 9,
        }}
      >
        <Eye size={9} color="#141311" strokeWidth={0.75} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 207.5,
          top: 383,
          width: 137.5,
          height: 28,
          color: "#141311",
          fontFamily: "Inter, sans-serif",
          fontWeight: 800,
          fontSize: 20,
          lineHeight: "28px",
        }}
      >
        840K
      </div>
      <div
        style={{
          position: "absolute",
          left: 207.5,
          top: 417,
          width: 137.5,
          height: 14,
          color: "#8C8A84",
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: 9,
          lineHeight: "13.5px",
        }}
      >
        per reel avg
      </div>

      {/* Analytics card 3 - Engagement */}
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 456.5,
          width: 165.5,
          height: 102,
          background: "#FFECF3",
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 30,
          top: 473.5,
          width: 67.4,
          height: 14,
          color: "#8C8A84",
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 9,
          lineHeight: "13.5px",
        }}
      >
        ENGAGEMENT
      </div>
      <div
        style={{
          position: "absolute",
          left: 147.5,
          top: 470.5,
          width: 20,
          height: 20,
          background: "#FFFFFF",
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 153,
          top: 476,
          width: 9,
          height: 9,
        }}
      >
        <Heart size={9} color="#141311" strokeWidth={0.75} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 30,
          top: 496.5,
          width: 137.5,
          height: 28,
          color: "#141311",
          fontFamily: "Inter, sans-serif",
          fontWeight: 800,
          fontSize: 20,
          lineHeight: "28px",
        }}
      >
        4.2%
      </div>
      <div
        style={{
          position: "absolute",
          left: 30,
          top: 530.5,
          width: 137.5,
          height: 14,
          color: "#23C16B",
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: 9,
          lineHeight: "13.5px",
        }}
      >
        +0.6% vs last
      </div>

      {/* Analytics card 4 - Est Reach */}
      <div
        style={{
          position: "absolute",
          left: 193.5,
          top: 456.5,
          width: 165.5,
          height: 102,
          background: "#F7F3EA",
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 207.5,
          top: 473.5,
          width: 56.6,
          height: 14,
          color: "#8C8A84",
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 9,
          lineHeight: "13.5px",
        }}
      >
        EST. REACH
      </div>
      <div
        style={{
          position: "absolute",
          left: 325,
          top: 470.5,
          width: 20,
          height: 20,
          background: "#FFFFFF",
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 330.5,
          top: 476,
          width: 9,
          height: 9,
        }}
      >
        <Target size={9} color="#141311" strokeWidth={0.75} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 207.5,
          top: 496.5,
          width: 137.5,
          height: 28,
          color: "#141311",
          fontFamily: "Inter, sans-serif",
          fontWeight: 800,
          fontSize: 20,
          lineHeight: "28px",
        }}
      >
        2.1M
      </div>
      <div
        style={{
          position: "absolute",
          left: 207.5,
          top: 530.5,
          width: 137.5,
          height: 14,
          color: "#8C8A84",
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: 9,
          lineHeight: "13.5px",
        }}
      >
        this campaign
      </div>

      {/* ================= DELIVERABLES ================= */}
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 579.5,
          width: 80.8,
          height: 20,
          color: "#141311",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 14,
          lineHeight: "20px",
        }}
      >
        Deliverables
      </div>
      <div
        style={{
          position: "absolute",
          left: 283.5,
          top: 578,
          width: 75.5,
          height: 23,
          background: "#E9F6ED",
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 293.5,
          top: 582,
          width: 55.5,
          height: 15,
          color: "#23C16B",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 10,
          lineHeight: "15px",
        }}
      >
        2 of 3 Done
      </div>
      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 613,
          width: 343,
          height: 6,
          background: "#E8E5DF",
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 613,
          width: 226.4,
          height: 6,
          background: "#141311",
          borderRadius: 9999,
        }}
      />
      {/* Deliverables card bg */}
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 631,
          width: 343,
          height: 163,
          background:
            "linear-gradient(135deg, rgba(242,237,255,0.7), rgba(255,255,255,0.6))",
          borderRadius: 22,
        }}
      />
      {/* Deliverable item 1 */}
      <div
        style={{
          position: "absolute",
          left: 32,
          top: 647,
          width: 311,
          height: 53.5,
          background: "#FFFFFF",
          borderRadius: 14,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 44,
          top: 663.8,
          width: 20,
          height: 20,
          background: "#23C16B",
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 49,
          top: 668.8,
          width: 10,
          height: 10,
        }}
      >
        <Check size={10} color="#FAF7F2" strokeWidth={0.83} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 76,
          top: 659,
          width: 204,
          height: 16,
          color: "#141311",
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 12,
          lineHeight: "16px",
        }}
      >
        1x Instagram Reel{" "}
      </div>
      <div
        style={{
          position: "absolute",
          left: 76,
          top: 674.5,
          width: 72,
          height: 14,
          color: "#8C8A84",
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 9,
          lineHeight: "13.5px",
        }}
      >
        Submitted Jul 28
      </div>
      <div
        style={{
          position: "absolute",
          left: 292,
          top: 664.8,
          width: 39,
          height: 18,
          background: "#E9F6ED",
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 300,
          top: 666.8,
          width: 23,
          height: 14,
          color: "#23C16B",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 9,
          lineHeight: "13.5px",
        }}
      >
        Done
      </div>
      {/* Deliverable item 2 */}
      <div
        style={{
          position: "absolute",
          left: 32,
          top: 708.5,
          width: 311,
          height: 69.5,
          background: "#FFFFFF",
          borderRadius: 14,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 44,
          top: 733.2,
          width: 20,
          height: 20,
          background: "#23C16B",
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 49,
          top: 738.2,
          width: 10,
          height: 10,
        }}
      >
        <Check size={10} color="#FAF7F2" strokeWidth={0.83} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 76,
          top: 720.5,
          width: 204,
          height: 32,
          color: "#141311",
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 12,
          lineHeight: "16px",
          whiteSpace: "pre-line",
        }}
      >
        {"2x Instagram Stories — Discount\nCode"}
      </div>
      <div
        style={{
          position: "absolute",
          left: 76,
          top: 752,
          width: 69,
          height: 14,
          color: "#8C8A84",
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 9,
          lineHeight: "13.5px",
        }}
      >
        Submitted Aug 1
      </div>
      <div
        style={{
          position: "absolute",
          left: 292,
          top: 734.2,
          width: 39,
          height: 18,
          background: "#E9F6ED",
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 300,
          top: 736.2,
          width: 23,
          height: 14,
          color: "#23C16B",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 9,
          lineHeight: "13.5px",
        }}
      >
        Done
      </div>

      {/* ================= ADD-ONS ================= */}
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 814,
          width: 343,
          height: 184,
          background:
            "linear-gradient(135deg, rgba(232,243,255,0.7), rgba(255,255,255,0.5))",
          borderRadius: 22,
        }}
      />
      {/* Add-ons header */}
      <div
        style={{
          position: "absolute",
          left: 32,
          top: 830,
          width: 24,
          height: 24,
          background: "#FFFFFF",
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 38.5,
          top: 836.5,
          width: 11,
          height: 11,
        }}
      >
        <ShoppingBag size={11} color="#141311" strokeWidth={0.92} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 64,
          top: 834,
          width: 48.9,
          height: 16,
          color: "#141311",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 12,
          lineHeight: "16px",
        }}
      >
        Add-ons
      </div>
      <div
        style={{
          position: "absolute",
          left: 330,
          top: 835.5,
          width: 13,
          height: 13,
        }}
      >
        <ChevronDown size={13} color="#8C8A84" strokeWidth={1.08} />
      </div>
      {/* Add-on item 1 */}
      <div
        style={{
          position: "absolute",
          left: 32,
          top: 868,
          width: 311,
          height: 52,
          background: "#FFFFFF",
          borderRadius: 12,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 42,
          top: 888,
          width: 12,
          height: 12,
        }}
      >
        <Video size={12} color="#8C8A84" strokeWidth={1} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 66,
          top: 878,
          width: 119,
          height: 32,
          color: "#141311",
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 12,
          lineHeight: "16px",
          whiteSpace: "pre-line",
        }}
      >
        {"Videographer\nOn-Site Shoot"}
      </div>
      <div
        style={{
          position: "absolute",
          left: 291,
          top: 886,
          width: 42,
          height: 16,
          color: "#141311",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 12,
          lineHeight: "16px",
        }}
      >
        ₹5,000
      </div>
      {/* Add-on item 2 */}
      <div
        style={{
          position: "absolute",
          left: 32,
          top: 930,
          width: 311,
          height: 52,
          background: "#FFFFFF",
          borderRadius: 12,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 42,
          top: 950,
          width: 12,
          height: 12,
        }}
      >
        <Scissors size={12} color="#8C8A84" strokeWidth={1} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 66,
          top: 940,
          width: 212.7,
          height: 32,
          color: "#141311",
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 12,
          lineHeight: "16px",
          whiteSpace: "pre-line",
        }}
      >
        {"Editor\nMinimal Style"}
      </div>
      <div
        style={{
          position: "absolute",
          left: 290.7,
          top: 948,
          width: 42.3,
          height: 16,
          color: "#141311",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 12,
          lineHeight: "16px",
        }}
      >
        ₹3,000
      </div>

      {/* ================= ACTIVITY TIMELINE ================= */}
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 1018,
          width: 343,
          height: 20,
          color: "#141311",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 14,
          lineHeight: "20px",
        }}
      >
        Activity Timeline
      </div>

      {/* Timeline item 1 */}
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 1050,
          width: 32,
          height: 32,
          background: "#E9F6ED",
          borderRadius: 9999,
        }}
      />
      <div
        style={{ position: "absolute", left: 26, top: 1060, width: 12, height: 12 }}
      >
        <Send size={12} color="#141311" strokeWidth={1} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 31.5,
          top: 1086,
          width: 1,
          height: 24,
          background: "#E8E5DF",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 1050,
          width: 299,
          height: 52,
          background: "#FFFFFF",
          border: "1px solid #E8E5DF",
          borderRadius: 16,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 73,
          top: 1063,
          width: 84.2,
          height: 16,
          color: "#141311",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 12,
          lineHeight: "16px",
        }}
      >
        Outreach Sent
      </div>
      <div
        style={{
          position: "absolute",
          left: 321.6,
          top: 1064,
          width: 24.4,
          height: 14,
          color: "#8C8A84",
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 9,
          lineHeight: "13.5px",
        }}
      >
        Jul 18
      </div>
      <div
        style={{
          position: "absolute",
          left: 73,
          top: 1080.5,
          width: 121.2,
          height: 15,
          color: "#8C8A84",
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 10,
          lineHeight: "15px",
        }}
      >
        Initial pitch sent via email.
      </div>

      {/* Timeline item 2 */}
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 1110,
          width: 32,
          height: 32,
          background: "#F2EDFF",
          borderRadius: 9999,
        }}
      />
      <div
        style={{ position: "absolute", left: 26, top: 1120, width: 12, height: 12 }}
      >
        <MessageCircle size={12} color="#141311" strokeWidth={1} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 31.5,
          top: 1146,
          width: 1,
          height: 24,
          background: "#E8E5DF",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 1110,
          width: 299,
          height: 52,
          background: "#FFFFFF",
          border: "1px solid #E8E5DF",
          borderRadius: 16,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 73,
          top: 1123,
          width: 126.2,
          height: 16,
          color: "#141311",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 12,
          lineHeight: "16px",
        }}
      >
        Replied on WhatsApp
      </div>
      <div
        style={{
          position: "absolute",
          left: 321.7,
          top: 1124,
          width: 24.3,
          height: 14,
          color: "#8C8A84",
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 9,
          lineHeight: "13.5px",
        }}
      >
        Jul 21
      </div>
      <div
        style={{
          position: "absolute",
          left: 73,
          top: 1140.5,
          width: 165.8,
          height: 15,
          color: "#8C8A84",
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 10,
          lineHeight: "15px",
        }}
      >
        Expressed interest in collaboration.
      </div>

      {/* Timeline item 3 */}
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 1170,
          width: 32,
          height: 32,
          background: "#FFECF3",
          borderRadius: 9999,
        }}
      />
      <div
        style={{ position: "absolute", left: 26, top: 1180, width: 12, height: 12 }}
      >
        <FileText size={12} color="#141311" strokeWidth={1} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 31.5,
          top: 1206,
          width: 1,
          height: 24,
          background: "#E8E5DF",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 1170,
          width: 299,
          height: 52,
          background: "#FFFFFF",
          border: "1px solid #E8E5DF",
          borderRadius: 16,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 73,
          top: 1183,
          width: 81,
          height: 16,
          color: "#141311",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 12,
          lineHeight: "16px",
        }}
      >
        Contract Sent
      </div>
      <div
        style={{
          position: "absolute",
          left: 319.7,
          top: 1184,
          width: 26.3,
          height: 14,
          color: "#8C8A84",
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 9,
          lineHeight: "13.5px",
        }}
      >
        Jul 24
      </div>
      <div
        style={{
          position: "absolute",
          left: 73,
          top: 1200.5,
          width: 188.8,
          height: 15,
          color: "#8C8A84",
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 10,
          lineHeight: "15px",
        }}
      >
        Campaign agreement shared for review.
      </div>

      {/* Timeline item 4 */}
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 1230,
          width: 32,
          height: 32,
          background: "#F7F3EA",
          borderRadius: 9999,
        }}
      />
      <div
        style={{ position: "absolute", left: 26, top: 1240, width: 12, height: 12 }}
      >
        <CheckCircle size={12} color="#141311" strokeWidth={1} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 1230,
          width: 299,
          height: 58.5,
          background: "#FFFFFF",
          border: "1px solid #E8E5DF",
          borderRadius: 16,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 73,
          top: 1243,
          width: 117.6,
          height: 16,
          color: "#141311",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 12,
          lineHeight: "16px",
        }}
      >
        Reel Draft Approved
      </div>
      <div
        style={{
          position: "absolute",
          left: 322.8,
          top: 1244,
          width: 23.2,
          height: 14,
          color: "#8C8A84",
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 9,
          lineHeight: "13.5px",
        }}
      >
        Aug 1
      </div>
      <div
        style={{
          position: "absolute",
          left: 73,
          top: 1260.5,
          width: 158.7,
          height: 15,
          color: "#8C8A84",
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 10,
          lineHeight: "15px",
        }}
      >
        Content approved by brand team.
      </div>

      {/* ================= BOTTOM FLOATING ACTIONS ================= */}
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 790,
          width: 343,
          height: 62,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 28,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 27,
          top: 801,
          width: 156.5,
          height: 40,
          background: "#FFECF3",
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 53.2,
          top: 813,
          width: 104,
          height: 16,
          color: "#141311",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 12,
          lineHeight: "16px",
          textAlign: "center",
        }}
      >
        Manage Calendar
      </div>
      <div
        style={{
          position: "absolute",
          left: 191.5,
          top: 801,
          width: 156.5,
          height: 40,
          background: "#E9F6ED",
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 227.8,
          top: 813,
          width: 84,
          height: 16,
          color: "#141311",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 12,
          lineHeight: "16px",
          textAlign: "center",
        }}
      >
        Mark Shortlist
      </div>

      {/* ================= TOP HEADER ================= */}
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 22,
          width: 36,
          height: 36,
          background: "#1F1A17",
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 25.9,
          top: 31.9,
          width: 16.2,
          height: 16.2,
        }}
      >
        <ArrowLeft size={16.2} color="#FAF7F2" strokeWidth={1.35} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 72,
          top: 28,
          width: 192,
          height: 24,
          color: "#141311",
          fontFamily: "Geist, sans-serif",
          fontWeight: 500,
          fontSize: 20,
          lineHeight: "24px",
        }}
      >
        Zostel Tip
      </div>
    </div>
  );
}
