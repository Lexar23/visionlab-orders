
export enum OrderStatus {
  PENDING = 'PENDIENTE',
  PRODUCTION = 'PRODUCCION',
  TINTING = 'TENIDO',
  QUALITY = 'CALIDAD',
  BILLING = 'FACTURACION',
  REWORKS = 'RETRABAJOS',
  DELIVERED = 'ENTREGADO'
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Pendiente',
  [OrderStatus.PRODUCTION]: 'Producción',
  [OrderStatus.TINTING]: 'Teñido',
  [OrderStatus.QUALITY]: 'Calidad',
  [OrderStatus.BILLING]: 'Facturación',
  [OrderStatus.REWORKS]: 'Retrabajos',
  [OrderStatus.DELIVERED]: 'Entregado'
};

export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PRODUCTION],
  [OrderStatus.PRODUCTION]: [OrderStatus.TINTING, OrderStatus.QUALITY],
  [OrderStatus.TINTING]: [OrderStatus.QUALITY, OrderStatus.REWORKS],
  [OrderStatus.QUALITY]: [OrderStatus.BILLING, OrderStatus.REWORKS],
  [OrderStatus.REWORKS]: [OrderStatus.PRODUCTION],
  [OrderStatus.BILLING]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: []
};

export const STATUS_ORDER = [
  OrderStatus.PENDING,
  OrderStatus.PRODUCTION,
  OrderStatus.TINTING,
  OrderStatus.QUALITY,
  OrderStatus.BILLING,
  OrderStatus.REWORKS,
  OrderStatus.DELIVERED
];

export const NAV_LINKS = [
  { label: 'Inicio', path: '/' },
  { label: 'Ingreso', path: '/ingreso' },
  { label: 'Pendiente', path: '/status/pendiente' },
  { label: 'Producción', path: '/status/produccion' },
  { label: 'Teñido', path: '/status/tenido' },
  { label: 'Calidad', path: '/status/calidad' },
  { label: 'Facturación', path: '/status/facturacion' },
  { label: 'Retrabajos', path: '/status/retrabajos' },
  { label: 'Entregado', path: '/status/entregado' },
  { label: 'Ajustes', path: '/settings' },
];
