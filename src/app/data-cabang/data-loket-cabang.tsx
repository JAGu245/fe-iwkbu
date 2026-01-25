import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormLabel } from "@/components/ui/form";

export function DataLoketCabang() {
  return (
    <Select>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Pilih Loket/Samsat" />
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
  );
}
