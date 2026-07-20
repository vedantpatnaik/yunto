import type { CSSProperties } from 'react';
import {
  Phone,
  MessageCircle,
  ArrowUp,
  ChevronDown,
  FileText,
  Paperclip,
  Link,
  Plus,
  Pencil,
  Sparkles,
  Trash2,
  Mail,
  Globe,
  ArrowLeft,
  Wifi,
} from 'lucide-react';

// Absolute-position style helper. All coordinates are frame-relative (root = 0,0).
const s = (
  l: number,
  t: number,
  w: number,
  h: number,
  extra?: CSSProperties,
): CSSProperties => ({
  position: 'absolute',
  left: l,
  top: t,
  width: w,
  height: h,
  boxSizing: 'border-box',
  ...extra,
});

const INTER = 'Inter, sans-serif';
const OUTFIT = 'Outfit, sans-serif';
const CLASH = "'Clash Display', sans-serif";
const URBANIST = 'Urbanist, sans-serif';

export default function AgLeadExpanded2Pg() {
  return (
    <div
      className="relative overflow-hidden"
      style={{ width: 375, height: 946, background: '#FFFFFF', fontFamily: INTER }}
    >
      {/* FRAME '2' background */}
      <div style={s(0, 0, 375, 1981, { background: '#FDFDFD' })} />

      {/* Background image placeholder (dynamic-ready) */}
      <div
        style={s(-13, 0, 402, 2045, {
          background: 'linear-gradient(135deg,#E9E4F0,#D9CFEA)',
        })}
      />

      {/* Decorative blobs (Group 35898 - top left cyan) */}
      <div
        style={s(-16.4, 127.5, 163.4, 157.1, {
          background: '#CCF5FD',
          borderRadius: 9999,
        })}
      />
      <div
        style={s(-25, 53, 157.1, 152.8, {
          background:
            'linear-gradient(135deg,rgba(70,181,252,0.7),rgba(143,190,255,0.7))',
          borderRadius: 9999,
        })}
      />

      {/* Decorative blobs (Group 35897 - purple/pink) */}
      <div
        style={s(66.6, 572, 493.7, 488.6, { background: '#FF90A9', borderRadius: 9999 })}
      />
      <div
        style={s(135.2, 417.6, 476.7, 473.2, {
          background: 'linear-gradient(135deg,#8673B3,#A79AC6)',
          borderRadius: 9999,
        })}
      />

      {/* ==================== STATUS BAR ==================== */}
      <div
        style={s(19, 31, 54, 18, {
          color: '#000000',
          fontFamily: URBANIST,
          fontWeight: 600,
          fontSize: 15,
          lineHeight: '18px',
          textAlign: 'center',
        })}
      >
        19:56
      </div>
      {/* Cellular bars */}
      <div style={s(292, 41.3, 3, 4, { background: '#000000', borderRadius: 0.6 })} />
      <div style={s(296.7, 39.3, 3, 6, { background: '#000000', borderRadius: 0.6 })} />
      <div style={s(301.3, 37, 3, 8.3, { background: '#000000', borderRadius: 0.6 })} />
      <div style={s(306, 34.7, 3, 10.7, { background: '#000000', borderRadius: 0.6 })} />
      {/* Wifi */}
      <div style={s(314, 34.3, 15.3, 11)}>
        <Wifi size={15} color="#000000" />
      </div>
      {/* Battery */}
      <div
        style={s(334.3, 34.3, 22, 11.3, {
          border: '1px solid #000000',
          borderRadius: 2.67,
          opacity: 0.4,
        })}
      />
      <div style={s(357.3, 38, 1.3, 4, { background: '#000000', borderRadius: 1, opacity: 0.4 })} />
      <div style={s(336.3, 36.3, 18, 7.3, { background: '#000000', borderRadius: 1.33 })} />

      {/* ==================== MAIN CARD ==================== */}
      {/* Rectangle 375 (lavender outer) */}
      <div
        style={s(16, 136, 343, 756, {
          background: '#D7DCFF',
          border: '1px solid #000000',
          borderRadius: 16.22,
        })}
      />
      {/* Frame 14593 (white inner) */}
      <div style={s(17, 137, 341, 754, { background: '#FFFFFF', borderRadius: 14 })} />

      {/* ---- Frame 1171275546 : bottom action buttons (behind content) ---- */}
      {/* Follow Up */}
      <div
        style={s(28, 753, 320, 51, {
          background: '#FFBCB8',
          border: '1px solid #000000',
          borderRadius: 16,
        })}
      />
      <div
        style={s(103, 769, 170, 19, {
          color: '#333333',
          fontFamily: OUTFIT,
          fontWeight: 600,
          fontSize: 15,
          lineHeight: '18.9px',
          textAlign: 'center',
        })}
      >
        Follow Up
      </div>
      {/* Mark Converted */}
      <div
        style={s(28, 816, 320, 51, {
          background: '#CDEED5',
          border: '1px solid #000000',
          borderRadius: 16,
        })}
      />
      <div
        style={s(103, 832, 170, 19, {
          color: '#333333',
          fontFamily: OUTFIT,
          fontWeight: 600,
          fontSize: 15,
          lineHeight: '18.9px',
          textAlign: 'center',
        })}
      >
        Mark Converted{' '}
      </div>

      {/* ---- Frame 14566 : Lead by: Leena Sharma ---- */}
      <div
        style={s(27, 359, 321, 52, {
          background: '#FFFFFF',
          border: '1px solid #6C34AB',
          borderRadius: 8,
        })}
      />
      <div
        style={s(43, 370, 215, 30, {
          color: '#000000',
          fontFamily: OUTFIT,
          fontWeight: 500,
          fontSize: 16,
          lineHeight: '16px',
          display: 'flex',
          alignItems: 'center',
        })}
      >
        Lead by: Leena Sharma
      </div>
      {/* arrow-up button */}
      <div
        style={s(226, 370, 30, 30, {
          background: '#F2F1F3',
          border: '1.16px solid #EAEAEA',
          borderRadius: 27.84,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        <ArrowUp size={13} color="#000000" strokeWidth={1.74} />
      </div>
      {/* call button */}
      <div
        style={s(266, 370, 30, 30, {
          background: '#F2F1F3',
          border: '1px solid #EAEAEA',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        <Phone size={16} color="#000000" />
      </div>
      {/* whatsapp */}
      <div
        style={s(303, 370, 30, 30, {
          background: 'linear-gradient(135deg,#1FAF38,#60D669)',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        <MessageCircle size={16} color="#FFFFFF" fill="#FFFFFF" />
      </div>

      {/* ---- Message card ---- */}
      <div
        style={s(28, 421, 318, 92, {
          background: '#FFFFFF',
          border: '1px solid #6C34AB',
          borderRadius: 8,
        })}
      />
      <div
        style={s(44, 432, 289, 30, {
          color: '#000000',
          fontFamily: OUTFIT,
          fontWeight: 500,
          fontSize: 16,
          lineHeight: '16px',
          display: 'flex',
          alignItems: 'center',
        })}
      >
        Message
      </div>
      <div style={s(309, 441, 24, 12, { display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
        <ChevronDown size={16} color="#000000" />
      </div>
      <div
        style={s(44, 466, 289, 36, {
          color: '#000000',
          fontFamily: INTER,
          fontWeight: 400,
          fontSize: 12,
          lineHeight: '20px',
        })}
      >
        We are launching a new skincare product and...
      </div>

      {/* ---- Script card ---- */}
      <div
        style={s(26, 525, 320, 187, {
          background: '#FFFFFF',
          border: '1px solid #6C34AB',
          borderRadius: 8,
        })}
      />
      <div
        style={s(42, 536, 289, 30, {
          color: '#000000',
          fontFamily: OUTFIT,
          fontWeight: 500,
          fontSize: 16,
          lineHeight: '16px',
          display: 'flex',
          alignItems: 'center',
        })}
      >
        Script
      </div>
      <div style={s(307, 545, 24, 12, { display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
        <ChevronDown size={16} color="#000000" />
      </div>
      <div
        style={s(42, 570, 289, 36, {
          color: '#000000',
          fontFamily: INTER,
          fontWeight: 400,
          fontSize: 12,
          lineHeight: '20px',
        })}
      >
        Here comes the scripts
      </div>
      {/* Reference Doc chip */}
      <div
        style={s(42, 619, 289, 33, {
          background: '#FFFFFF',
          border: '0.5px solid #D9D9D9',
          borderRadius: 12,
        })}
      />
      <div style={s(48, 626, 20, 20, { display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
        <FileText size={16} color="#000000" />
      </div>
      <div
        style={s(70, 630, 72, 12, {
          color: '#000000',
          fontFamily: OUTFIT,
          fontWeight: 300,
          fontSize: 10.2,
          lineHeight: '12px',
          textAlign: 'center',
        })}
      >
        Reference Doc.
      </div>
      {/* comment input */}
      <div
        style={s(42, 666, 202, 30, {
          background: '#FFFFFF',
          border: '0.5px solid #D9D9D9',
          borderRadius: 12,
        })}
      />
      <div
        style={s(50, 675, 85, 12, {
          color: '#000000',
          fontFamily: OUTFIT,
          fontWeight: 400,
          fontSize: 12,
          lineHeight: '12px',
        })}
      >
        Add a comment
      </div>
      {/* attach button */}
      <div
        style={s(262, 666, 30, 30, {
          border: '0.5px solid #D9D9D9',
          borderRadius: 27.84,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        <Paperclip size={16} color="#000000" />
      </div>
      {/* link button */}
      <div
        style={s(301, 666, 30, 30, {
          border: '0.5px solid #D9D9D9',
          borderRadius: 27.84,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        <Link size={15} color="#000000" />
      </div>

      {/* ---- Creators ---- */}
      <div
        style={s(28, 724, 318, 52, {
          background: '#FFFFFF',
          border: '1px solid #6C34AB',
          borderRadius: 8,
        })}
      />
      <div
        style={s(44, 735, 289, 30, {
          color: '#000000',
          fontFamily: OUTFIT,
          fontWeight: 500,
          fontSize: 16,
          lineHeight: '16px',
          display: 'flex',
          alignItems: 'center',
        })}
      >
        Creators
      </div>
      <div style={s(339, 738, 24, 24, { display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
        <Pencil size={18} color="#000000" />
      </div>
      <div
        style={s(303, 735, 30, 30, {
          background: '#FFFFFF',
          border: '1px solid #D4D4D4',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        <Plus size={16} color="#000000" />
      </div>

      {/* ---- Deliverables ---- */}
      <div
        style={s(28, 788, 318, 52, {
          background: '#FFFFFF',
          border: '1px solid #6C34AB',
          borderRadius: 8,
        })}
      />
      <div
        style={s(44, 799, 289, 30, {
          color: '#000000',
          fontFamily: OUTFIT,
          fontWeight: 500,
          fontSize: 16,
          lineHeight: '16px',
          display: 'flex',
          alignItems: 'center',
        })}
      >
        Deliverables
      </div>
      <div style={s(339, 802, 24, 24, { display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
        <Pencil size={18} color="#000000" />
      </div>
      <div
        style={s(303, 799, 30, 30, {
          background: '#FFFFFF',
          border: '1px solid #D4D4D4',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        <Plus size={16} color="#000000" />
      </div>

      {/* ---- Add-ons ---- */}
      <div
        style={s(28, 852, 318, 52, {
          background: '#FFFFFF',
          border: '1px solid #6C34AB',
          borderRadius: 8,
        })}
      />
      <div
        style={s(44, 863, 289, 30, {
          color: '#000000',
          fontFamily: OUTFIT,
          fontWeight: 500,
          fontSize: 16,
          lineHeight: '16px',
          display: 'flex',
          alignItems: 'center',
        })}
      >
        Add - ons&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;₹7,000
      </div>
      <div style={s(309, 874, 24, 12, { display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
        <ChevronDown size={16} color="#000000" />
      </div>

      {/* ---- Payment Summary ---- */}
      <div
        style={s(28, 916, 318, 102, {
          background: '#FFFFFF',
          border: '1px solid #6C34AB',
          borderRadius: 8,
          overflow: 'hidden',
        })}
      />
      <div
        style={s(42, 922.5, 289, 30, {
          color: '#000000',
          fontFamily: OUTFIT,
          fontWeight: 500,
          fontSize: 16,
          lineHeight: '16px',
          display: 'flex',
          alignItems: 'center',
        })}
      >
        Payment Summary
      </div>
      <div style={s(307, 932, 24, 12, { display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
        <ChevronDown size={16} color="#000000" />
      </div>
      {/* green payout bar */}
      <div style={s(28, 966, 320, 52, { background: '#76D097' })} />
      <div
        style={s(39, 982, 112, 20, {
          color: '#000000',
          fontFamily: INTER,
          fontWeight: 500,
          fontSize: 13,
          lineHeight: '20px',
        })}
      >
        Estimate Payout
      </div>
      <div
        style={s(267, 982, 67, 20, {
          color: '#FFFFFF',
          fontFamily: INTER,
          fontWeight: 700,
          fontSize: 14,
          lineHeight: '20px',
        })}
      >
        ₹1,13,000
      </div>

      {/* ==================== HEADER CONTENT (on top of card) ==================== */}
      {/* cosmetic icon circle */}
      <div
        style={s(27, 154, 40, 40, {
          background: '#FFFFFF',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        <Sparkles size={22} color="#000000" />
      </div>
      {/* Barter pill */}
      <div style={s(77, 159, 63, 30, { background: '#FFFFFF', borderRadius: 24 })} />
      <div
        style={s(85, 166, 47, 16, {
          color: '#000000',
          fontFamily: OUTFIT,
          fontWeight: 500,
          fontSize: 12,
          lineHeight: '16px',
          textAlign: 'center',
        })}
      >
        Barter
      </div>
      {/* Contacted pill */}
      <div style={s(150, 159, 78, 30, { background: '#FFFFFF', borderRadius: 24 })} />
      <div
        style={s(158, 166, 61, 16, {
          color: '#000000',
          fontFamily: OUTFIT,
          fontWeight: 500,
          fontSize: 12,
          lineHeight: '16px',
          textAlign: 'center',
        })}
      >
        Contacted
      </div>
      {/* trash button */}
      <div
        style={s(311, 159, 30, 30, {
          background: '#FFFFFF',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        <Trash2 size={16} color="#000000" />
      </div>

      {/* name + budget */}
      <div
        style={s(27, 216, 205, 22, {
          color: '#000000',
          fontFamily: CLASH,
          fontWeight: 500,
          fontSize: 20,
          lineHeight: '24px',
        })}
      >
        Priya Sharma
      </div>
      <div
        style={s(27, 242, 68, 16, {
          color: '#000000',
          fontFamily: INTER,
          fontWeight: 400,
          fontSize: 12,
          lineHeight: '16px',
        })}
      >
        Zostel Trip
      </div>
      <div
        style={s(95, 242, 11.5, 16, {
          color: '#5D5D5D',
          fontFamily: INTER,
          fontWeight: 400,
          fontSize: 10.2,
          lineHeight: '16px',
        })}
      >
        {' • '}
      </div>
      <div
        style={s(109, 242, 91, 16, {
          color: '#000000',
          fontFamily: INTER,
          fontWeight: 600,
          fontSize: 12,
          lineHeight: '16px',
        })}
      >
        Budget ₹1.2L
      </div>
      {/* header call button */}
      <div
        style={s(281, 222, 30, 30, {
          background: '#FFFFFF',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        <Phone size={16} color="#000000" />
      </div>
      {/* header whatsapp */}
      <div
        style={s(318, 222, 30, 30, {
          background: 'linear-gradient(135deg,#1FAF38,#60D669)',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        <MessageCircle size={16} color="#FFFFFF" fill="#FFFFFF" />
      </div>

      {/* email chip */}
      <div style={s(27, 272, 154, 32, { background: '#B0BBFF', borderRadius: 14 })} />
      <div style={s(52.5, 280, 16, 16, { display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
        <Mail size={13} color="#121212" />
      </div>
      <div
        style={s(73.5, 280, 82, 16, {
          color: '#121212',
          fontFamily: INTER,
          fontWeight: 400,
          fontSize: 10.2,
          lineHeight: '16px',
        })}
      >
        Sunil@gmail.com
      </div>
      {/* website chip */}
      <div style={s(189, 272, 159, 32, { background: '#B0BBFF', borderRadius: 14 })} />
      <div style={s(204, 280, 16, 16, { display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
        <Globe size={13} color="#000000" />
      </div>
      <div
        style={s(225, 280, 108, 16, {
          color: '#000000',
          fontFamily: INTER,
          fontWeight: 400,
          fontSize: 10.2,
          lineHeight: '16px',
        })}
      >
        www.bobbibrown.com{' '}
      </div>

      {/* tabs */}
      <div style={s(27, 316, 162, 31, { border: '1px solid #FFFFFF' })} />
      <div
        style={s(27, 316, 162, 31, {
          color: '#000000',
          fontFamily: OUTFIT,
          fontWeight: 400,
          fontSize: 15,
          lineHeight: '31px',
          textAlign: 'center',
        })}
      >
        Lead Info
      </div>
      <div
        style={s(222, 316, 126, 31, {
          color: '#000000',
          fontFamily: OUTFIT,
          fontWeight: 500,
          fontSize: 15,
          lineHeight: '31px',
          textAlign: 'center',
        })}
      >
        Notes & Activity
      </div>

      {/* ==================== TOP NAV (Container) ==================== */}
      <div
        style={s(0, 70, 375, 54, {
          background: '#FFFFFF',
          borderBottom: '1px solid #717171',
        })}
      />
      <div style={s(16, 85, 24, 24, { display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
        <ArrowLeft size={18} color="#000000" strokeWidth={2} />
      </div>
      <div
        style={s(44, 82, 298, 30, {
          color: '#1B1B1C',
          fontFamily: CLASH,
          fontWeight: 500,
          fontSize: 20,
          lineHeight: '30px',
        })}
      >
        Leads
      </div>
    </div>
  );
}
