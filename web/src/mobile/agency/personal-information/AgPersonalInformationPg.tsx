import { ChevronLeft, User, ChevronUp, ChevronDown, Building2 } from 'lucide-react';

/**
 * Agency — Personal Information screen.
 * Pixel-exact reproduction of Figma node 7791:22556 (375x876).
 * Static content, absolutely positioned with frame-relative coordinates.
 */
export default function AgPersonalInformationPg() {
  // Reusable input-field pill (label above, white pill with value).
  const Field = ({
    labelTop,
    labelLeft,
    labelWidth,
    label,
    pillTop,
    pillLeft,
    pillWidth,
    pillHeight,
    valueTop,
    valueLeft,
    valueWidth,
    valueHeight,
    value,
    valueLh,
  }: {
    labelTop: number;
    labelLeft: number;
    labelWidth: number;
    label: string;
    pillTop: number;
    pillLeft: number;
    pillWidth: number;
    pillHeight: number;
    valueTop: number;
    valueLeft: number;
    valueWidth: number;
    valueHeight: number;
    value: string;
    valueLh: number;
  }) => (
    <>
      {/* label */}
      <div
        style={{
          position: 'absolute',
          left: labelLeft,
          top: labelTop,
          width: labelWidth,
          height: 16,
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: 13,
          lineHeight: '15.7px',
          color: '#6B7280',
          textAlign: 'left',
        }}
      >
        {label}
      </div>
      {/* pill */}
      <div
        style={{
          position: 'absolute',
          left: pillLeft,
          top: pillTop,
          width: pillWidth,
          height: pillHeight,
          background: '#FFFFFF',
          border: '1px solid #FFFFFF',
          borderRadius: 100,
          boxShadow: '0 2px 8px rgba(17,24,39,0.06)',
        }}
      />
      {/* value */}
      <div
        style={{
          position: 'absolute',
          left: valueLeft,
          top: valueTop,
          width: valueWidth,
          height: valueHeight,
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 15,
          lineHeight: `${valueLh}px`,
          color: '#111827',
          textAlign: 'left',
        }}
      >
        {value}
      </div>
    </>
  );

  return (
    <div
      className="relative overflow-hidden"
      style={{ width: 375, height: 876, background: '#F8F5EF', fontFamily: 'Inter, sans-serif' }}
    >
      {/* ===== Header ===== */}
      {/* Back button */}
      <div
        style={{
          position: 'absolute',
          left: 16,
          top: 22,
          width: 36,
          height: 36,
          background: '#1F1A17',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ChevronLeft size={16} color="#FAF7F2" strokeWidth={1.35} />
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
        Personal Information
      </div>

      {/* ===== Basics (Expanded) card ===== */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 116,
          width: 335,
          height: 821,
          background: '#FFFFFF',
          border: '1px solid #FFFFFF',
          borderRadius: 28,
          boxShadow: '0 8px 24px rgba(17,24,39,0.06)',
        }}
      />

      {/* Card header row */}
      {/* purple icon bg */}
      <div
        style={{
          position: 'absolute',
          left: 33,
          top: 129,
          width: 48,
          height: 48,
          background: '#F3E8FF',
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <User size={24} color="#9333EA" strokeWidth={2} />
      </div>
      {/* Profile Info title */}
      <div
        style={{
          position: 'absolute',
          left: 97,
          top: 143.5,
          width: 189,
          height: 19,
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: 16,
          lineHeight: '19.4px',
          color: '#111827',
          textAlign: 'left',
        }}
      >
        Profile Info
      </div>
      {/* collapse chevron (expanded -> up) */}
      <div
        style={{
          position: 'absolute',
          left: 302,
          top: 135,
          width: 36,
          height: 36,
          background: '#FFFFFF',
          borderRadius: 18,
          boxShadow: '0 2px 6px rgba(17,24,39,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ChevronUp size={20} color="#6B7280" strokeWidth={1.67} />
      </div>

      {/* Avatar */}
      <div
        style={{
          position: 'absolute',
          left: 157.5,
          top: 201,
          width: 60,
          height: 60,
          borderRadius: 9999,
          border: '1px solid #FFFFFF',
          background: 'linear-gradient(135deg,#E9E4F0,#D9CFEA)',
        }}
      />
      {/* Change profile picture */}
      <div
        style={{
          position: 'absolute',
          left: 122,
          top: 268,
          width: 131,
          height: 20,
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 11,
          lineHeight: '20px',
          color: '#6B7280',
          textAlign: 'center',
        }}
      >
        Change profile picture
      </div>

      {/* First Name */}
      <Field
        labelTop={304}
        labelLeft={53}
        labelWidth={128.5}
        label="First Name"
        pillTop={328}
        pillLeft={37}
        pillWidth={144.5}
        pillHeight={52}
        valueTop={345}
        valueLeft={58}
        valueWidth={37}
        valueHeight={18}
        value="Rohit"
        valueLh={18.2}
      />
      {/* Last Name */}
      <Field
        labelTop={304}
        labelLeft={209.5}
        labelWidth={128.5}
        label="Last Name"
        pillTop={328}
        pillLeft={193.5}
        pillWidth={144.5}
        pillHeight={52}
        valueTop={345}
        valueLeft={214.5}
        valueWidth={46}
        valueHeight={18}
        value="Kumar"
        valueLh={18.2}
      />
      {/* Email */}
      <Field
        labelTop={396}
        labelLeft={53}
        labelWidth={285}
        label="Email"
        pillTop={420}
        pillLeft={37}
        pillWidth={301}
        pillHeight={52}
        valueTop={437}
        valueLeft={58}
        valueWidth={166}
        valueHeight={18}
        value="rohitkumar@gmail.com"
        valueLh={18.2}
      />
      {/* Assign as */}
      <Field
        labelTop={488}
        labelLeft={53}
        labelWidth={285}
        label="Assign as "
        pillTop={512}
        pillLeft={37}
        pillWidth={301}
        pillHeight={52}
        valueTop={529}
        valueLeft={58}
        valueWidth={64}
        valueHeight={18}
        value="Manager"
        valueLh={18.2}
      />
      {/* Phone */}
      <Field
        labelTop={581}
        labelLeft={53}
        labelWidth={285}
        label="Phone"
        pillTop={605}
        pillLeft={37}
        pillWidth={301}
        pillHeight={53}
        valueTop={622}
        valueLeft={58}
        valueWidth={123.8}
        valueHeight={19}
        value="+91 98765 43210"
        valueLh={18.1}
      />
      {/* Birth Date */}
      <Field
        labelTop={674}
        labelLeft={53}
        labelWidth={285}
        label="Birth Date"
        pillTop={698}
        pillLeft={37}
        pillWidth={301}
        pillHeight={52}
        valueTop={715}
        valueLeft={58}
        valueWidth={81}
        valueHeight={18}
        value="01/01/2001"
        valueLh={18.2}
      />
      {/* Gender */}
      <Field
        labelTop={767}
        labelLeft={53}
        labelWidth={285}
        label="Gender"
        pillTop={791}
        pillLeft={37}
        pillWidth={301}
        pillHeight={52}
        valueTop={808}
        valueLeft={58}
        valueWidth={35}
        valueHeight={18}
        value="Male"
        valueLh={18.2}
      />

      {/* Save Changes button */}
      <div
        style={{
          position: 'absolute',
          left: 37,
          top: 868,
          width: 301,
          height: 56,
          background: '#312B28',
          borderRadius: 100,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 131.6,
          top: 886,
          width: 111.8,
          height: 20,
          fontFamily: 'Inter, sans-serif',
          fontWeight: 700,
          fontSize: 16,
          lineHeight: '19.4px',
          color: '#FFFFFF',
          textAlign: 'center',
        }}
      >
        Save Changes
      </div>

      {/* ===== Language / Agency Info card (collapsed) ===== */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 949,
          width: 335,
          height: 74,
          background: '#FFFFFF',
          border: '1px solid #FFFFFF',
          borderRadius: 28,
          boxShadow: '0 8px 24px rgba(17,24,39,0.06)',
        }}
      />
      {/* blue icon bg */}
      <div
        style={{
          position: 'absolute',
          left: 33,
          top: 962,
          width: 48,
          height: 48,
          background: '#DBEAFE',
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Building2 size={24} color="#2563EB" strokeWidth={2} />
      </div>
      {/* Agency Info title */}
      <div
        style={{
          position: 'absolute',
          left: 97,
          top: 976.5,
          width: 189,
          height: 19,
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: 16,
          lineHeight: '19.4px',
          color: '#111827',
          textAlign: 'left',
        }}
      >
        Agency Info
      </div>
      {/* expand chevron (collapsed -> down) */}
      <div
        style={{
          position: 'absolute',
          left: 302,
          top: 968,
          width: 36,
          height: 36,
          background: '#FFFFFF',
          borderRadius: 18,
          boxShadow: '0 2px 6px rgba(17,24,39,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ChevronDown size={20} color="#6B7280" strokeWidth={1.67} />
      </div>
    </div>
  );
}
