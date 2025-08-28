@@ .. @@
                   <div className="flex items-center space-x-3">
                     <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
-                      {user.name.charAt(0).toUpperCase()}
+                      {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                     </div>
                     <div>
-                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
+                      <p className="text-sm font-medium text-gray-900">{user.name || user.email}</p>
                       <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                     </div>
                   </div>
@@ .. @@
                 <div className="flex items-center space-x-3">
                   <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
-                    {user.name.charAt(0).toUpperCase()}
+                    {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                   </div>
                   <div>
-                    <p className="text-base font-medium text-gray-900">{user.name}</p>
+                    <p className="text-base font-medium text-gray-900">{user.name || user.email}</p>
                     <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                   </div>
                 </div>