import React, { useState } from "react";
import { Row, Col, Image, Form, Button, ListGroup } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import Card from "../../../components/Card";
import api from "../../../api/axios";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";

const MySwal = withReactContent(Swal);

const SignIn = () => {
  let history = useNavigate();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Tampilkan loading
      let timerInterval;
      MySwal.fire({
        title: "Memproses login...",
        timer: 2000,
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading();
        },
        willClose: () => {
          clearInterval(timerInterval);
        },
      }).then((result) => {
        /* Read more about handling dismissals below */
        if (result.dismiss === Swal.DismissReason.timer) {
          // console.log("I was closed by the timer");
        }
      });

      // Ambil CSRF cookie dulu
      await api.get("/sanctum/csrf-cookie");

      // 🔐 Proses login dan dapatkan token
      const loginResponse = await api.post("/api/login", { email, password });
      const { token, user } = loginResponse.data;

      // 📝 Simpan token & user ke SESSION (per-tab)
      sessionStorage.setItem("auth_token", token);
      sessionStorage.setItem("user", JSON.stringify(user));

      // 🛠️ Set header Authorization default di axios
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // (Opsional) Ambil data user dari backend untuk validasi
      const res = await api.get("/api/user");
      // console.log("User data:", res.data);

      // Tutup loading dan tampilkan sukses
      await MySwal.fire({
        title: "Login berhasil!",
        icon: "success",
        confirmButtonText: "OK",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Login gagal:", error);
      const pesanError =
        error?.response?.data?.message ||
        "Terjadi kesalahan saat login. Silakan coba lagi.";

      MySwal.fire({
        title: "Login gagal!",
        text: pesanError,
        icon: "error",
        confirmButtonText: "Tutup",
      });
    }
  };

  return (
    <>
      <section className="login-content">
        <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
          <Col md="6" className="align-items-center">
            <Row className="justify-content-center">
              <Col md="10" className="align-items-center">
                <Card className="card-transparent shadow-none d-flex justify-content-center mb-0 auth-card">
                  <Card.Body>
                    <Link
                      to="/"
                      className="navbar-brand d-flex align-items-center mb-3"
                    >
                      <svg
                        width="30"
                        className="text-primary"
                        viewBox="0 0 30 30"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="-0.757324"
                          y="19.2427"
                          width="28"
                          height="4"
                          rx="2"
                          transform="rotate(-45 -0.757324 19.2427)"
                          fill="currentColor"
                        />
                        <rect
                          x="7.72803"
                          y="27.728"
                          width="28"
                          height="4"
                          rx="2"
                          transform="rotate(-45 7.72803 27.728)"
                          fill="currentColor"
                        />
                        <rect
                          x="10.5366"
                          y="16.3945"
                          width="16"
                          height="4"
                          rx="2"
                          transform="rotate(45 10.5366 16.3945)"
                          fill="currentColor"
                        />
                        <rect
                          x="10.5562"
                          y="-0.556152"
                          width="28"
                          height="4"
                          rx="2"
                          transform="rotate(45 10.5562 -0.556152)"
                          fill="currentColor"
                        />
                      </svg>
                      <h4 className="logo-title ms-3">SmartSimrs</h4>
                    </Link>
                    <h2 className="mb-2 text-center">Sign In</h2>
                    <p className="text-center">Login to stay connected.</p>
                    <Form onSubmit={handleLogin}>
                      <Row>
                        <Col lg="12">
                          <Form.Group className="form-group">
                            <Form.Label htmlFor="email" className="">
                              Email
                            </Form.Label>
                            <Form.Control
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              className=""
                              id="email"
                              aria-describedby="email"
                              placeholder=" "
                            />
                          </Form.Group>
                        </Col>
                        <Col lg="12" className="">
                          <Form.Group className="form-group">
                            <Form.Label htmlFor="password" className="">
                              Password
                            </Form.Label>
                            <Form.Control
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              className=""
                              id="password"
                              aria-describedby="password"
                              placeholder=" "
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <div className="d-flex justify-content-center">
                        <Button type="submit" variant="btn btn-primary">
                          Sign In
                        </Button>
                      </div>

                      <p className="mt-3 text-center">
                        Don’t have an account?{" "}
                        <Link to="/auth/sign-up" className="text-underline">
                          Click here to sign up.
                        </Link>
                      </p>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            <div className="sign-bg">
              <svg
                width="280"
                height="230"
                viewBox="0 0 431 398"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g opacity="0.05">
                  <rect
                    x="-157.085"
                    y="193.773"
                    width="543"
                    height="77.5714"
                    rx="38.7857"
                    transform="rotate(-45 -157.085 193.773)"
                    fill="#3B8AFF"
                  />
                  <rect
                    x="7.46875"
                    y="358.327"
                    width="543"
                    height="77.5714"
                    rx="38.7857"
                    transform="rotate(-45 7.46875 358.327)"
                    fill="#3B8AFF"
                  />
                  <rect
                    x="61.9355"
                    y="138.545"
                    width="310.286"
                    height="77.5714"
                    rx="38.7857"
                    transform="rotate(45 61.9355 138.545)"
                    fill="#3B8AFF"
                  />
                  <rect
                    x="62.3154"
                    y="-190.173"
                    width="543"
                    height="77.5714"
                    rx="38.7857"
                    transform="rotate(45 62.3154 -190.173)"
                    fill="#3B8AFF"
                  />
                </g>
              </svg>
            </div>
          </Col>
        </div>
      </section>
    </>
  );
};

export default SignIn;
