import { Separator } from "@radix-ui/react-separator";
import { DataTable } from "./data-table";
import { DateRange } from "./date-range";
import { Dot, SearchIcon, SeparatorHorizontal } from "lucide-react";
import { DataLoketCabang } from "./data-loket-cabang";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";
import { columns } from "./columns";
import type { DataLoket } from "./columns";

const getData = async (): Promise<DataLoket[]> => {
  return [
    {
      no: 805,
      loket: "CAB",
      samsat: "LOKET CABANG JAWA TENGAH",
      jenis_loket: "INDUK",
      kode_loket: "0400001",
      iwkbu_tl_tgl_transaksi: "03/05/2024",
      iwkbu_tl_no_resi: "4.000.012.024.430",
      iwkbu_tl_nopol: "H-7785-OC",
      iwkbu_tl_masa_lalu_awal: "31/03/2024",
      iwkbu_tl_masa_lalu_akhir: "30/06/2024",
      iwkbu_tl_bulan_bayar: 2,
      iwkbu_tl_bulan_maju: 1,
      iwkbu_tl_rupiah_penerimaan: 198000,
      iwkbu_ti_tgl_transaksi: "03/05/2024",
      iwkbu_ti_no_resi: "4.000.012.024.430",
      iwkbu_ti_nopol: "H-7785-OC",
      iwkbu_ti_masa_lalu_awal: "31/03/2024",
      iwkbu_ti_masa_lalu_akhir: "30/06/2024",
      iwkbu_ti_bulan_bayar: 0,
      iwkbu_ti_bulan_maju: 0,
      iwkbu_ti_rupiah_penerimaan: 0,
      selisih_iwkbu_jumlah_nopol: 1,
      selisih_iwkbu_rupiah_penerimaan: -198000,
      po: "PO. SAFARI",
      tl_keterangan_konversi_iwkbu: "IWKBU Masih Berlaku",
      rekap_hasil: "TIDAK MEMBAYAR",
      keterangan: "ganti nopol",
      pengisian: "Sudah Isi",
      outstanding: -1,
      kode_nopol_ci: 0,
      kode_nopol_co: 1,
      memastikan_nopol: 0,
      memastikan_rp: 0,
      status: "Memastikan",
    },
  ];
};

const DataLoket = async () => {
  const data = await getData();
  return (
    <div className="space-y-6">
      <div className="mb-8 px-6 py-4 bg-secondary rounded-xl shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
          <div className="flex flex-col space-y-2">
            <Label className="text-sm font-semibold">Cabang</Label>
            <DataLoketCabang />
          </div>
          <div className="flex flex-col space-y-2 md:col-span-2">
            <Label className="text-sm font-semibold">Tanggal</Label>
            <div className="flex items-center space-x-2">
              <DateRange />
              <Dot className="text-muted-foreground" />
              <DateRange />
              <Button variant="outline" className="w-20">
                Submit
              </Button>
            </div>
          </div>
        </div>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default DataLoket;
