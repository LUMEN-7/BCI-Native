import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { apiRequest } from './api';

const FORMATS = {
  csv: ['text/csv', 'public.comma-separated-values-text'],
  xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'org.openxmlformats.spreadsheetml.sheet'],
  json: ['application/json', 'public.json'], xml: ['application/xml', 'public.xml'],
  zip: ['application/zip', 'public.zip-archive'],
};
export function exportMetadata(headers, requestedFormat) {
  const type = headers.get('content-type') || FORMATS[requestedFormat][0];
  const extension = /zip/i.test(type) ? 'zip' : /spreadsheetml/i.test(type) ? 'xlsx' : /csv/i.test(type) ? 'csv' : /json/i.test(type) ? 'json' : /xml/i.test(type) ? 'xml' : requestedFormat;
  const disposition = headers.get('content-disposition') || '';
  let filename = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1] || disposition.match(/filename="?([^";]+)"?/i)?.[1] || `veiculo.${extension}`;
  try { filename = decodeURIComponent(filename); } catch { /* Retain a malformed server filename safely. */ }
  filename = filename.split(/[\\/]/).pop().replace(/[^\p{L}\p{N}._ -]/gu, '_').replace(/^\.+/, '').slice(0, 120) || `veiculo.${extension}`;
  return { filename, mimeType: FORMATS[extension][0], UTI: FORMATS[extension][1] };
}
export async function exportCar(lineageId, format = 'csv', separator = ',') {
  if (!['csv', 'xlsx', 'json', 'xml'].includes(format)) throw new Error('Formato de exportação inválido.');
  const id = Number(lineageId);
  if (!Number.isSafeInteger(id) || id < 1) throw new Error('Identificador do veículo inválido.');
  if (format === 'csv' && ![',', ';'].includes(separator)) throw new Error('Separador CSV inválido.');
  if (!await Sharing.isAvailableAsync()) throw new Error('O compartilhamento de arquivos não está disponível neste dispositivo.');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  let file;
  let shared = false;
  try {
    const response = await apiRequest('/Exportacao', {
      method: 'POST', signal: controller.signal,
      body: JSON.stringify({ itens: [{ linhagemId: id }], formato: format, ...(format === 'csv' ? { separador: separator } : {}) }),
    });
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (!bytes.length) throw new Error('O servidor retornou um arquivo vazio.');
    const { filename, ...options } = exportMetadata(response.headers, format);
    file = new File(Paths.cache, `bci-${Date.now()}-${filename}`);
    file.create(); file.write(bytes);
    clearTimeout(timeout);
    await Sharing.shareAsync(file.uri, { ...options, dialogTitle: 'Salvar ou compartilhar dados do veículo' });
    // Android may resolve when the chooser closes, before the receiving app reads the URI.
    // Keep successful exports in the OS-managed cache instead of invalidating that URI.
    shared = true;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('A exportação demorou muito. Tente novamente.');
    throw error;
  } finally {
    clearTimeout(timeout);
    if (!shared && file?.exists) { try { file.delete(); } catch { /* The OS also clears its cache. */ } }
  }
}
