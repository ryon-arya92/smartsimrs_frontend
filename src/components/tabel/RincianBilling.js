import React from "react";
import { Row, Col, Table, Badge, Button } from "react-bootstrap";
import Card from "../../components/Card";

const RincianBilling = ({
  selectedTransaksi,
  onClose,
  onKirim,
  onKirimRanap,
  calculateTotal,
  getPelaksanaDefault,
}) => {
  if (!selectedTransaksi) return null;

  return (
    <Row className="animate__animated animate__fadeInUp mt-4">
      <Col sm="12">
        <Card className="border-primary">
          <Card.Header className="d-flex justify-content-between align-items-center bg-transparent">
            <div>
              <h4 className="card-title text-primary mb-0">
                Rincian Billing: {selectedTransaksi.nama}
              </h4>
              {/* Notifikasi jika sudah kirim ranap */}
              {selectedTransaksi.items[0]?.kirim_ranap === 1 && (
                <div className="mt-2">
                  <Badge
                    bg="soft-info"
                    className="text-info d-inline-flex align-items-center p-2"
                    style={{ fontSize: "0.8rem" }}
                  >
                    <i className="fas fa-info-circle me-2"></i>
                    <span>
                      <Badge bg="warning" className="text-dark ms-1">
                        Tindakan Sudah Terkirim Ke Register Rawat Inap Dengan No
                        Register: {selectedTransaksi.items[0]?.register_ranap}
                      </Badge>
                    </span>
                  </Badge>
                </div>
              )}
            </div>

            <div className="d-flex gap-2">
              {/* Button SmartRemun - Sekarang otomatis Disable jika sudah kirim ranap */}
              <Button
                variant="success"
                size="sm"
                onClick={onKirim}
                disabled={selectedTransaksi.items[0]?.kirim_ranap === 1}
              >
                <i className="fas fa-paper-plane me-1"></i> Kirim Ke SmartRemun
              </Button>

              {/* Tombol hanya tampil jika data BUKAN berasal dari pendaftaran Rawat Inap */}
              {!selectedTransaksi.header?.jenis_rawat?.includes(
                "RAWAT INAP",
              ) && (
                <Button
                  variant="info"
                  size="sm"
                  onClick={onKirimRanap}
                  /* Tombol tetap bisa disable jika sudah pernah diklik (kirim_ranap === 1) 
       tapi status pendaftarannya masih IGD */
                  disabled={selectedTransaksi.items[0]?.kirim_ranap === 1}
                >
                  <i className="fas fa-bed me-1"></i> Kirim Ke Rawat Inap
                </Button>
              )}

              <Button variant="warning" size="sm" onClick={onClose}>
                Tutup
              </Button>
            </div>
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
                    <th>Tindakan / Item Obat</th>
                    <th>Kelompok Tindakan</th>
                    <th>Pelaksana/Dokter</th>
                    <th className="text-center">Qty</th>
                    <th className="text-end">Tarif Satuan</th>
                    <th className="text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTransaksi.items.map((item, idx) => {
                    const hargaAsli = parseFloat(item.TotalTarif || 0);
                    const qty = parseFloat(item.Kuantitas || 1);

                    // Logika pemisahan Obat vs Tindakan sesuai query SQL
                    const isObat = item.KelompokTindakan === "OBAT";
                    const subtotal = isObat ? hargaAsli : hargaAsli * qty;
                    const hargaSatuan = isObat ? hargaAsli / qty : hargaAsli;

                    return (
                      <tr key={idx}>
                        <td>
                          {item.NamaTindakan} <br />
                          <Badge
                            bg="soft-warning"
                            className="mt-1"
                            style={{ fontSize: "0.65rem" }}
                          >
                            Ruangan : {item.NamaRuangan}
                          </Badge>
                        </td>
                        <td>{item.KelompokTindakan}</td>
                        <td>
                          <strong>{getPelaksanaDefault(item)}</strong>
                          <br />
                          {item.idRegister} - {item.NomorRekamMedis}
                        </td>
                        <td className="text-center">{item.Kuantitas}</td>
                        <td className="text-end">
                          {hargaSatuan.toLocaleString("id-ID")}
                          <br />
                          {item.TanggalPelayanan}
                        </td>
                        <td className="text-end fw-bold">
                          {subtotal.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="table-primary">
                    <td colSpan="5" className="text-end fw-bold">
                      TOTAL PEMBAYARAN
                    </td>
                    <td
                      className="text-end fw-bold"
                      style={{ fontSize: "1.1rem" }}
                    >
                      Rp {calculateTotal().toLocaleString("id-ID")}
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default RincianBilling;
