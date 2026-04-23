import React from "react";
import {
  Row,
  Col,
  Table,
  Badge,
  Button,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import Card from "../../components/Card";

const RincianBilling = ({
  selectedTransaksi,
  onClose,
  onKirim,
  onKirimRanap,
  calculateTotal,
  getPelaksanaDefault,
  onAddTindakan, // Prop baru untuk handle tambah data
  onEditTindakan, // Prop baru untuk handle edit per item
  onDeleteTindakan, // Prop baru untuk handle hapus per item
}) => {
  if (!selectedTransaksi) return null;

  return (
    <Row className="animate__animated animate__fadeInUp mt-4">
      <Col sm="12">
        <Card className="border-primary">
          <Card.Header className="d-flex flex-column flex-xl-row justify-content-between align-items-start align-items-xl-center bg-transparent gap-3 py-3">
            {/* BAGIAN KIRI: JUDUL & BADGE */}
            <div className="w-100">
              <h4 className="card-title text-primary mb-0">
                Rincian Billing:{" "}
                <span className="text-dark">{selectedTransaksi.nama}</span>
              </h4>

              {selectedTransaksi.items[0]?.kirim_ranap === 1 && (
                <div className="mt-2">
                  <Badge
                    bg="soft-info"
                    className="text-info d-flex d-md-inline-flex align-items-center p-2 text-wrap text-start"
                    style={{ fontSize: "0.8rem", lineHeight: "1.2" }}
                  >
                    <i className="fas fa-info-circle me-2 flex-shrink-0"></i>
                    <span>
                      Tindakan Sudah Terkirim Ke Register Rawat Inap:
                      <Badge bg="warning" className="text-dark ms-1">
                        {selectedTransaksi.items[0]?.register_ranap}
                      </Badge>
                    </span>
                  </Badge>
                </div>
              )}
            </div>

            {/* BAGIAN KANAN: GROUP TOMBOL */}
            <div className="d-flex flex-wrap gap-2 w-100 w-xl-auto justify-content-start justify-content-xl-end">
              <Button
                variant="primary"
                size="sm"
                className="flex-grow-1 flex-md-grow-0"
                onClick={onAddTindakan}
                disabled={selectedTransaksi.items[0]?.kirim_ranap === 1}
              >
                <i className="fas fa-plus-circle me-1"></i> Tambah
              </Button>

              <Button
                variant="success"
                size="sm"
                className="flex-grow-1 flex-md-grow-0"
                onClick={onKirim}
                disabled={selectedTransaksi.items[0]?.kirim_ranap === 1}
              >
                <i className="fas fa-paper-plane me-1"></i> SmartRemun
              </Button>

              {!selectedTransaksi.header?.jenis_rawat?.includes(
                "RAWAT INAP",
              ) && (
                <Button
                  variant="info"
                  size="sm"
                  className="flex-grow-1 flex-md-grow-0"
                  onClick={onKirimRanap}
                  disabled={selectedTransaksi.items[0]?.kirim_ranap === 1}
                >
                  <i className="fas fa-bed me-1"></i> Ranap
                </Button>
              )}

              <Button
                variant="warning"
                size="sm"
                className="flex-grow-1 flex-md-grow-0"
                onClick={onClose}
              >
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
                    <th>Kelompok</th>
                    <th>Pelaksana/Dokter</th>
                    <th className="text-center">Qty</th>
                    <th className="text-end">Tarif Satuan</th>
                    <th className="text-end">Subtotal</th>
                    <th className="text-center" style={{ width: "100px" }}>
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTransaksi.items.map((item, idx) => {
                    const hargaAsli = parseFloat(item.TotalTarif || 0);
                    const qty = parseFloat(item.Kuantitas || 1);
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
                          <small className="text-muted">
                            {item.idRegister}
                          </small>
                        </td>
                        <td className="text-center">{item.Kuantitas}</td>
                        <td className="text-end">
                          {hargaSatuan.toLocaleString("id-ID")}
                        </td>
                        <td className="text-end fw-bold">
                          {subtotal.toLocaleString("id-ID")}
                        </td>

                        {/* KOLOM AKSI */}
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-1">
                            {/* <Button 
                              variant="soft-warning" 
                              size="xs" 
                              className="btn-icon py-0 px-1"
                              onClick={() => onEditTindakan(item)}
                              disabled={selectedTransaksi.items[0]?.kirim_ranap === 1}
                            >
                              <i className="fas fa-edit" style={{fontSize: '0.8rem'}}></i>
                            </Button> */}
                            <Button
                              variant="soft-danger"
                              size="xs"
                              className="btn-icon py-0 px-1"
                              onClick={() => onDeleteTindakan(item)}
                              disabled={
                                selectedTransaksi.items[0]?.kirim_ranap === 1
                              }
                            >
                              <i
                                className="fas fa-trash"
                                style={{ fontSize: "0.8rem" }}
                              ></i>
                            </Button>
                          </div>
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
                    <td></td>
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
