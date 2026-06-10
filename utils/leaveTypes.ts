// utils/leaveTypes.ts
// Leave request type IDs (matches backend enum)
export const FullDayOff   = 1
export const MorningOff   = 2
export const AfternoonOff = 3
export const LateForWork  = 4
export const LeaveEarly   = 5
export const GoOutside    = 6
export const WorkAtHome   = 7
export const BusinessTrip = 8
export const OtherLeave   = 9

// Subtract day-off type IDs
export const Subtract  = 1
export const ExtraWork = 2
export const Event     = 3
export const Other     = 4

/** Tailwind bg-class for each leave type cell */
export const LEAVE_TYPE_COLOR: Record<number, string> = {
  [FullDayOff]:   'bg-[#36722B] text-white',
  [MorningOff]:   'bg-[#CCB400] text-white',
  [AfternoonOff]: 'bg-[#BC6D00] text-white',
  [LateForWork]:  'bg-[#922010] text-white',
  [LeaveEarly]:   'bg-[#55196C] text-white',
  [GoOutside]:    'bg-[#0079BF] text-white',
  [WorkAtHome]:   'bg-[#c92c8a] text-white',
  [BusinessTrip]: 'bg-[#ff7373] text-white',
  [OtherLeave]:   'bg-[#7b8b95] text-white',
}

/** Special colour when LateForWork / GoOutside has a non-Subtract subtract type */
export const LEAVE_COMPENSATED_COLOR = 'bg-[#1aa39c] text-white'
