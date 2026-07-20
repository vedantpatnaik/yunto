import {
  ChevronLeft,
  Trash2,
  Phone,
  MessageCircle,
  Mail,
  Plus,
  Bell,
  Calendar,
} from "lucide-react";

/**
 * Agency app — Leads notes (Figma node 7691:5900, "Leads notes ", 375×876).
 * Self-contained, pixel-exact reproduction of the Figma outline. Every visual
 * node is absolutely positioned using its frame-relative coordinates.
 */
export default function AgLeadsNotesPg() {
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
      {/* ---------------------------- Header ---------------------------- */}
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
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        }}
      />
      <ChevronLeft
        style={{ position: "absolute", left: 25.9, top: 31.9 }}
        width={16.2}
        height={16.2}
        color="#FAF7F2"
        strokeWidth={2}
      />

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

      {/* Delete (red) button */}
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
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      />
      <Trash2
        style={{ position: "absolute", left: 322, top: 30 }}
        width={20}
        height={20}
        color="#E74C3C"
        strokeWidth={1.36}
      />

      {/* --------------------- Content: Lead card ----------------------- */}
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

      {/* Name */}
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
      {/* Sub */}
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
      {/* Amount */}
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

      {/* Action buttons */}
      <div
        style={{
          position: "absolute",
          left: 39,
          top: 248,
          width: 44,
          height: 44,
          background: "#FFFFFF",
          borderRadius: 22,
        }}
      />
      <Phone
        style={{ position: "absolute", left: 51, top: 260 }}
        width={20}
        height={20}
        color="#1D1D1F"
        strokeWidth={1.67}
      />
      <div
        style={{
          position: "absolute",
          left: 95,
          top: 248,
          width: 44,
          height: 44,
          background: "#FFFFFF",
          borderRadius: 22,
        }}
      />
      <MessageCircle
        style={{ position: "absolute", left: 107, top: 260 }}
        width={20}
        height={20}
        color="#1D1D1F"
        strokeWidth={1.67}
      />
      <div
        style={{
          position: "absolute",
          left: 151,
          top: 248,
          width: 44,
          height: 44,
          background: "#FFFFFF",
          borderRadius: 22,
        }}
      />
      <Mail
        style={{ position: "absolute", left: 163, top: 260 }}
        width={20}
        height={20}
        color="#1D1D1F"
        strokeWidth={1.67}
      />

      {/* ------------------------ Tab switcher -------------------------- */}
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
          borderRadius: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#6C6C70",
          fontFamily: "Geist, sans-serif",
          fontWeight: 600,
          fontSize: 14,
          lineHeight: "18.2px",
        }}
      >
        Lead Info
      </div>
      <div
        style={{
          position: "absolute",
          left: 187.5,
          top: 336,
          width: 167.5,
          height: 41,
          background: "#FFFFFF",
          borderRadius: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#1C1C1E",
          fontFamily: "Geist, sans-serif",
          fontWeight: 600,
          fontSize: 14,
          lineHeight: "18.2px",
        }}
      >
        Notes &amp; Activity
      </div>

      {/* -------------------- 1. Follow-Up Block ------------------------ */}
      <div
        style={{
          position: "absolute",
          left: 15,
          top: 397,
          width: 345,
          height: 56,
          background: "#FFE4E8",
          border: "1px solid #FFDAC4",
          borderRadius: 12,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 27,
          top: 409,
          width: 60.3,
          height: 32,
          background: "#FFFFFF",
          borderRadius: 6,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 39,
          top: 417,
          width: 36.3,
          height: 16,
          color: "#D81B60",
          fontWeight: 700,
          fontSize: 13,
          lineHeight: "15.7px",
        }}
      >
        20 Fri
      </div>
      <div
        style={{
          position: "absolute",
          left: 99.3,
          top: 416,
          width: 188.2,
          height: 18,
          color: "#1C1C1E",
          fontWeight: 600,
          fontSize: 15,
          lineHeight: "18.2px",
        }}
      >
        Add Follow-Up
      </div>
      <div
        style={{
          position: "absolute",
          left: 287.5,
          top: 409,
          width: 60.5,
          height: 32,
          background: "#FFFFFF",
          borderRadius: 999,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 303.5,
          top: 417,
          width: 28.5,
          height: 16,
          color: "#1C1C1E",
          fontWeight: 700,
          fontSize: 13,
          lineHeight: "15.7px",
        }}
      >
        ADD
      </div>

      {/* ------------------------ 2. Add Note --------------------------- */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 469,
          width: 335,
          height: 50,
          background: "#FFFFFF",
          border: "1px solid #E8E2D9",
          borderRadius: 12,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 39,
          top: 485,
          width: 271,
          height: 18,
          color: "#6C6C70",
          fontWeight: 400,
          fontSize: 15,
          lineHeight: "18.2px",
        }}
      >
        Add a quick note...
      </div>
      <div
        style={{
          position: "absolute",
          left: 312,
          top: 476,
          width: 36,
          height: 36,
          background: "#FFFFFF",
          borderRadius: 18,
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        }}
      />
      <Plus
        style={{ position: "absolute", left: 322, top: 486 }}
        width={16}
        height={16}
        color="#1C1C1E"
        strokeWidth={1.33}
      />

      {/* -------------------- 3. Activity Timeline ---------------------- */}
      {/* Vertical divider */}
      <div
        style={{
          position: "absolute",
          left: 31,
          top: 599,
          width: 2,
          height: 326,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.08), rgba(0,0,0,0.0))",
        }}
      />

      {/* --- Group: Today --- */}
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 563,
          width: 295,
          height: 15,
          color: "#6C6C70",
          fontWeight: 700,
          fontSize: 12,
          lineHeight: "14.5px",
        }}
      >
        TODAY
      </div>

      {/* Today - item 1: Reminder */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 604,
          width: 24,
          height: 24,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      />
      <Bell
        style={{ position: "absolute", left: 25, top: 609 }}
        width={14}
        height={14}
        color="#1C1C1E"
        strokeWidth={1.17}
      />
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 594,
          width: 295,
          height: 62,
          background: "#FFFFFF",
          border: "1px solid #E8E2D9",
          borderRadius: 12,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 77,
          top: 607,
          width: 261,
          height: 17,
          color: "#1C1C1E",
          fontWeight: 600,
          fontSize: 14,
          lineHeight: "16.9px",
        }}
      >
        Reminder for payment status
      </div>
      <div
        style={{
          position: "absolute",
          left: 77,
          top: 628,
          width: 261,
          height: 15,
          color: "#6C6C70",
          fontWeight: 500,
          fontSize: 12,
          lineHeight: "14.5px",
        }}
      >
        Today • 10:00 am
      </div>

      {/* Today - item 2: Follow-up scheduled */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 678,
          width: 24,
          height: 24,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      />
      <Calendar
        style={{ position: "absolute", left: 25, top: 683 }}
        width={14}
        height={14}
        color="#1C1C1E"
        strokeWidth={1.17}
      />
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 668,
          width: 295,
          height: 62,
          background: "#FFFFFF",
          border: "1px solid #E8E2D9",
          borderRadius: 12,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 77,
          top: 681,
          width: 261,
          height: 17,
          color: "#1C1C1E",
          fontWeight: 600,
          fontSize: 14,
          lineHeight: "16.9px",
        }}
      >
        Follow-up scheduled
      </div>
      <div
        style={{
          position: "absolute",
          left: 77,
          top: 702,
          width: 261,
          height: 15,
          color: "#6C6C70",
          fontWeight: 500,
          fontSize: 12,
          lineHeight: "14.5px",
        }}
      >
        Today • 02:00 pm
      </div>

      {/* --- Group: Yesterday --- */}
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 754,
          width: 295,
          height: 15,
          color: "#6C6C70",
          fontWeight: 700,
          fontSize: 12,
          lineHeight: "14.5px",
        }}
      >
        YESTERDAY
      </div>

      {/* Yesterday - item 1: Call */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 795,
          width: 24,
          height: 24,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      />
      <Phone
        style={{ position: "absolute", left: 25, top: 800 }}
        width={14}
        height={14}
        color="#1C1C1E"
        strokeWidth={1.17}
      />
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 785,
          width: 295,
          height: 62,
          background: "#FFFFFF",
          border: "1px solid #E8E2D9",
          borderRadius: 12,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 77,
          top: 798,
          width: 261,
          height: 17,
          color: "#1C1C1E",
          fontWeight: 600,
          fontSize: 14,
          lineHeight: "16.9px",
        }}
      >
        Call
      </div>
      <div
        style={{
          position: "absolute",
          left: 77,
          top: 819,
          width: 261,
          height: 15,
          color: "#6C6C70",
          fontWeight: 500,
          fontSize: 12,
          lineHeight: "14.5px",
        }}
      >
        Yesterday • 1:15 pm
      </div>

      {/* Yesterday - item 2: Contacted */}
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 869,
          width: 24,
          height: 24,
          background: "#FFFFFF",
          border: "1px solid #FFFFFF",
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      />
      <MessageCircle
        style={{ position: "absolute", left: 25, top: 874 }}
        width={14}
        height={14}
        color="#1C1C1E"
        strokeWidth={1.17}
      />
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 859,
          width: 295,
          height: 62,
          background: "#FFFFFF",
          border: "1px solid #E8E2D9",
          borderRadius: 12,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 77,
          top: 872,
          width: 261,
          height: 17,
          color: "#1C1C1E",
          fontWeight: 600,
          fontSize: 14,
          lineHeight: "16.9px",
        }}
      >
        Sunil Kumar contacted
      </div>
      <div
        style={{
          position: "absolute",
          left: 77,
          top: 893,
          width: 261,
          height: 15,
          color: "#6C6C70",
          fontWeight: 500,
          fontSize: 12,
          lineHeight: "14.5px",
        }}
      >
        Yesterday • 11:00 am
      </div>

      {/* ------------------------ Bottom bar ---------------------------- */}
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
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#1F1A17",
          fontWeight: 500,
          fontSize: 14,
          lineHeight: "16.9px",
        }}
      >
        Follow Up
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
          color: "#FFFFFF",
          fontWeight: 500,
          fontSize: 14,
          lineHeight: "16.9px",
        }}
      >
        Mark Converted
      </div>
    </div>
  );
}
