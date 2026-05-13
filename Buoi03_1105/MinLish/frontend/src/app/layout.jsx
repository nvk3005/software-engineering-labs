import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import "bootstrap-icons/font/bootstrap-icons.css";

export const metadata = {
  title: 'MinLish',
  description: 'Học tiếng Anh với MinLish',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
