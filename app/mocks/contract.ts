export type Contract = {
  id: number
  user: string
  branch: string
  start: string
  end: string | null
  joined: string
  type: string
}

export type ContractType = {
  id: number
  name: string
  file: string
  created: string
  updated: string
}

export const CONTRACTS: Contract[] = [
  { id: 1,  user: 'Nguyễn Tấn Nam',      branch: 'Đà Nẵng', start: '2023-06-01', end: null,         joined: '2019-05-01', type: 'HĐ lao động chính thức (Không XĐ thời hạn) 202210' },
  { id: 2,  user: '[Temp]Đặng Xuân Ấn',  branch: 'Hà Nội',  start: '2023-05-06', end: '2024-05-05', joined: '2023-03-06', type: 'HĐ lao động chính thức (XĐ thời hạn)_202209' },
  { id: 3,  user: 'Nguyễn Đăng Thông',   branch: 'Đà Nẵng', start: '2023-04-21', end: '2026-04-20', joined: '2022-01-17', type: 'Phụ lục hợp đồng 2022' },
  { id: 4,  user: 'Nguyễn Mạnh Hoan',    branch: 'Đà Nẵng', start: '2023-04-21', end: '2026-04-20', joined: '2021-11-01', type: 'Phụ lục hợp đồng 2022' },
  { id: 5,  user: 'Trịnh Ngọc Tuấn',     branch: 'Đà Nẵng', start: '2023-04-21', end: '2026-04-20', joined: '2021-08-30', type: 'Phụ lục hợp đồng 2022' },
  { id: 6,  user: 'Nguyễn Tấn Nam',      branch: 'Đà Nẵng', start: '2023-04-21', end: '2026-04-20', joined: '2019-05-01', type: 'Phụ lục hợp đồng 2022' },
  { id: 7,  user: 'Đặng Đình Nhân',      branch: 'Đà Nẵng', start: '2023-04-21', end: '2026-04-20', joined: '2020-03-02', type: 'Phụ lục hợp đồng 2022' },
  { id: 8,  user: 'Vũ Thị Bích Diệp',    branch: 'Hà Nội',  start: '2023-04-21', end: '2024-04-20', joined: '2022-09-05', type: 'Phụ lục hợp đồng 2022' },
  { id: 9,  user: 'Nguyễn Thị Kim Ngân', branch: 'Hà Nội',  start: '2023-04-21', end: '2024-04-20', joined: '2022-07-01', type: 'Phụ lục hợp đồng 2022' },
  { id: 10, user: 'Hoàng Thị Thu',       branch: 'Hà Nội',  start: '2023-04-21', end: '2026-04-20', joined: '2021-10-18', type: 'Phụ lục hợp đồng 2022' },
  { id: 11, user: 'Lê Minh Long',        branch: 'Hà Nội',  start: '2023-04-21', end: '2026-04-20', joined: '2018-06-01', type: 'Phụ lục hợp đồng 2022' },
  { id: 12, user: 'Nguyễn Đăng Thông',   branch: 'Đà Nẵng', start: '2023-03-17', end: '2026-03-16', joined: '2022-01-17', type: 'HĐ lao động chính thức (XĐ thời hạn)_202209' },
  { id: 13, user: '[Temp]Đặng Xuân Ấn',  branch: 'Hà Nội',  start: '2023-03-06', end: null,         joined: '2023-03-06', type: 'HĐ Bảo mật thông tin 2022' },
  { id: 14, user: '[Temp]Đặng Xuân Ấn',  branch: 'Hà Nội',  start: '2023-03-06', end: '2023-05-05', joined: '2023-03-06', type: 'Bản cam kết 2022' },
]

export const CONTRACT_TYPES: ContractType[] = [
  { id: 1,  name: 'Phụ lục hợp đồng 2022',                              file: 'Phụ_lục_hợp_đồng_2022__1683536646065.docx',                            created: '2023/05/08', updated: '2023/05/08' },
  { id: 2,  name: 'Bản cam kết 2022',                                   file: 'Bản_cam_kết_2022_1668409037.docx',                                      created: '2022/07/08', updated: '2022/11/14' },
  { id: 3,  name: 'HĐ lao động chính thức (Không XĐ thời hạn) 202210', file: 'HĐ_lao_động_chính_thức_(Không_XĐ_thời_hạn)__1666612740300.docx',        created: '2022/10/24', updated: '2022/10/24' },
  { id: 4,  name: 'HĐ lao động chính thức (XĐ thời hạn)_202209',        file: 'HĐ_lao_động_chính_thức_(XĐ_thời_hạn)__202209_1664249121221.docx',       created: '2022/09/27', updated: '2022/09/27' },
  { id: 5,  name: 'HĐ Bảo mật thông tin 2022',                          file: 'HĐ_Bảo_mật_thông_tin_2022_1664249121221.docx',                          created: '2022/09/27', updated: '2022/09/27' },
  { id: 6,  name: 'HĐ thử việc 2022/09',                                file: 'HĐ_thử_việc_2022_09__1664249024942.docx',                               created: '2022/09/27', updated: '2022/09/27' },
  { id: 7,  name: 'Thỏa thuận thôi việc',                               file: 'THỏa_Thuận_thôi_việc__1634108747644.docx',                              created: '2021/10/13', updated: '2022/07/05' },
  { id: 8,  name: 'HĐ học việc 2022',                                   file: 'HĐ_học_việc_2022_1655952897097.docx',                                   created: '2022/06/23', updated: '2022/06/23' },
  { id: 9,  name: 'Thông báo thu nhập 2022',                            file: 'Thông_báo_thu_nhập_2022_1655952809176.docx',                             created: '2022/06/23', updated: '2022/06/23' },
  { id: 10, name: 'Đăng ký thực tập 2022',                              file: 'Đăng_ký_thực_tập_2022_1655952800384.docx',                              created: '2022/06/23', updated: '2022/06/23' },
  { id: 11, name: 'Hợp đồng lao động chính thức',                       file: 'Hợp_đồng_lao_động_chính_thức_1643017757.docx',                          created: '2022/01/24', updated: '2022/01/24' },
  { id: 12, name: 'Thông báo thu nhập chính thức',                      file: 'Thông_báo_thu_nhập_chính_thức_1643017608.docx',                         created: '2022/01/24', updated: '2022/01/24' },
  { id: 13, name: 'HĐ thử việc',                                        file: 'HĐ_thử_việc__1634865691991.docx',                                       created: '2021/10/22', updated: '2021/10/22' },
]

export const ALL_EMPLOYEES = [
  'Nguyễn Tấn Nam', 'Đặng Xuân Ấn', 'Nguyễn Đăng Thông', 'Nguyễn Mạnh Hoan', 'Trịnh Ngọc Tuấn',
  'Đặng Đình Nhân', 'Vũ Thị Bích Diệp', 'Nguyễn Thị Kim Ngân', 'Hoàng Thị Thu', 'Lê Minh Long',
  'Trần Cao Quý', 'Tiến Lê Đức', 'Đỗ Thị Hương Lan',
]

export const CONTRACT_BRANCHES = ['Hà Nội', 'Đà Nẵng', 'Hồ Chí Minh', 'Osaka']
export const CONTRACT_DURATIONS = ['Không xác định thời hạn', '1 năm', '2 năm', '3 năm', 'Thử việc 2 tháng']
