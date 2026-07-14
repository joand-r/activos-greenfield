import { NextRequest, NextResponse } from 'next/server';

export interface CompatRequest {
  method: string;
  url: string;
  query: Record<string, string>;
  params: Record<string, string>;
  headers: Record<string, string>;
  body: any;
  user?: any;
  userId?: any;
  ip?: string;
}

export interface CompatResponse {
  statusCode: number;
  data: any;
  isSent: boolean;
  status: (code: number) => CompatResponse;
  json: (data: any) => CompatResponse;
  send: (data: any) => CompatResponse;
}

export type ExpressMiddleware = (req: CompatRequest, res: CompatResponse, next: (err?: any) => void) => void | Promise<void>;
export type ExpressController = (req: CompatRequest, res: CompatResponse) => void | Promise<void>;

export interface RouteHandlerOptions {
  middlewares?: ExpressMiddleware[];
}

export function makeRouteHandler(
  controllerFn: ExpressController,
  options: RouteHandlerOptions = {}
) {
  return async (request: NextRequest, context: { params?: any } = {}) => {
    // 1. Extraer los parámetros de ruta dinámicos (Next.js)
    const rawParams = context.params ? await context.params : {};
    const params: Record<string, string> = {};
    if (rawParams) {
      Object.entries(rawParams).forEach(([key, value]) => {
        params[key] = String(value);
      });
    }

    // 2. Extraer parámetros de consulta (query params)
    const query: Record<string, string> = {};
    request.nextUrl.searchParams.forEach((value, key) => {
      query[key] = value;
    });

    // 3. Extraer cabeceras (headers)
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // 4. Leer el body si corresponde
    let body: any = {};
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      try {
        const text = await request.text();
        if (text) {
          body = JSON.parse(text);
        }
      } catch (err) {
        body = {};
      }
    }

    // 5. Extraer la dirección IP de origen
    const ip = request.ip || 
               request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1';

    // 6. Crear el request simulado compatible con Express
    const req: CompatRequest = {
      method: request.method,
      url: request.nextUrl.pathname,
      query,
      params,
      headers,
      body,
      ip,
    };

    // 6. Crear el response simulado compatible con Express
    let statusCode = 200;
    let responseData: any = null;
    let isSent = false;

    const res: CompatResponse = {
      statusCode,
      data: null,
      isSent,
      status(code: number) {
        statusCode = code;
        this.statusCode = code;
        return this;
      },
      json(data: any) {
        responseData = data;
        this.data = data;
        isSent = true;
        this.isSent = true;
        return this;
      },
      send(data: any) {
        responseData = data;
        this.data = data;
        isSent = true;
        this.isSent = true;
        return this;
      },
    };

    // 7. Ejecutar middleware chain
    const middlewares = options.middlewares || [];
    
    try {
      for (const middleware of middlewares) {
        if (isSent) break;
        
        await new Promise<void>((resolve, reject) => {
          try {
            const next = (err?: any) => {
              if (err) reject(err);
              else resolve();
            };
            
            const result = middleware(req, res, next);
            if (result instanceof Promise) {
              result.catch(reject);
            }
          } catch (err) {
            reject(err);
          }
        });
      }

      // Si ningún middleware envió respuesta, ejecutar el controlador
      if (!isSent) {
        const result = controllerFn(req, res);
        if (result instanceof Promise) {
          await result;
        }
      }

      // 8. Retornar la respuesta en formato Next.js
      if (isSent) {
        return NextResponse.json(responseData, { status: statusCode });
      } else {
        return NextResponse.json({ success: true }, { status: statusCode });
      }
    } catch (err: any) {
      console.error('❌ Error en Route Handler compatible con Express:', err);
      return NextResponse.json(
        { error: err.message || 'Algo salió mal en el servidor' },
        { status: 500 }
      );
    }
  };
}
