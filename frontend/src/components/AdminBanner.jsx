import "./AdminBanner.css";

export default function AdminBanner() {
  return (
    <div className="admin-banner">
      <div className="admin-banner-inner">
        <span className="admin-banner-pill">Demo — Admin Area</span>
        <span className="admin-banner-msg">
          This page is normally restricted to Cuemath HR. Login is skipped for this portfolio demo so reviewers can explore all features freely.
        </span>
      </div>
    </div>
  );
}
