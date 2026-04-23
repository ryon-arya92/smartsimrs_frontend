import React from "react";
import { Row, Col, Table, Button, Form, Badge, Modal } from "react-bootstrap"; // Tambah Modal di sini
import Card from "../../components/Card";

const ListPasienTable = ({
  title,
  data,
  onSearch,
  setSearch,
  onViewDetail,
  onEditData,
  handleUpdate,
  showEditModal, // Dioper dari Parent
  setShowEditModal, // Tambahkan ini agar Modal bisa ditutup
  formData, // Dioper dari Parent
  setFormData, // Dioper dari Parent
}) => {
  return (
    <Row>
      <Col sm="12">
        <Card className="border-primary">
          <Card.Header className="d-flex flex-column flex-md-row justify-content-between align-items-md-center bg-transparent gap-3 py-3">
            {/* Bagian Kiri: Title */}
            <div className="header-title">
              <h4 className="card-title mb-0">{title}</h4>
            </div>

            <Form
              onSubmit={onSearch}
              className="d-flex align-items-center gap-2 w-md-auto"
            >
              <Form.Control
                type="text"
                placeholder="Cari No Reg / RM / Nama Pasien"
                onChange={(e) => setSearch(e.target.value)}
                // Ganti width fixed menjadi kelas responsif
                className="flex-grow-1 flex-md-grow-0"
              />
              <Button type="submit" variant="primary" className="px-4">
                Cari
              </Button>
            </Form>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table
                size="sm"
                className="table-hover mb-0"
                style={{ fontSize: "0.85rem" }}
              >
                <thead>
                  <tr>
                    <th className="text-center">No. Register</th>
                    <th className="text-center">No. RM</th>
                    <th className="text-center">Nama Pasien</th>
                    <th className="text-center">Asuransi</th>
                    <th className="text-center">DPJP</th>
                    <th className="text-center">Tanggal Masuk</th>
                    <th className="text-center">Status Kirim</th>
                    <th className="text-center">Total Billing</th>
                    <th className="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((reg) => (
                    <tr key={reg.IdRegisterKunjungan} className="align-middle">
                      <td className="text-center">
                        <Badge bg="soft-warning" text="dark">
                          <strong>{reg.IdRegisterKunjungan}</strong>
                        </Badge>
                      </td>
                      <td className="text-center">
                        {reg.NomorRekamMedis}
                        <br />
                        {reg.Ruangan}
                      </td>
                      <td className="text-center">
                        <strong>{reg.NamaPasien}</strong>
                        {/* Logic ini akan otomatis render karena state listRegister berubah */}
                        {reg.kirim_ranap === 1 && (
                          <div className="mt-1 animate__animated animate__fadeIn">
                            <small
                              className="text-info d-block"
                              style={{ fontSize: "0.7rem", lineHeight: "1.2" }}
                            >
                              <i className="fas fa-info-circle me-1"></i>
                              Terkirim ke Ranap:{" "}
                              <Badge
                                bg="warning"
                                className="text-dark p-1"
                                style={{ fontSize: "0.65rem" }}
                              >
                                {reg.register_ranap}
                              </Badge>
                            </small>
                          </div>
                        )}
                      </td>
                      <td className="text-center">
                        {reg.NamaAsuransi}
                        <br />
                        {/* Cek apakah asuransi BPJS dan apakah NomorSEP kosong/null */}
                        {reg.NamaAsuransi?.includes("BPJS KESEHATAN") ||
                        reg.NamaAsuransi?.includes("BPJS KETENAGAKERJAAN") ? (
                          <Badge
                            bg={reg.NomorSEP ? "soft-info" : "soft-danger"} // Biru jika ada, merah jika kosong
                            className="mt-1"
                            style={{ fontSize: "0.65rem" }}
                          >
                            {reg.NomorSEP ? reg.NomorSEP : "Belum Ada No SEP"}
                          </Badge>
                        ) : (
                          /* Jika Umum/Asuransi lain, tampilkan badge tipis atau kosongkan */
                          <Badge
                            bg="soft-secondary"
                            className="mt-1"
                            style={{ fontSize: "0.65rem" }}
                          >
                            PASIEN UMUM
                          </Badge>
                        )}
                      </td>
                      <td className="text-center">{reg.NamaDokter}</td>
                      <td className="text-center">
                        {reg.TanggalMasuk}
                        <br />
                        {reg.TanggalPulang}
                      </td>
                      <td className="text-center">
                        {reg.status_code_smartremun == 200 ? (
                          <Badge bg="soft-success">Terkirim (200)</Badge>
                        ) : reg.status_code_smartremun == 500 ? (
                          <Badge bg="soft-success">Terkirim (200)</Badge>
                        ) : (
                          <Badge bg="soft-warning">Belum Kirim</Badge>
                        )}
                      </td>
                      <td className="text-end fw-bold">
                        {parseFloat(reg.Total).toLocaleString("id-ID")}
                      </td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-1">
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => onViewDetail(reg)}
                            title="Lihat Detail"
                          >
                            <i className="fas fa-eye"></i>
                          </Button>

                          <Button
                            variant="warning"
                            size="sm"
                            onClick={() => onEditData(reg)} // Fungsi untuk membuka modal edit
                            title="Edit Data"
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </Col>

      {/* --- MODAL EDIT DI MASUKKAN KE DALAM RETURN --- */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          {/* Penambahan ?. mencegah error 'undefined' */}
          <Modal.Title>
            Edit Data Kunjungan: {formData?.NamaPasien || ""}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              {/* Kolom Identitas (Read Only agar data tidak kacau) */}
              <Col md="6" className="mb-3">
                <Form.Label>No. Register</Form.Label>
                <Form.Control
                  type="text"
                  value={formData?.IdRegisterKunjungan || ""}
                  readOnly
                  className="bg-light"
                />
              </Col>
              <Col md="6" className="mb-3">
                <Form.Label>No. Rekam Medis</Form.Label>
                <Form.Control
                  type="text"
                  value={formData?.NomorRekamMedis || ""}
                  readOnly
                  className="bg-light"
                />
              </Col>

              {/* Tanggal & Waktu */}
              <Col md="6" className="mb-3">
                <Form.Label>Tanggal Masuk</Form.Label>
                <Form.Control
                  type="date"
                  /* Cukup ambil 10 karakter pertama: yyyy-mm-dd */
                  value={
                    formData?.TanggalMasuk
                      ? formData.TanggalMasuk.substring(0, 10)
                      : ""
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, TanggalMasuk: e.target.value })
                  }
                />
              </Col>
              <Col md="6" className="mb-3">
                <Form.Label>Tanggal Pulang</Form.Label>
                <Form.Control
                  type="date"
                  /* Cukup ambil 10 karakter pertama: yyyy-mm-dd */
                  value={
                    formData?.TanggalPulang
                      ? formData.TanggalPulang.substring(0, 10)
                      : ""
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, TanggalPulang: e.target.value })
                  }
                />
              </Col>

              {/* Administrasi & Asuransi */}
              <Col md="6" className="mb-3">
                <Form.Label>Nama Asuransi / Debitur</Form.Label>
                <Form.Control
                  type="text"
                  value={formData?.NamaAsuransi || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, NamaAsuransi: e.target.value })
                  }
                />
              </Col>
              <Col md="6" className="mb-3">
                <Form.Label>Nomor SEP</Form.Label>
                <Form.Control
                  type="text"
                  value={formData?.NomorSEP || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, NomorSEP: e.target.value })
                  }
                />
              </Col>

              {/* Lokasi & Kelas */}
              <Col md="6" className="mb-3">
                <Form.Label>Ruangan / Poli</Form.Label>
                <Form.Control
                  type="text"
                  value={formData?.Ruangan || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, Ruangan: e.target.value })
                  }
                />
              </Col>

              {/* Tenaga Medis */}
              <Col md="6" className="mb-3">
                <Form.Label>Nama Dokter (DPJP)</Form.Label>
                <Form.Control
                  type="text"
                  value={formData?.NamaDokter || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, NamaDokter: e.target.value })
                  }
                />
              </Col>

              {/* Info Billing (Read Only) */}
              <Col md="12">
                <div className="p-2 bg-soft-primary rounded">
                  <small className="text-primary d-block mb-1">
                    Total Billing Saat Ini:
                  </small>
                  <h5 className="mb-0">
                    Rp{" "}
                    {parseFloat(formData?.Total || 0).toLocaleString("id-ID")}
                  </h5>
                </div>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            Simpan Perubahan
          </Button>
        </Modal.Footer>
      </Modal>
    </Row>
  );
};

export default ListPasienTable;
