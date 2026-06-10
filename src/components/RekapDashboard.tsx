"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Cookies from "js-cookie";

import { Button } from "./ui/button";

import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Plus, Minus, FileSpreadsheet, CornerDownRight } from "lucide-react";
import { Progress } from "./ui/progress";
import { Loader2 } from "lucide-react";

export interface DateRangeProps {
  startDate: Date | null;
  endDate: Date | null;
  onDateRangeChange: (start: Date | null, end: Date | null) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
}

interface ReportData {
  loket: string;
  kode_loket: string;
  iwkbu_tl_tgl_transaksi: string;
  iwkbu_tl_no_resi: string;
  iwkbu_tl_nopol: string;
  iwkbu_tl_rupiah_penerimaan: number;
  iwkbu_ti_tgl_transaksi: string;
  iwkbu_ti_no_resi: string;
  iwkbu_ti_nopol: string;
  iwkbu_ti_rupiah_penerimaan: number;
  kode_nopol_ci: number;
  kode_nopol_co: number;
  iwkbu_tl_bulan_maju: number;
  iwkbu_ti_bulan_maju: number;
  tl_keterangan_konversi_iwkbu: string;
}

interface GapDetail {
  nopol: string;
  keterangan: string;
  rupiah: number;
  tgl_transaksi: string;
  loket?: string;
}

interface MemastikanDetail {
  nopol: string;
  tgl_transaksi: string;
  rupiah: number;
  loket?: string;
}

interface RekapRow {
  no: number;
  loketKantor: string;
  petugas: string;
  checkinNopol: number;
  checkinRupiah: number;
  checkoutNopol: number;
  checkoutRupiah: number;
  memastikanNopol: number;
  memastikanRupiah: number;
  memastikanPersen: number;
  menambahkanNopol: number;
  menambahkanRupiah: number;
  mengupayakan: number;
  gapNopol: number;
  sisaNopol: number;
  sisaRupiah: number;
  gapDetails: GapDetail[];
  memastikanDetails: MemastikanDetail[];
  mengupayakanCount: number;
  checkinPlaceholder: "0" | "-";
  checkoutPlaceholder: "0" | "-";
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
    childLoket: "LOKET KANWIL JAWA TENGAH",
    petugas: "GUNTUR DWI SAPUTRA",
    endpoint: `${BASE_URL}/loketcabangjawatengah`,
  },
  {
    no: 2,
    parentLoket: "",
    childLoket: "SAMSAT KENDAL",
    petugas: "AJENG SARINASTI",
    endpoint: `${BASE_URL}/samsatkendal`,
  },
  {
    no: 3,
    parentLoket: "",
    childLoket: "SAMSAT DEMAK",
    petugas: "TIARA HAPSARI",
    endpoint: `${BASE_URL}/samsatdemak`, //data gagal terambil
  },
  {
    no: 4,
    parentLoket: "",
    childLoket: "SAMSAT PURWODADI",
    petugas: "LISTIYADI YUSUF NUGROHO",
    endpoint: `${BASE_URL}/samsatpurwodadi`,
  },
  {
    no: 5,
    parentLoket: "",
    childLoket: "SAMSAT UNGARAN",
    petugas: "MAHENDRA DWI HEISTRIANTO",
    endpoint: `${BASE_URL}/samsatungaran`,
  },
  {
    no: 6,
    parentLoket: "",
    childLoket: "SAMSAT SALATIGA",
    petugas: "HEIRTANA HANDIETRA",
    endpoint: `${BASE_URL}/samsatsalatiga`,
  },

  // Wilayah Surakarta
  {
    no: 7,
    parentLoket: "CABANG SURAKARTA",
    childLoket: "LOKET CABANG SURAKARTA",
    petugas: "M. ROSYID ABDURRACHMAN",
    endpoint: `${BASE_URL}/samsatlokperwsra`,
  },
  {
    no: 8,
    parentLoket: "",
    childLoket: "SAMSAT SURAKARTA",
    petugas: "HARI SETIAWAN",
    endpoint: `${BASE_URL}/samsatsurakarta`,
  },
  {
    no: 9,
    parentLoket: "",
    childLoket: "SAMSAT KLATEN",
    petugas: "R ANTON PRASETYO",
    endpoint: `${BASE_URL}/samsatklaten`,
  },
  {
    no: 10,
    parentLoket: "",
    childLoket: "SAMSAT BOYOLALI",
    petugas: "RIO ADITIYA",
    endpoint: `${BASE_URL}/samsatboyolali`,
  },
  {
    no: 11,
    parentLoket: "",
    childLoket: "SAMSAT SRAGEN",
    petugas: "ARIE SOFIANTO",
    endpoint: `${BASE_URL}/samsatsragen`,
  },
  {
    no: 12,
    parentLoket: "",
    childLoket: "SAMSAT PRAMBANAN",
    petugas: "ARISTO YANLIAR",
    endpoint: `${BASE_URL}/samsatprambanan`,
  },
  {
    no: 13,
    parentLoket: "",
    childLoket: "SAMSAT DELANGGU",
    petugas: "SURYO BAGUS LUDIRO",
    endpoint: `${BASE_URL}/samsatdelanggu`,
  },

  // Wilayah Magelang
  {
    no: 14,
    parentLoket: "CABANG MAGELANG",
    childLoket: "LOKET CABANG MAGELANG",
    petugas: "MAHARIS",
    endpoint: `${BASE_URL}/samsatlokpwkmgl`,
  },
  {
    no: 15,
    parentLoket: "",
    childLoket: "SAMSAT MAGELANG",
    petugas: "ADI SETIAWAN",
    endpoint: `${BASE_URL}/samsatmagelang`,
  },
  {
    no: 16,
    parentLoket: "",
    childLoket: "SAMSAT PURWOREJO",
    petugas: "EKO GIGIH",
    endpoint: `${BASE_URL}/samsatpurworejo`,
  },
  {
    no: 17,
    parentLoket: "",
    childLoket: "SAMSAT KEBUMEN",
    petugas: "ADAM HERTANTO",
    endpoint: `${BASE_URL}/samsatkebumen`,
  },
  {
    no: 18,
    parentLoket: "",
    childLoket: "SAMSAT TEMANGGUNG",
    petugas: "IKA WINANDITA SARI",
    endpoint: `${BASE_URL}/samsattemanggung`,
  },
  {
    no: 19,
    parentLoket: "",
    childLoket: "SAMSAT WONOSOBO",
    petugas: "TYSON ADHY PAMUNGKAS",
    endpoint: `${BASE_URL}/samsatwonosobo`,
  },
  {
    no: 20,
    parentLoket: "",
    childLoket: "SAMSAT MUNGKID",
    petugas: "DANY YULIANANTO",
    endpoint: `${BASE_URL}/samsatmungkid`,
  },
  {
    no: 21,
    parentLoket: "",
    childLoket: "SAMSAT BAGELEN",
    petugas: "WINOTO PUJO RUMIESGO",
    endpoint: `${BASE_URL}/samsatbagelen`,
  },

  // Wilayah Purwokerto
  {
    no: 22,
    parentLoket: "CABANG PURWOKERTO",
    childLoket: "LOKET CABANG PURWOKERTO",
    petugas: "ARMA HEDITA S.R.",
    endpoint: `${BASE_URL}/samsatlokprwpwt`,
  },
  {
    no: 23,
    parentLoket: "",
    childLoket: "SAMSAT PURWOKERTO",
    petugas: "ILHAM A.POHAN",
    endpoint: `${BASE_URL}/samsat/purwokerto`,
  },
  {
    no: 24,
    parentLoket: "",
    childLoket: "SAMSAT PURBALINGGA",
    petugas: "AHMAD IMRAN RASIDI",
    endpoint: `${BASE_URL}/samsat/purbalingga`,
  },
  {
    no: 25,
    parentLoket: "",
    childLoket: "SAMSAT BANJARNEGARA",
    petugas: "AFRIYANSYA PRAYUGO",
    endpoint: `${BASE_URL}/samsat/banjarnegara`, //data gagal terambil
  },
  {
    no: 26,
    parentLoket: "",
    childLoket: "SAMSAT MAJENANG",
    petugas: "LIA PUJI UTANTO",
    endpoint: `${BASE_URL}/samsat/majenang`,
  },
  {
    no: 27,
    parentLoket: "",
    childLoket: "SAMSAT CILACAP",
    petugas: "WIDI ANTORO",
    endpoint: `${BASE_URL}/samsat/cilacap`,
  },
  {
    no: 28,
    parentLoket: "",
    childLoket: "SAMSAT WANGON",
    petugas: "RIZKY DWI HATMO N.",
    endpoint: `${BASE_URL}/samsat/wangon`,
  },

  // Wilayah Pekalongan
  {
    no: 29,
    parentLoket: "CABANG PEKALONGAN",
    childLoket: "LOKET CABANG PEKALONGAN",
    petugas: "WAHYU AKBAR ADIGUNA",
    endpoint: `${BASE_URL}/samsat/lokprwpkl`,
  },
  {
    no: 30,
    parentLoket: "",
    childLoket: "SAMSAT PEKALONGAN",
    petugas: "YUDHO TIGO PRAKOSO",
    endpoint: `${BASE_URL}/samsat/pekalongan`,
  },
  {
    no: 31,
    parentLoket: "",
    childLoket: "SAMSAT PEMALANG",
    petugas: "ENDY ARYAGUNAWAN A.A",
    endpoint: `${BASE_URL}/samsat/pemalang`,
  },
  {
    no: 32,
    parentLoket: "",
    childLoket: "SAMSAT TEGAL",
    petugas: "M.SOFYAN ARIFIN MARSETYO",
    endpoint: `${BASE_URL}/samsat/tegal`,
  },
  {
    no: 33,
    parentLoket: "",
    childLoket: "SAMSAT BREBES",
    petugas: "KRISTANTO PRATAMA",
    endpoint: `${BASE_URL}/samsat/brebes`,
  },
  {
    no: 34,
    parentLoket: "",
    childLoket: "SAMSAT BATANG",
    petugas: "SEPTIN DIAH KURNIAWATI",
    endpoint: `${BASE_URL}/samsat/batang`,
  },
  {
    no: 35,
    parentLoket: "",
    childLoket: "SAMSAT KAJEN",
    petugas: "YUDHI BAGUS KURNIAWATI",
    endpoint: `${BASE_URL}/samsat/kajen`,
  },
  {
    no: 36,
    parentLoket: "",
    childLoket: "SAMSAT SLAWI",
    petugas: "WASKITO ADHI ARIYANTO",
    endpoint: `${BASE_URL}/samsat/slawi`,
  },
  {
    no: 37,
    parentLoket: "",
    childLoket: "SAMSAT BUMIAYU",
    petugas: "HARI SUDJATNIKO",
    endpoint: `${BASE_URL}/samsat/bumiayu`,
  },
  {
    no: 38,
    parentLoket: "",
    childLoket: "SAMSAT TANJUNG",
    petugas: "MAGDALENA SIAHAAN",
    endpoint: `${BASE_URL}/samsat/tanjung`,
  },

  // Wilayah Pati
  {
    no: 39,
    parentLoket: "CABANG PATI",
    childLoket: "LOKET CABANG PATI",
    petugas: "YEKTI KUMALA SARI",
    endpoint: `${BASE_URL}/samsat/lokprwpti`,
  },
  {
    no: 40,
    parentLoket: "",
    childLoket: "SAMSAT PATI",
    petugas: "ARIA BRAMANTO",
    endpoint: `${BASE_URL}/samsat/pati`,
  },
  {
    no: 41,
    parentLoket: "",
    childLoket: "SAMSAT KUDUS",
    petugas: "AGUS MUJAYANTO",
    endpoint: `${BASE_URL}/samsat/kudus`,
  },
  {
    no: 42,
    parentLoket: "",
    childLoket: "SAMSAT JEPARA",
    petugas: "IWAN BACHTIAR",
    endpoint: `${BASE_URL}/samsat/jepara`,
  },
  {
    no: 43,
    parentLoket: "",
    childLoket: "SAMSAT REMBANG",
    petugas: "ADHIYANTO",
    endpoint: `${BASE_URL}/samsat/rembang`,
  },
  {
    no: 44,
    parentLoket: "",
    childLoket: "SAMSAT BLORA",
    petugas: "WAHYUL HUDA",
    endpoint: `${BASE_URL}/samsat/blora`,
  },
  {
    no: 45,
    parentLoket: "",
    childLoket: "SAMSAT CEPU",
    petugas: "MUHAMMAD FAHRUDDIN",
    endpoint: `${BASE_URL}/samsat/cepu`,
  },
  // Wilayah Semarang
  {
    no: 46,
    parentLoket: "CABANG SEMARANG",
    childLoket: "LOKET CABANG SEMARANG",
    petugas: "RIKA WAHYU UTAMI",
    endpoint: `${BASE_URL}/samsat/lokprwsmg`,
  },
  {
    no: 47,
    parentLoket: "",
    childLoket: "SAMSAT SEMARANG I",
    petugas: "BIMO",
    endpoint: `${BASE_URL}/samsat/semarang1`,
  },
  {
    no: 48,
    parentLoket: "",
    childLoket: "SAMSAT SEMARANG II",
    petugas: "ARIEF EKA S",
    endpoint: `${BASE_URL}/samsat/semarang2`,
  },
  {
    no: 49,
    parentLoket: "",
    childLoket: "SAMSAT SEMARANG III",
    petugas: "ARIS MURDIYANTO",
    endpoint: `${BASE_URL}/samsat/semarang3`,
  },
  // Wilayah Sukoharjo
  {
    no: 50,
    parentLoket: "CABANG SUKOHARJO",
    childLoket: "LOKET CABANG SUKOHARJO",
    petugas: "M. HASBI",
    endpoint: `${BASE_URL}/samsat/lokprwskh`,
  },
  {
    no: 51,
    parentLoket: "",
    childLoket: "SAMSAT SUKOHARJO",
    petugas: "MARIA TUTI",
    endpoint: `${BASE_URL}/samsat/sukoharjo`,
  },
  {
    no: 52,
    parentLoket: "",
    childLoket: "SAMSAT KARANGANYAR",
    petugas: "M. WAHYUANTO",
    endpoint: `${BASE_URL}/samsat/karanganyar`,
  },
  {
    no: 53,
    parentLoket: "",
    childLoket: "SAMSAT WONOGIRI",
    petugas: "AFRIZAL BASYA",
    endpoint: `${BASE_URL}/samsat/wonogiri`,
  },
  {
    no: 54,
    parentLoket: "",
    childLoket: "SAMSAT PURWANTORO",
    petugas: "BONNY C. EDWARD",
    endpoint: `${BASE_URL}/samsat/purwantoro`,
  },
  {
    no: 55,
    parentLoket: "",
    childLoket: "SAMSAT BATURETNO",
    petugas: "M. TAUFIKUROHMAN",
    endpoint: `${BASE_URL}/samsat/baturetno`,
  },
];



// Helper function to check if data exists (not empty/null/undefined)
const hasData = (nopol: string | undefined | null): boolean => {
  if (!nopol) return false;
  const cleanNopol = nopol.trim();
  return cleanNopol !== "" && cleanNopol !== "-";
};

// Helper function to check if NOPOL is NIHIL
const isNihil = (nopol: string | undefined | null): boolean => {
  if (!nopol) return false;
  return nopol.trim().toUpperCase() === "NIHIL";
};

const RekapDashboard = ({
  onDateRangeChange,
  initialStartDate,
  initialEndDate,
}: DateRangeProps) => {
  const [data, setData] = useState<{ endpoint: string; data: ReportData[] }[]>(
    []
  );
  // const [rekapData, setRekapData] = useState<RekapRow[]>([]); // Replaced by useMemo
  const [month, setMonth] = useState<number>(5);
  // const [loading, setLoading] = useState(true);
  const [loading, setLoading] = useState<LoadingState | null>({
    message: "Mempersiapkan data...",
    progress: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<RekapRow | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [useDateRange, setUseDateRange] = useState(true);
  const [appliedStartDate, setAppliedStartDate] = useState<Date | null>(null);
  const [appliedEndDate, setAppliedEndDate] = useState<Date | null>(null);

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  );
  const [detailType, setDetailType] = useState<"gap" | "memastikan">("gap");
  //fungsi expand
  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };
  const formatDateWithoutYear = (date: Date | null) => {
    if (!date) return "Pilih Tanggal";
    return format(date, "dd MMMM");
  };

  const filterDataByDate = () => {
    if (!startDate || !endDate) return;

    setUseDateRange(true);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    onDateRangeChange(startDate, endDate);
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value * 100)}%`;
  };

  // fungsi untuk export di excel
  const exportGapDetailsToExcel = (
    row: RekapRow,
    type: "gap" | "memastikan"
  ) => {
    if (!row.gapDetails || row.gapDetails.length === 0) {
      alert("Tidak ada data GAP untuk diexport.");
      return;
    }

    const dataToExport =
      type === "gap"
        ? row.gapDetails
        : row.memastikanDetails.map((item) => ({
          Nopol: item.nopol,
          Tanggal_Transaksi: item.tgl_transaksi,
          Rupiah: item.rupiah,
          Loket: item.loket || row.loketKantor,
        }));

    if (dataToExport.length === 0) {
      alert(
        `Tidak ada data ${type === "gap" ? "GAP" : "Memastikan"
        } untuk diexport.`
      );
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "GAP Nopol");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const fileName = `${detailType}_${row.loketKantor.replace(
      /\s+/g,
      "_"
    )}.xlsx`.toUpperCase();

    saveAs(blob, fileName);
  };
  const fetchData = async () => {
    setLoading({ message: "Mengambil data dari semua loket...", progress: 5 });
    setError(null);
    setData([]);

    const endpoints = loketMapping.map((item) => item.endpoint.replace(`${BASE_URL}/`, ""));
    const totalEndpoints = endpoints.length;
    const batchSize = 5;
    const accumulatedResults: any[] = [];

    try {
      for (let i = 0; i < totalEndpoints; i += batchSize) {
        const batch = endpoints.slice(i, i + batchSize);
        const progress = Math.round(((i) / totalEndpoints) * 100);

        setLoading({
          message: `Mengunduh data massal (${i}/${totalEndpoints})...`,
          progress
        });

        const bulkRes = await fetch("/api/bulk-rekap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoints: batch }),
        });

        if (!bulkRes.ok) {
          throw new Error(`Gagal mengunduh batch ${i / batchSize + 1}`);
        }

        const batchData = await bulkRes.json();
        accumulatedResults.push(...batchData.results);
      }

      setLoading({ message: "Memproses dan menampilkan data...", progress: 100 });

      const responses = accumulatedResults.map((res: any) => ({
        endpoint: `${BASE_URL}/${res.endpoint}`,
        data: res.data || [],
      }));

      setData(responses);
      setTimeout(() => setLoading(null), 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi Kesalahan");
      setLoading(null);
    }
  };

  const rekapData = useMemo(() => {
    if (!data.length) {
      return [];
    }

    const monthStr = month.toString().padStart(2, "0");
    const result: RekapRow[] = [];
    let groupSubTotal: RekapRow | null = null;

    // Optimization: Pre-calculate date boundaries
    // We convert to time values (numbers) for faster comparison than creating new Date objects in loops
    let startLimit = 0;
    let endLimit = 0;
    let tlStartLimit = 0;
    let tlEndLimit = 0;
    let tiStartLimit = 0;
    let tiEndLimit = 0;

    // Helper to parse DD/MM/YYYY to timestamp
    const parseToTimestamp = (dateStr: string): number | null => {
      if (!dateStr) return null;
      const parts = dateStr.split("/");
      if (parts.length < 3) return null;
      // Note: Months are 0-indexed in JS Date
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
    };

    if (appliedStartDate && appliedEndDate) {
      // Reset hours for accurate comparison
      const s = new Date(appliedStartDate.getFullYear(), appliedStartDate.getMonth(), appliedStartDate.getDate());
      const e = new Date(appliedEndDate.getFullYear(), appliedEndDate.getMonth(), appliedEndDate.getDate());
      startLimit = s.getTime();
      endLimit = e.getTime();
    }

    // Define Date Ranges for TL (Check-In) and TI (Check-Out)
    const today = new Date();
    const currentRealYear = today.getFullYear();
    const selectedYear = appliedStartDate ? appliedStartDate.getFullYear() : currentRealYear;

    let tlStartDate = appliedStartDate;
    let tlEndDate = appliedEndDate;
    let tiStartDate = appliedStartDate;
    let tiEndDate = appliedEndDate;

    // RULE: If data is pulled for ANY year:
    // - Check-In (TL) uses Year - 1.
    // - Check-Out (TI) uses Selected Year (Current).
    if (appliedStartDate && appliedEndDate) {
      const tlStart = new Date(appliedStartDate);
      tlStart.setFullYear(appliedStartDate.getFullYear() - 1);
      tlStartDate = tlStart;

      const tlEnd = new Date(appliedEndDate);
      tlEnd.setFullYear(appliedEndDate.getFullYear() - 1);
      tlEndDate = tlEnd;
    }

    // Convert boundaries to timestamps for O(1) comparison in loops
    if (tlStartDate && tlEndDate) {
      tlStartLimit = new Date(tlStartDate.getFullYear(), tlStartDate.getMonth(), tlStartDate.getDate()).getTime();
      tlEndLimit = new Date(tlEndDate.getFullYear(), tlEndDate.getMonth(), tlEndDate.getDate()).getTime();
    }
    if (tiStartDate && tiEndDate) {
      tiStartLimit = new Date(tiStartDate.getFullYear(), tiStartDate.getMonth(), tiStartDate.getDate()).getTime();
      tiEndLimit = new Date(tiEndDate.getFullYear(), tiEndDate.getMonth(), tiEndDate.getDate()).getTime();
    }

    // Optimized check function
    const isDateInRangeOptimized = (dateTimestamp: number | null, rangeStart: number, rangeEnd: number) => {
      if (dateTimestamp === null) return false;
      return dateTimestamp >= rangeStart && dateTimestamp <= rangeEnd;
    };

    const finalizeAndPushSubTotal = (subTotal: RekapRow) => {
      // Kalkulasi persentase berdasarkan Nopol unik untuk akurasi
      const uniqueMemastikanNopol = new Set(
        subTotal.memastikanDetails.map((d) => d.nopol)
      );
      subTotal.memastikanPersen =
        subTotal.checkinNopol > 0
          ? subTotal.memastikanNopol / subTotal.checkinNopol
          : 0;

      // Kalkulasi rata-rata Mengupayakan
      subTotal.mengupayakan =
        subTotal.mengupayakanCount > 0
          ? Math.round(subTotal.mengupayakan / subTotal.mengupayakanCount)
          : 0;

      result.push(subTotal);
    };

    loketMapping.forEach((loket) => {
      const endpointData =
        data.find((d) => d.endpoint === loket.endpoint)?.data || [];
      const gapDetails: GapDetail[] = [];
      const memastikanDetails: MemastikanDetail[] = [];

      const rekap: RekapRow = {
        no: loket.no,
        loketKantor: loket.childLoket,
        petugas: loket.petugas,
        checkinNopol: 0,
        checkinRupiah: 0,
        checkoutNopol: 0,
        checkoutRupiah: 0,
        memastikanNopol: 0,
        memastikanRupiah: 0,
        memastikanPersen: 0,
        menambahkanNopol: 0,
        menambahkanRupiah: 0,
        mengupayakan: 0,
        gapNopol: 0,
        sisaNopol: 0,
        sisaRupiah: 0,
        gapDetails: [],
        memastikanDetails: [],
        mengupayakanCount: 0,
        checkinPlaceholder: "-",
        checkoutPlaceholder: "-",
      };

      const matchedNopol = new Set<string>();
      let matchedRupiah = 0;
      let totalBulanMajuTI = 0;
      let totalBulanMajuTL = 0;
      let countNopolBulanMajuTL = 0;
      let countNopolBulanMajuTI = 0;
      let menambahkanNopol = 0;
      let menambahkanRupiah = 0;
      const sisaNopolSet = new Set<string>();
      let sisaRupiah = 0;

      // 1. Pre-process dates to timestamps once per item
      // This creates a temporary map or we just call parseToTimestamp in the loop. 
      // Since we iterate multiple times, let's just parse efficiently.

      // Process checkin (TL) data
      endpointData.forEach((item) => {
        if (item.iwkbu_tl_tgl_transaksi) {
          const parts = item.iwkbu_tl_tgl_transaksi.split("/");
          // parts[1] is month

          const monthMatch = parts[1] === monthStr;

          let dateRangeMatch = false;
          if (useDateRange && tlStartLimit > 0) {
            const ts = parseToTimestamp(item.iwkbu_tl_tgl_transaksi);
            dateRangeMatch = isDateInRangeOptimized(ts, tlStartLimit, tlEndLimit) ||
              isDateInRangeOptimized(ts, tiStartLimit, tiEndLimit);
          }

          if (
            (!useDateRange && monthMatch) ||
            (useDateRange && dateRangeMatch)
          ) {
            // Count data if exists (including NIHIL which shows as 0)
            if (hasData(item.iwkbu_tl_nopol)) {
              // If NIHIL, explicitly add 0; otherwise use actual value
              if (isNihil(item.iwkbu_tl_nopol)) {
                // NIHIL counts as present data but with value 0
                rekap.checkinNopol += 0;
                rekap.checkinRupiah += 0;
              } else {
                rekap.checkinNopol += item.kode_nopol_co || 0;
                rekap.checkinRupiah += item.iwkbu_tl_rupiah_penerimaan || 0;
              }
              if (item.iwkbu_tl_bulan_maju > 0) {
                totalBulanMajuTL += item.iwkbu_tl_bulan_maju;
                countNopolBulanMajuTL++;
              }
            }
          }
        }
      });

      const checkinNopolSet = new Set<string>();
      endpointData.forEach((item) => {
        if (item.iwkbu_tl_tgl_transaksi) {
          const parts = item.iwkbu_tl_tgl_transaksi.split("/");
          const monthMatch = parts[1] === monthStr;
          let dateRangeMatch = false;

          if (useDateRange && tlStartLimit > 0) {
            const ts = parseToTimestamp(item.iwkbu_tl_tgl_transaksi);
            dateRangeMatch = isDateInRangeOptimized(ts, tlStartLimit, tlEndLimit);
          }

          if (
            (!useDateRange && monthMatch) ||
            (useDateRange && dateRangeMatch)
          ) {
            // Only add nopols with data (including NIHIL) to the set
            if (hasData(item.iwkbu_tl_nopol)) {
              checkinNopolSet.add(item.iwkbu_tl_nopol);
            }
          }
        }
      });

      // Process checkout (TI) data
      endpointData.forEach((item) => {
        if (item.iwkbu_ti_tgl_transaksi) {
          const parts = item.iwkbu_ti_tgl_transaksi.split("/");
          const monthMatch = parts[1] === monthStr;
          let dateRangeMatch = false;

          if (useDateRange && tiStartLimit > 0) {
            const ts = parseToTimestamp(item.iwkbu_ti_tgl_transaksi);
            dateRangeMatch = isDateInRangeOptimized(ts, tiStartLimit, tiEndLimit);
          }

          if (
            (!useDateRange && monthMatch) ||
            (useDateRange && dateRangeMatch)
          ) {
            // Count data if exists (including NIHIL which shows as 0)
            if (hasData(item.iwkbu_ti_nopol)) {
              // If NIHIL, explicitly add 0; otherwise use actual value
              if (isNihil(item.iwkbu_ti_nopol)) {
                // NIHIL counts as present data but with value 0
                rekap.checkoutNopol += 0;
                rekap.checkoutRupiah += 0;
              } else {
                rekap.checkoutNopol += item.kode_nopol_ci || 0;
                rekap.checkoutRupiah += item.iwkbu_ti_rupiah_penerimaan || 0;
              }

              const isMenambahkan =
                item.tl_keterangan_konversi_iwkbu === "Armada Baru" ||
                item.tl_keterangan_konversi_iwkbu === "Mutasi Masuk";

              // Check against checkin set (includes NIHIL data)
              const isMemastikan = checkinNopolSet.has(item.iwkbu_ti_nopol);

              if (isMenambahkan && !isNihil(item.iwkbu_ti_nopol)) {
                menambahkanNopol += 1;
                menambahkanRupiah += item.iwkbu_ti_rupiah_penerimaan || 0;
              }

              if (isMemastikan && item.iwkbu_ti_nopol && !isNihil(item.iwkbu_ti_nopol)) {
                memastikanDetails.push({
                  nopol: item.iwkbu_ti_nopol,
                  tgl_transaksi: item.iwkbu_ti_tgl_transaksi,
                  rupiah: item.iwkbu_ti_rupiah_penerimaan || 0,
                  loket: loket.childLoket,
                });
              }

              const processedNopols = new Set<string>();
              endpointData.forEach((ciItem) => {
                if (
                  hasData(ciItem.iwkbu_ti_nopol) &&
                  !isNihil(ciItem.iwkbu_ti_nopol) &&
                  ((isMemastikan && matchedNopol.has(ciItem.iwkbu_ti_nopol)) ||
                    (isMenambahkan &&
                      (ciItem.tl_keterangan_konversi_iwkbu === "Armada Baru" ||
                        ciItem.tl_keterangan_konversi_iwkbu === "Mutasi Masuk")))
                ) {
                  processedNopols.add(ciItem.iwkbu_ti_nopol);
                }
              });

              if (
                item.iwkbu_ti_nopol &&
                !isNihil(item.iwkbu_ti_nopol) &&
                !processedNopols.has(item.iwkbu_ti_nopol)
              ) {
                sisaNopolSet.add(item.iwkbu_ti_nopol);
                sisaRupiah += item.iwkbu_ti_rupiah_penerimaan || 0;
              }

              if (item.iwkbu_ti_bulan_maju > 0) {
                totalBulanMajuTI += item.iwkbu_ti_bulan_maju;
                countNopolBulanMajuTI++;
              }
            }
          }
        }
      });

      // Process gap details (checkin nopols not in checkout)
      endpointData.forEach((item) => {
        if (item.iwkbu_tl_tgl_transaksi) {
          const parts = item.iwkbu_tl_tgl_transaksi.split("/");
          const monthMatch = parts[1] === monthStr;
          let dateRangeMatch = false;

          if (useDateRange && tlStartLimit > 0) {
            const ts = parseToTimestamp(item.iwkbu_tl_tgl_transaksi);
            dateRangeMatch = isDateInRangeOptimized(ts, tlStartLimit, tlEndLimit);
          }

          if (
            (!useDateRange && monthMatch) ||
            (useDateRange && dateRangeMatch)
          ) {
            // Only process if data exists and is not NIHIL
            if (hasData(item.iwkbu_tl_nopol) && !isNihil(item.iwkbu_tl_nopol)) {
              const foundInCheckout = endpointData.some(
                (tiItem) => {
                  const tiNopolCheck = hasData(tiItem.iwkbu_ti_nopol) &&
                    !isNihil(tiItem.iwkbu_ti_nopol) &&
                    tiItem.iwkbu_ti_nopol === item.iwkbu_tl_nopol &&
                    tiItem.iwkbu_ti_tgl_transaksi;

                  if (!tiNopolCheck) return false;

                  if (!useDateRange) {
                    return tiItem.iwkbu_ti_tgl_transaksi.split("/")[1] === monthStr;
                  } else if (tiStartLimit > 0) {
                    const ts = parseToTimestamp(tiItem.iwkbu_ti_tgl_transaksi);
                    return isDateInRangeOptimized(ts, tiStartLimit, tiEndLimit);
                  }
                  return false;
                }
              );

              if (!foundInCheckout) {
                gapDetails.push({
                  nopol: item.iwkbu_tl_nopol,
                  keterangan: item.tl_keterangan_konversi_iwkbu || "-",
                  rupiah: item.iwkbu_tl_rupiah_penerimaan || 0,
                  tgl_transaksi: item.iwkbu_tl_tgl_transaksi,
                  loket: loket.childLoket,
                });
              }
            }
          }
        }
      });

      rekap.memastikanNopol = memastikanDetails.length;
      rekap.memastikanRupiah = memastikanDetails.reduce(
        (sum, detail) => sum + detail.rupiah,
        0
      );
      // Hapus kalkulasi Nopol unik dan gunakan total memastikanNopol secara langsung.
      rekap.memastikanPersen =
        rekap.checkinNopol > 0 ? rekap.memastikanNopol / rekap.checkinNopol : 0;
      rekap.menambahkanNopol = menambahkanNopol;
      rekap.menambahkanRupiah = menambahkanRupiah;
      rekap.gapNopol = gapDetails.length;
      rekap.mengupayakan =
        countNopolBulanMajuTI > 0
          ? Math.round(totalBulanMajuTI / rekap.checkoutNopol)
          : 0;

      rekap.sisaNopol =
        rekap.checkoutNopol - (rekap.memastikanNopol + rekap.menambahkanNopol);
      rekap.sisaRupiah =
        rekap.checkoutRupiah -
        (rekap.memastikanRupiah + rekap.menambahkanRupiah);
      rekap.gapDetails = gapDetails;
      rekap.memastikanDetails = memastikanDetails;

      // Tentukan placeholder untuk nilai kosong berdasarkan data mentah
      rekap.checkinPlaceholder = "-";
      rekap.checkoutPlaceholder = "-";

      if (rekap.checkinNopol === 0) {
        const hasNihilRecordTl = endpointData.some((item) => {
          if (!item.iwkbu_tl_tgl_transaksi) return false;

          let isInRange = false;
          if (useDateRange && tlStartLimit > 0) {
            const ts = parseToTimestamp(item.iwkbu_tl_tgl_transaksi);
            isInRange = isDateInRangeOptimized(ts, tlStartLimit, tlEndLimit);
          } else if (!useDateRange) {
            const parts = item.iwkbu_tl_tgl_transaksi.split("/");
            isInRange = parts[1] === monthStr;
          }

          if (!isInRange) return false;

          const nopol = String(item.iwkbu_tl_nopol || "").trim().toUpperCase();
          const noResi = String(item.iwkbu_tl_no_resi || "").trim().toUpperCase();
          const desc = String(item.tl_keterangan_konversi_iwkbu || "").trim().toUpperCase();

          return nopol === 'NIHIL' || noResi === 'NIHIL' || desc.includes('NIHIL');
        });

        if (hasNihilRecordTl) {
          rekap.checkinPlaceholder = "0";
        }
      }

      if (rekap.checkoutNopol === 0) {
        const hasNihilRecordTi = endpointData.some((item) => {
          if (!item.iwkbu_ti_tgl_transaksi) return false;

          let isInRange = false;
          if (useDateRange && tiStartLimit > 0) {
            const ts = parseToTimestamp(item.iwkbu_ti_tgl_transaksi);
            isInRange = isDateInRangeOptimized(ts, tiStartLimit, tiEndLimit);
          } else if (!useDateRange) {
            const parts = item.iwkbu_ti_tgl_transaksi.split("/");
            isInRange = parts[1] === monthStr;
          }

          if (!isInRange) return false;

          const nopol = String(item.iwkbu_ti_nopol || "").trim().toUpperCase();
          const noResi = String(item.iwkbu_ti_no_resi || "").trim().toUpperCase();
          const desc = String(item.tl_keterangan_konversi_iwkbu || "").trim().toUpperCase();

          return nopol === 'NIHIL' || noResi === 'NIHIL' || desc.includes('NIHIL');
        });

        if (hasNihilRecordTi) {
          rekap.checkoutPlaceholder = "0";
        }
      }

      // Handle parent loket and subtotals
      if (loket.parentLoket) {
        if (groupSubTotal) {
          finalizeAndPushSubTotal(groupSubTotal);
          groupSubTotal = null;
        }

        result.push({
          no: 0,
          loketKantor: loket.parentLoket,
          petugas: "",
          checkinNopol: 0,
          checkinRupiah: 0,
          checkoutNopol: 0,
          checkoutRupiah: 0,
          memastikanNopol: 0,
          memastikanRupiah: 0,
          memastikanPersen: 0,
          menambahkanNopol: 0,
          menambahkanRupiah: 0,
          mengupayakan: 0,
          gapNopol: 0,
          sisaNopol: 0,
          sisaRupiah: 0,
          gapDetails: [],
          memastikanDetails: [],
          mengupayakanCount: 0,
          checkinPlaceholder: "-",
          checkoutPlaceholder: "-",
        });

        groupSubTotal = {
          no: 0,
          loketKantor: "SUB TOTAL",
          petugas: "",
          checkinNopol: 0,
          checkinRupiah: 0,
          checkoutNopol: 0,
          checkoutRupiah: 0,
          memastikanNopol: 0,
          memastikanRupiah: 0,
          memastikanPersen: 0,
          menambahkanNopol: 0,
          menambahkanRupiah: 0,
          mengupayakan: 0,
          gapNopol: 0,
          sisaNopol: 0,
          sisaRupiah: 0,
          gapDetails: [],
          memastikanDetails: [],
          mengupayakanCount: 0,
          checkinPlaceholder: "-",
          checkoutPlaceholder: "-",
        };
      }

      result.push(rekap);

      if (groupSubTotal) {
        groupSubTotal.checkinNopol += rekap.checkinNopol;
        groupSubTotal.checkinRupiah += rekap.checkinRupiah;
        groupSubTotal.checkoutNopol += rekap.checkoutNopol;
        groupSubTotal.checkoutRupiah += rekap.checkoutRupiah;
        groupSubTotal.memastikanNopol += rekap.memastikanNopol;
        groupSubTotal.memastikanRupiah += rekap.memastikanRupiah;
        groupSubTotal.menambahkanNopol += rekap.menambahkanNopol;
        groupSubTotal.menambahkanRupiah += rekap.menambahkanRupiah;
        if (rekap.mengupayakan > 0) {
          groupSubTotal.mengupayakan += rekap.mengupayakan;
          groupSubTotal.mengupayakanCount =
            (groupSubTotal.mengupayakanCount || 0) + 1;
        }
        groupSubTotal.gapNopol += rekap.gapNopol;
        groupSubTotal.sisaNopol += rekap.sisaNopol;
        groupSubTotal.sisaRupiah += rekap.sisaRupiah;

        groupSubTotal.gapDetails = groupSubTotal.gapDetails.concat(
          rekap.gapDetails
        );
        groupSubTotal.memastikanDetails =
          groupSubTotal.memastikanDetails.concat(rekap.memastikanDetails);
      }
    });

    if (groupSubTotal) {
      finalizeAndPushSubTotal(groupSubTotal);
    }

    const subTotalRows = result.filter(
      (row) => row.loketKantor === "SUB TOTAL"
    );

    const grandTotal: RekapRow = {
      no: 0,
      loketKantor: "GRAND TOTAL",
      petugas: "",
      checkinNopol: subTotalRows.reduce(
        (sum, row) => sum + row.checkinNopol,
        0
      ),
      checkinRupiah: subTotalRows.reduce(
        (sum, row) => sum + row.checkinRupiah,
        0
      ),
      checkoutNopol: subTotalRows.reduce(
        (sum, row) => sum + row.checkoutNopol,
        0
      ),
      checkoutRupiah: subTotalRows.reduce(
        (sum, row) => sum + row.checkoutRupiah,
        0
      ),
      memastikanNopol: subTotalRows.reduce(
        (sum, row) => sum + row.memastikanNopol,
        0
      ),
      memastikanRupiah: subTotalRows.reduce(
        (sum, row) => sum + row.memastikanRupiah,
        0
      ),
      memastikanPersen:
        subTotalRows.reduce((sum, row) => sum + row.checkinNopol, 0) > 0
          ? subTotalRows.reduce((sum, row) => sum + row.memastikanNopol, 0) /
          subTotalRows.reduce((sum, row) => sum + row.checkinNopol, 0)
          : 0,
      menambahkanNopol: subTotalRows.reduce(
        (sum, row) => sum + row.menambahkanNopol,
        0
      ),
      menambahkanRupiah: subTotalRows.reduce(
        (sum, row) => sum + row.menambahkanRupiah,
        0
      ),
      mengupayakan: Math.round(
        subTotalRows.reduce((sum, row) => sum + row.mengupayakan, 0) /
        (subTotalRows.filter((row) => row.mengupayakan > 0).length || 1)
      ),
      gapNopol: subTotalRows.reduce((sum, row) => sum + row.gapNopol, 0),
      sisaNopol: subTotalRows.reduce((sum, row) => sum + row.sisaNopol, 0),
      sisaRupiah: subTotalRows.reduce((sum, row) => sum + row.sisaRupiah, 0),
      gapDetails: [],
      memastikanDetails: [],
      mengupayakanCount: 0,
      checkinPlaceholder: "-",
      checkoutPlaceholder: "-",
    };

    result.push(grandTotal);
    return result;
  }, [data, month, appliedStartDate, appliedEndDate, useDateRange]);

  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    setStartDate(firstDayOfMonth);
    setEndDate(today);
    setAppliedStartDate(firstDayOfMonth);
    setAppliedEndDate(today);
    setMonth(today.getMonth() + 1);
    setUseDateRange(true);

    // kirim ke parent component
    onDateRangeChange(firstDayOfMonth, today);

    fetchData();
  }, []);



  const handleDetail = (row: RekapRow, type: "gap" | "memastikan") => {
    setSelectedRow(row);
    setDetailType(type);
  };

  if (loading) {
    return (
      <div className="inset-0 z-50 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-full max-w-md space-y-4 p-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{loading.message}</p>
          </div>
          <div className="space-y-2">
            <Progress value={loading.progress} className="h-2 w-full" />
            <p className="text-xs text-muted-foreground font-mono">{loading.progress}% Selesai</p>
          </div>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            Sistem sedang sinkronisasi dengan Google Sheets
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-sm text-red-500">Error: {error}</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 rounded-md border p-4 shadow-sm bg-white dark:bg-zinc-900">
          <div className="w-full">
            <label className="text-sm font-medium mb-1 block">
              Filter Tanggal
            </label>

            {/* Date Range Container */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
              {/* Start Date Picker */}
              <div className="w-full sm:w-auto">
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
                        if (date && endDate && date > endDate) {
                          setEndDate(null);
                        }
                      }}
                      initialFocus
                      fixedWeeks
                      showOutsideDays
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Separator */}
              <span className="hidden sm:inline mx-1 text-gray-500">s/d</span>
              <span className="sm:hidden text-xs text-gray-500 text-center w-full">
                sampai dengan
              </span>

              {/* End Date Picker */}
              <div className="w-full sm:w-auto">
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
              </div>

              {/* Submit Button */}
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

      <div className="overflow-auto rounded-lg border shadow-md bg-white dark:bg-zinc-900">
        <Table>
          <TableHeader className="bg-gray-100 dark:bg-zinc-900">
            <TableRow>
              <TableHead className="text-gray-800 dark:text-gray-200 w-[50px] text-center">
                NO
              </TableHead>
              <TableHead className="text-gray-800 dark:text-gray-200 min-w-[220px]">
                LOKET KANTOR
              </TableHead>
              <TableHead className="text-gray-800 dark:text-gray-200 min-w-[160px]">
                PETUGAS
              </TableHead>
              <TableHead colSpan={2} className="text-gray-800 dark:text-gray-200 text-center">
                CHECK-IN
              </TableHead>
              <TableHead colSpan={2} className="text-gray-800 dark:text-gray-200 text-center">
                CHECK-OUT
              </TableHead>
              <TableHead colSpan={3} className="text-gray-800 dark:text-gray-200 text-center">
                MEMASTIKAN
              </TableHead>
              <TableHead className="text-gray-800 dark:text-gray-200 text-center">GAP</TableHead>
              <TableHead className="text-gray-800 dark:text-gray-200 text-center">
                MENGUPAYAKAN
              </TableHead>
              <TableHead colSpan={2} className="text-gray-800 dark:text-gray-200 text-center">
                MENAMBAHKAN
              </TableHead>
              <TableHead colSpan={2} className="text-gray-800 dark:text-gray-200 text-center">
                PENERIMAAN LEBIH
              </TableHead>
            </TableRow>
            <TableRow>
              <TableHead></TableHead>
              <TableHead></TableHead>
              <TableHead></TableHead>
              <TableHead className="text-gray-800 dark:text-gray-200 text-center">NOPOL</TableHead>
              <TableHead className="text-gray-800 dark:text-gray-200 text-center">
                RUPIAH
              </TableHead>
              <TableHead className="text-gray-800 dark:text-gray-200 text-center">NOPOL</TableHead>
              <TableHead className="text-gray-800 dark:text-gray-200 text-center">
                RUPIAH
              </TableHead>
              <TableHead className="text-gray-800 dark:text-gray-200 text-center">NOPOL</TableHead>
              <TableHead className="text-gray-800 dark:text-gray-200 text-center">
                RUPIAH
              </TableHead>
              <TableHead className="text-gray-800 dark:text-gray-200 text-center">%</TableHead>
              <TableHead className="text-gray-800 dark:text-gray-200 text-center">NOPOL</TableHead>
              <TableHead className="text-gray-800 dark:text-gray-200 text-center">
                Rata-rata
                <br />
                Bulan Maju
              </TableHead>
              <TableHead className="text-gray-800 dark:text-gray-200 text-center">NOPOL</TableHead>
              <TableHead className="text-gray-800 dark:text-gray-200 text-center">
                RUPIAH
              </TableHead>
              <TableHead className="text-gray-800 dark:text-gray-200 text-center">NOPOL</TableHead>
              <TableHead className="text-gray-800 dark:text-gray-200 text-center">
                RUPIAH
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rekapData.map((row, index) => {
              // Identifikasi jenis baris
              const isGroupHeader =
                row.loketKantor === "KANWIL JAWA TENGAH" ||
                row.loketKantor.startsWith("CABANG");
              const isSubTotal = row.loketKantor === "SUB TOTAL";
              const isGrandTotal = row.loketKantor === "GRAND TOTAL";
              // Baris loket individual adalah baris yang bukan salah satu dari di atas
              const isIndividualLoketRow =
                !isGroupHeader && !isSubTotal && !isGrandTotal;
              // Render baris header grup
              if (isGroupHeader) {
                return (
                  <TableRow
                    key={index}
                    className="bg-gray-300 dark:bg-zinc-700 border-accent text-gray-700 dark:text-gray-200 font-medium cursor-pointer hover:bg-gray-300 dark:hover:bg-zinc-600"
                    onClick={() => toggleGroup(row.loketKantor)}
                  >
                    <TableCell colSpan={16} className="px-2">
                      <div className="flex items-center gap-3 hover:underline">
                        {expandedGroups[row.loketKantor] ? (
                          <Minus className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                        ) : (
                          <Plus className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                        )}
                        <span>{row.loketKantor}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              }
              // Dapatkan grup parent sebelumnya (group loket)
              const prevGroup =
                rekapData
                  .slice(0, index)
                  .reverse()
                  .find(
                    (r) =>
                      r.loketKantor.startsWith("KANWIL") ||
                      r.loketKantor.startsWith("CABANG")
                  )?.loketKantor || "";

              // Sembunyikan baris hanya jika ia adalah baris loket individual dan grup induknya ada dan di hide
              if (
                isIndividualLoketRow &&
                prevGroup &&
                !expandedGroups[prevGroup]
              ) {
                return null;
              }

              return (
                <TableRow
                  key={index}
                  className={
                    isGrandTotal
                      ? "bg-gray-200 dark:bg-zinc-800 font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-700"
                      : isSubTotal
                        ? "bg-gray-200 dark:bg-zinc-800 font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-700"
                        : ""
                  }
                >
                  <TableCell className="text-center">
                    {!isSubTotal && !isGrandTotal && row.no > 0 ? row.no : ""}
                  </TableCell>
                  <TableCell
                    className={
                      isSubTotal || isGrandTotal ? "font-semibold" : ""
                    }
                  >
                    {isSubTotal ? (
                      <div className="flex items-center pl-2">
                        <CornerDownRight className="w-4 h-4 mr-2 text-gray-800 dark:text-gray-200" />
                        <span>{row.loketKantor}</span>
                      </div>
                    ) : (
                      row.loketKantor
                    )}
                  </TableCell>
                  <TableCell>{row.petugas}</TableCell>
                  <TableCell className="text-center">
                    {row.checkinNopol > 0 ? row.checkinNopol : isIndividualLoketRow ? row.checkinPlaceholder : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.checkinRupiah > 0 ? formatRupiah(row.checkinRupiah) : isIndividualLoketRow ? row.checkinPlaceholder : "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {row.checkoutNopol > 0
                      ? row.checkoutNopol
                      : isIndividualLoketRow
                        ? row.checkoutPlaceholder
                        : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.checkoutRupiah > 0
                      ? formatRupiah(row.checkoutRupiah)
                      : isIndividualLoketRow
                        ? row.checkoutPlaceholder
                        : "-"}
                  </TableCell>
                  <TableCell
                    className={`text-center ${row.memastikanNopol > 0
                      ? "cursor-pointer hover:underline font-medium text-blue-400"
                      : ""
                      }`}
                    onClick={() => {
                      if (row.memastikanNopol > 0) {
                        handleDetail(row, "memastikan");
                      }
                    }}
                  >
                    {row.memastikanNopol > 0
                      ? row.memastikanNopol
                      : isIndividualLoketRow
                        ? row.checkoutPlaceholder
                        : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.memastikanRupiah > 0
                      ? formatRupiah(row.memastikanRupiah)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {row.memastikanPersen > 0
                      ? formatPercentage(row.memastikanPersen)
                      : isIndividualLoketRow
                        ? row.checkoutPlaceholder
                        : "-"}
                  </TableCell>
                  <TableCell
                    className={`text-center ${row.gapNopol !== 0 && !isGroupHeader && !isGrandTotal
                      ? " cursor-pointer hover:underline font-medium text-blue-400"
                      : ""
                      }`}
                    onClick={() => {
                      if (
                        row.gapNopol !== 0 &&
                        !isGroupHeader &&
                        !isGrandTotal
                      ) {
                        handleDetail(row, "gap");
                      }
                    }}
                  >
                    {row.gapNopol !== 0
                      ? row.gapNopol
                      : isIndividualLoketRow
                        ? row.checkoutPlaceholder
                        : "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {row.mengupayakan !== 0
                      ? row.mengupayakan
                      : isIndividualLoketRow
                        ? row.checkoutPlaceholder
                        : "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {row.menambahkanNopol > 0
                      ? row.menambahkanNopol
                      : isIndividualLoketRow
                        ? row.checkoutPlaceholder
                        : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.menambahkanRupiah > 0
                      ? formatRupiah(row.menambahkanRupiah)
                      : isIndividualLoketRow
                        ? row.checkoutPlaceholder
                        : "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {row.sisaNopol > 0
                      ? row.sisaNopol
                      : isIndividualLoketRow
                        ? row.checkoutPlaceholder
                        : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.sisaRupiah > 0
                      ? formatRupiah(row.sisaRupiah)
                      : isIndividualLoketRow
                        ? row.checkoutPlaceholder
                        : "-"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {/* Detail Modal */}
      {selectedRow && (
        <div className="fixed inset-0 bg-white/30 dark:bg-black/60 backdrop-blur-lg backdrop-saturate-150 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border dark:border-zinc-800">
            {/* Header */}
            <div className="flex justify-between items-start p-5 border-b dark:border-zinc-800">
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  {detailType === "gap"
                    ? `Detail GAP Nopol - ${selectedRow.loketKantor}`
                    : `Detail Memastikan Nopol - ${selectedRow.loketKantor}`}
                  {selectedRow.loketKantor === "SUB TOTAL" &&
                    " (Breakdown per Loket)"}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedRow.petugas || "-"}
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <Button
                  onClick={() =>
                    exportGapDetailsToExcel(selectedRow, detailType)
                  }
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 px-4 py-2 text-sm rounded-md shadow"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Export Excel
                </Button>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-5 bg-gray-50 dark:bg-zinc-950/50 border-b dark:border-zinc-800">
              {detailType === "gap" ? (
                <>
                  <div className="bg-white dark:bg-zinc-800 p-3 rounded-md shadow-sm border dark:border-zinc-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">CheckIn</p>
                    <p className="text-lg font-semibold dark:text-white">
                      {selectedRow.checkinNopol} nopol
                    </p>
                  </div>
                  <div className="bg-white dark:bg-zinc-800 p-3 rounded-md shadow-sm border dark:border-zinc-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Memastikan</p>
                    <p className="text-lg font-semibold dark:text-white">
                      {selectedRow.memastikanNopol} nopol
                    </p>
                  </div>
                  <div className="bg-white dark:bg-zinc-800 p-3 rounded-md shadow-sm border dark:border-zinc-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total GAP</p>
                    <p className="text-lg font-semibold dark:text-white">
                      {selectedRow.gapNopol} nopol
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-white dark:bg-zinc-800 p-3 rounded-md shadow-sm border dark:border-zinc-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">CheckIn</p>
                    <p className="text-lg font-semibold dark:text-white">
                      {selectedRow.checkinNopol} nopol
                    </p>
                  </div>
                  <div className="bg-white dark:bg-zinc-800 p-3 rounded-md shadow-sm border dark:border-zinc-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">CheckOut</p>
                    <p className="text-lg font-semibold dark:text-white">
                      {selectedRow.checkoutNopol} nopol
                    </p>
                  </div>
                  <div className="bg-white dark:bg-zinc-800 p-3 rounded-md shadow-sm border dark:border-zinc-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Memastikan</p>
                    <p className="text-lg font-semibold dark:text-white">
                      {selectedRow.memastikanNopol} nopol
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Table Container */}
            <div className="flex-1 overflow-auto">
              {detailType === "gap" ? (
                selectedRow.loketKantor === "SUB TOTAL" ? (
                  /* Special view for SUB TOTAL rows */
                  <Table className="min-w-full">
                    <TableHeader className="bg-gray-100 dark:bg-zinc-800 sticky top-0">
                      <TableRow>
                        <TableHead className="min-w-[200px] dark:text-gray-200">Loket</TableHead>
                        <TableHead className="min-w-[200px] dark:text-gray-200">
                          Keterangan
                        </TableHead>
                        <TableHead className="text-center dark:text-gray-200">
                          Jumlah Nopol
                        </TableHead>
                        <TableHead className="text-right dark:text-gray-200">
                          Total Nilai
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        // Group gap details by loket and then by keterangan
                        const groupedByLoket = selectedRow.gapDetails.reduce(
                          (groups, item) => {
                            const loket = item.loket || "Unknown";
                            const keterangan = item.keterangan || "-";

                            if (!groups[loket]) {
                              groups[loket] = {};
                            }

                            if (!groups[loket][keterangan]) {
                              groups[loket][keterangan] = {
                                count: 0,
                                total: 0,
                              };
                            }

                            groups[loket][keterangan].count++;
                            groups[loket][keterangan].total += item.rupiah;
                            return groups;
                          },
                          {} as Record<
                            string,
                            Record<string, { count: number; total: number }>
                          >
                        );

                        // If no data
                        if (Object.keys(groupedByLoket).length === 0) {
                          return (
                            <TableRow>
                              <TableCell
                                colSpan={4}
                                className="py-8 text-center text-gray-500 dark:text-gray-400"
                              >
                                Tidak ada data detail GAP
                              </TableCell>
                            </TableRow>
                          );
                        }

                        // Render grouped data
                        return Object.entries(groupedByLoket).flatMap(
                          ([loket, keteranganGroups], loketIndex) => {
                            const loketTotal = Object.values(
                              keteranganGroups
                            ).reduce((sum, { total }) => sum + total, 0);
                            const loketCount = Object.values(
                              keteranganGroups
                            ).reduce((sum, { count }) => sum + count, 0);

                            return [
                              // Loket header row
                              <TableRow
                                key={`loket-${loketIndex}`}
                                className="bg-gray-50 dark:bg-zinc-800/50 font-medium"
                              >
                                <TableCell className="font-semibold dark:text-gray-200">
                                  {loket}
                                </TableCell>
                                <TableCell
                                  colSpan={3}
                                  className="font-semibold dark:text-gray-300"
                                >
                                  Total: {loketCount} Nopol (
                                  {formatRupiah(loketTotal)})
                                </TableCell>
                              </TableRow>,
                              // Keterangan rows
                              ...Object.entries(keteranganGroups).map(
                                (
                                  [keterangan, { count, total }],
                                  keteranganIndex
                                ) => (
                                  <TableRow
                                    key={`keterangan-${loketIndex}-${keteranganIndex}`}
                                  >
                                    <TableCell className="dark:text-gray-400"></TableCell>
                                    <TableCell className="dark:text-gray-300">{keterangan}</TableCell>
                                    <TableCell className="text-center dark:text-gray-300">
                                      {count} Nopol
                                    </TableCell>
                                    <TableCell className="text-right dark:text-gray-300">
                                      {formatRupiah(total)}
                                    </TableCell>
                                  </TableRow>
                                )
                              ),
                            ];
                          }
                        );
                      })()}
                    </TableBody>
                    {selectedRow.gapDetails.length > 0 && (
                      <TableFooter className="bg-gray-100 sticky bottom-0">
                        <TableRow className="font-bold border-none">
                          <TableCell className="dark:text-white">Grand Total</TableCell>
                          <TableCell></TableCell>
                          <TableCell className="text-center dark:text-white">
                            {selectedRow.gapDetails.length} Nopol
                          </TableCell>
                          <TableCell className="text-right dark:text-white">
                            {formatRupiah(
                              selectedRow.gapDetails.reduce(
                                (sum, item) => sum + item.rupiah,
                                0
                              )
                            )}
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    )}
                  </Table>
                ) : (
                  /* Regular view for non-SUB TOTAL rows */
                  <Table className="min-w-full">
                    <TableHeader className="bg-gray-100 dark:bg-zinc-800 sticky top-0">
                      <TableRow>
                        <TableHead className="w-[60px] text-center">
                          No
                        </TableHead>
                        <TableHead className="min-w-[120px] text-center">
                          No. Polisi
                        </TableHead>
                        <TableHead className="min-w-[150px] text-center">
                          Keterangan
                        </TableHead>
                        <TableHead className="min-w-[120px] text-right">
                          Nilai
                        </TableHead>
                        <TableHead className="min-w-[120px] text-right">
                          Tanggal
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        // Group gap details by keterangan
                        const groupedDetails = selectedRow.gapDetails.reduce(
                          (groups, item) => {
                            const key = item.keterangan || "-";
                            if (!groups[key]) {
                              groups[key] = [];
                            }
                            groups[key].push(item);
                            return groups;
                          },
                          {} as Record<string, GapDetail[]>
                        );

                        // If no data
                        if (Object.keys(groupedDetails).length === 0) {
                          return (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="py-8 text-center text-gray-500 dark:text-gray-400"
                              >
                                Tidak ada data detail GAP
                              </TableCell>
                            </TableRow>
                          );
                        }

                        // Render grouped data
                        let rowIndex = 0;
                        return Object.entries(groupedDetails).flatMap(
                          ([keterangan, items], groupIndex) => {
                            const subtotal = items.reduce(
                              (sum, item) => sum + item.rupiah,
                              0
                            );

                            return [
                              // Group header row
                              <TableRow
                                key={`header-${groupIndex}`}
                                className="bg-gray-50 dark:bg-zinc-800/50"
                              >
                                <TableCell
                                  colSpan={5}
                                  className="font-semibold text-gray-800 dark:text-gray-200"
                                >
                                  {keterangan} ({items.length} Nopol)
                                </TableCell>
                              </TableRow>,
                              // Item rows
                              ...items.map((item, itemIndex) => {
                                rowIndex++;
                                return (
                                  <TableRow
                                    key={`item-${groupIndex}-${itemIndex}`}
                                  >
                                    <TableCell className="py-2 font-medium text-center dark:text-gray-300">
                                      {rowIndex}
                                    </TableCell>
                                    <TableCell className="py-2 font-mono text-center dark:text-gray-300">
                                      {item.nopol}
                                    </TableCell>
                                    <TableCell className="py-2 text-center dark:text-gray-300">
                                      {item.keterangan}
                                    </TableCell>
                                    <TableCell className="py-2 text-right dark:text-gray-300">
                                      {formatRupiah(item.rupiah)}
                                    </TableCell>
                                    <TableCell className="py-2 text-right dark:text-gray-300">
                                      {item.tgl_transaksi}
                                    </TableCell>
                                  </TableRow>
                                );
                              }),
                              // Subtotal row
                              <TableRow
                                key={`subtotal-${groupIndex}`}
                                className="bg-blue-50 dark:bg-blue-900/20 font-medium"
                              >
                                <TableCell colSpan={3} className="text-right dark:text-gray-300">
                                  Subtotal {keterangan}
                                </TableCell>
                                <TableCell className="text-right dark:text-gray-300">
                                  {formatRupiah(subtotal)}
                                </TableCell>
                                <TableCell></TableCell>
                              </TableRow>,
                            ];
                          }
                        );
                      })()}
                    </TableBody>
                    {/* Grand total row */}
                    {selectedRow.gapDetails.length > 0 && (
                      <TableFooter className="bg-gray-100 dark:bg-zinc-800 sticky bottom-0 border-t dark:border-zinc-700">
                        <TableRow className="font-bold">
                          <TableCell colSpan={3} className="text-right dark:text-white">
                            Grand Total
                          </TableCell>
                          <TableCell className="text-right dark:text-white">
                            {formatRupiah(
                              selectedRow.gapDetails.reduce(
                                (sum, item) => sum + item.rupiah,
                                0
                              )
                            )}
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableFooter>
                    )}
                  </Table>
                )
              ) : selectedRow.loketKantor === "SUB TOTAL" ? (
                <Table className="min-w-full">
                  <TableHeader className="bg-gray-100 dark:bg-zinc-800 sticky top-0">
                    <TableRow>
                      <TableHead className="min-w-[200px] dark:text-gray-200">Loket</TableHead>
                      <TableHead className="text-center dark:text-gray-200">
                        Jumlah Nopol
                      </TableHead>
                      <TableHead className="text-right dark:text-gray-200">Total Nilai</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const groupedByLoket =
                        selectedRow.memastikanDetails.reduce((groups, item) => {
                          const loket = item.loket || "Unknown";
                          if (!groups[loket]) {
                            groups[loket] = { count: 0, total: 0 };
                          }
                          groups[loket].count++;
                          groups[loket].total += item.rupiah;
                          return groups;
                        }, {} as Record<string, { count: number; total: number }>);

                      return Object.entries(groupedByLoket).map(
                        ([loket, { count, total }], index) => (
                          <TableRow key={index} className="border-b dark:border-zinc-800">
                            <TableCell className="font-semibold dark:text-gray-300">
                              {loket}
                            </TableCell>
                            <TableCell className="text-center dark:text-gray-300">
                              {count} Nopol
                            </TableCell>
                            <TableCell className="text-right dark:text-gray-300">
                              {formatRupiah(total)}
                            </TableCell>
                          </TableRow>
                        )
                      );
                    })()}
                  </TableBody>
                </Table>
              ) : (
                <Table className="min-w-full">
                  <TableHeader className="bg-gray-100 dark:bg-zinc-800 sticky top-0">
                    <TableRow>
                      <TableHead className="w-[60px] text-center dark:text-gray-200">No</TableHead>
                      <TableHead className="min-w-[120px] text-center dark:text-gray-200">
                        No. Polisi
                      </TableHead>
                      <TableHead className="min-w-[120px] text-right dark:text-gray-200">
                        Tanggal
                      </TableHead>
                      <TableHead className="min-w-[120px] text-right dark:text-gray-200">
                        Nilai
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedRow.memastikanDetails.map((item, index) => (
                      <TableRow key={index} className="border-b dark:border-zinc-800">
                        <TableCell className="py-2 font-medium text-center dark:text-gray-300">
                          {index + 1}
                        </TableCell>
                        <TableCell className="py-2 font-mono text-center dark:text-gray-300">
                          {item.nopol}
                        </TableCell>
                        <TableCell className="py-2 text-right dark:text-gray-300">
                          {item.tgl_transaksi}
                        </TableCell>
                        <TableCell className="py-2 text-right dark:text-gray-300">
                          {formatRupiah(item.rupiah)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end p-4 border-t dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50">
              <Button
                onClick={() => setSelectedRow(null)}
                variant="outline"
                className="min-w-[100px]"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RekapDashboard;
