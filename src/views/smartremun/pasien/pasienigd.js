import React, { useState } from "react";
import { Row, Col, Card, Table, Form, Button, Badge } from "react-bootstrap";
import api from "../../../api/smartremun"; // Axios ke SIMRS (untuk Get Data)
import apismartremun from "../../../api/axios"; // Axios ke Laravel Backend (untuk Post Data)
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import ListPasienTable from "../../../components/tabel/ListPasienTable";
import RincianBilling from "../../../components/tabel/RincianBilling";
import ModalEdit from "../../../components/modal/ModalEdit";
import ModalTambah from "../../../components/modal/ModalTambah";

const MySwal = withReactContent(Swal);

const PasienIgd = () => {
  const [search, setSearch] = useState("");
  const [listRegister, setListRegister] = useState([]);
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("light");
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [listTarif, setListTarif] = useState([]); // Fetch ini dari API master_tarif
  // --- STATE UNTUK MODAL TINDAKAN ---
  const [showModalAddTindakan, setShowModalAddTindakan] = useState(false);
  const [showModalEditTindakan, setShowModalEditTindakan] = useState(false);
  const [itemTindakanToEdit, setItemTindakanToEdit] = useState(null);

  // 1. Fungsi Cari Pasien
  const handleSearch = async (e) => {
    // Tambahkan pengecekan optional chaining atau if
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    if (!search) return;

    MySwal.fire({
      title: "Mencari Data...",
      allowOutsideClick: false,
      didOpen: () => MySwal.showLoading(),
    });

    setLoading(true);
    setSelectedTransaksi(null);
    try {
      const response = await api.get(`/igd/register`, { params: { search } });
      setListRegister(response.data.data);

      if (response.data.data.length === 0) {
        MySwal.fire("Info", "Data pasien tidak ditemukan", "info");
      } else {
        MySwal.close();
      }
    } catch (err) {
      MySwal.fire("Error", "Gagal mengambil data SIMRS", "error");
    } finally {
      setLoading(false);
    }
  };

  // 2. Fungsi Ambil Rincian (Billing/Obat)
  const fetchDetailTransaksi = async (
    idRegister,
    NomorRekamMedis,
    NamaPasien,
    dataHeader,
  ) => {
    MySwal.fire({
      title: "Memuat Rincian...",
      text: `Pasien: ${NamaPasien}`,
      allowOutsideClick: false,
      didOpen: () => MySwal.showLoading(),
    });

    try {
      const response = await api.get(`/igd/transaksi/${idRegister}`);
      setSelectedTransaksi({
        id: idRegister,
        rm: NomorRekamMedis,
        nama: NamaPasien,
        header: dataHeader,
        items: response.data,
      });
      MySwal.close();
    } catch (err) {
      MySwal.fire("Error", "Gagal memuat rincian", "error");
    }
  };

  // 3. Fungsi Kirim Data ke Laravel -> SmartRemun
  const handleKirimSmartRemun = async () => {
    if (!selectedTransaksi) return;

    const result = await MySwal.fire({
      title: "Konfirmasi Kirim",
      text: `Kirim data ${selectedTransaksi.nama} ke SmartRemun?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Kirim!",
    });

    if (result.isConfirmed) {
      MySwal.fire({
        title: "Proses Sinkronisasi...",
        text: "Menghubungi server internal...",
        allowOutsideClick: false,
        didOpen: () => MySwal.showLoading(),
      });

      try {
        // Susun Payload
        const finalPayload = {
          register: {
            IdRegisterKunjungan: selectedTransaksi.header.IdRegisterKunjungan,
            IdRegister: selectedTransaksi.header.IdRegisterKunjungan,
            NomorRekamMedis: selectedTransaksi.header.NomorRekamMedis,
            TanggalMasuk: selectedTransaksi.header.TanggalMasuk,
            TanggalPulang:
              selectedTransaksi.header.TanggalPulang ||
              selectedTransaksi.header.TanggalMasuk,
            NamaAsuransi: selectedTransaksi.header.NamaAsuransi,
            NamaPasien: selectedTransaksi.header.NamaPasien,
            NomorSEP: selectedTransaksi.header.NomorSEP,
            Ruangan: "IGD/UGD",
            Total: selectedTransaksi.header.Total,
            NamaDokter: selectedTransaksi.header.NamaDokter,
          },
          items: selectedTransaksi.items.map((item) => {
            // Logika pembagian khusus untuk KelompokTindakan OBAT
            const calculatedTarif =
              item.KelompokTindakan === "OBAT"
                ? parseFloat(item.TotalTarif) / parseFloat(item.Kuantitas || 1)
                : item.TotalTarif;

            return {
              IdRegisterKunjungan: selectedTransaksi.header.IdRegisterKunjungan,
              IdRegister: selectedTransaksi.header.IdRegisterKunjungan,
              IdPelayananMedis: item.idPelayananMedis,
              IdTindakan: item.idTindakan,
              NamaTindakan: item.NamaTindakan,
              KelompokTindakan: item.KelompokTindakan,

              // Logika Pengisian Otomatis Nama Pelaksana Medis
              NamaPelaksanaMedis:
                item.NamaPelaksanaMedis ||
                (item.KelompokTindakan === "LABORATORIUM"
                  ? "dr. Yohana Muliadi, Sp. PK"
                  : item.KelompokTindakan === "RADIOLOGI"
                    ? "dr. Praharsa Akmaja Chaetajaka, Sp. Rad"
                    : ""),

              IdPelayananRuang: item.idPelayananRuang,
              NamaRuangan: item.NamaRuangan,
              TotalTarif: calculatedTarif,
              Kuantitas: item.Kuantitas,
              NomorRekamMedis: selectedTransaksi.header.NomorRekamMedis,
              NamaPasien: selectedTransaksi.header.NamaPasien,
              NamaAsuransi: selectedTransaksi.header.NamaAsuransi,
              Poliklinik: item.Poliklinik,
              TanggalPelayanan: item.TanggalPelayanan,
            };
          }),
        };

        // Kirim ke API Laravel
        await apismartremun.post("api/igd/kirimigd", finalPayload);

        // UPDATE STATE LOKAL: Agar badge status berubah jadi hijau (200) secara realtime
        setListRegister((prevList) =>
          prevList.map((item) =>
            item.IdRegisterKunjungan === selectedTransaksi.id
              ? { ...item, status_code_smartremun: 200 }
              : item,
          ),
        );

        MySwal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data berhasil disinkronkan ke SmartRemun.",
        });
      } catch (err) {
        console.error(err);
        MySwal.fire({
          icon: "error",
          title: "Gagal Sinkronisasi",
          text: err.response?.data?.message || "Terjadi kesalahan pada server.",
        });
      }
    }
  };

  // 4. Fungsi Hitung Total (untuk ditampilkan di RincianBilling)
  const calculateGrandTotal = () => {
    if (!selectedTransaksi) return 0;
    return selectedTransaksi.items.reduce((acc, item) => {
      const harga = parseFloat(item.TotalTarif || 0);
      const qty = parseFloat(item.Kuantitas || 1);

      // Jika OBAT, TotalTarif sudah harga total (dari total_amount di SQL)
      if (item.KelompokTindakan === "OBAT") {
        return acc + harga;
      }

      // Jika selain obat, TotalTarif adalah harga satuan (unit_amount), maka dikali Qty
      return acc + harga * qty;
    }, 0);
  };

  // 5. Fungsi Kirim ke Ranap (untuk tombol "Kirim ke Ranap" di RincianBilling)
  const onKirimRanap = async () => {
    if (!selectedTransaksi) return;

    const noRM = selectedTransaksi.header.NomorRekamMedis;

    Swal.fire({
      title: "Mencari Data Rawat Inap...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await api.get(`/igd/cariranap/${noRM}`);
      const listRanap = response.data.data; // Mengambil array dari property data

      if (listRanap && listRanap.length > 0) {
        // 1. Buat object map untuk inputOptions SweetAlert
        // Format: { 'ID': 'Label Tampilan' }
        const inputOptions = {};
        listRanap.forEach((item) => {
          inputOptions[item.IdRegisterKunjungan] =
            `${item.IdRegisterKunjungan} - ${item.Ruangan} (${item.TanggalMasuk})`;
        });

        // 2. Tampilkan Swal dengan input select
        const { value: selectedReg } = await Swal.fire({
          title: "Pilih Registrasi Rawat Inap",
          input: "select",
          inputOptions: inputOptions,
          inputPlaceholder: "--- Pilih Pendaftaran Ranap ---",
          showCancelButton: true,
          confirmButtonText: "Pilih & Lanjutkan",
          cancelButtonText: "Batal",
          inputValidator: (value) => {
            if (!value) {
              return "Anda harus memilih salah satu registrasi!";
            }
          },
        });

        // 3. Jika user memilih salah satu, tunjukkan konfirmasi final
        if (selectedReg) {
          const detail = listRanap.find(
            (i) => i.IdRegisterKunjungan === selectedReg,
          );

          Swal.fire({
            title: "Konfirmasi Akhir",
            html: `
            <div class="text-start">
              <table class="table table-sm borderless" style="font-size: 0.9rem">
                <tr><td>No. Reg Tujuan</td><td>: <b>${detail.IdRegisterKunjungan}</b></td></tr>
                <tr><td>Nama Pasien</td><td>: <b>${detail.NamaPasien}</b></td></tr>
                <tr><td>Ruangan Ranap</td><td>: <b>${detail.Ruangan}</b></td></tr>
                <tr><td>DPJP Ranap</td><td>: <b>${detail.NamaDokter}</b></td></tr>
              </table>
              <p class="mt-3 text-center text-danger fw-bold">Kirim semua tindakan IGD ke nomor register ini?</p>
            </div>
          `,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, Kirim!",
            cancelButtonText: "Kembali",
          }).then((result) => {
            if (result.isConfirmed) {
              eksekusiKirimKeRanap(selectedReg);
            }
          });
        }
      } else {
        Swal.fire(
          "Data Tidak Ditemukan",
          "Pasien tidak memiliki riwayat registrasi Rawat Inap.",
          "warning",
        );
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Gagal menghubungi server SIMRS.", "error");
    }
  };

  // 6. Fungsi untuk eksekusi kirim tindakan ke rawat inap setelah user konfirmasi pilihan registrasi ranap
  const eksekusiKirimKeRanap = async (noRegRanap) => {
    try {
      const payload = {
        no_register_asal: selectedTransaksi.header.IdRegisterKunjungan,
        no_register_tujuan: noRegRanap,
        // Kirim item yang dipilih atau semua item
        items: selectedTransaksi.items,
      };

      const res = await apismartremun.post("api/igd/kirim-ke-ranap", payload);

      if (res.status === 200) {
        Swal.fire(
          "Berhasil!",
          "Tindakan telah dikaitkan ke Rawat Inap.",
          "success",
        );
        // --- UPDATE STATE LOKAL SECARA REALTIME ---
        setListRegister((prevList) =>
          prevList.map((item) =>
            item.IdRegisterKunjungan ===
            selectedTransaksi.header.IdRegisterKunjungan
              ? {
                  ...item,
                  kirim_ranap: 1,
                  register_ranap: noRegRanap,
                  // Jika ingin sekalian update status smartremun jika ada logic terkait:
                  // status_code_smartremun: 200
                }
              : item,
          ),
        );

        // Tutup rincian billing agar user kembali ke tabel utama
        setSelectedTransaksi(null);
      }
    } catch (err) {
      Swal.fire(
        "Gagal",
        "Database gagal memproses pemindahan tindakan.",
        "error",
      );
    }
  };

  // 7. Fungsi untuk mendapatkan nama pelaksana default jika data tidak tersedia (untuk ditampilkan di RincianBilling)
  const getPelaksanaDefault = (item) => {
    if (item.NamaPelaksanaMedis) return item.NamaPelaksanaMedis;

    switch (item.KelompokTindakan) {
      case "LABORATORIUM":
        return "dr. Yohana Muliadi, Sp. PK";
      case "RADIOLOGI":
        return "dr. Praharsa Akmaja Chaetajaka, Sp. Rad";
      default:
        return "-";
    }
  };

  // 8. Fungsi buka modal
  const onEditData = (data) => {
    setFormData(data);
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      // 1. Tampilkan Swal Loading
      Swal.fire({
        title: "Memproses...",
        text: "Sedang memperbarui data kunjungan",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const { Total, NamaPasien, NomorRekamMedis, ...payload } = formData;

      const response = await apismartremun.put(
        `api/igd/update-kunjungan/${formData.IdRegisterKunjungan}`,
        payload,
      );

      // 2. Perbaikan Logika: response.data.code (karena response dari Laravel ada di dalam .data)
      if (response.data.code === 200 || response.data.status === "success") {
        setShowEditModal(false); // Tutup modal dulu biar gak numpuk

        await Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: response.data.message,
          timer: 1500,
          showConfirmButton: false,
        });

        handleSearch(); // Refresh tabel setelah swal hilang
      }
    } catch (err) {
      console.error("Update Error:", err);
      // Tutup loading dan tampilkan error
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          err.response?.data?.message ||
          "Terjadi kesalahan saat memperbarui data",
      });
    }
  };

  // --- 1. Fungsi Tambah Tindakan Baru ---
  const handleSaveNewTindakan = async (newTindakan) => {
    try {
      Swal.fire({
        title: "Menyimpan...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const payload = {
        no_register: selectedTransaksi.header.IdRegisterKunjungan,
        id_tarif: newTindakan.IdTarif, // Sesuaikan field ID tarif Anda
        qty: newTindakan.Kuantitas,
        // tambahkan field lain sesuai kebutuhan backend SIMRS
      };

      const res = await apismartremun.post("api/igd/tambah-tindakan", payload);

      if (res.data.code === 200) {
        await Swal.fire("Berhasil", "Tindakan berhasil ditambahkan", "success");
        // Refresh detail agar tabel tindakan update
        fetchDetailTransaksi(selectedTransaksi.header.IdRegisterKunjungan);
        setShowModalAddTindakan(false);
      }
    } catch (err) {
      Swal.fire("Error", "Gagal menambah tindakan", "error");
    }
  };

  // --- 2. Fungsi Update Tindakan ---
  const handleUpdateTindakan = async (updatedData) => {
    try {
      Swal.fire({
        title: "Mengupdate...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await apismartremun.put(
        `api/igd/update-detail-tindakan/${updatedData.IdDetailTindakan}`,
        updatedData,
      );

      if (res.data.code === 200) {
        await Swal.fire("Berhasil", "Detail tindakan diperbarui", "success");
        fetchDetailTransaksi(selectedTransaksi.header.IdRegisterKunjungan);
        setShowModalEditTindakan(false);
      }
    } catch (err) {
      Swal.fire("Error", "Gagal mengupdate tindakan", "error");
    }
  };

  // --- 3. Fungsi Hapus Tindakan ---
  const onDeleteTindakan = (item) => {
    Swal.fire({
      title: "Hapus Tindakan?",
      text: `Anda akan menghapus ${item.NamaTindakan}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await apismartremun.delete(
            `api/igd/hapus-tindakan/${item.IdDetailTindakan}`,
          );
          if (res.data.code === 200) {
            Swal.fire("Terhapus!", "Tindakan telah dihapus.", "success");
            fetchDetailTransaksi(selectedTransaksi.header.IdRegisterKunjungan);
          }
        } catch (err) {
          Swal.fire("Gagal", "Gagal menghapus data", "error");
        }
      }
    });
  };

  return (
    <Row>
      <Col sm="12">
        <ListPasienTable
          title="Daftar Pasien Rawat Darurat (IGD)"
          data={listRegister}
          onSearch={handleSearch}
          setSearch={setSearch}
          /* PROPS UNTUK EDIT HARUS LENGKAP */
          onEditData={onEditData}
          handleUpdate={handleUpdate}
          showEditModal={showEditModal} // Kirim state ini
          setShowEditModal={setShowEditModal} // Kirim fungsi set-nya
          formData={formData} // Kirim data formulirnya
          setFormData={setFormData} // Kirim fungsi update formulirnya
          onViewDetail={(reg) =>
            fetchDetailTransaksi(
              reg.IdRegisterKunjungan,
              reg.NomorRekamMedis,
              reg.NamaPasien,
              reg,
            )
          }
        />

        {/* Tambahkan props onKirimRanap di sini */}
        {/* --- RINCIAN BILLING DENGAN PROPS ACTION --- */}
        <RincianBilling
          selectedTransaksi={selectedTransaksi}
          onClose={() => setSelectedTransaksi(null)}
          onKirim={handleKirimSmartRemun}
          onKirimRanap={onKirimRanap}
          calculateTotal={calculateGrandTotal}
          getPelaksanaDefault={getPelaksanaDefault}
          // Tambahkan handler baru di sini:
          onAddTindakan={() => setShowModalAddTindakan(true)}
          onEditTindakan={(item) => {
            setItemTindakanToEdit(item);
            setShowModalEditTindakan(true);
          }}
          onDeleteTindakan={onDeleteTindakan}
        />

        {/* --- MODAL TAMBAH TINDAKAN --- */}
        <ModalTambah
          show={showModalAddTindakan}
          onHide={() => setShowModalAddTindakan(false)}
          onSave={handleSaveNewTindakan}
          listTarif={listTarif} // Pastikan sudah fetch data master tarif sebelumnya
        />

        {/* --- MODAL EDIT TINDAKAN --- */}
        <ModalEdit
          show={showModalEditTindakan}
          onHide={() => setShowModalEditTindakan(false)}
          onUpdate={handleUpdateTindakan}
          dataEdit={itemTindakanToEdit}
        />
      </Col>
    </Row>
  );
};

export default PasienIgd;
