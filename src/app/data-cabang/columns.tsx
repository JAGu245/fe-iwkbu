"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

export type DataLoket = {
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
  status: "Memastikan" | "Mengupayakan" | "Menambahkan";
};

export const columns: ColumnDef<DataLoket>[] = [
  {
    accessorKey: "no",
    header: "No",
  },
  {
    accessorKey: "loket",
    header: "Loket",
  },
  {
    accessorKey: "samsat",
    header: "Samsat",
  },
  {
    accessorKey: "jenis_loket",
    header: "Jenis Loket",
  },
  {
    accessorKey: "kode_loket",
    header: "Kode Loket",
  },
  {
    accessorKey: "iwkbu_tl_tgl_transaksi",
    header: "IWKBU TL Tgl Transaksi",
  },
  {
    accessorKey: "iwkbu_tl_no_resi",
    header: "IWKBU TL No Resi",
  },
  {
    accessorKey: "iwkbu_tl_nopol",
    header: "IWKBU TL Nopol",
  },
  {
    accessorKey: "iwkbu_tl_masa_laku_awal",
    header: "IWKBU TL Masa Laku Awal",
  },
  {
    accessorKey: "iwkbu_tl_masa_laku_akhir",
    header: "IWKBU TL Masa Laku Akhir",
  },
  {
    accessorKey: "iwkbu_tl_bulan_bayar",
    header: "IWKBU TL Bulan Bayar",
  },
  {
    accessorKey: "iwkbu_tl_bulan_maju",
    header: "IWKBU TL Bulan Maju",
  },
  {
    accessorKey: "iwkbu_tl_rupiah_penerimaan",
    header: "Rp TL",
    cell: ({ row }) => {
      const value = row.getValue("iwkbu_tl_rupiah_penerimaan");
      return (
        <div className="text-right">
          {Number(value).toLocaleString("id-ID", {
            style: "currency",
            currency: "IDR",
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "iwkbu_ti_tgl_transaksi",
    header: "IWKBU TI Tgl Transaksi",
  },
  {
    accessorKey: "iwkbu_ti_no_resi",
    header: "IWKBU TI No Resi",
  },
  {
    accessorKey: "iwkbu_ti_nopol",
    header: "IWKBU TI Nopol",
  },
  {
    accessorKey: "iwkbu_ti_masa_laku_awal",
    header: "IWKBU TI Masa Laku Awal",
  },
  {
    accessorKey: "iwkbu_ti_masa_laku_akhir",
    header: "IWKBU TI Masa Laku Akhir",
  },
  {
    accessorKey: "iwkbu_ti_bulan_bayar",
    header: "IWKBU TI Bulan Bayar",
  },
  {
    accessorKey: "iwkbu_ti_bulan_maju",
    header: "IWKBU TI Bulan Maju",
  },
  {
    accessorKey: "iwkbu_ti_rupiah_penerimaan",
    header: "IWKBU TI Rupiah Penerimaan",
    cell: ({ row }) => {
      const value = row.getValue("iwkbu_ti_rupiah_penerimaan");
      return (
        <div className="text-right">
          {Number(value).toLocaleString("id-ID", {
            style: "currency",
            currency: "IDR",
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "selisih_iwkbu_jumlah_nopol",
    header: "Selisih IWKBU Jumlah Nopol",
  },
  {
    accessorKey: "selisih_iwkbu_rupiah_penerimaan",
    header: "Selisih IWKBU Rupiah Penerimaan",
    cell: ({ row }) => {
      const value = row.getValue("selisih_iwkbu_rupiah_penerimaan");
      return (
        <div className="text-right">
          {Number(value).toLocaleString("id-ID", {
            style: "currency",
            currency: "IDR",
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "po",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          PO
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "tl_keterangan_konversi_iwkbu",
    header: "TL Keterangan Konversi IWKBU",
  },
  {
    accessorKey: "rekap_hasil",
    header: "Rekap Hasil",
  },
  {
    accessorKey: "keterangan",
    header: "Keterangan",
  },
  {
    accessorKey: "pengisian",
    header: "Pengisian",
  },
  {
    accessorKey: "outstanding",
    header: () => <div className="text-right">Outstanding</div>,
    cell: ({ row }) => {
      const outstanding = parseFloat(row.getValue("outstanding"));
      const formatted = new Intl.NumberFormat("id-ID").format(outstanding);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "kode_nopol_ci",
    header: "Kode Nopol CI",
  },
  {
    accessorKey: "kode_nopol_co",
    header: "Kode Nopol CO",
  },
  {
    accessorKey: "memastikan_nopol",
    header: "Memastikan Nopol",
  },
  {
    accessorKey: "memastikan_rp",
    header: "Memastikan Rp",
    cell: ({ row }) => {
      const value = row.getValue("memastikan_rp");
      return (
        <div className="text-right">
          {Number(value).toLocaleString("id-ID", {
            style: "currency",
            currency: "IDR",
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status");
      return (
        <div
          className={cn(
            `p-1 rounded-md w-max text-xs`,
            status === "Memastikan" && "bg-yellow-500/40",
            status === "Menambahkan" && "bg-green-500/40",
            status === "Mengupayakan" && "bg-blue-500/40"
          )}
        >
          {status as string}
        </div>
      );
    },
  },
];
