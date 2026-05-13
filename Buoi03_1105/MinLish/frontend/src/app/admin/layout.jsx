import Link from 'next/link';

export default function AdminLayout({ children }) {
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link href="/admin" className="navbar-brand">MinLish Admin</Link>
          <div className="navbar-nav">
            <Link href="/admin/lessons" className="nav-link">Quản lý bài học</Link>
            <Link href="/admin/users" className="nav-link">Quản lý người dùng</Link>
          </div>
        </div>
      </nav>
      <main className="container mt-4">
        {children}
      </main>
    </div>
  );
}
