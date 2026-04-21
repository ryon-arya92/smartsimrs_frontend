import React, { useEffect, Fragment, memo } from "react";
import { Navbar, Container, Nav, Dropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import CustomToggle from "../../../dropdowns";
import api from "../../../../api/axios";
// import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

// img imports
import flag1 from "../../../../assets/images/Flag/flag001.png";
import flag2 from "../../../../assets/images/Flag/flag-02.png";
import flag3 from "../../../../assets/images/Flag/flag-03.png";
import flag4 from "../../../../assets/images/Flag/flag-04.png";
import flag5 from "../../../../assets/images/Flag/flag-05.png";
import flag6 from "../../../../assets/images/Flag/flag-06.png";
import shapes1 from "../../../../assets/images/shapes/01.png";
import shapes2 from "../../../../assets/images/shapes/02.png";
import shapes3 from "../../../../assets/images/shapes/03.png";
import shapes4 from "../../../../assets/images/shapes/04.png";
import shapes5 from "../../../../assets/images/shapes/05.png";
import avatars1 from "../../../../assets/images/avatars/01.png";
import avatars2 from "../../../../assets/images/avatars/avtar_1.png";
import avatars3 from "../../../../assets/images/avatars/avtar_2.png";
import avatars4 from "../../../../assets/images/avatars/avtar_3.png";
import avatars5 from "../../../../assets/images/avatars/avtar_4.png";
import avatars6 from "../../../../assets/images/avatars/avtar_5.png";

import Logo from "../../components/logo";
import { useSelector } from "react-redux";
import * as SettingSelector from "../../../../store/setting/selectors";
const MySwal = withReactContent(Swal);

const Header = memo(() => {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const navbarHide = useSelector(SettingSelector.navbar_show);
  const headerNavbar = useSelector(SettingSelector.header_navbar);

  useEffect(() => {
    if (headerNavbar === "navs-sticky" || headerNavbar === "nav-glass") {
      window.onscroll = () => {
        const nav = document.getElementsByTagName("nav")[0];
        if (document.documentElement.scrollTop > 50) {
          nav.classList.add("menu-sticky");
        } else {
          nav.classList.remove("menu-sticky");
        }
      };
    }
  }, [headerNavbar]);

  const minisidebar = () => {
    document.getElementsByTagName("ASIDE")[0]?.classList.toggle("sidebar-mini");
  };

  // Fungsi ambil CSRF token dari Sanctum
  const getCsrfCookie = async () => {
    await api.get("/sanctum/csrf-cookie", {
      withCredentials: true,
    });
  };

  // Ambil cookie XSRF token dari browser
  const getToken = () => {
    const match = document.cookie.match(new RegExp("(^| )XSRF-TOKEN=([^;]+)"));
    if (match) return decodeURIComponent(match[2]);
  };

  api.defaults.withCredentials = true;
  api.defaults.headers.common["X-XSRF-TOKEN"] = getToken();

  const handleLogout = async () => {
    try {
      // Panggil endpoint logout (hapus token dari server)
      await api.post("/api/logout");
    } catch (e) {
      console.warn("Token mungkin sudah kadaluarsa, tetap logout lokal");
    } finally {
      // Hapus data dari localStorage & header
      sessionStorage.removeItem("auth_token");
      sessionStorage.removeItem("user");
      delete api.defaults.headers.common["Authorization"];

      // Tampilkan alert berhasil logout
      await MySwal.fire({
        title: "Berhasil logout",
        text: "Anda telah keluar dari aplikasi.",
        icon: "success",
        confirmButtonText: "OK",
      });

      // Arahkan ke halaman login (atau localhost:3000)
      window.location.href = "/";
      // atau kalau pakai React Router:
      // navigate("/login");
    }
  };

  return (
    <Fragment>
      <Navbar
        expand="lg"
        variant="light"
        className={`nav iq-navbar ${headerNavbar} ${navbarHide.join(" ")}`}
      >
        <Container fluid className="navbar-inner">
          <Link to="/dashboard" className="navbar-brand">
            <Logo color={true} />
            <h4 className="logo-title">SmartSimrs</h4>
          </Link>
          <div className="sidebar-toggle" onClick={minisidebar}>
            <i className="icon">
              <svg width="20px" height="20px" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"
                />
              </svg>
            </i>
          </div>

          <Navbar.Toggle aria-controls="navbarSupportedContent">
            <span className="navbar-toggler-icon">
              <span className="mt-2 navbar-toggler-bar bar1"></span>
              <span className="navbar-toggler-bar bar2"></span>
              <span className="navbar-toggler-bar bar3"></span>
            </span>
          </Navbar.Toggle>
          <Navbar.Collapse id="navbarSupportedContent">
            <Nav
              as="ul"
              className="mb-2 ms-auto navbar-list mb-lg-0 align-items-center"
            >
              {/* ...menu lainnya tetap... */}
              <Dropdown as="li" className="nav-item">
                <Dropdown.Toggle
                  as={CustomToggle}
                  variant="nav-link py-0 d-flex align-items-center"
                >
                  <img
                    src={avatars1}
                    alt="User"
                    className="theme-color-default-img img-fluid avatar avatar-50 avatar-rounded"
                  />
                  {/* Gambar-gambar avatar lain bisa disesuaikan */}
                  <div className="caption ms-3 d-none d-md-block">
                    <h6 className="mb-0 caption-title">
                      {user.name || "Guest"}
                    </h6>
                    <p className="mb-0 caption-sub-title">
                      {user.email || "user@example.com"}
                    </p>
                  </div>
                </Dropdown.Toggle>
                <Dropdown.Menu
                  className="dropdown-menu-end"
                  aria-labelledby="navbarDropdown"
                >
                  {/* <Dropdown.Item as={Link} to="/dashboard/app/user-profile">Profile</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/dashboard/app/user-privacy-setting">Privacy Setting</Dropdown.Item> */}
                  {/* <Dropdown.Divider /> */}
                  <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </Fragment>
  );
});

export default Header;
