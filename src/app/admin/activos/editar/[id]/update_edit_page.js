const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\HP\\Documents\\Softwares\\Daniela Robles\\Activos Viviendas\\activos-greenfield\\src\\app\\admin\\activos\\editar\\[id]\\page.tsx';

let content = fs.readFileSync(filePath, 'utf8');

// 1. Reemplazar inputs comunes y selects
content = content.replaceAll(
  'className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"',
  'className="w-full text-xs rounded-xl border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-dark/50 py-2.5 px-4 text-black dark:text-white outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(74,108,247,0.15)] transition-all"'
);

// 2. Reemplazar inputs de solo lectura / deshabilitados
content = content.replaceAll(
  'className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-gray-100 px-6 py-3 text-base text-body-color outline-none dark:border-transparent dark:bg-gray-700 cursor-not-allowed opacity-75"',
  'className="w-full text-xs rounded-xl border border-black/5 dark:border-white/5 bg-gray-100/50 dark:bg-gray-800/30 py-2.5 px-4 text-black/50 dark:text-white/50 outline-none cursor-not-allowed opacity-75"'
);

// 3. Secciones internas (fondos y esquinas)
content = content.replaceAll(
  'className="mb-8 p-6 bg-[#f8f8f8] dark:bg-[#2C303B] rounded-sm"',
  'className="mb-8 p-5 rounded-xl border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/5"'
);

content = content.replaceAll(
  'className="mb-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg"',
  'className="mb-8 p-5 rounded-xl border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/5"'
);

content = content.replaceAll(
  'className="mt-8 rounded-md bg-blue-50 dark:bg-blue-900/20 p-4"',
  'className="mt-8 rounded-xl border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/5 p-4"'
);

// 5. Previsualización de imagen (object-cover a object-contain sin zoom)
content = content.replaceAll(
  'className="w-full h-64 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600"',
  'className="w-full h-64 object-contain bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-black/5 dark:border-white/5"'
);

// 6. Títulos de secciones
content = content.replaceAll(
  'className="mb-4 text-xl font-semibold text-black dark:text-white"',
  'className="mb-4 text-sm font-bold uppercase tracking-wider text-black/70 dark:text-white/70 border-b border-black/5 dark:border-white/5 pb-2"'
);

// 7. Botón de Actualizar Activo
content = content.replaceAll(
  'className="rounded-sm bg-primary px-9 py-4 text-base font-medium text-white shadow-submit duration-300 hover:bg-primary/90 dark:shadow-submit-dark"',
  'className="rounded-xl bg-primary hover:bg-primary/90 px-5 py-2.5 text-xs font-bold text-white transition-all shadow-md shadow-primary/10"'
);

// 8. Botón Cancelar
content = content.replaceAll(
  'className="rounded-sm bg-gray-300 px-9 py-4 text-base font-medium text-dark shadow-submit duration-300 hover:bg-gray-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"',
  'className="rounded-xl border border-stroke dark:border-gray-800 px-5 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"'
);

// 9. Contenedor principal de la página (si está viejo)
content = content.replaceAll(
  'className="shadow-three dark:bg-gray-dark rounded-sm bg-white p-8 sm:p-12"',
  'className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md p-6 sm:p-8 shadow-sm mb-6"'
);

// 10. Labels
content = content.replaceAll(
  'className="mb-3 block text-sm font-medium text-dark dark:text-white"',
  'className="mb-1.5 block text-xs font-bold text-dark dark:text-white"'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Edit page styles successfully updated!');
