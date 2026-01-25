"use client";

import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Calendar as CalendarIcon,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// Interface untuk properti komponen
export interface DateRangeProps {
  startDate: Date | null;
  endDate: Date | null;
  onDateRangeChange: (start: Date | null, end: Date | null) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
}

// Interface untuk data mentah yang diambil dari API
interface ReportData {
  loket: string;
  kode_loket: string;
  iwkbu_tl_tgl_transaksi: string;
  iwkbu_tl_nopol: string;
  iwkbu_tl_rupiah_penerimaan: number;
  iwkbu_ti_tgl_transaksi: string;
  iwkbu_ti_nopol: string;
  iwkbu_ti_rupiah_penerimaan: number;
}

// Interface baru yang sesuai dengan struktur Tabel Anggaran
interface AnggaranRow {
  no: number;
  namaLoket: string;
  anggaranSatuTahun: number;
  targetAnggaranBulan: number;
  penerimaanTL: number;
  penerimaanTI: number;
  realisasi: string;
  gapRealisasiPersen: string;
  gapRealisasiRupiah: number;
  growthPersen: string;
  growthRupiah: number;
  // Tipe baris untuk membedakan rendering
  rowType: "header" | "subtotal" | "detail" | "grandtotal";
}

interface LoadingState {
  message: string;
  progress: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE;

const loketMapping = [
  {
    no: 1,
    parentLoket: "KANWIL JAWA TENGAH",
    childLoket: "LOKET CABANG JAWA TENGAH",
    endpoint: `${BASE_URL}/loketcabangjawatengah`,
    anggaranSatuTahun: 123118000,
  },
  {
    no: 2,
    parentLoket: "",
    childLoket: "SAMSAT KENDAL",
    endpoint: `${BASE_URL}/samsatkendal`,
    anggaranSatuTahun: 247521000,
  },
  {
    no: 3,
    parentLoket: "",
    childLoket: "SAMSAT DEMAK",
    endpoint: `${BASE_URL}/samsatdemak`,
    anggaranSatuTahun: 151467000,
  },
  {
    no: 4,
    parentLoket: "",
    childLoket: "SAMSAT PURWODADI",
    endpoint: `${BASE_URL}/samsatpurwodadi`,
    anggaranSatuTahun: 297000000,
  },
  {
    no: 5,
    parentLoket: "",
    childLoket: "SAMSAT UNGARAN",
    endpoint: `${BASE_URL}/samsatungaran`,
    anggaranSatuTahun: 564192000,
  },
  {
    no: 6,
    parentLoket: "",
    childLoket: "SAMSAT SALATIGA",
    endpoint: `${BASE_URL}/samsatsalatiga`,
    anggaranSatuTahun: 93935000,
  },
  // Wilayah Surakarta
  {
    no: 7,
    parentLoket: "CABANG SURAKARTA",
    childLoket: "LOKET CABANG SURAKARTA",
    anggaranSatuTahun: 299700000,
    endpoint: `${BASE_URL}/samsatlokperwsra`,
  },
  {
    no: 8,
    parentLoket: "",
    childLoket: "SAMSAT SURAKARTA",
    anggaranSatuTahun: 139000000,
    endpoint: `${BASE_URL}/samsatsurakarta`,
  },
  {
    no: 9,
    parentLoket: "",
    childLoket: "SAMSAT KLATEN",
    anggaranSatuTahun: 153200000,
    endpoint: `${BASE_URL}/samsatklaten`,
  },
  {
    no: 10,
    parentLoket: "",
    childLoket: "SAMSAT BOYOLALI",
    anggaranSatuTahun: 181000000,
    endpoint: `${BASE_URL}/samsatboyolali`,
  },
  {
    no: 11,
    parentLoket: "",
    childLoket: "SAMSAT SRAGEN",
    anggaranSatuTahun: 220800000,
    endpoint: `${BASE_URL}/samsatsragen`,
  },
  {
    no: 12,
    parentLoket: "",
    childLoket: "SAMSAT PRAMBANAN",
    anggaranSatuTahun: 52841000,
    endpoint: `${BASE_URL}/samsatprambanan`,
  },
  {
    no: 13,
    parentLoket: "",
    childLoket: "SAMSAT DELANGGU",
    anggaranSatuTahun: 44000000,
    endpoint: `${BASE_URL}/samsatdelanggu`,
  },
  {
    no: 14,
    parentLoket: "CABANG MAGELANG",
    childLoket: "LOKET CABANG MAGELANG",
    anggaranSatuTahun: 502517223,
    endpoint: `${BASE_URL}/samsatlokpwkmgl`,
  },
  {
    no: 15,
    parentLoket: "",
    childLoket: "SAMSAT MAGELANG",
    anggaranSatuTahun: 113727074,
    endpoint: `${BASE_URL}/samsatmagelang`,
  },
  {
    no: 16,
    parentLoket: "",
    childLoket: "SAMSAT PURWOREJO",
    anggaranSatuTahun: 199881391,
    endpoint: `${BASE_URL}/samsatpurworejo`,
  },
  {
    no: 17,
    parentLoket: "",
    childLoket: "SAMSAT KEBUMEN",
    anggaranSatuTahun: 354643572,
    endpoint: `${BASE_URL}/samsatkebumen`,
  },
  {
    no: 18,
    parentLoket: "",
    childLoket: "SAMSAT TEMANGGUNG",
    anggaranSatuTahun: 426884781,
    endpoint: `${BASE_URL}/samsattemanggung`,
  },
  {
    no: 19,
    parentLoket: "",
    childLoket: "SAMSAT WONOSOBO",
    anggaranSatuTahun: 504441622,
    endpoint: `${BASE_URL}/samsatwonosobo`,
  },
  {
    no: 20,
    parentLoket: "",
    childLoket: "SAMSAT MUNGKID",
    anggaranSatuTahun: 434288042,
    endpoint: `${BASE_URL}/samsatmungkid`,
  },
  {
    no: 21,
    parentLoket: "",
    childLoket: "SAMSAT BAGELEN",
    anggaranSatuTahun: 31389295,
    endpoint: `${BASE_URL}/samsatbagelen`,
  },

  // Wilayah Purwokerto
  {
    no: 22,
    parentLoket: "CABANG PURWOKERTO",
    childLoket: "LOKET CABANG PURWOKERTO",
    anggaranSatuTahun: 116745000,
    endpoint: `${BASE_URL}/samsatlokprwpwt`,
  },
  {
    no: 23,
    parentLoket: "",
    childLoket: "SAMSAT PURWOKERTO",
    anggaranSatuTahun: 327354000,
    endpoint: `${BASE_URL}/samsat/purwokerto`,
  },
  {
    no: 24,
    parentLoket: "",
    childLoket: "SAMSAT PURBALINGGA",
    anggaranSatuTahun: 239643000,
    endpoint: `${BASE_URL}/samsat/purbalingga`,
  },
  {
    no: 25,
    parentLoket: "",
    childLoket: "SAMSAT BANJARNEGARA",
    anggaranSatuTahun: 301838000,
    endpoint: `${BASE_URL}/samsat/banjarnegara`, //data gagal terambil
  },
  {
    no: 26,
    parentLoket: "",
    childLoket: "SAMSAT MAJENANG",
    anggaranSatuTahun: 88054000,
    endpoint: `${BASE_URL}/samsat/majenang`,
  },
  {
    no: 27,
    parentLoket: "",
    childLoket: "SAMSAT CILACAP",
    anggaranSatuTahun: 117368000,
    endpoint: `${BASE_URL}/samsat/cilacap`,
  },
  {
    no: 28,
    parentLoket: "",
    childLoket: "SAMSAT WANGON",
    anggaranSatuTahun: 118331000,
    endpoint: `${BASE_URL}/samsat/wangon`,
  },

  // Wilayah Pekalongan
  {
    no: 29,
    parentLoket: "CABANG PEKALONGAN",
    childLoket: "LOKET CABANG PEKALONGAN",
    anggaranSatuTahun: 256649000,
    endpoint: `${BASE_URL}/samsat/lokprwpkl`,
  },
  {
    no: 30,
    parentLoket: "",
    childLoket: "SAMSAT PEKALONGAN",
    anggaranSatuTahun: 112994000,
    endpoint: `${BASE_URL}/samsat/pekalongan`,
  },
  {
    no: 31,
    parentLoket: "",
    childLoket: "SAMSAT PEMALANG",
    anggaranSatuTahun: 319107000,
    endpoint: `${BASE_URL}/samsat/pemalang`,
  },
  {
    no: 32,
    parentLoket: "",
    childLoket: "SAMSAT TEGAL",
    anggaranSatuTahun: 147062000,
    endpoint: `${BASE_URL}/samsat/tegal`,
  },
  {
    no: 33,
    parentLoket: "",
    childLoket: "SAMSAT BREBES",
    anggaranSatuTahun: 153308000,
    endpoint: `${BASE_URL}/samsat/brebes`,
  },
  {
    no: 34,
    parentLoket: "",
    childLoket: "SAMSAT BATANG",
    anggaranSatuTahun: 313429000,
    endpoint: `${BASE_URL}/samsat/batang`,
  },
  {
    no: 35,
    parentLoket: "",
    childLoket: "SAMSAT KAJEN",
    anggaranSatuTahun: 191919000,
    endpoint: `${BASE_URL}/samsat/kajen`,
  },
  {
    no: 36,
    parentLoket: "",
    childLoket: "SAMSAT SLAWI",
    anggaranSatuTahun: 229962000,
    endpoint: `${BASE_URL}/samsat/slawi`,
  },
  {
    no: 37,
    parentLoket: "",
    childLoket: "SAMSAT BUMIAYU",
    anggaranSatuTahun: 185104000,
    endpoint: `${BASE_URL}/samsat/bumiayu`,
  },
  {
    no: 38,
    parentLoket: "",
    childLoket: "SAMSAT TANJUNG",
    anggaranSatuTahun: 48264000,
    endpoint: `${BASE_URL}/samsat/tanjung`,
  },

  // Wilayah Pati
  {
    no: 39,
    parentLoket: "CABANG PATI",
    childLoket: "LOKET CABANG PATI",
    anggaranSatuTahun: 83077000,
    endpoint: `${BASE_URL}/samsat/lokprwpti`,
  },
  {
    no: 40,
    parentLoket: "",
    childLoket: "SAMSAT PATI",
    anggaranSatuTahun: 263643000,
    endpoint: `${BASE_URL}/samsat/pati`,
  },
  {
    no: 41,
    parentLoket: "",
    childLoket: "SAMSAT KUDUS",
    anggaranSatuTahun: 529535000,
    endpoint: `${BASE_URL}/samsat/kudus`,
  },
  {
    no: 42,
    parentLoket: "",
    childLoket: "SAMSAT JEPARA",
    anggaranSatuTahun: 445775000,
    endpoint: `${BASE_URL}/samsat/jepara`,
  },
  {
    no: 43,
    parentLoket: "",
    childLoket: "SAMSAT REMBANG",
    anggaranSatuTahun: 473485000,
    endpoint: `${BASE_URL}/samsat/rembang`,
  },
  {
    no: 44,
    parentLoket: "",
    childLoket: "SAMSAT BLORA",
    anggaranSatuTahun: 55739000,
    endpoint: `${BASE_URL}/samsat/blora`,
  },
  {
    no: 45,
    parentLoket: "",
    childLoket: "SAMSAT CEPU",
    anggaranSatuTahun: 17076000,
    endpoint: `${BASE_URL}/samsat/cepu`,
  },

  // Wilayah Semarang
  {
    no: 46,
    parentLoket: "CABANG SEMARANG",
    childLoket: "LOKET CABANG SEMARANG",
    anggaranSatuTahun: 110109000,
    endpoint: `${BASE_URL}/samsat/lokprwsmg`,
  },
  {
    no: 47,
    parentLoket: "",
    childLoket: "SAMSAT SEMARANG I",
    anggaranSatuTahun: 243879000,
    endpoint: `${BASE_URL}/samsat/semarang1`,
  },
  {
    no: 48,
    parentLoket: "",
    childLoket: "SAMSAT SEMARANG II",
    anggaranSatuTahun: 67614000,
    endpoint: `${BASE_URL}/samsat/semarang2`,
  },
  {
    no: 49,
    parentLoket: "",
    childLoket: "SAMSAT SEMARANG III",
    anggaranSatuTahun: 188140000,
    endpoint: `${BASE_URL}/samsat/semarang3`,
  },

  // Wilayah Sukoharjo
  {
    no: 50,
    parentLoket: "CABANG SUKOHARJO",
    childLoket: "LOKET CABANG SUKOHARJO",
    anggaranSatuTahun: 325579000,
    endpoint: `${BASE_URL}/samsat/lokprwskh`,
  },
  {
    no: 51,
    parentLoket: "",
    childLoket: "SAMSAT SUKOHARJO",
    anggaranSatuTahun: 107300000,
    endpoint: `${BASE_URL}/samsat/sukoharjo`,
  },
  {
    no: 52,
    parentLoket: "",
    childLoket: "SAMSAT KARANGANYAR",
    anggaranSatuTahun: 202500000,
    endpoint: `${BASE_URL}/samsat/karanganyar`,
  },
  {
    no: 53,
    parentLoket: "",
    childLoket: "SAMSAT WONOGIRI",
    anggaranSatuTahun: 258300000,
    endpoint: `${BASE_URL}/samsat/wonogiri`,
  },
  {
    no: 54,
    parentLoket: "",
    childLoket: "SAMSAT PURWANTORO",
    anggaranSatuTahun: 36500000,
    endpoint: `${BASE_URL}/samsat/purwantoro`,
  },
  {
    no: 55,
    parentLoket: "",
    childLoket: "SAMSAT BATURETNO",
    anggaranSatuTahun: 26300000,
    endpoint: `${BASE_URL}/samsat/baturetno`,
  },
];

// Fungsi-fungsi helper untuk kalkulasi
const calculateRealisasi = (penerimaan: number, anggaran: number): string => {
  if (anggaran === 0) return "0.00%";
  return `${((penerimaan / anggaran) * 100).toFixed(2)}%`;
};
const calculateGapRealisasiPersen = (
  penerimaan: number,
  target: number
): string => {
  if (target === 0) return penerimaan > 0 ? "∞" : "0.00%";
  return `${(((penerimaan - target) / target) * 100).toFixed(2)}%`;
};
const calculateGrowthPersen = (
  penerimaanTI: number,
  penerimaanTL: number
): string => {
  if (penerimaanTL === 0) return penerimaanTI > 0 ? "∞" : "0.00%";
  return `${(
    ((penerimaanTI - penerimaanTL) / penerimaanTL) *
    100
  ).toFixed(2)}%`;
};

// Komponen untuk sel performa (angka berwarna dengan ikon)
const PerformanceCell = ({
  value,
  isPercentage = false,
}: {
  value: string | number;
  isPercentage?: boolean;
}) => {
  const numericValue =
    typeof value === "string"
      ? parseFloat(value.replace(/[^0-9.-]+/g, ""))
      : value;
  const isPositive = numericValue > 0;
  const isNegative = numericValue < 0;
  const isNeutral = !isPositive && !isNegative;

  const colorClass = cn({
    "text-green-600 dark:text-green-400": isPositive,
    "text-red-600 dark:text-red-400": isNegative,
    "text-gray-700 dark:text-gray-300": isNeutral,
  });
  const Icon = isPositive ? ArrowUp : isNegative ? ArrowDown : Minus;

  const formattedValue = isPercentage
    ? `${numericValue.toFixed(2)}%`
    : new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(numericValue);

  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2",
        isPercentage && "justify-center font-semibold",
        colorClass
      )}
    >
      {isPercentage && <Icon className="h-4 w-4" />}
      <span>{isPercentage ? value : formattedValue}</span>
    </div>
  );
};

const TabelAnggaran = ({
  onDateRangeChange,
  initialStartDate,
  initialEndDate,
}: DateRangeProps) => {
  const [anggaranData, setAnggaranData] = useState<AnggaranRow[]>([]);
  const [grandTotalState, setGrandTotalState] = useState<AnggaranRow | null>(null);
  const [loading, setLoading] = useState<LoadingState | null>({
    message: "Mempersiapkan data...",
    progress: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  );

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));

    // Buat state baru berdasarkan state sebelumnya
    const newExpandedGroups = {
      ...expandedGroups,
      [groupName]: !expandedGroups[groupName],
    };

    // Simpan state baru ke localStorage
    localStorage.setItem(
      "expandedAnggaranGroups",
      JSON.stringify(newExpandedGroups)
    );

    // Update state React untuk me-render ulang UI
    setExpandedGroups(newExpandedGroups);
  };

  const formatDateWithoutYear = (date: Date | null) => {
    if (!date) return "Pilih Tanggal";
    return format(date, "dd MMMM");
  };

  const filterDataByDate = () => {
    if (!startDate || !endDate) return;
    onDateRangeChange(startDate, endDate);
    fetchData();
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper to parse DD/MM/YYYY to timestamp
  const parseToTimestamp = (dateStr: string): number | null => {
    if (!dateStr) return null;
    const parts = dateStr.split("/");
    if (parts.length < 3) return null;
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
  };

  // Helper for O(1) range check
  const isDateInRangeOptimized = (timestamp: number | null, startLimit: number, endLimit: number): boolean => {
    if (timestamp === null) return false;
    return timestamp >= startLimit && timestamp <= endLimit;
  };

  const processIndividualAnggaran = (
    loket: any,
    endpointData: ReportData[],
    numberOfMonths: number,
    tlStartLimit: number,
    tlEndLimit: number,
    tiStartLimit: number,
    tiEndLimit: number
  ): AnggaranRow => {
    const penerimaanTL = endpointData.reduce((sum, item) => {
      if (!item.iwkbu_tl_tgl_transaksi) return sum;
      const ts = parseToTimestamp(item.iwkbu_tl_tgl_transaksi);
      if (isDateInRangeOptimized(ts, tlStartLimit, tlEndLimit)) {
        return sum + (item.iwkbu_tl_rupiah_penerimaan || 0);
      }
      return sum;
    }, 0);

    const penerimaanTI = endpointData.reduce((sum, item) => {
      if (!item.iwkbu_ti_tgl_transaksi) return sum;
      const ts = parseToTimestamp(item.iwkbu_ti_tgl_transaksi);
      if (isDateInRangeOptimized(ts, tiStartLimit, tiEndLimit)) {
        return sum + (item.iwkbu_ti_rupiah_penerimaan || 0);
      }
      return sum;
    }, 0);

    const targetAnggaranBulanBerjalan = (loket.anggaranSatuTahun / 12) * numberOfMonths;

    return {
      no: loket.no,
      namaLoket: loket.childLoket,
      rowType: "detail",
      anggaranSatuTahun: loket.anggaranSatuTahun,
      targetAnggaranBulan: targetAnggaranBulanBerjalan,
      penerimaanTL,
      penerimaanTI,
      realisasi: calculateRealisasi(penerimaanTI, loket.anggaranSatuTahun),
      gapRealisasiRupiah: penerimaanTI - targetAnggaranBulanBerjalan,
      gapRealisasiPersen: calculateGapRealisasiPersen(penerimaanTI, targetAnggaranBulanBerjalan),
      growthRupiah: penerimaanTI - penerimaanTL,
      growthPersen: calculateGrowthPersen(penerimaanTI, penerimaanTL),
    };
  };

  const updateRunningAnggaranTotal = (total: any, row: AnggaranRow) => {
    total.anggaranSatuTahun += row.anggaranSatuTahun;
    total.targetAnggaranBulan += row.targetAnggaranBulan;
    total.penerimaanTL += row.penerimaanTL;
    total.penerimaanTI += row.penerimaanTI;
    total.gapRealisasiRupiah += row.gapRealisasiRupiah;
    total.growthRupiah += row.growthRupiah;
  };

  const finalizeAnggaranTotal = (total: AnggaranRow) => {
    total.realisasi = calculateRealisasi(total.penerimaanTI, total.anggaranSatuTahun);
    total.gapRealisasiPersen = calculateGapRealisasiPersen(total.penerimaanTI, total.targetAnggaranBulan);
    total.growthPersen = calculateGrowthPersen(total.penerimaanTI, total.penerimaanTL);
  };

  const createEmptyAnggaranRow = (namaLoket: string, type: "header" | "subtotal" | "grandtotal"): AnggaranRow => ({
    no: 0,
    namaLoket,
    rowType: type,
    anggaranSatuTahun: 0,
    targetAnggaranBulan: 0,
    penerimaanTL: 0,
    penerimaanTI: 0,
    realisasi: "0.00%",
    gapRealisasiPersen: "0.00%",
    gapRealisasiRupiah: 0,
    growthPersen: "0.00%",
    growthRupiah: 0,
  });

  const fetchData = async () => {
    if (!startDate || !endDate) return;
    setLoading({ message: "Memulai penghitungan anggaran...", progress: 0 });
    setError(null);
    setAnggaranData([]);
    setGrandTotalState(null);

    const token = Cookies.get("sessionToken");
    if (!token) {
      setError("Sesi telah berakhir, silakan login kembali.");
      setLoading(null);
      return;
    }

    const numberOfMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth()) + 1;
    const tlS = new Date(startDate); tlS.setFullYear(tlS.getFullYear() - 1);
    const tlE = new Date(endDate); tlE.setFullYear(tlE.getFullYear() - 1);
    const tlStartLimit = new Date(tlS.getFullYear(), tlS.getMonth(), tlS.getDate()).getTime();
    const tlEndLimit = new Date(tlE.getFullYear(), tlE.getMonth(), tlE.getDate()).getTime();
    const tiStartLimit = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
    const tiEndLimit = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime();

    let tempRows: AnggaranRow[] = [];
    let currentSubTotal = createEmptyAnggaranRow("SUBTOTAL", "subtotal");
    let runningGrandTotal = createEmptyAnggaranRow("GRAND TOTAL", "grandtotal");
    let currentGroupName = "";

    try {
      for (let i = 0; i < loketMapping.length; i++) {
        const loket = loketMapping[i];
        const progress = Math.round(((i + 1) / loketMapping.length) * 100);

        setLoading({ message: `Menganalisis Anggaran: ${loket.childLoket} (${i + 1}/${loketMapping.length})...`, progress });

        // 1. Fetch
        const endpoint = loket.endpoint.replace(`${BASE_URL}/`, "");
        const res = await fetch(`/api/rekap/${endpoint}`);
        if (!res.ok) throw new Error(`Gagal ambil data ${loket.childLoket}`);
        const result = await res.json();
        const rawData: ReportData[] = result.data || [];

        // 2. Process
        const processedRow = processIndividualAnggaran(loket, rawData, numberOfMonths, tlStartLimit, tlEndLimit, tiStartLimit, tiEndLimit);

        // 3. Handle Grouping
        if (loket.parentLoket) {
          if (currentGroupName !== "") {
            finalizeAnggaranTotal(currentSubTotal);
            tempRows.push(currentSubTotal);
            currentSubTotal = createEmptyAnggaranRow("SUBTOTAL", "subtotal");
          }
          currentGroupName = loket.parentLoket;
          tempRows.push(createEmptyAnggaranRow(currentGroupName, "header"));
        }

        tempRows.push(processedRow);
        updateRunningAnggaranTotal(currentSubTotal, processedRow);
        updateRunningAnggaranTotal(runningGrandTotal, processedRow);

        // Update UI progressively
        setAnggaranData([...tempRows]);
      }

      // Finalize last group and grand total
      finalizeAnggaranTotal(currentSubTotal);
      tempRows.push(currentSubTotal);
      finalizeAnggaranTotal(runningGrandTotal);

      setAnggaranData([...tempRows]);
      setGrandTotalState(runningGrandTotal);
      setLoading(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi Kesalahan");
      setLoading(null);
    }
  };

  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setStartDate(firstDayOfMonth);
    setEndDate(today);
    const initialExpandedState: Record<string, boolean> = {};
    loketMapping.forEach((item) => {
      if (item.parentLoket) initialExpandedState[item.parentLoket] = true;
    });
    setExpandedGroups({});
    onDateRangeChange(firstDayOfMonth, today);
    fetchData();

    // Ambil status grup dari localStorage saat komponen dimuat
    const savedExpandedGroups = localStorage.getItem("expandedAnggaranGroups");
    if (savedExpandedGroups) {
      setExpandedGroups(JSON.parse(savedExpandedGroups));
    } else {
      // Jika tidak ada data tersimpan, semua tertutup (default)
      setExpandedGroups({});
    }
  }, []);


  if (loading) {
    return (
      <div className="inset-0 z-50 flex flex-col items-center justify-center">
        <div className="w-full max-w-md p-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            {/* <Loader2 className="h-4 w-4 animate-spin text-primary" /> */}

            <p className="text-sm text-muted-foreground">
              Memuat Data {`${Math.round(loading.progress)}%`}
            </p>
          </div>

          <Progress
            value={loading.progress}
            className="w-full transition-all duration-300"
          />
        </div>
      </div>
    );
  }
  if (error)
    return (
      <div className="p-4 text-center text-sm text-red-500">Error: {error}</div>
    );

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 rounded-md border p-4 shadow-sm bg-white dark:bg-zinc-900">
          <div className="w-full">
            <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-200">
              Filter Periode Laporan
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full sm:w-[140px] justify-start text-left font-normal text-sm",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateWithoutYear(startDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate || undefined}
                    onSelect={(date) => {
                      setStartDate(date || null);
                      if (date && endDate && date > endDate) setEndDate(null);
                    }}
                    initialFocus
                    fixedWeeks
                    showOutsideDays
                  />
                </PopoverContent>
              </Popover>
              <span className="hidden sm:inline mx-1 text-gray-500">s/d</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full sm:w-[140px] justify-start text-left font-normal text-sm",
                      !endDate && "text-muted-foreground"
                    )}
                    disabled={!startDate}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateWithoutYear(endDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate || undefined}
                    onSelect={(date) => setEndDate(date || null)}
                    initialFocus
                    fixedWeeks
                    showOutsideDays
                    fromDate={startDate || undefined}
                  />
                </PopoverContent>
              </Popover>
              <Button
                onClick={filterDataByDate}
                disabled={!startDate || !endDate}
                className="w-full sm:w-auto sm:ml-2 mt-2 sm:mt-0"
              >
                Tampilkan
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border shadow-md bg-white dark:bg-zinc-900">
        <Table className="min-w-full">
          <TableHeader className="bg-slate-100 dark:bg-zinc-900 sticky top-0 z-20">
            <TableRow>
              <TableHead
                rowSpan={2}
                className="text-slate-800 dark:text-gray-200 w-[50px] text-center align-middle font-semibold whitespace-nowrap px-4"
              >
                NO
              </TableHead>
              <TableHead
                rowSpan={2}
                className="text-slate-800 dark:text-gray-200 min-w-[250px] align-middle font-semibold sticky left-0 bg-slate-100 dark:bg-zinc-900 z-30"
              >
                NAMA LOKET
              </TableHead>
              <TableHead
                rowSpan={2}
                className="text-slate-800 dark:text-gray-200 min-w-[180px] align-middle text-center font-semibold whitespace-nowrap"
              >
                ANGGARAN 1 TAHUN
              </TableHead>
              <TableHead
                rowSpan={2}
                className="text-slate-800 dark:text-gray-200 min-w-[180px] align-middle text-center font-semibold whitespace-nowrap"
              >
                TARGET ANGGARAN S/D SAAT INI
              </TableHead>
              <TableHead
                colSpan={2}
                className="text-slate-800 dark:text-gray-200 text-center border-b border-slate-100 dark:border-zinc-700 font-semibold"
              >
                PENERIMAAN
              </TableHead>
              <TableHead
                rowSpan={2}
                className="text-slate-800 dark:text-gray-200 text-center align-middle font-semibold"
              >
                REALISASI
              </TableHead>
              <TableHead
                colSpan={2}
                className="text-slate-800 dark:text-gray-200 text-center border-b border-slate-100 dark:border-zinc-700 font-semibold"
              >
                GAP REALISASI
              </TableHead>
              <TableHead
                colSpan={2}
                className="text-slate-800 text-center border-b border-slate-100 font-semibold"
              >
                GROWTH
              </TableHead>
            </TableRow>
            <TableRow className="bg-slate-100 dark:bg-zinc-900">
              <TableHead className="text-slate-600 dark:text-gray-300 text-center font-medium whitespace-nowrap">
                {startDate ? startDate.getFullYear() - 1 : "TL"}
              </TableHead>
              <TableHead className="text-slate-600 dark:text-gray-300 text-center font-medium whitespace-nowrap">
                {startDate ? startDate.getFullYear() : "TI"}
              </TableHead>
              <TableHead className="text-slate-600 dark:text-white text-center font-medium whitespace-nowrap">
                %
              </TableHead>
              <TableHead className="text-slate-600 text-center font-medium whitespace-nowrap">
                RUPIAH
              </TableHead>
              <TableHead className="text-slate-600 text-center font-medium whitespace-nowrap">
                %
              </TableHead>
              <TableHead className="text-slate-600 text-center font-medium whitespace-nowrap">
                RUPIAH
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(() => {
              let currentGroup = "";
              return anggaranData.map((row, index) => {
                if (row.rowType === "header") {
                  currentGroup = row.namaLoket;
                  return (
                    <TableRow
                      key={index}
                      className="bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 cursor-pointer"
                      onClick={() => toggleGroup(row.namaLoket)}
                    >
                      <TableCell
                        className="text-gray-900 dark:text-gray-200 text-sm tracking-wider py-3 px-4 sticky left-0 bg-gray-200 dark:bg-zinc-700 z-10"
                        colSpan={2}
                      >
                        <div className="flex items-center gap-2">
                          {expandedGroups[row.namaLoket] ? (
                            <Minus size={16} />
                          ) : (
                            <Plus size={16} />
                          )}
                          {row.namaLoket}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-gray-900 dark:text-gray-200 font-semibold">
                        {formatRupiah(row.anggaranSatuTahun)}
                      </TableCell>
                      <TableCell className="text-right text-gray-900 dark:text-gray-200 font-semibold">
                        {formatRupiah(row.targetAnggaranBulan)}
                      </TableCell>
                      <TableCell className="text-right text-gray-900 dark:text-gray-200 font-semibold">
                        {formatRupiah(row.penerimaanTL)}
                      </TableCell>
                      <TableCell className="text-right text-gray-900 dark:text-gray-200 font-semibold">
                        {formatRupiah(row.penerimaanTI)}
                      </TableCell>
                      <TableCell className="text-center text-gray-900 dark:text-gray-200 font-semibold">
                        {row.realisasi}
                      </TableCell>
                      <TableCell>
                        <PerformanceCell
                          value={row.gapRealisasiPersen}
                          isPercentage
                        />
                      </TableCell>
                      <TableCell>
                        <PerformanceCell value={row.gapRealisasiRupiah} />
                      </TableCell>
                      <TableCell>
                        <PerformanceCell
                          value={row.growthPersen}
                          isPercentage
                        />
                      </TableCell>
                      <TableCell>
                        <PerformanceCell value={row.growthRupiah} />
                      </TableCell>
                    </TableRow>
                  );
                }

                if (row.rowType === "grandtotal") return null;

                const isHidden = currentGroup && !expandedGroups[currentGroup];
                if (isHidden) return null;

                if (row.rowType === "subtotal") {
                  return (
                    <TableRow
                      key={index}
                      className="bg-slate-800 font-bold hover:bg-slate-800"
                    >
                      <TableCell
                        colSpan={2}
                        className="text-left text-white sticky left-5 z-10 hover:bg-slate-800"
                      >
                        {row.namaLoket}
                      </TableCell>
                      <TableCell className="text-right text-white">
                        {formatRupiah(row.anggaranSatuTahun)}
                      </TableCell>
                      <TableCell className="text-right text-white">
                        {formatRupiah(row.targetAnggaranBulan)}
                      </TableCell>
                      <TableCell className="text-right text-white">
                        {formatRupiah(row.penerimaanTL)}
                      </TableCell>
                      <TableCell className="text-right text-white">
                        {formatRupiah(row.penerimaanTI)}
                      </TableCell>
                      <TableCell className="text-center text-white">
                        {row.realisasi}
                      </TableCell>
                      <TableCell>
                        <PerformanceCell
                          value={row.gapRealisasiPersen}
                          isPercentage
                        />
                      </TableCell>
                      <TableCell>
                        <PerformanceCell value={row.gapRealisasiRupiah} />
                      </TableCell>
                      <TableCell>
                        <PerformanceCell
                          value={row.growthPersen}
                          isPercentage
                        />
                      </TableCell>
                      <TableCell>
                        <PerformanceCell value={row.growthRupiah} />
                      </TableCell>
                    </TableRow>
                  );
                }

                return (
                  <TableRow
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-zinc-700 even:bg-white dark:even:bg-zinc-900 odd:bg-slate-50/50 dark:odd:bg-zinc-800/50"
                  >
                    <TableCell className="text-center text-gray-600 dark:text-gray-400">
                      {row.no}
                    </TableCell>
                    <TableCell className="font-medium text-gray-800 dark:text-gray-200 sticky left-0 bg-inherit z-10">
                      {row.namaLoket}
                    </TableCell>
                    <TableCell className="text-right font-mono text-gray-700 dark:text-gray-300">
                      {formatRupiah(row.anggaranSatuTahun)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-gray-700 dark:text-gray-300">
                      {formatRupiah(row.targetAnggaranBulan)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-gray-700 dark:text-gray-300">
                      {formatRupiah(row.penerimaanTL)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-gray-700 dark:text-gray-300">
                      {formatRupiah(row.penerimaanTI)}
                    </TableCell>
                    <TableCell className="text-center font-semibold text-blue-600 dark:text-blue-400">
                      {row.realisasi}
                    </TableCell>
                    <TableCell>
                      <PerformanceCell
                        value={row.gapRealisasiPersen}
                        isPercentage
                      />
                    </TableCell>
                    <TableCell>
                      <PerformanceCell value={row.gapRealisasiRupiah} />
                    </TableCell>
                    <TableCell>
                      <PerformanceCell value={row.growthPersen} isPercentage />
                    </TableCell>
                    <TableCell>
                      <PerformanceCell value={row.growthRupiah} />
                    </TableCell>
                  </TableRow>
                );
              });
            })()}
          </TableBody>
          {grandTotalState && (
            <TableFooter className="bg-slate-800 text-white sticky bottom-0 z-20 hover:bg-slate-800">
              <TableRow>
                <TableCell
                  colSpan={2}
                  className="text-right text-base sticky left-0 bg-slate-800 z-30"
                >
                  {grandTotalState.namaLoket}
                </TableCell>
                <TableCell className="text-right text-base">
                  {formatRupiah(grandTotalState.anggaranSatuTahun)}
                </TableCell>
                <TableCell className="text-right text-base">
                  {formatRupiah(grandTotalState.targetAnggaranBulan)}
                </TableCell>
                <TableCell className="text-right text-base">
                  {formatRupiah(grandTotalState.penerimaanTL)}
                </TableCell>
                <TableCell className="text-right text-base">
                  {formatRupiah(grandTotalState.penerimaanTI)}
                </TableCell>
                <TableCell className="text-center text-base">
                  {grandTotalState.realisasi}
                </TableCell>
                <TableCell>
                  <PerformanceCell
                    value={grandTotalState.gapRealisasiPersen}
                    isPercentage
                  />
                </TableCell>
                <TableCell>
                  <PerformanceCell value={grandTotalState.gapRealisasiRupiah} />
                </TableCell>
                <TableCell>
                  <PerformanceCell
                    value={grandTotalState.growthPersen}
                    isPercentage
                  />
                </TableCell>
                <TableCell>
                  <PerformanceCell value={grandTotalState.growthRupiah} />
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
    </div>
  );
};

export default TabelAnggaran;
