import React from 'react';
import Script from 'next/script';


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <style>{`
          .cscroll::-webkit-scrollbar {
            display: none;
          }
          .cscroll {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>

  );
}
