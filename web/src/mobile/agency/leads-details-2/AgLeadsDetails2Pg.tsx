import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Heart,
  Phone,
  MessageCircle,
  Mail,
  Pencil,
  Globe,
  Plus,
  PlusCircle,
  Video,
  Camera,
  Scissors,
} from "lucide-react";

const brandMessage =
  '"Hi ! We’re planning a winter campaign for our new Manali property and would love to collaborate. We are looking for authentic experiences..."';

export default function AgLeadsDetails2Pg() {
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
      {/* ============ HEADER ============ */}
      {/* Back button */}
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 22,
          width: 36,
          height: 36,
          background: "#1F1A17",
          borderRadius: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <ChevronLeft size={18} color="#FAF7F2" strokeWidth={1.5} />
      </div>

      {/* Heading */}
      <div
        style={{
          position: "absolute",
          left: 72,
          top: 28,
          width: 222,
          height: 24,
          color: "#141311",
          fontFamily: "Geist, sans-serif",
          fontWeight: 500,
          fontSize: 20,
          lineHeight: "24px",
          textAlign: "left",
        }}
      >
        Lead Detail
      </div>

      {/* Heart button */}
      <div
        style={{
          position: "absolute",
          left: 314,
          top: 22,
          width: 36,
          height: 36,
          background: "#FFFFFF",
          border: "0.82px solid #FFFFFF",
          borderRadius: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
        }}
      >
        <Heart size={17} color="#E74C3C" strokeWidth={1.36} />
      </div>

      {/* ============ CONTENT ============ */}

      {/* --- Purple hero card --- */}
      <div
        style={{
          position: "absolute",
          left: 15,
          top: 111,
          width: 345,
          height: 205,
          background: "#F2EDFF",
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 39,
          top: 135,
          width: 156.1,
          height: 29,
          color: "#1D1D1F",
          fontWeight: 700,
          fontSize: 24,
          lineHeight: "29px",
        }}
      >
        Priya Sharma
      </div>
      <div
        style={{
          position: "absolute",
          left: 39,
          top: 168,
          width: 71.1,
          height: 17,
          color: "#6E6E73",
          fontWeight: 500,
          fontSize: 14,
          lineHeight: "16.9px",
        }}
      >
        Zostel Trip
      </div>
      <div
        style={{
          position: "absolute",
          left: 290.4,
          top: 135,
          width: 45.6,
          height: 21,
          color: "#1D1D1F",
          fontWeight: 700,
          fontSize: 18,
          lineHeight: "21.8px",
        }}
      >
        ₹1.2L
      </div>

      {/* Status pills */}
      <div
        style={{
          position: "absolute",
          left: 39,
          top: 197,
          width: 51,
          height: 27,
          background: "#FFFFFF",
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 51,
          top: 203,
          width: 27,
          height: 15,
          color: "#8C8A84",
          fontWeight: 400,
          fontSize: 12,
          lineHeight: "14.5px",
        }}
      >
        Paid
      </div>
      <div
        style={{
          position: "absolute",
          left: 98,
          top: 197,
          width: 84.4,
          height: 27,
          background: "#FCFAFF",
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 203,
          width: 60.4,
          height: 15,
          color: "#8C8A84",
          fontWeight: 400,
          fontSize: 12,
          lineHeight: "14.5px",
        }}
      >
        Contacted
      </div>

      {/* Action buttons (call / message / mail) */}
      {[
        { left: 39, Icon: Phone },
        { left: 95, Icon: MessageCircle },
        { left: 151, Icon: Mail },
      ].map(({ left, Icon }, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left,
            top: 248,
            width: 44,
            height: 44,
            background: "#FFFFFF",
            borderRadius: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={20} color="#1D1D1F" strokeWidth={1.67} />
        </div>
      ))}

      {/* --- Tab pills --- */}
      <div
        style={{
          position: "absolute",
          left: 15,
          top: 331,
          width: 345,
          height: 51,
          background: "#FFFFFF",
          border: "1px solid #E8E2D9",
          borderRadius: 999,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 336,
          width: 167.5,
          height: 41,
          background: "#FFFFFF",
          borderRadius: 999,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 72.4,
          top: 348,
          width: 62.7,
          height: 17,
          color: "#1C1C1E",
          fontFamily: "Geist, sans-serif",
          fontWeight: 600,
          fontSize: 14,
          lineHeight: "18.2px",
          textAlign: "center",
        }}
      >
        Lead Info
      </div>
      <div
        style={{
          position: "absolute",
          left: 217.1,
          top: 348,
          width: 108.4,
          height: 17,
          color: "#6C6C70",
          fontFamily: "Geist, sans-serif",
          fontWeight: 600,
          fontSize: 14,
          lineHeight: "18.2px",
          textAlign: "center",
        }}
      >
        Notes & Activity
      </div>

      {/* --- Lead by card --- */}
      <div
        style={{
          position: "absolute",
          left: 15,
          top: 397,
          width: 345,
          height: 60,
          background: "#FFFFFF",
          border: "1px solid #E8E2D9",
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 35,
          top: 418.5,
          width: 82.8,
          height: 17,
          color: "#8A8A8E",
          fontWeight: 500,
          fontSize: 14,
          lineHeight: "16.9px",
        }}
      >
        Lead by
      </div>
      {/* avatar */}
      <div
        style={{
          position: "absolute",
          left: 104,
          top: 415,
          width: 24,
          height: 24,
          background: "linear-gradient(135deg, #F2F2F7, #C4C4C4)",
          borderRadius: 12,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 135,
          top: 418.5,
          width: 137,
          height: 17,
          color: "#1D1D1F",
          fontWeight: 600,
          fontSize: 14,
          lineHeight: "16.9px",
        }}
      >
        Leena Sharma
      </div>
      {/* edit button */}
      <div
        style={{
          position: "absolute",
          left: 283,
          top: 413,
          width: 28,
          height: 28,
          background: "#F4F4F6",
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Pencil size={14} color="#1D1D1F" strokeWidth={1.17} />
      </div>
      {/* whatsapp */}
      <div
        style={{
          position: "absolute",
          left: 321,
          top: 413,
          width: 28,
          height: 28,
          background: "linear-gradient(135deg, #60D669, #1FAF38)",
          borderRadius: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MessageCircle size={15} color="#FFFFFF" strokeWidth={2} />
      </div>

      {/* --- Email / Website buttons --- */}
      <div
        style={{
          position: "absolute",
          left: 15,
          top: 473,
          width: 166,
          height: 32,
          background: "#FFFFFF",
          border: "1px solid #E8E2D9",
          borderRadius: 16,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 31,
          top: 481,
          width: 16,
          height: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Mail size={14} color="#8A8A8E" strokeWidth={1.33} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 53,
          top: 481,
          width: 111.9,
          height: 16,
          color: "#1D1D1F",
          fontWeight: 500,
          fontSize: 13,
          lineHeight: "15.7px",
          textAlign: "center",
        }}
      >
        priya@zostel.com
      </div>
      <div
        style={{
          position: "absolute",
          left: 203,
          top: 473,
          width: 157,
          height: 32,
          background: "#FFFFFF",
          border: "1px solid #E8E2D9",
          borderRadius: 16,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 219,
          top: 481,
          width: 16,
          height: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Globe size={14} color="#8A8A8E" strokeWidth={1.33} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 241,
          top: 481,
          width: 68,
          height: 16,
          color: "#1D1D1F",
          fontWeight: 500,
          fontSize: 13,
          lineHeight: "15.7px",
          textAlign: "center",
        }}
      >
        zostel.com
      </div>

      {/* --- Brand Message card --- */}
      <div
        style={{
          position: "absolute",
          left: 15,
          top: 517,
          width: 345,
          height: 168,
          background: "#FFFFFF",
          border: "1px solid #E8E2D9",
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 35,
          top: 549,
          width: 120.2,
          height: 20,
          color: "#1D1D1F",
          fontWeight: 600,
          fontSize: 16,
          lineHeight: "19.4px",
        }}
      >
        Brand Message
      </div>
      <div
        style={{
          position: "absolute",
          left: 320,
          top: 549,
          width: 20,
          height: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ChevronDown size={16} color="#8A8A8E" strokeWidth={1.67} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 35,
          top: 581,
          width: 305,
          height: 84,
          color: "#6E6E73",
          fontWeight: 400,
          fontSize: 14,
          lineHeight: "21px",
        }}
      >
        {brandMessage}
      </div>

      {/* --- Script & References card --- */}
      <div
        style={{
          position: "absolute",
          left: 15,
          top: 697,
          width: 345,
          height: 64,
          background: "#FFFFFF",
          border: "1px solid #E8E2D9",
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 35,
          top: 721,
          width: 152.5,
          height: 20,
          color: "#1D1D1F",
          fontWeight: 600,
          fontSize: 16,
          lineHeight: "19.4px",
        }}
      >
        Script & References
      </div>
      <div
        style={{
          position: "absolute",
          left: 320,
          top: 721,
          width: 20,
          height: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ChevronRight size={16} color="#8A8A8E" strokeWidth={1.67} />
      </div>

      {/* --- Creators card --- */}
      <div
        style={{
          position: "absolute",
          left: 15,
          top: 773,
          width: 345,
          height: 64,
          background: "#FFFFFF",
          border: "1px solid #E8E2D9",
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 35,
          top: 797,
          width: 152.5,
          height: 20,
          color: "#1D1D1F",
          fontWeight: 600,
          fontSize: 16,
          lineHeight: "19.4px",
        }}
      >
        Creators
      </div>
      <div
        style={{
          position: "absolute",
          left: 320,
          top: 797,
          width: 20,
          height: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ChevronRight size={16} color="#8A8A8E" strokeWidth={1.67} />
      </div>

      {/* --- Deliverables card --- */}
      <div
        style={{
          position: "absolute",
          left: 15,
          top: 849,
          width: 345,
          height: 277,
          background: "#FFFFFF",
          border: "1px solid #E8E2D9",
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 35,
          top: 879,
          width: 95.8,
          height: 20,
          color: "#1D1D1F",
          fontWeight: 600,
          fontSize: 16,
          lineHeight: "19.4px",
        }}
      >
        Deliverables
      </div>
      <div
        style={{
          position: "absolute",
          left: 308,
          top: 873,
          width: 32,
          height: 32,
          background: "#F4F4F6",
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Plus size={14} color="#1D1D1F" strokeWidth={1.11} />
      </div>

      {/* Deliverable item 1 : Reel */}
      <div
        style={{
          position: "absolute",
          left: 35,
          top: 985,
          width: 305,
          height: 1,
          background: "#F2F2F7",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 35,
          top: 933,
          width: 40,
          height: 40,
          background: "#FFF0F5",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Video size={20} color="#C13FBA" strokeWidth={1.67} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 87,
          top: 935,
          width: 253,
          height: 18,
          color: "#1D1D1F",
          fontWeight: 600,
          fontSize: 15,
          lineHeight: "18.2px",
        }}
      >
        1 Reel
      </div>
      <div
        style={{
          position: "absolute",
          left: 87,
          top: 955,
          width: 253,
          height: 16,
          color: "#8A8A8E",
          fontWeight: 400,
          fontSize: 13,
          lineHeight: "15.7px",
        }}
      >
        Needs script
      </div>

      {/* Deliverable item 2 : Stories */}
      <div
        style={{
          position: "absolute",
          left: 35,
          top: 998,
          width: 40,
          height: 40,
          background: "#F3EBFF",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Camera size={20} color="#8A5AFE" strokeWidth={1.67} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 87,
          top: 1000,
          width: 253,
          height: 18,
          color: "#1D1D1F",
          fontWeight: 600,
          fontSize: 15,
          lineHeight: "18.2px",
        }}
      >
        2 Stories
      </div>
      <div
        style={{
          position: "absolute",
          left: 87,
          top: 1020,
          width: 253,
          height: 16,
          color: "#8A8A8E",
          fontWeight: 400,
          fontSize: 13,
          lineHeight: "15.7px",
        }}
      >
        Pending shoot
      </div>

      {/* Deliverable input row */}
      <div
        style={{
          position: "absolute",
          left: 35,
          top: 1054,
          width: 305,
          height: 52,
          background: "#F9F9F9",
          borderRadius: 16,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 51,
          top: 1073.5,
          width: 185,
          height: 17,
          color: "#757575",
          fontWeight: 400,
          fontSize: 14,
          lineHeight: "16.9px",
        }}
      >
        Add deliverable link...
      </div>
      <div
        style={{
          position: "absolute",
          left: 246,
          top: 1064,
          width: 84.2,
          height: 36,
          background: "#312B28",
          borderRadius: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "#FFFFFF",
            fontWeight: 600,
            fontSize: 13,
            lineHeight: "15.7px",
          }}
        >
          Submit
        </span>
      </div>

      {/* --- ADD-ONS label --- */}
      <div
        style={{
          position: "absolute",
          left: 35,
          top: 1142,
          width: 325,
          height: 17,
          color: "#8A8A8E",
          fontWeight: 600,
          fontSize: 14,
          lineHeight: "16.9px",
        }}
      >
        ADD-ONS
      </div>

      {/* Add-on card : Videographer */}
      <div
        style={{
          position: "absolute",
          left: 30,
          top: 1171,
          width: 151.5,
          height: 101,
          background: "#FFFFFF",
          border: "1px solid #E8E2D9",
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 46,
          top: 1187,
          width: 40,
          height: 40,
          background: "#F4F4F6",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Video size={20} color="#1D1D1F" strokeWidth={1.67} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 145.5,
          top: 1187,
          width: 20,
          height: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <PlusCircle size={20} color="#8A8A8E" strokeWidth={1.67} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 46,
          top: 1239,
          width: 119.5,
          height: 17,
          color: "#1D1D1F",
          fontWeight: 600,
          fontSize: 14,
          lineHeight: "16.9px",
        }}
      >
        Videographer
      </div>

      {/* Add-on card : Editor */}
      <div
        style={{
          position: "absolute",
          left: 193.5,
          top: 1171,
          width: 151.5,
          height: 101,
          background: "#FFFFFF",
          border: "1px solid #E8E2D9",
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 209.5,
          top: 1187,
          width: 40,
          height: 40,
          background: "#F4F4F6",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Scissors size={20} color="#1D1D1F" strokeWidth={1.67} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 309,
          top: 1187,
          width: 20,
          height: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <PlusCircle size={20} color="#8A8A8E" strokeWidth={1.67} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 209.5,
          top: 1239,
          width: 119.5,
          height: 17,
          color: "#1D1D1F",
          fontWeight: 600,
          fontSize: 14,
          lineHeight: "16.9px",
        }}
      >
        Editor
      </div>

      {/* --- Payment Summary card --- */}
      <div
        style={{
          position: "absolute",
          left: 15,
          top: 1284,
          width: 345,
          height: 202,
          background: "#FFFFFF",
          border: "1px solid #E8E2D9",
          borderRadius: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 35,
          top: 1316,
          width: 305,
          height: 19,
          color: "#1D1D1F",
          fontWeight: 600,
          fontSize: 16,
          lineHeight: "19.4px",
        }}
      >
        Payment Summary
      </div>
      <div
        style={{
          position: "absolute",
          left: 35,
          top: 1355,
          width: 91.2,
          height: 17,
          color: "#1D1D1F",
          fontWeight: 500,
          fontSize: 14,
          lineHeight: "16.9px",
        }}
      >
        Brand Budget
      </div>
      <div
        style={{
          position: "absolute",
          left: 273.9,
          top: 1355,
          width: 66.1,
          height: 17,
          color: "#1D1D1F",
          fontWeight: 500,
          fontSize: 14,
          lineHeight: "16.9px",
        }}
      >
        ₹1,20,000
      </div>
      <div
        style={{
          position: "absolute",
          left: 35,
          top: 1388,
          width: 77.5,
          height: 21,
          color: "#6E6E73",
          fontWeight: 500,
          fontSize: 14,
          lineHeight: "21px",
        }}
      >
        Costs (Est.)
      </div>
      <div
        style={{
          position: "absolute",
          left: 280.9,
          top: 1388,
          width: 59.1,
          height: 21,
          color: "#6E6E73",
          fontWeight: 500,
          fontSize: 14,
          lineHeight: "21px",
        }}
      >
        -₹15,000
      </div>
      <div
        style={{
          position: "absolute",
          left: 35,
          top: 1425,
          width: 305,
          height: 1,
          background: "#F2F2F7",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 35,
          top: 1444,
          width: 94.2,
          height: 20,
          color: "#1D1D1F",
          fontWeight: 600,
          fontSize: 16,
          lineHeight: "19.4px",
        }}
      >
        Final Payout
      </div>
      <div
        style={{
          position: "absolute",
          left: 241.8,
          top: 1442,
          width: 98.2,
          height: 24,
          color: "#2B9A57",
          fontWeight: 700,
          fontSize: 20,
          lineHeight: "24.2px",
        }}
      >
        ₹1,05,000
      </div>

      {/* ============ BOTTOM BAR (sticky footer, on top) ============ */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 777,
          width: 375,
          height: 99,
          background: "#F6EFE9",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 793,
          width: 161.5,
          height: 51,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <span
          style={{
            color: "#1F1A17",
            fontWeight: 500,
            fontSize: 14,
            lineHeight: "16.9px",
          }}
        >
          Follow Up
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          left: 193.5,
          top: 793,
          width: 161.5,
          height: 51,
          background: "#312B28",
          borderRadius: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "#FFFFFF",
            fontWeight: 500,
            fontSize: 14,
            lineHeight: "16.9px",
          }}
        >
          Mark Converted
        </span>
      </div>
    </div>
  );
}
