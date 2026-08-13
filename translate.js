const fs = require('fs');

const TRANSLATIONS = {
  "forbidden.title": { es: "Acceso Restringido (403) | POS S360T", en: "Restricted Access (403) | POS S360T", sw: "Ufikiaji Umezuiwa (403) | POS S360T" },
  "forbidden.error": { es: "ERROR 403", en: "ERROR 403", sw: "HITILAFU 403" },
  "forbidden.heading": { es: "Acceso restringido", en: "Restricted access", sw: "Ufikiaji umezuiwa" },
  "forbidden.desc": { es: "Tu rol actual no tiene permisos para abrir esta sección. Contacta al administrador si crees que es un error.", en: "Your current role does not have permissions to open this section. Contact the administrator if you believe this is an error.", sw: "Jukumu lako la sasa halina ruhusa ya kufungua sehemu hii. Wasiliana na msimamizi ikiwa unadhani haya ni makosa." },
  "forbidden.back": { es: "Volver al inicio", en: "Back to home", sw: "Rudi mwanzo" },
  "notfound.title": { es: "Página No Encontrada (404) | POS S360T", en: "Page Not Found (404) | POS S360T", sw: "Ukurasa Haujapatikana (404) | POS S360T" },
  "notfound.desc": { es: "¡Uy! Página no encontrada", en: "Oops! Page not found", sw: "Lo! Ukurasa haujapatikana" },
  "notfound.home": { es: "Volver al inicio", en: "Return to Home", sw: "Rudi Mwanzo" },
  "stub.heading": { es: "Módulo en preparación", en: "Module in preparation", sw: "Moduli inaandaliwa" },
  "stub.desc": { es: "Las tablas y reglas de seguridad ya están listas en el backend. Esta pantalla se completará en la siguiente iteración.", en: "Tables and security rules are already set in the backend. This screen will be completed in the next iteration.", sw: "Majedwali na sheria za usalama tayari zimewekwa kwenye backend. Skrini hii itakamilishwa katika mzunguko unaofuata." },
  
  "employees.meta": { es: "NEGOCIO · PERSONAL", en: "BUSINESS · STAFF", sw: "BIASHARA · WAFANYAKAZI" },
  "employees.title": { es: "Empleados", en: "Employees", sw: "Wafanyakazi" },
  "employees.subtitle.single": { es: "miembro del equipo", en: "team member", sw: "mfanyakazi" },
  "employees.subtitle.plural": { es: "miembros del equipo", en: "team members", sw: "wafanyakazi" },
  "employees.new": { es: "Nuevo empleado", en: "New employee", sw: "Mfanyakazi mpya" },
  "employees.empty.title": { es: "Sin empleados", en: "No employees", sw: "Hakuna wafanyakazi" },
  "employees.empty.desc": { es: "Agrega los miembros de tu equipo para gestionar turnos y accesos.", en: "Add team members to manage shifts and access.", sw: "Ongeza wafanyakazi ili kudhibiti zamu na ufikiaji." },
  "employees.col.name": { es: "Nombre", en: "Name", sw: "Jina" },
  "employees.col.phone": { es: "Teléfono", en: "Phone", sw: "Simu" },
  "employees.col.role": { es: "Rol", en: "Role", sw: "Jukumu" },
  "employees.active": { es: "Activo", en: "Active", sw: "Inafanya kazi" },
  "employees.form.title.new": { es: "Nuevo empleado", en: "New employee", sw: "Mfanyakazi mpya" },
  "employees.form.fullname": { es: "Nombre completo", en: "Full name", sw: "Jina kamili" },
  "employees.form.pin": { es: "PIN (4-6 dígitos)", en: "PIN (4-6 digits)", sw: "PIN (tarakimu 4-6)" },
  "employees.form.submit": { es: "Crear empleado", en: "Create employee", sw: "Unda mfanyakazi" },
  "employees.msg.created": { es: "Empleado creado", en: "Employee created", sw: "Mfanyakazi ameundwa" },
  
  "shifts.status.scheduled": { es: "Programado", en: "Scheduled", sw: "Imepangwa" },
  "shifts.status.in_progress": { es: "En curso", en: "In progress", sw: "Inaendelea" },
  "shifts.status.completed": { es: "Completado", en: "Completed", sw: "Imekamilika" },
  "shifts.status.missed": { es: "No asistió", en: "Missed", sw: "Alikosa" },
  "shifts.loading": { es: "Cargando turnos…", en: "Loading shifts…", sw: "Inapakia zamu…" },
  "shifts.msg.checkin": { es: "Entrada registrada", en: "Check-in registered", sw: "Kuingia kumesajiliwa" },
  "shifts.msg.checkout": { es: "Salida registrada", en: "Check-out registered", sw: "Kutoka kumesajiliwa" },
  "shifts.meta": { es: "NEGOCIO · TURNOS", en: "BUSINESS · SHIFTS", sw: "BIASHARA · ZAMU" },
  "shifts.title": { es: "Programación de turnos", en: "Shift scheduling", sw: "Ratiba ya zamu" },
  "shifts.subtitle.single": { es: "turno esta semana", en: "shift this week", sw: "zamu wiki hii" },
  "shifts.subtitle.plural": { es: "turnos esta semana", en: "shifts this week", sw: "zamu wiki hii" },
  "shifts.branch.all": { es: "Todas las sucursales", en: "All branches", sw: "Matawi yote" },
  "shifts.new": { es: "Nuevo turno", en: "New shift", sw: "Zamu mpya" },
  "shifts.tab.week": { es: "Semana", en: "Week", sw: "Wiki" },
  "shifts.tab.list": { es: "Lista", en: "List", sw: "Orodha" },
  "shifts.tab.attendance": { es: "Asistencia", en: "Attendance", sw: "Mahudhurio" },
  "shifts.nav.prev": { es: "← Anterior", en: "← Previous", sw: "← Iliyopita" },
  "shifts.nav.today": { es: "Hoy", en: "Today", sw: "Leo" },
  "shifts.nav.next": { es: "Siguiente →", en: "Next →", sw: "Inayofuata →" },
  "shifts.empty.title": { es: "Sin turnos", en: "No shifts", sw: "Hakuna zamu" },
  "shifts.empty.desc": { es: "Crea el primer turno de la semana.", en: "Create the first shift of the week.", sw: "Unda zamu ya kwanza ya wiki." },
  "shifts.col.employee": { es: "Empleado", en: "Employee", sw: "Mfanyakazi" },
  "shifts.col.start": { es: "Inicio", en: "Start", sw: "Mwanzo" },
  "shifts.col.end": { es: "Fin", en: "End", sw: "Mwisho" },
  "shifts.col.checkin": { es: "Entrada", en: "Check-in", sw: "Kuingia" },
  "shifts.col.checkout": { es: "Salida", en: "Check-out", sw: "Kutoka" },
  "shifts.btn.checkin": { es: "Entrada", en: "Check-in", sw: "Kuingia" },
  "shifts.btn.checkout": { es: "Salida", en: "Check-out", sw: "Kutoka" },
  "shifts.att.empty.title": { es: "Sin registros", en: "No records", sw: "Hakuna rekodi" },
  "shifts.att.empty.desc": { es: "No hay registros de asistencia todavía.", en: "No attendance records yet.", sw: "Hakuna rekodi za mahudhurio bado." },
  "shifts.col.type": { es: "Tipo", en: "Type", sw: "Aina" },
  "shifts.err.req": { es: "Empleado y sucursal son obligatorios", en: "Employee and branch are required", sw: "Mfanyakazi na tawi ni lazima" },
  "shifts.err.dates": { es: "El fin debe ser posterior al inicio", en: "End must be after start", sw: "Mwisho lazima uwe baada ya mwanzo" },
  "shifts.msg.created": { es: "Turno creado", en: "Shift created", sw: "Zamu imeundwa" },
  "shifts.form.employee": { es: "Empleado", en: "Employee", sw: "Mfanyakazi" },
  "shifts.form.branch": { es: "Sucursal", en: "Branch", sw: "Tawi" },
  "shifts.form.select": { es: "Selecciona...", en: "Select...", sw: "Chagua..." },
  "shifts.form.no_emp": { es: "Sin empleados activos", en: "No active employees", sw: "Hakuna wafanyakazi wanaofanya kazi" },
  "shifts.form.start": { es: "Inicio", en: "Start", sw: "Mwanzo" },
  "shifts.form.end": { es: "Fin", en: "End", sw: "Mwisho" },
  "shifts.form.saving": { es: "Guardando...", en: "Saving...", sw: "Inahifadhi..." },
  "shifts.form.submit": { es: "Crear turno", en: "Create shift", sw: "Unda zamu" },
  
  "suppliers.msg.updated": { es: "Proveedor actualizado", en: "Supplier updated", sw: "Msambazaji amesasishwa" },
  "suppliers.msg.created": { es: "Proveedor creado", en: "Supplier created", sw: "Msambazaji ameundwa" },
  "suppliers.msg.deleted": { es: "Proveedor eliminado", en: "Supplier deleted", sw: "Msambazaji amefutwa" },
  "suppliers.msg.ord_created": { es: "Orden de compra creada", en: "Purchase order created", sw: "Agizo la ununuzi limeundwa" },
  "suppliers.msg.ord_received": { es: "Orden recibida · Inventario actualizado", en: "Order received · Inventory updated", sw: "Agizo limepokelewa · Stoki imesasishwa" },
  "suppliers.msg.ord_error": { es: "Error al recibir", en: "Error receiving", sw: "Hitilafu kupokea" },
  "suppliers.meta": { es: "INVENTARIO · PROVEEDORES", en: "INVENTORY · SUPPLIERS", sw: "STOKI · WASAMBAZAJI" },
  "suppliers.title": { es: "Proveedores", en: "Suppliers", sw: "Wasambazaji" },
  "suppliers.subtitle.single": { es: "proveedor", en: "supplier", sw: "msambazaji" },
  "suppliers.subtitle.plural": { es: "proveedores", en: "suppliers", sw: "wasambazaji" },
  "suppliers.new_ord": { es: "Nueva orden de compra", en: "New purchase order", sw: "Agizo jipya la ununuzi" },
  "suppliers.new": { es: "Nuevo proveedor", en: "New supplier", sw: "Msambazaji mpya" },
  "suppliers.tab.suppliers": { es: "Proveedores", en: "Suppliers", sw: "Wasambazaji" },
  "suppliers.tab.orders": { es: "Órdenes de compra", en: "Purchase orders", sw: "Maagizo ya ununuzi" },
  "suppliers.search": { es: "Buscar proveedor...", en: "Search supplier...", sw: "Tafuta msambazaji..." },
  "suppliers.empty.title": { es: "Sin proveedores", en: "No suppliers", sw: "Hakuna wasambazaji" },
  "suppliers.empty.desc": { es: "Registra tus proveedores para gestionar compras e inventario.", en: "Register your suppliers to manage purchases and inventory.", sw: "Sajili wasambazaji wako ili kudhibiti ununuzi na stoki." },
  "suppliers.col.nit": { es: "NIT", en: "Tax ID", sw: "Nambari ya Kodi" },
  "suppliers.col.contact": { es: "Contacto", en: "Contact", sw: "Mawasiliano" },
  "suppliers.col.terms": { es: "Condición de pago", en: "Payment terms", sw: "Masharti ya malipo" },
  "suppliers.btn.edit": { es: "Editar proveedor", en: "Edit supplier", sw: "Hariri msambazaji" },
  "suppliers.btn.delete": { es: "Eliminar proveedor", en: "Delete supplier", sw: "Futa msambazaji" },
  "suppliers.confirm.delete": { es: "¿Eliminar proveedor?", en: "Delete supplier?", sw: "Kufuta msambazaji?" },
  "suppliers.ord.empty.title": { es: "Sin órdenes de compra", en: "No purchase orders", sw: "Hakuna maagizo ya ununuzi" },
  "suppliers.ord.empty.desc": { es: "Crea órdenes de compra para registrar tus compras a proveedores.", en: "Create purchase orders to record your supplier purchases.", sw: "Unda maagizo ya ununuzi ili kurekodi ununuzi wako kutoka kwa wasambazaji." },
  "suppliers.col.notes": { es: "Notas", en: "Notes", sw: "Vidokezo" },
  "suppliers.ord.no_supplier": { es: "Sin proveedor", en: "No supplier", sw: "Hakuna msambazaji" },
  "suppliers.ord.received": { es: "Recibida", en: "Received", sw: "Imepokelewa" },
  "suppliers.ord.cancelled": { es: "Cancelada", en: "Cancelled", sw: "Imeghairiwa" },
  "suppliers.ord.draft": { es: "Borrador", en: "Draft", sw: "Rasimu" },
  "suppliers.btn.receive": { es: "Recibir", en: "Receive", sw: "Pokea" },
  "suppliers.confirm.receive": { es: "¿Marcar como recibida? Esto actualizará el inventario.", en: "Mark as received? This will update inventory.", sw: "Weka alama kama imepokelewa? Hii itasasisha stoki." },
  "suppliers.form.edit": { es: "Editar proveedor", en: "Edit supplier", sw: "Hariri msambazaji" },
  "suppliers.form.name": { es: "Nombre / Razón social *", en: "Name / Business Name *", sw: "Jina / Jina la Biashara *" },
  "suppliers.form.name_ph": { es: "Distribuidora XYZ", en: "XYZ Distributor", sw: "Msambazaji XYZ" },
  "suppliers.form.terms_ph": { es: "Ej: 30 días, contado, crédito 15 días", en: "Ex: 30 days, cash, 15 days credit", sw: "Mf: siku 30, pesa taslimu, mkopo wa siku 15" },
  "suppliers.form.notes_ph": { es: "Observaciones adicionales", en: "Additional observations", sw: "Maoni ya ziada" },
  "suppliers.form.save": { es: "Guardar cambios", en: "Save changes", sw: "Hifadhi mabadiliko" },
  "suppliers.ord.form.title": { es: "Nueva orden de compra", en: "New purchase order", sw: "Agizo jipya la ununuzi" },
  "suppliers.ord.form.sel_sup": { es: "Seleccionar proveedor", en: "Select supplier", sw: "Chagua msambazaji" },
  "suppliers.ord.form.notes_ph": { es: "Observaciones de la orden", en: "Order observations", sw: "Maoni ya agizo" },
  "suppliers.ord.form.add": { es: "Agregar productos", en: "Add products", sw: "Ongeza bidhaa" },
  "suppliers.ord.form.prod": { es: "Producto", en: "Product", sw: "Bidhaa" },
  "suppliers.ord.form.qty": { es: "Cantidad", en: "Quantity", sw: "Kiasi" },
  "suppliers.ord.form.cost": { es: "Costo unit.", en: "Unit cost", sw: "Gharama ya kitengo" },
  "suppliers.ord.form.add_btn": { es: "Agregar producto", en: "Add product", sw: "Ongeza bidhaa" },
  "suppliers.ord.form.col_qty": { es: "Cant.", en: "Qty.", sw: "Kiasi" },
  "suppliers.ord.form.col_cost": { es: "Costo", en: "Cost", sw: "Gharama" },
  "suppliers.ord.form.rem": { es: "Quitar producto", en: "Remove product", sw: "Ondoa bidhaa" },
  "suppliers.ord.form.total_p": { es: "producto(s)", en: "product(s)", sw: "bidhaa" },
  "suppliers.ord.form.creating": { es: "Creando...", en: "Creating...", sw: "Inaunda..." },
  "suppliers.ord.form.create": { es: "Crear orden de compra", en: "Create purchase order", sw: "Unda agizo la ununuzi" },
  
  "whatsapp.meta": { es: "VENTA DIGITAL", en: "DIGITAL SALES", sw: "MAUZO YA KIDIJITALI" },
  "whatsapp.title": { es: "WhatsApp Inbox", en: "WhatsApp Inbox", sw: "Sanduku la WhatsApp" },
  "whatsapp.subtitle.single": { es: "chat activo", en: "active chat", sw: "gumzo linalofanya kazi" },
  "whatsapp.subtitle.plural": { es: "chats activos", en: "active chats", sw: "magumzo yanayofanya kazi" },
  "whatsapp.search": { es: "Buscar cliente o teléfono...", en: "Search customer or phone...", sw: "Tafuta mteja au simu..." },
  "whatsapp.new_order": { es: "Nueva comanda", en: "New order", sw: "Agizo jipya" },
  "whatsapp.chat.empty": { es: "Selecciona un chat", en: "Select a chat", sw: "Chagua gumzo" },
  "whatsapp.chat.empty_desc": { es: "Elige una conversación para continuar la venta.", en: "Choose a conversation to continue the sale.", sw: "Chagua mazungumzo ili kuendelea na uuzaji." },
  "whatsapp.msg.placeholder": { es: "Escribe un mensaje...", en: "Type a message...", sw: "Andika ujumbe..." },
  
  "tables.meta": { es: "SALÓN · MESAS", en: "FLOOR · TABLES", sw: "UKUMBI · MEZA" },
  "tables.title": { es: "Mesas", en: "Tables", sw: "Meza" },
  "tables.subtitle.single": { es: "mesa libre", en: "available table", sw: "meza inayopatikana" },
  "tables.subtitle.plural": { es: "mesas libres", en: "available tables", sw: "meza zinazopatikana" },
  "tables.status.available": { es: "Libre", en: "Available", sw: "Inapatikana" },
  "tables.status.occupied": { es: "Ocupada", en: "Occupied", sw: "Imechukuliwa" },
  "tables.status.reserved": { es: "Reservada", en: "Reserved", sw: "Imehifadhiwa" },
  "tables.area.all": { es: "Todas las áreas", en: "All areas", sw: "Maeneo yote" }
};

const file = 'c:\\Users\\micha\\OneDrive\\Desktop\\ai-point-of-sale\\src\\lib\\translations.ts';
let content = fs.readFileSync(file, 'utf8');

const langs = ['es', 'en', 'sw'];
for (const lang of langs) {
  let toInject = "";
  for (const [key, trans] of Object.entries(TRANSLATIONS)) {
    toInject += `    "${key}": "${trans[lang]}",\n`;
  }
  
  // Find the block for the language. Each block ends with `  },`
  // We can locate `"landing.footer.sub": "· Open Source"` within each block
  const searchStr = `"landing.footer.sub": "· Open Source"`;
  
  // To distinguish between es, en, sw blocks, we can search for `lang + ": {"`
  const blockStart = content.indexOf(`\n  ${lang}: {`);
  if (blockStart === -1) {
    console.log(`Block for ${lang} not found`);
    continue;
  }
  const blockEnd = content.indexOf(`\n  },`, blockStart);
  
  const injectPos = content.lastIndexOf(searchStr, blockEnd);
  
  content = content.substring(0, injectPos) + searchStr + ",\n" + toInject + content.substring(injectPos + searchStr.length);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Translations injected successfully.');
