import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

console.log('🔍 Probando configuración de Cloudinary...\n');

// Verificar variables de entorno
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Configurado' : '❌ No encontrado');
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '✅ Configurado' : '❌ No encontrado');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ Configurado' : '❌ No encontrado');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Probar conexión
try {
  const result = await cloudinary.api.ping();
  console.log('\n✅ Conexión exitosa a Cloudinary!');
  console.log('Estado:', result.status);
} catch (error) {
  console.error('\n❌ Error al conectar con Cloudinary:', error.message);
}

console.log('\n📋 Configuración actual:');
console.log('Cloud Name:', cloudinary.config().cloud_name);
console.log('API Key:', cloudinary.config().api_key);
console.log('Secure:', cloudinary.config().secure);
