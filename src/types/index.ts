@@ .. @@
 export interface User {
   id: string;
-  email: string;
-  name: string;
+  email: string | null;
+  name: string | null;
   role: UserRole;
-  createdAt: string;
-  updatedAt: string;
+  createdAt: string | null;
+  updatedAt: string | null;
   specialty?: MedicalSpecialty | null;
   licenseNumber?: string | null;
   phone?: string | null;
   avatar?: string | null;
 }