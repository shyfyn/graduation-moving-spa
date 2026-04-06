import QRCode from 'qrcode'

export const createQrDataUrl = async (value: string) => QRCode.toDataURL(value, { margin: 1, width: 240 })
