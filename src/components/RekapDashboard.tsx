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
  iwkbu_tl_nopol: string;
  iwkbu_tl_rupiah_penerimaan: number;
  iwkbu_ti_tgl_transaksi: string;
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
  placeholderChar: "0" | "-";
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
    petugas: "HEIRTANA HANDIETRA",
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
    petugas: "ADI SETIAWAN",
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
    petugas: "RIKA WAHYU UTAMI",
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
    petugas: "RIO AQIL TITA",
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
    petugas: "BAGAS JATI INDRA SETIAWAN",
    endpoint: `${BASE_URL}/samsatmagelang`,
  },
  {
    no: 16,
    parentLoket: "",
    childLoket: "SAMSAT PURWOREJO",
    petugas: "SEPTIAN ADE R.R",
    endpoint: `${BASE_URL}/samsatpurworejo`,
  },
  {
    no: 17,
    parentLoket: "",
    childLoket: "SAMSAT KEBUMEN",
    petugas: "TUTIK WURYANTARI",
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
    petugas: "ARIEF EKA SETIAWAN",
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
    petugas: "ADITYA GINANJAR INDRASAKTI",
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
    petugas: "ADISTI",
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

interface LoketMapping {
  no: number;
  parentLoket: string;
  childLoket: string;
  petugas: string;
  endpoint: string;
}

const RekapDashboard = ({
  onDateRangeChange,
  initialStartDate,
  initialEndDate,
}: DateRangeProps) => {
  const [rekapRows, setRekapRows] = useState<RekapRow[]>([]);
  const [grandTotalState, setGrandTotalState] = useState<RekapRow | null>(null);
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

  // Helper function to create an empty RekapRow for totals
  const createEmptyRekapRow = (
    no: number,
    loketKantor: string,
    petugas: string
  ): RekapRow => ({
    no,
    loketKantor,
    petugas,
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
    placeholderChar: "-",
  });

  // Helper to parse DD/MM/YYYY to timestamp
  const parseToTimestamp = (dateStr: string): number | null => {
    if (!dateStr) return null;
    const parts = dateStr.split("/");
    if (parts.length < 3) return null;
    // Note: Months are 0-indexed in JS Date
    return new Date(
      parseInt(parts[2]),
      parseInt(parts[1]) - 1,
      parseInt(parts[0])
    ).getTime();
  };

  // Optimized check function
  const isDateInRangeOptimized = (
    dateTimestamp: number | null,
    rangeStart: number,
    rangeEnd: number
  ) => {
    if (dateTimestamp === null) return false;
    return dateTimestamp >= rangeStart && dateTimestamp <= rangeEnd;
  };

  // Helper to process data for a single loket
  const processIndividualLoket = (
    loket: LoketMapping,
    endpointData: any[],
    monthStr: string,
    useDateRange: boolean,
    tlStartLimit: number,
    tlEndLimit: number,
    tiStartLimit: number,
    tiEndLimit: number
  ): RekapRow => {
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
      placeholderChar: "-",
    };

    let totalBulanMajuTI = 0;
    let totalBulanMajuTL = 0;
    let countNopolBulanMajuTL = 0;
    let countNopolBulanMajuTI = 0;
    let menambahkanNopol = 0;
    let menambahkanRupiah = 0;
    const sisaNopolSet = new Set<string>();
    let sisaRupiah = 0;

    // Process checkin (TL) data
    endpointData.forEach((item) => {
      if (item.iwkbu_tl_tgl_transaksi) {
        const parts = item.iwkbu_tl_tgl_transaksi.split("/");
        const monthMatch = parts[1] === monthStr;

        let dateRangeMatch = false;
        if (useDateRange && tlStartLimit > 0) {
          const ts = parseToTimestamp(item.iwkbu_tl_tgl_transaksi);
          dateRangeMatch = isDateInRangeOptimized(ts, tlStartLimit, tlEndLimit);
        }

        if ((!useDateRange && monthMatch) || (useDateRange && dateRangeMatch)) {
          if (hasData(item.iwkbu_tl_nopol)) {
            if (isNihil(item.iwkbu_tl_nopol)) {
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

        if ((!useDateRange && monthMatch) || (useDateRange && dateRangeMatch)) {
          if (hasData(item.iwkbu_tl_nopol)) {
            checkinNopolSet.add(item.iwkbu_tl_nopol);
          }
        }
      }
    });

    // Process checkout (TI) data
    const matchedNopol = new Set<string>();
    let matchedRupiah = 0;

    endpointData.forEach((item) => {
      if (item.iwkbu_ti_tgl_transaksi) {
        const parts = item.iwkbu_ti_tgl_transaksi.split("/");
        const monthMatch = parts[1] === monthStr;
        let dateRangeMatch = false;

        if (useDateRange && tiStartLimit > 0) {
          const ts = parseToTimestamp(item.iwkbu_ti_tgl_transaksi);
          dateRangeMatch = isDateInRangeOptimized(ts, tiStartLimit, tiEndLimit);
        }

        if ((!useDateRange && monthMatch) || (useDateRange && dateRangeMatch)) {
          if (hasData(item.iwkbu_ti_nopol)) {
            if (isNihil(item.iwkbu_ti_nopol)) {
              rekap.checkoutNopol += 0;
              rekap.checkoutRupiah += 0;
            } else {
              rekap.checkoutNopol += item.kode_nopol_co || 0;
              rekap.checkoutRupiah += item.iwkbu_ti_rupiah_penerimaan || 0;
            }
            if (item.iwkbu_ti_bulan_maju > 0) {
              totalBulanMajuTI += item.iwkbu_ti_bulan_maju;
              countNopolBulanMajuTI++;
            }

            // Check if this NOPOL was in checkin (TL)
            if (checkinNopolSet.has(item.iwkbu_ti_nopol)) {
              rekap.memastikanNopol += item.kode_nopol_co || 0;
              rekap.memastikanRupiah += item.iwkbu_ti_rupiah_penerimaan || 0;
              memastikanDetails.push({
                nopol: item.iwkbu_ti_nopol,
                tgl_transaksi: item.iwkbu_ti_tgl_transaksi,
                rupiah: item.iwkbu_ti_rupiah_penerimaan,
                loket: loket.childLoket,
              });
              matchedNopol.add(item.iwkbu_ti_nopol);
              matchedRupiah += item.iwkbu_ti_rupiah_penerimaan || 0;
            } else {
              // NOPOL in TI but not in TL (menambahkan)
              menambahkanNopol += item.kode_nopol_co || 0;
              menambahkanRupiah += item.iwkbu_ti_rupiah_penerimaan || 0;
            }
          }
        }
      }
    });

    // Calculate GAP (Nopol in TL but not in TI)
    checkinNopolSet.forEach((nopol) => {
      if (!matchedNopol.has(nopol)) {
        // Find the corresponding item in endpointData to get rupiah and tgl_transaksi
        const originalItem = endpointData.find(
          (item) => item.iwkbu_tl_nopol === nopol
        );
        if (originalItem) {
          rekap.gapNopol += originalItem.kode_nopol_co || 0;
          gapDetails.push({
            nopol: nopol,
            keterangan: originalItem.tl_keterangan_konversi_iwkbu || "-",
            tgl_transaksi: originalItem.iwkbu_tl_tgl_transaksi,
            rupiah: originalItem.iwkbu_tl_rupiah_penerimaan,
            loket: loket.childLoket,
          });
        }
      }
    });

    // Calculate Sisa (Nopol in TI but not in TL)
    endpointData.forEach((item) => {
      if (item.iwkbu_ti_tgl_transaksi) {
        const parts = item.iwkbu_ti_tgl_transaksi.split("/");
        const monthMatch = parts[1] === monthStr;
        let dateRangeMatch = false;

        if (useDateRange && tiStartLimit > 0) {
          const ts = parseToTimestamp(item.iwkbu_ti_tgl_transaksi);
          dateRangeMatch = isDateInRangeOptimized(ts, tiStartLimit, tiEndLimit);
        }

        if ((!useDateRange && monthMatch) || (useDateRange && dateRangeMatch)) {
          if (
            hasData(item.iwkbu_ti_nopol) &&
            !checkinNopolSet.has(item.iwkbu_ti_nopol)
          ) {
            sisaNopolSet.add(item.iwkbu_ti_nopol);
            sisaRupiah += item.iwkbu_ti_rupiah_penerimaan || 0;
          }
        }
      }
    });

    rekap.menambahkanNopol = menambahkanNopol;
    rekap.menambahkanRupiah = menambahkanRupiah;
    rekap.sisaNopol = sisaNopolSet.size;
    rekap.sisaRupiah = sisaRupiah;

    // Calculate Mengupayakan (average bulan maju)
    if (countNopolBulanMajuTL > 0) {
      rekap.mengupayakan = Math.round(totalBulanMajuTL / countNopolBulanMajuTL);
    }

    rekap.memastikanPersen =
      rekap.checkinNopol > 0 ? rekap.memastikanNopol / rekap.checkinNopol : 0;
    rekap.gapDetails = gapDetails;
    rekap.memastikanDetails = memastikanDetails;

    return rekap;
  };

  // Helper to update a running total (subtotal or grand total)
  const updateRunningTotal = (totalRow: RekapRow, processedRow: RekapRow) => {
    totalRow.checkinNopol += processedRow.checkinNopol;
    totalRow.checkinRupiah += processedRow.checkinRupiah;
    totalRow.checkoutNopol += processedRow.checkoutNopol;
    totalRow.checkoutRupiah += processedRow.checkoutRupiah;
    totalRow.memastikanNopol += processedRow.memastikanNopol;
    totalRow.memastikanRupiah += processedRow.memastikanRupiah;
    totalRow.menambahkanNopol += processedRow.menambahkanNopol;
    totalRow.menambahkanRupiah += processedRow.menambahkanRupiah;
    totalRow.mengupayakan += processedRow.mengupayakan; // Summing for average later
    totalRow.mengupayakanCount += processedRow.mengupayakan > 0 ? 1 : 0; // Count how many contributed to mengupayakan
    totalRow.gapNopol += processedRow.gapNopol;
    totalRow.sisaNopol += processedRow.sisaNopol;
    totalRow.sisaRupiah += processedRow.sisaRupiah;
    totalRow.gapDetails.push(...processedRow.gapDetails);
    totalRow.memastikanDetails.push(...processedRow.memastikanDetails);
  };

  // Helper to finalize subtotal calculations (percentages, averages)
  const finalizeSubTotal = (subTotal: RekapRow) => {
    subTotal.memastikanPersen =
      subTotal.checkinNopol > 0
        ? subTotal.memastikanNopol / subTotal.checkinNopol
        : 0;
    subTotal.mengupayakan =
      subTotal.mengupayakanCount > 0
        ? Math.round(subTotal.mengupayakan / subTotal.mengupayakanCount)
        : 0;
  };

  // Helper to finalize grand total calculations (percentages, averages)
  const finalizeGrandTotal = (grandTotal: RekapRow, subTotals: RekapRow[]) => {
    grandTotal.memastikanPersen =
      grandTotal.checkinNopol > 0
        ? grandTotal.memastikanNopol / grandTotal.checkinNopol
        : 0;

    // For grand total mengupayakan, average the averages from sub-totals
    const validMengupayakanSubTotals = subTotals.filter(
      (st) => st.mengupayakanCount > 0
    );
    if (validMengupayakanSubTotals.length > 0) {
      const sumOfMengupayakanAverages = validMengupayakanSubTotals.reduce(
        (sum, st) => sum + st.mengupayakan,
        0
      );
      grandTotal.mengupayakan = Math.round(
        sumOfMengupayakanAverages / validMengupayakanSubTotals.length
      );
    } else {
      grandTotal.mengupayakan = 0;
    }
  };

  const fetchData = async () => {
    setLoading({ message: "Memulai sinkronisasi data...", progress: 0 });
    setError(null);
    setRekapRows([]);
    setGrandTotalState(null);

    const monthStr = month.toString().padStart(2, "0");
    const totalCenters = loketMapping.length;

    // Prepare date boundaries once
    let tlStartLimit = 0,
      tlEndLimit = 0,
      tiStartLimit = 0,
      tiEndLimit = 0;
    if (appliedStartDate && appliedEndDate) {
      const tlS = new Date(appliedStartDate);
      tlS.setFullYear(tlS.getFullYear() - 1);
      const tlE = new Date(appliedEndDate);
      tlE.setFullYear(tlE.getFullYear() - 1);
      tlStartLimit = new Date(
        tlS.getFullYear(),
        tlS.getMonth(),
        tlS.getDate()
      ).getTime();
      tlEndLimit = new Date(
        tlE.getFullYear(),
        tlE.getMonth(),
        tlE.getDate()
      ).getTime();
      tiStartLimit = new Date(
        appliedStartDate.getFullYear(),
        appliedStartDate.getMonth(),
        appliedStartDate.getDate()
      ).getTime();
      tiEndLimit = new Date(
        appliedEndDate.getFullYear(),
        appliedEndDate.getMonth(),
        appliedEndDate.getDate()
      ).getTime();
    }

    let tempRows: RekapRow[] = [];
    let currentSubTotal: RekapRow | null = null;
    let runningGrandTotal = createEmptyRekapRow(0, "GRAND TOTAL", "");
    const subTotalsForGrandTotal: RekapRow[] = []; // To store finalized subtotals for grand total calculation

    try {
      for (let i = 0; i < loketMapping.length; i++) {
        const loket = loketMapping[i];
        const progress = Math.round(((i + 1) / totalCenters) * 100);

        setLoading({
          message: `Mengolah Data: ${loket.childLoket} (${i + 1
            }/${totalCenters})...`,
          progress,
        });

        // 1. Fetch small piece of data
        const endpoint = loket.endpoint.replace(`${BASE_URL}/`, "");
        const res = await fetch(`/api/rekap/${endpoint}`);
        if (!res.ok) throw new Error(`Gagal ambil data ${loket.childLoket}`);
        const result = await res.json();
        const rawData = result.data || [];

        // 2. Process immediately (Radical Memory Save: rawData will be GC'd after this scope)
        const processedRow = processIndividualLoket(
          loket,
          rawData,
          monthStr,
          useDateRange,
          tlStartLimit,
          tlEndLimit,
          tiStartLimit,
          tiEndLimit
        );

        // 3. Handle Grouping & Subtotals
        if (loket.parentLoket && loket.childLoket === loket.parentLoket) {
          // This is a new group header
          if (currentSubTotal) {
            finalizeSubTotal(currentSubTotal);
            tempRows.push(currentSubTotal);
            subTotalsForGrandTotal.push(currentSubTotal);
          }
          tempRows.push(createEmptyRekapRow(0, loket.parentLoket, "")); // Group header
          currentSubTotal = createEmptyRekapRow(0, "SUB TOTAL", "");
        }

        tempRows.push(processedRow);

        if (currentSubTotal) {
          updateRunningTotal(currentSubTotal, processedRow);
        }
        updateRunningTotal(runningGrandTotal, processedRow);

        // Update UI progressively
        setRekapRows([...tempRows]);
        setGrandTotalState({ ...runningGrandTotal });
      }

      if (currentSubTotal) {
        finalizeSubTotal(currentSubTotal);
        tempRows.push(currentSubTotal);
        subTotalsForGrandTotal.push(currentSubTotal);
      }

      // Final Grand Total Calculation
      finalizeGrandTotal(runningGrandTotal, subTotalsForGrandTotal);

      setRekapRows([...tempRows]);
      setGrandTotalState({ ...runningGrandTotal });
      setLoading(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi Kesalahan");
      setLoading(null);
    }
  };

}, [month, appliedStartDate, appliedEndDate, useDateRange]); // fetchData depends on these

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
          {rekapRows.map((row, index) => {
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
              rekapRows
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
                  {row.checkinNopol > 0
                    ? row.checkinNopol
                    : isIndividualLoketRow
                      ? row.placeholderChar
                      : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {row.checkinRupiah > 0
                    ? formatRupiah(row.checkinRupiah)
                    : isIndividualLoketRow
                      ? row.placeholderChar
                      : "-"}
                </TableCell>
                <TableCell className="text-center">
                  {row.checkoutNopol > 0
                    ? row.checkoutNopol
                    : isIndividualLoketRow
                      ? row.placeholderChar
                      : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {row.checkoutRupiah > 0
                    ? formatRupiah(row.checkoutRupiah)
                    : isIndividualLoketRow
                      ? row.placeholderChar
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
                      ? row.placeholderChar
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
                      ? row.placeholderChar
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
                      ? row.placeholderChar
                      : "-"}
                </TableCell>
                <TableCell className="text-center">
                  {row.mengupayakan !== 0
                    ? row.mengupayakan
                    : isIndividualLoketRow
                      ? row.placeholderChar
                      : "-"}
                </TableCell>
                <TableCell className="text-center">
                  {row.menambahkanNopol > 0
                    ? row.menambahkanNopol
                    : isIndividualLoketRow
                      ? row.placeholderChar
                      : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {row.menambahkanRupiah > 0
                    ? formatRupiah(row.menambahkanRupiah)
                    : isIndividualLoketRow
                      ? row.placeholderChar
                      : "-"}
                </TableCell>
                <TableCell className="text-center">
                  {row.sisaNopol > 0
                    ? row.sisaNopol
                    : isIndividualLoketRow
                      ? row.placeholderChar
                      : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {row.sisaRupiah > 0
                    ? formatRupiah(row.sisaRupiah)
                    : isIndividualLoketRow
                      ? row.placeholderChar
                      : "-"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        {grandTotalState && (
          <TableFooter className="bg-blue-600 text-white font-bold hover:bg-blue-700 h-10">
            <TableRow>
              <TableCell className="text-center"></TableCell>
              <TableCell className="px-4">GRAND TOTAL</TableCell>
              <TableCell></TableCell>
              <TableCell className="text-center">
                {grandTotalState.checkinNopol.toLocaleString("id-ID")}
              </TableCell>
              <TableCell className="text-center font-mono">
                {formatRupiah(grandTotalState.checkinRupiah)}
              </TableCell>
              <TableCell className="text-center">
                {grandTotalState.checkoutNopol.toLocaleString("id-ID")}
              </TableCell>
              <TableCell className="text-center font-mono">
                {formatRupiah(grandTotalState.checkoutRupiah)}
              </TableCell>
              <TableCell className="text-center">
                {grandTotalState.memastikanNopol.toLocaleString("id-ID")}
              </TableCell>
              <TableCell className="text-center font-mono">
                {formatRupiah(grandTotalState.memastikanRupiah)}
              </TableCell>
              <TableCell className="text-center">
                {formatPercentage(grandTotalState.memastikanPersen)}
              </TableCell>
              <TableCell
                className="text-center text-yellow-300 underline cursor-pointer"
                onClick={() => handleDetail(grandTotalState, "gap")}
              >
                {grandTotalState.gapNopol.toLocaleString("id-ID")}
              </TableCell>
              <TableCell className="text-center">
                {grandTotalState.mengupayakan} Bln
              </TableCell>
              <TableCell className="text-center">
                {grandTotalState.menambahkanNopol.toLocaleString("id-ID")}
              </TableCell>
              <TableCell className="text-center font-mono">
                {formatRupiah(grandTotalState.menambahkanRupiah)}
              </TableCell>
              <TableCell className="text-center">
                {grandTotalState.sisaNopol.toLocaleString("id-ID")}
              </TableCell>
              <TableCell className="text-center font-mono">
                {formatRupiah(grandTotalState.sisaRupiah)}
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
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
