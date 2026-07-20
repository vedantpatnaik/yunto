import {
  ArrowLeft,
  Phone,
  MessageCircle,
  ArrowUpRight,
  Trash2,
  Sparkles,
  Mail,
  Globe,
  ChevronDown,
  FileText,
  Paperclip,
  Link,
  Pencil,
  Plus,
  Flame,
  Star,
  Users,
  Wifi,
  Signal,
  BatteryFull,
} from "lucide-react";

const clash = "'Clash Display', sans-serif";
const outfit = "Outfit, sans-serif";
const inter = "Inter, sans-serif";
const urbanist = "Urbanist, sans-serif";

const imgPlaceholder = "linear-gradient(135deg,#E9E4F0,#D9CFEA)";

function WhatsApp({ left, top }: { left: number; top: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: 30,
        height: 30,
        borderRadius: 9999,
        background: "linear-gradient(135deg,#60D669,#1FAF38)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <MessageCircle width={17} height={17} color="#FFFFFF" fill="#FFFFFF" />
    </div>
  );
}

function creatorCard(top: number, key: string) {
  return (
    <div key={key}>
      {/* Container */}
      <div
        style={{
          position: "absolute",
          left: 39,
          top,
          width: 293,
          height: 64.1,
          background: "#FBFFFC",
          border: "0.85px solid #000000",
          borderRadius: 10.25,
        }}
      />
      {/* Avatar */}
      <div
        style={{
          position: "absolute",
          left: 45,
          top: top + 10.3,
          width: 27.3,
          height: 27.3,
          borderRadius: 9999,
          background: imgPlaceholder,
        }}
      />
      {/* Name */}
      <div
        style={{
          position: "absolute",
          left: 74.9,
          top: top + 10.3,
          width: 76,
          height: 15.4,
          fontFamily: clash,
          fontWeight: 500,
          fontSize: 10.25,
          lineHeight: "20.5px",
          color: "#000000",
          textAlign: "center",
        }}
      >
        Leena Sharma
      </div>
      {/* Handle */}
      <div
        style={{
          position: "absolute",
          left: 157.7,
          top: top + 12.4,
          width: 43.6,
          height: 11.1,
          fontFamily: clash,
          fontWeight: 500,
          fontSize: 6.83,
          lineHeight: "20.5px",
          color: "#000000",
        }}
      >
        @leenabliss
      </div>
      {/* Fire emoji */}
      <Flame
        style={{ position: "absolute", left: 58.6, top: top + 28.2 }}
        width={13.7}
        height={13.7}
        color="#FF6A3D"
        fill="#FF8E41"
      />
      {/* Followers metric */}
      <Users
        style={{ position: "absolute", left: 74.9, top: top + 27.5 }}
        width={13.7}
        height={13.7}
        color="#000000"
      />
      <div
        style={{
          position: "absolute",
          left: 91.1,
          top: top + 27.3,
          width: 18,
          height: 14,
          fontFamily: clash,
          fontWeight: 500,
          fontSize: 8.71,
          lineHeight: "13.7px",
          color: "#000000",
        }}
      >
        1.2M
      </div>
      {/* Views metric */}
      <Globe
        style={{ position: "absolute", left: 117.6, top: top + 27.5 }}
        width={13.7}
        height={13.7}
        color="#000000"
      />
      <div
        style={{
          position: "absolute",
          left: 133.8,
          top: top + 27.3,
          width: 50,
          height: 14,
          fontFamily: clash,
          fontWeight: 500,
          fontSize: 8.71,
          lineHeight: "13.7px",
          color: "#000000",
        }}
      >
        900k views
      </div>
      {/* Leads metric */}
      <Star
        style={{ position: "absolute", left: 191.1, top: top + 27.5 }}
        width={13.7}
        height={13.7}
        color="#000000"
      />
      <div
        style={{
          position: "absolute",
          left: 207.3,
          top: top + 27.3,
          width: 36,
          height: 14,
          fontFamily: clash,
          fontWeight: 500,
          fontSize: 8.71,
          lineHeight: "13.7px",
          color: "#000000",
        }}
      >
        89 leads
      </div>
      {/* Call button */}
      <div
        style={{
          position: "absolute",
          left: 278.2,
          top: top + 7.7,
          width: 21.4,
          height: 21.4,
          borderRadius: 9999,
          background: "#FFFFFF",
          border: "0.85px solid #EAEAEA",
        }}
      />
      <Phone
        style={{ position: "absolute", left: 282.5, top: top + 12.8 }}
        width={12}
        height={12}
        color="#000000"
      />
      {/* Arrow button */}
      <div
        style={{
          position: "absolute",
          left: 303,
          top: top + 7.7,
          width: 21.4,
          height: 21.4,
          borderRadius: 9999,
          background: "#FFFFFF",
          border: "0.85px solid #EAEAEA",
        }}
      />
      <ArrowUpRight
        style={{ position: "absolute", left: 306.6, top: top + 11.3 }}
        width={14.2}
        height={14.2}
        color="#000000"
      />
      {/* Progress track */}
      <div
        style={{
          position: "absolute",
          left: 76.6,
          top: top + 51.3,
          width: 165.7,
          height: 1.7,
          borderRadius: 9999,
          background: "#BABABA",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 76.6,
          top: top + 51.3,
          width: 40.1,
          height: 1.7,
          borderRadius: 9999,
          background: "#000000",
        }}
      />
      {/* Status badge */}
      <div
        style={{
          position: "absolute",
          left: 278,
          top: top + 38,
          width: 46,
          height: 15,
          background: "#FBFFFC",
          border: "0.85px solid #000000",
          borderRadius: 10.25,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 284,
          top: top + 40,
          width: 27,
          height: 11,
          fontFamily: clash,
          fontWeight: 500,
          fontSize: 6.83,
          lineHeight: "20.5px",
          color: "#000000",
        }}
      >
        Status
      </div>
      <ChevronDown
        style={{ position: "absolute", left: 311, top: top + 43 }}
        width={10}
        height={5}
        color="#000000"
      />
    </div>
  );
}

export default function AgCampaign2Pg() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: 375,
        height: 946,
        background: "#FFFFFF",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* ==== Decorative background blobs ==== */}
      <div
        style={{
          position: "absolute",
          left: 3.8,
          top: 1851.1,
          width: 204.3,
          height: 196.5,
          borderRadius: 9999,
          background: "#FBB7C6",
          filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -4,
          top: 1758,
          width: 196.5,
          height: 191.1,
          borderRadius: 9999,
          background: "linear-gradient(135deg,#F3D29F,#EE9688)",
          filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 66.6,
          top: 572,
          width: 493.7,
          height: 488.6,
          borderRadius: 9999,
          background: "#FF90A9",
          filter: "blur(60px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 135.2,
          top: 417.6,
          width: 476.7,
          height: 473.2,
          borderRadius: 9999,
          background: "linear-gradient(135deg,#8673B3,#A79AC6)",
          filter: "blur(60px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -16.4,
          top: 127.5,
          width: 163.4,
          height: 157.1,
          borderRadius: 9999,
          background: "#CCF5FD",
          filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -25,
          top: 53,
          width: 157.1,
          height: 152.8,
          borderRadius: 9999,
          background:
            "linear-gradient(135deg,rgba(70,181,252,0.7),rgba(143,190,255,0.7))",
          filter: "blur(40px)",
        }}
      />

      {/* ==== Big background image placeholder ==== */}
      <div
        style={{
          position: "absolute",
          left: -13,
          top: 0,
          width: 402,
          height: 2045,
          background: imgPlaceholder,
        }}
      />

      {/* ==== Header container ==== */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 70,
          width: 375,
          height: 54,
          background: "#FFFFFF",
          borderBottom: "1px solid #717171",
        }}
      />
      <ArrowLeft
        style={{ position: "absolute", left: 16, top: 85 }}
        width={24}
        height={24}
        color="#000000"
      />
      <div
        style={{
          position: "absolute",
          left: 44,
          top: 82,
          width: 298,
          height: 30,
          fontFamily: clash,
          fontWeight: 500,
          fontSize: 20,
          lineHeight: "37px",
          color: "#1B1B1C",
        }}
      >
        Campaign
      </div>

      {/* ==== Main card outer + inner ==== */}
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 136,
          width: 343,
          height: 798,
          background: "#D7DCFF",
          border: "1px solid #000000",
          borderRadius: 16.22,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 17,
          top: 137,
          width: 341,
          height: 796,
          background: "#FFFFFF",
          borderRadius: 14,
        }}
      />

      {/* ==== Lead by card (behind) ==== */}
      <div
        style={{
          position: "absolute",
          left: 27,
          top: 358,
          width: 320,
          height: 52,
          background: "#FFFFFF",
          border: "1px solid #6C34AB",
          borderRadius: 8,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 43,
          top: 369,
          width: 215,
          height: 30,
          fontFamily: outfit,
          fontWeight: 500,
          fontSize: 16,
          lineHeight: "30px",
          color: "#000000",
        }}
      >
        Lead by: Leena Sharma
      </div>
      {/* call button (grey) */}
      <div
        style={{
          position: "absolute",
          left: 266,
          top: 369,
          width: 30,
          height: 30,
          background: "#F2F1F3",
          border: "1px solid #EAEAEA",
          borderRadius: 9999,
        }}
      />
      <Phone
        style={{ position: "absolute", left: 271, top: 374 }}
        width={20}
        height={20}
        color="#000000"
      />
      <WhatsApp left={303} top={369} />
      {/* arrow-up-right button */}
      <div
        style={{
          position: "absolute",
          left: 226,
          top: 369,
          width: 30,
          height: 30,
          background: "#F2F1F3",
          border: "1.16px solid #EAEAEA",
          borderRadius: 27.84,
        }}
      />
      <ArrowUpRight
        style={{ position: "absolute", left: 231.4, top: 374.4 }}
        width={19.2}
        height={19.2}
        color="#000000"
      />

      {/* ==== Tabs ==== */}
      <div
        style={{
          position: "absolute",
          left: 27,
          top: 315,
          width: 162,
          height: 31,
          border: "1px solid #FFFFFF",
          fontFamily: outfit,
          fontWeight: 400,
          fontSize: 15,
          lineHeight: "37px",
          color: "#000000",
          textAlign: "center",
        }}
      >
        Lead Info
      </div>
      <div
        style={{
          position: "absolute",
          left: 221,
          top: 315,
          width: 126,
          height: 31,
          fontFamily: outfit,
          fontWeight: 500,
          fontSize: 15,
          lineHeight: "37px",
          color: "#000000",
          textAlign: "center",
        }}
      >
        Notes &amp; Activity
      </div>

      {/* ==== Mark Converted / Follow Up buttons (behind later content) ==== */}
      <div
        style={{
          position: "absolute",
          left: 28,
          top: 797,
          width: 320,
          height: 51,
          background: "#CDEED5",
          border: "1px solid #000000",
          borderRadius: 16,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 103,
          top: 813,
          width: 170,
          height: 19,
          fontFamily: outfit,
          fontWeight: 600,
          fontSize: 15,
          lineHeight: "18.9px",
          color: "#333333",
          textAlign: "center",
        }}
      >
        Mark Converted{" "}
      </div>
      <div
        style={{
          position: "absolute",
          left: 28,
          top: 860,
          width: 320,
          height: 51,
          background: "#FFBCB8",
          border: "1px solid #000000",
          borderRadius: 16,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 103,
          top: 876,
          width: 170,
          height: 19,
          fontFamily: outfit,
          fontWeight: 600,
          fontSize: 15,
          lineHeight: "18.9px",
          color: "#333333",
          textAlign: "center",
        }}
      >
        Follow Up
      </div>

      {/* ==== Lead Info section ==== */}
      {/* Brand avatar */}
      <div
        style={{
          position: "absolute",
          left: 27,
          top: 154,
          width: 48,
          height: 48,
          background: "#FFFFFF",
          borderRadius: 9999,
        }}
      />
      <Sparkles
        style={{ position: "absolute", left: 37, top: 164 }}
        width={28}
        height={28}
        color="#000000"
      />
      {/* Barter badge */}
      <div
        style={{
          position: "absolute",
          left: 83,
          top: 163,
          width: 63,
          height: 30,
          background: "#FFFFFF",
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 91,
          top: 170,
          width: 47,
          height: 16,
          fontFamily: outfit,
          fontWeight: 500,
          fontSize: 12,
          lineHeight: "16px",
          color: "#000000",
          textAlign: "center",
        }}
      >
        Barter
      </div>
      {/* Converted badge */}
      <div
        style={{
          position: "absolute",
          left: 152,
          top: 163,
          width: 77,
          height: 27,
          background: "#FFFFFF",
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 160,
          top: 168.5,
          width: 61,
          height: 16,
          fontFamily: outfit,
          fontWeight: 500,
          fontSize: 12,
          lineHeight: "16px",
          color: "#000000",
          textAlign: "center",
        }}
      >
        Converted
      </div>
      {/* Trash button */}
      <div
        style={{
          position: "absolute",
          left: 313,
          top: 163,
          width: 30,
          height: 30,
          background: "#FFFFFF",
          borderRadius: 9999,
        }}
      />
      <Trash2
        style={{ position: "absolute", left: 317.5, top: 167.5 }}
        width={20}
        height={20}
        color="#000000"
      />
      {/* Name + budget */}
      <div
        style={{
          position: "absolute",
          left: 27,
          top: 216,
          width: 205,
          height: 22,
          fontFamily: clash,
          fontWeight: 500,
          fontSize: 20,
          lineHeight: "24px",
          color: "#000000",
        }}
      >
        Priya Sharma
      </div>
      <div
        style={{
          position: "absolute",
          left: 27,
          top: 242,
          width: 76,
          height: 16,
          fontFamily: inter,
          fontWeight: 400,
          fontSize: 12,
          lineHeight: "16px",
          color: "#000000",
        }}
      >
        Bobbi Brown
      </div>
      <div
        style={{
          position: "absolute",
          left: 103,
          top: 242,
          width: 11.5,
          height: 16,
          fontFamily: inter,
          fontWeight: 400,
          fontSize: 10.2,
          lineHeight: "16px",
          color: "#5D5D5D",
        }}
      >
        {" • "}
      </div>
      <div
        style={{
          position: "absolute",
          left: 126,
          top: 242,
          width: 91,
          height: 16,
          fontFamily: inter,
          fontWeight: 600,
          fontSize: 12,
          lineHeight: "16px",
          color: "#000000",
        }}
      >
        Budget ₹1.2L
      </div>
      {/* call + whatsapp (white) */}
      <div
        style={{
          position: "absolute",
          left: 280,
          top: 222,
          width: 30,
          height: 30,
          background: "#FFFFFF",
          borderRadius: 9999,
        }}
      />
      <Phone
        style={{ position: "absolute", left: 285, top: 227 }}
        width={20}
        height={20}
        color="#000000"
      />
      <WhatsApp left={317} top={222} />
      {/* Email chip */}
      <div
        style={{
          position: "absolute",
          left: 27,
          top: 272,
          width: 154,
          height: 32,
          background: "#B0BBFF",
          borderRadius: 14,
        }}
      />
      <Mail
        style={{ position: "absolute", left: 52.5, top: 280 }}
        width={16}
        height={16}
        color="#121212"
      />
      <div
        style={{
          position: "absolute",
          left: 73.5,
          top: 280,
          width: 82,
          height: 16,
          fontFamily: inter,
          fontWeight: 400,
          fontSize: 10.2,
          lineHeight: "16px",
          color: "#121212",
        }}
      >
        Sunil@gmail.com
      </div>
      {/* Web chip */}
      <div
        style={{
          position: "absolute",
          left: 188,
          top: 272,
          width: 159,
          height: 32,
          background: "#B0BBFF",
          borderRadius: 14,
        }}
      />
      <Globe
        style={{ position: "absolute", left: 203, top: 280 }}
        width={16}
        height={16}
        color="#000000"
      />
      <div
        style={{
          position: "absolute",
          left: 224,
          top: 280,
          width: 108,
          height: 16,
          fontFamily: inter,
          fontWeight: 400,
          fontSize: 10.2,
          lineHeight: "16px",
          color: "#000000",
        }}
      >
        www.bobbibrown.com{" "}
      </div>

      {/* ==== Notes & Activity section ==== */}
      {/* Message card */}
      <div
        style={{
          position: "absolute",
          left: 27,
          top: 421,
          width: 321,
          height: 92,
          background: "#FFFFFF",
          border: "1px solid #6C34AB",
          borderRadius: 8,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 43,
          top: 432,
          width: 289,
          height: 30,
          fontFamily: outfit,
          fontWeight: 500,
          fontSize: 16,
          lineHeight: "30px",
          color: "#000000",
        }}
      >
        Message
      </div>
      <ChevronDown
        style={{ position: "absolute", left: 308, top: 441 }}
        width={24}
        height={12}
        color="#000000"
      />
      <div
        style={{
          position: "absolute",
          left: 43,
          top: 466,
          width: 289,
          height: 36,
          fontFamily: inter,
          fontWeight: 400,
          fontSize: 12,
          lineHeight: "20px",
          color: "#000000",
        }}
      >
        We are launching a new skincare product and...
      </div>
      {/* Script card */}
      <div
        style={{
          position: "absolute",
          left: 27,
          top: 525,
          width: 320,
          height: 187,
          background: "#FFFFFF",
          border: "1px solid #6C34AB",
          borderRadius: 8,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 43,
          top: 536,
          width: 289,
          height: 30,
          fontFamily: outfit,
          fontWeight: 500,
          fontSize: 16,
          lineHeight: "30px",
          color: "#000000",
        }}
      >
        Script
      </div>
      <ChevronDown
        style={{ position: "absolute", left: 308, top: 545 }}
        width={24}
        height={12}
        color="#000000"
      />
      <div
        style={{
          position: "absolute",
          left: 43,
          top: 570,
          width: 289,
          height: 36,
          fontFamily: inter,
          fontWeight: 400,
          fontSize: 12,
          lineHeight: "20px",
          color: "#000000",
        }}
      >
        Here comes the scripts
      </div>
      {/* Reference doc chip */}
      <div
        style={{
          position: "absolute",
          left: 43,
          top: 619,
          width: 289,
          height: 33,
          background: "#FFFFFF",
          border: "0.5px solid #D9D9D9",
          borderRadius: 12,
        }}
      />
      <FileText
        style={{ position: "absolute", left: 49, top: 626 }}
        width={20}
        height={20}
        color="#000000"
      />
      <div
        style={{
          position: "absolute",
          left: 71,
          top: 630,
          width: 72,
          height: 12,
          fontFamily: outfit,
          fontWeight: 300,
          fontSize: 10.2,
          lineHeight: "24px",
          color: "#000000",
          textAlign: "center",
        }}
      >
        Reference Doc.
      </div>
      {/* Add a comment field */}
      <div
        style={{
          position: "absolute",
          left: 43,
          top: 666,
          width: 202,
          height: 30,
          background: "#FFFFFF",
          border: "0.5px solid #D9D9D9",
          borderRadius: 12,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 51,
          top: 675,
          width: 85,
          height: 12,
          fontFamily: outfit,
          fontWeight: 400,
          fontSize: 12,
          lineHeight: "24px",
          color: "#000000",
        }}
      >
        Add a comment
      </div>
      {/* Attach button */}
      <div
        style={{
          position: "absolute",
          left: 263,
          top: 666,
          width: 30,
          height: 30,
          border: "0.5px solid #D9D9D9",
          borderRadius: 27.84,
        }}
      />
      <Paperclip
        style={{ position: "absolute", left: 268, top: 671 }}
        width={20}
        height={20}
        color="#000000"
      />
      {/* Link button */}
      <div
        style={{
          position: "absolute",
          left: 302,
          top: 666,
          width: 30,
          height: 30,
          border: "0.5px solid #D9D9D9",
          borderRadius: 27.84,
        }}
      />
      <Link
        style={{ position: "absolute", left: 307, top: 671 }}
        width={20}
        height={20}
        color="#000000"
      />

      {/* Creators card */}
      <div
        style={{
          position: "absolute",
          left: 27,
          top: 724,
          width: 321,
          height: 283,
          background: "#FFFFFF",
          border: "1px solid #6C34AB",
          borderRadius: 8,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 43,
          top: 735,
          width: 289,
          height: 30,
          fontFamily: outfit,
          fontWeight: 500,
          fontSize: 16,
          lineHeight: "30px",
          color: "#000000",
        }}
      >
        Creators
      </div>
      <Pencil
        style={{ position: "absolute", left: 338, top: 738 }}
        width={24}
        height={24}
        color="#000000"
      />
      <div
        style={{
          position: "absolute",
          left: 302,
          top: 735,
          width: 30,
          height: 30,
          background: "#FFFFFF",
          border: "0.5px solid #EAEAEA",
          borderRadius: 27.84,
        }}
      />
      <ArrowUpRight
        style={{ position: "absolute", left: 307.4, top: 740.4 }}
        width={19.2}
        height={19.2}
        color="#000000"
      />
      {creatorCard(784, "c1")}
      {creatorCard(855, "c2")}
      {creatorCard(926, "c3")}

      {/* ==== Deliverables card ==== */}
      <div
        style={{
          position: "absolute",
          left: 27,
          top: 1019,
          width: 321,
          height: 52,
          background: "#FFFFFF",
          border: "1px solid #6C34AB",
          borderRadius: 8,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 43,
          top: 1030,
          width: 289,
          height: 30,
          fontFamily: outfit,
          fontWeight: 500,
          fontSize: 16,
          lineHeight: "30px",
          color: "#000000",
        }}
      >
        Deliverables
      </div>
      <Pencil
        style={{ position: "absolute", left: 338, top: 1033 }}
        width={24}
        height={24}
        color="#000000"
      />
      <div
        style={{
          position: "absolute",
          left: 302,
          top: 1030,
          width: 30,
          height: 30,
          background: "#FFFFFF",
          border: "1px solid #D4D4D4",
          borderRadius: 9999,
        }}
      />
      <Plus
        style={{ position: "absolute", left: 307, top: 1035 }}
        width={20}
        height={20}
        color="#000000"
      />

      {/* ==== Add-ons card ==== */}
      <div
        style={{
          position: "absolute",
          left: 27,
          top: 1083,
          width: 321,
          height: 52,
          background: "#FFFFFF",
          border: "1px solid #6C34AB",
          borderRadius: 8,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 43,
          top: 1094,
          width: 289,
          height: 30,
          fontFamily: outfit,
          fontWeight: 500,
          fontSize: 16,
          lineHeight: "30px",
          color: "#000000",
        }}
      >
        Add - ons &nbsp;&nbsp;•&nbsp;&nbsp;₹7,000
      </div>
      <ChevronDown
        style={{ position: "absolute", left: 308, top: 1105 }}
        width={24}
        height={12}
        color="#000000"
      />

      {/* ==== Payment Summary card ==== */}
      <div
        style={{
          position: "absolute",
          left: 27,
          top: 1147,
          width: 321,
          height: 102,
          background: "#FFFFFF",
          border: "1px solid #6C34AB",
          borderRadius: 8,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 43,
          top: 1153.5,
          width: 289,
          height: 30,
          fontFamily: outfit,
          fontWeight: 500,
          fontSize: 16,
          lineHeight: "30px",
          color: "#000000",
        }}
      >
        Payment Summary
      </div>
      <ChevronDown
        style={{ position: "absolute", left: 308, top: 1163 }}
        width={24}
        height={12}
        color="#000000"
      />
      <div
        style={{
          position: "absolute",
          left: 27,
          top: 1197,
          width: 320,
          height: 52,
          background: "#76D097",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 38,
          top: 1213,
          width: 112,
          height: 20,
          fontFamily: inter,
          fontWeight: 500,
          fontSize: 13,
          lineHeight: "20px",
          color: "#000000",
        }}
      >
        Estimate Payout
      </div>
      <div
        style={{
          position: "absolute",
          left: 266,
          top: 1213,
          width: 67,
          height: 20,
          fontFamily: inter,
          fontWeight: 700,
          fontSize: 14,
          lineHeight: "20px",
          color: "#FFFFFF",
        }}
      >
        ₹1,13,000
      </div>

      {/* ==== Status bar ==== */}
      <div
        style={{
          position: "absolute",
          left: 19,
          top: 31,
          width: 54,
          height: 18,
          fontFamily: urbanist,
          fontWeight: 600,
          fontSize: 15,
          lineHeight: "18px",
          color: "#000000",
          textAlign: "center",
        }}
      >
        19:56
      </div>
      <Signal
        style={{ position: "absolute", left: 292, top: 34 }}
        width={17}
        height={11}
        color="#000000"
      />
      <Wifi
        style={{ position: "absolute", left: 314, top: 34 }}
        width={16}
        height={11}
        color="#000000"
      />
      <BatteryFull
        style={{ position: "absolute", left: 332, top: 32 }}
        width={26}
        height={14}
        color="#000000"
      />
    </div>
  );
}
