import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { AuthProvider } from '../context/AuthContext';
import './styles/globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-white text-gray-800">
        <AuthProvider>
          <Navbar />
          <div className="container mx-auto px-4 lg:px-8">{children}</div> {/* 컨테이너 중앙 정렬 */}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}