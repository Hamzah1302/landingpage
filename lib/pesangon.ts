/**
 * Logika murni kalkulator Pesangon, UPMK, dan UPH untuk karyawan tetap (PKWTT)
 * berdasarkan PP 35/2021 (Pasal 40 s.d. 57) dan UU 6/2023.
 *
 * Catatan regulasi yang perlu dipantau:
 *  - Putusan MK 168/PUU-XXI/2023 memaknai tabel Pasal 156 ayat (2) sebagai jumlah "paling sedikit".
 *    PP 35/2021 belum dicabut, sehingga faktor pengali per alasan PHK tetap dipakai sebagai acuan.
 *  - PPh pesangon masih mengacu PP 68/2009 jo. PMK 16/PMK.03/2010 (tarif final berlapis).
 */

export type SeveranceReasonKey =
  | "resign"
  | "mangkir"
  | "pelanggaran-mendesak"
  | "pelanggaran-sp"
  | "efisiensi-rugi"
  | "efisiensi-cegah-rugi"
  | "tutup-rugi"
  | "tutup-bukan-rugi"
  | "force-majeure-tutup"
  | "force-majeure-lanjut"
  | "pkpu-rugi"
  | "pkpu-bukan-rugi"
  | "pailit"
  | "merger"
  | "akuisisi-pengusaha"
  | "akuisisi-pekerja"
  | "pekerja-ajukan-phk"
  | "sakit-berkepanjangan"
  | "pensiun"
  | "meninggal"

export type SeveranceReasonGroup = "Atas inisiatif pekerja" | "Kondisi perusahaan" | "Disiplin kerja" | "Kondisi pekerja"

export type SeveranceReason = {
  value: SeveranceReasonKey
  label: string
  group: SeveranceReasonGroup
  /** Dasar hukum, mis. "Pasal 43 ayat (1)" */
  article: string
  /** Pengali uang pesangon terhadap tabel Pasal 40 ayat (2). 0 = tidak berhak. */
  upFactor: number
  /** Pengali UPMK terhadap tabel Pasal 40 ayat (3). 0 = tidak berhak. */
  upmkFactor: number
  /** Penjelasan singkat yang ditampilkan di bawah pilihan */
  note: string
}

export const SEVERANCE_REASONS: SeveranceReason[] = [
  // Atas inisiatif pekerja
  {
    value: "resign",
    label: "Mengundurkan diri (resign)",
    group: "Atas inisiatif pekerja",
    article: "Pasal 50",
    upFactor: 0,
    upmkFactor: 0,
    note: "Tidak mendapat pesangon dan UPMK. Yang menjadi hak: UPH, serta uang pisah bila diatur di PK/PP/PKB.",
  },
  {
    value: "pekerja-ajukan-phk",
    label: "Pekerja mengajukan PHK karena perbuatan pengusaha",
    group: "Atas inisiatif pekerja",
    article: "Pasal 48 (Pasal 36 huruf g)",
    upFactor: 1,
    upmkFactor: 1,
    note: "Misalnya upah tidak dibayar tiga bulan berturut-turut atau pengusaha menganiaya pekerja. Berlaku bila terbukti.",
  },

  // Kondisi perusahaan
  {
    value: "efisiensi-rugi",
    label: "Efisiensi karena perusahaan mengalami kerugian",
    group: "Kondisi perusahaan",
    article: "Pasal 43 ayat (1)",
    upFactor: 0.5,
    upmkFactor: 1,
    note: "Pesangon 0,5×. Alasan harus tercantum jelas di surat PHK.",
  },
  {
    value: "efisiensi-cegah-rugi",
    label: "Efisiensi untuk mencegah kerugian",
    group: "Kondisi perusahaan",
    article: "Pasal 43 ayat (2)",
    upFactor: 1,
    upmkFactor: 1,
    note: "Perusahaan belum rugi tetapi melakukan efisiensi agar tidak rugi. Pesangon 1×.",
  },
  {
    value: "tutup-rugi",
    label: "Perusahaan tutup karena rugi terus-menerus 2 tahun",
    group: "Kondisi perusahaan",
    article: "Pasal 44 ayat (1)",
    upFactor: 0.5,
    upmkFactor: 1,
    note: "Kerugian harus dibuktikan dengan laporan keuangan yang diaudit akuntan publik.",
  },
  {
    value: "tutup-bukan-rugi",
    label: "Perusahaan tutup bukan karena rugi",
    group: "Kondisi perusahaan",
    article: "Pasal 44 ayat (2)",
    upFactor: 1,
    upmkFactor: 1,
    note: "Misalnya tutup untuk melakukan efisiensi atau alasan bisnis lain.",
  },
  {
    value: "force-majeure-tutup",
    label: "Perusahaan tutup karena keadaan memaksa (force majeure)",
    group: "Kondisi perusahaan",
    article: "Pasal 45 ayat (1)",
    upFactor: 0.5,
    upmkFactor: 1,
    note: "Contoh: bencana alam, kebakaran, atau kejadian lain di luar kendali perusahaan.",
  },
  {
    value: "force-majeure-lanjut",
    label: "Force majeure, perusahaan tidak tutup",
    group: "Kondisi perusahaan",
    article: "Pasal 45 ayat (2)",
    upFactor: 0.75,
    upmkFactor: 1,
    note: "Perusahaan tetap beroperasi, tetapi PHK dilakukan akibat keadaan memaksa. Pesangon 0,75×.",
  },
  {
    value: "pkpu-rugi",
    label: "PKPU karena perusahaan merugi",
    group: "Kondisi perusahaan",
    article: "Pasal 46 ayat (1)",
    upFactor: 0.5,
    upmkFactor: 1,
    note: "Penundaan Kewajiban Pembayaran Utang yang disertai kerugian perusahaan.",
  },
  {
    value: "pkpu-bukan-rugi",
    label: "PKPU bukan karena perusahaan merugi",
    group: "Kondisi perusahaan",
    article: "Pasal 46 ayat (2)",
    upFactor: 1,
    upmkFactor: 1,
    note: "Penundaan Kewajiban Pembayaran Utang tanpa kerugian perusahaan.",
  },
  {
    value: "pailit",
    label: "Perusahaan pailit",
    group: "Kondisi perusahaan",
    article: "Pasal 47",
    upFactor: 0.5,
    upmkFactor: 1,
    note: "Pembayaran mengikuti proses kepailitan dan harta pailit, jadi pencairan bisa tidak langsung.",
  },
  {
    value: "merger",
    label: "Penggabungan, peleburan, atau pemisahan perusahaan",
    group: "Kondisi perusahaan",
    article: "Pasal 41",
    upFactor: 1,
    upmkFactor: 1,
    note: "Berlaku bila pekerja tidak bersedia melanjutkan hubungan kerja atau pengusaha tidak bersedia menerima pekerja.",
  },
  {
    value: "akuisisi-pengusaha",
    label: "Pengambilalihan, PHK atas inisiatif pengusaha",
    group: "Kondisi perusahaan",
    article: "Pasal 42 ayat (1)",
    upFactor: 1,
    upmkFactor: 1,
    note: "Pengusaha baru atau lama tidak bersedia meneruskan hubungan kerja.",
  },
  {
    value: "akuisisi-pekerja",
    label: "Pengambilalihan, pekerja menolak perubahan syarat kerja",
    group: "Kondisi perusahaan",
    article: "Pasal 42 ayat (2)",
    upFactor: 0.5,
    upmkFactor: 1,
    note: "Pekerja tidak bersedia melanjutkan karena syarat kerja berubah setelah pengambilalihan.",
  },

  // Disiplin kerja
  {
    value: "pelanggaran-sp",
    label: "Pelanggaran aturan kerja setelah SP 1, 2, dan 3",
    group: "Disiplin kerja",
    article: "Pasal 52 ayat (1)",
    upFactor: 0.5,
    upmkFactor: 1,
    note: "Berlaku bila SP diberikan berturut-turut sesuai ketentuan masing-masing masa berlaku SP.",
  },
  {
    value: "pelanggaran-mendesak",
    label: "Pelanggaran bersifat mendesak (diatur di PK/PP/PKB)",
    group: "Disiplin kerja",
    article: "Pasal 52 ayat (2)",
    upFactor: 0,
    upmkFactor: 0,
    note: "Tidak mendapat pesangon dan UPMK. Hak: UPH, serta uang pisah bila diatur. Contoh: pencurian atau penggelapan.",
  },
  {
    value: "mangkir",
    label: "Mangkir 5 hari kerja atau lebih berturut-turut",
    group: "Disiplin kerja",
    article: "Pasal 51",
    upFactor: 0,
    upmkFactor: 0,
    note: "Setelah dipanggil 2 kali secara patut dan tertulis. Hak: UPH, serta uang pisah bila diatur.",
  },

  // Kondisi pekerja
  {
    value: "sakit-berkepanjangan",
    label: "Sakit berkepanjangan atau cacat akibat kecelakaan kerja (> 12 bulan)",
    group: "Kondisi pekerja",
    article: "Pasal 55",
    upFactor: 2,
    upmkFactor: 1,
    note: "Pesangon 2× dari tabel masa kerja.",
  },
  {
    value: "pensiun",
    label: "Memasuki usia pensiun",
    group: "Kondisi pekerja",
    article: "Pasal 56",
    upFactor: 1.75,
    upmkFactor: 1,
    note: "Pesangon 1,75×. Program pensiun perusahaan dapat diperhitungkan sesuai Pasal 58, cek PK/PP/PKB.",
  },
  {
    value: "meninggal",
    label: "Pekerja meninggal dunia",
    group: "Kondisi pekerja",
    article: "Pasal 57",
    upFactor: 2,
    upmkFactor: 1,
    note: "Pesangon 2×, dibayarkan kepada ahli waris.",
  },
]

export const SEVERANCE_REASON_GROUPS: SeveranceReasonGroup[] = [
  "Kondisi perusahaan",
  "Atas inisiatif pekerja",
  "Disiplin kerja",
  "Kondisi pekerja",
]

export function getSeveranceReason(key: SeveranceReasonKey): SeveranceReason {
  const reason = SEVERANCE_REASONS.find((r) => r.value === key)
  if (!reason) throw new Error(`Alasan PHK tidak dikenal: ${key}`)
  return reason
}

/** Pasal 40 ayat (2): bulan upah uang pesangon berdasarkan masa kerja (tahun penuh). */
export function getPesangonMonths(totalMonthsOfService: number): number {
  const years = Math.floor(Math.max(0, totalMonthsOfService) / 12)
  if (years >= 8) return 9
  return years + 1 // <1 th = 1, 1-<2 = 2, ... 7-<8 = 8
}

/** Pasal 40 ayat (3): bulan upah UPMK berdasarkan masa kerja (tahun penuh). */
export function getUpmkMonths(totalMonthsOfService: number): number {
  const years = Math.floor(Math.max(0, totalMonthsOfService) / 12)
  if (years < 3) return 0
  if (years < 6) return 2
  if (years < 9) return 3
  if (years < 12) return 4
  if (years < 15) return 5
  if (years < 18) return 6
  if (years < 21) return 7
  if (years < 24) return 8
  return 10
}

/** Rentang masa kerja yang dipakai tabel, untuk ditampilkan ke pengguna. */
export function describePesangonBand(totalMonthsOfService: number): string {
  const years = Math.floor(Math.max(0, totalMonthsOfService) / 12)
  if (years < 1) return "kurang dari 1 tahun"
  if (years >= 8) return "8 tahun atau lebih"
  return `${years} – <${years + 1} tahun`
}

export function describeUpmkBand(totalMonthsOfService: number): string {
  const years = Math.floor(Math.max(0, totalMonthsOfService) / 12)
  if (years < 3) return "kurang dari 3 tahun"
  if (years >= 24) return "24 tahun atau lebih"
  const start = years < 6 ? 3 : Math.floor(years / 3) * 3
  return `${start} – <${start + 3} tahun`
}

/**
 * Tarif PPh 21 final atas pesangon yang dibayar sekaligus (PP 68/2009 jo. PMK 16/PMK.03/2010).
 * Tiap baris: [batas atas lapisan, tarif %]
 */
export const SEVERANCE_TAX_BRACKETS: readonly (readonly [number, number])[] = [
  [50_000_000, 0],
  [100_000_000, 5],
  [500_000_000, 15],
  [Infinity, 25],
]

export function calculateSeveranceTax(amount: number): number {
  let remaining = Math.max(0, amount)
  let lower = 0
  let total = 0
  for (const [upTo, rate] of SEVERANCE_TAX_BRACKETS) {
    if (remaining <= 0) break
    const span = Math.min(remaining, upTo - lower)
    total += (span * rate) / 100
    remaining -= span
    lower = upTo
  }
  return Math.floor(total)
}

export type SeveranceInput = {
  reason: SeveranceReasonKey
  /** Gaji pokok + tunjangan tetap per bulan */
  wage: number
  yearsOfService: number
  monthsOfService: number
  /** Cuti tahunan yang belum diambil dan belum gugur (hari) */
  unusedLeaveDays: number
  /** Pembagi hari kerja sebulan untuk menghitung upah sehari (21 = 5 hari kerja, 25 = 6 hari kerja) */
  workDaysPerMonth: number
  /** Biaya pulang pekerja & keluarga ke tempat diterima bekerja */
  relocationCost: number
  /** Uang pisah atau hak lain sesuai PK/PP/PKB */
  otherRights: number
}

export type SeveranceResult = {
  reason: SeveranceReason
  totalMonthsOfService: number
  wage: number
  pesangonMonths: number
  pesangonBase: number
  pesangon: number
  upmkMonths: number
  upmkBase: number
  upmk: number
  leavePay: number
  relocationCost: number
  uph: number
  otherRights: number
  total: number
  /** Dasar pengenaan PPh final: pesangon + UPMK */
  taxableBase: number
  tax: number
  netAfterTax: number
}

export function calculateSeverance(input: SeveranceInput): SeveranceResult {
  const reason = getSeveranceReason(input.reason)
  const wage = Math.max(0, Math.floor(input.wage) || 0)
  const totalMonthsOfService = Math.max(0, input.yearsOfService) * 12 + Math.max(0, input.monthsOfService)

  const pesangonMonths = getPesangonMonths(totalMonthsOfService)
  const pesangonBase = pesangonMonths * wage
  const pesangon = Math.round(pesangonBase * reason.upFactor)

  const upmkMonths = getUpmkMonths(totalMonthsOfService)
  const upmkBase = upmkMonths * wage
  const upmk = Math.round(upmkBase * reason.upmkFactor)

  const divisor = input.workDaysPerMonth > 0 ? input.workDaysPerMonth : 21
  const leavePay = Math.round((Math.max(0, input.unusedLeaveDays) / divisor) * wage)
  const relocationCost = Math.max(0, input.relocationCost)
  const uph = leavePay + relocationCost

  const otherRights = Math.max(0, input.otherRights)
  const total = pesangon + upmk + uph + otherRights

  const taxableBase = pesangon + upmk
  const tax = calculateSeveranceTax(taxableBase)

  return {
    reason,
    totalMonthsOfService,
    wage,
    pesangonMonths,
    pesangonBase,
    pesangon,
    upmkMonths,
    upmkBase,
    upmk,
    leavePay,
    relocationCost,
    uph,
    otherRights,
    total,
    taxableBase,
    tax,
    netAfterTax: total - tax,
  }
}
