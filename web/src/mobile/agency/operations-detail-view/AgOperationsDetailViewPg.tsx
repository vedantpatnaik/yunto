import {
  ChevronLeft,
  Briefcase,
  MoreVertical,
  Phone,
  MessageCircle,
  Instagram,
} from 'lucide-react';

/**
 * Operations detail view — Yunto agency mobile screen.
 * Figma node 7810:23986. Pixel-exact static reproduction (375x876).
 */
export default function AgOperationsDetailViewPg() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: 375,
        height: 876,
        background: '#F8F5EF',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Decorative gradient blob (top-right) */}
      <div
        style={{
          position: 'absolute',
          left: 240.6,
          top: -57.6,
          width: 192,
          height: 192,
          borderRadius: 9999,
          background: 'linear-gradient(135deg, #E0E7FF, #F3E8FF)',
          opacity: 0.55,
          filter: 'blur(2px)',
        }}
      />

      {/* ===== Header ===== */}
      {/* Back button */}
      <div
        style={{
          position: 'absolute',
          left: 16,
          top: 22,
          width: 36,
          height: 36,
          borderRadius: 9999,
          background: '#1F1A17',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(31,26,23,0.18)',
        }}
      >
        <ChevronLeft size={18} strokeWidth={1.5} color="#FAF7F2" />
      </div>
      {/* Heading */}
      <div
        style={{
          position: 'absolute',
          left: 72,
          top: 28,
          width: 222,
          height: 24,
          fontFamily: 'Geist, sans-serif',
          fontWeight: 500,
          fontSize: 20,
          lineHeight: '24px',
          color: '#141311',
          textAlign: 'left',
        }}
      >
        Team
      </div>

      {/* Header divider */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 80,
          width: 335,
          height: 1,
          background: '#E2E8F0',
        }}
      />

      {/* ===== Card 1 — Operations team ===== */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 101,
          width: 335,
          height: 254,
          background: '#FFFFFF',
          border: '1px solid #FFFFFF',
          borderRadius: 24,
          boxShadow: '0 8px 24px rgba(17,17,17,0.06)',
        }}
      />

      {/* Team icon chip */}
      <div
        style={{
          position: 'absolute',
          left: 41,
          top: 122,
          width: 48,
          height: 48,
          borderRadius: 40,
          background: 'linear-gradient(135deg, #C7D2FE, #E0E7FF)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Briefcase size={20} strokeWidth={2} color="#4F39F6" />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 101,
          top: 126,
          width: 233,
          height: 24,
          fontWeight: 600,
          fontSize: 16,
          lineHeight: '24px',
          color: '#111111',
        }}
      >
        Operations
      </div>
      <div
        style={{
          position: 'absolute',
          left: 101,
          top: 150,
          width: 233,
          height: 16,
          fontWeight: 400,
          fontSize: 12,
          lineHeight: '16px',
          color: '#64748B',
        }}
      >
        10 Members
      </div>

      {/* Divider inside card 1 */}
      <div
        style={{
          position: 'absolute',
          left: 41,
          top: 186,
          width: 293,
          height: 1,
          background: '#E2E8F0',
        }}
      />

      {/* Member row */}
      <div
        style={{
          position: 'absolute',
          left: 16,
          top: 203,
          width: 333,
          height: 74,
          background: '#FFFFFF',
          border: '1px solid #FFFFFF',
          borderRadius: 40,
          boxShadow: '0 4px 16px rgba(17,17,17,0.05)',
        }}
      />
      {/* Avatar (image placeholder) */}
      <div
        style={{
          position: 'absolute',
          left: 33,
          top: 216,
          width: 48,
          height: 48,
          borderRadius: 9999,
          background: 'linear-gradient(135deg, #E9E4F0, #D9CFEA)',
          border: '2px solid #FFFFFF',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 93,
          top: 222,
          width: 120,
          height: 20,
          fontWeight: 600,
          fontSize: 12,
          lineHeight: '20px',
          color: '#111111',
        }}
      >
        Riya Verma
      </div>
      <div
        style={{
          position: 'absolute',
          left: 93,
          top: 242,
          width: 120,
          height: 16,
          fontWeight: 400,
          fontSize: 12,
          lineHeight: '16px',
          color: '#64748B',
        }}
      >
        Operations
      </div>
      {/* Active badge */}
      <div
        style={{
          position: 'absolute',
          left: 225,
          top: 227,
          width: 75,
          height: 26,
          background: '#F0FDF4',
          border: '1px solid #7BF1A8',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 238,
          top: 237,
          width: 6,
          height: 6,
          borderRadius: 9999,
          background: '#05DF72',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 250,
          top: 232,
          width: 37,
          height: 16,
          fontWeight: 500,
          fontSize: 12,
          lineHeight: '16px',
          color: '#00A63E',
        }}
      >
        Active
      </div>
      {/* More button */}
      <div
        style={{
          position: 'absolute',
          left: 312,
          top: 232,
          width: 20,
          height: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MoreVertical size={16} strokeWidth={2} color="#64748B" />
      </div>

      {/* Dark "All Campaign" pill */}
      <div
        style={{
          position: 'absolute',
          left: 30,
          top: 306,
          width: 133,
          height: 32,
          background: '#111111',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 42,
          top: 314,
          width: 79,
          height: 16,
          fontWeight: 500,
          fontSize: 12,
          lineHeight: '16px',
          color: '#F4F6F8',
        }}
      >
        All Campaign
      </div>
      <div
        style={{
          position: 'absolute',
          left: 131,
          top: 312,
          width: 20,
          height: 20,
          borderRadius: 9999,
          background: 'rgba(255,255,255,0.2)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 137,
          top: 314,
          width: 8,
          height: 16,
          fontWeight: 500,
          fontSize: 12,
          lineHeight: '16px',
          color: '#F4F6F8',
        }}
      >
        8
      </div>

      {/* Yellow "Campaign" pill */}
      <div
        style={{
          position: 'absolute',
          left: 176.5,
          top: 307,
          width: 115,
          height: 30,
          background: '#FFFBEB',
          border: '1px solid #FFD230',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 189.5,
          top: 319,
          width: 6,
          height: 6,
          borderRadius: 9999,
          background: '#FFB900',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 201.5,
          top: 314,
          width: 59,
          height: 16,
          fontWeight: 500,
          fontSize: 12,
          lineHeight: '16px',
          color: '#BB4D00',
        }}
      >
        Campaign
      </div>
      <div
        style={{
          position: 'absolute',
          left: 270.5,
          top: 314,
          width: 8,
          height: 16,
          fontWeight: 500,
          fontSize: 12,
          lineHeight: '16px',
          color: '#BB4D00',
        }}
      >
        5
      </div>

      {/* ===== Card 2 — indigo tinted lead ===== */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 371,
          width: 335,
          height: 147,
          background: '#E0E7FF',
          border: '1px solid #FFFFFF',
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 371,
          width: 335,
          height: 147,
          background: '#FFFFFF',
          opacity: 0.65,
          borderRadius: 24,
          boxShadow: '0 8px 24px rgba(67,45,215,0.06)',
        }}
      />
      {/* Barter pill */}
      <div
        style={{
          position: 'absolute',
          left: 37,
          top: 389,
          width: 59,
          height: 26,
          background: '#EEF2FF',
          border: '1px solid #A3B3FF',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 48,
          top: 394,
          width: 37,
          height: 16,
          fontWeight: 600,
          fontSize: 12,
          lineHeight: '16px',
          color: '#432DD7',
        }}
      >
        Barter
      </div>
      {/* Converted pill */}
      <div
        style={{
          position: 'absolute',
          left: 104,
          top: 389,
          width: 84,
          height: 26,
          background: '#EFF6FF',
          border: '1px solid #8EC5FF',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 115,
          top: 394,
          width: 62,
          height: 16,
          fontWeight: 600,
          fontSize: 12,
          lineHeight: '16px',
          color: '#1447E6',
        }}
      >
        Converted
      </div>
      {/* Action buttons */}
      <div
        style={{
          position: 'absolute',
          left: 238,
          top: 388,
          width: 28,
          height: 28,
          background: '#FFFFFF',
          border: '1px solid #FFFFFF',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(17,17,17,0.08)',
        }}
      >
        <Phone size={14} strokeWidth={1.5} color="#64748B" />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 274,
          top: 388,
          width: 28,
          height: 28,
          background: '#FFFFFF',
          border: '1px solid #FFFFFF',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(17,17,17,0.08)',
        }}
      >
        <MessageCircle size={14} strokeWidth={1.5} color="#64748B" />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 310,
          top: 388,
          width: 28,
          height: 28,
          background: '#FFFFFF',
          border: '1px solid #FFFFFF',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(17,17,17,0.08)',
        }}
      >
        <Instagram size={14} strokeWidth={1.5} color="#64748B" />
      </div>
      {/* Data grid */}
      <div
        style={{
          position: 'absolute',
          left: 37,
          top: 428,
          width: 142.5,
          height: 16,
          fontWeight: 400,
          fontSize: 12,
          lineHeight: '16px',
          color: '#64748B',
        }}
      >
        Name
      </div>
      <div
        style={{
          position: 'absolute',
          left: 37,
          top: 444,
          width: 142.5,
          height: 18,
          fontWeight: 600,
          fontSize: 14,
          lineHeight: '17.5px',
          color: '#111111',
        }}
      >
        Aditya Mehta
      </div>
      <div
        style={{
          position: 'absolute',
          left: 195.5,
          top: 428,
          width: 142.5,
          height: 16,
          fontWeight: 400,
          fontSize: 12,
          lineHeight: '16px',
          color: '#64748B',
        }}
      >
        Company
      </div>
      <div
        style={{
          position: 'absolute',
          left: 195.5,
          top: 444,
          width: 142.5,
          height: 18,
          fontWeight: 600,
          fontSize: 14,
          lineHeight: '17.5px',
          color: '#111111',
        }}
      >
        FabHotels
      </div>
      <div
        style={{
          position: 'absolute',
          left: 37,
          top: 467.5,
          width: 142.5,
          height: 16,
          fontWeight: 400,
          fontSize: 12,
          lineHeight: '16px',
          color: '#64748B',
        }}
      >
        Budget
      </div>
      <div
        style={{
          position: 'absolute',
          left: 37,
          top: 483.5,
          width: 142.5,
          height: 18,
          fontWeight: 600,
          fontSize: 14,
          lineHeight: '17.5px',
          color: '#111111',
        }}
      >
        ₹2.5L
      </div>
      <div
        style={{
          position: 'absolute',
          left: 195.5,
          top: 467.5,
          width: 142.5,
          height: 16,
          fontWeight: 400,
          fontSize: 12,
          lineHeight: '16px',
          color: '#64748B',
        }}
      >
        Lead Owner
      </div>
      <div
        style={{
          position: 'absolute',
          left: 195.5,
          top: 483.5,
          width: 142.5,
          height: 18,
          fontWeight: 600,
          fontSize: 14,
          lineHeight: '17.5px',
          color: '#111111',
        }}
      >
        Rahul Verma
      </div>

      {/* ===== Card 3 — pink tinted lead ===== */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 534,
          width: 335,
          height: 147,
          background: '#FCE7F3',
          border: '1px solid #FFFFFF',
          borderRadius: 24,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 534,
          width: 335,
          height: 147,
          background: '#FFFFFF',
          opacity: 0.65,
          borderRadius: 24,
          boxShadow: '0 8px 24px rgba(198,0,92,0.06)',
        }}
      />
      {/* Paid pill */}
      <div
        style={{
          position: 'absolute',
          left: 37,
          top: 552,
          width: 48,
          height: 26,
          background: '#FDF2F8',
          border: '1px solid #FDA5D5',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 48,
          top: 557,
          width: 26,
          height: 16,
          fontWeight: 600,
          fontSize: 12,
          lineHeight: '16px',
          color: '#C6005C',
        }}
      >
        Paid
      </div>
      {/* Converted pill */}
      <div
        style={{
          position: 'absolute',
          left: 93,
          top: 552,
          width: 84,
          height: 26,
          background: '#EFF6FF',
          border: '1px solid #8EC5FF',
          borderRadius: 9999,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 104,
          top: 557,
          width: 62,
          height: 16,
          fontWeight: 600,
          fontSize: 12,
          lineHeight: '16px',
          color: '#1447E6',
        }}
      >
        Converted
      </div>
      {/* Action buttons */}
      <div
        style={{
          position: 'absolute',
          left: 238,
          top: 551,
          width: 28,
          height: 28,
          background: '#FFFFFF',
          border: '1px solid #FFFFFF',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(17,17,17,0.08)',
        }}
      >
        <Phone size={14} strokeWidth={1.5} color="#64748B" />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 274,
          top: 551,
          width: 28,
          height: 28,
          background: '#FFFFFF',
          border: '1px solid #FFFFFF',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(17,17,17,0.08)',
        }}
      >
        <MessageCircle size={14} strokeWidth={1.5} color="#64748B" />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 310,
          top: 551,
          width: 28,
          height: 28,
          background: '#FFFFFF',
          border: '1px solid #FFFFFF',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(17,17,17,0.08)',
        }}
      >
        <Instagram size={14} strokeWidth={1.5} color="#64748B" />
      </div>
      {/* Data grid */}
      <div
        style={{
          position: 'absolute',
          left: 37,
          top: 591,
          width: 142.5,
          height: 16,
          fontWeight: 400,
          fontSize: 12,
          lineHeight: '16px',
          color: '#64748B',
        }}
      >
        Name
      </div>
      <div
        style={{
          position: 'absolute',
          left: 37,
          top: 607,
          width: 142.5,
          height: 18,
          fontWeight: 600,
          fontSize: 14,
          lineHeight: '17.5px',
          color: '#111111',
        }}
      >
        Ravi Gupta
      </div>
      <div
        style={{
          position: 'absolute',
          left: 195.5,
          top: 591,
          width: 142.5,
          height: 16,
          fontWeight: 400,
          fontSize: 12,
          lineHeight: '16px',
          color: '#64748B',
        }}
      >
        Company
      </div>
      <div
        style={{
          position: 'absolute',
          left: 195.5,
          top: 607,
          width: 142.5,
          height: 18,
          fontWeight: 600,
          fontSize: 14,
          lineHeight: '17.5px',
          color: '#111111',
        }}
      >
        Nykaa Fashion
      </div>
      <div
        style={{
          position: 'absolute',
          left: 37,
          top: 630.5,
          width: 142.5,
          height: 16,
          fontWeight: 400,
          fontSize: 12,
          lineHeight: '16px',
          color: '#64748B',
        }}
      >
        Budget
      </div>
      <div
        style={{
          position: 'absolute',
          left: 37,
          top: 646.5,
          width: 142.5,
          height: 18,
          fontWeight: 600,
          fontSize: 14,
          lineHeight: '17.5px',
          color: '#111111',
        }}
      >
        ₹3.6L
      </div>
      <div
        style={{
          position: 'absolute',
          left: 195.5,
          top: 630.5,
          width: 142.5,
          height: 16,
          fontWeight: 400,
          fontSize: 12,
          lineHeight: '16px',
          color: '#64748B',
        }}
      >
        Lead Owner
      </div>
      <div
        style={{
          position: 'absolute',
          left: 195.5,
          top: 646.5,
          width: 142.5,
          height: 18,
          fontWeight: 600,
          fontSize: 14,
          lineHeight: '17.5px',
          color: '#111111',
        }}
      >
        Leena Sharma
      </div>
    </div>
  );
}
