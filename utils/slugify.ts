// utils/slugify.ts
// Vietnamese diacritic-insensitive string normalizer (used for member name search only)
const DIACRITIC_MAP: [RegExp, string][] = [
  [/á|à|ã|ạ|ả|â|ấ|ầ|ẫ|ậ|ẩ|ă|ắ|ằ|ẳ|ặ|À|Á|Ã|Â|Ấ|Ầ|Ẩ|Ậ|Ă|Ắ|Ằ|Ặ|Ẳ/g, 'a'],
  [/đ|Đ/g, 'd'],
  [/é|è|ẹ|ẻ|ê|ệ|ế|ề|ể|É|È|Ẹ|Ẻ|Ế|Ề|Ể|Ê/g, 'e'],
  [/í|ì|ỉ|ị|Ì|Í|Ỉ|Ị/g, 'i'],
  [/ó|ò|ô|õ|ơ|ỏ|ọ|ố|ồ|ổ|ộ|ờ|ớ|ở|ợ|Ó|Ò|Ô|Õ|Ố|Ồ|Ổ|Ộ|Ớ|Ờ|Ở|Ợ/g, 'o'],
  [/ú|ù|ủ|ụ|Ú|Ù|Ụ|Ủ|ư|ừ|ứ|ử|ự|Ư|Ứ|Ừ|Ử|Ự/g, 'u'],
  [/ý|ỳ|ỷ|ỵ|Ý|Ỳ|Ỵ|Ỷ/g, 'y'],
]

export function slugify(str: string): string {
  let s = str.toLowerCase()
  for (const [regex, latin] of DIACRITIC_MAP) {
    s = s.replace(regex, latin)
  }
  return s
}
