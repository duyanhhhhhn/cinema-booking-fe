import { Outfit } from "next/font/google";
import "./globals.css";
import '@tabler/icons-webfont/dist/tabler-icons.min.css';
import Header from "./component/layout/client/Header";
import Footer from "./component/layout/client/Footer";

const outfit = Outfit({ subsets: ["latin"] });
export const metadata = {
  title: "Cinema Booking",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <div>
          <Header />
          {children}
          {/* <Footer /> */}
        </div>
      </body>
    </html>
  );
}
