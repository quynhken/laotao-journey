export type Region = 'north' | 'central' | 'south';

export type Province = {
  id: number;
  name: string;
  lat: number;   // centroid
  lng: number;
  region: Region;
  episode: number; // primary episode
  image: string;
  status: 'flagged' | 'visited' | 'locked';
  protected?: boolean; // không thể xoá
};

export type SubLocation = {
  id: number;
  provinceId: number;
  episode: number;
  locNum: number;    // order within episode inside this province
  name: string;
  province: string;  // province name string (for display / backward compat)
  region: Region;
  km: number;
  date: string;
  quote: string;
  image: string;
  status: 'flagged' | 'visited' | 'locked';
  lat: number;
  lng: number;
  rating?: number;
  reviews?: number;
  images?: string[];
  showQuiz?: boolean;
  videoUrl?: string;
  videoTitle?: string;
};

// Backward compat alias used by App.tsx and FlexBookTab.tsx
export type Stop = SubLocation;

const I = {
  hg: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400',
  mp: 'https://images.unsplash.com/photo-1573160813959-df05c1b1e7c2?w=400',
  sp: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=400',
  mc: 'https://images.unsplash.com/photo-1606299935024-7ccd3596ddc1?w=400',
  nb: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
  sg: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400',
};

// ── 34 Province centroids ──────────────────────────────────────────────────
export const PROVINCES: Province[] = [
  { id:  1, name: 'Hà Giang',             lat: 22.90, lng: 105.00, region: 'north',   episode: 1, image: I.hg, status: 'flagged' },
  { id:  2, name: 'Cao Bằng',             lat: 22.65, lng: 106.25, region: 'north',   episode: 1, image: I.hg, status: 'flagged' },
  { id:  3, name: 'Lạng Sơn',             lat: 21.85, lng: 106.76, region: 'north',   episode: 1, image: I.mp, status: 'flagged' },
  { id:  4, name: 'Quảng Ninh',           lat: 21.24, lng: 107.00, region: 'north',   episode: 1, image: I.sp, status: 'flagged' },
  { id:  5, name: 'Lào Cai',              lat: 22.48, lng: 104.00, region: 'north',   episode: 2, image: I.sp, status: 'flagged' },
  { id:  6, name: 'Điện Biên',            lat: 21.39, lng: 103.02, region: 'north',   episode: 2, image: I.hg, status: 'flagged' },
  { id:  7, name: 'Sơn La',               lat: 21.10, lng: 103.90, region: 'north',   episode: 2, image: I.mc, status: 'flagged' },
  { id:  8, name: 'Hòa Bình',             lat: 20.81, lng: 105.34, region: 'north',   episode: 3, image: I.nb, status: 'visited' },
  { id:  9, name: 'Hà Nội',               lat: 21.03, lng: 105.85, region: 'north',   episode: 3, image: I.sp, status: 'visited' },
  { id: 10, name: 'Hải Phòng',            lat: 20.84, lng: 106.69, region: 'north',   episode: 3, image: I.nb, status: 'visited' },
  { id: 11, name: 'Ninh Bình',            lat: 20.25, lng: 105.97, region: 'north',   episode: 3, image: I.mc, status: 'visited' },
  { id: 12, name: 'Thanh Hóa',            lat: 19.81, lng: 105.78, region: 'north',   episode: 3, image: I.nb, status: 'visited' },
  { id: 13, name: 'Nghệ An',              lat: 18.67, lng: 105.69, region: 'central', episode: 4, image: I.nb, status: 'locked'  },
  { id: 14, name: 'Hà Tĩnh',              lat: 18.36, lng: 105.89, region: 'central', episode: 4, image: I.nb, status: 'locked'  },
  { id: 15, name: 'Quảng Bình',           lat: 17.47, lng: 106.57, region: 'central', episode: 4, image: I.hg, status: 'locked'  },
  { id: 16, name: 'Quảng Trị',            lat: 16.82, lng: 107.10, region: 'central', episode: 4, image: I.mp, status: 'locked'  },
  { id: 17, name: 'Thừa Thiên Huế',       lat: 16.46, lng: 107.59, region: 'central', episode: 4, image: I.mc, status: 'locked'  },
  { id: 18, name: 'Đà Nẵng',              lat: 16.05, lng: 108.20, region: 'central', episode: 5, image: I.sp, status: 'locked'  },
  { id: 19, name: 'Quảng Nam',            lat: 15.54, lng: 107.99, region: 'central', episode: 5, image: I.mc, status: 'locked'  },
  { id: 20, name: 'Quảng Ngãi',           lat: 15.12, lng: 108.80, region: 'central', episode: 5, image: I.nb, status: 'locked'  },
  { id: 21, name: 'Bình Định',            lat: 13.78, lng: 109.22, region: 'central', episode: 5, image: I.hg, status: 'locked'  },
  { id: 22, name: 'Phú Yên',              lat: 13.10, lng: 109.31, region: 'central', episode: 5, image: I.mp, status: 'locked'  },
  { id: 23, name: 'Khánh Hòa',            lat: 12.24, lng: 109.20, region: 'south',   episode: 6, image: I.sp, status: 'locked'  },
  { id: 24, name: 'Ninh Thuận',           lat: 11.56, lng: 108.99, region: 'south',   episode: 6, image: I.mc, status: 'locked'  },
  { id: 25, name: 'Lâm Đồng',             lat: 11.94, lng: 108.46, region: 'south',   episode: 6, image: I.hg, status: 'locked'  },
  { id: 26, name: 'Bình Thuận',           lat: 10.98, lng: 108.25, region: 'south',   episode: 6, image: I.mp, status: 'locked'  },
  { id: 27, name: 'Đồng Nai',             lat: 10.95, lng: 107.24, region: 'south',   episode: 6, image: I.nb, status: 'locked'  },
  { id: 28, name: 'TP. Hồ Chí Minh',     lat: 10.82, lng: 106.63, region: 'south',   episode: 7, image: I.sg, status: 'locked'  },
  { id: 29, name: 'Bà Rịa - Vũng Tàu',   lat: 10.55, lng: 107.24, region: 'south',   episode: 7, image: I.sp, status: 'locked'  },
  { id: 30, name: 'Tiền Giang',           lat: 10.36, lng: 106.36, region: 'south',   episode: 7, image: I.mc, status: 'locked'  },
  { id: 31, name: 'Cần Thơ',              lat: 10.05, lng: 105.75, region: 'south',   episode: 7, image: I.nb, status: 'locked'  },
  { id: 32, name: 'Cà Mau',               lat:  9.18, lng: 105.15, region: 'south',   episode: 7, image: I.hg, status: 'locked'  },
  { id: 33, name: 'Bình Dương',           lat: 11.33, lng: 106.48, region: 'south',   episode: 7, image: I.nb, status: 'locked'  },
  { id: 34, name: 'Long An',              lat: 10.54, lng: 106.41, region: 'south',   episode: 7, image: I.mc, status: 'locked'  },
  { id: 35, name: 'Hoàng Sa',             lat: 16.50, lng: 112.00, region: 'central', episode: 1, image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400', status: 'locked', protected: true },
  { id: 36, name: 'Trường Sa',            lat:  8.65, lng: 113.65, region: 'south',   episode: 1, image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400', status: 'locked', protected: true },
];

// ── Sub-locations (2-3 per province) ──────────────────────────────────────
const F = 'flagged' as const, V = 'visited' as const, L = 'locked' as const;

export const SUB_LOCATIONS: SubLocation[] = [
  // Province 1 — Hà Giang (ep1, 3 spots)
  { id:  1, provinceId: 1, episode:1, locNum:1, name:'Hà Giang',       province:'Hà Giang',           region:'north',   km:   0, date:'01.03', status:F, lat:22.823, lng:104.984, image:I.hg, rating:4.8, reviews:312, quote:'"Bắt đầu từ cột mốc số 0. Lạnh teo tay nhưng đẹp đáng đời."' },
  { id:  2, provinceId: 1, episode:1, locNum:2, name:'Đồng Văn',       province:'Hà Giang',           region:'north',   km:  90, date:'02.03', status:F, lat:23.270, lng:105.367, image:I.mp, rating:4.7, reviews:289, quote:'"Phố cổ Đồng Văn như bị đóng băng trong thời gian."' },
  { id:  3, provinceId: 1, episode:1, locNum:3, name:'Mã Pí Lèng',     province:'Hà Giang',           region:'north',   km: 145, date:'03.03', status:F, lat:23.142, lng:105.362, image:I.mp, rating:4.9, reviews:421, quote:'"Đứng giữa trời, dưới là sông Nho Quế xanh ngắt."' },
  // Province 2 — Cao Bằng (ep1, 2 spots)
  { id:  4, provinceId: 2, episode:1, locNum:1, name:'Cao Bằng',       province:'Cao Bằng',           region:'north',   km: 295, date:'05.03', status:F, lat:22.666, lng:106.264, image:I.hg, rating:4.4, reviews:167, quote:'"Thành phố nhỏ, người thân thiện, bún vịt ngon vô địch."' },
  { id:  5, provinceId: 2, episode:1, locNum:2, name:'Thác Bản Giốc',  province:'Cao Bằng',           region:'north',   km: 360, date:'06.03', status:F, lat:22.853, lng:106.707, image:I.hg, rating:4.8, reviews:356, quote:'"Thác đẹp nhất Đông Nam Á mà mình từng thấy tận mắt."' },
  // Province 3 — Lạng Sơn (ep1, 2 spots)
  { id:  6, provinceId: 3, episode:1, locNum:1, name:'Lạng Sơn',       province:'Lạng Sơn',           region:'north',   km: 430, date:'07.03', status:F, lat:21.854, lng:106.762, image:I.mp, rating:4.3, reviews:145, quote:'"Vịt quay Lạng Sơn — gọi 2 con cũng chưa đủ."' },
  { id:  7, provinceId: 3, episode:1, locNum:2, name:'Đồng Đăng',      province:'Lạng Sơn',           region:'north',   km: 460, date:'07.03', status:F, lat:21.969, lng:106.748, image:I.mp, rating:4.1, reviews:98,  quote:'"Cửa khẩu nhộn nhịp, hàng hóa ngập chợ."' },
  // Province 4 — Quảng Ninh (ep1, 2 spots)
  { id:  8, provinceId: 4, episode:1, locNum:1, name:'Hạ Long',        province:'Quảng Ninh',         region:'north',   km: 570, date:'09.03', status:F, lat:20.952, lng:107.080, image:I.sp, rating:4.9, reviews:534, quote:'"Vịnh Hạ Long nhìn từ kayak. Không có ảnh nào tả được."' },
  { id:  9, provinceId: 4, episode:1, locNum:2, name:'Vịnh Bái Tử Long',province:'Quảng Ninh',        region:'north',   km: 600, date:'10.03', status:F, lat:21.090, lng:107.520, image:I.sp, rating:4.8, reviews:241, quote:'"Ít người biết hơn Hạ Long nhưng hoang sơ hơn nhiều."' },
  // Province 5 — Lào Cai (ep2, 2 spots)
  { id: 10, provinceId: 5, episode:2, locNum:1, name:'Sapa',           province:'Lào Cai',            region:'north',   km: 720, date:'13.03', status:F, lat:22.336, lng:103.844, image:I.sp, rating:4.6, reviews:287, quote:'"Sương như sữa. Lẩu cá hồi 250k mà ngon hơn mong đợi."' },
  { id: 11, provinceId: 5, episode:2, locNum:2, name:'Bản Cát Cát',    province:'Lào Cai',            region:'north',   km: 730, date:'13.03', status:F, lat:22.314, lng:103.820, image:I.sp, rating:4.5, reviews:198, quote:'"Bản làng yên bình, ruộng bậc thang vàng óng."' },
  // Province 6 — Điện Biên (ep2, 2 spots)
  { id: 12, provinceId: 6, episode:2, locNum:1, name:'Điện Biên Phủ',  province:'Điện Biên',          region:'north',   km: 980, date:'16.03', status:F, lat:21.386, lng:103.017, image:I.hg, rating:4.5, reviews:201, quote:'"Đồi A1, đất còn đỏ. Đứng đây mới hiểu tại sao."' },
  { id: 13, provinceId: 6, episode:2, locNum:2, name:'Mường Phăng',    province:'Điện Biên',          region:'north',   km: 990, date:'16.03', status:F, lat:21.450, lng:103.080, image:I.hg, rating:4.4, reviews:134, quote:'"Hầm Đại tướng Võ Nguyên Giáp. Im lặng đến nặng ngực."' },
  // Province 7 — Sơn La (ep2, 2 spots)
  { id: 14, provinceId: 7, episode:2, locNum:1, name:'Sơn La',         province:'Sơn La',             region:'north',   km:1100, date:'18.03', status:F, lat:21.327, lng:103.915, image:I.mp, rating:4.2, reviews:143, quote:'"Nhà tù Sơn La giờ là bảo tàng. Lạnh người."' },
  { id: 15, provinceId: 7, episode:2, locNum:2, name:'Mộc Châu',       province:'Sơn La',             region:'north',   km:1250, date:'20.03', status:F, lat:20.835, lng:104.600, image:I.mc, rating:4.5, reviews:198, quote:'"Đồi chè trải dài. Sữa tươi 15k/ly, làm 3 ly."' },
  // Province 8 — Hòa Bình (ep3, 2 spots)
  { id: 16, provinceId: 8, episode:3, locNum:1, name:'Mai Châu',       province:'Hoà Bình',           region:'north',   km:1320, date:'22.03', status:V, lat:20.664, lng:104.988, image:I.nb, rating:4.3, reviews:156, quote:'"Bản Lác yên tĩnh. Ngủ nhà sàn nghe gà gáy."' },
  { id: 17, provinceId: 8, episode:3, locNum:2, name:'Bản Lác',        province:'Hoà Bình',           region:'north',   km:1325, date:'22.03', status:V, lat:20.651, lng:104.978, image:I.nb, rating:4.4, reviews:123, quote:'"Nhà sàn cọ, tiếng đàn tính vọng trong đêm núi."' },
  // Province 9 — Hà Nội (ep3, 3 spots)
  { id: 18, provinceId: 9, episode:3, locNum:1, name:'Hồ Hoàn Kiếm',  province:'Hà Nội',             region:'north',   km:1420, date:'24.03', status:V, lat:21.028, lng:105.852, image:I.sp, rating:4.8, reviews:612, quote:'"Phở Bát Đàn 6h sáng, hàng dài 30 người vẫn xếp."' },
  { id: 19, provinceId: 9, episode:3, locNum:2, name:'Phố Cổ Hà Nội', province:'Hà Nội',             region:'north',   km:1422, date:'24.03', status:V, lat:21.033, lng:105.848, image:I.sp, rating:4.7, reviews:445, quote:'"36 phố phường — mỗi con phố một mùi riêng."' },
  { id: 20, provinceId: 9, episode:3, locNum:3, name:'Hồ Tây',        province:'Hà Nội',             region:'north',   km:1424, date:'25.03', status:V, lat:21.057, lng:105.823, image:I.mc, rating:4.5, reviews:334, quote:'"Bún ốc nguội ven hồ. Bữa sáng 25k đổi đời."' },
  // Province 10 — Hải Phòng (ep3, 2 spots)
  { id: 21, provinceId:10, episode:3, locNum:1, name:'Hải Phòng',      province:'Hải Phòng',          region:'north',   km:1520, date:'26.03', status:V, lat:20.845, lng:106.688, image:I.nb, rating:4.3, reviews:124, quote:'"Bánh mì cay Hải Phòng — hoàn toàn khác Sài Gòn."' },
  { id: 22, provinceId:10, episode:3, locNum:2, name:'Cát Bà',         province:'Hải Phòng',          region:'north',   km:1560, date:'27.03', status:V, lat:20.727, lng:107.047, image:I.sp, rating:4.6, reviews:267, quote:'"Leo núi Ngự Lâm nhìn xuống vịnh. Mệt mà đáng."' },
  // Province 11 — Ninh Bình (ep3, 2 spots)
  { id: 23, provinceId:11, episode:3, locNum:1, name:'Tam Cốc',        province:'Ninh Bình',          region:'north',   km:1620, date:'28.03', status:V, lat:20.217, lng:105.914, image:I.mc, rating:4.6, reviews:289, quote:'"Tam Cốc — chèo đò 90 phút, đáng từng đồng."' },
  { id: 24, provinceId:11, episode:3, locNum:2, name:'Tràng An',       province:'Ninh Bình',          region:'north',   km:1625, date:'28.03', status:V, lat:20.255, lng:105.905, image:I.nb, rating:4.7, reviews:312, quote:'"Hang động nối nhau qua thuyền. Kỳ diệu."' },
  // Province 12 — Thanh Hóa (ep3, 2 spots)
  { id: 25, provinceId:12, episode:3, locNum:1, name:'Sầm Sơn',        province:'Thanh Hóa',          region:'north',   km:1750, date:'30.03', status:V, lat:19.736, lng:105.906, image:I.nb, rating:4.2, reviews:198, quote:'"Biển rộng, sóng lớn. Hải sản tươi ngon vô đối."' },
  { id: 26, provinceId:12, episode:3, locNum:2, name:'Lam Kinh',       province:'Thanh Hóa',          region:'north',   km:1760, date:'30.03', status:V, lat:19.886, lng:105.573, image:I.mc, rating:4.1, reviews:87,  quote:'"Kinh đô cũ của nhà Lê — cỏ dại phủ rêu."' },
  // Province 13 — Nghệ An (ep4, locked, 2 spots)
  { id: 27, provinceId:13, episode:4, locNum:1, name:'Vinh',           province:'Nghệ An',            region:'central', km:1950, date:'—', status:L, lat:18.673, lng:105.692, image:I.nb, quote:'"Vùng Chưa Phá Đảo"' },
  { id: 28, provinceId:13, episode:4, locNum:2, name:'Quê Bác',        province:'Nghệ An',            region:'central', km:1990, date:'—', status:L, lat:18.991, lng:105.607, image:I.hg, quote:'"Vùng Chưa Phá Đảo"' },
  // Province 14 — Hà Tĩnh (ep4, locked, 2 spots)
  { id: 29, provinceId:14, episode:4, locNum:1, name:'Hà Tĩnh',        province:'Hà Tĩnh',            region:'central', km:2050, date:'—', status:L, lat:18.356, lng:105.888, image:I.nb, quote:'"Vùng Chưa Phá Đảo"' },
  { id: 30, provinceId:14, episode:4, locNum:2, name:'Thiên Cầm',      province:'Hà Tĩnh',            region:'central', km:2080, date:'—', status:L, lat:18.258, lng:105.936, image:I.sp, quote:'"Vùng Chưa Phá Đảo"' },
  // Province 15 — Quảng Bình (ep4, locked, 2 spots)
  { id: 31, provinceId:15, episode:4, locNum:1, name:'Phong Nha',      province:'Quảng Bình',         region:'central', km:2200, date:'—', status:L, lat:17.557, lng:106.281, image:I.hg, quote:'"Vùng Chưa Phá Đảo"' },
  { id: 32, provinceId:15, episode:4, locNum:2, name:'Động Thiên Đường',province:'Quảng Bình',        region:'central', km:2220, date:'—', status:L, lat:17.525, lng:106.261, image:I.mp, quote:'"Vùng Chưa Phá Đảo"' },
  // Province 16 — Quảng Trị (ep4, locked, 2 spots)
  { id: 33, provinceId:16, episode:4, locNum:1, name:'Đông Hà',        province:'Quảng Trị',          region:'central', km:2350, date:'—', status:L, lat:16.817, lng:107.095, image:I.mp, quote:'"Vùng Chưa Phá Đảo"' },
  { id: 34, provinceId:16, episode:4, locNum:2, name:'Cầu Hiền Lương', province:'Quảng Trị',          region:'central', km:2380, date:'—', status:L, lat:17.069, lng:107.017, image:I.nb, quote:'"Vùng Chưa Phá Đảo"' },
  // Province 17 — Thừa Thiên Huế (ep4, locked, 2 spots)
  { id: 35, provinceId:17, episode:4, locNum:1, name:'Đại Nội Huế',   province:'Thừa Thiên Huế',     region:'central', km:2450, date:'—', status:L, lat:16.470, lng:107.578, image:I.mc, quote:'"Vùng Chưa Phá Đảo"' },
  { id: 36, provinceId:17, episode:4, locNum:2, name:'Lăng Tự Đức',   province:'Thừa Thiên Huế',     region:'central', km:2460, date:'—', status:L, lat:16.455, lng:107.552, image:I.hg, quote:'"Vùng Chưa Phá Đảo"' },
  // Province 18 — Đà Nẵng (ep5, locked, 2 spots)
  { id: 37, provinceId:18, episode:5, locNum:1, name:'Cầu Rồng',      province:'Đà Nẵng',            region:'central', km:2550, date:'—', status:L, lat:16.061, lng:108.227, image:I.sp, quote:'"Vùng Chưa Phá Đảo"' },
  { id: 38, provinceId:18, episode:5, locNum:2, name:'Bà Nà Hills',   province:'Đà Nẵng',            region:'central', km:2565, date:'—', status:L, lat:15.995, lng:107.989, image:I.nb, quote:'"Vùng Chưa Phá Đảo"' },
  // Province 19 — Quảng Nam (ep5, locked, 2 spots)
  { id: 39, provinceId:19, episode:5, locNum:1, name:'Hội An',        province:'Quảng Nam',          region:'central', km:2600, date:'—', status:L, lat:15.880, lng:108.338, image:I.mc, quote:'"Vùng Chưa Phá Đảo"' },
  { id: 40, provinceId:19, episode:5, locNum:2, name:'Mỹ Sơn',        province:'Quảng Nam',          region:'central', km:2620, date:'—', status:L, lat:15.766, lng:108.118, image:I.hg, quote:'"Vùng Chưa Phá Đảo"' },
  // Province 20 — Quảng Ngãi (ep5, locked, 2 spots)
  { id: 41, provinceId:20, episode:5, locNum:1, name:'Quảng Ngãi',    province:'Quảng Ngãi',         region:'central', km:2700, date:'—', status:L, lat:15.121, lng:108.804, image:I.nb, quote:'"Vùng Chưa Phá Đảo"' },
  { id: 42, provinceId:20, episode:5, locNum:2, name:'Lý Sơn',        province:'Quảng Ngãi',         region:'central', km:2750, date:'—', status:L, lat:15.376, lng:109.109, image:I.sp, quote:'"Vùng Chưa Phá Đảo"' },
  // Province 21 — Bình Định (ep5, locked, 2 spots)
  { id: 43, provinceId:21, episode:5, locNum:1, name:'Quy Nhơn',      province:'Bình Định',          region:'central', km:2900, date:'—', status:L, lat:13.776, lng:109.224, image:I.hg, quote:'"Vùng Chưa Phá Đảo"' },
  { id: 44, provinceId:21, episode:5, locNum:2, name:'Ghềnh Ráng',    province:'Bình Định',          region:'central', km:2910, date:'—', status:L, lat:13.748, lng:109.234, image:I.mp, quote:'"Vùng Chưa Phá Đảo"' },
  // Province 22 — Phú Yên (ep5, locked, 2 spots)
  { id: 45, provinceId:22, episode:5, locNum:1, name:'Tuy Hòa',       province:'Phú Yên',            region:'central', km:3050, date:'—', status:L, lat:13.096, lng:109.306, image:I.mp, quote:'"Vùng Chưa Phá Đảo"' },
  { id: 46, provinceId:22, episode:5, locNum:2, name:'Gành Đá Đĩa',   province:'Phú Yên',            region:'central', km:3080, date:'—', status:L, lat:13.423, lng:109.290, image:I.nb, quote:'"Vùng Chưa Phá Đảo"' },
  // Province 23 — Khánh Hòa (ep6, locked, 2 spots)
  { id: 47, provinceId:23, episode:6, locNum:1, name:'Nha Trang',     province:'Khánh Hòa',          region:'south',   km:3200, date:'—', status:L, lat:12.239, lng:109.197, image:I.sp, quote:'"Vùng Chưa Phá Đảo"' },
  { id: 48, provinceId:23, episode:6, locNum:2, name:'Đảo Bình Ba',   province:'Khánh Hòa',          region:'south',   km:3240, date:'—', status:L, lat:11.975, lng:109.135, image:I.mc, quote:'"Vùng Chưa Phá Đảo"' },
  // Province 24 — Ninh Thuận (ep6, locked, 2 spots)
  { id: 49, provinceId:24, episode:6, locNum:1, name:'Phan Rang',     province:'Ninh Thuận',         region:'south',   km:3350, date:'—', status:L, lat:11.564, lng:108.988, image:I.mc, quote:'"Vùng Chưa Phá Đảo"' },
  { id: 50, provinceId:24, episode:6, locNum:2, name:'Vĩnh Hy',       province:'Ninh Thuận',         region:'south',   km:3370, date:'—', status:L, lat:11.760, lng:109.174, image:I.nb, quote:'"Vùng Chưa Phá Đảo"' },
  // Province 25 — Lâm Đồng (ep6, locked, 2 spots)
  { id: 51, provinceId:25, episode:6, locNum:1, name:'Đà Lạt',        province:'Lâm Đồng',           region:'south',   km:3420, date:'—', status:L, lat:11.940, lng:108.458, image:I.hg, quote:'"Vùng Chưa Phá Đảo"' },
  { id: 52, provinceId:25, episode:6, locNum:2, name:'Hồ Tuyền Lâm',  province:'Lâm Đồng',           region:'south',   km:3435, date:'—', status:L, lat:11.893, lng:108.411, image:I.sp, quote:'"Vùng Chưa Phá Đảo"' },
  // Province 26 — Bình Thuận (ep6, locked, 2 spots)
  { id: 53, provinceId:26, episode:6, locNum:1, name:'Mũi Né',        province:'Bình Thuận',         region:'south',   km:3600, date:'—', status:L, lat:10.980, lng:108.251, image:I.mp, quote:'"Vùng Chưa Phá Đảo"' },
  { id: 54, provinceId:26, episode:6, locNum:2, name:'Đồi Cát Bay',   province:'Bình Thuận',         region:'south',   km:3610, date:'—', status:L, lat:11.010, lng:108.220, image:I.nb, quote:'"Vùng Chưa Phá Đảo"' },
  // Province 27 — Đồng Nai (ep6, locked, 2 spots)
  { id: 55, provinceId:27, episode:6, locNum:1, name:'Biên Hòa',      province:'Đồng Nai',           region:'south',   km:3750, date:'—', status:L, lat:10.946, lng:107.241, image:I.nb, quote:'"Vùng Chưa Phá Đảo"' },
  { id: 56, provinceId:27, episode:6, locNum:2, name:'Chiến khu D',   province:'Đồng Nai',           region:'south',   km:3760, date:'—', status:L, lat:11.120, lng:107.120, image:I.hg, quote:'"Vùng Chưa Phá Đảo"' },
  // Province 28 — TP. HCM (ep7, locked, 3 spots)
  { id: 57, provinceId:28, episode:7, locNum:1, name:'Bến Thành',     province:'TP. Hồ Chí Minh',   region:'south',   km:3820, date:'—', status:L, lat:10.772, lng:106.698, image:I.sg, quote:'"Vùng Chưa Phá Đảo"' },
  { id: 58, provinceId:28, episode:7, locNum:2, name:'Nhà Thờ Đức Bà',province:'TP. Hồ Chí Minh',  region:'south',   km:3821, date:'—', status:L, lat:10.779, lng:106.699, image:I.sg, quote:'"Vùng Chưa Phá Đảo"' },
  { id: 59, provinceId:28, episode:7, locNum:3, name:'Bùi Viện',      province:'TP. Hồ Chí Minh',   region:'south',   km:3822, date:'—', status:L, lat:10.767, lng:106.693, image:I.sg, quote:'"Vùng Chưa Phá Đảo"' },
  // Province 29 — Bà Rịa-Vũng Tàu (ep7, locked, 2 spots)
  { id: 60, provinceId:29, episode:7, locNum:1, name:'Vũng Tàu',      province:'Bà Rịa - Vũng Tàu', region:'south',   km:3900, date:'—', status:L, lat:10.346, lng:107.084, image:I.sp, quote:'"Vùng Chưa Phá Đảo"' },
  { id: 61, provinceId:29, episode:7, locNum:2, name:'Bãi Trước',     province:'Bà Rịa - Vũng Tàu', region:'south',   km:3905, date:'—', status:L, lat:10.341, lng:107.079, image:I.mc, quote:'"Vùng Chưa Phá Đảo"' },
  // Province 30 — Tiền Giang (ep7, locked, 2 spots)
  { id: 62, provinceId:30, episode:7, locNum:1, name:'Mỹ Tho',        province:'Tiền Giang',         region:'south',   km:3980, date:'—', status:L, lat:10.360, lng:106.360, image:I.mc, quote:'"Vùng Chưa Phá Đảo"' },
  { id: 63, provinceId:30, episode:7, locNum:2, name:'Cù Lao Thới Sơn',province:'Tiền Giang',        region:'south',   km:3985, date:'—', status:L, lat:10.310, lng:106.370, image:I.nb, quote:'"Vùng Chưa Phá Đảo"' },
  // Province 31 — Cần Thơ (ep7, locked, 2 spots)
  { id: 64, provinceId:31, episode:7, locNum:1, name:'Bến Ninh Kiều', province:'Cần Thơ',             region:'south',   km:4100, date:'—', status:L, lat:10.045, lng:105.747, image:I.nb, quote:'"Vùng Chưa Phá Đảo"' },
  { id: 65, provinceId:31, episode:7, locNum:2, name:'Chợ Nổi Cái Răng',province:'Cần Thơ',          region:'south',   km:4105, date:'—', status:L, lat:10.016, lng:105.759, image:I.mc, quote:'"Vùng Chưa Phá Đảo"' },
  // Province 32 — Cà Mau (ep7, locked, 2 spots)
  { id: 66, provinceId:32, episode:7, locNum:1, name:'U Minh Hạ',     province:'Cà Mau',              region:'south',   km:4200, date:'—', status:L, lat:9.177,  lng:105.150, image:I.hg, quote:'"Vùng Chưa Phá Đảo"' },
  { id: 67, provinceId:32, episode:7, locNum:2, name:'Mũi Cà Mau',    province:'Cà Mau',              region:'south',   km:4300, date:'—', status:L, lat:8.630,  lng:104.730, image:I.mp, quote:'"Vùng Chưa Phá Đảo"' },
  // Province 33 — Bình Dương (ep7, locked, 2 spots)
  { id: 68, provinceId:33, episode:7, locNum:1, name:'Thủ Dầu Một',   province:'Bình Dương',         region:'south',   km:3830, date:'—', status:L, lat:11.010, lng:106.649, image:I.nb, quote:'"Vùng Chưa Phá Đảo"' },
  { id: 69, provinceId:33, episode:7, locNum:2, name:'Làng Sơn Mài',  province:'Bình Dương',         region:'south',   km:3835, date:'—', status:L, lat:11.000, lng:106.640, image:I.mc, quote:'"Vùng Chưa Phá Đảo"' },
  // Province 34 — Long An (ep7, locked, 2 spots)
  { id: 70, provinceId:34, episode:7, locNum:1, name:'Tân An',         province:'Long An',             region:'south',   km:3870, date:'—', status:L, lat:10.536, lng:106.413, image:I.mc, quote:'"Vùng Chưa Phá Đảo"' },
  { id: 71, provinceId:34, episode:7, locNum:2, name:'Làng Nổi Tân Lập',province:'Long An',           region:'south',   km:3875, date:'—', status:L, lat:10.718, lng:105.996, image:I.nb, quote:'"Vùng Chưa Phá Đảo"' },
];

// Backward-compat STOPS = one representative stop per province (locNum === 1)
export const STOPS: SubLocation[] = SUB_LOCATIONS.filter(s => s.locNum === 1);

export const TOTAL_KM = 4300;
export const CURRENT_KM = 1625; // after Ninh Bình / Tràng An

export const EPISODE_COLORS: Record<number, string> = {
  1: '#FF631F',
  2: '#FF854F',
  3: '#FF983B',
  4: '#FFBA80',
  5: '#FF9A6C',
  6: '#FF7B40',
  7: '#E54F0F',
};

export type Badge = {
  icon: string;
  name: string;
  desc: string;
  earned: boolean;
};

export const BADGES: Badge[] = [
  { icon: 'Compass',  name: 'Người Theo Dõi',      desc: 'Đăng ký app',         earned: true  },
  { icon: 'Film',     name: 'Khán Giả Cứng',        desc: 'Xem 3 video',         earned: true  },
  { icon: 'Flag',     name: 'Cắm Cờ Khắp Nơi',     desc: 'Cắm 5 điểm',         earned: true  },
  { icon: 'Sparkles', name: 'Tiên Tri',              desc: 'Đoán đúng 1 lần',    earned: false },
  { icon: 'BookOpen', name: 'Học Giả Đường Trường', desc: 'Quiz đúng 5 câu',     earned: false },
  { icon: 'Star',     name: 'Siêu Fan',              desc: 'Đạt 500 Flex Điểm',  earned: false },
  { icon: 'Layers',   name: 'Thánh Quẹt',           desc: 'Quẹt 20 card',        earned: false },
  { icon: 'PenLine',  name: 'Nhà Phê Bình',         desc: 'Viết 5 review',       earned: false },
];

export const REGION_COLOR: Record<Region, string> = {
  north: '#FF631F',
  central: '#FF983B',
  south: '#FF854F',
};

export const REGION_LABEL: Record<Region, string> = {
  north: 'Bắc',
  central: 'Trung',
  south: 'Nam',
};
