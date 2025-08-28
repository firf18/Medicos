@@ .. @@
 import { Inter } from 'next/font/google';
 import { AuthProvider } from '@/contexts/AuthContext';
 import Header from '@/components/layout/Header';
+import { Toaster } from 'react-hot-toast';
 import './globals.css';

@@ .. @@
         <AuthProvider>
           <Header />
           <main>{children}</main>
+          <Toaster position="top-right" />
         </AuthProvider>
       </body>
     </html>