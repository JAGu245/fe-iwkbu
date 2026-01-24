"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@radix-ui/react-dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "./ui/calendar";

interface ReportData {
  no: number;
  loket: string;
  samsat: string;
  jenis_loket: string;
  kode_loket: string;
  iwkbu_tl_tgl_transaksi: string;
  iwkbu_tl_no_resi: string;
  iwkbu_tl_nopol: string;
  iwkbu_tl_masa_lalu_awal: string;
  iwkbu_tl_masa_lalu_akhir: string;
  iwkbu_tl_bulan_bayar: number;
  iwkbu_tl_bulan_maju: number;
  iwkbu_tl_rupiah_penerimaan: number;
  iwkbu_ti_tgl_transaksi: string;
  iwkbu_ti_no_resi: string;
  iwkbu_ti_nopol: string;
  iwkbu_ti_masa_lalu_awal: string;
  iwkbu_ti_masa_lalu_akhir: string;
  iwkbu_ti_bulan_bayar: number;
  iwkbu_ti_bulan_maju: number;
  iwkbu_ti_rupiah_penerimaan: number;
  selisih_iwkbu_jumlah_nopol: number;
  selisih_iwkbu_rupiah_penerimaan: number;
  po: string;
  tl_keterangan_konversi_iwkbu: string;
  rekap_hasil: string;
  keterangan: string;
  pengisian: string;
  outstanding: number;
  kode_nopol_ci: number;
  kode_nopol_co: number;
  memastikan_nopol: number;
  memastikan_rp: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE;

const TableReport = () => {
  const [data, setData] = useState<ReportData[]>([]);
  const [fullData, setFullData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loket, setLoket] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const filterDataByDate = () => {
    if (!startDate || !endDate) {
      // Jika tanggal tidak diisi, tampilkan semua data
      setData(fullData);
      return;
    }

    // konversi input tanggal ke format yang bisa dibangingkan
    const startMonth = startDate.getMonth() + 1;
    const startDay = startDate.getDate();
    const endMonth = endDate.getMonth() + 1;
    const endDay = endDate.getDate();

    const filtered = fullData.filter((item) => {
      // Cek tanggal TL (Transaksi Lalu)
      if (item.iwkbu_tl_tgl_transaksi) {
        const [tlDay, tlMonth] = item.iwkbu_tl_tgl_transaksi
          .split("/")
          .slice(0, 2)
          .map(Number);

        if (
          isDateInRange(tlMonth, tlDay, startMonth, startDay, endMonth, endDay)
        ) {
          return true;
        }
      }

      // Cek tanggal TI (Transaksi In)
      if (item.iwkbu_ti_tgl_transaksi) {
        const [tiDay, tiMonth] = item.iwkbu_ti_tgl_transaksi
          .split("/")
          .slice(0, 2)
          .map(Number);

        if (
          isDateInRange(tiMonth, tiDay, startMonth, startDay, endMonth, endDay)
        ) {
          return true;
        }
      }

      return false;
    });

    setData(filtered);
  };

  const isDateInRange = (
    checkMonth: number,
    checkDay: number,
    startMonth: number,
    startDay: number,
    endMonth: number,
    endDay: number
  ): boolean => {
    // Konversi tanggal ke angka untuk perbandingan (MMdd)
    const checkDate = checkMonth * 100 + checkDay;
    const startDate = startMonth * 100 + startDay;
    const endDate = endMonth * 100 + endDay;

    // Tanggal rentang normal (tidak melewati tahun baru)
    if (startDate <= endDate) {
      return checkDate >= startDate && checkDate <= endDate;
    }
    // Tanggal rentang melewati tahun baru (misal Desember - Januari)
    else {
      return checkDate >= startDate || checkDate <= endDate;
    }
  };

  const handleSubmit = async () => {
    if (!loket) return alert("Pilih loket terlebih dahulu");

    const endpoint = endpintMap[loket];
    if (!endpoint) return alert("Endpoint tidak ditemukan");

    setLoading(true);
    setError(null);

    const token = Cookies.get("sessionToken");
    if (!token) return alert("Sesi telah berakhir, silakan login kembali.");

    try {
      const response = await fetch(`${BASE_URL}/${endpoint}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Gagal mengambil data");

      const result = await response.json();
      setFullData(result.data || []);
      setData(result.data || []);

      // Reset filter tanggal
      setStartDate(null);
      setEndDate(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi Kesalahan");
    } finally {
      setLoading(false);
    }
  };
  // Format tanggal untuk display (tanpa tahun)
  const formatDateWithoutYear = (date: Date | null) => {
    if (!date) return "Pilih tanggal";
    return format(date, "dd/MM");
  };

  const loketOptions = [
    // LOKET KEDUNGSAPUR
    { label: "LOKET CABANG JAWA TENGAH", value: "1" },
    { label: "SAMSAT KENDAL", value: "2" },
    { label: "SAMSAT DEMAK", value: "3" },
    { label: "SAMSAT PURWODADI", value: "4" },
    { label: "SAMSAT UNGARAN", value: "5" },
    { label: "SAMSAT SALATIGA", value: "6" },

    // PERWAKILAN SURAKARTA
    { label: "LOKET PERWAKILAN SURAKARTA", value: "7" },
    { label: "SAMSAT SURAKARTA", value: "8" },
    { label: "SAMSAT KLATEN", value: "9" },
    { label: "SAMSAT SRAGEN", value: "10" },
    { label: "SAMSAT BOYOLALI", value: "11" },
    { label: "SAMSAT PRAMBANAN", value: "12" },
    { label: "SAMSAT DELANGGU", value: "13" },

    // PERWAKILAN MAGELANG
    { label: "LOKET PERWAKILAN MAGELANG", value: "14" },
    { label: "SAMSAT MAGELANG", value: "15" },
    { label: "SAMSAT PURWOREJO", value: "16" },
    { label: "SAMSAT KEBUMEN", value: "17" },
    { label: "SAMSAT TEMANGGUNG", value: "18" },
    { label: "SAMSAT WONOSOBO", value: "19" },
    { label: "SAMSAT MUNGKID", value: "20" },
    { label: "SAMSAT BAGELEN", value: "21" },

    // PERWAKILAN PURWOKERTO
    { label: "LOKET PERWAKILAN PURWOKERTO", value: "22" },
    { label: "SAMSAT PURWOKERTO", value: "23" },
    { label: "SAMSAT PURBALINGGA", value: "24" },
    { label: "SAMSAT BANJARNEGARA", value: "25" },
    { label: "SAMSAT MAJENANG", value: "26" },
    { label: "SAMSAT CILACAP", value: "27" },
    { label: "SAMSAT WANGON", value: "28" },

    // PERWAKILAN PEKALONGAN
    { label: "LOKET PERWAKILAN PEKALONGAN", value: "29" },
    { label: "SAMSAT PEKALONGAN", value: "30" },
    { label: "SAMSAT PEMALANG", value: "31" },
    { label: "SAMSAT TEGAL", value: "32" },
    { label: "SAMSAT BREBES", value: "33" },
    { label: "SAMSAT BATANG", value: "34" },
    { label: "SAMSAT KAJEN", value: "35" },
    { label: "SAMSAT SLAWI", value: "36" },
    { label: "SAMSAT BUMIAYU", value: "37" },
    { label: "SAMSAT TANJUNG", value: "38" },

    // PERWAKILAN PATI
    { label: "LOKET PERWAKILAN PATI", value: "39" },
    { label: "SAMSAT PATI", value: "40" },
    { label: "SAMSAT KUDUS", value: "41" },
    { label: "SAMSAT JEPARA", value: "42" },
    { label: "SAMSAT REMBANG", value: "43" },
    { label: "SAMSAT BLORA", value: "44" },
    { label: "SAMSAT CEPU", value: "45" },

    // PERWAKILAN SEMARANG
    { label: "LOKET PERWAKILAN SEMARANG", value: "46" },
    { label: "SAMSAT SEMARANG 1", value: "47" },
    { label: "SAMSAT SEMARANG 2", value: "48" },
    { label: "SAMSAT SEMARANG 3", value: "49" },

    // PERWAKILAN SUKOHARJO
    { label: "LOKET PERWAKILAN SUKOHARJO", value: "50" },
    { label: "SAMSAT SUKOHARJO", value: "51" },
    { label: "SAMSAT KARANGANYAR", value: "52" },
    { label: "SAMSAT WONOGIRI", value: "53" },
    { label: "SAMSAT PURWANTORO", value: "54" },
    { label: "SAMSAT BATURETNO", value: "55" },
  ];

  const endpintMap: Record<string, string> = {
    // LOKET KEDUNGSAPUR
    "1": "loketcabangjawatengah",
    "2": "samsatkendal",
    "3": "samsatdemak",
    "4": "samsatpurwodadi",
    "5": "samsatungaran",
    "6": "samsatsalatiga",
    // PERWAKILAN SURAKARTA
    "7": "samsatlokperwsra",
    "8": "samsatsurakarta",
    "9": "samsatklaten",
    "10": "samsatsragen",
    "11": "samsatboyolali",
    "12": "samsatprambanan",
    "13": "samsatdelanggu",
    // PERWAKILAN MAGELANG
    "14": "samsatlokpwkmgl",
    "15": "samsatmagelang",
    "16": "samsatpurworejo",
    "17": "samsatkebumen",
    "18": "samsattemanggung",
    "19": "samsatwonosobo",
    "20": "samsatmungkid",
    "21": "samsatbagelen",
    // PERWAKILAN PURWOKERTO
    "22": "samsat/samsatlokprwpwt",
    "23": "samsat/purwokerto",
    "24": "samsat/purbalingga",
    "25": "samsat/banjarnegara",
    "26": "samsat/majenang",
    "27": "samsat/cilacap",
    "28": "samsat/wangon",
    // PERWAKILAN PEKALONGAN
    "29": "samsat/lokprwpkl",
    "30": "samsat/pekalongan",
    "31": "samsat/pemalang",
    "32": "samsat/tegal",
    "33": "samsat/brebes",
    "34": "samsat/batang",
    "35": "samsat/kajen",
    "36": "samsat/slawi",
    "37": "samsat/bumiayu",
    "38": "samsat/tanjung",
    // PERWAKILAN PATI
    "39": "samsat/lokprwpti",
    "40": "samsat/pati",
    "41": "samsat/kudus",
    "42": "samsat/jepara",
    "43": "samsat/rembang",
    "44": "samsat/blora",
    "45": "samsat/cepu",
    // PERWAKILAN SEMARANG
    "46": "samsat/lokprwsmg",
    "47": "samsat/semarang1",
    "48": "samsat/semarang2",
    "49": "samsat/semarang3",
    // PERWAKILAN SUKOHARJO
    "50": "samsat/lokprwskh",
    "51": "samsat/sukoharjo",
    "52": "samsat/karanganyar",
    "53": "samsat/wonogiri",
    "54": "samsat/purwantoro",
    "55": "samsat/baturetno",
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = Cookies.get("sessionToken");
      if (!token) {
        setError("Sesi telah berakhir, silakan login kembali.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${BASE_URL}/loketcabangjawatengah`,
          {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          }
        );
        if (!response.ok) {
          throw new Error("Gagal mengambil data");
        }
        const result = await response.json();
        setFullData(result.data || []);
        setData(result.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        Memuat data...
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
      {/* Form */}
      <div className="flex flex-wrap items-end gap-4 rounded-md border p-4 shadow-sm bg-white dark:bg-zinc-900">
        <div className="w-64">
          <Label className="dark:text-gray-200">Lokasi Cabang</Label>
          <Select onValueChange={setLoket}>
            <SelectTrigger className="w-[255px]">
              <SelectValue placeholder="Pilih Cabang" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>LOKET KEDUNGSAPUR </SelectLabel>
                <SelectItem value="1">LOKET CABANG JAWA TENGAH</SelectItem>
                <SelectItem value="2">SAMSAT KENDAL</SelectItem>
                <SelectItem value="3">SAMSAT DEMAK</SelectItem>
                <SelectItem value="4">SAMSAT PURWODADI</SelectItem>
                <SelectItem value="5">SAMSAT UNGARAN</SelectItem>
                <SelectItem value="6">SAMSAT SALATIGA</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>LOKET SURAKARTA </SelectLabel>
                <SelectItem value="7">LOKET PERWAKILAN SURAKARTA</SelectItem>
                <SelectItem value="8">SAMSAT SURAKARTA</SelectItem>
                <SelectItem value="9">SAMSAT KLATEN</SelectItem>
                <SelectItem value="10">SAMSAT BOYOLALI</SelectItem>
                <SelectItem value="11">SAMSAT SRAGEN</SelectItem>
                <SelectItem value="12">SAMSAT PRAMBANAN</SelectItem>
                <SelectItem value="13">SAMSAT DELANGGU</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>LOKET MAGELANG </SelectLabel>
                <SelectItem value="14">LOKET PERWAKILAN MAGELANG</SelectItem>
                <SelectItem value="15">SAMSAT MAGELANG</SelectItem>
                <SelectItem value="16">SAMSAT PURWOREJO</SelectItem>
                <SelectItem value="17">SAMSAT KEBUMEN</SelectItem>
                <SelectItem value="18">SAMSAT TEMANGGUNG</SelectItem>
                <SelectItem value="19">SAMSAT WONOSOBO</SelectItem>
                <SelectItem value="20">SAMSAT MUNGKID</SelectItem>
                <SelectItem value="21">SAMSAT BAGELEN</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>LOKET PURWOKERTO</SelectLabel>
                <SelectItem value="22">LOKET PERWAKILAN PURWOKERTO</SelectItem>
                <SelectItem value="23">SAMSAT PURWOKERTO</SelectItem>
                <SelectItem value="24">SAMSAT PURBALINGGA</SelectItem>
                <SelectItem value="25">SAMSAT BANJARNEGARA</SelectItem>
                <SelectItem value="26">SAMSAT MAJENANG</SelectItem>
                <SelectItem value="27">SAMSAT CILACAP</SelectItem>
                <SelectItem value="28">SAMSAT WANGON</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>LOKET PEKALONGAN</SelectLabel>
                <SelectItem value="29">LOKET PERWAKILAN PEKALONGAN</SelectItem>
                <SelectItem value="30">SAMSAT PEKALONGAN</SelectItem>
                <SelectItem value="31">SAMSAT PEMALANG</SelectItem>
                <SelectItem value="32">SAMSAT TEGAL</SelectItem>
                <SelectItem value="33">SAMSAT BREBES</SelectItem>
                <SelectItem value="34">SAMSAT BATANG</SelectItem>
                <SelectItem value="35">SAMSAT KAJEN</SelectItem>
                <SelectItem value="36">SAMSAT SLAWI</SelectItem>
                <SelectItem value="37">SAMSAT BUMIAYU</SelectItem>
                <SelectItem value="38">SAMSAT TANJUNG</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>LOKET PATI</SelectLabel>
                <SelectItem value="39">LOKET PERWKILAN PATI</SelectItem>
                <SelectItem value="40">SAMSAT PATI</SelectItem>
                <SelectItem value="41">SAMSAT KUDUS</SelectItem>
                <SelectItem value="42">SAMSAT JEPARA</SelectItem>
                <SelectItem value="43">SAMSAT REMBANG</SelectItem>
                <SelectItem value="44">SAMSAT BLORA</SelectItem>
                <SelectItem value="45">SAMSAT CEPU</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>LOKET SEMARANG</SelectLabel>
                <SelectItem value="46">LOKET PERWAKILAN SEMARANG</SelectItem>
                <SelectItem value="47">SAMSAT SEMARANG I</SelectItem>
                <SelectItem value="48">SAMSAT SEMARANG II</SelectItem>
                <SelectItem value="49">SAMSAT SEMARANG III</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>LOKET SUKOHARJO</SelectLabel>
                <SelectItem value="50">LOKET PERWAKILAN SUKOHARJO</SelectItem>
                <SelectItem value="51">SAMSAT SUKOHARJO</SelectItem>
                <SelectItem value="52">SAMSAT KARANGANYAR</SelectItem>
                <SelectItem value="53">SAMSAT WONOGIRI</SelectItem>
                <SelectItem value="54">SAMSAT PURWANTORO</SelectItem>
                <SelectItem value="55">SAMSAT BATURETNO</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4">
          <Button onClick={handleSubmit}>Tampilkan Data</Button>
        </div>
      </div>

      {/* Form Filter Tanggal */}
      <div className="flex flex-wrap items-end gap-4 rounded-md border p-4 shadow-sm bg-white dark:bg-zinc-900">
        {/* date picker start date */}
        <div className="flex flex-col space-y-1">
          <Label className="dark:text-gray-200">Tanggal Mulai</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
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
                onSelect={(date) => setStartDate(date || null)}
                initialFocus
                fixedWeeks
                showOutsideDays
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* date picker end date */}
        <div className="flex flex-col space-y-1">
          <Label className="dark:text-gray-200">Tanggal Akhir</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
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
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="mt-4">
          <Button onClick={filterDataByDate} disabled={!startDate || !endDate}>
            Cari...
          </Button>
        </div>
      </div>
      {/* Status Loading/Error */}
      {loading && (
        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Memuat data...
        </div>
      )}
      {error && (
        <div className="p-4 text-center text-sm text-red-500">
          Error: {error}
        </div>
      )}
      {/* Tabel Data */}
      {data.length === 0 && !loading && !error ? (
        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Tidak ada data yang ditemukan
        </div>
      ) : (
        <div className="overflow-auto rounded-lg border shadow-md bg-white dark:bg-zinc-900">
          <Table className="min-w-[1200px] text-sm text-center">
            <TableHeader className="bg-gray-100 dark:bg-zinc-900">
              <TableRow>
                {[
                  "No",
                  "Loket",
                  "Samsat",
                  "Jenis Loket",
                  "Kode Loket",
                  "IWKBU TL Tgl Transaksi",
                  "IWKBU TL No Resi",
                  "IWKBU TL Nopol",
                  "IWKBU TL Masa Laku Awal",
                  "IWKBU TL Masa Laku Akhir",
                  "IWKBU TL Bulan Bayar",
                  "IWKBU TL Bulan Maju",
                  "IWKBU TL Rupiah Penerimaan",
                  "IWKBU TI Tgl Transaksi",
                  "IWKBU TI No Resi",
                  "IWKBU TI Nopol",
                  "IWKBU TI Masa Laku Awal",
                  "IWKBU TI Masa Laku Akhir",
                  "IWKBU TI Bulan Bayar",
                  "IWKBU TI Bulan Maju",
                  "IWKBU TI Rupiah Penerimaan",
                  "Selisih IWKBU Jumlah Nopol",
                  "Selisih IWKBU Rupiah Penerimaan",
                  "PO",
                  "TL Keterangan Konversi IWKBU",
                  "Rekap Hasil",
                  "Keterangan",
                  "Pengisian",
                  "Outstanding",
                  "Kode Nopol CI",
                  "Kode Nopol CO",
                  "Memastikan Nopol",
                  "Memastikan Rp",
                ].map((header, idx) => (
                  <TableHead
                    key={idx}
                    className="whitespace-nowrap text-xs font-semibold text-gray-700 dark:text-gray-200"
                  >
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow
                  key={index}
                  className={index % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-gray-50 dark:bg-zinc-800"}
                >
                  {Object.values(item).map((val, idx) => (
                    <TableCell
                      key={idx}
                      className="whitespace-nowrap px-2 py-1 text-xs dark:text-gray-300"
                    >
                      {val === "" || val === null ? "-" : val}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default TableReport;
