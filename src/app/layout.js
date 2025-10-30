import { Outfit } from "next/font/google";
import "./globals.css";
import Header from "./component/layout/Header";

const outfit = Outfit({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={outfit.className}
      >
        <div> <Header/>
          {children}
        </div>
      </body>
    </html>
  );
}
